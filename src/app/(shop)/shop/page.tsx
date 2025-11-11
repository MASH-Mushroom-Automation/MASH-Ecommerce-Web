"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Grid, List } from "lucide-react";
import {
  useProducts,
  useProductCategories,
  useProductGrowers,
} from "@/hooks/useProducts";
import {
  ProductGridSkeleton,
  LoadingSpinner,
} from "@/components/ui/loading-spinner";
import { ProductsListParams, ProductApiResponse } from "@/types/api";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export default function ProductCatalogPage() {
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGrowers, setSelectedGrowers] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 12000]);

  // Sort and pagination
  const [sort, setSort] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [accumulatedProducts, setAccumulatedProducts] = useState<
    ProductApiResponse[]
  >([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // API parameters
  const [apiParams, setApiParams] = useState<ProductsListParams>({
    page: 1,
    limit: itemsPerPage,
    minPrice: 0,
    maxPrice: 12000,
  });

  // Fetch data using custom hooks
  const { products, loading, error, pagination, setParams } =
    useProducts(apiParams);
  const { categories } = useProductCategories();
  const { growers } = useProductGrowers();
  const { addToCart } = useCart();

  // Debounce filter changes (5 seconds)
  const debouncedCategories = useDebounce(selectedCategories, 5000);
  const debouncedGrowers = useDebounce(selectedGrowers, 5000);
  const debouncedPriceRange = useDebounce(priceRange, 5000);
  const debouncedSort = useDebounce(sort, 5000);

  // Update API parameters when debounced filters change
  useEffect(() => {
    const newParams: ProductsListParams = {
      page: currentPage,
      limit: itemsPerPage,
      minPrice: debouncedPriceRange[0],
      maxPrice: debouncedPriceRange[1],
      category:
        debouncedCategories.length > 0 ? debouncedCategories[0] : undefined,
      grower: debouncedGrowers.length > 0 ? debouncedGrowers[0] : undefined,
    };

    // Handle sorting
    if (debouncedSort === "price-asc") {
      newParams.sortBy = "price";
      newParams.sortOrder = "asc";
    } else if (debouncedSort === "price-desc") {
      newParams.sortBy = "price";
      newParams.sortOrder = "desc";
    }

    setApiParams(newParams);
    setParams(newParams);
  }, [
    debouncedCategories,
    debouncedGrowers,
    debouncedPriceRange,
    debouncedSort,
    currentPage,
    itemsPerPage,
    setParams,
  ]);

  // Reset page and accumulated products when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedProducts([]);
  }, [selectedCategories, selectedGrowers, priceRange, sort, itemsPerPage]);

  // Accumulate products when new page loads
  useEffect(() => {
    if (products && products.length > 0) {
      if (currentPage === 1) {
        // Replace accumulated products when going back to page 1
        setAccumulatedProducts(products);
      } else {
        // Append new products when loading more
        setAccumulatedProducts((prev) => [...prev, ...products]);
      }
      setIsLoadingMore(false);
    }
  }, [products, currentPage]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setCurrentPage((prev) => prev + 1);
  };

  const hasMoreProducts = pagination && currentPage < pagination.totalPages;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const toggleGrower = (grower: string) => {
    setSelectedGrowers((prev) =>
      prev.includes(grower)
        ? prev.filter((g) => g !== grower)
        : [...prev, grower]
    );
    setCurrentPage(1);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:px-6 lg:px-12 xl:px-16">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Left Sidebar - Filters (Desktop Only) */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-foreground mb-4 text-base">
                  Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm text-muted-foreground cursor-pointer font-normal"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-4 text-base">
                  Grower
                </h3>
                <div className="space-y-3">
                  {growers.map((grower) => (
                    <div key={grower} className="flex items-center space-x-3">
                      <Checkbox
                        id={`grower-${grower}`}
                        checked={selectedGrowers.includes(grower)}
                        onCheckedChange={() => toggleGrower(grower)}
                      />
                      <Label
                        htmlFor={`grower-${grower}`}
                        className="text-sm text-muted-foreground cursor-pointer font-normal leading-tight"
                      >
                        {grower}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-4 text-base">
                  Price
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="From"
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="To"
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                    />
                  </div>
                  <Slider
                    min={0}
                    max={12000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₱{priceRange[0]}</span>
                    <span>₱{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with Sort and Mobile Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden w-full sm:w-auto"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80 p-0">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-6">
                      Filters
                    </h2>
                    <div className="space-y-6">
                      {/* Categories */}
                      <div>
                        <h3 className="font-bold text-foreground mb-4 text-base">
                          Categories
                        </h3>
                        <div className="space-y-3">
                          {categories.map((category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-3"
                            >
                              <Checkbox
                                id={`mobile-category-${category}`}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={() => toggleCategory(category)}
                              />
                              <Label
                                htmlFor={`mobile-category-${category}`}
                                className="text-sm text-muted-foreground cursor-pointer font-normal"
                              >
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Grower */}
                      <div>
                        <h3 className="font-bold text-foreground mb-4 text-base">
                          Grower
                        </h3>
                        <div className="space-y-3">
                          {growers.map((grower) => (
                            <div
                              key={grower}
                              className="flex items-center space-x-3"
                            >
                              <Checkbox
                                id={`mobile-grower-${grower}`}
                                checked={selectedGrowers.includes(grower)}
                                onCheckedChange={() => toggleGrower(grower)}
                              />
                              <Label
                                htmlFor={`mobile-grower-${grower}`}
                                className="text-sm text-muted-foreground cursor-pointer font-normal leading-tight"
                              >
                                {grower}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div>
                        <h3 className="font-bold text-foreground mb-4 text-base">
                          Price
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <input
                              type="number"
                              placeholder="From"
                              className="w-full px-3 py-2 border border-border rounded-md text-sm"
                              value={priceRange[0]}
                              onChange={(e) =>
                                setPriceRange([
                                  Number(e.target.value),
                                  priceRange[1],
                                ])
                              }
                            />
                            <span className="text-muted-foreground">-</span>
                            <input
                              type="number"
                              placeholder="To"
                              className="w-full px-3 py-2 border border-border rounded-md text-sm"
                              value={priceRange[1]}
                              onChange={(e) =>
                                setPriceRange([
                                  priceRange[0],
                                  Number(e.target.value),
                                ])
                              }
                            />
                          </div>
                          <Slider
                            min={0}
                            max={12000}
                            step={10}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>₱{priceRange[0]}</span>
                            <span>₱{priceRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort and Items Per Page Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-card">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-full sm:w-[140px] bg-card">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                    <SelectItem value="96">96 per page</SelectItem>
                  </SelectContent>
                </Select>
                {/* View Mode Toggle - Right Side */}
                <div
                  className="hidden sm:flex gap-2 ml-auto"
                  role="group"
                  aria-label="Toggle product view"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "transition-all duration-200 active:scale-95",
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                        : "bg-card hover:bg-muted/30 border-border"
                    )}
                    aria-pressed={viewMode === "list"}
                    aria-label="Switch to list view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "transition-all duration-200 active:scale-95",
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                        : "bg-card hover:bg-muted/30 border-border"
                    )}
                    aria-pressed={viewMode === "grid"}
                    aria-label="Switch to grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading && currentPage === 1 ? (
              <ProductGridSkeleton count={itemsPerPage} />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">
                  Error loading products: {error}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : accumulatedProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Products Found"
                description="We couldn't find any products matching your filters. Try adjusting your search criteria."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSelectedCategories([]);
                  setSelectedGrowers([]);
                  setPriceRange([0, 12000]);
                  setSort("featured");
                }}
              />
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                    {accumulatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        farm={product.grower}
                        price={product.price}
                        unit={product.weight}
                        image={product.image}
                        inStock={product.inStock !== false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {accumulatedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 flex flex-col md:flex-row gap-3"
                      >
                        <div className="relative w-full md:w-28 h-28 sm:w-32 sm:h-32 bg-muted/30 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 200px"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between gap-2.5">
                          <div>
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                              {product.name}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mb-1">
                              by {product.grower}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-snug">
                              Fresh, locally-sourced mushrooms perfect for any
                              culinary creation.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg sm:text-xl font-bold text-primary">
                                ₱{product.price.toFixed(2)}
                              </span>
                              <span className="text-[11px] sm:text-xs text-muted-foreground">
                                per {product.weight}
                              </span>
                            </div>
                            {product.inStock === false ? (
                              <span className="text-[11px] sm:text-xs text-destructive font-medium">
                                Out of Stock
                              </span>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  addToCart(product.id, product.price, 1)
                                }
                                className="w-full sm:w-auto min-h-[36px]"
                              >
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load More Button */}
                {hasMoreProducts && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2"
                    >
                      {isLoadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
