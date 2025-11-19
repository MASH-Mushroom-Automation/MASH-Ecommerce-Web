# 🤖 AI Prompts - Copy & Paste for Sanity CMS Migration

This file contains ready-to-use AI prompts for setting up Sanity CMS in your other codebase. Copy the relevant prompts and paste them into your AI assistant (GitHub Copilot, ChatGPT, Claude, etc.).

---

## 🚀 PROMPT 1: Initial Sanity Setup

**When to use:** Starting fresh, need complete Sanity Studio setup

**Copy this prompt:**

```
I need to set up Sanity CMS v3 in this existing [Next.js/React/other] project for an e-commerce pharmacy website. This setup is based on a working implementation from another codebase.

PROJECT REQUIREMENTS:
- Create a `studio/` workspace folder at project root
- Set up monorepo with npm workspaces (studio + main app)
- Install Sanity Studio v3 with TypeScript support
- Configure for e-commerce with products, categories, and content management
- Enable real-time content updates via Live Content API
- Auto-generate TypeScript types from schema

ARCHITECTURE:
- Studio runs on port 3333 (separate from main app)
- Schema organized into documents/, objects/, and singletons/
- Use defineQuery for type-safe GROQ queries
- Sanity client with CDN caching and stega mode for visual editing

PROVIDE:
1. Complete file structure to create
2. Package.json configurations (root + studio)
3. All necessary config files (sanity.config.ts, tsconfig.json, etc.)
4. Installation commands in sequence
5. Environment variables needed
6. Scripts for dev, build, and type generation

Assume I will paste schema files from the source project after setup is complete.
```

---

## 📦 PROMPT 2: Schema Files Integration

**When to use:** After basic setup, ready to add e-commerce schema

**Copy this prompt:**

```
I've set up a Sanity Studio workspace and now need to integrate the e-commerce schema from another project. I have these schema files ready to paste:

SCHEMA TYPES:
- **Product**: name, slug, price, quantity, category reference, promo system (isOnPromo, promoType, promoPercentage/promoPrice)
- **Category**: name, slug, description, image, parentCategory (for hierarchy)
- **Page**: page builder with modular blocks (CTA, InfoSection)
- **Post**: blog posts with author, date, content
- **Person**: authors for blog posts
- **Settings** (singleton): site-wide configuration
- **FeaturedProducts** (singleton): homepage featured products
- **HeroCarousel** (singleton): homepage carousel slides

OBJECTS:
- blockContent: rich text configuration
- callToAction: CTA blocks with links
- infoSection: content sections
- link: discriminated union (href | page | post)

HELP ME:
1. Set up the correct file structure in `studio/src/schemaTypes/`
2. Create index.ts to export all schema types
3. Configure the Studio to recognize singletons (show in sidebar)
4. Set up custom structure for better UX (hide singletons from main list)
5. Add initial values for products and categories
6. Configure preview components for each document type

Where do I paste each schema file? Provide the complete directory structure.
```

---

## 🔗 PROMPT 3: Frontend Integration

**When to use:** Studio is working, need to connect to your app

**Copy this prompt:**

```
I have Sanity Studio running with an e-commerce schema (products, categories, blog posts). Now I need to integrate it with my [Next.js 15 App Router / Next.js Pages / React / other framework] application.

CURRENT SETUP:
- Studio runs on localhost:3333
- Schema includes: products, categories, pages, posts, settings
- Products have promo system and stock tracking
- Categories have parent/child hierarchy

INTEGRATION REQUIREMENTS:
1. Create sanity/lib/ folder with:
   - Client configuration (with CDN, tokens, stega mode)
   - Live Content API setup for real-time updates
   - GROQ queries for all content types
   - Utility functions (image URLs, link resolution)
   - Type-safe query definitions

2. Set up environment variables for:
   - Project ID and dataset
   - Read token (for fetching)
   - Write token (for stock updates)
   - Studio URL (for preview links)

3. Configure TypeScript:
   - Auto-generate types from schema
   - Import generated types in app
   - Type-safe query results

4. Set up build pipeline:
   - Pre-dev hook to generate types
   - Pre-build hook to ensure types are fresh

PROVIDE:
- Complete sanity/lib/ file structure with all files
- Configuration code for each file
- Environment variable template
- Package.json scripts for type generation
- Example query for fetching products with categories

My framework is: [specify your framework and version]
```

---

## 📝 PROMPT 4: Product Listing Page

**When to use:** Ready to display products from Sanity

**Copy this prompt:**

```
Create a complete product listing page that fetches from Sanity CMS and displays products with filtering.

SANITY SCHEMA:
- Products have: name, slug, price, quantity, image, category (reference), isOnPromo, promoType, promoPercentage, promoPrice
- Categories have: name, slug, parentCategory (for hierarchy)

REQUIREMENTS:
1. Fetch all products using GROQ query from sanity/lib/queries.ts
2. Display as a grid of product cards showing:
   - Product image (from Sanity CDN)
   - Product name
   - Regular price (with strikethrough if on promo)
   - Promo price (if isOnPromo = true)
   - Promo badge (percentage or fixed discount)
   - "Out of Stock" badge if quantity = 0
   - Category name
   - "Add to Cart" button (disabled if out of stock)

3. Add filtering sidebar:
   - Filter by category (checkboxes)
   - Filter by availability (in stock / out of stock)
   - Filter by promo status (on sale / all)
   - Price range slider

4. Add sorting dropdown:
   - Price: Low to High
   - Price: High to Low
   - Name: A-Z
   - Newest First

5. Implement with:
   - Server-side rendering (or SSG with ISR)
   - Real-time updates using Sanity Live Content API
   - TypeScript with generated Sanity types
   - Responsive design (mobile-first)
   - Loading states
   - Empty states

My framework: [Next.js 15 App Router / Pages Router / React / other]
My styling: [Tailwind CSS / CSS Modules / Styled Components / other]

Provide complete implementation with proper TypeScript types.
```

---

## 🛍️ PROMPT 5: Product Detail Page

**When to use:** Need individual product pages

**Copy this prompt:**

```
Create a complete product detail page (single product view) using Sanity CMS data.

SANITY PRODUCT SCHEMA:
- name, slug, price, quantity, image, description
- category (reference with name and slug)
- isOnPromo, promoType, promoPercentage, promoPrice
- sku (optional), isAvailable

PAGE REQUIREMENTS:
1. Fetch single product by slug using GROQ query
2. Display:
   - Large product image (zoomable on hover/click)
   - Product name (H1)
   - Category breadcrumb (Home > Category > Product)
   - SKU if available
   - Price display:
     * Show regular price with strikethrough if on promo
     * Show promo price with discount badge
     * Calculate savings amount
   - Full product description (rendered as rich text if using blockContent)
   - Stock indicator:
     * "In Stock" (green) if quantity > 10
     * "Only X left" (orange) if quantity 1-10
     * "Out of Stock" (red) if quantity = 0
   - Quantity selector (1 to min(quantity, 10))
   - "Add to Cart" button (disabled if out of stock)

3. Add related products section:
   - Query products from same category
   - Exclude current product
   - Show 4 related products
   - Same card design as listing page

4. Add structured data (JSON-LD):
   - Product schema for SEO
   - Include price, availability, image

5. Implement with:
   - Dynamic route: /products/[slug]
   - generateStaticParams for all product slugs
   - ISR with revalidation
   - TypeScript with Sanity types
   - Image optimization with next/image
   - Meta tags (title, description, OG image)

My framework: [Next.js 15 App Router / Pages Router / other]
My styling: [Tailwind CSS / other]

Provide complete implementation.
```

---

## 🏷️ PROMPT 6: Category Page with Hierarchy

**When to use:** Need category pages with subcategory support

**Copy this prompt:**

```
Create a category page that handles both main categories and subcategories using Sanity's category hierarchy.

SANITY CATEGORY SCHEMA:
- name, slug, description, image
- parentCategory (reference to another category, nullable)
- Hierarchy: Main Category → Subcategory → Products

REQUIREMENTS:
1. Handle two scenarios:
   A. Main category page: Show all subcategories + products from all subcategories
   B. Subcategory page: Show only products from that specific subcategory

2. Category header:
   - Category name (H1)
   - Category description
   - Category image (hero/banner)
   - Breadcrumb: Home > [Main Category] > [Subcategory if applicable]

3. Subcategories section (only on main category pages):
   - Grid of subcategory cards
   - Each card: image, name, product count
   - Click navigates to subcategory page

4. Products section:
   - Reuse product card component from listing page
   - Filter and sort controls
   - Pagination (20 products per page)

5. GROQ queries needed:
   - Fetch category by slug with parent info
   - Fetch all subcategories of a main category
   - Fetch products by category slug
   - Count products per subcategory

6. Dynamic routing:
   - /categories/[slug] for both main and subcategories
   - generateStaticParams for all categories
   - ISR with revalidation

My framework: [Next.js 15 App Router / other]
TypeScript with Sanity generated types required.

Provide complete implementation with all queries and components.
```

---

## 🎨 PROMPT 7: Page Builder Implementation

**When to use:** Want to use Sanity's modular page builder

**Copy this prompt:**

```
Implement a complete page builder system using Sanity's pageBuilder array field.

SANITY PAGE SCHEMA:
- Page has: name, slug, heading, subheading, pageBuilder array
- pageBuilder accepts these block types:
  * callToAction: heading, text, link (with linkResolver), buttonText
  * infoSection: heading, content (rich text with links)

LINK SCHEMA (discriminated union):
- linkType: 'href' | 'page' | 'post'
- href: external URL (if linkType = 'href')
- page: reference to page (if linkType = 'page')
- post: reference to post (if linkType = 'post')

REQUIREMENTS:
1. Create <PageBuilder> component:
   - Accepts pageBuilder array from Sanity
   - Maps each block to appropriate component
   - Handles unknown block types gracefully

2. Create <BlockRenderer> component:
   - Switches based on _type field
   - Renders CallToAction or InfoSection
   - Extensible for future block types

3. Create <CallToAction> component:
   - Displays heading, text, button
   - Uses <ResolvedLink> for button
   - Styled with container, gradient backgrounds

4. Create <InfoSection> component:
   - Renders rich text content
   - Uses PortableText with custom marks
   - Handles inline links with linkResolver

5. Create <ResolvedLink> component:
   - Resolves all link types (href, page, post)
   - Handles internal links with Next.js Link
   - Handles external links with target="_blank"
   - Falls back gracefully if link is invalid

6. GROQ query:
   - Fetch page by slug
   - Expand pageBuilder blocks
   - Expand link references inline
   - Provide example query

My framework: [Next.js 15 App Router / other]
My styling: [Tailwind CSS / other]

Provide complete implementation with all components and queries.
```

---

## 📊 PROMPT 8: Stock Management (Admin)

**When to use:** Need to update product stock from your app

**Copy this prompt:**

```
Create an admin feature to manage product stock levels using Sanity's write API.

REQUIREMENTS:
1. Stock management page (/admin/stock):
   - List all products with current stock
   - Show: name, SKU, current quantity, status
   - Inline edit quantity field
   - Bulk update button

2. Server Action (Next.js) or API route:
   - Use Sanity write client with SANITY_API_WRITE_TOKEN
   - Update product quantity by product ID
   - Atomic update (use patch with set)
   - Validate quantity (must be >= 0)
   - Return updated product

3. Stock update function:
   - Decrement stock when order is placed
   - Accept array of {productId, quantityPurchased}
   - Use Sanity transaction for atomicity
   - Handle errors (product not found, insufficient stock)

4. Stock alerts:
   - Highlight products with quantity < 10 (orange)
   - Highlight products with quantity = 0 (red)
   - Show total products, in stock, low stock, out of stock

5. Security:
   - Protect admin routes with authentication
   - Verify write token is set
   - Log all stock changes

SANITY PRODUCT FIELDS:
- _id, name, sku, quantity (number)

My framework: [Next.js 15 App Router with Server Actions / API Routes]

Provide:
- Complete admin page component
- Server action / API route for stock updates
- Sanity write client setup
- Error handling
```

---

## 🔄 PROMPT 9: Data Migration Script

**When to use:** Migrating existing products to Sanity

**Copy this prompt:**

```
Create a Node.js migration script to import existing product data into Sanity CMS.

MY CURRENT DATA SOURCE:
[Specify: CSV file / JSON file / MySQL database / API / other]

CURRENT PRODUCT STRUCTURE:
{
  name: string,
  price: number,
  sku: string,
  description: string,
  category: string (name),
  stock: number,
  imageUrl: string (external URL)
}

SANITY TARGET STRUCTURE:
- Products need: name, slug, price, quantity, description, sku, isAvailable
- Category is a reference (need to match by name or create)
- Images must be uploaded to Sanity CDN (from URLs)
- slug must be generated from name (lowercase, hyphenated)

SCRIPT REQUIREMENTS:
1. Read products from [my data source]
2. For each product:
   - Generate slug from name
   - Match/create category by name
   - Download image from URL
   - Upload image to Sanity CDN
   - Create product document with all fields
   - Link to category reference
   - Set default values (isOnPromo = false, isAvailable = true)

3. Handle errors:
   - Skip invalid products (log error)
   - Retry image uploads on failure
   - Don't stop on single product failure
   - Generate error report

4. Provide progress tracking:
   - Show progress bar
   - Log successful imports
   - Count total, successful, failed
   - Generate summary at end

5. Dry run mode:
   - Test without writing to Sanity
   - Validate data structure
   - Show what would be created

PROVIDE:
- Complete Node.js script
- Instructions to run
- Required npm packages
- Environment variables needed
- Example command with options

Use: @sanity/client for API, @sanity/image-url for uploads
```

---

## 🎯 PROMPT 10: Featured Products & Homepage

**When to use:** Setting up homepage with featured/promo products

**Copy this prompt:**

```
Create a homepage that uses Sanity singletons for dynamic content.

SANITY SINGLETONS:
1. heroCarousel: slides array with {title, description, image, buttonText, buttonLink}
2. featuredProducts: products array (references to product documents)

HOMEPAGE REQUIREMENTS:
1. Hero Carousel Component:
   - Auto-rotating slides (configurable interval)
   - Manual navigation (prev/next buttons, dots)
   - Images from Sanity CDN (optimized)
   - CTA button with link resolution
   - Smooth transitions
   - Pause on hover
   - Mobile responsive

2. Featured Products Section:
   - Section heading from singleton
   - Product grid (4 columns desktop, 2 tablet, 1 mobile)
   - Product cards showing: image, name, price, promo badge
   - "View All Products" link

3. Promo Products Section:
   - Query products where isOnPromo = true
   - Show top 8 promo products
   - Highlight discount percentage/amount
   - Countdown timer if promo has expiry (future feature)

4. Categories Preview:
   - Show all main categories (no parent)
   - Category card: image, name, product count
   - Link to category page

5. Real-time Updates:
   - Use Sanity Live Content API
   - Content updates without page refresh
   - Show preview mode indicator if in draft mode

GROQ QUERIES NEEDED:
- heroCarouselQuery: fetch singleton with slides
- featuredProductsQuery: fetch singleton with product refs expanded
- promoProductsQuery: fetch products where isOnPromo = true
- mainCategoriesQuery: fetch categories without parent

My framework: [Next.js 15 App Router / other]
My styling: [Tailwind CSS / other]

Provide complete homepage implementation with all components and queries.
```

---

## 🔍 PROMPT 11: Search Functionality

**When to use:** Adding product search

**Copy this prompt:**

```
Implement comprehensive product search using Sanity GROQ queries.

SEARCH REQUIREMENTS:
1. Search bar component:
   - Search input with icon
   - Live search (as you type)
   - Debounced API calls (300ms)
   - Loading spinner
   - Results dropdown
   - "View all results" link

2. Search page (/search):
   - Full results view
   - Query from URL parameter (?q=search-term)
   - Filter and sort controls
   - Pagination
   - Empty state ("No results for...")

3. Search logic:
   - Search in: product name, description, SKU
   - Match categories by name
   - Case-insensitive
   - Partial word matching
   - Rank by relevance (name > description > SKU)

4. GROQ search query:
   - Use filters: name match, description match, category match
   - Score by field (name = highest priority)
   - Order by relevance, then by name
   - Limit results

5. Search analytics (optional):
   - Track search terms
   - Store in Sanity (searchLog document)
   - Show popular searches

Example GROQ query structure:
```groq
*[_type == "product" && (
  name match $searchTerm + "*" ||
  description match $searchTerm + "*" ||
  sku match $searchTerm + "*"
)] | order(_score desc)
```

My framework: [Next.js 15 App Router / other]

Provide: Search component, search page, GROQ queries, debounce logic.
```

---

## ⚡ PROMPT 12: Quick Setup (All-in-One)

**When to use:** Want everything at once, will customize later

**Copy this prompt:**

```
COMPLETE SANITY CMS E-COMMERCE SETUP

Set up a full Sanity CMS e-commerce system in this [Next.js 15 / other framework] project based on a working reference implementation.

WHAT I HAVE:
- Working Sanity Studio schema from another project (will paste files)
- Schema includes: products, categories, pages, posts, singletons
- Environment: [specify your tech stack]

WHAT I NEED:
1. Studio Setup:
   - Complete file structure
   - All config files
   - Schema integration
   - Type generation

2. Frontend Integration:
   - Sanity client setup
   - GROQ queries library
   - Utility functions
   - TypeScript types

3. Core Pages:
   - Product listing with filters
   - Product detail pages
   - Category pages (with hierarchy)
   - Homepage with featured products
   - Search functionality

4. Admin Features:
   - Stock management
   - Content preview

5. Data Migration:
   - Script to import existing products
   - Image upload to Sanity CDN

PROVIDE STEP-BY-STEP:
1. Installation commands (in order)
2. All file contents (complete, not snippets)
3. Environment variables required
4. How to run and test
5. Troubleshooting common issues

Reference implementation repository: j5ecommerce (Sanity + Next.js 15 + Firebase)

Start with the studio setup, then frontend integration, then pages. Provide complete code for each step.
```

---

## 💡 Tips for Using These Prompts

### 1. **Customize Before Sending**
Replace placeholders like `[Next.js 15 App Router / other]` with your actual tech stack.

### 2. **Send in Sequence**
For best results, use prompts 1-3 in order:
- Prompt 1: Basic setup
- Prompt 2: Schema integration  
- Prompt 3: Frontend connection
- Then use specific prompts (4-11) as needed

### 3. **Attach Context**
When using these prompts, also paste:
- Relevant schema files from this project
- Your current project structure
- Error messages if troubleshooting

### 4. **Iterate**
If the AI's response isn't quite right:
```
This is close but [specific issue]. Please adjust to [specific change].
```

### 5. **Reference Files**
Mention specific files from this project:
```
Based on the implementation in j5ecommerce/frontend/sanity/lib/queries.ts, create similar queries for...
```

---

## 📁 Files to Have Ready for Pasting

When using these prompts, keep these files open to paste when asked:

**Schema Files:**
- `studio/src/schemaTypes/documents/product.ts`
- `studio/src/schemaTypes/documents/category.ts`
- `studio/src/schemaTypes/documents/page.ts`
- `studio/src/schemaTypes/documents/post.ts`
- `studio/src/schemaTypes/singletons/settings.tsx`
- `studio/src/schemaTypes/singletons/featuredProducts.ts`
- `studio/src/schemaTypes/singletons/heroCarousel.ts`
- `studio/src/schemaTypes/objects/*.ts`

**Integration Files:**
- `frontend/sanity/lib/queries.ts` (all GROQ queries)
- `frontend/sanity/lib/client.ts` (client config)
- `frontend/sanity/lib/utils.ts` (helper functions)

**Config Files:**
- `studio/sanity.config.ts`
- `studio/package.json`
- Root `package.json` (workspace config)

---

## 🎓 Pro Tips

### Make AI Understand Your Schema
```
Before we start, here's my complete product schema:
[paste product.ts content]

This schema has these specific features:
1. Promo system with two types (percentage and fixed)
2. Stock tracking with quantity field
3. Category reference (not embedded)
4. Conditional validation (promo fields required if isOnPromo = true)

Keep this schema in mind for all subsequent responses.
```

### Get Better GROQ Queries
```
When writing GROQ queries, follow these patterns from the reference project:
- Always expand references inline with ->
- Use coalesce for fallbacks
- Define query fragments for reuse
- Use defineQuery() for type safety

Example from reference:
[paste a query from queries.ts]

Now create a query for [your requirement].
```

### Troubleshooting Prompt
```
I'm getting this error: [paste error]

Context:
- File: [file path]
- What I'm trying to do: [description]
- Relevant code: [paste code snippet]
- Environment: [Node version, framework version]

Based on the Sanity setup from j5ecommerce project, how do I fix this?
```

---

## ✅ Quick Checklist

Before using these prompts:
- [ ] Read SANITY_MIGRATION_GUIDE.md
- [ ] Have Sanity account and project ID
- [ ] Know your framework and version
- [ ] Have schema files ready to paste
- [ ] Understand your current data structure
- [ ] Set up environment variables template

After using prompts:
- [ ] Test studio runs without errors
- [ ] Verify types generate correctly
- [ ] Test data fetching in frontend
- [ ] Create sample products
- [ ] Verify images load from CDN
- [ ] Test category hierarchy
- [ ] Check promo calculations

---

## 🆘 Emergency Prompts

### If Nothing Works
```
I followed all setup steps but getting errors. Help me debug systematically:

1. My current setup:
   - Framework: [version]
   - Sanity version: [version]
   - Error message: [full error]

2. What I've tried:
   - [list steps]

3. Current file structure:
   - [show relevant structure]

4. Environment variables:
   - [list which ones are set]

Walk me through debugging step-by-step. Reference the j5ecommerce implementation for correct setup.
```

### If Types Don't Generate
```
TypeScript types aren't generating from my Sanity schema. 

Current setup:
- sanity-typegen.json: [paste content]
- tsconfig.json: [paste content]
- Schema exports: [paste schemaTypes/index.ts]

Reference working setup from j5ecommerce:
- [paste working config if available]

Help me debug the type generation pipeline.
```

---

**End of AI Prompts Collection**

💾 Save this file in your project for easy copy-paste access!
