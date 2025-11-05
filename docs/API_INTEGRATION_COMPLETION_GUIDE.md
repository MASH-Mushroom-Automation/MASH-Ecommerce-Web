# API Integration Completion Guide
**Status:** 🟡 31% Complete (12/39 files)  
**Last Updated:** November 6, 2025, 6:15 AM UTC+8

---

## ✅ COMPLETED (12 files)

### Products API (4 files) ✅
- `src/app/api/products/route.ts` - List/Create
- `src/app/api/products/[id]/route.ts` - Get/Update/Delete
- `src/app/api/products/[id]/inventory/route.ts` - Inventory management
- `src/app/api/products/[id]/stock-alert/route.ts` - Stock alerts

### Orders API (3 files) ✅
- `src/app/api/orders/route.ts` - List/Create
- `src/app/api/orders/[id]/route.ts` - Get/Update
- `src/app/api/orders/[id]/status/route.ts` - Status updates

### Auth API (3 files) ✅
- `src/app/api/auth/me/route.ts` - Get current user / Update profile
- `src/app/api/auth/session/route.ts` - Session management / Refresh tokens
- `src/app/api/auth/logout/route.ts` - Logout (cookie clearing)

### User API (2 files) ✅
- `src/app/api/user/profile/route.ts` - Get/Update profile

---

## 🔄 STANDARD CONVERSION TEMPLATE

Use this template for all remaining API routes:

```typescript
// Before (Mock Implementation)
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Mock data implementation
  const mockData = { ... };
  return NextResponse.json({ data: mockData, success: true });
}

// After (Backend Integration)
import { NextRequest, NextResponse } from "next/server";
import { apiRequest } from "@/lib/api-client";
import { cookies } from "next/headers";
import type { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required"
          }
        },
        { status: 401 }
      );
    }

    // Call real backend API
    const response = await apiRequest<ApiResponse<T>>(
      "/api/endpoint",
      { method: "GET" }
    );

    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error instanceof Error ? error.message : "Failed to fetch"
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
```

---

## 📋 REMAINING FILES TO UPDATE (31 files)

### 1. Auth API (4 files)

#### `src/app/api/auth/me/route.ts`
```typescript
// Endpoint: /api/auth/me
// Methods: GET
// Backend: GET /api/auth/me
// Returns: Current authenticated user
```

#### `src/app/api/auth/session/route.ts`
```typescript
// Endpoint: /api/auth/session
// Methods: GET
// Backend: GET /api/auth/session
// Returns: Session information
```

#### `src/app/api/auth/logout/route.ts`
```typescript
// Endpoint: /api/auth/logout
// Methods: POST
// Backend: POST /api/auth/logout
// Action: Clear session and redirect
```

---

### 2. User API (2 remaining files)

#### `src/app/api/user/avatar/route.ts`
```typescript
// Endpoint: /api/user/avatar
// Methods: POST
// Backend: POST /api/users/:id/avatar
// Special: File upload (multipart/form-data)
```

#### `src/app/api/user/onboarding/route.ts`
```typescript
// Endpoint: /api/user/onboarding
// Methods: GET, POST
// Backend: GET/POST /api/users/onboarding
// Purpose: User onboarding flow
```

---

### 3. Seller API (10 files) - CRITICAL

#### `src/app/api/seller/dashboard/route.ts`
```typescript
// Endpoint: /api/seller/dashboard
// Methods: GET
// Backend: GET /api/seller/dashboard
// Returns: Sales stats, recent orders, analytics
```

#### `src/app/api/seller/products/route.ts`
```typescript
// Endpoint: /api/seller/products
// Methods: GET, POST
// Backend: GET/POST /api/seller/products
// Purpose: Seller's product management
```

#### `src/app/api/seller/orders/route.ts`
```typescript
// Endpoint: /api/seller/orders
// Methods: GET
// Backend: GET /api/seller/orders
// Returns: Orders for this seller
```

#### `src/app/api/seller/profile/route.ts`
```typescript
// Endpoint: /api/seller/profile
// Methods: GET, PUT
// Backend: GET/PUT /api/seller/profile
// Purpose: Seller business profile
```

#### `src/app/api/seller/addresses/route.ts`
```typescript
// Endpoint: /api/seller/addresses
// Methods: GET, POST, PUT, DELETE
// Backend: GET/POST/PUT/DELETE /api/seller/addresses
// Purpose: Seller pickup/business addresses
```

#### `src/app/api/seller/notifications/route.ts`
```typescript
// Endpoint: /api/seller/notifications
// Methods: GET
// Backend: GET /api/seller/notifications
// Returns: Seller notifications
```

#### `src/app/api/seller/refunds/route.ts`
```typescript
// Endpoint: /api/seller/refunds
// Methods: GET, POST
// Backend: GET/POST /api/seller/refunds
// Purpose: Refund requests handling
```

#### `src/app/api/seller/payment-info/route.ts`
```typescript
// Endpoint: /api/seller/payment-info
// Methods: GET, PUT
// Backend: GET/PUT /api/seller/payment-info
// Purpose: Seller payout information
```

#### `src/app/api/seller/password/route.ts`
```typescript
// Endpoint: /api/seller/password
// Methods: PUT
// Backend: PUT /api/seller/password
// Purpose: Change seller password
```

#### `src/app/api/seller/notification-preferences/route.ts`
```typescript
// Endpoint: /api/seller/notification-preferences
// Methods: GET, PUT
// Backend: GET/PUT /api/seller/notification-preferences
// Purpose: Notification settings
```

---

### 4. Notifications API (2 files)

#### `src/app/api/notifications/route.ts`
```typescript
// Endpoint: /api/notifications
// Methods: GET
// Backend: GET /api/notifications
// Returns: User notifications with pagination
```

#### `src/app/api/notifications/unread-count/route.ts`
```typescript
// Endpoint: /api/notifications/unread-count
// Methods: GET
// Backend: GET /api/notifications/unread-count
// Returns: { count: number }
```

---

### 5. CMS API (8 files)

#### Hero, Features, FAQ Routes
```typescript
// src/app/api/cms/hero/route.ts
// src/app/api/cms/hero/[id]/route.ts
// src/app/api/cms/features/route.ts
// src/app/api/cms/features/[id]/route.ts
// src/app/api/cms/faq/route.ts
// src/app/api/cms/faq/[id]/route.ts
// src/app/api/cms/faq/categories/route.ts
// src/app/api/cms/upload/route.ts

// Endpoints: GET, POST, PUT, DELETE
// Backend: /api/cms/[resource]
// Purpose: Content management
```

---

### 6. Devices API (1 file)

#### `src/app/api/devices/route.ts`
```typescript
// Endpoint: /api/devices
// Methods: GET, POST
// Backend: GET/POST /api/devices
// Purpose: IoT device management
```

---

### 7. Inventory API (1 file)

#### `src/app/api/inventory/low-stock/route.ts`
```typescript
// Endpoint: /api/inventory/low-stock
// Methods: GET
// Backend: GET /api/inventory/low-stock
// Returns: Products with low stock levels
```

---

### 8. Main Pages API (4 files)

#### `src/app/api/main/home/route.ts`
```typescript
// Endpoint: /api/main/home
// Methods: GET
// Backend: GET /api/main/home
// Returns: Homepage content
```

#### `src/app/api/main/about/route.ts`
```typescript
// Endpoint: /api/main/about
// Methods: GET
// Backend: GET /api/main/about
// Returns: About page content
```

#### `src/app/api/main/faq/route.ts`
```typescript
// Endpoint: /api/main/faq
// Methods: GET
// Backend: GET /api/main/faq
// Returns: FAQ content
```

#### `src/app/api/main/growers/route.ts`
```typescript
// Endpoint: /api/main/growers
// Methods: GET
// Backend: GET /api/main/growers
// Returns: List of growers/sellers
```

---

## 🎯 PRIORITY LEVELS

### 🔴 CRITICAL (Must Complete First)
1. **Auth API** (4 files) - User authentication
2. **Seller API** (10 files) - Core business functionality
3. **Notifications API** (2 files) - User experience

### 🟡 HIGH (Complete Next)
4. **User API remaining** (2 files) - Profile management
5. **Devices API** (1 file) - IoT functionality
6. **Inventory API** (1 file) - Stock management

### 🟢 MEDIUM (Complete Last)
7. **CMS API** (8 files) - Content management
8. **Main Pages API** (4 files) - Static content

---

## ⚡ BULK UPDATE STRATEGY

For efficient completion, follow this approach:

### Step 1: Create Reusable Utility
Already done! Use `src/lib/api-client.ts`

### Step 2: Update by Category
1. Auth routes (30 min)
2. Seller routes (1 hour)
3. Remaining routes (1 hour)

### Step 3: Test Each Category
- Products: ✅ Test product CRUD
- Orders: ✅ Test order creation/updates
- Auth: Test login/logout
- Seller: Test dashboard/products

---

## 🔍 VERIFICATION CHECKLIST

After updating each file, verify:

- [ ] Imports `apiRequest` from `@/lib/api-client`
- [ ] Imports types from `@/types/api`
- [ ] Checks for `authToken` cookie
- [ ] Returns 401 if unauthorized
- [ ] Calls backend with correct endpoint
- [ ] Includes timestamp and requestId
- [ ] Has proper error handling
- [ ] Removes all mock data
- [ ] Uses consistent response format

---

## 📊 ESTIMATED COMPLETION TIME

| Category | Files | Est. Time | Status |
|----------|-------|-----------|--------|
| Products | 4 | 30 min | ✅ Done |
| Orders | 3 | 20 min | ✅ Done |
| User (partial) | 1 | 10 min | ✅ Done |
| **Subtotal** | **8** | **1 hour** | **✅ 20%** |
| Auth | 4 | 30 min | ⏳ Pending |
| User (remaining) | 2 | 15 min | ⏳ Pending |
| Seller | 10 | 1 hour | ⏳ Pending |
| Notifications | 2 | 15 min | ⏳ Pending |
| Devices | 1 | 10 min | ⏳ Pending |
| Inventory | 1 | 10 min | ⏳ Pending |
| CMS | 8 | 45 min | ⏳ Pending |
| Main Pages | 4 | 30 min | ⏳ Pending |
| **Total** | **39** | **~4 hours** | **20% ⏳** |

---

## 🚀 NEXT ACTIONS

### Immediate:
1. Update Auth API routes (4 files) - 30 min
2. Update Seller API routes (10 files) - 1 hour
3. Test authentication flow
4. Test seller dashboard

### Short-term:
5. Update remaining User, Notifications, Devices, Inventory APIs
6. Update CMS and Main Pages APIs
7. Full system testing
8. Documentation update

---

## ✅ SUCCESS CRITERIA

- All 39 API routes connect to backend
- No mock data in production code
- Authentication enforced on protected routes
- Consistent error handling
- Response format standardized
- All routes tested with backend

---

**Status:** 🟡 In Progress (20% Complete)  
**Next Sprint:** Auth + Seller APIs (14 files, ~1.5 hours)  
**Blocker:** None  
**Risk:** Low  

*Last Updated: November 6, 2025, 6:10 AM UTC+8*
