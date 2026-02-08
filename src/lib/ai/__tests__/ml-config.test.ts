/**
 * Comprehensive Unit Tests for ML Configuration
 * Tests model selection, health tracking, and context validation
 */

import {
  defaultMLConfig,
  queryTypeConfigs,
  getModelConfigForQuery,
  modelCapabilities,
  estimateTokens,
  validateContextSize,
  updateModelHealth,
  getModelHealth,
  selectHealthyModel,
  resetHealthCache,
  type ModelProvider,
  type QueryType,
  type ModelConfig,
  type MLConfiguration,
} from '../ml-config';

describe('ML Configuration', () => {
  describe('defaultMLConfig', () => {
    it('should have valid primary model configuration', () => {
      expect(defaultMLConfig.primary).toBeDefined();
      expect(defaultMLConfig.primary.provider).toBe('gemini');
      expect(defaultMLConfig.primary.modelName).toBe('gemini-1.5-flash');
      expect(defaultMLConfig.primary.temperature).toBe(0.7);
      expect(defaultMLConfig.primary.enabled).toBe(true);
    });

    it('should have valid fallback model configuration', () => {
      expect(defaultMLConfig.fallback).toBeDefined();
      expect(defaultMLConfig.fallback.provider).toBe('huggingface');
      expect(defaultMLConfig.fallback.enabled).toBe(true);
    });

    it('should have valid embeddings configuration', () => {
      expect(defaultMLConfig.embeddings).toBeDefined();
      expect(defaultMLConfig.embeddings.provider).toBe('gemini');
      expect(defaultMLConfig.embeddings.dimensions).toBe(768);
    });

    it('should have valid RAG configuration', () => {
      expect(defaultMLConfig.rag).toBeDefined();
      expect(defaultMLConfig.rag.chunkSize).toBe(1000);
      expect(defaultMLConfig.rag.topK).toBe(5);
      expect(defaultMLConfig.rag.similarityThreshold).toBe(0.7);
    });

    it('should have valid performance configuration', () => {
      expect(defaultMLConfig.performance).toBeDefined();
      expect(defaultMLConfig.performance.maxRetries).toBe(3);
      expect(defaultMLConfig.performance.timeoutMs).toBe(30000);
      expect(defaultMLConfig.performance.cacheEnabled).toBe(true);
    });
  });

  describe('queryTypeConfigs', () => {
    it('should have configuration for all query types', () => {
      const expectedTypes: QueryType[] = [
        'product_search',
        'recipe_help',
        'general_chat',
        'cooking_tips',
      ];

      expectedTypes.forEach((type) => {
        expect(queryTypeConfigs[type]).toBeDefined();
      });
    });

    it('should have lower temperature for product_search', () => {
      expect(queryTypeConfigs.product_search.temperature).toBe(0.3);
      expect(queryTypeConfigs.product_search.temperature).toBeLessThan(0.7);
    });

    it('should have balanced temperature for recipe_help', () => {
      expect(queryTypeConfigs.recipe_help.temperature).toBe(0.7);
    });

    it('should have higher temperature for general_chat', () => {
      expect(queryTypeConfigs.general_chat.temperature).toBe(0.8);
      expect(queryTypeConfigs.general_chat.temperature).toBeGreaterThan(0.7);
    });

    it('should have moderate temperature for cooking_tips', () => {
      expect(queryTypeConfigs.cooking_tips.temperature).toBe(0.6);
    });
  });

  describe('getModelConfigForQuery', () => {
    it('should return config optimized for product_search', () => {
      const config = getModelConfigForQuery('product_search');

      expect(config.temperature).toBe(0.3);
      expect(config.maxTokens).toBe(1024);
      expect(config.provider).toBe('gemini');
    });

    it('should return config optimized for recipe_help', () => {
      const config = getModelConfigForQuery('recipe_help');

      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(2048);
    });

    it('should merge query overrides with base config', () => {
      const config = getModelConfigForQuery('product_search');

      // Should keep base provider
      expect(config.provider).toBe(defaultMLConfig.primary.provider);
      // Should override temperature
      expect(config.temperature).not.toBe(defaultMLConfig.primary.temperature);
    });

    it('should accept custom base config', () => {
      const customConfig: MLConfiguration = {
        ...defaultMLConfig,
        primary: {
          ...defaultMLConfig.primary,
          provider: 'openai',
          modelName: 'gpt-4',
        },
      };

      const config = getModelConfigForQuery('product_search', customConfig);

      expect(config.provider).toBe('openai');
      expect(config.modelName).toBe('gpt-4');
    });
  });

  describe('modelCapabilities', () => {
    it('should define capabilities for all providers', () => {
      const providers: ModelProvider[] = ['gemini', 'openai', 'anthropic', 'huggingface'];

      providers.forEach((provider) => {
        expect(modelCapabilities[provider]).toBeDefined();
      });
    });

    it('should correctly define Gemini capabilities', () => {
      expect(modelCapabilities.gemini.streaming).toBe(true);
      expect(modelCapabilities.gemini.functionCalling).toBe(true);
      expect(modelCapabilities.gemini.multimodal).toBe(true);
    });

    it('should correctly define HuggingFace limitations', () => {
      expect(modelCapabilities.huggingface.streaming).toBe(false);
      expect(modelCapabilities.huggingface.functionCalling).toBe(false);
      expect(modelCapabilities.huggingface.imageInput).toBe(false);
    });

    it('should have maxContextWindow for all providers', () => {
      const providers: ModelProvider[] = ['gemini', 'openai', 'anthropic', 'huggingface'];

      providers.forEach((provider) => {
        expect(modelCapabilities[provider].maxContextWindow).toBeGreaterThan(0);
      });
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });

    it('should estimate ~4 characters per token', () => {
      const text = 'a'.repeat(400);
      const estimate = estimateTokens(text);

      expect(estimate).toBe(100);
    });

    it('should round up partial tokens', () => {
      const text = 'a'.repeat(401);
      const estimate = estimateTokens(text);

      expect(estimate).toBe(101);
    });

    it('should handle typical message length', () => {
      const text = 'Show me oyster mushrooms for cooking';
      const estimate = estimateTokens(text);

      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(20);
    });
  });

  describe('validateContextSize', () => {
    const config: ModelConfig = {
      provider: 'gemini',
      modelName: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.95,
      contextWindow: 1000,
      enabled: true,
    };

    it('should validate context within limits', () => {
      const context = 'a'.repeat(2000); // ~500 tokens
      const result = validateContextSize(context, config);

      expect(result.valid).toBe(true);
      expect(result.estimatedTokens).toBeLessThanOrEqual(result.maxTokens);
    });

    it('should invalidate context exceeding limits', () => {
      const context = 'a'.repeat(5000); // ~1250 tokens
      const result = validateContextSize(context, config);

      expect(result.valid).toBe(false);
      expect(result.estimatedTokens).toBeGreaterThan(result.maxTokens);
    });

    it('should return estimated tokens', () => {
      const context = 'test message';
      const result = validateContextSize(context, config);

      expect(result.estimatedTokens).toBeGreaterThan(0);
    });

    it('should return max tokens from config', () => {
      const context = 'test';
      const result = validateContextSize(context, config);

      expect(result.maxTokens).toBe(config.contextWindow);
    });
  });

  describe('Model Health Tracking', () => {
    beforeEach(() => {
      // Clear health cache between tests for isolation
      resetHealthCache();
    });

    describe('updateModelHealth', () => {
      it('should initialize health status on first update', () => {
        updateModelHealth('gemini', true, 1000);
        const health = getModelHealth('gemini');

        expect(health).not.toBeNull();
        expect(health?.provider).toBe('gemini');
        expect(health?.requestCount).toBe(1);
      });

      it('should track successful requests', () => {
        updateModelHealth('gemini', true, 1000);
        updateModelHealth('gemini', true, 1200);
        const health = getModelHealth('gemini');

        expect(health?.requestCount).toBe(2);
        expect(health?.healthy).toBe(true);
      });

      it('should track failed requests', () => {
        updateModelHealth('openai', false, 5000);
        const health = getModelHealth('openai');

        expect(health?.errorRate).toBeGreaterThan(0);
      });

      it('should calculate average latency', () => {
        updateModelHealth('anthropic', true, 1000);
        updateModelHealth('anthropic', true, 2000);
        const health = getModelHealth('anthropic');

        expect(health?.averageLatency).toBe(1500);
      });

      it('should mark unhealthy when error rate exceeds threshold', () => {
        // All failures
        updateModelHealth('huggingface', false, 1000);
        updateModelHealth('huggingface', false, 1000);
        const health = getModelHealth('huggingface');

        expect(health?.healthy).toBe(false);
      });

      it('should mark unhealthy when latency exceeds threshold', () => {
        // Need enough requests with high latency to exceed 5000ms average
        updateModelHealth('gemini', true, 6000);
        updateModelHealth('gemini', true, 6000);
        const health = getModelHealth('gemini');

        expect(health?.healthy).toBe(false);
      });

      it('should update lastChecked timestamp', () => {
        const before = Date.now();
        updateModelHealth('openai', true, 1000);
        const after = Date.now();
        const health = getModelHealth('openai');

        expect(health?.lastChecked).toBeGreaterThanOrEqual(before);
        expect(health?.lastChecked).toBeLessThanOrEqual(after);
      });
    });

    describe('getModelHealth', () => {
      it('should return null for unknown provider', () => {
        // After reset, no data exists
        const health = getModelHealth('openai');

        expect(health).toBeNull();
      });

      it('should return health status after update', () => {
        updateModelHealth('gemini', true, 1000);
        const health = getModelHealth('gemini');

        expect(health).not.toBeNull();
        expect(health?.provider).toBe('gemini');
      });
    });

    describe('selectHealthyModel', () => {
      it('should select primary when healthy', () => {
        updateModelHealth('gemini', true, 1000);
        const model = selectHealthyModel(defaultMLConfig);

        expect(model.provider).toBe(defaultMLConfig.primary.provider);
      });

      it('should select primary when no health data', () => {
        const model = selectHealthyModel(defaultMLConfig);

        expect(model.provider).toBe(defaultMLConfig.primary.provider);
      });

      it('should select fallback when primary unhealthy', () => {
        // Make primary unhealthy with 100% error rate
        updateModelHealth('gemini', false, 1000);

        const model = selectHealthyModel(defaultMLConfig);

        expect(model.provider).toBe(defaultMLConfig.fallback.provider);
      });

      it('should select primary when both unhealthy', () => {
        // Make both unhealthy
        updateModelHealth('gemini', false, 1000);
        updateModelHealth('huggingface', false, 1000);

        const model = selectHealthyModel(defaultMLConfig);

        // Should still return primary as last resort
        expect(model.provider).toBe(defaultMLConfig.primary.provider);
      });

      it('should not select disabled fallback', () => {
        const configWithDisabledFallback: MLConfiguration = {
          ...defaultMLConfig,
          fallback: {
            ...defaultMLConfig.fallback,
            enabled: false,
          },
        };

        // Make primary unhealthy
        updateModelHealth('gemini', false, 1000);

        const model = selectHealthyModel(configWithDisabledFallback);

        expect(model.provider).toBe('gemini'); // Still primary despite being unhealthy
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      resetHealthCache();
    });

    it('should handle complete workflow from query to model selection', () => {
      // 1. Get optimized config for query type
      const config = getModelConfigForQuery('product_search');

      // 2. Validate context size
      const context = 'Show me fresh oyster mushrooms';
      const validation = validateContextSize(context, config);

      expect(validation.valid).toBe(true);

      // 3. Update model health
      updateModelHealth(config.provider, true, 1500);

      // 4. Select healthy model
      const selectedModel = selectHealthyModel(defaultMLConfig);

      expect(selectedModel.provider).toBe(config.provider);
    });

    it('should handle fallback scenario', () => {
      // 1. Make primary unhealthy with 100% error rate
      updateModelHealth('gemini', false, 1000);

      // 2. Select model (should fallback)
      const model = selectHealthyModel(defaultMLConfig);

      expect(model.provider).toBe('huggingface');

      // 3. Verify fallback capabilities
      const capabilities = modelCapabilities[model.provider];
      expect(capabilities).toBeDefined();
    });

    it('should optimize different query types appropriately', () => {
      const productSearch = getModelConfigForQuery('product_search');
      const generalChat = getModelConfigForQuery('general_chat');

      // Product search should be more focused
      expect(productSearch.temperature).toBeLessThan(generalChat.temperature);

      // General chat should allow more tokens for conversational flow
      expect(generalChat.temperature).toBe(0.8);
    });
  });
});
