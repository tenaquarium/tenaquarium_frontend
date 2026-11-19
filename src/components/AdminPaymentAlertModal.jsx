import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BellRing, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const AdminPaymentAlertModal = () => {
  const { user } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // Web Audio Synthesizer: Loud 2-tone alert chime
  const playAlertChime = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);

      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
          gain2.gain.setValueAtTime(0.4, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.4);
        } catch { /* ignore */ }
      }, 160);
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  };

  // Request browser notification permission once for Admin
  useEffect(() => {
    if (user?.role === 'admin' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [user]);

  // Connect to Admin SSE Stream
  useEffect(() => {
    if (user?.role !== 'admin') return;

    let eventSource = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        const streamUrl = `${api.defaults.baseURL || '/api'}/payments/admin-stream`;
        eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
          if (!event.data) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PAYMENT_CLAIMED') {
              setActiveAlert(data);
              setActionResult(null);
              setProcessing(false);
              playAlertChime();

              // Mobile phone vibration (if supported)
              if (navigator.vibrate) {
                navigator.vibrate([250, 100, 250, 100, 400]);
              }

              // Real-time OS notification for Laptop & Phone
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  const notif = new Notification(`⚡ TEN Aquarium: ₹${Number(data.amount).toLocaleString()} Payment Received!`, {
                    body: `Customer ${data.customerName || 'User'} claims payment for Order #${data.shortId}. Click to verify.`,
                    icon: '/logo.png',
                    badge: '/favicon.png',
                    tag: `payment-${data.orderId}`,
                    requireInteraction: true,
                    vibrate: [250, 100, 250, 100, 400]
                  });
                  notif.onclick = () => {
                    window.focus();
                  };
                } catch (e) {
                  console.warn('Native notification trigger error:', e);
                }
              }
            }
          } catch { /* ignore non-JSON or ping */ }
        };

        eventSource.onerror = () => {
          if (eventSource) eventSource.close();
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.warn('Admin SSE connection error:', err);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [user]);

  const handleApprove = async () => {
    if (!activeAlert || processing) return;
    setProcessing(true);
    try {
      await api.get(`/orders/approve-sms/${activeAlert.orderId}`);
      setActionResult({ status: 'approved', message: '✓ Payment Approved! Order is now Placed & Processing.' });
      setTimeout(() => {
        setActiveAlert(null);
        setActionResult(null);
        setProcessing(false);
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving order payment');
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!activeAlert || processing) return;
    setProcessing(true);
    try {
      await api.get(`/orders/reject-sms/${activeAlert.orderId}`);
      setActionResult({ status: 'rejected', message: '✗ Payment Rejected. Order marked Cancelled.' });
      setTimeout(() => {
        setActiveAlert(null);
        setActionResult(null);
        setProcessing(false);
      }, 1800);
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting order payment');
      setProcessing(false);
    }
  };

  if (!activeAlert) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        maxWidth: '440px',
        width: '100%',
        padding: '28px 24px',
        boxShadow: '0 25px 50px -12px rgba(2, 132, 199, 0.35), 0 0 0 2px #0284c7',
        textAlign: 'center',
        position: 'relative',
        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fee2e2',
          color: '#b91c1c',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '14px'
        }}>
          <BellRing size={16} /> Instant UPI Alert (&lt; 1s)
        </div>

        <h2 style={{ fontSize: '20px', color: '#0f172a', margin: '0 0 14px 0', fontWeight: '800' }}>
          Customer Claims Payment
        </h2>

        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'left',
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Order ID:</span>
            <strong style={{ color: '#0369a1' }}>#{activeAlert.shortId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Customer:</span>
            <strong style={{ color: '#0f172a' }}>{activeAlert.customerName || 'Customer'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
            <span style={{ color: '#64748b' }}>Expected Amount:</span>
            <strong style={{ fontSize: '20px', color: '#059669', fontWeight: '900' }}>
              ₹{Number(activeAlert.amount).toLocaleString()}
            </strong>
          </div>
        </div>

        {activeAlert.paymentProofImage && (
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Customer Screenshot:</span>
            <img
              src={activeAlert.paymentProofImage}
              alt="Payment Proof"
              style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '10px', marginTop: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
        )}

        <div style={{
          background: '#fef9c3',
          border: '1.5px solid #fde047',
          padding: '12px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '700',
          color: '#854d0e',
          marginBottom: '20px'
        }}>
          Did you receive ₹{Number(activeAlert.amount).toLocaleString()} in your SBI / Google Pay account?
        </div>

        {actionResult ? (
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: actionResult.status === 'approved' ? '#dcfce7' : '#fee2e2',
            color: actionResult.status === 'approved' ? '#15803d' : '#b91c1c',
            fontWeight: 'bold',
            fontSize: '15px'
          }}>
            {actionResult.message}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleApprove}
              disabled={processing}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '16px',
                cursor: processing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={20} /> ✓ YES - Payment Received
            </button>

            <button
              onClick={handleReject}
              disabled={processing}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                border: '1.5px solid #f87171',
                background: '#ffffff',
                color: '#ef4444',
                fontWeight: '700',
                fontSize: '14px',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <XCircle size={18} /> ✗ NO - Payment Not Received
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentAlertModal;
