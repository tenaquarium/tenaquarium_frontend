import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Package,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  ShieldAlert,
  Volume2
} from 'lucide-react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    pushPermission,
    requestPushPermission,
    unsubscribeFromPush,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  const handleNotificationClick = (notif) => {
    if (!notif.isRead && notif._id) {
      markAsRead(notif._id);
    }
    setIsOpen(false);

    if (notif.data?.url) {
      const targetUrl = notif.data.url.replace(/^#/, '');
      navigate(targetUrl);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'OFFER':
        return <Sparkles size={16} color="#f59e0b" />;
      case 'PAYMENT':
        return <DollarSign size={16} color="#10b981" />;
      case 'ORDER':
        return <Package size={16} color="#0284c7" />;
      default:
        return <Bell size={16} color="#38bdf8" />;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '8px',
          color: 'var(--text-primary, #ffffff)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
              animation: 'pulseBadge 2s infinite',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: '380px',
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: '520px',
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.96) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(2, 132, 199, 0.2)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'rgba(2, 132, 199, 0.2)',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px',
                    borderRadius: '6px',
                  }}
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>Mark read</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px',
                    borderRadius: '6px',
                  }}
                  title="Clear all"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile & Desktop System Push Permission Banner */}
          {pushPermission !== 'granted' ? (
            <div
              style={{
                margin: '10px 12px 4px 12px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(14, 165, 233, 0.08))',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#e0f2fe', lineHeight: 1.3 }}>
                <strong>Enable Mobile Notifications</strong>
                <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Get instant alerts in your phone notification panel</div>
              </div>
              <button
                onClick={requestPushPermission}
                style={{
                  background: '#0284c7',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)',
                }}
              >
                Enable
              </button>
            </div>
          ) : (
            <div
              style={{
                margin: '8px 12px 2px 12px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#6ee7b7',
              }}
            >
              <span>🔔 Mobile Push Active</span>
              <button
                onClick={unsubscribeFromPush}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '2px 4px',
                }}
              >
                Disable
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '6px 12px',
              gap: '6px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <button
              onClick={() => setFilter('all')}
              style={{
                flex: 1,
                padding: '6px 0',
                background: filter === 'all' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: filter === 'all' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: filter === 'all' ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                flex: 1,
                padding: '6px 0',
                background: filter === 'unread' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: filter === 'unread' ? '#ffffff' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: filter === 'unread' ? '700' : '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              maxHeight: '360px',
              padding: '6px 0',
            }}
          >
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Loading updates...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '35px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
                <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '600', color: '#cbd5e1' }}>
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {filter === 'unread' ? "You're all caught up!" : 'You will be notified about offers and payments.'}
                </span>
              </div>
            ) : (
              filtered.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    background: notif.isRead ? 'transparent' : 'rgba(2, 132, 199, 0.08)',
                    borderLeft: notif.isRead ? '3px solid transparent' : '3px solid #0284c7',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(2, 132, 199, 0.08)')
                  }
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {getIcon(notif.type)}
                  </div>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: notif.isRead ? '600' : '700',
                          color: notif.isRead ? '#cbd5e1' : '#f8fafc',
                          lineHeight: 1.3,
                        }}
                      >
                        {notif.title}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '6px' }}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '0.78rem',
                        color: notif.isRead ? '#94a3b8' : '#e2e8f0',
                        lineHeight: 1.35,
                      }}
                    >
                      {notif.message}
                    </p>

                    {/* Metadata tags */}
                    {notif.data?.amount && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.12)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          marginRight: '6px',
                        }}
                      >
                        ₹{Number(notif.data.amount).toLocaleString()}
                      </span>
                    )}

                    {notif.data?.status && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.12)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {notif.data.status}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif._id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)')}
                    title="Delete"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseBadge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
