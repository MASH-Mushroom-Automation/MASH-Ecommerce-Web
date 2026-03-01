# Consumer-Side Development Plan - MASH E-Commerce Platform

> **Created:** February 20, 2026
> **Updated:** February 22, 2026 (v7.0.0 -- All 27 stories COMPLETE)
> **PRD File:** prd.json (v7.0.0 -- 27 stories, 27 complete, 0 remaining)
> **Status:** ALL CONSUMER-SIDE STORIES COMPLETE
> **Target:** Production-ready consumer shopping experience at www.mashmarket.app
> **Payment:** COD-ONLY (Phase 1 skipped entirely -- PayMongo fully coded but disabled)

---

## RALPH Autonomous Agent Integration

This document is paired with `prd.json` (v7.0.0) which contains 27 consumer stories.
All 27 stories have `passes: true`. The RALPH agent has completed all consumer-side work.

---

## Progress Summary

| Metric | Value |
| ------ | ----- |
| Total Stories (active) | 27 (excl. 6 skipped Payment stories) |
| Complete | 27 |
| Remaining | 0 |
| Skipped (COD-only) | 6 (PAY-001 through PAY-006) |
| Test Suites | 376 |
| Tests Passing | 7149/7149 |

### Phase Progress

| Phase | Stories | Complete | Status |
| ----- | ------- | -------- | ------ |
| Phase 1: Payment | 6 | 0 | SKIPPED (COD-only by design) |
| Phase 2: Wishlist | 5 | 5 | COMPLETE |
| Phase 3: Orders | 4 | 4 | COMPLETE |
| Phase 4: Lalamove | 4 | 4 | COMPLETE |
| Phase 5: UI/UX | 3 | 3 | COMPLETE |
| Phase 6: Cart | 3 | 3 | COMPLETE |
| Testing | 9 | 9 | COMPLETE |

---

## What Works Today (Fully Implemented)

| Feature | Status | Detail |
| ------- | ------ | ------ |
| Product browsing (shop page) | COMPLETE | Filters, search, sort, grid/list toggle, server-side pagination |
| Product detail pages | COMPLETE | Gallery, reviews, stock validation, grower info, variant selector |
| Cart (add/remove/quantity) | COMPLETE | Cookie persistence + Firebase sync for logged-in users |
| Checkout (3-step wizard) | COMPLETE | COD only, Lalamove delivery + pickup, address management |
| Order creation (Firestore) | COMPLETE | Multi-vendor support, order numbers, confirmation |
| Order history page | COMPLETE | Real-time updates, status timeline, cancel order button |
| Cancel order UI | COMPLETE | Confirmation dialog on pending/approved orders |
| Consumer delivery tracking | COMPLETE | Route at `/profile/orders/[orderId]/track`, TrackingMap, StatusTimeline |
| Wishlist page | COMPLETE | Firebase sync for authenticated users, cookie for guests, GROQ optimized |
| Wishlist Firebase sync | COMPLETE | Real-time sync via FirebaseWishlistService |
| Lalamove delivery quotes | COMPLETE | Vehicle selection (Motorcycle/Sedan/SUV), sandbox API |
| Lalamove production guide | COMPLETE | `.github/LALAMOVE_PRODUCTION_GUIDE.md` |
| Search bar (header) | COMPLETE | SearchAutocomplete with trending, recent, category suggestions, keyboard nav |
| Mobile bottom nav | COMPLETE | MobileBottomNav + MobileBottomNavSpacer |
| Mini-cart dropdown | COMPLETE | cart-dropdown.tsx sheet/drawer in header |
| Address management | COMPLETE | AddressSelector with Firebase CRUD, default address |
| Guest wishlist toggle | COMPLETE | No login required, cookie storage |

### SearchAutocomplete Features (Fully Rewritten)

The SearchAutocomplete component at `src/components/search/SearchAutocomplete.tsx` includes:
- Focus-triggered dropdown showing trending searches and recent history
- Real-time product and category suggestions from Sanity
- Keyboard navigation (ArrowDown/ArrowUp/Enter/Escape)
- Category click navigation to `/shop?category={slug}`
- Product click navigation to `/product/{slug}`
- No-results state with "Try a different search term" and "Search anyway"
- Loading state with "Searching..." text
- Clear search history, outside-click-to-close
- 26 comprehensive tests -- all passing

---

## Remaining Opportunities (Future Phases)

These features are NOT in the current PRD but could be implemented as future enhancements:

### Payment System (When Ready)

PayMongo is fully coded but disabled. To enable:
1. Set `PAYMONGO_SECRET_KEY` and `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY` in `.env`
2. Change checkout step3Schema from `z.enum(["cod"])` to include `"gcash"`, `"grab_pay"`, `"card"`
3. Existing files: `src/lib/payment/paymongo.ts`, `src/app/api/payment/create-intent/route.ts`, `src/app/api/payment/webhook/route.ts`

### Lalamove Production Activation

Currently on sandbox API. To go live:
1. Follow `.github/LALAMOVE_PRODUCTION_GUIDE.md`
2. Change `LALAMOVE_API_HOST` from `rest.sandbox.lalamove.com` to `rest.lalamove.com`
3. Update API key and secret in `.env`

### Nice-to-Have Features

| Feature | Complexity | Description |
| ------- | ---------- | ----------- |
| Scheduled delivery | Medium | Date/time picker for Lalamove `scheduleAt` parameter |
| Reorder / Buy Again | Medium | Add all order items back to cart with stock validation |
| Order receipts | Low | Print-friendly HTML receipt for completed orders |
| Push notifications | Medium | Browser notifications on order status changes |
| Recently viewed products | Low | localStorage tracking + carousel on PDP/shop |
| Category landing pages | Medium | SEO metadata, hero section, breadcrumbs |
| Dynamic sitemap | Low | Product/category/grower URLs from Sanity |
| Saved for Later | Medium | Move cart items to save list, persist in Firebase |
| Tax calculation | Low | Configurable tax rate on order totals |
| Coupon codes | High | Promo validation, flat/percentage discounts |
| Delivery fee breakdown | Low | Vehicle type, distance, driver info in order detail |

---

## Test Coverage

### Current Test Metrics

```
Test Suites:  376 passed
Tests:        7149 passed
Time:         ~255 seconds
```

### New Test Suites Added (This Session)

| Suite | Tests | Coverage Area |
| ----- | ----- | ------------- |
| checkout-schemas.test.ts | 22 | Zod validation for all 3 checkout steps |
| CheckoutProgress.test.tsx | 9 | Step indicator progress bar |
| OrderSummary.test.tsx | 14 | Cart review with items, totals, delivery info |
| ProductInfoSection.test.tsx | 24 | Product buy box (price, stock, quantity, add to cart) |
| VariantSelector.test.tsx | 18 | Product variant selection (size, color, weight) |
| FilterSidebar.test.tsx | 24 | Shop filter panel (categories, price, tags) |
| **Total** | **111** | **High-impact consumer components** |

### Previously Fixed Test Suites (This Session)

8 failing suites (30 tests) were identified and fixed:
- ChatButton.test.tsx -- Responsive class assertion
- api-functions-batch.test.ts -- SWC parse error + fetch mock
- api-routes-batch5.test.ts -- Firestore mock completeness
- api-routes-batch6.test.ts -- Lalamove quotation object structure
- api-routes-batch7.test.ts -- Zod `.issues` vs `.errors` compatibility
- seller orders page.test.tsx -- Named vs default export mock
- signup page.test.tsx -- Button vs link role
- SearchAutocomplete.test.tsx -- Full component rewrite (18 failures -> 0)

### Components with Test Coverage

| Component | Tested? | Test File |
| --------- | ------- | --------- |
| SearchAutocomplete | YES (26 tests) | `src/components/search/__tests__/SearchAutocomplete.test.tsx` |
| ProductInfoSection | YES (24 tests) | `src/components/product/__tests__/ProductInfoSection.test.tsx` |
| VariantSelector | YES (18 tests) | `src/components/product/__tests__/VariantSelector.test.tsx` |
| FilterSidebar | YES (24 tests) | `src/components/shop/__tests__/FilterSidebar.test.tsx` |
| OrderSummary | YES (14 tests) | `src/components/checkout/__tests__/OrderSummary.test.tsx` |
| CheckoutProgress | YES (9 tests) | `src/components/checkout/__tests__/CheckoutProgress.test.tsx` |
| checkout-schemas | YES (22 tests) | `src/components/checkout/__tests__/checkout-schemas.test.ts` |
| ProductCard | YES | `src/components/product/__tests__/ProductCard.test.tsx` |
| CartContext | YES | `src/contexts/__tests__/CartContext.test.tsx` |
| WishlistContext | YES | `src/contexts/__tests__/WishlistContext.test.tsx` |
| AuthContext | YES (4 files) | `src/contexts/__tests__/AuthContext*.test.tsx` |

---

## Files Quick Reference

### Consumer Page Routes

| Page | Route | File |
| ---- | ----- | ---- |
| Shop / Catalog | `/shop` | `src/app/(shop)/shop/page.tsx` |
| Product Detail | `/product/[slug]` | `src/app/(shop)/product/[slug]/page.tsx` |
| Cart | `/cart` | `src/app/(shop)/cart/page.tsx` |
| Wishlist | `/wishlist` | `src/app/(shop)/wishlist/page.tsx` |
| Checkout | `/checkout` | `src/app/(shop)/checkout/page.tsx` |
| Payment Success | `/checkout/payment-success` | `src/app/(shop)/checkout/payment-success/page.tsx` |
| Payment Failed | `/checkout/payment-failed` | `src/app/(shop)/checkout/payment-failed/page.tsx` |
| Order History | `/profile/order-history` | `src/app/(user)/profile/order-history/page.tsx` |
| Order Tracking | `/profile/orders/[orderId]/track` | `src/app/(user)/profile/orders/[orderId]/track/page.tsx` |
| My Information | `/profile/my-information` | `src/app/(user)/profile/my-information/page.tsx` |

### Key Services

| Service | File | Status |
| ------- | ---- | ------ |
| PayMongo payments | `src/lib/payment/paymongo.ts` | Coded, disabled (COD-only) |
| Firebase wishlist | `src/lib/firebase/wishlist.ts` | Complete, wired to context |
| Firebase addresses | `src/lib/firebase/addresses.ts` | Complete |
| Firebase orders | `src/lib/firebase/orders.ts` | Complete |
| Firebase notifications | `src/lib/firebase/notifications.ts` | Complete |
| Lalamove API client | `src/lib/lalamove/client.ts` | Complete, sandbox mode |
| API client | `src/lib/api-client.ts` | Complete, dual-environment |
| Search autocomplete | `src/components/search/SearchAutocomplete.tsx` | Complete, full-featured |

---

## Quality Gates

Every change must pass before commit:

- `npm run build` -- Zero errors
- `npm run lint` -- Zero warnings
- `npx jest --no-coverage` -- 376 suites, 7149 tests, zero failures
- TypeScript -- No type errors (`npx tsc --noEmit`)

---

## Notes

- All 27 PRD stories are complete with `passes: true`
- Payment is COD-only by design -- PayMongo infrastructure is ready when needed
- Lalamove is on sandbox -- production guide available at `.github/LALAMOVE_PRODUCTION_GUIDE.md`
- Follow RALPH methodology for any future autonomous implementation
- Never use emojis in commits, notifications, or documentation
- Run full quality gates before every commit
- Test both guest and authenticated user flows for every feature
