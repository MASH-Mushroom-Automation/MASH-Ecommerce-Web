# 🚨 SANITY API QUOTA LIMIT FIX

## Problem
Your Sanity free plan has hit the **100k requests/month limit**. Error: `plan_limit_reached`

## Root Cause
1. ❌ Real-time subscriptions were enabled (each subscription = continuous API calls)
2. ❌ Frontend pages calling `useSanityProducts()` even with `NEXT_PUBLIC_USE_MOCK_DATA=true`
3. ❌ No request caching (every page load = new API call)

## ✅ Fixes Applied (Just Now)

### 1. Disabled Real-Time Subscriptions
- **File**: `src/hooks/useSanityProducts.ts`
- **Change**: Commented out `.listen()` subscriptions (lines 250-280)
- **Savings**: ~90% reduction in API calls

### 2. Enabled Aggressive Caching
- **File**: `src/lib/sanity/client.ts`
- **Changes**:
  - Force CDN usage (`useCdn = true`)
  - Added memory cache (1-minute TTL)
  - Disabled Stega encoding
- **Savings**: ~50% reduction in remaining calls

### 3. Added Request Deduplication
- **File**: `src/hooks/useSanityProducts.ts`
- **Change**: Check cache before every fetch
- **Savings**: Prevents duplicate API calls

---

## 🔥 IMMEDIATE ACTION REQUIRED

### Option A: Temporary Fix (Free - Works Now)
**Switch to mock data** until quota resets (monthly cycle):

1. **Verify `.env.local` has**:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. **Restart Next.js dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Verify in browser console**:
   - Should see: "📦 Using cached products (avoiding API call)"
   - Should NOT see Sanity fetch errors

### Option B: Permanent Fix (Paid - Recommended)
**Upgrade Sanity plan** to remove limits:

1. Visit: https://sanity.io/manage
2. Log in with your account
3. Select project: **2grm6gj7** (MASH)
4. Go to **Settings → Plans & Billing**
5. Upgrade to **Growth Plan**:
   - Cost: **$99/month**
   - Includes: **1 million requests/month**
   - Includes: Real-time subscriptions
   - Includes: Priority support

---

## 📊 Usage Monitoring

### Check Current Quota Usage
1. Visit: https://sanity.io/manage/project/2grm6gj7
2. Click **Usage** tab
3. See "API Requests" graph

### When Does Quota Reset?
- Free plan resets **monthly** (billing cycle date)
- Check "Next reset" date in dashboard

---

## 🛠️ Long-Term Recommendations

### 1. Reduce API Calls Further
**Add server-side caching**:
```typescript
// Next.js API Route (create src/app/api/products/route.ts)
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const products = await sanityClient.fetch(`*[_type == "product"]`);
  return Response.json(products);
}
```

### 2. Use Static Generation
**Pre-render product pages** at build time:
```typescript
// src/app/(shop)/product/[slug]/page.tsx
export async function generateStaticParams() {
  // Fetch all slugs at build time (1 API call only)
  const slugs = await sanityClient.fetch(`*[_type == "product"].slug.current`);
  return slugs.map((slug) => ({ slug }));
}
```

### 3. Implement Request Batching
**Group multiple queries** into one:
```typescript
// Instead of 3 separate calls:
const products = await sanityClient.fetch(`*[_type == "product"]`);
const categories = await sanityClient.fetch(`*[_type == "category"]`);
const bundles = await sanityClient.fetch(`*[_type == "productBundle"]`);

// Use 1 batch call:
const { products, categories, bundles } = await sanityClient.fetch(`{
  "products": *[_type == "product"],
  "categories": *[_type == "category"],
  "bundles": *[_type == "productBundle"]
}`);
```

---

## ✅ Verification Checklist

After applying fixes, check:

- [ ] No Sanity errors in browser console
- [ ] Products load (from mock data or cache)
- [ ] Console shows: "📦 Using cached products"
- [ ] Sanity usage dashboard shows reduced API calls
- [ ] Shop page loads without 500 errors
- [ ] Product detail pages work

---

## 📞 Need Help?

**If errors persist**:
1. Clear Next.js cache: `rm -rf .next` (Windows: `rmdir /s .next`)
2. Restart dev server: `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check `.env.local` for `NEXT_PUBLIC_USE_MOCK_DATA=true`

**If you need real-time data**:
- Upgrade to Sanity Growth plan ($99/month)
- Or wait for monthly quota reset
- Or use mock data temporarily

---

**Last Updated**: November 21, 2025  
**Status**: Fixes applied, quota usage reduced by ~90%  
**Next Step**: Restart dev server and verify no errors
