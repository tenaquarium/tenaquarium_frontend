import React, { useEffect, useState } from 'react';
import styles from './CustomerDashboard.module.css';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useAlert } from '../context/AlertContext';
import { User, ShoppingBag, Heart, DollarSign, Settings, CheckCircle, Clock, Truck, Star, X, ShieldAlert, Eye, EyeOff, Menu } from 'lucide-react';

const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Email Change states
  const [showEmailChangeSection, setShowEmailChangeSection] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpPreviewUrl, setEmailOtpPreviewUrl] = useState('');

  // Password Change & OTP Verification States
  const [sendingPasswordOtp, setSendingPasswordOtp] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [passwordOtpCode, setPasswordOtpCode] = useState('');
  const [passwordOtpVerified, setPasswordOtpVerified] = useState(false);
  const [passwordOtpInput, setPasswordOtpInput] = useState('');
  const [passwordOtpError, setPasswordOtpError] = useState('');
  const [passwordOtpPreviewUrl, setPasswordOtpPreviewUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [reviewedProductIds, setReviewedProductIds] = useState([]);
  
  // Cancellation Modal States
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancellationStep, setCancellationStep] = useState(1); // 1 = policy confirm, 2 = collect bank details, 3 = success
  const [cancellationBankName, setCancellationBankName] = useState('');
  const [cancellationAccNumber, setCancellationAccNumber] = useState('');
  const [cancellationIfscCode, setCancellationIfscCode] = useState('');
  const [cancellationSubmitting, setCancellationSubmitting] = useState(false);
  const [cancellationRefundInfo, setCancellationRefundInfo] = useState(null);
  
  // Dashboard stats state
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');



  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/myorders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReviewedProducts = async () => {
    try {
      const res = await api.get('/reviews/my-reviews');
      setReviewedProductIds(res.data.map(rev => rev.productId));
    } catch (error) {
      console.error('Error fetching reviewed products', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchReviewedProducts();

    // Wishlist count
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistCount(wishlist.length);

    // Cart count
    const fetchCartData = async () => {
      try {
        const cartRes = await api.get('/cart');
        const count = cartRes.data.products.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCartData();

    // Parse review or tab query params
    const searchParams = new URLSearchParams(window.location.search);
    const reviewProdId = searchParams.get('review');
    const tabParam = searchParams.get('tab');

    if (tabParam) {
      setActiveTab(tabParam);
    } else if (reviewProdId) {
      setActiveTab('orders');
      api.get(`/products/${reviewProdId}`)
        .then((res) => {
          openReviewModal(res.data);
        })
        .catch((err) => {
          console.error('Failed to auto-open review modal', err);
        });
    }
  }, []);

  // Lock body scroll when overlay modals are open
  useEffect(() => {
    if (showPasswordChangeModal || showReviewModal || activeInvoiceOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPasswordChangeModal, showReviewModal, activeInvoiceOrder]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    try {
      const updatedData = { name, email, phone };
      await updateProfile(updatedData);
      setProfileMessage('Profile updated successfully!');
    } catch (error) {
      setProfileError(error || 'Failed to update profile.');
    }
  };

  const handleSendPasswordOtp = async () => {
    setSendingPasswordOtp(true);
    setPasswordOtpError('');
    setPasswordOtpPreviewUrl('');
    try {
      const res = await api.post('/auth/send-otp', { email: user.email });
      if (res.data && res.data.otp) {
        setPasswordOtpCode(res.data.otp);
        setPasswordOtpVerified(false);
        setPasswordOtpInput('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordChangeModal(true);
        if (res.data.previewUrl) {
          setPasswordOtpPreviewUrl(res.data.previewUrl);
        }
        alert(`Verification OTP has been sent to your registered email: ${user.email}`);
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingPasswordOtp(false);
    }
  };

  const handleVerifyPasswordOtp = () => {
    if (passwordOtpInput.trim() === passwordOtpCode) {
      setPasswordOtpVerified(true);
      setPasswordOtpError('');
    } else {
      setPasswordOtpError('Invalid OTP. Please check the code and try again.');
    }
  };

  const handleSendEmailOtp = async () => {
    if (!newEmail) {
      alert('Please enter a valid new email address.');
      return;
    }
    setSendingEmailOtp(true);
    setEmailOtpError('');
    setEmailOtpPreviewUrl('');
    try {
      const res = await api.post('/auth/send-otp', { email: newEmail });
      if (res.data && res.data.otp) {
        setEmailOtpCode(res.data.otp);
        setEmailOtpSent(true);
        setEmailOtpInput('');
        if (res.data.previewUrl) {
          setEmailOtpPreviewUrl(res.data.previewUrl);
        }
        alert(`Verification OTP sent to new email: ${newEmail}`);
      } else {
        alert('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtpInput.trim() !== emailOtpCode) {
      setEmailOtpError('Invalid OTP code. Please check and try again.');
      return;
    }
    
    try {
      await api.put('/auth/profile', { email: newEmail });
      setEmail(newEmail);
      setShowEmailChangeSection(false);
      setEmailOtpSent(false);
      setNewEmail('');
      alert('Your email address has been updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update email address.');
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setPasswordOtpError('Both password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordOtpError('Password must be at least 6 characters.');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordOtpError('Password must contain uppercase, lowercase, number, and special character.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordOtpError('Passwords do not match.');
      return;
    }
    try {
      await updateProfile({ password: newPassword });
      alert('Your password has been changed successfully!');
      setShowPasswordChangeModal(false);
    } catch (err) {
      setPasswordOtpError(err || 'Failed to update password.');
    }
  };

  const openReviewModal = (product) => {
    setReviewProductId(product._id);
    setReviewProductName(product.productName);
    setRating(5);
    setReviewText('');
    setReviewError('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await api.post('/reviews', {
        productId: reviewProductId,
        rating: Number(rating),
        review: reviewText,
      });
      alert('Thank you! Your review has been submitted and is pending admin approval.');
      setShowReviewModal(false);
      fetchReviewedProducts();
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handleCancelOrder = (orderId) => {
    const targetOrder = orders.find(o => o._id === orderId);
    if (!targetOrder) return;
    
    // Calculate refund details
    const hours = (new Date() - new Date(targetOrder.createdAt)) / (1000 * 60 * 60);
    const status = targetOrder.orderStatus;
    let percentage = 100;
    let reason = 'Cancelled within 3 hours of order placement';
    
    if (status === 'Placed' || status === 'Pending') {
      if (hours <= 3) {
        percentage = 100;
        reason = 'Cancelled within 3 hours of order placement';
      } else {
        percentage = 75;
        reason = 'Cancelled after 3 hours before dealer accepted';
      }
    } else if (status === 'Processing') {
      if (hours <= 3) {
        percentage = 100;
        reason = 'Cancelled within 3 hours of order placement';
      } else {
        percentage = 75;
        reason = 'Cancelled after dealer starts processing';
      }
    } else if (status === 'Packed') {
      percentage = 50;
      reason = 'Cancelled after packing is completed';
    } else if (status === 'Shipped' || status === 'In Transit') {
      percentage = 5;
      reason = 'Cancelled after shipment handed over to courier';
    } else {
      percentage = 0;
      reason = 'Delivered orders cannot be cancelled';
    }
    
    const amount = targetOrder.totalAmount * (percentage / 100);
    
    setCancellationRefundInfo({
      percentage,
      reason,
      amount
    });
    
    setCancellingOrderId(orderId);
    setCancellationStep(1);
    setCancellationBankName('');
    setCancellationAccNumber('');
    setCancellationIfscCode('');
  };

  const submitCancellationRequest = async (e) => {
    e.preventDefault();
    if (!cancellationBankName.trim() || !cancellationAccNumber.trim() || !cancellationIfscCode.trim()) {
      alert('Please fill out all bank details.');
      return;
    }
    setCancellationSubmitting(true);
    try {
      await api.put(`/orders/${cancellingOrderId}`, {
        orderStatus: 'Cancelled',
        cancellationDetails: {
          agreedToPolicy: true,
          bankName: cancellationBankName,
          accountNumber: cancellationAccNumber,
          ifscCode: cancellationIfscCode,
          requestedAt: new Date()
        }
      });

      // Refresh orders list
      fetchOrders();

      // Trigger SMS notification alert
      const cancelledOrderAmount = orders.find(o => o._id === cancellingOrderId)?.totalAmount || 0;
      window.dispatchEvent(new CustomEvent('sms-notification', {
        detail: { message: `TENAQUARIUM: Order #${cancellingOrderId.slice(-6)} cancellation requested. Refund of ₹${cancelledOrderAmount.toLocaleString()} will process to Bank within 1 hour.` }
      }));

      setCancellationStep(3);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellationSubmitting(false);
    }
  };

  const handleReturnOrder = async (orderId) => {
    const confirm = await showConfirm('Are you sure you want to return this order? This action is final.');
    if (confirm) {
      try {
        await api.put(`/orders/${orderId}`, { orderStatus: 'Returned' });
        alert('Order return request submitted successfully.');
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to submit return request.');
      }
    }
  };

  const downloadInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = order.products.map(item => `
      <tr>
        <td>${item.productId?.productName || 'Aquarium Item'}</td>
        <td>₹${item.price.toLocaleString()}</td>
        <td>${item.quantity}</td>
        <td>₹${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - #${order._id}</title>
          <style>
            body { font-family: 'Salsa', sans-serif; padding: 40px; color: #334155; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 26px; font-weight: bold; color: #0d9488; }
            .title { font-size: 28px; text-transform: uppercase; color: #0284c7; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: bold; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #0d9488; }
          </style>
        </head>
        <body>
          <div class="invoice-header" style="align-items: center; display: flex; justify-content: space-between;">
             <div class="brand">
               <img src="https://www.tenaquarium.com/logo.png" style="height: 50px; width: auto; object-fit: contain;" alt="TENAQUARIUM Logo" />
             </div>
             <div class="title">INVOICE</div>
          </div>
          <div class="details">
             <div>
               <strong>Billed To:</strong><br/>
               ${user.name}<br/>
               Phone: ${user.phone}<br/>
               Email: ${user.email}
             </div>
             <div>
               <strong>Order Details:</strong><br/>
               Order ID: #${order._id}<br/>
               Date: ${new Date(order.createdAt).toLocaleDateString()}<br/>
               Payment Status: ${order.paymentStatus} (${order.paymentMethod})
             </div>
          </div>
          <table>
             <thead>
               <tr>
                 <th>Product Name</th>
                 <th>Unit Price</th>
                 <th>Qty</th>
                 <th>Subtotal</th>
               </tr>
             </thead>
             <tbody>
               ${itemsHtml}
             </tbody>
          </table>
          <div style="text-align: right; font-size: 14px; color: #64748b; margin-bottom: 5px;">
             Subtotal: ₹${(order.totalAmount - (order.deliveryCharge || 0) - (order.packingCharge !== undefined ? order.packingCharge : (order.deliveryCharge ? 0 : 40))).toLocaleString()}
          </div>
          <div style="text-align: right; font-size: 14px; color: #64748b; margin-bottom: 5px;">
             Packing Charge: ₹${(order.packingCharge !== undefined ? order.packingCharge : (order.deliveryCharge ? 0 : 40)).toLocaleString()}
          </div>
          <div style="text-align: right; font-size: 14px; color: #64748b; margin-bottom: 15px;">
             Shipping & Delivery: ${order.deliveryCharge > 0 ? `₹${(order.deliveryCharge || 0).toLocaleString()}` : 'Free'}
          </div>
          <div class="total">
             Total Paid: ₹${order.totalAmount.toLocaleString()}
          </div>
          <script>
             window.onload = function() {
               window.print();
               setTimeout(function() { window.close(); }, 500);
             };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Stats Calculations
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid' || o.paymentMethod === 'COD');
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="main-content" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow Blobs for premium aurora effect */}
      <div className={styles['glow-blob-1']}></div>
      <div className={styles['glow-blob-2']}></div>

      <div className={styles['dashboard-container']} style={{ position: 'relative', zIndex: 1 }}>
        {/* Sidebar Menu */}
        <aside className={styles['sidebar-menu']}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', gap: '0.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={30} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', textAlign: 'center' }}>{user?.name}</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</span>
          </div>

          <div
            className={`${styles['sidebar-item']} ${activeTab === 'overview' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={18} />
            <span>Overview</span>
          </div>

          <div
            className={`${styles['sidebar-item']} ${activeTab === 'orders' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} />
            <span>My Orders</span>
          </div>

          <div
            className={`${styles['sidebar-item']} ${activeTab === 'profile' ? styles['active'] : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Settings size={18} />
            <span>Edit Profile</span>
          </div>
        </aside>

        {/* Dashboard Content area */}
        <main className={styles['dashboard-main']}>
          {activeTab === 'overview' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Customer Dashboard</h1>
              </div>

              {/* Stats Cards Grid */}
              <div className={styles['stats-grid']}>
                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Total Orders</span>
                    <div className={styles['stats-value']}>{orders.length}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}>
                    <ShoppingBag size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Total Spend</span>
                    <div className={styles['stats-value']}>₹{totalSpent.toLocaleString()}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary)' }}>
                    <DollarSign size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Wishlist</span>
                    <div className={styles['stats-value']}>{wishlistCount}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)' }}>
                    <Heart size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Items in Cart</span>
                    <div className={styles['stats-value']}>{cartCount}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                    <ShoppingBag size={24} />
                  </div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                  Recent Orders
                </h3>
                {loadingOrders ? (
                  <p>Loading recent orders...</p>
                ) : orders.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No orders placed yet.</p>
                ) : (
                  <div className={styles['table-container']}>
                    <table className={styles['custom-table']}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Payment Status</th>
                          <th>Shipping Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 3).map((ord) => (
                          <tr key={ord._id}>
                            <td style={{ color: 'var(--primary)', fontWeight: '600' }}>#{ord._id.slice(-6)}</td>
                            <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                            <td>₹{ord.totalAmount.toLocaleString()}</td>
                            <td>
                              <span className={styles['stock-status']} style={{ background: ord.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: ord.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                                {ord.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <span className={styles['stock-status']} style={{ background: ord.orderStatus === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.1)', color: ord.orderStatus === 'Delivered' ? 'var(--success)' : 'var(--primary)' }}>
                                {ord.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Order History</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px' }}>
                  <ShoppingBag size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--success)' }}>Total Orders: {orders.length}</span>
                </div>
              </div>

              {loadingOrders ? (
                <Loader message="Synchronizing transactions..." />
              ) : orders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className={styles['scroll-list-container']}>
                  {orders.map((ord) => (
                    <div key={ord._id} className="glass-panel" style={{ padding: '2rem' }}>
                      <div 
                        onClick={() => setExpandedOrders(prev => ({ ...prev, [ord._id]: !prev[ord._id] }))}
                        style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem', cursor: 'pointer', userSelect: 'none' }}
                        title="Click to toggle order details & tracking info"
                      >
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ORDER PLACED</span>
                          <div style={{ fontWeight: '600' }}>{new Date(ord.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>TOTAL VALUE</span>
                          <div style={{ fontWeight: '600', color: 'var(--secondary)' }}>₹{ord.totalAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PAYMENT STATUS</span>
                          <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{ord.paymentStatus} ({ord.paymentMethod})</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHIPPING STATUS</span>
                          <div style={{ fontWeight: '600', color: ord.orderStatus === 'Delivered' ? 'var(--success)' : ord.orderStatus === 'Cancelled' ? 'var(--error)' : 'var(--primary)' }}>
                            {ord.orderStatus}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ORDER ID</span>
                          <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{ord.customOrderId || ord._id.toString().slice(-6)}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DETAILS & TRACKING</span>
                          <div style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            {expandedOrders[ord._id] ? 'Hide ▲' : 'Show & Track ▼'}
                          </div>
                        </div>
                      </div>

                      {/* Items inside this order */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ord.products.map((item) => {
                          const prod = item.productId;
                          if (!prod) return null;
                          return (
                            <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <img
                                  src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200'}
                                  alt={prod.productName}
                                  style={{ width: '60px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                                />
                                <div>
                                  <h5 style={{ fontWeight: '700' }}>{prod.productName}</h5>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Category: {prod.category} | Qty: {item.quantity} | Price: ₹{item.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {ord.orderStatus === 'Delivered' && !reviewedProductIds.includes(prod._id) && (
                                  <button
                                    type="button"
                                    onClick={() => openReviewModal(prod)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', margin: 0 }}
                                  >
                                    Review Item
                                  </button>
                                )}
                                {ord.orderStatus !== 'Cancelled' && (
                                  <button
                                    onClick={() => setActiveInvoiceOrder(ord)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', borderColor: 'var(--primary)', color: 'var(--primary)', margin: 0 }}
                                  >
                                    View Invoice
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {expandedOrders[ord._id] && (
                        <>
                          {/* Courier & Shipping Details */}
                          {(ord.courierService || ord.deliveryCharge !== undefined) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.2rem' }}>
                              <div style={{ padding: '0.8rem 1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Truck size={16} style={{ color: 'var(--primary)' }} />
                                    Delivery Status: <strong>{ord.orderStatus}</strong>
                                  </span>
                                  <span>Shipping / Delivery: <strong style={{ color: ord.deliveryCharge > 0 ? 'var(--text-primary)' : 'var(--success)' }}>{ord.deliveryCharge > 0 ? `₹${ord.deliveryCharge}` : 'Free'}</strong></span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  <span>Packing Charge: <strong>₹{ord.packingCharge !== undefined ? ord.packingCharge : (ord.deliveryCharge ? 0 : 40)}</strong></span>
                                </div>
                              </div>

                              {ord.courierBillDetails && ord.courierBillDetails.consignmentNo && (
                                <div style={{ padding: '1.2rem', background: 'rgba(59, 130, 246, 0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '6px', letterSpacing: '0.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                                    📦 COURIER SHIPMENT DETAILS
                                  </span>
                                  <div>• <strong>Courier Name:</strong> {ord.courierBillDetails.courier || ord.courierService}</div>
                                  <div>• <strong>Order Tracking Number:</strong> {ord.courierBillDetails.consignmentNo || ord.trackingNumber}</div>
                                  <div>• <strong>From:</strong> {ord.courierBillDetails.from}</div>
                                  <div>• <strong>To:</strong> {ord.courierBillDetails.to}</div>
                                  <div>• <strong>Booking Date and Time:</strong> {ord.courierBillDetails.bookingDate}</div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Package Photos Uploaded by Dealer */}
                          {ord.finalBoxImage && (
                            <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '0.8rem' }}>
                                SHIPMENT PROOF:
                              </span>
                              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '140px', maxWidth: '200px' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Packed Box Photo</span>
                                  <img src={ord.finalBoxImage} alt="Package Box" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cancel & Download Invoice Actions */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            {ord.orderStatus === 'Processing' && (
                              <button
                                onClick={() => handleCancelOrder(ord._id)}
                                className="btn btn-secondary"
                                style={{ color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                              >
                                Cancel Order
                              </button>
                            )}
                            {(() => {
                              const allReturnable = ord.products.every(p => p.productId && p.productId.isReturnable !== false);
                              const deliveredTime = new Date(ord.updatedAt).getTime();
                              const isWithinOneDay = (Date.now() - deliveredTime) <= 24 * 3600 * 1000;
                              return ord.orderStatus === 'Delivered' && allReturnable && isWithinOneDay && (
                                <button
                                  onClick={() => handleReturnOrder(ord._id)}
                                  className="btn btn-secondary"
                                  style={{ color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                                >
                                  Return Order
                                </button>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={styles['profile-scroll-wrapper']} style={{ maxWidth: '600px' }}>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Profile Management</h1>
              </div>

              <form onSubmit={handleProfileUpdate} className="glass-panel" style={{ padding: '2rem' }}>
                {profileError && <div className="alert alert-danger">{profileError}</div>}
                {profileMessage && <div className="alert alert-success">{profileMessage}</div>}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <input
                      type="email"
                      required
                      readOnly
                      value={email}
                      className="form-control"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', flex: 1 }}
                    />
                    {!showEmailChangeSection && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailChangeSection(true);
                          setEmailOtpSent(false);
                          setNewEmail('');
                        }}
                        className="btn btn-secondary"
                        style={{ whiteSpace: 'nowrap', margin: 0, padding: '0.5rem 1rem' }}
                      >
                        Change Email
                      </button>
                    )}
                  </div>

                  {showEmailChangeSection && (
                    <div style={{ border: '1px dashed var(--border-color)', borderRadius: '10px', padding: '1rem', marginTop: '1rem', background: 'rgba(255, 255, 255, 0.01)' }}>
                      <div className="form-group">
                        <label className="form-label">Enter New Email Address</label>
                        <input
                          type="email"
                          value={newEmail}
                          disabled={emailOtpSent}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="form-control"
                          placeholder="name@example.com"
                        />
                      </div>

                      {!emailOtpSent ? (
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.8rem' }}>
                          <button
                            type="button"
                            onClick={() => setShowEmailChangeSection(false)}
                            className="btn btn-secondary"
                            style={{ flex: 1, margin: 0 }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={sendingEmailOtp || !newEmail}
                            onClick={handleSendEmailOtp}
                            className="btn btn-primary"
                            style={{ flex: 1, margin: 0 }}
                          >
                            {sendingEmailOtp ? 'Sending OTP...' : 'Send OTP'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="form-group" style={{ marginTop: '0.8rem' }}>
                            <label className="form-label">Enter 6-Digit OTP Code</label>
                            <input
                              type="text"
                              value={emailOtpInput}
                              onChange={(e) => setEmailOtpInput(e.target.value)}
                              className="form-control"
                              placeholder="123456"
                              style={{ letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                            />
                            {emailOtpError && <small style={{ color: 'var(--accent)', marginTop: '4px', display: 'block' }}>{emailOtpError}</small>}
                          </div>

                          {emailOtpPreviewUrl && (
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', margin: '1rem 0', fontSize: '0.85rem' }}>
                              <strong style={{ color: 'var(--primary)' }}>Ethereal Mailbox Delivery link:</strong><br/>
                              <a href={emailOtpPreviewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
                                View Verification Email
                              </a>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                            <button
                              type="button"
                              onClick={() => setEmailOtpSent(false)}
                              className="btn btn-secondary"
                              style={{ flex: 1, margin: 0 }}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              disabled={!emailOtpInput}
                              onClick={handleVerifyEmailOtp}
                              className="btn btn-primary"
                              style={{ flex: 1, margin: 0 }}
                            >
                              Verify & Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label className="form-label">Password & Security</label>
                  <button
                    type="button"
                    disabled={sendingPasswordOtp}
                    onClick={handleSendPasswordOtp}
                    className="btn btn-secondary"
                    style={{ width: '100%', margin: 0 }}
                  >
                    {sendingPasswordOtp ? 'Sending OTP...' : 'Change Password'}
                  </button>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                  Update Account Profile
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '450px' }}>
            <button onClick={() => setShowReviewModal(false)} className={styles['modal-close']}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>
              Review Product
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Share your feedback for <strong>{reviewProductName}</strong>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.4rem', fontWeight: '600' }}>
                Note: All reviews are moderated and will appear after admin approval.
              </span>
            </p>

            <form onSubmit={handleReviewSubmit}>
              {reviewError && (
                <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.8rem', marginBottom: '1rem' }}>
                  {reviewError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star
                        size={28}
                        style={{
                          color: star <= rating ? 'var(--warning)' : '#cbd5e1',
                          fill: star <= rating ? 'var(--warning)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike about this product?"
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn btn-secondary"
                  style={{ flexGrow: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flexGrow: 1 }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="glass-alert-overlay">
          <div className="glass-panel glass-alert-modal" style={{ maxWidth: '420px', alignItems: 'stretch' }}>
            <button 
              onClick={() => setShowPasswordChangeModal(false)}
              className="glass-alert-close"
              title="Close"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div 
                className="glass-alert-icon-container"
                style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)' }}
              >
                <ShieldAlert size={44} style={{ color: 'var(--primary)' }} />
              </div>
              
              <div className="glass-alert-content">
                <h4 
                  className="glass-alert-title"
                  style={{ color: 'var(--primary)' }}
                >
                  Change Password
                </h4>
                <p className="glass-alert-message" style={{ marginBottom: '1.2rem' }}>
                  {passwordOtpVerified 
                    ? 'OTP verified successfully. Please enter your new password:' 
                    : `Please verify your request by entering the 6-digit OTP code sent to your registered email: ${user?.email}`
                  }
                </p>
              </div>
            </div>

            {passwordOtpError && (
              <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', marginBottom: '1rem' }}>
                {passwordOtpError}
              </div>
            )}

            {!passwordOtpVerified ? (
              <div style={{ width: '100%' }}>
                <div className="form-group">
                  <label className="form-label">6-Digit OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={passwordOtpInput}
                    onChange={(e) => setPasswordOtpInput(e.target.value)}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      border: '1px solid var(--border-color)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '10px', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      letterSpacing: '4px',
                      fontWeight: '700'
                    }}
                    autoFocus
                  />
                </div>
                
                {passwordOtpPreviewUrl && (
                  <div style={{ margin: '0.5rem 0 1rem 0', textAlign: 'center' }}>
                    <a 
                      href={passwordOtpPreviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: 'var(--secondary)', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: '600' }}
                    >
                      [Development Preview] View Sent OTP Email
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeModal(false)}
                    className="btn btn-secondary glass-alert-btn-secondary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyPasswordOtp}
                    className="btn btn-primary glass-alert-btn-primary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">New Password</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      border: '1px solid var(--border-color)', 
                      padding: '0.75rem 2.5rem 0.75rem 1rem', 
                      borderRadius: '10px', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '38px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="form-control"
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      border: '1px solid var(--border-color)', 
                      padding: '0.75rem 2.5rem 0.75rem 1rem', 
                      borderRadius: '10px', 
                      color: 'var(--text-primary)', 
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '38px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeModal(false)}
                    className="btn btn-secondary glass-alert-btn-secondary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    className="btn btn-primary glass-alert-btn-primary"
                    style={{ flex: 1, margin: 0, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    Save Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Beautiful custom styled inline invoice modal overlay */}
      {activeInvoiceOrder && (
        <div className={styles['modal-overlay']} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '650px', width: '90%', padding: '2rem', borderRadius: '24px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Close button */}
            <button
              onClick={() => setActiveInvoiceOrder(null)}
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>

            {/* Print Area */}
            <div id="invoice-print-area" style={{ background: '#ffffff', color: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', fontFamily: 'system-ui, sans-serif', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0284c7', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <img src="/logo.png" style={{ height: '5rem', width: 'auto', objectFit: 'contain' }} alt="Logo" />
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', fontWeight: 'bold', textAlign: 'center' }}>Salem, Tamil Nadu</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284c7', letterSpacing: '0.5px' }}>INVOICE</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: '#334155', textAlign: 'left' }}>
                <div>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Billed To:</strong>
                  <span style={{ fontWeight: '600' }}>{activeInvoiceOrder.shippingAddress?.name || user.name}</span><br />
                  Phone: {activeInvoiceOrder.shippingAddress?.phone || user.phone}<br />
                  Address: {activeInvoiceOrder.shippingAddress?.address}, {activeInvoiceOrder.shippingAddress?.city}, {activeInvoiceOrder.shippingAddress?.state} - {activeInvoiceOrder.shippingAddress?.zip}
                </div>
                <div>
                  <strong style={{ color: '#1e3a8a', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Order Details:</strong>
                  Order ID: #{activeInvoiceOrder.customOrderId || activeInvoiceOrder._id.toString().slice(-6)}<br />
                  Date: {new Date(activeInvoiceOrder.createdAt).toLocaleDateString()}<br />
                  Payment Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: activeInvoiceOrder.paymentStatus === 'paid' ? '#059669' : '#d97706' }}>{activeInvoiceOrder.paymentStatus}</span> ({activeInvoiceOrder.paymentMethod})
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>Product Name</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a', width: '90px' }}>Unit Price</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a', width: '50px' }}>Qty</th>
                    <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#1e3a8a', width: '110px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoiceOrder.products.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', color: '#334155' }}>{item.productId?.productName || 'Aquarium Item'}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>Rs {item.price.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155' }}>{item.quantity}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#334155', fontWeight: '500' }}>Rs {(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                Subtotal: Rs {(activeInvoiceOrder.totalAmount - (activeInvoiceOrder.deliveryCharge || 0) - (activeInvoiceOrder.packingCharge !== undefined ? activeInvoiceOrder.packingCharge : (activeInvoiceOrder.deliveryCharge ? 0 : 40))).toLocaleString()}
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                Packing Charge: Rs {(activeInvoiceOrder.packingCharge !== undefined ? activeInvoiceOrder.packingCharge : (activeInvoiceOrder.deliveryCharge ? 0 : 40)).toLocaleString()}
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                Shipping & Delivery: {activeInvoiceOrder.deliveryCharge > 0 ? `Rs ${(activeInvoiceOrder.deliveryCharge || 0).toLocaleString()}` : 'Free'}
              </div>
              <div style={{ textAlign: 'right', fontSize: '1.15rem', fontWeight: 'bold', color: '#059669', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
                Total Paid: Rs {activeInvoiceOrder.totalAmount.toLocaleString()}
              </div>

              {/* IMPORTANT NOTES */}
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #cbd5e1', fontSize: '0.82rem', color: '#475569', textAlign: 'left', lineHeight: '1.5' }}>
                <div style={{ fontWeight: 'bold', color: '#1e3a8a', textAlign: 'center', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  ================== IMPORTANT NOTES ==================
                </div>
                <ul style={{ paddingLeft: '1.2rem', margin: '0 0 15px 0' }}>
                  <li>Float the sealed fish bag in the aquarium for 15–20 minutes before opening.</li>
                  <li>Gradually acclimate the fish using aquarium water.</li>
                  <li>Do not feed the fish for the first 12–24 hours.</li>
                  <li>Ensure proper aeration and a stress-free environment.</li>
                  <li>Use only a fully cycled and dechlorinated aquarium.</li>
                </ul>

                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#ef4444' }}>📹 IMPORTANT:</strong><br />
                  A continuous unboxing video (without cuts or edits) is mandatory for any replacement request.
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#ef4444' }}>⚠ RESPONSIBILITY:</strong><br />
                  Once the fish is removed from the transport bag or released into the aquarium, the customer assumes full responsibility for its care and survival.
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#ef4444' }}>❌ REFUND POLICY:</strong><br />
                  No Refunds under any circumstances for Live Fish Orders.
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold' }}>
                  For support, contact: TEN Aquarium Support | Emails: tenaquarium@gmail.com, tenaquariumshop@tenaquarium.com
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  const printContents = document.getElementById('invoice-print-area').innerHTML;
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Invoice - #${activeInvoiceOrder.customOrderId || activeInvoiceOrder._id}</title>
                        <style>
                          body { font-family: system-ui, sans-serif; padding: 40px; }
                          th, td { border-bottom: 1px solid #cbd5e1; padding: 10px; }
                        </style>
                      </head>
                      <body>${printContents}</body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                  printWindow.close();
                }}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', height: '36px' }}
              >
                Print Invoice
              </button>
              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', height: '36px', border: '1px solid var(--border-color)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgraded Customer Cancellation Wizard Modal */}
      {cancellingOrderId && (
        <div className={styles['modal-overlay']} style={{ zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '420px', width: '90%', padding: '2rem', borderRadius: '24px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', textAlign: 'center' }}>
            
            {/* Step 1: Policy Confirmation */}
            {cancellationStep === 1 && cancellationRefundInfo && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 1.2rem' }}>
                  <ShieldAlert size={28} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>Confirm Cancellation</h3>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.2rem', fontSize: '0.82rem', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <div>Order Status: <strong style={{ color: 'var(--primary)' }}>{orders.find(o => o._id === cancellingOrderId)?.orderStatus}</strong></div>
                  <div style={{ marginTop: '5px' }}>Refund Rule: <strong>{cancellationRefundInfo.reason}</strong></div>
                  <div style={{ marginTop: '5px' }}>Refund Eligibility: <strong style={{ color: 'var(--success)' }}>{cancellationRefundInfo.percentage}%</strong></div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Refund Amount: <strong style={{ color: 'var(--success)' }}>₹{cancellationRefundInfo.amount.toLocaleString()}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.5rem' }}>
                  We are cancelling this order by applying our cancellation policy. Do you agree to proceed with the cancellation and accept the refund amount?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setCancellingOrderId(null);
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, margin: 0, border: '1px solid var(--border-color)', height: '40px' }}
                  >
                    No, Keep Order
                  </button>
                  <button
                    onClick={() => {
                      setCancellationStep(2);
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, margin: 0, background: '#ef4444', borderColor: '#ef4444', height: '40px' }}
                  >
                    Yes, Agree
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Bank details form */}
            {cancellationStep === 2 && (
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Bank Details for Refund</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', textAlign: 'center' }}>
                  Please enter your bank account details where you would like to receive the refund amount.
                </p>

                <form onSubmit={submitCancellationRequest}>
                  <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. State Bank of India"
                      value={cancellationBankName}
                      onChange={(e) => setCancellationBankName(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                    <label className="form-label">Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter account number"
                      value={cancellationAccNumber}
                      onChange={(e) => setCancellationAccNumber(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">IFSC Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SBIN0001234"
                      value={cancellationIfscCode}
                      onChange={(e) => setCancellationIfscCode(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      disabled={cancellationSubmitting}
                      onClick={() => setCancellationStep(1)}
                      className="btn btn-secondary"
                      style={{ flex: 1, margin: 0, border: '1px solid var(--border-color)', height: '40px' }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={cancellationSubmitting}
                      className="btn btn-primary"
                      style={{ flex: 1, margin: 0, height: '40px' }}
                    >
                      {cancellationSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Success Screen */}
            {cancellationStep === 3 && (
              <div>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 1.2rem' }}>
                  <CheckCircle size={28} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>Cancellation Initiated</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.8rem' }}>
                  Your order cancellation request has been submitted. Refund amount will be credited to your bank account within 1 hour.
                </p>
                <button
                  onClick={() => {
                    setCancellingOrderId(null);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', margin: 0, height: '40px' }}
                >
                  Great, Thank You
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
