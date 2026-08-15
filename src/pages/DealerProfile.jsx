import React, { useEffect, useState } from 'react';
import styles from './DealerProfile.module.css';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import { Store, MapPin, Phone, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const DealerProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDealerProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/dealers/${id}/public`);
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching dealer profile details:', err);
        setError('Dealer profile not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchDealerProfile();
  }, [id]);

  if (loading) {
    return <Loader message="Loading dealer storefront profile..." />;
  }

  if (error || !profileData) {
    return (
      <div className="main-content" style={{ padding: '4rem 5%', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Error Loading Profile</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error || 'Profile could not be resolved.'}</p>
        </div>
      </div>
    );
  }

  const { dealer, products } = profileData;
  const isApproved = dealer.approvalStatus === 'approved';

  return (
    <div className="main-content" style={{ padding: '3rem 5%' }}>
      {/* Store Header Banner Card */}
      <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Shop Logo Avatar */}
          <div style={{ position: 'relative' }}>
            <img
              src={dealer.logo || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200'}
              alt={dealer.businessName}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--primary)',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.15)',
                background: '#f8fafc',
              }}
            />
            {isApproved && (
              <div
                title="Verified Dealer Account"
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <CheckCircle2 size={24} style={{ fill: '#ffffff' }} />
              </div>
            )}
          </div>

          {/* Shop Header Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
              <h1 className={styles['hero-title']} style={{ fontSize: '2.5rem', margin: 0, padding: 0 }}>
                {dealer.businessName}
              </h1>
              {isApproved ? (
                <span className={`${styles['stock-status']} ${styles['stock-in']}`} style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', padding: '0.2rem 0.6rem' }}>
                  Verified Partner
                </span>
              ) : (
                <span className={`${styles['stock-status']} ${styles['stock-out']}`} style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', padding: '0.2rem 0.6rem' }}>
                  Under Review
                </span>
              )}
            </div>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', margin: 0, maxHeight: '80px', overflowY: 'auto', lineHeight: '1.6' }}>
              {dealer.description || 'Welcome to our premium aquarium store! Browse our featured products below.'}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Store size={16} style={{ color: 'var(--primary)' }} />
                Proprietor: <strong>{dealer.ownerName}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} style={{ color: 'var(--secondary)' }} />
                {dealer.address}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Product Catalog Grid */}
        <div>
          <h2 className={styles['section-title']} style={{ margin: '0 0 1.5rem 0', textAlign: 'left', fontSize: '1.8rem' }}>
            Aquarium Store Catalog ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No products published by this dealer yet.
            </div>
          ) : (
            <div className={styles['products-grid']} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Contact & Verified Documents Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '100px' }}>
          
          {/* Contact Details Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Contact Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(14, 165, 233, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                  <Phone size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</div>
                  <strong style={{ color: 'var(--text-primary)' }}>{dealer.phone}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(20, 184, 166, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
                  <Mail size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                  <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{dealer.email}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Documents Verification Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Verification Documents
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.2rem' }}>
              This dealer has submitted official business paperwork to verify legitimacy and compliance with shipping laws.
            </p>

            <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(248, 250, 252, 0.5)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
                <FileText size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  MSME Certificate
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Registry PDF</div>
              </div>
            </div>

            {dealer.msmeCertificate ? (
              <button
                type="button"
                onClick={() => {
                  const base64Data = dealer.msmeCertificate;
                  if (base64Data.startsWith('http') || base64Data.startsWith('/')) {
                    window.open(base64Data, '_blank');
                  } else {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.title = 'MSME Document';
                      newWindow.document.body.style.margin = '0';
                      newWindow.document.body.style.display = 'flex';
                      newWindow.document.body.style.justifyContent = 'center';
                      newWindow.document.body.style.alignItems = 'center';
                      newWindow.document.body.style.background = '#0f172a';
                      const img = newWindow.document.createElement('img');
                      img.src = base64Data;
                      img.style.maxWidth = '90%';
                      img.style.maxHeight = '90vh';
                      img.style.objectFit = 'contain';
                      img.style.borderRadius = '8px';
                      img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                      newWindow.document.body.appendChild(img);
                    } else {
                      const link = document.createElement('a');
                      link.href = base64Data;
                      link.download = 'msme_document.jpg';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }
                }}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.2rem', justifyContent: 'center', cursor: 'pointer' }}
              >
                Open MSME Document
              </button>
            ) : (
              <div style={{ width: '100%', padding: '0.6rem', marginTop: '1.2rem', borderRadius: '8px', border: '1px dashed var(--accent)', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center' }}>
                MSME Certificate not uploaded
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default DealerProfile;
