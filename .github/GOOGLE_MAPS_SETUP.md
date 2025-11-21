# 🗺️ Google Maps Setup Instructions

## Overview

The TrackingMap component requires Google Maps JavaScript API to display the delivery route and driver location in real-time.

---

## Step 1: Install Google Maps Types

```bash
npm install --save-dev @types/google.maps
```

This will resolve the TypeScript errors like:
- `Cannot find namespace 'google'`
- `Property 'google' does not exist on type 'Window'`

---

## Step 2: Get Google Maps API Key

### **Option A: Create New Project**

1. Go to: https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Enter project name: "MASH E-Commerce"
4. Click **Create**

### **Option B: Use Existing Project**

1. Go to: https://console.cloud.google.com
2. Select your existing project from dropdown

---

## Step 3: Enable Maps JavaScript API

1. In Google Cloud Console, go to: **APIs & Services** → **Library**
2. Search for: "Maps JavaScript API"
3. Click on **Maps JavaScript API**
4. Click **Enable** button
5. Wait for activation (usually instant)

---

## Step 4: Create API Key

1. Go to: **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API key**
3. Copy the generated API key (starts with `AIzaSy...`)
4. Don't close the dialog yet!

---

## Step 5: Restrict API Key (Important for Security)

### **Application Restrictions**:

1. In the API key dialog, click **Edit API key**
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Click **Add an item**
4. Add these URLs:
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   https://mash-ecommerce.vercel.app/*
   https://*.vercel.app/*
   ```
5. Click **Done**

### **API Restrictions**:

1. Under **API restrictions**, select **Restrict key**
2. Check only these APIs:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API (optional, for address validation)
   - ✅ Places API (optional, for address autocomplete)
3. Click **Save**

---

## Step 6: Add API Key to .env.local

```bash
# In your project root
# Open .env.local and add:

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Important**:
- Use `NEXT_PUBLIC_` prefix (required for client-side access)
- Replace `AIzaSyXXX...` with your actual API key
- Never commit `.env.local` to Git (already in `.gitignore`)

---

## Step 7: Restart Dev Server

```bash
# Stop current dev server (Ctrl+C)
# Start again
npm run dev
```

The tracking map should now load at:
```
http://localhost:3000/orders/[orderId]/track
```

---

## Testing Google Maps

### **Test 1: Load Map**

1. Visit: http://localhost:3000/lalamove-test
2. Click "Place Order"
3. Copy orderId from response
4. Visit: `http://localhost:3000/orders/{orderId}/track`
5. Map should load with:
   - ✅ Green marker (A) - Pickup location
   - ✅ Red marker (B) - Dropoff location
   - ✅ Blue route line connecting them
   - ✅ Map legend (bottom left)

### **Test 2: Check Console**

Open browser console (F12):
- ❌ **Error**: "Google Maps JavaScript API error: InvalidKeyMapError"
  → API key is invalid or not properly configured
- ❌ **Error**: "Google Maps JavaScript API error: RefererNotAllowedMapError"
  → Your domain is not authorized (check API restrictions)
- ✅ **Success**: No errors, map loads smoothly

### **Test 3: Driver Marker** (After Driver Assigned)

When driver is assigned (in sandbox after ~1-2 minutes):
- ✅ Blue arrow marker appears (driver location)
- ✅ Marker bounces to indicate active driver
- ✅ Click marker → Shows "Driver Location" info window
- ✅ Map auto-pans to driver location

---

## Troubleshooting

### **Error: "Google Maps JavaScript API error: InvalidKeyMapError"**

**Cause**: API key is incorrect or not enabled

**Fix**:
1. Double-check API key in `.env.local`
2. Verify Maps JavaScript API is enabled
3. Wait 5 minutes for API activation
4. Restart dev server

---

### **Error: "RefererNotAllowedMapError"**

**Cause**: Your domain is not in the allowed list

**Fix**:
1. Go to: Cloud Console → Credentials
2. Click on your API key
3. Under **Application restrictions**, add:
   ```
   http://localhost:3000/*
   ```
4. Click **Save**
5. Wait 5 minutes for propagation
6. Reload page

---

### **Map Shows "For development purposes only" Watermark**

**Cause**: No billing account linked (common for free tier)

**Impact**: Map still works, but shows watermark

**Fix** (Optional):
1. Go to: Cloud Console → Billing
2. Link a billing account
3. You still get $200/month free credit (28,000 map loads)
4. Watermark disappears

**Cost Estimate**:
- Maps JavaScript API: $7 per 1,000 loads
- 10 orders/day = 300 loads/month = **$2.10/month**
- Well within $200 free tier = **$0 actual cost**

---

### **TypeScript Errors Still Show**

**If after installing `@types/google.maps` you still see errors**:

1. Restart VS Code TypeScript server:
   - Open command palette (Ctrl+Shift+P)
   - Type: "TypeScript: Restart TS Server"
   - Press Enter

2. Check `node_modules/@types/google.maps` exists:
   ```bash
   ls node_modules/@types/google.maps
   ```

3. If missing, reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm install --save-dev @types/google.maps
   ```

---

## Alternative: Use Google Maps API Loader Package

If direct script loading doesn't work, use `@googlemaps/js-api-loader`:

### **Install**:
```bash
npm install @googlemaps/js-api-loader
```

### **Update TrackingMap.tsx**:
```typescript
import { Loader } from '@googlemaps/js-api-loader';

// In useEffect (replace script loading):
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['geometry'],
});

loader.load().then(() => {
  createMap();
});
```

This provides better error handling and TypeScript support.

---

## Cost Management

### **Free Tier**:
- $200/month free credit (applies to first $200 of usage)
- Equals ~28,000 map loads per month
- Maps JavaScript API: $7 per 1,000 loads
- Geocoding API: $5 per 1,000 requests

### **Estimated Monthly Cost** (MASH E-Commerce):
```
Assumptions:
- 300 orders/month with same-day delivery
- Each order: 1 tracking page load
- Average session: 5 minutes (10 auto-refreshes)
- Total map loads: 300 × 10 = 3,000

Cost Calculation:
- Map loads: 3,000 × ($7 / 1,000) = $21
- Free credit: -$200
- Actual cost: $0 (well within free tier)
```

### **To Stay Within Free Tier**:
- ✅ Limit map loads per user (no aggressive polling)
- ✅ Cache geocoding results (don't geocode same address twice)
- ✅ Use session-based tracking (no page reload spam)
- ✅ Set reasonable refresh interval (30 seconds, not 5 seconds)

### **Set Budget Alerts**:
1. Go to: Cloud Console → Billing → Budgets & alerts
2. Click **Create Budget**
3. Set amount: $50 (quarter of free tier)
4. Set alerts at: 50%, 90%, 100%
5. Add your email for notifications

---

## Production Checklist

Before deploying to Vercel:

- [ ] API key has production domain restrictions:
  ```
  https://yourdomain.com/*
  https://*.vercel.app/*
  ```
- [ ] API key is NOT hardcoded in code (use env vars)
- [ ] `.env.local` is in `.gitignore`
- [ ] Vercel environment variables configured:
  ```
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = AIzaSy...
  ```
- [ ] Billing account linked (optional, but removes watermark)
- [ ] Budget alerts set ($50 threshold)

---

## Summary

**What You Need**:
1. ✅ Install `@types/google.maps` package
2. ✅ Create Google Cloud project
3. ✅ Enable Maps JavaScript API
4. ✅ Create & restrict API key
5. ✅ Add to `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
6. ✅ Restart dev server

**Time Required**: 10-15 minutes

**Cost**: $0/month (well within $200 free tier for your usage)

---

**Last Updated**: November 22, 2025  
**Next Step**: Install types → Get API key → Test tracking map
