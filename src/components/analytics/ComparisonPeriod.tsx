/**
 * Comparison Period Component
 * Show current vs previous period metrics side-by-side
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComparisonData } from "@/types/analytics";

interface ComparisonPeriodProps {
  comparison: ComparisonData;
  loading?: boolean;
  className?: string;
}

export function ComparisonPeriod({
  comparison,
  loading,
  className,
}: ComparisonPeriodProps) {
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
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (change: number) => {
    // Theme-aware chip styles for light and dark modes
    if (change > 0)
      return "text-green-600 dark:text-green-400 bg-green-500/15 dark:bg-green-400/20";
    if (change < 0)
      return "text-red-600 dark:text-red-400 bg-red-500/15 dark:bg-red-400/20";
    return "text-muted-foreground bg-muted/30 dark:bg-muted/20";
  };

  const comparisons = [
    {
      label: "Total Revenue",
      current: formatCurrency(comparison.current.totalRevenue),
      previous: formatCurrency(comparison.previous.totalRevenue),
      change: comparison.changes.revenue,
    },
    {
      label: "Total Orders",
      current: formatNumber(comparison.current.totalOrders),
      previous: formatNumber(comparison.previous.totalOrders),
      change: comparison.changes.orders,
    },
    {
      label: "Average Order Value",
      current: formatCurrency(comparison.current.averageOrderValue),
      previous: formatCurrency(comparison.previous.averageOrderValue),
      change: comparison.changes.averageOrderValue,
    },
    {
      label: "Conversion Rate",
      current: formatPercentage(comparison.current.conversionRate),
      previous: formatPercentage(comparison.previous.conversionRate),
      change: comparison.changes.conversionRate,
    },
  ];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Period Comparison</CardTitle>
          <CardDescription>Current vs Previous period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Period Comparison</CardTitle>
        <CardDescription>
          Compare current period performance with the previous period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground">Metric</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">
                    Current Period
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground">
                    Previous Period
                  </th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisons.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{item.label}</td>
                    <td className="p-3 text-right font-semibold">{item.current}</td>
                    <td className="p-3 text-right text-muted-foreground">{item.previous}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
                            getTrendColor(item.change)
                          )}
                        >
                          {getTrendIcon(item.change)}
                          {item.change > 0 && "+"}
                          {formatPercentage(item.change)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {comparisons.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="font-medium text-sm text-muted-foreground">
                {item.label}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current</div>
                  <div className="text-lg font-semibold">{item.current}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Previous</div>
                  <div className="text-lg font-medium text-muted-foreground">
                    {item.previous}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium",
                    getTrendColor(item.change)
                  )}
                >
                  {getTrendIcon(item.change)}
                  {item.change > 0 && "+"}
                  {formatPercentage(item.change)} vs previous
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
