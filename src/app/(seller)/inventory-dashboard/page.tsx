/**
 * Real-Time Inventory Dashboard
 * 
 * Live inventory management with Sanity CMS real-time updates.
 * Updates automatically when stock changes - no refresh needed!
 * 
 * Phase 7: Inventory Management System
 */

"use client";

import { useSanityInventory } from "@/hooks/useSanityInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Package, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InventoryDashboard() {
  const { inventory, loading, error, lowStockCount, outOfStockCount, inStockCount } = useSanityInventory();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading inventory data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Inventory</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📦 Real-Time Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Live updates from Sanity CMS • Changes reflect in 1-2 seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">Tracked products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inStockCount}</div>
            <p className="text-xs text-muted-foreground">Good stock levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Unavailable products</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Low Stock Warning</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {lowStockCount} {lowStockCount === 1 ? 'product is' : 'products are'} running low on stock.
            Consider restocking soon to avoid stockouts.
          </AlertDescription>
        </Alert>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time stock levels • Edit in{" "}
            <a 
              href="http://localhost:3333" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Sanity Studio
            </a>
          </p>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Products Tracked</h3>
              <p className="text-muted-foreground mb-4">
                Enable inventory tracking in Sanity Studio for products to appear here.
              </p>
              <a
                href="http://localhost:3333"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Open Sanity Studio →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {inventory.map((item) => (
                <div 
                  key={item.productId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <Badge
                        variant={
                          item.stockStatus === 'out-of-stock' 
                            ? 'destructive' 
                            : item.stockStatus === 'low-stock' 
                            ? 'secondary' 
                            : 'default'
                        }
                      >
                        {item.stockStatus === 'out-of-stock' && '❌ Out of Stock'}
                        {item.stockStatus === 'low-stock' && '⚠️ Low Stock'}
                        {item.stockStatus === 'in-stock' && '✅ In Stock'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">{item.quantityInStock}</strong> units in stock
                      </span>
                      <span className="text-muted-foreground">
                        • Threshold: <strong className="text-foreground">{item.lowStockThreshold}</strong>
                      </span>
                      {item.allowBackorders && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Backorders enabled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {item.isLowStock && !item.isOutOfStock && (
                      <div className="text-sm text-yellow-600 font-medium">
                        Only {item.quantityInStock} left!
                      </div>
                    )}
                    {item.isOutOfStock && (
                      <div className="text-sm text-red-600 font-medium">
                        {item.allowBackorders ? 'Backorder available' : 'Unavailable'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How to Update Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Open{" "}
              <a 
                href="http://localhost:3333" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Sanity Studio
              </a>
            </li>
            <li>Navigate to <strong>Products</strong> section</li>
            <li>Select a product to edit</li>
            <li>Scroll to <strong>Inventory Management</strong> section</li>
            <li>Update <strong>Quantity in Stock</strong></li>
            <li>Click <strong>Publish</strong></li>
            <li>Watch this dashboard update in <strong>1-2 seconds</strong>! 🎉</li>
          </ol>
          <p className="mt-4 text-sm">
            💡 <strong>Tip:</strong> Set <strong>Track Inventory</strong> to true for products you want to monitor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
