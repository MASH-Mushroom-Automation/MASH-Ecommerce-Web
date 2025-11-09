# Nature Theme UI Update Task List

## 📋 Project Overview
This document tracks all UI components and pages that need to be updated to use the Nature theme's semantic color tokens. The goal is to replace all hardcoded colors (`#1E392A`, `#6A994E`, `#A7C957`, `bg-white`, `text-gray-*`, etc.) with semantic tokens for automatic light/dark mode support.

## ✅ Completed Updates

### Layout Components
- [x] **Header** (`src/components/layout/header.tsx`) - Navigation, top bar, wishlist, user profile
- [x] **Footer** (`src/components/layout/footer.tsx`) - All sections, links, social media
- [x] **Landing Page** (`src/app/page.tsx`) - All sections and components

### Product Components
- [x] **ProductCard** (`src/components/product/ProductCard.tsx`) - Cards, badges, buttons

### Theme System
- [x] **Theme Configuration** (`src/lib/themes.ts`) - Nature theme only
- [x] **Global Styles** (`src/app/globals.css`) - Complete Nature theme
- [x] **Theme Switcher** (`src/components/ui/theme-switcher.tsx`) - Light/dark toggle

---

## 🔲 Pending Updates

### 🎨 CMS Components (High Priority)
**Location**: `src/components/cms/`

- [ ] **AboutSection.tsx** (23 hardcoded colors)
  - Update background colors, text colors, borders
  - Replace gradient colors with semantic tokens
  
- [ ] **ContactSection.tsx** (11 hardcoded colors)
  - Form inputs, buttons, text colors
  - Contact card backgrounds
  
- [ ] **FAQSection.tsx** (3 hardcoded colors)
  - Accordion styling, borders
  
- [ ] **FeatureSection.tsx** (needs review)
  - Feature cards, icons, backgrounds
  
- [ ] **HeroSection.tsx** (3 hardcoded colors)
  - Hero backgrounds, CTA buttons, text overlays

---

### 🛒 Shop Pages (High Priority)
**Location**: `src/app/(shop)/`

- [ ] **Shop Page** (`shop/page.tsx`) (5 hardcoded colors, 31 gray classes)
  - Product grid, filters, sorting
  - Background and text colors
  
- [ ] **Product Detail Page** (`product/[id]/page.tsx`) (3 hardcoded colors, 18 gray classes)
  - Product images, details, reviews
  - Add to cart section, pricing
  
- [ ] **Checkout Page** (`checkout/page.tsx`) (14 hardcoded colors, 53 gray classes)
  - Order summary, payment forms
  - Shipping information, totals
  
- [ ] **Wishlist Page** (`wishlist/page.tsx`) (7 gray classes)
  - Wishlist items, empty state
  - Action buttons

---

### 👤 User Profile Pages (High Priority)
**Location**: `src/app/(user)/profile/`

- [ ] **Profile Layout** (`layout.tsx`) (5 hardcoded colors)
  - Sidebar navigation
  - Profile header
  
- [ ] **My Information** (`my-information/page.tsx`) (10 hardcoded colors, 22 gray classes)
  - Profile form, avatar upload
  - Personal details sections
  
- [ ] **Order History** (`order-history/page.tsx`) (12 hardcoded colors, 18 gray classes)
  - Order cards, status badges
  - Order details, tracking

---

### 🔐 Authentication Pages (Medium Priority)
**Location**: `src/app/(auth)/`

- [ ] **Login Page** (`login/page.tsx`) (6 hardcoded colors, 9 gray classes)
  - Login form, social login buttons
  - Background, card styling
  
- [ ] **Signup Page** (`signup/page.tsx`) (6 hardcoded colors, 14 gray classes)
  - Registration form, validation
  - Terms and conditions
  
- [ ] **Forgot Password** (`forgot-password/page.tsx`) (3 hardcoded colors)
  - Password reset form
  
- [ ] **Reset Password** (`reset-password/page.tsx`) (2 hardcoded colors, 5 gray classes)
  - New password form
  
- [ ] **Verify OTP** (`verify-otp/page.tsx`) (4 hardcoded colors)
  - OTP input fields
  
- [ ] **Welcome Page** (`welcome/page.tsx`) (5 hardcoded colors)
  - Welcome message, onboarding CTA
  
- [ ] **Reset Success** (`reset-success/page.tsx`) (2 hardcoded colors)
  - Success message

---

### 🌱 Grower Pages (Medium Priority)
**Location**: `src/app/grower/`

- [ ] **Growers List** (`page.tsx`) (9 hardcoded colors, 32 gray classes)
  - Grower cards, filters
  - Featured growers section
  
- [ ] **Grower Profile** (`[id]/page.tsx`) (18 gray classes)
  - Grower details, products
  - About section, contact info

---

### 🏪 Seller Dashboard (Medium Priority)
**Location**: `src/app/(seller)/seller/`

- [ ] **Dashboard** (`dashboard/page.tsx`) (6 hardcoded colors, 6 gray classes)
  - Stats cards, charts
  - Recent orders, notifications
  
- [ ] **Products Management** (`products/page.tsx`) (2 hardcoded colors, 19 gray classes)
  - Product list, actions
  - Stock status indicators
  
- [ ] **Add/Edit Product** (`products/new/page.tsx`, `products/edit/[id]/page.tsx`) (2 hardcoded colors, 7 gray classes each)
  - Product forms, image upload
  - Category selection, pricing
  
- [ ] **Orders** (`orders/page.tsx`) (15 gray classes)
  - Order list, filters
  - Status management
  
- [ ] **Order Details** (`orders/[id]/page.tsx`) (27 gray classes)
  - Order information, timeline
  - Customer details, shipping
  
- [ ] **Inventory** (`inventory/page.tsx`) (3 hardcoded colors, 15 gray classes)
  - Stock management, alerts
  - Low stock warnings
  
- [ ] **Shipping Settings** (`shipping/page.tsx`) (4 hardcoded colors, 16 gray classes)
  - Shipping zones, rates
  - Delivery options
  
- [ ] **Handover** (`handover/page.tsx`) (4 hardcoded colors, 15 gray classes)
  - Order handover management
  - Pickup scheduling
  
- [ ] **Notifications** (`notifications/page.tsx`) (8 hardcoded colors, 19 gray classes)
  - Notification list, filters
  - Read/unread states
  
- [ ] **Settings** (`settings/page.tsx`) (5 hardcoded colors, 22 gray classes)
  - Store settings, profile
  - Business information
  
- [ ] **Address Management** (`address/page.tsx`) (6 hardcoded colors, 5 gray classes)
  - Address forms, map picker
  - Multiple addresses
  
- [ ] **Refunds** (`refund/page.tsx`) (13 gray classes)
  - Refund requests, processing
  - Refund history

---

### 🎯 Seller Onboarding (Medium Priority)
**Location**: `src/app/(seller)/`

- [ ] **Start Selling Page** (`start-selling/page.tsx`)
  - Landing page for sellers
  
- [ ] **Hero Section** (`start-selling/components/HeroSection.tsx`) (22 hardcoded colors, 22 gray classes)
  - Hero banner, CTA buttons
  
- [ ] **Application Form** (`start-selling/components/ApplicationForm.tsx`) (3 hardcoded colors, 9 gray classes)
  - Seller application form
  - Document uploads
  
- [ ] **Success Modal** (`start-selling/components/SuccessModal.tsx`) (7 gray classes)
  - Application submitted confirmation

---

### 👥 User Onboarding (Low Priority)
**Location**: `src/app/(user)/onboarding/`

- [ ] **Interests** (`interests/page.tsx`) (6 hardcoded colors, 10 gray classes)
  - Interest selection, categories
  
- [ ] **Cooking Preferences** (`cooking/page.tsx`) (7 hardcoded colors, 7 gray classes)
  - Cooking skill level, preferences
  
- [ ] **Complete** (`complete/page.tsx`) (5 hardcoded colors)
  - Onboarding completion

---

### 📄 Static/Info Pages (Low Priority)
**Location**: `src/app/`

- [ ] **About** (`about/page.tsx`)
  - Company information, mission
  
- [ ] **Contact** (`contact/page.tsx`)
  - Contact form, information
  
- [ ] **FAQ** (`faq/page.tsx`)
  - Frequently asked questions
  
- [ ] **Blog** (`blog/page.tsx`)
  - Blog listing (if implemented)
  
- [ ] **Privacy Policy** (`privacy/page.tsx`) (11 hardcoded colors, 13 gray classes)
  - Privacy policy content
  
- [ ] **Terms of Service** (`terms/page.tsx`) (15 hardcoded colors, 18 gray classes)
  - Terms and conditions
  
- [ ] **Shipping Info** (`shipping-info/page.tsx`) (15 hardcoded colors, 30 gray classes)
  - Shipping policies, rates
  
- [ ] **Returns Policy** (`returns-policy/page.tsx`) (14 hardcoded colors, 22 gray classes)
  - Return and refund policies

---

### 🧩 Shared Components (Medium Priority)
**Location**: `src/components/`

#### Layout Components
- [ ] **Cart Dropdown** (`layout/cart-dropdown.tsx`) (8 hardcoded colors, 18 gray classes)
  - Cart items, totals
  - Checkout button
  
- [ ] **Mobile Bottom Nav** (`layout/mobile-bottom-nav.tsx`)
  - Mobile navigation icons
  
- [ ] **Notification Dropdown** (`layout/notification-dropdown.tsx`) (6 hardcoded colors, 14 gray classes)
  - Notification list, badges
  
- [ ] **Seller Header** (`layout/seller-header.tsx`)
  - Seller-specific header
  
- [ ] **Simple Header** (`layout/simple-header.tsx`)
  - Minimal header for auth pages
  
- [ ] **Auth Layout** (`layout/auth-layout.tsx`)
  - Authentication page wrapper

#### Catalog Components
- [ ] **Filter Sidebar** (`catalog/FilterSidebar.tsx`) (12 gray classes)
  - Product filters, categories
  - Price range, sorting

#### Common Components
- [ ] **Breadcrumbs** (`common/breadcrumbs.tsx`) (4 hardcoded colors, 8 gray classes)
  - Navigation breadcrumbs
  
- [ ] **Error Boundary** (`common/error-boundary.tsx`) (3 hardcoded colors, 12 gray classes)
  - Error display, retry button
  
- [ ] **Loading States** (`common/loading-states.tsx`) (54 gray classes)
  - Skeleton loaders, spinners

#### UI Components
- [ ] **Button** (`ui/button.tsx`) (7 hardcoded colors)
  - Button variants, states
  
- [ ] **Map Picker** (`ui/map-picker.tsx`) (4 hardcoded colors, 15 gray classes)
  - Location selection map
  
- [ ] **Google Maps Picker** (`ui/google-maps-picker.tsx`) (4 hardcoded colors, 6 gray classes)
  - Google Maps integration
  
- [ ] **Skeleton Loaders** (`ui/skeleton-loaders.tsx`) (7 gray classes)
  - Custom skeleton components

---

### 🔧 Utility Files (Low Priority)
**Location**: `src/lib/`

- [ ] **colors.ts** (3 hardcoded colors)
  - Color utility functions
  - May need refactoring for semantic tokens

---

### 🚨 Error & Loading Pages (Low Priority)
**Location**: `src/app/`

- [ ] **Not Found** (`not-found.tsx`) (6 hardcoded colors, 11 gray classes)
  - 404 error page
  
- [ ] **Shop Error** (`(shop)/error.tsx`) (2 hardcoded colors)
  - Shop section error boundary
  
- [ ] **Shop Loading** (`(shop)/loading.tsx`) (2 hardcoded colors)
  - Shop section loading state
  
- [ ] **User Error** (`(user)/error.tsx`) (2 hardcoded colors)
  - User section error boundary

---

## 🎨 Color Replacement Guide

### Hardcoded Colors to Replace:
```
#1E392A → primary (dark forest green)
#6A994E → primary (forest green)
#A7C957 → accent (light green)
#333333 → card or muted
```

### Gray Classes to Replace:
```
bg-white          → bg-background
bg-gray-50        → bg-muted/30 or bg-secondary
bg-gray-100       → bg-muted
bg-gray-900       → bg-card (dark mode)

text-gray-900     → text-foreground
text-gray-600     → text-muted-foreground
text-gray-500     → text-muted-foreground
text-gray-400     → text-muted-foreground (lighter)

border-gray-100   → border-border
border-gray-200   → border-border
border-gray-300   → border-border
border-gray-700   → border-border (dark mode)
```

### Semantic Tokens Available:
```css
--background         /* Main background */
--foreground         /* Main text */
--card               /* Card backgrounds */
--card-foreground    /* Card text */
--primary            /* Brand color */
--primary-foreground /* Text on primary */
--secondary          /* Secondary backgrounds */
--secondary-foreground /* Secondary text */
--muted              /* Muted backgrounds */
--muted-foreground   /* Muted text */
--accent             /* Accent highlights */
--accent-foreground  /* Accent text */
--destructive        /* Error/danger color */
--border             /* Border color */
--input              /* Input borders */
--ring               /* Focus rings */
```

---

## 📊 Progress Summary

### By Priority:
- **High Priority**: 15 items (CMS, Shop, User Profile)
- **Medium Priority**: 28 items (Auth, Grower, Seller, Shared Components)
- **Low Priority**: 17 items (Onboarding, Static Pages, Utilities, Error Pages)

### By Category:
- **Pages**: 45 total
- **Components**: 15+ shared components
- **Layouts**: 3 layout components

### Total Items: 60+ files to update

---

## ✅ Testing Checklist (Per Component)

For each updated component, verify:
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Hover states work properly
- [ ] Focus states are visible
- [ ] Buttons have correct styling
- [ ] Text is readable (contrast)
- [ ] Borders are visible
- [ ] No hardcoded colors remain
- [ ] Responsive design maintained

---

## 📝 Notes for Developers

1. **Search Pattern**: Use regex `#1E392A|#6A994E|#A7C957|bg-\[#|text-\[#|bg-white|bg-gray-|text-gray-|border-gray-` to find hardcoded colors
2. **Test Both Modes**: Always test in both light and dark mode after changes
3. **Preserve Functionality**: Don't change component logic, only styling
4. **Use Existing Patterns**: Follow the patterns established in completed components
5. **Document Changes**: Note any special cases or decisions made
6. **Batch Similar Items**: Update similar pages together for consistency

---

**Last Updated**: November 9, 2025  
**Status**: 4/60+ items completed (7%)  
**Next Priority**: CMS Components → Shop Pages → User Profile
