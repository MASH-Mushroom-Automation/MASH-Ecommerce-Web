# 👋 KENNETH - START HERE!

**Date:** November 20, 2025  
**Your Goal:** Get products showing on homepage http://localhost:3000/

---

## ⚡ THE EASIEST WAY (What You Asked For!)

### You Said:
> "how do i just copy paste the procust to sanity cms i want it to have the products and i will jjust add the images later on"

### Here's Your Answer:

**📄 Open This File:** [`COPY_PASTE_PRODUCTS_NO_IMAGES.md`](./COPY_PASTE_PRODUCTS_NO_IMAGES.md)

**⏱️ Time Needed:** 30-40 minutes

**What You'll Do:**
1. ✅ Copy/paste 6 main categories (text only - NO images!)
2. ✅ Copy/paste 6 subcategories (with parent connections)
3. ✅ Copy/paste 30 products (text only - NO images!)
4. ✅ Homepage works immediately!
5. 🖼️ Add images later when you're ready (guide included)

**Result:**
- ✅ Homepage shows 10 featured products in carousel
- ✅ Shop page shows all 30 products
- ✅ Categories work with hierarchy
- ⚠️ No images yet (you'll add them later)

---

## 🎯 What Each Field Means (Quick Reference)

### **Categories** (12 total - 6 main + 6 subs)

**Main Categories:**
1. **Fresh Mushrooms** - Fresh varieties
2. **Dried Mushrooms** - Dried/dehydrated
3. **Specialty Mushrooms** - Rare varieties
4. **Organic Collection** - Certified organic
5. **Products** - General category
6. **Bundles** - Variety packs

**Subcategories** (connect to parent):
1. **Fresh Shiitake** → parent: Fresh Mushrooms
2. **Fresh Oyster** → parent: Fresh Mushrooms
3. **Fresh Button** → parent: Fresh Mushrooms
4. **Fresh Enoki** → parent: Fresh Mushrooms
5. **Dried Shiitake** → parent: Dried Mushrooms
6. **King Oyster** → parent: Specialty Mushrooms

### **Products** (30 total - 10 featured)

**Featured Products** (show on homepage carousel):
1. Fresh Shiitake (₱450)
2. Fresh Oyster (₱320)
3. Fresh White Button (₱180)
4. Premium Lion's Mane (₱680)
5. Fresh Enoki (₱250)
6. King Oyster Premium (₱420)
7. Gourmet Mushroom Bundle (₱980)
8. Specialty Mushroom Mix (₱650)
9. Organic Shiitake (₱520)
10. Deluxe Mushroom Gift Basket (₱1,850)

**Regular Products** (20 more):
- Fresh varieties (button, oyster, shiitake)
- Dried varieties
- Specialty mushrooms
- Organic options
- Bundles

---

## 📋 Sanity Fields Explained

### Category Fields (5 total):
```
Name: Category name (e.g., "Fresh Mushrooms")
Slug: Auto-generated from name (e.g., "fresh-mushrooms")
Parent Category: Leave empty for main, select parent for subcategory
Image: **SKIP THIS** - Leave blank for now
Description: Brief description (e.g., "Fresh mushroom varieties")
```

### Product Fields (18 total):
```
Name: Product name (e.g., "Fresh Shiitake Mushrooms")
Slug: Auto-generated from name
Image: **SKIP THIS** - Leave blank for now
Category: Select from dropdown (e.g., Fresh Mushrooms → Fresh Shiitake)
Regular Price: Amount in pesos (e.g., 450)
On Promotion: YES or NO toggle
Promotion Type: Percentage or Fixed (if promo active)
Discount Percentage: % off (if percentage promo)
Promotional Price: New price (if fixed promo)
Quantity in Stock: Number of units (e.g., 50)
Description: Full product description
SKU: Product code (e.g., FSH-001)
Available for Purchase: ✅ Check YES
Additional Images: **SKIP THIS** - Leave blank for now
Weight: Product weight (e.g., 250)
Unit: Select from dropdown (g, kg, pcs, pack, box)
Featured Product: ✅ Check for 10 products (homepage carousel)
Compare at Price: Leave blank (unless promo active)
Promotion End Date: Leave blank for now
```

---

## 🚀 Step-by-Step Process

### **Step 1: Open Sanity Studio** (2 min)
1. Open browser
2. Go to: https://mash-ecommerce.sanity.studio
3. Log in with your credentials
4. You're in! 🎉

### **Step 2: Create Categories** (10 min)
1. Click "Categories" in left sidebar
2. Click "+ Create" button
3. **Copy/paste from guide:**
   - Name: "Fresh Mushrooms"
   - Description: "Fresh mushroom varieties"
   - **SKIP Image** - leave blank
   - Parent Category: Leave empty (main category)
4. Click "Publish"
5. **Repeat 5 more times** for main categories
6. **Repeat 6 times** for subcategories (select parent!)

**Result:** 12 categories created ✅

### **Step 3: Add 10 Featured Products First** (20 min)
1. Click "Products" in left sidebar
2. Click "+ Create" button
3. **Copy/paste from guide:**
   - All text fields (name, price, description, etc.)
   - **SKIP Image** - leave blank
   - Category: Select from dropdown
   - **Check "Featured Product" box** ✅
4. Click "Publish"
5. **Repeat 9 more times** for all 10 featured products

**Result:** Homepage carousel works! ✅

### **Step 4: Add 20 Regular Products** (20 min)
1. Same process as Step 3
2. **Don't check "Featured Product" box**
3. Copy/paste all text fields
4. **SKIP images** - leave blank

**Result:** Shop page shows all 30 products! ✅

### **Step 5: Check Homepage** (2 min)
1. Open: http://localhost:3000/
2. Scroll to "Our Bestsellers" section
3. **You should see:** 10 products in carousel! 🎉
4. Go to: http://localhost:3000/shop
5. **You should see:** All 30 products! 🎉

---

## 🖼️ Add Images Later (Optional - When Ready)

**When you have product images:**
1. Open Sanity Studio
2. Click "Products" → Select product
3. Click "Product Image" field
4. Drag image file OR click to browse
5. Upload image
6. Click "Publish"
7. Repeat for all products

**Where to Get Images:**
- Unsplash: https://unsplash.com/s/photos/mushroom
- Pexels: https://www.pexels.com/search/mushroom/
- Pixabay: https://pixabay.com/images/search/mushroom/
- Your own photos!

---

## ❓ Troubleshooting

### "Homepage still shows 'No featured products available yet'"
**Solution:**
- Make sure at least 8 products have "Featured Product" checked ✅
- Refresh page (Ctrl + F5)
- Check browser console for errors

### "Category dropdown is empty"
**Solution:**
- Create categories first (Step 2)
- Refresh Sanity Studio page
- Categories should appear in dropdown

### "Can't publish product - Image required error"
**Solution:**
- Your Sanity schema might still require images
- See guide section: "⚠️ IMPORTANT: Image Field Configuration"
- Follow Option A (make images optional) OR Option B (use placeholder)

### "Subcategory not connecting to parent"
**Solution:**
- Make sure parent category is published first
- Select parent from "Parent Category" dropdown
- If dropdown empty, create main categories first

---

## 📊 What You're Creating

**Category Structure:**
```
Fresh Mushrooms (main)
├── Fresh Shiitake (sub)
├── Fresh Oyster (sub)
├── Fresh Button (sub)
└── Fresh Enoki (sub)

Dried Mushrooms (main)
└── Dried Shiitake (sub)

Specialty Mushrooms (main)
└── King Oyster (sub)

Organic Collection (main)
Products (main)
Bundles (main)
```

**Product Distribution:**
- 30 total products
- 10 featured (homepage carousel)
- 20 regular (shop page)
- 13 with promotions (discounts)
- All connected to categories
- All with SKU codes
- All with stock quantities
- **NO images yet** (you'll add later)

---

## 🎯 Your Next Steps

**RIGHT NOW:**
1. ✅ Open [`COPY_PASTE_PRODUCTS_NO_IMAGES.md`](./COPY_PASTE_PRODUCTS_NO_IMAGES.md)
2. ✅ Follow Step 1: Create 6 main categories
3. ✅ Follow Step 2: Create 6 subcategories
4. ✅ Follow Step 3: Add 30 products
5. ✅ Check homepage: http://localhost:3000/

**LATER (When Ready):**
6. 🖼️ Add product images (guide included)
7. 📸 Add category images (optional)
8. 📦 Add more products (use same template)

---

## 📞 Need Help?

**Check These Files:**
- [`COPY_PASTE_PRODUCTS_NO_IMAGES.md`](./COPY_PASTE_PRODUCTS_NO_IMAGES.md) - Your main guide
- [`COMPLETE_SANITY_DATA_GUIDE.md`](./COMPLETE_SANITY_DATA_GUIDE.md) - Alternative (with images)
- [`SANITY_QUICK_REFERENCE.md`](./SANITY_QUICK_REFERENCE.md) - Sanity Studio basics
- [`README.md`](./README.md) - All documentation index

**Common Issues:**
- Image validation errors → See guide section "Image Field Configuration"
- Categories not appearing → Create main categories first
- Homepage not updating → Check Featured Product checkbox
- Sanity Studio login → Use your credentials

---

**🎉 YOU'RE READY TO START!**

**Open:** [`COPY_PASTE_PRODUCTS_NO_IMAGES.md`](./COPY_PASTE_PRODUCTS_NO_IMAGES.md)

**Time:** 30-40 minutes

**Result:** Homepage with 10 products, Shop with 30 products! 🚀

---

**Last Updated:** November 20, 2025  
**Status:** ✅ READY FOR YOU TO START!  
**Next Step:** Open COPY_PASTE_PRODUCTS_NO_IMAGES.md and follow steps! 🔥
