import React, { useState } from 'react';
import styles from './CourierCalculator.module.css';
import { Calculator, ArrowRight, Check, AlertCircle, Loader, HelpCircle, Package } from 'lucide-react';
import api from '../utils/api';

const CourierCalculator = () => {
  const [formData, setFormData] = useState({
    pickupPincode: '',
    deliveryPincode: '',
    actualWeight: '',
    length: '',
    width: '',
    height: '',
    shipmentType: 'Non-Document',
    serviceType: 'Surface',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePincodeChange = (e, name) => {
    const val = e.target.value.replace(/\D/g, ''); // keep digits only
    if (val.length === 0) {
      setFormData((prev) => ({ ...prev, [name]: '' }));
    } else if (val[0] !== '0' && val.length <= 6) {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handlePositiveNumberChange = (e, name) => {
    const val = e.target.value;
    if (val === '' || Number(val) >= 0) {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResults(null);

    // Validation checks
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(formData.pickupPincode)) {
      setErrorMsg('Pickup pincode must be a valid 6-digit Indian PIN code.');
      return;
    }
    if (!pincodeRegex.test(formData.deliveryPincode)) {
      setErrorMsg('Delivery pincode must be a valid 6-digit Indian PIN code.');
      return;
    }

    const weight = Number(formData.actualWeight);
    if (isNaN(weight) || weight <= 0) {
      setErrorMsg('Actual weight must be a positive number greater than 0.');
      return;
    }

    const l = Number(formData.length);
    const w = Number(formData.width);
    const h = Number(formData.height);
    if (isNaN(l) || l <= 0 || isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setErrorMsg('Dimensions (Length, Width, Height) must be positive values greater than 0.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/courier/calculate', {
        pickupPincode: formData.pickupPincode,
        deliveryPincode: formData.deliveryPincode,
        actualWeight: weight,
        length: l,
        width: w,
        height: h,
        shipmentType: formData.shipmentType,
        serviceType: formData.serviceType,
      });

      if (res.data.success) {
        setResults(res.data);
      } else {
        setErrorMsg('Calculation failed. Please verify your inputs.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'An error occurred during calculation. Pincode might be out of service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ padding: '3rem 5%' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className={styles['hero-title']} style={{ fontSize: '2.8rem', marginBottom: '0.8rem' }}>Courier Charge Calculator</h1>
        <p className={styles['hero-subtitle']}>
          Calculate and compare shipping rates instantly for Professional Courier, ST Courier, and DTDC.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem', maxWidth: '1100px', margin: '0 auto', alignItems: 'start' }}>
        
        {/* Left Form Panel */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Calculator size={20} />
            Shipment Parameters
          </h3>

          {errorMsg && (
            <div className="alert alert-danger" style={{ fontSize: '0.85rem', padding: '0.8rem', marginBottom: '1.2rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Pickup PIN</label>
              <input
                type="text"
                required
                placeholder="e.g. 600001"
                value={formData.pickupPincode}
                onChange={(e) => handlePincodeChange(e, 'pickupPincode')}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery PIN</label>
              <input
                type="text"
                required
                placeholder="e.g. 641001"
                value={formData.deliveryPincode}
                onChange={(e) => handlePincodeChange(e, 'deliveryPincode')}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Actual Weight (Kg)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 2.5"
              value={formData.actualWeight}
              onChange={(e) => handlePositiveNumberChange(e, 'actualWeight')}
              className="form-control"
            />
          </div>

          <label className="form-label" style={{ marginTop: '1rem', display: 'block' }}>Package Dimensions (cm)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="number"
                required
                placeholder="L"
                value={formData.length}
                onChange={(e) => handlePositiveNumberChange(e, 'length')}
                className="form-control"
                style={{ textAlign: 'center' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="number"
                required
                placeholder="W"
                value={formData.width}
                onChange={(e) => handlePositiveNumberChange(e, 'width')}
                className="form-control"
                style={{ textAlign: 'center' }}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <input
                type="number"
                required
                placeholder="H"
                value={formData.height}
                onChange={(e) => handlePositiveNumberChange(e, 'height')}
                className="form-control"
                style={{ textAlign: 'center' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Shipment Type</label>
              <select
                name="shipmentType"
                value={formData.shipmentType}
                onChange={handleChange}
                className={styles['category-select']}
                style={{ height: '46px' }}
              >
                <option value="Non-Document">Non-Document</option>
                <option value="Document">Document (cheaper)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className={styles['category-select']}
                style={{ height: '46px' }}
              >
                <option value="Surface">Surface</option>
                <option value="Express">Express</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1.2rem', padding: '0.8rem' }}>
            {loading ? (
              <>
                <Loader size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                Calculating...
              </>
            ) : (
              <>
                <Calculator size={18} />
                Calculate & Compare Rates
              </>
            )}
          </button>
        </form>

        {/* Right Output Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Default state: No results yet */}
          {!results && !loading && (
            <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', borderStyle: 'dashed' }}>
              <Package size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>No Calculation Data Yet</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '350px' }}>
                Fill in the pickup pincode, delivery pincode, weight and dimensions on the left to estimate courier fees.
              </p>
            </div>
          )}

          {/* Loading state visual indicator */}
          {loading && (
            <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="spinner" style={{ width: '40px', height: '40px' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '1rem' }}>Computing Zone & Weight Rates</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Fetching rate sheets and applying fuel surcharges and taxes...
              </p>
            </div>
          )}

          {/* Results state */}
          {results && !loading && (
            <>
              {/* Weight Metric Cards */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Actual Weight</div>
                  <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{results.actualWeight} Kg</strong>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volumetric Weight</div>
                  <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{results.volumetricWeight.toFixed(2)} Kg</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chargeable Weight</div>
                  <strong style={{ fontSize: '1.3rem', color: 'var(--secondary)' }}>{results.chargeableWeight} Kg</strong>
                </div>
              </div>

              {/* Route Summary */}
              <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Origin ({results.pickupZone})</span>
                  <strong>{formData.pickupPincode} ({results.pickupState})</strong>
                </div>
                <ArrowRight size={20} style={{ color: 'var(--primary)' }} />
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Destination ({results.deliveryZone})</span>
                  <strong>{formData.deliveryPincode} ({results.deliveryState})</strong>
                </div>
              </div>

              {/* Quotes comparison list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>Available Courier Rates</h4>
                
                {results.quotes.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent)' }}>
                    <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.9rem' }}>No active rate cards found for this route and shipment configuration.</p>
                  </div>
                ) : (
                  results.quotes.map((quote, index) => {
                    const isCheapest = index === 0; // Sorted ascending
                    return (
                      <div
                        key={quote.courierName}
                        className="glass-panel"
                        style={{
                          padding: '1.5rem',
                          position: 'relative',
                          border: isCheapest ? '2px solid var(--secondary)' : '1px solid var(--border-color)',
                          boxShadow: isCheapest ? '0 8px 24px rgba(5, 150, 105, 0.15)' : 'var(--glass-shadow)',
                          background: isCheapest ? 'rgba(5, 150, 105, 0.03)' : 'var(--bg-card)',
                          overflow: 'hidden',
                        }}
                      >
                        {isCheapest && (
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              background: 'var(--secondary)',
                              color: 'white',
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 12px',
                              borderBottomLeftRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Check size={12} />
                            CHEAPEST
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div>
                            <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>{quote.courierName}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              Est. Delivery: <strong>{quote.estDays} Days</strong>
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Final Courier Charge</span>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: isCheapest ? 'var(--secondary)' : 'var(--primary)' }}>
                              ₹{quote.finalAmount.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Expandable/detailed pricing breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: 'rgba(255, 255, 255, 0.4)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.1)', fontSize: '0.8rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Base Charge</span>
                            <strong>₹{quote.baseCharge}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Fuel Surcharge</span>
                            <strong>₹{quote.fuelCharge}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>GST (18%)</span>
                            <strong>₹{quote.gst}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Final Cost</span>
                            <strong>₹{quote.finalAmount}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Shipment Feature Matrix info card */}
      <div className="glass-panel" style={{ maxWidth: '1100px', margin: '3rem auto 0', padding: '2rem' }}>
        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <HelpCircle size={20} style={{ color: 'var(--primary)' }} />
          Calculation Methodology & Notes
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <div>
            <strong>⚖️ Chargeable Weight Rules:</strong>
            <p>
              Courier companies charge based on the space occupied or the actual weight, whichever is higher.
              Volumetric Weight is calculated as: <code>(Length × Width × Height) / 5000</code>.
              The chargeable weight is rounded up to the nearest 0.5 kg slab.
            </p>
          </div>
          <div>
            <strong>⛽ Fuel & Taxes:</strong>
            <p>
              Fuel surcharges (10% to 15%) vary across partners and are added directly to the base pricing.
              A standard 18% GST rate is applied on the sum of base charges and fuel surcharges to yield the final payable amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierCalculator;
