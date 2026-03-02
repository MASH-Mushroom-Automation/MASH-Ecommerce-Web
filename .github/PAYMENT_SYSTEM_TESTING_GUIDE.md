# Payment System - Manual Testing Guide

> **Branch:** `feature/payment-system-full-capability`
> **Last Verified:** March 2, 2026 -- Build PASS, 302 suites, 7226 tests

This guide walks you through testing every payment flow in the MASH e-commerce platform. Follow it step by step.

---

## Table of Contents

1. [Prerequisites & Setup](#1-prerequisites--setup)
2. [Testing COD-Only Mode (No PayMongo Keys)](#2-testing-cod-only-mode-no-paymongo-keys)
3. [Setting Up PayMongo Test Mode](#3-setting-up-paymongo-test-mode)
4. [Testing GCash Payment](#4-testing-gcash-payment)
5. [Testing GrabPay Payment](#5-testing-grabpay-payment)
6. [Testing Card Payment](#6-testing-card-payment)
7. [Testing PayMaya Payment](#7-testing-paymaya-payment)
8. [Testing Payment Failure & Retry](#8-testing-payment-failure--retry)
9. [Testing the Webhook](#9-testing-the-webhook)
10. [Testing Responsive UI](#10-testing-responsive-ui)
11. [Running Automated Tests](#11-running-automated-tests)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites & Setup

### Install Dependencies
```bash
cd MASH-Ecommerce
npm install
```

### Build First (Mandatory)
```bash
npm run build
```
If the build fails, fix all errors before proceeding. The payment system cannot be tested with build errors.

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Required State
- Have at least **1 product** in your cart (add from `/shop`)
- Be **logged in** (Google or email) -- required for checkout
- Have a **delivery address** or select pickup

---

## 2. Testing COD-Only Mode (No PayMongo Keys)

This is the default mode when PayMongo keys are not configured.

### What to Verify
1. Go to `/checkout` with items in cart
2. Complete Step 1 (Delivery) and Step 2 (Contact)
3. On Step 3 (Payment):
   - **Only "Cash on Delivery"** should appear as a payment option
   - No GCash, GrabPay, Card, or PayMaya options
4. Click "Place Order"
5. **Expected:** Success modal appears immediately
   - Shows order number
   - "View My Orders" button works
   - "Continue Shopping" button works
6. Cart should be empty after order
7. Check `/profile/order-history` -- order should appear with status "Pending" and payment method "COD"

### Verify in Console
Open browser DevTools > Console. You should see:
```
[Payment Config] PAYMONGO_SECRET_KEY is not set. Online payment methods are disabled.
[Payment Config] Falling back to COD-only mode. Available methods: cod
```

### Pass Criteria
- [x] Only COD shown in Step 3
- [x] Order created successfully
- [x] Success modal with order number
- [x] Cart cleared
- [x] Order visible in order history
- [x] Confirmation email received (check your email)

---

## 3. Setting Up PayMongo Test Mode

To test online payments (GCash, GrabPay, Card, PayMaya), you need PayMongo test keys.

### Step 1: Get Test Keys
1. Go to [https://dashboard.paymongo.com](https://dashboard.paymongo.com)
2. Sign up / Log in
3. Go to **Developers** > **API Keys**
4. You will see:
   - **Test Secret Key:** `sk_test_xxxxxxxxxxxxxx`
   - **Test Public Key:** `pk_test_xxxxxxxxxxxxxx`

### Step 2: Add to `.env`
Add these lines to your `.env` file:
```env
# PayMongo Test Keys
PAYMONGO_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE

# App URL (for redirect callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Set Up Webhook (Optional but Recommended)
For full end-to-end testing with webhooks:

1. Install ngrok: `npm install -g ngrok`
2. Start ngrok: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. In PayMongo Dashboard > **Developers** > **Webhooks**:
   - Click "Create Webhook"
   - URL: `https://abc123.ngrok.io/api/payment/webhook`
   - Events: Select ALL events
   - Copy the **webhook signing secret**
5. Add to `.env`:
```env
PAYMONGO_WEBHOOK_SECRET=whsk_YOUR_WEBHOOK_SECRET_HERE
```
6. Update the app URL:
```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### Step 4: Restart Dev Server
```bash
# Kill existing server (Ctrl+C) then:
npm run dev
```

### Verify Setup
Open browser console. You should now see:
```
[Payment Config] PayMongo enabled. Available methods: cod, gcash, grab_pay, card, paymaya
```

---

## 4. Testing GCash Payment

### Steps
1. Add items to cart, go to `/checkout`
2. Complete Step 1 (Delivery) and Step 2 (Contact)
3. On Step 3:
   - Select **"GCash"** from payment methods
   - You should see an info box saying "You will be redirected to GCash..."
   - Button should say "Pay with GCash"
4. Click "Pay with GCash"
5. **Expected:**
   - Payment Processing Overlay appears (green animated circle)
   - Progress messages cycle through
   - After a few seconds, you are **redirected to a PayMongo test page**
6. On the PayMongo test page:
   - You will see options to simulate success or failure
   - Click **"Authorize"** to simulate successful payment
7. You will be redirected back to `/checkout/payment-success?orderId=XXX`
8. **Expected on success page:**
   - Green checkmark animation
   - "Payment Verified!" heading
   - Order number displayed
   - Order details (items, amount, delivery method)
   - "View My Orders" and "Continue Shopping" buttons

### Pass Criteria
- [x] GCash option visible in Step 3
- [x] Info box with redirect notice
- [x] Processing overlay appears
- [x] Redirect to PayMongo test page works
- [x] Successful authorization redirects to success page
- [x] Order appears in order history with payment status "Paid"
- [x] Cart is cleared

---

## 5. Testing GrabPay Payment

### Steps
Same as GCash, but select **"GrabPay"** in Step 3.

1. Select "GrabPay" -> info box says "You will be redirected to GrabPay..."
2. Button says "Pay with GrabPay"
3. Click -> Processing overlay -> redirect to PayMongo test page
4. Authorize -> redirect to success page

### Pass Criteria
- [x] GrabPay option visible
- [x] Redirect flow works
- [x] Success page verifies payment
- [x] Order status updated to "Paid"

---

## 6. Testing Card Payment

### Steps
1. Add items to cart, go to `/checkout`
2. Complete Step 1 and Step 2
3. On Step 3:
   - Select **"Credit / Debit Card"**
   - You will see a card form preview (card number, expiry, CVC fields)
   - This is a preview only -- actual card entry happens on PayMongo's hosted page
   - Button says "Pay with Card"
4. Click "Pay with Card"
5. **Expected:**
   - Processing overlay appears
   - You are redirected to PayMongo's **Checkout Sessions page**
   - This is a hosted form where you enter card details securely
6. On the PayMongo page, use these **test card numbers:**

| Card Number | Brand | 3DS | Result |
|-------------|-------|-----|--------|
| `4343434343434345` | Visa | No 3DS | Success |
| `4120000000000007` | Visa | 3DS Required | Success (after 3DS) |
| `5555444444444457` | Mastercard | No 3DS | Success |
| `4120000000000015` | Visa | 3DS | Failure |

- Expiry: Any future date (e.g., `12/28`)
- CVC: Any 3 digits (e.g., `123`)
- Name: Any name

7. After entering card details and submitting:
   - If 3DS is required, you will see a 3DS simulation page -> click "Complete"
   - You will be redirected back to `/checkout/payment-success?orderId=XXX`

### Pass Criteria
- [x] Card option visible with form preview
- [x] Redirect to PayMongo hosted checkout
- [x] Test cards work (both 3DS and non-3DS)
- [x] Success page verifies payment
- [x] Order status updated to "Paid"

---

## 7. Testing PayMaya Payment

### Steps
Same as GCash/GrabPay, but select **"Maya"** in Step 3.

1. Select "Maya" -> info box says "You will be redirected to Maya..."
2. Button says "Pay with Maya"
3. Click -> Processing overlay -> redirect to PayMongo test page
4. Authorize -> redirect to success page

### Pass Criteria
- [x] PayMaya option visible
- [x] Redirect flow works
- [x] Success page verifies payment
- [x] Order status updated to "Paid"

---

## 8. Testing Payment Failure & Retry

### Scenario A: Decline Payment at Provider
1. Start any online payment flow (GCash, GrabPay, or Card)
2. On the PayMongo test page, click **"Cancel"** or **"Fail"**
3. You will be redirected to `/checkout/payment-failed?orderId=XXX`
4. **Expected on failed page:**
   - Red X icon
   - "Payment Failed" heading
   - Error reason displayed
   - **"Retry Payment"** button
   - Help section with FAQ
5. Click "Retry Payment"
6. You should be taken back to `/checkout?orderId=XXX` with Step 3 pre-selected
7. Select a payment method and try again

### Scenario B: Cancel During Processing
1. Start any online payment flow
2. When the Processing Overlay appears, click **"Cancel Payment"**
3. You should return to Step 3 with an error message
4. You can select a different payment method and retry

### Scenario C: Test with Failing Card
1. Select Card payment
2. On PayMongo checkout, use card `4120000000000015` (forced failure)
3. Verify you land on the failed page
4. Retry with a working card (`4343434343434345`)

### Pass Criteria
- [x] Failed page shows correctly after decline
- [x] Retry button takes you back to checkout
- [x] Can retry with a different payment method
- [x] Cancel during processing returns to Step 3
- [x] Second attempt works successfully

---

## 9. Testing the Webhook

> This requires ngrok setup from Section 3.

### Verify Webhook is Receiving Events
1. Start ngrok: `ngrok http 3000`
2. Watch the terminal where `npm run dev` is running
3. Complete a GCash payment (authorize on PayMongo test page)
4. In the dev server terminal, you should see:
```
[WEBHOOK][INFO] Processing event: evt_XXXXX (type: source.chargeable)
[WEBHOOK][INFO] Order ORD-XXXXX updated: payment_status=paid
[WEBHOOK][INFO] Confirmation email sent for order ORD-XXXXX
```

### Verify Without Webhook (Polling Fallback)
If you don't set up ngrok/webhooks:
1. The success page will poll `/api/payment/status` every 5 seconds
2. It checks with PayMongo directly if the payment completed
3. After up to 60 seconds, it will show the result
4. This is the fallback mechanism -- works without webhooks

### Testing Webhook Signature Verification
To verify that invalid webhooks are rejected:
```bash
# This should return 401 Unauthorized
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{"data":{"id":"test"}}'
```

---

## 10. Testing Responsive UI

Test the checkout flow at these screen widths:

### Mobile (320px)
1. Open DevTools > Toggle Device Toolbar
2. Set width to **320px**
3. Go through the entire checkout flow
4. Verify:
   - Payment method cards stack vertically
   - Buttons are full-width
   - Card form inputs are readable
   - Processing overlay fills screen
   - Touch targets are at least 44x44px

### Tablet (768px)
1. Set width to **768px**
2. Verify:
   - Two-column layout where appropriate
   - Payment method cards may go 2-per-row
   - Order summary is visible

### Desktop (1024px)
1. Set width to **1024px**
2. Verify:
   - Sidebar order summary visible
   - Payment methods in a grid
   - Card form has proper spacing

### Large Desktop (1440px)
1. Set width to **1440px**
2. Verify:
   - Content is centered and not stretched
   - Max-width containers work

### Pass Criteria
- [x] No horizontal scrolling at any width
- [x] All text readable at all sizes
- [x] All buttons clickable (adequate touch targets)
- [x] Forms usable on mobile
- [x] Overlay works on all sizes

---

## 11. Running Automated Tests

### Full Test Suite
```bash
npm run test
```
**Expected:** 302 suites, 7,226 tests, 0 failures

### Payment Tests Only
```bash
# All payment-related tests
npx jest --no-coverage --testPathPatterns=payment --forceExit

# Specific suites
npx jest --no-coverage --testPathPatterns=payment-routes --forceExit
npx jest --no-coverage --testPathPatterns=paymongo.test --forceExit
npx jest --no-coverage --testPathPatterns=CardPaymentForm --forceExit
npx jest --no-coverage --testPathPatterns=PaymentProcessingOverlay --forceExit
npx jest --no-coverage --testPathPatterns=payment-success --forceExit
npx jest --no-coverage --testPathPatterns=payment-failed --forceExit
```

### Build Check
```bash
npm run build
```
**Expected:** Zero errors, all pages generated

### Lint Check
```bash
npm run lint
```
**Expected:** Zero warnings

### Coverage Report (Payment Files)
```bash
npx jest --coverage --testPathPatterns=payment --forceExit
```

---

## 12. Troubleshooting

### "Only COD shows up" despite setting PayMongo keys
- **Cause:** Env vars not loaded
- **Fix:** Restart the dev server after editing `.env`. Verify `PAYMONGO_SECRET_KEY` and `NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY` are both set.
- **Check console** for `[Payment Config] PayMongo enabled` message

### "Payment processing failed" error after clicking Pay
- **Cause:** PayMongo API returned an error
- **Fix:** Check the browser console and terminal for the specific error
- **Common issues:**
  - Invalid secret key (expired or wrong environment)
  - Amount below minimum (1 PHP = 100 centavos)
  - Network connectivity issue

### Redirect goes to `https://www.mashmarket.app` instead of `localhost`
- **Cause:** `NEXT_PUBLIC_APP_URL` not set to localhost
- **Fix:** Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env`

### "Webhook signature verification failed"
- **Cause:** Wrong webhook secret or missing header
- **Fix:** Verify `PAYMONGO_WEBHOOK_SECRET` matches the secret from PayMongo dashboard
- **Note:** In test mode without webhook setup, the polling fallback handles verification

### Payment stuck on "Verifying payment..."
- **Cause:** Webhook hasn't fired and polling hasn't confirmed yet
- **Fix:** Wait up to 60 seconds. If using ngrok, verify it's running and the URL matches PayMongo webhook config.
- **Fallback:** The polling mechanism checks PayMongo directly every 5 seconds

### Cart not clearing after payment
- **Cause:** Success page verification didn't complete
- **Fix:** Cart clears only after payment is verified as "succeeded". Check if the success page shows "Payment Verified!" or if it's still "Verifying..."

### Tests failing after env changes
- **Cause:** Tests use their own mocked env via `.env.test`
- **Fix:** Tests don't require real PayMongo keys. Run `npm run test` without modifying `.env.test`

---

## Quick Reference: Test Checklist

Use this checklist to verify everything works:

### COD Flow
- [ ] Only COD visible when PayMongo keys are absent
- [ ] Order created immediately on "Place Order"
- [ ] Success modal appears with order number
- [ ] Cart cleared
- [ ] Order in history with status "Pending", method "COD"
- [ ] Confirmation email received

### Online Payment Flows (for each: GCash, GrabPay, Card, PayMaya)
- [ ] Payment method visible in Step 3
- [ ] Correct info box displayed
- [ ] Correct button label
- [ ] Processing overlay appears on click
- [ ] Redirect to PayMongo test page
- [ ] Authorize -> redirect to success page
- [ ] Success page shows "Payment Verified!"
- [ ] Order details displayed correctly
- [ ] Cart cleared
- [ ] Order in history with status "Paid"

### Error & Recovery
- [ ] Cancel at provider -> failed page
- [ ] Retry button -> back to checkout Step 3
- [ ] Can pay with different method on retry
- [ ] Cancel during processing -> returns to Step 3

### Responsive
- [ ] 320px works (mobile)
- [ ] 768px works (tablet)
- [ ] 1024px works (desktop)
- [ ] 1440px works (large desktop)

### Automated
- [ ] `npm run build` -- zero errors
- [ ] `npm run lint` -- zero warnings
- [ ] `npm run test` -- 302 suites, 7226 tests, 0 failures
