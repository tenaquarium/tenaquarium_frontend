import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import api from '../utils/api';
import { Star, ShoppingCart, Info, Award, Heart, MessageSquare, User, Phone, Mail, MapPin, Store } from 'lucide-react';
import styles from './ProductDetails.module.css';
import ProductCard from '../components/ProductCard';


const getDistrictFromAddress = (address) => {
  if (!address) return '';
  const parts = address.split(',');
  const lastPart = parts[parts.length - 1].trim();
  const cleanPart = lastPart.split('-')[0].trim();
  const district = cleanPart.replace(/\d+/g, '').trim();
  return district;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [dealerReviews, setDealerReviews] = useState([]);
  const [dealerProducts, setDealerProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Review form states
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const prodRes = await api.get(`/products/${id}`);
        const productData = prodRes.data;
        setProduct(productData);
        setQuantity(productData.minQuantity || 2);
        
        const revRes = await api.get(`/reviews/product/${id}`);
        setReviews(revRes.data);

        // Fetch all reviews for this vendor
        const sellerId = productData.dealerId?._id || productData.dealerId;
        if (sellerId) {
          const dealerRevRes = await api.get(`/reviews/dealer/${sellerId}`);
          setDealerReviews(dealerRevRes.data);
        }

        // Fetch other products belonging to this dealer
        if (productData.dealerInfo && productData.dealerInfo._id) {
          const dealerProfileRes = await api.get(`/dealers/${productData.dealerInfo._id}/public`);
          if (dealerProfileRes.data && dealerProfileRes.data.products) {
            setDealerProducts(dealerProfileRes.data.products.filter(p => p._id !== id));
          }
        }
      } catch (error) {
        console.error('Error fetching product details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();

    // Wishlist check
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.includes(id));
  }, [id]);

  const toggleWishlist = () => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (wishlist.includes(id)) {
      wishlist = wishlist.filter((item) => item !== id);
      setIsInWishlist(false);
    } else {
      wishlist.push(id);
      setIsInWishlist(true);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleQtyChange = (val) => {
    const minQty = product?.minQuantity || 2;
    const newQty = quantity + val;
    if (newQty >= minQty && newQty <= (product?.stock || minQty)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
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

    setAddingToCart(true);
    try {
      await api.post('/cart', {
        productId: product._id,
        quantity,
      });
      window.dispatchEvent(new Event('cart-updated'));
      alert(`Successfully added ${quantity} ${product.productName} to cart!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);

    try {
      const res = await api.post('/reviews', {
        productId: product._id,
        rating: newRating,
        review: newReview,
      });

      // Reload reviews
      const revRes = await api.get(`/reviews/product/${id}`);
      setReviews(revRes.data);

      // Reload product details (to refresh average rating & total reviews)
      const prodRes = await api.get(`/products/${id}`);
      setProduct(prodRes.data);

      setNewReview('');
      alert('Thank you! Your review has been submitted and is pending admin approval.');
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader message="Gathering specifications..." />;
  }

  if (!product) {
    return (
      <div className="main-content" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.productDetailsContainer} product-details-container`}>
      {/* Left Column: Vendor Details (Styled like Contact Details on Contact page) & Reviews */}
      <div className={`${styles.detailsLeftColumn} details-left-column`}>
        {/* Vendor Details Card */}
        {product.dealerInfo && (
          <div className={`glass-panel details-vendor-panel ${styles.detailsVendorPanel}`}>
            <h2 className={`info-title ${styles.vendorCardTitle}`}>
              Vendor Details
            </h2>
            
            {/* Top row: Logo on left, Shop details on right */}
            <div className={styles.vendorHeaderRow}>
              {/* Logo / Avatar (Left) */}
              <div className={`${styles.vendorLogoWrapper} vendor-logo-wrapper`}>
                <span className={styles.vendorLogoFallback}>
                  {product.dealerInfo.businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Shop Name & District (Right) */}
              <div className={styles.vendorShopInfo}>
                <h4 className={styles.vendorShopName}>
                  {product.dealerInfo.businessName}
                </h4>
                <p className={styles.vendorShopDistrict}>
                  District: {getDistrictFromAddress(product.dealerInfo.address)}
                </p>
                {product.dealerInfo.description && (
                  <p className={styles.vendorShopDescription}>
                    {product.dealerInfo.description}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom section: Vendor Reviews inside the same card */}
            <div className={styles.vendorReviewsSection}>
              <h3 className={styles.reviewsTitle}>
                <MessageSquare size={16} />
                Reviews ({dealerReviews.length})
              </h3>
              
              <div className={`${styles.reviewsScrollList} reviews-scroll-list`}>
                {dealerReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '0.5rem', fontSize: '0.85rem' }}>
                    No reviews yet.
                  </div>
                ) : (
                  dealerReviews.map((rev) => (
                    <div key={rev._id} className={styles.reviewItem}>
                      <div className={styles.reviewItemHeader}>
                        <div>
                          <span className={styles.reviewAuthorName}>
                            {rev.source === 'google' ? rev.authorName : (rev.customerId?.name || 'Verified Buyer')}
                          </span>
                          <span className={styles.reviewProductName}>
                            on {rev.productId?.productName || 'product'}
                          </span>
                        </div>
                        <div className={styles.reviewRatingStars}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={8} fill={i < rev.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <p className={styles.reviewComment}>"{rev.review}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Product details (Styled like the Send Message Form box with horizontal split) */}
      <div className={`glass-panel details-info-panel ${styles.detailsInfoPanel}`}>
        <div className={styles.productDetailsSplit}>
          
          {/* Left half: Product Image */}
          <div className={styles.productDetailsImageWrapper} style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '280px', aspectRatio: '1/1', borderRadius: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
              <img
                src={product.images && product.images[activeImageIndex] ? product.images[activeImageIndex] : 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600'}
                alt={product.productName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
              />
            </div>
            {/* Image gallery thumbnails */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {product.images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2.5px solid var(--primary)' : '1px solid rgba(2, 132, 199, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: '#ffffff',
                      boxShadow: activeImageIndex === idx ? '0 2px 8px rgba(2, 132, 199, 0.2)' : 'none',
                      transform: activeImageIndex === idx ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (activeImageIndex !== idx) {
                        e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.6)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeImageIndex !== idx) {
                        e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Thumb ${idx}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right half: Product Info details */}
          <div className={styles.productDetailsInfoColumn}>
            <h1 className={styles.productNameHeading}>
              {product.productName}
            </h1>

            {/* Rating */}
            <div className={styles.productRatingRow}>
              <div className={styles.productRatingBadge}>
                <Star size={18} fill="currentColor" />
                <span className={styles.productRatingValue}>
                  {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              <span className={styles.productRatingDivider}>|</span>
              <span className={styles.productRatingCount}>
                {product.totalReviews || 0} customer reviews
              </span>
            </div>

            {(() => {
              const discount = product?.dealerInfo?.discountPercentage || 0;
              const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
              const customOffer = product?.dealerInfo?.customOfferText || '';
              return (
                <>
                  {discount > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <s style={{ color: '#ef4444', fontSize: '1.1rem' }}>₹{product.price.toLocaleString()}</s>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                          {discount}% OFF
                        </span>
                      </div>
                      <div className={`details-price ${styles.productPrice}`} style={{ color: '#10b981', fontSize: '2rem', margin: 0 }}>
                        ₹{finalPrice.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className={`details-price ${styles.productPrice}`}>₹{product.price.toLocaleString()}</div>
                  )}

                  {customOffer && (
                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.2rem', textTransform: 'uppercase' }}>
                      🏷️ Offer: {customOffer}
                    </div>
                  )}
                </>
              );
            })()}

            <p className={`details-desc ${styles.productDesc}`}>{product.description}</p>

            <div className={`details-meta-row ${styles.detailsMetaRow}`}>
              <div>
                <span className={`details-meta-label ${styles.detailsMetaLabel}`}>Stock Status: </span>
                {product.stock > 0 ? (
                  <span className={`stock-status stock-in ${styles.stockStatus} ${styles.stockIn}`}>
                    In Stock ({product.stock})
                  </span>
                ) : (
                  <span className={`stock-status stock-out ${styles.stockStatus} ${styles.stockOut}`}>
                    Out of Stock
                  </span>
                )}
              </div>

              <div>
                <span className={`details-meta-label ${styles.detailsMetaLabel}`}>Category: </span>
                <span className={styles.categoryValue}>{product.category}</span>
              </div>
            </div>

            {/* Purchase Controls */}
            {product.stock > 0 && !(user && user.role === 'dealer' && (product.dealerId?._id || product.dealerId)?.toString() === user._id.toString()) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', width: '100%' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Minimum Order Quantity: <strong>{product.minQuantity || 2} items</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                    <button 
                      type="button"
                      onClick={() => handleQtyChange(-1)} 
                      style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0.5rem 1.2rem', minWidth: '40px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      {quantity}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleQtyChange(1)} 
                      style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.productPurchaseRow} style={{ marginTop: '0.5rem' }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`btn btn-primary ${styles.btnAddToCart}`}
                  >
                    <ShoppingCart size={18} />
                    {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={toggleWishlist}
                    className={`btn btn-secondary ${styles.btnWishlist} ${isInWishlist ? styles.active : ''}`}
                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Other Products from this Vendor */}
      {dealerProducts.length > 0 && (
        <div className={styles.otherProductsSection}>
          <h3 className={styles.otherProductsTitle}>More Products from this Vendor</h3>
          <div className={styles.otherProductsGrid}>
            {dealerProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
