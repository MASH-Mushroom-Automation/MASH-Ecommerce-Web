/**
 * Analytics Dashboard Page
 * Comprehensive sales analytics with charts, trends, and insights
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DateRangeSelector } from "@/components/analytics/DateRangeSelector";
import { OrderMetrics } from "@/components/analytics/OrderMetrics";
import { SalesTrendChart } from "@/components/analytics/SalesTrendChart";
import { RevenueBreakdown } from "@/components/analytics/RevenueBreakdown";
import { ComparisonPeriod } from "@/components/analytics/ComparisonPeriod";
import { ExportButton } from "@/components/analytics/ExportButton";
import { RefreshCw, AlertCircle, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const {
    data,
    metrics,
    salesTrend,
    categoryBreakdown,
    topProducts,
    orderMetrics,
    comparison,
    loading,
    error,
    dateRange,
    setPreset,
    setCustomRange,
    refetch,
  } = useAnalytics({
    initialPreset: "30d",
    includeComparison: true,
    autoRefresh: false,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            Sales Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Comprehensive insights into your sales performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          
          <ExportButton data={data} disabled={loading || !data} />
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date Range</CardTitle>
          <CardDescription>
            Choose a preset or custom date range to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangeSelector
            dateRange={dateRange}
            onPresetChange={setPreset}
            onCustomRangeChange={setCustomRange}
          />
        </CardContent>
      </Card>

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription>
            {error}. Please try refreshing the page or selecting a different date range.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="space-y-6">
          {/* Metrics Skeleton */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          
          {/* Chart Skeleton */}
          <Skeleton className="h-[450px]" />
          <Skeleton className="h-[500px]" />
        </div>
      )}

      {/* Main Content */}
      {!loading && data && metrics && (
        <div className="space-y-6">
          {/* Order Metrics KPIs */}
          <OrderMetrics metrics={metrics} comparison={comparison} />

          {/* Sales Trend Chart */}
          <SalesTrendChart data={salesTrend} />

          {/* Revenue Breakdown */}
          <RevenueBreakdown
            categoryBreakdown={categoryBreakdown}
            topProducts={topProducts}
          />

          {/* Period Comparison */}
          {comparison && (
            <ComparisonPeriod comparison={comparison} />
          )}

          {/* Additional Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Key Insights</CardTitle>
              <CardDescription>
                Quick takeaways from your analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Insight 1: Best Performing Product */}
                {topProducts.length > 0 && (
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      🏆 Best Seller
                    </div>
                    <div className="text-lg font-semibold">
                      {topProducts[0].name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {topProducts[0].unitsSold} units sold • ₱
                      {topProducts[0].revenue.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                )}

                {/* Insight 2: Average Daily Revenue */}
                {salesTrend.length > 0 && (
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      💰 Avg Daily Revenue
                    </div>
                    <div className="text-lg font-semibold">
                      ₱
                      {(
                        salesTrend.reduce((sum, day) => sum + day.revenue, 0) /
                        salesTrend.length
                      ).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {salesTrend.length} days
                    </div>
                  </div>
                )}

                {/* Insight 3: Total Customers */}
                {metrics.totalCustomers > 0 && (
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      👥 Total Customers
                    </div>
                    <div className="text-lg font-semibold">
                      {metrics.totalCustomers.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Unique customers served
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !data && (
        <Card className="py-12">
          <CardContent className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground mb-4">
              No sales data available for the selected period.
              <br />
              Try selecting a different date range.
            </p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
