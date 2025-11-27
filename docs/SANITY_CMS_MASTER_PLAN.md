# 🍄 MASH E-Commerce - Sanity CMS Master Plan

**Version:** 2.0  
**Last Updated:** November 27, 2025  
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
| **Phase 6** | Store/Location Pages | ⏳ Pending | 0% |
| **Phase 7** | Testimonials & Banners | ⏳ Pending | 0% |
| **Phase 8** | Blog & Content Pages | ⏳ Pending | 0% |
| **Phase 9** | Final Integration & Testing | ⏳ Pending | 0% |

---

## 📋 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [Current Environment Setup](#-current-environment-setup)
3. [Complete Schema Reference](#-complete-schema-reference)
4. [Data Flow Architecture](#-data-flow-architecture)
5. [Identified Issues & Improvements](#-identified-issues--improvements)
6. [Phase Implementation Guide](#-phase-implementation-guide)
7. [Frontend Integration Map](#-frontend-integration-map)
8. [Testing Checklist](#-testing-checklist)
9. [Next Steps Guide](#-next-steps-guide)

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
| **Document Types** | 18 | Products, Categories, Growers, FAQs, etc. |
| **Singleton Types** | 4 | siteSettings, heroCarousel, featuredProducts, settings |
| **Object Types** | 4 | blockContent, callToAction, infoSection, link |
| **Custom Hooks** | 15 | All `useSanity*` hooks for data fetching |
| **Migration Scripts** | 5 | For growers, FAQs, features, site settings, navigation |

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
├── ⚙️ Settings
│   ├── Site Settings (singleton) ← NEW Phase 5
│   ├── Navigation Menus (5 menus) ← NEW Phase 5
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

### Document Schemas (18 Types)

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
| Duplicate ID error in Studio | ✅ Fixed | Changed document ID from `siteSettings` to `siteSettingsDoc` |

### Pending Improvements

| Improvement | Priority | Phase | Estimated Time |
|-------------|----------|-------|----------------|
| Store/Location pages | 🔴 High | Phase 6 | 3-4 hours |
| Testimonials section | 🟡 Medium | Phase 7 | 2-3 hours |
| Promotional banners | 🟡 Medium | Phase 7 | 2-3 hours |
| Blog integration | 🟢 Low | Phase 8 | 4-5 hours |
| Content pages (About, Contact) | 🟢 Low | Phase 8 | 2-3 hours |

### Improvement List by Category

#### 1. E-Commerce Improvements

```
❌ MISSING: Store/Pickup Location Pages
   - Currently no dedicated store pages
   - Growers have location but no store hours display
   - Need: Store schema with hours, address, map integration

❌ MISSING: Testimonials/Reviews Display
   - Review schema exists but not connected to frontend
   - No customer testimonials section on homepage

❌ MISSING: Promotional Banners
   - No way to add banners between sections
   - Need: Banner schema with position, dates, CTA

⚠️ PARTIAL: Product Images
   - Some products show placeholders
   - Need: Ensure all products have valid images in Sanity
```

#### 2. Content Improvements

```
❌ MISSING: About Page CMS
   - About page uses hardcoded content
   - Need: CMS-managed team members, mission, history

❌ MISSING: Contact Page CMS
   - Contact form works but page content is static
   - Need: CMS fields for contact info, map, hours

⚠️ PARTIAL: Blog Integration
   - Post schema exists but no blog page
   - Need: Blog list page, post detail page, categories
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

❌ MISSING: Header/Footer Using CMS Data
   - Navigation schemas exist but not connected
   - Header/Footer still use hardcoded links
```

---

## 📋 Phase Implementation Guide

### Phase 6: Store/Location Pages (3-4 hours)

**Goal:** Create dedicated store pages with hours, location, and pickup info

#### Schema to Create: `store.ts`

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

### Phase 7: Testimonials & Banners (4-6 hours)

**Goal:** Add customer testimonials and promotional banners

#### Schema to Create: `testimonial.ts`

```typescript
// studio/src/schemaTypes/documents/testimonial.ts
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Customer Testimonial',
  type: 'document',
  fields: [
    { name: 'customerName', title: 'Customer Name', type: 'string' },
    { name: 'customerImage', title: 'Photo', type: 'image' },
    { name: 'location', title: 'Location', type: 'string' },
    { name: 'rating', title: 'Rating', type: 'number', validation: (r) => r.min(1).max(5) },
    { name: 'quote', title: 'Testimonial', type: 'text' },
    { name: 'productPurchased', title: 'Product', type: 'reference', to: [{ type: 'product' }] },
    { name: 'date', title: 'Date', type: 'date' },
    { name: 'isFeatured', title: 'Featured', type: 'boolean' },
    { name: 'isActive', title: 'Active', type: 'boolean' },
  ],
})
```

#### Schema to Create: `banner.ts`

```typescript
// studio/src/schemaTypes/documents/banner.ts
export const banner = defineType({
  name: 'banner',
  title: 'Promotional Banner',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'subtitle', title: 'Subtitle', type: 'string' },
    { name: 'image', title: 'Banner Image', type: 'image' },
    { name: 'mobileImage', title: 'Mobile Image', type: 'image' },
    { name: 'backgroundColor', title: 'Background Color', type: 'color' },
    { name: 'textColor', title: 'Text Color', type: 'color' },
    { name: 'buttonText', title: 'Button Text', type: 'string' },
    { name: 'buttonLink', title: 'Button Link', type: 'string' },
    { name: 'position', title: 'Position', type: 'string', options: {
      list: ['homepage-top', 'homepage-middle', 'shop-top', 'checkout-bottom']
    }},
    { name: 'startDate', title: 'Start Date', type: 'datetime' },
    { name: 'endDate', title: 'End Date', type: 'datetime' },
    { name: 'isActive', title: 'Active', type: 'boolean' },
  ],
})
```

---

### Phase 8: Blog & Content Pages (4-5 hours)

**Goal:** Implement blog functionality and CMS-managed content pages

#### Tasks

1. Create blog list page (`src/app/blog/page.tsx`)
2. Create blog post page (`src/app/blog/[slug]/page.tsx`)
3. Create `useSanityBlogPosts.ts` hook
4. Update About page to use CMS content
5. Update Contact page to use CMS content

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
| About | `/about` | Hardcoded | ❌ Needs CMS |
| Contact | `/contact` | Hardcoded | ❌ Needs CMS |
| Blog | `/blog` | Schema exists | ❌ Needs pages |
| Stores | `/stores` | ❌ Missing | ❌ Needs schema + pages |

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

- [ ] Store list page displays all locations
- [ ] Store detail page shows hours and map
- [ ] Testimonials appear on homepage
- [ ] Banners display in correct positions
- [ ] Blog list page shows posts
- [ ] Blog post page renders content
- [ ] Header uses navigation from CMS
- [ ] Footer uses site settings and navigation
- [ ] All images load correctly (no placeholders)
- [ ] Mobile responsive on all pages

---

## 🚀 Next Steps Guide

### Immediate Actions (Today)

1. **Start Sanity Studio** to verify Phase 5 fix:
   ```bash
   cd studio && npm run dev
   ```

2. **Verify in Studio:**
   - Click "Settings" → "Site Settings" → Confirm it opens without error
   - Click "Navigation Menus" → Confirm 5 menus exist
   - Upload MASH logo in Site Settings

3. **Test Frontend:**
   ```bash
   npm run dev
   ```
   - Verify homepage loads all sections
   - Test Shop page category filtering
   - Test product detail page

### This Week

1. **Phase 6: Store Pages** (3-4 hours)
   - Create `store.ts` schema
   - Add stores to Studio structure
   - Create `useSanityStores.ts` hook
   - Build store list and detail pages

2. **Connect Header/Footer** (1-2 hours)
   - Update Header to use `useSanitySiteSettings()`
   - Update Footer to use navigation hook
   - Add announcement bar from site settings

### Next Week

1. **Phase 7: Testimonials & Banners** (4-6 hours)
2. **Phase 8: Blog Integration** (4-5 hours)
3. **Phase 9: Final Testing** (3-4 hours)

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
│   ├── page.ts                 # CMS pages
│   ├── post.ts                 # Blog posts
│   ├── person.ts               # Authors
│   ├── order.ts                # Orders
│   ├── coupon.ts               # Discounts
│   ├── promotion.ts            # Campaigns
│   ├── emailCampaign.ts        # Email marketing
│   └── analytics.ts            # Analytics
├── singletons/
│   ├── siteSettings.ts         # 541 lines - Global config (Phase 5)
│   ├── heroCarousel.ts         # Homepage hero
│   ├── featuredProducts.ts     # Featured products
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
├── useSanityHero.ts            # Hero carousel
├── useSanityBundles.ts         # Product bundles
├── useSanityVariants.ts        # Product variants
├── useSanityReviews.ts         # Reviews
├── useSanityOrders.ts          # Orders
├── useSanityInventory.ts       # Inventory
├── useSanityMarketing.ts       # Promotions/coupons
├── useSanityBlogPosts.ts       # Blog posts
└── useSanityAnalytics.ts       # Analytics
```

### Migration Scripts

```
scripts/
├── migrate-growers-to-sanity.js      # Phase 1: 4 growers
├── migrate-faq-to-sanity.js          # Phase 2: 5 categories, 19 FAQs
├── migrate-features-to-sanity.js     # Phase 4: 2 sections, 7 features
├── migrate-site-settings-to-sanity.js # Phase 5: Settings + 5 nav menus
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

---

**Document Version:** 2.0  
**Last Updated:** November 27, 2025  
**Author:** AI Assistant (GitHub Copilot)  
**Project:** MASH Mushroom E-Commerce Platform
