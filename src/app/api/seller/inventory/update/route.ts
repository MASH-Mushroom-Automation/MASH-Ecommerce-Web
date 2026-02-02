/**
 * Server-Side Inventory Update API Route
 * 
 * Handles stock updates using Sanity Write Client with server-side token.
 * This route is required because Sanity write tokens are server-side only
 * (not exposed to client via NEXT_PUBLIC_ prefix for security).
 * 
 * POST /api/seller/inventory/update
 * Body: { productId: string, newQuantity: number }
 * 
 * Returns: { success: boolean, data?: StockUpdateResult, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// Server-side Sanity configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gerattrr';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-26';
const writeToken = process.env.SANITY_API_WRITE_TOKEN;
const readToken = process.env.SANITY_API_READ_TOKEN;

// Create server-side write client
const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Never use CDN for mutations
  token: writeToken || readToken,
  perspective: 'published',
});

// Create read client for fetching current stock
const sanityReadClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token: readToken,
  perspective: 'published',
});

interface StockUpdateRequest {
  productId: string;
  newQuantity: number;
}

interface StockUpdateResult {
  success: boolean;
  productId: string;
  oldQuantity: number;
  newQuantity: number;
  updatedAt: string;
}

/**
 * Validate product ID format
 */
function validateProductId(productId: string): boolean {
  if (!productId || typeof productId !== 'string') return false;
  if (productId.trim().length === 0) return false;
  // Sanity document IDs are typically alphanumeric with dashes/underscores
  return /^[a-zA-Z0-9_-]+$/.test(productId);
}

/**
 * Validate stock quantity
 */
function validateQuantity(quantity: number): boolean {
  if (typeof quantity !== 'number' || isNaN(quantity)) return false;
  if (quantity < 0) return false;
  if (!Number.isInteger(quantity)) return false;
  if (quantity > 1000000) return false;
  return true;
}

/**
 * Get current stock for a product
 */
async function getCurrentStock(productId: string): Promise<number | null> {
  try {
    const result = await sanityReadClient.fetch<{ stockQuantity: number } | null>(
      `*[_type == "product" && _id == $productId][0]{ stockQuantity }`,
      { productId }
    );
    return result?.stockQuantity ?? null;
  } catch (error) {
    console.error('[API] Failed to fetch current stock:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if write token is configured
    if (!writeToken) {
      console.error('[API] SANITY_API_WRITE_TOKEN not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error: Write token not configured' 
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body: StockUpdateRequest = await request.json();
    const { productId, newQuantity } = body;

    // Validate inputs
    if (!validateProductId(productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    if (!validateQuantity(newQuantity)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity. Must be a non-negative integer less than 1,000,000' },
        { status: 400 }
      );
    }

    // Get current stock for change tracking
    const currentStock = await getCurrentStock(productId);
    if (currentStock === null) {
      return NextResponse.json(
        { success: false, error: `Product not found: ${productId}` },
        { status: 404 }
      );
    }

    // Execute Sanity PATCH mutation
    const result = await sanityWriteClient
      .patch(productId)
      .set({
        stockQuantity: newQuantity,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    const updateResult: StockUpdateResult = {
      success: true,
      productId,
      oldQuantity: currentStock,
      newQuantity,
      updatedAt: result._updatedAt || new Date().toISOString(),
    };

    console.log(`[API] Stock updated: ${productId} (${currentStock} → ${newQuantity})`);

    return NextResponse.json({ success: true, data: updateResult });
  } catch (error) {
    console.error('[API] Stock update error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { success: false, error: `Failed to update stock: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/seller/inventory/update',
    writeConfigured: !!writeToken,
    readConfigured: !!readToken,
  });
}
