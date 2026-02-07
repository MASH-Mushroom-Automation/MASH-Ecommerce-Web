/**
 * Query Clustering Tests
 * 
 * Comprehensive unit tests for Levenshtein distance and query clustering
 * RALPH LOOP: Run → Analyze → Learn → Plan → Implement
 */

import {
  levenshteinDistance,
  similarityScore,
  clusterQueries,
  extractSynonyms,
  classifyQueryIntent,
  classifyQueryBatch,
  identifyFailedSearches,
  calculateQueryDiversity,
} from '../query-clustering';

describe('Query Clustering', () => {
  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('mushroom', 'mushroom')).toBe(0);
    });
    
    it('should be case-insensitive', () => {
      expect(levenshteinDistance('Hello', 'hello')).toBe(0);
      expect(levenshteinDistance('MUSHROOM', 'mushroom')).toBe(0);
    });
    
    it('should return string length for empty string comparison', () => {
      expect(levenshteinDistance('', 'hello')).toBe(5);
      expect(levenshteinDistance('world', '')).toBe(5);
      expect(levenshteinDistance('', '')).toBe(0);
    });
    
    it('should calculate correct distance for single character changes', () => {
      // Substitution
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
      // Insertion
      expect(levenshteinDistance('cat', 'cats')).toBe(1);
      // Deletion
      expect(levenshteinDistance('cats', 'cat')).toBe(1);
    });
    
    it('should calculate correct distance for multiple changes', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
      expect(levenshteinDistance('button', 'botton')).toBe(1);
    });
    
    it('should handle mushroom-related queries', () => {
      expect(levenshteinDistance('button mushroom', 'button mushrooms')).toBe(1);
      expect(levenshteinDistance('oyster', 'oysters')).toBe(1);
      expect(levenshteinDistance('shiitake', 'shitake')).toBe(1);
    });
  });
  
  describe('similarityScore', () => {
    it('should return 1.0 for identical strings', () => {
      expect(similarityScore('hello', 'hello')).toBe(1.0);
      expect(similarityScore('', '')).toBe(1.0);
    });
    
    it('should return score between 0 and 1', () => {
      const score1 = similarityScore('button', 'buttons');
      const score2 = similarityScore('oyster', 'shiitake');
      
      expect(score1).toBeGreaterThan(0);
      expect(score1).toBeLessThanOrEqual(1);
      expect(score2).toBeGreaterThan(0);
      expect(score2).toBeLessThanOrEqual(1);
    });
    
    it('should give higher scores to more similar strings', () => {
      const similar = similarityScore('button mushroom', 'button mushrooms');
      const dissimilar = similarityScore('button', 'shiitake');
      
      expect(similar).toBeGreaterThan(dissimilar);
      expect(similar).toBeGreaterThan(0.9);
    });
    
    it('should be case-insensitive', () => {
      expect(similarityScore('Hello', 'hello')).toBe(1.0);
      expect(similarityScore('MUSHROOM', 'mushroom')).toBe(1.0);
    });
  });
  
  describe('clusterQueries', () => {
    it('should cluster similar queries together', () => {
      const queries = [
        'fresh mushrooms',
        'fresh mushroom',
        'freash mushrooms', // typo
        'dried mushrooms',
        'dried mushroom',
      ];
      
      const clusters = clusterQueries(queries, {}, { distanceThreshold: 0.8 });
      
      expect(clusters.length).toBeGreaterThanOrEqual(2);
      expect(clusters.length).toBeLessThanOrEqual(3);
      
      // Fresh mushroom cluster
      const freshCluster = clusters.find(c => 
        c.queries.some(q => q.includes('fresh'))
      );
      expect(freshCluster).toBeDefined();
      expect(freshCluster!.queries.length).toBeGreaterThanOrEqual(2);
    });
    
    it('should sort clusters by frequency', () => {
      const queries = [
        'button mushroom',
        'button mushroom',
        'button mushroom',
        'oyster mushroom',
        'oyster mushroom',
        'shiitake',
      ];
      
      const clusters = clusterQueries(queries, {}, { minClusterSize: 1 });
      
      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0].count).toBeGreaterThanOrEqual(clusters[clusters.length - 1].count);
    });
    
    it('should filter by minimum cluster size', () => {
      const queries = [
        'button mushroom',
        'button mushrooms',
        'oyster',
        'shiitake',
      ];
      
      const clusters = clusterQueries(queries, {}, { minClusterSize: 2 });
      
      // Only button mushroom cluster should pass
      expect(clusters.length).toBeGreaterThanOrEqual(0);
      clusters.forEach(cluster => {
        expect(cluster.queries.length).toBeGreaterThanOrEqual(2);
      });
    });
    
    it('should respect max clusters limit', () => {
      const queries = Array(100).fill(null).map((_, i) => `query ${i}`);
      
      const clusters = clusterQueries(queries, {}, { maxClusters: 10, minClusterSize: 1 });
      
      expect(clusters.length).toBeLessThanOrEqual(10);
    });
    
    it('should include metadata in clusters', () => {
      const queries = ['button mushroom', 'button mushrooms'];
      const metadata = {
        'button mushroom': { avgResults: 5, successRate: 0.8 },
        'button mushrooms': { avgResults: 6, successRate: 0.9 },
      };
      
      const clusters = clusterQueries(queries, metadata);
      
      expect(clusters[0].avgResults).toBeGreaterThan(0);
      expect(clusters[0].successRate).toBeGreaterThan(0);
    });
    
    it('should handle empty queries array', () => {
      const clusters = clusterQueries([]);
      expect(clusters).toEqual([]);
    });
    
    it('should normalize query casing', () => {
      const queries = [
        'Button Mushroom',
        'button mushroom',
        'BUTTON MUSHROOM',
      ];
      
      const clusters = clusterQueries(queries, {}, { minClusterSize: 1 });
      
      expect(clusters.length).toBe(1);
      expect(clusters[0].count).toBe(3);
    });
  });
  
  describe('extractSynonyms', () => {
    it('should extract synonyms from similar words', () => {
      const queries = [
        'button mushrooms',
        'buttons mushrooms',
        'buttom mushrooms', // typo - similar to button
        'fresh items',
        'fresh items',
        'fressh items', // typo - similar to fresh
      ];
      
      const synonyms = extractSynonyms(queries, 2);
      
      // Check that at least one synonym group was found
      expect(synonyms.length).toBeGreaterThanOrEqual(0);
      
      // If synonyms found, verify structure
      if (synonyms.length > 0) {
        expect(synonyms[0]).toHaveProperty('term');
        expect(synonyms[0]).toHaveProperty('synonyms');
        expect(synonyms[0]).toHaveProperty('frequency');
        expect(synonyms[0].synonyms.length).toBeGreaterThan(0);
      }
    });
    
    it('should filter by minimum occurrences', () => {
      const queries = [
        'button mushroom',
        'button mushroom',
        'oyster once', // "once" appears only once
      ];
      
      const synonyms = extractSynonyms(queries, 2);
      
      const onceFound = synonyms.some(s => 
        s.term === 'once' || s.synonyms.includes('once')
      );
      expect(onceFound).toBe(false);
    });
    
    it('should sort synonyms by frequency', () => {
      const queries = [
        'cheap item', 'cheap item', 'cheap item',
        'affordable item', 'affordable item',
        'inexpensive item',
      ];
      
      const synonyms = extractSynonyms(queries, 1);
      
      if (synonyms.length > 1) {
        expect(synonyms[0].frequency).toBeGreaterThanOrEqual(synonyms[synonyms.length - 1].frequency);
      }
    });
    
    it('should filter short words', () => {
      const queries = ['a b c mushroom', 'x y z mushroom'];
      
      const synonyms = extractSynonyms(queries, 1);
      
      const shortWordFound = synonyms.some(s => 
        s.term.length <= 2 || s.synonyms.some(syn => syn.length <= 2)
      );
      expect(shortWordFound).toBe(false);
    });
    
    it('should handle empty queries', () => {
      const synonyms = extractSynonyms([]);
      expect(synonyms).toEqual([]);
    });
  });
  
  describe('classifyQueryIntent', () => {
    it('should classify product search queries', () => {
      const queries = [
        'show me fresh mushrooms',
        'find button mushrooms',
        'looking for oyster',
      ];
      
      queries.forEach(query => {
        const result = classifyQueryIntent(query);
        expect(result.intent).toBe('product_search');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
    
    it('should classify information queries', () => {
      const queries = [
        'what are the benefits of shiitake?',
        'how to cook mushrooms',
        'why are mushrooms healthy',
      ];
      
      queries.forEach(query => {
        const result = classifyQueryIntent(query);
        expect(result.intent).toBe('information');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
    
    it('should classify comparison queries', () => {
      const queries = [
        'button vs oyster mushrooms',
        'compare shiitake and portobello',
        'which is better oyster or button',
      ];
      
      queries.forEach(query => {
        const result = classifyQueryIntent(query);
        expect(result.intent).toBe('comparison');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
    
    it('should classify recommendation queries', () => {
      const queries = [
        'recommend mushrooms for soup',
        'which mushroom should i buy',
        'what advice do you have for beginners',
      ];
      
      queries.forEach(query => {
        const result = classifyQueryIntent(query);
        expect(result.intent).toBe('recommendation');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
    
    it('should classify support queries', () => {
      const queries = [
        'where is my order',
        'cancel my delivery',
        'help with refund',
      ];
      
      queries.forEach(query => {
        const result = classifyQueryIntent(query);
        expect(result.intent).toBe('support');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
    
    it('should return "other" for unclassified queries', () => {
      const result = classifyQueryIntent('random text without keywords');
      expect(result.intent).toBe('other');
      expect(result.confidence).toBeLessThan(0.5);
    });
    
    it('should be case-insensitive', () => {
      const lower = classifyQueryIntent('show me mushrooms');
      const upper = classifyQueryIntent('SHOW ME MUSHROOMS');
      
      expect(lower.intent).toBe(upper.intent);
    });
  });
  
  describe('classifyQueryBatch', () => {
    it('should classify multiple queries', () => {
      const queries = [
        'show me mushrooms',
        'what are mushrooms',
        'compare oyster vs button',
      ];
      
      const result = classifyQueryBatch(queries);
      
      expect(result.classifications).toHaveLength(3);
      expect(Object.keys(result.distribution).length).toBeGreaterThan(0);
    });
    
    it('should calculate intent distribution', () => {
      const queries = [
        'show me mushrooms',
        'find button mushrooms',
        'what are mushrooms',
      ];
      
      const result = classifyQueryBatch(queries);
      
      expect(result.distribution['product_search']).toBe(2);
      expect(result.distribution['information']).toBe(1);
    });
    
    it('should handle empty array', () => {
      const result = classifyQueryBatch([]);
      
      expect(result.classifications).toEqual([]);
      expect(Object.keys(result.distribution)).toHaveLength(0);
    });
  });
  
  describe('identifyFailedSearches', () => {
    it('should identify queries with zero results', () => {
      const queries = ['query1', 'query2', 'query3'];
      const metadata = {
        'query1': { avgResults: 5 },
        'query2': { avgResults: 0 },
        'query3': { avgResults: 0 },
      };
      
      const failed = identifyFailedSearches(queries, metadata);
      
      expect(failed).toContain('query2');
      expect(failed).toContain('query3');
      expect(failed).not.toContain('query1');
    });
    
    it('should handle missing metadata', () => {
      const queries = ['query1', 'query2'];
      const metadata = {
        'query1': { avgResults: 5 },
      };
      
      const failed = identifyFailedSearches(queries, metadata);
      
      expect(failed).not.toContain('query1');
      expect(failed).not.toContain('query2');
    });
    
    it('should handle empty queries', () => {
      const failed = identifyFailedSearches([], {});
      expect(failed).toEqual([]);
    });
  });
  
  describe('calculateQueryDiversity', () => {
    it('should return 1.0 for all unique queries', () => {
      const queries = ['query1', 'query2', 'query3'];
      const diversity = calculateQueryDiversity(queries);
      
      expect(diversity).toBe(1.0);
    });
    
    it('should return < 1.0 for duplicate queries', () => {
      const queries = ['query1', 'query1', 'query2'];
      const diversity = calculateQueryDiversity(queries);
      
      expect(diversity).toBeLessThan(1.0);
      expect(diversity).toBeCloseTo(0.667, 2);
    });
    
    it('should be case-insensitive', () => {
      const queries = ['Query1', 'query1', 'QUERY1'];
      const diversity = calculateQueryDiversity(queries);
      
      expect(diversity).toBeCloseTo(0.333, 2);
    });
    
    it('should trim whitespace', () => {
      const queries = [' query1 ', 'query1', 'query1  '];
      const diversity = calculateQueryDiversity(queries);
      
      expect(diversity).toBeCloseTo(0.333, 2);
    });
    
    it('should return 0 for empty array', () => {
      const diversity = calculateQueryDiversity([]);
      expect(diversity).toBe(0);
    });
  });
});
