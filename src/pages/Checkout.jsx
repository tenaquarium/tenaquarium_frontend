import React, { useEffect, useState } from 'react';
import styles from './Checkout.module.css';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../utils/api';
import { CreditCard, CheckCircle, MapPin, AlertCircle, Sparkles, Truck, QrCode, Smartphone, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  // Shipping Address Form
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI-QR');
  const [paymentSubMethod, setPaymentSubMethod] = useState('online');

  // Autofill phone when user profile loads
  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
  }, [user, phone]);

  // UPI QR Payment Modal States
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState('');
  const [activeOrderAmount, setActiveOrderAmount] = useState(0);
  const [customerUpiId, setCustomerUpiId] = useState('');
  const [paymentProofImage, setPaymentProofImage] = useState('');
  const [paymentProofFileName, setPaymentProofFileName] = useState('');
  const [paymentRejectReason, setPaymentRejectReason] = useState('timeout'); // 'timeout' | 'admin'
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [paymentStep, setPaymentStep] = useState('pay'); // 'pay' | 'submitting' | 'waiting' | 'success' | 'expired'
  const [agreeTC, setAgreeTC] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [agreeFishCare, setAgreeFishCare] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyActiveTab, setPolicyActiveTab] = useState('fishcare');
  
  // Courier & Delivery Calculations
  const [dealerInfo, setDealerInfo] = useState(null);
  const [courierService, setCourierService] = useState('');
  const [totalWeight, setTotalWeight] = useState(0);
  const [distance, setDistance] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  
  // Dynamic API rates states
  const [serviceType, setServiceType] = useState('Surface');
  const [availableQuotes, setAvailableQuotes] = useState([]);
  const [courierLoading, setCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState('');

  // ZIP / PIN code validation state
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState('');
  const [isZipValid, setIsZipValid] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);

  // Post-order success screen state
  const [orderSuccess, setOrderSuccess] = useState(null);
  
  // Mock Payment Modal state (disabled)

  // Calculate cart weight based on categories and item size (proxied by price)
  const calculateCartWeight = (products) => {
    if (!products) return 0;
    return products.reduce((sum, item) => {
      const prod = item.productId;
      if (!prod) return sum;
      
      let itemWeight = 0.5; // default 0.5kg
      
      if (prod.category === 'Aquarium Tanks') {
        // Price determines size/volume
        if (prod.price < 1500) {
          itemWeight = 5; // small tank: 5kg
        } else if (prod.price < 5000) {
          itemWeight = 15; // medium tank: 15kg
        } else {
          itemWeight = 40; // large tank: 40kg
        }
      } else if (prod.category === 'Aquarium Filters') {
        if (prod.price < 400) {
          itemWeight = 0.5; // small filter: 0.5kg
        } else if (prod.price < 1000) {
          itemWeight = 0.75; // medium filter: 0.75kg
        } else {
          itemWeight = 1.2; // large filter: 1.2kg
        }
      } else if (prod.category === 'Aquarium Lights') {
        if (prod.price < 500) {
          itemWeight = 0.5; // small light: 0.5kg
        } else if (prod.price < 2000) {
          itemWeight = 1.0; // medium light: 1.0kg
        } else {
          itemWeight = 2.0; // large light: 2.0kg
        }
      } else if (prod.category === 'Aquarium Fish') {
        if (prod.price < 250) {
          itemWeight = 0.3; // small cost fish: 0.3kg
        } else {
          itemWeight = 1.0; // large fish: 1.0kg
        }
      } else if (prod.category === 'Aquarium Plants') {
        itemWeight = 0.3; // plants: 0.3kg
      } else {
        itemWeight = 0.5; // Food, accessories, decorations
      }
      
      return sum + (itemWeight * item.quantity);
    }, 0);
  };

  // Helper to calculate geographical distance via Haversine Formula
  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth's mean radius in km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLng = toRad(coords2.lng - coords1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coords1.lat)) *
        Math.cos(toRad(coords2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Local Geocoder database mapping major Indian cities to lat/lng
  const getCityCoords = (addressOrCityName) => {
    const text = (addressOrCityName || '').toLowerCase();
    const cityCoords = {
      chennai: { lat: 13.0827, lng: 80.2707 },
      coimbatore: { lat: 11.0168, lng: 76.9558 },
      madurai: { lat: 9.9252, lng: 78.1198 },
      trichy: { lat: 10.7905, lng: 78.7047 },
      tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
      salem: { lat: 11.6643, lng: 78.1460 },
      tirunelveli: { lat: 8.7139, lng: 77.7567 },
      vellore: { lat: 12.9165, lng: 79.1325 },
      bangalore: { lat: 12.9716, lng: 77.5946 },
      bengaluru: { lat: 12.9716, lng: 77.5946 },
      mumbai: { lat: 19.0760, lng: 72.8777 },
      delhi: { lat: 28.7041, lng: 77.1025 },
      hyderabad: { lat: 17.3850, lng: 78.4867 },
      kochi: { lat: 9.9312, lng: 76.2673 },
      puducherry: { lat: 11.9416, lng: 79.8083 },
      pondicherry: { lat: 11.9416, lng: 79.8083 },
      erode: { lat: 11.3410, lng: 77.7172 },
      tiruppur: { lat: 11.1085, lng: 77.3411 },
      nagercoil: { lat: 8.1833, lng: 77.4119 },
      thanjavur: { lat: 10.7870, lng: 79.1378 },
      karur: { lat: 10.9601, lng: 78.0766 },
      dindigul: { lat: 10.3673, lng: 77.9803 },
    };

    for (const city in cityCoords) {
      if (text.includes(city)) {
        return cityCoords[city];
      }
    }
    return null;
  };

  // Calculate road distance in km based on matched coordinates, falling back to ZIP difference
  const calculateDistanceVal = (dealerAddress, customerCity, customerState, customerZip) => {
    if (!dealerAddress || !customerZip) return 0;
    
    // Attempt coordinate geocoding
    const dealerCoords = getCityCoords(dealerAddress);
    const customerCoords = getCityCoords(customerCity) || getCityCoords(customerState);

    if (dealerCoords && customerCoords) {
      const geoDist = haversineDistance(dealerCoords, customerCoords);
      // Multiply by 1.25 to simulate road route curves like Google Maps
      let roadDist = Math.round(geoDist * 1.25);
      if (roadDist < 5) roadDist = 5;
      return roadDist;
    }
    
    // Fallback to ZIP-based calculations
    const zipRegex = /\b\d{6}\b/;
    const match = dealerAddress.match(zipRegex);
    const dealerZipVal = match ? parseInt(match[0], 10) : 600001; // default to Chennai zip
    
    const customerZipVal = parseInt(customerZip, 10);
    if (!customerZipVal || customerZip.length < 6) return 0;
    
    let diff = Math.abs(dealerZipVal - customerZipVal);
    if (diff === 0) {
      return 5; // same area
    }
    
    let dist = Math.floor(diff / 100);
    if (dist < 10) dist = 10;
    if (dist > 1000) dist = 1000;
    
    return dist;
  };

  // Get box dimensions based on total weight of items
  const getEstimateDimensions = (weight) => {
    if (weight <= 0.5) return { length: 15, width: 10, height: 10 };
    if (weight <= 1.0) return { length: 20, width: 15, height: 10 };
    if (weight <= 2.0) return { length: 25, width: 20, height: 10 };
    if (weight <= 5.0) return { length: 30, width: 25, height: 20 };
    if (weight <= 10.0) return { length: 40, width: 30, height: 25 };
    if (weight <= 20.0) return { length: 50, width: 40, height: 30 };
    return { length: 60, width: 50, height: 40 };
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.products.length === 0) {
          navigate('/cart');
          return;
        }
        setCart(res.data);
        
        // Calculate box weight
        const weight = calculateCartWeight(res.data.products);
        setTotalWeight(weight);

        // Fetch dealer details
        if (res.data.products.length > 0) {
          const firstProdId = res.data.products[0].productId._id;
          const prodRes = await api.get(`/products/${firstProdId}`);
          if (prodRes.data && prodRes.data.dealerInfo) {
            setDealerInfo(prodRes.data.dealerInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching cart for checkout', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  // 1. Validate Indian PIN code against official postal registry
  useEffect(() => {
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!zip) {
      setIsZipValid(false);
      setZipError('');
      setCity('');
      setState('');
      setApiFailed(false);
      return;
    }

    if (!pinRegex.test(zip)) {
      setIsZipValid(false);
      setZipError('Format must be 6 digits (cannot start with 0).');
      setCity('');
      setState('');
      setApiFailed(false);
      return;
    }

    const verifyPinCode = async () => {
      setZipLoading(true);
      setZipError('');
      setApiFailed(false);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${zip}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success') {
          setIsZipValid(true);
          setZipError('');
          
          const postOffices = data[0].PostOffice;
          if (postOffices && postOffices.length > 0) {
            const firstPO = postOffices[0];
            // Auto-fill city and state directly
            setCity(firstPO.District || firstPO.Block || '');
            setState(firstPO.State || '');
          }
        } else {
          setIsZipValid(false);
          setZipError('PIN code not found in Indian Postal registry.');
          setCity('');
          setState('');
        }
      } catch (err) {
        console.error('Postal API error, falling back to local verification', err);
        setIsZipValid(true);
        setZipError('');
        setApiFailed(true); // Fallback to manual entry if API is offline
      } finally {
        setZipLoading(false);
      }
    };

    verifyPinCode();
  }, [zip]);

  // 2. Recalculate distance when zip validity changes and reset speed if short distance
  useEffect(() => {
    if (dealerInfo && isZipValid && zip) {
      const dist = calculateDistanceVal(dealerInfo.address, city, state, zip);
      setDistance(dist);
    } else {
      setDistance(0);
    }
  }, [dealerInfo, city, state, zip, isZipValid, serviceType]);

  // 3. Set free shipping directly when ZIP code is valid
  useEffect(() => {
    if (!dealerInfo || !isZipValid || !zip) {
      setAvailableQuotes([]);
      setCourierService('');
      setDeliveryCharge(0);
      setCourierError('');
      return;
    }
    
    // Hardcode to Free Shipping
    setAvailableQuotes([
      {
        courierName: 'Free Shipping',
        estDays: 3,
        finalAmount: 0
      }
    ]);
    setCourierService('Free Shipping');
    setDeliveryCharge(0);
    setCourierError('');
  }, [dealerInfo, zip, isZipValid]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    // Indian PIN code validation check
    if (!isZipValid) {
      alert(zipError || 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!courierService) {
      alert('Please select a courier service to calculate shipping.');
      return;
    }
    setPlacingOrder(true);

    const shippingAddress = { address, city, state, zip, phone };

    try {
      const res = await api.post('/orders', {
        cartItems: cart.products,
        shippingAddress,
        paymentMethod,
        courierService,
        deliveryCharge,
      });

      const { success, order } = res.data;

      if (success) {
        if (paymentMethod === 'COD') {
          setOrderSuccess(order);
          window.dispatchEvent(new Event('cart-updated'));
          window.dispatchEvent(new CustomEvent('sms-notification', {
            detail: { message: `TENAQUARIUM: Order placed successfully! Order ID: #${order._id.slice(-6)}. Total: ₹${order.totalAmount.toLocaleString()}. Status: Processing.` }
          }));
        } else if (paymentMethod === 'UPI-QR') {
          setActiveOrderId(order._id);
          setActiveOrderAmount(order.totalAmount);
          setTimerSeconds(300);
          setPaymentStep('pay');
          setCustomerUpiId('');
          setShowUpiModal(true);
          
          // Immediately dispatch SMS alert to admin phone
          window.dispatchEvent(new CustomEvent('sms-notification', {
            detail: {
              message: `TENAQUARIUM: UPI QR Generated. Order ID: #${order._id.slice(-6)} | Amount: ₹${order.totalAmount.toLocaleString()} | Status: Pending verification.`,
              orderId: order._id,
              type: 'payment-approval'
            }
          }));
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // 2-minute Countdown Timer Effect
  useEffect(() => {
    if (!showUpiModal || paymentStep === 'success' || paymentStep === 'expired') return;

    if (timerSeconds <= 0) {
      setPaymentStep('expired');
      handlePaymentExpired();
      return;
    }

    const timer = setTimeout(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showUpiModal, timerSeconds, paymentStep]);

  // Lock body scroll when payment modal, cancel confirm, or policy modal is active
  useEffect(() => {
    if (showUpiModal || showCancelConfirmModal || showPolicyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUpiModal, showCancelConfirmModal, showPolicyModal]);

  // Cancel order when payment expires
  const handlePaymentExpired = async () => {
    try {
      await api.put(`/orders/${activeOrderId}`, { paymentStatus: 'failed', orderStatus: 'Cancelled' });
    } catch (err) {
      console.error('Failed to cancel expired order:', err);
    }
  };

  // Submit UPI Payment Proof
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!paymentProofImage) {
      alert('Please upload a screenshot of your payment proof.');
      return;
    }

    setPaymentStep('submitting');
    try {
      await api.put(`/orders/${activeOrderId}/payment-proof`, { paymentProofImage, customerUpiId });
      setPaymentStep('waiting');

      // Dispatch urgent SMS alert to the admin's phone simulator
      window.dispatchEvent(new CustomEvent('sms-notification', {
        detail: {
          message: `TENAQUARIUM: URGENT payment verification for Order #${activeOrderId.slice(-6)}. Verify screenshot for ₹${activeOrderAmount.toLocaleString()}.`,
          orderId: activeOrderId,
          type: 'payment-approval'
        }
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit payment proof.');
      setPaymentStep('pay');
    }
  };

  // Poll order status for Admin approval
  useEffect(() => {
    if (paymentStep !== 'waiting') return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await api.get(`/orders/${activeOrderId}`);
        if (res.data.paymentStatus === 'paid' && isMounted) {
          setPaymentStep('success');
          // Clear cart navbar indicator
          window.dispatchEvent(new Event('cart-updated'));
          // Simulated SMS notification
          window.dispatchEvent(new CustomEvent('sms-notification', {
            detail: { message: `TENAQUARIUM: UPI payment verified by Admin! Order ID: #${res.data._id.slice(-6)}. Total: ₹${res.data.totalAmount.toLocaleString()}. Status: paid.` }
          }));
        } else if (res.data.paymentStatus === 'failed' && isMounted) {
          setPaymentStep('expired');
          if (timerSeconds > 0) {
            setPaymentRejectReason('admin');
            alert('Your payment proof was rejected by the admin.');
          } else {
            setPaymentRejectReason('timeout');
            alert('Payment verification window expired.');
          }
        }
      } catch (err) {
        console.error('Polling order status error:', err);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [paymentStep, activeOrderId]);

  // Redirect customer to dashboard after payment success animation (10 seconds)
  useEffect(() => {
    if (paymentStep === 'success') {
      const timer = setTimeout(() => {
        navigate('/customer/dashboard?tab=orders');
      }, 10000); // 10 seconds (10s)
      return () => clearTimeout(timer);
    }
  }, [paymentStep, navigate]);

  if (loading) {
    return <Loader message="Loading payment environment..." />;
  }

  if (orderSuccess) {
    return (
      <div className="main-content" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3.5rem', maxWidth: '600px', margin: '0 auto', borderColor: 'var(--secondary)' }}>
          <CheckCircle size={64} style={{ color: 'var(--success)', marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Order Placed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your transaction has completed successfully. Your order ID is:
            <br />
            <strong style={{ color: 'var(--primary)' }}>{orderSuccess._id}</strong>
          </p>
          <div style={{ background: 'rgba(20, 184, 166, 0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            Status: <strong style={{ color: 'var(--success)' }}>{orderSuccess.orderStatus}</strong>
            <br />
            Total: <strong>₹{orderSuccess.totalAmount.toLocaleString()}</strong>
            <br />
            Packing Charge: <strong>₹40</strong>
            <br />
            Shipping: <strong>Free</strong>
            <br />
            Payment Status: <strong style={{ color: orderSuccess.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)' }}>{orderSuccess.paymentStatus}</strong>
          </div>
          <button onClick={() => navigate('/customer/dashboard')} className="btn btn-primary">
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.products || [];
  const subtotal = items.reduce((sum, item) => sum + (item.productId?.price || 0) * item.quantity, 0);
  const packingCharge = 40;
  const totalPayable = subtotal + packingCharge;

  return (
    <div className="main-content" style={{ padding: '2vh 5% 4rem' }}>
      <form onSubmit={handleCheckoutSubmit} className={styles['cart-layout']}>
        {/* Left Panel: Shipping Details */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <MapPin size={20} />
            SHIPPING ADDRESS
          </h3>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-control"
              placeholder="e.g. Flat No. 101, Marine Heights"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City/District</label>
              <input
                type="text"
                required
                readOnly={!apiFailed}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-control"
                style={!apiFailed ? { background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' } : {}}
                placeholder="District (auto-filled)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                required
                readOnly={!apiFailed}
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="form-control"
                style={!apiFailed ? { background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' } : {}}
                placeholder="State (auto-filled)"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">ZIP / Postal Code (6 Digits)</label>
              <input
                type="text"
                required
                pattern="[1-9][0-9]{5}"
                value={zip}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // keep digits only
                  if (val.length === 0) {
                    setZip('');
                  } else if (val[0] !== '0' && val.length <= 6) {
                    setZip(val);
                  }
                }}
                className="form-control"
                placeholder="e.g. 641001"
              />
              {zipLoading && (
                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  Verifying PIN code...
                </span>
              )}
              {zipError && (
                <span style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  ❌ {zipError}
                </span>
              )}
              {isZipValid && !zipLoading && (
                <span style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                  ✓ Verified Indian PIN code
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-control"
                placeholder="10-digit number"
              />
            </div>
          </div>

          {/* Shipping & Delivery Information */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.03)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ color: 'var(--success)' }}>
              <Truck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--success)' }}>Free Shipping Applied</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All live fish and aquarium supplies ship for free across India! Flat ₹40 packing fee applies per order.</div>
            </div>
          </div>

        </div>

        {/* Right Summary Panel */}
        <aside className={`glass-panel ${styles['checkout-summary']}`}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Items Ordered
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {items.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '200px' }}>
                  {item.productId?.productName} x {item.quantity}
                </span>
                <span>₹{((item.productId?.price || 0) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className={styles['summary-row']}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          <div className={styles['summary-row']}>
            <span style={{ color: 'var(--text-secondary)' }}>Packing Charge</span>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹40</span>
          </div>

          <div className={styles['summary-row']}>
            <span style={{ color: 'var(--text-secondary)' }}>Shipping / Delivery</span>
            <span style={{ fontWeight: '700', color: 'var(--success)' }}>Free</span>
          </div>

          <div className={`${styles['summary-row']} ${styles['summary-total']}`}>
            <span>Total Payable</span>
            <span style={{ color: 'var(--secondary)' }}>₹{totalPayable.toLocaleString()}</span>
          </div>

          {/* Payment Section */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={16} /> PAYMENT MODE
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
              <CheckCircle size={20} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                UPI / QR Payment
              </span>
            </div>
          </div>

          {/* Terms Agreement Checkboxes */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={agreeTC}
                onChange={(e) => setAgreeTC(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span>
                I agree to the{' '}
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyActiveTab('fishcare'); setShowPolicyModal(true); }}
                  style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Terms & Conditions
                </span>.
              </span>
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={agreeRefund}
                onChange={(e) => setAgreeRefund(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span>
                I understand the{' '}
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyActiveTab('cancellation'); setShowPolicyModal(true); }}
                  style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Cancellation & Refund Policy
                </span>.
              </span>
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={agreeFishCare}
                onChange={(e) => setAgreeFishCare(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span>
                I have read the{' '}
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyActiveTab('fishcare'); setShowPolicyModal(true); }}
                  style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Live Fish Care, Unboxing & Replacement Policy
                </span>{' '}
                and agree to follow all instructions.
              </span>
            </label>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={placingOrder || !courierService || !agreeTC || !agreeRefund || !agreeFishCare}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}
          >
            {placingOrder ? 'Processing Order...' : !courierService ? 'Select Courier Service' : 'Pay & Place Order'}
          </button>
        </aside>
      </form>

      {/* Custom UPI QR Payment Modal */}
      {showUpiModal && (
        <div className={styles['modal-overlay']} style={{ overflow: 'hidden' }}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '380px', padding: '1.2rem 1.5rem', textAlign: 'center', borderColor: 'var(--primary)', position: 'relative', overflow: 'hidden' }}>
            
            {/* Header / Expiration timer */}
            {paymentStep !== 'success' && paymentStep !== 'expired' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI QR PAYMENT</span>
                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: timerSeconds <= 30 ? 'var(--accent)' : 'var(--primary)', background: timerSeconds <= 30 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(2, 132, 199, 0.1)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.2rem', marginRight: '26px' }}>
                  ⏱️ {Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? '0' : ''}{timerSeconds % 60}
                </span>
              </div>
            )}

            {/* Step 1: Pay (QR Code display) */}
            {paymentStep === 'pay' && (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 0.6rem' }}>
                  Scan to pay exactly <strong style={{ color: 'var(--secondary)', fontSize: '0.95rem' }}>₹{activeOrderAmount.toLocaleString()}</strong>
                </p>

                {/* QR Code Container */}
                <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--border-color)', marginBottom: '0.6rem' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=tenaquarium457@oksbi&pn=TEN%20Aquarium&am=${activeOrderAmount}&cu=INR&tn=Order_${activeOrderId.slice(-6)}`)}`}
                    alt="UPI QR Code"
                    style={{ width: '140px', height: '140px', display: 'block' }}
                  />
                </div>

                <div style={{ background: 'rgba(14, 165, 233, 0.04)', padding: '0.6rem', borderRadius: '6px', marginBottom: '0.8rem', textAlign: 'left', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div>Payee Name: <strong>TEN Aquarium / Elavarasi</strong></div>
                </div>

                {/* Payment Proof Form */}
                <form onSubmit={handleSubmitProof} style={{ textAlign: 'left' }}>
                  <div className="form-group" style={{ marginBottom: '0.8rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
                      Upload Payment Screenshot
                    </label>
                    <label htmlFor="screenshot-upload" style={{ display: 'block', cursor: 'pointer' }}>
                      <div 
                        style={{
                          border: paymentProofImage ? '1.5px solid rgba(16, 185, 129, 0.45)' : '1.5px dashed rgba(2, 132, 199, 0.4)',
                          background: paymentProofImage ? 'rgba(16, 185, 129, 0.03)' : 'rgba(2, 132, 199, 0.03)',
                          color: paymentProofImage ? 'var(--success)' : 'var(--primary)',
                          borderRadius: '10px',
                          padding: '0.8rem',
                          textAlign: 'center',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          transition: 'all 0.25s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = paymentProofImage ? 'var(--success)' : 'var(--primary)';
                          e.currentTarget.style.background = paymentProofImage ? 'rgba(16, 185, 129, 0.06)' : 'rgba(2, 132, 199, 0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = paymentProofImage ? 'rgba(16, 185, 129, 0.45)' : 'rgba(2, 132, 199, 0.4)';
                          e.currentTarget.style.background = paymentProofImage ? 'rgba(16, 185, 129, 0.03)' : 'rgba(2, 132, 199, 0.03)';
                        }}
                      >
                        {paymentProofImage ? (
                          <>
                            <span style={{ fontSize: '1rem' }}>✓</span>
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                              {paymentProofFileName || 'Screenshot Uploaded'} (Change)
                            </span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: '1.05rem' }}>📁</span>
                            <span>Choose Screenshot Image</span>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      id="screenshot-upload"
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPaymentProofFileName(file.name);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPaymentProofImage(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {paymentProofImage && (
                    <div style={{ marginBottom: '0.8rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Screenshot Preview:</span>
                      <img 
                        src={paymentProofImage} 
                        style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '6px', border: '1px solid var(--border-color)', objectFit: 'contain' }} 
                        alt="Preview" 
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', height: '38px', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    Submit Payment Proof
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Submitting Proof */}
            {paymentStep === 'submitting' && (
              <div style={{ padding: '1rem 0' }}>
                <Loader message="Submitting payment proof details..." />
              </div>
            )}

            {/* Step 3: Waiting for Admin Approval */}
            {paymentStep === 'waiting' && (
              <div style={{ padding: '1rem 0' }}>
                <div className={styles['loader-spinner']} style={{ width: '32px', height: '32px', border: '3px solid rgba(2, 132, 199, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--primary)' }}>
                  Verifying Payment
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                  Screenshot proof submitted. The admin is verifying your transaction. Please do not close this website.
                </p>
                <div style={{ background: 'rgba(14, 165, 233, 0.04)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                  Time Remaining: <strong>{Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? '0' : ''}{timerSeconds % 60}</strong>
                </div>
              </div>
            )}

            {/* Step 4: Success Animation */}
            {paymentStep === 'success' && (
              <div style={{ padding: '1.5rem 0' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', margin: '0 auto 1rem' }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--success)' }}>
                  Payment Approved!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '0 1rem', margin: 0 }}>
                  Thank you! Your payment has been verified by <strong>TEN Aquarium</strong>. Your order is being processed.
                </p>
              </div>
            )}

            {/* Step 5: Expired / Cancelled */}
            {paymentStep === 'expired' && (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', margin: '0 auto 1rem' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>!</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--error)' }}>
                  {paymentRejectReason === 'admin' ? 'Order Failed (Payment Rejected)' : 'Order Failed (Payment Timeout)'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
                  {paymentRejectReason === 'admin' 
                    ? 'The admin has verified and rejected your submitted payment proof. The order has been cancelled.' 
                    : 'The 2-minute payment window has closed. Your order was not verified and has been cancelled.'}
                </p>
                <button
                  onClick={() => {
                    setShowUpiModal(false);
                    setPaymentStep('pay');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.6rem', height: '38px', fontSize: '0.9rem' }}
                >
                  Return to Payment
                </button>
              </div>
            )}

            {/* Cancel / Close button for active steps */}
            {paymentStep !== 'success' && paymentStep !== 'expired' && (
              <button
                onClick={() => setShowCancelConfirmModal(true)}
                className={styles['modal-close']}
                title="Cancel Payment"
              >
                &times;
              </button>
            )}

          </div>
        </div>
      )}

      {/* Beautiful custom styled cancel confirmation modal */}
      {showCancelConfirmModal && (
        <div className={styles['modal-overlay']} style={{ zIndex: 100000 }}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '350px', padding: '1.8rem', textAlign: 'center', borderColor: 'rgba(244, 63, 94, 0.4)', position: 'relative', overflow: 'hidden' }}>
            
            {/* Pulsing Alert SVG Icon */}
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', boxShadow: '0 0 20px rgba(244, 63, 94, 0.1)' }}>
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(-1px)' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.6rem', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Cancel Payment?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.6rem', lineHeight: '1.45', padding: '0 0.5rem' }}>
              Are you sure you want to cancel this payment request? Your pending order will be cancelled immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={async () => {
                  setShowCancelConfirmModal(false);
                  setShowUpiModal(false);
                  setPaymentStep('pay');
                  await handlePaymentExpired();
                }}
                className="btn"
                style={{ 
                  flex: 1, 
                  padding: '0.6rem', 
                  fontSize: '0.85rem', 
                  height: '38px', 
                  background: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', 
                  color: '#ffffff', 
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowCancelConfirmModal(false)}
                className="btn btn-primary"
                style={{ 
                  flex: 1, 
                  padding: '0.6rem', 
                  fontSize: '0.85rem', 
                  height: '38px',
                  borderRadius: '10px',
                  fontWeight: '700'
                }}
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unboxing & Cancellation Policy Modal */}
      {showPolicyModal && (
        <div style={{ zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ maxWidth: '650px', width: '90%', padding: '2rem', borderRadius: '24px', position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--glass-shadow)', maxHeight: '85vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowPolicyModal(false)}
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>

            {/* Tab Buttons */}
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
                onClick={() => setShowPolicyModal(false)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.88rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
