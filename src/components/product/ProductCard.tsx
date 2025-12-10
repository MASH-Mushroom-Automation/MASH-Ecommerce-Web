"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import { getGrowerUrl } from "@/lib/grower-utils";
import { trackAddToCart } from "@/lib/analytics";

interface ProductCardProps {
  id: string;
  slug?: string; // Sanity slug for SEO-friendly URLs
  name: string;
  farm?: string;
  price: number;
  comparePrice?: number; // Original price for discount display
  unit?: string;
  image: string;
  inStock?: boolean;
  stock?: number; // Actual stock count for cart validation
  rating?: number; // Product rating (1-5)
  reviewCount?: number; // Number of reviews
  tags?: string[]; // Product tags like "Best Seller", "New", etc.
}

export function ProductCard({
  id,
  slug,
  name,
  farm,
  price,
  comparePrice,
  unit,
  image,
  inStock = true,
  stock = 100, // Default stock if not provided
  rating,
  reviewCount,
  tags = [],
}: ProductCardProps) {
  // Use slug for URL if available (Sanity products), otherwise fall back to ID
  const productUrl = slug ? `/product/${slug}` : `/product/${id}`;
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(id);

  // Calculate discount percentage if comparePrice exists
  const discountPercent = comparePrice && comparePrice > price 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0;

  // Check for special tags
  const isBestSeller = tags.some(t => t.toLowerCase().includes('best') || t.toLowerCase().includes('popular'));
  const isNew = tags.some(t => t.toLowerCase() === 'new');
  const isOrganic = tags.some(t => t.toLowerCase() === 'organic');

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const success = addToCart({
      id,
      name,
      price,
      image,
      slug: slug || id,
      stock,
      grower: farm,
      unit,
    }, 1);

    if (success) {
      // Track add to cart event
      trackAddToCart({
        id,
        name,
        price,
        quantity: 1,
      });
    }
    // Toast is handled by CartContext, no need to duplicate
  };

  return (
    <div className={cn(
      "group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full",
      !inStock && "opacity-75"
    )}>
      {/* Product Image */}
      <Link
        href={productUrl}
        className="block relative aspect-square bg-muted overflow-hidden"
      >
        <Image
          src={image}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            !inStock && "grayscale-[30%]"
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top Left Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {/* Best Seller Badge */}
          {isBestSeller && !discountPercent && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              Best Seller
            </span>
          )}
          {/* New Badge */}
          {isNew && !isBestSeller && !discountPercent && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              New
            </span>
          )}
          {/* Organic Badge */}
          {isOrganic && (
            <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <span className="text-[10px]">🌿</span> Organic
            </span>
          )}
        </div>

        {/* Farm Badge - Bottom Left */}
        {farm && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(getGrowerUrl(farm));
            }}
            className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm hover:bg-white transition-colors max-w-[calc(100%-80px)] truncate"
            aria-label={`View grower ${farm}`}
            title={`@${farm}`}
          >
            @{farm}
          </button>
        )}
        
        {/* Wishlist Button - Top Right */}
        <button
          onClick={toggleWishlist}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full shadow-sm transition-all duration-200",
            inWishlist 
              ? "bg-red-50 hover:bg-red-100" 
              : "bg-white/95 backdrop-blur-sm hover:bg-white"
          )}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              inWishlist
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-500"
            )}
          />
        </button>

        {/* Out of Stock Overlay - Subtle */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
              Notify Me
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Rating */}
        {rating && rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            {reviewCount && reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        <Link href={productUrl} className="mb-auto">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary transition-colors leading-snug">
            {name}
          </h3>
        </Link>
      </div>

      {/* Price and Add to Cart - Fixed at bottom */}
      <div className="p-4 pt-0">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                ₱{price.toFixed(0)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  ₱{comparePrice.toFixed(0)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">per {unit ?? "unit"}</span>
          </div>

          <Button
            variant="default"
            size="sm"
            className={cn(
              "rounded-lg shadow-sm transition-all duration-200",
              inStock 
                ? "bg-primary hover:bg-primary/90 active:scale-95" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            {inStock ? "Add" : "Sold Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}
