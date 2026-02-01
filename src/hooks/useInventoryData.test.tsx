/**
 * Unit Tests for useInventoryData Hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useInventoryStats,
  useLowStockProducts,
  useStockValue,
  useCategoryInventory,
  useInventoryData,
  useInvalidateInventory,
} from './useInventoryData';
import * as inventoryService from '@/lib/sanity/inventory-service';
import { DEFAULT_LOW_STOCK_FILTERS } from '@/types/inventory';

// Mock inventory service
jest.mock('@/lib/sanity/inventory-service', () => ({
  getInventoryStats: jest.fn(),
  getLowStockProducts: jest.fn(),
  getStockValue: jest.fn(),
  getCategoryInventoryDistribution: jest.fn(),
  refreshInventoryData: jest.fn(),
}));

const mockGetInventoryStats = inventoryService.getInventoryStats as jest.MockedFunction<
  typeof inventoryService.getInventoryStats
>;
const mockGetLowStockProducts = inventoryService.getLowStockProducts as jest.MockedFunction<
  typeof inventoryService.getLowStockProducts
>;
const mockGetStockValue = inventoryService.getStockValue as jest.MockedFunction<
  typeof inventoryService.getStockValue
>;
const mockGetCategoryInventoryDistribution =
  inventoryService.getCategoryInventoryDistribution as jest.MockedFunction<
    typeof inventoryService.getCategoryInventoryDistribution
  >;

// Create wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useInventoryStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch inventory stats successfully', async () => {
    const mockStats = {
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
      inStockPercentage: 70,
      lowStockPercentage: 20,
      outOfStockPercentage: 10,
    };

    mockGetInventoryStats.mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useInventoryStats(), {
      wrapper: createWrapper(),
    });

    // Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeUndefined();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.isError).toBe(false);
    expect(mockGetInventoryStats).toHaveBeenCalledTimes(1);
    expect(mockGetInventoryStats).toHaveBeenCalledWith(10); // Default threshold
  });

  it('should use custom low stock threshold', async () => {
    mockGetInventoryStats.mockResolvedValueOnce({
      totalSKUs: 50,
      inStock: 30,
      lowStock: 15,
      outOfStock: 5,
      inStockPercentage: 60,
      lowStockPercentage: 30,
      outOfStockPercentage: 10,
    });

    const { result } = renderHook(() => useInventoryStats({ lowStockThreshold: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetInventoryStats).toHaveBeenCalledWith(20);
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    mockGetInventoryStats.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useInventoryStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.stats).toBeUndefined();
  });

  it('should support manual refetch', async () => {
    mockGetInventoryStats.mockResolvedValue({
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
      inStockPercentage: 70,
      lowStockPercentage: 20,
      outOfStockPercentage: 10,
    });

    const { result } = renderHook(() => useInventoryStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger manual refetch
    await result.current.refetch();

    expect(mockGetInventoryStats).toHaveBeenCalledTimes(2);
  });
});

describe('useLowStockProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch low stock products with pagination', async () => {
    const mockResult = {
      items: [
        {
          _id: 'prod-1',
          _updatedAt: '2024-01-01',
          name: 'Product 1',
          sku: 'SKU001',
          slug: 'product-1',
          currentStock: 5,
          lowStockThreshold: 10,
          restockLevel: 50,
          price: 100,
          mainImage: 'https://example.com/image.jpg',
          category: { _id: 'cat-1', name: 'Category 1', slug: 'category-1' },
        },
      ],
      total: 10,
      hasMore: true,
      page: 1,
      pageSize: 20,
    };

    mockGetLowStockProducts.mockResolvedValueOnce(mockResult);

    const { result } = renderHook(() => useLowStockProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toEqual(mockResult.items);
    expect(result.current.total).toBe(10);
    expect(result.current.hasMore).toBe(true);
    expect(mockGetLowStockProducts).toHaveBeenCalledWith(DEFAULT_LOW_STOCK_FILTERS, 1, 20);
  });

  it('should apply custom filters', async () => {
    const customFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      search: 'mushroom',
      categoryIds: ['cat-001'],
    };

    mockGetLowStockProducts.mockResolvedValueOnce({
      items: [],
      total: 0,
      hasMore: false,
      page: 1,
      pageSize: 20,
    });

    const { result } = renderHook(
      () => useLowStockProducts({ filters: customFilters, page: 1, pageSize: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLowStockProducts).toHaveBeenCalledWith(customFilters, 1, 20);
  });

  it('should handle pagination changes', async () => {
    mockGetLowStockProducts.mockResolvedValue({
      items: [],
      total: 50,
      hasMore: true,
      page: 2,
      pageSize: 10,
    });

    const { result } = renderHook(() => useLowStockProducts({ page: 2, pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLowStockProducts).toHaveBeenCalledWith(DEFAULT_LOW_STOCK_FILTERS, 2, 10);
  });
});

describe('useStockValue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch stock value', async () => {
    const mockValue = {
      total: 50000,
      inStock: 35000,
      lowStock: 10000,
      outOfStock: 0,
      byCategory: [
        {
          categoryId: 'cat-1',
          categoryName: 'Category 1',
          value: 30000,
          productCount: 10,
        },
      ],
    };

    mockGetStockValue.mockResolvedValueOnce(mockValue);

    const { result } = renderHook(() => useStockValue(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.value).toEqual(mockValue);
    expect(mockGetStockValue).toHaveBeenCalledTimes(1);
  });
});

describe('useCategoryInventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch category inventory distribution', async () => {
    const mockCategories = [
      {
        categoryId: 'cat-1',
        categoryName: 'Category 1',
        categorySlug: 'category-1',
        totalProducts: 10,
        inStock: 7,
        lowStock: 2,
        outOfStock: 1,
        totalValue: 5000,
        products: [],
      },
    ];

    mockGetCategoryInventoryDistribution.mockResolvedValueOnce(mockCategories);

    const { result } = renderHook(() => useCategoryInventory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(mockGetCategoryInventoryDistribution).toHaveBeenCalledTimes(1);
  });
});

describe('useInventoryData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all inventory data in parallel', async () => {
    const mockStats = {
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
      inStockPercentage: 70,
      lowStockPercentage: 20,
      outOfStockPercentage: 10,
    };

    const mockValue = {
      total: 50000,
      inStock: 35000,
      lowStock: 10000,
      outOfStock: 0,
      byCategory: [],
    };

    const mockCategories = [
      {
        categoryId: 'cat-1',
        categoryName: 'Category 1',
        categorySlug: 'category-1',
        totalProducts: 10,
        inStock: 7,
        lowStock: 2,
        outOfStock: 1,
        totalValue: 5000,
        products: [],
      },
    ];

    mockGetInventoryStats.mockResolvedValueOnce(mockStats);
    mockGetStockValue.mockResolvedValueOnce(mockValue);
    mockGetCategoryInventoryDistribution.mockResolvedValueOnce(mockCategories);

    const { result } = renderHook(() => useInventoryData(), {
      wrapper: createWrapper(),
    });

    // Wait for all queries to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.stockValue).toEqual(mockValue);
    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.isError).toBe(false);
  });

  it('should support manual refresh', async () => {
    mockGetInventoryStats.mockResolvedValue({
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
      inStockPercentage: 70,
      lowStockPercentage: 20,
      outOfStockPercentage: 10,
    });
    mockGetStockValue.mockResolvedValue({
      total: 50000,
      inStock: 35000,
      lowStock: 10000,
      outOfStock: 0,
      byCategory: [],
    });
    mockGetCategoryInventoryDistribution.mockResolvedValue([]);

    const { result } = renderHook(() => useInventoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Trigger manual refresh
    await result.current.refresh();

    // Verify data was refetched
    await waitFor(() => {
      expect(mockGetInventoryStats).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useInvalidateInventory', () => {
  it('should provide invalidation functions', () => {
    const { result } = renderHook(() => useInvalidateInventory(), {
      wrapper: createWrapper(),
    });

    expect(result.current.invalidateAll).toBeInstanceOf(Function);
    expect(result.current.invalidateStats).toBeInstanceOf(Function);
    expect(result.current.invalidateLowStock).toBeInstanceOf(Function);
  });
});
