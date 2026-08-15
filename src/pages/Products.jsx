import React, { useEffect, useState } from 'react';
import styles from './Products.module.css';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import api from '../utils/api';
import { Search, Star, SlidersHorizontal, RefreshCw } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for filters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const [categories, setCategories] = useState([
    'All',
    'Aquarium Fish',
    'Fish Food',
    'Aquarium Tanks',
    'Aquarium Filters',
    'Aquarium Lights',
    'Aquarium Decorations',
    'Aquarium Plants',
    'Aquarium Accessories',
    'Custom Tank Setup',
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data && res.data.length > 0) {
          setCategories(['All', ...res.data.map(c => c.name)]);
        }
      } catch (err) {
        console.error('Error fetching categories in products page', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when filters/params change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (keyword) queryParams.append('keyword', keyword);
        if (category && category !== 'All') queryParams.append('category', category);
        if (priceMin) queryParams.append('priceMin', priceMin);
        if (priceMax) queryParams.append('priceMax', priceMax);
        if (rating) queryParams.append('rating', rating);
        if (sort) queryParams.append('sort', sort);

        const res = await api.get(`/products?${queryParams.toString()}`);
        setProducts(res.data);
      } catch (error) {
        console.error('Error fetching filtered products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchParams]);

  // Sync state changes with SearchParams (effectively triggering useEffect)
  const applyFilters = () => {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category && category !== 'All') params.category = category;
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    if (rating) params.rating = rating;
    if (sort) params.sort = sort;

    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    setKeyword('');
    setCategory('All');
    setPriceMin('');
    setPriceMax('');
    setRating('');
    setSort('newest');
    setSelectedVendor('All');
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handleRatingSelect = (rateValue) => {
    const newRating = rateValue === rating ? '' : rateValue;
    setRating(newRating);
    
    // Auto-apply rating filter
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category && category !== 'All') params.category = category;
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    if (newRating) params.rating = newRating;
    if (sort) params.sort = sort;

    setSearchParams(params);
  };

  return (
    <div className="main-content">
      <div className={styles['products-page-container']}>

        {/* Sidebar Filters */}
        <aside className={`glass-panel ${styles['filters-sidebar']} ${showMobileFilters ? styles['filters-open'] : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
              <SlidersHorizontal size={18} />
              FILTERS
            </span>
            <button onClick={handleReset} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', gap: '0.2rem' }}>
              <RefreshCw size={12} />
              Reset
            </button>
          </div>

          {/* Search */}
          <div className={styles['filter-group']}>
            <h4 className={styles['filter-title']}>Search Name</h4>
            <div className={styles['search-input-wrapper']}>
              <Search size={16} className={styles['search-icon-pos']} />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                onBlur={applyFilters}
                placeholder="Search..."
                className={styles['search-input']}
              />
            </div>
          </div>

          {/* Category */}
          <div className={styles['filter-group']}>
            <h4 className={styles['filter-title']}>Category</h4>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                // Auto-apply on category select
                const params = Object.fromEntries(searchParams.entries());
                if (e.target.value === 'All') {
                  delete params.category;
                } else {
                  params.category = e.target.value;
                }
                setSearchParams(params);
              }}
              className={styles['category-select']}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor Filter */}
          <div className={styles['filter-group']}>
            <h4 className={styles['filter-title']}>Filter by Vendor</h4>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className={styles['category-select']}
            >
              <option value="All">All Vendors</option>
              {Array.from(new Set(products.map(p => p.dealerId?.name).filter(Boolean))).map((vendorName) => (
                <option key={vendorName} value={vendorName}>
                  {vendorName}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className={styles['filter-group']}>
            <h4 className={styles['filter-title']}>Price Range (₹)</h4>
            <div className={styles['price-inputs']}>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                onBlur={applyFilters}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Min"
                className={styles['price-input']}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                onBlur={applyFilters}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder="Max"
                className={styles['price-input']}
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className={styles['filter-group']}>
            <h4 className={styles['filter-title']}>Customer Review</h4>
            <div className={styles['star-rating-filter']}>
              {[5, 4, 3, 2, 1, 0].map((stars) => (
                <div
                  key={stars}
                  className={styles['rating-filter-item']}
                  onClick={() => handleRatingSelect(stars.toString())}
                  style={{
                    color: rating === stars.toString() ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: rating === stars.toString() ? '600' : 'normal',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rating === stars.toString()}
                    onChange={() => {}} // Controlled via parent click
                    style={{ pointerEvents: 'none', marginRight: '4px' }}
                  />
                  <div style={{ display: 'flex', color: 'var(--warning)', marginRight: '4px' }}>
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={14}
                        fill={idx < stars ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span>
                    {stars === 5 ? '5 Stars' : stars === 1 ? '1 Star' : stars === 0 ? '0 Stars (Unrated)' : `${stars} Stars`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid & Header */}
        <section className={styles['products-display-area']}>
          {(() => {
            const filteredProductsList = selectedVendor && selectedVendor !== 'All'
              ? products.filter(p => p.dealerId?.name === selectedVendor)
              : products;

            return (
              <>
                {/* Header Actions Row (Filters toggle & Search bar) */}
                <div className={styles['header-actions-row']}>
                  <button 
                    className={styles['mobile-filters-toggle-btn']} 
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <SlidersHorizontal size={16} />
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>

                  <div className={`${styles['search-bar-container']} ${isMobileSearchExpanded ? styles['search-expanded'] : ''}`}>
                    <input 
                      type="text" 
                      placeholder="Search products..."
                      value={keyword}
                      onChange={(e) => {
                        setKeyword(e.target.value);
                        const params = Object.fromEntries(searchParams.entries());
                        if (e.target.value) {
                          params.keyword = e.target.value;
                        } else {
                          delete params.keyword;
                        }
                        setSearchParams(params);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          applyFilters();
                          setIsMobileSearchExpanded(false);
                        }
                      }}
                      className={styles['header-search-input']}
                    />
                    <button 
                      className={styles['search-icon-btn']}
                      onClick={() => {
                        if (window.innerWidth <= 900) {
                          setIsMobileSearchExpanded(!isMobileSearchExpanded);
                        } else {
                          applyFilters();
                        }
                      }}
                      title="Search Products"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {filteredProductsList.length} {filteredProductsList.length === 1 ? 'Product' : 'Products'} found
                  </span>
                  
                  {/* Sorting */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort By:</span>
                    <select
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        const params = Object.fromEntries(searchParams.entries());
                        params.sort = e.target.value;
                        setSearchParams(params);
                      }}
                      className={styles['sort-select']}
                      style={{ width: '180px', padding: '0.5rem' }}
                    >
                      <option value="newest">Newest Products</option>
                      <option value="priceAsc">Price: Low to High</option>
                      <option value="priceDesc">Price: High to Low</option>
                      <option value="bestRating">Best Rated</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <Loader message="Fetching amazing aquatic items..." />
                ) : filteredProductsList.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No products found matching your current filter set. Try resetting them!
                  </div>
                ) : (
                  <div className={styles['products-grid']} style={{ padding: '0' }}>
                    {filteredProductsList.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </section>
      </div>
    </div>
  );
};

export default Products;
