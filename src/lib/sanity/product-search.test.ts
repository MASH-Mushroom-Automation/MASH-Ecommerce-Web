/**
 * Unit Tests for Sanity Product Search Client
 */

import { 
  searchProducts, 
  getFilterOptions, 
  getProductByIdOrSlug,
  quickSearchProducts,
  type SanityProduct,
  type ProductSearchResults
} from './product-search';
import { sanityClient } from '@/lib/sanity/client';
import type { ProductFilters, FilterOptions } from '@/types/product-filters';
import { DEFAULT_FILTERS } from '@/types/product-filters';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('searchProducts', () => {
  const mockProducts: SanityProduct[] = [
    {
      _id: 'prod-1',
      _createdAt: '2024-01-01T00:00:00Z',
      _updatedAt: '2024-01-01T00:00:00Z',
      name: 'Oyster Mushroom',
      slug: { current: 'oyster-mushroom' },
      sku: 'SKU001',
      description: 'Fresh oyster mushrooms',
      price: 150,
      stockQuantity: 50,
      mainImage: 'https://example.com/image.jpg',
      status: 'published',
      stockStatus: 'in-stock',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search products successfully', async () => {
    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce(mockProducts) // Products query
      .mockResolvedValueOnce(1); // Count query

    const result = await searchProducts(DEFAULT_FILTERS, 1, 50);

    expect(result).toEqual({
      products: mockProducts,
      total: 1,
      hasMore: false,
      page: 1,
      pageSize: 50,
    });
    expect(sanityClient.fetch).toHaveBeenCalledTimes(2);
  });

  it('should calculate hasMore correctly', async () => {
    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce(mockProducts)
      .mockResolvedValueOnce(100); // Total 100 products

    const result = await searchProducts(DEFAULT_FILTERS, 1, 50);

    expect(result.hasMore).toBe(true);
  });

  it('should handle pagination', async () => {
    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce(mockProducts)
      .mockResolvedValueOnce(150);

    const result = await searchProducts(DEFAULT_FILTERS, 2, 50);

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(50);
  });

  it('should handle search errors', async () => {
    const error = new Error('Network error');
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(error);

    await expect(searchProducts(DEFAULT_FILTERS)).rejects.toThrow('Network error');
    expect(toast.error).toHaveBeenCalledWith('Failed to search products. Please try again.');
  });

  it('should apply search text filter', async () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: 'oyster',
    };

    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce(mockProducts)
      .mockResolvedValueOnce(1);

    await searchProducts(filters);

    const queryCall = (sanityClient.fetch as jest.Mock).mock.calls[0][0];
    expect(queryCall).toContain('oyster');
    expect(queryCall).toContain('lower(name) match');
  });

  it('should apply category filter', async () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      categories: ['cat-1', 'cat-2'],
    };

    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce(mockProducts)
      .mockResolvedValueOnce(1);

    await searchProducts(filters);

    const queryCall = (sanityClient.fetch as jest.Mock).mock.calls[0][0];
    expect(queryCall).toContain('category._ref');
  });

  it('should apply price range filter', async () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      priceRange: [100, 500],
    };

    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce(mockProducts)
      .mockResolvedValueOnce(1);

    await searchProducts(filters);

    const queryCall = (sanityClient.fetch as jest.Mock).mock.calls[0][0];
    expect(queryCall).toContain('price >= 100');
    expect(queryCall).toContain('price <= 500');
  });
});

describe('getFilterOptions', () => {
  const mockFilterOptions: FilterOptions = {
    categories: [
      { id: 'cat-1', name: 'Oyster', slug: 'oyster', productCount: 10 },
      { id: 'cat-2', name: 'Shiitake', slug: 'shiitake', productCount: 5 },
    ],
    priceRange: { min: 50, max: 500 },
    stockCounts: { inStock: 20, lowStock: 5, outOfStock: 3 },
    statusCounts: { published: 25, draft: 2, archived: 1 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch filter options successfully', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockFilterOptions);

    const result = await getFilterOptions();

    expect(result).toEqual(mockFilterOptions);
    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle missing categories gracefully', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      ...mockFilterOptions,
      categories: null,
    });

    const result = await getFilterOptions();

    expect(result.categories).toEqual([]);
  });

  it('should handle missing price range gracefully', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce({
      ...mockFilterOptions,
      priceRange: null,
    });

    const result = await getFilterOptions();

    expect(result.priceRange).toEqual({ min: 0, max: 1000 });
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch');
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(error);

    await expect(getFilterOptions()).rejects.toThrow('Failed to fetch');
    expect(toast.error).toHaveBeenCalledWith('Failed to load filter options.');
  });
});

describe('getProductByIdOrSlug', () => {
  const mockProduct: SanityProduct = {
    _id: 'prod-1',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    name: 'Oyster Mushroom',
    slug: { current: 'oyster-mushroom' },
    sku: 'SKU001',
    price: 150,
    mainImage: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch product by ID successfully', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProduct);

    const result = await getProductByIdOrSlug('prod-1');

    expect(result).toEqual(mockProduct);
    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it('should fetch product by slug successfully', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockProduct);

    const result = await getProductByIdOrSlug('oyster-mushroom');

    expect(result).toEqual(mockProduct);
  });

  it('should return null and show toast when product not found', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(null);

    const result = await getProductByIdOrSlug('invalid-id');

    expect(result).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Product not found.');
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(error);

    await expect(getProductByIdOrSlug('prod-1')).rejects.toThrow('Fetch failed');
    expect(toast.error).toHaveBeenCalledWith('Failed to load product.');
  });
});

describe('quickSearchProducts', () => {
  const mockQuickResults = [
    {
      _id: 'prod-1',
      name: 'Oyster Mushroom',
      sku: 'SKU001',
      mainImage: 'https://example.com/image.jpg',
      price: 150,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search products quickly', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockQuickResults);

    const result = await quickSearchProducts('oyster', 10);

    expect(result).toEqual(mockQuickResults);
    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it('should return empty array for short queries', async () => {
    const result = await quickSearchProducts('a', 10);

    expect(result).toEqual([]);
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });

  it('should return empty array for empty queries', async () => {
    const result = await quickSearchProducts('', 10);

    expect(result).toEqual([]);
    expect(sanityClient.fetch).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Search failed');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (sanityClient.fetch as jest.Mock).mockRejectedValueOnce(error);

    const result = await quickSearchProducts('oyster', 10);

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should limit results', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValueOnce(mockQuickResults);

    await quickSearchProducts('oyster', 5);

    const queryCall = (sanityClient.fetch as jest.Mock).mock.calls[0][0];
    expect(queryCall).toContain('[0...5]');
  });
});
