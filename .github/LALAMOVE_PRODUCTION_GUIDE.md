# Lalamove Production Setup Guide

> Complete guide to transition from Lalamove Sandbox to Production for MASH E-Commerce delivery service.

---

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [Getting Production API Keys](#getting-production-api-keys)
3. [Environment Variable Configuration](#environment-variable-configuration)
4. [Railway Deployment Updates](#railway-deployment-updates)
5. [API Differences: Sandbox vs Production](#api-differences-sandbox-vs-production)
6. [Vehicle Types Available](#vehicle-types-available)
7. [Testing Checklist](#testing-checklist)
8. [HMAC Signature Troubleshooting](#hmac-signature-troubleshooting)
9. [Integration Flow](#integration-flow)

---

## Current Architecture

### Files

| File | Purpose |
|------|---------|
| `src/lib/lalamove/client.ts` | API client with HMAC SHA256 authentication |
| `src/lib/lalamove/vehicle-types.ts` | Vehicle types with Philippine pricing (7 types) |
| `src/lib/lalamove.ts` | Extended vehicle types with detailed per-km pricing (10 types) |
| `src/app/api/delivery/quote/route.ts` | API route: Get delivery quotation |
| `src/app/api/delivery/order/route.ts` | API route: Place delivery order |
| `src/app/api/delivery/[orderId]/route.ts` | API route: Get order status |
| `src/app/api/delivery/[orderId]/driver/route.ts` | API route: Get driver details |
| `src/app/(user)/profile/orders/[orderId]/track/page.tsx` | Consumer tracking page |
| `src/components/delivery/TrackingMap.tsx` | Google Maps tracking with markers |
| `src/components/delivery/StatusTimeline.tsx` | 4-stage delivery progress timeline |

### How It Works

1. **Quotation**: Checkout sends pickup/dropoff coordinates and vehicle type to `/api/delivery/quote`
2. **Order Placement**: After customer confirms, `/api/delivery/order` creates the Lalamove order
3. **Tracking**: Consumer views `/profile/orders/[orderId]/track` which polls Lalamove every 30 seconds
4. **Driver Info**: When assigned, driver name, phone, plate number, and live coordinates shown on map

### Authentication (HMAC SHA256)

The `LalamoveClient` generates signatures using:
```
rawSignature = timestamp + \r\n + method + \r\n + path + \r\n + \r\n + body
```

The `\r\n` (CRLF) line separators are CRITICAL -- using `\n` will cause signature validation failures.

---

## Getting Production API Keys

### Step 1: Create a Lalamove Business Account

1. Go to [https://www.lalamove.com/en-ph/business](https://www.lalamove.com/en-ph/business)
2. Click "Sign Up" or "Get Started"
3. Register with your business details:
   - Business name: MASH Market / PP Namias
   - Business registration number
   - Contact person details
   - Business address (must be in Philippines / Metro Manila)
4. Verify your email and phone number

### Step 2: Apply for API Access

1. Log in to your Lalamove Business Dashboard
2. Navigate to **Settings** > **API Integration** or contact Lalamove directly:
   - Email: `api-support@lalamove.com` or `business-ph@lalamove.com`
   - Subject: "API Access Request - MASH Market E-Commerce"
3. Provide in your request:
   - Business name and registration
   - Expected monthly delivery volume
   - Use case description: "E-commerce delivery for agricultural products in Metro Manila"
   - Sandbox API key (to prove you have tested): `pk_test_8611e4fa8a2f51f6664d26aded0e5d2b`
4. Lalamove will review and provision production credentials

### Step 3: Receive Production Credentials

Lalamove will provide:
- **Production API Key**: `pk_live_XXXXXXXXXXXXXXXX`
- **Production API Secret**: `sk_live_XXXXXXXXXXXXXXXX`
- **Production Host**: `https://rest.lalamove.com`
- **Market**: `PH` (Philippines)

### Timeline

- Sandbox approval: Immediate (self-service)
- Production approval: 3-7 business days after application
- Some cases may require a call with Lalamove's integration team

---

## Environment Variable Configuration

### Local Development (.env)

Current sandbox configuration (lines ~170-181 in .env):

```env
# LALAMOVE DELIVERY API
# Sandbox (Testing - no real deliveries)
LALAMOVE_API_KEY=pk_test_8611e4fa8a2f51f6664d26aded0e5d2b
LALAMOVE_API_SECRET=sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq
LALAMOVE_HOST=https://rest.sandbox.lalamove.com
LALAMOVE_MARKET=PH

# Production (uncomment when ready)
# LALAMOVE_API_KEY=pk_live_YOUR_PRODUCTION_KEY
# LALAMOVE_API_SECRET=sk_live_YOUR_PRODUCTION_SECRET
# LALAMOVE_HOST=https://rest.lalamove.com
```

### Switching to Production

1. Comment out sandbox variables
2. Uncomment and fill in production variables:

```env
# LALAMOVE DELIVERY API
# Sandbox (disabled)
# LALAMOVE_API_KEY=pk_test_8611e4fa8a2f51f6664d26aded0e5d2b
# LALAMOVE_API_SECRET=sk_test_KeCmtaJPeTEUwiP1N+upaT/2IH1Ckqqmd23db8+hVJnaysSpQVkRdbzIm2LlDztq
# LALAMOVE_HOST=https://rest.sandbox.lalamove.com

# Production (LIVE - real deliveries will be made)
LALAMOVE_API_KEY=pk_live_YOUR_PRODUCTION_KEY
LALAMOVE_API_SECRET=sk_live_YOUR_PRODUCTION_SECRET
LALAMOVE_HOST=https://rest.lalamove.com
LALAMOVE_MARKET=PH
```

**No code changes needed.** The `LalamoveClient` reads `LALAMOVE_HOST` from environment and defaults to sandbox if not set.

---

## Railway Deployment Updates

### Add Production Variables to Railway Dashboard

1. Go to Railway Dashboard > MASH E-Commerce service
2. Navigate to **Variables** tab
3. Add these environment variables:

| Variable | Value |
|----------|-------|
| `LALAMOVE_API_KEY` | `pk_live_YOUR_PRODUCTION_KEY` |
| `LALAMOVE_API_SECRET` | `sk_live_YOUR_PRODUCTION_SECRET` |
| `LALAMOVE_HOST` | `https://rest.lalamove.com` |
| `LALAMOVE_MARKET` | `PH` |

4. Click **Deploy** to trigger a redeploy with new variables

### Verify Deployment

After deploying, check the Railway logs for:
```
[Lalamove] Request: { method: 'POST', url: 'https://rest.lalamove.com/v3/quotations', market: 'PH', ... }
[Lalamove] Success: { status: 200, method: 'POST', hasData: true }
```

If you see `rest.sandbox.lalamove.com` in the URL, the environment variables were not picked up.

---

## API Differences: Sandbox vs Production

| Aspect | Sandbox | Production |
|--------|---------|------------|
| **Host** | `rest.sandbox.lalamove.com` | `rest.lalamove.com` |
| **API Key Prefix** | `pk_test_` | `pk_live_` |
| **Secret Prefix** | `sk_test_` | `sk_live_` |
| **Real Drivers** | No (simulated) | Yes (real drivers assigned) |
| **Real Charges** | No | Yes (charged to business account) |
| **Delivery Time** | Simulated (~instant) | Real-world (30min - 2hrs+) |
| **Driver Location** | Simulated coordinates | Real GPS tracking |
| **Webhooks** | Simulated callbacks | Real status updates |
| **API Endpoints** | Same paths (`/v3/*`) | Same paths (`/v3/*`) |
| **HMAC Auth** | Same algorithm | Same algorithm |
| **Rate Limits** | Relaxed | Standard (contact Lalamove for details) |

### Sandbox Behavior Notes

- Sandbox quotations return simulated prices (may differ from production)
- Orders transition through statuses automatically in sandbox
- Driver details use test data
- No real money is charged

### Production Behavior

- Quotations reflect real-time pricing with demand surcharges
- Orders require real driver acceptance
- Cancellation policies apply (fees may be charged)
- Payment handled through Lalamove business account (monthly billing or prepaid wallet)

---

## Vehicle Types Available

The following vehicle types are configured in `src/lib/lalamove/vehicle-types.ts`:

| Vehicle | Base Fare | Weight Limit | Size Limit | Best For |
|---------|-----------|-------------|------------|----------|
| Motorcycle | P49 | 20kg | 0.5x0.4x0.5m | Small items, documents |
| Sedan | P100 | 200kg | 1x0.6x0.7m | Medium packages |
| Subcompact SUV | P115 | 300kg | 1.2x1x0.9m | Larger items, furniture |
| 7-seater SUV | P200 | 600kg | 2.1x1.2x1.1m | Bulky items, moving |
| Pickup | P240 | 800kg | 2.7x1.5x0.5m | Heavy cargo |
| L300 / Cargo Van | P280 | 1,000kg | 2.1x1.2x1.2m | Commercial deliveries |
| FB Truck | P900 | 2,000kg | 3x1.7x1.7m | Large-scale deliveries |

### API Service Type Mapping

The Lalamove API `serviceType` parameter accepts:
- `MOTORCYCLE` - Maps to Motorcycle
- `CAR` - Maps to Sedan, SUV, Pickup
- `VAN` - Maps to L300 / Cargo Van
- `TRUCK` - Maps to FB Truck and larger

**Note:** The exact `serviceType` values accepted depend on the market (PH). Contact Lalamove for the complete list of service types in your market.

---

## Testing Checklist

### Before Going Live

- [ ] **Sandbox Tests Pass**: All Lalamove unit tests pass with sandbox credentials
- [ ] **Production Keys Received**: Have `pk_live_*` and `sk_live_*` credentials
- [ ] **HMAC Signature Works**: Test a GET request to `/v3/cities` with production credentials
- [ ] **Quotation Flow**: Successfully get a quotation with real Metro Manila coordinates
- [ ] **Order Placement**: Place a test order (coordinate with Lalamove support for test orders in production)
- [ ] **Tracking Page**: Verify `/profile/orders/[orderId]/track` loads with order data
- [ ] **Driver Details**: Confirm driver information displays when assigned
- [ ] **Cancel Flow**: Test order cancellation within allowed window
- [ ] **Error Handling**: Verify graceful error messages for API failures
- [ ] **Railway Variables**: All 4 Lalamove env vars set in Railway dashboard
- [ ] **Logs Working**: `[Lalamove]` log entries visible in Railway logs

### Test Coordinates (Metro Manila)

Use these for testing quotations:

```typescript
// Pickup: PP Namias Office / Warehouse
const pickup = {
  lat: "14.5995",
  lng: "120.9842",
  address: "Manila, Philippines"
};

// Dropoff: Example customer location (Makati)
const dropoff = {
  lat: "14.5547",
  lng: "121.0244",
  address: "Makati City, Philippines"
};
```

### Validate Production Connection

Run this in a Next.js API route or server component:

```typescript
import { getLalamoveClient } from '@/lib/lalamove/client';

try {
  const client = getLalamoveClient();
  const cities = await client.getCities();
  console.log('[Lalamove] Production connection OK. Cities:', cities);
} catch (error) {
  console.error('[Lalamove] Production connection FAILED:', error);
}
```

---

## HMAC Signature Troubleshooting

### Common Error: "ERR_INVALID_HMAC_SIGNATURE"

**Cause 1: Wrong line separators**
The raw signature MUST use `\r\n` (CRLF), not just `\n`.

```typescript
// CORRECT
const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${body}`;

// WRONG - will cause signature failure
const rawSignature = `${timestamp}\n${method}\n${path}\n\n${body}`;
```

**Cause 2: Body mismatch**
The body used for signature must be the EXACT same JSON string sent in the request.

```typescript
const bodyString = JSON.stringify(requestBody);
// Use bodyString for BOTH signature generation AND fetch body
```

**Cause 3: Timestamp drift**
Lalamove requires timestamps within a few minutes of server time. Ensure your server clock is synchronized.

**Cause 4: Wrong API key/secret pair**
Sandbox keys do NOT work with production host and vice versa. Verify the prefix matches:
- Sandbox: `pk_test_*` / `sk_test_*` with `rest.sandbox.lalamove.com`
- Production: `pk_live_*` / `sk_live_*` with `rest.lalamove.com`

### Common Error: "ERR_INVALID_MARKET"

Ensure the `Market` header matches your account region:
```typescript
headers: {
  'Market': 'PH',  // Philippines
}
```

### Common Error: "ERR_OUT_OF_SERVICE_AREA"

The pickup or dropoff coordinates are outside Lalamove's service area. For PH market, service is available in:
- Metro Manila (NCR)
- Cebu
- Pampanga
- Davao
- Other major cities (expanding)

### Common Error: "ERR_QUOTATION_EXPIRED"

Quotations expire after a set time (typically 5-10 minutes). If the customer takes too long to confirm, request a new quotation.

### Debugging Tips

1. Enable API logging: `NEXT_PUBLIC_ENABLE_API_LOGGING=true`
2. Check console for `[Lalamove]` prefixed logs
3. Compare your timestamp with current UTC time
4. Verify the path includes `/v3/` prefix
5. For GET requests, the body should be empty string `''` (not `undefined` or `null`)

---

## Integration Flow

### End-to-End Delivery Flow

```
Customer Checkout
     |
     v
1. Customer enters delivery address
     |
     v
2. Frontend calls /api/delivery/quote
   - Sends pickup (seller) + dropoff (customer) coordinates
   - Sends serviceType based on order weight/size
   - Returns: quotationId, price breakdown, estimated distance
     |
     v
3. Customer sees delivery fee and confirms order (COD)
     |
     v
4. Order saved to Firestore with status: pending_approval
     |
     v
5. Seller approves order in Admin Panel (zen.mashmarket.app)
     |
     v
6. Admin/system calls /api/delivery/order
   - Sends quotationId, sender (seller) details, recipient (customer) details
   - Lalamove assigns a driver
     |
     v
7. Customer tracks delivery at /profile/orders/[orderId]/track
   - Auto-polls every 30 seconds
   - Shows driver on map when assigned
   - StatusTimeline shows: ASSIGNING -> ON_GOING -> PICKED_UP -> COMPLETED
     |
     v
8. Driver picks up from seller, delivers to customer
     |
     v
9. Customer receives order, pays COD
     |
     v
10. Order marked COMPLETED
```

### Firestore Order Document

When Lalamove order is placed, update the Firestore order document:

```typescript
{
  orderId: "ORD-12345",
  status: "shipped",
  deliveryMethod: "delivery",
  lalamoveOrderId: "LLM-67890",       // From Lalamove API response
  lalamoveShareLink: "https://...",     // Tracking link from Lalamove
  deliveryFee: 85,                      // From quotation price breakdown
  vehicleType: "MOTORCYCLE",
  estimatedDelivery: "2026-02-20T16:00:00Z"
}
```

---

## Quick Reference

### Switch to Production (3 steps)

1. Get production keys from Lalamove business dashboard
2. Update `.env`:
   ```
   LALAMOVE_API_KEY=pk_live_YOUR_KEY
   LALAMOVE_API_SECRET=sk_live_YOUR_SECRET
   LALAMOVE_HOST=https://rest.lalamove.com
   ```
3. Add same variables to Railway dashboard and redeploy

### Code Changes Needed: NONE

The `LalamoveClient` class is already production-ready. It reads credentials from environment variables and works with both sandbox and production URLs without any code changes.
