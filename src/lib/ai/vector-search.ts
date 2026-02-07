/**
 * Vector Search Service
 * 
 * Semantic similarity search using cosine similarity on product embeddings.
 * Implements k-nearest neighbors (k-NN) search with scoring and ranking.
 * 
 * Key Features:
 * - Cosine similarity calculation between query and product embeddings
 * - K-nearest neighbors retrieval with configurable k
 * - Similarity threshold filtering
 * - Product metadata enrichment
 * - Score normalization and ranking
 * 
 * Integration:
 * - Uses embeddings.ts for query embedding generation
 * - Uses vector-storage.ts for product embedding retrieval
 * - Returns ranked product results with similarity scores
 * 
 * @module vector-search
 */

import { generateEmbedding, type EmbeddingVector } from './embeddings';
import { getAllEmbeddings, type EmbeddingDocument } from './vector-storage';

/**
 * Search result with product ID and similarity score
 */
export interface VectorSearchResult {
  /** Product ID from Firestore */
  productId: string;
  /** Similarity score (0-1, higher = more similar) */
  score: number;
  /** Product text used for embedding */
  text?: string;
  /** Embedding version used */
  version: string;
  /** Model used for embedding */
  model: string;
}

/**
 * Search options for configuring vector search
 */
export interface VectorSearchOptions {
  /** Maximum number of results to return (default: 10) */
  k?: number;
  /** Minimum similarity threshold (0-1, default: 0.5) */
  minScore?: number;
  /** Embedding version to search (default: 'v1') */
  version?: string;
  /** Whether to include product text in results (default: false) */
  includeText?: boolean;
}

/**
 * Calculate cosine similarity between two vectors
 * 
 * Cosine similarity formula:
 * similarity = (A · B) / (||A|| * ||B||)
 * 
 * Where:
 * - A · B = dot product of vectors A and B
 * - ||A|| = magnitude (L2 norm) of vector A
 * - ||B|| = magnitude (L2 norm) of vector B
 * 
 * Result range: [-1, 1]
 * - 1 = identical direction (most similar)
 * - 0 = orthogonal (no similarity)
 * - -1 = opposite direction (most dissimilar)
 * 
 * @param vec1 - First vector (query embedding)
 * @param vec2 - Second vector (product embedding)
 * @returns Cosine similarity score (-1 to 1)
 * @throws Error if vectors have different dimensions
 */
export function cosineSimilarity(vec1: EmbeddingVector, vec2: EmbeddingVector): number {
  if (vec1.length !== vec2.length) {
    throw new Error(
      `Vector dimension mismatch: vec1=${vec1.length}, vec2=${vec2.length}`
    );
  }

  if (vec1.length === 0) {
    throw new Error('Cannot calculate similarity for empty vectors');
  }

  // Calculate dot product: A · B
  let dotProduct = 0;
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
  }

  // Calculate magnitudes: ||A|| and ||B||
  let magnitude1 = 0;
  let magnitude2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  // Calculate cosine similarity
  const similarity = dotProduct / (magnitude1 * magnitude2);

  // Clamp to [-1, 1] to handle floating-point precision issues
  return Math.max(-1, Math.min(1, similarity));
}

/**
 * Normalize similarity scores to 0-1 range
 * 
 * Converts cosine similarity from [-1, 1] to [0, 1] for easier interpretation:
 * - 0 = completely dissimilar
 * - 0.5 = neutral
 * - 1 = completely similar
 * 
 * @param score - Raw cosine similarity score (-1 to 1)
 * @returns Normalized score (0 to 1)
 */
export function normalizeScore(score: number): number {
  return (score + 1) / 2;
}

/**
 * Search products by semantic similarity to a query
 * 
 * Algorithm:
 * 1. Generate embedding for search query
 * 2. Retrieve all product embeddings from Firestore
 * 3. Calculate cosine similarity between query and each product
 * 4. Filter results by minimum score threshold
 * 5. Sort by similarity score (descending)
 * 6. Return top k results
 * 
 * @param query - Search query text
 * @param options - Search configuration options
 * @returns Array of search results sorted by relevance
 * @throws Error if query is empty or embedding generation fails
 * 
 * @example
 * ```typescript
 * const results = await vectorSearch('organic button mushrooms', {
 *   k: 5,
 *   minScore: 0.7,
 *   includeText: true,
 * });
 * 
 * results.forEach(result => {
 *   console.log(`${result.productId}: ${result.score.toFixed(3)}`);
 * });
 * ```
 */
export async function vectorSearch(
  query: string,
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult[]> {
  const {
    k = 10,
    minScore = 0.5,
    version = 'v1',
    includeText = false,
  } = options;

  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }

  if (k <= 0) {
    throw new Error('k must be greater than 0');
  }

  if (minScore < 0 || minScore > 1) {
    throw new Error('minScore must be between 0 and 1');
  }

  console.log(`[VectorSearch] Searching for: "${query}" (k=${k}, minScore=${minScore})`);

  try {
    // Step 1: Generate embedding for search query
    const queryEmbeddingResult = await generateEmbedding(query);
    const queryEmbedding = queryEmbeddingResult.embedding;

    console.log(
      `[VectorSearch] Query embedding generated: ${queryEmbedding.length} dimensions`
    );

    // Step 2: Retrieve all product embeddings
    const productEmbeddings = await getAllEmbeddings(version);

    if (productEmbeddings.length === 0) {
      console.warn('[VectorSearch] No product embeddings found');
      return [];
    }

    console.log(
      `[VectorSearch] Retrieved ${productEmbeddings.length} product embeddings`
    );

    // Step 3: Calculate similarity scores for all products
    const results: VectorSearchResult[] = [];

    for (const productEmbedding of productEmbeddings) {
      try {
        // Calculate cosine similarity
        const rawScore = cosineSimilarity(queryEmbedding, productEmbedding.embedding);
        
        // Normalize to 0-1 range
        const normalizedScore = normalizeScore(rawScore);

        // Filter by minimum score
        if (normalizedScore >= minScore) {
          results.push({
            productId: productEmbedding.productId,
            score: normalizedScore,
            text: includeText ? productEmbedding.text : undefined,
            version: productEmbedding.version,
            model: productEmbedding.model,
          });
        }
      } catch (error) {
        console.error(
          `[VectorSearch] Error calculating similarity for ${productEmbedding.productId}:`,
          error
        );
        // Continue processing other products
      }
    }

    // Step 4: Sort by score (descending) and return top k
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, k);

    console.log(
      `[VectorSearch] Found ${results.length} results above threshold, ` +
      `returning top ${topResults.length}`
    );

    return topResults;
  } catch (error) {
    console.error('[VectorSearch] Search failed:', error);
    throw error;
  }
}

/**
 * Find similar products to a given product
 * 
 * Uses existing product embedding to find similar products without
 * generating a new embedding.
 * 
 * @param productId - Product ID to find similar products for
 * @param options - Search configuration options
 * @returns Array of similar products sorted by relevance
 * @throws Error if product embedding not found
 * 
 * @example
 * ```typescript
 * const similar = await findSimilarProducts('prod-123', {
 *   k: 5,
 *   minScore: 0.6,
 * });
 * ```
 */
export async function findSimilarProducts(
  productId: string,
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult[]> {
  const {
    k = 10,
    minScore = 0.5,
    version = 'v1',
    includeText = false,
  } = options;

  if (!productId || productId.trim().length === 0) {
    throw new Error('Product ID cannot be empty');
  }

  console.log(`[VectorSearch] Finding similar products for: ${productId}`);

  try {
    // Step 1: Retrieve all product embeddings
    const productEmbeddings = await getAllEmbeddings(version);

    // Step 2: Find target product embedding
    const targetProduct = productEmbeddings.find(p => p.productId === productId);

    if (!targetProduct) {
      throw new Error(`Product embedding not found: ${productId}`);
    }

    console.log(
      `[VectorSearch] Target product found, comparing with ${productEmbeddings.length - 1} others`
    );

    // Step 3: Calculate similarity scores with all other products
    const results: VectorSearchResult[] = [];

    for (const productEmbedding of productEmbeddings) {
      // Skip the target product itself
      if (productEmbedding.productId === productId) {
        continue;
      }

      try {
        // Calculate cosine similarity
        const rawScore = cosineSimilarity(
          targetProduct.embedding,
          productEmbedding.embedding
        );
        
        // Normalize to 0-1 range
        const normalizedScore = normalizeScore(rawScore);

        // Filter by minimum score
        if (normalizedScore >= minScore) {
          results.push({
            productId: productEmbedding.productId,
            score: normalizedScore,
            text: includeText ? productEmbedding.text : undefined,
            version: productEmbedding.version,
            model: productEmbedding.model,
          });
        }
      } catch (error) {
        console.error(
          `[VectorSearch] Error calculating similarity for ${productEmbedding.productId}:`,
          error
        );
        // Continue processing other products
      }
    }

    // Step 4: Sort by score (descending) and return top k
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, k);

    console.log(
      `[VectorSearch] Found ${results.length} similar products above threshold, ` +
      `returning top ${topResults.length}`
    );

    return topResults;
  } catch (error) {
    console.error('[VectorSearch] Similar products search failed:', error);
    throw error;
  }
}

/**
 * Batch search multiple queries efficiently
 * 
 * Retrieves product embeddings once and reuses for all queries,
 * improving performance for multiple searches.
 * 
 * @param queries - Array of search query strings
 * @param options - Search configuration options
 * @returns Array of search results for each query
 * @throws Error if queries array is empty
 * 
 * @example
 * ```typescript
 * const results = await batchVectorSearch([
 *   'button mushrooms',
 *   'shiitake mushrooms',
 *   'oyster mushrooms',
 * ], { k: 3 });
 * ```
 */
export async function batchVectorSearch(
  queries: string[],
  options: VectorSearchOptions = {}
): Promise<VectorSearchResult[][]> {
  if (!queries || queries.length === 0) {
    throw new Error('Queries array cannot be empty');
  }

  const {
    k = 10,
    minScore = 0.5,
    version = 'v1',
    includeText = false,
  } = options;

  console.log(`[VectorSearch] Batch searching ${queries.length} queries`);

  try {
    // Step 1: Retrieve product embeddings once (reused for all queries)
    const productEmbeddings = await getAllEmbeddings(version);

    if (productEmbeddings.length === 0) {
      console.warn('[VectorSearch] No product embeddings found');
      return queries.map(() => []);
    }

    console.log(
      `[VectorSearch] Retrieved ${productEmbeddings.length} product embeddings for batch search`
    );

    // Step 2: Generate embeddings for all queries
    const queryEmbeddings: EmbeddingVector[] = [];
    for (const query of queries) {
      if (!query || query.trim().length === 0) {
        console.warn('[VectorSearch] Skipping empty query in batch');
        queryEmbeddings.push([]);
        continue;
      }

      const embeddingResult = await generateEmbedding(query);
      queryEmbeddings.push(embeddingResult.embedding);
    }

    // Step 3: Search for each query
    const allResults: VectorSearchResult[][] = [];

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const queryEmbedding = queryEmbeddings[i];

      if (queryEmbedding.length === 0) {
        allResults.push([]);
        continue;
      }

      // Calculate similarity scores for this query
      const results: VectorSearchResult[] = [];

      for (const productEmbedding of productEmbeddings) {
        try {
          const rawScore = cosineSimilarity(queryEmbedding, productEmbedding.embedding);
          const normalizedScore = normalizeScore(rawScore);

          if (normalizedScore >= minScore) {
            results.push({
              productId: productEmbedding.productId,
              score: normalizedScore,
              text: includeText ? productEmbedding.text : undefined,
              version: productEmbedding.version,
              model: productEmbedding.model,
            });
          }
        } catch (error) {
          console.error(
            `[VectorSearch] Error in batch search for query "${query}":`,
            error
          );
        }
      }

      // Sort and slice
      results.sort((a, b) => b.score - a.score);
      allResults.push(results.slice(0, k));
    }

    console.log(
      `[VectorSearch] Batch search complete: ${allResults.length} result sets`
    );

    return allResults;
  } catch (error) {
    console.error('[VectorSearch] Batch search failed:', error);
    throw error;
  }
}
