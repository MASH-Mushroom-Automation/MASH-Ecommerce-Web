"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/contexts/WishlistContext";
import { isAuthenticated } from "@/lib/auth";

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
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
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

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow transition-shadow duration-200 flex flex-col h-full">
      {/* Product Image */}
      <Link href={`/product/${id}`} className="block relative aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Farm Badge */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#6A994E] shadow-sm">
          @{farm}
        </div>
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              inWishlist
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            )}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        <Link href={`/product/${id}`} className="mb-auto">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-[#6A994E] transition-colors">
            {name}
          </h3>
        </Link>
      </div>

      {/* Price and Add to Cart - Fixed at bottom */}
      <div className="p-3 pt-0 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-[#1E392A]">
              ₱{price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">/ {unit}</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="rounded-md h-9 w-9 p-0 flex-shrink-0"
            disabled={!inStock}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {!inStock && <p className="text-xs text-red-600 mt-1">Out of Stock</p>}
      </div>
    </div>
  );
}
