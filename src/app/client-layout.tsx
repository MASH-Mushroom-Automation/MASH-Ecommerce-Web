"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SimpleHeader } from "@/components/layout/simple-header";
import { SellerHeader } from "@/components/layout/seller-header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav, MobileBottomNavSpacer } from "@/components/layout/mobile-bottom-nav";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { usePathname } from "next/navigation";
import { initGA, logPageView } from "@/lib/analytics";

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
  "/profile",
  "/checkout",
  "/onboarding",
];

const SELLER_ROUTES = ["/seller", "/start-selling"];

export function ClientLayout({ children }: { children: React.Node }) {
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isSellerRoute = SELLER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      logPageView(pathname);
    }
  }, [pathname]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {isSellerRoute ? (
              // Seller routes get header and handle their own layout with sidebar
              <div className="min-h-screen flex flex-col">
                <SellerHeader />
                {children}
                <Toaster position="bottom-center" richColors closeButton />
              </div>
            ) : (
              // Regular routes get full layout with header, footer, and nav
              <div className="min-h-screen flex flex-col">
                {isAuthRoute ? <SimpleHeader /> : <Header />}
                <main className="flex-1">
                  {children}
                  <MobileBottomNavSpacer />
                </main>
                <Footer />
                <MobileBottomNav />
                <Toaster position="bottom-center" richColors closeButton />
              </div>
            )}
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
