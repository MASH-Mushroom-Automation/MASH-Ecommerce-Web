"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useWishlist } from "@/contexts/WishlistContext";

export default function WishlistPage() {
  const { wishlistIds, clearWishlist } = useWishlist();

  const wishlistItems = PRODUCTS.filter((product) =>
    wishlistIds.includes(product.id)
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Wishlist
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save your favorite items to easily find them later!
            </p>
            <Link href="/catalog">
              <Button className="bg-[#6A994E] hover:bg-[#6A994E]/90">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                farm={product.grower}
                price={product.price}
                unit={product.weight}
                image={product.image}
                inStock={product.inStock}
              />
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button variant="outline" className="w-full sm:w-auto px-8">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/checkout">
              <Button className="w-full sm:w-auto px-8 bg-[#1E392A] hover:bg-[#1E392A]/90">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add All to Cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
