# 🍄 MASH Sanity CMS - Master Execution Plan

**Created**: November 26, 2025  
**Project**: PP_Namias (gerattrr) - Complete E-Commerce CMS  
**Status**: 70% Complete → Target 100% (Estimated: 2-3 hours)  
**Sanity Studio**: https://pp-namias.sanity.studio

---

## 📊 **EXECUTIVE SUMMARY**

### **Current State (70% Complete)**

✅ **Completed**:
- Schema structure (17 document types)
- Infrastructure scripts (sanity-client.js library)
- Categories imported (3)
- Products imported (15)
- Images collected (15 files)
- All data files prepared (variants, bundles, reviews, relationships)

⚠️ **Pending**:
- Fix product image references (CRITICAL - 10 min)
- Import variants, bundles, reviews (1 hour)
- Link product relationships (15 min)
- Comprehensive testing (30 min)
- Production deployment (20 min)

---

## 📋 **COMPLETE SCHEMA INVENTORY**

### **17 Document Types in Your Sanity Studio**

#### **Core E-Commerce (8 types)** - PRIMARY FOCUS
1. **`category`** - Product categories (3 imported)
2. **`product`** - Products (15 imported) ⚠️ Image fix needed
3. **`productVariant`** - Size/weight options (0 - needs import)
4. **`productBundle`** - Product bundles (0 - needs import)
5. **`review`** - Customer reviews (0 - needs import)
6. **`order`** - Customer orders (managed by backend)
7. **`coupon`** - Discount codes (managed by admin)
8. **`promotion`** - Marketing campaigns (managed by admin)

#### **Content Management (3 types)** - SECONDARY
9. **`page`** - CMS pages (About, Contact)
10. **`post`** - Blog posts
11. **`person`** - Team members/authors

#### **Marketing (2 types)** - TERTIARY
12. **`emailCampaign`** - Email marketing
13. **`analytics`** - Reports

#### **Singletons (3 types)** - CONFIGURED ONCE
14. **`settings`** - Site-wide settings
15. **`heroCarousel`** - Homepage hero
16. **`featuredProducts`** - Homepage featured section

---

## 🎯 **PHASE-BY-PHASE EXECUTION PLAN**

### **PHASE 0: Pre-Flight Check (5 minutes)**

**Goal**: Verify environment and data integrity

```powershell
# Navigate to project
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Test connection
node scripts\sanity\test-connection.js

# Verify data files exist
dir data\sanity\*.json
dir data\sanity\images\*.webp
dir data\sanity\images\*.jpg
```

**Success Criteria**:
- ✅ Connection to Sanity successful
- ✅ 6 JSON files present
- ✅ 15 image files present
- ✅ Environment variables loaded

---

### **PHASE 1: Fix Product Images (10 minutes)** 🔴 CRITICAL

**Goal**: Resolve "Invalid image value" error in Studio

**Problem**: Products showing image errors due to broken asset references

**Solution**:
```powershell
node scripts\sanity\fix-product-images.js
```

**What It Does**:
1. Fetches all 15 products from Sanity
2. Identifies products with missing/invalid image references
3. Re-uploads images from `data/sanity/images/`
4. Updates product documents with correct asset IDs
5. Verifies all products have valid images

**Expected Output**:
```
🔧 Fixing Product Image References...
1️⃣  Fetching products... Found 15 products
2️⃣  Image Status: ✅ 10 with images | ❌ 5 without images
3️⃣  Found 15 image files in directory
4️⃣  Uploading missing images...
   📤 fresh-oyster-mushrooms.webp → ✅ Linked
   📤 dried-shiitake-mushrooms.jpg → ✅ Linked
   [... 13 more ...]
✅ Image fix complete! Total: 15, Fixed: 5
```

**Verification**:
```powershell
node scripts\sanity\verify-images.js
```

**Success Criteria**:
- [ ] All 15 products have valid image references
- [ ] No "Invalid image value" errors in Studio
- [ ] Images display correctly in Studio preview

---

### **PHASE 2: Import Product Variants (15 minutes)**

**Goal**: Add 15 size/weight options to 5 products

**Data File**: `data/sanity/variants.json` (333 lines, validated ✅)

**Products with Variants**:
1. Fresh Oyster Mushrooms → Small (250g), Medium (500g), Large (1kg)
2. Fresh Shiitake Mushrooms → Small (200g), Medium (400g), Large (800g)
3. Dried Shiitake Mushrooms → Small (50g), Medium (100g), Large (250g)
4. Mushroom Powder → Small (100g), Medium (250g), Large (500g)
5. Oyster Growing Kit → Small, Medium, Large

**Execute**:
```powershell
node scripts\sanity\import-variants.js
```

**Expected Output**:
```
🎨 Importing Product Variants to Sanity...
   Current variants: 0
   Fetching products... Found 15 products
   Variants to import: 15
   Importing variants...
   ✅ fresh-oyster-mushrooms-small-250g created
   ✅ fresh-oyster-mushrooms-medium-500g created
   [... 13 more ...]
✅ Successfully imported: 15/15 variants
```

**Verification**:
```powershell
node scripts\sanity\verify-variants.js
```

**Manual Check**:
1. Open Studio: http://localhost:3333
2. Navigate to: Products → "Fresh Oyster Mushrooms"
3. Check "Has Variants" toggle is ON
4. Check "Variants" field shows 3 references
5. Click variant → See details (price, SKU, stock)

**Success Criteria**:
- [ ] 15 variants imported (verify-variants.js passes)
- [ ] 5 products show "Has Variants" enabled
- [ ] Default variants set correctly
- [ ] Pricing and stock accurate

---

### **PHASE 3: Link Product Relationships (15 minutes)**

**Goal**: Connect products with smart suggestions

**Data File**: `data/sanity/relationships.json` (228 lines, validated ✅)

**Relationship Types**:
1. **Suggested Products** (5-8 per product) - "You May Also Like"
2. **Complementary Products** (3-4 per product) - "Frequently Bought Together"
3. **Related Bundles** (1-2 per product) - Package deals

**Example Relationships**:
- Fresh Oyster → Suggests: Shiitake, King Oyster, Dried Oyster, Growing Kit
- Fresh Oyster → Complements: Dried Shiitake, Mushroom Extract, Button
- Fresh Oyster → Bundles: Gourmet Fresh Starter Pack, Ultimate Collection

**Execute**:
```powershell
node scripts\sanity\link-relationships.js
```

**Expected Output**:
```
🔗 Linking Product Relationships in Sanity...
1️⃣  Fetching products... Found 15 products
2️⃣  Reading relationships.json... 15 products to link
3️⃣  Linking relationships...
   ✅ fresh-oyster-mushrooms: 8 suggested, 4 complementary
   ✅ fresh-shiitake-mushrooms: 7 suggested, 3 complementary
   [... 13 more ...]
✅ Linked relationships for 15 products
```

**Manual Check**:
1. Open Studio → Products → "Fresh Oyster Mushrooms"
2. Scroll to "Suggested Products (You May Also Like)"
3. See 5-8 product references
4. Check "Complementary Products (Frequently Bought Together)"
5. See 3-4 product references
6. All references should be clickable

**Success Criteria**:
- [ ] All 15 products have suggested products linked
- [ ] All 15 products have complementary products linked
- [ ] Bundle relationships linked where applicable
- [ ] No broken references (all slugs resolve)

---

### **PHASE 4: Import Product Bundles (10 minutes)**

**Goal**: Create 6 product bundles with savings

**Data File**: `data/sanity/bundles.json` (156 lines, validated ✅)

**Bundles to Create**:
1. **Gourmet Fresh Starter Pack** - 3 fresh mushrooms (₱950, save ₱150 / 15% off)
2. **Dried Collection Bundle** - 3 dried varieties (₱1440, save ₱360 / 25% off)
3. **Health & Wellness Pack** - Lion's Mane + Extract + Powder (₱2300, save ₱400 / 20% off)
4. **Complete Growing Set** - 3 growing kits (₱4500, save ₱800 / 18% off)
5. **Ultimate Mushroom Collection** - 6 products (₱3500, save ₱700 / 20% off)
6. **Beginner's Combo** - 2 fresh + 1 kit (₱1900, save ₱300 / 15% off)

**Execute**:
```powershell
node scripts\sanity\import-bundles.js
```

**Expected Output**:
```
🎁 Importing Product Bundles to Sanity...
   Current bundles: 0
   Fetching products... Found 15 products
   Bundles to import: 6
   Importing bundles...
   ✅ gourmet-fresh-starter-pack created (3 products, ₱950, save ₱150)
   ✅ dried-collection-bundle created (3 products, ₱1440, save ₱360)
   [... 4 more ...]
✅ Successfully imported: 6/6 bundles
```

**Manual Check**:
1. Open Studio → Product Bundles
2. See 6 bundles listed
3. Click "Gourmet Fresh Starter Pack"
4. Check "Products in Bundle" has 3 product references
5. Verify pricing: Bundle Price ₱950 < Sum of individual prices
6. Check "Bundle Active" toggle is ON

**Success Criteria**:
- [ ] 6 bundles created
- [ ] All product references valid
- [ ] Savings calculations accurate (15-30% off)
- [ ] Bundle images uploaded
- [ ] All bundles marked active

---

### **PHASE 5: Import Product Reviews (10 minutes)**

**Goal**: Add 45 customer reviews (3 per product, 4-5 stars)

**Data File**: `data/sanity/reviews.json` (549 lines, validated ✅)

**Review Distribution**:
- 15 products × 3 reviews each = 45 total
- Rating mix: 4-5 stars (realistic positive feedback)
- Mix of English and Filipino reviews
- All marked "Verified Purchase"
- All pre-approved (status: "approved")

**Sample Reviews**:
- Fresh Oyster (5⭐): "Fresh and delicious! Delivered same day. Perfect for stir-fry."
- Shiitake Growing Kit (5⭐): "Super saya! My kids loved watching the mushrooms grow."
- Dried Shiitake (4⭐): "Good quality but a bit pricey. Worth it for the flavor."

**Execute**:
```powershell
node scripts\sanity\import-reviews.js
```

**Expected Output**:
```
⭐ Importing Product Reviews to Sanity...
   Current reviews: 0
   Fetching products... Found 15 products
   Reviews to import: 45
   Importing reviews...
   ✅ Review for fresh-oyster-mushrooms (5 stars) created
   ✅ Review for fresh-oyster-mushrooms (5 stars) created
   ✅ Review for fresh-oyster-mushrooms (4 stars) created
   [... 42 more ...]
✅ Successfully imported: 45/45 reviews
```

**Manual Check**:
1. Open Studio → Product Reviews
2. See 45 reviews listed
3. Filter by product → Each product has exactly 3 reviews
4. Check all reviews show "✅ Approved" status
5. Verify ratings: Mix of 4-5 stars
6. Check "Verified Purchase" is true for all

**Success Criteria**:
- [ ] 45 reviews imported
- [ ] Each product has 3 reviews
- [ ] All reviews approved
- [ ] Rating distribution realistic (4-5 stars)
- [ ] Mix of English/Filipino content

---

### **PHASE 6: Comprehensive Validation (30 minutes)**

**Goal**: Verify all data is connected and working

#### **6.1: Script-Based Validation (15 min)**

```powershell
# Test connection
node scripts\sanity\test-connection.js

# Verify images
node scripts\sanity\verify-images.js

# Verify variants
node scripts\sanity\verify-variants.js

# Check document counts
node scripts\sanity\count-documents.js
```

**Expected Totals**:
- Categories: 3
- Products: 15
- Variants: 15
- Bundles: 6
- Reviews: 45
- **Total Documents**: 84

#### **6.2: Studio Manual Check (15 min)**

```powershell
cd studio
npm run dev
# Opens http://localhost:3333
```

**Validation Checklist**:

**Categories (3)**:
- [ ] Fresh Mushrooms (6 products)
- [ ] Dried Mushrooms (3 products)
- [ ] Growing Kits & Accessories (6 products)

**Products (15)**:
- [ ] All have main images (no "Invalid image value" errors)
- [ ] All have category references
- [ ] All have pricing (₱200-₱2000 range)
- [ ] All have stock quantities (50-200 units)
- [ ] Fresh products have "Same-Day Delivery Available" enabled
- [ ] All have suggested products linked (5-8 each)
- [ ] All have complementary products linked (3-4 each)

**Variants (15)**:
- [ ] 5 products show "Has Variants" enabled
- [ ] Fresh Oyster has 3 variants (Small, Medium, Large)
- [ ] Fresh Shiitake has 3 variants
- [ ] Dried Shiitake has 3 variants
- [ ] Mushroom Powder has 3 variants
- [ ] Oyster Growing Kit has 3 variants
- [ ] Default variants set correctly

**Bundles (6)**:
- [ ] All have product references (2-6 products each)
- [ ] All show savings calculations (₱150-₱800)
- [ ] All have discount percentages (15-30%)
- [ ] All marked "Bundle Active"
- [ ] Featured bundles enabled

**Reviews (45)**:
- [ ] Each product has 3 reviews
- [ ] All show "✅ Approved" status
- [ ] Ratings visible (4-5 stars)
- [ ] Verified purchase badges present
- [ ] Mix of English/Filipino content

**Relationships**:
- [ ] Product pages show "You May Also Like" section
- [ ] Product pages show "Frequently Bought Together"
- [ ] Bundle references work (clickable)

#### **6.3: Frontend Integration Test (Optional)**

```powershell
# In main project directory
npm run dev
# Opens http://localhost:3000
```

**Test**:
1. Visit /shop → See 15 products with images
2. Click product → See variants, suggested products, reviews
3. Check "You May Also Like" section
4. Check "Frequently Bought Together" section
5. Navigate to bundles section

---

### **PHASE 7: Studio Deployment (20 minutes)**

**Goal**: Deploy Sanity Studio to production

#### **7.1: Build Studio (5 min)**

```powershell
cd studio

# Build production Studio
npm run build
```

**Expected Output**:
```
✔ Compiling Sanity Studio...
✔ Build complete in 120s
✔ Output directory: dist/
```

#### **7.2: Deploy to Sanity Hosting (10 min)**

```powershell
npm run deploy
```

**During Deployment**:
1. Command asks: "Deploy Studio to production?"
2. Type: **y** (yes)
3. Wait 2-3 minutes for upload
4. Get deployment URL: `https://pp-namias.sanity.studio`

**Expected Output**:
```
Deploying Sanity Studio...
✔ Uploading build artifacts...
✔ Deployed to: https://pp-namias.sanity.studio
✔ Deployment complete!
```

#### **7.3: Verify Production Studio (5 min)**

**Visit**: https://pp-namias.sanity.studio

**Checklist**:
- [ ] Studio loads (login required)
- [ ] All 17 document types visible in sidebar
- [ ] Products display correctly with images
- [ ] Bundles, reviews, variants accessible
- [ ] Can create/edit documents
- [ ] Search works
- [ ] No console errors

---

## 🧪 **TESTING STRATEGY**

### **Automated Tests (Scripts)**

Create: `scripts/sanity/run-all-tests.js`

```javascript
/**
 * Run All Sanity CMS Tests
 * Validates entire CMS setup
 */

const { testConnection } = require('./lib/sanity-client');
const { verifyImages } = require('./verify-images');
const { verifyVariants } = require('./verify-variants');

async function runAllTests() {
  console.log('🧪 Running Comprehensive Sanity CMS Tests...\n');

  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Image Verification', fn: verifyImages },
    { name: 'Variant Verification', fn: verifyVariants },
    { name: 'Document Count', fn: verifyDocumentCounts },
    { name: 'Relationship Links', fn: verifyRelationships },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Running: ${test.name}...`);
      await test.fn();
      console.log(`✅ ${test.name} PASSED\n`);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name} FAILED:`, error.message, '\n');
      failed++;
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(failed > 0 ? 1 : 0);
}

async function verifyDocumentCounts() {
  const client = require('./lib/sanity-client').client;
  
  const counts = {
    categories: await client.fetch('count(*[_type == "category"])'),
    products: await client.fetch('count(*[_type == "product"])'),
    variants: await client.fetch('count(*[_type == "productVariant"])'),
    bundles: await client.fetch('count(*[_type == "productBundle"])'),
    reviews: await client.fetch('count(*[_type == "review"])'),
  };

  const expected = {
    categories: 3,
    products: 15,
    variants: 15,
    bundles: 6,
    reviews: 45,
  };

  Object.keys(expected).forEach(type => {
    if (counts[type] !== expected[type]) {
      throw new Error(`${type}: expected ${expected[type]}, got ${counts[type]}`);
    }
  });

  console.log('   Document counts match expected values');
}

async function verifyRelationships() {
  const client = require('./lib/sanity-client').client;
  
  const productsWithRelations = await client.fetch(`
    *[_type == "product"] {
      name,
      "suggestedCount": count(suggestedProducts),
      "complementaryCount": count(complementaryProducts)
    }
  `);

  productsWithRelations.forEach(product => {
    if (product.suggestedCount < 3) {
      throw new Error(`${product.name}: insufficient suggested products (${product.suggestedCount})`);
    }
    if (product.complementaryCount < 2) {
      throw new Error(`${product.name}: insufficient complementary products (${product.complementaryCount})`);
    }
  });

  console.log('   All products have sufficient relationships');
}

runAllTests();
```

**Run Tests**:
```powershell
node scripts\sanity\run-all-tests.js
```

---

## 📈 **PROGRESS TRACKING**

### **Update After Each Phase**

```
Phase 0: Pre-Flight Check   ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (5 min)
Phase 1: Fix Images         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (10 min)
Phase 2: Import Variants    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (15 min)
Phase 3: Link Relationships ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (15 min)
Phase 4: Import Bundles     ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (10 min)
Phase 5: Import Reviews     ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (10 min)
Phase 6: Validation         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (30 min)
Phase 7: Deployment         ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% (20 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Progress: ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜  0% → 100%
Total Time: 0 min / 115 min (1 hour 55 minutes)
```

---

## 🚀 **QUICK START COMMAND SEQUENCE**

**Copy-paste these commands in order**:

```powershell
# Navigate to project
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Phase 0: Pre-Flight Check (5 min)
node scripts\sanity\test-connection.js

# Phase 1: Fix Images (10 min)
node scripts\sanity\fix-product-images.js
node scripts\sanity\verify-images.js

# Phase 2: Import Variants (15 min)
node scripts\sanity\import-variants.js
node scripts\sanity\verify-variants.js

# Phase 3: Link Relationships (15 min)
node scripts\sanity\link-relationships.js

# Phase 4: Import Bundles (10 min)
node scripts\sanity\import-bundles.js

# Phase 5: Import Reviews (10 min)
node scripts\sanity\import-reviews.js

# Phase 6: Validation (30 min)
node scripts\sanity\run-all-tests.js
cd studio && npm run dev
# Manual check at http://localhost:3333

# Phase 7: Deployment (20 min)
cd studio
npm run build
npm run deploy
# Visit https://pp-namias.sanity.studio
```

**Total Time**: 1 hour 55 minutes

---

## ✅ **SUCCESS CRITERIA**

### **You're Done When:**

**In Sanity Studio** (`https://pp-namias.sanity.studio`):

1. **84 Total Documents**:
   - 3 categories ✅
   - 15 products ✅
   - 15 variants ✅
   - 6 bundles ✅
   - 45 reviews ✅

2. **All Products**:
   - Have valid images (no errors)
   - Linked to categories
   - Have pricing and stock
   - Fresh products have delivery options
   - All have 5-8 suggested products
   - All have 3-4 complementary products

3. **Frontend Works**:
   - Products display with images
   - Variants show on product pages
   - Reviews display
   - "You May Also Like" section populated
   - Bundles accessible

4. **Studio Deployed**:
   - Accessible at https://pp-namias.sanity.studio
   - Login works
   - All document types visible
   - Can create/edit content

---

## 🆘 **TROUBLESHOOTING**

### **Issue: Image upload fails**

**Error**: `Failed to upload image: Network error`

**Solution**:
```powershell
# Check token permissions
echo $env:SANITY_API_WRITE_TOKEN

# Re-run with verbose logging
$env:DEBUG="*"
node scripts\sanity\fix-product-images.js
```

### **Issue: Import script fails with "reference not found"**

**Error**: `Product with slug 'xyz' not found`

**Solution**:
```powershell
# Verify product slugs match
node scripts\sanity\test-connection.js

# Check data file slugs
type data\sanity\relationships.json | findstr "slug"

# Re-import products if needed
node scripts\sanity\delete-products.js
node scripts\sanity\import-products.js
```

### **Issue: Studio deployment fails**

**Error**: `Build failed: Module not found`

**Solution**:
```powershell
cd studio

# Clear cache and reinstall
del /s /q node_modules
del package-lock.json
npm install

# Rebuild
npm run build
npm run deploy
```

### **Issue: Relationships not linking**

**Error**: `Cannot patch document: Invalid reference`

**Solution**:
```powershell
# Ensure products exist first
node scripts\sanity\verify-products.js

# Check relationship file format
type data\sanity\relationships.json

# Re-run with --force flag
node scripts\sanity\link-relationships.js --force
```

---

## 📚 **DOCUMENTATION TO KEEP**

### **Essential Files (Keep)**:
1. ✅ **SANITY_MASTER_EXECUTION_PLAN.md** (this file) - Complete guide
2. ✅ **SANITY_SCHEMA_REFERENCE.md** - Schema documentation
3. ✅ **SANITY_TESTING_DEPLOYMENT.md** - Testing procedures

### **Archive (Move to .archive/ folder)**:
- ❌ SANITY_AUTOMATION_SUMMARY.md (superseded)
- ❌ SANITY_CMS_COMPLETE_WORKFLOW.md (superseded)
- ❌ SANITY_CMS_CURRENT_STATUS.md (superseded)
- ❌ SANITY_CMS_MASTER_PLAN.md (superseded)
- ❌ SANITY_MIGRATION_PLAN.md (migration complete)
- ❌ SANITY_QUICK_START.md (superseded)
- ❌ SANITY_COMPLETE_ACTION_PLAN.md (superseded by this)

---

## 🎉 **FINAL CHECKLIST**

**Mark each as complete**:

**Data Import**:
- [ ] Images fixed (no Studio errors)
- [ ] 15 variants imported
- [ ] All relationships linked
- [ ] 6 bundles imported
- [ ] 45 reviews imported

**Validation**:
- [ ] Test connection passes
- [ ] Image verification passes
- [ ] Variant verification passes
- [ ] Document counts correct (84 total)
- [ ] Relationships verified
- [ ] Studio loads without errors

**Deployment**:
- [ ] Production build successful
- [ ] Studio deployed to https://pp-namias.sanity.studio
- [ ] Public Studio accessible
- [ ] Login works
- [ ] All 17 document types visible
- [ ] Can create/edit content

**Documentation**:
- [ ] Progress bars updated to 100%
- [ ] Session logs recorded
- [ ] Outdated docs archived
- [ ] Final state documented

---

**🚀 Ready to Execute?**

**Start Now**: `node scripts\sanity\test-connection.js`

**Follow**: Phase-by-phase plan above (115 minutes total)

**Need Help?**: Check Troubleshooting section

---

**Last Updated**: November 26, 2025  
**Next Review**: After Phase 7 completion
