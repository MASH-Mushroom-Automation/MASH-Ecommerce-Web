"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
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

const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

export default function CartPage() {
  const router = useRouter();
  const { items, summary, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }
    const success = updateQuantity(productId, newQuantity);
    if (!success) {
      toast.error("Unable to update quantity. Stock limit reached.");
    }
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    setRemovingItemId(productId);
    removeFromCart(productId);
    toast.success(`Removed "${productName}" from cart`);
    setRemovingItemId(null);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 mb-8">
            <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            Shopping Cart
          </h1>
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added any items to your cart yet."
            actionLabel="Start Shopping"
            onAction={() => router.push("/shop")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Shopping Cart
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {/* Clear Cart Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear entire cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {items.length} items from your cart. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearCart}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Clear Cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link href={`/product/${item.slug || item.productId}`} className="flex-shrink-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={item.image || PLACEHOLDER_IMAGE}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.slug || item.productId}`}>
                        <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      {item.grower && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          by {item.grower}
                        </p>
                      )}
                      {item.unit && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.unit}
                        </p>
                      )}
                      <p className="text-primary font-semibold mt-1">
                        ₱{item.price.toLocaleString()}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(item.productId, item.name)}
                          disabled={removingItemId === item.productId}
                        >
                          {removingItemId === item.productId ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Remove</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link href="/shop">
                <Button variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Lines */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({summary.itemCount} items)
                    </span>
                    <span className="font-medium">₱{summary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (12%)</span>
                    <span className="font-medium">₱{summary.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {summary.shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₱${summary.shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  {summary.shipping === 0 && summary.subtotal >= 500 && (
                    <p className="text-xs text-green-600">
                      🎉 Free shipping on orders over ₱500!
                    </p>
                  )}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₱{summary.total.toLocaleString()}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Additional Info */}
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Secure checkout powered by Firebase</p>
                  <p>Delivery fees calculated at checkout</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
