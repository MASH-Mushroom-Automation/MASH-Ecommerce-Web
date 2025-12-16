/**
 * Example: Admin Dashboard Stats Widget
 *
 * This component demonstrates how to use the useAdminDashboard hook
 * in other parts of the application. Since TanStack Query caches data,
 * multiple components can use the same hook without making duplicate API requests.
 */

"use client";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, ShoppingBag, TrendingUp } from "lucide-react";

export function AdminStatsWidget() {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <LoadingSpinner size="sm" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-2 py-6 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load stats</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.alert.pendingOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.alert.message}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.metrics.orders.value}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.metrics.orders.change >= 0 ? "+" : ""}
            {data.metrics.orders.change}% {data.metrics.orders.changeLabel}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.metrics.revenue.currency}{" "}
            {data.metrics.revenue.value.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.metrics.revenue.change >= 0 ? "+" : ""}
            {data.metrics.revenue.change}% {data.metrics.revenue.changeLabel}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example: Weekly Sales Mini Chart
 *
 * Demonstrates accessing chart data from the dashboard API
 */
export function WeeklySalesMiniChart() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading || !data) {
    return <LoadingSpinner size="sm" />;
  }

  const maxSales = Math.max(...data.charts.weeklySales.map((d) => d.sales), 1);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Weekly Sales</h4>
      <div className="flex items-end gap-1 h-20">
        {data.charts.weeklySales.map((day) => (
          <div
            key={day.date}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div
              className="w-full bg-primary rounded-t"
              style={{
                height: `${(day.sales / maxSales) * 100}%`,
                minHeight: day.sales > 0 ? "4px" : "0px",
              }}
            />
            <span className="text-xs text-muted-foreground">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Usage in a Header Component
 *
 * Shows how to display a single metric in a compact format
 */
export function PendingOrdersBadge() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return null; // Or a skeleton
  }

  if (!data || data.alert.pendingOrders === 0) {
    return null;
  }

  return (
    <div className="relative">
      <ShoppingBag className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
        {data.alert.pendingOrders}
      </span>
    </div>
  );
}
