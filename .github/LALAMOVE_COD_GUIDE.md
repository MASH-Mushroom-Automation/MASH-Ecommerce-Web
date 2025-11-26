# 💰 Lalamove Cash on Delivery (COD) - Complete Guide

**Last Updated:** November 26, 2025  
**Status:** ✅ Implemented in test script  
**Tested:** Pending production test

---

## 📋 Table of Contents

1. [What is COD?](#what-is-cod)
2. [How COD Works](#how-cod-works)
3. [COD Configuration](#cod-configuration)
4. [Test Script Usage](#test-script-usage)
5. [API Implementation](#api-implementation)
6. [Frontend Integration](#frontend-integration)
7. [Settlement & Payout](#settlement--payout)
8. [Error Handling](#error-handling)
9. [Production Checklist](#production-checklist)

---

## 🎯 What is COD?

**Cash on Delivery (COD)** allows your customers to pay AFTER receiving their order. The Lalamove driver collects payment from the recipient and transfers it to you later.

### Key Benefits

- ✅ **Increases Sales** - Customers don't need credit card/GCash upfront
- ✅ **Reduces Risk** - Payment collected before driver leaves
- ✅ **Simple Process** - No online payment integration needed
- ✅ **Popular in PH** - Most Filipinos prefer COD

### Example Flow

```
1. Customer orders ₱500 worth of fresh mushrooms
2. You create Lalamove delivery with COD enabled
3. Driver picks up package from your store
4. Driver delivers to customer
5. Driver collects ₱500 cash from customer
6. Lalamove transfers ₱500 to your account (minus delivery fee)
```

---

## 🔄 How COD Works

### Step-by-Step Process

**STEP 1: Order Placement**
- Customer orders on your website
- Selects "Cash on Delivery" payment method
- You receive order notification

**STEP 2: Create Lalamove Delivery**
- Include COD amount in API request
- Lalamove notifies driver to collect cash
- Driver sees COD amount in their app

**STEP 3: Pickup**
- Driver arrives at your store (Paulo's location)
- You give package to driver
- Driver confirms pickup

**STEP 4: Delivery**
- Driver delivers to customer (Mary Jane's location)
- Driver collects ₱500 cash from customer
- Customer signs proof of delivery (POD)
- Driver confirms delivery in app

**STEP 5: Settlement**
- Lalamove deducts delivery fee from COD amount
- Remaining amount transferred to your bank account
- Settlement happens weekly (every Monday)

### Money Flow Example

```
Customer pays:        ₱500 (to driver)
Delivery fee:         - ₱64 (Lalamove charges you)
--------------------------------------------------
You receive:          ₱436 (net profit)

Settlement date:      Next Monday
Transfer method:      Bank transfer
```

---

## ⚙️ COD Configuration

### Environment Variables

Add to `.env.local`:

```env
# Cash on Delivery (COD) Configuration
LALAMOVE_COD_ENABLED=true              # Enable/disable COD globally
LALAMOVE_COD_MIN_AMOUNT=100            # Minimum COD amount (₱100)
LALAMOVE_COD_MAX_AMOUNT=10000          # Maximum COD amount (₱10,000)
LALAMOVE_COD_SETTLEMENT_DAY=MONDAY     # Weekly settlement day
```

### Test Script Configuration

```powershell
# Enable COD for test delivery
set LALAMOVE_COD_AMOUNT=500

# Enable order placement
set ENABLE_ORDER_TEST=true

# Run test
node scripts/test-lalamove-delivery.js
```

### Expected Output

```
💰 CASH ON DELIVERY ENABLED!
   Amount to collect: ₱500

📦 Order Details:
   Quotation ID: 3372666667334578492
   Delivery Fee: ₱64
   COD Amount: ₱500
   Net to You: ₱436

📍 Pickup: Paulo tongco (+63 932 767 7205)
📍 Dropoff: Mary Jane Bahay (+63 927 253 3969)

⚠️  DRIVER WILL COLLECT ₱500 FROM MARY JANE
```

---

## 🧪 Test Script Usage

### Test 1: Without COD (Default)

```powershell
# No COD - Driver doesn't collect payment
set ENABLE_ORDER_TEST=true
node scripts/test-lalamove-delivery.js
```

**Output:**
```
💳 NO COD - Driver will NOT collect payment
```

### Test 2: With COD (₱500)

```powershell
# Enable COD - Driver collects ₱500
set LALAMOVE_COD_AMOUNT=500
set ENABLE_ORDER_TEST=true
node scripts/test-lalamove-delivery.js
```

**Output:**
```
💰 CASH ON DELIVERY ENABLED!
   Amount to collect: ₱500
```

### Test 3: With COD (₱1,000)

```powershell
# Test larger amount
set LALAMOVE_COD_AMOUNT=1000
set ENABLE_ORDER_TEST=true
node scripts/test-lalamove-delivery.js
```

---

## 🔌 API Implementation

### 1. Order Placement with COD

**Endpoint:** `POST /v3/orders`

**Request Body:**

```json
{
  "data": {
    "quotationId": "3372666667334578492",
    "sender": {
      "stopId": "stop_0",
      "name": "Paulo tongco",
      "phone": "+639327677205"
    },
    "recipients": [
      {
        "stopId": "stop_1",
        "name": "Mary Jane Bahay",
        "phone": "+639272533969",
        "remarks": "936 Llano rd. Tapat ng INFINITY WASH",
        "payment": {
          "method": "CASH",
          "amount": "500"
        }
      }
    ],
    "isPODEnabled": true
  }
}
```

**Key Fields:**
- `payment.method` - Must be `"CASH"` for COD
- `payment.amount` - Amount to collect (string, no decimals)
- `isPODEnabled` - Must be `true` to require signature

### 2. NestJS Backend Implementation

**File:** `src/lib/lalamove/client.ts`

```typescript
interface LalamoveCODOptions {
  enabled: boolean;
  amount: number;
  currency?: string;
}

async placeOrder(
  quotationId: string,
  sender: LalamoveSender,
  recipients: LalamoveRecipient[],
  cod?: LalamoveCODOptions
) {
  const body = {
    data: {
      quotationId,
      sender,
      recipients: recipients.map(recipient => ({
        ...recipient,
        // Add COD if enabled
        ...(cod?.enabled && {
          payment: {
            method: 'CASH',
            amount: cod.amount.toString()
          }
        })
      })),
      isPODEnabled: true
    }
  };

  return this.makeRequest('POST', '/v3/orders', body);
}
```

### 3. Frontend Checkout Integration

**File:** `src/app/(shop)/checkout/page.tsx`

```tsx
'use client';

import { useState } from 'react';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderTotal, setOrderTotal] = useState(500);

  async function handleCheckout() {
    // Create Lalamove delivery with COD
    const response = await fetch('/api/lalamove/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quotationId: '...',
        sender: { /* ... */ },
        recipients: [{
          name: 'Mary Jane Bahay',
          phone: '+639272533969',
          address: '936 Llano rd, Caloocan',
          payment: paymentMethod === 'COD' ? {
            method: 'CASH',
            amount: orderTotal.toString()
          } : undefined
        }]
      })
    });

    if (response.ok) {
      alert('Order placed! Driver will collect ₱' + orderTotal);
    }
  }

  return (
    <div>
      <h1>Checkout</h1>
      
      {/* Payment Method Selection */}
      <label>
        <input
          type="radio"
          value="COD"
          checked={paymentMethod === 'COD'}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        Cash on Delivery (₱{orderTotal})
      </label>

      <label>
        <input
          type="radio"
          value="ONLINE"
          checked={paymentMethod === 'ONLINE'}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        Pay Online (GCash, Card)
      </label>

      {/* COD Warning */}
      {paymentMethod === 'COD' && (
        <div className="bg-yellow-50 p-4 mt-4">
          ⚠️ Driver will collect ₱{orderTotal} cash from you upon delivery.
          Please prepare exact change.
        </div>
      )}

      <button onClick={handleCheckout}>
        Place Order
      </button>
    </div>
  );
}
```

---

## 💸 Settlement & Payout

### Settlement Schedule

**Lalamove PH Settlement:**
- Frequency: Weekly (every Monday)
- Cutoff: Sunday 11:59 PM
- Transfer: Bank transfer (2-3 business days)

**Example:**
```
Orders Nov 18-24: Settlement on Nov 25 (Monday)
Expected transfer: Nov 27-28 (Wed-Thu)
```

### Settlement Report

**View in Lalamove Business Portal:**
1. Go to: https://business.lalamove.com/reports
2. Select "COD Settlements"
3. Filter by date range
4. Download CSV report

**Report includes:**
- Order ID
- Delivery date
- COD amount collected
- Delivery fee charged
- Net amount to you
- Settlement status

### Calculate Net Amount

```
Formula:
Net Amount = COD Amount - Delivery Fee - Service Fee

Example:
COD Amount:     ₱500
Delivery Fee:   ₱64
Service Fee:    ₱10 (2% of COD)
------------------------
Net Amount:     ₱426
```

**Service Fee Rates:**
- 0-1,000 PHP: 2% of COD amount
- 1,001-5,000 PHP: 1.5% of COD amount
- 5,001+ PHP: 1% of COD amount

---

## 🚨 Error Handling

### Common COD Errors

#### 1. ERR_INVALID_PAYMENT_AMOUNT

**Error:**
```json
{
  "errors": [{
    "code": "ERR_INVALID_PAYMENT_AMOUNT",
    "message": "Payment amount exceeds order limit"
  }]
}
```

**Cause:** COD amount > ₱10,000 (Lalamove limit)

**Fix:**
```typescript
// Validate before API call
if (codAmount > 10000) {
  throw new Error('COD amount cannot exceed ₱10,000');
}
```

#### 2. ERR_COD_NOT_SUPPORTED

**Error:**
```json
{
  "errors": [{
    "code": "ERR_COD_NOT_SUPPORTED",
    "message": "COD not available for this service type"
  }]
}
```

**Cause:** Some vehicle types don't support COD

**Fix:**
```typescript
// Only use MOTORCYCLE, SEDAN, MPV for COD
const validCODVehicles = ['MOTORCYCLE', 'SEDAN', 'MPV'];

if (cod.enabled && !validCODVehicles.includes(serviceType)) {
  throw new Error('COD only available for MOTORCYCLE, SEDAN, MPV');
}
```

#### 3. Customer Refuses to Pay

**Scenario:** Driver arrives, customer doesn't have cash

**Lalamove Policy:**
- Driver waits 10 minutes
- If still no payment, driver returns package to sender
- You're charged delivery fee + return fee (double)

**Prevention:**
```typescript
// Send SMS reminder before delivery
await sendSMS(recipient.phone, `
  Your MASH mushrooms are on the way!
  Driver will collect ₱${codAmount} cash.
  Please prepare exact change.
`);
```

---

## ✅ Production Checklist

### Before Enabling COD

**Business Setup:**
- [ ] Bank account registered with Lalamove
- [ ] COD enabled in Lalamove Business account
- [ ] Settlement schedule confirmed (weekly Mondays)
- [ ] Service fee rates understood (1-2%)

**Technical Setup:**
- [ ] COD environment variables configured
- [ ] API implementation tested in sandbox
- [ ] Error handling implemented
- [ ] Customer SMS notifications set up
- [ ] Settlement report tracking implemented

**Legal/Compliance:**
- [ ] Terms & conditions updated with COD policy
- [ ] Privacy policy includes driver cash collection
- [ ] Customer support trained on COD issues
- [ ] Refund policy defined for COD orders

### During Production Test

**Pre-Delivery:**
- [ ] COD amount shows correctly in order API
- [ ] Driver app shows COD collection required
- [ ] Customer received SMS with amount

**During Delivery:**
- [ ] Driver confirms COD amount with Mary Jane
- [ ] Mary Jane has exact ₱500 cash ready
- [ ] Driver collects cash and gives receipt
- [ ] POD (proof of delivery) signed

**Post-Delivery:**
- [ ] Order status updated to "COMPLETED"
- [ ] COD amount recorded in database
- [ ] Settlement report shows correct amount
- [ ] Net amount calculation verified

### After Production Test

**Validation:**
- [ ] Test order appears in settlement report
- [ ] Net amount calculated correctly
- [ ] Bank transfer received on settlement date
- [ ] No errors or issues reported

**Documentation:**
- [ ] Update `.github/PRODUCTION_TEST_PLAN.md` with COD results
- [ ] Record actual settlement timeline
- [ ] Document any issues encountered
- [ ] Share learnings with team

---

## 📊 Production Test Plan - COD Scenario

### Test Details

**Order Information:**
- Product: Fresh Oyster Mushrooms (500g)
- Price: ₱500
- Delivery Fee: ₱64
- Net to You: ₱436

**Delivery Route:**
- Pickup: Paulo tongco, 266 Quirino Hwy, Novaliches
- Dropoff: Mary Jane Bahay, Phone Craft Cellphone Repair, Caloocan
- Distance: ~4.5 km
- Vehicle: MOTORCYCLE

**Payment:**
- Method: Cash on Delivery (COD)
- Amount: ₱500
- Collected by: Lalamove driver from Mary Jane

### Execution Steps

**1. Configure COD (2 minutes):**
```powershell
set LALAMOVE_COD_AMOUNT=500
set ENABLE_ORDER_TEST=true
```

**2. Run Test Script (1 minute):**
```powershell
node scripts/test-lalamove-delivery.js
```

**3. Verify Quotation (1 minute):**
- Delivery fee: ₱64
- COD amount: ₱500
- Net amount: ₱436 ✅

**4. Place Order (30 seconds):**
- Type `y` when prompted
- Order placed with COD enabled

**5. Notify Mary Jane (2 minutes):**
```
Hi Mary Jane! Your mushrooms are on the way.

Driver will collect ₱500 cash from you.
Please prepare exact change.

Track delivery: [link]
```

**6. Driver Pickup (10 minutes):**
- Driver arrives at Paulo's store
- Paulo gives package to driver
- Driver confirms pickup in app

**7. Driver Delivery (25 minutes):**
- Driver travels to Phone Craft Cellphone Repair
- Driver calls Mary Jane when nearby
- Mary Jane meets driver outside

**8. COD Collection (5 minutes):**
- Driver says: "COD ₱500 please"
- Mary Jane pays ₱500 cash
- Driver gives receipt
- Mary Jane signs POD
- Driver confirms delivery in app

**9. Settlement (7 days):**
- Order completed: November 26
- Settlement date: December 2 (next Monday)
- Bank transfer: December 4-5
- Amount received: ₱436 ✅

### Success Criteria

**Immediate (Day 1):**
- ✅ Driver collected ₱500 from Mary Jane
- ✅ Order status: COMPLETED
- ✅ POD signed and uploaded
- ✅ No issues reported

**Week 1 (Day 7):**
- ✅ Order appears in settlement report
- ✅ COD amount: ₱500
- ✅ Delivery fee: ₱64
- ✅ Service fee: ₱10 (2%)
- ✅ Net amount: ₱426

**Week 2 (Day 10):**
- ✅ Bank transfer received
- ✅ Amount matches settlement report
- ✅ No discrepancies

---

## 🎯 Next Steps

### Phase 1: Test in Sandbox (1 hour)
- ✅ Configure test script with COD
- ✅ Run test and verify API response
- ✅ Confirm COD fields in order payload

### Phase 2: Production Test (1 day)
- ⏳ Run real delivery with ₱500 COD
- ⏳ Verify driver collects payment
- ⏳ Confirm POD signature

### Phase 3: Settlement Verification (7 days)
- ⏳ Wait for settlement date (next Monday)
- ⏳ Verify settlement report
- ⏳ Confirm bank transfer received

### Phase 4: Frontend Integration (3 hours)
- ⏳ Add COD option to checkout page
- ⏳ Display COD amount clearly
- ⏳ Send SMS notifications to customers
- ⏳ Track COD settlements in admin panel

### Phase 5: Production Launch (ongoing)
- ⏳ Enable COD for all customers
- ⏳ Monitor settlement reports weekly
- ⏳ Handle customer inquiries
- ⏳ Optimize COD flow based on data

---

## 📚 Related Documentation

- **Production Test Plan:** `.github/PRODUCTION_TEST_PLAN.md`
- **Quick Start Guide:** `RUN_PRODUCTION_TEST_NOW.md`
- **API Integration:** `.github/LALAMOVE_INTEGRATION_COMPLETE.md`
- **Postman Collection:** `.github/postman/MASH-Lalamove-PH.postman_collection.json`

---

## 💬 Support

**Questions?**
- Lalamove Support: +63 2 8234 5678
- Email: partner.support@lalamove.com
- Business Portal: https://business.lalamove.com

**Technical Issues?**
- See `.github/LALAMOVE_INTEGRATION_COMPLETE.md` troubleshooting
- Check Postman collection for API examples
- Review test script logs for errors

---

**✅ COD is ready to test!** Follow the Production Test Plan to run your first COD delivery. 🚀
