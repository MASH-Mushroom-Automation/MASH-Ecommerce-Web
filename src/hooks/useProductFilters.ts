/**
 * useProductFilters Hook
 * Manages product filter state with URL synchronization
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryState, useQueryStates, parseAsString, parseAsArrayOf, parseAsInteger } from 'nuqs';
import { ProductFilters, DEFAULT_FILTERS, countActiveFilters, isStockStatus, isProductStatus } from '@/types/product-filters';
import { useDebouncedCallback } from 'use-debounce';

export interface UseProductFiltersReturn {
  /** Current filter values */
  filters: ProductFilters;
  
  /** Set all filters at once */
  setFilters: (filters: ProductFilters) => void;
  
  /** Update a single filter field */
  updateFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  
  /** Remove a specific filter value */
  removeFilter: (key: keyof ProductFilters, value?: any) => void;
  
  /** Clear all filters (reset to defaults) */
  clearFilters: () => void;
  
  /** Number of active filters (non-default values) */
  activeFilterCount: number;
  
  /** Whether any filters are active */
  isFiltering: boolean;
}

/**
 * Custom hook for managing product filters with URL state sync
 * 
 * Features:
 * - Syncs filter state to URL query parameters (shareable links)
 * - Debounced URL updates (500ms) to avoid excessive history entries
 * - Preserves filter state on page refresh
 * - Type-safe with nuqs library
 * 
 * @param debounceMs - Debounce delay for URL updates (default: 500ms)
 * @returns Filter state and update functions
 */
export function useProductFilters(debounceMs: number = 500): UseProductFiltersReturn {
  // URL state (nuqs)
  const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''));
  const [categoriesQuery, setCategoriesQuery] = useQueryState('categories', parseAsArrayOf(parseAsString).withDefault([]));
  const [minPriceQuery, setMinPriceQuery] = useQueryState('minPrice', parseAsInteger.withDefault(0));
  const [maxPriceQuery, setMaxPriceQuery] = useQueryState('maxPrice', parseAsInteger);
  const [stockQuery, setStockQuery] = useQueryState('stock', parseAsString.withDefault('all'));
  const [statusQuery, setStatusQuery] = useQueryState('status', parseAsString.withDefault('published'));
  const [fromDateQuery, setFromDateQuery] = useQueryState('fromDate', parseAsString);
  const [toDateQuery, setToDateQuery] = useQueryState('toDate', parseAsString);

  // Local state for immediate UI updates
  const [localFilters, setLocalFilters] = useState<ProductFilters>(() => {
    // Initialize from URL on mount
    return {
      search: searchQuery || DEFAULT_FILTERS.search,
      categories: categoriesQuery || DEFAULT_FILTERS.categories,
      priceRange: [
        minPriceQuery || DEFAULT_FILTERS.priceRange[0],
        maxPriceQuery ?? DEFAULT_FILTERS.priceRange[1],
      ] as [number, number],
      stockStatus: isStockStatus(stockQuery) ? stockQuery : DEFAULT_FILTERS.stockStatus,
      productStatus: isProductStatus(statusQuery) ? statusQuery : DEFAULT_FILTERS.productStatus,
      dateRange:
        fromDateQuery && toDateQuery
          ? {
              from: new Date(fromDateQuery),
              to: new Date(toDateQuery),
            }
          : DEFAULT_FILTERS.dateRange,
    };
  });

  // Debounced URL sync
  const syncToURL = useDebouncedCallback((filters: ProductFilters) => {
    // Update search
    setSearchQuery(filters.search || null);

    // Update categories
    setCategoriesQuery(filters.categories.length > 0 ? filters.categories : null);

    // Update price range
    if (filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0]) {
      setMinPriceQuery(filters.priceRange[0]);
    } else {
      setMinPriceQuery(null);
    }

    if (filters.priceRange[1] !== Infinity && filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) {
      setMaxPriceQuery(filters.priceRange[1]);
    } else {
      setMaxPriceQuery(null);
    }

    // Update stock status
    setStockQuery(filters.stockStatus !== DEFAULT_FILTERS.stockStatus ? filters.stockStatus : null);

    // Update product status
    setStatusQuery(filters.productStatus !== DEFAULT_FILTERS.productStatus ? filters.productStatus : null);

    // Update date range
    if (filters.dateRange) {
      setFromDateQuery(filters.dateRange.from.toISOString());
      setToDateQuery(filters.dateRange.to.toISOString());
    } else {
      setFromDateQuery(null);
      setToDateQuery(null);
    }
  }, debounceMs);

  // Sync local state to URL when filters change
  useEffect(() => {
    syncToURL(localFilters);
  }, [localFilters, syncToURL]);

  // Set all filters
  const setFilters = useCallback((filters: ProductFilters) => {
    setLocalFilters(filters);
  }, []);

  // Update single filter
  const updateFilter = useCallback(<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Remove filter
  const removeFilter = useCallback((key: keyof ProductFilters, value?: any) => {
    setLocalFilters((prev) => {
      const updated = { ...prev };

      switch (key) {
        case 'categories':
          if (value) {
            updated.categories = prev.categories.filter((id) => id !== value);
          } else {
            updated.categories = DEFAULT_FILTERS.categories;
          }
          break;

        case 'search':
          updated.search = DEFAULT_FILTERS.search;
          break;

        case 'priceRange':
          updated.priceRange = DEFAULT_FILTERS.priceRange;
          break;

        case 'stockStatus':
          updated.stockStatus = DEFAULT_FILTERS.stockStatus;
          break;

        case 'productStatus':
          updated.productStatus = DEFAULT_FILTERS.productStatus;
          break;

        case 'dateRange':
          updated.dateRange = DEFAULT_FILTERS.dateRange;
          break;

        default:
          break;
      }

      return updated;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setLocalFilters({ ...DEFAULT_FILTERS });
  }, []);

  // Calculate active filter count
  const activeFilterCount = countActiveFilters(localFilters);
  const isFiltering = activeFilterCount > 0;

  return {
    filters: localFilters,
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    activeFilterCount,
    isFiltering,
  };
}
