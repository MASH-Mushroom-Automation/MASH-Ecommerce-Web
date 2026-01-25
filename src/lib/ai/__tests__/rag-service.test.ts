/**
 * Unit Tests for RAG Service
 * 
 * Tests complete RAG pipeline for product card embedding.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 3, Task 3.4
 */

import {
  needsProductSearch,
  smartRAGSearch,
  ragSearch,
  getRecipeRecommendations,
  getGrowerProducts,
  getCategoryProducts,
  getFeaturedProducts,
} from '../rag-service';
import * as sanityRag from '../sanity-rag';
import * as geminiClient from '../gemini-client';
import * as errorHandler from '../error-handler';
import type { RAGProduct } from '../sanity-rag';
import type { AIResponse } from '@/types/chatbot';

// Mock next-sanity to avoid import issues
jest.mock('next-sanity', () => ({
  createClient: jest.fn(),
  groq: (strings: TemplateStringsArray) => strings[0],
}));

// Mock dependencies
jest.mock('../sanity-rag');
jest.mock('../gemini-client');
jest.mock('../error-handler');

const mockProducts: RAGProduct[] = [
  {
    _id: '1',
    name: 'Fresh Oyster Mushrooms',
    slug: 'oyster',
    description: 'Great for stir-fry',
    price: 150,
    image: 'img1.jpg',
    category: 'Oyster',
    inStock: true,
    grower: { name: 'Farm A', id: 'g1' },
    tags: ['fresh'],
    benefits: ['protein'],
  },
  {
    _id: '2',
    name: 'Shiitake Kit',
    slug: 'shiitake-kit',
    description: 'Grow at home',
    price: 500,
    image: 'img2.jpg',
    category: 'Kits',
    inStock: true,
    tags: ['diy'],
  },
];

const mockAIResponse: AIResponse = {
  content: 'Here are some mushrooms',
  timestamp: new Date().toISOString(),
  processingTime: 100,
};

describe('RAG Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Sanity data fetch
    (sanityRag.getAllRAGData as jest.Mock).mockResolvedValue({
      products: mockProducts,
      categories: [],
      recipes: [],
      growers: [],
    });
    
    // Mock Gemini response
    (geminiClient.generateResponse as jest.Mock).mockResolvedValue(mockAIResponse);
    
    // Mock error handler
    (errorHandler.handleWithFallback as jest.Mock).mockImplementation(
      (response) => Promise.resolve(response)
    );
  });

  describe('needsProductSearch', () => {
    it('should detect product-related queries', () => {
      expect(needsProductSearch('show me oyster mushrooms')).toBe(true);
      expect(needsProductSearch('what recipe can I make')).toBe(true);
      expect(needsProductSearch('buy shiitake')).toBe(true);
    });

    it('should not detect general queries', () => {
      expect(needsProductSearch('hello')).toBe(false);
      expect(needsProductSearch('thank you')).toBe(false);
    });
  });

  describe('ragSearch', () => {
    it('should perform complete RAG pipeline', async () => {
      const response = await ragSearch('oyster mushrooms', []);
      
      expect(sanityRag.getAllRAGData).toHaveBeenCalled();
      expect(geminiClient.generateResponse).toHaveBeenCalled();
      expect(response.productCards).toBeDefined();
      expect(response.productCards!.length).toBeGreaterThan(0);
    });

    it('should include search results', async () => {
      const response = await ragSearch('oyster', []);
      expect(response.searchResults).toBeDefined();
    });

    it('should include context text', async () => {
      const response = await ragSearch('mushrooms', []);
      expect(response.context).toBeDefined();
      expect(response.context).toContain('RELEVANT PRODUCTS');
    });

    it('should filter out-of-stock by default', async () => {
      const productsWithOutOfStock = [
        ...mockProducts,
        { ...mockProducts[0], _id: '3', inStock: false },
      ];
      
      (sanityRag.getAllRAGData as jest.Mock).mockResolvedValue({
        products: productsWithOutOfStock,
        categories: [],
        recipes: [],
        growers: [],
      });
      
      const response = await ragSearch('mushroom', [], {
        includeOutOfStock: false,
      });
      
      expect(response.productCards?.every((p) => p.inStock)).toBe(true);
    });

    it('should handle no products available', async () => {
      (sanityRag.getAllRAGData as jest.Mock).mockResolvedValue({
        products: [],
        categories: [],
        recipes: [],
        growers: [],
      });
      
      const response = await ragSearch('oyster', []);
      expect(response.content).toContain('couldn\'t load product data');
    });

    it('should handle errors gracefully', async () => {
      (sanityRag.getAllRAGData as jest.Mock).mockRejectedValue(
        new Error('Sanity error')
      );
      
      const response = await ragSearch('mushroom', []);
      expect(response.content).toBeDefined();
    });
  });

  describe('smartRAGSearch', () => {
    it('should use RAG for product queries', async () => {
      const response = await smartRAGSearch('show me oyster mushrooms', []);
      expect(response.productCards).toBeDefined();
      expect(sanityRag.getAllRAGData).toHaveBeenCalled();
    });

    it('should use regular AI for general queries', async () => {
      const response = await smartRAGSearch('hello', []);
      expect(response.productCards).toEqual([]);
      expect(geminiClient.generateResponse).toHaveBeenCalled();
    });
  });

  describe('getRecipeRecommendations', () => {
    it('should get products for recipe', async () => {
      const response = await getRecipeRecommendations('beef pepper garlic');
      
      expect(response.productCards).toBeDefined();
      expect(sanityRag.getAllRAGData).toHaveBeenCalled();
    });

    it('should limit results to 3 products', async () => {
      const response = await getRecipeRecommendations('stir-fry');
      expect(response.productCards!.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getGrowerProducts', () => {
    it('should filter products by grower', async () => {
      const response = await getGrowerProducts('Farm A');
      
      expect(response.productCards).toBeDefined();
      expect(response.productCards!.every(
        (p) => p.grower?.name === 'Farm A'
      )).toBe(true);
    });

    it('should be case-insensitive', async () => {
      const response = await getGrowerProducts('farm a');
      expect(response.productCards!.length).toBeGreaterThan(0);
    });

    it('should return empty for non-existent grower', async () => {
      const response = await getGrowerProducts('Nonexistent Farm');
      expect(response.productCards).toEqual([]);
    });
  });

  describe('getCategoryProducts', () => {
    it('should get products by category', async () => {
      const response = await getCategoryProducts('Oyster');
      
      expect(response.productCards).toBeDefined();
      expect(sanityRag.getAllRAGData).toHaveBeenCalled();
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return in-stock products', async () => {
      const response = await getFeaturedProducts();
      
      expect(response.productCards).toBeDefined();
      expect(response.productCards!.every((p) => p.inStock)).toBe(true);
    });

    it('should limit to 5 products', async () => {
      const manyProducts = Array(10).fill(mockProducts[0]).map((p, i) => ({
        ...p,
        _id: `${i}`,
      }));
      
      (sanityRag.getAllRAGData as jest.Mock).mockResolvedValue({
        products: manyProducts,
        categories: [],
        recipes: [],
        growers: [],
      });
      
      const response = await getFeaturedProducts();
      expect(response.productCards!.length).toBeLessThanOrEqual(5);
    });
  });
});
