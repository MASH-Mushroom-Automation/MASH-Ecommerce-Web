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
import { ShoppingCart, X, Minus, Plus, Trash2, Check, Maximize2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
// TEMPORARILY DISABLED: Backend API not ready yet
// import { useProducts } from "@/hooks/useProducts";
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

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = "/mushroom-placeholder.png";

export function CartDropdown() {
  const cartData = useCart();
  const { items, summary, updateQuantity, removeFromCart, clearCart } =
    cartData;
  const { addToWishlist } = useWishlist();
  // TEMPORARILY DISABLED: Backend API not ready, cart items should already have product details
  // const { products } = useProducts({ limit: 100 });
  const [prevItemCount, setPrevItemCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  // const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalItems = items?.length || 0;

  // Toggle selection of a specific item
  const toggleItemSelection = (productId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(items.map((item) => item.productId));
      setSelectedItems(allIds);
    }
  };

  // Delete selected items
  const deleteSelectedItems = () => {
    selectedItems.forEach((productId) => {
      removeFromCart(productId);
    });
    setSelectedItems(new Set());
  };

  // Move selected items to wishlist
  const moveToWishlist = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select items to add to wishlist");
      return;
    }

    // Add each selected item to wishlist (keep in cart)
    selectedItems.forEach((productId) => {
      addToWishlist(productId);
    });

    const count = selectedItems.size;
    setSelectedItems(new Set());
    toast.success(`Added ${count} item${count === 1 ? '' : 's'} to wishlist`);
  };

  const selectedCount = selectedItems.size;

  useEffect(() => {
    if (totalItems > prevItemCount && prevItemCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
    setPrevItemCount(totalItems);
  }, [totalItems, prevItemCount]);

  // Cart items now have full product details from when they were added
  // No fallbacks needed - CartContext ensures all required fields are present
  const cartItemsWithDetails = items || [];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="relative flex items-center hover:text-primary transition-colors group"
          suppressHydrationWarning
        >
          <ShoppingCart size={24} className="group-hover:text-primary" />
          <span className="text-sm ml-1 hidden sm:block">Cart</span>
          {totalItems > 0 && (
            <Badge
              className={`absolute -top-2 -right-2 h-5 w-5 rounded-4xl flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs ${animate ? "animate-bounce scale-125" : ""
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
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary-foreground" />
            <SheetTitle className="text-lg font-semibold text-primary-foreground">
              My Cart
            </SheetTitle>
          </div>
          <Link
            href="/cart"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
            title="View full cart"
          >
            <Maximize2 className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">Full Screen</span>
          </Link>
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
              <Button className="px-6">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Selection Header */}
            {selectedCount > 0 && (
              <div className="bg-secondary px-6 py-3 flex items-center justify-between border-b border-primary/50">
                <span className="text-sm font-medium text-foreground">
                  {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-primary-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete {selectedCount} {selectedCount === 1 ? "item" : "items"}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the selected {selectedCount === 1 ? "item" : "items"} from
                        your cart. You can always add {selectedCount === 1 ? "it" : "them"} back later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteSelectedItems}
                        className="bg-red-600 hover:bg-red-600/90 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            <div className="flex-1 overflow-y-auto bg-background px-6 py-4">
              {/* Select All Checkbox */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
                <Checkbox
                  checked={selectedCount === items.length && items.length > 0}
                  onCheckedChange={selectAllItems}
                  id="select-all"
                  className="h-5 w-5"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-foreground cursor-pointer flex-1"
                >
                  Product ({items.length})
                </label>
              </div>

              <div className="space-y-3">
                {cartItemsWithDetails.map((item) => {
                  const isSelected = selectedItems.has(item.productId);
                  return (
                    <div key={item.productId} className={`relative p-3 rounded-lg border transition-colors ${isSelected
                      ? "border bg-secondary"
                      : "border-border  hover:border-muted"
                      }`}>
                      {/* Delete Button - Top Right */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded transition-colors"
                            aria-label="Remove item"
                          >
                            <X className="h-5 w-5 text-red-500" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove item from cart?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove "{item.name}" from your cart. You
                              can always add it back later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeFromCart(item.productId)}
                              className="bg-red-600 hover:bg-red-600/90 text-white"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <div className="flex gap-3">
                        {/* Checkbox - Left Side Centered */}
                        <div className="flex items-center flex-shrink-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItemSelection(item.productId)}
                            className="h-5 w-5"
                            aria-label={`Select ${item.name}`}
                          />
                        </div>

                        {/* Image */}
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex-shrink-0"
                        >
                          <Image
                            src={item.image || PLACEHOLDER_IMAGE}
                            alt={item.name}
                            width={100}
                            height={100}
                            className={cn(
                              "w-[100px] h-[100px] rounded-lg",
                              item.image
                                ? "object-cover"
                                : "object-contain bg-muted p-2",
                            )}
                          />
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col">
                          <Link href={`/product/${item.slug}`}>
                            <h4 className="font-semibold text-sm text-foreground hover:text-primary mb-1 pr-6 leading-snug line-clamp-2">
                              {item.name}
                            </h4>
                          </Link>

                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs text-muted-foreground">
                              Sold by: <span className="font-medium text-foreground">@{item.grower || "MASH"}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2">
                            <p className="text-base font-bold text-foreground">
                              ₱{item.price.toFixed(2)}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-muted rounded px-1.5 py-0.5">
                              <button
                                onClick={() => {
                                  // Only decrease quantity if it is greater than 1
                                  if (item.quantity > 1) {
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    );
                                  }
                                }}
                                // Disable button when quantity is 1
                                disabled={item.quantity <= 1}
                                className={`w-6 h-6 flex items-center justify-center rounded transition-colors text-xs ${item.quantity <= 1
                                  ? "opacity-50 cursor-not-allowed" // Disabled styles
                                  : "hover:bg-muted/80" // Active styles
                                  }`}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3 text-foreground" />
                              </button>

                              <span className="text-xs font-medium w-5 text-center text-foreground">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1,
                                  )
                                }
                                className="w-6 h-6 flex items-center justify-center hover:bg-muted/80 rounded transition-colors text-xs"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3 text-foreground" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-background border-t border-border px-6 py-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-foreground">
                  Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
                <span className="text-xl font-bold text-foreground">
                  ₱{(summary?.subtotal || 0).toFixed(2)}
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 py-3 border-t border-border pt-4">
                <button
                  onClick={selectAllItems}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Select All ({items.length})
                </button>

                <span className="text-muted-foreground">|</span>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {selectedCount > 0
                          ? `Delete ${selectedCount} ${selectedCount === 1 ? "item" : "items"}?`
                          : "No items selected"
                        }
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedCount > 0
                          ? `This will remove the selected ${selectedCount === 1 ? "item" : "items"} from your cart.`
                          : "Please select items to delete."
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      {selectedCount > 0 && (
                        <AlertDialogAction
                          onClick={deleteSelectedItems}
                          className="bg-red-600 hover:bg-red-600/90 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      )}
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <span className="text-gray-300">|</span>

                <button
                  onClick={moveToWishlist}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Move to My Likes
                </button>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block w-full">
                <Button className="w-full h-12 font-medium">
                  Proceed to checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
