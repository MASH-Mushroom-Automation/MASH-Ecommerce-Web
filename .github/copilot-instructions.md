# MASH E-Commerce Platform - AI Coding Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Principles](#architecture-principles)
3. [Critical Development Workflows](#critical-development-workflows)
4. [Project-Specific Conventions](#project-specific-conventions)
5. [Essential Documentation](#essential-documentation)
6. [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
7. [Integration Points](#integration-points)
8. [Known Limitations & TODOs](#known-limitations--todos)
9. [🔐 Complete Authentication System](#-complete-authentication-system-documentation)

---

## Project Overview
MASH is a mushroom e-commerce platform built with **Next.js 15 (App Router)**, TypeScript, Tailwind CSS, and shadcn/ui. The app connects to a NestJS + Prisma + PostgreSQL backend hosted on Railway. This is a production-ready frontend with hybrid mock/real data support.

**Tech Stack:**
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui (Radix UI)
- **Backend**: NestJS + Prisma + PostgreSQL (Railway hosted)
- **Auth**: JWT-based with 6-digit email verification codes
- **State**: React Hook Form + Zod validation
- **Build**: Turbopack enabled for faster builds

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
- `docs/AUTH_IMPLEMENTATION_GUIDE.md` - **Complete authentication setup** (register → verify → login → forgot password)
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
- **Verify OTP page** currently uses 4-digit input - needs update to 6-digit for email verification codes

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
       password: "SecurePass123"
     })
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
   import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
   
   <InputOTP maxLength={6} value={code} onChange={setCode}>
     <InputOTPGroup>
       <InputOTPSlot index={0} />
       <InputOTPSlot index={1} />
       <InputOTPSlot index={2} />
       <InputOTPSlot index={3} />
       <InputOTPSlot index={4} />
       <InputOTPSlot index={5} />
     </InputOTPGroup>
   </InputOTP>
   ```

5. **Verify Code** (API Call)
   ```typescript
   // POST /api/v1/auth/verify-email-code
   const response = await apiRequest("/auth/verify-email-code", {
     method: "POST",
     body: JSON.stringify({
       email: "juan@example.com",
       code: "123456"
     })
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
    password: "SecurePass123"
  })
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
    body: JSON.stringify({ refreshToken })
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

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/auth/register` | POST | Register new user | `{ firstName, lastName, email, password }` | `{ success: true, message: "Check email" }` |
| `/auth/verify-email-code` | POST | Verify 6-digit code | `{ email, code }` | `{ success: true, data: { token, user } }` |
| `/auth/login` | POST | Email/password login | `{ email, password }` | `{ success: true, data: { token, user } }` |
| `/auth/refresh` | POST | Refresh access token | `{ refreshToken }` | `{ success: true, data: { accessToken, refreshToken } }` |
| `/auth/resend-code` | POST | Resend verification code | `{ email }` | `{ success: true, message: "Code sent" }` |
| `/auth/forgot-password` | POST | Request password reset | `{ email }` | `{ success: true, message: "Check email" }` |
| `/auth/reset-password` | POST | Reset password with code | `{ email, code, newPassword }` | `{ success: true, message: "Password reset" }` |

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
