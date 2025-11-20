"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";
import { getGrowerUrl } from "@/lib/grower-utils";
import { trackAddToCart } from "@/lib/analytics";
import { StockBadge } from "./StockBadge";

interface ProductCardProps {
  id: string;
  slug?: string; // Sanity slug for SEO-friendly URLs
  name: string;
  farm?: string;
  price: number;
  unit?: string;
  image: string;
  inStock?: boolean;
}

export function ProductCard({
  id,
  slug,
  name,
  farm,
  price,
  unit,
  image,
  inStock = true,
}: ProductCardProps) {
  // Use slug for URL if available (Sanity products), otherwise fall back to ID
  const productUrl = slug ? `/product/${slug}` : `/product/${id}`;
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const inWishlist = isInWishlist(id);

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

    addToCart(id, price, 1);

    // Track add to cart event
    trackAddToCart({
      id,
      name,
      price,
      quantity: 1,
    });

    toast.success(`${name} added to cart!`, {
      description: "View your cart to proceed to checkout",
    });
  };

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow transition-shadow duration-200 flex flex-col h-full">
      {/* Product Image */}
      <Link
        href={productUrl}
        className="block relative aspect-square bg-muted"
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Farm Badge */}
        {farm && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(getGrowerUrl(farm));
            }}
            className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-primary shadow-sm hover:bg-background transition-colors max-w-[calc(100%-80px)] truncate"
            aria-label={`View grower ${farm}`}
            title={`@${farm}`}
          >
            @{farm}
          </button>
        )}
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 bg-background/95 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-all"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              inWishlist
                ? "fill-destructive text-destructive"
                : "text-muted-foreground hover:text-destructive"
            )}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        <Link href={productUrl} className="mb-auto">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        {/* Real-time Stock Badge */}
        <div className="mt-2">
          <StockBadge productId={id} showQuantity={false} variant="sm" />
        </div>
      </div>

      {/* Price and Add to Cart - Fixed at bottom */}
      <div className="p-3 pt-0 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              ₱{price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">/ {unit ?? "unit"}</span>
          </div>

          <Button
            variant="secondary"
            size="icon-sm"
            className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 active:scale-95 transition-transform"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {!inStock && <p className="text-xs text-destructive mt-1">Out of Stock</p>}
      </div>
    </div>
  );
}
