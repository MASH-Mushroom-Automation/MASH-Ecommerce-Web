/**
 * useInventoryData Custom Hook
 * Manages inventory data fetching, caching, and real-time updates
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getInventoryStats,
  getLowStockProducts,
  getStockValue,
  getCategoryInventoryDistribution,
  refreshInventoryData,
} from '@/lib/sanity/inventory-service';
import type {
  InventoryStats,
  LowStockItem,
  InventoryValue,
  CategoryInventory,
  LowStockFilters,
} from '@/types/inventory';
import type { LowStockProductsResult } from '@/lib/sanity/inventory-service';
import { DEFAULT_LOW_STOCK_FILTERS } from '@/types/inventory';

/**
 * Query keys for React Query
 */
const QUERY_KEYS = {
  inventoryStats: ['inventory', 'stats'] as const,
  lowStockProducts: (filters: LowStockFilters, page: number) =>
    ['inventory', 'lowStock', filters, page] as const,
  stockValue: ['inventory', 'value'] as const,
  categoryDistribution: ['inventory', 'categories'] as const,
};

/**
 * Cache configuration
 * - staleTime: 5 minutes (data considered fresh for 5 min)
 * - cacheTime: 10 minutes (keep unused data in cache for 10 min)
 * - refetchOnWindowFocus: false (don't refetch when tab regains focus)
 */
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 2, // Retry failed requests twice
};

/**
 * Hook options
 */
interface UseInventoryStatsOptions {
  lowStockThreshold?: number;
  enabled?: boolean;
}

interface UseLowStockProductsOptions {
  filters?: LowStockFilters;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook for inventory statistics
 * Auto-refreshes every 5 minutes
 * 
 * @param options - Hook configuration
 * @returns Query result with inventory stats
 */
export function useInventoryStats(options: UseInventoryStatsOptions = {}) {
  const { lowStockThreshold = 10, enabled = true } = options;

  const query = useQuery<InventoryStats>({
    queryKey: QUERY_KEYS.inventoryStats,
    queryFn: () => getInventoryStats(lowStockThreshold),
    enabled,
    ...CACHE_CONFIG,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for low stock products with pagination
 * 
 * @param options - Hook configuration
 * @returns Query result with low stock products
 */
export function useLowStockProducts(options: UseLowStockProductsOptions = {}) {
  const {
    filters = DEFAULT_LOW_STOCK_FILTERS,
    page = 1,
    pageSize = 20,
    enabled = true,
  } = options;

  const query = useQuery<LowStockProductsResult>({
    queryKey: QUERY_KEYS.lowStockProducts(filters, page),
    queryFn: () => getLowStockProducts(filters, page, pageSize),
    enabled,
    keepPreviousData: true, // Keep old data while fetching new page
    ...CACHE_CONFIG,
  });

  return {
    products: query.data?.items || [],
    total: query.data?.total || 0,
    hasMore: query.data?.hasMore || false,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for inventory value calculations
 * 
 * @param options - Hook configuration
 * @returns Query result with inventory value
 */
export function useStockValue(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = useQuery<InventoryValue>({
    queryKey: QUERY_KEYS.stockValue,
    queryFn: getStockValue,
    enabled,
    ...CACHE_CONFIG,
  });

  return {
    value: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for category inventory distribution
 * 
 * @param options - Hook configuration
 * @returns Query result with category inventory
 */
export function useCategoryInventory(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = useQuery<CategoryInventory[]>({
    queryKey: QUERY_KEYS.categoryDistribution,
    queryFn: getCategoryInventoryDistribution,
    enabled,
    ...CACHE_CONFIG,
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for complete inventory dashboard data
 * Fetches all data in parallel with single loading state
 * 
 * @param options - Hook configuration
 * @returns Combined query results
 */
export function useInventoryData(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  const statsQuery = useInventoryStats({ enabled });
  const stockValueQuery = useStockValue({ enabled });
  const categoryQuery = useCategoryInventory({ enabled });

  // Manual refresh function that invalidates all queries
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['inventory'] });
  }, [queryClient]);

  // Combined loading state (all must complete)
  const isLoading =
    statsQuery.isLoading || stockValueQuery.isLoading || categoryQuery.isLoading;

  // Combined error state (any error)
  const isError =
    statsQuery.isError || stockValueQuery.isError || categoryQuery.isError;

  return {
    stats: statsQuery.stats,
    stockValue: stockValueQuery.value,
    categories: categoryQuery.categories,
    isLoading,
    isError,
    refresh,
    refetchStats: statsQuery.refetch,
    refetchValue: stockValueQuery.refetch,
    refetchCategories: categoryQuery.refetch,
  };
}

/**
 * Hook for invalidating all inventory queries
 * Useful after stock updates
 * 
 * @returns Invalidation function
 */
export function useInvalidateInventory() {
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['inventory'] });
  }, [queryClient]);

  const invalidateStats = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventoryStats });
  }, [queryClient]);

  const invalidateLowStock = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['inventory', 'lowStock'] });
  }, [queryClient]);

  return {
    invalidateAll,
    invalidateStats,
    invalidateLowStock,
  };
}
