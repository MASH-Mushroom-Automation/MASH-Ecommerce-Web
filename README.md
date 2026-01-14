This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Production Deployment

**Live URLs:**
- **Frontend:** https://mash-ecommerce-web-production.up.railway.app
- **Backend API:** https://mash-backend-production.up.railway.app
- **Sanity Studio:** https://ppnamias.sanity.studio
- **Firebase Console:** https://console.firebase.google.com/u/7/project/mash-ddf8d/

## ⚠️ CRITICAL: Build-First Development

**ALWAYS run build before starting development:**

```bash
# 1. MANDATORY: Build first to catch all errors
npm run build

# 2. Fix ALL TypeScript/ESLint errors

# 3. Only then start development
npm run dev
```

**Why this matters:**
- Production deployments will fail if build errors exist
- Catches TypeScript errors early
- Ensures code quality and deployment readiness

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
