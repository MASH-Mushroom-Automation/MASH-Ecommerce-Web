/**
 * StockChart Component
 * Displays stock level distribution as a donut chart
 * Optimized with React.memo() for performance
 */
'use client';

import React, { memo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { StockLevelData } from '@/types/inventory';
import { generateStockLevelData } from '@/types/inventory';
import type { InventoryStats } from '@/types/inventory';

export interface StockChartProps {
  /** Inventory statistics data */
  stats?: InventoryStats;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  isError?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Chart height in pixels */
  height?: number;
}

/**
 * Color palette for stock status segments
 */
const STOCK_COLORS = {
  'in-stock': '#22c55e', // green-500
  'low-stock': '#f59e0b', // amber-500
  'out-of-stock': '#ef4444', // red-500
};

/**
 * Loading skeleton for chart
 */
function StockChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center" style={{ height }}>
          <Skeleton className="h-64 w-64 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Custom tooltip for chart segments
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: StockLevelData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3">
      <p className="font-semibold mb-1">{data.label}</p>
      <p className="text-sm text-muted-foreground">
        Count: <span className="font-medium">{data.count.toLocaleString()}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Percentage: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
      </p>
    </div>
  );
}

/**
 * Custom legend with click-to-filter functionality
 */
interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: StockLevelData;
  }>;
  hiddenStatuses: Set<string>;
  onToggleStatus: (status: string) => void;
}

function CustomLegend({ payload, hiddenStatuses, onToggleStatus }: CustomLegendProps) {
  if (!payload || payload.length === 0) {
    return null;
  }
  
  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        // Safely access payload.status with fallback to entry.value
        const status = entry.payload?.status ?? entry.value;
        const isHidden = hiddenStatuses.has(status);
        // Use a combination of value and index for unique key
        const uniqueKey = `${entry.value}-${index}`;
        
        return (
          <li
            key={uniqueKey}
            className={cn(
              'flex items-center gap-2 cursor-pointer select-none transition-opacity',
              isHidden && 'opacity-50'
            )}
            onClick={() => onToggleStatus(status)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleStatus(status);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Toggle ${entry.value} visibility`}
            aria-pressed={!isHidden}
          >
            <span
              className={cn(
                'w-3 h-3 rounded-full',
                isHidden && 'opacity-50'
              )}
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
            <span className="text-sm text-muted-foreground">
              ({entry.payload?.count ?? 0})
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * StockChart displays stock level distribution as a donut chart
 * 
 * Features:
 * - Donut chart with 3 segments: In Stock, Low Stock, Out of Stock
 * - Color-coded segments (green, amber, red)
 * - Interactive tooltips with count and percentage
 * - Clickable legend to show/hide segments
 * - Responsive sizing (adapts to container width)
 * - Animation on mount
 * - Keyboard accessible
 * 
 * Performance: Memoized with React.memo() to prevent unnecessary re-renders
 */
export const StockChart = memo<StockChartProps>(function StockChart({
  stats,
  isLoading = false,
  isError = false,
  className,
  height = 300,
}) {
  // Track hidden statuses for legend filtering
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set());
  
  // Show loading skeleton
  if (isLoading) {
    return <StockChartSkeleton height={height} />;
  }
  
  // Show error state
  if (isError || !stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Stock Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <p className="text-destructive">Failed to load chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Generate chart data
  const chartData = generateStockLevelData(stats);
  
  // Filter data based on hidden statuses
  const filteredData = chartData.filter(
    (item) => !hiddenStatuses.has(item.status)
  );
  
  // Calculate total count (sum of all counts in filtered data)
  const totalCount = filteredData.reduce((sum, item) => sum + item.count, 0);
  
  // Handle empty data (no items or all counts are zero)
  if (filteredData.length === 0 || totalCount === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Stock Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <p className="text-muted-foreground">No data to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Toggle status visibility
  const handleToggleStatus = (status: string) => {
    setHiddenStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        // Don't allow hiding all segments
        if (newSet.size < chartData.length - 1) {
          newSet.add(status);
        }
      }
      return newSet;
    });
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Stock Level Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="count"
              nameKey="label"
              animationBegin={0}
              animationDuration={800}
              label={({ percentage }) => `${percentage.toFixed(0)}%`}
              labelLine={false}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={(props) => (
                <CustomLegend
                  payload={props.payload}
                  hiddenStatuses={hiddenStatuses}
                  onToggleStatus={handleToggleStatus}
                />
              )}
              verticalAlign="bottom"
              height={60}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
