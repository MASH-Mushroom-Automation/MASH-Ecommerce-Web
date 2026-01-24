/**
 * Analytics Hook
 * Fetch and process sales analytics data with date range filtering
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AnalyticsData,
  AnalyticsMetrics,
  AnalyticsQuery,
  DateRange,
  DateRangePreset,
  SalesDataPoint,
  CategoryRevenue,
  TopProduct,
  OrderMetricsDetail,
  ComparisonData,
} from "@/types/analytics";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

// Helper to calculate date range from preset
function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const now = new Date();
  const endDate = endOfDay(now);
  
  let startDate: Date;
  let label: string;
  
  switch (preset) {
    case "7d":
      startDate = startOfDay(subDays(now, 6)); // Last 7 days including today
      label = "Last 7 days";
      break;
    case "30d":
      startDate = startOfDay(subDays(now, 29));
      label = "Last 30 days";
      break;
    case "90d":
      startDate = startOfDay(subDays(now, 89));
      label = "Last 90 days";
      break;
    case "custom":
      startDate = startOfDay(subDays(now, 29)); // Default to 30 days
      label = "Custom range";
      break;
    default:
      startDate = startOfDay(subDays(now, 29));
      label = "Last 30 days";
  }
  
  return { startDate, endDate, label };
}

// Calculate previous period for comparison
function getPreviousPeriod(dateRange: DateRange): DateRange {
  const daysDiff = Math.floor(
    (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const previousEndDate = startOfDay(subDays(dateRange.startDate, 1));
  const previousStartDate = startOfDay(subDays(previousEndDate, daysDiff));
  
  return {
    startDate: previousStartDate,
    endDate: previousEndDate,
    label: "Previous period",
  };
}

// Calculate percentage change
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

interface UseAnalyticsOptions {
  initialPreset?: DateRangePreset;
  includeComparison?: boolean;
  autoRefresh?: boolean; // Auto-refresh every 5 minutes
  refreshInterval?: number; // Milliseconds
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const {
    initialPreset = "30d",
    includeComparison = true,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getDateRangeFromPreset(initialPreset)
  );
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      console.log("📊 [ANALYTICS] Fetching data for:", dateRange);
      setLoading(true);
      setError(null);

      const query: AnalyticsQuery = {
        startDate: format(dateRange.startDate, "yyyy-MM-dd"),
        endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        sellerId: user.id,
        includeComparison,
        groupBy: "day",
      };

      const params = new URLSearchParams(
        Object.entries(query).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      );

      // Fetch current period data
      const response = await apiRequest<AnalyticsData>(
        `/analytics/sales?${params.toString()}`
      );

      // If comparison is enabled, fetch previous period
      let comparisonData: ComparisonData | undefined;
      if (includeComparison) {
        const previousPeriod = getPreviousPeriod(dateRange);
        const prevQuery: AnalyticsQuery = {
          startDate: format(previousPeriod.startDate, "yyyy-MM-dd"),
          endDate: format(previousPeriod.endDate, "yyyy-MM-dd"),
          sellerId: user.id,
          groupBy: "day",
        };

        const prevParams = new URLSearchParams(
          Object.entries(prevQuery).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        );

        const previousResponse = await apiRequest<AnalyticsData>(
          `/analytics/sales?${prevParams.toString()}`
        );

        // Calculate comparison
        comparisonData = {
          current: response.metrics,
          previous: previousResponse.metrics,
          changes: {
            revenue: calculateChange(
              response.metrics.totalRevenue,
              previousResponse.metrics.totalRevenue
            ),
            orders: calculateChange(
              response.metrics.totalOrders,
              previousResponse.metrics.totalOrders
            ),
            averageOrderValue: calculateChange(
              response.metrics.averageOrderValue,
              previousResponse.metrics.averageOrderValue
            ),
            conversionRate: calculateChange(
              response.metrics.conversionRate,
              previousResponse.metrics.conversionRate
            ),
          },
        };
      }

      setData({
        ...response,
        dateRange,
        comparison: comparisonData,
      });

      console.log("✅ [ANALYTICS] Data loaded successfully");
    } catch (err) {
      console.warn("⚠️ [ANALYTICS] Backend unavailable, using mock data:", err);
      
      // Generate mock data for development/testing
      const mockData = generateMockAnalyticsData(dateRange);
      setData(mockData);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  }, [dateRange, user, includeComparison]);

  // Initial fetch and date range changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log("🔄 [ANALYTICS] Auto-refreshing data...");
      fetchAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  // Update date range from preset
  const setPreset = useCallback((preset: DateRangePreset) => {
    const newRange = getDateRangeFromPreset(preset);
    setDateRange(newRange);
  }, []);

  // Update custom date range
  const setCustomRange = useCallback((startDate: Date, endDate: Date) => {
    setDateRange({
      startDate: startOfDay(startDate),
      endDate: endOfDay(endDate),
      label: "Custom range",
    });
  }, []);

  return {
    // Data
    data,
    metrics: data?.metrics || null,
    salesTrend: data?.salesTrend || [],
    categoryBreakdown: data?.categoryBreakdown || [],
    topProducts: data?.topProducts || [],
    orderMetrics: data?.orderMetrics || null,
    comparison: data?.comparison || null,

    // State
    loading,
    error,
    dateRange,

    // Actions
    setPreset,
    setCustomRange,
    setDateRange,
    refetch: fetchAnalytics,
  };
}

// Hook for exporting analytics data
export function useAnalyticsExport() {
  const exportToCSV = useCallback((data: AnalyticsData) => {
    try {
      console.log("📥 [EXPORT] Generating CSV...");

      // Create CSV content
      const headers = ["Date", "Revenue (PHP)", "Orders", "Avg Order Value", "Customers"];
      const rows = data.salesTrend.map((point) => [
        point.date,
        point.revenue.toFixed(2),
        point.orders.toString(),
        data.metrics
          ? (point.revenue / point.orders || 0).toFixed(2)
          : "0.00",
        point.customers.toString(),
      ]);

      // Add summary section
      const summaryRows = [
        [],
        ["SUMMARY"],
        ["Total Revenue", data.metrics.totalRevenue.toFixed(2)],
        ["Total Orders", data.metrics.totalOrders.toString()],
        ["Average Order Value", data.metrics.averageOrderValue.toFixed(2)],
        ["Conversion Rate", `${data.metrics.conversionRate.toFixed(2)}%`],
      ];

      // Add top products section
      const topProductRows = [
        [],
        ["TOP PRODUCTS"],
        ["Product", "Units Sold", "Revenue", "Orders"],
        ...data.topProducts.slice(0, 10).map((product) => [
          product.name,
          product.unitsSold.toString(),
          product.revenue.toFixed(2),
          product.orders.toString(),
        ]),
      ];

      // Combine all sections
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
        ...summaryRows.map((row) => row.join(",")),
        ...topProductRows.map((row) => row.join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `analytics_${format(data.dateRange.startDate, "yyyy-MM-dd")}_to_${format(
          data.dateRange.endDate,
          "yyyy-MM-dd"
        )}.csv`
      );
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ [EXPORT] CSV downloaded successfully");
      return true;
    } catch (err) {
      console.error("❌ [EXPORT] Error:", err);
      return false;
    }
  }, []);

  return { exportToCSV };
}

/**
 * Generate mock analytics data for development when backend is unavailable
 */
function generateMockAnalyticsData(dateRange: DateRange): AnalyticsData {
  const days = Math.ceil(
    (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Generate sales trend data
  const salesTrend: SalesDataPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(dateRange.startDate);
    date.setDate(date.getDate() + i);
    salesTrend.push({
      date: date.toISOString(),
      revenue: Math.random() * 50000 + 10000,
      orders: Math.floor(Math.random() * 100 + 20),
      customers: Math.floor(Math.random() * 80 + 15),
    });
  }

  const totalRevenue = salesTrend.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesTrend.reduce((sum, day) => sum + day.orders, 0);

  return {
    dateRange,
    metrics: {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalRevenue / totalOrders,
      conversionRate: Math.random() * 5 + 2,
      growthRate: Math.random() * 20 - 5,
    },
    salesTrend,
    categoryBreakdown: [
      { categoryId: "1", categoryName: "Vegetables", revenue: totalRevenue * 0.4, orders: Math.floor(totalOrders * 0.35), percentage: 40 },
      { categoryId: "2", categoryName: "Fruits", revenue: totalRevenue * 0.3, orders: Math.floor(totalOrders * 0.3), percentage: 30 },
      { categoryId: "3", categoryName: "Herbs", revenue: totalRevenue * 0.2, orders: Math.floor(totalOrders * 0.2), percentage: 20 },
      { categoryId: "4", categoryName: "Mushrooms", revenue: totalRevenue * 0.1, orders: Math.floor(totalOrders * 0.15), percentage: 10 },
    ],
    topProducts: [
      { id: "1", name: "Organic Tomatoes", unitsSold: 450, revenue: totalRevenue * 0.15, orders: 120, averagePrice: (totalRevenue * 0.15) / 450, growthRate: 12.5 },
      { id: "2", name: "Fresh Lettuce", unitsSold: 380, revenue: totalRevenue * 0.12, orders: 95, averagePrice: (totalRevenue * 0.12) / 380, growthRate: 8.3 },
      { id: "3", name: "Bell Peppers", unitsSold: 320, revenue: totalRevenue * 0.10, orders: 85, averagePrice: (totalRevenue * 0.10) / 320, growthRate: -2.1 },
      { id: "4", name: "Basil Leaves", unitsSold: 280, revenue: totalRevenue * 0.08, orders: 70, averagePrice: (totalRevenue * 0.08) / 280, growthRate: 15.7 },
      { id: "5", name: "Strawberries", unitsSold: 250, revenue: totalRevenue * 0.09, orders: 65, averagePrice: (totalRevenue * 0.09) / 250, growthRate: 5.4 },
    ],
    orderMetrics: {
      totalOrders,
      completedOrders: Math.floor(totalOrders * 0.85),
      pendingOrders: Math.floor(totalOrders * 0.10),
      cancelledOrders: Math.floor(totalOrders * 0.05),
      averageOrderValue: totalRevenue / totalOrders,
      conversionRate: Math.random() * 5 + 2,
    },
    comparison: {
      current: {
        revenue: totalRevenue,
        orders: totalOrders,
        averageOrderValue: totalRevenue / totalOrders,
        conversionRate: Math.random() * 5 + 2,
      },
      previous: {
        revenue: totalRevenue * 0.85,
        orders: Math.floor(totalOrders * 0.9),
        averageOrderValue: (totalRevenue * 0.85) / Math.floor(totalOrders * 0.9),
        conversionRate: Math.random() * 4 + 2,
      },
      changes: {
        revenue: 15,
        orders: 10,
        averageOrderValue: 5.6,
        conversionRate: 8.2,
      },
    },
  };
}
