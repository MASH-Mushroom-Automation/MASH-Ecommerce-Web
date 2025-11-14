"use client";

import { useMemo } from "react";
import { useUserProfile } from "./useUser";
import { isAuthenticated } from "@/lib/auth";

export interface NavItem {
  label: string;
  path: string;
  icon?: any;
  badge?: number;
}

export function useNavigation() {
  const { profile } = useUserProfile();
  const isLoggedIn = isAuthenticated();

  const navItems = useMemo(() => {
    const baseItems: NavItem[] = [
      { label: "Home", path: "/" },
      { label: "Products", path: "/shop" },
      { label: "Growers", path: "/grower" },
    ];

    // Not logged in - show login
    if (!isLoggedIn) {
      return baseItems;
    }

    // Seller - show seller dashboard links
    if (profile?.sellerStatus === "approved") {
      return [
        ...baseItems,
        { label: "Dashboard", path: "/seller/dashboard" },
        { label: "My Products", path: "/seller/products" },
        { label: "Orders", path: "/seller/orders" },
      ];
    }

    // Pending seller application
    if (profile?.sellerStatus === "pending") {
      return [
        ...baseItems,
        { label: "Application Pending", path: "/start-selling" },
      ];
    }

    // Regular buyer - show order history and wishlist
    return [
      ...baseItems,
      { label: "My Orders", path: "/profile/order-history" },
      { label: "Wishlist", path: "/wishlist" },
    ];
  }, [isLoggedIn, profile?.sellerStatus]);

  return { navItems, isLoggedIn, isSeller: profile?.sellerStatus === "approved" };
}
