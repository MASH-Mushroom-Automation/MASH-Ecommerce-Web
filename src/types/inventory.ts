/**
 * Inventory Management Types
 * Defines all interfaces for inventory dashboard and stock management
 */

/**
 * Stock status for inventory classification
 */
export type InventoryStockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * Summary statistics for inventory dashboard
 */
export interface InventoryStats {
  /** Total number of unique SKUs */
  totalSKUs: number;
  
  /** Number of products with stock >= lowStockThreshold (default: 10) */
  inStock: number;
  
  /** Number of products with stock > 0 and < lowStockThreshold */
  lowStock: number;
  
  /** Number of products with stock = 0 */
  outOfStock: number;
  
  /** Percentage of products in stock (0-100) */
  inStockPercentage: number;
  
  /** Percentage of products with low stock (0-100) */
  lowStockPercentage: number;
  
  /** Percentage of products out of stock (0-100) */
  outOfStockPercentage: number;
  
  /** Optional: Trend indicators (positive = improvement) */
  trends?: {
    totalSKUs?: number;
    inStock?: number;
    lowStock?: number;
    outOfStock?: number;
  };
}

/**
 * Stock level data for chart visualization
 */
export interface StockLevelData {
  /** Stock status category */
  status: InventoryStockStatus;
  
  /** Number of products in this category */
  count: number;
  
  /** Percentage of total inventory (0-100) */
  percentage: number;
  
  /** Color for chart visualization */
  color: string;
  
  /** Label for display */
  label: string;
}

/**
 * Product with low stock details
 */
export interface LowStockItem {
  /** Product ID from Sanity */
  _id: string;
  
  /** Product name */
  name: string;
  
  /** Product SKU */
  sku?: string;
  
  /** Current stock quantity */
  currentStock: number;
  
  /** Low stock threshold (alert level) */
  lowStockThreshold: number;
  
  /** Recommended restock quantity */
  restockLevel: number;
  
  /** Product image URL */
  mainImage?: string;
  
  /** Product slug for linking */
  slug?: {
    current: string;
  };
  
  /** Product price */
  price: number;
  
  /** Category information */
  category?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  
  /** Last updated timestamp */
  _updatedAt: string;
  
  /** Urgency level (calculated: currentStock / lowStockThreshold) */
  urgencyLevel: 'critical' | 'high' | 'medium';
}

/**
 * Category value breakdown item
 */
export interface CategoryValueItem {
  /** Category ID */
  categoryId: string;
  
  /** Category name */
  categoryName: string;
  
  /** Total value for this category */
  totalValue: number;
  
  /** Total units in this category */
  totalUnits: number;
  
  /** Average price per unit */
  averagePrice: number;
}

/**
 * Inventory value calculation
 */
export interface InventoryValue {
  /** Total inventory value (sum of stockQuantity × price) */
  totalValue: number;
  
  /** Total number of units across all categories */
  totalUnits: number;
  
  /** Value of in-stock products */
  inStockValue: number;
  
  /** Value of low-stock products */
  lowStockValue: number;
  
  /** Value of out-of-stock products (should be 0) */
  outOfStockValue: number;
  
  /** Currency code (e.g., 'PHP') */
  currency: string;
  
  /** Value breakdown by category */
  categoriesValue: CategoryValueItem[];
  
  /** Optional: Value trend compared to previous period */
  trend?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
}

/**
 * Category-wise inventory breakdown
 */
export interface CategoryInventory {
  /** Category ID */
  categoryId: string;
  
  /** Category name */
  categoryName: string;
  
  /** Category slug */
  categorySlug: string;
  
  /** Total products in this category */
  totalProducts: number;
  
  /** Products in stock */
  inStock: number;
  
  /** Products with low stock */
  lowStock: number;
  
  /** Products out of stock */
  outOfStock: number;
  
  /** Total inventory value for this category */
  totalValue: number;
  
  /** Percentage of total inventory (by count) */
  percentageOfTotal: number;
  
  /** Products in this category (optional, for expanded view) */
  products?: Array<{
    _id: string;
    _updatedAt?: string;
    name: string;
    sku?: string;
    slug?: string;
    currentStock: number;
    lowStockThreshold: number;
    restockLevel?: number;
    price: number;
    mainImage?: string;
  }>;
}

/**
 * Stock update request
 */
export interface StockUpdateRequest {
  /** Product ID to update */
  productId: string;
  
  /** New stock quantity */
  newQuantity: number;
  
  /** Optional: Reason for update */
  reason?: 'restock' | 'sale' | 'damage' | 'adjustment' | 'manual';
  
  /** Optional: Notes about the update */
  notes?: string;
}

/**
 * Stock update response
 */
export interface StockUpdateResponse {
  /** Success status */
  success: boolean;
  
  /** Updated product ID */
  productId: string;
  
  /** Previous stock quantity */
  previousQuantity: number;
  
  /** New stock quantity */
  newQuantity: number;
  
  /** Updated product data */
  product?: {
    _id: string;
    name: string;
    sku?: string;
    stockQuantity: number;
    _updatedAt: string;
  };
  
  /** Error message if failed */
  error?: string;
}

/**
 * Filter options for low stock alerts
 */
export interface LowStockFilters {
  /** Search by product name or SKU */
  search: string;
  
  /** Filter by category */
  categoryIds: string[];
  
  /** Filter by urgency level */
  urgencyLevels: Array<'critical' | 'high' | 'medium'>;
  
  /** Sort field */
  sortBy: 'urgency' | 'name' | 'stock' | 'price' | 'updated';
  
  /** Sort direction */
  sortDirection: 'asc' | 'desc';
}

/**
 * Default low stock filters
 */
export const DEFAULT_LOW_STOCK_FILTERS: LowStockFilters = {
  search: '',
  categoryIds: [],
  urgencyLevels: ['critical', 'high', 'medium'],
  sortBy: 'urgency',
  sortDirection: 'desc',
};

/**
 * Type guard to check if a value is a valid InventoryStockStatus
 */
export function isInventoryStockStatus(value: unknown): value is InventoryStockStatus {
  return ['in-stock', 'low-stock', 'out-of-stock'].includes(value as string);
}

/**
 * Calculate urgency level based on current stock and threshold
 */
export function calculateUrgencyLevel(
  currentStock: number,
  lowStockThreshold: number
): 'critical' | 'high' | 'medium' {
  const ratio = currentStock / lowStockThreshold;
  
  if (ratio <= 0.25) return 'critical'; // 0-25% of threshold
  if (ratio <= 0.5) return 'high';      // 26-50% of threshold
  return 'medium';                       // 51-100% of threshold
}

/**
 * Calculate stock status based on quantity and threshold
 */
export function calculateStockStatus(
  stockQuantity: number,
  lowStockThreshold: number = 10
): InventoryStockStatus {
  if (stockQuantity === 0) return 'out-of-stock';
  if (stockQuantity < lowStockThreshold) return 'low-stock';
  return 'in-stock';
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calculate inventory statistics from product list
 */
export function calculateInventoryStats(
  products: Array<{
    stockQuantity?: number;
    lowStockThreshold?: number;
  }>,
  defaultLowStockThreshold: number = 10
): InventoryStats {
  const totalSKUs = products.length;
  
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  
  products.forEach((product) => {
    const stock = product.stockQuantity ?? 0;
    const threshold = product.lowStockThreshold ?? defaultLowStockThreshold;
    
    if (stock === 0) {
      outOfStock++;
    } else if (stock < threshold) {
      lowStock++;
    } else {
      inStock++;
    }
  });
  
  const inStockPercentage = totalSKUs > 0 ? (inStock / totalSKUs) * 100 : 0;
  const lowStockPercentage = totalSKUs > 0 ? (lowStock / totalSKUs) * 100 : 0;
  const outOfStockPercentage = totalSKUs > 0 ? (outOfStock / totalSKUs) * 100 : 0;
  
  return {
    totalSKUs,
    inStock,
    lowStock,
    outOfStock,
    inStockPercentage,
    lowStockPercentage,
    outOfStockPercentage,
  };
}

/**
 * Generate stock level data for chart
 */
export function generateStockLevelData(stats: InventoryStats): StockLevelData[] {
  return [
    {
      status: 'in-stock',
      count: stats.inStock,
      percentage: stats.inStockPercentage,
      color: '#10b981', // green-500
      label: 'In Stock',
    },
    {
      status: 'low-stock',
      count: stats.lowStock,
      percentage: stats.lowStockPercentage,
      color: '#f59e0b', // amber-500
      label: 'Low Stock',
    },
    {
      status: 'out-of-stock',
      count: stats.outOfStock,
      percentage: stats.outOfStockPercentage,
      color: '#ef4444', // red-500
      label: 'Out of Stock',
    },
  ];
}
