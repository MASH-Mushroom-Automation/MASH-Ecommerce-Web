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

interface ProductCardProps {
  id: string;
  name: string;
  farm: string;
  price: number;
  unit: string;
  image: string;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  farm,
  price,
  unit,
  image,
  inStock = true,
}: ProductCardProps) {
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

    toast.success(`${name} added to cart!`, {
      description: "View your cart to proceed to checkout",
    });
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200 flex flex-col h-full">
      {/* Product Image */}
      <Link
        href={`/product/${id}`}
        className="block relative aspect-square bg-gray-50"
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Farm Badge */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(getGrowerUrl(farm));
          }}
          className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-primary shadow-sm hover:bg-background transition-colors"
          aria-label={`View grower ${farm}`}
        >
          @{farm}
        </button>
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
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground hover:text-red-500"
            )}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        <Link href={`/product/${id}`} className="mb-auto">
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
      </div>

      {/* Price and Add to Cart - Fixed at bottom */}
      <div className="p-3 pt-0 border-t border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              ₱{price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">/ {unit}</span>
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

        {!inStock && <p className="text-xs text-red-600 mt-1">Out of Stock</p>}
      </div>
    </div>
  );
}
