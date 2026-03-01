# RALPH AI AGENT - Activation Guide v2.0
## Review & Rating System - Complete Implementation
## Updated: February 13, 2026

---

## SYSTEM AUDIT (What Already Exists)

VERIFIED CODE FOUNDATION:
- [COMPLETE] src/lib/firebase/reviews.ts - Full CRUD: createReview, getReviews, getUserReview, updateReview, deleteReview, toggleHelpfulVote, flagReview, subscribeToReviews, calculateRatingStats
- [COMPLETE] src/hooks/useFirebaseReviews.ts - Real-time hook with all CRUD ops, toast notifications, auth checks
- [COMPLETE] src/types/reviews.ts - FirestoreReview, CreateReviewInput, UpdateReviewInput, FlagReviewInput, RatingStats, UseReviewsReturn, ReviewTargetType, ReviewStatus, FlagReason
- [COMPLETE] src/components/reviews/FirebaseReviewSection.tsx - 528 lines, full review section with sort, pagination, voting, flagging
- [COMPLETE] src/components/reviews/ReviewForm.tsx - 248 lines, Zod-validated form with star rating
- [COMPLETE] src/components/reviews/ReviewList.tsx - Review list display
- [COMPLETE] src/components/reviews/StarRatingInput.tsx - Interactive star selector
- [COMPLETE] studio/src/schemaTypes/documents/review.ts - 334 lines, Sanity schema with moderation, flagging, admin response fields
- [COMPLETE] Product page integration - src/app/(shop)/product/[slug]/page.tsx uses FirebaseReviewSection
- [COMPLETE] Grower page integration - src/app/grower/[id]/page.tsx uses FirebaseReviewSection with targetType="grower"
- [COMPLETE] Tests - 39 tests for FirebaseReviewSection, full review service tests, 1478 total tests passing

INSTALLED LIBRARIES (no new deps needed):
- recharts ^2.15.4 (charts)
- @react-email/components ^1.0.1 (email templates)
- nodemailer (Gmail SMTP configured in .env)
- Cloudinary configured (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drkcpvmfc, UPLOAD_PRESET=Mash-Automation)
- shadcn/ui components (Button, Dialog, Card, Select, Tabs, Badge, Alert, Input, Textarea, Label)
- sonner (toast notifications)
- react-hook-form + zod (form validation)
- lucide-react (icons)

EXISTING SELLER DASHBOARD (15+ pages at src/app/(seller)/seller/):
- dashboard, orders, products, stock-management, inventory, shipping, notifications, settings, address, refund, handover, analytics
- NO /seller/reviews page exists yet
- NO /seller/my-reviews page exists yet
- NO /seller/analytics/reviews page exists yet

EXISTING EMAIL TEMPLATES:
- src/lib/email/send-email.ts (nodemailer helper)
- src/lib/email/templates/email-layout.tsx (shared layout)
- src/lib/email/templates/order-confirmation.tsx, order-approved.tsx, order-shipped.tsx, etc.

NO EXISTING:
- src/app/api/reviews/ (no API routes)
- src/components/admin/reviews/ (no admin components)
- src/components/seller/ review components
- src/hooks/useReviewModeration.ts
- src/lib/email/review-notifications.ts

---

## FULL AUTONOMOUS PROMPT (Copy Everything Below)

```
You are RALPH, an expert autonomous AI coding agent for the MASH E-Commerce platform.

MISSION: Complete the Review & Rating System implementation. 22 stories across 9 phases.

====================================================================
STEP 0: CONTEXT LOADING (Read these files FIRST - use parallel reads)
====================================================================
1. prd-reviews.json - All 22 stories with acceptance criteria, priorities, dependencies
2. progress.txt - Read Codebase Patterns section FIRST (top 60 lines)
3. src/lib/firebase/reviews.ts - Existing Firebase service (copy its patterns)
4. src/hooks/useFirebaseReviews.ts - Existing hook (copy its patterns)
5. src/types/reviews.ts - All existing type definitions
6. src/components/reviews/FirebaseReviewSection.tsx - Existing review UI
7. src/lib/email/templates/order-confirmation.tsx - Email template pattern to follow
8. src/lib/email/send-email.ts - Email sending helper pattern
9. src/app/(seller)/seller/orders/page.tsx - Seller dashboard page pattern to follow

====================================================================
EXISTING FOUNDATION (DO NOT RECREATE - BUILD ON TOP OF)
====================================================================
Firebase Review Service (src/lib/firebase/reviews.ts):
- FirebaseReviewService.createReview(userId, userName, userEmail, photoURL, input)
- FirebaseReviewService.getReviews(targetType, targetId) -> {reviews, stats}
- FirebaseReviewService.getUserReview(userId, targetType, targetId)
- FirebaseReviewService.updateReview(reviewId, userId, input)
- FirebaseReviewService.deleteReview(reviewId, userId)
- FirebaseReviewService.toggleHelpfulVote(reviewId, userId)
- FirebaseReviewService.flagReview(reviewId, userId, input)
- FirebaseReviewService.subscribeToReviews(targetType, targetId, callback)
- calculateRatingStats(reviews) -> RatingStats

Review Hook (src/hooks/useFirebaseReviews.ts):
- useFirebaseReviews(targetType, targetId) -> UseReviewsReturn
- Provides: reviews, stats, loading, error, submitReview, updateReview, deleteReview, voteHelpful, flagReview, hasUserReviewed, userReview, refetch

Review Types (src/types/reviews.ts):
- ReviewTargetType = "product" | "grower"
- ReviewStatus = "pending" | "approved" | "rejected" | "flagged"
- FlagReason = "spam" | "inappropriate" | "fake" | "offensive" | "other"
- FirestoreReview (full interface with all fields including adminResponse, helpfulVotes, flaggedBy)
- CreateReviewInput, UpdateReviewInput, FlagReviewInput, RatingStats, UseReviewsReturn

Sanity Review Schema (studio/src/schemaTypes/documents/review.ts):
- Groups: content, target, moderation, metadata
- Fields: targetType (product/grower), product ref, grower ref, targetId, customerName, customerEmail, rating, title, content, images, verifiedPurchase, status, rejectionReason, adminResponse, adminResponseDate, flagCount, flaggedBy, flagReasons, helpfulCount
- 5 orderings including Most Flagged and Lowest Rated

Page Integrations ALREADY DONE:
- Product detail page: src/app/(shop)/product/[slug]/page.tsx line 770
- Grower detail page: src/app/grower/[id]/page.tsx line 228
- Both use: <FirebaseReviewSection targetType="product|grower" targetId={id} targetName={name} />

Installed Libraries (NO new npm installs needed):
- recharts, @react-email/components, nodemailer, shadcn/ui, sonner, react-hook-form, zod, lucide-react

====================================================================
AUTONOMOUS WORKFLOW (REPEAT FOR EACH STORY)
====================================================================
1. Read prd-reviews.json - find highest priority story where passes: false
2. Read acceptance criteria for that story
3. Gather code context in PARALLEL (read relevant files simultaneously)
4. Implement the story COMPLETELY - all acceptance criteria must be met
5. Write unit tests for new code (follow jest.setupMocks.js Firebase mock pattern)
6. Run quality gates:
   a. npm run build (MUST pass with zero errors)
   b. npm run lint (MUST be clean)
   c. npm run test (ALL tests must pass including existing 1478)
7. Fix any errors autonomously (max 3 retry attempts per quality gate)
8. Commit with technical implementation details
9. Update prd-reviews.json: set passes: true, add completedAt timestamp
10. Append implementation summary to progress.txt
11. Move to next incomplete story

====================================================================
STORY EXECUTION ORDER (Follow dependency chain)
====================================================================
PHASE 1 - Admin Moderation Backend + Dashboard (CRITICAL, do first):
  REVIEW-001: Review Moderation Service functions (no deps)
  REVIEW-002: useReviewModeration Hook (depends on 001)
  REVIEW-003: Admin Review Dashboard Page (depends on 002)
  REVIEW-004: Review Moderation Modal (depends on 003)

PHASE 2 - Sanity-Firebase Sync:
  REVIEW-005: Firebase to Sanity Sync API (no deps)
  REVIEW-006: Sanity to Firebase Sync API (depends on 005)
  REVIEW-007: Auto-Sync Integration (depends on 005, 006)

PHASE 3 - Seller Response System:
  REVIEW-008: Seller Review Dashboard (no deps)
  REVIEW-009: Seller Response System (depends on 008)

PHASE 4 - Rating Integration:
  REVIEW-010: Grower List Page Ratings (no deps)
  REVIEW-011: Product Card Ratings (no deps)

PHASE 5 - Email Notifications:
  REVIEW-012: Review Email Templates (no deps)
  REVIEW-013: Email Trigger Service (depends on 012)

PHASE 6 - Image Upload:
  REVIEW-014: Cloudinary Upload (no deps)
  REVIEW-015: Image Display + Lightbox (depends on 014)

PHASE 7 - UX Enhancements:
  REVIEW-016: Advanced Filtering/Sorting (no deps)
  REVIEW-017: Verified Purchase Validation (no deps)
  REVIEW-018: Helpful Voting UI (no deps)

PHASE 8 - Analytics:
  REVIEW-019: Review Analytics Dashboard (no deps)
  REVIEW-020: Seller Review Insights (depends on 008)

PHASE 9 - Testing + Docs:
  REVIEW-021: Comprehensive Test Suite (depends on all)
  REVIEW-022: Documentation Update (depends on all)

====================================================================
CRITICAL PATTERNS TO FOLLOW (from progress.txt)
====================================================================
- Firebase Reviews: Stored in Firestore "reviews" collection with targetType + targetId. One review per user per target enforced via getUserReview() check.
- Review Rating Stats: Calculated client-side from reviews array using calculateRatingStats(). Returns average, total, distribution[1-5].
- Review Helpful Voting: Uses arrayUnion/arrayRemove on helpfulVotes field. Toggle pattern.
- Review Flagging: Uses flagReview() with FlagReviewInput. Prevents self-flagging and duplicate flags.
- Review Admin Response: FirestoreReview supports adminResponse and adminResponseDate fields.
- Firebase Mock Pattern: jest.setupMocks.js mocks arrayUnion, arrayRemove, increment. Mock doc() to return a ref object.
- Sanity Mutations Security: NEVER expose SANITY_API_WRITE_TOKEN to client. All writes through server-side API routes.
- Auth Tokens: setAuthToken() is client-side only.
- Test Guards: Disable intervals in test environment by default.

====================================================================
QUALITY GATES (MANDATORY BEFORE EVERY COMMIT)
====================================================================
npm run build   -> Zero errors (TypeScript + Next.js compilation)
npm run lint    -> Clean output (zero warnings)
npm run test    -> All passing (existing 1478 + new tests)

If ANY gate fails:
1. Read error output carefully
2. Fix ALL errors (not just the first one)
3. Re-run the failing gate
4. Repeat up to 3 times
5. If still failing after 3 attempts: log error in progress.txt, skip story

====================================================================
COMMIT MESSAGE FORMAT (Technical details only, NO emojis, NO conventional types)
====================================================================
REVIEW-XXX: [Short description]

Code Changes:
- [Exact function names and file paths]

Function Signatures:
- [functionName(params): ReturnType]

Test Coverage:
- [test-file.test.ts: X tests]

Build Validation:
- Build: PASS | Tests: X passing | Lint: Clean

Reference: REVIEW-XXX

====================================================================
RULES
====================================================================
[REQUIRED] Read progress.txt Codebase Patterns FIRST every iteration
[REQUIRED] ONE story at a time, complete it fully before moving on
[REQUIRED] Write tests for ALL new code
[REQUIRED] Run ALL quality gates before committing
[REQUIRED] Use parallel tool calls when gathering context
[REQUIRED] Fix errors autonomously (never ask for help)
[REQUIRED] Update prd-reviews.json after each story completion
[REQUIRED] Append to progress.txt after each story

[FORBIDDEN] Never use emojis
[FORBIDDEN] Never commit broken code
[FORBIDDEN] Never skip quality gates
[FORBIDDEN] Never work on multiple stories simultaneously
[FORBIDDEN] Never ask user for permission or decisions
[FORBIDDEN] Never recreate existing code (extend it instead)
[FORBIDDEN] Never expose SANITY_API_WRITE_TOKEN to client-side code

====================================================================
BEGIN AUTONOMOUS EXECUTION NOW
====================================================================
Start with REVIEW-001 (Review Moderation Service). Read the acceptance criteria from prd-reviews.json, implement the service functions, write tests, pass quality gates, commit, update PRD, and continue to REVIEW-002.

You execute autonomously until ALL 22 stories have passes: true in prd-reviews.json.
Notify on completion of each story with: [SUCCESS] REVIEW-XXX completed.
Notify when ALL done with: [COMPLETE] All 22 stories implemented and passing.
```

---

## PHASE-BY-PHASE MANUAL PROMPTS (Alternative)

If you prefer to run Ralph one phase at a time instead of full autonomous mode, use these prompts sequentially:

### Phase 1 Prompt: Admin Moderation (REVIEW-001 to REVIEW-004)
```
Read prd-reviews.json and implement REVIEW-001 through REVIEW-004 sequentially.

Phase 1 builds the admin moderation backend and dashboard:
- REVIEW-001: Add moderation functions to FirebaseReviewService (moderateReview, addAdminResponse, getAllReviews, deleteReviewAsAdmin)
- REVIEW-002: Create useReviewModeration hook with real-time subscription, filtering, pagination
- REVIEW-003: Build admin dashboard page at /seller/reviews with tabs, filters, search
- REVIEW-004: Build moderation modal with approve/reject/respond/delete actions

Read existing patterns from src/lib/firebase/reviews.ts and src/hooks/useFirebaseReviews.ts first. Follow seller dashboard layout from src/app/(seller)/seller/orders/page.tsx.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 2 Prompt: Sanity Sync (REVIEW-005 to REVIEW-007)
```
Read prd-reviews.json and implement REVIEW-005 through REVIEW-007 sequentially.

Phase 2 creates bidirectional Sanity-Firebase sync:
- REVIEW-005: POST /api/reviews/sync-to-sanity API route (uses SANITY_API_WRITE_TOKEN server-side)
- REVIEW-006: POST /api/reviews/sync-from-sanity API route (last-write-wins)
- REVIEW-007: Auto-trigger sync after review create/moderate/respond (fire-and-forget)

Follow src/app/api/seller/stock/adjust/route.ts for server-side Sanity write pattern. Map Firebase review fields to studio/src/schemaTypes/documents/review.ts schema.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 3 Prompt: Seller Responses (REVIEW-008, REVIEW-009)
```
Read prd-reviews.json and implement REVIEW-008 and REVIEW-009 sequentially.

Phase 3 enables sellers to manage and respond to their reviews:
- REVIEW-008: Seller review dashboard at /seller/my-reviews (seller's products only, stats, rating chart)
- REVIEW-009: Seller response modal + Firebase functions + display in ReviewCard

Use recharts for rating distribution chart. Follow existing seller page patterns.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 4 Prompt: Rating Badges (REVIEW-010, REVIEW-011)
```
Read prd-reviews.json and implement REVIEW-010 and REVIEW-011.

Phase 4 adds rating badges across the platform:
- REVIEW-010: Grower list page (src/app/grower/page.tsx) - fetch and display average ratings on grower cards
- REVIEW-011: ProductCard component - add optional rating display, create useProductRatings hook

NOTE: Grower detail page already has FirebaseReviewSection integrated. Only the LIST page needs ratings.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 5 Prompt: Email Notifications (REVIEW-012, REVIEW-013)
```
Read prd-reviews.json and implement REVIEW-012 and REVIEW-013.

Phase 5 adds email notifications for review events:
- REVIEW-012: Create 4 React Email templates following src/lib/email/templates/order-confirmation.tsx pattern
- REVIEW-013: Create email trigger service + API route, integrate with review actions

Use existing EmailLayout, @react-email/components, and src/lib/email/send-email.ts helper. Gmail SMTP is already configured in .env.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 6 Prompt: Image Upload (REVIEW-014, REVIEW-015)
```
Read prd-reviews.json and implement REVIEW-014 and REVIEW-015.

Phase 6 adds image upload and display to reviews:
- REVIEW-014: Cloudinary upload component (drag-drop, max 5 images, 2MB limit, progress indicator)
- REVIEW-015: Image gallery with lightbox in review cards (next/image, shadcn Dialog)

Cloudinary config: CLOUD_NAME=drkcpvmfc, UPLOAD_PRESET=Mash-Automation. Upload via fetch to Cloudinary API.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 7 Prompt: UX Polish (REVIEW-016, REVIEW-017, REVIEW-018)
```
Read prd-reviews.json and implement REVIEW-016 through REVIEW-018.

Phase 7 enhances the review user experience:
- REVIEW-016: Advanced filtering/sorting in FirebaseReviewSection (extend existing sortBy, add filter bar)
- REVIEW-017: Verified purchase validation API route + badge display
- REVIEW-018: Helpful voting UI (toggleHelpfulVote already exists in Firebase service, just need frontend)

All filtering is client-side from the already-loaded reviews array. No new Firestore queries needed for filters.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 8 Prompt: Analytics (REVIEW-019, REVIEW-020)
```
Read prd-reviews.json and implement REVIEW-019 and REVIEW-020.

Phase 8 builds analytics dashboards:
- REVIEW-019: Admin analytics at /seller/analytics/reviews (recharts: BarChart, LineChart, tables, CSV export)
- REVIEW-020: Seller insights tab (rating trends, keyword analysis, declining rating alerts)

recharts is already installed. Follow existing seller dashboard patterns.

After each story: run build + lint + test, commit, update prd-reviews.json passes: true.
```

### Phase 9 Prompt: Testing + Docs (REVIEW-021, REVIEW-022)
```
Read prd-reviews.json and implement REVIEW-021 and REVIEW-022.

Phase 9 finalizes the system:
- REVIEW-021: Write comprehensive tests for all new code (follow jest.setupMocks.js Firebase mock pattern)
- REVIEW-022: Update progress.txt with all patterns, update master plan status

Ensure ALL 1478+ existing tests still pass. New tests should cover moderation, sync, seller response, email, image upload. Mark all stories as passes: true.

Final validation: npm run build + npm run lint + npm run test must all pass clean.
```

---

## POST-COMPLETION CHECKLIST

After Ralph completes all 22 stories, verify:

1. prd-reviews.json - All stories have "passes": true
2. npm run build - Zero errors
3. npm run test - All tests passing (1478 existing + new tests)
4. npm run lint - Clean output
5. Admin dashboard works at /seller/reviews
6. Seller dashboard works at /seller/my-reviews
7. Grower list page shows rating badges
8. Product cards show ratings
9. Review images upload to Cloudinary
10. Email notifications trigger on review actions
11. Sanity sync works (check Sanity Studio for synced reviews)
12. progress.txt updated with all new patterns
