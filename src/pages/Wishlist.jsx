import React, { useEffect, useState } from 'react';
import styles from './Wishlist.module.css';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import api from '../utils/api';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const ids = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistIds(ids);

      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Fetch all products and filter locally for ease of implementation
      const res = await api.get('/products');
      const filtered = res.data.filter((prod) => ids.includes(prod._id));
      setProducts(filtered);
    } catch (error) {
      console.error('Error fetching wishlist products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();

    const handleWishlistChange = () => {
      loadWishlist();
    };

    window.addEventListener('wishlist-updated', handleWishlistChange);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistChange);
    };
  }, []);

  if (loading) {
    return <Loader message="Loading your wishlisted aquatics..." />;
  }

  if (products.length === 0) {
    return (
      <div className="main-content" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <Heart size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.8rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Tap the heart icon on any aquarium item to save it for later.
          </p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ padding: '3rem 5%' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Heart size={28} fill="var(--accent)" color="var(--accent)" />
        Your Wishlist
      </h1>

      <div className={styles['products-grid']} style={{ padding: '0' }}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
