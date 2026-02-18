"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { useRouter } from "next/navigation";
import { useSanityProducts } from "@/hooks/useSanityProducts";
import type { TransformedProduct } from "@/types/sanity";
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
  const { wishlistIds, clearWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<TransformedProduct[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const router = useRouter();

  // Fetch all products from Sanity
  const { products, loading, error } = useSanityProducts();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter products by wishlist IDs - use 'id' not '_id' for TransformedProduct
  useEffect(() => {
    if (!isClient || !products) return;

    if (wishlistIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    // Filter products by wishlist IDs (TransformedProduct uses 'id', not '_id')
    const filtered = products.filter((product) =>
      wishlistIds.includes(product.id)
    );
    console.log('🛒 Wishlist filter:', { wishlistIds, filtered: filtered.length, total: products.length });
    setWishlistItems(filtered);
  }, [wishlistIds, products, isClient]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error("Failed to load wishlist products");
    }
  }, [error]);

  // Add all items to cart - use TransformedProduct properties
  const handleAddAllToCart = useCallback(async () => {
    if (wishlistItems.length === 0) return;
    
    setIsAddingAll(true);
    let addedCount = 0;
    let failedCount = 0;

    for (const product of wishlistItems) {
      if (product.isAvailable && product.stock > 0) {
        const success = addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || "/mushroom-placeholder.png",
          slug: product.slug || product.id,
          stock: product.stock,
          grower: product.category,
          unit: product.unit ? `${product.weight}${product.unit}` : undefined,
        }, 1);
        
        if (success) {
          addedCount++;
        } else {
          failedCount++;
        }
      } else {
        failedCount++;
      }
    }

    setIsAddingAll(false);

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} item${addedCount > 1 ? 's' : ''} to cart!`);
    }
    if (failedCount > 0) {
      toast.warning(`${failedCount} item${failedCount > 1 ? 's' : ''} couldn't be added (out of stock or already in cart)`);
    }
  }, [wishlistItems, addToCart]);

  // Quick remove from wishlist
  const handleQuickRemove = useCallback((productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast.success(`Removed "${productName}" from wishlist`);
  }, [removeFromWishlist]);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          {/* Header Actions */}
          {wishlistItems.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                onClick={handleAddAllToCart}
                disabled={isAddingAll}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isAddingAll ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
                )}
                {isAddingAll ? "Adding..." : "Add All to Cart"}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all items?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {wishlistItems.length} products from your wishlist. 
                      You can always add them again from the catalog.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearWishlist();
                        toast.success("Wishlist cleared.");
                      }}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your wishlist...</p>
          </div>
        ) : error ? (
          <div className="bg-card rounded-lg shadow-sm p-8 sm:p-12 text-center">
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
          <>
            {/* Product Grid - Improved responsiveness */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {wishlistItems.map((product) => (
                <div key={product.id} className="relative group/wishlist">
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    farm={product.category || product.grower?.name || "MASH Mushrooms"}
                    price={product.price}
                    comparePrice={product.compareAtPrice}
                    unit={product.unit ? `${product.weight}${product.unit}` : undefined}
                    image={product.image || "/mushroom-placeholder.png"}
                    images={product.images}
                    inStock={product.isAvailable && product.stock > 0}
                    stock={product.stock}
                    tags={product.productTags || []}
                    description={product.description}
                  />
                  
                  {/* Quick Remove Button - Shows on hover */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickRemove(product.id, product.name);
                    }}
                    className="absolute top-2 left-2 z-10 opacity-0 group-hover/wishlist:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground shadow-sm"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Bottom Actions - Sticky on mobile */}
            <div className="mt-8 sm:mt-10">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto px-6 sm:px-8">
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/cart" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Cart
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
