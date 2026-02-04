/**
 * Filter URL Sync Utility
 * Encode/decode product filters to/from URL query parameters
 */

import { ProductFilters, DEFAULT_FILTERS, isStockStatus, isProductStatus } from '@/types/product-filters';

/**
 * Encode filters to URL search params
 * @param filters - Filter values to encode
 * @returns URLSearchParams ready for URL
 */
export function encodeFiltersToURL(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Search text
  if (filters.search && filters.search !== DEFAULT_FILTERS.search) {
    params.set('q', filters.search);
  }

  // Categories (comma-separated)
  if (filters.categories.length > 0) {
    params.set('categories', filters.categories.join(','));
  }

  // Price range (only if different from defaults)
  const hasCustomPrice =
    filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
    (filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1] && filters.priceRange[1] !== Infinity);

  if (hasCustomPrice) {
    params.set('minPrice', filters.priceRange[0].toString());
    if (filters.priceRange[1] !== Infinity) {
      params.set('maxPrice', filters.priceRange[1].toString());
    }
  }

  // Stock status (only if not default 'all')
  if (filters.stockStatus !== DEFAULT_FILTERS.stockStatus) {
    params.set('stock', filters.stockStatus);
  }

  // Product status (only if not default 'published')
  if (filters.productStatus !== DEFAULT_FILTERS.productStatus) {
    params.set('status', filters.productStatus);
  }

  // Date range
  if (filters.dateRange) {
    params.set('fromDate', filters.dateRange.from.toISOString());
    params.set('toDate', filters.dateRange.to.toISOString());
  }

  return params;
}

/**
 * Decode filters from URL search params
 * @param params - URLSearchParams from URL
 * @returns ProductFilters object
 */
export function decodeFiltersFromURL(params: URLSearchParams): ProductFilters {
  // Deep clone DEFAULT_FILTERS to avoid mutation issues
  const filters: ProductFilters = {
    ...DEFAULT_FILTERS,
    categories: [...DEFAULT_FILTERS.categories],
    priceRange: [...DEFAULT_FILTERS.priceRange] as [number, number],
    dateRange: DEFAULT_FILTERS.dateRange ? { ...DEFAULT_FILTERS.dateRange } : null,
  };

  // Search text
  const search = params.get('q');
  if (search) {
    filters.search = search;
  }

  // Categories
  const categories = params.get('categories');
  if (categories) {
    filters.categories = categories.split(',').filter(Boolean);
  }

  // Price range
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');

  if (minPrice) {
    const min = Number(minPrice);
    if (!isNaN(min) && min >= 0) {
      filters.priceRange[0] = min;
    }
  }

  if (maxPrice) {
    const max = Number(maxPrice);
    if (!isNaN(max) && max > 0) {
      filters.priceRange[1] = max;
    }
  }

  // Stock status
  const stock = params.get('stock');
  if (stock && isStockStatus(stock)) {
    filters.stockStatus = stock;
  }

  // Product status
  const status = params.get('status');
  if (status && isProductStatus(status)) {
    filters.productStatus = status;
  }

  // Date range
  const fromDate = params.get('fromDate');
  const toDate = params.get('toDate');

  if (fromDate && toDate) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      // Validate dates
      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        filters.dateRange = { from, to };
      }
    } catch (error) {
      // Invalid date format, ignore
      console.warn('[filter-url-sync] Invalid date range in URL:', error);
    }
  }

  return filters;
}

/**
 * Check if URL has any filter parameters
 * @param params - URLSearchParams from URL
 * @returns true if any filter params exist
 */
export function hasFilterParams(params: URLSearchParams): boolean {
  const filterKeys = ['q', 'categories', 'minPrice', 'maxPrice', 'stock', 'status', 'fromDate', 'toDate'];
  return filterKeys.some((key) => params.has(key));
}

/**
 * Remove all filter params from URL
 * @param params - URLSearchParams to clean
 * @returns New URLSearchParams without filter params
 */
export function clearFilterParams(params: URLSearchParams): URLSearchParams {
  const newParams = new URLSearchParams(params);
  const filterKeys = ['q', 'categories', 'minPrice', 'maxPrice', 'stock', 'status', 'fromDate', 'toDate'];
  filterKeys.forEach((key) => newParams.delete(key));
  return newParams;
}
