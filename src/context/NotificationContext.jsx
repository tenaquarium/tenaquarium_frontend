import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
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
  const knownNotificationIdsRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  // Initialize Android Native Notification Channel & Permissions
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.createChannel({
        id: 'ten_aquarium_alerts',
        name: 'TEN Aquarium Alerts',
        description: 'Instant alerts for orders, payments, offers, and delivery updates',
        importance: 5,
        visibility: 1,
        vibration: true,
      }).catch((err) => console.warn('Failed to create notification channel:', err));

      LocalNotifications.checkPermissions()
        .then((perm) => {
          if (perm.display !== 'granted') {
            LocalNotifications.requestPermissions().then((reqRes) => {
              setPushPermission(reqRes.display === 'granted' ? 'granted' : 'denied');
            });
          } else {
            setPushPermission('granted');
          }
        })
        .catch(() => {});

      const listenerPromise = LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (action) => {
          const url = action?.notification?.extra?.url;
          if (url) {
            window.location.hash = url.startsWith('#') ? url : `#${url}`;
          }
        }
      );

      return () => {
        listenerPromise.then((handle) => handle.remove?.()).catch(() => {});
      };
    }
  }, []);

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
      osc.frequency.setValueAtTime(isUrgent ? 587.33 : 523.25, now);
      osc.frequency.exponentialRampToValueAtTime(isUrgent ? 880 : 659.25, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isUrgent ? 0.35 : 0.25));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + (isUrgent ? 0.35 : 0.25));
    } catch {
      // Audio not permitted or suspended
    }
  }, []);

  // Display Toast Banner inside the App
  const showToast = useCallback((notif) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(notif);
    toastTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveToast(null);
  }, []);

  // Trigger Phone Native Notification / Desktop Browser Notification
  const triggerNativeNotification = useCallback((notif) => {
    const title = notif.title || 'TEN Aquarium';
    const message = notif.message || '';

    // 1. Android Native App (Capacitor APK) -> Native Phone Status Bar Notification
    if (Capacitor.isNativePlatform()) {
      try {
        const notifId = Math.floor(Math.random() * 899999) + 100000;
        LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title: title,
              body: message,
              channelId: 'ten_aquarium_alerts',
              schedule: { at: new Date(Date.now() + 50) },
              extra: notif.data || {},
            },
          ],
        }).catch((err) => console.warn('Native LocalNotifications schedule error:', err));
      } catch (err) {
        console.warn('Native LocalNotifications execution error:', err);
      }
      return;
    }

    // 2. Web Browser (Desktop / Mobile Chrome / Edge)
    if (typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: message,
        icon: '/logo.png',
        badge: '/favicon.png',
        tag: notif._id ? `notif-${notif._id}` : `toast-${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        data: notif.data || {},
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready
          .then((reg) => reg.showNotification(title, options))
          .catch(() => {
            try {
              new Notification(title, options);
            } catch {}
          });
      } else {
        try {
          const n = new Notification(title, options);
          n.onclick = () => {
            window.focus();
            if (notif.data?.url) {
              window.location.hash = notif.data.url.startsWith('#')
                ? notif.data.url
                : `#${notif.data.url}`;
            }
          };
        } catch {}
      }
    }
  }, []);

  // Unified Handler when any new notification arrives
  const handleIncomingNotification = useCallback((notif) => {
    if (!notif) return;

    // Check duplicate
    if (notif._id && knownNotificationIdsRef.current.has(notif._id)) {
      return;
    }
    if (notif._id) {
      knownNotificationIdsRef.current.add(notif._id);
    }

    // Add to state
    setNotifications((prev) => {
      if (notif._id && prev.some((n) => n._id === notif._id)) return prev;
      return [notif, ...prev];
    });

    setUnreadCount((prev) => prev + 1);

    const isUrgent = notif.type === 'PAYMENT';

    // 1. Play sound
    playChime(isUrgent);

    // 2. Vibrate phone
    if (navigator.vibrate) {
      navigator.vibrate(isUrgent ? [250, 100, 250, 100, 400] : [150, 100, 150]);
    }

    // 3. Native phone top status bar notification
    triggerNativeNotification(notif);

    // 4. In-app floating slide-in banner
    showToast(notif);
  }, [playChime, triggerNativeNotification, showToast]);

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
        const fetched = res.data.notifications || [];
        const unread = res.data.unreadCount || 0;

        // Check for newly arrived unread notifications during polling
        if (!isInitialLoadRef.current) {
          const newUnreads = fetched.filter(
            (n) => !n.isRead && !knownNotificationIdsRef.current.has(n._id)
          );
          if (newUnreads.length > 0) {
            newUnreads.forEach((item) => handleIncomingNotification(item));
          }
        } else {
          // On initial load, record known IDs to prevent alerting on past notifications
          fetched.forEach((n) => {
            if (n._id) knownNotificationIdsRef.current.add(n._id);
          });
          isInitialLoadRef.current = false;
        }

        setNotifications(fetched);
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user, handleIncomingNotification]);

  useEffect(() => {
    fetchNotifications();
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchNotifications]);

  // Subscribe to Web Push via Service Worker
  const subscribeToPush = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await LocalNotifications.requestPermissions();
        setPushPermission(res.display === 'granted' ? 'granted' : 'denied');
        return res.display === 'granted';
      } catch {
        return false;
      }
    }

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
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.checkPermissions()
        .then((res) => setPushPermission(res.display === 'granted' ? 'granted' : 'default'))
        .catch(() => {});
    } else if (token && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      subscribeToPush().catch(() => {});
    }
  }, [token, subscribeToPush]);

  // Real-Time Socket.IO connection
  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
      (API_URL ? API_URL.replace(/\/api\/?$/, '') : window.location.origin);

    const socketOptions = {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      autoConnect: true,
    };

    if (token) {
      socketOptions.auth = { token };
      socketOptions.query = { token };
    }

    const socket = io(backendUrl, socketOptions);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected to TEN Aquarium realtime notification service');
    });

    // Handle incoming real-time notifications
    socket.on('notification', (newNotif) => {
      console.log('🔔 Realtime notification received:', newNotif);
      handleIncomingNotification(newNotif);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, handleIncomingNotification]);

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
