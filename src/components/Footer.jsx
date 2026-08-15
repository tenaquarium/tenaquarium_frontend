import { Link, useLocation } from 'react-router-dom';
import styles from './Footer.module.css';
import { Mail, Phone, MapPin, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/products') || location.pathname === '/contact') {
    return null;
  }

  return (
    <footer className={styles['footer']}>
      <div className={styles['footer-grid']}>
        <div>
          <div className={styles['footer-brand']} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="TENAQUARIUM Logo" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p className={styles['footer-text']}>
            TENAQUARIUM is a premium e-commerce marketplace connecting top aquarium dealers with aquatic enthusiasts worldwide.
          </p>
          {/* Social Media Links */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <a href="https://www.instagram.com/tenaquarium?igsh=dmFxNnY0bHA1dnZi" target="_blank" rel="noopener noreferrer" className={styles['social-icon-btn']} title="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://youtube.com/@tenaquarium?si=GoXAupJvi2y6Ogb6" target="_blank" rel="noopener noreferrer" className={styles['social-icon-btn']} title="YouTube">
              <Youtube size={20} />
            </a>
            <a href="https://share.google/nC9McheqTIWPxUzBk" target="_blank" rel="noopener noreferrer" className={styles['social-icon-btn']} title="Google Profile">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`lucide ${styles['lucide-google']}`}
              >
                <path d="M21.5 8.9A10 10 0 1 0 22 12H12" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className={styles['footer-col-title']}>Quick Links</h4>
          <ul className={styles['footer-links']}>
            <li><Link to="/" className={styles['footer-link-item']}>Home</Link></li>
            <li><Link to="/products" className={styles['footer-link-item']}>Browse Aquariums</Link></li>
            <li><Link to="/about" className={styles['footer-link-item']}>Our Story</Link></li>
            <li><Link to="/dealer/register" className={styles['footer-link-item']}>Sell on Tenaquarium</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles['footer-col-title']}>Support</h4>
          <ul className={styles['footer-links']}>
            {!location.pathname.startsWith('/admin') && (
              <li><Link to="/contact" className={styles['footer-link-item']}>Contact Us</Link></li>
            )}
            <li><span className={styles['footer-link-item']} style={{ cursor: 'default' }}>Privacy Policy</span></li>
            <li><span className={styles['footer-link-item']} style={{ cursor: 'default' }}>Terms of Service</span></li>
          </ul>
        </div>

        {!location.pathname.startsWith('/admin') && (
          <div>
            <h4 className={styles['footer-col-title']}>Contact</h4>
            <ul className={styles['footer-links']} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={22} style={{ flexShrink: 0 }} /> 183/81, 2nd North Street, Puthumariamman Kovil Bus Stop, Ponnamapet, Salem - 636003
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} /> +91 9677572150
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> tenaquarium@gmail.com
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className={styles['footer-bottom']}>
        <p>&copy; {new Date().getFullYear()} TENAQUARIUM. All rights reserved. Made for aquatic lovers.</p>
      </div>
    </footer>
  );
};

export default Footer;
