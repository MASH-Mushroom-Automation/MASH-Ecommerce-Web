/**
 * TF-IDF Search Engine for Product Discovery
 * 
 * Implements Term Frequency-Inverse Document Frequency algorithm
 * for fast, relevant product search across all product data.
 * 
 * This enables the chatbot to find the most relevant products
 * for embedding product cards in responses.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 3, Task 3.2
 */

import type { RAGProduct, RAGCategory, RAGRecipe, RAGGrower } from './sanity-rag';

/**
 * Search result with relevance score
 */
export interface SearchResult {
  product: RAGProduct;
  score: number;
  matchedFields: string[];
}

/**
 * Search options for customizing search behavior
 */
export interface SearchOptions {
  maxResults?: number;
  minScore?: number;
  boostName?: number;
  boostDescription?: number;
  boostTags?: number;
  boostCategory?: number;
}

/**
 * Preprocesses text for search
 * - Lowercases
 * - Removes punctuation
 * - Splits into words
 * - Removes stop words
 * 
 * @param text - Text to preprocess
 * @returns Array of cleaned words
 */
export function preprocessText(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'what', 'when', 'where', 'who', 'how',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/) // Split on whitespace
    .filter((word) => word.length > 2 && !stopWords.has(word)); // Remove short words and stop words
}

/**
 * Calculates Term Frequency (TF)
 * TF = (Number of times term appears in document) / (Total terms in document)
 * 
 * @param term - Search term
 * @param document - Array of words in document
 * @returns TF score
 */
export function calculateTF(term: string, document: string[]): number {
  if (document.length === 0) return 0;
  
  const termCount = document.filter((word) => word === term).length;
  return termCount / document.length;
}

/**
 * Calculates Inverse Document Frequency (IDF)
 * IDF = log(Total documents / Documents containing term)
 * 
 * @param term - Search term
 * @param documents - All documents
 * @returns IDF score
 */
export function calculateIDF(term: string, documents: string[][]): number {
  const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;
  
  if (docsWithTerm === 0) return 0;
  
  return Math.log(documents.length / docsWithTerm);
}

/**
 * Calculates TF-IDF score for a term in a document
 * TF-IDF = TF × IDF
 * 
 * @param term - Search term
 * @param document - Document words
 * @param allDocuments - All documents for IDF calculation
 * @returns TF-IDF score
 */
export function calculateTFIDF(
  term: string,
  document: string[],
  allDocuments: string[][]
): number {
  const tf = calculateTF(term, document);
  const idf = calculateIDF(term, allDocuments);
  return tf * idf;
}

/**
 * Builds searchable document from product data
 * Combines all searchable fields with field boosting
 * 
 * @param product - Product to build document for
 * @param options - Search options with field boosts
 * @returns Object with preprocessed fields
 */
export function buildProductDocument(
  product: RAGProduct,
  options: SearchOptions = {}
) {
  const {
    boostName = 3,
    boostDescription = 1.5,
    boostTags = 2,
    boostCategory = 1.5,
  } = options;

  // Extract and preprocess all searchable fields
  const nameWords = preprocessText(product.name);
  const descWords = preprocessText(product.description || '');
  const tagWords = (product.tags || []).flatMap((tag) => preprocessText(tag));
  const benefitWords = (product.benefits || []).flatMap((b) => preprocessText(b));
  const categoryWords = preprocessText(product.category || '');
  const growerWords = product.grower ? preprocessText(product.grower.name) : [];

  // Apply field boosting by repeating words
  const boostedName = Array(boostName).fill(nameWords).flat();
  const boostedDesc = Array(Math.ceil(boostDescription)).fill(descWords).flat();
  const boostedTags = Array(boostTags).fill(tagWords).flat();
  const boostedCategory = Array(Math.ceil(boostCategory)).fill(categoryWords).flat();

  return {
    name: nameWords,
    description: descWords,
    tags: tagWords,
    benefits: benefitWords,
    category: categoryWords,
    grower: growerWords,
    combined: [
      ...boostedName,
      ...boostedDesc,
      ...boostedTags,
      ...boostedCategory,
      ...benefitWords,
      ...growerWords,
    ],
  };
}

/**
 * Searches products using TF-IDF algorithm
 * Returns top N most relevant products with scores
 * 
 * @param query - User's search query
 * @param products - All available products
 * @param options - Search options
 * @returns Array of search results sorted by relevance
 */
export function searchProducts(
  query: string,
  products: RAGProduct[],
  options: SearchOptions = {}
): SearchResult[] {
  const {
    maxResults = 5,
    minScore = 0.01,
  } = options;

  // Preprocess query
  const queryTerms = preprocessText(query);
  
  if (queryTerms.length === 0 || products.length === 0) {
    return [];
  }

  // Build documents for all products
  const productDocs = products.map((product) => 
    buildProductDocument(product, options)
  );

  // Create combined documents for IDF calculation
  const allDocuments = productDocs.map((doc) => doc.combined);

  // Calculate TF-IDF scores for each product
  const results: SearchResult[] = products.map((product, index) => {
    const doc = productDocs[index];
    let totalScore = 0;
    const matchedFields: string[] = [];

    // Calculate score for each query term
    for (const term of queryTerms) {
      const score = calculateTFIDF(term, doc.combined, allDocuments);
      totalScore += score;

      // Track which fields matched
      if (doc.name.includes(term)) matchedFields.push('name');
      if (doc.description.includes(term)) matchedFields.push('description');
      if (doc.tags.includes(term)) matchedFields.push('tags');
      if (doc.category.includes(term)) matchedFields.push('category');
      if (doc.benefits.includes(term)) matchedFields.push('benefits');
    }

    return {
      product,
      score: totalScore,
      matchedFields: [...new Set(matchedFields)], // Remove duplicates
    };
  });

  // Filter by minimum score and sort by relevance
  return results
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Finds products by exact category match
 * Useful when user asks for specific category like "oyster mushrooms"
 * 
 * @param category - Category name or slug
 * @param products - All products
 * @param maxResults - Maximum results to return
 * @returns Array of products in that category
 */
export function findProductsByCategory(
  category: string,
  products: RAGProduct[],
  maxResults: number = 10
): RAGProduct[] {
  const categoryLower = category.toLowerCase();
  
  return products
    .filter((product) => 
      product.category.toLowerCase().includes(categoryLower)
    )
    .slice(0, maxResults);
}

/**
 * Finds products by grower name
 * Useful when user asks about specific seller/grower
 * 
 * @param growerName - Grower name
 * @param products - All products
 * @param maxResults - Maximum results to return
 * @returns Array of products from that grower
 */
export function findProductsByGrower(
  growerName: string,
  products: RAGProduct[],
  maxResults: number = 10
): RAGProduct[] {
  const growerLower = growerName.toLowerCase();
  
  return products
    .filter((product) => 
      product.grower?.name.toLowerCase().includes(growerLower)
    )
    .slice(0, maxResults);
}

/**
 * Finds in-stock products only
 * Filters search results to only available products
 * 
 * @param results - Search results
 * @returns Filtered results with only in-stock products
 */
export function filterInStock(results: SearchResult[]): SearchResult[] {
  return results.filter((result) => result.product.inStock);
}

/**
 * Combines multiple search strategies for better results
 * 1. TF-IDF semantic search
 * 2. Exact category match
 * 3. Grower name match
 * 
 * @param query - User query
 * @param products - All products
 * @param options - Search options
 * @returns Combined search results
 */
export function hybridSearch(
  query: string,
  products: RAGProduct[],
  options: SearchOptions = {}
): SearchResult[] {
  const maxResults = options.maxResults || 5;
  
  // Strategy 1: TF-IDF search
  const tfidfResults = searchProducts(query, products, options);
  
  // Strategy 2: Check for category-specific query
  const categoryKeywords = ['oyster', 'shiitake', 'enoki', 'king', 'button', 'portobello'];
  const matchedCategory = categoryKeywords.find((keyword) =>
    query.toLowerCase().includes(keyword)
  );
  
  if (matchedCategory) {
    const categoryProducts = findProductsByCategory(matchedCategory, products, 3);
    
    // Add category products to results if not already present
    for (const product of categoryProducts) {
      const exists = tfidfResults.some((r) => r.product._id === product._id);
      if (!exists) {
        tfidfResults.push({
          product,
          score: 0.5, // Medium score for category match
          matchedFields: ['category'],
        });
      }
    }
  }
  
  // Strategy 3: Check for recipe-related queries
  const recipeKeywords = ['recipe', 'cook', 'dish', 'meal', 'food'];
  const isRecipeQuery = recipeKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword)
  );
  
  if (isRecipeQuery) {
    // Boost products with benefits or recipe tags
    tfidfResults.forEach((result) => {
      if (result.product.benefits && result.product.benefits.length > 0) {
        result.score *= 1.2; // 20% boost for products with benefits
      }
    });
  }
  
  // Re-sort and limit results
  return tfidfResults
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Gets search statistics for debugging
 * 
 * @param results - Search results
 * @returns Statistics object
 */
export function getSearchStats(results: SearchResult[]) {
  if (results.length === 0) {
    return {
      totalResults: 0,
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      matchedFields: [],
    };
  }
  
  const scores = results.map((r) => r.score);
  const allMatchedFields = results.flatMap((r) => r.matchedFields);
  
  return {
    totalResults: results.length,
    avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
    matchedFields: [...new Set(allMatchedFields)],
  };
}
