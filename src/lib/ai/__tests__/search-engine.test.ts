/**
 * Unit Tests for TF-IDF Search Engine
 * 
 * Tests product search functionality using TF-IDF algorithm.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 3, Task 3.2
 */

import {
  preprocessText,
  calculateTF,
  calculateIDF,
  calculateTFIDF,
  buildProductDocument,
  searchProducts,
  findProductsByCategory,
  findProductsByGrower,
  filterInStock,
  hybridSearch,
  getSearchStats,
} from '../search-engine';
import type { RAGProduct } from '../sanity-rag';

// Mock products for testing
const mockProducts: RAGProduct[] = [
  {
    _id: '1',
    name: 'Fresh Oyster Mushrooms',
    slug: 'fresh-oyster-mushrooms',
    description: 'Perfect for stir-fry dishes and soups. Rich umami flavor.',
    price: 150,
    image: 'https://example.com/oyster.jpg',
    category: 'Oyster Mushrooms',
    inStock: true,
    grower: { name: 'Urban Fungi Farm', id: 'grower-1' },
    tags: ['fresh', 'organic', 'local'],
    benefits: ['high protein', 'vitamin D', 'antioxidants'],
  },
  {
    _id: '2',
    name: 'King Oyster Mushrooms',
    slug: 'king-oyster-mushrooms',
    description: 'Meaty texture, great for grilling and roasting. Versatile ingredient.',
    price: 200,
    image: 'https://example.com/king.jpg',
    category: 'King Oyster',
    inStock: true,
    grower: { name: 'Mushroom Masters', id: 'grower-2' },
    tags: ['premium', 'meaty', 'gourmet'],
    benefits: ['fiber', 'minerals', 'immune support'],
  },
  {
    _id: '3',
    name: 'Shiitake Mushroom Kit',
    slug: 'shiitake-kit',
    description: 'Grow your own shiitake at home. Easy to use kit.',
    price: 500,
    image: 'https://example.com/shiitake.jpg',
    category: 'Growing Kits',
    inStock: false,
    tags: ['diy', 'kit', 'shiitake'],
  },
  {
    _id: '4',
    name: 'Dried Shiitake Mushrooms',
    slug: 'dried-shiitake',
    description: 'Premium dried shiitake for soups and stocks. Intense flavor.',
    price: 300,
    image: 'https://example.com/dried.jpg',
    category: 'Dried Mushrooms',
    inStock: true,
    grower: { name: 'Urban Fungi Farm', id: 'grower-1' },
    tags: ['dried', 'shiitake', 'long-shelf-life'],
    benefits: ['immune boost', 'vitamin B'],
  },
];

describe('TF-IDF Search Engine', () => {
  describe('preprocessText', () => {
    it('should lowercase and split text', () => {
      const result = preprocessText('Fresh Oyster Mushrooms');
      expect(result).toEqual(['fresh', 'oyster', 'mushrooms']);
    });

    it('should remove punctuation', () => {
      const result = preprocessText('Hello, world! How are you?');
      expect(result).toContain('hello');
      expect(result).toContain('world');
      expect(result).not.toContain(',');
    });

    it('should remove stop words', () => {
      const result = preprocessText('the quick brown fox');
      expect(result).not.toContain('the');
      expect(result).toContain('quick');
      expect(result).toContain('brown');
    });

    it('should remove short words (< 3 chars)', () => {
      const result = preprocessText('a big red car');
      expect(result).not.toContain('a');
      expect(result).toContain('big');
      expect(result).toContain('red');
      expect(result).toContain('car');
    });
  });

  describe('calculateTF', () => {
    it('should calculate term frequency correctly', () => {
      const document = ['mushroom', 'fresh', 'mushroom', 'organic'];
      const tf = calculateTF('mushroom', document);
      expect(tf).toBe(0.5); // 2 occurrences / 4 total words
    });

    it('should return 0 for term not in document', () => {
      const document = ['mushroom', 'fresh'];
      const tf = calculateTF('oyster', document);
      expect(tf).toBe(0);
    });

    it('should return 0 for empty document', () => {
      const tf = calculateTF('mushroom', []);
      expect(tf).toBe(0);
    });
  });

  describe('calculateIDF', () => {
    it('should calculate inverse document frequency', () => {
      const documents = [
        ['mushroom', 'fresh'],
        ['mushroom', 'dried'],
        ['oyster', 'premium'],
      ];
      const idf = calculateIDF('mushroom', documents);
      // IDF = log(3 / 2) ≈ 0.405
      expect(idf).toBeCloseTo(0.405, 2);
    });

    it('should return 0 for term in all documents', () => {
      const documents = [
        ['mushroom'],
        ['mushroom'],
      ];
      const idf = calculateIDF('mushroom', documents);
      expect(idf).toBe(0);
    });

    it('should return 0 for term not in any document', () => {
      const documents = [
        ['oyster'],
        ['shiitake'],
      ];
      const idf = calculateIDF('enoki', documents);
      expect(idf).toBe(0);
    });
  });

  describe('calculateTFIDF', () => {
    it('should calculate TF-IDF score', () => {
      const document = ['mushroom', 'fresh', 'mushroom'];
      const allDocuments = [
        document,
        ['oyster', 'premium'],
        ['mushroom', 'dried'],
      ];
      const tfidf = calculateTFIDF('mushroom', document, allDocuments);
      // TF = 2/3 ≈ 0.667, IDF = log(3/2) ≈ 0.405
      // TF-IDF ≈ 0.270
      expect(tfidf).toBeGreaterThan(0);
      expect(tfidf).toBeLessThan(1);
    });
  });

  describe('buildProductDocument', () => {
    it('should extract and preprocess all fields', () => {
      const doc = buildProductDocument(mockProducts[0]);
      expect(doc.name).toContain('fresh');
      expect(doc.name).toContain('oyster');
      expect(doc.description).toContain('perfect');
      expect(doc.tags).toContain('fresh');
      expect(doc.category).toContain('oyster');
    });

    it('should boost name field by default', () => {
      const doc = buildProductDocument(mockProducts[0], { boostName: 3 });
      const nameCount = doc.combined.filter((w) => w === 'oyster').length;
      expect(nameCount).toBeGreaterThanOrEqual(3); // Boosted 3x
    });

    it('should handle products without optional fields', () => {
      const doc = buildProductDocument(mockProducts[2]); // No grower
      expect(doc.grower).toEqual([]);
      expect(doc.combined.length).toBeGreaterThan(0);
    });
  });

  describe('searchProducts', () => {
    it('should find relevant products for query', () => {
      const results = searchProducts('oyster mushrooms', mockProducts);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].product.name).toContain('Oyster');
    });

    it('should return top N results', () => {
      const results = searchProducts('mushroom', mockProducts, { maxResults: 2 });
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should sort by relevance score', () => {
      const results = searchProducts('oyster mushroom', mockProducts);
      if (results.length > 1) {
        expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
      }
    });

    it('should track matched fields', () => {
      const results = searchProducts('oyster', mockProducts);
      expect(results[0].matchedFields).toContain('name');
    });

    it('should return empty array for no matches', () => {
      const results = searchProducts('xyzabc', mockProducts);
      expect(results).toEqual([]);
    });

    it('should handle empty query', () => {
      const results = searchProducts('', mockProducts);
      expect(results).toEqual([]);
    });

    it('should handle empty products array', () => {
      const results = searchProducts('oyster', []);
      expect(results).toEqual([]);
    });

    it('should filter by minimum score', () => {
      const results = searchProducts('mushroom', mockProducts, { minScore: 1.0 });
      // High min score should filter out low-relevance results
      expect(results.length).toBeLessThan(mockProducts.length);
    });
  });

  describe('findProductsByCategory', () => {
    it('should find products by exact category', () => {
      const results = findProductsByCategory('Oyster', mockProducts);
      expect(results.length).toBe(2);
      expect(results[0].category).toContain('Oyster');
    });

    it('should be case-insensitive', () => {
      const results = findProductsByCategory('oyster', mockProducts);
      expect(results.length).toBe(2);
    });

    it('should respect maxResults', () => {
      const results = findProductsByCategory('Oyster', mockProducts, 1);
      expect(results.length).toBe(1);
    });
  });

  describe('findProductsByGrower', () => {
    it('should find products by grower name', () => {
      const results = findProductsByGrower('Urban Fungi', mockProducts);
      expect(results.length).toBe(2);
      expect(results[0].grower?.name).toContain('Urban Fungi');
    });

    it('should handle products without grower', () => {
      const results = findProductsByGrower('Nonexistent', mockProducts);
      expect(results).toEqual([]);
    });
  });

  describe('filterInStock', () => {
    it('should filter to only in-stock products', () => {
      const allResults = searchProducts('mushroom', mockProducts);
      const inStockResults = filterInStock(allResults);
      expect(inStockResults.every((r) => r.product.inStock)).toBe(true);
    });
  });

  describe('hybridSearch', () => {
    it('should combine multiple search strategies', () => {
      const results = hybridSearch('oyster mushrooms', mockProducts);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].product.name).toContain('Oyster');
    });

    it('should boost products for recipe queries', () => {
      const results = hybridSearch('recipe with mushrooms', mockProducts);
      // Products with benefits should be boosted
      expect(results.length).toBeGreaterThan(0);
    });

    it('should detect category keywords', () => {
      const results = hybridSearch('shiitake for cooking', mockProducts);
      expect(results.some((r) => r.product.name.includes('Shiitake'))).toBe(true);
    });
  });

  describe('getSearchStats', () => {
    it('should calculate statistics for results', () => {
      const results = searchProducts('oyster mushroom', mockProducts);
      const stats = getSearchStats(results);
      
      expect(stats.totalResults).toBe(results.length);
      expect(stats.avgScore).toBeGreaterThan(0);
      expect(stats.maxScore).toBeGreaterThanOrEqual(stats.avgScore);
      expect(stats.matchedFields.length).toBeGreaterThan(0);
    });

    it('should handle empty results', () => {
      const stats = getSearchStats([]);
      expect(stats.totalResults).toBe(0);
      expect(stats.avgScore).toBe(0);
    });
  });
});
