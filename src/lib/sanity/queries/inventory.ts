/**
 * Sanity GROQ Queries for Inventory Management
 * Optimized for seller inventory overview dashboard
 */

import type { LowStockFilters } from '@/types/inventory';

/**
 * Default low stock threshold value
 */
const DEFAULT_LOW_STOCK_THRESHOLD = 10;

/**
 * Get inventory statistics summary
 * Returns total SKUs, stock counts by status, and percentages
 * 
 * @param lowStockThreshold - Threshold for low stock alerts (default: 10)
 * @returns GROQ query string
 */
export function getInventoryStatsQuery(
  lowStockThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): string {
  return `
    {
      "totalSKUs": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true]),
      "inStock": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && coalesce(stockQuantity, 0) >= ${lowStockThreshold}]),
      "lowStock": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && coalesce(stockQuantity, 0) > 0 && coalesce(stockQuantity, 0) < ${lowStockThreshold}]),
      "outOfStock": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && coalesce(stockQuantity, 0) == 0])
    }
  `.trim();
}

/**
 * Get products that are below the low stock threshold
 * Returns product details with current stock, threshold, and restock info
 * 
 * @param filters - Filter criteria for low stock products
 * @param limit - Number of results to return (default: 20)
 * @param offset - Number of results to skip (default: 0)
 * @returns GROQ query string
 */
export function getLowStockProductsQuery(
  filters: LowStockFilters,
  limit: number = 20,
  offset: number = 0
): string {
  const conditions: string[] = [
    '_type == "product"',
    '!(_id in path("drafts.**"))',
    'archived != true',
  ];

  // Stock condition: below threshold or out of stock
  const threshold = DEFAULT_LOW_STOCK_THRESHOLD;
  conditions.push(`coalesce(stockQuantity, 0) < ${threshold}`);

  // Search filter (product name or SKU)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    conditions.push(
      `(lower(name) match "${searchTerm}*" || lower(sku) match "${searchTerm}*")`
    );
  }

  // Category filter
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    const categoryConditions = filters.categoryIds
      .map(catId => `category._ref == "${catId}"`)
      .join(' || ');
    conditions.push(`(${categoryConditions})`);
  }

  // Build WHERE clause
  const whereClause = conditions.join(' && ');

  // Sorting
  let orderBy = '_updatedAt desc'; // Default sort
  switch (filters.sortBy) {
    case 'urgency':
      // Sort by stock quantity ascending (lowest stock first)
      orderBy = filters.sortDirection === 'asc' 
        ? 'coalesce(stockQuantity, 0) asc' 
        : 'coalesce(stockQuantity, 0) desc';
      break;
    case 'name':
      orderBy = filters.sortDirection === 'asc' ? 'name asc' : 'name desc';
      break;
    case 'stock':
      orderBy = filters.sortDirection === 'asc' 
        ? 'coalesce(stockQuantity, 0) asc' 
        : 'coalesce(stockQuantity, 0) desc';
      break;
  }

  return `
    *[${whereClause}] | order(${orderBy}) [${offset}...${offset + limit}] {
      _id,
      _updatedAt,
      name,
      sku,
      "slug": slug.current,
      "currentStock": coalesce(stockQuantity, 0),
      "lowStockThreshold": coalesce(lowStockThreshold, ${DEFAULT_LOW_STOCK_THRESHOLD}),
      "restockLevel": coalesce(restockLevel, 50),
      price,
      "mainImage": coalesce(mainImage.asset->url, image.asset->url),
      category-> {
        _id,
        name,
        "slug": slug.current
      },
      grower-> {
        _id,
        name,
        businessName
      }
    }
  `.trim();
}

/**
 * Calculate total inventory value grouped by category
 * Returns category-wise value breakdown and total value
 * 
 * Note: GROQ math::sum requires projecting numeric values first.
 * We project { "v": coalesce(stockQuantity,0) * price }.v then sum.
 * 
 * @returns GROQ query string
 */
export function getStockValueQuery(): string {
  return `
    {
      "totalValue": {
        "total": math::sum(*[_type == "product" && !(_id in path("drafts.**")) && archived != true] { "v": coalesce(stockQuantity, 0) * coalesce(price, 0) }.v),
        "inStock": math::sum(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && coalesce(stockQuantity, 0) >= ${DEFAULT_LOW_STOCK_THRESHOLD}] { "v": coalesce(stockQuantity, 0) * coalesce(price, 0) }.v),
        "lowStock": math::sum(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && coalesce(stockQuantity, 0) > 0 && coalesce(stockQuantity, 0) < ${DEFAULT_LOW_STOCK_THRESHOLD}] { "v": coalesce(stockQuantity, 0) * coalesce(price, 0) }.v),
        "outOfStock": 0
      },
      "byCategory": *[_type == "category"] {
        _id,
        name,
        "slug": slug.current,
        "value": math::sum(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id)] { "v": coalesce(stockQuantity, 0) * coalesce(price, 0) }.v),
        "productCount": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id)])
      } | order(value desc)
    }
  `.trim();
}

/**
 * Get stock distribution by category
 * Returns category breakdown with stock counts and value
 * 
 * Note: GROQ math::sum requires projecting numeric values first.
 * 
 * @returns GROQ query string
 */
export function getCategoryInventoryQuery(): string {
  return `
    *[_type == "category"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      "totalProducts": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id)]),
      "inStock": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id) && coalesce(stockQuantity, 0) >= ${DEFAULT_LOW_STOCK_THRESHOLD}]),
      "lowStock": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id) && coalesce(stockQuantity, 0) > 0 && coalesce(stockQuantity, 0) < ${DEFAULT_LOW_STOCK_THRESHOLD}]),
      "outOfStock": count(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id) && coalesce(stockQuantity, 0) == 0]),
      "totalValue": math::sum(*[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id)] { "v": coalesce(stockQuantity, 0) * coalesce(price, 0) }.v),
      "products": *[_type == "product" && !(_id in path("drafts.**")) && archived != true && references(^._id)] | order(coalesce(stockQuantity, 0) asc) [0...10] {
        _id,
        name,
        sku,
        "slug": slug.current,
        "stockQuantity": coalesce(stockQuantity, 0),
        "lowStockThreshold": coalesce(lowStockThreshold, ${DEFAULT_LOW_STOCK_THRESHOLD}),
        price,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        "stockStatus": select(
          coalesce(stockQuantity, 0) == 0 => "out-of-stock",
          coalesce(stockQuantity, 0) < coalesce(lowStockThreshold, ${DEFAULT_LOW_STOCK_THRESHOLD}) => "low-stock",
          "in-stock"
        )
      }
    }
  `.trim();
}

/**
 * Get stock history for a specific product (if available)
 * Note: Requires Sanity history tracking or custom document type
 * Returns empty array if no history tracking is implemented
 * 
 * @param productId - Product document ID
 * @param limit - Number of history records to return (default: 30)
 * @returns GROQ query string
 */
export function getStockHistoryQuery(
  productId: string,
  limit: number = 30
): string {
  // Note: This assumes a 'stockHistory' document type exists
  // If not implemented, this query will return []
  return `
    *[_type == "stockHistory" && product._ref == "${productId}"] | order(timestamp desc) [0...${limit}] {
      _id,
      timestamp,
      previousQuantity,
      newQuantity,
      changeAmount,
      reason,
      notes,
      updatedBy
    }
  `.trim();
}

/**
 * Count total products matching low stock filters
 * Used for pagination
 * 
 * @param filters - Filter criteria for low stock products
 * @returns GROQ query string
 */
export function countLowStockProductsQuery(filters: LowStockFilters): string {
  const conditions: string[] = [
    '_type == "product"',
    '!(_id in path("drafts.**"))',
    'archived != true',
  ];

  // Stock condition
  const threshold = DEFAULT_LOW_STOCK_THRESHOLD;
  conditions.push(`coalesce(stockQuantity, 0) < ${threshold}`);

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    conditions.push(
      `(lower(name) match "${searchTerm}*" || lower(sku) match "${searchTerm}*")`
    );
  }

  // Category filter
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    const categoryConditions = filters.categoryIds
      .map(catId => `category._ref == "${catId}"`)
      .join(' || ');
    conditions.push(`(${categoryConditions})`);
  }

  const whereClause = conditions.join(' && ');

  return `count(*[${whereClause}])`;
}
