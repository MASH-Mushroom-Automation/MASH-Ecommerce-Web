# 🚀 Optional Enhancements Guide - Post Phase 5

**Date:** November 19, 2025  
**Status:** 📋 IMPLEMENTATION GUIDE - 5 Optional Features  
**Prerequisite:** All 5 phases complete ✅

---

## 🎯 Overview

All core Sanity CMS integration is complete! These are **optional enhancements** you can implement to further improve the MASH platform.

**Total Time Estimate:** 2.5 - 3 hours  
**Your Involvement:** Configuration + testing (30 min each feature)

---

## 📊 Enhancement Priority Matrix

| Enhancement | Priority | Time | Impact | Difficulty |
|-------------|----------|------|--------|-----------|
| 1. Production Deployment | 🔴 HIGH | 30 min | Production-ready site | Easy |
| 2. Performance Optimization | 🟡 MEDIUM | 1 hour | Faster page loads | Medium |
| 3. Category Showcase | 🟢 LOW | 20 min | Better UX | Easy |
| 4. Blog Integration | 🟢 LOW | 30 min | Content marketing | Easy |
| 5. Analytics Integration | 🟡 MEDIUM | 30 min | Track user behavior | Easy |

---

## 1️⃣ Production Deployment to Vercel (30 minutes)

### ✅ What You'll Get
- Live production site at `mash-ecommerce.vercel.app`
- Automatic deployments on git push
- Preview deployments for branches
- Production-optimized builds

### 📋 Implementation Steps

#### Step 1: Prepare Environment Variables (5 min)

Create `.env.production` file:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="2grm6gj7"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-11-19"
NEXT_PUBLIC_SANITY_STUDIO_URL="https://mash-ecommerce.sanity.studio"

# API Tokens (from Sanity dashboard)
SANITY_API_READ_TOKEN="skCDwOX5E8WMzvO75268kZeVN2MisOTkQBbRtSr22n2YYALUy4PBu9CzVbdwuoUfTMReroRx8dk7sVuow4s4OFru7a3u1h9c0qkFxoLBvGz9DfAvpnI12FC22uML4zA4G3jh10dJ3IFjtHQ8cflujnmftfuiXfrRusFCWsb0nszC7AwGwSYu"
SANITY_API_WRITE_TOKEN="skG4Jh0yyksQsmdziYleoAAOe9JqyG1jlGeNqYJtsfsqSzRrOZAddX55z9QcpsM3rebbxf1fb2BZiiwGuBwJD2hnXrlxlYEWW8PvxudQbFcPfFYJEZURNHZ5olAnuj46B6bHGDSlgcWLMh4NCBFm0t7nxUQt6MPGJCj65EFrJUmBtUntCYMW"

# Backend API (Railway)
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
NEXT_PUBLIC_USE_MOCK_DATA="false"
```

#### Step 2: Update Vercel Configuration (5 min)

Update `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SANITY_PROJECT_ID": "2grm6gj7",
    "NEXT_PUBLIC_SANITY_DATASET": "production",
    "NEXT_PUBLIC_SANITY_API_VERSION": "2024-11-19",
    "NEXT_PUBLIC_SANITY_STUDIO_URL": "https://mash-ecommerce.sanity.studio"
  }
}
```

#### Step 3: Deploy to Vercel (10 min)

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import GitHub repository
3. Add environment variables from `.env.production`
4. Click "Deploy"

#### Step 4: Configure CORS in Sanity (5 min)

1. Go to https://sanity.io/manage/personal/project/2grm6gj7
2. Navigate to "API" → "CORS Origins"
3. Add production URL:
   - Origin: `https://your-site.vercel.app`
   - Allow credentials: ✅ Yes

#### Step 5: Test Production Deployment (5 min)

1. Visit your Vercel URL
2. Test shop page loads products
3. Test product detail pages
4. Test featured products on homepage
5. Verify images load correctly

---

## 2️⃣ Performance Optimization (1 hour)

### ✅ What You'll Get
- Faster page loads (ISR caching)
- Optimized images
- Better SEO
- Improved Core Web Vitals

### 📋 Implementation Steps

#### Step 1: Enable ISR (Incremental Static Regeneration) (20 min)

**Update `src/app/(shop)/shop/page.tsx`:**

```typescript
// Add at top of file
export const revalidate = 60; // Revalidate every 60 seconds

// Rest of page component stays the same
```

**Update `src/app/(shop)/product/[slug]/page.tsx`:**

```typescript
// Add at top of file
export const revalidate = 60;
export const dynamicParams = true;

// Add generateStaticParams function
export async function generateStaticParams() {
  const products = await sanityFetch<TransformedProduct[]>({
    query: `*[_type == "product"][0...20] {
      "slug": slug.current
    }`,
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Rest of page component stays the same
```

**Update `src/app/page.tsx` (homepage):**

```typescript
// Add at top of file
export const revalidate = 60; // Revalidate every 60 seconds
```

#### Step 2: Optimize Images (20 min)

**Update `next.config.ts`:**

```typescript
const nextConfig: NextConfig = {
  // ... existing config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

**Use next/image for Sanity images:**

Already implemented! Verify in `ProductCard`:

```typescript
import Image from 'next/image';

// In component
<Image
  src={urlFor(image).width(400).height(400).url()}
  alt={name}
  width={400}
  height={400}
  className="..."
  priority={false}
/>
```

#### Step 3: Add Metadata for SEO (20 min)

**Update `src/app/(shop)/product/[slug]/page.tsx`:**

```typescript
import type { Metadata } from 'next';

// Add generateMetadata function
export async function generateMetadata(
  { params }: ProductDetailPageProps
): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await sanityFetch<TransformedProduct>({
    query: productBySlugQuery,
    params: { slug },
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} - MASH Market`,
    description: product.description || `Buy ${product.name} from MASH Market`,
    openGraph: {
      title: `${product.name} - MASH Market`,
      description: product.description,
      images: [product.image],
    },
  };
}
```

**Update `src/app/(shop)/shop/page.tsx`:**

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Fresh Mushrooms - MASH Market',
  description: 'Browse our selection of fresh, locally-grown mushrooms',
};
```

---

## 3️⃣ Category Showcase on Homepage (20 minutes)

### ✅ What You'll Get
- Featured categories section on homepage
- Quick navigation to filtered shop views
- Visual category cards with images

### 📋 Implementation Steps

#### Step 1: Create Sanity Hook (10 min)

Already exists! `useSanityCategories()` in `src/hooks/useSanityCategories.ts`

#### Step 2: Add Category Section to Homepage (10 min)

**Update `src/app/page.tsx`:**

```typescript
// Add import
import { useSanityCategories } from "@/hooks/useSanityCategories";

// Add CategoryCard component
const CategoryCard: React.FC<{
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}> = ({ name, slug, image, productCount }) => {
  return (
    <Link href={`/shop?category=${slug}`}>
      <div className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
        {image && (
          <div className="aspect-square overflow-hidden">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4 text-center">
          <h3 className="font-bold text-lg text-gray-800">{name}</h3>
          {productCount !== undefined && (
            <p className="text-sm text-muted-foreground">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Add FeaturedCategoriesSection component
const FeaturedCategoriesSection: React.FC = () => {
  const { categories, loading } = useSanityCategories(true);

  if (loading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Only show parent categories (no parent)
  const parentCategories = categories.filter(cat => !cat.parent);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {parentCategories.slice(0, 4).map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              image={category.image}
              productCount={category.productCount}
            />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

// In Home component, add after FeaturedProductsSection:
<FeaturedCategoriesSection />
```

---

## 4️⃣ Blog Integration (30 minutes)

### ✅ What You'll Get
- Blog listing page at `/blog`
- Individual blog post pages at `/blog/[slug]`
- Content marketing capability
- SEO benefits

### 📋 Implementation Steps

#### Step 1: Create Blog Listing Hook (10 min)

**Create `src/hooks/useSanityPosts.ts`:**

```typescript
"use client";

import { useState, useEffect } from "react";
import { sanityFetch } from "@/lib/sanity/client";
import type { SanityPost } from "@/types/sanity";

export function useSanityPosts() {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const query = `*[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          publishedAt,
          "mainImage": mainImage.asset->url,
          "author": author->{name, "image": image.asset->url}
        }`;

        const result = await sanityFetch<SanityPost[]>({ query });
        setPosts(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading, error };
}

export function useSanityPost(slug: string) {
  const [post, setPost] = useState<SanityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const query = `*[_type == "post" && slug.current == $slug][0] {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          publishedAt,
          body,
          "mainImage": mainImage.asset->url,
          "author": author->{name, "image": image.asset->url}
        }`;

        const result = await sanityFetch<SanityPost>({ 
          query, 
          params: { slug } 
        });
        setPost(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return { post, loading, error };
}
```

#### Step 2: Create Blog Pages (20 min)

**Create `src/app/blog/page.tsx`:**

```typescript
"use client";

import { useSanityPosts } from "@/hooks/useSanityPosts";
import { Header } from "@/components";
import Link from "next/link";
import { format } from "date-fns";

export default function BlogPage() {
  const { posts, loading, error } = useSanityPosts();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
            MASH Blog
          </h1>

          {loading && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center text-red-600">
              Error loading blog posts: {error}
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center text-muted-foreground">
              No blog posts yet. Check back soon!
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    {post.mainImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.mainImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        {post.author && (
                          <span className="font-medium">{post.author.name}</span>
                        )}
                        {post.publishedAt && (
                          <time dateTime={post.publishedAt}>
                            {format(new Date(post.publishedAt), "MMM d, yyyy")}
                          </time>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
```

**Create `src/app/blog/[slug]/page.tsx`:**

```typescript
"use client";

import { use } from "react";
import { useSanityPost } from "@/hooks/useSanityPosts";
import { Header } from "@/components";
import { format } from "date-fns";
import { PortableText } from "@portabletext/react";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { post, loading, error } = useSanityPost(slug);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading && (
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-600">
              Error loading post: {error}
            </div>
          )}

          {!loading && !error && !post && (
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
              <p className="text-muted-foreground">
                The blog post you're looking for doesn't exist.
              </p>
            </div>
          )}

          {!loading && !error && post && (
            <article className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="text-xl text-muted-foreground mb-6">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {post.author && (
                    <div className="flex items-center gap-2">
                      {post.author.image && (
                        <img
                          src={post.author.image}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <span className="font-medium">{post.author.name}</span>
                    </div>
                  )}
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>
                      {format(new Date(post.publishedAt), "MMMM d, yyyy")}
                    </time>
                  )}
                </div>
              </header>

              {post.mainImage && (
                <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                  <img
                    src={post.mainImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {post.body && (
                <div className="prose prose-lg max-w-none">
                  <PortableText value={post.body} />
                </div>
              )}
            </article>
          )}
        </div>
      </main>
    </>
  );
}
```

**Install PortableText renderer:**

```bash
npm install @portabletext/react date-fns
```

---

## 5️⃣ Analytics Integration (30 minutes)

### ✅ What You'll Get
- Track page views
- Monitor user behavior
- Track e-commerce events
- Conversion tracking

### 📋 Implementation Steps

#### Step 1: Choose Analytics Provider (5 min)

**Recommended:**
- **Google Analytics 4** - Free, comprehensive
- **Plausible** - Privacy-friendly alternative
- **Vercel Analytics** - Built-in for Vercel users

#### Step 2: Install Google Analytics (10 min)

**Install package:**

```bash
npm install react-ga4
```

**Create `src/lib/analytics.ts`:**

```typescript
import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "");
};

export const logPageView = (url: string) => {
  ReactGA.send({ hitType: "pageview", page: url });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};

export const logEcommerceEvent = (eventName: string, params: any) => {
  ReactGA.event(eventName, params);
};
```

**Update `src/app/layout.tsx`:**

```typescript
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, logPageView } from "@/lib/analytics";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize GA on mount
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      initGA();
    }
  }, []);

  useEffect(() => {
    // Log page view on route change
    if (pathname && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      logPageView(pathname);
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Step 3: Add E-Commerce Tracking (15 min)

**Update `ProductCard` component:**

```typescript
import { logEcommerceEvent } from "@/lib/analytics";

const handleAddToCart = () => {
  // Existing add to cart logic...
  
  // Track event
  logEcommerceEvent("add_to_cart", {
    currency: "PHP",
    value: price,
    items: [{
      item_id: id,
      item_name: name,
      price: price,
      quantity: 1,
    }],
  });
};
```

**Track product views in `src/app/(shop)/product/[slug]/page.tsx`:**

```typescript
import { logEcommerceEvent } from "@/lib/analytics";

useEffect(() => {
  if (product) {
    logEcommerceEvent("view_item", {
      currency: "PHP",
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
      }],
    });
  }
}, [product]);
```

**Add to `.env.local`:**

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## 📊 Implementation Checklist

### Phase 1: Production Deployment ⏳ READY
- [ ] Create `.env.production` file
- [ ] Update `vercel.json` configuration
- [ ] Deploy to Vercel (CLI or dashboard)
- [ ] Configure CORS in Sanity dashboard
- [ ] Test production site

### Phase 2: Performance Optimization ⏳ READY
- [ ] Enable ISR on shop page
- [ ] Enable ISR on product detail pages
- [ ] Enable ISR on homepage
- [ ] Optimize image configuration
- [ ] Add metadata for SEO

### Phase 3: Category Showcase ⏳ READY
- [ ] Verify `useSanityCategories()` hook works
- [ ] Create `CategoryCard` component
- [ ] Create `FeaturedCategoriesSection` component
- [ ] Add section to homepage
- [ ] Test category navigation

### Phase 4: Blog Integration ⏳ READY
- [ ] Create `useSanityPosts.ts` hook
- [ ] Install dependencies (`@portabletext/react`, `date-fns`)
- [ ] Create blog listing page
- [ ] Create blog post detail page
- [ ] Add blog posts in Sanity Studio
- [ ] Test blog pages

### Phase 5: Analytics Integration ⏳ READY
- [ ] Choose analytics provider (GA4 recommended)
- [ ] Install `react-ga4` package
- [ ] Create analytics utility functions
- [ ] Update root layout for page tracking
- [ ] Add e-commerce event tracking
- [ ] Test analytics in production

---

## 🧪 Testing Guide

### For Each Enhancement:

1. **Functionality Test** (5 min)
   - Feature works as expected
   - No console errors
   - UI looks correct

2. **Performance Test** (3 min)
   - Check Chrome DevTools Lighthouse
   - Verify fast page loads
   - Check Core Web Vitals

3. **Mobile Test** (2 min)
   - Responsive layout
   - Touch interactions work
   - No horizontal scroll

4. **Cross-Browser Test** (5 min)
   - Test in Chrome, Firefox, Safari
   - Check for visual bugs
   - Verify feature compatibility

---

## 📈 Success Metrics

### Production Deployment
- ✅ Site accessible at production URL
- ✅ All environment variables configured
- ✅ CORS working correctly
- ✅ Automatic deployments on push

### Performance
- ✅ Lighthouse score > 90
- ✅ First Contentful Paint < 1.5s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1

### Category Showcase
- ✅ Categories display correctly
- ✅ Navigation to filtered shop works
- ✅ Responsive on all devices

### Blog Integration
- ✅ Blog listing page loads
- ✅ Individual posts display correctly
- ✅ Rich text content renders properly
- ✅ Author and date show correctly

### Analytics
- ✅ Page views tracked
- ✅ E-commerce events fire correctly
- ✅ Data appears in dashboard
- ✅ Real-time tracking works

---

## 🎉 What's Next After All Enhancements?

**You'll have:**
- ✅ Production-ready MASH platform
- ✅ Full Sanity CMS integration (all 5 phases)
- ✅ Optimized performance
- ✅ Blog for content marketing
- ✅ Category navigation
- ✅ Analytics tracking

**Future Enhancements (Optional):**
- User authentication system (Clerk/Auth.js)
- Shopping cart persistence
- Order management system
- Payment integration (Stripe/PayPal)
- Email notifications
- Admin dashboard
- Mobile app (React Native)

---

## 📞 Need Help?

**Documentation:**
- See `.github/PHASE_5_COMPLETE.md` for current status
- See `.github/NEXT_STEPS_GUIDE.md` for progress tracker
- See `.github/DUAL_CMS_ARCHITECTURE.md` for architecture overview

**Common Issues:**
- **Vercel deployment fails:** Check environment variables
- **Images not loading:** Verify Sanity CORS configuration
- **ISR not working:** Check `revalidate` export in pages
- **Analytics not tracking:** Verify GA measurement ID

**AI Assistance:**
Tell your AI assistant:
```
I've completed Phase 5. Please help me implement [enhancement name] from OPTIONAL_ENHANCEMENTS_GUIDE.md
```

---

**Date Created:** November 19, 2025  
**Last Updated:** November 19, 2025  
**Status:** ✅ Ready for Implementation
