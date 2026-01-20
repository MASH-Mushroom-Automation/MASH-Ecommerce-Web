/**
 * Chatbot Analytics Service
 * 
 * Tracks chatbot usage metrics, errors, and performance.
 * Stores data in Firestore for admin dashboard and reporting.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 6
 */

import { firebaseApp } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  getFirestore,
} from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore(firebaseApp);

// ========================================
// TYPES
// ========================================

export interface ConversationMetrics {
  conversationId: string;
  userId: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
  productCardsShown: number;
  productCardsClicked: number;
  queriesAsked: string[];
  errorCount: number;
  avgResponseTime: number;
  leadToPurchase: boolean;
  orderId?: string;
}

export interface QueryAnalytics {
  query: string;
  timestamp: number;
  userId: string;
  conversationId: string;
  responseTime: number;
  productCardsReturned: number;
  success: boolean;
  errorMessage?: string;
}

export interface ProductClickAnalytics {
  productId: string;
  productName: string;
  productSlug: string;
  timestamp: number;
  userId: string;
  conversationId: string;
  clickedFromMessage: string;
  leadToPurchase: boolean;
  orderId?: string;
}

export interface ErrorLog {
  type: 'api_error' | 'rate_limit' | 'timeout' | 'network' | 'validation';
  message: string;
  timestamp: number;
  userId: string;
  conversationId?: string;
  query?: string;
  responseTime?: number;
  stackTrace?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  conversationsStarted: number;
  totalMessages: number;
  uniqueUsers: number;
  avgMessagesPerConversation: number;
  productCardsShown: number;
  productCardsClicked: number;
  clickThroughRate: number;
  conversionsCount: number;
  conversionRate: number;
  avgResponseTime: number;
  errorCount: number;
  topQueries: Array<{ query: string; count: number }>;
  topProducts: Array<{ productId: string; productName: string; clicks: number }>;
}

// ========================================
// CONVERSATION TRACKING
// ========================================

/**
 * Start a new conversation tracking session
 */
export async function startConversation(
  userId: string,
  conversationId: string
): Promise<void> {
  try {
    const conversationRef = collection(db, 'chatbot_conversations');
    await addDoc(conversationRef, {
      conversationId,
      userId,
      startedAt: serverTimestamp(),
      messageCount: 0,
      productCardsShown: 0,
      productCardsClicked: 0,
      queriesAsked: [],
      errorCount: 0,
      avgResponseTime: 0,
      leadToPurchase: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Analytics] Failed to start conversation:', error);
  }
}

/**
 * Update conversation metrics
 */
export async function updateConversationMetrics(
  conversationId: string,
  updates: Partial<ConversationMetrics>
): Promise<void> {
  try {
    const conversationsRef = collection(db, 'chatbot_conversations');
    const q = query(conversationsRef, where('conversationId', '==', conversationId), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, 'chatbot_conversations', snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to update conversation:', error);
  }
}

/**
 * Increment conversation message count
 */
export async function incrementMessageCount(conversationId: string): Promise<void> {
  try {
    const conversationsRef = collection(db, 'chatbot_conversations');
    const q = query(conversationsRef, where('conversationId', '==', conversationId), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, 'chatbot_conversations', snapshot.docs[0].id);
      await updateDoc(docRef, {
        messageCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to increment message count:', error);
  }
}

/**
 * Mark conversation as leading to purchase
 */
export async function markConversionFromChatbot(
  conversationId: string,
  orderId: string
): Promise<void> {
  try {
    const conversationsRef = collection(db, 'chatbot_conversations');
    const q = query(conversationsRef, where('conversationId', '==', conversationId), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, 'chatbot_conversations', snapshot.docs[0].id);
      await updateDoc(docRef, {
        leadToPurchase: true,
        orderId,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to mark conversion:', error);
  }
}

// ========================================
// QUERY TRACKING
// ========================================

/**
 * Log a user query with analytics
 */
export async function logQuery(analytics: QueryAnalytics): Promise<void> {
  try {
    const queriesRef = collection(db, 'chatbot_queries');
    await addDoc(queriesRef, {
      ...analytics,
      timestamp: Timestamp.fromMillis(analytics.timestamp),
      createdAt: serverTimestamp(),
    });

    // Update conversation with query
    const conversationsRef = collection(db, 'chatbot_conversations');
    const q = query(
      conversationsRef,
      where('conversationId', '==', analytics.conversationId),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, 'chatbot_conversations', snapshot.docs[0].id);
      const currentData = snapshot.docs[0].data();
      const queries = currentData.queriesAsked || [];
      
      await updateDoc(docRef, {
        queriesAsked: [...queries, analytics.query],
        avgResponseTime: 
          (currentData.avgResponseTime * queries.length + analytics.responseTime) /
          (queries.length + 1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to log query:', error);
  }
}

/**
 * Get most common queries
 */
export async function getTopQueries(
  startDate: Date,
  endDate: Date,
  limitCount: number = 10
): Promise<Array<{ query: string; count: number }>> {
  try {
    const queriesRef = collection(db, 'chatbot_queries');
    const q = query(
      queriesRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      where('success', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const queryMap = new Map<string, number>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const query = data.query.toLowerCase().trim();
      queryMap.set(query, (queryMap.get(query) || 0) + 1);
    });

    return Array.from(queryMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limitCount);
  } catch (error) {
    console.error('[Analytics] Failed to get top queries:', error);
    return [];
  }
}

// ========================================
// PRODUCT CLICK TRACKING
// ========================================

/**
 * Log product card click
 */
export async function logProductClick(analytics: ProductClickAnalytics): Promise<void> {
  try {
    const clicksRef = collection(db, 'chatbot_product_clicks');
    await addDoc(clicksRef, {
      ...analytics,
      timestamp: Timestamp.fromMillis(analytics.timestamp),
      createdAt: serverTimestamp(),
    });

    // Update conversation metrics
    const conversationsRef = collection(db, 'chatbot_conversations');
    const q = query(
      conversationsRef,
      where('conversationId', '==', analytics.conversationId),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, 'chatbot_conversations', snapshot.docs[0].id);
      await updateDoc(docRef, {
        productCardsClicked: increment(1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to log product click:', error);
  }
}

/**
 * Update product click with purchase info
 */
export async function markProductClickConversion(
  productId: string,
  conversationId: string,
  orderId: string
): Promise<void> {
  try {
    const clicksRef = collection(db, 'chatbot_product_clicks');
    const q = query(
      clicksRef,
      where('productId', '==', productId),
      where('conversationId', '==', conversationId),
      limit(1)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docRef = doc(db, 'chatbot_product_clicks', snapshot.docs[0].id);
      await updateDoc(docRef, {
        leadToPurchase: true,
        orderId,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('[Analytics] Failed to mark product click conversion:', error);
  }
}

/**
 * Get top clicked products
 */
export async function getTopClickedProducts(
  startDate: Date,
  endDate: Date,
  limitCount: number = 10
): Promise<Array<{ productId: string; productName: string; clicks: number }>> {
  try {
    const clicksRef = collection(db, 'chatbot_product_clicks');
    const q = query(
      clicksRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate))
    );
    
    const snapshot = await getDocs(q);
    const productMap = new Map<string, { name: string; clicks: number }>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const existing = productMap.get(data.productId);
      productMap.set(data.productId, {
        name: data.productName,
        clicks: (existing?.clicks || 0) + 1,
      });
    });

    return Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        clicks: data.clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limitCount);
  } catch (error) {
    console.error('[Analytics] Failed to get top clicked products:', error);
    return [];
  }
}

// ========================================
// ERROR LOGGING
// ========================================

/**
 * Log chatbot error
 */
export async function logError(error: ErrorLog): Promise<void> {
  try {
    const errorsRef = collection(db, 'chatbot_errors');
    await addDoc(errorsRef, {
      ...error,
      timestamp: Timestamp.fromMillis(error.timestamp),
      createdAt: serverTimestamp(),
    });

    // Update conversation error count if applicable
    if (error.conversationId) {
      const conversationsRef = collection(db, 'chatbot_conversations');
      const q = query(
        conversationsRef,
        where('conversationId', '==', error.conversationId),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(db, 'chatbot_conversations', snapshot.docs[0].id);
        await updateDoc(docRef, {
          errorCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.error('[Analytics] Failed to log error:', err);
  }
}

/**
 * Get error statistics
 */
export async function getErrorStats(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  byType: Record<ErrorLog['type'], number>;
  rateLimitHits: number;
}> {
  try {
    const errorsRef = collection(db, 'chatbot_errors');
    const q = query(
      errorsRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate))
    );
    
    const snapshot = await getDocs(q);
    const byType: Record<ErrorLog['type'], number> = {
      api_error: 0,
      rate_limit: 0,
      timeout: 0,
      network: 0,
      validation: 0,
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      byType[data.type as ErrorLog['type']]++;
    });

    return {
      total: snapshot.size,
      byType,
      rateLimitHits: byType.rate_limit,
    };
  } catch (error) {
    console.error('[Analytics] Failed to get error stats:', error);
    return {
      total: 0,
      byType: {
        api_error: 0,
        rate_limit: 0,
        timeout: 0,
        network: 0,
        validation: 0,
      },
      rateLimitHits: 0,
    };
  }
}

// ========================================
// DAILY STATISTICS
// ========================================

/**
 * Get daily analytics statistics
 */
export async function getDailyStats(date: Date): Promise<DailyStats> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Get conversations
    const conversationsRef = collection(db, 'chatbot_conversations');
    const conversationsQuery = query(
      conversationsRef,
      where('startedAt', '>=', Timestamp.fromDate(startOfDay)),
      where('startedAt', '<=', Timestamp.fromDate(endOfDay))
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);

    // Calculate metrics
    let totalMessages = 0;
    let totalProductCardsShown = 0;
    let totalProductCardsClicked = 0;
    let conversionsCount = 0;
    let totalResponseTime = 0;
    let errorCount = 0;
    const uniqueUsers = new Set<string>();

    conversationsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalMessages += data.messageCount || 0;
      totalProductCardsShown += data.productCardsShown || 0;
      totalProductCardsClicked += data.productCardsClicked || 0;
      if (data.leadToPurchase) conversionsCount++;
      totalResponseTime += data.avgResponseTime || 0;
      errorCount += data.errorCount || 0;
      uniqueUsers.add(data.userId);
    });

    const conversationsCount = conversationsSnapshot.size;
    const avgMessagesPerConversation = conversationsCount > 0 
      ? totalMessages / conversationsCount 
      : 0;
    const clickThroughRate = totalProductCardsShown > 0
      ? (totalProductCardsClicked / totalProductCardsShown) * 100
      : 0;
    const conversionRate = conversationsCount > 0
      ? (conversionsCount / conversationsCount) * 100
      : 0;
    const avgResponseTime = conversationsCount > 0
      ? totalResponseTime / conversationsCount
      : 0;

    // Get top queries and products
    const topQueries = await getTopQueries(startOfDay, endOfDay, 5);
    const topProducts = await getTopClickedProducts(startOfDay, endOfDay, 5);

    return {
      date: date.toISOString().split('T')[0],
      conversationsStarted: conversationsCount,
      totalMessages,
      uniqueUsers: uniqueUsers.size,
      avgMessagesPerConversation,
      productCardsShown: totalProductCardsShown,
      productCardsClicked: totalProductCardsClicked,
      clickThroughRate,
      conversionsCount,
      conversionRate,
      avgResponseTime,
      errorCount,
      topQueries,
      topProducts,
    };
  } catch (error) {
    console.error('[Analytics] Failed to get daily stats:', error);
    return {
      date: date.toISOString().split('T')[0],
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
    };
  }
}

/**
 * Get weekly statistics
 */
export async function getWeeklyStats(
  startDate: Date,
  endDate: Date
): Promise<DailyStats[]> {
  const stats: DailyStats[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dailyStats = await getDailyStats(new Date(currentDate));
    stats.push(dailyStats);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return stats;
}

// ========================================
// CSV EXPORT
// ========================================

/**
 * Export analytics data to CSV format
 */
export function exportToCSV(data: DailyStats[]): string {
  const headers = [
    'Date',
    'Conversations',
    'Total Messages',
    'Unique Users',
    'Avg Messages/Conversation',
    'Product Cards Shown',
    'Product Cards Clicked',
    'Click-Through Rate (%)',
    'Conversions',
    'Conversion Rate (%)',
    'Avg Response Time (ms)',
    'Errors',
  ];

  const rows = data.map((stat) => [
    stat.date,
    stat.conversationsStarted,
    stat.totalMessages,
    stat.uniqueUsers,
    stat.avgMessagesPerConversation.toFixed(2),
    stat.productCardsShown,
    stat.productCardsClicked,
    stat.clickThroughRate.toFixed(2),
    stat.conversionsCount,
    stat.conversionRate.toFixed(2),
    stat.avgResponseTime.toFixed(0),
    stat.errorCount,
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(data: DailyStats[], filename: string = 'chatbot-analytics.csv'): void {
  const csv = exportToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
