<!-- 5ad6500c-7d27-4711-b834-87ee40940ab1 38adf068-359c-4bff-aa43-e38d85cb83aa -->
# MASH Market Task Implementation Plan

## Overview

This plan covers 28 tasks from the MASH Market.csv file, organized by functional areas. Tasks are prioritized by user impact and implementation dependencies.

## 1. Layout & Spacing (Buyer, Seller)

### 1.1 Body Padding (Applies to All)

**Files:** `src/app/layout.tsx`, `src/app/client-layout.tsx`, `src/app/page.tsx`

- **Current:** Desktop view has narrow side padding
- **Action:** Increase horizontal padding for desktop viewports (lg and above)
- **Implementation:** 
- Update main container padding classes from `px-4 sm:px-6 lg:px-8` to `px-4 sm:px-6 lg:px-12 xl:px-16`
- Apply consistently across all pages via layout wrapper
- Test on common desktop resolutions (1920x1080, 1440x900)

### 1.2 Proper Header Padding

**Files:** `src/components/layout/header.tsx`, `src/components/layout/simple-header.tsx`

- **Current:** Body and header padding misaligned
- **Action:** Align body padding to match header padding
- **Implementation:**
- Ensure header uses same max-width container (`max-w-7xl mx-auto`)
- Match padding classes exactly: `px-4 sm:px-6 lg:px-8` (or updated values from 1.1)
- Verify alignment on all breakpoints

## 2. Cart & Checkout (Buyer, Flow)

### 2.1 Add Animation for Cart Number Indicator

**Files:** `src/components/layout/cart-dropdown.tsx`, `src/components/layout/header.tsx`

- **Current:** No animation when cart count changes
- **Action:** Add subtle animation on first add to cart
- **Implementation:**
- Use Framer Motion or CSS animations
- Animation options: size pulse (scale 1 → 1.2 → 1), brief blink, slight tilt
- Trigger only on increment (not decrement)
- Add small particle effect (optional, 2-3 particles)
- Duration: 300-500ms

### 2.2 Fix Checkout Flow

**Files:** `src/app/(shop)/checkout/page.tsx`

- **Current:** Incomplete checkout flow
- **Action:** Complete checkout implementation
- **Implementation:**
- Verify form validation works correctly
- Ensure cart items display properly
- Add order submission logic
- Implement success/error states
- Add loading states during submission
- Test all form fields and validation

### 2.3 Remove Delivery Option

**Files:** `src/app/(shop)/checkout/page.tsx`

- **Current:** Delivery option exists in checkout
- **Action:** Remove delivery option from checkout form
- **Implementation:**
- Remove delivery enum from schema (keep only "pickup" or remove field entirely)
- Remove delivery selection UI components
- Update form validation schema
- Update any backend logic that depends on delivery option

### 2.4 Clear All - Add Confirmation

**Files:** `src/components/layout/cart-dropdown.tsx`

- **Current:** No confirmation when clearing cart
- **Action:** Add confirmation dialog before clearing cart
- **Implementation:**
- Use AlertDialog component from shadcn/ui
- Show confirmation: "Are you sure you want to clear all items from your cart?"
- Add "Cancel" and "Clear All" buttons
- Only clear if user confirms

## 3. Authentication & Flow (Flow, Auth)

### 3.1 Wishlist - Only Appear When Logged In

**Files:** `src/components/layout/header.tsx`, `src/app/(shop)/wishlist/page.tsx`

- **Current:** Wishlist visible without authentication
- **Action:** Hide wishlist link/icon when user is not authenticated
- **Implementation:**
- Check `isAuthenticated()` from `@/lib/auth`
- Conditionally render wishlist link in header
- Redirect to login if accessing `/wishlist` without auth (add to middleware protected routes)
- Show toast message: "Please log in to access your wishlist"

### 3.2 Growers Near Me - Hide Without Authentication

**Files:** `src/app/page.tsx`, `src/app/grower/page.tsx`

- **Current:** "Growers Near Me" section visible to all users
- **Action:** Hide or disable for non-authenticated users
- **Implementation:**
- Check authentication status in FeaturedGrowersSection
- Hide section on landing page if not authenticated
- Hide/disable "Growers Near Me" link in navigation
- Add login prompt: "Log in to find growers near you"
- Optionally redirect `/grower` route to login if not authenticated

### 3.3 Start Selling - Conditional Display Logic

**Files:** `src/components/layout/header.tsx`, `src/components/layout/simple-header.tsx`

- **Current:** Both "Seller Center" and "Start Selling" appear together
- **Action:** Show only one based on user state
- **Implementation:**
- Check if user has seller profile/role
- If seller exists: show only "Seller Center"
- If no seller profile: show only "Start Selling"
- Use `useUserProfile()` hook to check seller status
- Add API endpoint to check seller status if needed

### 3.4 Start Selling Placeholder Page

**Files:** Create `src/app/(seller)/start-selling/page.tsx`

- **Current:** No dedicated Start Selling page
- **Action:** Create new page for seller onboarding
- **Implementation:**
- Create route: `/start-selling`
- Design onboarding form (business info, verification, etc.)
- Add form validation
- Submit seller application
- Show success state after submission
- Link from header "Start Selling" button

### 3.5 Forgot Password UI/UX

**Files:** `src/app/(auth)/forgot-password/page.tsx`

- **Current:** Forgot password page exists but needs UI/UX improvements
- **Action:** Improve design and user experience
- **Implementation:**
- Review current implementation
- Ensure consistent styling with other auth pages
- Add clear instructions and helpful messaging
- Improve error handling and success states
- Add loading states during submission
- Test email validation and submission flow

## 4. Products & Catalog (Products, Query)

### 4.1 Product Image Too Large

**Files:** `src/components/product/ProductCard.tsx`, `src/app/(shop)/catalog/page.tsx`

- **Current:** Product images not fully visible on screen
- **Action:** Ensure all product images fit within viewport
- **Implementation:**
- Review ProductCard image sizing
- Use `object-fit: contain` or adjust aspect ratio
- Set max-height constraints
- Ensure responsive sizing across breakpoints
- Test with various image aspect ratios

### 4.2 Query-Based Search/Pagination

**Files:** `src/app/(shop)/catalog/page.tsx`, `src/lib/api/products.ts`

- **Current:** Frontend filtering may be inefficient
- **Action:** Implement backend-heavy query approach
- **Implementation:**
- Move filtering logic to API endpoints
- Update `ProductsApi.getProducts()` to accept query params
- Update catalog page to send all filters as query params
- Implement server-side filtering and pagination
- Reduce data transferred to frontend

### 4.3 Add Debounced Search (5s)

**Files:** `src/app/(shop)/catalog/page.tsx`, `src/components/layout/header.tsx`

- **Current:** Search triggers on every keystroke
- **Action:** Add 5-second debounce for search/filtering
- **Implementation:**
- Use `useDebounce` hook or implement debounce logic
- Delay search API calls by 5 seconds after user stops typing
- Show loading indicator during debounce period
- Apply to both catalog search and header search
- Consider reducing to 2-3 seconds if 5s feels too long

### 4.4 Missing Show Products Count

**Files:** `src/app/(shop)/catalog/page.tsx`

- **Current:** No option to change products per page
- **Action:** Add dropdown to select products per page (12, 24, 48, etc.)
- **Implementation:**
- Add Select component above products grid
- Options: 12, 24, 48, 96
- Update `itemsPerPage` state
- Reset to page 1 when count changes
- Display current selection: "Showing X products per page"

### 4.5 Missing Pagination - Use "More Products" Instead

**Files:** `src/app/(shop)/catalog/page.tsx`

- **Current:** No pagination controls
- **Action:** Replace pagination with "Load More" / "More Products" button
- **Implementation:**
- Remove pagination component
- Add "Load More Products" button at bottom
- Load next page when clicked
- Append products to existing list (infinite scroll alternative)
- Disable button when no more products available
- Show loading state while fetching

### 4.6 No Products Indicator

**Files:** `src/app/(shop)/catalog/page.tsx`, `src/app/grower/page.tsx`

- **Current:** No placeholder when no products/shops found
- **Action:** Add empty state component
- **Implementation:**
- Create EmptyState component
- Show message: "No products found" with helpful text
- Add illustration or icon
- Suggest clearing filters or browsing categories
- Apply to products, growers, and wishlist pages

### 4.7 Fix Filter Dropdown Width

**Files:** `src/app/(shop)/catalog/page.tsx`

- **Current:** Filter dropdown width not fixed
- **Action:** Set fixed width for filter dropdowns
- **Implementation:**
- Review Select component styling
- Set min-width and max-width
- Ensure consistent width across all filter dropdowns
- Test on mobile and desktop

## 5. Growers & Shops (Shops, Query, Landing)

### 5.1 Add Active Grower Count and "Load More"

**Files:** `src/app/grower/page.tsx`, `src/lib/api/main.ts`

- **Current:** No grower count or pagination
- **Action:** Add grower count display and load more functionality
- **Implementation:**
- Display count: "Showing X of Y growers"
- Default: 8 growers per page
- Options: 8, 16, 24, 50 per page
- Add "Load More" button (loads 8 more)
- Update API to support pagination
- Maintain selected grower state when loading more

### 5.2 Filter in Browse Growers Section

**Files:** `src/app/grower/page.tsx`

- **Current:** No location filter for growers
- **Action:** Add location filter by region
- **Implementation:**
- Add filter sidebar or dropdown
- Filter by region/location
- Update grower list when filter changes
- Show selected filter as active
- Reset to show all when filter cleared

### 5.3 Missing Shop Banner in Card

**Files:** `src/app/page.tsx`, `src/components/cms/*` (if grower cards exist)

- **Current:** Shop/grower cards missing banner images
- **Action:** Add shop banner image to grower cards
- **Implementation:**
- Update GrowerCard component to include banner
- Fetch banner image from API/CMS
- Display banner at top of card
- Use placeholder if banner not available
- Ensure responsive sizing

### 5.4 Shop Card Action Links - Fixed at Bottom

**Files:** `src/app/page.tsx` (GrowerCard component)

- **Current:** Action links position depends on content
- **Action:** Fix action links at bottom of card
- **Implementation:**
- Use flexbox: `flex flex-col` with `justify-between`
- Set card to `min-h-[X]` for consistent height
- Pin action links to bottom with `mt-auto`
- Ensure consistent card heights in grid

## 6. UI Components (Landing, Products)

### 6.1 Add to Cart Button - Light Green Palette

**Files:** `src/components/product/ProductCard.tsx`, `src/app/(shop)/product/[id]/page.tsx`

- **Current:** Add to cart button uses dark green
- **Action:** Change to light green palette (#A7C957 or #6A994E)
- **Implementation:**
- Update button background color
- Ensure text contrast (white text on light green)
- Update hover states
- Apply to all "Add to Cart" buttons
- Test accessibility (contrast ratios)

### 6.2 Button Strokes - Use Low Shadow Instead

**Files:** All button components, `src/components/ui/button.tsx`

- **Current:** Primary buttons use strokes/borders
- **Action:** Replace strokes with low shadow
- **Implementation:**
- Remove border classes from primary buttons
- Add subtle shadow: `shadow-sm` or `shadow-md`
- Use light green palette for primary buttons
- Ensure white text on buttons
- Update all button variants consistently

### 6.3 "Loading Hero Content" - More Creative

**Files:** `src/app/page.tsx` (HeroSection component)

- **Current:** Generic "Loading hero content..." message
- **Action:** Replace with creative loading state
- **Implementation:**
- Add animated skeleton loader
- Use brand colors in animation
- Add engaging copy: "Discovering amazing products..." or "Preparing your marketplace..."
- Consider animated logo or illustration
- Ensure smooth transition to loaded content

## 7. Footer (Footer)

### 7.1 Missing Payment Logo

**Files:** `src/components/layout/footer.tsx`

- **Current:** Payment logos use placeholder images
- **Action:** Add actual payment method logos
- **Implementation:**
- Source logos: Visa, Mastercard, GCash, Maya, Cash on Delivery
- Add to `/public` directory
- Update Image src paths
- Ensure proper sizing and styling
- Test display on dark background

### 7.2 Missing Logo

**Files:** `src/components/layout/footer.tsx`, `src/components/layout/header.tsx`

- **Current:** Footer/header may be missing MASH logo
- **Action:** Add MASH logo to footer and verify header
- **Implementation:**
- Check if logo exists in `/public`
- Add logo image to footer (replace or supplement "MASH MARKET" text)
- Verify header logo displays correctly
- Ensure responsive sizing
- Add alt text for accessibility

## Implementation Order

### Phase 1: Critical UX Fixes (Week 1)

1. Body padding alignment (1.1, 1.2)
2. Authentication-based visibility (3.1, 3.2, 3.3)
3. Checkout flow completion (2.2, 2.3)
4. Cart confirmation (2.4)

### Phase 2: Product & Catalog Improvements (Week 2)

5. Product image sizing (4.1)
6. Query-based search with debouncing (4.2, 4.3)
7. Products count and load more (4.4, 4.5)
8. Empty states (4.6)
9. Filter dropdown fixes (4.7)

### Phase 3: Grower Features (Week 2-3)

10. Grower count and load more (5.1)
11. Grower location filter (5.2)
12. Shop card improvements (5.3, 5.4)

### Phase 4: UI Polish (Week 3)

13. Button styling updates (6.1, 6.2)
14. Loading states (6.3)
15. Cart animation (2.1)

### Phase 5: Content & Branding (Week 3-4)

16. Footer logos (7.1, 7.2)
17. Start Selling page (3.4)
18. Forgot Password UI (3.5)

## Notes

- All changes should maintain responsive design
- Test on mobile, tablet, and desktop viewports
- Ensure accessibility standards (WCAG AA)
- Use existing color palette from `docs/COLOR_PALETTE.md`
- Follow existing component patterns and structure
- Update TypeScript types as needed

## To-Do List
*Last Updated: November 5, 2025*

### ✅ Completed (15/26 - 58%)
- [x] Add animation to cart number indicator when items are first added (pulse, blink, or particles)
- [x] Complete checkout flow implementation with form validation, order submission, and success/error states
- [x] Remove delivery option from checkout form and update schema
- [x] Add confirmation dialog before clearing cart
- [x] Hide wishlist link when user is not authenticated and redirect to login
- [x] Hide 'Growers Near Me' section when user is not authenticated
- [x] Show only 'Seller Center' or 'Start Selling' based on user's seller status
- [x] Improve Forgot Password page UI/UX with better styling and messaging
- [x] Add MASH logo to footer and verify header logo displays correctly
- [x] Implement backend-heavy query-based search and pagination for products
- [x] Add active grower count display and Load More button (8, 16, 24, 50 per page options)
- [x] Add dropdown to show products count per page (12, 24, 48, 96 options)
- [x] Replace pagination with 'Load More Products' / 'More Products' button
- [x] Add no products/growers indicator placeholder for empty states
- [x] Fix filter dropdown width to be consistent and fixed
- [x] Add 5-second debounce for search/filtering to reduce query load

### ⚠️ Partially Complete (5/26 - 19%)
- [~] Increase body padding for desktop view and align with header padding across all pages (Most pages done, header needs update)
- [~] Change add to cart button color to light green palette (#A7C957 or #6A994E) (Using #6A994E, verify if correct)
- [~] Replace button strokes with low shadow and use light green palette with white text (Mostly done, review outline variant)
- [~] Replace 'Loading Hero Content' placeholder with creative loading animation (Has animation, needs better copy)
- [~] Fix product images to be fully visible on screen with proper aspect ratios (Implemented with object-contain, needs verification)

### ❌ Not Implemented (6/26 - 23%)
- [ ] **Create Start Selling placeholder/onboarding page at /start-selling route** (HIGH PRIORITY)
- [ ] Add shop banner images to grower/shop cards on landing page
- [ ] Fix shop card action links to be positioned at the bottom of cards
- [ ] Add actual payment method logos (Visa, Mastercard, Maya, COD) to footer (GCash done, others pending)
- [ ] Add location filter by region in Browse Growers section

---

## 📊 Status Summary
**Overall Progress:** 58% Complete (15/26 tasks)

**See detailed analysis:** `docs/task-status-analysis.md`