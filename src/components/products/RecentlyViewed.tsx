"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useWishlistProducts } from "@/hooks/useWishlistProducts";

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

interface RecentlyViewedProps {
  excludeProductId?: string;
  maxDisplay?: number;
}

export function RecentlyViewed({
  excludeProductId,
  maxDisplay = 10,
}: RecentlyViewedProps) {
  const { recentProductIds, clearRecentlyViewed, isLoaded } =
    useRecentlyViewed();

  // Filter out the current product if on a product page
  const filteredIds = excludeProductId
    ? recentProductIds.filter((id) => id !== excludeProductId)
    : recentProductIds;

  const displayIds = filteredIds.slice(0, maxDisplay);

  // Fetch product details from Sanity
  const { products, loading } = useWishlistProducts(displayIds);

  if (!isLoaded || displayIds.length === 0) return null;
  if (loading) return null;
  if (products.length === 0) return null;

  // Sort products to match the order of displayIds (most recent first)
  const sortedProducts = displayIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Recently Viewed
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground text-xs"
          onClick={clearRecentlyViewed}
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {sortedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug || product.id}`}
            className="flex-shrink-0 w-[140px] group"
          >
            <div className="relative w-[140px] h-[140px] rounded-lg overflow-hidden bg-muted mb-2">
              <Image
                src={product.image || PLACEHOLDER_IMAGE}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="140px"
              />
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </p>
            <p className="text-sm text-primary font-semibold">
              ₱{product.price.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
