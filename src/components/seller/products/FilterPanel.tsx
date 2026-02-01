/**
 * FilterPanel Component
 * Comprehensive product filtering UI with Radix primitives
 */
'use client';

import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ProductFilters, FilterOptions, StockStatus, ProductStatus } from '@/types/product-filters';

export interface FilterPanelProps {
  /** Current filter values */
  filters: ProductFilters;
  
  /** Callback when filters change */
  onFiltersChange: (filters: ProductFilters) => void;
  
  /** Available filter options from Sanity */
  filterOptions: FilterOptions;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Show clear filters button */
  showClearButton?: boolean;
}

/**
 * FilterPanel with collapsible sections
 * 
 * Features:
 * - Category multi-select (checkboxes)
 * - Price range slider
 * - Stock status radio group
 * - Product status dropdown
 * - Date range picker
 * - Collapsible accordion sections
 * - Clear all filters button
 */
export function FilterPanel({
  filters,
  onFiltersChange,
  filterOptions,
  className,
  showClearButton = true,
}: FilterPanelProps) {
  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: range,
    });
  };

  const handleStockStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      stockStatus: status as StockStatus,
    });
  };

  const handleProductStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      productStatus: status as ProductStatus,
    });
  };

  const handleDateRangeChange = (type: 'from' | 'to', date: Date | undefined) => {
    if (!date) {
      onFiltersChange({
        ...filters,
        dateRange: null,
      });
      return;
    }

    const currentRange = filters.dateRange || { from: new Date(), to: new Date() };
    onFiltersChange({
      ...filters,
      dateRange: {
        ...currentRange,
        [type]: date,
      },
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: filters.search, // Preserve search text
      categories: [],
      priceRange: [filterOptions.priceRange.min, filterOptions.priceRange.max],
      stockStatus: 'all',
      productStatus: 'published',
      dateRange: null,
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priceRange[0] > filterOptions.priceRange.min ||
    filters.priceRange[1] < filterOptions.priceRange.max ||
    filters.stockStatus !== 'all' ||
    filters.productStatus !== 'published' ||
    filters.dateRange !== null;

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        
        {showClearButton && hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Sections (Accordion) */}
      <Accordion type="multiple" defaultValue={['categories', 'price', 'stock', 'status']} className="w-full">
        {/* Categories */}
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-medium">
            Categories
            {filters.categories.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({filters.categories.length})
              </span>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {filterOptions.categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories available</p>
              ) : (
                filterOptions.categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {category.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({category.productCount})
                      </span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                min={filterOptions.priceRange.min}
                max={filterOptions.priceRange.max}
                step={10}
                value={filters.priceRange}
                onValueChange={(value) => handlePriceRangeChange(value as [number, number])}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>₱{filters.priceRange[0].toLocaleString()}</span>
                <span>₱{filters.priceRange[1] === Infinity ? filterOptions.priceRange.max.toLocaleString() : filters.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stock Status */}
        <AccordionItem value="stock">
          <AccordionTrigger className="text-sm font-medium">
            Stock Status
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={filters.stockStatus}
              onValueChange={handleStockStatusChange}
              className="space-y-3 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="stock-all" />
                <Label htmlFor="stock-all" className="text-sm font-normal cursor-pointer">
                  All Products
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({Object.values(filterOptions.stockCounts).reduce((a, b) => a + b, 0)})
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-stock" id="stock-in" />
                <Label htmlFor="stock-in" className="text-sm font-normal cursor-pointer">
                  In Stock
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({filterOptions.stockCounts.inStock})
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low-stock" id="stock-low" />
                <Label htmlFor="stock-low" className="text-sm font-normal cursor-pointer">
                  Low Stock
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({filterOptions.stockCounts.lowStock})
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="out-of-stock" id="stock-out" />
                <Label htmlFor="stock-out" className="text-sm font-normal cursor-pointer">
                  Out of Stock
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({filterOptions.stockCounts.outOfStock})
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Product Status */}
        <AccordionItem value="status">
          <AccordionTrigger className="text-sm font-medium">
            Product Status
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <Select
                value={filters.productStatus}
                onValueChange={handleProductStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Products ({Object.values(filterOptions.statusCounts).reduce((a, b) => a + b, 0)})
                  </SelectItem>
                  <SelectItem value="published">
                    Published ({filterOptions.statusCounts.published})
                  </SelectItem>
                  <SelectItem value="draft">
                    Draft ({filterOptions.statusCounts.draft})
                  </SelectItem>
                  <SelectItem value="archived">
                    Archived ({filterOptions.statusCounts.archived})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Date Range */}
        <AccordionItem value="date">
          <AccordionTrigger className="text-sm font-medium">
            Date Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {/* From Date */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.dateRange?.from && 'text-muted-foreground'
                      )}
                    >
                      <span className="mr-2">📅</span>
                      {filters.dateRange?.from ? (
                        format(filters.dateRange.from, 'PPP')
                      ) : (
                        'Pick a date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.from}
                      onSelect={(date) => handleDateRangeChange('from', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.dateRange?.to && 'text-muted-foreground'
                      )}
                    >
                      <span className="mr-2">📅</span>
                      {filters.dateRange?.to ? (
                        format(filters.dateRange.to, 'PPP')
                      ) : (
                        'Pick a date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.to}
                      onSelect={(date) => handleDateRangeChange('to', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Date Range */}
              {filters.dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, dateRange: null })}
                  className="w-full text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Date Range
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
