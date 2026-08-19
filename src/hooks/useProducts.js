import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../utils/api';

// Helper to shuffle list of products on listings page
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Hook: Fetch and Cache Product List
export const useProductsQuery = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      const res = await api.get(`/products?${queryParams.toString()}`);
      
      const hasFilters = 
        (filters.keyword && filters.keyword.trim() !== '') || 
        (filters.category && filters.category !== 'All') || 
        filters.priceMin || 
        filters.priceMax || 
        filters.rating || 
        (filters.sort && filters.sort !== 'newest') ||
        (filters.selectedVendor && filters.selectedVendor !== 'All');

      if (!hasFilters) {
        return shuffleArray(res.data);
      }
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    placeholderData: keepPreviousData, // Keep displaying previous items during background query fetches
  });
};

// Hook: Fetch Single Product Details
export const useProductDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

// Hook: Fetch reviews for a specific product
export const useProductReviewsQuery = (id) => {
  return useQuery({
    queryKey: ['reviews', 'product', id],
    queryFn: async () => {
      const res = await api.get(`/reviews/product/${id}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

// Hook: Fetch reviews for a specific dealer/seller
export const useDealerReviewsQuery = (sellerId) => {
  return useQuery({
    queryKey: ['reviews', 'dealer', sellerId],
    queryFn: async () => {
      const res = await api.get(`/reviews/dealer/${sellerId}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!sellerId,
  });
};

// Hook: Fetch other products belonging to a dealer profile
export const useDealerProductsQuery = (dealerProfileId, id) => {
  return useQuery({
    queryKey: ['dealerProducts', dealerProfileId, id],
    queryFn: async () => {
      const res = await api.get(`/dealers/${dealerProfileId}/public`);
      if (res.data && res.data.products) {
        return res.data.products.filter(p => p._id !== id);
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!dealerProfileId,
  });
};

// Hook: Fetch latest products for homepage
export const useLatestProductsQuery = () => {
  return useQuery({
    queryKey: ['products', 'latest'],
    queryFn: async () => {
      const res = await api.get('/products?sort=newest');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook: Fetch popular products for homepage
export const usePopularProductsQuery = () => {
  return useQuery({
    queryKey: ['products', 'popular'],
    queryFn: async () => {
      const res = await api.get('/products?sort=popular');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook: Helper to invalidate all product caches
export const useInvalidateProductCache = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['product'] });
    queryClient.invalidateQueries({ queryKey: ['dealerProducts'] });
  };
};
