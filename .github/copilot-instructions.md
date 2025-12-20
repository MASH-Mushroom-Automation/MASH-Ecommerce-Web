# MASH E-Commerce Platform - AI Agent Guide

> **Stack:** Next.js 15 (Turbopack) + Sanity CMS + Firebase Auth + NestJS Backend

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 15 - Port 3000)                              │
├─────────────────────────────────────────────────────────────────┤
│  Sanity CMS ←→ Products, content, marketing (GROQ queries)     │
│  Firebase   ←→ Google OAuth + Firestore user profiles          │
│  NestJS API ←→ Orders, transactions, email auth (REST)         │
│  LocalStorage → Cart, wishlist (guest-friendly)                │
└─────────────────────────────────────────────────────────────────┘
```

**Route Groups** (invisible in URLs): `(auth)/`, `(shop)/`, `(user)/`, `(seller)/`

## Quick Start

```bash
npm install && npm run dev          # Frontend: http://localhost:3000
cd studio && npm run dev            # Sanity Studio: http://localhost:3333
```

Backend (separate repo `MASH-Backend`): `npm run start:dev` on port 4000.

## Data Fetching Patterns

```typescript
// Sanity CMS - products, categories, blog
import { sanityClient } from "@/lib/sanity/client";
import { productsQuery } from "@/lib/sanity/queries";
const products = await sanityClient.fetch(productsQuery);

// Backend API - orders, user data (auto JWT from auth-token cookie)
import { apiRequest } from "@/lib/api-client";
const orders = await apiRequest<Order[]>("/orders");

// Transform Sanity data for components
import { transformSanityProduct } from "@/types/sanity";
const transformed = transformSanityProduct(sanityProduct);
```

## Authentication System

Dual auth with unified `AuthContext`:

```typescript
import { useAuth } from "@/contexts/AuthContext";
const { user, isAuthenticated, signInWithGoogle, signInWithEmailPassword, signOut } = useAuth();
```

- **Google OAuth**: Firebase → Firestore profile → optional backend JWT sync
- **Email/Password**: Firebase Auth with email verification
- **Token storage**: `auth-token` cookie (managed by `src/lib/auth.ts`)

**Protected routes** (defined in root `middleware.ts`): `/checkout`, `/seller/*`, `/profile/*`

## Key File Locations

| Purpose | Location |
|---------|----------|
| Pages | `src/app/(route-group)/path/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| Sanity queries | `src/lib/sanity/queries.ts` |
| CMS schemas | `studio/src/schemaTypes/documents/` |
| Types | `src/types/` (sanity.ts, api.ts, cms.ts) |
| UI components | `src/components/ui/` (shadcn/Radix) |
| Contexts | `src/contexts/` (Auth, Cart, Wishlist) |

## Critical Conventions

1. **Middleware location**: Root `middleware.ts` only (NOT `src/middleware.ts`)
2. **Backend enums**: UPPERCASE (`USER`, `BUYER`, `GROWER`, `ADMIN`)
3. **Sanity images**: Use `coalesce(mainImage.asset->url, image.asset->url)` in GROQ
4. **TypeScript**: `ignoreBuildErrors: true` in `next.config.ts` (legacy)
5. **Documentation**: All plans/guides go in `.github/` folder
6. **Imports**: Use `@/` path alias (maps to `src/`)

## Component Patterns

```typescript
// UI components use shadcn/Radix - import from @/components/ui
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Class merging utility
import { cn } from "@/lib/utils";
<div className={cn("base-class", conditional && "conditional-class")} />

// Forms: React Hook Form + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
```

## Environment Variables

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_EMAIL_SERVICE_ENV=local  # Routes email endpoints to local backend
```

## Common Pitfalls

- Route groups don't affect URLs: `app/(shop)/shop/` → `/shop`
- Cart/wishlist work for guests (localStorage) - don't require auth
- Sanity CDN enabled for quota limits - changes need manual refresh
- API client auto-routes email endpoints to local backend when `EMAIL_SERVICE_ENV=local`

## Extended Documentation

See `.github/` for detailed guides: `FIREBASE_GOOGLE_SIGNIN_SETUP.md`, `CART_AND_CHECKOUT_COMPLETE_PLAN.md`, `VERCEL_DEPLOYMENT_PLAN.md`
