import React, { useState } from 'react';
import styles from './ForgotPassword.module.css';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, HelpCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetLink('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      
      // For local testing convenience, show the reset link directly
      if (res.data.resetToken) {
        const url = `${window.location.origin}/reset-password?token=${res.data.resetToken}`;
        setResetLink(url);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Verify your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-container']}>
      <div className={`glass-panel ${styles['auth-card']}`}>
        <div className={styles['auth-header']}>
          <h2 className={styles['auth-title']}>Forgot Password</h2>
          <p className={styles['auth-subtitle']}>Enter your email to receive a password recovery link</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {resetLink && (
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', borderColor: 'var(--primary)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              [SIMULATION MODE] Password Reset Link:
            </span>
            <Link to={resetLink} style={{ color: 'var(--primary)', wordBreak: 'break-all', fontSize: '0.9rem', textDecoration: 'underline' }}>
              {resetLink}
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="e.g. user@example.com"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <HelpCircle size={16} />
            {loading ? 'Sending link...' : 'Request Reset Link'}
          </button>
        </form>

        <div className={styles['auth-footer-link']}>
          Back to <Link to="/login" className={styles['auth-link-highlight']}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
