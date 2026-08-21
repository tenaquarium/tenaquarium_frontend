import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Copy, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import styles from '../pages/DealerDashboard.module.css';

const DealerOfferManager = () => {
  const { user } = useAuth();
  const { showConfirm } = useAlert();
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  const [offerScope, setOfferScope] = useState('product');
  const [offerName, setOfferName] = useState('');
  const [description, setDescription] = useState('');
  const [benefitType, setBenefitType] = useState('percentage');
  const [benefitValue, setBenefitValue] = useState('');
  const [buyX, setBuyX] = useState('');
  const [getY, setGetY] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [targetProducts, setTargetProducts] = useState([]);
  const [targetCategories, setTargetCategories] = useState([]);
  const [bannerImage, setBannerImage] = useState('');
  const [confirmTerms, setConfirmTerms] = useState(false);
  
  const [myProducts, setMyProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers/dealer');
      setOffers(res.data.offers);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products/myproducts'),
        api.get('/categories').catch(() => ({ data: [] }))
      ]);
      setMyProducts(prodRes.data);
      if (catRes && catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data.map(c => c.name));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchProductsAndCategories();
  }, []);

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedOffer(null);
    setOfferName('');
    setDescription('');
    setOfferScope('product');
    setTargetProducts([]);
    setTargetCategories([]);
    setBenefitType('percentage');
    setBenefitValue('');
    setBuyX('');
    setGetY('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setBannerImage('');
    setConfirmTerms(false);
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setModalMode('edit');
    setSelectedOffer(offer);
    setOfferName(offer.offerName);
    setDescription(offer.description);
    setOfferScope(offer.offerScope);
    setTargetProducts(offer.targetProducts.map(p => typeof p === 'object' ? p._id : p));
    setTargetCategories(offer.targetCategories);
    setBenefitType(offer.benefitType);
    setBenefitValue(offer.benefitValue);
    setBuyX(offer.buyX || '');
    setGetY(offer.getY || '');
    setStartDate(offer.startDate);
    setStartTime(offer.startTime);
    setEndDate(offer.endDate);
    setEndTime(offer.endTime);
    setBannerImage(offer.bannerImage || '');
    setConfirmTerms(false);
    setShowModal(true);
  };

  const submitOffer = async (e, action) => {
    e.preventDefault();
    if (!confirmTerms) {
      alert('Please confirm that all offer details are correct.');
      return;
    }
    
    const finalStatus = action === 'submit' ? 'SUBMITTED' : 'DRAFT';
    
    const offerData = {
      offerName,
      description,
      offerScope,
      benefitType,
      benefitValue: benefitType === 'buy_x_get_y' ? 0 : Number(benefitValue),
      buyX: benefitType === 'buy_x_get_y' ? Number(buyX) : 0,
      getY: benefitType === 'buy_x_get_y' ? Number(getY) : 0,
      startDate,
      startTime,
      endDate,
      endTime,
      targetProducts,
      targetCategories,
      bannerImage,
      status: finalStatus
    };
    
    try {
      if (modalMode === 'create') {
        await api.post('/offers', offerData);
        alert(finalStatus === 'SUBMITTED' ? 'Offer submitted successfully! Your offer has been sent to the admin for review.' : 'Offer saved as draft.');
      } else {
        await api.put('/offers/' + selectedOffer._id, offerData);
        alert(finalStatus === 'SUBMITTED' ? 'Offer re-submitted! Your updated offer has been sent to the admin for review.' : 'Offer updated.');
      }
      setShowModal(false);
      fetchOffers();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const deleteOffer = async (id) => {
    const isConfirmed = await showConfirm('Delete this draft offer?');
    if (isConfirmed) {
      try {
        await api.delete('/offers/' + id);
        fetchOffers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete');
      }
    }
  };

  const duplicateOffer = async (id) => {
    try {
      await api.post('/offers/' + id + '/duplicate');
      fetchOffers();
      alert('Offer duplicated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to duplicate');
    }
  };

  return (
    <div>
      <div className={styles['dashboard-header']}>
        <h1 className={styles['dashboard-title']}>Offer Management</h1>
        <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={16} /> Create New Offer
        </button>
      </div>

      {loading ? (
        <p>Loading offers...</p>
      ) : offers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <p>No offers found. Create your first offer to attract more customers!</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className={styles['table-container']}>
            <table className={styles['custom-table']}>
              <thead>
                <tr>
                  <th>Offer Title</th>
                  <th>Scope & Discount</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <tr key={offer._id}>
                    <td style={{ fontWeight: 'bold' }}>{offer.offerName}</td>
                    <td>
                      <div>{offer.offerScope.toUpperCase()}</div>
                      {offer.offerScope === 'category' && offer.targetCategories && offer.targetCategories.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                          {offer.targetCategories.join(', ')}
                        </div>
                      )}
                      {offer.offerScope === 'product' && offer.targetProducts && offer.targetProducts.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                          {offer.targetProducts.length} Product(s)
                        </div>
                      )}
                      <div style={{ color: 'var(--secondary)', marginTop: '4px', fontWeight: 'bold' }}>
                        {offer.benefitType === 'buy_x_get_y' ? `Buy ${offer.buyX} Get ${offer.getY}` : offer.benefitType === 'percentage' ? offer.benefitValue + '% OFF' : '₹' + offer.benefitValue + ' OFF'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {offer.startDate} to {offer.endDate}
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => duplicateOffer(offer._id)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Duplicate">
                          <Copy size={14} />
                        </button>
                        {['DRAFT', 'REJECTED', 'SUBMITTED'].includes(offer.status) && (
                          <button onClick={() => openEditModal(offer)} className="btn btn-secondary" style={{ padding: '0.3rem' }} title="Edit">
                            <Edit size={14} />
                          </button>
                        )}
                        {['DRAFT', 'REJECTED'].includes(offer.status) && (
                          <button onClick={() => deleteOffer(offer._id)} className="btn btn-secondary" style={{ padding: '0.3rem', color: 'red' }} title="Delete">
                            <Trash2 size={14} />
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

      {showModal && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`}>
            <button onClick={() => setShowModal(false)} className={styles['modal-close']}>
              <XCircle size={20} />
            </button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              {modalMode === 'create' ? 'Create New Offer' : 'Edit Offer'}
            </h2>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Dealer Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Dealer ID:</strong> {user._id}</div>
                  <div><strong>Name:</strong> {user.name}</div>
                  <div><strong>Business:</strong> {user.dealerProfile?.businessName}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Offer Title</label>
                <input type="text" className="form-control" value={offerName} onChange={e => setOfferName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} required rows="3" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Offer Type</label>
                  <select className="form-control" value={offerScope} onChange={e => setOfferScope(e.target.value)}>
                    <option value="product">Product Specific</option>
                    <option value="category">Category Specific</option>
                    <option value="store">Store-wide</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type</label>
                  <select className="form-control" value={benefitType} onChange={e => setBenefitType(e.target.value)}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="buy_x_get_y">Buy X Get Y</option>
                  </select>
                </div>
              </div>

              {offerScope === 'product' && (
                <div className="form-group">
                  <label className="form-label">Select Products</label>
                  <div className="form-control" style={{ height: '150px', overflowY: 'auto', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {myProducts.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No products available.</span>
                    ) : (
                      myProducts.map(p => (
                        <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          <input 
                            type="checkbox" 
                            checked={targetProducts.includes(p._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTargetProducts([...targetProducts, p._id]);
                              } else {
                                setTargetProducts(targetProducts.filter(id => id !== p._id));
                              }
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                          {p.productName} <span style={{ color: 'var(--secondary)', marginLeft: 'auto', fontWeight: '600' }}>₹{p.price}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {offerScope === 'category' && (
                <div className="form-group">
                  <label className="form-label">Select Categories</label>
                  <div className="form-control" style={{ height: '150px', overflowY: 'auto', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {categories.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No categories available.</span>
                    ) : (
                      categories.map(cat => (
                        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          <input 
                            type="checkbox" 
                            checked={targetCategories.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTargetCategories([...targetCategories, cat]);
                              } else {
                                setTargetCategories(targetCategories.filter(c => c !== cat));
                              }
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                          />
                          {cat}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {benefitType === 'buy_x_get_y' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Buy Quantity (X)</label>
                    <input type="number" className="form-control" placeholder="e.g., 5" value={buyX} onChange={e => setBuyX(e.target.value)} required min="1" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Get Free Quantity (Y)</label>
                    <input type="number" className="form-control" placeholder="e.g., 1" value={getY} onChange={e => setGetY(e.target.value)} required min="1" />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input type="number" className="form-control" value={benefitValue} onChange={e => setBenefitValue(e.target.value)} required min="1" max={benefitType === 'percentage' ? 100 : 100000} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="time" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="time" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>
              
              {startDate && startTime && endDate && endTime && (
                <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px', textAlign: 'center' }}>
                  <strong>Offer Valid From:</strong> {startDate} {startTime} <strong>To:</strong> {endDate} {endTime}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Offer Banner Image (Optional)</label>
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="form-control" style={{ padding: '0.4rem' }} />
                {bannerImage && <img src={bannerImage} alt="Preview" style={{ marginTop: '10px', maxHeight: '100px', borderRadius: '4px' }} />}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input type="checkbox" id="terms" checked={confirmTerms} onChange={e => setConfirmTerms(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <label htmlFor="terms" style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>I confirm that all offer details are correct.</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={(e) => submitOffer(e, 'draft')} className="btn btn-secondary">Save as Draft</button>
                <button type="button" onClick={(e) => submitOffer(e, 'submit')} className="btn btn-primary">
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerOfferManager;
