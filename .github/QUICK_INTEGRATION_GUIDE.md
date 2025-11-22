# Quick Integration Guide - Priority Delivery & Chat

**Time Required**: 30-45 minutes  
**Prerequisites**: Phases 1-6 working, tracking page exists

---

## Step 1: Add Priority Delivery to Checkout (15 min)

### 1.1. Import Component
```typescript
// Edit: src/app/(shop)/checkout/page.tsx

import PriorityDelivery from '@/components/delivery/PriorityDelivery';
import { useState } from 'react';
```

### 1.2. Add State Variables
```typescript
// Inside your checkout component:

const [deliveryFee, setDeliveryFee] = useState(150); // Base fee from quotation
const [priorityFee, setPriorityFee] = useState(0);   // Priority fee
const totalWithPriority = deliveryFee + priorityFee;
```

### 1.3. Add Component After Delivery Address
```typescript
{/* After delivery address section, before order summary */}

{sameDayDelivery && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-4">Delivery Speed</h3>
    <PriorityDelivery
      currentTotal={deliveryFee}
      onPrioritySelected={(fee) => {
        setPriorityFee(fee);
        console.log(`Priority fee selected: ₱${fee}`);
      }}
    />
  </div>
)}
```

### 1.4. Update Order Total
```typescript
{/* In your order summary section */}

<div className="space-y-2">
  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>₱{subtotal.toFixed(2)}</span>
  </div>
  
  <div className="flex justify-between">
    <span>Delivery Fee</span>
    <span>₱{deliveryFee.toFixed(2)}</span>
  </div>
  
  {priorityFee > 0 && (
    <div className="flex justify-between text-orange-600">
      <span>Priority Delivery</span>
      <span>+₱{priorityFee.toFixed(2)}</span>
    </div>
  )}
  
  <div className="border-t pt-2 flex justify-between font-bold text-xl">
    <span>Total</span>
    <span>₱{(subtotal + totalWithPriority).toFixed(2)}</span>
  </div>
</div>
```

### 1.5. Include Priority Fee in Order
```typescript
// When placing order:

const orderData = {
  // ... other order fields
  deliveryFee: totalWithPriority, // Includes priority fee
  priorityFee: priorityFee,       // Store separately for tracking
  shippingMethod: 'lalamove',
};
```

---

## Step 2: Add Priority Delivery to Tracking Page (10 min)

### 2.1. Import Component
```typescript
// Edit: src/app/(shop)/tracking/[orderId]/page.tsx

import PriorityDelivery from '@/components/delivery/PriorityDelivery';
```

### 2.2. Check Order Status
```typescript
// Get order data:
const order = await getOrderDetails(orderId);
const hasDriver = order.driverDetails !== null;
```

### 2.3. Add Component Below Order Info
```typescript
{/* After order details, before tracking map */}

{!hasDriver && order.shippingMethod === 'lalamove' && (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-4">
      Upgrade Your Delivery Speed
    </h3>
    <PriorityDelivery
      orderId={orderId}
      currentTotal={order.deliveryFee}
      onPrioritySelected={(fee) => {
        console.log(`Priority added: ₱${fee}`);
        // Optionally refresh order data to show updated total
        window.location.reload();
      }}
      disabled={hasDriver} // Disable if driver already assigned
    />
  </div>
)}

{hasDriver && (
  <div className="mb-6 p-4 bg-green-50 rounded-lg">
    <p className="text-sm text-green-600">
      ✓ Driver assigned! Priority delivery is no longer available.
    </p>
  </div>
)}
```

---

## Step 3: Add Chat to Tracking Page (10 min)

### 3.1. Import Component
```typescript
// Edit: src/app/(shop)/tracking/[orderId]/page.tsx

import DeliveryChat from '@/components/delivery/DeliveryChat';
```

### 3.2. Get Driver Info
```typescript
// Get order data:
const order = await getOrderDetails(orderId);
const driverDetails = order.driverDetails; // From Lalamove webhook
```

### 3.3. Add Chat Component
```typescript
{/* After tracking map, before order timeline */}

<div className="mt-6">
  <DeliveryChat
    orderId={orderId}
    driverPhone={driverDetails?.driverPhone}
    driverName={driverDetails?.driverName}
    customerName={user?.firstName || 'You'}
  />
</div>
```

### 3.4. Alternative: Tab Layout
```typescript
// Use tabs to switch between Map and Chat:

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="map" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="map">Tracking Map</TabsTrigger>
    <TabsTrigger value="chat">Chat with Driver</TabsTrigger>
  </TabsList>
  
  <TabsContent value="map">
    {/* Your tracking map component */}
    <TrackingMap orderId={orderId} />
  </TabsContent>
  
  <TabsContent value="chat">
    <DeliveryChat
      orderId={orderId}
      driverPhone={driverDetails?.driverPhone}
      driverName={driverDetails?.driverName}
      customerName={user?.firstName || 'You'}
    />
  </TabsContent>
</Tabs>
```

---

## Step 4: Test Everything (10 min)

### 4.1. Test Priority Delivery in Sandbox
```powershell
# Start Next.js dev server:
npm run dev

# Visit checkout page:
# http://localhost:3000/checkout

# Verify:
# ✓ Priority options visible
# ✓ Price calculator updates
# ✓ Apply button works
# ✓ Order total includes priority fee
```

### 4.2. Test Chat (Simulation Mode)
```powershell
# Visit tracking page:
# http://localhost:3000/tracking/PH_TEST_001

# Verify:
# ✓ Chat component visible
# ✓ Quick reply buttons work
# ✓ Message input validates
# ✓ Character counter shows 160 limit

# Check terminal for SMS simulation:
# [Lalamove Chat] SMS SIMULATION (Twilio not configured)
# TO: +639171234567
# BODY: [MASH Order PH_TEST_001] Kenneth: Hello driver
```

### 4.3. Test API Endpoints
```powershell
# Test priority endpoint:
curl http://localhost:3000/api/lalamove/priority

# Expected: 3 priority options (Express, Priority, VIP)

# Test chat endpoint:
curl -X POST http://localhost:3000/api/lalamove/chat/send `
  -H "Content-Type: application/json" `
  -d '{"orderId":"TEST","message":"Hello","driverPhone":"+639171234567","customerName":"Test"}'

# Expected: Success with messageId and status
```

---

## Step 5: Production Deployment (5 min)

### 5.1. Verify Environment Variables
```env
# .env.local

# Lalamove (already configured)
LALAMOVE_API_KEY="pk_test_..."
LALAMOVE_API_SECRET="sk_test_..."
LALAMOVE_HOST="https://rest.sandbox.lalamove.com"

# Twilio (optional - for production SMS)
TWILIO_ACCOUNT_SID="ACxxxxxxxx"
TWILIO_AUTH_TOKEN="your_token"
TWILIO_PHONE_NUMBER="+639171234567"
```

### 5.2. Switch to Production
```env
# When ready for production:

# Change Lalamove to production:
LALAMOVE_HOST="https://rest.lalamove.com"
LALAMOVE_API_KEY="pk_prod_..."
LALAMOVE_API_SECRET="sk_prod_..."

# Enable Twilio:
# In src/app/api/lalamove/chat/send/route.ts
const USE_TWILIO = true; // Change from false
```

### 5.3. Deploy to Vercel
```powershell
# Commit changes:
git add .
git commit -m "Add Phase 7 (Priority Delivery) and Phase 8A (SMS Chat)"
git push origin main

# Vercel auto-deploys from main branch
# Add environment variables in Vercel dashboard
```

---

## Common Issues & Fixes

### Issue 1: Priority component not showing
**Cause**: `sameDayDelivery` flag not set  
**Fix**: Ensure product has `sameDayDeliveryEligible = true`

### Issue 2: Chat shows "No driver assigned"
**Cause**: `driverPhone` is undefined  
**Fix**: Wait for driver assignment webhook, or check order data

### Issue 3: SMS not sending
**Cause**: Twilio credentials not configured  
**Fix**: See `.github/CHAT_RESEARCH.md` for Twilio setup guide

### Issue 4: Priority fee not saving
**Cause**: API call failing  
**Fix**: Check browser console and terminal for errors

### Issue 5: Character limit not enforcing
**Cause**: `maxLength` prop missing  
**Fix**: Ensure `<Input maxLength={160} />` is set

---

## Next Actions

1. ✅ **Integrate components** (follow Steps 1-3 above)
2. ✅ **Test in sandbox** (Step 4)
3. ⏳ **Setup Twilio** (if you want production SMS)
4. ⏳ **Production test** (with real delivery today)
5. ⏳ **Monitor webhooks** (verify driver assignment)
6. ⏳ **Collect feedback** (from actual delivery)

---

## Support

**Files Created**:
- API: `src/app/api/lalamove/priority/route.ts`
- API: `src/app/api/lalamove/chat/send/route.ts`
- UI: `src/components/delivery/PriorityDelivery.tsx`
- UI: `src/components/delivery/DeliveryChat.tsx`

**Documentation**:
- Complete Guide: `.github/LALAMOVE_PHASES_7_8_COMPLETE.md`
- Chat Research: `.github/CHAT_RESEARCH.md`
- Integration: `.github/LALAMOVE_INTEGRATION_COMPLETE.md`

**Questions?**
- Check documentation above
- Review code comments in components
- Test in sandbox before production

---

*Last Updated: November 22, 2025*  
*Integration Time: 30-45 minutes*  
*Status: ✅ Ready for implementation*
