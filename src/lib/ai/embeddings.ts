/**
 * Vector Embeddings Service
 * 
 * Generates semantic embeddings for products using Hugging Face sentence-transformers.
 * Model: sentence-transformers/all-MiniLM-L6-v2 (384 dimensions, fast, accurate)
 * 
 * Part of AI Chatbot ML Enhancement Plan - Phase 2: Vector Embeddings
 * @see .github/AI_CHATBOT_ML_ENHANCEMENT_PLAN.md - Phase 2
 */

import { HF_API_KEY, HF_API_ENDPOINT } from './config';

/**
 * Hugging Face Inference API configuration
 */
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const EMBEDDING_DIM = 384; // Model output dimensions
const MAX_INPUT_LENGTH = 512; // Max tokens for model
const BATCH_SIZE = 10; // Process 10 texts at once

/**
 * Embedding vector type (384-dimensional array)
 */
export type EmbeddingVector = number[];

/**
 * Product text to embed (description + metadata)
 */
export interface ProductText {
  id: string;
  text: string;
}

/**
 * Embedding result with metadata
 */
export interface EmbeddingResult {
  id: string;
  embedding: EmbeddingVector;
  dimensions: number;
  model: string;
  timestamp: number;
}

/**
 * Embedding error details
 */
export interface EmbeddingError {
  message: string;
  code: string;
  productId?: string;
}

/**
 * Generate embedding for a single text using Hugging Face API
 * 
 * @param text - Text to embed (product description, query, etc.)
 * @returns 384-dimensional embedding vector
 * 
 * @example
 * ```ts
 * const embedding = await generateEmbedding("Fresh button mushrooms");
 * console.log(embedding.length); // 384
 * ```
 */
export async function generateEmbedding(text: string): Promise<EmbeddingVector> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  // Check API key at runtime (not module load time) to allow testing
  const apiKey = process.env.NEXT_PUBLIC_HF_API_KEY || HF_API_KEY;
  if (!apiKey) {
    throw new Error('HF_API_KEY not configured');
  }

  // Truncate text if too long
  const truncatedText = text.slice(0, MAX_INPUT_LENGTH * 4); // Approx 4 chars per token

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: truncatedText,
          options: {
            wait_for_model: true, // Wait if model is loading
          },
        }),
      }
    );

    if (!response || !response.ok) {
      const error = response ? await response.text() : 'No response';
      throw new Error(`Hugging Face API error: ${response?.status || 'unknown'} - ${error}`);
    }

    const embedding = await response.json();

    // HF returns array of arrays for batches, take first result
    const vector = Array.isArray(embedding[0]) ? embedding[0] : embedding;

    if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIM) {
      throw new Error(`Invalid embedding dimensions: ${vector?.length || 0}, expected ${EMBEDDING_DIM}`);
    }

    return vector;
  } catch (error) {
    console.error('[Embeddings] Generation failed:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple products in batch
 * 
 * Processes products in batches of 10 for efficiency.
 * Retries failed embeddings up to 3 times.
 * 
 * @param products - Array of product texts to embed
 * @returns Array of embedding results
 * 
 * @example
 * ```ts
 * const products = [
 *   { id: '1', text: 'Fresh button mushrooms for cooking' },
 *   { id: '2', text: 'Organic shiitake mushrooms dried' }
 * ];
 * const results = await generateBatchEmbeddings(products);
 * ```
 */
export async function generateBatchEmbeddings(
  products: ProductText[]
): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];
  const errors: EmbeddingError[] = [];

  // Process in batches
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    console.log(`[Embeddings] Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(products.length / BATCH_SIZE)}`);

    // Process batch concurrently
    const batchPromises = batch.map(async (product) => {
      let retries = 3;
      let lastError: Error | null = null;

      while (retries > 0) {
        try {
          const embedding = await generateEmbedding(product.text);
          
          return {
            id: product.id,
            embedding,
            dimensions: embedding.length,
            model: EMBEDDING_MODEL,
            timestamp: Date.now(),
          } as EmbeddingResult;
        } catch (error) {
          lastError = error as Error;
          retries--;
          
          if (retries > 0) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          }
        }
      }

      // All retries failed
      errors.push({
        message: lastError?.message || 'Unknown error',
        code: 'EMBEDDING_FAILED',
        productId: product.id,
      });
      
      return null;
    });

    const batchResults = await Promise.all(batchPromises);
    
    // Add successful results
    batchResults.forEach(result => {
      if (result) results.push(result);
    });

    // Rate limit: wait 1s between batches to avoid HF API limits
    if (i + BATCH_SIZE < products.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (errors.length > 0) {
    console.warn(`[Embeddings] ${errors.length} products failed to embed:`, errors);
  }

  console.log(`[Embeddings] Successfully embedded ${results.length}/${products.length} products`);
  
  return results;
}

/**
 * Calculate cosine similarity between two embedding vectors
 * 
 * Measures similarity from -1 (opposite) to 1 (identical).
 * Used for vector search and ranking.
 * 
 * @param vecA - First embedding vector
 * @param vecB - Second embedding vector
 * @returns Cosine similarity score (0-1 normalized)
 * 
 * @example
 * ```ts
 * const similarity = cosineSimilarity(embedding1, embedding2);
 * console.log(similarity); // 0.85 (85% similar)
 * ```
 */
export function cosineSimilarity(vecA: EmbeddingVector, vecB: EmbeddingVector): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector dimensions mismatch: ${vecA.length} vs ${vecB.length}`);
  }

  // Calculate dot product
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // Avoid division by zero
  if (normA === 0 || normB === 0) {
    return 0;
  }

  // Cosine = dot product / (||A|| * ||B||)
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));

  // Normalize to 0-1 range (cosine is -1 to 1)
  return (similarity + 1) / 2;
}

/**
 * Find top-k most similar vectors to query vector
 * 
 * Uses cosine similarity for ranking.
 * Efficient for small datasets (<10k vectors).
 * 
 * @param queryVector - Query embedding to compare
 * @param productVectors - Array of product embeddings with IDs
 * @param topK - Number of results to return (default: 10)
 * @returns Top-k products sorted by similarity (descending)
 * 
 * @example
 * ```ts
 * const results = findSimilarVectors(queryEmbedding, productEmbeddings, 5);
 * // Returns: [{ id: '1', score: 0.92 }, { id: '2', score: 0.87 }, ...]
 * ```
 */
export function findSimilarVectors(
  queryVector: EmbeddingVector,
  productVectors: Array<{ id: string; embedding: EmbeddingVector }>,
  topK: number = 10
): Array<{ id: string; score: number }> {
  // Calculate similarity for all products
  const similarities = productVectors.map(product => ({
    id: product.id,
    score: cosineSimilarity(queryVector, product.embedding),
  }));

  // Sort by score descending
  similarities.sort((a, b) => b.score - a.score);

  // Return top-k
  return similarities.slice(0, topK);
}

/**
 * Build product text for embedding generation
 * 
 * Combines product name, description, category, and tags into a single text.
 * Format optimized for semantic search.
 * 
 * @param product - Product object with metadata
 * @returns Text suitable for embedding
 * 
 * @example
 * ```ts
 * const text = buildProductText({
 *   name: 'Button Mushrooms',
 *   description: 'Fresh white mushrooms',
 *   category: 'Fresh',
 *   tags: ['cooking', 'fresh']
 * });
 * // "Button Mushrooms. Fresh white mushrooms. Category: Fresh. Tags: cooking, fresh"
 * ```
 */
export function buildProductText(product: {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
}): string {
  const parts: string[] = [];

  // Product name (most important)
  parts.push(product.name);

  // Description
  if (product.description) {
    parts.push(product.description);
  }

  // Category
  if (product.category) {
    parts.push(`Category: ${product.category}`);
  }

  // Tags
  if (product.tags && product.tags.length > 0) {
    parts.push(`Tags: ${product.tags.join(', ')}`);
  }

  return parts.join('. ');
}

/**
 * Cache for embeddings to avoid redundant API calls
 */
const embeddingCache = new Map<string, EmbeddingVector>();

/**
 * Get embedding from cache or generate new one
 * 
 * Reduces API calls by caching embeddings by text hash.
 * Cache persists during runtime only (not disk storage).
 * 
 * @param text - Text to embed
 * @returns Cached or newly generated embedding
 */
export async function getCachedEmbedding(text: string): Promise<EmbeddingVector> {
  const cacheKey = text.trim().toLowerCase();
  
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  const embedding = await generateEmbedding(text);
  embeddingCache.set(cacheKey, embedding);
  
  return embedding;
}

/**
 * Clear embedding cache (useful for testing)
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
}

/**
 * Get cache statistics
 */
export function getEmbeddingCacheStats(): { size: number; keys: string[] } {
  return {
    size: embeddingCache.size,
    keys: Array.from(embeddingCache.keys()).slice(0, 10), // First 10 keys
  };
}

/**
 * Test embedding generation (health check)
 * 
 * @returns True if embeddings work, false otherwise
 */
export async function testEmbeddingGeneration(): Promise<boolean> {
  try {
    const testText = 'Fresh button mushrooms for cooking';
    const embedding = await generateEmbedding(testText);
    
    return embedding.length === EMBEDDING_DIM;
  } catch (error) {
    console.error('[Embeddings] Health check failed:', error);
    return false;
  }
}
