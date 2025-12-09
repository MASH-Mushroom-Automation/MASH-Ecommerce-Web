# 🛒 MASH E-Commerce: Complete Add-to-Cart & Checkout Implementation Plan

**Version:** 1.0  
**Created:** December 10, 2025  
**Status:** Implementation Ready  
**Estimated Time:** 12-16 hours total  
**Priority:** 🔴 HIGH - Critical for E-Commerce Functionality

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Gap Analysis](#gap-analysis)
4. [Implementation Phases](#implementation-phases)
5. [GitHub Project Tickets](#github-project-tickets)
6. [Technical Specifications](#technical-specifications)
7. [Testing Checklist](#testing-checklist)
8. [Success Criteria](#success-criteria)

---

## Executive Summary

### Goal
Enable users to seamlessly add products to cart, manage cart items, and complete checkout with payment and delivery options.

### Current Status
| Component | Status | Issues |
|-----------|--------|--------|
| Cart Context | ✅ Functional | Missing product details (name, image) storage |
| Add to Cart | ⚠️ Partial | Only stores productId, price, quantity |
| Cart Dropdown | ⚠️ Partial | Shows placeholders due to missing product data |
| Checkout Page | ⚠️ Partial | Fetches products again, needs optimization |
| Order Submission | ❌ Not Complete | Backend API integration pending |
| Payment Integration | ❌ Not Started | GCash, Card, COD options planned |

### Key Problem
**Cart items only store `{ productId, price, quantity }`** - missing product name, image, grower, and unit. This causes:
1. Cart dropdown shows "Product" and placeholder images
2. Checkout must re-fetch all product details
3. Poor user experience with flickering/loading states

---

## Current State Analysis

### 1. CartContext (`src/contexts/CartContext.tsx`)

**Current Interface:**
```typescript
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}
```

**Current addToCart Function:**
```typescript
const addToCart = (productId: string, price: number, quantity: number = 1) => {
  // Only stores productId, price, quantity
  // Missing: name, image, grower, unit, slug
};
```

### 2. Cart Dropdown (`src/components/layout/cart-dropdown.tsx`)

**Current Workaround (Lines 49-56):**
```typescript
const cartItemsWithDetails = (items || []).map((cartItem) => {
  return {
    ...cartItem,
    name: cartItem.name || "Product",      // ❌ Falls back to "Product"
    image: cartItem.image || "/placeholder.png", // ❌ Shows placeholder
    grower: cartItem.grower || "Unknown",  // ❌ Shows "Unknown"
    unit: cartItem.unit || "unit",
  };
});
```

### 3. Checkout Page (`src/app/(shop)/checkout/page.tsx`)

**Current Flow:**
1. Gets cart items (only has productId, price, quantity)
2. Re-fetches product details for each item (API calls)
3. Shows loading state while fetching
4. Displays products with full details

**Problem:** Multiple API calls, slow loading, potential data inconsistency

### 4. Add to Cart Locations

| Location | File | Current Implementation |
|----------|------|------------------------|
| Product Detail Page | `src/app/(shop)/product/[slug]/page.tsx` | `addToCart(product.id, product.price, quantity)` |
| Shop Page | `src/app/(shop)/shop/page.tsx` | `addToCart(product.id, product.price, 1)` |
| Product Card | `src/components/product/ProductCard.tsx` | Missing `addToCart` (UI only) |
| Wishlist Page | `src/app/(shop)/wishlist/page.tsx` | Missing `addToCart` |

---

## Gap Analysis

### Critical Gaps

| ID | Gap | Impact | Priority |
|----|-----|--------|----------|
| G1 | Cart doesn't store product details | Poor UX, extra API calls | 🔴 Critical |
| G2 | CartItem type missing fields | TypeScript errors, inconsistency | 🔴 Critical |
| G3 | No stock validation on add | Can add out-of-stock items | 🟠 High |
| G4 | No quantity limit enforcement | Can exceed available stock | 🟠 High |
| G5 | Order submission not connected | Can't complete purchase | 🔴 Critical |
| G6 | Payment integration missing | No actual payment | 🔴 Critical |
| G7 | Delivery method selection | Lalamove not integrated in checkout | 🟠 High |
| G8 | Guest checkout not supported | Must login to checkout | 🟡 Medium |

### Missing Features

| Feature | Status | Required For |
|---------|--------|--------------|
| Store product details in cart | ❌ Missing | Cart dropdown, checkout |
| Real-time stock check | ❌ Missing | Prevent overselling |
| Cart persistence for logged-in users | ❌ Missing | Cross-device cart |
| Promo code support | ❌ Missing | Discounts |
| Delivery address selection | ⚠️ Partial | Multi-address users |
| Same-day delivery (Lalamove) | ⚠️ Backend ready | Checkout selection |
| Order confirmation email | ❌ Missing | Post-purchase |
| Order history update | ❌ Missing | User account |

---

## Implementation Phases

### Phase 1: Enhanced Cart Context (3-4 hours) 🔴 CRITICAL

**Goal:** Store complete product details in cart

#### Tasks:
1. Update `CartItem` interface in `src/types/api.ts`
2. Update `CartContext` to accept and store product details
3. Update all `addToCart` calls to pass product details
4. Update localStorage structure

#### Updated CartItem Interface:
```typescript
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  // NEW: Product details for display
  name: string;
  image: string;
  slug: string;
  grower?: string;
  unit?: string;
  stock: number;          // For validation
  comparePrice?: number;  // For showing original price
}
```

#### Updated addToCart Function:
```typescript
const addToCart = (product: {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
  grower?: string;
  unit?: string;
  comparePrice?: number;
}, quantity: number = 1) => {
  // Validate stock
  if (product.stock < quantity) {
    toast.error("Not enough stock available");
    return false;
  }
  
  setItems((prev) => {
    const existingItem = prev.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Check if combined quantity exceeds stock
      if (existingItem.quantity + quantity > product.stock) {
        toast.error(`Only ${product.stock} items available`);
        return prev;
      }
      return prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    }
    
    return [...prev, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      stock: product.stock,
      grower: product.grower,
      unit: product.unit,
      comparePrice: product.comparePrice,
      quantity,
    }];
  });
  
  return true;
};
```

---

### Phase 2: Update All Add-to-Cart Calls (2-3 hours) 🔴 CRITICAL

**Goal:** Pass complete product data to addToCart

#### Files to Update:

1. **Product Detail Page** (`src/app/(shop)/product/[slug]/page.tsx`)
```typescript
// Before:
addToCart(product.id, product.price, quantity);

// After:
addToCart({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  slug: product.slug,
  stock: product.stock,
  grower: product.grower,
  unit: product.unit,
}, quantity);
```

2. **Shop Page** (`src/app/(shop)/shop/page.tsx`)
```typescript
// Before:
addToCart(product.id, product.price, 1);

// After:
addToCart({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.images?.[0] || product.image,
  slug: product.slug,
  stock: product.stock,
  grower: product.grower,
  unit: product.unit,
}, 1);
```

3. **Product Card** (`src/components/product/ProductCard.tsx`)
   - Add `useCart` hook
   - Pass product details to addToCart

4. **Wishlist Page** (`src/app/(shop)/wishlist/page.tsx`)
   - Add "Add to Cart" functionality for wishlist items

---

### Phase 3: Cart Dropdown Enhancement (1-2 hours) 🟠 HIGH

**Goal:** Display real product data, remove placeholders

#### Updates:
1. Remove fallback placeholders
2. Use actual product data from cart items
3. Add product link using slug
4. Show stock warnings if low stock
5. Add "Move to Wishlist" option

```typescript
// Updated cart display
{items.map((item) => (
  <div key={item.productId}>
    <Link href={`/product/${item.slug}`}>
      <Image src={item.image} alt={item.name} />
      <h4>{item.name}</h4>
    </Link>
    <p>Sold by: @{item.grower}</p>
    <p>₱{item.price.toFixed(2)} / {item.unit}</p>
    {item.stock < 10 && (
      <Badge variant="warning">Only {item.stock} left</Badge>
    )}
  </div>
))}
```

---

### Phase 4: Checkout Page Optimization (2-3 hours) 🟠 HIGH

**Goal:** Use cart data directly, add delivery options

#### Updates:
1. Remove product re-fetching (use cart data)
2. Add delivery method selection (Pickup vs Lalamove)
3. Add address management
4. Real-time price calculation with delivery
5. Promo code input (placeholder for now)

#### Checkout Flow:
```
Step 1: Review Cart
├── Display cart items (from CartContext)
├── Quantity adjustments
├── Remove items
└── Show subtotal

Step 2: Delivery Method
├── Pickup (Free - 2 locations)
├── Same-Day Delivery (Lalamove - ₱150-300)
└── Address input (if delivery)

Step 3: Contact Information
├── Name, Email, Phone
├── Pre-fill from user profile
└── Guest checkout option

Step 4: Payment Method
├── Cash on Delivery (COD)
├── GCash (redirect)
└── Credit/Debit Card (placeholder)

Step 5: Order Confirmation
├── Review order summary
├── Terms acceptance
└── Place Order button
```

---

### Phase 5: Order Submission & Backend Integration (3-4 hours) 🔴 CRITICAL

**Goal:** Submit orders to backend, process payments

#### API Endpoints Needed:
```typescript
// POST /api/v1/orders - Create new order
interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  deliveryMethod: 'pickup' | 'lalamove';
  deliveryAddress?: UserAddress;
  pickupLocation?: 'main' | 'bgc';
  paymentMethod: 'cod' | 'gcash' | 'card';
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  promoCode?: string;
}

interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed';
  total: number;
  paymentUrl?: string; // For GCash redirect
}
```

#### Order Flow:
```
1. User clicks "Place Order"
   ↓
2. Validate stock availability
   ↓
3. Create order in backend
   ↓
4. Handle payment
   ├── COD: Mark order as pending_payment
   ├── GCash: Redirect to payment page
   └── Card: Process via payment gateway
   ↓
5. On success:
   ├── Clear cart
   ├── Show success modal
   ├── Send confirmation email
   └── Redirect to order confirmation page
```

---

### Phase 6: Post-Purchase Features (2-3 hours) 🟡 MEDIUM

**Goal:** Order confirmation, tracking, history

#### Features:
1. **Order Confirmation Page** (`/order/[orderId]`)
   - Order details display
   - Delivery tracking (if Lalamove)
   - Print/Download receipt

2. **Order History** (`/profile/order-history`)
   - List all user orders
   - Filter by status
   - Reorder functionality

3. **Email Notifications**
   - Order confirmation email
   - Shipping update email
   - Delivery confirmation

---

## GitHub Project Tickets

### Epic: Complete Cart & Checkout System

Create these issues in your GitHub Project:

---

#### 🎫 Ticket #1: Enhanced CartItem Type
**Priority:** 🔴 Critical | **Estimate:** 1 hour | **Phase:** 1

**Title:** Update CartItem interface to include product details

**Description:**
Update the `CartItem` interface in `src/types/api.ts` to include product name, image, slug, stock, and other display fields.

**Acceptance Criteria:**
- [ ] CartItem includes: `name`, `image`, `slug`, `stock`, `grower`, `unit`
- [ ] TypeScript compiles without errors
- [ ] Existing cart data migration handled

**Labels:** `enhancement`, `cart`, `typescript`

---

#### 🎫 Ticket #2: Enhanced CartContext Provider
**Priority:** 🔴 Critical | **Estimate:** 2 hours | **Phase:** 1

**Title:** Update CartContext to store and manage complete product data

**Description:**
Modify CartContext to accept product object with all details, validate stock, and handle quantity limits.

**Acceptance Criteria:**
- [ ] `addToCart` accepts product object instead of individual params
- [ ] Stock validation before adding to cart
- [ ] Quantity limit enforcement based on available stock
- [ ] Toast notifications for validation errors
- [ ] localStorage schema updated

**Labels:** `enhancement`, `cart`, `context`

---

#### 🎫 Ticket #3: Update Product Detail Page Add-to-Cart
**Priority:** 🔴 Critical | **Estimate:** 1 hour | **Phase:** 2

**Title:** Pass complete product data in Product Detail addToCart

**Description:**
Update the product detail page (`src/app/(shop)/product/[slug]/page.tsx`) to pass complete product object to addToCart.

**Acceptance Criteria:**
- [ ] Product data includes: id, name, price, image, slug, stock, grower, unit
- [ ] Toast shows product name on add
- [ ] Stock validation works correctly

**Labels:** `enhancement`, `cart`, `product-page`

---

#### 🎫 Ticket #4: Update Shop Page Add-to-Cart
**Priority:** 🔴 Critical | **Estimate:** 1 hour | **Phase:** 2

**Title:** Pass complete product data in Shop Page addToCart

**Description:**
Update the shop catalog page (`src/app/(shop)/shop/page.tsx`) to pass complete product object to addToCart.

**Acceptance Criteria:**
- [ ] All add-to-cart buttons pass full product data
- [ ] Quick add works with proper validation
- [ ] Out-of-stock items can't be added

**Labels:** `enhancement`, `cart`, `shop-page`

---

#### 🎫 Ticket #5: Update ProductCard Component
**Priority:** 🟠 High | **Estimate:** 1 hour | **Phase:** 2

**Title:** Add full addToCart functionality to ProductCard

**Description:**
Update `ProductCard` component to use CartContext and pass complete product data.

**Acceptance Criteria:**
- [ ] ProductCard receives all required product props
- [ ] Add to cart button functional
- [ ] Stock validation integrated
- [ ] Loading state during add

**Labels:** `enhancement`, `cart`, `component`

---

#### 🎫 Ticket #6: Wishlist Add-to-Cart
**Priority:** 🟡 Medium | **Estimate:** 1 hour | **Phase:** 2

**Title:** Add "Add to Cart" functionality in Wishlist page

**Description:**
Enable adding wishlist items to cart with full product data.

**Acceptance Criteria:**
- [ ] "Add to Cart" button on each wishlist item
- [ ] "Add All to Cart" button works
- [ ] Remove from wishlist after adding (optional setting)
- [ ] Stock validation for each item

**Labels:** `enhancement`, `cart`, `wishlist`

---

#### 🎫 Ticket #7: Cart Dropdown Real Data Display
**Priority:** 🟠 High | **Estimate:** 1.5 hours | **Phase:** 3

**Title:** Display real product data in cart dropdown

**Description:**
Update cart dropdown to use actual product data from CartContext instead of placeholders.

**Acceptance Criteria:**
- [ ] Real product names displayed
- [ ] Actual product images shown
- [ ] Correct grower names
- [ ] Product links work with slug
- [ ] Low stock warnings shown
- [ ] No more placeholder fallbacks

**Labels:** `enhancement`, `cart`, `ui`

---

#### 🎫 Ticket #8: Cart Dropdown Quantity Controls
**Priority:** 🟠 High | **Estimate:** 1 hour | **Phase:** 3

**Title:** Improve quantity controls with stock validation

**Description:**
Enhance quantity +/- controls to respect stock limits and provide feedback.

**Acceptance Criteria:**
- [ ] Can't increase beyond available stock
- [ ] Can't decrease below 1
- [ ] Show max available when hitting limit
- [ ] Disabled state styling

**Labels:** `enhancement`, `cart`, `ui`

---

#### 🎫 Ticket #9: Checkout - Use Cart Data Directly
**Priority:** 🟠 High | **Estimate:** 2 hours | **Phase:** 4

**Title:** Optimize checkout to use CartContext data directly

**Description:**
Remove product re-fetching in checkout, use cart data that already includes product details.

**Acceptance Criteria:**
- [ ] No additional API calls for product data
- [ ] Cart items display immediately
- [ ] Remove loading state for products
- [ ] Price calculations use cart data

**Labels:** `enhancement`, `checkout`, `performance`

---

#### 🎫 Ticket #10: Checkout - Delivery Method Selection
**Priority:** 🟠 High | **Estimate:** 2 hours | **Phase:** 4

**Title:** Add delivery method selection in checkout

**Description:**
Add step for selecting delivery method: Pickup (free) or Same-Day Delivery (Lalamove).

**Acceptance Criteria:**
- [ ] Pickup option with location selection
- [ ] Lalamove option with address input
- [ ] Price updates based on selection
- [ ] Lalamove quote displayed

**Labels:** `enhancement`, `checkout`, `delivery`

---

#### 🎫 Ticket #11: Checkout - Address Management
**Priority:** 🟠 High | **Estimate:** 2 hours | **Phase:** 4

**Title:** Add address selection/input for delivery

**Description:**
Allow users to select saved addresses or enter new delivery address.

**Acceptance Criteria:**
- [ ] List saved addresses for logged-in users
- [ ] Add new address form
- [ ] Address validation
- [ ] Default address pre-selection

**Labels:** `enhancement`, `checkout`, `address`

---

#### 🎫 Ticket #12: Order Creation API Integration
**Priority:** 🔴 Critical | **Estimate:** 3 hours | **Phase:** 5

**Title:** Connect checkout to order creation API

**Description:**
Implement order submission to backend API with all required data.

**Acceptance Criteria:**
- [ ] Order payload includes all items and details
- [ ] Backend validates stock before creating order
- [ ] Order ID/number returned
- [ ] Cart cleared on success
- [ ] Error handling for failed orders

**Labels:** `enhancement`, `checkout`, `api`

---

#### 🎫 Ticket #13: Payment Method Integration
**Priority:** 🔴 Critical | **Estimate:** 3 hours | **Phase:** 5

**Title:** Implement payment method handling

**Description:**
Handle different payment methods: COD, GCash, Credit Card.

**Acceptance Criteria:**
- [ ] COD: Order marked as pending_payment
- [ ] GCash: Redirect to GCash payment page
- [ ] Card: Payment form (placeholder for now)
- [ ] Payment status callback handling

**Labels:** `enhancement`, `checkout`, `payment`

---

#### 🎫 Ticket #14: Order Confirmation Page
**Priority:** 🟡 Medium | **Estimate:** 2 hours | **Phase:** 6

**Title:** Create order confirmation page

**Description:**
Create `/order/[orderId]` page to display order details after successful purchase.

**Acceptance Criteria:**
- [ ] Display order summary
- [ ] Show order number
- [ ] Delivery tracking (if applicable)
- [ ] Print/download receipt option
- [ ] Link to order history

**Labels:** `enhancement`, `order`, `page`

---

#### 🎫 Ticket #15: Order Success Modal
**Priority:** 🟡 Medium | **Estimate:** 1 hour | **Phase:** 6

**Title:** Improve order success modal

**Description:**
Enhance the success modal with order details and next steps.

**Acceptance Criteria:**
- [ ] Shows order number
- [ ] Estimated delivery/pickup time
- [ ] "View Order" button
- [ ] "Continue Shopping" button
- [ ] Celebratory animation

**Labels:** `enhancement`, `checkout`, `ui`

---

### Ticket Dependencies

```
Phase 1:
  #1 CartItem Type
    ↓
  #2 CartContext Provider
    ↓
Phase 2:
  ├── #3 Product Detail Page
  ├── #4 Shop Page  
  ├── #5 ProductCard
  └── #6 Wishlist Page
    ↓
Phase 3:
  ├── #7 Cart Dropdown Display
  └── #8 Quantity Controls
    ↓
Phase 4:
  ├── #9 Checkout Data
  ├── #10 Delivery Method
  └── #11 Address Management
    ↓
Phase 5:
  ├── #12 Order Creation API
  └── #13 Payment Integration
    ↓
Phase 6:
  ├── #14 Confirmation Page
  └── #15 Success Modal
```

---

## Technical Specifications

### Updated Type Definitions

```typescript
// src/types/api.ts

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  // Product details for display
  name: string;
  image: string;
  slug: string;
  stock: number;
  grower?: string;
  unit?: string;
  comparePrice?: number;
}

export interface CartContextType {
  items: CartItem[];
  summary: OrderSummary;
  loading: boolean;
  error: string | null;
  addToCart: (product: AddToCartProduct, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
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

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}

export interface DeliveryOption {
  type: 'pickup' | 'lalamove';
  location?: string;        // For pickup
  address?: UserAddress;    // For delivery
  estimatedCost: number;
  estimatedTime: string;    // "30-45 minutes" or "Ready in 2 hours"
}

export interface CheckoutData {
  items: CartItem[];
  delivery: DeliveryOption;
  payment: {
    method: 'cod' | 'gcash' | 'card';
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  promoCode?: string;
  notes?: string;
}
```

### localStorage Schema

```typescript
// Cart storage
interface CartStorage {
  version: 2;  // Increment when schema changes
  items: CartItem[];
  updatedAt: string;
}

// Migration from v1
const migrateCart = (oldCart: any): CartStorage => {
  if (oldCart.version === 2) return oldCart;
  
  // v1 had only { productId, price, quantity }
  // v2 needs full product details
  // Clear old cart and start fresh
  return {
    version: 2,
    items: [],
    updatedAt: new Date().toISOString(),
  };
};
```

---

## Testing Checklist

### Unit Tests

- [ ] CartContext addToCart with valid product
- [ ] CartContext addToCart with out-of-stock product
- [ ] CartContext updateQuantity within limits
- [ ] CartContext updateQuantity exceeding stock
- [ ] CartContext removeFromCart
- [ ] CartContext clearCart
- [ ] Order summary calculation

### Integration Tests

- [ ] Add to cart from Product Detail page
- [ ] Add to cart from Shop page
- [ ] Add to cart from ProductCard
- [ ] Cart dropdown displays items correctly
- [ ] Quantity controls respect stock
- [ ] Checkout flow end-to-end
- [ ] Order submission success
- [ ] Order submission with payment

### E2E Tests

- [ ] Full user journey: Browse → Add to Cart → Checkout → Order
- [ ] Guest checkout flow
- [ ] Logged-in user with saved address
- [ ] Lalamove delivery selection
- [ ] Pickup location selection
- [ ] Payment method selection
- [ ] Order confirmation display

---

## Success Criteria

### Phase 1-2 Complete:
- [ ] Cart stores complete product details
- [ ] All add-to-cart buttons work correctly
- [ ] Stock validation prevents over-ordering
- [ ] Toast notifications inform users

### Phase 3 Complete:
- [ ] Cart dropdown shows real product data
- [ ] No more placeholders or "Unknown"
- [ ] Quantity controls work with limits

### Phase 4 Complete:
- [ ] Checkout uses cart data (no re-fetch)
- [ ] Delivery options selectable
- [ ] Address management works
- [ ] Price updates in real-time

### Phase 5-6 Complete:
- [ ] Orders submitted to backend
- [ ] Payment methods functional
- [ ] Order confirmation page works
- [ ] Email notifications sent

### Overall Success:
- [ ] User can complete purchase end-to-end
- [ ] No data fetching errors
- [ ] Fast, responsive experience
- [ ] Works on mobile and desktop

---

## Quick Start Commands

```bash
# Start development
npm run dev

# Run tests (when implemented)
npm run test

# Check for TypeScript errors
npx tsc --noEmit

# Lint check
npm run lint
```

---

## Related Documents

- `.github/LALAMOVE_INTEGRATION_COMPLETE.md` - Delivery integration
- `.github/VERCEL_DEPLOYMENT_PLAN.md` - Deployment guide
- `docs/BACKEND_API_CONNECTION_GUIDE.md` - API reference
- `.github/copilot-instructions.md` - Project conventions

---

**Next Steps:**
1. Create GitHub issues from tickets above
2. Start with Phase 1 (CartItem type + CartContext)
3. Update all addToCart calls (Phase 2)
4. Test cart functionality
5. Proceed to checkout enhancements
