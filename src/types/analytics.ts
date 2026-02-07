/**
 * Analytics Types for AI Chatbot Dashboard
 * 
 * Defines TypeScript interfaces for chatbot analytics data structures,
 * metrics, and dashboard components.
 */

/**
 * Time range options for analytics queries
 */
export type TimeRange = "today" | "week" | "month" | "year" | "custom";

/**
 * Date range boundaries for queries
 */
export interface TimeRangeBounds {
  start: Date;
  end: Date;
  label: string;
}

/**
 * Core dashboard metrics aggregated from chatbot conversations
 */
export interface DashboardMetrics {
  totalConversations: number;
  totalMessages: number;
  totalProductCardsShown: number;
  totalProductClicks: number;
  totalConversions: number;
  averageMessagesPerConversation: number;
  clickThroughRate: number;              // clicks / cards shown
  conversionRate: number;                 // conversions / conversations
  revenueAttributed: number;              // PHP from chatbot-driven sales
}

/**
 * Top query analytics with performance metrics
 */
export interface TopQuery {
  query: string;
  count: number;
  averageResults: number;
  clickThroughRate: number;
  conversions: number;
}

/**
 * Top product analytics with engagement metrics
 */
export interface TopProduct {
  productId: string;
  productName: string;
  impressions: number;                    // Times shown in chatbot
  clicks: number;                          // Times clicked
  conversions: number;                     // Times purchased
  clickThroughRate: number;               // clicks / impressions
  conversionRate: number;                 // conversions / impressions
}

/**
 * Conversion funnel step with dropoff analysis
 */
export interface FunnelStep {
  step: string;
  count: number;
  percentage: number;                     // % of total conversations
  dropoffRate?: number;                   // % lost to next step
}

/**
 * Query pattern clustering by keywords
 */
export interface QueryPattern {
  pattern: string;                        // Keyword (e.g., "fresh", "dried")
  examples: string[];                     // Sample queries
  count: number;                          // Total queries in pattern
  averageResults: number;                 // Avg products returned
  successRate: number;                    // % queries with results > 0
}

/**
 * Firestore document structure for chatbot conversations
 */
export interface ChatbotConversation {
  id: string;
  userId?: string;
  sessionId: string;
  startedAt: number;                      // Firestore timestamp (milliseconds)
  endedAt?: number;
  messageCount: number;
  productCardsShown: number;
  productClicks: number;
  conversions: number;
  revenueAttributed?: number;
}

/**
 * Firestore document structure for chatbot queries
 */
export interface ChatbotQuery {
  id: string;
  conversationId: string;
  query: string;
  timestamp: number;                      // Firestore timestamp (milliseconds)
  productCardsReturned: number;
  clicked: boolean;
  converted: boolean;
}

/**
 * Firestore document structure for product clicks
 */
export interface ChatbotProductClick {
  id: string;
  conversationId: string;
  productId: string;
  productName: string;
  timestamp: number;                      // Firestore timestamp (milliseconds)
  clicked: boolean;
  converted: boolean;
}

/**
 * Real-time monitoring metrics
 */
export interface RealtimeMetrics {
  activeConversations: number;            // Currently open sessions
  messagesPerMinute: number;              // Message throughput
  avgResponseTime: number;                // API latency (ms)
  errorRate: number;                      // Errors / total requests (%)
  apiQuotaUsage: {
    requestsToday: number;
    quotaLimit: number;
    percentUsed: number;
  };
}

/**
 * Export format options
 */
export type ExportFormat = "csv" | "pdf" | "json";

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  timeRange: TimeRange;
  customStartDate?: Date;
  customEndDate?: Date;
  refreshInterval?: number;               // Auto-refresh (seconds)
  exportFormat?: ExportFormat;
}
