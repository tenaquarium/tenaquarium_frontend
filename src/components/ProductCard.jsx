import  { useState, useEffect } from 'react';
import styles from './ProductCard.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  useEffect(() => {
    // Check if product is in local wishlist
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.includes(product._id));

    const handleWishlistUpdate = () => {
      const updatedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(updatedWishlist.includes(product._id));
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [product._id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (wishlist.includes(product._id)) {
      wishlist = wishlist.filter(id => id !== product._id);
    } else {
      wishlist.push(product._id);
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer' && user.role !== 'dealer') {
      alert('Only customers and dealers can purchase products.');
      return;
    }

    const sellerId = product.dealerId?._id || product.dealerId;
    if (user.role === 'dealer' && sellerId && sellerId.toString() === user._id.toString()) {
      alert('You cannot buy your own products.');
      return;
    }

    setLoadingCart(true);
    try {
      await api.post('/cart', {
        productId: product._id,
        quantity: product.minQuantity || 2
      });
      // Fire cart update event for Navbar
      window.dispatchEvent(new Event('cart-updated'));
      alert(`${product.productName} added to cart! (Minimum quantity: ${product.minQuantity || 2} items)`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer' && user.role !== 'dealer') {
      alert('Only customers and dealers can purchase products.');
      return;
    }

    const sellerId = product.dealerId?._id || product.dealerId;
    if (user.role === 'dealer' && sellerId && sellerId.toString() === user._id.toString()) {
      alert('You cannot buy your own products.');
      return;
    }

    // Direct checkout with minQuantity
    navigate('/payment', {
      state: {
        directBuyItem: {
          productId: product,
          quantity: product.minQuantity || 2
        }
      }
    });
  };

  const offer = product.dealerOffer;
  const discount = offer ? offer.discountPercentage : 0;
  const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;

  return (
    <div className={`glass-panel ${styles['product-card']}`}>
      <div className={styles['product-image-wrapper']}>
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500'}
            alt={product.productName}
            className={styles['product-img']}
            loading="lazy"
            decoding="async"
          />
        </Link>
        <button
          className={`${styles['wishlist-btn']} ${isInWishlist ? styles['active'] : ''}`}
          onClick={toggleWishlist}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className={styles['product-info']}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span className={styles['product-cat']} style={{ fontSize: '0.7rem', margin: 0 }}>{product.category}</span>
          <div className={styles['product-rating']} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', margin: 0, fontSize: '0.75rem' }}>
            <Star size={12} fill="currentColor" />
            <span>{product.averageRating ? product.averageRating.toFixed(1) : '0.0'}</span>
          </div>
        </div>

        <Link to={`/products/${product._id}`} className={styles['product-name-link']} style={{ fontSize: '0.95rem', fontWeight: '800', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
          {product.productName}
        </Link>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Seller: {product.dealerId?.name || 'Verified Store'}
        </span>

        <div className={styles['product-footer']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 0 }}>
          <div>
            {discount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <s style={{ color: '#ef4444', fontSize: '0.8rem' }}>₹{product.price.toLocaleString()}</s>
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                    {discount}% OFF
                  </span>
                </div>
                <span className={styles['product-price']} style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981' }}>₹{finalPrice.toLocaleString()}</span>
              </div>
            ) : (
              <span className={styles['product-price']} style={{ fontSize: '1rem', fontWeight: '800' }}>₹{product.price.toLocaleString()}</span>
            )}
          </div>
          {product.stock > 0 ? (
            <span className={`${styles['stock-status']} ${styles['stock-in']}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>In ({product.stock})</span>
          ) : (
            <span className={`${styles['stock-status']} ${styles['stock-out']}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Out of Stock</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', marginTop: '2px' }}>
          <span>Min. Order: {product.minQuantity || 2} pcs</span>
        </div>

        {offer?.customOfferText && (
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', marginTop: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={offer.customOfferText}>
            🏷️ {offer.customOfferText}
          </div>
        )}

        {product.stock > 0 && (!user || user.role === 'customer' || (user.role === 'dealer' && (product.dealerId?._id || product.dealerId)?.toString() !== user._id.toString())) && (
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.4rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={loadingCart}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', gap: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ShoppingCart size={12} />
              {loadingCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Buy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
