"use client";

import { Roboto } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { SimpleHeader } from "@/components/layout/simple-header";
import { SellerHeader } from "@/components/layout/seller-header";
import { Footer } from "@/components/layout/footer";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { usePathname } from "next/navigation";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isSellerRoute = SELLER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const getHeader = () => {
    if (isSellerRoute) return <SellerHeader />;
    if (isAuthRoute) return <SimpleHeader />;
    return <Header />;
  };

  return (
    <html lang="en">
      <head>
        <title>MASH Market</title>
        <meta name="description" content="Mushroom E-Commerce" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/Logo  v6 - Market.png" type="image/png" />
      </head>
      <body className={`${roboto.variable} antialiased`}>
        <WishlistProvider>
          {getHeader()}
          <main className="min-h-screen">{children}</main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}
