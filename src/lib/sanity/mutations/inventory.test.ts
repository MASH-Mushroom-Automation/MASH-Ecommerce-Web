/**
 * Unit Tests for Sanity Inventory Mutations
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
import { sanityClient, sanityWriteClient } from '@/lib/sanity/client';

// Mock dependencies
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(),
    patch: jest.fn(),
  },
  sanityWriteClient: {
    fetch: jest.fn(),
    patch: jest.fn(),
  },
  isWriteConfigured: jest.fn(() => true),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
  },
}));

describe('updateProductStock', () => {
  const mockPatch = jest.fn();
  const mockCommit = jest.fn();
  const mockSet = jest.fn(() => ({ commit: mockCommit }));

  beforeEach(() => {
    jest.clearAllMocks();
    (sanityClient.fetch as jest.Mock).mockResolvedValue({ stockQuantity: 10 });
    (sanityWriteClient.patch as jest.Mock).mockReturnValue({
      set: mockSet,
    });
    mockPatch.mockReturnValue({ set: mockSet });
    mockCommit.mockResolvedValue({ _updatedAt: '2026-02-02T10:00:00Z' });
  });

  it('should update stock successfully', async () => {
    const result = await updateProductStock('product-123', 50);

    expect(result).toEqual({
      success: true,
      productId: 'product-123',
      oldQuantity: 10,
      newQuantity: 50,
      updatedAt: '2026-02-02T10:00:00Z',
    });

    expect(sanityWriteClient.patch).toHaveBeenCalledWith('product-123');
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        stockQuantity: 50,
        updatedAt: expect.any(String),
      })
    );
    expect(mockCommit).toHaveBeenCalled();
  });

  it('should fetch current stock before update', async () => {
    await updateProductStock('product-123', 50);

    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('*[_type == "product" && _id == $productId]'),
      { productId: 'product-123' }
    );
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
    mockCommit
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ _updatedAt: '2026-02-02T10:00:00Z' });

    const result = await updateProductStock('product-123', 50);

    expect(result.success).toBe(true);
    expect(mockCommit).toHaveBeenCalledTimes(3); // 2 failures + 1 success
  });

  it('should throw MutationError after max retries', async () => {
    mockCommit.mockRejectedValue(new Error('Network error'));

    await expect(updateProductStock('product-123', 50, 3)).rejects.toThrow(MutationError);
    
    // Reset and test again for the message check
    mockCommit.mockClear();
    mockCommit.mockRejectedValue(new Error('Network error'));
    
    await expect(updateProductStock('product-123', 50, 3)).rejects.toThrow(
      'Failed to update stock after 3 attempts'
    );

    expect(mockCommit).toHaveBeenCalledTimes(3);
  }, 10000); // 10 second timeout for retry logic

  it('should throw MutationError if product not found', async () => {
    (sanityClient.fetch as jest.Mock).mockResolvedValue(null);

    await expect(updateProductStock('product-999', 50)).rejects.toThrow(MutationError);
    await expect(updateProductStock('product-999', 50)).rejects.toThrow('Product not found');
  });

  it('should allow quantity of 0', async () => {
    const result = await updateProductStock('product-123', 0);

    expect(result.success).toBe(true);
    expect(result.newQuantity).toBe(0);
  });

  it('should allow large valid quantities', async () => {
    const result = await updateProductStock('product-123', 999999);

    expect(result.success).toBe(true);
    expect(result.newQuantity).toBe(999999);
  });
});

describe('batchUpdateProductStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sanityClient.fetch as jest.Mock).mockResolvedValue({ stockQuantity: 10 });
    (sanityWriteClient.patch as jest.Mock).mockReturnValue({
      set: jest.fn(() => ({
        commit: jest.fn().mockResolvedValue({ _updatedAt: '2026-02-02T10:00:00Z' }),
      })),
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
    expect(sanityWriteClient.patch).toHaveBeenCalledTimes(3);
  });

  it('should continue batch if one update fails', async () => {
    const updates = [
      { productId: 'product-1', newQuantity: 50 },
      { productId: '', newQuantity: 30 }, // Invalid ID
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
    (sanityClient.fetch as jest.Mock).mockResolvedValue({ stockQuantity: 50 });
    (sanityWriteClient.patch as jest.Mock).mockReturnValue({
      set: jest.fn(() => ({
        commit: jest.fn().mockResolvedValue({ _updatedAt: '2026-02-02T10:00:00Z' }),
      })),
    });
  });

  it('should add units (positive delta)', async () => {
    const result = await adjustProductStock('product-123', 10);

    expect(result.oldQuantity).toBe(50);
    expect(result.newQuantity).toBe(60);
  });

  it('should subtract units (negative delta)', async () => {
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
    const result = await adjustProductStock('product-123', 0);

    expect(result.oldQuantity).toBe(50);
    expect(result.newQuantity).toBe(50);
  });
});

describe('setOutOfStock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sanityClient.fetch as jest.Mock).mockResolvedValue({ stockQuantity: 50 });
    (sanityWriteClient.patch as jest.Mock).mockReturnValue({
      set: jest.fn(() => ({
        commit: jest.fn().mockResolvedValue({ _updatedAt: '2026-02-02T10:00:00Z' }),
      })),
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
