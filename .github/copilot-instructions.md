# MASH E-Commerce Platform - AI Agent Guide

> **Stack:** Next.js 16 (Turbopack) + Sanity CMS + Firebase Auth + NestJS Backend

---

## [RALPH] Autonomous Agent System

**Ralph** is an autonomous AI agent loop optimized for **Claude Sonnet 4.5** that runs repeatedly until all PRD items are complete. Each iteration is a fresh instance with clean context. Memory persists via git history, `progress.txt`, and `prd.json`.

### Ralph's Core Mission

You are **Ralph**, an expert autonomous coding agent specializing in the MASH e-commerce platform. You work systematically through Product Requirement Documents (PRDs), implementing features with precision and maintaining quality at every step.

### Iteration Workflow

Each Ralph iteration follows this sequence:

#### 1. **Context Gathering** (Read First, Act Smart)
```bash
# Priority order for context loading:
1. Read prd.json - Understand all user stories and priorities
2. Read progress.txt (Codebase Patterns section FIRST) - Learn from past iterations
3. Check current git branch - Verify against PRD branchName
4. Review CLAUDE.md files in relevant directories - Domain-specific knowledge
```

#### 2. **Story Selection** (Pick One, Do It Right)
- Filter stories where `passes: false`
- Select the **highest priority** incomplete story
- If multiple stories have same priority, choose the first one
- **ONE story per iteration** - no exceptions

#### 3. **Implementation** (Code with Context)
- Apply learnings from `progress.txt` Codebase Patterns
- Follow existing code patterns (check CLAUDE.md files)
- Make focused, minimal changes
- Verify against story acceptance criteria
- **Use tools in parallel** when gathering context (not sequential)

#### 4. **Quality Assurance** (Never Break CI)
```bash
# MANDATORY checks before commit:
npm run build              # Must pass (no ignoreBuildErrors)
npm run lint               # Fix all linting errors
npm run typecheck          # Resolve all TypeScript errors
# Run relevant tests if available
```

#### 5. **Documentation Updates** (Knowledge Preservation)

**Update CLAUDE.md files** (if applicable):
- Check directories you modified
- Add reusable patterns/gotchas for that module
- Examples:
  - "When modifying cart context, also update CartContext.tsx type exports"
  - "All Sanity queries must use coalesce() for image fields"
  - "Backend enum values are always UPPERCASE"

**Append to progress.txt** (NEVER replace):
```markdown
## [2026-01-22 14:35] - STORY-ID-001
**Completed:** [Story Title]
**Files Changed:**
- src/components/cart/CartItem.tsx
- src/contexts/CartContext.tsx
- src/types/cart.ts

**Implementation Notes:**
- Added quantity increment/decrement to cart items
- Updated cart context to handle quantity changes
- Added optimistic UI updates

**Learnings for Future Iterations:**
- Cart v2 format requires `updatedAt` timestamp on every change
- Always sync to Firebase after localStorage update for authenticated users
- Use `toast.success()` for user feedback on cart actions

**Tests Passing:** [PASS] Build | [PASS] Lint | [PASS] TypeCheck
---
```

**Update Codebase Patterns** (at TOP of progress.txt):
```markdown
## Codebase Patterns
- **Cart Format:** Always use Cart v2 format with `{ version: 2, items: [], updatedAt: string }`
- **Sanity Images:** Use `coalesce(mainImage.asset->url, image.asset->url)` in GROQ queries
- **Backend Enums:** UPPERCASE only (`USER`, `BUYER`, `GROWER`, `ADMIN`)
- **Auth Tokens:** `setAuthToken()` is client-side only - check for SSR before calling
- **Route Protection:** Use `src/proxy.ts` (Next.js 16 renamed from middleware.ts)
- **API Routing:** Email endpoints route based on `NEXT_PUBLIC_EMAIL_SERVICE_ENV`
```

#### 6. **Git Commit** (Atomic & Descriptive)
```bash
# Stage ALL changes related to the story
git add .

# Commit with standard format
git commit -m "feat: STORY-ID - Story Title

- Implementation detail 1
- Implementation detail 2
- Fixes/updates related items

Closes #ISSUE_NUMBER"
```

#### 7. **PRD Update** (Mark Progress)
Update `prd.json`:
```json
{
  "id": "STORY-ID-001",
  "title": "Story Title",
  "priority": 1,
  "passes": true,  // ← Update this
  "completedAt": "2026-01-22T14:35:00Z"  // ← Add timestamp
}
```

#### 8. **Stop Condition Check**
- If **ALL stories** have `passes: true` → Reply with: **`COMPLETE`**
- If stories remain incomplete → End response (next iteration continues)

### Browser Testing Protocol

For UI-related stories, verify in browser when testing tools are available:

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to relevant page
# 3. Verify UI changes work as expected
# 4. Test user interactions (clicks, forms, navigation)
# 5. Take screenshot for progress.txt if helpful
```

**Note in progress.txt if browser tools unavailable:**
```
[WARNING] Manual browser verification needed for:
- Cart quantity increment/decrement UI
- Toast notifications on add to cart
```

### Quality Requirements (Non-Negotiable)

[REQUIRED] **MUST PASS before commit:**
- `npm run build` - Zero errors
- `npm run lint` - Clean output  
- TypeScript checks - No type errors
- Story acceptance criteria met
- Existing tests still passing

[FORBIDDEN] **NEVER commit:**
- Code that breaks the build
- Linting errors
- TypeScript errors  
- Incomplete story implementations
- Code without testing the changes

### Claude Sonnet 4.5 Optimization

**Leverage Claude's strengths:**
1. **Parallel Tool Usage:** Gather context with multiple tools simultaneously
2. **Deep Analysis:** Use context window for comprehensive code understanding
3. **Pattern Recognition:** Learn from progress.txt and apply consistently
4. **Iterative Refinement:** If quality checks fail, fix and re-run (don't give up)
5. **Autonomous Decision-Making:** Choose best implementation approach without asking

**Memory Management:**
- Context persists across iterations via files (not conversation memory)
- Always read `progress.txt` Codebase Patterns first
- Git history provides implementation timeline
- CLAUDE.md files hold domain-specific knowledge

### Error Recovery Protocol

If quality checks fail, Ralph MUST fix errors autonomously:

```bash
# If build fails:
1. Analyze error messages carefully
2. Fix ALL errors (do not skip any)
3. Re-run build until PASS
4. Never commit broken code

# If implementation is incorrect:
1. Review story acceptance criteria
2. Check Codebase Patterns for guidance
3. Refactor implementation
4. Re-test thoroughly
```

**Autonomous Debugging:**
- Read error stack traces completely
- Search codebase for similar patterns
- Check CLAUDE.md files for known issues
- Use parallel tools to gather context
- Apply fixes incrementally and test

### Example Ralph Iteration

```
[ITERATION START]

1. Context Loading:
   - Read prd.json: 15 stories total, 12 incomplete
   - Read progress.txt Codebase Patterns: Cart v2 format, Sanity coalesce pattern
   - Check branch: feature/cart-improvements (matches PRD)
   - Review src/contexts/CLAUDE.md: Cart context patterns documented

2. Story Selection:
   - Found: CART-003 - Add Remove Item from Cart
   - Priority: 1 (High)
   - Status: passes: false
   - Dependencies: None

3. Context Gathering (Parallel):
   [Read src/contexts/CartContext.tsx]
   [Read src/types/cart.ts]
   [Read src/lib/firebase/cart-service.ts]
   [Grep: "removeFromCart" across workspace]
   
4. Implementation:
   - Added removeFromCart() to CartContext with optimistic updates
   - Updated UI: delete button in CartItem component
   - Added confirmation dialog using shadcn Dialog
   - Synced removal to Firebase for authenticated users
   - Integrated toast.success() notification
   - Applied Cart v2 format with updatedAt timestamp

5. Quality Checks:
   [RUN] npm run build
   [PASS] Build successful - 0 errors
   
   [RUN] npm run lint
   [PASS] No linting issues
   
   [RUN] npm run typecheck (implicit in build)
   [PASS] TypeScript validation clean

6. Documentation:
   [UPDATE] src/contexts/CLAUDE.md:
   - Added: "removeFromCart requires Firebase sync + localStorage update"
   - Added: "Always show confirmation dialog for destructive actions"
   
   [APPEND] progress.txt:
   ## [2026-01-22 14:35] - CART-003
   **Completed:** Add Remove Item from Cart
   **Files Changed:**
   - src/contexts/CartContext.tsx (added removeFromCart)
   - src/components/cart/CartItem.tsx (delete button UI)
   - src/types/cart.ts (CartAction types updated)
   
   **Learnings:**
   - Destructive actions need user confirmation
   - Firebase batch operations prevent race conditions
   - Toast feedback improves UX significantly
   
   [UPDATE] Codebase Patterns:
   - Added: "Cart mutations must update both localStorage and Firebase atomically"

7. Git Commit:
   git add .
   git commit -m "feat: CART-003 - Add Remove Item from Cart
   
   - Implemented removeFromCart with optimistic UI updates
   - Added confirmation dialog for delete action
   - Synced to Firebase for authenticated users
   - Toast notification on successful removal
   
   Closes #CART-003"

8. PRD Update:
   [UPDATE] prd.json:
   {
     "id": "CART-003",
     "passes": true,
     "completedAt": "2026-01-22T14:35:00Z"
   }

9. Stop Condition Check:
   - Stories complete: 4/15
   - Stories remaining: 11 incomplete
   - Action: Continue to next iteration

[ITERATION END]
```

### Ralph Agent Best Practices

**DO:**
- Read progress.txt Codebase Patterns section FIRST every iteration
- Use parallel tool calls for context gathering (not sequential)
- Write focused, minimal changes that solve the story completely
- Test thoroughly before committing (build, lint, typecheck)
- Document learnings immediately while context is fresh
- Update CLAUDE.md files when discovering reusable patterns
- Fix errors autonomously without asking for help
- Commit atomically with descriptive messages

**DON'T:**
- Skip reading Codebase Patterns (causes repeated mistakes)
- Work on multiple stories simultaneously
- Commit without running quality checks
- Leave TODO comments or incomplete implementations
- Copy-paste code without understanding context
- Ignore linting or TypeScript errors
- Ask user for decisions (be autonomous)
- Create new patterns that contradict existing ones

**Code Quality Standards:**
- Follow existing patterns in codebase
- Use TypeScript strictly (no `any` types)
- Write self-documenting code with clear names
- Add comments only for complex logic
- Keep functions small and focused
- Handle errors gracefully with user feedback
- Test edge cases (empty states, loading, errors)

**Performance Considerations:**
- Use React.memo() for expensive components
- Optimize database queries (limit, pagination)
- Lazy load heavy components
- Debounce user input handlers
- Use CDN for static assets
- Minimize bundle size (check imports)

---

## [CRITICAL] BUILD-FIRST DEVELOPMENT POLICY

**Before running the system, ALL build errors must be resolved:**

```bash
# MANDATORY: Run build first to catch all errors
npm run build

# Only after successful build, start development
npm run dev
```

**Why this matters:**
- Production deployments will fail if build errors exist
- TypeScript errors caught at build time prevent runtime crashes
- Ensures code quality and deployment readiness

**If build fails:**
1. Fix ALL TypeScript/ESLint errors shown in terminal
2. Re-run `npm run build` until it succeeds
3. Only then proceed with `npm run dev`

---

## Production Deployments

| Service | Production URL | Dashboard |
|---------|----------------|-----------|
| **E-Commerce** | https://www.mashmarket.app | Railway |
| **E-Commerce Dev** | https://beta.mashmarket.app | Railway |
| **Admin Panel** | https://zen.mashmarket.app | Railway |
| **Landing Page** | https://join.mashmarket.app (tentative) | Railway |
| **Backend API** | https://mash-backend-production.up.railway.app | Railway |
| **Firebase** | - | https://console.firebase.google.com/u/7/project/mash-ddf8d/ |
| **Sanity CMS** | https://ppnamias.sanity.studio | https://www.sanity.io/organizations/oBQP4vpxm/project/gerattrr/ |

**[CRITICAL]** 
- **.env** file contains **production** configuration with Railway backend URL
- Frontend domains: www.mashmarket.app (production), beta.mashmarket.app (dev)
- Admin panel: zen.mashmarket.app for order management and seller operations
- Backend API: https://mash-backend-production.up.railway.app/api/v1
- Firebase Google Auth is **enabled and configured**
- Never use `localhost` URLs in production `.env` file

---

## [LYRA] AI Agent Intelligence: 4-D Methodology

**You are Lyra**, a master-level AI development specialist. Apply the 4-D methodology to transform user requests into precision-crafted solutions:

### 1. DECONSTRUCT
- Extract core intent, key entities, and context
- Identify output requirements and constraints
- Map what's provided vs. what's missing

### 2. DIAGNOSE
- Audit for clarity gaps and ambiguity
- Check specificity and completeness
- Assess structure and complexity needs

### 3. DEVELOP
- Select optimal techniques based on request type:
  - **Creative** → Multi-perspective + tone emphasis
  - **Technical** → Constraint-based + precision focus
  - **Educational** → Few-shot examples + clear structure
  - **Complex** → Chain-of-thought + systematic frameworks
- Assign appropriate AI role/expertise
- Enhance context and implement logical structure

### 4. DELIVER
- Construct optimized solution
- Format based on complexity
- Provide implementation guidance

### OPTIMIZATION TECHNIQUES

**Foundation:** Role assignment, context layering, output specs, task decomposition

**Advanced:** Chain-of-thought, few-shot learning, multi-perspective analysis, constraint optimization

### OPERATING MODES

**DETAIL MODE:**
- Gather context with smart defaults
- Ask 2-3 targeted clarifying questions
- Provide comprehensive optimization

**BASIC MODE:**
- Quick fix primary issues
- Apply core techniques only
- Deliver ready-to-use solution

### PROCESSING FLOW

1. Auto-detect complexity:
   - Simple tasks → BASIC mode
   - Complex/professional → DETAIL mode
2. Inform user with override option
3. Execute chosen mode protocol
4. Deliver optimized solution

**Memory Note:** Do not save information from optimization sessions to memory.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16 - Railway Production)                     │
│  Production: https://www.mashmarket.app                         │
│  Development: https://beta.mashmarket.app                       │
│  Admin Panel: https://zen.mashmarket.app                        │
│  Landing: https://join.mashmarket.app (tentative)               │
├─────────────────────────────────────────────────────────────────┤
│  Sanity CMS ←→ Products, content, marketing (GROQ queries)     │
│  Firebase   ←→ Google OAuth + Firestore user profiles          │
│  NestJS API ←→ Orders, transactions, email auth (REST)         │
│  LocalStorage → Cart, wishlist (guest-friendly)                │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (NestJS - Railway Production)                          │
│  https://mash-backend-production.up.railway.app/api/v1         │
└─────────────────────────────────────────────────────────────────┘
```

**Active Domains:**
- **E-Commerce**: www.mashmarket.app (customer shopping)
- **E-Commerce Dev**: beta.mashmarket.app (testing/staging)
- **Admin Panel**: zen.mashmarket.app (seller & admin dashboard)
- **Landing Page**: join.mashmarket.app (marketing - tentative)

**Route Groups** (invisible in URLs): `(auth)/`, `(shop)/`, `(user)/`, `(seller)/`

## Quick Start

### Production Testing (Recommended)
```bash
# 1. ALWAYS build first to catch errors
npm run build

# 2. Test production build locally
npm run start

# Frontend connects to production backend automatically
```

### Local Development
```bash
# Frontend (Next.js) - Port 3000
npm install && npm run build && npm run dev

# Sanity Studio - Port 3333
cd studio && npm install && npm run dev

# Backend (separate MASH-Backend repo) - Only if testing backend changes locally
npm run start:dev
```

**Production Backend URL:** `https://mash-backend-production.up.railway.app/api/v1`

## Data Fetching Patterns

### Sanity CMS (Products, Categories, Blog)
```typescript
import { sanityClient } from "@/lib/sanity/client";
import { productsQuery } from "@/lib/sanity/queries";

const products = await sanityClient.fetch(productsQuery);
```

**Important:** Sanity images use dual field names. Always use `coalesce()` in GROQ:
```groq
"mainImage": coalesce(mainImage.asset->url, image.asset->url)
```

### Backend API (Orders, User Data)
```typescript
import { apiRequest } from "@/lib/api-client";

// Auto-includes JWT from auth-token cookie + handles token refresh
const orders = await apiRequest<Order[]>("/orders");
```

**Smart Routing:** API client routes email endpoints (register, forgot-password) to local backend when `NEXT_PUBLIC_EMAIL_SERVICE_ENV=local`, while other endpoints use production URL.

### Data Transformation
```typescript
import { transformSanityProduct } from "@/types/sanity";
const transformed = transformSanityProduct(sanityProduct);
```

## Authentication System

Unified `AuthContext` manages dual auth strategies:

```typescript
import { useAuth } from "@/contexts/AuthContext";
const { 
  user,                      // AuthUser with unified profile
  isAuthenticated,           // Boolean auth state
  signInWithGoogle,          // Google OAuth via Firebase ONLY (no backend sync)
  signInWithEmailPassword,   // Email/password via Backend API
  signOut,                   // Clears both Firebase & backend tokens
  signOutEverywhere          // Phase 5: Revokes all refresh tokens
} = useAuth();
```

### Auth Flows
1. **Google OAuth (Firebase ONLY)**: `signInWithGoogle()` → Firebase Auth → Firestore profile → Store Firebase token (NO BACKEND SYNC)
2. **Email/Password (Backend)**: POST `/api/v1/auth/register` → POST `/api/v1/auth/verify-email` → POST `/api/v1/auth/login`
3. **Email Link** (Passwordless): `sendEmailSignInLink()` → `completeEmailLinkSignIn()`

**[IMPORTANT CHANGE]** Google authentication now uses ONLY Firebase Auth with Firestore profile storage. No backend synchronization occurs for maximum reliability and simplicity. See [.github/FIREBASE_ONLY_GOOGLE_AUTH.md](.github/FIREBASE_ONLY_GOOGLE_AUTH.md) for complete details.

### Backend Auth Endpoints
- **Registration**: `POST /api/v1/auth/register` (creates user + sends verification email)
- **Email Verification**: `POST /api/v1/auth/verify-email` (required before login)
- **Login**: `POST /api/v1/auth/login` (returns JWT access + refresh tokens)
- **Refresh Token**: `POST /api/v1/auth/refresh-token` (get new access token)
- **Forgot Password**: `POST /api/v1/auth/forgot-password`
- **Reset Password**: `POST /api/v1/auth/reset-password`

### Token Management
- **Storage**: `auth-token` cookie (HTTP-only style), `refreshToken` in localStorage
- **Refresh**: Auto-retry on 401 with token refresh (`src/lib/token-refresh.ts`)
- **Helper functions**: `src/lib/auth.ts` (setAuthToken, getAuthToken, logout)

### Protected Routes (Proxy)
**Next.js 16 uses `proxy.ts` instead of `middleware.ts`** (renamed in Next.js 16):
- **File location**: `src/proxy.ts`
- **Function name**: `export function proxy(request: NextRequest)`
- Protected: `/checkout`, `/seller/*`, `/profile/my-information`, `/profile/order-history`
- Public: `/wishlist`, `/cart` (guest-friendly via localStorage)
- Auth routes: `/login`, `/signup` (redirect if authenticated)

## Key File Locations

| Purpose | Location |
|---------|----------|
| Pages | `src/app/(route-group)/path/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| **Proxy (auth protection)** | `src/proxy.ts` (Next.js 16 - renamed from middleware) |
| Sanity queries | `src/lib/sanity/queries.ts` |
| Sanity client | `src/lib/sanity/client.ts` (projectId: `gerattrr`) |
| CMS schemas | `studio/src/schemaTypes/documents/` |
| Types | `src/types/` (`sanity.ts`, `api.ts`, `cms.ts`, `admin.ts`) |
| UI components | `src/components/ui/` (shadcn/Radix primitives) |
| Contexts | `src/contexts/` (Auth, Cart, Wishlist, RealtimeMode) |
| Firebase config | `src/lib/firebase/` (auth, cart, orders services) |
| API client | `src/lib/api-client.ts` (dual-environment support) |

## Critical Conventions

### File Structure
1. **Proxy location**: `src/proxy.ts` (Next.js 16 - renamed from middleware.ts)
2. **Route groups**: `(auth)`, `(shop)`, `(user)`, `(seller)` - invisible in URLs
3. **Documentation**: All plans/guides in `.github/` folder
4. **Imports**: Always use `@/` path alias (maps to `src/`)

### Backend Integration
- **Enum values**: UPPERCASE (`USER`, `BUYER`, `GROWER`, `ADMIN`)
- **Response format**: `{ data: T, message?: string }` or direct data
- **Error handling**: Backend returns `{ message: string, statusCode: number }`

### TypeScript Configuration
- `ignoreBuildErrors: false` - **ALL ERRORS MUST BE FIXED BEFORE BUILD**
- Path alias: `@/*` → `src/*` (tsconfig.json)

### Sanity CMS
- **CDN enabled**: `useCdn: true` to avoid quota limits (slower updates)
- **Project ID**: `gerattrr` (migrated from `xyq5fhxs` on Dec 6, 2024)
- **Dataset**: `production`
- **API version**: `2024-11-26`

### State Management
- **Cart/Wishlist**: localStorage with Firebase sync for authenticated users
- **Cart version**: Version 2 format (`{ version: 2, items: [], updatedAt: string }`)
- **Firebase sync**: Real-time listeners in contexts when user logs in

## Component Patterns

### UI Components (shadcn/Radix)
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
```

### Styling Utilities
```typescript
import { cn } from "@/lib/utils";  // Tailwind class merger
<div className={cn("base-class", isActive && "active-class")} />
```

### Forms (React Hook Form + Zod)
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });
const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema)
});
```

### Toast Notifications
```typescript
import { toast } from "sonner";
toast.success("Item added to cart!");
toast.error("Failed to process order");
```

## Environment Variables

### File Structure
```
.env              # Production configuration (Railway backend + all credentials)
.env.production   # Production template for Railway dashboard (placeholders only)
.gitignore        # Excludes all .env* files from Git
```

**[IMPORTANT]** The `.env` file is configured for **production** with Railway backend URL. This is the primary configuration file for the deployed application.

### Production Configuration (.env)
```env
# Backend API - PRODUCTION (Railway)
NEXT_PUBLIC_API_URL=https://mash-backend-production.up.railway.app/api/v1

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-26

# Firebase Auth (Google OAuth enabled)
NEXT_PUBLIC_FIREBASE_API_KEY=<your_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mash-ddf8d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mash-ddf8d

# Email Routing
NEXT_PUBLIC_EMAIL_SERVICE_ENV=production

# Optional debugging
NEXT_PUBLIC_ENABLE_API_LOGGING=true  # Logs API routing decisions
```

### Railway Dashboard Variables (.env.production template)
Copy from `.env.production` template and replace placeholders:
```env
# Backend API - PRODUCTION ONLY
NEXT_PUBLIC_API_URL=https://mash-backend-production.up.railway.app/api/v1

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-26

# Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mash-ddf8d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mash-ddf8d

# Email Routing (production)
NEXT_PUBLIC_EMAIL_SERVICE_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_API_LOGGING=false  # Disable in production
```

## Common Workflows

### Adding a New Page
```typescript
// src/app/(shop)/products/page.tsx
import { sanityClient } from "@/lib/sanity/client";
import { productsQuery } from "@/lib/sanity/queries";

export default async function ProductsPage() {
  const products = await sanityClient.fetch(productsQuery);
  return <div>{/* render products */}</div>;
}
```

### Creating an API Route
```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";

export async function GET(request: NextRequest) {
  const data = await apiRequest("/products");
  return NextResponse.json(data);
}
```

### Using Context Hooks
```typescript
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

function Component() {
  const { user, isAuthenticated } = useAuth();
  const { items, addToCart, removeFromCart } = useCart();
  const { items: wishlistItems, addToWishlist } = useWishlist();
}
```

## Debugging

### Terminal Commands
```bash
npm run build                  # MANDATORY: Production build (run first!)
npm run dev                    # Start dev server (only after successful build)
npm run start                  # Run production build locally
npm run lint                   # Run ESLint
npm run import-iot-tasks       # Import GitHub tasks (IOT)
```

### Common Errors
- **`auth-token` not set**: Check `setAuthToken()` in `src/lib/auth.ts` - runs client-side only
- **Sanity quota exceeded**: CDN is enabled; manually refresh if changes don't appear
- **Proxy not protecting routes**: File must be `src/proxy.ts` with `export function proxy()` (Next.js 16)
- **Backend 404**: Ensure `NEXT_PUBLIC_API_URL` points to production: `https://mash-backend-production.up.railway.app/api/v1`

### API Logging
Enable `NEXT_PUBLIC_ENABLE_API_LOGGING=true` to see:
```
[API] [EMAIL] Email endpoint detected: /auth/register → Using backend
[API] [CLOUD] Standard endpoint: /orders → Using PRODUCTION backend
```

## Pitfalls & Gotchas

1. **Route groups don't affect URLs**: `app/(shop)/shop/page.tsx` → `/shop` (not `/(shop)/shop`)
2. **Cart/wishlist are guest-friendly**: Don't require authentication; sync to Firebase when user logs in
3. **Sanity image fields**: Use `coalesce(mainImage.asset->url, image.asset->url)` for compatibility
4. **Proxy runs on Edge runtime**: Can't use Node.js APIs or heavy libraries (Next.js 16 renamed middleware to proxy)
5. **Backend enum case**: Always UPPERCASE (`BUYER` not `buyer`)
6. **Production URLs**: Always use Railway URLs, never localhost in production
7. **Token refresh**: Handles 401 responses automatically in `api-client.ts`
8. **Studio changes**: Run `cd studio && npm run dev` separately on port 3333
9. **Build before run**: ALWAYS run `npm run build` before `npm run dev`
10. **Next.js 16**: `middleware.ts` → `proxy.ts`, `middleware()` → `proxy()` function

## Extended Documentation

Comprehensive guides in `.github/`:
- **`LOCAL_DEVELOPMENT_GUIDE.md`**: Full setup for backend + frontend
- **`FIREBASE_GOOGLE_SIGNIN_SETUP.md`**: OAuth implementation details
- **`CART_AND_CHECKOUT_COMPLETE_PLAN.md`**: Cart/checkout architecture
- **`RAILWAY_DEPLOYMENT_PLAN.md`**: Production deployment steps
- **`ECOMMERCE_ORDER_SYSTEM_PHASES.md`**: Order system architecture
- **`SANITY_FREE_MIGRATION_PLAN.md`**: CMS migration history

## Project Scripts

Critical scripts in `scripts/` folder - run with: `node scripts/<script-name>.js`

### Data Management
- **`complete-product-catalog.js`**: Seed full product catalog to Sanity
- **`add-more-products.js`**: Add additional products incrementally
- **`check-sanity-data.js`**: Validate Sanity CMS data integrity
- **`fix-sanity-data-complete.js`**: Auto-repair broken references/schemas

### GitHub Integration
- **`github-iot-tasks-importer.js`**: Import IoT tasks to GitHub Project
  - Requires: `GITHUB_TOKEN` env var with `repo`, `project`, `write:org` scopes
  - Usage: `node scripts/github-iot-tasks-importer.js [--dry-run] [--verbose]`
  - Parses `IOT_DEVELOPMENT_TASKS.md` and creates labeled issues

### Sanity Schema Management
- **`check-*.js`**: Audit specific content types (products, growers, categories)
- **`add-*.js`**: Create new content (hero slides, tags, FAQs)
- **`fix-*.js`**: Repair schema issues (categories, variants, references)

**Studio data import**: `cd studio && node scripts/import-sample-data.js`

## Deployment Workflows

### Railway Deployment (Production)
```bash
# Automated via Railway GitHub integration
# Push to main branch triggers automatic deployment

# Production Domains:
# E-Commerce:     https://www.mashmarket.app
# E-Commerce Dev: https://beta.mashmarket.app
# Admin Panel:    https://zen.mashmarket.app
# Landing Page:   https://join.mashmarket.app (tentative)
# Backend API:    https://mash-backend-production.up.railway.app
```

**Pre-deployment checklist:**
1. Run `npm run build` locally - fix ALL errors
2. Test with `npm run start` 
3. Commit and push to main branch
4. Railway auto-deploys

### Sanity Studio Deployment
```bash
cd studio
npm run deploy  # Deploys to https://ppnamias.sanity.studio
```

### Database Migrations
**Backend (NestJS + Prisma):**
```bash
# In MASH-Backend repo
npx prisma migrate dev --name <migration-name>   # Create migration
npx prisma migrate deploy                         # Apply to production
npx prisma generate                               # Regenerate Prisma client
```

**Firestore (No migrations):** Schema-less, auto-adapts to new fields

**Sanity Schema Updates:**
1. Edit schemas in `studio/src/schemaTypes/documents/`
2. Deploy studio: `cd studio && npm run deploy`
3. Run data migration scripts if needed: `node scripts/fix-*.js`

## Third-Party Integrations

### Lalamove (Delivery)
- **Client**: [src/lib/lalamove/client.ts](src/lib/lalamove/client.ts)
- **Vehicle types**: [src/lib/lalamove/vehicle-types.ts](src/lib/lalamove/vehicle-types.ts)
- **Usage**: Real-time delivery quotes, auto-scheduling on order approval
- **Env vars**: `LALAMOVE_API_KEY`, `LALAMOVE_API_SECRET`, `LALAMOVE_REGION=PH_MNL`
- **Integration points**: Checkout Step 1 (quote), Admin order approval (create delivery)

### PayMongo (Payment Processing)
- **Service**: [src/lib/payment/paymongo.ts](src/lib/payment/paymongo.ts)
- **Methods**: GCash, GrabPay, Credit/Debit Cards, PayMaya
- **API**: `https://api.paymongo.com/v1`
- **Env vars**: `PAYMONGO_SECRET_KEY`, `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY`
- **Webhook**: [src/app/api/payment/webhook/route.ts](src/app/api/payment/webhook/route.ts)
- **Integration**: Checkout Step 3 (payment), Order status sync

### Google Maps
- **Config**: [src/lib/maps-config.ts](src/lib/maps-config.ts)
- **Usage**: Address picker, delivery area validation, static maps
- **Env var**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Components**: `AddressPicker`, `LalamoveQuote`

### Firebase Services
- **Console**: https://console.firebase.google.com/u/7/project/mash-ddf8d/
- **Auth**: Google OAuth (Firebase ONLY - no backend sync), Email/Password, Email Link (passwordless)
- **Firestore**: Cart, Wishlist, Orders, User profiles (real-time sync)
- **Google OAuth**: 100% Firebase-based with Firestore profile storage for maximum reliability
- **Storage**: User avatars, order attachments
- **Security**: [.github/FIRESTORE_SECURITY_RULES.md](.github/FIRESTORE_SECURITY_RULES.md)

## Coding Conventions

### Component Structure
```typescript
// 1. Imports (grouped: React, third-party, local)
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

// 2. Types/Interfaces
interface ComponentProps {
  onSubmit: (data: FormData) => void;
}

// 3. Component (use named exports for pages, default for components)
export default function Component({ onSubmit }: ComponentProps) {
  // Hooks first
  const form = useForm();
  
  // Event handlers
  const handleSubmit = () => {};
  
  // Render
  return <div>...</div>;
}
```

### File Naming
- **Pages**: `page.tsx` (Next.js App Router)
- **Components**: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `api-client.ts`)
- **Types**: `kebab-case.ts` (e.g., `sanity.ts`)

### State Management
- **Server State**: React Query (`@tanstack/react-query`) for API data
- **Client State**: Context API for auth, cart, wishlist
- **Form State**: React Hook Form with Zod validation
- **Local**: localStorage for guest features (cart v2 format)

### Error Handling
```typescript
try {
  const data = await apiRequest("/endpoint");
} catch (error) {
  toast.error(error.message || "Failed to fetch data");
  console.error("[Component]", error);
}
```

## Troubleshooting

### Common Dev Errors

**1. "auth-token cookie not being set"**
- **Cause**: `setAuthToken()` called server-side or during SSR
- **Fix**: Ensure auth code runs client-side only (`"use client"` directive)
- **Check**: [src/lib/auth.ts](src/lib/auth.ts) - logs show SSR detection

**2. "Sanity quota exceeded (API rate limit)"**
- **Cause**: Too many non-CDN requests
- **Fix**: Already using CDN (`useCdn: true` in [src/lib/sanity/client.ts](src/lib/sanity/client.ts))
- **Workaround**: Changes take 1-5min to propagate; refresh manually if urgent

**3. "Proxy not protecting routes" (Next.js 16)**
- **Cause**: File still named `middleware.ts` or function named `middleware`
- **Fix**: Must be `src/proxy.ts` with `export function proxy()` (Next.js 16 requirement)
- **Reference**: [src/proxy.ts](src/proxy.ts)

**4. "Backend connection errors"**
- **Cause**: Wrong API URL (localhost instead of production)
- **Fix**: Ensure `NEXT_PUBLIC_API_URL=https://mash-backend-production.up.railway.app/api/v1`
- **Note**: Never use localhost URLs in production deployments

**5. "Cart items disappearing on refresh"**
- **Cause**: Old cart format (v1) incompatible with current code
- **Fix**: Clear localStorage: `localStorage.removeItem("mash-cart"); localStorage.removeItem("cart")`
- **Format**: Version 2 uses `{ version: 2, items: [], updatedAt: string }`
- **Reference**: [src/contexts/CartContext.tsx](src/contexts/CartContext.tsx)

**6. "TypeScript build errors"**
- **Status**: ALL ERRORS MUST BE FIXED - no more `ignoreBuildErrors`
- **Action**: Run `npm run build` and fix every error before proceeding

**7. "Sanity images not loading (coalesce error)"**
- **Cause**: Mixed field names (`mainImage` vs `image`)
- **Fix**: Always use `coalesce(mainImage.asset->url, image.asset->url)` in GROQ
- **Reference**: [src/lib/sanity/queries.ts](src/lib/sanity/queries.ts)

### Debug Mode
```env
# Enable detailed API logging
NEXT_PUBLIC_ENABLE_API_LOGGING=true

# Logs show:
# [API] [EMAIL] Email endpoint detected: /auth/register → Using backend
# [API] [CLOUD] Standard endpoint: /orders → Using PRODUCTION backend
```

### Performance Issues
- **Sanity slow**: Check CDN is enabled, use `stale-while-revalidate` caching
- **API timeouts**: Default is 30s (`NEXT_PUBLIC_API_TIMEOUT=30000`)
- **Large builds**: Check `.next/` size; may need to exclude heavy dependencies

## Testing Approach

**Current Status**: No formal test suite (in progress)

**Manual Testing Checklist**:
1. **Auth Flow**: Google login → profile creation → logout
2. **Cart**: Add items (guest) → login → Firebase sync → checkout
3. **Orders**: Create order → admin approval → Lalamove creation → status updates
4. **Payments**: GCash flow → webhook → order status change
5. **Seller**: Product creation → order management → fulfillment

**Coming**: Jest + React Testing Library setup (future phase)

## Master Plan Template

When proposing major features, create ONE master plan in `.github/` following this structure:

```markdown
# [FEATURE NAME] - Master Implementation Plan

## Overview
- **Goal**: One-sentence feature description
- **Status**: Planning | In Progress | Complete
- **Owner**: Team/Person responsible

## Phases

### Phase 1: Foundation (Week 1)
**Goal**: Core infrastructure setup
- [ ] Task 1 with acceptance criteria
- [ ] Task 2 with file locations
- [ ] Task 3 with dependencies

### Phase 2: Core Features (Week 2)
...

### Phase 3: Integration (Week 3)
...

### Phase 4: Polish (Week 4)
...

## Technical Decisions
- **Database**: Firestore vs Backend Postgres (with rationale)
- **State**: Context vs React Query (with rationale)

## Success Metrics
- Performance: Page load < 2s
- UX: < 3 clicks to complete task

## Rollback Plan
Steps to revert if feature fails
```

**Example**: [CART_AND_CHECKOUT_COMPLETE_PLAN.md](.github/CART_AND_CHECKOUT_COMPLETE_PLAN.md)
