# Sanity CMS Testing & Deployment Guide

**Project**: PP_Namias Sanity CMS (gerattrr)  
**Last Updated**: November 22, 2025  
**Purpose**: Complete testing and deployment procedures  
**Audience**: Developers and QA testers

---

## 📋 Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Pre-Testing Checklist](#pre-testing-checklist)
3. [Phase-by-Phase Testing](#phase-by-phase-testing)
4. [Validation Scripts](#validation-scripts)
5. [Deployment Methods](#deployment-methods)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## 📊 Latest Test Results

### Phase 2: Category Import (November 22, 2025 - 3:15 PM)

**Test Execution:**
```powershell
# 1. Install Dependencies
npm install @sanity/client dotenv
Result: ✅ PASS (dependencies up to date)

# 2. Test Connection
node scripts/sanity/test-connection.js
Result: ✅ PASS
- Connected to gerattrr/production
- Found 3 existing categories
- All tests completed successfully

# 3. Import Categories
node scripts/sanity/import-categories.js
Result: ⚠️ PARTIAL PASS
- Successfully created 3 categories
- Total now 6 (duplicates created)
- Issue: No deduplication logic

# 4. Verify in Studio
cd studio && npm run dev
Result: ✅ PASS
- Studio accessible at localhost:3333
- Categories visible in UI
```

**Issues Found:**
1. **Duplicate Categories**: Import script doesn't check for existing categories by slug
2. **Missing Deduplication**: Need to add `fetchDocuments()` query before creating

**Required Fix:**
```javascript
// Add to import-categories.js BEFORE creating categories:
const existing = await fetchDocuments('*[_type == "category"]{ slug }');
const existingSlugs = existing.map(cat => cat.slug.current);
const newCategories = categories.filter(cat => !existingSlugs.includes(cat.slug.current));
```

**Next Steps:**
1. Update import-categories.js with deduplication
2. Delete 3 duplicate categories in Studio
3. Re-run import script to verify
4. Proceed to Phase 3 (Products)

---

## Testing Strategy

### Testing Levels

```
Level 1: Unit Testing (Per Script)
├── Test each import script individually
├── Verify data creation in Sanity
└── Check document counts match expected

Level 2: Integration Testing (Cross-References)
├── Test product → category links
├── Test variant → product links
├── Test bundle → products links
└── Test review → product links

Level 3: Data Integrity Testing
├── No orphaned documents
├── All references valid
├── No duplicate slugs/SKUs
└── Pricing logic correct

Level 4: E2E Testing
├── Full import workflow
├── Frontend display verification
└── API query performance
```

---

## Pre-Testing Checklist

### Environment Setup

Before running ANY tests:

```powershell
# 1. Verify Node.js version
node --version
# Expected: v18.0.0 or higher

# 2. Verify NPM installed
npm --version

# 3. Install dependencies
npm install @sanity/client dotenv

# 4. Verify .env.local exists
dir .env.local

# 5. Check environment variables
node -e "require('dotenv').config({path:'.env.local'}); console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID); console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET); console.log('Write Token:', process.env.SANITY_API_WRITE_TOKEN ? 'Set' : 'Missing');"
```

### Expected Output

```
Project ID: gerattrr
Dataset: production
Write Token: Set
```

If any missing, add to `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=skCVttQRCl0qVx22gul6MfW5PEg9CnDhWYVY8yygEHC5fmUmiYk3KRNFZcFQJHyJRcgKAO2hZxnLj1MyqsA2wI0GZFihzT7TzDm3xbmGwoeUdkG06ssL53R0TrwDVwVe9HSaJyXB1Ji3RPYAxHM7tbrBLOtdQfujmSHVr5CDRGLask9t25WG
```

---

## Phase-by-Phase Testing

### Phase 1: Connection Test (2 minutes)

**Purpose**: Verify Sanity API access

**Command**:

```powershell
node scripts/sanity/test-connection.js
```

**Expected Output**:

```
🧪 Testing Sanity Connection...

Test 1: Connection
✅ Connected to Sanity successfully
   Project: gerattrr
   Dataset: production
   Products found: 0

Test 2: Document Counts
   product: 0 documents
   category: 0 documents
   productVariant: 0 documents
   productBundle: 0 documents
   review: 0 documents

Test 3: Sample Query
   ℹ️  No products found (expected for new setup)

✅ All tests completed!
```

**Success Criteria**:

- [x] Exit code: 0
- [x] No errors thrown
- [x] Project ID = `gerattrr`
- [x] Dataset = `production`
- [x] All document counts = 0 (initial state)

**Failure Scenarios**:

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing environment variables" | .env.local not loaded | Add variables to .env.local |
| "Unauthorized" | Invalid write token | Check token in Sanity dashboard |
| "Project not found" | Wrong project ID | Verify project ID = gerattrr |

---

### Phase 2: Category Import Test (3 minutes)

**Purpose**: Import 3 product categories

**Command**:

```powershell
node scripts/sanity/import-categories.js
```

**Expected Output**:

```
📦 Importing Categories to Sanity...
   Current categories in Sanity: 0
   Categories to import: 3
   Creating categories...

✅ Successfully imported 3 categories:
   1. Fresh Mushrooms (category-abc123def456...)
   2. Dried Mushrooms (category-def456ghi789...)
   3. Growing Kits & Accessories (category-ghi789jkl012...)

📊 Total categories in Sanity: 3

✅ Category import complete!
```

**Success Criteria**:

- [x] Exit code: 0
- [x] 3 categories created (not 0, not 6)
- [x] Each category has unique Sanity-generated ID
- [x] Final count = 3

**Studio Verification** (5 minutes):

```powershell
cd studio
npm run dev
# Open http://localhost:3333
```

In Studio:

1. Click **"Product Categories"** in left sidebar
2. Should see 3 categories:
   - ✅ Fresh Mushrooms (featuredCategory: true, isActive: true, sortOrder: 1)
   - ✅ Dried Mushrooms (featuredCategory: true, isActive: true, sortOrder: 2)
   - ✅ Growing Kits & Accessories (isActive: true, sortOrder: 3)
3. Open each category:
   - ✅ `categoryName` populated
   - ✅ `slug.current` exists (fresh-mushrooms, dried-mushrooms, growing-kits)
   - ✅ `description` has 2-3 sentences
   - ✅ `seoTitle` filled (50-60 chars)
   - ✅ `seoDescription` filled (150-160 chars)
   - ✅ `seoKeywords` has 6 keywords

**Failure Scenarios**:

| Error | Cause | Fix |
|-------|-------|-----|
| "Cannot find module" | @sanity/client not installed | npm install @sanity/client |
| "Duplicate slug" | Category already exists | Delete existing categories first |
| "Transaction failed" | Network error | Retry after checking internet |

**If Test Fails**: Cleanup

```powershell
# Delete all categories (if needed)
node -e "require('./scripts/sanity/lib/sanity-client').deleteDocuments('*[_type == \"category\"]').then(() => console.log('Deleted')).catch(console.error)"
```

---

### Phase 3: Product Import Test (15 minutes)

**Purpose**: Import 15 products with category references

**Prerequisites**:

- [x] Phase 2 complete (3 categories exist)
- [x] `data/sanity/products.json` created (15 products)
- [x] `scripts/sanity/import-products.js` created

**Command**:

```powershell
node scripts/sanity/import-products.js
```

**Expected Output**:

```
📦 Importing Products to Sanity...
   Current products in Sanity: 0
   Fetching categories...
   Found 3 categories:
      - Fresh Mushrooms (category-abc123...)
      - Dried Mushrooms (category-def456...)
      - Growing Kits & Accessories (category-ghi789...)
   Products to import: 15
   Linking category references...
   Creating products...

✅ Successfully imported 15 products:
   1. Fresh Oyster Mushrooms (product-...)
   2. Fresh King Oyster Mushrooms (product-...)
   ...
   15. Beginner Combo Kit (product-...)

📊 Total products in Sanity: 15

✅ Product import complete!
```

**Success Criteria**:

- [x] Exit code: 0
- [x] 15 products created
- [x] Each product has category reference (not slug string)
- [x] All products have unique SKUs
- [x] All products have prices > 0

**Studio Verification**:

In Studio → **Products**:

1. Count = 15 products
2. Check first product (Fresh Oyster Mushrooms):
   - ✅ `name`: "Fresh Oyster Mushrooms"
   - ✅ `slug.current`: "fresh-oyster-mushrooms"
   - ✅ `SKU`: "MUSH-OYS-001"
   - ✅ `category`: Reference to "Fresh Mushrooms" (not string)
   - ✅ `price`: 350
   - ✅ `quantity`: 150
   - ✅ `sameDayDeliveryEligible`: true
   - ✅ `searchKeywords`: ["oyster", "fresh", "mushroom"]

**Data Integrity Checks**:

```powershell
# Check all products have categories
node -e "require('./scripts/sanity/lib/sanity-client').fetchDocuments('*[_type == \"product\" && !defined(category)]').then(orphans => console.log('Orphaned products:', orphans.length))"

# Expected: Orphaned products: 0
```

---

### Phase 4-8: Remaining Import Tests

**Phase 4**: Image Upload (30 min) - Upload 15+ product images  
**Phase 5**: Variants (45 min) - Create 15 size/weight variants  
**Phase 6**: Relationships (1h) - Link suggested/complementary products  
**Phase 7**: Bundles (30 min) - Create 6 product bundles  
**Phase 8**: Reviews (30 min) - Import 45 customer reviews

Each phase follows same pattern:

1. Run import script
2. Verify document count
3. Check in Studio
4. Run data integrity checks

---

## Validation Scripts

### Complete Validation Script

Create `scripts/sanity/validate-all.js`:

```javascript
const {fetchDocuments, countDocuments} = require('./lib/sanity-client');

async function validateAll() {
  console.log('🔍 Validating Sanity CMS Data...\n');

  const errors = [];
  const warnings = [];

  // Test 1: Document Counts
  console.log('Test 1: Document Counts');
  const expectedCounts = {
    category: 3,
    product: 15,
    productVariant: 15,
    productBundle: 6,
    review: 45,
  };

  for (const [type, expected] of Object.entries(expectedCounts)) {
    const actual = await countDocuments(type);
    if (actual !== expected) {
      errors.push(`${type}: Expected ${expected}, got ${actual}`);
    } else {
      console.log(`   ✅ ${type}: ${actual} (expected ${expected})`);
    }
  }

  // Test 2: Orphaned Products (no category)
  console.log('\nTest 2: Orphaned Products');
  const orphaned = await fetchDocuments('*[_type == "product" && !defined(category)]');
  if (orphaned.length > 0) {
    errors.push(`Found ${orphaned.length} products without categories`);
  } else {
    console.log('   ✅ No orphaned products');
  }

  // Test 3: Duplicate Slugs
  console.log('\nTest 3: Duplicate Slugs');
  const products = await fetchDocuments('*[_type == "product"]{ "slug": slug.current }');
  const slugs = products.map(p => p.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
  if (duplicates.length > 0) {
    errors.push(`Found duplicate slugs: ${duplicates.join(', ')}`);
  } else {
    console.log('   ✅ No duplicate slugs');
  }

  // Test 4: Invalid Prices
  console.log('\nTest 4: Product Pricing');
  const invalidPrices = await fetchDocuments('*[_type == "product" && price <= 0]');
  if (invalidPrices.length > 0) {
    errors.push(`Found ${invalidPrices.length} products with invalid prices`);
  } else {
    console.log('   ✅ All prices valid (> 0)');
  }

  // Test 5: Variant References
  console.log('\nTest 5: Variant References');
  const variants = await fetchDocuments('*[_type == "productVariant" && !defined(product)]');
  if (variants.length > 0) {
    errors.push(`Found ${variants.length} variants without product references`);
  } else {
    console.log('   ✅ All variants linked to products');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (errors.length === 0) {
    console.log('✅ All validation tests passed!');
    return true;
  } else {
    console.log(`❌ Found ${errors.length} errors:`);
    errors.forEach(err => console.log(`   - ${err}`));
    return false;
  }
}

validateAll()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Validation failed:', err);
    process.exit(1);
  });
```

**Run Validation**:

```powershell
node scripts/sanity/validate-all.js
```

---

## Deployment Methods

### Method 1: Manual Deployment (10 minutes)

**Best For**: One-time deployments, testing

```powershell
cd studio
npm run build
npm run deploy
```

**Follow Prompts**:

1. Select project: `gerattrr`
2. Select dataset: `production`
3. Select hostname: `pp-namias` (becomes https://pp-namias.sanity.studio)
4. Confirm deployment

**Verify**:

- Open https://pp-namias.sanity.studio
- Login with Sanity account
- Verify all data visible

---

### Method 2: Vercel Deployment (Automated)

**Best For**: Production, auto-deploy on git push

**Setup** (one-time):

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy studio
cd studio
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: mash-sanity-studio
# - Directory: ./studio
```

**Configure Environment Variables** in Vercel Dashboard:

```
SANITY_STUDIO_PROJECT_ID=gerattrr
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_URL=https://mash-ecommerce.vercel.app
```

**Auto-Deploy**: Every git push to `main` triggers new deployment

---

### Method 3: GitHub Actions (Recommended for CI/CD)

**Best For**: Automated deployments with testing

Create `.github/workflows/deploy-studio.yml`:

```yaml
name: Deploy Sanity Studio

on:
  push:
    branches: [main]
    paths:
      - 'studio/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: cd studio && npm ci

      - name: Build Studio
        run: cd studio && npm run build

      - name: Deploy to Sanity
        run: cd studio && npm run deploy
        env:
          SANITY_AUTH_TOKEN: ${{ secrets.SANITY_AUTH_TOKEN }}
```

**Setup Secrets** in GitHub:

1. Go to repo → Settings → Secrets
2. Add `SANITY_AUTH_TOKEN` (your write token)

---

## Post-Deployment Verification

### Studio Access Test

```
1. Open deployed Studio URL: https://pp-namias.sanity.studio
2. Login with Sanity account (Google OAuth)
3. Check left sidebar shows all document types
4. Click "Products" → Should see 15 products
5. Click "Product Categories" → Should see 3 categories
6. Open any product → All fields populated
```

### API Query Test

Create `scripts/sanity/test-api.js`:

```javascript
const {createClient} = require('@sanity/client');

const client = createClient({
  projectId: 'gerattrr',
  dataset: 'production',
  apiVersion: '2024-11-22',
  useCdn: true, // Use CDN for read operations
});

async function testAPI() {
  console.log('🧪 Testing Sanity API...\n');

  // Test 1: Fetch all categories
  const categories = await client.fetch('*[_type == "category"]');
  console.log(`✅ Fetched ${categories.length} categories`);

  // Test 2: Fetch products with category
  const products = await client.fetch(`
    *[_type == "product"][0...5]{
      name,
      price,
      category->{
        categoryName
      }
    }
  `);
  console.log(`✅ Fetched ${products.length} products with categories`);
  products.forEach(p => {
    console.log(`   - ${p.name} (₱${p.price}) - ${p.category?.categoryName}`);
  });

  // Test 3: Performance test
  const start = Date.now();
  await client.fetch('*[_type == "product"]');
  const duration = Date.now() - start;
  console.log(`\n✅ Query performance: ${duration}ms`);

  if (duration > 1000) {
    console.log('⚠️  Warning: Query took over 1 second. Consider using CDN.');
  }
}

testAPI().catch(console.error);
```

**Run**:

```powershell
node scripts/sanity/test-api.js
```

---

## Rollback Procedures

### Emergency Rollback (Data Corruption)

**Scenario**: Import script created bad data

**Steps**:

1. **Stop All Scripts**: Ctrl+C any running imports

2. **Export Current State** (backup before deletion):

```powershell
node -e "require('./scripts/sanity/lib/sanity-client').fetchDocuments('*[_type == \"product\"]').then(data => require('fs').writeFileSync('backup-products.json', JSON.stringify(data, null, 2)))"
```

3. **Delete Bad Data**:

```powershell
# Delete all products
node -e "require('./scripts/sanity/lib/sanity-client').deleteDocuments('*[_type == \"product\"]').then(() => console.log('Products deleted'))"

# Or delete specific products by query
node -e "require('./scripts/sanity/lib/sanity-client').deleteDocuments('*[_type == \"product\" && price <= 0]').then(() => console.log('Invalid products deleted'))"
```

4. **Re-import from Backup** (if available):

```powershell
node scripts/sanity/import-products.js
```

5. **Verify**:

```powershell
node scripts/sanity/validate-all.js
```

---

## Troubleshooting

### Issue: "Unauthorized" Error

**Symptoms**: Scripts fail with 401 error

**Causes**:

- Invalid write token
- Token revoked
- Wrong project ID

**Fixes**:

1. Go to https://sanity.io/manage/project/gerattrr
2. Click "API" tab
3. Check token status:
   - If "Revoked", create new token
   - If "Active", copy token
4. Update `.env.local`:

```env
SANITY_API_WRITE_TOKEN=sk... (new token)
```

5. Retry script

---

### Issue: Duplicate Slugs

**Symptoms**: Import fails with "slug must be unique"

**Cause**: Product/category with same slug already exists

**Fix**:

```powershell
# Find duplicates
node -e "require('./scripts/sanity/lib/sanity-client').fetchDocuments('*[_type == \"product\"]{ \"slug\": slug.current }').then(prods => { const slugs = prods.map(p => p.slug); const dups = slugs.filter((s, i) => slugs.indexOf(s) !== i); console.log('Duplicates:', dups); })"

# Delete duplicates (careful!)
node -e "require('./scripts/sanity/lib/sanity-client').deleteDocuments('*[_type == \"product\" && slug.current == \"fresh-oyster-mushrooms\"][1...100]').then(() => console.log('Deleted'))"
```

---

### Issue: "Transaction Failed"

**Symptoms**: Batch import fails midway

**Cause**: Network timeout, large transaction

**Fix**:

1. **Reduce Batch Size**: Instead of creating 15 products at once, create 5 at a time:

```javascript
// In import-products.js
const batchSize = 5;
for (let i = 0; i < products.length; i += batchSize) {
  const batch = products.slice(i, i + batchSize);
  await createDocuments(batch);
}
```

2. **Retry Failed Transaction**: Script should handle retries automatically

---

### Issue: Categories Not Showing in Studio

**Symptoms**: Import succeeds but Studio shows empty

**Causes**:

- Studio cache
- Schema not registered
- Wrong dataset

**Fixes**:

1. **Hard Refresh**: Ctrl+Shift+R in Studio
2. **Restart Studio**: Ctrl+C, then `npm run dev`
3. **Check Dataset**: Studio should be on `production` dataset
4. **Verify Schema**: Check `studio/src/schemaTypes/index.ts` includes `category`

---

**End of Testing & Deployment Guide**  
**Last Updated**: November 22, 2025  
**For Issues**: Check troubleshooting or create GitHub issue
