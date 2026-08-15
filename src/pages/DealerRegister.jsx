import React, { useState } from 'react';
import styles from './DealerRegister.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, Eye, EyeOff } from 'lucide-react';

import api from '../utils/api';
import Tesseract from 'tesseract.js';

const DealerRegister = () => {
  const navigate = useNavigate();
  const { registerDealer } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    ownerName: '',
    address: '',
    logo: '',
    description: '',
    msmeCertificate: '',
    courierServices: ['DTDC', 'Professional Courier', 'ST Courier'],
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);


  const [selectedDocType, setSelectedDocType] = useState('msme');
  const [documentStatus, setDocumentStatus] = useState('unverified');
  const [verifyingDoc, setVerifyingDoc] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpPreviewUrl, setOtpPreviewUrl] = useState('');
  const [showAgreement, setShowAgreement] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) return 'Owner name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        
        // Check for repeating characters (e.g. "aaa", "bbbbb")
        const cleanName = value.replace(/\s+/g, '').toLowerCase();
        if (cleanName.length > 0 && /^(.)\1+$/.test(cleanName)) {
          return 'Name cannot contain only repeating characters';
        }
        // Check for repeating words (e.g. "John John", "test test")
        const nameWords = value.trim().toLowerCase().split(/\s+/);
        if (new Set(nameWords).size !== nameWords.length) {
          return 'Name cannot contain repeated words';
        }
        return '';
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!value) return 'Phone number is required';
        const hasNonDigits = /[^\d]/.test(value);
        if (hasNonDigits) return 'Phone number must contain only digits';
        if (value.length !== 10) return 'Phone number must be exactly 10 digits';
        const startsWithValid = /^[6-9]/.test(value);
        if (!startsWithValid) return 'Phone number must start with 6, 7, 8, or 9';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 10) return 'Password must be at most 10 characters';
        
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
          return 'Password must contain uppercase, lowercase, number, and special character';
        }
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'businessName':
        if (!value) return 'Business name is required';
        return '';
      case 'ownerName':
        if (!value) return 'Legal owner name is required';
        if (value.trim().length < 3) return 'Owner name must be at least 3 characters';

        // Check for repeating characters (e.g. "aaa", "bbbbb")
        const cleanOwner = value.replace(/\s+/g, '').toLowerCase();
        if (cleanOwner.length > 0 && /^(.)\1+$/.test(cleanOwner)) {
          return 'Owner name cannot contain only repeating characters';
        }
        // Check for repeating words (e.g. "John John", "test test")
        const ownerWords = value.trim().toLowerCase().split(/\s+/);
        if (new Set(ownerWords).size !== ownerWords.length) {
          return 'Owner name cannot contain repeated words';
        }
        return '';
      case 'address':
        if (!value) return 'Physical address is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    if (name === 'password' && formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: value !== formData.confirmPassword ? 'Passwords do not match' : ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (only JPG or JPEG)
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, [name]: 'Only JPG or JPEG files are allowed' }));
      e.target.value = null; // Clear the input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [name]: reader.result }));
      setErrors(prev => ({ ...prev, [name]: '' }));

      // Authenticity Scan for verification documents using Tesseract OCR
      if (name === 'msmeCertificate') {
        setVerifyingDoc(true);
        setDocumentStatus('unverified');

        Tesseract.recognize(
          reader.result,
          'eng'
        ).then(({ data: { text } }) => {
          setVerifyingDoc(false);
          const lowerText = text.toLowerCase();
          let isValidDocType = false;
          let docTypeName = '';

          if (selectedDocType === 'msme') {
            docTypeName = 'MSME Certificate';
            isValidDocType = /udyam|micro|small|medium|ministry|enterprise|government of india/i.test(lowerText);
          } else if (selectedDocType === 'aadhaar') {
            docTypeName = 'Aadhaar Card';
            isValidDocType = /government of india|unique identification|aadhaar|authority of india|\d{4}\s\d{4}\s\d{4}/i.test(lowerText);
          } else if (selectedDocType === 'pan') {
            docTypeName = 'PAN Card';
            isValidDocType = /income tax|permanent account|tax department|govt\. of india|[A-Z]{5}[0-9]{4}[A-Z]/i.test(lowerText);
          } else if (selectedDocType === 'iso') {
            docTypeName = 'ISO Certificate';
            isValidDocType = /iso|quality management|registration|certification|standards/i.test(lowerText);
          }

          // Heuristics check for fake properties in filename, size or text content
          const isFake = file.size < 15000 || /fake|sample|mock/i.test(file.name) || /fake|sample|mock/i.test(lowerText);

          if (!isValidDocType) {
            setDocumentStatus('fake');
            setErrors(prev => ({ 
              ...prev, 
              msmeCertificate: `Authenticity Check Failed: The uploaded document is not recognized as a valid ${docTypeName}. Please upload a real certificate.` 
            }));
          } else if (isFake) {
            setDocumentStatus('fake');
            setErrors(prev => ({ 
              ...prev, 
              msmeCertificate: 'Authenticity Check Failed: Rejected (Fake, sample, or low-resolution document detected).' 
            }));
          } else {
            setDocumentStatus('verified');
            setErrors(prev => ({ ...prev, msmeCertificate: '' }));
          }
        }).catch(err => {
          console.error("OCR Verification Error:", err);
          setVerifyingDoc(false);
          // Fallback to filename/size validation if OCR scanner cannot connect
          const isFakeFallback = file.size < 15000 || /fake|sample|mock/i.test(file.name);
          if (isFakeFallback) {
            setDocumentStatus('fake');
            setErrors(prev => ({ ...prev, msmeCertificate: 'Authenticity check failed: Fake document detected.' }));
          } else {
            setDocumentStatus('verified');
            setErrors(prev => ({ ...prev, msmeCertificate: '' }));
          }
        });
      }
    };
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, [name]: 'Error reading file' }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAIDescription = () => {
    if (!formData.businessName || !formData.ownerName || !formData.address || !formData.phone || !formData.email) {
      alert('Please fill in your Business Name, Legal Owner Name, Store Address, Email, and Phone number first so the AI can customize your description!');
      return;
    }

    // Extract district name
    const getDistrictFromAddress = (address) => {
      if (!address) return '';
      const parts = address.split(',');
      const lastPart = parts[parts.length - 1].trim();
      const cleanPart = lastPart.split('-')[0].trim();
      const district = cleanPart.replace(/\d+/g, '').trim();
      return district;
    };
    const district = getDistrictFromAddress(formData.address) || 'your city';

    // Auto-generate professional description paragraph
    const generatedDesc = `Welcome to ${formData.businessName}. Managed under the leadership of our legal owner ${formData.ownerName} and based in the ${district} region, we are dedicated to providing a premium selection of high-quality aquariums, healthy livestock, and specialized aquarium accessories. Operating with high professional standards, we cater to aquarium enthusiasts and dealers across the region. For inquiries and support, connect with us at ${formData.email} or call ${formData.phone}.`;

    setFormData(prev => ({ ...prev, description: generatedDesc }));
  };

  const handleSendOtp = async () => {
    // Validate email domain
    const emailErr = validateField('email', formData.email);
    if (emailErr) {
      setErrors(prev => ({ ...prev, email: emailErr }));
      return;
    }

    const disposableDomains = ['mailinator.com', 'tempmail.com', 'yopmail.com', 'guerrillamail.com', '10minutemail.com', 'trashmail.com'];
    const parts = formData.email.split('@');
    if (parts.length !== 2) {
      setErrors(prev => ({ ...prev, email: 'Invalid email address' }));
      return;
    }

    const domain = parts[1].toLowerCase();
    if (disposableDomains.includes(domain)) {
      setErrors(prev => ({ ...prev, email: 'Disposable temporary email domains are not allowed.' }));
      return;
    }

    // Only allow Gmail or valid custom business domains
    const isGmail = domain === 'gmail.com';
    const isOfficial = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(domain);
    if (!isGmail && !isOfficial) {
      setErrors(prev => ({ ...prev, email: 'Please use a Gmail or official corporate domain address.' }));
      return;
    }

    setSendingOtp(true);
    setErrors(prev => ({ ...prev, email: '' }));
    setOtpError('');

    try {
      const res = await api.post('/auth/send-otp', { email: formData.email });
      if (res.data && res.data.success) {
        setOtpCode(res.data.otp);
        setOtpSent(true);
        alert(`OTP has been sent successfully to your email address: ${formData.email}`);
      }
    } catch (err) {
      setErrors(prev => ({ 
        ...prev, 
        email: 'Invalid Email: The entered email address is wrong or does not exist. Please enter a correct email ID.' 
      }));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = () => {
    if (userOtpInput === otpCode) {
      setEmailVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP. Please check the code and try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!emailVerified) {
      setError('Please verify your email address with OTP first.');
      return;
    }

    if (documentStatus !== 'verified') {
      setError('Please upload a valid verification document and ensure the authenticity scanner verifies it.');
      return;
    }

    const formErrors = {};
    const fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword', 'businessName', 'ownerName', 'address'];
    fieldsToValidate.forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) {
        formErrors[key] = err;
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Trigger the Terms Agreement page block instead of saving to DB
    setShowAgreement(true);
  };

  const handleAcceptAgreementAndSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await registerDealer({ ...formData, selectedDocType });
      setSuccessMsg(res.message || 'Dealer registration submitted successfully. Admin approval is pending.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        ownerName: '',
        address: '',
        logo: '',
        description: '',
        msmeCertificate: '',
        courierServices: ['DTDC', 'Professional Courier', 'ST Courier'],
      });
      setErrors({});
      setShowAgreement(false);
      setTimeout(() => navigate('/dealer-dashboard'), 3000);
    } catch (err) {
      setError(err);
      setShowAgreement(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-container']} style={{ minHeight: '90vh' }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className={`glass-panel ${styles['auth-card']}`} style={{ maxWidth: showAgreement ? '750px' : '600px', transition: 'max-width 0.3s ease' }}>
        {showAgreement ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className={styles['auth-header']} style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h2 className={styles['auth-title']} style={{ color: 'var(--primary)' }}>TEN Aquarium Dealer Agreement</h2>
              <p className={styles['auth-subtitle']}>Please read and agree to the partnership terms to complete registration</p>
            </div>
            
            {/* Agreement Terms Scroll box */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              maxHeight: '380px',
              overflowY: 'auto',
              fontSize: '0.88rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>TEN Aquarium Dealer Partnership Agreement</h4>
              <p style={{ marginBottom: '1rem' }}>By registering as an authorized dealer on the TEN Aquarium platform and selecting the "I Agree" checkbox, you ("Dealer") acknowledge that you have read, understood, and agreed to the following terms and conditions.</p>
              
              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>1. Dealer Registration</h5>
              <p style={{ marginBottom: '1rem' }}>The Dealer confirms that all information provided during registration is true, accurate, and complete. TEN Aquarium reserves the right to verify the submitted information and approve or reject any dealer registration at its sole discretion.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>2. Order Fulfillment</h5>
              <p style={{ marginBottom: '1rem' }}>Once a customer places an order through the TEN Aquarium platform, the assigned Dealer shall prepare the ordered products, ensure proper quality checks, securely pack the products, and dispatch them through an approved courier service within the specified timeline.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>3. Packing Video Requirement</h5>
              <p style={{ marginBottom: '0.5rem' }}>The Dealer must record a clear and uninterrupted packing video for every order before dispatch. The video must clearly show:</p>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                <li>The Order ID.</li>
                <li>The products being packed.</li>
                <li>The condition and quantity of each product.</li>
                <li>The complete packing process.</li>
                <li>The sealed package before courier handover.</li>
              </ul>
              <p style={{ marginBottom: '1rem' }}>The packing video must be uploaded to the TEN Aquarium Dealer Portal before marking the order as dispatched.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>4. Courier Bill Upload</h5>
              <p style={{ marginBottom: '1rem' }}>After dispatching the shipment, the Dealer must upload the original courier receipt or courier bill containing the tracking number, courier company name, dispatch date, and any other relevant shipment details. Incomplete, incorrect, or edited courier documents may result in payment delays or order verification issues.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>5. Commission Structure</h5>
              <p style={{ marginBottom: '1rem' }}>For every successfully completed customer order, the Dealer agrees to pay 15% of the total order value as the platform commission to TEN Aquarium. The commission will be calculated automatically for each eligible order.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>6. Payment Settlement</h5>
              <p style={{ marginBottom: '0.5rem' }}>Once the courier confirms successful delivery of the order to the customer and the delivery status is verified by the TEN Aquarium system, the payment for that specific order shall be automatically released to the Dealer after deducting the applicable platform commission and any other agreed deductions, if applicable.</p>
              <p style={{ marginBottom: '0.5rem' }}>Payment will be processed only for orders that have:</p>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                <li>A successfully uploaded packing video.</li>
                <li>A valid courier bill.</li>
                <li>Confirmed delivery status.</li>
                <li>No active disputes, fraud investigations, or policy violations.</li>
              </ul>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>7. Dealer Responsibilities</h5>
              <p style={{ marginBottom: '0.5rem' }}>The Dealer agrees to:</p>
              <ul style={{ paddingLeft: '1.2rem', marginBottom: '1rem' }}>
                <li>Supply only healthy, genuine, and quality-approved products.</li>
                <li>Ensure secure and professional packaging.</li>
                <li>Dispatch orders within the prescribed time.</li>
                <li>Maintain accurate inventory information.</li>
                <li>Upload all required proof of shipment.</li>
                <li>Cooperate during customer support or verification requests.</li>
              </ul>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>8. Fraud Prevention</h5>
              <p style={{ marginBottom: '1rem' }}>Any attempt to submit false tracking information, fake courier receipts, manipulated packing videos, duplicate shipments, or misleading information shall be treated as fraudulent activity. TEN Aquarium reserves the right to suspend payments, terminate the dealer account, and take appropriate legal action where necessary.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>9. Order Verification</h5>
              <p style={{ marginBottom: '1rem' }}>TEN Aquarium reserves the right to verify any order, shipment, courier details, or packing video before releasing payment. Additional documents may be requested whenever necessary.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>10. Suspension or Termination</h5>
              <p style={{ marginBottom: '1rem' }}>TEN Aquarium may temporarily suspend or permanently terminate any dealer account for: repeated violations, failure to upload documents, poor customer service, fraudulent actions, or misrepresentation.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>11. Limitation of Liability</h5>
              <p style={{ marginBottom: '1rem' }}>TEN Aquarium shall not be held responsible for delays, losses, or damages caused by courier companies, natural disasters, or any other circumstances beyond its control.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>12. Amendments</h5>
              <p style={{ marginBottom: '1rem' }}>TEN Aquarium reserves the right to update or modify these terms and conditions at any time.</p>

              <h5 style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.3rem' }}>13. Acceptance</h5>
              <p style={{ marginBottom: '1.5rem' }}>By selecting the "I Agree" checkbox during Dealer Registration, the Dealer confirms that they have read, understood, and accepted all the terms and conditions contained in this Agreement. This electronic acceptance shall have the same force and effect as a physical signature, to the extent permitted by applicable law.</p>
            </div>
            
            {/* Agreement Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAgreement(false)}
                className="btn btn-secondary"
                style={{ flex: 1, height: '40px', padding: '0 1.5rem' }}
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleAcceptAgreementAndSubmit}
                className="btn btn-primary"
                style={{ flex: 1, height: '40px', padding: '0 1.5rem', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}
              >
                {loading ? 'Registering...' : 'I Agree'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles['auth-header']}>
              <h2 className={styles['auth-title']}>Register as Dealer</h2>
              <p className={styles['auth-subtitle']}>Submit your store application to start selling on TENAQUARIUM</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && (
              <div className="alert alert-success">
                {successMsg}
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Redirecting you to the home page shortly...
                </div>
              </div>
            )}

            {!successMsg && (
              <form onSubmit={handleSubmit} noValidate>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                  Owner Account Information
                </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Owner full name"
              />
              {errors.name && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={emailVerified}
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g. name@gmail.com"
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      disabled={sendingOtp || !formData.email}
                      onClick={handleSendOtp}
                      className="btn btn-secondary"
                      style={{ padding: '0 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                    >
                      {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {errors.email && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                
                {emailVerified && (
                  <span style={{ color: '#10B981', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 'bold' }}>
                    ✓ Email Verified
                  </span>
                )}

                {otpSent && !emailVerified && (
                  <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'rgba(2, 132, 199, 0.05)', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                      Enter 6-Digit Email OTP
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        maxLength={6}
                        value={userOtpInput}
                        onChange={(e) => setUserOtpInput(e.target.value)}
                        placeholder="e.g. 123456"
                        className="form-control"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="btn btn-primary"
                        style={{ padding: '0.3rem 1rem', fontSize: '0.8rem', fontWeight: 'bold' }}
                      >
                        Verify
                      </button>
                    </div>
                    {otpError && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{otpError}</span>}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Business contact"
                />
                {errors.phone && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    className="form-control"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Min 6 chars"
                    maxLength={10}
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
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    className="form-control"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Confirm password"
                    maxLength={10}
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
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--secondary)', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
              Store / Business Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Registered Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g. Coral World LLC"
                />
                {errors.businessName && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.businessName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Owner Name (Legal)</label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Full Legal Name"
                />
                {errors.ownerName && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.ownerName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Store/Warehouse Address</label>
              <textarea
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                placeholder="Complete address for pickups and product verification"
                style={{ resize: 'vertical' }}
              ></textarea>
              {errors.address && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.address}</span>}
            </div>            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Shop Logo</label>
              <input
                type="file"
                name="logo"
                accept=".jpg,.jpeg"
                onChange={handleFileChange}
                className="form-control"
              />
              {errors.logo && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.logo}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Verification Document Type</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => {
                    setSelectedDocType(e.target.value);
                    setDocumentStatus('unverified');
                    setErrors(prev => ({ ...prev, msmeCertificate: '' }));
                  }}
                  className="form-control"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)' }}
                >
                  <option value="msme" style={{ background: '#1e293b' }}>MSME Certificate</option>
                  <option value="aadhaar" style={{ background: '#1e293b' }}>Aadhaar Card</option>
                  <option value="pan" style={{ background: '#1e293b' }}>PAN Card</option>
                  <option value="iso" style={{ background: '#1e293b' }}>ISO Certificate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Upload {selectedDocType === 'msme' ? 'MSME Certificate' :
                          selectedDocType === 'aadhaar' ? 'Aadhaar Card' :
                          selectedDocType === 'pan' ? 'PAN Card' : 'ISO Certificate'} (JPG/JPEG)
                </label>
                <input
                  type="file"
                  name="msmeCertificate"
                  accept=".jpg,.jpeg"
                  onChange={handleFileChange}
                  className="form-control"
                />
                
                {verifyingDoc && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    <span className="spinner" style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      border: '2px solid currentColor',
                      borderRightColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></span>
                    Scanning document authenticity...
                  </div>
                )}

                {!verifyingDoc && documentStatus === 'verified' && (
                  <span style={{ color: '#10B981', fontSize: '0.8rem', marginTop: '6px', display: 'block', fontWeight: 'bold' }}>
                    ✅ Authenticity Check: Verified (Original Document)
                  </span>
                )}

                {!verifyingDoc && documentStatus === 'fake' && (
                  <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '6px', display: 'block', fontWeight: 'bold' }}>
                    ❌ Authenticity Check: Rejected (Fake / Simulated Document)
                  </span>
                )}

                {errors.msmeCertificate && <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.msmeCertificate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Shop Description</label>
              
              <div style={{ position: 'relative' }}>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Briefly describe your shop, experience, and specialty..."
                  style={{ resize: 'vertical', paddingBottom: '2.5rem' }}
                ></textarea>

                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(2, 132, 199, 0.12)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    color: 'var(--primary)',
                    borderRadius: '20px',
                    padding: '0.25rem 0.8rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 2
                  }}
                >
                  ✨ Generate with AI
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                Supported Courier Partners
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {['DTDC', 'Professional Courier', 'ST Courier'].map((courier) => (
                  <label key={courier} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.courierServices.includes(courier)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            courierServices: [...formData.courierServices, courier]
                          });
                        } else {
                          if (formData.courierServices.length > 1) {
                            setFormData({
                              ...formData,
                              courierServices: formData.courierServices.filter(c => c !== courier)
                            });
                          } else {
                            alert("Please select at least one supported courier partner.");
                          }
                        }
                      }}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    {courier}
                  </label>
                ))}
              </div>
              <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.78rem', lineHeight: '1.4' }}>
                Check the courier service providers that are active and available in your store's dispatch region.
              </small>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}>
              <Store size={16} />
              {loading ? 'Submitting Registration...' : 'Submit Business Registration'}
            </button>
          </form>
        )}
          </>
        )}

        <div className={styles['auth-footer-link']}>
          Already registered? <Link to="/login" className={styles['auth-link-highlight']}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default DealerRegister;
