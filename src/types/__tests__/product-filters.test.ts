import {
  isStockStatus,
  isProductStatus,
  hasActiveFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  ProductFilters,
} from '../product-filters';

describe('isStockStatus', () => {
  it('returns true for valid stock statuses', () => {
    expect(isStockStatus('in-stock')).toBe(true);
    expect(isStockStatus('out-of-stock')).toBe(true);
    expect(isStockStatus('low-stock')).toBe(true);
    expect(isStockStatus('all')).toBe(true);
  });
  it('returns false for invalid strings', () => {
    expect(isStockStatus('invalid')).toBe(false);
  });
  it('returns false for non-strings', () => {
    expect(isStockStatus(123)).toBe(false);
    expect(isStockStatus(null)).toBe(false);
    expect(isStockStatus(undefined)).toBe(false);
  });
});

describe('isProductStatus', () => {
  it('returns true for valid product statuses', () => {
    expect(isProductStatus('published')).toBe(true);
    expect(isProductStatus('draft')).toBe(true);
    expect(isProductStatus('archived')).toBe(true);
    expect(isProductStatus('all')).toBe(true);
  });
  it('returns false for invalid strings', () => {
    expect(isProductStatus('unknown')).toBe(false);
  });
  it('returns false for non-strings', () => {
    expect(isProductStatus(42)).toBe(false);
  });
});

describe('hasActiveFilters', () => {
  it('returns false for default filters', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });
  it('returns true when search is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: 'mushroom' })).toBe(true);
  });
  it('returns true when categories have items', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, categories: ['cat1'] })).toBe(true);
  });
  it('returns true when priceRange min changed', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, priceRange: [10, Infinity] })).toBe(true);
  });
  it('returns true when priceRange max changed', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, priceRange: [0, 500] })).toBe(true);
  });
  it('returns true when stockStatus changed', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, stockStatus: 'in-stock' })).toBe(true);
  });
  it('returns true when productStatus changed', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, productStatus: 'draft' })).toBe(true);
  });
  it('returns true when dateRange is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, dateRange: { from: new Date(), to: new Date() } })).toBe(true);
  });
});

describe('countActiveFilters', () => {
  it('returns 0 for default filters', () => {
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
  });
  it('counts search as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, search: 'test' })).toBe(1);
  });
  it('counts each category individually', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, categories: ['a', 'b'] })).toBe(2);
  });
  it('counts price change as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, priceRange: [10, 100] })).toBe(1);
  });
  it('counts stockStatus as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, stockStatus: 'low-stock' })).toBe(1);
  });
  it('counts productStatus as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, productStatus: 'archived' })).toBe(1);
  });
  it('counts dateRange as 1', () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, dateRange: { from: new Date(), to: new Date() } })).toBe(1);
  });
  it('counts multiple filters together', () => {
    const filters: ProductFilters = {
      search: 'mushroom',
      categories: ['cat1'],
      priceRange: [5, 100],
      stockStatus: 'in-stock',
      productStatus: 'published',
      dateRange: { from: new Date(), to: new Date() },
    };
    expect(countActiveFilters(filters)).toBe(5);
  });
});
