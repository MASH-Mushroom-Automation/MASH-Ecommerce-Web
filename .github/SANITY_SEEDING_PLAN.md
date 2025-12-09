# Sanity CMS Data Seeding Plan

**Last Updated:** December 6, 2025  
**Project:** PP_Namias (gerattrr)  
**Studio URL:** https://ppnamias.sanity.studio  
**Status:** ✅ **SEEDING COMPLETE**

---

## 🎉 FINAL SEEDING RESULTS

| Data Type | Count | Status |
|-----------|-------|--------|
| **Products** | 17 | ✅ Complete |
| **Categories** | 6 | ✅ Complete |
| **Variants** | 15 | ✅ Complete |
| **Bundles** | 7 | ✅ Complete |
| **Reviews** | 39 | ✅ Complete |
| **Growers** | 4 | ✅ Complete |
| **Stores** | 4 | ✅ Complete |
| **FAQs** | 19 (5 categories) | ✅ Complete |
| **Testimonials** | 6 | ✅ Complete |
| **Banners** | 6 | ✅ Complete |
| **Team Members** | 7 | ✅ Complete |
| **Features** | 2 sections | ✅ Complete |
| **Navigation** | 5 menus | ✅ Complete |
| **Hero Carousel** | 4 slides | ✅ Complete |
| **Featured Products** | 8 products | ✅ Complete |
| **Site Settings** | 1 | ✅ Complete |
| **About Page** | 1 | ✅ Complete |

### Relationships Linked
- ✅ Products → Suggested (17/17)
- ✅ Products → Complementary (17/17)
- ✅ Products → Tags (17/17)
- ✅ Products → Variants (5/17 have variants)
- ✅ Stores → Growers (4/4)
- ✅ Growers → Products (3/4)

### Manual Tasks Remaining
1. 📸 Upload product images (17 products)
2. 📸 Upload grower profile images (4 growers)
3. 📸 Upload team member photos (8 members)
4. 📸 Upload hero carousel images (4 slides)
5. 📸 Upload banner images (6 banners)

---

## 📋 Overview

This document outlines the plan to seed the Sanity CMS with initial data. After running the seeders, you will manually upload images through Sanity Studio.

### Data Flow
```
1. Run Seeder Scripts → Creates documents in Sanity
2. Verify Data in Studio → Check documents are created
3. Upload Images Manually → Add product/category images in Studio
4. Link Relationships → Connect related products, growers, stores
5. Test Frontend → Verify data displays correctly
```

---

## 🎯 Seeding Order (IMPORTANT!)

Scripts must be run in this order due to dependencies:

| Order | Script | Creates | Dependencies |
|-------|--------|---------|--------------|
| 1 | `import-categories.js` | 3 Categories | None |
| 2 | `import-products.js` | 15 Products | Categories |
| 3 | `import-variants.js` | 15 Variants | Products |
| 4 | `import-bundles.js` | 6 Bundles | Products |
| 5 | `import-reviews.js` | 45 Reviews | Products |
| 6 | `link-relationships.js` | Product Links | Products, Bundles |
| 7 | `migrate-growers-to-sanity.js` | 6 Growers | None |
| 8 | `migrate-stores-to-sanity.js` | 3 Stores | None |
| 9 | `link-growers-stores.js` | Grower-Store Links | Growers, Stores |
| 10 | `migrate-faq-to-sanity.js` | FAQ Content | None |
| 11 | `migrate-features-to-sanity.js` | Feature Sections | None |
| 12 | `migrate-site-settings-to-sanity.js` | Site Settings | None |
| 13 | `migrate-testimonials-to-sanity.js` | Testimonials | None |
| 14 | `migrate-banners-to-sanity.js` | Promo Banners | None |
| 15 | `create-featured-products.js` | Featured Products | Products |

---

## 🚀 Quick Start Commands

### Prerequisites
```powershell
# Navigate to project root
cd "c:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Ensure dependencies are installed
npm install @sanity/client dotenv
```

### Phase 1: Core E-Commerce Data (Products, Categories, Variants)
```powershell
# 1. Test connection first
node scripts/sanity/test-connection.js

# 2. Import categories (3 categories)
node scripts/sanity/import-categories.js

# 3. Import products (15 products)
node scripts/sanity/import-products.js

# 4. Import variants (15 variants)
node scripts/sanity/import-variants.js

# 5. Import bundles (6 bundles)
node scripts/sanity/import-bundles.js

# 6. Import reviews (45 reviews)
node scripts/sanity/import-reviews.js

# 7. Link product relationships
node scripts/sanity/link-relationships.js
```

### Phase 2: Growers & Stores
```powershell
# 8. Create growers (6 growers)
node scripts/migrate-growers-to-sanity.js

# 9. Create stores (3 stores)
node scripts/migrate-stores-to-sanity.js

# 10. Link growers to stores
node scripts/link-growers-stores.js

# 11. Link products to growers
node scripts/link-products-growers.js
```

### Phase 3: Content & Settings
```powershell
# 12. FAQ content
node scripts/migrate-faq-to-sanity.js

# 13. Feature sections
node scripts/migrate-features-to-sanity.js

# 14. Site settings & navigation
node scripts/migrate-site-settings-to-sanity.js

# 15. Testimonials
node scripts/migrate-testimonials-to-sanity.js

# 16. Promotional banners
node scripts/migrate-banners-to-sanity.js

# 17. Featured products singleton
node scripts/create-featured-products.js
```

### Verification
```powershell
# Check all data counts
node scripts/sanity/check-data-counts.js

# Run full audit
node scripts/audit-sanity-data.js

# Verify Phase B data
node scripts/verify-phase-b.js
```

---

## 📦 What Each Seeder Creates

### Categories (3 total)
| Name | Slug | Description |
|------|------|-------------|
| Fresh Mushrooms | fresh-mushrooms | Farm-fresh mushrooms harvested daily |
| Dried Mushrooms | dried-mushrooms | Premium dried mushrooms with concentrated flavor |
| Growing Kits | growing-kits | Easy home cultivation kits for beginners |

### Products (15 total)
| Category | Products |
|----------|----------|
| Fresh Mushrooms | Oyster, Shiitake, King Oyster, Lion's Mane, Enoki, Maitake |
| Dried Mushrooms | Dried Shiitake, Dried Porcini, Dried Chanterelle |
| Growing Kits | Oyster Grow Kit, Shiitake Grow Kit, Lion's Mane Grow Kit |
| Specialty | Mixed Mushroom Box, Chef's Selection, Mushroom Powder Blend |

### Variants (15 total)
- Small (200g), Medium (500g), Large (1kg) for each product type
- Different pricing based on size

### Bundles (6 total)
| Bundle | Contains |
|--------|----------|
| Fresh Starter Bundle | 3 fresh mushroom varieties |
| Dried Pantry Bundle | 3 dried mushroom varieties |
| Complete Kitchen Bundle | Fresh + Dried combo |
| Growing Kit Trio | 3 growing kits |
| Monthly Subscription Box | Rotating selection |
| Gift Bundle | Curated gift selection |

### Reviews (45 total)
- 3 reviews per product
- Ratings: 3-5 stars
- Realistic customer comments

### Growers (6 total)
| Name | Location | Specialty |
|------|----------|-----------|
| Manila Mushroom Farm | Quezon City | Oyster, Shiitake |
| Highland Fungi | Baguio | Specialty mushrooms |
| Metro Shrooms | Makati | Urban farming |
| Provincial Harvest | Laguna | Organic certified |
| Eco Fungi PH | Cavite | Sustainable growing |
| Fresh Pick Farms | Rizal | Same-day harvest |

### Stores (3 total)
| Name | Type | Location |
|------|------|----------|
| MASH Flagship Store | Main Store | Novaliches, QC |
| MASH Pickup Point - Caloocan | Pickup | Caloocan |
| MASH Express - Makati | Partner | Makati |

---

## 🖼️ Manual Image Upload Checklist

After running seeders, upload images in Sanity Studio (https://ppnamias.sanity.studio):

### Product Images (15 products)
- [ ] Fresh Oyster Mushroom
- [ ] Fresh Shiitake
- [ ] King Oyster
- [ ] Lion's Mane
- [ ] Enoki
- [ ] Maitake
- [ ] Dried Shiitake
- [ ] Dried Porcini
- [ ] Dried Chanterelle
- [ ] Oyster Grow Kit
- [ ] Shiitake Grow Kit
- [ ] Lion's Mane Grow Kit
- [ ] Mixed Mushroom Box
- [ ] Chef's Selection
- [ ] Mushroom Powder Blend

### Category Images (3 categories)
- [ ] Fresh Mushrooms category banner
- [ ] Dried Mushrooms category banner
- [ ] Growing Kits category banner

### Grower Images (6 growers)
- [ ] Manila Mushroom Farm logo/photo
- [ ] Highland Fungi logo/photo
- [ ] Metro Shrooms logo/photo
- [ ] Provincial Harvest logo/photo
- [ ] Eco Fungi PH logo/photo
- [ ] Fresh Pick Farms logo/photo

### Store Images (3 stores)
- [ ] MASH Flagship Store exterior
- [ ] MASH Pickup Point - Caloocan
- [ ] MASH Express - Makati

### Hero Carousel (3-5 slides)
- [ ] Slide 1: Fresh mushrooms banner
- [ ] Slide 2: Same-day delivery promo
- [ ] Slide 3: Growing kits feature
- [ ] Slide 4: Seasonal promotion
- [ ] Slide 5: About MASH

### Testimonial Avatars (if needed)
- [ ] Customer 1 avatar
- [ ] Customer 2 avatar
- [ ] Customer 3 avatar

---

## 📍 Image Sources (Free Stock Photos)

| Source | URL | Best For |
|--------|-----|----------|
| Unsplash | unsplash.com | High-quality food photos |
| Pexels | pexels.com | Mushroom/farming photos |
| Pixabay | pixabay.com | General purpose |
| Burst by Shopify | burst.shopify.com | E-commerce product shots |

**Search Terms:**
- "oyster mushroom"
- "shiitake mushroom"
- "lion's mane mushroom"
- "mushroom farming"
- "organic mushrooms"
- "mushroom grow kit"
- "farmer portrait"
- "organic farm"

---

## 🔧 Troubleshooting

### "Cannot find module" Error
```powershell
npm install @sanity/client dotenv
```

### "401 Unauthorized" Error
Check `.env.local` has correct tokens:
```env
SANITY_API_WRITE_TOKEN=sk8tLquq2h8oKzHCUtSgUdkidRF4Jb86...
```

### "Document already exists" Error
Documents may already be created. Run check script first:
```powershell
node scripts/sanity/check-data-counts.js
```

### Reset and Re-seed (Danger!)
```powershell
# Delete all products (use with caution!)
node scripts/sanity/delete-products.js

# Then re-run import scripts
```

---

## ✅ Final Verification Checklist

After seeding, verify in Sanity Studio:

- [ ] **Categories (3)**: All have names, descriptions
- [ ] **Products (15)**: All have prices, descriptions, categories linked
- [ ] **Variants (15)**: All linked to products with correct pricing
- [ ] **Bundles (6)**: All have products linked, discount prices
- [ ] **Reviews (45)**: Distributed across products
- [ ] **Growers (6)**: All have locations, specialties
- [ ] **Stores (3)**: All have addresses, hours, contact info
- [ ] **FAQ Items**: Categories and questions visible
- [ ] **Site Settings**: Company info, social links
- [ ] **Navigation**: Header/footer menus configured

---

## 📊 Expected Final Counts

| Document Type | Count |
|---------------|-------|
| category | 3 |
| product | 15 |
| productVariant | 15 |
| productBundle | 6 |
| review | 45 |
| grower | 6 |
| store | 3 |
| faqCategory | 5-6 |
| faqItem | 20-30 |
| featureSection | 4-6 |
| testimonial | 6-8 |
| banner | 3-5 |
| siteSettings | 1 |
| navigation | 2 |
| featuredProducts | 1 |

**Total: ~140 documents**

---

## 🎉 After Seeding Complete

1. **Open Studio**: https://ppnamias.sanity.studio
2. **Upload Images**: Follow the checklist above
3. **Review Content**: Check each document type
4. **Test Frontend**: Start Next.js and verify data displays
5. **Publish Changes**: Click "Publish" on any drafts

---

**Questions?** Check the script files in `scripts/sanity/` for detailed comments and error handling.
