/**
 * Tests for Query Expansion Service
 */

import {
  expandQuery,
  batchExpandQueries,
  clearCache,
  getCacheStats,
  QueryExpansionOptions,
} from '../query-expansion';
import * as geminiClient from '../gemini-client';

// Mock Gemini client
jest.mock('../gemini-client', () => ({
  generateResponse: jest.fn(),
}));

describe('Query Expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearCache();
  });

  describe('expandQuery', () => {
    describe('validation', () => {
      it('should throw error for empty query', async () => {
        await expect(expandQuery('')).rejects.toThrow('Query cannot be empty');
        await expect(expandQuery('   ')).rejects.toThrow('Query cannot be empty');
      });

      it('should throw error for invalid maxTerms', async () => {
        await expect(expandQuery('test', { maxTerms: 0 })).rejects.toThrow(
          'maxTerms must be between 1 and 10'
        );
        await expect(expandQuery('test', { maxTerms: 11 })).rejects.toThrow(
          'maxTerms must be between 1 and 10'
        );
      });

      it('should throw error for invalid temperature', async () => {
        await expect(expandQuery('test', { temperature: -0.1 })).rejects.toThrow(
          'temperature must be between 0 and 1'
        );
        await expect(expandQuery('test', { temperature: 1.5 })).rejects.toThrow(
          'temperature must be between 0 and 1'
        );
      });
    });

    describe('local synonym expansion', () => {
      it('should expand using local synonyms for "cheap mushrooms"', async () => {
        const result = await expandQuery('cheap mushrooms', { maxTerms: 3 });

        expect(result.expandedTerms).toContain('cheap mushrooms');
        expect(result.expandedTerms.length).toBeGreaterThan(1);
        expect(result.expandedTerms.length).toBeLessThanOrEqual(4); // original + 3 max
        expect(result.model).toBe('local-synonyms');
        expect(result.originalQuery).toBe('cheap mushrooms');
        
        // Should contain synonym variations
        const hasAffordable = result.expandedTerms.some(t => t.includes('affordable'));
        const hasBudget = result.expandedTerms.some(t => t.includes('budget'));
        expect(hasAffordable || hasBudget).toBe(true);
      });

      it('should expand using local synonyms for "shiitake"', async () => {
        const result = await expandQuery('shiitake', { maxTerms: 3 });

        expect(result.expandedTerms).toContain('shiitake');
        expect(result.expandedTerms.length).toBeGreaterThan(1);
        expect(result.model).toBe('local-synonyms');
        
        // Should contain mushroom type synonyms
        const variations = result.expandedTerms.join(' ');
        expect(
          variations.includes('lentinula edodes') ||
          variations.includes('black mushroom') ||
          variations.includes('forest mushroom')
        ).toBe(true);
      });

      it('should expand "organic oyster" with multiple synonym matches', async () => {
        const result = await expandQuery('organic oyster', { maxTerms: 5 });

        expect(result.expandedTerms).toContain('organic oyster');
        expect(result.model).toBe('local-synonyms');
        
        // Should have variations for both "organic" and "oyster"
        const hasOrganicVariation = result.expandedTerms.some(
          t => t.includes('natural') || t.includes('pesticide-free')
        );
        const hasOysterVariation = result.expandedTerms.some(
          t => t.includes('pleurotus') || t.includes('pearl')
        );
        
        expect(hasOrganicVariation || hasOysterVariation).toBe(true);
      });

      it('should respect maxTerms limit', async () => {
        const result = await expandQuery('cheap mushrooms', { maxTerms: 2 });

        expect(result.expandedTerms.length).toBeLessThanOrEqual(3); // original + 2 max
      });

      it('should not include original query when includeOriginal=false', async () => {
        const result = await expandQuery('cheap mushrooms', {
          maxTerms: 3,
          includeOriginal: false,
        });

        expect(result.expandedTerms).not.toContain('cheap mushrooms');
        expect(result.originalQuery).toBe('cheap mushrooms');
      });
    });

    describe('Gemini AI expansion', () => {
      it('should fall back to Gemini for unknown terms', async () => {
        const mockResponse = {
          content: 'exotic fungi, rare mushrooms, specialty varieties',
          model: 'gemini-flash',
          timestamp: new Date(),
        };

        (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

        const result = await expandQuery('rare exotic mushrooms', { maxTerms: 3 });

        expect(result.expandedTerms).toContain('rare exotic mushrooms');
        expect(result.model).toBe('gemini-flash');
        expect(geminiClient.generateResponse).toHaveBeenCalledTimes(1);
        expect(geminiClient.generateResponse).toHaveBeenCalledWith(
          expect.stringContaining('rare exotic mushrooms'),
          [],
          expect.objectContaining({ temperature: expect.any(Number) })
        );
      });

      it('should parse Gemini response correctly', async () => {
        const mockResponse = {
          content: 'budget shiitake, affordable shiitake, inexpensive shiitake',
          model: 'gemini-flash',
          timestamp: new Date(),
        };

        (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

        // Use a completely unknown term without local synonyms
        const result = await expandQuery('mystical rare fungus', { maxTerms: 3 });

        expect(result.expandedTerms).toContain('mystical rare fungus');
        expect(result.expandedTerms).toContain('budget shiitake');
        expect(result.expandedTerms).toContain('affordable shiitake');
        expect(result.expandedTerms).toContain('inexpensive shiitake');
      });

      it('should handle Gemini API errors gracefully', async () => {
        (geminiClient.generateResponse as jest.Mock).mockRejectedValue(
          new Error('API rate limit exceeded')
        );

        const result = await expandQuery('test query', { maxTerms: 3 });

        // Should fall back to original query only
        expect(result.expandedTerms).toEqual(['test query']);
        expect(result.model).toBe('gemini-flash');
      });

      it('should respect custom temperature parameter', async () => {
        const mockResponse = {
          content: 'term1, term2, term3',
          model: 'gemini-flash',
          timestamp: new Date(),
        };

        (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

        await expandQuery('test', { maxTerms: 3, temperature: 0.8 });

        expect(geminiClient.generateResponse).toHaveBeenCalledWith(
          expect.any(String),
          [],
          expect.objectContaining({ temperature: 0.8 })
        );
      });

      it('should filter out duplicate terms (case-insensitive)', async () => {
        const mockResponse = {
          content: 'Cheap Mushrooms, cheap mushrooms, CHEAP MUSHROOMS, budget mushrooms',
          model: 'gemini-flash',
          timestamp: new Date(),
        };

        (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

        const result = await expandQuery('cheap mushrooms', { maxTerms: 5 });

        // Should not have duplicates of original query
        const originalCount = result.expandedTerms.filter(
          t => t.toLowerCase() === 'cheap mushrooms'
        ).length;
        expect(originalCount).toBe(1);
      });
    });

    describe('caching', () => {
      it('should cache expansion results', async () => {
        const result1 = await expandQuery('fresh shiitake', { maxTerms: 3 });
        const result2 = await expandQuery('fresh shiitake', { maxTerms: 3 });

        expect(result1.expandedTerms).toEqual(result2.expandedTerms);
        
        // Second call should use cache (model = 'cached')
        expect(result2.model).toBe('cached');
      });

      it('should respect useCache=false option', async () => {
        const mockResponse = {
          content: 'term1, term2, term3',
          model: 'gemini-flash',
          timestamp: new Date(),
        };

        (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

        // First call (no cache)
        await expandQuery('unknown term', { maxTerms: 3, useCache: false });
        
        // Second call (should not use cache)
        const result = await expandQuery('unknown term', { maxTerms: 3, useCache: false });

        expect(result.model).not.toBe('cached');
      });

      it('should cache case-insensitively', async () => {
        const result1 = await expandQuery('Cheap Mushrooms', { maxTerms: 3 });
        const result2 = await expandQuery('cheap mushrooms', { maxTerms: 3 });
        const result3 = await expandQuery('CHEAP MUSHROOMS', { maxTerms: 3 });

        expect(result2.model).toBe('cached');
        expect(result3.model).toBe('cached');
        expect(result1.expandedTerms).toEqual(result2.expandedTerms);
        expect(result2.expandedTerms).toEqual(result3.expandedTerms);
      });

      it('should handle cache statistics', async () => {
        clearCache();
        
        let stats = getCacheStats();
        expect(stats.size).toBe(0);
        expect(stats.oldestEntry).toBeNull();
        expect(stats.newestEntry).toBeNull();

        await expandQuery('cheap mushrooms', { maxTerms: 3 });
        await expandQuery('organic shiitake', { maxTerms: 3 });

        stats = getCacheStats();
        expect(stats.size).toBeGreaterThanOrEqual(1);
        expect(stats.oldestEntry).toBeInstanceOf(Date);
        expect(stats.newestEntry).toBeInstanceOf(Date);
      });

      it('should clear cache', async () => {
        await expandQuery('fresh shiitake', { maxTerms: 3 });
        
        expect(getCacheStats().size).toBeGreaterThan(0);
        
        clearCache();
        
        expect(getCacheStats().size).toBe(0);
      });
    });
  });

  describe('batchExpandQueries', () => {
    it('should expand multiple queries in parallel', async () => {
      const queries = ['cheap mushrooms', 'organic shiitake', 'fresh oyster'];
      const results = await batchExpandQueries(queries, { maxTerms: 3 });

      expect(results).toHaveLength(3);
      expect(results[0].originalQuery).toBe('cheap mushrooms');
      expect(results[1].originalQuery).toBe('organic shiitake');
      expect(results[2].originalQuery).toBe('fresh oyster');
      
      results.forEach(result => {
        expect(result.expandedTerms.length).toBeGreaterThan(0);
      });
    });

    it('should throw error for empty array', async () => {
      await expect(batchExpandQueries([])).rejects.toThrow(
        'queries must be a non-empty array'
      );
    });

    it('should throw error for non-array input', async () => {
      await expect(batchExpandQueries(null as any)).rejects.toThrow(
        'queries must be a non-empty array'
      );
    });

    it('should respect shared options', async () => {
      const queries = ['cheap mushrooms', 'organic shiitake'];
      const results = await batchExpandQueries(queries, {
        maxTerms: 2,
        includeOriginal: false,
      });

      results.forEach(result => {
        expect(result.expandedTerms).not.toContain(result.originalQuery);
        expect(result.expandedTerms.length).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle query with extra whitespace', async () => {
      // Only leading/trailing whitespace is trimmed, not internal spaces
      const result = await expandQuery('  cheap   mushrooms  ', { maxTerms: 3 });

      expect(result.originalQuery).toBe('cheap   mushrooms');
      expect(result.expandedTerms.length).toBeGreaterThan(0);
    });

    it('should handle single-word queries', async () => {
      const result = await expandQuery('shiitake', { maxTerms: 3 });

      expect(result.expandedTerms).toContain('shiitake');
      expect(result.expandedTerms.length).toBeGreaterThan(1);
    });

    it('should handle queries with special characters', async () => {
      const mockResponse = {
        content: 'ganoderma mushroom, spirit mushroom, reishi variety',
        model: 'gemini-flash',
        timestamp: new Date(),
      };

      (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      const result = await expandQuery('reishi (lingzhi)', { maxTerms: 3 });

      expect(result.originalQuery).toBe('reishi (lingzhi)');
      expect(result.expandedTerms).toContain('reishi (lingzhi)');
    });

    it('should handle very long queries', async () => {
      const longQuery = 'looking for affordable organic fresh shiitake mushrooms for cooking soup recipes';
      const result = await expandQuery(longQuery, { maxTerms: 5 });

      expect(result.originalQuery).toBe(longQuery);
      expect(result.expandedTerms.length).toBeGreaterThan(0);
    });
  });

  describe('integration scenarios', () => {
    it('should work end-to-end with local synonyms', async () => {
      // User searches for "cheap mushrooms"
      const result = await expandQuery('cheap mushrooms', { maxTerms: 4 });

      // Should expand to related terms
      expect(result.expandedTerms).toContain('cheap mushrooms');
      expect(result.expandedTerms.length).toBeGreaterThan(1);
      expect(result.model).toBe('local-synonyms');
      
      // Expanded terms should be useful for search
      const hasUsefulTerm = result.expandedTerms.some(
        t => t.includes('affordable') || t.includes('budget') || t.includes('inexpensive')
      );
      expect(hasUsefulTerm).toBe(true);
    });

    it('should work end-to-end with Gemini fallback', async () => {
      const mockResponse = {
        content: 'rare fungi, specialty mushrooms, gourmet varieties',
        model: 'gemini-flash',
        timestamp: new Date(),
      };

      (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      // User searches for unknown term
      const result = await expandQuery('rare delicacy mushrooms', { maxTerms: 3 });

      // Should use Gemini for expansion
      expect(result.model).toBe('gemini-flash');
      expect(result.expandedTerms).toContain('rare delicacy mushrooms');
      expect(result.expandedTerms.length).toBeGreaterThan(1);
    });
  });
});
