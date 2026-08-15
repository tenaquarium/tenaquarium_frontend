import React from 'react';
import styles from './About.module.css';
import { Award, ShieldCheck, Heart, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="main-content" style={{ padding: '4rem 5%' }}>
      {/* Title */}
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className={styles['hero-title']} style={{ fontSize: '3rem' }}>About TENAQUARIUM</h1>
        <p className={styles['hero-subtitle']}>
          Connecting certified aquatic breeders, importers, and equipment builders with hobbyists globally since 2026.
        </p>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
            <ShieldCheck size={40} />
          </div>
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.3rem' }}>Certified Dealers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Every dealer on our platform is hand-verified by our administrative team. We review business registrations, store locations, and import licenses.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '1rem' }}>
            <Award size={40} />
          </div>
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.3rem' }}>Premium Livestock</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            We mandate strict shipping protocols for live fish to ensure transit mortality is reduced to zero. Our dealers provide live-arrival guarantees.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent)', marginBottom: '1rem' }}>
            <Heart size={40} />
          </div>
          <h3 style={{ marginBottom: '0.8rem', fontSize: '1.3rem' }}>Hobbyist Centric</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Enjoy detailed profiles, active rating guides, real product reviews, and secure checkout options including Cash on Delivery and Secure UPI QR Payments.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className={`glass-panel ${styles['grid-section']}`} style={{ marginTop: '4rem', padding: '3rem' }}>
        <div className={styles['text-col']}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
            Building an aquarium is more than a hobby; it is the creation of a balanced ecosystem. At Tenaquarium, we believe that purchasing supplies and livestock should be a transparent and secure experience.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            By empowering independent dealers with robust e-commerce tooling and providing customers with aggregate, verified reviews, we foster a healthier ecosystem for the hobby globally.
          </p>
        </div>
        <div className={styles['image-col']}>
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800"
            alt="Aquarium Aquascaping"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* TEN AQUARIUM MSME Certificate Section */}
      <div className="glass-panel" style={{ marginTop: '4rem', padding: '3rem' }}>
        <h2 className={styles['section-title']} style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
          Marketplace Owner Credentials & Certification
        </h2>
        
        <div className={styles['grid-section']} style={{ gap: '3rem' }}>
          {/* Certificate details */}
          <div className={styles['text-col']} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>
              Ten Aquarium Registration Info
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              Tenaquarium operates under official government recognition as a registered micro-enterprise. Below are the verified certificate details issued by the Ministry of Micro, Small & Medium Enterprises (MSME), Government of India:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(14, 165, 233, 0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enterprise Name</span>
                <strong style={{ color: 'var(--text-primary)' }}>TEN AQUARIUM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Udyam Registration Number</span>
                <strong style={{ color: 'var(--text-primary)' }}>UDYAM-TN-20-0190357</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enterprise Type</span>
                <strong style={{ color: 'var(--text-primary)' }}>Micro (Trading / Retail / Services)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Official Address</span>
                <strong style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>183/81, Ponnamapet, Salem - 636003</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registration Date</span>
                <strong style={{ color: 'var(--text-primary)' }}>05/07/2025</strong>
              </div>
            </div>

          </div>

          {/* Certificate image visual */}
          <div className={styles['cert-image-col']}>
            <a href="/msme_certificate.jpg" target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 12px 32px rgba(0,0,0,0.08)', transition: 'transform var(--transition-smooth)', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}>
                <img 
                  src="/msme_certificate.jpg" 
                  alt="MSME Registration Certificate" 
                  style={{ width: '100%', maxWidth: '340px', height: 'auto', display: 'block' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity var(--transition-smooth)' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                  <span style={{ background: '#ffffff', color: 'var(--text-primary)', padding: '0.6rem 1rem', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <ExternalLink size={14} />
                    View Certificate
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
