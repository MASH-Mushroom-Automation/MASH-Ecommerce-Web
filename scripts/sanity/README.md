# Sanity CMS Automation Scripts

**Purpose**: Automated content import/export for MASH E-Commerce Sanity CMS  
**Project**: PP_Namias (gerattrr)  
**Status**: Phase 1 Complete

---

## 📋 Quick Start

```powershell
# 1. Install dependencies
npm install @sanity/client dotenv

# 2. Test connection
node scripts/sanity/test-connection.js

# 3. Import categories
node scripts/sanity/import-categories.js

# 4. Verify in Studio
cd studio && npm run dev
# Open http://localhost:3333
```

**Full Guide**: See `.github/SANITY_QUICK_START.md`

---

## 📁 Script Directory Structure

```
scripts/sanity/
├── lib/
│   └── sanity-client.js      # Reusable Sanity client library
├── test-connection.js         # Test API access
├── import-categories.js       # Import 3 categories
├── import-products.js         # Import 15 products (TODO)
├── import-variants.js         # Import 15 variants (TODO)
├── import-bundles.js          # Import 6 bundles (TODO)
├── import-reviews.js          # Import 45 reviews (TODO)
├── link-relationships.js      # Link product references (TODO)
├── validate-all.js            # Validate data integrity (TODO)
└── export-all.js              # Backup entire dataset (TODO)
```

---

## 🔧 Available Scripts

### ✅ Phase 1: Ready to Use

#### `test-connection.js`
Tests Sanity API connection and environment setup.

```powershell
node scripts/sanity/test-connection.js
```

**Output**:
- Connection status
- Document counts by type
- Sample query results

#### `import-categories.js`
Imports 3 product categories from `data/sanity/categories.json`.

```powershell
node scripts/sanity/import-categories.js
```

**Creates**:
- Fresh Mushrooms
- Dried Mushrooms
- Growing Kits & Accessories

### ⏳ Phase 2-10: Coming Soon

#### `import-products.js` (TODO)
Import 15 products with full schema data.

#### `import-variants.js` (TODO)
Import 15 product variants (size/weight options).

#### `import-bundles.js` (TODO)
Import 6 product bundles with savings.

#### `import-reviews.js` (TODO)
Import 45 customer reviews (3 per product).

#### `link-relationships.js` (TODO)
Link products to suggested/complementary products.

#### `validate-all.js` (TODO)
Validate data integrity and relationships.

#### `export-all.js` (TODO)
Export entire dataset as JSON backup.

---

## 📚 Sanity Client Library

**File**: `lib/sanity-client.js`

### Available Functions

```javascript
const {
  client,                    // Raw Sanity client
  testConnection,            // Test API access
  createDocument,            // Create single document
  createDocuments,           // Batch create (transaction)
  updateDocument,            // Update by ID
  deleteDocument,            // Delete by ID
  deleteDocuments,           // Batch delete by query
  fetchDocuments,            // GROQ query
  uploadImage,               // Upload image asset
  countDocuments,            // Count by type
} = require('./lib/sanity-client');
```

### Example Usage

```javascript
// Create a category
const category = await createDocument({
  _type: 'category',
  categoryName: 'Fresh Mushrooms',
  slug: { _type: 'slug', current: 'fresh-mushrooms' },
  isActive: true,
});

// Count products
const productCount = await countDocuments('product');

// Query products by category
const products = await fetchDocuments(`
  *[_type == "product" && category->slug.current == "fresh-mushrooms"] {
    name,
    price,
    category->{ categoryName }
  }
`);

// Update product stock
await updateDocument('product-id-123', {
  quantity: 50,
  'inventory.quantityInStock': 50,
});

// Delete test data
await deleteDocuments('*[_type == "product" && name match "Test*"]');
```

---

## 🗂️ Data File Format

**Directory**: `data/sanity/`

### `categories.json` (✅ Ready)

```json
[
  {
    "_type": "category",
    "categoryName": "Fresh Mushrooms",
    "slug": {
      "_type": "slug",
      "current": "fresh-mushrooms"
    },
    "description": "Farm-fresh mushrooms...",
    "featuredCategory": true,
    "isActive": true,
    "sortOrder": 1,
    "seoTitle": "Fresh Mushrooms Philippines",
    "seoDescription": "Buy fresh mushrooms...",
    "seoKeywords": ["fresh mushrooms", "oyster", "shiitake"]
  }
]
```

### `products.json` (⏳ TODO)

```json
[
  {
    "_type": "product",
    "name": "Fresh Oyster Mushrooms",
    "slug": { "_type": "slug", "current": "fresh-oyster-mushrooms" },
    "category": { "_type": "reference", "_ref": "category-fresh-mushrooms-id" },
    "price": 350,
    "quantity": 150,
    "SKU": "MUSH-OYS-001",
    "description": "...",
    "inventory": {
      "quantityInStock": 150,
      "lowStockThreshold": 20,
      "trackInventory": true,
      "allowBackorders": false
    },
    "deliveryOptions": {
      "sameDayDeliveryEligible": true,
      "deliveryZones": ["Metro Manila", "Quezon City"],
      "perishable": true
    }
  }
]
```

---

## 🔐 Environment Setup

**Required Variables** (`.env.local`):

```env
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_WRITE_TOKEN="skCVttQRCl0qVx22gul6..."
```

**Get Write Token**:
1. Go to https://sanity.io/manage/project/gerattrr
2. Click "API" → "Tokens"
3. Create token with "Editor" permissions
4. Copy to `.env.local`

---

## 🧪 Testing

### Manual Testing

```powershell
# Test each script individually
node scripts/sanity/test-connection.js
node scripts/sanity/import-categories.js

# Verify in Studio
cd studio && npm run dev
# Check http://localhost:3333
```

### Validation

```powershell
# Run validation (when available)
node scripts/sanity/validate-all.js

# Check specific document type
node -e "
  const {countDocuments} = require('./scripts/sanity/lib/sanity-client');
  countDocuments('product').then(console.log);
"
```

### Cleanup Test Data

```powershell
# Delete all test products
node -e "
  const {deleteDocuments} = require('./scripts/sanity/lib/sanity-client');
  deleteDocuments('*[_type == \"product\"]').then(console.log);
"
```

---

## 🐛 Troubleshooting

### Error: "Missing environment variables"
**Fix**: Add to `.env.local`:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_WRITE_TOKEN="your-token-here"
```

### Error: "Cannot find module '@sanity/client'"
**Fix**: Install dependencies:
```powershell
npm install @sanity/client dotenv
```

### Error: "Unauthorized" or "Invalid token"
**Fix**: Check token has "Editor" permissions at https://sanity.io/manage

### Error: "Document not found"
**Fix**: Make sure category IDs exist before importing products

### ESLint errors about `require()`
**Note**: Scripts intentionally use CommonJS (`require`), not ES6 imports. This is correct for Node.js scripts. Ignore these lint errors for `/scripts/**`.

---

## 📊 Implementation Phases

| Phase | Script | Data File | Status | Time |
|-------|--------|-----------|--------|------|
| 1 | `test-connection.js` | - | ✅ Ready | 2 min |
| 2 | `import-categories.js` | `categories.json` | ✅ Ready | 5 min |
| 3 | `import-products.js` | `products.json` | ⏳ TODO | 1 hour |
| 4 | `upload-images.js` | Images folder | ⏳ TODO | 30 min |
| 5 | `import-variants.js` | `variants.json` | ⏳ TODO | 45 min |
| 6 | `link-relationships.js` | - | ⏳ TODO | 1 hour |
| 7 | `import-bundles.js` | `bundles.json` | ⏳ TODO | 30 min |
| 8 | `import-reviews.js` | `reviews.json` | ⏳ TODO | 30 min |
| 9 | `validate-all.js` | - | ⏳ TODO | 1 hour |
| 10 | Deploy Studio | - | ⏳ TODO | 30 min |

**Total**: 6-8 hours remaining

---

## 📖 Documentation

**Main Guides**:
- `.github/SANITY_CMS_MASTER_PLAN.md` - Complete 10-phase plan
- `.github/SANITY_QUICK_START.md` - 15-minute quick start
- `.github/SANITY_AUTOMATION_SUMMARY.md` - This implementation summary

**Schema Reference**:
- `studio/src/schemaTypes/` - All schema definitions
- `.github/copilot-instructions.md` - Schema deep dive (lines 122-400)

**Related Docs**:
- `.github/SANITY_CMS_COMPLETE_WORKFLOW.md` - Manual workflow guide
- `.github/SANITY_MIGRATION_PLAN.md` - Migration from old project

---

## 🎯 Next Steps

1. ✅ **Run test connection** (2 minutes)
2. ✅ **Import categories** (5 minutes)
3. ⏳ **Create products.json** (1 hour)
4. ⏳ **Build import-products.js** (30 minutes)
5. ⏳ **Continue Phases 4-10** (5-6 hours)

**Start Now**: Follow `.github/SANITY_QUICK_START.md`

---

*Last Updated: November 22, 2025*  
*Status: ✅ Phase 1 Complete*  
*Ready to Run: test-connection.js, import-categories.js*
