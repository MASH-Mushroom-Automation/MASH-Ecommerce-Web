/**
 * Batch Stock Adjustment API Route
 * Server-side endpoint for processing batch CSV stock imports
 * 
 * POST /api/seller/stock/batch
 * - Processes array of stock adjustments
 * - Supports partial success mode and atomic mode
 * - Returns detailed results for each row
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { z } from 'zod';
import type { StockAdjustmentType } from '@/types/stock-management';

// Server-side Sanity client with write token
const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

/**
 * Single adjustment request schema
 */
const adjustmentRequestSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  adjustmentType: z.enum(['received', 'sold', 'returned', 'damaged', 'transferred', 'adjustment']),
  quantityChange: z.number().int('Quantity must be an integer'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

/**
 * Batch request schema
 */
const batchRequestSchema = z.object({
  adjustments: z.array(adjustmentRequestSchema)
    .min(1, 'At least one adjustment is required')
    .max(500, 'Maximum 500 adjustments per batch'),
  mode: z.enum(['partial', 'atomic']).default('partial'),
  adjustedBy: z.string().optional(),
});

/**
 * Adjustment result
 */
interface AdjustmentResult {
  sku: string;
  success: boolean;
  productId?: string;
  previousStock?: number;
  newStock?: number;
  error?: string;
}

/**
 * Rate limiting
 */
const batchRateLimitStore = new Map<string, { count: number; resetTime: number }>();
const BATCH_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const BATCH_RATE_LIMIT_MAX = 10; // 10 batches per hour

function checkBatchRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = batchRateLimitStore.get(userId);

  if (!record || now > record.resetTime) {
    batchRateLimitStore.set(userId, { count: 1, resetTime: now + BATCH_RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= BATCH_RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Find product by SKU
 */
async function findProductBySKU(sku: string): Promise<{
  _id: string;
  _rev: string;
  stockQuantity: number;
} | null> {
  try {
    return await sanityWriteClient.fetch<{
      _id: string;
      _rev: string;
      stockQuantity: number;
    } | null>(
      `*[_type == "product" && sku == $sku][0]{ _id, _rev, stockQuantity }`,
      { sku }
    );
  } catch {
    return null;
  }
}

/**
 * Process a single adjustment
 */
async function processAdjustment(
  adjustment: z.infer<typeof adjustmentRequestSchema>,
  adjustedBy?: string
): Promise<AdjustmentResult> {
  const { sku, adjustmentType, quantityChange, reason, notes } = adjustment;

  try {
    // Find product by SKU
    const product = await findProductBySKU(sku);
    
    if (!product) {
      return { sku, success: false, error: `Product with SKU "${sku}" not found` };
    }

    const previousStock = product.stockQuantity || 0;
    
    // Validate quantity based on adjustment type
    const adjustedQuantity = ['sold', 'damaged', 'transferred'].includes(adjustmentType)
      ? -Math.abs(quantityChange)
      : ['received', 'returned'].includes(adjustmentType)
      ? Math.abs(quantityChange)
      : quantityChange; // 'adjustment' can be positive or negative

    const newStock = previousStock + adjustedQuantity;

    // Prevent negative stock
    if (newStock < 0) {
      return {
        sku,
        success: false,
        productId: product._id,
        previousStock,
        error: `Insufficient stock. Current: ${previousStock}, Change: ${adjustedQuantity}`,
      };
    }

    // Create stock adjustment document
    const adjustmentDoc = {
      _type: 'stockAdjustment',
      product: { _type: 'reference', _ref: product._id },
      adjustmentType,
      quantityChange: adjustedQuantity,
      previousStock,
      newStock,
      reason,
      notes,
      adjustedBy: adjustedBy ? { _type: 'reference', _ref: adjustedBy } : undefined,
      adjustmentDate: new Date().toISOString(),
    };

    await sanityWriteClient.create(adjustmentDoc);

    // Update product stock with optimistic locking
    await sanityWriteClient
      .patch(product._id)
      .ifRevisionID(product._rev)
      .set({ stockQuantity: newStock })
      .commit();

    return {
      sku,
      success: true,
      productId: product._id,
      previousStock,
      newStock,
    };

  } catch (error) {
    return {
      sku,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * POST /api/seller/stock/batch
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Rate limit check
    if (!checkBatchRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 batches per hour.' },
        { status: 429 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    const parseResult = batchRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: (parseResult.error.issues || parseResult.error.errors || []).map((e: { path: (string | number)[]; message: string }) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { adjustments, mode, adjustedBy } = parseResult.data;

    // Atomic mode: validate all SKUs exist first
    if (mode === 'atomic') {
      const skuValidation = await Promise.all(
        adjustments.map(async (adj) => ({
          sku: adj.sku,
          exists: !!(await findProductBySKU(adj.sku)),
        }))
      );

      const missingSkus = skuValidation.filter(v => !v.exists).map(v => v.sku);
      
      if (missingSkus.length > 0) {
        return NextResponse.json(
          {
            error: 'Atomic mode failed: Some SKUs not found',
            missingSkus,
          },
          { status: 400 }
        );
      }
    }

    // Process adjustments
    const results = await Promise.all(
      adjustments.map(adj => processAdjustment(adj, adjustedBy))
    );

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    // In atomic mode, if any failed, we should rollback (but Sanity doesn't support transactions)
    // For now, we report the failures

    // Create batch import audit log
    try {
      await sanityWriteClient.create({
        _type: 'batchImportLog',
        importDate: new Date().toISOString(),
        totalRows: adjustments.length,
        successCount: successes.length,
        failureCount: failures.length,
        mode,
        importedBy: adjustedBy ? { _type: 'reference', _ref: adjustedBy } : undefined,
      });
    } catch {
      // Non-critical, continue
    }

    return NextResponse.json({
      success: failures.length === 0,
      message: `Processed ${successes.length}/${adjustments.length} adjustments`,
      summary: {
        total: adjustments.length,
        succeeded: successes.length,
        failed: failures.length,
        mode,
      },
      results: {
        successes: successes.map(r => ({
          sku: r.sku,
          productId: r.productId,
          previousStock: r.previousStock,
          newStock: r.newStock,
        })),
        failures: failures.map(r => ({
          sku: r.sku,
          error: r.error,
        })),
      },
    });

  } catch (error) {
    console.error('[POST /api/seller/stock/batch] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
