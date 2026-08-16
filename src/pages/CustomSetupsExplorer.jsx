import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ShieldCheck, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import plantedTankImg from '../assets/planted_tank.png';
import marineTankImg from '../assets/marine_tank.png';
import officeTankImg from '../assets/office_tank.png';

const CustomSetupsExplorer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await api.get('/dealers/approved/public');
        setDealers(res.data);
      } catch (err) {
        console.error('Error fetching approved dealers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDealers();
  }, []);

  const handleInquiry = (dealerUserId) => {
    if (!user) {
      alert('Please log in as a customer to chat with dealers!');
      navigate('/login');
      return;
    }
    // Navigate to Chat Center and auto-select this dealer
    navigate('/chats', { state: { autoStartChatWith: dealerUserId } });
  };

  const getSetupImage = (setupType) => {
    if (setupType === 'planted') return plantedTankImg;
    if (setupType === 'marine') return marineTankImg;
    return officeTankImg;
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--primary)', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(14, 165, 233, 0.08)', padding: '6px 12px', borderRadius: '20px', marginBottom: '1rem' }}>
          <Sparkles size={14} /> Custom Nature Aquariums
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.8rem' }}>
          Explore Custom Tank Setups
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Browse premium aquarium installations crafted by professional local designers. Select a design and consult directly with the builder to customize it for your home or office.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <div className="spinner"></div>
        </div>
      ) : dealers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--card-bg)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No certified custom setup designers are online right now. Please check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {dealers.map((dealer) => {
            // Define three setups per dealer dynamically
            const setupPackages = [
              {
                id: 'planted',
                name: 'Professional Planted Tank Setup',
                desc: 'A lush, green freshwater nature aquarium setup utilizing live aquatic plants, premium soil substrate, and custom hardscaping. Ideal for tropical community fish.',
                img: plantedTankImg,
                estPrice: '₹8,500 - ₹25,000'
              },
              {
                id: 'marine',
                name: 'Exotic Marine Reef Setup',
                desc: 'A vibrant saltwater coral reef ecosystem containing live sand, premium rock setups, reef-grade LED lighting, and wavemakers. Designed for colorful marine life.',
                img: marineTankImg,
                estPrice: '₹22,000 - ₹65,000'
              },
              {
                id: 'office',
                name: 'Office & Desktop Aquarium Setup',
                desc: 'A compact, low-maintenance micro-aquascape tailored for office reception counters, work desks, and study tables. Extremely elegant and space-efficient.',
                img: officeTankImg,
                estPrice: '₹4,500 - ₹12,000'
              }
            ];

            return (
              <div key={dealer._id} className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Dealer Info Section */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {dealer.businessName ? dealer.businessName.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {dealer.businessName}
                        <ShieldCheck size={16} style={{ color: 'var(--success)' }} title="Certified Builder" />
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <MapPin size={12} /> {dealer.address}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleInquiry(dealer.userId?._id || dealer.userId)} 
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <MessageSquare size={16} />
                    Consult Designer
                  </button>
                </div>

                {/* Setups Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {setupPackages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                        <img 
                          src={pkg.img} 
                          alt={pkg.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>

                      <div style={{ padding: '1.2rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>{pkg.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, flexGrow: 1 }}>{pkg.desc}</p>
                        
                        <button 
                          onClick={() => handleInquiry(dealer.userId?._id || dealer.userId)}
                          className="btn btn-secondary" 
                          style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.5rem' }}
                        >
                          Send Inquiry Chat <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSetupsExplorer;
