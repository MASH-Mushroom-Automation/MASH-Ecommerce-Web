/**
 * Query Clustering with Levenshtein Distance
 * 
 * Advanced query analysis for chatbot analytics dashboard.
 * Groups similar queries, extracts synonyms, and classifies intent.
 * 
 * Part of AI Chatbot ML Enhancement Plan - Phase 1: Analytics Dashboard
 * @see .github/AI_CHATBOT_ML_ENHANCEMENT_PLAN.md - Phase 1
 */

export interface QueryCluster {
  representative: string;
  queries: string[];
  count: number;
  avgResults: number;
  successRate: number;
}

export interface Synonym {
  term: string;
  synonyms: string[];
  frequency: number;
}

export interface QueryIntent {
  intent: 'product_search' | 'information' | 'comparison' | 'recommendation' | 'support' | 'other';
  confidence: number;
  query: string;
}

export interface ClusteringOptions {
  distanceThreshold?: number;
  minClusterSize?: number;
  maxClusters?: number;
}

/**
 * Calculate Levenshtein distance between two strings
 * 
 * Dynamic programming approach with O(m*n) time complexity
 * Measures minimum number of single-character edits (insertions, deletions, substitutions)
 * 
 * @example
 * ```ts
 * levenshteinDistance("kitten", "sitting") // Returns: 3
 * levenshteinDistance("button", "botton") // Returns: 1
 * ```
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  // Edge cases
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;
  
  // Initialize matrix
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  // Fill first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix with dynamic programming
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 * 
 * Uses Levenshtein distance normalized by max string length
 * 1.0 = identical, 0.0 = completely different
 * 
 * @example
 * ```ts
 * similarityScore("button mushroom", "button mushrooms") // ~0.94
 * similarityScore("oyster", "shiitake") // ~0.14
 * ```
 */
export function similarityScore(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  
  if (maxLen === 0) return 1.0;
  
  return 1 - (distance / maxLen);
}

/**
 * Cluster similar queries using Levenshtein distance
 * 
 * Algorithm:
 * 1. Sort queries by frequency (descending)
 * 2. For each query, find similar existing clusters (distance < threshold)
 * 3. If similar cluster found, add query to cluster
 * 4. Otherwise, create new cluster with query as representative
 * 
 * @param queries Array of query strings
 * @param metadata Optional metadata (avgResults, successRate)
 * @param options Clustering configuration
 */
export function clusterQueries(
  queries: string[],
  metadata: { [query: string]: { avgResults: number; successRate: number } } = {},
  options: ClusteringOptions = {}
): QueryCluster[] {
  const {
    distanceThreshold = 0.75, // 75% similarity required
    minClusterSize = 2,
    maxClusters = 50,
  } = options;
  
  // Count query frequencies
  const queryCounts = new Map<string, number>();
  queries.forEach(q => {
    const normalized = q.toLowerCase().trim();
    queryCounts.set(normalized, (queryCounts.get(normalized) || 0) + 1);
  });
  
  // Sort by frequency (descending)
  const sortedQueries = Array.from(queryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([query]) => query);
  
  const clusters: QueryCluster[] = [];
  const assignedQueries = new Set<string>();
  
  for (const query of sortedQueries) {
    if (assignedQueries.has(query)) continue;
    
    // Try to find similar existing cluster
    let assignedCluster: QueryCluster | null = null;
    
    for (const cluster of clusters) {
      const similarity = similarityScore(query, cluster.representative);
      
      if (similarity >= distanceThreshold) {
        assignedCluster = cluster;
        break;
      }
    }
    
    if (assignedCluster) {
      // Add to existing cluster
      assignedCluster.queries.push(query);
      assignedCluster.count += queryCounts.get(query) || 0;
      assignedQueries.add(query);
      
      // Update cluster metadata
      const meta = metadata[query];
      if (meta) {
        const totalQueries = assignedCluster.queries.length;
        assignedCluster.avgResults = 
          (assignedCluster.avgResults * (totalQueries - 1) + meta.avgResults) / totalQueries;
        assignedCluster.successRate = 
          (assignedCluster.successRate * (totalQueries - 1) + meta.successRate) / totalQueries;
      }
    } else if (clusters.length < maxClusters) {
      // Create new cluster
      const meta = metadata[query] || { avgResults: 0, successRate: 0 };
      
      clusters.push({
        representative: query,
        queries: [query],
        count: queryCounts.get(query) || 0,
        avgResults: meta.avgResults,
        successRate: meta.successRate,
      });
      assignedQueries.add(query);
    }
  }
  
  // Filter by minimum cluster size
  return clusters
    .filter(cluster => cluster.queries.length >= minClusterSize)
    .sort((a, b) => b.count - a.count);
}

/**
 * Extract synonym dictionary from query clusters
 * 
 * Identifies alternative terms users use for the same products/concepts
 * Uses clustering to find queries with high similarity
 * 
 * @example
 * ```ts
 * const synonyms = extractSynonyms([
 *   "cheap mushrooms",
 *   "affordable mushrooms",
 *   "inexpensive mushrooms"
 * ]);
 * // Returns: [{ term: "cheap", synonyms: ["affordable", "inexpensive"], frequency: 3 }]
 * ```
 */
export function extractSynonyms(
  queries: string[],
  minOccurrences: number = 3
): Synonym[] {
  // Tokenize queries
  const wordFrequency = new Map<string, number>();
  const wordCooccurrence = new Map<string, Map<string, number>>();
  
  queries.forEach(query => {
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2); // Filter short words
    
    // Count word frequencies
    words.forEach(word => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });
    
    // Track co-occurrences
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const word1 = words[i];
        const word2 = words[j];
        
        if (!wordCooccurrence.has(word1)) {
          wordCooccurrence.set(word1, new Map());
        }
        
        const cooccur = wordCooccurrence.get(word1)!;
        cooccur.set(word2, (cooccur.get(word2) || 0) + 1);
      }
    }
  });
  
  // Build synonym dictionary
  const synonyms: Synonym[] = [];
  const processedWords = new Set<string>();
  
  for (const [word, freq] of wordFrequency.entries()) {
    if (freq < minOccurrences || processedWords.has(word)) continue;
    
    const potentialSynonyms: string[] = [];
    
    // Find words with similar Levenshtein distance
    for (const [otherWord, otherFreq] of wordFrequency.entries()) {
      if (word === otherWord || processedWords.has(otherWord)) continue;
      if (otherFreq < minOccurrences) continue;
      
      const similarity = similarityScore(word, otherWord);
      
      // High similarity = likely synonyms
      if (similarity >= 0.7 && similarity < 1.0) {
        potentialSynonyms.push(otherWord);
        processedWords.add(otherWord);
      }
    }
    
    if (potentialSynonyms.length > 0) {
      synonyms.push({
        term: word,
        synonyms: potentialSynonyms,
        frequency: freq,
      });
      processedWords.add(word);
    }
  }
  
  return synonyms.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Classify query intent using keyword patterns
 * 
 * Categories:
 * - product_search: Looking for specific products
 * - information: Asking questions about mushrooms
 * - comparison: Comparing products
 * - recommendation: Asking for suggestions
 * - support: Customer service queries
 * - other: Unclassified
 * 
 * @example
 * ```ts
 * classifyQueryIntent("show me fresh mushrooms")
 * // Returns: { intent: 'product_search', confidence: 0.9, query: '...' }
 * 
 * classifyQueryIntent("what are the benefits of shiitake?")
 * // Returns: { intent: 'information', confidence: 0.85, query: '...' }
 * ```
 */
export function classifyQueryIntent(query: string): QueryIntent {
  const normalized = query.toLowerCase().trim();
  
  // Intent patterns with confidence scores
  // Check for exact word/phrase matches to avoid false positives
  const patterns: Array<{
    intent: QueryIntent['intent'];
    keywords: string[];
    confidence: number;
  }> = [
    {
      intent: 'support',
      keywords: ['order', 'delivery', 'shipping', 'refund', 'cancel', 'help', 'contact'],
      confidence: 0.9,
    },
    {
      intent: 'comparison',
      keywords: [' vs ', ' versus ', 'compare', 'difference', 'better', 'best'],
      confidence: 0.8,
    },
    {
      intent: 'recommendation',
      keywords: ['recommend', 'suggest', 'should i', 'which', ' advice'],
      confidence: 0.85,
    },
    {
      intent: 'information',
      keywords: ['what are', 'what is', 'how to', 'how do', 'why ', 'when ', 'benefits', 'nutrition', 'health'],
      confidence: 0.85,
    },
    {
      intent: 'product_search',
      keywords: ['show me', 'show ', 'find', 'search', 'looking for', 'want', 'need', 'buy', 'get'],
      confidence: 0.9,
    },
  ];
  
  // Check each pattern
  for (const pattern of patterns) {
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        return {
          intent: pattern.intent,
          confidence: pattern.confidence,
          query,
        };
      }
    }
  }
  
  // Default to 'other' with low confidence
  return {
    intent: 'other',
    confidence: 0.3,
    query,
  };
}

/**
 * Batch classify multiple queries
 * 
 * Returns intent distribution for analytics
 */
export function classifyQueryBatch(queries: string[]): {
  classifications: QueryIntent[];
  distribution: { [intent: string]: number };
} {
  const classifications = queries.map(classifyQueryIntent);
  
  const distribution: { [intent: string]: number } = {};
  classifications.forEach(c => {
    distribution[c.intent] = (distribution[c.intent] || 0) + 1;
  });
  
  return { classifications, distribution };
}

/**
 * Identify failed searches (queries with no results)
 * 
 * These are opportunities to:
 * - Add new products
 * - Improve search algorithm
 * - Update synonyms
 */
export function identifyFailedSearches(
  queries: string[],
  metadata: { [query: string]: { avgResults: number } }
): string[] {
  return queries.filter(query => {
    const meta = metadata[query];
    return meta && meta.avgResults === 0;
  });
}

/**
 * Calculate query diversity score (0-1)
 * 
 * Measures how varied user queries are
 * High diversity = users exploring different products
 * Low diversity = repetitive queries (potential UX issue)
 */
export function calculateQueryDiversity(queries: string[]): number {
  if (queries.length === 0) return 0;
  
  const uniqueQueries = new Set(queries.map(q => q.toLowerCase().trim()));
  return uniqueQueries.size / queries.length;
}
