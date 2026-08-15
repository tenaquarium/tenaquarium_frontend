import React, { useEffect, useState } from 'react';
import styles from './PhoneSimulator.module.css';
import { Smartphone, Shield, Wifi, Battery } from 'lucide-react';
import api from '../utils/api';

const PhoneSimulator = () => {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState([]);

  // Web Audio API Beep Synthesizer
  const playSMSAlert = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // First beep
      let osc1 = ctx.createOscillator();
      let gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      // Second beep slightly offset
      setTimeout(() => {
        let osc2 = ctx.createOscillator();
        let gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 note
        gain2.gain.setValueAtTime(0.2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.2);
      }, 120);
    } catch (e) {
      console.warn('Audio Context Alert failed', e);
    }
  };

  useEffect(() => {
    const handleSMSNotification = (e) => {
      const newMessage = {
        text: e.detail?.message || "TENAQUARIUM: Order status updated!",
        orderId: e.detail?.orderId || null,
        type: e.detail?.type || null
      };
      setMessages((prev) => [...prev, newMessage]);
      setShow(true);
      playSMSAlert();
    };

    window.addEventListener('sms-notification', handleSMSNotification);
    return () => {
      window.removeEventListener('sms-notification', handleSMSNotification);
    };
  }, []);

  const handlePhoneApprove = async (orderId, msgIndex) => {
    try {
      await api.put(`/orders/${orderId}`, { paymentStatus: 'paid', orderStatus: 'Processing' });
      // Update message to show approved
      setMessages(prev => prev.map((m, idx) => idx === msgIndex ? { ...m, text: m.text + " (APPROVED)", type: null } : m));
      alert('Order payment approved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve order payment');
    }
  };

  const handlePhoneReject = async (orderId, msgIndex) => {
    try {
      await api.put(`/orders/${orderId}`, { paymentStatus: 'failed', orderStatus: 'Cancelled' });
      // Update message to show rejected
      setMessages(prev => prev.map((m, idx) => idx === msgIndex ? { ...m, text: m.text + " (REJECTED/CANCELLED)", type: null } : m));
      alert('Order payment rejected and order cancelled.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order payment');
    }
  };

  if (!show) return null;

  return (
    <div className={styles['phone-simulator-container']}>
      <div className={styles['phone-screen']}>
        {/* Top Phone Info bar */}
        <div className={styles['phone-header']}>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <Wifi size={12} />
            <Battery size={14} />
          </div>
        </div>

        {/* Dynamic notch bar */}
        <div style={{ width: '100px', height: '18px', background: '#1e3a8a', borderRadius: '0 0 12px 12px', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}></div>

        <button onClick={() => setShow(false)} className={styles['phone-simulator-close']} title="Minimize Phone">
          ×
        </button>

        <div className={styles['phone-chat-title']}>
          Messages: TENAQUARIUM
        </div>

        {/* SMS bubble viewport */}
        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '1rem' }}>
          {messages.map((msg, index) => (
            <div key={index} className={styles['sms-message-bubble']}>
              <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                SMS Broadcast
              </strong>
              <div>{msg.text}</div>
              {msg.type === 'payment-approval' && msg.orderId && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                  <button
                    onClick={() => handlePhoneApprove(msg.orderId, index)}
                    className="btn btn-primary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flexGrow: 1 }}
                  >
                    YES / Approve
                  </button>
                  <button
                    onClick={() => handlePhoneReject(msg.orderId, index)}
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.2)', flexGrow: 1 }}
                  >
                    NO / Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhoneSimulator;
