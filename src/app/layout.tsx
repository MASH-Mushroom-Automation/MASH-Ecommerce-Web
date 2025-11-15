import { Roboto } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "MASH Marketplace - Fresh Mushrooms from Local Growers",
  description:
    "Connect with local mushroom growers and discover fresh, sustainable mushrooms delivered to your door.",
  icons: {
    icon: "/favicon.ico",
  },
};

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={roboto.variable} suppressHydrationWarning>
        <body className="font-roboto antialiased">
          <ClientLayout>{children}</ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
