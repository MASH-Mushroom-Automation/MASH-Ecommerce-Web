# 🍄 MASH E-Commerce - Sanity CMS Master Plan

**Version:** 6.0  
**Last Updated:** November 28, 2025 (Updated)  
**Project:** MASH Mushroom E-Commerce Platform  
**CMS:** Sanity CMS (Project ID: `xyq5fhxs` - Growth Trial)

---

## 📊 Implementation Progress

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| **Phase 1** | Growers Schema & Integration | ✅ **COMPLETE** | 100% |
| **Phase 1.5** | Grower Images & Google Maps | ✅ **COMPLETE** | 100% |
| **Phase 2** | FAQ Schema & Integration | ✅ **COMPLETE** | 100% |
| **Phase 3** | Fix Category/Product Filtering | ✅ **COMPLETE** | 100% |
| **Phase 4** | Feature Section Schema | ✅ **COMPLETE** | 100% |
| **Phase 5** | Navigation & Site Settings | ✅ **COMPLETE** | 100% |
| **Phase 6** | Store/Location Pages | ✅ **COMPLETE** | 100% |
| **Phase 7** | Testimonials & Banners | ✅ **COMPLETE** | 100% |
| **Phase 8** | Blog & Content Pages | ✅ **COMPLETE** | 100% |
| **Phase 9** | Final Integration & Testing | 🔄 **IN PROGRESS** | 50% |
| **Phase 10** | Grower-Store Linking & Enhancements | ⏳ Pending | 0% |
| **Phase 11** | Meet Our Growers on Store Pages | ⏳ Pending | 0% |

---

## 🚨 CRITICAL ISSUES TO FIX (Updated November 28, 2025)

### 1. Shop Page Products Not Showing (✅ FIXED November 28, 2025)

**Issue:** Shop page (`/shop`) showed "No Products Found" despite 15 products in Sanity
**Root Cause:** Two bugs in `useSanityProducts.ts`:
1. **Cache Bug**: Empty products cached on first load because `productCache.set()` used stale `products` state instead of freshly fetched data
2. **GROQ Projection**: Category slug returned as object `{ current: string }` but transformation expected string

**Solution Applied:**
```typescript
// Fixed in src/hooks/useSanityProducts.ts

// 1. Cache BEFORE setState (using transformed data directly)
const transformedProducts = filteredData.map(transformSanityProduct);
productCache.set(cacheKey, { data: transformedProducts, timestamp: Date.now() });
setProducts(transformedProducts);

// 2. Fixed GROQ projection to return string slugs
category->{
  _id,
  name,
  "slug": slug.current,  // ← Fixed: Returns string, not object
  description
}

// 3. Added cache clearing on hot reload
if (typeof window !== 'undefined') {
  productCache.clear();
}
```

**Files Modified:**
- `src/hooks/useSanityProducts.ts` (lines 155-180)
- `src/types/sanity.ts` (lines 139-172)

### 2. About Page Team Not Showing (✅ FIXED November 28, 2025)

**Issue:** `challenges.challenges is undefined` error
**Root Cause:** About page was passing `items` prop but `CMSAboutSection` expects `challenges` array of strings
**Solution:** Fixed data transformation in `src/app/about/page.tsx`

### 3. Growers Not Linked to Stores (⏳ Phase 10/11)

**Issue:** When viewing a grower profile, no connection to their store location
**Impact:** Users can't find where to buy products from specific growers
**Solution:** 
- Add `growers: reference[]` to `store.ts` schema
- Add "Meet Our Growers" section to store pages
- Add "Find At Our Stores" to grower pages

### 4. Products/Categories Filtering Verification (🔄 Ongoing)

**Status:** 15 products confirmed available in Sanity
- All products have `isAvailable: true` ✅
- All products have images ✅
- All products have categories ✅
- Price range: ₱300 - ₱2,500 ✅

**Quick Verification Script:**
```bash
cd scripts && node check-products.js
```

---

## 🔴 COMPREHENSIVE IMPROVEMENT LIST

### Legend
- 🚨 **CRITICAL** - Must fix before launch
- 🔴 **HIGH** - Fix in next sprint (Phase 9-10)
- 🟡 **MEDIUM** - Fix before production (Phase 11-12)
- 🟢 **LOW** - Future enhancement

### E-Commerce & Products

| # | Issue | Priority | Category | Impact | Solution | Est. Time |
|---|-------|----------|----------|--------|----------|-----------|
| 1 | ~~Products not showing on shop~~ | 🚨 | Bug | ✅ FIXED | Cache + GROQ fix | Done |
| 2 | Product variants not displayed | 🔴 | Feature | Can't select sizes | Update product detail page | 3 hrs |
| 3 | "You May Also Like" not working | 🔴 | Feature | No cross-sell | Fetch suggestedProducts[] | 2 hrs |
| 4 | "Frequently Bought Together" missing | 🔴 | Feature | No bundle upsell | Fetch complementaryProducts[] | 2 hrs |
| 5 | Bundle savings not calculated | 🟡 | Feature | Manual entry | Add auto-calculate helper | 2 hrs |
| 6 | Product reviews not connected | 🟡 | Integration | No social proof | Link useSanityReviews | 2 hrs |
| 7 | Product search not working | 🟡 | Feature | Can't find products | Implement Sanity search | 4 hrs |
| 8 | Product tags not filterable | 🟢 | Schema | Limited discovery | Create productTag schema | 3 hrs |

### Growers & Stores

| # | Issue | Priority | Category | Impact | Solution | Est. Time |
|---|-------|----------|----------|--------|----------|-----------|
| 9 | **Growers not on store pages** | 🔴 | Feature | Can't find growers | Add growers[] to store.ts | 2 hrs |
| 10 | Store grower section missing | 🔴 | UI | No "Meet Our Growers" | Add GrowerCard to store detail | 2 hrs |
| 11 | Grower → Store link missing | 🔴 | Feature | Can't find store | Add stores[] to grower.ts | 1 hr |
| 12 | Store hours not displaying | 🟡 | Bug | Hours hidden | Fix operatingHours display | 1 hr |
| 13 | Store map not loading | 🟡 | Integration | No map view | Check Google Maps API key | 1 hr |

### Navigation & Site Settings

| # | Issue | Priority | Category | Impact | Solution | Est. Time |
|---|-------|----------|----------|--------|----------|-----------|
| 14 | Header using hardcoded nav | 🔴 | Integration | Can't update from CMS | Connect useSanityNavigation | 2 hrs |
| 15 | Footer using hardcoded links | 🔴 | Integration | Can't update from CMS | Connect to site settings | 2 hrs |
| 16 | Announcement bar not connected | 🔴 | Integration | No site-wide alerts | Use siteSettings.announcementBar | 1 hr |
| 17 | Social links not showing | 🟡 | Integration | No social presence | Fetch from siteSettings | 1 hr |
| 18 | Logo not from CMS | 🟢 | Integration | Can't change logo | Fetch siteSettings.logo | 30 min |

### Content Pages

| # | Issue | Priority | Category | Impact | Solution | Est. Time |
|---|-------|----------|----------|--------|----------|-----------|
| 19 | ~~About page team error~~ | 🚨 | Bug | ✅ FIXED | Data transformation | Done |
| 20 | About team photos missing | 🔴 | Content | Incomplete about | Upload in Sanity Studio | 30 min |
| 21 | Blog cover images missing | 🟡 | Content | Blog looks empty | Upload in Sanity Studio | 30 min |
| 22 | Contact form not submitting | 🟡 | Feature | Can't contact us | Add form handler | 3 hrs |
| 23 | FAQ categories not clickable | 🟢 | UX | Poor navigation | Add category filter | 2 hrs |

### Marketing & Banners

| # | Issue | Priority | Category | Impact | Solution | Est. Time |
|---|-------|----------|----------|--------|----------|-----------|
| 24 | Testimonials not on homepage | 🔴 | Integration | No social proof | Add TestimonialsSection | 1 hr |
| 25 | Homepage banners not showing | 🔴 | Integration | No promotions | Add BannerSection | 1 hr |
| 26 | Shop page banner missing | 🟡 | Integration | No promo display | Add ShopTopBanner | 30 min |
| 27 | Cart upsell banner missing | 🟢 | Integration | Less revenue | Add CartTopBanner | 30 min |

---

## 🎯 NEXT STEPS GUIDE (Prioritized Action Plan)

### IMMEDIATE (Today - 2 hours)

**Step 1: Verify Shop Page Fix (15 min)**
```bash
# 1. Start dev server
npm run dev

# 2. Open shop page
# http://localhost:3000/shop

# 3. Check browser console for:
# "🔍 Fetching products from Sanity..."
# "📡 Executing GROQ query..."
# "📥 Raw Sanity response: 15 products"
# "🛒 Fetched products from Sanity: 15"

# 4. Products should display in grid
```

**Step 2: Upload Missing Content in Sanity (30 min)**
```bash
# 1. Start Sanity Studio
cd studio && npm run dev
# Open http://localhost:3333

# 2. Upload Team Photos
# Blog → Authors & Team → Each member → Upload picture

# 3. Verify Product Images
# E-Commerce → Products → Check each has image

# 4. Verify Categories
# E-Commerce → Categories → Check slugs match:
# - fresh-mushrooms
# - dried-mushrooms  
# - growing-kits
```

**Step 3: Connect Header/Footer to CMS (1 hour)**

Update `src/components/layout/Header.tsx`:
```typescript
// Add import
import { useSanityNavigation, useSanitySiteSettings } from '@/hooks/useSanitySiteSettings';

// In component
const { settings } = useSanitySiteSettings();
const { items: mainNav } = useSanityNavigation('header-main');

// Use settings.logo, settings.companyName
// Use mainNav for navigation items
```

### THIS WEEK (Phase 9 - 8 hours)

| Priority | Task | Files | Est. |
|----------|------|-------|------|
| 1 | Add Testimonials to Homepage | `src/app/page.tsx` | 30 min |
| 2 | Add Announcement Bar | `src/components/layout/Header.tsx` | 1 hr |
| 3 | Connect Product Detail to Variants | `src/app/(shop)/product/[slug]/page.tsx` | 2 hrs |
| 4 | Add Related Products section | `src/app/(shop)/product/[slug]/page.tsx` | 2 hrs |
| 5 | Fix Store Hours Display | `src/app/stores/[slug]/page.tsx` | 1 hr |
| 6 | Add Homepage Banners | `src/app/page.tsx` | 1 hr |

### NEXT WEEK (Phase 10-11 - 12 hours)

| Priority | Task | Files | Est. |
|----------|------|-------|------|
| 1 | **Add Growers to Store Schema** | `studio/src/schemaTypes/documents/store.ts` | 1 hr |
| 2 | **Create "Meet Our Growers" section** | `src/app/stores/[slug]/page.tsx` | 2 hrs |
| 3 | Add Stores to Grower Schema | `studio/src/schemaTypes/documents/grower.ts` | 1 hr |
| 4 | Create "Find At Our Stores" section | `src/app/grower/[id]/page.tsx` | 2 hrs |
| 5 | Implement Product Reviews | `src/app/(shop)/product/[slug]/page.tsx` | 3 hrs |
| 6 | Add Search Functionality | `src/components/search/` | 3 hrs |

---

## 📋 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Current Environment Setup](#-current-environment-setup)
3. [Complete Schema Reference](#-complete-schema-reference)
4. [E-Commerce Flow & Customer Journey](#-e-commerce-flow--customer-journey)
5. [Data Flow Architecture](#-data-flow-architecture)
6. [Identified Issues & Improvements](#-identified-issues--improvements)
7. [Phase Implementation Guide](#-phase-implementation-guide)
8. [Frontend Integration Map](#-frontend-integration-map)
9. [Testing Checklist](#-testing-checklist)
10. [Next Steps Guide](#-next-steps-guide)

---

## 🎯 Executive Summary

### Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MASH E-COMMERCE PLATFORM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (Next.js 15)          SANITY CMS                      │
│  ├── src/app/                   ├── studio/src/schemaTypes/     │
│  │   ├── page.tsx (Home)        │   ├── documents/ (18 types)   │
│  │   ├── (shop)/shop/           │   ├── singletons/ (4 types)   │
│  │   ├── (shop)/product/[slug]  │   └── objects/ (4 types)      │
│  │   ├── grower/[id]            │                               │
│  │   └── faq/                   │  HOOKS (src/hooks/)           │
│  │                              │  ├── useSanityProducts.ts     │
│  │  COMPONENTS                  │  ├── useSanityCategories.ts   │
│  │  ├── hero/SanityHeroCarousel │  ├── useSanityGrowers.ts      │
│  │  ├── cms/SanityFeatureSection│  ├── useSanityFAQ.ts          │
│  │  ├── cms/FAQSection.tsx      │  ├── useSanityFeatures.ts     │
│  │  └── product/ProductCard.tsx │  └── useSanitySiteSettings.ts │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Metrics

| Metric | Count | Notes |
|--------|-------|-------|
| **Document Types** | 22 | Products, Categories, Growers, FAQs, Testimonials, Banners, BlogCategory, etc. |
| **Singleton Types** | 6 | siteSettings, heroCarousel, featuredProducts, settings, aboutPage, contactPage |
| **Object Types** | 4 | blockContent, callToAction, infoSection, link |
| **Custom Hooks** | 19 | All `useSanity*` hooks for data fetching |
| **Migration Scripts** | 8 | For growers, FAQs, features, site settings, navigation, testimonials, banners, phase8 |

---

## 🔧 Current Environment Setup

### Environment Variables (`.env.local`)

```bash
# ═══════════════════════════════════════════════════════════════
# SANITY CMS CONFIGURATION
# ═══════════════════════════════════════════════════════════════
# Project: MASH CMS (Growth Trial - 10M API calls/month)
# Created: November 26, 2025
# Dashboard: https://sanity.io/manage/project/xyq5fhxs

NEXT_PUBLIC_SANITY_PROJECT_ID=xyq5fhxs
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-26
NEXT_PUBLIC_SANITY_REALTIME_ENABLED=true
NEXT_PUBLIC_SANITY_STUDIO_URL=https://mash-cms.sanity.studio

# API Tokens (from https://sanity.io/manage/project/xyq5fhxs/api)
SANITY_API_READ_TOKEN=skq5uN9kW7BoyJ2B...  # Viewer permissions
SANITY_API_WRITE_TOKEN=sk5u0jTAHgqw3o5l... # Editor permissions

# ═══════════════════════════════════════════════════════════════
# OTHER INTEGRATIONS
# ═══════════════════════════════════════════════════════════════
NEXT_PUBLIC_USE_MOCK_DATA=false  # ✅ Uses real Sanity data

# Google Maps (for grower locations)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYw7TkeGXq6UJgms9AF06eRCYd3C-fqe8

# Firebase (authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDQryxFIjEjXApWMZP2H2ZkHIlWxUMuVO0
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mash-5b627

# Lalamove (same-day delivery)
LALAMOVE_API_KEY=pk_test_8611e4fa8a2f51f6664d26aded0e5d2b
LALAMOVE_HOST=https://rest.lalamove.com
LALAMOVE_MARKET=PH
```

### Sanity Client Configuration

**File:** `src/lib/sanity/client.ts`

```typescript
import { createClient } from '@sanity/client';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'xyq5fhxs';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-26';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,  // Enable CDN for faster reads
  // token: only needed for mutations
});
```

---

## 📊 Complete Schema Reference

### Studio Structure (How it appears in Sanity Studio)

```
📁 Website Content
├── 🛒 E-Commerce
│   ├── Products (18 documents)
│   ├── Categories (6 documents)
│   ├── Growers / Farms (4 documents)
│   └── Featured Products (singleton)
│
├── 🏠 Homepage
│   ├── Hero Carousel (singleton)
│   └── Featured Products (singleton)
│
├── ❓ FAQ
│   ├── FAQ Categories (5 categories)
│   └── FAQ Questions (19 items)
│
├── 📍 Store Locations (Phase 6)
│   └── Stores (main, pickup, partner, distribution)
│
├── 📣 Marketing (Phase 7) ← NEW
│   ├── Customer Testimonials (6 documents)
│   └── Promotional Banners (6 documents)
│
├── ⚙️ Settings
│   ├── Site Settings (singleton)
│   ├── Navigation Menus (5 menus)
│   └── Feature Sections (2 sections)
│
└── 📄 Other Documents
    ├── Pages
    ├── Posts (blog)
    ├── Persons (authors)
    ├── Orders
    ├── Coupons
    ├── Promotions
    ├── Email Campaigns
    └── Analytics
```

### Document Schemas (21 Types)

| Schema | File | Fields | Purpose |
|--------|------|--------|---------|
| `product` | `documents/product.ts` | 30+ | Main product catalog |
| `category` | `documents/category.ts` | 12 | Product categories |
| `productVariant` | `documents/productVariant.ts` | 8 | Size/weight options |
| `productBundle` | `documents/productBundle.ts` | 10 | Package deals |
| `review` | `documents/review.ts` | 8 | Customer reviews |
| `grower` | `documents/grower.ts` | 25 | Farm/grower profiles |
| `faqCategory` | `documents/faqCategory.ts` | 6 | FAQ categories |
| `faqItem` | `documents/faqItem.ts` | 8 | FAQ questions/answers |
| `featureSection` | `documents/featureSection.ts` | 15 | Homepage features |
| `navigation` | `documents/navigation.ts` | 10 | Header/footer menus |
| `store` | `documents/store.ts` | 25+ | Store locations |
| `testimonial` | `documents/testimonial.ts` | 15+ | Customer testimonials ← NEW Phase 7 |
| `banner` | `documents/banner.ts` | 25+ | Promotional banners ← NEW Phase 7 |
| `page` | `documents/page.ts` | 10 | CMS pages |
| `post` | `documents/post.ts` | 15 | Blog posts |
| `person` | `documents/person.ts` | 8 | Authors/team |
| `order` | `documents/order.ts` | 20 | Order management |
| `coupon` | `documents/coupon.ts` | 12 | Discount codes |
| `promotion` | `documents/promotion.ts` | 15 | Marketing campaigns |
| `emailCampaign` | `documents/emailCampaign.ts` | 12 | Email marketing |
| `analytics` | `documents/analytics.ts` | 10 | Analytics reports |

### Singleton Schemas (4 Types)

| Singleton | File | Document ID | Purpose |
|-----------|------|-------------|---------|
| `siteSettings` | `singletons/siteSettings.ts` | `siteSettingsDoc` | Global site config |
| `heroCarousel` | `singletons/heroCarousel.ts` | `heroCarousel` | Homepage hero slides |
| `featuredProducts` | `singletons/featuredProducts.ts` | `featuredProducts` | Featured products list |
| `settings` | `singletons/settings.tsx` | (deprecated) | Legacy settings |

### Product Schema Deep Dive (30+ Fields)

```typescript
// studio/src/schemaTypes/documents/product.ts (623 lines)

// ═══════════ BASIC INFO ═══════════
name: string              // "Fresh Oyster Mushrooms"
slug: slug                // "fresh-oyster-mushrooms"
image: image              // Main product image
images: image[]           // Gallery images
category: reference       // → category document
description: text         // Full product description
sku: string              // Stock Keeping Unit

// ═══════════ PRICING ═══════════
price: number            // Regular price (₱350)
isOnPromo: boolean       // Enable promotion
promoType: 'percentage' | 'fixed'
promoPercentage: number  // 20 (for 20% off)
promoPrice: number       // Fixed promotional price
promoEndDate: datetime   // When promo expires
compareAtPrice: number   // Original price for strikethrough

// ═══════════ INVENTORY ═══════════
quantity: number         // Stock quantity
inventory: {
  quantityInStock: number
  lowStockThreshold: number
  trackInventory: boolean
  allowBackorders: boolean
  stockHistory: array
}

// ═══════════ VARIANTS ═══════════
hasVariants: boolean
variants: reference[]    // → productVariant documents
weight: number
unit: string            // "grams", "kg", "piece"

// ═══════════ SMART RECOMMENDATIONS ═══════════
suggestedProducts: reference[]      // "You May Also Like"
relatedProducts: reference[]        // Similar products
complementaryProducts: reference[]  // "Frequently Bought Together"
relatedBundles: reference[]         // Package deals
productTags: string[]               // Tags for filtering

// ═══════════ FRESHNESS (Mushroom-Specific) ═══════════
freshnessInfo: {
  harvestWindow: string       // "Harvested within 24 hours"
  shelfLife: string           // "5-7 days refrigerated"
  storageInstructions: text   // How to store
  qualityIndicators: string[] // Signs of freshness
}

// ═══════════ PREPARATION ═══════════
preparationInfo: {
  difficultyLevel: string     // "beginner", "intermediate", "advanced"
  cookingTime: number         // Minutes
  preparationTips: string[]   // Tips array
  recipeIdeas: array          // Recipe suggestions
}

// ═══════════ DELIVERY (Lalamove) ═══════════
deliveryOptions: {
  sameDayDeliveryEligible: boolean
  deliveryZones: string[]     // ["Metro Manila", "Quezon City"]
  deliveryNotes: text
  perishable: boolean         // Requires cold transport
}
deliveryWeight: {
  packageWeight: number       // kg
  packageDimensions: {
    length: number
    width: number
    height: number
  }
}

// ═══════════ SEO ═══════════
searchKeywords: string[]
nutritionalHighlights: array
isFeatured: boolean
isAvailable: boolean
```

### Site Settings Schema (Phase 5 - 30+ Fields)

```typescript
// studio/src/schemaTypes/singletons/siteSettings.ts (541 lines)

// ═══════════ COMPANY INFO ═══════════
companyName: string         // "MASH Mushroom E-Commerce"
tagline: string             // "Premium Quality Mushrooms, Farm Fresh"
description: text           // Full company description
logo: image                 // Company logo
favicon: image              // Browser favicon

// ═══════════ CONTACT ═══════════
contactEmail: string        // "hello@mashmushrooms.ph"
contactPhone: string        // "+63 966 169 2000"
address: {
  street: string            // "1019 Quirino Highway"
  city: string              // "Novaliches, Quezon City"
  state: string             // "Metro Manila"
  zipCode: string           // "1116"
  country: string           // "Philippines"
}

// ═══════════ SOCIAL MEDIA ═══════════
socialMedia: {
  facebook: url
  instagram: url
  twitter: url
  linkedin: url
  youtube: url
  tiktok: url
}

// ═══════════ ANNOUNCEMENT BAR ═══════════
announcementBar: {
  enabled: boolean
  message: string           // "🎉 Free Shipping on Orders Over ₱1,500!"
  link: string
  linkText: string
  backgroundColor: color
  textColor: color
}

// ═══════════ FOOTER ═══════════
footer: {
  aboutText: text
  copyrightText: string     // "© {year} MASH Market. All rights reserved."
  showNewsletter: boolean
  newsletterTitle: string
  newsletterDescription: text
  links: array[]            // Footer links
}

// ═══════════ SEO ═══════════
seo: {
  metaTitle: string
  metaDescription: text
  keywords: string[]
  ogImage: image
}

// ═══════════ BUSINESS HOURS ═══════════
businessHours: {
  monday: string            // "9:00 AM - 6:00 PM"
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
  timezone: string          // "Asia/Manila"
  note: text               // Holiday hours note
}

// ═══════════ FEATURE TOGGLES ═══════════
features: {
  enableBlog: boolean
  enableShop: boolean
  enableGrowerProfiles: boolean
  enableReviews: boolean
  enableWishlist: boolean
  enableSameDayDelivery: boolean
}
```

### Testimonial Schema (Phase 7 - 15+ Fields)

```typescript
// studio/src/schemaTypes/documents/testimonial.ts (220+ lines)

// ═══════════ CUSTOMER INFO ═══════════
customerName: string        // "Maria Santos"
customerTitle: string       // "Home Chef"
customerCompany: string     // Company name (optional)
location: string            // "Quezon City"
customerImage: image        // Customer photo (with hotspot)

// ═══════════ TESTIMONIAL CONTENT ═══════════
rating: number              // 1-5 star rating
headline: string            // Short attention-grabbing headline
quote: text                 // Full testimonial text
productPurchased: reference // → product document (optional)
growerReference: reference  // → grower document (optional)

// ═══════════ DISPLAY SETTINGS ═══════════
displayPosition: number     // Order on page (1-10)
isFeatured: boolean         // Show in featured section
showOnHomepage: boolean     // Display on homepage
isVerified: boolean         // Verified purchase badge
isActive: boolean           // Enable/disable display
```

### Banner Schema (Phase 7 - 25+ Fields)

```typescript
// studio/src/schemaTypes/documents/banner.ts (280+ lines)

// ═══════════ CONTENT ═══════════
title: string               // Internal title for CMS
headline: string            // Main banner text
subheadline: string         // Secondary text
description: text           // Full description

// ═══════════ IMAGES ═══════════
desktopImage: image         // Desktop banner image
mobileImage: image          // Mobile-optimized image
overlayOpacity: number      // 0-100% overlay darkness

// ═══════════ STYLING ═══════════
backgroundColor: string     // Hex color
textColor: 'light' | 'dark' // Text contrast
textAlignment: string       // 'left' | 'center' | 'right'
size: 'small' | 'medium' | 'large' | 'full'

// ═══════════ CALL TO ACTION ═══════════
buttonText: string          // "Shop Now"
buttonLink: string          // "/shop?promo=holiday"
buttonStyle: string         // 'primary' | 'secondary' | 'ghost' | 'outline'
promoCode: string           // "HOLIDAY25"
showPromoCode: boolean      // Display code on banner

// ═══════════ SCHEDULING ═══════════
startDate: datetime         // When banner goes live
endDate: datetime           // When banner expires
timezone: string            // "Asia/Manila"

// ═══════════ POSITION & PRIORITY ═══════════
position: string            // Where to display:
                            // 'homepage-top', 'homepage-middle', 'homepage-bottom'
                            // 'shop-top', 'shop-sidebar'
                            // 'product-bottom', 'cart-top', 'checkout-bottom'
                            // 'announcement'
priority: number            // Higher = shows first (1-100)
isActive: boolean           // Enable/disable
```

---

## 🛒 E-Commerce Flow & Customer Journey

This section describes how customers interact with the MASH platform and which CMS schemas support each step.

### Complete Customer Journey

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        MASH E-COMMERCE CUSTOMER JOURNEY                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1️⃣ DISCOVERY                                                                   │
│  ├── Homepage Hero (heroCarousel singleton)                                     │
│  │   └── Eye-catching slides with CTA buttons                                   │
│  ├── Announcement Bar (siteSettings.announcementBar)                            │
│  │   └── "🎉 Free Shipping on Orders Over ₱1,500!"                              │
│  ├── Featured Products (useSanityFeaturedProducts)                              │
│  │   └── 8 bestselling products from product schema                             │
│  ├── Featured Growers (useSanityGrowers)                                        │
│  │   └── 3 trusted farm partners with profiles                                  │
│  └── Customer Testimonials (useSanityTestimonials) ← NEW Phase 7                │
│      └── 6 real customer reviews with ratings                                   │
│                                                                                 │
│  2️⃣ BROWSING                                                                    │
│  ├── Shop by Category (useSanityCategories)                                     │
│  │   └── Fresh, Dried, Growing Kits, etc.                                       │
│  ├── Product Grid (useSanityProducts)                                           │
│  │   └── Filterable by category, price, availability                            │
│  ├── Promotional Banners (useSanityBanners) ← NEW Phase 7                       │
│  │   └── Shop-top banner with promo codes                                       │
│  └── Search (product.searchKeywords)                                            │
│      └── Keyword-based product discovery                                        │
│                                                                                 │
│  3️⃣ PRODUCT DETAIL                                                              │
│  ├── Product Images (product.image, product.images)                             │
│  │   └── Gallery with zoom and hotspot focus                                    │
│  ├── Pricing (product.price, product.promoPrice)                                │
│  │   └── Regular and promotional pricing                                        │
│  ├── Variants (useSanityVariants)                                               │
│  │   └── Size/weight options (100g, 250g, 500g)                                 │
│  ├── Freshness Info (product.freshnessInfo)                                     │
│  │   └── Harvest window, shelf life, storage tips                               │
│  ├── Preparation (product.preparationInfo)                                      │
│  │   └── Cooking time, difficulty, recipes                                      │
│  ├── Related Products (product.suggestedProducts)                               │
│  │   └── "You May Also Like" recommendations                                    │
│  ├── Frequently Bought Together (product.complementaryProducts)                 │
│  │   └── Cross-sell suggestions                                                 │
│  └── Reviews (useSanityReviews)                                                 │
│      └── Customer ratings and feedback                                          │
│                                                                                 │
│  4️⃣ TRUST BUILDING                                                              │
│  ├── Grower Profile (useSanityGrower)                                           │
│  │   └── Farm story, certifications, location map                               │
│  ├── Why MASH Section (useSanityFeatures)                                       │
│  │   └── Quality guarantee, farm-to-table, sustainable                          │
│  ├── FAQ (useSanityFAQ)                                                         │
│  │   └── 5 categories, 19 questions with answers                                │
│  └── Store Locations (useSanityStores)                                          │
│      └── Physical store addresses with hours                                    │
│                                                                                 │
│  5️⃣ CONVERSION                                                                  │
│  ├── Cart (local state + cart banner from useSanityBanners)                     │
│  │   └── "Add ₱300 more for FREE Delivery!" upsell                              │
│  ├── Checkout Banner (useSanityBanners position: 'checkout-bottom')             │
│  │   └── Last-minute offers or newsletter signup                                │
│  └── Same-Day Delivery (product.deliveryOptions)                                │
│      └── Lalamove integration for Metro Manila                                  │
│                                                                                 │
│  6️⃣ RETENTION                                                                   │
│  ├── Newsletter (siteSettings.footer.showNewsletter)                            │
│  │   └── Email signup with 10% off first order                                  │
│  ├── Blog Posts (useSanityBlogPosts) ← Phase 8                                  │
│  │   └── Recipes, tips, mushroom education                                      │
│  └── Social Proof (useSanityTestimonials)                                       │
│      └── Display on multiple pages                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Page-by-Page CMS Integration

#### Homepage (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 HOMEPAGE                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📢 ANNOUNCEMENT BAR (siteSettings.announcementBar)      │ │
│ │ "🎉 Free Shipping on Orders Over ₱1,500!"               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🖼️ HERO CAROUSEL (heroCarousel singleton)               │ │
│ │ • Slide 1: Fresh Mushrooms - Farm to Table              │ │
│ │ • Slide 2: Growing Kits - Grow Your Own                 │ │
│ │ • Slide 3: Same-Day Delivery - Fresh Today              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛒 FEATURED PRODUCTS (useSanityFeaturedProducts)        │ │
│ │ 8 bestselling products in a responsive grid             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📂 SHOP BY CATEGORY (useSanityCategories)               │ │
│ │ Fresh | Dried | Growing Kits | Bundles                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✨ WHY MASH (useSanityFeatures)                         │ │
│ │ • Farm Fresh Quality • Sustainable Practices            │ │
│ │ • Same-Day Delivery  • Supporting Local Farmers         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👨‍🌾 MEET OUR GROWERS (useSanityGrowers)                  │ │
│ │ 3 featured grower profiles with farm stories            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⭐ CUSTOMER TESTIMONIALS (useSanityTestimonials) ← NEW  │ │
│ │ 6 reviews in carousel with ratings and photos           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Shop Page (`/shop`)

```
┌─────────────────────────────────────────────────────────────┐
│ 🛍️ SHOP PAGE                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎉 PROMOTIONAL BANNER (useSanityBanners position:shop)  │ │
│ │ "Growing Kit Promo - 15% OFF with code GROWKIT15"       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌──────────────┬──────────────────────────────────────────┐ │
│ │ 📋 SIDEBAR   │ 🛒 PRODUCT GRID                          │ │
│ │              │                                          │ │
│ │ Categories   │ [Product] [Product] [Product] [Product]  │ │
│ │ (useSanity   │ [Product] [Product] [Product] [Product]  │ │
│ │  Categories) │ [Product] [Product] [Product] [Product]  │ │
│ │              │                                          │ │
│ │ Price Filter │ (useSanityProducts with filters)         │ │
│ │              │                                          │ │
│ │ Availability │                                          │ │
│ └──────────────┴──────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Product Detail (`/product/[slug]`)

```
┌─────────────────────────────────────────────────────────────┐
│ 🍄 PRODUCT DETAIL PAGE                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────────────┬────────────────────────────────┐   │
│ │ 📸 PRODUCT GALLERY   │ 📝 PRODUCT INFO                │   │
│ │                      │                                │   │
│ │ • Main Image         │ Name: Fresh Oyster Mushrooms   │   │
│ │ • Thumbnails (4)     │ Price: ₱350 (was ₱450)         │   │
│ │ • Zoom on hover      │ Rating: ⭐⭐⭐⭐⭐ (24 reviews) │   │
│ │                      │                                │   │
│ │ (product.image,      │ Variants: 100g | 250g | 500g   │   │
│ │  product.images)     │                                │   │
│ │                      │ [Add to Cart] [Buy Now]        │   │
│ └──────────────────────┴────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌿 FRESHNESS & QUALITY (product.freshnessInfo)          │ │
│ │ Harvest: Within 24 hours | Shelf Life: 5-7 days         │ │
│ │ Storage: Refrigerate in paper bag                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👨‍🍳 PREPARATION (product.preparationInfo)                │ │
│ │ Difficulty: Beginner | Cook Time: 15 mins               │ │
│ │ Recipe Ideas: Stir-fry, Soup, Grilled                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💡 YOU MAY ALSO LIKE (product.suggestedProducts)        │ │
│ │ [Product] [Product] [Product] [Product]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛒 FREQUENTLY BOUGHT TOGETHER (complementaryProducts)   │ │
│ │ [Product] + [Product] = Save ₱50!                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⭐ CUSTOMER REVIEWS (useSanityReviews)                  │ │
│ │ 24 reviews • Average: 4.8/5                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Banner Positions Map

```
┌─────────────────────────────────────────────────────────────┐
│                    BANNER POSITIONS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HOMEPAGE                                                   │
│  ├── 'homepage-top'     → After hero, before products      │
│  ├── 'homepage-middle'  → Between sections                 │
│  └── 'homepage-bottom'  → Before footer (newsletter)       │
│                                                             │
│  SHOP PAGE                                                  │
│  ├── 'shop-top'         → Above product grid               │
│  └── 'shop-sidebar'     → In filter sidebar                │
│                                                             │
│  PRODUCT PAGE                                               │
│  └── 'product-bottom'   → After reviews                    │
│                                                             │
│  CART PAGE                                                  │
│  └── 'cart-top'         → Upsell banner ("Add ₱300 more")  │
│                                                             │
│  CHECKOUT PAGE                                              │
│  └── 'checkout-bottom'  → Last-minute offers               │
│                                                             │
│  ALL PAGES                                                  │
│  └── 'announcement'     → Sticky top bar (site-wide)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

### How Data Flows from Sanity to Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW DIAGRAM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SANITY STUDIO (localhost:3333)                                 │
│  ├── Content Editor → Edit Products, Categories, etc.          │
│  ├── Publish → Sends to Sanity Cloud CDN                        │
│  └── Real-time → Broadcasts changes                             │
│           │                                                     │
│           ▼                                                     │
│  SANITY CLOUD CDN (cdn.sanity.io)                               │
│  ├── Caches published content                                   │
│  └── Serves via API (GROQ queries)                              │
│           │                                                     │
│           ▼                                                     │
│  REACT HOOKS (src/hooks/useSanity*.ts)                          │
│  ├── useSanityProducts() → Fetch products                       │
│  ├── useSanityCategories() → Fetch categories                   │
│  ├── useSanityGrowers() → Fetch growers                         │
│  ├── useSanityFAQ() → Fetch FAQs                                │
│  ├── useSanityFeatures() → Fetch feature sections               │
│  ├── useSanitySiteSettings() → Fetch site config                │
│  └── useSanityHero() → Fetch hero carousel                      │
│           │                                                     │
│           ▼                                                     │
│  REACT COMPONENTS                                               │
│  ├── ProductCard.tsx → Displays product data                    │
│  ├── SanityHeroCarousel.tsx → Displays hero slides              │
│  ├── SanityFeatureSection.tsx → Displays features               │
│  ├── FAQSection.tsx → Displays FAQs                             │
│  └── GrowerCard.tsx → Displays grower info                      │
│           │                                                     │
│           ▼                                                     │
│  PAGE COMPONENTS                                                │
│  ├── src/app/page.tsx (Homepage)                                │
│  ├── src/app/(shop)/shop/page.tsx (Shop)                        │
│  ├── src/app/(shop)/product/[slug]/page.tsx (Product Detail)    │
│  ├── src/app/grower/[id]/page.tsx (Grower Detail)               │
│  └── src/app/faq/page.tsx (FAQ)                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Hook-to-Component Mapping

| Hook | Component(s) | Page(s) |
|------|-------------|---------|
| `useSanityProducts()` | ProductCard, ProductGrid | Shop, Product Detail |
| `useSanityFeaturedProducts()` | FeaturedProductsSection | Homepage |
| `useSanityCategories()` | CategoryCard, FilterSidebar | Homepage, Shop |
| `useSanityGrowers()` | GrowerCard | Homepage, Grower List |
| `useSanityGrower(slug)` | GrowerDetail | Grower Detail |
| `useSanityFAQ()` | CMSFAQSection | FAQ |
| `useSanityFeatures()` | SanityFeatureSection | Homepage |
| `useSanitySiteSettings()` | Header, Footer | All pages |
| `useSanityNavigation()` | Header, Footer | All pages |
| `useSanityStores()` | StoreCard, StoreList | Store List |
| `useSanityStore(slug)` | StoreDetail | Store Detail |
| `useSanityTestimonials()` | TestimonialsSection, TestimonialCard | Homepage, Product ← NEW Phase 7 |
| `useSanityBanners()` | BannerSection, AnnouncementBar | All pages ← NEW Phase 7 |
| `useSanityHero()` | SanityHeroCarousel | Homepage |

---

## 🔴 Identified Issues & Improvements

### Critical Issues (Need Immediate Fix)

| Issue | Status | Solution |
|-------|--------|----------|
| Products not filtering by category | ✅ Fixed | Phase 3: Use `category.slug` instead of `category.name` |
| Growers section not showing | ✅ Fixed | Phase 1: Created grower schema and migration |
| FAQ not editable in CMS | ✅ Fixed | Phase 2: Created faqCategory + faqItem schemas |
| Feature sections hardcoded | ✅ Fixed | Phase 4: Created featureSection schema |
| Site settings incomplete | ✅ Fixed | Phase 5: Created comprehensive siteSettings |
| Store locations missing | ✅ Fixed | Phase 6: Created store schema and pages |
| Duplicate ID error in Studio | ✅ Fixed | Changed document ID from `siteSettings` to `siteSettingsDoc` |

### Pending Improvements

| Improvement | Priority | Phase | Status |
|-------------|----------|-------|--------|
| ~~Store/Location pages~~ | ~~🔴 High~~ | ~~Phase 6~~ | ✅ Complete |
| ~~Testimonials section~~ | ~~🟡 Medium~~ | ~~Phase 7~~ | ✅ Complete |
| ~~Promotional banners~~ | ~~🟡 Medium~~ | ~~Phase 7~~ | ✅ Complete |
| ~~Blog integration~~ | ~~🟢 Low~~ | ~~Phase 8~~ | ✅ Complete |
| ~~Content pages (About, Contact)~~ | ~~🟢 Low~~ | ~~Phase 8~~ | ✅ Complete |
| Grower-Store Linking | 🟡 Medium | Phase 9 | ⏳ Pending |
| Product Bundle Discounts | 🟢 Low | Phase 9 | ⏳ Pending |
| Analytics Dashboard | 🟢 Low | Phase 10 | ⏳ Pending |

### Improvement List by Category

#### 1. E-Commerce Improvements

```
✅ COMPLETE: Store/Pickup Location Pages (Phase 6)
   - Created store.ts schema with 25+ fields
   - Store list page with map and categories
   - Store detail page with hours, contact, services
   - Connected Header/Footer to CMS navigation

✅ COMPLETE: Testimonials/Reviews Display (Phase 7)
   - Created testimonial.ts schema with 15+ fields
   - 6 sample testimonials migrated
   - TestimonialsSection component with carousel
   - Homepage integration complete

✅ COMPLETE: Promotional Banners (Phase 7)
   - Created banner.ts schema with 25+ fields
   - 9 banner positions across all pages
   - 6 sample banners migrated
   - Scheduling with start/end dates
   - Promo code display with copy button

⚠️ PARTIAL: Product Images
   - Some products show placeholders
   - Need: Ensure all products have valid images in Sanity
```

#### 2. Content Improvements

```
✅ COMPLETE: About Page CMS (Phase 8)
   - Created aboutPage.ts singleton schema
   - 35+ fields: hero, challenges, solutions, vision, team
   - useSanityAboutPage hook for data fetching
   - Migration script with sample content

✅ COMPLETE: Contact Page CMS (Phase 8)
   - Created contactPage.ts singleton schema
   - 25+ fields: contact methods, hours, map, form settings
   - useSanityContactPage hook for data fetching
   - Migration script with sample content

✅ COMPLETE: Blog Integration (Phase 8)
   - Enhanced post.ts with categories, tags, SEO
   - Created blogCategory.ts schema (5 categories)
   - Enhanced person.ts for team/author display
   - Blog hooks already exist (useSanityBlogPosts)
```

#### 3. Navigation Improvements

```
✅ COMPLETE: Site Settings
   - Company info, contact, social links
   - Announcement bar configuration
   - Business hours

✅ COMPLETE: Navigation Menus
   - Header main navigation
   - Header secondary links
   - Footer shop links
   - Footer customer service
   - Footer about links

⚠️ PARTIAL: Header/Footer Using CMS Data
   - Navigation schemas exist and connected
   - Header uses useSanityNavigation('header-main')
   - Footer uses multiple navigation hooks
   - Fallback to hardcoded links when CMS unavailable
```

#### 4. Schema Improvements & Recommendations

```
📋 RECOMMENDED IMPROVEMENTS FOR FUTURE PHASES:

🔗 GROWER-STORE LINKING (Priority: Medium)
   Problem: Growers and Stores are separate schemas with no connection
   Solution: Add "Meet Our Growers" to store pages
   Implementation:
   - Add `growers: reference[]` field to store.ts (link to grower documents)
   - Display grower cards on store detail page
   - Show "Visit Our Store" on grower profile pages
   - Estimated time: 2-3 hours

🏷️ PRODUCT TAGS ENHANCEMENT (Priority: Low)
   Problem: productTags is just string array, not searchable/filterable
   Solution: Create dedicated `productTag` schema for better UX
   Implementation:
   - Create productTag.ts with name, slug, color, icon
   - Change product.productTags from string[] to reference[]
   - Add tag cloud component for filtering
   - Estimated time: 3-4 hours

📦 BUNDLE DISCOUNT AUTOMATION (Priority: Low)
   Problem: Bundle savings calculated manually
   Solution: Auto-calculate bundle discount from individual products
   Implementation:
   - Add `calculateSavings()` helper in useSanityBundles
   - Display "Save ₱XX" badge automatically
   - Estimated time: 1-2 hours

📊 ANALYTICS DASHBOARD (Priority: Low)
   Problem: Analytics schema exists but not connected
   Solution: Build simple admin dashboard
   Implementation:
   - Create /admin/analytics page
   - Connect to analytics schema for views/sales data
   - Estimated time: 4-5 hours

🖼️ CATEGORY IMAGES (Priority: Medium)
   Problem: Some categories show placeholder images
   Solution: Ensure all 6 categories have proper images
   Implementation:
   - Upload category images in Sanity Studio
   - Verify hotspot settings for responsive display
   - Estimated time: 30 minutes (manual)
```

---

## 📋 Phase Implementation Guide

### Phase 6: Store/Location Pages ✅ COMPLETE

**Status:** ✅ Completed November 27, 2025  
**Goal:** Create dedicated store pages with hours, location, and pickup info

#### ✅ Created Files

| File | Description |
|------|-------------|
| `studio/src/schemaTypes/documents/store.ts` | Store schema (25+ fields, 6 groups) |
| `src/hooks/useSanityStores.ts` | Complete hook with 4 functions |
| `src/app/stores/page.tsx` | Store list page with stats and categories |
| `src/app/stores/[slug]/page.tsx` | Store detail page with hours, map, contact |
| `scripts/migrate-stores-to-sanity.js` | Migration script for 4 sample stores |

#### ✅ Store Schema Features

- **Basic Info:** name, slug, storeType, description, isActive, isFeatured, sortOrder
- **Location:** address (street, city, state, zip, country, landmark), coordinates, directionsUrl
- **Hours:** operatingHours (7 days), timezone, hoursNote, isOpen24Hours
- **Contact:** phone, email, whatsapp, messenger
- **Services:** services array, deliveryZones, pickupInstructions
- **Media:** image (with hotspot), gallery

#### ✅ Store Types

- 🏪 Main Store
- 📦 Pickup Point
- 🤝 Partner Store
- 🚚 Distribution Center

#### ✅ Hooks Created

```typescript
// Client-side hooks
useSanityStores()         // All active stores
useSanityStore(slug)      // Single store by slug
useFeaturedStores()       // Featured stores only
useStoresByType(type)     // Stores by type

// Server-side functions
fetchStores()             // For Server Components
fetchStoreBySlug(slug)    // For Server Components
fetchFeaturedStores()     // For Server Components
```

#### ✅ Header & Footer CMS Connection

- **Header:** Now uses `useSanityNavigation('header-main')` for dynamic navigation
- **Footer:** Now uses `useSanityNavigation('footer-shop')`, `useSanityNavigation('footer-support')`, `useSanityNavigation('footer-about')` for dynamic navigation
- **Fallback:** Both components have hardcoded fallback links when CMS is unavailable

#### ⚠️ Note: API Token Issue

The migration script requires valid API tokens. If you see "Session does not match project host" error:
1. Go to https://sanity.io/manage/project/xyq5fhxs/api
2. Generate new tokens with Editor permissions
3. Update `.env.local` with new `SANITY_API_WRITE_TOKEN`
4. Or add stores manually in Sanity Studio at localhost:3333

---

### Phase 6 Original Schema (For Reference)

```typescript
// studio/src/schemaTypes/documents/store.ts
import { MapPinIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const store = defineType({
  name: 'store',
  title: 'Store Location',
  type: 'document',
  icon: MapPinIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Store Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Store Type',
      type: 'string',
      options: {
        list: [
          { title: 'Main Store', value: 'main' },
          { title: 'Pickup Point', value: 'pickup' },
          { title: 'Partner Store', value: 'partner' },
        ],
      },
    }),
    defineField({
      name: 'image',
      title: 'Store Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        { name: 'street', title: 'Street', type: 'string' },
        { name: 'city', title: 'City', type: 'string' },
        { name: 'state', title: 'State/Province', type: 'string' },
        { name: 'zipCode', title: 'ZIP Code', type: 'string' },
        { name: 'country', title: 'Country', type: 'string' },
      ],
    }),
    defineField({
      name: 'coordinates',
      title: 'Map Coordinates',
      type: 'object',
      fields: [
        { name: 'lat', title: 'Latitude', type: 'number' },
        { name: 'lng', title: 'Longitude', type: 'number' },
      ],
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'hours',
      title: 'Operating Hours',
      type: 'object',
      fields: [
        { name: 'monday', title: 'Monday', type: 'string' },
        { name: 'tuesday', title: 'Tuesday', type: 'string' },
        { name: 'wednesday', title: 'Wednesday', type: 'string' },
        { name: 'thursday', title: 'Thursday', type: 'string' },
        { name: 'friday', title: 'Friday', type: 'string' },
        { name: 'saturday', title: 'Saturday', type: 'string' },
        { name: 'sunday', title: 'Sunday', type: 'string' },
      ],
    }),
    defineField({
      name: 'services',
      title: 'Available Services',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'In-Store Pickup', value: 'pickup' },
          { title: 'Same-Day Delivery', value: 'same-day' },
          { title: 'Product Demo', value: 'demo' },
          { title: 'Growing Workshops', value: 'workshops' },
        ],
      },
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
```

#### Hook to Create: `useSanityStores.ts`

```typescript
// src/hooks/useSanityStores.ts
export function useSanityStores() {
  // Fetch all active stores from Sanity
  // Include address, hours, coordinates for map
}

export function useSanityStore(slug: string) {
  // Fetch single store by slug
}
```

#### Pages to Create

- `src/app/stores/page.tsx` - Store list with map
- `src/app/stores/[slug]/page.tsx` - Store detail

---

### Phase 7: Testimonials & Banners ✅ COMPLETE

**Status:** ✅ Completed November 27, 2025  
**Goal:** Add customer testimonials and promotional banners to the platform

#### ✅ Created Files

| File | Description |
|------|-------------|
| `studio/src/schemaTypes/documents/testimonial.ts` | Testimonial schema (15+ fields, 4 groups) |
| `studio/src/schemaTypes/documents/banner.ts` | Banner schema (25+ fields, 6 groups) |
| `src/hooks/useSanityTestimonials.ts` | Complete hook (413 lines) with 5 client hooks + 3 server functions |
| `src/hooks/useSanityBanners.ts` | Complete hook (390+ lines) with position-based filtering |
| `src/components/cms/TestimonialsSection.tsx` | Full testimonials component with carousel |
| `src/components/cms/BannerSection.tsx` | Banner component with 9 position exports |
| `scripts/migrate-testimonials-to-sanity.js` | Migration script for 6 sample testimonials |
| `scripts/migrate-banners-to-sanity.js` | Migration script for 6 sample banners |

#### ✅ Testimonial Schema Features

- **Customer Info:** name, title, company, location, image (with hotspot)
- **Content:** rating (1-5 stars), headline, quote, productPurchased reference, growerReference
- **Media:** customer photo with responsive cropping
- **Settings:** displayPosition, isFeatured, showOnHomepage, isVerified, isActive

#### ✅ Testimonial Hooks

```typescript
// Client-side hooks
useSanityTestimonials()         // All active testimonials
useFeaturedTestimonials()       // Featured testimonials only
useHomepageTestimonials()       // Homepage display testimonials
useProductTestimonials(id)      // Testimonials for specific product
useGrowerTestimonials(id)       // Testimonials for specific grower

// Server-side functions
fetchTestimonials()             // For Server Components
fetchFeaturedTestimonials()     // For Server Components
fetchHomepageTestimonials()     // For Server Components

// Helper functions
renderStarRating(rating)        // Render 1-5 star display
getAverageRating(testimonials)  // Calculate average rating
formatTestimonialDate(date)     // Format date for display
```

#### ✅ Banner Schema Features

- **Content:** title (internal), headline, subheadline, description
- **Images:** desktopImage, mobileImage (both with hotspot), overlayOpacity
- **Styling:** backgroundColor, textColor (light/dark), textAlignment, size
- **CTA:** buttonText, buttonLink, buttonStyle, promoCode, showPromoCode
- **Scheduling:** startDate, endDate, timezone
- **Settings:** position, priority (1-100), isActive

#### ✅ Banner Positions (9 total)

| Position | Location | Use Case |
|----------|----------|----------|
| `homepage-top` | After hero | Main promotions |
| `homepage-middle` | Between sections | Featured content |
| `homepage-bottom` | Before footer | Newsletter signup |
| `shop-top` | Above product grid | Category promos |
| `shop-sidebar` | In filter sidebar | Special offers |
| `product-bottom` | After reviews | Cross-sell |
| `cart-top` | Top of cart | Upsell messaging |
| `checkout-bottom` | Checkout footer | Last-minute offers |
| `announcement` | Sticky top bar | Site-wide announcements |

#### ✅ Banner Hooks

```typescript
// Client-side hooks
useSanityBanners()              // All active banners
useBannersByPosition(position)  // Banners for specific position
useHomepageBanners()            // All homepage banners
useAnnouncementBanner()         // Get announcement bar banner

// Server-side functions
fetchBanners()                  // For Server Components
fetchBannersByPosition(pos)     // For Server Components
fetchHomepageBanners()          // For Server Components

// Helper functions
getBannerHeightClass(size)      // Get Tailwind height class
getTextColorClass(color)        // Get text/bg color classes
getButtonVariant(style)         // Get Button component variant
getTimeRemaining(endDate)       // Calculate countdown timer
```

#### ✅ Banner Component Exports

```typescript
// Position-specific exports for easy use
import { 
  HomepageTopBanner,
  HomepageMiddleBanner,
  HomepageBottomBanner,
  ShopTopBanner,
  ShopSidebarBanner,
  ProductBottomBanner,
  CartTopBanner,
  CheckoutBottomBanner,
  AnnouncementBar
} from '@/components/cms/BannerSection';

// Usage example
<HomepageTopBanner />  // Shows banner with position='homepage-top'
```

#### ✅ Data Migrated

- **6 Customer Testimonials:** Maria Santos, Chef Ramon, Jessica Lim, Antonio Reyes, Dr. Patricia Cruz, Mark Gonzales
- **6 Promotional Banners:** Holiday Sale, Free Shipping Announcement, New Grower Partnership, Growing Kit Promo, Newsletter Signup, Cart Upsell

#### ✅ Homepage Integration

TestimonialsSection component added to homepage after FeaturedGrowersSection with carousel display.

---

### Phase 8: Blog & Content Pages (✅ COMPLETE - November 28, 2025)

**Goal:** Implement blog functionality and CMS-managed content pages

#### ✅ Schemas Created/Enhanced

**1. Enhanced `post.ts` (Blog Post Schema - 25+ Fields)**
```typescript
// studio/src/schemaTypes/documents/post.ts (304 lines)

// Groups: content, media, organization, seo, settings

// ═══════════ CONTENT ═══════════
title: string              // Blog post headline (10-100 chars)
slug: slug                 // URL-friendly identifier
excerpt: text              // Short summary (max 300 chars)
content: blockContent      // Rich text with formatting

// ═══════════ MEDIA ═══════════
coverImage: image          // Featured image (16:9, 1200x675px)
  - alt: string            // Required alt text
  - caption: string        // Optional caption
gallery: image[]           // Additional images

// ═══════════ ORGANIZATION ═══════════
author: reference          // → person document
categories: reference[]    // → blogCategory (min 1)
tags: string[]             // Keywords for discovery
relatedPosts: reference[]  // Manual related posts (max 4)
date: datetime             // Publish date
updatedAt: datetime        // Last update

// ═══════════ SEO ═══════════
seo: {
  metaTitle: string        // Override title (max 70 chars)
  metaDescription: text    // Search result summary (max 160 chars)
  keywords: string[]       // SEO keywords
  ogImage: image           // Social share image (1200x630px)
  noIndex: boolean         // Hide from search engines
}

// ═══════════ SETTINGS ═══════════
isFeatured: boolean        // Show prominently
isPublished: boolean       // Visibility toggle
readTime: number           // Minutes to read (1-60)
allowComments: boolean     // Enable comments
```

**2. New `blogCategory.ts` Schema (15 Fields)**
```typescript
// studio/src/schemaTypes/documents/blogCategory.ts (140 lines)

name: string               // "Recipes", "Growing Tips"
slug: slug                 // URL-friendly
description: text          // Category description (max 200)
icon: string               // Lucide icon name (dropdown)
color: string              // Badge color (green, blue, purple, etc.)
image: image               // Category hero image
displayOrder: number       // Sort order (1-100)
isActive: boolean          // Visibility toggle
postCount: number          // Auto-updated count (read-only)
```

**3. Enhanced `person.ts` (Team Member Schema - 25+ Fields)**
```typescript
// studio/src/schemaTypes/documents/person.ts (284 lines)

// Groups: basic, bio, contact, social, settings

// ═══════════ BASIC INFO ═══════════
firstName: string          // First name
lastName: string           // Last name
picture: image             // Profile photo (400x400px)
  - alt: string            // Required alt text

// ═══════════ BIO & ROLE ═══════════
role: string               // "Lead Developer", "Thesis Adviser"
personType: string         // 'team' | 'mentor' | 'author' | 'partner'
shortBio: text             // 1-2 sentences (max 200 chars)
bio: blockContent          // Full biography
specializations: string[]  // Skills/expertise tags

// ═══════════ CONTACT ═══════════
email: email               // Contact email
phone: string              // Phone number
website: url               // Personal website

// ═══════════ SOCIAL LINKS ═══════════
socialLinks: {
  facebook: url
  twitter: url
  instagram: url
  linkedin: url
  github: url
  tiktok: url
}

// ═══════════ SETTINGS ═══════════
displayOrder: number       // Sort order (1-100)
showOnAboutPage: boolean   // Display in team section
isFeatured: boolean        // Highlight as featured
isActive: boolean          // Visibility toggle
```

**4. New `aboutPage.ts` Singleton (35+ Fields)**
```typescript
// studio/src/schemaTypes/singletons/aboutPage.ts (280 lines)

// Groups: hero, challenges, solutions, vision, mentor, team

// ═══════════ HERO ═══════════
heroTitle: string          // Main headline
heroSubtitle: text         // Supporting text
heroImage: image           // Background image (16:9)

// ═══════════ CHALLENGES ═══════════
challengesTitle: string    // Section title
challengesSubtitle: text   // Section description
challenges: [              // List of challenges
  { title, description, icon }
]

// ═══════════ SOLUTIONS ═══════════
solutionsTitle: string     // "Our Solution: The M.A.S.H. System"
solutionsSubtitle: text    // Description
solutionsAcronym: text     // Acronym explanation
solutions: [               // List of solutions
  { title, description, icon, image }
]

// ═══════════ VISION ═══════════
visionTitle: string        // Vision section title
visionContent: blockContent// Detailed vision statement
visionCTA: string          // Call-to-action text
visionImage: image         // Vision illustration

// ═══════════ MENTOR ═══════════
mentorTitle: string        // "Our Academic Adviser"
mentorSubtitle: text       // Gratitude message
mentor: reference          // → person (mentor type)

// ═══════════ TEAM ═══════════
teamTitle: string          // "Meet the Team"
teamSubtitle: text         // Team description
teamMembers: reference[]   // → person documents
autoFetchTeam: boolean     // Auto-fetch persons with showOnAboutPage=true
```

**5. New `contactPage.ts` Singleton (40+ Fields)**
```typescript
// studio/src/schemaTypes/singletons/contactPage.ts (380 lines)

// Groups: header, contact, hours, social, location, form

// ═══════════ HEADER ═══════════
title: string              // "Get in Touch"
subtitle: text             // Supporting text
headerImage: image         // Banner image

// ═══════════ CONTACT METHODS ═══════════
contactMethods: [          // Array of contact options
  {
    type: 'phone' | 'email' | 'address' | 'whatsapp' | etc.
    label: string
    value: string
    description: string
    link: string
    displayOrder: number
  }
]

// ═══════════ BUSINESS HOURS ═══════════
businessHoursTitle: string
businessHours: [           // Hours for each day
  { day, openTime, closeTime, isClosed, note }
]
holidayNote: text          // Holiday hours notice
timezone: string           // "Philippine Time (GMT+8)"

// ═══════════ SOCIAL MEDIA ═══════════
socialMediaTitle: string
socialLinks: [
  { platform, url, handle, displayOrder }
]

// ═══════════ LOCATION ═══════════
locationTitle: string
address: {                 // Full address object
  street, barangay, city, province, zipCode, country
}
coordinates: { latitude, longitude }
mapEmbedUrl: url           // Google Maps embed
directionsLink: url        // Get directions link
locationImage: image       // Store exterior photo
nearbyLandmarks: text      // "In front of BDO..."

// ═══════════ CONTACT FORM ═══════════
formTitle: string
formSubtitle: text
formRecipientEmail: email
formSuccessMessage: text
showContactForm: boolean
```

#### ✅ Hooks Created

**1. `useSanityAboutPage.ts` (350 lines)**
- Fetches About page singleton with team members
- Helper hooks: `useSanityTeamMembers()`, `useSanityTeamMember(id)`
- Image URL builder integration
- Full TypeScript types

**2. `useSanityContactPage.ts` (380 lines)**
- Fetches Contact page singleton
- Transforms business hours, contact methods, social links
- Helper hooks: `useSanityBusinessHours()`, `useSanityContactMethods()`
- Icon mapping for contact types and social platforms

#### ✅ Migration Script Created

**`scripts/migrate-phase8-content.js` (564 lines)**
- Migrates 5 blog categories (Recipes, Growing Tips, Nutrition, News, Community)
- Migrates 6 team members (including mentor)
- Creates About page singleton with challenges, solutions, vision
- Creates Contact page singleton with business hours, social links
- Creates 3 sample blog posts

**Run:** `node scripts/migrate-phase8-content.js`

#### ✅ Schema Index Updated

Added to `studio/src/schemaTypes/index.ts`:
- `blogCategory` - Blog post categories
- `aboutPage` - About page singleton
- `contactPage` - Contact page singleton

---

### Phase 9: Final Integration & Testing (3-4 hours)

**Goal:** Connect all remaining schemas and test end-to-end

#### Tasks

1. Connect Header to `useSanityNavigation()` hook
2. Connect Footer to site settings and navigation
3. Test all pages load correctly
4. Verify image loading across all pages
5. Test category filtering in Shop
6. Test product detail page with all fields
7. Test grower detail page with map
8. Test FAQ accordion functionality
9. Performance optimization (caching, lazy loading)

---

## 🗺️ Frontend Integration Map

### Page-to-Data Source Mapping

| Page | Route | Data Source | Hook(s) |
|------|-------|-------------|---------|
| Homepage | `/` | Sanity | `useSanityHero`, `useSanityFeaturedProducts`, `useSanityCategories`, `useSanityFeatures`, `useSanityGrowers` |
| Shop | `/shop` | Sanity | `useSanityProducts`, `useSanityCategories` |
| Product Detail | `/product/[slug]` | Sanity | `useSanityProduct` |
| Grower List | `/grower` | Sanity | `useSanityGrowers` |
| Grower Detail | `/grower/[id]` | Sanity | `useSanityGrower` |
| FAQ | `/faq` | Sanity | `useSanityFAQs` |
| About | `/about` | ✅ Sanity | `useSanityAboutPage` |
| Contact | `/contact` | ✅ Sanity | `useSanityContactPage` |
| Blog | `/blog` | Sanity | `useSanityBlogPosts` |
| Stores | `/stores` | Sanity | `useSanityStores` |

### Component Integration Status

| Component | CMS Connected | Notes |
|-----------|---------------|-------|
| Header | ⚠️ Partial | Logo/company name missing, nav hardcoded |
| Footer | ⚠️ Partial | Links hardcoded, need navigation hook |
| HeroCarousel | ✅ Complete | Uses `useSanityHero` |
| ProductCard | ✅ Complete | Uses product data from hooks |
| CategoryCard | ✅ Complete | Uses `useSanityCategories` |
| GrowerCard | ✅ Complete | Uses `useSanityGrowers` |
| FAQSection | ✅ Complete | Uses `useSanityFAQs` |
| FeatureSection | ✅ Complete | Uses `useSanityFeatures` |
| AnnouncementBar | ❌ Missing | Need to use siteSettings |
| Testimonials | ❌ Missing | Schema needed |
| Banners | ❌ Missing | Schema needed |

---

## ✅ Testing Checklist

### Phase 1-5 Verification (✅ Complete)

- [x] Sanity Studio starts without errors (`cd studio && npm run dev`)
- [x] No duplicate ID errors in structure
- [x] Products display correctly on Shop page
- [x] Categories filter products correctly (using slug)
- [x] Product detail page loads with images
- [x] Growers display on homepage
- [x] Grower detail page shows map and hours
- [x] FAQ page shows categories and questions
- [x] Feature sections render from Sanity
- [x] Site settings singleton created
- [x] Navigation menus created (5 menus)

### Phase 6-9 Testing (⏳ Pending)

- [x] Store list page displays all locations
- [x] Store detail page shows hours and map
- [x] Testimonials appear on homepage
- [x] Banners display in correct positions
- [x] Blog list page shows posts
- [x] Blog post page renders content
- [x] Blog categories schema created
- [x] About page singleton schema created
- [x] Contact page singleton schema created
- [x] About page uses useSanityAboutPage hook
- [x] Contact page uses useSanityContactPage hook
- [x] Migration script run successfully (5 categories, 6 team, 3 posts)
- [x] Studio structure updated with Blog section
- [x] Studio structure updated with About/Contact pages
- [ ] Header uses navigation from CMS
- [ ] Footer uses site settings and navigation
- [ ] All images load correctly (no placeholders)
- [ ] Mobile responsive on all pages

---

## 🚀 Next Steps Guide

### ✅ Phase 8 Completed Tasks (November 28, 2025)

1. ✅ **Migration Script Executed:**
   - 5 blog categories created
   - 6 team members created (incl. mentor)
   - 1 About page singleton created
   - 1 Contact page singleton created
   - 3 sample blog posts created

2. ✅ **About Page Updated:**
   - Now uses `useSanityAboutPage()` hook
   - Fetches hero, challenges, solutions, vision, mentor, team from Sanity

3. ✅ **Contact Page Updated:**
   - Now uses `useSanityContactPage()` hook
   - Fetches contact methods, business hours, social links from Sanity

4. ✅ **Studio Structure Updated:**
   - Added 📝 Blog section with Posts, Categories, Authors
   - Added About Page and Contact Page to Settings

### Phase 9: Final Integration & Testing (⏳ Next)

**Goal:** Connect remaining components to CMS and perform final testing

#### Immediate Tasks

1. **Connect Header to Navigation CMS** (1-2 hours)
   ```typescript
   // src/components/layout/Header.tsx
   import { useSanityNavigation } from '@/hooks/useSanitySiteSettings';
   
   const { menuItems } = useSanityNavigation('header-main');
   ```

2. **Connect Footer to CMS** (1-2 hours)
   - Use `useSanitySiteSettings()` for company info
   - Use `useSanityNavigation()` for footer links
   - Add social links from site settings

3. **Upload Missing Images in Sanity Studio** (30 min - manual)
   - Open Studio → Blog → Upload cover images
   - Open Studio → Authors & Team → Upload profile pictures
   - Open Studio → Settings → About Page → Upload hero/vision images

4. **Test All CMS-Managed Pages** (2-3 hours)
   - [ ] Homepage loads all sections
   - [ ] Shop page products display correctly
   - [ ] Product detail page shows all info
   - [ ] Grower profiles load with maps
   - [ ] Store locations display correctly
   - [ ] Blog posts render with categories
   - [ ] About page shows team from CMS
   - [ ] Contact page shows info from CMS
   - [ ] FAQ page works properly

5. **Mobile Responsiveness Testing** (1 hour)
   - Test all pages on mobile viewport
   - Fix any layout issues
   - Verify touch interactions work

### Verification Checklist (Phase 8-9)

- [x] Migration script run successfully
- [x] 5 blog categories in Sanity
- [x] 6 team members in Sanity
- [x] About page singleton has content
- [x] Contact page singleton has content
- [x] About page uses useSanityAboutPage hook
- [x] Contact page uses useSanityContactPage hook
- [x] Studio structure updated with Blog section
- [x] Studio structure updated with About/Contact pages
- [ ] Team member profile pictures uploaded
- [ ] Blog post cover images uploaded
- [ ] Header uses navigation from CMS
- [ ] Footer uses site settings and navigation
- [ ] All images load correctly
- [ ] Mobile responsive on all pages

---

## 📁 File Reference

### Schema Files

```
studio/src/schemaTypes/
├── index.ts                    # Exports all schemas
├── documents/
│   ├── product.ts              # 623 lines - Main product schema
│   ├── category.ts             # 106 lines - Product categories
│   ├── productVariant.ts       # Size/weight options
│   ├── productBundle.ts        # Package deals
│   ├── review.ts               # Customer reviews
│   ├── grower.ts               # Farm/grower profiles (Phase 1)
│   ├── faqCategory.ts          # FAQ categories (Phase 2)
│   ├── faqItem.ts              # FAQ questions (Phase 2)
│   ├── featureSection.ts       # Homepage features (Phase 4)
│   ├── navigation.ts           # Nav menus (Phase 5)
│   ├── store.ts                # Store locations (Phase 6)
│   ├── testimonial.ts          # Customer testimonials (Phase 7)
│   ├── banner.ts               # Promotional banners (Phase 7)
│   ├── blogCategory.ts         # Blog categories (Phase 8) ← NEW
│   ├── page.ts                 # CMS pages
│   ├── post.ts                 # Blog posts (enhanced Phase 8) ← ENHANCED
│   ├── person.ts               # Authors/Team (enhanced Phase 8) ← ENHANCED
│   ├── order.ts                # Orders
│   ├── coupon.ts               # Discounts
│   ├── promotion.ts            # Campaigns
│   ├── emailCampaign.ts        # Email marketing
│   └── analytics.ts            # Analytics
├── singletons/
│   ├── siteSettings.ts         # 541 lines - Global config (Phase 5)
│   ├── heroCarousel.ts         # Homepage hero
│   ├── featuredProducts.ts     # Featured products
│   ├── aboutPage.ts            # About page content (Phase 8) ← NEW
│   ├── contactPage.ts          # Contact page content (Phase 8) ← NEW
│   └── settings.tsx            # Legacy settings (deprecated)
└── objects/
    ├── blockContent.tsx        # Rich text
    ├── callToAction.ts         # CTA buttons
    ├── infoSection.ts          # Info blocks
    └── link.ts                 # Link objects
```

### Hook Files

```
src/hooks/
├── useSanityProducts.ts        # Products + featured products
├── useSanityCategories.ts      # Categories with product counts
├── useSanityGrowers.ts         # Growers (Phase 1)
├── useSanityFAQ.ts             # FAQs + categories (Phase 2)
├── useSanityFeatures.ts        # Feature sections (Phase 4)
├── useSanitySiteSettings.ts    # Site settings + navigation (Phase 5)
├── useSanityStores.ts          # Store locations (Phase 6)
├── useSanityTestimonials.ts    # Customer testimonials (Phase 7)
├── useSanityBanners.ts         # Promotional banners (Phase 7)
├── useSanityAboutPage.ts       # About page singleton (Phase 8) ← NEW
├── useSanityContactPage.ts     # Contact page singleton (Phase 8) ← NEW
├── useSanityHero.ts            # Hero carousel
├── useSanityBundles.ts         # Product bundles
├── useSanityVariants.ts        # Product variants
├── useSanityReviews.ts         # Reviews
├── useSanityOrders.ts          # Orders
├── useSanityInventory.ts       # Inventory
├── useSanityMarketing.ts       # Promotions/coupons
├── useSanityBlogPosts.ts       # Blog posts (comprehensive)
└── useSanityAnalytics.ts       # Analytics
```

### Component Files (Phase 7-8)

```
src/components/cms/
├── TestimonialsSection.tsx     # Testimonials carousel + cards (Phase 7)
├── BannerSection.tsx           # Banner display + 9 position exports (Phase 7)
├── SanityFeatureSection.tsx    # Feature display (Phase 4)
├── FAQSection.tsx              # FAQ accordion
└── ... other CMS components
```

### Migration Scripts

```
scripts/
├── migrate-growers-to-sanity.js      # Phase 1: 4 growers
├── migrate-faq-to-sanity.js          # Phase 2: 5 categories, 19 FAQs
├── migrate-features-to-sanity.js     # Phase 4: 2 sections, 7 features
├── migrate-site-settings-to-sanity.js # Phase 5: Settings + 5 nav menus
├── migrate-stores-to-sanity.js       # Phase 6: 4 stores
├── migrate-testimonials-to-sanity.js # Phase 7: 6 testimonials
├── migrate-banners-to-sanity.js      # Phase 7: 6 banners
├── migrate-phase8-content.js         # Phase 8: Categories, team, About, Contact ← NEW
└── check-*.js                         # Verification scripts
```
---

## 📝 Completed Phase Deliverables

### Phase 1: Growers Schema (✅ Complete)

**Files Created:**
- `studio/src/schemaTypes/documents/grower.ts` (25 fields, 6 groups)
- `src/hooks/useSanityGrowers.ts` (561 lines)
- `scripts/migrate-growers-to-sanity.js`

**Data Migrated:** 4 growers with full profiles

### Phase 2: FAQ Schema (✅ Complete)

**Files Created:**
- `studio/src/schemaTypes/documents/faqCategory.ts`
- `studio/src/schemaTypes/documents/faqItem.ts`
- `src/hooks/useSanityFAQ.ts` (470 lines)
- `scripts/migrate-faq-to-sanity.js`

**Data Migrated:** 5 categories, 19 FAQ items

### Phase 3: Category/Product Filtering Fix (✅ Complete)

**Files Modified:**
- `src/app/(shop)/shop/page.tsx` - Changed to use `category.slug`

### Phase 4: Feature Sections (✅ Complete)

**Files Created:**
- `studio/src/schemaTypes/documents/featureSection.ts` (15 fields)
- `src/hooks/useSanityFeatures.ts` (335 lines)
- `src/components/cms/SanityFeatureSection.tsx`
- `scripts/migrate-features-to-sanity.js`

**Data Migrated:** 2 feature sections, 7 features

### Phase 5: Navigation & Site Settings (✅ Complete)

**Files Created:**
- `studio/src/schemaTypes/singletons/siteSettings.ts` (541 lines, 8 groups)
- `studio/src/schemaTypes/documents/navigation.ts` (224 lines)
- Updated `src/hooks/useSanitySiteSettings.ts` (804 lines)
- `scripts/migrate-site-settings-to-sanity.js`
- Updated `studio/src/structure/index.ts`


**Data Migrated:** 
- 1 siteSettings singleton (MASH company info)
- 5 navigation menus (22 menu items total)

### Phase 7: Testimonials & Banners (✅ Complete)

**Files Created:**
- `studio/src/schemaTypes/documents/testimonial.ts` (220+ lines, 4 groups)
- `studio/src/schemaTypes/documents/banner.ts` (280+ lines, 6 groups)
- `src/hooks/useSanityTestimonials.ts` (413 lines)
- `src/hooks/useSanityBanners.ts` (390+ lines)
- `src/components/cms/TestimonialsSection.tsx`
- `src/components/cms/BannerSection.tsx`

**Data Migrated:**
- 6 customer testimonials with ratings
- 6 promotional banners with scheduling

### Phase 8: Blog & Content Pages (✅ Complete)

**Files Created:**
- `studio/src/schemaTypes/documents/blogCategory.ts` (145 lines)
- `studio/src/schemaTypes/singletons/aboutPage.ts` (280+ lines)
- `studio/src/schemaTypes/singletons/contactPage.ts` (280+ lines)
- `src/hooks/useSanityAboutPage.ts` (400+ lines)
- `src/hooks/useSanityContactPage.ts` (400+ lines)
- `scripts/migrate-phase8-content.js` (564 lines)

**Files Enhanced:**
- `studio/src/schemaTypes/documents/post.ts` (105→304 lines)
- `studio/src/schemaTypes/documents/person.ts` (73→284 lines)
- `studio/src/schemaTypes/index.ts` (added blogCategory, aboutPage, contactPage)

**Data to Migrate (run script):**
- 5 blog categories (Recipes, Growing Tips, Health Benefits, etc.)
- 7 team members (Kevin, Irheil Mae, Catherine, Jin, Kenneth, Emannuel, Ronan)
- 1 aboutPage singleton (hero, challenges, solutions, vision, mentor, team)
- 1 contactPage singleton (methods, hours, location, form settings)

---

**Document Version:** 6.0  
**Last Updated:** November 28, 2025  
**Author:** AI Assistant (GitHub Copilot)  
**Project:** MASH Mushroom E-Commerce Platform

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| 6.0 | Nov 28, 2025 | Fixed Shop page cache bug, added Phase 11 (Meet Our Growers on Store Pages), comprehensive schema updates for grower-store linking |
| 5.0 | Nov 28, 2025 | Fixed About page error, added team members to Sanity, comprehensive improvements list, Phase 9/10 planning |
| 4.0 | Nov 28, 2025 | Phase 8 complete: Blog categories, About/Contact singletons, enhanced post.ts & person.ts |
| 3.0 | Nov 27, 2025 | Phase 7 complete: Testimonials & Banners, E-Commerce Flow section, Schema improvements list |
| 2.1 | Nov 27, 2025 | Phase 6 complete: Store/Location Pages |
| 2.0 | Nov 27, 2025 | Phase 5 complete: Site Settings & Navigation |
| 1.5 | Nov 26, 2025 | Phase 4 complete: Feature Sections |
| 1.0 | Nov 25, 2025 | Initial document: Phases 1-3 |

---

## 🔴 COMPREHENSIVE IMPROVEMENTS LIST

This section lists all identified issues and improvements organized by priority and category.

### 🚨 CRITICAL (Must Fix Before Launch)

| # | Issue | Category | Impact | Solution | Est. Time |
|---|-------|----------|--------|----------|-----------|
| 1 | About page team not showing | Bug | ✅ FIXED | Fixed data transformation in page.tsx | Done |
| 2 | Products not showing proper images | Content | Users see placeholders | Upload images in Sanity Studio | 1 hr manual |
| 3 | Categories not filtering correctly | Bug | Shop page broken | Verify category slugs match | 30 min |
| 4 | Header/Footer not using CMS | Integration | Can't update nav from CMS | Connect to useSanityNavigation | 2 hrs |

### 🟠 HIGH PRIORITY (Phase 9)

| # | Issue | Category | Impact | Solution | Est. Time |
|---|-------|----------|--------|----------|-----------|
| 5 | Growers not linked to Stores | Schema | Can't find grower's store | Add growers[] to store.ts | 2 hrs |
| 6 | Missing team member photos | Content | About page incomplete | Upload photos in Sanity | 30 min |
| 7 | Blog posts need cover images | Content | Blog looks empty | Upload images in Sanity | 30 min |
| 8 | Announcement bar not connected | Integration | Can't update site-wide alerts | Use siteSettings.announcementBar | 1 hr |
| 9 | Missing product variants display | Feature | Can't select sizes | Update product detail page | 3 hrs |

### 🟡 MEDIUM PRIORITY (Phase 10)

| # | Issue | Category | Impact | Solution | Est. Time |
|---|-------|----------|--------|----------|-----------|
| 10 | Product tags not searchable | Schema | Limited discovery | Create productTag schema | 3 hrs |
| 11 | Bundle savings not calculated | Feature | Manual entry needed | Add auto-calculate helper | 2 hrs |
| 12 | Reviews not connected to products | Integration | No social proof | Link useSanityReviews to product | 2 hrs |
| 13 | Missing nutritional info display | Feature | Health info hidden | Add nutrition section to product page | 2 hrs |
| 14 | Lalamove integration incomplete | Feature | No same-day delivery | Complete delivery integration | 8 hrs |

### 🟢 LOW PRIORITY (Future)

| # | Issue | Category | Impact | Solution | Est. Time |
|---|-------|----------|--------|----------|-----------|
| 15 | Analytics dashboard | Feature | No insights | Build admin analytics page | 5 hrs |
| 16 | Recipe ideas on products | Content | Less engagement | Add recipe section to product | 3 hrs |
| 17 | Wishlist functionality | Feature | Can't save products | Implement wishlist with Sanity | 4 hrs |
| 18 | Customer reviews form | Feature | Can't collect reviews | Add review submission form | 3 hrs |
| 19 | Newsletter integration | Feature | Can't collect emails | Connect form to email service | 2 hrs |
| 20 | Search functionality | Feature | Can't search products | Implement Sanity search | 4 hrs |

---

## 📊 CURRENT SANITY STUDIO LAYOUT

This is how the Sanity Studio is organized at http://localhost:3333:

```
📁 SANITY STUDIO (xyq5fhxs)
│
├── 🛒 E-COMMERCE
│   ├── 📦 Products (18 products)
│   │   └── Fresh Oyster, Shiitake, Lion's Mane, Growing Kits, etc.
│   ├── 📂 Categories (6 categories)
│   │   └── Fresh Mushrooms, Dried Mushrooms, Growing Kits, Bundles, Accessories, Specialty
│   ├── 📐 Product Variants (size/weight options)
│   ├── 🎁 Product Bundles (package deals)
│   └── ⭐ Featured Products (singleton - homepage display)
│
├── 👨‍🌾 GROWERS & FARMS
│   └── 🌾 Growers (4 grower profiles)
│       └── JM Mushroom Farm, Verde Farm, Happy Spore Farm, Novaliches Shroom
│
├── 🏪 STORES & LOCATIONS
│   └── 📍 Stores (4 locations)
│       └── Main Store, Pickup Points, Partner Stores, Distribution Center
│
├── 📝 BLOG (Phase 8)
│   ├── 📰 Posts (3 sample posts)
│   ├── 🏷️ Categories (5 categories)
│   │   └── Recipes, Growing Tips, Health & Nutrition, News, Community
│   └── 👤 Authors & Team (8 persons)
│       └── Kevin, Irheil Mae, Catherine, Jin, Kenneth, Emannuel, Ronan + Joemen (Mentor)
│
├── 📣 MARKETING
│   ├── ⭐ Testimonials (6 testimonials)
│   ├── 🎨 Banners (6 banners across 9 positions)
│   ├── 🎟️ Coupons (discount codes)
│   └── 📢 Promotions (marketing campaigns)
│
├── ❓ FAQ
│   ├── 📋 FAQ Categories (5 categories)
│   │   └── General, Ordering, Delivery, Products, Growing
│   └── ❔ FAQ Items (19 questions)
│
├── ⚙️ SETTINGS
│   ├── 🌐 Site Settings (singleton - company info, contact, social)
│   ├── 🔗 Navigation (5 menus)
│   │   └── header-main, header-secondary, footer-shop, footer-support, footer-about
│   ├── ✨ Feature Sections (2 sections - Why MASH)
│   ├── 🏠 Hero Carousel (singleton - homepage slider)
│   ├── 📄 About Page (singleton - team, vision, challenges)
│   └── 📞 Contact Page (singleton - hours, location, form)
│
└── 📊 OTHER
    ├── 📄 Pages (CMS pages)
    ├── 📧 Email Campaigns
    ├── 📈 Analytics
    └── 🛍️ Orders
```

---

## 🔄 DATA FLOW: Website to CMS

### How Each Page Gets Its Data

| Page | URL | Sanity Data Sources | Hook(s) Used |
|------|-----|---------------------|--------------|
| **Homepage** | `/` | heroCarousel, featuredProducts, categories, growers, testimonials, features | `useSanityHero`, `useSanityFeaturedProducts`, `useSanityCategories`, `useSanityGrowers`, `useSanityTestimonials`, `useSanityFeatures` |
| **Shop** | `/shop` | products, categories, banners | `useSanityProducts`, `useSanityCategories`, `useSanityBanners` |
| **Product Detail** | `/product/[slug]` | product, variants, reviews, suggestedProducts | `useSanityProduct`, `useSanityVariants`, `useSanityReviews` |
| **Grower List** | `/grower` | growers | `useSanityGrowers` |
| **Grower Detail** | `/grower/[id]` | grower (single) | `useSanityGrower(id)` |
| **Store List** | `/stores` | stores | `useSanityStores` |
| **Store Detail** | `/stores/[slug]` | store (single) | `useSanityStore(slug)` |
| **FAQ** | `/faq` | faqCategories, faqItems | `useSanityFAQs` |
| **About** | `/about` | aboutPage singleton, persons (team) | `useSanityAboutPage` |
| **Contact** | `/contact` | contactPage singleton | `useSanityContactPage` |
| **Blog List** | `/blog` | posts, blogCategories | `useSanityBlogPosts` |
| **Blog Post** | `/blog/[slug]` | post (single), author | `useSanityBlogPost(slug)` |
| **Header** | (all pages) | siteSettings, navigation | `useSanitySiteSettings`, `useSanityNavigation` |
| **Footer** | (all pages) | siteSettings, navigation | `useSanitySiteSettings`, `useSanityNavigation` |

---

## 🛠️ PHASE 9: FINAL INTEGRATION & TESTING

### Status: 🔄 IN PROGRESS (30%)

**Goal:** Connect all remaining components to CMS and verify everything works

### Task Checklist

#### 9.1 Header & Footer CMS Connection (Priority: HIGH)

- [ ] **Header Navigation**
  - File: `src/components/layout/Header.tsx`
  - Connect to `useSanityNavigation('header-main')`
  - Add logo from `useSanitySiteSettings()`
  - Add announcement bar from site settings

- [ ] **Footer Integration**
  - File: `src/components/layout/Footer.tsx`
  - Connect to `useSanitySiteSettings()` for company info
  - Connect to `useSanityNavigation('footer-shop')` etc.
  - Add social links from site settings

#### 9.2 About Page Final Fixes (Priority: HIGH) ✅ PARTIALLY DONE

- [x] Fix `challenges.challenges is undefined` error
- [x] Add default team data as fallback
- [x] Transform data correctly for CMSAboutSection
- [ ] Upload team member photos in Sanity Studio
- [ ] Link mentor (Joemen Barrios) to about page
- [ ] Add challenges content in Sanity

#### 9.3 Content Upload in Sanity Studio (Priority: MEDIUM)

- [ ] **Team Photos** - Upload profile pictures for all 8 team members
- [ ] **Blog Images** - Upload cover images for 3 blog posts
- [ ] **Product Images** - Ensure all 18 products have proper images
- [ ] **Category Images** - Upload images for all 6 categories
- [ ] **Grower Images** - Verify all 4 growers have farm photos

#### 9.4 Feature Testing (Priority: HIGH)

- [ ] **Homepage Sections**
  - [ ] Hero carousel slides correctly
  - [ ] Featured products show correct items
  - [ ] Categories display with images
  - [ ] Features section (Why MASH) renders
  - [ ] Growers section shows farms
  - [ ] Testimonials carousel works

- [ ] **Shop Page**
  - [ ] Products load from Sanity
  - [ ] Category filtering works
  - [ ] Price filtering works
  - [ ] Sort options work
  - [ ] Pagination works

- [ ] **Product Detail Page**
  - [ ] Main image displays
  - [ ] Gallery works
  - [ ] Variants selectable
  - [ ] Add to cart works
  - [ ] Related products show

- [ ] **Other Pages**
  - [ ] FAQ accordion works
  - [ ] About page shows team
  - [ ] Contact page shows info
  - [ ] Blog posts render
  - [ ] Store locations display

#### 9.5 Mobile Responsiveness (Priority: MEDIUM)

- [ ] Homepage on mobile
- [ ] Shop page on mobile
- [ ] Product detail on mobile
- [ ] Navigation menu on mobile
- [ ] Footer on mobile

---

## 🛠️ PHASE 10: GROWER-STORE LINKING & ENHANCEMENTS

### Status: ⏳ PENDING

**Goal:** Connect growers to stores and add missing features

### Task Checklist

#### 10.1 Grower-Store Linking (Priority: HIGH)

**Problem:** Growers and Stores are separate with no connection

**Solution:**

1. **Update Store Schema** (`studio/src/schemaTypes/documents/store.ts`)
   ```typescript
   defineField({
     name: 'growers',
     title: 'Associated Growers',
     description: 'Growers whose products are available at this store',
     type: 'array',
     of: [{ type: 'reference', to: [{ type: 'grower' }] }],
     group: 'growers',
   }),
   ```

2. **Update Grower Schema** (`studio/src/schemaTypes/documents/grower.ts`)
   ```typescript
   defineField({
     name: 'stores',
     title: 'Available At Stores',
     description: 'Stores where this grower\'s products can be purchased',
     type: 'array',
     of: [{ type: 'reference', to: [{ type: 'store' }] }],
     group: 'business',
   }),
   ```

3. **Update Store Detail Page** - Show "Meet Our Growers" section
4. **Update Grower Detail Page** - Show "Find Products At" section

#### 10.2 Product Tag Enhancement (Priority: MEDIUM)

**Problem:** `productTags` is just `string[]`, not searchable

**Solution:** Create dedicated `productTag` schema

```typescript
// studio/src/schemaTypes/documents/productTag.ts
export const productTag = defineType({
  name: 'productTag',
  title: 'Product Tag',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'slug', type: 'slug' }),
    defineField({ name: 'color', type: 'string', options: { list: ['green', 'blue', 'purple', 'orange', 'red'] } }),
    defineField({ name: 'icon', type: 'string' }),
    defineField({ name: 'description', type: 'text' }),
  ],
});
```

#### 10.3 Bundle Discount Automation (Priority: LOW)

**Problem:** Bundle savings calculated manually

**Solution:** Add helper function to `useSanityBundles.ts`
```typescript
function calculateBundleSavings(bundle: SanityBundle): number {
  const regularTotal = bundle.products.reduce((sum, p) => sum + p.price, 0);
  return regularTotal - bundle.bundlePrice;
}
```

#### 10.4 Review Integration (Priority: MEDIUM)

**Problem:** Reviews exist but not displayed on product pages

**Solution:**
1. Create `useProductReviews(productId)` hook
2. Add reviews section to product detail page
3. Show average rating on product cards

---

## 🛠️ PHASE 11: MEET OUR GROWERS ON STORE PAGES

### Status: ⏳ PENDING

**Goal:** Display associated growers on store detail pages with full profiles

### Why This Matters

Currently, stores and growers exist as separate entities. Customers visiting a store page cannot see which local farmers supply that store. This feature will:
- Build trust by showing real farmer faces
- Highlight local partnerships
- Create a complete farm-to-store narrative
- Improve SEO with rich content

### Implementation Checklist

#### 11.1 Schema Updates (Priority: HIGH)

**1. Add `growers[]` to Store Schema**

File: `studio/src/schemaTypes/documents/store.ts`

```typescript
// Add new group for growers
groups: [
  // ... existing groups
  { name: 'growers', title: 'Growers & Partners', icon: Leaf },
],

// Add growers field after products section
defineField({
  name: 'growers',
  title: 'Featured Growers',
  description: 'Growers whose products are available at this store',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'grower' }],
    },
  ],
  group: 'growers',
  validation: (Rule) => Rule.max(8).unique(),
}),

defineField({
  name: 'showGrowersSection',
  title: 'Show Meet Our Growers Section',
  description: 'Display the growers section on the store page',
  type: 'boolean',
  initialValue: true,
  group: 'growers',
}),

defineField({
  name: 'growersSectionTitle',
  title: 'Growers Section Title',
  description: 'Custom title for the growers section',
  type: 'string',
  initialValue: 'Meet Our Growers',
  placeholder: 'Meet Our Growers',
  group: 'growers',
}),

defineField({
  name: 'growersSectionSubtitle',
  title: 'Growers Section Subtitle',
  type: 'text',
  rows: 2,
  initialValue: 'Get to know the passionate farmers who grow the fresh mushrooms available at our store.',
  group: 'growers',
}),
```

**2. Add `stores[]` to Grower Schema (Bidirectional)**

File: `studio/src/schemaTypes/documents/grower.ts`

```typescript
// Add to business group
defineField({
  name: 'availableAtStores',
  title: 'Available At Stores',
  description: 'Stores where products from this grower are sold',
  type: 'array',
  of: [
    {
      type: 'reference',
      to: [{ type: 'store' }],
    },
  ],
  group: 'business',
}),
```

#### 11.2 Hook Updates (Priority: HIGH)

**1. Update `useSanityStores.ts`**

Add growers expansion to GROQ query:

```typescript
const STORE_QUERY = groq`
  *[_type == "store" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    // ... existing fields
    
    // Growers section
    showGrowersSection,
    growersSectionTitle,
    growersSectionSubtitle,
    growers[]-> {
      _id,
      name,
      slug,
      farmName,
      "image": image.asset->url,
      shortBio,
      specialty,
      certifications[],
      location {
        city,
        province
      },
      products[]-> {
        _id,
        name,
        slug,
        "image": image.asset->url,
        price
      }
    }
  }
`;
```

**2. Add Types**

File: `src/types/sanity.ts`

```typescript
export interface StoreGrowerInfo {
  _id: string;
  name: string;
  slug: { current: string };
  farmName: string;
  image: string | null;
  shortBio: string;
  specialty: string[];
  certifications: string[];
  location: {
    city: string;
    province: string;
  };
  products: Array<{
    _id: string;
    name: string;
    slug: { current: string };
    image: string | null;
    price: number;
  }>;
}

export interface SanityStore {
  // ... existing fields
  showGrowersSection: boolean;
  growersSectionTitle: string;
  growersSectionSubtitle: string;
  growers: StoreGrowerInfo[];
}
```

#### 11.3 Component Creation (Priority: HIGH)

**1. Create `MeetOurGrowers.tsx`**

File: `src/components/cms/MeetOurGrowers.tsx`

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Award, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { StoreGrowerInfo } from '@/types/sanity';

interface MeetOurGrowersProps {
  title?: string;
  subtitle?: string;
  growers: StoreGrowerInfo[];
  showProducts?: boolean;
  maxGrowers?: number;
}

export function MeetOurGrowers({
  title = 'Meet Our Growers',
  subtitle,
  growers,
  showProducts = true,
  maxGrowers = 4,
}: MeetOurGrowersProps) {
  const displayedGrowers = growers.slice(0, maxGrowers);

  if (!growers.length) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-dark mb-2">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Growers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedGrowers.map((grower) => (
            <Card key={grower._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Grower Image */}
              <div className="relative h-48 bg-muted">
                {grower.image ? (
                  <Image
                    src={grower.image}
                    alt={grower.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-4xl">👨‍🌾</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Grower Info */}
                <h3 className="font-semibold text-lg mb-1">{grower.name}</h3>
                <p className="text-sm text-primary-medium mb-2">{grower.farmName}</p>
                
                {/* Location */}
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {grower.location?.city}, {grower.location?.province}
                </div>

                {/* Short Bio */}
                {grower.shortBio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {grower.shortBio}
                  </p>
                )}

                {/* Certifications */}
                {grower.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {grower.certifications.slice(0, 2).map((cert) => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Products Preview */}
                {showProducts && grower.products?.length > 0 && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Available Products:
                    </p>
                    <div className="flex gap-1 overflow-hidden">
                      {grower.products.slice(0, 3).map((product) => (
                        <Link
                          key={product._id}
                          href={`/product/${product.slug?.current || product._id}`}
                          className="relative w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 hover:ring-2 ring-primary"
                        >
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-xs">🍄</span>
                          )}
                        </Link>
                      ))}
                      {grower.products.length > 3 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{grower.products.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* View Profile Link */}
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href={`/grower/${grower.slug?.current || grower._id}`}>
                    View Farm Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        {growers.length > maxGrowers && (
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/grower">
                View All {growers.length} Growers
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default MeetOurGrowers;
```

#### 11.4 Store Page Integration (Priority: HIGH)

**Update Store Detail Page**

File: `src/app/(shop)/stores/[slug]/page.tsx`

```tsx
import { MeetOurGrowers } from '@/components/cms/MeetOurGrowers';

export default async function StoreDetailPage({ params }) {
  const store = await getStore(params.slug);

  return (
    <div>
      {/* ... existing store info sections */}

      {/* Meet Our Growers Section */}
      {store.showGrowersSection && store.growers?.length > 0 && (
        <MeetOurGrowers
          title={store.growersSectionTitle}
          subtitle={store.growersSectionSubtitle}
          growers={store.growers}
          showProducts={true}
          maxGrowers={4}
        />
      )}

      {/* ... rest of page */}
    </div>
  );
}
```

#### 11.5 Data Migration (Priority: MEDIUM)

**Create Migration Script**

File: `scripts/link-growers-to-stores.js`

```javascript
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'xyq5fhxs',
  dataset: 'production',
  apiVersion: '2024-11-26',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Map growers to stores based on location
const growerStoreMapping = {
  // JM Mushroom Farm -> Main Store + Novaliches Pickup
  'jm-mushroom-farm': ['main-store', 'novaliches-pickup'],
  // Verde Farm -> Main Store + Caloocan Hub
  'verde-farm': ['main-store', 'caloocan-hub'],
  // Happy Spore Farm -> All stores
  'happy-spore-farm': ['main-store', 'novaliches-pickup', 'caloocan-hub', 'qc-distribution'],
  // Novaliches Shroom -> Novaliches Pickup + Main Store
  'novaliches-shroom': ['novaliches-pickup', 'main-store'],
};

async function linkGrowersToStores() {
  for (const [growerSlug, storeSlugs] of Object.entries(growerStoreMapping)) {
    // Find grower
    const grower = await client.fetch(
      `*[_type == "grower" && slug.current == $slug][0]`,
      { slug: growerSlug }
    );

    // Find stores
    const stores = await client.fetch(
      `*[_type == "store" && slug.current in $slugs]`,
      { slugs: storeSlugs }
    );

    // Update each store to include this grower
    for (const store of stores) {
      await client.patch(store._id)
        .setIfMissing({ growers: [] })
        .append('growers', [{ _type: 'reference', _ref: grower._id }])
        .commit();
      
      console.log(`✅ Linked ${grower.name} to ${store.name}`);
    }
  }

  console.log('\\n🎉 All growers linked to stores!');
}

linkGrowersToStores().catch(console.error);
```

**Run:** `node scripts/link-growers-to-stores.js`

### Phase 11 Testing Checklist

- [ ] Store schema updated with `growers[]` field
- [ ] Grower schema updated with `availableAtStores[]` field
- [ ] `useSanityStores.ts` expands grower references
- [ ] `StoreGrowerInfo` type added to `sanity.ts`
- [ ] `MeetOurGrowers.tsx` component created
- [ ] Store detail page shows growers section
- [ ] Grower cards display correctly
- [ ] Product thumbnails link to product pages
- [ ] "View Farm Profile" links work
- [ ] Migration script run successfully
- [ ] Bidirectional links verified in Studio

### Expected Outcome

After Phase 11:
- **Store Pages** show "Meet Our Growers" section with 1-4 grower cards
- Each card shows: Photo, Name, Farm Name, Location, Short Bio, Certifications, Product Thumbnails
- Clicking "View Farm Profile" goes to `/grower/[slug]`
- Clicking product thumbnail goes to `/product/[slug]`
- Store operators can manage which growers appear via Sanity Studio

---

## 📝 QUICK REFERENCE: Common Tasks

### How to Add a New Product

1. Open Sanity Studio: `cd studio && npm run dev` → http://localhost:3333
2. Click **E-Commerce** → **Products** → **+ Create**
3. Fill required fields: Name, Slug, Image, Price, Category
4. Add optional: Description, Variants, Tags, Freshness Info
5. Click **Publish** (green button)
6. Product appears on website within 5 minutes (CDN cache)

### How to Update Team Members

1. Open Sanity Studio → **Blog** → **Authors & Team**
2. Select team member to edit
3. Update info (name, role, bio, photo)
4. Click **Publish**
5. About page updates automatically

### How to Create a Banner

1. Open Sanity Studio → **Marketing** → **Banners** → **+ Create**
2. Set position (e.g., `homepage-top`, `shop-top`, `announcement`)
3. Add headline, image, CTA button
4. Set start/end dates for scheduling
5. Toggle `isActive: true`
6. Click **Publish**

### How to Add FAQ

1. Open Sanity Studio → **FAQ** → **FAQ Items** → **+ Create**
2. Select category (General, Ordering, etc.)
3. Enter question and answer (rich text)
4. Set display order
5. Click **Publish**

---

## 📁 KEY FILES REFERENCE

### Schema Files (Sanity Studio)

| File | Lines | Purpose |
|------|-------|---------|
| `studio/src/schemaTypes/documents/product.ts` | 623 | Main product schema (30+ fields) |
| `studio/src/schemaTypes/documents/grower.ts` | 380 | Grower/farm profiles (25 fields) |
| `studio/src/schemaTypes/documents/store.ts` | 450 | Store locations (25+ fields) |
| `studio/src/schemaTypes/documents/testimonial.ts` | 220 | Customer testimonials |
| `studio/src/schemaTypes/documents/banner.ts` | 280 | Promotional banners |
| `studio/src/schemaTypes/documents/post.ts` | 304 | Blog posts |
| `studio/src/schemaTypes/documents/person.ts` | 284 | Team/authors |
| `studio/src/schemaTypes/singletons/siteSettings.ts` | 541 | Global site config |
| `studio/src/schemaTypes/singletons/aboutPage.ts` | 280 | About page content |
| `studio/src/schemaTypes/singletons/contactPage.ts` | 280 | Contact page content |

### React Hooks (Data Fetching)

| File | Lines | Purpose |
|------|-------|---------|
| `src/hooks/useSanityProducts.ts` | 450+ | Products, featured, bundles |
| `src/hooks/useSanityGrowers.ts` | 561 | Grower profiles |
| `src/hooks/useSanityStores.ts` | 400+ | Store locations |
| `src/hooks/useSanityFAQ.ts` | 470 | FAQs with categories |
| `src/hooks/useSanityFeatures.ts` | 335 | Feature sections |
| `src/hooks/useSanitySiteSettings.ts` | 804 | Site settings + navigation |
| `src/hooks/useSanityTestimonials.ts` | 413 | Customer testimonials |
| `src/hooks/useSanityBanners.ts` | 477 | Promotional banners |
| `src/hooks/useSanityAboutPage.ts` | 500 | About page singleton |
| `src/hooks/useSanityContactPage.ts` | 503 | Contact page singleton |
| `src/hooks/useSanityBlogPosts.ts` | 400+ | Blog posts |
| `src/hooks/useSanityHero.ts` | 152 | Hero carousel |

### Migration Scripts

| Script | Purpose |
|--------|---------|
| `scripts/migrate-growers-to-sanity.js` | 4 grower profiles |
| `scripts/migrate-faq-to-sanity.js` | 5 categories, 19 FAQs |
| `scripts/migrate-features-to-sanity.js` | 2 feature sections |
| `scripts/migrate-site-settings-to-sanity.js` | Site settings + 5 navs |
| `scripts/migrate-stores-to-sanity.js` | 4 store locations |
| `scripts/migrate-testimonials-to-sanity.js` | 6 testimonials |
| `scripts/migrate-banners-to-sanity.js` | 6 banners |
| `scripts/migrate-phase8-content.js` | Blog, team, About, Contact |
| `scripts/update-team-members.js` | Correct team member names |

---

**END OF DOCUMENT**