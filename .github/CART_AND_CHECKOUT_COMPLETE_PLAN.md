# 🛒 MASH E-Commerce: Complete Cart & Checkout System

**Version:** 4.0 (Firebase-Powered with Delivery Tracking)  
**Last Updated:** December 17, 2025  
**Status:** Phase 8 Complete ✅ | Phase 9 Next 🔄  
**Platform:** Next.js 15 + Firebase Firestore (No Backend Dependency)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase Status Dashboard](#phase-status-dashboard)
3. [System Architecture](#system-architecture)
4. [Implementation Phases](#implementation-phases)
5. [File Reference](#file-reference)
6. [Testing Checklist](#testing-checklist)
7. [Quick Start](#quick-start)

---

## Executive Summary

### Goal
A complete end-to-end buyer-to-seller flow using **Firebase Firestore** for cart and order persistence, with real-time order management, approval workflow, and **Lalamove delivery tracking**.

### ✅ What's Working NOW

| Feature | URL | Description |
|---------|-----|-------------|
| **Add to Cart** | `/shop`, `/product/[slug]` | Full product data synced to Firebase |
| **Cart Dropdown** | Header component | Real-time cart with images, quantities |
| **3-Step Checkout** | `/checkout` | Delivery → Contact → Payment |
| **Google Maps Picker** | Checkout Step 1 | Interactive address selection |
| **Lalamove Quotes** | Checkout Step 1 | Real-time delivery pricing |
| **Order Creation** | Checkout Step 3 | Orders saved to Firebase |
| **Admin Dashboard** | `/orders/firebase` | Approve/reject orders, status updates |
| **Auto Lalamove** | Admin approve | Automatically schedules Lalamove delivery |
| **Buyer Order History** | `/profile/order-history` | Real-time order tracking |
| **Delivery Tracking** | `/profile/orders/[id]/track` | Live driver location, status |
| **Profile Address** | `/profile/my-information` | Google Maps "Pick from Map" |

### Order Status Flow
```
                    ┌─────────────┐
                    │  REJECTED   │ ◀── Admin rejects
                    └─────────────┘
                          ▲
                          │
┌────────────────────┐    │    ┌───────────────┐
│ PENDING_APPROVAL   │────┴───▶│   APPROVED    │──▶ Lalamove auto-created
│  (Order Placed)    │         │ (Admin OK's)  │
└────────────────────┘         └───────────────┘
                                      │
                                      ▼
                               ┌───────────────┐
                               │  PROCESSING   │
                               │ (Preparing)   │
                               └───────────────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
              ┌──────────────────┐      ┌─────────────────┐
              │ READY_FOR_PICKUP │      │     SHIPPED     │
              │   (Self-pickup)  │      │   (Lalamove)    │
              └──────────────────┘      └─────────────────┘
                         │                         │
                         │                  📍 TRACKING
                         │                  ├── Driver assigned
                         │                  ├── En route to pickup
                         │                  └── Out for delivery
                         │                         │
                         └────────────┬────────────┘
                                      ▼
                               ┌───────────────┐
                               │   DELIVERED   │
                               │ (Received)    │
                               └───────────────┘
                                      │
                                      ▼
                               ┌───────────────┐
                               │   COMPLETED   │
                               │  (Finished)   │
                               └───────────────┘
```

---

## Phase Status Dashboard

| Phase | Name | Status | Completion | Key Deliverables |
|-------|------|--------|------------|------------------|
| 1 | Enhanced Cart Context | ✅ Complete | 100% | CartContext with Firebase sync |
| 2 | Add-to-Cart Updates | ✅ Complete | 100% | Product pages, shop integration |
| 3 | Cart Dropdown | ✅ Complete | 100% | Real-time UI, quantity controls |
| 4 | Checkout Flow | ✅ Complete | 100% | 3-step form, address picker |
| 5 | Firebase Integration | ✅ Complete | 100% | Cart/Orders services |
| 6 | Order Submission | ✅ Complete | 100% | Order creation, success modal |
| 7 | Admin Order Management | ✅ Complete | 100% | Dashboard, approve/reject |
| **8** | **Delivery Tracking** | **✅ Complete** | **100%** | **Lalamove tracking, driver info** |
| 9 | Notifications System | 📋 Planned | 0% | Real-time alerts, email |

### Progress Bar
```
[████████████████████████████████████████████████░░░] 89% Complete (8/9 Phases)
```

---

## System Architecture

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BUYER FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────┐    ┌───────────┐    ┌───────────────────────────────┐   │
│  │   SHOP    │───▶│  PRODUCT  │───▶│         ADD TO CART           │   │
│  │  /shop    │    │ /product/ │    │  CartContext + Firebase sync  │   │
│  └───────────┘    └───────────┘    └───────────────────────────────┘   │
│                                               │                          │
│                                               ▼                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    CHECKOUT (/checkout)                             │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │                                                                     │ │
│  │   Step 1: DELIVERY                Step 2: CONTACT                  │ │
│  │   ┌─────────────────┐             ┌─────────────────┐              │ │
│  │   │ ○ Self-Pickup   │             │ Name: [_______] │              │ │
│  │   │   • MASH Main   │             │ Email:[_______] │              │ │
│  │   │   • BGC Pickup  │             │ Phone:[_______] │              │ │
│  │   │                 │             │                 │              │ │
│  │   │ ○ Lalamove      │             │ (Pre-filled if  │              │ │
│  │   │   [📍 Map]      │             │  logged in)     │              │ │
│  │   │   ₱185 delivery │             │                 │              │ │
│  │   └─────────────────┘             └─────────────────┘              │ │
│  │                                                                     │ │
│  │   Step 3: PAYMENT & REVIEW                                         │ │
│  │   ┌────────────────────────────────────────────────────┐           │ │
│  │   │ Items: King Oyster x2, Blue Oyster x1              │           │ │
│  │   │ Subtotal: ₱890 | Delivery: ₱185 | Total: ₱1,075    │           │ │
│  │   │                                                     │           │ │
│  │   │ Payment: ○ Cash on Delivery (COD)                  │           │ │
│  │   │          ○ GCash (Coming Soon)                     │           │ │
│  │   │                                                     │           │ │
│  │   │          [ 🛒 Place Order ]                        │           │ │
│  │   └────────────────────────────────────────────────────┘           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                               │                          │
│                                               ▼                          │
│                                    ┌────────────────────┐               │
│                                    │   Firebase Order   │               │
│                                    │ status: pending_   │               │
│                                    │         approval   │               │
│                                    └────────────────────┘               │
│                                               │                          │
└───────────────────────────────────────────────┼──────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           ADMIN/SELLER FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │            FIREBASE ORDERS DASHBOARD (/orders/firebase)            │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │                                                                     │ │
│  │  📊 Stats:  🔴 5 Pending | 🟡 3 Processing | 💰 ₱15,230 Today      │ │
│  │                                                                     │ │
│  │  Filter: [All ▼] [🔍 Search...]                                    │ │
│  │                                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ 🟡 MASH-20251216-001           │  John Doe                  │   │ │
│  │  │    3 items • ₱1,234            │  Lalamove → QC             │   │ │
│  │  │                                                              │   │ │
│  │  │    [ ✅ Approve ]  [ ❌ Reject ]  [ 👁 Details ]             │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ 🟢 MASH-20251216-002           │  Jane Smith                │   │ │
│  │  │    Status: Processing           │  Self-Pickup → MASH Main  │   │ │
│  │  │                                                              │   │ │
│  │  │    Update: [ Processing ▼ ]                                  │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                                │
                                                │ Status Update
                                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BUYER ORDER HISTORY                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │           ORDER HISTORY (/profile/order-history)                   │ │
│  ├────────────────────────────────────────────────────────────────────┤ │
│  │                                                                     │ │
│  │  Tabs: [All] [Pending] [Active] [Completed] [Cancelled]            │ │
│  │                                                      🟢 Live Updates│ │
│  │                                                                     │ │
│  │  ┌─────────────────────────────────────────────────────────────┐   │ │
│  │  │ MASH-20251216-001          │  🟢 Approved                   │   │ │
│  │  │ 📦 3 items                 │  Dec 16, 2025 • 2:30 PM        │   │ │
│  │  │ 🚚 Lalamove Delivery       │                                │   │ │
│  │  │                            │  Total: ₱1,234                 │   │ │
│  │  │                            │  [ View Details ▶ ]            │   │ │
│  │  └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Firebase Collections Structure
```
firestore/
│
├── carts/{userId}
│   ├── items: CartItem[]
│   │   ├── productId: string
│   │   ├── name: string
│   │   ├── price: number
│   │   ├── quantity: number
│   │   ├── image: string
│   │   ├── slug: string
│   │   ├── stock: number
│   │   └── grower?: string
│   └── updatedAt: Timestamp
│
└── orders/{orderId}
    ├── id: string
    ├── orderNumber: "MASH-YYYYMMDD-XXX"
    ├── userId: string
    ├── userEmail: string
    ├── userName: string
    ├── userPhone: string
    ├── items: OrderItem[]
    │   ├── productId: string
    │   ├── name: string
    │   ├── price: number
    │   ├── quantity: number
    │   └── image: string
    ├── subtotal: number
    ├── tax: number
    ├── deliveryFee: number
    ├── total: number
    ├── deliveryMethod: "pickup" | "lalamove"
    ├── pickupLocation?: { id, name, address }
    ├── deliveryAddress?: { address, lat, lng }
    ├── lalamoveQuotationId?: string
    ├── paymentMethod: "cod" | "gcash" | "card"
    ├── paymentStatus: "pending" | "paid" | "failed"
    ├── status: OrderStatus
    ├── statusHistory: StatusEntry[]
    │   ├── status: OrderStatus
    │   ├── timestamp: Timestamp
    │   ├── updatedBy?: string
    │   └── note?: string
    ├── createdAt: Timestamp
    ├── updatedAt: Timestamp
    └── approvedBy?: string
```

---

## Implementation Phases

### ✅ Phase 1: Enhanced Cart Context (COMPLETE)
**Files:** `src/contexts/CartContext.tsx`

- [x] `CartItem` interface with full product details
- [x] Stock validation in `addToCart`
- [x] Quantity limits enforcement
- [x] localStorage persistence
- [x] Firebase sync when authenticated

### ✅ Phase 2: Add-to-Cart Updates (COMPLETE)
**Files:** `src/app/(shop)/product/[slug]/page.tsx`, `src/components/ProductCard.tsx`

- [x] Product detail page passes full product object
- [x] Shop page passes full product object
- [x] ProductCard component integration
- [x] Wishlist add-to-cart

### ✅ Phase 3: Cart Dropdown (COMPLETE)
**Files:** `src/components/header/CartDropdown.tsx`

- [x] Real product images and names
- [x] Quantity controls with stock validation
- [x] Remove item functionality
- [x] Empty cart state

### ✅ Phase 4: Checkout Flow (COMPLETE)
**Files:** `src/app/(shop)/checkout/page.tsx`, `src/components/checkout/`

- [x] 3-step checkout process
- [x] Delivery method selection (Pickup/Lalamove)
- [x] `AddressPicker` with Google Maps
- [x] `LalamoveQuote` real-time pricing
- [x] Contact information form
- [x] Payment method selection
- [x] Order review summary

### ✅ Phase 5: Firebase Integration (COMPLETE)
**Files:** `src/lib/firebase/cart.ts`, `src/lib/firebase/orders.ts`

- [x] `FirebaseCartService` - CRUD operations
- [x] `FirebaseOrdersService` - Order management
- [x] Real-time subscriptions with `onSnapshot`
- [x] Cart sync on authentication

### ✅ Phase 6: Order Submission (COMPLETE)
**Files:** `src/app/(shop)/checkout/page.tsx`

- [x] Order data structure with all fields
- [x] `pending_approval` initial status
- [x] Status history tracking
- [x] Success modal with order number
- [x] Cart cleared after order

### ✅ Phase 7: Admin Order Management (COMPLETE)
**Files:** 
- `src/app/(seller)/orders/firebase/page.tsx`
- `src/hooks/useFirebaseOrders.ts`
- `src/app/(user)/profile/order-history/page.tsx`
- `src/app/(user)/profile/my-information/page.tsx`

#### 7.1 Firebase Admin Orders Dashboard ✅
- [x] `/orders/firebase` page with real-time orders
- [x] Pending orders list with visual indicators
- [x] Order detail modal with full information
- [x] Filter by status, search by order number/customer

#### 7.2 Order Actions ✅
- [x] Approve order with confirmation dialog
- [x] Reject order with reason input
- [x] Status update dropdown (processing → shipped → delivered)
- [x] Real-time status sync

#### 7.3 Dashboard Statistics ✅
- [x] Pending approval count (prominent badge)
- [x] Today's revenue calculation
- [x] Processing orders count
- [x] Total orders count

#### 7.4 Buyer Order History ✅
- [x] `/profile/order-history` with real-time updates
- [x] Tab filtering (all, pending, active, completed, cancelled)
- [x] Order cards with status badges
- [x] Order detail dialog with status timeline
- [x] Live updates indicator

#### 7.5 Profile Google Maps ✅
- [x] "Pick from Map" button in profile
- [x] `AddressPicker` integration
- [x] Address auto-fill from map selection

---

### ✅ Phase 8: Delivery Tracking (COMPLETE)
**Goal:** Integrate Lalamove delivery tracking for shipped orders

#### 8.1 Lalamove Order Creation ✅
- [x] Create Lalamove order after admin approves
- [x] Save Lalamove order ID to Firebase
- [x] Auto-schedule delivery API (`/api/orders/schedule-delivery`)

#### 8.2 Driver Information ✅
- [x] Display assigned driver info (name, plate number)
- [x] Driver phone number with call button
- [x] Real-time driver tracking data in Firebase

#### 8.3 Order Tracking Page ✅
- [x] Buyer tracking page (`/profile/orders/[orderId]/track`)
- [x] Admin tracking view in order details
- [x] Real-time status timeline

#### 8.4 Live Tracking Map ✅
- [x] Google Maps with pickup/dropoff markers
- [x] Driver location marker (when available)
- [x] Lalamove share link integration

**Files created/updated:**
```
src/lib/firebase/orders.ts                                   ← Added lalamoveTracking field
src/app/(user)/profile/orders/[orderId]/track/page.tsx       ← NEW: Tracking page
src/app/api/orders/schedule-delivery/route.ts                ← NEW: Auto-create Lalamove
src/app/(seller)/orders/firebase/page.tsx                    ← Added tracking UI + auto-schedule
src/components/delivery/TrackingMap.tsx                      ← Existing map component
src/components/delivery/StatusTimeline.tsx                   ← Existing status timeline
```

### Firebase Order Tracking Schema
```typescript
interface FirestoreOrder {
  // ... existing fields
  lalamoveOrderId?: string;
  lalamoveTracking?: {
    status: string;              // ASSIGNING_DRIVER, ON_GOING, PICKED_UP, COMPLETED
    shareLink?: string;          // Lalamove tracking URL
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    driverPlateNumber?: string;
    driverPhoto?: string;
    driverLocation?: {
      lat: number;
      lng: number;
      updatedAt: Timestamp;
    };
    pickupEta?: string;
    deliveryEta?: string;
    lastUpdated?: Timestamp;
  };
}
```

### 📋 Phase 9: Notifications System (PLANNED)
**Goal:** Real-time notifications for order updates

#### 9.1 In-App Notifications
- [ ] Notification bell in header
- [ ] Notification dropdown/drawer
- [ ] Unread count badge
- [ ] Mark as read functionality

#### 9.2 Firebase Notifications
- [ ] `/notifications/{userId}/` collection
- [ ] Create on order status change
- [ ] Real-time subscription

#### 9.3 Email Notifications (Optional)
- [ ] Order confirmation email
- [ ] Status update emails
- [ ] Email templates

**Files to create:**
```
src/components/header/NotificationBell.tsx         ← UI component
src/lib/firebase/notifications.ts                  ← Firebase service
src/hooks/useNotifications.ts                      ← React hook
```

---

## File Reference

### Firebase Services
| File | Purpose | Status |
|------|---------|--------|
| `src/lib/firebase/config.ts` | Firebase app initialization | ✅ |
| `src/lib/firebase/auth.ts` | Google sign-in, auth functions | ✅ |
| `src/lib/firebase/cart.ts` | Cart CRUD, real-time sync | ✅ |
| `src/lib/firebase/orders.ts` | Order CRUD, status management | ✅ |
| `src/lib/firebase/index.ts` | Barrel exports | ✅ |

### Hooks
| File | Purpose | Status |
|------|---------|--------|
| `src/hooks/useFirebaseOrders.ts` | Admin/user order hooks | ✅ |
| `src/hooks/useSanityProducts.ts` | Product data hooks | ✅ |
| `src/hooks/useUser.ts` | User profile hook | ✅ |

### Checkout Components
| File | Purpose | Status |
|------|---------|--------|
| `src/components/checkout/AddressPicker.tsx` | Google Maps address picker | ✅ |
| `src/components/checkout/LalamoveQuote.tsx` | Delivery quote display | ✅ |
| `src/components/checkout/index.ts` | Exports | ✅ |

### Pages
| URL | File | Status |
|-----|------|--------|
| `/checkout` | `src/app/(shop)/checkout/page.tsx` | ✅ |
| `/orders/firebase` | `src/app/(seller)/orders/firebase/page.tsx` | ✅ |
| `/profile/order-history` | `src/app/(user)/profile/order-history/page.tsx` | ✅ |
| `/profile/my-information` | `src/app/(user)/profile/my-information/page.tsx` | ✅ |

---

## Testing Checklist

### ✅ Buyer Flow - Cart
- [x] Add product to cart from shop page
- [x] Add product to cart from product detail page
- [x] Update quantity in cart dropdown
- [x] Remove item from cart
- [x] Cart persists after refresh (localStorage)
- [x] Cart syncs to Firebase when logged in

### ✅ Buyer Flow - Checkout
- [x] Step 1: Select pickup location
- [x] Step 1: Select Lalamove delivery
- [x] Step 1: Address picker with Google Maps
- [x] Step 1: Lalamove quote displays correctly
- [x] Step 2: Contact form validation
- [x] Step 2: Pre-fills from user profile
- [x] Step 3: Select payment method
- [x] Step 3: Order summary is accurate
- [x] Place order creates Firebase document
- [x] Success modal shows order number
- [x] Cart cleared after order

### ✅ Seller/Admin Flow
- [x] Pending orders display in dashboard
- [x] Order detail modal shows all information
- [x] Approve order updates status
- [x] Reject order with reason works
- [x] Status dropdown updates in real-time
- [x] Order statistics are accurate
- [x] Search filters orders correctly

### ✅ Buyer Order History
- [x] Order history lists user's orders
- [x] Tab filtering works (all/pending/active/completed)
- [x] Order detail dialog accessible
- [x] Status timeline displays correctly
- [x] Real-time updates reflect changes
- [x] Live indicator shows connection status

### ✅ Profile Address
- [x] "Pick from Map" button opens dialog
- [x] Google Maps loads correctly
- [x] Address selection auto-fills form
- [x] Dialog closes after selection

### 📋 Delivery Tracking (Phase 8)
- [ ] Lalamove order created after approval
- [ ] Driver info displays
- [ ] Live tracking map works
- [ ] ETA updates in real-time

### 📋 Notifications (Phase 9)
- [ ] Notification bell in header
- [ ] Unread count badge
- [ ] Notification list/dropdown
- [ ] Mark as read works

---

## Quick Start

### Development
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server (Frontend on port 3000)
npm run dev

# In separate terminal - Start Sanity Studio (port 3333)
cd studio && npm run dev
```

### Testing Order Flow
1. **Add items to cart:** Visit `/shop`, click "Add to Cart"
2. **Checkout:** Go to `/checkout`, complete 3 steps
3. **Admin approval:** Visit `/orders/firebase`, approve the order
4. **Check history:** Visit `/profile/order-history` to see status update

### Environment Variables
```env
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=<key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>

# Google Maps (Required for address picker)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<maps-api-key>

# Lalamove Sandbox (Required for delivery quotes)
LALAMOVE_API_KEY=<api-key>
LALAMOVE_SECRET=<secret>
LALAMOVE_HOST=https://rest.sandbox.lalamove.com
```

---

## Related Documentation

| Document | Description |
|----------|-------------|
| `.github/FIREBASE_GOOGLE_SIGNIN_SETUP.md` | Firebase auth configuration |
| `.github/BUYER_CHECKOUT_FLOW_COMPLETE.md` | Detailed checkout implementation |
| `.github/LALAMOVE_INTEGRATION_COMPLETE.md` | Lalamove API setup |
| `.github/VERCEL_DEPLOYMENT_PLAN.md` | Production deployment |
| `docs/SANITY_CMS_MASTER_PLAN.md` | CMS documentation |

---

## Next Steps

### Immediate (Phase 8)
1. **Lalamove Order Creation** - Auto-create delivery order when admin approves
2. **Tracking Integration** - Show driver location and ETA
3. **Webhook Handling** - Process Lalamove status updates

### Upcoming (Phase 9)
1. **Notification Bell** - Header component with badge
2. **Firebase Notifications** - Real-time notification collection
3. **Email Service** - Order confirmation emails

---

**Last Updated:** December 16, 2025  
**Build Status:** ✅ Passing  
**Deployment:** Ready for Vercel
