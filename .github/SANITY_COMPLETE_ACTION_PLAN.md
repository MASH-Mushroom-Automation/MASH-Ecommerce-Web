# 🍄 MASH Sanity CMS - Complete Action Plan

**Date**: November 26, 2025  
**Status**: 70% Complete - Final Push to 100%  
**Time Required**: 1.5 hours (10 min fix + 1 hour imports + 20 min validation/deploy)

---

## 📊 **CURRENT STATE - WHAT WE HAVE**

### ✅ **Completed (Phases 1-5)**

```
✅ Phase 1: Script Infrastructure (scripts/sanity/lib/sanity-client.js)
✅ Phase 2: Categories Import (3 categories in Sanity)
✅ Phase 3: Products Import (15 products in Sanity)
✅ Phase 4: Images Upload (15 images in data/sanity/images/)
✅ Phase 5: Variants Data (15 variants ready in data/sanity/variants.json)
```

### 📦 **Data Files Ready (100%)**

All JSON files created and validated:

| File | Items | Status |
|------|-------|--------|
| `data/sanity/categories.json` | 3 | ✅ IMPORTED |
| `data/sanity/products.json` | 15 | ✅ IMPORTED |
| `data/sanity/variants.json` | 15 | ✅ READY TO IMPORT |
| `data/sanity/bundles.json` | 6 | ✅ READY TO IMPORT |
| `data/sanity/reviews.json` | 45 | ✅ READY TO IMPORT |
| `data/sanity/relationships.json` | 15 products | ✅ READY TO IMPORT |

### 🛠️ **Scripts Ready (100%)**

All import scripts exist and tested:

| Script | Purpose | Status |
|--------|---------|--------|
| `scripts/sanity/test-connection.js` | Test API | ✅ WORKING |
| `scripts/sanity/import-categories.js` | Import categories | ✅ USED |
| `scripts/sanity/import-products.js` | Import products | ✅ USED |
| `scripts/sanity/upload-images.js` | Upload images | ✅ USED |
| `scripts/sanity/import-variants.js` | Import variants | ✅ READY |
| `scripts/sanity/import-bundles.js` | Import bundles | ✅ READY |
| `scripts/sanity/import-reviews.js` | Import reviews | ✅ READY |
| `scripts/sanity/link-relationships.js` | Link product refs | ✅ READY |
| `scripts/sanity/verify-images.js` | Verify images | ✅ READY |
| `scripts/sanity/verify-variants.js` | Verify variants | ✅ READY |
| `scripts/sanity/fix-product-images.js` | Fix image errors | ✅ READY |

---

## 🔴 **CRITICAL ISSUE - FIX FIRST (10 Minutes)**

### Problem: "Invalid image value" Error in Studio

**Symptoms**:
- Products showing "Invalid image value" in Sanity Studio
- Image asset references may be broken
- Need to re-upload or fix references

**Solution**: Run fix script

```powershell
# Navigate to project root
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Run fix script
node scripts\sanity\fix-product-images.js
```

**What It Does**:
1. Fetches all products from Sanity
2. Identifies products with missing/invalid images
3. Re-uploads images from `data/sanity/images/` directory
4. Updates product references with correct asset IDs
5. Verifies all 15 products have valid images

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
   [... continues for all products ...]

✅ Image fix complete!
   Total products: 15
   Fixed: 5
   Already had images: 10
```

---

## 🎯 **PHASE 6-10 EXECUTION PLAN (1 Hour 20 Minutes)**

### **Phase 6: Import Variants (15 minutes)**

**Goal**: Add 15 size/weight options to 5 products

```powershell
# Run import
node scripts\sanity\import-variants.js

# Verify
node scripts\sanity\verify-variants.js
```

**What Gets Created**:
- Fresh Oyster: Small (250g), Medium (500g), Large (1kg)
- Fresh Shiitake: Small (200g), Medium (400g), Large (800g)
- Dried Shiitake: Small (50g), Medium (100g), Large (250g)
- Mushroom Powder: Small (100g), Medium (250g), Large (500g)
- Oyster Growing Kit: Small, Medium, Large

**Verification Checklist**:
- [ ] All 15 variants imported
- [ ] Product references valid
- [ ] Default variants set correctly
- [ ] Prices and stock levels accurate

---

### **Phase 7: Link Relationships (15 minutes)**

**Goal**: Connect products with suggestions and bundles

```powershell
# Run relationship linking
node scripts\sanity\link-relationships.js
```

**What Gets Linked**:
- **Suggested Products**: 6-8 per product ("You May Also Like")
- **Complementary Products**: 3-4 per product ("Frequently Bought Together")
- **Related Bundles**: 1-2 bundles per product

**Example Relationships**:
- Fresh Oyster → Suggests: Shiitake, King Oyster, Dried Oyster, Growing Kit
- Fresh Oyster → Complements: Dried Shiitake, Mushroom Extract, Button
- Fresh Oyster → Bundles: Gourmet Fresh Starter Pack, Ultimate Collection

**Verification**:
- [ ] Open Studio → Products → Select "Fresh Oyster Mushrooms"
- [ ] Scroll to "Suggested Products" → See 5-8 products
- [ ] Scroll to "Complementary Products" → See 3-4 products
- [ ] All references clickable and valid

---

### **Phase 8: Import Bundles (10 minutes)**

**Goal**: Create 6 product bundles with savings

```powershell
# Run bundle import
node scripts\sanity\import-bundles.js
```

**Bundles Created**:
1. **Gourmet Fresh Starter Pack** - 3 fresh mushrooms (₱950, save ₱150)
2. **Dried Collection Bundle** - 3 dried varieties (₱1440, save ₱360)
3. **Health & Wellness Pack** - Lion's Mane + Extract + Powder (₱2300, save ₱400)
4. **Complete Growing Set** - 3 growing kits (₱4500, save ₱800)
5. **Ultimate Mushroom Collection** - 6 products (₱3500, save ₱700)
6. **Beginner's Combo** - 2 fresh + 1 kit (₱1900, save ₱300)

**Verification**:
- [ ] Studio → Product Bundles → See 6 items
- [ ] Check "Gourmet Fresh Starter Pack" → 3 products linked
- [ ] Verify discount percentages (15-30%)
- [ ] All bundles active and featured

---

### **Phase 9: Import Reviews (10 minutes)**

**Goal**: Add 45 customer reviews (3 per product)

```powershell
# Run review import
node scripts\sanity\import-reviews.js
```

**Reviews Distribution**:
- 15 products × 3 reviews each = 45 total
- Rating mix: 4-5 stars (realistic positive feedback)
- Mix of English and Filipino reviews
- Verified purchases: 100%
- Review status: All approved

**Sample Reviews**:
- Fresh Oyster: 5⭐ "Fresh and delicious!" | 5⭐ "Great quality!" | 4⭐ "Good but slightly expensive"
- Shiitake Growing Kit: 5⭐ "Easy to grow!" | 5⭐ "Fun family project" | 4⭐ "Takes patience"

**Verification**:
- [ ] Studio → Product Reviews → See 45 items
- [ ] Filter by product → Each product has 3 reviews
- [ ] All reviews approved
- [ ] Helpful votes displayed

---

### **Phase 10: Validation & Deployment (30 minutes)**

#### **Step 1: Run Comprehensive Validation (10 min)**

```powershell
# Test connection
node scripts\sanity\test-connection.js

# Verify images
node scripts\sanity\verify-images.js

# Verify variants
node scripts\sanity\verify-variants.js

# Manual Studio check
cd studio
npm run dev
# Open http://localhost:3333
```

**Validation Checklist**:

**Categories (3)**:
- [ ] Fresh Mushrooms (6 products)
- [ ] Dried Mushrooms (3 products)
- [ ] Growing Kits & Accessories (4 products + 2 specialty)

**Products (15)**:
- [ ] All have images (no "Invalid image value")
- [ ] All have category references
- [ ] All have pricing and stock
- [ ] Fresh products have delivery options

**Images (15)**:
- [ ] All products display main image
- [ ] Images load from Sanity CDN
- [ ] Alt text present for SEO

**Variants (15)**:
- [ ] 5 products have variants
- [ ] Default variants set
- [ ] Pricing correct

**Bundles (6)**:
- [ ] All have product references
- [ ] Savings calculations accurate
- [ ] Featured bundles active

**Reviews (45)**:
- [ ] 3 reviews per product
- [ ] All approved status
- [ ] Ratings visible (4-5 stars)

**Relationships**:
- [ ] Suggested products linked
- [ ] Complementary products linked
- [ ] Related bundles linked

#### **Step 2: Deploy Studio to Production (10 min)**

```powershell
cd studio

# Build production Studio
npm run build

# Deploy to Sanity hosting
npm run deploy
```

**During Deployment**:
1. Command will ask: "Deploy Studio to production?"
2. Type: **y** (yes)
3. Wait ~2-3 minutes for build + upload
4. Get deployment URL: `https://pp-namias.sanity.studio`

#### **Step 3: Verify Production Studio (10 min)**

**Visit**: <https://pp-namias.sanity.studio>

**Check**:
- [ ] Studio loads (login required)
- [ ] All 17 document types visible
- [ ] Products display correctly with images
- [ ] Bundles, reviews, variants accessible
- [ ] Can create/edit documents
- [ ] Real-time collaboration works

---

## 📈 **PROGRESS TRACKING**

### Current Progress: 70% → 100%

```
Phase 1: Infrastructure  ████████████████████ 100% ✅ COMPLETE
Phase 2: Categories      ████████████████████ 100% ✅ COMPLETE
Phase 3: Products        ████████████████████ 100% ✅ COMPLETE
Phase 4: Images          ████████████████████ 100% ✅ COMPLETE
Phase 5: Data Prep       ████████████████████ 100% ✅ COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 6: Variants        ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% 🟡 NEXT (15 min)
Phase 7: Relationships   ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% ⏳ (15 min)
Phase 8: Bundles         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% ⏳ (10 min)
Phase 9: Reviews         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% ⏳ (10 min)
Phase 10: Deploy         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% ⏳ (30 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall: ██████████████⬜⬜⬜⬜⬜⬜ 70% → Target: 100% (1.5 hours)
```

### **Update This As You Go**:

After each phase, mark complete:
- Change `0%` → `100%`
- Change `⬜⬜⬜...` → `████████████████████`
- Update "Overall" percentage

---

## 🚀 **QUICK START - DO NOW**

### **30-Second Command Sequence**

```powershell
# 1. Fix images (10 min)
node scripts\sanity\fix-product-images.js

# 2. Import variants (15 min)
node scripts\sanity\import-variants.js
node scripts\sanity\verify-variants.js

# 3. Link relationships (15 min)
node scripts\sanity\link-relationships.js

# 4. Import bundles (10 min)
node scripts\sanity\import-bundles.js

# 5. Import reviews (10 min)
node scripts\sanity\import-reviews.js

# 6. Validate (10 min)
node scripts\sanity\test-connection.js
node scripts\sanity\verify-images.js

# 7. Deploy (10 min)
cd studio
npm run build
npm run deploy
```

**Total Time**: 1 hour 20 minutes

---

## ✅ **SUCCESS CRITERIA**

### **You Know You're Done When**:

**In Sanity Studio** (`http://localhost:3333` or `https://pp-namias.sanity.studio`):

1. **Categories**: 3 categories visible
2. **Products**: 15 products with images, no errors
3. **Variants**: 15 variants across 5 products
4. **Bundles**: 6 bundles with product links
5. **Reviews**: 45 reviews (3 per product)
6. **Relationships**: Products show suggested items

**All Documents Count**: **84 items total**
- 3 categories
- 15 products  
- 15 product variants
- 6 bundles
- 45 reviews
- 1 settings (singleton)

---

## 📚 **DOCUMENTATION TO KEEP**

After completion, keep only these files:

### **Essential Docs**:
1. **SANITY_COMPLETE_ACTION_PLAN.md** (this file) - Master reference
2. **SANITY_SCHEMA_REFERENCE.md** - Complete schema documentation
3. **SANITY_TESTING_DEPLOYMENT.md** - Testing procedures

### **Archive/Delete** (outdated):
- ❌ SANITY_AUTOMATION_SUMMARY.md (superseded by this plan)
- ❌ SANITY_CMS_COMPLETE_WORKFLOW.md (superseded)
- ❌ SANITY_CMS_CURRENT_STATUS.md (superseded)
- ❌ SANITY_CMS_MASTER_PLAN.md (superseded)
- ❌ SANITY_MIGRATION_PLAN.md (migration done)
- ❌ SANITY_QUICK_START.md (superseded)

---

## 🆘 **TROUBLESHOOTING**

### **Issue**: Images still showing "Invalid image value"

**Solution**:
```powershell
# Delete all products and re-import
node scripts\sanity\delete-products.js
node scripts\sanity\import-products.js
node scripts\sanity\fix-product-images.js
```

### **Issue**: Import script fails with "reference not found"

**Solution**:
- Check product slugs match in JSON files
- Re-run `node scripts\sanity\test-connection.js`
- Verify parent documents exist first (categories before products)

### **Issue**: Studio deployment fails

**Solution**:
```powershell
# Clear build cache
cd studio
rm -rf node_modules/.cache
npm run build
npm run deploy
```

### **Issue**: Relationships not linking

**Solution**:
- Verify `data/sanity/relationships.json` has correct slugs
- Check products exist in Sanity before linking
- Re-run with verbose logging: `node scripts\sanity\link-relationships.js --verbose`

---

## 🎉 **FINAL CHECKLIST**

Mark each as complete:

**Data Import**:
- [ ] Images fixed (no errors in Studio)
- [ ] Variants imported (15 total)
- [ ] Relationships linked (all products connected)
- [ ] Bundles imported (6 active)
- [ ] Reviews imported (45 approved)

**Validation**:
- [ ] Test connection passes
- [ ] Image verification passes
- [ ] Variant verification passes
- [ ] Studio loads without errors
- [ ] All 84 documents visible

**Deployment**:
- [ ] Production build successful
- [ ] Studio deployed to <https://pp-namias.sanity.studio>
- [ ] Public Studio accessible
- [ ] Can login and edit content
- [ ] Real-time updates work (if enabled)

**Documentation**:
- [ ] Progress bars updated to 100%
- [ ] Outdated docs archived
- [ ] Session logs recorded
- [ ] Final state documented

---

**🚀 Ready to Execute? Start with:** `node scripts\sanity\fix-product-images.js`

**📞 Need Help?** Check SANITY_TESTING_DEPLOYMENT.md for detailed troubleshooting
