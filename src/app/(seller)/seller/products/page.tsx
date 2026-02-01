"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter as FilterIcon, SlidersHorizontal } from "lucide-react";
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
import { useProductSearch } from "@/hooks/useProductSearch";
import { useFilterPresets } from "@/hooks/useFilterPresets";

// Sanity Product Search
import { getFilterOptions, type FilterOptions } from "@/lib/sanity/product-search";
import { DEFAULT_FILTERS } from "@/types/product-filters";

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
  const [GridComponent, setGridComponent] = useState<any>(null);

  // Dynamic import react-window (client-side only)
  useEffect(() => {
    import('react-window').then((mod) => {
      setGridComponent(() => mod.FixedSizeGrid);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate columns based on screen width (Tailwind breakpoints)
  const columnCount = windowWidth >= 1280 ? 3 : windowWidth >= 640 ? 2 : 1;
  const columnWidth = Math.floor(windowWidth / columnCount) - 24; // Account for gap
  const rowHeight = 400; // Approximate card height
  const rowCount = Math.ceil(products.length / columnCount);

  if (!GridComponent) {
    return <LoadingSpinner size="md" />;
  }

  return (
    <GridComponent
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={Math.min(rowCount * rowHeight, 2000)} // Max 2000px height
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={windowWidth - 348} // Account for sidebar (300px) + gaps
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
    </GridComponent>
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

  // Phase 3: React Query product search with caching
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductSearch(filters, 1, 50);

  // Phase 3: Filter presets with localStorage
  const { presets, savePreset, loadPreset, deletePreset, presetExists } = useFilterPresets();

  // Filter options from Sanity (categories, price ranges, etc.)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    stockStatuses: ['in-stock', 'out-of-stock', 'low-stock'],
    productStatuses: ['published', 'draft', 'archived'],
    totalProducts: 0,
  });

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
        placeholder="Search products by name, SKU, or description..."
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
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Desktop FilterPanel (Phase 2 Component - Lazy Loaded) */}
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

        {/* Main Content Area */}
        <main>
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

          {/* Results Summary */}
          <div className="mb-4">
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
  product: any; // SanityProduct from product-search.ts
}

const ProductCard = React.memo<ProductCardProps>(({ product }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative h-48 bg-muted">
          {product.mainImage ? (
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
          {product.isOnPromo && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              {product.promoType === 'percentage'
                ? `-${product.promoPercentage}%`
                : `₱${product.promoPrice}`}
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            {product.sku && (
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            )}
          </div>

          {/* Price */}
          <div>
            {product.isOnPromo && product.originalPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  ₱{product.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ₱{product.originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary">
                ₱{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock & Status */}
          <div className="flex items-center justify-between">
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
            <span className="text-sm text-muted-foreground">
              {product.stockQuantity || 0} units
            </span>
          </div>

          {/* Status */}
          {product.status && product.status !== 'published' && (
            <Badge variant="outline">{product.status}</Badge>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/seller/products/edit/${product._id}`}>
                Edit
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/shop/products/${product.slug.current}`}>
                View
              </Link>
            </Button>
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
