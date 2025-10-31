"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, OrderSummary } from "@/types/api";

interface CartContextType {
  items: CartItem[];
  summary: OrderSummary;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, price: number, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart.items || []);
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify({ items }));
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

    return {
      items: cartItems,
      subtotal,
      tax,
      shipping,
      total,
    };
  };

  const addToCart = (
    productId: string,
    price: number,
    quantity: number = 1
  ) => {
    setItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.productId === productId
      );
      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        newItems = [...prev];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems = [...prev, { productId, price, quantity }];
      }

      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const value: CartContextType = {
    items,
    summary: calculateSummary(items),
    loading: false,
    error: null,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
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
