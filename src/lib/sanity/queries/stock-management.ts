/**
 * Sanity GROQ Queries for Stock Management
 * Optimized for stock adjustment history and tracking
 */

import type { StockAdjustmentType } from '@/types/stock-management';

/**
 * Get paginated stock adjustment history for a specific product
 * Returns adjustment records sorted by date (newest first)
 * 
 * @param productId - Product ID to get history for
 * @param limit - Number of results to return (default: 30)
 * @param offset - Number of results to skip (default: 0)
 * @returns GROQ query string
 */
export function getStockHistoryQuery(
  productId: string,
  limit: number = 30,
  offset: number = 0
): string {
  return `
    *[
      _type == "stockAdjustment" && 
      product._ref == "${productId}"
    ] | order(adjustmentDate desc) [${offset}...${offset + limit}] {
      _id,
      _createdAt,
      _updatedAt,
      adjustmentType,
      quantityChange,
      previousStock,
      newStock,
      reason,
      notes,
      adjustedBy,
      adjustmentDate,
      "product": product->{
        _id,
        name,
        sku,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        stockQuantity,
        category-> { _id, name, slug }
      }
    }
  `.trim();
}

/**
 * Get stock adjustments filtered by adjustment type and optional date range
 * Returns adjustments with full product details
 * 
 * @param type - Adjustment type to filter by (received, sold, returned, damaged, transferred, adjustment)
 * @param dateRange - Optional date range { start: string, end: string } in ISO format
 * @param limit - Number of results to return (default: 50)
 * @param offset - Number of results to skip (default: 0)
 * @returns GROQ query string
 */
export function getStockAdjustmentsByTypeQuery(
  type: StockAdjustmentType,
  dateRange?: { start?: string; end?: string },
  limit: number = 50,
  offset: number = 0
): string {
  const conditions: string[] = [
    '_type == "stockAdjustment"',
    `adjustmentType == "${type}"`,
  ];

  // Add date range filters if provided
  if (dateRange?.start) {
    conditions.push(`adjustmentDate >= "${dateRange.start}"`);
  }
  if (dateRange?.end) {
    conditions.push(`adjustmentDate <= "${dateRange.end}"`);
  }

  const whereClause = conditions.join(' && ');

  return `
    *[${whereClause}] | order(adjustmentDate desc) [${offset}...${offset + limit}] {
      _id,
      _createdAt,
      _updatedAt,
      adjustmentType,
      quantityChange,
      previousStock,
      newStock,
      reason,
      notes,
      adjustedBy,
      adjustmentDate,
      "product": product->{
        _id,
        name,
        sku,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        stockQuantity,
        category-> { _id, name, slug }
      }
    }
  `.trim();
}

/**
 * Get recent stock adjustments across all products
 * Returns the most recent adjustments with product details
 * 
 * @param limit - Number of results to return (default: 20)
 * @returns GROQ query string
 */
export function getRecentAdjustmentsQuery(limit: number = 20): string {
  return `
    *[_type == "stockAdjustment"] | order(adjustmentDate desc) [0...${limit}] {
      _id,
      _createdAt,
      _updatedAt,
      adjustmentType,
      quantityChange,
      previousStock,
      newStock,
      reason,
      notes,
      adjustedBy,
      adjustmentDate,
      "product": product->{
        _id,
        name,
        sku,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        stockQuantity,
        category-> { _id, name, slug }
      }
    }
  `.trim();
}

/**
 * Count total stock adjustments for a specific product
 * Used for pagination and statistics
 * 
 * @param productId - Product ID to count adjustments for
 * @returns GROQ query string
 */
export function countStockAdjustmentsQuery(productId: string): string {
  return `
    count(*[
      _type == "stockAdjustment" && 
      product._ref == "${productId}"
    ])
  `.trim();
}

/**
 * Get stock adjustment by ID with full product details
 * Used for viewing adjustment details
 * 
 * @param adjustmentId - Stock adjustment ID
 * @returns GROQ query string
 */
export function getStockAdjustmentByIdQuery(adjustmentId: string): string {
  return `
    *[_type == "stockAdjustment" && _id == "${adjustmentId}"][0] {
      _id,
      _createdAt,
      _updatedAt,
      adjustmentType,
      quantityChange,
      previousStock,
      newStock,
      reason,
      notes,
      adjustedBy,
      adjustmentDate,
      "product": product->{
        _id,
        name,
        sku,
        description,
        price,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        stockQuantity,
        category-> { _id, name, slug },
        grower-> { _id, name, businessName }
      }
    }
  `.trim();
}

/**
 * Get stock adjustments filtered by multiple criteria
 * Advanced filtering with product search, date range, and adjustment type
 * 
 * @param filters - Filter criteria
 * @param limit - Number of results to return (default: 50)
 * @param offset - Number of results to skip (default: 0)
 * @returns GROQ query string
 */
export function getFilteredStockAdjustmentsQuery(
  filters: {
    productSearch?: string;
    adjustmentTypes?: StockAdjustmentType[];
    dateRange?: { start?: string; end?: string };
    adjustedBy?: string;
  },
  limit: number = 50,
  offset: number = 0
): string {
  const conditions: string[] = ['_type == "stockAdjustment"'];

  // Filter by adjustment types
  if (filters.adjustmentTypes && filters.adjustmentTypes.length > 0) {
    const typeConditions = filters.adjustmentTypes
      .map((type) => `adjustmentType == "${type}"`)
      .join(' || ');
    conditions.push(`(${typeConditions})`);
  }

  // Filter by date range
  if (filters.dateRange?.start) {
    conditions.push(`adjustmentDate >= "${filters.dateRange.start}"`);
  }
  if (filters.dateRange?.end) {
    conditions.push(`adjustmentDate <= "${filters.dateRange.end}"`);
  }

  // Filter by adjusted by user
  if (filters.adjustedBy) {
    conditions.push(`adjustedBy == "${filters.adjustedBy}"`);
  }

  const whereClause = conditions.join(' && ');

  // Build query with product search in projection
  let query = `
    *[${whereClause}] | order(adjustmentDate desc) [${offset}...${offset + limit}] {
      _id,
      _createdAt,
      _updatedAt,
      adjustmentType,
      quantityChange,
      previousStock,
      newStock,
      reason,
      notes,
      adjustedBy,
      adjustmentDate,
      "product": product->{
        _id,
        name,
        sku,
        "mainImage": coalesce(mainImage.asset->url, image.asset->url),
        stockQuantity,
        category-> { _id, name, slug }
      }
    }
  `.trim();

  // Add product search filter as post-processing (can't filter by referenced field in WHERE)
  if (filters.productSearch) {
    const searchTerm = filters.productSearch.toLowerCase();
    query = `
      *[${whereClause}] {
        _id,
        _createdAt,
        _updatedAt,
        adjustmentType,
        quantityChange,
        previousStock,
        newStock,
        reason,
        notes,
        adjustedBy,
        adjustmentDate,
        "product": product->{
          _id,
          name,
          sku,
          "mainImage": coalesce(mainImage.asset->url, image.asset->url),
          stockQuantity,
          category-> { _id, name, slug }
        }
      }[
        defined(product) &&
        (lower(product.name) match "${searchTerm}*" || lower(product.sku) match "${searchTerm}*")
      ] | order(adjustmentDate desc) [${offset}...${offset + limit}]
    `.trim();
  }

  return query;
}

/**
 * Count stock adjustments by type for statistics
 * Returns object with counts for each adjustment type
 * 
 * @param dateRange - Optional date range to filter counts
 * @returns GROQ query string
 */
export function countAdjustmentsByTypeQuery(dateRange?: {
  start?: string;
  end?: string;
}): string {
  const conditions: string[] = ['_type == "stockAdjustment"'];

  if (dateRange?.start) {
    conditions.push(`adjustmentDate >= "${dateRange.start}"`);
  }
  if (dateRange?.end) {
    conditions.push(`adjustmentDate <= "${dateRange.end}"`);
  }

  const whereClause = conditions.join(' && ');

  return `
    {
      "received": count(*[${whereClause} && adjustmentType == "received"]),
      "sold": count(*[${whereClause} && adjustmentType == "sold"]),
      "returned": count(*[${whereClause} && adjustmentType == "returned"]),
      "damaged": count(*[${whereClause} && adjustmentType == "damaged"]),
      "transferred": count(*[${whereClause} && adjustmentType == "transferred"]),
      "adjustment": count(*[${whereClause} && adjustmentType == "adjustment"]),
      "total": count(*[${whereClause}])
    }
  `.trim();
}

/**
 * Get aggregated stock movement for a date range
 * Returns total stock in/out with breakdown by type
 * 
 * @param dateRange - Date range { start: string, end: string } in ISO format
 * @returns GROQ query string
 */
export function getStockMovementSummaryQuery(dateRange: {
  start: string;
  end: string;
}): string {
  return `
    {
      "totalIn": array::sum(*[
        _type == "stockAdjustment" &&
        adjustmentDate >= "${dateRange.start}" &&
        adjustmentDate <= "${dateRange.end}" &&
        quantityChange > 0
      ].quantityChange),
      "totalOut": math::abs(array::sum(*[
        _type == "stockAdjustment" &&
        adjustmentDate >= "${dateRange.start}" &&
        adjustmentDate <= "${dateRange.end}" &&
        quantityChange < 0
      ].quantityChange)),
      "byType": {
        "received": array::sum(*[
          _type == "stockAdjustment" &&
          adjustmentDate >= "${dateRange.start}" &&
          adjustmentDate <= "${dateRange.end}" &&
          adjustmentType == "received"
        ].quantityChange),
        "sold": math::abs(array::sum(*[
          _type == "stockAdjustment" &&
          adjustmentDate >= "${dateRange.start}" &&
          adjustmentDate <= "${dateRange.end}" &&
          adjustmentType == "sold"
        ].quantityChange)),
        "returned": array::sum(*[
          _type == "stockAdjustment" &&
          adjustmentDate >= "${dateRange.start}" &&
          adjustmentDate <= "${dateRange.end}" &&
          adjustmentType == "returned"
        ].quantityChange),
        "damaged": math::abs(array::sum(*[
          _type == "stockAdjustment" &&
          adjustmentDate >= "${dateRange.start}" &&
          adjustmentDate <= "${dateRange.end}" &&
          adjustmentType == "damaged"
        ].quantityChange)),
        "transferred": math::abs(array::sum(*[
          _type == "stockAdjustment" &&
          adjustmentDate >= "${dateRange.start}" &&
          adjustmentDate <= "${dateRange.end}" &&
          adjustmentType == "transferred"
        ].quantityChange)),
        "adjustment": array::sum(*[
          _type == "stockAdjustment" &&
          adjustmentDate >= "${dateRange.start}" &&
          adjustmentDate <= "${dateRange.end}" &&
          adjustmentType == "adjustment"
        ].quantityChange)
      },
      "adjustmentCount": count(*[
        _type == "stockAdjustment" &&
        adjustmentDate >= "${dateRange.start}" &&
        adjustmentDate <= "${dateRange.end}"
      ])
    }
  `.trim();
}
