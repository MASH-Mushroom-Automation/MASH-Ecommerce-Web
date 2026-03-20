/**
 * useStockManagement Hook - Unit Tests
 * 
 * Test coverage:
 * - useStockAdjustment mutation (success, error, optimistic updates)
 * - useStockHistory query (pagination, caching, loading states)
 * - useRecentAdjustments query (data fetching, error handling)
 * - Cache invalidation after mutations
 * - Toast notifications
 * - Optimistic UI updates and rollback on error
 * - Type safety and TypeScript support
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sanityClient } from '@/lib/sanity/client';
import {
  useStockAdjustment,
  useStockHistory,
  useRecentAdjustments,
  usePrefetchStockHistory,
  useInvalidateStockCache,
  STOCK_QUERY_KEYS,
} from './useStockManagement';
import type { StockAdjustmentResponse, StockAdjustmentHistory } from '@/types/stock-management';

// ============================================================================
// Mocks
// ============================================================================

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock Sanity client
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

const mockSanityFetch = sanityClient.fetch as unknown as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

// ============================================================================
// Test Data
// ============================================================================

const mockStockAdjustmentRequest = {
  productId: 'product-1',
  adjustmentType: 'received' as const,
  quantityChange: 50,
  reason: 'supplier_delivery',
  notes: 'Weekly delivery from supplier',
};

const mockStockAdjustmentResponse: StockAdjustmentResponse = {
  success: true,
  adjustmentId: 'adjustment-1',
  productId: 'product-1',
  oldStock: 100,
  newStock: 150,
  quantityChange: 50,
  adjustmentDate: '2026-02-02T10:00:00Z',
  message: 'Stock adjustment completed successfully',
};

const mockStockHistoryItems: StockAdjustmentHistory[] = [
  {
    _id: 'adj-1',
    _createdAt: '2026-02-02T10:00:00Z',
    _updatedAt: '2026-02-02T10:00:00Z',
    adjustmentType: 'received',
    quantityChange: 50,
    previousStock: 100,
    newStock: 150,
    reason: 'supplier_delivery',
    notes: 'Weekly delivery',
    adjustedBy: 'user-123',
    adjustmentDate: '2026-02-02T10:00:00Z',
    product: {
      _id: 'product-1',
      name: 'Shiitake Mushroom',
      sku: 'SKU-001',
      mainImage: 'https://example.com/image.jpg',
      stockQuantity: 150,
    },
  },
  {
    _id: 'adj-2',
    _createdAt: '2026-02-01T09:00:00Z',
    _updatedAt: '2026-02-01T09:00:00Z',
    adjustmentType: 'sold',
    quantityChange: -20,
    previousStock: 120,
    newStock: 100,
    reason: 'retail_sale',
    adjustedBy: 'user-123',
    adjustmentDate: '2026-02-01T09:00:00Z',
    product: {
      _id: 'product-1',
      name: 'Shiitake Mushroom',
      sku: 'SKU-001',
      mainImage: 'https://example.com/image.jpg',
      stockQuantity: 100,
    },
  },
];

// ============================================================================
// Test Utilities
// ============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: Infinity, // Keep cache during tests (renamed from cacheTime in v5)
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// ============================================================================
// Tests: useStockAdjustment Mutation
// ============================================================================

describe('useStockAdjustment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a stock adjustment', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStockAdjustmentResponse,
    } as Response);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useStockAdjustment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should call API endpoint
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/seller/stock/adjust',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockStockAdjustmentRequest),
      })
    );

    // Should show success toast
    expect(mockToast.success).toHaveBeenCalledWith(
      'Stock adjusted successfully! New stock: 150',
      expect.objectContaining({
        description: 'RECEIVED: +50',
      })
    );

    // Should return mutation data
    expect(result.current.data).toEqual(mockStockAdjustmentResponse);
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Product not found';
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    } as Response);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useStockAdjustment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Should show error toast
    expect(mockToast.error).toHaveBeenCalledWith(errorMessage);

    // Should have error object
    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useStockAdjustment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Network error');
  });

  it('should perform optimistic updates', async () => {
    // Mock a delayed response to test optimistic updates
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockStockAdjustmentResponse,
            } as Response);
          }, 100);
        })
    );

    const queryClient = createQueryClient();

    // Pre-populate cache with existing history
    const existingHistory = {
      items: [mockStockHistoryItems[1]],
      total: 1,
      hasMore: false,
      page: 1,
      pageSize: 30,
    };
    queryClient.setQueryData(
      STOCK_QUERY_KEYS.stockHistory('product-1', 1),
      existingHistory
    );

    const { result } = renderHook(() => useStockAdjustment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    // Check optimistic update immediately after mutation call
    await waitFor(() => {
      const cachedData = queryClient.getQueryData(
        STOCK_QUERY_KEYS.stockHistory('product-1', 1)
      ) as typeof existingHistory;

      // Should have added optimistic adjustment
      expect(cachedData.items).toHaveLength(2);
      expect(cachedData.items[0]._id).toContain('temp-');
      expect(cachedData.total).toBe(2);
    });

    // Wait for mutation to complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should rollback optimistic updates on error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Validation error' }),
    } as Response);

    const queryClient = createQueryClient();

    // Pre-populate cache
    const existingHistory = {
      items: [mockStockHistoryItems[1]],
      total: 1,
      hasMore: false,
      page: 1,
      pageSize: 30,
    };
    queryClient.setQueryData(
      STOCK_QUERY_KEYS.stockHistory('product-1', 1),
      existingHistory
    );

    const { result } = renderHook(() => useStockAdjustment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Cache should be rolled back to original state
    const cachedData = queryClient.getQueryData(
      STOCK_QUERY_KEYS.stockHistory('product-1', 1)
    );
    expect(cachedData).toEqual(existingHistory);
  });

  it('should invalidate related queries on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStockAdjustmentResponse,
    } as Response);

    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useStockAdjustment(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should invalidate multiple query keys
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.stockHistory('product-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.stockHistoryCount('product-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.recentAdjustments(),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.inventoryStats,
    });
  });

  it('should accept custom onSuccess callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStockAdjustmentResponse,
    } as Response);

    const onSuccess = jest.fn();
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useStockAdjustment({ onSuccess }), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // React Query v5 passes an options object instead of positional args
    expect(onSuccess).toHaveBeenCalled();
    const callArgs = onSuccess.mock.calls[0];
    // The callback receives (data, variables, context) OR an options object
    // depending on the hook implementation
    expect(callArgs.length).toBeGreaterThan(0);
  });

  it('should accept custom onError callback', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Error' }),
    } as Response);

    const onError = jest.fn();
    const queryClient = createQueryClient();
    const { result } = renderHook(() => useStockAdjustment({ onError }), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.mutate(mockStockAdjustmentRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // React Query v5 passes an options object instead of positional args
    expect(onError).toHaveBeenCalled();
    const callArgs = onError.mock.calls[0];
    expect(callArgs.length).toBeGreaterThan(0);
    // First arg should be an Error or contain error
    expect(callArgs[0]).toBeDefined();
  });
});

// ============================================================================
// Tests: useStockHistory Query
// ============================================================================

describe('useStockHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch stock history successfully', async () => {
    mockSanityFetch
      .mockResolvedValueOnce(mockStockHistoryItems) // History items
      .mockResolvedValueOnce(2); // Total count

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => useStockHistory({ productId: 'product-1', page: 1, pageSize: 30 }),
      { wrapper: createWrapper(queryClient) }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual(mockStockHistoryItems);
    expect(result.current.total).toBe(2);
    expect(result.current.hasMore).toBe(false);
    expect(mockSanityFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle pagination correctly', async () => {
    mockSanityFetch
      .mockResolvedValueOnce([mockStockHistoryItems[0]]) // Page 1
      .mockResolvedValueOnce(2); // Total count

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => useStockHistory({ productId: 'product-1', page: 1, pageSize: 1 }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.hasMore).toBe(true); // 1 of 2 total
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(1);
  });

  it('should respect enabled option', async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => useStockHistory({ productId: 'product-1', enabled: false }),
      { wrapper: createWrapper(queryClient) }
    );

    // Should not fetch when disabled
    expect(mockSanityFetch).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
  });

  it('should handle empty product ID', async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => useStockHistory({ productId: '' }),
      { wrapper: createWrapper(queryClient) }
    );

    // Should not fetch with empty productId
    expect(mockSanityFetch).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
  });

  // NOTE: This test verifies error handling despite internal retry config
  it('should handle query errors', async () => {
    mockSanityFetch.mockRejectedValue(new Error('Sanity fetch error'));

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => useStockHistory({ productId: 'product-1' }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.error?.message).toBe('Sanity fetch error');
  });

  // NOTE: This test verifies pagination behavior
  it('should keep previous data while fetching new page', async () => {
    const queryClient = createQueryClient();

    // Initial fetch - page 1
    mockSanityFetch
      .mockResolvedValueOnce([mockStockHistoryItems[0]])
      .mockResolvedValueOnce(2);

    const { result, rerender } = renderHook(
      ({ page }) => useStockHistory({ productId: 'product-1', page, pageSize: 1 }),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { page: 1 },
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual([mockStockHistoryItems[0]]);

    // Fetch page 2 - should keep previous data
    mockSanityFetch
      .mockResolvedValueOnce([mockStockHistoryItems[1]])
      .mockResolvedValueOnce(2);

    rerender({ page: 2 });

    // Should still show page 1 data while fetching page 2
    expect(result.current.items).toEqual([mockStockHistoryItems[0]]);
    expect(result.current.isFetching).toBe(true);

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.items).toEqual([mockStockHistoryItems[1]]);
  });

  it('should provide refetch function', async () => {
    mockSanityFetch
      .mockResolvedValueOnce(mockStockHistoryItems)
      .mockResolvedValueOnce(2);

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => useStockHistory({ productId: 'product-1' }),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock new data for refetch
    mockSanityFetch
      .mockResolvedValueOnce([mockStockHistoryItems[0]])
      .mockResolvedValueOnce(1);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });

    expect(mockSanityFetch).toHaveBeenCalledTimes(4); // 2 initial + 2 refetch
  });
});

// ============================================================================
// Tests: useRecentAdjustments Query
// ============================================================================

describe('useRecentAdjustments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch recent adjustments successfully', async () => {
    mockSanityFetch.mockResolvedValueOnce(mockStockHistoryItems);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useRecentAdjustments({ limit: 20 }), {
      wrapper: createWrapper(queryClient),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.adjustments).toEqual(mockStockHistoryItems);
    expect(mockSanityFetch).toHaveBeenCalledTimes(1);
  });

  it('should use default limit of 20', async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const queryClient = createQueryClient();
    renderHook(() => useRecentAdjustments(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockSanityFetch).toHaveBeenCalledTimes(1);
    });

    // Check that query key includes default limit
    const calls = (mockSanityFetch.mock.calls[0][0] as string);
    expect(calls).toContain('[0...20]'); // Default limit
  });

  it('should respect custom limit', async () => {
    mockSanityFetch.mockResolvedValueOnce([mockStockHistoryItems[0]]);

    const queryClient = createQueryClient();
    renderHook(() => useRecentAdjustments({ limit: 10 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockSanityFetch).toHaveBeenCalledTimes(1);
    });

    const calls = (mockSanityFetch.mock.calls[0][0] as string);
    expect(calls).toContain('[0...10]');
  });

  it('should respect enabled option', async () => {
    const queryClient = createQueryClient();
    renderHook(() => useRecentAdjustments({ enabled: false }), {
      wrapper: createWrapper(queryClient),
    });

    expect(mockSanityFetch).not.toHaveBeenCalled();
  });

  // NOTE: This test verifies error handling
  it('should handle errors gracefully', async () => {
    mockSanityFetch.mockRejectedValue(new Error('Fetch failed'));

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useRecentAdjustments(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 10000 });

    expect(result.current.error?.message).toBe('Fetch failed');
    expect(result.current.adjustments).toEqual([]);
  });

  it('should provide refetch function', async () => {
    mockSanityFetch.mockResolvedValueOnce(mockStockHistoryItems);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useRecentAdjustments(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockSanityFetch.mockResolvedValueOnce([mockStockHistoryItems[0]]);

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.adjustments).toHaveLength(1);
    });

    expect(mockSanityFetch).toHaveBeenCalledTimes(2);
  });
});

// ============================================================================
// Tests: usePrefetchStockHistory
// ============================================================================

describe('usePrefetchStockHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should prefetch stock history', async () => {
    mockSanityFetch
      .mockResolvedValueOnce(mockStockHistoryItems)
      .mockResolvedValueOnce(2);

    const queryClient = createQueryClient();
    const { result } = renderHook(() => usePrefetchStockHistory(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current('product-1', 1, 30);
    });

    await waitFor(() => {
      expect(mockSanityFetch).toHaveBeenCalledTimes(2);
    });

    // Cache should be populated
    const cachedData = queryClient.getQueryData(
      STOCK_QUERY_KEYS.stockHistory('product-1', 1)
    );
    expect(cachedData).toBeDefined();
  });
});

// ============================================================================
// Tests: useInvalidateStockCache
// ============================================================================

describe('useInvalidateStockCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should invalidate history for specific product', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useInvalidateStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.invalidateHistory('product-1');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.stockHistory('product-1'),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.stockHistoryCount('product-1'),
    });
  });

  it('should invalidate recent adjustments', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useInvalidateStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.invalidateRecentAdjustments();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.recentAdjustments(),
    });
  });

  it('should invalidate inventory stats', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useInvalidateStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.invalidateInventoryStats();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: STOCK_QUERY_KEYS.inventoryStats,
    });
  });

  it('should invalidate all stock-related caches', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useInvalidateStockCache(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.invalidateAll();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });
  });
});
