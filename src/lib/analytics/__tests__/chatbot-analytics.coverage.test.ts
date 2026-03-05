/**
 * Coverage Tests for Chatbot Analytics (REAL implementation)
 *
 * The global jest.setup.js mocks `@/lib/analytics/chatbot-analytics`, so
 * the existing chatbot-analytics.test.ts tests the mock, giving 0% coverage.
 * This file unmocks the module so the real code executes against the
 * globally-mocked firebase/firestore primitives.
 *
 * COV-012: chatbot-analytics coverage
 */

// Unmock so we test the REAL implementation
jest.unmock('@/lib/analytics/chatbot-analytics');

// Add the missing Timestamp.fromMillis mock before the module is loaded
const mockTimestamp = require('firebase/firestore').Timestamp;
if (!mockTimestamp.fromMillis) {
  mockTimestamp.fromMillis = jest.fn((ms: number) => ({
    seconds: Math.floor(ms / 1000),
    toDate: () => new Date(ms),
  }));
}

import {
  startConversation,
  updateConversationMetrics,
  incrementMessageCount,
  markConversionFromChatbot,
  logQuery,
  getTopQueries,
  logProductClick,
  markProductClickConversion,
  getTopClickedProducts,
  logError,
  getErrorStats,
  getDailyStats,
  getWeeklyStats,
  exportToCSV,
  downloadCSV,
} from '../chatbot-analytics';

import type {
  QueryAnalytics,
  ProductClickAnalytics,
  ErrorLog,
  DailyStats,
} from '../chatbot-analytics';

import {
  addDoc,
  getDocs,
  updateDoc,
  collection,
  doc,
} from 'firebase/firestore';

const mockAddDoc = addDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;
const mockUpdateDoc = updateDoc as jest.Mock;

// Helper to build a mock Firestore snapshot
function snap(
  docs: Array<{ id: string; data: Record<string, unknown> }>
) {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs: docs.map((d) => ({
      id: d.id,
      data: () => d.data,
    })),
  };
}

describe('Chatbot Analytics - Real Implementation Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: addDoc succeeds, getDocs returns empty
    mockAddDoc.mockResolvedValue({ id: 'mock-doc-id' });
    mockGetDocs.mockResolvedValue(snap([]));
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  // =========================================================================
  // CONVERSATION TRACKING
  // =========================================================================

  describe('startConversation', () => {
    it('should create a conversation doc in Firestore', async () => {
      await startConversation('user-1', 'conv-1');

      expect(collection).toHaveBeenCalled();
      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      const payload = mockAddDoc.mock.calls[0][1];
      expect(payload).toMatchObject({
        conversationId: 'conv-1',
        userId: 'user-1',
        messageCount: 0,
        leadToPurchase: false,
      });
    });

    it('should warn on permission-denied and not throw', async () => {
      mockAddDoc.mockRejectedValueOnce(
        new Error('Missing or insufficient permissions')
      );
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await expect(
        startConversation('user-1', 'conv-1')
      ).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Permission denied')
      );
      warnSpy.mockRestore();
    });

    it('should log generic errors', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Firestore offline'));
      const errSpy = jest.spyOn(console, 'error').mockImplementation();

      await startConversation('user-1', 'conv-1');

      expect(errSpy).toHaveBeenCalledWith(
        '[Analytics] Failed to start conversation:',
        expect.any(Error)
      );
      errSpy.mockRestore();
    });
  });

  describe('updateConversationMetrics', () => {
    it('should update existing conversation doc', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{ id: 'doc-1', data: { conversationId: 'conv-1' } }])
      );

      await updateConversationMetrics('conv-1', { messageCount: 10 });

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const payload = mockUpdateDoc.mock.calls[0][1];
      expect(payload).toMatchObject({ messageCount: 10 });
    });

    it('should no-op when conversation not found', async () => {
      await updateConversationMetrics('missing', { messageCount: 1 });
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('boom'));
      const spy = jest.spyOn(console, 'error').mockImplementation();

      await updateConversationMetrics('conv-1', { messageCount: 1 });

      expect(spy).toHaveBeenCalledWith(
        '[Analytics] Failed to update conversation:',
        expect.any(Error)
      );
      spy.mockRestore();
    });
  });

  describe('incrementMessageCount', () => {
    it('should increment count if conversation found', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{ id: 'doc-1', data: {} }])
      );

      await incrementMessageCount('conv-1');
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should no-op if conversation not found', async () => {
      await incrementMessageCount('missing');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await incrementMessageCount('conv-1');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('markConversionFromChatbot', () => {
    it('should set leadToPurchase=true on conversation', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{ id: 'doc-1', data: {} }])
      );

      await markConversionFromChatbot('conv-1', 'order-100');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const payload = mockUpdateDoc.mock.calls[0][1];
      expect(payload).toMatchObject({
        leadToPurchase: true,
        orderId: 'order-100',
      });
    });

    it('should handle errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await markConversionFromChatbot('conv-1', 'order-100');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  // =========================================================================
  // QUERY TRACKING
  // =========================================================================

  describe('logQuery', () => {
    const baseQuery: QueryAnalytics = {
      query: 'mushroom price',
      timestamp: 1700000000000,
      userId: 'user-1',
      conversationId: 'conv-1',
      responseTime: 250,
      productCardsReturned: 3,
      success: true,
    };

    it('should add query doc and update conversation', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{
          id: 'conv-doc',
          data: { queriesAsked: ['old q'], avgResponseTime: 200 },
        }])
      );

      await logQuery(baseQuery);

      // Added query doc
      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      expect(mockAddDoc.mock.calls[0][1]).toMatchObject({ query: 'mushroom price' });
      // Updated conversation with new query + avg response
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc.mock.calls[0][1]).toMatchObject({
        queriesAsked: ['old q', 'mushroom price'],
      });
    });

    it('should handle empty queriesAsked array', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{
          id: 'conv-doc',
          data: { queriesAsked: [], avgResponseTime: 0 },
        }])
      );

      await logQuery(baseQuery);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc.mock.calls[0][1]).toMatchObject({
        queriesAsked: ['mushroom price'],
      });
    });

    it('should skip update if conversation not found', async () => {
      await logQuery(baseQuery);
      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await logQuery(baseQuery);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('getTopQueries', () => {
    it('should aggregate and sort queries by count', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([
          { id: '1', data: { query: 'Mushroom Price', success: true } },
          { id: '2', data: { query: 'mushroom price', success: true } },
          { id: '3', data: { query: 'oyster kit', success: true } },
        ])
      );

      const result = await getTopQueries(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        10
      );

      expect(result[0]).toEqual({ query: 'mushroom price', count: 2 });
      expect(result[1]).toEqual({ query: 'oyster kit', count: 1 });
    });

    it('should respect limit parameter', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([
          { id: '1', data: { query: 'q1', success: true } },
          { id: '2', data: { query: 'q2', success: true } },
          { id: '3', data: { query: 'q3', success: true } },
        ])
      );

      const result = await getTopQueries(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        2
      );

      expect(result).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getTopQueries(
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
      expect(result).toEqual([]);
      spy.mockRestore();
    });
  });

  // =========================================================================
  // PRODUCT CLICK TRACKING
  // =========================================================================

  describe('logProductClick', () => {
    const click: ProductClickAnalytics = {
      productId: 'p1',
      productName: 'King Oyster',
      productSlug: 'king-oyster',
      timestamp: 1700000000000,
      userId: 'user-1',
      conversationId: 'conv-1',
      clickedFromMessage: 'Here are products',
      leadToPurchase: false,
    };

    it('should add click doc and increment conversation counter', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{ id: 'conv-doc', data: {} }])
      );

      await logProductClick(click);

      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      expect(mockAddDoc.mock.calls[0][1]).toMatchObject({ productId: 'p1' });
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await logProductClick(click);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('markProductClickConversion', () => {
    it('should update click doc with purchase info', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{ id: 'click-doc', data: {} }])
      );

      await markProductClickConversion('p1', 'conv-1', 'order-1');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const payload = mockUpdateDoc.mock.calls[0][1];
      expect(payload).toMatchObject({
        leadToPurchase: true,
        orderId: 'order-1',
      });
    });

    it('should no-op if click doc not found', async () => {
      await markProductClickConversion('p1', 'conv-1', 'order-1');
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await markProductClickConversion('p1', 'conv-1', 'o1');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('getTopClickedProducts', () => {
    it('should aggregate and sort product clicks', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([
          { id: '1', data: { productId: 'p1', productName: 'King Oyster' } },
          { id: '2', data: { productId: 'p1', productName: 'King Oyster' } },
          { id: '3', data: { productId: 'p2', productName: 'Blue Oyster' } },
        ])
      );

      const result = await getTopClickedProducts(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        10
      );

      expect(result).toEqual([
        { productId: 'p1', productName: 'King Oyster', clicks: 2 },
        { productId: 'p2', productName: 'Blue Oyster', clicks: 1 },
      ]);
    });

    it('should return empty array on error', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const result = await getTopClickedProducts(
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
      expect(result).toEqual([]);
      spy.mockRestore();
    });
  });

  // =========================================================================
  // ERROR LOGGING
  // =========================================================================

  describe('logError', () => {
    const baseError: ErrorLog = {
      type: 'api_error',
      message: 'API call failed',
      timestamp: 1700000000000,
      userId: 'user-1',
      conversationId: 'conv-1',
      query: 'test',
    };

    it('should add error doc and increment conversation error count', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([{ id: 'conv-doc', data: {} }])
      );

      await logError(baseError);

      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      expect(mockAddDoc.mock.calls[0][1]).toMatchObject({ type: 'api_error' });
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should skip conversation update when no conversationId', async () => {
      const errNoConv: ErrorLog = {
        type: 'network',
        message: 'offline',
        timestamp: 1700000000000,
        userId: 'user-1',
      };

      await logError(errNoConv);

      expect(mockAddDoc).toHaveBeenCalled();
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await logError(baseError);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('getErrorStats', () => {
    it('should aggregate error counts by type', async () => {
      mockGetDocs.mockResolvedValueOnce(
        snap([
          { id: '1', data: { type: 'api_error' } },
          { id: '2', data: { type: 'api_error' } },
          { id: '3', data: { type: 'rate_limit' } },
          { id: '4', data: { type: 'timeout' } },
          { id: '5', data: { type: 'network' } },
          { id: '6', data: { type: 'validation' } },
        ])
      );

      const result = await getErrorStats(
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );

      expect(result.total).toBe(6);
      expect(result.byType.api_error).toBe(2);
      expect(result.byType.rate_limit).toBe(1);
      expect(result.rateLimitHits).toBe(1);
    });

    it('should return zero stats on error', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getErrorStats(
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );

      expect(result.total).toBe(0);
      expect(result.byType.api_error).toBe(0);
      spy.mockRestore();
    });
  });

  // =========================================================================
  // DAILY / WEEKLY STATS
  // =========================================================================

  describe('getDailyStats', () => {
    it('should aggregate metrics from conversations', async () => {
      // First getDocs: conversations
      mockGetDocs.mockResolvedValueOnce(
        snap([
          {
            id: 'c1',
            data: {
              messageCount: 10,
              productCardsShown: 5,
              productCardsClicked: 2,
              leadToPurchase: true,
              avgResponseTime: 200,
              errorCount: 1,
              userId: 'user-1',
            },
          },
          {
            id: 'c2',
            data: {
              messageCount: 6,
              productCardsShown: 3,
              productCardsClicked: 0,
              leadToPurchase: false,
              avgResponseTime: 300,
              errorCount: 0,
              userId: 'user-2',
            },
          },
        ])
      );
      // Second call: getTopQueries
      mockGetDocs.mockResolvedValueOnce(snap([]));
      // Third call: getTopClickedProducts
      mockGetDocs.mockResolvedValueOnce(snap([]));

      const result = await getDailyStats(new Date('2024-06-15'));

      expect(result.date).toBe('2024-06-15');
      expect(result.conversationsStarted).toBe(2);
      expect(result.totalMessages).toBe(16);
      expect(result.uniqueUsers).toBe(2);
      expect(result.productCardsShown).toBe(8);
      expect(result.productCardsClicked).toBe(2);
      expect(result.conversionsCount).toBe(1);
      expect(result.errorCount).toBe(1);
      // Click-through rate: 2/8 * 100 = 25
      expect(result.clickThroughRate).toBe(25);
      // Conversion rate: 1/2 * 100 = 50
      expect(result.conversionRate).toBe(50);
      // Avg response: (200+300)/2 = 250
      expect(result.avgResponseTime).toBe(250);
      expect(result.avgMessagesPerConversation).toBe(8);
    });

    it('should return zeroed stats when no conversations', async () => {
      mockGetDocs.mockResolvedValueOnce(snap([]));
      mockGetDocs.mockResolvedValueOnce(snap([]));
      mockGetDocs.mockResolvedValueOnce(snap([]));

      const result = await getDailyStats(new Date('2024-06-15'));

      expect(result.conversationsStarted).toBe(0);
      expect(result.totalMessages).toBe(0);
      expect(result.avgMessagesPerConversation).toBe(0);
      expect(result.clickThroughRate).toBe(0);
      expect(result.conversionRate).toBe(0);
      expect(result.avgResponseTime).toBe(0);
    });

    it('should return zeroed stats on error', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('err'));
      const spy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getDailyStats(new Date('2024-06-15'));

      expect(result.conversationsStarted).toBe(0);
      expect(result.date).toBe('2024-06-15');
      spy.mockRestore();
    });
  });

  describe('getWeeklyStats', () => {
    it('should return daily stats for the date range', async () => {
      // 2 days × 3 getDocs calls per day = 6
      for (let i = 0; i < 6; i++) {
        mockGetDocs.mockResolvedValueOnce(snap([]));
      }

      const result = await getWeeklyStats(
        new Date('2024-06-01'),
        new Date('2024-06-02')
      );

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-06-01');
      expect(result[1].date).toBe('2024-06-02');
    });
  });

  // =========================================================================
  // CSV EXPORT
  // =========================================================================

  describe('exportToCSV', () => {
    const sample: DailyStats = {
      date: '2024-06-15',
      conversationsStarted: 10,
      totalMessages: 50,
      uniqueUsers: 8,
      avgMessagesPerConversation: 5,
      productCardsShown: 20,
      productCardsClicked: 5,
      clickThroughRate: 25,
      conversionsCount: 2,
      conversionRate: 20,
      avgResponseTime: 250,
      errorCount: 1,
      topQueries: [],
      topProducts: [],
    };

    it('should produce a CSV string with header row', () => {
      const csv = exportToCSV([sample]);
      const lines = csv.split('\n');

      expect(lines).toHaveLength(2); // header + 1 data row
      expect(lines[0]).toContain('Date');
      expect(lines[0]).toContain('Conversations');
      expect(lines[0]).toContain('Conversion Rate');
    });

    it('should include all data values', () => {
      const csv = exportToCSV([sample]);
      const dataRow = csv.split('\n')[1];

      expect(dataRow).toContain('2024-06-15');
      expect(dataRow).toContain('10');
      expect(dataRow).toContain('50');
      expect(dataRow).toContain('8');
    });

    it('should handle empty data array', () => {
      const csv = exportToCSV([]);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(1); // only header
    });

    it('should handle multiple rows', () => {
      const csv = exportToCSV([sample, { ...sample, date: '2024-06-16' }]);
      const lines = csv.split('\n');
      expect(lines).toHaveLength(3);
    });
  });

  describe('downloadCSV', () => {
    it('should create blob URL, click link, and revoke URL', () => {
      const mockClick = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      } as unknown as HTMLAnchorElement;

      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockLink);
      const appendSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockLink);
      const removeSpy = jest
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockLink);

      const createObjURL = jest.fn(() => 'blob:test-url');
      const revokeObjURL = jest.fn();
      const origURL = window.URL;
      (window as unknown as Record<string, unknown>).URL = {
        createObjectURL: createObjURL,
        revokeObjectURL: revokeObjURL,
      };

      const sample: DailyStats = {
        date: '2024-06-15',
        conversationsStarted: 5,
        totalMessages: 20,
        uniqueUsers: 3,
        avgMessagesPerConversation: 4,
        productCardsShown: 10,
        productCardsClicked: 2,
        clickThroughRate: 20,
        conversionsCount: 1,
        conversionRate: 20,
        avgResponseTime: 200,
        errorCount: 0,
        topQueries: [],
        topProducts: [],
      };

      downloadCSV([sample], 'test.csv');

      expect(createObjURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(revokeObjURL).toHaveBeenCalledWith('blob:test-url');
      expect(mockLink.download).toBe('test.csv');

      // Restore
      (window as unknown as Record<string, unknown>).URL = origURL;
      createElementSpy.mockRestore();
      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });
});
