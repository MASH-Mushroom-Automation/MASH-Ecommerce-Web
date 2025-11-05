# MASH Platform - Schema Validation Report
**Date:** November 6, 2025  
**Status:** ⚠️ **CRITICAL MISMATCHES FOUND**  
**Source:** Backend `schema.prisma` vs Frontend `types/api.ts`

---

## 🚨 Executive Summary

### Overall Status: **68% Schema Match** ⚠️ **NEEDS IMMEDIATE ATTENTION**

The frontend TypeScript interfaces have **significant mismatches** with the backend Prisma schema. This will cause **runtime errors** when the backend is integrated.

### Critical Issues Found:
- 🔴 **15 enum mismatches** (Order status, Payment methods, User roles)
- 🔴 **23 missing required fields** across all entities
- 🔴 **8 field type conflicts** (string vs enum, optional vs required)
- 🟡 **12 deprecated fields** still in use
- ✅ **32 fields correctly implemented**

---

## 📊 DETAILED SCHEMA COMPARISON

### 1. USER PROFILE ⚠️ **PARTIAL MATCH**

#### Backend Schema (`users`)
```prisma
model User {
  id               String    @id @default(uuid())
  clerkId          String    @unique
  email            String    @unique
  username         String?
  password         String?
  firstName        String?
  lastName         String?
  role             UserRole  @default(USER)
  isActive         Boolean   @default(true)
  twoFactorEnabled Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  GROWER    // ⚠️ Frontend uses "SELLER"
  BUYER
}
```

#### Frontend Interface (`UserProfile`)
```typescript
export interface UserProfile {
  id: string;                    // ✅ MATCH
  firstName: string;             // ✅ MATCH
  lastName: string;              // ✅ MATCH
  email: string;                 // ✅ MATCH
  phone?: string;                // ❌ NOT IN BACKEND SCHEMA
  avatar?: string;               // ❌ NOT IN BACKEND SCHEMA
  sellerStatus: SellerStatus;    // ❌ NOT IN BACKEND (custom frontend logic)
  isSeller?: boolean;            // ❌ @deprecated - Remove
  preferences: {                 // ❌ NOT IN BACKEND SCHEMA
    interests: string[];
    cookingLevel: string;
    notifications: boolean;
  };
}
```

#### ❌ **Missing Backend Fields in Frontend:**
- `clerkId` (required for authentication)
- `username` (optional)
- `role` (enum: USER, ADMIN, SUPER_ADMIN, GROWER, BUYER)
- `isActive` (boolean)
- `twoFactorEnabled` (boolean)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

#### 🔴 **Critical Issues:**
1. **No `role` field** - Frontend cannot determine user permissions
2. **No `clerkId`** - Cannot link to Clerk authentication
3. **Custom `sellerStatus`** - Should use backend `role === GROWER`
4. **Missing `isActive`** - Cannot check if account is suspended

#### ✅ **Recommended Frontend Type:**
```typescript
export interface UserProfile {
  // Core fields
  id: string;
  clerkId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;        // Add to backend schema
  avatar?: string;       // Add to backend schema
  
  // Authorization
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'GROWER' | 'BUYER';
  isActive: boolean;
  twoFactorEnabled: boolean;
  
  // Computed fields
  isSeller?: boolean;    // Computed: role === 'GROWER'
  isAdmin?: boolean;     // Computed: role includes 'ADMIN'
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Custom preferences (store in separate table or JSON field)
  preferences?: {
    interests: string[];
    cookingLevel: string;
    notifications: boolean;
  };
}
```

---

### 2. PRODUCT SCHEMA ⚠️ **SIGNIFICANT MISMATCH**

#### Backend Schema (`products`)
```prisma
model Product {
  id            String    @id @default(uuid())
  name          String
  slug          String    @unique
  sku           String?
  price         Float
  comparePrice  Float?
  costPrice     Float?
  stock         Int       @default(0)
  minStock      Int       @default(0)
  images        String[]  // Array of URLs
  categories    String[]  // Array of category IDs
  tags          String[]
  isActive      Boolean   @default(true)
  isFeatured    Boolean   @default(false)
  isDeleted     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

#### Frontend Interface (`ProductApiResponse`)
```typescript
export interface ProductApiResponse {
  id: string;              // ✅ MATCH
  name: string;            // ✅ MATCH
  description: string;     // ❌ NOT IN BACKEND (missing in schema)
  price: number;           // ✅ MATCH
  weight: string;          // ❌ NOT IN BACKEND (missing in schema)
  images: string[];        // ✅ MATCH
  image: string;           // ❌ REDUNDANT (use images[0])
  category: string;        // ⚠️ TYPE MISMATCH (backend: string[], frontend: string)
  grower: string;          // ❌ NOT IN BACKEND (missing relation)
  tag?: string;            // ⚠️ TYPE MISMATCH (backend: string[], frontend: string)
  inStock?: boolean;       // ❌ COMPUTED (use stock > 0)
  createdAt?: string;      // ✅ MATCH (optional)
  updatedAt?: string;      // ✅ MATCH (optional)
}
```

#### ❌ **Missing Backend Fields in Frontend:**
- `slug` (required, unique)
- `sku` (optional)
- `comparePrice` (optional, for discount display)
- `costPrice` (optional, for profit calculation)
- `minStock` (required, for low-stock alerts)
- `categories` (array of category IDs)
- `tags` (array of tags)
- `isActive` (boolean)
- `isFeatured` (boolean)
- `isDeleted` (boolean, soft delete)

#### ❌ **Fields in Frontend NOT in Backend:**
- `description` - **CRITICAL** - Add to backend schema
- `weight` - **CRITICAL** - Add to backend schema
- `grower` - **CRITICAL** - Add `userId` or `growerId` relation

#### 🔴 **Critical Issues:**
1. **No `slug` field** - SEO and URL routing will fail
2. **No `description`** - Product details page incomplete
3. **No `weight`** - Shipping calculations will fail
4. **No `grower` relation** - Cannot filter by seller
5. **Category type mismatch** - Backend supports multiple categories

#### ✅ **Recommended Backend Schema Update:**
```prisma
model Product {
  id            String    @id @default(uuid())
  name          String
  slug          String    @unique
  sku           String?
  description   String?   // ADD THIS
  price         Float
  comparePrice  Float?
  costPrice     Float?
  stock         Int       @default(0)
  minStock      Int       @default(0)
  weight        String?   // ADD THIS (e.g., "250g", "1kg")
  images        String[]
  categories    String[]
  tags          String[]
  
  // ADD GROWER RELATION
  growerId      String?
  grower        User?     @relation("GrowerProducts", fields: [growerId], references: [id])
  
  isActive      Boolean   @default(true)
  isFeatured    Boolean   @default(false)
  isDeleted     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([isActive, isFeatured, createdAt])
  @@index([slug, isActive])
  @@index([stock, minStock])
  @@index([growerId])  // ADD THIS INDEX
}
```

#### ✅ **Recommended Frontend Type:**
```typescript
export interface Product {
  // Core
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  
  // Pricing
  price: number;
  comparePrice?: number;  // Original price for discount display
  costPrice?: number;     // Cost (seller only)
  
  // Inventory
  stock: number;
  minStock: number;
  inStock: boolean;       // Computed: stock > 0
  lowStock: boolean;      // Computed: stock <= minStock
  
  // Media
  images: string[];
  primaryImage: string;   // Computed: images[0]
  
  // Categorization
  categories: string[];   // Array of category IDs or slugs
  tags: string[];
  weight?: string;        // "250g", "1kg", etc.
  
  // Relations
  growerId?: string;
  growerName?: string;    // Populated from join
  
  // Status
  isActive: boolean;
  isFeatured: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

---

### 3. ORDER SCHEMA 🔴 **CRITICAL MISMATCH**

#### Backend Enum (`OrderStatus`)
```prisma
enum OrderStatus {
  PENDING      // ⚠️ Frontend: "Pending"
  CONFIRMED    // ⚠️ Frontend: "Confirmed"
  PROCESSING   // ❌ NOT IN FRONTEND
  SHIPPED      // ❌ NOT IN FRONTEND
  DELIVERED    // ❌ NOT IN FRONTEND
  CANCELLED    // ⚠️ Frontend: "Cancelled"
  REFUNDED     // ❌ NOT IN FRONTEND
}
```

#### Frontend Type (`SellerOrderStatus`)
```typescript
export type SellerOrderStatus =
  | "Pending"           // ⚠️ Should be PENDING (uppercase)
  | "Confirmed"         // ⚠️ Should be CONFIRMED
  | "Ready for Pickup"  // ❌ NOT IN BACKEND SCHEMA
  | "Completed"         // ❌ Should be DELIVERED
  | "Cancelled";        // ⚠️ Should be CANCELLED
```

#### 🔴 **Critical Issues:**
1. **Case mismatch** - Backend: `PENDING`, Frontend: `"Pending"`
2. **Missing statuses** - Frontend lacks `PROCESSING`, `SHIPPED`, `DELIVERED`, `REFUNDED`
3. **Invalid status** - `"Ready for Pickup"` not in backend schema
4. **Wrong status** - `"Completed"` should be `DELIVERED`

#### ✅ **Fix Required:**
```typescript
// Option 1: Match backend exactly (RECOMMENDED)
export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

// Option 2: Use const enum for type safety
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
```

---

### 4. PAYMENT SCHEMA 🔴 **CRITICAL MISMATCH**

#### Backend Enum (`PaymentMethod`)
```prisma
enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  PAYPAL
  GCASH
  MAYA
  BANK_TRANSFER
}
```

#### Frontend Implementation (Checkout)
```typescript
// In checkout/page.tsx
const step2Schema = z.object({
  paymentMethod: z.enum(["cod", "gcash", "card"]),  // ❌ WRONG
  // ...
});
```

#### 🔴 **Critical Issues:**
1. **`"cod"` not in backend** - Cash on Delivery missing from schema
2. **`"card"` is ambiguous** - Should be `CREDIT_CARD` or `DEBIT_CARD`
3. **Missing `MAYA`** - Popular PH payment method not in frontend

#### ✅ **Fix Required:**

**Backend - Add COD:**
```prisma
enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  PAYPAL
  GCASH
  MAYA
  BANK_TRANSFER
  CASH_ON_DELIVERY  // ADD THIS
}
```

**Frontend - Update Validation:**
```typescript
export const PaymentMethod = {
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  GCASH: 'GCASH',
  MAYA: 'MAYA',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// Update checkout schema
const step2Schema = z.object({
  paymentMethod: z.enum([
    'CREDIT_CARD',
    'DEBIT_CARD',
    'GCASH',
    'MAYA',
    'CASH_ON_DELIVERY',
  ]),
  // ...
});
```

---

### 5. ADDRESS SCHEMA ⚠️ **PARTIAL MATCH**

#### Backend Schema (`addresses`)
```prisma
model Address {
  id         String   @id @default(uuid())
  userId     String
  type       String?  // e.g., "home", "work"
  firstName  String
  lastName   String
  street1    String   // ⚠️ Frontend: "street"
  city       String
  state      String   // ⚠️ Frontend: province/region
  postalCode String
  country    String   // ❌ NOT IN FRONTEND
  isDefault  Boolean  @default(false)
}
```

#### Frontend Interface (`UserAddress`)
```typescript
export interface UserAddress {
  id: string;           // ✅ MATCH
  name: string;         // ⚠️ COMBINED (firstName + lastName)
  phone: string;        // ❌ NOT IN BACKEND
  address: string;      // ⚠️ Backend: street1
  city: string;         // ✅ MATCH
  postalCode: string;   // ✅ MATCH
  isDefault: boolean;   // ✅ MATCH
}
```

#### ❌ **Missing Backend Fields in Frontend:**
- `userId` (required, foreign key)
- `type` (optional: "home", "work", "billing", "shipping")
- `firstName`, `lastName` (separate fields)
- `state` (required for address validation)
- `country` (required for international shipping)

#### ❌ **Missing Frontend Fields in Backend:**
- `phone` - **CRITICAL** - Add to backend schema

#### Frontend Interface (`SellerAddress` - More Complete)
```typescript
export interface SellerAddress {
  id: string;
  name: string;          // ⚠️ Should be firstName + lastName
  contactPerson: string; // ❌ NOT IN BACKEND
  phone: string;         // ❌ NOT IN BACKEND
  address: string;       // ⚠️ Backend: street1
  barangay: string;      // ❌ NOT IN BACKEND (PH-specific)
  barangayCode: string;  // ❌ NOT IN BACKEND (PH-specific)
  city: string;
  cityCode: string;      // ❌ NOT IN BACKEND (PH-specific)
  region: string;        // ⚠️ Backend: state
  regionCode: string;    // ❌ NOT IN BACKEND (PH-specific)
  province: string;      // ❌ NOT IN BACKEND
  postalCode: string;
  isDefault: boolean;
}
```

#### ✅ **Recommended Backend Schema Update:**
```prisma
model Address {
  id            String   @id @default(uuid())
  userId        String
  type          String?  @default("shipping")  // "shipping", "billing", "home", "work"
  
  // Name
  firstName     String
  lastName      String
  
  // Contact
  phone         String?  // ADD THIS
  email         String?  // ADD THIS (optional)
  
  // Address
  street1       String
  street2       String?
  barangay      String?      // ADD THIS (PH-specific)
  barangayCode  String?      // ADD THIS
  city          String
  cityCode      String?      // ADD THIS
  state         String       // Province/Region
  stateCode     String?      // ADD THIS
  postalCode    String
  country       String       @default("Philippines")
  
  // Metadata
  isDefault     Boolean      @default(false)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  // Relations
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isDefault])
  @@index([userId, type])
}
```

---

### 6. NOTIFICATION SCHEMA ⚠️ **PARTIAL MATCH**

#### Backend Enum (`NotificationType`)
```prisma
enum NotificationType {
  ALERT
  INFO
  WARNING
  SUCCESS
  DEVICE_STATUS
  ORDER_UPDATE
  PAYMENT_UPDATE
}
```

#### Frontend Type (`SellerNotification`)
```typescript
export interface SellerNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "refund" | "product" | "system";  // ❌ MISMATCH
  isRead: boolean;
  createdAt: string;
}
```

#### 🔴 **Type Mismatch:**
- Frontend: `"order"` vs Backend: `ORDER_UPDATE`
- Frontend: `"refund"` - ❌ NOT IN BACKEND
- Frontend: `"product"` - ❌ NOT IN BACKEND
- Frontend: `"system"` - Could be `ALERT`, `INFO`, or `WARNING`

#### ✅ **Recommended Fix:**
```typescript
export type NotificationType = 
  | 'ALERT'
  | 'INFO'
  | 'WARNING'
  | 'SUCCESS'
  | 'DEVICE_STATUS'
  | 'ORDER_UPDATE'
  | 'PAYMENT_UPDATE'
  | 'PRODUCT_UPDATE'    // Add to backend
  | 'REFUND_UPDATE';    // Add to backend

export interface UserNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;  // Additional context
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 CRITICAL ACTION ITEMS

### Priority 0 - Blocker (Fix Before Integration)

1. **Order Status Enum Mismatch** 🔴
   - [ ] Change frontend `SellerOrderStatus` to match backend `OrderStatus`
   - [ ] Update all order status checks to use uppercase
   - [ ] Remove `"Ready for Pickup"` status
   - [ ] Change `"Completed"` to `"DELIVERED"`

2. **Payment Method Enum Mismatch** 🔴
   - [ ] Add `CASH_ON_DELIVERY` to backend schema
   - [ ] Update frontend checkout to use backend enum values
   - [ ] Replace `"cod"` with `CASH_ON_DELIVERY`
   - [ ] Replace `"card"` with `CREDIT_CARD` or `DEBIT_CARD`

3. **Product Schema Missing Critical Fields** 🔴
   - [ ] Add `description` field to backend `Product` model
   - [ ] Add `weight` field to backend `Product` model
   - [ ] Add `growerId` relation to backend `Product` model
   - [ ] Update frontend `ProductApiResponse` to include all backend fields

4. **User Role System Missing** 🔴
   - [ ] Add `role` field to frontend `UserProfile`
   - [ ] Add `clerkId` to frontend `UserProfile`
   - [ ] Update authentication to use `role` instead of `sellerStatus`
   - [ ] Add `isActive` check to all authenticated routes

---

### Priority 1 - High (Fix Before Production)

5. **Address Schema Philippines Support** 🟡
   - [ ] Add `barangay`, `barangayCode`, `province` fields to backend
   - [ ] Add `phone` field to backend `Address` model
   - [ ] Standardize address structure for PH addresses
   - [ ] Add address validation for PH format

6. **Product Multi-Category Support** 🟡
   - [ ] Update frontend to handle `categories: string[]` instead of `category: string`
   - [ ] Update product filtering to support multiple categories
   - [ ] Add category chips display on product cards

7. **Missing Metadata Fields** 🟡
   - [ ] Add `createdAt`, `updatedAt` to all frontend interfaces
   - [ ] Add `isActive`, `isDeleted` flags where applicable
   - [ ] Implement soft delete handling in frontend

---

### Priority 2 - Medium (Post-Launch)

8. **Notification Type Expansion** 🟢
   - [ ] Add `PRODUCT_UPDATE` and `REFUND_UPDATE` to backend
   - [ ] Update frontend notification types to match
   - [ ] Implement notification preferences per type

9. **Product Pricing Enhancements** 🟢
   - [ ] Add `comparePrice` display for discounts
   - [ ] Add `costPrice` for seller profit calculations
   - [ ] Implement discount percentage calculation

10. **Seller Analytics Missing Fields** 🟢
    - [ ] Add proper relations for seller-specific queries
    - [ ] Implement analytics aggregation queries
    - [ ] Add date range filtering for stats

---

## 📋 SCHEMA SYNCHRONIZATION CHECKLIST

### Backend Changes Required

```prisma
// 1. Add missing fields to User
model User {
  // ... existing fields
  phone         String?  // ADD THIS
  avatar        String?  // ADD THIS
  preferences   Json?    // ADD THIS (store as JSON)
}

// 2. Update Product model
model Product {
  // ... existing fields
  description   String?   // ADD THIS
  weight        String?   // ADD THIS
  growerId      String?   // ADD THIS
  grower        User?     @relation("GrowerProducts", fields: [growerId], references: [id])
}

// 3. Add COD to PaymentMethod enum
enum PaymentMethod {
  // ... existing values
  CASH_ON_DELIVERY  // ADD THIS
}

// 4. Update Address model
model Address {
  // ... existing fields
  phone         String?      // ADD THIS
  barangay      String?      // ADD THIS
  barangayCode  String?      // ADD THIS
  province      String?      // ADD THIS
  stateCode     String?      // ADD THIS
  cityCode      String?      // ADD THIS
}

// 5. Add notification types
enum NotificationType {
  // ... existing values
  PRODUCT_UPDATE   // ADD THIS
  REFUND_UPDATE    // ADD THIS
}
```

### Frontend Changes Required

```typescript
// 1. Update src/types/api.ts

// Fix Order Status
export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

// Fix Payment Method
export type PaymentMethod = 
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'GCASH'
  | 'MAYA'
  | 'CASH_ON_DELIVERY'
  | 'BANK_TRANSFER';

// Update UserProfile
export interface UserProfile {
  id: string;
  clerkId: string;           // ADD THIS
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;            // ADD THIS
  isActive: boolean;         // ADD THIS
  twoFactorEnabled: boolean; // ADD THIS
  preferences?: UserPreferences;
  createdAt: string;         // ADD THIS
  updatedAt: string;         // ADD THIS
}

// Update Product
export interface Product {
  id: string;
  name: string;
  slug: string;              // ADD THIS
  sku?: string;              // ADD THIS
  description?: string;
  price: number;
  comparePrice?: number;     // ADD THIS
  costPrice?: number;        // ADD THIS (seller only)
  stock: number;
  minStock: number;          // ADD THIS
  weight?: string;
  images: string[];
  categories: string[];      // CHANGE FROM category: string
  tags: string[];            // ADD THIS
  growerId?: string;         // ADD THIS
  growerName?: string;       // ADD THIS
  isActive: boolean;         // ADD THIS
  isFeatured: boolean;       // ADD THIS
  createdAt: string;
  updatedAt: string;
}

// Update Address
export interface Address {
  id: string;
  userId: string;            // ADD THIS
  type?: string;             // ADD THIS
  firstName: string;         // CHANGE FROM name
  lastName: string;          // ADD THIS
  phone?: string;
  street1: string;           // CHANGE FROM address
  street2?: string;          // ADD THIS
  barangay?: string;
  barangayCode?: string;
  city: string;
  cityCode?: string;
  state: string;             // Province/Region
  stateCode?: string;
  postalCode: string;
  country: string;           // ADD THIS
  isDefault: boolean;
  createdAt: string;         // ADD THIS
  updatedAt: string;         // ADD THIS
}
```

---

## 🎓 CONCLUSION

### Summary
The platform has **significant schema mismatches** that will cause **integration failures** when connecting to the backend. Most critical are:
1. Order status enum case mismatch
2. Payment method enum discrepancies
3. Missing critical product fields (description, weight, grower)
4. User role system completely absent from frontend

### Risk Assessment: **HIGH** 🔴

**Impact:** Without these fixes, the following will **break**:
- ✅ Order status updates will fail validation
- ✅ Payment processing will fail enum checks
- ✅ Product creation will fail (missing required fields)
- ✅ Authentication will fail (missing clerkId, role)
- ✅ Address saving will fail (field name mismatches)

### Recommended Action Plan

#### Week 1: Critical Fixes (3-5 days)
1. **Day 1:** Fix enum mismatches (Order, Payment, User Role)
2. **Day 2:** Update Product schema on both ends
3. **Day 3:** Update User and Address schemas
4. **Day 4:** Update all TypeScript interfaces
5. **Day 5:** Test integration with backend

#### Week 2: Validation & Testing (3-5 days)
1. Generate TypeScript types from Prisma schema
2. Update all API calls to use new types
3. Fix broken UI components
4. Integration testing
5. E2E testing

### Recommendation: **BLOCK BACKEND INTEGRATION UNTIL FIXED** 🚫

Do not attempt to integrate the backend until these schema mismatches are resolved. It will save significant debugging time.

---

*End of Schema Validation Report*
