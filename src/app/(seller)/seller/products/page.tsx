"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, SlidersHorizontal, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Phase 2 Components (Search & Filter UI)
import { SearchBar } from "@/components/seller/products/SearchBar";
import { FilterChips } from "@/components/seller/products/FilterChips";

// Lazy load FilterPanel for performance (reduces initial bundle size)
const FilterPanel = lazy(() => import("@/components/seller/products/FilterPanel").then(mod => ({ default: mod.FilterPanel })));

// Phase 3 Hooks (State Management)
import { useProductFilters } from "@/hooks/useProductFilters";
import { useSellerProductSearch } from "@/hooks/useSellerProductSearch";

// Filter options
import { getFilterOptions } from "@/lib/sanity/product-search";
import type { FilterOptions } from "@/types/product-filters";

// Disable static generation for this page (required for nuqs)
export const dynamic = 'force-dynamic';

// Virtualized Product Grid for large lists (>100 products)
interface VirtualizedProductGridProps {
  products: any[];
}

function VirtualizedProductGrid({ products }: VirtualizedProductGridProps) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [GridComponent, setGridComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import('react-window').then((mod) => {
      setGridComponent(() => mod.Grid);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columnCount = windowWidth >= 1280 ? 3 : windowWidth >= 640 ? 2 : 1;
  const columnWidth = Math.floor(windowWidth / columnCount) - 24;
  const rowHeight = 400;
  const rowCount = Math.ceil(products.length / columnCount);

  if (!GridComponent) {
    return <LoadingSpinner size="md" />;
  }

  const Grid = GridComponent;

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={Math.min(rowCount * rowHeight, 2000)}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={windowWidth - 348}
      itemData={{ products, columnCount }}
    >
      {({ columnIndex, rowIndex, style, data }: any) => {
        const index = rowIndex * data.columnCount + columnIndex;
        const product = data.products[index];

        if (!product) return null;

        return (
          <div style={{ ...style, padding: '8px' }}>
            <ProductCard product={product} />
          </div>
        );
      }}
    </Grid>
  );
}

function SellerProductsContent() {
  // Phase 3: Filter state management with URL sync
  const {
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    activeFilterCount,
    isFiltering,
  } = useProductFilters();

  // Fetch only this seller's products via the secure API route
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    refetch,
  } = useSellerProductSearch(filters, 1, 50);

  // Filter options from Sanity (categories, price ranges, etc.)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 10000 },
    stockCounts: { inStock: 0, outOfStock: 0, lowStock: 0 },
    statusCounts: { published: 0, draft: 0, archived: 0 },
  });

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Desktop filter panel toggle state
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);

  // Load filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("[SellerProducts] Failed to load filter options:", error);
      }
    };

    loadFilterOptions();
  }, []);

  // Handle search change (debounced via SearchBar)
  const handleSearchChange = (value: string) => {
    updateFilter('search', value);
  };

  // Handle filter changes from FilterPanel
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  // Handle remove filter from FilterChips
  const handleRemoveFilter = (filterKey: keyof typeof filters, value?: any) => {
    removeFilter(filterKey, value);
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    clearFilters();
  };

  // Get products from search results
  const products = searchResults?.products || [];
  const hasProducts = products.length > 0;
  const totalProducts = searchResults?.total || 0;
  const hasMore = searchResults?.hasMore || false;

  // Loading state skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse" data-testid="skeleton">
          <div className="flex gap-4">
            <div className="h-24 w-24 bg-muted rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="text-muted-foreground mb-4">
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm mt-2">
          {isFiltering
            ? "Try adjusting your filters or search terms"
            : "Add your first product to get started"}
        </p>
      </div>
      {!isFiltering && (
        <Link href="/seller/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add New Product
          </Button>
        </Link>
      )}
      {isFiltering && (
        <Button variant="outline" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading products: {error?.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1 sm:text-base text-sm">
            Search, filter, and manage your product catalog
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add New Product
          </Button>
        </Link>
      </div>

      {/* SearchBar (Phase 2 Component) */}
      <SearchBar
        value={filters.search}
        onChange={handleSearchChange}
        placeholder="Search products by name or description..."
        isLoading={isLoading}
      />

      {/* Filter Chips (Phase 2 Component) */}
      {activeFilterCount > 0 && (
        <FilterChips
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
          filterOptions={filterOptions}
        />
      )}

      {/* Layout: Desktop Sidebar + Mobile Drawer */}
      <div className={`grid grid-cols-1 ${desktopFilterOpen ? 'lg:grid-cols-[300px_1fr]' : ''} gap-6`}>
        {/* Desktop FilterPanel (Phase 2 Component - Lazy Loaded) */}
        {desktopFilterOpen && (
          <aside className="hidden lg:block">
            <div className="sticky top-4">
              <Suspense fallback={<LoadingSpinner size="md" />}>
                <FilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  filterOptions={filterOptions}
                  showClearButton={activeFilterCount > 0}
                />
              </Suspense>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main>
          {/* Desktop: Results Summary + Filter Toggle Button */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  Showing {products.length} of {totalProducts} products
                  {hasMore && " (load more available)"}
                </>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDesktopFilterOpen(!desktopFilterOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {desktopFilterOpen ? 'Hide' : 'Show'} Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Dialog open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filter Products</DialogTitle>
                </DialogHeader>
                <Suspense fallback={<LoadingSpinner size="sm" />}>
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                      handleFiltersChange(newFilters);
                      setMobileFilterOpen(false);
                    }}
                    filterOptions={filterOptions}
                    showClearButton={activeFilterCount > 0}
                  />
                </Suspense>
                <div className="flex gap-2 pt-4 border-t">
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button className="flex-1">Apply Filters</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile Results Summary */}
          <div className="lg:hidden mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  Showing {products.length} of {totalProducts} products
                  {hasMore && " (load more available)"}
                </>
              )}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && <LoadingSkeleton />}

          {/* Products Grid - Virtualized for >100 products */}
          {!isLoading && hasProducts && (
            <>
              {products.length <= 100 ? (
                // Standard grid for smaller lists
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                // Virtualized grid for large lists (>100 products)
                <div data-testid="virtualized-product-grid">
                  <VirtualizedProductGrid products={products} />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && !hasProducts && <EmptyState />}
        </main>
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: any;
}

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

const ProductCard = React.memo<ProductCardProps>(({ product }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative h-48 bg-muted">
          <Image
            src={product.mainImage || PLACEHOLDER_IMAGE}
            alt={product.name || 'Product Image'}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
            }}
          />
          {product.isOnPromo && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              {product.promoType === 'percentage'
                ? `-${product.promoPercentage}%`
                : `₱${product.promoPrice}`}
            </Badge>
          )}
          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8 bg-white/90 hover:bg-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href={`/seller/products/edit/${product._id}`} className="cursor-pointer" role="menuitem" aria-label="Edit">
                  Edit Product
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/product/${product.slug?.current ?? product._id}`} className="cursor-pointer" role="menuitem" aria-label="View">
                  View Product
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold">
              {product.name}
            </h3>
            {product.sku && (
              <p className="pt-2 text-sm text-muted-foreground">SKU: {product.sku}</p>
            )}
          </div>

          {/* Price */}
          <div>
            {product.isOnPromo && product.originalPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  ₱{(product.price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ₱{(product.originalPrice ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">
                ₱{(product.price ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {/* Stock & Status */}
          <div className="flex gap-2 items-center flex-wrap">
            <Badge
              variant={
                product.stockStatus === 'in-stock'
                  ? 'default'
                  : product.stockStatus === 'low-stock'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {product.stockStatus === 'in-stock' && 'In Stock'}
              {product.stockStatus === 'low-stock' && 'Low Stock'}
              {product.stockStatus === 'out-of-stock' && 'Out of Stock'}
            </Badge>
            {product.status && (
              <Badge
                variant={product.status === 'published' ? 'default' : 'outline'}
                className={product.status === 'published' ? 'bg-green-600' : ''}
              >
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {product.stockQuantity || 0} units
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

// Main export with Suspense boundary for nuqs
export default function SellerProducts() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SellerProductsContent />
    </Suspense>
  );
}
