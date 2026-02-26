"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Truck,
  CheckCircle,
  Heart,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { CartItem, AddToCartProduct } from "@/types/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { CrossSell } from "@/components/cart/CrossSell";
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
  const { items, summary, loading, updateQuantity, removeFromCart, clearCart, addToCart } =
    useCart();
  const { wishlistIds, addToWishlist } = useWishlist();
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Saved for Later state
  const [savedItems, setSavedItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("mash-saved-for-later");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const persistSavedItems = (items: CartItem[]) => {
    setSavedItems(items);
    localStorage.setItem("mash-saved-for-later", JSON.stringify(items));
  };

  const handleSaveForLater = (item: CartItem) => {
    removeFromCart(item.productId);
    const exists = savedItems.some((s) => s.productId === item.productId);
    if (!exists) {
      persistSavedItems([...savedItems, { ...item, quantity: item.quantity }]);
    }
    toast.success(`"${item.name}" saved for later`);
  };

  const handleMoveToCart = (item: CartItem) => {
    const product: AddToCartProduct = {
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      stock: item.stock,
      grower: item.grower,
      unit: item.unit,
    };
    const success = addToCart(product, item.quantity);
    if (success) {
      persistSavedItems(savedItems.filter((s) => s.productId !== item.productId));
      toast.success(`"${item.name}" moved to cart`);
    } else {
      toast.error("Could not add item to cart");
    }
  };

  const handleRemoveSaved = (productId: string, name: string) => {
    persistSavedItems(savedItems.filter((s) => s.productId !== productId));
    toast.success(`Removed "${name}" from saved items`);
  };

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
    if (selectedItems.size === 0) {
      toast.error("Please select items to checkout");
      return;
    }
    router.push("/checkout");
  };

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
    toast.success(`Removed ${selectedItems.size} item${selectedItems.size === 1 ? '' : 's'} from cart`);
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
  const selectedCartItems = items.filter((item) =>
    selectedItems.has(item.productId),
  );
  const selectedItemCount = selectedCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const selectedSubtotal =
    selectedCount > 0
      ? selectedCartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      )
      : 0;

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
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="bg-muted rounded-full p-8 mb-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Looks like you haven&apos;t added any items to your cart yet.
              Browse our fresh mushroom selection!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => router.push("/shop")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
              {wishlistIds.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push("/wishlist")}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  View Wishlist ({wishlistIds.length})
                </Button>
              )}
            </div>
          </div>

          {/* Saved for Later - visible even when cart is empty */}
          {savedItems.length > 0 && (
            <div className="max-w-2xl mx-auto pt-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <BookmarkCheck className="h-5 w-5 text-primary" />
                Saved for Later ({savedItems.length})
              </h2>
              <div className="space-y-3">
                {savedItems.map((saved) => (
                  <Card key={saved.productId} className="overflow-hidden border-dashed">
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-center">
                        <Link
                          href={`/product/${saved.slug || saved.productId}`}
                          className="flex-shrink-0"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={saved.image || PLACEHOLDER_IMAGE}
                              alt={saved.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                              }}
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground line-clamp-1">{saved.name}</h4>
                          <p className="text-primary font-semibold text-sm">₱{saved.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => handleMoveToCart(saved)}>
                              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                              Move to Cart
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveSaved(saved.productId, saved.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
              {items.length} {items.length === 1 ? "item" : "items"} in your
              cart
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
                  This will remove all {items.length} items from your cart. This
                  action cannot be undone.
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
          <div className="lg:col-span-2">
            {/* Select All Checkbox - Sticky */}
            <div className="sticky top-[95px] z-[100] mb-4">
              <Card className="bg-background border-b-2 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCount === items.length && items.length > 0}
                        onCheckedChange={selectAllItems}
                        id="select-all"
                        className="h-5 w-5"
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        Select All ({items.length})
                      </label>
                    </div>
                    {selectedCount > 0 && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {selectedCount} selected
                        </span>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={moveToWishlist}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Move to Wishlist
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {items.map((item) => {
                const isSelected = selectedItems.has(item.productId);
                return (
                  <Card key={item.productId} className={`overflow-hidden transition-colors ${isSelected ? "border-primary bg-secondary" : ""
                    }`}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="flex items-center flex-shrink-0 pt-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleItemSelection(item.productId)}
                            className="h-5 w-5"
                            aria-label={`Select ${item.name}`}
                          />
                        </div>
                        {/* Product Image */}
                        <Link
                          href={`/product/${item.slug || item.productId}`}
                          className="flex-shrink-0"
                        >
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={item.image || PLACEHOLDER_IMAGE}
                              alt={item.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  PLACEHOLDER_IMAGE;
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
                              by{" "}
                              {typeof item.grower === "object"
                                ? (item.grower as { name?: string }).name
                                : item.grower}
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
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity - 1,
                                  )
                                }
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
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity + 1,
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleRemoveItem(item.productId, item.name)
                              }
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
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link href="/shop">
                <Button variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Saved for Later Section */}
            {savedItems.length > 0 && (
              <div className="pt-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                  Saved for Later ({savedItems.length})
                </h2>
                <div className="space-y-3">
                  {savedItems.map((saved) => (
                    <Card key={saved.productId} className="overflow-hidden border-dashed">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Link
                            href={`/product/${saved.slug || saved.productId}`}
                            className="flex-shrink-0"
                          >
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={saved.image || PLACEHOLDER_IMAGE}
                                alt={saved.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                                }}
                              />
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${saved.slug || saved.productId}`}>
                              <h4 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                                {saved.name}
                              </h4>
                            </Link>
                            <p className="text-primary font-semibold text-sm mt-0.5">
                              ₱{saved.price.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveToCart(saved)}
                              >
                                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                Move to Cart
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveSaved(saved.productId, saved.name)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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
                {/* Free Shipping Progress Bar */}
                {(() => {
                  const FREE_DELIVERY_THRESHOLD = 500;
                  const progress = Math.min((summary.subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
                  const remaining = FREE_DELIVERY_THRESHOLD - summary.subtotal;
                  return (
                    <div className="space-y-2">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {remaining > 0 ? (
                        <p className="text-xs text-muted-foreground text-center">
                          You are <span className="font-semibold text-foreground">₱{remaining.toLocaleString()}</span> away from free delivery!
                        </p>
                      ) : (
                        <p className="text-xs text-primary text-center font-medium flex items-center justify-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          You qualify for free delivery!
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Summary Lines */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({selectedItemCount} {selectedItemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium">
                      ₱{selectedSubtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium text-muted-foreground">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₱{selectedSubtotal.toLocaleString()}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  disabled={selectedCount === 0}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="text-xs">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-xs">Buyer Protection</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    <span className="text-xs">Fast Delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cross-Sell Section */}
        <CrossSell excludeIds={items.map((item) => item.id)} />
      </div>
    </div>
  );
}
