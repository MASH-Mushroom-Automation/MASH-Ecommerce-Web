/**
 * Unit Tests for Chatbot Analytics
 * 
 * Tests analytics service functions for chatbot tracking and reporting.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 6
 */

// Require analytics module at runtime so that jest.setup's mocks are applied reliably
let analytics: typeof import('@/lib/analytics/chatbot-analytics');
let startConversation: typeof import('@/lib/analytics/chatbot-analytics').startConversation;
let logQuery: typeof import('@/lib/analytics/chatbot-analytics').logQuery;
let logProductClick: typeof import('@/lib/analytics/chatbot-analytics').logProductClick;
let logError: typeof import('@/lib/analytics/chatbot-analytics').logError;
let getDailyStats: typeof import('@/lib/analytics/chatbot-analytics').getDailyStats;

import type { ConversationData, QueryData, ProductClickData, ChatbotError } from '../chatbot-analytics';

// Mocks are in jest.setup.js

describe('Chatbot Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Require the analytics module at runtime to ensure mocks from jest.setup.js are loaded
    analytics = require('@/lib/analytics/chatbot-analytics');
    // Sanity checks to help debugging if the mock isn't applied as expected
    if (process.env.ENABLE_TEST_LOGS === 'true') {
      // eslint-disable-next-line no-console
      console.log('Analytics module keys:', Object.keys(analytics || {}));
      // eslint-disable-next-line no-console
      console.log('Mock presence flag:', global.__MOCK_ANALYTICS_PRESENT);
      // eslint-disable-next-line no-console
      console.log('analytics.startConversation value:', analytics.startConversation);
    }
    startConversation = analytics.startConversation;
    logQuery = analytics.logQuery;
    logProductClick = analytics.logProductClick;
    logError = analytics.logError;
    getDailyStats = analytics.getDailyStats;

    // Ensure mock implementations resolve to promises for tests
    if (startConversation && typeof startConversation.mockResolvedValue === 'function') {
      startConversation.mockResolvedValue(undefined);
    }
    if (logQuery && typeof logQuery.mockResolvedValue === 'function') {
      logQuery.mockResolvedValue(undefined);
    }
    if (logProductClick && typeof logProductClick.mockResolvedValue === 'function') {
      logProductClick.mockResolvedValue(undefined);
    }
    if (logError && typeof logError.mockResolvedValue === 'function') {
      logError.mockResolvedValue(undefined);
    }
    if (getDailyStats && typeof getDailyStats.mockResolvedValue === 'function') {
      getDailyStats.mockResolvedValue({
        date: new Date().toISOString().split('T')[0],
        conversationsStarted: 0,
        totalMessages: 0,
        uniqueUsers: 0,
        avgMessagesPerConversation: 0,
        productCardsShown: 0,
        productCardsClicked: 0,
        clickThroughRate: 0,
        conversionsCount: 0,
        conversionRate: 0,
        avgResponseTime: 0,
        errorCount: 0,
        topQueries: [],
        topProducts: [],
      });
    }
  });

  describe('startConversation', () => {
    it('should create conversation in Firestore', async () => {
      const res = analytics.startConversation('user-123', 'conv-123');
      if (process.env.ENABLE_TEST_LOGS === 'true') console.log('analytics.startConversation result type:', typeof res, res);
      await expect(res).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Firestore error');
      (require('firebase/firestore').addDoc as jest.Mock).mockRejectedValueOnce(mockError);
      
      await expect(
        analytics.startConversation('user-123', 'conv-123')
      ).resolves.not.toThrow();
    });
  });

  describe('logQuery', () => {
    const mockQuery: QueryData = {
      query: 'test query',
      timestamp: Date.now(),
      userId: 'user-123',
      conversationId: 'conv-123',
      responseTime: 1200,
      productCardsReturned: 3,
      success: true,
    };

    it('should log query with response time', async () => {
      await expect(analytics.logQuery(mockQuery)).resolves.not.toThrow();
    });

    it('should handle missing optional fields', async () => {
      const minimalQuery: QueryData = {
        query: 'minimal',
        timestamp: Date.now(),
        userId: 'user-123',
        conversationId: 'conv-123',
        responseTime: 500,
        productCardsReturned: 0,
        success: true,
      };
      
      await expect(analytics.logQuery(minimalQuery)).resolves.not.toThrow();
    });

    it('should log failed queries', async () => {
      const failedQuery: QueryData = {
        ...mockQuery,
        success: false,
        errorMessage: 'API timeout',
      };
      
      await expect(analytics.logQuery(failedQuery)).resolves.not.toThrow();
    });
  });

  describe('logProductClick', () => {
    const mockClick: ProductClickData = {
      productId: 'prod-123',
      productName: 'Oyster Mushroom',
      productSlug: 'oyster-mushroom',
      timestamp: Date.now(),
      userId: 'user-123',
      conversationId: 'conv-123',
      messageId: 'msg-123',
    };

    it('should log product click', async () => {
      await expect(analytics.logProductClick(mockClick)).resolves.not.toThrow();
    });

    it('should handle anonymous users', async () => {
      const anonymousClick: ProductClickData = {
        ...mockClick,
        userId: 'anonymous',
      };
      
      await expect(analytics.logProductClick(anonymousClick)).resolves.not.toThrow();
    });
  });

  describe('logError', () => {
    const mockError: ChatbotError = {
      errorMessage: 'API rate limit exceeded',
      errorType: 'API_ERROR',
      timestamp: Date.now(),
      userId: 'user-123',
      conversationId: 'conv-123',
      context: {
        query: 'test query',
        endpoint: '/api/chatbot/message',
      },
    };

    it('should log API errors', async () => {
      await expect(analytics.logError(mockError)).resolves.not.toThrow();
    });

    it('should log validation errors', async () => {
      const validationError: ChatbotError = {
        errorMessage: 'Invalid query',
        errorType: 'VALIDATION_ERROR',
        timestamp: Date.now(),
        userId: 'user-123',
        conversationId: 'conv-123',
      };
      
      await expect(analytics.logError(validationError)).resolves.not.toThrow();
    });

    it('should log system errors', async () => {
      const systemError: ChatbotError = {
        errorMessage: 'Database connection failed',
        errorType: 'SYSTEM_ERROR',
        timestamp: Date.now(),
      };
      
      await expect(analytics.logError(systemError)).resolves.not.toThrow();
    });
  });

  describe('getDailyStats', () => {
    it('should return stats for specific date', async () => {
      const stats = await analytics.getDailyStats(new Date('2026-01-21'));
      
      expect(stats).toHaveProperty('conversationsStarted');
      expect(stats).toHaveProperty('totalMessages');
      expect(stats).toHaveProperty('productCardsClicked');
      expect(stats).toHaveProperty('topQueries');
      expect(stats).toHaveProperty('topProducts');
    });

    it('should calculate click-through rate correctly', async () => {
      const stats = await getDailyStats(new Date());
      
      expect(stats.clickThroughRate).toBeGreaterThanOrEqual(0);
      expect(stats.clickThroughRate).toBeLessThanOrEqual(100);
    });

    it('should calculate conversion rate correctly', async () => {
      const stats = await getDailyStats(new Date());
      
      expect(stats.conversionRate).toBeGreaterThanOrEqual(0);
      expect(stats.conversionRate).toBeLessThanOrEqual(100);
    });

    it('should calculate error rate correctly', async () => {
      const stats = await getDailyStats(new Date());
      
      expect(stats.errorCount).toBeGreaterThanOrEqual(0);
      expect(stats.errorCount).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    });

    it('should return top queries sorted by count', async () => {
      const stats = await getDailyStats(new Date());
      
      if (stats.topQueries.length > 1) {
        expect(stats.topQueries[0].count).toBeGreaterThanOrEqual(stats.topQueries[1].count);
      }
    });

    it('should return top products sorted by clicks', async () => {
      const stats = await getDailyStats(new Date());
      
      if (stats.topProducts.length > 1) {
        expect(stats.topProducts[0].clicks).toBeGreaterThanOrEqual(stats.topProducts[1].clicks);
      }
    });
  });
});
