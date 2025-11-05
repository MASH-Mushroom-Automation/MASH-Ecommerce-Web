# MASH E-Commerce Platform - Future Development Plan
**Version:** 1.0  
**Created:** November 6, 2025  
**Timeline:** 14 weeks MVP + Ongoing enhancements

---

## 📅 PHASE 1: BACKEND INTEGRATION (Weeks 1-3)
**Priority:** 🔴 **CRITICAL - BLOCKER**  
**Status:** Not Started

### Week 1: Schema Synchronization

#### Day 1-2: Fix Enum Mismatches
**Files to Update:**
- `src/types/api.ts` - Update all enums
- `src/app/(shop)/checkout/page.tsx` - Payment method enum
- `src/app/(seller)/seller/orders/**/*.tsx` - Order status enum (10+ files)

**Tasks:**
- [ ] Update `SellerOrderStatus` to match backend `OrderStatus`
  ```typescript
  // Change from: "Pending", "Completed"
  // Change to: "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"
  ```
- [ ] Update payment method enum
  ```typescript
  // Change from: ["cod", "gcash", "card"]
  // Change to: ["CASH_ON_DELIVERY", "GCASH", "CREDIT_CARD", "DEBIT_CARD", "MAYA"]
  ```
- [ ] Find and replace all string literals
- [ ] Update status badge mappings
- [ ] Update filter logic

#### Day 3-4: User Profile Schema
**Files to Update:**
- `src/types/api.ts` - UserProfile interface
- `src/lib/api/user.ts` - Mock data
- `src/hooks/useUserProfile.ts` - Hook logic
- `src/components/layout/header.tsx` - Three-state seller logic

**Tasks:**
- [ ] Add missing fields to UserProfile:
  ```typescript
  clerkId: string;
  username?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'GROWER' | 'BUYER';
  isActive: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  ```
- [ ] Map `sellerStatus` logic to `role === 'GROWER'`
- [ ] Update all profile usage sites

#### Day 5: Product Schema
**Files to Update:**
- `src/types/api.ts` - Product interfaces
- `src/lib/api/products.ts` - Mock data
- `src/app/(seller)/seller/products/**/*.tsx` - Product CRUD

**Tasks:**
- [ ] Add missing backend fields:
  ```typescript
  slug: string;
  sku?: string;
  comparePrice?: number;
  costPrice?: number;
  minStock: number;
  categories: string[];  // Change from category: string
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  ```
- [ ] Update backend schema (request from backend team):
  ```prisma
  description: String?
  weight: String?
  growerId: String?
  grower: User? @relation(...)
  ```

### Week 2: Core API Integration

#### Day 1-2: Authentication Endpoints
**Files to Update:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/lib/api/user.ts`
- `src/app/api/auth/**/*.ts`

**Tasks:**
- [ ] Create `.env.local`:
  ```bash
  NEXT_PUBLIC_API_URL=https://your-backend.com
  CLERK_SECRET_KEY=sk_...
  ```
- [ ] Connect login endpoint
  ```typescript
  POST /api/auth/login
  Body: { identifier: string, password: string }
  Returns: { token, user, expiresAt }
  ```
- [ ] Connect signup endpoint
  ```typescript
  POST /api/auth/signup
  Body: { email, password, firstName, lastName }
  ```
- [ ] Handle JWT token storage
- [ ] Implement refresh token logic
- [ ] Test authentication flow

#### Day 3-4: Product Endpoints
**Files to Update:**
- `src/lib/api/products.ts`
- `src/app/api/products/**/*.ts`
- `src/hooks/useProducts.ts`

**Tasks:**
- [ ] Connect GET /api/products (list with filters)
- [ ] Connect GET /api/products/:id (single product)
- [ ] Connect POST /api/products (create - sellers only)
- [ ] Connect PUT /api/products/:id (update)
- [ ] Connect DELETE /api/products/:id (soft delete)
- [ ] Remove all MOCK_PRODUCTS fallbacks
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test CRUD operations

#### Day 5: Order Endpoints
**Files to Update:**
- `src/lib/api/orders.ts`
- `src/app/api/orders/**/*.ts`
- `src/hooks/useOrders.ts`

**Tasks:**
- [ ] Connect POST /api/orders (create order)
- [ ] Connect GET /api/orders (list user orders)
- [ ] Connect GET /api/orders/:id (order details)
- [ ] Connect PUT /api/orders/:id/status (update status)
- [ ] Remove MOCK_ORDERS fallbacks
- [ ] Test checkout flow
- [ ] Test order history

### Week 3: Seller & Admin Integration

#### Day 1-2: Seller Dashboard
**Files to Update:**
- `src/lib/api/seller.ts`
- `src/app/api/seller/**/*.ts`
- `src/hooks/useSeller.ts`

**Tasks:**
- [ ] Connect GET /api/seller/dashboard (stats)
- [ ] Connect GET /api/seller/orders
- [ ] Connect PUT /api/seller/orders/:id/status
- [ ] Connect GET /api/seller/products
- [ ] Connect GET /api/seller/inventory
- [ ] Connect PUT /api/seller/inventory/:id (update stock)
- [ ] Remove all MOCK_SELLER_* data
- [ ] Test seller order management
- [ ] Test inventory management

#### Day 3: Seller Application Flow
**Files to Update:**
- `src/app/(misc)/start-selling/page.tsx`
- `src/lib/api/seller.ts`

**Tasks:**
- [ ] Connect POST /api/seller/application (submit)
- [ ] Connect GET /api/seller/application/status
- [ ] Test three-state flow:
  - Submit application (none → pending)
  - Admin approval (pending → approved)
  - Header updates automatically
- [ ] Test rejection flow

#### Day 4-5: Admin Integration
**Files to Update:**
- `src/types/admin.ts`
- `src/config/admin.ts`
- Admin dashboard repo (separate)

**Tasks:**
- [ ] Implement admin API endpoints:
  ```typescript
  GET /api/admin/seller-applications
  PUT /api/admin/seller-applications/:id/approve
  PUT /api/admin/seller-applications/:id/reject
  GET /api/admin/products
  GET /api/admin/orders
  GET /api/admin/analytics
  ```
- [ ] Set up WebSocket for admin notifications
- [ ] Test admin approval flow
- [ ] E2E test: Application → Approval → Seller Dashboard

---

## 📅 PHASE 2: SECURITY & VALIDATION (Week 4)
**Priority:** 🔴 **CRITICAL - BLOCKER**  
**Status:** Not Started

### Day 1-2: Add Missing Form Validation

#### Product Forms
**Files:**
- `src/app/(seller)/seller/products/new/page.tsx`
- `src/app/(seller)/seller/products/[id]/edit/page.tsx`

**Create:** `src/schemas/product.schema.ts`
```typescript
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(1, "Category required"),
  price: z.number().positive("Price must be > 0").max(999999),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  weight: z.number().positive(),
  unit: z.enum(["g", "kg", "lb", "oz"]),
  images: z.array(z.string().url()).min(1, "At least 1 image required").max(10),
  tags: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

**Tasks:**
- [ ] Create schema file
- [ ] Integrate with react-hook-form
- [ ] Add error display
- [ ] Test validation

#### Profile Form
**File:** `src/app/(user)/profile/my-information/page.tsx`

**Create:** `src/schemas/profile.schema.ts`
```typescript
export const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?\d{10,15}$/),
  newPassword: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number")
    .optional()
    .or(z.literal("")),
  confirmPassword: z.string().optional(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

#### Card Payment Validation
**File:** `src/app/(shop)/checkout/page.tsx`

**Add to existing schema:**
```typescript
const cardSchema = z.object({
  cardNumber: z.string()
    .regex(/^\d{16}$/, "Card number must be 16 digits")
    .refine(luhnCheck, "Invalid card number"),
  cardExpiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format: MM/YY")
    .refine(notExpired, "Card has expired"),
  cardCvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3-4 digits"),
});

function luhnCheck(cardNumber: string): boolean {
  // Implement Luhn algorithm
}
```

### Day 3: Rate Limiting & CSRF

**Create:** `src/middleware.ts`
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiter } from '@/lib/rate-limiter';

const limiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 100,
});

export async function middleware(request: NextRequest) {
  // Rate limiting
  const identifier = request.ip || 'anonymous';
  const isAllowed = await limiter.check(identifier);
  
  if (!isAllowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // CSRF protection for mutations
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRF(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}
```

**Create:** `src/lib/rate-limiter.ts`
```typescript
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private config: { windowMs: number; max: number }) {}
  
  async check(identifier: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const recentRequests = requests.filter(
      time => now - time < this.config.windowMs
    );
    
    if (recentRequests.length >= this.config.max) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
}
```

### Day 4: Input Sanitization

**Install:** `npm install dompurify isomorphic-dompurify`

**Create:** `src/lib/sanitize.ts`
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 10000); // Max length
}
```

**Apply to all form submissions:**
```typescript
const sanitized = {
  name: sanitizeInput(data.name),
  description: sanitizeHTML(data.description),
  // ... rest
};
```

### Day 5: Security Audit

**Checklist:**
- [ ] All forms have Zod validation
- [ ] All endpoints have rate limiting
- [ ] CSRF tokens on mutations
- [ ] Input sanitization on text fields
- [ ] XSS prevention (DOMPurify)
- [ ] SQL injection prevention (Prisma)
- [ ] Password strength requirements
- [ ] Session management secure
- [ ] HTTPS only cookies
- [ ] Content Security Policy headers

**Run:** OWASP ZAP scan

---

## 📅 PHASE 3: PERFORMANCE (Weeks 5-6)
**Priority:** 🟡 **HIGH**  
**Status:** Not Started

### Week 5: Caching & Optimization

#### Day 1-2: React Query Setup

**Install:** `npm install @tanstack/react-query`

**Setup:** `src/app/layout.tsx`
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Convert hooks:**
```typescript
// Before
export function useProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    ProductsApi.getProducts().then(setProducts);
  }, []);
  return { products };
}

// After
export function useProducts(params) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => ProductsApi.getProducts(params),
    staleTime: 5 * 60 * 1000,
  });
}
```

#### Day 3: Redis Integration

**Setup backend caching:**
```typescript
// Backend: Cache product list
const cacheKey = `products:${JSON.stringify(filters)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const products = await prisma.product.findMany({...});
await redis.setex(cacheKey, 300, JSON.stringify(products)); // 5 min
return products;
```

#### Day 4-5: Image Optimization

**Update:** `next.config.ts`
```typescript
const nextConfig = {
  images: {
    domains: ['your-cdn.com'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};
```

**Use next/image everywhere:**
```tsx
<Image
  src={product.image}
  alt={product.name}
  width={300}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL={product.blurDataURL}
/>
```

### Week 6: Bundle Optimization

#### Day 1-2: Code Splitting

**Dynamic imports for heavy components:**
```typescript
// Before
import ProductGallery from '@/components/product/ProductGallery';

// After
const ProductGallery = dynamic(
  () => import('@/components/product/ProductGallery'),
  { loading: () => <ProductGallerySkeleton /> }
);
```

**Apply to:**
- Product gallery/carousel
- Rich text editors
- Charts/analytics
- Map components

#### Day 3: Bundle Analysis

**Install:** `npm install @next/bundle-analyzer`

**Add to next.config.ts:**
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

**Run:** `ANALYZE=true npm run build`

**Tasks:**
- [ ] Identify large bundles
- [ ] Split vendor chunks
- [ ] Remove unused dependencies
- [ ] Tree-shake properly

#### Day 4-5: Performance Monitoring

**Install:** `npm install @vercel/analytics web-vitals`

**Setup:** `src/app/layout.tsx`
```typescript
import { Analytics } from '@vercel/analytics/react';
import { reportWebVitals } from '@/lib/vitals';

export default function RootLayout({ children }) {
  useEffect(() => {
    reportWebVitals((metric) => {
      console.log(metric);
      // Send to analytics
    });
  }, []);
  
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
```

**Target metrics:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TTI < 3.5s

---

## 📅 PHASE 4: ENHANCED FEATURES (Weeks 7-10)
**Priority:** 🟢 **MEDIUM**  
**Status:** Not Started

### Week 7-8: Real-time Features

#### WebSocket Integration
- [ ] Order status updates
- [ ] New notification alerts
- [ ] Inventory alerts
- [ ] Admin notifications

#### Advanced Search
- [ ] Elasticsearch integration
- [ ] Autocomplete
- [ ] Fuzzy matching
- [ ] Filter facets

### Week 9: Seller Enhancements
- [ ] Bulk product import (CSV)
- [ ] Bulk product export
- [ ] Advanced analytics
- [ ] Sales forecasting
- [ ] Customer management

### Week 10: User Enhancements
- [ ] Product recommendations (AI)
- [ ] Order tracking with map
- [ ] Social login
- [ ] Wishlist sync
- [ ] Saved payment methods

---

## 📅 PHASE 5: TESTING (Weeks 11-12)
**Priority:** 🟡 **HIGH**

### Week 11: Automated Testing

#### Unit Tests (Jest)
- [ ] Setup Jest + React Testing Library
- [ ] Test all custom hooks
- [ ] Test utility functions
- [ ] Test components
- [ ] Target: 80% coverage

#### Integration Tests
- [ ] Test API routes
- [ ] Test authentication flow
- [ ] Test checkout flow
- [ ] Test seller dashboard

### Week 12: E2E & Manual Testing

#### E2E Tests (Playwright)
- [ ] Setup Playwright
- [ ] Test critical user journeys:
  - User signup → browse → checkout
  - Seller signup → product → order
  - Admin approval flow
- [ ] Test on Chrome, Safari, Firefox

#### Manual Testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Load testing (k6)
- [ ] Security penetration testing

---

## 📅 PHASE 6: LAUNCH PREP (Weeks 13-14)
**Priority:** 🔴 **CRITICAL**

### Week 13: Infrastructure

- [ ] Production environment setup
- [ ] CDN configuration (Vercel/Cloudflare)
- [ ] Monitoring setup (Sentry, DataDog)
- [ ] Backup strategy
- [ ] CI/CD pipeline (GitHub Actions)

### Week 14: Documentation & Launch

- [ ] API documentation (Swagger)
- [ ] User guides
- [ ] Admin manual
- [ ] Launch checklist
- [ ] Go live! 🚀

---

## 📅 PHASE 7: POST-LAUNCH (Ongoing)

### Monitoring
- Error rates
- Performance metrics
- Uptime
- Analytics

### Feature Enhancements
- Mobile app (React Native)
- PWA
- Multi-language
- Dark mode
- AR product preview
- Subscription service
- Loyalty program

---

**Total Timeline:** 14 weeks to MVP launch + ongoing enhancements

*End of Plan*
