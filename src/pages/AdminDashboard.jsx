import React, { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';
import api from '../utils/api';
import Loader from '../components/Loader';
import { useAlert } from '../context/AlertContext';
import { Shield, Users, Store, Package, DollarSign, FileText, Check, X, Edit, Trash2, ShieldAlert, CheckCircle, MessageSquare, Truck, Plus, Menu, Clock, TrendingUp, Settings } from 'lucide-react';

import { useInvalidateProductCache } from '../hooks/useProducts';

const AdminDashboard = () => {
  const { showConfirm, showPrompt } = useAlert();
  const invalidateProductCache = useInvalidateProductCache();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);
  
  // Lists data
  const [customers, setCustomers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState('All');
  const [refundSubFilter, setRefundSubFilter] = useState('Pending');
  const [reviews, setReviews] = useState([]);
  const [reviewsFilter, setReviewsFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const getDocLabel = (docType) => {
    if (docType === 'pan') return 'PAN Card';
    if (docType === 'iso') return 'ISO Certificate';
    if (docType === 'aadhaar') return 'Aadhaar Card';
    return 'MSME Certificate';
  };

  const getDocLabelShort = (docType) => {
    if (docType === 'pan') return 'PAN';
    if (docType === 'iso') return 'ISO';
    if (docType === 'aadhaar') return 'Aadhaar';
    return 'MSME';
  };

  const openMsmeCertificate = (base64Data, filename = 'MSME Certificate') => {
    if (!base64Data) return;
    if (base64Data.startsWith('http') || base64Data.startsWith('/')) {
      window.open(base64Data, '_blank');
    } else {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.title = filename;
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
        link.download = filename + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Courier States
  const [rates, setRates] = useState([]);
  const [zones, setZones] = useState([]);
  const [courierTab, setCourierTab] = useState('rates'); // 'rates' or 'zones' or 'freeShipping'
  const [promoStatus, setPromoStatus] = useState('OFF');
  const [promoStartDate, setPromoStartDate] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');

  // Categories States
  const [categoriesList, setCategoriesList] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Compass');

  // Courier Rates Form State
  const [rateForm, setRateForm] = useState({
    id: '',
    courierName: 'Professional Courier',
    fromZone: 'Zone A',
    toZone: 'Zone A',
    shipmentType: 'Non-Document',
    serviceType: 'Surface',
    baseWeight: '1.0',
    basePrice: '',
    additionalKgPrice: '',
    fuelChargePercent: '10',
    gstPercent: '18',
    activeStatus: true,
    estDays: '3',
  });

  // Zone Mappings Form State
  const [zoneForm, setZoneForm] = useState({
    id: '',
    pincodeStart: '',
    pincodeEnd: '',
    zone: 'Zone A',
    stateName: '',
  });

  // Modals state
  const [showEditModal, setShowEditModal] = useState(null); // 'customer' or 'dealer' or 'product'
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState(null);

  // Form states for edits
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('active');

  const [editBusinessName, setEditBusinessName] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStock, setEditProdStock] = useState('');

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    try {
      await api.post('/categories', { name: newCategoryName.trim(), iconName: newCategoryIcon });
      alert('Category added successfully!');
      setNewCategoryName('');
      setNewCategoryIcon('Compass');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirm = await showConfirm('Are you sure you want to delete this category?');
    if (confirm) {
      try {
        await api.delete(`/categories/${id}`);
        alert('Category deleted successfully!');
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, custRes, dealRes, prodRes, orderRes, revRes, ratesRes, zonesRes, catsRes] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/users/customers'),
        api.get('/dealers'),
        api.get('/products'),
        api.get('/orders'),
        api.get('/reviews'),
        api.get('/courier/rates').catch(err => {
          console.error('Error fetching courier rates', err);
          return { data: [] };
        }),
        api.get('/courier/zones').catch(err => {
          console.error('Error fetching zone mappings', err);
          return { data: [] };
        }),
        api.get('/categories').catch(err => {
          console.error('Error fetching categories', err);
          return { data: [] };
        })
      ]);

      setStats(statsRes.data);
      setCustomers(custRes.data);
      setDealers(dealRes.data);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
      setReviews(revRes.data);
      setRates(ratesRes.data);
      setZones(zonesRes.data);
      setCategoriesList(catsRes.data);

      try {
        const settingsRes = await api.get('/settings/free-shipping');
        if (settingsRes.data) {
          setPromoStatus(settingsRes.data.status || 'OFF');
          setPromoStartDate(settingsRes.data.startDate || '');
          setPromoEndDate(settingsRes.data.endDate || '');
        }
      } catch (settingsErr) {
        console.error('Error fetching settings for free shipping promo:', settingsErr);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Lock body scroll when overlay modals are open
  useEffect(() => {
    if (showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditModal]);

  // 1. Customer Actions
  const handleToggleBlockCustomer = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      await api.put(`/users/customers/${id}/block`, { status: nextStatus });
      alert(`Customer account is now ${nextStatus}`);
      fetchAdminData();
    } catch (error) {
      alert('Failed to update customer status');
    }
  };

  const handleDeleteCustomer = async (id) => {
    const confirm = await showConfirm('Are you sure you want to delete this customer account?');
    if (confirm) {
      try {
        await api.delete(`/users/customers/${id}`);
        alert('Customer deleted successfully');
        fetchAdminData();
      } catch (error) {
        alert('Deletion failed');
      }
    }
  };

  // Open Edit Customer Modal
  const openEditCustomer = (customer) => {
    setSelectedItem(customer);
    setEditName(customer.name);
    setEditEmail(customer.email);
    setEditPhone(customer.phone);
    setEditStatus(customer.status);
    setShowEditModal('customer');
  };

  const handleEditCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/customers/${selectedItem._id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
      });
      alert('Customer updated successfully');
      setShowEditModal(null);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  // 2. Dealer Actions
  const handleDealerApproval = async (id, status) => {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = await showPrompt('Please enter the reason for rejecting this dealer approval:', 'Reason for rejection...');
      if (rejectionReason === null) return; // User cancelled
      if (!rejectionReason.trim()) {
        alert('Rejection reason is required!');
        return;
      }
    }
    try {
      await api.put(`/dealers/${id}/approval`, { approvalStatus: status, rejectionReason });
      alert(`Dealer registration has been ${status}`);
      fetchAdminData();
    } catch (error) {
      alert('Failed to update dealer approval status');
    }
  };

  const handleDeleteDealer = async (id) => {
    const confirm = await showConfirm('Warning: Deleting a dealer deletes their account, business profile, and all associated product listings. Proceed?');
    if (confirm) {
      try {
        await api.delete(`/dealers/${id}`);
        alert('Dealer profile and listings deleted successfully');
        fetchAdminData();
      } catch (error) {
        alert('Deletion failed');
      }
    }
  };

  // Open Edit Dealer Modal
  const openEditDealer = (dealer) => {
    setSelectedItem(dealer);
    setEditBusinessName(dealer.businessName);
    setEditName(dealer.ownerName);
    setEditEmail(dealer.email);
    setEditPhone(dealer.phone);
    setEditAddress(dealer.address);
    setShowEditModal('dealer');
  };

  const handleEditDealerSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/dealers/${selectedItem._id}`, {
        businessName: editBusinessName,
        ownerName: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
      });
      alert('Dealer profile updated');
      setShowEditModal(null);
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  // 3. Product Actions
  const openEditProduct = (prod) => {
    setSelectedItem(prod);
    setEditProdName(prod.productName);
    setEditProdPrice(prod.price.toString());
    setEditProdStock(prod.stock.toString());
    setShowEditModal('product');
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${selectedItem._id}`, {
        productName: editProdName,
        price: Number(editProdPrice),
        stock: Number(editProdStock),
      });
      alert('Product listings updated');
      invalidateProductCache();
      setShowEditModal(null);
      fetchAdminData();
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirm = await showConfirm('Delete this product listing?');
    if (confirm) {
      try {
        await api.delete(`/products/${id}`);
        alert('Product deleted');
        invalidateProductCache();
        fetchAdminData();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  // 4. Order Actions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { orderStatus: newStatus });
      alert(`Order status updated to ${newStatus}`);
      fetchAdminData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirm = await showConfirm('Are you sure you want to cancel this order?');
    if (confirm) {
      try {
        await api.put(`/orders/${orderId}`, { orderStatus: 'Cancelled' });
        alert('Order has been cancelled.');
        fetchAdminData();
      } catch (error) {
        alert('Failed to cancel order.');
      }
    }
  };

  const handleSavePromoConfig = async () => {
    try {
      await api.post('/settings/free-shipping', {
        status: promoStatus,
        startDate: promoStartDate,
        endDate: promoEndDate,
      });
      alert('Free shipping campaign configuration updated successfully!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update campaign configurations.');
    }
  };

  // 5. Review Actions
  const handleReviewModeration = async (id, status) => {
    try {
      await api.put(`/reviews/${id}/moderate`, { status });
      alert(`Review has been moderated to: ${status}`);
      fetchAdminData();
    } catch (error) {
      alert('Failed to moderate review');
    }
  };

  const handleDeleteReview = async (id) => {
    const confirm = await showConfirm('Delete this review permanently?');
    if (confirm) {
      try {
        await api.delete(`/reviews/${id}`);
        alert('Review deleted');
        fetchAdminData();
      } catch (error) {
        alert('Failed to delete review');
      }
    }
  };

  // --- COURIER MANAGEMENT HANDLERS ---
  const handleSaveRate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courier/rates', {
        id: rateForm.id || undefined,
        courierName: rateForm.courierName,
        fromZone: rateForm.fromZone,
        toZone: rateForm.toZone,
        shipmentType: rateForm.shipmentType,
        serviceType: rateForm.serviceType,
        baseWeight: Number(rateForm.baseWeight),
        basePrice: Number(rateForm.basePrice),
        additionalKgPrice: Number(rateForm.additionalKgPrice),
        fuelChargePercent: Number(rateForm.fuelChargePercent),
        gstPercent: Number(rateForm.gstPercent),
        activeStatus: rateForm.activeStatus,
        estDays: Number(rateForm.estDays),
      });
      alert(rateForm.id ? 'Rate card updated successfully' : 'Rate card added successfully');
      setShowEditModal(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save rate card');
    }
  };

  const handleDeleteRate = async (id) => {
    const confirm = await showConfirm('Are you sure you want to delete this courier rate card?');
    if (confirm) {
      try {
        await api.delete(`/courier/rates/${id}`);
        alert('Rate card deleted successfully');
        fetchAdminData();
      } catch (err) {
        alert('Failed to delete rate card');
      }
    }
  };

  const handleToggleRateStatus = async (rate) => {
    try {
      await api.post('/courier/rates', {
        id: rate._id,
        activeStatus: !rate.activeStatus,
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update active status');
    }
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(zoneForm.pincodeStart) || !pincodeRegex.test(zoneForm.pincodeEnd)) {
      alert('Pincodes must be valid 6-digit Indian PIN codes.');
      return;
    }
    try {
      await api.post('/courier/zones', {
        id: zoneForm.id || undefined,
        pincodeStart: zoneForm.pincodeStart,
        pincodeEnd: zoneForm.pincodeEnd,
        zone: zoneForm.zone,
        stateName: zoneForm.stateName,
      });
      alert(zoneForm.id ? 'Zone mapping updated successfully' : 'Zone mapping added successfully');
      setShowEditModal(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save zone mapping');
    }
  };

  const handleDeleteZone = async (id) => {
    const confirm = await showConfirm('Are you sure you want to delete this zone mapping?');
    if (confirm) {
      try {
        await api.delete(`/courier/zones/${id}`);
        alert('Zone mapping deleted successfully');
        fetchAdminData();
      } catch (err) {
        alert('Failed to delete zone mapping');
      }
    }
  };

  const openAddRate = () => {
    setRateForm({
      id: '',
      courierName: 'Professional Courier',
      fromZone: 'Zone A',
      toZone: 'Zone A',
      shipmentType: 'Non-Document',
      serviceType: 'Surface',
      baseWeight: '1.0',
      basePrice: '',
      additionalKgPrice: '',
      fuelChargePercent: '10',
      gstPercent: '18',
      activeStatus: true,
      estDays: '3',
    });
    setShowEditModal('courierRate');
  };

  const openEditRate = (rate) => {
    setRateForm({
      id: rate._id,
      courierName: rate.courierName,
      fromZone: rate.fromZone,
      toZone: rate.toZone,
      shipmentType: rate.shipmentType,
      serviceType: rate.serviceType,
      baseWeight: rate.baseWeight.toString(),
      basePrice: rate.basePrice.toString(),
      additionalKgPrice: rate.additionalKgPrice.toString(),
      fuelChargePercent: rate.fuelChargePercent.toString(),
      gstPercent: rate.gstPercent.toString(),
      activeStatus: rate.activeStatus,
      estDays: rate.estDays.toString(),
    });
    setShowEditModal('courierRate');
  };

  const openAddZone = () => {
    setZoneForm({
      id: '',
      pincodeStart: '',
      pincodeEnd: '',
      zone: 'Zone A',
      stateName: '',
    });
    setShowEditModal('courierZone');
  };

  const openEditZone = (zoneMapping) => {
    setZoneForm({
      id: zoneMapping._id,
      pincodeStart: zoneMapping.pincodeStart,
      pincodeEnd: zoneMapping.pincodeEnd,
      zone: zoneMapping.zone,
      stateName: zoneMapping.stateName,
    });
    setShowEditModal('courierZone');
  };

  if (loading) {
    return <Loader message="Loading master dashboard logs..." />;
  }

  return (
    <div className="main-content">
      <div className={styles['dashboard-container']}>
        {/* Sidebar */}
        <aside className={styles['sidebar-menu']}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', gap: '0.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Shield size={30} />
            </div>
            <h4 style={{ fontWeight: '700', fontSize: '1rem', textAlign: 'center' }}>Admin Console</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Super Admin</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'overview' ? styles['active'] : ''}`} onClick={() => setActiveTab('overview')}>
            <Shield size={22} />
            <span>Overview</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'customers' ? styles['active'] : ''}`} onClick={() => setActiveTab('customers')}>
            <Users size={22} />
            <span>Customers</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'dealers' ? styles['active'] : ''}`} onClick={() => setActiveTab('dealers')}>
            <Store size={22} />
            <span>Dealers</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'products' ? styles['active'] : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={22} />
            <span>Products</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'orders' ? styles['active'] : ''}`} onClick={() => setActiveTab('orders')}>
            <FileText size={22} />
            <span>Orders</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'reviews' ? styles['active'] : ''}`} onClick={() => setActiveTab('reviews')}>
            <MessageSquare size={22} />
            <span>Reviews Moderation</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'courier' ? styles['active'] : ''}`} onClick={() => setActiveTab('courier')}>
            <Truck size={22} />
            <span>Courier Settings</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'payments' ? styles['active'] : ''}`} onClick={() => setActiveTab('payments')}>
            <DollarSign size={22} />
            <span>Payments</span>
          </div>

          <div className={`${styles['sidebar-item']} ${activeTab === 'categories' ? styles['active'] : ''}`} onClick={() => setActiveTab('categories')}>
            <Settings size={22} />
            <span>Categories</span>
          </div>
        </aside>

        {/* Main Panel Content */}
        <main className={styles['dashboard-main']}>
          {activeTab === 'overview' && stats && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>System Overview</h1>
              </div>

              {/* Stats grid */}
              <div className={styles['stats-grid']}>
                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Total Customers</span>
                    <div className={styles['stats-value']}>{stats.totalCustomers}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)' }}>
                    <Users size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Approved Dealers</span>
                    <div className={styles['stats-value']}>{stats.totalDealers}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary)' }}>
                    <Store size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Active Listings</span>
                    <div className={styles['stats-value']}>{stats.totalProducts}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)' }}>
                    <Package size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Aggregate Revenue</span>
                    <div className={styles['stats-value']}>₹{stats.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <DollarSign size={24} />
                  </div>
                </div>
              </div>

              {/* Monthly Sales Table */}
              <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                  Platform Financial History
                </h3>
                <div className={styles['table-container']}>
                  <table className={styles['custom-table']}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Total Orders</th>
                        <th>Aggregate Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.monthlySalesReport.map((report, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{report.month}</td>
                          <td>{report.orders} transactions</td>
                          <td style={{ color: 'var(--secondary)', fontWeight: '700' }}>₹{report.sales.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Customer Management</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14, 165, 233, 0.08)', borderRadius: '12px' }}>
                  <Users size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)' }}>Total Customers: {customers.length}</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div className={styles['table-container']}>
                  <table className={styles['custom-table']}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((cust) => (
                        <tr key={cust._id}>
                          <td style={{ fontWeight: '600' }}>{cust.name}</td>
                          <td>{cust.email}</td>
                          <td>{cust.phone}</td>
                          <td>
                            <span className={styles['stock-status']} style={{ background: cust.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: cust.status === 'active' ? 'var(--success)' : 'var(--error)' }}>
                              {cust.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openEditCustomer(cust)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleToggleBlockCustomer(cust._id, cust.status)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--warning)' }} title={cust.status === 'active' ? 'Block Account' : 'Unblock Account'}>
                                <ShieldAlert size={14} />
                              </button>
                              <button onClick={() => handleDeleteCustomer(cust._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dealers' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Dealer Management</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(20, 184, 166, 0.08)', borderRadius: '12px' }}>
                  <Store size={16} style={{ color: 'var(--secondary)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--secondary)' }}>Total Dealers: {dealers.filter(d => d.approvalStatus === 'approved').length}</span>
                </div>
              </div>

              {/* Pending Dealers Section */}
              <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                  Pending Store Approvals
                </h3>
                
                {dealers.filter(d => d.approvalStatus === 'pending').length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No pending registrations.</p>
                ) : (
                  <div className={styles['table-container']}>
                    <table className={styles['custom-table']}>
                      <thead>
                        <tr>
                          <th>Logo</th>
                          <th>Business Name</th>
                          <th>Owner</th>
                          <th>Details & MSME</th>
                          <th>Address</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dealers.filter(d => d.approvalStatus === 'pending').map((deal) => (
                          <tr key={deal._id}>
                            <td>
                              <img 
                                src={deal.logo || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=50'} 
                                alt="Logo" 
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', background: '#f8fafc', border: '1px solid var(--border-color)' }} 
                              />
                            </td>
                            <td style={{ fontWeight: '600' }}>{deal.businessName}</td>
                            <td>{deal.ownerName}</td>
                            <td>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <div style={{ marginBottom: '0.2rem' }}><strong>Desc:</strong> {deal.description || 'No description'}</div>
                                {deal.msmeCertificate && (
                                  <button 
                                    type="button" 
                                    onClick={() => openMsmeCertificate(deal.msmeCertificate, `${deal.businessName} ${getDocLabel(deal.selectedDocType)}`)} 
                                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
                                  >
                                    View {getDocLabel(deal.selectedDocType)}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td>{deal.address}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleDealerApproval(deal._id, 'approved')} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--success)' }}>
                                  <Check size={14} /> Approve
                                </button>
                                <button onClick={() => handleDealerApproval(deal._id, 'rejected')} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }}>
                                  <X size={14} /> Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Approved Dealers list */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                  Approved Store Directory
                </h3>
                <div className={styles['table-container']}>
                  <table className={styles['custom-table']}>
                    <thead>
                      <tr>
                        <th>Logo</th>
                        <th>Store Name</th>
                        <th>Owner</th>
                        <th>Email</th>
                        <th>Verification Doc</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealers.filter(d => d.approvalStatus === 'approved').map((deal) => (
                        <tr key={deal._id}>
                          <td>
                            <img 
                              src={deal.logo || 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=50'} 
                              alt="Logo" 
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', background: '#f8fafc', border: '1px solid var(--border-color)' }} 
                            />
                          </td>
                          <td style={{ fontWeight: '600' }}>{deal.businessName}</td>
                          <td>{deal.ownerName}</td>
                          <td>{deal.email}</td>
                          <td>
                            {deal.msmeCertificate ? (
                              <button 
                                type="button" 
                                onClick={() => openMsmeCertificate(deal.msmeCertificate, `${deal.businessName} ${getDocLabel(deal.selectedDocType)}`)} 
                                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: '600', textDecoration: 'underline', fontSize: '0.85rem', cursor: 'pointer', font: 'inherit' }}
                              >
                                View {getDocLabelShort(deal.selectedDocType)}
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None</span>
                            )}
                          </td>
                          <td>
                            <span className={`${styles['stock-status']} ${styles['stock-in']}`}>Approved</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openEditDealer(deal)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteDealer(deal._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>System Product Inventory</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '12px' }}>
                  <Package size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--accent)' }}>Total Products: {products.length}</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div className={styles['table-container']}>
                  <table className={styles['custom-table']}>
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Seller Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod._id}>
                          <td>
                            <img
                              src={prod.images[0]}
                              alt={prod.productName}
                              style={{ width: '45px', height: '35px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          </td>
                          <td style={{ fontWeight: '600' }}>{prod.productName}</td>
                          <td>{prod.category}</td>
                          <td style={{ color: 'var(--secondary)', fontWeight: '600' }}>₹{prod.price.toLocaleString()}</td>
                          <td>{prod.stock} items</td>
                          <td>{prod.dealerId?.name || 'Unknown Store'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => openEditProduct(prod)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Global Platform Orders</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px' }}>
                  <FileText size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--success)' }}>Total Orders: {orders.length}</span>
                </div>
              </div>

              {/* UPI QR Payment Approval Requests Box */}
              {(() => {
                const pendingUpiOrders = orders.filter(
                  (ord) =>
                    ord.paymentMethod === 'UPI-QR' &&
                    ord.paymentStatus === 'pending' &&
                    new Date(ord.qrPaymentExpiresAt).getTime() > now
                );

                if (pendingUpiOrders.length === 0) return null;

                const formatTime = (secs) => {
                  const m = Math.floor(secs / 60);
                  const s = secs % 60;
                  return `${m}:${s < 10 ? '0' : ''}${s}`;
                };

                return (
                  <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '2px dashed var(--primary)', background: 'rgba(2, 132, 199, 0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      ⚡ Pending UPI QR Payment Verifications ({pendingUpiOrders.length})
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                      {pendingUpiOrders.map((ord) => {
                        const secondsLeft = Math.max(0, Math.floor((new Date(ord.qrPaymentExpiresAt).getTime() - now) / 1000));
                        return (
                          <div key={ord._id} className="glass-panel" style={{ padding: '1.2rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.8rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Order #{ord.customOrderId || ord._id.slice(-6)}</span>
                              <span style={{ fontWeight: '800', fontSize: '0.85rem', color: secondsLeft <= 30 ? 'var(--accent)' : 'var(--primary)', background: secondsLeft <= 30 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(2, 132, 199, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                                ⏱️ {formatTime(secondsLeft)}
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div>Customer: <strong>{ord.customerId?.name}</strong> ({ord.customerId?.phone})</div>
                              <div>Amount: <strong style={{ color: 'var(--secondary)' }}>₹{ord.totalAmount.toLocaleString()}</strong></div>
                              <div style={{ padding: '6px', background: 'rgba(14, 165, 233, 0.05)', borderRadius: '6px', border: '1px dashed var(--border-color)', marginTop: '0.3rem', fontSize: '0.8rem' }}>
                                Submitted UPI ID: <strong style={{ color: 'var(--primary)' }}>{ord.customerUpiId || 'Waiting for proof submission...'}</strong>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                              <button
                                onClick={async () => {
                                  try {
                                    await api.put(`/orders/${ord._id}`, { paymentStatus: 'paid', orderStatus: 'Processing' });
                                    alert('Order payment approved!');
                                    fetchAdminData();
                                  } catch (err) {
                                    alert('Failed to approve payment');
                                  }
                                }}
                                className="btn btn-primary"
                                style={{ padding: '0.4rem', fontSize: '0.8rem', flexGrow: 1 }}
                                disabled={!ord.customerUpiId}
                              >
                                YES / Approve
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await api.put(`/orders/${ord._id}`, { paymentStatus: 'failed', orderStatus: 'Cancelled' });
                                    alert('Order payment rejected and order cancelled.');
                                    fetchAdminData();
                                  } catch (err) {
                                    alert('Failed to reject payment');
                                  }
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem', fontSize: '0.8rem', color: 'var(--accent)', borderColor: 'rgba(244, 63, 94, 0.2)', flexGrow: 1 }}
                              >
                                NO / Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="glass-panel" style={{ padding: '2rem' }}>
                {/* Order category filter sub-tabs */}
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setOrdersFilter('All')}
                    className={`btn ${ordersFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOrdersFilter('Processing')}
                    className={`btn ${ordersFilter === 'Processing' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    Process
                  </button>
                  <button
                    onClick={() => setOrdersFilter('Delivered')}
                    className={`btn ${ordersFilter === 'Delivered' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => setOrdersFilter('Refunded')}
                    className={`btn ${ordersFilter === 'Refunded' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    Refunded
                  </button>
                </div>

                {ordersFilter === 'Refunded' ? (
                  <div>
                    {/* Refund sub-tabs */}
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setRefundSubFilter('Pending')}
                        className={`btn ${refundSubFilter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
                      >
                        Pending Refunds
                      </button>
                      <button
                        onClick={() => setRefundSubFilter('Completed')}
                        className={`btn ${refundSubFilter === 'Completed' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
                      >
                        Completed Refunds
                      </button>
                      <button
                        onClick={() => setRefundSubFilter('All')}
                        className={`btn ${refundSubFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', borderRadius: '8px' }}
                      >
                        All Refunds
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {(() => {
                        const filtered = orders.filter((ord) => {
                          if (ord.orderStatus !== 'Cancelled' || ord.paymentStatus !== 'paid') return false;
                          const isCompleted = ord.cancellationDetails?.refundStatus === 'Completed';
                          if (refundSubFilter === 'Pending') return !isCompleted;
                          if (refundSubFilter === 'Completed') return isCompleted;
                          return true;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                              No {refundSubFilter.toLowerCase()} refunded orders found.
                            </div>
                          );
                        }
                        return filtered.map((ord) => {
                          const refundAmount = ord.cancellationDetails?.refundAmount || (ord.totalAmount * (ord.cancellationDetails?.refundPercentage || 100) / 100);
                          const reason = ord.cancellationDetails?.cancellationReason || 'Cancelled by customer';
                          const isCompleted = ord.cancellationDetails?.refundStatus === 'Completed';
                          return (
                            <div
                              key={ord._id}
                              className="glass-panel"
                              style={{
                                padding: '1.2rem',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                background: 'rgba(255, 255, 255, 0.45)',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <span style={{ fontWeight: '800', color: 'var(--primary)' }}>Order #{ord.customOrderId || ord._id.slice(-6)}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  {isCompleted ? (
                                    <span style={{ fontWeight: '800', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                                      ✓ Refunded
                                    </span>
                                  ) : (
                                    <span style={{ fontWeight: '800', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                                      Pending Payout
                                    </span>
                                  )}
                                  <span style={{ fontWeight: '800', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                                    Refund: ₹{refundAmount.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                              Customer: <strong>{ord.customerId?.name || 'Unknown'}</strong>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                              Phone: <strong>{ord.customerId?.phone || 'N/A'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                              <div style={{
                                fontSize: '0.8rem',
                                padding: '6px 10px',
                                background: 'rgba(2, 132, 199, 0.04)',
                                borderRadius: '6px',
                                borderLeft: '3px solid var(--primary)',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flex: 1
                              }}>
                                Reason: {reason}
                              </div>
                              <button
                                onClick={() => setSelectedRefundOrder(ord)}
                                className="btn btn-primary"
                                style={{
                                  padding: '0.4rem 1rem',
                                  fontSize: '0.8rem',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                  <div className={styles['table-container']}>
                    <table className={styles['custom-table']}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Value</th>
                          <th>Method</th>
                          <th>Payment Status</th>
                          {ordersFilter !== 'Delivered' && <th>Order Status</th>}
                          {ordersFilter !== 'Delivered' && <th>Actions</th>}
                          {ordersFilter === 'Delivered' && <th>Dealer Payout</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filtered = orders.filter((ord) => {
                            if (ordersFilter === 'Processing') {
                              return ord.orderStatus !== 'Delivered' && ord.orderStatus !== 'Cancelled';
                            }
                            if (ordersFilter === 'Delivered') {
                              return ord.orderStatus === 'Delivered';
                            }
                            return true; // 'All'
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={ordersFilter === 'Delivered' ? 7 : 8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                  No orders found in this category.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map((ord) => (
                            <tr key={ord._id}>
                              <td style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                 #{ord._id.slice(-6)}
                                 {ord.courierService && (
                                   <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                     <div>Shipping: <strong>{ord.deliveryCharge > 0 ? `₹${ord.deliveryCharge}` : 'Free'}</strong></div>
                                     <div>Packing: <strong>₹{ord.packingCharge !== undefined ? ord.packingCharge : (ord.deliveryCharge ? 0 : 40)}</strong></div>
                                   </div>
                                 )}
                                 {ord.orderStatus === 'Cancelled' && ord.cancellationDetails && ord.cancellationDetails.agreedToPolicy && (
                                   <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.04)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.12)', color: 'var(--text-primary)', fontWeight: 'normal', width: '220px', lineHeight: '1.4', textAlign: 'left' }}>
                                     <div style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>Refund Information:</div>
                                     <div>Refund: <strong style={{ color: 'var(--success)' }}>₹{ord.cancellationDetails.refundAmount?.toLocaleString() || (ord.totalAmount * (ord.cancellationDetails.refundPercentage || 100) / 100).toLocaleString()}</strong> ({ord.cancellationDetails.refundPercentage || 100}%)</div>
                                     <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '2px 0 4px' }}>Reason: {ord.cancellationDetails.cancellationReason || 'Cancelled by customer'}</div>
                                     <div style={{ fontWeight: 'bold', borderTop: '1px dashed rgba(239, 68, 68, 0.15)', paddingTop: '4px', marginTop: '4px', color: 'var(--text-secondary)' }}>Bank Account:</div>
                                     <div>Bank: {ord.cancellationDetails.bankName || 'N/A'}</div>
                                     <div>Acc No: {ord.cancellationDetails.accountNumber || 'N/A'}</div>
                                     <div>IFSC: {ord.cancellationDetails.ifscCode || 'N/A'}</div>
                                   </div>
                                 )}
                               </td>
                              <td>
                                <div>{ord.customerId?.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ord.customerId?.phone}</div>
                              </td>
                              <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                              <td style={{ fontWeight: '700' }}>₹{ord.totalAmount.toLocaleString()}</td>
                              <td>{ord.paymentMethod}</td>
                              <td>
                                {ord.paymentStatus === 'paid' || ord.paymentStatus === 'failed' || ord.orderStatus === 'Delivered' || ord.orderStatus === 'Cancelled' ? (
                                  <span style={{
                                    color: ord.paymentStatus === 'paid' ? '#10b981' : ord.paymentStatus === 'pending' ? '#f59e0b' : '#ef4444',
                                    fontWeight: '700',
                                    textTransform: 'capitalize',
                                    fontSize: '0.85rem'
                                  }}>
                                    {ord.paymentStatus}
                                  </span>
                                ) : (
                                  <select
                                    value={ord.paymentStatus}
                                    onChange={(e) => api.put(`/orders/${ord._id}`, { paymentStatus: e.target.value }).then(() => fetchAdminData())}
                                    className={styles['sort-select']}
                                    style={{ width: '110px', padding: '4px', fontSize: '0.85rem' }}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                  </select>
                                )}
                              </td>
                              {ordersFilter !== 'Delivered' && (
                                <td>
                                  {ord.orderStatus === 'Delivered' || ord.orderStatus === 'Cancelled' ? (
                                    <span style={{
                                      color: ord.orderStatus === 'Delivered' ? '#10b981' : '#ef4444',
                                      fontWeight: '700',
                                      textTransform: 'capitalize',
                                      fontSize: '0.85rem'
                                    }}>
                                      {ord.orderStatus}
                                    </span>
                                  ) : (
                                    <select
                                      value={ord.orderStatus}
                                      onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                                      className={styles['sort-select']}
                                      style={{ width: '130px', padding: '4px', fontSize: '0.85rem', color: ord.orderStatus === 'Delivered' ? 'var(--success)' : ord.orderStatus === 'Cancelled' ? 'var(--error)' : 'inherit' }}
                                    >
                                      <option value="Processing">Processing</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  )}
                                </td>
                              )}
                              {ordersFilter !== 'Delivered' && (
                                <td>
                                  {ord.orderStatus !== 'Cancelled' && ord.orderStatus !== 'Delivered' && (
                                    <button onClick={() => handleCancelOrder(ord._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)', fontSize: '0.8rem' }}>
                                      Cancel
                                    </button>
                                  )}
                                </td>
                              )}
                              {ordersFilter === 'Delivered' && (
                                <td>
                                  <select
                                    value={ord.dealerPayoutStatus || 'Pending'}
                                    onChange={(e) => api.put(`/orders/${ord._id}/dealer-payout`, { payoutStatus: e.target.value }).then(() => fetchAdminData())}
                                    className={styles['sort-select']}
                                    style={{ width: '120px', padding: '4px', fontSize: '0.85rem', fontWeight: 'bold', color: ord.dealerPayoutStatus === 'Paid' ? 'var(--success)' : ord.dealerPayoutStatus === 'Processing' ? 'var(--warning)' : 'inherit' }}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Paid">Paid</option>
                                  </select>
                                </td>
                              )}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Customer Review Moderation</h1>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px' }}>
                  <MessageSquare size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f59e0b' }}>Total Reviews: {reviews.length}</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                {/* Review status category sub-tabs */}
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setReviewsFilter('All')}
                    className={`btn ${reviewsFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setReviewsFilter('pending')}
                    className={`btn ${reviewsFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setReviewsFilter('approved')}
                    className={`btn ${reviewsFilter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setReviewsFilter('rejected')}
                    className={`btn ${reviewsFilter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    Rejected
                  </button>
                </div>

                <div className={styles['table-container']}>
                  <table className={styles['custom-table']}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>User</th>
                        <th>Rating</th>
                        <th>Review Text</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = reviews.filter((rev) => {
                          if (reviewsFilter === 'All') return true;
                          return (rev.status || '').toLowerCase() === reviewsFilter.toLowerCase();
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                No reviews found in this category.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((rev) => (
                          <tr key={rev._id}>
                            <td style={{ fontWeight: '600' }}>{rev.productId?.productName}</td>
                            <td>
                              {rev.source === 'google' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <strong>{rev.authorName || 'Google User'}</strong>
                                  <span style={{ fontSize: '0.65rem', background: 'rgba(2, 132, 199, 0.08)', color: 'var(--primary)', padding: '2px 5px', borderRadius: '4px', fontWeight: '700' }}>
                                    Google
                                  </span>
                                </span>
                              ) : (
                                rev.customerId?.name || 'Verified Buyer'
                              )}
                            </td>
                            <td style={{ color: 'var(--warning)', fontWeight: '700' }}>{rev.rating} ★</td>
                            <td style={{ maxWidth: '250px', whiteSpace: 'normal', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              "{rev.review}"
                            </td>
                            <td>
                              <span className={styles['stock-status']} style={{
                                background: rev.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : rev.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: rev.status === 'approved' ? 'var(--success)' : rev.status === 'pending' ? '#f59e0b' : 'var(--error)'
                              }}>
                                {rev.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {rev.status !== 'approved' && (
                                  <button onClick={() => handleReviewModeration(rev._id, 'approved')} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--success)' }} title="Approve Review">
                                    <Check size={14} />
                                  </button>
                                )}
                                {rev.status !== 'rejected' && (
                                  <button onClick={() => handleReviewModeration(rev._id, 'rejected')} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--warning)' }} title="Reject/Hide Review">
                                    <X size={14} />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteReview(rev._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }} title="Delete Review">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courier' && (
            <div>
              <div className={styles['dashboard-header']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className={styles['dashboard-title']}>Courier & Logistics Settings</h1>
                {courierTab !== 'freeShipping' && (
                  <button
                    onClick={courierTab === 'rates' ? openAddRate : openAddZone}
                    className="btn btn-primary"
                  >
                    <Plus size={16} />
                    {courierTab === 'rates' ? 'Add Rate Card' : 'Add Zone Mapping'}
                  </button>
                )}
              </div>

              {/* Subtabs for rates vs zones */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCourierTab('rates')}
                  className="btn"
                  style={{
                    padding: '0.5rem 1.2rem',
                    background: courierTab === 'rates' ? 'var(--primary)' : 'transparent',
                    color: courierTab === 'rates' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Rate Cards ({rates.length})
                </button>
                <button
                  onClick={() => setCourierTab('zones')}
                  className="btn"
                  style={{
                    padding: '0.5rem 1.2rem',
                    background: courierTab === 'zones' ? 'var(--primary)' : 'transparent',
                    color: courierTab === 'zones' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Zone Mappings ({zones.length})
                </button>
                <button
                  onClick={() => setCourierTab('freeShipping')}
                  className="btn"
                  style={{
                    padding: '0.5rem 1.2rem',
                    background: courierTab === 'freeShipping' ? 'var(--primary)' : 'transparent',
                    color: courierTab === 'freeShipping' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  Free Shipping Campaign
                </button>
              </div>

              {courierTab === 'rates' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div className={styles['table-container']}>
                    <table className={styles['custom-table']}>
                      <thead>
                        <tr>
                          <th>Courier Name</th>
                          <th>Route</th>
                          <th>Service / Type</th>
                          <th>Base Slab</th>
                          <th>Additional Kg</th>
                          <th>Fuel %</th>
                          <th>GST %</th>
                          <th>Est. Days</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates.map((rate) => (
                          <tr key={rate._id}>
                            <td style={{ fontWeight: '600' }}>{rate.courierName}</td>
                            <td style={{ fontSize: '0.85rem' }}>
                              <strong>{rate.fromZone}</strong> ➔ <strong>{rate.toZone}</strong>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>
                              <span style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '2px 6px', borderRadius: '4px', marginRight: '4px', fontWeight: '600', color: 'var(--primary)' }}>
                                {rate.serviceType}
                              </span>
                              <span style={{ background: 'rgba(5, 150, 105, 0.08)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', color: 'var(--secondary)' }}>
                                {rate.shipmentType}
                              </span>
                            </td>
                            <td>₹{rate.basePrice} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({rate.baseWeight}kg)</span></td>
                            <td>₹{rate.additionalKgPrice}</td>
                            <td>{rate.fuelChargePercent}%</td>
                            <td>{rate.gstPercent}%</td>
                            <td>{rate.estDays} Days</td>
                            <td>
                              <span
                                className={`stock-status ${rate.activeStatus ? 'stock-in' : 'stock-out'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleToggleRateStatus(rate)}
                                title="Click to toggle status"
                              >
                                {rate.activeStatus ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => openEditRate(rate)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--primary)' }} title="Edit">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteRate(rate._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }} title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {courierTab === 'zones' && (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <div className={styles['table-container']}>
                    <table className={styles['custom-table']}>
                      <thead>
                        <tr>
                          <th>PIN Range</th>
                          <th>Zone Assigned</th>
                          <th>State Name</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zones.map((z) => (
                          <tr key={z._id}>
                            <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                              {z.pincodeStart} - {z.pincodeEnd}
                            </td>
                            <td>
                              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{z.zone}</span>
                            </td>
                            <td>{z.stateName}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => openEditZone(z)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--primary)' }} title="Edit">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteZone(z._id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--accent)' }} title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {courierTab === 'freeShipping' && (
                <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                    Free Shipping Promo Campaign Configuration
                  </h3>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Campaign Status</label>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.4rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                        <input
                          type="radio"
                          name="promoStatus"
                          checked={promoStatus === 'OFF'}
                          onChange={() => setPromoStatus('OFF')}
                          style={{ cursor: 'pointer' }}
                        />
                        Campaign Disabled (OFF)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                        <input
                          type="radio"
                          name="promoStatus"
                          checked={promoStatus === 'ON'}
                          onChange={() => setPromoStatus('ON')}
                          style={{ cursor: 'pointer' }}
                        />
                        Campaign Active (ON)
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Campaign Start Date</label>
                      <input
                        type="date"
                        value={promoStartDate}
                        onChange={(e) => setPromoStartDate(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Campaign End Date</label>
                      <input
                        type="date"
                        value={promoEndDate}
                        onChange={(e) => setPromoEndDate(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSavePromoConfig}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem', fontWeight: '700' }}
                  >
                    Save Campaign Configuration
                  </button>
                </div>
              )}

            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Payments & Payouts</h1>
              </div>

              {/* Stats Grid */}
              <div className={styles['stats-grid']} style={{ marginBottom: '2rem' }}>
                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Total Dealer Earnings</span>
                    <div className={styles['stats-value']} style={{ color: 'var(--secondary)' }}>
                      ₹{orders.filter(o => o.orderStatus === 'Delivered').reduce((sum, o) => sum + (o.products.reduce((s, p) => s + (p.price * p.quantity), 0)), 0).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary)' }}>
                    <TrendingUp size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Payouts Paid</span>
                    <div className={styles['stats-value']} style={{ color: 'var(--success)' }}>
                      ₹{orders.filter(o => o.orderStatus === 'Delivered' && o.dealerPayoutStatus === 'Paid').reduce((sum, o) => sum + (o.products.reduce((s, p) => s + (p.price * p.quantity), 0)), 0).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    <Check size={24} />
                  </div>
                </div>

                <div className={`glass-panel ${styles['stats-card']}`}>
                  <div>
                    <span className={styles['stats-label']}>Payouts Pending</span>
                    <div className={styles['stats-value']} style={{ color: 'var(--warning)' }}>
                      ₹{orders.filter(o => o.orderStatus === 'Delivered' && (!o.dealerPayoutStatus || o.dealerPayoutStatus === 'Pending')).reduce((sum, o) => sum + (o.products.reduce((s, p) => s + (p.price * p.quantity), 0)), 0).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles['stats-icon-wrapper']} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                    <Clock size={24} />
                  </div>
                </div>
              </div>

              {/* Payouts list panel */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                  Dealer Payout Requests (Delivered Orders)
                </h3>
                {orders.filter(o => o.orderStatus === 'Delivered').length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No delivered orders to show payouts.</p>
                ) : (
                  <div className={styles['table-container']}>
                    <table className={styles['custom-table']}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Dealer / Store</th>
                          <th>Bank Details</th>
                          <th>Amount</th>
                          <th>Payout Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o => o.orderStatus === 'Delivered').map((ord) => {
                          const dealerUser = ord.products[0]?.dealerId;
                          const dealerId = typeof dealerUser === 'object' ? dealerUser?._id : dealerUser;
                          const dealer = dealers.find(d => d.userId === dealerId || (d.userId?._id === dealerId) || d._id === dealerId) || {};
                          const payoutAmt = ord.products.reduce((s, p) => s + (p.price * p.quantity), 0);

                          return (
                            <tr key={ord._id}>
                              <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                                #{ord.customOrderId || ord._id.slice(-6)}
                              </td>
                              <td>
                                <div style={{ fontWeight: '600' }}>{dealer.businessName || 'Unknown Store'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner: {dealer.ownerName || 'N/A'}</div>
                              </td>
                              <td>
                                {dealer.accountNumber ? (
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                    <div><strong>Holder:</strong> {dealer.accountHolderName}</div>
                                    <div><strong>A/C No:</strong> {dealer.accountNumber}</div>
                                    <div><strong>Bank:</strong> {dealer.bankName} ({dealer.branchName})</div>
                                    <div><strong>IFSC:</strong> {dealer.ifscCode}</div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>
                                )}
                              </td>
                              <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>
                                ₹{payoutAmt.toLocaleString()}
                              </td>
                              <td>
                                <select
                                  value={ord.dealerPayoutStatus || 'Pending'}
                                  onChange={(e) => api.put(`/orders/${ord._id}/dealer-payout`, { payoutStatus: e.target.value }).then(() => fetchAdminData())}
                                  className={styles['sort-select']}
                                  style={{ width: '130px', padding: '4px', fontSize: '0.85rem', fontWeight: 'bold', color: ord.dealerPayoutStatus === 'Paid' ? 'var(--success)' : ord.dealerPayoutStatus === 'Processing' ? 'var(--warning)' : 'inherit' }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Paid">Paid</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className={styles['dashboard-header']}>
                <h1 className={styles['dashboard-title']}>Category Management</h1>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                {/* Left Column: Category List */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 className={styles['panel-subheading']} style={{ color: 'var(--secondary)', marginBottom: '1.2rem', fontSize: '1.1rem', fontWeight: '800' }}>
                    Active Product Categories
                  </h3>

                  {categoriesList.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No categories found. Seed database or add one to start.</div>
                  ) : (
                    <div className={styles['table-container']}>
                      <table className={styles['custom-table']}>
                        <thead>
                          <tr>
                            <th>Category Name</th>
                            <th>Associated Icon</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoriesList.map((cat) => (
                            <tr key={cat._id}>
                              <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{cat.name}</td>
                              <td>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                  {cat.iconName}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  onClick={() => handleDeleteCategory(cat._id)}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.35rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                                  title="Delete Category"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Column: Add Category Form */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 className={styles['panel-subheading']} style={{ color: 'var(--primary)', marginBottom: '1.2rem', fontSize: '1.1rem', fontWeight: '800' }}>
                    Create New Category
                  </h3>

                  <form onSubmit={handleAddCategory}>
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                      <label className="form-label">Category Name</label>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Aquarium Soil"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Lucide Icon Type</label>
                      <select
                        value={newCategoryIcon}
                        onChange={(e) => setNewCategoryIcon(e.target.value)}
                        className="form-control"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-main)', cursor: 'pointer' }}
                      >
                        <option value="Fish" style={{ background: '#1e293b' }}>Fish Icon</option>
                        <option value="Zap" style={{ background: '#1e293b' }}>Zap / Spark Icon</option>
                        <option value="Compass" style={{ background: '#1e293b' }}>Compass / Tank Icon</option>
                        <option value="Award" style={{ background: '#1e293b' }}>Award / Badge Icon</option>
                        <option value="ShieldAlert" style={{ background: '#1e293b' }}>Shield Alert Icon</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Plus size={16} /> Add Category
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Customer Modal */}
      {showEditModal === 'customer' && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Edit Customer Account</h3>
            <form onSubmit={handleEditCustomerSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="form-control">
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dealer Modal */}
      {showEditModal === 'dealer' && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Edit Dealer Profile</h3>
            <form onSubmit={handleEditDealerSubmit}>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input type="text" required value={editBusinessName} onChange={(e) => setEditBusinessName(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Owner Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Business Email</label>
                <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Business Phone</label>
                <input type="tel" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Business Address</label>
                <textarea required value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="form-control" rows={3}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal === 'product' && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Moderate Product Listing</h3>
            <form onSubmit={handleEditProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" required value={editProdName} onChange={(e) => setEditProdName(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input type="number" required value={editProdPrice} onChange={(e) => setEditProdPrice(e.target.value)} className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Inventory</label>
                <input type="number" required value={editProdStock} onChange={(e) => setEditProdStock(e.target.value)} className="form-control" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courier Rate Edit/Add Modal */}
      {showEditModal === 'courierRate' && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              {rateForm.id ? 'Edit Courier Rate Card' : 'Add Courier Rate Card'}
            </h3>
            <form onSubmit={handleSaveRate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Courier Partner</label>
                  <select
                    value={rateForm.courierName}
                    onChange={(e) => setRateForm({ ...rateForm, courierName: e.target.value })}
                    className="form-control"
                  >
                    <option value="Professional Courier">Professional Courier</option>
                    <option value="ST Courier">ST Courier</option>
                    <option value="DTDC">DTDC</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Type</label>
                  <select
                    value={rateForm.serviceType}
                    onChange={(e) => setRateForm({ ...rateForm, serviceType: e.target.value })}
                    className="form-control"
                  >
                    <option value="Surface">Surface</option>
                    <option value="Express">Express</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">From Zone</label>
                  <select
                    value={rateForm.fromZone}
                    onChange={(e) => setRateForm({ ...rateForm, fromZone: e.target.value })}
                    className="form-control"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                    <option value="Zone E">Zone E</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To Zone</label>
                  <select
                    value={rateForm.toZone}
                    onChange={(e) => setRateForm({ ...rateForm, toZone: e.target.value })}
                    className="form-control"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                    <option value="Zone E">Zone E</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Shipment Type</label>
                  <select
                    value={rateForm.shipmentType}
                    onChange={(e) => setRateForm({ ...rateForm, shipmentType: e.target.value })}
                    className="form-control"
                  >
                    <option value="Document">Document</option>
                    <option value="Non-Document">Non-Document</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Est. Delivery (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={rateForm.estDays}
                    onChange={(e) => setRateForm({ ...rateForm, estDays: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Wt (Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={rateForm.baseWeight}
                    onChange={(e) => setRateForm({ ...rateForm, baseWeight: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Base Cost (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rateForm.basePrice}
                    onChange={(e) => setRateForm({ ...rateForm, basePrice: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Add'l Kg (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rateForm.additionalKgPrice}
                    onChange={(e) => setRateForm({ ...rateForm, additionalKgPrice: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                <div className="form-group">
                  <label className="form-label">Fuel Surcharge (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rateForm.fuelChargePercent}
                    onChange={(e) => setRateForm({ ...rateForm, fuelChargePercent: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Tax (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={rateForm.gstPercent}
                    onChange={(e) => setRateForm({ ...rateForm, gstPercent: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={rateForm.activeStatus ? 'true' : 'false'}
                    onChange={(e) => setRateForm({ ...rateForm, activeStatus: e.target.value === 'true' })}
                    className="form-control"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Rate Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zone Mapping Edit/Add Modal */}
      {showEditModal === 'courierZone' && (
        <div className={styles['modal-overlay']}>
          <div className={`glass-panel ${styles['modal-content']}`} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              {zoneForm.id ? 'Edit Zone Mapping' : 'Add Zone Mapping'}
            </h3>
            <form onSubmit={handleSaveZone}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">PIN Start</label>
                  <input
                    type="text"
                    required
                    pattern="[1-9][0-9]{5}"
                    placeholder="e.g. 600001"
                    value={zoneForm.pincodeStart}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length === 0 || (val[0] !== '0' && val.length <= 6)) {
                        setZoneForm({ ...zoneForm, pincodeStart: val });
                      }
                    }}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN End</label>
                  <input
                    type="text"
                    required
                    pattern="[1-9][0-9]{5}"
                    placeholder="e.g. 649999"
                    value={zoneForm.pincodeEnd}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length === 0 || (val[0] !== '0' && val.length <= 6)) {
                        setZoneForm({ ...zoneForm, pincodeEnd: val });
                      }
                    }}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Zone</label>
                  <select
                    value={zoneForm.zone}
                    onChange={(e) => setZoneForm({ ...zoneForm, zone: e.target.value })}
                    className="form-control"
                  >
                    <option value="Zone A">Zone A</option>
                    <option value="Zone B">Zone B</option>
                    <option value="Zone C">Zone C</option>
                    <option value="Zone D">Zone D</option>
                    <option value="Zone E">Zone E</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">State / Region Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tamil Nadu"
                    value={zoneForm.stateName}
                    onChange={(e) => setZoneForm({ ...zoneForm, stateName: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary" style={{ flexGrow: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Mapping</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refunded order details popup modal */}
      {selectedRefundOrder && (
        <div className={styles['modal-overlay']} onClick={() => setSelectedRefundOrder(null)}>
          <div className={`glass-panel ${styles['modal-content']}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '16px', padding: '2rem' }}>
            <button className={styles['modal-close']} onClick={() => setSelectedRefundOrder(null)}>&times;</button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'var(--primary)', margin: 0 }}>
              Order Details #{selectedRefundOrder._id.slice(-6)}
            </h3>
            
            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Customer Info */}
              <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(2, 132, 199, 0.02)', border: '1px solid rgba(2, 132, 199, 0.08)' }}>
                <h4 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.95rem', marginTop: 0 }}>👤 Customer Info</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <div>Name: <strong>{selectedRefundOrder.customerId?.name || 'N/A'}</strong></div>
                  <div>Phone: <strong>{selectedRefundOrder.customerId?.phone || 'N/A'}</strong></div>
                  <div style={{ gridColumn: '1 / -1' }}>Email: <strong>{selectedRefundOrder.customerId?.email || 'N/A'}</strong></div>
                </div>
              </div>

              {/* Payout & Cancellation info */}
              {selectedRefundOrder.cancellationDetails && (
                <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                  <h4 style={{ fontWeight: '700', color: '#ef4444', marginBottom: '0.5rem', fontSize: '0.95rem', marginTop: 0 }}>💸 Refund & Bank Account Payout</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div>Refund Amount: <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>₹{(selectedRefundOrder.cancellationDetails.refundAmount || (selectedRefundOrder.totalAmount * (selectedRefundOrder.cancellationDetails.refundPercentage || 100) / 100)).toLocaleString()}</strong> ({selectedRefundOrder.cancellationDetails.refundPercentage || 100}%)</div>
                    <div>Reason: <strong>{selectedRefundOrder.cancellationDetails.cancellationReason || 'Cancelled by customer'}</strong></div>
                    <div style={{ borderTop: '1px dashed rgba(239, 68, 68, 0.15)', paddingTop: '0.4rem', marginTop: '0.4rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Customer Payout Details:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <div>Bank: <strong>{selectedRefundOrder.cancellationDetails.bankName || 'N/A'}</strong></div>
                      <div>IFSC Code: <strong>{selectedRefundOrder.cancellationDetails.ifscCode || 'N/A'}</strong></div>
                      <div style={{ gridColumn: '1 / -1' }}>Account Number: <strong>{selectedRefundOrder.cancellationDetails.accountNumber || 'N/A'}</strong></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment / Refund Completed Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                {selectedRefundOrder.cancellationDetails?.refundStatus === 'Completed' ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} /> Refund Payment Completed & Email Sent
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const confirm = await showConfirm(`Are you sure the refund payment for Order #${selectedRefundOrder.customOrderId || selectedRefundOrder._id.slice(-6)} has been completed? A confirmation email will be sent to the customer.`);
                      if (confirm) {
                        try {
                          await api.put(`/orders/${selectedRefundOrder._id}/refund-complete`);
                          alert('Refund payment marked as completed! Customer has been notified via email.');
                          fetchAdminData();
                          setSelectedRefundOrder(null);
                        } catch (err) {
                          alert(err.response?.data?.message || 'Failed to update refund status');
                        }
                      }
                    }}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      padding: '0.7rem 1.4rem',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      borderRadius: '10px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <CheckCircle size={18} /> Payment Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
