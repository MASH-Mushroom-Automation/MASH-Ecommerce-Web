"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SimpleHeader } from "@/components/layout/simple-header";
import { Footer } from "@/components/layout/footer";
import {
  MobileBottomNav,
  MobileBottomNavSpacer,
} from "@/components/layout/mobile-bottom-nav";
import { BackToTop } from "@/components/common/back-to-top";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getThemeCookie, setThemeCookie } from "@/lib/cookies";
import { usePathname } from "next/navigation";
import { initGA, logPageView } from "@/lib/analytics";
import { SanityVisualEditing } from "@/components/sanity/VisualEditing";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import { QueryProvider } from "@/components/providers/query-provider";
import { ChatProvider } from "@/contexts/ChatContext";
import { Chatbot } from "@/components/chatbot";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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

const SELLER_ROUTES = ["/seller"];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen: isSearchOpen, setIsOpen: setSearchOpen } =
    useSearchShortcut();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isSellerRoute = SELLER_ROUTES.some((route) =>
    pathname.startsWith(route),
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

  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDev && !getThemeCookie()) {
      setThemeCookie("light");
    }
  }, [isDev]);

  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme={isDev ? "light" : "system"}
        enableSystem={!isDev}
        disableTransitionOnChange
      >
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ChatProvider>
                  {isSellerRoute ? (
                    // Seller routes handle their own layout with sidebar and header
                    <div className="min-h-screen flex flex-col">
                      {children}
                      <Toaster
                        position="bottom-center"
                        richColors
                        closeButton
                      />
                      <Chatbot />
                    </div>
                  ) : (
                    // Regular routes get full layout with header, footer, and nav
                    <div className="min-h-screen flex flex-col">
                      <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg"
                      >
                        Skip to main content
                      </a>
                      {isAuthRoute ? <SimpleHeader /> : <Header />}
                      <main id="main-content" className="flex-1" tabIndex={-1}>
                        {children}
                        <MobileBottomNavSpacer />
                      </main>
                      <Footer />
                      <MobileBottomNav />
                      <BackToTop />
                      <Toaster
                        position="bottom-center"
                        richColors
                        closeButton
                      />
                      <Chatbot />
                    </div>
                  )}
                </ChatProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
