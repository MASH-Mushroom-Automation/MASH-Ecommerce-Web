"use client";

import { Header } from "@/components/layout/header";
import { SimpleHeader } from "@/components/layout/simple-header";
import { SellerHeader } from "@/components/layout/seller-header";
import { Footer } from "@/components/layout/footer";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from "next/navigation";

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

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isSellerRoute = SELLER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen flex flex-col">
          {isAuthRoute ? (
            <SimpleHeader />
          ) : isSellerRoute ? (
            <SellerHeader />
          ) : (
            <Header />
          )}
          <main className="flex-1">{children}</main>
          <Footer />
          {/* Global toast portal */}
          <Toaster position="top-right" richColors closeButton />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
