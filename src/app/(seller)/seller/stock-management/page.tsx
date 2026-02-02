/**
 * Stock Management Page
 * Main page for sellers to manage product stock levels
 * Route: /seller/stock-management
 */

'use client';

import { useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  FileSpreadsheet, 
  History,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

import { StockAdjustmentForm } from '@/components/seller/stock/StockAdjustmentForm';
import { BatchStockUpdate } from '@/components/seller/stock/BatchStockUpdate';
import { StockHistoryLog } from '@/components/seller/stock/StockHistoryLog';
import { useSanityProducts } from '@/hooks/useSanityProducts';

/**
 * Stats card component
 */
function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend
}: { 
  title: string; 
  value: string | number; 
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for stats
 */
function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Stock Overview Stats
 * Shows placeholder stats (TODO: connect to real API)
 */
function StockOverviewStats() {
  // TODO: Fetch real stats from API using React Query
  const stats = {
    totalProducts: 156,
    lowStockItems: 12,
    outOfStock: 3,
    recentAdjustments: 24,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Products"
        value={stats.totalProducts}
        description="Active inventory items"
        icon={Package}
      />
      <StatsCard
        title="Low Stock Items"
        value={stats.lowStockItems}
        description="Below threshold"
        icon={AlertTriangle}
        trend="down"
      />
      <StatsCard
        title="Out of Stock"
        value={stats.outOfStock}
        description="Needs immediate attention"
        icon={TrendingDown}
        trend="down"
      />
      <StatsCard
        title="Recent Adjustments"
        value={stats.recentAdjustments}
        description="Last 7 days"
        icon={RefreshCw}
      />
    </div>
  );
}

/**
 * Main Stock Management Page
 */
export default function StockManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch products from Sanity CMS (not backend API)
  // useSanityProducts fetches products with: id, name, stock, sku, etc.
  const { products, loading: productsLoading, error: productsError, refetch } = useSanityProducts();
  
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    refetch(); // Also refetch products
  }, [refetch]);

  // Transform Sanity products for the StockAdjustmentForm
  // TransformedProduct uses 'id' and 'stock', form expects '_id' and 'stockQuantity'
  const formProducts = (products || []).map(p => ({
    _id: p.id, // Sanity uses 'id', form expects '_id'
    name: p.name || '',
    sku: p.sku || '',
    stockQuantity: p.stock ?? 0, // Sanity uses 'stock', form expects 'stockQuantity'
    lowStockThreshold: 10 // Default threshold (Sanity products don't have this field yet)
  }));

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
        <p className="text-muted-foreground">
          Manage your inventory levels, make adjustments, and track stock changes.
        </p>
      </div>

      {/* Overview Stats */}
      <StockOverviewStats />

      {/* Main Content Tabs */}
      <Tabs defaultValue="quick-adjust" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="quick-adjust" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Adjust</span>
            <span className="sm:hidden">Adjust</span>
          </TabsTrigger>
          <TabsTrigger value="batch-import" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Batch Import</span>
            <span className="sm:hidden">Import</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">Log</span>
          </TabsTrigger>
        </TabsList>

        {/* Quick Adjust Tab */}
        <TabsContent value="quick-adjust" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stock Adjustment</CardTitle>
              <CardDescription>
                Make individual stock adjustments for a specific product. Perfect for quick corrections 
                or single-item updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : productsError ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Failed to load products
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {productsError.message || 'An error occurred while fetching products'}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="text-sm text-primary underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              ) : formProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    No products found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add products to your inventory first before making stock adjustments.
                  </p>
                </div>
              ) : (
                <StockAdjustmentForm 
                  products={formProducts}
                  onSuccess={handleRefresh}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Import Tab */}
        <TabsContent value="batch-import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Stock Update</CardTitle>
              <CardDescription>
                Import stock adjustments in bulk using a CSV file. Supports up to 1,000 items per import.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BatchStockUpdate 
                onImportComplete={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <StockHistoryLog 
            key={refreshKey}
            showProductColumn={true}
            pageSize={25}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
