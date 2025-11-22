# Sanity CMS Complete Schema Reference

**Project**: PP_Namias Sanity CMS (gerattrr)  
**Last Updated**: November 22, 2025  
**Purpose**: Single source of truth for all Sanity schema types  
**Total Schemas**: 17 types (13 documents, 3 singletons, 4 objects)

---

## 📋 Table of Contents

1. [Schema Overview](#schema-overview)
2. [E-Commerce Documents](#e-commerce-documents)
3. [Content Documents](#content-documents)
4. [Singletons](#singletons)
5. [Objects (Reusable Components)](#objects-reusable-components)
6. [Field Reference Guide](#field-reference-guide)
7. [Relationship Matrix](#relationship-matrix)
8. [Validation Rules](#validation-rules)

---

## Schema Overview

### Document Distribution

```
E-Commerce Documents (8):
├── product (25+ fields) - Main product catalog
├── category (11 fields) - Product categories
├── productVariant (17 fields) - Size/weight options
├── productBundle (14 fields) - Package deals
├── review (11 fields) - Customer reviews
├── order (20+ fields) - Order management
├── coupon (15 fields) - Discount codes
└── promotion (18 fields) - Marketing campaigns

Content Documents (5):
├── page (6 fields) - CMS pages
├── post (7 fields) - Blog posts
├── person (4 fields) - Blog authors/team
├── emailCampaign (15 fields) - Email marketing
└── analytics (12 fields) - Analytics reports

Singletons (3):
├── settings (3 fields) - Global site config
├── featuredProducts (3 fields) - Homepage products
└── heroCarousel (2 fields) - Homepage hero slider

Objects (4):
├── blockContent - Rich text editor
├── callToAction - CTA buttons
├── infoSection - Content sections
└── link - Link objects
```

---

## E-Commerce Documents

### 1. Product Schema (25+ Fields, 9 Categories)

**File**: `studio/src/schemaTypes/documents/product.ts` (623 lines)  
**Type**: `product`  
**Icon**: 🛍️  
**Description**: Main product catalog with full e-commerce features

#### Category 1: Basic Information (7 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | ✅ Yes | Product name | "Fresh Oyster Mushrooms" |
| `slug` | slug | ✅ Yes | URL-friendly identifier | "fresh-oyster-mushrooms" |
| `description` | blockContent | ✅ Yes | Full product description (rich text) | "Our oyster mushrooms are..." |
| `shortDescription` | string | ❌ No | Brief description for product cards | "Farm-fresh oyster mushrooms" |
| `image` | image | ✅ Yes | Main product image | Upload from Unsplash/local |
| `images` | image[] | ❌ No | Additional gallery images (2-4) | Multiple images |
| `SKU` | string | ✅ Yes | Stock Keeping Unit (unique) | "MUSH-OYS-001" |

#### Category 2: Pricing (7 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `price` | number | ✅ Yes | Regular price in pesos | 350 |
| `isOnPromo` | boolean | ❌ No | Enable promotional pricing | false |
| `promoType` | string | ❌ No | "percentage" or "fixed" | "percentage" |
| `promoPercentage` | number | ❌ No | Discount percentage (0-100) | 22 |
| `promoPrice` | number | ❌ No | Calculated discounted price | 273 |
| `promoEndDate` | datetime | ❌ No | Promotion expiration | 2025-12-31 |
| `compareAtPrice` | number | ❌ No | Original price (for strikethrough) | 450 |

#### Category 3: Inventory Management (6 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `quantity` | number | ✅ Yes | Current stock quantity | 150 |
| `inventory.quantityInStock` | number | ✅ Yes | Stock quantity (duplicate for history) | 150 |
| `inventory.lowStockThreshold` | number | ❌ No | Alert threshold | 20 |
| `inventory.trackInventory` | boolean | ❌ No | Enable inventory tracking | true |
| `inventory.allowBackorders` | boolean | ❌ No | Allow orders when out of stock | false |
| `inventory.stockHistory` | array | ❌ No | Automatic stock change log | Auto-tracked |

#### Category 4: Product Variants (4 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `hasVariants` | boolean | ❌ No | Product has size/color/weight options | true |
| `variants` | reference[] | ❌ No | Array of productVariant references | [ref1, ref2, ref3] |
| `weight` | number | ❌ No | Default weight in grams | 500 |
| `unit` | string | ❌ No | Unit of measurement | "grams" / "kg" / "piece" |

#### Category 5: Smart Recommendations (5 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `suggestedProducts` | reference[] | ❌ No | "You May Also Like" (max 8) | [shiitake, lions-mane] |
| `relatedProducts` | reference[] | ❌ No | Similar products | [button, portobello] |
| `complementaryProducts` | reference[] | ❌ No | "Frequently Bought Together" (max 4) | [garlic, butter] |
| `relatedBundles` | reference[] | ❌ No | Package deals (max 2) | [starter-pack] |
| `productTags` | string[] | ❌ No | Search tags | ["bestseller", "organic"] |

#### Category 6: Freshness & Quality (4 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `freshnessInfo.harvestWindow` | string | ❌ No | Harvest to delivery time | "Harvested within 24 hours" |
| `freshnessInfo.shelfLife` | string | ❌ No | Storage duration | "5-7 days refrigerated" |
| `freshnessInfo.storageInstructions` | text | ❌ No | How to store | "Keep in paper bag, refrigerate" |
| `freshnessInfo.qualityIndicators` | string[] | ❌ No | Quality signs | ["firm texture", "no dark spots"] |

#### Category 7: Preparation & Cooking (4 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `preparationInfo.difficultyLevel` | string | ❌ No | "beginner" / "intermediate" / "advanced" | "beginner" |
| `preparationInfo.cookingTime` | number | ❌ No | Cooking time in minutes | 15 |
| `preparationInfo.preparationTips` | string[] | ❌ No | Step-by-step tips | ["Clean with damp cloth"] |
| `preparationInfo.recipeIdeas` | array | ❌ No | Recipe suggestions | ["Garlic butter sauté"] |

#### Category 8: Lalamove Same-Day Delivery (6 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `deliveryOptions.sameDayDeliveryEligible` | boolean | ❌ No | Enable Lalamove delivery | true |
| `deliveryOptions.deliveryZones` | string[] | ❌ No | Available delivery areas | ["Metro Manila", "QC"] |
| `deliveryOptions.perishable` | boolean | ❌ No | Special handling required | true |
| `deliveryWeight.packageWeight` | number | ❌ No | Weight in kg (for Lalamove pricing) | 0.5 |
| `deliveryWeight.packageDimensions.length` | number | ❌ No | Package length in cm | 20 |
| `deliveryWeight.packageDimensions.width` | number | ❌ No | Package width in cm | 15 |
| `deliveryWeight.packageDimensions.height` | number | ❌ No | Package height in cm | 10 |

#### Category 9: SEO & Discovery (3 fields)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `searchKeywords` | string[] | ❌ No | Additional search terms | ["oyster", "pleurotus"] |
| `nutritionalHighlights` | array | ❌ No | Health benefits (checkboxes) | ["High Vitamin D", "Low Calorie"] |
| `isFeatured` | boolean | ❌ No | Show on homepage | false |

---

### 2. Category Schema (11 Fields)

**File**: `studio/src/schemaTypes/documents/category.ts`  
**Type**: `category`  
**Icon**: 📁  
**Description**: Product categories with parent-child support

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `categoryName` | string | ✅ Yes | Category name | "Fresh Mushrooms" |
| `slug` | slug | ✅ Yes | URL-friendly identifier | "fresh-mushrooms" |
| `parentCategory` | reference | ❌ No | Parent category (for subcategories) | null or ref |
| `categoryImage` | image | ❌ No | Category thumbnail | Upload image |
| `description` | blockContent | ❌ No | Category description | "Farm-fresh mushrooms..." |
| `featuredCategory` | boolean | ❌ No | Show on homepage | true |
| `isActive` | boolean | ❌ No | Enable/disable category | true |
| `sortOrder` | number | ❌ No | Display order (lower = first) | 1 |
| `seoTitle` | string | ❌ No | SEO title (50-60 chars) | "Fresh Mushrooms Philippines" |
| `seoDescription` | string | ❌ No | SEO description (150-160 chars) | "Buy fresh oyster..." |
| `seoKeywords` | string[] | ❌ No | SEO keywords | ["fresh mushrooms", "oyster"] |

**Hierarchy**: Categories support 2 levels (Main → Subcategory)  
**Example**: Fresh Mushrooms → Oyster Mushrooms (if using subcategories)

---

### 3. Product Variant Schema (17 Fields)

**File**: `studio/src/schemaTypes/documents/productVariant.ts`  
**Type**: `productVariant`  
**Icon**: 🔢  
**Description**: Size, weight, and color options for products

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `product` | reference | ✅ Yes | Parent product | Reference to product |
| `name` | string | ✅ Yes | Full variant name | "King Oyster - Large" |
| `slug` | slug | ✅ Yes | URL-friendly identifier | "king-oyster-large" |
| `variantName` | string | ✅ Yes | Display name | "Large (600g)" |
| `SKU` | string | ✅ Yes | Unique SKU | "MUSH-OYS-L-001" |
| `variantType` | string | ❌ No | Type of variant | "Size" / "Weight" / "Color" |
| `variantValue` | string | ❌ No | Variant value | "Large (600g)" |
| `size` | string | ❌ No | Size option | "Small" / "Medium" / "Large" |
| `color` | string | ❌ No | Color option | "White" / "Brown" |
| `weight` | string | ❌ No | Weight specification | "250g" / "500g" / "1kg" |
| `weightUnit` | string | ❌ No | Weight unit | "grams" / "kg" |
| `customAttribute` | string | ❌ No | Custom attribute | "Fresh" / "Dried" / "Organic" |
| `price` | number | ❌ No | Variant price (overrides base) | 450 |
| `compareAtPrice` | number | ❌ No | Original price | 550 |
| `stockQuantity` | number | ❌ No | Stock for this variant | 75 |
| `lowStockThreshold` | number | ❌ No | Low stock alert | 10 |
| `variantImages` | image[] | ❌ No | Variant-specific images | [image1, image2] |
| `availableForPurchase` | boolean | ❌ No | Enable/disable variant | true |
| `defaultVariant` | boolean | ❌ No | Default selected variant | false |
| `sortOrder` | number | ❌ No | Display order | 1 |

**Typical Usage**:
- Fresh Oyster: Small (250g), Medium (500g), Large (1kg)
- Dried Shiitake: 100g, 250g, 500g
- Growing Kits: Beginner, Intermediate, Advanced

---

### 4. Product Bundle Schema (14 Fields)

**File**: `studio/src/schemaTypes/documents/productBundle.ts`  
**Type**: `productBundle`  
**Icon**: 📦  
**Description**: Package deals with savings

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `bundleName` | string | ✅ Yes | Bundle name | "Gourmet Starter Pack" |
| `slug` | slug | ✅ Yes | URL-friendly identifier | "gourmet-starter-pack" |
| `description` | text | ❌ No | Bundle description | "Perfect for beginners..." |
| `tagline` | string | ❌ No | Promotional tagline | "Save 20%!" |
| `productsInBundle` | reference[] | ✅ Yes | Products (2-10 min/max) | [oyster, shiitake, kit] |
| `bundlePrice` | number | ✅ Yes | Special bundle price | 1200 |
| `discountPercentage` | number | ❌ No | Discount % (auto-calculated) | 20 |
| `savingsAmount` | number | ❌ No | Amount saved (auto-calculated) | 300 |
| `bundleImage` | image | ❌ No | Main bundle image | Upload image |
| `additionalImages` | image[] | ❌ No | Gallery images | [image1, image2] |
| `bundleActive` | boolean | ❌ No | Enable/disable bundle | true |
| `availableFrom` | datetime | ❌ No | Start date | 2025-01-01 |
| `availableUntil` | datetime | ❌ No | End date | 2025-12-31 |
| `stockLimit` | number | ❌ No | Max bundles available | 50 |
| `featuredBundle` | boolean | ❌ No | Show on homepage | true |
| `badge` | string | ❌ No | Display badge | "Best Value" |
| `sortOrder` | number | ❌ No | Display order | 1 |
| `seoSettings.metaTitle` | string | ❌ No | SEO title | "Gourmet Mushroom Bundle" |
| `seoSettings.metaDescription` | string | ❌ No | SEO description | "Save 20% on premium..." |

**Validation**: Bundle price must be less than sum of individual prices

---

### 5. Review Schema (11 Fields)

**File**: `studio/src/schemaTypes/documents/review.ts`  
**Type**: `review`  
**Icon**: ⭐  
**Description**: Customer reviews with moderation

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `product` | reference | ✅ Yes | Product being reviewed | Reference to product |
| `customerName` | string | ✅ Yes | Customer name | "Juan Dela Cruz" |
| `customerEmail` | string | ✅ Yes | Customer email | "juan@example.com" |
| `rating` | number | ✅ Yes | Star rating (1-5) | 5 |
| `reviewTitle` | string | ❌ No | Review summary | "Excellent quality!" |
| `reviewContent` | blockContent | ✅ Yes | Detailed review | "These mushrooms are..." |
| `reviewImages` | image[] | ❌ No | Customer photos | [photo1, photo2] |
| `verifiedPurchase` | boolean | ❌ No | Customer bought product | true |
| `reviewStatus` | string | ❌ No | "pending" / "approved" / "rejected" | "approved" |
| `helpfulVotes` | number | ❌ No | Helpful vote count | 12 |
| `reviewDate` | datetime | ✅ Yes | Review submission date | 2025-11-20 |
| `moderatedBy` | reference | ❌ No | Admin who moderated | Reference to person |
| `moderatedAt` | datetime | ❌ No | Moderation timestamp | 2025-11-21 |

**Moderation Workflow**: pending → approved/rejected

---

## Content Documents

### 6. Page Schema (6 Fields)

**File**: `studio/src/schemaTypes/documents/page.ts`  
**Type**: `page`  
**Description**: CMS pages (About, Contact, FAQ, etc.)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | Page name |
| `slug` | slug | ✅ Yes | URL identifier |
| `heading` | string | ❌ No | Page heading |
| `subheading` | string | ❌ No | Page subheading |
| `pageBuilder` | array | ❌ No | Content sections |

---

### 7. Post Schema (7 Fields)

**File**: `studio/src/schemaTypes/documents/post.ts`  
**Type**: `post`  
**Description**: Blog posts

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ Yes | Post title |
| `slug` | slug | ✅ Yes | URL identifier |
| `content` | blockContent | ✅ Yes | Post content |
| `excerpt` | text | ❌ No | Short summary |
| `coverImage` | image | ❌ No | Featured image |
| `date` | datetime | ❌ No | Publish date |
| `author` | reference | ❌ No | Author (person) |

---

### 8. Person Schema (4 Fields)

**File**: `studio/src/schemaTypes/documents/person.ts`  
**Type**: `person`  
**Description**: Blog authors and team members

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ Yes | First name |
| `lastName` | string | ✅ Yes | Last name |
| `picture` | image | ❌ No | Profile photo |

---

## Singletons

### 9. Settings Singleton

**File**: `studio/src/schemaTypes/singletons/settings.ts`  
**Type**: `settings`  
**Description**: Global site configuration

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Site title |
| `description` | blockContent | Site description |
| `ogImage` | image | Social media image |

---

### 10. Featured Products Singleton

**File**: `studio/src/schemaTypes/singletons/featuredProducts.ts`  
**Type**: `featuredProducts`  
**Description**: Homepage featured products section

| Field | Type | Description |
|-------|------|-------------|
| `sectionTitle` | string | Section title |
| `sectionSubtitle` | string | Section subtitle |
| `featuredProducts` | reference[] | 4-8 products to feature |

---

### 11. Hero Carousel Singleton

**File**: `studio/src/schemaTypes/singletons/heroCarousel.ts`  
**Type**: `heroCarousel`  
**Description**: Homepage hero slider

| Field | Type | Description |
|-------|------|-------------|
| `heroSlides` | array | 3-5 hero slides (title, subtitle, button, background) |

---

## Objects (Reusable Components)

### 12. Block Content Object

**File**: `studio/src/schemaTypes/objects/blockContent.ts`  
**Type**: `blockContent`  
**Description**: Rich text editor with formatting options

---

### 13. Call to Action Object

**File**: `studio/src/schemaTypes/objects/callToAction.ts`  
**Type**: `callToAction`  
**Description**: CTA button component

---

### 14. Info Section Object

**File**: `studio/src/schemaTypes/objects/infoSection.ts`  
**Type**: `infoSection`  
**Description**: Content section component

---

### 15. Link Object

**File**: `studio/src/schemaTypes/objects/link.ts`  
**Type**: `link`  
**Description**: Link component

---

## Field Reference Guide

### Common Field Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Short text | "Product Name" |
| `text` | Long text | "Full description..." |
| `number` | Numeric value | 350 |
| `boolean` | True/false | true |
| `datetime` | Date and time | 2025-11-22T15:00:00Z |
| `date` | Date only | 2025-11-22 |
| `slug` | URL-friendly text | {current: "product-name"} |
| `image` | Image asset | {asset: {_ref: "image-..."}} |
| `reference` | Link to document | {_ref: "product-123"} |
| `array` | List of items | [item1, item2, item3] |
| `blockContent` | Rich text | Rich text with formatting |

---

## Relationship Matrix

| Source | Target | Type | Description |
|--------|--------|------|-------------|
| Product | Category | Many-to-One | Each product has ONE category |
| Product | Variant | One-to-Many | Product can have MANY variants |
| Product | Bundle | Many-to-Many | Product can be in MANY bundles |
| Product | Review | One-to-Many | Product can have MANY reviews |
| Product | Product | Many-to-Many | Suggested/complementary products |
| Category | Category | Parent-Child | Category can have parent |
| Order | Product | Many-to-Many | Order contains MANY products |
| Review | Product | Many-to-One | Review belongs to ONE product |
| Variant | Product | Many-to-One | Variant belongs to ONE product |
| Bundle | Product | Many-to-Many | Bundle contains 2-10 products |

---

## Validation Rules

### Product Validation

- ✅ Name required (min 3 chars)
- ✅ Slug required (must be unique)
- ✅ SKU required (must be unique)
- ✅ Category required
- ✅ Price required (> 0)
- ✅ Quantity required (≥ 0)
- ✅ If `isOnPromo` = true, `promoPrice` required
- ✅ If `isOnPromo` = true, `promoEndDate` required
- ✅ If `hasVariants` = true, `variants[]` required

### Category Validation

- ✅ Name required (min 3 chars)
- ✅ Slug required (must be unique)
- ✅ Max 2 levels (Category → Subcategory)

### Variant Validation

- ✅ Product reference required
- ✅ Name required
- ✅ SKU required (must be unique)
- ✅ If price set, must be > 0

### Bundle Validation

- ✅ Name required
- ✅ Products required (min 2, max 10)
- ✅ Bundle price < sum of individual prices

### Review Validation

- ✅ Product reference required
- ✅ Customer name required
- ✅ Rating required (1-5)
- ✅ Review content required (min 10 chars)

---

**End of Schema Reference**  
**Last Updated**: November 22, 2025  
**For Updates**: Edit individual schema files in `studio/src/schemaTypes/`
