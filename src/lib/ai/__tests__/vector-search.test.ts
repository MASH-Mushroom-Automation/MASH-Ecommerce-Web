/**
 * Vector Search Tests
 * 
 * Comprehensive unit tests for semantic similarity search
 * RALPH LOOP: Run → Analyze → Learn → Plan → Implement
 */

// Mock dependencies before imports
jest.mock('../embeddings');
jest.mock('../vector-storage');

import {
  cosineSimilarity,
  normalizeScore,
  vectorSearch,
  findSimilarProducts,
  batchVectorSearch,
  type VectorSearchResult,
} from '../vector-search';
import * as embeddings from '../embeddings';
import * as vectorStorage from '../vector-storage';

describe('Vector Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity for identical vectors', () => {
      const vec1 = [1, 2, 3, 4];
      const vec2 = [1, 2, 3, 4];

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should calculate cosine similarity for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(0.0, 5);
    });

    it('should calculate cosine similarity for opposite vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [-1, -2, -3];

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(-1.0, 5);
    });

    it('should calculate cosine similarity for similar vectors', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [2, 4, 6]; // Same direction, different magnitude

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should handle high-dimensional vectors (384)', () => {
      const vec1 = new Array(384).fill(0).map(() => Math.random());
      const vec2 = new Array(384).fill(0).map(() => Math.random());

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should throw error for dimension mismatch', () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2];

      expect(() => cosineSimilarity(vec1, vec2)).toThrow(
        'Vector dimension mismatch'
      );
    });

    it('should throw error for empty vectors', () => {
      const vec1: number[] = [];
      const vec2: number[] = [];

      expect(() => cosineSimilarity(vec1, vec2)).toThrow(
        'Cannot calculate similarity for empty vectors'
      );
    });

    it('should return 0 for zero-magnitude vectors', () => {
      const vec1 = [0, 0, 0];
      const vec2 = [1, 2, 3];

      const similarity = cosineSimilarity(vec1, vec2);

      expect(similarity).toBe(0);
    });

    it('should handle floating-point precision', () => {
      const vec1 = [0.1, 0.2, 0.3];
      const vec2 = [0.4, 0.5, 0.6];

      const similarity = cosineSimilarity(vec1, vec2);

      // Should be within [-1, 1] despite floating-point errors
      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('normalizeScore', () => {
    it('should normalize score of 1 to 1', () => {
      expect(normalizeScore(1)).toBe(1);
    });

    it('should normalize score of -1 to 0', () => {
      expect(normalizeScore(-1)).toBe(0);
    });

    it('should normalize score of 0 to 0.5', () => {
      expect(normalizeScore(0)).toBe(0.5);
    });

    it('should normalize score of 0.5 to 0.75', () => {
      expect(normalizeScore(0.5)).toBe(0.75);
    });

    it('should normalize score of -0.5 to 0.25', () => {
      expect(normalizeScore(-0.5)).toBe(0.25);
    });
  });

  describe('vectorSearch', () => {
    it('should search products by query', async () => {
      const mockQueryEmbedding = new Array(384).fill(0).map((_, i) => i / 384);
      const mockProductEmbeddings = [
        {
          productId: 'prod-1',
          embedding: mockQueryEmbedding, // Identical (score = 1.0)
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Button mushrooms',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
        {
          productId: 'prod-2',
          embedding: new Array(384).fill(0).map((_, i) => -i / 384), // Opposite
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Shiitake mushrooms',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
      ];

      (embeddings.generateEmbedding as jest.Mock).mockResolvedValue({
        embedding: mockQueryEmbedding,
        dimensions: 384,
        model: 'test',
        timestamp: Date.now(),
      });

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue(
        mockProductEmbeddings
      );

      const results = await vectorSearch('button mushrooms', { k: 10, minScore: 0.5 });

      expect(results).toHaveLength(1); // Only prod-1 above threshold
      expect(results[0].productId).toBe('prod-1');
      expect(results[0].score).toBeCloseTo(1.0, 2);
    });

    it('should return empty array if no embeddings found', async () => {
      (embeddings.generateEmbedding as jest.Mock).mockResolvedValue({
        embedding: new Array(384).fill(0),
        dimensions: 384,
        model: 'test',
        timestamp: Date.now(),
      });

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue([]);

      const results = await vectorSearch('test query');

      expect(results).toEqual([]);
    });

    it('should respect k parameter (top k results)', async () => {
      const mockQueryEmbedding = new Array(384).fill(1);
      
      const mockProductEmbeddings = Array(10).fill(null).map((_, i) => ({
        productId: `prod-${i}`,
        embedding: mockQueryEmbedding.map(v => v * (1 - i * 0.05)), // Decreasing similarity
        model: 'test',
        version: 'v1',
        dimensions: 384,
        text: `Product ${i}`,
        createdAt: { seconds: 0, nanoseconds: 0 } as any,
        updatedAt: { seconds: 0, nanoseconds: 0 } as any,
      }));

      (embeddings.generateEmbedding as jest.Mock).mockResolvedValue({
        embedding: mockQueryEmbedding,
        dimensions: 384,
        model: 'test',
        timestamp: Date.now(),
      });

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue(
        mockProductEmbeddings
      );

      const results = await vectorSearch('test', { k: 3, minScore: 0.0 });

      expect(results).toHaveLength(3);
      // Should be sorted by score descending
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
    });

    it('should respect minScore threshold', async () => {
      const mockQueryEmbedding = new Array(384).fill(1);
      
      // Create embeddings with clear similarity differences
      const highSimilarityEmbedding = mockQueryEmbedding.map(v => v * 0.99); // Very similar
      const lowSimilarityEmbedding = mockQueryEmbedding.map((v, i) => i % 2 === 0 ? v : -v); // Partially opposite

      const mockProductEmbeddings = [
        {
          productId: 'prod-high',
          embedding: highSimilarityEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'High similarity',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
        {
          productId: 'prod-low',
          embedding: lowSimilarityEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Low similarity',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
      ];

      (embeddings.generateEmbedding as jest.Mock).mockResolvedValue({
        embedding: mockQueryEmbedding,
        dimensions: 384,
        model: 'test',
        timestamp: Date.now(),
      });

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue(
        mockProductEmbeddings
      );

      const results = await vectorSearch('test', { minScore: 0.9 });

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].productId).toBe('prod-high');
      expect(results[0].score).toBeGreaterThanOrEqual(0.9);
    });

    it('should include text when includeText=true', async () => {
      const mockEmbedding = new Array(384).fill(1);

      (embeddings.generateEmbedding as jest.Mock).mockResolvedValue({
        embedding: mockEmbedding,
        dimensions: 384,
        model: 'test',
        timestamp: Date.now(),
      });

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue([
        {
          productId: 'prod-1',
          embedding: mockEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Button mushrooms',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
      ]);

      const results = await vectorSearch('test', { includeText: true });

      expect(results[0].text).toBe('Button mushrooms');
    });

    it('should not include text when includeText=false', async () => {
      const mockEmbedding = new Array(384).fill(1);

      (embeddings.generateEmbedding as jest.Mock).mockResolvedValue({
        embedding: mockEmbedding,
        dimensions: 384,
        model: 'test',
        timestamp: Date.now(),
      });

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue([
        {
          productId: 'prod-1',
          embedding: mockEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Button mushrooms',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
      ]);

      const results = await vectorSearch('test', { includeText: false });

      expect(results[0].text).toBeUndefined();
    });

    it('should throw error for empty query', async () => {
      await expect(vectorSearch('')).rejects.toThrow('Query cannot be empty');
      await expect(vectorSearch('   ')).rejects.toThrow('Query cannot be empty');
    });

    it('should throw error for invalid k', async () => {
      await expect(vectorSearch('test', { k: 0 })).rejects.toThrow(
        'k must be greater than 0'
      );
      await expect(vectorSearch('test', { k: -1 })).rejects.toThrow(
        'k must be greater than 0'
      );
    });

    it('should throw error for invalid minScore', async () => {
      await expect(vectorSearch('test', { minScore: -0.1 })).rejects.toThrow(
        'minScore must be between 0 and 1'
      );
      await expect(vectorSearch('test', { minScore: 1.5 })).rejects.toThrow(
        'minScore must be between 0 and 1'
      );
    });
  });

  describe('findSimilarProducts', () => {
    it('should find similar products', async () => {
      const targetEmbedding = new Array(384).fill(1);
      
      // Create clear similarity differences
      const verysSimilarEmbedding = targetEmbedding.map(v => v * 0.98); // 98% similar
      const dissimilarEmbedding = targetEmbedding.map((v, i) => i % 2 === 0 ? v * 0.5 : -v * 0.5); // Mostly opposite

      const mockProductEmbeddings = [
        {
          productId: 'prod-target',
          embedding: targetEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Target product',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
        {
          productId: 'prod-similar',
          embedding: verysSimilarEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Similar product',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
        {
          productId: 'prod-dissimilar',
          embedding: dissimilarEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Dissimilar product',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
      ];

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue(
        mockProductEmbeddings
      );

      const results = await findSimilarProducts('prod-target', { k: 10, minScore: 0.7 });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].productId).toBe('prod-similar');
      expect(results[0].score).toBeGreaterThanOrEqual(0.7); // Above threshold
      expect(results.find(r => r.productId === 'prod-target')).toBeUndefined(); // Should exclude target
    });

    it('should exclude target product from results', async () => {
      const mockEmbedding = new Array(384).fill(1);

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue([
        {
          productId: 'prod-1',
          embedding: mockEmbedding,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Product 1',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
      ]);

      const results = await findSimilarProducts('prod-1');

      expect(results).toHaveLength(0); // Only one product, which is the target
    });

    it('should throw error for empty product ID', async () => {
      await expect(findSimilarProducts('')).rejects.toThrow(
        'Product ID cannot be empty'
      );
    });

    it('should throw error if product not found', async () => {
      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue([]);

      await expect(findSimilarProducts('prod-nonexistent')).rejects.toThrow(
        'Product embedding not found'
      );
    });
  });

  describe('batchVectorSearch', () => {
    it('should search multiple queries', async () => {
      const mockEmbedding1 = new Array(384).fill(1);
      const mockEmbedding2 = new Array(384).fill(0.5);

      (embeddings.generateEmbedding as jest.Mock)
        .mockResolvedValueOnce({
          embedding: mockEmbedding1,
          dimensions: 384,
          model: 'test',
          timestamp: Date.now(),
        })
        .mockResolvedValueOnce({
          embedding: mockEmbedding2,
          dimensions: 384,
          model: 'test',
          timestamp: Date.now(),
        });

      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue([
        {
          productId: 'prod-1',
          embedding: mockEmbedding1,
          model: 'test',
          version: 'v1',
          dimensions: 384,
          text: 'Product 1',
          createdAt: { seconds: 0, nanoseconds: 0 } as any,
          updatedAt: { seconds: 0, nanoseconds: 0 } as any,
        },
      ]);

      const results = await batchVectorSearch(['query1', 'query2']);

      expect(results).toHaveLength(2);
      expect(Array.isArray(results[0])).toBe(true);
      expect(Array.isArray(results[1])).toBe(true);
    });

    it('should skip empty queries in batch', async () => {
      (vectorStorage.getAllEmbeddings as jest.Mock).mockResolvedValue([]);

      const results = await batchVectorSearch(['valid query', '', '   ']);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual([]);
      expect(results[1]).toEqual([]);
      expect(results[2]).toEqual([]);
    });

    it('should throw error for empty queries array', async () => {
      await expect(batchVectorSearch([])).rejects.toThrow(
        'Queries array cannot be empty'
      );
    });
  });
});
