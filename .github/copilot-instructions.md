# MASH E-Commerce Platform - AI Coding Guide

## Project Overview
MASH is a mushroom e-commerce platform built with **Next.js 15 (App Router)**, TypeScript, Tailwind CSS, and shadcn/ui. The app connects to a NestJS + Prisma + PostgreSQL backend hosted on Railway. This is a production-ready frontend with hybrid mock/real data support.

## Architecture Principles

### Route Groups Organization
Routes use Next.js route groups `(folder)` for logical organization WITHOUT affecting URLs:
- `(auth)/` - Authentication pages (login, signup) with simple header layout
- `(shop)/` - Shopping pages (shop, product, cart, checkout) with main header
- `(user)/` - User profile pages with sidebar navigation
- `(seller)/` - Seller dashboard with seller-specific header
- Root level - Marketing pages (about, contact, faq, blog)

**Critical**: Route groups don't appear in URLs - `app/(shop)/shop/page.tsx` → `/shop`

### Data Flow Strategy
The app uses a **feature flag system** to toggle between mock and real API data:
- Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local` to use Railway backend
- Set `NEXT_PUBLIC_USE_MOCK_DATA=true` for local development with mock data
- API client (`src/lib/api-client.ts`) handles auth tokens, refresh logic, and error responses
- Backend API base URL: `https://mash-backend-api-production.up.railway.app/api/v1`

### Component Architecture
Components follow a **barrel export pattern** for clean imports:
```typescript
// Use this
import { Header, Footer } from "@/components";
import { Button, Input } from "@/components/ui";

// Not this
import Button from "@/components/ui/button";
```

All UI components are built with **shadcn/ui** (Radix UI + Tailwind) - see `src/components/ui/`

## Critical Development Workflows

### Running the App
```bash
npm run dev          # Start dev server with Turbopack (faster builds)
npm run build        # Production build with Turbopack
npm start            # Run production build
npm run lint         # ESLint check
```

**Note**: Turbopack is enabled by default (`--turbopack` flag in package.json)

### Authentication & Route Protection
Middleware (`src/middleware.ts`) handles route protection:
- **Protected routes** (require auth): `/checkout`, `/onboarding`, `/seller/*`, `/profile/*`
- **Auth routes** (redirect if logged in): `/login`, `/signup`, `/forgot-password`
- **Public routes**: `/`, `/shop`, `/product/*`, `/about`, `/grower/*`, `/contact`, `/faq`

Auth token is stored as `auth-token` cookie. Middleware checks this and redirects accordingly.

### Adding New Routes
1. Create page in appropriate route group: `app/(group)/route/page.tsx`
2. Update `src/middleware.ts` if route needs protection (add to `protectedRoutes` array)
3. Add `loading.tsx` for loading states and `error.tsx` for error boundaries
4. Use `"use client"` directive ONLY if page needs client-side interactivity

### API Integration Pattern
```typescript
// Example: Fetching products
import { apiRequest } from "@/lib/api-client";
import type { ProductApiResponse, ApiResponse } from "@/types/api";

// Server Component (default)
async function getProducts() {
  const response = await apiRequest<ApiResponse<ProductApiResponse[]>>("/products");
  return response.data;
}

// Client Component (use React Query or SWR)
"use client";
import { useQuery } from "@tanstack/react-query";

function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiRequest<ApiResponse<ProductApiResponse[]>>("/products")
  });
  // ...
}
```

## Project-Specific Conventions

### TypeScript Strictness
- `typescript.ignoreBuildErrors: true` in `next.config.ts` (temporary for rapid development)
- Use `@/` path alias for imports: `@/components`, `@/lib`, `@/types`
- Type definitions in `src/types/` (api.ts, admin.ts, cms.ts)

### Styling Standards
- **Color Palette** (see `docs/COLOR_PALETTE.md`):
  - Primary Dark: `#1E392A` - primary buttons, headers
  - Primary Medium: `#6A994E` - secondary buttons
  - Primary Light: `#A7C957` - badges, success states
- **Button Variants**: `primary`, `default`, `outline`, `ghost`, `destructive`
- **Rounded Props**: Add `rounded="lg"` to buttons for consistent border radius
- Use `cn()` utility from `@/lib/utils` to merge Tailwind classes

### Data Structure Conventions
- **Backend uses UPPERCASE enums** (e.g., `USER`, `BUYER`, `GROWER`, `ADMIN`)
- Frontend displays use title case (e.g., "Buyer", "Grower")
- Use conversion utilities when sending data to backend
- See `docs/SCHEMA_REFERENCE.md` for complete Prisma schema
- See `data/QUICK_REFERENCE.md` for JSON structure examples

### File Naming
- Components: PascalCase (e.g., `ProductCard.tsx`, `Header.tsx`)
- Routes: lowercase with hyphens (e.g., `order-history/page.tsx`)
- Types: lowercase with hyphens (e.g., `api.ts`, `admin.ts`)
- Utilities: lowercase with hyphens (e.g., `api-client.ts`, `grower-utils.ts`)

## Essential Documentation
Before making significant changes, review these docs:
- `docs/COMPLETE_ARCHITECTURE.md` - Full file structure and status
- `docs/BACKEND_API_CONNECTION_GUIDE.md` - Complete API integration guide (550+ lines)
- `docs/API_QUICK_REFERENCE.md` - Quick API endpoints reference
- `docs/COMPONENT_GUIDE.md` - Component usage patterns
- `data/QUICK_REFERENCE.md` - JSON data structure examples
- `docs/QUICK_REFERENCE.md` - Route groups and common tasks

## Common Pitfalls to Avoid

1. **Don't** use route group folder names in URLs - they're for organization only
2. **Don't** add `"use client"` unless component needs browser APIs or React hooks
3. **Don't** forget to update middleware when adding protected routes
4. **Don't** use lowercase enums when sending to backend - always use UPPERCASE
5. **Don't** assume authentication is set up - auth token is TODO placeholder in middleware
6. **Don't** create duplicate components - check `src/components/ui/` first (40+ shadcn components)
7. **Don't** hardcode API URLs - use `process.env.NEXT_PUBLIC_API_URL` from env vars

## Integration Points

### Backend API (NestJS + Prisma)
- Base URL: `https://mash-backend-api-production.up.railway.app/api/v1`
- 47+ endpoints across 8 main resources: products, users, orders, categories, addresses, payments, devices, sensors
- Auth: JWT Bearer tokens with refresh token flow
- Error format: `{ success: false, message: string, error?: string }`
- Success format: `{ success: true, data: T, pagination?: {...} }`

### External Dependencies
- **Clerk** (auth - not fully integrated, using placeholder middleware)
- **shadcn/ui** + Radix UI primitives (all UI components)
- **Framer Motion** (animations)
- **React Hook Form** + Zod (form validation)
- **Recharts** (seller dashboard charts)
- **Embla Carousel** (product images)
- **Lucide React** (icons)

### Environment Variables Required
```env
NEXT_PUBLIC_API_URL=https://mash-backend-api-production.up.railway.app/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_API_LOGGING=true
```

## Known Limitations & TODOs
- TypeScript/ESLint errors ignored during builds (temporary)
- Clerk integration is planned but not fully implemented (middleware uses placeholder auth)
- Some seller pages use mock data: refunds, notifications, settings, handover centers, shipping channels
- WebSocket integration planned for real-time device updates (see `src/lib/websocket/`)
- CMS integration partial (see `src/lib/cms/` and `src/types/cms.ts`)

---

**Last Updated**: November 12, 2025  
**For Questions**: See `docs/` folder for comprehensive documentation
