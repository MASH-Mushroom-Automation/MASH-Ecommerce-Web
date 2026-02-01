/**
 * LowStockAlerts Component
 * Displays products needing restocking with quick action buttons
 * Optimized with React.memo() for performance
 */
'use client';

import React, { memo, useState } from 'react';
import { AlertTriangle, Package, ExternalLink, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { LowStockItem } from '@/types/inventory';
import { calculateUrgencyLevel } from '@/types/inventory';

export interface LowStockAlertsProps {
  /** Low stock items to display */
  items: LowStockItem[];
  
  /** Total count of low stock items (for pagination) */
  total: number;
  
  /** Current page number (1-indexed) */
  page: number;
  
  /** Items per page */
  pageSize: number;
  
  /** Whether more pages exist */
  hasMore: boolean;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  isError?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when quick restock button is clicked */
  onRestockClick?: (item: LowStockItem) => void;
  
  /** Callback to load next page */
  onLoadMore?: () => void;
}

/**
 * Urgency badge colors
 */
const URGENCY_COLORS = {
  critical: 'bg-red-500 text-white hover:bg-red-600',
  high: 'bg-amber-500 text-white hover:bg-amber-600',
  medium: 'bg-yellow-500 text-white hover:bg-yellow-600',
};

/**
 * Loading skeleton for table rows
 */
function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-20 w-full" /></TableCell>
    </TableRow>
  );
}

/**
 * Empty state component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Low Stock Items</h3>
      <p className="text-sm text-muted-foreground">
        All products are adequately stocked!
      </p>
    </div>
  );
}

/**
 * LowStockAlerts displays products needing restocking
 * 
 * Features:
 * - Table view with product name, SKU, current stock, restock threshold
 * - Urgency badges (critical/high/medium)
 * - Quick restock button (opens QuickStockUpdate modal)
 * - View product details button (links to product page)
 * - Load more pagination
 * - Empty state when no low stock items
 * - Loading skeletons
 * 
 * Performance: Memoized with React.memo() to prevent unnecessary re-renders
 */
export const LowStockAlerts = memo<LowStockAlertsProps>(function LowStockAlerts({
  items,
  total,
  page,
  pageSize,
  hasMore,
  isLoading = false,
  isError = false,
  className,
  onRestockClick,
  onLoadMore,
}) {
  // Show loading state
  if (isLoading && items.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  
  // Show error state
  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">Failed to load low stock alerts</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Show empty state
  if (items.length === 0 && !isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Low Stock Alerts
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Showing {items.length} of {total} items
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const urgency = calculateUrgencyLevel(
                  item.currentStock,
                  item.lowStockThreshold
                );
                
                return (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.mainImage && (
                          <img
                            src={item.mainImage}
                            alt={item.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          {item.category && (
                            <p className="text-xs text-muted-foreground">
                              {item.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{item.sku || 'N/A'}</code>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-semibold',
                          item.currentStock === 0 && 'text-red-600',
                          item.currentStock > 0 &&
                            item.currentStock < item.lowStockThreshold &&
                            'text-amber-600'
                        )}
                      >
                        {item.currentStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {item.lowStockThreshold}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(URGENCY_COLORS[urgency])}
                      >
                        {urgency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {onRestockClick && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRestockClick(item)}
                            aria-label={`Restock ${item.name}`}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Restock
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                        >
                          <Link
                            href={`/seller/products/${item.slug}`}
                            aria-label={`View details for ${item.name}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Load More Button */}
        {hasMore && onLoadMore && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
