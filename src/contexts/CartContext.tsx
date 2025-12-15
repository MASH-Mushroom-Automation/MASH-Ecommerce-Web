"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, OrderSummary, AddToCartProduct } from "@/types/api";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  summary: OrderSummary;
  loading: boolean;
  error: string | null;
  addToCart: (product: AddToCartProduct, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("mash-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Check version for migration
        if (parsedCart.version === 2 && Array.isArray(parsedCart.items)) {
          setItems(parsedCart.items);
        } else {
          // Old cart format - clear it
          console.log("Old cart format detected, clearing cart");
          localStorage.removeItem("mash-cart");
          localStorage.removeItem("cart"); // Old key
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mash-cart", JSON.stringify({ 
        version: 2,
        items,
        updatedAt: new Date().toISOString()
      }));
    }
  }, [items, isLoaded]);

  const calculateSummary = (cartItems: CartItem[]): OrderSummary => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.12; // 12% tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₱500
    const total = subtotal + tax + shipping;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cartItems,
      subtotal,
      tax,
      shipping,
      total,
      itemCount,
    };
  };

  const addToCart = (product: AddToCartProduct, quantity: number = 1): boolean => {
    // Validate stock
    if (product.stock < quantity) {
      toast.error("Not enough stock available", {
        description: `Only ${product.stock} items available`,
      });
      return false;
    }

    setItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);

      if (existingItem) {
        // Check if combined quantity exceeds stock
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.error(`Cannot add more items`, {
            description: `Only ${product.stock} available, you have ${existingItem.quantity} in cart`,
          });
          return prev;
        }
        
        // Update existing item quantity
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Add new item with full product details
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          slug: product.slug,
          stock: product.stock,
          grower: product.grower,
          unit: product.unit,
          comparePrice: product.comparePrice,
          quantity,
        },
      ];
    });

    toast.success(`${product.name} added to cart!`, {
      description: `${quantity} ${product.unit || "item"}(s) added`,
    });

    return true;
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (item) {
        toast.info(`${item.name} removed from cart`);
      }
      return prev.filter((item) => item.productId !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }

    const item = items.find((i) => i.productId === productId);
    if (item && quantity > item.stock) {
      toast.error(`Only ${item.stock} items available`);
      return false;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
    return true;
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared");
  };

  const isInCart = (productId: string): boolean => {
    return items.some((item) => item.productId === productId);
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const value: CartContextType = {
    items,
    summary: calculateSummary(items),
    loading: !isLoaded,
    error: null,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
