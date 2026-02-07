/**
 * Hybrid Search Tests
 * 
 * Comprehensive unit tests for TF-IDF + vector embeddings hybrid search
 * RALPH LOOP: Run → Analyze → Learn → Plan → Implement
 */

// Mock dependencies before imports
jest.mock('../search-engine', () => ({
  search: jest.fn(),
}));
jest.mock('../vector-search', () => ({
  vectorSearch: jest.fn(),
}));

import {
  hybridSearch,
  normalizeScores,
  mergeResults,
  getSearchStats,
  recommendSearchMode,
  SEARCH_MODES,
  type HybridSearchResult,
} from '../hybrid-search';
import { search as tfIdfSearch } from '../search-engine';
import { vectorSearch as vectorSearchFn } from '../vector-search';

describe('Hybrid Search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeScores', () => {
    it('should normalize scores to 0-1 range', () => {
      const scores = [10, 20, 30, 40, 50];
      const normalized = normalizeScores(scores);

      expect(normalized).toEqual([0, 0.25, 0.5, 0.75, 1]);
    });

    it('should handle single score', () => {
      const scores = [42];
      const normalized = normalizeScores(scores);

      expect(normalized).toEqual([1]);
    });

    it('should handle identical scores', () => {
      const scores = [5, 5, 5, 5];
      const normalized = normalizeScores(scores);

      expect(normalized).toEqual([1, 1, 1, 1]);
    });

    it('should return empty array for empty input', () => {
      const scores: number[] = [];
      const normalized = normalizeScores(scores);

      expect(normalized).toEqual([]);
    });

    it('should handle negative scores', () => {
      const scores = [-10, 0, 10];
      const normalized = normalizeScores(scores);

      expect(normalized).toEqual([0, 0.5, 1]);
    });

    it('should handle floating-point scores', () => {
      const scores = [0.1, 0.5, 0.9];
      const normalized = normalizeScores(scores);

      expect(normalized[0]).toBeCloseTo(0, 5);
      expect(normalized[1]).toBeCloseTo(0.5, 5);
      expect(normalized[2]).toBeCloseTo(1, 5);
    });
  });

  describe('mergeResults', () => {
    it('should merge results with same productId', () => {
      const results: HybridSearchResult[] = [
        {
          productId: 'prod-1',
          score: 0.8,
          tfIdfScore: 0.7,
          vectorScore: 0.9,
          matchedFields: ['name'],
        },
        {
          productId: 'prod-1',
          score: 0.6,
          tfIdfScore: 0.5,
          vectorScore: 0.7,
          matchedFields: ['description'],
        },
      ];

      const merged = mergeResults(results);

      expect(merged).toHaveLength(1);
      expect(merged[0].productId).toBe('prod-1');
      expect(merged[0].score).toBe(0.8); // Keeps higher score
      expect(merged[0].matchedFields).toEqual(['name', 'description']); // Merged fields
    });

    it('should keep separate results for different products', () => {
      const results: HybridSearchResult[] = [
        {
          productId: 'prod-1',
          score: 0.8,
          tfIdfScore: 0.7,
          vectorScore: 0.9,
          matchedFields: ['name'],
        },
        {
          productId: 'prod-2',
          score: 0.6,
          tfIdfScore: 0.5,
          vectorScore: 0.7,
          matchedFields: ['description'],
        },
      ];

      const merged = mergeResults(results);

      expect(merged).toHaveLength(2);
      expect(merged.map(r => r.productId)).toContain('prod-1');
      expect(merged.map(r => r.productId)).toContain('prod-2');
    });

    it('should handle empty array', () => {
      const results: HybridSearchResult[] = [];
      const merged = mergeResults(results);

      expect(merged).toEqual([]);
    });
  });

  describe('hybridSearch', () => {
    it('should combine TF-IDF and vector search results', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
        { productId: 'prod-2', score: 5, matchedFields: ['description'] },
      ];

      const mockVectorResults = [
        { productId: 'prod-1', score: 0.9, version: 'v1', model: 'test' },
        { productId: 'prod-3', score: 0.7, version: 'v1', model: 'test' },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('mushrooms', { k: 10, minScore: 0 });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.score >= 0 && r.score <= 1)).toBe(true);
      expect(tfIdfSearch).toHaveBeenCalledWith('mushrooms', expect.anything());
      expect(vectorSearchFn).toHaveBeenCalledWith('mushrooms', expect.anything());
    });

    it('should apply default weights (40% TF-IDF + 60% vector)', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
      ];

      const mockVectorResults = [
        { productId: 'prod-1', score: 1.0, version: 'v1', model: 'test' },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('test', { k: 10, minScore: 0 });

      expect(results).toHaveLength(1);
      // Since both have max scores (after normalization), combined = 0.4*1 + 0.6*1 = 1.0
      expect(results[0].score).toBeCloseTo(1.0, 2);
    });

    it('should respect custom weights', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
      ];

      const mockVectorResults = [
        { productId: 'prod-1', score: 1.0, version: 'v1', model: 'test' },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('test', {
        k: 10,
        tfIdfWeight: 0.7,
        vectorWeight: 0.3,
        minScore: 0,
      });

      expect(results).toHaveLength(1);
      // Combined = 0.7*1 + 0.3*1 = 1.0
      expect(results[0].score).toBeCloseTo(1.0, 2);
    });

    it('should use search mode presets', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
      ];

      const mockVectorResults = [
        { productId: 'prod-1', score: 1.0, version: 'v1', model: 'test' },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      // Test keyword mode (70% TF-IDF, 30% vector)
      const results = await hybridSearch('test', { mode: 'keyword', k: 10, minScore: 0 });

      expect(results).toHaveLength(1);
      // Combined = 0.7*1 + 0.3*1 = 1.0
      expect(results[0].score).toBeCloseTo(1.0, 2);
    });

    it('should filter by minScore threshold', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
        { productId: 'prod-2', score: 1, matchedFields: ['description'] },
      ];

      const mockVectorResults = [
        { productId: 'prod-1', score: 1.0, version: 'v1', model: 'test' },
        { productId: 'prod-2', score: 0.1, version: 'v1', model: 'test' },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('test', { k: 10, minScore: 0.8 });

      expect(results.length).toBeLessThanOrEqual(2);
      expect(results.every(r => r.score >= 0.8)).toBe(true);
    });

    it('should respect k parameter (top k results)', async () => {
      const mockTfIdfResults = Array(10).fill(null).map((_, i) => ({
        productId: `prod-${i}`,
        score: 10 - i,
        matchedFields: ['name'],
      }));

      const mockVectorResults = Array(10).fill(null).map((_, i) => ({
        productId: `prod-${i}`,
        score: 1.0 - i * 0.05,
        version: 'v1',
        model: 'test',
      }));

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('test', { k: 3, minScore: 0 });

      expect(results).toHaveLength(3);
      // Should be sorted by combined score descending
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      expect(results[1].score).toBeGreaterThanOrEqual(results[2].score);
    });

    it('should handle products appearing in only one search method', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
      ];

      const mockVectorResults = [
        { productId: 'prod-2', score: 0.9, version: 'v1', model: 'test' },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('test', { k: 10, minScore: 0 });

      expect(results).toHaveLength(2);
      expect(results.map(r => r.productId)).toContain('prod-1');
      expect(results.map(r => r.productId)).toContain('prod-2');
    });

    it('should throw error for empty query', async () => {
      await expect(hybridSearch('')).rejects.toThrow('Query cannot be empty');
      await expect(hybridSearch('   ')).rejects.toThrow('Query cannot be empty');
    });

    it('should throw error for invalid k', async () => {
      await expect(hybridSearch('test', { k: 0 })).rejects.toThrow(
        'k must be greater than 0'
      );
      await expect(hybridSearch('test', { k: -1 })).rejects.toThrow(
        'k must be greater than 0'
      );
    });

    it('should throw error for invalid minScore', async () => {
      await expect(hybridSearch('test', { minScore: -0.1 })).rejects.toThrow(
        'minScore must be between 0 and 1'
      );
      await expect(hybridSearch('test', { minScore: 1.5 })).rejects.toThrow(
        'minScore must be between 0 and 1'
      );
    });

    it('should throw error for invalid weights', async () => {
      await expect(
        hybridSearch('test', { tfIdfWeight: 0.5, vectorWeight: 0.4 })
      ).rejects.toThrow('Weights must sum to 1.0');

      await expect(
        hybridSearch('test', { tfIdfWeight: -0.1, vectorWeight: 1.1 })
      ).rejects.toThrow('tfIdfWeight must be between 0 and 1');

      await expect(
        hybridSearch('test', { tfIdfWeight: 0.5, vectorWeight: 1.5 })
      ).rejects.toThrow('vectorWeight must be between 0 and 1');
    });

    it('should include text when includeText=true', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
      ];

      const mockVectorResults = [
        {
          productId: 'prod-1',
          score: 0.9,
          version: 'v1',
          model: 'test',
          text: 'Button mushrooms',
        },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('test', { includeText: true });

      expect(results[0].text).toBe('Button mushrooms');
    });

    it('should not include text when includeText=false', async () => {
      const mockTfIdfResults = [
        { productId: 'prod-1', score: 10, matchedFields: ['name'] },
      ];

      const mockVectorResults = [
        {
          productId: 'prod-1',
          score: 0.9,
          version: 'v1',
          model: 'test',
          text: 'Button mushrooms',
        },
      ];

      (tfIdfSearch as jest.Mock).mockResolvedValue(mockTfIdfResults);
      (vectorSearchFn as jest.Mock).mockResolvedValue(mockVectorResults);

      const results = await hybridSearch('test', { includeText: false });

      expect(results[0].text).toBeUndefined();
    });
  });

  describe('getSearchStats', () => {
    it('should calculate statistics for results', () => {
      const results: HybridSearchResult[] = [
        {
          productId: 'prod-1',
          score: 0.8,
          tfIdfScore: 0.9,
          vectorScore: 0.7,
          matchedFields: ['name'],
        },
        {
          productId: 'prod-2',
          score: 0.6,
          tfIdfScore: 0.3,
          vectorScore: 0.9,
          matchedFields: ['description'],
        },
        {
          productId: 'prod-3',
          score: 0.7,
          tfIdfScore: 0.6,
          vectorScore: 0.8,
          matchedFields: ['category'],
        },
      ];

      const stats = getSearchStats(results);

      expect(stats.totalResults).toBe(3);
      expect(stats.avgCombinedScore).toBeCloseTo(0.7, 2);
      expect(stats.tfIdfDominant).toBeGreaterThanOrEqual(0);
      expect(stats.vectorDominant).toBeGreaterThanOrEqual(0);
      expect(stats.balanced).toBeGreaterThanOrEqual(0);
      expect(stats.tfIdfDominant + stats.vectorDominant + stats.balanced).toBe(3);
    });

    it('should handle empty results', () => {
      const results: HybridSearchResult[] = [];
      const stats = getSearchStats(results);

      expect(stats.totalResults).toBe(0);
      expect(stats.avgCombinedScore).toBe(0);
      expect(stats.avgTfIdfScore).toBe(0);
      expect(stats.avgVectorScore).toBe(0);
    });
  });

  describe('recommendSearchMode', () => {
    it('should recommend keyword mode for short queries', () => {
      expect(recommendSearchMode('mushrooms')).toBe('keyword');
      expect(recommendSearchMode('button oyster')).toBe('keyword');
    });

    it('should recommend semantic mode for questions', () => {
      expect(recommendSearchMode('what mushrooms are good for cooking')).toBe('semantic');
      expect(recommendSearchMode('how to cook shiitake')).toBe('semantic');
      expect(recommendSearchMode('which mushrooms are organic')).toBe('semantic');
      expect(recommendSearchMode('show me fresh mushrooms')).toBe('semantic');
    });

    it('should recommend semantic mode for long queries', () => {
      const longQuery = 'I need fresh organic button mushrooms for making soup';
      expect(recommendSearchMode(longQuery)).toBe('semantic');
    });

    it('should recommend balanced mode for medium queries', () => {
      expect(recommendSearchMode('fresh button mushrooms')).toBe('balanced');
      expect(recommendSearchMode('organic shiitake mushrooms available')).toBe('balanced');
    });

    it('should handle empty queries gracefully', () => {
      expect(recommendSearchMode('')).toBe('keyword');
      expect(recommendSearchMode('   ')).toBe('keyword');
    });
  });

  describe('SEARCH_MODES', () => {
    it('should have balanced mode preset', () => {
      expect(SEARCH_MODES.balanced).toEqual({
        tfIdfWeight: 0.4,
        vectorWeight: 0.6,
      });
    });

    it('should have keyword mode preset', () => {
      expect(SEARCH_MODES.keyword).toEqual({
        tfIdfWeight: 0.7,
        vectorWeight: 0.3,
      });
    });

    it('should have semantic mode preset', () => {
      expect(SEARCH_MODES.semantic).toEqual({
        tfIdfWeight: 0.2,
        vectorWeight: 0.8,
      });
    });

    it('should have all weights sum to 1.0', () => {
      Object.values(SEARCH_MODES).forEach(mode => {
        const sum = mode.tfIdfWeight + mode.vectorWeight;
        expect(sum).toBeCloseTo(1.0, 5);
      });
    });
  });
});
