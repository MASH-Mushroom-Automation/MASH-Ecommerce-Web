"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { CartItem, OrderSummary, AddToCartProduct } from "@/types/api";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { FirebaseCartService } from "@/lib/firebase/cart";

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
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastSyncRef = useRef<number>(0);

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
      localStorage.setItem(
        "mash-cart",
        JSON.stringify({
          version: 2,
          items,
          updatedAt: new Date().toISOString(),
        })
      );
    }
  }, [items, isLoaded]);

  // Firebase sync: Subscribe to cart changes when user logs in
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Unsubscribe if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    // Merge local cart with Firebase cart on login
    const initializeFirebaseCart = async () => {
      setIsSyncing(true);
      try {
        const mergedItems = await FirebaseCartService.mergeWithLocalCart(
          user.id,
          items
        );
        setItems(mergedItems);
        lastSyncRef.current = Date.now();
      } catch (error) {
        console.error("Failed to merge carts:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    initializeFirebaseCart();

    // Subscribe to real-time updates
    unsubscribeRef.current = FirebaseCartService.subscribeToCart(
      user.id,
      (firebaseItems) => {
        // Only update if this isn't from our own write
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        if (timeSinceLastSync > 1000) {
          setItems(firebaseItems);
        }
      },
      (error) => {
        console.error("Firebase cart subscription error:", error);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync to Firebase whenever cart changes (debounced)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isLoaded || isSyncing) return;

    // Additional validation to prevent undefined userId
    const userId = user.id;
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn("[CartContext] Skipping sync - invalid userId:", userId);
      return;
    }

    const timeout = setTimeout(() => {
      lastSyncRef.current = Date.now();
      FirebaseCartService.saveCart(userId, items).catch((error) => {
        console.error("Failed to sync cart to Firebase:", error);
      });
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timeout);
  }, [items, isAuthenticated, user?.id, isLoaded, isSyncing]);

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

      // Add new item with full product details (sanitize optional fields)
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        stock: product.stock,
        quantity,
      };

      // Only include optional fields if they have values
      if (product.grower !== undefined && product.grower !== null) {
        newItem.grower = product.grower;
      }
      if (product.unit !== undefined && product.unit !== null) {
        newItem.unit = product.unit;
      }
      if (product.comparePrice !== undefined && product.comparePrice !== null) {
        newItem.comparePrice = product.comparePrice;
      }

      return [...prev, newItem];
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

  const clearCart = useCallback(() => {
    setItems([]);
    toast.info("Cart cleared");

    // Also clear Firebase cart if authenticated
    if (isAuthenticated && user?.id) {
      FirebaseCartService.clearCart(user.id).catch((error) => {
        console.error("Failed to clear Firebase cart:", error);
      });
    }
  }, [isAuthenticated, user?.id]);

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
