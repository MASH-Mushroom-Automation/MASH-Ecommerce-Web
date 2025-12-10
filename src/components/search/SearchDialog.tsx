"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, Tag, ArrowRight, Command } from "lucide-react";
import { sanityClient } from "@/lib/sanity/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  mainImage: string | null;
  category?: {
    name: string;
    slug: string;
  };
}

interface CategoryResult {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Quick actions for the search dialog
const QUICK_ACTIONS = [
  { label: "Fresh Mushrooms", action: "category", value: "fresh-mushrooms", icon: "🍄" },
  { label: "Dried Mushrooms", action: "category", value: "dried-mushrooms", icon: "🌿" },
  { label: "Growing Kits", action: "category", value: "growing-kits", icon: "🌱" },
  { label: "All Products", action: "page", value: "/shop", icon: "📦" },
];

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<SearchResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const debouncedQuery = useDebounce(query, 200);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setProducts([]);
      setCategories([]);
      setHighlightedIndex(0);
    }
  }, [open]);

  // Fetch search results
  useEffect(() => {
    async function search() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setProducts([]);
        setCategories([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = debouncedQuery.toLowerCase();
        
        const [productResults, categoryResults] = await Promise.all([
          sanityClient.fetch<SearchResult[]>(`
            *[_type == "product" && isAvailable == true && (
              lower(name) match "*${searchTerm}*" ||
              lower(description) match "*${searchTerm}*" ||
              "${searchTerm}" in productTags
            )] | order(isFeatured desc, name asc) [0...8] {
              _id,
              name,
              "slug": slug.current,
              price,
              "mainImage": coalesce(mainImage.asset->url, image.asset->url),
              category->{
                name,
                "slug": slug.current
              }
            }
          `),
          sanityClient.fetch<CategoryResult[]>(`
            *[_type == "category" && lower(name) match "*${searchTerm}*"] | order(name asc) [0...3] {
              _id,
              name,
              "slug": slug.current,
              "productCount": count(*[_type == "product" && references(^._id) && isAvailable == true])
            }
          `)
        ]);
        
        setProducts(productResults);
        setCategories(categoryResults);
        setHighlightedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [debouncedQuery]);

  // Handle navigation
  const handleNavigate = useCallback((url: string) => {
    onOpenChange(false);
    router.push(url);
  }, [onOpenChange, router]);

  // Calculate total items
  const totalItems = query.length >= 2 
    ? categories.length + products.length + 1 // +1 for "View all results"
    : QUICK_ACTIONS.length;

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      
      if (query.length >= 2) {
        if (highlightedIndex < categories.length) {
          const cat = categories[highlightedIndex];
          handleNavigate(`/shop?category=${cat.slug}`);
        } else if (highlightedIndex < categories.length + products.length) {
          const product = products[highlightedIndex - categories.length];
          handleNavigate(`/product/${product.slug}`);
        } else {
          // "View all results" option
          handleNavigate(`/shop?search=${encodeURIComponent(query)}`);
        }
      } else {
        // Quick actions
        const action = QUICK_ACTIONS[highlightedIndex];
        if (action.action === "category") {
          handleNavigate(`/shop?category=${action.value}`);
        } else {
          handleNavigate(action.value);
        }
      }
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }, [query, highlightedIndex, categories, products, totalItems, handleNavigate, onOpenChange]);

  const hasResults = query.length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search Products</DialogTitle>
        
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search products, categories..."
            className="flex-1 py-4 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {/* Quick Actions (when no query) */}
          {!hasResults && !isLoading && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                Quick Actions
              </div>
              {QUICK_ACTIONS.map((action, index) => (
                <button
                  key={action.value}
                  onClick={() => {
                    if (action.action === "category") {
                      handleNavigate(`/shop?category=${action.value}`);
                    } else {
                      handleNavigate(action.value);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                    highlightedIndex === index 
                      ? "bg-primary/10 text-foreground" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="flex-1 text-sm font-medium">{action.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          {hasResults && !isLoading && categories.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                Categories
              </div>
              {categories.map((category, index) => (
                <button
                  key={category._id}
                  onClick={() => handleNavigate(`/shop?category=${category.slug}`)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                    highlightedIndex === index 
                      ? "bg-primary/10" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{category.name}</div>
                    {category.productCount !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {hasResults && !isLoading && products.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                Products
              </div>
              {products.map((product, index) => {
                const itemIndex = categories.length + index;
                return (
                  <button
                    key={product._id}
                    onClick={() => handleNavigate(`/product/${product.slug}`)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                      highlightedIndex === itemIndex 
                        ? "bg-primary/10" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      {product.mainImage ? (
                        <Image
                          src={product.mainImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          🍄
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{product.name}</div>
                      {product.category && (
                        <div className="text-xs text-muted-foreground">{product.category.name}</div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      ₱{product.price.toLocaleString()}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* View All Results */}
          {hasResults && !isLoading && (products.length > 0 || categories.length > 0) && (
            <div className="p-2 border-t border-border">
              <button
                onClick={() => handleNavigate(`/shop?search=${encodeURIComponent(query)}`)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                  highlightedIndex === categories.length + products.length 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 hover:bg-muted text-foreground"
                )}
              >
                View all results for &ldquo;{query}&rdquo;
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* No Results */}
          {hasResults && !isLoading && products.length === 0 && categories.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2.5 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↵</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchDialog;
