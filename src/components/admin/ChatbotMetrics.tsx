"use client";

import React, { useEffect, useState } from "react";
import { TimeRange, DashboardMetrics, TopQuery, TopProduct, FunnelStep, QueryPattern } from "@/types/analytics";
import {
  getDailyStats,
  getTopQueries,
  getTopProducts,
  getConversionFunnel,
  getQueryPatterns,
} from "@/lib/analytics/chatbot-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, MessageSquare, ShoppingBag, MousePointerClick, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatbotMetricsProps {
  timeRange: TimeRange;
  customStartDate?: Date;
  customEndDate?: Date;
  onDataLoad?: (data: {
    metrics: DashboardMetrics;
    topQueries: TopQuery[];
    topProducts: TopProduct[];
    funnel: FunnelStep[];
    patterns: QueryPattern[];
  }) => void;
}

/**
 * ChatbotMetrics Component
 * 
 * Displays comprehensive analytics for the AI chatbot including:
 * - Key performance metrics (conversations, messages, CTR, conversion rate)
 * - Top queries with performance data
 * - Top products by impressions
 * - Conversion funnel visualization
 * - Query pattern analysis
 * 
 * @example
 * ```tsx
 * <ChatbotMetrics 
 *   timeRange="week" 
 *   onDataLoad={(data) => console.log('Data loaded:', data)}
 * />
 * ```
 */
export default function ChatbotMetrics({
  timeRange,
  customStartDate,
  customEndDate,
  onDataLoad,
}: ChatbotMetricsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topQueries, setTopQueries] = useState<TopQuery[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [patterns, setPatterns] = useState<QueryPattern[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, customStartDate, customEndDate]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [metricsData, queriesData, productsData, funnelData, patternsData] = await Promise.all([
        getDailyStats(timeRange, customStartDate, customEndDate),
        getTopQueries(timeRange, 10, customStartDate, customEndDate),
        getTopProducts(timeRange, 10, customStartDate, customEndDate),
        getConversionFunnel(timeRange, customStartDate, customEndDate),
        getQueryPatterns(timeRange, customStartDate, customEndDate),
      ]);

      setMetrics(metricsData);
      setTopQueries(queriesData);
      setTopProducts(productsData);
      setFunnel(funnelData);
      setPatterns(patternsData);

      // Notify parent component of data load
      if (onDataLoad) {
        onDataLoad({
          metrics: metricsData,
          topQueries: queriesData,
          topProducts: productsData,
          funnel: funnelData,
          patterns: patternsData,
        });
      }
    } catch (err) {
      console.error("[ChatbotMetrics] Failed to load analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>No chatbot activity found for the selected time range.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Conversations"
          value={metrics.totalConversations}
          icon={MessageSquare}
          description="Unique chatbot sessions"
        />
        <MetricCard
          title="Product Cards Shown"
          value={metrics.totalProductCardsShown}
          icon={ShoppingBag}
          description="Product recommendations displayed"
        />
        <MetricCard
          title="Click-Through Rate"
          value={`${(metrics.clickThroughRate * 100).toFixed(1)}%`}
          icon={MousePointerClick}
          description="Products clicked / cards shown"
          trend={metrics.clickThroughRate > 0.1 ? "up" : "neutral"}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(metrics.conversionRate * 100).toFixed(1)}%`}
          icon={ShoppingCart}
          description="Purchases / conversations"
          trend={metrics.conversionRate > 0.05 ? "up" : "neutral"}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Messages/Conversation</CardDescription>
            <CardTitle className="text-2xl">{metrics.averageMessagesPerConversation.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Product Clicks</CardDescription>
            <CardTitle className="text-2xl">{metrics.totalProductClicks}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue Attributed</CardDescription>
            <CardTitle className="text-2xl">₱{metrics.revenueAttributed.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Top Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Queries</CardTitle>
          <CardDescription>Most frequent user questions (last {timeRange})</CardDescription>
        </CardHeader>
        <CardContent>
          {topQueries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No queries recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Query</th>
                    <th className="pb-2 font-medium text-right">Count</th>
                    <th className="pb-2 font-medium text-right">Avg Results</th>
                    <th className="pb-2 font-medium text-right">CTR</th>
                    <th className="pb-2 font-medium text-right">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((query, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-3 text-sm max-w-xs truncate">{query.query}</td>
                      <td className="py-3 text-sm text-right font-medium">{query.count}</td>
                      <td className="py-3 text-sm text-right">{query.averageResults.toFixed(1)}</td>
                      <td className="py-3 text-sm text-right">{(query.clickThroughRate * 100).toFixed(1)}%</td>
                      <td className="py-3 text-sm text-right">{query.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Products with highest engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No product interactions recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium text-right">Impressions</th>
                    <th className="pb-2 font-medium text-right">Clicks</th>
                    <th className="pb-2 font-medium text-right">CTR</th>
                    <th className="pb-2 font-medium text-right">Conversions</th>
                    <th className="pb-2 font-medium text-right">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-3 text-sm max-w-xs truncate">{product.productName}</td>
                      <td className="py-3 text-sm text-right">{product.impressions}</td>
                      <td className="py-3 text-sm text-right font-medium">{product.clicks}</td>
                      <td className="py-3 text-sm text-right">{(product.clickThroughRate * 100).toFixed(1)}%</td>
                      <td className="py-3 text-sm text-right">{product.conversions}</td>
                      <td className="py-3 text-sm text-right">{(product.conversionRate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from conversation to purchase</CardDescription>
        </CardHeader>
        <CardContent>
          {funnel.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No funnel data available</p>
          ) : (
            <div className="space-y-3">
              {funnel.map((step, idx) => {
                const isLast = idx === funnel.length - 1;
                const barWidth = step.percentage;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{step.step}</span>
                      <span className="text-muted-foreground">
                        {step.count} ({step.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-8 bg-secondary rounded-md overflow-hidden">
                      <div
                        className={cn(
                          "h-full flex items-center px-3 text-xs font-medium transition-all",
                          idx === 0 && "bg-blue-500 text-white",
                          idx === 1 && "bg-green-500 text-white",
                          idx === 2 && "bg-orange-500 text-white",
                          idx === 3 && "bg-purple-500 text-white"
                        )}
                        style={{ width: `${barWidth}%` }}
                      >
                        {barWidth > 15 && `${step.percentage.toFixed(1)}%`}
                      </div>
                    </div>
                    {!isLast && step.dropoffRate !== undefined && (
                      <p className="text-xs text-destructive">
                        ↓ {step.dropoffRate.toFixed(1)}% dropoff to next stage
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Patterns Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Query Patterns</CardTitle>
          <CardDescription>Keyword clustering and success rates</CardDescription>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No query patterns detected</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold capitalize">{pattern.pattern}</h4>
                    <span className="text-sm text-muted-foreground">{pattern.count} queries</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-muted-foreground">Success Rate:</span>{" "}
                      <span className={cn(
                        "font-medium",
                        pattern.successRate > 0.7 ? "text-green-600" : "text-orange-600"
                      )}>
                        {(pattern.successRate * 100).toFixed(1)}%
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Avg Results:</span>{" "}
                      {pattern.averageResults.toFixed(1)}
                    </p>
                  </div>
                  {pattern.examples.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Example queries:</p>
                      <ul className="text-xs space-y-0.5">
                        {pattern.examples.slice(0, 3).map((example, i) => (
                          <li key={i} className="truncate text-muted-foreground">• {example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

function MetricCard({ title, value, icon: Icon, description, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend === "up" && (
            <TrendingUp className="h-4 w-4 text-green-500" />
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
