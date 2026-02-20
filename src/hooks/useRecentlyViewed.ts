"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "mash-recently-viewed";
const MAX_ITEMS = 20;

export interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(
    []
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, isLoaded]);

  const trackView = useCallback(
    (productId: string) => {
      if (!isLoaded) return;

      setRecentlyViewed((prev) => {
        // Remove existing entry for this product (dedup)
        const filtered = prev.filter((item) => item.productId !== productId);

        // Add to front (most recent first)
        const updated = [
          { productId, viewedAt: new Date().toISOString() },
          ...filtered,
        ];

        // Enforce max limit
        return updated.slice(0, MAX_ITEMS);
      });
    },
    [isLoaded]
  );

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const recentProductIds = recentlyViewed.map((item) => item.productId);

  return {
    recentlyViewed,
    recentProductIds,
    trackView,
    clearRecentlyViewed,
    isLoaded,
  };
}
