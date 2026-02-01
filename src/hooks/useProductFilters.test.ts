/**
 * Unit Tests for useProductFilters Hook
 * 
 * Note: nuqs hooks use Next.js router context, so we test the logic
 * and integration with URL state via mocked nuqs hooks.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductFilters } from '../useProductFilters';
import { DEFAULT_FILTERS } from '@/types/product-filters';

// Mock nuqs hooks
const mockSetSearchQuery = jest.fn();
const mockSetCategoriesQuery = jest.fn();
const mockSetMinPriceQuery = jest.fn();
const mockSetMaxPriceQuery = jest.fn();
const mockSetStockQuery = jest.fn();
const mockSetStatusQuery = jest.fn();
const mockSetFromDateQuery = jest.fn();
const mockSetToDateQuery = jest.fn();

jest.mock('nuqs', () => ({
  useQueryState: jest.fn((key: string) => {
    // Return initial values and setter functions
    switch (key) {
      case 'q':
        return ['', mockSetSearchQuery];
      case 'categories':
        return [[], mockSetCategoriesQuery];
      case 'minPrice':
        return [0, mockSetMinPriceQuery];
      case 'maxPrice':
        return [null, mockSetMaxPriceQuery];
      case 'stock':
        return ['all', mockSetStockQuery];
      case 'status':
        return ['published', mockSetStatusQuery];
      case 'fromDate':
        return [null, mockSetFromDateQuery];
      case 'toDate':
        return [null, mockSetToDateQuery];
      default:
        return [null, jest.fn()];
    }
  }),
  parseAsString: {
    withDefault: (defaultValue: string) => ({ defaultValue }),
  },
  parseAsArrayOf: (parser: any) => ({
    withDefault: (defaultValue: any[]) => ({ defaultValue }),
  }),
  parseAsInteger: {
    withDefault: (defaultValue: number) => ({ defaultValue }),
  },
}));

// Mock use-debounce
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: any, _delay: number) => {
    // Return non-debounced function for testing
    return fn;
  },
}));

describe('useProductFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useProductFilters());

    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.isFiltering).toBe(false);
  });

  it('should update search filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('search', 'oyster mushroom');
    });

    expect(result.current.filters.search).toBe('oyster mushroom');
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.isFiltering).toBe(true);
  });

  it('should update categories filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('categories', ['cat-1', 'cat-2']);
    });

    expect(result.current.filters.categories).toEqual(['cat-1', 'cat-2']);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should update price range filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('priceRange', [100, 500]);
    });

    expect(result.current.filters.priceRange).toEqual([100, 500]);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should update stock status filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('stockStatus', 'in-stock');
    });

    expect(result.current.filters.stockStatus).toBe('in-stock');
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should update product status filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('productStatus', 'draft');
    });

    expect(result.current.filters.productStatus).toBe('draft');
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should update date range filter', () => {
    const { result } = renderHook(() => useProductFilters());

    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    };

    act(() => {
      result.current.updateFilter('dateRange', dateRange);
    });

    expect(result.current.filters.dateRange).toEqual(dateRange);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('should set all filters at once', () => {
    const { result } = renderHook(() => useProductFilters());

    const newFilters = {
      ...DEFAULT_FILTERS,
      search: 'test',
      categories: ['cat-1'],
      priceRange: [50, 300] as [number, number],
    };

    act(() => {
      result.current.setFilters(newFilters);
    });

    expect(result.current.filters).toEqual(newFilters);
    expect(result.current.activeFilterCount).toBe(3);
  });

  it('should remove category filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('categories', ['cat-1', 'cat-2', 'cat-3']);
    });

    expect(result.current.filters.categories).toHaveLength(3);

    act(() => {
      result.current.removeFilter('categories', 'cat-2');
    });

    expect(result.current.filters.categories).toEqual(['cat-1', 'cat-3']);
  });

  it('should remove all categories if no value specified', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('categories', ['cat-1', 'cat-2']);
    });

    act(() => {
      result.current.removeFilter('categories');
    });

    expect(result.current.filters.categories).toEqual([]);
  });

  it('should remove search filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('search', 'test search');
    });

    expect(result.current.filters.search).toBe('test search');

    act(() => {
      result.current.removeFilter('search');
    });

    expect(result.current.filters.search).toBe('');
  });

  it('should remove price range filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('priceRange', [100, 500]);
    });

    act(() => {
      result.current.removeFilter('priceRange');
    });

    expect(result.current.filters.priceRange).toEqual(DEFAULT_FILTERS.priceRange);
  });

  it('should remove stock status filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('stockStatus', 'in-stock');
    });

    act(() => {
      result.current.removeFilter('stockStatus');
    });

    expect(result.current.filters.stockStatus).toBe('all');
  });

  it('should remove product status filter', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('productStatus', 'draft');
    });

    act(() => {
      result.current.removeFilter('productStatus');
    });

    expect(result.current.filters.productStatus).toBe('published');
  });

  it('should remove date range filter', () => {
    const { result } = renderHook(() => useProductFilters());

    const dateRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31'),
    };

    act(() => {
      result.current.updateFilter('dateRange', dateRange);
    });

    act(() => {
      result.current.removeFilter('dateRange');
    });

    expect(result.current.filters.dateRange).toBeNull();
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useProductFilters());

    // Set multiple filters
    act(() => {
      result.current.updateFilter('search', 'test');
      result.current.updateFilter('categories', ['cat-1', 'cat-2']);
      result.current.updateFilter('priceRange', [100, 500]);
      result.current.updateFilter('stockStatus', 'in-stock');
      result.current.updateFilter('productStatus', 'draft');
    });

    expect(result.current.activeFilterCount).toBeGreaterThan(0);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual(DEFAULT_FILTERS);
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.isFiltering).toBe(false);
  });

  it('should calculate active filter count correctly', () => {
    const { result } = renderHook(() => useProductFilters());

    expect(result.current.activeFilterCount).toBe(0);

    act(() => {
      result.current.updateFilter('search', 'test');
    });
    expect(result.current.activeFilterCount).toBe(1);

    act(() => {
      result.current.updateFilter('categories', ['cat-1']);
    });
    expect(result.current.activeFilterCount).toBe(2);

    act(() => {
      result.current.updateFilter('priceRange', [100, 500]);
    });
    expect(result.current.activeFilterCount).toBe(3);

    act(() => {
      result.current.updateFilter('stockStatus', 'in-stock');
    });
    expect(result.current.activeFilterCount).toBe(4);

    act(() => {
      result.current.updateFilter('productStatus', 'draft');
    });
    expect(result.current.activeFilterCount).toBe(5);

    act(() => {
      result.current.updateFilter('dateRange', {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      });
    });
    expect(result.current.activeFilterCount).toBe(6);
  });

  it('should mark isFiltering as true when filters are active', () => {
    const { result } = renderHook(() => useProductFilters());

    expect(result.current.isFiltering).toBe(false);

    act(() => {
      result.current.updateFilter('search', 'test');
    });

    expect(result.current.isFiltering).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.isFiltering).toBe(false);
  });

  it('should handle multiple filter updates', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('search', 'first search');
      result.current.updateFilter('search', 'second search');
      result.current.updateFilter('search', 'final search');
    });

    expect(result.current.filters.search).toBe('final search');
  });

  it('should preserve other filters when updating one', () => {
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.updateFilter('search', 'test');
      result.current.updateFilter('categories', ['cat-1']);
    });

    expect(result.current.filters.search).toBe('test');
    expect(result.current.filters.categories).toEqual(['cat-1']);

    act(() => {
      result.current.updateFilter('priceRange', [100, 500]);
    });

    // Previous filters should still be there
    expect(result.current.filters.search).toBe('test');
    expect(result.current.filters.categories).toEqual(['cat-1']);
    expect(result.current.filters.priceRange).toEqual([100, 500]);
  });

  it('should use custom debounce delay', () => {
    const { result } = renderHook(() => useProductFilters(1000));

    // Should still work with custom delay
    act(() => {
      result.current.updateFilter('search', 'test');
    });

    expect(result.current.filters.search).toBe('test');
  });
});
