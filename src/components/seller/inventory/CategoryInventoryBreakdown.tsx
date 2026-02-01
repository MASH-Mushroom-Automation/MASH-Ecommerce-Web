/**
 * CategoryInventoryBreakdown Component
 * 
 * Displays inventory statistics grouped by product category in an expandable accordion format.
 * Shows category-level summaries with stock distribution and expandable product lists.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Package, ExternalLink, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { CategoryInventory } from '@/types/inventory';
import { cn } from '@/lib/utils';

interface CategoryInventoryBreakdownProps {
  categories?: CategoryInventory[];
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
}

/**
 * Skeleton loader for category rows
 */
const CategoryRowSkeleton: React.FC = () => (
  <div className="border-b p-4 space-y-2">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-6 w-24" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

/**
 * Empty state when no categories available
 */
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Package className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
    <p className="text-sm text-muted-foreground max-w-md">
      Create product categories to organize your inventory effectively.
    </p>
  </div>
);

/**
 * Bar chart visualization for category stock distribution
 */
const CategoryStockBar: React.FC<{
  inStock: number;
  lowStock: number;
  outOfStock: number;
  total: number;
}> = ({ inStock, lowStock, outOfStock, total }) => {
  const inStockPercent = total > 0 ? (inStock / total) * 100 : 0;
  const lowStockPercent = total > 0 ? (lowStock / total) * 100 : 0;
  const outOfStockPercent = total > 0 ? (outOfStock / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {inStockPercent > 0 && (
          <div
            className="bg-green-500 transition-all"
            style={{ width: `${inStockPercent}%` }}
            title={`${inStock} in stock (${inStockPercent.toFixed(1)}%)`}
          />
        )}
        {lowStockPercent > 0 && (
          <div
            className="bg-amber-500 transition-all"
            style={{ width: `${lowStockPercent}%` }}
            title={`${lowStock} low stock (${lowStockPercent.toFixed(1)}%)`}
          />
        )}
        {outOfStockPercent > 0 && (
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${outOfStockPercent}%` }}
            title={`${outOfStock} out of stock (${outOfStockPercent.toFixed(1)}%)`}
          />
        )}
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>{inStock} in stock</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span>{lowStock} low stock</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>{outOfStock} out of stock</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Product list within expanded category
 */
const ProductList: React.FC<{ products: CategoryInventory['products'] }> = ({
  products,
}) => {
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No products in this category
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => {
        const stockPercent =
          product.lowStockThreshold > 0
            ? (product.currentStock / product.lowStockThreshold) * 100
            : 100;
        const isLowStock = product.currentStock < product.lowStockThreshold;
        const isOutOfStock = product.currentStock === 0;

        return (
          <div
            key={product._id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              {product.mainImage && (
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="h-10 w-10 rounded object-cover"
                />
              )}
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isOutOfStock && 'text-red-600',
                    isLowStock && !isOutOfStock && 'text-amber-600'
                  )}
                >
                  {product.currentStock}
                </p>
                <p className="text-xs text-muted-foreground">
                  / {product.lowStockThreshold}
                </p>
              </div>
              {(isLowStock || isOutOfStock) && (
                <AlertTriangle
                  className={cn(
                    'h-5 w-5',
                    isOutOfStock ? 'text-red-600' : 'text-amber-600'
                  )}
                />
              )}
              <Button size="sm" variant="ghost" asChild>
                <Link
                  href={`/seller/products/${product.slug}`}
                  aria-label={`View details for ${product.name}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Main CategoryInventoryBreakdown Component
 */
export const CategoryInventoryBreakdown = React.memo<CategoryInventoryBreakdownProps>(
  function CategoryInventoryBreakdown({
    categories = [],
    isLoading = false,
    isError = false,
    className,
  }) {
    const [sortBy, setSortBy] = useState<'name' | 'total' | 'stock-value'>('name');

    // Sort categories based on selected criteria
    const sortedCategories = useMemo(() => {
      if (!categories.length) return [];

      const sorted = [...categories];

      switch (sortBy) {
        case 'total':
          return sorted.sort((a, b) => (b.totalProducts ?? 0) - (a.totalProducts ?? 0));
        case 'stock-value':
          return sorted.sort((a, b) => (b.totalValue ?? 0) - (a.totalValue ?? 0));
        case 'name':
        default:
          return sorted.sort((a, b) => (a.categoryName ?? '').localeCompare(b.categoryName ?? ''));
      }
    }, [categories, sortBy]);

    // Error fallback
    if (isError) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Failed to load category breakdown
            </div>
          </CardContent>
        </Card>
      );
    }

    // Loading state
    if (isLoading) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <CategoryRowSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Empty state
    if (categories.length === 0) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Category Breakdown</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  onClick={() => setSortBy('name')}
                >
                  Name
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === 'total' ? 'default' : 'outline'}
                  onClick={() => setSortBy('total')}
                >
                  Total
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === 'stock-value' ? 'default' : 'outline'}
                  onClick={() => setSortBy('stock-value')}
                >
                  Value
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {sortedCategories.map((category) => (
              <AccordionItem key={category.categoryId} value={category.categoryId}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4 gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{category.categoryName}</h3>
                      <Badge variant="secondary">
                        {category.totalProducts} product{category.totalProducts !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        Value: ₱
                        {(category.totalValue ?? 0).toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4">
                    <CategoryStockBar
                      inStock={category.inStock}
                      lowStock={category.lowStock}
                      outOfStock={category.outOfStock}
                      total={category.totalProducts}
                    />
                    <div className="mt-4">
                      <ProductList products={category.products} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    );
  }
);
