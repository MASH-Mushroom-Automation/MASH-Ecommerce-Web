# MASH E-Commerce Platform - AI Agent Guide

> **Last Updated:** December 16, 2025 | **Stack:** Next.js 15 + Sanity CMS + NestJS Backend + Firebase Auth

## ⚠️ IMPORTANT: Documentation Location

**ALL generated documentation, plans, and guides MUST be placed in the `.github/` folder.**

```
✅ .github/FEATURE_PLAN.md
✅ .github/IMPLEMENTATION_GUIDE.md  
❌ FEATURE_PLAN.md (root - incorrect)
❌ docs/GUIDE.md (use .github instead)
```

## 🚀 Local Development Setup (Backend + Frontend)

**Run both services in separate terminals:**

### Terminal 1: Backend (Port 4000)
```bash
cd MASH-Backend
# Create .env from .env.example (set PORT=4000)
npm install --legacy-peer-deps  # REQUIRED for Windows
npx prisma generate             # REQUIRED before first run
npm run start:dev               # http://localhost:4000
```

### Terminal 2: Frontend (Port 3000)
```bash
cd MASH-Ecommerce-Web
npm install
npm run dev                     # http://localhost:3000
```

### Connection Verification
- Backend health: http://localhost:4000/api/v1/health
- Frontend: http://localhost:3000
- Checkout: http://localhost:3000/checkout (requires cart items)

## Architecture Overview

**Four-tier data architecture:**

| Data Source                 | Purpose                      | Access Pattern                        |
| --------------------------- | ---------------------------- | ------------------------------------- |
| **Sanity CMS** (`gerattrr`) | Products, content, marketing | GROQ via `src/lib/sanity/queries.ts`  |
| **NestJS Backend**          | Auth, orders, transactions   | REST via `src/lib/api/*.ts`           |
| **Firebase Auth**           | Google Sign-In (OAuth)       | `src/lib/firebase/` + `src/contexts/AuthContext.tsx` |
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

### Authentication (Dual System)

```typescript
// Firebase Google Sign-In (redirect flow)
import { useAuth } from "@/contexts/AuthContext";
const { signInWithGoogle, signOut, user, isAuthenticated } = useAuth();

// Traditional email/password (NestJS backend)
import { setAuthToken, logout } from "@/lib/auth";
```

### Route Protection

Middleware at **root** `middleware.ts` (NOT `src/middleware.ts`):

- Protected: `/checkout`, `/seller/*`, `/profile/*`
- Auth routes redirect if logged in: `/login`, `/signup`

## File Locations

| Task                | Location                                    |
| ------------------- | ------------------------------------------- |
| Add page            | `src/app/(route-group)/path/page.tsx`       |
| Add API route       | `src/app/api/resource/route.ts`             |
| Sanity queries      | `src/lib/sanity/queries.ts`                 |
| CMS schemas         | `studio/src/schemaTypes/documents/`         |
| Types               | `src/types/`                                |
| UI components       | `src/components/ui/` (shadcn/Radix)         |
| Firebase config     | `src/lib/firebase/`                         |
| Auth context        | `src/contexts/AuthContext.tsx`              |

## Critical Conventions

1. **Backend enums are UPPERCASE**: `USER`, `BUYER`, `GROWER`, `ADMIN`
2. **Route groups don't affect URLs**: `app/(shop)/shop/` → `/shop`
3. **Auth token**: `auth-token` cookie, managed via `src/lib/auth.ts`
4. **Email endpoints**: Auto-route to local backend when `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local`
5. **TypeScript errors ignored in build**: `typescript.ignoreBuildErrors: true` in `next.config.ts`
6. **Documentation goes in `.github/`**: All plans, guides, and generated docs

## Environment Variables (Required)

```env
# Backend Connection (IMPORTANT: Backend runs on port 4000 to avoid Next.js conflict)
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000
NEXT_PUBLIC_API_TIMEOUT=30000

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_USE_MOCK_DATA=false
SANITY_API_READ_TOKEN=<token>

# Firebase (Google Sign-In)
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>

# Email routing (use "local" when running backend locally)
NEXT_PUBLIC_EMAIL_SERVICE_ENV=local
```

## Checkout Flow Integration

**Cart → Checkout → Order flow:**

1. **Cart Context** (`src/contexts/CartContext.tsx`) - Local storage persistence
2. **Checkout Page** (`src/app/(shop)/checkout/page.tsx`) - 2-step form
3. **Orders API** (`src/lib/api/orders.ts`) - Backend integration with mock fallback
4. **User Profile** (`src/lib/api/user.ts`) - Auto-fills checkout form

**Payment Methods:**
- ✅ Cash on Pickup (COD) - Available
- ⏳ GCash - Coming Soon (visible but disabled)
- ⏳ Credit/Debit Cards - Coming Soon (visible but disabled)

## Key Integrations

### Firebase Google Sign-In

- Config: `src/lib/firebase/config.ts`
- Auth functions: `src/lib/firebase/auth.ts` (signInWithRedirect)
- Context: `src/contexts/AuthContext.tsx` (unified auth state)
- Button: `src/components/auth/google-sign-in-button.tsx`
- Backend sync: `src/app/api/auth/firebase-sync/route.ts`
- Setup guide: `.github/FIREBASE_GOOGLE_SIGNIN_SETUP.md`

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
- **Don't** put documentation in root or `docs/` - use `.github/`

## Extended Documentation

See `.github/` for detailed workflows:

- `FIREBASE_AUTH_IMPLEMENTATION_PLAN.md` - Firebase auth implementation details
- `FIREBASE_GOOGLE_SIGNIN_SETUP.md` - Firebase Console setup guide
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
- **Auth**: Firebase (Google OAuth) + NestJS (email/password with 6-digit codes)
- **Forms**: React Hook Form + Zod validation
- **Build**: Turbopack enabled

### Authentication Architecture

**Dual auth system** - both methods store JWT in `auth-token` cookie:

1. **Firebase Google Sign-In** (`signInWithRedirect`)
   - User clicks Google button → Redirect to Google → Return with Firebase user
   - Sync to backend via `/api/auth/firebase-sync` → Backend returns JWT
   
2. **Email/Password** (NestJS backend)
   - Register → Email 6-digit code → Verify → JWT returned

```typescript
// AuthContext provides unified interface
const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth();
```

### API Client (`src/lib/api-client.ts`)

The API client implements **dual-backend routing**:

- Email-dependent endpoints (`/auth/register`, `/auth/verify-email-code`, etc.) route to local backend when `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local`
- All other endpoints use `NEXT_PUBLIC_API_URL`
- Auto-handles JWT tokens from `auth-token` cookie

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
- Documentation: UPPERCASE_SNAKE (`IMPLEMENTATION_PLAN.md`)
