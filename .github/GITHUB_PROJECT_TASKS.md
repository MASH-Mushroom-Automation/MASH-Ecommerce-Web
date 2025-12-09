# MASH E-Commerce Platform - GitHub Project Task Documentation

## Project Information

| Field | Value |
|-------|-------|
| Repository | MASH-Mushroom-Automation/MASH-Ecommerce-Web |
| Branch | CMS/Sanity |
| GitHub Project | https://github.com/orgs/MASH-Mushroom-Automation/projects/1/views/1 |
| Total Commits | 112 |
| Files Changed | 339 |
| Timeline | November 19, 2025 - December 3, 2025 |
| Assignee | @PP-Namias |
| Status | Complete |
| GitHub Issues | #36 - #86 |

---

## Task Prefix Legend

| Project Area | Prefix | Description |
|--------------|--------|-------------|
| IoT Device | IOT-### | Chamber automation and sensors |
| Admin Dashboard | ADMIN-### | Administrative interface |
| Mobile App | MOB-### | Mobile application |
| E-Commerce | ECOM-### | Web storefront and CMS |
| Backend | BACK-### | API and server-side logic |

---

## Table of Contents

1. [Epic: ECOM-001](#ecom-001-sanity-cms-implementation)
2. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure)
3. [Phase 2: Shop Integration](#phase-2-shop-integration)
4. [Phase 3: Hero Carousel](#phase-3-hero-carousel)
5. [Phase 4: Real-Time Updates](#phase-4-real-time-updates)
6. [Phase 5: E-Commerce Features](#phase-5-e-commerce-features)
7. [Phase 6: Data Import Scripts](#phase-6-data-import-and-scripts)
8. [Phase 7: Content Migration](#phase-7-content-migration)
9. [Phase 8: Bug Fixes](#phase-8-bug-fixes-and-optimizations)
10. [Phase 9: Enhanced Features](#phase-9-enhanced-features)
11. [Phase 10: Search and Discovery](#phase-10-search-and-discovery)
12. [Phase 11: Real-Time Demo](#phase-11-real-time-demo-features)
13. [Phase 12: Integration Testing](#phase-12-integration-testing)
14. [External Integration](#external-integration)
15. [Summary Statistics](#summary-statistics)
16. [Labels Reference](#labels-reference)

---

## ECOM-001: Sanity CMS Implementation

| Field | Value |
|-------|-------|
| Task ID | ECOM-001 |
| GitHub Issue | [#36](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/36) |
| Type | Epic |
| Priority | Critical |
| Status | Complete |
| Timeline | November 19, 2025 - December 3, 2025 |
| Assignee | @PP-Namias |
| Child Tasks | 50 |
| Commits | 112 |

### Description

Complete implementation of Sanity CMS as the headless content management system for the MASH E-Commerce platform. This epic encompasses all tasks related to CMS configuration, content modeling, frontend integration, real-time updates, data migration, and testing.

### Dependencies

- None (Root Epic)

### Expected Outcomes

- [x] Dual CMS architecture established (Sanity for content, NestJS for transactions)
- [x] 15+ content schemas implemented
- [x] Real-time updates functional with Sanity listen API
- [x] Complete data migration executed
- [x] SEO-friendly slug-based routing implemented
- [x] Lalamove delivery integration complete
- [x] Google Analytics integration complete

### Actual / Notes

- [x] All 112 commits merged successfully
- [x] 339 files changed across the implementation
- [x] Zero critical bugs remaining
- [x] All child tasks completed

### Labels

`epic` `cms` `sanity` `e-commerce` `priority-critical`

---

## Phase 1: Core Infrastructure

---

### ECOM-002: Sanity CMS Configuration and Client Setup

| Field | Value |
|-------|-------|
| Task ID | ECOM-002 |
| GitHub Issue | [#37](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/37) |
| Type | Feature |
| Priority | Critical |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 19, 2025 |
| Assignee | @PP-Namias |

#### Description

Initial Sanity CMS configuration including environment variables, client setup, and GROQ query infrastructure. Establishes the foundation for all CMS operations.

#### Expected Outcomes

- [x] Sanity project configuration (Project ID: xyq5fhxs)
- [x] Environment variables setup (.env.local)
- [x] Sanity client library (src/lib/sanity/)
- [x] Initial GROQ queries
- [x] API version configuration

#### Labels

`infrastructure` `configuration` `sanity`

---

### ECOM-003: Dual CMS Architecture Implementation

| Field | Value |
|-------|-------|
| Task ID | ECOM-003 |
| GitHub Issue | [#38](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/38) |
| Type | Feature |
| Priority | Critical |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 19, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement dual CMS architecture supporting both Sanity CMS for e-commerce data and JSON-based storage for static content. Includes file-based storage operations for hero, features, and FAQ APIs.

#### Expected Outcomes

- [x] Dual CMS architecture documentation
- [x] JSON CMS data files (data/cms/)
- [x] File-based CRUD operations
- [x] CMS database abstraction layer

#### Labels

`architecture` `cms` `data-layer`

---

### ECOM-004: Next.js Image Configuration for Sanity CDN

| Field | Value |
|-------|-------|
| Task ID | ECOM-004 |
| GitHub Issue | [#39](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/39) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 19, 2025 |
| Assignee | @PP-Namias |

#### Description

Configure Next.js image optimization to support Sanity CDN and external image sources including Google Maps.

#### Expected Outcomes

- [x] next.config.ts remote patterns for cdn.sanity.io
- [x] Image domain configuration for maps.googleapis.com
- [x] Image optimization settings

#### Labels

`configuration` `images` `nextjs`

---

## Phase 2: Shop Integration

---

### ECOM-005: Shop Page Sanity Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-005 |
| GitHub Issue | [#40](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/40) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 19, 2025 |
| Assignee | @PP-Namias |

#### Description

Migrate shop page to fetch product and category data from Sanity CMS. Includes category filtering, product grid display, and search functionality.

#### Expected Outcomes

- [x] useSanityProducts hook
- [x] useSanityCategories hook
- [x] Shop page refactoring
- [x] Category filtering by slug
- [x] Product search functionality
- [x] Price range filtering
- [x] Tag-based filtering

#### Labels

`shop` `products` `categories` `frontend`

---

### ECOM-006: Product Detail Page with Slug Routing

| Field | Value |
|-------|-------|
| Task ID | ECOM-006 |
| GitHub Issue | [#41](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/41) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 19, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement SEO-friendly product detail pages using slug-based routing. Includes image gallery, quantity selector, add to cart, wishlist, and share features.

#### Expected Outcomes

- [x] Product detail page (/product/[slug])
- [x] Image gallery component
- [x] Quantity selector
- [x] Add to cart functionality
- [x] Wishlist integration
- [x] Share feature
- [x] Legacy route removal (/product/[id])

#### Labels

`product-detail` `routing` `seo` `frontend`

---

### ECOM-007: Homepage Featured Products Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-007 |
| GitHub Issue | [#42](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/42) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 19, 2025 |
| Assignee | @PP-Namias |

#### Description

Replace mock homepage data with featured products from Sanity CMS using the useSanityFeaturedProducts hook. Display up to 8 featured products.

#### Expected Outcomes

- [x] useSanityFeaturedProducts hook
- [x] Featured products grid (8 items)
- [x] ProductCard component updates
- [x] Error and empty state handling

#### Labels

`homepage` `featured-products` `frontend`

---

## Phase 3: Hero Carousel

---

### ECOM-008: Sanity-Powered Hero Carousel

| Field | Value |
|-------|-------|
| Task ID | ECOM-008 |
| GitHub Issue | [#43](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/43) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement dynamic hero carousel connected to Sanity CMS with auto-rotation, navigation dots, and customizable slides. Supports background images, gradients, and CTA buttons.

#### Expected Outcomes

- [x] SanityHeroCarousel component
- [x] useSanityHero hook
- [x] Hero carousel Sanity schema
- [x] Auto-rotation (5 seconds)
- [x] Navigation dots
- [x] Gradient overlay support
- [x] CTA button configuration

#### Labels

`hero` `carousel` `homepage` `frontend`

---

### ECOM-009: Hero Carousel Real-Time Updates

| Field | Value |
|-------|-------|
| Task ID | ECOM-009 |
| GitHub Issue | [#44](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/44) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Add real-time subscription to hero carousel data using Sanity's listen API. Changes in Sanity Studio reflect immediately without page reload.

#### Expected Outcomes

- [x] Real-time subscription in useSanityHero
- [x] Subscription cleanup on unmount
- [x] Debug logging for updates

#### Labels

`real-time` `hero` `subscriptions`

---

## Phase 4: Real-Time Updates

---

### ECOM-010: Product Hooks Real-Time Updates

| Field | Value |
|-------|-------|
| Task ID | ECOM-010 |
| GitHub Issue | [#45](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/45) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement real-time subscriptions for all product hooks using Sanity's listen API. Product lists and details update automatically within 1-2 seconds of CMS changes.

#### Expected Outcomes

- [x] Real-time useSanityProducts
- [x] Real-time useSanityProduct
- [x] Real-time useSanityFeaturedProducts
- [x] Subscription cleanup
- [x] Debug logging

#### Labels

`real-time` `products` `subscriptions`

---

### ECOM-011: Blog Posts Real-Time Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-011 |
| GitHub Issue | [#46](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/46) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Create useSanityBlogPosts hook with real-time updates for blog post list, single post, and featured posts. Includes loading skeletons and error handling.

#### Expected Outcomes

- [x] useSanityBlogPosts hook
- [x] Blog list page (/blog)
- [x] Blog detail page (/blog/[slug])
- [x] Loading skeletons
- [x] Error handling

#### Labels

`blog` `real-time` `frontend`

---

### ECOM-012: Category Hooks Real-Time Updates

| Field | Value |
|-------|-------|
| Task ID | ECOM-012 |
| GitHub Issue | [#47](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/47) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement 5 real-time React hooks for category and product updates, including parent/child category support and product filtering.

#### Expected Outcomes

- [x] useSanityCategories hook (5 variants)
- [x] Parent/child category support
- [x] Product filtering by category
- [x] Real-time subscriptions

#### Labels

`categories` `real-time` `frontend`

---

### ECOM-013: Growers Real-Time Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-013 |
| GitHub Issue | [#48](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/48) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Create useSanityGrowers hook with real-time updates, slug-based routing for grower detail pages, and enhanced UI with specialties, certifications, and product count.

#### Expected Outcomes

- [x] useSanityGrowers hook (5 variants)
- [x] Grower list page (/grower)
- [x] Grower detail page (/grower/[id])
- [x] Specialties and certifications display
- [x] Product count integration
- [x] Google Maps integration

#### Labels

`growers` `real-time` `frontend`

---

### ECOM-014: Site Settings Real-Time Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-014 |
| GitHub Issue | [#49](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/49) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement real-time updates for site-wide settings including logo, company info, contact details, and social media links. Updates header and footer components.

#### Expected Outcomes

- [x] useSanitySiteSettings hook
- [x] Header component updates
- [x] Footer component updates
- [x] Dynamic logo support
- [x] Contact info integration
- [x] Social media links

#### Labels

`site-settings` `real-time` `header` `footer`

---

## Phase 5: E-Commerce Features

---

### ECOM-015: Inventory Dashboard and Stock Badge

| Field | Value |
|-------|-------|
| Task ID | ECOM-015 |
| GitHub Issue | [#50](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/50) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Create seller inventory dashboard page and StockBadge component for product stock display. Includes useSanityInventory hook for inventory data.

#### Expected Outcomes

- [x] Seller inventory dashboard
- [x] StockBadge component
- [x] useSanityInventory hook
- [x] ProductCard stock badge integration

#### Labels

`inventory` `seller-dashboard` `components`

---

### ECOM-016: Customer Reviews System

| Field | Value |
|-------|-------|
| Task ID | ECOM-016 |
| GitHub Issue | [#51](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/51) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement complete customer reviews system with review schema, rating calculations, distribution chart, and helpful votes. Supports real-time updates.

#### Expected Outcomes

- [x] Review Sanity schema
- [x] useSanityReviews hook
- [x] ReviewList component
- [x] Rating summary display
- [x] Rating distribution chart
- [x] Helpful votes functionality

#### Labels

`reviews` `ratings` `frontend`

---

### ECOM-017: Product Variants and Bundles

| Field | Value |
|-------|-------|
| Task ID | ECOM-017 |
| GitHub Issue | [#52](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/52) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement product variant and bundle support including schemas, hooks, and UI components. Supports size, color, and weight variants with savings calculations.

#### Expected Outcomes

- [x] ProductVariant Sanity schema
- [x] ProductBundle Sanity schema
- [x] useSanityVariants hook
- [x] useSanityBundles hook
- [x] Variant selector UI
- [x] Bundle display component
- [x] Savings calculations
- [x] Stock status indicators

#### Labels

`variants` `bundles` `products`

---

### ECOM-018: Order Management System

| Field | Value |
|-------|-------|
| Task ID | ECOM-018 |
| GitHub Issue | [#53](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/53) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Complete order management system in Sanity CMS including order schema, dashboard, and real-time tracking. Features order status workflow, payment tracking, and priority flagging.

#### Expected Outcomes

- [x] Order Sanity schema
- [x] useSanityOrders hook
- [x] Order dashboard page
- [x] Order status workflow
- [x] Payment tracking
- [x] Shipping info integration
- [x] Priority flagging
- [x] Filtering and search

#### Labels

`orders` `dashboard` `e-commerce`

---

### ECOM-019: Marketing and Analytics Features

| Field | Value |
|-------|-------|
| Task ID | ECOM-019 |
| GitHub Issue | [#54](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/54) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement marketing tools (coupons, promotions, email campaigns) and analytics dashboard with Sanity schemas and real-time hooks.

#### Expected Outcomes

- [x] Coupon Sanity schema
- [x] Promotion Sanity schema
- [x] EmailCampaign Sanity schema
- [x] Analytics Sanity schema
- [x] useSanityMarketing hook
- [x] useSanityAnalytics hook
- [x] Marketing dashboard
- [x] Analytics reporting

#### Labels

`marketing` `analytics` `coupons` `promotions`

---

## Phase 6: Data Import and Scripts

---

### ECOM-020: Sanity Import Automation Scripts

| Field | Value |
|-------|-------|
| Task ID | ECOM-020 |
| GitHub Issue | [#55](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/55) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 21-23, 2025 |
| Assignee | @PP-Namias |

#### Description

Create comprehensive automation scripts for importing data into Sanity CMS including categories, products, variants, bundles, and reviews.

#### Expected Outcomes

- [x] scripts/sanity/import-categories.js
- [x] scripts/sanity/import-products.js
- [x] scripts/sanity/import-variants.js
- [x] scripts/sanity/import-bundles.js
- [x] scripts/sanity/import-reviews.js
- [x] scripts/sanity/upload-images.js
- [x] scripts/sanity/link-relationships.js
- [x] Deduplication logic
- [x] Validation checks

#### Labels

`scripts` `automation` `data-import`

---

### ECOM-021: Product Image Upload Automation

| Field | Value |
|-------|-------|
| Task ID | ECOM-021 |
| GitHub Issue | [#56](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/56) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 23, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement automated image upload for 15 products including upload script, image linking, and verification.

#### Expected Outcomes

- [x] 15 product images (data/sanity/images/)
- [x] scripts/sanity/upload-images.js
- [x] scripts/sanity/verify-images.js
- [x] Image asset reference linking

#### Labels

`images` `automation` `assets`

---

### ECOM-022: Product Relationship Linking

| Field | Value |
|-------|-------|
| Task ID | ECOM-022 |
| GitHub Issue | [#57](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/57) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 23, 2025 |
| Assignee | @PP-Namias |

#### Description

Create scripts to link product relationships including suggested products, complementary products, and related bundles.

#### Expected Outcomes

- [x] scripts/sanity/link-relationships.js
- [x] scripts/link-suggested-products.js
- [x] scripts/link-products-growers.js
- [x] suggestedProducts linking
- [x] complementaryProducts linking
- [x] relatedBundles linking

#### Labels

`relationships` `products` `automation`

---

## Phase 7: Content Migration

---

### ECOM-023: Grower Schema and Migration

| Field | Value |
|-------|-------|
| Task ID | ECOM-023 |
| GitHub Issue | [#58](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/58) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 27, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement comprehensive grower schema in Sanity Studio and migrate grower data. Includes cover images, operating hours, and location data.

#### Expected Outcomes

- [x] Grower Sanity schema
- [x] scripts/migrate-growers-to-sanity.js
- [x] Cover image support
- [x] Operating hours
- [x] Location coordinates
- [x] Products field addition

#### Labels

`growers` `schema` `migration`

---

### ECOM-024: FAQ Schema and Migration

| Field | Value |
|-------|-------|
| Task ID | ECOM-024 |
| GitHub Issue | [#59](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/59) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 27, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement FAQ category and item schemas, migrate FAQ data, and create useSanityFAQ hook for frontend integration.

#### Expected Outcomes

- [x] FAQCategory Sanity schema
- [x] FAQItem Sanity schema
- [x] scripts/migrate-faq-to-sanity.js
- [x] useSanityFAQ hook
- [x] FAQ page integration

#### Labels

`faq` `schema` `migration`

---

### ECOM-025: Feature Section Schema and Migration

| Field | Value |
|-------|-------|
| Task ID | ECOM-025 |
| GitHub Issue | [#60](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/60) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 27, 2025 |
| Assignee | @PP-Namias |

#### Description

Create featureSection schema for the Why MASH section, migrate feature data, and implement SanityFeatureSection component.

#### Expected Outcomes

- [x] FeatureSection Sanity schema
- [x] scripts/migrate-features-to-sanity.js
- [x] useSanityFeatures hook
- [x] SanityFeatureSection component
- [x] Homepage integration

#### Labels

`features` `schema` `migration`

---

### ECOM-026: Site Settings and Navigation Migration

| Field | Value |
|-------|-------|
| Task ID | ECOM-026 |
| GitHub Issue | [#61](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/61) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 27, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement siteSettings singleton and navigation document schemas. Migrate company info and navigation menus.

#### Expected Outcomes

- [x] SiteSettings singleton schema
- [x] Navigation document schema
- [x] scripts/migrate-site-settings-to-sanity.js
- [x] Company info migration
- [x] 5 navigation menus
- [x] useSanitySiteSettings updates

#### Labels

`site-settings` `navigation` `singleton`

---

### ECOM-027: Store Location Pages

| Field | Value |
|-------|-------|
| Task ID | ECOM-027 |
| GitHub Issue | [#62](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/62) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 27, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement store schema, migration, and store pages including list and detail views. Includes Google Maps integration and grower linking.

#### Expected Outcomes

- [x] Store Sanity schema
- [x] scripts/migrate-stores-to-sanity.js
- [x] Store list page (/stores)
- [x] Store detail page (/stores/[slug])
- [x] useSanityStores hook
- [x] Google Maps integration
- [x] Grower-store relationships

#### Labels

`stores` `locations` `maps`

---

### ECOM-028: Testimonials and Banners Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-028 |
| GitHub Issue | [#63](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/63) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 27, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement customer testimonials and promotional banners with schemas, migration scripts, and frontend components.

#### Expected Outcomes

- [x] Testimonial Sanity schema
- [x] Banner Sanity schema
- [x] scripts/migrate-testimonials-to-sanity.js
- [x] scripts/migrate-banners-to-sanity.js
- [x] useSanityTestimonials hook
- [x] useSanityBanners hook
- [x] TestimonialsSection component
- [x] BannerSection component
- [x] Position-based banner display

#### Labels

`testimonials` `banners` `marketing`

---

### ECOM-029: About and Contact Page CMS Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-029 |
| GitHub Issue | [#64](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/64) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement aboutPage and contactPage singletons, person schema for team members, and migrate content. Includes team member images and social links.

#### Expected Outcomes

- [x] AboutPage singleton schema
- [x] ContactPage singleton schema
- [x] Person schema (team/mentor)
- [x] scripts/migrate-phase8-content.js
- [x] scripts/update-team-members.js
- [x] useSanityAboutPage hook
- [x] useSanityContactPage hook
- [x] About page refactoring
- [x] Contact page refactoring

#### Labels

`about` `contact` `team` `singleton`

---

### ECOM-030: Blog Category Schema

| Field | Value |
|-------|-------|
| Task ID | ECOM-030 |
| GitHub Issue | [#65](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/65) |
| Type | Feature |
| Priority | Low |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Add blogCategory schema for organizing blog posts and update post schema for blog and team features.

#### Expected Outcomes

- [x] BlogCategory Sanity schema
- [x] Post schema enhancements
- [x] Person schema updates
- [x] Category-post relationships

#### Labels

`blog` `categories` `schema`

---

## Phase 8: Bug Fixes and Optimizations

---

### ECOM-031: Product Image Field Fix

| Field | Value |
|-------|-------|
| Task ID | ECOM-031 |
| GitHub Issue | [#66](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/66) |
| Type | Bug |
| Priority | Critical |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | December 2, 2025 |
| Assignee | @PP-Namias |

#### Description

Fix critical bug where product images showed placeholders instead of actual images due to schema field mismatch (image vs mainImage).

#### Expected Outcomes

- [x] GROQ query updates with coalesce()
- [x] useSanityGrowers.ts fix
- [x] useSanityCategories.ts fix
- [x] queries.ts updates (8 queries)
- [x] scripts/verify-image-query.js

#### Labels

`bug` `critical` `images` `groq`

---

### ECOM-032: Category Slug Projection Fix

| Field | Value |
|-------|-------|
| Task ID | ECOM-032 |
| GitHub Issue | [#67](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/67) |
| Type | Bug |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Fix GROQ queries to project category and subcategory slugs as strings, resolving filtering and display issues on shop page.

#### Expected Outcomes

- [x] GROQ query updates for slug projection
- [x] transformSanityProduct updates
- [x] String/object slug handling

#### Labels

`bug` `categories` `groq`

---

### ECOM-033: Array Keys Fix for Sanity Documents

| Field | Value |
|-------|-------|
| Task ID | ECOM-033 |
| GitHub Issue | [#68](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/68) |
| Type | Bug |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 29, 2025 |
| Assignee | @PP-Namias |

#### Description

Fix missing _key properties in array fields for grower, product, and store documents preventing editing in Sanity Studio.

#### Expected Outcomes

- [x] scripts/check-array-keys.js
- [x] scripts/fix-array-keys.js
- [x] Array key generation for all documents

#### Labels

`bug` `sanity` `arrays`

---

### ECOM-034: Hero Carousel Button Link Fix

| Field | Value |
|-------|-------|
| Task ID | ECOM-034 |
| GitHub Issue | [#69](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/69) |
| Type | Bug |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | December 3, 2025 |
| Assignee | @PP-Namias |

#### Description

Fix SanityHeroCarousel to handle slides without button links, preventing Next.js Link href null errors.

#### Expected Outcomes

- [x] Conditional Link rendering
- [x] Default values in useSanityHero
- [x] Null/undefined button link handling

#### Labels

`bug` `hero` `routing`

---

### ECOM-035: Google Maps API Migration

| Field | Value |
|-------|-------|
| Task ID | ECOM-035 |
| GitHub Issue | [#70](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/70) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 29, 2025 |
| Assignee | @PP-Namias |

#### Description

Migrate GoogleMap component from deprecated Loader class to direct script injection with new Google Maps API.

#### Expected Outcomes

- [x] GoogleMap.tsx refactoring
- [x] Script injection implementation
- [x] API key configuration
- [x] Referrer configuration

#### Labels

`maps` `migration` `api`

---

### ECOM-036: Sanity API Optimization

| Field | Value |
|-------|-------|
| Task ID | ECOM-036 |
| GitHub Issue | [#71](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/71) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 21, 2025 |
| Assignee | @PP-Namias |

#### Description

Optimize Sanity API usage by disabling real-time subscriptions for production, enforcing CDN usage, and adding memory caching.

#### Expected Outcomes

- [x] CDN enforcement
- [x] Memory caching in product hook
- [x] Aggressive caching configuration
- [x] Quota management

#### Labels

`optimization` `caching` `api`

---

## Phase 9: Enhanced Features

---

### ECOM-037: Related Products and Bundle Sections

| Field | Value |
|-------|-------|
| Task ID | ECOM-037 |
| GitHub Issue | [#72](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/72) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement You May Also Like and Frequently Bought Together sections on product detail page with auto-linking script.

#### Expected Outcomes

- [x] suggestedProducts GROQ query
- [x] complementaryProducts GROQ query
- [x] You May Also Like section UI
- [x] Frequently Bought Together section UI
- [x] scripts/link-suggested-products.js

#### Labels

`products` `recommendations` `upsell`

---

### ECOM-038: Product Variant Selector UI

| Field | Value |
|-------|-------|
| Task ID | ECOM-038 |
| GitHub Issue | [#73](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/73) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement variant selector UI on product detail page with size, color, and weight options.

#### Expected Outcomes

- [x] Variant selector component
- [x] Size/color/weight options
- [x] Price updates on selection
- [x] Stock status per variant

#### Labels

`variants` `ui` `products`

---

### ECOM-039: Customer Reviews Section UI

| Field | Value |
|-------|-------|
| Task ID | ECOM-039 |
| GitHub Issue | [#74](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/74) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement customer reviews section on product detail page with rating summary and distribution chart.

#### Expected Outcomes

- [x] Reviews list display
- [x] Rating summary
- [x] Rating distribution chart
- [x] Helpful votes UI

#### Labels

`reviews` `ui` `products`

---

### ECOM-040: Grower-Store Bidirectional Linking

| Field | Value |
|-------|-------|
| Task ID | ECOM-040 |
| GitHub Issue | [#75](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/75) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement bidirectional relationships between growers and stores with updated schemas and linking scripts.

#### Expected Outcomes

- [x] Grower schema updates (suppliesTo)
- [x] Store schema updates (growers)
- [x] scripts/link-growers-stores.js
- [x] Store detail grower display
- [x] Grower detail store display

#### Labels

`growers` `stores` `relationships`

---

### ECOM-041: Product Tag Filtering

| Field | Value |
|-------|-------|
| Task ID | ECOM-041 |
| GitHub Issue | [#76](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/76) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 28, 2025 |
| Assignee | @PP-Namias |

#### Description

Enhance shop page to support filtering by product tags with UI for tag selection.

#### Expected Outcomes

- [x] Tag filtering in useSanityProducts
- [x] Tag filter UI on shop page
- [x] scripts/add-product-tags.js

#### Labels

`tags` `filtering` `shop`

---

### ECOM-042: Category Detail Page

| Field | Value |
|-------|-------|
| Task ID | ECOM-042 |
| GitHub Issue | [#77](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/77) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 29, 2025 |
| Assignee | @PP-Namias |

#### Description

Create category detail page with product grid, filtering, pagination, and sidebar navigation.

#### Expected Outcomes

- [x] Category page (/category/[slug])
- [x] Hero header
- [x] Breadcrumb navigation
- [x] Product grid
- [x] Price range filter
- [x] Tag filter
- [x] Sort options
- [x] View mode toggle
- [x] Pagination

#### Labels

`categories` `pages` `filtering`

---

### ECOM-043: Enhanced Product Detail Information

| Field | Value |
|-------|-------|
| Task ID | ECOM-043 |
| GitHub Issue | [#78](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/78) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 29, 2025 |
| Assignee | @PP-Namias |

#### Description

Display comprehensive CMS-driven product information including freshness, cooking guides, delivery options, and nutritional highlights.

#### Expected Outcomes

- [x] FreshnessInfo display
- [x] Cooking guides section
- [x] Delivery options display
- [x] Nutritional highlights
- [x] TypeScript interfaces
- [x] GROQ query updates

#### Labels

`products` `content` `ui`

---

## Phase 10: Search and Discovery

---

### ECOM-044: Search Autocomplete Component

| Field | Value |
|-------|-------|
| Task ID | ECOM-044 |
| GitHub Issue | [#79](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/79) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | December 3, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement SearchAutocomplete component with real-time product suggestions, recent searches, and trending searches.

#### Expected Outcomes

- [x] SearchAutocomplete component (355 lines)
- [x] Real-time product suggestions
- [x] Recent searches (localStorage)
- [x] Trending searches
- [x] Product thumbnails and prices
- [x] Debounced API calls (300ms)
- [x] Keyboard navigation
- [x] Header integration (desktop/mobile)

#### Labels

`search` `autocomplete` `ui`

---

### ECOM-045: Announcement Bar Component

| Field | Value |
|-------|-------|
| Task ID | ECOM-045 |
| GitHub Issue | [#80](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/80) |
| Type | Feature |
| Priority | Low |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | December 3, 2025 |
| Assignee | @PP-Namias |

#### Description

Create reusable AnnouncementBar component for CMS-driven promotional messages.

#### Expected Outcomes

- [x] AnnouncementBar component
- [x] CMS integration
- [x] Configurable colors
- [x] Link support
- [x] Header integration

#### Labels

`announcements` `marketing` `ui`

---

## Phase 11: Real-Time Demo Features

---

### ECOM-046: Demo Control Panel

| Field | Value |
|-------|-------|
| Task ID | ECOM-046 |
| GitHub Issue | [#81](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/81) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | December 3, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement DemoControlPanel component for toggling real-time mode in demo environments.

#### Expected Outcomes

- [x] DemoControlPanel component
- [x] RealtimeModeContext
- [x] Real-time mode toggle
- [x] Demo environment detection

#### Labels

`demo` `real-time` `developer-tools`

---

### ECOM-047: Real-Time Subscription Manager

| Field | Value |
|-------|-------|
| Task ID | ECOM-047 |
| GitHub Issue | [#82](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/82) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | December 3, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement centralized real-time subscription manager with debounced updates for Sanity CMS live updates.

#### Expected Outcomes

- [x] src/lib/sanity/realtime.ts
- [x] Subscription manager class
- [x] Debounced updates
- [x] useRealtimeProducts hook
- [x] Subscription cleanup

#### Labels

`real-time` `subscriptions` `infrastructure`

---

## Phase 12: Integration Testing

---

### ECOM-048: Sanity CMS Test Suite

| Field | Value |
|-------|-------|
| Task ID | ECOM-048 |
| GitHub Issue | [#83](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/83) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 26, 2025 |
| Assignee | @PP-Namias |

#### Description

Create comprehensive test scripts for validating Sanity CMS data, relationships, and queries.

#### Expected Outcomes

- [x] scripts/sanity/run-all-tests.js
- [x] scripts/sanity/test-connection.js
- [x] scripts/sanity/test-frontend-query.js
- [x] scripts/verify-phase-b.js
- [x] scripts/audit-sanity-data.js
- [x] Data validation checks

#### Labels

`testing` `validation` `scripts`

---

### ECOM-049: Data Verification Scripts

| Field | Value |
|-------|-------|
| Task ID | ECOM-049 |
| GitHub Issue | [#84](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/84) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 27-30, 2025 |
| Assignee | @PP-Namias |

#### Description

Create scripts for verifying data integrity including image queries, variants, reviews, and relationships.

#### Expected Outcomes

- [x] scripts/check-products.js
- [x] scripts/check-variants-reviews.js
- [x] scripts/check-grower-products.js
- [x] scripts/check-phase-c-data.js
- [x] scripts/verify-image-query.js
- [x] scripts/quick-check.js
- [x] scripts/quick-audit.js

#### Labels

`verification` `data-integrity` `scripts`

---

## External Integration

---

### ECOM-050: Lalamove Delivery API Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-050 |
| GitHub Issue | [#85](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/85) |
| Type | Feature |
| Priority | High |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 22-26, 2025 |
| Assignee | @PP-Namias |

#### Description

Implement Lalamove same-day delivery integration including quotation, order placement, tracking, and webhooks.

#### Expected Outcomes

- [x] src/lib/lalamove/client.ts
- [x] API routes (quotation, order, driver, webhook)
- [x] COD support
- [x] Priority delivery
- [x] SMS chat relay
- [x] Test page
- [x] scripts/test-lalamove-delivery.js
- [x] Production test plan

#### Labels

`lalamove` `delivery` `integration` `api`

---

### ECOM-051: Google Analytics Integration

| Field | Value |
|-------|-------|
| Task ID | ECOM-051 |
| GitHub Issue | [#86](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/86) |
| Type | Feature |
| Priority | Medium |
| Status | Complete |
| Parent | ECOM-001 |
| Timeline | November 20, 2025 |
| Assignee | @PP-Namias |

#### Description

Integrate Google Analytics 4 with automatic page view tracking, product view, and add to cart event tracking.

#### Expected Outcomes

- [x] react-ga4 integration
- [x] src/lib/analytics.ts
- Page view tracking
- Product view events
- Add to cart events
- Measurement ID configuration

**Labels:** `analytics`, `google`, `tracking`

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Tasks | 50 |
| Epic | 1 |
| Child Tasks | 49 |
| Completed | 50 (100%) |
| Timeline | Nov 19 - Dec 3, 2025 |
| Commits | 112 |
| Files Changed | 339 |

---

## Labels Reference

| Label | Description | Color |
|-------|-------------|-------|
| `epic` | Parent epic task | Purple |
| `cms` | CMS related | Blue |
| `sanity` | Sanity CMS specific | Green |
| `frontend` | Frontend changes | Yellow |
| `infrastructure` | Core infrastructure | Gray |
| `products` | Product features | Orange |
| `categories` | Category features | Teal |
| `real-time` | Real-time updates | Red |
| `bug` | Bug fix | Red |
| `critical` | Critical priority | Dark Red |
| `schema` | Schema changes | Purple |
| `migration` | Data migration | Blue |
| `scripts` | Automation scripts | Gray |
| `ui` | User interface | Pink |
| `testing` | Testing related | Green |
| `integration` | External integration | Orange |

---

## Sprint Allocation

### Sprint 1: December 1-5, 2025
- [ECOM-001] Sanity CMS Implementation (Epic - Complete)
- All 49 child tasks (Complete)

---

*Document generated: December 3, 2025*  
*Based on 112 commits from CMS/Sanity branch*
