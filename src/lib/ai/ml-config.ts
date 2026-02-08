/**
 * ML Model Configuration for MASH AI Assistant
 * 
 * Centralized configuration for AI/ML models used in the chatbot.
 * Supports multiple model providers with fallback strategies.
 * 
 * Features:
 * - Dynamic model selection based on query type
 * - Fallback model configuration for reliability
 * - Performance optimization settings
 * - Context window management
 */

export type ModelProvider = 'gemini' | 'openai' | 'anthropic' | 'huggingface';
export type QueryType = 'product_search' | 'recipe_help' | 'general_chat' | 'cooking_tips';

export interface ModelConfig {
  provider: ModelProvider;
  modelName: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  contextWindow: number;
  enabled: boolean;
}

export interface MLConfiguration {
  primary: ModelConfig;
  fallback: ModelConfig;
  embeddings: {
    provider: ModelProvider;
    modelName: string;
    dimensions: number;
  };
  rag: {
    chunkSize: number;
    chunkOverlap: number;
    topK: number;
    similarityThreshold: number;
  };
  performance: {
    maxRetries: number;
    timeoutMs: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
}

/**
 * Default ML configuration for MASH AI Assistant
 */
export const defaultMLConfig: MLConfiguration = {
  primary: {
    provider: 'gemini',
    modelName: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.95,
    contextWindow: 32000,
    enabled: true,
  },
  fallback: {
    provider: 'huggingface',
    modelName: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.95,
    contextWindow: 16000,
    enabled: true,
  },
  embeddings: {
    provider: 'gemini',
    modelName: 'text-embedding-004',
    dimensions: 768,
  },
  rag: {
    chunkSize: 1000,
    chunkOverlap: 200,
    topK: 5,
    similarityThreshold: 0.7,
  },
  performance: {
    maxRetries: 3,
    timeoutMs: 30000,
    cacheEnabled: true,
    cacheTTL: 3600, // 1 hour
  },
};

/**
 * Query-specific model configurations
 * Different query types may benefit from different model parameters
 */
export const queryTypeConfigs: Record<QueryType, Partial<ModelConfig>> = {
  product_search: {
    temperature: 0.3, // Lower temperature for more focused product searches
    maxTokens: 1024,
  },
  recipe_help: {
    temperature: 0.7, // Balanced for creative but accurate recipe suggestions
    maxTokens: 2048,
  },
  general_chat: {
    temperature: 0.8, // Higher temperature for more conversational responses
    maxTokens: 1024,
  },
  cooking_tips: {
    temperature: 0.6, // Moderate temperature for helpful, accurate tips
    maxTokens: 1536,
  },
};

/**
 * Get optimized model config for specific query type
 */
export function getModelConfigForQuery(
  queryType: QueryType,
  baseConfig: MLConfiguration = defaultMLConfig
): ModelConfig {
  const queryOverrides = queryTypeConfigs[queryType];
  return {
    ...baseConfig.primary,
    ...queryOverrides,
  };
}

/**
 * Model capability matrix
 * Defines which models support which features
 */
export const modelCapabilities = {
  gemini: {
    streaming: true,
    functionCalling: true,
    imageInput: true,
    multimodal: true,
    maxContextWindow: 32000,
  },
  openai: {
    streaming: true,
    functionCalling: true,
    imageInput: true,
    multimodal: true,
    maxContextWindow: 128000,
  },
  anthropic: {
    streaming: true,
    functionCalling: true,
    imageInput: true,
    multimodal: true,
    maxContextWindow: 200000,
  },
  huggingface: {
    streaming: false,
    functionCalling: false,
    imageInput: false,
    multimodal: false,
    maxContextWindow: 16000,
  },
};

/**
 * Calculate token estimate for context management
 */
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Check if context fits within model limits
 */
export function validateContextSize(
  context: string,
  config: ModelConfig
): { valid: boolean; estimatedTokens: number; maxTokens: number } {
  const estimatedTokens = estimateTokens(context);
  return {
    valid: estimatedTokens <= config.contextWindow,
    estimatedTokens,
    maxTokens: config.contextWindow,
  };
}

/**
 * Model health status tracking
 */
export interface ModelHealthStatus {
  provider: ModelProvider;
  healthy: boolean;
  lastChecked: number;
  averageLatency: number;
  errorRate: number;
  requestCount: number;
}

/**
 * In-memory health status cache
 */
const healthStatusCache = new Map<ModelProvider, ModelHealthStatus>();

/**
 * Reset health cache - used by tests to ensure isolation
 */
export function resetHealthCache(): void {
  healthStatusCache.clear();
}

/**
 * Update model health status
 */
export function updateModelHealth(
  provider: ModelProvider,
  success: boolean,
  latency: number
): void {
  const current = healthStatusCache.get(provider) || {
    provider,
    healthy: true,
    lastChecked: Date.now(),
    averageLatency: 0,
    errorRate: 0,
    requestCount: 0,
  };

  const newCount = current.requestCount + 1;
  const newAverageLatency =
    (current.averageLatency * current.requestCount + latency) / newCount;
  const newErrorRate = success
    ? (current.errorRate * current.requestCount) / newCount
    : (current.errorRate * current.requestCount + 1) / newCount;

  healthStatusCache.set(provider, {
    ...current,
    healthy: newErrorRate < 0.5 && newAverageLatency < 5000,
    lastChecked: Date.now(),
    averageLatency: newAverageLatency,
    errorRate: newErrorRate,
    requestCount: newCount,
  });
}

/**
 * Get current model health status
 */
export function getModelHealth(provider: ModelProvider): ModelHealthStatus | null {
  return healthStatusCache.get(provider) || null;
}

/**
 * Select best available model based on health status
 */
export function selectHealthyModel(config: MLConfiguration): ModelConfig {
  const primaryHealth = getModelHealth(config.primary.provider);
  const fallbackHealth = getModelHealth(config.fallback.provider);

  // If primary is healthy or no health data yet, use primary
  if (!primaryHealth || primaryHealth.healthy) {
    return config.primary;
  }

  // If primary is unhealthy and fallback is enabled, use fallback
  if (config.fallback.enabled && (!fallbackHealth || fallbackHealth.healthy)) {
    console.warn(
      `[ML Config] Primary model ${config.primary.provider} unhealthy, using fallback ${config.fallback.provider}`
    );
    return config.fallback;
  }

  // If both unhealthy, still return primary (will fail and retry logic will handle)
  console.error('[ML Config] All models unhealthy, attempting primary anyway');
  return config.primary;
}
