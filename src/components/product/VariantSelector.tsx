/**
 * VariantSelector Component
 * UI for selecting product variants (size, color, weight)
 */

"use client";

import React from "react";
import { useSanityVariants, ProductVariant } from "@/hooks/useSanityVariants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  productId: string;
  onVariantChange?: (variant: ProductVariant | null) => void;
  className?: string;
}

export function VariantSelector({
  productId,
  onVariantChange,
  className,
}: VariantSelectorProps) {
  const {
    variants,
    summary,
    selectedVariant,
    loading,
    error,
    selectVariantById,
    getStockStatus,
  } = useSanityVariants(productId);

  // Notify parent when variant changes
  React.useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading variants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Error loading variants</span>
      </div>
    );
  }

  if (!variants.length) {
    return null; // No variants available
  }

  // Group variants by attribute
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const weights = [...new Set(variants.map((v) => v.weight).filter(Boolean))];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Price Range Display */}
      {summary && (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary-dark">
            {summary.priceRange}
          </span>
          {summary.totalVariants > 1 && (
            <Badge variant="secondary">{summary.totalVariants} options</Badge>
          )}
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variantsWithSize = variants.filter((v) => v.size === size);
              const isSelected = selectedVariant?.size === size;
              const hasStock = variantsWithSize.some((v) => v.stockQuantity > 0);

              return (
                <Button
                  key={size}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!hasStock}
                  onClick={() => {
                    const variant = variantsWithSize.find((v) => v.stockQuantity > 0);
                    if (variant) selectVariantById(variant.id);
                  }}
                  className={cn(
                    "min-w-[60px]",
                    isSelected && "bg-primary-dark text-white hover:bg-primary-dark/90"
                  )}
                >
                  {size?.toUpperCase()}
                  {isSelected && <CheckCircle className="ml-1 h-3 w-3" />}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const variantsWithColor = variants.filter((v) => v.color === color);
              const isSelected = selectedVariant?.color === color;
              const hasStock = variantsWithColor.some((v) => v.stockQuantity > 0);

              return (
                <Button
                  key={color}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!hasStock}
                  onClick={() => {
                    const variant = variantsWithColor.find((v) => v.stockQuantity > 0);
                    if (variant) selectVariantById(variant.id);
                  }}
                  className={cn(
                    "min-w-[80px] capitalize",
                    isSelected && "bg-primary-dark text-white hover:bg-primary-dark/90"
                  )}
                >
                  {color}
                  {isSelected && <CheckCircle className="ml-1 h-3 w-3" />}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Weight Selection */}
      {weights.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Weight</label>
          <div className="flex flex-wrap gap-2">
            {weights.map((weight) => {
              const variantsWithWeight = variants.filter((v) => v.weight === weight);
              const isSelected = selectedVariant?.weight === weight;
              const hasStock = variantsWithWeight.some((v) => v.stockQuantity > 0);

              return (
                <Button
                  key={weight}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!hasStock}
                  onClick={() => {
                    const variant = variantsWithWeight.find((v) => v.stockQuantity > 0);
                    if (variant) selectVariantById(variant.id);
                  }}
                  className={cn(
                    "min-w-[60px]",
                    isSelected && "bg-primary-dark text-white hover:bg-primary-dark/90"
                  )}
                >
                  {weight}
                  {isSelected && <CheckCircle className="ml-1 h-3 w-3" />}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Details */}
      {selectedVariant && (
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{selectedVariant.variantName}</span>
              <span className="text-xl font-bold text-primary-dark">
                ₱{selectedVariant.price.toFixed(2)}
              </span>
            </div>

            {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  ₱{selectedVariant.compareAtPrice.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {Math.round(
                    ((selectedVariant.compareAtPrice - selectedVariant.price) /
                      selectedVariant.compareAtPrice) *
                      100
                  )}
                  % OFF
                </Badge>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {getStockStatus(selectedVariant) === "in-stock" && (
                <Badge variant="default" className="bg-green-600">
                  ✓ In Stock ({selectedVariant.stockQuantity})
                </Badge>
              )}
              {getStockStatus(selectedVariant) === "low-stock" && (
                <Badge variant="secondary" className="bg-yellow-600 text-white">
                  ⚠ Low Stock ({selectedVariant.stockQuantity} left)
                </Badge>
              )}
              {getStockStatus(selectedVariant) === "out-of-stock" && (
                <Badge variant="destructive">✕ Out of Stock</Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground">SKU: {selectedVariant.sku}</p>
          </div>
        </Card>
      )}

      {/* All Variants List (Compact) */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          {summary?.availableVariants} of {summary?.totalVariants} variants available
        </p>
      </div>
    </div>
  );
}

/**
 * Compact variant display for product cards
 */
export function CompactVariantDisplay({ productId }: { productId: string }) {
  const { summary, loading } = useSanityVariants(productId);

  if (loading || !summary) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>{summary.totalVariants} options</span>
      <span>•</span>
      <span>{summary.priceRange}</span>
    </div>
  );
}
