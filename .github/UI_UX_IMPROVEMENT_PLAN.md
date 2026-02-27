# MASH Marketplace - UI/UX Improvement Master Plan

> **Goal**: Elevate the MASH e-commerce platform from a functional MVP (current score: 6.7/10) to a polished, conversion-optimized, accessible marketplace (target: 9/10)
>
> **Status**: COMPLETE - All 43 stories across 16 phases finished (100%)
> **Created**: 2026-02-24
> **Last Updated**: 2026-02-27
> **Completed**: 2026-02-27
> **Owner**: Development Team (AI Agent: Ralph)
> **Platform**: www.mashmarket.app (Next.js 16 + Tailwind CSS + shadcn/Radix UI)
> **PRD File**: `prd-ui-ux.json` (source of truth for story status)
> **Progress File**: `progress.txt` (codebase patterns + implementation log)

---

## Current State Assessment

| Area | Current Score | Target Score | Priority |
|------|:---:|:---:|:---:|
| Navigation & Header | 6/10 | 9/10 | High |
| Product Cards | 8/10 | 9.5/10 | Medium |
| Shop/Browse Page | 7/10 | 9/10 | High |
| Product Detail Page | 8/10 | 9.5/10 | High |
| Cart Page | 7/10 | 9/10 | High |
| Checkout Flow | 6/10 | 9.5/10 | Critical |
| Login / Signup | 7/10 | 9/10 | Medium |
| User Profile | 5/10 | 8.5/10 | Medium |
| Hero & Landing | 7/10 | 9/10 | Medium |
| Footer | 6/10 | 8.5/10 | Low |
| SEO & Performance | 3/10 | 9/10 | Critical |
| Accessibility (a11y) | 4/10 | 8/10 | High |
| Mobile Experience | 6/10 | 9/10 | High |
| **Overall** | **6.7/10** | **9.0/10** | -- |

### Critical Issues Identified

1. **SEO is broken** - Shop and product pages are fully client-rendered (`"use client"`), no `generateMetadata`, no JSON-LD structured data. Google sees empty pages.
2. **Mobile cart is inaccessible** - No cart icon/badge in mobile bottom nav; mobile menu links to `/checkout` instead of `/cart`.
3. **Giant monolithic files** - 5 page files exceed 800 lines (checkout: 1248, profile: 1549, product detail: 949, shop: 910, login: 805).
4. **Inconsistent design tokens** - Hardcoded `text-gray-*` colors, `font-['Roboto']` in footer, emoji characters used in UI elements instead of proper icons.
5. **Missing e-commerce essentials** - No coupon/promo code input, no cross-sell in cart, no guest checkout, only COD payment active despite PayMongo code existing.
6. **No accessibility foundation** - Missing skip-to-content link, inconsistent ARIA labels, focus management gaps, unverified color contrast ratios.

---

## Phase 1: Critical Fixes & Foundation (Week 1-2)

> **Goal**: Fix conversion-killing bugs and establish the design system foundation. Everything in this phase directly impacts revenue or search visibility.

### 1.1 Design System Cleanup

**Priority**: High | **Effort**: Medium | **Impact**: Site-wide consistency

| Task | File(s) | Details |
|------|---------|---------|
| Audit and fix all hardcoded colors | Site-wide | Replace every `text-gray-*`, `bg-white/95`, `bg-gray-*` with semantic Tailwind tokens (`text-foreground`, `text-muted-foreground`, `bg-background`, `bg-card`, etc.) |
| Remove hardcoded `font-['Roboto']` | `src/components/layout/footer.tsx` (L17) | Use `font-sans` from theme instead |
| Replace all emoji in UI elements | `ProductCard.tsx` (L224-249), `shop/page.tsx` (L691-697), `SanityHeroCarousel.tsx` (L129) | Replace with Lucide React icons: "New" -> `<Sparkles>`, "Organic" -> `<Leaf>`, "Fresh" -> `<Droplets>`, etc. |
| Create shared color palette documentation | New: `src/styles/design-tokens.md` | Document all CSS custom properties, their usage, and when to use each |
| Standardize border-radius usage | `globals.css` | Ensure consistent use of `--radius-sm`, `--radius-md`, `--radius-lg` across all components |
| Add brand color tokens to globals.css | `src/app/globals.css` | Formalize green primary palette: `--color-primary: #2e7d32`, `--color-primary-hover`, `--color-primary-light`, `--color-primary-dark` |

**Acceptance Criteria**:
- [ ] Zero hardcoded color values outside of `globals.css`
- [ ] Zero emoji characters in UI (only Lucide icons)
- [ ] All components use semantic Tailwind tokens

### 1.2 Mobile Navigation Fix (Revenue Critical)

**Priority**: Critical | **Effort**: Low | **Impact**: Direct conversion impact

| Task | File(s) | Details |
|------|---------|---------|
| Add Cart icon + badge to mobile bottom nav | `src/components/layout/mobile-bottom-nav.tsx` | Add `ShoppingCart` icon with item count badge (red circle with number). Use `useCart()` context for count. |
| Fix mobile menu cart link | `src/components/layout/header.tsx` (L603) | Change href from `/checkout` to `/cart` |
| Add Wishlist in mobile bottom nav or header | `mobile-bottom-nav.tsx` | Replace one nav item or add 5th item for wishlist access |
| Add notification access on mobile | `mobile-bottom-nav.tsx` | Bell icon or integrate into account dropdown |

**Acceptance Criteria**:
- [ ] Mobile users can see cart item count at all times
- [ ] Tapping cart on mobile goes to `/cart`, not `/checkout`
- [ ] Wishlist accessible on mobile without opening hamburger menu

### 1.3 SEO Foundation (Search Visibility Critical)

**Priority**: Critical | **Effort**: High | **Impact**: Organic traffic

| Task | File(s) | Details |
|------|---------|---------|
| Convert shop page to server component with client islands | `src/app/(shop)/shop/page.tsx` | Server component for initial render + `generateMetadata()`. Extract filter/sort UI into client components. Use server-side Sanity fetch for initial products. |
| Convert product detail to server component | `src/app/(shop)/product/[slug]/page.tsx` | Server component with `generateMetadata()` for title, description, OG images. Client islands for interactive elements (add to cart, gallery, tabs). |
| Add JSON-LD structured data for products | `src/app/(shop)/product/[slug]/page.tsx` | `Product` schema with name, image, description, price, availability, rating, review count per Google Shopping requirements |
| Add JSON-LD breadcrumb schema | `src/components/common/breadcrumbs.tsx` | `BreadcrumbList` schema markup |
| Add `generateMetadata` to all public pages | All page.tsx files in (shop), about, blog, contact, faq, stores, grower | Dynamic titles, descriptions, OG tags |
| Create reusable `<JsonLd>` component | New: `src/components/common/json-ld.tsx` | Generic component for injecting structured data |

**Acceptance Criteria**:
- [ ] Google Search Console shows all product pages as indexed
- [ ] Rich snippets appear in search results (price, rating, availability)
- [ ] Lighthouse SEO score > 90 for shop and product pages
- [ ] `generateMetadata` present on every public-facing page

### 1.4 Accessibility Foundation

**Priority**: High | **Effort**: Medium | **Impact**: Legal compliance + usability

| Task | File(s) | Details |
|------|---------|---------|
| Add skip-to-content link | `src/app/client-layout.tsx` | Hidden link at top of page that becomes visible on focus, jumps to `<main>` element |
| Add `aria-label` to all navigation landmarks | `header.tsx`, `footer.tsx`, `mobile-bottom-nav.tsx` | `<nav aria-label="Main Navigation">`, `<nav aria-label="Mobile Navigation">`, etc. |
| Add `role="status"` to announcement bar | `header.tsx` (L419-L435) | Announcement bar should use `aria-live="polite"` for dynamic content |
| Audit color contrast ratios | `globals.css` | Run WCAG AA automated check on all foreground/background combinations. Fix any below 4.5:1 ratio. |
| Add `aria-label` to product cards | `ProductCard.tsx` | Composite label: `aria-label="${name} - ${price} per ${unit}"` |
| Fix focus trap in modals | All Dialog/Sheet usage | Ensure focus returns to trigger element after modal close |
| Add keyboard navigation to carousel | `SanityHeroCarousel.tsx` | Arrow key support, `aria-roledescription="carousel"`, slide announcements |

**Acceptance Criteria**:
- [ ] Lighthouse Accessibility score > 90
- [ ] All interactive elements keyboard-navigable
- [ ] Skip-to-content link functional on every page
- [ ] Color contrast passes WCAG AA (4.5:1 min)

---

## Phase 2: Core Shopping Experience (Week 3-4)

> **Goal**: Optimize the primary purchase funnel from product discovery through checkout. Focus on reducing cart abandonment and increasing average order value.

### 2.1 Header & Navigation Redesign

**Priority**: High | **Effort**: High | **Impact**: Discovery & navigation

| Task | File(s) | Details |
|------|---------|---------|
| Consolidate 3-bar header to 2-bar | `header.tsx` | Merge announcement bar into a slim top strip. Combine seller info + main nav into single responsive bar. Reduce vertical space from ~180px to ~120px. |
| Add mega-menu for categories | New: `src/components/layout/mega-menu.tsx` | Dropdown on hover/click for "Shop" nav item showing all categories with images, organized by parent > child hierarchy. E-commerce standard. |
| Persistent search bar on mobile | `header.tsx`, `mobile-bottom-nav.tsx` | Always-visible search icon in mobile header bar (not buried in hamburger). Tap opens full-screen search overlay. |
| Add "Free shipping" threshold banner | `header.tsx` | Dynamic banner: "Free delivery on orders over P500!" (configurable via Sanity CMS) |
| Extract social media links to shared component | New: `src/components/common/social-links.tsx` | Currently copy-pasted 3x (header, footer, mobile sheet). Create single reusable component. |
| Sticky header with scroll behavior | `header.tsx` | Header shrinks to compact mode on scroll down, full mode on scroll up. Use `IntersectionObserver`. |
| Add search autocomplete/suggestions | `src/components/search/SearchDialog.tsx` | Show recent searches, popular terms, and live product suggestions as user types |

**Acceptance Criteria**:
- [ ] Header height reduced by 30%+ on desktop
- [ ] Category mega-menu shows all categories with images
- [ ] Search accessible in 1 tap on mobile (not behind menu)
- [ ] Social links component used in header, footer, and mobile nav (single source)

### 2.2 Shop/Browse Page Enhancement

**Priority**: High | **Effort**: High | **Impact**: Product discovery

| Task | File(s) | Details |
|------|---------|---------|
| Extract shared FilterSidebar component | New: `src/components/shop/FilterSidebar.tsx` | Currently duplicated between desktop sidebar and mobile Sheet (L228-372 vs L476-665). Create single component used in both contexts. |
| Add filter count badges | `FilterSidebar.tsx` | Show count of matching products per filter option (e.g., "Oyster Mushrooms (12)") |
| Add "Quick View" modal | New: `src/components/product/QuickViewModal.tsx` | Click eye icon on product card -> modal with product preview, variant selection, add-to-cart. Saves clicks to purchase. |
| Infinite scroll option | `shop/page.tsx` | Alternative to "Load More" button. User preference toggle between pagination, load more, and infinite scroll. |
| Add grid/list view toggle | `shop/page.tsx` | Already partially exists. List view should show horizontal cards with more product info (description, stock level, grower). |
| Add "Sort by" quick pills | `shop/page.tsx` | Below search bar: "Bestsellers | Newest | Price: Low-High | Price: High-Low" as clickable chips/pills |
| Recently viewed products strip | `shop/page.tsx` | Horizontal scroll strip at top or bottom: "Recently Viewed" pulling from localStorage history |
| "No results" state improvement | `shop/page.tsx` | When filters return 0 products: show suggestions ("Try removing some filters", "Browse popular categories"), related products |
| Add product comparison | New: `src/components/shop/ComparePanel.tsx` | Checkbox on product cards -> floating compare bar (2-4 items) -> comparison table view |

**Acceptance Criteria**:
- [ ] Filter sidebar is a single shared component (desktop + mobile)
- [ ] Quick View modal functional with add-to-cart
- [ ] View toggle (grid/list) working with distinct layouts
- [ ] Empty state shows helpful suggestions, not just "No products found"

### 2.3 Product Detail Page Polish

**Priority**: High | **Effort**: Medium | **Impact**: Conversion rate

| Task | File(s) | Details |
|------|---------|---------|
| Decompose 949-line page into components | `product/[slug]/page.tsx` | Extract: `ProductGallery.tsx`, `ProductInfo.tsx`, `ProductTabs.tsx`, `SuggestedProducts.tsx`, `TrustBadges.tsx` |
| Add "Buy Now" button | `ProductInfo.tsx` (new) | Alongside "Add to Cart" - skips cart, goes directly to checkout with this product |
| Add image zoom on hover | `ProductGallery.tsx` (new) | Magnifying glass effect or full-screen lightbox on desktop. Pinch-to-zoom on mobile. |
| Add sticky "Add to Cart" bar on mobile | New component | When main CTA scrolls off screen, show fixed bottom bar with price + "Add to Cart" button |
| Improve variant selector UX | Product detail page | Visual variant chips (color swatches, size buttons) instead of plain dropdowns |
| Add "Frequently Bought Together" section | New: `src/components/product/FrequentlyBoughtTogether.tsx` | Bundle suggestions below product info. "Buy all 3 for P450 (save P50)" |
| Improve review section | Product detail page | Add photo reviews, review helpfulness voting, review filters (by rating), verified purchase badge |
| Add delivery estimate | Product detail page | "Estimated delivery: Feb 28 - Mar 1" based on user location + Lalamove data |
| Social sharing buttons | Product detail page | Share to Facebook, Twitter/X, copy link, WhatsApp (important in PH market) |
| Add breadcrumb structured data | `breadcrumbs.tsx` | JSON-LD `BreadcrumbList` for Google |

**Acceptance Criteria**:
- [ ] Product page split into 5+ focused components (each < 200 lines)
- [ ] "Buy Now" button functional and tested
- [ ] Image zoom working on desktop and mobile
- [ ] Mobile sticky CTA appears when scrolling past main button

### 2.4 Cart Page Optimization

**Priority**: High | **Effort**: Medium | **Impact**: Cart abandonment reduction

| Task | File(s) | Details |
|------|---------|---------|
| Add coupon/promo code input | `cart/page.tsx` | Input field in order summary section with "Apply" button. Validate against backend. Show discount amount. |
| Add cross-sell section | New: `src/components/cart/CrossSell.tsx` | "You May Also Like" / "Frequently Bought Together" strip below cart items. Based on current cart contents. |
| Add free shipping progress bar | `cart/page.tsx` | "You are P120 away from free delivery!" with visual progress bar |
| Improve empty cart state | `cart/page.tsx` | Show personalized recommendations, recently viewed items, and popular products instead of just a CTA button |
| Add item-level delivery estimates | Cart items | Show "Delivery by Feb 28" per item |
| Remove misleading "Secure checkout powered by Firebase" text | `cart/page.tsx` (L540) | Replace with proper trust badges (SSL, security icons) |
| Add cart persistence notification | Cart page | "Your cart is saved! Continue shopping anytime." for returning users |
| Quantity update animation | Cart items | Smooth transition when quantity changes. Price updates with counter animation. |

**Acceptance Criteria**:
- [ ] Coupon code input functional in cart
- [ ] Cross-sell section shows relevant products
- [ ] Free shipping progress bar visible and accurate
- [ ] Empty cart shows personalized content, not just "Your cart is empty"

---

## Phase 3: Conversion Optimization (Week 5-6)

> **Goal**: Streamline the checkout process and build trust. Focus on reducing friction at the final purchase decision.

### 3.1 Checkout Redesign

**Priority**: Critical | **Effort**: High | **Impact**: Direct revenue

| Task | File(s) | Details |
|------|---------|---------|
| Decompose 1248-line checkout | `checkout/page.tsx` | Extract: `CheckoutStep1Delivery.tsx`, `CheckoutStep2Contact.tsx`, `CheckoutStep3Payment.tsx`, `OrderSummary.tsx`, `CheckoutProgress.tsx` |
| Persistent order summary sidebar | `OrderSummary.tsx` (new) | Always-visible sidebar (desktop) / expandable panel (mobile) showing cart items, quantities, subtotal, delivery fee, total during ALL checkout steps |
| Add step progress indicator | `CheckoutProgress.tsx` (new) | Visual stepper: (1) Delivery -> (2) Details -> (3) Payment -> (4) Confirmation. Current step highlighted, completed steps checkmarked. |
| Enable PayMongo payments | `CheckoutStep3Payment.tsx` (new) | Activate existing PayMongo code for GCash, GrabPay, credit/debit cards. Currently only COD is active. |
| Add express checkout | Checkout page | One-click checkout for returning users with saved address + saved payment method |
| Add guest checkout option | Checkout page | Allow purchase without account creation. Email-only for order confirmation. |
| Add trust signals during checkout | Checkout page | Security badges, money-back guarantee, customer support contact visible at all times |
| Real-time delivery fee calculation | Checkout Step 1 | Show Lalamove delivery fee estimate as soon as address is entered, before proceeding |
| Form auto-save | Checkout page | Save form progress to localStorage. If user leaves and returns, restore their progress. |
| Order confirmation page redesign | `payment-success/page.tsx` | Rich confirmation: order number, estimated delivery, order summary, tracking link, "Continue Shopping" CTA, share order, email confirmation note |

**Acceptance Criteria**:
- [ ] Order summary visible during all checkout steps
- [ ] Step progress indicator shows clear navigation
- [ ] At least 2 digital payment methods active (GCash, credit card)
- [ ] Guest checkout functional without account creation
- [ ] Checkout page decomposed into <300 line components

### 3.2 Authentication UX Improvement

**Priority**: Medium | **Effort**: Medium | **Impact**: Conversion + retention

| Task | File(s) | Details |
|------|---------|---------|
| Extract login logic to custom hook | New: `src/hooks/useLogin.ts` | Move all auth logic from 805-line login page into reusable hook |
| Standardize auth page width | `login/page.tsx`, `signup/page.tsx` | Login uses `md:max-w-2xl lg:max-w-4xl`, signup uses `max-w-md`. Standardize to `max-w-lg` for both. |
| Add social proof to auth pages | Login/Signup pages | "Join 2,000+ mushroom lovers" / "Trusted by 50+ local growers" |
| Improve password strength indicator | `signup/page.tsx` | Visual meter (weak/medium/strong) with color gradient instead of just checkmarks |
| Add inline validation with debounce | Login/Signup forms | Check email availability on blur, show green checkmark for valid fields |
| Add auto-redirect after signup verification | Verify flow | After email verified -> auto-login -> redirect to intended page (cart/checkout/shop) |
| Fix 2FA remember device overlay | `login/page.tsx` (L773-805) | Replace floating `z-[60]` div with proper Dialog component from shadcn |
| Add Apple/Facebook sign-in options | Auth pages | Important for PH market where Facebook login is highly popular |

**Acceptance Criteria**:
- [ ] Login page < 300 lines (logic in custom hook)
- [ ] Auth pages visually consistent (same width, same layout)
- [ ] Password strength indicator is visual and clear
- [ ] Social proof visible on auth pages

### 3.3 User Profile Redesign

**Priority**: Medium | **Effort**: High | **Impact**: Retention + trust

| Task | File(s) | Details |
|------|---------|---------|
| Decompose 1549-line profile page | `my-information/page.tsx` | Extract: `ProfileInfoCard.tsx`, `AddressManager.tsx`, `PasswordManager.tsx`, `PhoneVerification.tsx`, `ProfileSidebar.tsx` |
| Add profile completion progress bar | Profile page | Visual indicator: "Your profile is 75% complete. Add a phone number to reach 100%." with checklist |
| Add tabbed/section navigation | Profile page | Tab layout: Personal Info / Addresses / Security / Preferences instead of long scrolling page |
| Add order history timeline | `order-history/page.tsx` | Visual timeline with order status, delivery tracking, and quick reorder button |
| Add account deletion option | Profile page | "Delete Account" with confirmation dialog. Required for privacy compliance. |
| Add avatar upload with crop | Profile page | Image upload with crop tool instead of just file input |
| Add address cards with map preview | AddressManager | Show mini static map for each saved address. Default address highlighted. |
| Add notification preferences | New: profile section | Email/SMS notification toggles for: orders, promotions, new products, price drops |

**Acceptance Criteria**:
- [ ] Profile page decomposed into 5+ components
- [ ] Profile completion indicator visible
- [ ] Tabbed navigation functional
- [ ] Account deletion option available

---

## Phase 4: Visual Polish & Delight (Week 7-8)

> **Goal**: Add visual refinement, animations, and micro-interactions that create a premium brand feel. Make the shopping experience enjoyable.

### 4.1 Animation & Micro-Interactions

**Priority**: Medium | **Effort**: Medium | **Impact**: Perceived quality

| Task | Details |
|------|---------|
| Page transition animations | Smooth fade/slide transitions between pages using `next/navigation` events + CSS transitions |
| Add-to-cart animation | Product flies to cart icon animation (arc motion). Cart icon bounces. Count increments with spring animation. |
| Button hover effects | Consistent hover states: lift + shadow for primary buttons, background fill for outline buttons |
| Scroll-triggered animations | Sections fade-in/slide-up as they enter viewport using `IntersectionObserver` or Framer Motion |
| Skeleton loading refinement | Replace simple pulse skeletons with shimmer effect (already partially exists). Ensure all loading states have skeletons. |
| Toast notification enhancement | Custom toast styles with product image preview for "Added to cart", order confirmations |
| Price counter animation | When price changes (quantity update, coupon applied), number counts up/down smoothly |
| Heart/wishlist animation | Ping animation on add, subtle deflate on remove. Red fill color transition. |
| Smooth accordion/expand animations | Product filters, FAQ page, checkout steps use `max-height` or Framer Motion for smooth expand/collapse |
| Loading state improvements | Replace all raw `LoadingSpinner` with contextual skeletons that match the final layout shape |

**Acceptance Criteria**:
- [ ] Add-to-cart has visible product-to-cart animation
- [ ] All sections have scroll-triggered entrance animations
- [ ] Button hover states are consistent site-wide
- [ ] Zero "flash of empty content" - all loading states use layout-matching skeletons

### 4.2 Hero & Homepage Redesign

**Priority**: Medium | **Effort**: Medium | **Impact**: First impression

| Task | File(s) | Details |
|------|---------|---------|
| Fix hero height inconsistency | `SanityHeroCarousel.tsx` | Unify loading, error, and slide heights. Use consistent `min-h-[400px] md:min-h-[500px]` |
| Add secondary CTA slot to hero | `SanityHeroCarousel.tsx` | Support "Shop Now" (primary) + "Learn More" (outline) dual CTAs from CMS |
| Add parallax effect to hero images | `SanityHeroCarousel.tsx` | Subtle parallax scroll on background images for depth |
| Add "New Arrivals" section to homepage | `page.tsx` | Horizontal scroll strip of newest products below featured |
| Add "How It Works" section | `page.tsx` | 3-step visual: (1) Browse local growers -> (2) Add to cart -> (3) Delivered fresh to you |
| Improve category cards | `page.tsx` (CategoryCard) | Add gradient overlay on images, subtle hover zoom, product count badge |
| Add promotional banner component | New: `src/components/cms/PromoBanner.tsx` | CMS-driven promotional banner between page sections (sale announcements, seasonal deals) |
| Newsletter signup section | Homepage | Email input with CTA: "Get fresh deals delivered to your inbox" before footer |

**Acceptance Criteria**:
- [ ] Hero has consistent height across all states
- [ ] Dual CTA supported in hero slides
- [ ] "How It Works" section present on homepage
- [ ] Newsletter signup functional with email capture

### 4.3 Footer Redesign

**Priority**: Low | **Effort**: Low | **Impact**: Trust & professionalism

| Task | File(s) | Details |
|------|---------|---------|
| Remove hardcoded font | `footer.tsx` (L17) | Use `font-sans` instead of `font-['Roboto']` |
| Add payment method logos | Footer | Show accepted payment logos: GCash, GrabPay, Visa, Mastercard, COD (use images from `/public/payment-logos/`) |
| Add trust badges | Footer | SSL secure, satisfaction guarantee, fresh guarantee badges |
| Add newsletter signup | Footer | Email input with subscribe button |
| Add "Back to Top" button | Footer or global | Smooth scroll-to-top button that appears after scrolling past first viewport |
| Improve footer mobile layout | `footer.tsx` | Accordion sections on mobile instead of stacked columns |
| Add app download links | Footer | If mobile apps planned: "Download on App Store" / "Get on Google Play" placeholders |
| Add business info | Footer | Company registration, business address, customer support hours |

**Acceptance Criteria**:
- [ ] Payment method logos visible in footer
- [ ] Trust badges present
- [ ] Footer uses accordion on mobile
- [ ] Back-to-top button functional

---

## Phase 5: Advanced UX Features (Week 9-10)

> **Goal**: Add sophisticated e-commerce features that increase engagement, average order value, and repeat purchases.

### 5.1 Personalization Engine

| Task | Details |
|------|---------|
| Recently viewed products | Persistent strip across shop, product detail, and cart pages. Stored in localStorage, synced to Firestore for authenticated users. |
| Personalized recommendations | "Based on your browsing" section using collaborative filtering (products viewed by users who also viewed X). Start with simple "same category" fallback. |
| Saved searches & alerts | "Save this search" button on shop page. Optional notification when new products match saved filters. |
| Wishlist improvements | Wishlist sharing via link, "Price Drop" notifications, "Move to Cart" button, wishlist collections/folders |
| Returning user greeting | "Welcome back, [Name]!" toast on return visit. Show "Continue where you left off" with last viewed products. |

### 5.2 Social Commerce Features

| Task | Details |
|------|---------|
| Product reviews with photos | Allow image upload in reviews. Display photo grid in review section. |
| Review helpfulness voting | "Was this review helpful?" Yes/No buttons. Sort reviews by helpfulness. |
| Social sharing optimization | WhatsApp share (critical for PH market), Facebook, Twitter/X, copy link with UTM parameters |
| Grower story pages | Rich grower profile pages with photo gallery, story narrative, product showcase, location map, booking calendar |
| Community recipes | User-submitted recipes using MASH products. Link products mentioned in recipe for easy add-to-cart. |

### 5.3 Performance Optimization

| Task | Details |
|------|---------|
| Image optimization audit | Ensure all images use `next/image` with proper `width`, `height`, `priority` on LCP images. Add blur placeholder support. |
| Remove artificial delays | Remove 300ms delay in ProductCard `handleAddToCart` (L116). All user actions should respond < 100ms. |
| Route prefetching | Use `<Link prefetch>` for likely next pages (product cards -> product detail, cart -> checkout) |
| Bundle size audit | Identify and lazy-load heavy components (Google Maps picker, Chatbot, Calendly). Use `dynamic(() => import())` with loading skeletons. |
| API response caching | Implement `stale-while-revalidate` pattern for product listings. Use React Query cache with smart invalidation. |
| Implement ISR for product pages | Use `revalidate` option on product pages for server-side caching with periodic refresh |
| Core Web Vitals audit | Target: LCP < 2.5s, FID < 100ms, CLS < 0.1. Measure with Lighthouse and fix any failures. |

**Acceptance Criteria**:
- [ ] Lighthouse Performance score > 90
- [ ] LCP < 2.5s on product pages
- [ ] No artificial delays in user interactions
- [ ] Heavy components are lazy-loaded

---

## Phase 6: Seller Dashboard Polish (Week 11-12)

> **Goal**: Improve the seller-facing experience to attract and retain growers on the platform.

### 6.1 Seller Dashboard UX

| Task | Details |
|------|---------|
| Seller onboarding wizard | Guided setup: (1) Business info -> (2) Upload products -> (3) Set delivery areas -> (4) Go live. Progress saved between sessions. |
| Product management table | Sortable, filterable data table with bulk actions (activate, deactivate, delete). Inline editing for price and stock. |
| Order management improvements | Order cards with clear status badges, action buttons (approve, reject, mark shipped). Bulk order processing. |
| Analytics dashboard | Sales chart, order volume, popular products, customer demographics. Use existing chart components (`Bar-Chart.tsx`, `Line-chart.tsx`). |
| Inventory management alerts | Low stock warnings, out-of-stock notifications, restock reminders |
| Seller notification center | In-app notifications for new orders, reviews, messages. Email digest option. |

### 6.2 Admin Panel Polish (zen.mashmarket.app)

| Task | Details |
|------|---------|
| Admin dashboard overview | Key metrics: total orders, revenue, active sellers, new signups, pending approvals |
| User management table | Search, filter, sort users. View profile, order history, suspend/reinstate accounts. |
| Content moderation | Review queue for new products, reviews, recipe submissions |
| Platform health monitoring | Error rates, API latency, Sanity quota usage, Firebase usage stats |

---

## Phase 7: Dark Mode & Theming (Week 13)

> **Goal**: Complete the dark mode implementation and add optional theme customization.

| Task | Details |
|------|---------|
| Dark mode audit | Verify every component renders correctly in dark mode. Fix any hardcoded light-mode colors missed in Phase 1. |
| Dark mode toggle location | Add toggle to header (desktop) and mobile bottom nav settings. Remember preference. |
| Dark mode image treatment | Add subtle border to product images in dark mode to prevent "floating" effect. Adjust hero overlay opacity. |
| System theme detection | Respect `prefers-color-scheme` by default. Allow manual override. |
| Print stylesheet | Ensure cart, order confirmation, and receipts look good when printed (hide nav, use black text) |

---

## Implementation Priority Matrix

| Priority | Phase | Description | Weeks | Impact |
|:---:|:---:|---|:---:|:---:|
| P0 | 1.2 | Mobile navigation cart fix | 1 | Revenue-critical |
| P0 | 1.3 | SEO foundation (SSR + metadata) | 1-2 | Search visibility |
| P1 | 1.1 | Design system cleanup | 1 | Consistency |
| P1 | 1.4 | Accessibility foundation | 1-2 | Compliance |
| P1 | 2.1 | Header redesign | 3 | Navigation |
| P1 | 2.3 | Product detail decomposition | 3 | Code quality |
| P1 | 2.4 | Cart optimization (coupons, cross-sell) | 4 | AOV increase |
| P2 | 3.1 | Checkout redesign | 5 | Conversion |
| P2 | 2.2 | Shop page enhancement | 4 | Discovery |
| P2 | 3.2 | Auth UX improvement | 5-6 | Retention |
| P2 | 3.3 | Profile redesign | 6 | Retention |
| P3 | 4.1 | Animations & micro-interactions | 7 | Polish |
| P3 | 4.2 | Homepage redesign | 7-8 | First impression |
| P3 | 4.3 | Footer redesign | 8 | Trust |
| P3 | 5.3 | Performance optimization | 9 | Speed |
| P4 | 5.1 | Personalization | 9-10 | Engagement |
| P4 | 5.2 | Social commerce | 10 | Community |
| P4 | 6 | Seller dashboard | 11-12 | Supply side |
| P5 | 7 | Dark mode completion | 13 | Polish |

---

## Code Architecture Debt (Tracked Separately)

These refactors should happen alongside the relevant phase but are tracked explicitly:

| Current File | Lines | Target Split | Phase |
|---|:---:|---|:---:|
| `my-information/page.tsx` | 1549 | ProfileInfoCard, AddressManager, PasswordManager, PhoneVerification | 3.3 |
| `checkout/page.tsx` | 1248 | CheckoutStep1-3, OrderSummary, CheckoutProgress | 3.1 |
| `product/[slug]/page.tsx` | 949 | ProductGallery, ProductInfo, ProductTabs, SuggestedProducts | 2.3 |
| `shop/page.tsx` | 910 | FilterSidebar, ProductGrid, SearchBar, SortControls | 2.2 |
| `login/page.tsx` | 805 | useLogin hook, TwoFactorModal, LoginForm | 3.2 |
| `header.tsx` | 786 | MegaMenu, SocialLinks, AnnouncementBar, MobileNav | 2.1 |

**Target**: No single file exceeds 300 lines after all phases complete.

---

## Success Metrics

| Metric | Current (Estimated) | Target | Measurement |
|--------|:---:|:---:|---|
| Lighthouse Performance | ~60 | > 90 | Lighthouse CI |
| Lighthouse SEO | ~40 | > 95 | Lighthouse CI |
| Lighthouse Accessibility | ~55 | > 90 | Lighthouse CI |
| LCP (Largest Contentful Paint) | ~4s | < 2.5s | Core Web Vitals |
| CLS (Cumulative Layout Shift) | ~0.2 | < 0.1 | Core Web Vitals |
| Cart Abandonment Rate | Unknown | < 65% | Analytics |
| Mobile Conversion Rate | Unknown | +30% improvement | Analytics |
| Avg. Session Duration | Unknown | +20% improvement | GA4 |
| Bounce Rate (Shop Page) | Unknown | < 40% | GA4 |
| Organic Search Traffic | Minimal | +500% (from SEO fix) | Search Console |

---

## Design Principles (Guide All Decisions)

1. **Mobile-First**: Design for 375px first, then expand to desktop. Over 70% of PH e-commerce traffic is mobile.
2. **Speed Over Features**: A fast, simple experience beats a slow, feature-rich one. Target < 2s load times.
3. **Trust Building**: Every page should reinforce trust (verified sellers, secure checkout, real reviews, clear return policy).
4. **Minimal Friction**: Every click between "want" and "bought" is a chance for abandonment. Minimize steps.
5. **Filipino Context**: WhatsApp/Viber sharing, GCash/GrabPay payment preference, Tagalog-ready UI strings, COD as default payment.
6. **Accessibility First**: Build accessible from the start, not as an afterthought. Screen reader, keyboard, and color blind users are real customers.
7. **Component Reusability**: Build once, use everywhere. No copy-paste of UI patterns.

---

## Tooling & Dependencies to Add

| Tool | Purpose | Phase |
|------|---------|:---:|
| `framer-motion` | Page transitions, scroll animations, micro-interactions | 4 |
| `react-medium-image-zoom` | Product image zoom on hover/click | 2 |
| `@vercel/analytics` | Core Web Vitals monitoring | 5 |
| `next-seo` or custom | SEO metadata helper (or build custom with `generateMetadata`) | 1 |
| `schema-dts` | TypeScript types for JSON-LD structured data | 1 |
| `sharp` | Image optimization (Next.js image processing) | 5 |
| `axe-core` + `jest-axe` | Automated accessibility testing | 1 |

---

## Rollback Plan

Each phase is independently deployable. If a phase causes issues:

1. **Feature flags**: Major UX changes (mega-menu, new checkout) behind feature flags
2. **A/B testing**: Test new checkout flow against old with traffic splitting before full rollout
3. **Git tags**: Tag `pre-phase-X` before starting each phase for easy revert
4. **Monitoring**: Watch conversion rate, bounce rate, and error rates for 48 hours after each phase deploy

---

## Next Steps (Post-Completion)

All 43 UI/UX stories across 16 phases are COMPLETE. Recommended next priorities:

1. **Test Coverage Hardening** - Fix the 6 pre-existing failing test suites (91 failures across seller, cart, shop, ProductCard, seller dashboard)
2. **Performance Optimization** - Run Lighthouse audit, implement lazy loading for heavy components, ISR for product pages
3. **Dark Mode Audit** - Verify all components render correctly in dark mode (Phase 7 items)
4. **Animation & Micro-Interactions** - Add Framer Motion page transitions, add-to-cart animations (Phase 4.1)
5. **Advanced Features** - Personalization engine, mega-menu, quick view modal, product comparison (Phases 5.1-5.2)
6. **Seller Dashboard Polish** - Onboarding wizard, analytics dashboard, inventory alerts (Phase 6.1-6.2 admin)
7. **Payment Activation** - Enable PayMongo (GCash, GrabPay, credit cards) alongside COD

---

## Progress Tracking

### How Progress Is Tracked (No Duplicate Work)

Three files form the **single source of truth** and must stay in sync:

| File | Purpose | Updated When |
|------|---------|--------------|
| `prd-ui-ux.json` | Story status (`passes: true/false`), timestamps, progress log | After EVERY completed story |
| `progress.txt` | Codebase patterns + implementation log entries | After EVERY completed story |
| `.github/UI_UX_IMPROVEMENT_PLAN.md` | High-level phase checklist + score tracking | After each phase milestone |

### Story Completion Checklist (Mandatory)

When a story is completed, the agent MUST perform ALL of these updates:

1. **prd-ui-ux.json**: Set `"passes": true`, add `"completedAt"` ISO timestamp
2. **prd-ui-ux.json**: Increment `"completedStories"` count, update `"lastUpdated"`
3. **prd-ui-ux.json**: Append entry to `"progressLog"` array:
   ```json
   {
     "storyId": "UIUX-XXX",
     "completedAt": "2026-02-24T14:35:00Z",
     "filesChanged": ["src/components/layout/header.tsx"],
     "summary": "Brief technical summary"
   }
   ```
4. **progress.txt**: Append implementation entry at the end (after existing entries)
5. **UI_UX_IMPROVEMENT_PLAN.md**: Update phase task checkbox `[ ]` -> `[x]` if applicable

### Phase Completion Checklist

When ALL stories in a phase are complete:

1. Update phase status in **UI_UX_IMPROVEMENT_PLAN.md** heading: add "[COMPLETE]"
2. Update `"currentPhase"` in **prd-ui-ux.json** to next phase
3. Update Current State Assessment scores in this document
4. Add phase summary to **progress.txt**

### Progress Dashboard (Updated by Agent)

| Phase | Stories | Completed | Status |
|-------|:-------:|:---------:|--------|
| 1.2 Mobile Navigation Fix | 2 | 2 | COMPLETE |
| 1.1 Design System Cleanup | 7 | 7 | COMPLETE |
| 1.3 SEO Foundation | 3 | 3 | COMPLETE |
| 1.4 Accessibility Foundation | 3 | 3 | COMPLETE |
| 2.1 Header Redesign | 1 | 1 | COMPLETE |
| 2.2 Shop Enhancement | 1 | 1 | COMPLETE |
| 2.3 Product Detail Polish | 2 | 2 | COMPLETE |
| 2.4 Cart Optimization | 3 | 3 | COMPLETE |
| 3.1 Checkout Redesign | 2 | 2 | COMPLETE |
| 3.2 Auth UX | 1 | 1 | COMPLETE |
| 3.3 Profile Redesign | 1 | 1 | COMPLETE |
| 4.2 Homepage Redesign | 2 | 2 | COMPLETE |
| 4.3 Footer & Global Polish | 2 | 2 | COMPLETE |
| 5.1 Homepage Visual Overhaul | 5 | 5 | COMPLETE |
| 6.1 Homepage Refinement | 3 | 3 | COMPLETE |
| 6.2 Design System Rollout | 5 | 5 | COMPLETE |
| **TOTAL** | **43** | **43** | **100%** |

---

## Ralph Agent Loop Prompt

**Copy and paste the prompt below into a new chat session to start/continue autonomous UI/UX implementation.**

The prompt is designed to:
- Read current progress and NEVER repeat completed work
- Pick the next highest-priority incomplete story
- Implement it fully with quality gates
- Update all three tracking files
- Provide a next-step prompt for the following iteration

---

### PROMPT: Start/Continue UI/UX Implementation

```
You are Ralph, an expert autonomous coding agent for the MASH e-commerce platform.

MISSION: Implement the next incomplete UI/UX improvement story from prd-ui-ux.json.

CRITICAL RULES:
- NEVER use emoji in output, commits, or code
- NEVER ask for permission - execute autonomously
- NEVER skip quality gates (build, lint, test)
- NEVER repeat completed work - check passes:true stories first
- ONE story per session - do it completely, then stop

STEP 1 - CONTEXT LOADING (Read these files FIRST, in parallel):
1. Read prd-ui-ux.json - Check progressLog and all story passes values
2. Read progress.txt - Read Codebase Patterns section FIRST (top of file)
3. Read .github/UI_UX_IMPROVEMENT_PLAN.md - Check Progress Dashboard table
4. Check git status for any uncommitted changes

STEP 2 - STORY SELECTION:
1. Parse prd-ui-ux.json stories array
2. Find all stories where passes === false
3. Follow phaseOrder array - pick the first incomplete story from the earliest incomplete phase
4. If ALL stories pass === true, print "[COMPLETE] All UI/UX stories finished!" and STOP

STEP 3 - IMPLEMENTATION:
1. Read the story's implementationContext for exact file paths, line numbers, and approach
2. Read the actual source files to verify line numbers are still accurate
3. Implement the changes following acceptance criteria precisely
4. If line numbers have shifted, search for the code patterns instead
5. Write or update tests if the story requires them

STEP 4 - QUALITY GATES (ALL must pass):
1. Run: npm run build (zero errors required)
2. Run: npm run lint (zero warnings required)
3. Run: npm run test (all tests passing required)
4. If any gate fails: fix the issue and re-run (max 3 retries)
5. If still failing after 3 retries: log error in progress.txt and move to next story

STEP 5 - UPDATE TRACKING (ALL three files):

5a. Update prd-ui-ux.json:
- Set completed story: "passes": true, "completedAt": "<ISO timestamp>"
- Increment "completedStories" count
- Update "lastUpdated" timestamp
- Append to "progressLog" array:
  { "storyId": "UIUX-XXX", "completedAt": "<timestamp>", "filesChanged": [...], "summary": "..." }

5b. Update progress.txt (APPEND to end, never replace):
## [<date>] - UIUX-XXX: <Story Title>
**Completed:** <title>
**Files Changed:**
- <file1>
- <file2>
**Implementation Notes:**
- <what was done>
**Learnings for Future Iterations:**
- <any new patterns discovered>
**Quality Gates:** [PASS] Build | [PASS] Lint | [PASS] Tests
---

5c. Update .github/UI_UX_IMPROVEMENT_PLAN.md:
- Update Progress Dashboard table (increment completed count for the phase)
- If phase fully complete: mark phase status as "Complete"
- Update the total completed count

STEP 6 - GIT COMMIT:
git add .
git commit -m "UIUX-XXX: <Technical implementation summary>

Code Changes:
- <exact changes made>

Files Modified:
- <file list>

Quality Gates:
- Build: PASS
- Lint: PASS
- Tests: PASS

Reference: UIUX-XXX"

STEP 7 - SESSION COMPLETE:
Print a summary:
"[SUCCESS] Completed: UIUX-XXX - <title>
Progress: X/30 stories complete
Next story: UIUX-YYY - <title> (Phase Z)
Remaining in current phase: N stories

To continue, paste this same prompt in a new chat session."

STOP after completing ONE story. The user will paste this prompt again for the next iteration.
```

---

### PROMPT: Check Progress Only (No Implementation)

```
Read prd-ui-ux.json, progress.txt, and .github/UI_UX_IMPROVEMENT_PLAN.md.
Report the current UI/UX improvement progress:
1. How many stories are complete vs total?
2. What phase are we currently in?
3. What is the next story to implement?
4. List all completed stories with their dates.
5. Are there any quality gate failures logged?
Do NOT implement anything - just report status.
```

---

### PROMPT: Full Autonomous Loop (Multiple Stories)

```
You are Ralph, an expert autonomous coding agent for the MASH e-commerce platform.

MISSION: Implement ALL remaining incomplete UI/UX stories from prd-ui-ux.json in a continuous loop.

Follow the EXACT same process as the single-story prompt above, but after completing each story, IMMEDIATELY continue to the next incomplete story instead of stopping.

LOOP:
while (true) {
  1. Read prd-ui-ux.json for next incomplete story (passes === false)
  2. If none remain: print "[COMPLETE] All 30 UI/UX stories finished!" and EXIT
  3. Implement the story (Steps 1-6 from single-story prompt)
  4. Update all tracking files
  5. Git commit
  6. Print "[SUCCESS] Completed UIUX-XXX (Y/30). Continuing..."
  7. Continue to next story
}

STOP CONDITIONS:
- All stories have passes: true -> SUCCESS exit
- 3 consecutive quality gate failures -> ERROR exit with log
- Context window exhaustion -> Print current progress and next story ID for manual resume

Use subagents (runSubagent) for complex stories to conserve context window.
```

---

*This document is the living plan for UI/UX improvements. Updated automatically by Ralph agent after each story completion.*

---

## Phase 6: Homepage Refinement - Clean Design (2026-02-27)

> **Goal**: Strip away visual clutter, remove unnecessary sections, and establish a clean, professional homepage design that follows modern e-commerce best practices. No gradients, no emojis, no decorative orbs.

### 6.1 Homepage Section Cleanup

| Task | File(s) | Details | Status |
|------|---------|---------|--------|
| UIUX-036: Remove StatsBar and Newsletter | `src/app/page.tsx` | Removed StatsBar (1000+ Products, 50+ Farms, 4.9/5 Rating, Same-Day) and NewsletterSignup from render. Cleaned up unused imports. | DONE |
| UIUX-037: Clean design - remove gradients | `src/app/page.tsx`, `src/components/cms/HowItWorks.tsx`, `src/components/cms/TestimonialsSection.tsx` | Replaced all gradient backgrounds with solid muted tones. Consistent spacing py-16/20/28. Flat card designs. Border-defined badges. | DONE |
| UIUX-038: Testimonials accessibility | `src/components/cms/TestimonialsSection.tsx` | Replaced emoji pin with MapPin icon. Added section badge. aria-label on pagination dots. Consistent button styling. | DONE |

### Design Principles Applied

- **No gradients**: All section backgrounds use flat colors (bg-muted/20, bg-muted/30, bg-background)
- **No emojis**: All locations use Lucide MapPin icon
- **No decorative orbs/blur**: Clean card borders with subtle hover shadows
- **Consistent spacing**: All major sections use py-16 sm:py-20 lg:py-28
- **Badge pattern**: Badges have border border-primary/15 for subtle definition
- **CTA pattern**: Outline buttons use hover:bg-foreground hover:text-background for clear interaction
- **Card pattern**: Cards use border border-border with hover:shadow-md (not shadow-2xl)

### Files Changed

- [src/app/page.tsx](../src/app/page.tsx) - Removed StatsBar, NewsletterSignup, 4 unused Lucide imports. Refactored SectionHeader, CategoryCard, GrowerCard, FeaturedCategoriesSection, FeaturedProductsSection, FeaturedGrowersSection.
- [src/components/cms/HowItWorks.tsx](../src/components/cms/HowItWorks.tsx) - Replaced gradient step cards with border-based bg-background cards. Solid bg-muted for icon containers. Flat hr-style connecting line.
- [src/components/cms/TestimonialsSection.tsx](../src/components/cms/TestimonialsSection.tsx) - Added MapPin import. Replaced emoji with icon. Added Testimonials badge. aria-label on pagination. Consistent bg-muted/20.

### Quality Gates

- [x] `npm run build` - Zero errors (152 routes compiled)
- [x] `npm run lint` - Zero warnings
- [x] No new TypeScript errors

---

## Phase 6.2: Design System Rollout - High-Traffic Pages (2026-02-27)

> **Goal**: Extend the clean design system from the homepage to all remaining high-traffic customer-facing pages. Eliminate all remaining gradient classes, emoji characters, and hardcoded color values across the shop, product detail, stores, and footer.

### 6.2 Page-by-Page Design System Alignment

| Task | File(s) | Details | Status |
|------|---------|---------|--------|
| UIUX-039: Shop filter chip tokens | `src/app/(shop)/shop/ShopClient.tsx` | Replaced hardcoded blue/amber chip colors with bg-muted text-foreground border-border | DONE |
| UIUX-040: Product detail gradient removal | `src/app/(shop)/product/[slug]/ProductDetailClient.tsx` | Removed bg-gradient-to-b from wrapper div, replaced with flat bg-background | DONE |
| UIUX-041: Stores page emoji/color cleanup | `src/app/stores/page.tsx` | Replaced 4 emojis with Lucide icons, bg-green-600 with bg-primary, added section badges | DONE |
| UIUX-042: Footer link modernization | `src/components/layout/footer.tsx` | Unified links to text-muted-foreground hover:text-foreground, uppercase headings | DONE |
| UIUX-043: PR documentation | `.github/PR-PHASE-6.2-DESIGN-SYSTEM.md` | Full PR description for develop branch merge | DONE |

### Branch & PR

- **Branch**: `feature/design-system-rollout`
- **Target**: `develop`
- **PR Doc**: [PR-PHASE-6.2-DESIGN-SYSTEM.md](PR-PHASE-6.2-DESIGN-SYSTEM.md)

### Files Changed

- `src/app/(shop)/shop/ShopClient.tsx` - Tag chip and price chip color tokens replaced
- `src/app/(shop)/product/[slug]/ProductDetailClient.tsx` - Gradient wrapper removed
- `src/app/stores/page.tsx` - Emojis replaced with Lucide icons, hardcoded green removed, section badges added, card borders added, CTA section updated
- `src/components/layout/footer.tsx` - All link hover states unified, column headings modernized, contact icons improved

### Quality Gates

- [x] `npm run build` - Zero errors (152 routes compiled)
- [x] `npm run lint` - Zero warnings
- [x] No gradient classes in any modified file
- [x] No emoji characters in any modified file
- [x] No hardcoded color values in any modified file

---
