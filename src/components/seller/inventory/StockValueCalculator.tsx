/**
 * StockValueCalculator Component
 * 
 * Displays total inventory value and value breakdown by category.
 * Supports CSV export for financial reporting.
 */

'use client';

import React, { useMemo } from 'react';
import { Download, TrendingUp, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InventoryValue } from '@/types/inventory';
import { formatCurrency } from '@/types/inventory';
import { cn } from '@/lib/utils';

export interface StockValueCalculatorProps {
  /** Inventory value data */
  valueData?: InventoryValue;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  isError?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton loader for value table
 */
const ValueTableSkeleton: React.FC = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center justify-between p-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
);

/**
 * Empty state when no value data
 */
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Package className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No Inventory Data</h3>
    <p className="text-sm text-muted-foreground max-w-md">
      Add products with stock and pricing to calculate inventory value.
    </p>
  </div>
);

/**
 * Export inventory value data to CSV
 */
function exportToCSV(valueData: InventoryValue) {
  const headers = ['Category', 'Total Units', 'Total Value (PHP)'];
  const rows = (valueData.categoriesValue ?? []).map((cat) => [
    cat.categoryName ?? 'Unknown',
    (cat.totalUnits ?? 0).toString(),
    (cat.totalValue ?? 0).toFixed(2),
  ]);

  // Add total row
  rows.push([
    'TOTAL',
    (valueData.totalUnits ?? 0).toString(),
    (valueData.totalValue ?? 0).toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory-value-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * StockValueCalculator Component
 * 
 * Features:
 * - Total inventory value card
 * - Value breakdown by category (table)
 * - Export to CSV functionality
 * - Currency formatting (PHP)
 * - Handles null/undefined prices gracefully
 */
export const StockValueCalculator = React.memo<StockValueCalculatorProps>(
  function StockValueCalculator({ valueData, isLoading = false, isError = false, className }) {
    // Sort categories by value descending (with null-safety)
    const sortedCategories = useMemo(() => {
      if (!valueData || !valueData.categoriesValue) return [];
      return [...valueData.categoriesValue].sort((a, b) => (b.totalValue ?? 0) - (a.totalValue ?? 0));
    }, [valueData]);

    // Error fallback
    if (isError) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-destructive">
              <TrendingUp className="h-5 w-5 mr-2" />
              Failed to calculate inventory value
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
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <ValueTableSkeleton />
            </div>
          </CardContent>
        </Card>
      );
    }

    // Empty state
    if (!valueData || valueData.totalValue === 0) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Inventory Value
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
              <DollarSign className="h-5 w-5" />
              Inventory Value
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(valueData)}
              aria-label="Export inventory value to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Value Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Total Inventory Value
            </div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {formatCurrency(valueData?.totalValue ?? 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {(valueData?.totalUnits ?? 0).toLocaleString('en-PH')} units across{' '}
              {(valueData?.categoriesValue ?? []).length} categories
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Value by Category</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCategories.map((category) => {
                    const totalValue = valueData?.totalValue ?? 1;
                    const percentage = totalValue > 0 
                      ? ((category.totalValue ?? 0) / totalValue) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={category.categoryId}>
                        <TableCell className="font-medium">
                          {category.categoryName ?? 'Unknown'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {(category.totalUnits ?? 0).toLocaleString('en-PH')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(category.totalValue ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground min-w-[3ch]">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Value per Unit</p>
                <p className="text-sm font-semibold">
                  {formatCurrency(
                    (valueData?.totalUnits ?? 0) > 0 
                      ? (valueData?.totalValue ?? 0) / (valueData?.totalUnits ?? 1) 
                      : 0
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Highest Value Category</p>
                <p className="text-sm font-semibold truncate max-w-[120px]">
                  {sortedCategories[0]?.categoryName || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
