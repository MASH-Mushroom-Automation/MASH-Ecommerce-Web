# 🚀 Adding Sample Products & Categories to Sanity - Quick Guide

**Date:** November 20, 2025  
**Purpose:** Populate Sanity Studio with sample mushroom products and categories  
**Time Required:** 30-45 minutes  
**Result:** Homepage will show featured products, shop page fully functional

---

## 🎯 Why You Need This

**Current Issue:**
- Homepage shows: "No featured products available yet"
- Shop page has categories but no products
- Sanity Studio is empty

**After This Guide:**
- 20+ mushroom products in Sanity
- 5+ product categories
- Homepage displays featured products
- Shop page fully functional with filters
- All products connected to categories

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Sanity Studio deployed: https://mash-ecommerce.sanity.studio
- ✅ Dev server running: http://localhost:3000
- ✅ Sanity tokens configured in `.env.local`

---

## 🍄 Step 1: Create Categories First (10 minutes)

Categories MUST be created before products (products reference categories).

### Open Sanity Studio

1. Go to: https://mash-ecommerce.sanity.studio
2. Sign in with your Google account
3. Click **"Categories"** in the sidebar

### Add These 6 Categories:

#### Category 1: Shiitake Mushrooms
```
Name: Shiitake Mushrooms
Slug: shiitake (auto-generated)
Description: Premium dried shiitake mushrooms with rich umami flavor, perfect for soups and stir-fries.
Image: Upload a shiitake mushroom image (or use placeholder)
```

#### Category 2: Oyster Mushrooms
```
Name: Oyster Mushrooms
Slug: oyster (auto-generated)
Description: Fresh oyster mushrooms with delicate texture, ideal for sautéing and grilling.
Image: Upload oyster mushroom image
```

#### Category 3: Button Mushrooms
```
Name: Button Mushrooms  
Slug: button (auto-generated)
Description: Classic white button mushrooms, versatile for any dish.
Image: Upload button mushroom image
```

#### Category 4: Enoki Mushrooms
```
Name: Enoki Mushrooms
Slug: enoki (auto-generated)
Description: Delicate enoki mushrooms with mild flavor, perfect for hot pots and salads.
Image: Upload enoki mushroom image
```

#### Category 5: King Oyster Mushrooms
```
Name: King Oyster Mushrooms
Slug: king-oyster (auto-generated)
Description: Thick, meaty king oyster mushrooms with rich flavor and firm texture.
Image: Upload king oyster image
```

#### Category 6: Mushroom Bundles
```
Name: Mushroom Bundles
Slug: bundles (auto-generated)
Description: Curated mushroom variety packs for diverse cooking needs.
Image: Upload bundle image
```

**💡 Tip:** After creating each category, click **"Publish"** button (green checkmark) in the bottom right.

---

## 🍄 Step 2: Add Sample Products (30 minutes)

Now that categories exist, let's add products. I'll give you 20 sample products across all categories.

### How to Add a Product in Sanity:

1. Click **"Products"** in sidebar
2. Click **"+ Create New"** button
3. Fill in the fields (see templates below)
4. Upload product image (or use placeholder)
5. Select category from dropdown
6. Set **"Is Available"** to TRUE
7. Set **"Stock"** to a number (e.g., 50)
8. Check **"Is Featured"** for homepage display
9. Click **"Publish"** (green checkmark)

---

## 📦 20 Sample Products (Copy & Paste Ready)

### Shiitake Products (5 products)

#### Product 1: Premium Dried Shiitake
```
Name: Premium Dried Shiitake
Slug: premium-dried-shiitake (auto-generated)
Price: 450
Weight: 100
Unit: g
Description: Premium dried shiitake mushrooms sourced from local farms. Rich umami flavor perfect for soups, stir-fries, and Asian cuisine. High in vitamins and minerals.
Category: Shiitake Mushrooms (select from dropdown)
Is Available: ✅ TRUE
Stock: 50
Is Featured: ✅ TRUE (check this for homepage)
Main Image: Upload shiitake image
```

#### Product 2: Fresh Shiitake Mushrooms
```
Name: Fresh Shiitake Mushrooms
Price: 380
Weight: 250
Unit: g
Description: Fresh shiitake mushrooms harvested daily. Perfect for grilling, sautéing, or adding to your favorite dishes.
Category: Shiitake Mushrooms
Is Available: ✅ TRUE
Stock: 30
Is Featured: ✅ TRUE
```

#### Product 3: Organic Shiitake Mushrooms
```
Name: Organic Shiitake Mushrooms
Price: 520
Weight: 150
Unit: g
Description: Certified organic shiitake mushrooms grown without pesticides. Premium quality with authentic taste.
Category: Shiitake Mushrooms
Is Available: ✅ TRUE
Stock: 25
Is Featured: FALSE
```

#### Product 4: Shiitake Mushroom Powder
```
Name: Shiitake Mushroom Powder
Price: 350
Weight: 50
Unit: g
Description: Finely ground shiitake powder for instant umami boost. Perfect for seasoning and broths.
Category: Shiitake Mushrooms
Is Available: ✅ TRUE
Stock: 40
Is Featured: FALSE
```

#### Product 5: Sliced Dried Shiitake
```
Name: Sliced Dried Shiitake
Price: 420
Weight: 100
Unit: g
Description: Pre-sliced dried shiitake for convenient cooking. No preparation needed, just rehydrate and cook.
Category: Shiitake Mushrooms
Is Available: ✅ TRUE
Stock: 35
Is Featured: FALSE
```

---

### Oyster Mushroom Products (4 products)

#### Product 6: Fresh Oyster Mushrooms
```
Name: Fresh Oyster Mushrooms
Price: 280
Weight: 200
Unit: g
Description: Fresh oyster mushrooms with delicate texture. Perfect for stir-fries, soups, and grilling.
Category: Oyster Mushrooms
Is Available: ✅ TRUE
Stock: 60
Is Featured: ✅ TRUE
```

#### Product 7: Pink Oyster Mushrooms
```
Name: Pink Oyster Mushrooms
Price: 320
Weight: 150
Unit: g
Description: Rare pink oyster mushrooms with unique color and mild flavor. Great for garnishing and sautéing.
Category: Oyster Mushrooms
Is Available: ✅ TRUE
Stock: 20
Is Featured: ✅ TRUE
```

#### Product 8: Oyster Mushroom Grow Kit
```
Name: Oyster Mushroom Grow Kit
Price: 650
Weight: 1
Unit: kg
Description: Complete grow kit to cultivate your own oyster mushrooms at home. Includes substrate and instructions.
Category: Oyster Mushrooms
Is Available: ✅ TRUE
Stock: 15
Is Featured: FALSE
```

#### Product 9: Dried Oyster Mushrooms
```
Name: Dried Oyster Mushrooms
Price: 380
Weight: 80
Unit: g
Description: Sun-dried oyster mushrooms for long shelf life. Rehydrate for cooking or use in soups.
Category: Oyster Mushrooms
Is Available: ✅ TRUE
Stock: 45
Is Featured: FALSE
```

---

### Button Mushroom Products (3 products)

#### Product 10: Fresh White Button Mushrooms
```
Name: Fresh White Button Mushrooms
Price: 180
Weight: 250
Unit: g
Description: Classic white button mushrooms, freshly harvested. Versatile for salads, pizzas, and pastas.
Category: Button Mushrooms
Is Available: ✅ TRUE
Stock: 100
Is Featured: ✅ TRUE
```

#### Product 11: Sliced Button Mushrooms
```
Name: Sliced Button Mushrooms
Price: 200
Weight: 200
Unit: g
Description: Pre-sliced button mushrooms for quick cooking. Ready to use straight from the pack.
Category: Button Mushrooms
Is Available: ✅ TRUE
Stock: 80
Is Featured: FALSE
```

#### Product 12: Baby Button Mushrooms
```
Name: Baby Button Mushrooms
Price: 220
Weight: 150
Unit: g
Description: Tender baby button mushrooms perfect for whole roasting or grilling. Premium quality.
Category: Button Mushrooms
Is Available: ✅ TRUE
Stock: 50
Is Featured: FALSE
```

---

### Enoki Mushroom Products (3 products)

#### Product 13: Fresh Enoki Mushrooms
```
Name: Fresh Enoki Mushrooms
Price: 250
Weight: 150
Unit: g
Description: Delicate enoki mushrooms with mild flavor. Perfect for hot pots, ramen, and salads.
Category: Enoki Mushrooms
Is Available: ✅ TRUE
Stock: 40
Is Featured: ✅ TRUE
```

#### Product 14: Organic Enoki Mushrooms
```
Name: Organic Enoki Mushrooms
Price: 320
Weight: 150
Unit: g
Description: Certified organic enoki mushrooms grown in controlled environment. Premium freshness.
Category: Enoki Mushrooms
Is Available: ✅ TRUE
Stock: 25
Is Featured: FALSE
```

#### Product 15: Golden Enoki Mushrooms
```
Name: Golden Enoki Mushrooms
Price: 280
Weight: 150
Unit: g
Description: Rare golden variety of enoki mushrooms with richer flavor. Great for special dishes.
Category: Enoki Mushrooms
Is Available: ✅ TRUE
Stock: 20
Is Featured: FALSE
```

---

### King Oyster Products (3 products)

#### Product 16: Fresh King Oyster Mushrooms
```
Name: Fresh King Oyster Mushrooms
Price: 420
Weight: 300
Unit: g
Description: Thick, meaty king oyster mushrooms. Perfect vegan alternative to scallops. Rich umami flavor.
Category: King Oyster Mushrooms
Is Available: ✅ TRUE
Stock: 35
Is Featured: ✅ TRUE
```

#### Product 17: Sliced King Oyster
```
Name: Sliced King Oyster
Price: 450
Weight: 250
Unit: g
Description: Pre-sliced king oyster mushrooms for convenient cooking. Great for grilling and stir-frying.
Category: King Oyster Mushrooms
Is Available: ✅ TRUE
Stock: 30
Is Featured: FALSE
```

#### Product 18: Organic King Oyster
```
Name: Organic King Oyster
Price: 520
Weight: 300
Unit: g
Description: Organic king oyster mushrooms with exceptional texture and taste. Certified pesticide-free.
Category: King Oyster Mushrooms
Is Available: ✅ TRUE
Stock: 20
Is Featured: FALSE
```

---

### Mushroom Bundle Products (2 products)

#### Product 19: Gourmet Mushroom Mix
```
Name: Gourmet Mushroom Mix
Price: 580
Weight: 500
Unit: g
Description: Curated mix of shiitake, oyster, and button mushrooms. Perfect variety pack for diverse cooking.
Category: Mushroom Bundles
Is Available: ✅ TRUE
Stock: 30
Is Featured: ✅ TRUE
```

#### Product 20: Deluxe Mushroom Collection
```
Name: Deluxe Mushroom Collection
Price: 850
Weight: 800
Unit: g
Description: Premium collection featuring 5 mushroom varieties. Ideal for mushroom lovers and chefs.
Category: Mushroom Bundles
Is Available: ✅ TRUE
Stock: 15
Is Featured: ✅ TRUE
```

---

## ✅ Step 3: Mark Products as Featured (5 minutes)

To display products on the homepage, you need to mark at least 8 products as **"Featured"**.

**Products I've marked as Featured (10 total):**
1. Premium Dried Shiitake ✅
2. Fresh Shiitake Mushrooms ✅
3. Fresh Oyster Mushrooms ✅
4. Pink Oyster Mushrooms ✅
5. Fresh White Button Mushrooms ✅
6. Fresh Enoki Mushrooms ✅
7. Fresh King Oyster Mushrooms ✅
8. Gourmet Mushroom Mix ✅
9. Deluxe Mushroom Collection ✅
10. (Extra featured product)

**To mark a product as featured:**
1. Open product in Sanity Studio
2. Scroll to **"Is Featured"** checkbox
3. Check the box ✅
4. Click **"Publish"**

---

## 🧪 Step 4: Test Your Work (5 minutes)

### Test Homepage:
1. Open: http://localhost:3000
2. Scroll to **"Our Bestsellers"** section
3. **Expected Result:** 8 featured products display in carousel
4. If still shows "No featured products", refresh page (Ctrl+F5)

### Test Shop Page:
1. Open: http://localhost:3000/shop
2. **Expected Result:** All 20 products display
3. Test category filters (Shiitake, Oyster, Button, etc.)
4. **Expected Result:** Products filter by category

### Test Product Detail:
1. Click any product card
2. **Expected Result:** Product detail page loads at `/product/[slug]`
3. Verify image, price, description display correctly

---

## 🎨 Adding Product Images (Optional but Recommended)

**Where to Get Mushroom Images:**

1. **Unsplash** (Free): https://unsplash.com/s/photos/mushroom
2. **Pexels** (Free): https://www.pexels.com/search/mushroom/
3. **Pixabay** (Free): https://pixabay.com/images/search/mushroom/

**How to Add Images in Sanity:**

1. Edit product in Sanity Studio
2. Click **"Main Image"** field
3. Click **"Upload"** button
4. Select image from computer
5. Crop if needed
6. Click **"Publish"**

**💡 Tip:** Use square images (1:1 aspect ratio) for best results.

---

## 🚀 Quick Batch Entry Method (Advanced)

If you want to add products faster, you can use Sanity's import feature:

### Option A: Manual Entry (Recommended for First Time)
- Follow Step 2 above
- Copy/paste each product's details
- Takes ~30 minutes for 20 products

### Option B: Sanity CLI Import (Advanced)
```bash
# In studio/ directory
npm install -g @sanity/cli
sanity dataset import products.ndjson production
```

**Note:** We can create an NDJSON import file if you want to bulk import 100+ products later.

---

## 📊 What You Should Have After This Guide

### Categories (6):
- ✅ Shiitake Mushrooms
- ✅ Oyster Mushrooms
- ✅ Button Mushrooms
- ✅ Enoki Mushrooms
- ✅ King Oyster Mushrooms
- ✅ Mushroom Bundles

### Products (20):
- ✅ 5 Shiitake products
- ✅ 4 Oyster products
- ✅ 3 Button products
- ✅ 3 Enoki products
- ✅ 3 King Oyster products
- ✅ 2 Bundle products

### Featured Products (10):
- ✅ At least 8 products marked as "Featured"
- ✅ Homepage carousel displays products
- ✅ Shop page fully functional

---

## 🐛 Troubleshooting

### Issue: "No featured products available yet"
**Solutions:**
1. Check Sanity Studio - Are products published? (green checkmark)
2. Are products marked as "Featured"? (checkbox checked)
3. Is "Is Available" set to TRUE?
4. Refresh browser (Ctrl+F5)
5. Check console for errors

### Issue: Products not showing in shop
**Solutions:**
1. Verify products are **published** in Sanity
2. Check "Is Available" is TRUE
3. Verify category is assigned
4. Refresh page

### Issue: Images not displaying
**Solutions:**
1. Upload images in Sanity Studio
2. Check Main Image field is filled
3. Verify image uploaded successfully
4. Use placeholder if needed: `/placeholder-product.jpg`

---

## 🎯 Next Steps After Adding Products

### Immediate (Today):
- ✅ Test homepage - Should show 8 featured products
- ✅ Test shop page - Should show all 20 products
- ✅ Test category filters - Should filter correctly
- ✅ Test product detail pages - Should load properly

### Optional Enhancements:
1. **Add More Products** - Repeat Step 2 for more variety
2. **Add Product Images** - Upload real mushroom photos
3. **Create More Categories** - Add specialty categories
4. **Add Product Variations** - Different weights/prices
5. **Add Related Products** - Connect similar products

---

## 📚 Additional Resources

- **Sanity Studio:** https://mash-ecommerce.sanity.studio
- **Sanity Docs:** https://www.sanity.io/docs
- **Free Images:** https://unsplash.com/s/photos/mushroom
- **Project Docs:** See `.github/COMPLETE_IMPLEMENTATION_STATUS.md`

---

## ✅ Completion Checklist

Before moving on, verify:

- [ ] 6+ categories created and published
- [ ] 20+ products created and published
- [ ] 8+ products marked as "Featured"
- [ ] All products have "Is Available" = TRUE
- [ ] All products have stock > 0
- [ ] Products assigned to categories
- [ ] Homepage displays featured products carousel
- [ ] Shop page displays all products
- [ ] Category filters work correctly
- [ ] Product detail pages load properly
- [ ] No console errors

---

**Last Updated:** November 20, 2025  
**Status:** READY TO USE - Follow steps above  
**Time Required:** 30-45 minutes  
**Result:** Fully functional shop with 20+ products! 🎉
