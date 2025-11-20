# 🎯 CMS Data Population - Quick Reference Card

**Last Updated:** November 20, 2025

---

## 📊 Current Status

```
Phase 13: 33% (5/15 JSON ready)
Phase 16: 33% (10/30 JSON ready)
Overall: 13% templates ready, 0% imported
```

---

## ⚡ Quick Commands

### Start Sanity Studio
```cmd
cd studio
npm run dev
```
Opens at: http://localhost:3333

### Start Next.js Frontend
```cmd
npm run dev
```
Opens at: http://localhost:3000

---

## 📂 File Locations

| What | Where |
|------|-------|
| **Sample Data (JSON)** | `studio/sample-data/*.json` |
| **Progress Tracker** | `.github/CMS_DATA_POPULATION_GUIDE.md` |
| **Sample Data README** | `studio/sample-data/README.md` |
| **Sanity Schemas** | `studio/src/schemaTypes/` |

---

## 🚀 Import Workflow (5 Steps)

1. **Open Studio** → http://localhost:3333
2. **Open JSON** → `studio/sample-data/phase-13-products.json`
3. **Create Doc** → Click "Products" → "Create New"
4. **Copy Fields** → Paste from JSON to Studio fields
5. **Publish** → Click "Publish" button

---

## ✅ Today's Checklist

### Must Do (30 min)
- [ ] Start Sanity Studio
- [ ] Create 3 categories (Fresh, Dried, Growing Kits)
- [ ] Import 1 product (Fresh Oyster Mushrooms)
- [ ] Add 1 product image
- [ ] Verify product shows on frontend

### Should Do (1 hour)
- [ ] Import remaining 4 products
- [ ] Add images to all 5 products
- [ ] Test all products on frontend

### Nice to Have (1 hour)
- [ ] Import 10 reviews
- [ ] Link reviews to products
- [ ] Test review display

---

## 📋 Import Order (No Errors!)

```
1. Categories (Phase 17)
   ↓
2. Products (Phase 13)
   ↓
3. Variants (Phase 14)
   ↓
4. Bundles (Phase 15)
   ↓
5. Reviews (Phase 16)
```

**Why?** Products need categories. Variants need products. Reviews need products.

---

## 🎯 Available Sample Data

### ✅ Ready Now (15 items)

**Products (5):**
- Fresh Oyster Mushrooms
- Fresh Shiitake Mushrooms
- Fresh Enoki Mushrooms
- Dried Shiitake Mushrooms
- Oyster Growing Kit (Beginner)

**Reviews (10):**
- 7 five-star reviews
- 2 four-star reviews
- 1 three-star review (with seller response)

### ⏳ Coming Soon

- 10 more products
- 20 more reviews
- Product variants
- Product bundles
- Categories
- Marketing content

---

## 💡 Pro Tips

### When Importing
✅ **DO:**
- Start Sanity Studio first
- Create categories before products
- Copy exact field names
- Publish (not just save draft)
- Add images last

❌ **DON'T:**
- Skip category creation
- Use same SKU twice
- Forget to publish
- Leave required fields empty

### Images
- **Not included** in JSON files
- **Add manually** via Studio UI
- **Upload after** importing text data
- **Adjust crop** and hotspot as needed

### Testing
After each import:
1. Check Studio → Document appears
2. Check Frontend → Product/review displays
3. Check Console → No errors
4. Update progress in guide

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Reference not found"** | Create categories first |
| **"SKU already exists"** | Change SKU to unique value |
| **Product not showing** | Check: Published? Has image? Has category? |
| **Studio won't start** | Run `npm install` in studio folder |
| **Frontend errors** | Clear `.next` folder, restart dev server |

---

## 📞 Help Resources

- **Full Guide:** `.github/CMS_DATA_POPULATION_GUIDE.md`
- **Sample Data README:** `studio/sample-data/README.md`
- **Sanity Docs:** https://www.sanity.io/docs
- **Project Architecture:** `docs/COMPLETE_ARCHITECTURE.md`

---

## 🎯 This Week's Goals

- [ ] Import 15 products (100% of Phase 13)
- [ ] Add images to all products
- [ ] Import 30 reviews (100% of Phase 16)
- [ ] Create basic categories
- [ ] Test complete flow on frontend

**Estimated Time:** 8-10 hours

---

## 📅 Next Session Plan

**Session 1 (Today):**
- Import 5 products ✓ Ready
- Add 5 images
- Verify frontend display

**Session 2:**
- Create 10 more products
- Import all 15 products
- Add remaining images

**Session 3:**
- Import 30 reviews
- Link to products
- Test review system

**Session 4:**
- Create categories
- Organize products
- Test navigation

---

**Remember:** This is a living document! Update progress as you work.

**Last Action:** Created 5 product templates + 10 review templates  
**Next Action:** Import first product to Sanity Studio  
**Goal:** Have 15 products live by end of week
