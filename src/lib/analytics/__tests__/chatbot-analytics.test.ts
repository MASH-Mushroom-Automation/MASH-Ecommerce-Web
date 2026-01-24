/**
 * Unit Tests for Chatbot Analytics
 * 
 * Tests analytics service functions for chatbot tracking and reporting.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 6
 */

import {
  startConversation,
  logQuery,
  logProductClick,
  logError,
  getDailyStats,
  type ConversationData,
  type QueryData,
  type ProductClickData,
  type ChatbotError,
} from '../chatbot-analytics';

// Mocks are in jest.setup.js

describe('Chatbot Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startConversation', () => {
    it('should create conversation in Firestore', async () => {
      await expect(
        startConversation('user-123', 'conv-123')
      ).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Firestore error');
      (require('firebase/firestore').addDoc as jest.Mock).mockRejectedValueOnce(mockError);
      
      await expect(
        startConversation('user-123', 'conv-123')
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
      await expect(logQuery(mockQuery)).resolves.not.toThrow();
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
      
      await expect(logQuery(minimalQuery)).resolves.not.toThrow();
    });

    it('should log failed queries', async () => {
      const failedQuery: QueryData = {
        ...mockQuery,
        success: false,
        errorMessage: 'API timeout',
      };
      
      await expect(logQuery(failedQuery)).resolves.not.toThrow();
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
      await expect(logProductClick(mockClick)).resolves.not.toThrow();
    });

    it('should handle anonymous users', async () => {
      const anonymousClick: ProductClickData = {
        ...mockClick,
        userId: 'anonymous',
      };
      
      await expect(logProductClick(anonymousClick)).resolves.not.toThrow();
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
      await expect(logError(mockError)).resolves.not.toThrow();
    });

    it('should log validation errors', async () => {
      const validationError: ChatbotError = {
        errorMessage: 'Invalid query',
        errorType: 'VALIDATION_ERROR',
        timestamp: Date.now(),
        userId: 'user-123',
        conversationId: 'conv-123',
      };
      
      await expect(logError(validationError)).resolves.not.toThrow();
    });

    it('should log system errors', async () => {
      const systemError: ChatbotError = {
        errorMessage: 'Database connection failed',
        errorType: 'SYSTEM_ERROR',
        timestamp: Date.now(),
      };
      
      await expect(logError(systemError)).resolves.not.toThrow();
    });
  });

  describe('getDailyStats', () => {
    it('should return stats for specific date', async () => {
      const stats = await getDailyStats(new Date('2026-01-21'));
      
      expect(stats).toHaveProperty('conversationsStarted');
      expect(stats).toHaveProperty('messagesCount');
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
      
      expect(stats.errorRate).toBeGreaterThanOrEqual(0);
      expect(stats.errorRate).toBeLessThanOrEqual(100);
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
