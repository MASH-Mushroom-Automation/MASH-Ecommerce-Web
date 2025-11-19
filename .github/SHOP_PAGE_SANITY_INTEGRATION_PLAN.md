# 🎯 Shop Page Integration Plan - Sanity CMS Products Display

**Date:** November 19, 2025  
**Goal:** Display Sanity CMS products on http://localhost:3000/shop  
**Status:** 📋 IMPLEMENTATION PLAN READY

---

## 📊 Current Situation Analysis

### ✅ What's Already Working

**Sanity CMS:**
- ✅ Project ID: 2grm6gj7 configured
- ✅ API tokens configured (Read + Write)
- ✅ Studio deployed: https://mash-ecommerce.sanity.studio
- ✅ Local studio running: http://localhost:3334
- ✅ GROQ queries ready in `src/lib/sanity/queries.ts`
- ✅ Sanity client configured in `src/lib/sanity/client.ts`

**Shop Page:**
- ✅ Current file: `src/app/(shop)/shop/page.tsx`
- ✅ Using custom hooks: `useProducts`, `useProductCategories`, `useProductGrowers`
- ✅ Currently fetching from: Backend API (`/api/v1/products`)
- ⚠️ **Issue:** Currently using backend API, needs to switch to Sanity CMS

---

## 🎯 Implementation Strategy

### Phase 1: Add Products to Sanity (30-60 minutes) ⏳ YOUR TASK

Before we can display products, you need to add them to Sanity Studio.

**Action Required:**
1. Open Sanity Studio: http://localhost:3334
2. Add 10-15 mushroom products
3. Upload product images
4. Mark some as "Featured"

**Template for First Product:**
```
Product Name: Fresh Oyster Mushroom 250g
Slug: fresh-oyster-mushroom-250g (auto-generated)
Category: Oyster Mushroom
Regular Price: 150
Sale Price: (leave empty or add discount)
Stock Quantity: 50
SKU: OYS-250G-001
Weight: 250
Unit: grams
Description: Organically grown fresh oyster mushrooms, 
             perfect for soups, stir-fry, and pasta dishes.
             Harvested daily for maximum freshness.
Is Available: ✓ (checked)
Is Featured: ✓ (check for featured products)
Is Promo: (check if on sale)
Promo End Date: (if on promo, set end date)
```

**Product Categories to Add:**
- Oyster Mushrooms (Fresh 250g, 500g, 1kg, Dried)
- Shiitake (Fresh 250g, 500g, 1kg, Dried)
- Mushroom Growing Kits (Small, Medium, Large)
- Mixed Mushroom Packs
- Specialty Mushrooms (Lion's Mane, Reishi, etc.)

---

### Phase 2: Create Sanity Data Hooks (30 minutes) 🔧 AI IMPLEMENTATION

**Goal:** Create React hooks to fetch products from Sanity instead of backend API.

#### Step 2.1: Create `src/hooks/useSanityProducts.ts`

**New File:** `src/hooks/useSanityProducts.ts`

**Features:**
- Fetch all products with filters
- Fetch single product by slug
- Fetch featured products
- Fetch categories
- Handle loading states
- Handle errors
- Support pagination

**Implementation Pattern:**
```typescript
import { useEffect, useState } from 'react';
import { sanityClient } from '@/lib/sanity/client';
import { productsQuery, featuredProductsQuery, categoriesQuery } from '@/lib/sanity/queries';

export function useSanityProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await sanityClient.fetch(productsQuery);
        setProducts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [filters]);

  return { products, loading, error };
}
```

#### Step 2.2: Create Type Definitions

**File:** `src/types/sanity.ts`

**Types to Define:**
```typescript
export interface SanityProduct {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: { current: string };
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  weight: number;
  unit: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPromo: boolean;
  promoEndDate?: string;
  mainImage?: string;
  images?: string[];
  category: {
    _id: string;
    name: string;
    slug: { current: string };
    description?: string;
  };
  subcategory?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
}

export interface SanityCategory {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: string;
}
```

---

### Phase 3: Update Shop Page (1 hour) 🔧 AI IMPLEMENTATION

**Goal:** Modify `src/app/(shop)/shop/page.tsx` to use Sanity products.

#### Step 3.1: Replace Backend Hooks with Sanity Hooks

**Current Code:**
```typescript
const { products, loading, error, pagination, setParams } = useProducts(apiParams);
const { categories } = useProductCategories();
const { growers } = useProductGrowers();
```

**New Code:**
```typescript
const { products, loading, error } = useSanityProducts({
  categories: selectedCategories,
  priceRange: priceRange,
  featured: sort === 'featured',
  isAvailable: true
});
const { categories } = useSanityCategories();
```

#### Step 3.2: Update ProductCard Props

**Current:** Backend API response format  
**New:** Sanity CMS response format

**Mapping Required:**
```typescript
// Transform Sanity product to match ProductCard expectations
const transformedProduct = {
  id: product._id,
  name: product.name,
  slug: product.slug.current,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  image: product.mainImage,
  category: product.category?.name,
  stock: product.stock,
  isAvailable: product.isAvailable,
  isFeatured: product.isFeatured,
  isPromo: product.isPromo
};
```

#### Step 3.3: Update Filters

**Categories Filter:**
- Fetch categories from Sanity
- Display category names
- Filter by category slug

**Price Range Filter:**
- Client-side filtering for Sanity products
- Or add price filters to GROQ query

**Sort Options:**
- Featured: `isFeatured == true`
- Price Low-High: `order(price asc)`
- Price High-Low: `order(price desc)`
- Newest: `order(_createdAt desc)`

---

### Phase 4: Update Product Detail Page (30 minutes) 🔧 AI IMPLEMENTATION

**File:** `src/app/(shop)/product/[slug]/page.tsx`

**Changes Needed:**
1. Fetch product by slug from Sanity
2. Use `productBySlugQuery` from `src/lib/sanity/queries.ts`
3. Display Sanity product images
4. Show Sanity product details

**Implementation:**
```typescript
// Server Component (default in Next.js 15)
import { sanityClient } from '@/lib/sanity/client';
import { productBySlugQuery } from '@/lib/sanity/queries';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await sanityClient.fetch(productBySlugQuery, { 
    slug: params.slug 
  });

  if (!product) {
    notFound();
  }

  return (
    <div>
      {/* Product details */}
    </div>
  );
}
```

---

### Phase 5: Update Homepage Featured Products (15 minutes) 🔧 AI IMPLEMENTATION

**File:** `src/app/page.tsx`

**Changes:**
1. Fetch featured products from Sanity
2. Use `featuredProductsQuery`
3. Display in product carousel

**Implementation:**
```typescript
import { sanityClient } from '@/lib/sanity/client';
import { featuredProductsQuery } from '@/lib/sanity/queries';

export default async function HomePage() {
  const featuredProducts = await sanityClient.fetch(featuredProductsQuery);

  return (
    <>
      {/* Hero Section */}
      <FeaturedProductsCarousel products={featuredProducts} />
      {/* Other sections */}
    </>
  );
}
```

---

## 📝 Implementation Checklist

### Phase 1: Content (Your Task) ⏳
- [ ] Open Sanity Studio (http://localhost:3334)
- [ ] Add first product (Oyster Mushroom 250g)
- [ ] Add 5 more Oyster Mushroom variants
- [ ] Add 5 Shiitake variants
- [ ] Add 3 Growing Kits
- [ ] Add 2 Mixed Packs
- [ ] Upload product images for all products
- [ ] Mark 4-5 products as "Featured"
- [ ] Mark 2-3 products as "Promo" with discount prices
- [ ] Verify products visible in Sanity Studio

### Phase 2: Sanity Hooks (AI Implementation) 🔧
- [ ] Create `src/types/sanity.ts` with type definitions
- [ ] Create `src/hooks/useSanityProducts.ts`
- [ ] Create `src/hooks/useSanityCategories.ts`
- [ ] Test hooks fetch data correctly
- [ ] Add error handling
- [ ] Add loading states

### Phase 3: Shop Page (AI Implementation) 🔧
- [ ] Update `src/app/(shop)/shop/page.tsx` imports
- [ ] Replace backend hooks with Sanity hooks
- [ ] Update product mapping for ProductCard
- [ ] Update categories filter
- [ ] Update price filter (client-side)
- [ ] Update sort options
- [ ] Test filters working
- [ ] Test pagination (if needed)
- [ ] Test product cards display correctly

### Phase 4: Product Detail (AI Implementation) 🔧
- [ ] Update `src/app/(shop)/product/[slug]/page.tsx`
- [ ] Fetch product from Sanity by slug
- [ ] Display all product details
- [ ] Display product images
- [ ] Test "Add to Cart" functionality
- [ ] Test related products (if implemented)

### Phase 5: Homepage (AI Implementation) 🔧
- [ ] Update `src/app/page.tsx`
- [ ] Fetch featured products from Sanity
- [ ] Display in carousel
- [ ] Test carousel functionality

### Phase 6: Testing & Verification ✅
- [ ] All products visible on shop page
- [ ] Filters working correctly
- [ ] Product detail pages load
- [ ] Images display correctly
- [ ] Add to cart works
- [ ] Featured products show on homepage
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🚀 Expected Results

### Before Implementation
- Shop page shows backend API products (might be empty or mock data)
- Products not managed in Sanity Studio
- Limited content management capabilities

### After Implementation
- ✅ Shop page shows Sanity CMS products
- ✅ Products managed in Sanity Studio (http://localhost:3334)
- ✅ Non-technical users can add/edit products
- ✅ Real-time updates when products change
- ✅ Rich media management (multiple images)
- ✅ Categories from Sanity
- ✅ Filters working with Sanity data
- ✅ Product detail pages load from Sanity
- ✅ Featured products on homepage from Sanity

---

## 📚 Code Examples

### Example 1: Fetch All Products with Filters

```typescript
// src/hooks/useSanityProducts.ts
export function useSanityProducts(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}) {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        // Build GROQ query with filters
        let query = `*[_type == "product" && isAvailable == true`;
        
        if (filters?.category) {
          query += ` && category->slug.current == "${filters.category}"`;
        }
        
        if (filters?.featured) {
          query += ` && isFeatured == true`;
        }
        
        query += `] {
          _id, name, slug, price, compareAtPrice, stock, 
          isAvailable, isFeatured, isPromo,
          "mainImage": mainImage.asset->url,
          category->{ name, slug }
        }`;
        
        const data = await sanityClient.fetch(query);
        
        // Client-side price filtering
        let filteredData = data;
        if (filters?.minPrice || filters?.maxPrice) {
          filteredData = data.filter((p: SanityProduct) => {
            if (filters.minPrice && p.price < filters.minPrice) return false;
            if (filters.maxPrice && p.price > filters.maxPrice) return false;
            return true;
          });
        }
        
        setProducts(filteredData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters]);

  return { products, loading, error };
}
```

### Example 2: Transform Sanity Product for ProductCard

```typescript
// In shop page
const transformedProducts = products.map(product => ({
  id: product._id,
  name: product.name,
  slug: product.slug.current,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  image: product.mainImage,
  images: product.images || [],
  category: product.category?.name,
  categorySlug: product.category?.slug.current,
  stock: product.stock,
  isAvailable: product.isAvailable,
  isFeatured: product.isFeatured,
  isPromo: product.isPromo,
  promoEndDate: product.promoEndDate
}));
```

### Example 3: Categories from Sanity

```typescript
// src/hooks/useSanityCategories.ts
export function useSanityCategories() {
  const [categories, setCategories] = useState<SanityCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const query = `*[_type == "category"] | order(name asc) {
          _id, name, slug, description,
          "image": image.asset->url
        }`;
        
        const data = await sanityClient.fetch(query);
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading };
}
```

---

## ⚠️ Important Notes

### 1. Product Schema Compatibility

**Sanity Product Schema:**
- Uses `slug.current` for slug (object with current property)
- Uses `mainImage.asset->url` for image URL
- Categories are references, need to populate with `->`

**Backend API:**
- Uses string `slug`
- Uses string `image`
- Categories are string IDs

**Solution:** Transform Sanity data to match existing ProductCard interface.

### 2. Image Handling

**Sanity Images:**
```typescript
import { urlFor } from '@/lib/sanity/client';

// Optimize image
const imageUrl = urlFor(product.mainImage)
  .width(400)
  .height(400)
  .format('webp')
  .url();
```

**Alternative:** Use `getImageUrl()` helper:
```typescript
import { getImageUrl } from '@/lib/sanity/client';

const imageUrl = getImageUrl(product.mainImage, 400, 400);
```

### 3. Server vs Client Components

**Shop Page:** Currently client component (`"use client"`)  
**Reason:** Uses hooks, state, filters

**Product Detail:** Can be server component (better performance)  
**Reason:** No client-side state needed

**Homepage:** Server component recommended  
**Reason:** Featured products can be fetched server-side

### 4. Pagination

**Current:** Backend API handles pagination  
**Sanity:** Need to implement GROQ pagination

**Example:**
```typescript
// Fetch with pagination
const query = `*[_type == "product"] | order(name asc) [$start...$end]`;
const products = await sanityClient.fetch(query, { 
  start: (page - 1) * limit, 
  end: page * limit 
});
```

---

## 🔍 Testing Strategy

### 1. Unit Tests (Optional)
- Test Sanity hooks return correct data
- Test data transformations
- Test filter logic

### 2. Integration Tests
- Shop page loads products from Sanity
- Filters work correctly
- Product detail pages load
- Add to cart works

### 3. Manual Testing
- [ ] Navigate to http://localhost:3000/shop
- [ ] Verify products display
- [ ] Test category filter
- [ ] Test price filter
- [ ] Test sort options
- [ ] Click product to view detail
- [ ] Add product to cart
- [ ] Check homepage featured products

---

## 📊 Success Criteria

### ✅ Definition of Done

1. **Content:**
   - [ ] 10-15 products added to Sanity Studio
   - [ ] All products have images
   - [ ] Categories configured
   - [ ] Some products marked as featured

2. **Shop Page:**
   - [ ] Displays products from Sanity CMS
   - [ ] Filters work (category, price, sort)
   - [ ] Product cards show correct information
   - [ ] Images load correctly
   - [ ] No console errors

3. **Product Detail:**
   - [ ] Loads product from Sanity by slug
   - [ ] Displays all product information
   - [ ] Shows product images
   - [ ] Add to cart works

4. **Homepage:**
   - [ ] Featured products from Sanity
   - [ ] Product carousel works
   - [ ] Links to product pages work

5. **Performance:**
   - [ ] Page loads in < 2 seconds
   - [ ] Images optimized (WebP format)
   - [ ] No layout shifts

---

## 🚀 Next Steps After Implementation

### Phase 1 Complete: Basic Integration
- Products display on shop page
- Basic filters working
- Product detail pages load

### Phase 2: Enhanced Features
- Add search functionality
- Add product reviews
- Add related products
- Add recently viewed products

### Phase 3: Content Management
- Train team on Sanity Studio
- Add more product categories
- Add blog posts
- Add promotional content

### Phase 4: Production Deployment
- Deploy to Vercel
- Configure CORS for production domain
- Test production Sanity Studio
- Monitor performance

---

## 📞 Support & Resources

### Documentation
- Sanity GROQ: https://www.sanity.io/docs/groq
- Next.js Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
- Sanity Image URLs: https://www.sanity.io/docs/image-url

### Your Sanity Project
- **Studio:** https://mash-ecommerce.sanity.studio
- **Local Studio:** http://localhost:3334
- **Project ID:** 2grm6gj7
- **Dataset:** production

### Internal Docs
- `.github/SANITY_QUICK_REFERENCE.md` - Quick guide
- `.github/SANITY_COMPLETE_GUIDE.md` - Detailed guide
- `.github/NEXT_STEPS_GUIDE.md` - Implementation roadmap

---

**Ready to Start?** Begin with Phase 1 - Add products to Sanity Studio! 🚀
