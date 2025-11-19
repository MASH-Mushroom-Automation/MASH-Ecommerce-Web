# 📋 Quick Copy-Paste Checklist - Sanity CMS Migration

Use this checklist to track what you've copied from the J5 Pharmacy project to your new codebase.

---

## ✅ Phase 1: Studio Setup

### Files to Copy from `j5ecommerce/studio/` → Your `studio/`

- [ ] **Schema Documents** (`src/schemaTypes/documents/`)
  - [ ] `category.ts` - Category with parent/child hierarchy
  - [ ] `product.ts` - Product with promo system & stock
  - [ ] `page.ts` - Page builder system
  - [ ] `post.ts` - Blog posts
  - [ ] `person.ts` - Authors

- [ ] **Schema Objects** (`src/schemaTypes/objects/`)
  - [ ] `blockContent.tsx` - Rich text configuration
  - [ ] `callToAction.ts` - CTA blocks
  - [ ] `infoSection.ts` - Info sections
  - [ ] `link.ts` - Link resolver (discriminated union)

- [ ] **Schema Singletons** (`src/schemaTypes/singletons/`)
  - [ ] `settings.tsx` - Site-wide settings
  - [ ] `featuredProducts.ts` - Featured products
  - [ ] `heroCarousel.ts` - Homepage carousel

- [ ] **Schema Index**
  - [ ] `src/schemaTypes/index.ts` - Schema registry

- [ ] **Structure**
  - [ ] `src/structure/index.ts` - Studio UI customization

- [ ] **Library**
  - [ ] `src/lib/initialCategories.ts` - Sample data
  - [ ] `src/lib/initialValues.ts` - Default values

### Configuration Files to Create/Copy

- [ ] `sanity.config.ts` - Main Studio config
  ```typescript
  // Copy template from SANITY_MIGRATION_GUIDE.md Part 4.1
  // Update: projectId, dataset, title, previewUrl
  ```

- [ ] `sanity.cli.ts` - CLI config
  ```typescript
  // Copy template from SANITY_MIGRATION_GUIDE.md Part 4.2
  // Update: projectId, dataset, studioHost
  ```

- [ ] `sanity-typegen.json` - Type generation config
  ```json
  // Copy from SANITY_MIGRATION_GUIDE.md Part 4.3
  ```

- [ ] `tsconfig.json` - TypeScript config
  ```json
  // Copy from SANITY_MIGRATION_GUIDE.md Part 4.4
  ```

- [ ] `package.json` - Studio dependencies
  ```json
  // Copy from SANITY_MIGRATION_GUIDE.md Part 4 (Step 4)
  ```

- [ ] `.env.local` - Environment variables
  ```bash
  SANITY_STUDIO_PROJECT_ID="your-id-here"
  SANITY_STUDIO_DATASET="production"
  SANITY_STUDIO_PREVIEW_URL="http://localhost:3000"
  ```

- [ ] `.env.example` - Environment template
  ```bash
  # Copy from SANITY_MIGRATION_GUIDE.md Part 4.5
  ```

---

## ✅ Phase 2: Frontend Integration

### Files to Copy from `j5ecommerce/frontend/sanity/lib/` → Your `[app]/sanity/lib/`

- [ ] **Core Files**
  - [ ] `api.ts` - API configuration (project ID, dataset, version)
  - [ ] `client.ts` - Sanity client instance with stega mode
  - [ ] `live.ts` - Live Content API setup (`sanityFetch`, `SanityLive`)
  - [ ] `token.ts` - Read token (server-only)
  - [ ] `writeToken.ts` - Write token for mutations (server-only)
  - [ ] `utils.ts` - Helper functions (image URLs, link resolver, dataAttr)
  - [ ] `demo.ts` - Demo/fallback content

- [ ] **GROQ Queries**
  - [ ] `queries.ts` - All queries (products, categories, pages, posts)
    - Contains: `allProductsQuery`, `productQuery`, `allCategoriesQuery`, `mainCategoriesQuery`, `featuredProductsQuery`, `heroCarouselQuery`, `promoProductsQuery`, etc.

### Create These Files in Your App

- [ ] `.env.local` - Frontend environment variables
  ```bash
  # Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID="your-id"
  NEXT_PUBLIC_SANITY_DATASET="production"
  NEXT_PUBLIC_SANITY_API_VERSION="2025-09-25"
  NEXT_PUBLIC_SANITY_STUDIO_URL="http://localhost:3333"
  
  # Tokens
  SANITY_API_READ_TOKEN="your-read-token"
  SANITY_API_WRITE_TOKEN="your-write-token"
  ```

- [ ] `.env.example` - Template for other developers
  ```bash
  # Copy all required variables from your .env.local
  ```

- [ ] `package.json` - Add scripts
  ```json
  {
    "scripts": {
      "predev": "npm run typegen",
      "prebuild": "npm run typegen",
      "typegen": "cd ../studio && npm run extract-types && cp sanity.types.ts ../your-app/"
    }
  }
  ```

### Install Dependencies

```bash
cd your-app
npm install next-sanity@latest @sanity/client@latest @sanity/image-url@latest
npm install --save-dev sanity@latest
```

---

## ✅ Phase 3: Update Import Paths

After copying files, update all import paths to match your project structure.

### In `sanity/lib/*.ts` files, find and replace:

```typescript
// FROM (J5 Pharmacy):
import { something } from '@/sanity/lib/api'

// TO (Your project):
// Check your tsconfig.json for path aliases
// Common patterns:
import { something } from '@/sanity/lib/api'  // If using @/ alias
import { something } from '~/sanity/lib/api'  // If using ~/ alias
import { something } from '../sanity/lib/api' // Relative path
```

### Files That Need Path Updates:
- [ ] `sanity/lib/client.ts` - imports from `api.ts` and `token.ts`
- [ ] `sanity/lib/live.ts` - imports from `client.ts` and `token.ts`
- [ ] `sanity/lib/utils.ts` - imports from `api.ts`
- [ ] Any component using Sanity queries

---

## ✅ Phase 4: Root Configuration

### Update Root `package.json`

```json
{
  "workspaces": [
    "studio",
    "your-app-folder"
  ],
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:studio": "npm run dev --workspace=studio",
    "dev:app": "npm run dev --workspace=your-app-folder"
  },
  "devDependencies": {
    "npm-run-all2": "^5.0.2"
  }
}
```

Install root dependencies:
```bash
npm install
```

---

## ✅ Phase 5: Generated Files

These files are auto-generated but keep for reference:

- [ ] `studio/sanity.types.ts` - Generated TypeScript types from schema
- [ ] `studio/schema.json` - Extracted schema JSON
- [ ] Copy `sanity.types.ts` to your app root after generation

Generate types:
```bash
cd studio
npm run extract-types
cp sanity.types.ts ../your-app/
```

---

## ✅ Phase 6: Verification Tests

### Test Studio (Port 3333)

```bash
cd studio
npm run dev
```

Open `http://localhost:3333` and check:
- [ ] Studio loads without errors
- [ ] All document types appear in menu (Products, Categories, Pages, Posts, People)
- [ ] Singletons appear in sidebar (Settings, Featured Products, Hero Carousel)
- [ ] Can create a test category
- [ ] Can create a test product (with category reference)
- [ ] Preview URLs work (click "Open preview")

### Test Frontend Integration

Create test page:
```typescript
// app/test-sanity/page.tsx
import { sanityFetch } from '@/sanity/lib/live'
import { allCategoriesQuery } from '@/sanity/lib/queries'

export default async function TestPage() {
  const { data } = await sanityFetch({
    query: allCategoriesQuery,
    stega: false,
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sanity Connection Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
```

Visit `/test-sanity` and check:
- [ ] Page loads without errors
- [ ] Categories display in JSON
- [ ] No TypeScript errors in VS Code
- [ ] Console shows no errors

---

## ✅ Phase 7: Optional - Copy Example Components

If you want to see working examples of how to use the Sanity data:

### From `j5ecommerce/frontend/app/components/`

**Product Components:**
- [ ] `ProductCard.tsx` - Product card with promo badges
- [ ] `AddToCartButton.tsx` - Add to cart with stock check
- [ ] `FeaturedProducts.tsx` - Featured products section

**Content Components:**
- [ ] `BlockRenderer.tsx` - Page builder block mapper
- [ ] `PageBuilder.tsx` - Main page builder component
- [ ] `Cta.tsx` - Call to action block
- [ ] `InfoSection.tsx` - Info section block
- [ ] `ResolvedLink.tsx` - Link resolver component
- [ ] `PortableText.tsx` - Rich text renderer

**Layout Components:**
- [ ] `HeroCarousel.tsx` - Homepage hero carousel
- [ ] `ShopByCategorySanity.tsx` - Category grid

**Blog Components:**
- [ ] `BlogPostCard.tsx` - Blog post card
- [ ] `Posts.tsx` - Posts list
- [ ] `LatestBlogPosts.tsx` - Recent posts section

**Note:** These components have dependencies on:
- Your styling system (Tailwind CSS)
- Your routing (Next.js Link or other)
- Your cart system (if using)

You'll need to adapt them to your project structure.

---

## ✅ Phase 8: Data Migration

If you have existing products:

- [ ] Review `SANITY_MIGRATION_GUIDE.md` Part 7 (AI Prompts)
- [ ] Use **PROMPT 9: Data Migration Script**
- [ ] Prepare your existing data source
- [ ] Run migration script in dry-run mode first
- [ ] Execute actual migration
- [ ] Verify products in Studio

---

## 📊 Progress Tracker

Mark your overall progress:

- [ ] **Phase 1 Complete** - Studio set up and running
- [ ] **Phase 2 Complete** - Frontend integration working
- [ ] **Phase 3 Complete** - Import paths updated
- [ ] **Phase 4 Complete** - Root config updated
- [ ] **Phase 5 Complete** - Types generating successfully
- [ ] **Phase 6 Complete** - All verification tests passing
- [ ] **Phase 7 Complete** - Example components copied (optional)
- [ ] **Phase 8 Complete** - Data migrated (if applicable)

---

## 🎯 Success Criteria

Your migration is complete when:

1. ✅ `npm run dev` starts both studio (3333) and app
2. ✅ Studio opens at `http://localhost:3333`
3. ✅ Can create products and categories in Studio
4. ✅ Types auto-generate on dev/build
5. ✅ Frontend can fetch and display Sanity data
6. ✅ Images load from Sanity CDN
7. ✅ No TypeScript errors
8. ✅ Category hierarchy works (main → subcategories)
9. ✅ Product promo system displays correctly
10. ✅ Stock tracking updates properly

---

## 📝 Notes Section

Use this space to track your customizations:

```
Project Name: _________________________
Started: ___/___/_____
Completed: ___/___/_____

Custom Schema Changes:
- 
- 

Issues Encountered:
- 
- 

Customizations Made:
- 
- 

Environment Specific Notes:
- 
- 
```

---

## 🆘 Quick Links

- **Full Migration Guide**: `SANITY_MIGRATION_GUIDE.md`
- **AI Prompts**: `AI_PROMPTS_FOR_MIGRATION.md`
- **Sanity Docs**: https://www.sanity.io/docs
- **GROQ Playground**: https://groq.dev
- **J5 Pharmacy Source**: Reference this repo for examples

---

## 🎉 Post-Migration Tasks

After successful migration:

- [ ] Update your README with Sanity setup instructions
- [ ] Document your custom schema changes
- [ ] Set up CORS origins in Sanity (https://sanity.io/manage)
- [ ] Configure webhooks if needed (for cache invalidation)
- [ ] Set up Sanity deploy preview (if using Vercel/Netlify)
- [ ] Train team members on Studio usage
- [ ] Set up content approval workflow (if needed)
- [ ] Configure backup strategy
- [ ] Monitor API usage (check Sanity dashboard)

---

**Last Updated**: November 19, 2025
**Based On**: J5 Pharmacy E-Commerce (j5ecommerce)
**Sanity Version**: v3.68+
**Next.js Version**: v15.5+

---

💾 **Keep this checklist handy during migration!**
🔄 **Check off items as you complete them**
📋 **Print or save for offline reference**
