/**
 * Tests for Inventory Type Utility Functions
 * @module src/types/inventory
 *
 * Covers: isInventoryStockStatus, calculateUrgencyLevel, calculateStockStatus,
 *   formatCurrency, calculateInventoryStats, generateStockLevelData
 */

import {
  isInventoryStockStatus,
  calculateUrgencyLevel,
  calculateStockStatus,
  formatCurrency,
  calculateInventoryStats,
  generateStockLevelData,
  DEFAULT_LOW_STOCK_FILTERS,
} from './inventory';

// ============================================================================
// isInventoryStockStatus
// ============================================================================

describe('isInventoryStockStatus', () => {
  it('returns true for valid stock statuses', () => {
    expect(isInventoryStockStatus('in-stock')).toBe(true);
    expect(isInventoryStockStatus('low-stock')).toBe(true);
    expect(isInventoryStockStatus('out-of-stock')).toBe(true);
  });

  it('returns false for invalid values', () => {
    expect(isInventoryStockStatus('available')).toBe(false);
    expect(isInventoryStockStatus('INSTOCK')).toBe(false);
    expect(isInventoryStockStatus('')).toBe(false);
    expect(isInventoryStockStatus(null)).toBe(false);
    expect(isInventoryStockStatus(undefined)).toBe(false);
    expect(isInventoryStockStatus(42)).toBe(false);
  });
});

// ============================================================================
// calculateUrgencyLevel
// ============================================================================

describe('calculateUrgencyLevel', () => {
  it('returns "critical" when stock is 0-25% of threshold', () => {
    expect(calculateUrgencyLevel(0, 100)).toBe('critical');
    expect(calculateUrgencyLevel(2, 10)).toBe('critical');
    expect(calculateUrgencyLevel(25, 100)).toBe('critical');
  });

  it('returns "high" when stock is 26-50% of threshold', () => {
    expect(calculateUrgencyLevel(3, 10)).toBe('high');
    expect(calculateUrgencyLevel(5, 10)).toBe('high');
    expect(calculateUrgencyLevel(50, 100)).toBe('high');
  });

  it('returns "medium" when stock is 51-100% of threshold', () => {
    expect(calculateUrgencyLevel(6, 10)).toBe('medium');
    expect(calculateUrgencyLevel(9, 10)).toBe('medium');
    expect(calculateUrgencyLevel(10, 10)).toBe('medium');
  });

  it('handles zero threshold (division by zero)', () => {
    // 0/0 = NaN, NaN <= 0.25 is false, NaN <= 0.5 is false => 'medium'
    expect(calculateUrgencyLevel(0, 0)).toBe('medium');
  });
});

// ============================================================================
// calculateStockStatus
// ============================================================================

describe('calculateStockStatus', () => {
  it('returns "out-of-stock" for zero stock', () => {
    expect(calculateStockStatus(0)).toBe('out-of-stock');
    expect(calculateStockStatus(0, 5)).toBe('out-of-stock');
  });

  it('returns "low-stock" when stock is below threshold', () => {
    expect(calculateStockStatus(5, 10)).toBe('low-stock');
    expect(calculateStockStatus(1, 10)).toBe('low-stock');
    expect(calculateStockStatus(9, 10)).toBe('low-stock');
  });

  it('returns "in-stock" when stock meets or exceeds threshold', () => {
    expect(calculateStockStatus(10, 10)).toBe('in-stock');
    expect(calculateStockStatus(100, 10)).toBe('in-stock');
    expect(calculateStockStatus(50)).toBe('in-stock'); // default threshold 10
  });

  it('uses default threshold of 10', () => {
    expect(calculateStockStatus(5)).toBe('low-stock');
    expect(calculateStockStatus(10)).toBe('in-stock');
    expect(calculateStockStatus(15)).toBe('in-stock');
  });
});

// ============================================================================
// formatCurrency
// ============================================================================

describe('formatCurrency', () => {
  it('formats PHP currency with 2 decimal places', () => {
    const result = formatCurrency(1234.56);
    // Should contain PHP symbol and formatted number
    expect(result).toContain('1,234.56');
  });

  it('formats zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0.00');
  });

  it('formats with custom currency', () => {
    const result = formatCurrency(100, 'USD');
    expect(result).toContain('100.00');
  });

  it('handles negative values', () => {
    const result = formatCurrency(-50.5);
    expect(result).toContain('50.50');
  });

  it('rounds to 2 decimal places', () => {
    const result = formatCurrency(10.999);
    expect(result).toContain('11.00');
  });
});

// ============================================================================
// calculateInventoryStats
// ============================================================================

describe('calculateInventoryStats', () => {
  it('calculates stats for mixed inventory', () => {
    const products = [
      { stockQuantity: 100, lowStockThreshold: 10 }, // in-stock
      { stockQuantity: 5, lowStockThreshold: 10 },   // low-stock
      { stockQuantity: 0, lowStockThreshold: 10 },    // out-of-stock
      { stockQuantity: 50, lowStockThreshold: 10 },  // in-stock
    ];

    const stats = calculateInventoryStats(products);
    expect(stats.totalSKUs).toBe(4);
    expect(stats.inStock).toBe(2);
    expect(stats.lowStock).toBe(1);
    expect(stats.outOfStock).toBe(1);
    expect(stats.inStockPercentage).toBe(50);
    expect(stats.lowStockPercentage).toBe(25);
    expect(stats.outOfStockPercentage).toBe(25);
  });

  it('handles empty product array', () => {
    const stats = calculateInventoryStats([]);
    expect(stats.totalSKUs).toBe(0);
    expect(stats.inStock).toBe(0);
    expect(stats.lowStock).toBe(0);
    expect(stats.outOfStock).toBe(0);
    expect(stats.inStockPercentage).toBe(0);
    expect(stats.lowStockPercentage).toBe(0);
    expect(stats.outOfStockPercentage).toBe(0);
  });

  it('uses default threshold when product threshold is undefined', () => {
    const products = [
      { stockQuantity: 5 },  // low-stock (5 < default 10)
      { stockQuantity: 15 }, // in-stock
      { stockQuantity: 0 },  // out-of-stock
    ];

    const stats = calculateInventoryStats(products);
    expect(stats.lowStock).toBe(1);
    expect(stats.inStock).toBe(1);
    expect(stats.outOfStock).toBe(1);
  });

  it('handles undefined stockQuantity (defaults to 0)', () => {
    const products = [{ lowStockThreshold: 10 }]; // stockQuantity undefined -> 0
    const stats = calculateInventoryStats(products);
    expect(stats.outOfStock).toBe(1);
  });

  it('uses custom default threshold', () => {
    const products = [
      { stockQuantity: 3 },
      { stockQuantity: 6 },
    ];

    const stats = calculateInventoryStats(products, 5);
    expect(stats.lowStock).toBe(1);  // 3 < 5
    expect(stats.inStock).toBe(1);   // 6 >= 5
  });

  it('all in-stock', () => {
    const products = [
      { stockQuantity: 100 },
      { stockQuantity: 50 },
    ];

    const stats = calculateInventoryStats(products);
    expect(stats.inStockPercentage).toBe(100);
    expect(stats.lowStockPercentage).toBe(0);
    expect(stats.outOfStockPercentage).toBe(0);
  });

  it('all out-of-stock', () => {
    const products = [
      { stockQuantity: 0 },
      { stockQuantity: 0 },
    ];

    const stats = calculateInventoryStats(products);
    expect(stats.outOfStockPercentage).toBe(100);
    expect(stats.inStockPercentage).toBe(0);
  });
});

// ============================================================================
// generateStockLevelData
// ============================================================================

describe('generateStockLevelData', () => {
  it('generates chart data from stats', () => {
    const stats = {
      totalSKUs: 10,
      inStock: 6,
      lowStock: 3,
      outOfStock: 1,
      inStockPercentage: 60,
      lowStockPercentage: 30,
      outOfStockPercentage: 10,
    };

    const data = generateStockLevelData(stats);
    expect(data).toHaveLength(3);

    expect(data[0]).toEqual({
      status: 'in-stock',
      count: 6,
      percentage: 60,
      color: '#10b981',
      label: 'In Stock',
    });

    expect(data[1]).toEqual({
      status: 'low-stock',
      count: 3,
      percentage: 30,
      color: '#f59e0b',
      label: 'Low Stock',
    });

    expect(data[2]).toEqual({
      status: 'out-of-stock',
      count: 1,
      percentage: 10,
      color: '#ef4444',
      label: 'Out of Stock',
    });
  });

  it('handles all zeros', () => {
    const stats = {
      totalSKUs: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      inStockPercentage: 0,
      lowStockPercentage: 0,
      outOfStockPercentage: 0,
    };

    const data = generateStockLevelData(stats);
    expect(data).toHaveLength(3);
    expect(data.every(d => d.count === 0)).toBe(true);
    expect(data.every(d => d.percentage === 0)).toBe(true);
  });
});

// ============================================================================
// DEFAULT_LOW_STOCK_FILTERS
// ============================================================================

describe('DEFAULT_LOW_STOCK_FILTERS', () => {
  it('has correct default values', () => {
    expect(DEFAULT_LOW_STOCK_FILTERS.search).toBe('');
    expect(DEFAULT_LOW_STOCK_FILTERS.categoryIds).toEqual([]);
    expect(DEFAULT_LOW_STOCK_FILTERS.urgencyLevels).toEqual(['critical', 'high', 'medium']);
    expect(DEFAULT_LOW_STOCK_FILTERS.sortBy).toBe('urgency');
    expect(DEFAULT_LOW_STOCK_FILTERS.sortDirection).toBe('desc');
  });
});
