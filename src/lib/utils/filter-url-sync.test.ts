/**
 * Unit Tests for Filter URL Sync Utility
 */

import {
  encodeFiltersToURL,
  decodeFiltersFromURL,
  hasFilterParams,
  clearFilterParams,
} from '../filter-url-sync';
import { ProductFilters, DEFAULT_FILTERS } from '@/types/product-filters';

describe('encodeFiltersToURL', () => {
  it('should return empty params for default filters', () => {
    const params = encodeFiltersToURL(DEFAULT_FILTERS);
    expect(params.toString()).toBe('');
  });

  it('should encode search text', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      search: 'oyster mushroom',
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('q')).toBe('oyster mushroom');
  });

  it('should encode categories as comma-separated', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      categories: ['cat-1', 'cat-2', 'cat-3'],
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('categories')).toBe('cat-1,cat-2,cat-3');
  });

  it('should encode price range', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      priceRange: [100, 500],
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('minPrice')).toBe('100');
    expect(params.get('maxPrice')).toBe('500');
  });

  it('should handle Infinity as max price (omit from URL)', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      priceRange: [50, Infinity],
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('minPrice')).toBe('50');
    expect(params.has('maxPrice')).toBe(false);
  });

  it('should encode stock status', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      stockStatus: 'in-stock',
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('stock')).toBe('in-stock');
  });

  it('should encode product status', () => {
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      productStatus: 'draft',
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('status')).toBe('draft');
  });

  it('should encode date range as ISO strings', () => {
    const from = new Date('2024-01-01');
    const to = new Date('2024-01-31');
    const filters: ProductFilters = {
      ...DEFAULT_FILTERS,
      dateRange: { from, to },
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('fromDate')).toBe(from.toISOString());
    expect(params.get('toDate')).toBe(to.toISOString());
  });

  it('should encode all filters together', () => {
    const filters: ProductFilters = {
      search: 'test',
      categories: ['cat-1'],
      priceRange: [10, 100],
      stockStatus: 'low-stock',
      productStatus: 'published',
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      },
    };
    const params = encodeFiltersToURL(filters);
    expect(params.get('q')).toBe('test');
    expect(params.get('categories')).toBe('cat-1');
    expect(params.get('minPrice')).toBe('10');
    expect(params.get('maxPrice')).toBe('100');
    expect(params.get('stock')).toBe('low-stock');
    expect(params.get('status')).toBe('published');
    expect(params.has('fromDate')).toBe(true);
    expect(params.has('toDate')).toBe(true);
  });
});

describe('decodeFiltersFromURL', () => {
  it('should return default filters for empty params', () => {
    const params = new URLSearchParams();
    const filters = decodeFiltersFromURL(params);
    expect(filters).toEqual(DEFAULT_FILTERS);
  });

  it('should decode search text', () => {
    const params = new URLSearchParams({ q: 'shiitake' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.search).toBe('shiitake');
  });

  it('should decode categories', () => {
    const params = new URLSearchParams({ categories: 'cat-1,cat-2' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.categories).toEqual(['cat-1', 'cat-2']);
  });

  it('should handle empty category string', () => {
    const params = new URLSearchParams({ categories: '' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.categories).toEqual([]);
  });

  it('should decode price range', () => {
    const params = new URLSearchParams({ minPrice: '50', maxPrice: '300' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.priceRange).toEqual([50, 300]);
  });

  it('should handle missing max price (use Infinity)', () => {
    const params = new URLSearchParams({ minPrice: '50' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.priceRange[0]).toBe(50);
    expect(filters.priceRange[1]).toBe(Infinity);
  });

  it('should ignore invalid price values', () => {
    const params = new URLSearchParams({ minPrice: 'invalid', maxPrice: '-10' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.priceRange).toEqual(DEFAULT_FILTERS.priceRange);
  });

  it('should decode valid stock status', () => {
    const params = new URLSearchParams({ stock: 'out-of-stock' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.stockStatus).toBe('out-of-stock');
  });

  it('should ignore invalid stock status', () => {
    const params = new URLSearchParams({ stock: 'invalid' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.stockStatus).toBe(DEFAULT_FILTERS.stockStatus);
  });

  it('should decode valid product status', () => {
    const params = new URLSearchParams({ status: 'archived' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.productStatus).toBe('archived');
  });

  it('should ignore invalid product status', () => {
    const params = new URLSearchParams({ status: 'invalid' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.productStatus).toBe(DEFAULT_FILTERS.productStatus);
  });

  it('should decode date range', () => {
    const from = new Date('2024-01-01').toISOString();
    const to = new Date('2024-01-31').toISOString();
    const params = new URLSearchParams({ fromDate: from, toDate: to });
    const filters = decodeFiltersFromURL(params);
    expect(filters.dateRange).not.toBeNull();
    expect(filters.dateRange?.from).toEqual(new Date(from));
    expect(filters.dateRange?.to).toEqual(new Date(to));
  });

  it('should ignore invalid date range', () => {
    const params = new URLSearchParams({ fromDate: 'invalid', toDate: 'also-invalid' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.dateRange).toBeNull();
  });

  it('should ignore partial date range (missing to)', () => {
    const params = new URLSearchParams({ fromDate: '2024-01-01' });
    const filters = decodeFiltersFromURL(params);
    expect(filters.dateRange).toBeNull();
  });
});

describe('hasFilterParams', () => {
  it('should return false for empty params', () => {
    const params = new URLSearchParams();
    expect(hasFilterParams(params)).toBe(false);
  });

  it('should return true if any filter param exists', () => {
    const params = new URLSearchParams({ q: 'test' });
    expect(hasFilterParams(params)).toBe(true);
  });

  it('should return false for non-filter params', () => {
    const params = new URLSearchParams({ page: '2', sort: 'name' });
    expect(hasFilterParams(params)).toBe(false);
  });
});

describe('clearFilterParams', () => {
  it('should remove all filter params', () => {
    const params = new URLSearchParams({
      q: 'test',
      categories: 'cat-1',
      minPrice: '10',
      page: '2', // Non-filter param
    });
    const cleaned = clearFilterParams(params);
    expect(cleaned.has('q')).toBe(false);
    expect(cleaned.has('categories')).toBe(false);
    expect(cleaned.has('minPrice')).toBe(false);
    expect(cleaned.get('page')).toBe('2'); // Preserved
  });

  it('should return empty params if only filter params exist', () => {
    const params = new URLSearchParams({
      q: 'test',
      stock: 'in-stock',
    });
    const cleaned = clearFilterParams(params);
    expect(cleaned.toString()).toBe('');
  });
});

describe('round-trip encoding/decoding', () => {
  it('should preserve filters through encode → decode cycle', () => {
    const original: ProductFilters = {
      search: 'test product',
      categories: ['cat-1', 'cat-2'],
      priceRange: [50, 500],
      stockStatus: 'in-stock',
      productStatus: 'draft',
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      },
    };

    const params = encodeFiltersToURL(original);
    const decoded = decodeFiltersFromURL(params);

    expect(decoded.search).toBe(original.search);
    expect(decoded.categories).toEqual(original.categories);
    expect(decoded.priceRange).toEqual(original.priceRange);
    expect(decoded.stockStatus).toBe(original.stockStatus);
    expect(decoded.productStatus).toBe(original.productStatus);
    expect(decoded.dateRange?.from.toISOString()).toBe(original.dateRange.from.toISOString());
    expect(decoded.dateRange?.to.toISOString()).toBe(original.dateRange.to.toISOString());
  });

  it('should handle Infinity price in round-trip', () => {
    const original: ProductFilters = {
      ...DEFAULT_FILTERS,
      priceRange: [100, Infinity],
    };

    const params = encodeFiltersToURL(original);
    const decoded = decodeFiltersFromURL(params);

    expect(decoded.priceRange[0]).toBe(100);
    expect(decoded.priceRange[1]).toBe(Infinity);
  });
});
