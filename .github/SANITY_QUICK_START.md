# Sanity CMS Quick Start Guide

**Time Required**: 15 minutes  
**Goal**: Test Sanity connection and import categories

---

## Step 1: Install Dependencies (2 min)

```powershell
# Make sure you're in the project root
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"

# Install @sanity/client if not already installed
npm install @sanity/client dotenv
```

---

## Step 2: Test Connection (2 min)

```powershell
# Test Sanity API connection
node scripts/sanity/test-connection.js

# Expected output:
# ✅ Connected to Sanity successfully
#    Project: gerattrr
#    Dataset: production
#    Products found: 0
# Test 2: Document Counts
#    product: 0 documents
#    category: 0 documents
#    ...
# ✅ All tests completed!
```

**If test fails**:
- Check `.env.local` has `SANITY_API_WRITE_TOKEN`
- Verify project ID is `gerattrr`
- Confirm dataset is `production`

---

## Step 3: Import Categories (3 min)

```powershell
# Import 3 categories
node scripts/sanity/import-categories.js

# Expected output:
# 📦 Importing Categories to Sanity...
#    Current categories in Sanity: 0
#    Categories to import: 3
#    Creating categories...
# ✅ Successfully imported 3 categories:
#    1. Fresh Mushrooms (category-...)
#    2. Dried Mushrooms (category-...)
#    3. Growing Kits & Accessories (category-...)
# 📊 Total categories in Sanity: 3
# ✅ Category import complete!
```

---

## Step 4: Verify in Studio (5 min)

```powershell
# Start Sanity Studio
cd studio
npm run dev

# Opens at: http://localhost:3333
```

**In Studio**:
1. Click "Product Categories" in sidebar
2. Should see 3 categories:
   - Fresh Mushrooms
   - Dried Mushrooms
   - Growing Kits & Accessories
3. Open each category to verify all fields populated

---

## Step 5: What's Next? (3 min)

**Choose your path**:

### Option A: Continue with Scripts (Automated)
```powershell
# Next: Import products (coming soon)
node scripts/sanity/import-products.js

# Then: Import variants
node scripts/sanity/import-variants.js

# Then: Import bundles
node scripts/sanity/import-bundles.js

# Finally: Link relationships
node scripts/sanity/link-relationships.js
```

### Option B: Manual Entry (Via Studio)
1. Open Studio: http://localhost:3333
2. Click "Products" → "+ Create"
3. Fill in product details
4. Select category from dropdown
5. Add images, pricing, inventory
6. Click "Publish"

---

## Troubleshooting

### Error: "Missing environment variables"
**Fix**: Check `.env.local` has these variables:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID="gerattrr"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_WRITE_TOKEN="skCVttQRCl0qVx22gul6..."
```

### Error: "Cannot find module '@sanity/client'"
**Fix**: Install dependencies:
```powershell
npm install @sanity/client dotenv
```

### Error: "Unauthorized" or "Invalid token"
**Fix**:
1. Go to https://sanity.io/manage/project/gerattrr
2. Click "API" → "Tokens"
3. Create new token with "Editor" permissions
4. Copy token to `.env.local`

### Categories not showing in Studio
**Fix**:
1. Restart Studio: `Ctrl+C` then `npm run dev`
2. Hard refresh browser: `Ctrl+Shift+R`
3. Check browser console for errors

---

## Success Criteria

✅ **Phase 1 Complete** when you can:
- [x] Run test-connection.js without errors
- [x] Import categories successfully
- [x] See 3 categories in Studio
- [x] Open and edit a category in Studio

---

## Next Actions

1. ✅ Test connection
2. ✅ Import categories
3. ⏳ Wait for product import script (coming next)
4. ⏳ Test product import
5. ⏳ Continue with variants, bundles, reviews

---

*Last Updated: November 22, 2025*  
*Total Time: 15 minutes*  
*Status: ✅ Ready to run*
