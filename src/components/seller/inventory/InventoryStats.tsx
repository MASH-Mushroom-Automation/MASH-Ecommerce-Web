/**
 * InventoryStats Component
 * Displays key inventory metrics in stat cards
 * Optimized with React.memo() for performance
 */
'use client';

import React, { memo } from 'react';
import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { InventoryStats as InventoryStatsType } from '@/types/inventory';

export interface InventoryStatsProps {
  /** Inventory statistics data */
  stats?: InventoryStatsType;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  isError?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when a stat card is clicked (for filtering) */
  onStatClick?: (status: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock') => void;
}

/**
 * Individual stat card data
 */
interface StatCardData {
  id: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  title: string;
  value: number;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  textColor: string;
  ariaLabel: string;
}

/**
 * Loading skeleton for stat cards
 */
function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="h-4 w-24" />
        </CardTitle>
        <Skeleton className="h-10 w-10 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

/**
 * Individual stat card component
 */
const StatCard = memo<{
  data: StatCardData;
  onClick?: () => void;
  isClickable?: boolean;
}>(function StatCard({ data, onClick, isClickable = false }) {
  const Icon = data.icon;
  
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary'
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={data.ariaLabel}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-5',
          data.bgColor
        )}
      />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {data.title}
        </CardTitle>
        <div
          className={cn(
            'rounded-full p-2',
            data.bgColor,
            'bg-opacity-10'
          )}
        >
          <Icon className={cn('h-5 w-5', data.iconColor)} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className={cn('text-3xl font-bold', data.textColor)}>
            {data.value.toLocaleString()}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-1">
          {data.percentage.toFixed(1)}% of total inventory
        </p>
      </CardContent>
    </Card>
  );
});

/**
 * InventoryStats displays key inventory metrics in stat cards
 * 
 * Features:
 * - Four stat cards: Total SKUs, In Stock, Low Stock, Out of Stock
 * - Color-coded icons and backgrounds
 * - Responsive grid layout (2x2 mobile, 4x1 desktop)
 * - Loading skeleton states
 * - Optional click handling for filtering
 * - Accessible with ARIA labels and keyboard navigation
 * 
 * Performance: Memoized with React.memo() to prevent unnecessary re-renders
 */
export const InventoryStats = memo<InventoryStatsProps>(function InventoryStats({
  stats,
  isLoading = false,
  isError = false,
  className,
  onStatClick,
}) {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }
  
  // Show error state
  if (isError || !stats) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        <Card className="md:col-span-2 lg:col-span-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>Failed to load inventory statistics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Prepare stat card data
  const statCards: StatCardData[] = [
    {
      id: 'all',
      title: 'Total SKUs',
      value: stats.totalSKUs,
      percentage: 100,
      icon: Package,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      ariaLabel: `Total SKUs: ${stats.totalSKUs}`,
    },
    {
      id: 'in-stock',
      title: 'In Stock',
      value: stats.inStock,
      percentage: stats.inStockPercentage,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
      ariaLabel: `In Stock: ${stats.inStock} products (${stats.inStockPercentage.toFixed(1)}%)`,
    },
    {
      id: 'low-stock',
      title: 'Low Stock',
      value: stats.lowStock,
      percentage: stats.lowStockPercentage,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      ariaLabel: `Low Stock: ${stats.lowStock} products (${stats.lowStockPercentage.toFixed(1)}%)`,
    },
    {
      id: 'out-of-stock',
      title: 'Out of Stock',
      value: stats.outOfStock,
      percentage: stats.outOfStockPercentage,
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      ariaLabel: `Out of Stock: ${stats.outOfStock} products (${stats.outOfStockPercentage.toFixed(1)}%)`,
    },
  ];
  
  const isClickable = !!onStatClick;
  
  return (
    <div
      className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}
      role="region"
      aria-label="Inventory statistics summary"
    >
      {statCards.map((card) => (
        <StatCard
          key={card.id}
          data={card}
          onClick={isClickable ? () => onStatClick?.(card.id) : undefined}
          isClickable={isClickable}
        />
      ))}
    </div>
  );
});
