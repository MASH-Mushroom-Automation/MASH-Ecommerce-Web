# Sanity CMS Phases 5-10 Complete Implementation Guide

**Project**: PP_Namias Sanity CMS (gerattrr)  
**Created**: November 23, 2025  
**Current Progress**: Phase 4 Complete (65%) | Phase 5-10 Remaining (35%)  
**Estimated Time**: 3-4 hours to complete all remaining phases

---

## 📊 Progress Overview

```
✅ Phase 1: Infrastructure    (2h)     COMPLETE
✅ Phase 2: Categories         (25min)  COMPLETE
✅ Phase 3: Products           (1.5h)   COMPLETE
✅ Phase 4: Images             (30min)  COMPLETE
🟡 Phase 5: Variants           (45-60min) NEXT
⏳ Phase 6: Relationships     (1h)     PENDING
⏳ Phase 7: Bundles & Reviews (1h)     PENDING
⏳ Phase 8: Validation        (1h)     PENDING
⏳ Phase 9: Deployment        (30min)  PENDING
```

---

## 🎯 Phase 5: Product Variants (45-60 minutes) - NEXT

### Overview
Create size/weight options for 5 products (3 variants each = 15 total variants)

### Products with Variants

1. **Fresh Oyster Mushrooms** - 3 sizes (250g, 500g, 1kg)
2. **Fresh Shiitake Mushrooms** - 3 sizes (200g, 400g, 800g)
3. **Dried Shiitake Mushrooms** - 3 weights (50g, 100g, 250g)
4. **Mushroom Powder** - 3 weights (100g, 250g, 500g)
5. **Oyster Growing Kit** - 3 sizes (Small, Medium, Large)

### Step 1: Create Variants Data File (30 min)

Create `data/sanity/variants.json`:

```json
[
  {
    "_type": "productVariant",
    "productSlug": "fresh-oyster-mushrooms",
    "name": "Fresh Oyster Mushrooms - Small (250g)",
    "slug": {
      "_type": "slug",
      "current": "fresh-oyster-mushrooms-small-250g"
    },
    "variantName": "Small (250g)",
    "sku": "MUSH-OYSTER-250-SM",
    "variantType": "weight",
    "variantValue": "250g",
    "weight": 250,
    "weightUnit": "grams",
    "price": 350,
    "compareAtPrice": 450,
    "stockQuantity": 50,
    "lowStockThreshold": 10,
    "availableForPurchase": true,
    "defaultVariant": true,
    "sortOrder": 1
  },
  {
    "_type": "productVariant",
    "productSlug": "fresh-oyster-mushrooms",
    "name": "Fresh Oyster Mushrooms - Medium (500g)",
    "slug": {
      "_type": "slug",
      "current": "fresh-oyster-mushrooms-medium-500g"
    },
    "variantName": "Medium (500g)",
    "sku": "MUSH-OYSTER-500-MD",
    "variantType": "weight",
    "variantValue": "500g",
    "weight": 500,
    "weightUnit": "grams",
    "price": 650,
    "compareAtPrice": 850,
    "stockQuantity": 40,
    "lowStockThreshold": 10,
    "availableForPurchase": true,
    "defaultVariant": false,
    "sortOrder": 2
  },
  {
    "_type": "productVariant",
    "productSlug": "fresh-oyster-mushrooms",
    "name": "Fresh Oyster Mushrooms - Large (1kg)",
    "slug": {
      "_type": "slug",
      "current": "fresh-oyster-mushrooms-large-1kg"
    },
    "variantName": "Large (1kg)",
    "sku": "MUSH-OYSTER-1KG-LG",
    "variantType": "weight",
    "variantValue": "1kg",
    "weight": 1000,
    "weightUnit": "grams",
    "price": 1200,
    "compareAtPrice": 1500,
    "stockQuantity": 30,
    "lowStockThreshold": 5,
    "availableForPurchase": true,
    "defaultVariant": false,
    "sortOrder": 3
  }
  // ... 12 more variants (copy pattern above)
]
```

**Complete Variant List** (15 total):

| Product | Variant 1 | Variant 2 | Variant 3 |
|---------|-----------|-----------|-----------|
| Fresh Oyster | 250g (₱350) | 500g (₱650) | 1kg (₱1200) |
| Fresh Shiitake | 200g (₱400) | 400g (₱750) | 800g (₱1400) |
| Dried Shiitake | 50g (₱300) | 100g (₱550) | 250g (₱1300) |
| Mushroom Powder | 100g (₱800) | 250g (₱1800) | 500g (₱3400) |
| Oyster Growing Kit | Small (₱1200) | Medium (₱1500) | Large (₱1800) |

### Step 2: Create Import Script (30 min)

Create `scripts/sanity/import-variants.js`:

```javascript
/**
 * Import Product Variants to Sanity
 * Creates size/weight options for 5 products (15 variants total)
 */

const fs = require('fs');
const path = require('path');
const {createDocuments, countDocuments, fetchDocuments} = require('./lib/sanity-client');

async function importVariants() {
  console.log('📦 Importing Product Variants to Sanity...\n');

  try {
    // Check existing variants
    const existingCount = await countDocuments('productVariant');
    console.log(`   Current variants in Sanity: ${existingCount}`);

    // Fetch existing variant SKUs to prevent duplicates
    const existingVariants = await fetchDocuments('*[_type == "productVariant"]{ sku }');
    const existingSKUs = existingVariants.map(v => v.sku);
    console.log(`   Existing SKUs: ${existingSKUs.length || 'none'}`);

    // Load variant data
    const dataPath = path.join(__dirname, '../../data/sanity/variants.json');
    const allVariants = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Filter out variants that already exist (deduplication)
    const variants = allVariants.filter(v => !existingSKUs.includes(v.sku));
    console.log(`   Variants to import: ${variants.length} (${allVariants.length - variants.length} skipped)\n`);

    // Skip if no new variants to import
    if (variants.length === 0) {
      console.log('✅ All variants already exist. No import needed.\n');
      return;
    }

    // Fetch products to get IDs for references
    const products = await fetchDocuments('*[_type == "product"]{ _id, "slug": slug.current }');
    console.log(`   Found ${products.length} products for variant linking`);

    // Create product slug → ID map
    const productMap = products.reduce((map, product) => {
      map[product.slug] = {
        _type: 'reference',
        _ref: product._id
      };
      return map;
    }, {});

    // Add product references to variants
    const variantsWithRefs = variants.map(variant => {
      const productRef = productMap[variant.productSlug];
      if (!productRef) {
        console.warn(`   ⚠️  Warning: No product found for slug: ${variant.productSlug}`);
        return null;
      }

      // Remove productSlug (helper field) and add product reference
      const {productSlug, ...variantData} = variant;
      return {
        ...variantData,
        product: productRef
      };
    }).filter(Boolean); // Remove null entries

    console.log(`   Variants with references: ${variantsWithRefs.length}\n`);

    // Create variants
    console.log('   Creating variants...');
    const result = await createDocuments(variantsWithRefs);
    
    console.log(`\n✅ Successfully imported ${result.results.length} variants`);

    // Group by product for summary
    const variantsByProduct = variantsWithRefs.reduce((acc, v) => {
      const productSlug = variants.find(original => original.sku === v.sku)?.productSlug;
      if (!acc[productSlug]) acc[productSlug] = [];
      acc[productSlug].push(v.variantName);
      return acc;
    }, {});

    console.log('\n📊 Variants by Product:');
    Object.entries(variantsByProduct).forEach(([slug, names]) => {
      console.log(`   ${slug}: ${names.join(', ')}`);
    });

    // Verify
    const newCount = await countDocuments('productVariant');
    console.log(`\n📈 Total variants: ${existingCount} → ${newCount}\n`);

    console.log('✅ Variant import complete!');
    console.log('   Verify in Studio: http://localhost:3333 → Product Variants\n');
    console.log('🎉 Ready for Phase 6: Relationship Linking!');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run import
if (require.main === module) {
  importVariants()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {importVariants};
```

### Step 3: Test Import (5 min)

```powershell
node scripts\sanity\import-variants.js
```

**Expected Output:**
```
📦 Importing Product Variants to Sanity...
   Current variants in Sanity: 0
   Existing SKUs: none
   Variants to import: 15 (0 skipped)

   Found 15 products for variant linking
   Variants with references: 15

   Creating variants...

✅ Successfully imported 15 variants

📊 Variants by Product:
   fresh-oyster-mushrooms: Small (250g), Medium (500g), Large (1kg)
   fresh-shiitake-mushrooms: Small (200g), Medium (400g), Large (800g)
   dried-shiitake-mushrooms: Small (50g), Medium (100g), Large (250g)
   mushroom-powder: Small (100g), Medium (250g), Large (500g)
   oyster-mushroom-growing-kit: Small, Medium, Large

📈 Total variants: 0 → 15

✅ Variant import complete!
🎉 Ready for Phase 6: Relationship Linking!
```

### Step 4: Verify in Studio (5 min)

1. Open Studio: `cd studio && npm run dev`
2. Navigate to: `Product Variants`
3. Check:
   - 15 variants visible
   - Product references linked correctly
   - Prices and stock displayed
   - Default variants marked

---

## 🔗 Phase 6: Relationship Linking (1 hour)

### Overview
Connect products with smart recommendations (suggestedProducts, complementaryProducts, relatedProducts)

### Relationship Strategy

**1. Suggested Products ("You May Also Like")** - 8 max per product
- Fresh → Other fresh + growing kits
- Dried → Other dried + fresh alternatives
- Kits → Fresh mushrooms + other kits
- Bundles → Individual products + other bundles

**2. Complementary Products ("Frequently Bought Together")** - 4 max
- Fresh + Growing kits
- Dried + Fresh (same type)
- Specialty products + Fresh

**3. Related Products (Similar Items)** - 6 max
- Same category products
- Similar price range

### Step 1: Create Relationship Mapping (30 min)

Create `data/sanity/relationships.json`:

```json
{
  "fresh-oyster-mushrooms": {
    "suggestedProducts": [
      "fresh-king-oyster-mushrooms",
      "fresh-shiitake-mushrooms",
      "dried-oyster-mushrooms",
      "oyster-mushroom-growing-kit",
      "mushroom-powder",
      "beginner-mushroom-combo-kit"
    ],
    "complementaryProducts": [
      "oyster-mushroom-growing-kit",
      "mushroom-powder",
      "fresh-shiitake-mushrooms"
    ],
    "relatedProducts": [
      "fresh-king-oyster-mushrooms",
      "fresh-button-mushrooms",
      "fresh-portobello-mushrooms"
    ]
  }
  // ... 14 more products
}
```

### Step 2: Create Linking Script (30 min)

Create `scripts/sanity/link-relationships.js`:

```javascript
/**
 * Link Product Relationships
 * Connects suggestedProducts, complementaryProducts, relatedProducts
 */

const fs = require('fs');
const path = require('path');
const {fetchDocuments, updateDocument} = require('./lib/sanity-client');

async function linkRelationships() {
  console.log('🔗 Linking Product Relationships...\n');

  try {
    // Load relationship mappings
    const dataPath = path.join(__dirname, '../../data/sanity/relationships.json');
    const relationships = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    // Fetch all products
    const products = await fetchDocuments(`
      *[_type == "product"]{
        _id,
        "slug": slug.current,
        name
      }
    `);
    console.log(`   Found ${products.length} products\n`);

    // Create slug → ID map
    const productMap = products.reduce((map, product) => {
      map[product.slug] = product._id;
      return map;
    }, {});

    let updateCount = 0;
    let skipCount = 0;
    const errors = [];

    // Link relationships for each product
    for (const [productSlug, relations] of Object.entries(relationships)) {
      const productId = productMap[productSlug];
      
      if (!productId) {
        console.warn(`   ⚠️  Skipping: Product not found: ${productSlug}`);
        skipCount++;
        continue;
      }

      const product = products.find(p => p.slug === productSlug);
      console.log(`   🔗 Linking: ${product.name}`);

      try {
        // Convert slug arrays to reference arrays
        const updates = {};

        if (relations.suggestedProducts) {
          updates.suggestedProducts = relations.suggestedProducts
            .map(slug => productMap[slug] ? {
              _type: 'reference',
              _ref: productMap[slug],
              _key: `suggested-${slug}`
            } : null)
            .filter(Boolean);
          console.log(`      - Suggested: ${updates.suggestedProducts.length} products`);
        }

        if (relations.complementaryProducts) {
          updates.complementaryProducts = relations.complementaryProducts
            .map(slug => productMap[slug] ? {
              _type: 'reference',
              _ref: productMap[slug],
              _key: `complementary-${slug}`
            } : null)
            .filter(Boolean);
          console.log(`      - Complementary: ${updates.complementaryProducts.length} products`);
        }

        if (relations.relatedProducts) {
          updates.relatedProducts = relations.relatedProducts
            .map(slug => productMap[slug] ? {
              _type: 'reference',
              _ref: productMap[slug],
              _key: `related-${slug}`
            } : null)
            .filter(Boolean);
          console.log(`      - Related: ${updates.relatedProducts.length} products`);
        }

        // Update product with relationships
        await updateDocument(productId, updates);
        updateCount++;

      } catch (error) {
        console.error(`      ❌ Failed: ${error.message}`);
        errors.push({product: productSlug, error: error.message});
      }
    }

    console.log(`\n📊 Linking Summary:`);
    console.log(`   ✅ Successfully linked: ${updateCount} products`);
    console.log(`   ⚠️  Skipped: ${skipCount} products`);
    console.log(`   ❌ Failed: ${errors.length} products\n`);

    if (errors.length > 0) {
      console.log('❌ Errors:');
      errors.forEach(e => console.log(`   - ${e.product}: ${e.error}`));
    }

    console.log('✅ Relationship linking complete!');
    console.log('   Verify in Studio: http://localhost:3333 → Products\n');
    console.log('🎉 Ready for Phase 7: Bundles & Reviews!');

  } catch (error) {
    console.error('❌ Linking failed:', error.message);
    process.exit(1);
  }
}

// Run linking
if (require.main === module) {
  linkRelationships()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {linkRelationships};
```

### Step 3: Test Linking (5 min)

```powershell
node scripts\sanity\link-relationships.js
```

---

## 📦 Phase 7: Bundles & Reviews (1 hour)

### Part A: Product Bundles (30 min)

Create `data/sanity/bundles.json` (6 bundles):

1. **Gourmet Starter Pack** - Fresh Oyster + Fresh Shiitake + Fresh Lion's Mane (Save 15%)
2. **Dried Mushroom Collection** - All 3 dried varieties (Save 20%)
3. **Growing Kit Bundle** - 2 growing kits + mushroom powder (Save 25%)
4. **Fresh Favorites** - 3 popular fresh mushrooms (Save 10%)
5. **Complete Mushroom Experience** - Fresh + Dried + Kit (Save 30%)
6. **Gift Box Special** - Premium selection with recipe book (Save 20%)

### Part B: Customer Reviews (30 min)

Create `data/sanity/reviews.json` (45 reviews = 3 per product):

- Mix of 4-5 star ratings
- Realistic customer names
- Detailed review content
- Some with verified purchase badge
- Dates spread over last 3 months

---

## ✅ Phase 8: Validation (1 hour)

Create `scripts/sanity/validate-all.js`:

**Checks:**
- All products have categories ✅
- All references valid (no broken links) ✅
- Pricing logic (promo < regular) ✅
- Stock levels reasonable ✅
- Images exist for all products ✅
- Variants linked to products ✅
- Bundles have 2-10 products ✅
- Reviews linked correctly ✅

**Output:** Validation report with pass/fail for each check

---

## 🚀 Phase 9: Studio Deployment (30 min)

```powershell
cd studio
sanity deploy
```

**Steps:**
1. Deploy Studio to Sanity Cloud
2. Access at: https://pp-namias.sanity.studio
3. Test CORS settings
4. Verify data visible in production
5. Document deployment URL

---

## 📈 Success Criteria

**Phase 5 Complete:**
- [ ] 15 variants created (3 per product for 5 products)
- [ ] All variants linked to products
- [ ] Pricing and stock configured
- [ ] Verified in Studio

**Phase 6 Complete:**
- [ ] 15 products have suggested products (avg 6 each)
- [ ] 15 products have complementary products (avg 3 each)
- [ ] All references valid
- [ ] Verified in Studio

**Phase 7 Complete:**
- [ ] 6 bundles created with products linked
- [ ] 45 reviews imported (3 per product)
- [ ] All verified in Studio

**Phase 8 Complete:**
- [ ] Validation script runs successfully
- [ ] All checks pass (or documented exceptions)
- [ ] Validation report generated

**Phase 9 Complete:**
- [ ] Studio deployed to production
- [ ] Accessible at pp-namias.sanity.studio
- [ ] All data visible in production
- [ ] CORS configured correctly

---

## 🎉 Project Completion

Once all phases complete:

- ✅ 3 categories with SEO
- ✅ 15 products with full schema
- ✅ 15 images uploaded and linked
- ✅ 15 variants with product references
- ✅ Product relationships connected
- ✅ 6 bundles with savings
- ✅ 45 customer reviews
- ✅ Validation passing
- ✅ Studio deployed to production

**Total Time**: 8-10 hours  
**Total Documents**: 3 categories, 15 products, 15 variants, 6 bundles, 45 reviews = **84 documents**

🚀 **Ready for Frontend Integration!**
