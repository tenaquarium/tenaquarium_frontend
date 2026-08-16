import React, { useEffect, useState } from 'react';
import styles from './Cart.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Loader from '../components/Loader';
import api from '../utils/api';
import { useAlert } from '../context/AlertContext';

const Cart = () => {
  const navigate = useNavigate();
  const { showConfirm } = useAlert();
  const [cart, setCart] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCartAndDealers = async () => {
    try {
      const cartRes = await api.get('/cart');
      setCart(cartRes.data);
      
      const dealersRes = await api.get('/dealers/approved/public');
      setDealers(dealersRes.data);
    } catch (error) {
      console.error('Error fetching cart details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndDealers();
  }, []);

  const handleQuantityChange = async (productId, newQty) => {
    try {
      const res = await api.put('/cart', { productId, quantity: newQty });
      setCart(res.data);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      setCart(res.data);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      alert('Failed to remove item.');
    }
  };

  const handleClearCart = async () => {
    const confirm = await showConfirm('Are you sure you want to empty your cart?');
    if (confirm) {
      try {
        await api.delete('/cart');
        setCart({ products: [] });
        window.dispatchEvent(new Event('cart-updated'));
      } catch (error) {
        alert('Failed to clear cart.');
      }
    }
  };

  const getDealerOffer = (dealerId) => {
    const dealer = dealers.find(d => (d.userId?._id || d.userId || '').toString() === (dealerId || '').toString());
    return dealer ? {
      discountPercentage: dealer.discountPercentage || 0,
      customOfferText: dealer.customOfferText || '',
      businessName: dealer.businessName
    } : { discountPercentage: 0, customOfferText: '' };
  };

  if (loading) {
    return <Loader message="Loading your cart items..." />;
  }

  const items = cart?.products || [];

  const getCartTotals = () => {
    let total = 0;
    const itemsWithOffers = items.map(item => {
      const prod = item.productId;
      if (!prod) return null;

      const offer = getDealerOffer(prod.dealerId);
      const discount = offer.discountPercentage;
      const customOfferText = offer.customOfferText || '';
      
      const unitPrice = prod.price;
      const discountedUnitPrice = discount > 0 ? unitPrice * (1 - discount / 100) : unitPrice;
      
      let itemSubtotal = discountedUnitPrice * item.quantity;
      let promoAppliedText = '';
      
      // Buy 3 Get 1 Free Check
      const isBuy3Get1 = customOfferText.toLowerCase().includes('buy 3 get 1') || customOfferText.toLowerCase().includes('buy3 get1');
      if (isBuy3Get1 && item.quantity >= 3) {
        const freeCount = Math.floor(item.quantity / 3);
        const billedQty = item.quantity - freeCount;
        itemSubtotal = discountedUnitPrice * billedQty;
        promoAppliedText = `🎉 Buy 3 Get 1 Free Applied! ${freeCount} item${freeCount > 1 ? 's' : ''} free (Saved ₹${(discountedUnitPrice * freeCount).toLocaleString()})`;
      } else if (isBuy3Get1 && item.quantity === 2) {
        promoAppliedText = `💡 Add 1 more to get 1 Free!`;
      }
      
      total += itemSubtotal;
      return {
        ...item,
        discount,
        discountedUnitPrice,
        itemSubtotal,
        promoAppliedText,
        isBuy3Get1
      };
    }).filter(Boolean);

    return { itemsWithOffers, total };
  };

  const { itemsWithOffers, total } = getCartTotals();

  if (items.length === 0) {
    return (
      <div className="main-content" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.8rem' }}>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Browse our catalog for beautiful fish, aquascaping decorations, tanks, and high-quality food.
          </p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: '3rem 5%' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '2rem' }}>Your Shopping Cart</h1>

      <div className={styles['cart-layout']}>
        {/* Left: Cart Items List */}
        <div className={styles['cart-items-panel']}>
          {itemsWithOffers.map((item) => {
            const prod = item.productId;
            if (!prod) return null;

            const minQty = prod.minQuantity || 2;

            return (
              <div key={item._id} className={`glass-panel ${styles['cart-item']}`}>
                <img
                  src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500'}
                  alt={prod.productName}
                  className={styles['cart-item-img']}
                />
                
                <div className={styles['cart-item-details']}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>{prod.category}</span>
                  <Link to={`/products/${prod._id}`} className={styles['cart-item-name']}>
                    {prod.productName}
                  </Link>
                  <div>
                    {item.discount > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <s style={{ color: '#ef4444', fontSize: '0.8rem' }}>₹{prod.price.toLocaleString()}</s>
                        <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>₹{item.discountedUnitPrice.toLocaleString()}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                          {item.discount}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className={styles['cart-item-price']}>₹{prod.price.toLocaleString()}</span>
                    )}
                  </div>
                  
                  {item.promoAppliedText && (
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: item.promoAppliedText.includes('🎉') ? '#10b981' : 'var(--warning)', marginTop: '4px' }}>
                      {item.promoAppliedText}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div className={styles['qty-selector']}>
                    <button
                      onClick={() => handleQuantityChange(prod._id, item.quantity - 1)}
                      disabled={item.quantity <= minQty}
                      className={styles['qty-btn']}
                      title={`Minimum order quantity is ${minQty}`}
                    >
                      -
                    </button>
                    <span className={styles['qty-val']}>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(prod._id, item.quantity + 1)}
                      disabled={item.quantity >= prod.stock}
                      className={styles['qty-btn']}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Min: {minQty}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subtotal:</span>
                  <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>₹{item.itemSubtotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleRemoveItem(prod._id)}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', alignItems: 'center', padding: '1.2rem 1.8rem', borderRadius: '16px' }}>
            <div>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Total Amount:</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginLeft: '0.6rem', fontWeight: '800' }}>₹{total.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <button onClick={() => navigate('/products')} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                Continue Shopping
              </button>
              <button onClick={handleClearCart} className="btn btn-secondary" style={{ color: 'var(--accent)', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                Clear Cart
              </button>
              <button onClick={() => navigate('/payment')} className="btn btn-primary" style={{ padding: '0.6rem 1.6rem', fontSize: '0.9rem', fontWeight: '700' }}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
