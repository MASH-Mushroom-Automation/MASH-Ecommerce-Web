# MASH E-Commerce Platform - AI Coding Guide

**Last Updated:** November 21, 2025  
**Project Status:** Phase 2.5 - Enhanced Foundation with CMS Integration

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Principles](#architecture-principles)
3. [Critical Development Workflows](#critical-development-workflows)
4. [Project-Specific Conventions](#project-specific-conventions)
5. [Essential Documentation](#essential-documentation)
6. [🎯 AI Agent Workflow for Sanity CMS Tasks](#-ai-agent-workflow-for-sanity-cms-tasks)
7. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
8. [Integration Points](#integration-points)
9. [Known Limitations & TODOs](#known-limitations--todos)
10. [🔐 Complete Authentication System](#-complete-authentication-system-documentation)

---

## Project Overview

MASH is a **mushroom e-commerce platform** built with **Next.js 15 (App Router)**, TypeScript, Tailwind CSS, and shadcn/ui. The platform features:

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui (Radix UI)
- **Backend**: NestJS + Prisma + PostgreSQL (Railway hosted at `localhost:3000/api/v1`)
- **CMS**: Sanity Studio for content management (separate `/studio` directory)
- **Auth**: JWT-based with 6-digit email verification codes
- **State**: React Hook Form + Zod validation
- **Build**: Turbopack enabled (faster dev/build)
- **Deployment**: Vercel-optimized with auto-deployment from main branch

### Three-Tier Data Architecture

MASH uses a **hybrid data strategy** with three sources:

1. **NestJS Backend** (`localhost:3000/api/v1`) - Transactional data (products, orders, users)
2. **Sanity CMS** (`studio/`, port 3333) - Marketing content (hero, features, FAQs, blog posts)
3. **Mock Data** (`data/`) - Development fallback when backend unavailable

**Critical**: Set `NEXT_PUBLIC_USE_MOCK_DATA=false` to use real backend

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

MASH uses a **dual-backend architecture** with smart routing:

**1. NestJS Backend** (`localhost:3000/api/v1`) - Transactional Data
- Products, orders, users, addresses, payments
- Handled by `src/lib/api-client.ts` (JWT auth, token refresh, error handling)
- Toggle with `NEXT_PUBLIC_USE_MOCK_DATA=false` (real) or `true` (mock)

**2. Sanity CMS** (`localhost:3333`, deployed to Sanity Cloud) - Content Data
- Hero sections, features, FAQs, blog posts, team info
- Accessed via `src/lib/cms/database.ts` (HeroAPI, FeaturesAPI, FAQAPI)
- Always fetches from Sanity Cloud (no mock toggle)

**Email-Dependent Routing**: Authentication endpoints (`/auth/register`, `/auth/verify-email-code`) automatically route to local backend when `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local` (see `src/lib/api-client.ts` lines 17-47)

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
npm run dev          # Start Next.js dev server at localhost:3000 (Turbopack enabled)
npm run build        # Production build with Turbopack
npm start            # Run production build
npm run lint         # ESLint check
```

**Note**: Turbopack is enabled by default (`--turbopack` flag in package.json)

### Sanity CMS Workflow - Complete Guide

#### **Architecture Overview**

Sanity Studio is a **separate project** in `/studio` directory with its own:
- `package.json` - Independent dependencies
- `sanity.config.ts` - Studio configuration
- `src/schemaTypes/` - 15+ content type definitions
- Dev server on port 3333 (separate from Next.js on port 3000)

**Critical Workflow**: 
1. **Content Changes**: Edit in Sanity Studio (localhost:3333) → Auto-publishes to Sanity Cloud
2. **Frontend Fetches**: Next.js fetches from Sanity Cloud via `src/lib/cms/database.ts`
3. **No Restart Needed**: Frontend sees changes on next page load (5-minute cache TTL)

**Sanity Project Details**:
- Project ID: `ydg9aldo9kaje3bknmhjq0pl` (in `studio/sanity.config.ts`)
- Dataset: `production`
- Schema: 15+ content types (hero, features, post, page, settings)
- Visual Editing: Available via Presentation Tool in Studio

#### **Starting Sanity Studio**

```bash
# From project root
cd studio
npm run dev          # Starts at localhost:3333

# Studio opens in browser automatically
# Login with Sanity account (Google OAuth)
```

#### **Complete Schema Structure (15+ Content Types)**

**E-Commerce Documents:**
1. **`product`** (25+ fields) - Main product catalog
   - Basic Info: name, slug, description, image, images[], category, SKU
   - Pricing: price, isOnPromo, promoType, promoPercentage, promoPrice, promoEndDate
   - Inventory: quantity, lowStockThreshold, trackInventory, allowBackorders, stockHistory[]
   - Variants: hasVariants, variants[] (references to productVariant)
   - Smart Recommendations: suggestedProducts[], complementaryProducts[], relatedBundles[]
   - Freshness: freshnessInfo{harvestWindow, shelfLife, storageInstructions, qualityIndicators}
   - Preparation: preparationInfo{difficultyLevel, cookingTime, preparationTips[], recipeIdeas[]}
   - Delivery: deliveryOptions{sameDayDeliveryEligible, deliveryZones[], perishable}, deliveryWeight{packageWeight, packageDimensions}
   - SEO: searchKeywords[], nutritionalHighlights[], isFeatured

2. **`category`** - Product categories (Fresh, Dried, Kits)
3. **`productVariant`** - Size/weight options (Small, Medium, Large)
4. **`productBundle`** - Package deals with savings
5. **`review`** - Customer reviews with ratings
6. **`order`** - Order management
7. **`coupon`** - Discount codes
8. **`promotion`** - Marketing campaigns

**Content Documents:**
9. **`hero`** - Homepage hero sections
10. **`features`** - Feature highlights
11. **`faq`** - FAQ items
12. **`post`** - Blog posts
13. **`page`** - CMS pages
14. **`author`** - Blog authors
15. **`teamMember`** - Team profiles

**Singletons:**
- **`settings`** - Global site config
- **`featuredProducts`** - Homepage products
- **`navigation`** - Menu structure

#### **Product Schema Deep Dive (25+ Fields)**

The product schema is **organized into 9 categories** for complete e-commerce functionality:

**1. Basic Info (7 fields):**
```typescript
{
  name: string,              // "Fresh Oyster Mushrooms"
  slug: { current: string }, // "fresh-oyster-mushrooms"
  description: blockContent, // Rich text editor
  shortDescription: string,  // For product cards
  image: image,             // Main product image
  images: image[],          // Gallery (2-4 images)
  category: reference,      // Link to category doc
  SKU: string,              // "MUSH-OYS-001"
}
```

**2. Pricing (7 fields):**
```typescript
{
  price: number,            // ₱350
  isOnPromo: boolean,       // true/false
  promoType: string,        // "percentage" or "fixed"
  promoPercentage: number,  // 22 (for 22% off)
  promoPrice: number,       // ₱273 (auto-calculated)
  promoEndDate: datetime,   // Expiry date
  compareAtPrice: number,   // Original price for strikethrough
}
```

**3. Inventory (6 fields):**
```typescript
{
  quantity: number,           // 150 (units in stock)
  lowStockThreshold: number,  // 20 (when to show "Low Stock")
  trackInventory: boolean,    // Enable/disable stock tracking
  allowBackorders: boolean,   // Allow orders when out of stock
  stockStatus: string,        // "in-stock", "low-stock", "out-of-stock"
  stockHistory: array,        // Track inventory changes over time
}
```

**4. Variants (4 fields):**
```typescript
{
  hasVariants: boolean,     // Does product have size options?
  variants: reference[],    // Array of productVariant references
  weight: number,          // Default weight (grams)
  unit: string,            // "grams", "kg", "piece"
}
```

**5. Smart Recommendations (5 fields):**
```typescript
{
  suggestedProducts: reference[],      // "You May Also Like" (max 8)
  relatedProducts: reference[],        // Similar products
  complementaryProducts: reference[],  // "Frequently Bought Together" (max 4)
  relatedBundles: reference[],         // Package deals
  productTags: string[],               // ["bestseller", "organic", "fresh"]
}
```

**6. Freshness & Quality (4 fields):**
```typescript
{
  freshnessInfo: {
    harvestWindow: string,        // "Harvested within 24 hours"
    shelfLife: string,            // "5-7 days refrigerated"
    storageInstructions: text,    // How to store
    qualityIndicators: string[],  // ["firm texture", "no dark spots"]
  }
}
```

**7. Preparation (4 fields):**
```typescript
{
  preparationInfo: {
    difficultyLevel: string,      // "beginner", "intermediate", "advanced"
    cookingTime: number,          // Minutes
    preparationTips: string[],    // Tips array
    recipeIdeas: array[],         // Recipe suggestions with links
  }
}
```

**8. Same-Day Delivery (Lalamove) (6 fields):**
```typescript
{
  deliveryOptions: {
    sameDayDeliveryEligible: boolean,  // Can be delivered same-day?
    deliveryZones: string[],           // ["Metro Manila", "Quezon City"]
    perishable: boolean,               // Requires cold transport?
  },
  deliveryWeight: {
    packageWeight: number,             // 0.5 (kg)
    packageDimensions: {
      length: number,                  // cm
      width: number,
      height: number,
    }
  }
}
```

**9. SEO & Discovery (3 fields):**
```typescript
{
  searchKeywords: string[],         // ["oyster", "fresh", "mushroom"]
  nutritionalHighlights: array[],   // Nutrition facts
  isFeatured: boolean,              // Show on homepage?
}
```

#### **Critical CMS Operations**

**1. Adding Product Images (Phase 3):**
```bash
# In Sanity Studio (localhost:3333)
1. Click "Products" → Select product
2. Scroll to "Product Image" field
3. Drag & drop image OR click "Upload"
4. Adjust hotspot (blue circle) to center focus
5. Add Alt Text: "Fresh oyster mushrooms in basket" (SEO)
6. Scroll to "Additional Images" → Click "+ Add Item"
7. Upload 2-4 gallery images
8. Click "Publish" (green button, top right)

# Image Requirements:
- Format: JPG, PNG, or WebP
- Size: 1200x1200px minimum (square ratio)
- File size: < 2MB (Sanity auto-optimizes)
- Quality: High resolution, sharp focus, bright lighting
```

**2. Linking Related Products (Phase 4):**
```bash
# In Sanity Studio
1. Open product → Scroll to "Suggested Products"
2. Click "+ Add Item" button
3. Search for product: Type "shiitake" or "oyster"
4. Click product to add → Repeat 3-5 times
5. Scroll to "Complementary Products" → Add 2-3 items
6. Scroll to "Related Bundles" → Add 1-2 bundles
7. Click "Publish"

# Smart Suggestions Strategy:
- Fresh Mushrooms → Suggest other fresh + growing kits
- Dried Mushrooms → Suggest other dried + fresh alternatives
- Growing Kits → Suggest fresh mushrooms + other kits
- Bundles → Suggest individual products + other bundles
```

**3. Frontend Integration Pattern:**
```typescript
// src/lib/cms/database.ts - Fetching from Sanity
import { client } from '@/lib/cms/sanity';

// Fetch products with suggested products
const products = await client.fetch(`
  *[_type == "product"] {
    _id,
    name,
    slug,
    price,
    image,
    suggestedProducts[]-> {
      _id,
      name,
      price,
      image
    },
    complementaryProducts[]-> {
      _id,
      name,
      price,
      image
    }
  }
`);

// Use in component
export default async function ProductPage() {
  const products = await getProducts();
  return <ProductGrid products={products} />;
}
```

#### **Visual Editing Workflow**

Sanity's **Presentation Tool** allows real-time preview of CMS changes:

1. In Studio, click **"Presentation"** tab (top bar)
2. Opens split-screen: Studio on left, Frontend preview on right
3. Edit content in Studio → See changes instantly in preview
4. Click "Publish" when satisfied

**Preview URL**: Configured to `http://localhost:3000` in `studio/sanity.config.ts`

#### **Deployment & Publishing**

**Content Publishing:**
- All changes in Studio are **drafts** until you click "Publish"
- Published content is **immediately available** via Sanity Cloud CDN
- Frontend fetches from CDN with 5-minute cache (revalidate: 300)

**Studio Deployment:**
- Studio auto-deploys to Sanity Cloud via GitHub Actions
- Access deployed Studio: `https://[project-id].sanity.studio`
- Changes to schema require re-deployment (push to `main` branch)

#### **Data Migration & Import**

**Bulk Import Pattern** (used in Phase 2):
```bash
# See data/cms/ for import scripts
node data/cms/import-categories.js   # Import 3 categories
node data/cms/import-products.js     # Import 15 products
node data/cms/import-variants.js     # Import 15 variants
node data/cms/import-bundles.js      # Import 6 bundles
node data/cms/import-reviews.js      # Import 45 reviews

# Import uses Sanity Client API:
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ydg9aldo9kaje3bknmhjq0pl',
  dataset: 'production',
  token: process.env.SANITY_AUTH_TOKEN, // Write access
  useCdn: false,
});

await client.create({ _type: 'product', ...data });
```

#### **Common CMS Tasks**

**Update Product Stock:**
```typescript
// In Studio → Products → Select product → Change "quantity" field
// Or via API:
await client.patch(productId)
  .set({ quantity: 50 })
  .commit();
```

**Add Promotional Pricing:**
```typescript
// In Studio:
1. Toggle "Is On Promo?" = true
2. Select "Promo Type" = "percentage"
3. Enter "Promo Percentage" = 20
4. Set "Promo End Date" = future date
5. Publish → Frontend shows discounted price
```

**Feature Product on Homepage:**
```typescript
// In Studio → Products → Select product
// Toggle "Is Featured?" = true
// Product appears in homepage featured section
```

### Authentication & Route Protection

#### Authentication Flow (Email Verification Code System)

MASH uses a **6-digit email verification code** authentication system:

```
1. USER: Register account (POST /api/v1/auth/register)
   ↓
2. SYSTEM: Generate 6-digit code (e.g., "123456")
   ↓
3. SYSTEM: Send email with verification code
   ↓
4. APP: Show "Check your email for verification code" message
   ↓
5. USER: Open email, copy code "123456"
   ↓
6. USER: Return to app, enter code in verify-otp page
   ↓
7. APP: Call POST /api/v1/auth/verify-email-code
   Body: { "email": "user@example.com", "code": "123456" }
   ↓
8. SYSTEM: Verify code matches → Return JWT token
   Response: { "success": true, "data": { "token": "jwt...", "user": {...} } }
   ↓
9. APP: Store token as "auth-token" cookie (via setAuthToken() in src/lib/auth.ts)
   ↓
10. APP: User is logged in automatically → Redirect to /shop or /onboarding
```

#### Auth Routes & Pages

- `/signup` - Registration form (captures firstName, lastName, email, password)
- `/verify-otp` - 6-digit code input (currently 4-digit, needs update to 6-digit)
- `/login` - Email/password login (fallback if user already has account)
- `/forgot-password` - Password reset request
- `/reset-password` - New password entry

#### Route Protection (Middleware)

Middleware (`src/middleware.ts`) handles route protection:

- **Protected routes** (require auth): `/checkout`, `/onboarding`, `/seller/*`, `/profile/*`
- **Auth routes** (redirect if logged in): `/login`, `/signup`, `/forgot-password`, `/verify-otp`
- **Public routes**: `/`, `/shop`, `/product/*`, `/about`, `/grower/*`, `/contact`, `/faq`

#### Auth Token Management

- **Storage**: Auth token stored as `auth-token` cookie
- **Helper Functions** (`src/lib/auth.ts`):
  - `isAuthenticated()` - Check if user has valid auth token
  - `setAuthToken(token, remember?)` - Store token with optional persistence (30 days)
  - `logout()` - Clear token and all auth-related storage

#### API Client Auth Integration

`src/lib/api-client.ts` automatically:

- Adds `Authorization: Bearer <token>` header to all requests
- Handles 401 errors by attempting token refresh
- Redirects to `/login` if refresh fails

### Adding New Routes

1. Create page in appropriate route group: `app/(group)/route/page.tsx`
2. Update `middleware.ts` if route needs protection (see below)
3. Add `loading.tsx` for loading states and `error.tsx` for error boundaries
4. Use `"use client"` directive ONLY if page needs client-side interactivity

**Middleware Route Protection** (`middleware.ts` in root, NOT `src/`):

```typescript
// middleware.ts - Located at ROOT level (not src/middleware.ts)
const protectedRoutes = [
  '/checkout',      // Requires auth
  '/seller',        // Seller dashboard
  '/profile/my-information',
  '/profile/order-history',
  '/wishlist',
];

const authRoutes = [
  '/login', '/signup',  // Redirect to /catalog if authenticated
  '/forgot-password', '/verify-otp',
];

const publicRoutes = [
  '/', '/catalog', '/product',  // Always accessible
  '/about', '/grower', '/contact', '/faq',
];
```

**Add new protected route**: Add path to `protectedRoutes` array → unauthenticated users redirect to `/login?redirect=<path>`

### API Integration Pattern

```typescript
// Example: Fetching products
import { apiRequest } from "@/lib/api-client";
import type { ProductApiResponse, ApiResponse } from "@/types/api";

// Server Component (default)
async function getProducts() {
  const response = await apiRequest<ApiResponse<ProductApiResponse[]>>(
    "/products"
  );
  return response.data;
}

// Client Component (use React Query or SWR)
("use client");
import { useQuery } from "@tanstack/react-query";

function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiRequest<ApiResponse<ProductApiResponse[]>>("/products"),
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

### **📋 Master Planning Documents** (Your Single Source of Truth)

- **`.github/MASTER_IMPLEMENTATION_PLAN.md`** (2830+ lines) - **Living document** with complete phase-by-phase roadmap
  - 8 phases with progress tracking (Phases 1-2.5 complete at 100%)
  - Detailed task breakdowns with time estimates
  - Session logs for tracking daily progress
  - Phase 3 & 4 marked **URGENT** with 75-minute completion goal
  - Use this as your daily checklist - update as you complete tasks

- **`.github/SANITY_CMS_COMPLETE_WORKFLOW.md`** (15,000+ words) - **Complete Sanity CMS workflow guide**
  - Step-by-step instructions for Phases 3-7
  - Product schema deep dive (25+ fields across 9 categories)
  - Smart product suggestions organized by category
  - Complete e-commerce customer journey (discovery → checkout → delivery)
  - Lalamove same-day delivery integration guide (~8 hours)
  - Testing checklist with 40+ verification items
  - **Use this for CMS operations** - all Sanity tasks reference this doc

### **🏗️ Architecture & Backend**

- `docs/COMPLETE_ARCHITECTURE.md` (540 lines) - Full file structure and implementation status
- `docs/BACKEND_API_CONNECTION_GUIDE.md` (1024 lines) - Complete NestJS API integration with examples
- `docs/API_QUICK_REFERENCE.md` - Quick endpoint reference (9 resources, Railway backend)
- `docs/AUTH_IMPLEMENTATION_GUIDE.md` - JWT auth flow (register → 6-digit email code → verify → login)

### **🎨 Design & Components**

- `docs/COLOR_PALETTE.md` - Design system colors
  - Primary Dark: `#1E392A` (buttons, headers)
  - Primary Medium: `#6A994E` (secondary actions)
  - Primary Light: `#A7C957` (badges, success states)
- `docs/COMPONENT_GUIDE.md` - shadcn/ui component patterns and usage
- `data/QUICK_REFERENCE.md` - JSON structure examples (products, orders, users)

### **📦 Sanity CMS Specific**

- `studio/README.md` - Sanity Studio setup and initial schema overview
- `studio/src/schemaTypes/documents/product.ts` (623 lines) - **Complete product schema**
  - 25+ fields organized into 9 categories
  - Reference this when adding/modifying product fields
  - Phase 2.5 enhancements already implemented (suggestedProducts, freshnessInfo, deliveryOptions)

### **🔗 Quick Development Links**

- **Sanity Studio**: `http://localhost:3333` (login required)
- **Frontend Dev**: `http://localhost:3000` (Next.js with Turbopack)
- **Backend API**: `http://localhost:3000/api/v1` (Railway production)
- **Local Backend**: `http://localhost:3000/api/v1` (for email endpoints with NEXT_PUBLIC_EMAIL_SERVICE_ENV=local)

### **📈 Current Project Status (November 21, 2025)**

**✅ Completed (100%):**
- Phase 1: CMS Structure (13 document types + 4 singletons)
- Phase 2: Data Population (84 items: 3 categories, 15 products, 15 variants, 6 bundles, 45 reviews)
- Phase 2.5: Enhanced Product Schema (25+ fields with smart recommendations, freshness tracking, Lalamove delivery fields)

**🔴 URGENT - DO NOW (Next 75 minutes):**
- Phase 3: Product Images (30 min) - Upload images for 15 products
- Phase 4: Reference Linking (45 min) - Link suggested products, complementary products, related bundles

**⏸️ NEXT (Upcoming Sessions):**
- Phase 5: Frontend Integration (~4 hours) - Connect Sanity CMS to product pages, display recommendations
- Phase 6: Lalamove Same-Day Delivery (~8 hours) - Integrate Lalamove API, add delivery options to checkout
- Phase 7: Testing & QA (~2 hours) - End-to-end testing, mobile responsiveness
- Phase 8: Production Deployment (~1 hour) - Deploy to Vercel, verify Sanity CDN

**🎯 Immediate Action Items:**
1. Open `.github/MASTER_IMPLEMENTATION_PLAN.md` → Read "WHAT YOU NEED TO DO NOW" section
2. Open Sanity Studio (`cd studio && npm run dev`)
3. Follow Phase 3 checklist (add images to 15 products)
4. Follow Phase 4 checklist (link references for 15 products)
5. Test frontend display (`npm run dev` → visit `/shop`)
6. Update progress bars in MASTER_IMPLEMENTATION_PLAN.md
7. Mark tasks complete in both plan documents

## 🎯 AI Agent Workflow for Sanity CMS Tasks

### **When Asked to Work with Products/CMS:**

**1. First, Check Current Phase:**
```bash
# Open MASTER_IMPLEMENTATION_PLAN.md
# Check progress bars - are we in Phase 3 (Images) or Phase 4 (References)?
# Read "WHAT YOU NEED TO DO NOW" section
```

**2. Verify Sanity Studio is Running:**
```bash
cd studio
npm run dev  # Should be at http://localhost:3333
```

**3. For Image Upload Tasks (Phase 3):**
- Guide user through Sanity Studio UI (can't automate image selection)
- Provide checklist format with 15 products
- Include image requirements table
- Reference free image sources (Unsplash, Pexels, Pixabay)
- Explain hotspot adjustment for focal point
- Emphasize alt text for SEO

**4. For Reference Linking Tasks (Phase 4):**
- Provide smart suggestions organized by product category:
  - Fresh → other fresh + kits
  - Dried → other dried + fresh alternatives
  - Kits → fresh + other kits
  - Bundles → individual products + other bundles
- Use searchable product names ("shiitake", "oyster")
- Explain "+ Add Item" button behavior in Sanity
- Show example GROQ query for verification

**5. For Schema Updates:**
- **Never edit** `studio/src/schemaTypes/documents/product.ts` directly without reading full file first
- Phase 2.5 schema has 25+ fields - verify field doesn't exist before adding
- Check if field should be in existing category (Basic, Pricing, Inventory, etc.)
- Update MASTER_IMPLEMENTATION_PLAN.md after schema changes

**6. For Frontend Integration:**
- Use GROQ queries via `src/lib/cms/database.ts`
- Reference fields with `->` for relationships (e.g., `suggestedProducts[]->`)
- Always include image URL builder for Sanity images
- Cache strategy: revalidate every 300 seconds (5 minutes)

**7. Progress Tracking:**
- Update checklists in MASTER_IMPLEMENTATION_PLAN.md as tasks complete
- Change `[ ]` to `[x]` for completed items
- Update progress bars: `⬜⬜⬜⬜⬜` → `████████████████████`
- Add session log entry with completion time

### **Critical Files to Reference:**

**For CMS Structure Questions:**
→ `studio/src/schemaTypes/documents/product.ts` (623 lines, complete schema)

**For Implementation Steps:**
→ `.github/MASTER_IMPLEMENTATION_PLAN.md` (current phase tasks)
→ `.github/SANITY_CMS_COMPLETE_WORKFLOW.md` (detailed workflow)

**For Frontend Integration:**
→ `src/lib/cms/database.ts` (HeroAPI, FeaturesAPI, FAQAPI examples)
→ `src/lib/cms/sanity.ts` (client configuration)

**For Product Suggestions:**
→ `.github/SANITY_CMS_COMPLETE_WORKFLOW.md` (lines 150-250, smart suggestions by category)

### **Common Questions & Answers:**

**Q: "Why do products show 'No items' in Suggested Products?"**
A: Normal! Reference fields need manual linking in Sanity Studio. This is Phase 4 work.

**Q: "Should I add a new field to product schema?"**
A: Check Phase 2.5 schema first - we have 25+ fields already (Basic, Pricing, Inventory, Variants, Smart Recommendations, Freshness, Preparation, Delivery, SEO). Field likely exists.

**Q: "How do I test CMS changes?"**
A: Edit in Studio (localhost:3333) → Publish → Frontend fetches automatically (5-min cache). No restart needed.

**Q: "What's the Lalamove integration timeline?"**
A: Phase 6 (~8 hours). Delivery fields already in product schema. See SANITY_CMS_COMPLETE_WORKFLOW.md section "Phase C: Same-Day Delivery".

**Q: "How many products need images/references?"**
A: 15 products total (6 fresh, 3 dried, 2 specialty, 4 bundles). See checklist in MASTER_IMPLEMENTATION_PLAN.md.

## Common Pitfalls to Avoid

1. **Don't** use route group folder names in URLs - they're for organization only
2. **Don't** add `"use client"` unless component needs browser APIs or React hooks
3. **Don't** forget middleware is at **root level** (`middleware.ts`), NOT `src/middleware.ts`
4. **Don't** update middleware without updating `protectedRoutes`, `authRoutes`, or `publicRoutes` arrays
5. **Don't** use lowercase enums when sending to backend - always use UPPERCASE (e.g., `USER`, `BUYER`, `GROWER`)
6. **Don't** create duplicate components - check `src/components/ui/` first (40+ shadcn components)
7. **Don't** hardcode API URLs - use `process.env.NEXT_PUBLIC_API_URL` from env vars
8. **Don't** edit Sanity content in code - use Studio UI at `localhost:3333` (changes sync automatically)
9. **Don't** restart Next.js server for CMS changes - frontend fetches from Sanity Cloud (5-min cache)
10. **Don't** add fields to product schema without checking Phase 2.5 enhancements first - 25+ fields already exist
11. **Don't** provide generic product suggestions - use category-specific strategy from SANITY_CMS_COMPLETE_WORKFLOW.md
12. **Don't** forget to update progress bars after completing tasks - user needs visible progress tracking

## Integration Points

### Backend API (NestJS + Prisma)

- Base URL: `http://localhost:3000/api/v1`
- 47+ endpoints across 8 main resources: products, users, orders, categories, addresses, payments, devices, sensors
- Auth: JWT Bearer tokens with refresh token flow
- Error format: `{ success: false, message: string, error?: string }`
- Success format: `{ success: true, data: T, pagination?: {...} }`

### Sanity CMS Integration

**Architecture**: Separate Sanity Studio project in `/studio` directory with full schema definitions

**Content Types** (15+ schemas in `studio/src/schemaTypes/`):
- **E-Commerce**: `product` (25+ fields), `category`, `productVariant`, `productBundle`, `review`
- **Orders**: `order`, `coupon`, `promotion`
- **Homepage**: `hero`, `features`, `faq` (pulled via `HeroAPI`, `FeaturesAPI`, `FAQAPI`)
- **Blog**: `post`, `author`, `category` (with SEO fields, slugs)
- **Pages**: `page`, `settings` (for global site config)
- **Team**: `teamMember` (about page team section)

**Enhanced Product Schema (Phase 2.5)** - 25+ fields across 9 categories:
1. **Basic Info**: name, slug, description, image, images, category, SKU
2. **Pricing**: price, isOnPromo, promoType, promoPercentage, promoPrice, promoEndDate
3. **Inventory**: quantity, lowStockThreshold, trackInventory, allowBackorders, stockHistory
4. **Variants**: hasVariants, variants (size/weight options), weight, unit
5. **Smart Recommendations**: suggestedProducts, relatedProducts, complementaryProducts, relatedBundles
6. **Freshness & Quality**: harvestWindow, shelfLife, storageInstructions, qualityIndicators
7. **Preparation**: difficultyLevel, cookingTime, preparationTips, recipeIdeas
8. **Same-Day Delivery**: sameDayDeliveryEligible, deliveryZones, perishable, packageWeight, dimensions
9. **SEO & Discovery**: productTags, searchKeywords, nutritionalHighlights, isFeatured

**Critical Fields for E-Commerce**:
- `suggestedProducts` - "You May Also Like" (max 8 products)
- `complementaryProducts` - "Frequently Bought Together" (max 4)
- `freshnessInfo.shelfLife` - Critical for fresh mushrooms (e.g., "5-7 days refrigerated")
- `deliveryOptions.sameDayDeliveryEligible` - Enable Lalamove same-day delivery
- `deliveryWeight.packageWeight` - Used to calculate Lalamove delivery fee (₱150-₱300)

**Fetching Pattern** (`src/lib/cms/database.ts`):
```typescript
// Example: Fetch products with suggested products
import { client } from '@/lib/cms/sanity';

const products = await client.fetch(`
  *[_type == "product"] {
    _id,
    name,
    price,
    image,
    suggestedProducts[]-> {
      _id,
      name,
      price,
      image
    }
  }
`);
```

**Visual Editing**: Sanity Presentation Tool configured to preview changes at `localhost:3000` before publishing

**Deployment**: Studio auto-deploys to Sanity Cloud via GitHub Actions (on push to `main` branch)

### External Dependencies

- **Sanity CMS** (`@sanity/client`, `next-sanity`) - Headless CMS for marketing content
- **shadcn/ui** + Radix UI primitives (40+ components in `src/components/ui/`)
- **Framer Motion** (page transitions, animations)
- **React Hook Form** + Zod (form validation with schema)
- **Recharts** (seller dashboard analytics)
- **Embla Carousel** (`embla-carousel-react`) - product image galleries
- **Lucide React** (icon system)
- **date-fns** (date formatting)
- **Axios** (HTTP client for backend API)
- ~~**Clerk**~~ (NOT used - auth is custom JWT implementation)

### Environment Variables Required

**Frontend** (`.env.local` in root):
```env
# NestJS Backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1       # Railway production backend
NEXT_PUBLIC_LOCAL_API_URL=http://localhost:3000/api/v1  # Local backend for email endpoints
NEXT_PUBLIC_USE_MOCK_DATA=false                         # false=real API, true=mock data
NEXT_PUBLIC_EMAIL_SERVICE_ENV=local                     # Routes auth endpoints to local backend
NEXT_PUBLIC_ENABLE_API_LOGGING=true                     # Console logs for API debugging

# Sanity CMS (optional - uses defaults if not set)
NEXT_PUBLIC_SANITY_PROJECT_ID=ydg9aldo9kaje3bknmhjq0pl
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

**Sanity Studio** (`studio/.env.local`):
```env
SANITY_STUDIO_PROJECT_ID=ydg9aldo9kaje3bknmhjq0pl
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_URL=http://localhost:3000  # For Visual Editing
```

## Known Limitations & TODOs

- **TypeScript/ESLint errors ignored during builds** (`typescript.ignoreBuildErrors: true` in `next.config.ts`) - temporary for rapid development
- **Verify OTP page** uses 4-digit input - needs update to 6-digit for backend compatibility
- **Seller pages partial mock data**: refunds, notifications, settings, handover centers, shipping channels
- **WebSocket not implemented**: Real-time device updates planned (see `src/lib/websocket/`)
- **Sanity CMS partial integration**: Homepage (hero, features, FAQ) implemented, blog/team pages need component updates
- **Email service**: Auth endpoints require local backend with email configured (Railway backend pending email setup)
- ~~**Clerk**~~ - NOT used, removed from architecture (custom JWT auth instead)

---

## 🔐 Complete Authentication System Documentation

### Authentication Architecture

MASH uses a **JWT-based authentication system with email verification codes**. The system is designed to provide secure, passwordless registration with traditional email/password login as a fallback.

### Registration Flow (Email Verification Code)

#### Step-by-Step Process

1. **User Registration** (`/signup` page)

   ```typescript
   // POST /api/v1/auth/register
   const response = await apiRequest("/auth/register", {
     method: "POST",
     body: JSON.stringify({
       firstName: "Juan",
       lastName: "Dela Cruz",
       email: "juan@example.com",
       password: "SecurePass123",
     }),
   });
   ```

2. **Backend Generates Code**

   - System generates random 6-digit code (e.g., "123456")
   - Stores code in database with expiration (usually 10 minutes)
   - Sends email to user with verification code

3. **User Receives Email**

   ```
   Subject: Verify your MASH account

   Your verification code is: 123456

   This code expires in 10 minutes.
   ```

4. **User Enters Code** (`/verify-otp` page)

   ```tsx
   // Component uses InputOTP from shadcn/ui
   import {
     InputOTP,
     InputOTPGroup,
     InputOTPSlot,
   } from "@/components/ui/input-otp";

   <InputOTP maxLength={6} value={code} onChange={setCode}>
     <InputOTPGroup>
       <InputOTPSlot index={0} />
       <InputOTPSlot index={1} />
       <InputOTPSlot index={2} />
       <InputOTPSlot index={3} />
       <InputOTPSlot index={4} />
       <InputOTPSlot index={5} />
     </InputOTPGroup>
   </InputOTP>;
   ```

5. **Verify Code** (API Call)

   ```typescript
   // POST /api/v1/auth/verify-email-code
   const response = await apiRequest("/auth/verify-email-code", {
     method: "POST",
     body: JSON.stringify({
       email: "juan@example.com",
       code: "123456",
     }),
   });

   // Response format:
   // {
   //   "success": true,
   //   "data": {
   //     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   //     "refreshToken": "refresh_token_here",
   //     "user": {
   //       "id": "user_001",
   //       "email": "juan@example.com",
   //       "firstName": "Juan",
   //       "lastName": "Dela Cruz",
   //       "role": "BUYER"
   //     }
   //   }
   // }
   ```

6. **Store Token & Authenticate**

   ```typescript
   import { setAuthToken } from "@/lib/auth";

   // Store JWT token in cookie
   setAuthToken(response.data.token, rememberMe);

   // Store refresh token in localStorage
   localStorage.setItem("refreshToken", response.data.refreshToken);

   // Redirect to onboarding or shop
   router.push("/onboarding");
   ```

### Login Flow (Email + Password)

For users who already have accounts:

```typescript
// POST /api/v1/auth/login
const response = await apiRequest("/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email: "juan@example.com",
    password: "SecurePass123",
  }),
});

// Same response format as verify-email-code
// Store token and redirect
setAuthToken(response.data.token, rememberMe);
router.push("/shop");
```

### Auth State Management

#### Client-Side Auth Check

```typescript
import { isAuthenticated } from "@/lib/auth";

// In components or pages
if (!isAuthenticated()) {
  router.push("/login");
}
```

#### Server-Side Auth (Middleware)

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!authToken;

  // Protect routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}
```

### Token Refresh Flow

When access token expires (401 response):

```typescript
// In src/lib/api-client.ts
if (response.status === 401) {
  const refreshToken = getRefreshToken();

  // POST /api/v1/auth/refresh
  const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  if (refreshResponse.ok) {
    const data = await refreshResponse.json();

    // Update tokens
    setAuthToken(data.data.accessToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);

    // Retry original request
    return apiRequest(endpoint, options);
  }

  // Refresh failed - logout
  logout();
  window.location.href = "/login";
}
```

### Logout Flow

```typescript
import { logout } from "@/lib/auth";

function handleLogout() {
  // Clears auth-token cookie
  // Clears refreshToken from localStorage
  // Clears user data from storage
  logout();

  // Redirect to home
  router.push("/");
}
```

### Backend API Endpoints

| Endpoint                  | Method | Purpose                  | Request Body                               | Response                                                 |
| ------------------------- | ------ | ------------------------ | ------------------------------------------ | -------------------------------------------------------- |
| `/auth/register`          | POST   | Register new user        | `{ firstName, lastName, email, password }` | `{ success: true, message: "Check email" }`              |
| `/auth/verify-email-code` | POST   | Verify 6-digit code      | `{ email, code }`                          | `{ success: true, data: { token, user } }`               |
| `/auth/login`             | POST   | Email/password login     | `{ email, password }`                      | `{ success: true, data: { token, user } }`               |
| `/auth/refresh`           | POST   | Refresh access token     | `{ refreshToken }`                         | `{ success: true, data: { accessToken, refreshToken } }` |
| `/auth/resend-code`       | POST   | Resend verification code | `{ email }`                                | `{ success: true, message: "Code sent" }`                |
| `/auth/forgot-password`   | POST   | Request password reset   | `{ email }`                                | `{ success: true, message: "Check email" }`              |
| `/auth/reset-password`    | POST   | Reset password with code | `{ email, code, newPassword }`             | `{ success: true, message: "Password reset" }`           |

### Implementation Checklist

#### Frontend Tasks

- [x] Signup page with form validation (`/signup`)
- [ ] Update verify-otp page to 6-digit input (currently 4-digit)
- [x] Login page with email/password (`/login`)
- [x] Auth utility functions (`src/lib/auth.ts`)
- [x] API client with token management (`src/lib/api-client.ts`)
- [x] Middleware route protection (`src/middleware.ts`)
- [ ] Password reset flow (`/forgot-password`, `/reset-password`)
- [ ] Resend code functionality in verify-otp page
- [ ] Social login buttons (Google, Facebook) - UI ready, needs OAuth implementation

#### Backend Tasks

- [ ] Implement `/auth/register` endpoint
- [ ] Implement email verification code generation & storage
- [ ] Set up email service (SendGrid, AWS SES, or similar)
- [ ] Implement `/auth/verify-email-code` endpoint
- [ ] Implement JWT token generation
- [ ] Implement `/auth/refresh` endpoint for token refresh
- [ ] Implement `/auth/resend-code` endpoint
- [ ] Add rate limiting to prevent code spam
- [ ] Add code expiration (10 minutes recommended)
- [ ] Implement password reset flow endpoints

### Security Considerations

1. **Code Expiration**: Verification codes should expire after 10 minutes
2. **Rate Limiting**: Limit code resend requests (1 per minute per email)
3. **Attempt Limits**: Lock account after 5 failed verification attempts
4. **Token Storage**:
   - Access tokens in HTTP-only cookies (if backend supports)
   - Refresh tokens in localStorage (XSS risk - consider alternatives)
5. **HTTPS Only**: All auth endpoints must use HTTPS in production
6. **CORS**: Backend must whitelist frontend domain
7. **Password Requirements**: Minimum 8 characters (enforced in frontend validation)

### Error Handling

```typescript
// Common auth error responses from backend
{
  "success": false,
  "message": "Invalid verification code",
  "error": "INVALID_CODE"
}

{
  "success": false,
  "message": "Verification code expired",
  "error": "CODE_EXPIRED"
}

{
  "success": false,
  "message": "Email already registered",
  "error": "EMAIL_EXISTS"
}

{
  "success": false,
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS"
}
```

### Testing Authentication

```bash
# Test registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Juan","lastName":"Test","email":"juan@test.com","password":"Test1234"}'

# Test code verification
curl -X POST http://localhost:3000/api/v1/auth/verify-email-code \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","code":"123456"}'

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","password":"Test1234"}'
```

---

**Last Updated**: November 12, 2025  
**For Questions**: See `docs/` folder for comprehensive documentation  
**Auth Status**: Frontend ready, backend endpoints need implementation
