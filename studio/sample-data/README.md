# 📁 Sample Data for MASH CMS

This folder contains ready-to-use JSON templates for populating your Sanity CMS with sample e-commerce data.

## 📂 Files Overview

### ✅ Available Files

| File | Content | Count | Status |
|------|---------|-------|--------|
| `phase-13-products.json` | Core products (mushrooms & kits) | 5 items | ✅ Ready |
| `phase-16-reviews.json` | Customer reviews with ratings | 10 items | ✅ Ready |

### ⏳ Coming Soon

- `phase-14-variants.json` - Product size/weight variants
- `phase-15-bundles.json` - Product bundles with savings
- `phase-17-categories.json` - Category hierarchy
- `phase-18-marketing.json` - Hero slides and blog posts
- `phase-19-promotions.json` - Coupons and seasonal sales
- `phase-20-orders.json` - Sample order history

## 🚀 How to Use These Files

### Method 1: Manual Import (Recommended for Learning)

1. **Open Sanity Studio:**
   ```cmd
   cd studio
   npm run dev
   ```

2. **Open JSON file** (e.g., `phase-13-products.json`)

3. **Create document** in Sanity Studio UI

4. **Copy fields** from JSON into corresponding Studio fields

5. **Publish** the document

6. **Add images** via Studio upload interface

### Method 2: Bulk Import (Advanced)

If you're comfortable with Sanity CLI:

```cmd
# Install Sanity CLI globally
npm install -g @sanity/cli

# Import dataset
sanity dataset import phase-13-products.json production --replace
```

⚠️ **Warning:** This will replace existing data. Use with caution!

## 📋 Import Order (Important!)

Follow this sequence to avoid reference errors:

1. **Phase 17** - Categories (products need category references)
2. **Phase 13** - Core Products
3. **Phase 14** - Product Variants (need products)
4. **Phase 15** - Product Bundles (need products)
5. **Phase 16** - Customer Reviews (need products)
6. **Phase 18** - Marketing Content
7. **Phase 19** - Promotions & Coupons
8. **Phase 20** - Sample Orders (need products)

## 🖼️ About Images

**Important:** These JSON files do NOT include images. Images must be added manually via Sanity Studio after importing text data.

### Why?

- Image files are large and stored separately
- You have your own mushroom product images
- Sanity Studio provides easy upload interface with crop/hotspot tools

### How to Add Images:

1. Import product without image
2. Open product in Studio
3. Click on image field
4. Upload your image file
5. Adjust crop and hotspot
6. Click "Publish"

## 📊 Data Statistics

**Current Status:**
- ✅ 5 products ready
- ✅ 10 reviews ready
- ⏳ 97 more items to create
- **Total:** 15/112 items (13% complete)

## 🔧 Customization Tips

### Editing Product Data

Feel free to modify any fields:

- **Prices** - Adjust to match your market
- **Descriptions** - Customize for your brand voice
- **Stock quantities** - Set realistic inventory levels
- **SKUs** - Use your own SKU format
- **Tags** - Add/remove as needed

### Adding More Products

Use existing products as templates:

1. Copy an existing product object from JSON
2. Change the following fields (minimum):
   - `name`
   - `slug.current`
   - `description`
   - `sku`
   - `barcode`
   - `price`
3. Adjust other fields as needed
4. Import to Sanity Studio

## ❓ Troubleshooting

### "Reference not found" error

**Problem:** Product references a category that doesn't exist yet

**Solution:** Create categories first (Phase 17) before importing products

### "SKU already exists" error

**Problem:** Duplicate SKU in database

**Solution:** Make sure each product has a unique SKU

### Product not showing on frontend

**Checklist:**
- ✅ Product is published (not just saved as draft)
- ✅ Product has an image
- ✅ Product has a valid category
- ✅ Frontend is fetching from correct Sanity dataset
- ✅ Next.js dev server is running

### Images not showing

**Problem:** Image field is required but not filled

**Solution:** Either:
1. Add images via Studio UI (recommended)
2. Modify product schema to make image optional
3. Use placeholder images temporarily

## 📖 Full Documentation

For complete setup guide, see:
**`.github/CMS_DATA_POPULATION_GUIDE.md`**

This document tracks your progress through all 9 phases of data population.

---

**Last Updated:** November 20, 2025  
**Maintained by:** MASH Development Team
