/**
 * useStockManagement Hook
 * 
 * Provides React Query hooks for stock management operations:
 * - useStockAdjustment: Mutation hook for creating stock adjustments
 * - useStockHistory: Query hook for product stock history with pagination
 * - useRecentAdjustments: Query hook for recent adjustments across all products
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation on mutations
 * - Toast notifications for success/error states
 * - Full TypeScript support
 * - Error handling with detailed messages
 * - Loading states management
 */

'use client';

import { useMutation, useQuery, useQueryClient, keepPreviousData, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sanityClient } from '@/lib/sanity/client';
import { 
  getStockHistoryQuery, 
  getRecentAdjustmentsQuery,
  countStockAdjustmentsQuery 
} from '@/lib/sanity/queries/stock-management';
import type { 
  StockAdjustmentRequest, 
  StockAdjustmentResponse,
  StockAdjustmentHistory 
} from '@/types/stock-management';

/**
 * Query keys for React Query cache management
 */
export const STOCK_QUERY_KEYS = {
  stockHistory: (productId: string, page: number = 1) => 
    ['stock', 'history', productId, page] as const,
  stockHistoryCount: (productId: string) => 
    ['stock', 'history', 'count', productId] as const,
  recentAdjustments: (limit: number = 20) => 
    ['stock', 'adjustments', 'recent', limit] as const,
  inventoryStats: ['inventory', 'stats'] as const,
  lowStockProducts: ['inventory', 'lowStock'] as const,
  productStock: (productId: string) => 
    ['product', productId, 'stock'] as const,
} as const;

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in React Query v5)
  refetchOnWindowFocus: false,
  retry: 2,
};

/**
 * Hook options
 */
interface UseStockHistoryOptions {
  productId: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

interface UseRecentAdjustmentsOptions {
  limit?: number;
  enabled?: boolean;
}

interface StockHistoryResult {
  items: StockAdjustmentHistory[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/**
 * Hook for creating stock adjustments
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation on success
 * - Toast notifications for success/error
 * - Error handling with detailed messages
 * 
 * @param options - Mutation options
 * @returns Mutation object with mutate, mutateAsync, isLoading, error
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading } = useStockAdjustment({
 *   onSuccess: (data) => {
 *     console.log('Adjustment created:', data);
 *   }
 * });
 * 
 * mutate({
 *   productId: 'prod-123',
 *   adjustmentType: 'received',
 *   quantityChange: 50,
 *   reason: 'supplier_delivery',
 *   notes: 'Weekly delivery from supplier'
 * });
 * ```
 */
export function useStockAdjustment(
  options?: UseMutationOptions<StockAdjustmentResponse, Error, StockAdjustmentRequest>
) {
  const queryClient = useQueryClient();

  return useMutation<StockAdjustmentResponse, Error, StockAdjustmentRequest>({
    mutationFn: async (adjustment: StockAdjustmentRequest) => {
      // Call API endpoint for stock adjustment
      const response = await fetch('/api/seller/stock/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustment),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create stock adjustment');
      }

      return response.json();
    },
    onMutate: async (adjustment) => {
      // Optimistic update: Update stock history cache immediately
      const historyKey = STOCK_QUERY_KEYS.stockHistory(adjustment.productId);
      
      await queryClient.cancelQueries({ queryKey: historyKey });
      
      const previousHistory = queryClient.getQueryData<StockHistoryResult>(historyKey);

      // Optimistically add new adjustment to the beginning of the list
      if (previousHistory) {
        const optimisticAdjustment: StockAdjustmentHistory = {
          _id: `temp-${Date.now()}`,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString(),
          adjustmentType: adjustment.adjustmentType,
          quantityChange: adjustment.quantityChange,
          previousStock: 0, // Will be updated by server
          newStock: 0, // Will be updated by server
          reason: adjustment.reason,
          notes: adjustment.notes,
          adjustedBy: 'current-user', // Will be set by server
          adjustmentDate: new Date().toISOString(),
          product: {
            _id: adjustment.productId,
            name: 'Loading...',
            sku: '',
            mainImage: undefined,
            stockQuantity: 0,
          },
        };

        queryClient.setQueryData<StockHistoryResult>(historyKey, {
          ...previousHistory,
          items: [optimisticAdjustment, ...previousHistory.items],
          total: previousHistory.total + 1,
        });
      }

      return { previousHistory };
    },
    onError: (error, adjustment, context) => {
      // Rollback optimistic update on error
      if (context?.previousHistory) {
        queryClient.setQueryData(
          STOCK_QUERY_KEYS.stockHistory(adjustment.productId),
          context.previousHistory
        );
      }

      // Show error toast
      toast.error(error.message || 'Failed to adjust stock');
      console.error('[useStockAdjustment] Error:', error);
    },
    onSuccess: (data, adjustment) => {
      // Invalidate relevant queries to refetch fresh data
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.stockHistory(adjustment.productId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.stockHistoryCount(adjustment.productId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.recentAdjustments() 
      });
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.inventoryStats 
      });
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.lowStockProducts 
      });
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.productStock(adjustment.productId) 
      });

      // Show success toast with new stock level
      toast.success(
        `Stock adjusted successfully! New stock: ${data.newStock}`,
        {
          description: `${adjustment.adjustmentType.toUpperCase()}: ${adjustment.quantityChange > 0 ? '+' : ''}${adjustment.quantityChange}`,
        }
      );

      console.log('[useStockAdjustment] Success:', data);
    },
    ...options,
  });
}

/**
 * Hook for fetching stock adjustment history for a specific product
 * 
 * Features:
 * - Pagination support
 * - Automatic caching with React Query
 * - Real-time data when cache is stale
 * - Loading and error states
 * 
 * @param options - Query options with productId, page, pageSize
 * @returns Query result with items, total, hasMore, loading states
 * 
 * @example
 * ```tsx
 * const { items, total, hasMore, isLoading } = useStockHistory({
 *   productId: 'prod-123',
 *   page: 1,
 *   pageSize: 20
 * });
 * 
 * if (isLoading) return <Spinner />;
 * 
 * return (
 *   <div>
 *     {items.map(adjustment => (
 *       <AdjustmentRow key={adjustment._id} data={adjustment} />
 *     ))}
 *     {hasMore && <LoadMoreButton />}
 *   </div>
 * );
 * ```
 */
export function useStockHistory(options: UseStockHistoryOptions) {
  const {
    productId,
    page = 1,
    pageSize = 30,
    enabled = true,
  } = options;

  const historyQuery = useQuery<StockHistoryResult>({
    queryKey: STOCK_QUERY_KEYS.stockHistory(productId, page),
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      const query = getStockHistoryQuery(productId, pageSize, offset);
      const items = await sanityClient.fetch<StockAdjustmentHistory[]>(query);

      // Fetch total count separately for pagination
      const countQuery = countStockAdjustmentsQuery(productId);
      const total = await sanityClient.fetch<number>(countQuery);

      return {
        items,
        total,
        hasMore: offset + items.length < total,
        page,
        pageSize,
      };
    },
    enabled: enabled && !!productId,
    placeholderData: keepPreviousData, // v5: replaces keepPreviousData option
    ...CACHE_CONFIG,
  });

  return {
    items: historyQuery.data?.items || [],
    total: historyQuery.data?.total || 0,
    hasMore: historyQuery.data?.hasMore || false,
    page: historyQuery.data?.page || page,
    pageSize: historyQuery.data?.pageSize || pageSize,
    isLoading: historyQuery.isLoading,
    isFetching: historyQuery.isFetching,
    isError: historyQuery.isError,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
  };
}

/**
 * Hook for fetching recent stock adjustments across all products
 * 
 * Features:
 * - Configurable limit (default 20)
 * - Sorted by date (newest first)
 * - Includes full product details
 * - Automatic refresh when cache is stale
 * 
 * @param options - Query options with limit
 * @returns Query result with adjustments array and loading states
 * 
 * @example
 * ```tsx
 * const { adjustments, isLoading } = useRecentAdjustments({ limit: 10 });
 * 
 * if (isLoading) return <Spinner />;
 * 
 * return (
 *   <RecentActivity>
 *     {adjustments.map(adj => (
 *       <ActivityItem key={adj._id}>
 *         {adj.product.name} - {adj.adjustmentType}: {adj.quantityChange}
 *       </ActivityItem>
 *     ))}
 *   </RecentActivity>
 * );
 * ```
 */
export function useRecentAdjustments(options: UseRecentAdjustmentsOptions = {}) {
  const {
    limit = 20,
    enabled = true,
  } = options;

  const query = useQuery<StockAdjustmentHistory[]>({
    queryKey: STOCK_QUERY_KEYS.recentAdjustments(limit),
    queryFn: async () => {
      const groqQuery = getRecentAdjustmentsQuery(limit);
      return sanityClient.fetch<StockAdjustmentHistory[]>(groqQuery);
    },
    enabled,
    ...CACHE_CONFIG,
  });

  return {
    adjustments: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for prefetching stock history
 * Useful for preloading data on hover or navigation
 * 
 * @param productId - Product ID to prefetch history for
 * @param page - Page number to prefetch (default: 1)
 * 
 * @example
 * ```tsx
 * const prefetchHistory = usePrefetchStockHistory();
 * 
 * <ProductCard
 *   onMouseEnter={() => prefetchHistory('prod-123')}
 * />
 * ```
 */
export function usePrefetchStockHistory() {
  const queryClient = useQueryClient();

  return (productId: string, page: number = 1, pageSize: number = 30) => {
    queryClient.prefetchQuery({
      queryKey: STOCK_QUERY_KEYS.stockHistory(productId, page),
      queryFn: async () => {
        const offset = (page - 1) * pageSize;
        const query = getStockHistoryQuery(productId, pageSize, offset);
        const items = await sanityClient.fetch<StockAdjustmentHistory[]>(query);

        const countQuery = countStockAdjustmentsQuery(productId);
        const total = await sanityClient.fetch<number>(countQuery);

        return {
          items,
          total,
          hasMore: offset + items.length < total,
          page,
          pageSize,
        };
      },
      ...CACHE_CONFIG,
    });
  };
}

/**
 * Hook for manually invalidating stock-related caches
 * Useful after external updates or when forcing a refresh
 * 
 * @returns Functions to invalidate specific cache keys
 * 
 * @example
 * ```tsx
 * const { invalidateHistory, invalidateAll } = useInvalidateStockCache();
 * 
 * <Button onClick={() => invalidateHistory('prod-123')}>
 *   Refresh History
 * </Button>
 * 
 * <Button onClick={invalidateAll}>
 *   Refresh All Stock Data
 * </Button>
 * ```
 */
export function useInvalidateStockCache() {
  const queryClient = useQueryClient();

  return {
    invalidateHistory: (productId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.stockHistory(productId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.stockHistoryCount(productId) 
      });
    },
    invalidateRecentAdjustments: () => {
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.recentAdjustments() 
      });
    },
    invalidateInventoryStats: () => {
      queryClient.invalidateQueries({ 
        queryKey: STOCK_QUERY_KEYS.inventoryStats 
      });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'stock' || 
          query.queryKey[0] === 'inventory' ||
          query.queryKey[0] === 'product'
      });
    },
  };
}
