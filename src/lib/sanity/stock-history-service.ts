/**
 * Stock History Service
 * Service layer for stock history queries and operations
 */

import { sanityClient } from '@/lib/sanity/client';
import { 
  getStockHistoryQuery, 
  getRecentAdjustmentsQuery,
  countStockAdjustmentsQuery,
  getStockAdjustmentsByTypeQuery 
} from '@/lib/sanity/queries/stock-management';
import type { StockAdjustmentHistory, StockAdjustmentType } from '@/types/stock-management';

/**
 * Filter options for stock history
 */
export interface StockHistoryFilters {
  adjustmentTypes?: StockAdjustmentType[];
  dateFrom?: Date | string;
  dateTo?: Date | string;
  searchQuery?: string;
}

/**
 * Paginated response
 */
export interface PaginatedStockHistory {
  items: StockAdjustmentHistory[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  totalPages: number;
}

/**
 * Get stock history for a product with pagination and filters
 */
export async function getStockHistory(
  productId: string,
  options: {
    page?: number;
    pageSize?: number;
    filters?: StockHistoryFilters;
  } = {}
): Promise<PaginatedStockHistory> {
  const { page = 1, pageSize = 20, filters } = options;
  const offset = (page - 1) * pageSize;

  // Build filter conditions
  let filterConditions = '';
  const params: Record<string, unknown> = { productId, limit: pageSize, offset };

  if (filters?.adjustmentTypes && filters.adjustmentTypes.length > 0) {
    filterConditions += ' && adjustmentType in $adjustmentTypes';
    params.adjustmentTypes = filters.adjustmentTypes;
  }

  if (filters?.dateFrom) {
    filterConditions += ' && adjustmentDate >= $dateFrom';
    params.dateFrom = typeof filters.dateFrom === 'string' 
      ? filters.dateFrom 
      : filters.dateFrom.toISOString();
  }

  if (filters?.dateTo) {
    filterConditions += ' && adjustmentDate <= $dateTo';
    params.dateTo = typeof filters.dateTo === 'string' 
      ? filters.dateTo 
      : filters.dateTo.toISOString();
  }

  // Fetch history
  const query = `*[_type == "stockAdjustment" && product._ref == $productId${filterConditions}] | order(adjustmentDate desc) [$offset...$offset + $limit] {
    _id,
    adjustmentType,
    quantityChange,
    previousStock,
    newStock,
    reason,
    notes,
    adjustmentDate,
    "adjustedBy": adjustedBy->{_id, name, email}
  }`;

  const countQuery = `count(*[_type == "stockAdjustment" && product._ref == $productId${filterConditions}])`;

  const [items, total] = await Promise.all([
    sanityClient.fetch<StockAdjustmentHistory[]>(query, params),
    sanityClient.fetch<number>(countQuery, params),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: offset + items.length < total,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get adjustments by type across all products
 */
export async function getAdjustmentsByType(
  type: StockAdjustmentType,
  options: {
    dateFrom?: Date | string;
    dateTo?: Date | string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<PaginatedStockHistory> {
  const { page = 1, pageSize = 20, dateFrom, dateTo } = options;
  const offset = (page - 1) * pageSize;

  const params: Record<string, unknown> = {
    type,
    limit: pageSize,
    offset,
  };

  let dateFilter = '';
  if (dateFrom) {
    dateFilter += ' && adjustmentDate >= $dateFrom';
    params.dateFrom = typeof dateFrom === 'string' ? dateFrom : dateFrom.toISOString();
  }
  if (dateTo) {
    dateFilter += ' && adjustmentDate <= $dateTo';
    params.dateTo = typeof dateTo === 'string' ? dateTo : dateTo.toISOString();
  }

  const query = `*[_type == "stockAdjustment" && adjustmentType == $type${dateFilter}] | order(adjustmentDate desc) [$offset...$offset + $limit] {
    _id,
    adjustmentType,
    quantityChange,
    previousStock,
    newStock,
    reason,
    notes,
    adjustmentDate,
    "product": product->{_id, name, sku, "image": coalesce(mainImage.asset->url, image.asset->url)},
    "adjustedBy": adjustedBy->{_id, name, email}
  }`;

  const countQuery = `count(*[_type == "stockAdjustment" && adjustmentType == $type${dateFilter}])`;

  const [items, total] = await Promise.all([
    sanityClient.fetch<StockAdjustmentHistory[]>(query, params),
    sanityClient.fetch<number>(countQuery, params),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    hasMore: offset + items.length < total,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get recent adjustments across all products
 */
export async function getRecentAdjustments(
  limit: number = 20
): Promise<StockAdjustmentHistory[]> {
  const query = getRecentAdjustmentsQuery(limit);
  return sanityClient.fetch<StockAdjustmentHistory[]>(query);
}

/**
 * Export stock history to CSV format
 */
export function exportStockHistoryToCSV(
  history: StockAdjustmentHistory[]
): string {
  const header = [
    'Date',
    'Type',
    'Quantity Change',
    'Previous Stock',
    'New Stock',
    'Reason',
    'Notes',
    'Adjusted By',
  ].join(',');

  const rows = history.map(item => [
    new Date(item.adjustmentDate).toISOString(),
    item.adjustmentType,
    item.quantityChange,
    item.previousStock,
    item.newStock,
    `"${item.reason}"`,
    `"${item.notes || ''}"`,
    `"${item.adjustedBy?.name || item.adjustedBy?.email || 'Unknown'}"`,
  ].join(','));

  return [header, ...rows].join('\n');
}

/**
 * Download CSV file in browser
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Get stock history statistics for a product
 */
export async function getStockHistoryStats(productId: string): Promise<{
  totalAdjustments: number;
  typeBreakdown: Record<StockAdjustmentType, number>;
  lastAdjustment: StockAdjustmentHistory | null;
}> {
  const [total, typeBreakdown, lastAdjustment] = await Promise.all([
    sanityClient.fetch<number>(
      `count(*[_type == "stockAdjustment" && product._ref == $productId])`,
      { productId }
    ),
    sanityClient.fetch<Array<{ type: StockAdjustmentType; count: number }>>(
      `*[_type == "stockAdjustment" && product._ref == $productId] {
        "type": adjustmentType,
        "count": 1
      } | {
        "received": count(type == "received"),
        "sold": count(type == "sold"),
        "returned": count(type == "returned"),
        "damaged": count(type == "damaged"),
        "transferred": count(type == "transferred"),
        "adjustment": count(type == "adjustment")
      }`,
      { productId }
    ),
    sanityClient.fetch<StockAdjustmentHistory | null>(
      `*[_type == "stockAdjustment" && product._ref == $productId] | order(adjustmentDate desc) [0] {
        _id,
        adjustmentType,
        quantityChange,
        previousStock,
        newStock,
        reason,
        notes,
        adjustmentDate,
        "adjustedBy": adjustedBy->{_id, name, email}
      }`,
      { productId }
    ),
  ]);

  // Process type breakdown - ensure all types are present
  const breakdown: Record<StockAdjustmentType, number> = {
    received: 0,
    sold: 0,
    returned: 0,
    damaged: 0,
    transferred: 0,
    adjustment: 0,
  };

  if (Array.isArray(typeBreakdown) && typeBreakdown.length > 0) {
    const data = typeBreakdown[0] as unknown as Record<string, number>;
    Object.keys(breakdown).forEach(key => {
      breakdown[key as StockAdjustmentType] = data[key] || 0;
    });
  }

  return {
    totalAdjustments: total,
    typeBreakdown: breakdown,
    lastAdjustment,
  };
}
