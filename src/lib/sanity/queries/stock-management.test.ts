/**
 * Unit Tests for Sanity Stock Management Queries
 */

import {
  getStockHistoryQuery,
  getStockAdjustmentsByTypeQuery,
  getRecentAdjustmentsQuery,
  countStockAdjustmentsQuery,
  getStockAdjustmentByIdQuery,
  getFilteredStockAdjustmentsQuery,
  countAdjustmentsByTypeQuery,
  getStockMovementSummaryQuery,
} from './stock-management';
import type { StockAdjustmentType } from '@/types/stock-management';

describe('getStockHistoryQuery', () => {
  it('should build query with default pagination', () => {
    const productId = 'prod-123';
    const query = getStockHistoryQuery(productId);

    // Check type and product filter
    expect(query).toContain('_type == "stockAdjustment"');
    expect(query).toContain(`product._ref == "${productId}"`);

    // Check sorting (newest first)
    expect(query).toContain('order(adjustmentDate desc)');

    // Check default pagination (30 items from offset 0)
    expect(query).toContain('[0...30]');

    // Check projections
    expect(query).toContain('_id');
    expect(query).toContain('adjustmentType');
    expect(query).toContain('quantityChange');
    expect(query).toContain('previousStock');
    expect(query).toContain('newStock');
    expect(query).toContain('reason');
    expect(query).toContain('notes');
    expect(query).toContain('adjustedBy');
    expect(query).toContain('adjustmentDate');

    // Check product reference projection
    expect(query).toContain('"product": product->');
    expect(query).toContain('name');
    expect(query).toContain('sku');

    // Check image coalesce for null safety
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');

    // Check category reference
    expect(query).toContain('category-> { _id, name, slug }');
  });

  it('should support custom pagination', () => {
    const productId = 'prod-123';
    const query = getStockHistoryQuery(productId, 50, 100);

    // Check custom pagination (50 items from offset 100)
    expect(query).toContain('[100...150]');
  });

  it('should handle large pagination values', () => {
    const productId = 'prod-123';
    const query = getStockHistoryQuery(productId, 100, 500);

    // Check large pagination (100 items from offset 500)
    expect(query).toContain('[500...600]');
  });
});

describe('getStockAdjustmentsByTypeQuery', () => {
  it('should filter by adjustment type without date range', () => {
    const type: StockAdjustmentType = 'received';
    const query = getStockAdjustmentsByTypeQuery(type);

    // Check type filter
    expect(query).toContain('_type == "stockAdjustment"');
    expect(query).toContain(`adjustmentType == "${type}"`);

    // Check sorting (newest first)
    expect(query).toContain('order(adjustmentDate desc)');

    // Check default pagination (50 items)
    expect(query).toContain('[0...50]');

    // Check product projection with coalesce
    expect(query).toContain('"product": product->');
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');
  });

  it('should filter by type with start date', () => {
    const type: StockAdjustmentType = 'sold';
    const dateRange = { start: '2026-01-01T00:00:00Z' };
    const query = getStockAdjustmentsByTypeQuery(type, dateRange);

    expect(query).toContain(`adjustmentType == "${type}"`);
    expect(query).toContain(`adjustmentDate >= "${dateRange.start}"`);
    expect(query).not.toContain('adjustmentDate <=');
  });

  it('should filter by type with end date', () => {
    const type: StockAdjustmentType = 'damaged';
    const dateRange = { end: '2026-12-31T23:59:59Z' };
    const query = getStockAdjustmentsByTypeQuery(type, dateRange);

    expect(query).toContain(`adjustmentType == "${type}"`);
    expect(query).toContain(`adjustmentDate <= "${dateRange.end}"`);
    expect(query).not.toContain('adjustmentDate >=');
  });

  it('should filter by type with complete date range', () => {
    const type: StockAdjustmentType = 'returned';
    const dateRange = {
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-31T23:59:59Z',
    };
    const query = getStockAdjustmentsByTypeQuery(type, dateRange);

    expect(query).toContain(`adjustmentType == "${type}"`);
    expect(query).toContain(`adjustmentDate >= "${dateRange.start}"`);
    expect(query).toContain(`adjustmentDate <= "${dateRange.end}"`);
  });

  it('should support custom pagination with filters', () => {
    const type: StockAdjustmentType = 'transferred';
    const dateRange = { start: '2026-01-01T00:00:00Z' };
    const query = getStockAdjustmentsByTypeQuery(type, dateRange, 25, 50);

    expect(query).toContain('[50...75]');
  });

  it('should handle all adjustment types', () => {
    const types: StockAdjustmentType[] = [
      'received',
      'sold',
      'returned',
      'damaged',
      'transferred',
      'adjustment',
    ];

    types.forEach((type) => {
      const query = getStockAdjustmentsByTypeQuery(type);
      expect(query).toContain(`adjustmentType == "${type}"`);
    });
  });
});

describe('getRecentAdjustmentsQuery', () => {
  it('should build query with default limit', () => {
    const query = getRecentAdjustmentsQuery();

    // Check type filter
    expect(query).toContain('_type == "stockAdjustment"');

    // Check sorting (newest first)
    expect(query).toContain('order(adjustmentDate desc)');

    // Check default limit (20 items)
    expect(query).toContain('[0...20]');

    // Check all required projections
    expect(query).toContain('_id');
    expect(query).toContain('adjustmentType');
    expect(query).toContain('quantityChange');
    expect(query).toContain('previousStock');
    expect(query).toContain('newStock');
    expect(query).toContain('adjustmentDate');

    // Check product projection with coalesce
    expect(query).toContain('"product": product->');
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');
  });

  it('should support custom limit', () => {
    const query = getRecentAdjustmentsQuery(50);

    expect(query).toContain('[0...50]');
  });

  it('should support small limits', () => {
    const query = getRecentAdjustmentsQuery(5);

    expect(query).toContain('[0...5]');
  });
});

describe('countStockAdjustmentsQuery', () => {
  it('should build count query for product', () => {
    const productId = 'prod-456';
    const query = countStockAdjustmentsQuery(productId);

    // Check count function
    expect(query).toContain('count(');

    // Check type filter
    expect(query).toContain('_type == "stockAdjustment"');

    // Check product filter
    expect(query).toContain(`product._ref == "${productId}"`);
  });

  it('should handle different product IDs', () => {
    const productIds = ['prod-001', 'prod-abc', 'draft.prod-xyz'];

    productIds.forEach((productId) => {
      const query = countStockAdjustmentsQuery(productId);
      expect(query).toContain(`product._ref == "${productId}"`);
    });
  });
});

describe('getStockAdjustmentByIdQuery', () => {
  it('should build query to get single adjustment', () => {
    const adjustmentId = 'adj-789';
    const query = getStockAdjustmentByIdQuery(adjustmentId);

    // Check type and ID filter
    expect(query).toContain('_type == "stockAdjustment"');
    expect(query).toContain(`_id == "${adjustmentId}"`);

    // Check [0] selector for single result
    expect(query).toContain('[0]');

    // Check all projections
    expect(query).toContain('_id');
    expect(query).toContain('adjustmentType');
    expect(query).toContain('quantityChange');
    expect(query).toContain('previousStock');
    expect(query).toContain('newStock');
    expect(query).toContain('reason');
    expect(query).toContain('notes');
    expect(query).toContain('adjustedBy');
    expect(query).toContain('adjustmentDate');

    // Check extended product projection
    expect(query).toContain('"product": product->');
    expect(query).toContain('description');
    expect(query).toContain('price');
    expect(query).toContain('stockQuantity');

    // Check image coalesce
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');

    // Check grower reference
    expect(query).toContain('grower-> { _id, name, businessName }');
  });
});

describe('getFilteredStockAdjustmentsQuery', () => {
  it('should build query with no filters', () => {
    const query = getFilteredStockAdjustmentsQuery({});

    // Check basic type filter
    expect(query).toContain('_type == "stockAdjustment"');

    // Check sorting
    expect(query).toContain('order(adjustmentDate desc)');

    // Check default pagination
    expect(query).toContain('[0...50]');

    // Check product projection
    expect(query).toContain('"product": product->');
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');
  });

  it('should filter by single adjustment type', () => {
    const filters = {
      adjustmentTypes: ['received'] as StockAdjustmentType[],
    };
    const query = getFilteredStockAdjustmentsQuery(filters);

    expect(query).toContain('adjustmentType == "received"');
  });

  it('should filter by multiple adjustment types', () => {
    const filters = {
      adjustmentTypes: ['received', 'returned', 'sold'] as StockAdjustmentType[],
    };
    const query = getFilteredStockAdjustmentsQuery(filters);

    expect(query).toContain('adjustmentType == "received"');
    expect(query).toContain('adjustmentType == "returned"');
    expect(query).toContain('adjustmentType == "sold"');
    expect(query).toContain('||');
  });

  it('should filter by date range', () => {
    const filters = {
      dateRange: {
        start: '2026-01-01T00:00:00Z',
        end: '2026-01-31T23:59:59Z',
      },
    };
    const query = getFilteredStockAdjustmentsQuery(filters);

    expect(query).toContain(`adjustmentDate >= "${filters.dateRange.start}"`);
    expect(query).toContain(`adjustmentDate <= "${filters.dateRange.end}"`);
  });

  it('should filter by adjusted by user', () => {
    const filters = {
      adjustedBy: 'user-123',
    };
    const query = getFilteredStockAdjustmentsQuery(filters);

    expect(query).toContain('adjustedBy == "user-123"');
  });

  it('should filter by product search', () => {
    const filters = {
      productSearch: 'oyster',
    };
    const query = getFilteredStockAdjustmentsQuery(filters);

    // Check product name/SKU search
    expect(query).toContain('lower(product.name) match "oyster*"');
    expect(query).toContain('lower(product.sku) match "oyster*"');

    // Check defined(product) guard
    expect(query).toContain('defined(product)');
  });

  it('should combine all filters', () => {
    const filters = {
      adjustmentTypes: ['received', 'sold'] as StockAdjustmentType[],
      dateRange: {
        start: '2026-01-01T00:00:00Z',
        end: '2026-01-31T23:59:59Z',
      },
      adjustedBy: 'user-456',
      productSearch: 'mushroom',
    };
    const query = getFilteredStockAdjustmentsQuery(filters);

    expect(query).toContain('adjustmentType == "received"');
    expect(query).toContain('adjustmentType == "sold"');
    expect(query).toContain(`adjustmentDate >= "${filters.dateRange.start}"`);
    expect(query).toContain(`adjustmentDate <= "${filters.dateRange.end}"`);
    expect(query).toContain('adjustedBy == "user-456"');
    expect(query).toContain('lower(product.name) match "mushroom*"');
  });

  it('should support custom pagination', () => {
    const filters = {};
    const query = getFilteredStockAdjustmentsQuery(filters, 100, 200);

    expect(query).toContain('[200...300]');
  });
});

describe('countAdjustmentsByTypeQuery', () => {
  it('should build count query for all types without date range', () => {
    const query = countAdjustmentsByTypeQuery();

    // Check all adjustment type counts
    expect(query).toContain('"received"');
    expect(query).toContain('"sold"');
    expect(query).toContain('"returned"');
    expect(query).toContain('"damaged"');
    expect(query).toContain('"transferred"');
    expect(query).toContain('"adjustment"');
    expect(query).toContain('"total"');

    // Check count function for each type
    expect(query).toContain('adjustmentType == "received"');
    expect(query).toContain('adjustmentType == "sold"');
    expect(query).toContain('adjustmentType == "returned"');
    expect(query).toContain('adjustmentType == "damaged"');
    expect(query).toContain('adjustmentType == "transferred"');
    expect(query).toContain('adjustmentType == "adjustment"');

    // Check type filter
    expect(query).toContain('_type == "stockAdjustment"');
  });

  it('should filter counts by date range', () => {
    const dateRange = {
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-31T23:59:59Z',
    };
    const query = countAdjustmentsByTypeQuery(dateRange);

    expect(query).toContain(`adjustmentDate >= "${dateRange.start}"`);
    expect(query).toContain(`adjustmentDate <= "${dateRange.end}"`);
  });

  it('should filter counts by start date only', () => {
    const dateRange = { start: '2026-01-01T00:00:00Z' };
    const query = countAdjustmentsByTypeQuery(dateRange);

    expect(query).toContain(`adjustmentDate >= "${dateRange.start}"`);
    expect(query).not.toContain('adjustmentDate <=');
  });
});

describe('getStockMovementSummaryQuery', () => {
  it('should build aggregated movement summary', () => {
    const dateRange = {
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-31T23:59:59Z',
    };
    const query = getStockMovementSummaryQuery(dateRange);

    // Check main aggregations
    expect(query).toContain('"totalIn"');
    expect(query).toContain('"totalOut"');
    expect(query).toContain('"byType"');
    expect(query).toContain('"adjustmentCount"');

    // Check date range filters
    expect(query).toContain(`adjustmentDate >= "${dateRange.start}"`);
    expect(query).toContain(`adjustmentDate <= "${dateRange.end}"`);

    // Check type-specific aggregations
    expect(query).toContain('"received"');
    expect(query).toContain('"sold"');
    expect(query).toContain('"returned"');
    expect(query).toContain('"damaged"');
    expect(query).toContain('"transferred"');
    expect(query).toContain('"adjustment"');

    // Check quantity conditions (positive/negative)
    expect(query).toContain('quantityChange > 0');
    expect(query).toContain('quantityChange < 0');

    // Check aggregation functions
    expect(query).toContain('array::sum');
    expect(query).toContain('math::abs');
    expect(query).toContain('count(');
  });

  it('should handle different date ranges', () => {
    const dateRanges = [
      { start: '2026-01-01T00:00:00Z', end: '2026-12-31T23:59:59Z' }, // Full year
      { start: '2026-06-01T00:00:00Z', end: '2026-06-30T23:59:59Z' }, // Single month
      { start: '2026-01-15T00:00:00Z', end: '2026-01-15T23:59:59Z' }, // Single day
    ];

    dateRanges.forEach((dateRange) => {
      const query = getStockMovementSummaryQuery(dateRange);
      expect(query).toContain(`adjustmentDate >= "${dateRange.start}"`);
      expect(query).toContain(`adjustmentDate <= "${dateRange.end}"`);
    });
  });
});
