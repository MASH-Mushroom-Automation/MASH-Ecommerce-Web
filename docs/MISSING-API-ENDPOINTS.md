# Missing API Endpoints - MASH Market E-Commerce

**Last Updated:** November 5, 2025, 6:54 PM UTC+08:00

---

## 📋 Overview

This document lists ALL missing API endpoints that need backend implementation to complete the MASH Market platform. Endpoints are organized by priority and feature area.

---

## 🔴 PHASE 1: CRITICAL USER-FACING ENDPOINTS

### 1. **Global Product Search**
```
GET /api/products/search
Query Parameters:
  - q: string (search query)
  - category?: string
  - minPrice?: number
  - maxPrice?: number
  - limit?: number
  - page?: number

Response:
{
  success: boolean;
  data: ProductApiResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```
**Used In:** `src/components/layout/header.tsx` (line 87)
**Current State:** Only logs to console
**Impact:** HIGH - Users cannot search products from header

---

### 2. **User Order History**
```
GET /api/user/orders
Query Parameters:
  - status?: 'to-pay' | 'to-receive' | 'completed'
  - page?: number
  - limit?: number

Response:
{
  success: boolean;
  data: Order[];
  pagination: PaginationMeta;
}

Order Interface:
{
  id: string;
  date: string;
  items: OrderItem[];
  shipping: string;
  payment: string;
  total: number;
  status: 'to-pay' | 'to-receive' | 'completed';
}
```
**Used In:** `src/app/(user)/profile/order-history/page.tsx` (line 28)
**Current State:** Uses `MOCK_ORDERS` static array
**Impact:** HIGH - Users cannot see their real orders

---

### 3. **Get Specific Order Details**
```
GET /api/user/orders/:id

Response:
{
  success: boolean;
  data: OrderDetail;
}
```
**Used In:** Order detail modals/pages
**Current State:** Not implemented
**Impact:** HIGH - Users need order tracking details

---

### 4. **Contact Form Submission**
```
POST /api/contact
Body:
{
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** `src/components/cms/ContactSection.tsx`
**Current State:** Frontend ready, backend missing
**Impact:** MEDIUM - Contact form will fail

---

### 5. **Checkout Order Creation**
```
POST /api/orders/create
Body:
{
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: CartItem[];
  pickupLocation: string;
  paymentMethod: 'cod' | 'gcash' | 'card';
  paymentDetails?: object;
  total: number;
}

Response:
{
  success: boolean;
  data: {
    orderId: string;
    status: string;
    paymentUrl?: string;
  };
}
```
**Used In:** `src/app/(shop)/checkout/page.tsx`
**Current State:** Needs backend verification
**Impact:** CRITICAL - Cannot complete purchases

---

## 🟡 PHASE 2: SELLER CORE FEATURES

### 6. **Seller Dashboard Revenue Trend**
```
GET /api/seller/dashboard/revenue
Query Parameters:
  - period?: '7d' | '30d' | '6m' | '1y'
  - startDate?: string
  - endDate?: string

Response:
{
  success: boolean;
  data: Array<{
    month: string;
    revenue: number;
  }>;
}
```
**Used In:** `src/app/(seller)/seller/dashboard/page.tsx` (line 166)
**Current State:** Hardcoded 6 months of data
**Impact:** MEDIUM - Misleading seller analytics

---

### 7. **Seller Notifications - List**
```
GET /api/seller/notifications
Query Parameters:
  - type?: 'order' | 'payment' | 'review' | 'alert' | 'all'
  - isRead?: boolean
  - limit?: number
  - page?: number

Response:
{
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: PaginationMeta;
}

Notification Interface:
{
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: string;
  priority: 'high' | 'medium' | 'low';
}
```
**Used In:** 
- `src/components/layout/notification-dropdown.tsx` (line 15)
- `src/app/(seller)/seller/notifications/page.tsx` (line 21)
**Current State:** Uses `SAMPLE_NOTIFICATIONS` static array
**Impact:** MEDIUM - Sellers miss real-time alerts

---

### 8. **Seller Notifications - Mark as Read**
```
PUT /api/seller/notifications/:id/read

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** Notification components
**Current State:** Not implemented
**Impact:** MEDIUM - Cannot track read status

---

### 9. **Seller Notifications - Mark All as Read**
```
PUT /api/seller/notifications/mark-all-read

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** Notification components
**Current State:** Not implemented
**Impact:** LOW - Convenience feature

---

### 10. **Seller Notifications - Delete**
```
DELETE /api/seller/notifications/:id

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** Notification components
**Current State:** Not implemented
**Impact:** LOW - Cleanup feature

---

### 11. **Seller Settings - Update Profile**
```
PUT /api/seller/settings/profile
Body:
{
  businessName?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

Response:
{
  success: boolean;
  data: SellerProfile;
  message: string;
}
```
**Used In:** `src/app/(seller)/seller/settings/page.tsx` (line 73)
**Current State:** Only logs to console with mock alert
**Impact:** MEDIUM - Sellers cannot update their info

---

### 12. **Seller Settings - Change Password**
```
PUT /api/seller/settings/password
Body:
{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** `src/app/(seller)/seller/settings/page.tsx` (line 94)
**Current State:** Only logs to console
**Impact:** MEDIUM - Security feature needed

---

### 13. **Seller Settings - Delete Account**
```
DELETE /api/seller/account
Body:
{
  password: string;
  confirmation: string;
}

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** `src/app/(seller)/seller/settings/page.tsx` (line 127)
**Current State:** Only logs to console
**Impact:** LOW - Account management

---

### 14. **Refund Requests - List**
```
GET /api/seller/refunds
Query Parameters:
  - status?: 'Pending' | 'Processing' | 'Approved' | 'Rejected'
  - search?: string
  - page?: number
  - limit?: number

Response:
{
  success: boolean;
  data: RefundRequest[];
  pagination: PaginationMeta;
}

RefundRequest Interface:
{
  id: string;
  orderId: string;
  date: string;
  customer: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Processing' | 'Approved' | 'Rejected';
}
```
**Used In:** `src/app/(seller)/seller/refund/page.tsx` (line 51)
**Current State:** Uses `REFUND_REQUESTS` static array
**Impact:** MEDIUM - Cannot manage real refunds

---

### 15. **Refund Requests - Get Details**
```
GET /api/seller/refunds/:id

Response:
{
  success: boolean;
  data: RefundDetail;
}
```
**Used In:** Refund detail dialogs
**Current State:** Not implemented
**Impact:** MEDIUM - Need full refund context

---

### 16. **Refund Requests - Update Status**
```
PUT /api/seller/refunds/:id
Body:
{
  status: 'Processing' | 'Approved' | 'Rejected';
  response?: string;
  refundAmount?: number;
}

Response:
{
  success: boolean;
  data: RefundRequest;
  message: string;
}
```
**Used In:** Refund management page
**Current State:** Not implemented
**Impact:** MEDIUM - Core refund workflow

---

## 🟢 PHASE 3: SELLER OPTIONAL FEATURES

### 17. **Handover Centers - List**
```
GET /api/seller/handover-centers
Query Parameters:
  - isActive?: boolean

Response:
{
  success: boolean;
  data: HandoverCenter[];
}

HandoverCenter Interface:
{
  id: string;
  name: string;
  address: string;
  operatingHours: string;
  daysOpen: string;
  contactNumber: string;
  isActive: boolean;
}
```
**Used In:** `src/app/(seller)/seller/handover/page.tsx` (line 47)
**Current State:** Uses `HANDOVER_CENTERS` static array
**Impact:** MEDIUM - Cannot manage pickup locations

---

### 18. **Handover Centers - Create**
```
POST /api/seller/handover-centers
Body:
{
  name: string;
  address: string;
  operatingHours: string;
  daysOpen: string;
  contactNumber: string;
  isActive: boolean;
}

Response:
{
  success: boolean;
  data: HandoverCenter;
  message: string;
}
```
**Used In:** Handover management page
**Current State:** Not implemented
**Impact:** MEDIUM - Cannot add new locations

---

### 19. **Handover Centers - Update**
```
PUT /api/seller/handover-centers/:id
Body: (same as create)

Response:
{
  success: boolean;
  data: HandoverCenter;
  message: string;
}
```
**Used In:** Handover management page
**Current State:** Not implemented
**Impact:** MEDIUM - Cannot edit locations

---

### 20. **Handover Centers - Delete**
```
DELETE /api/seller/handover-centers/:id

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** Handover management page
**Current State:** Not implemented
**Impact:** MEDIUM - Cannot remove locations

---

### 21. **Shipping Channels - List**
```
GET /api/seller/shipping-channels
Query Parameters:
  - isActive?: boolean

Response:
{
  success: boolean;
  data: ShippingChannel[];
}

ShippingChannel Interface:
{
  id: string;
  name: string;
  type: string;
  price: number;
  freeShippingThreshold: number;
  isActive: boolean;
}
```
**Used In:** `src/app/(seller)/seller/shipping/page.tsx` (line 47)
**Current State:** Uses `SHIPPING_CHANNELS` static array
**Impact:** MEDIUM - Cannot configure shipping

---

### 22. **Shipping Channels - Create**
```
POST /api/seller/shipping-channels
Body:
{
  name: string;
  type: string;
  price: number;
  freeShippingThreshold: number;
  isActive: boolean;
}

Response:
{
  success: boolean;
  data: ShippingChannel;
  message: string;
}
```
**Used In:** Shipping management page
**Current State:** Not implemented
**Impact:** MEDIUM - Cannot add shipping options

---

### 23. **Shipping Channels - Update**
```
PUT /api/seller/shipping-channels/:id
Body: (same as create)

Response:
{
  success: boolean;
  data: ShippingChannel;
  message: string;
}
```
**Used In:** Shipping management page
**Current State:** Not implemented
**Impact:** MEDIUM - Cannot edit shipping

---

### 24. **Shipping Channels - Delete**
```
DELETE /api/seller/shipping-channels/:id

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** Shipping management page
**Current State:** Not implemented
**Impact:** MEDIUM - Cannot remove shipping

---

### 25. **Seller Addresses - List**
```
GET /api/seller/addresses

Response:
{
  success: boolean;
  data: Address[];
}

Address Interface:
{
  id: string;
  type: 'business' | 'warehouse' | 'billing';
  label: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}
```
**Used In:** `src/app/(seller)/seller/address/page.tsx`
**Current State:** NEEDS VERIFICATION
**Impact:** MEDIUM - Address management needed

---

### 26. **Seller Addresses - Create**
```
POST /api/seller/addresses
Body: (Address fields)

Response:
{
  success: boolean;
  data: Address;
  message: string;
}
```
**Used In:** Address management page
**Current State:** NEEDS VERIFICATION
**Impact:** MEDIUM - Cannot add addresses

---

### 27. **Seller Addresses - Update**
```
PUT /api/seller/addresses/:id
Body: (Address fields)

Response:
{
  success: boolean;
  data: Address;
  message: string;
}
```
**Used In:** Address management page
**Current State:** NEEDS VERIFICATION
**Impact:** MEDIUM - Cannot edit addresses

---

### 28. **Seller Addresses - Delete**
```
DELETE /api/seller/addresses/:id

Response:
{
  success: boolean;
  message: string;
}
```
**Used In:** Address management page
**Current State:** NEEDS VERIFICATION
**Impact:** MEDIUM - Cannot remove addresses

---

## 📊 ENDPOINT SUMMARY BY FEATURE

| Feature | Endpoints Needed | Priority | Status |
|---------|------------------|----------|--------|
| Product Search | 1 | 🔴 Critical | ❌ Missing |
| User Orders | 2 | 🔴 Critical | ❌ Missing |
| Contact Form | 1 | 🔴 Critical | ❌ Missing |
| Checkout | 1 | 🔴 Critical | ⚠️ Verify |
| Dashboard Analytics | 1 | 🟡 Medium | ❌ Missing |
| Notifications | 4 | 🟡 Medium | ❌ Missing |
| Seller Settings | 3 | 🟡 Medium | ❌ Missing |
| Refunds | 3 | 🟡 Medium | ❌ Missing |
| Handover Centers | 4 | 🟢 Low | ❌ Missing |
| Shipping Channels | 4 | 🟢 Low | ❌ Missing |
| Seller Addresses | 4 | 🟢 Low | ⚠️ Verify |

**Total Endpoints:** 28
**Missing:** 25
**Need Verification:** 3

---

## 🔧 IMPLEMENTATION CHECKLIST

### Backend Team Tasks

#### Phase 1 (Critical - Week 1)
- [ ] Implement product search endpoint
- [ ] Implement user orders endpoints (list + detail)
- [ ] Implement contact form submission
- [ ] Verify/Complete checkout order creation
- [ ] Add proper error handling and validation

#### Phase 2 (Seller Core - Week 2)
- [ ] Implement dashboard revenue endpoint
- [ ] Implement notification CRUD endpoints
- [ ] Implement seller settings endpoints
- [ ] Implement refund management endpoints
- [ ] Add real-time notification system (WebSocket/SSE)

#### Phase 3 (Optional - Week 3)
- [ ] Implement handover center CRUD
- [ ] Implement shipping channel CRUD
- [ ] Verify/Complete address management
- [ ] Add bulk operations where needed

### Frontend Team Tasks (After Backend Ready)

#### Phase 1
- [ ] Connect header search to `/api/products/search`
- [ ] Replace `MOCK_ORDERS` with `OrdersApi` calls
- [ ] Connect contact form to `/api/contact`
- [ ] Verify checkout flow works end-to-end
- [ ] Remove all console.log debug statements

#### Phase 2
- [ ] Replace hardcoded revenue data with API call
- [ ] Replace `SAMPLE_NOTIFICATIONS` with API
- [ ] Connect settings forms to save endpoints
- [ ] Replace `REFUND_REQUESTS` with API
- [ ] Add proper error handling and loading states

#### Phase 3
- [ ] Connect handover center management to API
- [ ] Connect shipping channel management to API
- [ ] Verify address management works
- [ ] Add optimistic UI updates
- [ ] Implement proper cache invalidation

---

## 📝 TESTING REQUIREMENTS

### API Contract Tests
- Verify all request/response structures match TypeScript interfaces
- Test error responses (400, 401, 403, 404, 500)
- Validate pagination works correctly
- Test query parameter combinations

### Integration Tests
- Test full user order flow (browse → cart → checkout → order history)
- Test full seller refund flow (request → review → approve/reject)
- Test notification delivery and read status
- Test CRUD operations for handover centers and shipping

### E2E Tests
- Critical user journey: Search → Add to cart → Checkout → Track order
- Seller workflow: Receive order → Process → Update status
- Settings update: Change profile → Verify saved
- Refund process: Customer requests → Seller approves → Money returned

---

## 🚀 DEPLOYMENT STRATEGY

### Phase 1 Deployment (Minimum Viable)
- Deploy with Phase 1 endpoints implemented
- Keep static data as fallback for Phase 2/3 features
- Add "Beta" badges to incomplete features
- Update documentation to mark what's functional

### Phase 2 Deployment (Full Seller Suite)
- Deploy all seller core features
- Remove beta badges
- Enable real-time notifications
- Full seller dashboard analytics

### Phase 3 Deployment (Complete Platform)
- Deploy all optional features
- Remove all static data
- Full CRUD for all management pages
- Production-ready status

---

## 📞 SUPPORT CONTACTS

**Backend Team Lead:** [To be assigned]
**Frontend Team Lead:** [To be assigned]
**API Documentation:** `/docs/api/` (to be created)
**Postman Collection:** [To be shared]

---

*This document should be updated as endpoints are implemented. Mark completed endpoints with ✅ and update status regularly.*
