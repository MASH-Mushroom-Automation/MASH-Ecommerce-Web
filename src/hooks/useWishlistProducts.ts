"use client";

import { useEffect, useState, useCallback } from "react";
import { sanityClient } from "@/lib/sanity/client";
import { wishlistProductsQuery } from "@/lib/sanity/queries";
import { transformSanityProduct } from "@/types/sanity";
import type { SanityProduct, TransformedProduct } from "@/types/sanity";

interface UseWishlistProductsReturn {
  products: TransformedProduct[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetch only products matching the given IDs (optimized for wishlist).
 * Instead of fetching ALL products and filtering client-side,
 * this hook passes IDs directly to a GROQ query.
 */
export function useWishlistProducts(ids: string[]): UseWishlistProductsReturn {
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await sanityClient.fetch<SanityProduct[]>(
        wishlistProductsQuery,
        { ids }
      );
      const transformed = data.map(transformSanityProduct);
      setProducts(transformed);
    } catch (err) {
      console.error("Error fetching wishlist products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  }, [ids.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error };
}
