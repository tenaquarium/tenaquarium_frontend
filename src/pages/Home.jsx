import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Testimonials from '../components/Testimonials';
import Loader from '../components/Loader';
import api from '../utils/api';
import { Fish, ShieldAlert, Award, Zap, Compass } from 'lucide-react';
import plantedTankImg from '../assets/planted_tank.png';
import marineTankImg from '../assets/marine_tank.png';
import officeTankImg from '../assets/office_tank.png';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aquaMarineDealerId, setAquaMarineDealerId] = useState('');

  const iconMap = {
    Fish: <Fish size={24} />,
    Zap: <Zap size={24} />,
    Compass: <Compass size={24} />,
    Award: <Award size={24} />,
    ShieldAlert: <ShieldAlert size={24} />
  };

  const [categories, setCategories] = useState([
    { name: 'Aquarium Fish', icon: <Fish size={24} /> },
    { name: 'Fish Food', icon: <Zap size={24} /> },
    { name: 'Aquarium Tanks', icon: <Compass size={24} /> },
    { name: 'Aquarium Filters', icon: <Award size={24} /> },
    { name: 'Aquarium Lights', icon: <Zap size={24} /> },
    { name: 'Aquarium Decorations', icon: <Compass size={24} /> },
    { name: 'Aquarium Plants', icon: <Fish size={24} /> },
    { name: 'Aquarium Accessories', icon: <ShieldAlert size={24} /> },
    { name: 'Custom Tank Setup', icon: <Compass size={24} /> },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(cat => ({
            name: cat.name,
            icon: iconMap[cat.iconName] || <Compass size={24} />
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.error('Error fetching categories in Home page', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const res = await api.get('/products?sort=newest');
        // Slice first 8 products
        setFeaturedProducts(res.data.slice(0, 8));
      } catch (error) {
        console.error('Error fetching home products', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDealers = async () => {
      try {
        const res = await api.get('/dealers/approved/public');
        const match = res.data.find(d => d.businessName === 'Aqua Marine Shop');
        if (match) {
          setAquaMarineDealerId(match._id);
        }
      } catch (err) {
        console.error('Failed to load dealer ID', err);
      }
    };

    fetchLatestProducts();
    fetchDealers();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="main-content">
      {/* Hero Banner */}
      <header className={styles['home-hero']}>
        <h1 className={styles['hero-title']}>Discover the Wonders of the Deep Blue</h1>
        <p className={styles['hero-subtitle']}>
          TENAQUARIUM connects premier aquarium breeders and equipment manufacturers directly to your doorstep. Buy fish, tanks, lights, and food from certified local dealers.
        </p>
        <div className={styles['hero-cta']}>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Shop Products
          </button>
          <button onClick={() => navigate('/dealer/register')} className="btn btn-secondary">
            Become a Dealer
          </button>
        </div>
      </header>

      {/* Categories Section */}
      <section style={{ padding: '2rem 5%' }}>
        <h2 className={styles['section-title']}>Shop By Category</h2>
        <div className={styles['categories-container']}>
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`glass-panel ${styles['category-card']}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className={styles['icon-wrapper']}>{cat.icon}</div>
              <span className={styles['category-name']}>{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '2rem 5%' }}>
        <h2 className={styles['section-title']}>Latest Arrivals</h2>
        {loading ? (
          <Loader message="Swimming to get latest items..." />
        ) : featuredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No products available at the moment.
          </p>
        ) : (
          <div className={styles['products-grid']}>
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Custom Tank Setups Section */}
      <section style={{ padding: '3rem 5%', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
        <h2 className={styles['section-title']}>Custom & Manual Tank Setups</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '-1rem', marginBottom: '2.5rem', fontSize: '1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Professional, custom-tailored aquariums built to match your environment. Hand-crafted and installed by certified local dealers.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Card 1: Planted Tank */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={plantedTankImg} alt="Planted Tank Setup" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>Planted Tank Setup</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flexGrow: 1, margin: '0', lineHeight: '1.5' }}>
              A lush underwater forest featuring aquatic mosses, carpet plants, and natural driftwood. Perfect for shrimp and nano fish.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Offered by: </span>
              {aquaMarineDealerId ? (
                <span 
                  onClick={() => navigate(`/dealers/${aquaMarineDealerId}`)}
                  style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Aqua Marine Shop
                </span>
              ) : (
                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>Aqua Marine Shop</span>
              )}
            </div>
          </div>

          {/* Card 2: Marine Tank */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={marineTankImg} alt="Marine Reef Tank" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>Marine Tank Setup</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flexGrow: 1, margin: '0', lineHeight: '1.5' }}>
              Vibrant saltwater coral reef environments featuring anemones, clownfish, and live rock. Brings the ocean directly to your home.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Offered by: </span>
              {aquaMarineDealerId ? (
                <span 
                  onClick={() => navigate(`/dealers/${aquaMarineDealerId}`)}
                  style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Aqua Marine Shop
                </span>
              ) : (
                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>Aqua Marine Shop</span>
              )}
            </div>
          </div>

          {/* Card 3: Office Tank */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={officeTankImg} alt="Office Tank Setup" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>Office Desktop Tank</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flexGrow: 1, margin: '0', lineHeight: '1.5' }}>
              Low-maintenance, silent desktop aquariums. Reduces workplace stress and adds a touch of natural beauty to your office.
            </p>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Offered by: </span>
              {aquaMarineDealerId ? (
                <span 
                  onClick={() => navigate(`/dealers/${aquaMarineDealerId}`)}
                  style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Aqua Marine Shop
                </span>
              ) : (
                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>Aqua Marine Shop</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button 
            onClick={() => navigate('/products?category=Custom%20Tank%20Setup')} 
            className="btn btn-primary"
            style={{ padding: '0.8rem 2.5rem', fontSize: '1.05rem' }}
          >
            Explore Custom Tank Setups
          </button>
        </div>
      </section>

      {/* Testimonials Auto-scroll testimonials footer */}
      <Testimonials />
    </div>
  );
};

export default Home;
