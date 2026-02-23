"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SellerSidebar } from "@/components/seller-sidebar";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const titleMap: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Products",
    inventory: "Inventory",
    orders: "Orders",
    reviews: "Review Moderation",
    "my-reviews": "My Reviews",
    analytics: "Review Analytics",
    address: "Address Management",
    handover: "Handover Center",
    refund: "Refunds",
    settings: "Settings",
  };

  return titleMap[lastSegment] || "Seller Center";
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStartSellingPage = pathname === "/start-selling";

  // Allow start-selling page for everyone (no admin guard)
  // This is where users apply to become sellers
  if (isStartSellingPage) {
    return (
      <div className="min-h-screen">
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Admin role verification - only admins can access other seller pages
  const { isAdmin, loading } = useAdminGuard();

  // Show loading state while verifying admin access
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not admin, useAdminGuard will handle redirect automatically
  // Return null to prevent any flash of content
  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div
        className="flex w-full"
      >
        <SellerSidebar />
        <SidebarInset
          className="flex-1 md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
