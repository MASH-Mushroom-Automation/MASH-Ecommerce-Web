"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  SlidersHorizontal, 
  Grid, 
  List, 
  Search, 
  X, 
  ChevronLeft,
  ArrowUpDown,
  Package
} from "lucide-react";
import { useSanityProducts } from "@/hooks/useSanityProducts";
import { useSanityCategory, useSanityCategories } from "@/hooks/useSanityCategories";
import { ProductGridSkeleton } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import type { ProductFilters } from "@/types/sanity";

/**
 * Category Detail Page
 * 
 * Displays products filtered by a specific category.
 * Features:
 * - Category hero header with image
 * - Product grid with filters
 * - Price range slider
 * - Tag filtering
 * - Search within category
 * - Sort options
 * - Responsive design with mobile filter drawer
 */
export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 12000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  // Fetch category details
  const { category, loading: categoryLoading, error: categoryError } = useSanityCategory(slug);
  
  // Fetch all categories for sidebar navigation
  const { categories: allCategories } = useSanityCategories();

  // Build filters for Sanity query - filter by this category
  const filters: ProductFilters = {
    category: slug,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy: sort,
    isAvailable: true,
    search: searchQuery.trim() || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  };

  // Fetch products filtered by this category
  const { products: allProducts, loading: productsLoading, error: productsError } = useSanityProducts(filters);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // Client-side pagination
  const displayedProducts = allProducts.slice(0, itemsPerPage);
  const hasMoreProducts = allProducts.length > displayedProducts.length;

  const handleLoadMore = () => {
    setItemsPerPage((prev) => prev + 12);
  };

  // Get other categories (excluding current)
  const otherCategories = allCategories.filter(cat => cat.slug !== slug);

  // Loading state
  if (categoryLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header skeleton */}
          <div className="h-48 bg-muted/50 rounded-lg animate-pulse mb-8" />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Category not found
  if (!category && !categoryLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState
            icon={Package}
            title="Category Not Found"
            description="The category you're looking for doesn't exist or has been removed."
            action={{
              label: "Browse All Products",
              onClick: () => router.push("/shop"),
            }}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (categoryError || productsError) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState
            icon={Package}
            title="Something went wrong"
            description="We couldn't load the category. Please try again later."
            action={{
              label: "Go Back",
              onClick: () => router.back(),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Category Hero Header */}
      <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category?.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Category Image */}
            {category?.image && (
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {allProducts.length} {allProducts.length === 1 ? "product" : "products"} available
              </p>
            </div>

            {/* Back to Shop */}
            <Button
              variant="outline"
              onClick={() => router.push("/shop")}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              All Products
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Filters (Desktop Only) */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-lg shadow-sm p-6 space-y-6 sticky top-24">
              {/* Other Categories */}
              {otherCategories.length > 0 && (
                <div>
                  <h3 className="font-bold text-foreground mb-4 text-base">
                    Other Categories
                  </h3>
                  <div className="space-y-2">
                    {otherCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5"
                      >
                        <span>{cat.name}</span>
                        {cat.productCount !== undefined && (
                          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                            {cat.productCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div>
                <h3 className="font-bold text-foreground mb-4 text-base">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                      <input
                        type="number"
                        placeholder="₱0"
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                      />
                    </div>
                    <span className="text-muted-foreground mt-5">—</span>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                      <input
                        type="number"
                        placeholder="₱12,000"
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                      />
                    </div>
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
                    <span>₱{priceRange[0].toLocaleString()}</span>
                    <span>₱{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
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

              {/* Reset Filters */}
              {(priceRange[0] > 0 || priceRange[1] < 12000 || selectedTags.length > 0 || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setPriceRange([0, 12000]);
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
                >
                  Reset All Filters
                </Button>
              )}
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
                  placeholder={`Search in ${category?.name}...`}
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

            {/* Toolbar: Sort, View Mode, Mobile Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden w-full sm:w-auto"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {(selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < 12000) && (
                      <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                        {selectedTags.length + (priceRange[0] > 0 || priceRange[1] < 12000 ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
                  <h2 className="text-lg font-bold mb-6">Filters</h2>
                  
                  {/* Mobile Categories */}
                  {otherCategories.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-foreground mb-3">
                        Other Categories
                      </h3>
                      <div className="space-y-2">
                        {otherCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5"
                          >
                            <span>{cat.name}</span>
                            {cat.productCount !== undefined && (
                              <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                                {cat.productCount}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Price Range */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">
                      Price Range
                    </h3>
                    <div className="space-y-4">
                      <Slider
                        min={0}
                        max={12000}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₱{priceRange[0].toLocaleString()}</span>
                        <span>₱{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Tags */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">
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
                  </div>

                  {/* Mobile Reset */}
                  {(priceRange[0] > 0 || priceRange[1] < 12000 || selectedTags.length > 0) && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setPriceRange([0, 12000]);
                        setSelectedTags([]);
                      }}
                    >
                      Reset All Filters
                    </Button>
                  )}
                </SheetContent>
              </Sheet>

              {/* Sort and View Mode */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as ProductFilters["sortBy"])}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle (Desktop) */}
                <div className="hidden sm:flex border rounded-md">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "grid"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 transition-colors",
                      viewMode === "list"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < 12000) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                  >
                    {popularTags.find((t) => t.value === tag)?.label || tag}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 12000) && (
                  <span className="px-2 py-1 text-xs bg-muted rounded-full">
                    ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {productsLoading ? (
              <ProductGridSkeleton count={8} />
            ) : displayedProducts.length > 0 ? (
              <>
                <div
                  className={cn(
                    "grid gap-4 md:gap-6",
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  )}
                >
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        description: product.description || "",
                        price: product.price,
                        compareAtPrice: product.compareAtPrice,
                        image: product.image || "/placeholder-product.jpg",
                        images: product.images || [],
                        category: product.category,
                        stock: product.stock,
                        sku: product.sku,
                        weight: product.weight,
                        unit: product.unit,
                        isAvailable: product.isAvailable,
                        isFeatured: product.isFeatured,
                        isPromo: product.isPromo,
                        productTags: product.productTags || [],
                      }}
                      onAddToCart={() => {
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image || "/placeholder-product.jpg",
                          quantity: 1,
                        });
                      }}
                      showQuickView
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMoreProducts && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      className="min-w-[200px]"
                    >
                      Load More Products
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing {displayedProducts.length} of {allProducts.length} products
                    </p>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Package}
                title="No Products Found"
                description={
                  searchQuery
                    ? `No products matching "${searchQuery}" in ${category?.name}.`
                    : `No products available in ${category?.name} with the selected filters.`
                }
                action={{
                  label: "Clear Filters",
                  onClick: () => {
                    setPriceRange([0, 12000]);
                    setSelectedTags([]);
                    setSearchQuery("");
                  },
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
