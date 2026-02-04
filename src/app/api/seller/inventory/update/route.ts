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
  perspective: 'raw', // Access both published and draft documents
});

// Create read client for fetching current stock
// Uses useCdn: false to get fresh data and raw perspective for draft access
const sanityReadClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Don't use CDN - need fresh data for stock updates
  token: readToken,
  perspective: 'raw', // Access both published and draft documents
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
 * Handles both published and draft documents in Sanity
 */
async function getCurrentStock(productId: string): Promise<{ stockQuantity: number; resolvedId: string } | null> {
  try {
    // Try to find the product - handle both published and draft IDs
    // Sanity stores drafts with "drafts." prefix
    const draftId = productId.startsWith('drafts.') ? productId : `drafts.${productId}`;
    const publishedId = productId.startsWith('drafts.') ? productId.replace('drafts.', '') : productId;
    
    console.log(`[API] Looking for product: ${productId}`);
    console.log(`[API] Trying IDs: published="${publishedId}", draft="${draftId}"`);
    
    const result = await sanityReadClient.fetch<{ _id: string; stockQuantity: number } | null>(
      `*[_type == "product" && (_id == $productId || _id == $draftId || _id == $publishedId)][0]{ _id, stockQuantity }`,
      { productId, draftId, publishedId }
    );
    
    if (result) {
      console.log(`[API] Found product: ${result._id} with stock: ${result.stockQuantity}`);
      return { 
        stockQuantity: result.stockQuantity ?? 0, 
        resolvedId: result._id 
      };
    }
    
    console.log(`[API] Product not found with any ID variant`);
    return null;
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

    console.log(`[API] Stock update request: productId=${productId}, newQuantity=${newQuantity}`);

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

    // Get current stock for change tracking (handles both published and draft IDs)
    const stockInfo = await getCurrentStock(productId);
    if (stockInfo === null) {
      return NextResponse.json(
        { success: false, error: `Product not found: ${productId}` },
        { status: 404 }
      );
    }

    const { stockQuantity: currentStock, resolvedId } = stockInfo;
    console.log(`[API] Updating product ${resolvedId} from ${currentStock} to ${newQuantity}`);

    // Execute Sanity PATCH mutation using the resolved ID
    const result = await sanityWriteClient
      .patch(resolvedId)
      .set({
        stockQuantity: newQuantity,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    const updateResult: StockUpdateResult = {
      success: true,
      productId: resolvedId, // Return the resolved ID
      oldQuantity: currentStock,
      newQuantity,
      updatedAt: result._updatedAt || new Date().toISOString(),
    };

    console.log(`[API] Stock updated successfully: ${resolvedId} (${currentStock} → ${newQuantity})`);

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
