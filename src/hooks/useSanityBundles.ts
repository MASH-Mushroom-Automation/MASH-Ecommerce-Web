/**
 * useSanityBundles Hook
 * Fetches and monitors product bundles with real-time updates
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { sanityClient, listenSafe } from "@/lib/sanity/client";

// TypeScript interfaces
export interface BundleProduct {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image?: string;
  };
  quantity: number;
  variant?: {
    id: string;
    variantName: string;
  };
}

export interface ProductBundle {
  id: string;
  bundleName: string;
  slug: string;
  description?: string;
  tagline?: string;
  products: BundleProduct[];
  bundlePrice: number;
  discountPercentage?: number;
  savingsAmount?: number;
  bundleImage?: string;
  additionalImages?: string[];
  isActive: boolean;
  availableFrom?: string;
  availableUntil?: string;
  stockLimit?: number;
  featured: boolean;
  badge?: string;
  sortOrder: number;
}

export interface BundleSummary {
  totalBundles: number;
  activeBundles: number;
  featuredBundles: number;
  totalSavings: number;
  averageDiscount: number;
}

/**
 * Hook to fetch and monitor product bundles
 */
export function useSanityBundles(productId?: string) {
  const [bundles, setBundles] = useState<ProductBundle[]>([]);
  const [summary, setSummary] = useState<BundleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bundles from Sanity
  const fetchBundles = useCallback(async () => {
    try {
      console.log(`📦 [BUNDLES] Fetching bundles${productId ? ` for product: ${productId}` : ""}`);
      setLoading(true);

      // GROQ query - if productId provided, get bundles containing that product
      const query = productId
        ? `*[_type == "productBundle" && isActive == true && references($productId)] | order(featured desc, sortOrder asc) {
            _id,
            bundleName,
            slug,
            description,
            tagline,
            products[]{
              quantity,
              "product": product->{
                _id,
                name,
                "slug": slug.current,
                price,
                "image": image.asset->url
              },
              "variant": variant->{
                _id,
                variantName
              }
            },
            bundlePrice,
            discountPercentage,
            savingsAmount,
            "bundleImage": bundleImage.asset->url,
            "additionalImages": additionalImages[].asset->url,
            isActive,
            availableFrom,
            availableUntil,
            stockLimit,
            featured,
            badge,
            sortOrder
          }`
        : `*[_type == "productBundle" && isActive == true] | order(featured desc, sortOrder asc) {
            _id,
            bundleName,
            slug,
            description,
            tagline,
            products[]{
              quantity,
              "product": product->{
                _id,
                name,
                "slug": slug.current,
                price,
                "image": image.asset->url
              },
              "variant": variant->{
                _id,
                variantName
              }
            },
            bundlePrice,
            discountPercentage,
            savingsAmount,
            "bundleImage": bundleImage.asset->url,
            "additionalImages": additionalImages[].asset->url,
            isActive,
            availableFrom,
            availableUntil,
            stockLimit,
            featured,
            badge,
            sortOrder
          }`;

      const result = await sanityClient.fetch<ProductBundle[]>(
        query,
        productId ? { productId } : {}
      );

      const transformedBundles = result.map((bundle) => {
        // Calculate total price of products in bundle
        const totalProductPrice = bundle.products.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        // Calculate savings if not provided
        const savings =
          bundle.savingsAmount ?? totalProductPrice - bundle.bundlePrice;
        const discountPercentage =
          bundle.discountPercentage ?? (savings / totalProductPrice) * 100;

        return {
          ...bundle,
          id: bundle._id,
          savingsAmount: savings,
          discountPercentage: Math.round(discountPercentage),
        };
      }) as ProductBundle[];

      // Filter bundles by availability dates
      const now = new Date();
      const availableBundles = transformedBundles.filter((bundle) => {
        if (bundle.availableFrom && new Date(bundle.availableFrom) > now)
          return false;
        if (bundle.availableUntil && new Date(bundle.availableUntil) < now)
          return false;
        return true;
      });

      setBundles(availableBundles);

      // Calculate bundle summary
      if (availableBundles.length > 0) {
        const featured = availableBundles.filter((b) => b.featured);
        const totalSavings = availableBundles.reduce(
          (sum, b) => sum + (b.savingsAmount || 0),
          0
        );
        const avgDiscount =
          availableBundles.reduce(
            (sum, b) => sum + (b.discountPercentage || 0),
            0
          ) / availableBundles.length;

        const bundleSummary: BundleSummary = {
          totalBundles: availableBundles.length,
          activeBundles: availableBundles.length,
          featuredBundles: featured.length,
          totalSavings,
          averageDiscount: Math.round(avgDiscount),
        };

        setSummary(bundleSummary);
      } else {
        setSummary(null);
      }

      console.log(`✅ [BUNDLES] Loaded ${availableBundles.length} bundles`, {
        featured: featured?.length || 0,
        avgDiscount: Math.round(avgDiscount),
      });
      setError(null);
    } catch (err) {
      console.error("❌ [BUNDLES] Error fetching bundles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bundles");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Real-time subscription to bundle changes
  useEffect(() => {
    fetchBundles();

    // Subscribe to real-time updates
    const subscription = sanityClient
      .listenSafe ? .listenSafe(`*[_type == "productBundle"]`) : listenSafe(`*[_type == "productBundle"]`)
      .subscribe((update) => {
        if (update.type === "mutation") {
          console.log("🔄 [BUNDLES] Bundle updated in real-time!");
          fetchBundles();
        }
      });

    return () => subscription.unsubscribe();
  }, [fetchBundles]);

  // Get featured bundles only
  const getFeaturedBundles = useCallback(() => {
    return bundles.filter((b) => b.featured);
  }, [bundles]);

  // Get bundles by badge type
  const getBundlesByBadge = useCallback(
    (badgeType: string) => {
      return bundles.filter((b) => b.badge === badgeType);
    },
    [bundles]
  );

  // Calculate bundle savings percentage
  const calculateSavings = useCallback((bundle: ProductBundle) => {
    const totalProductPrice = bundle.products.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const savings = totalProductPrice - bundle.bundlePrice;
    return {
      amount: savings,
      percentage: Math.round((savings / totalProductPrice) * 100),
    };
  }, []);

  return {
    bundles,
    summary,
    loading,
    error,
    getFeaturedBundles,
    getBundlesByBadge,
    calculateSavings,
    refetch: fetchBundles,
  };
}

/**
 * Hook to get a single bundle by slug
 */
export function useSanityBundle(slug: string) {
  const [bundle, setBundle] = useState<ProductBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        console.log(`📦 [BUNDLE] Fetching bundle: ${slug}`);
        setLoading(true);

        const query = `*[_type == "productBundle" && slug.current == $slug][0] {
          _id,
          bundleName,
          slug,
          description,
          tagline,
          products[]{
            quantity,
            "product": product->{
              _id,
              name,
              "slug": slug.current,
              price,
              "image": image.asset->url
            },
            "variant": variant->{
              _id,
              variantName
            }
          },
          bundlePrice,
          discountPercentage,
          savingsAmount,
          "bundleImage": bundleImage.asset->url,
          "additionalImages": additionalImages[].asset->url,
          isActive,
          availableFrom,
          availableUntil,
          stockLimit,
          featured,
          badge,
          sortOrder
        }`;

        const result = await sanityClient.fetch<ProductBundle>(query, { slug });

        if (result) {
          // Calculate savings if not provided
          const totalProductPrice = result.products.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const savings =
            result.savingsAmount ?? totalProductPrice - result.bundlePrice;
          const discountPercentage =
            result.discountPercentage ?? (savings / totalProductPrice) * 100;

          setBundle({
            ...result,
            id: result._id,
            savingsAmount: savings,
            discountPercentage: Math.round(discountPercentage),
          });

          console.log(`✅ [BUNDLE] Loaded bundle: ${result.bundleName}`);
        } else {
          console.warn(`⚠️ [BUNDLE] Bundle not found: ${slug}`);
          setBundle(null);
        }

        setError(null);
      } catch (err) {
        console.error("❌ [BUNDLE] Error fetching bundle:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch bundle");
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();

    // Subscribe to real-time updates for this specific bundle
    const subscription = sanityClient
      .listenSafe ? .listenSafe(`*[_type == "productBundle" && slug.current == "${slug}"]`) : listenSafe(`*[_type == "productBundle" && slug.current == "${slug}"]`)
      .subscribe((update) => {
        if (update.type === "mutation") {
          console.log("🔄 [BUNDLE] Bundle updated in real-time!");
          fetchBundle();
        }
      });

    return () => subscription.unsubscribe();
  }, [slug]);

  return { bundle, loading, error };
}
