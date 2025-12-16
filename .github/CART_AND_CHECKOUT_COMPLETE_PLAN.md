# 🛒 MASH E-Commerce: Complete Cart & Checkout System

**Version:** 2.0 (Firebase-Powered)  
**Last Updated:** December 16, 2025  
**Status:** Phase 6 Complete ✅ | Phase 7 In Progress 🔄  
**Platform:** Next.js 15 + Firebase Firestore (No Backend Dependency)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Implementation Phases](#implementation-phases)
4. [Phase Status Dashboard](#phase-status-dashboard)
5. [Technical Specifications](#technical-specifications)
6. [Testing Checklist](#testing-checklist)

---

## Executive Summary

### Goal
A complete end-to-end buyer flow using **Firebase Firestore** for cart and order persistence, bypassing backend dependency until it's completed.

### Key Features
| Feature | Status | Description |
|---------|--------|-------------|
| **Firebase Cart Sync** | ✅ Complete | Real-time cart sync across devices |
| **3-Step Checkout** | ✅ Complete | Delivery → Contact → Payment |
| **Lalamove Delivery** | ✅ Complete | Same-day delivery with real-time quotes |
| **Google Maps Picker** | ✅ Complete | Address selection for delivery |
| **Order Creation** | ✅ Complete | Orders saved to Firebase with pending_approval status |
| **Admin Order Dashboard** | 🔄 Phase 7 | Approve/reject orders, status updates |
| **Buyer Order History** | 🔄 Phase 7 | View order status and history |
| **Real-time Notifications** | 🔄 Phase 7 | Toast/push notifications for order updates |

### Order Status Flow
```
┌──────────────────┐     ┌───────────┐     ┌────────────────┐
│ pending_approval │ ──▶ │ approved  │ ──▶ │  processing    │
└──────────────────┘     └───────────┘     └────────────────┘
         │                                         │
         │ (rejected)                              ▼
         ▼                              ┌──────────────────────┐
   ┌──────────┐                         │ ready_for_pickup OR  │
   │ rejected │                         │      shipped         │
   └──────────┘                         └──────────────────────┘
                                                   │
                                                   ▼
                                           ┌───────────┐
                                           │ delivered │
                                           └───────────┘
                                                   │
                                                   ▼
                                           ┌───────────┐
                                           │ completed │
                                           └───────────┘
```

---

## System Architecture

### Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     BUYER SIDE                               │
├─────────────────────────────────────────────────────────────┤
│  Shop/Product Page                                           │
│       │                                                      │
│       ▼                                                      │
│  ┌────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │ Add to Cart│───▶│ CartContext     │───▶│ Firebase     │ │
│  └────────────┘    │ (Local + Sync)  │    │ /carts/{uid} │ │
│                    └─────────────────┘    └──────────────┘ │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  CHECKOUT FLOW                           ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ Step 1: Delivery Method                                  ││
│  │   • Pickup (MASH Main, BGC) - Free                      ││
│  │   • Lalamove Same-Day Delivery - ₱150-300               ││
│  │                                                          ││
│  │ Step 2: Contact Information                              ││
│  │   • Name, Email, Phone                                   ││
│  │   • Pre-filled from user profile                         ││
│  │                                                          ││
│  │ Step 3: Payment & Review                                 ││
│  │   • COD (Available)                                      ││
│  │   • GCash (Coming Soon)                                  ││
│  │   • Credit Card (Coming Soon)                            ││
│  └─────────────────────────────────────────────────────────┘│
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────┐                                       │
│  │ Firebase Orders  │ ◀─── Status: pending_approval        │
│  │ /orders/{id}     │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SELLER/ADMIN SIDE                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │           ORDERS DASHBOARD (Phase 7)                  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                                                       │   │
│  │  📋 Pending Orders                                    │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Order #MASH-20251216-001                        │ │   │
│  │  │ Customer: John Doe                              │ │   │
│  │  │ Items: 3 items • ₱1,234.00                      │ │   │
│  │  │ Delivery: Lalamove → Quezon City                │ │   │
│  │  │                                                 │ │   │
│  │  │  [✓ Approve]    [✗ Reject]    [👁 View]         │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  │  📊 Order Statistics                                  │   │
│  │  • Pending: 5 | Processing: 3 | Delivered: 120      │   │
│  │  • Today's Revenue: ₱15,230                          │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│       │                                                      │
│       │ Approve/Reject                                       │
│       ▼                                                      │
│  ┌──────────────────┐                                       │
│  │ Firebase Orders  │ ◀─── Status updated, triggers         │
│  │ /orders/{id}     │      real-time notification to buyer  │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Firebase Collections
```
firestore/
├── carts/
│   └── {userId}/
│       ├── items: CartItem[]
│       └── updatedAt: Timestamp
│
└── orders/
    └── {orderId}/
        ├── id: string
        ├── orderNumber: "MASH-YYYYMMDD-XXX"
        ├── userId: string
        ├── userEmail: string
        ├── userName: string
        ├── userPhone: string
        ├── items: FirestoreOrderItem[]
        ├── subtotal: number
        ├── tax: number
        ├── deliveryFee: number
        ├── total: number
        ├── deliveryMethod: "pickup" | "lalamove"
        ├── pickupLocation?: PickupLocation
        ├── deliveryAddress?: DeliveryAddress
        ├── paymentMethod: "cod" | "gcash" | "card"
        ├── paymentStatus: "pending" | "paid" | "failed"
        ├── status: OrderStatus
        ├── statusHistory: StatusHistoryEntry[]
        ├── createdAt: Timestamp
        ├── updatedAt: Timestamp
        └── approvedBy?: string
```

---

## Implementation Phases

### ✅ Phase 1: Enhanced Cart Context (COMPLETE)
- [x] Updated `CartItem` interface with full product details
- [x] Stock validation in `addToCart`
- [x] Quantity limits enforcement
- [x] localStorage persistence with version migration

### ✅ Phase 2: Update Add-to-Cart Calls (COMPLETE)
- [x] Product detail page passes full product object
- [x] Shop page passes full product object
- [x] ProductCard component integration
- [x] Wishlist page add-to-cart

### ✅ Phase 3: Cart Dropdown Enhancement (COMPLETE)
- [x] Display real product data
- [x] Product images and names
- [x] Quantity controls with stock validation
- [x] Remove item functionality

### ✅ Phase 4: Checkout Flow (COMPLETE)
- [x] 3-step checkout process
- [x] Delivery method selection (Pickup/Lalamove)
- [x] Google Maps address picker
- [x] Lalamove real-time quotes
- [x] Contact information form
- [x] Payment method selection

### ✅ Phase 5: Firebase Integration (COMPLETE)
- [x] Firebase cart service (`src/lib/firebase/cart.ts`)
- [x] Firebase orders service (`src/lib/firebase/orders.ts`)
- [x] CartContext Firebase sync
- [x] Order creation with `pending_approval` status

### ✅ Phase 6: Order Submission (COMPLETE)
- [x] Order data structure with all required fields
- [x] Status history tracking
- [x] Success modal on order placement
- [x] Cart cleared after order

### 🔄 Phase 7: Admin Order Management (IN PROGRESS)
**Goal:** Enable sellers/admins to approve, reject, and manage orders

#### 7.1 Firebase Admin Orders Dashboard
- [ ] Create `/seller/orders/firebase` page
- [ ] Real-time pending orders list
- [ ] Order detail modal/drawer
- [ ] Filter by status, date, customer

#### 7.2 Order Actions
- [ ] Approve order button + confirmation
- [ ] Reject order with reason input
- [ ] Update order status dropdown
- [ ] Assign Lalamove driver (for delivery orders)

#### 7.3 Dashboard Statistics
- [ ] Pending approval count (prominent)
- [ ] Today's orders/revenue
- [ ] Order status breakdown chart
- [ ] Recent activity feed

#### 7.4 Real-time Notifications
- [ ] Toast notification for new orders
- [ ] Browser notification permission
- [ ] Sound alert option

**Files to create/update:**
```
src/app/(seller)/orders/firebase/page.tsx       ← NEW: Firebase orders dashboard
src/components/seller/FirebaseOrderCard.tsx     ← NEW: Order card with actions
src/components/seller/FirebaseOrderDetail.tsx   ← NEW: Order detail drawer
src/hooks/useFirebaseOrders.ts                  ← NEW: Hook for seller orders
```

### 📋 Phase 8: Buyer Order History (PLANNED)
**Goal:** Allow buyers to view their order history and track status

#### 8.1 Order History Page
- [ ] List all user orders
- [ ] Filter by status
- [ ] Real-time status updates
- [ ] Reorder functionality

#### 8.2 Order Detail Page
- [ ] Full order information
- [ ] Status timeline
- [ ] Delivery tracking (for Lalamove)
- [ ] Contact seller option

#### 8.3 User Profile Integration
- [ ] Google Maps address management
- [ ] Save delivery addresses
- [ ] Default address selection

**Files to create/update:**
```
src/app/(user)/profile/orders/page.tsx         ← NEW: Order history
src/app/(user)/profile/orders/[id]/page.tsx    ← NEW: Order detail
src/app/(user)/profile/addresses/page.tsx      ← NEW: Address management
src/components/orders/OrderTimeline.tsx        ← NEW: Visual status timeline
```

### 📋 Phase 9: Notifications System (PLANNED)
**Goal:** Keep buyers and sellers informed of order updates

#### 9.1 Firebase Notifications
- [ ] Notification document structure
- [ ] Create notification on status change
- [ ] Mark as read functionality

#### 9.2 UI Integration
- [ ] Notification bell icon in header
- [ ] Notification dropdown/drawer
- [ ] Unread count badge

#### 9.3 Push Notifications (Optional)
- [ ] Firebase Cloud Messaging setup
- [ ] Service worker registration
- [ ] Permission request flow

---

## Phase Status Dashboard

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 1 | Enhanced Cart Context | ✅ Complete | 100% |
| 2 | Add-to-Cart Updates | ✅ Complete | 100% |
| 3 | Cart Dropdown | ✅ Complete | 100% |
| 4 | Checkout Flow | ✅ Complete | 100% |
| 5 | Firebase Integration | ✅ Complete | 100% |
| 6 | Order Submission | ✅ Complete | 100% |
| **7** | **Admin Order Management** | **🔄 In Progress** | **0%** |
| 8 | Buyer Order History | 📋 Planned | 0% |
| 9 | Notifications System | 📋 Planned | 0% |

---

## Technical Specifications

### Key Files Created

#### Firebase Services
```
src/lib/firebase/
├── config.ts              # Firebase app initialization
├── auth.ts                # Google sign-in, auth functions
├── cart.ts                # Cart CRUD, real-time sync
├── orders.ts              # Order CRUD, status management
└── index.ts               # Barrel exports
```

#### Checkout Components
```
src/components/checkout/
├── AddressPicker.tsx      # Google Maps autocomplete + map
├── LalamoveQuote.tsx      # Delivery quote display
└── index.ts               # Exports with types
```

#### Checkout Page
```
src/app/(shop)/checkout/page.tsx
├── Step 1: Delivery Method (pickup/lalamove)
├── Step 2: Contact Information (name/email/phone)
├── Step 3: Payment & Review (cod/gcash/card)
└── Success Modal with order ID
```

### Type Definitions

```typescript
// src/types/api.ts

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  slug: string;
  stock: number;
  grower?: string;
  unit?: string;
  comparePrice?: number;
}

export interface AddToCartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  grower?: string;
  unit?: string;
  comparePrice?: number;
}

// src/lib/firebase/orders.ts

export type OrderStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "processing"
  | "ready_for_pickup"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export interface FirestoreOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryMethod: "pickup" | "lalamove";
  pickupLocation?: PickupLocation;
  deliveryAddress?: DeliveryAddress;
  lalamoveQuotationId?: string;
  paymentMethod: "cod" | "gcash" | "card";
  paymentStatus: "pending" | "paid" | "failed";
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Environment Variables Required

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<maps-api-key>

# Lalamove (Sandbox)
LALAMOVE_API_KEY=<api-key>
LALAMOVE_SECRET=<secret>
LALAMOVE_HOST=https://rest.sandbox.lalamove.com
```

---

## Testing Checklist

### Buyer Flow
- [ ] Add product to cart from shop page
- [ ] Add product to cart from product detail page
- [ ] Update quantity in cart
- [ ] Remove item from cart
- [ ] Cart persists after refresh
- [ ] Cart syncs to Firebase when logged in
- [ ] Checkout Step 1: Select pickup
- [ ] Checkout Step 1: Select Lalamove delivery
- [ ] Checkout Step 1: Address picker works
- [ ] Checkout Step 1: Lalamove quote displays
- [ ] Checkout Step 2: Contact form validation
- [ ] Checkout Step 2: Pre-fills from profile
- [ ] Checkout Step 3: Select payment method
- [ ] Checkout Step 3: Order summary correct
- [ ] Order placed successfully
- [ ] Order appears in Firebase
- [ ] Success modal shows order number
- [ ] Cart cleared after order

### Seller/Admin Flow (Phase 7)
- [ ] Pending orders display in dashboard
- [ ] Order detail shows all information
- [ ] Approve order works
- [ ] Reject order with reason works
- [ ] Status update changes in real-time
- [ ] New order notification appears
- [ ] Order count statistics correct

### Buyer Order History (Phase 8)
- [ ] Order history lists all orders
- [ ] Order detail page accessible
- [ ] Status timeline displays correctly
- [ ] Real-time updates work

---

## Quick Start Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Start Sanity Studio (for CMS content)
cd studio && npm run dev
```

---

## Related Documentation

- `.github/FIREBASE_GOOGLE_SIGNIN_SETUP.md` - Firebase auth setup
- `.github/LALAMOVE_INTEGRATION_COMPLETE.md` - Lalamove API integration
- `.github/VERCEL_DEPLOYMENT_PLAN.md` - Deployment guide
- `docs/SANITY_CMS_MASTER_PLAN.md` - CMS documentation

---

**Next Steps:** Implement Phase 7 - Admin Order Management Dashboard
