import React, { useState } from 'react';
import styles from './Register.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpPreviewUrl, setOtpPreviewUrl] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyActiveTab, setPolicyActiveTab] = useState('fishcare');

  // Real-time email existence check & format validation
  React.useEffect(() => {
    if (!email) {
      setErrors(prev => {
        const nextErrors = { ...prev };
        delete nextErrors.email;
        return nextErrors;
      });
      return;
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors(prev => ({ ...prev, email: emailErr }));
      return;
    }

    // If format is valid, clear any format error and trigger debounce check
    setErrors(prev => {
      const nextErrors = { ...prev };
      if (nextErrors.email && nextErrors.email !== 'Email address is already registered') {
        delete nextErrors.email;
      }
      return nextErrors;
    });

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.post('/auth/check-email', { email });
        if (res.data.exists) {
          setErrors(prev => ({ ...prev, email: 'Email address is already registered' }));
        } else {
          setErrors(prev => {
            const nextErrors = { ...prev };
            delete nextErrors.email;
            return nextErrors;
          });
        }
      } catch (err) {
        console.error('Error checking email existence:', err);
        // Allow the user to proceed if the check service fails
        setErrors(prev => {
          const nextErrors = { ...prev };
          delete nextErrors.email;
          return nextErrors;
        });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [email]);

  // Lock body scroll when unboxing policy modal is active
  React.useEffect(() => {
    if (showPolicyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPolicyModal]);

  const validateName = (val) => {
    if (!val) return 'Full Name is required';
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
    if (!val) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (val) => {
    if (!val) return 'Phone number is required';
    const hasNonDigits = /[^\d]/.test(val);
    if (hasNonDigits) return 'Phone number must contain only digits';
    if (val.length !== 10) return 'Phone number must be exactly 10 digits';
    const startsWithValid = /^[6-9]/.test(val);
    if (!startsWithValid) return 'Phone number must start with 6, 7, 8, or 9';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    
    const hasUppercase = /[A-Z]/.test(val);
    const hasLowercase = /[a-z]/.test(val);
    const hasNumber = /\d/.test(val);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return '';
  };

  const handleSendOtp = async () => {
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors(prev => ({ ...prev, email: emailErr }));
      return;
    }

    setSendingOtp(true);
    setOtpError('');
    try {
      const res = await api.post('/auth/send-otp', { email });
      if (res.data && res.data.otp) {
        setOtpCode(res.data.otp);
        setOtpSent(true);
        alert(`OTP has been sent successfully to your email address: ${email}`);
        if (res.data.previewUrl) {
          setOtpPreviewUrl(res.data.previewUrl);
        }
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = () => {
    if (userOtpInput === otpCode) {
      setEmailVerified(true);
      setOtpError('');
      alert('Email verified successfully!');
    } else {
      setOtpError('Invalid OTP. Please check the code and try again.');
    }
  };

  const validateConfirmPassword = (val, pass) => {
    if (!val) return 'Please confirm your password';
    if (val !== pass) return 'Passwords do not match';
    return '';
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setErrors(prev => ({ ...prev, name: validateName(val) }));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    setErrors(prev => ({ ...prev, phone: validatePhone(val) }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setErrors(prev => ({ ...prev, password: validatePassword(val) }));
    if (confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, val) }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(val, password) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    if (nameErr || emailErr || phoneErr || passwordErr || confirmErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        phone: phoneErr,
        password: passwordErr,
        confirmPassword: confirmErr
      });
      return;
    }

    if (!emailVerified) {
      setError('Please verify your email address with OTP first.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-container']}>
      <div className={`glass-panel ${styles['auth-card']}`}>
        <div className={styles['auth-header']}>
          <h2 className={styles['auth-title']}>Create Account</h2>
          <p className={styles['auth-subtitle']}>Register to buy aquarium fishes, tanks, plants and filters</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              className="form-control"
              placeholder="e.g. John Doe"
            />
            {errors.name && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                disabled={emailVerified}
                className="form-control"
                placeholder="e.g. john@example.com"
                style={{ flexGrow: 1 }}
              />
              <button
                type="button"
                disabled={sendingOtp || !email || emailVerified || !!errors.email}
                onClick={handleSendOtp}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flexShrink: 0 }}
              >
                {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
              </button>
            </div>
            {errors.email && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
          </div>

          {otpSent && !emailVerified && (
            <div className="form-group" style={{ background: 'rgba(2, 132, 199, 0.05)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
              <label className="form-label" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                Enter 6-Digit Email OTP
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={userOtpInput}
                  onChange={(e) => setUserOtpInput(e.target.value)}
                  className="form-control"
                  style={{ letterSpacing: '2px', textAlign: 'center', fontWeight: '700', fontSize: '1.1rem' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flexShrink: 0 }}
                >
                  Verify OTP
                </button>
              </div>
              {otpError && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{otpError}</span>}
              {otpPreviewUrl && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  <a href={otpPreviewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline', fontWeight: '600' }}>
                    View Ethereal Email Preview
                  </a>
                </div>
              )}
            </div>
          )}

          {emailVerified && (
            <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              ✓ Email Verified Successfully
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={handlePhoneChange}
              className="form-control"
              placeholder="e.g. 9876543210"
            />
            {errors.phone && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handlePasswordChange}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                className="form-control"
                style={{ paddingRight: '2.5rem' }}
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                className="form-control"
                style={{ paddingRight: '2.5rem' }}
                placeholder="Repeat your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.confirmPassword}</span>}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="form-group" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <input
              type="checkbox"
              id="customer-agree-checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="customer-agree-checkbox" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
              I have read, understood, and agree to the{' '}
              <span 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPolicyModal(true); }} 
                style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer' }}
              >
                TEN Aquarium Terms & Conditions, Cancellation & Refund Policy, Live Fish Care Instructions, Unboxing Policy, and Replacement Policy
              </span>
              . I understand that my order will be processed only after accepting these terms.
            </label>
          </div>

          <button type="submit" disabled={loading || !agreedToTerms} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <UserPlus size={16} />
            {loading ? 'Creating Account...' : 'I Agree & Continue'}
          </button>
        </form>

        <div className={styles['auth-footer-link']}>
          Already have an account? <Link to="/login" className={styles['auth-link-highlight']}>Login Here</Link>
        </div>
      </div>
      {/* Unboxing & Cancellation Policy Modal */}
      {showPolicyModal && (
        <div style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '650px', width: '90%', padding: '2rem', borderRadius: '24px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', maxHeight: '85vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowPolicyModal(false)}
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>

            {/* Premium Tab Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.2rem', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPolicyActiveTab('fishcare')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: 'none', background: 'none', borderBottom: policyActiveTab === 'fishcare' ? '2.5px solid var(--primary)' : 'none', color: policyActiveTab === 'fishcare' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Live Fish Care & Unboxing
              </button>
              <button
                type="button"
                onClick={() => setPolicyActiveTab('cancellation')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: 'none', background: 'none', borderBottom: policyActiveTab === 'cancellation' ? '2.5px solid var(--primary)' : 'none', color: policyActiveTab === 'cancellation' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancellation & Refund Policy
              </button>
            </div>

            <div style={{ textAlign: 'left', color: 'var(--text-primary)' }}>
              {policyActiveTab === 'fishcare' && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1rem' }}>
                    TEN Aquarium – Live Fish Care, Unboxing & Customer Responsibility Policy
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                    By placing an order with TEN Aquarium, the customer agrees to follow the instructions below to ensure the safe arrival and proper care of live fish.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>1. Opening the Package</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    After receiving your shipment:
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '5px' }}>
                      <li>Carefully inspect the package for any visible damage before opening.</li>
                      <li>Record a continuous unboxing video from the moment the sealed package is opened until all fish are clearly visible.</li>
                      <li>Do not pause, edit, or cut the video during the entire unboxing process.</li>
                      <li>Gently remove the fish bags from the package without causing unnecessary stress.</li>
                    </ul>
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>2. Basic Fish Care Instructions</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    To help your fish adjust safely to their new environment:
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '5px' }}>
                      <li>Float the sealed fish bag in your aquarium for 15–20 minutes to equalize the water temperature.</li>
                      <li>Slowly acclimate the fish by gradually adding small amounts of aquarium water into the bag before release.</li>
                      <li>Do not feed the fish for the first 12–24 hours after introducing them into the aquarium.</li>
                      <li>Ensure proper aeration, filtration, and a calm, stress-free environment.</li>
                    </ul>
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>3. Customer Responsibilities</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    The customer confirms that:
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '5px' }}>
                      <li>The aquarium is fully cycled and ready for live fish.</li>
                      <li>Dechlorinated water is used before introducing the fish.</li>
                      <li>Water parameters are suitable for the purchased species.</li>
                    </ul>
                    Once the fish are removed from the transport bag or released into the aquarium, all responsibility for their health and survival transfers to the customer.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>4. Unboxing & Replacement Policy</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    To request a replacement (where eligible):
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '5px' }}>
                      <li>A continuous unboxing video without any cuts or edits is mandatory.</li>
                      <li>The complete video must clearly show the unopened package, opening process, fish condition, and packaging materials.</li>
                      <li>Claims submitted without a valid unboxing video will not be considered.</li>
                    </ul>
                  </p>
                </div>
              )}

              {policyActiveTab === 'cancellation' && (
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1rem' }}>
                    TEN Aquarium – Customer Cancellation & Refund Policy
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                    At TEN Aquarium, we strive to process and deliver every order quickly while ensuring the health and safety of our products. Please read the following cancellation and refund policy carefully before placing an order.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>1. Cancellation Within 3 Hours of Order Placement</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Customers may cancel their order within <strong>3 hours</strong> from the time the order is successfully placed, provided the order has not entered the next processing stage.<br />
                    <strong>Refund Eligibility:</strong> <strong>100% of the amount paid</strong> will be refunded to the original payment method.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>2. Cancellation After Dealer Starts Processing</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Once the Dealer has accepted the order and started preparing or processing it, the order may still be cancelled.<br />
                    <strong>Refund Eligibility:</strong> <strong>75% of the total order amount</strong> will be refunded. The remaining <strong>25%</strong> will be retained to cover processing, handling, and operational costs.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>3. Cancellation After Packing is Completed</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Once the Dealer has completed packing the order, uploaded the required packing proof, and marked the order as <strong>Packed</strong>, cancellation requests may still be accepted subject to this policy.<br />
                    <strong>Refund Eligibility:</strong> <strong>50% of the total order amount</strong> will be refunded. The remaining <strong>50%</strong> will be retained to cover product preparation, packing materials, labor, and handling charges.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>4. Cancellation After Shipment is Dispatched</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Once the shipment has been handed over to the courier partner and a tracking number has been generated, the order is considered dispatched.<br />
                    <strong>Refund Eligibility:</strong> <strong>Only 5% of the total order amount</strong> will be refunded. The remaining amount will be retained to cover shipping, courier, packaging, operational, and related costs.
                  </p>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>5. Orders Already Delivered</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    After an order has been successfully delivered, it cannot be cancelled. Any issues after delivery will be handled according to the applicable Return, Refund, or DOA (Dead on Arrival) Policy.
                  </p>
                </div>
              )}

              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.3rem' }}>Customer Acceptance</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                By checking the terms and conditions checkbox, the customer confirms that they have read, understood, and accepted these policies.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={() => { setAgreedToTerms(true); setShowPolicyModal(false); }}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.88rem' }}
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
