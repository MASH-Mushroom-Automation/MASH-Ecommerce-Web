import { Roboto } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";
import type { Metadata } from "next";
import { getSiteSettingsForMetadata } from "@/lib/sanity/siteSettings";

/**
 * Content Security Policy for the application
 * This ensures Cal.com embed works properly in development and production
 *
 * IMPORTANT: This meta tag is the PRIMARY CSP source since Turbopack
 * doesn't reliably apply headers() from next.config.js in dev mode.
 */
const cspContent = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://apis.google.com https://www.gstatic.com https://www.google.com https://www.googletagmanager.com https://cdn.sanity.io https://cal.com https://*.cal.com https://app.cal.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.recaptcha.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cal.com https://*.cal.com https://app.cal.com",
  "img-src 'self' data: https: blob: https://*.cloudinary.com",
  "font-src 'self' data: https://fonts.gstatic.com https://cal.com https://*.cal.com",
  "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* https://*.firebaseapp.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google.com https://lalamove.com https://api.paymongo.com https://api.mashmarket.app https://cdn.sanity.io https://gerattrr.api.sanity.io https://gerattrr.apicdn.sanity.io https://router.huggingface.co https://cal.com https://*.cal.com https://app.cal.com https://generativelanguage.googleapis.com https://*.cloudinary.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://recaptcha.google.com https://www.recaptcha.net",
  "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://www.google.com https://maps.app.goo.gl https://www.google.com/maps https://cal.com https://*.cal.com https://app.cal.com https://www.google.com/recaptcha/ https://recaptcha.google.com https://www.recaptcha.net",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/**
 * Generate dynamic metadata from Sanity CMS site settings
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsForMetadata();

  return {
    title:
      settings?.seo?.metaTitle ||
      settings?.companyName ||
      "MASH Marketplace - Fresh Mushrooms from Local Growers",
    description:
      settings?.seo?.metaDescription ||
      settings?.description ||
      "Connect with local mushroom growers and discover fresh, sustainable mushrooms delivered to your door.",
    keywords: settings?.seo?.keywords || [
      "mushrooms",
      "fresh mushrooms",
      "local growers",
      "organic mushrooms",
      "Metro Manila",
    ],
    icons: {
      icon: settings?.favicon || "/favicon.ico",
    },
    openGraph: {
      title:
        settings?.seo?.metaTitle || settings?.companyName || "MASH Marketplace",
      description:
        settings?.seo?.metaDescription ||
        settings?.description ||
        "Fresh mushrooms from local growers",
      images: settings?.seo?.ogImage ? [settings.seo.ogImage] : [],
      siteName: settings?.companyName || "MASH Marketplace",
    },
    twitter: {
      card: "summary_large_image",
      title:
        settings?.seo?.metaTitle || settings?.companyName || "MASH Marketplace",
      description:
        settings?.seo?.metaDescription ||
        settings?.description ||
        "Fresh mushrooms from local growers",
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
      <head>
        {/* CSP meta tag ensures Cal.com embed works in dev mode (Turbopack) */}
        <meta httpEquiv="Content-Security-Policy" content={cspContent} />
      </head>
      <body className="font-roboto antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
