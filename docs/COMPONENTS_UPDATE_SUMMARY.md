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

### CMS Components
- [x] **AboutSection** (`src/components/cms/AboutSection.tsx`) - All sections, team cards, mentor
- [x] **ContactSection** (`src/components/cms/ContactSection.tsx`) - Form, buttons, cards
- [x] **FAQSection** (`src/components/cms/FAQSection.tsx`) - Accordion, categories
- [x] **FeatureSection** (`src/components/cms/FeatureSection.tsx`) - Feature cards, icons
- [x] **HeroSection** (`src/components/cms/HeroSection.tsx`) - Hero buttons, overlays

### Static Pages
- [x] **About Page** (`src/app/about/page.tsx`) - Uses updated CMSAboutSection
- [x] **Contact Page** (`src/app/contact/page.tsx`) - Loading states
- [x] **FAQ Page** (`src/app/faq/page.tsx`) - Uses updated CMSFAQSection

### Theme System
- [x] **Theme Configuration** (`src/lib/themes.ts`) - Nature theme only
- [x] **Global Styles** (`src/app/globals.css`) - Complete Nature theme
- [x] **Theme Switcher** (`src/components/ui/theme-switcher.tsx`) - Light/dark toggle

---

## 🔲 Pending Updates

---

### 🛒 Shop Pages (High Priority)
**Location**: `src/app/(shop)/`

- [x] **Shop Page** (`shop/page.tsx`) - Filters, sorting, product grid/list views
  
- [x] **Product Detail Page** (`product/[id]/page.tsx`) - Product images, pricing, add to cart
- [x] **Checkout Page** (`checkout/page.tsx`) - Forms, payment methods, order summary
- [x] **Wishlist Page** (`wishlist/page.tsx`) - Wishlist items, empty state

---

### 👤 User Profile Pages (High Priority)
**Location**: `src/app/(user)/profile/`

- [x] **Profile Layout** (`layout.tsx`) - Sidebar navigation, logout button
- [x] **My Information** (`my-information/page.tsx`) - Profile form, avatar upload, address
- [x] **Order History** (`order-history/page.tsx`) - Order cards, tabs, status badges

---

### 🔐 Authentication Pages (Medium Priority)
**Location**: `src/app/(auth)/`

- [x] **Login Page** (`login/page.tsx`) - Form, alerts, dividers
- [x] **Signup Page** (`signup/page.tsx`) - Registration form, terms and conditions
- [x] **Forgot Password** (`forgot-password/page.tsx`) - Email input, OTP request
- [x] **Reset Password** (`reset-password/page.tsx`) - Password reset form
- [x] **Verify OTP** (`verify-otp/page.tsx`) - OTP input fields, resend code
- [x] **Welcome Page** (`welcome/page.tsx`) - Welcome message, onboarding CTA
- [x] **Reset Success** (`reset-success/page.tsx`) - Success message, auto-redirect

---

### 🌱 Grower Pages (Medium Priority)
**Location**: `src/app/grower/`

- [x] **Growers List** (`page.tsx`) - Grower cards, filters, search, region filter, near me map
- [x] **Grower Profile** (`[id]/page.tsx`) - Grower header, story, products, contact info, map

---

### 🏪 Seller Dashboard (Medium Priority)
**Location**: `src/app/(seller)/seller/`

- [x] **Dashboard** (`dashboard/page.tsx`) - Stats cards, charts, recent orders
- [x] **Products Management** (`products/page.tsx`) - Product list, search, filters, status badges
- [x] **Add Product** (`products/new/page.tsx`) - Product form, image upload
- [x] **Edit Product** (`products/edit/[id]/page.tsx`) - Edit form, image management
  
- [x] **Orders** (`orders/page.tsx`) - Order list, filters, status management
- [x] **Order Details** (`orders/[id]/page.tsx`) - Order information, timeline, customer details
- [x] **Inventory** (`inventory/page.tsx`) - Stock management, alerts, low stock warnings
- [x] **Shipping Settings** (`shipping/page.tsx`) - Shipping zones, rates, delivery options
- [x] **Handover** (`handover/page.tsx`) - Order handover management, pickup scheduling
- [x] **Notifications** (`notifications/page.tsx`) - Notification list, filters, read/unread states
- [x] **Settings** (`settings/page.tsx`) - Store settings, profile, business information
- [x] **Address Management** (`address/page.tsx`) - Address forms, map picker, multiple addresses
- [x] **Refunds** (`refund/page.tsx`) - Refund requests, processing, refund history

---

### 🎯 Seller Onboarding (Medium Priority)
**Location**: `src/app/(seller)/`

- [x] **Start Selling Page** (`start-selling/page.tsx`)
  - Landing page for sellers
  
- [x] **Hero Section** (`start-selling/components/HeroSection.tsx`) 
  - Hero banner, CTA buttons
  
- [x] **Application Form** (`start-selling/components/ApplicationForm.tsx`) 
  - Seller application form
  - Document uploads
  
- [x] **Success Modal** (`start-selling/components/SuccessModal.tsx`) 
  - Application submitted confirmation

---

### 👥 User Onboarding (Low Priority)
**Location**: `src/app/(user)/onboarding/`

- [x] **Interests** (`interests/page.tsx`) - Interest selection, categories
- [x] **Cooking Preferences** (`cooking/page.tsx`) - Cooking skill level, preferences  
- [x] **Complete** (`complete/page.tsx`) - Onboarding completion

---

### 📄 Static/Info Pages (Low Priority)
**Location**: `src/app/`

- [x] **About** (`about/page.tsx`) - Company information, mission
- [x] **Contact** (`contact/page.tsx`) - Contact form, information
- [x] **FAQ** (`faq/page.tsx`) - Frequently asked questions
- [x] **Privacy Policy** (`privacy/page.tsx`) - Privacy policy content
- [x] **Terms of Service** (`terms/page.tsx`) - Terms and conditions
- [x] **Shipping Info** (`shipping-info/page.tsx`) - Shipping information, delivery timeline, fees
- [x] **Returns Policy** (`returns-policy/page.tsx`) - Return and refund policies

---

### 🧩 Shared Components (Medium Priority)
**Location**: `src/components/`

#### Layout Components
- [x] **Cart Dropdown** (`layout/cart-dropdown.tsx`) - Cart items, totals, checkout
- [x] **Mobile Bottom Nav** (`layout/mobile-bottom-nav.tsx`) - Mobile navigation icons
- [x] **Notification Dropdown** (`layout/notification-dropdown.tsx`) - Notification list, badges
- [x] **Seller Header** (`layout/seller-header.tsx`) - Seller-specific header
- [x] **Simple Header** (`layout/simple-header.tsx`) - Minimal header for auth pages
- [x] **Auth Layout** (`layout/auth-layout.tsx`) - Authentication page wrapper

#### Catalog Components
- [x] **Filter Sidebar** (`catalog/FilterSidebar.tsx`) - Product filters, categories, price range

#### Common Components
- [x] **Breadcrumbs** (`common/breadcrumbs.tsx`) - Navigation breadcrumbs
- [x] **Error Boundary** (`common/error-boundary.tsx`) - Error display, retry button
- [x] **Loading States** (`common/loading-states.tsx`) - Skeleton loaders, spinners, empty states

#### UI Components
- [x] **Button** (`ui/button.tsx`) - All button variants with semantic tokens
- [x] **Map Picker** (`ui/map-picker.tsx`) - Location selection map with semantic colors
- [x] **Google Maps Picker** (`ui/google-maps-picker.tsx`) - Google Maps integration
- [x] **Skeleton Loaders** (`ui/skeleton-loaders.tsx`) - Custom skeleton components

---

### 🔧 Utility Files
**Location**: `src/lib/`

- [x] **colors.ts** - Deprecated with documentation, semantic tokens now used

---

### 🚨 Error & Loading Pages (Low Priority)
**Location**: `src/app/`

- [x] **Not Found** (`not-found.tsx`) - 404 error page
- [x] **Shop Error** (`(shop)/error.tsx`) - Shop section error boundary
- [x] **Shop Loading** (`(shop)/loading.tsx`) - Shop section loading state
- [x] **User Error** (`(user)/error.tsx`) - User section error boundary

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

**Last Updated**: November 10, 2025  
**Status**: 69/69 items completed (100%) ✅ COMPLETE!
**Final Update**: All components and pages updated with Nature theme semantic tokens!
