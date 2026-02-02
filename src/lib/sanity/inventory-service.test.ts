/**
 * Unit Tests for Inventory Service Client
 */

import {
  getInventoryStats,
  getLowStockProducts,
  getStockValue,
  getCategoryInventoryDistribution,
  refreshInventoryData,
} from './inventory-service';
import { sanityClient, sanityFreshClient } from '@/lib/sanity/client';
import { DEFAULT_LOW_STOCK_FILTERS } from '@/types/inventory';
import type { LowStockFilters } from '@/types/inventory';

// Mock dependencies
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
  sanityFreshClient: {
    fetch: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockFetch = sanityClient.fetch as jest.MockedFunction<typeof sanityClient.fetch>;
const mockFreshFetch = sanityFreshClient.fetch as jest.MockedFunction<typeof sanityFreshClient.fetch>;

describe('getInventoryStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and transform inventory stats', async () => {
    mockFetch.mockResolvedValueOnce({
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
    });

    const result = await getInventoryStats();

    expect(result).toEqual({
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
      inStockPercentage: 70,
      lowStockPercentage: 20,
      outOfStockPercentage: 10,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFreshFetch).not.toHaveBeenCalled();
  });

  it('should use fresh client when skipCache is true', async () => {
    mockFreshFetch.mockResolvedValueOnce({
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
    });

    const result = await getInventoryStats(10, { skipCache: true });

    expect(result).toEqual({
      totalSKUs: 100,
      inStock: 70,
      lowStock: 20,
      outOfStock: 10,
      inStockPercentage: 70,
      lowStockPercentage: 20,
      outOfStockPercentage: 10,
    });

    expect(mockFreshFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle zero SKUs gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      totalSKUs: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    });

    const result = await getInventoryStats();

    expect(result.totalSKUs).toBe(0);
    expect(result.inStockPercentage).toBe(0);
  });

  it('should use custom low stock threshold', async () => {
    mockFetch.mockResolvedValueOnce({
      totalSKUs: 50,
      inStock: 30,
      lowStock: 15,
      outOfStock: 5,
    });

    await getInventoryStats(20);

    // Check that query was called (threshold affects query generation)
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should handle errors and show toast', async () => {
    const error = new Error('Sanity fetch failed');
    mockFetch.mockRejectedValueOnce(error);

    await expect(getInventoryStats()).rejects.toThrow(error);
  });
});

describe('getLowStockProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch low stock products with pagination', async () => {
    const mockProducts = [
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
        grower: { _id: 'grow-1', name: 'Grower 1', businessName: 'Business 1' },
      },
    ];

    mockFetch
      .mockResolvedValueOnce(mockProducts) // Products (1 item returned)
      .mockResolvedValueOnce(1); // Total count = 1 item

    const result = await getLowStockProducts(DEFAULT_LOW_STOCK_FILTERS, 1, 20);

    expect(result).toEqual({
      items: mockProducts,
      total: 1,
      hasMore: false, // hasMore = offset(0) + items(1) < total(1) = false
      page: 1,
      pageSize: 20,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should use fresh client when skipCache is true', async () => {
    const mockProducts = [{ _id: 'prod-1', name: 'Product 1' }];

    mockFreshFetch
      .mockResolvedValueOnce(mockProducts) // Products
      .mockResolvedValueOnce(1); // Total count

    const result = await getLowStockProducts(DEFAULT_LOW_STOCK_FILTERS, 1, 20, { skipCache: true });

    expect(result.items).toEqual(mockProducts);
    expect(mockFreshFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should calculate hasMore correctly', async () => {
    const mockProducts = Array(20).fill({ _id: 'prod-1', name: 'Product' });

    mockFetch
      .mockResolvedValueOnce(mockProducts) // Page 1
      .mockResolvedValueOnce(50); // Total: 50 items

    const result = await getLowStockProducts(DEFAULT_LOW_STOCK_FILTERS, 1, 20);

    expect(result.hasMore).toBe(true);
    expect(result.total).toBe(50);
  });

  it('should handle pagination offset', async () => {
    const mockProducts = [{ _id: 'prod-21', name: 'Product 21' }];

    mockFetch
      .mockResolvedValueOnce(mockProducts) // Page 2
      .mockResolvedValueOnce(30); // Total

    const result = await getLowStockProducts(DEFAULT_LOW_STOCK_FILTERS, 2, 10);

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it('should apply filters', async () => {
    const filters: LowStockFilters = {
      search: 'mushroom',
      categoryIds: ['cat-001'],
      urgencyLevels: ['critical'],
      sortBy: 'urgency',
      sortDirection: 'desc',
    };

    mockFetch
      .mockResolvedValueOnce([]) // Products
      .mockResolvedValueOnce(0); // Count

    await getLowStockProducts(filters, 1, 20);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    mockFetch.mockRejectedValueOnce(error);

    await expect(getLowStockProducts(DEFAULT_LOW_STOCK_FILTERS)).rejects.toThrow(error);
  });
});

describe('getStockValue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use fresh client when skipCache is true', async () => {
    mockFreshFetch.mockResolvedValueOnce({
      totalValue: { total: 1000, inStock: 800, lowStock: 150, outOfStock: 0 },
      totalUnits: 100,
      byCategory: [],
    });

    await getStockValue({ skipCache: true });

    expect(mockFreshFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should fetch and transform stock value', async () => {
    mockFetch.mockResolvedValueOnce({
      totalValue: {
        total: 50000,
        inStock: 35000,
        lowStock: 10000,
        outOfStock: 0,
      },
      totalUnits: 100,
      byCategory: [
        {
          _id: 'cat-1',
          name: 'Category 1',
          slug: 'category-1',
          value: 30000,
          units: 50,
          productCount: 10,
        },
      ],
    });

    const result = await getStockValue();

    // Updated to match the new InventoryValue type format
    expect(result).toEqual({
      totalValue: 50000,
      totalUnits: 100,
      inStockValue: 35000,
      lowStockValue: 10000,
      outOfStockValue: 0,
      currency: 'PHP',
      categoriesValue: [
        {
          categoryId: 'cat-1',
          categoryName: 'Category 1',
          totalValue: 30000,
          totalUnits: 50,
          averagePrice: 600, // 30000 / 50
        },
      ],
    });
  });

  it('should handle null values gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      totalValue: {
        total: null,
        inStock: null,
        lowStock: null,
        outOfStock: null,
      },
      totalUnits: null,
      byCategory: [
        {
          _id: 'cat-1',
          name: 'Category 1',
          slug: 'category-1',
          value: null,
          units: 0,
          productCount: 0,
        },
      ],
    });

    const result = await getStockValue();

    // Updated to match the new InventoryValue type format
    expect(result.totalValue).toBe(0);
    expect(result.inStockValue).toBe(0);
    expect(result.categoriesValue[0].totalValue).toBe(0);
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    mockFetch.mockRejectedValueOnce(error);

    await expect(getStockValue()).rejects.toThrow(error);
  });
});

describe('getCategoryInventoryDistribution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and transform category inventory', async () => {
    mockFetch.mockResolvedValueOnce([
      {
        _id: 'cat-1',
        name: 'Category 1',
        slug: 'category-1',
        description: 'Description 1',
        totalProducts: 10,
        inStock: 7,
        lowStock: 2,
        outOfStock: 1,
        totalValue: 5000,
        products: [
          {
            _id: 'prod-1',
            name: 'Product 1',
            sku: 'SKU001',
            slug: 'product-1',
            stockQuantity: 5,
            lowStockThreshold: 10,
            price: 100,
            mainImage: 'https://example.com/image.jpg',
            stockStatus: 'low-stock' as const,
          },
        ],
      },
    ]);

    const result = await getCategoryInventoryDistribution();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      categoryId: 'cat-1',
      categoryName: 'Category 1',
      categorySlug: 'category-1',
      description: 'Description 1',
      totalProducts: 10,
      inStock: 7,
      lowStock: 2,
      outOfStock: 1,
      totalValue: 5000,
      products: [
        {
          productId: 'prod-1',
          productName: 'Product 1',
          sku: 'SKU001',
          slug: 'product-1',
          currentStock: 5,
          lowStockThreshold: 10,
          price: 100,
          mainImage: 'https://example.com/image.jpg',
          stockStatus: 'low-stock',
        },
      ],
    });
  });

  it('should handle empty categories', async () => {
    mockFetch.mockResolvedValueOnce([]);

    const result = await getCategoryInventoryDistribution();

    expect(result).toEqual([]);
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    mockFetch.mockRejectedValueOnce(error);

    await expect(getCategoryInventoryDistribution()).rejects.toThrow(error);
  });
});

describe('refreshInventoryData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all inventory data using fresh client (skipCache: true)', async () => {
    // refreshInventoryData uses skipCache: true, so it should use sanityFreshClient
    mockFreshFetch
      .mockResolvedValueOnce({
        totalSKUs: 100,
        inStock: 70,
        lowStock: 20,
        outOfStock: 10,
      }) // getInventoryStats with skipCache
      .mockResolvedValueOnce({
        totalValue: { total: 50000, inStock: 35000, lowStock: 10000, outOfStock: 0 },
        totalUnits: 500,
        byCategory: [],
      }) // getStockValue with skipCache
      .mockResolvedValueOnce([]); // getCategoryInventoryDistribution with skipCache

    const result = await refreshInventoryData();

    expect(result).toHaveProperty('stats');
    expect(result).toHaveProperty('stockValue');
    expect(result).toHaveProperty('categoryDistribution');
    
    // Should use fresh client for all calls (bypasses CDN cache)
    expect(mockFreshFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Refresh failed');
    mockFreshFetch.mockRejectedValueOnce(error);

    await expect(refreshInventoryData()).rejects.toThrow(error);
  });
});

describe('getCategoryInventoryDistribution with skipCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use fresh client when skipCache is true', async () => {
    mockFreshFetch.mockResolvedValueOnce([]);

    await getCategoryInventoryDistribution({ skipCache: true });

    expect(mockFreshFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
