/**
 * Unit Tests for Sanity Inventory Mutations
 * 
 * NOTE: updateProductStock now uses fetch() to call /api/seller/inventory/update
 * which has server-side access to SANITY_API_WRITE_TOKEN for secure mutations.
 */

import {
  updateProductStock,
  batchUpdateProductStock,
  adjustProductStock,
  setOutOfStock,
  productExists,
  ValidationError,
  MutationError,
} from './inventory';
import { sanityClient } from '@/lib/sanity/client';

// Mock fetch globally (used by updateProductStock API calls)
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Sanity client (used for read operations like getCurrentStock, productExists)
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
  },
}));

describe('updateProductStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 10,
          newQuantity: 50,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });
  });

  it('should update stock successfully via API route', async () => {
    const result = await updateProductStock('product-123', 50);

    expect(result).toEqual({
      success: true,
      productId: 'product-123',
      oldQuantity: 10,
      newQuantity: 50,
      updatedAt: '2026-02-02T10:00:00Z',
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/seller/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'product-123', newQuantity: 50 }),
    });
  });

  it('should call API endpoint with correct payload', async () => {
    await updateProductStock('product-123', 50);

    expect(mockFetch).toHaveBeenCalledWith('/api/seller/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'product-123', newQuantity: 50 }),
    });
  });

  it('should throw ValidationError for empty productId', async () => {
    await expect(updateProductStock('', 50)).rejects.toThrow(ValidationError);
    await expect(updateProductStock('', 50)).rejects.toThrow('Product ID is required');
  });

  it('should throw ValidationError for invalid productId format', async () => {
    await expect(updateProductStock('invalid id!', 50)).rejects.toThrow(ValidationError);
    await expect(updateProductStock('invalid id!', 50)).rejects.toThrow(
      'Invalid product ID format'
    );
  });

  it('should throw ValidationError for negative quantity', async () => {
    await expect(updateProductStock('product-123', -1)).rejects.toThrow(ValidationError);
    await expect(updateProductStock('product-123', -1)).rejects.toThrow(
      'Stock quantity cannot be negative'
    );
  });

  it('should throw ValidationError for non-integer quantity', async () => {
    await expect(updateProductStock('product-123', 10.5)).rejects.toThrow(ValidationError);
    await expect(updateProductStock('product-123', 10.5)).rejects.toThrow(
      'Stock quantity must be a whole number'
    );
  });

  it('should throw ValidationError for quantity exceeding max', async () => {
    await expect(updateProductStock('product-123', 2000000)).rejects.toThrow(ValidationError);
    await expect(updateProductStock('product-123', 2000000)).rejects.toThrow(
      'Stock quantity exceeds maximum allowed'
    );
  });

  it('should throw ValidationError for non-number quantity', async () => {
    await expect(updateProductStock('product-123', NaN)).rejects.toThrow(ValidationError);
    await expect(updateProductStock('product-123', NaN)).rejects.toThrow(
      'Stock quantity must be a number'
    );
  });

  it('should retry on failure with exponential backoff', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Network error' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Network error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            productId: 'product-123',
            oldQuantity: 10,
            newQuantity: 50,
            updatedAt: '2026-02-02T10:00:00Z',
            success: true,
          },
        }),
      });

    const result = await updateProductStock('product-123', 50);

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3); // 2 failures + 1 success
  });

  it('should throw MutationError after max retries', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'Network error' }),
    });

    await expect(updateProductStock('product-123', 50, 3)).rejects.toThrow(MutationError);
    
    // Reset and test again for the message check
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'Network error' }),
    });
    
    await expect(updateProductStock('product-123', 50, 3)).rejects.toThrow(
      'Failed to update stock after 3 attempts'
    );

    expect(mockFetch).toHaveBeenCalledTimes(3);
  }, 10000); // 10 second timeout for retry logic

  it('should throw MutationError if API returns product not found', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ success: false, error: 'Product not found' }),
    });

    await expect(updateProductStock('product-999', 50)).rejects.toThrow(MutationError);
  });

  it('should allow quantity of 0', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 10,
          newQuantity: 0,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });

    const result = await updateProductStock('product-123', 0);

    expect(result.success).toBe(true);
    expect(result.newQuantity).toBe(0);
  });

  it('should allow large valid quantities', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 10,
          newQuantity: 999999,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });

    const result = await updateProductStock('product-123', 999999);

    expect(result.success).toBe(true);
    expect(result.newQuantity).toBe(999999);
  });
});

describe('batchUpdateProductStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response for each call
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-1',
          oldQuantity: 10,
          newQuantity: 50,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });
  });

  it('should update multiple products successfully', async () => {
    const updates = [
      { productId: 'product-1', newQuantity: 50 },
      { productId: 'product-2', newQuantity: 30 },
      { productId: 'product-3', newQuantity: 20 },
    ];

    const results = await batchUpdateProductStock(updates);

    expect(results).toHaveLength(3);
    expect(results.every((r) => r.success)).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should continue batch if one update fails', async () => {
    const updates = [
      { productId: 'product-1', newQuantity: 50 },
      { productId: '', newQuantity: 30 }, // Invalid ID - fails validation, no fetch call
      { productId: 'product-3', newQuantity: 20 },
    ];

    const results = await batchUpdateProductStock(updates);

    expect(results).toHaveLength(3);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    expect(results[1].error).toBeDefined();
    expect(results[2].success).toBe(true);
  });

  it('should handle empty batch', async () => {
    const results = await batchUpdateProductStock([]);
    expect(results).toHaveLength(0);
  });
});

describe('adjustProductStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock sanityClient.fetch for getCurrentStock (returns current stock)
    (sanityClient.fetch as jest.Mock).mockResolvedValue({ stockQuantity: 50 });
    // Mock fetch for the API call that updateProductStock makes
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 50,
          newQuantity: 60, // Will be overridden per test
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });
  });

  it('should add units (positive delta)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 50,
          newQuantity: 60,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });

    const result = await adjustProductStock('product-123', 10);

    expect(result.oldQuantity).toBe(50);
    expect(result.newQuantity).toBe(60);
  });

  it('should subtract units (negative delta)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 50,
          newQuantity: 30,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });

    const result = await adjustProductStock('product-123', -20);

    expect(result.oldQuantity).toBe(50);
    expect(result.newQuantity).toBe(30);
  });

  it('should throw ValidationError if result is negative', async () => {
    await expect(adjustProductStock('product-123', -100)).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for non-number delta', async () => {
    await expect(adjustProductStock('product-123', NaN)).rejects.toThrow(ValidationError);
    await expect(adjustProductStock('product-123', NaN)).rejects.toThrow('Delta must be a number');
  });

  it('should handle zero delta', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 50,
          newQuantity: 50,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });

    const result = await adjustProductStock('product-123', 0);

    expect(result.oldQuantity).toBe(50);
    expect(result.newQuantity).toBe(50);
  });
});

describe('setOutOfStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for the API call
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          productId: 'product-123',
          oldQuantity: 50,
          newQuantity: 0,
          updatedAt: '2026-02-02T10:00:00Z',
          success: true,
        },
      }),
    });
  });

  it('should set stock to 0', async () => {
    const result = await setOutOfStock('product-123');

    expect(result.newQuantity).toBe(0);
    expect(result.success).toBe(true);
  });
});

describe('productExists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if product exists', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValue({ _id: 'product-123' });

    const exists = await productExists('product-123');
    expect(exists).toBe(true);
  });

  it('should return false if product does not exist', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValue(null);

    const exists = await productExists('product-999');
    expect(exists).toBe(false);
  });

  it('should return false on fetch error', async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const exists = await productExists('product-123');
    expect(exists).toBe(false);
  });

  it('should throw ValidationError for invalid productId', async () => {
    await expect(productExists('')).rejects.toThrow(ValidationError);
  });
});
