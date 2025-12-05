/**
 * Analytics Hook
 * Fetch sales reports and product analytics
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { sanityClient } from "@/lib/sanity/client";

export interface AnalyticsReport {
  _id: string;
  id: string;
  reportName: string;
  reportType: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  salesMetrics?: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalProducts: number;
    conversionRate: number;
  };
  customerMetrics?: {
    newCustomers: number;
    returningCustomers: number;
    customerRetentionRate: number;
    averageLifetimeValue: number;
  };
  marketingMetrics?: {
    totalCampaigns: number;
    emailOpenRate: number;
    emailClickRate: number;
    couponUsage: number;
    promotionConversions: number;
  };
  topProducts?: Array<{
    product: { id: string; name: string };
    unitsSold: number;
    revenue: number;
  }>;
  generatedAt: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProduct?: string;
  revenueGrowth: number;
}

export function useSanityAnalytics(reportType?: string) {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      console.log("📊 [ANALYTICS] Fetching reports...");
      setLoading(true);

      const condition = reportType ? `_type == "analytics" && reportType == "${reportType}"` : `_type == "analytics"`;

      const query = `*[${condition}] | order(generatedAt desc) {
        _id, reportName, reportType, dateRange, salesMetrics,
        customerMetrics, marketingMetrics, topProducts, generatedAt
      }`;

      const result = await sanityClient.fetch<AnalyticsReport[]>(query);
      const transformed = result.map((r) => ({ ...r, id: r._id }));
      setReports(transformed);
      console.log(`✅ [ANALYTICS] Loaded ${transformed.length} reports`);
      setError(null);
    } catch (err) {
      console.error("❌ [ANALYTICS] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [reportType]);

  useEffect(() => {
    fetchReports();
    const subscription = sanityClient.listen(`*[_type == "analytics"]`).subscribe((update) => {
      if (update.type === "mutation") {
        console.log("🔄 [ANALYTICS] Real-time update!");
        fetchReports();
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchReports]);

  return { reports, loading, error, refetch: fetchReports };
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log("📈 [DASHBOARD] Fetching metrics...");
        setLoading(true);

        // Fetch latest reports for aggregated metrics
        const salesQuery = `*[_type == "analytics" && reportType == "sales-overview"] | order(generatedAt desc)[0] { salesMetrics }`;
        const customersQuery = `*[_type == "analytics" && reportType == "customer-insights"] | order(generatedAt desc)[0] { customerMetrics }`;
        const productsQuery = `*[_type == "analytics" && reportType == "product-performance"] | order(generatedAt desc)[0] { topProducts }`;

        const [salesData, customerData, productData] = await Promise.all([
          sanityClient.fetch(salesQuery),
          sanityClient.fetch(customersQuery),
          sanityClient.fetch(productsQuery),
        ]);

        const dashboardMetrics: DashboardMetrics = {
          totalRevenue: salesData?.salesMetrics?.totalRevenue || 0,
          totalOrders: salesData?.salesMetrics?.totalOrders || 0,
          totalCustomers:
            (customerData?.customerMetrics?.newCustomers || 0) +
            (customerData?.customerMetrics?.returningCustomers || 0),
          averageOrderValue: salesData?.salesMetrics?.averageOrderValue || 0,
          conversionRate: salesData?.salesMetrics?.conversionRate || 0,
          topSellingProduct: productData?.topProducts?.[0]?.product?.name || "N/A",
          revenueGrowth: 0, // Calculate from historical data
        };

        setMetrics(dashboardMetrics);
        setError(null);
      } catch (err) {
        console.error("❌ [DASHBOARD] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    const subscription = sanityClient.listen(`*[_type == "analytics"]`).subscribe((update) => {
      if (update.type === "mutation") {
        console.log("🔄 [DASHBOARD] Real-time update!");
        fetchMetrics();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { metrics, loading, error };
}
