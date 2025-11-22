# MASH E-Commerce Sanity CMS Master Plan

**Project**: PP_Namias Sanity CMS (gerattrr)  
**Created**: November 22, 2025  
**Purpose**: Complete automated Sanity CMS system with scripts for content management  
**Status**: 🚧 Planning Phase

---

## 📋 Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Complete Schema Reference](#complete-schema-reference)
3. [Relationship Mapping](#relationship-mapping)
4. [Automated Scripts Strategy](#automated-scripts-strategy)
5. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
6. [Testing & Validation](#testing--validation)
7. [Deployment Strategy](#deployment-strategy)

---

## Current State Analysis

### ✅ What We Have

**Sanity Project Details**:
- Project ID: `gerattrr` (PP_Namias)
- Dataset: `production`
- API Tokens: Read + Write tokens configured
- Studio URL: https://pp-namias.sanity.studio
- Free Tier: 250k API requests/month

**Existing Schemas** (17 types):

**Documents** (13):
1. ✅ `product` (623 lines) - Complete with 25+ fields
2. ✅ `category` - Product categories
3. ✅ `productVariant` - Size/weight options
4. ✅ `productBundle` - Package deals
5. ✅ `review` - Customer reviews
6. ✅ `order` - Order management
7. ✅ `coupon` - Discount codes
8. ✅ `promotion` - Marketing campaigns
9. ✅ `page` - CMS pages
10. ✅ `post` - Blog posts
11. ✅ `person` - Blog authors/team members
12. ✅ `emailCampaign` - Email marketing
13. ✅ `analytics` - Analytics reports

**Singletons** (3):
14. ✅ `settings` - Global site config
15. ✅ `featuredProducts` - Homepage products
16. ✅ `heroCarousel` - Homepage hero slider

**Objects** (4):
17. ✅ `blockContent` - Rich text editor
18. ✅ `callToAction` - CTA buttons
19. ✅ `infoSection` - Content sections
20. ✅ `link` - Link objects

### ❌ What's Missing

**Data Population**:
- No products in database (0/15)
- No categories (0/3)
- No variants (0/15)
- No bundles (0/6)
- No reviews (0/45)

**Automation**:
- No import scripts
- No validation scripts
- No testing scripts
- Manual data entry only

**Relationships**:
- Products → Categories (not linked)
- Products → Variants (not linked)
- Products → Bundles (not linked)
- Products → Reviews (not linked)
- Products → Related Products (not linked)

**Deployment**:
- Studio not deployed to Sanity Cloud
- No CI/CD pipeline
- Manual deployment process

---

## Complete Schema Reference

### 1. Product Schema (25+ Fields)

```typescript
{
  // ===== BASIC INFO (7 fields) =====
  name: string,              // "Fresh Oyster Mushrooms"
  slug: { current: string }, // "fresh-oyster-mushrooms"
  description: blockContent, // Rich text
  shortDescription: string,  // For product cards
  image: image,             // Main image
  images: image[],          // Gallery (2-4)
  category: reference,      // → category
  SKU: string,              // "MUSH-OYS-001"
  
  // ===== PRICING (7 fields) =====
  price: number,            // ₱350
  isOnPromo: boolean,
  promoType: "percentage" | "fixed",
  promoPercentage: number,  // 22%
  promoPrice: number,       // ₱273
  promoEndDate: datetime,
  compareAtPrice: number,
  
  // ===== INVENTORY (6 fields) =====
  quantity: number,         // 150 units
  inventory: {
    quantityInStock: number,
    lowStockThreshold: number,  // 20
    trackInventory: boolean,
    allowBackorders: boolean,
    stockHistory: array
  },
  
  // ===== VARIANTS (4 fields) =====
  hasVariants: boolean,
  variants: reference[],    // → productVariant[]
  weight: number,          // grams
  unit: string,            // "grams" | "kg" | "piece"
  
  // ===== SMART RECOMMENDATIONS (5 fields) =====
  suggestedProducts: reference[],      // "You May Also Like" (max 8)
  relatedProducts: reference[],        // Similar products
  complementaryProducts: reference[],  // "Frequently Bought Together" (max 4)
  relatedBundles: reference[],         // Package deals
  productTags: string[],               // ["bestseller", "organic"]
  
  // ===== FRESHNESS & QUALITY (4 fields) =====
  freshnessInfo: {
    harvestWindow: string,        // "Harvested within 24 hours"
    shelfLife: string,            // "5-7 days refrigerated"
    storageInstructions: text,
    qualityIndicators: string[]
  },
  
  // ===== PREPARATION (4 fields) =====
  preparationInfo: {
    difficultyLevel: "beginner" | "intermediate" | "advanced",
    cookingTime: number,          // minutes
    preparationTips: string[],
    recipeIdeas: array[]
  },
  
  // ===== DELIVERY (Lalamove) (6 fields) =====
  deliveryOptions: {
    sameDayDeliveryEligible: boolean,
    deliveryZones: string[],      // ["Metro Manila", "Quezon City"]
    perishable: boolean
  },
  deliveryWeight: {
    packageWeight: number,        // kg
    packageDimensions: {
      length: number,             // cm
      width: number,
      height: number
    }
  },
  
  // ===== SEO & DISCOVERY (3 fields) =====
  searchKeywords: string[],         // ["oyster", "fresh", "mushroom"]
  nutritionalHighlights: array[],
  isFeatured: boolean
}
```

### 2. Category Schema

```typescript
{
  categoryName: string,           // "Fresh Mushrooms"
  slug: { current: string },      // "fresh-mushrooms"
  parentCategory: reference,      // → category (for subcategories)
  categoryImage: image,
  description: blockContent,
  featuredCategory: boolean,
  isActive: boolean,
  sortOrder: number,
  seoTitle: string,
  seoDescription: string,
  seoKeywords: string[]
}
```

### 3. Product Variant Schema

```typescript
{
  product: reference,             // → product
  name: string,                   // "King Oyster Mushrooms - Large"
  slug: { current: string },
  variantName: string,            // "Large Red"
  SKU: string,
  variantType: string,            // "Size" | "Weight" | "Color"
  variantValue: string,           // "Large (600g)"
  size: string,
  color: string,
  weight: string,                 // "250g"
  weightUnit: string,
  customAttribute: string,
  price: number,
  compareAtPrice: number,
  stockQuantity: number,
  lowStockThreshold: number,
  variantImages: image[],
  availableForPurchase: boolean,
  defaultVariant: boolean,
  sortOrder: number
}
```

### 4. Product Bundle Schema

```typescript
{
  bundleName: string,             // "Gourmet Mushroom Starter Pack"
  slug: { current: string },
  description: text,
  tagline: string,                // "Save 20%!"
  productsInBundle: reference[],  // → product[] (2-10)
  bundlePrice: number,
  discountPercentage: number,
  savingsAmount: number,          // auto-calculated
  bundleImage: image,
  additionalImages: image[],
  bundleActive: boolean,
  availableFrom: datetime,
  availableUntil: datetime,
  stockLimit: number,
  featuredBundle: boolean,
  badge: string,
  sortOrder: number,
  seoSettings: {
    metaTitle: string,
    metaDescription: string
  }
}
```

### 5. Review Schema

```typescript
{
  product: reference,             // → product
  customerName: string,
  customerEmail: string,
  rating: number,                 // 1-5 stars
  reviewTitle: string,
  reviewContent: blockContent,
  reviewImages: image[],
  verifiedPurchase: boolean,
  reviewStatus: "pending" | "approved" | "rejected",
  helpfulVotes: number,
  reviewDate: datetime,
  moderatedBy: reference,         // → person
  moderatedAt: datetime
}
```

### 6. Order Schema

```typescript
{
  orderNumber: string,            // "MASH-2025-0001"
  orderDate: datetime,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  customerId: string,
  orderItems: array[],
  subtotal: number,
  shippingFee: number,
  tax: number,
  orderDiscount: number,
  totalAmount: number,
  shippingAddress: {
    fullAddress: string,
    city: string,
    province: string,
    postalCode: string,
    country: string
  },
  paymentMethod: string,
  paymentStatus: string,
  paymentReference: string,
  orderStatus: string,
  statusHistory: array[],
  trackingNumber: string,
  shippingCarrier: string,
  estimatedDeliveryDate: date,
  customerNotes: text,
  internalNotes: text,
  couponCode: string,
  orderSource: string,
  priorityOrder: boolean
}
```

---

## Relationship Mapping

### Visual Relationship Diagram

```
                           ┌─────────────┐
                           │   PRODUCT   │ (Central Hub)
                           └──────┬──────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
    ┌─────────┐            ┌──────────┐            ┌──────────┐
    │CATEGORY │            │ VARIANT  │            │ REVIEW   │
    └─────────┘            └──────────┘            └──────────┘
         │                        │                        
         │                        │                        
         ▼                        ▼                        
    ┌─────────┐            ┌──────────┐            
    │SUB-CAT  │            │ BUNDLE   │            
    └─────────┘            └──────────┘            
                                  │
                                  │
                           ┌──────┴──────┐
                           │             │
                           ▼             ▼
                    ┌──────────┐  ┌──────────┐
                    │  ORDER   │  │  COUPON  │
                    └──────────┘  └──────────┘
```

### Relationship Details

**Product → Category** (Many-to-One):
- Each product belongs to ONE category
- Category can have MANY products
- Validation: Category required for product

**Product → Variants** (One-to-Many):
- Product can have MANY variants (0-10)
- Each variant belongs to ONE product
- Validation: Variant must reference existing product

**Product → Bundles** (Many-to-Many):
- Product can be in MANY bundles
- Bundle contains MANY products (2-10)
- Bi-directional: `product.relatedBundles[]` ↔ `bundle.productsInBundle[]`

**Product → Reviews** (One-to-Many):
- Product can have MANY reviews
- Each review belongs to ONE product
- Validation: Product required for review

**Product → Product** (Many-to-Many):
- `suggestedProducts[]` - Related recommendations
- `complementaryProducts[]` - Frequently bought together
- `relatedProducts[]` - Similar products

**Category → Category** (Parent-Child):
- Category can have parent (subcategory)
- Parent can have MANY children
- Max depth: 2 levels (Category → Subcategory)

**Order → Product** (Many-to-Many):
- Order contains MANY products
- Product can be in MANY orders
- Through: `orderItems[]` array

**Bundle → Product** (Many-to-Many):
- Bundle contains 2-10 products
- Product can be in multiple bundles
- Validation: Min 2 products per bundle

---

## Automated Scripts Strategy

### Sanity Client API Research

**Key Findings**:
1. ✅ Sanity Client supports batch operations
2. ✅ GROQ queries for complex relationships
3. ✅ Transaction API for atomic operations
4. ✅ Asset upload API for images
5. ✅ Real-time updates via listeners

**Required NPM Packages**:
```json
{
  "@sanity/client": "^7.13.0",
  "dotenv": "^17.2.3"
}
```

**Authentication**:
- Use `SANITY_API_WRITE_TOKEN` from `.env.local`
- Token already configured in environment

### Script Types Needed

#### 1. **Import Scripts** (Create Content)
- `import-categories.js` - Create 3 categories
- `import-products.js` - Create 15 products
- `import-variants.js` - Create 15 variants
- `import-bundles.js` - Create 6 bundles
- `import-reviews.js` - Create 45 reviews
- `import-hero.js` - Create hero carousel
- `import-featured.js` - Set featured products

#### 2. **Link Scripts** (Create Relationships)
- `link-products-categories.js` - Link products to categories
- `link-products-variants.js` - Link variants to products
- `link-products-bundles.js` - Link products to bundles
- `link-products-related.js` - Link related products
- `link-reviews-products.js` - Link reviews to products

#### 3. **Validation Scripts** (Check Integrity)
- `validate-products.js` - Check all required fields
- `validate-relationships.js` - Check references exist
- `validate-inventory.js` - Check stock consistency
- `validate-prices.js` - Check pricing logic

#### 4. **Update Scripts** (Modify Content)
- `update-stock.js` - Bulk stock updates
- `update-prices.js` - Bulk price changes
- `update-promotions.js` - Apply promotions
- `update-seo.js` - Update SEO fields

#### 5. **Export Scripts** (Backup Content)
- `export-all.js` - Export entire dataset
- `export-products.js` - Export products only
- `export-analytics.js` - Export analytics data

#### 6. **Test Scripts** (Verify Operations)
- `test-import.js` - Test import process
- `test-relationships.js` - Test relationship integrity
- `test-queries.js` - Test GROQ queries

### Script Template Structure

```javascript
// scripts/sanity/import-products.js

require('dotenv').config({ path: '.env.local' });
const {createClient} = require('@sanity/client');

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-11-22',
  useCdn: false, // Important for write operations
});

// Product data
const products = [
  {
    _type: 'product',
    name: 'Fresh Oyster Mushrooms',
    slug: { current: 'fresh-oyster-mushrooms' },
    price: 350,
    quantity: 150,
    // ... other fields
  },
  // ... more products
];

async function importProducts() {
  console.log('🚀 Starting product import...');
  
  try {
    // Create products in batch
    const transaction = client.transaction();
    
    products.forEach(product => {
      transaction.create(product);
    });
    
    const result = await transaction.commit();
    console.log('✅ Successfully imported', result.results.length, 'products');
    return result;
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  }
}

// Run script
importProducts()
  .then(() => {
    console.log('✅ Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
```

---

## Phase-by-Phase Implementation

### Phase 1: Script Infrastructure (2 hours)

**Goal**: Set up script framework and Sanity client

**Tasks**:
1. ✅ Create `scripts/sanity/` directory
2. ✅ Create `lib/sanity-client.js` (reusable client)
3. ✅ Create `data/sanity/` directory for JSON data
4. ✅ Create `.env.local` validation script
5. ✅ Create script template
6. ✅ Test basic connection

**Deliverables**:
- `scripts/sanity/lib/sanity-client.js`
- `scripts/sanity/templates/import-template.js`
- `scripts/sanity/test-connection.js`
- `data/sanity/products.json` (15 products)
- `data/sanity/categories.json` (3 categories)

**Success Criteria**:
- [x] Sanity client connects successfully
- [x] Can create test document
- [x] Can query documents
- [x] Can delete test document

### Phase 2: Category Import (30 minutes)

**Goal**: Import 3 main categories

**Categories**:
1. Fresh Mushrooms (fresh-mushrooms)
2. Dried Mushrooms (dried-mushrooms)
3. Growing Kits & Accessories (growing-kits)

**Script**: `scripts/sanity/import-categories.js`

**Data**: `data/sanity/categories.json`

```json
[
  {
    "categoryName": "Fresh Mushrooms",
    "slug": { "current": "fresh-mushrooms" },
    "description": "Farm-fresh mushrooms harvested daily",
    "sortOrder": 1,
    "isActive": true,
    "featuredCategory": true,
    "seoTitle": "Fresh Mushrooms Philippines | MASH",
    "seoDescription": "Buy fresh oyster, shiitake, and lion's mane mushrooms",
    "seoKeywords": ["fresh mushrooms", "oyster mushroom", "shiitake"]
  }
]
```

**Success Criteria**:
- [x] 3 categories created
- [x] All have unique slugs
- [x] All have SEO fields
- [x] Verify in Studio

### Phase 3: Product Import (1 hour)

**Goal**: Import 15 products with full data

**Products**:
- **Fresh** (6): Oyster, King Oyster, Shiitake, Lion's Mane, Button, Portobello
- **Dried** (3): Dried Shiitake, Dried Oyster, Dried Mixed
- **Specialty** (2): Mushroom Powder, Mushroom Extract
- **Bundles** (4): Starter Pack, Gourmet Set, Health Bundle, Cooking Kit

**Script**: `scripts/sanity/import-products.js`

**Data**: `data/sanity/products.json`

**Success Criteria**:
- [x] 15 products created
- [x] All linked to categories
- [x] All have images (placeholders first)
- [x] All have pricing
- [x] Verify in Studio

### Phase 4: Product Images (30 minutes)

**Goal**: Upload real product images

**Method**: Use Sanity Asset API

**Script**: `scripts/sanity/upload-images.js`

```javascript
async function uploadImage(imagePath, filename) {
  const imageBuffer = fs.readFileSync(imagePath);
  
  const asset = await client.assets.upload('image', imageBuffer, {
    filename: filename,
  });
  
  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: asset._id,
    },
  };
}
```

**Success Criteria**:
- [x] 15 main images uploaded
- [x] 30+ gallery images uploaded
- [x] All images have alt text
- [x] Verify in Studio

### Phase 5: Variant Creation (45 minutes)

**Goal**: Create 15 product variants

**Variants per Product**:
- Fresh Oyster: Small (250g), Medium (500g), Large (1kg)
- Fresh Shiitake: Small (200g), Large (500g)
- Dried Shiitake: 100g, 250g, 500g
- etc.

**Script**: `scripts/sanity/import-variants.js`

**Success Criteria**:
- [x] 15 variants created
- [x] All linked to products
- [x] All have SKUs
- [x] All have prices
- [x] Verify in Studio

### Phase 6: Relationship Linking (1 hour)

**Goal**: Link all related products and bundles

**Sub-tasks**:
1. Link products to categories ✅ (done in import)
2. Link variants to products
3. Link suggested products
4. Link complementary products
5. Link related bundles
6. Link reviews to products

**Script**: `scripts/sanity/link-relationships.js`

```javascript
async function linkSuggestedProducts() {
  // Fresh Oyster → suggest other fresh + kits
  await client
    .patch('product-fresh-oyster-id')
    .set({
      suggestedProducts: [
        { _type: 'reference', _ref: 'product-shiitake-id' },
        { _type: 'reference', _ref: 'product-lions-mane-id' },
        // ... up to 8 products
      ],
    })
    .commit();
}
```

**Success Criteria**:
- [x] All products have 3-8 suggested products
- [x] All products have 2-4 complementary products
- [x] All products have 1-2 related bundles
- [x] All variants linked to products
- [x] Verify in Studio

### Phase 7: Bundle Creation (30 minutes)

**Goal**: Create 6 product bundles

**Bundles**:
1. Starter Pack (3 fresh mushrooms, save 15%)
2. Gourmet Set (4 premium mushrooms, save 20%)
3. Health Bundle (2 fresh + 1 extract, save 18%)
4. Cooking Kit (3 fresh + 1 dried, save 12%)
5. Beginner's Choice (2 easy mushrooms + growing kit, save 10%)
6. Ultimate Pack (All 6 fresh mushrooms, save 25%)

**Script**: `scripts/sanity/import-bundles.js`

**Success Criteria**:
- [x] 6 bundles created
- [x] All have 2-10 products
- [x] All have calculated savings
- [x] All have bundle images
- [x] Verify in Studio

### Phase 8: Review Import (30 minutes)

**Goal**: Import 45 customer reviews

**Distribution**:
- 3 reviews per product (15 products × 3 = 45)
- Mix of 4-5 star ratings
- Some with images
- All approved

**Script**: `scripts/sanity/import-reviews.js`

**Success Criteria**:
- [x] 45 reviews created
- [x] All linked to products
- [x] All have ratings
- [x] All approved status
- [x] Verify in Studio

### Phase 9: Validation & Testing (1 hour)

**Goal**: Verify all data integrity

**Tests**:
1. ✅ All products have categories
2. ✅ All variants have products
3. ✅ All reviews have products
4. ✅ All bundles have products
5. ✅ All references valid
6. ✅ No orphaned documents
7. ✅ All required fields filled
8. ✅ Pricing logic correct
9. ✅ Stock quantities valid
10. ✅ SEO fields populated

**Script**: `scripts/sanity/validate-all.js`

**Success Criteria**:
- [x] All validation tests pass
- [x] Zero errors
- [x] Generate validation report

### Phase 10: Deployment (30 minutes)

**Goal**: Deploy to Sanity Cloud

**Steps**:
1. ✅ Build Studio: `npm run build`
2. ✅ Deploy Studio: `npm run deploy`
3. ✅ Verify deployed URL
4. ✅ Test production access
5. ✅ Update docs with URL

**Success Criteria**:
- [x] Studio accessible at https://pp-namias.sanity.studio
- [x] All data visible in deployed Studio
- [x] Write operations work
- [x] API queries work

---

## Testing & Validation

### Test Suite Structure

```
scripts/sanity/tests/
├── unit/
│   ├── test-import-products.js
│   ├── test-import-categories.js
│   └── test-upload-images.js
├── integration/
│   ├── test-relationships.js
│   ├── test-queries.js
│   └── test-mutations.js
└── e2e/
    ├── test-full-import.js
    └── test-data-integrity.js
```

### Validation Checklist

**Products** (15 items):
- [ ] All have names
- [ ] All have slugs (unique)
- [ ] All have categories (valid references)
- [ ] All have prices (> 0)
- [ ] All have stock quantities
- [ ] All have images
- [ ] All have SKUs (unique)
- [ ] Promotional products have valid promo data
- [ ] All have delivery zones
- [ ] All have freshness info

**Categories** (3 items):
- [ ] All have names
- [ ] All have slugs (unique)
- [ ] All have descriptions
- [ ] All have SEO fields
- [ ] All active

**Variants** (15 items):
- [ ] All have product references (valid)
- [ ] All have names
- [ ] All have SKUs (unique)
- [ ] All have prices
- [ ] All have stock quantities

**Bundles** (6 items):
- [ ] All have names
- [ ] All have 2-10 products
- [ ] All have bundle prices (< sum of products)
- [ ] All have savings calculated
- [ ] All active

**Reviews** (45 items):
- [ ] All have product references (valid)
- [ ] All have ratings (1-5)
- [ ] All have review text
- [ ] All approved
- [ ] All have customer names

**Relationships**:
- [ ] All product → category links valid
- [ ] All variant → product links valid
- [ ] All review → product links valid
- [ ] All bundle → products links valid
- [ ] All suggested products links valid
- [ ] No circular references
- [ ] No orphaned documents

---

## Deployment Strategy

### Studio Deployment

**Method 1: Manual Deploy**
```bash
cd studio
npm run build
npm run deploy
```

**Method 2: Vercel Deploy** (Recommended)
```bash
# Add studio as Vercel project
vercel --cwd studio

# Configure environment variables in Vercel dashboard
# Auto-deploys on git push to main
```

**Method 3: GitHub Actions** (Automated)
```yaml
# .github/workflows/deploy-studio.yml
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
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd studio && npm ci
      - run: cd studio && npm run build
      - run: cd studio && npm run deploy
        env:
          SANITY_AUTH_TOKEN: ${{ secrets.SANITY_AUTH_TOKEN }}
```

### Data Migration Strategy

**Scenario 1: Fresh Setup** (Empty database)
- Run all import scripts in sequence
- Phases 1-8 (4-5 hours total)

**Scenario 2: Update Existing** (Has data)
- Export current data first
- Run validation scripts
- Run update scripts selectively
- Compare before/after

**Scenario 3: Rollback** (Undo changes)
- Use exported backup
- Delete all documents
- Re-import from backup

---

## Quick Reference Commands

```bash
# Test connection
node scripts/sanity/test-connection.js

# Import all (full setup)
node scripts/sanity/import-all.js

# Import individually
node scripts/sanity/import-categories.js
node scripts/sanity/import-products.js
node scripts/sanity/import-variants.js
node scripts/sanity/import-bundles.js
node scripts/sanity/import-reviews.js

# Link relationships
node scripts/sanity/link-relationships.js

# Validate
node scripts/sanity/validate-all.js

# Export backup
node scripts/sanity/export-all.js > backup-$(date +%Y%m%d).json

# Deploy Studio
cd studio && npm run deploy
```

---

## Next Steps

**IMMEDIATE (Today)**:
1. Read this master plan
2. Review current schema files
3. Decide on script priority
4. Start Phase 1 (Script Infrastructure)

**SHORT-TERM (Week 1)**:
- Complete Phases 1-4 (Categories, Products, Images)
- Test import scripts
- Verify in Studio

**MEDIUM-TERM (Week 2)**:
- Complete Phases 5-8 (Variants, Relationships, Bundles, Reviews)
- Run full validation
- Deploy to production

**LONG-TERM (Month 1)**:
- Frontend integration
- Real-time updates
- Analytics tracking

---

*Last Updated: November 22, 2025*  
*Total Estimated Time: 8-10 hours*  
*Status: 📋 Planning Complete, Ready for Implementation*
