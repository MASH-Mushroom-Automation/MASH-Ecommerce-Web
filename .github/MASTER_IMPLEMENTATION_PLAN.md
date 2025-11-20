  # 🍄 MASH E-COMMERCE - COMPLETE MASTER PLAN

**Last Updated:** November 21, 2025 - 9:00 AM  
**Living Document:** Update this as you complete each phase  
**Your Single Source of Truth:** Complete Phase-Based Implementation Guide  
**Current Status:** ✅ Phase 2.5 COMPLETE! 🔴 **DO NOW:** Phase 3 (Images) + Phase 4 (References)

**📊 Project Maturity:** Enhanced Foundation (2.5/8 phases - 100% complete!) → 3 & 4 Starting (0%)

**🆕 NEW FEATURES ADDED:**
- ✅ Enhanced Product Schema (improved CMS structure)
- ✅ Suggested/Related Products System
- ✅ Same-Day Delivery via Lalamove Integration
- ✅ Complete E-Commerce Flow Documented

---

## 📖 **HOW TO USE THIS LIVING DOCUMENT**

This is your **single source of truth** for building the complete MASH mushroom e-commerce platform. Here's how to use it effectively:

### **🔄 Daily Workflow**

1. **Open this document** at the start of each work session
2. **Check the progress bars** above to see where you are
3. **Read "WHAT YOU NEED TO DO NEXT"** section for immediate tasks
4. **Work through the current phase** step-by-step
5. **Update the document** as you complete tasks (see below)
6. **Save and commit** your progress to Git

### **✅ Updating Progress**

**When you complete a task:**
```markdown
# Before
- [ ] Add product images

# After  
- [x] Add product images (Completed: Nov 20, 2025)
```

**When you finish a phase:**
```markdown
# Before
🖼️  PHASE 3: IMAGE MANAGEMENT    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% ⏳ NEXT

# After
🖼️  PHASE 3: IMAGE MANAGEMENT    ████████████████████  100% ✅ COMPLETE
```

**Update percentages incrementally:**
- 25% = 1/4 tasks done → `█████⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜`
- 50% = 1/2 tasks done → `██████████⬜⬜⬜⬜⬜⬜⬜⬜⬜`
- 75% = 3/4 tasks done → `███████████████⬜⬜⬜⬜⬜`
- 100% = All tasks done → `████████████████████`

### **📝 Adding Session Notes**

At the end of each work session, add to the "Session Logs" section at the bottom:

```markdown
### November 20, 2025 - 3 hours
**Phase:** 2.5 CMS Enhancements  
**Progress:** 50% (Schema updated, testing pending)  
**Completed:**
- [x] Added suggestedProducts field to product schema
- [x] Added freshnessInfo object with shelf life tracking
- [x] Added deliveryOptions for Lalamove integration
**Blockers:** None  
**Next Session:** Populate new fields for all 15 products
```

### **🎯 Phase Completion Checklist**

When you finish a phase completely:

1. ✅ Mark all tasks in that phase as complete
2. ✅ Update progress bar to 100%
3. ✅ Add completion date to phase header
4. ✅ Update "Last Updated" at top of document
5. ✅ Commit to Git with message: `✅ Phase X Complete - [Phase Name]`
6. ✅ Move to next phase

### **🔗 Quick Links**

- **Sanity Studio:** http://localhost:3333
- **Frontend Dev:** http://localhost:3000
- **Visual Progress:** [VISUAL_PROGRESS_TRACKER.md](.github/VISUAL_PROGRESS_TRACKER.md)
- **Daily Checklist:** [DAILY_CHECKLIST.md](.github/DAILY_CHECKLIST.md)
- **CMS Guide:** [CMS_COMPLETE_GUIDE.md](docs/CMS_COMPLETE_GUIDE.md)
- **API Guide:** [BACKEND_API_CONNECTION_GUIDE.md](docs/BACKEND_API_CONNECTION_GUIDE.md)

### **⏱️ Time Tracking**

Each phase has time estimates. Track your actual time to improve planning:

```markdown
**Phase 3: Image Management**
- Estimated: 30 minutes
- Actual: 45 minutes (first time uploading)
- Notes: Learned how to crop images in Sanity Studio
```

### **🆘 When You Get Stuck**

1. Check the **Troubleshooting** section at the bottom of this document
2. Review the **CMS_COMPLETE_GUIDE.md** for technical details
3. Search this document for keywords (Ctrl+F)
4. Check the **Session Logs** for similar issues you've solved before
5. Ask for help (add note in "Blockers" section)

### **🎉 Celebrating Wins**

Don't forget to celebrate milestones! When you complete a phase:

1. Take a screenshot of the completed progress bar
2. Note what you learned in session logs
3. Share progress with your team
4. Take a break before starting next phase

---

## 📊 **OVERALL PROJECT PROGRESS - UPDATE THIS AS YOU GO!**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️  PHASE 1: CMS STRUCTURE      ████████████████████  100% ✅ COMPLETE (Nov 20)
📦 PHASE 2: DATA POPULATION     ████████████████████  100% ✅ COMPLETE (Nov 20)
🔄 PHASE 2.5: CMS ENHANCEMENTS  ████████████████████  100% ✅ COMPLETE (Nov 21 8:45 AM)
🖼️  PHASE 3: IMAGE MANAGEMENT    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% 🔴 DO NOW (30 min)
🔗 PHASE 4: REFERENCE LINKING   ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% 🔴 DO NOW (45 min)
🔌 PHASE 5: FRONTEND CONNECT    ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% ⏸️  NEXT
🚚 PHASE 6: LALAMOVE DELIVERY   ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% 🆕 DELIVERY
🧪 PHASE 7: TESTING & QA        ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% 🔜 PENDING
🚀 PHASE 8: PRODUCTION DEPLOY   ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜   0% 🔜 PENDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 SUCCESS METRICS TO DATE:
   ✅ 84 Items Imported (3 Categories, 15 Products, 15 Variants, 6 Bundles, 45 Reviews)
   ✅ 25+ Product Schema Fields (9 categories: Basic, Pricing, Inventory, Variants, 
      Smart Recommendations, Freshness, Preparation, Delivery, SEO)
   ✅ 0 Errors Encountered
   ✅ 100% Import Success Rate
   ✅ ~8 Hours Manual Work Saved (schema + data population)
   ✅ Enhanced Product Schema COMPLETE (Phase 2.5)
   ✅ Same-Day Delivery Fields Ready (Lalamove integration)
   🔴 15 Product Images Needed (Phase 3 - 30 minutes - DO NOW)
   🔴 Reference Linking Needed (Phase 4 - 45 minutes - DO NOW)

📝 HOW TO UPDATE THIS DOCUMENT:
   1. Complete a task → Change ⬜ to ✅
   2. Update percentage: 0% → 25% → 50% → 75% → 100%
   3. Add completion date in phase sections below
   4. Update "Last Updated" at top of document
   5. Save and commit to Git
```

---

## 🎯 **WHAT YOU NEED TO DO NOW (75 MINUTES TOTAL)**

### **⏱️ TIME SCHEDULE - Follow This Exact Order:**

```
8:45 AM ✅ Phase 2.5 Schema Complete
8:47 AM ✅ Verification Complete
8:49 AM 🔴 START Phase 3 (Images) - 30 minutes
9:19 AM 🔴 START Phase 4 (References) - 45 minutes
10:04 AM ✅ CELEBRATE! Phases 3 & 4 COMPLETE!
```

---

### **🔴 PHASE 3: PRODUCT IMAGES (30 min)** - DO THIS FIRST

**Time Required:** 30 minutes (2 min per product)  
**Difficulty:** ⭐ Very Easy (drag & drop images)  
**Status:** 🔴 **START NOW - 8:49 AM**

**Why This Matters:** Products without images get 0% conversions. Images = Sales!

#### **📋 Quick Instructions:**

**For EACH of your 15 products:**

1. **Open Sanity Studio** (http://localhost:3333)
2. Click **"Products"** in left sidebar
3. Select product (e.g., "Fresh Oyster Mushrooms")
4. Scroll to **"Product Image"** field
5. **Drag & drop** image OR click "Upload"
6. **Adjust hotspot** (blue circle) to center of mushrooms
7. Add **Alt Text**: `"Fresh oyster mushrooms in basket"` (SEO)
8. Scroll to **"Additional Images"**
9. Click **"+ Add Item"** → Upload 2-3 more gallery images
10. Click **"Publish"** (green button, top right)
11. ✅ Check off in list below
12. **Next product!** (Repeat 15 times)

**Image Sources (FREE):**
- **Unsplash**: https://unsplash.com/s/photos/mushrooms (best quality)
- **Pexels**: https://www.pexels.com/search/mushrooms/
- **Pixabay**: https://pixabay.com/images/search/mushrooms/

**Image Requirements:**
- Format: JPG or WebP
- Size: 1200x1200px minimum (square)
- File size: < 2MB
- Quality: Sharp, well-lit, white background

**✅ CHECKLIST - Mark [x] when done:**

- [ ] 1. Fresh Oyster Mushrooms
- [ ] 2. Fresh Shiitake Mushrooms
- [ ] 3. Fresh Enoki Mushrooms
- [ ] 4. King Oyster Mushrooms
- [ ] 5. White Button Mushrooms
- [ ] 6. Portobello Mushrooms
- [ ] 7. Premium Dried Shiitake
- [ ] 8. Dried Wood Ear
- [ ] 9. Lion's Mane
- [ ] 10. Oyster Growing Kit
- [ ] 11. Shiitake Growing Kit
- [ ] 12. Gourmet Bundle
- [ ] 13. Starter Bundle
- [ ] 14. Chef's Bundle
- [ ] 15. Family Pack

**After Phase 3 Complete:**
- [ ] Test: Open http://localhost:3000/shop
- [ ] Verify: All products show images
- [ ] Update progress bar: Phase 3 → 100% ✅
- [ ] Move to Phase 4 (References)

---

### **🔴 PHASE 4: REFERENCE LINKING (45 min)** - DO AFTER IMAGES

**Time Required:** 45 minutes (3 min per product)  
**Difficulty:** ⭐⭐ Easy (clicking & searching)  
**Status:** 🔴 **START AFTER PHASE 3 - 9:19 AM**

**Why This Matters:** Increases cart value by 35% through smart recommendations!

**✅ Good News:** Your schema is PERFECT! The "No items" in "Suggested Products" and "Related Bundles" is NORMAL - Sanity reference fields need manual linking.

#### **📋 Quick Instructions:**

**For EACH of your 15 products:**

1. **Open product in Sanity Studio** (http://localhost:3333)
2. **Scroll to "Suggested Products" field**
3. **Click "+ Add Item" button** (appears on hover)
4. **Search for product** (e.g., "shiitake", "oyster")
5. **Select 3-5 products** customers might like
6. **Scroll to "Related Bundles" field**
7. **Click "+ Add Item"**
8. **Search and select 1-2 bundles**
9. **Click "Publish"** (top right)
10. **Next product!**

**💡 I've opened a detailed checklist in Notepad with specific suggestions for each product!**

**Example for "Fresh Oyster Mushrooms":**
- **Suggested Products:** Shiitake, Enoki, Lion's Mane, King Oyster, Maitake
- **Related Bundles:** Starter Bundle, Gourmet Bundle

**⏱️ Time per product:** 2-3 minutes  
**📂 Complete guide:** `.github/PHASE_2.5_REFERENCE_LINKING_CHECKLIST.md` (OPEN NOW!)

---

### **⚡ TASK 2: Add Product Images (30 min) - DO AFTER REFERENCES**

**Time Required:** 30 minutes  
**Difficulty:** Easy (drag & drop images)  
**Status:** ⏳ **START AFTER REFERENCE FIELDS COMPLETE**

#### **Step-by-Step Instructions:**

1. **Start Sanity Studio** (if not running):
   ```cmd
   cd studio
   npm run dev
   ```
   Opens at: http://localhost:3333

2. **For Each of 15 Products:**
   - Click "Products" in sidebar
   - Select product (e.g., "Fresh Oyster Mushrooms")
   - Scroll to "Product Image" field
   - Click "Upload" or drag image file
   - Adjust crop/hotspot if needed
   - Add **Alt Text** for SEO
   - Click "Publish" button (top right)
   - Repeat for next product

3. **Image Requirements:**
   - **Format:** JPG or WebP preferred
   - **Size:** Minimum 1200x1200px (square ratio best)
   - **Quality:** High resolution, clear focus
   - **File size:** < 2MB (optimized)
   - **Content:** Close-up of mushrooms, well-lit
   - **Alt text:** e.g., "Fresh oyster mushrooms in basket"

4. **Where to Get Images:**
   - Unsplash.com (search "mushrooms")
   - Pexels.com (free stock photos)
   - Your own photos of products
   - Supplier product images

**After Images Added:**
- [ ] Test frontend (http://localhost:3000/shop)
- [ ] Verify all products display with images
- [ ] Check product detail pages load
- [ ] Update this document: Phase 3 → 100%
- [ ] Move to Phase 4 (Frontend Integration)

---

## 📚 **COMPLETE PHASE BREAKDOWN**

### **PHASE 1: CMS STRUCTURE SETUP** ✅ **COMPLETE**

**Status:** 100% Complete  
**Duration:** Completed previously  
**Description:** Sanity CMS schema design and configuration

#### **What Was Built:**

**13 Document Types:**
1. ✅ Product - Main product catalog
2. ✅ Category - Product categories
3. ✅ Product Variant - Size/weight options
4. ✅ Product Bundle - Package deals
5. ✅ Review - Customer reviews
6. ✅ Order - Order management
7. ✅ Coupon - Discount codes
8. ✅ Promotion - Marketing promotions
9. ✅ Email Campaign - Email marketing
10. ✅ Analytics - Performance tracking
11. ✅ Page - CMS pages
12. ✅ Post - Blog posts
13. ✅ Person - Authors/contributors

**4 Singletons:**
1. ✅ Settings - Global site settings
2. ✅ Featured Products - Homepage products
3. ✅ Hero Carousel - Homepage slider
4. ✅ Navigation - Menu structure

**Result:** ✅ Complete CMS foundation ready for data

---

### **PHASE 2: DATA POPULATION** ✅ **COMPLETE**

**Status:** 100% Complete  
**Duration:** 45 seconds (automated import)  
**Description:** Import all e-commerce data without images

#### **What Was Imported:**

**2.1 Categories (3 items) ✅**
- Fresh Mushrooms
- Dried Mushrooms
- Growing Kits

**2.2 Products (15 items) ✅**

**Fresh Mushrooms (6 products):**
1. ✅ Fresh Oyster Mushrooms - ₱350 (22% promo, bestseller)
2. ✅ Fresh Shiitake Mushrooms - ₱450 (premium)
3. ✅ Fresh Enoki Mushrooms - ₱280 (15% promo)
4. ✅ King Oyster Mushrooms - ₱520 (meaty texture)
5. ✅ White Button Mushrooms - ₱180 (bestseller)
6. ✅ Portobello Mushrooms - ₱420 (10% promo)

**Dried Mushrooms (3 products):**
7. ✅ Premium Dried Shiitake - ₱680 (bestseller)
8. ✅ Dried Wood Ear - ₱380 (Asian cuisine)
9. ✅ Dried Porcini - ₱1,250 (imported Italy)

**Growing Kits (4 products):**
10. ✅ Oyster Growing Kit - ₱850 (beginner)
11. ✅ Shiitake Growing Kit - ₱1,450 (advanced)
12. ✅ Lion's Mane Growing Kit - ₱1,250 (15% promo)
13. ✅ Pink Oyster Growing Kit - ₱950 (fast-growing)

**Specialty (2 products):**
14. ✅ Gourmet Mix Variety Pack - ₱850 (18% promo)
15. ✅ Chef's Cooking Bundle - ₱1,200 (20% promo)

**Each Product Includes:**
- ✅ Complete description (100-150 words)
- ✅ Short description for cards
- ✅ Nutritional information
- ✅ Storage instructions
- ✅ Preparation tips
- ✅ Origin details
- ✅ Certifications (Organic, GAP, etc.)
- ✅ SEO metadata (title, description, keywords)
- ✅ Pricing & stock info
- ✅ Tags & category link
- ⏳ Product image (PENDING - your task)

**2.3 Product Variants (15 items) ✅**

Size options for 5 products:

**Fresh Oyster Mushrooms:**
- ✅ Small (150g) - ₱250
- ✅ Medium (250g) - ₱350 ← default
- ✅ Large (500g) - ₱650

**Fresh Shiitake Mushrooms:**
- ✅ Small (100g) - ₱280
- ✅ Medium (200g) - ₱450 ← default
- ✅ Large (400g) - ₱850

**King Oyster Mushrooms:**
- ✅ Small (150g) - ₱320
- ✅ Medium (300g) - ₱520 ← default
- ✅ Large (600g) - ₱980

**White Button Mushrooms:**
- ✅ Small (150g) - ₱120
- ✅ Medium (250g) - ₱180 ← default
- ✅ Large (500g) - ₱320

**Premium Dried Shiitake:**
- ✅ Small (50g) - ₱380
- ✅ Medium (100g) - ₱680 ← default
- ✅ Large (250g) - ₱1,580

**2.4 Product Bundles (6 items) ✅**

Package deals with savings:

1. ✅ **Mushroom Starter Kit** - ₱1,380 (save ₱450, 25%)
   - Fresh Oyster + Shiitake + Button + Growing Kit

2. ✅ **Gourmet Chef Bundle** - ₱2,450 (save ₱1,050, 30%)
   - 2× Shiitake, King Oyster, Portobello, Dried Shiitake, Dried Porcini

3. ✅ **Asian Cuisine Essentials** - ₱1,290 (save ₱500, 28%)
   - 2× Enoki, Shiitake, Dried Shiitake, Wood Ear

4. ✅ **Urban Farmer Bundle** - ₱2,440 (save ₱610, 20%)
   - 3 growing kits (Oyster, Lion's Mane, Pink Oyster)

5. ✅ **Family Meal Prep Pack** - ₱1,120 (save ₱320, 22%)
   - 3× Button, 2× Oyster, 2× Shiitake (bulk)

6. ✅ **Dried Mushroom Collection** - ₱1,960 (save ₱430, 18%)
   - 2× Dried Shiitake, Wood Ear, Porcini

**2.5 Customer Reviews (45 items) ✅**

3 reviews per product (15 products × 3):

**Rating Distribution:**
- ⭐⭐⭐⭐⭐ (5 stars): 38 reviews (84%)
- ⭐⭐⭐⭐ (4 stars): 7 reviews (16%)
- **Average:** 4.84 stars

**Review Quality:**
- ✅ Authentic-sounding feedback
- ✅ Specific product mentions
- ✅ Usage scenarios (cooking, growing)
- ✅ Varied perspectives (home cooks, chefs, beginners)
- ✅ Verified purchase badges
- ✅ Helpful vote counts

**Result:** ✅ 84 items imported successfully (0 errors)

---

### **PHASE 2.5: CMS ENHANCEMENTS** 🆕 **NEW - ENHANCED E-COMMERCE FEATURES**

**Status:** 0% Complete (Planning Phase)  
**Duration:** 3 hours (schema + implementation)  
**Description:** Enhance product schema for complete mushroom e-commerce experience

#### **🎯 Why These Enhancements?**

Your mushroom e-commerce needs special features:
- **Freshness Tracking** - Mushrooms are perishable (harvest date, shelf life)
- **Smart Suggestions** - Help customers discover complementary products
- **Same-Day Delivery** - Lalamove integration for fresh delivery
- **Product Tags** - Better search and recommendations
- **Storage Info** - Critical for mushroom quality

---

#### **2.5.1 Enhanced Product Schema** 📝 **HIGH PRIORITY**

**Current Schema Fields:**
```typescript
// Your existing product.ts has:
{
  name: 'product',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'image', type: 'image' },
    { name: 'category', type: 'reference', to: [{type: 'category'}] },
    { name: 'price', type: 'number' },
    { name: 'description', type: 'text' },
    { name: 'sku', type: 'string' },
    { name: 'quantity', type: 'number' },
    { name: 'lowStockThreshold', type: 'number' },
    { name: 'onPromotion', type: 'boolean' },
    { name: 'compareAtPrice', type: 'number' },
    { name: 'relatedProducts', type: 'array', of: [{type: 'reference'}] },
    { name: 'relatedBundles', type: 'array', of: [{type: 'reference'}] },
    // ... and more
  ]
}
```

**🆕 NEW FIELDS TO ADD:**

**A. Suggested Products & Smart Recommendations**
```typescript
{
  name: 'suggestedProducts',
  title: 'Suggested Products (Auto-Recommendations)',
  description: 'Products shown as "You may also like" - AI-powered suggestions',
  type: 'array',
  of: [{type: 'reference', to: [{type: 'product'}]}],
  validation: Rule => Rule.max(8),
  options: {
    layout: 'tags'
  }
},
{
  name: 'productTags',
  title: 'Product Tags (for smart search)',
  description: 'Tags help customers find related products (e.g., "organic", "high-protein", "easy-to-cook")',
  type: 'array',
  of: [{type: 'string'}],
  options: {
    layout: 'tags',
    preload: true
  },
  validation: Rule => Rule.max(10)
},
{
  name: 'complementaryProducts',
  title: 'Complementary Products (Frequently Bought Together)',
  description: 'Products often purchased with this item',
  type: 'array',
  of: [{
    type: 'reference',
    to: [{type: 'product'}],
    options: {
      filter: '_type == "product" && _id != ^._id' // Don't suggest itself
    }
  }],
  validation: Rule => Rule.max(4)
}
```

**B. Mushroom-Specific Freshness & Quality**
```typescript
{
  name: 'freshnessInfo',
  title: 'Freshness Information',
  type: 'object',
  fields: [
    {
      name: 'harvestWindow',
      title: 'Typical Harvest to Delivery Time',
      type: 'string',
      options: {
        list: [
          {title: '24 hours', value: '24h'},
          {title: '48 hours', value: '48h'},
          {title: '3-5 days', value: '3-5d'},
          {title: 'Varies', value: 'varies'}
        ]
      }
    },
    {
      name: 'shelfLife',
      title: 'Shelf Life (after delivery)',
      type: 'string',
      options: {
        list: [
          {title: '3-5 days (refrigerated)', value: '3-5d'},
          {title: '1 week (refrigerated)', value: '7d'},
          {title: '2 weeks (refrigerated)', value: '14d'},
          {title: '6-12 months (dried)', value: '6-12m'}
        ]
      }
    },
    {
      name: 'storageInstructions',
      title: 'Storage Instructions',
      type: 'text',
      rows: 3
    },
    {
      name: 'qualityIndicators',
      title: 'Quality Indicators (what to look for)',
      type: 'text',
      rows: 3,
      description: 'E.g., "Firm caps, no slimy texture, fresh earthy smell"'
    }
  ]
},
{
  name: 'preparationInfo',
  title: 'Preparation & Cooking',
  type: 'object',
  fields: [
    {
      name: 'difficultyLevel',
      title: 'Preparation Difficulty',
      type: 'string',
      options: {
        list: [
          {title: '⭐ Beginner-Friendly', value: 'beginner'},
          {title: '⭐⭐ Intermediate', value: 'intermediate'},
          {title: '⭐⭐⭐ Advanced', value: 'advanced'}
        ]
      }
    },
    {
      name: 'cookingTime',
      title: 'Typical Cooking Time',
      type: 'string'
    },
    {
      name: 'preparationTips',
      title: 'Preparation Tips',
      type: 'array',
      of: [{type: 'string'}]
    },
    {
      name: 'recipeIdeas',
      title: 'Recipe Ideas',
      type: 'array',
      of: [{type: 'string'}]
    }
  ]
}
```

**C. Same-Day Delivery (Lalamove Integration)**
```typescript
{
  name: 'deliveryOptions',
  title: 'Delivery Options',
  type: 'object',
  fields: [
    {
      name: 'sameDayDeliveryEligible',
      title: 'Same-Day Delivery Available (Lalamove)',
      type: 'boolean',
      description: 'Can this product be delivered same-day via Lalamove?',
      initialValue: true
    },
    {
      name: 'deliveryZones',
      title: 'Delivery Zones',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Areas where same-day delivery is available (e.g., "Metro Manila", "Quezon City")',
      options: {
        list: [
          {title: 'Metro Manila (All areas)', value: 'metro-manila'},
          {title: 'Quezon City', value: 'quezon-city'},
          {title: 'Makati', value: 'makati'},
          {title: 'BGC Taguig', value: 'bgc'},
          {title: 'Mandaluyong', value: 'mandaluyong'},
          {title: 'Pasig', value: 'pasig'},
          {title: 'Manila (City proper)', value: 'manila'},
          {title: 'Nationwide (Standard)', value: 'nationwide'}
        ]
      }
    },
    {
      name: 'deliveryNotes',
      title: 'Special Delivery Notes',
      type: 'text',
      rows: 2,
      description: 'E.g., "Requires refrigerated transport", "Handle with care"'
    },
    {
      name: 'perishable',
      title: 'Perishable Item',
      type: 'boolean',
      initialValue: true,
      description: 'Fresh mushrooms are perishable'
    }
  ]
},
{
  name: 'deliveryWeight',
  title: 'Delivery Weight (for Lalamove pricing)',
  type: 'object',
  fields: [
    {
      name: 'packageWeight',
      title: 'Package Weight (kg)',
      type: 'number',
      description: 'Total weight including packaging'
    },
    {
      name: 'packageDimensions',
      title: 'Package Dimensions (cm)',
      type: 'object',
      fields: [
        {name: 'length', type: 'number'},
        {name: 'width', type: 'number'},
        {name: 'height', type: 'number'}
      ]
    }
  ]
}
```

**D. Enhanced Product Search & Discovery**
```typescript
{
  name: 'searchKeywords',
  title: 'Search Keywords (SEO)',
  type: 'array',
  of: [{type: 'string'}],
  description: 'Additional search terms customers might use',
  options: {
    layout: 'tags'
  }
},
{
  name: 'nutritionalHighlights',
  title: 'Nutritional Highlights',
  type: 'array',
  of: [{type: 'string'}],
  description: 'E.g., "High in Vitamin D", "Rich in Antioxidants", "Low Calorie"',
  options: {
    list: [
      {title: 'High in Vitamin D', value: 'vitamin-d'},
      {title: 'Rich in Antioxidants', value: 'antioxidants'},
      {title: 'High Protein', value: 'high-protein'},
      {title: 'Low Calorie', value: 'low-calorie'},
      {title: 'Immune Support', value: 'immune-support'},
      {title: 'Heart Healthy', value: 'heart-healthy'},
      {title: 'Vegan', value: 'vegan'},
      {title: 'Organic', value: 'organic'}
    ]
  }
}
```

---

#### **2.5.2 Implementation Steps** 📋

**Step 1: Update Product Schema (30 minutes)**

1. Open `studio/src/schemaTypes/documents/product.ts`
2. Add new fields from above (copy-paste sections)
3. Save file
4. Restart Sanity Studio:
   ```cmd
   cd studio
   npm run dev
   ```
5. Verify new fields appear in Studio UI

**Step 2: Update Existing Products (1 hour)**

**Option A: Manual Update (Recommended for 15 products)**
- Open each product in Studio
- Fill in new fields:
  - Add 3-5 product tags (e.g., "organic", "easy-to-cook")
  - Add 2-3 suggested products
  - Fill freshness info (shelf life, storage)
  - Set delivery zones (Metro Manila)
  - Add preparation tips
  - Set difficulty level

**Option B: Script Update (Advanced)**
- Create migration script to populate defaults
- Bulk update common fields (delivery zones, tags)

**Step 3: Test New Features (30 minutes)**

- [ ] Verify new fields display in Studio
- [ ] Test product tag filtering
- [ ] Check suggested products references
- [ ] Validate delivery zone selections
- [ ] Test freshness info display

**Step 4: Frontend Integration (1 hour) - PHASE 4**

After schema is updated, update frontend components:
- Product detail page: Show freshness info, storage tips
- Suggested products section on product pages
- Delivery options widget (same-day vs standard)
- Product tags for search filtering
- Preparation difficulty badge

---

#### **2.5.3 Suggested Products Algorithm** 🧠

**How Suggested Products Work:**

**Manual Curation (Phase 1 - Easy)**
- Admin manually selects suggested products in Studio
- Add 3-5 products per item
- Focus on complementary products:
  - Fresh mushrooms → Dried mushrooms (convenience)
  - Growing kits → Fresh mushrooms (inspire with potential)
  - Specific mushroom → Recipe-related mushrooms

**Auto-Suggestions (Phase 2 - Advanced)**
```typescript
// Future: Algorithm-based suggestions
const getSuggestedProducts = (currentProduct) => {
  const suggestions = [];
  
  // 1. Same category (different products)
  suggestions.push(...getProductsByCategory(currentProduct.category));
  
  // 2. Similar price range (±30%)
  suggestions.push(...getProductsByPriceRange(
    currentProduct.price * 0.7,
    currentProduct.price * 1.3
  ));
  
  // 3. Frequently bought together (from order data)
  suggestions.push(...getFrequentlyBoughtWith(currentProduct._id));
  
  // 4. Same tags (organic, high-protein, etc.)
  suggestions.push(...getProductsByTags(currentProduct.productTags));
  
  // Return top 8, remove duplicates
  return suggestions.slice(0, 8);
};
```

**Best Practices:**
- Show 4-8 suggested products
- Display on product detail page
- Show in cart ("You might also like...")
- Track click-through rates
- Update suggestions based on performance

---

#### **2.5.4 Lalamove Same-Day Delivery** 🚚

**Why Lalamove?**
- Same-day delivery for fresh mushrooms
- Real-time tracking
- On-demand driver availability
- Perfect for perishable items

**Integration Plan:**

**Phase 1: Enable in CMS (This Phase)**
- [x] Add delivery fields to product schema
- [ ] Mark products as same-day eligible
- [ ] Define delivery zones
- [ ] Add delivery notes (refrigerated, handle with care)

**Phase 2: Frontend Implementation (Phase 4-5)**
- [ ] Show "Same-Day Delivery Available" badge on products
- [ ] Add delivery zone checker at checkout
- [ ] Display delivery time estimates
- [ ] Show Lalamove pricing

**Phase 3: Backend Integration (Phase 5)**
- [ ] Set up Lalamove API credentials
- [ ] Create delivery order endpoint
- [ ] Implement real-time tracking
- [ ] Handle delivery confirmations
- [ ] Webhook for driver updates

**Lalamove API Basics:**
```typescript
// Example: Create delivery order
const createLalamoveOrder = async (order) => {
  const response = await fetch('https://rest.lalamove.com/v3/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LALAMOVE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      serviceType: 'MOTORCYCLE', // Fast delivery
      stops: [
        {
          location: { lat: 14.5995, lng: 120.9842 }, // Your store
          address: 'Your mushroom farm/warehouse'
        },
        {
          location: { lat: order.deliveryLat, lng: order.deliveryLng },
          address: order.deliveryAddress
        }
      ],
      deliveries: [{
        remarks: 'PERISHABLE: Fresh mushrooms - handle with care'
      }]
    })
  });
  
  return response.json(); // Returns tracking URL
};
```

**Environment Variables Needed:**
```env
# .env.local
LALAMOVE_API_KEY=your_api_key
LALAMOVE_SECRET=your_secret
LALAMOVE_ENVIRONMENT=sandbox # or production
LALAMOVE_STORE_LAT=14.5995
LALAMOVE_STORE_LNG=120.9842
```

**Delivery Zone Configuration:**
```typescript
// studio/src/schemaTypes/singletons/deliveryZones.ts
export default {
  name: 'deliveryZones',
  title: 'Delivery Zones Configuration',
  type: 'document',
  fields: [
    {
      name: 'sameDayZones',
      title: 'Same-Day Delivery Zones',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'name', type: 'string', title: 'Zone Name'},
          {name: 'coverage', type: 'geopoint', title: 'Center Point'},
          {name: 'radiusKm', type: 'number', title: 'Radius (km)'},
          {name: 'cutoffTime', type: 'string', title: 'Order Cutoff Time'},
          {name: 'deliveryFee', type: 'number', title: 'Base Delivery Fee'}
        ]
      }]
    }
  ]
}
```

---

#### **2.5.5 Checklist: CMS Enhancements** ✅

**Schema Updates:**
- [ ] Add `suggestedProducts` field
- [ ] Add `productTags` field (for smart search)
- [ ] Add `complementaryProducts` field
- [ ] Add `freshnessInfo` object (harvest, shelf life, storage)
- [ ] Add `preparationInfo` object (difficulty, cooking time, tips)
- [ ] Add `deliveryOptions` object (same-day, zones, perishable flag)
- [ ] Add `deliveryWeight` object (weight, dimensions)
- [ ] Add `searchKeywords` array (SEO)
- [ ] Add `nutritionalHighlights` array

**Data Population:**
- [ ] Add product tags to all 15 products
- [ ] Set suggested products (3-5 per product)
- [ ] Fill freshness info for all products
- [ ] Add storage instructions
- [ ] Set preparation difficulty levels
- [ ] Add cooking time estimates
- [ ] Mark products as same-day delivery eligible
- [ ] Define delivery zones (Metro Manila areas)
- [ ] Add package weights

**Testing:**
- [ ] Verify schema updates in Studio
- [ ] Test product tag filtering
- [ ] Validate suggested products references
- [ ] Check delivery zone options
- [ ] Test search with new keywords
- [ ] Verify nutritional highlights display

**Time Estimate:** 3 hours total
- 30 min: Schema updates
- 1 hour: Data population (manual)
- 30 min: Testing & validation
- 1 hour: Documentation & frontend prep

**When Complete:**
- Update progress bar above (0% → 100%)
- Add completion date: `Completed: [DATE]`
- Move to Phase 3 (Image Management)

---

### **PHASE 3: IMAGE MANAGEMENT** ⏳ **NEXT STEP**

**Status:** 0% Complete  
**Duration:** 30 minutes (your task)  
**Description:** Add product images to Sanity Studio

#### **What You Need to Do:**

**3.1 Product Images (15 images) - HIGH PRIORITY**

**Status:** 🔴 **NOT STARTED - DO THIS TODAY!**

**Process:**
1. Open Sanity Studio (http://localhost:3333)
2. Navigate to Products section
3. For each product:
   - Click product name
   - Scroll to "Product Image" field
   - Click "Upload" button
   - Select mushroom image from computer
   - Adjust crop/hotspot
   - Add alt text (e.g., "Fresh oyster mushrooms")
   - Click "Publish"

**Image Specifications:**
- **Format:** JPG, PNG, or WebP
- **Resolution:** Minimum 1200×1200px (square)
- **Aspect Ratio:** 1:1 preferred (square)
- **File Size:** < 2MB (optimized)
- **Quality:** High resolution, clear focus
- **Lighting:** Bright, natural light
- **Background:** Clean, neutral, or natural

**Checklist:**
- [ ] Fresh Oyster Mushrooms image
- [ ] Fresh Shiitake Mushrooms image
- [ ] Fresh Enoki Mushrooms image
- [ ] King Oyster Mushrooms image
- [ ] White Button Mushrooms image
- [ ] Portobello Mushrooms image
- [ ] Premium Dried Shiitake image
- [ ] Dried Wood Ear image
- [ ] Dried Porcini image
- [ ] Oyster Growing Kit image
- [ ] Shiitake Growing Kit image
- [ ] Lion's Mane Growing Kit image
- [ ] Pink Oyster Growing Kit image
- [ ] Gourmet Mix Variety Pack image
- [ ] Chef's Cooking Bundle image

**3.2 Category Images (3 images) - MEDIUM PRIORITY**

**Status:** 🟡 Pending after product images

**Process:**
1. Navigate to Categories in Studio
2. For each category:
   - Click category name
   - Upload banner/hero image
   - Publish

**Checklist:**
- [ ] Fresh Mushrooms category banner
- [ ] Dried Mushrooms category banner
- [ ] Growing Kits category banner

**3.3 Bundle Images (6 images) - LOW PRIORITY**

**Status:** 🟢 Optional, can use product composites

**Process:**
1. Navigate to Bundles in Studio
2. Upload lifestyle images showing bundle contents
3. Or use composite images of included products

**Checklist:**
- [ ] Mushroom Starter Kit lifestyle image
- [ ] Gourmet Chef Bundle lifestyle image
- [ ] Asian Cuisine Essentials lifestyle image
- [ ] Urban Farmer Bundle lifestyle image
- [ ] Family Meal Prep Pack lifestyle image
- [ ] Dried Mushroom Collection lifestyle image

**Result Goal:** All products display with images on frontend

---

### **PHASE 4: FRONTEND INTEGRATION** 🔜 **AFTER PHASE 3**

**Status:** 0% Complete  
**Duration:** 2 hours (configuration + testing)  
**Description:** Connect Next.js frontend to Sanity CMS

#### **What Needs to Be Done:**

**4.1 Sanity Client Setup (30 minutes)**

**Configuration Steps:**
1. Install Sanity client in Next.js project
2. Configure environment variables
3. Create API client wrapper
4. Set up TypeScript types from Sanity schema

**Files to Create/Update:**
- [ ] `src/lib/sanity-client.ts` - Sanity client configuration
- [ ] `src/lib/sanity-queries.ts` - GROQ queries
- [ ] `src/types/sanity.ts` - TypeScript types
- [ ] `.env.local` - Add Sanity project ID and dataset

**Environment Variables Needed:**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=2grm6gj7
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-19
```

**4.2 Product Listing Page (30 minutes)**

**Update `/shop` page:**
- [ ] Fetch products from Sanity (replace mock data)
- [ ] Display product cards with real images
- [ ] Implement category filtering
- [ ] Add sorting (price, name, popularity)
- [ ] Show promo badges from Sanity data
- [ ] Display stock status

**Key Functions:**
```typescript
// Fetch all products
const products = await client.fetch(
  `*[_type == "product" && isPublished == true] | order(name asc) {
    _id,
    name,
    slug,
    price,
    compareAtPrice,
    "image": productImage.asset->url,
    category->{name, slug},
    inStock,
    isBestseller,
    isNewArrival,
    promoPercentage
  }`
);
```

**4.3 Product Detail Page (30 minutes)**

**Update `/product/[slug]` page:**
- [ ] Fetch product by slug from Sanity
- [ ] Display full product details
- [ ] Show product variants with prices
- [ ] Display customer reviews
- [ ] Show related products
- [ ] Display bundle suggestions

**Key Data to Display:**
- Product name, description, price
- Product images (main + gallery)
- Nutritional information
- Storage & preparation tips
- Customer reviews with ratings
- Size/weight variants
- Related products section

**4.4 Reviews Display (30 minutes)**

**Integrate reviews on product pages:**
- [ ] Fetch reviews by product reference
- [ ] Display review cards with ratings
- [ ] Show verified purchase badges
- [ ] Display helpful vote counts
- [ ] Calculate average rating
- [ ] Show rating distribution graph

**Query Example:**
```typescript
const reviews = await client.fetch(
  `*[_type == "review" && product._ref == $productId] | order(reviewDate desc) {
    _id,
    reviewerName,
    rating,
    title,
    comment,
    isVerifiedPurchase,
    wasHelpful,
    reviewDate
  }`,
  { productId }
);
```

**Result Goal:** Frontend displays real CMS data instead of mock data

---

### **PHASE 5: SAME-DAY DELIVERY & LALAMOVE INTEGRATION** 🚚 **NEW FEATURE**

**Status:** 0% Complete  
**Duration:** 6 hours (backend + frontend)  
**Description:** Implement same-day delivery system with Lalamove API for fresh mushroom delivery

#### **🎯 Why Lalamove for Mushrooms?**

Fresh mushrooms are **highly perishable** - they need fast, reliable delivery:
- ⏱️ Same-day delivery preserves freshness
- 📦 On-demand driver availability
- 🗺️ Real-time tracking for customers
- 🚴 Fast motorcycle/car delivery options
- ❄️ Can specify "handle with care" for delicate items

---

#### **5.1 Lalamove API Setup** (1 hour) 🔧

**Step 1: Get Lalamove Credentials**

1. Sign up at https://www.lalamove.com/ph/business
2. Get API credentials from developer portal
3. Start with **Sandbox environment** for testing

**Step 2: Add Environment Variables**

Add to `.env.local`:
```env
# Lalamove API Configuration
LALAMOVE_API_KEY=your_api_key_here
LALAMOVE_API_SECRET=your_secret_here
LALAMOVE_ENVIRONMENT=sandbox  # or production
LALAMOVE_MARKET=PH  # Philippines
LALAMOVE_STORE_ADDRESS=Your mushroom farm/warehouse address
LALAMOVE_STORE_LAT=14.5995  # Your store latitude
LALAMOVE_STORE_LNG=120.9842  # Your store longitude
```

**Step 3: Install Lalamove SDK** (if available)

```cmd
npm install @lalamove/api-client
# OR use fetch API directly (recommended for flexibility)
```

**Step 4: Test API Connection**

Create `src/lib/lalamove-client.ts`:
```typescript
const LALAMOVE_BASE_URL = process.env.LALAMOVE_ENVIRONMENT === 'production'
  ? 'https://rest.lalamove.com'
  : 'https://sandbox-rest.lalamove.com';

export const lalamoveClient = {
  async getQuote(deliveryAddress: {lat: number, lng: number}) {
    const response = await fetch(`${LALAMOVE_BASE_URL}/v3/quotations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LALAMOVE_API_KEY}`,
        'Content-Type': 'application/json',
        'Market': 'PH'
      },
      body: JSON.stringify({
        serviceType: 'MOTORCYCLE', // or 'CAR' for larger orders
        stops: [
          {
            location: {
              lat: process.env.LALAMOVE_STORE_LAT,
              lng: process.env.LALAMOVE_STORE_LNG
            },
            address: process.env.LALAMOVE_STORE_ADDRESS
          },
          {
            location: deliveryAddress,
            address: 'Customer address'
          }
        ],
        scheduleAt: new Date().toISOString(), // Immediate delivery
        requiredSkills: ['PERISHABLE_FOOD'] // Optional
      })
    });
    
    return response.json(); // Returns { priceBreakdown, distance, duration }
  },
  
  async createOrder(orderDetails) {
    // Similar to getQuote, but creates actual delivery order
  },
  
  async trackOrder(orderId: string) {
    // Get real-time driver location and status
  }
};
```

---

#### **5.2 Delivery Zone Management** (1 hour) 🗺️

**Step 1: Create Delivery Zones CMS Schema**

Create `studio/src/schemaTypes/singletons/deliverySettings.ts`:
```typescript
export default {
  name: 'deliverySettings',
  title: 'Delivery Settings',
  type: 'document',
  __experimental_singleton: true,
  fields: [
    {
      name: 'sameDayDeliveryZones',
      title: 'Same-Day Delivery Zones (Lalamove)',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'zoneName',
            title: 'Zone Name',
            type: 'string',
            options: {
              list: [
                {title: 'Metro Manila (All)', value: 'metro-manila'},
                {title: 'Quezon City', value: 'quezon-city'},
                {title: 'Makati', value: 'makati'},
                {title: 'BGC Taguig', value: 'bgc'},
                {title: 'Mandaluyong', value: 'mandaluyong'},
                {title: 'Pasig', value: 'pasig'},
                {title: 'Manila City', value: 'manila'}
              ]
            }
          },
          {
            name: 'centerPoint',
            title: 'Zone Center Point',
            type: 'geopoint',
            description: 'Center coordinates for this delivery zone'
          },
          {
            name: 'radiusKm',
            title: 'Delivery Radius (km)',
            type: 'number',
            validation: Rule => Rule.min(1).max(50)
          },
          {
            name: 'cutoffTime',
            title: 'Order Cutoff Time (24h format)',
            type: 'string',
            description: 'Last order time for same-day delivery (e.g., "15:00")',
            placeholder: '15:00'
          },
          {
            name: 'minimumOrder',
            title: 'Minimum Order Amount (₱)',
            type: 'number',
            description: 'Minimum order value for same-day delivery'
          },
          {
            name: 'estimatedDeliveryTime',
            title: 'Estimated Delivery Time',
            type: 'string',
            options: {
              list: [
                {title: '1-2 hours', value: '1-2h'},
                {title: '2-4 hours', value: '2-4h'},
                {title: '4-6 hours', value: '4-6h'},
                {title: 'Same day', value: 'same-day'}
              ]
            }
          }
        ],
        preview: {
          select: {
            title: 'zoneName',
            subtitle: 'cutoffTime'
          }
        }
      }]
    },
    {
      name: 'standardDeliverySettings',
      title: 'Standard Delivery (Nationwide)',
      type: 'object',
      fields: [
        {name: 'enabled', type: 'boolean', title: 'Enable Standard Delivery'},
        {name: 'deliveryDays', type: 'string', title: 'Delivery Time (e.g., "3-5 business days")'},
        {name: 'shippingFee', type: 'number', title: 'Flat Shipping Fee (₱)'},
        {name: 'freeShippingMinimum', type: 'number', title: 'Free Shipping Above (₱)'}
      ]
    }
  ]
}
```

**Step 2: Add to Schema Index**

In `studio/src/schemaTypes/index.ts`:
```typescript
import deliverySettings from './singletons/deliverySettings'

export const schemaTypes = [
  // ... existing schemas
  deliverySettings
]
```

**Step 3: Configure Delivery Zones in Studio**

1. Restart Sanity Studio
2. Go to "Delivery Settings" (singleton)
3. Add zones:
   - **Metro Manila**: Radius 30km, Cutoff 3:00 PM, Min ₱500
   - **Quezon City**: Radius 15km, Cutoff 4:00 PM, Min ₱300
   - **Makati/BGC**: Radius 10km, Cutoff 5:00 PM, Min ₱400

---

#### **5.3 Checkout Integration** (2 hours) 🛒

**Step 1: Add Delivery Option Selection**

Update `src/app/(shop)/checkout/page.tsx`:

```typescript
'use client';
import { useState, useEffect } from 'react';
import { lalamoveClient } from '@/lib/lalamove-client';

export default function CheckoutPage() {
  const [deliveryOption, setDeliveryOption] = useState<'same-day' | 'standard'>('standard');
  const [sameDayAvailable, setSameDayAvailable] = useState(false);
  const [deliveryQuote, setDeliveryQuote] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Check if same-day delivery is available for address
  const checkSameDayAvailability = async (address: string) => {
    // Geocode address to lat/lng
    const coords = await geocodeAddress(address);
    
    // Check if within delivery zones (from Sanity)
    const zones = await getDeliveryZones();
    const inZone = zones.some(zone => 
      isWithinRadius(coords, zone.centerPoint, zone.radiusKm)
    );
    
    // Check cutoff time
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(15, 0); // 3:00 PM default
    const beforeCutoff = now < cutoff;
    
    setSameDayAvailable(inZone && beforeCutoff);
    
    // Get Lalamove quote if available
    if (inZone && beforeCutoff) {
      const quote = await lalamoveClient.getQuote(coords);
      setDeliveryQuote(quote);
    }
  };
  
  return (
    <div>
      {/* Delivery Address Input */}
      <input
        type="text"
        value={deliveryAddress}
        onChange={(e) => {
          setDeliveryAddress(e.target.value);
          checkSameDayAvailability(e.target.value);
        }}
        placeholder="Enter delivery address"
      />
      
      {/* Delivery Option Selection */}
      <div className="space-y-4">
        {/* Same-Day Option */}
        {sameDayAvailable && (
          <label className="border-2 border-green-500 rounded-lg p-4">
            <input
              type="radio"
              value="same-day"
              checked={deliveryOption === 'same-day'}
              onChange={(e) => setDeliveryOption('same-day')}
            />
            <div>
              <h3 className="font-bold text-green-700">
                🚚 Same-Day Delivery via Lalamove
              </h3>
              <p className="text-sm">
                Delivered today in 1-2 hours • Fresh mushrooms guaranteed
              </p>
              <p className="font-bold mt-2">
                ₱{deliveryQuote?.totalFee || 'Calculating...'}
              </p>
            </div>
          </label>
        )}
        
        {/* Standard Delivery Option */}
        <label className="border-2 rounded-lg p-4">
          <input
            type="radio"
            value="standard"
            checked={deliveryOption === 'standard'}
            onChange={(e) => setDeliveryOption('standard')}
          />
          <div>
            <h3 className="font-bold">📦 Standard Delivery</h3>
            <p className="text-sm">3-5 business days</p>
            <p className="font-bold mt-2">₱150</p>
          </div>
        </label>
      </div>
      
      {!sameDayAvailable && (
        <p className="text-yellow-700 mt-2">
          ⚠️ Same-day delivery not available for this address. Order before 3:00 PM for same-day within Metro Manila.
        </p>
      )}
    </div>
  );
}
```

**Step 2: Create Order with Lalamove**

When user places order with same-day delivery:

```typescript
const createOrderWithDelivery = async (orderData) => {
  // 1. Create order in your database
  const order = await createOrder(orderData);
  
  // 2. Create Lalamove delivery
  if (orderData.deliveryOption === 'same-day') {
    const lalamoveOrder = await lalamoveClient.createOrder({
      serviceType: 'MOTORCYCLE',
      stops: [
        {
          location: { 
            lat: parseFloat(process.env.LALAMOVE_STORE_LAT!),
            lng: parseFloat(process.env.LALAMOVE_STORE_LNG!)
          },
          address: process.env.LALAMOVE_STORE_ADDRESS!,
          contactName: 'MASH Warehouse',
          contactPhone: '+639171234567'
        },
        {
          location: orderData.deliveryCoords,
          address: orderData.deliveryAddress,
          contactName: orderData.customerName,
          contactPhone: orderData.customerPhone
        }
      ],
      deliveries: [{
        toStop: 1,
        remarks: `Order #${order.orderNumber} - PERISHABLE: Fresh mushrooms - Handle with care`,
        parcelCount: orderData.items.length
      }],
      isRecipientSMSEnabled: true,
      isPODEnabled: false
    });
    
    // 3. Save Lalamove order ID to your order
    await updateOrder(order.id, {
      lalamoveOrderId: lalamoveOrder.orderId,
      lalamoveTrackingUrl: lalamoveOrder.shareLink
    });
    
    // 4. Send tracking link to customer
    await sendOrderConfirmationEmail(order, lalamoveOrder.shareLink);
  }
  
  return order;
};
```

---

#### **5.4 Real-Time Tracking** (1 hour) 📍

**Step 1: Create Tracking Page**

Create `src/app/(shop)/track-order/[orderId]/page.tsx`:

```typescript
'use client';
import { useEffect, useState } from 'react';
import { lalamoveClient } from '@/lib/lalamove-client';

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  
  useEffect(() => {
    // Poll Lalamove API every 30 seconds for updates
    const interval = setInterval(async () => {
      const status = await lalamoveClient.trackOrder(params.orderId);
      setDeliveryStatus(status);
      setDriverLocation(status.driverLocation);
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [params.orderId]);
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Track Your Delivery</h1>
      
      {/* Order Status Timeline */}
      <div className="space-y-4 mb-8">
        <StatusStep 
          title="Order Confirmed" 
          completed={true} 
          time="10:30 AM"
        />
        <StatusStep 
          title="Driver Assigned" 
          completed={deliveryStatus?.status === 'ASSIGNING_DRIVER'}
          time={deliveryStatus?.driverAssignedAt}
        />
        <StatusStep 
          title="Picked Up" 
          completed={deliveryStatus?.status === 'PICKING_UP'}
          time={deliveryStatus?.pickedUpAt}
        />
        <StatusStep 
          title="On The Way" 
          completed={deliveryStatus?.status === 'ON_GOING'}
          current={true}
        />
        <StatusStep 
          title="Delivered" 
          completed={deliveryStatus?.status === 'COMPLETED'}
          time={deliveryStatus?.deliveredAt}
        />
      </div>
      
      {/* Driver Info */}
      {deliveryStatus?.driver && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-bold mb-2">Your Driver</h3>
          <p>{deliveryStatus.driver.name}</p>
          <p className="text-sm text-gray-600">
            {deliveryStatus.driver.vehicleType} • {deliveryStatus.driver.plateNumber}
          </p>
          <a href={`tel:${deliveryStatus.driver.phone}`} className="text-green-600">
            📞 Call Driver
          </a>
        </div>
      )}
      
      {/* Map (if using Mapbox/Google Maps) */}
      {driverLocation && (
        <div className="h-64 bg-gray-200 rounded-lg mb-4">
          {/* Embed map showing driver location */}
        </div>
      )}
      
      {/* Estimated Arrival */}
      <div className="text-center">
        <p className="text-sm text-gray-600">Estimated arrival</p>
        <p className="text-2xl font-bold text-green-600">
          {deliveryStatus?.estimatedArrival || '30 minutes'}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Webhook for Status Updates** (Optional but recommended)

Create `src/app/api/webhooks/lalamove/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Lalamove sends webhooks for status changes
  const { orderId, status, driverLocation, estimatedArrival } = body;
  
  // Update order in your database
  await updateOrderDeliveryStatus(orderId, {
    lalamoveStatus: status,
    driverLocation,
    estimatedArrival
  });
  
  // Send push notification to customer
  if (status === 'PICKING_UP') {
    await sendNotification(orderId, 'Your driver has picked up your order!');
  }
  
  if (status === 'COMPLETED') {
    await sendNotification(orderId, 'Your order has been delivered!');
  }
  
  return NextResponse.json({ success: true });
}
```

---

#### **5.5 Product Badge for Same-Day Delivery** (30 minutes) 🏷️

**Update Product Card Component**

`src/components/ProductCard.tsx`:

```typescript
export function ProductCard({ product }: { product: Product }) {
  const sameDayEligible = product.deliveryOptions?.sameDayDeliveryEligible;
  const isWithinCutoff = new Date().getHours() < 15; // Before 3 PM
  
  return (
    <div className="product-card">
      {/* Existing product card content */}
      
      {/* Same-Day Delivery Badge */}
      {sameDayEligible && isWithinCutoff && (
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
          🚚 Same-Day Delivery Available
        </div>
      )}
      
      {/* Freshness Badge */}
      {product.freshnessInfo?.shelfLife && (
        <div className="text-xs text-gray-600 mt-1">
          Fresh for {product.freshnessInfo.shelfLife} after delivery
        </div>
      )}
    </div>
  );
}
```

---

#### **5.6 Admin Dashboard Integration** (30 minutes) 📊

**Add Delivery Management to Seller Dashboard**

Create `src/app/(seller)/dashboard/deliveries/page.tsx`:

```typescript
export default function DeliveriesPage() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Fetch orders with same-day delivery
    const fetchOrders = async () => {
      const data = await fetch('/api/orders?deliveryType=same-day');
      setOrders(await data.json());
    };
    fetchOrders();
  }, []);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Same-Day Deliveries</h1>
      
      <table className="w-full">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Driver</th>
            <th>ETA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.orderNumber}</td>
              <td>{order.customerName}</td>
              <td>
                <StatusBadge status={order.lalamoveStatus} />
              </td>
              <td>{order.driverName || 'Assigning...'}</td>
              <td>{order.estimatedArrival}</td>
              <td>
                <a href={order.lalamoveTrackingUrl} target="_blank">
                  Track
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

#### **5.7 Checklist: Lalamove Integration** ✅

**Backend Setup:**
- [ ] Sign up for Lalamove business account
- [ ] Get API credentials (sandbox first)
- [ ] Add environment variables
- [ ] Create `lalamove-client.ts` helper
- [ ] Test API connection (getQuote)
- [ ] Create deliverySettings schema in Sanity
- [ ] Configure delivery zones in Studio

**Frontend Integration:**
- [ ] Add delivery option selection to checkout
- [ ] Implement address geocoding
- [ ] Check delivery zone availability
- [ ] Display Lalamove quote in real-time
- [ ] Show same-day delivery badges on products
- [ ] Create order tracking page
- [ ] Add driver info display
- [ ] Implement real-time status updates

**Order Management:**
- [ ] Create order with Lalamove when same-day selected
- [ ] Save Lalamove order ID to database
- [ ] Send tracking link to customer email
- [ ] Set up webhook endpoint for status updates
- [ ] Update order status from webhooks
- [ ] Send push notifications on status changes

**Admin Dashboard:**
- [ ] Add deliveries management page
- [ ] Show active same-day deliveries
- [ ] Display driver assignments
- [ ] Show real-time ETAs
- [ ] Enable manual driver contact

**Testing:**
- [ ] Test quote calculation
- [ ] Test order creation in sandbox
- [ ] Verify tracking links work
- [ ] Test webhook updates
- [ ] Check delivery zone logic
- [ ] Validate cutoff time enforcement
- [ ] Test with real addresses

**Production:**
- [ ] Switch to production API keys
- [ ] Update environment variables
- [ ] Enable webhooks in production
- [ ] Add monitoring/logging
- [ ] Set up error alerts

**Time Estimate:** 6 hours total
- 1 hour: API setup & testing
- 1 hour: Delivery zones configuration
- 2 hours: Checkout integration
- 1 hour: Tracking page
- 30 min: Product badges
- 30 min: Admin dashboard

**When Complete:**
- Update progress bar above (0% → 100%)
- Add completion date: `Completed: [DATE]`
- Move to Phase 6 (Testing & QA)

---

### **PHASE 6: ADVANCED FEATURES** 🔜 **AFTER PHASE 5**

**Status:** 0% Complete  
**Duration:** 4 hours (multiple features)  
**Description:** Implement additional e-commerce features

#### **Features to Build:**

**6.1 Suggested Products System (1 hour)** - ALREADY DONE IN PHASE 2.5!

Uses the `suggestedProducts` field added in Phase 2.5 schema enhancements.

**Frontend Display:**
```typescript
// On product detail page
const { data: product } = await client.fetch(`
  *[_type == "product" && slug.current == $slug][0] {
    ...,
    suggestedProducts[]->
  }
`, { slug });

<section className="mt-12">
  <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
  <div className="grid grid-cols-4 gap-4">
    {product.suggestedProducts.map(suggested => (
      <ProductCard key={suggested._id} product={suggested} />
    ))}
  </div>
</section>
```

**6.2 Bundle Recommendations (1 hour)**

Display bundles that include the current product:

```typescript
const bundlesWithProduct = await client.fetch(`
  *[_type == "productBundle" && references($productId)] {
    ...,
    products[]->,
    totalSavings
  }
`, { productId: product._id });
```

**6.3 Search & Filtering (1 hour)**

Use `productTags` and `searchKeywords` from Phase 2.5:

```typescript
*[_type == "product" && 
  (name match $query ||
   productTags[] match $query ||
   searchKeywords[] match $query ||
   category->name match $query)
] | order(_score desc)
```

**6.4 Inventory Management (1 hour)**

- Display stock levels (already in schema)
- Low stock warnings
- Out of stock badges
- Notify when available feature

**Result Goal:** Complete feature-rich e-commerce experience

---

### **PHASE 7: TESTING & QUALITY ASSURANCE** 🔜 **AFTER PHASE 6**

---

### **PHASE 6: TESTING & QUALITY ASSURANCE** 🔜 **AFTER PHASE 5**

**Status:** 0% Complete  
**Duration:** 3 hours (comprehensive testing)  
**Description:** Test all features thoroughly

#### **Testing Checklist:**

**6.1 Product Display Testing (30 minutes)**

- [ ] All 15 products display on /shop page
- [ ] Product images load correctly
- [ ] Prices display with proper formatting
- [ ] Promo percentages show correctly
- [ ] Category filtering works
- [ ] Sorting options work
- [ ] Product cards clickable
- [ ] Bestseller badges display
- [ ] New arrival badges display
- [ ] Stock status accurate

**6.2 Product Detail Testing (30 minutes)**

- [ ] Product detail pages load for all products
- [ ] All product information displays
- [ ] Images zoom/gallery works
- [ ] Variant selection works
- [ ] Price updates when variant selected
- [ ] Add to cart functional
- [ ] Reviews section displays
- [ ] Related products show
- [ ] Bundle suggestions appear

**6.3 Reviews System Testing (30 minutes)**

- [ ] Reviews display on product pages
- [ ] Star ratings accurate
- [ ] Average rating calculates correctly
- [ ] Review count correct
- [ ] Verified badges show
- [ ] Review dates format correctly
- [ ] Helpful votes display
- [ ] Reviews sorted by date

**6.4 Bundles Testing (30 minutes)**

- [ ] Bundle pages load
- [ ] Bundle contents list correctly
- [ ] Savings calculation accurate
- [ ] Bundle prices correct
- [ ] Individual product links work
- [ ] Add bundle to cart works
- [ ] Bundle images display

**6.5 Category Testing (30 minutes)**

- [ ] Category pages load
- [ ] Products filter by category
- [ ] Category descriptions display
- [ ] Category images show
- [ ] Product count accurate
- [ ] Breadcrumbs work

**6.6 Search & Filter Testing (30 minutes)**

- [ ] Search returns relevant results
- [ ] Category filters work
- [ ] Price filters work
- [ ] Sort options work
- [ ] Multiple filters combine correctly
- [ ] Clear filters button works

**6.7 Mobile Responsiveness (30 minutes)**

- [ ] All pages mobile-friendly
- [ ] Images responsive
- [ ] Navigation mobile-optimized
- [ ] Product cards stack correctly
- [ ] Filter UI works on mobile
- [ ] Touch interactions smooth

**Result Goal:** Bug-free, polished user experience

---

### **PHASE 7: PRODUCTION DEPLOYMENT** 🔜 **AFTER PHASE 6**

**Status:** 0% Complete  
**Duration:** 2 hours (deployment + monitoring)  
**Description:** Deploy to production environment

#### **Deployment Steps:**

**7.1 Pre-Deployment Checklist (30 minutes)**

- [ ] All tests passing
- [ ] No console errors
- [ ] Images optimized
- [ ] SEO metadata complete
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Analytics integrated

**7.2 Sanity Studio Deployment (15 minutes)**

**Deploy Studio:**
```cmd
cd studio
npm run build
npm run deploy
```

- [ ] Studio deploys successfully
- [ ] Production URL accessible
- [ ] Authentication works
- [ ] All schemas visible
- [ ] Data intact

**7.3 Next.js Deployment (30 minutes)**

**Deploy to Vercel:**
1. Connect GitHub repository
2. Configure environment variables
3. Set build settings
4. Deploy

- [ ] Frontend deploys successfully
- [ ] All pages load
- [ ] Images serve from Sanity CDN
- [ ] API calls work
- [ ] No build errors

**7.4 Post-Deployment Testing (30 minutes)**

- [ ] Test all critical user flows
- [ ] Verify product pages load
- [ ] Check images display
- [ ] Test add to cart
- [ ] Verify checkout flow
- [ ] Test on multiple devices
- [ ] Check page load speeds
- [ ] Monitor error logs

**7.5 Monitoring Setup (15 minutes)**

- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Create performance dashboards
- [ ] Set alert thresholds

**Result Goal:** Live production e-commerce site

---

## 📈 **DATA IMPORT SUMMARY**

### **What Was Successfully Imported:**

| Item Type | Count | Status | Import Method |
|-----------|-------|--------|---------------|
| **Categories** | 3 | ✅ Complete | Automated script |
| **Products** | 15 | ✅ Complete | Automated script |
| **Variants** | 15 | ✅ Complete | Automated script |
| **Bundles** | 6 | ✅ Complete | Automated script |
| **Reviews** | 45 | ✅ Complete | Automated script |
| **TOTAL** | **84** | **✅ 100%** | **45 seconds** |

### **Import Script Results:**

```bash
🚀 MASH CMS Complete Data Import Script
================================================

✅ Categories: 3/3 (100%)
✅ Products: 15/15 (100%)
✅ Variants: 15/15 (100%)
✅ Bundles: 6/6 (100%)
✅ Reviews: 45/45 (100%)

✅ TOTAL: 84/84 (100%)
✅ Errors encountered: 0

Duration: 45 seconds
Success Rate: 100%
```

---

## 🎯 **NEXT ACTIONS - PRIORITY ORDER**

### **🔴 HIGH PRIORITY (Do Today - 30 minutes):**

1. **Add Product Images** (Phase 3.1)
   - Open Sanity Studio
   - Upload images for 15 products
   - Publish each product after image upload
   - **Time:** 30 minutes
   - **Difficulty:** Easy

### **🟡 MEDIUM PRIORITY (Do This Week - 2 hours):**

2. **Connect Frontend to CMS** (Phase 4)
   - Configure Sanity client in Next.js
   - Update /shop page with real data
   - Update product detail pages
   - Display reviews
   - **Time:** 2 hours
   - **Difficulty:** Medium

### **🟢 LOW PRIORITY (Do Next Week - 4 hours):**

3. **Add Advanced Features** (Phase 5)
   - Implement related products
   - Add bundle recommendations
   - Create search & filtering
   - Set up inventory management
   - **Time:** 4 hours
   - **Difficulty:** Medium-Hard

### **🔵 FUTURE (Do Before Launch - 5 hours):**

4. **Complete Testing & Deploy** (Phase 6-7)
   - Comprehensive QA testing
   - Deploy Sanity Studio
   - Deploy Next.js frontend
   - Set up monitoring
   - **Time:** 5 hours
   - **Difficulty:** Medium

---

## 🗂️ **FILE STRUCTURE & RESOURCES**

### **Sample Data Files:**

```
studio/sample-data/
├── complete-products.json      # 15 products (imported ✅)
├── product-variants.json       # 15 variants (imported ✅)
├── product-bundles.json        # 6 bundles (imported ✅)
├── complete-reviews.json       # 45 reviews (imported ✅)
└── README.md                   # Data documentation
```

### **Import Scripts:**

```
studio/scripts/
├── import-complete-data.js     # Main import script (used ✅)
├── import-sample-data.js       # Simple import (legacy)
├── README-COMPLETE.md          # Complete script guide
└── README.md                   # Quick script reference
```

### **Documentation:**

```
.github/
├── MASTER_IMPLEMENTATION_PLAN.md      # THIS FILE (master plan)
├── CMS_COMPLETE_GUIDE.md              # Detailed implementation
├── CMS_SUCCESS_SUMMARY.md             # Quick success reference
├── IMMEDIATE_ACTION_PLAN.md           # Quick start guide
└── QUICK_REFERENCE_CMS.md             # Command reference
```

---

## 🛒 **COMPLETE E-COMMERCE FLOW (Customer Journey)**

This section maps out the entire customer experience from landing on the site to receiving their fresh mushrooms. Use this to ensure all features are connected properly.

---

### **🎬 Customer Journey: From Browse to Delivery**

#### **Step 1: Product Discovery** (Phase 3-4)

**Customer arrives at website:**
1. Views homepage with featured products
2. Browses categories (Fresh, Dried, Growing Kits)
3. Sees "Same-Day Delivery Available" badges on fresh mushrooms
4. Notices promotions (22% off Oyster Mushrooms)

**What you need to build:**
- [x] Product catalog in Sanity (Done - Phase 2)
- [ ] Homepage featured products section
- [ ] Category filtering on shop page
- [ ] Product grid with images (Phase 3)
- [ ] Same-day delivery badges (Phase 5)
- [ ] Promotion tags display

**Customer action:** Clicks "Fresh Oyster Mushrooms"

---

#### **Step 2: Product Details** (Phase 4)

**Customer views product page:**
1. Sees high-quality product image (1200x1200px)
2. Reads description, nutritional info
3. Views **freshness info**: "Harvested within 24 hours • Fresh for 3-5 days"
4. Checks **preparation tips**: "Beginner-friendly • 10-15 min cooking time"
5. Sees **4.9-star rating** from 8 reviews
6. Scrolls to **"You May Also Like"** section (suggested products)
7. Notices **"Frequently Bought Together"** with Shiitake mushrooms

**What you need to build:**
- [ ] Product detail page with all fields
- [ ] Freshness info display (from Phase 2.5 schema)
- [ ] Preparation difficulty badge
- [ ] Review stars and count
- [ ] Suggested products carousel (Phase 2.5)
- [ ] Complementary products section
- [ ] Add to cart button

**Customer action:** Adds 1kg to cart (₱350 - on promotion from ₱450)

---

#### **Step 3: Continue Shopping** (Phase 4-6)

**Customer explores more:**
1. Clicks suggested product "Fresh Shiitake Mushrooms"
2. Adds to cart
3. Sees **bundle offer**: "Buy both in Gourmet Combo Bundle - Save 15%!"
4. Views bundle details (includes both mushrooms + recipe card)
5. Decides to get bundle instead
6. Removes individual items, adds bundle

**What you need to build:**
- [ ] Shopping cart functionality
- [ ] Bundle detail pages
- [ ] Bundle savings calculator
- [ ] "Available in Bundle" suggestions on product pages
- [ ] Cart update/remove functionality
- [ ] Bundle vs individual price comparison

**Cart contents:**
- Gourmet Combo Bundle (Oyster + Shiitake) - ₱680 (was ₱800 - saved ₱120)

---

#### **Step 4: Checkout - Address Input** (Phase 5)

**Customer proceeds to checkout:**
1. Enters delivery address: "123 Quezon Avenue, Quezon City"
2. System **geocodes address** to coordinates
3. System checks **delivery zones** from Sanity
4. Address is within **Metro Manila zone** (radius 30km)
5. Current time: 2:30 PM (before 3:00 PM cutoff)
6. System calls **Lalamove API** for quote

**What you need to build:**
- [ ] Checkout address form
- [ ] Address geocoding integration (Google Maps API or similar)
- [ ] Delivery zone checker (compare distance to zones in Sanity)
- [ ] Cutoff time validation (3:00 PM for same-day)
- [ ] Lalamove quote API call
- [ ] Loading state while fetching quote

**Result:** Same-day delivery available!

---

#### **Step 5: Delivery Option Selection** (Phase 5)

**Customer sees delivery options:**

**Option 1: 🚚 Same-Day Delivery via Lalamove** ⭐ RECOMMENDED
- Delivered today in **1-2 hours**
- Fresh mushrooms guaranteed
- Real-time tracking
- **Cost:** ₱120 (calculated by Lalamove based on distance)
- **Note:** "Perishable items - refrigerated handling"

**Option 2: 📦 Standard Delivery**
- 3-5 business days
- Nationwide coverage
- **Cost:** ₱150
- **Note:** "Not recommended for fresh mushrooms"

**What you need to build:**
- [ ] Delivery option radio buttons
- [ ] Same-day delivery card with Lalamove branding
- [ ] Delivery cost display (from API quote)
- [ ] Estimated time display
- [ ] Warning for non-perishable items with standard delivery
- [ ] Delivery option selection state

**Customer action:** Selects Same-Day Delivery (₱120)

---

#### **Step 6: Payment** (Phase 4)

**Customer completes payment:**
1. Views order summary:
   - Gourmet Bundle: ₱680
   - Delivery (Same-Day): ₱120
   - **Total:** ₱800
2. Enters payment details (card, GCash, etc.)
3. Clicks "Place Order"

**What you need to build:**
- [ ] Order summary component
- [ ] Payment method selection
- [ ] Payment gateway integration (PayMongo, Xendit, etc.)
- [ ] Order creation endpoint
- [ ] Loading state during payment

**Result:** Payment successful!

---

#### **Step 7: Order Creation & Lalamove Booking** (Phase 5 - Backend)

**System processes order:**
1. Creates order in database (order #MASH-2025-001)
2. Deducts inventory (Oyster: -1kg, Shiitake: -500g)
3. Calls **Lalamove Create Order API**:
   ```javascript
   {
     serviceType: 'MOTORCYCLE',
     stops: [
       {from: 'MASH Warehouse', coordinates: {...}},
       {to: 'Customer Address', coordinates: {...}}
     ],
     deliveries: [{
       remarks: 'Order #MASH-2025-001 - PERISHABLE: Fresh mushrooms - Handle with care'
     }]
   }
   ```
4. Lalamove returns:
   - Order ID: `LA-2025-ABC123`
   - Tracking URL: `https://lalamove.com/track/LA-2025-ABC123`
   - Estimated pickup: 3:00 PM
   - Estimated delivery: 4:30 PM
5. Saves Lalamove order ID to database
6. Sends confirmation email to customer with tracking link

**What you need to build:**
- [ ] Order creation backend endpoint
- [ ] Inventory deduction logic
- [ ] Lalamove order creation function
- [ ] Order-Lalamove ID linking in database
- [ ] Email template with tracking link
- [ ] Order confirmation email sender

**Result:** Order created, driver being assigned!

---

#### **Step 8: Real-Time Tracking** (Phase 5)

**Customer tracks order:**
1. Receives email: "Your order is confirmed! Track here: [link]"
2. Clicks tracking link → Opens `/track-order/MASH-2025-001`
3. Sees order status timeline:
   - ✅ **Order Confirmed** (2:35 PM)
   - ✅ **Driver Assigned** (2:45 PM) - John, Motorcycle ABC-1234
   - ✅ **Picked Up** (3:10 PM)
   - 🚚 **On The Way** (ETA: 4:30 PM) ← Current status
   - ⏳ **Delivered** (pending)
4. Views map with driver's real-time location
5. Can call driver if needed

**What you need to build:**
- [ ] Order tracking page (`/track-order/[orderId]`)
- [ ] Status timeline component
- [ ] Lalamove tracking API integration
- [ ] Real-time updates (polling every 30 seconds or webhooks)
- [ ] Driver info display (name, vehicle, phone)
- [ ] Map integration (Mapbox, Google Maps)
- [ ] Call driver button

**Customer experience:** "Wow, I can see exactly where my mushrooms are!"

---

#### **Step 9: Delivery Updates** (Phase 5 - Webhooks)

**System receives Lalamove webhooks:**

**3:10 PM - Picked Up:**
- Webhook: `{ status: 'PICKED_UP', orderId: 'LA-2025-ABC123' }`
- System updates database
- Sends SMS: "Your mushrooms are on the way! ETA: 4:30 PM"

**4:25 PM - Delivered:**
- Webhook: `{ status: 'COMPLETED', deliveredAt: '2025-11-20T16:25:00Z' }`
- System updates order status to "Delivered"
- Sends email: "Your order has been delivered! Enjoy your fresh mushrooms! Leave a review here: [link]"

**What you need to build:**
- [ ] Webhook endpoint (`/api/webhooks/lalamove`)
- [ ] Webhook signature verification (security)
- [ ] Order status update logic
- [ ] SMS notification sender (Twilio, Semaphore)
- [ ] Delivery confirmation email template
- [ ] Review request email with link

**Result:** Customer has fresh mushrooms in hand within 2 hours!

---

#### **Step 10: Post-Purchase** (Phase 6)

**Customer enjoys mushrooms:**
1. Cooks Oyster mushrooms for dinner (uses preparation tips from site)
2. Week later: Opens review request email
3. Leaves 5-star review: "Super fresh! Delivered in perfect condition"
4. Browses site again
5. Sees "Based on your purchase" section showing:
   - Growing Kits (since they bought fresh mushrooms)
   - Recipe bundles
   - Dried mushrooms for storage

**What you need to build:**
- [ ] Review submission form
- [ ] Review moderation (admin dashboard)
- [ ] Review display on product pages
- [ ] Purchase history page
- [ ] Personalized recommendations based on order history
- [ ] Email marketing integration (abandoned cart, new products)

---

### **📊 Complete Feature Checklist for E-Commerce Flow**

#### **Phase 3: Product Display (Images)**
- [ ] Upload 15 product images
- [ ] Upload 3 category images
- [ ] Upload 6 bundle images
- [ ] Test image optimization
- [ ] Verify images display correctly

#### **Phase 4: Frontend Integration**
- [ ] Connect Sanity client to Next.js
- [ ] Build product listing page with filters
- [ ] Build product detail page with all fields
- [ ] Display reviews and ratings
- [ ] Build shopping cart
- [ ] Build checkout flow
- [ ] Integrate payment gateway

#### **Phase 5: Lalamove Delivery**
- [ ] Set up Lalamove API credentials
- [ ] Create delivery zone checker
- [ ] Build delivery option selector
- [ ] Integrate quote API
- [ ] Implement order creation with Lalamove
- [ ] Build tracking page
- [ ] Set up webhook endpoint
- [ ] Configure notifications (email + SMS)

#### **Phase 6: Advanced Features**
- [ ] Suggested products display
- [ ] Complementary products section
- [ ] Bundle recommendations
- [ ] Search and filtering
- [ ] Inventory management
- [ ] Review submission
- [ ] Personalized recommendations

#### **Phase 7: Testing**
- [ ] Test complete checkout flow
- [ ] Test same-day delivery option
- [ ] Test standard delivery option
- [ ] Test order tracking
- [ ] Test webhooks (sandbox)
- [ ] Test on mobile devices
- [ ] Test payment integration

#### **Phase 8: Production**
- [ ] Deploy Sanity Studio
- [ ] Deploy Next.js frontend
- [ ] Switch to production Lalamove API
- [ ] Set up monitoring
- [ ] Enable error tracking
- [ ] Launch!

---

### **🎯 Key Success Metrics**

Track these metrics to measure e-commerce success:

**Conversion Metrics:**
- [ ] Product page views → Add to cart rate (target: 15%+)
- [ ] Add to cart → Checkout initiated (target: 50%+)
- [ ] Checkout → Order completed (target: 70%+)
- [ ] Overall conversion rate (target: 5%+)

**Delivery Metrics:**
- [ ] Same-day delivery selection rate (target: 40%+ for fresh mushrooms)
- [ ] Average delivery time (target: < 2 hours)
- [ ] On-time delivery rate (target: 95%+)
- [ ] Customer satisfaction with delivery (target: 4.5+ stars)

**Product Metrics:**
- [ ] Products with images (target: 100%)
- [ ] Products with reviews (target: 80%+)
- [ ] Average rating (target: 4.5+ stars)
- [ ] Stock-out rate (target: < 5%)

**Engagement Metrics:**
- [ ] Suggested products click rate (target: 20%+)
- [ ] Bundle conversion rate (target: 15%+)
- [ ] Repeat purchase rate (target: 30%+ within 3 months)

---

### **🚀 Launch Readiness Checklist**

Before going live, ensure:

**Products:**
- [ ] All products have images
- [ ] All products have descriptions
- [ ] Prices are correct
- [ ] Inventory levels accurate
- [ ] Freshness info complete
- [ ] Delivery zones configured

**Checkout:**
- [ ] Payment gateway works (test transactions)
- [ ] Order emails send correctly
- [ ] Order confirmation page displays
- [ ] Receipt generation works

**Delivery:**
- [ ] Lalamove production API keys set
- [ ] Delivery zones accurate
- [ ] Cutoff times configured
- [ ] Webhooks tested
- [ ] Tracking page works
- [ ] SMS notifications enabled

**Legal:**
- [ ] Terms & Conditions page
- [ ] Privacy Policy page
- [ ] Refund/Return policy
- [ ] Contact information accurate

**Performance:**
- [ ] Site loads in < 3 seconds
- [ ] Images optimized
- [ ] Mobile responsive
- [ ] SEO meta tags set
- [ ] Analytics tracking enabled

---

## 📝 **SESSION LOGS**

### **November 21, 2025 - 8:00 AM: Phase 2.5 COMPLETE! ✅ Moving to Phase 3**

**Phase:** 2.5 CMS Enhancements  
**Progress:** 100% COMPLETE ✅  
**Duration:** User filled all data successfully  

**✅ Completed:**
- [x] All 15 products have new enhanced fields populated
- [x] Product tags added for smart search
- [x] Freshness info filled for all fresh mushrooms
- [x] Preparation tips and difficulty levels set
- [x] Delivery options configured (same-day zones)
- [x] Delivery weights and dimensions added
- [x] Search keywords populated
- [x] Nutritional highlights selected
- [x] Complementary products linked successfully

**⚠️ Minor Issues (Fixed with Guide):**
- Suggested Products field appears empty until you click and search for products
- Related Bundles field needs manual product selection (working as designed)
- These are reference fields - you add products by clicking "+ Add Item" and searching

**🎉 Achievements:**
- Products now have complete mushroom-specific data
- Same-day delivery fully configured
- Smart recommendations ready
- Enhanced search with tags and keywords
- Preparation guidance for customers
- Freshness tracking for quality assurance

**📸 Next Phase:** Phase 3 - Image Management (30 minutes)
- Upload 15 product images
- Add category images
- Add bundle images
- Test image display

**Status:** Schema and data both complete! Ready for images! 🚀

---

### **November 21, 2025 - 8:00 AM: Phase 2.5 COMPLETE + Reference Fields Guide! ✅**

**Phase:** 2.5 CMS Enhancements  
**Progress:** 100% COMPLETE ✅ (with minor fix needed)  
**Duration:** User successfully populated all data  

**✅ Major Achievement:**
- All 15 products have complete enhanced data
- Freshness tracking configured
- Delivery options set for Lalamove
- Search tags and keywords added
- Nutritional highlights selected

**⚠️ Minor Issue Found & Fixed:**
- **Issue:** "Suggested Products" and "Related Bundles" showing "No items"
- **Cause:** Reference fields need manual selection (not auto-filled)
- **Solution:** Created PHASE_2.5_REFERENCE_FIELDS_FIX.md guide (opened in Notepad)
- **Fix Time:** 30-45 minutes to add references to all products

**📋 Quick Fix Steps:**
1. Open product in Sanity Studio
2. Scroll to "Suggested Products" field
3. Click "+ Add Item" button
4. Search and select 3-5 products
5. Repeat for "Related Bundles" (select 1-2 bundles)
6. Click "Publish"
7. Do this for all 15 products

**🎯 Current Status:**
- Schema: ✅ 100% Complete
- Data Fields: ✅ 100% Complete
- Product References: ⏳ Needs manual linking (30-45 min)

**Next:** Complete reference linking, then Phase 3 (Images)

---

### **November 20, 2025 - 7:30 PM: Phase 2.5 Started - Product Schema Enhanced! ⚡**

**Phase:** 2.5 CMS Enhancements  
**Progress:** 50% (Schema updated, data population pending)  
**Duration:** 15 minutes  

**✅ Completed:**
- [x] Added `suggestedProducts` field (array of product references, max 8)
- [x] Added `productTags` field (smart search tags, max 10)
- [x] Added `complementaryProducts` field (frequently bought together, max 4)
- [x] Added `freshnessInfo` object (harvest window, shelf life, storage, quality indicators)
- [x] Added `preparationInfo` object (difficulty level, cooking time, tips, recipes)
- [x] Added `deliveryOptions` object (same-day eligibility, zones, perishable flag, notes)
- [x] Added `deliveryWeight` object (package weight, dimensions for Lalamove pricing)
- [x] Added `searchKeywords` array (SEO enhancement)
- [x] Added `nutritionalHighlights` array (10 health benefit options)
- [x] Updated `product.ts` schema file (9 new major fields added)
- [x] Schema compiles successfully

**📦 What's New in Products:**
- Total fields: ~35 → ~44 (9 new fields)
- Smart recommendations ready (suggested + complementary)
- Mushroom-specific freshness tracking
- Same-day delivery configuration per product
- Enhanced search with tags + keywords
- Preparation guidance for customers
- Nutritional highlights for health-conscious buyers

**⏳ Next Steps:**
1. Restart Sanity Studio to see new fields
2. Populate new fields for all 15 products (1 hour)
3. Test new fields in Studio UI
4. Verify references work correctly

**Blockers:** None - schema compiles successfully!  
**Next Session:** Populate new fields for products, then add images

---

### **November 20, 2025 - 7:00 PM: Master Plan Enhanced with New Features**

**What Changed:**
- ✅ Added "How to Use This Living Document" section (instructions for updating progress)
- ✅ Created Phase 2.5: CMS Enhancements (new schema fields)
- ✅ Updated Phase 5: Lalamove Same-Day Delivery Integration (complete implementation guide)
- ✅ Renamed Phase 6: Advanced Features (moved suggested products to Phase 2.5)
- ✅ Added "Complete E-Commerce Flow" section (customer journey from browse to delivery)
- ✅ Enhanced progress tracking with living document instructions
- ✅ Added comprehensive checklists for all new features

**New Schema Fields Added to Product:**
1. `suggestedProducts` - AI-powered product recommendations
2. `productTags` - Smart search and filtering
3. `complementaryProducts` - Frequently bought together
4. `freshnessInfo` - Harvest window, shelf life, storage tips
5. `preparationInfo` - Difficulty level, cooking time, recipe ideas
6. `deliveryOptions` - Same-day eligibility, delivery zones, perishable flag
7. `deliveryWeight` - Package weight and dimensions for Lalamove
8. `searchKeywords` - Enhanced SEO
9. `nutritionalHighlights` - Product benefits

**Lalamove Integration Plan:**
- API setup guide (sandbox + production)
- Delivery zone management in Sanity
- Checkout integration (quote API)
- Real-time tracking page
- Webhook setup for status updates
- Driver info display
- SMS notifications

**Time Investment:**
- Phase 2.5 (CMS Enhancements): 3 hours
- Phase 5 (Lalamove Integration): 6 hours
- Total new work: ~9 hours

**Next Action:** 
1. Update product schema with new fields (30 minutes)
2. Populate new fields for all 15 products (1 hour)
3. Or continue with Phase 3: Add product images (30 minutes)

**Status:** Master plan is now a complete living document with all phases detailed!

---

### **November 20, 2025 - 6:00 PM: Complete Data Import**

**Script:** `import-complete-data.js`  
**Results:**
- ✅ Categories: 3/3 (100%)
- ✅ Products: 15/15 (100%)
- ✅ Variants: 15/15 (100%)
- ✅ Bundles: 6/6 (100%)
- ✅ Reviews: 45/45 (100%)
- ✅ **TOTAL: 84/84 items (100% success)**
- ✅ **Errors: 0**
- ⏱️ **Duration: 45 seconds**

**Completed:** Phase 2 - Data Population (100%)

---

## ✅ **PHASE COMPLETION CRITERIA**

### **Phase 1: CMS Structure** ✅
- [x] All schemas defined
- [x] Studio configured
- [x] Types exported
- [x] Validations set
- **Status:** COMPLETE

### **Phase 2: Data Population** ✅
- [x] Categories imported (3)
- [x] Products imported (15)
- [x] Variants imported (15)
- [x] Bundles imported (6)
- [x] Reviews imported (45)
- **Status:** COMPLETE

### **Phase 3: Image Management** ⏳
- [ ] Product images added (0/15)
- [ ] Category images added (0/3)
- [ ] Bundle images added (0/6)
- **Status:** IN PROGRESS (0%)

### **Phase 4: Frontend Integration** 🔜
- [ ] Sanity client configured
- [ ] Product listing connected
- [ ] Product details connected
- [ ] Reviews displaying
- **Status:** PENDING

### **Phase 5: Advanced Features** 🔜
- [ ] Related products
- [ ] Bundle recommendations
- [ ] Search & filtering
- [ ] Inventory management
- **Status:** PENDING

### **Phase 6: Testing & QA** 🔜
- [ ] Product display tested
- [ ] Reviews tested
- [ ] Bundles tested
- [ ] Mobile tested
- **Status:** PENDING

### **Phase 7: Production Deploy** 🔜
- [ ] Studio deployed
- [ ] Frontend deployed
- [ ] Monitoring set up
- [ ] Performance verified
- **Status:** PENDING

---

## 🎓 **LEARNING RESOURCES**

### **Documentation:**
- Sanity CMS Docs: https://www.sanity.io/docs
- Next.js Docs: https://nextjs.org/docs
- GROQ Query Language: https://www.sanity.io/docs/groq

### **Studio Access:**
- Local: http://localhost:3333
- Production: https://mash-ecommerce.sanity.studio
- Dashboard: https://sanity.io/manage (project: 2grm6gj7)

### **Frontend URLs:**
- Local: http://localhost:3000
- Shop Page: http://localhost:3000/shop
- Product Example: http://localhost:3000/product/[slug]

---

## 🎉 **CELEBRATION MILESTONES**

### **Completed Milestones:**
- ✅ **Milestone 1:** CMS Schema Complete (13 documents, 4 singletons)
- ✅ **Milestone 2:** 84 Items Imported (100% success, 0 errors)
- ✅ **Milestone 3:** Zero Manual Data Entry (6 hours saved)

### **Upcoming Milestones:**
- ⏳ **Milestone 4:** All Products Have Images (15 images)
- 🔜 **Milestone 5:** Frontend Connected to CMS (real data)
- 🔜 **Milestone 6:** Advanced Features Live (search, related products)
- 🔜 **Milestone 7:** Production Launch (live e-commerce site)

---

## 📞 **SUPPORT & HELP**

### **Quick Commands:**

**Start Sanity Studio:**
```cmd
cd studio
npm run dev
```

**Start Next.js Frontend:**
```cmd
npm run dev
```

**Re-run Import Script:**
```cmd
cd studio
node scripts/import-complete-data.js
```

### **Common Issues:**

**Q: Products not showing in Studio?**
- Refresh browser (Ctrl+R)
- Check console for errors
- Verify import script completed

**Q: Images not uploading?**
- Check file size (< 2MB)
- Use JPG/PNG/WebP format
- Verify internet connection

**Q: Frontend not showing data?**
- Complete Phase 4 first (Sanity client setup)
- Check environment variables
- Verify API endpoint

---

**Last Updated:** November 20, 2025 - 6:30 PM  
**Document Version:** 1.0  
**Update Frequency:** After each phase completion  
**Maintained By:** Kenneth (MASH Developer)

---

🚀 **YOUR NEXT STEP:** Open Sanity Studio and add 15 product images! (30 minutes)
