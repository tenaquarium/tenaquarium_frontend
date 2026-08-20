import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import styles from '../pages/AdminDashboard.module.css';

const AdminOfferManager = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
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
    const isConfirmed = await showConfirm('Approve this offer? It will become active if dates are valid.');
    if (isConfirmed) {
      try {
        await api.post('/offers/' + id + '/approve');
        fetchOffers();
        alert('Offer approved successfully!');
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

  const filteredOffers = offers.filter(o => {
    if (filter !== 'All' && o.status !== filter) return false;
    return true;
  });

  return (
    <div>
      <div className={styles['dashboard-header']}>
        <h1 className={styles['dashboard-title']}>Dealer Offer Approvals</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { label: 'All Statuses', value: 'All' },
          { label: 'Pending Review', value: 'SUBMITTED' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Rejected', value: 'REJECTED' },
          { label: 'Expired', value: 'EXPIRED' }
        ].map(status => (
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
                {filteredOffers.map(offer => (
                  <tr key={offer._id}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{offer.dealerId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{offer.dealerId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{offer.offerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{offer.offerScope.toUpperCase()}</div>
                    </td>
                    <td style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
                      {offer.benefitType === 'buy_x_get_y' ? `Buy ${offer.buyX} Get ${offer.getY}` : offer.benefitType === 'percentage' ? offer.benefitValue + '% OFF' : '₹' + offer.benefitValue + ' OFF'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{offer.startDate} {offer.startTime}</div>
                      <div>{offer.endDate} {offer.endTime}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                        backgroundColor: 
                          offer.status === 'APPROVED' || offer.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' :
                          offer.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' :
                          offer.status === 'SUBMITTED' ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)',
                        color:
                          offer.status === 'APPROVED' || offer.status === 'ACTIVE' ? '#10b981' :
                          offer.status === 'REJECTED' ? '#ef4444' :
                          offer.status === 'SUBMITTED' ? '#3b82f6' : '#64748b'
                      }}>
                        {offer.status}
                      </span>
                      {offer.status === 'REJECTED' && offer.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
                          Reason: {offer.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      {offer.status === 'SUBMITTED' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleApprove(offer._id)} className="btn btn-primary" style={{ padding: '0.4rem', background: '#10b981', border: 'none' }} title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleReject(offer._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'red' }} title="Reject">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOfferManager;
