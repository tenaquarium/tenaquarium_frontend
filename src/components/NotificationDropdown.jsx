import React, { useEffect, useState, useRef } from 'react';
import styles from './NotificationDropdown.module.css';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckSquare, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const NotificationDropdown = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ring, setRing] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.isRead).length;
      
      // Ring the bell if unread count increases
      if (unread > unreadCount) {
        setRing(true);
        setTimeout(() => setRing(false), 800);

        // Dispatch simulated phone SMS for the latest unread notification
        const newUnreads = res.data.filter((n) => !n.isRead);
        if (newUnreads.length > 0 && unreadCount > 0) {
          const newest = newUnreads[0];
          window.dispatchEvent(new CustomEvent('sms-notification', {
            detail: { message: newest.message }
          }));
        }
      }
      
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Check notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token, unreadCount]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.put(`/notifications/${id}`);
      fetchNotifications();
      setShowDropdown(false);
      if (link) {
        navigate(link);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  if (!token) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`${styles['notification-bell-btn']} ${ring ? styles['ring'] : ''}`}
        title="Notifications"
      >
        <Bell className={styles['bell-icon']} size={22} />
        {unreadCount > 0 && <span className={styles['cart-badge']}>{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className={`glass-panel ${styles['notification-dropdown']}`}>
          <div className={styles['notification-header']}>
            <span style={{ fontWeight: '700' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: '600' }}
              >
                <CheckSquare size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You have no notifications at this time.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif._id, notif.link)}
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <MessageSquare size={16} style={{ color: 'var(--primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        {notif.message}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteNotification(e, notif._id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', height: 'fit-content' }}
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem', textAlign: 'right' }}>
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
