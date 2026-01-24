/**
 * Revenue Breakdown Component
 * Toggle between category pie chart and top products bar chart
 */

"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryRevenue, TopProduct } from "@/types/analytics";

interface RevenueBreakdownProps {
  categoryBreakdown: CategoryRevenue[];
  topProducts: TopProduct[];
  loading?: boolean;
  className?: string;
}

const CHART_COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange-red
  "#6366f1", // indigo
];

export function RevenueBreakdown({
  categoryBreakdown,
  topProducts,
  loading,
  className,
}: RevenueBreakdownProps) {
  const [view, setView] = useState<"category" | "products">("category");

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm mb-2">
          {data.category || data.name}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-medium">
              ₱{data.revenue?.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {data.percentage !== undefined && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Share:</span>
              <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </div>
          )}
          {data.unitsSold !== undefined && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Units Sold:</span>
              <span className="font-medium">{data.unitsSold}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render label for pie chart
  const renderLabel = (entry: any) => {
    return `${entry.category} (${entry.percentage.toFixed(0)}%)`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Analysis by category and product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData =
    (view === "category" && categoryBreakdown.length > 0) ||
    (view === "products" && topProducts.length > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>
              {view === "category"
                ? "Revenue distribution by category"
                : "Top 10 performing products"}
            </CardDescription>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "category" | "products")}>
            <TabsList>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="products">Top Products</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">
              No data available for selected view
            </p>
          </div>
        ) : (
          <>
            {/* Category Pie Chart */}
            {view === "category" && (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={renderLabel}
                    labelLine={false}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Top Products Bar Chart */}
            {view === "products" && (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={topProducts.slice(0, 10)}
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      type="number"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      stroke="hsl(var(--border))"
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      stroke="hsl(var(--border))"
                      width={150}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Top Products Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Product</th>
                        <th className="text-right p-3 font-medium">Units Sold</th>
                        <th className="text-right p-3 font-medium">Revenue</th>
                        <th className="text-right p-3 font-medium">Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {topProducts.slice(0, 10).map((product, index) => (
                        <tr
                          key={product.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 text-muted-foreground">{index + 1}</td>
                          <td className="p-3 font-medium">{product.name}</td>
                          <td className="p-3 text-right">{product.unitsSold}</td>
                          <td className="p-3 text-right font-medium">
                            ₱{product.revenue.toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-3 text-right">{product.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
