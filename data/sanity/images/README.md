# Product Images Directory

**Purpose**: Store product images for automated upload to Sanity CMS  
**Phase**: Phase 4 - Image Upload (30-60 minutes)  
**Status**: 📷 Awaiting manual image collection

---

## 📋 Quick Instructions

### Step 1: Collect 15 Product Images (15-20 minutes)

You need to manually download **15 high-quality mushroom images** (1 per product).

**Image Sources** (Free, High-Quality):
- **Unsplash**: https://unsplash.com/s/photos/mushrooms
- **Pexels**: https://www.pexels.com/search/mushrooms/
- **Pixabay**: https://pixabay.com/images/search/mushrooms/

### Step 2: Image Requirements

| Requirement | Specification |
|-------------|---------------|
| **Format** | JPG, PNG, or WebP |
| **Size** | 1200x1200px minimum (square ratio preferred) |
| **Quality** | High resolution, sharp focus, bright lighting |
| **File Size** | < 2MB (Sanity auto-optimizes) |
| **Background** | Clean, professional, preferably white or natural |

### Step 3: Naming Convention (CRITICAL!)

Images **must** match product slugs exactly:

```
fresh-oyster-mushrooms.jpg         (Fresh Oyster Mushrooms)
fresh-king-oyster-mushrooms.jpg    (Fresh King Oyster Mushrooms)
fresh-shiitake-mushrooms.jpg       (Fresh Shiitake Mushrooms)
fresh-lions-mane-mushrooms.jpg     (Fresh Lion's Mane Mushrooms)
fresh-button-mushrooms.jpg         (Fresh Button Mushrooms)
fresh-portobello-mushrooms.jpg     (Fresh Portobello Mushrooms)
dried-shiitake-mushrooms.jpg       (Dried Shiitake Mushrooms)
dried-oyster-mushrooms.jpg         (Dried Oyster Mushrooms)
dried-mixed-mushrooms.jpg          (Dried Mixed Mushrooms)
mushroom-powder.jpg                (Mushroom Powder)
mushroom-extract-tincture.jpg      (Mushroom Extract Tincture)
oyster-mushroom-growing-kit.jpg    (Oyster Mushroom Growing Kit)
shiitake-mushroom-growing-kit.jpg  (Shiitake Mushroom Growing Kit)
lions-mane-mushroom-growing-kit.jpg (Lion's Mane Mushroom Growing Kit)
beginner-mushroom-combo-kit.jpg    (Beginner Mushroom Combo Kit)
```

**⚠️ Important**: Use lowercase, hyphens (no spaces), and match product slugs exactly!

### Step 4: Save Images Here

Save all 15 images to this directory:
```
data/sanity/images/
├── fresh-oyster-mushrooms.jpg
├── fresh-king-oyster-mushrooms.jpg
├── fresh-shiitake-mushrooms.jpg
├── ... (12 more images)
```

### Step 5: Run Upload Script

Once all images are collected:

```powershell
cd "C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web"
node scripts/sanity/upload-images.js
```

**Expected Output**:
```
📷 Uploading Product Images to Sanity...
   Found 15 products in Sanity
   Found 15 image files in data/sanity/images/

   Uploading images...
   📤 Uploading: fresh-oyster-mushrooms.jpg...
   ✅ Linked image to: Fresh Oyster Mushrooms
   ... (15 total)

📊 Upload Summary:
   ✅ Successfully uploaded: 15 images
   ⚠️  Skipped (no file): 0 products
   ❌ Failed: 0 uploads

✅ Image upload complete!
   Verify in Studio: http://localhost:3333 → Products
```

### Step 6: Verify in Studio

1. Open Sanity Studio: `cd studio && npm run dev`
2. Navigate to: http://localhost:3333
3. Go to: Products section
4. Check each product has main image displayed
5. Verify image quality and cropping

---

## 🎨 Image Collection Tips

### For Fresh Mushrooms (6 images)

**What to Look For**:
- Fresh, vibrant appearance
- Close-up shots showing texture
- Natural lighting
- White or light background
- Multiple mushrooms grouped together

**Example Search Terms**:
- "fresh oyster mushrooms white background"
- "king oyster mushrooms close up"
- "shiitake mushrooms fresh"

### For Dried Mushrooms (3 images)

**What to Look For**:
- Dried mushroom texture visible
- Bowl or container presentation
- Earthy, natural tones
- Overhead or angled shots

**Example Search Terms**:
- "dried shiitake mushrooms bowl"
- "dried oyster mushrooms"

### For Specialty Products (2 images)

**What to Look For**:
- Powder: Fine powder in bowl or jar
- Extract: Tincture bottle or dropper

**Example Search Terms**:
- "mushroom powder supplement"
- "mushroom extract tincture"

### For Growing Kits (4 images)

**What to Look For**:
- Mushroom growing bags or boxes
- Active mushroom growth visible
- Clean, educational presentation
- Indoor growing setup

**Example Search Terms**:
- "oyster mushroom growing kit"
- "home mushroom cultivation"

---

## 🚨 Common Issues & Solutions

### Issue 1: "No images found"
**Cause**: Images not in correct directory  
**Fix**: Make sure images are in `data/sanity/images/` (not in subdirectories)

### Issue 2: "No image for [product]"
**Cause**: Image filename doesn't match product slug  
**Fix**: Rename image to match slug exactly (lowercase, hyphens)

### Issue 3: "Upload failed: File too large"
**Cause**: Image exceeds 2MB  
**Fix**: Compress image using:
- **Online**: https://tinypng.com
- **Command Line**: `convert input.jpg -quality 85 output.jpg`

### Issue 4: Wrong image uploaded
**Cause**: Filename matched wrong product  
**Fix**: Delete image in Sanity Studio, rename file correctly, re-run upload script

---

## 📊 Progress Tracking

- [ ] Collected 15 product images (15-20 min)
- [ ] Verified image requirements (size, format, quality)
- [ ] Renamed images to match product slugs
- [ ] Saved images to data/sanity/images/
- [ ] Ran upload script: `node scripts/sanity/upload-images.js`
- [ ] Verified images in Studio (http://localhost:3333)

**Once complete**: Phase 4 done! ✅ Proceed to Phase 5 (Variants)

---

## 🔗 Related Files

- **Upload Script**: `scripts/sanity/upload-images.js`
- **Products Data**: `data/sanity/products.json`
- **Sanity Client**: `scripts/sanity/lib/sanity-client.js`

---

**Need Help?** See `.github/PHASE_3_SCHEMA_FIX_REPORT.md` → "Phase 4: Images" section for detailed guide
