import { Roboto } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import type { Metadata } from "next";
import { getSiteSettingsForMetadata } from "@/lib/sanity/siteSettings";

/**
 * Generate dynamic metadata from Sanity CMS site settings
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsForMetadata();
  
  return {
    title: settings?.seo?.metaTitle || settings?.companyName || "MASH Marketplace - Fresh Mushrooms from Local Growers",
    description: settings?.seo?.metaDescription || settings?.description || "Connect with local mushroom growers and discover fresh, sustainable mushrooms delivered to your door.",
    keywords: settings?.seo?.keywords || ["mushrooms", "fresh mushrooms", "local growers", "organic mushrooms", "Metro Manila"],
    icons: {
      icon: settings?.favicon || "/favicon.ico",
    },
    openGraph: {
      title: settings?.seo?.metaTitle || settings?.companyName || "MASH Marketplace",
      description: settings?.seo?.metaDescription || settings?.description || "Fresh mushrooms from local growers",
      images: settings?.seo?.ogImage ? [settings.seo.ogImage] : [],
      siteName: settings?.companyName || "MASH Marketplace",
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.seo?.metaTitle || settings?.companyName || "MASH Marketplace",
      description: settings?.seo?.metaDescription || settings?.description || "Fresh mushrooms from local growers",
      images: settings?.seo?.ogImage ? [settings.seo.ogImage] : [],
    },
  };
}

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
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <body className="font-roboto antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
