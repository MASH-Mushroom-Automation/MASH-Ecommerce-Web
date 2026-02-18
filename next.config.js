const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  // Packages that need to be transpiled (needed for Jest transformIgnorePatterns via nextJest)
  transpilePackages: ['nuqs', 'next-sanity', '@sanity/client', '@sanity/image-url', 'groq'],
  // Explicitly set Turbopack root to this project directory
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Remove console logs in production (keep errors and warnings)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" 
      ? { exclude: ["error", "warn"] } 
      : false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        pathname: "/maps/api/staticmap**",
      },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i3.ytimg.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/drkcpvmfc/**" },
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
  // Security headers including CSP for Cal.com embed
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://apis.google.com https://www.gstatic.com https://www.google.com https://www.googletagmanager.com https://cdn.sanity.io https://cal.com https://*.cal.com https://app.cal.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.recaptcha.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cal.com https://*.cal.com https://app.cal.com",
              "img-src 'self' data: https: blob: https://*.cloudinary.com",
              "font-src 'self' data: https://fonts.gstatic.com https://cal.com https://*.cal.com",
              "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* https://*.firebaseapp.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google.com https://lalamove.com https://api.paymongo.com https://api.mashmarket.app https://cdn.sanity.io https://gerattrr.api.sanity.io https://gerattrr.apicdn.sanity.io https://router.huggingface.co https://cal.com https://*.cal.com https://app.cal.com https://generativelanguage.googleapis.com https://*.cloudinary.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://recaptcha.google.com https://www.recaptcha.net",
              "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://www.google.com https://maps.app.goo.gl https://www.google.com/maps https://cal.com https://*.cal.com https://app.cal.com https://www.google.com/recaptcha/ https://recaptcha.google.com https://www.recaptcha.net",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=()",
          },
        ],
      },
    ];
  },
  // Redirects for old/deprecated routes
  async redirects() {
    return [
      {
        source: "/sell-with-us",
        destination: "/start-selling",
        permanent: true,
      },
      { source: "/catalog", destination: "/shop", permanent: true },
    ];
  },
};
