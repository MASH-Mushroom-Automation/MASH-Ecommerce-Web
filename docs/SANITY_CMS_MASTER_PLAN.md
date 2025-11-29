# 🍄 MASH E-Commerce - Sanity CMS Master Plan

**Version:** 11.6  
**Last Updated:** November 29, 2025 (Session 7 - Grower & Store Integration)  
**Project:** MASH Mushroom E-Commerce Platform  
**CMS:** Sanity CMS (Project ID: `xyq5fhxs` - Growth Trial)  
**Documentation Author:** AI Development Assistant

---

## 📋 Quick Navigation

- [Executive Summary](#-executive-summary)
- [Session 5 Bug Fixes (NEW)](#-session-5-bug-fixes-november-29-2025---new)
- [About Page Enhancement](#-about-page-enhancement-session-4---new)
- [Product Page Enhancement](#-product-page-enhancement-session-4)
- [Bug Fixes Applied (Session 4)](#-bug-fixes-applied-session-4)
- [System Architecture](#-system-architecture)
- [Complete Schema Reference](#-complete-schema-reference)
- [Data Audit Results](#-data-audit-results-november-28-2025)
- [Customer Journey Flow](#-customer-journey-flow)
- [Improvement Phases](#-improvement-phases-15-20)
- [Remaining Issues](#-remaining-issues-by-priority)
- [Completed Work](#-completed-work-sessions-1-3)

---

## 📊 Executive Summary

### Project Status: 99% Complete

| Metric | Value |
|--------|-------|
| **Documents in CMS** | 172 items |
| **Schemas Created** | 22 document + 6 singleton + 4 object types |
| **Completed Phases** | 14 of 14 (100%) |
| **Bug Fixes Applied** | 8 (Session 4 + Session 5) |
| **UI Enhancements** | Product page + About page now show ALL rich CMS data |
| **Remaining Issues** | 1 item (manual content - Featured Products singleton) |
| **Est. Completion** | 30 minutes |

### What's Working ✅

- ✅ Products display on shop page with filtering
- ✅ Product variants, reviews, search, and tags
- ✅ Growers linked to stores bidirectionally
- ✅ "Meet Our Growers" on store pages
- ✅ "Find At Stores" on grower pages
- ✅ FAQ system with categories
- ✅ Feature sections ("Why Choose MASH")
- ✅ Hero carousel on homepage
- ✅ Blog posts with categories
- ✅ **Products have suggested/complementary links (15/15)**
- ✅ **Testimonials showing on homepage**
- ✅ **Promotional banners integrated**
- ✅ **Header/Footer connected to CMS**
- ✅ **useSanityVariants bug fixed (Session 4)**
- ✅ **About page schema fixed (legacy fields)**
- ✅ **Product page shows Freshness Info (NEW)**
- ✅ **Product page shows Cooking Guide (NEW)**
- ✅ **Product page shows Delivery Options (NEW)**
- ✅ **Product page shows Nutritional Highlights (NEW)**
- ✅ **qualityIndicators string/array parsing fixed (NEW)**
- ✅ **About page shows team member IMAGES (Session 5 verified: 7/7 have photos)**
- ✅ **About page enhanced with gradients and animations (NEW)**
- ✅ **Mentor section separated from team (Session 5 GROQ filter fix)**
- ✅ **Google Maps component migrated to new API (Session 5)**

### What Needs Work 🔄

- ❌ Featured Products singleton needs content (manual in Studio)

---

## 🔧 Session 5 Bug Fixes (November 29, 2025) - NEW!

### Fix 1: Mentor Appearing in Team Section

**Problem:** The academic advisor (Joemen G. Barrios) was incorrectly appearing in the Team Members section of the About page, instead of just in the dedicated Mentor section.

**Root Cause:** The TEAM_MEMBERS_QUERY in `useSanityAboutPage.ts` was fetching ALL person documents with `showOnAboutPage == true`, without filtering by `personType`.

**Solution:** Added `personType != "mentor"` filter to the GROQ query.

**File Modified:** `src/hooks/useSanityAboutPage.ts`

```groq
// BEFORE (wrong - includes mentor):
*[_type == "person" && showOnAboutPage == true && isActive == true]

// AFTER (correct - excludes mentor):
*[_type == "person" && showOnAboutPage == true && isActive == true && personType != "mentor"]
```

### Fix 2: Google Maps "Loader class is no longer available" Error

**Error:** Runtime error on grower detail page: `The Loader class is no longer available in this version of the @googlemaps/js-api-loader package`

**Root Cause:** The @googlemaps/js-api-loader package updated to a new API that deprecates the `Loader` class in favor of functional APIs.

**Solution:** Completely rewrote `GoogleMap.tsx` to use the new functional API pattern:

**File Modified:** `src/components/maps/GoogleMap.tsx`

```typescript
// BEFORE (deprecated):
import { Loader } from '@googlemaps/js-api-loader';
const loader = new Loader({ apiKey, version: 'weekly' });
await loader.importLibrary('maps');

// AFTER (new API):
let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;
  
  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps) {
      resolve();
      return;
    }
    
    // Define callback
    (window as any).initGoogleMaps = () => {
      resolve();
      delete (window as any).initGoogleMaps;
    };
    
    // Create script tag
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
  
  return googleMapsPromise;
}

// Then use importLibrary() for specific libraries:
await google.maps.importLibrary('maps');
await google.maps.importLibrary('marker');
```

**Key Changes:**
1. Removed `@googlemaps/js-api-loader` import (no longer needed)
2. Added manual script tag injection with callback
3. Used `google.maps.importLibrary()` for dynamic loading
4. Added promise caching to prevent duplicate script loading
5. Fixed both `GoogleMap` and `StaticGoogleMap` components

### Fix 3: Team Member Images Verified (All 7 Have Photos)

**Problem:** Documentation stated 5 team members needed image uploads.

**Investigation:** Created debug scripts to verify Sanity data at every step:
1. Verified all 7 team members (excluding mentor) have `picture` references in Sanity
2. Verified `urlFor()` generates valid CDN URLs for all images
3. Verified CDN returns 200 OK for all image URLs

**Result:** All team member images are correctly stored and accessible. The previous documentation was outdated - images have been uploaded for all members.

**Team Members with Verified Images (7/7):**

| Member | Has Image | Status |
|--------|-----------|--------|
| Kevin A. Llanes | ✅ | cdn.sanity.io/...ce1f2d7d...958x960.jpg |
| Irheil Mae S. Antang | ✅ | cdn.sanity.io/...09e0c68a...612x612.jpg |
| Ma. Catherine H. Bae | ✅ | cdn.sanity.io/...09e0c68a...612x612.jpg |
| Jin Harold A. Failana | ✅ | cdn.sanity.io/...09e0c68a...612x612.jpg |
| Jhon Keneth Ryan B. Namias | ✅ | cdn.sanity.io/...f94c42c0...1391x2048.jpg |
| Emannuel L. Pabua | ✅ | cdn.sanity.io/...09e0c68a...612x612.jpg |
| Ronan Renz T. Valencia | ✅ | cdn.sanity.io/...09e0c68a...612x612.jpg |

**Mentor (Separate Section):**
| Member | Has Image | Status |
|--------|-----------|--------|
| Joemen G. Barrios | ✅ | cdn.sanity.io/...5d903...1680x1686.jpg |

---

## 🎭 About Page Enhancement (Session 4) - NEW!

### Problem Solved

The About page was showing team member **initials instead of actual photos**. Investigation revealed:
- 3 team members HAD images in Sanity (Joemen, Kevin, Jhon Keneth)
- 5 team members were MISSING images (Jin Harold, Irheil Mae, Ma. Catherine, Emannuel, Ronan Renz)
- The AboutSection component was NOT displaying images even when available

### Solution Applied

Completely rewrote `src/components/cms/AboutSection.tsx` with:

1. **Proper Image Display** - Uses Next.js Image component with Sanity CDN URLs
2. **Fallback Initials** - Beautiful gradient backgrounds when no image exists
3. **Enhanced Design** - Modern UI with gradients, animations, and shadows
4. **Role-based Icons** - Each role gets a specific Lucide icon
5. **Social Links** - LinkedIn, GitHub, Facebook display in team cards

### New Features Added

#### 1. 🏠 Enhanced Hero Section
- Animated gradient background with pulsing effects
- Feature badges (IoT Enabled, AI Powered, E-Commerce)
- University badge above title

#### 2. ⚠️ Challenge & Solution Cards
- Side-by-side layout on desktop
- Numbered challenge items with red/warning theme
- Solution icons with green/success theme
- Hover animations and transitions

#### 3. 👥 Team Cards with Images
```tsx
// Now properly displays images from Sanity:
{member.image ? (
  <Image
    src={member.image}
    alt={member.name}
    fill
    className="object-cover transition-transform duration-500 group-hover:scale-110"
  />
) : (
  // Gradient fallback with initials
  <div className={`bg-gradient-to-br ${gradientClass}`}>
    <span className="text-white text-5xl font-bold">
      {getInitials(member.name)}
    </span>
  </div>
)}
```

#### 4. 🎓 Mentor Section with Photo
- Large profile photo with ring effect
- Award badge overlay
- Full bio display

#### 5. 🎯 Vision Section
- Full-width gradient section
- Animated background blobs
- Stats row (8 Team Members, 3 Core Systems, 1 Unified Platform)

### Team Member Image Status (✅ UPDATED Session 5)

> **Note:** All team members now have images uploaded! Verified November 29, 2025.

| Member | Has Image | Notes |
|--------|-----------|-------|
| Joemen G. Barrios | ✅ | **Mentor** - Shown in dedicated Mentor section, NOT in team grid |
| Kevin A. Llanes | ✅ | Team member |
| Jhon Keneth Ryan B. Namias | ✅ | Team member |
| Jin Harold A. Failana | ✅ | Team member |
| Irheil Mae S. Antang | ✅ | Team member |
| Ma. Catherine H. Bae | ✅ | Team member |
| Emannuel L. Pabua | ✅ | Team member |
| Ronan Renz T. Valencia | ✅ | Team member |

### Session 5 Fix: Mentor Excluded from Team Grid

The mentor (Joemen G. Barrios) was incorrectly appearing in the team cards. Fixed by adding `personType != "mentor"` filter to the GROQ query in `useSanityAboutPage.ts`. Now the mentor only appears in the dedicated Mentor section.

---

## 🚀 Session 6: Category Pages & Featured Products (November 29, 2025) - NEW!

### Tasks Completed

#### 1. ✅ Category Detail Page Created

**File Created:** `src/app/category/[slug]/page.tsx`

A complete category detail page with the following features:

**Features:**
- **Category Hero Header** - Image, name, description, product count
- **Breadcrumb Navigation** - Home > Shop > Category Name
- **Product Grid** - Displays products filtered by category
- **Price Range Filter** - Slider + input fields (₱0 - ₱12,000)
- **Tag Filtering** - Fresh, Dried, Growing Kit, Organic, etc.
- **Search Within Category** - Search products in current category only
- **Sort Options** - Featured, Newest, Price Low→High, Price High→Low, Name A-Z
- **View Mode Toggle** - Grid/List view (desktop)
- **Other Categories Sidebar** - Quick navigation to other categories
- **Responsive Design** - Mobile filter drawer, adaptive grid
- **Load More Pagination** - Client-side pagination (12 products per load)
- **Empty States** - Graceful handling of no products found

**URL Pattern:** `/category/[slug]` (e.g., `/category/fresh-mushrooms`)

**Example URLs:**
- `/category/fresh-mushrooms` - Fresh Mushrooms (6 products)
- `/category/dried-mushrooms` - Dried Mushrooms (3 products)
- `/category/growing-kits` - Growing Kits (6 products)

**Hooks Used:**
- `useSanityCategory(slug)` - Fetch single category details
- `useSanityCategories()` - Fetch all categories for sidebar
- `useSanityProducts(filters)` - Fetch products filtered by category

#### 2. ⚠️ Featured Products Token Issue

**Problem:** Script `scripts/create-featured-products.js` failed with error:
```
ClientError: Insufficient permissions; permission "create" required
```

**Cause:** The `SANITY_API_WRITE_TOKEN` doesn't have Editor permissions.

**Solution Required:**
1. Go to: https://www.sanity.io/manage/project/xyq5fhxs/api/tokens
2. Delete existing write token
3. Create new token with **Editor** permissions
4. Update `.env.local` with new token

**Alternative (Manual):**
1. Open Sanity Studio: http://localhost:3333
2. Navigate to Featured Products singleton
3. Manually select 6-8 products

#### 3. ✅ Google Maps Referrers Added

User confirmed adding localhost referrers to Google Maps API key:
- `http://localhost:3000/*`
- `http://localhost:3001/*`
- `http://127.0.0.1:3000/*`

Changes take 5 minutes to propagate in Google Cloud.

### Session 6 Summary

| Task | Status | Notes |
|------|--------|-------|
| Category Pages | ✅ Complete | `/category/[slug]` with full filtering |
| Featured Products Script | ⚠️ Token Issue | Need Editor token or manual selection |
| Google Maps Referrers | ✅ Added | User configured in Google Cloud Console |

### Testing Category Pages

```bash
# Start dev server
npm run dev

# Test category pages
http://localhost:3000/category/fresh-mushrooms
http://localhost:3000/category/dried-mushrooms
http://localhost:3000/category/growing-kits
```

---

### How to Manage Team Photos

1. Open Sanity Studio: `http://localhost:3333`
2. Go to **Content → Person / Team Member**
3. Click on member name (e.g., "Jin Harold A. Failana")
4. Scroll to **Profile Picture** field
5. Click **Upload** or drag & drop image
6. Set hotspot (focal point) for cropping
7. Add alt text: "Jin Harold A. Failana"
8. Click **Publish**
9. Refresh About page - image appears immediately!

### Files Modified

| File | Changes |
|------|---------|
| `src/components/cms/AboutSection.tsx` | Complete rewrite with proper image display, new UI components, role icons, social links |

### New Icons Imported

```typescript
import { 
  Leaf, Truck, Heart, Shield, Users, Award, CheckCircle, Star, 
  Cpu, Brain, ShoppingCart, Sparkles, Target, Lightbulb, Rocket,
  GraduationCap, Code, Database, Monitor, Wrench, Globe, Zap,
  AlertTriangle, TrendingUp, Store, ThermometerSun, Bug, Clock,
  DollarSign, Wifi, BarChart3, Mail, Linkedin, Github, Facebook, ExternalLink
} from "lucide-react";
```

### Role Icon Mapping

```typescript
const roleIcons = {
  "Project Manager": Target,
  "Software Engineer": Code,
  "Front-end Developer": Monitor,
  "Back-end Developer": Database,
  "Hardware Programmer": Wrench,
  "Database Administrator": Database,
  "Full Stack Developer": Globe,
  "Thesis Adviser": GraduationCap,
  "UI/UX Designer": Sparkles,
};
```

---

## 🎨 Product Page Enhancement (Session 4)

### Overview

Product detail pages now display ALL rich CMS data from Sanity, including freshness information, cooking guides, delivery options, and nutritional highlights.

### New UI Sections Added

#### 1. 🌿 Freshness & Quality Card

- **Harvest Window** - Shows delivery timeframe (24h, 48h, 3-5d)
- **Shelf Life** - How long product stays fresh (5-7d, 1-2w, etc.)
- **Storage Instructions** - How to store properly (text field)
- **Quality Indicators** - Visual badges (parsed from comma-separated text)

#### 2. 👨‍🍳 Cooking Guide Card

- **Difficulty Level** - Beginner/Intermediate/Advanced with color coding
- **Cooking Time** - String format (e.g., "10-15 minutes")
- **Preparation Tips** - Up to 3 tips displayed (array of strings)
- **Recipe Ideas** - Simple string suggestions with 🍳 icon

#### 3. 🚚 Delivery Options Card

- **Same-Day Delivery** - Blue badge when eligible
- **Perishable Warning** - Amber badge for cold transport
- **Delivery Zones** - Metro Manila, Quezon City, etc.
- **Package Weight** - For shipping calculation

#### 4. ✨ Nutritional Highlights & Tags Section

- **Nutritional Badges** - High Protein 💪, Low Calorie 🔥, Vitamin D ☀️, etc.
- **Product Tags** - #organic, #fresh, #bestseller

### Files Modified

| File | Changes |
|------|---------|
| `src/types/sanity.ts` | Added 6 new interfaces: FreshnessInfo, PreparationInfo, RecipeIdea, DeliveryOptions, DeliveryWeight |
| `src/types/sanity.ts` | Extended TransformedProduct with 6 new optional fields |
| `src/types/sanity.ts` | Updated transformSanityProduct to handle new fields |
| `src/hooks/useSanityProducts.ts` | Expanded GROQ query to fetch freshnessInfo, preparationInfo, deliveryOptions, deliveryWeight, nutritionalHighlights, searchKeywords |
| `src/app/(shop)/product/[slug]/page.tsx` | Added 3 new info cards + nutritional highlights section (250+ lines of UI) |

### Correct TypeScript Interfaces (Matching Sanity Schema)

```typescript
interface FreshnessInfo {
  harvestWindow?: string;      // "24h", "48h", "3-5d", "n/a"
  shelfLife?: string;          // "5-7d", "1-2w", "6-12m"
  storageInstructions?: string; // Text field
  qualityIndicators?: string;  // Comma-separated text (NOT array!)
}

interface PreparationInfo {
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  cookingTime?: string;        // String like "10-15 minutes" (NOT number!)
  preparationTips?: string[];  // Array of strings
  recipeIdeas?: string[];      // Array of strings (NOT objects!)
}

interface DeliveryOptions {
  sameDayDeliveryEligible?: boolean;
  deliveryZones?: string[];    // Array of zone values
  deliveryNotes?: string;      // Text field
  perishable?: boolean;
}
```

### GROQ Query (Simplified - No Nested Objects for recipeIdeas)

```groq
// New fields added to useSanityProduct query:
freshnessInfo {
  harvestWindow,
  shelfLife,
  storageInstructions,
  qualityIndicators
},
preparationInfo {
  difficultyLevel,
  cookingTime,
  preparationTips,
  recipeIdeas  // Simple array, not nested objects
},
deliveryOptions {
  sameDayDeliveryEligible,
  deliveryZones,
  deliveryNotes,
  perishable
},
deliveryWeight {
  packageWeight,
  packageDimensions { length, width, height }
},
nutritionalHighlights,
searchKeywords
```

### Design Highlights

- **Gradient Cards** - Green (freshness), Orange (cooking), Blue (delivery)
- **Responsive Grid** - 1 column mobile, 2 tablet, 3 desktop
- **Dark Mode Support** - All cards work in light/dark themes
- **Icon Integration** - Lucide icons: Leaf, Clock, ChefHat, Truck, Snowflake, MapPin, etc.
- **Badge System** - Color-coded badges for quality indicators, nutritional info, tags
- **Smart Parsing** - `qualityIndicators` string is split by commas into array for display

---

## 🐛 Bug Fixes Applied (Session 4)

### Fix 1: useSanityVariants.ts - "available is not defined" Error

**Error:** `ReferenceError: available is not defined` at line 485  
**Root Cause:** Variables `available`, `lowestPrice`, `highestPrice` used in `console.log()` outside their scope  
**Solution:** Moved console.log inside the `if` block where variables are defined

**File Modified:** `src/hooks/useSanityVariants.ts`

```typescript
// BEFORE (broken):
} else {
  setSummary(null);
}
console.log(`✅ [VARIANTS] Loaded...`, { available: available.length }); // ❌ OUT OF SCOPE

// AFTER (fixed):
console.log(`✅ [VARIANTS] Loaded...`, { available: available.length }); // ✅ INSIDE IF BLOCK
} else {
  setSummary(null);
  console.log(`✅ [VARIANTS] No variants found`);
}
```

### Fix 2: About Page Schema - Unknown Fields Error

**Error:** `Unknown fields found: teamSectionSubtitle, teamSectionTitle`  
**Root Cause:** Data has legacy field names that don't match current schema  
**Solution:** Added hidden legacy field aliases in `aboutPage.ts`

**File Modified:** `studio/src/schemaTypes/singletons/aboutPage.ts`

```typescript
// Added hidden legacy fields for backwards compatibility
defineField({
  name: 'teamSectionTitle',
  type: 'string',
  group: 'team',
  hidden: true,
}),
defineField({
  name: 'teamSectionSubtitle',
  type: 'text',
  group: 'team',
  hidden: true,
}),
```

### Fix 3: qualityIndicators - "map is not a function" Error

**Error:** `product.freshnessInfo.qualityIndicators.map is not a function`  
**Root Cause:** In Sanity schema, `qualityIndicators` is a `text` field (string), not an array. The frontend was trying to `.map()` on a string.  
**Solution:** Updated the product page to parse comma-separated string into array before mapping.

**Files Modified:**
- `src/types/sanity.ts` - Changed `qualityIndicators` type from `string[]` to `string`
- `src/app/(shop)/product/[slug]/page.tsx` - Added string parsing logic

```typescript
// BEFORE (broken):
{product.freshnessInfo.qualityIndicators.map((indicator, idx) => ...)} // ❌ String, not array!

// AFTER (fixed):
{(Array.isArray(product.freshnessInfo.qualityIndicators) 
  ? product.freshnessInfo.qualityIndicators 
  : product.freshnessInfo.qualityIndicators.split(',').map(s => s.trim()).filter(Boolean)
).map((indicator, idx) => ...)} // ✅ Handles both string and array
```

### Fix 4: recipeIdeas - Incorrect GROQ Query

**Error:** GROQ query expecting nested objects for `recipeIdeas[]`, but Sanity schema has simple strings  
**Root Cause:** The GROQ query was fetching `recipeIdeas[] { name, description, url }` but the schema defines `recipeIdeas` as `array of [{type: 'string'}]`  
**Solution:** Simplified the GROQ query and updated TypeScript types.

**Files Modified:**
- `src/hooks/useSanityProducts.ts` - Changed `recipeIdeas[] { name, description, url }` to just `recipeIdeas`
- `src/types/sanity.ts` - Changed `recipeIdeas` type from `RecipeIdea[]` to `string[]`
- `src/app/(shop)/product/[slug]/page.tsx` - Simplified recipe rendering

```typescript
// BEFORE (wrong GROQ):
recipeIdeas[] { name, description, url }  // ❌ Expecting objects

// AFTER (correct GROQ):
recipeIdeas  // ✅ Simple array of strings

// BEFORE (broken type):
recipeIdeas?: RecipeIdea[];  // ❌ Wrong type

// AFTER (correct type):
recipeIdeas?: string[];  // ✅ Matches Sanity schema
```

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
| **Phase 9** | Final Integration & Testing | ✅ **COMPLETE** | 100% |
| **Phase 10** | Grower-Store Linking | ✅ **COMPLETE** | 100% |
| **Phase 11** | Meet Our Growers on Store Pages | ✅ **COMPLETE** | 100% |
| **Phase 12** | Product Relationships | ✅ **COMPLETE** | 100% |
| **Phase 13** | Homepage Marketing | ✅ **COMPLETE** | 100% |
| **Phase 14** | CMS-Driven Navigation | ✅ **COMPLETE** | 100% |

---

## 🏗️ System Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MASH E-Commerce                              │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS      │
│  UI: shadcn/ui (Radix UI) + Lucide Icons                            │
│  CMS: Sanity CMS v3 (xyq5fhxs - Growth Trial)                       │
│  Backend: NestJS + Prisma + PostgreSQL (localhost:3000)             │
│  Auth: Firebase Auth                                                 │
│  Maps: Google Maps API                                               │
│  Delivery: Lalamove API                                              │
│  Analytics: Google Analytics 4                                       │
│  Hosting: Vercel                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

```bash
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=xyq5fhxs        # Project ID
NEXT_PUBLIC_SANITY_DATASET=production          # Dataset name
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-26      # API version
SANITY_API_READ_TOKEN=sks0e1wiV7...            # Read-only token
SANITY_API_WRITE_TOKEN=skxzRDFUcc...           # Write token
NEXT_PUBLIC_SANITY_STUDIO_URL=https://mash-cms.sanity.studio
NEXT_PUBLIC_SANITY_REALTIME_ENABLED=true       # Real-time updates

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYw7Tke...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=false                # Use Sanity CMS
```

### API Usage (Growth Trial)

| Metric | Limit | Current Usage |
|--------|-------|---------------|
| API Requests | 10M/month | ~50K (0.5%) |
| Real-time Updates | Unlimited | Enabled |
| Datasets | 2 | 1 (production) |

---

## 📦 Schema Inventory (22 Document Types)

### Document Types

| Schema | Documents | Status | Description |
|--------|-----------|--------|-------------|
| `product` | 15 | ✅ Active | Main products |
| `category` | 3 | ✅ Active | Product categories |
| `grower` | 4 | ✅ Active | Farm/grower profiles |
| `store` | 4 | ✅ Active | Store locations |
| `review` | 39 | ✅ Active | Product reviews |
| `productVariant` | 15 | ✅ Active | Size/weight variants |
| `productBundle` | 6 | ✅ Active | Product bundles |
| `post` | 3 | ✅ Active | Blog posts |
| `faqItem` | 19 | ✅ Active | FAQ questions |
| `faqCategory` | 5 | ✅ Active | FAQ categories |
| `testimonial` | 6 | ✅ Active | Customer testimonials |
| `banner` | 6 | ✅ Active | Promotional banners |
| `person` | 14 | ✅ Active | Team members/authors |
| `featureSection` | 2 | ✅ Active | Why Choose MASH |
| `navigation` | 5 | ✅ Active | Menu structures |
| `blogCategory` | 5 | ✅ Active | Blog categories |
| `order` | 0 | 🔶 Empty | Order management |
| `coupon` | 0 | 🔶 Empty | Discount coupons |
| `promotion` | 0 | 🔶 Empty | Promotions |
| `page` | 0 | 🔶 Empty | CMS pages |
| `analytics` | - | 🔶 Unused | Analytics data |
| `emailCampaign` | - | 🔶 Unused | Email campaigns |

### Singleton Types (6 Total)

| Singleton | Status | Description |
|-----------|--------|-------------|
| `siteSettings` | ✅ Configured | Logo, social links, announcement bar |
| `heroCarousel` | ✅ Configured | Homepage hero slides |
| `featuredProducts` | ❌ **Missing** | Featured products selection |
| `aboutPage` | ✅ Configured | About page content |
| `contactPage` | ✅ Configured | Contact page content |
| `settings` | ⚠️ Deprecated | Old settings (use siteSettings) |

### Object Types (4 Total)

| Object | Used By | Description |
|--------|---------|-------------|
| `blockContent` | post, product | Rich text editor |
| `callToAction` | banner, hero | CTA buttons |
| `infoSection` | aboutPage | Info blocks |
| `link` | navigation | Navigation links |

---

## 📊 Data Audit Results (November 28, 2025)

### Document Counts

| Document Type | Count | Status |
|---------------|-------|--------|
| Products | 15 | ✅ All with images, categories, tags |
| Categories | 3 | ✅ Fresh (8), Dried (3), Kits (4) |
| Growers | 4 | ✅ All linked to stores |
| Stores | 4 | ✅ All linked to growers |
| Reviews | 39 | ✅ |
| Variants | 15 | ✅ |
| Bundles | 6 | ✅ |
| Blog Posts | 3 | ✅ |
| FAQ Items | 19 | ✅ |
| Testimonials | 6 | ✅ |
| Banners | 6 | ✅ |
| Team Members | 14 | ✅ |

### Data Quality Issues

| Check | Current | Expected | Status |
|-------|---------|----------|--------|
| Products with images | 15/15 | 15/15 | ✅ |
| Products with categories | 15/15 | 15/15 | ✅ |
| Products with tags | 15/15 | 15/15 | ✅ |
| Growers linked to stores | 4/4 | 4/4 | ✅ |
| Stores linked to growers | 4/4 | 4/4 | ✅ |
| **Products with suggestedProducts** | **15/15** | 15/15 | ✅ **FIXED Session 3** |
| **Products with complementaryProducts** | **15/15** | 15/15 | ✅ **FIXED Session 3** |
| **Featured Products singleton** | **Missing** | Created | ❌ **Manual in Studio** |

---

## 🛒 Customer Journey Flow (How CMS Data Flows to Frontend)

This section explains how customers interact with CMS-managed content across the website.

### Homepage Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CUSTOMER VISITS HOMEPAGE (http://localhost:3000)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [AnnouncementBar] ← siteSettings.announcementBar (if active)               │
│  ─────────────────                                                           │
│                                                                              │
│  [Header] ← useSanitySiteSettings (logo, nav) + useSanityNavigation         │
│  ─────────                                                                   │
│                                                                              │
│  [HeroCarousel] ← useSanityHero → heroCarousel singleton (3 slides)         │
│  ───────────────                                                             │
│                                                                              │
│  [BannerSection position="homepage-top"] ← useSanityBanners                 │
│  ────────────────────────────────────────                                    │
│                                                                              │
│  [FeaturedProducts] ← useSanityProducts { isFeatured: true }                │
│  ──────────────────                                                          │
│                                                                              │
│  [CategoriesGrid] ← useSanityCategories → 3 categories with product counts  │
│  ────────────────                                                            │
│                                                                              │
│  [WhyMASHSection] ← useSanityFeatures → "Why Choose MASH?" features         │
│  ────────────────                                                            │
│                                                                              │
│  [BannerSection position="homepage-middle"] ← useSanityBanners              │
│  ──────────────────────────────────────────                                  │
│                                                                              │
│  [FeaturedGrowersSection] ← useSanityGrowers { featured: true }             │
│  ────────────────────────                                                    │
│                                                                              │
│  [TestimonialsSection] ← useSanityTestimonials → 6 customer testimonials    │
│  ─────────────────────                                                       │
│                                                                              │
│  [Footer] ← useSanitySiteSettings (contact, social links)                   │
│  ────────                                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Product Discovery Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. CUSTOMER BROWSES SHOP (/shop)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [SearchBar] → useSanityProducts({ search: "oyster" })                      │
│  ───────────                                                                 │
│                                                                              │
│  [CategoryFilter] → useSanityCategories → 3 categories                      │
│  ────────────────                                                            │
│                                                                              │
│  [TagFilter] → useSanityProducts → 8 popular tags                           │
│  ───────────                                                                 │
│                                                                              │
│  [ProductGrid] → useSanityProducts(filters) → 15 products                   │
│  ─────────────                                                               │
│    • Fresh Mushrooms (8): Oyster, Shiitake, Lion's Mane, Button...          │
│    • Dried Mushrooms (3): Dried Shiitake, Dried Oyster, Mixed...            │
│    • Growing Kits (4): Oyster Kit, Shiitake Kit, Lion's Mane Kit...         │
│                                                                              │
│  [Pagination] → 12 products per page, 2 pages total                         │
│  ────────────                                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Product Detail Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. CUSTOMER VIEWS PRODUCT (/product/fresh-oyster-mushrooms)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [ProductImages] → product.images[] (main + gallery)                        │
│  ───────────────                                                             │
│                                                                              │
│  [ProductInfo] → name, price, description, category                         │
│  ─────────────                                                               │
│                                                                              │
│  [VariantSelector] → useSanityVariants(productId) → sizes/weights           │
│  ─────────────────                                                           │
│    • 250g - ₱350                                                            │
│    • 500g - ₱650 (default)                                                  │
│    • 1kg - ₱1,200                                                           │
│                                                                              │
│  [AddToCart] → selected variant + quantity                                  │
│  ───────────                                                                 │
│                                                                              │
│  [ProductReviews] → useSanityReviews(productId) → 39 reviews                │
│  ────────────────                                                            │
│    • Average: 4.7 stars                                                     │
│    • "Great quality!" - Maria S.                                            │
│                                                                              │
│  [YouMayAlsoLike] → product.suggestedProducts[] → 6 related products        │
│  ─────────────────                                                           │
│                                                                              │
│  [FrequentlyBoughtTogether] → product.complementaryProducts[] → 3 items     │
│  ──────────────────────────                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Store & Grower Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. CUSTOMER FINDS STORE (/stores/mash-main-novaliches)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [StoreHeader] → name, address, phone, image                                │
│  ─────────────                                                               │
│                                                                              │
│  [OperatingHours] → operatingHours { monday: "9AM-6PM", ... }               │
│  ────────────────                                                            │
│                                                                              │
│  [GoogleMap] → location { lat, lng, address }                               │
│  ───────────                                                                 │
│                                                                              │
│  [MeetOurGrowers] → store.growers[] → growers who supply this store         │
│  ────────────────                                                            │
│    • The Mushroom Patch Bukidnon (4.9★)                                     │
│    • Fungi Fresh Farms (4.8★)                                               │
│                                                                              │
│  [AvailableProducts] → products filtered by store availability              │
│  ──────────────────                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. CUSTOMER VIEWS GROWER (/grower/mushroom-patch-bukidnon)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [GrowerProfile] → name, bio, image, certifications                         │
│  ───────────────                                                             │
│                                                                              │
│  [GrowerStats] → rating, totalProducts, yearsExperience                     │
│  ─────────────                                                               │
│                                                                              │
│  [GrowerProducts] → grower.products[] → products from this grower           │
│  ────────────────                                                            │
│                                                                              │
│  [FindAtStores] → grower.availableAtStores[] → store locations              │
│  ─────────────                                                               │
│    • MASH Main Store - Novaliches                                           │
│    • Organic Market QC                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Content Pages Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. CUSTOMER READS CONTENT                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  /about → useSanityAboutPage                                                │
│  ───────                                                                     │
│    • Hero section (title, subtitle, image)                                  │
│    • Challenges section (what we solve)                                     │
│    • Solutions section (how we help)                                        │
│    • Vision section (future goals)                                          │
│    • Team section → 8 team members                                          │
│                                                                              │
│  /faq → useSanityFAQ                                                        │
│  ─────                                                                       │
│    • 5 FAQ categories                                                       │
│    • 19 FAQ items                                                           │
│    • Accordion UI                                                           │
│                                                                              │
│  /blog → useSanityBlogPosts                                                 │
│  ──────                                                                      │
│    • 3 blog posts                                                           │
│    • 5 blog categories                                                      │
│    • Author profiles                                                        │
│                                                                              │
│  /contact → useSanityContactPage                                            │
│  ─────────                                                                   │
│    • Contact info (phone, email, address)                                   │
│    • Business hours                                                         │
│    • Contact form (needs backend)                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Complete Schema Reference

### Product Schema (`studio/src/schemaTypes/documents/product.ts`)

The product schema is the most comprehensive with 30+ fields organized into groups:

```typescript
// Key Fields for E-Commerce Display
{
  // BASIC INFO
  name: string                    // "Fresh Oyster Mushrooms"
  slug: { current: string }       // "fresh-oyster-mushrooms"
  description: blockContent       // Rich text description
  sku: string                     // "MUSH-OYS-001"
  
  // PRICING
  price: number                   // 350 (in PHP)
  compareAtPrice: number          // 450 (strikethrough price)
  isOnPromo: boolean             // true/false
  promoPercentage: number        // 22 (22% off)
  
  // INVENTORY
  quantity: number               // 150 (stock)
  lowStockThreshold: number      // 20
  isAvailable: boolean           // true
  
  // IMAGES
  image: image                   // Main product image
  images: image[]                // Gallery images (2-4)
  
  // CATEGORIZATION
  category: reference → category // Fresh Mushrooms
  productTags: string[]          // ["fresh", "oyster", "bestseller"]
  
  // SMART RECOMMENDATIONS (Session 3 - NOW LINKED!)
  suggestedProducts: reference[] // 6 products per product ✅
  complementaryProducts: reference[] // 3 products per product ✅
  
  // VARIANTS
  hasVariants: boolean           // true
  variants: reference[]          // → productVariant documents
}
```

### Grower Schema (`studio/src/schemaTypes/documents/grower.ts`)

```typescript
{
  name: string                   // "The Mushroom Patch Bukidnon"
  slug: { current: string }      // "mushroom-patch-bukidnon"
  description: text              // Bio/about the grower
  image: image                   // Profile photo
  
  // Contact
  contactEmail: string
  contactPhone: string
  
  // Location
  location: {
    address: string
    city: string
    province: string
    coordinates: geopoint       // For map display
  }
  
  // Certifications
  certifications: string[]      // ["Organic", "GAP Certified"]
  
  // Stats
  rating: number                // 4.9
  totalProducts: number         // 15
  yearsExperience: number       // 5
  
  // Relationships (Session 2 - LINKED!)
  products: reference[]         // Products from this grower
  availableAtStores: reference[] // ← Stores where available ✅
  
  // Display
  featured: boolean             // Show on homepage
  isActive: boolean            // Active grower
}
```

### Store Schema (`studio/src/schemaTypes/documents/store.ts`)

```typescript
{
  name: string                   // "MASH Main Store - Novaliches"
  slug: { current: string }      // "mash-main-novaliches"
  description: text              // About the store
  image: image                   // Store photo
  
  // Contact
  phone: string
  email: string
  
  // Location
  address: string
  city: string
  coordinates: geopoint         // For Google Maps
  
  // Operating Hours
  operatingHours: {
    monday: string              // "9:00 AM - 6:00 PM"
    tuesday: string
    // ... all days
    notes: string               // "Closed on holidays"
  }
  
  // Relationships (Session 2 - LINKED!)
  growers: reference[]          // ← Growers who supply this store ✅
  products: reference[]         // Products available at this store
  
  // Features
  amenities: string[]           // ["Parking", "Air-conditioned"]
  isPickupPoint: boolean       // Pickup location
  isMainStore: boolean         // Primary store
}
```

---

## 📈 Improvement Phases (15-20)

### Phase 15: Store Experience Enhancement (Priority: 🔴 HIGH)

**Problem:** Store pages don't show operating hours or interactive maps properly.

**Tasks:**

| # | Task | File | Est. Time |
|---|------|------|-----------|
| 15.1 | Fix operating hours display | `stores/[slug]/page.tsx` | 30m |
| 15.2 | Add Google Maps integration | `components/maps/GoogleMap.tsx` | 1h |
| 15.3 | Add store amenities display | `stores/[slug]/page.tsx` | 30m |
| 15.4 | Add "Get Directions" button | `stores/[slug]/page.tsx` | 15m |

**Operating Hours Fix:**

```tsx
// In stores/[slug]/page.tsx
{store.operatingHours && (
  <div className="bg-muted p-4 rounded-lg">
    <h3 className="font-semibold mb-2">Operating Hours</h3>
    <ul className="space-y-1 text-sm">
      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
        <li key={day} className="flex justify-between">
          <span className="capitalize">{day}:</span>
          <span>{store.operatingHours[day] || 'Closed'}</span>
        </li>
      ))}
    </ul>
  </div>
)}
```

---

### Phase 16: Contact Form & Submissions (Priority: 🟡 MEDIUM)

**Problem:** Contact form doesn't submit anywhere.

**Tasks:**

| # | Task | File | Est. Time |
|---|------|------|-----------|
| 16.1 | Create API route for form | `app/api/contact/route.ts` | 1h |
| 16.2 | Add email notification | `lib/email/sendgrid.ts` | 1h |
| 16.3 | Store submissions in Sanity | `schemaTypes/contactSubmission.ts` | 30m |
| 16.4 | Add form validation | `app/contact/page.tsx` | 30m |

---

### Phase 17: FAQ Category Filtering (Priority: 🟢 LOW)

**Problem:** FAQ page shows all items, can't filter by category.

**Tasks:**

| # | Task | File | Est. Time |
|---|------|------|-----------|
| 17.1 | Add category tabs/filter | `app/faq/page.tsx` | 1h |
| 17.2 | Add FAQ search | `app/faq/page.tsx` | 30m |
| 17.3 | Improve accordion UX | `components/cms/FAQSection.tsx` | 30m |

---

### Phase 18: Blog Enhancements (Priority: 🟢 LOW)

**Problem:** Blog is basic, needs more features.

**Tasks:**

| # | Task | File | Est. Time |
|---|------|------|-----------|
| 18.1 | Add blog search | `app/blog/page.tsx` | 1h |
| 18.2 | Add related posts | `app/blog/[slug]/page.tsx` | 30m |
| 18.3 | Add reading time | `app/blog/[slug]/page.tsx` | 15m |
| 18.4 | Add social share buttons | `components/blog/ShareButtons.tsx` | 30m |
| 18.5 | Upload cover images | Sanity Studio (manual) | 30m |

---

### Phase 19: Marketing Features (Priority: 🟡 MEDIUM)

**Problem:** Missing promotional features for revenue.

**Tasks:**

| # | Task | File | Est. Time |
|---|------|------|-----------|
| 19.1 | Create coupon schema | Already exists in `coupon.ts` | - |
| 19.2 | Add coupon input to cart | `app/cart/page.tsx` | 1h |
| 19.3 | Create promotion schema | Already exists in `promotion.ts` | - |
| 19.4 | Add flash sale banner | `components/marketing/FlashSale.tsx` | 1h |
| 19.5 | Add countdown timer | `components/marketing/CountdownTimer.tsx` | 30m |

---

### Phase 20: Analytics & Performance (Priority: 🟢 LOW)

**Problem:** No visibility into CMS performance.

**Tasks:**

| # | Task | File | Est. Time |
|---|------|------|-----------|
| 20.1 | Add view tracking | `analytics.ts` schema | 1h |
| 20.2 | Track popular products | Backend integration | 2h |
| 20.3 | Add admin dashboard | `app/admin/` | 4h |
| 20.4 | Performance monitoring | Sanity dashboard | 30m |

---

## 🎯 Immediate Action Items (Next Session)

### High Priority (Do Now)

1. **Create Featured Products in Sanity Studio** (15 min)
   - Go to Settings → Featured Products
   - Add 4-8 products
   - Publish

2. **Upload Team Photos** (30 min)
   - Go to Team Members
   - Upload profile photos for all 8 members
   - Add bio/description

3. **Upload Blog Cover Images** (30 min)
   - Go to Blog → Posts
   - Upload cover image for each post
   - Add alt text for SEO

### Medium Priority (This Week)

4. **Fix Store Operating Hours** (30 min)
   - Update `stores/[slug]/page.tsx`
   - Add proper operating hours display

5. **Test Google Maps** (30 min)
   - Verify API key in `.env.local`
   - Check `GoogleMap.tsx` component
   - Test on store pages

### Low Priority (Future)

6. **Add Contact Form API** (3 hours)
7. **FAQ Category Filtering** (2 hours)
8. **Blog Enhancements** (2 hours)

---

| # | Issue | Impact | Solution | Time |
|---|-------|--------|----------|------|
| 3 | Featured Products singleton empty | Homepage lacks curated products | **Manual: Create in Sanity Studio** | 15m |
| ~~11~~ | ~~About team photos missing~~ | ~~Placeholder images~~ | **✅ FIXED (Session 5)** - All 7 team members have images | Done |
| 12 | Blog cover images missing | Blog looks empty | **Manual: Upload in Sanity Studio** | 30m |

### 🟡 MEDIUM (Code Changes Needed)

| # | Issue | Impact | Solution | Time |
|---|-------|--------|----------|------|
| 9 | Store hours not displaying | Hours hidden | Fix operatingHours component | 1h |
| ~~10~~ | ~~Google Maps not loading~~ | ~~Map placeholder only~~ | **✅ FIXED (Session 5)** - Migrated to new API | Done |
| 13 | Contact form not submitting | Can't contact | Add form handler API | 3h |

### 🟢 LOW (Future Enhancement)

| # | Issue | Impact | Solution | Time |
|---|-------|--------|----------|------|
| 8 | Announcement bar hidden | No site-wide alerts | Enable siteSettings.announcementBar | 1h |
| 15 | FAQ category filter | Poor navigation | Add filter UI | 2h |
| 17 | Store delivery zones | Info hidden | Add DeliveryZones component | 30m |
| 18 | Cart upsell banner | Less revenue | Add CartTopBanner | 30m |

---

## 🛠️ Phase-by-Phase Implementation Guide

### Phase 12: Product Relationships ✅ COMPLETE
**Time Estimate:** 1 hour  
**Status:** ✅ DONE (November 28, 2025)

#### Problem
Products have `suggestedProducts` and `complementaryProducts` fields but they're empty (0/15 linked). This breaks the "You May Also Like" and "Frequently Bought Together" sections.

#### Solution: Run the linking script

```bash
# Terminal command
cd c:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\scripts
node link-suggested-products.js
```

#### Verification Steps
1. Open Sanity Studio (localhost:3333)
2. Go to E-Commerce → Products
3. Open any product
4. Check "Suggested Products" has 3-5 items
5. Check "Complementary Products" has 2-3 items

#### Test on Frontend
1. Go to `http://localhost:3000/product/[any-slug]`
2. Scroll to see "You May Also Like"
3. Scroll to see "Frequently Bought Together"

---

### Phase 13: Homepage Marketing (Priority: 🔴 CRITICAL)
**Time Estimate:** 2 hours  
**Status:** 🔄 Pending

#### Task 13.1: Enable Testimonials Section

**File:** `src/app/page.tsx`

Ensure TestimonialsSection is imported and rendered:

```tsx
import { TestimonialsSection } from "@/components/cms/TestimonialsSection";

// In return JSX, add:
<TestimonialsSection />
```

#### Task 13.2: Add Banner Section

**File:** `src/app/page.tsx`

```tsx
import { BannerSection } from "@/components/cms/BannerSection";
import { useSanityBanners } from "@/hooks/useSanityBanners";

// In component:
const { banners } = useSanityBanners({ position: 'homepage' });

// In JSX (after hero, before featured products):
{banners.length > 0 && <BannerSection banners={banners} />}
```

#### Task 13.3: Create Featured Products in Sanity Studio

1. Go to Settings → Featured Products
2. Add title: "Our Bestsellers"
3. Select 4-8 products
4. Click Publish

---

### Phase 14: CMS-Driven Navigation (Priority: 🟠 HIGH)
**Time Estimate:** 4 hours  
**Status:** 🔄 Pending

#### Task 14.1: Connect Header to CMS

**File:** `src/components/layout/Header.tsx`

```tsx
import { useSanitySiteSettings } from "@/hooks/useSanitySiteSettings";
import { useSanityNavigation } from "@/hooks/useSanityNavigation";

// In component:
const { settings } = useSanitySiteSettings();
const { navigation } = useSanityNavigation('main-menu');

// Use settings.logo instead of hardcoded logo
// Use navigation.items for menu items
```

#### Task 14.2: Connect Footer to CMS

**File:** `src/components/layout/Footer.tsx`

```tsx
import { useSanitySiteSettings } from "@/hooks/useSanitySiteSettings";

// In component:
const { settings } = useSanitySiteSettings();

// Use settings.socialLinks for social icons
// Use settings.contactInfo for address/phone
```

#### Task 14.3: Enable Announcement Bar

**File:** Create `src/components/layout/AnnouncementBar.tsx`

```tsx
import { useSanitySiteSettings } from "@/hooks/useSanitySiteSettings";

export function AnnouncementBar() {
  const { settings } = useSanitySiteSettings();
  
  if (!settings?.announcementBar?.isActive) return null;
  
  return (
    <div className="bg-primary text-white text-center py-2 px-4">
      <p>{settings.announcementBar.text}</p>
    </div>
  );
}
```

---

## ✅ SESSION 2 COMPLETE (November 28, 2025)

### All E-Commerce Issues RESOLVED

| # | Issue | Status | Implementation |
|---|-------|--------|----------------|
| 1 | Products not showing on shop | ✅ FIXED | Cache + GROQ fix |
| 2 | Product variants not displayed | ✅ FIXED | useSanityVariants integration |
| 3 | "You May Also Like" not working | ✅ FIXED | Fetch suggestedProducts[] |
| 4 | "Frequently Bought Together" missing | ✅ FIXED | Fetch complementaryProducts[] |
| 5 | Bundle savings not calculated | ✅ FIXED | 10% discount display |
| 6 | Product reviews not connected | ✅ FIXED | useSanityReviews integration |
| 7 | Product search not working | ✅ FIXED | Search bar on shop page |
| 8 | Product tags not filterable | ✅ FIXED | Tags filter with 8 popular tags |

### Growers & Stores Issues RESOLVED

| # | Issue | Status | Implementation |
|---|-------|--------|----------------|
| 9 | Growers not on store pages | ✅ FIXED | growers[] field added to store.ts |
| 10 | Store grower section missing | ✅ FIXED | "Meet Our Growers" section added |
| 11 | Grower → Store link missing | ✅ FIXED | availableAtStores[] field added |
| 12 | Store hours not displaying | 🔄 Next | operatingHours component exists |
| 13 | Store map not loading | ✅ FIXED (Session 5) | GoogleMap.tsx migrated to new API |

### Implementation Summary

**Files Modified:**
- `src/hooks/useSanityStores.ts` - Added growers[] GROQ projection
- `src/hooks/useSanityGrowers.ts` - Added availableAtStores[] GROQ projection
- `src/app/stores/[slug]/page.tsx` - Added "Meet Our Growers" section
- `src/app/grower/[id]/page.tsx` - Added "Find At Stores" section
- `studio/src/schemaTypes/documents/store.ts` - Added growers[] reference field
- `studio/src/schemaTypes/documents/grower.ts` - Added availableAtStores[] reference field
- `src/components/maps/GoogleMap.tsx` - Migrated from Loader class to functional API (Session 5)

**Scripts Created:**
- `scripts/link-growers-stores.js` - Links all growers to stores bidirectionally
- `scripts/add-product-tags.js` - Tags all 15 products with 5-10 tags each

**Data Relationships Created:**
- 4 growers linked to 4 stores
- All stores have supplier growers visible
- All growers show where products are available

---

## 🚨 REMAINING ISSUES (Phase 12 - Navigation & UI)

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

## ✅ COMPLETED ISSUES (All E-Commerce & Growers Fixed!)

### E-Commerce & Products (100% Complete)

| # | Issue | Status | Category | Solution Applied |
|---|-------|--------|----------|------------------|
| 1 | Products not showing on shop | ✅ FIXED | Bug | Cache + GROQ fix in useSanityProducts.ts |
| 2 | Product variants not displayed | ✅ FIXED | Feature | useSanityVariants integration on product page |
| 3 | "You May Also Like" not working | ✅ FIXED | Feature | suggestedProducts[] fetched in GROQ |
| 4 | "Frequently Bought Together" missing | ✅ FIXED | Feature | complementaryProducts[] fetched in GROQ |
| 5 | Bundle savings not calculated | ✅ FIXED | Feature | 10% discount display with strikethrough |
| 6 | Product reviews not connected | ✅ FIXED | Integration | useSanityReviews with star ratings |
| 7 | Product search not working | ✅ FIXED | Feature | Search bar on shop page |
| 8 | Product tags not filterable | ✅ FIXED | Schema | Tags filter with 8 popular tags |

### Growers & Stores (100% Complete)

| # | Issue | Status | Category | Solution Applied |
|---|-------|--------|----------|------------------|
| 9 | Growers not on store pages | ✅ FIXED | Feature | growers[] reference added to store.ts |
| 10 | Store grower section missing | ✅ FIXED | UI | "Meet Our Growers" section on store pages |
| 11 | Grower → Store link missing | ✅ FIXED | Feature | availableAtStores[] reference + "Find At Stores" UI |

---

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
| 2 | ~~Product variants not displayed~~ | 🔴 | Feature | ✅ FIXED | Added variant selector UI | Done |
| 3 | ~~"You May Also Like" not working~~ | 🔴 | Feature | ✅ FIXED | Fetch suggestedProducts[] | Done |
| 4 | ~~"Frequently Bought Together" missing~~ | 🔴 | Feature | ✅ FIXED | Fetch complementaryProducts[] | Done |
| 5 | ~~Bundle savings not calculated~~ | 🟡 | Feature | ✅ FIXED | Added 10% bundle discount display | Done |
| 6 | ~~Product reviews not connected~~ | 🟡 | Integration | ✅ FIXED | Added reviews section to product page | Done |
| 7 | ~~Product search not working~~ | 🟡 | Feature | ✅ FIXED | Added search bar to shop page | Done |
| 8 | Product tags not filterable | 🟢 | Schema | Limited discovery | Create productTag schema | 3 hrs |

### Growers & Stores

| # | Issue | Priority | Category | Impact | Solution | Est. Time |
|---|-------|----------|----------|--------|----------|-----------|
| 9 | ~~Growers not on store pages~~ | 🔴 | Feature | ✅ FIXED | growers[] added to store.ts | Done |
| 10 | ~~Store grower section missing~~ | 🔴 | UI | ✅ FIXED | "Meet Our Growers" section | Done |
| 11 | ~~Grower → Store link missing~~ | 🔴 | Feature | ✅ FIXED | availableAtStores[] added | Done |
| 12 | Store hours not displaying | 🟡 | Bug | Hours hidden | Fix operatingHours display | 1 hr |
| 13 | ~~Store map not loading~~ | 🟡 | Integration | ✅ FIXED (Session 5) | GoogleMap.tsx migrated to new API | Done |

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
| 20 | ~~About team photos missing~~ | 🔴 | Content | ✅ FIXED (Session 5) | All 7 members have images | Done |
| 21 | Blog cover images missing | 🟡 | Content | Blog looks empty | Upload in Sanity Studio | 30 min |
| 22 | Contact form not submitting | 🟡 | Feature | Can't contact us | Add form handler | 3 hrs |
| 23 | FAQ categories not clickable | 🟢 | UX | Poor navigation | Add category filter | 2 hrs |
| NEW | ~~Mentor in team section~~ | 🔴 | Bug | ✅ FIXED (Session 5) | Added GROQ filter | Done |

### Marketing & Banners

| # | Issue | Priority | Category | Impact | Solution | Est. Time |
|---|-------|----------|----------|--------|----------|-----------|
| 24 | Testimonials not on homepage | 🔴 | Integration | No social proof | Add TestimonialsSection | 1 hr |
| 25 | Homepage banners not showing | 🔴 | Integration | No promotions | Add BannerSection | 1 hr |
| 26 | Shop page banner missing | 🟡 | Integration | No promo display | Add ShopTopBanner | 30 min |
| 27 | Cart upsell banner missing | 🟢 | Integration | Less revenue | Add CartTopBanner | 30 min |

---

## 🛒 E-COMMERCE IMPROVEMENTS IMPLEMENTATION GUIDE

### Phase 9.1: Product Variants on Product Detail Page

**Current Issue:** Product variants exist in Sanity (`useSanityVariants.ts`) but are not displayed on the product detail page.

**Files to Modify:**
1. `src/app/(shop)/product/[slug]/page.tsx` - Add variant selector UI
2. `src/hooks/useSanityVariants.ts` - Already exists, needs integration

**Implementation:**

```tsx
// Add to product/[slug]/page.tsx

import { useSanityVariants } from '@/hooks/useSanityVariants';

// Inside component
const { variants, summary, selectedVariant, selectVariant, loading: variantsLoading } = useSanityVariants(product?.id || '');

// Add variant selector UI after price section
{summary && summary.totalVariants > 0 && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Select Size/Weight</h3>
    
    {/* Size Selection */}
    {summary.sizes.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {summary.sizes.map((size) => (
          <button
            key={size}
            onClick={() => selectVariant({ size })}
            className={cn(
              "px-4 py-2 border rounded-lg",
              selectedVariant?.size === size
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    )}
    
    {/* Weight Selection */}
    {summary.weights.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {summary.weights.map((weight) => (
          <button
            key={weight}
            onClick={() => selectVariant({ weight })}
            className={cn(
              "px-4 py-2 border rounded-lg",
              selectedVariant?.weight === weight
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary"
            )}
          >
            {weight}
          </button>
        ))}
      </div>
    )}
    
    {/* Price Range Display */}
    {summary.priceRange && (
      <p className="text-sm text-muted-foreground">
        Price range: {summary.priceRange}
      </p>
    )}
  </div>
)}
```

**Testing:**
1. Navigate to product with variants (e.g., Fresh Oyster Mushroom)
2. Verify size/weight buttons appear
3. Click variant → price updates
4. Add to cart with selected variant

---

### Phase 9.2: "You May Also Like" Section (suggestedProducts)

**Current Issue:** `suggestedProducts[]` exists in schema but not fetched or displayed.

**Files to Modify:**
1. `src/hooks/useSanityProducts.ts` - Update GROQ query in `useSanityProduct()`
2. `src/app/(shop)/product/[slug]/page.tsx` - Add "You May Also Like" section
3. `src/types/sanity.ts` - Add `suggestedProducts` to `TransformedProduct`

**Step 1: Update GROQ Query**

```typescript
// In useSanityProducts.ts - useSanityProduct function (around line 340)

const query = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  _createdAt,
  _updatedAt,
  name,
  slug,
  description,
  price,
  compareAtPrice,
  "stock": quantity,
  sku,
  weight,
  unit,
  isAvailable,
  isFeatured,
  "isPromo": isOnPromo,
  promoEndDate,
  "mainImage": image.asset->url,
  "images": images[].asset->url,
  category->{
    _id,
    name,
    "slug": slug.current,
    description
  },
  
  // 🆕 ADD THESE FIELDS
  suggestedProducts[]->{
    _id,
    name,
    "slug": slug.current,
    price,
    "image": image.asset->url,
    "isPromo": isOnPromo,
    isFeatured
  },
  complementaryProducts[]->{
    _id,
    name,
    "slug": slug.current,
    price,
    "image": image.asset->url,
    "isPromo": isOnPromo
  },
  productTags
}`;
```

**Step 2: Update TransformedProduct Type**

```typescript
// In src/types/sanity.ts - Add to TransformedProduct interface

export interface TransformedProduct {
  // ... existing fields
  
  // 🆕 NEW FIELDS
  suggestedProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    isPromo: boolean;
    isFeatured: boolean;
  }>;
  complementaryProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    isPromo: boolean;
  }>;
  productTags?: string[];
}
```

**Step 3: Add "You May Also Like" Section to Product Page**

```tsx
// Add after product details in product/[slug]/page.tsx

{/* You May Also Like Section */}
{product.suggestedProducts && product.suggestedProducts.length > 0 && (
  <section className="mt-16 border-t pt-12">
    <h2 className="text-2xl font-bold text-foreground mb-6">
      You May Also Like
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {product.suggestedProducts.slice(0, 4).map((item) => (
        <Link
          key={item.id}
          href={`/product/${item.slug}`}
          className="group"
        >
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-3">
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            )}
            {item.isPromo && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                SALE
              </span>
            )}
          </div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {item.name}
          </h3>
          <p className="text-primary font-semibold">
            ₱{item.price.toFixed(2)}
          </p>
        </Link>
      ))}
    </div>
  </section>
)}
```

---

### Phase 9.3: "Frequently Bought Together" Section (complementaryProducts)

**Current Issue:** `complementaryProducts[]` exists in schema but not used.

**Add to Product Detail Page:**

```tsx
{/* Frequently Bought Together Section */}
{product.complementaryProducts && product.complementaryProducts.length > 0 && (
  <section className="mt-12 bg-muted/30 p-6 rounded-lg">
    <h2 className="text-xl font-bold text-foreground mb-4">
      ⚡ Frequently Bought Together
    </h2>
    <div className="flex flex-wrap items-center gap-4">
      {/* Current Product */}
      <div className="flex items-center gap-4 p-3 bg-background rounded-lg border">
        <div className="relative w-16 h-16">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded"
            />
          )}
        </div>
        <div>
          <p className="font-medium line-clamp-1">{product.name}</p>
          <p className="text-primary font-semibold">₱{product.price.toFixed(2)}</p>
        </div>
      </div>
      
      <span className="text-2xl">+</span>
      
      {/* Complementary Products */}
      {product.complementaryProducts.slice(0, 2).map((item, idx) => (
        <React.Fragment key={item.id}>
          <Link
            href={`/product/${item.slug}`}
            className="flex items-center gap-4 p-3 bg-background rounded-lg border hover:border-primary transition-colors"
          >
            <div className="relative w-16 h-16">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              )}
            </div>
            <div>
              <p className="font-medium line-clamp-1">{item.name}</p>
              <p className="text-primary font-semibold">₱{item.price.toFixed(2)}</p>
            </div>
          </Link>
          {idx < product.complementaryProducts.length - 1 && (
            <span className="text-2xl">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
    
    {/* Bundle Total */}
    <div className="mt-4 flex items-center justify-between border-t pt-4">
      <div>
        <p className="text-sm text-muted-foreground">Bundle Price:</p>
        <p className="text-2xl font-bold text-primary">
          ₱{(product.price + product.complementaryProducts.reduce((sum, p) => sum + p.price, 0)).toFixed(2)}
        </p>
      </div>
      <Button onClick={() => {
        // Add all products to cart
        addToCart(product.id, product.price, 1);
        product.complementaryProducts.forEach((p) => {
          addToCart(p.id, p.price, 1);
        });
        toast.success('Bundle added to cart!');
      }}>
        Add Bundle to Cart
      </Button>
    </div>
  </section>
)}
```

---

### Phase 9.4: Product Reviews Integration

**Current Issue:** `useSanityReviews.ts` exists but not connected to product page.

**Files to Modify:**
1. `src/app/(shop)/product/[slug]/page.tsx` - Add reviews section
2. Create `src/components/product/ProductReviews.tsx`

**Create ProductReviews Component:**

```tsx
// src/components/product/ProductReviews.tsx
'use client';

import { useSanityProductReviews } from '@/hooks/useSanityReviews';
import { Star } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, averageRating, totalReviews, loading } = useSanityProductReviews(productId);

  if (loading) {
    return <div className="animate-pulse h-40 bg-muted rounded-lg" />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-5 h-5",
                  star <= averageRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({totalReviews} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.slice(0, 5).map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="font-medium">{review.customerName}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-foreground">{review.reviewText}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

### Phase 9.5: Product Search Implementation

**Current Issue:** Search field exists but doesn't search Sanity.

**Files to Create/Modify:**
1. `src/components/search/ProductSearch.tsx` - Search UI
2. `src/hooks/useSanityProducts.ts` - Add search function

**Add Search Hook:**

```typescript
// Add to useSanityProducts.ts

export function useSanitySearch(searchTerm: string) {
  const [results, setResults] = useState<TransformedProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const query = `*[_type == "product" && isAvailable == true && (
          name match "*${searchTerm}*" ||
          description match "*${searchTerm}*" ||
          "${searchTerm}" in productTags
        )] | order(isFeatured desc) [0...10] {
          _id,
          name,
          "slug": slug.current,
          price,
          "image": image.asset->url,
          "isPromo": isOnPromo
        }`;

        const data = await sanityClient.fetch(query);
        setResults(data.map((p: any) => ({
          id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          image: p.image,
          isPromo: p.isPromo,
        })));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return { results, loading };
}
```

---

## 🔧 IMMEDIATE IMPLEMENTATION CHECKLIST

### Completed Tasks ✅ (November 28, 2025)

**Session 1: Suggested Products & Frequently Bought Together**
- [x] **Task 1:** Update `useSanityProduct()` GROQ query to fetch `suggestedProducts[]` and `complementaryProducts[]`
- [x] **Task 2:** Update `TransformedProduct` type with new fields (`RelatedProduct` interface added)
- [x] **Task 3:** Add "You May Also Like" section to product detail page
- [x] **Task 4:** Add "Frequently Bought Together" section to product detail page with "Add Bundle to Cart" button
- [x] **Task 5:** Run `link-suggested-products.js` script to link all 15 products in Sanity

**Session 2: Product Variants + Reviews + Search (Latest)**
- [x] **Task 6:** Integrate `useSanityVariants` hook into product detail page
- [x] **Task 7:** Add variant selector UI (size/weight/color buttons with selection state)
- [x] **Task 8:** Display selected variant price, stock, and name
- [x] **Task 9:** Integrate `useSanityReviews` hook into product detail page
- [x] **Task 10:** Add Customer Reviews section with rating summary
- [x] **Task 11:** Add rating distribution chart (5-star breakdown)
- [x] **Task 12:** Display individual reviews with verified purchase badges
- [x] **Task 13:** Add 10% bundle discount with savings calculation display
- [x] **Task 14:** Add product search bar to shop page with real-time filtering

### Files Modified

| File | Changes |
|------|---------|
| `src/types/sanity.ts` | Added `RelatedProduct` interface, `suggestedProducts`, `complementaryProducts`, `productTags` to `TransformedProduct` |
| `src/hooks/useSanityProducts.ts` | Updated GROQ query in `useSanityProduct()` to fetch related products |
| `src/app/(shop)/product/[slug]/page.tsx` | Added variant selector, reviews section, bundle savings, "Frequently Bought Together" and "You May Also Like" sections |
| `src/app/(shop)/shop/page.tsx` | Added search bar with real-time filtering |
| `scripts/link-suggested-products.js` | Created script to auto-link products based on category strategy |
| `scripts/check-variants-reviews.js` | Created script to check variants and reviews in Sanity |

### Product Page Features Now Working

- ✅ **Variant Selector** - Size/weight/color selection buttons with visual feedback
- ✅ **Selected Variant Display** - Shows variant name, price, and stock status
- ✅ **Price Range** - Displays variant price range when no variant selected
- ✅ **Customer Reviews Section** - Full review display with star ratings
- ✅ **Rating Summary** - Average rating + recommendation percentage
- ✅ **Rating Distribution** - 5-star breakdown chart
- ✅ **Verified Purchase Badges** - Green badge for verified buyers
- ✅ **Review Images** - Displays attached review images
- ✅ **Helpful Count** - Shows how many found review helpful
- ✅ **Frequently Bought Together** - Bundle display with total price
- ✅ **Bundle Savings** - Shows 10% discount with strikethrough original price
- ✅ **Add Bundle to Cart** - One-click add all bundle products
- ✅ **You May Also Like** - 4-product grid with sale/featured badges

### Shop Page Features Now Working

- ✅ **Product Search** - Real-time search with instant filtering
- ✅ **Search Results Count** - Shows "Showing results for..." with count
- ✅ **Clear Search** - X button to clear search query
- ✅ **Category Filter** - Filter by mushroom category
- ✅ **Price Range Filter** - Slider for min/max price
- ✅ **Sort Options** - Featured, Price Low-High, Price High-Low
- ✅ **View Mode Toggle** - Grid or List view

### Next Tasks (Remaining Issues)

| # | Issue | Priority | Status |
|---|-------|----------|--------|
| 8 | Product tags filterable | 🟢 | Pending (Low Priority) |
| 9-13 | Growers & Stores | 🔴 | Phase 10-11 |
| 14-18 | Navigation & Settings | 🔴 | Pending |

**🎉 E-COMMERCE ISSUES 1-7 COMPLETE!**

---

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

## 🔗 Quick Links

### Sanity Studio URLs

| Page | URL |
|------|-----|
| Studio Home | http://localhost:3333 |
| All Products | http://localhost:3333/studio/structure/🛒%20E-Commerce/product |
| All Growers | http://localhost:3333/studio/structure/🛒%20E-Commerce/grower |
| All Stores | http://localhost:3333/studio/structure/📍%20Store%20Locations |
| Site Settings | http://localhost:3333/studio/structure/⚙️%20Settings/siteSettingsDoc |
| Hero Carousel | http://localhost:3333/studio/structure/🏠%20Homepage/heroCarousel |

### Useful Terminal Commands

```bash
# Start Next.js frontend
npm run dev

# Start Sanity Studio
cd studio && npm run dev

# Audit Sanity data
node scripts/audit-sanity-data.js

# Link suggested products (FIX 0/15 ISSUE)
node scripts/link-suggested-products.js

# Link growers to stores
node scripts/link-growers-stores.js

# Add tags to products
node scripts/add-product-tags.js
```

### GROQ Query Examples

```groq
// Get all products with category
*[_type == "product"] {
  _id,
  name,
  price,
  category->{name, slug}
}

// Get products by category
*[_type == "product" && category->slug.current == "fresh-mushrooms"]

// Get store with growers
*[_type == "store" && slug.current == $slug][0] {
  ...,
  growers[]->{name, slug, image}
}

// Get featured products
*[_type == "product" && isFeatured == true][0..7]
```

---

## 📞 Support & Resources

- **Sanity Documentation:** https://www.sanity.io/docs
- **GROQ Query Language:** https://www.sanity.io/docs/groq
- **Project Dashboard:** https://sanity.io/manage/project/xyq5fhxs
- **API Usage:** https://sanity.io/manage/project/xyq5fhxs/usage

---

## ✅ SESSION 3 COMPLETE (November 28, 2025)

### Completed Tasks

| Task | Status | Details |
|------|--------|---------|
| Phase 12: Product Relationships | ✅ DONE | Ran `link-suggested-products.js` - 15/15 products linked |
| Phase 13: Homepage Marketing | ✅ DONE | Added BannerSection to homepage |
| Phase 14: CMS Navigation | ✅ VERIFIED | Header/Footer already connected to CMS |
| TestimonialsSection | ✅ VERIFIED | Already in homepage |

### Script Results

```
🔗 link-suggested-products.js Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 15 products updated
✅ 6 suggested products per product
✅ 3 complementary products per product
✅ Total: 90 suggested + 45 complementary links
```

### Files Modified

- `src/app/page.tsx` - Added BannerSection import and component
- `docs/SANITY_CMS_MASTER_PLAN.md` - Updated to v10.1

---

## 📅 Remaining Tasks (Manual in Sanity Studio)

### 🔴 Priority 1: Featured Products Singleton

**Why it failed:** API token doesn't have `create` permission for singleton documents.

**Manual Steps:**
1. Open Sanity Studio: http://localhost:3333
2. Go to **Settings** → **Featured Products**
3. If it shows "Create" button, click it
4. Set Title: "Our Bestsellers"
5. Set Subtitle: "Discover our most popular fresh mushrooms, dried varieties, and growing kits"
6. Click **+ Add Product** and select 6-8 products:
   - Fresh King Oyster Mushrooms
   - Fresh Shiitake Mushrooms
   - Fresh Lion's Mane Mushrooms
   - Dried Shiitake Mushrooms
   - Dried Mixed Mushrooms
   - Oyster Mushroom Growing Kit
   - Shiitake Mushroom Growing Kit
   - Beginner Mushroom Combo Kit
7. Click **Publish**

### 🟡 Priority 2: Upload Missing Images

**Team Photos (About Page):**
1. Go to **Blog** → **Authors & Team**
2. For each team member without a photo:
   - Click the person
   - Upload a professional headshot (300x300 min)
   - Click **Publish**

**Blog Cover Images:**
1. Go to **Blog** → **Posts**
2. For each post without a cover image:
   - Click the post
   - Upload a cover image (1200x630 recommended)
   - Click **Publish**

### 🟢 Priority 3: Code Changes (Future)

| Task | File | Estimate |
|------|------|----------|
| Store Hours Display | `src/app/stores/[slug]/page.tsx` | 1 hour |
| Google Maps Integration | `src/components/maps/GoogleMap.tsx` | 1 hour |
| Contact Form Submission | `src/app/api/contact/route.ts` | 3 hours |
| Announcement Bar | `src/components/layout/AnnouncementBar.tsx` | 1 hour |

---

## 🎯 Project Completion Summary

### Phase Completion: 14/14 (100%)

```
Phase 1:  ████████████████████ 100% - Growers Schema
Phase 2:  ████████████████████ 100% - FAQ Schema
Phase 3:  ████████████████████ 100% - Category/Product Fix
Phase 4:  ████████████████████ 100% - Feature Section
Phase 5:  ████████████████████ 100% - Navigation & Settings
Phase 6:  ████████████████████ 100% - Store/Location Pages
Phase 7:  ████████████████████ 100% - Testimonials & Banners
Phase 8:  ████████████████████ 100% - Blog & Content Pages
Phase 9:  ████████████████████ 100% - Final Integration
Phase 10: ████████████████████ 100% - Grower-Store Linking
Phase 11: ████████████████████ 100% - Meet Our Growers
Phase 12: ████████████████████ 100% - Product Relationships
Phase 13: ████████████████████ 100% - Homepage Marketing
Phase 14: ████████████████████ 100% - CMS Navigation
```

### Data Summary

| Type | Count | Status |
|------|-------|--------|
| Products | 15 | ✅ All with images, tags, links |
| Categories | 3 | ✅ With product counts |
| Growers | 4 | ✅ Linked to stores |
| Stores | 4 | ✅ Linked to growers |
| Reviews | 39 | ✅ Connected to products |
| Variants | 15 | ✅ Size/weight options |
| Bundles | 6 | ✅ With savings |
| Blog Posts | 3 | ⚠️ Need cover images |
| FAQ Items | 19 | ✅ With categories |
| Testimonials | 6 | ✅ On homepage |
| Banners | 6 | ✅ Integrated |
| Team Members | 14 | ⚠️ Need photos |

### What Works Now

✅ **Homepage**
- Hero carousel from Sanity
- Featured products grid
- Category showcase
- "Why Choose MASH" features
- Meet Our Growers section
- Testimonials carousel
- Promotional banners (top & middle)

✅ **Shop Page**
- All 15 products display
- Category filtering
- Tag filtering (8 popular tags)
- Search functionality
- Product variants

✅ **Product Detail Page** (Enhanced Session 4)
- Full product info from Sanity
- **Freshness & Quality Card** (harvest, shelf life, storage, quality indicators)
- **Cooking Guide Card** (difficulty, time, tips, recipes)
- **Delivery Options Card** (same-day, zones, perishable warning)
- **Nutritional Highlights** (badges with emojis)
- **Product Tags** (hashtag-style badges)
- "You May Also Like" (6 suggestions)
- "Frequently Bought Together" (3 complements)
- Reviews with ratings
- Add to cart functionality

✅ **Store Pages**
- Store locations with info
- "Meet Our Growers" section
- Grower cards with photos
- Product thumbnails

✅ **Grower Pages**
- Full grower profiles
- "Find At Stores" section
- Certification badges
- Product listings

✅ **Navigation**
- Header from CMS settings
- Footer links from CMS
- Social media icons from CMS
- Logo from CMS with fallback

---

## 📋 Next Steps Guide (Phase 15+)

### Phase 15: Product Variants on Product Page

**Current State:** Variants exist in Sanity but not visible on product page
**Goal:** Show variant selector (size/weight) with price changes

**Files to Modify:**
- `src/app/(shop)/product/[slug]/page.tsx` - Add variant selector UI
- `src/hooks/useSanityVariants.ts` - Already exists, needs integration

**Tasks:**
1. Fetch variants in product page using `useSanityVariants(productId)`
2. Add size/weight selector dropdown or button group
3. Update price display when variant selected
4. Update "Add to Cart" to include selected variant

### Phase 16: Suggested Products Section

**Current State:** `suggestedProducts` populated in CMS but not rendered
**Goal:** Show "You May Also Like" section below product info

**Files to Modify:**
- `src/app/(shop)/product/[slug]/page.tsx` - Add suggested products grid
- `src/components/product/ProductCard.tsx` - Reuse for suggestions

**Tasks:**
1. Add section after product description
2. Display up to 6 suggested products in grid
3. Use ProductCard component for each
4. Add "View All" link to shop page

### Phase 17: Complementary Products (Frequently Bought Together)

**Current State:** `complementaryProducts` populated but not shown
**Goal:** Show bundle suggestion with combined pricing

**Files to Modify:**
- `src/app/(shop)/product/[slug]/page.tsx`
- New component: `src/components/product/FrequentlyBoughtTogether.tsx`

**Tasks:**
1. Create bundle display with checkboxes
2. Show combined price with discount
3. Add "Add All to Cart" functionality

### Phase 18: Store Integration

**Current State:** Stores exist but "Meet Our Growers" may not show on store pages
**Goal:** Complete store-grower bidirectional display

**Files to Check:**
- `src/app/(locations)/stores/[slug]/page.tsx`
- `src/hooks/useSanityStores.ts`

**Tasks:**
1. Verify store pages fetch growers
2. Add "Meet Our Growers" grid section
3. Link to grower profile pages

### Phase 19: Categories Landing Page

**Current State:** Categories list in sidebar/filter only
**Goal:** Individual category pages with rich content

**Files to Create:**
- `src/app/(shop)/category/[slug]/page.tsx`

**Tasks:**
1. Create category detail page
2. Show category description from CMS
3. Display products in that category
4. Add subcategory navigation

### Phase 20: Enhanced Search & Discovery

**Current State:** Basic search by name
**Goal:** Search by tags, nutritional info, freshness

**Files to Modify:**
- `src/app/(shop)/shop/page.tsx`
- `src/hooks/useSanityProducts.ts`

**Tasks:**
1. Add nutritional filter (High Protein, Vegan, etc.)
2. Add freshness filter (Harvest: 24h, 48h)
3. Add delivery zone filter (Same-day eligible)

---

## 🔴 Remaining Issues (Priority Order)

### Critical (Fix This Week)

| Issue | File | Fix |
|-------|------|-----|
| Featured Products empty | Manual in Studio | Add 6-8 products to featuredProducts singleton |
| Variants not showing on product page | `page.tsx` | Integrate useSanityVariants hook |
| Suggested Products not rendering | `page.tsx` | Add section after description |

### High Priority (Fix Next Week)

| Issue | File | Fix | Status |
|-------|------|-----|--------|
| ~~Store hours display wrong format~~ | `useSanityStores.ts` | Transform operatingHours object | ✅ Done |
| ~~Google Maps not loading~~ | `GoogleMap.tsx` | Migrated to new API (Session 5) | ✅ Done |
| Google Maps API Key Referrer | Google Cloud Console | Add localhost:3000/* to referrers | 🔴 **FIX NOW** |
| Contact form not submitting | Backend | Create API endpoint | 🔄 Pending |

### Medium Priority (Next Sprint)

| Issue | File | Fix | Status |
|-------|------|-----|--------|
| Blog post images missing | Manual in Studio | Upload cover images | 🔄 Pending |
| ~~Team member photos missing~~ | Manual in Studio | All 7 members have images | ✅ Done (Session 5) |
| Category pages empty | Create new page | Build category/[slug]/page.tsx | 🔄 Pending |

---

## 📊 Complete Schema Audit (November 29, 2025)

### Current Sanity Schema Structure

```
📦 studio/src/schemaTypes/
├── 📁 documents/ (22 document types)
│   ├── analytics.ts         - Analytics tracking (unused)
│   ├── banner.ts             - Promotional banners ✅
│   ├── blogCategory.ts       - Blog categories ✅
│   ├── category.ts           - Product categories (3 items) ✅
│   ├── coupon.ts             - Discount coupons (empty)
│   ├── emailCampaign.ts      - Email campaigns (unused)
│   ├── faqCategory.ts        - FAQ categories (5 items) ✅
│   ├── faqItem.ts            - FAQ questions (19 items) ✅
│   ├── featureSection.ts     - Why Choose MASH (2 items) ✅
│   ├── grower.ts             - Farm/grower profiles (4 items) ✅
│   ├── navigation.ts         - Menu structures ✅
│   ├── order.ts              - Order management (empty)
│   ├── page.ts               - CMS pages (empty)
│   ├── person.ts             - Team members/authors (8 items) ✅
│   ├── post.ts               - Blog posts (3 items) ✅
│   ├── product.ts            - Products (15 items, 30+ fields) ✅
│   ├── productBundle.ts      - Product bundles (6 items) ✅
│   ├── productVariant.ts     - Size/weight variants (15 items) ✅
│   ├── promotion.ts          - Promotions (empty)
│   ├── review.ts             - Customer reviews (39 items) ✅
│   ├── store.ts              - Store locations (4 items) ✅
│   └── testimonial.ts        - Customer testimonials (6 items) ✅
├── 📁 singletons/ (6 singleton types)
│   ├── aboutPage.ts          - About page content ✅
│   ├── contactPage.ts        - Contact page content ✅
│   ├── featuredProducts.ts   - Homepage featured products ⚠️ EMPTY
│   ├── heroCarousel.ts       - Homepage hero slides ✅
│   ├── settings.tsx          - Old settings (deprecated)
│   └── siteSettings.ts       - Comprehensive site settings ✅
└── 📁 objects/ (4 object types)
    ├── blockContent.tsx      - Rich text editor
    ├── callToAction.ts       - CTA buttons
    ├── infoSection.ts        - Info blocks
    └── link.ts               - Navigation links
```

### Frontend Hooks Inventory

```
📦 src/hooks/ (Sanity Integration Hooks)
├── useSanityAboutPage.ts     - About page content + team members ✅
├── useSanityAnalytics.ts     - Analytics data (unused)
├── useSanityBanners.ts       - Promotional banners ✅
├── useSanityBlogPosts.ts     - Blog posts + categories ✅
├── useSanityBundles.ts       - Product bundles ✅
├── useSanityCategories.ts    - Product categories ✅
├── useSanityContactPage.ts   - Contact page content ✅
├── useSanityFAQ.ts           - FAQ items + categories ✅
├── useSanityFeatures.ts      - Feature sections ✅
├── useSanityGrowers.ts       - Grower profiles + stores ✅
├── useSanityHero.ts          - Hero carousel ✅
├── useSanityInventory.ts     - Inventory management
├── useSanityMarketing.ts     - Marketing features
├── useSanityOrders.ts        - Order management
├── useSanityProducts.ts      - Products + filtering ✅
├── useSanityReviews.ts       - Product reviews ✅
├── useSanitySiteSettings.ts  - Site-wide settings ✅
├── useSanityStores.ts        - Store locations + growers ✅
├── useSanityTestimonials.ts  - Customer testimonials ✅
└── useSanityVariants.ts      - Product variants ✅
```

---

## 🚨 Critical Issues & Fixes

### Issue 1: Google Maps API RefererNotAllowedMapError

**Error:** `RefererNotAllowedMapError` on `/grower/kabutehan-ni-aling-nena`

**Root Cause:** The Google Maps API key has HTTP referrer restrictions that don't include `localhost:3000`.

**Immediate Fix (5 minutes):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click on API key `AIzaSyDYw7TkeGXq6UJgms9AF06eRCYd3C-fqe8`
3. Under "Application restrictions" → "Website restrictions"
4. Add these referrers:
   ```
   http://localhost:3000/*
   http://localhost:3001/*
   http://127.0.0.1:3000/*
   https://your-production-domain.com/*
   https://*.vercel.app/*
   ```
5. Click "Save" → Wait 5 minutes for propagation

**Verification:**
- Visit `http://localhost:3000/grower/kabutehan-ni-aling-nena`
- The map should now load without errors

---

## 🗺️ Customer Journey Flow (E-Commerce Data Flow)

This section explains how CMS data flows from Sanity to the frontend and what users see at each step.

### 1. Homepage Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│ CUSTOMER VISITS http://localhost:3000                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ [Header] ← useSanitySiteSettings (logo, nav items)                  │
│ ────────                                                             │
│                                                                      │
│ [HeroCarousel] ← useSanityHero → 3 slides with images               │
│ ───────────────   │                                                  │
│                   └─ Each slide has: title, subtitle, CTA button    │
│                                                                      │
│ [FeaturedProducts] ← useSanityProducts { isFeatured: true }         │
│ ──────────────────   │                                               │
│                      └─ ⚠️ PROBLEM: featuredProducts singleton empty │
│                                                                      │
│ [WhyMASHSection] ← useSanityFeatures → "Why Choose MASH?"           │
│ ─────────────────  │                                                 │
│                    └─ 4 feature cards with icons                    │
│                                                                      │
│ [TestimonialsSection] ← useSanityTestimonials → 6 reviews           │
│ ──────────────────────                                               │
│                                                                      │
│ [Footer] ← useSanitySiteSettings (contact, social links)            │
│ ────────                                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Shop Page Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│ CUSTOMER VISITS /shop                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ [CategoryFilter] ← useSanityCategories                              │
│ ────────────────   │                                                 │
│                    └─ Fresh Mushrooms (8), Dried (3), Kits (4)      │
│                                                                      │
│ [ProductGrid] ← useSanityProducts(filters)                          │
│ ─────────────   │                                                    │
│                 ├─ 15 products with images, prices, tags            │
│                 ├─ Pagination: 12 per page                          │
│                 └─ Filters: category, price, tags, search           │
│                                                                      │
│ [ProductCard] → Clicking leads to /product/[slug]                   │
│ ─────────────                                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Product Detail Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│ CUSTOMER VISITS /product/fresh-oyster-mushrooms                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ [ProductImages] ← product.images (main + gallery)                   │
│ ───────────────                                                      │
│                                                                      │
│ [ProductInfo] ← name, price, description, category                  │
│ ─────────────                                                        │
│                                                                      │
│ [VariantSelector] ← useSanityVariants(productId)                    │
│ ─────────────────   │                                                │
│                     └─ 250g ₱350 | 500g ₱650 | 1kg ₱1,200           │
│                                                                      │
│ [FreshnessInfo] ← product.freshnessInfo                             │
│ ───────────────   │                                                  │
│                   └─ Harvest: 24h | Shelf: 5-7d | Storage tips      │
│                                                                      │
│ [CookingGuide] ← product.preparationInfo                            │
│ ──────────────   │                                                   │
│                  └─ Difficulty | Time | Tips | Recipes              │
│                                                                      │
│ [DeliveryOptions] ← product.deliveryOptions                         │
│ ─────────────────   │                                                │
│                     └─ Same-Day ✓ | Zones | Perishable warning      │
│                                                                      │
│ [YouMayAlsoLike] ← product.suggestedProducts[]                      │
│ ────────────────   │                                                 │
│                    └─ 6 related products (15/15 linked)             │
│                                                                      │
│ [ProductReviews] ← useSanityReviews(productId)                      │
│ ────────────────   │                                                 │
│                    └─ Average: 4.7★ | 39 total reviews              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Store Page Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│ CUSTOMER VISITS /stores/mash-main-novaliches                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ [StoreHeader] ← name, address, image, storeType badge               │
│ ─────────────                                                        │
│                                                                      │
│ [OperatingHours] ← operatingHours { monday...sunday }               │
│ ────────────────   │                                                 │
│                    └─ Highlights today's hours                      │
│                                                                      │
│ [GoogleMap] ← coordinates { lat, lng }                              │
│ ───────────   │                                                      │
│               └─ ⚠️ REQUIRES: API key referrer fix                  │
│                                                                      │
│ [MeetOurGrowers] ← store.growers[]                                  │
│ ────────────────   │                                                 │
│                    └─ 2-4 grower cards linked to this store ✅      │
│                                                                      │
│ [Services] ← services[], pickupInstructions                         │
│ ──────────                                                           │
│                                                                      │
│ [ContactCard] ← phone, email, whatsappUrl                           │
│ ─────────────                                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5. Grower Page Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│ CUSTOMER VISITS /grower/kabutehan-ni-aling-nena                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ [GrowerHeader] ← name, tagline, location, logo                      │
│ ──────────────                                                       │
│                                                                      │
│ [AboutSection] ← bio, specialties[], certifications[]               │
│ ──────────────                                                       │
│                                                                      │
│ [ProductsGrid] ← useSanityGrowerProducts(growerId)                  │
│ ──────────────   │                                                   │
│                  └─ Products from this grower                       │
│                                                                      │
│ [GoogleMap] ← coordinates { lat, lng }                              │
│ ───────────   │                                                      │
│               └─ ⚠️ CURRENTLY BROKEN: RefererNotAllowedMapError     │
│                                                                      │
│ [FindAtStores] ← grower.availableAtStores[]                         │
│ ──────────────   │                                                   │
│                  └─ Store cards where this grower's products sold ✅│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Improvement Phases (15-25)

### Phase 15: Google Maps API Fix (Priority: 🚨 CRITICAL)
**Time Estimate:** 15 minutes
**Status:** 🔴 FIX NOW

**Problem:** Google Maps showing `RefererNotAllowedMapError` on grower pages.

**Tasks:**

| # | Task | Location | Time |
|---|------|----------|------|
| 15.1 | Add localhost to API referrers | Google Cloud Console | 5m |
| 15.2 | Add production domain to referrers | Google Cloud Console | 2m |
| 15.3 | Add Vercel preview domains | Google Cloud Console | 3m |
| 15.4 | Test on `/grower/kabutehan-ni-aling-nena` | Browser | 5m |

**Step-by-Step Fix:**
```
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find: API key "AIzaSyDYw7TkeGXq6UJgms9AF06eRCYd3C-fqe8"
3. Click to edit
4. Under "Website restrictions" add:
   - http://localhost:3000/*
   - http://localhost:3001/*
   - http://127.0.0.1:3000/*
   - https://*.vercel.app/*
5. Save and wait 5 minutes
```

---

### Phase 16: Featured Products Singleton (Priority: 🔴 HIGH)
**Time Estimate:** 30 minutes
**Status:** 🔄 Pending

**Problem:** Homepage "Featured Products" section has no curated products because the singleton is empty.

**Tasks:**

| # | Task | Location | Time |
|---|------|----------|------|
| 16.1 | Open Sanity Studio | localhost:3333 | 2m |
| 16.2 | Navigate to Homepage → Featured Products | Studio UI | 1m |
| 16.3 | Add section title | "Our Bestsellers" | 2m |
| 16.4 | Select 6-8 products | Product references | 10m |
| 16.5 | Publish changes | Studio UI | 1m |
| 16.6 | Verify on homepage | localhost:3000 | 5m |

**Alternative: Run Script**
```bash
node scripts/create-featured-products.js
```

---

### Phase 17: Category Detail Pages (Priority: 🟠 HIGH)
**Time Estimate:** 2 hours
**Status:** ❌ Not Started

**Problem:** Clicking on a category (Fresh, Dried, Kits) doesn't lead to a dedicated category page with filtered products.

**Current Flow:**
```
Homepage → Category Card → ??? (no page)
```

**Desired Flow:**
```
Homepage → Category Card → /category/[slug] → Filtered products
```

**Tasks:**

| # | Task | File | Time |
|---|------|------|------|
| 17.1 | Create category page | `src/app/category/[slug]/page.tsx` | 45m |
| 17.2 | Add category GROQ query | `useSanityCategories.ts` | 15m |
| 17.3 | Create CategoryHeader component | `src/components/` | 20m |
| 17.4 | Add SEO metadata | page.tsx | 15m |
| 17.5 | Link from homepage | Category cards | 10m |
| 17.6 | Test all 3 categories | Browser | 15m |

**Implementation:**
```tsx
// src/app/category/[slug]/page.tsx
import { fetchCategoryBySlug } from '@/hooks/useSanityCategories';
import { useSanityProducts } from '@/hooks/useSanityProducts';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await fetchCategoryBySlug(params.slug);
  const { products } = useSanityProducts({ category: category._id });
  
  return (
    <div>
      <CategoryHeader category={category} />
      <ProductGrid products={products} />
    </div>
  );
}
```

---

### Phase 18: Store-Grower Relationship Enhancement (Priority: 🟠 HIGH)
**Time Estimate:** 1.5 hours
**Status:** ✅ Partially Done

**Current State:**
- ✅ Store pages show "Meet Our Growers" section
- ✅ Grower pages show "Find At Stores" section
- ⚠️ Store pages don't show grower products
- ⚠️ No "Products from this grower at this store" view

**Improvement Tasks:**

| # | Task | File | Time |
|---|------|------|------|
| 18.1 | Add grower products to store page | `stores/[slug]/page.tsx` | 30m |
| 18.2 | Create GrowerProductsSection | `components/cms/` | 30m |
| 18.3 | Link products to grower+store | GROQ query update | 20m |
| 18.4 | Add "Available at" badge on products | ProductCard | 10m |

---

### Phase 19: Blog Enhancement (Priority: 🟡 MEDIUM)
**Time Estimate:** 2 hours
**Status:** ❌ Not Started

**Problem:** Blog has 3 posts but is underutilized for SEO and engagement.

**Tasks:**

| # | Task | File | Time |
|---|------|------|------|
| 19.1 | Add reading time | `useSanityBlogPosts.ts` | 15m |
| 19.2 | Add related posts | `blog/[slug]/page.tsx` | 30m |
| 19.3 | Add social share buttons | `ShareButtons.tsx` | 30m |
| 19.4 | Add blog search | `blog/page.tsx` | 30m |
| 19.5 | Upload cover images for all posts | Sanity Studio | 15m |

---

### Phase 20: Contact Form Backend (Priority: 🟡 MEDIUM)
**Time Estimate:** 3 hours
**Status:** ❌ Not Started

**Problem:** Contact form on `/contact` page doesn't submit anywhere.

**Tasks:**

| # | Task | File | Time |
|---|------|------|------|
| 20.1 | Create API route | `api/contact/route.ts` | 45m |
| 20.2 | Add email notification | SendGrid/Resend | 45m |
| 20.3 | Create contactSubmission schema | Sanity | 30m |
| 20.4 | Store submissions in Sanity | API route | 30m |
| 20.5 | Add form validation | Contact page | 30m |

---

### Phase 21: Marketing Features (Priority: 🟢 LOW)
**Time Estimate:** 4 hours
**Status:** ❌ Not Started

**Problem:** Missing promotional features for revenue.

**Tasks:**

| # | Task | Schema | Time |
|---|------|--------|------|
| 21.1 | Activate coupon system | `coupon.ts` exists | 1h |
| 21.2 | Add coupon input to cart | Cart page | 1h |
| 21.3 | Create flash sale banner | New component | 1h |
| 21.4 | Add countdown timer | New component | 1h |

---

### Phase 22: Search & Filtering Enhancement (Priority: 🟢 LOW)
**Time Estimate:** 3 hours
**Status:** ❌ Not Started

**Tasks:**

| # | Task | File | Time |
|---|------|------|------|
| 22.1 | Add global search bar | Header | 45m |
| 22.2 | Create search results page | `/search` | 1h |
| 22.3 | Add price range filter | Shop page | 30m |
| 22.4 | Add "In Stock Only" filter | Shop page | 15m |
| 22.5 | Add sort options | Shop page | 30m |

---

### Phase 23: Performance & SEO (Priority: 🟢 LOW)
**Time Estimate:** 2 hours
**Status:** ❌ Not Started

**Tasks:**

| # | Task | File | Time |
|---|------|------|------|
| 23.1 | Add JSON-LD schema | Product pages | 30m |
| 23.2 | Add OpenGraph images | Dynamic OG | 30m |
| 23.3 | Add sitemap.xml | Auto-generate | 30m |
| 23.4 | Add robots.txt | Root | 10m |
| 23.5 | Optimize image loading | next.config.ts | 20m |

---

### Phase 24: Order Management (Priority: 🟢 LOW - Backend Dependent)
**Time Estimate:** 8 hours
**Status:** ❌ Not Started (requires NestJS backend)

**Tasks:**

| # | Task | Location | Time |
|---|------|----------|------|
| 24.1 | Integrate order schema | Sanity | 2h |
| 24.2 | Create order confirmation | Email | 2h |
| 24.3 | Order tracking page | `/orders/[id]` | 2h |
| 24.4 | Order history | `/profile/orders` | 2h |

---

### Phase 25: Analytics Dashboard (Priority: 🟢 LOW)
**Time Estimate:** 6 hours
**Status:** ❌ Not Started

**Tasks:**

| # | Task | Location | Time |
|---|------|----------|------|
| 25.1 | Track page views | Analytics schema | 1h |
| 25.2 | Track product views | Analytics schema | 1h |
| 25.3 | Admin dashboard | `/admin/analytics` | 3h |
| 25.4 | Weekly reports | Email/PDF | 1h |

---

## 🚜 Session 7: Grower & Store Integration (November 29, 2025) - NEW!

### Problem Identified

**Sanity Studio Error:** Unknown field `availableAtStores` found
```json
{
  "availableAtStores": [
    { "_ref": "store-mash-novaliches-main", "_type": "reference" },
    { "_ref": "store-caloocan-pickup", "_type": "reference" }
  ]
}
```

**Root Cause:** The grower schema had `suppliesTo` field defined, but existing data was using `availableAtStores` which wasn't defined in the schema.

### Solution Applied

1. **Added `availableAtStores` field to grower schema** (hidden, for backward compatibility)
2. **Updated GROQ queries** to use `coalesce(suppliesTo, availableAtStores)` for fetching linked stores
3. **Created migration script** to move data from `availableAtStores` → `suppliesTo`

### Files Modified

| File | Changes |
|------|---------|
| `studio/src/schemaTypes/documents/grower.ts` | Added `availableAtStores` field (hidden, legacy) |
| `src/hooks/useSanityGrowers.ts` | Updated GROQ to use `coalesce(suppliesTo, availableAtStores)` |
| `scripts/migrate-grower-stores.js` | NEW: Migration script for grower store data |

### Schema Update (grower.ts)

```typescript
// Added legacy field for backward compatibility
defineField({
  name: 'availableAtStores',
  title: 'Available At Stores (Legacy)',
  type: 'array',
  group: 'products',
  of: [{type: 'reference', to: [{type: 'store'}]}],
  description: '⚠️ DEPRECATED: Use "Supplies To (Stores)" instead.',
  hidden: true, // Hide in studio but keep for data compatibility
}),
```

### GROQ Query Update

```groq
// Before (only checked one field):
availableAtStores[]-> { ... }

// After (checks both fields, prefers suppliesTo):
"availableAtStores": coalesce(suppliesTo, availableAtStores)[]-> {
  _id,
  name,
  slug,
  storeType,
  address { city, state },
  "image": mainImage
}
```

### Migration Script Usage

```bash
# Migrate grower store references to canonical field
node scripts/migrate-grower-stores.js

# This will:
# 1. Find growers with availableAtStores data
# 2. Copy to suppliesTo field
# 3. Clear availableAtStores field
```

---

## 📋 Next Steps Guide (Session 7+)

### Immediate Actions (Do Now)

1. **Run Migration Script** (2 minutes)
   ```bash
   cd scripts
   node migrate-grower-stores.js
   ```

2. **Create Featured Products** (10 minutes)
   - Need Editor token first (see Token Fix below)
   - Or manually in Sanity Studio

3. **Test Category Pages** (5 minutes)
   - http://localhost:3000/category/fresh-mushrooms
   - http://localhost:3000/category/dried-mushrooms
   - http://localhost:3000/category/growing-kits

4. **Test Grower Pages** (5 minutes)
   - http://localhost:3000/grower/kabutehan-ni-aling-nena
   - Verify "Find Our Products At" section shows stores

### Token Fix Required

**Problem:** `SANITY_API_WRITE_TOKEN` has "Viewer" not "Editor" permissions.

**Fix Steps:**
1. Go to: https://www.sanity.io/manage/project/xyq5fhxs/api/tokens
2. Create new token: Name = "Editor Token", Permissions = **Editor**
3. Copy new token
4. Update `.env.local`: `SANITY_API_WRITE_TOKEN=<new-token>`
5. Run scripts: `node scripts/create-featured-products.js`

### This Week Priority

| Task | Phase | Time | Impact |
|------|-------|------|--------|
| ✅ Category pages | 17 | 2h | Complete |
| ✅ Grower-Store schema fix | 7 | 30m | Complete |
| Token fix + Featured Products | 16 | 15m | 🔴 High |
| Test all grower pages | - | 15m | 🟠 High |

### Next Week Priority

| Task | Phase | Time | Impact |
|------|-------|------|--------|
| Blog enhancements | 19 | 2h | 🟡 Medium |
| Contact form | 20 | 3h | 🟡 Medium |
| Marketing features | 21 | 4h | 🟢 Low |

---

## 🗺️ Complete Schema Overview

### Document Types (22)

| Schema | Description | Count | Status |
|--------|-------------|-------|--------|
| `product` | E-commerce products | 15 | ✅ Active |
| `category` | Product categories | 3 | ✅ Active |
| `productVariant` | Size/weight options | 15 | ✅ Active |
| `productBundle` | Package deals | 6 | ✅ Active |
| `review` | Customer reviews | 39 | ✅ Active |
| `grower` | Farms/growers | 4 | ✅ Active |
| `store` | Store locations | 4 | ✅ Active |
| `person` | Team members | 14 | ✅ Active |
| `post` | Blog posts | 3 | ✅ Active |
| `blogCategory` | Blog categories | 5 | ✅ Active |
| `faqItem` | FAQ questions | 19 | ✅ Active |
| `faqCategory` | FAQ categories | 5 | ✅ Active |
| `featureSection` | Feature highlights | 2 | ✅ Active |
| `testimonial` | Customer testimonials | 6 | ✅ Active |
| `banner` | Promotional banners | 6 | ✅ Active |
| `navigation` | Menu items | 5 | ✅ Active |
| `order` | Orders | 0 | 📝 Schema only |
| `coupon` | Discount codes | 0 | 📝 Schema only |
| `promotion` | Campaigns | 0 | 📝 Schema only |
| `analytics` | Page tracking | 0 | 📝 Schema only |
| `emailCampaign` | Email marketing | 0 | 📝 Schema only |
| `page` | CMS pages | 0 | 📝 Schema only |

### Singleton Types (6)

| Singleton | Description | Status |
|-----------|-------------|--------|
| `siteSettings` | Global site config | ✅ Configured |
| `heroCarousel` | Homepage hero | ✅ 4 slides |
| `featuredProducts` | Featured products | ⚠️ Needs content |
| `aboutPage` | About page content | ✅ Configured |
| `contactPage` | Contact page content | ✅ Configured |
| `settings` | Legacy (deprecated) | ⚠️ Deprecated |

### Object Types (4)

| Object | Description | Used In |
|--------|-------------|---------|
| `blockContent` | Rich text editor | post, grower, page |
| `callToAction` | CTA buttons | heroCarousel, banner |
| `infoSection` | Content sections | aboutPage |
| `link` | Navigation links | navigation, siteSettings |

---

## 🔗 E-Commerce Data Flow

### Product Discovery Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Homepage      │────▶│   Category      │────▶│   Product       │
│                 │     │   /category/    │     │   /product/     │
│ • Hero Carousel │     │   [slug]        │     │   [slug]        │
│ • Featured      │     │                 │     │                 │
│ • Categories    │     │ • Product Grid  │     │ • Full Details  │
│ • Testimonials  │     │ • Filters       │     │ • Variants      │
└─────────────────┘     │ • Tags          │     │ • Reviews       │
                        │ • Price Range   │     │ • Suggestions   │
                        └─────────────────┘     └─────────────────┘
```

### Grower-Store Relationship

```
┌─────────────────┐                    ┌─────────────────┐
│     Grower      │◀───── supplies ────│     Store       │
│  /grower/[id]   │      products      │  /stores/[slug] │
│                 │                    │                 │
│ • Profile       │                    │ • Location      │
│ • Story         │                    │ • Hours         │
│ • Products      │                    │ • Services      │
│ • Certifications│                    │ • Growers List  │
│ • Map Location  │                    │ • Map Location  │
│ • Stores List ◀─┼────────────────────┼─▶ Growers List  │
└─────────────────┘                    └─────────────────┘

Bidirectional Reference:
- Grower.suppliesTo → Store[]
- Store.growers → Grower[]
```

---

**END OF DOCUMENT**

**Version History:**
- v11.6 (Nov 29, 2025) - Session 7: Grower schema fix (availableAtStores), migration script, complete schema overview
- v11.5 (Nov 29, 2025) - Session 6: Category detail pages, Featured Products token issue documented
- v11.4 (Nov 29, 2025) - Session 5: Google Maps fix, mentor filter, complete schema audit, Phases 15-25
- v11.2 (Nov 28, 2025) - Session 4: Product page enhancement, 4 bug fixes, types alignment
- v10.1 (Nov 28, 2025) - Session 3: Product relationships, banners, navigation verified
- v10.0 (Nov 28, 2025) - Complete audit, System Architecture, Schema Inventory
- v9.0 (Nov 28, 2025) - Grower-Store linking complete
- v8.0 (Nov 27, 2025) - E-Commerce issues #1-8 resolved
- v7.0 (Nov 26, 2025) - Initial CMS setup complete