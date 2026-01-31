# Product page redesign — 2026-01-27

Summary
- Removed these storefront sections for cleaner UX: Freshness & Quality, Cooking Guide, Delivery Options, Nutritional Highlights, Frequently Bought Together (bundles).
- Kept Product Tags visible (restyled chips).
- Added `GrowerCard` with seller contact, **Cal.com** external appointment link, Quick Chat integration, and embedded Google Maps iframe (when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` present).
- Implemented optimistic stock decrement + background queue (`stock-sync`) and ensured multi-tab sync.

Files changed
- src/app/(shop)/product/[slug]/page.tsx
- src/components/product/GrowerCard.tsx
- src/components/product/ProductDetailsSections.tsx
- src/components/product/MediaGallery.tsx
- src/hooks/useStockSync.ts
- src/lib/product/stock-sync.ts
- Unit & e2e tests (see `e2e/tests/`)

Test & Build Status (local)
- Jest: all unit tests passing
- Playwright: e2e suite passed locally (including product contact and details tests)
- Next build: `npm run build` succeeded

Notes for reviewers
- This is a non-destructive change for Sanity: schema fields are not deleted. See `.github/prs/feature-product-page-sanity-enhancement.pr.json` for recommended Sanity migration plan.
- Add the `docs/screenshots/product-page-before.png` and `docs/screenshots/product-page-after.png` images to this repo before creating the PR to include visual diffs in the PR description.

Upgrade / Rollback
- Revert the PR branch or set `NEXT_PUBLIC_PRODUCT_USE_NEW_DETAILS=false` to disable the new details UX if needed.

---
