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
import { getCartCookie, setCartCookie, clearCartCookie } from "@/lib/cookies";
import { stockSync } from "@/lib/product/stock-sync";
import { logger } from "@/lib/logger";

interface CartContextType {
  items: CartItem[];
  summary: OrderSummary;
  loading: boolean;
  error: string | null;
  addToCart: (product: AddToCartProduct, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  removeVendorItems: (vendorName: string) => void;
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

  // Load cart from cookie on mount
  useEffect(() => {
    logger.debug("[CartContext] Loading cart from cookie...");
    const savedCart = getCartCookie();
    logger.debug("[CartContext] savedCart:", savedCart ? "found" : "not found");
    if (savedCart) {
      try {
        logger.debug("[CartContext] Parsed cart:", savedCart);
        // Check version for migration
        if (savedCart.version === 2 && Array.isArray(savedCart.items)) {
          logger.debug("[CartContext] Loading", savedCart.items.length, "items");
          setItems(savedCart.items);
        } else {
          // Old cart format - clear it
          logger.debug("[CartContext] Old cart format detected, clearing cart");
          clearCartCookie();
        }
      } catch (error) {
        logger.error("[CartContext] Failed to load cart from cookie", error);
      }
    }
    setIsLoaded(true);
    logger.debug("[CartContext] Cart loaded, isLoaded set to true");
  }, []);

  // Save cart to cookie whenever it changes
  useEffect(() => {
    if (isLoaded) {
      logger.debug("[CartContext] Saving to cookie, items:", items.length);
      setCartCookie({
        version: 2,
        items,
        updatedAt: new Date().toISOString(),
      });
      logger.debug("[CartContext] Saved to cookie");
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
    const tax = 0; // No tax - direct to grower
    const shipping = 0; // Shipping calculated at checkout based on delivery method
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
    logger.debug("[CartContext] addToCart called:", { product, quantity, currentItems: items.length });
    
    // Validate stock
    if (product.stock < quantity) {
      toast.error("Not enough stock available", {
        description: `Only ${product.stock} items available`,
      });
      return false;
    }

    // Check existing item in current state
    const existingItem = items.find((item) => item.productId === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error(`Cannot add more items`, {
          description: `Only ${product.stock} available, you have ${existingItem.quantity} in cart`,
        });
        return false;
      }
    }

    setItems((prev) => {
      // Re-check existing in prev state (in case of race, though unlikely here)
      const currentExisting = prev.find((item) => item.productId === product.id);
      
      if (currentExisting) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Add new item with full product details
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        stock: product.stock,
        quantity,
        grower: product.grower,
        unit: product.unit,
        comparePrice: product.comparePrice,
      };

      return [...prev, newItem];
    });

    // Optimistically decrement visible stock immediately
    try {
      stockSync.adjustLocalStock(product.id, -quantity);
      stockSync.enqueue(product.id, -quantity);
    } catch (e) {
      console.warn("[CartContext] stockSync adjust/enqueue failed", e);
    }

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

  const removeVendorItems = useCallback((vendorName: string) => {
    setItems((prev) => {
      const remainingItems = prev.filter((item) => {
        const itemVendor = item.grower || "MASH";
        return itemVendor !== vendorName;
      });
      
      const removedCount = prev.length - remainingItems.length;
      if (removedCount > 0) {
        toast.success(`${removedCount} item(s) from ${vendorName} removed from cart`);
      }
      
      return remainingItems;
    });
  }, []);

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
    removeVendorItems,
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
