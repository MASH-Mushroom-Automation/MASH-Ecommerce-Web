# 🛒 MASH E-Commerce: Complete Cart & Checkout System

**Version:** 12.0 (Firebase-Powered, Full Buyer-to-Seller Flow with Payment & Gmail SMTP)  
**Last Updated:** December 16, 2025  
**Status:** Phase 13 Complete ✅ (Gmail SMTP + End-to-End Verified)  
**Platform:** Next.js 15/16 + Firebase Firestore + Gmail SMTP + PayMongo + Lalamove

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase Status Dashboard](#phase-status-dashboard)
3. [Complete Buyer Flow](#complete-buyer-flow)
4. [User Profile & Address System](#user-profile--address-system)
5. [System Architecture](#system-architecture)
6. [Implementation Phases](#implementation-phases)
7. [File Reference](#file-reference)
8. [Testing Checklist](#testing-checklist)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Quick Start](#quick-start)

---

## Executive Summary

### Goal
A complete end-to-end buyer-to-seller flow using **Firebase Firestore** for cart and order persistence, with real-time order management, approval workflow, and **Lalamove delivery tracking**.

### 🔥 Why Firebase-Only (No Backend Dependency)
The NestJS backend is incomplete, so this system uses **Firebase Firestore** as the primary data store:

- **Cart**: Stored in `carts/{userId}` - syncs across devices
- **Orders**: Stored in `orders/{orderId}` - includes status workflow
- **Notifications**: Stored in `notifications/{notificationId}` - real-time alerts
- **Authentication**: Firebase Auth + Google Sign-In
- **Emails**: Gmail SMTP via Nodemailer for transactional order emails (replaced Resend)

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
| **Profile Address** | `/profile/my-information` | Google Maps "Pick from Map" + Firebase storage |
| **Saved Addresses** | Profile/Checkout | Multiple addresses, select at checkout |
| **Notifications** | Header bell icon | Real-time Firebase notifications |
| **Order Alerts** | Auto-triggered | Notifications on order status changes |
| **📧 Email Notifications** | Automatic | Professional order emails via Gmail SMTP |
| **💳 Payment (GCash)** | Checkout Step 3 | PayMongo GCash e-wallet integration |
| **💳 Payment (Cards)** | Checkout Step 3 | PayMongo Credit/Debit card integration |
| **Payment Status** | Webhooks | Real-time payment status updates |

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
| 8 | Delivery Tracking | ✅ Complete | 100% | Lalamove tracking, driver info |
| 9 | Notifications System | ✅ Complete | 100% | Real-time Firebase notifications |
| 10 | User Profile & Addresses | ✅ Complete | 100% | Firebase address storage, checkout integration |
| 11 | Email Notifications | ✅ Complete | 100% | Order emails via Gmail SMTP (Nodemailer) |
| 12 | Payment Integration | ✅ Complete | 100% | GCash, Cards via PayMongo |
| **13** | **Gmail SMTP & E2E Test** | **✅ Complete** | **100%** | **Gmail SMTP verified, client-safe imports** |

### Progress Bar

```
[█████████████████████████████████████████████████████] 100% Complete (13/13 Phases)
```

---

## Complete Buyer Flow

### Step-by-Step User Journey

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE BUYER CHECKOUT JOURNEY                           │
└─────────────────────────────────────────────────────────────────────────────────┘

    🛒 PHASE 1: SHOPPING
    ────────────────────
    1. User browses /shop or /product/[slug]
    2. User clicks "Add to Cart" button
    3. CartContext adds item with full product data
    4. localStorage saves cart immediately
    5. If logged in, Firebase syncs cart to cloud
    
    📦 PHASE 2: CART REVIEW
    ────────────────────────
    6. User opens cart dropdown in header
    7. Real-time display of items with images, prices
    8. User can adjust quantities (stock-validated)
    9. User clicks "Checkout" button
    
    🚚 PHASE 3: CHECKOUT STEP 1 - DELIVERY
    ───────────────────────────────────────
    10. User selects delivery method:
        a) Self-Pickup: Choose pickup location (MASH Main, BGC, etc.)
        b) Lalamove: Click "Pick from Map" → Google Maps opens
    11. For Lalamove:
        - User searches address or clicks on map
        - AddressPicker geocodes coordinates → address
        - LalamoveQuote fetches real-time delivery price
        - Shows: ₱185 delivery | 45 min ETA
    12. User clicks "Continue to Contact Info"
    
    👤 PHASE 4: CHECKOUT STEP 2 - CONTACT INFO
    ──────────────────────────────────────────
    13. Form pre-fills if user is logged in
    14. User enters/confirms: Name, Email, Phone
    15. User clicks "Continue to Review"
    
    💳 PHASE 5: CHECKOUT STEP 3 - PAYMENT & REVIEW
    ─────────────────────────────────────────────
    16. User reviews full order summary:
        - Items with images, quantities, prices
        - Subtotal + Tax (12%) + Delivery Fee
        - Total amount
    17. User selects payment method:
        ✅ Cash on Delivery (COD) - Available
        ⏳ GCash - Coming Soon
        ⏳ Credit Card - Coming Soon
    18. User clicks "Place Order"
    
    🎉 PHASE 6: ORDER PLACEMENT
    ──────────────────────────
    19. FirebaseOrdersService.createOrder() runs:
        - Generates order number: MASH-20251216-001
        - Status: pending_approval
        - Creates statusHistory entry
        - Saves to Firestore orders collection
    20. FirebaseNotificationsService sends notification:
        - Type: order_placed
        - Title: "Order Placed Successfully"
        - Message: "Your order #MASH-20251216-001 is awaiting approval"
    21. Cart is cleared (localStorage + Firebase)
    22. Success modal shows order number + tracking link
    
    📋 PHASE 7: ADMIN APPROVAL (Seller/Admin)
    ─────────────────────────────────────────
    23. Admin visits /orders/firebase
    24. Sees pending order with orange badge
    25. Admin clicks "View Details" → Order modal
    26. Admin reviews items, delivery info, customer details
    27. Admin clicks:
        a) ✅ APPROVE → Status changes to "approved"
           - If Lalamove: Auto-creates delivery order
           - Buyer gets notification: "Order Approved"
        b) ❌ REJECT → Status changes to "rejected"
           - Buyer gets notification: "Order Rejected" + reason
    
    🚛 PHASE 8: DELIVERY (Lalamove orders only)
    ──────────────────────────────────────────
    28. After approval, /api/orders/schedule-delivery:
        - Calls Lalamove API to create delivery order
        - Lalamove assigns driver
        - Updates Firebase with lalamoveOrderId
    29. Driver info saved to order:
        - driverName, driverPhone, plateNumber
    30. Buyer can track at /profile/orders/[orderId]/track:
        - Live map with pickup/dropoff markers
        - Driver location updates (when available)
        - Status timeline: Assigned → Picked Up → Delivered
    
    ✅ PHASE 9: ORDER COMPLETION
    ──────────────────────────
    31. Admin updates status: shipped → delivered → completed
    32. Buyer receives notification for each status change
    33. Order history shows complete timeline
```

### Firestore Data Flow
```
┌────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   CART ITEM    │     │  CHECKOUT PAGE   │     │   FIREBASE ORDER    │
│                │────▶│                  │────▶│                     │
│ localStorage   │     │ Form validation  │     │ orders/{orderId}    │
│ + Firestore    │     │ + Quote API      │     │ status: pending_    │
│                │     │                  │     │         approval    │
└────────────────┘     └──────────────────┘     └─────────────────────┘
        │                      │                          │
        │                      │                          │
        ▼                      ▼                          ▼
┌────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ CartContext    │     │ AddressPicker    │     │ Admin Dashboard     │
│                │     │                  │     │                     │
│ Real-time sync │     │ Google Maps API  │     │ /orders/firebase    │
│ across devices │     │ Geocoding        │     │ Approve/Reject      │
└────────────────┘     └──────────────────┘     └─────────────────────┘
```

---

## User Profile & Address System

### 🏠 Address Management Overview

The address system allows users to:
1. **Save multiple delivery addresses** in their profile (stored in Firebase)
2. **Pick addresses from Google Maps** using the visual map picker
3. **Auto-fill addresses at checkout** from saved addresses
4. **Get accurate Lalamove delivery quotes** based on GPS coordinates

### Address Flow Diagram
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          USER ADDRESS MANAGEMENT FLOW                            │
└─────────────────────────────────────────────────────────────────────────────────┘

    📍 STEP 1: PROFILE ADDRESS SETUP (/profile/my-information)
    ──────────────────────────────────────────────────────────
    1. User visits profile page
    2. Clicks "Pick from Map" button
    3. Google Maps opens with search + click-to-select
    4. User searches address or clicks map location
    5. AddressPicker:
       - Geocodes coordinates → address components
       - Returns: { address, lat, lng, city, state, zipCode }
    6. Address auto-fills form fields (street, city, etc.)
    7. User saves → Address stored in Firebase
    
    📦 STEP 2: FIREBASE ADDRESS STORAGE
    ───────────────────────────────────
    Firebase Collection: users/{userId}/addresses/{addressId}
    
    {
      id: "addr_001",
      label: "Home",                    // User-friendly name
      isDefault: true,                  // Primary address
      street: "123 Rizal Ave",
      addressLine2: "Unit 5A",
      city: "Quezon City",
      stateProvince: "Metro Manila",
      zipPostal: "1100",
      landmark: "Near SM North EDSA",
      coordinates: {
        lat: 14.6507,
        lng: 121.0322
      },
      formattedAddress: "123 Rizal Ave, Quezon City, Metro Manila",
      createdAt: Timestamp,
      updatedAt: Timestamp
    }
    
    🛒 STEP 3: CHECKOUT ADDRESS SELECTION
    ─────────────────────────────────────
    At Checkout Step 1 (Delivery Method):
    
    ┌─────────────────────────────────────────────────────────────┐
    │ 🚚 Select Delivery Method                                   │
    ├─────────────────────────────────────────────────────────────┤
    │                                                             │
    │  ○ Self-Pickup                                              │
    │    • MASH Main Store - Caloocan City                        │
    │                                                             │
    │  ● Lalamove Delivery                                        │
    │                                                             │
    │    ┌─────────────────────────────────────────────────────┐  │
    │    │ 📍 Select Delivery Address                          │  │
    │    ├─────────────────────────────────────────────────────┤  │
    │    │                                                     │  │
    │    │  ● Home (Default)                                   │  │
    │    │    123 Rizal Ave, Quezon City, Metro Manila         │  │
    │    │    Near SM North EDSA                               │  │
    │    │                                                     │  │
    │    │  ○ Office                                           │  │
    │    │    BGC Corporate Center, Taguig City                │  │
    │    │                                                     │  │
    │    │  ○ + Add New Address                                │  │
    │    │    [Opens Map Picker]                               │  │
    │    │                                                     │  │
    │    └─────────────────────────────────────────────────────┘  │
    │                                                             │
    │    💰 Delivery Fee: ₱185 (via Lalamove)                    │
    │    ⏱️ Estimated: 45-60 minutes                             │
    │                                                             │
    └─────────────────────────────────────────────────────────────┘
    
    🗺️ STEP 4: LALAMOVE QUOTE CALCULATION
    ─────────────────────────────────────
    Using saved coordinates for accurate pricing:
    
    Pickup:  MASH Main Store (14.6760, 120.9779)
    Dropoff: User Address (14.6507, 121.0322)
    
    → Lalamove API calculates:
       - Distance: 8.5 km
       - Vehicle: Motorcycle
       - Fee: ₱185
       - ETA: 45 minutes
```

### Firebase User Profile Schema
```typescript
// Collection: users/{userId}
interface FirestoreUserProfile {
  id: string;                    // Firebase Auth UID
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  
  // Default/Primary Address (for quick access)
  defaultAddress?: {
    id: string;
    street: string;
    city: string;
    stateProvince: string;
    zipPostal: string;
    landmark?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    formattedAddress: string;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Sub-collection: users/{userId}/addresses/{addressId}
interface FirestoreAddress {
  id: string;
  label: string;                 // "Home", "Office", "Mom's House"
  isDefault: boolean;
  street: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  zipPostal: string;
  landmark?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Google Maps API Integration

#### Required APIs (Enable in Google Cloud Console)
| API | Purpose | Required For |
|-----|---------|--------------|
| **Maps JavaScript API** | Display interactive map | AddressPicker, TrackingMap |
| **Places API** | Address autocomplete search | AddressPicker search box |
| **Geocoding API** | Convert coordinates ↔ address | "Pick from Map" feature |

#### AddressPicker Component Usage
```tsx
// In Profile Page
<AddressPicker
  onAddressSelect={(address) => {
    // address contains:
    // - lat, lng (coordinates)
    // - formattedAddress (full string)
    // - components (street, city, state, zipCode)
    saveToFirebase(address);
  }}
  defaultValue={existingAddress}
  placeholder="Search for your address..."
/>

// In Checkout Page (with saved addresses)
<AddressSelector
  savedAddresses={userAddresses}      // From Firebase
  onSelect={(address) => {
    setDeliveryAddress(address);
    fetchLalamoveQuote(address.coordinates);
  }}
  onAddNew={() => setShowMapPicker(true)}
/>
```

### Checkout Integration with Saved Addresses

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CHECKOUT WITH FIREBASE ADDRESSES                              │
└─────────────────────────────────────────────────────────────────────────────────┘

    User arrives at /checkout with items in cart
                           │
                           ▼
    ┌─────────────────────────────────────────┐
    │         Is User Authenticated?           │
    └─────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │   YES ✓    │                 │    NO ✗     │
    │  (Logged in)│                 │  (Guest)    │
    └─────────────┘                 └─────────────┘
           │                               │
           ▼                               │
    ┌─────────────────────┐                │
    │ Fetch saved         │                │
    │ addresses from      │                │
    │ Firebase            │                │
    └─────────────────────┘                │
           │                               │
           ▼                               │
    ┌─────────────────────┐                │
    │ Show address        │                │
    │ dropdown with       │                │
    │ saved addresses     │                │
    └─────────────────────┘                │
           │                               │
           ├───────────────────────────────┤
           ▼                               ▼
    ┌─────────────────────────────────────────┐
    │     Show "Add New Address" Option        │
    │     (Opens Google Maps Picker)           │
    └─────────────────────────────────────────┘
                           │
                           ▼
    ┌─────────────────────────────────────────┐
    │  User selects or adds address            │
    │  → Coordinates sent to Lalamove API      │
    │  → Quote returned: ₱185, 45 mins         │
    └─────────────────────────────────────────┘
                           │
                           ▼
    ┌─────────────────────────────────────────┐
    │  Continue to Step 2: Contact Info        │
    │  (Pre-filled from Firebase profile)      │
    └─────────────────────────────────────────┘
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
├── users/{userId}                              ← User Profile
│   ├── id: string                              // Firebase Auth UID
│   ├── email: string
│   ├── displayName?: string
│   ├── firstName?: string
│   ├── lastName?: string
│   ├── phone?: string
│   ├── avatar?: string
│   ├── defaultAddress?: {                      // Quick access to primary address
│   │   ├── id: string
│   │   ├── street: string
│   │   ├── city: string
│   │   ├── stateProvince: string
│   │   ├── coordinates: { lat, lng }
│   │   └── formattedAddress: string
│   │   }
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
│
├── users/{userId}/addresses/{addressId}        ← Saved Addresses (Sub-collection)
│   ├── id: string
│   ├── label: string                           // "Home", "Office", etc.
│   ├── isDefault: boolean
│   ├── street: string
│   ├── addressLine2?: string
│   ├── city: string
│   ├── stateProvince: string
│   ├── zipPostal: string
│   ├── landmark?: string
│   ├── coordinates: { lat: number, lng: number }
│   ├── formattedAddress: string
│   ├── createdAt: Timestamp
│   └── updatedAt: Timestamp
│
├── carts/{userId}                              ← Shopping Cart
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
├── orders/{orderId}                            ← Orders
│   ├── id: string
│   ├── orderNumber: "MASH-YYYYMMDD-XXX"
│   ├── userId: string
│   ├── userEmail: string
│   ├── userName: string
│   ├── userPhone: string
│   ├── items: OrderItem[]
│   │   ├── productId: string
│   │   ├── name: string
│   │   ├── price: number
│   │   ├── quantity: number
│   │   └── image: string
│   ├── subtotal: number
│   ├── tax: number
│   ├── deliveryFee: number
│   ├── total: number
│   ├── deliveryMethod: "pickup" | "lalamove"
│   ├── pickupLocation?: { id, name, address }
│   ├── deliveryAddress?: {                     // From user's saved address
│   │   ├── address: string
│   │   ├── lat: number
│   │   ├── lng: number
│   │   ├── landmark?: string
│   │   └── addressId?: string                  // Reference to saved address
│   │   }
│   ├── lalamoveQuotationId?: string
│   ├── lalamoveOrderId?: string
│   ├── lalamoveTracking?: {...}
│   ├── paymentMethod: "cod" | "gcash" | "card"
│   ├── paymentStatus: "pending" | "paid" | "failed"
│   ├── status: OrderStatus
│   ├── statusHistory: StatusEntry[]
│   ├── createdAt: Timestamp
│   ├── updatedAt: Timestamp
│   └── approvedBy?: string
│
└── notifications/{notificationId}              ← Notifications
    ├── id: string
    ├── userId: string
    ├── type: NotificationType
    ├── title: string
    ├── message: string
    ├── read: boolean
    ├── data?: { orderId?, orderNumber?, status?, link? }
    ├── createdAt: Timestamp
    └── readAt?: Timestamp
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

### ✅ Phase 9: Notifications System (COMPLETE)
**Goal:** Real-time notifications for order updates

#### 9.1 In-App Notifications ✅
- [x] Notification bell in header (NotificationDropdown)
- [x] Notification dropdown with list
- [x] Unread count badge
- [x] Mark as read functionality
- [x] Delete notification

#### 9.2 Firebase Notifications ✅
- [x] `notifications` collection in Firestore
- [x] Create on order status change (approved, rejected, shipped, delivered)
- [x] Create on order placement (order_placed)
- [x] Create on driver assigned
- [x] Real-time subscription with `onSnapshot`

#### 9.3 Notification Types ✅
- [x] order_placed - When buyer places order
- [x] order_approved - When admin approves order
- [x] order_rejected - When admin rejects order
- [x] order_processing - When order is being prepared
- [x] order_shipped - When order is shipped/out for delivery
- [x] order_delivered - When order is delivered
- [x] order_completed - When order is marked complete
- [x] driver_assigned - When Lalamove driver is assigned

**Files created/updated:**
```
src/lib/firebase/notifications.ts                  ← NEW: Firebase notifications service
src/hooks/useFirebaseNotifications.ts              ← NEW: Real-time notifications hook
src/components/layout/notification-dropdown.tsx    ← Updated to use Firebase
src/lib/firebase/orders.ts                         ← Added notification triggers
```

### Firebase Notification Schema
```typescript
interface FirestoreNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: {
    orderId?: string;
    orderNumber?: string;
    status?: string;
    link?: string;
  };
  createdAt: Timestamp;
  readAt?: Timestamp;
}

type NotificationType =
  | "order_placed"
  | "order_approved"
  | "order_rejected"
  | "order_processing"
  | "order_shipped"
  | "order_delivered"
  | "order_completed"
  | "driver_assigned"
  | "delivery_update"
  | "promo"
  | "system";
```

---

### ✅ Phase 10: User Profile & Firebase Address Storage (COMPLETE)
**Goal:** Store user addresses in Firebase and integrate with checkout for Lalamove delivery

#### 10.1 Firebase Address Service ✅
- [x] Create `src/lib/firebase/addresses.ts` service
- [x] `FirebaseAddressService` class with CRUD operations
- [x] Add address with Google Maps coordinates
- [x] Update address
- [x] Delete address
- [x] Set default address
- [x] Get all addresses for user
- [x] Real-time subscription with `subscribeToAddresses()`

#### 10.2 useFirebaseAddresses Hook ✅
- [x] Create `src/hooks/useFirebaseAddresses.ts` hook
- [x] Real-time address subscription
- [x] Loading and error states
- [x] Add, update, delete, setDefault operations
- [x] Auto-fetch default address

#### 10.3 Profile Page Updates ✅
- [x] "Pick from Map" button opens Google Maps picker
- [x] AddressPicker component integration
- [x] Address auto-fill from map selection
- [x] Save address to Firebase on map selection
- [x] Display list of saved addresses with labels
- [x] Set address as default (click to select)
- [x] Delete saved addresses
- [x] Default address badge indicator

#### 10.4 Checkout Integration ✅
- [x] Fetch saved addresses at checkout via `useFirebaseAddresses`
- [x] AddressSelector component with radio buttons
- [x] "Use a different address" option opens map picker
- [x] "Use saved address" button to switch back
- [x] Auto-select default address when Lalamove is selected
- [x] Use coordinates for Lalamove quote

#### 10.5 Lalamove Quote with Saved Address ✅
- [x] Use exact coordinates from saved address
- [x] Calculate accurate delivery fee via LalamoveQuote component
- [x] Show ETA based on distance
- [x] Seamless switching between saved and new addresses

**Files Created/Updated:**
```
src/lib/firebase/addresses.ts                      ✅ CREATED: Firebase address service
src/lib/firebase/index.ts                          ✅ UPDATED: Added address exports
src/hooks/useFirebaseAddresses.ts                  ✅ CREATED: Address management hook
src/components/checkout/AddressSelector.tsx        ✅ CREATED: Saved address dropdown
src/components/checkout/index.ts                   ✅ UPDATED: Added AddressSelector export
src/app/(user)/profile/my-information/page.tsx     ✅ UPDATED: Firebase address integration
src/app/(shop)/checkout/page.tsx                   ✅ UPDATED: Address selection at checkout
```

#### Implementation Details

**Firebase Address Service (`src/lib/firebase/addresses.ts`):**
```typescript
export const FirebaseAddressService = {
  addAddress(userId: string, address: AddAddressInput): Promise<string>;
  updateAddress(userId: string, addressId: string, data: Partial<AddAddressInput>): Promise<void>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
  getAddresses(userId: string): Promise<FirestoreAddress[]>;
  getDefaultAddress(userId: string): Promise<FirestoreAddress | null>;
  subscribeToAddresses(userId: string, callback: (addresses: FirestoreAddress[]) => void): Unsubscribe;
};
```

**useFirebaseAddresses Hook (`src/hooks/useFirebaseAddresses.ts`):**
```typescript
export function useFirebaseAddresses() {
  return {
    addresses: FirestoreAddress[];           // All user addresses
    defaultAddress: FirestoreAddress | null; // Current default
    loading: boolean;
    error: string | null;
    addAddress(data: AddAddressInput): Promise<string>;
    updateAddress(addressId: string, data: Partial<AddAddressInput>): Promise<void>;
    deleteAddress(addressId: string): Promise<void>;
    setDefault(addressId: string): Promise<void>;
  };
}
```

**AddressSelector Component (`src/components/checkout/AddressSelector.tsx`):**
- Displays saved addresses as radio buttons
- Shows default address badge
- Integrates with checkout flow
- Optional "Add New Address" button with map picker

---

### ✅ Phase 11: Email Notifications via Gmail SMTP (COMPLETE)
**Goal:** Send professional email notifications for all order status changes using Gmail SMTP

#### 11.1 Email Service Setup ✅
- [x] Install `nodemailer` and `@types/nodemailer` packages
- [x] Create `src/lib/email/gmail-smtp.ts` client configuration
- [x] Environment variable handling for Gmail App Password
- [x] Connection pooling for better performance
- [x] SMTP verification function

#### 11.2 Email Templates ✅
- [x] Create `src/lib/email/templates/email-layout.tsx` - Base layout
- [x] Create `src/lib/email/templates/order-items.tsx` - Order items component
- [x] Create `src/lib/email/templates/order-confirmation.tsx` - Order placed
- [x] Create `src/lib/email/templates/order-approved.tsx` - Order approved
- [x] Create `src/lib/email/templates/order-rejected.tsx` - Order rejected
- [x] Create `src/lib/email/templates/order-shipped.tsx` - Out for delivery
- [x] Create `src/lib/email/templates/order-delivered.tsx` - Delivered

#### 11.3 Email Sending Service ✅
- [x] Create `src/lib/email/send-email.ts` high-level sending functions
- [x] React Email template rendering with `@react-email/components`
- [x] Type-safe payload interface
- [x] Error handling with graceful fallback
- [x] Non-blocking async email sending

#### 11.4 API Route ✅
- [x] Create `src/app/api/email/send/route.ts` endpoint
- [x] POST handler for sending emails
- [x] GET handler for health check with SMTP verification
- [x] Input validation

#### 11.5 Integration Points ✅
- [x] Checkout page: Send confirmation email on order placement
- [x] Admin dashboard: Send approval email on approve
- [x] Admin dashboard: Send rejection email on reject
- [x] Admin dashboard: Send shipped email on status update
- [x] Admin dashboard: Send delivered email on completion

**Files Created/Updated:**
```
src/lib/email/gmail-smtp.ts                        ✅ CREATED: Gmail SMTP config
src/lib/email/send-email.ts                        ✅ UPDATED: Uses Gmail SMTP
src/lib/email/index.ts                             ✅ UPDATED: Gmail exports
src/lib/email/templates/email-layout.tsx           ✅ CREATED: Base email layout
src/lib/email/templates/order-items.tsx            ✅ CREATED: Order items component
src/lib/email/templates/order-confirmation.tsx     ✅ CREATED: Order placed email
src/lib/email/templates/order-approved.tsx         ✅ CREATED: Order approved email
src/lib/email/templates/order-rejected.tsx         ✅ CREATED: Order rejected email
src/lib/email/templates/order-shipped.tsx          ✅ CREATED: Out for delivery email
src/lib/email/templates/order-delivered.tsx        ✅ CREATED: Delivery complete email
src/lib/email/templates/index.ts                   ✅ CREATED: Template exports
src/app/api/email/send/route.ts                    ✅ UPDATED: Gmail SMTP health check
src/app/(shop)/checkout/page.tsx                   ✅ UPDATED: Send confirmation email
src/app/(seller)/orders/firebase/page.tsx          ✅ UPDATED: Send status emails
```

#### Environment Variables Required
```env
# Gmail SMTP Configuration
# 1. Enable 2-Factor Authentication on Gmail account
# 2. Generate App Password: Google Account > Security > App passwords
# 3. Use the 16-character app password (not your regular password)

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=MASH.Mushroom.Automation@gmail.com
EMAIL_PASSWORD=rtaeavlpvqaovgix           # App-specific password
EMAIL_FROM=MASH Mushroom Automation <MASH.Mushroom.Automation@gmail.com>
```

#### Email Types and Triggers

| Email Type | Trigger | Template |
|------------|---------|----------|
| Order Confirmation | Customer places order | `order-confirmation.tsx` |
| Order Approved | Admin approves order | `order-approved.tsx` |
| Order Rejected | Admin rejects order | `order-rejected.tsx` |
| Order Shipped | Order marked as shipped | `order-shipped.tsx` |
| Order Delivered | Order marked as delivered/completed | `order-delivered.tsx` |

#### Usage Example

```typescript
import { sendOrderConfirmationEmail } from "@/lib/email";

// Send order confirmation (non-blocking)
sendOrderConfirmationEmail(customerEmail, {
  customerName: "Juan Dela Cruz",
  orderNumber: "ORD-ABC123",
  orderId: "firebase-order-id",
  items: [{ name: "Blue Oyster", quantity: 2, price: 450, image: "..." }],
  subtotal: 450,
  deliveryFee: 185,
  total: 635,
  deliveryMethod: "lalamove",
  deliveryAddress: "123 Main St, Manila",
}).catch(console.error);
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
| `src/lib/firebase/notifications.ts` | Notifications CRUD, real-time | ✅ |
| `src/lib/firebase/addresses.ts` | User addresses CRUD | ✅ Phase 10 |
| `src/lib/firebase/index.ts` | Barrel exports | ✅ |

### Email Service (Phase 11 - Gmail SMTP)
| File | Purpose | Status |
|------|---------|--------|
| `src/lib/email/gmail-smtp.ts` | Gmail SMTP via Nodemailer | ✅ |
| `src/lib/email/send-email.ts` | High-level email sending functions | ✅ |
| `src/lib/email/index.ts` | Email module exports | ✅ |
| `src/lib/email/templates/email-layout.tsx` | Base email layout with header/footer | ✅ |
| `src/lib/email/templates/order-items.tsx` | Reusable order items component | ✅ |
| `src/lib/email/templates/order-confirmation.tsx` | Order placed email | ✅ |
| `src/lib/email/templates/order-approved.tsx` | Order approved email | ✅ |
| `src/lib/email/templates/order-rejected.tsx` | Order rejected email | ✅ |
| `src/lib/email/templates/order-shipped.tsx` | Out for delivery email | ✅ |
| `src/lib/email/templates/order-delivered.tsx` | Delivery complete email | ✅ |
| `src/lib/email/templates/index.ts` | Template exports | ✅ |
| `src/app/api/email/send/route.ts` | Email API endpoint | ✅ |

### Hooks
| File | Purpose | Status |
|------|---------|--------|
| `src/hooks/useFirebaseOrders.ts` | Admin/user order hooks | ✅ |
| `src/hooks/useFirebaseNotifications.ts` | Real-time notifications | ✅ |
| `src/hooks/useFirebaseAddresses.ts` | User address management | ✅ Phase 10 |
| `src/hooks/useSanityProducts.ts` | Product data hooks | ✅ |
| `src/hooks/useUser.ts` | User profile hook | ✅ |

### Checkout Components
| File | Purpose | Status |
|------|---------|--------|
| `src/components/checkout/AddressPicker.tsx` | Google Maps address picker (updated to use new API) | ✅ |
| `src/components/checkout/AddressSelector.tsx` | Saved addresses dropdown | ✅ Phase 10 |
| `src/components/checkout/LalamoveQuote.tsx` | Delivery quote display | ✅ |
| `src/components/checkout/index.ts` | Exports | ✅ |

### Known Issues Fixed
| Issue | Fix | Date |
|-------|-----|------|
| Google Maps Loader deprecated | Updated `AddressPicker.tsx` to use direct script loading instead of deprecated `@googlemaps/js-api-loader` Loader class | Dec 16, 2025 |
| Geocoding API not authorized | **USER ACTION REQUIRED** - Enable Geocoding API in Google Cloud Console for your API key | Dec 16, 2025 |
| Firebase offline error | Normal behavior - Firebase has offline persistence, data syncs when online | Dec 16, 2025 |
| Firebase setDoc undefined field | Fixed `orders.ts` to exclude `undefined` optional fields (pickupLocation, deliveryAddress, lalamoveQuotationId, notes) | Dec 16, 2025 |
| Wrong field name `customerId` | Fixed to use `userId` in order status notification | Dec 16, 2025 |
| Phone validation too loose | Updated checkout to validate Philippine phone format (09XX or +63) | Dec 16, 2025 |

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
- [x] Step 1: Select from saved addresses (Phase 10)
- [x] Step 1: Auto-select default address (Phase 10)
- [x] Step 1: Switch between saved and new address (Phase 10)
- [x] Step 2: Contact form validation
- [x] Step 2: Phone number validation (Philippine format)
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
- [x] Lalamove order created after approval
- [x] Driver info displays
- [x] Live tracking map works
- [x] ETA updates in real-time

### 📋 Notifications (Phase 9)
- [x] Notification bell in header
- [x] Unread count badge
- [x] Notification list/dropdown
- [x] Mark as read works

### 📋 User Profile & Addresses (Phase 10) - IN PROGRESS
- [ ] Save address to Firebase from profile page
- [ ] Display saved addresses list
### ✅ User Profile & Addresses (Phase 10)
- [x] Save address to Firebase from profile page
- [x] Display saved addresses list in profile
- [x] Set default address (click to select)
- [x] Delete saved address
- [x] Show saved addresses at checkout
- [x] Select from saved addresses for delivery
- [x] "Use a different address" opens map picker
- [x] "Use saved address" returns to saved list
- [x] Auto-select default address at checkout
- [x] Lalamove quote uses saved address coordinates

### ✅ Email Notifications (Phase 11)
- [x] Email service configured with Gmail SMTP (Nodemailer)
- [x] Order confirmation email sent on checkout
- [x] Order approved email sent on admin approval
- [x] Order rejected email sent on admin rejection
- [x] Order shipped email sent on status update
- [x] Order delivered email sent on completion
- [x] Emails include order details (items, prices, totals)
- [x] Emails include delivery/pickup information
- [x] Email failures don't block order flow
- [x] API endpoint `/api/email/send` works
- [x] Health check `/api/email/send` (GET) returns SMTP status

---

## Troubleshooting Guide

### 🗺️ Google Maps API Errors

#### Error: "This API project is not authorized to use this API"
**Console Message:**
```
Geocoding Service: This API project is not authorized to use this API.
GEOCODER_GEOCODE: REQUEST_DENIED: The webpage is not allowed to use the geocoder.
```

**Solution:** Enable required Google Maps APIs in Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Enable these APIs:
   - ✅ **Maps JavaScript API** (for map display)
   - ✅ **Places API** (for address autocomplete)
   - ✅ **Geocoding API** (for reverse geocoding - converting lat/lng to address)
5. Go to **APIs & Services** > **Credentials**
6. Edit your API key restrictions:
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: Add your domains:
     - `http://localhost:3000/*`
     - `https://your-domain.vercel.app/*`
   - **API restrictions**: Select "Restrict key" and enable:
     - Maps JavaScript API
     - Places API
     - Geocoding API

**Environment Variable:**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYw7TkeGXq6UJgms9AF06eRCYd3C-fqe8
```

#### Error: "Google Maps Loader deprecated"
**Fix Applied:** Updated `AddressPicker.tsx` to use direct script loading instead of the deprecated `@googlemaps/js-api-loader` Loader class. See Known Issues Fixed table.

---

### 🔥 Firebase Errors

#### Error: "Failed to get document because the client is offline"
**Console Message:**
```
FirebaseError: Failed to get document because the client is offline.
```

**Causes & Solutions:**
1. **Network connectivity**: Check internet connection
2. **Firebase offline persistence**: This is expected when offline - Firebase has offline support
3. **Firestore rules blocking access**: Check Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Carts - users can only access their own cart
       match /carts/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       // Orders - users can read their own orders
       match /orders/{orderId} {
         allow read: if request.auth != null && (
           request.auth.uid == resource.data.userId ||
           request.auth.token.admin == true
         );
         allow create: if request.auth != null;
         allow update: if request.auth != null && request.auth.token.admin == true;
       }
       // Notifications - users can access their own
       match /notifications/{notificationId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
     }
   }
   ```
4. **User not authenticated**: Ensure user is logged in before accessing cart/orders

---

### 🚚 Lalamove API Errors

#### Error: "Invalid quotation request"
**Cause:** Address coordinates outside Lalamove service area or invalid format

**Solution:**
- Ensure pickup location is valid (MASH main location)
- Ensure delivery address is within Metro Manila
- Check that coordinates are in correct format: `{ lat: number, lng: number }`

#### Error: "Quotation expired"
**Cause:** Lalamove quotations expire after 1 hour

**Solution:** Request new quote if more than 1 hour has passed

---

### 🛒 Cart Issues

#### Cart not persisting after refresh
**Check:**
1. localStorage is not blocked by browser
2. Cart version is correct (version: 2)
3. Clear old cart data:
   ```javascript
   localStorage.removeItem('mash-cart');
   localStorage.removeItem('cart');
   ```

#### Cart not syncing to Firebase
**Check:**
1. User is authenticated (`isAuthenticated === true`)
2. User has valid `user.id`
3. Firebase Firestore rules allow writes to `carts/{userId}`

---

### 📦 Order Issues

#### Error: "Function setDoc() called with invalid data. Unsupported field value: undefined"
**Console Message:**
```
FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined 
(found in field deliveryAddress in document orders/...)
```

**Cause:** Firebase `setDoc()` doesn't accept `undefined` values in objects.

**Fix Applied:** Updated `src/lib/firebase/orders.ts` to conditionally add optional fields only when they have values:
```typescript
// Only add optional fields if they have values
if (data.pickupLocation) {
  order.pickupLocation = data.pickupLocation;
}
if (data.deliveryAddress) {
  order.deliveryAddress = data.deliveryAddress;
}
```

**Status:** ✅ Fixed in v5.0

#### Order stuck at "pending_approval"
**Solution:** Admin must approve at `/orders/firebase`:
1. Login as admin/seller
2. Go to `/orders/firebase`
3. Click "View Details" on pending order
4. Click "Approve" or "Reject"

#### Lalamove delivery not created after approval
**Check:**
1. Order has `lalamoveQuotationId` (was Lalamove delivery selected?)
2. `/api/orders/schedule-delivery` API is accessible
3. Lalamove API keys are configured in `.env.local`

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

### Testing Email System
```bash
# Test Gmail SMTP connection and send test email
node scripts/test-gmail-email.js
```

Expected output:
```
✅ SMTP connection verified!
✅ Email sent successfully!
🎉 Gmail SMTP is configured correctly!
```

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

# Gmail SMTP (Required for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password      # App-specific password from Google
EMAIL_FROM=Your Name <your-email@gmail.com>

# PayMongo (Required for payments)
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxx
PAYMONGO_SECRET_KEY=sk_test_xxx
```

---

## Related Documentation

| Document | Description |
|----------|-------------|
| `.github/FIREBASE_GOOGLE_SIGNIN_SETUP.md` | Firebase auth configuration |
| `.github/BUYER_CHECKOUT_FLOW_COMPLETE.md` | Detailed checkout implementation |
| `.github/VERCEL_DEPLOYMENT_PLAN.md` | Production deployment |
| `docs/SANITY_CMS_MASTER_PLAN.md` | CMS documentation |

---

## 🎉 Core Phases Complete! Now Adding Email Notifications

The complete buyer-to-seller flow is fully implemented with Firebase. Now adding email notifications for a complete professional experience.

### ✅ What's Working (Phases 1-10)
1. **Add to Cart** - Products added with full details, synced to Firebase
2. **Cart Management** - Real-time cart dropdown with quantity controls
3. **3-Step Checkout** - Delivery → Contact → Payment flow
4. **Google Maps Integration** - Address picker with geocoding
5. **Saved Addresses** - Multiple addresses stored in Firebase
6. **Address Selection at Checkout** - Choose from saved or add new
7. **Lalamove Delivery** - Real-time quotes based on coordinates
8. **Order Creation** - Orders saved to Firebase with full details
9. **Admin Dashboard** - Approve/reject orders, status management
10. **Delivery Tracking** - Live Lalamove tracking with driver info
11. **In-App Notifications** - Real-time order status alerts

---

## ✅ Phase 11: Email Notifications (COMPLETE - Gmail SMTP)

### Goal
Send professional email notifications to customers for order updates using **Gmail SMTP via Nodemailer** (up to 500 emails/day for free).

### Email Types Implemented

| Email Type | Trigger | Status |
|------------|---------|--------|
| **Order Confirmation** | Order placed successfully | ✅ Complete |
| **Order Approved** | Admin approves order | ✅ Complete |
| **Order Rejected** | Admin rejects order | ✅ Complete |
| **Order Shipped** | Order dispatched for delivery | ✅ Complete |
| **Order Delivered** | Order delivered successfully | ✅ Complete |
| **Driver Assigned** | Lalamove driver assigned | 🔶 Future |
| **Abandoned Cart** | Cart inactive for 24h | ⏳ Future |
| **Welcome Email** | New user registration | ⏳ Future |

### Implementation Complete ✅

#### 11.1 Email Service Setup ✅
- [x] Install Nodemailer (`npm install nodemailer`)
- [x] Create `src/lib/email/gmail-smtp.ts` - Gmail SMTP configuration
- [x] Create `src/lib/email/templates/` - Email template components
- [x] Add Gmail SMTP environment variables

#### 11.2 Email Templates (React Email) ✅
- [x] `order-confirmation.tsx` - Order placed with items summary
- [x] `order-approved.tsx` - Order approved, preparing for delivery
- [x] `order-rejected.tsx` - Order rejected with reason
- [x] `order-shipped.tsx` - Out for delivery with tracking info
- [x] `order-delivered.tsx` - Delivery complete, thank you message

#### 11.3 API Route for Sending Emails ✅
- [x] Create `src/app/api/email/send/route.ts`
- [x] Validate request payload
- [x] Send appropriate email based on type
- [x] Return success/error response

#### 11.4 Integration with Order Flow ✅
- [x] Trigger email on order creation (checkout page)
- [x] Trigger email on order status change (admin dashboard)
- [x] Trigger email on Lalamove driver assignment

### Email Template Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ORDER CONFIRMATION EMAIL                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  🍄 MASH - Fresh Mushrooms Delivered                                            │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  Hi [Customer Name],                                                             │
│                                                                                  │
│  Thank you for your order! 🎉                                                    │
│                                                                                  │
│  ORDER #MASH-20251216-001                                                        │
│  Placed on: December 16, 2025 at 2:30 PM                                        │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  📦 ORDER ITEMS                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │ [IMG] King Oyster Mushroom 500g              x2         ₱590.00          │  │
│  │ [IMG] Blue Oyster Mushroom 250g              x1         ₱195.00          │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  Subtotal:                                               ₱785.00                │
│  Delivery Fee (Lalamove):                                ₱185.00                │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  TOTAL:                                                  ₱970.00                │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  🚚 DELIVERY DETAILS                                                             │
│  Method: Same-Day Delivery (Lalamove)                                           │
│  Address: 123 Rizal Ave, Quezon City, Metro Manila                              │
│                                                                                  │
│  💳 PAYMENT                                                                      │
│  Method: Cash on Delivery (COD)                                                 │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ⏳ WHAT'S NEXT?                                                                 │
│  Your order is being reviewed by our team. You'll receive another email         │
│  once it's approved and ready for delivery.                                     │
│                                                                                  │
│  [Track Your Order] button                                                      │
│                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  Questions? Reply to this email or contact us at support@mash.ph                │
│                                                                                  │
│  © 2025 MASH - Fresh Mushrooms Delivered                                        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Files to Create

```
src/lib/email/
├── resend.ts                      ← Email client config
├── index.ts                       ← Barrel exports
└── templates/
    ├── order-confirmation.tsx     ← Order placed email
    ├── order-approved.tsx         ← Order approved email
    ├── order-rejected.tsx         ← Order rejected email
    ├── order-shipped.tsx          ← Out for delivery email
    ├── order-delivered.tsx        ← Delivery complete email
    └── components/
        ├── email-header.tsx       ← MASH logo header
        ├── email-footer.tsx       ← Footer with contact
        ├── order-items.tsx        ← Items table component
        └── email-button.tsx       ← CTA button component

src/app/api/email/
└── send/
    └── route.ts                   ← Email sending endpoint
```

### Environment Variables Required

```env
# Gmail SMTP Configuration (Email Notifications)
# 1. Enable 2FA on Gmail account
# 2. Generate App Password: Google Account > Security > App passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=MASH.Mushroom.Automation@gmail.com
EMAIL_PASSWORD=rtaeavlpvqaovgix           # App-specific password
EMAIL_FROM=MASH Mushroom Automation <MASH.Mushroom.Automation@gmail.com>
```

---

## Next Steps (Future Phases)

### 🔐 Pre-Deployment Checklist
- [x] Enable Geocoding API in Google Cloud Console (fixed map address error)
- [ ] Configure Firestore security rules (production-ready)
- [ ] Set up Firebase Authentication rules
- [ ] Test with production Lalamove keys (switch from sandbox)
- [ ] Verify all environment variables in Vercel
- [x] Gmail SMTP configured for production emails

### 💳 Phase 12: Payment Integration ✅ COMPLETE
**Implementation:** PayMongo API for Philippine e-wallet and card payments

#### Files Created
```
src/lib/payment/
├── paymongo.ts          # PayMongo service (GCash, GrabPay, Cards)
└── index.ts             # Module exports

src/app/api/payment/
├── create-intent/route.ts   # Create payment intents/sources
├── status/route.ts          # Check payment status
└── webhook/route.ts         # PayMongo webhook handler

src/app/(shop)/checkout/
├── payment-success/page.tsx # Payment success page
└── payment-failed/page.tsx  # Payment failed page
```

#### Payment Methods Supported
| Method | Type | Status | Description |
|--------|------|--------|-------------|
| **COD** | Cash | ✅ Available | Cash on Pickup/Delivery |
| **GCash** | E-wallet | ✅ Available | PayMongo Source API |
| **Card** | Credit/Debit | ✅ Available | PayMongo Payment Intent API |

#### Environment Variables Required
```env
# PayMongo API Keys
PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
PAYMONGO_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

#### Payment Flow
```
1. User selects payment method at checkout
   └── COD: Order created with status=pending_approval
   └── GCash/Card: Create PayMongo source/intent

2. For GCash:
   └── PayMongo returns checkout_url
   └── User redirected to GCash authorization
   └── User authorizes payment in GCash app
   └── Redirected to /checkout/payment-success

3. For Card:
   └── PayMongo returns payment_intent
   └── Card details collected via PayMongo.js
   └── 3D Secure handled automatically
   └── Redirected to success/failure page

4. Webhook receives payment status
   └── source.chargeable → Create payment
   └── payment.paid → Update order to paid
   └── payment.failed → Update order to failed
```

#### Checkout Page Updates
- Added payment method selection UI with icons
- Button text changes based on payment method
- Processing spinner during payment
- Session storage for pending order info

### ✅ Phase 13: Gmail SMTP & End-to-End Testing (COMPLETE)

**Goal:** Migrate from Resend to Gmail SMTP and ensure full buyer flow works.

#### 13.1 Gmail SMTP Migration ✅
**Files Created:**
- `src/lib/email/gmail-smtp.ts` - Nodemailer Gmail SMTP client
- `src/lib/email/client.ts` - Client-safe API wrapper (no Node.js deps)

**Files Updated:**
- `src/lib/email/send-email.ts` - Uses Gmail SMTP via Nodemailer
- `src/lib/email/index.ts` - Updated exports for Gmail

**Key Changes:**
```typescript
// Server-side (API routes only) - imports nodemailer
import { sendEmail } from "@/lib/email";

// Client-side (checkout, seller dashboard) - uses fetch API
import { sendOrderConfirmationEmailViaAPI } from "@/lib/email/client";
```

#### 13.2 Client Components Fixed ✅
- `checkout/page.tsx` → `sendOrderConfirmationEmailViaAPI`
- `checkout/payment-success/page.tsx` → `sendOrderConfirmationEmailViaAPI`
- `(seller)/orders/firebase/page.tsx` → All `*ViaAPI` functions

**Why This Matters:**
Nodemailer requires Node.js-only modules (`child_process`, `net`, etc.) which crash Next.js client components. The `client.ts` wrapper calls the API route via `fetch()`, keeping everything browser-safe.

#### 13.3 Environment Configuration ✅

```env
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=MASH.Mushroom.Automation@gmail.com
EMAIL_PASSWORD=rtaeavlpvqaovgix
EMAIL_FROM=MASH Mushroom Automation <MASH.Mushroom.Automation@gmail.com>
```

#### 13.4 Test Script ✅
Run email test: `node scripts/test-gmail-email.js`

```
✅ SMTP connection verified!
✅ Email sent successfully!
🎉 Gmail SMTP is configured correctly!
```

#### 13.5 Email Types Supported ✅
| Email Type | Trigger | Template |
|------------|---------|----------|
| `order_confirmation` | Order placed | OrderConfirmationEmail |
| `order_approved` | Admin approves | OrderApprovedEmail |
| `order_rejected` | Admin rejects | OrderRejectedEmail |
| `order_shipped` | Lalamove pickup | OrderShippedEmail |
| `order_delivered` | Delivery complete | OrderDeliveredEmail |

### 📱 Phase 14: Mobile Optimization (Future)
1. **PWA Support** - Offline capability
2. **Push Notifications** - Firebase Cloud Messaging
3. **Mobile-first checkout** - Improved UX on phones

### 🏪 Phase 15: Multi-Seller Support (Future)
1. **Seller Onboarding** - Registration flow
2. **Per-Seller Orders** - Route orders to correct seller
3. **Seller Dashboard** - Individual seller analytics

---

## API Keys Required for Full Functionality

| Service | Purpose | Status | Console Link |
|---------|---------|--------|--------------|
| **Firebase** | Auth, Cart, Orders, Notifications, Addresses | ✅ Configured | [Firebase Console](https://console.firebase.google.com/) |
| **Google Maps** | Address picker, delivery tracking | ✅ Geocoding API enabled | [Google Cloud Console](https://console.cloud.google.com/apis/library) |
| **Lalamove** | Delivery quotes, order creation | ✅ Sandbox configured | [Lalamove Business](https://www.lalamove.com/ph/business) |
| **Sanity CMS** | Products, content | ✅ Configured | [Sanity Manage](https://sanity.io/manage) |
| **Gmail SMTP** | Email notifications | ✅ Configured | [Gmail App Passwords](https://myaccount.google.com/apppasswords) |
| **PayMongo** | Payment processing (GCash, Cards) | ✅ Configured | [PayMongo Dashboard](https://dashboard.paymongo.com/) |

---

**Last Updated:** December 16, 2025  
**Version:** 12.0  
**Build Status:** ✅ Passing  
**Current Focus:** All 13 Phases Complete (Including Gmail SMTP Migration) 🎉  
**Deployment:** Ready for Vercel