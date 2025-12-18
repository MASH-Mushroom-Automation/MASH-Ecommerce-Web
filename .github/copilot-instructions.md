# MASH E-Commerce Platform - AI Agent Guide

> **Stack:** Next.js 15 (Turbopack) + Sanity CMS + Firebase Auth + NestJS Backend

## Architecture Overview

```
Frontend (Next.js 15 - Port 3000)
├── Sanity CMS → Products, content, marketing (GROQ queries)
├── Firebase   → Google OAuth + Firestore user profiles
├── NestJS API → Orders, transactions, email auth (REST on port 4000)
└── LocalStorage → Cart, wishlist (guest-friendly, no auth required)
```

**Route Groups** (invisible in URLs): `(auth)/`, `(shop)/`, `(user)/`, `(seller)/`

## Quick Start

```bash
npm install && npm run dev          # Frontend: http://localhost:3000
cd studio && npm run dev            # Sanity Studio: http://localhost:3333
```

Backend (MASH-Backend folder): `npm install --legacy-peer-deps && npm run start:dev` on port 4000.

## Data Flow Patterns

```typescript
// Sanity CMS - products, categories, blog (src/lib/sanity/queries.ts)
import { sanityClient } from "@/lib/sanity/client";
import { productsQuery } from "@/lib/sanity/queries";
const products = await sanityClient.fetch(productsQuery);

// Backend API - orders, user data (src/lib/api-client.ts)
// Auto-routes email endpoints to local backend when EMAIL_SERVICE_ENV=local
import { apiRequest } from "@/lib/api-client";
const orders = await apiRequest<Order[]>("/orders");

// Transform Sanity→Component types (src/types/sanity.ts)
import { transformSanityProduct } from "@/types/sanity";
```

## Authentication System

Dual auth with unified `AuthContext` (src/contexts/AuthContext.tsx):

```typescript
import { useAuth } from "@/contexts/AuthContext";
const { user, isAuthenticated, signInWithGoogle, signInWithEmailPassword } = useAuth();
```

- **Google OAuth**: Firebase → Firestore profile → optional backend JWT sync
- **Email/Password**: Firebase Auth with email verification via backend
- **Token storage**: `auth-token` cookie (managed by `src/lib/auth.ts`)

**Protected routes** (root `middleware.ts`): `/checkout`, `/seller/*`, `/profile/*`

## Key Files

| Purpose | Location |
|---------|----------|
| Pages | `src/app/(route-group)/path/page.tsx` |
| Sanity queries | `src/lib/sanity/queries.ts` |
| API client | `src/lib/api-client.ts` (dual backend routing) |
| CMS schemas | `studio/src/schemaTypes/documents/` |
| Types | `src/types/` (sanity.ts, api.ts) |
| UI components | `src/components/ui/` (shadcn/Radix) |
| Contexts | `src/contexts/` (Auth, Cart, Wishlist) |

## Critical Conventions

1. **Middleware location**: Root `middleware.ts` ONLY (never `src/middleware.ts`)
2. **Backend role enums**: UPPERCASE strings (`USER`, `BUYER`, `GROWER`, `ADMIN`)
3. **Sanity images**: Always use `coalesce(mainImage.asset->url, image.asset->url)` in GROQ
4. **Imports**: Use `@/` path alias (maps to `src/`)
5. **Forms**: React Hook Form + Zod validation

## Component Patterns

```typescript
// shadcn/Radix UI components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// Tailwind class merging
import { cn } from "@/lib/utils";
<div className={cn("base-class", conditional && "conditional-class")} />
```

## Common Pitfalls

- Route groups don't affect URLs: `app/(shop)/shop/` → `/shop`
- Cart/wishlist work for guests (localStorage) - never require auth
- API client routes email endpoints (`/auth/register`, `/auth/verify-*`) to local backend when `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local`
- Sanity slug can be `string` or `{current: string}` - check both in types
