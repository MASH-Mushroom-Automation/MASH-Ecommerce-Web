/**
 * Unit Tests for Stock Management Types
 */

import {
  // Type guards
  isStockAdjustmentType,
  isStockThresholdConfig,
  isStockAdjustmentRequest,
  
  // Helper functions
  getReasonLabel,
  getReasonsForType,
  getStockStatus,
  calculateNewStock,
  validateStockAdjustment,
  
  // Constants
  STOCK_ADJUSTMENT_REASONS,
  
  // Schemas
  stockAdjustmentTypeSchema,
  stockThresholdConfigSchema,
  stockAdjustmentRequestSchema,
  batchStockUpdateRequestSchema,
  
  // Types
  StockAdjustmentType,
  StockThresholdConfig,
  StockAdjustmentRequest,
} from './stock-management';

describe('Stock Adjustment Type Schema', () => {
  it('should validate valid adjustment types', () => {
    const validTypes: StockAdjustmentType[] = [
      'received',
      'sold',
      'returned',
      'damaged',
      'transferred',
      'adjustment',
    ];

    validTypes.forEach((type) => {
      const result = stockAdjustmentTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid adjustment types', () => {
    const invalidTypes = ['invalid', 'purchase', '', null, undefined, 123];

    invalidTypes.forEach((type) => {
      const result = stockAdjustmentTypeSchema.safeParse(type);
      expect(result.success).toBe(false);
    });
  });
});

describe('Stock Threshold Config Schema', () => {
  it('should validate valid threshold config', () => {
    const validConfig: StockThresholdConfig = {
      lowStockThreshold: 10,
      outOfStockThreshold: 0,
      restockLevel: 50,
    };

    const result = stockThresholdConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should reject negative thresholds', () => {
    const invalidConfig = {
      lowStockThreshold: -1,
      outOfStockThreshold: 0,
      restockLevel: 50,
    };

    const result = stockThresholdConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should reject when low stock threshold <= out of stock threshold', () => {
    const invalidConfig = {
      lowStockThreshold: 5,
      outOfStockThreshold: 10,
      restockLevel: 50,
    };

    const result = stockThresholdConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should allow equal thresholds to fail validation', () => {
    const invalidConfig = {
      lowStockThreshold: 5,
      outOfStockThreshold: 5,
      restockLevel: 50,
    };

    const result = stockThresholdConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should accept zero as out of stock threshold', () => {
    const validConfig = {
      lowStockThreshold: 10,
      outOfStockThreshold: 0,
      restockLevel: 50,
    };

    const result = stockThresholdConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });
});

describe('Stock Adjustment Request Schema', () => {
  it('should validate valid adjustment request', () => {
    const validRequest: StockAdjustmentRequest = {
      productId: 'prod-123',
      adjustmentType: 'received',
      quantityChange: 50,
      reason: 'PURCHASE_ORDER',
      notes: 'Received from supplier XYZ',
      adjustedBy: 'user-456',
    };

    const result = stockAdjustmentRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should require productId', () => {
    const invalidRequest = {
      adjustmentType: 'received',
      quantityChange: 50,
      reason: 'PURCHASE_ORDER',
    };

    const result = stockAdjustmentRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject zero quantity change', () => {
    const invalidRequest = {
      productId: 'prod-123',
      adjustmentType: 'received',
      quantityChange: 0,
      reason: 'PURCHASE_ORDER',
    };

    const result = stockAdjustmentRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should allow negative quantity change', () => {
    const validRequest = {
      productId: 'prod-123',
      adjustmentType: 'sold',
      quantityChange: -10,
      reason: 'CUSTOMER_ORDER',
    };

    const result = stockAdjustmentRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject notes longer than 500 characters', () => {
    const invalidRequest = {
      productId: 'prod-123',
      adjustmentType: 'received',
      quantityChange: 50,
      reason: 'PURCHASE_ORDER',
      notes: 'a'.repeat(501),
    };

    const result = stockAdjustmentRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should allow optional fields to be missing', () => {
    const validRequest = {
      productId: 'prod-123',
      adjustmentType: 'received',
      quantityChange: 50,
      reason: 'PURCHASE_ORDER',
    };

    const result = stockAdjustmentRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });
});

describe('Batch Stock Update Request Schema', () => {
  it('should validate valid batch request', () => {
    const validRequest = {
      adjustments: [
        {
          productId: 'prod-123',
          adjustmentType: 'received',
          quantityChange: 50,
          reason: 'PURCHASE_ORDER',
        },
        {
          productId: 'prod-456',
          adjustmentType: 'sold',
          quantityChange: -10,
          reason: 'CUSTOMER_ORDER',
        },
      ],
      mode: 'atomic',
    };

    const result = batchStockUpdateRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject empty adjustments array', () => {
    const invalidRequest = {
      adjustments: [],
      mode: 'atomic',
    };

    const result = batchStockUpdateRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should validate mode enum', () => {
    const validModes = ['atomic', 'partial'];

    validModes.forEach((mode) => {
      const request = {
        adjustments: [
          {
            productId: 'prod-123',
            adjustmentType: 'received',
            quantityChange: 50,
            reason: 'PURCHASE_ORDER',
          },
        ],
        mode,
      };

      const result = batchStockUpdateRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid mode', () => {
    const invalidRequest = {
      adjustments: [
        {
          productId: 'prod-123',
          adjustmentType: 'received',
          quantityChange: 50,
          reason: 'PURCHASE_ORDER',
        },
      ],
      mode: 'invalid',
    };

    const result = batchStockUpdateRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});

describe('Type Guards', () => {
  describe('isStockAdjustmentType', () => {
    it('should return true for valid adjustment types', () => {
      expect(isStockAdjustmentType('received')).toBe(true);
      expect(isStockAdjustmentType('sold')).toBe(true);
      expect(isStockAdjustmentType('returned')).toBe(true);
      expect(isStockAdjustmentType('damaged')).toBe(true);
      expect(isStockAdjustmentType('transferred')).toBe(true);
      expect(isStockAdjustmentType('adjustment')).toBe(true);
    });

    it('should return false for invalid types', () => {
      expect(isStockAdjustmentType('invalid')).toBe(false);
      expect(isStockAdjustmentType('')).toBe(false);
      expect(isStockAdjustmentType(null)).toBe(false);
      expect(isStockAdjustmentType(undefined)).toBe(false);
      expect(isStockAdjustmentType(123)).toBe(false);
    });
  });

  describe('isStockThresholdConfig', () => {
    it('should return true for valid threshold config', () => {
      const validConfig = {
        lowStockThreshold: 10,
        outOfStockThreshold: 0,
        restockLevel: 50,
      };

      expect(isStockThresholdConfig(validConfig)).toBe(true);
    });

    it('should return false for invalid threshold config', () => {
      expect(isStockThresholdConfig({})).toBe(false);
      expect(isStockThresholdConfig({ lowStockThreshold: 10 })).toBe(false);
      expect(isStockThresholdConfig(null)).toBe(false);
    });
  });

  describe('isStockAdjustmentRequest', () => {
    it('should return true for valid adjustment request', () => {
      const validRequest = {
        productId: 'prod-123',
        adjustmentType: 'received',
        quantityChange: 50,
        reason: 'PURCHASE_ORDER',
      };

      expect(isStockAdjustmentRequest(validRequest)).toBe(true);
    });

    it('should return false for invalid adjustment request', () => {
      expect(isStockAdjustmentRequest({})).toBe(false);
      expect(isStockAdjustmentRequest(null)).toBe(false);
    });
  });
});

describe('Helper Functions', () => {
  describe('getReasonLabel', () => {
    it('should return correct label for valid reason code', () => {
      expect(getReasonLabel('received', 'PURCHASE_ORDER')).toBe('Purchase Order');
      expect(getReasonLabel('sold', 'CUSTOMER_ORDER')).toBe('Customer Order');
      expect(getReasonLabel('damaged', 'EXPIRED')).toBe('Expired');
    });

    it('should return code if reason not found', () => {
      expect(getReasonLabel('received', 'INVALID_CODE')).toBe('INVALID_CODE');
    });
  });

  describe('getReasonsForType', () => {
    it('should return all reasons for a given type', () => {
      const receivedReasons = getReasonsForType('received');
      expect(receivedReasons.length).toBeGreaterThan(0);
      expect(receivedReasons[0].type).toBe('received');

      const soldReasons = getReasonsForType('sold');
      expect(soldReasons.length).toBeGreaterThan(0);
      expect(soldReasons[0].type).toBe('sold');
    });

    it('should return correct number of reasons per type', () => {
      expect(getReasonsForType('received').length).toBe(4);
      expect(getReasonsForType('sold').length).toBe(3);
      expect(getReasonsForType('returned').length).toBe(4);
      expect(getReasonsForType('damaged').length).toBe(4);
      expect(getReasonsForType('transferred').length).toBe(2);
      expect(getReasonsForType('adjustment').length).toBe(4);
    });
  });

  describe('getStockStatus', () => {
    const thresholds: StockThresholdConfig = {
      lowStockThreshold: 10,
      outOfStockThreshold: 0,
      restockLevel: 50,
    };

    it('should return "in-stock" for quantities above low stock threshold', () => {
      expect(getStockStatus(50, thresholds)).toBe('in-stock');
      expect(getStockStatus(11, thresholds)).toBe('in-stock');
    });

    it('should return "low-stock" for quantities at or below low stock threshold', () => {
      expect(getStockStatus(10, thresholds)).toBe('low-stock');
      expect(getStockStatus(5, thresholds)).toBe('low-stock');
      expect(getStockStatus(1, thresholds)).toBe('low-stock');
    });

    it('should return "out-of-stock" for quantities at or below out of stock threshold', () => {
      expect(getStockStatus(0, thresholds)).toBe('out-of-stock');
    });

    it('should handle negative stock as out-of-stock', () => {
      expect(getStockStatus(-5, thresholds)).toBe('out-of-stock');
    });
  });

  describe('calculateNewStock', () => {
    it('should correctly add positive quantity change', () => {
      expect(calculateNewStock(50, 10)).toBe(60);
      expect(calculateNewStock(0, 100)).toBe(100);
    });

    it('should correctly subtract negative quantity change', () => {
      expect(calculateNewStock(50, -10)).toBe(40);
      expect(calculateNewStock(100, -50)).toBe(50);
    });

    it('should prevent negative stock', () => {
      expect(calculateNewStock(10, -20)).toBe(0);
      expect(calculateNewStock(0, -10)).toBe(0);
    });

    it('should handle zero quantity change', () => {
      expect(calculateNewStock(50, 0)).toBe(50);
    });
  });

  describe('validateStockAdjustment', () => {
    it('should validate correct received adjustment', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'received',
        quantityChange: 50,
        reason: 'PURCHASE_ORDER',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject received adjustment with negative quantity', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'received',
        quantityChange: -50,
        reason: 'PURCHASE_ORDER',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must have positive quantity');
    });

    it('should validate correct sold adjustment', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'sold',
        quantityChange: -10,
        reason: 'CUSTOMER_ORDER',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(true);
    });

    it('should reject sold adjustment with positive quantity', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'sold',
        quantityChange: 10,
        reason: 'CUSTOMER_ORDER',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must have negative quantity');
    });

    it('should reject adjustment causing negative stock', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'sold',
        quantityChange: -150,
        reason: 'CUSTOMER_ORDER',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Insufficient stock');
    });

    it('should reject invalid reason code', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'received',
        quantityChange: 50,
        reason: 'INVALID_REASON',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid reason code');
    });

    it('should validate damaged adjustment', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'damaged',
        quantityChange: -5,
        reason: 'EXPIRED',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(true);
    });

    it('should validate returned adjustment', () => {
      const adjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'returned',
        quantityChange: 3,
        reason: 'DEFECTIVE',
      };

      const result = validateStockAdjustment(100, adjustment);
      expect(result.valid).toBe(true);
    });

    it('should validate adjustment type adjustment (can be positive or negative)', () => {
      const positiveAdjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'adjustment',
        quantityChange: 10,
        reason: 'COUNT_DISCREPANCY',
      };

      const negativeAdjustment: StockAdjustmentRequest = {
        productId: 'prod-123',
        adjustmentType: 'adjustment',
        quantityChange: -10,
        reason: 'COUNT_DISCREPANCY',
      };

      expect(validateStockAdjustment(100, positiveAdjustment).valid).toBe(true);
      expect(validateStockAdjustment(100, negativeAdjustment).valid).toBe(true);
    });
  });
});

describe('STOCK_ADJUSTMENT_REASONS', () => {
  it('should have reasons for all adjustment types', () => {
    const adjustmentTypes: StockAdjustmentType[] = [
      'received',
      'sold',
      'returned',
      'damaged',
      'transferred',
      'adjustment',
    ];

    adjustmentTypes.forEach((type) => {
      expect(STOCK_ADJUSTMENT_REASONS[type]).toBeDefined();
      expect(STOCK_ADJUSTMENT_REASONS[type].length).toBeGreaterThan(0);
    });
  });

  it('should have correct structure for each reason', () => {
    Object.values(STOCK_ADJUSTMENT_REASONS).forEach((reasons) => {
      reasons.forEach((reason) => {
        expect(reason).toHaveProperty('type');
        expect(reason).toHaveProperty('code');
        expect(reason).toHaveProperty('label');
        expect(typeof reason.code).toBe('string');
        expect(typeof reason.label).toBe('string');
      });
    });
  });

  it('should have unique reason codes per type', () => {
    Object.entries(STOCK_ADJUSTMENT_REASONS).forEach(([type, reasons]) => {
      const codes = reasons.map((r) => r.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});
