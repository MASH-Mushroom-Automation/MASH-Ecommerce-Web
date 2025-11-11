"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SellerSidebar } from "@/components/seller-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  const titleMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'products': 'Products',
    'inventory': 'Inventory',
    'orders': 'Orders',
    'address': 'Address Management',
    'handover': 'Handover Center',
    'refund': 'Refunds',
    'settings': 'Settings',
  };
  
  return titleMap[lastSegment] || 'Seller Center';
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStartSellingPage = pathname === "/start-selling";

  if (isStartSellingPage) {
    return (
      <div className="min-h-screen bg-white">
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-6">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div
        className="flex w-full"
        style={{ minHeight: "calc(100vh - var(--seller-header-height, 88px))" }}
      >
        <SellerSidebar className="md:top-[calc(var(--seller-header-height,88px)+3px)] md:h-[calc(100vh-var(--seller-header-height,88px)-2px)] md:p-0" />
        <SidebarInset
          className="flex-1 md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none"
          style={{ minHeight: "calc(100vh - var(--seller-header-height, 88px))" }}
        >
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/seller/dashboard">
                      Seller Center
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getPageTitle(pathname)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
