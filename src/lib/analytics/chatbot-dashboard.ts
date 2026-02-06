/**
 * Chatbot Analytics Dashboard - Data Aggregation Layer
 * 
 * Provides business intelligence functions for chatbot performance metrics.
 * Part of AI Chatbot ML Enhancement Plan - Phase 1: Analytics Dashboard
 * 
 * @see .github/AI_CHATBOT_ML_ENHANCEMENT_PLAN.md - Phase 1
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Convert Date to Firestore-compatible timestamp (milliseconds)
 */
function dateToFirestore(date: Date): number {
  return date.getTime();
}

/**
 * Time range options for dashboard filters
 */
export type TimeRange = 'today' | 'week' | 'month' | 'year' | 'custom';

/**
 * Dashboard metrics summary
 */
export interface DashboardMetrics {
  totalConversations: number;
  totalMessages: number;
  totalProductCardsShown: number;
  totalProductClicks: number;
  totalConversions: number;
  averageMessagesPerConversation: number;
  clickThroughRate: number; // clicks / cards shown
  conversionRate: number; // conversions / conversations
  revenueAttributed: number;
  period: {
    start: Date;
    end: Date;
    label: string;
  };
}

/**
 * Top query result
 */
export interface TopQuery {
  query: string;
  count: number;
  averageResults: number;
  clickThroughRate: number;
  conversions: number;
}

/**
 * Top product result
 */
export interface TopProduct {
  productId: string;
  productName: string;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
}

/**
 * Conversion funnel step
 */
export interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
  dropoffRate: number;
}

/**
 * Query pattern cluster
 */
export interface QueryPattern {
  pattern: string;
  examples: string[];
  count: number;
  averageResults: number;
  successRate: number;
}

/**
 * Get time range boundaries for queries
 */
export function getTimeRangeBounds(
  range: TimeRange,
  customStart?: Date,
  customEnd?: Date
): { start: Date; end: Date; label: string } {
  const now = new Date();
  let end = new Date(now);
  let start = new Date(now);
  let label = '';

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      label = 'Today';
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      label = 'Last 7 Days';
      break;
    case 'month':
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      label = 'Last 30 Days';
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      label = 'Last Year';
      break;
    case 'custom':
      if (customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
        label = `${customStart.toLocaleDateString()} - ${customEnd.toLocaleDateString()}`;
      }
      break;
  }

  return { start, end, label };
}

/**
 * Get dashboard metrics for specified time range
 */
export async function getDailyStats(
  range: TimeRange = 'week',
  customStart?: Date,
  customEnd?: Date
): Promise<DashboardMetrics> {
  const { start, end, label } = getTimeRangeBounds(range, customStart, customEnd);

  try {
    // Query conversations
    const conversationsRef = collection(db, 'chatbot_conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('startedAt', '>=', dateToFirestore(start)),
      where('startedAt', '<=', dateToFirestore(end))
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversations = conversationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate metrics from conversations
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce(
      (sum, conv: any) => sum + (conv.messageCount || 0),
      0
    );
    const totalProductCardsShown = conversations.reduce(
      (sum, conv: any) => sum + (conv.productCardsShown || 0),
      0
    );
    const totalProductClicks = conversations.reduce(
      (sum, conv: any) => sum + (conv.productCardsClicked || 0),
      0
    );
    const totalConversions = conversations.filter(
      (conv: any) => conv.leadToPurchase === true
    ).length;

    // Calculate derived metrics
    const averageMessagesPerConversation =
      totalConversations > 0 ? totalMessages / totalConversations : 0;
    const clickThroughRate =
      totalProductCardsShown > 0 ? totalProductClicks / totalProductCardsShown : 0;
    const conversionRate =
      totalConversations > 0 ? totalConversions / totalConversations : 0;

    // Revenue calculation (placeholder - needs order integration)
    const revenueAttributed = 0;

    return {
      totalConversations,
      totalMessages,
      totalProductCardsShown,
      totalProductClicks,
      totalConversions,
      averageMessagesPerConversation,
      clickThroughRate,
      conversionRate,
      revenueAttributed,
      period: { start, end, label },
    };
  } catch (error) {
    console.error('[ChatbotDashboard] Error fetching daily stats:', error);
    throw error;
  }
}

/**
 * Get top queries by frequency
 */
export async function getTopQueries(
  range: TimeRange = 'week',
  limitCount: number = 10,
  customStart?: Date,
  customEnd?: Date
): Promise<TopQuery[]> {
  const { start, end } = getTimeRangeBounds(range, customStart, customEnd);

  try {
    const queriesRef = collection(db, 'chatbot_queries');
    const queriesQuery = query(
      queriesRef,
      where('timestamp', '>=', dateToFirestore(start)),
      where('timestamp', '<=', dateToFirestore(end))
    );
    const queriesSnapshot = await getDocs(queriesQuery);

    // Aggregate queries
    const queryMap = new Map<
      string,
      {
        count: number;
        totalResults: number;
        clicks: number;
        conversions: number;
      }
    >();

    queriesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const queryText = (data.query || '').toLowerCase().trim();
      if (!queryText) return;

      const existing = queryMap.get(queryText) || {
        count: 0,
        totalResults: 0,
        clicks: 0,
        conversions: 0,
      };

      queryMap.set(queryText, {
        count: existing.count + 1,
        totalResults: existing.totalResults + (data.resultsCount || 0),
        clicks: existing.clicks + (data.clickedProduct ? 1 : 0),
        conversions: existing.conversions + (data.leadToConversion ? 1 : 0),
      });
    });

    // Convert to array and sort by count
    const topQueries: TopQuery[] = Array.from(queryMap.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        averageResults: stats.count > 0 ? stats.totalResults / stats.count : 0,
        clickThroughRate: stats.totalResults > 0 ? stats.clicks / stats.totalResults : 0,
        conversions: stats.conversions,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitCount);

    return topQueries;
  } catch (error) {
    console.error('[ChatbotDashboard] Error fetching top queries:', error);
    throw error;
  }
}

/**
 * Get top products by impressions and clicks
 */
export async function getTopProducts(
  range: TimeRange = 'week',
  limitCount: number = 10,
  customStart?: Date,
  customEnd?: Date
): Promise<TopProduct[]> {
  const { start, end } = getTimeRangeBounds(range, customStart, customEnd);

  try {
    const clicksRef = collection(db, 'chatbot_product_clicks');
    const clicksQuery = query(
      clicksRef,
      where('timestamp', '>=', dateToFirestore(start)),
      where('timestamp', '<=', dateToFirestore(end))
    );
    const clicksSnapshot = await getDocs(clicksQuery);

    // Aggregate product metrics
    const productMap = new Map<
      string,
      {
        productName: string;
        impressions: number;
        clicks: number;
        conversions: number;
      }
    >();

    clicksSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const productId = data.productId;
      if (!productId) return;

      const existing = productMap.get(productId) || {
        productName: data.productName || 'Unknown Product',
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };

      productMap.set(productId, {
        productName: existing.productName,
        impressions: existing.impressions + 1, // Each document is an impression
        clicks: existing.clicks + (data.clicked ? 1 : 0),
        conversions: existing.conversions + (data.leadToConversion ? 1 : 0),
      });
    });

    // Convert to array and sort by impressions
    const topProducts: TopProduct[] = Array.from(productMap.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.productName,
        impressions: stats.impressions,
        clicks: stats.clicks,
        conversions: stats.conversions,
        clickThroughRate: stats.impressions > 0 ? stats.clicks / stats.impressions : 0,
        conversionRate: stats.clicks > 0 ? stats.conversions / stats.clicks : 0,
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, limitCount);

    return topProducts;
  } catch (error) {
    console.error('[ChatbotDashboard] Error fetching top products:', error);
    throw error;
  }
}

/**
 * Get conversion funnel analysis
 */
export async function getConversionFunnel(
  range: TimeRange = 'week',
  customStart?: Date,
  customEnd?: Date
): Promise<FunnelStep[]> {
  const { start, end } = getTimeRangeBounds(range, customStart, customEnd);

  try {
    const conversationsRef = collection(db, 'chatbot_conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('startedAt', '>=', dateToFirestore(start)),
      where('startedAt', '<=', dateToFirestore(end))
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);
    const conversations = conversationsSnapshot.docs.map((doc) => doc.data());

    // Count each funnel step
    const totalConversations = conversations.length;
    const conversationsWithCards = conversations.filter(
      (conv: any) => (conv.productCardsShown || 0) > 0
    ).length;
    const conversationsWithClicks = conversations.filter(
      (conv: any) => (conv.productCardsClicked || 0) > 0
    ).length;
    const conversionsCount = conversations.filter(
      (conv: any) => conv.leadToPurchase === true
    ).length;

    // Build funnel
    const funnel: FunnelStep[] = [
      {
        step: 'Conversations Started',
        count: totalConversations,
        percentage: 100,
        dropoffRate: 0,
      },
      {
        step: 'Product Cards Shown',
        count: conversationsWithCards,
        percentage:
          totalConversations > 0 ? (conversationsWithCards / totalConversations) * 100 : 0,
        dropoffRate:
          totalConversations > 0
            ? ((totalConversations - conversationsWithCards) / totalConversations) * 100
            : 0,
      },
      {
        step: 'Product Clicks',
        count: conversationsWithClicks,
        percentage:
          totalConversations > 0 ? (conversationsWithClicks / totalConversations) * 100 : 0,
        dropoffRate:
          conversationsWithCards > 0
            ? ((conversationsWithCards - conversationsWithClicks) / conversationsWithCards) *
              100
            : 0,
      },
      {
        step: 'Purchases',
        count: conversionsCount,
        percentage:
          totalConversations > 0 ? (conversionsCount / totalConversations) * 100 : 0,
        dropoffRate:
          conversationsWithClicks > 0
            ? ((conversationsWithClicks - conversionsCount) / conversationsWithClicks) * 100
            : 0,
      },
    ];

    return funnel;
  } catch (error) {
    console.error('[ChatbotDashboard] Error fetching conversion funnel:', error);
    throw error;
  }
}

/**
 * Get query patterns by clustering similar queries
 */
export async function getQueryPatterns(
  range: TimeRange = 'week',
  customStart?: Date,
  customEnd?: Date
): Promise<QueryPattern[]> {
  const { start, end } = getTimeRangeBounds(range, customStart, customEnd);

  try {
    const queriesRef = collection(db, 'chatbot_queries');
    const queriesQuery = query(
      queriesRef,
      where('timestamp', '>=', dateToFirestore(start)),
      where('timestamp', '<=', dateToFirestore(end))
    );
    const queriesSnapshot = await getDocs(queriesQuery);

    // Simple keyword-based clustering
    const patterns = new Map<
      string,
      {
        examples: Set<string>;
        count: number;
        totalResults: number;
        successes: number;
      }
    >();

    const keywords = [
      'fresh',
      'dried',
      'growing',
      'kit',
      'medicinal',
      'recipe',
      'organic',
      'price',
      'cheap',
      'expensive',
      'shiitake',
      'oyster',
      'button',
      'portobello',
    ];

    queriesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const queryText = (data.query || '').toLowerCase();
      if (!queryText) return;

      // Find matching keyword
      const matchedKeyword = keywords.find((kw) => queryText.includes(kw));
      const pattern = matchedKeyword || 'general';

      const existing = patterns.get(pattern) || {
        examples: new Set<string>(),
        count: 0,
        totalResults: 0,
        successes: 0,
      };

      existing.examples.add(queryText);
      existing.count += 1;
      existing.totalResults += data.resultsCount || 0;
      existing.successes += (data.resultsCount || 0) > 0 ? 1 : 0;

      patterns.set(pattern, existing);
    });

    // Convert to array
    const queryPatterns: QueryPattern[] = Array.from(patterns.entries())
      .map(([pattern, stats]) => ({
        pattern,
        examples: Array.from(stats.examples).slice(0, 5), // Top 5 examples
        count: stats.count,
        averageResults: stats.count > 0 ? stats.totalResults / stats.count : 0,
        successRate: stats.count > 0 ? stats.successes / stats.count : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return queryPatterns;
  } catch (error) {
    console.error('[ChatbotDashboard] Error fetching query patterns:', error);
    throw error;
  }
}

/**
 * Export dashboard data to CSV format
 */
export function exportToCSV(
  data: any[],
  filename: string,
  headers: string[]
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('exportToCSV can only be called in browser environment');
  }

  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
