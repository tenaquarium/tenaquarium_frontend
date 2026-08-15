import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Package, Truck, Calendar, MapPin, Search } from 'lucide-react';

const TrackShipment = () => {
  const { trackingNumber: routeTrackingNumber } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(routeTrackingNumber || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  const fetchTrackingDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    setTrackingData(null);
    try {
      const res = await api.get(`/orders/public-track/${id}`);
      if (res.data && res.data.success) {
        setTrackingData(res.data);
      } else {
        setError('No consignment details found.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Unable to retrieve tracking information. Please check the tracking number.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeTrackingNumber) {
      setTrackingId(routeTrackingNumber);
      fetchTrackingDetails(routeTrackingNumber);
    }
  }, [routeTrackingNumber]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    navigate(`/track/${trackingId.trim()}`);
    fetchTrackingDetails(trackingId.trim());
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', minHeight: '80vh', textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Tenaquarium Tracking
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Track your live aquatic shipments and product orders in real-time.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Enter Tracking Number or Order ID..."
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="form-control"
              style={{
                width: '100%',
                padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1.5px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '0.8rem 2rem',
              borderRadius: '12px',
              fontWeight: '700',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {loading ? 'Searching...' : 'Track Shipment'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1.2rem', padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', fontSize: '0.9rem', textAlign: 'left' }}>
            {error}
          </div>
        )}
      </div>

      {/* Tracking results view */}
      {loading && (
        <div style={{ padding: '3rem 0' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading status...</span>
          </div>
        </div>
      )}

      {trackingData && (
        <div className="glass-panel" style={{ padding: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', textAlign: 'left' }}>
          
          {/* Header metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Tracking ID / AWB</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'monospace', marginTop: '4px' }}>
                {trackingData.trackingNumber || 'N/A'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Courier Partner</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', textTransform: 'capitalize' }}>
                {trackingData.courierService || 'Standard Shipping'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Expected Delivery</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                {new Date(trackingData.expectedDelivery).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Current Status banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', background: 'rgba(2, 132, 199, 0.05)', borderRadius: '12px', border: '1.5px solid rgba(2, 132, 199, 0.1)', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CURRENT STATUS</span>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: trackingData.orderStatus === 'Delivered' ? 'var(--success)' : 'var(--primary)', marginTop: '3px' }}>
                {trackingData.orderStatus}
              </div>
            </div>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: trackingData.orderStatus === 'Delivered' ? 'var(--success)' : 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {trackingData.orderStatus === 'Delivered' ? <MapPin size={22} /> : <Truck size={22} />}
            </div>
          </div>

          {/* Timeline steps */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Consignment Journey Timeline
            </h3>

            {!trackingData.trackingTimeline || trackingData.trackingTimeline.length === 0 ? (
              <div style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Shipment is being prepared by the dealer. Check back shortly for transit hubs updates.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', position: 'relative', paddingLeft: '1.8rem', borderLeft: '2.5px solid var(--primary)', margin: '1rem 0 1rem 1rem' }}>
                {trackingData.trackingTimeline.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Bullet marker */}
                    <div style={{
                      position: 'absolute',
                      left: '-36px',
                      top: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--success)' : 'var(--primary)',
                      border: '3px solid #ffffff',
                      boxShadow: '0 2px 6px rgba(2,132,199,0.4)'
                    }} />
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: idx === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                      {step.status}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Location: {step.location}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Timestamp: {new Date(step.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default TrackShipment;
