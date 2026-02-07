/**
 * Query Expansion Service
 * 
 * Expands user queries using semantic similarity to improve search recall.
 * Uses Gemini AI to generate related search terms and mushroom-specific synonyms.
 * 
 * @module query-expansion
 */

import { generateResponse } from './gemini-client';

/**
 * Query expansion options
 */
export interface QueryExpansionOptions {
  /** Maximum number of similar terms to generate (1-10) */
  maxTerms?: number;
  /** Include original query in results */
  includeOriginal?: boolean;
  /** Use cached expansions if available */
  useCache?: boolean;
  /** Temperature for Gemini (0-1, higher = more creative) */
  temperature?: number;
}

/**
 * Query expansion result
 */
export interface QueryExpansionResult {
  /** Original query */
  originalQuery: string;
  /** Expanded query terms (includes original if includeOriginal=true) */
  expandedTerms: string[];
  /** Timestamp of expansion */
  timestamp: Date;
  /** Model used for expansion */
  model: string;
}

/**
 * In-memory cache for query expansions
 * Key: query string (lowercase)
 * Value: { terms: string[], timestamp: number }
 */
const expansionCache = new Map<string, { terms: string[]; timestamp: number }>();

/**
 * Cache TTL in milliseconds (1 hour)
 */
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Mushroom-specific synonym database for common terms
 * Provides instant expansion without API calls for known terms
 */
const MUSHROOM_SYNONYMS: Record<string, string[]> = {
  // Common names
  'cheap': ['affordable', 'budget', 'inexpensive', 'low-cost', 'economical'],
  'expensive': ['premium', 'high-end', 'luxury', 'gourmet', 'specialty'],
  'fresh': ['new', 'recently harvested', 'just picked', 'crisp'],
  'organic': ['natural', 'pesticide-free', 'chemical-free', 'eco-friendly'],
  'dried': ['dehydrated', 'preserved', 'dry', 'desiccated'],
  
  // Mushroom types (scientific + common names)
  'shiitake': ['lentinula edodes', 'black mushroom', 'forest mushroom'],
  'oyster': ['pleurotus', 'pearl oyster', 'tree oyster'],
  'button': ['agaricus', 'white mushroom', 'champignon', 'table mushroom'],
  'portobello': ['portabella', 'large button', 'mature crimini'],
  'enoki': ['enokitake', 'golden needle', 'winter mushroom'],
  'maitake': ['hen of the woods', 'grifola frondosa', 'dancing mushroom'],
  'reishi': ['lingzhi', 'ganoderma', 'spirit mushroom'],
  'chanterelle': ['golden chanterelle', 'cantharellus', 'girolle'],
  'morel': ['morchella', 'honeycomb mushroom', 'sponge mushroom'],
  'porcini': ['boletus', 'king bolete', 'penny bun'],
  
  // Uses
  'medicinal': ['health', 'wellness', 'therapeutic', 'immune-boosting'],
  'cooking': ['culinary', 'edible', 'gourmet', 'cuisine'],
  'soup': ['broth', 'stew', 'stock', 'liquid dish'],
  'stir-fry': ['saute', 'pan-fry', 'wok', 'stir-fried'],
};

/**
 * Clear expired entries from cache
 */
function cleanCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, value] of expansionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      keysToDelete.push(key);
    }
  }
  
  for (const key of keysToDelete) {
    expansionCache.delete(key);
  }
}

/**
 * Get cached expansion if available and not expired
 */
function getCachedExpansion(query: string): string[] | null {
  const cacheKey = query.toLowerCase().trim();
  const cached = expansionCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    expansionCache.delete(cacheKey);
    return null;
  }
  
  return cached.terms;
}

/**
 * Set cache entry
 */
function setCacheEntry(query: string, terms: string[]): void {
  const cacheKey = query.toLowerCase().trim();
  expansionCache.set(cacheKey, {
    terms,
    timestamp: Date.now(),
  });
  
  // Clean cache periodically (every 100 entries)
  if (expansionCache.size % 100 === 0) {
    cleanCache();
  }
}

/**
 * Expand query using local synonym database
 * Returns null if no local synonyms found
 */
function expandFromLocalSynonyms(query: string, maxTerms: number): string[] | null {
  const queryLower = query.toLowerCase().trim();
  const words = queryLower.split(/\s+/);
  
  const expandedTerms: Set<string> = new Set([query]); // Include original
  
  // Check each word for synonyms
  for (const word of words) {
    const synonyms = MUSHROOM_SYNONYMS[word];
    if (synonyms) {
      // Generate term variations by replacing word with synonyms
      for (const synonym of synonyms) {
        if (expandedTerms.size >= maxTerms + 1) break; // +1 for original
        
        const expandedTerm = queryLower.replace(word, synonym);
        expandedTerms.add(expandedTerm);
      }
    }
  }
  
  // Return null if only original term (no synonyms found)
  if (expandedTerms.size === 1) {
    return null;
  }
  
  return Array.from(expandedTerms).slice(0, maxTerms + 1);
}

/**
 * Expand query using Gemini AI
 */
async function expandFromGemini(
  query: string,
  maxTerms: number,
  temperature: number
): Promise<string[]> {
  const prompt = `You are a mushroom product search assistant. Given a search query, generate ${maxTerms} semantically similar search terms that a user might use to find the same products.

Rules:
1. Include synonyms, alternative names, and related terms
2. Focus on mushroom-specific terminology (scientific names, common names)
3. Consider use cases (cooking, medicinal, cultivation)
4. Return ONLY a comma-separated list, no explanations
5. Each term should be concise (2-4 words max)

Examples:

Query: "cheap mushrooms"
Similar terms: affordable mushrooms, budget mushrooms, inexpensive mushrooms, low-cost mushrooms

Query: "shiitake for cooking"
Similar terms: shiitake for recipes, culinary shiitake, cooking shiitake, edible shiitake

Query: "organic oyster"
Similar terms: natural oyster mushroom, pesticide-free oyster, eco-friendly oyster, chemical-free oyster

Now generate similar terms for this query:

Query: "${query}"
Similar terms:`;

  try {
    const response = await generateResponse(prompt, [], {
      temperature: temperature,
      maxTokens: 100,
    });
    
    const similarTerms = response.content
      .split(',')
      .map(term => term.trim())
      .filter(Boolean)
      .filter(term => term.toLowerCase() !== query.toLowerCase())
      .slice(0, maxTerms);
    
    return [query, ...similarTerms]; // Include original query
  } catch (error) {
    console.error('[QueryExpansion] Gemini expansion failed:', error);
    // Fallback to original query only
    return [query];
  }
}

/**
 * Expand a search query using semantic similarity
 * 
 * Strategy:
 * 1. Check cache for previous expansions
 * 2. Try local synonym database for instant expansion
 * 3. Fall back to Gemini AI for complex queries
 * 4. Cache results for future use
 * 
 * @param query - Original search query
 * @param options - Expansion options
 * @returns Query expansion result with expanded terms
 * 
 * @example
 * ```typescript
 * const result = await expandQuery('cheap shiitake');
 * console.log(result.expandedTerms);
 * // ['cheap shiitake', 'affordable shiitake', 'budget shiitake', 'inexpensive shiitake']
 * ```
 */
export async function expandQuery(
  query: string,
  options: QueryExpansionOptions = {}
): Promise<QueryExpansionResult> {
  const {
    maxTerms = 5,
    includeOriginal = true,
    useCache = true,
    temperature = 0.3,
  } = options;
  
  // Validation
  if (!query || query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }
  
  if (maxTerms < 1 || maxTerms > 10) {
    throw new Error('maxTerms must be between 1 and 10');
  }
  
  if (temperature < 0 || temperature > 1) {
    throw new Error('temperature must be between 0 and 1');
  }
  
  console.log(`[QueryExpansion] Expanding: "${query}" (maxTerms=${maxTerms}, useCache=${useCache})`);
  
  const normalizedQuery = query.trim();
  
  // 1. Check cache if enabled
  if (useCache) {
    const cached = getCachedExpansion(normalizedQuery);
    if (cached) {
      console.log('[QueryExpansion] Cache hit - returning cached expansion');
      return {
        originalQuery: normalizedQuery,
        expandedTerms: includeOriginal ? cached : cached.filter(t => t !== normalizedQuery),
        timestamp: new Date(),
        model: 'cached',
      };
    }
  }
  
  // 2. Try local synonyms first (instant, no API call)
  const localExpansion = expandFromLocalSynonyms(normalizedQuery, maxTerms);
  if (localExpansion) {
    console.log('[QueryExpansion] Local synonym expansion successful');
    
    // Cache the result
    if (useCache) {
      setCacheEntry(normalizedQuery, localExpansion);
    }
    
    return {
      originalQuery: normalizedQuery,
      expandedTerms: includeOriginal ? localExpansion : localExpansion.filter(t => t !== normalizedQuery),
      timestamp: new Date(),
      model: 'local-synonyms',
    };
  }
  
  // 3. Fall back to Gemini AI for complex queries
  console.log('[QueryExpansion] Using Gemini AI for expansion');
  const geminiExpansion = await expandFromGemini(normalizedQuery, maxTerms, temperature);
  
  // Cache the result
  if (useCache) {
    setCacheEntry(normalizedQuery, geminiExpansion);
  }
  
  return {
    originalQuery: normalizedQuery,
    expandedTerms: includeOriginal ? geminiExpansion : geminiExpansion.filter(t => t !== normalizedQuery),
    timestamp: new Date(),
    model: 'gemini-flash',
  };
}

/**
 * Batch expand multiple queries
 * 
 * @param queries - Array of queries to expand
 * @param options - Expansion options
 * @returns Array of expansion results
 * 
 * @example
 * ```typescript
 * const results = await batchExpandQueries(['cheap mushrooms', 'organic shiitake']);
 * results.forEach(result => {
 *   console.log(`${result.originalQuery} → ${result.expandedTerms.join(', ')}`);
 * });
 * ```
 */
export async function batchExpandQueries(
  queries: string[],
  options: QueryExpansionOptions = {}
): Promise<QueryExpansionResult[]> {
  if (!Array.isArray(queries) || queries.length === 0) {
    throw new Error('queries must be a non-empty array');
  }
  
  console.log(`[QueryExpansion] Batch expanding ${queries.length} queries`);
  
  // Process in parallel for better performance
  const results = await Promise.all(
    queries.map(query => expandQuery(query, options))
  );
  
  return results;
}

/**
 * Clear the expansion cache
 * Useful for testing or forcing fresh expansions
 */
export function clearCache(): void {
  expansionCache.clear();
  console.log('[QueryExpansion] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
} {
  if (expansionCache.size === 0) {
    return { size: 0, oldestEntry: null, newestEntry: null };
  }
  
  let oldest = Infinity;
  let newest = 0;
  
  for (const { timestamp } of expansionCache.values()) {
    if (timestamp < oldest) oldest = timestamp;
    if (timestamp > newest) newest = timestamp;
  }
  
  return {
    size: expansionCache.size,
    oldestEntry: new Date(oldest),
    newestEntry: new Date(newest),
  };
}
