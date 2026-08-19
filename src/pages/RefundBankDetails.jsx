import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { Landmark, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function RefundBankDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        
        // Pre-fill if details exist
        if (res.data?.cancellationDetails) {
          setHolderName(res.data.cancellationDetails.accountHolderName || '');
          setBankName(res.data.cancellationDetails.bankName || '');
          setAccountNumber(res.data.cancellationDetails.accountNumber || '');
          setIfscCode(res.data.cancellationDetails.ifscCode || '');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order for bank details:', err);
        setError(err.response?.data?.message || 'Failed to load order details. Please log in first.');
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!holderName || !bankName || !accountNumber || !ifscCode) {
      setError('Please fill in all bank details.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.put(`/orders/${id}/refund-bank-details`, {
        accountHolderName: holderName,
        bankName,
        accountNumber,
        ifscCode
      });
      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Error submitting bank details:', err);
      setError(err.response?.data?.message || 'Failed to submit refund bank details. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Verifying refund registry..." />;
  }

  return (
    <div style={{ padding: '3rem 5%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', boxShadow: '0 15px 40px rgba(0,0,0,0.06)' }}>
        
        <button 
          onClick={() => navigate('/customer/dashboard')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 'bold', marginBottom: '1.5rem', padding: 0 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
              <CheckCircle size={64} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.6rem', marginBottom: '0.8rem' }}>
              Details Submitted Successfully!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
              Your refund account details have been securely logged. The admin has been notified to complete the 100% refund of <strong>₹{order?.cancellationDetails?.refundAmount?.toLocaleString() || order?.totalAmount?.toLocaleString()}</strong> to your account.
            </p>
            <button 
              onClick={() => navigate('/customer/dashboard')} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px' }}>
                <Landmark size={28} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.35rem', margin: 0 }}>
                  Refund Bank Details
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Secure Refund Registry for Order #{order?.customOrderId || order?._id?.slice(-6)}
                </span>
              </div>
            </div>

            {error && (
              <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ padding: '1rem', background: 'rgba(2, 132, 199, 0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.8rem' }}>
              <strong>100% Refundable Amount:</strong> <strong style={{ color: 'var(--success)' }}>₹{order?.cancellationDetails?.refundAmount?.toLocaleString() || order?.totalAmount?.toLocaleString()}</strong>
              <div style={{ marginTop: '0.3rem' }}>
                This order was cancelled by the store/admin. Please provide the account details below where you wish to receive the refund.
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Account Holder Name
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter Account Holder's Name" 
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }} 
                />
              </div>
              
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Bank Name
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. SBI, HDFC, ICICI" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  Account Number
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter Bank Account Number" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                  IFSC Code
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter Bank IFSC Code (e.g. SBIN0001234)" 
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }} 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '0.5rem' }}
              >
                {submitting ? 'Submitting Registry...' : 'Submit Secure Refund Details'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
