# ✅ CMS Import Checklist - Today's Tasks

**Date:** November 20, 2025  
**Session Goal:** Import first 5 products + Add images  
**Time Estimate:** 2 hours

---

## 🚀 Setup (5 minutes)

- [ ] Open Terminal/Command Prompt
- [ ] Navigate to studio folder: `cd studio`
- [ ] Start Sanity Studio: `npm run dev`
- [ ] Open browser to: http://localhost:3333
- [ ] Open another terminal
- [ ] Start Next.js frontend: `npm run dev`
- [ ] Open browser to: http://localhost:3000

**Status:** Servers Running ✓

---

## 📂 Preparation (5 minutes)

- [ ] Open `studio/sample-data/phase-13-products.json` in editor
- [ ] Prepare 5 mushroom product images (have files ready)
- [ ] Open `.github/CMS_DATA_POPULATION_GUIDE.md` for reference
- [ ] Have Sanity Studio and Next.js frontend tabs open

**Status:** Files Ready ✓

---

## 🏷️ Step 1: Create Categories (10 minutes)

### Category 1: Fresh Mushrooms
- [ ] Click "Categories" in Sanity Studio sidebar
- [ ] Click "Create New Category"
- [ ] Fill in fields:
  - [ ] Name: "Fresh Mushrooms"
  - [ ] Slug: Click "Generate" (creates: fresh-mushrooms)
  - [ ] Description: "Hand-picked fresh gourmet mushrooms, harvested daily"
  - [ ] Is Active: ✓ Check
  - [ ] Featured on Homepage: ✓ Check
- [ ] Click "Publish"

### Category 2: Dried Mushrooms
- [ ] Click "Create New Category"
- [ ] Fill in fields:
  - [ ] Name: "Dried Mushrooms"
  - [ ] Slug: Click "Generate" (creates: dried-mushrooms)
  - [ ] Description: "Premium sun-dried mushrooms with long shelf life"
  - [ ] Is Active: ✓ Check
  - [ ] Featured on Homepage: ✓ Check
- [ ] Click "Publish"

### Category 3: Growing Kits
- [ ] Click "Create New Category"
- [ ] Fill in fields:
  - [ ] Name: "Growing Kits"
  - [ ] Slug: Click "Generate" (creates: growing-kits)
  - [ ] Description: "Complete mushroom growing kits for home cultivation"
  - [ ] Is Active: ✓ Check
  - [ ] Featured on Homepage: ✓ Check
- [ ] Click "Publish"

**Status:** Categories Created ✓

---

## 🍄 Step 2: Import Product #1 - Fresh Oyster Mushrooms (15 minutes)

### Import Data
- [ ] Open `phase-13-products.json`
- [ ] Scroll to "Fresh Oyster Mushrooms" object
- [ ] In Sanity Studio, click "Products" → "Create New Product"

### Fill Basic Info
- [ ] **Name:** Copy from JSON: "Fresh Oyster Mushrooms"
- [ ] **Slug:** Click "Generate" button
- [ ] **Description:** Copy full description from JSON
- [ ] **Short Description:** Copy from JSON
- [ ] **Category:** Select "Fresh Mushrooms" from dropdown

### Fill Pricing
- [ ] **Regular Price:** 350
- [ ] **On Promotion:** ✓ Check
- [ ] **Promotion Type:** Select "Percentage Discount"
- [ ] **Discount Percentage:** 22

### Fill Product Details
- [ ] **SKU:** MUSH-OYSTER-FRESH-250
- [ ] **Barcode:** 8234567890123
- [ ] **Weight:** 250
- [ ] **Weight Unit:** g (grams)

### Fill Inventory
- [ ] **Stock Quantity:** 50
- [ ] **Low Stock Threshold:** 10
- [ ] **Track Inventory:** ✓ Check
- [ ] **Allow Backorder:** ⬜ Uncheck
- [ ] **Stock Status:** Select "in-stock"

### Fill Flags
- [ ] **Is Featured:** ✓ Check
- [ ] **Is New Arrival:** ⬜ Uncheck
- [ ] **Is Bestseller:** ✓ Check

### Fill Tags (if field exists)
- [ ] Add tags: fresh, oyster, organic, local, premium

### Fill Additional Info (if fields exist)
- [ ] **Storage Instructions:** Copy from JSON
- [ ] **Preparation Tips:** Copy from JSON
- [ ] **Origin:** Pangasinan, Philippines
- [ ] **Nutritional Info:** Copy from JSON (if structured field)

### Fill SEO
- [ ] **SEO Title:** Copy seoTitle from JSON
- [ ] **SEO Description:** Copy seoDescription from JSON
- [ ] **SEO Keywords:** Copy seoKeywords from JSON

### Publish
- [ ] Click "Publish" button (bottom of page)
- [ ] Wait for "Published" confirmation

### Add Image
- [ ] Click "Product Image" field
- [ ] Click "Select" or "Upload"
- [ ] Choose your Fresh Oyster Mushrooms image file
- [ ] Adjust crop and hotspot as needed
- [ ] Click "Publish" again

### Verify
- [ ] Product shows in Products list
- [ ] Open Next.js frontend (http://localhost:3000/shop)
- [ ] Find Fresh Oyster Mushrooms in product grid
- [ ] Click product to see detail page
- [ ] Check: image, price, promo badge, description

**Status:** Product #1 Complete ✓

---

## 🍄 Step 3: Import Product #2 - Fresh Shiitake Mushrooms (12 minutes)

### Import Data
- [ ] Find "Fresh Shiitake Mushrooms" in JSON
- [ ] Click "Create New Product" in Studio

### Fill Fields (abbreviated - follow same process as Product #1)
- [ ] Name: "Fresh Shiitake Mushrooms"
- [ ] Slug: Generate
- [ ] Description: Copy from JSON
- [ ] Short Description: Copy from JSON
- [ ] Category: "Fresh Mushrooms"
- [ ] Price: 420
- [ ] On Promotion: ⬜ No
- [ ] SKU: MUSH-SHIITAKE-FRESH-250
- [ ] Barcode: 8234567890128
- [ ] Weight: 250g
- [ ] Stock: 40
- [ ] Low Stock: 8
- [ ] Track Inventory: ✓
- [ ] Stock Status: in-stock
- [ ] Is Bestseller: ✓
- [ ] Storage/Prep/Origin: Copy from JSON
- [ ] SEO fields: Copy from JSON
- [ ] Tags: fresh, shiitake, umami, healthy, local

### Publish & Add Image
- [ ] Click "Publish"
- [ ] Upload Fresh Shiitake image
- [ ] Click "Publish" again

### Verify
- [ ] Check product list
- [ ] View on frontend

**Status:** Product #2 Complete ✓

---

## 🍄 Step 4: Import Product #3 - Fresh Enoki Mushrooms (12 minutes)

### Import Data
- [ ] Find "Fresh Enoki Mushrooms" in JSON
- [ ] Click "Create New Product"

### Fill Fields
- [ ] Name: "Fresh Enoki Mushrooms"
- [ ] Slug: Generate
- [ ] Description: Copy from JSON
- [ ] Category: "Fresh Mushrooms"
- [ ] Price: 280
- [ ] On Promotion: ✓ Check
- [ ] Promotion Type: Percentage
- [ ] Discount: 15%
- [ ] SKU: MUSH-ENOKI-FRESH-200
- [ ] Barcode: 8234567890129
- [ ] Weight: 200g
- [ ] Stock: 35
- [ ] All other fields: Copy from JSON

### Publish & Add Image
- [ ] Publish
- [ ] Add Enoki image
- [ ] Publish again

### Verify
- [ ] Check list
- [ ] View on frontend
- [ ] Verify 15% promo badge shows

**Status:** Product #3 Complete ✓

---

## 🍄 Step 5: Import Product #4 - Dried Shiitake Mushrooms (12 minutes)

### Import Data
- [ ] Find "Premium Dried Shiitake Mushrooms" in JSON
- [ ] Click "Create New Product"

### Fill Fields
- [ ] Name: "Premium Dried Shiitake Mushrooms"
- [ ] Slug: Generate
- [ ] Description: Copy from JSON
- [ ] Category: "Dried Mushrooms"
- [ ] Price: 580
- [ ] On Promotion: ⬜ No
- [ ] SKU: MUSH-SHIITAKE-DRIED-100
- [ ] Weight: 100g
- [ ] Stock: 80
- [ ] Low Stock: 15
- [ ] Allow Backorder: ✓ Check
- [ ] Is Featured: ✓
- [ ] Is Bestseller: ✓
- [ ] All other fields: Copy from JSON

### Publish & Add Image
- [ ] Publish
- [ ] Add Dried Shiitake image
- [ ] Publish again

### Verify
- [ ] Check list
- [ ] View on frontend

**Status:** Product #4 Complete ✓

---

## 🌱 Step 6: Import Product #5 - Oyster Growing Kit (12 minutes)

### Import Data
- [ ] Find "Oyster Mushroom Growing Kit" in JSON
- [ ] Click "Create New Product"

### Fill Fields
- [ ] Name: "Oyster Mushroom Growing Kit - Beginner Friendly"
- [ ] Slug: Generate
- [ ] Description: Copy from JSON
- [ ] Category: "Growing Kits"
- [ ] Price: 1250
- [ ] SKU: KIT-OYSTER-BASIC-01
- [ ] Weight: 2500g (2.5kg)
- [ ] Stock: 30
- [ ] Low Stock: 5
- [ ] Is Featured: ✓
- [ ] Is New Arrival: ✓
- [ ] Kit Includes: Copy array from JSON (if field exists)
- [ ] Expected Yield: Copy from JSON
- [ ] Time to Harvest: 10-14 days
- [ ] All other fields: Copy from JSON

### Publish & Add Image
- [ ] Publish
- [ ] Add Growing Kit image
- [ ] Publish again

### Verify
- [ ] Check list
- [ ] View on frontend
- [ ] Check "New Arrival" badge

**Status:** Product #5 Complete ✓

---

## ✅ Final Verification (10 minutes)

### Check Sanity Studio
- [ ] Navigate to "Products" in sidebar
- [ ] Confirm 5 products listed
- [ ] Open each product
- [ ] Verify all have images
- [ ] Verify all are published (not draft)

### Check Frontend - Shop Page
- [ ] Go to http://localhost:3000/shop
- [ ] Verify all 5 products appear in grid
- [ ] Check images load
- [ ] Check prices display correctly
- [ ] Check promo badges on Oyster (22%) and Enoki (15%)
- [ ] Check "New Arrival" badge on Growing Kit

### Check Frontend - Product Details
- [ ] Click each product
- [ ] Verify full description shows
- [ ] Check image loads
- [ ] Check price and promo if applicable
- [ ] Check stock status displays
- [ ] Check "Add to Cart" button appears

### Test Basic Functionality
- [ ] Test product search (if implemented)
- [ ] Test category filter (if implemented)
- [ ] Try adding product to cart (if implemented)

**Status:** All Verified ✓

---

## 📊 Update Documentation (5 minutes)

### Update Progress in Guide
- [ ] Open `.github/CMS_DATA_POPULATION_GUIDE.md`
- [ ] Find Phase 13 section
- [ ] Check off completed products:
  - [x] Fresh Oyster Mushrooms - Imported ✓
  - [x] Fresh Shiitake Mushrooms - Imported ✓
  - [x] Fresh Enoki Mushrooms - Imported ✓
  - [x] Dried Shiitake Mushrooms - Imported ✓
  - [x] Oyster Growing Kit - Imported ✓
- [ ] Update progress percentage: 33% → 33% (5/15)
- [ ] Update "Imported to Sanity" column: 0 → 5
- [ ] Update overall progress: 0% → 4% imported

### Update Session Summary
- [ ] Note completion time
- [ ] Note any issues encountered
- [ ] Save files

**Status:** Documentation Updated ✓

---

## 🎉 Session Complete!

### What You Accomplished Today:
✅ Set up development environment  
✅ Created 3 categories in Sanity  
✅ Imported 5 products with full data  
✅ Added 5 product images  
✅ Verified products display on frontend  
✅ Updated documentation

### Stats:
- **Time Spent:** ___ hours ___ minutes
- **Products Imported:** 5/15 (33%)
- **Overall Progress:** 4% imported, 13% templates ready

### Next Session Goals:
- [ ] Create 10 more product templates (JSON)
- [ ] Import remaining 10 products
- [ ] Add images to remaining products
- [ ] Reach 100% Phase 13 completion

### Notes for Next Time:
(Write any observations, issues, or improvements here)

---

**Great work! You've successfully imported your first batch of products! 🎉**

**Next session target:** Complete Phase 13 (all 15 products imported)
