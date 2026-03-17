# Payment System Guide

> Technical guide for MASH E-Commerce payment integration with PayMongo.

---

## Overview

MASH uses **PayMongo** as the payment gateway for the Philippines market. The system supports five payment methods:

| Method | Type | Provider |
|--------|------|----------|
| **COD** | Cash on Delivery | Internal (always available) |
| **GCash** | E-Wallet | PayMongo |
| **GrabPay** | E-Wallet | PayMongo |
| **Credit/Debit Card** | Card | PayMongo |
| **PayMaya** | E-Wallet | PayMongo |

When PayMongo is not configured (keys missing), the system automatically falls back to **COD-only mode** with no errors.

---

## Environment Variables

### Required for Online Payments

```env
# Server-side only - NEVER expose to client
PAYMONGO_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Client-safe public key
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

### Optional

```env
# Application base URL (defaults to https://www.mashmarket.app)
NEXT_PUBLIC_APP_URL=https://www.mashmarket.app
```

### Feature Flag Behavior

The `PAYMONGO_ENABLED` flag is derived automatically:

| Secret Key | Public Key | PAYMONGO_ENABLED | Available Methods |
|------------|------------|------------------|-------------------|
| Missing | Missing | `false` | COD only |
| Set | Missing | `false` | COD only |
| Missing | Set | `false` | COD only |
| Set | Set | `true` | All 5 methods |

Both keys must be present for online payment methods to activate.

---

## Architecture

### File Locations

| File | Purpose |
|------|---------|
| `src/lib/payment/config.ts` | Centralized configuration, env validation, feature flags |
| `src/lib/payment/paymongo.ts` | PayMongo API service (create payments, verify webhooks) |
| `src/lib/payment/index.ts` | Barrel exports for entire payment module |
| `src/types/payment.ts` | TypeScript types, Zod schemas, payment method definitions |
| `src/contexts/PaymentContext.tsx` | React context for client-side payment state |

### Configuration Flow

```
App Startup
    |
    v
config.ts reads env vars
    |
    v
PAYMONGO_ENABLED flag computed
    |
    +--> true:  All 5 payment methods available
    |
    +--> false: COD-only mode (graceful fallback)
    |
    v
validatePaymentConfig() reports warnings
    |
    v
logPaymentConfigWarnings() outputs diagnostics
```

---

## Usage

### Check if PayMongo is enabled

```typescript
import { PAYMONGO_ENABLED } from "@/lib/payment";

if (PAYMONGO_ENABLED) {
  // Show online payment options
} else {
  // Show COD only
}
```

### Get available payment methods

```typescript
import { getAvailablePaymentMethods } from "@/lib/payment";

const methods = getAvailablePaymentMethods();
// With PayMongo: ["cod", "gcash", "grab_pay", "card", "paymaya"]
// Without:       ["cod"]
```

### Check a specific method

```typescript
import { isPaymentMethodAvailable } from "@/lib/payment";

if (isPaymentMethodAvailable("gcash")) {
  // GCash option is available
}
```

### Validate configuration (startup/health check)

```typescript
import { validatePaymentConfig, logPaymentConfigWarnings } from "@/lib/payment";

// Structured validation result
const result = validatePaymentConfig();
// { isValid: true, paymongoEnabled: false, warnings: [...], availableMethods: ["cod"] }

// Console output for diagnostics
logPaymentConfigWarnings();
// [Payment Config] Configuration warnings:
//   - PAYMONGO_SECRET_KEY is not set. Online payment methods are disabled.
//   - NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY is not set. Online payment methods are disabled.
// [Payment Config] Falling back to COD-only mode. Available methods: cod
```

### Get full config object

```typescript
import { getPaymentConfig } from "@/lib/payment";

const config = getPaymentConfig();
// config.paymongo.enabled    → boolean
// config.paymongo.apiUrl     → "https://api.paymongo.com/v1"
// config.currency            → "PHP"
// config.minimumAmount       → 1 (PHP)
// config.app.successRedirect("order-123") → "https://www.mashmarket.app/checkout/payment-success?orderId=order-123"
// config.app.failedRedirect("order-123")  → "https://www.mashmarket.app/checkout/payment-failed?orderId=order-123"
```

---

## COD-Only Fallback

When PayMongo keys are not configured:

1. `PAYMONGO_ENABLED` = `false`
2. `getAvailablePaymentMethods()` returns `["cod"]`
3. Online payment UI elements should be hidden
4. Checkout proceeds directly to COD order creation
5. No errors are thrown -- this is a valid operating mode

This ensures the application works in development environments without PayMongo credentials.

---

## PayMongo API Integration

### API Base URL

```
https://api.paymongo.com/v1
```

### Authentication

PayMongo uses HTTP Basic Auth with the secret key:

```
Authorization: Basic base64(PAYMONGO_SECRET_KEY:)
```

Note the trailing colon -- the password field is empty.

### Payment Flows

**E-Wallet (GCash, GrabPay, PayMaya):**
1. Create a Source via PayMongo API
2. Redirect user to authorization URL
3. User authorizes payment on provider site
4. PayMongo redirects to success/failed URL
5. Webhook confirms payment status

**Card Payments:**
1. Create a PaymentIntent
2. Collect card details via PayMongo.js (client-side)
3. Create a PaymentMethod
4. Attach PaymentMethod to PaymentIntent
5. Handle 3DS authentication if required
6. Webhook confirms payment status

---

## Redirect URLs

Payment redirect URLs are built from `APP_BASE_URL`:

| Redirect | URL Pattern |
|----------|-------------|
| Success | `{APP_BASE_URL}/checkout/payment-success?orderId={orderId}` |
| Failed | `{APP_BASE_URL}/checkout/payment-failed?orderId={orderId}` |

---

## Troubleshooting

### PayMongo not working in development

Ensure both env vars are set in `.env`:
```env
PAYMONGO_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_...
```

### Only COD showing in checkout

Run `logPaymentConfigWarnings()` to see which key is missing. Both keys are required.

### Payment redirect going to wrong URL

Check `NEXT_PUBLIC_APP_URL` -- defaults to `https://www.mashmarket.app` if not set. For local development, set it to `http://localhost:3000`.

### Webhook signature verification failing

Ensure `PAYMONGO_WEBHOOK_SECRET` is set and matches the webhook configuration in the PayMongo dashboard.
