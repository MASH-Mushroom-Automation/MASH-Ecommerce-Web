"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SlidersHorizontal, Grid, List, Search, X, LayoutGrid, Rows3 } from "lucide-react";
import { useSanityProducts } from "@/hooks/useSanityProducts";
import { useSanityCategories } from "@/hooks/useSanityCategories";
import { ProductGridSkeleton } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProductFilters, TransformedProduct } from "@/types/sanity";

export default function ProductCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL search params
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSort = (searchParams.get("sort") as ProductFilters["sortBy"]) || "featured";
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 12000]);
  const [sort, setSort] = useState<ProductFilters["sortBy"]>(initialSort);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  // Quick view state
  const [quickViewProduct, setQuickViewProduct] = useState<TransformedProduct | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { addToCart } = useCart();

  // Quick view handlers
  const handleQuickView = useCallback((productId: string, products: TransformedProduct[]) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setQuickViewProduct(product);
      setIsQuickViewOpen(true);
    }
  }, []);

  const closeQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchQuery) {
      params.set("search", debouncedSearchQuery);
    }
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories[0]);
    }
    if (sort && sort !== "featured") {
      params.set("sort", sort);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/shop?${queryString}` : "/shop";
    
    // Update URL without triggering navigation
    window.history.replaceState(null, "", newUrl);
  }, [debouncedSearchQuery, selectedCategories, sort]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setPriceRange([0, 12000]);
    setSearchQuery("");
    setSort("featured");
  };

  // Check if any filters are active
  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    selectedTags.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < 12000 ||
    searchQuery.trim() !== "";

  // Popular tags for quick filtering
  const popularTags = [
    { label: "Fresh", value: "fresh" },
    { label: "Dried", value: "dried" },
    { label: "Growing Kit", value: "growing-kit" },
    { label: "Organic", value: "organic" },
    { label: "Beginner Friendly", value: "beginner-friendly" },
    { label: "Gourmet", value: "gourmet" },
    { label: "Medicinal", value: "medicinal" },
    { label: "High Protein", value: "high-fiber" },
  ];

  // Build filters for Sanity query
  const filters: ProductFilters = {
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy: sort,
    isAvailable: true,
    search: debouncedSearchQuery.trim() || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  };

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // Fetch products from Sanity CMS
  const { products: allProducts, loading, error } = useSanityProducts(filters);
  
  // Fetch categories from Sanity CMS
  const { categories: sanityCategories } = useSanityCategories();

  // Client-side pagination (showing first N products)
  const displayedProducts = allProducts.slice(0, itemsPerPage);
  const hasMoreProducts = allProducts.length > displayedProducts.length;

  // Keep full category objects for both slug (filtering) and name (display)
  // Filter out categories without valid slug
  const categories = sanityCategories.filter(
    (cat): cat is typeof cat & { slug: string; name: string } => 
      Boolean(cat.slug) && Boolean(cat.name)
  );

  // Toggle category by SLUG (used for filtering)
  const toggleCategory = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const handleLoadMore = () => {
    setItemsPerPage((prev) => prev + 12);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:px-6 lg:px-12 xl:px-16">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Left Sidebar - Filters (Desktop Only) */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-lg shadow-sm p-5 space-y-5 sticky top-4">
              {/* Filter Header with Clear Button */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="font-bold text-foreground text-lg">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                  Categories
                  {selectedCategories.length > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {/* All Categories Option */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="category-all"
                      checked={selectedCategories.length === 0}
                      onCheckedChange={() => setSelectedCategories([])}
                    />
                    <Label
                      htmlFor="category-all"
                      className={cn(
                        "text-sm cursor-pointer font-normal flex items-center justify-between w-full",
                        selectedCategories.length === 0 ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      All Products
                      <span className="text-xs text-muted-foreground">({allProducts.length})</span>
                    </Label>
                  </div>
                  {categories.map((category) => {
                    const categoryProductCount = allProducts.filter(p => p.category === category.name).length;
                    return (
                      <div key={category.slug} className="flex items-center space-x-3">
                        <Checkbox
                          id={`category-${category.slug}`}
                          checked={selectedCategories.includes(category.slug)}
                          onCheckedChange={() => toggleCategory(category.slug)}
                        />
                        <Label
                          htmlFor={`category-${category.slug}`}
                          className={cn(
                            "text-sm cursor-pointer font-normal flex items-center justify-between w-full",
                            selectedCategories.includes(category.slug) ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {category.name}
                          <span className="text-xs text-muted-foreground">({categoryProductCount})</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-border" />

              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-sm">
                  Price Range
                  {(priceRange[0] > 0 || priceRange[1] < 12000) && (
                    <span className="ml-2 text-xs text-primary font-normal">
                      (₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()})
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={12000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₱</span>
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full pl-7 pr-2 py-2 border border-border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={priceRange[0] || ""}
                        min={0}
                        max={priceRange[1]}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(Number(e.target.value) || 0, priceRange[1]));
                          setPriceRange([val, priceRange[1]]);
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground text-sm">to</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₱</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full pl-7 pr-2 py-2 border border-border rounded-md text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={priceRange[1] || ""}
                        min={priceRange[0]}
                        max={12000}
                        onChange={(e) => {
                          const val = Math.max(priceRange[0], Math.min(Number(e.target.value) || 12000, 12000));
                          setPriceRange([priceRange[0], val]);
                        }}
                      />
                    </div>
                  </div>
                  {(priceRange[0] > 0 || priceRange[1] < 12000) && (
                    <button
                      onClick={() => setPriceRange([0, 12000])}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      Reset price
                    </button>
                  )}
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-border" />

              {/* Product Tags Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                  Quick Tags
                  {selectedTags.length > 0 && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {selectedTags.length}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {popularTags.map((tag) => (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full border transition-all duration-200",
                        selectedTags.includes(tag.value)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-muted-foreground border-border hover:bg-muted/50 hover:border-primary/30"
                      )}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Clear tags
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search Bar */}
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products (e.g., oyster, shiitake, dried)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {debouncedSearchQuery && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Showing results for &ldquo;<span className="font-medium text-foreground">{debouncedSearchQuery}</span>&rdquo;
                  {allProducts.length === 0 && !loading && " - No products found"}
                </p>
              )}
              
              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
                  
                  {/* Category chips */}
                  {selectedCategories.map((catSlug) => {
                    const category = categories.find(c => c.slug === catSlug);
                    return (
                      <button
                        key={catSlug}
                        onClick={() => toggleCategory(catSlug)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 transition-colors group"
                      >
                        {category?.name || catSlug}
                        <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                  
                  {/* Tag chips */}
                  {selectedTags.map((tag) => {
                    const tagLabel = popularTags.find(t => t.value === tag)?.label || tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-600 text-xs rounded-full hover:bg-blue-500/20 transition-colors group"
                      >
                        {tagLabel}
                        <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                  
                  {/* Price range chip */}
                  {(priceRange[0] > 0 || priceRange[1] < 12000) && (
                    <button
                      onClick={() => setPriceRange([0, 12000])}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-600 text-xs rounded-full hover:bg-amber-500/20 transition-colors group"
                    >
                      ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                      <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                    </button>
                  )}
                  
                  {/* Clear all button */}
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-muted-foreground hover:text-destructive underline ml-1"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

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
                <SheetContent side="left" className="w-full sm:w-80 p-0 overflow-y-auto">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-5">
                      <SheetTitle className="text-lg font-bold text-foreground">
                        Filters
                      </SheetTitle>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-primary hover:text-primary/80 font-medium"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <SheetDescription className="sr-only">Filter products by category, price, and tags</SheetDescription>
                    <div className="space-y-5">
                      {/* Categories */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                          Categories
                          {selectedCategories.length > 0 && (
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              {selectedCategories.length}
                            </span>
                          )}
                        </h3>
                        <div className="space-y-2">
                          {/* All Categories Option */}
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="mobile-category-all"
                              checked={selectedCategories.length === 0}
                              onCheckedChange={() => setSelectedCategories([])}
                            />
                            <Label
                              htmlFor="mobile-category-all"
                              className={cn(
                                "text-sm cursor-pointer font-normal",
                                selectedCategories.length === 0 ? "text-foreground font-medium" : "text-muted-foreground"
                              )}
                            >
                              All Products
                            </Label>
                          </div>
                          {categories.map((category) => (
                            <div
                              key={category.slug}
                              className="flex items-center space-x-3"
                            >
                              <Checkbox
                                id={`mobile-category-${category.slug}`}
                                checked={selectedCategories.includes(category.slug)}
                                onCheckedChange={() => toggleCategory(category.slug)}
                              />
                              <Label
                                htmlFor={`mobile-category-${category.slug}`}
                                className={cn(
                                  "text-sm cursor-pointer font-normal",
                                  selectedCategories.includes(category.slug) ? "text-foreground font-medium" : "text-muted-foreground"
                                )}
                              >
                                {category.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="border-t border-border" />

                      {/* Price Range */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 text-sm">
                          Price Range
                        </h3>
                        <div className="space-y-4">
                          <Slider
                            min={0}
                            max={12000}
                            step={50}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="w-full"
                          />
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₱</span>
                              <input
                                type="number"
                                placeholder="Min"
                                className="w-full pl-7 pr-2 py-2 border border-border rounded-md text-sm bg-background"
                                value={priceRange[0] || ""}
                                min={0}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(Number(e.target.value) || 0, priceRange[1]));
                                  setPriceRange([val, priceRange[1]]);
                                }}
                              />
                            </div>
                            <span className="text-muted-foreground text-sm">to</span>
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₱</span>
                              <input
                                type="number"
                                placeholder="Max"
                                className="w-full pl-7 pr-2 py-2 border border-border rounded-md text-sm bg-background"
                                value={priceRange[1] || ""}
                                max={12000}
                                onChange={(e) => {
                                  const val = Math.max(priceRange[0], Math.min(Number(e.target.value) || 12000, 12000));
                                  setPriceRange([priceRange[0], val]);
                                }}
                              />
                            </div>
                          </div>
                          {(priceRange[0] > 0 || priceRange[1] < 12000) && (
                            <button
                              onClick={() => setPriceRange([0, 12000])}
                              className="text-xs text-muted-foreground hover:text-foreground underline"
                            >
                              Reset price
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="border-t border-border" />

                      {/* Product Tags Filter (Mobile) */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                          Quick Tags
                          {selectedTags.length > 0 && (
                            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              {selectedTags.length}
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {popularTags.map((tag) => (
                            <button
                              key={tag.value}
                              onClick={() => toggleTag(tag.value)}
                              className={cn(
                                "px-3 py-1.5 text-xs rounded-full border transition-all duration-200",
                                selectedTags.includes(tag.value)
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-background text-muted-foreground border-border hover:bg-muted/50"
                              )}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                        {selectedTags.length > 0 && (
                          <button
                            onClick={() => setSelectedTags([])}
                            className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            Clear tags
                          </button>
                        )}
                      </div>

                      <Button className="w-full bg-primary hover:bg-primary/90 mt-4">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort and Items Per Page Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                <Select value={sort} onValueChange={(value) => setSort(value as ProductFilters["sortBy"])}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-background border-border text-foreground hover:bg-muted/30">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="featured">⭐ Featured First</SelectItem>
                    <SelectItem value="newest">🆕 Newest Arrivals</SelectItem>
                    <SelectItem value="price-asc">💰 Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">💎 Price: High to Low</SelectItem>
                    <SelectItem value="name">🔤 Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-full sm:w-[140px] bg-background border-border text-foreground hover:bg-muted/30">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
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
            {loading ? (
              <ProductGridSkeleton count={itemsPerPage} />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">
                  Error loading products: {error.message}
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : displayedProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No Products Found"
                description="We couldn't find any products matching your filters. Try adjusting your search criteria."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSelectedCategories([]);
                  setPriceRange([0, 12000]);
                  setSort("featured");
                  setSearchQuery("");
                  setSelectedTags([]);
                }}
              />
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{displayedProducts.length}</span> of <span className="font-medium text-foreground">{allProducts.length}</span> products
                    {hasActiveFilters && <span className="ml-1">(filtered)</span>}
                  </p>
                  {hasMoreProducts && (
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Scroll down to load more
                    </p>
                  )}
                </div>
                
                {viewMode === "grid" ? (
                  <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        slug={product.slug}
                        name={product.name}
                        farm={product.grower?.name || product.category || "MASH"}
                        price={product.price}
                        comparePrice={product.compareAtPrice}
                        unit={product.unit || "250g"}
                        image={product.image}
                        images={product.images}
                        inStock={product.stock > 0}
                        stock={product.stock}
                        tags={product.productTags || []}
                        description={product.description}
                        onQuickView={(id) => handleQuickView(id, allProducts)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {displayedProducts.map((product) => (
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
                              {product.grower?.name || product.category || "MASH"}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-snug">
                              {product.description || "Fresh, locally-sourced mushrooms perfect for any culinary creation."}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg sm:text-xl font-bold text-primary">
                                ₱{product.price.toFixed(2)}
                              </span>
                              <span className="text-[11px] sm:text-xs text-muted-foreground">
                                per {product.unit || "250g"}
                              </span>
                            </div>
                            {product.stock === 0 ? (
                              <span className="text-[11px] sm:text-xs text-destructive font-medium">
                                Out of Stock
                              </span>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  // Build cart item - only include fields that have values
                                  const cartProduct: any = {
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    slug: product.slug,
                                    stock: product.stock,
                                  };
                                  
                                  // Only add optional fields if they exist
                                  if (product.grower?.name) {
                                    cartProduct.grower = product.grower.name;
                                  } else if (product.category) {
                                    cartProduct.grower = product.category;
                                  }
                                  
                                  if (product.unit) {
                                    cartProduct.unit = product.unit;
                                  }
                                  
                                  if (product.comparePrice && product.comparePrice > 0) {
                                    cartProduct.comparePrice = product.comparePrice;
                                  }
                                  
                                  addToCart(cartProduct, 1);
                                }}
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
                      disabled={loading}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2"
                    >
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewProduct?.id || null}
        productSlug={quickViewProduct?.slug || null}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </div>
  );
}
