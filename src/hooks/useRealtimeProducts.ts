/**
 * useRealtimeProducts Hook
 * 
 * Real-time product updates from Sanity CMS with smart optimizations.
 * 
 * Features:
 * - Debounced updates (1 second) to prevent excessive re-renders
 * - Automatic subscription management (no duplicate subscriptions)
 * - Cache-first strategy with real-time overlay
 * - Optimized for demo presentations
 * 
 * ⚠️ QUOTA WARNING: Real-time subscriptions bypass CDN and count against API quota.
 * Use this hook sparingly - only for demo/admin pages.
 * 
 * @example
 * // Enable real-time updates for demo
 * const { products, isRealtime } = useRealtimeProducts({ realtime: true });
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { sanityClient } from "@/lib/sanity/client";
import { realtimeClient, subscriptionManager } from "@/lib/sanity/realtime";
import type { TransformedProduct, ProductFilters } from "@/types/sanity";

// In-memory cache for products (shared across components)
const productCache = new Map<string, { data: TransformedProduct[]; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds for real-time mode

/** Clear the module-level product cache (useful for testing) */
export function clearProductCache(): void {
  productCache.clear();
}

interface UseRealtimeProductsOptions extends ProductFilters {
  /** Enable real-time updates (default: false to save quota) */
  realtime?: boolean;
  /** Debounce delay for real-time updates in ms (default: 1000) */
  debounceMs?: number;
}

interface UseRealtimeProductsReturn {
  products: TransformedProduct[];
  loading: boolean;
  error: Error | null;
  isRealtime: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

/**
 * Build GROQ query for products
 */
function buildProductQuery(filters?: ProductFilters): string {
  let query = `*[_type == "product"`;
  
  if (filters?.isAvailable !== false) {
    query += ` && isAvailable == true`;
  }
  
  if (filters?.category) {
    query += ` && category->slug.current == "${filters.category}"`;
  }
  
  if (filters?.featured) {
    query += ` && isFeatured == true`;
  }
  
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    query += ` && (
      lower(name) match "*${searchTerm}*" ||
      lower(description) match "*${searchTerm}*"
    )`;
  }
  
  query += `] | order(isFeatured desc, _createdAt desc) {
    _id,
    _createdAt,
    _updatedAt,
    name,
    slug,
    description,
    price,
    compareAtPrice,
    "stock": quantity,
    sku,
    weight,
    unit,
    isAvailable,
    isFeatured,
    "isPromo": isOnPromo,
    promoEndDate,
    productTags,
    "mainImage": coalesce(mainImage.asset->url, image.asset->url),
    "images": images[].asset->url,
    category->{
      _id,
      name,
      "slug": slug.current,
      description
    }
  }`;
  
  return query;
}

/**
 * Transform Sanity product to frontend format
 */
function transformProduct(product: Record<string, unknown>): TransformedProduct {
  const slug = product.slug as { current?: string } | undefined;
  const category = product.category as { _id?: string; name?: string; slug?: string } | undefined;
  
  return {
    id: product._id as string,
    sanityId: product._id as string,
    name: (product.name as string) || "",
    slug: slug?.current || "",
    description: (product.description as string) || "",
    price: (product.price as number) || 0,
    compareAtPrice: product.compareAtPrice as number | undefined,
    stock: (product.stock as number) || 0,
    sku: product.sku as string | undefined,
    weight: product.weight as number | undefined,
    unit: product.unit as string | undefined,
    isAvailable: (product.isAvailable as boolean) ?? true,
    isFeatured: (product.isFeatured as boolean) ?? false,
    isPromo: product.isPromo as boolean | undefined,
    promoEndDate: product.promoEndDate as string | undefined,
    productTags: (product.productTags as string[]) || [],
    mainImage: product.mainImage as string | null,
    images: (product.images as string[]) || [],
    category: category ? {
      id: category._id || "",
      name: category.name || "",
      slug: category.slug || "",
    } : undefined,
    createdAt: product._createdAt as string,
    updatedAt: product._updatedAt as string,
  };
}

export function useRealtimeProducts(
  options: UseRealtimeProductsOptions = {}
): UseRealtimeProductsReturn {
  const { realtime = false, debounceMs = 1000, ...filters } = options;
  
  const [products, setProducts] = useState<TransformedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const subscriptionKeyRef = useRef<string>("");
  const isMountedRef = useRef(true);

  // Generate cache key from filters
  const cacheKey = JSON.stringify(filters);

  // Fetch products from Sanity
  // Note: Derive filters from cacheKey inside the callback to avoid
  // unstable object reference in deps (filters is a new object each render).
  const fetchProducts = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    console.log("🔍 Fetching products from Sanity...");
    
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = JSON.parse(cacheKey) as ProductFilters;
      const query = buildProductQuery(currentFilters);
      const data = await sanityClient.fetch<Record<string, unknown>[]>(query);
      
      const transformed = data.map(transformProduct);
      
      // Update cache
      productCache.set(cacheKey, { data: transformed, timestamp: Date.now() });
      
      if (isMountedRef.current) {
        setProducts(transformed);
        setLastUpdated(new Date());
        console.log(`✅ Fetched ${transformed.length} products`);
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      if (isMountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    
    // Check cache first
    const cached = productCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("📦 Using cached products");
      setProducts(cached.data);
      setLoading(false);
      setLastUpdated(new Date(cached.timestamp));
    } else {
      fetchProducts();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [cacheKey, fetchProducts]);

  // Real-time subscription
  useEffect(() => {
    if (!realtime) return;
    
    const subscriptionKey = `products:${cacheKey}`;
    subscriptionKeyRef.current = subscriptionKey;
    
    console.log("📡 Enabling real-time updates for products");
    
    const unsubscribe = subscriptionManager.subscribe(subscriptionKey, {
      query: `*[_type == "product"]`,
      debounceMs,
      onUpdate: () => {
        console.log("🔄 Real-time update detected, refetching...");
        fetchProducts();
      },
    });
    
    return () => {
      console.log("📡 Disabling real-time updates");
      unsubscribe();
    };
  }, [realtime, cacheKey, debounceMs, fetchProducts]);

  return {
    products,
    loading,
    error,
    isRealtime: realtime,
    lastUpdated,
    refetch: fetchProducts,
  };
}

export default useRealtimeProducts;
