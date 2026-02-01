/**
 * Unit Tests for Sanity Inventory Queries
 */

import {
  getInventoryStatsQuery,
  getLowStockProductsQuery,
  getStockValueQuery,
  getCategoryInventoryQuery,
  getStockHistoryQuery,
  countLowStockProductsQuery,
} from './inventory';
import { DEFAULT_LOW_STOCK_FILTERS } from '@/types/inventory';
import type { LowStockFilters } from '@/types/inventory';

describe('getInventoryStatsQuery', () => {
  it('should build query with default threshold', () => {
    const query = getInventoryStatsQuery();

    // Check structure
    expect(query).toContain('"totalSKUs"');
    expect(query).toContain('"inStock"');
    expect(query).toContain('"lowStock"');
    expect(query).toContain('"outOfStock"');

    // Check default threshold (10)
    expect(query).toContain('stockQuantity, 0) >= 10');
    expect(query).toContain('stockQuantity, 0) < 10');

    // Check draft and archived exclusion
    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('archived != true');
  });

  it('should build query with custom threshold', () => {
    const query = getInventoryStatsQuery(20);

    expect(query).toContain('stockQuantity, 0) >= 20');
    expect(query).toContain('stockQuantity, 0) < 20');
  });

  it('should use coalesce for null safety', () => {
    const query = getInventoryStatsQuery();

    // Check that coalesce is used for stockQuantity
    expect(query).toContain('coalesce(stockQuantity, 0)');
  });
});

describe('getLowStockProductsQuery', () => {
  it('should build basic query with no filters', () => {
    const query = getLowStockProductsQuery(DEFAULT_LOW_STOCK_FILTERS);

    // Check type filter
    expect(query).toContain('_type == "product"');
    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('archived != true');

    // Check low stock condition
    expect(query).toContain('coalesce(stockQuantity, 0) < 10');

    // Check projections
    expect(query).toContain('_id');
    expect(query).toContain('name');
    expect(query).toContain('sku');
    expect(query).toContain('"currentStock"');
    expect(query).toContain('"lowStockThreshold"');
    expect(query).toContain('"restockLevel"');

    // Check image coalesce
    expect(query).toContain('coalesce(mainImage.asset->url, image.asset->url)');

    // Check default pagination
    expect(query).toContain('[0...20]');
  });

  it('should apply search filter', () => {
    const filters: LowStockFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      search: 'oyster',
    };
    const query = getLowStockProductsQuery(filters);

    expect(query).toContain('lower(name) match "oyster*"');
    expect(query).toContain('lower(sku) match "oyster*"');
  });

  it('should apply category filter', () => {
    const filters: LowStockFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      categoryIds: ['cat-001', 'cat-002'],
    };
    const query = getLowStockProductsQuery(filters);

    expect(query).toContain('category._ref == "cat-001"');
    expect(query).toContain('category._ref == "cat-002"');
    expect(query).toContain('||');
  });

  it('should sort by urgency (stock quantity ascending)', () => {
    const filters: LowStockFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      sortBy: 'urgency',
      sortDirection: 'desc',
    };
    const query = getLowStockProductsQuery(filters);

    expect(query).toContain('order(coalesce(stockQuantity, 0) desc)');
  });

  it('should sort by name', () => {
    const filters: LowStockFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      sortBy: 'name',
      sortDirection: 'asc',
    };
    const query = getLowStockProductsQuery(filters);

    expect(query).toContain('order(name asc)');
  });

  it('should sort by stock quantity', () => {
    const filters: LowStockFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      sortBy: 'stock',
      sortDirection: 'desc',
    };
    const query = getLowStockProductsQuery(filters);

    expect(query).toContain('order(coalesce(stockQuantity, 0) desc)');
  });

  it('should support pagination', () => {
    const query = getLowStockProductsQuery(DEFAULT_LOW_STOCK_FILTERS, 10, 20);

    expect(query).toContain('[20...30]');
  });

  it('should combine multiple filters with AND logic', () => {
    const filters: LowStockFilters = {
      search: 'mushroom',
      categoryIds: ['cat-001'],
      urgencyLevels: ['critical', 'high'],
      sortBy: 'urgency',
      sortDirection: 'desc',
    };
    const query = getLowStockProductsQuery(filters);

    // All conditions should be present
    expect(query).toContain('_type == "product"');
    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('archived != true');
    expect(query).toContain('coalesce(stockQuantity, 0) < 10');
    expect(query).toContain('lower(name) match "mushroom*"');
    expect(query).toContain('category._ref == "cat-001"');
    expect(query).toContain('&&'); // AND logic
  });
});

describe('getStockValueQuery', () => {
  it('should calculate total value with status breakdown', () => {
    const query = getStockValueQuery();

    // Check totalValue structure
    expect(query).toContain('"totalValue"');
    expect(query).toContain('"total"');
    expect(query).toContain('"inStock"');
    expect(query).toContain('"lowStock"');
    expect(query).toContain('"outOfStock"');

    // Check byCategory structure
    expect(query).toContain('"byCategory"');
    expect(query).toContain('"value"');
    expect(query).toContain('"productCount"');

    // Check math::sum usage with projection pattern (GROQ requires projection for math::sum)
    expect(query).toContain('math::sum');
    expect(query).toContain('coalesce(stockQuantity, 0) * coalesce(price, 0)');
    expect(query).toContain('}.v)'); // projection pattern

    // Check category ordering
    expect(query).toContain('order(value desc)');
  });

  it('should exclude drafts and archived products', () => {
    const query = getStockValueQuery();

    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('archived != true');
  });

  it('should use coalesce for null safety', () => {
    const query = getStockValueQuery();

    expect(query).toContain('coalesce(stockQuantity, 0)');
  });
});

describe('getCategoryInventoryQuery', () => {
  it('should return category breakdown with stock counts', () => {
    const query = getCategoryInventoryQuery();

    // Check category projections
    expect(query).toContain('_id');
    expect(query).toContain('name');
    expect(query).toContain('"slug"');
    expect(query).toContain('description');

    // Check stock counts
    expect(query).toContain('"totalProducts"');
    expect(query).toContain('"inStock"');
    expect(query).toContain('"lowStock"');
    expect(query).toContain('"outOfStock"');
    expect(query).toContain('"totalValue"');

    // Check products array
    expect(query).toContain('"products"');
    expect(query).toContain('[0...10]'); // First 10 products

    // Check ordering
    expect(query).toContain('order(name asc)'); // Categories by name
    expect(query).toContain('order(coalesce(stockQuantity, 0) asc)'); // Products by stock
  });

  it('should include stockStatus calculation', () => {
    const query = getCategoryInventoryQuery();

    expect(query).toContain('"stockStatus"');
    expect(query).toContain('select(');
    expect(query).toContain('"out-of-stock"');
    expect(query).toContain('"low-stock"');
    expect(query).toContain('"in-stock"');
  });

  it('should use references() for category filtering', () => {
    const query = getCategoryInventoryQuery();

    expect(query).toContain('references(^._id)');
  });
});

describe('getStockHistoryQuery', () => {
  it('should build query for product stock history', () => {
    const query = getStockHistoryQuery('prod-001');

    // Check type and reference filter
    expect(query).toContain('_type == "stockHistory"');
    expect(query).toContain('product._ref == "prod-001"');

    // Check projections
    expect(query).toContain('_id');
    expect(query).toContain('timestamp');
    expect(query).toContain('previousQuantity');
    expect(query).toContain('newQuantity');
    expect(query).toContain('changeAmount');
    expect(query).toContain('reason');
    expect(query).toContain('notes');
    expect(query).toContain('updatedBy');

    // Check ordering and limit
    expect(query).toContain('order(timestamp desc)');
    expect(query).toContain('[0...30]');
  });

  it('should support custom limit', () => {
    const query = getStockHistoryQuery('prod-002', 10);

    expect(query).toContain('[0...10]');
  });
});

describe('countLowStockProductsQuery', () => {
  it('should count products with no filters', () => {
    const query = countLowStockProductsQuery(DEFAULT_LOW_STOCK_FILTERS);

    expect(query).toContain('count(');
    expect(query).toContain('_type == "product"');
    expect(query).toContain('!(_id in path("drafts.**"))');
    expect(query).toContain('archived != true');
    expect(query).toContain('coalesce(stockQuantity, 0) < 10');
  });

  it('should apply search filter', () => {
    const filters: LowStockFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      search: 'oyster',
    };
    const query = countLowStockProductsQuery(filters);

    expect(query).toContain('lower(name) match "oyster*"');
    expect(query).toContain('lower(sku) match "oyster*"');
  });

  it('should apply category filter', () => {
    const filters: LowStockFilters = {
      ...DEFAULT_LOW_STOCK_FILTERS,
      categoryIds: ['cat-001'],
    };
    const query = countLowStockProductsQuery(filters);

    expect(query).toContain('category._ref == "cat-001"');
  });
});
