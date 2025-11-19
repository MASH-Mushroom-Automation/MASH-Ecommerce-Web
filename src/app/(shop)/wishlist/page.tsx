"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { useRouter } from "next/navigation";
import { useSanityProducts } from "@/hooks/useSanityProducts";
import type { SanityProduct } from "@/types/sanity";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function WishlistPage() {
  const { wishlistIds, clearWishlist } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState<SanityProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Fetch all products from Sanity
  const { products, loading, error } = useSanityProducts();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter products by wishlist IDs
  useEffect(() => {
    if (!isClient || !products) return;

    if (wishlistIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    // Filter Sanity products by wishlist IDs
    const filtered = products.filter((product) =>
      wishlistIds.includes(product._id)
    );
    setWishlistItems(filtered);
  }, [wishlistIds, products, isClient]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load wishlist products");
    }
  }, [error]);

  // Show loading state while hydrating
  if (!isClient) {
    return (
      <div className="bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              My Wishlist
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all items?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all products from your wishlist. You can
                    always add them again from the catalog.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearWishlist();
                      toast.success("Wishlist cleared.");
                    }}
                    className="bg-red-600 hover:bg-red-600/90 text-foreground"
                  >
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
        ) : error ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty State */
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save your favorite items to easily find them later!"
            actionLabel="Start Shopping"
            onAction={() => router.push("/shop")}
          />
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                slug={product.slug?.current}
                name={product.name}
                farm={product.category?.name || "MASH Mushrooms"}
                price={product.price}
                unit={`${product.weight}${product.unit}`}
                image={product.mainImage || "/placeholder-product.jpg"}
                inStock={product.isAvailable && product.stock > 0}
              />
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button variant="outline" className="w-full sm:w-auto px-8">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/checkout">
              <Button className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
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
