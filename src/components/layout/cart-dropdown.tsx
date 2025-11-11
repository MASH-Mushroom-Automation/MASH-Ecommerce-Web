"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, X, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
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

export function CartDropdown() {
  const cartData = useCart();
  const { items, summary, updateQuantity, removeFromCart, clearCart } =
    cartData;
  const { products } = useProducts({ limit: 100 }); // Fetch products to get details
  const [prevItemCount, setPrevItemCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Trigger animation when cart count increases
  useEffect(() => {
    if (totalItems > prevItemCount && prevItemCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevItemCount(totalItems);
  }, [totalItems, prevItemCount]);

  // Get product details for each cart item
  const cartItemsWithDetails = (items || []).map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    return {
      ...cartItem,
      name: product?.name || "Product",
      image: product?.image || "/placeholder.png",
      grower: product?.grower || "Unknown",
      unit: product?.weight || "unit",
    };
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex items-center hover:text-accent transition-colors group">
          <ShoppingCart size={24} className="group-hover:text-accent" />
          <span className="text-sm ml-1 hidden sm:block">Cart</span>
          {totalItems > 0 && (
            <Badge
              className={`absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs transition-transform duration-300 ${
                animate ? "animate-bounce scale-125" : ""
              }`}
            >
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0"
      >
        {/* Dark Green Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            <SheetTitle className="text-lg font-semibold text-primary-foreground">
              My Cart
            </SheetTitle>
          </div>
        </div>

        {!items || items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6 bg-background">
            <div className="bg-muted rounded-full p-6 mb-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Add some delicious fresh mushrooms to get started!
            </p>
            <Link href="/shop">
              <Button className="px-6">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items - White Background */}
            <div className="flex-1 overflow-y-auto bg-background px-6 py-4">
              <div className="space-y-6">
                {cartItemsWithDetails.map((item) => (
                  <div key={item.productId} className="relative">
                    {/* Delete Button - Top Right */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="absolute top-0 right-0 p-1 hover:bg-red-50 rounded transition-colors z-10"
                      aria-label="Remove item"
                    >
                      <X className="h-5 w-5 text-red-500" />
                    </button>

                    <div className="flex gap-4">
                      {/* Product Image - Larger rounded square */}
                      <Link
                        href={`/product/${item.productId}`}
                        className="flex-shrink-0"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={120}
                          height={120}
                          className="w-[120px] h-[120px] rounded-lg object-cover"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <Link href={`/product/${item.productId}`}>
                          <h4 className="font-semibold text-base text-foreground hover:text-primary mb-2 pr-6 leading-snug">
                            {item.name}
                          </h4>
                        </Link>

                        <p className="text-sm text-accent mb-3">
                          Sold by: @{item.grower}
                        </p>

                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col">
                            <p className="text-lg font-bold text-foreground">
                              ₱{item.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 bg-muted rounded-lg px-2 py-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted/80 rounded transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4 text-foreground" />
                            </button>
                            <span className="text-base font-medium min-w-[24px] text-center text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center hover:bg-muted/80 rounded transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4 text-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Footer - White Background */}
            <div className="bg-background border-t border-border px-6 py-6 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-base text-foreground">
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span className="text-2xl font-bold text-foreground">
                  ₱{(summary?.subtotal || 0).toFixed(2)}
                </span>
              </div>

              {/* Buttons - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Clear Cart Button with confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-border hover:bg-muted text-foreground font-medium"
                    >
                      Clear Cart
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all items?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all products from your cart. You can
                        always add them again from the catalog.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearCart}
                        className="bg-red-600 hover:bg-red-600/90"
                      >
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Checkout Button */}
                <Link href="/checkout" className="block">
                  <Button className="w-full h-12 font-medium">
                    Proceed to checkout
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
