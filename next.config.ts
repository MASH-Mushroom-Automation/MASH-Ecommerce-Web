import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
  // Temporarily ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optionally also ignore ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Redirects for old/deprecated routes
  async redirects() {
    return [
      {
        source: '/sell-with-us',
        destination: '/start-selling',
        permanent: true, // 301 redirect for SEO
      },
      {
        source: '/stores',
        destination: '/catalog',
        permanent: false, // 302 redirect (temporary)
      },
    ];
  },
};

export default nextConfig;
