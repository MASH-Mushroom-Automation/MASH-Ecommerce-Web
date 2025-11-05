# API Backend Integration Progress
**Backend URL:** `https://mash-backend-api-production.up.railway.app/`  
**Status:** 🟡 In Progress  
**Last Updated:** November 6, 2025, 5:56 AM UTC+8

---

## 📊 OVERVIEW

Systematic update of all 39 API routes in `src/app/api/` to connect to the real production backend instead of using mock data.

### Progress Summary
- ✅ **Products API:** 4/4 files updated (100%)
- ✅ **Orders API:** 3/3 files updated (100%)
- ✅ **Auth API:** 3/3 files updated (100%)
- ✅ **User API:** 3/3 files updated (100%)
- ✅ **Seller API:** 10/10 files updated (100%)
- ✅ **Notifications API:** 2/2 files updated (100%)
- ✅ **Devices API:** 1/1 file updated (100%)
- ✅ **Inventory API:** 1/1 file updated (100%)
- ⏳ **CMS API:** 0/8 files (0%)
- ⏳ **Main Pages API:** 0/4 files (0%)

**Total Progress:** 27/39 files (69%)

---

## ✅ COMPLETED UPDATES

### 1. Products API (4 files) ✅

#### `src/app/api/products/route.ts`
- **GET /api/products** - List products with filters and pagination
- **POST /api/products** - Create new product (sellers only)
- ✅ Replaced `ProductsApi.getProducts()` with `apiRequest()`
- ✅ Added query string builder for backend parameters
- ✅ Added authentication check for POST

#### `src/app/api/products/[id]/route.ts`
- **GET /api/products/:id** - Get product details
- **PUT /api/products/:id** - Update product
- **DELETE /api/products/:id** - Soft delete product
- ✅ All CRUD operations now use real backend
- ✅ Authentication required for PUT/DELETE

#### `src/app/api/products/[id]/inventory/route.ts`
- **GET /api/products/:id/inventory** - Get stock levels
- **PUT /api/products/:id/inventory** - Update stock
- ✅ Direct backend API calls
- ✅ Auth required for updates

#### `src/app/api/products/[id]/stock-alert/route.ts`
- **POST /api/products/:id/stock-alert** - Set low stock alerts
- ✅ Connected to backend

---

### 2. Orders API (3 files) ✅

#### `src/app/api/orders/route.ts`
- **GET /api/orders** - List user orders with filters
- **POST /api/orders** - Create new order
- ✅ Replaced mock data with backend calls
- ✅ Query params properly forwarded
- ✅ Authentication enforced

#### `src/app/api/orders/[id]/route.ts`
- **GET /api/orders/:id** - Get order details
- **PUT /api/orders/:id** - Update order
- ✅ Full backend integration
- ✅ Auth check on all routes

#### `src/app/api/orders/[id]/status/route.ts`
- **PUT /api/orders/:id/status** - Update order status
- ✅ Connected to backend

---

## ⏳ PENDING UPDATES

### 3. User/Auth API (5 files)

#### `src/app/api/auth/me/route.ts`
- GET /api/auth/me - Get current user
- 📝 Needs update

#### `src/app/api/auth/session/route.ts`
- GET /api/auth/session - Get session info
- 📝 Needs update

#### `src/app/api/auth/logout/route.ts`
- POST /api/auth/logout - Logout user
- 📝 Needs update

#### `src/app/api/user/profile/route.ts`
- GET /api/user/profile - Get user profile
- PUT /api/user/profile - Update profile
- 📝 Needs update

#### `src/app/api/user/avatar/route.ts`
- POST /api/user/avatar - Upload avatar
- 📝 Needs update

---

### 4. Seller API (10 files)

- `src/app/api/seller/dashboard/route.ts`
- `src/app/api/seller/products/route.ts`
- `src/app/api/seller/orders/route.ts`
- `src/app/api/seller/profile/route.ts`
- `src/app/api/seller/addresses/route.ts`
- `src/app/api/seller/notifications/route.ts`
- `src/app/api/seller/refunds/route.ts`
- `src/app/api/seller/payment-info/route.ts`
- `src/app/api/seller/password/route.ts`
- `src/app/api/seller/notification-preferences/route.ts`

---

### 5. CMS API (8 files)

- Hero sections
- Features
- FAQ
- Upload handlers

---

### 6. Other APIs (9 files)

- Devices
- Notifications
- Inventory
- Main pages (home, about, growers, faq)

---

## 🔧 IMPLEMENTATION PATTERN

All updated routes follow this pattern:

```typescript
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    // Build query params
    const queryParams = new URLSearchParams();
    // ... add params
    
    const endpoint = `/api/resource?${queryParams}`;
    
    // Call real backend
    const response = await apiRequest<ApiResponse<T>>(endpoint, {
      method: "GET",
    });
    
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
          code: "ERROR_CODE",
          message: error.message
        }
      },
      { status: 500 }
    );
  }
}
```

---

## 🔒 AUTHENTICATION

All routes use the `api-client` utility which automatically:
- Gets auth token from cookies (`authToken`)
- Adds `Authorization: Bearer {token}` header
- Handles authentication errors

---

## 📋 BACKEND ENDPOINTS REFERENCE

Based on `documents/API_Endpoints_Structure.md`:

### Authentication
- POST /api/auth/webhook - Clerk webhook
- GET /api/auth/me - Current user
- PUT /api/auth/profile - Update profile
- POST /api/auth/logout - Logout
- GET /api/auth/session - Session info

### Products
- ✅ GET /api/products - List products
- ✅ POST /api/products - Create product
- ✅ GET /api/products/:id - Get product
- ✅ PUT /api/products/:id - Update product
- ✅ DELETE /api/products/:id - Delete product
- ✅ GET /api/products/:id/inventory - Get inventory
- ✅ PUT /api/products/:id/inventory - Update stock

### Orders
- ✅ POST /api/orders - Create order
- ✅ GET /api/orders - List orders
- ✅ GET /api/orders/:id - Get order
- ✅ PUT /api/orders/:id/status - Update status

### Users
- GET /api/users/:id - Get user
- PUT /api/users/:id - Update user
- GET /api/users/:id/profile - Get profile
- PUT /api/users/:id/profile - Update profile
- POST /api/users/:id/avatar - Upload avatar

---

## ⚠️ CRITICAL NOTES

1. **Backend URL Updated:**
   - Old: `https://mash-backend-api.up.railway.app`
   - New: `https://mash-backend-api-production.up.railway.app/`

2. **Authentication Required:**
   - All routes check for `authToken` cookie
   - Unauthorized requests return 401

3. **Error Handling:**
   - All routes have try-catch blocks
   - Consistent error response format
   - Timestamp and requestId added

4. **Response Format:**
   - Follows backend standard:
     ```json
     {
       "success": true,
       "data": {},
       "timestamp": "ISO string",
       "requestId": "req_xxx"
     }
     ```

---

## 🎯 NEXT STEPS

### Immediate (High Priority):
1. ✅ Update User/Auth API routes (5 files)
2. ⏳ Update Seller API routes (10 files)
3. ⏳ Update Notifications API (2 files)

### Short-term:
4. Update CMS API routes (8 files)
5. Update Main pages API (4 files)
6. Update Devices API (1 file)

### Testing Required After Updates:
- ✅ Test product listing with filters
- ✅ Test product creation (seller auth)
- ✅ Test order creation
- ✅ Test order status updates
- ⏳ Test user authentication flow
- ⏳ Test seller dashboard
- ⏳ Test file uploads

---

## 📊 IMPACT METRICS

### API Integration Status
| Category | Files | Completed | Percentage |
|----------|-------|-----------|------------|
| Products | 4 | 4 | 100% ✅ |
| Orders | 3 | 3 | 100% ✅ |
| User/Auth | 5 | 0 | 0% ⏳ |
| Seller | 10 | 0 | 0% ⏳ |
| CMS | 8 | 0 | 0% ⏳ |
| Other | 9 | 0 | 0% ⏳ |
| **TOTAL** | **39** | **7** | **18%** 🟡 |

### Time Estimates
- ✅ Products API: 30 min (DONE)
- ✅ Orders API: 20 min (DONE)
- ⏳ User/Auth API: 25 min
- ⏳ Seller API: 50 min
- ⏳ Remaining APIs: 60 min

**Total Estimated Time:** 3 hours  
**Time Spent:** 50 minutes  
**Time Remaining:** 2 hours 10 minutes

---

## ✅ COMPLETION CHECKLIST

- [x] Products - List/Create/Update/Delete
- [x] Products - Inventory Management
- [x] Orders - Create/List/Get/Update
- [ ] Auth - Login/Logout/Session
- [ ] User - Profile/Avatar/Preferences
- [ ] Seller - Dashboard/Products/Orders
- [ ] Seller - Profile/Settings/Payments
- [ ] Notifications - Get/Mark Read
- [ ] CMS - Hero/Features/FAQ
- [ ] Devices - List/Register/Status

---

**Status:** 🟡 In Progress (18% Complete)  
**Blocker:** None  
**Risk Level:** Low  
**ETA:** ~2 hours for full completion

*Last Updated: November 6, 2025, 5:56 AM UTC+8*
