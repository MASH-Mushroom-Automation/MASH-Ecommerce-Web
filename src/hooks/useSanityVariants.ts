/**
 * useSanityVariants Hook
 * Fetches and monitors product variants with real-time updates
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { sanityClient } from "@/lib/sanity/client";

// TypeScript interfaces
export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string;
  sku: string;
  size?: string;
  color?: string;
  weight?: string;
  customAttribute?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images?: string[];
  isAvailable: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export interface VariantSelection {
  size?: string;
  color?: string;
  weight?: string;
}

export interface VariantSummary {
  totalVariants: number;
  availableVariants: number;
  outOfStockVariants: number;
  lowestPrice: number;
  highestPrice: number;
  priceRange: string;
  sizes: string[];
  colors: string[];
  weights: string[];
}

/**
 * Hook to fetch and monitor product variants
 */
export function useSanityVariants(productId: string) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [summary, setSummary] = useState<VariantSummary | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch variants from Sanity
  const fetchVariants = useCallback(async () => {
    try {
      console.log(`🎨 [VARIANTS] Fetching variants for product: ${productId}`);
      setLoading(true);

      // GROQ query to fetch all variants for a product
      const query = `*[_type == "productVariant" && product._ref == $productId && isAvailable == true] | order(sortOrder asc) {
        _id,
        "productId": product._ref,
        variantName,
        sku,
        size,
        color,
        weight,
        customAttribute,
        price,
        compareAtPrice,
        stockQuantity,
        lowStockThreshold,
        "images": images[].asset->url,
        isAvailable,
        isDefault,
        sortOrder
      }`;

      const result = await sanityClient.fetch<ProductVariant[]>(query, {
        productId,
      });

      const transformedVariants = result.map((variant) => ({
        ...variant,
        id: variant._id,
      })) as ProductVariant[];

      setVariants(transformedVariants);

      // Calculate variant summary
      if (transformedVariants.length > 0) {
        const available = transformedVariants.filter(
          (v) => v.stockQuantity > 0
        );
        const prices = transformedVariants.map((v) => v.price);
        const lowestPrice = Math.min(...prices);
        const highestPrice = Math.max(...prices);

        const variantSummary: VariantSummary = {
          totalVariants: transformedVariants.length,
          availableVariants: available.length,
          outOfStockVariants: transformedVariants.length - available.length,
          lowestPrice,
          highestPrice,
          priceRange:
            lowestPrice === highestPrice
              ? `₱${lowestPrice.toFixed(2)}`
              : `₱${lowestPrice.toFixed(2)} - ₱${highestPrice.toFixed(2)}`,
          sizes: [
            ...new Set(
              transformedVariants.map((v) => v.size).filter(Boolean)
            ),
          ] as string[],
          colors: [
            ...new Set(
              transformedVariants.map((v) => v.color).filter(Boolean)
            ),
          ] as string[],
          weights: [
            ...new Set(
              transformedVariants.map((v) => v.weight).filter(Boolean)
            ),
          ] as string[],
        };

        setSummary(variantSummary);

        // Auto-select default variant or first available variant
        const defaultVariant =
          transformedVariants.find((v) => v.isDefault) || available[0];
        if (defaultVariant && !selectedVariant) {
          setSelectedVariant(defaultVariant);
        }
      } else {
        setSummary(null);
      }

      console.log(
        `✅ [VARIANTS] Loaded ${transformedVariants.length} variants`,
        {
          available: available.length,
          priceRange: lowestPrice === highestPrice ? lowestPrice : [lowestPrice, highestPrice],
        }
      );
      setError(null);
    } catch (err) {
      console.error("❌ [VARIANTS] Error fetching variants:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch variants");
    } finally {
      setLoading(false);
    }
  }, [productId, selectedVariant]);

  // Real-time subscription to variant changes
  useEffect(() => {
    fetchVariants();

    // Subscribe to real-time updates
    const subscription = sanityClient
      .listen(`*[_type == "productVariant" && product._ref == "${productId}"]`)
      .subscribe((update) => {
        if (update.type === "mutation") {
          console.log("🔄 [VARIANTS] Variant updated in real-time!");
          fetchVariants();
        }
      });

    return () => subscription.unsubscribe();
  }, [fetchVariants, productId]);

  // Select variant by criteria
  const selectVariant = useCallback(
    (criteria: VariantSelection) => {
      const matched = variants.find((variant) => {
        return (
          (!criteria.size || variant.size === criteria.size) &&
          (!criteria.color || variant.color === criteria.color) &&
          (!criteria.weight || variant.weight === criteria.weight)
        );
      });

      if (matched) {
        console.log(`✅ [VARIANTS] Selected variant:`, matched.variantName);
        setSelectedVariant(matched);
      } else {
        console.warn("⚠️ [VARIANTS] No matching variant found for criteria:", criteria);
      }
    },
    [variants]
  );

  // Select variant by ID
  const selectVariantById = useCallback(
    (variantId: string) => {
      const variant = variants.find((v) => v.id === variantId);
      if (variant) {
        console.log(`✅ [VARIANTS] Selected variant by ID:`, variant.variantName);
        setSelectedVariant(variant);
      }
    },
    [variants]
  );

  // Check if variant is in stock
  const isInStock = useCallback((variant: ProductVariant) => {
    return variant.stockQuantity > 0;
  }, []);

  // Check if variant is low stock
  const isLowStock = useCallback((variant: ProductVariant) => {
    return (
      variant.stockQuantity > 0 &&
      variant.stockQuantity <= variant.lowStockThreshold
    );
  }, []);

  // Get stock status
  const getStockStatus = useCallback(
    (variant: ProductVariant) => {
      if (!isInStock(variant)) return "out-of-stock";
      if (isLowStock(variant)) return "low-stock";
      return "in-stock";
    },
    [isInStock, isLowStock]
  );

  return {
    variants,
    summary,
    selectedVariant,
    loading,
    error,
    selectVariant,
    selectVariantById,
    isInStock,
    isLowStock,
    getStockStatus,
    refetch: fetchVariants,
  };
}

/**
 * Hook to get all available variant options for a product
 */
export function useVariantOptions(productId: string) {
  const { variants, loading } = useSanityVariants(productId);

  const options = {
    sizes: [...new Set(variants.map((v) => v.size).filter(Boolean))],
    colors: [...new Set(variants.map((v) => v.color).filter(Boolean))],
    weights: [...new Set(variants.map((v) => v.weight).filter(Boolean))],
  };

  return { options, loading };
}
