"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, History, TrendingUp, Clock, Loader2, Tag, Grid3X3 } from "lucide-react";
import { sanityClient } from "@/lib/sanity/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchSuggestion {
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

interface CategorySuggestion {
  _id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  showRecent?: boolean;
  showTrending?: boolean;
  autoFocus?: boolean;
}

// Trending searches (could be fetched from Sanity in future)
const TRENDING_SEARCHES = [
  "Oyster Mushrooms",
  "Growing Kit",
  "Lion's Mane",
  "Shiitake",
  "Organic",
];

// Local storage key for search history
const SEARCH_HISTORY_KEY = "mash_search_history";
const MAX_HISTORY_ITEMS = 5;

export function SearchAutocomplete({
  placeholder = "Search mushrooms, kits, dried...",
  className,
  onSearch,
  showRecent = true,
  showTrending = true,
  autoFocus = false,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  // Auto focus on mount if enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && showRecent) {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, [showRecent]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        setCategorySuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = debouncedQuery.toLowerCase();
        
        // Fetch products and categories in parallel
        const [products, categories] = await Promise.all([
          // Product search
          sanityClient.fetch<SearchSuggestion[]>(`
            *[_type == "product" && isAvailable == true && (
              lower(name) match "*${searchTerm}*" ||
              lower(description) match "*${searchTerm}*" ||
              "${searchTerm}" in productTags
            )] | order(isFeatured desc, name asc) [0...6] {
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
          // Category search
          sanityClient.fetch<CategorySuggestion[]>(`
            *[_type == "category" && lower(name) match "*${searchTerm}*"] | order(name asc) [0...3] {
              _id,
              name,
              "slug": slug.current,
              "productCount": count(*[_type == "product" && references(^._id) && isAvailable == true])
            }
          `)
        ]);
        
        setSuggestions(products);
        setCategorySuggestions(categories);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
        setCategorySuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  // Save search to history
  const saveToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim() || typeof window === "undefined") return;

    const newHistory = [
      searchTerm.trim(),
      ...recentSearches.filter((s) => s.toLowerCase() !== searchTerm.toLowerCase()),
    ].slice(0, MAX_HISTORY_ITEMS);

    setRecentSearches(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  }, [recentSearches]);

  // Clear search history
  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // Handle search submission
  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    saveToHistory(searchTerm);
    setIsOpen(false);

    if (onSearch) {
      onSearch(searchTerm);
    } else {
      // Navigate to shop page with search query
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  }, [onSearch, router, saveToHistory]);

  // Handle product click
  const handleProductClick = useCallback((slug: string, name: string) => {
    saveToHistory(name);
    setIsOpen(false);
    router.push(`/product/${slug}`);
  }, [router, saveToHistory]);

  // Handle category click
  const handleCategoryClick = useCallback((slug: string, name: string) => {
    saveToHistory(name);
    setIsOpen(false);
    router.push(`/shop?category=${slug}`);
  }, [router, saveToHistory]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate total items for keyboard navigation
  const totalItems = suggestions.length + categorySuggestions.length;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        // Navigate to highlighted item
        if (highlightedIndex < categorySuggestions.length) {
          const cat = categorySuggestions[highlightedIndex];
          handleCategoryClick(cat.slug, cat.name);
        } else {
          const productIndex = highlightedIndex - categorySuggestions.length;
          const product = suggestions[productIndex];
          handleProductClick(product.slug, product.name);
        }
      } else if (query.trim()) {
        handleSearch(query);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < totalItems - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    }
  };

  const showDropdown = isOpen && (
    query.length >= 2 || 
    (showRecent && recentSearches.length > 0) ||
    showTrending
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setCategorySuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto">
          {/* Loading State */}
          {isLoading && query.length >= 2 && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {/* Category Suggestions */}
          {!isLoading && categorySuggestions.length > 0 && (
            <div className="py-2 border-b border-border">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Grid3X3 className="h-3 w-3" />
                Categories
              </div>
              {categorySuggestions.map((category, index) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category.slug, category.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 transition-colors text-left",
                    highlightedIndex === index 
                      ? "bg-primary/10" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {category.name}
                    </div>
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

          {/* Product Suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                Products
              </div>
              {suggestions.map((product, index) => {
                const itemIndex = categorySuggestions.length + index;
                return (
                  <button
                    key={product._id}
                    onClick={() => handleProductClick(product.slug, product.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 transition-colors",
                      highlightedIndex === itemIndex 
                        ? "bg-primary/10" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    {/* Product Image */}
                    <div className="w-10 h-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                      {product.mainImage ? (
                        <Image
                          src={product.mainImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          🍄
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-foreground">
                        {product.name}
                      </div>
                      {product.category && (
                        <div className="text-xs text-muted-foreground">
                          {product.category.name}
                        </div>
                      )}
                    </div>
                    {/* Price */}
                    <div className="text-sm font-semibold text-primary">
                      ₱{product.price.toLocaleString()}
                    </div>
                  </button>
                );
              })}
              {/* View all results */}
              {query.length >= 2 && (
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full px-3 py-2.5 text-sm text-primary hover:bg-muted/50 transition-colors text-center border-t border-border mt-1"
                >
                  View all results for &ldquo;{query}&rdquo;
                </button>
              )}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && categorySuggestions.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No products found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a different search term
              </p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Search anyway →
              </button>
            </div>
          )}

          {/* Recent Searches */}
          {showRecent && recentSearches.length > 0 && query.length < 2 && (
            <div className="py-2 border-b border-border">
              <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase">
                  <History className="h-3 w-3" />
                  Recent Searches
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {showTrending && query.length < 2 && (
            <div className="py-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                <TrendingUp className="h-3 w-3" />
                Trending
              </div>
              <div className="flex flex-wrap gap-2 px-3 py-2">
                {TRENDING_SEARCHES.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(term);
                      handleSearch(term);
                    }}
                    className="px-3 py-1.5 text-xs rounded-full border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
