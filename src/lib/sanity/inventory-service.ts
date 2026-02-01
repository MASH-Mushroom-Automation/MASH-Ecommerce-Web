/**
 * Sanity Inventory Service Client
 * Executes inventory queries with error handling and caching
 */

import { sanityClient } from '@/lib/sanity/client';
import {
  getInventoryStatsQuery,
  getLowStockProductsQuery,
  getStockValueQuery,
  getCategoryInventoryQuery,
  countLowStockProductsQuery,
} from '@/lib/sanity/queries/inventory';
import type {
  InventoryStats,
  LowStockItem,
  InventoryValue,
  CategoryInventory,
  LowStockFilters,
} from '@/types/inventory';
import { toast } from 'sonner';

/**
 * Low stock products with pagination info
 */
export interface LowStockProductsResult {
  items: LowStockItem[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/**
 * Get inventory statistics summary
 * Returns total SKUs, stock counts, and percentages
 * 
 * @param lowStockThreshold - Threshold for low stock alerts (default: 10)
 * @returns Inventory statistics
 */
export async function getInventoryStats(
  lowStockThreshold: number = 10
): Promise<InventoryStats> {
  try {
    const query = getInventoryStatsQuery(lowStockThreshold);
    const result = await sanityClient.fetch<{
      totalSKUs: number;
      inStock: number;
      lowStock: number;
      outOfStock: number;
    }>(query);

    // Calculate percentages
    const total = result.totalSKUs || 1; // Avoid division by zero
    const inStockPercentage = (result.inStock / total) * 100;
    const lowStockPercentage = (result.lowStock / total) * 100;
    const outOfStockPercentage = (result.outOfStock / total) * 100;

    return {
      totalSKUs: result.totalSKUs,
      inStock: result.inStock,
      lowStock: result.lowStock,
      outOfStock: result.outOfStock,
      inStockPercentage,
      lowStockPercentage,
      outOfStockPercentage,
    };
  } catch (error) {
    console.error('[InventoryService] Failed to fetch inventory stats:', error);
    toast.error('Failed to load inventory statistics');
    throw error;
  }
}

/**
 * Get products that need restocking
 * Returns products below low stock threshold with pagination
 * 
 * @param filters - Filter criteria
 * @param page - Page number (1-indexed)
 * @param pageSize - Items per page
 * @returns Low stock products with pagination
 */
export async function getLowStockProducts(
  filters: LowStockFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<LowStockProductsResult> {
  try {
    const offset = (page - 1) * pageSize;

    // Fetch products and total count in parallel
    const [items, total] = await Promise.all([
      sanityClient.fetch<LowStockItem[]>(
        getLowStockProductsQuery(filters, pageSize, offset)
      ),
      sanityClient.fetch<number>(countLowStockProductsQuery(filters)),
    ]);

    const hasMore = offset + items.length < total;

    return {
      items,
      total,
      hasMore,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('[InventoryService] Failed to fetch low stock products:', error);
    toast.error('Failed to load low stock products');
    throw error;
  }
}

/**
 * Get total inventory value by category
 * Calculates monetary value of current stock
 * 
 * @returns Inventory value breakdown
 */
export async function getStockValue(): Promise<InventoryValue> {
  try {
    const query = getStockValueQuery();
    const result = await sanityClient.fetch<{
      totalValue: {
        total: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
      };
      byCategory: Array<{
        _id: string;
        name: string;
        slug: string;
        value: number;
        productCount: number;
      }>;
    }>(query);

    // Transform to InventoryValue type
    return {
      total: result.totalValue.total || 0,
      inStock: result.totalValue.inStock || 0,
      lowStock: result.totalValue.lowStock || 0,
      outOfStock: result.totalValue.outOfStock || 0,
      byCategory: result.byCategory.map((cat) => ({
        categoryId: cat._id,
        categoryName: cat.name,
        value: cat.value || 0,
        productCount: cat.productCount,
      })),
    };
  } catch (error) {
    console.error('[InventoryService] Failed to fetch stock value:', error);
    toast.error('Failed to calculate inventory value');
    throw error;
  }
}

/**
 * Get stock distribution by category
 * Returns category-wise inventory breakdown with products
 * 
 * @returns Array of category inventories
 */
export async function getCategoryInventoryDistribution(): Promise<CategoryInventory[]> {
  try {
    const query = getCategoryInventoryQuery();
    const result = await sanityClient.fetch<Array<{
      _id: string;
      name: string;
      slug: string;
      description?: string;
      totalProducts: number;
      inStock: number;
      lowStock: number;
      outOfStock: number;
      totalValue: number;
      products: Array<{
        _id: string;
        name: string;
        sku?: string;
        slug: string;
        stockQuantity: number;
        lowStockThreshold: number;
        price: number;
        mainImage?: string;
        stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
      }>;
    }>>(query);

    // Transform to CategoryInventory type
    return result.map((cat) => ({
      categoryId: cat._id,
      categoryName: cat.name,
      categorySlug: cat.slug,
      description: cat.description,
      totalProducts: cat.totalProducts,
      inStock: cat.inStock,
      lowStock: cat.lowStock,
      outOfStock: cat.outOfStock,
      totalValue: cat.totalValue || 0,
      products: cat.products.map((prod) => ({
        productId: prod._id,
        productName: prod.name,
        sku: prod.sku,
        slug: prod.slug,
        currentStock: prod.stockQuantity,
        lowStockThreshold: prod.lowStockThreshold,
        price: prod.price,
        mainImage: prod.mainImage,
        stockStatus: prod.stockStatus,
      })),
    }));
  } catch (error) {
    console.error('[InventoryService] Failed to fetch category inventory:', error);
    toast.error('Failed to load category inventory distribution');
    throw error;
  }
}

/**
 * Refresh all inventory data
 * Useful for manual refresh button
 * 
 * @returns Object with all inventory data
 */
export async function refreshInventoryData() {
  try {
    const [stats, stockValue, categoryDistribution] = await Promise.all([
      getInventoryStats(),
      getStockValue(),
      getCategoryInventoryDistribution(),
    ]);

    return {
      stats,
      stockValue,
      categoryDistribution,
    };
  } catch (error) {
    console.error('[InventoryService] Failed to refresh inventory data:', error);
    toast.error('Failed to refresh inventory data');
    throw error;
  }
}
