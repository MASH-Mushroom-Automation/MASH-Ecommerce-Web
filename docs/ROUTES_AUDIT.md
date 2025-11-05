# MASH Market - Route Audit & Hierarchy

**Last Updated:** November 6, 2025  
**Status:** ✅ Complete Audit

---

## 🚨 CRITICAL ISSUES FOUND

### Routes in Footer/Header That DON'T EXIST:
1. ❌ `/stores` - **Referenced in footer** but NO PAGE EXISTS
2. ❌ `/sell-with-us` - **Referenced in footer** but NO PAGE EXISTS (use `/start-selling` instead)

### Recommended Actions:
- Remove `/stores` link or create the page
- Replace `/sell-with-us` with `/start-selling`

---

## 📊 Complete Route Hierarchy

### 🏠 PUBLIC ROUTES (No Authentication Required)

#### **Main Pages**
| Route | Status | Purpose | Navigation |
|-------|--------|---------|------------|
| `/` | ✅ EXISTS | Homepage | Header Logo |
| `/catalog` | ✅ EXISTS | Product catalog/shop | Header, Footer |
| `/product/[id]` | ✅ EXISTS | Individual product details | Dynamic |
| `/grower` | ✅ EXISTS | Grower listings | Header, Footer |
| `/grower/[id]` | ✅ EXISTS | Individual grower profile | Dynamic |
| `/wishlist` | ✅ EXISTS | User wishlist | Header, Mobile Nav |
| `/checkout` | ✅ EXISTS | Shopping cart & checkout | Mobile Nav |

#### **Information Pages**
| Route | Status | Purpose | Navigation |
|-------|--------|---------|------------|
| `/about` | ✅ EXISTS | About MASH | Footer |
| `/contact` | ✅ EXISTS | Contact form | Header, Footer |
| `/faq` | ✅ EXISTS | Frequently Asked Questions | Header, Footer |
| `/blog` | ✅ EXISTS | Blog posts | Header |

#### **Legal & Policy Pages**
| Route | Status | Purpose | Navigation |
|-------|--------|---------|------------|
| `/shipping-info` | ✅ EXISTS | Shipping information | Footer |
| `/returns-policy` | ✅ EXISTS | Return policy | Footer |
| `/privacy` | ✅ EXISTS | Privacy policy | Footer |
| `/terms` | ✅ EXISTS | Terms of service | Footer |

---

### 🔐 AUTHENTICATION ROUTES (Group: auth)

| Route | Status | Purpose |
|-------|--------|---------|
| `/login` | ✅ EXISTS | User login |
| `/signup` | ✅ EXISTS | User registration |
| `/forgot-password` | ✅ EXISTS | Password recovery |
| `/reset-password` | ✅ EXISTS | Reset password form |
| `/reset-success` | ✅ EXISTS | Password reset confirmation |
| `/verify-otp` | ✅ EXISTS | OTP verification |
| `/welcome` | ✅ EXISTS | Welcome screen |

---

### 👤 USER ROUTES (Group: user - Protected)

#### **Profile Management**
| Route | Status | Purpose | Navigation |
|-------|--------|---------|------------|
| `/profile` | ✅ EXISTS | Profile dashboard | Mobile Nav |
| `/profile/my-information` | ✅ EXISTS | User information & settings | Mobile Nav |
| `/profile/order-history` | ✅ EXISTS | Order tracking | Profile Sidebar |

#### **User Onboarding**
| Route | Status | Purpose |
|-------|--------|---------|
| `/onboarding/interests` | ✅ EXISTS | Select mushroom interests |
| `/onboarding/cooking` | ✅ EXISTS | Cooking preferences |
| `/onboarding/complete` | ✅ EXISTS | Onboarding completion |

---

### 🏪 SELLER ROUTES (Group: seller - Protected)

#### **Seller Dashboard**
| Route | Status | Purpose | Navigation |
|-------|--------|---------|------------|
| `/seller/dashboard` | ✅ EXISTS | Main seller dashboard | Header, Mobile Nav |
| `/seller` | ✅ EXISTS | Seller home/overview | - |
| `/start-selling` | ✅ EXISTS | Become a seller | Header |

#### **Product Management**
| Route | Status | Purpose |
|-------|--------|---------|
| `/seller/products` | ✅ EXISTS | Product inventory list |
| `/seller/products/new` | ✅ EXISTS | Add new product |
| `/seller/products/edit/[id]` | ✅ EXISTS | Edit product |

#### **Order Management**
| Route | Status | Purpose |
|-------|--------|---------|
| `/seller/orders` | ✅ EXISTS | Order list |
| `/seller/orders/[id]` | ✅ EXISTS | Order details |
| `/seller/handover` | ✅ EXISTS | Product handover management |

#### **Seller Operations**
| Route | Status | Purpose |
|-------|--------|---------|
| `/seller/shipping` | ✅ EXISTS | Shipping settings |
| `/seller/address` | ✅ EXISTS | Business address |
| `/seller/refund` | ✅ EXISTS | Refund management |
| `/seller/settings` | ✅ EXISTS | Seller settings |
| `/seller/notifications` | ✅ EXISTS | Notifications |

---

### 🔧 API ROUTES

| Route | Purpose |
|-------|---------|
| `/api/*` | Backend API endpoints |

---

## 📈 Route Importance Matrix

### TIER 1: Critical (Must Work)
- `/` - Homepage
- `/catalog` - Product browsing
- `/product/[id]` - Product details
- `/checkout` - Purchase flow
- `/login` - Authentication
- `/signup` - User registration

### TIER 2: High Priority (Core Features)
- `/grower` - Grower discovery
- `/grower/[id]` - Grower profiles
- `/wishlist` - Shopping list
- `/profile` - User account
- `/seller/dashboard` - Seller management
- `/seller/orders` - Order fulfillment

### TIER 3: Medium Priority (Supporting Features)
- `/faq` - Customer support
- `/contact` - Communication
- `/about` - Brand information
- `/start-selling` - Seller onboarding
- `/seller/products` - Inventory management

### TIER 4: Standard (Legal & Info)
- `/blog` - Content marketing
- `/privacy` - Legal compliance
- `/terms` - Legal compliance
- `/shipping-info` - Policy information
- `/returns-policy` - Policy information

---

## 🎯 Recommendations

### 1. Fix Broken Links (IMMEDIATE)
```typescript
// Footer.tsx - Remove or fix these:
- /stores → REMOVE (doesn't exist) OR create page
- /sell-with-us → CHANGE TO /start-selling
```

### 2. Route Naming Improvements (SUGGESTED)

#### Better Semantic Routes:
```
CURRENT                  → SUGGESTED
/catalog                 → /shop or /products
/grower                  → /growers (plural)
/start-selling           → /become-seller or /sell
/seller/dashboard        → /seller (simplify)
```

### 3. Route Consolidation
- Consider merging `/product/page.tsx` with `/product/[id]/page.tsx`
- Evaluate if `/seller/page.tsx` and `/seller/dashboard/page.tsx` should be merged

### 4. Missing Useful Routes (Consider Adding)
- `/search` - Dedicated search results page
- `/stores` - Store locator (if planned)
- `/recipes` - Mushroom recipes (content marketing)
- `/sustainability` - Sustainability practices
- `/help` - Help center

---

## 🔍 Route Structure Summary

```
Total Routes: 42 pages
├── Public: 12 routes
├── Auth: 7 routes
├── User: 6 routes
├── Seller: 15 routes
└── API: Multiple endpoints

Route Groups:
- (auth) → Authentication flow
- (shop) → Shopping experience
- (user) → User account management
- (seller) → Seller operations
```

---

## ✅ Action Items

- [ ] **CRITICAL**: Remove `/stores` from footer or create the page
- [ ] **CRITICAL**: Change footer link from `/sell-with-us` to `/start-selling`
- [ ] Consider renaming `/catalog` to `/shop` or `/products` for better UX
- [ ] Consider renaming `/grower` to `/growers` (plural)
- [ ] Add breadcrumb navigation for better hierarchy understanding
- [ ] Implement proper 404 page for non-existent routes
- [ ] Add sitemap.xml generation for SEO

---

## 📝 Notes

- All route groups use Next.js 13+ App Router conventions
- Dynamic routes use `[id]` or `[slug]` parameters
- Protected routes require authentication middleware
- SEO and metadata should be implemented per route
