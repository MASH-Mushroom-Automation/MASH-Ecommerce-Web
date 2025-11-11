"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User, Sprout, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show on auth pages, seller pages, or checkout
  const hideNav = pathname.startsWith("/login") || 
                  pathname.startsWith("/signup") ||
                  pathname.startsWith("/seller") ||
                  pathname.startsWith("/checkout") ||
                  pathname.startsWith("/onboarding");

  if (hideNav) return null;

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/shop",
      label: "Shop",
      icon: ShoppingBag,
    },
    {
      href: "/grower",
      label: "Growers",
      icon: Sprout,
    },
    {
      href: "/notifications",
      label: "Alerts",
      icon: Bell,
      badge: 3, // This would come from context/state
    },
    {
      href: "/profile",
      label: "Account",
      icon: User,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
                          (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors relative",
                "active:bg-muted",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-6 h-6 transition-transform",
                  isActive && "scale-110"
                )} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Add padding to body to account for bottom nav
export function MobileBottomNavSpacer() {
  const pathname = usePathname();

  const hideNav = pathname.startsWith("/login") || 
                  pathname.startsWith("/signup") ||
                  pathname.startsWith("/seller") ||
                  pathname.startsWith("/checkout");

  if (hideNav) return null;

  return <div className="lg:hidden h-16" />;
}
