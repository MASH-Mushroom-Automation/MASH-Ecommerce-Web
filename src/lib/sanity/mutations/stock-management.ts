/**
 * Sanity Stock Management Mutations
 * Functions for creating stock adjustments with optimistic locking and atomic operations
 * 
 * NOTE: All write operations use server-side API route (/api/seller/stock/adjust)
 * which has access to SANITY_API_WRITE_TOKEN for secure mutations.
 */

import { sanityClient } from '@/lib/sanity/client';
import { toast } from 'sonner';
import type {
  StockAdjustmentType,
  StockAdjustmentRequest,
  StockAdjustmentResponse,
} from '@/types/stock-management';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Stock adjustment mutation error class
 */
export class StockAdjustmentError extends Error {
  constructor(
    message: string,
    public readonly code?:
      | 'PRODUCT_NOT_FOUND'
      | 'INSUFFICIENT_STOCK'
      | 'RACE_CONDITION'
      | 'VALIDATION_ERROR'
      | 'MUTATION_ERROR'
      | 'NETWORK_ERROR'
  ) {
    super(message);
    this.name = 'StockAdjustmentError';
  }
}

/**
 * Validate product ID
 * @param productId - Product document ID
 * @throws ValidationError if invalid
 */
function validateProductId(productId: string): void {
  if (!productId || typeof productId !== 'string') {
    throw new ValidationError('Product ID is required');
  }

  if (productId.trim().length === 0) {
    throw new ValidationError('Product ID cannot be empty');
  }

  // Sanity document IDs are typically alphanumeric with dashes/underscores
  if (!/^[a-zA-Z0-9_.-]+$/.test(productId)) {
    throw new ValidationError('Invalid product ID format');
  }
}

/**
 * Validate adjustment type
 * @param type - Adjustment type
 * @throws ValidationError if invalid
 */
function validateAdjustmentType(type: StockAdjustmentType): void {
  const validTypes: StockAdjustmentType[] = [
    'received',
    'sold',
    'returned',
    'damaged',
    'transferred',
    'adjustment',
  ];

  if (!validTypes.includes(type)) {
    throw new ValidationError(
      `Invalid adjustment type. Must be one of: ${validTypes.join(', ')}`
    );
  }
}

/**
 * Validate quantity change based on adjustment type
 * @param quantityChange - Quantity change value
 * @param adjustmentType - Type of adjustment
 * @throws ValidationError if invalid
 */
function validateQuantityChange(
  quantityChange: number,
  adjustmentType: StockAdjustmentType
): void {
  if (typeof quantityChange !== 'number' || isNaN(quantityChange)) {
    throw new ValidationError('Quantity change must be a number');
  }

  if (!Number.isInteger(quantityChange)) {
    throw new ValidationError('Quantity change must be a whole number');
  }

  if (quantityChange === 0) {
    throw new ValidationError('Quantity change cannot be zero');
  }

  // Validate sign based on adjustment type
  const stockInTypes: StockAdjustmentType[] = ['received', 'returned'];
  const stockOutTypes: StockAdjustmentType[] = ['sold', 'damaged', 'transferred'];

  if (stockInTypes.includes(adjustmentType) && quantityChange <= 0) {
    throw new ValidationError(
      `Quantity must be positive for ${adjustmentType} adjustments`
    );
  }

  if (stockOutTypes.includes(adjustmentType) && quantityChange >= 0) {
    throw new ValidationError(
      `Quantity must be negative for ${adjustmentType} adjustments`
    );
  }

  // Manual adjustment can be either positive or negative
  if (Math.abs(quantityChange) > 1000000) {
    throw new ValidationError('Quantity change exceeds maximum allowed (1,000,000)');
  }
}

/**
 * Validate stock adjustment request
 * @param request - Stock adjustment request
 * @throws ValidationError if invalid
 */
export function validateStockAdjustmentRequest(
  request: StockAdjustmentRequest
): void {
  // Validate required fields
  validateProductId(request.productId);
  validateAdjustmentType(request.adjustmentType);
  validateQuantityChange(request.quantityChange, request.adjustmentType);

  if (!request.reason || request.reason.trim().length === 0) {
    throw new ValidationError('Adjustment reason is required');
  }

  if (request.reason.length > 100) {
    throw new ValidationError('Reason must be 100 characters or less');
  }

  // Validate optional notes
  if (request.notes && request.notes.length > 500) {
    throw new ValidationError('Notes must be 500 characters or less');
  }

  // Validate adjusted by
  if (request.adjustedBy && request.adjustedBy.trim().length === 0) {
    throw new ValidationError('Adjusted by cannot be empty if provided');
  }
}

/**
 * Check if product exists in Sanity
 * @param productId - Product document ID
 * @returns True if product exists
 * @throws ValidationError if productId is invalid
 */
export async function productExists(productId: string): Promise<boolean> {
  validateProductId(productId);

  try {
    const result = await sanityClient.fetch<{ _id: string } | null>(
      `*[_type == "product" && _id == $productId][0]{ _id }`,
      { productId }
    );

    return result !== null;
  } catch (error) {
    console.error('[productExists] Query failed:', error);
    throw new StockAdjustmentError(
      `Failed to check product existence: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Get current product stock quantity
 * @param productId - Product document ID
 * @returns Current stock quantity
 * @throws StockAdjustmentError if product not found or query fails
 */
export async function getCurrentStock(productId: string): Promise<number> {
  validateProductId(productId);

  try {
    const result = await sanityClient.fetch<{ stockQuantity: number } | null>(
      `*[_type == "product" && _id == $productId][0]{ stockQuantity }`,
      { productId }
    );

    if (!result) {
      throw new StockAdjustmentError(
        `Product not found: ${productId}`,
        'PRODUCT_NOT_FOUND'
      );
    }

    return result.stockQuantity ?? 0;
  } catch (error) {
    if (error instanceof StockAdjustmentError) throw error;

    throw new StockAdjustmentError(
      `Failed to fetch current stock: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Exponential backoff delay calculation
 * @param attemptNumber - Current attempt number (1-based)
 * @returns Delay in milliseconds
 */
function calculateBackoffDelay(attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s
  const baseDelay = 1000;
  return baseDelay * Math.pow(2, attemptNumber - 1);
}

/**
 * Sleep utility for retry delays
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Adjust stock with atomic operation (create adjustment + update stock)
 * 
 * This is the main function for stock adjustments. It:
 * 1. Validates the adjustment request
 * 2. Fetches current stock for optimistic locking
 * 3. Calls server-side API for atomic mutation (adjustment + stock update)
 * 4. Returns the result with updated stock quantity
 * 
 * Features:
 * - Client-side validation before API call
 * - Optimistic locking to prevent race conditions
 * - Automatic retries on failure (3 attempts with exponential backoff)
 * - Comprehensive error handling with specific error codes
 * - Toast notifications for user feedback
 * 
 * @param request - Stock adjustment request
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Stock adjustment response with new stock level
 * @throws ValidationError if request is invalid
 * @throws StockAdjustmentError if all retries fail
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await adjustStock({
 *     productId: 'product-123',
 *     adjustmentType: 'received',
 *     quantityChange: 50,
 *     reason: 'PURCHASE_ORDER',
 *     notes: 'Delivery from Supplier A',
 *     adjustedBy: 'user-456'
 *   });
 *   toast.success(`Stock updated: ${result.newStock} units`);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     toast.error(error.message);
 *   } else if (error instanceof StockAdjustmentError) {
 *     toast.error(`Stock adjustment failed: ${error.message}`);
 *   }
 * }
 * ```
 */
export async function adjustStock(
  request: StockAdjustmentRequest,
  maxRetries: number = 3
): Promise<StockAdjustmentResponse> {
  // Client-side validation first
  validateStockAdjustmentRequest(request);

  // Fetch current stock for optimistic locking
  let currentStock: number;
  try {
    currentStock = await getCurrentStock(request.productId);
  } catch (error) {
    if (error instanceof StockAdjustmentError) {
      toast.error(error.message);
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`Failed to fetch current stock: ${errorMessage}`);
    throw new StockAdjustmentError(errorMessage, 'NETWORK_ERROR');
  }

  // Validate that stock won't go negative
  const newStock = currentStock + request.quantityChange;
  if (newStock < 0) {
    const error = new StockAdjustmentError(
      `Insufficient stock: current ${currentStock}, change ${request.quantityChange}`,
      'INSUFFICIENT_STOCK'
    );
    toast.error(error.message);
    throw error;
  }

  // Retry loop - call server-side API route
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Call server-side API route (has access to write token)
      const response = await fetch('/api/seller/stock/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          currentStock, // Include for optimistic locking on server
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Handle specific error codes from server
        if (response.status === 404) {
          throw new StockAdjustmentError(
            result.message || 'Product not found',
            'PRODUCT_NOT_FOUND'
          );
        }

        if (response.status === 409) {
          throw new StockAdjustmentError(
            result.message || 'Stock was modified by another process',
            'RACE_CONDITION'
          );
        }

        if (response.status === 400) {
          throw new StockAdjustmentError(
            result.message || 'Invalid request',
            'VALIDATION_ERROR'
          );
        }

        throw new Error(result.message || `HTTP ${response.status}`);
      }

      // Success - return the data from API
      const adjustmentResponse = result.data as StockAdjustmentResponse;

      // Success toast notification
      const actionVerb =
        request.quantityChange > 0 ? 'added' : 'removed';
      const absChange = Math.abs(request.quantityChange);
      toast.success(
        `Stock ${actionVerb}: ${absChange} units. New total: ${adjustmentResponse.newStock}`
      );

      return adjustmentResponse;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error(
        `[adjustStock] Attempt ${attempt}/${maxRetries} failed:`,
        errorMessage
      );

      // If it's a specific error we already caught, rethrow immediately
      if (error instanceof StockAdjustmentError) {
        if (isLastAttempt) {
          toast.error(error.message);
        }
        throw error;
      }

      // For network/unknown errors, retry with backoff
      if (!isLastAttempt) {
        const delay = calculateBackoffDelay(attempt);
        console.log(`[adjustStock] Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Last attempt failed - throw error
      const finalError = new StockAdjustmentError(
        `Stock adjustment failed after ${maxRetries} attempts: ${errorMessage}`,
        'MUTATION_ERROR'
      );
      toast.error(finalError.message);
      throw finalError;
    }
  }

  // Should never reach here, but TypeScript needs this
  throw new StockAdjustmentError(
    'Stock adjustment failed unexpectedly',
    'MUTATION_ERROR'
  );
}

/**
 * Create stock adjustment record only (without updating product stock)
 * 
 * This is a lower-level function used internally by the API route.
 * Most applications should use adjustStock() instead.
 * 
 * @param adjustment - Stock adjustment data
 * @returns Created adjustment document ID
 * @throws StockAdjustmentError if creation fails
 */
export async function createStockAdjustmentRecord(adjustment: {
  productId: string;
  adjustmentType: StockAdjustmentType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  notes?: string;
  adjustedBy?: string;
  adjustmentDate: string;
}): Promise<string> {
  // This function is for internal use by the API route
  // It should NOT be called directly from the client
  throw new StockAdjustmentError(
    'createStockAdjustmentRecord must be called from server-side API route only',
    'VALIDATION_ERROR'
  );
}

/**
 * Update product stock quantity only (without creating adjustment record)
 * 
 * This is a lower-level function used internally by the API route.
 * Most applications should use adjustStock() instead.
 * 
 * @param productId - Product document ID
 * @param newStock - New stock quantity
 * @returns True if update successful
 * @throws StockAdjustmentError if update fails
 */
export async function updateProductStockQuantity(
  productId: string,
  newStock: number
): Promise<boolean> {
  // This function is for internal use by the API route
  // It should NOT be called directly from the client
  throw new StockAdjustmentError(
    'updateProductStockQuantity must be called from server-side API route only',
    'VALIDATION_ERROR'
  );
}
