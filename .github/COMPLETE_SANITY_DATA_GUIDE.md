# 🚀 Complete Sanity Data Entry Guide - Many Products & Categories

**Date:** November 20, 2025  
**Purpose:** Add 30+ products across 12+ categories with full schema support  
**Time Required:** 60-90 minutes  
**Result:** Professional e-commerce catalog with nested categories, promotions, and featured products

---

## 🎯 What You'll Build

By following this guide, you'll have:

✅ **12+ Main Categories** (Fresh, Dried, Organic, Specialty, Bundles, etc.)  
✅ **Subcategories** (e.g., Fresh → Fresh Shiitake, Fresh Oyster)  
✅ **30+ Products** with complete details  
✅ **Product Promotions** (percentage discounts and fixed prices)  
✅ **Featured Products** for homepage carousel  
✅ **Stock Management** with quantities  
✅ **Product Gallery** support (multiple images)  
✅ **Proper Category Connections** (products linked to categories)

---

## 📋 Your Complete Sanity Schema Reference

### Category Schema Fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | Text | ✅ Yes | Category name (e.g., "Fresh Shiitake") |
| **Slug** | Slug | ✅ Yes | Auto-generated from name |
| **Parent Category** | Reference | ❌ No | Link to parent (for subcategories) |
| **Image** | Image | ❌ No | Category thumbnail |
| **Description** | Text | ❌ No | Category description |

### Product Schema Fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Product Name** | Text | ✅ Yes | Full product name |
| **Slug** | Slug | ✅ Yes | Auto-generated URL |
| **Product Image** | Image | ✅ Yes | Main product photo |
| **Category** | Reference | ✅ Yes | Link to category |
| **Regular Price** | Number | ✅ Yes | Base price (₱) |
| **On Promotion** | Boolean | ❌ No | Enable promotion |
| **Promotion Type** | Select | ❌ No | "percentage" or "fixed" |
| **Discount Percentage** | Number | ❌ No | % off (1-99) |
| **Promotional Price** | Number | ❌ No | Fixed promo price |
| **Promotion End Date** | DateTime | ❌ No | When promo expires |
| **Quantity in Stock** | Number | ✅ Yes | Stock quantity |
| **Description** | Text | ✅ Yes | Product description |
| **SKU** | Text | ❌ No | Product code |
| **Available for Purchase** | Boolean | ❌ No | Enable/disable |
| **Additional Images** | Image Array | ❌ No | Product gallery |
| **Weight** | Number | ❌ No | Product weight |
| **Unit of Measurement** | Select | ❌ No | g, kg, pcs, pack, box |
| **Featured Product** | Boolean | ❌ No | Show on homepage |
| **Compare at Price** | Number | ❌ No | Original price |

---

## 🗂️ Category Structure (Hierarchical)

We'll create **main categories** and **subcategories** for better organization:

```
📁 Fresh Mushrooms (MAIN)
   ├── Fresh Shiitake
   ├── Fresh Oyster
   ├── Fresh Button
   └── Fresh Enoki

📁 Dried Mushrooms (MAIN)
   ├── Dried Shiitake
   ├── Dried Oyster
   └── Dried Mixed

📁 Organic Collection (MAIN)
   ├── Organic Shiitake
   ├── Organic Oyster
   └── Organic King Oyster

📁 Specialty Mushrooms (MAIN)
   ├── King Oyster
   ├── Maitake
   └── Lion's Mane

📁 Mushroom Products (MAIN)
   ├── Mushroom Powder
   ├── Mushroom Seasoning
   └── Mushroom Extracts

📁 Gift Bundles (MAIN)
   ├── Starter Pack
   ├── Premium Collection
   └── Family Bundle
```

---

## ⚡ Step-by-Step Implementation

### Step 1: Open Sanity Studio

1. **Go to:** https://mash-ecommerce.sanity.studio
2. **Sign in** with your Google account (jkrbn99@gmail.com)
3. **Wait** for Sanity Studio dashboard to load
4. **Verify** you see "Product Category" and "Product" in the sidebar

---

### Step 2: Create Main Categories (15 minutes)

**Instructions:**
1. Click **"Product Category"** in left sidebar
2. Click **"+ Create"** button (top right)
3. Fill in fields below
4. **Leave "Parent Category" EMPTY** (these are main categories)
5. Click **"Publish"** (green button bottom right)

#### Main Category 1: Fresh Mushrooms
```yaml
Name: Fresh Mushrooms
Slug: (auto-generated: fresh-mushrooms)
Parent Category: (leave empty - this is a main category)
Description: Fresh, farm-harvested mushrooms delivered daily. Perfect for immediate cooking and maximum flavor.
Image: (You'll upload later - skip for now)
```
**Click "Publish"** ✅

#### Main Category 2: Dried Mushrooms
```yaml
Name: Dried Mushrooms
Slug: (auto: dried-mushrooms)
Parent Category: (empty)
Description: Sun-dried and premium dried mushrooms with extended shelf life. Perfect for soups and long-term storage.
Image: (skip for now)
```
**Click "Publish"** ✅

#### Main Category 3: Organic Collection
```yaml
Name: Organic Collection
Slug: (auto: organic-collection)
Parent Category: (empty)
Description: Certified organic mushrooms grown without pesticides or chemicals. Premium quality for health-conscious customers.
Image: (skip for now)
```
**Click "Publish"** ✅

#### Main Category 4: Specialty Mushrooms
```yaml
Name: Specialty Mushrooms
Slug: (auto: specialty-mushrooms)
Parent Category: (empty)
Description: Rare and exotic mushroom varieties with unique flavors and textures. For adventurous cooks.
Image: (skip for now)
```
**Click "Publish"** ✅

#### Main Category 5: Mushroom Products
```yaml
Name: Mushroom Products
Slug: (auto: mushroom-products)
Parent Category: (empty)
Description: Value-added mushroom products including powders, seasonings, and extracts.
Image: (skip for now)
```
**Click "Publish"** ✅

#### Main Category 6: Gift Bundles
```yaml
Name: Gift Bundles
Slug: (auto: gift-bundles)
Parent Category: (empty)
Description: Curated mushroom variety packs perfect for gifts or trying multiple varieties.
Image: (skip for now)
```
**Click "Publish"** ✅

**✅ Checkpoint:** You should now have 6 main categories in Sanity!

---

### Step 3: Create Subcategories (15 minutes)

Now create subcategories **under the main categories**.

**Instructions:**
1. Click **"Product Category"** → **"+ Create"**
2. **Select "Parent Category"** from dropdown (this makes it a subcategory!)
3. Fill in other fields
4. **Click "Publish"**

#### Subcategory 1: Fresh Shiitake (under Fresh Mushrooms)
```yaml
Name: Fresh Shiitake
Slug: (auto: fresh-shiitake)
Parent Category: Fresh Mushrooms ← SELECT THIS!
Description: Fresh shiitake mushrooms with rich umami flavor. Harvested daily from local farms.
Image: (skip for now)
```
**Click "Publish"** ✅

#### Subcategory 2: Fresh Oyster (under Fresh Mushrooms)
```yaml
Name: Fresh Oyster
Slug: (auto: fresh-oyster)
Parent Category: Fresh Mushrooms ← SELECT THIS!
Description: Delicate oyster mushrooms with mild flavor. Perfect for stir-fries and grilling.
Image: (skip)
```
**Click "Publish"** ✅

#### Subcategory 3: Fresh Button (under Fresh Mushrooms)
```yaml
Name: Fresh Button
Slug: (auto: fresh-button)
Parent Category: Fresh Mushrooms ← SELECT!
Description: Classic white button mushrooms. Versatile for any dish.
Image: (skip)
```
**Click "Publish"** ✅

#### Subcategory 4: Fresh Enoki (under Fresh Mushrooms)
```yaml
Name: Fresh Enoki
Slug: (auto: fresh-enoki)
Parent Category: Fresh Mushrooms ← SELECT!
Description: Delicate enoki mushrooms perfect for hot pots and salads.
Image: (skip)
```
**Click "Publish"** ✅

#### Subcategory 5: Dried Shiitake (under Dried Mushrooms)
```yaml
Name: Dried Shiitake
Slug: (auto: dried-shiitake)
Parent Category: Dried Mushrooms ← SELECT!
Description: Premium dried shiitake with concentrated umami flavor.
Image: (skip)
```
**Click "Publish"** ✅

#### Subcategory 6: Dried Oyster (under Dried Mushrooms)
```yaml
Name: Dried Oyster
Slug: (auto: dried-oyster)
Parent Category: Dried Mushrooms ← SELECT!
Description: Sun-dried oyster mushrooms for long shelf life.
Image: (skip)
```
**Click "Publish"** ✅

**✅ Checkpoint:** You should now have 6 main categories + 6 subcategories = 12 total categories!

---

### Step 4: Add Products with FULL Details (30-40 minutes)

Now add products with **ALL fields filled in** including promotions, stock, and featured status.

**Instructions:**
1. Click **"Product"** in left sidebar
2. Click **"+ Create"**
3. **Fill ALL fields carefully** (see templates below)
4. **Select category from dropdown** (use subcategories for better organization!)
5. **Click "Publish"**

---

## 📦 30+ Sample Products (Copy & Paste Ready)

### Fresh Shiitake Products (5 products)

#### Product 1: Premium Fresh Shiitake 🌟 FEATURED
```yaml
Product Name: Premium Fresh Shiitake
Slug: (auto: premium-fresh-shiitake)
Product Image: [Upload shiitake image] (YOU provide image)
Category: Fresh Shiitake ← SELECT subcategory!

Regular Price: 450
On Promotion: ✅ YES (check the box)
Promotion Type: Percentage Discount ← SELECT
Discount Percentage: 15 (means 15% off)
Promotional Price: (leave empty - not used for percentage)
Promotion End Date: (optional - set future date like Dec 31, 2025)

Quantity in Stock: 50
Description: Premium fresh shiitake mushrooms harvested daily from local organic farms. Rich umami flavor perfect for soups, stir-fries, and Asian cuisine. High in vitamins D and B. Best used within 5 days of delivery.

SKU: FSH-001
Available for Purchase: ✅ YES (check)
Additional Images: [Upload 2-3 more shiitake images] (optional)
Weight: 250
Unit of Measurement: g ← SELECT
Featured Product: ✅ YES (check - shows on homepage!)
Compare at Price: 450 (original price before discount)
```
**Click "Publish"** ✅

#### Product 2: Organic Fresh Shiitake 🌟 FEATURED
```yaml
Product Name: Organic Fresh Shiitake
Slug: (auto: organic-fresh-shiitake)
Product Image: [Upload image]
Category: Fresh Shiitake

Regular Price: 580
On Promotion: ❌ NO
Quantity in Stock: 30
Description: Certified organic shiitake mushrooms grown without pesticides or chemicals. Premium quality with authentic forest-grown flavor. Perfect for health-conscious customers who demand the best.

SKU: FSH-002
Available for Purchase: ✅ YES
Weight: 200
Unit of Measurement: g
Featured Product: ✅ YES (homepage!)
Compare at Price: (leave empty)
```
**Click "Publish"** ✅

#### Product 3: Fresh Shiitake Value Pack
```yaml
Product Name: Fresh Shiitake Value Pack
Slug: (auto: fresh-shiitake-value-pack)
Product Image: [Upload image]
Category: Fresh Shiitake

Regular Price: 850
On Promotion: ✅ YES
Promotion Type: Fixed Price
Discount Percentage: (leave empty)
Promotional Price: 750
Promotion End Date: 2025-12-31

Quantity in Stock: 25
Description: Bulk pack of fresh shiitake mushrooms for families or meal prep. Great value for regular mushroom lovers. Contains approximately 500g of premium shiitake.

SKU: FSH-003
Available for Purchase: ✅ YES
Weight: 500
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: 850
```
**Click "Publish"** ✅

#### Product 4: Baby Shiitake Mushrooms
```yaml
Product Name: Baby Shiitake Mushrooms
Slug: (auto: baby-shiitake-mushrooms)
Product Image: [Upload image]
Category: Fresh Shiitake

Regular Price: 520
On Promotion: ❌ NO
Quantity in Stock: 20
Description: Tender baby shiitake mushrooms perfect for whole roasting or grilling. Premium selection of young mushrooms with delicate flavor and texture.

SKU: FSH-004
Available for Purchase: ✅ YES
Weight: 150
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 5: Fresh Shiitake Family Pack
```yaml
Product Name: Fresh Shiitake Family Pack
Slug: (auto: fresh-shiitake-family-pack)
Product Image: [Upload image]
Category: Fresh Shiitake

Regular Price: 1200
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 20
Promotion End Date: 2025-12-31

Quantity in Stock: 15
Description: Extra large family pack perfect for big gatherings or weekly meal prep. Contains 1kg of premium fresh shiitake mushrooms at an unbeatable value.

SKU: FSH-005
Available for Purchase: ✅ YES
Weight: 1
Unit of Measurement: kg
Featured Product: ❌ NO
Compare at Price: 1200
```
**Click "Publish"** ✅

---

### Fresh Oyster Products (5 products)

#### Product 6: Fresh Oyster Mushrooms 🌟 FEATURED
```yaml
Product Name: Fresh Oyster Mushrooms
Slug: (auto: fresh-oyster-mushrooms)
Product Image: [Upload oyster image]
Category: Fresh Oyster ← SELECT

Regular Price: 320
On Promotion: ❌ NO
Quantity in Stock: 60
Description: Fresh oyster mushrooms with delicate texture and mild flavor. Perfect for stir-fries, soups, and grilling. Harvested daily for maximum freshness.

SKU: FOY-001
Available for Purchase: ✅ YES
Weight: 200
Unit of Measurement: g
Featured Product: ✅ YES (homepage!)
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 7: Pink Oyster Mushrooms 🌟 FEATURED
```yaml
Product Name: Pink Oyster Mushrooms
Slug: (auto: pink-oyster-mushrooms)
Product Image: [Upload pink oyster image]
Category: Fresh Oyster

Regular Price: 420
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 10

Quantity in Stock: 25
Description: Rare pink oyster mushrooms with stunning color and unique flavor. Perfect for gourmet dishes and Instagram-worthy presentations. Limited availability.

SKU: FOY-002
Available for Purchase: ✅ YES
Weight: 150
Unit of Measurement: g
Featured Product: ✅ YES
Compare at Price: 420
```
**Click "Publish"** ✅

#### Product 8: King Oyster Mushrooms 🌟 FEATURED
```yaml
Product Name: King Oyster Mushrooms
Slug: (auto: king-oyster-mushrooms)
Product Image: [Upload king oyster image]
Category: Specialty Mushrooms ← Use main category!

Regular Price: 480
On Promotion: ❌ NO
Quantity in Stock: 35
Description: Thick, meaty king oyster mushrooms with firm texture and rich flavor. Perfect for grilling, roasting, or slicing as a meat substitute.

SKU: KOY-001
Available for Purchase: ✅ YES
Weight: 300
Unit of Measurement: g
Featured Product: ✅ YES
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 9: Oyster Mushroom Mix
```yaml
Product Name: Oyster Mushroom Mix
Slug: (auto: oyster-mushroom-mix)
Product Image: [Upload image]
Category: Fresh Oyster

Regular Price: 550
On Promotion: ✅ YES
Promotion Type: Fixed Price
Promotional Price: 480

Quantity in Stock: 30
Description: Mixed variety pack containing white, pink, and yellow oyster mushrooms. Perfect for trying different flavors and colors in one convenient pack.

SKU: FOY-003
Available for Purchase: ✅ YES
Weight: 350
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: 550
```
**Click "Publish"** ✅

#### Product 10: Golden Oyster Mushrooms
```yaml
Product Name: Golden Oyster Mushrooms
Slug: (auto: golden-oyster-mushrooms)
Product Image: [Upload image]
Category: Fresh Oyster

Regular Price: 380
On Promotion: ❌ NO
Quantity in Stock: 20
Description: Beautiful golden oyster mushrooms with nutty flavor and vibrant color. Perfect for upscale presentations and gourmet cooking.

SKU: FOY-004
Available for Purchase: ✅ YES
Weight: 150
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

---

### Fresh Button Mushroom Products (3 products)

#### Product 11: Fresh White Button Mushrooms 🌟 FEATURED
```yaml
Product Name: Fresh White Button Mushrooms
Slug: (auto: fresh-white-button-mushrooms)
Product Image: [Upload button mushroom image]
Category: Fresh Button

Regular Price: 220
On Promotion: ❌ NO
Quantity in Stock: 100
Description: Classic white button mushrooms, freshly harvested. The most versatile mushroom for salads, pizzas, pastas, and any dish. Perfect everyday mushroom.

SKU: FBU-001
Available for Purchase: ✅ YES
Weight: 250
Unit of Measurement: g
Featured Product: ✅ YES (homepage!)
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 12: Sliced Button Mushrooms
```yaml
Product Name: Sliced Button Mushrooms
Slug: (auto: sliced-button-mushrooms)
Product Image: [Upload image]
Category: Fresh Button

Regular Price: 240
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 5

Quantity in Stock: 80
Description: Pre-sliced button mushrooms for ultra-convenient cooking. Ready to use straight from the pack. Perfect for busy families and meal prep.

SKU: FBU-002
Available for Purchase: ✅ YES
Weight: 200
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: 240
```
**Click "Publish"** ✅

#### Product 13: Baby Button Mushrooms
```yaml
Product Name: Baby Button Mushrooms
Slug: (auto: baby-button-mushrooms)
Product Image: [Upload image]
Category: Fresh Button

Regular Price: 280
On Promotion: ❌ NO
Quantity in Stock: 50
Description: Tender baby button mushrooms perfect for whole roasting, grilling, or fancy presentations. Premium quality small mushrooms.

SKU: FBU-003
Available for Purchase: ✅ YES
Weight: 150
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

---

### Fresh Enoki Products (3 products)

#### Product 14: Fresh Enoki Mushrooms 🌟 FEATURED
```yaml
Product Name: Fresh Enoki Mushrooms
Slug: (auto: fresh-enoki-mushrooms)
Product Image: [Upload enoki image]
Category: Fresh Enoki

Regular Price: 280
On Promotion: ❌ NO
Quantity in Stock: 45
Description: Delicate enoki mushrooms with mild flavor and unique appearance. Perfect for hot pots, ramen, soups, and Asian cuisine.

SKU: FEN-001
Available for Purchase: ✅ YES
Weight: 150
Unit of Measurement: g
Featured Product: ✅ YES (homepage!)
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 15: Organic Enoki Mushrooms
```yaml
Product Name: Organic Enoki Mushrooms
Slug: (auto: organic-enoki-mushrooms)
Product Image: [Upload image]
Category: Fresh Enoki

Regular Price: 350
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 12

Quantity in Stock: 25
Description: Certified organic enoki mushrooms grown without pesticides. Premium quality for health-conscious customers who love enoki's delicate flavor.

SKU: FEN-002
Available for Purchase: ✅ YES
Weight: 150
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: 350
```
**Click "Publish"** ✅

#### Product 16: Golden Enoki
```yaml
Product Name: Golden Enoki
Slug: (auto: golden-enoki)
Product Image: [Upload image]
Category: Fresh Enoki

Regular Price: 320
On Promotion: ❌ NO
Quantity in Stock: 30
Description: Special golden variety of enoki mushrooms with slightly richer flavor. Perfect for special occasions and gourmet presentations.

SKU: FEN-003
Available for Purchase: ✅ YES
Weight: 150
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

---

### Dried Mushroom Products (4 products)

#### Product 17: Premium Dried Shiitake 🌟 FEATURED
```yaml
Product Name: Premium Dried Shiitake
Slug: (auto: premium-dried-shiitake)
Product Image: [Upload dried shiitake image]
Category: Dried Shiitake

Regular Price: 650
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 18

Quantity in Stock: 40
Description: Premium dried shiitake mushrooms with concentrated umami flavor. Perfect for soups, broths, and Asian cuisine. Rehydrate in warm water before use. Long shelf life.

SKU: DSH-001
Available for Purchase: ✅ YES
Weight: 100
Unit of Measurement: g
Featured Product: ✅ YES (homepage!)
Compare at Price: 650
```
**Click "Publish"** ✅

#### Product 18: Sliced Dried Shiitake
```yaml
Product Name: Sliced Dried Shiitake
Slug: (auto: sliced-dried-shiitake)
Product Image: [Upload image]
Category: Dried Shiitake

Regular Price: 580
On Promotion: ❌ NO
Quantity in Stock: 35
Description: Pre-sliced dried shiitake for ultra-convenient cooking. No preparation needed, just rehydrate and add to your dish. Perfect for busy cooks.

SKU: DSH-002
Available for Purchase: ✅ YES
Weight: 100
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 19: Dried Oyster Mushrooms
```yaml
Product Name: Dried Oyster Mushrooms
Slug: (auto: dried-oyster-mushrooms)
Product Image: [Upload image]
Category: Dried Oyster

Regular Price: 480
On Promotion: ✅ YES
Promotion Type: Fixed Price
Promotional Price: 420

Quantity in Stock: 30
Description: Sun-dried oyster mushrooms for long shelf life. Rehydrate for soups, stir-fries, or broths. Concentrated flavor that enhances any dish.

SKU: DOY-001
Available for Purchase: ✅ YES
Weight: 80
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: 480
```
**Click "Publish"** ✅

#### Product 20: Mixed Dried Mushrooms
```yaml
Product Name: Mixed Dried Mushrooms
Slug: (auto: mixed-dried-mushrooms)
Product Image: [Upload image]
Category: Dried Mushrooms ← Main category

Regular Price: 720
On Promotion: ❌ NO
Quantity in Stock: 25
Description: Premium mixed pack of dried shiitake, oyster, and wood ear mushrooms. Perfect for authentic Asian soups and broths. Restaurant-quality variety pack.

SKU: DMX-001
Available for Purchase: ✅ YES
Weight: 120
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

---

### Mushroom Products (3 products)

#### Product 21: Shiitake Mushroom Powder 🌟 FEATURED
```yaml
Product Name: Shiitake Mushroom Powder
Slug: (auto: shiitake-mushroom-powder)
Product Image: [Upload powder image]
Category: Mushroom Products

Regular Price: 420
On Promotion: ❌ NO
Quantity in Stock: 50
Description: Finely ground shiitake powder for instant umami boost. Perfect for seasoning, broths, sauces, and health supplements. Pure 100% shiitake with no additives.

SKU: POW-001
Available for Purchase: ✅ YES
Weight: 50
Unit of Measurement: g
Featured Product: ✅ YES (homepage!)
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 22: Mushroom Seasoning Mix
```yaml
Product Name: Mushroom Seasoning Mix
Slug: (auto: mushroom-seasoning-mix)
Product Image: [Upload image]
Category: Mushroom Products

Regular Price: 280
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 15

Quantity in Stock: 60
Description: Gourmet mushroom seasoning blend with dried mushrooms, herbs, and spices. Perfect for elevating any dish with rich umami flavor.

SKU: SEA-001
Available for Purchase: ✅ YES
Weight: 80
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: 280
```
**Click "Publish"** ✅

#### Product 23: Mushroom Extract Powder
```yaml
Product Name: Mushroom Extract Powder
Slug: (auto: mushroom-extract-powder)
Product Image: [Upload image]
Category: Mushroom Products

Regular Price: 850
On Promotion: ❌ NO
Quantity in Stock: 20
Description: Concentrated mushroom extract powder for health benefits. Contains shiitake, reishi, and lion's mane extracts. Perfect for health-conscious customers.

SKU: EXT-001
Available for Purchase: ✅ YES
Weight: 60
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

---

### Gift Bundle Products (5 products)

#### Product 24: Gourmet Mushroom Bundle 🌟 FEATURED
```yaml
Product Name: Gourmet Mushroom Bundle
Slug: (auto: gourmet-mushroom-bundle)
Product Image: [Upload bundle image]
Category: Gift Bundles

Regular Price: 980
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 20

Quantity in Stock: 15
Description: Curated collection of 5 premium mushroom varieties: shiitake, oyster, button, enoki, and king oyster. Perfect for trying different mushrooms or as a gift.

SKU: BUN-001
Available for Purchase: ✅ YES
Weight: 800
Unit of Measurement: g
Featured Product: ✅ YES (homepage!)
Compare at Price: 980
```
**Click "Publish"** ✅

#### Product 25: Mushroom Starter Kit
```yaml
Product Name: Mushroom Starter Kit
Slug: (auto: mushroom-starter-kit)
Product Image: [Upload image]
Category: Gift Bundles

Regular Price: 550
On Promotion: ❌ NO
Quantity in Stock: 30
Description: Perfect starter pack for mushroom beginners. Includes button, shiitake, and oyster mushrooms with recipe booklet.

SKU: BUN-002
Available for Purchase: ✅ YES
Weight: 500
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 26: Deluxe Mushroom Collection
```yaml
Product Name: Deluxe Mushroom Collection
Slug: (auto: deluxe-mushroom-collection)
Product Image: [Upload image]
Category: Gift Bundles

Regular Price: 1450
On Promotion: ✅ YES
Promotion Type: Fixed Price
Promotional Price: 1250

Quantity in Stock: 10
Description: Premium collection featuring 8 different mushroom varieties including rare specialty mushrooms. Perfect luxury gift for food enthusiasts.

SKU: BUN-003
Available for Purchase: ✅ YES
Weight: 1.2
Unit of Measurement: kg
Featured Product: ❌ NO
Compare at Price: 1450
```
**Click "Publish"** ✅

#### Product 27: Family Mushroom Pack
```yaml
Product Name: Family Mushroom Pack
Slug: (auto: family-mushroom-pack)
Product Image: [Upload image]
Category: Gift Bundles

Regular Price: 720
On Promotion: ❌ NO
Quantity in Stock: 25
Description: Value pack perfect for families. Contains 1kg of mixed button and oyster mushrooms at great value. Feeds 4-6 people.

SKU: BUN-004
Available for Purchase: ✅ YES
Weight: 1
Unit of Measurement: kg
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 28: Mushroom Gift Basket
```yaml
Product Name: Mushroom Gift Basket
Slug: (auto: mushroom-gift-basket)
Product Image: [Upload image]
Category: Gift Bundles

Regular Price: 1850
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 15

Quantity in Stock: 8
Description: Luxury gift basket with premium mushrooms, mushroom powder, seasoning mix, and recipe book. Beautifully packaged. Perfect corporate or special occasion gift.

SKU: BUN-005
Available for Purchase: ✅ YES
Weight: 1.5
Unit of Measurement: kg
Featured Product: ❌ NO
Compare at Price: 1850
```
**Click "Publish"** ✅

---

### Specialty Mushroom Products (2 products)

#### Product 29: Lion's Mane Mushrooms
```yaml
Product Name: Lion's Mane Mushrooms
Slug: (auto: lions-mane-mushrooms)
Product Image: [Upload lion's mane image]
Category: Specialty Mushrooms

Regular Price: 680
On Promotion: ❌ NO
Quantity in Stock: 12
Description: Rare lion's mane mushrooms known for cognitive health benefits. Unique appearance and seafood-like texture. Perfect for health-conscious gourmet cooks.

SKU: SPE-001
Available for Purchase: ✅ YES
Weight: 200
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: (empty)
```
**Click "Publish"** ✅

#### Product 30: Maitake Mushrooms
```yaml
Product Name: Maitake Mushrooms
Slug: (auto: maitake-mushrooms)
Product Image: [Upload maitake image]
Category: Specialty Mushrooms

Regular Price: 580
On Promotion: ✅ YES
Promotion Type: Percentage Discount
Discount Percentage: 10

Quantity in Stock: 15
Description: Premium maitake (hen of the woods) mushrooms with complex flavor and impressive health benefits. Perfect for gourmet dishes and health supplements.

SKU: SPE-002
Available for Purchase: ✅ YES
Weight: 250
Unit of Measurement: g
Featured Product: ❌ NO
Compare at Price: 580
```
**Click "Publish"** ✅

---

## ✅ Step 5: Verify Your Work (10 minutes)

### Check Homepage
1. Open: http://localhost:3000
2. Scroll to "Our Bestsellers" or "Featured Products" section
3. **✅ You should see:** 10 featured products in carousel!
4. **✅ Products display:** Name, price (with discount if on promo), image placeholder

### Check Shop Page
1. Open: http://localhost:3000/shop
2. **✅ You should see:** All 30 products displayed
3. **✅ Category filters work:** Click categories in sidebar
4. **✅ Subcategories show:** Categories are hierarchical
5. **✅ Price filters work:** Adjust price range slider
6. **✅ Search works:** Type product names

### Check Product Detail
1. Click any product card
2. **✅ Page loads:** `/product/[slug]` URL
3. **✅ Displays:** Product name, price, description, category
4. **✅ Shows promotion:** If product has discount, shows "On Sale" badge
5. **✅ Stock info:** Shows quantity available
6. **✅ Add to cart works:** Button functions

---

## 🖼️ Step 6: Add Product Images (Optional - 30 minutes)

You mentioned you'll provide images yourself. Here's how to add them:

### For Each Product:
1. **Find the product** in Sanity Studio (click "Product" → find product)
2. **Click "Product Image"** field
3. **Drag & drop** your image file OR click to browse
4. **Crop/adjust** if needed (Sanity shows hotspot editor)
5. **Click "Publish"**

### For Additional Images (Gallery):
1. Find **"Additional Images"** field
2. Click **"+ Add item"**
3. Upload multiple images
4. **Reorder** by dragging thumbnails
5. **Click "Publish"**

### Image Requirements:
- **Format:** JPG or PNG
- **Size:** 500KB - 2MB per image
- **Resolution:** Minimum 800x800px (square recommended)
- **Aspect ratio:** 1:1 (square) works best for e-commerce

### Free Image Sources (If Needed):
- **Unsplash:** https://unsplash.com/s/photos/mushroom
- **Pexels:** https://www.pexels.com/search/mushroom/
- **Pixabay:** https://pixabay.com/images/search/mushroom/

---

## 🎉 Congratulations!

You now have:
- ✅ **12 categories** (6 main + 6 subcategories)
- ✅ **30 products** with complete details
- ✅ **10 featured products** on homepage
- ✅ **Promotions** (percentage discounts and fixed prices)
- ✅ **Stock management** for all products
- ✅ **Category connections** (products linked to categories)
- ✅ **Subcategory support** (hierarchical organization)

---

## 🛠️ Advanced: Bulk Import (For 100+ Products)

If you need to add MANY more products faster, use Sanity CLI:

### Install Sanity CLI
```bash
npm install -g @sanity/cli
cd studio
sanity login
```

### Create Import Script
Create `studio/import-products.js`:
```javascript
const sanityClient = require('@sanity/client')
const client = sanityClient({
  projectId: '2grm6gj7',
  dataset: 'production',
  token: 'YOUR_WRITE_TOKEN', // Get from sanity.io/manage
  useCdn: false,
})

const products = [
  {
    _type: 'product',
    name: 'Product Name',
    slug: { _type: 'slug', current: 'product-slug' },
    price: 100,
    // ... other fields
  },
  // Add many more products here
]

async function importProducts() {
  for (const product of products) {
    await client.create(product)
    console.log(`Imported: ${product.name}`)
  }
}

importProducts()
```

### Run Import
```bash
node import-products.js
```

---

## 📞 Need Help?

**Common Issues:**

1. **Homepage still empty?**
   - Make sure products have `isFeatured: true` checked
   - Refresh browser (Ctrl+Shift+R)
   - Check browser console for errors

2. **Products not showing in shop?**
   - Verify `isAvailable: true` is checked
   - Check category is properly selected
   - Make sure product is published (not draft)

3. **Categories not showing?**
   - Make sure category is published
   - Check parent category is correct for subcategories
   - Refresh Sanity Studio

4. **Images not uploading?**
   - Check file size (<5MB)
   - Use JPG or PNG format
   - Check internet connection

---

**Last Updated:** November 20, 2025  
**Status:** ✅ COMPLETE - Ready to populate Sanity with 30+ products!  
**Next:** Add product images for professional look!
