import  { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { ShoppingCart, Heart, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Load cart items quantity when cart changes or user logs in
  useEffect(() => {
    const fetchCartCount = async () => {
      if (token && user && (user.role === 'customer' || user.role === 'dealer')) {
        try {
          const res = await api.get('/cart');
          const count = res.data.products.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(count);
        } catch (error) {
          console.error('Error fetching cart for navbar', error);
        }
      }
    };

    fetchCartCount();
    
    // Listen to custom cart updates
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [token, user]);

  const handleLogout = async () => {
    const confirmLogout = await showConfirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navClass = styles['navbar'];

  return (
    <nav className={navClass}>
      <div className={styles['nav-brand']} onClick={() => navigate('/')}>
        <img src="/logo.png" alt="TENAQUARIUM Logo" className={styles['logo-image']} style={{ height: '64px', width: 'auto', objectFit: 'contain' }} />
      </div>

      <ul className={styles['nav-links']}>
        <li>
          <Link to="/products" className={`${styles['nav-link']} ${isActive('/products') ? styles['active'] : ''}`}>
            Products
          </Link>
        </li>
        <li>
          <Link to="/about" className={`${styles['nav-link']} ${isActive('/about') ? styles['active'] : ''}`}>
            About Us
          </Link>
        </li>
        {user?.role !== 'admin' && (
          <li>
            <Link to="/contact" className={`${styles['nav-link']} ${isActive('/contact') ? styles['active'] : ''}`}>
              Contact Us
            </Link>
          </li>
        )}

      </ul>

      <div className={styles['nav-actions']}>
        {user ? (
          <>
            {(user.role === 'customer' || user.role === 'dealer') && (
              <>
                <Link to="/wishlist" className={styles['wishlist-btn-3d']} title="Wishlist">
                  <Heart size={22} />
                </Link>
                <Link to="/cart" className={styles['cart-btn-3d']} title="Shopping Cart">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && <span className={styles['cart-badge']}>{cartCount}</span>}
                </Link>
              </>
            )}

            <NotificationDropdown />

            <Link
              to={
                user.role === 'admin'
                  ? '/admin/dashboard'
                  : user.role === 'dealer'
                  ? '/dealer/dashboard'
                  : '/customer/dashboard'
              }
              className={`${styles['nav-link']} ${
                location.pathname.includes('/dashboard') ? styles['active'] : ''
              }`}
              title="Dashboard"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LayoutDashboard size={18} />
                Dashboard
              </span>
            </Link>

            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              Hi, {user.name.split(' ')[0]}
            </span>

            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>

      <button 
        className={styles['hamburger-btn']} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        title="Toggle Menu"
      >
        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isMobileMenuOpen && (
        <div className={styles['mobile-menu-overlay']}>
          <Link to="/products" className={`${styles['nav-link']} ${isActive('/products') ? styles['active'] : ''}`}>
            Products
          </Link>
          <Link to="/about" className={`${styles['nav-link']} ${isActive('/about') ? styles['active'] : ''}`}>
            About Us
          </Link>
          {user?.role !== 'admin' && (
            <Link to="/contact" className={`${styles['nav-link']} ${isActive('/contact') ? styles['active'] : ''}`}>
              Contact Us
            </Link>
          )}

          <div className={styles['mobile-actions']}>
            {user ? (
              <>
                <div className={styles['wishlist-cart-row']}>
                  {(user.role === 'customer' || user.role === 'dealer') && (
                    <>
                      <Link to="/wishlist" className={styles['wishlist-btn-3d']} title="Wishlist">
                        <Heart size={22} />
                      </Link>
                      <Link to="/cart" className={styles['cart-btn-3d']} title="Shopping Cart">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && <span className={styles['cart-badge']}>{cartCount}</span>}
                      </Link>
                    </>
                  )}
                </div>

                <Link
                  to={
                    user.role === 'admin'
                      ? '/admin/dashboard'
                      : user.role === 'dealer'
                      ? '/dealer/dashboard'
                      : '/customer/dashboard'
                  }
                  className={`${styles['nav-link']} ${
                    location.pathname.includes('/dashboard') ? styles['active'] : ''
                  }`}
                  style={{ marginBottom: '1rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <LayoutDashboard size={18} />
                    Dashboard
                  </span>
                </Link>

                <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  Hi, {user.name}
                </span>

                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <div className={styles['mobile-btn-group']}>
                <Link to="/login" className="btn btn-secondary" style={{ flex: 1 }}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1 }}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
