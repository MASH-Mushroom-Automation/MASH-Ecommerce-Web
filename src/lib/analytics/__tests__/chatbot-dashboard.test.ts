/**
 * Chatbot Dashboard Tests
 * Comprehensive unit tests for analytics data aggregation functions
 */

import {
  getDailyStats,
  getTopQueries,
  getTopProducts,
  getConversionFunnel,
  getQueryPatterns,
  getTimeRangeBounds,
  exportToCSV,
  type DashboardMetrics,
  type TopQuery,
  type TopProduct,
  type FunnelStep,
  type QueryPattern,
} from '../chatbot-dashboard';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

// Mock Firebase before imports
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

describe('chatbot-dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTimeRangeBounds', () => {
    it('should return today range', () => {
      const result = getTimeRangeBounds('today');
      expect(result.label).toBe('Today');
      expect(result.start.getHours()).toBe(0);
      expect(result.start.getMinutes()).toBe(0);
    });

    it('should return week range', () => {
      const result = getTimeRangeBounds('week');
      expect(result.label).toBe('Last 7 Days');
      const daysDiff = Math.floor(
        (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBeGreaterThanOrEqual(6);
      expect(daysDiff).toBeLessThanOrEqual(7);
    });

    it('should return month range', () => {
      const result = getTimeRangeBounds('month');
      expect(result.label).toBe('Last 30 Days');
      const daysDiff = Math.floor(
        (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBeGreaterThanOrEqual(29);
      expect(daysDiff).toBeLessThanOrEqual(30);
    });

    it('should return year range', () => {
      const result = getTimeRangeBounds('year');
      expect(result.label).toBe('Last Year');
      const daysDiff = Math.floor(
        (result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBeGreaterThanOrEqual(364);
      expect(daysDiff).toBeLessThanOrEqual(366);
    });

    it('should return custom range', () => {
      const customStart = new Date('2026-01-01');
      const customEnd = new Date('2026-01-31');
      const result = getTimeRangeBounds('custom', customStart, customEnd);
      expect(result.start).toEqual(customStart);
      expect(result.end).toEqual(customEnd);
      expect(result.label).toContain('1/1/2026');
      expect(result.label).toContain('1/31/2026');
    });
  });

  describe('getDailyStats', () => {
    it('should return dashboard metrics with zero conversations', async () => {
      const mockSnapshot = {
        docs: [],
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getDailyStats('week');

      expect(result).toMatchObject({
        totalConversations: 0,
        totalMessages: 0,
        totalProductCardsShown: 0,
        totalProductClicks: 0,
        totalConversions: 0,
        averageMessagesPerConversation: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        revenueAttributed: 0,
      });
      expect(result.period.label).toBe('Last 7 Days');
    });

    it('should calculate metrics correctly with conversations', async () => {
      const mockConversations = [
        {
          id: 'conv1',
          messageCount: 5,
          productCardsShown: 3,
          productCardsClicked: 2,
          leadToPurchase: true,
        },
        {
          id: 'conv2',
          messageCount: 10,
          productCardsShown: 5,
          productCardsClicked: 1,
          leadToPurchase: false,
        },
        {
          id: 'conv3',
          messageCount: 3,
          productCardsShown: 0,
          productCardsClicked: 0,
          leadToPurchase: false,
        },
      ];

      const mockSnapshot = {
        docs: mockConversations.map((data) => ({
          id: data.id,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getDailyStats('week');

      expect(result.totalConversations).toBe(3);
      expect(result.totalMessages).toBe(18); // 5 + 10 + 3
      expect(result.totalProductCardsShown).toBe(8); // 3 + 5 + 0
      expect(result.totalProductClicks).toBe(3); // 2 + 1 + 0
      expect(result.totalConversions).toBe(1);
      expect(result.averageMessagesPerConversation).toBe(6); // 18 / 3
      expect(result.clickThroughRate).toBeCloseTo(0.375); // 3 / 8
      expect(result.conversionRate).toBeCloseTo(0.333, 2); // 1 / 3
    });

    it('should handle Firebase errors', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firebase connection failed'));

      await expect(getDailyStats('week')).rejects.toThrow('Firebase connection failed');
    });
  });

  describe('getTopQueries', () => {
    it('should return empty array with no queries', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getTopQueries('week', 10);

      expect(result).toEqual([]);
    });

    it('should aggregate and sort queries by frequency', async () => {
      const mockQueries = [
        { query: 'fresh mushrooms', resultsCount: 5, clickedProduct: true, leadToConversion: false },
        { query: 'fresh mushrooms', resultsCount: 5, clickedProduct: false, leadToConversion: false },
        { query: 'shiitake', resultsCount: 3, clickedProduct: true, leadToConversion: true },
        { query: 'growing kit', resultsCount: 2, clickedProduct: false, leadToConversion: false },
        { query: 'fresh mushrooms', resultsCount: 5, clickedProduct: true, leadToConversion: false },
      ];

      const mockSnapshot = {
        docs: mockQueries.map((data, i) => ({
          id: `query${i}`,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getTopQueries('week', 10);

      expect(result.length).toBe(3);
      expect(result[0].query).toBe('fresh mushrooms');
      expect(result[0].count).toBe(3);
      expect(result[0].averageResults).toBe(5);
      expect(result[1].query).toBe('shiitake');
      expect(result[1].count).toBe(1);
      expect(result[2].query).toBe('growing kit');
    });

    it('should respect limit parameter', async () => {
      const mockQueries = Array.from({ length: 20 }, (_, i) => ({
        query: `query ${i}`,
        resultsCount: 1,
        clickedProduct: false,
        leadToConversion: false,
      }));

      const mockSnapshot = {
        docs: mockQueries.map((data, i) => ({
          id: `query${i}`,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getTopQueries('week', 5);

      expect(result.length).toBe(5);
    });

    it('should handle Firebase errors', async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      await expect(getTopQueries('week')).rejects.toThrow('Firestore error');
    });
  });

  describe('getTopProducts', () => {
    it('should return empty array with no product clicks', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getTopProducts('week', 10);

      expect(result).toEqual([]);
    });

    it('should aggregate product metrics correctly', async () => {
      const mockClicks = [
        {
          productId: 'prod1',
          productName: 'Fresh Button Mushrooms',
          clicked: true,
          leadToConversion: false,
        },
        {
          productId: 'prod1',
          productName: 'Fresh Button Mushrooms',
          clicked: true,
          leadToConversion: true,
        },
        {
          productId: 'prod2',
          productName: 'Shiitake Growing Kit',
          clicked: false,
          leadToConversion: false,
        },
        {
          productId: 'prod1',
          productName: 'Fresh Button Mushrooms',
          clicked: true,
          leadToConversion: false,
        },
      ];

      const mockSnapshot = {
        docs: mockClicks.map((data, i) => ({
          id: `click${i}`,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getTopProducts('week', 10);

      expect(result.length).toBe(2);
      expect(result[0].productId).toBe('prod1');
      expect(result[0].productName).toBe('Fresh Button Mushrooms');
      expect(result[0].impressions).toBe(3);
      expect(result[0].clicks).toBe(3);
      expect(result[0].conversions).toBe(1);
      expect(result[0].clickThroughRate).toBe(1); // 3 clicks / 3 impressions
      expect(result[0].conversionRate).toBeCloseTo(0.333, 2); // 1 conversion / 3 clicks
    });

    it('should sort by impressions descending', async () => {
      const mockClicks = [
        { productId: 'prod1', productName: 'Product 1', clicked: false, leadToConversion: false },
        { productId: 'prod2', productName: 'Product 2', clicked: false, leadToConversion: false },
        { productId: 'prod2', productName: 'Product 2', clicked: false, leadToConversion: false },
        { productId: 'prod2', productName: 'Product 2', clicked: false, leadToConversion: false },
      ];

      const mockSnapshot = {
        docs: mockClicks.map((data, i) => ({
          id: `click${i}`,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getTopProducts('week', 10);

      expect(result[0].productId).toBe('prod2');
      expect(result[0].impressions).toBe(3);
      expect(result[1].productId).toBe('prod1');
      expect(result[1].impressions).toBe(1);
    });
  });

  describe('getConversionFunnel', () => {
    it('should return empty funnel with no conversations', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getConversionFunnel('week');

      expect(result.length).toBe(4);
      expect(result[0].count).toBe(0);
      expect(result[1].count).toBe(0);
    });

    it('should calculate funnel steps correctly', async () => {
      const mockConversations = [
        { productCardsShown: 3, productCardsClicked: 2, leadToPurchase: true },
        { productCardsShown: 5, productCardsClicked: 0, leadToPurchase: false },
        { productCardsShown: 0, productCardsClicked: 0, leadToPurchase: false },
        { productCardsShown: 2, productCardsClicked: 1, leadToPurchase: false },
      ];

      const mockSnapshot = {
        docs: mockConversations.map((data) => ({
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getConversionFunnel('week');

      expect(result[0].step).toBe('Conversations Started');
      expect(result[0].count).toBe(4);
      expect(result[0].percentage).toBe(100);

      expect(result[1].step).toBe('Product Cards Shown');
      expect(result[1].count).toBe(3); // 3 conversations with cards
      expect(result[1].percentage).toBe(75); // 3/4 * 100

      expect(result[2].step).toBe('Product Clicks');
      expect(result[2].count).toBe(2); // 2 conversations with clicks

      expect(result[3].step).toBe('Purchases');
      expect(result[3].count).toBe(1); // 1 conversion
    });

    it('should calculate dropoff rates', async () => {
      const mockConversations = [
        { productCardsShown: 1, productCardsClicked: 0, leadToPurchase: false },
        { productCardsShown: 1, productCardsClicked: 1, leadToPurchase: false },
      ];

      const mockSnapshot = {
        docs: mockConversations.map((data) => ({
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getConversionFunnel('week');

      expect(result[1].dropoffRate).toBe(0); // All conversations showed cards
      expect(result[2].dropoffRate).toBe(50); // 1 of 2 didn't click
    });
  });

  describe('getQueryPatterns', () => {
    it('should return empty array with no queries', async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getQueryPatterns('week');

      expect(result).toEqual([]);
    });

    it('should cluster queries by keywords', async () => {
      const mockQueries = [
        { query: 'fresh shiitake mushrooms', resultsCount: 3 },
        { query: 'fresh oyster mushrooms', resultsCount: 4 },
        { query: 'dried shiitake', resultsCount: 2 },
        { query: 'organic button mushrooms', resultsCount: 5 },
        { query: 'what is the best mushroom', resultsCount: 0 },
      ];

      const mockSnapshot = {
        docs: mockQueries.map((data, i) => ({
          id: `query${i}`,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getQueryPatterns('week');

      expect(result.length).toBeGreaterThan(0);
      
      // Find fresh pattern
      const freshPattern = result.find((p) => p.pattern === 'fresh');
      expect(freshPattern).toBeDefined();
      if (freshPattern) {
        expect(freshPattern.count).toBe(2);
        expect(freshPattern.examples.length).toBeGreaterThan(0);
      }

      // Find dried pattern
      const driedPattern = result.find((p) => p.pattern === 'dried');
      expect(driedPattern).toBeDefined();
      if (driedPattern) {
        expect(driedPattern.count).toBe(1);
      }
    });

    it('should calculate success rates', async () => {
      const mockQueries = [
        { query: 'fresh mushrooms', resultsCount: 5 },
        { query: 'fresh shiitake', resultsCount: 3 },
        { query: 'fresh button', resultsCount: 0 }, // Failed query
      ];

      const mockSnapshot = {
        docs: mockQueries.map((data, i) => ({
          id: `query${i}`,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getQueryPatterns('week');

      const freshPattern = result.find((p) => p.pattern === 'fresh');
      expect(freshPattern).toBeDefined();
      if (freshPattern) {
        expect(freshPattern.successRate).toBeCloseTo(0.666, 2); // 2 successes / 3 queries
      }
    });

    it('should limit examples to 5', async () => {
      const mockQueries = Array.from({ length: 10 }, (_, i) => ({
        query: `fresh mushrooms ${i}`,
        resultsCount: 1,
      }));

      const mockSnapshot = {
        docs: mockQueries.map((data, i) => ({
          id: `query${i}`,
          data: () => data,
        })),
      };

      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await getQueryPatterns('week');

      const freshPattern = result.find((p) => p.pattern === 'fresh');
      expect(freshPattern).toBeDefined();
      if (freshPattern) {
        expect(freshPattern.examples.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('exportToCSV', () => {
    let mockBlob: jest.Mock;
    
    beforeEach(() => {
      // Mock DOM APIs
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      
      // Mock Blob constructor
      mockBlob = jest.fn(function(this: any, content: any[], options: any) {
        this.content = content;
        this.options = options;
      }) as any;
      global.Blob = mockBlob as any;
    });

    it.skip('should throw error in non-browser environment', () => {
      // Skip: Jest runs in Node with window/document available
      // This function is client-side only and will be guarded by 'use client' directive
    });

    it('should create CSV with headers and data', () => {
      const data = [
        { name: 'Product 1', count: 5 },
        { name: 'Product 2', count: 3 },
      ];
      const headers = ['name', 'count'];

      const createElementSpy = jest.spyOn(document, 'createElement');

      exportToCSV(data, 'test-export', headers);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should handle values with commas', () => {
      const data = [{ name: 'Product, with comma', count: 1 }];
      const headers = ['name', 'count'];

      const createElementSpy = jest.spyOn(document, 'createElement');

      exportToCSV(data, 'test', headers);

      expect(mockBlob).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('"Product, with comma"')]),
        { type: 'text/csv;charset=utf-8;' }
      );
    });
  });
});
