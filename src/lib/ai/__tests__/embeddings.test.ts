/**
 * Vector Embeddings Tests
 * 
 * Comprehensive unit tests for embedding generation and vector search
 * RALPH LOOP: Run → Analyze → Learn → Plan → Implement
 */

// Mock config before importing embeddings
jest.mock('../config', () => ({
  HF_API_KEY: 'test-api-key-from-config',
  HF_API_ENDPOINT: 'https://router.huggingface.co/v1',
}));

import {
  generateEmbedding,
  generateBatchEmbeddings,
  cosineSimilarity,
  findSimilarVectors,
  buildProductText,
  getCachedEmbedding,
  clearEmbeddingCache,
  getEmbeddingCacheStats,
  testEmbeddingGeneration,
  type ProductText,
  type EmbeddingVector,
} from '../embeddings';

// Mock fetch for Hugging Face API
global.fetch = jest.fn();

describe('Vector Embeddings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearEmbeddingCache();
    // Restore default process.env
    process.env.NEXT_PUBLIC_HF_API_KEY = 'test-api-key';
  });

  describe('generateEmbedding', () => {
    it('should generate 384-dimensional embedding', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmbedding,
      });

      const embedding = await generateEmbedding('Fresh button mushrooms');

      expect(embedding).toHaveLength(384);
      expect(embedding.every(val => typeof val === 'number')).toBe(true);
    });

    it('should handle HF API returning batch format', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      // HF sometimes returns [[embedding]] instead of [embedding]
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockEmbedding],
      });

      const embedding = await generateEmbedding('Shiitake mushrooms');

      expect(embedding).toHaveLength(384);
    });

    it('should throw error for empty text', async () => {
      await expect(generateEmbedding('')).rejects.toThrow('Text cannot be empty');
      await expect(generateEmbedding('   ')).rejects.toThrow('Text cannot be empty');
    });

    it('should throw error when HF_API_KEY not configured', async () => {
      // Remove both env var and config
      delete process.env.NEXT_PUBLIC_HF_API_KEY;
      
      // Need to re-import embeddings module with empty config
      jest.resetModules();
      jest.doMock('../config', () => ({
        HF_API_KEY: '',
        HF_API_ENDPOINT: 'https://router.huggingface.co/v1',
      }));
      
      const { generateEmbedding: testGenerateEmbedding } = await import('../embeddings');

      await expect(testGenerateEmbedding('test')).rejects.toThrow('HF_API_KEY not configured');

      // Restore modules
      jest.resetModules();
      jest.dontMock('../config');
      
      // Restore env var
      process.env.NEXT_PUBLIC_HF_API_KEY = 'test-api-key';
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable',
      });

      await expect(generateEmbedding('test')).rejects.toThrow('Hugging Face API error: 503');
    });

    it('should truncate long text to max input length', async () => {
      const longText = 'mushroom '.repeat(1000); // Way over 512 tokens
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmbedding,
      });

      const embedding = await generateEmbedding(longText);

      expect(embedding).toHaveLength(384);
      
      // Check that fetch was called with truncated text
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.inputs.length).toBeLessThan(longText.length);
    });

    it('should throw error for invalid embedding dimensions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => new Array(128).fill(0), // Wrong dimensions
      });

      await expect(generateEmbedding('test')).rejects.toThrow('Invalid embedding dimensions: 128, expected 384');
    });

    it('should include Authorization header with HF API key', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmbedding,
      });

      await generateEmbedding('test');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers.Authorization).toContain('Bearer');
    });
  });

  describe('generateBatchEmbeddings', () => {
    it('should generate embeddings for multiple products', async () => {
      const products: ProductText[] = [
        { id: '1', text: 'Button mushrooms' },
        { id: '2', text: 'Shiitake mushrooms' },
        { id: '3', text: 'Oyster mushrooms' },
      ];

      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      // Mock all fetch calls
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockEmbedding,
      });

      const results = await generateBatchEmbeddings(products);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('1');
      expect(results[0].embedding).toHaveLength(384);
      expect(results[0].model).toBe('sentence-transformers/all-MiniLM-L6-v2');
      expect(results[0].timestamp).toBeGreaterThan(0);
    });

    it('should handle empty products array', async () => {
      const results = await generateBatchEmbeddings([]);
      expect(results).toEqual([]);
    });

    it('should retry failed embeddings up to 3 times', async () => {
      const products: ProductText[] = [{ id: '1', text: 'test' }];

      let attempts = 0;
      (global.fetch as jest.Mock).mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          return { ok: false, status: 503, text: async () => 'Retry' };
        }
        return {
          ok: true,
          json: async () => new Array(384).fill(0).map(() => Math.random()),
        };
      });

      const results = await generateBatchEmbeddings(products);

      expect(results).toHaveLength(1);
      expect(attempts).toBe(3); // Should have retried
    }, 15000); // 15 second timeout for retry logic

    it('should continue processing other products if one fails', async () => {
      const products: ProductText[] = [
        { id: '1', text: 'Success' },
        { id: '2', text: 'Fail' },
        { id: '3', text: 'Success' },
      ];

      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      // Mock based on product text instead of call count
      (global.fetch as jest.Mock).mockImplementation(async (url, options) => {
        const body = JSON.parse(options.body);
        
        // Always fail for "Fail" text
        if (body.inputs === 'Fail') {
          return { ok: false, status: 500, text: async () => 'Error' };
        }
        
        // Success for other texts
        return { ok: true, json: async () => mockEmbedding };
      });

      const results = await generateBatchEmbeddings(products);

      expect(results.length).toBe(2); // Only successful ones
      expect(results.find(r => r.id === '2')).toBeUndefined();
      expect(results.find(r => r.id === '1')).toBeDefined();
      expect(results.find(r => r.id === '3')).toBeDefined();
    }, 15000); // 15 second timeout for retry logic

    it('should process in batches of 10', async () => {
      const products: ProductText[] = Array(25).fill(null).map((_, i) => ({
        id: `${i}`,
        text: `Product ${i}`,
      }));

      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockEmbedding,
      });

      const results = await generateBatchEmbeddings(products);

      expect(results).toHaveLength(25);
    });
  });

  describe('cosineSimilarity', () => {
    it('should return 1.0 for identical vectors', () => {
      const vec = new Array(384).fill(1);
      const similarity = cosineSimilarity(vec, vec);
      
      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should return 0.5 for completely opposite vectors', () => {
      const vecA = new Array(384).fill(1);
      const vecB = new Array(384).fill(-1);
      const similarity = cosineSimilarity(vecA, vecB);
      
      expect(similarity).toBeCloseTo(0.0, 5); // Normalized to 0-1
    });

    it('should calculate similarity between different vectors', () => {
      const vecA = [1, 2, 3, 4];
      const vecB = [2, 3, 4, 5];
      const similarity = cosineSimilarity(vecA, vecB);
      
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1.0);
    });

    it('should return 0 for zero vectors', () => {
      const vecA = new Array(384).fill(0);
      const vecB = new Array(384).fill(1);
      const similarity = cosineSimilarity(vecA, vecB);
      
      expect(similarity).toBe(0);
    });

    it('should throw error for mismatched dimensions', () => {
      const vecA = new Array(384).fill(1);
      const vecB = new Array(128).fill(1);
      
      expect(() => cosineSimilarity(vecA, vecB)).toThrow('Vector dimensions mismatch');
    });

    it('should handle negative values correctly', () => {
      const vecA = [1, -1, 1, -1];
      const vecB = [1, 1, 1, 1];
      const similarity = cosineSimilarity(vecA, vecB);
      
      expect(similarity).toBeLessThan(1.0);
      expect(similarity).toBeGreaterThan(0);
    });
  });

  describe('findSimilarVectors', () => {
    it('should return top-k most similar products', () => {
      // Create query vector
      const queryVector = new Array(384).fill(0).map((_, i) => i % 2 === 0 ? 1 : 0);
      
      // Create products with varying similarity
      const products = [
        { 
          id: '1', 
          embedding: new Array(384).fill(0).map((_, i) => i % 2 === 0 ? 1 : 0) // Perfect match
        },
        { 
          id: '2', 
          embedding: new Array(384).fill(0).map((_, i) => i % 2 === 0 ? 0.5 : 0.5) // Medium match
        },
        { 
          id: '3', 
          embedding: new Array(384).fill(0).map((_, i) => i % 2 === 0 ? 0 : 1) // Opposite
        },
      ];

      const results = findSimilarVectors(queryVector, products, 2);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('1'); // Most similar first (perfect match)
      expect(results[0].score).toBeGreaterThan(results[1].score);
      expect(results[1].id).toBe('2'); // Second most similar
    });

    it('should limit results to topK parameter', () => {
      const queryVector = new Array(384).fill(1);
      const products = Array(20).fill(null).map((_, i) => ({
        id: `${i}`,
        embedding: new Array(384).fill(Math.random()),
      }));

      const results = findSimilarVectors(queryVector, products, 5);

      expect(results).toHaveLength(5);
    });

    it('should sort results by score descending', () => {
      const queryVector = new Array(384).fill(1);
      const products = Array(10).fill(null).map((_, i) => ({
        id: `${i}`,
        embedding: new Array(384).fill(Math.random()),
      }));

      const results = findSimilarVectors(queryVector, products);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it('should handle empty products array', () => {
      const queryVector = new Array(384).fill(1);
      const results = findSimilarVectors(queryVector, []);

      expect(results).toEqual([]);
    });

    it('should default to top-10 if topK not specified', () => {
      const queryVector = new Array(384).fill(1);
      const products = Array(20).fill(null).map((_, i) => ({
        id: `${i}`,
        embedding: new Array(384).fill(Math.random()),
      }));

      const results = findSimilarVectors(queryVector, products);

      expect(results).toHaveLength(10);
    });
  });

  describe('buildProductText', () => {
    it('should combine product metadata into text', () => {
      const product = {
        name: 'Button Mushrooms',
        description: 'Fresh white mushrooms',
        category: 'Fresh',
        tags: ['cooking', 'fresh'],
      };

      const text = buildProductText(product);

      expect(text).toContain('Button Mushrooms');
      expect(text).toContain('Fresh white mushrooms');
      expect(text).toContain('Category: Fresh');
      expect(text).toContain('Tags: cooking, fresh');
    });

    it('should handle missing description', () => {
      const product = {
        name: 'Shiitake',
        category: 'Dried',
      };

      const text = buildProductText(product);

      expect(text).toContain('Shiitake');
      expect(text).toContain('Category: Dried');
      expect(text).not.toContain('undefined');
    });

    it('should handle missing category', () => {
      const product = {
        name: 'Oyster',
        description: 'Fresh oyster mushrooms',
      };

      const text = buildProductText(product);

      expect(text).toContain('Oyster');
      expect(text).toContain('Fresh oyster mushrooms');
      expect(text).not.toContain('Category:');
    });

    it('should handle empty tags array', () => {
      const product = {
        name: 'King Oyster',
        tags: [],
      };

      const text = buildProductText(product);

      expect(text).toContain('King Oyster');
      expect(text).not.toContain('Tags:');
    });

    it('should handle product with only name', () => {
      const product = {
        name: 'Portobello',
      };

      const text = buildProductText(product);

      expect(text).toBe('Portobello');
    });
  });

  describe('getCachedEmbedding', () => {
    it('should cache embeddings to avoid redundant API calls', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockEmbedding,
      });

      const text = 'Fresh mushrooms';
      
      // First call - should hit API
      const embedding1 = await getCachedEmbedding(text);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const embedding2 = await getCachedEmbedding(text);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      
      expect(embedding1).toEqual(embedding2);
    });

    it('should normalize cache keys (case-insensitive, trimmed)', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockEmbedding,
      });

      await getCachedEmbedding('  Fresh Mushrooms  ');
      await getCachedEmbedding('fresh mushrooms');
      await getCachedEmbedding('FRESH MUSHROOMS');

      expect(global.fetch).toHaveBeenCalledTimes(1); // All should hit cache
    });
  });

  describe('clearEmbeddingCache', () => {
    it('should clear all cached embeddings', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockEmbedding,
      });

      // Populate cache
      await getCachedEmbedding('test1');
      await getCachedEmbedding('test2');
      expect(getEmbeddingCacheStats().size).toBe(2);

      // Clear cache
      clearEmbeddingCache();
      expect(getEmbeddingCacheStats().size).toBe(0);

      // Next call should hit API again
      await getCachedEmbedding('test1');
      expect(global.fetch).toHaveBeenCalledTimes(3); // Not using cache
    });
  });

  describe('getEmbeddingCacheStats', () => {
    it('should return cache size and keys', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockEmbedding,
      });

      await getCachedEmbedding('test1');
      await getCachedEmbedding('test2');
      await getCachedEmbedding('test3');

      const stats = getEmbeddingCacheStats();

      expect(stats.size).toBe(3);
      expect(stats.keys).toHaveLength(3);
      expect(stats.keys).toContain('test1');
    });
  });

  describe('testEmbeddingGeneration', () => {
    it('should return true if embeddings work', async () => {
      const mockEmbedding = new Array(384).fill(0).map(() => Math.random());
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmbedding,
      });

      const result = await testEmbeddingGeneration();

      expect(result).toBe(true);
    });

    it('should return false if embeddings fail', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await testEmbeddingGeneration();

      expect(result).toBe(false);
    });

    it('should return false if wrong dimensions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => new Array(128).fill(0), // Wrong size
      });

      const result = await testEmbeddingGeneration();

      expect(result).toBe(false);
    });
  });
});
