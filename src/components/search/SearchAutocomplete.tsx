"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  History,
  TrendingUp,
  Clock,
  Loader2,
  Tag,
  Grid3X3,
} from "lucide-react";
import { sanityClient } from "@/lib/sanity/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

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
}

const TRENDING_SEARCHES = [
  "Oyster Mushrooms",
  "Growing Kit",
  "Lion's Mane",
  "Shiitake",
  "Organic",
];

const SEARCH_HISTORY_KEY = "mash_search_history";
const MAX_HISTORY_ITEMS = 5;

export function SearchAutocomplete({
  placeholder = "Search mushrooms, kits, dried...",
  className,
  onSearch,
  showRecent = true,
  showTrending = true,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<
    CategorySuggestion[]
  >([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  /* -------------------- Load recent searches -------------------- */
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

  /* -------------------- Fetch suggestions -------------------- */
  useEffect(() => {
    async function fetchSuggestions() {
      if (!hasTyped || debouncedQuery.length < 2) {
        setSuggestions([]);
        setCategorySuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = debouncedQuery.toLowerCase();

        const [products, categories] = await Promise.all([
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
              category->{ name, "slug": slug.current }
            }
          `),
          sanityClient.fetch<CategorySuggestion[]>(`
            *[_type == "category" && lower(name) match "*${searchTerm}*"] | order(name asc) [0...3] {
              _id,
              name,
              "slug": slug.current,
              "productCount": count(*[_type == "product" && references(^._id) && isAvailable == true])
            }
          `),
        ]);

        setSuggestions(products);
        setCategorySuggestions(categories);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
        setCategorySuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery, hasTyped]);

  /* -------------------- Helpers -------------------- */
  const saveToHistory = useCallback(
    (term: string) => {
      if (!term.trim()) return;
      const newHistory = [
        term,
        ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase()),
      ].slice(0, MAX_HISTORY_ITEMS);

      setRecentSearches(newHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    },
    [recentSearches],
  );

  const handleSearch = useCallback(
    (term: string) => {
      if (!term.trim()) return;

      saveToHistory(term);
      setIsOpen(false);
      setHasTyped(false);

      onSearch
        ? onSearch(term)
        : router.push(`/shop?search=${encodeURIComponent(term)}`);
    },
    [onSearch, router, saveToHistory],
  );

  /* -------------------- Outside click -------------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHasTyped(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalItems = suggestions.length + categorySuggestions.length;
  const showDropdown = isOpen && hasTyped;

  /* -------------------- Render -------------------- */
  // Helper to clear search history
  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setHighlightedIndex(-1);

            if (value.length > 0) {
              setHasTyped(true);
              setIsOpen(true);
            } else {
              setHasTyped(false);
              setIsOpen(false);
            }
          }}
          className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setHasTyped(false);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-40 mt-2 w-full bg-card border rounded-lg shadow-lg max-h-[70vh] overflow-y-auto">
          {/* Trending searches */}
          {showTrending && hasTyped && query.length < 2 && (
            <div className="py-2 border-t border-border">
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                <TrendingUp className="h-3 w-3" />
                Trending
              </div>

              <div className="flex flex-wrap gap-2 px-3 py-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      handleSearch(term);
                    }}
                    className="px-3 py-1.5 text-xs rounded-full border border-border hover:bg-muted/50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent searches */}
          {showRecent &&
            hasTyped &&
            query.length < 2 &&
            recentSearches.length > 0 && (
              <div className="py-2 border-b border-border">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Recent
                  </span>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>

                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      handleSearch(term);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-muted/50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}

          {/* Suggestions */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {!isLoading &&
            suggestions.map((p) => (
              <button
                key={p._id}
                onClick={() => handleSearch(p.name)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50"
              >
                <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                  <Image
                    src={p.mainImage || PLACEHOLDER_IMAGE}
                    alt={p.name}
                    width={40}
                    height={40}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ₱{p.price.toLocaleString()}
                  </div>
                </div>
              </button>
            ))}

          {/* Social Media Links - Always visible at bottom */}
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-3">Follow Us</p>
            <div className="flex items-center gap-4 px-3 pb-3">
              <a
                href="https://www.facebook.com/MASHMarketPH"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@MASH-UCC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary"
                aria-label="YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.116C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.386.57A2.994 2.994 0 0 0 .502 6.186C0 8.344 0 12 0 12s0 3.656.502 5.814a2.994 2.994 0 0 0 2.112 2.116C4.772 20.5 12 20.5 12 20.5s7.228 0 9.386-.57a2.994 2.994 0 0 0 2.112-2.116C24 15.656 24 12 24 12s0-3.656-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
