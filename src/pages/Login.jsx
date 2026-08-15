import React, { useState } from 'react';
import styles from './Login.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyAdminOtp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requireOtp, setRequireOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => {
    if (!val) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setErrors(prev => ({ ...prev, email: validateEmail(val) }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setErrors(prev => ({ ...prev, password: validatePassword(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (requireOtp) {
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP code.');
        return;
      }
      setLoading(true);
      try {
        await verifyAdminOtp(email, password, otp);
        navigate('/admin/dashboard');
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr || passwordErr) {
      setErrors({
        email: emailErr,
        password: passwordErr
      });
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);
      
      if (response && response.requireOtp) {
        setRequireOtp(true);
        setError('');
        return;
      }

      // Redirect based on role
      if (response.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.role === 'dealer') {
        navigate('/dealer/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
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
          <h2 className={styles['auth-title']}>Welcome Back</h2>
          <p className={styles['auth-subtitle']}>Login to manage your orders or shop tanks and fish</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {!requireOtp ? (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="form-control"
                  placeholder="e.g. customer@example.com"
                />
                {errors.email && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: '0' }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500' }}>
                    Forgot Password?
                  </Link>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="form-control"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="••••••••"
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
            </>
          ) : (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div className="alert alert-success" style={{ marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                🔑 A 6-digit OTP code has been sent to your registered admin email. Please check your inbox and enter it below.
              </div>
              <label className="form-label">Enter 6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                pattern="\d{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="form-control"
                placeholder="e.g. 123456"
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '8px', fontWeight: 'bold', height: '50px' }}
              />
              <button 
                type="button"
                onClick={() => {
                  setRequireOtp(false);
                  setOtp('');
                  setError('');
                }}
                style={{ display: 'block', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.8rem', textDecoration: 'underline', padding: 0 }}
              >
                Go Back to Credentials
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '46px', fontSize: '0.95rem' }}>
            <LogIn size={16} />
            {loading ? (requireOtp ? 'Verifying OTP...' : 'Logging in...') : (requireOtp ? 'Verify & Login' : 'Login')}
          </button>
        </form>

        <div className={styles['auth-footer-link']}>
          Don't have an account? <Link to="/register" className={styles['auth-link-highlight']}>Register Here</Link>
        </div>
        <div className={styles['auth-footer-link']} style={{ marginTop: '0.5rem' }}>
          Want to sell products? <Link to="/dealer/register" className={styles['auth-link-highlight']} style={{ color: 'var(--secondary)' }}>Register as a Dealer</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
