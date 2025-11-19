# 🖼️ Sanity Image Fix - Complete Solution

**Date:** November 19, 2025 - 9:45 PM  
**Issue:** Products displaying but images showing placeholder error  
**Status:** ✅ FIXED - Image field names corrected

---

## 🐛 Problem Identified

### Error Message:
```
⨯ The requested resource isn't a valid image for /images/placeholder-product.jpg received null
GET /images/placeholder-product.jpg 404 in 363ms
```

### Root Cause:
**Field name mismatch** between Sanity schema and GROQ queries:

| What GROQ Was Looking For | What Sanity Schema Actually Has |
|---------------------------|----------------------------------|
| `mainImage` | `image` ✅ |
| `stock` | `quantity` ✅ |
| `isPromo` | `isOnPromo` ✅ |

---

## ✅ Fixes Applied

### Fix 1: Updated GROQ Queries in `useSanityProducts.ts`

**Changed in 3 places:**

1. **Main Products Hook (`useSanityProducts`)**
```typescript
// BEFORE (WRONG):
"mainImage": mainImage.asset->url
stock,
isPromo,

// AFTER (CORRECT):
"mainImage": image.asset->url
"stock": quantity,
"isPromo": isOnPromo,
```

2. **Single Product Hook (`useSanityProduct`)**
```typescript
// Same fix applied to single product fetch query
"mainImage": image.asset->url
"stock": quantity,
"isPromo": isOnPromo,
```

3. **Featured Products Hook (`useSanityFeaturedProducts`)**
```typescript
// Same fix applied to featured products query
"mainImage": image.asset->url
"stock": quantity,
"isPromo": isOnPromo,
```

### Fix 2: Enhanced Image Handling in `transformSanityProduct()`

**Added better null handling and placeholder logic:**

```typescript
// Handle null images gracefully
const imageUrl = product.mainImage && product.mainImage !== 'null' 
  ? product.mainImage 
  : 'https://via.placeholder.com/400x400/F5F5DC/1E392A?text=No+Image';

// Filter out null images from gallery
const imageUrls = product.images && Array.isArray(product.images) && product.images.length > 0
  ? product.images.filter(img => img && img !== 'null')
  : [imageUrl];
```

**Why this works:**
- Checks for both `undefined` and string `'null'` from Sanity
- Uses online placeholder if no image (no local file needed)
- Filters out invalid images from gallery arrays

---

## 📊 Sanity Schema Reference

**Correct field names in `studio/src/schemaTypes/documents/product.ts`:**

```typescript
defineField({
  name: 'image',              // ← Main product image
  title: 'Product Image',
  type: 'image',
  options: { hotspot: true },
})

defineField({
  name: 'images',             // ← Additional gallery images
  title: 'Additional Images',
  type: 'array',
  of: [{ type: 'image' }],
})

defineField({
  name: 'quantity',           // ← Stock quantity
  title: 'Quantity in Stock',
  type: 'number',
})

defineField({
  name: 'isOnPromo',          // ← Promotion flag
  title: 'On Promotion',
  type: 'boolean',
})
```

---

## 🎯 How Sanity Images Work

### Image Asset Reference Structure:

**In Sanity Studio:**
- User uploads image → Sanity stores it in CDN
- Reference stored in document: `{ asset: { _ref: "image-abc123..." } }`

**In GROQ Query:**
- Use `->` to dereference: `image.asset->url`
- Sanity returns full CDN URL: `https://cdn.sanity.io/images/{projectId}/production/{imageId}-800x600.jpg`

**Example Full URL:**
```
https://cdn.sanity.io/images/2grm6gj7/production/abc123def456-1200x800.jpg
```

---

## ✅ Verification Steps

1. **Check Sanity Studio** (http://localhost:3333)
   - Open any product
   - Verify "Product Image" field has an image
   - If empty, upload an image

2. **Check Shop Page** (http://localhost:3000/shop)
   - Products should now show images from Sanity CDN
   - Or placeholder if no image uploaded

3. **Check Browser Console**
   - Should NOT see `/images/placeholder-product.jpg 404` errors
   - May see Sanity CDN URLs loading

---

## 🧪 Testing Checklist

### Image Display Test:
- [ ] Shop page shows product images
- [ ] Images load from Sanity CDN (cdn.sanity.io URLs)
- [ ] Products without images show placeholder
- [ ] No 404 errors in console
- [ ] Image hover/zoom works (if implemented)

### Data Integrity Test:
- [ ] Product names display correctly
- [ ] Prices show correctly
- [ ] Stock counts accurate
- [ ] Promo flags work (if product isOnPromo=true)
- [ ] Categories display

---

## 🐛 If Images Still Don't Show

### Possible Issues & Solutions:

1. **Products don't have images uploaded yet**
   - Solution: Upload images in Sanity Studio
   - Go to http://localhost:3333
   - Edit each product → Upload "Product Image"

2. **CORS issue with Sanity CDN**
   - Solution: Add your domain to Sanity CORS settings
   - Go to https://www.sanity.io/manage
   - Project Settings → API → CORS Origins
   - Add `http://localhost:3000`

3. **Image URLs are null in API response**
   - Check console logs for actual API responses
   - Verify products have `image` field populated
   - Run GROQ query in Sanity Vision to test:
     ```groq
     *[_type == "product"][0...3] {
       name,
       "imageUrl": image.asset->url
     }
     ```

4. **Next.js Image Component Issues**
   - Add Sanity CDN to `next.config.ts` images.domains:
     ```typescript
     images: {
       domains: ['cdn.sanity.io'],
     }
     ```

---

## 📝 Next Steps

1. ✅ **DONE:** Fixed field name mismatches
2. ✅ **DONE:** Enhanced null image handling
3. ⏳ **TODO:** Verify images display on shop page
4. ⏳ **TODO:** Upload product images if missing
5. ⏳ **TODO:** Test product detail page images

---

## 🔗 Related Files Modified

| File | Changes Made |
|------|-------------|
| `src/hooks/useSanityProducts.ts` | Fixed 3 GROQ queries (field names) |
| `src/types/sanity.ts` | Enhanced transformSanityProduct() |

---

## 💡 Key Learnings

1. **Always match GROQ field names** to Sanity schema exactly
2. **Use aliasing** in GROQ when transforming: `"newName": oldName`
3. **Sanity image URLs** are full CDN URLs, no processing needed
4. **Null handling** is critical - check for both `null` and `undefined`
5. **Online placeholders** are better than local files (no 404s)

---

**Status:** ✅ IMAGE FIX APPLIED - Ready for testing  
**Last Updated:** November 19, 2025, 9:45 PM
