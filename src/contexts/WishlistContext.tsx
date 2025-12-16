"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mash-wishlist");
    if (stored) {
      try {
        setWishlistIds(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("mash-wishlist", JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isLoaded]);

  // Listen for storage changes (e.g., logout clears localStorage from another context)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mash-wishlist") {
        if (e.newValue === null) {
          // Wishlist was cleared (logout)
          setWishlistIds([]);
        } else {
          // Wishlist was updated from another tab
          try {
            setWishlistIds(JSON.parse(e.newValue));
          } catch {
            // Ignore parse errors
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
    // Also clear from localStorage immediately
    localStorage.removeItem("mash-wishlist");
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
