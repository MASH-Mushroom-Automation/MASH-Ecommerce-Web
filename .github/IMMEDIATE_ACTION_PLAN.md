# 🎯 IMMEDIATE ACTION PLAN - CMS Data Population

**Date:** November 20, 2025 - 4:15 PM  
**Status:** ✅ Ready to Execute  
**Sanity Studio:** Already running at http://localhost:3333

---

## ⚡ OPTION 1: Automated Import (5 minutes) - RECOMMENDED

### Step 1: Get API Token (2 minutes)

1. **Open browser:** https://sanity.io/manage
2. **Select project:** mash-ecommerce (2grm6gj7)
3. **Navigate:** API tab → Tokens
4. **Create token:**
   - Click "Add API token"
   - Name: "Data Import Script"
   - Permissions: **Editor**
   - Copy the generated token

### Step 2: Add Token to Environment (30 seconds)

```cmd
notepad studio\.env.local
```

**Add this line at the end:**
```
SANITY_API_WRITE_TOKEN=paste_your_token_here
```

**Save and close.**

### Step 3: Run Import Script (30 seconds)

```cmd
cd studio
node scripts/import-sample-data.js
```

**Expected result:**
```
✅ Categories: 3/3
✅ Products: 5/5
⏸️  Reviews: Manual import required
```

### Step 4: Add Images to Products (10 minutes)

1. **Open Studio:** http://localhost:3333
2. **Click "Products"**
3. **For each product:**
   - Click product name
   - Click "Product Image" field
   - Click "Upload" or "Select"
   - Choose mushroom image
   - Adjust crop/hotspot
   - Click "Publish"

**Repeat for all 5 products.**

### Step 5: Verify on Frontend (2 minutes)

1. **Open:** http://localhost:3000/shop
2. **Check:**
   - All 5 products visible
   - Images load correctly
   - Prices display
   - Promo badges show (Oyster 22%, Enoki 15%)
3. **Click product** to test detail page

---

## ⚡ OPTION 2: Manual Import (30 minutes)

### Step 1: Create Categories (5 minutes)

**Open Studio:** http://localhost:3333

**Category 1: Fresh Mushrooms**
- Click "Categories" → "Create"
- Name: `Fresh Mushrooms`
- Slug: Click "Generate"
- Description: `Hand-picked fresh gourmet mushrooms, harvested daily`
- Is Active: ✓
- Featured on Homepage: ✓
- Sort Order: `1`
- Click "Publish"

**Category 2: Dried Mushrooms**
- Repeat above with:
  - Name: `Dried Mushrooms`
  - Description: `Premium sun-dried mushrooms with long shelf life`
  - Sort Order: `2`

**Category 3: Growing Kits**
- Repeat above with:
  - Name: `Growing Kits`
  - Description: `Complete mushroom growing kits for home cultivation`
  - Sort Order: `3`

### Step 2: Import First Product (5 minutes)

**Open:** `studio/sample-data/phase-13-products.json`

**Find "Fresh Oyster Mushrooms"** and copy data.

**In Studio:**
1. Click "Products" → "Create New Product"
2. Fill fields from JSON:
   - **Name:** Fresh Oyster Mushrooms
   - **Slug:** Click "Generate"
   - **Description:** Copy from JSON
   - **Short Description:** Copy from JSON
   - **Category:** Select "Fresh Mushrooms"
   - **Price:** 350
   - **On Promotion:** ✓ Check
   - **Promotion Type:** Percentage Discount
   - **Discount Percentage:** 22
   - **SKU:** MUSH-OYSTER-FRESH-250
   - **Weight:** 250
   - **Weight Unit:** g
   - **Stock Quantity:** 50
   - **Low Stock Threshold:** 10
   - **Track Inventory:** ✓
   - **Stock Status:** in-stock
   - **Is Featured:** ✓
   - **Is Bestseller:** ✓
   - **Tags:** fresh, oyster, organic, local, premium
   - **Storage Instructions:** Copy from JSON
   - **Preparation Tips:** Copy from JSON
   - **Origin:** Pangasinan, Philippines
3. Skip "Product Image" for now
4. Click "Publish"

### Step 3: Repeat for Remaining 4 Products (20 minutes)

Follow same process for:
- Fresh Shiitake Mushrooms (Category: Fresh)
- Fresh Enoki Mushrooms (Category: Fresh, 15% promo)
- Premium Dried Shiitake (Category: Dried)
- Oyster Growing Kit (Category: Growing Kits)

### Step 4: Add Images (Same as Option 1)

---

## 📊 Success Criteria

After completion, you should have:

- ✅ 3 categories published in Sanity
- ✅ 5 products published with categories assigned
- ✅ 5 product images uploaded and visible
- ✅ Products visible on http://localhost:3000/shop
- ✅ Product detail pages working
- ✅ Promo badges showing on 2 products

---

## 🎯 What This Achieves

**Before:**
- Templates Ready: 13% (15/112)
- Imported to Sanity: 0% (0/112)
- With Images: 0% (0/112)

**After:**
- Templates Ready: 13% (15/112)
- Imported to Sanity: 7% (8/112)
- With Images: 4% (5/112)

**Progress:**
- ✅ Phase 13 (Products): 0% → 33% (5/15 imported)
- ✅ Phase 17 (Categories): 0% → 15% (3/20 created)

---

## 📋 After Import Checklist

- [ ] All 3 categories created and published
- [ ] All 5 products created and published
- [ ] All 5 products have images
- [ ] Products display on /shop page
- [ ] Product detail pages work
- [ ] Promo badges visible (Oyster, Enoki)
- [ ] "New Arrival" badge visible (Growing Kit)
- [ ] Stock status displays correctly

---

## 🚀 Next Session Actions

**Goal:** Complete Phase 13 (100% products)

1. **Create 10 more products:**
   - Use existing 5 as templates
   - Add variety: Button mushrooms, King Oyster, Lion's Mane, etc.
   - Mix categories evenly

2. **Import all 15 products to Sanity**

3. **Add images to all products**

4. **Test complete product catalog**

5. **Move to Phase 14: Product Variants**

---

## 🆘 If You Get Stuck

**Automated import fails:**
- Check token has "Editor" permissions
- Verify token added to `.env.local`
- Try manual import instead

**Products not showing on frontend:**
- Check products are "Published" not "Draft"
- Verify category is assigned
- Check frontend is fetching correct dataset

**Images not uploading:**
- Check file size (max 10MB usually)
- Use JPG or PNG format
- Try smaller image size

**Need help:**
- Check `studio/scripts/README.md`
- Review `.github/QUICK_REFERENCE_CMS.md`
- Read troubleshooting in `.github/CMS_DATA_POPULATION_GUIDE.md`

---

**Status:** Ready to execute ✅  
**Choose:** Option 1 (automated) or Option 2 (manual)  
**Time:** 5-30 minutes depending on option  
**Result:** Working e-commerce catalog with 5 products
