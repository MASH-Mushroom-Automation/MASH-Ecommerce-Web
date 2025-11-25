# 🍄 MASH Sanity CMS - Master Execution Plan

**Project**: PP_Namias Sanity CMS (gerattrr)  
**Created**: November 26, 2025  
**Status**: 70% Complete → Target: 100%  
**Time Required**: 1 hour 55 minutes (115 minutes total)  
**Purpose**: Complete automated e-commerce CMS with full testing & deployment

---

## 📊 Executive Summary

### Current State (70% Complete)

**✅ Completed Infrastructure**:
- ✅ Sanity project configured (gerattrr, production dataset)
- ✅ API tokens configured (read + write access)
- ✅ 17 document types defined in schema
- ✅ Script library created (sanity-client.js with 10 functions)
- ✅ 3 categories imported
- ✅ 15 products imported
- ✅ 15 images collected (⚠️ asset refs need fixing)

**📦 Data Files Ready (100%)**:
- ✅ categories.json (3 items)
- ✅ products.json (15 items)
- ✅ variants.json (15 items)
- ✅ bundles.json (6 items)
- ✅ reviews.json (45 items)
- ✅ relationships.json (15 products mapped)

**🛠️ Scripts Ready (100%)**:
- ✅ 15 automation scripts created
- ✅ All scripts tested and functional
- ✅ Comprehensive testing suite ready

### What's Pending (30% Remaining)

**🔴 Phase 1**: Fix product image references (10 min) - CRITICAL
**⏳ Phase 2**: Import variants (15 min)
**⏳ Phase 3**: Link relationships (15 min)
**⏳ Phase 4**: Import bundles (10 min)
**⏳ Phase 5**: Import reviews (10 min)
**⏳ Phase 6**: Comprehensive testing (30 min)
**⏳ Phase 7**: Studio deployment (20 min)

**Total Time**: 115 minutes (1 hour 55 minutes)

---

## 🗂️ Complete Schema Inventory

### 17 Document Types in Sanity Studio

#### **Core E-Commerce (8 types)**
1. **category** - Product categories (Fresh, Dried, Growing Kits)
2. **product** - Main product catalog (25+ fields with variants, suggestions, delivery)
3. **productVariant** - Size/weight options (Small, Medium, Large)
4. **productBundle** - Package deals with savings
5. **review** - Customer reviews with ratings
6. **order** - Order management
7. **coupon** - Discount codes
8. **promotion** - Marketing campaigns

#### **Content Management (3 types)**
9. **page** - CMS pages
10. **post** - Blog posts
11. **person** - Authors/team members

#### **Marketing (2 types)**
12. **emailCampaign** - Email marketing
13. **analytics** - Performance metrics

#### **Singletons (3 types)**
14. **settings** - Global site config
15. **heroCarousel** - Homepage hero slides
16. **featuredProducts** - Homepage product showcase

#### **Objects (4 types - not standalone documents)**
- blockContent - Rich text editor
- infoSection - Page sections
- callToAction - CTA buttons
- link - URL links

**Total Document Types**: 17 (13 documents + 3 singletons + 4 objects)

---

## 🚀 Phase-by-Phase Execution Plan

### **Phase 0: Pre-Flight Check** (5 minutes)

**Goal**: Verify environment and data integrity before execution

```powershell
# Navigate to project root
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Test Sanity connection
node scripts\sanity\test-connection.js
```

**Expected Output**:
```
🧪 Testing Sanity Connection...

Test 1: Connection
✓ Connected to Sanity successfully!

Test 2: Document Counts
   Categories: 3
   Products: 15
   Product Variants: 0
   Product Bundles: 0
   Reviews: 0

✅ All tests completed!
```

**Verification Checklist**:
- [ ] Connection successful
- [ ] 3 categories exist
- [ ] 15 products exist
- [ ] API tokens valid
- [ ] Data files present in `data/sanity/`:
  - [ ] categories.json (3 items)
  - [ ] products.json (15 items)
  - [ ] variants.json (15 items)
  - [ ] bundles.json (6 items)
  - [ ] reviews.json (45 items)
  - [ ] relationships.json (228 lines)
- [ ] Image files present in `data/sanity/images/` (15 files)

**Time**: 5 minutes

---

### **Phase 1: Fix Product Image References** (10 minutes) 🔴 CRITICAL

**Goal**: Resolve "Invalid image value" errors in Sanity Studio

**Problem**: Products showing broken image references. This blocks all other work.

**Solution**:
```powershell
# Run fix script
node scripts\sanity\fix-product-images.js

# Verify fix worked
node scripts\sanity\verify-images.js
```

**What the Script Does**:
1. Fetches all 15 products from Sanity
2. Identifies products with missing/invalid image asset references
3. Re-uploads images from `data/sanity/images/` directory
4. Updates product documents with correct `_ref` values
5. Verifies all products have valid images

**Expected Output**:
```
🔧 Fixing Product Image References...

1️⃣  Fetching products...
   Found 15 products

2️⃣  Image Status:
   ✅ Products with images: 10
   ❌ Products without images: 5

3️⃣  Found 15 image files in directory

4️⃣  Uploading missing images...
   📤 Uploading: fresh-oyster-mushrooms.webp...
   ✅ Linked to: Fresh Oyster Mushrooms
   
   📤 Uploading: fresh-shiitake-mushrooms.webp...
   ✅ Linked to: Fresh Shiitake Mushrooms
   
   [... continues for all 5 products ...]

✅ Image fix complete!
   Total products: 15
   Fixed: 5
   Already had images: 10
```

**Verification**:
```
🔍 Verifying Product Images...

📦 Total products: 15

1. ✅ Fresh Oyster Mushrooms - Has valid image
2. ✅ Fresh King Oyster Mushrooms - Has valid image
[... all 15 products ...]

📊 Summary:
   ✅ Valid images: 15/15
   ❌ Missing images: 0/15

✅ All products have valid images!
```

**Manual Studio Check**:
1. Open Studio: `cd studio && npm run dev`
2. Visit: http://localhost:3333
3. Navigate to: Products → Select any product
4. Verify: Image displays (no "Invalid image value" error)
5. Check: All 15 products have images

**Success Criteria**:
- [ ] verify-images.js shows 15/15 valid images
- [ ] No "Invalid image value" errors in Studio
- [ ] All product images load correctly
- [ ] Image asset references valid in Sanity database

**Time**: 10 minutes

---

### **Phase 2: Import Product Variants** (15 minutes)

**Goal**: Add 15 size/weight options to 5 products

**Variants to Create**:

| Product | Small | Medium | Large |
|---------|-------|--------|-------|
| Fresh Oyster | 250g - ₱350 | 500g - ₱650 | 1kg - ₱1200 |
| Fresh Shiitake | 200g - ₱450 | 400g - ₱850 | 800g - ₱1600 |
| Dried Shiitake | 50g - ₱680 | 100g - ₱1280 | 250g - ₱3000 |
| Mushroom Powder | 100g - ₱480 | 250g - ₱1100 | 500g - ₱2000 |
| Oyster Growing Kit | Small - ₱1200 | Medium - ₱2000 | Large - ₱3500 |

**Total Variants**: 15 (5 products × 3 sizes each)

**Execution**:
```powershell
# Import variants
node scripts\sanity\import-variants.js

# Verify import
node scripts\sanity\verify-variants.js
```

**Expected Output**:
```
🎨 Importing Product Variants to Sanity...

   Current variants in Sanity: 0
   
1️⃣  Fetching products to link variants...
   Found 15 products in Sanity
   
2️⃣  Loading variant data...
   Found 15 variants in JSON file
   
3️⃣  Creating variants...
   ✅ Created: Fresh Oyster Mushrooms - Small (250g)
   ✅ Created: Fresh Oyster Mushrooms - Medium (500g)
   ✅ Created: Fresh Oyster Mushrooms - Large (1kg)
   [... continues for all 15 variants ...]

✅ Import complete!
   Created: 15 variants
   Skipped: 0 (duplicates)
```

**Success Criteria**:
- [ ] 15 variants imported successfully
- [ ] 5 products show "Has Variants = true"
- [ ] Each product has exactly 3 variants
- [ ] All variant prices and SKUs correct

**Time**: 15 minutes

---

### **Phase 3: Link Product Relationships** (15 minutes)

**Goal**: Connect all 15 products with smart suggestions and bundles

**What Gets Linked**:
- **Suggested Products**: 5-8 per product ("You May Also Like")
- **Complementary Products**: 3-4 per product ("Frequently Bought Together")
- **Related Bundles**: 1-2 bundles per product

**Execution**:
```powershell
# Link relationships
node scripts\sanity\link-relationships.js
```

**Expected Output**:
```
🔗 Linking Product Relationships in Sanity...

1️⃣  Fetching products...
   Found 15 products in Sanity

2️⃣  Creating product slug to ID map...
   Mapped 15 products

3️⃣  Loading relationship data...
   Found relationships for 15 products

4️⃣  Linking relationships...
   
   ✅ Fresh Oyster Mushrooms
      - Suggested: 5 products
      - Complementary: 3 products
      - Bundles: 2 bundles

✅ Relationship linking complete!
   Products updated: 15/15
```

**Success Criteria**:
- [ ] All 15 products have suggestedProducts linked
- [ ] All 15 products have complementaryProducts linked
- [ ] All references clickable in Studio

**Time**: 15 minutes

---

### **Phase 4: Import Product Bundles** (10 minutes)

**Goal**: Create 6 product bundles with savings

**Bundles**:
1. Gourmet Fresh Starter Pack (₱950, save ₱150)
2. Dried Collection Bundle (₱1,440, save ₱360)
3. Health & Wellness Pack (₱2,300, save ₱400)
4. Complete Growing Set (₱4,500, save ₱800)
5. Ultimate Collection (₱3,500, save ₱700)
6. Beginner's Combo (₱1,900, save ₱300)

**Execution**:
```powershell
# Import bundles
node scripts\sanity\import-bundles.js
```

**Success Criteria**:
- [ ] 6 bundles imported successfully
- [ ] All bundles have 2-6 product references
- [ ] Pricing calculations correct

**Time**: 10 minutes

---

### **Phase 5: Import Customer Reviews** (10 minutes)

**Goal**: Add 45 reviews (3 per product, 4-5 stars)

**Execution**:
```powershell
# Import reviews
node scripts\sanity\import-reviews.js
```

**Success Criteria**:
- [ ] 45 reviews imported successfully
- [ ] Each product has exactly 3 reviews
- [ ] All reviews pre-approved

**Time**: 10 minutes

---

### **Phase 6: Comprehensive Testing** (30 minutes)

**Goal**: Verify all data connected correctly

**Run All Tests**:
```powershell
# Automated tests
node scripts\sanity\run-all-tests.js

# Manual Studio check
cd studio
npm run dev
# Visit http://localhost:3333
```

**8 Automated Tests**:
1. Connection test
2. Document count (84 total)
3. Image verification (15/15)
4. Category links (15/15)
5. Variant links (15 variants)
6. Relationships (15 products)
7. Bundle links (6 bundles)
8. Review links (45 reviews)

**Success Criteria**:
- [ ] All 8 automated tests pass
- [ ] Manual Studio verification complete
- [ ] 84 documents verified

**Time**: 30 minutes

---

### **Phase 7: Deploy Studio to Production** (20 minutes)

**Goal**: Deploy to Sanity hosting

**Fix Project ID First**:
Check `studio/sanity.config.ts` → Verify `projectId: "gerattrr"`

**Deploy**:
```powershell
cd studio

# Build
npm run build

# Deploy
npm run deploy
```

**Expected**: Studio URL returned (e.g., `https://gerattrr.sanity.studio`)

**Verification**:
- [ ] Studio loads at production URL
- [ ] Can login
- [ ] All 84 documents visible
- [ ] No errors

**Time**: 20 minutes

---

## 📋 Quick Start Command Sequence

Copy-paste this entire block for rapid execution:

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Phase 0: Pre-Flight (5 min)
node scripts\sanity\test-connection.js

# Phase 1: Fix Images (10 min)
node scripts\sanity\fix-product-images.js
node scripts\sanity\verify-images.js

# Phase 2: Variants (15 min)
node scripts\sanity\import-variants.js
node scripts\sanity\verify-variants.js

# Phase 3: Relationships (15 min)
node scripts\sanity\link-relationships.js

# Phase 4: Bundles (10 min)
node scripts\sanity\import-bundles.js

# Phase 5: Reviews (10 min)
node scripts\sanity\import-reviews.js

# Phase 6: Testing (30 min)
node scripts\sanity\run-all-tests.js

# Manual check
cd studio
npm run dev

# Phase 7: Deploy (20 min)
npm run build
npm run deploy
```

**Total**: 115 minutes

---

## ✅ Success Criteria

**Final State**:
- [ ] 84 documents in Sanity (3+15+15+6+45)
- [ ] All 8 automated tests pass
- [ ] Studio deployed to production
- [ ] No errors in console
- [ ] All relationships functional

---

## 🆘 Troubleshooting

**Image errors persist**:
```powershell
node scripts\sanity\delete-products.js
node scripts\sanity\import-products.js
node scripts\sanity\fix-product-images.js
```

**Import fails**:
- Check product slugs match JSON
- Verify parent documents exist first
- Re-run test-connection.js

**Deployment fails**:
- Fix projectId in sanity.config.ts → "gerattrr"
- Re-run npm run deploy

---

## 📈 Progress Tracking

```
✅ Phase 0: Pre-Flight      ████████████████████ 100%
⏳ Phase 1: Fix Images       ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% 🔴 NEXT
⏳ Phase 2: Variants         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%
⏳ Phase 3: Relationships    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%
⏳ Phase 4: Bundles          ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%
⏳ Phase 5: Reviews          ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%
⏳ Phase 6: Testing          ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%
⏳ Phase 7: Deployment       ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0%

Overall: ██████████████⬜⬜⬜⬜⬜⬜ 70% → 100%
```

---

## 🎉 Final Checklist

- [ ] Images fixed (15/15)
- [ ] Variants imported (15)
- [ ] Relationships linked (15)
- [ ] Bundles imported (6)
- [ ] Reviews imported (45)
- [ ] All tests pass (8/8)
- [ ] Studio deployed
- [ ] Production accessible

---

**🚀 Start Now**: `node scripts\sanity\fix-product-images.js`

**Last Updated**: November 26, 2025
