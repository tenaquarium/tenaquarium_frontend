import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import styles from './FreeShippingBanner.module.css';

const FreeShippingBanner = () => {
  const [active, setActive] = useState(false);
  const [displayEndDate, setDisplayEndDate] = useState('August 31, 2026');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromoConfig = async () => {
      try {
        const res = await api.get('/settings/free-shipping');
        if (res.data && res.data.status === 'ON') {
          const today = new Date().toISOString().split('T')[0];
          const { startDate, endDate } = res.data;
          let inRange = true;
          if (startDate && today < startDate) inRange = false;
          if (endDate && today > endDate) inRange = false;
          setActive(inRange);

          if (endDate) {
            const dateObj = new Date(endDate);
            if (!isNaN(dateObj.getTime())) {
              const options = { year: 'numeric', month: 'long', day: 'numeric' };
              setDisplayEndDate(dateObj.toLocaleDateString('en-US', options));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load free shipping promo configurations:', err);
      }
    };
    fetchPromoConfig();
  }, []);

  if (!active) return null;

  // Render 24 Vallisneria plants to cover all viewport widths with dense overlap
  const plantCount = 24;
  const plantsArray = Array.from({ length: plantCount });

  return (
    <div className={styles.bannerWrapper}>
      {/* Ocean Depth Light Rays */}
      <div className={styles.lightRays} />

      {/* Floating Water Particles */}
      <div className={styles.waterParticles}>
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
      </div>

      {/* Floating Ambient Bubbles */}
      <div className={styles.bubbles}>
        <div className={styles.bubble} />
        <div className={styles.bubble} />
        <div className={styles.bubble} />
        <div className={styles.bubble} />
        <div className={styles.bubble} />
        <div className={styles.bubble} />
      </div>

      {/* Large Glowing Center Bubble (Floats up and expands) */}
      <div className={styles.centerBubble} />

      {/* Story Swimming Fish (Swims across initially, bright orange) */}
      <svg className={styles.storyFish} viewBox="0 0 100 50">
        <path d="M10,25 C30,10 60,15 80,25 C90,20 95,15 100,10 C98,20 98,30 100,40 C95,35 90,30 80,25 C60,35 30,40 10,25 Z" fill="#ff7c43" />
        <circle cx="25" cy="22" r="2" fill="#fff" />
      </svg>
      
      {/* Bubbles Trail left by Story Fish */}
      <div className={styles.storyFishBubbles} style={{ left: '15%', animationDelay: '2.0s' }} />
      <div className={styles.storyFishBubbles} style={{ left: '25%', animationDelay: '2.4s' }} />
      <div className={styles.storyFishBubbles} style={{ left: '35%', animationDelay: '2.8s' }} />
      <div className={styles.storyFishBubbles} style={{ left: '50%', animationDelay: '3.3s' }} />

      {/* Realistic Marine Fish Collection */}
      
      {/* 1. Clownfish 1 (Detailed Orange with white stripes & black outlines) */}
      <svg className={`${styles.ambientFish} ${styles.clownfish1}`} viewBox="0 0 120 60">
        <defs>
          <linearGradient id="clownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5100" />
            <stop offset="50%" stopColor="#ff7a00" />
            <stop offset="100%" stopColor="#ff9f00" />
          </linearGradient>
          <linearGradient id="finGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff3c00" />
            <stop offset="100%" stopColor="#b31b00" />
          </linearGradient>
        </defs>
        {/* Dorsal Fin */}
        <path d="M35,18 Q48,2 70,7 Q78,11 82,18" fill="url(#finGrad)" stroke="#111" strokeWidth="0.8" />
        {/* Tail fin */}
        <path d="M92,30 Q112,15 118,5 Q112,22 116,30 Q112,38 116,55 Q112,45 92,30 Z" fill="url(#finGrad)" stroke="#111" strokeWidth="0.8" />
        <path d="M98,30 Q105,22 110,14 Q104,25 110,30 Q104,35 110,46 Q105,38 98,30 Z" fill="#fff" opacity="0.85" />
        {/* Ventral Fin */}
        <path d="M48,42 Q58,55 68,46" fill="url(#finGrad)" stroke="#111" strokeWidth="0.8" />
        {/* Body */}
        <path d="M10,30 Q30,11 78,16 Q94,20 96,30 Q94,40 78,44 Q30,49 10,30 Z" fill="url(#clownGrad)" stroke="#111" strokeWidth="0.8" />
        {/* White Stripes */}
        <path d="M30,13 Q35,12 36,47 Q30,46 30,13 Z" fill="#fff" stroke="#111" strokeWidth="0.6" />
        <path d="M56,14 Q61,14 60,45 Q54,45 54,14 Z" fill="#fff" stroke="#111" strokeWidth="0.6" />
        {/* Eye */}
        <circle cx="22" cy="24" r="4.2" fill="#ffd100" />
        <circle cx="22" cy="24" r="2.2" fill="#111" />
        <circle cx="23" cy="23" r="0.6" fill="#fff" />
        {/* Mouth */}
        <path d="M10,30 Q14,33 17,30" stroke="#111" strokeWidth="0.8" fill="none" />
      </svg>

      {/* 2. Clownfish 2 (Swimming back right-to-left) */}
      <svg className={`${styles.ambientFish} ${styles.clownfish2}`} viewBox="0 0 120 60">
        <defs>
          <linearGradient id="clownGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5100" />
            <stop offset="50%" stopColor="#ff7a00" />
            <stop offset="100%" stopColor="#ff9f00" />
          </linearGradient>
          <linearGradient id="finGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff3c00" />
            <stop offset="100%" stopColor="#b31b00" />
          </linearGradient>
        </defs>
        <path d="M35,18 Q48,2 70,7 Q78,11 82,18" fill="url(#finGrad2)" stroke="#111" strokeWidth="0.8" />
        <path d="M92,30 Q112,15 118,5 Q112,22 116,30 Q112,38 116,55 Q112,45 92,30 Z" fill="url(#finGrad2)" stroke="#111" strokeWidth="0.8" />
        <path d="M98,30 Q105,22 110,14 Q104,25 110,30 Q104,35 110,46 Q105,38 98,30 Z" fill="#fff" opacity="0.85" />
        <path d="M48,42 Q58,55 68,46" fill="url(#finGrad2)" stroke="#111" strokeWidth="0.8" />
        <path d="M10,30 Q30,11 78,16 Q94,20 96,30 Q94,40 78,44 Q30,49 10,30 Z" fill="url(#clownGrad2)" stroke="#111" strokeWidth="0.8" />
        <path d="M30,13 Q35,12 36,47 Q30,46 30,13 Z" fill="#fff" stroke="#111" strokeWidth="0.6" />
        <path d="M56,14 Q61,14 60,45 Q54,45 54,14 Z" fill="#fff" stroke="#111" strokeWidth="0.6" />
        <circle cx="22" cy="24" r="4.2" fill="#ffd100" />
        <circle cx="22" cy="24" r="2.2" fill="#111" />
        <circle cx="23" cy="23" r="0.6" fill="#fff" />
        <path d="M10,30 Q14,33 17,30" stroke="#111" strokeWidth="0.8" fill="none" />
      </svg>
      
      {/* 3. Blue Tang */}
      <svg className={`${styles.ambientFish} ${styles.blueTang}`} viewBox="0 0 120 60">
        <defs>
          <linearGradient id="tangBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <path d="M25,20 Q60,2 85,12 Q90,15 95,20" fill="url(#tangBlueGrad)" stroke="#111" strokeWidth="0.8" />
        <path d="M95,30 Q115,15 120,5 Q115,22 118,30 Q115,38 120,55 Q115,45 95,30 Z" fill="url(#yellowGrad)" stroke="#111" strokeWidth="0.8" />
        <path d="M10,30 Q30,8 90,18 Q98,22 98,30 Q98,38 90,42 Q30,52 10,30 Z" fill="url(#tangBlueGrad)" stroke="#111" strokeWidth="0.8" />
        <path d="M35,16 C55,14 75,18 80,24 C75,28 55,24 35,20 Z" fill="#111827" />
        <path d="M30,35 C50,34 70,38 75,40 C70,42 50,40 30,38 Z" fill="#111827" />
        <circle cx="24" cy="24" r="4.5" fill="#ffd100" />
        <circle cx="24" cy="24" r="2.2" fill="#111" />
        <circle cx="25" cy="23" r="0.6" fill="#fff" />
      </svg>

      {/* 4. Yellow Tang */}
      <svg className={`${styles.ambientFish} ${styles.yellowTang}`} viewBox="0 0 120 60">
        <defs>
          <linearGradient id="yellowTangGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        <path d="M30,15 Q60,-4 85,15" fill="url(#yellowTangGrad)" stroke="#ca8a04" strokeWidth="0.6" />
        <path d="M92,30 Q110,12 118,5 Q114,22 116,30 Q114,38 116,55 Q110,48 92,30 Z" fill="url(#yellowTangGrad)" stroke="#ca8a04" strokeWidth="0.6" />
        <path d="M35,45 Q60,62 80,45" fill="url(#yellowTangGrad)" stroke="#ca8a04" strokeWidth="0.6" />
        <path d="M8,30 Q25,2 85,18 Q92,22 92,30 Q92,38 85,42 Q25,58 8,30 Z" fill="url(#yellowTangGrad)" stroke="#ca8a04" strokeWidth="0.8" />
        <circle cx="22" cy="23" r="4" fill="#fef08a" />
        <circle cx="22" cy="23" r="2.2" fill="#854d0e" />
        <circle cx="22" cy="23" r="1.2" fill="#111" />
        <circle cx="23" cy="22" r="0.5" fill="#fff" />
      </svg>

      {/* 5. Royal Gramma */}
      <svg className={`${styles.ambientFish} ${styles.royalGramma}`} viewBox="0 0 120 60">
        <path d="M10,30 Q30,10 65,15 Q75,18 78,30 Q75,42 65,45 Q30,50 10,30 Z" fill="#c084fc" />
        <path d="M60,20 Q80,18 95,25 Q98,28 98,30 Q98,32 95,35 Q80,42 60,40 Z" fill="#facc15" />
        <path d="M95,30 Q112,15 118,5 Q112,22 116,30 Q112,38 116,55 Q112,45 95,30 Z" fill="#eab308" />
        <circle cx="22" cy="22" r="3.5" fill="#fff" />
        <circle cx="22" cy="22" r="1.5" fill="#111" />
        <circle cx="23" cy="21" r="0.5" fill="#fff" />
      </svg>

      {/* Dense Ribbon-like Vallisneria Tape Grass plants with 24 overlapping elements (no gaps) */}
      <div className={styles.bottomPlants}>
        {plantsArray.map((_, idx) => {
          // Generate pseudo-random variations for heights and organic colors using index values
          const opacity = 0.7 + (idx % 3) * 0.1;
          const fill = idx % 3 === 0 ? "#16a34a" : idx % 3 === 1 ? "#15803d" : "#22c55e";
          const altFill = idx % 2 === 0 ? "#4ade80" : "#86efac";
          
          return (
            <svg 
              key={idx} 
              className={`${styles.plant} ${styles[`plantP${(idx % 10) + 1}`]}`} 
              viewBox="0 0 100 200"
            >
              <path d="M50,200 C30,150 70,100 45,0 C55,100 35,150 50,200 Z" fill={fill} opacity={opacity} />
              <path d="M45,200 C20,130 50,80 30,10 C40,80 25,130 45,200 Z" fill="#15803d" opacity={opacity - 0.1} />
              <path d="M52,200 C65,140 35,90 60,15 C45,90 55,140 52,200 Z" fill={altFill} opacity={opacity - 0.05} />
            </svg>
          );
        })}
      </div>

      {/* Content Section (Revealed after bubble pop) */}
      <div className={styles.content}>
        <div className={styles.brand}>TEN Aquarium Special</div>
        <h2 className={styles.title}>FREE SHIPPING</h2>
        <h3 className={styles.offerFor}>FOR ALL ORDERS</h3>
        <p className={styles.validity}>Offer valid till {displayEndDate}</p>
        <button className={`btn btn-primary ${styles.btnShopNow}`} onClick={() => navigate('/products')}>
          SHOP NOW
        </button>
      </div>
    </div>
  );
};

export default FreeShippingBanner;
