# Payment System - Pull Request Guide

> **Branch:** `feature/payment-system-full-capability`
> **Target:** `main`
> **Stories:** 20/20 complete (PAY-001 through PAY-020)
> **Status:** Ready for review and merge
> **Last Verified:** March 8, 2026

---

## Summary

This PR implements a complete payment system for the MASH e-commerce platform with PayMongo integration supporting GCash, GrabPay, Credit/Debit Cards, PayMaya, and Cash on Delivery (COD) as a fallback.

### Key Stats

| Metric | Value |
|--------|-------|
| Files changed | ~478 |
| New payment files | 48 (source + tests) |
| New payment code | ~15,900 lines |
| Test suites | 305 (all passing) |
| Total tests | 7,834 (0 failures) |
| Build | Zero errors |
| Lint | Zero warnings |

---

## What This PR Adds

### 1. Payment Type System (`src/types/payment.ts`)
- `PaymentMethod` union type: `'cod' | 'gcash' | 'grab_pay' | 'card' | 'paymaya'`
- Zod runtime schemas for server-side validation
- Constants: labels, descriptions, icons, status mappings
- Helper functions: `isRedirectMethod()`, `isCodMethod()`, `getPaymentMethodLabel()`

### 2. PayMongo Integration (`src/lib/payment/`)

| File | Purpose |
|------|---------|
| `paymongo.ts` | Core API service -- creates e-wallet sources (GCash, GrabPay, PayMaya), card checkout sessions, verifies webhooks, polls payment status |
| `config.ts` | Centralized config -- reads env vars, validates keys, falls back to COD-only when PayMongo keys are missing |
| `index.ts` | Barrel re-export |

**Payment Flows:**
- **E-Wallets (GCash, GrabPay, PayMaya):** Uses PayMongo Sources API -> user redirected to provider -> webhook confirms payment
- **Cards:** Uses PayMongo Checkout Sessions API -> user redirected to hosted checkout page with 3DS -> webhook confirms payment
- **COD:** Immediate order creation, no external API calls

### 3. Payment API Routes (`src/app/api/payment/`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/payment/create-intent` | POST | Creates PayMongo source/session for the selected payment method |
| `/api/payment/create-intent` | GET | Returns payment configuration status |
| `/api/payment/status` | GET | Polls payment status with Zod query validation, rate-limit headers, 5-min timeout detection |
| `/api/payment/webhook` | POST | Receives PayMongo events, verifies signature, updates Firebase order status, sends confirmation email |

### 4. Checkout UI Components (`src/components/checkout/`)

| Component | Purpose |
|-----------|---------|
| `PaymentMethodSelector` | Radix radio-group with payment method cards |
| `PaymentMethodCard` | Individual payment method option with icon |
| `PaymentMethodInfoBox` | Contextual instructions per payment method |
| `CardPaymentForm` | Card input utilities (brand detection, Luhn validation) -- kept as utility, not rendered in checkout |
| `PaymentProcessingOverlay` | Full-screen overlay during payment with progress messages |
| `PaymentLogo` | Optimized SVG logos for each payment provider |
| `CheckoutStep3Payment` | Complete Step 3 integrating all payment components |
| `OrderSummary` | Enhanced order summary showing payment method |

### 5. Payment Pages

| Page | Purpose |
|------|---------|
| `checkout/page.tsx` | 3-step checkout wizard with payment flow orchestration |
| `checkout/payment-success/page.tsx` | Post-payment verification with polling, animated success UI |
| `checkout/payment-failed/page.tsx` | Error display with retry button, help FAQ section |

### 6. Order History Enhancement
- Payment status badges (Paid, Pending, Failed, Refunded) in order history
- Payment method display with provider logos
- Amount formatting in PHP

### 7. Payment Processing UX
- Payment processing overlay with animated states
- Progress messages that change over time
- Timeout detection (auto-shows help after 5 minutes)
- Cancel and retry actions

---

## Architecture Decisions

### 1. Redirect-Based Flow for All Payment Methods
All online payment methods (e-wallets AND cards) use the same redirect flow:
1. Frontend creates order in Firebase
2. Frontend calls `/api/payment/create-intent` to get a `checkoutUrl`
3. Frontend redirects user to external payment page
4. After payment, user returns to `/checkout/payment-success?orderId=X`
5. Success page polls `/api/payment/status` until payment resolves

**Rationale:** Keeps the frontend simple -- one flow for all methods. No need for client-side PayMongo SDK integration. Naturally handles 3DS for cards.

### 2. COD-Only Fallback
When PayMongo env vars (`PAYMONGO_SECRET_KEY`, `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY`) are not set, the system automatically falls back to COD-only mode. No error, no crash -- just shows COD as the only option.

### 3. Webhook + Polling Dual Verification
- **Primary:** PayMongo webhook updates Firebase order status (server-to-server, reliable)
- **Secondary:** Client polls `/api/payment/status` every 5s for up to 60s (handles webhook delays)
- **Idempotency:** In-memory event deduplication with bounded Set (max 1000 events)

### 4. Session Storage for Redirect Persistence
Before redirecting to payment providers, the pending order details (orderId, amount, items, deliveryMethod) are saved to `sessionStorage`. If the user returns and the webhook hasn't fired yet, the success page can still display order details.

---

## Environment Variables Required

### For Online Payments (PayMongo)
```env
# Server-side only -- NEVER expose to client
PAYMONGO_SECRET_KEY=sk_test_A3VV6Jgfw7KaesYQzNUiYHW9

# Client-safe -- used for UI payment method detection
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_8Mf9jpeSkie98yeKXTYUQy5i

# Webhook signature verification (set after creating webhook in PayMongo dashboard)
PAYMONGO_WEBHOOK_SECRET=whsk_xxxxxxxxxxxxxx

# App URL for payment redirect callbacks
# Use http://localhost:3000 for development
# Use https://www.mashmarket.app for production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production (Railway)
```env
PAYMONGO_SECRET_KEY=sk_live_bYZjp5no1DBZdLG2K6Pxy5T6
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_live_EuugYfAKnb7xtvKjPbtGu5ir
PAYMONGO_WEBHOOK_SECRET=whsk_your_production_webhook_secret
NEXT_PUBLIC_APP_URL=https://www.mashmarket.app
```

### For COD-Only Mode
No additional env vars needed. The system defaults to COD when PayMongo keys are absent.

### Where to Get PayMongo Keys
1. Sign up at [https://dashboard.paymongo.com](https://dashboard.paymongo.com)
2. Go to **Developers** > **API Keys**
3. Copy the **Test** keys for development, **Live** keys for production
4. Set up a webhook endpoint at `https://www.mashmarket.app/api/payment/webhook`
5. Copy the webhook signing secret

---

## Test Coverage

### Payment-Specific Test Suites (15 files, 6,405 lines)

| Suite | Tests | Covers |
|-------|------:|--------|
| `payment-routes.test.ts` | 85 | All 3 API routes (create-intent, status, webhook) |
| `paymongo.test.ts` | 32 | PayMongo service functions |
| `config.test.ts` | 18 | Payment config, env validation |
| `payment.test.ts` | 24 | Types, Zod schemas, constants |
| `CheckoutStep3Payment.test.tsx` | 38 | Step 3 payment form |
| `PaymentProcessingOverlay.test.tsx` | 40 | Processing overlay states |
| `CardPaymentForm.test.tsx` | 45 | Card validation & masking |
| `PaymentMethodSelector.test.tsx` | 12 | Method selection |
| `PaymentMethodInfoBox.test.tsx` | 15 | Info display per method |
| `PaymentMethodCard.test.tsx` | 8 | Card component rendering |
| `PaymentLogo.test.tsx` | 12 | Logo rendering |
| `GrabPayFlow.test.tsx` | 24 | GrabPay integration flow |
| `PayMayaFlow.test.tsx` | 28 | PayMaya integration flow |
| `payment-success/page.test.tsx` | 55 | Success page + polling |
| `payment-failed/page.test.tsx` | 32 | Failed page + retry |

### Running Tests
```bash
# All payment tests
npx jest --no-coverage --testPathPatterns=payment --forceExit

# Full suite (302 suites)
npm run test

# Specific test file
npx jest --no-coverage --testPathPatterns=payment-routes --forceExit

# With coverage
npx jest --coverage --testPathPatterns=payment --forceExit
```

---

## Quality Gates (All Passing)

| Gate | Command | Status |
|------|---------|--------|
| Build | `npm run build` | PASS (zero errors) |
| Lint | `npm run lint` | PASS (zero warnings) |
| Tests | `npm run test` | PASS (305 suites, 7,834 tests) |
| TypeScript | Compiled via build | PASS |

---

## Commit History (20 Stories)

| Story | Title | Commits |
|-------|-------|---------|
| PAY-001 | Payment Schema & Type System Foundation | `a6588fe5`, `e6630adc` |
| PAY-002 | PayMongo Environment Configuration & Validation | `fc842092`, `c1242359` |
| PAY-003 | Payment Method Selection UI Component | `f85ca334`, `ac3ec9be` |
| PAY-004 | GCash Payment Flow - Frontend Integration | `53d208b9`, `f4688983` |
| PAY-005 | GrabPay Payment Flow - Frontend Integration | `dd1b73b9`, `57b5b7b6` |
| PAY-006 | Credit/Debit Card Payment UI | `b0296858`, `1b21454c` |
| PAY-007 | PayMaya Payment Flow - Frontend Integration | `7cde79d1` |
| PAY-008 | Checkout Step 3 - Payment Integration Rewrite | `43a29bf7` |
| PAY-009 | Payment API Route - Create Payment Intent/Source | `f09937e6` |
| PAY-010 | Payment Status Polling & Verification API | `125c8d43` |
| PAY-011 | Webhook Handler - Enhanced Event Processing | `d1ca584e` |
| PAY-012 | Checkout Flow - Payment Processing Integration | `13820238`, `25cdb969` |
| PAY-013 | Payment Success Page - Enhanced Verification | `041039a6`, `d4e38a96` |
| PAY-014 | Payment Failed Page - Retry & Recovery | `ea84179e`, `2f45d3e7` |
| PAY-015 | Order Summary - Payment Details Display | `0fad92dd`, `625dcc7a` |
| PAY-016 | Order History - Payment Status Display | `67062c98`, `63e6b150` |
| PAY-017 | Payment Processing Overlay with Loading States | `443543f9`, `b6f644f8` |
| PAY-018 | Payment Logos and Brand Assets | `c2bf6e8a`, `9cd1f325` |
| PAY-019 | Unit Tests - Payment Components & API Routes | `7584a990`, `612b6d3b` |
| PAY-020 | End-to-End Integration & Polish | `04d5dc25`, `fb52e533` |

---

## How to Review

### Quick Review Path
1. Start with `src/types/payment.ts` -- understand the type system
2. Read `src/lib/payment/config.ts` -- understand COD fallback
3. Read `src/lib/payment/paymongo.ts` -- understand PayMongo API calls
4. Read `src/app/api/payment/create-intent/route.ts` -- understand the API layer
5. Read `src/app/(shop)/checkout/page.tsx` -- understand the checkout flow
6. Check `src/app/api/payment/webhook/route.ts` -- understand event processing

### Key Files to Focus On
- **Security:** `webhook/route.ts` (signature verification), `paymongo.ts` (API key handling)
- **Error Handling:** `payment-failed/page.tsx`, `PaymentProcessingOverlay.tsx`
- **Data Flow:** `checkout/page.tsx` (orchestrates everything)

### What NOT to Worry About
- The branch also includes commits from prior work (test coverage expansion, UI/UX improvements) that were already on the branch when payment work started
- `.test.ts` files can be skimmed -- they follow consistent patterns

---

## Deployment Notes

### Railway Production
1. Add PayMongo env vars to Railway dashboard:
   - `PAYMONGO_SECRET_KEY`
   - `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY`
   - `PAYMONGO_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL=https://www.mashmarket.app`
2. Set up PayMongo webhook: `https://www.mashmarket.app/api/payment/webhook`
3. Deploy -- will auto-build on push to main

### Rollback
If issues arise, remove the PayMongo env vars from Railway. The system will automatically revert to COD-only mode in production without any code changes.

---

## Known Limitations

1. **No refund flow yet** -- refunds require manual processing in PayMongo dashboard
2. **Card uses hosted checkout** -- card entry happens entirely on PayMongo's hosted page (Checkout Sessions API). The local CardPaymentForm was removed from the checkout flow to avoid confusing users who would enter card details twice.
3. **Webhook delivery depends on PayMongo** -- if their webhook fails, the client polling handles it (up to 60s)
4. **No partial payments** -- full order amount required
5. **Philippine Peso (PHP) only** -- hardcoded currency
