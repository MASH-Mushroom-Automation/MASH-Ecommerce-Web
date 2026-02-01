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
 * @param options - Search options (filters, page, pageSize)
 * @returns React Query result with products and pagination info
 */
export function useProductSearch({
  filters,
  page = 1,
  pageSize = 50,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes default
}: UseProductSearchOptions): UseQueryResult<ProductSearchResults, Error> {
  return useQuery<ProductSearchResults, Error>({
    queryKey: ['products', 'search', filters, page, pageSize],
    queryFn: () => searchProducts(filters, page, pageSize),
    staleTime,
    enabled,
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
