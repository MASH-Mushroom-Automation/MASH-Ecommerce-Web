# MASH E-Commerce Platform - AI Agent Guide

> **Last Updated:** December 10, 2025 | **Stack:** Next.js 15 + Sanity CMS + NestJS Backend

## Quick Start

```bash
npm run dev              # Frontend at localhost:3000 (Turbopack)
cd studio && npm run dev # Sanity Studio at localhost:3333
```

## Architecture Overview

**Three-tier data architecture:**

| Data Source                 | Purpose                      | Access Pattern                        |
| --------------------------- | ---------------------------- | ------------------------------------- |
| **Sanity CMS** (`gerattrr`) | Products, content, marketing | GROQ via `src/lib/sanity/queries.ts`  |
| **NestJS Backend**          | Auth, orders, transactions   | REST via `src/lib/api-client.ts`      |
| **Mock Data** (`data/`)     | Dev fallback                 | When `NEXT_PUBLIC_USE_MOCK_DATA=true` |

**Route Groups** (invisible in URLs):

- `(auth)/` → Login, signup | `(shop)/` → Shop, cart, checkout
- `(user)/` → Profile pages | `(seller)/` → Seller dashboard

## Essential Patterns

### Data Fetching

```typescript
// Sanity CMS - products, content
import { sanityClient } from "@/lib/sanity/client";
import { productsQuery } from "@/lib/sanity/queries";
const products = await sanityClient.fetch(productsQuery);

// Backend API - auth, orders (auto JWT handling)
import { apiRequest } from "@/lib/api-client";
const orders = await apiRequest<ApiResponse<Order[]>>("/orders");
```

### Sanity Image URLs

```typescript
// Always use coalesce for image compatibility
"mainImage": coalesce(mainImage.asset->url, image.asset->url)
```

### Route Protection

Middleware at **root** `middleware.ts` (NOT `src/middleware.ts`):

- Protected: `/checkout`, `/seller/*`, `/profile/*`
- Auth routes redirect if logged in: `/login`, `/signup`

## File Locations

| Task           | Location                              |
| -------------- | ------------------------------------- |
| Add page       | `src/app/(route-group)/path/page.tsx` |
| Add API route  | `src/app/api/resource/route.ts`       |
| Sanity queries | `src/lib/sanity/queries.ts`           |
| CMS schemas    | `studio/src/schemaTypes/documents/`   |
| Types          | `src/types/`                          |
| UI components  | `src/components/ui/` (shadcn/Radix)   |

## Critical Conventions

1. **Backend enums are UPPERCASE**: `USER`, `BUYER`, `GROWER`, `ADMIN`
2. **Route groups don't affect URLs**: `app/(shop)/shop/` → `/shop`
3. **Auth token**: `auth-token` cookie, managed via `src/lib/auth.ts`
4. **Email endpoints**: Auto-route to local backend when `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local`
5. **TypeScript errors ignored in build**: `typescript.ignoreBuildErrors: true` in `next.config.ts`

## Environment Variables (Required)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_USE_MOCK_DATA=false
SANITY_API_READ_TOKEN=<token>  # For authenticated Sanity requests
```

## Key Integrations

### Lalamove Same-Day Delivery

- Client: `src/lib/lalamove/client.ts` (HMAC auth)
- API routes: `src/app/api/lalamove/` (quotation, order, webhook)
- Sandbox by default; switch `LALAMOVE_HOST` for production

### Sanity CMS (24 document types)

- Studio: `cd studio && npm run dev` (port 3333)
- Project ID: `gerattrr` | Dataset: `production`
- Real-time disabled (free tier) - manual refresh required

## Common Pitfalls

- **Don't** put middleware in `src/` - it's at project root
- **Don't** use lowercase enums for backend (`user` ❌ → `USER` ✅)
- **Don't** hardcode API URLs - use env vars
- **Don't** edit Sanity content in code - use Studio UI

## Extended Documentation

See `.github/` for detailed workflows:

- `SANITY_SEEDING_PLAN.md` - CMS data seeding
- `CART_AND_CHECKOUT_COMPLETE_PLAN.md` - E-commerce flows
- `VERCEL_DEPLOYMENT_PLAN.md` - Deployment guide
- `BLOG_AND_RECIPES_PLAN.md` - Content management

---

## Extended Reference

### Tech Stack Details

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui (Radix)
- **Backend**: NestJS + Prisma + PostgreSQL (Railway)
- **CMS**: Sanity Studio (`/studio` directory)
- **Auth**: JWT with 6-digit email verification codes
- **Forms**: React Hook Form + Zod validation
- **Build**: Turbopack enabled

### API Client (`src/lib/api-client.ts`)

The API client implements **dual-backend routing**:

- Email-dependent endpoints (`/auth/register`, `/auth/verify-email-code`, etc.) route to local backend when `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local`
- All other endpoints use `NEXT_PUBLIC_API_URL`
- Auto-handles JWT tokens from `auth-token` cookie

### Sanity Schema Structure

24 document types in `studio/src/schemaTypes/documents/`:

**E-Commerce**: `product`, `category`, `productVariant`, `productBundle`, `review`, `order`, `coupon`, `promotion`

**Content**: `hero`, `featureSection`, `faqItem`, `post`, `page`, `person`, `recipe`, `growingGuide`, `testimonial`, `store`, `grower`, `banner`

**Product schema** has 25+ fields organized into: Basic Info, Pricing, Inventory, Variants, Smart Recommendations, Freshness, Preparation, Delivery, SEO

### Authentication Flow

```
Register → Email code sent → User enters 6-digit code → JWT token returned → Stored as auth-token cookie
```

Auth utilities in `src/lib/auth.ts`:

- `isAuthenticated()` - Check auth status
- `setAuthToken(token, remember?)` - Store token
- `logout()` - Clear all auth state

### Lalamove Integration

API routes in `src/app/api/lalamove/`:

- `/quotation` - Get delivery price
- `/order` - Place delivery order
- `/orders/[orderId]` - Get/update/cancel
- `/driver` - Get driver details
- `/webhook` - Real-time status updates

Service class: `src/lib/lalamove/client.ts` implements HMAC authentication

### Design System

Colors (from `src/lib/colors.ts`):

- Primary Dark: `#1E392A` - primary buttons, headers
- Primary Medium: `#6A994E` - secondary actions
- Primary Light: `#A7C957` - badges, success states

Use `cn()` from `@/lib/utils` to merge Tailwind classes.

### File Naming Conventions

- Components: PascalCase (`ProductCard.tsx`)
- Routes: lowercase-hyphen (`order-history/page.tsx`)
- Types: lowercase-hyphen (`api.ts`)
- Utilities: lowercase-hyphen (`api-client.ts`)
