/**
 * Unit Tests for Context Builder
 * 
 * Tests context building for product card embedding.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 3, Task 3.3
 */

import {
  toProductCardData,
  buildTextContext,
  buildProductContext,
  generateProductLinks,
  createSummary,
  formatPrice,
  generateRecipeSuggestions,
  generateGrowerRecommendation,
  buildEnhancedContext,
  formatContextForPrompt,
} from '../context-builder';
import type { RAGProduct } from '../sanity-rag';
import type { SearchResult } from '../search-engine';

const mockProduct: RAGProduct = {
  _id: '1',
  name: 'Fresh Oyster Mushrooms',
  slug: 'fresh-oyster-mushrooms',
  description: 'Perfect for stir-fry',
  price: 150,
  image: 'https://example.com/oyster.jpg',
  category: 'Oyster Mushrooms',
  inStock: true,
  grower: { name: 'Urban Fungi', id: 'g1' },
  tags: ['fresh', 'organic'],
  benefits: ['protein', 'vitamins'],
};

const mockSearchResult: SearchResult = {
  product: mockProduct,
  score: 0.85,
  matchedFields: ['name', 'category'],
};

describe('Context Builder', () => {
  describe('toProductCardData', () => {
    it('should convert RAGProduct to ProductCardData', () => {
      const cardData = toProductCardData(mockProduct, 0.85, ['name']);
      
      expect(cardData.id).toBe('1');
      expect(cardData.name).toBe('Fresh Oyster Mushrooms');
      expect(cardData.relevanceScore).toBe(0.85);
      expect(cardData.matchedFields).toContain('name');
    });

    it('should handle default parameters', () => {
      const cardData = toProductCardData(mockProduct);
      expect(cardData.relevanceScore).toBe(0);
      expect(cardData.matchedFields).toEqual([]);
    });
  });

  describe('buildTextContext', () => {
    it('should build formatted text from results', () => {
      const text = buildTextContext([mockSearchResult]);
      
      expect(text).toContain('Fresh Oyster Mushrooms');
      expect(text).toContain('₱150');
      expect(text).toContain('Category: Oyster Mushrooms');
      expect(text).toContain('Seller: Urban Fungi');
      expect(text).toContain('✅ In Stock');
    });

    it('should show out of stock status', () => {
      const outOfStockResult = {
        ...mockSearchResult,
        product: { ...mockProduct, inStock: false },
      };
      const text = buildTextContext([outOfStockResult]);
      expect(text).toContain('❌ Out of Stock');
    });

    it('should handle empty results', () => {
      const text = buildTextContext([]);
      expect(text).toBe('No products found matching your query.');
    });

    it('should include benefits', () => {
      const text = buildTextContext([mockSearchResult]);
      expect(text).toContain('Benefits:');
      expect(text).toContain('protein');
    });
  });

  describe('buildProductContext', () => {
    it('should build complete product context', () => {
      const context = buildProductContext([mockSearchResult]);
      
      expect(context.products).toHaveLength(1);
      expect(context.totalProducts).toBe(1);
      expect(context.summary).toContain('Fresh Oyster Mushrooms');
    });

    it('should handle multiple products', () => {
      const results = [mockSearchResult, mockSearchResult];
      const context = buildProductContext(results);
      expect(context.totalProducts).toBe(2);
    });
  });

  describe('generateProductLinks', () => {
    it('should create markdown links', () => {
      const cardData = toProductCardData(mockProduct);
      const links = generateProductLinks([cardData]);
      
      expect(links[0]).toContain('[Fresh Oyster Mushrooms]');
      expect(links[0]).toContain('/products/fresh-oyster-mushrooms');
      expect(links[0]).toContain('₱150');
      expect(links[0]).toContain('✅');
    });

    it('should show out of stock icon', () => {
      const outOfStock = { ...mockProduct, inStock: false };
      const cardData = toProductCardData(outOfStock);
      const links = generateProductLinks([cardData]);
      expect(links[0]).toContain('❌');
    });
  });

  describe('createSummary', () => {
    it('should create summary for single product', () => {
      const summary = createSummary([mockSearchResult], 'oyster');
      expect(summary).toContain('Fresh Oyster Mushrooms');
      expect(summary).toContain('₱150');
      expect(summary).toContain('in stock');
    });

    it('should create summary for multiple products', () => {
      const results = [mockSearchResult, mockSearchResult];
      const summary = createSummary(results, 'mushrooms');
      expect(summary).toContain('2 products');
    });

    it('should handle no results', () => {
      const summary = createSummary([], 'xyz');
      expect(summary).toContain('couldn\'t find');
      expect(summary).toContain('xyz');
    });

    it('should mention in-stock count', () => {
      const results = [
        mockSearchResult,
        { ...mockSearchResult, product: { ...mockProduct, inStock: false } },
      ];
      const summary = createSummary(results, 'test');
      expect(summary).toContain('1 in stock');
    });
  });

  describe('formatPrice', () => {
    it('should format price with peso sign', () => {
      expect(formatPrice(150)).toBe('₱150');
      expect(formatPrice(1000)).toBe('₱1,000');
    });
  });

  describe('generateRecipeSuggestions', () => {
    it('should suggest recipes for oyster mushrooms', () => {
      const cardData = toProductCardData(mockProduct);
      const suggestions = generateRecipeSuggestions([cardData]);
      expect(suggestions).toContain('Sisig');
    });

    it('should handle products without specific recipes', () => {
      const generic = { ...mockProduct, name: 'Generic Mushroom' };
      const cardData = toProductCardData(generic);
      const suggestions = generateRecipeSuggestions([cardData]);
      expect(suggestions).toContain('versatile');
    });

    it('should return empty for no products', () => {
      const suggestions = generateRecipeSuggestions([]);
      expect(suggestions).toBe('');
    });
  });

  describe('generateGrowerRecommendation', () => {
    it('should create grower recommendation', () => {
      const cardData = toProductCardData(mockProduct);
      const recommendation = generateGrowerRecommendation([cardData]);
      expect(recommendation).toContain('Urban Fungi');
      expect(recommendation).toContain('trusted local grower');
    });

    it('should handle multiple growers', () => {
      const product2 = { ...mockProduct, grower: { name: 'Farm B', id: 'g2' } };
      const cards = [
        toProductCardData(mockProduct),
        toProductCardData(product2),
      ];
      const recommendation = generateGrowerRecommendation(cards);
      expect(recommendation).toContain('2 local growers');
    });

    it('should handle no growers', () => {
      const noGrower = { ...mockProduct, grower: undefined };
      const cardData = toProductCardData(noGrower);
      const recommendation = generateGrowerRecommendation([cardData]);
      expect(recommendation).toBe('');
    });
  });

  describe('buildEnhancedContext', () => {
    it('should build complete enhanced context', () => {
      const enhanced = buildEnhancedContext([mockSearchResult], 'oyster');
      
      expect(enhanced.productContext.totalProducts).toBe(1);
      expect(enhanced.summary).toContain('Fresh Oyster Mushrooms');
      expect(enhanced.recipeSuggestions).toContain('Sisig');
      expect(enhanced.growerInfo).toContain('Urban Fungi');
      expect(enhanced.links.length).toBeGreaterThan(0);
    });
  });

  describe('formatContextForPrompt', () => {
    it('should format context for AI prompt', () => {
      const enhanced = buildEnhancedContext([mockSearchResult], 'test');
      const formatted = formatContextForPrompt(enhanced);
      
      expect(formatted).toContain('=== RELEVANT PRODUCTS ===');
      expect(formatted).toContain('=== RECIPE IDEAS ===');
      expect(formatted).toContain('=== SELLER INFO ===');
      expect(formatted).toContain('=== QUICK LINKS ===');
      expect(formatted).toContain('Fresh Oyster Mushrooms');
    });
  });
});
