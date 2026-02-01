/**
 * FilterChips Component
 * Display and remove active filters as chips
 * Optimized with React.memo() for performance
 */
'use client';

import React, { memo } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductFilters, FilterOptions } from '@/types/product-filters';
import { format } from 'date-fns';

export interface FilterChipsProps {
  /** Current filter values */
  filters: ProductFilters;
  
  /** Callback to remove a specific filter */
  onRemoveFilter: (filterKey: keyof ProductFilters, value?: any) => void;
  
  /** Callback to clear all filters */
  onClearAll: () => void;
  
  /** Filter options for label mapping */
  filterOptions: FilterOptions;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * FilterChips displays active filters as removable badges
 * 
 * Features:
 * - Displays each active filter as a chip
 * - X button to remove individual filters
 * - "Clear all" button when multiple filters active
 * - Smooth animations on add/remove
 * 
 * Performance: Memoized with React.memo() to prevent unnecessary re-renders
 */
export const FilterChips = memo<FilterChipsProps>(function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  filterOptions,
  className,
}) {
  // Build list of active filter chips
  const activeChips: Array<{
    key: string;
    label: string;
    filterKey: keyof ProductFilters;
    value?: any;
  }> = [];

  // Category chips
  filters.categories.forEach((categoryId) => {
    const category = filterOptions.categories.find(c => c.id === categoryId);
    if (category) {
      activeChips.push({
        key: `category-${categoryId}`,
        label: `Category: ${category.name}`,
        filterKey: 'categories',
        value: categoryId,
      });
    }
  });

  // Price range chip (only if not default)
  const isDefaultPriceRange =
    filters.priceRange[0] === filterOptions.priceRange.min &&
    (filters.priceRange[1] === filterOptions.priceRange.max || filters.priceRange[1] === Infinity);

  if (!isDefaultPriceRange) {
    const maxPrice = filters.priceRange[1] === Infinity 
      ? filterOptions.priceRange.max 
      : filters.priceRange[1];
    activeChips.push({
      key: 'price-range',
      label: `Price: ₱${filters.priceRange[0].toLocaleString()} - ₱${maxPrice.toLocaleString()}`,
      filterKey: 'priceRange',
    });
  }

  // Stock status chip (only if not 'all')
  if (filters.stockStatus !== 'all') {
    const statusLabels: Record<string, string> = {
      'in-stock': 'In Stock',
      'low-stock': 'Low Stock',
      'out-of-stock': 'Out of Stock',
    };
    activeChips.push({
      key: 'stock-status',
      label: `Stock: ${statusLabels[filters.stockStatus]}`,
      filterKey: 'stockStatus',
    });
  }

  // Product status chip (only if not 'published')
  if (filters.productStatus !== 'published') {
    const statusLabels: Record<string, string> = {
      all: 'All Products',
      draft: 'Draft',
      archived: 'Archived',
    };
    activeChips.push({
      key: 'product-status',
      label: `Status: ${statusLabels[filters.productStatus]}`,
      filterKey: 'productStatus',
    });
  }

  // Date range chip
  if (filters.dateRange) {
    const fromDate = format(filters.dateRange.from, 'MMM d, yyyy');
    const toDate = format(filters.dateRange.to, 'MMM d, yyyy');
    activeChips.push({
      key: 'date-range',
      label: `Date: ${fromDate} - ${toDate}`,
      filterKey: 'dateRange',
    });
  }

  // Don't render if no active chips
  if (activeChips.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Active Filter Chips */}
      {activeChips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="pl-3 pr-2 py-1.5 gap-1.5 animate-in fade-in-50 slide-in-from-left-1"
        >
          <span className="text-xs font-medium">{chip.label}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFilter(chip.filterKey, chip.value)}
            className="h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {/* Clear All Button (show if 2+ filters) */}
      {activeChips.length >= 2 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
});
