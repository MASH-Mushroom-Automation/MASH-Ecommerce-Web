# MASH E-Commerce Platform - AI Agent Guide

> **Stack:** Next.js 16 (Turbopack) · Sanity CMS · Firebase Auth · NestJS Backend

## Architecture (Data Flow)

```
Frontend (Next.js 16 - :3000)
├─ Sanity CMS    → Products, content, marketing (GROQ queries, CDN-cached)
├─ Firebase      → Google OAuth + Firestore (cart, wishlist, orders, profiles)
├─ NestJS API    → Orders, transactions, email auth (REST, :30000)
└─ localStorage  → Guest cart/wishlist (syncs to Firebase on login)
```

**Route Groups:** `(auth)/`, `(shop)/`, `(user)/`, `(seller)/` - invisible in URLs

## Quick Start

```bash
npm install && npm run dev          # Frontend :3000
cd studio && npm run dev            # Sanity Studio :3333
# Backend (MASH-Backend repo): npm run start:dev → :30000
```

## Critical Patterns

### Data Fetching
```typescript
// Sanity CMS - always use coalesce() for images (dual field names)
import { sanityClient } from "@/lib/sanity/client";
const products = await sanityClient.fetch(`*[_type == "product"]{
  "mainImage": coalesce(mainImage.asset->url, image.asset->url)
}`);

// Backend API - auto-handles JWT from auth-token cookie + 401 refresh
import { apiRequest } from "@/lib/api-client";
const orders = await apiRequest<Order[]>("/orders");
```

### Authentication (Firebase + Backend dual auth)
```typescript
import { useAuth } from "@/contexts/AuthContext";
const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth();
// Token: auth-token cookie | Refresh: localStorage | Auto-refresh on 401
```

### Route Protection (`src/proxy.ts` - Next.js 16 convention)
- **Protected:** `/checkout`, `/seller/*`, `/profile/*`
- **Guest-friendly:** `/wishlist`, `/cart` (localStorage, no auth required)

## Key Locations

| What | Where |
|------|-------|
| Pages | `src/app/(route-group)/path/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| Sanity queries | `src/lib/sanity/queries.ts` |
| CMS schemas | `studio/src/schemaTypes/documents/` |
| Firebase services | `src/lib/firebase/` (auth, cart, orders, users) |
| Types | `src/types/` (sanity.ts, api.ts, cms.ts, admin.ts) |
| Contexts | `src/contexts/` (AuthContext, CartContext, WishlistContext) |
| UI components | `src/components/ui/` (shadcn/Radix) |

## Conventions

- **Imports:** Always `@/` path alias (maps to `src/`)
- **Backend enums:** UPPERCASE (`BUYER`, `GROWER`, `ADMIN`)
- **Cart format:** `{ version: 2, items: [], updatedAt: string }`
- **Sanity:** CDN enabled (`useCdn: true`), projectId: `gerattrr`, dataset: `production`
- **TS errors:** `ignoreBuildErrors: true` (legacy) - fix incrementally

## Component Patterns

```typescript
// UI (shadcn)
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Forms (React Hook Form + Zod)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Styling
import { cn } from "@/lib/utils";
<div className={cn("base", isActive && "active")} />
```

## Common Pitfalls

1. **Sanity images:** Always `coalesce(mainImage.asset->url, image.asset->url)` - dual field names
2. **Cart format:** Version 2 required - clear old: `localStorage.removeItem("mash-cart")`
3. **Backend port:** Default 30000, not 4000 - check `NEXT_PUBLIC_API_URL`
4. **Email endpoints:** Auto-route to local when `EMAIL_SERVICE_ENV=local`
5. **Route groups:** `app/(shop)/shop/page.tsx` → `/shop` URL (not `/(shop)/shop`)
6. **Auth-token cookie:** Only set client-side (`"use client"` directive required)

## Environment Variables (.env.local)

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_API_URL=http://localhost:30000/api/v1
NEXT_PUBLIC_EMAIL_SERVICE_ENV=local  # Routes email endpoints to local backend
NEXT_PUBLIC_ENABLE_API_LOGGING=true  # Debug API routing decisions
```

## Third-Party Integrations

| Service | Location | Purpose |
|---------|----------|---------|
| Lalamove | `src/lib/lalamove/` | Same-day delivery (PH) |
| PayMongo | `src/lib/payment/paymongo.ts` | GCash, GrabPay, Cards |
| Google Maps | `src/lib/maps-config.ts` | Address picker, delivery areas |

## Scripts (`scripts/` folder)

```bash
node scripts/check-sanity-data.js       # Validate CMS data
node scripts/fix-sanity-data-complete.js # Repair broken references
node scripts/complete-product-catalog.js # Seed products
cd studio && node scripts/import-sample-data.js  # Studio data import
```

## AI Automation Tasks (`ai-automation-tasks/`)

Self-hosted AI buyer-seller appointment system (21 tasks, 7 phases).

**Stack:** n8n (workflows) · Ollama/Llama 3.2 (local AI) · ChromaDB (vectors) · Firebase + Sanity

**Task Structure:** Each `ai-###-task-name/` folder contains:
- `README.md` - Task description, dependencies, acceptance criteria
- `PLANNING.md` - Phase breakdown with actionable steps  
- `PROGRESS.md` - Implementation tracking
- `TESTING.md` - Test cases and validation
- `PR-GUIDE.md` - Pull request checklist

**Current Phase:** Foundation (AI-002 n8n setup → AI-003 Ollama → AI-004 Widget UI)

## Deployment

```bash
vercel --prod                    # Production (auto via GitHub Actions)
cd studio && npm run deploy      # Sanity Studio → ppnamias.sanity.studio
```

## Documentation

Detailed guides in `.github/`:
- `CART_AND_CHECKOUT_COMPLETE_PLAN.md` - Cart/checkout architecture (20+ phases)
- `VERCEL_DEPLOYMENT_PLAN.md` - Production deployment
- `SANITY_FREE_MIGRATION_PLAN.md` - CMS migration history
- `BUYER_CHECKOUT_FLOW_COMPLETE.md` - Full buyer journey (Firebase-first)
