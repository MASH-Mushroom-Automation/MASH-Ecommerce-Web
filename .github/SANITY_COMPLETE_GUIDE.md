# 🚀 Sanity CMS Implementation Guide for MASH E-Commerce

**Complete guide for integrating and using Sanity CMS for product management**

---

## Table of Contents

1. [Overview](#overview)
2. [Current Status](#current-status)
3. [Sanity Studio Access](#sanity-studio-access)
4. [Adding Products (Non-Technical Guide)](#adding-products-non-technical-guide)
5. [Technical Integration](#technical-integration)
6. [Next Steps](#next-steps)
7. [Troubleshooting](#troubleshooting)

---

## Overview

MASH E-Commerce now integrates with **Sanity CMS** for product management. This allows:
- ✅ Non-technical users to add/edit products without code
- ✅ Rich media management (multiple product images)
- ✅ Real-time content updates
- ✅ Collaborative editing
- ✅ Product categorization and promotions

### Architecture

```
MASH E-Commerce
├── Frontend (Next.js 15) → localhost:3000
├── Sanity Studio (CMS Admin) → localhost:3333
└── Sanity Cloud (Content Storage)
```

---

## Current Status

### ✅ Completed (Phase 1 - 60%)

1. **Dependencies Installed**
   - `@sanity/client` - Fetch data from Sanity
   - `next-sanity` - Next.js integration
   - `@sanity/image-url` - Optimized images

2. **Configuration Files Created**
   - `src/lib/sanity/client.ts` - Sanity client setup
   - `src/lib/sanity/queries.ts` - GROQ queries for data fetching
   - `.env.local` - Sanity credentials configured

3. **Product Schema Enhanced**
   - File: `studio/src/schemaTypes/documents/product.ts`
   - Fields: name, slug, price, images, stock, category, promotions, weight, SKU
   - Rich editing interface with validation

4. **Sanity Studio Running**
   - Accessible at: **http://localhost:3333**
   - Ready to add products

### 🚧 In Progress (Phase 2 - 30%)

5. **Product Display Component**
   - Create `src/components/products/SanityProductCard.tsx`
   - Display products from Sanity on frontend

6. **Shop Page Integration**
   - Update `src/app/(shop)/shop/page.tsx`
   - Replace mock data with Sanity data

### ⏳ Remaining (Phase 3 - 10%)

7. **Testing**
   - Add sample products
   - Verify frontend display
   - Test category filtering

8. **Documentation**
   - Admin guide with screenshots
   - Video walkthrough

---

## Sanity Studio Access

### Starting the Studio

```bash
# Terminal 1: Start Sanity Studio
cd studio
npm run dev

# Studio will start at: http://localhost:3333
```

```bash
# Terminal 2: Start Next.js frontend
npm run dev

# Frontend will start at: http://localhost:3000
```

### Login to Studio

1. Open http://localhost:3333
2. Sign in with your Sanity account
3. Project: **MASH E-Commerce** (z9tn0u8x)

---

## Adding Products (Non-Technical Guide)

### Step 1: Access Products Section

1. Open **http://localhost:3333** in your browser
2. Sign in with Sanity credentials
3. Click **"Product"** in the left sidebar
4. Click **"+ Create"** button

### Step 2: Fill Product Details

#### Basic Information

- **Product Name** (Required)
  - Example: `Fresh Oyster Mushroom 250g`
  - This appears on the website

- **Slug** (Auto-generated)
  - URL-friendly version: `fresh-oyster-mushroom-250g`
  - Used in product URLs: `/shop/fresh-oyster-mushroom-250g`

- **Product Image** (Required)
  - Click the image upload area
  - Select a high-quality product photo (PNG or JPG)
  - Recommended size: 800x800px or larger
  - This is the main product image customers see first

#### Categorization

- **Category** (Required)
  - Click dropdown to select category
  - Example: "Oyster Mushroom", "Shiitake", "Lion's Mane"
  - If category doesn't exist, create it first (see Category Guide below)

#### Pricing

- **Regular Price** (Required)
  - Enter price in Philippine Pesos (₱)
  - Example: `150` (will display as ₱150)
  - Don't include peso sign, just the number

- **Compare at Price** (Optional)
  - Original price before any discount
  - Example: If regular price is ₱150 and you want to show "was ₱200"
  - Enter `200`

#### Stock Management

- **Quantity in Stock** (Required)
  - Enter number of units available
  - Example: `50`
  - Product automatically becomes "Out of Stock" when quantity reaches 0

- **Available for Purchase** (Toggle)
  - Turn ON: Product appears on website and customers can buy
  - Turn OFF: Product hidden from website (useful for seasonal items)

#### Product Description

- **Description** (Required)
  - Detailed product information
  - Example:
    ```
    Fresh oyster mushrooms grown organically in our farm. 
    Rich in protein and vitamins. Perfect for stir-fry, 
    soup, and pasta dishes. 
    
    Weight: 250 grams
    Shelf life: 7 days refrigerated
    ```

- **SKU** (Optional)
  - Stock Keeping Unit - your internal product code
  - Example: `OYS-250G-001`
  - Useful for inventory tracking

#### Promotions (Optional)

**To create a promotional offer:**

1. Toggle **"On Promotion"** to **YES**

2. Choose **Promotion Type:**

   **Option A: Percentage Discount**
   - Select "Percentage Discount"
   - Enter discount percentage
   - Example: `20` (for 20% off)
   - If regular price is ₱150, sale price will be ₱120

   **Option B: Fixed Price**
   - Select "Fixed Price"
   - Enter the promotional price
   - Example: `120` (product will sell for ₱120)
   - Must be less than regular price

3. Set **Promotion End Date** (Optional)
   - Click calendar icon
   - Select date and time when promotion should end
   - Promotion will automatically end at this time

#### Additional Images (Optional)

**To add a product gallery:**

1. Scroll to **"Additional Images"** section
2. Click **"+ Add item"**
3. Upload additional product photos
4. Add multiple images showing:
   - Different angles
   - Close-up details
   - Usage examples
   - Packaging
5. **Drag and drop** to reorder images

#### Product Specifications (Optional)

- **Weight**
  - Enter product weight in grams
  - Example: `250` (for 250 grams)

- **Unit of Measurement**
  - Select from dropdown:
    - `Grams (g)` - Default
    - `Kilograms (kg)`
    - `Pieces (pcs)`
    - `Pack`
    - `Box`

- **Featured Product**
  - Toggle ON to display in "Featured Products" section on homepage
  - Limit to 6-8 featured products for best display

### Step 3: Publish Product

1. Review all information
2. Click **"Publish"** button at bottom right
3. ✅ Product is now live on website!

---

## Managing Categories

### Creating a New Category

1. Click **"Category"** in sidebar
2. Click **"+ Create"**
3. Fill in:
   - **Name:** Category display name
     - Example: `Oyster Mushroom`
   - **Slug:** Auto-generated
     - Example: `oyster-mushroom`
   - **Description:** (Optional)
     - Example: `Pleurotus ostreatus - Popular edible mushroom`
4. Click **"Publish"**

### Category Examples for Mushroom Store

- Oyster Mushroom
- Shiitake
- Lion's Mane
- King Oyster
- Enoki
- Button Mushroom
- Dried Mushrooms
- Mushroom Powder
- Mushroom Kits (for growing at home)
- Bulk Orders

---

## Managing Hero Carousel (Homepage Banners)

### Editing Homepage Slides

1. Click **"Hero Carousel"** in sidebar
2. You'll see existing slides
3. To add new slide:
   - Click **"+ Add item"**
   - Fill in:
     - **Title:** Main headline (e.g., "Fresh Mushrooms Daily")
     - **Subtitle:** Supporting text
     - **Button Text:** Call-to-action (e.g., "Shop Now")
     - **Button Link:** Where button goes (e.g., `/shop`)
     - **Image:** Upload banner image (1920x800px recommended)
4. To reorder slides: Drag and drop
5. To delete slide: Click trash icon
6. Click **"Publish"**

---

## Featured Products Section

### Setting Featured Products

1. Click **"Featured Products"** in sidebar
2. Edit:
   - **Title:** Section heading (e.g., "Best Sellers")
   - **Subtitle:** Supporting text (e.g., "Most popular mushrooms this month")
   - **Products:** Click **"+ Add item"**
     - Select products from list
     - Add 6-8 products
     - Reorder by dragging
3. Click **"Publish"**

### Alternative: Use Product "Featured" Toggle

Instead of Featured Products singleton, you can:
1. Go to any product
2. Scroll to **"Featured Product"** toggle
3. Toggle ON
4. Frontend will automatically show these as featured

---

## Blog Posts (Optional)

### Creating a Blog Post

1. Click **"Post"** in sidebar
2. Click **"+ Create"**
3. Fill in:
   - **Title:** Blog post title
   - **Slug:** Auto-generated
   - **Body:** Rich text editor for content
   - **Excerpt:** Short summary
   - **Main Image:** Featured image
   - **Author:** Select or create author
   - **Published At:** Date and time
4. Click **"Publish"**

### Blog Post Ideas

- Mushroom recipes
- Growing tips
- Health benefits
- Cooking guides
- Farm updates
- Seasonal offerings

---

## Technical Integration

### Fetching Products from Sanity

```typescript
// src/app/(shop)/shop/page.tsx
import { sanityClient } from "@/lib/sanity/client";
import { productsQuery } from "@/lib/sanity/queries";

export default async function ShopPage() {
  // Fetch all products
  const products = await sanityClient.fetch(productsQuery);

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### Optimizing Product Images

```typescript
import { getImageUrl } from "@/lib/sanity/client";
import Image from "next/image";

<Image
  src={getImageUrl(product.mainImage, 800, 600)}
  alt={product.name}
  width={800}
  height={600}
  className="rounded-lg"
/>
```

### Filtering by Category

```typescript
import { productsByCategoryQuery } from "@/lib/sanity/queries";

const products = await sanityClient.fetch(
  productsByCategoryQuery,
  { categorySlug: "oyster-mushroom" }
);
```

### Fetching Featured Products

```typescript
import { featuredProductsQuery } from "@/lib/sanity/queries";

const featuredProducts = await sanityClient.fetch(featuredProductsQuery);
```

---

## Next Steps

### Phase 2: Frontend Integration (30 minutes)

1. **Create Product Card Component**
   ```bash
   # Create component file
   touch src/components/products/SanityProductCard.tsx
   ```

   ```typescript
   // src/components/products/SanityProductCard.tsx
   import { getImageUrl } from "@/lib/sanity/client";
   import Image from "next/image";
   import Link from "next/link";

   export function SanityProductCard({ product }) {
     const finalPrice = product.isOnPromo 
       ? (product.promoType === 'percentage'
           ? product.price - (product.price * product.promoPercentage / 100)
           : product.promoPrice)
       : product.price;

     return (
       <Link href={`/shop/${product.slug.current}`}>
         <div className="border rounded-lg p-4 hover:shadow-lg">
           <Image
             src={getImageUrl(product.mainImage, 400, 400)}
             alt={product.name}
             width={400}
             height={400}
             className="rounded"
           />
           <h3 className="font-semibold mt-2">{product.name}</h3>
           <div className="flex items-center gap-2">
             <span className="text-lg font-bold">
               ₱{finalPrice.toFixed(2)}
             </span>
             {product.isOnPromo && (
               <span className="text-sm line-through text-gray-500">
                 ₱{product.price}
               </span>
             )}
           </div>
           <p className="text-sm text-gray-600">
             {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
           </p>
         </div>
       </Link>
     );
   }
   ```

2. **Update Shop Page**
   - Replace mock data with Sanity fetch
   - Use SanityProductCard component
   - Add category filtering

3. **Test**
   - Add 3-5 sample products in Studio
   - Visit http://localhost:3000/shop
   - Verify products display correctly

### Phase 3: Enhancement (2-3 hours)

4. **Add Category Filter**
   - Fetch categories from Sanity
   - Add filter sidebar
   - Update products based on selected category

5. **Add Search**
   - Add search input
   - Filter products by name/description
   - Show search results

6. **Add Product Detail Page**
   - Create `src/app/(shop)/shop/[slug]/page.tsx`
   - Fetch single product by slug
   - Display full details, image gallery
   - Add to cart functionality

---

## Troubleshooting

### Sanity Studio Not Loading

**Problem:** http://localhost:3333 shows error

**Solution:**
```bash
# Stop and restart studio
cd studio
npm run dev
```

### Products Not Showing on Frontend

**Problem:** Shop page empty

**Checklist:**
- [ ] Products published in Studio (not drafts)
- [ ] Sanity credentials in `.env.local`
- [ ] `NEXT_PUBLIC_SANITY_PROJECT_ID=z9tn0u8x`
- [ ] Frontend dev server running: `npm run dev`

**Test Query:**
```bash
# Open browser console on shop page
# Paste this:
fetch('/api/test-sanity')
  .then(r => r.json())
  .then(console.log)
```

### Images Not Loading

**Problem:** Product images show broken

**Solution:**
1. Verify image uploaded in Sanity Studio
2. Check image URL in browser Network tab
3. Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`
4. Clear Next.js cache: `rm -rf .next`

### "Module not found" Errors

**Problem:** Import errors in code

**Solution:**
```bash
# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

---

## FAQs

### Can I use both Sanity and Custom CMS?

**Yes!** MASH now supports dual CMS:
- **Sanity CMS:** E-commerce products, blog posts
- **Custom CMS:** Static content (Hero, Features, FAQ, About)

### Do I need to be online to add products?

**Yes.** Sanity Studio requires internet connection to sync with Sanity Cloud.

### Can multiple people edit products at the same time?

**Yes!** Sanity supports collaborative editing. Multiple users can work simultaneously.

### How do I backup my products?

**Automatic:** Sanity backs up all data automatically.

**Manual Export:**
```bash
cd studio
sanity dataset export production backup.tar.gz
```

### How much does Sanity cost?

**Free tier includes:**
- Unlimited API requests
- 3 users
- 10GB bandwidth/month
- 5GB assets

**Paid plans:** Start at $15/month for more users and bandwidth

### Can I move products to a different CMS later?

**Yes.** Export products from Sanity:
```bash
cd studio
sanity dataset export production products.json
```

Then import to new CMS.

---

## Resources

### Documentation

- **Sanity Studio:** http://localhost:3333
- **Integration Progress:** `.github/SANITY_INTEGRATION_PROGRESS.md`
- **GROQ Queries:** `src/lib/sanity/queries.ts`
- **Product Schema:** `studio/src/schemaTypes/documents/product.ts`

### External Links

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Next.js + Sanity Guide](https://www.sanity.io/guides/nextjs)
- [Sanity Image URLs](https://www.sanity.io/docs/image-url)

---

## Support

**Issues or Questions?**

1. Check this guide first
2. Check `.github/SANITY_INTEGRATION_PROGRESS.md`
3. Search Sanity docs: https://www.sanity.io/docs
4. Contact development team

---

**Last Updated:** November 19, 2025  
**Version:** 1.0  
**Status:** Phase 1 Complete (60%)

**Next Milestone:** Phase 2 - Frontend Integration (Due: November 20, 2025)
