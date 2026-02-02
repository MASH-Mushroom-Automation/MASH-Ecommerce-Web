/**
 * Inventory Overview Dashboard Page
 * Comprehensive inventory management with analytics and quick actions
 */
'use client';

import React, { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Inventory Components (Phase 2)
import { InventoryStats } from '@/components/seller/inventory/InventoryStats';
import { StockChart } from '@/components/seller/inventory/StockChart';
import { LowStockAlerts } from '@/components/seller/inventory/LowStockAlerts';
import { CategoryInventoryBreakdown } from '@/components/seller/inventory/CategoryInventoryBreakdown';

// Interactive Components (Phase 3)
import { StockValueCalculator } from '@/components/seller/inventory/StockValueCalculator';
import { QuickStockUpdate } from '@/components/seller/inventory/QuickStockUpdate';

// Hooks (Phase 1)
import { useInventoryData, useInvalidateInventory } from '@/hooks/useInventoryData';
import type { LowStockItem } from '@/types/inventory';

/**
 * Loading skeleton for the entire dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>

      {/* Category breakdown skeleton */}
      <Skeleton className="h-96" />
    </div>
  );
}

/**
 * Error state for the dashboard
 */
function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive inventory analytics and management
        </p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Unable to Load Inventory Data</CardTitle>
          <CardDescription>
            Please check your connection and try again. If the problem persists, contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}


/**
 * Inventory Overview Page
 * 
 * Features:
 * - Real-time inventory statistics (Total SKUs, In Stock, Low Stock, Out of Stock)
 * - Stock distribution chart (donut chart with Recharts)
 * - Low stock alerts with pagination and quick actions
 * - Category-wise inventory breakdown (expandable sections)
 * - Inventory value calculator with CSV export
 * - Quick stock update modal for fast adjustments
 * - Responsive layout: mobile (stacked), tablet (2-col), desktop (3-col)
 * - Refresh button to invalidate all queries
 * - Real-time polling (30s interval) with toast notifications
 */
export default function InventoryOverviewPage() {
  // React Query hooks for data fetching (parallel) with real-time polling
  const {
    stats,
    lowStockProducts,
    stockValue,
    categoryInventory,
    isLoading,
    isError,
    error,
  } = useInventoryData({
    enableRealtime: true, // Enable polling for real-time updates
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const { invalidateAll } = useInvalidateInventory();

  // Quick stock update modal state
  const [quickUpdateProduct, setQuickUpdateProduct] = useState<LowStockItem | null>(null);
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);

  // Handle refresh button click
  const handleRefresh = () => {
    invalidateAll();
  };

  // Handle quick update from LowStockAlerts
  const handleQuickUpdateClick = (product: LowStockItem) => {
    setQuickUpdateProduct(product);
    setIsQuickUpdateOpen(true);
  };

  // Handle quick update success (invalidate inventory queries)
  const handleQuickUpdateSuccess = () => {
    invalidateAll();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <DashboardError
          message={error?.message || 'Failed to load inventory data'}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header - Compact */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Overview</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive inventory analytics and management
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          aria-label="Refresh inventory data"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Separator />

      {/* Inventory Stats - Full width, 4 cards - Compact */}
      <section aria-labelledby="inventory-stats-heading">
        <h2 id="inventory-stats-heading" className="sr-only">
          Inventory Statistics
        </h2>
        <InventoryStats stats={stats} isLoading={isLoading} isError={isError} />
      </section>

      {/* Stock Chart (smaller) + Low Stock Alerts - Two column on desktop */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
        <section 
          aria-labelledby="stock-distribution-heading"
          className="lg:col-span-2"
        >
          <h2 id="stock-distribution-heading" className="sr-only">
            Stock Distribution Chart
          </h2>
          <StockChart 
            stats={stats} 
            isLoading={isLoading} 
            isError={isError} 
            height={220}
          />
        </section>

        <section 
          aria-labelledby="low-stock-alerts-heading"
          className="lg:col-span-3"
        >
          <h2 id="low-stock-alerts-heading" className="sr-only">
            Low Stock Alerts
          </h2>
          <LowStockAlerts
            items={lowStockProducts?.items ?? []}
            total={lowStockProducts?.total ?? 0}
            page={1}
            pageSize={10}
            hasMore={lowStockProducts?.hasMore ?? false}
            isLoading={isLoading}
            isError={isError}
            onRestockClick={handleQuickUpdateClick}
          />
        </section>
      </div>

      {/* Category Inventory Breakdown - Full width */}
      <section aria-labelledby="category-inventory-heading">
        <h2 id="category-inventory-heading" className="sr-only">
          Category Inventory Breakdown
        </h2>
        <CategoryInventoryBreakdown
          categories={categoryInventory}
          isLoading={isLoading}
          isError={isError}
        />
      </section>

      {/* Stock Value Calculator - Full width */}
      <section aria-labelledby="inventory-value-heading">
        <h2 id="inventory-value-heading" className="sr-only">
          Inventory Value Calculator
        </h2>
        <StockValueCalculator
          valueData={stockValue}
          isLoading={isLoading}
          isError={isError}
        />
      </section>

      {/* Quick Stock Update Modal */}
      <QuickStockUpdate
        open={isQuickUpdateOpen}
        onOpenChange={setIsQuickUpdateOpen}
        product={quickUpdateProduct}
        onSuccess={handleQuickUpdateSuccess}
      />
    </div>
  );
}
