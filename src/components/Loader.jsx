import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ message = "Synchronizing aquarium environments..." }) => {
  return (
    <div className={styles['loading-spinner-container']}>
      <div className={styles['loader-aquarium']}>
        {/* Under-water caustics and reflections */}
        <div className={styles['aquarium-caustics']}></div>
        <div className={styles['aquarium-light-rays']}></div>

        {/* Ambient floating water particles */}
        <div className={`${styles['water-particle']} ${styles['part-1']}`}></div>
        <div className={`${styles['water-particle']} ${styles['part-2']}`}></div>
        <div className={`${styles['water-particle']} ${styles['part-3']}`}></div>
        <div className={`${styles['water-particle']} ${styles['part-4']}`}></div>
        <div className={`${styles['water-particle']} ${styles['part-5']}`}></div>
        <div className={`${styles['water-particle']} ${styles['part-6']}`}></div>

        {/* Floating rising air bubbles */}
        <div className={`bubble-1 ${styles['bubble']}`}></div>
        <div className={`bubble-2 ${styles['bubble']}`}></div>
        <div className={`bubble-3 ${styles['bubble']}`}></div>
        <div className={`bubble-4 ${styles['bubble']}`}></div>
        <div className={`bubble-5 ${styles['bubble']}`}></div>

        {/* Bubble-based Progress Ring */}
        <div className={styles['progress-ring-container']}>
          <svg className={styles['progress-ring-svg']} viewBox="0 0 220 220">
            {/* Background ring of soft bubble dots */}
            <circle className={styles['progress-ring-track']} cx="110" cy="110" r="95" />
            {/* Active spinning progress ring of glowing bubbles */}
            <circle className={styles['progress-ring-active']} cx="110" cy="110" r="95" />
          </svg>
        </div>

        {/* Circular swimming Koi Carp path wrapper */}
        <div className={styles['koi-swim-wrapper']}>
          {/* Water ripples trailing the fish */}
          <div className={styles['koi-ripple-trail']}>
            <div className={`${styles['koi-ripple']} ${styles['rp-1']}`}></div>
            <div className={`${styles['koi-ripple']} ${styles['rp-2']}`}></div>
            <div className={`${styles['koi-ripple']} ${styles['rp-3']}`}></div>
          </div>

          {/* Premium Detailed Golden-Orange Koi Carp Fish SVG */}
          <svg className={styles['koi-carp-svg']} viewBox="0 0 120 120" width="75" height="75">
            <defs>
              {/* Shaded gold-orange gradient for realistic body */}
              <linearGradient id="goldBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff7ed" /> {/* Shimmering white highlight */}
                <stop offset="20%" stopColor="#fed7aa" /> {/* Golden light */}
                <stop offset="60%" stopColor="#ea580c" /> {/* Warm Golden-Orange */}
                <stop offset="100%" stopColor="#9a3412" /> {/* Shadow rust-orange */}
              </linearGradient>
              {/* Soft translucent gold-orange gradient for flowing fins */}
              <linearGradient id="goldFinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(253, 224, 71, 0.9)" /> {/* Bright Gold */}
                <stop offset="50%" stopColor="rgba(249, 115, 22, 0.75)" /> {/* Orange */}
                <stop offset="100%" stopColor="rgba(220, 38, 38, 0.3)" /> {/* Soft Crimson tip */}
              </linearGradient>
            </defs>

            {/* Pelvic Fins (positioned under the body for realism) */}
            <g className={styles['koi-pelvic-fins']}>
              <path d="M 46 72 C 38 76, 36 82, 40 86 C 44 86, 46 80, 48 76 Z" fill="url(#goldFinGrad)" stroke="#9a3412" strokeWidth="0.6" />
              <path d="M 60 75 C 66 79, 66 85, 62 88 C 59 88, 58 82, 57 78 Z" fill="url(#goldFinGrad)" stroke="#9a3412" strokeWidth="0.8" />
            </g>

            {/* Left Pectoral Fin - fluttering movement */}
            <g className={styles['koi-fin-left']}>
              <path 
                d="M 44 42 C 22 36, 12 50, 18 64 C 26 66, 36 56, 40 47 Z" 
                fill="url(#goldFinGrad)" 
                stroke="#9a3412" 
                strokeWidth="1.2" 
              />
              {/* Fin rays/details */}
              <path d="M 40 47 C 30 45, 20 50, 20 58 M 39 49 C 32 50, 24 54, 23 60 M 38 52 C 32 54, 28 58, 26 62" stroke="#ffedd5" strokeWidth="0.8" fill="none" opacity="0.6" />
            </g>

            {/* Right Pectoral Fin */}
            <g className={styles['koi-fin-right']}>
              <path 
                d="M 66 45 C 86 42, 94 56, 86 70 C 78 70, 70 60, 68 50 Z" 
                fill="url(#goldFinGrad)" 
                stroke="#9a3412" 
                strokeWidth="1.2" 
              />
              {/* Fin rays/details */}
              <path d="M 68 50 C 78 52, 84 58, 83 66 M 69 53 C 76 56, 80 61, 79 68" stroke="#ffedd5" strokeWidth="0.8" fill="none" opacity="0.6" />
            </g>

            {/* Main curved body group - wiggles slightly */}
            <g className={styles['koi-body-group']}>
              {/* Curved body shape */}
              <path 
                d="M 56 22 C 58 17, 52 17, 50 20 C 36 32, 36 60, 48 82 C 54 90, 60 95, 66 96 C 62 92, 56 86, 54 75 C 50 56, 50 32, 56 22 Z" 
                fill="url(#goldBodyGrad)" 
                stroke="#7c2d12" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Shimmering scales patterns */}
              <path d="M 46 40 C 48 42, 50 42, 52 40" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" fill="none" />
              <path d="M 44 48 C 47 50, 50 50, 52 48" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" fill="none" />
              <path d="M 45 56 C 48 58, 51 58, 53 56" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" fill="none" />
              <path d="M 47 64 C 50 66, 53 66, 55 64" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="0.8" fill="none" />

              {/* Shimmering patches (top row third fish has orange-red head and spine patches) */}
              <path 
                d="M 53 22 C 43 28, 42 38, 48 46 C 52 44, 53 34, 54 26 Z" 
                fill="#ea580c" 
                stroke="#9a3412" 
                strokeWidth="0.8" 
              />
              <path 
                d="M 45 54 C 43 62, 46 68, 50 72 C 52 68, 51 60, 48 56 Z" 
                fill="#ea580c" 
                stroke="#9a3412" 
                strokeWidth="0.8" 
              />
              <path 
                d="M 49 42 C 45 46, 46 50, 50 52 C 52 48, 51 44, 49 42 Z" 
                fill="#f97316" 
                stroke="#c2410c" 
                strokeWidth="0.8" 
              />
              <path 
                d="M 51 76 C 55 82, 59 86, 62 88 C 61 84, 57 80, 53 76 Z" 
                fill="#f97316" 
                stroke="#c2410c" 
                strokeWidth="0.8" 
              />

              {/* Dorsal Fin along spine */}
              <path d="M 51 44 Q 48 60 55 78" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 51 44 Q 48 60 55 78" stroke="#fff7ed" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />

              {/* Barbels (Whiskers) */}
              <path d="M 48 18 Q 43 17 40 20" stroke="#7c2d12" strokeWidth="1" fill="none" strokeLinecap="round" />
              <path d="M 52 16 Q 51 12 53 10" stroke="#7c2d12" strokeWidth="1" fill="none" strokeLinecap="round" />

              {/* Realistic Eyes */}
              <circle cx="47" cy="24" r="2.2" fill="#1e293b" />
              <circle cx="46.3" cy="23" r="0.7" fill="#ffffff" />
              <circle cx="54" cy="26" r="2.2" fill="#1e293b" />
              <circle cx="53.3" cy="25" r="0.7" fill="#ffffff" />
            </g>

            {/* Caudal (Tail) Fin group - wiggles rapidly */}
            <g className={styles['koi-tail-group']}>
              {/* Outer Tail Fin */}
              <path 
                d="M 68 94 C 78 105, 95 110, 88 125 C 78 122, 68 110, 64 97 Z" 
                fill="url(#goldFinGrad)" 
                stroke="#9a3412" 
                strokeWidth="1.2" 
              />
              {/* Inner highlight fin */}
              <path 
                d="M 66 96 C 72 108, 85 112, 80 122 C 73 118, 67 108, 64 97 Z" 
                fill="rgba(255, 255, 255, 0.4)" 
                stroke="#ffedd5" 
                strokeWidth="0.8" 
              />
              {/* Tail fin lines */}
              <path d="M 65 98 C 72 106, 78 114, 76 120 M 66 100 C 70 108, 73 114, 71 121" stroke="#ffedd5" strokeWidth="0.8" fill="none" opacity="0.6" />
            </g>
          </svg>
        </div>

        {/* Swaying Sea grass Plants */}
        <div className={styles['aquarium-plants']}>
          <svg className={`${styles['aquarium-plant']} ${styles['plant-1']}`} viewBox="0 0 40 120" width="34" height="100">
            <path d="M 15 120 Q 25 80, 15 40 Q 5 10, 18 0 Q 8 20, 10 55 Q 20 90, 25 120 Z" fill="rgba(16, 185, 129, 0.85)" />
          </svg>
          <svg className={`${styles['aquarium-plant']} ${styles['plant-2']}`} viewBox="0 0 40 120" width="28" height="84">
            <path d="M 20 120 Q 10 90, 22 60 Q 30 30, 15 0 Q 22 25, 15 65 Q 5 95, 10 120 Z" fill="rgba(5, 150, 105, 0.8)" />
          </svg>
          <svg className={`${styles['aquarium-plant']} ${styles['plant-3']}`} viewBox="0 0 40 120" width="36" height="106">
            <path d="M 15 120 Q 28 85, 18 45 Q 8 15, 20 0 Q 5 20, 10 55 Q 22 90, 20 120 Z" fill="rgba(4, 120, 87, 0.85)" />
          </svg>
        </div>
      </div>

      <p style={{ fontWeight: '600', color: 'var(--primary)', letterSpacing: '0.5px', marginTop: '0.8rem', textShadow: '0 2px 4px rgba(6, 182, 212, 0.1)' }}>
        {message}
      </p>
    </div>
  );
};

export default Loader;
