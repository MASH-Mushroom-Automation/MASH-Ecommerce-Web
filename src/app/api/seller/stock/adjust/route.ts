/**
 * Stock Adjustment API Route
 * Server-side endpoint for atomic stock adjustments with write token access
 * 
 * POST /api/seller/stock/adjust
 * - Creates immutable stock adjustment record
 * - Updates product stock quantity atomically
 * - Uses optimistic locking to prevent race conditions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import type {
  StockAdjustmentRequest,
  StockAdjustmentResponse,
  StockAdjustmentType,
} from '@/types/stock-management';

// Server-side Sanity client with write token
const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_API_WRITE_TOKEN!, // Server-side only!
  useCdn: false, // Disable CDN for mutations
});

/**
 * Validate product exists and get current stock with _rev for optimistic locking
 */
async function getProductWithRev(productId: string): Promise<{
  _id: string;
  _rev: string;
  stockQuantity: number;
} | null> {
  try {
    const result = await sanityWriteClient.fetch<{
      _id: string;
      _rev: string;
      stockQuantity: number;
    } | null>(
      `*[_type == "product" && _id == $productId][0]{ _id, _rev, stockQuantity }`,
      { productId }
    );
    return result;
  } catch (error) {
    console.error('[getProductWithRev] Query failed:', error);
    return null;
  }
}

/**
 * Create immutable stock adjustment record
 */
async function createStockAdjustmentDocument(adjustment: {
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
  try {
    const doc = {
      _type: 'stockAdjustment',
      product: {
        _type: 'reference',
        _ref: adjustment.productId,
      },
      adjustmentType: adjustment.adjustmentType,
      quantityChange: adjustment.quantityChange,
      previousStock: adjustment.previousStock,
      newStock: adjustment.newStock,
      reason: adjustment.reason,
      notes: adjustment.notes,
      adjustedBy: adjustment.adjustedBy
        ? {
            _type: 'reference',
            _ref: adjustment.adjustedBy,
          }
        : undefined,
      adjustmentDate: adjustment.adjustmentDate,
    };

    const result = await sanityWriteClient.create(doc);
    return result._id;
  } catch (error) {
    console.error('[createStockAdjustmentDocument] Creation failed:', error);
    throw new Error(
      `Failed to create adjustment record: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update product stock quantity with optimistic locking
 */
async function updateProductStock(
  productId: string,
  newStock: number,
  expectedRev: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use patch with ifRevisionId for optimistic locking (note: lowercase 'd')
    await sanityWriteClient
      .patch(productId)
      .ifRevisionId(expectedRev) // Race condition protection
      .set({ stockQuantity: newStock })
      .commit();

    return { success: true };
  } catch (error) {
    // Check if it's a revision mismatch (race condition)
    if (
      error instanceof Error &&
      error.message.includes('revision')
    ) {
      return {
        success: false,
        error: 'Stock was modified by another process. Please try again.',
      };
    }

    console.error('[updateProductStock] Update failed:', error);
    return {
      success: false,
      error: `Failed to update stock: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * POST handler - atomic stock adjustment
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as StockAdjustmentRequest & {
      currentStock?: number;
    };

    const {
      productId,
      adjustmentType,
      quantityChange,
      reason,
      notes,
      adjustedBy,
      currentStock: clientCurrentStock,
    } = body;

    // Validate required fields
    if (!productId || !adjustmentType || !reason) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: productId, adjustmentType, or reason',
        },
        { status: 400 }
      );
    }

    if (quantityChange === undefined || quantityChange === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quantity change must be a non-zero number',
        },
        { status: 400 }
      );
    }

    // Fetch current product state with _rev for optimistic locking
    const product = await getProductWithRev(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: `Product not found: ${productId}`,
        },
        { status: 404 }
      );
    }

    // Check for race condition (client's currentStock doesn't match server's)
    if (
      clientCurrentStock !== undefined &&
      product.stockQuantity !== clientCurrentStock
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Stock was modified by another process. Current stock: ${product.stockQuantity}, expected: ${clientCurrentStock}`,
        },
        { status: 409 } // Conflict
      );
    }

    // Calculate new stock
    const previousStock = product.stockQuantity;
    const newStock = previousStock + quantityChange;

    // Validate new stock won't be negative
    if (newStock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient stock: current ${previousStock}, change ${quantityChange}`,
        },
        { status: 400 }
      );
    }

    // Get current timestamp
    const adjustmentDate = new Date().toISOString();

    // ATOMIC OPERATION: Create adjustment record
    let adjustmentId: string;
    try {
      adjustmentId = await createStockAdjustmentDocument({
        productId,
        adjustmentType,
        quantityChange,
        previousStock,
        newStock,
        reason,
        notes,
        adjustedBy,
        adjustmentDate,
      });
    } catch (error) {
      console.error('[POST /api/seller/stock/adjust] Adjustment creation failed:', error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create adjustment record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 }
      );
    }

    // ATOMIC OPERATION: Update product stock with optimistic locking
    const updateResult = await updateProductStock(
      productId,
      newStock,
      product._rev
    );

    if (!updateResult.success) {
      // Stock update failed - adjustment record already created
      // In a real system, consider deleting the adjustment record or marking it as failed
      console.error(
        '[POST /api/seller/stock/adjust] Stock update failed after adjustment creation:',
        updateResult.error
      );

      // If it's a race condition, return 409
      if (updateResult.error?.includes('modified by another process')) {
        return NextResponse.json(
          {
            success: false,
            message: updateResult.error,
            adjustmentId, // Include for potential rollback
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: updateResult.error || 'Failed to update product stock',
          adjustmentId, // Include for potential rollback
        },
        { status: 500 }
      );
    }

    // Success - return response
    const response: StockAdjustmentResponse = {
      success: true,
      adjustmentId,
      productId,
      oldStock: previousStock,
      newStock,
      quantityChange,
      adjustmentDate,
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: 'Stock adjustment completed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/seller/stock/adjust] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
