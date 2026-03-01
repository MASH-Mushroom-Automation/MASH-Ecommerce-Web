/**
 * Threshold Configuration API Route
 * Server-side endpoint for updating product stock thresholds
 * 
 * POST /api/seller/stock/thresholds
 * - Updates threshold configuration for single or multiple products
 * - Uses Sanity write token for secure mutations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { z } from 'zod';

// Server-side Sanity client with write token
const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  token: process.env.SANITY_API_WRITE_TOKEN!, // Server-side only!
  useCdn: false, // Disable CDN for mutations
});

/**
 * Zod schema for threshold validation
 */
const thresholdConfigSchema = z.object({
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold must be >= 0'),
  outOfStockThreshold: z.number().int().min(0, 'Out of stock threshold must be >= 0'),
  restockLevel: z.number().int().min(0, 'Restock level must be >= 0'),
}).refine(
  (data) => data.lowStockThreshold > data.outOfStockThreshold,
  { message: 'Low stock threshold must be greater than out of stock threshold' }
);

const singleUpdateSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  thresholds: thresholdConfigSchema,
});

const batchUpdateSchema = z.object({
  products: z.array(singleUpdateSchema).min(1, 'At least one product is required').max(100, 'Maximum 100 products per batch'),
});

const requestSchema = z.union([singleUpdateSchema, batchUpdateSchema]);

/**
 * Update threshold for a single product
 */
async function updateProductThreshold(
  productId: string,
  thresholds: z.infer<typeof thresholdConfigSchema>
): Promise<{ productId: string; success: boolean; error?: string }> {
  try {
    // Verify product exists
    const product = await sanityWriteClient.fetch<{ _id: string } | null>(
      `*[_type == "product" && _id == $productId][0]{ _id }`,
      { productId }
    );

    if (!product) {
      return { productId, success: false, error: 'Product not found' };
    }

    // Update thresholds
    await sanityWriteClient
      .patch(productId)
      .set({
        lowStockThreshold: thresholds.lowStockThreshold,
        outOfStockThreshold: thresholds.outOfStockThreshold,
        restockLevel: thresholds.restockLevel,
      })
      .commit();

    return { productId, success: true };
  } catch (error) {
    console.error(`[updateProductThreshold] Failed for ${productId}:`, error);
    return {
      productId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Rate limiting - Simple in-memory store
 * In production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * POST /api/seller/stock/thresholds
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper authentication check
    // For now, using a placeholder user ID
    const userId = request.headers.get('x-user-id') || 'anonymous';
    
    // Rate limit check
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
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
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: (parseResult.error.issues || parseResult.error.errors || []).map((e: { path: (string | number)[]; message: string }) => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Handle single product update
    if ('productId' in data) {
      const result = await updateProductThreshold(data.productId, data.thresholds);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to update threshold' },
          { status: result.error === 'Product not found' ? 404 : 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Threshold updated successfully',
        productId: data.productId,
        thresholds: data.thresholds,
      });
    }

    // Handle batch update
    const results = await Promise.all(
      data.products.map(product => 
        updateProductThreshold(product.productId, product.thresholds)
      )
    );

    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    return NextResponse.json({
      success: failures.length === 0,
      message: `Updated ${successes.length}/${results.length} products`,
      results: {
        total: results.length,
        succeeded: successes.length,
        failed: failures.length,
        details: failures.length > 0 ? failures : undefined,
      },
    });

  } catch (error) {
    console.error('[POST /api/seller/stock/thresholds] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seller/stock/thresholds
 * Get threshold configuration for a product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await sanityWriteClient.fetch<{
      _id: string;
      lowStockThreshold: number | null;
      outOfStockThreshold: number | null;
      restockLevel: number | null;
    } | null>(
      `*[_type == "product" && _id == $productId][0]{
        _id,
        lowStockThreshold,
        outOfStockThreshold,
        restockLevel
      }`,
      { productId }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      productId: product._id,
      thresholds: {
        lowStockThreshold: product.lowStockThreshold ?? 10, // Default
        outOfStockThreshold: product.outOfStockThreshold ?? 0,
        restockLevel: product.restockLevel ?? 20,
      },
    });

  } catch (error) {
    console.error('[GET /api/seller/stock/thresholds] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
