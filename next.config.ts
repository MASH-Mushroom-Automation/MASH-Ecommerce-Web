import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly set Turbopack root to this project directory
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        pathname: "/maps/api/staticmap**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "i3.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // TODO: Fix remaining TypeScript errors before production deployment
  // Currently set to true to allow deployment while errors are being resolved
  typescript: {
    ignoreBuildErrors: true,
  },
  // Redirects for old/deprecated routes
  async redirects() {
    return [
      {
        source: "/sell-with-us",
        destination: "/start-selling",
        permanent: true, // 301 redirect for SEO
      },
      {
        source: "/catalog",
        destination: "/shop",
        permanent: true, // 301 redirect for SEO (catalog → shop)
      },
    ];
  },
};

export default nextConfig;
