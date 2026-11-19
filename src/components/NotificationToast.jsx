import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Tag, Sparkles, CheckCircle2, DollarSign, Package, Bell, X, ArrowRight } from 'lucide-react';

const NotificationToast = () => {
  const { activeToast, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const getIcon = () => {
    switch (activeToast.type) {
      case 'OFFER':
        return <Sparkles size={20} color="#f59e0b" />;
      case 'PAYMENT':
        return <DollarSign size={20} color="#10b981" />;
      case 'ORDER':
        return <Package size={20} color="#0284c7" />;
      default:
        return <Bell size={20} color="#38bdf8" />;
    }
  };

  const handleClick = () => {
    if (activeToast._id) {
      markAsRead(activeToast._id);
    }
    dismissToast();

    if (activeToast.data?.url) {
      const targetUrl = activeToast.data.url.replace(/^#/, '');
      navigate(targetUrl);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100vw - 48px)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.94) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(2, 132, 199, 0.25)',
        color: '#ffffff',
        overflow: 'hidden',
        animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      <div style={{ padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {getIcon()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: activeToast.type === 'OFFER' ? '#f59e0b' : activeToast.type === 'PAYMENT' ? '#10b981' : '#38bdf8',
              }}
            >
              {activeToast.type === 'OFFER' ? 'Special Offer' : activeToast.type === 'PAYMENT' ? 'Payment Alert' : 'TEN Aquarium'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          <h4
            style={{
              margin: '0 0 4px 0',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#f8fafc',
              lineHeight: 1.3,
            }}
          >
            {activeToast.title}
          </h4>

          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {activeToast.message}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#38bdf8',
            }}
          >
            <span>View now</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Animated progress indicator */}
      <div
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, #0284c7, #38bdf8, #10b981)',
          width: '100%',
          animation: 'shrinkProgress 6s linear forwards',
        }}
      />

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes shrinkProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
