"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { getWishlistCookie, setWishlistCookie, clearWishlistCookie } from "@/lib/cookies";
import { useAuth } from "./AuthContext";
import { FirebaseWishlistService } from "@/lib/firebase/wishlist";
import type { WishlistItem } from "@/lib/firebase/wishlist";

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
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastSyncRef = useRef<number>(0);

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
      setWishlistCookie({
        version: 2,
        items: wishlistIds,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [wishlistIds, isLoaded]);

  // Firebase sync: Subscribe to wishlist changes when user logs in
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      // Unsubscribe if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    const userId = user.id;
    if (!userId || userId === "undefined" || userId === "null") {
      return;
    }

    // Merge cookie wishlist with Firebase wishlist on login
    const initializeFirebaseWishlist = async () => {
      setIsSyncing(true);
      try {
        // Read cookie directly to avoid stale state from effect ordering
        const cookieWishlist = getWishlistCookie();
        const cookieIds: string[] =
          cookieWishlist?.version === 2 && Array.isArray(cookieWishlist.items)
            ? cookieWishlist.items
            : wishlistIds;

        // Convert cookie IDs to WishlistItemInput format for merge
        const localItems = cookieIds.map((id) => ({
          productId: id,
          name: id,
          price: 0,
        }));

        if (localItems.length > 0) {
          await FirebaseWishlistService.mergeLocalStorageWishlist(userId, localItems);
        }

        // Fetch the full Firebase wishlist and extract product IDs
        const firebaseItems = await FirebaseWishlistService.getWishlist(userId);
        const firebaseIds = firebaseItems.map((item: WishlistItem) => item.productId);

        // Merge: union of local + Firebase IDs
        const mergedIds = Array.from(new Set([...cookieIds, ...firebaseIds]));
        setWishlistIds(mergedIds);
        lastSyncRef.current = Date.now();
      } catch (error) {
        console.error("[WishlistContext] Failed to merge wishlists:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    initializeFirebaseWishlist();

    // Subscribe to real-time updates
    unsubscribeRef.current = FirebaseWishlistService.subscribeToWishlist(
      userId,
      (firebaseItems: WishlistItem[]) => {
        // Only update if this isn't from our own write
        const timeSinceLastSync = Date.now() - lastSyncRef.current;
        if (timeSinceLastSync > 1000) {
          const firebaseIds = firebaseItems.map((item) => item.productId);
          setWishlistIds(firebaseIds);
        }
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync to Firebase whenever wishlist changes (debounced)
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isLoaded || isSyncing) return;

    const userId = user.id;
    if (!userId || userId === "undefined" || userId === "null") return;

    const timeout = setTimeout(async () => {
      lastSyncRef.current = Date.now();
      try {
        // Get current Firebase wishlist
        const firebaseItems = await FirebaseWishlistService.getWishlist(userId);
        const firebaseIds = new Set(firebaseItems.map((item) => item.productId));

        // Add items that are in local but not in Firebase
        for (const id of wishlistIds) {
          if (!firebaseIds.has(id)) {
            await FirebaseWishlistService.addItem(userId, {
              productId: id,
              name: id,
              price: 0,
            });
          }
        }

        // Remove items that are in Firebase but not in local
        const localIdSet = new Set(wishlistIds);
        for (const item of firebaseItems) {
          if (!localIdSet.has(item.productId)) {
            await FirebaseWishlistService.removeItem(userId, item.id);
          }
        }
      } catch (error) {
        console.error("[WishlistContext] Failed to sync wishlist to Firebase:", error);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [wishlistIds, isAuthenticated, user?.id, isLoaded, isSyncing]);

  // Listen for cookie changes across tabs (guest users only)
  useEffect(() => {
    // In test environment, polling is disabled unless tests explicitly opt in
    if (process.env.NODE_ENV === 'test' && !(globalThis as any).__ENABLE_COOKIE_POLLING_IN_TESTS) return;

    // Skip cookie polling for authenticated users (Firebase handles sync)
    if (isAuthenticated) return;

    const handleCookieChange = () => {
      const savedWishlist = getWishlistCookie();
      if (!savedWishlist) {
        setWishlistIds([]);
      } else if (savedWishlist.version === 2 && Array.isArray(savedWishlist.items)) {
        setWishlistIds(savedWishlist.items);
      }
    };

    const interval = setInterval(handleCookieChange, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
    clearWishlistCookie();

    // Also clear Firebase wishlist if authenticated
    if (isAuthenticated && user?.id) {
      FirebaseWishlistService.clearWishlist(user.id).catch((error) => {
        console.error("[WishlistContext] Failed to clear Firebase wishlist:", error);
      });
    }
  }, [isAuthenticated, user?.id]);

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
