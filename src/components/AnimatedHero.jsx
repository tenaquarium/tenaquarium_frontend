import React, { useEffect, useState, useRef } from 'react';
import styles from './AnimatedHero.module.css';

// 12 fish presets with species, sizes, speeds, and vertical positions
const fishPresets = [
  // LEFT -> RIGHT
  { id: 1, type: 'clownfish', dir: 'ltr', baseSize: 76, top: 16, speed: 20, delay: 0, depth: 'foreground' },
  { id: 2, type: 'blueTang', dir: 'ltr', baseSize: 84, top: 26, speed: 24, delay: 2, depth: 'foreground' },
  { id: 3, type: 'yellowTang', dir: 'ltr', baseSize: 66, top: 38, speed: 22, delay: 6, depth: 'middle' },
  { id: 4, type: 'angelfish', dir: 'ltr', baseSize: 78, top: 52, speed: 27, delay: 1, depth: 'foreground' },
  { id: 5, type: 'butterflyfish', dir: 'ltr', baseSize: 68, top: 66, speed: 23, delay: 9, depth: 'middle' },
  { id: 6, type: 'clownfish', dir: 'ltr', baseSize: 86, top: 12, speed: 28, delay: 12, depth: 'foreground' },

  // RIGHT -> LEFT
  { id: 7, type: 'clownfish', dir: 'rtl', baseSize: 78, top: 18, speed: 21, delay: 1, depth: 'foreground' },
  { id: 8, type: 'blueTang', dir: 'rtl', baseSize: 70, top: 32, speed: 23, delay: 3, depth: 'middle' },
  { id: 9, type: 'yellowTang', dir: 'rtl', baseSize: 64, top: 44, speed: 25, delay: 5, depth: 'background' },
  { id: 10, type: 'angelfish', dir: 'rtl', baseSize: 76, top: 58, speed: 28, delay: 2, depth: 'foreground' },
  { id: 11, type: 'butterflyfish', dir: 'rtl', baseSize: 66, top: 72, speed: 22, delay: 10, depth: 'middle' },
  { id: 12, type: 'clownfish', dir: 'rtl', baseSize: 82, top: 78, speed: 26, delay: 13, depth: 'foreground' }
];

const plantsCount = Array.from({ length: 28 });

const AnimatedHero = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const x = (e.clientX / clientWidth - 0.5) * 15;
      const y = (e.clientY / clientHeight - 0.5) * 15;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderVectorSVG = (type) => {
    switch (type) {
      case 'clownfish':
        return (
          <svg className={styles.fishBody} viewBox="0 0 120 60">
            <defs>
              <linearGradient id="clownGradHero" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff5100" />
                <stop offset="50%" stopColor="#ff7a00" />
                <stop offset="100%" stopColor="#ff9f00" />
              </linearGradient>
              <linearGradient id="finGradHero" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff3c00" />
                <stop offset="100%" stopColor="#b31b00" />
              </linearGradient>
            </defs>
            <path d="M35,18 Q48,2 70,7 Q78,11 82,18" fill="url(#finGradHero)" stroke="#111" strokeWidth="0.8" />
            <path d="M92,30 Q112,15 118,5 Q112,22 116,30 Q112,38 116,55 Q112,45 92,30 Z" fill="url(#finGradHero)" stroke="#111" strokeWidth="0.8" />
            <path d="M98,30 Q105,22 110,14 Q104,25 110,30 Q104,35 110,46 Q105,38 98,30 Z" fill="#fff" opacity="0.85" />
            <path d="M48,42 Q58,55 68,46" fill="url(#finGradHero)" stroke="#111" strokeWidth="0.8" />
            <path d="M10,30 Q30,11 78,16 Q94,20 96,30 Q94,40 78,44 Q30,49 10,30 Z" fill="url(#clownGradHero)" stroke="#111" strokeWidth="0.8" />
            <path d="M30,13 Q35,12 36,47 Q30,46 30,13 Z" fill="#fff" stroke="#111" strokeWidth="0.6" />
            <path d="M56,14 Q61,14 60,45 Q54,45 54,14 Z" fill="#fff" stroke="#111" strokeWidth="0.6" />
            <circle cx="22" cy="24" r="4.2" fill="#ffd100" />
            <circle cx="22" cy="24" r="2.2" fill="#111" />
          </svg>
        );
      case 'blueTang':
        return (
          <svg className={styles.fishBody} viewBox="0 0 120 60">
            <defs>
              <linearGradient id="tangBlueGradHero" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="yellowGradHero" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path d="M25,20 Q60,2 85,12 Q90,15 95,20" fill="url(#tangBlueGradHero)" stroke="#111" strokeWidth="0.8" />
            <path d="M95,30 Q115,15 120,5 Q115,22 118,30 Q115,38 120,55 Q115,45 95,30 Z" fill="url(#yellowGradHero)" stroke="#111" strokeWidth="0.8" />
            <path d="M10,30 Q30,8 90,18 Q98,22 98,30 Q98,38 90,42 Q30,52 10,30 Z" fill="url(#tangBlueGradHero)" stroke="#111" strokeWidth="0.8" />
            <path d="M35,16 C55,14 75,18 80,24 C75,28 55,24 35,20 Z" fill="#111827" />
            <circle cx="24" cy="24" r="4.5" fill="#ffd100" />
            <circle cx="24" cy="24" r="2.2" fill="#111" />
          </svg>
        );
      case 'yellowTang':
        return (
          <svg className={styles.fishBody} viewBox="0 0 120 60">
            <defs>
              <linearGradient id="yellowTangGradHero" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <path d="M30,15 Q60,-4 85,15" fill="url(#yellowTangGradHero)" stroke="#ca8a04" strokeWidth="0.6" />
            <path d="M92,30 Q110,12 118,5 Q114,22 116,30 Q114,38 116,55 Q110,48 92,30 Z" fill="url(#yellowTangGradHero)" stroke="#ca8a04" strokeWidth="0.6" />
            <path d="M8,30 Q25,2 85,18 Q92,22 92,30 Q92,38 85,42 Q25,58 8,30 Z" fill="url(#yellowTangGradHero)" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="22" cy="23" r="2.2" fill="#854d0e" />
            <circle cx="22" cy="23" r="1.2" fill="#111" />
          </svg>
        );
      case 'angelfish':
        return (
          <svg className={styles.fishBody} viewBox="0 0 120 80">
            <path d="M40,10 Q90,30 110,40 Q90,50 40,70 Q45,40 40,10 Z" fill="#c084fc" stroke="#111" strokeWidth="0.8" />
            <path d="M20,40 Q40,5 60,35 Q70,40 100,40 Q70,40 60,45 Q40,75 20,40 Z" fill="#c084fc" stroke="#111" strokeWidth="0.8" />
            <circle cx="85" cy="40" r="3" fill="#111" />
          </svg>
        );
      case 'butterflyfish':
      default:
        return (
          <svg className={styles.fishBody} viewBox="0 0 120 60">
            <path d="M10,30 Q25,5 90,20 Q95,25 95,30 Q95,35 90,40 Q25,55 10,30 Z" fill="#fbbf24" stroke="#111" strokeWidth="0.8" />
            <path d="M25,20 C45,10 70,10 75,30 C70,50 45,50 25,40 Z" fill="#111827" />
            <circle cx="82" cy="28" r="3" fill="#fff" />
            <circle cx="82" cy="28" r="1.5" fill="#111" />
          </svg>
        );
    }
  };

  const bgTransform = `translate3d(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px, 0)`;
  const fgTransform = `translate3d(${mousePos.x * -0.7}px, ${mousePos.y * -0.7}px, 0)`;

  return (
    <div className={styles.heroWrapper} ref={containerRef}>
      {/* Simple Light Blue Aquarium Background */}
      <div className={styles.aquariumBackdrop} style={{ transform: bgTransform }}>
        <div className={styles.waterBase} />
        <div className={styles.lightRays} />
      </div>

      {/* Swaying Vallisneria plants along seabed with no gaps */}
      <div className={styles.bottomPlants} style={{ transform: bgTransform }}>
        {plantsCount.map((_, idx) => {
          const opacity = 0.75 + (idx % 3) * 0.08;
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

      {/* Layer 4: Foreground & Swimming wiggling SVG fish */}
      <div className={styles.fgLayer} style={{ transform: fgTransform }}>
        {/* Floating Ambient Bubbles */}
        <div className={styles.bubbles}>
          <div className={styles.bubble} style={{ left: '12%', width: '12px', height: '12px', animationDuration: '9s' }} />
          <div className={styles.bubble} style={{ left: '26%', width: '8px', height: '8px', animationDuration: '12s' }} />
          <div className={styles.bubble} style={{ left: '42%', width: '15px', height: '15px', animationDuration: '7s' }} />
          <div className={styles.bubble} style={{ left: '60%', width: '9px', height: '9px', animationDuration: '11s' }} />
          <div className={styles.bubble} style={{ left: '76%', width: '14px', height: '14px', animationDuration: '8s' }} />
          <div className={styles.bubble} style={{ left: '88%', width: '10px', height: '10px', animationDuration: '13s' }} />
        </div>

        {/* 12 Continuous Swimming SVG Fish */}
        {fishPresets.map((fish) => {
          const isLtr = fish.dir === 'ltr';
          
          let scaleVal = 1;
          let blurVal = 'none';
          let opacityVal = '0.92';
          let zIndexVal = 3;

          if (fish.depth === 'foreground') {
            scaleVal = 1.15;
            zIndexVal = 4;
          } else if (fish.depth === 'background') {
            scaleVal = 0.75;
            blurVal = 'blur(1px)';
            opacityVal = '0.65';
            zIndexVal = 2;
          }

          const wiggleDelay = `${(fish.id % 4) * 0.08}s`;

          return (
            <div
              key={fish.id}
              className={`${styles.swimWrapper} ${isLtr ? styles.swimLTR : styles.swimRTL}`}
              style={{
                top: `${fish.top}%`,
                animationDuration: `${fish.speed}s`,
                animationDelay: `${fish.delay}s`,
                opacity: opacityVal,
                zIndex: zIndexVal,
              }}
            >
              <div 
                style={{ 
                  width: `${fish.baseSize * scaleVal}px`, 
                  height: `${(fish.baseSize * scaleVal) / 2}px`,
                  filter: blurVal,
                  animationDelay: wiggleDelay
                }}
              >
                {renderVectorSVG(fish.type)}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default AnimatedHero;
