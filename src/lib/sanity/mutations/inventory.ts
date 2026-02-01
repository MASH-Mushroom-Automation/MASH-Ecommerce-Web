/**
 * Sanity Inventory Mutations
 * Functions for updating product inventory data with error handling and retry logic
 */

import { sanityClient } from '@/lib/sanity/client';
import { toast } from 'sonner';

/**
 * Stock update result
 */
export interface StockUpdateResult {
  success: boolean;
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  updatedAt: string;
  error?: string;
}

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
 * Sanity mutation error class
 */
export class MutationError extends Error {
  constructor(message: string, public readonly attemptNumber?: number) {
    super(message);
    this.name = 'MutationError';
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
  if (!/^[a-zA-Z0-9_-]+$/.test(productId)) {
    throw new ValidationError('Invalid product ID format');
  }
}

/**
 * Validate stock quantity
 * @param quantity - New stock quantity
 * @throws ValidationError if invalid
 */
function validateQuantity(quantity: number): void {
  if (typeof quantity !== 'number' || isNaN(quantity)) {
    throw new ValidationError('Stock quantity must be a number');
  }

  if (quantity < 0) {
    throw new ValidationError('Stock quantity cannot be negative');
  }

  if (!Number.isInteger(quantity)) {
    throw new ValidationError('Stock quantity must be a whole number');
  }

  if (quantity > 1000000) {
    throw new ValidationError('Stock quantity exceeds maximum allowed (1,000,000)');
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
 * Fetch current product stock for validation
 * @param productId - Product document ID
 * @returns Current stock quantity
 */
async function getCurrentStock(productId: string): Promise<number> {
  try {
    const result = await sanityClient.fetch<{ stockQuantity: number } | null>(
      `*[_type == "product" && _id == $productId][0]{ stockQuantity }`,
      { productId }
    );

    if (!result) {
      throw new MutationError(`Product not found: ${productId}`);
    }

    return result.stockQuantity ?? 0;
  } catch (error) {
    if (error instanceof MutationError) throw error;
    throw new MutationError(
      `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update product stock quantity with retry logic
 * 
 * Features:
 * - Validates productId and quantity
 * - Fetches current stock for change tracking
 * - Retries on failure (3 attempts with exponential backoff)
 * - Returns detailed result with old/new quantities
 * 
 * @param productId - Sanity product document ID
 * @param newQuantity - New stock quantity (must be >= 0)
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @returns Stock update result
 * @throws ValidationError if inputs invalid
 * @throws MutationError if all retries fail
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await updateProductStock('product-123', 50);
 *   console.log(`Stock updated: ${result.oldQuantity} → ${result.newQuantity}`);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     toast.error(error.message);
 *   } else {
 *     toast.error('Failed to update stock');
 *   }
 * }
 * ```
 */
export async function updateProductStock(
  productId: string,
  newQuantity: number,
  maxRetries: number = 3
): Promise<StockUpdateResult> {
  // Validation
  validateProductId(productId);
  validateQuantity(newQuantity);

  // Fetch current stock for change tracking
  const oldQuantity = await getCurrentStock(productId);

  // Retry loop
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Execute Sanity PATCH mutation
      const result = await sanityClient
        .patch(productId)
        .set({
          stockQuantity: newQuantity,
          updatedAt: new Date().toISOString(),
        })
        .commit();

      // Success
      return {
        success: true,
        productId,
        oldQuantity,
        newQuantity,
        updatedAt: result._updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(
        `[updateProductStock] Attempt ${attempt}/${maxRetries} failed:`,
        errorMessage
      );

      if (isLastAttempt) {
        // Final attempt failed
        throw new MutationError(
          `Failed to update stock after ${maxRetries} attempts: ${errorMessage}`,
          attempt
        );
      }

      // Wait before retry with exponential backoff
      const delay = calculateBackoffDelay(attempt);
      console.log(`[updateProductStock] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // Should never reach here (loop always throws or returns)
  throw new MutationError('Unexpected error in retry loop');
}

/**
 * Batch update multiple products (helper for future bulk operations)
 * 
 * @param updates - Array of product ID and quantity pairs
 * @returns Array of update results
 */
export async function batchUpdateProductStock(
  updates: Array<{ productId: string; newQuantity: number }>
): Promise<StockUpdateResult[]> {
  const results: StockUpdateResult[] = [];

  // Execute updates sequentially to avoid overwhelming Sanity API
  for (const { productId, newQuantity } of updates) {
    try {
      const result = await updateProductStock(productId, newQuantity);
      results.push(result);
    } catch (error) {
      // Continue batch even if one fails
      results.push({
        success: false,
        productId,
        oldQuantity: 0,
        newQuantity,
        updatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Adjust stock quantity by delta (add/subtract)
 * 
 * @param productId - Product document ID
 * @param delta - Amount to add (positive) or subtract (negative)
 * @returns Stock update result
 * 
 * @example
 * ```typescript
 * // Add 10 units
 * await adjustProductStock('product-123', 10);
 * 
 * // Subtract 5 units
 * await adjustProductStock('product-123', -5);
 * ```
 */
export async function adjustProductStock(
  productId: string,
  delta: number
): Promise<StockUpdateResult> {
  validateProductId(productId);

  if (typeof delta !== 'number' || isNaN(delta)) {
    throw new ValidationError('Delta must be a number');
  }

  // Fetch current stock
  const currentStock = await getCurrentStock(productId);
  const newQuantity = currentStock + delta;

  // Validate new quantity
  validateQuantity(newQuantity);

  // Perform update
  return updateProductStock(productId, newQuantity);
}

/**
 * Set product as out of stock (quantity = 0)
 * 
 * @param productId - Product document ID
 * @returns Stock update result
 */
export async function setOutOfStock(productId: string): Promise<StockUpdateResult> {
  return updateProductStock(productId, 0);
}

/**
 * Check if product exists before update (helper)
 * 
 * @param productId - Product document ID
 * @returns True if product exists
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
    console.error('[productExists] Check failed:', error);
    return false;
  }
}
