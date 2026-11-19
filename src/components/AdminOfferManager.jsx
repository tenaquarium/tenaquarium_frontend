import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, XCircle, Search, Filter, Megaphone, Sparkles, Send, X } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import styles from '../pages/AdminDashboard.module.css';

const AdminOfferManager = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '🎉 Special Offer from TEN Aquarium!',
    message: 'Limited time discount on premium fish, live plants, and aquarium accessories!',
    discount: '20% OFF',
    url: '/products',
    offerId: null,
  });
  const [broadcasting, setBroadcasting] = useState(false);
  const { showConfirm, showPrompt } = useAlert();

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers/admin');
      setOffers(res.data);
    } catch (error) {
      console.error('Error fetching admin offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleApprove = async (id) => {
    const isConfirmed = await showConfirm('Approve this offer? It will notify customers immediately and become active if dates are valid.');
    if (isConfirmed) {
      try {
        await api.post('/offers/' + id + '/approve');
        fetchOffers();
        alert('Offer approved and broadcast notification sent to customers!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to approve');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = await showPrompt('Please provide a reason for rejection:');
    if (reason) {
      try {
        await api.post('/offers/' + id + '/reject', { rejectionReason: reason });
        fetchOffers();
        alert('Offer rejected successfully.');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject');
      }
    }
  };

  const handleQuickBroadcast = async (offer) => {
    const discountLabel =
      offer.benefitType === 'buy_x_get_y'
        ? `Buy ${offer.buyX} Get ${offer.getY}`
        : offer.benefitType === 'percentage'
        ? `${offer.benefitValue}% OFF`
        : `₹${offer.benefitValue} OFF`;

    setBroadcastData({
      title: `🎉 Flash Sale: ${offer.offerName}!`,
      message: `Grab special deal: ${discountLabel} on aquarium products! Limited stock available.`,
      discount: discountLabel,
      url: '/products',
      offerId: offer._id,
    });
    setShowBroadcastModal(true);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastData.title || !broadcastData.message) {
      alert('Please fill in title and message');
      return;
    }

    setBroadcasting(true);
    try {
      const res = await api.post('/notifications/broadcast-offer', broadcastData);
      if (res.data?.success) {
        alert('✅ Offer successfully broadcasted in real time to all customers!');
        setShowBroadcastModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error broadcasting offer');
    } finally {
      setBroadcasting(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (filter !== 'All' && o.status !== filter) return false;
    return true;
  });

  return (
    <div>
      <div className={styles['dashboard-header']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className={styles['dashboard-title']}>Offer Management & Broadcast</h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.88rem' }}>
            Approve dealer promotions and announce real-time offers to all customers
          </p>
        </div>
        <button
          onClick={() => {
            setBroadcastData({
              title: '🎉 Special Offer from TEN Aquarium!',
              message: 'Limited time discount on premium fish, live plants, and aquarium accessories!',
              discount: 'Special Deal',
              url: '/products',
              offerId: null,
            });
            setShowBroadcastModal(true);
          }}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            padding: '10px 18px',
            borderRadius: '24px',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
          }}
        >
          <Megaphone size={18} />
          <span>Broadcast Offer to Customers</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { label: 'All Statuses', value: 'All' },
          { label: 'Pending Review', value: 'SUBMITTED' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Rejected', value: 'REJECTED' },
          { label: 'Expired', value: 'EXPIRED' },
        ].map((status) => (
          <button
            key={status.value}
            onClick={() => setFilter(status.value)}
            className={`btn ${filter === status.value ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap', borderRadius: '20px', padding: '0.4rem 1rem' }}
          >
            {status.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading offers...</p>
      ) : filteredOffers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <p>No offers found matching your criteria.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className={styles['table-container']}>
            <table className={styles['custom-table']}>
              <thead>
                <tr>
                  <th>Dealer Info</th>
                  <th>Offer Details</th>
                  <th>Discount</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer) => (
                  <tr key={offer._id}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{offer.dealerId?.name || 'Admin / Shop'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{offer.dealerId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{offer.offerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{offer.offerScope?.toUpperCase()}</div>
                    </td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
                      {offer.benefitType === 'buy_x_get_y'
                        ? `Buy ${offer.buyX} Get ${offer.getY}`
                        : offer.benefitType === 'percentage'
                        ? offer.benefitValue + '% OFF'
                        : '₹' + offer.benefitValue + ' OFF'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{offer.startDate} {offer.startTime}</div>
                      <div>{offer.endDate} {offer.endTime}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          backgroundColor:
                            offer.status === 'APPROVED' || offer.status === 'ACTIVE'
                              ? 'rgba(16,185,129,0.1)'
                              : offer.status === 'REJECTED'
                              ? 'rgba(239,68,68,0.1)'
                              : offer.status === 'SUBMITTED'
                              ? 'rgba(59,130,246,0.1)'
                              : 'rgba(100,116,139,0.1)',
                          color:
                            offer.status === 'APPROVED' || offer.status === 'ACTIVE'
                              ? '#10b981'
                              : offer.status === 'REJECTED'
                              ? '#ef4444'
                              : offer.status === 'SUBMITTED'
                              ? '#3b82f6'
                              : '#64748b',
                        }}
                      >
                        {offer.status}
                      </span>
                      {offer.status === 'REJECTED' && offer.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                          Reason: {offer.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {offer.status === 'SUBMITTED' && (
                          <>
                            <button
                              onClick={() => handleApprove(offer._id)}
                              className="btn btn-primary"
                              style={{ padding: '0.4rem', background: '#10b981', border: 'none' }}
                              title="Approve & Broadcast"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(offer._id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem', color: 'red' }}
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {(offer.status === 'APPROVED' || offer.status === 'ACTIVE') && (
                          <button
                            onClick={() => handleQuickBroadcast(offer)}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.78rem',
                              borderRadius: '16px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#0284c7',
                              borderColor: 'rgba(2, 132, 199, 0.4)',
                            }}
                            title="Broadcast to all customers"
                          >
                            <Megaphone size={14} />
                            <span>Broadcast</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broadcast Offer Modal */}
      {showBroadcastModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setShowBroadcastModal(false)}
        >
          <div
            style={{
              background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(2, 132, 199, 0.3)',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={22} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Broadcast Real-Time Offer</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              This will instantly send a real-time notification with chime sound, desktop push, and in-app banner to <strong>all customers</strong> across all pages!
            </p>

            <form onSubmit={handleSendBroadcast}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Notification Title
                </label>
                <input
                  type="text"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                  placeholder="e.g. 🎉 Weekend Flash Sale: 20% OFF!"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Offer Message
                </label>
                <textarea
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none',
                  }}
                  placeholder="e.g. Flat 20% discount on all Live Marine Fish & Planted Tanks. Grab before it expires!"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                    Discount Tag
                  </label>
                  <input
                    type="text"
                    value={broadcastData.discount}
                    onChange={(e) => setBroadcastData({ ...broadcastData, discount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                    placeholder="e.g. 25% OFF"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                    Target Link
                  </label>
                  <input
                    type="text"
                    value={broadcastData.url}
                    onChange={(e) => setBroadcastData({ ...broadcastData, url: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                    placeholder="/products"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '12px', padding: '10px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '12px',
                    padding: '10px 22px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #0284c7, #059669)',
                    fontWeight: '700',
                    border: 'none',
                  }}
                >
                  <Send size={16} />
                  <span>{broadcasting ? 'Broadcasting...' : 'Blast Broadcast Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOfferManager;
