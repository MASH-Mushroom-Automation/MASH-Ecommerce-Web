/**
 * RAG Service - Retrieval-Augmented Generation
 * 
 * Orchestrates the complete RAG pipeline:
 * 1. Fetch products from Sanity CMS
 * 2. Search using TF-IDF
 * 3. Build context for AI
 * 4. Inject context into Gemini prompts
 * 
 * This enables product card embedding in chatbot responses.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 3, Task 3.4
 */

import { getAllRAGData } from './sanity-rag';
import { hybridSearch } from './search-engine';
import { buildEnhancedContext, formatContextForPrompt } from './context-builder';
import { generateResponse } from './gemini-client';
import { handleWithFallback } from './error-handler';
import type { Message, AIResponse } from '@/types/chatbot';
import type { SearchResult } from './search-engine';
import type { ProductCardData } from './context-builder';

/**
 * RAG Response with product cards and enhanced data
 */
export interface RAGResponse extends AIResponse {
  productCards?: ProductCardData[];
  searchResults?: SearchResult[];
  context?: string;
}

/**
 * RAG search options
 */
export interface RAGSearchOptions {
  maxProducts?: number;
  includeOutOfStock?: boolean;
  minRelevanceScore?: number;
}

/**
 * Performs RAG-enhanced search and generates AI response
 * This is the main function that combines search + context + AI
 * 
 * @param userMessage - User's query
 * @param conversationHistory - Previous messages
 * @param options - RAG options
 * @returns AI response with product cards
 */
export async function ragSearch(
  userMessage: string,
  conversationHistory: Message[] = [],
  options: RAGSearchOptions = {}
): Promise<RAGResponse> {
  const {
    maxProducts = 5,
    includeOutOfStock = false,
    minRelevanceScore = 0.001, // Much lower threshold to show more results
  } = options;

  try {
    console.log('[RAG Service] Starting search with options:', { maxProducts, minRelevanceScore });
    
    // Step 1: Fetch all RAG data from Sanity CMS
    const { products } = await getAllRAGData();
    console.log('[RAG Service] Fetched products:', products.length);

    if (products.length === 0) {
      console.warn('[RAG Service] No products available from Sanity');
      // No products available - return basic response
      return {
        content: 'I apologize, but I couldn\'t load product data. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        processingTime: 0,
        source: 'rag',
        productCards: [],
      };
    }

    // Step 2: Search products using TF-IDF
    let searchResults = hybridSearch(userMessage, products, {
      maxResults: maxProducts * 2, // Search for more, filter later
      minScore: minRelevanceScore,
    });
    
    console.log('[RAG Service] Initial search results:', searchResults.length);

    // Step 3: Filter out-of-stock if needed
    if (!includeOutOfStock) {
      const beforeFilter = searchResults.length;
      searchResults = searchResults.filter((r) => r.product.inStock);
      console.log('[RAG Service] After stock filter:', searchResults.length, 'of', beforeFilter);
    }

    // If no results, use top 3 random in-stock products as fallback
    if (searchResults.length === 0) {
      console.warn('[RAG Service] No search results, using fallback products');
      const inStockProducts = products.filter(p => p.inStock).slice(0, 3);
      searchResults = inStockProducts.map(product => ({
        product,
        score: 0.5,
        matchedFields: ['fallback'],
      }));
    }

    // Limit to maxProducts
    searchResults = searchResults.slice(0, maxProducts);
    console.log('[RAG Service] Final results to return:', searchResults.length);

    // Step 4: Build enhanced context
    const enhancedContext = buildEnhancedContext(searchResults, userMessage);

    // Step 5: Format context for AI prompt
    const contextText = formatContextForPrompt(enhancedContext);

    // Step 6: Create enhanced system prompt
    const systemPrompt = `You are MASH AI Assistant, a helpful chatbot for a mushroom e-commerce platform.

${contextText}

Instructions:
- Use the product information above to provide helpful, accurate recommendations
- Mention specific product names, prices, and availability
- Suggest recipes when relevant
- Include product links in your response using the Quick Links format
- Be friendly, enthusiastic, and knowledgeable about mushrooms
- If no products match, suggest alternatives or ask clarifying questions

User's question: ${userMessage}`;

    // Step 7: Generate AI response with context
    const startTime = Date.now();
    const response = await generateResponse(systemPrompt, conversationHistory);
    const processingTime = Date.now() - startTime;

    // Step 8: Apply fallback handling
    const finalResponse = await handleWithFallback(
      response,
      userMessage,
      conversationHistory
    );

    // Step 9: Return enhanced response with product cards
    const productCards = enhancedContext.productContext.products;
    console.log('[RAG Service] Returning response with', productCards.length, 'product cards');
    
    return {
      ...finalResponse,
      productCards,
      searchResults,
      context: contextText,
      processingTime,
      source: 'rag', // Force RAG source
    };
  } catch (error) {
    console.error('[RAG Service] Error:', error);
    
    // CRITICAL: Even on error, try to return some products
    try {
      const { products } = await getAllRAGData();
      const fallbackProducts = products.filter(p => p.inStock).slice(0, 3);
      const productCards = fallbackProducts.map(p => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.mainImage || '',
        category: p.category,
        inStock: p.inStock,
        description: p.description || '',
        tags: p.tags || [],
        relevanceScore: 0.5,
        matchedFields: ['fallback'],
      }));
      
      return {
        content: `I found some popular mushroom products for you. Here are ${fallbackProducts.length} options:`,
        timestamp: new Date().toISOString(),
        processingTime: 0,
        source: 'rag',
        productCards,
      };
    } catch (innerError) {
      console.error('[RAG Service] Fallback also failed:', innerError);
      // Last resort: basic response
      const fallbackResponse = await generateResponse(userMessage, conversationHistory);
      return {
        ...fallbackResponse,
        content: fallbackResponse.content || 'I\'m having trouble accessing product data. Please try again.',
        source: 'gemini', // Only use gemini source on complete failure
        productCards: [],
      };
    }
  }
}

/**
 * Checks if query needs product search
 * Determines if we should use RAG or just general chat
 * 
 * @param message - User message
 * @returns True if product search is needed
 */
export function needsProductSearch(message: string): boolean {
  const productKeywords = [
    'mushroom', 'oyster', 'shiitake', 'enoki', 'king', 'button',
    'recipe', 'cook', 'dish', 'buy', 'price', 'available',
    'recommend', 'suggest', 'best', 'good for', 'show me',
    'find', 'search', 'looking for', 'need', 'want',
  ];

  const messageLower = message.toLowerCase();
  return productKeywords.some((keyword) => messageLower.includes(keyword));
}

/**
 * Smart RAG dispatcher
 * Decides whether to use RAG or regular chat based on query
 * 
 * @param userMessage - User message
 * @param conversationHistory - Conversation history
 * @param options - RAG options
 * @returns AI response (with or without RAG)
 */
export async function smartRAGSearch(
  userMessage: string,
  conversationHistory: Message[] = [],
  options: RAGSearchOptions = {}
): Promise<RAGResponse> {
  // Check if query needs product search
  if (needsProductSearch(userMessage)) {
    return ragSearch(userMessage, conversationHistory, options);
  }

  // Use regular AI response for general queries
  const response = await generateResponse(userMessage, conversationHistory);
  return {
    ...response,
    productCards: [],
  };
}

/**
 * Gets product recommendations for a specific recipe
 * 
 * @param recipeName - Recipe name
 * @returns RAG response with recipe-specific products
 */
export async function getRecipeRecommendations(
  recipeName: string
): Promise<RAGResponse> {
  const query = `What mushrooms are good for ${recipeName}?`;
  return ragSearch(query, [], { maxProducts: 3 });
}

/**
 * Gets products from a specific grower
 * 
 * @param growerName - Grower name
 * @returns RAG response with grower products
 */
export async function getGrowerProducts(
  growerName: string
): Promise<RAGResponse> {
  const { products } = await getAllRAGData();
  
  const growerProducts = products.filter((p) => 
    p.grower?.name.toLowerCase().includes(growerName.toLowerCase())
  );

  // Create mock search results with high relevance
  const searchResults: SearchResult[] = growerProducts.slice(0, 10).map((product) => ({
    product,
    score: 1.0,
    matchedFields: ['grower'],
  }));

  const enhancedContext = buildEnhancedContext(searchResults, `Products from ${growerName}`);
  const contextText = formatContextForPrompt(enhancedContext);

  return {
    content: `Here are products from **${growerName}**:\n\n${enhancedContext.summary}`,
    productCards: enhancedContext.productContext.products,
    searchResults,
    context: contextText,
    timestamp: new Date().toISOString(),
    processingTime: 0,
  };
}

/**
 * Gets products by category
 * 
 * @param category - Category name
 * @returns RAG response with category products
 */
export async function getCategoryProducts(
  category: string
): Promise<RAGResponse> {
  const query = `Show me ${category}`;
  return ragSearch(query, [], { maxProducts: 10 });
}

/**
 * Gets featured/popular products
 * Returns highest-rated or in-stock products
 * 
 * @returns RAG response with featured products
 */
export async function getFeaturedProducts(): Promise<RAGResponse> {
  const { products } = await getAllRAGData();
  
  // Get in-stock products
  const inStockProducts = products.filter((p) => p.inStock);
  
  // Create mock search results
  const searchResults: SearchResult[] = inStockProducts.slice(0, 5).map((product) => ({
    product,
    score: 1.0,
    matchedFields: ['featured'],
  }));

  const enhancedContext = buildEnhancedContext(searchResults, 'featured products');

  return {
    content: `Here are our featured products:\n\n${enhancedContext.summary}`,
    productCards: enhancedContext.productContext.products,
    searchResults,
    timestamp: new Date().toISOString(),
    processingTime: 0,
  };
}
