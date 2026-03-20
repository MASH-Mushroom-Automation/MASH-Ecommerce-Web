/**
 * Stock Management Types and Interfaces
 * TypeScript types for stock adjustments, reasons, and thresholds
 */

import { z } from 'zod';

/**
 * Stock adjustment types
 * Defines the nature of the stock change
 */
export type StockAdjustmentType =
  | 'received' // New stock received from supplier
  | 'sold' // Stock sold to customer
  | 'returned' // Customer return
  | 'damaged' // Damaged or expired stock
  | 'transferred' // Transferred to another location
  | 'adjustment'; // Manual correction

/**
 * Reason codes for each adjustment type
 */
export interface StockAdjustmentReason {
  type: StockAdjustmentType;
  code: string;
  label: string;
  description?: string;
}

/**
 * Predefined reason codes per adjustment type
 */
export const STOCK_ADJUSTMENT_REASONS: Record<StockAdjustmentType, StockAdjustmentReason[]> = {
  received: [
    { type: 'received', code: 'PURCHASE_ORDER', label: 'Purchase Order', description: 'Stock received from supplier' },
    { type: 'received', code: 'TRANSFER_IN', label: 'Transfer In', description: 'Stock transferred from another location' },
    { type: 'received', code: 'PRODUCTION', label: 'Production', description: 'Stock produced in-house' },
    { type: 'received', code: 'RETURN_FROM_CUSTOMER', label: 'Return from Customer', description: 'Customer returned product' },
  ],
  sold: [
    { type: 'sold', code: 'CUSTOMER_ORDER', label: 'Customer Order', description: 'Sold to customer' },
    { type: 'sold', code: 'WHOLESALE', label: 'Wholesale', description: 'Sold to wholesaler' },
    { type: 'sold', code: 'SAMPLE', label: 'Sample', description: 'Given as sample' },
  ],
  returned: [
    { type: 'returned', code: 'DEFECTIVE', label: 'Defective Product', description: 'Product was defective' },
    { type: 'returned', code: 'WRONG_ITEM', label: 'Wrong Item', description: 'Customer received wrong item' },
    { type: 'returned', code: 'CHANGED_MIND', label: 'Changed Mind', description: 'Customer changed mind' },
    { type: 'returned', code: 'DAMAGED_IN_TRANSIT', label: 'Damaged in Transit', description: 'Damaged during delivery' },
  ],
  damaged: [
    { type: 'damaged', code: 'EXPIRED', label: 'Expired', description: 'Product expired' },
    { type: 'damaged', code: 'SPOILED', label: 'Spoiled', description: 'Product spoiled' },
    { type: 'damaged', code: 'BROKEN', label: 'Broken', description: 'Product broken or damaged' },
    { type: 'damaged', code: 'CONTAMINATED', label: 'Contaminated', description: 'Product contaminated' },
  ],
  transferred: [
    { type: 'transferred', code: 'TRANSFER_OUT', label: 'Transfer Out', description: 'Stock transferred to another location' },
    { type: 'transferred', code: 'CONSIGNMENT', label: 'Consignment', description: 'Sent on consignment' },
  ],
  adjustment: [
    { type: 'adjustment', code: 'COUNT_DISCREPANCY', label: 'Count Discrepancy', description: 'Physical count mismatch' },
    { type: 'adjustment', code: 'SYSTEM_ERROR', label: 'System Error', description: 'Correcting system error' },
    { type: 'adjustment', code: 'THEFT', label: 'Theft', description: 'Stock theft or loss' },
    { type: 'adjustment', code: 'OTHER', label: 'Other', description: 'Other adjustment reason' },
  ],
};

/**
 * Stock threshold configuration
 * Defines when to alert for low or out-of-stock conditions
 */
export interface StockThresholdConfig {
  /** Threshold for low stock alert (default: 10) */
  lowStockThreshold: number;
  
  /** Threshold for out of stock alert (default: 0) */
  outOfStockThreshold: number;
  
  /** Recommended reorder quantity */
  restockLevel: number;
}

/**
 * Stock adjustment request
 * Payload for creating a new stock adjustment
 */
export interface StockAdjustmentRequest {
  /** Product ID (Sanity reference) */
  productId: string;
  
  /** Type of adjustment */
  adjustmentType: StockAdjustmentType;
  
  /** Quantity change (positive for increase, negative for decrease) */
  quantityChange: number;
  
  /** Reason code for adjustment */
  reason: string;
  
  /** Optional notes (max 500 characters) */
  notes?: string;
  
  /** User making the adjustment (from auth context) */
  adjustedBy?: string;
}

/**
 * Stock adjustment response
 * Result after creating a stock adjustment
 */
export interface StockAdjustmentResponse {
  /** Operation status */
  success: boolean;

  /** Adjustment ID (Sanity document ID) */
  adjustmentId: string;

  /** Product ID */
  productId: string;

  /** Previous stock quantity */
  oldStock: number;

  /** New stock quantity */
  newStock: number;

  /** Requested stock delta */
  quantityChange: number;

  /** Adjustment timestamp */
  adjustmentDate: string;

  /** Optional message */
  message?: string;
}

/**
 * Stock history item
 * Represents a single stock adjustment in the audit trail
 */
export interface StockAdjustmentHistory {
  /** Adjustment ID */
  _id: string;
  
  /** Created timestamp */
  _createdAt: string;

  /** Updated timestamp */
  _updatedAt?: string;
  
  /** Product reference */
  product: {
    _id: string;
    name: string;
    sku: string;
    slug?: string;
    mainImage?: string;
    stockQuantity?: number;
  };
  
  /** Adjustment type */
  adjustmentType: StockAdjustmentType;
  
  /** Quantity change */
  quantityChange: number;

  /** Adjustment timestamp */
  adjustmentDate: string;
  
  /** Stock quantity after adjustment */
  newStock: number;

  /** Stock quantity before adjustment */
  previousStock: number;
  
  /** Reason code */
  reason: string;
  
  /** Optional notes */
  notes?: string;
  
  /** User who made the adjustment */
  adjustedBy?: string | {
    _id?: string;
    name?: string;
    email?: string;
  };
}

/** Backward-compatible alias */
export type StockHistoryItem = StockAdjustmentHistory;

/**
 * Batch stock update request
 * Used for CSV batch imports
 */
export interface BatchStockUpdateRequest {
  /** Array of stock adjustments */
  adjustments: StockAdjustmentRequest[];
  
  /** Mode: 'atomic' (all or nothing) or 'partial' (continue on errors) */
  mode: 'atomic' | 'partial';
}

/**
 * Batch stock update response
 */
export interface BatchStockUpdateResponse {
  /** Number of successful adjustments */
  successCount: number;
  
  /** Number of failed adjustments */
  failureCount: number;
  
  /** Array of successful adjustment IDs */
  successful: string[];
  
  /** Array of errors with details */
  errors: Array<{
    productId: string;
    reason: string;
    error: string;
  }>;
  
  /** Overall message */
  message: string;
}

/**
 * Zod validation schemas
 */

/** Stock adjustment type schema */
export const stockAdjustmentTypeSchema = z.enum([
  'received',
  'sold',
  'returned',
  'damaged',
  'transferred',
  'adjustment',
]);

/** Stock threshold config schema */
export const stockThresholdConfigSchema = z.object({
  lowStockThreshold: z.number().min(0, 'Low stock threshold must be >= 0'),
  outOfStockThreshold: z.number().min(0, 'Out of stock threshold must be >= 0'),
  restockLevel: z.number().min(0, 'Restock level must be >= 0'),
}).refine(
  (data) => data.lowStockThreshold > data.outOfStockThreshold,
  {
    message: 'Low stock threshold must be greater than out of stock threshold',
    path: ['lowStockThreshold'],
  }
);

/** Stock adjustment request schema */
export const stockAdjustmentRequestSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  adjustmentType: stockAdjustmentTypeSchema,
  quantityChange: z.number().int('Quantity must be an integer').refine(
    (val) => val !== 0,
    'Quantity change cannot be zero'
  ),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
  adjustedBy: z.string().optional(),
});

/** Alias for stock adjustment request schema (PascalCase export for consistency) */
export const StockAdjustmentRequestSchema = stockAdjustmentRequestSchema;

/** Batch stock update request schema */
export const batchStockUpdateRequestSchema = z.object({
  adjustments: z.array(stockAdjustmentRequestSchema).min(1, 'At least one adjustment is required'),
  mode: z.enum(['atomic', 'partial']),
});

/**
 * Type guards
 */

/** Check if value is a valid stock adjustment type */
export function isStockAdjustmentType(value: unknown): value is StockAdjustmentType {
  return typeof value === 'string' && stockAdjustmentTypeSchema.safeParse(value).success;
}

/** Check if value is a valid stock threshold config */
export function isStockThresholdConfig(value: unknown): value is StockThresholdConfig {
  return stockThresholdConfigSchema.safeParse(value).success;
}

/** Check if value is a valid stock adjustment request */
export function isStockAdjustmentRequest(value: unknown): value is StockAdjustmentRequest {
  return stockAdjustmentRequestSchema.safeParse(value).success;
}

/**
 * Helper functions
 */

/** Get reason label by type and code */
export function getReasonLabel(type: StockAdjustmentType, code: string): string {
  const reasons = STOCK_ADJUSTMENT_REASONS[type];
  const reason = reasons.find((r) => r.code === code);
  return reason?.label || code;
}

/** Get all reasons for an adjustment type */
export function getReasonsForType(type: StockAdjustmentType): StockAdjustmentReason[] {
  return STOCK_ADJUSTMENT_REASONS[type];
}

/** Determine stock status based on thresholds */
export function getStockStatus(
  currentStock: number,
  thresholds: StockThresholdConfig
): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (currentStock <= thresholds.outOfStockThreshold) {
    return 'out-of-stock';
  }
  if (currentStock <= thresholds.lowStockThreshold) {
    return 'low-stock';
  }
  return 'in-stock';
}

/** Calculate new stock quantity */
export function calculateNewStock(currentStock: number, quantityChange: number): number {
  const newStock = currentStock + quantityChange;
  return Math.max(0, newStock); // Prevent negative stock
}

/** Validate stock adjustment (business rules) */
export function validateStockAdjustment(
  currentStock: number,
  adjustment: StockAdjustmentRequest
): { valid: boolean; error?: string } {
  // Validate quantity change based on adjustment type
  if (
    ['sold', 'damaged', 'transferred'].includes(adjustment.adjustmentType) &&
    adjustment.quantityChange > 0
  ) {
    return {
      valid: false,
      error: `${adjustment.adjustmentType} adjustments must have negative quantity`,
    };
  }

  if (adjustment.adjustmentType === 'received' && adjustment.quantityChange < 0) {
    return {
      valid: false,
      error: 'Received adjustments must have positive quantity',
    };
  }

  // Check if new stock would be negative (before clamping to 0)
  const rawNewStock = currentStock + adjustment.quantityChange;
  if (rawNewStock < 0) {
    return {
      valid: false,
      error: `Insufficient stock. Current: ${currentStock}, Requested change: ${adjustment.quantityChange}`,
    };
  }

  // Validate reason code exists for adjustment type
  const reasons = getReasonsForType(adjustment.adjustmentType);
  const reasonExists = reasons.some((r) => r.code === adjustment.reason);
  if (!reasonExists) {
    return {
      valid: false,
      error: `Invalid reason code '${adjustment.reason}' for type '${adjustment.adjustmentType}'`,
    };
  }

  return { valid: true };
}
