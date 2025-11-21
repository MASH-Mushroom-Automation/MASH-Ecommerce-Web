# 🔗 Webhook Configuration & Testing Guide

**Your Webhook URL**: `https://rylie-totable-unwifely.ngrok-free.dev/api/lalamove/webhook`  
**ngrok Dashboard**: http://127.0.0.1:4040  
**Status**: ⚠️ Handler Ready, URL Registration Pending

---

## 📋 Quick Setup (3 Steps)

### **Step 1: Verify ngrok is Running**

```bash
# Check if ngrok is running
curl http://127.0.0.1:4040/api/tunnels

# Expected response:
{
  "tunnels": [{
    "public_url": "https://rylie-totable-unwifely.ngrok-free.dev",
    "proto": "https",
    "config": {
      "addr": "http://localhost:3000"
    }
  }]
}
```

If ngrok is not running:
```bash
# Start ngrok
ngrok http 3000

# Copy the new HTTPS URL
# Example: https://abc-123-def.ngrok-free.dev
```

---

### **Step 2: Register Webhook URL**

**Option A: Via Lalamove Dashboard** (Recommended)

1. Go to: https://business.lalamove.com
2. Login with your account
3. Navigate to: **Developer** → **Webhooks**
4. Click **Add Webhook**
5. Enter URL: `https://rylie-totable-unwifely.ngrok-free.dev/api/lalamove/webhook`
6. Select environment: **Sandbox** (for testing)
7. Select events (check all):
   - ✅ ORDER_STATUS_CHANGED
   - ✅ DRIVER_ASSIGNED
   - ✅ DRIVER_LOCATION_UPDATED
   - ✅ DRIVER_ARRIVED_AT_PICKUP
   - ✅ DRIVER_PICKED_UP
   - ✅ DRIVER_ARRIVED_AT_DROPOFF
   - ✅ ORDER_COMPLETED
   - ✅ ORDER_CANCELLED
8. Click **Save**

**Option B: Via Postman** (Alternative)

Use the webhook setup request from your Postman collection:

```
POST https://rest.sandbox.lalamove.com/v3/webhooks
Headers:
  Authorization: Bearer <HMAC_SIGNATURE>
  Content-Type: application/json
  Market: PH

Body:
{
  "url": "https://rylie-totable-unwifely.ngrok-free.dev/api/lalamove/webhook",
  "events": [
    "ORDER_STATUS_CHANGED",
    "DRIVER_ASSIGNED",
    "DRIVER_LOCATION_UPDATED",
    "DRIVER_ARRIVED_AT_PICKUP",
    "DRIVER_PICKED_UP",
    "DRIVER_ARRIVED_AT_DROPOFF",
    "ORDER_COMPLETED",
    "ORDER_CANCELLED"
  ]
}
```

---

### **Step 3: Test Webhook Reception**

**Test Flow**:

1. **Open ngrok Dashboard**:
   - Visit: http://127.0.0.1:4040
   - Keep this tab open to monitor incoming requests

2. **Place Test Order**:
   - Visit: http://localhost:3000/lalamove-test
   - Click "Get Quotation" → Wait for ₱66 response
   - Click "Place Order" → Note the orderId

3. **Monitor Webhooks**:
   - Check ngrok dashboard for POST `/api/lalamove/webhook`
   - Click request to view full payload
   - Verify response: 200 OK

4. **Check Server Logs**:
   ```bash
   # In your terminal running npm run dev
   [Lalamove Webhook] Received event: DRIVER_ASSIGNING
   [Lalamove Webhook] Order ID: PH_LLPH2501230001
   [Lalamove Webhook] Status: ASSIGNING_DRIVER
   [Lalamove Webhook] Signature valid: true
   ```

---

## 🔍 Webhook Event Types

### **1. ORDER_STATUS_CHANGED**
**When**: Order status updates (every status change)  
**Payload**:
```json
{
  "event": "ORDER_STATUS_CHANGED",
  "orderId": "PH_LLPH2501230001",
  "status": "ON_GOING",
  "timestamp": "2025-11-22T10:30:00Z"
}
```
**Your Handler**: Updates order status in database

---

### **2. DRIVER_ASSIGNED**
**When**: Driver accepts the order  
**Payload**:
```json
{
  "event": "DRIVER_ASSIGNED",
  "orderId": "PH_LLPH2501230001",
  "driverId": "DRIVER_123",
  "driver": {
    "name": "Juan Dela Cruz",
    "phone": "+639171234567",
    "plateNumber": "ABC 1234",
    "vehicleType": "MOTORCYCLE"
  },
  "timestamp": "2025-11-22T10:32:00Z"
}
```
**Your Handler**: 
- Updates order with driver info
- Triggers notification to customer
- Enables "Track Delivery" button

---

### **3. DRIVER_LOCATION_UPDATED**
**When**: Driver's GPS location changes (every 30 seconds)  
**Payload**:
```json
{
  "event": "DRIVER_LOCATION_UPDATED",
  "orderId": "PH_LLPH2501230001",
  "driverId": "DRIVER_123",
  "location": {
    "lat": 14.7251,
    "lng": 121.0401
  },
  "timestamp": "2025-11-22T10:35:00Z"
}
```
**Your Handler**: 
- Updates driver marker on tracking map
- Calculates ETA based on distance
- (Optional) Sends push notification to customer

---

### **4. DRIVER_ARRIVED_AT_PICKUP**
**When**: Driver arrives at your store  
**Payload**:
```json
{
  "event": "DRIVER_ARRIVED_AT_PICKUP",
  "orderId": "PH_LLPH2501230001",
  "driverId": "DRIVER_123",
  "timestamp": "2025-11-22T10:40:00Z"
}
```
**Your Handler**: 
- Notifies store staff to prepare order
- Updates timeline: "Driver at Pickup"
- Sends SMS: "Driver has arrived, please hand over package"

---

### **5. DRIVER_PICKED_UP**
**When**: Driver confirms package pickup  
**Payload**:
```json
{
  "event": "DRIVER_PICKED_UP",
  "orderId": "PH_LLPH2501230001",
  "driverId": "DRIVER_123",
  "timestamp": "2025-11-22T10:45:00Z"
}
```
**Your Handler**: 
- Updates timeline: "Picked Up"
- Notifies customer: "Driver is on the way to your location"
- Changes map route: Show driver → dropoff

---

### **6. DRIVER_ARRIVED_AT_DROPOFF**
**When**: Driver arrives at customer location  
**Payload**:
```json
{
  "event": "DRIVER_ARRIVED_AT_DROPOFF",
  "orderId": "PH_LLPH2501230001",
  "driverId": "DRIVER_123",
  "timestamp": "2025-11-22T11:05:00Z"
}
```
**Your Handler**: 
- Notifies customer: "Driver has arrived!"
- Updates timeline: "Almost Delivered"
- (Optional) Sends SMS to customer phone

---

### **7. ORDER_COMPLETED**
**When**: Delivery confirmed successful  
**Payload**:
```json
{
  "event": "ORDER_COMPLETED",
  "orderId": "PH_LLPH2501230001",
  "driverId": "DRIVER_123",
  "completedAt": "2025-11-22T11:10:00Z",
  "timestamp": "2025-11-22T11:10:00Z"
}
```
**Your Handler**: 
- Updates order status: DELIVERED
- Updates timeline: "Delivered" (green checkmark)
- Sends confirmation: "Your order has been delivered!"
- Stops polling on tracking page
- (Optional) Request customer review

---

### **8. ORDER_CANCELLED**
**When**: Order is canceled by driver or system  
**Payload**:
```json
{
  "event": "ORDER_CANCELLED",
  "orderId": "PH_LLPH2501230001",
  "reason": "No driver available",
  "cancelledAt": "2025-11-22T10:35:00Z",
  "timestamp": "2025-11-22T10:35:00Z"
}
```
**Your Handler**: 
- Updates order status: CANCELLED
- Shows red "Order Canceled" banner
- Notifies customer with reason
- Offers refund or alternative delivery

---

## 🧪 Testing Checklist

### **Pre-Test Setup**
- [ ] ngrok running and accessible
- [ ] Webhook URL registered in Lalamove dashboard
- [ ] Dev server running: `npm run dev`
- [ ] ngrok dashboard open: http://127.0.0.1:4040

### **Basic Webhook Test**
- [ ] Place test order
- [ ] See webhook in ngrok dashboard (200 OK)
- [ ] Check server logs for event processing
- [ ] Verify signature validation passes

### **Event Sequence Test** (Sandbox)
- [ ] ORDER_STATUS_CHANGED → ASSIGNING_DRIVER
- [ ] DRIVER_ASSIGNED → Driver info logged
- [ ] DRIVER_LOCATION_UPDATED → GPS coordinates logged
- [ ] ORDER_COMPLETED → Order marked delivered

### **Error Handling Test**
- [ ] Invalid signature → 401 Unauthorized
- [ ] Missing event type → 400 Bad Request
- [ ] Server error → 500 logged, retry expected

---

## 🐛 Troubleshooting

### **Webhook Not Received**

**Check 1**: Verify ngrok is running
```bash
curl http://127.0.0.1:4040/api/tunnels
```

**Check 2**: Test webhook manually
```bash
curl -X POST https://rylie-totable-unwifely.ngrok-free.dev/api/lalamove/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"TEST","orderId":"test123"}'

# Expected: 200 OK
```

**Check 3**: Check Lalamove webhook logs
- Dashboard → Webhooks → View Logs
- Look for failed deliveries (4xx/5xx errors)

---

### **401 Unauthorized (Signature Failed)**

**Cause**: HMAC signature verification failed

**Fix**:
1. Check LALAMOVE_API_SECRET in `.env.local`
2. Verify signature calculation in `src/app/api/lalamove/webhook/route.ts`
3. Test signature locally:
   ```typescript
   const expectedSignature = crypto
     .createHmac('sha256', process.env.LALAMOVE_API_SECRET!)
     .update(JSON.stringify(body))
     .digest('hex');
   ```

---

### **Webhook Received but Not Processed**

**Check Server Logs**:
```bash
# Look for errors in terminal
[Lalamove Webhook] Error: Cannot read property 'orderId' of undefined
```

**Common Issues**:
- Missing required fields in payload
- Database connection failed
- Notification service error

**Fix**: Add more error logging in webhook handler

---

## 📊 Webhook Statistics

After testing, check ngrok dashboard for:

- **Total Requests**: Number of webhooks received
- **Success Rate**: 200 OK vs 4xx/5xx errors
- **Response Time**: Should be < 500ms
- **Event Distribution**: Which events fired most

**Expected in Sandbox**:
- DRIVER_ASSIGNED: ~1-2 minutes after order
- DRIVER_LOCATION_UPDATED: Every 30 seconds
- ORDER_COMPLETED: ~5-10 minutes after order

---

## 🚀 Production Webhook URL

**When Deploying to Vercel**:

1. Deploy app to Vercel: `vercel --prod`
2. Note deployed URL: `https://mash-ecommerce.vercel.app`
3. Update webhook in Lalamove dashboard:
   ```
   https://mash-ecommerce.vercel.app/api/lalamove/webhook
   ```
4. Switch environment to **Production**
5. Test with small order first

**Vercel Function Limits**:
- Max execution: 10 seconds (Hobby plan)
- Max payload: 4.5 MB
- Concurrent: 10 executions

---

## 📝 Webhook Handler Code

Your webhook handler is ready at:
```typescript
// src/app/api/lalamove/webhook/route.ts

export async function POST(request: NextRequest) {
  // 1. Parse request body
  const body = await request.json();
  
  // 2. Verify HMAC signature (security)
  const signature = request.headers.get('X-Lalamove-Signature');
  const isValid = verifySignature(signature, body);
  if (!isValid) return 401;
  
  // 3. Extract event data
  const { event, orderId, driverId, status, location } = body;
  
  // 4. Handle event type
  switch (event) {
    case 'DRIVER_ASSIGNED':
      // Update order with driver info
      await updateOrderDriver(orderId, driverId);
      break;
      
    case 'DRIVER_LOCATION_UPDATED':
      // Update driver marker on map
      await updateDriverLocation(orderId, location);
      break;
      
    case 'ORDER_COMPLETED':
      // Mark order as delivered
      await completeOrder(orderId);
      break;
      
    // ... other events
  }
  
  // 5. Return 200 OK (acknowledge receipt)
  return NextResponse.json({ success: true });
}
```

---

## ✅ Success Criteria

**Webhooks Working When**:
- ✅ ngrok dashboard shows 200 OK for POST /api/lalamove/webhook
- ✅ Server logs show "Webhook received: DRIVER_ASSIGNED"
- ✅ Signature validation passes
- ✅ Order status updates in database
- ✅ Tracking page refreshes automatically
- ✅ Customer receives notifications

**Ready for Production When**:
- ✅ All 8 event types tested in sandbox
- ✅ Error handling tested (invalid signature, missing fields)
- ✅ Webhook URL deployed to Vercel
- ✅ Production webhook configured in Lalamove dashboard
- ✅ End-to-end test with real delivery successful

---

**Last Updated**: November 22, 2025  
**Next Step**: Configure webhook URL → Test event flow → Verify database updates
