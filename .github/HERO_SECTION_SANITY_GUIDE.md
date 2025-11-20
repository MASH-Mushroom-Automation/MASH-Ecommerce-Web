# 🎨 Hero Section Setup Guide - Sanity CMS

**Date:** November 20, 2025  
**Time Required:** 10-15 minutes  
**Purpose:** Configure homepage hero carousel in Sanity CMS  
**Result:** Dynamic, editable hero section with multiple slides! 🎉

---

## 🎯 What You'll Create

**Hero Carousel Features:**
- ✅ Multiple hero slides (3-5 recommended)
- ✅ Custom headlines and descriptions
- ✅ Call-to-action buttons with links
- ✅ Background images (optional - add later!)
- ✅ Auto-rotating carousel
- ✅ Fully editable from Sanity Studio

---

## 📋 What is a Hero Section?

The **Hero Section** is the large banner at the top of your homepage (http://localhost:3000/).

**Current State:** Shows default static hero
**After This Guide:** Dynamic carousel managed in Sanity!

---

## ✅ Step 1: Open Sanity Studio (1 minute)

1. **Go to:** https://mash-ecommerce.sanity.studio
2. **Sign in** with Google (jkrbn99@gmail.com)
3. Wait for dashboard to load

---

## 🎪 Step 2: Create Hero Carousel (2 minutes)

### Instructions:
1. Look in **left sidebar** for **"Hero Carousel"**
2. Click **"Hero Carousel"**
3. You'll see the hero carousel editor

**Note:** Unlike products/categories, there's only ONE hero carousel (singleton). You edit slides within it!

---

## 🖼️ Step 3: Add Hero Slides (10 minutes - NO IMAGES!)

Click **"+ Add Slide"** button to add each slide below.

### How to Add a Slide:
1. Click **"+ Add Slide"** at bottom of Hero Carousel editor
2. Fill in fields for each slide
3. **SKIP "Background Image"** - leave empty for now!
4. Click **"Publish"** when done with all slides

---

### Hero Slide 1: Welcome to MASH
```
Title: Fresh Farm Mushrooms Delivered Daily
Subtitle: Premium quality mushrooms from local organic farms. Order today and taste the difference!

Call to Action:
  - Button Text: Shop Now
  - Button Link: /shop
  - Button Style: primary (select from dropdown)

Background Image: (SKIP - leave empty for now)
Order: 1 (display order - shows first)
Is Active: ✅ YES (check this box to show slide)
```

---

### Hero Slide 2: Special Promotion
```
Title: 20% Off Gourmet Bundles This Week!
Subtitle: Try our curated mushroom collections at special prices. Perfect for gifts or exploring new varieties.

Call to Action:
  - Button Text: View Bundles
  - Button Link: /shop?category=gift-bundles
  - Button Style: primary

Background Image: (SKIP)
Order: 2
Is Active: ✅ YES
```

---

### Hero Slide 3: Organic Collection
```
Title: Certified Organic Mushrooms
Subtitle: Grown without pesticides or chemicals. Premium quality for health-conscious customers who care about what they eat.

Call to Action:
  - Button Text: Explore Organic
  - Button Link: /shop?category=organic-collection
  - Button Style: primary

Background Image: (SKIP)
Order: 3
Is Active: ✅ YES
```

---

### Hero Slide 4 (Optional): About Us
```
Title: Supporting Local Farmers Since 2024
Subtitle: Direct from farm to your table. We partner with local growers to bring you the freshest mushrooms in the Philippines.

Call to Action:
  - Button Text: Our Story
  - Button Link: /about
  - Button Style: secondary

Background Image: (SKIP)
Order: 4
Is Active: ✅ YES
```

---

### Hero Slide 5 (Optional): Contact
```
Title: Questions About Our Mushrooms?
Subtitle: Our team is here to help! Get expert advice on cooking, storing, and selecting the perfect mushrooms for your needs.

Call to Action:
  - Button Text: Contact Us
  - Button Link: /contact
  - Button Style: secondary

Background Image: (SKIP)
Order: 5
Is Active: ✅ YES
```

---

## 💾 Step 4: Publish Your Hero Carousel

1. **Review** all slides you added
2. **Make sure** "Is Active" is checked for slides you want to show
3. **Click "Publish"** button (green, bottom right)
4. Wait for success message ✅

---

## 🧪 Step 5: Test Your Hero Section

1. **Open:** http://localhost:3000
2. **Look at top** of homepage - You should see your hero carousel!
3. **Wait 5 seconds** - Carousel should auto-rotate to next slide
4. **Use navigation dots** at bottom to jump between slides
5. **Click buttons** - Should link to shop, about, contact pages

**✅ SUCCESS! Your hero carousel is now live!**

---

## 🖼️ Step 6: Add Background Images Later (Optional)

When you have hero images ready:

### For Each Slide:
1. Open Sanity Studio → **"Hero Carousel"**
2. Find the slide you want to edit
3. Click **"Background Image"** field
4. **Drag & drop** your image (recommended: 1920x800px)
5. Adjust image position if needed
6. **Click "Publish"** ✅

### Recommended Image Specs:
- **Size:** 1920x800px (or similar 21:9 ratio)
- **Format:** JPG or PNG
- **File size:** Under 500KB (optimized)
- **Content:** Mushrooms, farms, or nature themes

---

## 🎨 Hero Section Features in Your Site

**What Works Now:**
- ✅ Auto-rotating carousel (5 seconds per slide)
- ✅ Navigation dots for manual control
- ✅ Call-to-action buttons with links
- ✅ Responsive on mobile/tablet/desktop
- ✅ Smooth transitions between slides
- ✅ Gradient overlay (default - changes when you add images)

**What You'll Add Later:**
- 🖼️ Background images for each slide
- 🎨 Custom colors (optional - requires code)
- ⏱️ Custom timing (optional - requires code)

---

## 📊 Hero Carousel Summary

**What You Created:**
- 3-5 hero slides (customizable)
- Each with headline, subtitle, and CTA button
- Links to shop, categories, about, contact
- Auto-rotating carousel
- Fully managed in Sanity CMS

**Time to Create:** 10-15 minutes  
**Editable:** Anytime in Sanity Studio!  
**Images:** Add later when ready! 📸

---

## 🔧 Advanced Options (Optional)

### Slide Order
- Change **"Order"** field to rearrange slides
- Lower numbers appear first (1, 2, 3...)
- Reorder anytime without deleting/recreating

### Active/Inactive Slides
- Uncheck **"Is Active"** to hide a slide temporarily
- Great for seasonal promotions
- Slide stays in Sanity, just hidden from homepage

### Button Styles
- **primary** - Green button (main actions)
- **secondary** - White outline button (secondary actions)
- **ghost** - Text-only button (subtle actions)

### Link Examples
```
Shop page: /shop
Category: /shop?category=fresh-mushrooms
About page: /about
Contact: /contact
Specific product: /product/premium-fresh-shiitake
```

---

## 🆘 Troubleshooting

**Hero carousel not showing?**
- [ ] Check you clicked **"Publish"** in Sanity
- [ ] Make sure at least 1 slide has **"Is Active: YES"**
- [ ] Refresh browser: Ctrl+Shift+R
- [ ] Check dev server is running: `npm run dev`

**Slides not rotating?**
- [ ] Make sure you have 2+ active slides
- [ ] Wait 5 seconds between rotations
- [ ] Check browser console for errors (F12)

**Buttons not working?**
- [ ] Verify links start with `/` (e.g., `/shop` not `shop`)
- [ ] Check link spelling matches actual page
- [ ] Test link by typing in browser address bar

**Slides in wrong order?**
- [ ] Check **"Order"** field (1, 2, 3...)
- [ ] Lower numbers display first
- [ ] Republish after changing order

---

## 💡 Pro Tips

**Start Simple:**
- Create 3 slides first
- Test thoroughly
- Add more slides later as needed

**Content Strategy:**
1. **Slide 1:** Main value proposition (shop now)
2. **Slide 2:** Current promotion/offer
3. **Slide 3:** Unique selling point (organic, local, etc.)
4. **Slide 4-5:** Additional info (about, contact)

**Skip Images Initially:**
- Carousel works great with gradient backgrounds
- Add images when you have high-quality photos
- Placeholder gradient looks professional

**Update Regularly:**
- Change slide 2 for weekly promotions
- Update seasonal offers
- Rotate featured products

---

## 📝 Sample Content Ideas

### For Different Slides:

**Promotional:**
```
Title: Limited Time Offer - 25% Off!
Subtitle: Save big on premium shiitake bundles this weekend only.
Button: Shop Sale
```

**Educational:**
```
Title: New to Mushrooms? Start Here!
Subtitle: Beginner's guide to selecting, storing, and cooking mushrooms.
Button: Learn More
```

**Product Focus:**
```
Title: Introducing Lion's Mane Mushrooms
Subtitle: Known for cognitive benefits and unique texture. Limited availability!
Button: Shop Lion's Mane
```

**Seasonal:**
```
Title: Perfect Mushrooms for Holiday Cooking
Subtitle: Premium selection for your festive meals and gift-giving.
Button: View Collection
```

---

## 🎬 Next Steps

After setting up hero carousel:

1. **Add Products** (if you haven't yet)
   - Follow: `COPY_PASTE_PRODUCTS_NO_IMAGES.md`

2. **Add Hero Images**
   - Get 3-5 high-quality mushroom photos
   - Upload to Sanity (1920x800px recommended)

3. **Test on Mobile**
   - Open http://localhost:3000 on phone
   - Check carousel works smoothly

4. **Update Content Regularly**
   - Weekly promotions
   - Seasonal offers
   - New product announcements

---

## ✅ Completion Checklist

After following this guide:

- [ ] Opened Sanity Studio
- [ ] Found "Hero Carousel" in sidebar
- [ ] Added 3-5 hero slides
- [ ] Filled in title, subtitle, and CTA for each
- [ ] Set slide order (1, 2, 3...)
- [ ] Checked "Is Active" for all slides
- [ ] Clicked "Publish"
- [ ] Tested homepage - hero carousel shows
- [ ] Tested auto-rotation (5 seconds)
- [ ] Tested navigation dots
- [ ] Tested CTA buttons - links work

---

## 📚 Related Guides

**Other Setup Guides:**
- `COPY_PASTE_PRODUCTS_NO_IMAGES.md` - Add products to homepage
- `QUICK_CHECKLIST.md` - Quick product setup
- `START_HERE_KENNETH.md` - Complete overview

**Documentation:**
- `README.md` - All documentation index
- `SANITY_QUICK_REFERENCE.md` - Sanity basics

---

**Time to Complete:** 10-15 minutes  
**Result:** Dynamic hero carousel on homepage! 🎉  
**Images:** Add later when you have them! 📸

**Status:** ✅ READY - Start adding hero slides NOW! 🚀

---

## 🎊 You're Done!

**What You Have NOW (without images):**
- ✅ Hero carousel on homepage
- ✅ 3-5 rotating slides
- ✅ Headlines and call-to-actions
- ✅ Links to shop, categories, about
- ✅ Auto-rotating carousel
- ✅ Professional gradient backgrounds

**What You'll Add LATER (when you have images):**
- 🖼️ Custom background images for each slide
- 🎨 Seasonal updates
- 📣 Weekly promotion slides

**Your hero section is LIVE and working! 🎉**
