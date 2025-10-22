// Custom hook for cart management
import { useState, useEffect } from "react";
import { CartItem, OrderSummary } from "@/types/api";

export interface CartState {
  items: CartItem[];
  summary: OrderSummary;
  loading: boolean;
  error: string | null;
}

export function useCart() {
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    summary: {
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
    },
    loading: false,
    error: null,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartState((prev) => ({
          ...prev,
          items: parsedCart.items || [],
          summary: calculateSummary(parsedCart.items || []),
        }));
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify({ items: cartState.items }));
  }, [cartState.items]);

  const calculateSummary = (items: CartItem[]): OrderSummary => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.12; // 12% tax
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₱500
    const total = subtotal + tax + shipping;

    return {
      items,
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
    setCartState((prev) => {
      const existingItemIndex = prev.items.findIndex(
        (item) => item.productId === productId
      );
      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        newItems = [...prev.items];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems = [...prev.items, { productId, price, quantity }];
      }

      return {
        ...prev,
        items: newItems,
        summary: calculateSummary(newItems),
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCartState((prev) => {
      const newItems = prev.items.filter(
        (item) => item.productId !== productId
      );
      return {
        ...prev,
        items: newItems,
        summary: calculateSummary(newItems),
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartState((prev) => {
      const newItems = prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      return {
        ...prev,
        items: newItems,
        summary: calculateSummary(newItems),
      };
    });
  };

  const clearCart = () => {
    setCartState((prev) => ({
      ...prev,
      items: [],
      summary: {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      },
    }));
  };

  return {
    ...cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
