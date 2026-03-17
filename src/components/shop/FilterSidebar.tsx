"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CategoryItem {
  slug: string;
  name: string;
}

interface TagItem {
  label: string;
  value: string;
}

interface FilterSidebarProps {
  categories: CategoryItem[];
  selectedCategories: string[];
  toggleCategory: (slug: string) => void;
  clearCategories: () => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  totalCount: number;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  popularTags: TagItem[];
  /** 'desktop' renders inline with product counts; 'mobile' renders without counts */
  variant: "desktop" | "mobile";
  /** Only used in desktop variant for per-category product counts */
  getCategoryCount?: (categoryName: string) => number;
}

/**
 * Shared filter sidebar content for the shop page.
 * Used in both desktop aside and mobile Sheet.
 */
export function FilterSidebar({
  categories,
  selectedCategories,
  toggleCategory,
  clearCategories,
  selectedTags,
  toggleTag,
  clearTags,
  priceRange,
  setPriceRange,
  totalCount,
  hasActiveFilters,
  clearAllFilters,
  popularTags,
  variant,
  getCategoryCount,
}: FilterSidebarProps) {
  const idPrefix = variant === "mobile" ? "mobile-" : "";

  return (
    <div className="space-y-5">
      {/* Filter Header with Clear Button */}
      {variant === "desktop" && (
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
      )}

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
              id={`${idPrefix}category-all`}
              checked={selectedCategories.length === 0}
              onCheckedChange={() => clearCategories()}
            />
            <Label
              htmlFor={`${idPrefix}category-all`}
              className={cn(
                "text-sm cursor-pointer font-normal",
                variant === "desktop" ? "flex items-center justify-between w-full" : "",
                selectedCategories.length === 0
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              All Products
              {variant === "desktop" && (
                <span className="text-xs text-muted-foreground">({totalCount})</span>
              )}
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.slug} className="flex items-center space-x-3">
              <Checkbox
                id={`${idPrefix}category-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <Label
                htmlFor={`${idPrefix}category-${category.slug}`}
                className={cn(
                  "text-sm cursor-pointer font-normal",
                  variant === "desktop" ? "flex items-center justify-between w-full" : "",
                  selectedCategories.includes(category.slug)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {category.name}
                {variant === "desktop" && getCategoryCount && (
                  <span className="text-xs text-muted-foreground">
                    ({getCategoryCount(category.name)})
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 text-sm">
          Price Range
          {variant === "desktop" && (priceRange[0] > 0 || priceRange[1] < 12000) && (
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₱
              </span>
              <input
                type="number"
                placeholder="Min"
                className={cn(
                  "w-full pl-7 pr-2 py-2 border border-border rounded-md text-sm bg-background",
                  variant === "desktop" &&
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                )}
                value={priceRange[0] || ""}
                min={0}
                max={priceRange[1]}
                onChange={(e) => {
                  const val = Math.max(
                    0,
                    Math.min(Number(e.target.value) || 0, priceRange[1])
                  );
                  setPriceRange([val, priceRange[1]]);
                }}
              />
            </div>
            <span className="text-muted-foreground text-sm">to</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₱
              </span>
              <input
                type="number"
                placeholder="Max"
                className={cn(
                  "w-full pl-7 pr-2 py-2 border border-border rounded-md text-sm bg-background",
                  variant === "desktop" &&
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                )}
                value={priceRange[1] || ""}
                min={priceRange[0]}
                max={12000}
                onChange={(e) => {
                  const val = Math.max(
                    priceRange[0],
                    Math.min(Number(e.target.value) || 12000, 12000)
                  );
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
                  : cn(
                      "bg-background text-muted-foreground border-border hover:bg-muted/50",
                      variant === "desktop" && "hover:border-primary/30"
                    )
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={() => clearTags()}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear tags
          </button>
        )}
      </div>
    </div>
  );
}
