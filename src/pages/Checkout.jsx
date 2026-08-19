import React, { useEffect, useState } from 'react';
import styles from './Checkout.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import api from '../utils/api';
import { CreditCard, CheckCircle, MapPin, AlertCircle, Sparkles, Truck, QrCode, Smartphone, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [dealers, setDealers] = useState([]);
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

  // Direct checkout & courier selection states
  const directBuyItem = location.state?.directBuyItem || null;
  const [areasList, setAreasList] = useState([]);
  const [area, setArea] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [hasAltPhone, setHasAltPhone] = useState(false);
  const [altPhone, setAltPhone] = useState('');
  const [showLiveRestrictionModal, setShowLiveRestrictionModal] = useState(false);
  const [showAddressConfirmationModal, setShowAddressConfirmationModal] = useState(false);

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
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyActiveTab, setPolicyActiveTab] = useState('fishcare');
  
  // Courier & Delivery Calculations
  const [dealerInfo, setDealerInfo] = useState(null);
  const [courierService, setCourierService] = useState('');
  const [totalWeight, setTotalWeight] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  
  // Dynamic API rates states
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
        const isPair = (prod.productName || '').toLowerCase().includes('pair');
        itemWeight = isPair ? 0.28 : 0.14;
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
    const fetchCartOrDirectItem = async () => {
      try {
        // Fetch public dealers to check discounts
        const dealersRes = await api.get('/dealers/approved/public');
        setDealers(dealersRes.data);

        if (directBuyItem) {
          // Wrap in cart-like structure
          const mockCart = {
            products: [
              {
                productId: directBuyItem.productId,
                quantity: directBuyItem.quantity
              }
            ]
          };
          setCart(mockCart);

          // Calculate weight
          const weight = calculateCartWeight(mockCart.products);
          setTotalWeight(weight);

          // Fetch dealer details for this direct-buy product
          const dealerId = directBuyItem.productId.dealerId?._id || directBuyItem.productId.dealerId;
          const prodRes = await api.get(`/products/${directBuyItem.productId._id}`);
          if (prodRes.data && prodRes.data.dealerInfo) {
            setDealerInfo(prodRes.data.dealerInfo);
          } else if (dealerId) {
            // fallback
            setDealerInfo({ userId: dealerId, address: 'Salem, Tamil Nadu' });
          }
        } else {
          // Standard cart checkout flow
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
            const firstProd = res.data.products[0].productId;
            if (firstProd && firstProd._id) {
              const prodRes = await api.get(`/products/${firstProd._id}`);
              if (prodRes.data && prodRes.data.dealerInfo) {
                setDealerInfo(prodRes.data.dealerInfo);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching cart or direct buy item', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCartOrDirectItem();
  }, [navigate, directBuyItem]);

  // Consolidated Pincode and Professional Courier Checker
  useEffect(() => {
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!zip) {
      setIsZipValid(false);
      setZipError('');
      setCity('');
      setState('');
      setAreasList([]);
      setArea('');
      setAvailableQuotes([]);
      setCourierService('');
      setDeliveryCharge(0);
      setCourierError('');
      return;
    }

    if (!pinRegex.test(zip)) {
      setIsZipValid(false);
      setZipError('Format must be 6 digits (cannot start with 0).');
      setCity('');
      setState('');
      setAreasList([]);
      setArea('');
      setAvailableQuotes([]);
      setCourierService('');
      setDeliveryCharge(0);
      setCourierError('');
      return;
    }

    const checkPincodeAndCourier = async () => {
      setZipLoading(true);
      setZipError('');
      setCourierError('');
      try {
        const res = await api.post('/courier/check-availability', {
          deliveryPincode: zip,
          dealerId: dealerInfo?._id || dealerInfo?.userId?._id || dealerInfo?.userId,
          weight: totalWeight
        });

        if (res.data.success) {
          setIsZipValid(true);
          setZipError('');
          setCity(res.data.district || '');
          setState(res.data.state || '');
          setAreasList(res.data.areas || []);
          // Prefill first area
          setArea(res.data.areas && res.data.areas[0] ? res.data.areas[0] : '');
          
          setAvailableQuotes(res.data.quotes || []);
          if (res.data.quotes && res.data.quotes.length > 0) {
            setCourierService(res.data.courierName || 'Standard Shipping');
            setDeliveryCharge(res.data.quotes[0].finalAmount);
          } else {
            setCourierService('Standard Shipping');
            setDeliveryCharge(0);
          }
        } else {
          setIsZipValid(false);
          setZipError(res.data.message || 'Standard Shipping is not available for this pincode.');
          setCity('');
          setState('');
          setAreasList([]);
          setArea('');
          setAvailableQuotes([]);
          setCourierService('');
          setDeliveryCharge(0);
        }
      } catch (err) {
        console.error('Error verifying pincode/courier', err);
        setZipError('Verification failed. Please try again.');
        setIsZipValid(false);
      } finally {
        setZipLoading(false);
      }
    };

    if (dealerInfo && totalWeight >= 0) {
      checkPincodeAndCourier();
    }
  }, [zip, dealerInfo, totalWeight]);

  const handleRemoveLiveItems = async () => {
    setShowAddressConfirmationModal(false);
    if (!cart || !cart.products) return;

    const liveItems = cart.products.filter(item => 
      item.productId && (item.productId.category === 'Aquarium Fish' || item.productId.category === 'Aquarium Plants')
    );

    try {
      setPlacingOrder(true);
      for (const item of liveItems) {
        const prodId = item.productId._id || item.productId;
        const colorVal = item.color || '';
        await api.delete(`/cart/${prodId}?color=${colorVal}`);
      }

      // Update local cart state
      const updatedProducts = cart.products.filter(item => 
        !(item.productId && (item.productId.category === 'Aquarium Fish' || item.productId.category === 'Aquarium Plants'))
      );

      setCart(prev => ({ ...prev, products: updatedProducts }));
      
      // Dispatch global cart-updated event for header count update
      window.dispatchEvent(new Event('cart-updated'));

      alert("Ineligible live items (fish and plants) have been successfully removed from your cart. Please review your updated order summary and proceed.");
    } catch (err) {
      console.error("Error removing live items from cart:", err);
      alert("Failed to remove live items from cart automatically. Please remove them manually.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Indian PIN code validation check
    if (!isZipValid) {
      alert(zipError || 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!courierService) {
      alert('Please select a courier service to calculate shipping.');
      return;
    }

    // Minimum quantity validation check
    if (cart && cart.products) {
      for (const item of cart.products) {
        const minQty = item.productId?.minQuantity || 2;
        if (item.quantity < minQty) {
          alert(`Minimum order quantity for ${item.productId?.productName || 'product'} is ${minQty}. Please purchase at least ${minQty} items.`);
          return;
        }
      }
    }

    // North states live shipment validation
    const southStates = ['tamil nadu', 'tamilnadu', 'kerala', 'karnataka', 'andhra pradesh', 'telangana', 'puducherry', 'pondicherry', 'goa'];
    const shippingStateClean = (state || '').toLowerCase().replace(/\s+/g, '');
    const isSouthState = southStates.some(s => shippingStateClean.includes(s.replace(/\s+/g, '')));

    if (!isSouthState && cart && cart.products) {
      const hasLiveShipment = cart.products.some(item => 
        item.productId && (item.productId.category === 'Aquarium Fish' || item.productId.category === 'Aquarium Plants')
      );
      if (hasLiveShipment) {
        setShowLiveRestrictionModal(true);
        return;
      }
    }

    // Policy Checkbox validation
    if (!policyAccepted) {
      alert('You must read and agree to the Cancellation & Refund Policy and Live Fish Care Guide to place an order.');
      return;
    }

    setPlacingOrder(true);

    const shippingAddress = { 
      address: `${address}, Area: ${area}`, 
      city, 
      state, 
      zip, 
      phone: hasAltPhone && altPhone ? `${phone} / ${altPhone}` : phone 
    };

    try {
      const res = await api.post('/orders', {
        cartItems: cart.products,
        shippingAddress,
        paymentMethod,
        courierService,
        deliveryCharge,
        policyAccepted: true,
        isDirectBuy: !!directBuyItem
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
    if (showUpiModal || showCancelConfirmModal || showPolicyModal || showLiveRestrictionModal || showAddressConfirmationModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUpiModal, showCancelConfirmModal, showPolicyModal, showLiveRestrictionModal, showAddressConfirmationModal]);

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

  const getDealerOffer = (dealerId) => {
    const dealer = dealers.find(d => (d.userId?._id || d.userId || '').toString() === (dealerId || '').toString());
    return dealer ? {
      discountPercentage: dealer.discountPercentage || 0,
      customOfferText: dealer.customOfferText || '',
    } : { discountPercentage: 0, customOfferText: '' };
  };

  const getSubtotalWithOffers = () => {
    let sub = 0;
    items.forEach(item => {
      const prod = item.productId;
      if (!prod) return;

      const offer = getDealerOffer(prod.dealerId);
      const discount = offer.discountPercentage;
      const customOfferText = offer.customOfferText || '';

      const unitPrice = prod.price;
      const discountedUnitPrice = discount > 0 ? unitPrice * (1 - discount / 100) : unitPrice;

      let itemCost = discountedUnitPrice * item.quantity;

      // Buy 3 Get 1 Free Promo check
      const isBuy3Get1 = customOfferText.toLowerCase().includes('buy 3 get 1') || customOfferText.toLowerCase().includes('buy3 get1');
      if (isBuy3Get1 && item.quantity >= 3) {
        const freeCount = Math.floor(item.quantity / 3);
        const billedQty = item.quantity - freeCount;
        itemCost = discountedUnitPrice * billedQty;
      }

      sub += itemCost;
    });
    return sub;
  };

  const subtotal = getSubtotalWithOffers();
  const packingCharge = 59;
  const totalPayable = subtotal + packingCharge + (deliveryCharge || 0);

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
                readOnly
                value={city}
                className="form-control"
                style={{ background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
                placeholder="District (auto-filled)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                required
                readOnly
                value={state}
                className="form-control"
                style={{ background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' }}
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
                  Verifying PIN code & checking courier...
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
              <label className="form-label">Area / Location</label>
              <select
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={!isZipValid || areasList.length === 0}
                className="form-control"
                style={(!isZipValid || areasList.length === 0) ? { background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed' } : {}}
              >
                <option value="">{(!isZipValid || areasList.length === 0) ? 'Enter Pincode first' : '-- Select Area --'}</option>
                {areasList.map((a, idx) => (
                  <option key={idx} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="form-control"
                placeholder="10-digit number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Add Alternative Phone?</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', height: '38px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="hasAltPhone"
                    checked={hasAltPhone}
                    onChange={() => setHasAltPhone(true)}
                  />
                  Yes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="radio"
                    name="hasAltPhone"
                    checked={!hasAltPhone}
                    onChange={() => {
                      setHasAltPhone(false);
                      setAltPhone('');
                    }}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          {hasAltPhone && (
            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Alternative Phone Number</label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="form-control"
                placeholder="10-digit alternative number"
              />
            </div>
          )}

          {/* Courier Service Section */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Truck size={18} />
              SHIPPING INFORMATION
            </h4>

            {courierLoading && (
              <span style={{ color: 'var(--primary)', fontSize: '0.88rem' }}>Calculating shipping charges...</span>
            )}

            {courierError && (
              <div style={{ color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 'bold' }}>
                ⚠️ {courierError}
              </div>
            )}

            {!zip && !courierLoading && !courierError && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Please enter your Pincode above to calculate shipping.
              </div>
            )}

            {isZipValid && !courierLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <div><strong>Total Weight:</strong> {totalWeight.toFixed(2)} kg</div>
                <div><strong>Shipping Rate:</strong> {((state || '').toLowerCase().replace(/\s+/g, '').includes('tamilnadu') || (state || '').toLowerCase().replace(/\s+/g, '') === 'tn') ? '₹50/kg (Tamil Nadu base)' : '₹150/kg (Other States base)'}</div>
                {availableQuotes && availableQuotes.length > 0 ? (
                  <div className="form-group" style={{ margin: '0.4rem 0 0 0' }}>
                    <label className="form-label" style={{ marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select Delivery Courier:</label>
                    <select
                      value={courierService}
                      onChange={(e) => {
                        const selected = availableQuotes.find(q => q.courierName === e.target.value);
                        if (selected) {
                          setCourierService(selected.courierName);
                          setDeliveryCharge(selected.finalAmount);
                        }
                      }}
                      className="form-control"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                    >
                      {availableQuotes.map((q, idx) => (
                        <option key={idx} value={q.courierName} style={{ background: '#1e293b' }}>
                          {q.courierName} - ₹{q.finalAmount} [Est: {q.estDays} days]
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '0.5rem' }}>
                    Shipping Charge: ₹{deliveryCharge}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Summary Panel */}
        <aside className={`glass-panel ${styles['checkout-summary']}`}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Items Ordered
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {items.map((item) => {
              const prod = item.productId;
              if (!prod) return null;
              
              const offer = getDealerOffer(prod.dealerId);
              const discount = offer.discountPercentage;
              const customOfferText = offer.customOfferText || '';

              const unitPrice = prod.price;
              const discountedUnitPrice = discount > 0 ? unitPrice * (1 - discount / 100) : unitPrice;

              let itemCost = discountedUnitPrice * item.quantity;
              let promoText = '';

              const isBuy3Get1 = customOfferText.toLowerCase().includes('buy 3 get 1') || customOfferText.toLowerCase().includes('buy3 get1');
              if (isBuy3Get1 && item.quantity >= 3) {
                const freeCount = Math.floor(item.quantity / 3);
                const billedQty = item.quantity - freeCount;
                itemCost = discountedUnitPrice * billedQty;
                promoText = `(Buy 3 Get 1: ${freeCount} Free)`;
              }

              return (
                <div key={item._id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '220px' }} title={prod.productName}>
                      {prod.productName} x {item.quantity}
                    </span>
                    <span style={{ fontWeight: '600' }}>₹{itemCost.toLocaleString()}</span>
                  </div>
                  {(discount > 0 || promoText) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#10b981' }}>
                      <span>
                        {discount > 0 ? `${discount}% Dealer Discount` : ''} {promoText}
                      </span>
                      {discount > 0 && <s style={{ color: '#ef4444' }}>₹{(prod.price * item.quantity).toLocaleString()}</s>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles['summary-row']}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>

          <div className={styles['summary-row']}>
            <span style={{ color: 'var(--text-secondary)' }}>Packing Charge</span>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹59</span>
          </div>

          <div className={styles['summary-row']}>
            <span style={{ color: 'var(--text-secondary)' }}>Shipping / Delivery</span>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
              {deliveryCharge > 0 ? `₹${deliveryCharge.toLocaleString()}` : 'Free'}
            </span>
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

          {/* Terms Agreement Checkbox */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span>
                I have read and agree to the{' '}
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyActiveTab('cancellation'); setShowPolicyModal(true); }}
                  style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Cancellation & Refund Policy
                </span>{' '}
                and{' '}
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPolicyActiveTab('fishcare'); setShowPolicyModal(true); }}
                  style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  Live Fish Care Guide
                </span>{' '}
                of TEN Aquarium.
              </span>
            </label>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={placingOrder || !courierService || !policyAccepted || zipLoading || !!zipError || !isZipValid || !area}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '1.5rem' }}
          >
            {placingOrder ? 'Processing Order...' : !isZipValid ? 'Enter Pincode to Calculate Shipping' : 'Pay & Place Order'}
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
                  Payment processing please wait...
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

      {/* Live Restriction Modal */}
      {showLiveRestrictionModal && (
        <div className={styles['modal-overlay']} style={{ zIndex: 100001 }}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center', borderColor: 'var(--accent)', position: 'relative' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
              <AlertCircle size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
              Live Shipment Restriction
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.8rem', lineHeight: '1.5' }}>
              Live fish and plants cannot be shipped to North India or other countries due to transport limits and extended transit times.
            </p>
            <button
              onClick={() => {
                setShowLiveRestrictionModal(false);
                setShowAddressConfirmationModal(true);
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.6rem', fontWeight: 'bold' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Address Confirmation Modal */}
      {showAddressConfirmationModal && (
        <div className={styles['modal-overlay']} style={{ zIndex: 100002 }}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '400px', padding: '2rem', textAlign: 'center', borderColor: 'var(--primary)', position: 'relative' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
              <MapPin size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
              Are you sure about your address?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.8rem', lineHeight: '1.5' }}>
              Click <strong>"Yes"</strong> to change/edit your address to a South India destination, or click <strong>"No"</strong> to automatically remove all live fish and plants and continue.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  setShowAddressConfirmationModal(false);
                  const zipInput = document.querySelector('input[placeholder="e.g. 641001"]');
                  if (zipInput) zipInput.focus();
                }}
                className="btn"
                style={{ flex: 1, padding: '0.6rem', fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes (Edit)
              </button>
              <button
                onClick={handleRemoveLiveItems}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.6rem', fontWeight: 'bold' }}
              >
                No (Remove)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
