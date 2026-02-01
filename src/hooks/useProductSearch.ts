/**
 * useProductSearch Hook
 * React Query hook for cached product search with filters
 */
'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ProductFilters } from '@/types/product-filters';
import { searchProducts, ProductSearchResults } from '@/lib/sanity/product-search';

export interface UseProductSearchOptions {
  /** Current filter values */
  filters: ProductFilters;
  
  /** Page number (1-indexed) */
  page?: number;
  
  /** Number of results per page */
  pageSize?: number;
  
  /** Enable automatic refetch on filter change */
  enabled?: boolean;
  
  /** Stale time in milliseconds (default: 5 minutes) */
  staleTime?: number;
}

/**
 * Custom hook for product search with React Query caching
 * 
 * Features:
 * - Cache search results per filter combination
 * - Automatic refetch on filter changes
 * - Loading/error/success states
 * - Pagination support
 * - Configurable stale time (how long data stays fresh)
 * 
 * @param filtersOrOptions - Filter criteria OR options object
 * @param page - Page number (1-indexed) when using positional args
 * @param pageSize - Number of results per page when using positional args
 * @returns React Query result with products and pagination info
 */
export function useProductSearch(
  filtersOrOptions: ProductFilters | UseProductSearchOptions | undefined | null,
  page?: number,
  pageSize?: number
): UseQueryResult<ProductSearchResults, Error> {
  // Handle null/undefined input
  if (!filtersOrOptions) {
    filtersOrOptions = { search: '', categories: [], priceRange: [0, Infinity], stockStatus: 'all', productStatus: 'published', dateRange: null };
  }
  
  // Support both object and positional argument styles
  const options: UseProductSearchOptions = (filtersOrOptions && typeof filtersOrOptions === 'object' && 'search' in filtersOrOptions) 
    ? { filters: filtersOrOptions as ProductFilters, page: page ?? 1, pageSize: pageSize ?? 50 }
    : filtersOrOptions as UseProductSearchOptions;
  
  const { 
    filters, 
    page: optionsPage = 1, 
    pageSize: optionsPageSize = 50, 
    enabled = true, 
    staleTime = 5 * 60 * 1000 
  } = options;

  return useQuery<ProductSearchResults, Error>({
    queryKey: ['products', 'search', filters, optionsPage, optionsPageSize],
    queryFn: () => searchProducts(filters, optionsPage, optionsPageSize),
    staleTime,
    enabled: enabled && !!filters,
    // Keep previous data while fetching new results (smooth UX)
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Prefetch next page of search results
 * Useful for optimistic pagination UX
 */
export function usePrefetchNextPage(
  filters: ProductFilters,
  currentPage: number,
  pageSize: number = 50
): void {
  const { data } = useQuery({
    queryKey: ['products', 'search', filters, currentPage + 1, pageSize],
    queryFn: () => searchProducts(filters, currentPage + 1, pageSize),
    enabled: false, // Only prefetch on demand
    staleTime: 5 * 60 * 1000,
  });
}
