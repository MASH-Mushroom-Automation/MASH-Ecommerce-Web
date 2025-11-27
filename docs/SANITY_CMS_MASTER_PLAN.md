# 🍄 MASH E-Commerce - Sanity CMS Master Plan

**Version:** 1.4  
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
| Phase 6 | Testimonials & Banners | ⏳ Pending | 0% |
| Phase 7 | Final Integration & Testing | ⏳ Pending | 0% |

### Phase 1 Deliverables ✅
- [x] Created `studio/src/schemaTypes/documents/grower.ts` (20+ fields, 6 groups)
- [x] Updated schema index and studio structure
- [x] Created `src/hooks/useSanityGrowers.ts`
- [x] Migrated 4 growers to Sanity (via `scripts/migrate-growers-to-sanity.js`)
- [x] Updated homepage FeaturedGrowersSection

### Phase 1.5 Deliverables ✅ (Image & Maps Fix)
- [x] Fixed GROQ queries to use `logo.asset->url` instead of `image.asset->url`
- [x] Added `coverImage` field to grower schema for banner images
- [x] Created `src/components/maps/GoogleMap.tsx` with @googlemaps/js-api-loader
- [x] Configured Google Maps API key in `.env.local`
- [x] Updated grower detail page with GoogleMap component and operating hours

### Phase 2 Deliverables ✅
- [x] Created `studio/src/schemaTypes/documents/faqCategory.ts`
- [x] Created `studio/src/schemaTypes/documents/faqItem.ts`
- [x] Updated schema index and studio structure
- [x] Created `src/hooks/useSanityFAQ.ts` (5 hooks + API functions)
- [x] Updated FAQ page to use Sanity hook
- [x] Migrated 5 categories + 19 FAQ items to Sanity

### Phase 3 Deliverables ✅ (Category/Product Filtering Fix)
- [x] Fixed Shop page to use category SLUG for filtering instead of category NAME
- [x] Updated `toggleCategory()` to track slugs (e.g., "fresh-mushrooms")
- [x] Category checkboxes now display `category.name` but use `category.slug` for filtering
- [x] Fixed both desktop and mobile filter sidebars
- [x] GROQ query `category->slug.current == "${filters.category}"` now works correctly

### Phase 4 Deliverables ✅ (Feature Section - "Why MASH")
- [x] Created `studio/src/schemaTypes/documents/featureSection.ts` (15+ fields, 2 groups)
- [x] Schema includes: title, subtitle, features array, background style, columns, displayOrder
- [x] Features array supports: icon (15 Lucide icons), headline, subheadline, link, isActive
- [x] Created `src/hooks/useSanityFeatures.ts` with cache and real-time support
- [x] Created `src/components/cms/SanityFeatureSection.tsx` with dynamic icon rendering
- [x] Updated homepage to use `useSanityFeatures()` instead of old JSON-based hook
- [x] Migrated 2 feature sections (7 features total) via `scripts/migrate-features-to-sanity.js`
- [x] Homepage "Why MASH" section now fully editable in Sanity Studio

### Phase 5 Deliverables ✅ (Navigation & Site Settings)
- [x] Created `studio/src/schemaTypes/singletons/siteSettings.ts` (8 field groups, 30+ fields)
  - Company Info: name, tagline, description, logo, favicon
  - Contact: email, phone, address (street, city, state, zip, country)
  - Social Media: facebook, instagram, twitter, linkedin, youtube, tiktok
  - Announcement Bar: enabled, message, link, colors
  - Footer: aboutText, copyright, newsletter, links
  - SEO: metaTitle, metaDescription, keywords, ogImage
  - Business Hours: Monday-Sunday + timezone
  - Features: toggles for blog, shop, growers, reviews, wishlist, same-day delivery
- [x] Created `studio/src/schemaTypes/documents/navigation.ts`
  - 7 menu types: header-main, header-secondary, header-mobile, footer-shop, footer-support, footer-about, footer-legal
  - Nested menu support (dropdown menus)
  - Icon support (14 Lucide icons)
  - Highlight badges for menu items
- [x] Updated `studio/src/schemaTypes/index.ts` with new imports
- [x] Updated `src/hooks/useSanitySiteSettings.ts`:
  - Full GROQ query for comprehensive siteSettings
  - Fallback to legacy settings document
  - Added `useSanityNavigation()` hook for menu fetching
  - Added `useSanityAllNavigations()` for batch fetching
  - Added `NavigationMenuItem` and `NavigationMenu` interfaces
- [x] Created `scripts/migrate-site-settings-to-sanity.js`
  - Migrates company info, contact, social links
  - Creates 5 navigation menus (header + footer)
  - Includes announcement bar config

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Schema Overview](#current-schema-overview)
3. [Identified Issues & Gaps](#identified-issues--gaps)
4. [Improvement Plan (7 Phases)](#improvement-plan-7-phases)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Implementation Guide](#implementation-guide)
7. [Testing Checklist](#testing-checklist)

---

## 🎯 Executive Summary

### Current Status
Your Sanity CMS has a **solid foundation** with 17 schema types, but several critical gaps prevent the e-commerce site from displaying content properly:

| Component | Status | Issue |
|-----------|--------|-------|
| Hero Carousel | ✅ Working | Displays correctly from Sanity |
| Products | ⚠️ Partial | Products exist but images/display issues |
| Categories | ⚠️ Partial | Not filtering products correctly |
| Growers | ✅ **Complete** | Phase 1 - Schema + migration complete |
| Featured Products | ⚠️ Partial | Singleton exists but not connected |
| FAQ | ✅ **Complete** | Phase 2 - Schema + migration complete |
| Site Settings | ⚠️ Partial | Basic settings, missing footer/nav |

### Key Metrics
- **17** Schema Types Defined
- **3** Singletons (settings, heroCarousel, featuredProducts)
- **14** Document Types
- **4** Object Types

---

## 📊 Current Schema Overview

### Document Types (14)

```
┌─────────────────────────────────────────────────────────────────┐
│                      SANITY CMS SCHEMA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📦 PRODUCTS                  👤 CONTENT                        │
│  ├── product (623 lines!)    ├── page                          │
│  ├── productVariant          ├── post (blog)                   │
│  ├── productBundle           └── person (author)               │
│  ├── category                                                   │
│  └── review                  💳 COMMERCE                        │
│                              ├── order                          │
│  📢 MARKETING                ├── coupon                         │
│  ├── promotion               └── analytics                      │
│  └── emailCampaign                                              │
│                                                                 │
│  ⚙️ SINGLETONS               📝 OBJECTS                         │
│  ├── settings                ├── blockContent                   │
│  ├── heroCarousel            ├── callToAction                   │
│  └── featuredProducts        ├── infoSection                    │
│                              └── link                           │
│                                                                 │
│  ❌ MISSING SCHEMAS                                              │
│  ├── grower (Meet Our Growers section)                          │
│  ├── faq (FAQ page content)                                     │
│  ├── testimonial (Customer testimonials)                        │
│  ├── navigation (Header/Footer menus)                           │
│  ├── banner (Promotional banners)                               │
│  └── featureSection (Why MASH section)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Product Schema (Current - 623 lines)

Your product schema is **comprehensive** with 30+ fields:

```typescript
// BASIC INFO
name, slug, image, images[], category, price, description, sku

// INVENTORY
quantity, inventory { quantityInStock, lowStockThreshold, trackInventory, 
                      allowBackorders, stockHistory[] }

// PROMOTIONS
isOnPromo, promoType, promoPercentage, promoPrice, promoEndDate, compareAtPrice

// VARIANTS & BUNDLES
hasVariants, variants[], relatedProducts[], relatedBundles[]

// SMART RECOMMENDATIONS (Phase 2.5)
suggestedProducts[], productTags[], complementaryProducts[]

// FRESHNESS (Mushroom-Specific)
freshnessInfo { harvestWindow, shelfLife, storageInstructions, qualityIndicators }

// PREPARATION
preparationInfo { difficultyLevel, cookingTime, preparationTips[], recipeIdeas[] }

// DELIVERY (Lalamove)
deliveryOptions { sameDayDeliveryEligible, deliveryZones[], deliveryNotes, perishable }
deliveryWeight { packageWeight, packageDimensions { length, width, height } }

// SEO
searchKeywords[], nutritionalHighlights[]
```

### Category Schema (Current - 106 lines)

```typescript
name, slug, parentCategory, image, description
featured, isActive, sortOrder
seoTitle, seoDescription, seoKeywords
```

---

## 🔴 Identified Issues & Gaps

### Critical Issues (Blocking)

#### 1. ✅ ~~No Growers Schema~~ (FIXED - Phase 1)
**Status:** ✅ RESOLVED in Phase 1 & 1.5
**Solution:** Created grower schema, migration script, hooks, and fixed image display

#### 2. ✅ ~~Products Not Displaying Correctly~~ (FIXED - Phase 3)
**Status:** ✅ RESOLVED in Phase 3
**Solution:** Shop page now uses `category.slug` for filtering instead of `category.name`

```typescript
// BEFORE (WRONG) - used category.name
toggleCategory(category.name) // "Fresh Mushrooms"

// AFTER (CORRECT) - uses category.slug  
toggleCategory(category.slug) // "fresh-mushrooms"
```

#### 3. ⚠️ Featured Products Not Connected
**Issue:** `featuredProducts` singleton exists but homepage fetches from mock data
**File:** `src/hooks/useSanityProducts.ts` has `useSanityFeaturedProducts` but not used everywhere

#### 4. ✅ ~~No FAQ Schema~~ (FIXED - Phase 2)
**Status:** ✅ RESOLVED in Phase 2
**Solution:** Created faqCategory + faqItem schemas, migrated 19 FAQs, updated FAQ page

#### 5. ✅ ~~No Feature Section Schema~~ (FIXED - Phase 4)
**Status:** ✅ RESOLVED in Phase 4
**Solution:** Created featureSection schema with 15+ fields, migrated 2 sections (7 features), homepage now uses Sanity

### Medium Priority Issues

#### 6. ⚠️ Missing Navigation Schema
**Impact:** Header/footer menus not editable in CMS

#### 7. ⚠️ Product Images Not Loading
**Issue:** Some products show placeholder images
**Root Cause:** Image references not properly resolved in GROQ queries

#### 8. ⚠️ Site Settings Incomplete
**Issue:** Settings singleton missing footer content, social links, contact info

### Low Priority Issues

#### 9. 📝 No Testimonial Schema
**Impact:** Can't manage customer testimonials in CMS

#### 10. 📝 No Banner Schema
**Impact:** Can't manage promotional banners

---

## 📋 Improvement Plan (7 Phases)

### Phase 1: Growers Schema & Integration (2-3 hours)
**Priority:** 🔴 Critical  
**Goal:** Replace hardcoded growers with CMS content

#### Schema: `grower.ts`
```typescript
// studio/src/schemaTypes/documents/grower.ts
import { UsersIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const grower = defineType({
  name: 'grower',
  title: 'Grower / Farm',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Farm/Grower Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo/Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short slogan (e.g., "Urban-grown gourmet mushrooms")',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., "Caloocan City, Metro Manila"',
    }),
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'operatingHours',
      title: 'Operating Hours',
      type: 'string',
      description: 'e.g., "7AM - 9PM, Mon-Fri"',
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
      name: 'products',
      title: 'Featured Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      description: 'Products from this grower',
    }),
    defineField({
      name: 'certifications',
      title: 'Certifications',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Organic Certified', value: 'organic' },
          { title: 'GAP Certified', value: 'gap' },
          { title: 'HACCP', value: 'haccp' },
          { title: 'FDA Registered', value: 'fda' },
        ],
      },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media',
      type: 'object',
      fields: [
        { name: 'facebook', title: 'Facebook', type: 'url' },
        { name: 'instagram', title: 'Instagram', type: 'url' },
        { name: 'website', title: 'Website', type: 'url' },
      ],
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Grower',
      type: 'boolean',
      description: 'Show on homepage',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'location',
      media: 'logo',
    },
  },
})
```

#### Files to Create/Modify:
1. `studio/src/schemaTypes/documents/grower.ts` (NEW)
2. `studio/src/schemaTypes/index.ts` (add import)
3. `studio/src/structure/index.ts` (add to sidebar)
4. `src/hooks/useSanityGrowers.ts` (NEW - hook for fetching)
5. `src/lib/api/main.ts` (update to use Sanity)
6. `src/app/page.tsx` (update FeaturedGrowersSection)
7. `src/app/grower/page.tsx` (update growers list)
8. `src/app/grower/[id]/page.tsx` (update detail page)

#### GROQ Query:
```groq
*[_type == "grower" && isActive == true] | order(sortOrder asc) {
  _id,
  name,
  slug,
  tagline,
  location,
  phone,
  operatingHours,
  "logo": logo.asset->url,
  coordinates,
  isFeatured
}
```

---

### Phase 2: FAQ Schema & Integration (1-2 hours)
**Priority:** 🟠 High  
**Goal:** Manage FAQ content in Sanity

#### Schema: `faq.ts`
```typescript
// studio/src/schemaTypes/documents/faq.ts
import { HelpCircleIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: '📦 Ordering & Shipping', value: 'ordering' },
          { title: '🍄 Products', value: 'products' },
          { title: '💳 Payment', value: 'payment' },
          { title: '🔄 Returns & Refunds', value: 'returns' },
          { title: '🌱 Growers & Sourcing', value: 'growers' },
          { title: '❓ General', value: 'general' },
        ],
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'category',
    },
    prepare({ title, subtitle }) {
      const categoryEmoji: Record<string, string> = {
        ordering: '📦',
        products: '🍄',
        payment: '💳',
        returns: '🔄',
        growers: '🌱',
        general: '❓',
      }
      return {
        title,
        subtitle: `${categoryEmoji[subtitle] || '❓'} ${subtitle}`,
      }
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
```

#### Files to Create/Modify:
1. `studio/src/schemaTypes/documents/faq.ts` (NEW)
2. `studio/src/schemaTypes/index.ts` (add import)
3. `src/hooks/useSanityFAQ.ts` (NEW)
4. `src/app/faq/page.tsx` (update to use Sanity)

---

### Phase 3: Feature Section Schema (1-2 hours)
**Priority:** 🟠 High  
**Goal:** "Why MASH" section editable in CMS

#### Schema: `featureSection.ts`
```typescript
// studio/src/schemaTypes/documents/featureSection.ts
import { StarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const featureSection = defineType({
  name: 'featureSection',
  title: 'Feature Section',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Lucide icon name (e.g., "Leaf", "Truck", "Shield")',
      options: {
        list: [
          { title: '🌿 Leaf (Organic)', value: 'Leaf' },
          { title: '🚚 Truck (Fast Delivery)', value: 'Truck' },
          { title: '🛡️ Shield (Quality)', value: 'ShieldCheck' },
          { title: '💰 Wallet (Affordable)', value: 'Wallet' },
          { title: '🌱 Sprout (Fresh)', value: 'Sprout' },
          { title: '♻️ Recycle (Sustainable)', value: 'Recycle' },
          { title: '🤝 Handshake (Trust)', value: 'Handshake' },
          { title: '⭐ Star (Quality)', value: 'Star' },
        ],
      },
    }),
    defineField({
      name: 'image',
      title: 'Feature Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'image',
    },
  },
})
```

---

### Phase 4: Fix Product/Category Display (2-3 hours)
**Priority:** 🔴 Critical  
**Goal:** Products display correctly with categories

#### Issue 1: Category Filter Fix
```typescript
// BEFORE (shop/page.tsx)
const toggleCategory = (category: string) => {
  // Using category NAME not SLUG
}

// AFTER - Use slug for filtering
const categories = sanityCategories.map((cat) => ({
  name: cat.name,
  slug: cat.slug, // Add slug
}));

const toggleCategory = (categorySlug: string) => {
  setSelectedCategories((prev) =>
    prev.includes(categorySlug)
      ? prev.filter((c) => c !== categorySlug)
      : [...prev, categorySlug]
  );
};
```

#### Issue 2: Product Image Resolution
```typescript
// Update GROQ query in useSanityProducts.ts
query += ` {
  _id,
  name,
  slug,
  price,
  "mainImage": image.asset->url,  // Full URL
  "images": images[].asset->url,   // Array of URLs
  category->{
    _id,
    name,
    "slug": slug.current  // Get slug value
  }
}`;
```

#### Files to Modify:
1. `src/app/(shop)/shop/page.tsx` - Fix category filter
2. `src/hooks/useSanityProducts.ts` - Fix GROQ query
3. `src/hooks/useSanityCategories.ts` - Return slug.current
4. `src/components/product/ProductCard.tsx` - Handle missing images

---

### Phase 5: Enhanced Site Settings ✅ COMPLETE
**Priority:** 🟡 Medium  
**Goal:** Complete site settings with footer/header content

#### What Was Done:

**1. Created siteSettings Singleton Schema** (`studio/src/schemaTypes/singletons/siteSettings.ts`)
- 30+ fields organized into 8 field groups:
  - **Company Info**: companyName, tagline, description, logo, favicon
  - **Contact**: email, phone, address (street, city, state, zip, country)
  - **Social Media**: facebook, instagram, twitter, linkedin, youtube, tiktok
  - **Announcement Bar**: enabled, message, link, linkText, backgroundColor, textColor
  - **Footer**: aboutText, copyright, newsletter (title, description, enabled), legal links
  - **SEO**: metaTitle, metaDescription, keywords[], ogImage
  - **Business Hours**: Monday-Sunday hours, timezone, holiday note
  - **Features**: toggles for blog, shop, growers, reviews, wishlist, same-day delivery

**2. Created Navigation Schema** (`studio/src/schemaTypes/documents/navigation.ts`)
- 7 menu types: header-main, header-secondary, header-mobile, footer-shop, footer-support, footer-about, footer-legal
- Nested children support for dropdown menus
- Icon support (14 Lucide icons)
- Highlight badges (New!, Sale, Hot)
- Link types: internal path, external URL, page reference, none

**3. Updated Schema Index** (`studio/src/schemaTypes/index.ts`)
- Added siteSettings and navigation exports

**4. Updated useSanitySiteSettings Hook** (`src/hooks/useSanitySiteSettings.ts`)
- Full GROQ query for comprehensive siteSettings
- Fallback to legacy settings document for backwards compatibility
- Added `useSanityNavigation(menuType)` hook for menu fetching
- Added `useSanityAllNavigations()` for batch fetching all menus
- Added `NavigationMenuItem` and `NavigationMenu` TypeScript interfaces

**5. Created Migration Script** (`scripts/migrate-site-settings-to-sanity.js`)
- Migrates MASH company info with contact details
- Creates 5 navigation menus:
  - Main Navigation (4 items)
  - Header Secondary Links (3 items)
  - Footer - Shop (5 items)
  - Footer - Customer Service (6 items)
  - Footer - About MASH (4 items)
- Includes announcement bar configuration

#### Files Created/Modified:

| File | Action | Description |
|------|--------|-------------|
| `studio/src/schemaTypes/singletons/siteSettings.ts` | Created | Comprehensive site settings singleton |
| `studio/src/schemaTypes/documents/navigation.ts` | Created | Navigation menu schema with nested items |
| `studio/src/schemaTypes/index.ts` | Modified | Added new schema exports |
| `src/hooks/useSanitySiteSettings.ts` | Modified | Full GROQ query + navigation hooks |
| `scripts/migrate-site-settings-to-sanity.js` | Created | Migration script |

#### Data Migrated:

| Content Type | Count | Details |
|--------------|-------|---------|
| Site Settings | 1 | Company: MASH Mushroom E-Commerce |
| Navigation Menus | 5 | Header + Footer menus |
| Menu Items | 22 | Across all menus |

#### How to Use:

```tsx
// In Header/Footer components
import { useSanitySiteSettings, useSanityNavigation } from '@/hooks/useSanitySiteSettings';

function Header() {
  const { settings } = useSanitySiteSettings();
  const { menu: mainNav } = useSanityNavigation('header-main');
  
  return (
    <header>
      <img src={settings?.logo} alt={settings?.companyName} />
      {settings?.announcementBar?.enabled && (
        <div style={{ backgroundColor: settings.announcementBar.backgroundColor }}>
          {settings.announcementBar.message}
        </div>
      )}
      <nav>
        {mainNav?.items.map((item) => (
          <a key={item._key} href={item.internalPath || item.externalUrl}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
```

---

### Phase 6: Banner & Testimonial Schemas (1-2 hours)
**Priority:** 🟢 Low  
**Goal:** Additional marketing content

#### Schema: `banner.ts`
```typescript
// Promotional banners for homepage, category pages
export const banner = defineType({
  name: 'banner',
  title: 'Promotional Banner',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'subtitle', type: 'string' }),
    defineField({ name: 'image', type: 'image' }),
    defineField({ name: 'link', type: 'string' }),
    defineField({ name: 'placement', type: 'string',
      options: {
        list: ['homepage-top', 'homepage-middle', 'category-page', 'checkout'],
      },
    }),
    defineField({ name: 'startDate', type: 'datetime' }),
    defineField({ name: 'endDate', type: 'datetime' }),
    defineField({ name: 'isActive', type: 'boolean' }),
  ],
})
```

#### Schema: `testimonial.ts`
```typescript
// Customer testimonials
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'customerName', type: 'string' }),
    defineField({ name: 'customerPhoto', type: 'image' }),
    defineField({ name: 'quote', type: 'text' }),
    defineField({ name: 'rating', type: 'number', validation: (Rule) => Rule.min(1).max(5) }),
    defineField({ name: 'productPurchased', type: 'reference', to: [{ type: 'product' }] }),
    defineField({ name: 'isActive', type: 'boolean' }),
  ],
})
```

---

### Phase 7: Real-Time Integration & Polish (2-3 hours)
**Priority:** 🟢 Low  
**Goal:** Real-time updates, caching optimization

#### Tasks:
1. Enable Sanity listener for real-time updates (where needed)
2. Implement proper cache invalidation
3. Add loading skeletons for all CMS-powered sections
4. Error boundaries for failed CMS fetches
5. Preview mode for unpublished content

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT DATA FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SANITY STUDIO (localhost:3333)                               │
│   ┌─────────────────────────────────────────┐                   │
│   │  Content Editors                         │                   │
│   │  ├── Hero Carousel ✅                   │                   │
│   │  ├── Products ✅                        │                   │
│   │  ├── Categories ✅                      │                   │
│   │  ├── Reviews ✅                         │                   │
│   │  ├── Growers ❌ (Missing)               │                   │
│   │  ├── FAQ ❌ (Missing)                   │                   │
│   │  └── Features ❌ (Missing)              │                   │
│   └─────────────────────────────────────────┘                   │
│                       │                                         │
│                       ▼                                         │
│   SANITY CDN (cdn.sanity.io)                                   │
│   ┌─────────────────────────────────────────┐                   │
│   │  - Caches published content              │                   │
│   │  - Project: xyq5fhxs                    │                   │
│   │  - Dataset: production                  │                   │
│   │  - Growth Trial (10M API calls/month)   │                   │
│   └─────────────────────────────────────────┘                   │
│                       │                                         │
│                       ▼                                         │
│   NEXT.JS FRONTEND (localhost:3000)                            │
│   ┌─────────────────────────────────────────┐                   │
│   │  Hooks (src/hooks/)                      │                   │
│   │  ├── useSanityHero.ts ✅                │                   │
│   │  ├── useSanityProducts.ts ✅            │                   │
│   │  ├── useSanityCategories.ts ✅          │                   │
│   │  ├── useSanityGrowers.ts ✅             │                   │
│   │  ├── useSanityFAQ.ts ✅                 │                   │
│   │  ├── useSanityFeatures.ts ✅            │                   │
│   │  └── useSanitySiteSettings.ts ✅        │                   │
│   └─────────────────────────────────────────┘                   │
│                                                                 │
│   SANITY DATA (Migrated)                                       │
│   ┌─────────────────────────────────────────┐                   │
│   │  ✅ Growers (4)                          │                   │
│   │  ✅ FAQs (5 categories, 19 items)        │                   │
│   │  ✅ Features (2 sections, 7 items)       │                   │
│   │  ✅ Site Settings (1 singleton)          │                   │
│   │  ✅ Navigation (5 menus, 22 items)       │                   │
│   └─────────────────────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Files Summary

### Created Files (Phase 1-5) ✅

```
studio/src/schemaTypes/documents/
├── grower.ts            ✅ (Phase 1 - 20+ fields, 6 groups)
├── faqCategory.ts       ✅ (Phase 2 - FAQ categories)
├── faqItem.ts           ✅ (Phase 2 - FAQ items with category ref)
├── featureSection.ts    ✅ (Phase 4 - 15+ fields, 2 groups)
└── navigation.ts        ✅ (Phase 5 - 7 menu types, nested items)

studio/src/schemaTypes/singletons/
└── siteSettings.ts      ✅ (Phase 5 - 30+ fields, 8 groups)

src/hooks/
├── useSanityGrowers.ts      ✅ (Phase 1 - real-time, filters)
├── useSanityFAQ.ts          ✅ (Phase 2 - 5 hooks, API functions)
├── useSanityFeatures.ts     ✅ (Phase 4 - cache, real-time)
└── useSanitySiteSettings.ts ✅ (Phase 5 - navigation hooks added)

scripts/
├── migrate-growers-to-sanity.js       ✅ (4 growers)
├── migrate-faq-to-sanity.js           ✅ (5 cats, 19 items)
├── migrate-features-to-sanity.js      ✅ (2 sections, 7 items)
└── migrate-site-settings-to-sanity.js ✅ (settings + 5 menus)
```

### Files Still to Create (Phase 6)

```
studio/src/schemaTypes/documents/
├── banner.ts          (Phase 6 - promotional banners)
└── testimonial.ts     (Phase 6 - customer testimonials)
```

### Files Modified

```
studio/src/schemaTypes/index.ts      ✅ Added all new schema imports
studio/src/structure/index.ts        ✅ Organized sidebar with sections
src/lib/api/main.ts                  (Remove mock growers)
src/hooks/useSanityProducts.ts       (Fix GROQ query)
src/hooks/useSanityCategories.ts     (Return slug correctly)
```

---

## ✅ Testing Checklist

### Phase 1: Growers ✅ Complete
- [x] Grower schema deployed to Sanity
- [x] 4 growers added in Sanity Studio
- [x] Homepage "Meet Our Growers" shows Sanity data
- [x] Growers list page (`/grower`) works
- [x] Individual grower page (`/grower/[slug]`) works
- [ ] Grower images uploaded (manual step in Studio)
- [ ] Map coordinates verified

### Phase 2: FAQ ✅ Complete
- [x] FAQ schemas deployed (faqCategory, faqItem)
- [x] 5 categories + 19 FAQ items added in Sanity
- [x] FAQ page shows categories
- [x] Accordion expand/collapse works
- [x] Search/filter works

### Phase 3: Category/Product Filter ✅ Complete
- [x] Category filter uses slug instead of name
- [x] Products filter correctly by category
- [x] Both desktop and mobile filter sidebars work

### Phase 4: Features ✅ Complete
- [x] Feature section schema deployed
- [x] 2 sections + 7 features added in Sanity
- [x] "Why MASH" section on homepage shows Sanity data
- [x] Icons render correctly

### Phase 5: Site Settings ✅ Complete
- [x] siteSettings singleton schema deployed (30+ fields)
- [x] Navigation schema deployed (7 menu types)
- [x] 5 navigation menus created (22 items total)
- [x] useSanitySiteSettings hook updated with GROQ query
- [x] useSanityNavigation hook added
- [ ] Upload logo image in Sanity Studio
- [ ] Header/Footer components test with live data

### Phase 6: Banners & Testimonials 🔴 Not Started
- [ ] Banner schema deployed
- [ ] Testimonial schema deployed
- [ ] Homepage banners display
- [ ] Customer testimonials display

### Phase 7: Final Integration 🔴 Not Started
- [ ] Real-time updates working
- [ ] Cache invalidation working
- [ ] Loading skeletons implemented
- [ ] Error boundaries in place
- [ ] Preview mode for drafts

---

## 🗓️ Implementation Timeline

| Phase | Duration | Dependencies | Status |
|-------|----------|--------------|--------|
| Phase 1: Growers | 2-3 hours | None | ✅ Complete |
| Phase 1.5: Images & Maps | 1-2 hours | Phase 1 | ✅ Complete |
| Phase 2: FAQ | 1-2 hours | None | ✅ Complete |
| Phase 3: Fix Category Filter | 1 hour | None | ✅ Complete |
| Phase 4: Features | 1-2 hours | None | ✅ Complete |
| Phase 5: Settings & Navigation | 2-3 hours | None | ✅ Complete |
| Phase 6: Banners | 1-2 hours | None | 🔴 Not Started |
| Phase 7: Polish | 2-3 hours | All above | 🔴 Not Started |

**Total Estimated Time:** 12-17 hours  
**Completed:** ~10 hours (Phases 1-5)  
**Remaining:** ~4 hours (Phases 6-7)

---

## ✅ Phase 5 Complete (Site Settings & Navigation)

### What Was Done

1. **Created siteSettings Singleton Schema** (`studio/src/schemaTypes/singletons/siteSettings.ts`)
   - 30+ fields organized into 8 groups:
     - Company Info (name, tagline, description, logo, favicon)
     - Contact (email, phone, address object)
     - Social Media (facebook, instagram, twitter, linkedin, youtube, tiktok)
     - Announcement Bar (enabled, message, link, colors)
     - Footer (aboutText, copyright, newsletter, legal links)
     - SEO (metaTitle, metaDescription, keywords, ogImage)
     - Business Hours (Monday-Sunday, timezone, note)
     - Features (toggles for blog, shop, growers, reviews, wishlist, same-day delivery)

2. **Created Navigation Schema** (`studio/src/schemaTypes/documents/navigation.ts`)
   - 7 menu types: header-main, header-secondary, header-mobile, footer-shop, footer-support, footer-about, footer-legal
   - Nested children support for dropdown menus
   - Icon support (14 Lucide icons)
   - Highlight badges (New!, Sale, Hot)
   - Link types: internal path, external URL, page reference, none

3. **Updated Schema Index** (`studio/src/schemaTypes/index.ts`)
   - Added siteSettings and navigation exports

4. **Updated useSanitySiteSettings Hook** (`src/hooks/useSanitySiteSettings.ts`)
   - Full GROQ query for comprehensive siteSettings
   - Fallback to legacy settings document
   - Added `useSanityNavigation(menuType)` hook
   - Added `useSanityAllNavigations()` hook
   - TypeScript interfaces for NavigationMenuItem, NavigationMenu

5. **Created Migration Script** (`scripts/migrate-site-settings-to-sanity.js`)
   - Migrates MASH company info
   - Creates 5 navigation menus with 22 items total

### Data Migrated

| Content | Count | Details |
|---------|-------|---------|
| Site Settings | 1 | MASH Mushroom E-Commerce |
| Main Navigation | 4 items | Shop, Our Growers, About, Contact |
| Header Secondary | 3 items | Blog, FAQ, Contact Us |
| Footer Shop | 5 items | All Products, Fresh, Dried, Growers, How to Order |
| Footer Support | 6 items | FAQs, Contact, Shipping, Returns, Privacy, Terms |
| Footer About | 4 items | About Us, Mission, Become Grower, Blog |

### Next Steps for Phase 5
1. Open Sanity Studio and upload logo image
2. Test Header component with live siteSettings data
3. Test Footer component with navigation menus
4. Verify announcement bar displays correctly

---

## ✅ Phase 1 Complete (Growers)

### What Was Done

1. **Created Grower Schema** (`studio/src/schemaTypes/documents/grower.ts`)
   - 20+ fields organized into 6 groups (Basic, Contact, Location, Products, Social, Settings)
   - Includes coordinates for map integration
   - Supports featured products, specialties, certifications
   - Preview with badges for featured/inactive status

2. **Updated Schema Index** (`studio/src/schemaTypes/index.ts`)
   - Added grower import and export

3. **Updated Studio Structure** (`studio/src/structure/index.ts`)
   - Added E-Commerce section with Products, Categories, Growers
   - Organized sidebar for better navigation

4. **Hook Already Existed** (`src/hooks/useSanityGrowers.ts`)
   - Real-time updates enabled
   - Filters by region, specialty, isActive
   - Includes product count aggregation

5. **Updated Homepage** (`src/app/page.tsx`)
   - Changed from `useHomePageData` to `useSanityGrowers`
   - Updated `GrowerCard` component for new data structure
   - Uses slug for grower links instead of numeric ID

6. **Created Migration Script** (`scripts/migrate-growers-to-sanity.js`)
   - Migrated 4 growers from MOCK_GROWERS to Sanity

7. **Verified Data Migration**
   - ✅ 4 growers created in Sanity CMS
   - ✅ Fungi Fresh Farms (Caloocan City, Metro Manila)
   - ✅ The Mushroom Patch Bukidnon (Lantapan, Bukidnon)
   - ✅ Kabutehan ni Aling Nena (Antipolo, Rizal)
   - ✅ Shroomarket (Malate, Manila)

### Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `studio/src/schemaTypes/documents/grower.ts` | Created | New grower schema with 20+ fields |
| `studio/src/schemaTypes/index.ts` | Modified | Added grower import |
| `studio/src/structure/index.ts` | Modified | Added E-Commerce section with Growers |
| `src/app/page.tsx` | Modified | Updated FeaturedGrowersSection to use Sanity |
| `scripts/migrate-growers-to-sanity.js` | Created | Migration script for grower data |
| `scripts/check-growers.js` | Created | Utility script to check growers in Sanity |

### Next Step: Add Grower Images

The growers are created but without images. To add images:

1. Open Sanity Studio: http://localhost:3333
2. Navigate to **🛒 E-Commerce** → **Growers / Farms**
3. Click on each grower
4. Upload a logo image (square format recommended)
5. Optionally add a cover image for the banner
6. Click **Publish**

---

## 🚀 Getting Started

### Step 1: Start Sanity Studio
```bash
cd studio
npm run dev
# Opens at http://localhost:3333
```

### Step 2: Start Next.js Frontend
```bash
# In project root
npm run dev
# Opens at http://localhost:3000
```

### Step 3: Implement Phase 1 (Growers)
1. Create `studio/src/schemaTypes/documents/grower.ts`
2. Add to `studio/src/schemaTypes/index.ts`
3. Add to `studio/src/structure/index.ts`
4. Restart Sanity Studio
5. Add 4 growers in Studio
6. Create `src/hooks/useSanityGrowers.ts`
7. Update homepage to use hook
8. Test and verify

---

## 📞 Quick Reference

### Sanity Project Details
- **Project ID:** `xyq5fhxs`
- **Dataset:** `production`
- **API Version:** `2024-11-26`
- **Plan:** Growth Trial (10M API calls/month)
- **Dashboard:** https://sanity.io/manage/project/xyq5fhxs

### Key Environment Variables
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=xyq5fhxs
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-26
SANITY_API_READ_TOKEN=skq5uN9k...
SANITY_API_WRITE_TOKEN=sk5u0jTA...
```

### Useful GROQ Queries
```groq
// All active products
*[_type == "product" && isAvailable == true]

// Products by category slug
*[_type == "product" && category->slug.current == "fresh-mushrooms"]

// Featured growers
*[_type == "grower" && isFeatured == true && isActive == true]

// FAQs by category
*[_type == "faq" && category == "ordering" && isActive == true] | order(order asc)
```

---

**Document Created:** November 27, 2025  
**Author:** GitHub Copilot  
**Next Step:** Start with Phase 1 (Growers Schema)
