import React, { useState, useEffect } from 'react';
import styles from './Contact.module.css';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Remove scrollbar on Contact page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const validateName = (val) => {
    if (!val) return 'Name is required';
    if (val.trim().length < 3) return 'Name must be at least 3 characters';
    
    // Check for repeating characters (e.g. "aaa", "bbbbb")
    const cleanVal = val.replace(/\s+/g, '').toLowerCase();
    if (cleanVal.length > 0 && /^(.)\1+$/.test(cleanVal)) {
      return 'Name cannot contain only repeating characters';
    }

    // Check for repeating words (e.g. "John John", "test test")
    const words = val.trim().toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (uniqueWords.size !== words.length) {
      return 'Name cannot contain repeated words';
    }

    return '';
  };

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name') {
      setErrors(prev => ({ ...prev, name: validateName(value) }));
    } else if (name === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    
    if (nameErr || emailErr) {
      setErrors({ name: nameErr, email: emailErr });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setFormSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
        setTimeout(() => setFormSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['contact-page-container']}>
      <div className={styles['contact-page-header']}>
        <h1 className={styles['hero-title']} style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Contact us Page</h1>
      </div>

      <div className={styles['contact-page-grid']}>
        {/* Contact Info Panel */}
        <div className={`glass-panel ${styles['contact-info-panel']}`}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Contact Details</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
              We are available 24/7 to support logistics, order verification, and dealer onboarding questions.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <Phone size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Call Us</div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>+91 9677572150</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(20, 184, 166, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                <Mail size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Us</div>
                <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>tenaquarium@gmail.com</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>
                <MapPin size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Office Location</div>
                <div style={{ fontWeight: '600', fontSize: '0.82rem', lineHeight: '1.4' }}>183/81, 2nd North Street, Puthumariamman Kovil Bus Stop, Salem - 636003</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Panel */}
        <form onSubmit={handleSubmit} className={`glass-panel ${styles['contact-form-panel']}`}>
          {formSubmitted && (
            <div className="alert alert-success">
              Your message has been sent successfully. We will respond within 24 hours.
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-danger">
              {errorMessage}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              readOnly={!!user}
              className="form-control"
              placeholder="e.g. John Doe"
            />
            {errors.name && <span style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              readOnly={!!user}
              className="form-control"
              placeholder="e.g. john@example.com"
            />
            {errors.email && <span style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="form-control"
              placeholder="How can we help you?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="message"
              required
              rows={2}
              value={formData.message}
              onChange={handleChange}
              className="form-control"
              placeholder="Describe your request in detail..."
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <Send size={16} />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
