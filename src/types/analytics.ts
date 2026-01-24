/**
 * Analytics Types
 * TypeScript interfaces for sales analytics dashboard
 */

// Date range for filtering analytics
export interface DateRange {
  startDate: Date;
  endDate: Date;
  label?: string; // e.g., "Last 7 days", "Last 30 days", "Custom"
}

// Preset date range options
export type DateRangePreset = "7d" | "30d" | "90d" | "custom";

// Core analytics metrics
export interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  totalProducts: number;
  totalCustomers: number;
}

// Sales data point for trend charts
export interface SalesDataPoint {
  date: string; // ISO date string
  revenue: number;
  orders: number;
  customers: number;
}

// Revenue breakdown by category
export interface CategoryRevenue {
  category: string;
  categoryId?: string;
  revenue: number;
  orders: number;
  percentage: number;
  color?: string; // For chart visualization
}

// Revenue breakdown by product
export interface ProductRevenue {
  productId: string;
  productName: string;
  productSlug?: string;
  revenue: number;
  unitsSold: number;
  orders: number;
  percentage: number;
}

// Top performing products
export interface TopProduct {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  category?: string;
  unitsSold: number;
  revenue: number;
  orders: number;
  averagePrice: number;
  growthRate?: number; // % change vs previous period
}

// Order metrics details
export interface OrderMetricsDetail {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  conversionRate: number;
}

// Period comparison data
export interface ComparisonData {
  current: AnalyticsMetrics;
  previous: AnalyticsMetrics;
  changes: {
    revenue: number; // % change
    orders: number; // % change
    averageOrderValue: number; // % change
    conversionRate: number; // % change
  };
}

// Complete analytics response from API
export interface AnalyticsData {
  dateRange: DateRange;
  metrics: AnalyticsMetrics;
  salesTrend: SalesDataPoint[];
  categoryBreakdown: CategoryRevenue[];
  topProducts: TopProduct[];
  orderMetrics: OrderMetricsDetail;
  comparison?: ComparisonData;
}

// Export data format
export interface ExportData {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

// Analytics query parameters
export interface AnalyticsQuery {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  sellerId?: string; // Optional: filter by seller
  categoryId?: string; // Optional: filter by category
  productId?: string; // Optional: filter by specific product
  includeComparison?: boolean; // Include previous period comparison
  groupBy?: "day" | "week" | "month"; // Data aggregation level
}

// Chart configuration
export interface ChartConfig {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    success: string;
    warning: string;
    danger: string;
  };
  currency: string; // e.g., "PHP", "USD"
  locale: string; // e.g., "en-PH", "en-US"
}
