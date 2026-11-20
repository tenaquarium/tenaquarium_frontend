import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api, { API_URL } from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Helper to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [pushPermission, setPushPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [isSubscribedPush, setIsSubscribedPush] = useState(false);

  const socketRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Subtle clean notification chime (Web Audio)
  const playChime = useCallback((isUrgent = false) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isUrgent ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 587.33 : 523.25, now); // D5 or C5
      osc.frequency.exponentialRampToValueAtTime(isUrgent ? 880 : 659.25, now + 0.15); // A5 or E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isUrgent ? 0.35 : 0.25));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + (isUrgent ? 0.35 : 0.25));
    } catch {
      // Audio not permitted or suspended
    }
  }, []);

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=30');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchNotifications();
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchNotifications]);

  // Subscribe to Web Push via Service Worker
  const subscribeToPush = useCallback(async () => {
    if (!token || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const vapidRes = await api.get('/notifications/vapid-public-key');
        const publicKey = vapidRes.data?.publicKey;
        if (!publicKey) return false;

        const convertedKey = urlBase64ToUint8Array(publicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      }

      if (sub) {
        await api.post('/notifications/subscribe', {
          subscription: sub.toJSON(),
        });
        setIsSubscribedPush(true);
        return true;
      }
    } catch (err) {
      console.warn('Web push subscription failed:', err.message);
    }
    return false;
  }, [token]);

  // Request notification permission and subscribe
  const requestPushPermission = useCallback(async () => {
    return await subscribeToPush();
  }, [subscribeToPush]);

  // Auto-subscribe if permission was previously granted
  useEffect(() => {
    if (token && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToPush().catch(() => {});
    }
  }, [token, subscribeToPush]);

  // Display Toast Banner
  const showToast = useCallback((notif) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(notif);
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(null);
  }, []);

  // Display native desktop notification
  const triggerDesktopNotification = useCallback((notif) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const title = notif.title || 'TEN Aquarium';
      const options = {
        body: notif.message,
        icon: '/logo.png',
        badge: '/favicon.png',
        tag: notif._id ? `notif-${notif._id}` : `toast-${Date.now()}`,
        renotify: true,
        data: notif.data || {},
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, options).catch(() => new Notification(title, options));
        }).catch(() => new Notification(title, options));
      } else {
        const n = new Notification(title, options);
        n.onclick = () => {
          window.focus();
          if (notif.data?.url) {
            window.location.hash = notif.data.url.startsWith('#') ? notif.data.url : `#${notif.data.url}`;
          }
        };
      }
    } catch {
      // Fallback
    }
  }, []);

  // Real-Time Socket.IO connection
  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Determine socket backend URL (safely works on mobile native and web)
    const backendUrl =
      import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
      (API_URL ? API_URL.replace(/\/api\/?$/, '') : window.location.origin);

    const socket = io(backendUrl, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected to TEN Aquarium realtime notification service');
    });

    // Handle incoming real-time notifications
    socket.on('notification', (newNotif) => {
      console.log('🔔 Realtime notification received:', newNotif);

      // Avoid duplicate notifications in local state
      setNotifications((prev) => {
        if (prev.some((n) => n._id === newNotif._id)) return prev;
        return [newNotif, ...prev];
      });

      setUnreadCount((prev) => prev + 1);

      const isUrgent = newNotif.type === 'PAYMENT';

      // Play audio chime
      playChime(isUrgent);

      // Trigger phone vibration if available
      if (navigator.vibrate) {
        navigator.vibrate(isUrgent ? [250, 100, 250, 100, 400] : [150, 100, 150]);
      }

      // Display floating in-app banner across any page
      showToast(newNotif);

      // Display native desktop notification (Swiggy / Spotify style)
      triggerDesktopNotification(newNotif);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, playChime, showToast, triggerDesktopNotification]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err.message);
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (err) {
      console.error('Error deleting notification:', err.message);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing all notifications:', err.message);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    activeToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications: fetchNotifications,
    pushPermission,
    isSubscribedPush,
    requestPushPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
