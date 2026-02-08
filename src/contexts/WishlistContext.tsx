"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getWishlistCookie, setWishlistCookie, clearWishlistCookie } from "@/lib/cookies";
import { logger } from "@/lib/logger";

interface WishlistContextType {
  wishlistIds: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from cookie on mount
  useEffect(() => {
    const savedWishlist = getWishlistCookie();
    if (savedWishlist) {
      try {
        // Check version for migration
        if (savedWishlist.version === 2 && Array.isArray(savedWishlist.items)) {
          setWishlistIds(savedWishlist.items);
        } else {
          // Old wishlist format - clear it
          clearWishlistCookie();
        }
      } catch (error) {
        console.error("Failed to load wishlist from cookie:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to cookie whenever it changes
  useEffect(() => {
    if (isLoaded) {
      logger.debug("[WishlistContext] Saving to cookie, items:", wishlistIds.length);
      setWishlistCookie({
        version: 2,
        items: wishlistIds,
        updatedAt: new Date().toISOString(),
      });
      logger.debug("[WishlistContext] Saved to cookie");
    }
  }, [wishlistIds, isLoaded]);

  // Listen for cookie changes across tabs
  useEffect(() => {
    // In test environment, polling is disabled unless tests explicitly opt in by setting global.__ENABLE_COOKIE_POLLING_IN_TESTS = true
    if (process.env.NODE_ENV === 'test' && !(globalThis as any).__ENABLE_COOKIE_POLLING_IN_TESTS) return;

    const handleCookieChange = () => {
      const savedWishlist = getWishlistCookie();
      if (!savedWishlist) {
        // Wishlist was cleared
        setWishlistIds([]);
      } else if (savedWishlist.version === 2 && Array.isArray(savedWishlist.items)) {
        // Wishlist was updated from another tab
        setWishlistIds(savedWishlist.items);
      }
    };

    // Poll for cookie changes every 2 seconds (cookies don't have storage events)
    const interval = setInterval(handleCookieChange, 2000);
    return () => clearInterval(interval);
  }, []);

  const addToWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
    // Also clear from cookie immediately
    clearWishlistCookie();
  }, []);

  const value: WishlistContextType = {
    wishlistIds,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlistIds.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
