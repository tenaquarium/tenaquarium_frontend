import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import styles from './OfferSlider.module.css';

import plantedTankImg from '../assets/planted_tank.png';
import marineTankImg from '../assets/marine_tank.png';
import officeTankImg from '../assets/office_tank.png';

const OfferSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchActiveOffers = async () => {
      try {
        const response = await api.get('/offers/active');
        if (response.data && response.data.length > 0) {
          const dealerSlides = response.data.map((offer, index) => {
            let buttonLink = `/products?offerId=${offer._id}`;
            let slideTitle = offer.offerName.toUpperCase();
            let slideImage = offer.bannerImage;
            const hasCustomBanner = !!offer.bannerImage;

            if (offer.offerScope === 'category' && offer.targetCategories?.length > 0) {
              slideTitle = offer.targetCategories[0].toUpperCase();
            } else if (offer.offerScope === 'product' && offer.targetProducts?.length > 0) {
              const targetProduct = offer.targetProducts[0];
              slideTitle = targetProduct.productName.toUpperCase();
              
              if (!slideImage && targetProduct.images && targetProduct.images.length > 0) {
                slideImage = targetProduct.images[0];
              }
            }
            
            let discountText = offer.benefitType === 'percentage' 
              ? `GET ${offer.benefitValue}% OFF` 
              : offer.benefitType === 'free_delivery' 
                ? 'FREE DELIVERY' 
                : 'SPECIAL OFFER';

            // fallback images if neither banner nor product image is available
            if (!slideImage) {
              const fallbackImages = [plantedTankImg, marineTankImg, officeTankImg];
              slideImage = fallbackImages[index % fallbackImages.length];
            }
            
            return {
              id: offer._id,
              tag: `Offer from ${offer.dealerId?.name || 'Dealer'}`,
              title: slideTitle,
              discount: discountText,
              description: offer.description,
              buttonText: 'Shop Now',
              link: buttonLink,
              image: slideImage,
              hasCustomBanner

            };
          });
          setSlides(dealerSlides);
        }
      } catch (err) {
        console.error('Error fetching active offers:', err);
      }
    };
    fetchActiveOffers();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (slides.length === 0) return;
    
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handleCtaClick = (link) => {
    navigate(link);
  };

  if (slides.length === 0) {
    return null; // Hide the entire slider if there are no active dealer offers
  }

  return (
    <div className={styles['slider-wrapper']}>
      <div 
        className={styles['slider-container']}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glassmorphism overlays */}
        <div className={styles['glass-overlay']} />

        {/* Left Arrow */}
        <button 
          className={`${styles['arrow-button']} ${styles['arrow-left']}`}
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          &#10094;
        </button>

        {/* Slides Content */}
        <div className={styles['slides-wrapper']}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles['slide']} ${index === currentIndex ? styles['slide-active'] : ''}`}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Dark overlay so text remains readable over any image */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 21, 38, 0.65)' }} />

              <div className={styles['slide-content']} style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', paddingBottom: '0' }}>
                
                <div className={styles['text-group']} style={{ maxWidth: '600px' }}>
                  <span className={styles['tag']}>{slide.tag}</span>
                  {slide.discount && <h3 className={styles['title']}>{slide.discount}</h3>}
                  <div className={styles['discount-text']}>{slide.title}</div>
                  <p className={styles['description']}>{slide.description}</p>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '0.8rem 2.5rem', 
                    fontSize: '1rem', 
                    marginTop: '1rem',
                    boxShadow: '0 8px 25px rgba(2, 132, 199, 0.5)'
                  }}
                  onClick={() => handleCtaClick(slide.link)}
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          className={`${styles['arrow-button']} ${styles['arrow-right']}`}
          onClick={handleNext}
          aria-label="Next slide"
        >
          &#10095;
        </button>

        {/* Indicators */}
        <div className={styles['dots-container']}>
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`${styles['dot']} ${index === currentIndex ? styles['dot-active'] : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferSlider;

