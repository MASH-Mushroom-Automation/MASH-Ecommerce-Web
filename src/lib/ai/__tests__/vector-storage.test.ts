/**
 * Vector Storage Tests
 * 
 * Comprehensive unit tests for Firestore embedding storage and retrieval
 * RALPH LOOP: Run → Analyze → Learn → Plan → Implement
 */

// Mock Firestore before imports
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));
jest.mock('../embeddings');

import {
  storeEmbedding,
  getEmbedding,
  storeEmbeddingsBatch,
  getAllEmbeddings,
  deleteEmbedding,
  embeddingExists,
  getStorageStats,
  type EmbeddingDocument,
} from '../vector-storage';
import * as firestore from 'firebase/firestore';
import * as embeddings from '../embeddings';

describe('Vector Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeEmbedding', () => {
    it('should store embedding in Firestore', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
      (firestore.getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      await storeEmbedding('prod-123', mockEmbedding, 'Fresh button mushrooms');

      expect(firestore.setDoc).toHaveBeenCalledTimes(1);
      expect(firestore.doc).toHaveBeenCalledWith(
        expect.anything(),
        'products',
        'prod-123',
        'embeddings',
        'v1'
      );
    });

    it('should throw error for empty product ID', async () => {
      const mockEmbedding = new Array(384).fill(0);
      
      await expect(storeEmbedding('', mockEmbedding, 'text')).rejects.toThrow(
        'Product ID cannot be empty'
      );
    });

    it('should throw error for invalid embedding dimensions', async () => {
      const mockEmbedding = new Array(128).fill(0); // Wrong dimensions
      
      await expect(storeEmbedding('prod-123', mockEmbedding, 'text')).rejects.toThrow(
        'Invalid embedding dimensions: 128, expected 384'
      );
    });

    it('should skip existing embeddings when overwrite=false', async () => {
      const mockEmbedding = new Array(384).fill(0);
      
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ productId: 'prod-123', embedding: mockEmbedding }),
      });

      await storeEmbedding('prod-123', mockEmbedding, 'text', { overwrite: false });

      expect(firestore.setDoc).not.toHaveBeenCalled();
    });

    it('should support custom version', async () => {
      const mockEmbedding = new Array(384).fill(0);
      
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
      (firestore.getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      await storeEmbedding('prod-123', mockEmbedding, 'text', { version: 'v2' });

      expect(firestore.doc).toHaveBeenCalledWith(
        expect.anything(),
        'products',
        'prod-123',
        'embeddings',
        'v2'
      );
    });

    it('should handle Firestore errors gracefully', async () => {
      const mockEmbedding = new Array(384).fill(0);
      
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.setDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));
      (firestore.getDoc as jest.Mock).mockResolvedValue({ exists: () => false });

      await expect(storeEmbedding('prod-123', mockEmbedding, 'text')).rejects.toThrow(
        'Firestore error'
      );
    });
  });

  describe('getEmbedding', () => {
    it('should retrieve embedding from Firestore', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      const mockDoc: EmbeddingDocument = {
        productId: 'prod-123',
        embedding: mockEmbedding,
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        version: 'v1',
        dimensions: 384,
        text: 'Fresh button mushrooms',
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      };

      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockDoc,
      });

      const result = await getEmbedding('prod-123');

      expect(result).toEqual(mockDoc);
      expect(result?.embedding).toHaveLength(384);
    });

    it('should return null for non-existent embedding', async () => {
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await getEmbedding('prod-nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error for empty product ID', async () => {
      await expect(getEmbedding('')).rejects.toThrow('Product ID cannot be empty');
    });

    it('should handle Firestore errors', async () => {
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(getEmbedding('prod-123')).rejects.toThrow('Network error');
    });
  });

  describe('storeEmbeddingsBatch', () => {
    it('should store multiple embeddings in batch', async () => {
      const products = [
        { id: 'prod-1', text: 'Button mushrooms' },
        { id: 'prod-2', text: 'Shiitake mushrooms' },
        { id: 'prod-3', text: 'Oyster mushrooms' },
      ];

      const mockEmbeddingResults = products.map(p => ({
        id: p.id,
        embedding: new Array(384).fill(0).map(() => Math.random()),
        dimensions: 384,
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        timestamp: Date.now(),
      }));

      (embeddings.generateBatchEmbeddings as jest.Mock).mockResolvedValue(mockEmbeddingResults);
      (firestore.writeBatch as jest.Mock).mockReturnValue({
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      });
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');

      const result = await storeEmbeddingsBatch(products);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(embeddings.generateBatchEmbeddings).toHaveBeenCalledWith(products);
    });

    it('should handle empty products array', async () => {
      const result = await storeEmbeddingsBatch([]);

      expect(result.success).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.failedIds).toEqual([]);
    });

    it('should track products without generated embeddings', async () => {
      const products = [
        { id: 'prod-1', text: 'Success' },
        { id: 'prod-2', text: 'Success' },
      ];

      // Only prod-1 gets an embedding generated
      const mockEmbeddingResults = [
        {
          id: 'prod-1',
          embedding: new Array(384).fill(0),
          dimensions: 384,
          model: 'test',
          timestamp: Date.now(),
        },
      ];

      (embeddings.generateBatchEmbeddings as jest.Mock).mockResolvedValue(mockEmbeddingResults);
      (firestore.writeBatch as jest.Mock).mockReturnValue({
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      });
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');

      const result = await storeEmbeddingsBatch(products);

      // Should successfully store 1 embedding (only what was generated)
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0); // No explicit failures, just products without embeddings
      expect(embeddings.generateBatchEmbeddings).toHaveBeenCalledWith(products);
    });

    it('should handle large batches with multiple commits', async () => {
      // Create 1000 products (exceeds 500 batch limit)
      const products = Array(1000).fill(null).map((_, i) => ({
        id: `prod-${i}`,
        text: `Product ${i}`,
      }));

      const mockEmbeddingResults = products.map(p => ({
        id: p.id,
        embedding: new Array(384).fill(0),
        dimensions: 384,
        model: 'test',
        timestamp: Date.now(),
      }));

      (embeddings.generateBatchEmbeddings as jest.Mock).mockResolvedValue(mockEmbeddingResults);
      
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (firestore.writeBatch as jest.Mock).mockReturnValue(mockBatch);
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');

      const result = await storeEmbeddingsBatch(products);

      expect(result.success).toBe(1000);
      // Should have called commit multiple times (1000 / 500 = 2 batches)
      expect(mockBatch.commit).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllEmbeddings', () => {
    it('should retrieve all embeddings for version', async () => {
      const mockProducts = [
        { id: 'prod-1' },
        { id: 'prod-2' },
        { id: 'prod-3' },
      ];

      const mockEmbedding = new Array(384).fill(0);

      (firestore.collection as jest.Mock).mockReturnValue('mock-collection');
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({
        docs: mockProducts.map(p => ({ id: p.id })),
      });

      // Mock getDoc for each product's embedding
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          productId: 'test',
          embedding: mockEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'test',
          createdAt: { seconds: 0, nanoseconds: 0 },
          updatedAt: { seconds: 0, nanoseconds: 0 },
        }),
      });

      const result = await getAllEmbeddings('v1');

      expect(result).toHaveLength(3);
      expect(result[0].embedding).toHaveLength(384);
    });

    it('should respect limit parameter', async () => {
      const mockProducts = Array(100).fill(null).map((_, i) => ({ id: `prod-${i}` }));

      (firestore.collection as jest.Mock).mockReturnValue('mock-collection');
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({
        docs: mockProducts.map(p => ({ id: p.id })),
      });

      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          productId: 'test',
          embedding: new Array(384).fill(0),
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'test',
          createdAt: { seconds: 0, nanoseconds: 0 },
          updatedAt: { seconds: 0, nanoseconds: 0 },
        }),
      });

      const result = await getAllEmbeddings('v1', 10);

      expect(result).toHaveLength(10);
    });

    it('should skip products without embeddings', async () => {
      const mockProducts = [
        { id: 'prod-1' },
        { id: 'prod-2' },
      ];

      (firestore.collection as jest.Mock).mockReturnValue('mock-collection');
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({
        docs: mockProducts.map(p => ({ id: p.id })),
      });

      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ embedding: new Array(384).fill(0) }),
        })
        .mockResolvedValueOnce({
          exists: () => false, // No embedding for prod-2
        });

      const result = await getAllEmbeddings('v1');

      expect(result).toHaveLength(1);
    });
  });

  describe('deleteEmbedding', () => {
    it('should delete embedding from Firestore', async () => {
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);

      await deleteEmbedding('prod-123', 'v1');

      expect(firestore.setDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        { deleted: true },
        { merge: true }
      );
    });

    it('should throw error for empty product ID', async () => {
      await expect(deleteEmbedding('')).rejects.toThrow('Product ID cannot be empty');
    });
  });

  describe('embeddingExists', () => {
    it('should return true if embedding exists', async () => {
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ embedding: new Array(384).fill(0) }),
      });

      const exists = await embeddingExists('prod-123');

      expect(exists).toBe(true);
    });

    it('should return false if embedding does not exist', async () => {
      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const exists = await embeddingExists('prod-nonexistent');

      expect(exists).toBe(false);
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      const mockProducts = [
        { id: 'prod-1' },
        { id: 'prod-2' },
        { id: 'prod-3' },
      ];

      (firestore.collection as jest.Mock).mockReturnValue('mock-collection');
      (firestore.getDocs as jest.Mock).mockResolvedValueOnce({
        docs: mockProducts.map(p => ({ id: p.id })),
      });

      (firestore.doc as jest.Mock).mockReturnValue('mock-doc-ref');
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          productId: 'test',
          embedding: new Array(384).fill(0),
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          version: 'v1',
          dimensions: 384,
          text: 'test',
          createdAt: { seconds: 0, nanoseconds: 0 },
          updatedAt: { seconds: 0, nanoseconds: 0 },
        }),
      });

      const stats = await getStorageStats('v1');

      expect(stats.totalEmbeddings).toBe(3);
      expect(stats.version).toBe('v1');
      expect(stats.model).toBe('sentence-transformers/all-MiniLM-L6-v2');
    });
  });
});
