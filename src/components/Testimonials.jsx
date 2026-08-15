import React, { useEffect, useState } from 'react';
import styles from './Testimonials.module.css';
import api from '../utils/api';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/approved');
        setReviews(res.data);
      } catch (error) {
        console.error('Error fetching approved reviews', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return null; // Silent load on footer
  }

  if (reviews.length === 0) {
    return null;
  }

  // Duplicate items for infinite scroll effect in CSS
  const scrollItems = [...reviews, ...reviews];

  return (
    <section className={styles['testimonials-section']}>
      <h3 className={styles['section-title']} style={{ marginTop: '0', marginBottom: '2rem', fontSize: '1.8rem' }}>
        What Our Aquarists Say
      </h3>
      <div className={styles['testimonials-track-container']}>
        <div className={styles['testimonials-track']}>
          {scrollItems.map((rev, idx) => (
            <div key={`${rev._id}-${idx}`} className={`glass-panel ${styles['testimonial-card']}`}>
              <div className={styles['testimonial-header']}>
                <span className={styles['testimonial-name']}>{rev.customerId?.name || 'Anonymous Customer'}</span>
                <div style={{ display: 'flex', color: 'var(--warning)' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < rev.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
              <p className={styles['testimonial-text']}>"{rev.review}"</p>
              <div className={styles['testimonial-prod']}>
                On: {rev.productId?.productName || 'Aquarium Item'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
