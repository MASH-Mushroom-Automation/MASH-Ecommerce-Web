/**
 * Unit Tests for useProductSearch Hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useProductSearch } from '../useProductSearch';
import { searchProducts, ProductSearchResults } from '@/lib/sanity/product-search';
import { DEFAULT_FILTERS } from '@/types/product-filters';

// Mock searchProducts
jest.mock('@/lib/sanity/product-search', () => ({
  searchProducts: jest.fn(),
}));

const mockSearchProducts = searchProducts as jest.MockedFunction<typeof searchProducts>;

describe('useProductSearch', () => {
  let queryClient: QueryClient;

  // Wrapper component for React Query
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    // Create new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries in tests
        },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should fetch search results', async () => {
    const mockResults: ProductSearchResults = {
      products: [
        {
          _id: 'prod-1',
          _createdAt: '2024-01-01',
          _updatedAt: '2024-01-01',
          name: 'Oyster Mushroom',
          slug: { current: 'oyster' },
          price: 150,
          status: 'published',
          stockStatus: 'in-stock',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };

    mockSearchProducts.mockResolvedValue(mockResults);

    const { result } = renderHook(
      () =>
        useProductSearch({
          filters: DEFAULT_FILTERS,
        }),
      { wrapper }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResults);
    expect(mockSearchProducts).toHaveBeenCalledWith(DEFAULT_FILTERS, 1, 50);
  });

  it('should handle search errors', async () => {
    const error = new Error('Search failed');
    mockSearchProducts.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useProductSearch({
          filters: DEFAULT_FILTERS,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should support pagination', async () => {
    const mockResults: ProductSearchResults = {
      products: [],
      total: 100,
      page: 2,
      pageSize: 25,
      hasMore: true,
    };

    mockSearchProducts.mockResolvedValue(mockResults);

    renderHook(
      () =>
        useProductSearch({
          filters: DEFAULT_FILTERS,
          page: 2,
          pageSize: 25,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockSearchProducts).toHaveBeenCalledWith(DEFAULT_FILTERS, 2, 25);
    });
  });

  it('should cache results per filter combination', async () => {
    const mockResults: ProductSearchResults = {
      products: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };

    mockSearchProducts.mockResolvedValue(mockResults);

    // First render
    const { result: result1, rerender: rerender1 } = renderHook(
      () =>
        useProductSearch({
          filters: { ...DEFAULT_FILTERS, search: 'test' },
        }),
      { wrapper }
    );

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    expect(mockSearchProducts).toHaveBeenCalledTimes(1);

    // Re-render with same filters (should use cache)
    rerender1();

    await waitFor(() => expect(result1.current.isSuccess).toBe(true));

    // Should not call API again (cached)
    expect(mockSearchProducts).toHaveBeenCalledTimes(1);
  });

  it('should refetch on filter change', async () => {
    const mockResults: ProductSearchResults = {
      products: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };

    mockSearchProducts.mockResolvedValue(mockResults);

    const { result, rerender } = renderHook(
      ({ filters }) =>
        useProductSearch({
          filters,
        }),
      {
        wrapper,
        initialProps: { filters: DEFAULT_FILTERS },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSearchProducts).toHaveBeenCalledTimes(1);

    // Change filters
    rerender({ filters: { ...DEFAULT_FILTERS, search: 'new search' } });

    await waitFor(() => {
      expect(mockSearchProducts).toHaveBeenCalledTimes(2);
    });
  });

  it('should respect enabled flag', async () => {
    mockSearchProducts.mockResolvedValue({
      products: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    });

    const { result } = renderHook(
      () =>
        useProductSearch({
          filters: DEFAULT_FILTERS,
          enabled: false,
        }),
      { wrapper }
    );

    // Should not trigger fetch
    expect(result.current.isLoading).toBe(false);
    expect(mockSearchProducts).not.toHaveBeenCalled();
  });

  it('should use custom staleTime', async () => {
    const mockResults: ProductSearchResults = {
      products: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };

    mockSearchProducts.mockResolvedValue(mockResults);

    const { result } = renderHook(
      () =>
        useProductSearch({
          filters: DEFAULT_FILTERS,
          staleTime: 10 * 60 * 1000, // 10 minutes
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Check that data is not stale
    expect(result.current.isStale).toBe(false);
  });

  it('should handle empty results', async () => {
    const mockResults: ProductSearchResults = {
      products: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };

    mockSearchProducts.mockResolvedValue(mockResults);

    const { result } = renderHook(
      () =>
        useProductSearch({
          filters: DEFAULT_FILTERS,
        }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.products).toHaveLength(0);
    expect(result.current.data?.total).toBe(0);
  });

  it('should preserve previous data while fetching (placeholderData)', async () => {
    const initialResults: ProductSearchResults = {
      products: [
        {
          _id: 'prod-1',
          _createdAt: '2024-01-01',
          _updatedAt: '2024-01-01',
          name: 'Initial',
          slug: { current: 'initial' },
          price: 100,
          status: 'published',
          stockStatus: 'in-stock',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };

    mockSearchProducts.mockResolvedValue(initialResults);

    const { result, rerender } = renderHook(
      ({ filters }) =>
        useProductSearch({
          filters,
        }),
      {
        wrapper,
        initialProps: { filters: DEFAULT_FILTERS },
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstData = result.current.data;

    // Change filters (trigger new fetch)
    const newResults: ProductSearchResults = {
      products: [
        {
          _id: 'prod-2',
          _createdAt: '2024-01-02',
          _updatedAt: '2024-01-02',
          name: 'Updated',
          slug: { current: 'updated' },
          price: 200,
          status: 'published',
          stockStatus: 'in-stock',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 50,
      hasMore: false,
    };

    mockSearchProducts.mockResolvedValue(newResults);

    rerender({ filters: { ...DEFAULT_FILTERS, search: 'updated' } });

    // Previous data should still be available while fetching
    // (placeholderData behavior)
    expect(result.current.data).toBeDefined();

    await waitFor(() => {
      expect(result.current.data?.products[0].name).toBe('Updated');
    });
  });
});
