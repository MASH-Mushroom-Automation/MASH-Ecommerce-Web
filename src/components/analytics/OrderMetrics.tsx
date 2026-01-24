/**
 * Order Metrics Component
 * Display KPI cards with trend indicators
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalyticsMetrics, ComparisonData } from "@/types/analytics";

interface OrderMetricsProps {
  metrics: AnalyticsMetrics;
  comparison?: ComparisonData | null;
  loading?: boolean;
  className?: string;
}

export function OrderMetrics({
  metrics,
  comparison,
  loading,
  className,
}: OrderMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-PH").format(num);
  };

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getTrendBgColor = (change: number) => {
    // Use subtle ring to indicate trend; keeps card background theme-aware
    if (change > 0) return "ring-1 ring-green-500/20 dark:ring-green-400/30";
    if (change < 0) return "ring-1 ring-red-500/20 dark:ring-red-400/30";
    return "";
  };

  const metricCards = [
    {
      title: "Total Orders",
      value: formatNumber(metrics.totalOrders),
      icon: ShoppingBag,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/15 dark:bg-blue-400/20",
      change: comparison?.changes.orders,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      icon: Banknote,
      iconColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-500/15 dark:bg-green-400/20",
      change: comparison?.changes.revenue,
    },
    {
      title: "Average Order Value",
      value: formatCurrency(metrics.averageOrderValue),
      icon: DollarSign,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/15 dark:bg-purple-400/20",
      change: comparison?.changes.averageOrderValue,
    },
    {
      title: "Conversion Rate",
      value: formatPercentage(metrics.conversionRate),
      icon: Percent,
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-500/15 dark:bg-orange-400/20",
      change: comparison?.changes.conversionRate,
    },
  ];

  if (loading) {
    return (
      <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded mb-2" />
              <div className="h-4 w-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        const hasChange = metric.change !== undefined && metric.change !== null;
        
        return (
          <Card
            key={index}
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-lg",
              hasChange && getTrendBgColor(metric.change)
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", metric.iconBg)}>
                <Icon className={cn("h-4 w-4", metric.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1 text-foreground">{metric.value}</div>
              
              {hasChange && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.change)}
                  <span className={cn("text-sm font-medium", getTrendColor(metric.change))}>
                    {metric.change > 0 && "+"}
                    {formatPercentage(metric.change)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    vs previous period
                  </span>
                </div>
              )}
              
              {!hasChange && (
                <p className="text-xs text-muted-foreground">
                  Current period
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
