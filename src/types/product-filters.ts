/**
 * Product Search & Filter Types
 * Defines all interfaces for product filtering system
 */

/**
 * Stock status options for filtering
 */
export type StockStatus = 'in-stock' | 'out-of-stock' | 'low-stock' | 'all';

/**
 * Product status options for filtering
 */
export type ProductStatus = 'published' | 'draft' | 'archived' | 'all';

/**
 * Date range for filtering by creation/update date
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Complete filter criteria for product search
 */
export interface ProductFilters {
  /** Search text (searches name, SKU, description) */
  search: string;
  
  /** Category IDs or slugs to filter by */
  categories: string[];
  
  /** Price range [min, max] */
  priceRange: [number, number];
  
  /** Stock availability status */
  stockStatus: StockStatus;
  
  /** Product publication status */
  productStatus: ProductStatus;
  
  /** Date range for creation/update */
  dateRange: DateRange | null;
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  categories: [],
  priceRange: [0, Infinity],
  stockStatus: 'all',
  productStatus: 'published',
  dateRange: null,
};

/**
 * Saved filter preset for quick access
 */
export interface FilterPreset {
  /** Unique identifier */
  id: string;
  
  /** Preset name (user-defined) */
  name: string;
  
  /** Stored filter criteria */
  filters: ProductFilters;
  
  /** Preset creation date */
  createdAt: Date;
}

/**
 * Available filter options from Sanity data
 */
export interface FilterOptions {
  /** Available categories with counts */
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  
  /** Price range from all products */
  priceRange: {
    min: number;
    max: number;
  };
  
  /** Stock status counts */
  stockCounts: {
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
  
  /** Product status counts */
  statusCounts: {
    published: number;
    draft: number;
    archived: number;
  };
}

/**
 * Type guard to check if a value is a valid StockStatus
 */
export function isStockStatus(value: unknown): value is StockStatus {
  return typeof value === 'string' && 
    ['in-stock', 'out-of-stock', 'low-stock', 'all'].includes(value);
}

/**
 * Type guard to check if a value is a valid ProductStatus
 */
export function isProductStatus(value: unknown): value is ProductStatus {
  return typeof value === 'string' && 
    ['published', 'draft', 'archived', 'all'].includes(value);
}

/**
 * Check if filters are active (different from defaults)
 */
export function hasActiveFilters(filters: ProductFilters): boolean {
  return (
    filters.search !== DEFAULT_FILTERS.search ||
    filters.categories.length > 0 ||
    filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
    filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1] ||
    filters.stockStatus !== DEFAULT_FILTERS.stockStatus ||
    filters.productStatus !== DEFAULT_FILTERS.productStatus ||
    filters.dateRange !== null
  );
}

/**
 * Count active filters
 */
export function countActiveFilters(filters: ProductFilters): number {
  let count = 0;
  
  if (filters.search) count++;
  if (filters.categories.length > 0) count += filters.categories.length;
  if (filters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] || 
      filters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]) count++;
  if (filters.stockStatus !== DEFAULT_FILTERS.stockStatus) count++;
  if (filters.productStatus !== DEFAULT_FILTERS.productStatus) count++;
  if (filters.dateRange) count++;
  
  return count;
}
