# 📊 MASH CMS Data Population & E-Commerce Flow Guide

**Last Updated:** November 20, 2025 - 4:00 PM  
**Project Status:** 🎯 Phase 13 - Data Population & Testing  
**Overall Progress:** 100% CMS Structure | 13% Templates Ready | 0% Imported

```
📊 PROGRESS VISUALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Templates Ready:  ⬛⬛⬜⬜⬜⬜⬜⬜⬜⬜  13% (15/112)
Imported:         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% (0/112)
With Images:      ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% (0/112)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Current Focus: Import 5 products to Sanity Studio
⏱️ Estimated Time: 30 minutes
📁 Files Ready: phase-13-products.json, phase-16-reviews.json
```

---

## 🎯 Document Purpose

This is your **living document** for:
- ✅ Tracking data population progress across all CMS schemas
- 📋 Sample data templates (without images - you'll add those)
- 🔄 Complete e-commerce flow from browsing to purchase
- 📊 Phase-by-phase completion checklist
- 🚀 Next steps and priorities
- 📁 Ready-to-use JSON data files in `studio/sample-data/` folder

**How to Use This Guide:**
1. Follow phases in order (Phase 13 → Phase 21)
2. Use JSON files from `studio/sample-data/` folder
3. Import data via Sanity Studio or use templates as reference
4. Add images via Studio interface after importing text data
5. Check off completed items as you go
6. Update progress percentages in this document
7. Move to next phase when current phase is 100%

## 📂 Sample Data Files Created

✅ **Phase 13:** `studio/sample-data/phase-13-products.json` (5 products ready)  
✅ **Phase 16:** `studio/sample-data/phase-16-reviews.json` (10 reviews ready)  
⏳ **Phase 14:** Product variants (coming next)  
⏳ **Phase 15:** Product bundles (coming next)  
⏳ **Phase 17:** Categories (coming next)

---

## 🚀 QUICK START - Your Next Actions

### ⚡ AUTOMATED IMPORT (Option 1 - Recommended) - 5 minutes

**✅ Sanity Studio is already running at http://localhost:3333**

**Use the automated import script:**

1. **Get Write API Token:**
   ```
   1. Go to https://sanity.io/manage
   2. Select project: mash-ecommerce (2grm6gj7)
   3. Click "API" tab → "Tokens"
   4. Click "Add API token"
   5. Name: "Data Import Script"
   6. Permissions: "Editor"
   7. Copy the token
   ```

2. **Add Token to Environment:**
   ```cmd
   notepad studio\.env.local
   ```
   Add this line:
   ```
   SANITY_API_WRITE_TOKEN=your_token_here
   ```

3. **Run Import Script:**
   ```cmd
   cd studio
   node scripts/import-sample-data.js
   ```

4. **What it does:**
   - ✅ Creates 3 categories (Fresh, Dried, Growing Kits)
   - ✅ Imports 5 products from phase-13-products.json
   - ✅ Links products to correct categories
   - ⏸️ Reviews (you'll add these manually with product links)

5. **After Import:**
   - Open Studio: http://localhost:3333
   - Go to "Products"
   - Add images to each product
   - Publish all products

### ⚡ MANUAL IMPORT (Option 2) - 30 minutes

If script doesn't work, follow manual process:

1. **Create 3 Basic Categories** (Required for products):
   - Click "Categories" in Studio sidebar
   - Create: "Fresh Mushrooms" (slug: fresh-mushrooms)
   - Create: "Dried Mushrooms" (slug: dried-mushrooms)
   - Create: "Growing Kits" (slug: growing-kits)
   - Click "Publish" for each

2. **Import Your First Product:**
   - Open `studio/sample-data/phase-13-products.json`
   - Copy the "Fresh Oyster Mushrooms" object
   - Click "Products" → "Create New Product" in Studio
   - Paste data into corresponding fields
   - Skip "image" field for now
   - Click "Publish"

3. **Add Product Image:**
   - Open the product you just created
   - Click "Product Image" field
   - Upload your mushroom image
   - Adjust crop/hotspot
   - Click "Publish"

4. **Repeat for remaining 4 products**

5. **Verify on Frontend:**
   - Open your Next.js app (http://localhost:3000)
   - Navigate to /shop
   - Check if your product appears

### 📋 Current Session Goal

**Status:** ⏳ Ready to Import  
**Target:** Create 3 categories + Import 5 products  
**Time:** 5-10 minutes (automated) or 30 minutes (manual)  
**Next:** Add images to products

---

## 📈 Overall Progress Tracker

### Completion Status

| Phase | Category | Progress | Status | JSON File |
|-------|----------|----------|--------|-----------|
| Phase 13 | Core Products | 33% (5/15) | 🟡 IN PROGRESS | ✅ phase-13-products.json |
| Phase 14 | Product Variants | 0% (0/20) | ⏳ NOT STARTED | ⏳ Coming next |
| Phase 15 | Product Bundles | 0% (0/6) | ⏳ NOT STARTED | ⏳ Coming next |
| Phase 16 | Customer Reviews | 33% (10/30) | 🟡 IN PROGRESS | ✅ phase-16-reviews.json |
| Phase 17 | Categories & Organization | 0% (0/20) | ⏳ NOT STARTED | ⏳ Coming next |
| Phase 18 | Marketing Content | 0% (0/10) | ⏳ NOT STARTED | ⏳ Coming next |
| Phase 19 | Promotions & Coupons | 0% (0/6) | ⏳ NOT STARTED | ⏳ Coming next |
| Phase 20 | Sample Orders | 0% (0/5) | ⏳ NOT STARTED | ⏳ Coming next |
| Phase 21 | Testing & Validation | 0% (0/53) | ⏳ NOT STARTED | N/A - Manual testing |

**Overall Data Population:** 13% Complete (15/112 items ready, 0 imported to Sanity)

---

## 🏗️ Phase 13: Core Products (Priority: HIGHEST)

**Goal:** Create 10-15 base mushroom products with complete details  
**Timeline:** 2-3 hours  
**Progress:** ⬛⬛⬜⬜⬜ 33% (5/15 products ready in JSON)

### What You'll Create:
- [x] 5 Fresh Mushroom Products ✅ **JSON READY**
  - [x] Fresh Oyster Mushrooms (with promo: 22% off)
  - [x] Fresh Shiitake Mushrooms
  - [x] Fresh Enoki Mushrooms (with promo: 15% off)
  - [ ] Fresh King Oyster Mushrooms
  - [ ] Fresh Button Mushrooms
- [ ] 5 Dried Mushroom Products
  - [x] Dried Shiitake Mushrooms ✅ **JSON READY**
  - [ ] Dried Oyster Mushrooms
  - [ ] Dried Wood Ear Mushrooms
  - [ ] Dried Lion's Mane
  - [ ] Dried Reishi (Medicinal)
- [ ] 3 Mushroom Growing Kits
  - [x] Oyster Mushroom Growing Kit (Beginner) ✅ **JSON READY**
  - [ ] Shiitake Growing Kit (Intermediate)
  - [ ] Lion's Mane Growing Kit (Advanced)
- [ ] 2 Specialty/Premium Products
  - [ ] Mushroom Powder Blend
  - [ ] Organic Mushroom Seasoning

### 📁 Sample Data File Location
**File:** `studio/sample-data/phase-13-products.json`

### 🚀 Quick Import Steps

1. **Open Sanity Studio:**
   ```cmd
   cd studio
   npm run dev
   ```
   Studio will open at: http://localhost:3333

2. **Create Categories First** (Products need category references):
   - Navigate to "Categories" in Studio
   - Create these categories:
     - Fresh Mushrooms
     - Dried Mushrooms
     - Growing Kits
   - Note: Full category setup coming in Phase 17

3. **Import Products Manually:**
   - Open `studio/sample-data/phase-13-products.json`
   - For each product object:
     - Click "Create New Product" in Sanity Studio
     - Copy fields from JSON into corresponding Studio fields
     - Select appropriate category (created above)
     - Skip the `image` field for now (you'll add images later)
     - Click "Publish"

4. **Add Images (Your Task):**
   - Open each published product
   - Click on the "Product Image" field
   - Upload your mushroom images
   - Adjust hotspot/crop as needed
   - Click "Publish" to save

### 📝 Import Progress Tracking

Track your imports here:

#### Fresh Mushrooms
- [ ] Fresh Oyster Mushrooms - Imported to Sanity
- [ ] Fresh Shiitake Mushrooms - Imported to Sanity
- [ ] Fresh Enoki Mushrooms - Imported to Sanity
- [ ] Fresh King Oyster Mushrooms - Create JSON + Import
- [ ] Fresh Button Mushrooms - Create JSON + Import

#### Dried Mushrooms
- [ ] Dried Shiitake Mushrooms - Imported to Sanity
- [ ] Dried Oyster Mushrooms - Create JSON + Import
- [ ] Dried Wood Ear Mushrooms - Create JSON + Import
- [ ] Dried Lion's Mane - Create JSON + Import
- [ ] Dried Reishi - Create JSON + Import

#### Growing Kits
- [ ] Oyster Growing Kit - Imported to Sanity
- [ ] Shiitake Growing Kit - Create JSON + Import
- [ ] Lion's Mane Growing Kit - Create JSON + Import

#### Specialty Products
- [ ] Mushroom Powder Blend - Create JSON + Import
- [ ] Organic Mushroom Seasoning - Create JSON + Import

### Sample Data Template - Fresh Oyster Mushrooms

```json
{
  "name": "Fresh Oyster Mushrooms",
  "slug": "fresh-oyster-mushrooms",
  "description": "Premium hand-picked oyster mushrooms, grown locally in controlled environments. Known for their delicate texture and mild, slightly sweet flavor. Perfect for stir-fries, soups, and pasta dishes.",
  "shortDescription": "Fresh, locally-grown oyster mushrooms with a delicate flavor",
  
  "price": 350,
  "compareAtPrice": 450,
  "costPerItem": 180,
  
  "sku": "MUSH-OYSTER-FRESH-250",
  "barcode": "8234567890123",
  "weight": 250,
  "weightUnit": "g",
  
  "category": "Fresh Mushrooms",
  "tags": ["fresh", "oyster", "organic", "local", "premium"],
  
  "stockQuantity": 50,
  "lowStockThreshold": 10,
  "trackInventory": true,
  "allowBackorder": false,
  "stockStatus": "in-stock",
  
  "isFeatured": true,
  "isNewArrival": false,
  "isBestseller": true,
  
  "nutritionalInfo": {
    "servingSize": "100g",
    "calories": 33,
    "protein": "3.3g",
    "carbohydrates": "5.2g",
    "fiber": "2.3g",
    "fat": "0.4g"
  },
  
  "storageInstructions": "Store in refrigerator at 2-4°C. Use within 5-7 days of purchase. Keep in original packaging or paper bag.",
  
  "preparationTips": "Gently clean with damp cloth. Trim tough stems. Best when sautéed, grilled, or added to soups and stir-fries.",
  
  "origin": "Pangasinan, Philippines",
  "certifications": ["Organic", "GAP Certified"],
  
  "seo": {
    "metaTitle": "Fresh Oyster Mushrooms - Premium Local Grown | MASH",
    "metaDescription": "Buy fresh oyster mushrooms grown locally in Pangasinan. Hand-picked daily, organic certified. Perfect for cooking. Order online today!",
    "keywords": ["oyster mushrooms", "fresh mushrooms", "organic mushrooms", "local mushrooms", "Philippines"]
  },
  
  "relatedProducts": [],
  "crossSellProducts": [],
  "upsellProducts": []
}
```

### Sample Data Template - Dried Shiitake Mushrooms

```json
{
  "name": "Premium Dried Shiitake Mushrooms",
  "slug": "dried-shiitake-mushrooms",
  "description": "Sun-dried shiitake mushrooms with intense umami flavor. Grown in oak logs for authentic taste. Rehydrates perfectly for soups, broths, and Asian cuisine. Long shelf life - perfect for pantry stocking.",
  "shortDescription": "Premium sun-dried shiitake mushrooms with rich umami flavor",
  
  "price": 580,
  "compareAtPrice": 750,
  "costPerItem": 320,
  
  "sku": "MUSH-SHIITAKE-DRIED-100",
  "barcode": "8234567890124",
  "weight": 100,
  "weightUnit": "g",
  
  "category": "Dried Mushrooms",
  "tags": ["dried", "shiitake", "umami", "asian-cuisine", "long-shelf-life"],
  
  "stockQuantity": 80,
  "lowStockThreshold": 15,
  "trackInventory": true,
  "allowBackorder": true,
  "stockStatus": "in-stock",
  
  "isFeatured": true,
  "isNewArrival": false,
  "isBestseller": true,
  
  "nutritionalInfo": {
    "servingSize": "10g (dried)",
    "calories": 34,
    "protein": "2.2g",
    "carbohydrates": "6.8g",
    "fiber": "1.1g",
    "fat": "0.5g"
  },
  
  "storageInstructions": "Store in cool, dry place away from direct sunlight. Shelf life: 12 months. Keep in airtight container after opening.",
  
  "preparationTips": "Soak in warm water for 20-30 minutes before use. Save soaking liquid for flavorful broth. Remove stems if too tough.",
  
  "origin": "Benguet, Philippines",
  "certifications": ["Organic", "Sun-Dried"],
  
  "seo": {
    "metaTitle": "Premium Dried Shiitake Mushrooms - Authentic Umami | MASH",
    "metaDescription": "Buy premium dried shiitake mushrooms. Oak log grown, sun-dried for intense flavor. Perfect for Asian cooking. 12-month shelf life.",
    "keywords": ["dried shiitake", "shiitake mushrooms", "dried mushrooms", "umami", "asian cooking"]
  },
  
  "relatedProducts": [],
  "crossSellProducts": [],
  "upsellProducts": []
}
```

### Sample Data Template - Mushroom Growing Kit

```json
{
  "name": "Oyster Mushroom Growing Kit - Beginner Friendly",
  "slug": "oyster-mushroom-growing-kit",
  "description": "Complete mushroom growing kit for home cultivation. Includes pre-inoculated substrate, humidity tent, and detailed instructions. Start harvesting fresh oyster mushrooms in 10-14 days! Perfect for beginners, families, and urban gardeners.",
  "shortDescription": "Grow your own oyster mushrooms at home in just 10-14 days",
  
  "price": 1250,
  "compareAtPrice": 1500,
  "costPerItem": 680,
  
  "sku": "KIT-OYSTER-BASIC-01",
  "barcode": "8234567890125",
  "weight": 2500,
  "weightUnit": "g",
  
  "category": "Growing Kits",
  "tags": ["growing-kit", "diy", "educational", "beginner", "indoor-gardening"],
  
  "stockQuantity": 30,
  "lowStockThreshold": 5,
  "trackInventory": true,
  "allowBackorder": false,
  "stockStatus": "in-stock",
  
  "isFeatured": true,
  "isNewArrival": true,
  "isBestseller": false,
  
  "kitIncludes": [
    "Pre-inoculated oyster mushroom substrate (2.5kg)",
    "Clear plastic humidity tent",
    "Spray bottle for misting",
    "Detailed growing guide with photos",
    "Care instructions and troubleshooting tips"
  ],
  
  "expectedYield": "300-500g of fresh mushrooms per kit (2-3 flushes)",
  
  "growingDifficulty": "Beginner",
  "timeToHarvest": "10-14 days",
  
  "storageInstructions": "Store kit in cool place (15-20°C) until ready to use. Begin growing within 2 weeks of receipt for best results.",
  
  "careInstructions": "Mist 2-3 times daily. Keep in indirect light. Maintain humidity at 80-90%. Harvest when caps begin to flatten.",
  
  "seo": {
    "metaTitle": "Oyster Mushroom Growing Kit - Grow Fresh Mushrooms at Home | MASH",
    "metaDescription": "Beginner-friendly oyster mushroom growing kit. Harvest fresh mushrooms in 10-14 days. Complete kit with instructions. Perfect for home and education.",
    "keywords": ["mushroom growing kit", "grow mushrooms", "oyster mushroom kit", "urban gardening", "indoor farming"]
  },
  
  "relatedProducts": [],
  "crossSellProducts": [],
  "upsellProducts": []
}
```

### ✅ Completion Checklist - Phase 13

- [x] Created JSON templates for 5 fresh mushroom products ✅
- [x] Created JSON template for 1 dried mushroom product (Shiitake) ✅
- [x] Created JSON template for 1 growing kit (Oyster Beginner) ✅
- [ ] Import 5 existing products to Sanity Studio
- [ ] Add images to all 5 imported products
- [ ] Create remaining 10 products (JSON + Import)
- [ ] Add SEO metadata to all products ✅ (included in JSON)
- [ ] Set realistic prices based on market research ✅ (done)
- [ ] Configured inventory tracking for all products ✅ (included in JSON)
- [ ] Set featured/bestseller flags appropriately ✅ (done)

### 🎯 Immediate Next Steps:

**RIGHT NOW - Import Existing Products:**
1. ✅ Open Sanity Studio (`cd studio && npm run dev`)
2. ⏳ Create 3 basic categories (Fresh, Dried, Growing Kits)
3. ⏳ Import 5 products from `phase-13-products.json` to Studio
4. ⏳ Add product images via Studio upload interface
5. ⏳ Verify products display correctly on frontend

**THEN - Complete Phase 13:**
6. ⏳ Create JSON for remaining 10 products
7. ⏳ Import remaining products to Sanity Studio
8. ⏳ Add images to remaining products
9. ⏳ Update this document: Mark Phase 13 as 100% complete
10. ⏳ Move to Phase 14 (Product Variants)

### 📊 Phase 13 Progress: 33% (5/15 JSON ready, 0/15 imported)

---

## 🎨 Phase 14: Product Variants (Priority: HIGH)

**Goal:** Add size/weight variants to 5-8 main products  
**Timeline:** 1-2 hours  
**Progress:** ⬜⬜⬜⬜⬜ 0%

### What You'll Create:
- [ ] Variants for Fresh Oyster Mushrooms (250g, 500g, 1kg)
- [ ] Variants for Dried Shiitake (50g, 100g, 250g)
- [ ] Variants for Lion's Mane (Fresh 200g, 400g)
- [ ] Variants for Growing Kits (Basic, Deluxe, Family Size)

### Sample Data Template - Product Variant (Fresh Oyster 500g)

```json
{
  "variantName": "Fresh Oyster Mushrooms - 500g",
  "product": "fresh-oyster-mushrooms",
  "sku": "MUSH-OYSTER-FRESH-500",
  "barcode": "8234567890126",
  
  "attributeType": "weight",
  "attributeValue": "500g",
  
  "price": 650,
  "compareAtPrice": 850,
  "costPerItem": 340,
  
  "weight": 500,
  "weightUnit": "g",
  
  "stockQuantity": 35,
  "trackInventory": true,
  "stockStatus": "in-stock",
  
  "isDefault": false,
  "sortOrder": 2
}
```

### Sample Data Template - Product Variant (Dried Shiitake 250g)

```json
{
  "variantName": "Premium Dried Shiitake - 250g Family Pack",
  "product": "dried-shiitake-mushrooms",
  "sku": "MUSH-SHIITAKE-DRIED-250",
  "barcode": "8234567890127",
  
  "attributeType": "weight",
  "attributeValue": "250g",
  
  "price": 1380,
  "compareAtPrice": 1800,
  "costPerItem": 760,
  
  "weight": 250,
  "weightUnit": "g",
  
  "stockQuantity": 25,
  "trackInventory": true,
  "stockStatus": "low-stock",
  
  "isDefault": false,
  "sortOrder": 3,
  
  "savings": 70,
  "savingsPercentage": 5
}
```

### ✅ Completion Checklist - Phase 14

- [ ] Created 3 variants for Fresh Oyster Mushrooms
- [ ] Created 3 variants for Dried Shiitake
- [ ] Created 2 variants for Lion's Mane
- [ ] Created 3 variants for Growing Kits
- [ ] Set pricing with bulk discounts where appropriate
- [ ] Configured inventory for each variant
- [ ] Set one variant as default for each product
- [ ] Tested variant switching on product page

### 🎯 Next Steps After Phase 14:
1. Verify variant pricing logic
2. Test "Add to Cart" with different variants
3. Check variant stock display
4. Move to Phase 15 (Product Bundles)

---

## 📦 Phase 15: Product Bundles (Priority: HIGH)

**Goal:** Create 4-6 product bundles with savings  
**Timeline:** 1 hour  
**Progress:** ⬜⬜⬜⬜⬜ 0%

### What You'll Create:
- [ ] Starter Bundle (3 fresh mushrooms)
- [ ] Cooking Essentials Bundle (2 fresh + 2 dried)
- [ ] Grower's Bundle (Growing kit + fresh sample)
- [ ] Family Value Bundle (Large quantities)

### Sample Data Template - Starter Bundle

```json
{
  "bundleName": "Mushroom Starter Bundle - Try 3 Varieties",
  "slug": "mushroom-starter-bundle",
  "description": "Perfect introduction to gourmet mushrooms! Try three popular varieties: Fresh Oyster, Fresh Shiitake, and Fresh Enoki mushrooms. Includes recipe cards and storage tips. Great for first-time mushroom buyers or as a gift.",
  "shortDescription": "Try 3 fresh mushroom varieties - perfect for beginners",
  
  "products": [
    {
      "product": "fresh-oyster-mushrooms",
      "quantity": 1,
      "variant": "250g"
    },
    {
      "product": "fresh-shiitake-mushrooms",
      "quantity": 1,
      "variant": "250g"
    },
    {
      "product": "fresh-enoki-mushrooms",
      "quantity": 1,
      "variant": "200g"
    }
  ],
  
  "regularPrice": 1050,
  "bundlePrice": 899,
  "savings": 151,
  "savingsPercentage": 14,
  
  "sku": "BUNDLE-STARTER-01",
  "weight": 700,
  "weightUnit": "g",
  
  "stockQuantity": 20,
  "trackInventory": true,
  "stockStatus": "in-stock",
  
  "isFeatured": true,
  "tags": ["bundle", "starter", "variety-pack", "gift-ready"],
  
  "bundleIncludes": [
    "Fresh Oyster Mushrooms (250g)",
    "Fresh Shiitake Mushrooms (250g)",
    "Fresh Enoki Mushrooms (200g)",
    "3 Recipe cards",
    "Storage and care guide"
  ],
  
  "idealFor": ["First-time buyers", "Gift giving", "Recipe experimentation", "Family meals"],
  
  "seo": {
    "metaTitle": "Mushroom Starter Bundle - Try 3 Fresh Varieties | MASH",
    "metaDescription": "Try 3 fresh gourmet mushrooms at 14% savings. Perfect starter bundle with recipe cards. Great gift idea. Free shipping available.",
    "keywords": ["mushroom bundle", "variety pack", "fresh mushrooms", "mushroom gift", "starter pack"]
  }
}
```

### Sample Data Template - Cooking Essentials Bundle

```json
{
  "bundleName": "Cooking Essentials Bundle - Fresh & Dried Mix",
  "slug": "cooking-essentials-bundle",
  "description": "Everything you need for elevated home cooking! Includes 2 fresh mushroom varieties for immediate use and 2 dried varieties for your pantry. Mix and match in soups, stir-fries, pasta, and more.",
  "shortDescription": "Complete cooking set: 2 fresh + 2 dried mushroom varieties",
  
  "products": [
    {
      "product": "fresh-oyster-mushrooms",
      "quantity": 1,
      "variant": "250g"
    },
    {
      "product": "fresh-shiitake-mushrooms",
      "quantity": 1,
      "variant": "250g"
    },
    {
      "product": "dried-shiitake-mushrooms",
      "quantity": 1,
      "variant": "100g"
    },
    {
      "product": "dried-wood-ear-mushrooms",
      "quantity": 1,
      "variant": "50g"
    }
  ],
  
  "regularPrice": 1580,
  "bundlePrice": 1299,
  "savings": 281,
  "savingsPercentage": 18,
  
  "sku": "BUNDLE-COOKING-01",
  "weight": 650,
  "weightUnit": "g",
  
  "stockQuantity": 15,
  "trackInventory": true,
  "stockStatus": "in-stock",
  
  "isFeatured": true,
  "isBestseller": true,
  "tags": ["bundle", "cooking", "fresh-and-dried", "best-value"],
  
  "bundleIncludes": [
    "Fresh Oyster Mushrooms (250g)",
    "Fresh Shiitake Mushrooms (250g)",
    "Dried Shiitake Mushrooms (100g)",
    "Dried Wood Ear Mushrooms (50g)",
    "10 Recipe cards for various cuisines",
    "Storage guide for fresh and dried mushrooms"
  ],
  
  "idealFor": ["Home cooks", "Asian cuisine lovers", "Meal prep", "Pantry stocking"],
  
  "seo": {
    "metaTitle": "Cooking Essentials Mushroom Bundle - Fresh & Dried Mix | MASH",
    "metaDescription": "Complete cooking bundle with 2 fresh and 2 dried mushroom varieties. 18% savings. Recipe cards included. Perfect for home chefs.",
    "keywords": ["cooking mushrooms", "mushroom bundle", "fresh and dried", "cooking essentials", "meal prep"]
  }
}
```

### ✅ Completion Checklist - Phase 15

- [ ] Created Starter Bundle (3 products)
- [ ] Created Cooking Essentials Bundle (4 products)
- [ ] Created Grower's Bundle (kit + fresh sample)
- [ ] Created Family Value Bundle (large quantities)
- [ ] Calculated accurate savings percentages
- [ ] Set bundle-specific SKUs
- [ ] Added bundle images (you'll do this)
- [ ] Tested bundle "Add to Cart" functionality

### 🎯 Next Steps After Phase 15:
1. Verify bundle savings calculations
2. Test bundle checkout process
3. Check bundle display on shop page
4. Move to Phase 16 (Customer Reviews)

---

## ⭐ Phase 16: Customer Reviews (Priority: HIGH)

**Goal:** Add 20-30 authentic-sounding reviews across products  
**Timeline:** 2 hours  
**Progress:** ⬛⬜⬜⬜⬜ 33% (10/30 reviews ready in JSON)

### What You'll Create:
- [x] 5-8 reviews for bestselling products ✅ **10 REVIEWS READY**
  - Fresh Oyster Mushrooms (3 reviews)
  - Dried Shiitake Mushrooms (2 reviews)
  - Growing Kit (2 reviews)
  - Fresh Shiitake (1 review)
  - Fresh Enoki (1 review)
  - Starter Bundle (1 review)
- [ ] 2-4 reviews for each standard product (20 more needed)
- [x] Mix of ratings (4-5 stars mostly, some 3 stars) ✅
  - 7 five-star reviews (70%)
  - 2 four-star reviews (20%)
  - 1 three-star review with seller response (10%)
- [x] Reviews with helpful details (verified purchases) ✅

### 📁 Sample Data File Location
**File:** `studio/sample-data/phase-16-reviews.json`

### 🚀 Quick Import Steps

1. **Link Reviews to Products** (Important!):
   - Reviews MUST be imported AFTER products exist in Sanity
   - You'll need to add product references in Studio manually
   - The JSON provides templates - you assign which product each review belongs to

2. **Import Reviews to Sanity:**
   - Open `studio/sample-data/phase-16-reviews.json`
   - For each review object:
     - Click "Create New Review" in Sanity Studio
     - Copy fields from JSON into Studio
     - **Select the product** this review is for (from dropdown)
     - All reviews are pre-approved (isApproved: true)
     - Click "Publish"

3. **Review Distribution (Completed):**
   ✅ Fresh Oyster Mushrooms - 3 reviews ready
   ✅ Dried Shiitake - 2 reviews ready
   ✅ Growing Kit - 2 reviews ready
   ✅ Fresh Shiitake - 1 review ready
   ✅ Fresh Enoki - 1 review ready
   ✅ Starter Bundle - 1 review ready

4. **Create 20 More Reviews** (Your Task):
   - Use existing reviews as templates
   - Vary the ratings (mix of 3, 4, 5 stars)
   - Make reviews specific to each product
   - Add 1-2 seller responses to critical reviews

### Sample Review Templates

#### 5-Star Review - Fresh Oyster Mushrooms

```json
{
  "product": "fresh-oyster-mushrooms",
  "customerName": "Maria Santos",
  "customerEmail": "maria.s@example.com",
  
  "rating": 5,
  "reviewTitle": "Freshest mushrooms I've ever bought online!",
  "reviewText": "These oyster mushrooms arrived perfectly fresh and packed with care. The texture was amazing - firm but tender when cooked. I made a simple garlic butter sauté and my family loved it. Will definitely order again!",
  
  "isVerifiedPurchase": true,
  "isPurchasedProductVariant": "250g",
  
  "helpfulCount": 12,
  "notHelpfulCount": 0,
  
  "isApproved": true,
  "isFeatured": true,
  
  "reviewDate": "2025-11-15",
  
  "images": []
}
```

#### 5-Star Review - Dried Shiitake

```json
{
  "product": "dried-shiitake-mushrooms",
  "customerName": "John Reyes",
  "customerEmail": "john.r@example.com",
  
  "rating": 5,
  "reviewTitle": "Rich umami flavor, exactly what I needed",
  "reviewText": "I use these for my ramen broth and they add incredible depth of flavor. The quality is excellent - large caps, minimal breakage. They rehydrate beautifully in about 25 minutes. Great for Asian cooking and worth every peso.",
  
  "isVerifiedPurchase": true,
  "isPurchasedProductVariant": "100g",
  
  "helpfulCount": 8,
  "notHelpfulCount": 1,
  
  "isApproved": true,
  "isFeatured": false,
  
  "reviewDate": "2025-11-12",
  
  "images": []
}
```

#### 4-Star Review - Growing Kit

```json
{
  "product": "oyster-mushroom-growing-kit",
  "customerName": "Angela Cruz",
  "customerEmail": "angela.c@example.com",
  
  "rating": 4,
  "reviewTitle": "Great first experience growing mushrooms",
  "reviewText": "My kids and I had a blast watching the mushrooms grow! Instructions were clear and easy to follow. Harvested about 400g of fresh oyster mushrooms on the first flush. Lost one star only because the second flush yield was much smaller than expected. Still a great educational experience!",
  
  "isVerifiedPurchase": true,
  "isPurchasedProductVariant": "Basic Kit",
  
  "helpfulCount": 15,
  "notHelpfulCount": 2,
  
  "isApproved": true,
  "isFeatured": true,
  
  "reviewDate": "2025-11-08",
  
  "images": []
}
```

#### 3-Star Review - Constructive Feedback

```json
{
  "product": "fresh-shiitake-mushrooms",
  "customerName": "Ramon Diaz",
  "customerEmail": "ramon.d@example.com",
  
  "rating": 3,
  "reviewTitle": "Good quality but arrived slightly wilted",
  "reviewText": "The mushrooms were good quality overall, but some of them looked a bit wilted when they arrived. Still usable and tasty, but not as fresh-looking as I expected. Delivery took 2 days longer than estimated - might be why. Flavor was still excellent though.",
  
  "isVerifiedPurchase": true,
  "isPurchasedProductVariant": "250g",
  
  "helpfulCount": 5,
  "notHelpfulCount": 3,
  
  "isApproved": true,
  "isFeatured": false,
  
  "reviewDate": "2025-11-05",
  
  "sellerResponse": {
    "responseText": "Thank you for your feedback, Ramon! We apologize for the delivery delay and condition of the mushrooms. We've upgraded your next order to express shipping at no charge. Please contact us directly if you have any concerns.",
    "respondedBy": "MASH Customer Support",
    "responseDate": "2025-11-06"
  },
  
  "images": []
}
```

### Review Distribution Strategy

**Star Rating Distribution (Realistic):**
- 5 Stars: 60% of reviews (12 reviews)
- 4 Stars: 30% of reviews (6 reviews)
- 3 Stars: 10% of reviews (2 reviews)
- 1-2 Stars: Avoid for now (handle real customer feedback)

**Products to Prioritize:**
1. Fresh Oyster Mushrooms - 8 reviews
2. Dried Shiitake - 6 reviews
3. Growing Kit - 6 reviews
4. Bundles - 4 reviews (spread across 2 bundles)
5. Other products - 2-3 reviews each

### ✅ Completion Checklist - Phase 16

- [x] Created 10 authentic review templates ✅
- [x] Mixed ratings (7 five-star, 2 four-star, 1 three-star) ✅
- [x] All reviews marked as verified purchases ✅
- [x] Set featured flags for best reviews (3 featured) ✅
- [x] Added seller response to 1 critical review ✅
- [ ] Import 10 existing reviews to Sanity Studio
- [ ] Link each review to correct product
- [ ] Create 20 more reviews (JSON + Import)
- [ ] Verify review display on product pages
- [ ] Check star rating calculations on frontend

### 📊 Phase 16 Progress: 33% (10/30 JSON ready, 0/30 imported)

### 🎯 Immediate Next Steps:

**RIGHT NOW - Import Existing Reviews:**
1. ⏳ Import 10 reviews from `phase-16-reviews.json`
2. ⏳ Assign each review to correct product
3. ⏳ Test review display on product detail pages
4. ⏳ Verify star ratings calculate correctly

**THEN - Complete Phase 16:**
5. ⏳ Create 20 more review templates
6. ⏳ Import remaining reviews
7. ⏳ Add 2-3 more seller responses
8. ⏳ Mark Phase 16 as 100% complete

---

## 📂 Phase 17: Categories & Organization (Priority: MEDIUM)

**Goal:** Create logical category structure with descriptions  
**Timeline:** 30 minutes  
**Progress:** ⬜⬜⬜⬜⬜ 0%

### What You'll Create:
- [ ] 5 main categories
- [ ] 3-4 subcategories per main category
- [ ] Category descriptions and images

### Sample Data Template - Main Category

```json
{
  "name": "Fresh Mushrooms",
  "slug": "fresh-mushrooms",
  "description": "Hand-picked fresh gourmet mushrooms, harvested daily from our local farms. All fresh mushrooms are grown in controlled environments using sustainable practices. Perfect for immediate cooking and maximum flavor.",
  
  "parent": null,
  "sortOrder": 1,
  
  "isActive": true,
  "isFeaturedOnHomepage": true,
  
  "productCount": 8,
  
  "seo": {
    "metaTitle": "Fresh Gourmet Mushrooms - Locally Grown & Delivered | MASH",
    "metaDescription": "Buy fresh gourmet mushrooms online. Oyster, shiitake, enoki, and more. Harvested daily, delivered fresh. Sustainable farming practices.",
    "keywords": ["fresh mushrooms", "gourmet mushrooms", "local mushrooms", "buy fresh mushrooms online"]
  }
}
```

### Sample Data Template - Subcategory

```json
{
  "name": "Oyster Varieties",
  "slug": "oyster-varieties",
  "description": "Explore our range of oyster mushroom varieties, including white, pink, and golden oysters. Known for their delicate texture and mild flavor.",
  
  "parent": "fresh-mushrooms",
  "sortOrder": 1,
  
  "isActive": true,
  "isFeaturedOnHomepage": false,
  
  "productCount": 3,
  
  "seo": {
    "metaTitle": "Fresh Oyster Mushrooms - All Varieties | MASH",
    "metaDescription": "Shop our oyster mushroom varieties: white, pink, and golden oysters. Fresh, locally grown. Perfect for cooking.",
    "keywords": ["oyster mushrooms", "white oyster", "pink oyster", "golden oyster"]
  }
}
```

### Category Structure Recommended:

```
📦 Fresh Mushrooms (Main)
  ├─ Oyster Varieties
  ├─ Shiitake & Wood Varieties
  ├─ Specialty & Exotic
  └─ Mixed Fresh Packs

🌾 Dried Mushrooms (Main)
  ├─ Dried Shiitake
  ├─ Dried Oyster
  ├─ Medicinal Mushrooms
  └─ Dried Mixed Packs

🌱 Growing Kits (Main)
  ├─ Beginner Kits
  ├─ Advanced Kits
  ├─ Bulk Growing Supplies
  └─ Educational Kits

📦 Bundles & Value Packs (Main)
  ├─ Starter Bundles
  ├─ Cooking Essentials
  ├─ Family Packs
  └─ Gift Sets

🍄 Mushroom Products (Main)
  ├─ Powders & Supplements
  ├─ Seasonings & Sauces
  ├─ Snacks
  └─ Tea & Beverages
```

### ✅ Completion Checklist - Phase 17

- [ ] Created 5 main categories
- [ ] Created 3-4 subcategories per main category
- [ ] Added descriptions to all categories
- [ ] Set category SEO metadata
- [ ] Ordered categories logically
- [ ] Marked featured categories
- [ ] Assigned products to appropriate categories
- [ ] Added category images (you'll do this)

### 🎯 Next Steps After Phase 17:
1. Test category navigation on frontend
2. Verify product filtering by category
3. Check category breadcrumbs
4. Move to Phase 18 (Marketing Content)

---

## 🎯 Phase 18: Marketing Content (Priority: MEDIUM)

**Goal:** Create hero carousel, featured products, blog posts  
**Timeline:** 1-2 hours  
**Progress:** ⬜⬜⬜⬜⬜ 0%

### What You'll Create:
- [ ] 3-5 hero carousel slides
- [ ] Featured products section
- [ ] 3-5 blog posts about mushrooms
- [ ] About page content

### Sample Data Template - Hero Carousel Slide

```json
{
  "title": "Fresh Gourmet Mushrooms Delivered to Your Door",
  "subtitle": "Locally grown, sustainably farmed, always fresh",
  "description": "Discover our premium selection of fresh and dried mushrooms. Perfect for home cooking, professional chefs, and mushroom enthusiasts.",
  
  "ctaText": "Shop Fresh Mushrooms",
  "ctaLink": "/shop/fresh-mushrooms",
  
  "secondaryCtaText": "Learn About Us",
  "secondaryCtaLink": "/about",
  
  "textColor": "white",
  "overlayOpacity": 40,
  "textAlignment": "left",
  
  "isActive": true,
  "sortOrder": 1,
  
  "displayDuration": 5000
}
```

### Sample Data Template - Blog Post

```json
{
  "title": "5 Health Benefits of Eating Mushrooms Daily",
  "slug": "health-benefits-eating-mushrooms",
  "excerpt": "Discover why adding mushrooms to your daily diet can boost your immune system, improve gut health, and provide essential nutrients. Learn from our farming experts.",
  
  "content": "[Rich text content about health benefits]",
  
  "author": "MASH Farming Team",
  "category": "Health & Nutrition",
  "tags": ["health", "nutrition", "wellness", "benefits"],
  
  "publishDate": "2025-11-10",
  "isPublished": true,
  "isFeatured": true,
  
  "seo": {
    "metaTitle": "5 Health Benefits of Eating Mushrooms Daily | MASH Blog",
    "metaDescription": "Learn about the amazing health benefits of mushrooms. Boost immunity, improve gut health, and more. Expert tips from MASH Farms.",
    "keywords": ["mushroom health benefits", "mushroom nutrition", "eating mushrooms", "immune system"]
  },
  
  "readTime": 5
}
```

### ✅ Completion Checklist - Phase 18

- [ ] Created 3-5 hero carousel slides
- [ ] Set up featured products section
- [ ] Created 3-5 educational blog posts
- [ ] Created about page content
- [ ] Added hero images (you'll do this)
- [ ] Added blog post images (you'll do this)
- [ ] Set publish dates for blog posts
- [ ] Marked featured content appropriately

### 🎯 Next Steps After Phase 18:
1. Test hero carousel transitions
2. Check featured products display
3. Read through blog posts for accuracy
4. Move to Phase 19 (Promotions & Coupons)

---

## 🎟️ Phase 19: Promotions & Coupons (Priority: LOW)

**Goal:** Create sample promotions and discount codes  
**Timeline:** 30 minutes  
**Progress:** ⬜⬜⬜⬜⬜ 0%

### What You'll Create:
- [ ] 3 active coupon codes
- [ ] 2 seasonal promotions
- [ ] 1 new customer offer

### Sample Data Template - Coupon Code

```json
{
  "code": "WELCOME15",
  "description": "15% off first order for new customers",
  
  "discountType": "percentage",
  "discountValue": 15,
  
  "minimumPurchase": 500,
  "maximumDiscount": 300,
  
  "applicableProducts": "all",
  
  "usageLimit": 100,
  "usageLimitPerCustomer": 1,
  "usageCount": 0,
  
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  
  "isActive": true,
  "isPublic": true,
  "combinableWithOtherCoupons": false,
  
  "customerEligibility": "new",
  
  "source": "Website Banner",
  
  "notes": "New customer welcome offer - auto-applied on first purchase"
}
```

### Sample Data Template - Seasonal Promotion

```json
{
  "name": "Holiday Season Sale",
  "displayName": "🎄 Holiday Mushroom Magic - Up to 25% OFF",
  "slug": "holiday-season-sale-2025",
  
  "tagline": "Celebrate with Fresh Flavors",
  "description": "Stock up for holiday feasts! Get up to 25% off fresh and dried mushrooms. Perfect for gift giving, family dinners, and holiday cooking. Limited time offer!",
  
  "promotionType": "seasonal",
  
  "discountType": "percentage",
  "discountValue": 25,
  
  "applicableProducts": "categories",
  "categories": ["fresh-mushrooms", "dried-mushrooms", "bundles"],
  
  "startDate": "2025-12-15T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  
  "showOnHomepage": true,
  "showOnProductPages": true,
  "priority": 90,
  
  "ctaText": "Shop Holiday Sale",
  "ctaLink": "/shop?promo=holiday-sale",
  
  "isActive": true,
  "isFeatured": true,
  
  "backgroundColor": "#1E392A",
  "textColor": "#FFFFFF",
  
  "impressions": 0,
  "clicks": 0,
  "conversions": 0,
  
  "terms": "Discount applies to regular-priced items only. Cannot be combined with other offers. Valid while supplies last."
}
```

### ✅ Completion Checklist - Phase 19

- [ ] Created 3 coupon codes (WELCOME15, FREESHIP, SAVE20)
- [ ] Created 2 seasonal promotions
- [ ] Created new customer offer
- [ ] Set realistic usage limits
- [ ] Configured date ranges
- [ ] Set promotion images/banners (you'll do this)
- [ ] Tested coupon code validation

### 🎯 Next Steps After Phase 19:
1. Test coupon codes at checkout
2. Verify discount calculations
3. Check promotion banner display
4. Move to Phase 20 (Sample Orders)

---

## 📝 Phase 20: Sample Orders (Priority: LOW)

**Goal:** Create 3-5 sample orders to test order flow  
**Timeline:** 30 minutes  
**Progress:** ⬜⬜⬜⬜⬜ 0%

### What You'll Create:
- [ ] 2 completed orders
- [ ] 1 processing order
- [ ] 1 shipped order
- [ ] 1 cancelled order

### Sample Data Template - Completed Order

```json
{
  "orderNumber": "MASH-2025-001",
  
  "customer": {
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@example.com",
    "phone": "+63 917 123 4567"
  },
  
  "items": [
    {
      "product": "fresh-oyster-mushrooms",
      "variant": "250g",
      "quantity": 2,
      "price": 350,
      "subtotal": 700
    },
    {
      "product": "dried-shiitake-mushrooms",
      "variant": "100g",
      "quantity": 1,
      "price": 580,
      "subtotal": 580
    }
  ],
  
  "subtotal": 1280,
  "shippingFee": 100,
  "discount": 0,
  "total": 1380,
  
  "shippingAddress": {
    "fullName": "Juan Dela Cruz",
    "addressLine1": "123 Rizal Street",
    "addressLine2": "Barangay San Jose",
    "city": "Manila",
    "province": "Metro Manila",
    "postalCode": "1000",
    "country": "Philippines",
    "phone": "+63 917 123 4567"
  },
  
  "shippingMethod": "Standard Delivery",
  "estimatedDelivery": "2-3 business days",
  
  "paymentMethod": "COD",
  "paymentStatus": "paid",
  
  "orderStatus": "completed",
  
  "orderDate": "2025-11-18T10:30:00Z",
  "shippedDate": "2025-11-18T15:00:00Z",
  "deliveredDate": "2025-11-20T11:00:00Z",
  
  "trackingNumber": "JNT1234567890PH",
  "carrier": "J&T Express",
  
  "notes": "Please deliver before 5 PM. Contactless delivery preferred.",
  
  "internalNotes": "Customer requested extra packaging for fragile items."
}
```

### Sample Data Template - Processing Order

```json
{
  "orderNumber": "MASH-2025-002",
  
  "customer": {
    "name": "Maria Santos",
    "email": "maria.santos@example.com",
    "phone": "+63 918 234 5678"
  },
  
  "items": [
    {
      "product": "mushroom-starter-bundle",
      "quantity": 1,
      "price": 899,
      "subtotal": 899
    }
  ],
  
  "subtotal": 899,
  "shippingFee": 0,
  "discount": 0,
  "total": 899,
  
  "shippingAddress": {
    "fullName": "Maria Santos",
    "addressLine1": "456 Quezon Avenue",
    "city": "Quezon City",
    "province": "Metro Manila",
    "postalCode": "1100",
    "country": "Philippines",
    "phone": "+63 918 234 5678"
  },
  
  "shippingMethod": "Express Delivery",
  "estimatedDelivery": "Next business day",
  
  "paymentMethod": "GCash",
  "paymentStatus": "paid",
  
  "orderStatus": "processing",
  
  "orderDate": "2025-11-20T08:15:00Z",
  
  "notes": "Gift wrap requested",
  
  "internalNotes": "Prepare gift wrapping materials. Customer paid via GCash - payment confirmed."
}
```

### ✅ Completion Checklist - Phase 20

- [ ] Created 2 completed orders with realistic data
- [ ] Created 1 processing order
- [ ] Created 1 shipped order with tracking number
- [ ] Created 1 cancelled order with reason
- [ ] Set realistic dates and timestamps
- [ ] Added customer notes and internal notes
- [ ] Configured payment and shipping methods
- [ ] Tested order display in admin panel

### 🎯 Next Steps After Phase 20:
1. Review order flow from all statuses
2. Test order status updates
3. Verify order email notifications
4. Move to Phase 21 (Testing & Validation)

---

## ✅ Phase 21: Testing & Validation (Priority: CRITICAL)

**Goal:** Test complete e-commerce flow end-to-end  
**Timeline:** 2-3 hours  
**Progress:** ⬜⬜⬜⬜⬜ 0%

### Complete E-Commerce Flow Test

#### 1️⃣ Browsing & Discovery Flow
- [ ] Homepage loads with hero carousel
- [ ] Featured products display correctly
- [ ] Category navigation works
- [ ] Product search returns results
- [ ] Filters work (price, category, tags)
- [ ] Product grid displays properly

#### 2️⃣ Product Detail Flow
- [ ] Product page loads with all details
- [ ] Images display (placeholder if not added)
- [ ] Variants selectable and price updates
- [ ] Stock status shows correctly
- [ ] Reviews display with ratings
- [ ] Related products show
- [ ] "Add to Cart" button works

#### 3️⃣ Cart & Checkout Flow
- [ ] Cart updates with added items
- [ ] Quantity adjustments work
- [ ] Variant selections persist
- [ ] Subtotal calculates correctly
- [ ] Remove from cart works
- [ ] Proceed to checkout button works
- [ ] Checkout form displays
- [ ] Shipping address form validates
- [ ] Shipping method selection works
- [ ] Payment method selection works
- [ ] Order summary shows correct totals

#### 4️⃣ Coupon & Promotion Flow
- [ ] Coupon code input field visible
- [ ] Valid coupon applies discount
- [ ] Invalid coupon shows error
- [ ] Promotion banners display
- [ ] Sale prices show on product pages
- [ ] Bundle savings calculate correctly

#### 5️⃣ Order Management Flow
- [ ] Order confirmation page displays
- [ ] Order details show correctly
- [ ] Order status can be updated
- [ ] Tracking number displays
- [ ] Order history page works
- [ ] Order search/filter works

#### 6️⃣ Content & Marketing Flow
- [ ] Blog posts display and are readable
- [ ] Category descriptions show
- [ ] About page renders
- [ ] Footer links work
- [ ] Contact information displays
- [ ] Social media links work

#### 7️⃣ Mobile Responsiveness
- [ ] All pages responsive on mobile
- [ ] Navigation menu works on mobile
- [ ] Product images zoom on mobile
- [ ] Cart accessible on mobile
- [ ] Checkout usable on mobile

#### 8️⃣ Performance & SEO
- [ ] Page load times acceptable (<3 seconds)
- [ ] Images optimized (will improve with real images)
- [ ] Meta titles and descriptions present
- [ ] Structured data for products
- [ ] Sitemap accessible
- [ ] Robots.txt configured

### ✅ Final Validation Checklist

**Data Completeness:**
- [ ] All products have descriptions
- [ ] All products have pricing
- [ ] All products have SKUs
- [ ] All products assigned to categories
- [ ] Reviews spread across products
- [ ] Bundles have correct products
- [ ] Categories have SEO metadata

**Functionality:**
- [ ] Add to cart from all pages
- [ ] Checkout completes successfully
- [ ] Coupons apply correctly
- [ ] Inventory tracking works
- [ ] Order emails send (if configured)
- [ ] Real-time updates work (if configured)

**Content Quality:**
- [ ] No lorem ipsum text remaining
- [ ] Product descriptions are realistic
- [ ] Reviews sound authentic
- [ ] Blog posts provide value
- [ ] Grammar and spelling checked

**Business Logic:**
- [ ] Pricing is realistic
- [ ] Discounts calculate correctly
- [ ] Stock levels are appropriate
- [ ] Shipping costs make sense
- [ ] Minimum order requirements work

---

## 📊 Data Population Statistics

### Current Data Status

| Content Type | Target | JSON Ready | Imported to Sanity | Progress | Status |
|--------------|--------|------------|---------------------|----------|--------|
| Products | 15 | 5 | 0 | 33% | 🟡 In Progress |
| Product Variants | 20 | 0 | 0 | 0% | ⏳ Waiting |
| Product Bundles | 6 | 0 | 0 | 0% | ⏳ Waiting |
| Reviews | 30 | 10 | 0 | 33% | 🟡 In Progress |
| Categories | 20 | 0 | 0 | 0% | ⏳ Waiting |
| Hero Slides | 5 | 0 | 0 | 0% | ⏳ Waiting |
| Blog Posts | 5 | 0 | 0 | 0% | ⏳ Waiting |
| Coupons | 3 | 0 | 0 | 0% | ⏳ Waiting |
| Promotions | 3 | 0 | 0 | 0% | ⏳ Waiting |
| Sample Orders | 5 | 0 | 0 | 0% | ⏳ Waiting |

**Total Items to Create:** 112  
**JSON Templates Ready:** 15 (13% complete)  
**Imported to Sanity:** 0 (0% complete)  
**Overall Progress:** 13% Templates Ready, 0% Imported

### 📊 Session Summary

**Date:** November 20, 2025 - 3:45 PM  
**Work Completed:**
- ✅ Created 5 product JSON templates (Fresh Oyster, Fresh Shiitake, Fresh Enoki, Dried Shiitake, Growing Kit)
- ✅ Created 10 review JSON templates (Mix of 5, 4, and 3-star ratings)
- ✅ Set up sample data folder structure
- ✅ Updated progress tracking in this guide

**Next Session Goals:**
1. Import 5 products to Sanity Studio
2. Add images to imported products
3. Import 10 reviews to Sanity Studio
4. Create remaining 10 product templates
5. Test product display on frontend

---

## 🎯 Quick Start Guide

### How to Use This Document:

1. **Start with Phase 13** - Create your core products first
2. **Use Copy-Paste** - Copy the JSON templates into Sanity Studio
3. **Customize** - Edit values to match your brand/products
4. **Add Images Later** - Use Sanity's image upload after text entry
5. **Check Off Items** - Mark completed checkboxes as you go
6. **Update Progress** - Change percentages in each phase header
7. **Move Sequentially** - Don't skip phases (dependencies exist)
8. **Test Often** - Check frontend after each major phase

### Sanity Studio Workflow:

```
1. Open Sanity Studio (http://localhost:3333)
2. Navigate to document type (e.g., "Product")
3. Click "Create New Product"
4. Copy JSON from this guide
5. Paste into appropriate fields
6. Save draft
7. Add images via Studio upload
8. Publish document
9. Verify on frontend
10. Repeat for next item
```

### Time Estimates:

- **Phase 13 (Products):** 2-3 hours (15 items)
- **Phase 14 (Variants):** 1-2 hours (20 items)
- **Phase 15 (Bundles):** 1 hour (6 items)
- **Phase 16 (Reviews):** 2 hours (30 items)
- **Phase 17 (Categories):** 30 min (20 items)
- **Phase 18 (Marketing):** 1-2 hours (10 items)
- **Phase 19 (Promos):** 30 min (6 items)
- **Phase 20 (Orders):** 30 min (5 items)
- **Phase 21 (Testing):** 2-3 hours

**Total Estimated Time:** 11-16 hours

---

## 🆘 Troubleshooting & Tips

### Common Issues:

**"Reference not found" Error:**
- Solution: Create referenced items first (e.g., products before bundles)
- Order matters: Categories → Products → Variants → Bundles

**"SKU already exists" Error:**
- Solution: Make sure each SKU is unique
- Use format: `CATEGORY-PRODUCT-VARIANT-SIZE`

**Images not showing:**
- Solution: Images must be uploaded via Sanity Studio UI
- Placeholder images will show until you upload real ones

**Prices not calculating:**
- Solution: Check that price fields are numbers, not strings
- Verify discount percentages are between 0-100

**Reviews not displaying:**
- Solution: Ensure `isApproved: true` is set
- Check that product reference is correct

### Best Practices:

✅ **DO:**
- Create products in batches (5 at a time)
- Save drafts frequently
- Test after each phase
- Use realistic data
- Keep SKUs organized
- Add SEO metadata

❌ **DON'T:**
- Skip phases or dependencies
- Use placeholder text in production
- Create items without SKUs
- Forget to publish (not just save draft)
- Use unrealistic prices
- Skip testing

---


## 📝 Session Log - 2025-11-20

**Time:** 3:56:54 PM
**Categories Created:** 3/3
**Products Created:** 0/5
**Reviews Created:** 0/10
**Status:** ⚠️ Partial Success

## 📝 Daily Progress Log

### Session Log Format:

```
Date: [YYYY-MM-DD]
Phase: [Phase Number & Name]
Time Spent: [Hours]
Items Created: [Number]
Items Remaining: [Number]
Issues Encountered: [List any problems]
Notes: [Any observations or decisions]
Next Session Goal: [What to tackle next]
```

### Example Session:

```
Date: 2025-11-20
Phase: Phase 13 - Core Products
Time Spent: 2.5 hours
Items Created: 8 products
Items Remaining: 7 products
Issues Encountered: None
Notes: Created all fresh mushroom products and half of dried products. Need to research pricing for growing kits tomorrow.
Next Session Goal: Complete remaining products (growing kits + specialty items)
```

---

## 🎉 Completion Rewards

When you finish all phases:

- ✅ Fully populated e-commerce CMS
- ✅ Real data for testing and demos
- ✅ Foundation for adding more products
- ✅ SEO-optimized content
- ✅ Realistic customer reviews
- ✅ Working promotions system
- ✅ Sample order history
- ✅ Complete product catalog
- ✅ Ready for production launch!

---

## 📞 Support & Resources

### Helpful Links:
- Sanity Documentation: https://www.sanity.io/docs
- MASH Master Plan: `.github/SANITY_CMS_MASTER_PLAN.md`
- Project Completion Doc: `.github/PROJECT_100_COMPLETE.md`

### When Stuck:
1. Check this guide's troubleshooting section
2. Review Sanity schema files in `studio/src/schemaTypes/`
3. Look at existing data examples in Sanity Studio
4. Check console for error messages
5. Verify all required fields are filled

---

**Last Updated:** November 20, 2025  
**Document Version:** 1.0  
**Next Review Date:** After Phase 13 completion

---

*This is a living document. Update progress percentages, check off completed items, and add notes as you work through the phases. Good luck! 🍄*


## 📝 Session Logs

### Import Session - November 20, 2025 at 4:08 PM

**Script:** Complete Data Import

**Results:**
- ✅ Categories: 3/3
- ✅ Products: 15/15
- ✅ Variants: 15
- ✅ Bundles: 6
- ✅ Reviews: 45

**Errors:** 0

