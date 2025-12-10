"use client";

import { useState } from "react";
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SlidersHorizontal, Grid, List, Search, X } from "lucide-react";
import { useSanityProducts } from "@/hooks/useSanityProducts";
import { useSanityCategories } from "@/hooks/useSanityCategories";
import { ProductGridSkeleton } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import type { ProductFilters } from "@/types/sanity";

export default function ProductCatalogPage() {
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 12000]);
  const [sort, setSort] = useState<ProductFilters["sortBy"]>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");

  const { addToCart } = useCart();

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
    search: searchQuery.trim() || undefined,
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
            <div className="bg-card rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-bold text-foreground mb-4 text-base">
                  Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.slug} className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${category.slug}`}
                        checked={selectedCategories.includes(category.slug)}
                        onCheckedChange={() => toggleCategory(category.slug)}
                      />
                      <Label
                        htmlFor={`category-${category.slug}`}
                        className="text-sm text-muted-foreground cursor-pointer font-normal"
                      >
                        {category.name}
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

              {/* Product Tags Filter */}
              <div>
                <h3 className="font-bold text-foreground mb-4 text-base">
                  Filter by Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag.value}
                      onClick={() => toggleTag(tag.value)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full border transition-colors",
                        selectedTags.includes(tag.value)
                          ? "bg-primary text-primary-foreground border-primary"
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
              {searchQuery && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Showing results for &ldquo;<span className="font-medium text-foreground">{searchQuery}</span>&rdquo;
                  {allProducts.length === 0 && " - No products found"}
                </p>
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
                <SheetContent side="left" className="w-full sm:w-80 p-0">
                  <div className="p-6">
                    <SheetTitle className="text-xl font-bold text-foreground mb-6">
                      Filters
                    </SheetTitle>
                    <SheetDescription className="sr-only">Filter products by category, price, and tags</SheetDescription>
                    <div className="space-y-6">
                      {/* Categories */}
                      <div>
                        <h3 className="font-bold text-foreground mb-4 text-base">
                          Categories
                        </h3>
                        <div className="space-y-3">
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
                                className="text-sm text-muted-foreground cursor-pointer font-normal"
                              >
                                {category.name}
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

                      {/* Product Tags Filter (Mobile) */}
                      <div>
                        <h3 className="font-bold text-foreground mb-4 text-base">
                          Filter by Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {popularTags.map((tag) => (
                            <button
                              key={tag.value}
                              onClick={() => toggleTag(tag.value)}
                              className={cn(
                                "px-3 py-1.5 text-xs rounded-full border transition-colors",
                                selectedTags.includes(tag.value)
                                  ? "bg-primary text-primary-foreground border-primary"
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

                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort and Items Per Page Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                <Select value={sort} onValueChange={(value) => setSort(value as ProductFilters["sortBy"])}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground hover:bg-muted/30">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
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
                }}
              />
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        slug={product.slug} // Pass slug for SEO-friendly URLs
                        name={product.name}
                        farm={product.category || "MASH"}
                        price={product.price}
                        comparePrice={product.compareAtPrice}
                        unit={product.unit || "250g"}
                        image={product.image}
                        inStock={product.stock > 0}
                        stock={product.stock}
                        tags={product.productTags || []}
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
                              {product.category || "MASH"}
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
                                onClick={() =>
                                  addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image,
                                    slug: product.slug,
                                    stock: product.stock,
                                    grower: product.category,
                                    unit: product.unit,
                                  }, 1)
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
    </div>
  );
}
