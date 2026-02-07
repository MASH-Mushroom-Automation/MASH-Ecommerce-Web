/**
 * Hybrid Search Service
 * 
 * Combines TF-IDF keyword matching (40%) with semantic embeddings (60%)
 * for optimal search results that balance exact matches with semantic similarity.
 * 
 * Algorithm:
 * 1. Execute TF-IDF search (keyword-based)
 * 2. Execute vector search (semantic similarity)
 * 3. Normalize both score sets to 0-1 range
 * 4. Combine with weights: 40% TF-IDF + 60% embeddings
 * 5. Merge results, deduplicate, and rank by combined score
 * 
 * Integration:
 * - Uses search-engine.ts for TF-IDF search
 * - Uses vector-search.ts for semantic search
 * - Provides unified search interface for RAG system
 * 
 * @module hybrid-search
 */

import { search as tfIdfSearch, type SearchResult as TFIDFResult } from './search-engine';
import { vectorSearch, type VectorSearchResult } from './vector-search';

/**
 * Hybrid search result with combined scoring
 */
export interface HybridSearchResult {
  /** Product ID */
  productId: string;
  /** Combined score (0-1, higher = better match) */
  score: number;
  /** TF-IDF component score (0-1) */
  tfIdfScore: number;
  /** Vector similarity component score (0-1) */
  vectorScore: number;
  /** Matched fields from TF-IDF search */
  matchedFields: string[];
  /** Product text (optional) */
  text?: string;
}

/**
 * Hybrid search options
 */
export interface HybridSearchOptions {
  /** Maximum number of results to return (default: 10) */
  k?: number;
  /** TF-IDF weight (0-1, default: 0.4) */
  tfIdfWeight?: number;
  /** Vector weight (0-1, default: 0.6) */
  vectorWeight?: number;
  /** Minimum combined score threshold (0-1, default: 0.3) */
  minScore?: number;
  /** Include product text in results (default: false) */
  includeText?: boolean;
  /** Search mode: 'balanced' | 'keyword' | 'semantic' (default: 'balanced') */
  mode?: 'balanced' | 'keyword' | 'semantic';
}

/**
 * Search mode presets for different use cases
 */
export const SEARCH_MODES = {
  /** Balanced: 40% TF-IDF + 60% embeddings (default) */
  balanced: { tfIdfWeight: 0.4, vectorWeight: 0.6 },
  /** Keyword-focused: 70% TF-IDF + 30% embeddings */
  keyword: { tfIdfWeight: 0.7, vectorWeight: 0.3 },
  /** Semantic-focused: 20% TF-IDF + 80% embeddings */
  semantic: { tfIdfWeight: 0.2, vectorWeight: 0.8 },
} as const;

/**
 * Normalize scores to 0-1 range using min-max normalization
 * 
 * Formula: (score - min) / (max - min)
 * 
 * @param scores - Array of scores to normalize
 * @returns Normalized scores in 0-1 range
 */
export function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) return [];
  
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  
  // If all scores are the same, return array of 1s
  if (max === min) {
    return scores.map(() => 1);
  }
  
  return scores.map(score => (score - min) / (max - min));
}

/**
 * Merge and deduplicate search results from multiple sources
 * 
 * Combines results by productId, keeping the highest score for each product.
 * 
 * @param results - Array of search results
 * @returns Deduplicated results with merged scores
 */
export function mergeResults(results: HybridSearchResult[]): HybridSearchResult[] {
  const merged = new Map<string, HybridSearchResult>();
  
  for (const result of results) {
    const existing = merged.get(result.productId);
    
    if (!existing || result.score > existing.score) {
      merged.set(result.productId, result);
    } else if (existing) {
      // Merge matched fields if same product appears twice
      existing.matchedFields = Array.from(
        new Set([...existing.matchedFields, ...result.matchedFields])
      );
    }
  }
  
  return Array.from(merged.values());
}

/**
 * Hybrid search combining TF-IDF and vector embeddings
 * 
 * Algorithm:
 * 1. Execute parallel searches (TF-IDF + vector)
 * 2. Normalize scores to 0-1 range for each method
 * 3. Calculate weighted combined score
 * 4. Merge results and remove duplicates
 * 5. Filter by minimum score threshold
 * 6. Sort by combined score (descending)
 * 7. Return top k results
 * 
 * @param query - Search query text
 * @param options - Search configuration options
 * @returns Array of hybrid search results sorted by relevance
 * @throws Error if query is empty or weights don't sum to 1
 * 
 * @example
 * ```typescript
 * // Balanced search (default)
 * const results = await hybridSearch('fresh button mushrooms', {
 *   k: 10,
 *   minScore: 0.5,
 * });
 * 
 * // Keyword-focused search
 * const keywordResults = await hybridSearch('SKU-12345', {
 *   mode: 'keyword',
 *   k: 5,
 * });
 * 
 * // Semantic search for natural language
 * const semanticResults = await hybridSearch('mushrooms good for cooking', {
 *   mode: 'semantic',
 *   includeText: true,
 * });
 * ```
 */
export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<HybridSearchResult[]> {
  const {
    k = 10,
    minScore = 0.3,
    includeText = false,
    mode,
  } = options;

  // Apply mode preset or custom weights
  let { tfIdfWeight, vectorWeight } = options;
  
  // If mode is specified, use its preset weights
  // Otherwise, use custom weights or defaults
  if (mode && SEARCH_MODES[mode]) {
    tfIdfWeight = SEARCH_MODES[mode].tfIdfWeight;
    vectorWeight = SEARCH_MODES[mode].vectorWeight;
  } else {
    // Use custom weights or defaults
    tfIdfWeight = tfIdfWeight !== undefined ? tfIdfWeight : 0.4;
    vectorWeight = vectorWeight !== undefined ? vectorWeight : 0.6;
  }

  // Validation
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }

  if (k <= 0) {
    throw new Error('k must be greater than 0');
  }

  if (minScore < 0 || minScore > 1) {
    throw new Error('minScore must be between 0 and 1');
  }

  if (tfIdfWeight < 0 || tfIdfWeight > 1) {
    throw new Error('tfIdfWeight must be between 0 and 1');
  }

  if (vectorWeight < 0 || vectorWeight > 1) {
    throw new Error('vectorWeight must be between 0 and 1');
  }

  const weightSum = tfIdfWeight + vectorWeight;
  if (Math.abs(weightSum - 1.0) > 0.01) {
    throw new Error(
      `Weights must sum to 1.0 (got ${weightSum}). ` +
      `tfIdfWeight=${tfIdfWeight}, vectorWeight=${vectorWeight}`
    );
  }

  console.log(
    `[HybridSearch] Searching: "${query}" ` +
    `(mode=${mode}, tfIdf=${tfIdfWeight}, vector=${vectorWeight})`
  );

  try {
    // Step 1: Execute parallel searches
    const [tfIdfResults, vectorResults] = await Promise.all([
      tfIdfSearch(query, { k: k * 2, threshold: 0 }), // Get more results for merging
      vectorSearch(query, { k: k * 2, minScore: 0, includeText }),
    ]);

    console.log(
      `[HybridSearch] TF-IDF: ${tfIdfResults.length} results, ` +
      `Vector: ${vectorResults.length} results`
    );

    // Step 2: Normalize scores for each method
    const tfIdfScoresRaw = tfIdfResults.map(r => r.score);
    const vectorScoresRaw = vectorResults.map(r => r.score);

    const tfIdfScoresNorm = normalizeScores(tfIdfScoresRaw);
    const vectorScoresNorm = normalizeScores(vectorScoresRaw);

    // Step 3: Create maps for quick lookup
    const tfIdfMap = new Map<string, { score: number; matchedFields: string[] }>();
    const vectorMap = new Map<string, { score: number; text?: string }>();

    tfIdfResults.forEach((result, index) => {
      tfIdfMap.set(result.productId, {
        score: tfIdfScoresNorm[index],
        matchedFields: result.matchedFields,
      });
    });

    vectorResults.forEach((result, index) => {
      vectorMap.set(result.productId, {
        score: vectorScoresNorm[index],
        text: result.text,
      });
    });

    // Step 4: Combine results with weighted scores
    const allProductIds = new Set([
      ...tfIdfResults.map(r => r.productId),
      ...vectorResults.map(r => r.productId),
    ]);

    const hybridResults: HybridSearchResult[] = [];

    for (const productId of allProductIds) {
      const tfIdfData = tfIdfMap.get(productId);
      const vectorData = vectorMap.get(productId);

      const tfIdfScore = tfIdfData?.score ?? 0;
      const vectorScore = vectorData?.score ?? 0;

      // Calculate weighted combined score
      const combinedScore = tfIdfWeight * tfIdfScore + vectorWeight * vectorScore;

      // Filter by minimum score
      if (combinedScore >= minScore) {
        hybridResults.push({
          productId,
          score: combinedScore,
          tfIdfScore,
          vectorScore,
          matchedFields: tfIdfData?.matchedFields ?? [],
          text: includeText ? vectorData?.text : undefined,
        });
      }
    }

    // Step 5: Sort by combined score (descending) and return top k
    hybridResults.sort((a, b) => b.score - a.score);
    const topResults = hybridResults.slice(0, k);

    console.log(
      `[HybridSearch] Combined ${allProductIds.size} unique products, ` +
      `${hybridResults.length} above threshold, returning top ${topResults.length}`
    );

    return topResults;
  } catch (error) {
    console.error('[HybridSearch] Search failed:', error);
    throw error;
  }
}

/**
 * Get search statistics for analysis
 * 
 * Useful for understanding the contribution of each search method
 * and optimizing weights.
 * 
 * @param results - Hybrid search results
 * @returns Statistics about score distribution
 */
export function getSearchStats(results: HybridSearchResult[]): {
  totalResults: number;
  avgCombinedScore: number;
  avgTfIdfScore: number;
  avgVectorScore: number;
  tfIdfDominant: number;
  vectorDominant: number;
  balanced: number;
} {
  if (results.length === 0) {
    return {
      totalResults: 0,
      avgCombinedScore: 0,
      avgTfIdfScore: 0,
      avgVectorScore: 0,
      tfIdfDominant: 0,
      vectorDominant: 0,
      balanced: 0,
    };
  }

  let tfIdfDominant = 0;
  let vectorDominant = 0;
  let balanced = 0;

  const totalCombinedScore = results.reduce((sum, r) => sum + r.score, 0);
  const totalTfIdfScore = results.reduce((sum, r) => sum + r.tfIdfScore, 0);
  const totalVectorScore = results.reduce((sum, r) => sum + r.vectorScore, 0);

  for (const result of results) {
    const diff = Math.abs(result.tfIdfScore - result.vectorScore);
    
    if (diff < 0.2) {
      balanced++;
    } else if (result.tfIdfScore > result.vectorScore) {
      tfIdfDominant++;
    } else {
      vectorDominant++;
    }
  }

  return {
    totalResults: results.length,
    avgCombinedScore: totalCombinedScore / results.length,
    avgTfIdfScore: totalTfIdfScore / results.length,
    avgVectorScore: totalVectorScore / results.length,
    tfIdfDominant,
    vectorDominant,
    balanced,
  };
}

/**
 * Recommend optimal search mode based on query characteristics
 * 
 * Heuristics:
 * - Keyword mode: Short queries, product codes, exact terms
 * - Semantic mode: Long queries, natural language, questions
 * - Balanced mode: Default for general queries
 * 
 * @param query - Search query text
 * @returns Recommended search mode
 */
export function recommendSearchMode(query: string): 'balanced' | 'keyword' | 'semantic' {
  const normalized = query.trim().toLowerCase();
  const words = normalized.split(/\s+/);

  // Keyword mode: Short queries or product codes
  if (words.length <= 2) {
    return 'keyword';
  }

  // Semantic mode: Questions or long natural language
  if (
    normalized.startsWith('what') ||
    normalized.startsWith('how') ||
    normalized.startsWith('which') ||
    normalized.startsWith('show me') ||
    words.length >= 7
  ) {
    return 'semantic';
  }

  // Balanced mode: Default
  return 'balanced';
}
