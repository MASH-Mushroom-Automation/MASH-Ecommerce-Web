# Sanity CMS Migration Guide - E-Commerce Setup

This guide helps you set up the complete J5 Pharmacy Sanity CMS configuration in a different codebase while maintaining the same e-commerce data model.

---

## 🎯 Migration Overview

**What you're migrating:**
- Complete Sanity Studio with e-commerce schema (products, categories, orders)
- Content management system with page builder
- Product catalog with promo system and stock tracking
- Category hierarchy (main categories + subcategories)
- Hero carousel, featured products, and blog system

**What stays separate:**
- Your existing frontend UI/website code
- Your frontend routing and components
- Your styling and design system

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Existing project with Next.js (or your framework)
- [ ] Sanity account (free at https://sanity.io)
- [ ] Git initialized in your project
- [ ] Package manager (npm/pnpm/yarn)

---

## 🚀 Part 1: AI Setup Prompt

**Copy this prompt to your AI assistant in the other codebase:**

```
I need to set up Sanity CMS in this project using an existing schema from another codebase. This is for an e-commerce pharmacy website.

REQUIREMENTS:
1. Create a `studio/` folder at the root with Sanity Studio configuration
2. Install Sanity dependencies and configure for Next.js integration
3. Set up the following schema types (I'll provide the schema files):
   - Products (with promo system, stock tracking, category reference)
   - Categories (with parent/subcategory hierarchy)
   - Pages (with page builder)
   - Posts (blog system)
   - Settings (singleton for site-wide config)
   - Featured Products (singleton)
   - Hero Carousel (singleton)

4. Configure TypeScript type generation from schema
5. Set up Sanity client with Live Content API support
6. Create necessary GROQ queries for products, categories, and content

ARCHITECTURAL DECISIONS:
- Use Sanity Studio v3+ with TypeScript
- Enable real-time content updates via Live Content API
- Separate studio (port 3333) from main app
- Auto-generate types on dev/build
- Use monorepo structure with workspaces

WHAT I'LL PROVIDE:
- Complete schema files from the source project
- Example queries and integration patterns
- Environment variable requirements

Please provide:
1. Step-by-step installation commands
2. File structure to create
3. Configuration files needed
4. Instructions for where to paste my schema files
```

---

## 🔧 Part 2: Manual Setup Steps

### Step 1: Install Dependencies in Your Project Root

**Update `package.json` (root level):**

```json
{
  "workspaces": ["studio", "your-app-folder"],
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:studio": "npm run dev --workspace=studio"
  },
  "devDependencies": {
    "npm-run-all2": "^5.0.2"
  }
}
```

**Run installation:**
```bash
npm install
```

### Step 2: Create Studio Workspace

```bash
# Create studio directory
mkdir studio
cd studio

# Initialize package.json
npm init -y

# Install Sanity dependencies
npm install sanity@latest next-sanity@latest @sanity/vision@latest @sanity/icons@latest
npm install --save-dev @sanity/cli@latest typescript@latest
```

### Step 3: Create Studio File Structure

```bash
cd studio

# Create directories
mkdir -p src/schemaTypes/documents
mkdir -p src/schemaTypes/objects
mkdir -p src/schemaTypes/singletons
mkdir -p src/structure
mkdir -p src/lib
mkdir -p static/page-builder-thumbnails

# Create config files
touch sanity.config.ts
touch sanity.cli.ts
touch sanity-typegen.json
touch tsconfig.json
touch .env.local
touch .env.example
```

### Step 4: Configure Studio Package.json

**Replace `studio/package.json` with:**

```json
{
  "name": "studio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "sanity dev --port 3333",
    "start": "sanity start --port 3333",
    "build": "sanity build",
    "extract-types": "sanity schema extract --path schema.json && sanity typegen generate"
  },
  "dependencies": {
    "sanity": "^3.68.1",
    "@sanity/vision": "^3.68.1",
    "@sanity/icons": "^3.5.0",
    "next-sanity": "^10.0.14",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@sanity/cli": "^3.68.1",
    "typescript": "^5.7.3"
  }
}
```

---

## 📦 Part 3: Copy Schema Files

### From J5 Pharmacy Project → Your Project

**Copy these folders/files:**

```bash
# From j5ecommerce/studio/src/ → your-project/studio/src/

# Copy all schema files
cp -r schemaTypes/ your-project/studio/src/
cp -r structure/ your-project/studio/src/
cp -r lib/ your-project/studio/src/
```

**Files you're copying:**

```
studio/src/
├── schemaTypes/
│   ├── index.ts                    # Schema registry
│   ├── documents/
│   │   ├── category.ts             # Category with hierarchy
│   │   ├── product.ts              # Product with promos & stock
│   │   ├── page.ts                 # Page builder
│   │   ├── post.ts                 # Blog posts
│   │   └── person.ts               # Authors
│   ├── objects/
│   │   ├── blockContent.tsx        # Rich text config
│   │   ├── callToAction.ts         # CTA blocks
│   │   ├── infoSection.ts          # Info blocks
│   │   └── link.ts                 # Link resolver
│   └── singletons/
│       ├── settings.tsx            # Site settings
│       ├── featuredProducts.ts     # Featured products
│       └── heroCarousel.ts         # Homepage carousel
├── structure/
│   └── index.ts                    # Studio UI structure
└── lib/
    ├── initialCategories.ts        # Sample categories
    └── initialValues.ts            # Default values
```

---

## ⚙️ Part 4: Configuration Files

### 1. `studio/sanity.config.ts`

```typescript
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

export default defineConfig({
  name: 'default',
  title: 'Your Pharmacy CMS',
  projectId,
  dataset,
  plugins: [
    structureTool({structure}),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Configure preview URLs for your site
    productionUrl: async (prev, context) => {
      const {document} = context
      const baseUrl = previewUrl

      if (document._type === 'product') {
        return `${baseUrl}/products/${document.slug?.current}`
      }
      if (document._type === 'category') {
        return `${baseUrl}/categories/${document.slug?.current}`
      }
      if (document._type === 'post') {
        return `${baseUrl}/posts/${document.slug?.current}`
      }
      if (document._type === 'page') {
        return `${baseUrl}/${document.slug?.current}`
      }

      return prev
    },
  },
})
```

### 2. `studio/sanity.cli.ts`

```typescript
import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost: 'your-studio-name', // Change this
})
```

### 3. `studio/sanity-typegen.json`

```json
{
  "schema": "schema.json",
  "generates": {
    "./sanity.types.ts": {}
  }
}
```

### 4. `studio/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "dom", "dom.iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "sanity.config.ts", "sanity.cli.ts"],
  "exclude": ["node_modules"]
}
```

### 5. `studio/.env.example`

```bash
# Get these from https://sanity.io/manage
SANITY_STUDIO_PROJECT_ID="<your-project-id>"
SANITY_STUDIO_DATASET="production"

# URL where your main website runs (for previews)
SANITY_STUDIO_PREVIEW_URL="http://localhost:3000"
```

---

## 🔗 Part 5: Frontend Integration Setup

### Step 1: Install Frontend Dependencies

In your **main app folder** (not studio):

```bash
npm install next-sanity@latest @sanity/image-url@latest @sanity/client@latest
npm install --save-dev sanity@latest
```

### Step 2: Create Sanity Library Folder

```bash
# In your app (e.g., app/, src/, etc.)
mkdir -p sanity/lib
cd sanity/lib
```

### Step 3: Copy Integration Files

**From J5 → Your project:**

```bash
# Copy these files from j5ecommerce/frontend/sanity/lib/
# to your-project/your-app/sanity/lib/

cp api.ts your-project/app/sanity/lib/
cp client.ts your-project/app/sanity/lib/
cp live.ts your-project/app/sanity/lib/
cp queries.ts your-project/app/sanity/lib/
cp token.ts your-project/app/sanity/lib/
cp writeToken.ts your-project/app/sanity/lib/
cp utils.ts your-project/app/sanity/lib/
cp demo.ts your-project/app/sanity/lib/
```

### Step 4: Update Import Paths

**In each copied file, update the import paths to match your project structure.**

Example for `client.ts`:
```typescript
// Change from:
import {apiVersion, dataset, projectId, studioUrl} from '@/sanity/lib/api'

// To match your path alias (check your tsconfig.json):
import {apiVersion, dataset, projectId, studioUrl} from '@/sanity/lib/api'
```

### Step 5: Configure Environment Variables

**Create/update your app's `.env.local`:**

```bash
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID="<your-project-id>"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2025-09-25"
NEXT_PUBLIC_SANITY_STUDIO_URL="http://localhost:3333"

# Required for reading data
SANITY_API_READ_TOKEN="<get-from-sanity-manage>"

# Required for stock updates (optional if not using)
SANITY_API_WRITE_TOKEN="<get-from-sanity-manage>"
```

---

## 🎨 Part 6: Type Generation Setup

### In Your Main App's `package.json`

Add these scripts:

```json
{
  "scripts": {
    "predev": "npm run typegen",
    "prebuild": "npm run typegen",
    "typegen": "cd ../studio && npm run extract-types && cp sanity.types.ts ../your-app/sanity.types.ts"
  }
}
```

**Or if using a different structure:**

```json
{
  "scripts": {
    "typegen": "sanity typegen generate --workspace studio"
  }
}
```

---

## 📝 Part 7: AI Prompts for Content Migration

### Prompt 1: Create Initial Categories

```
I have a Sanity Studio set up with the product and category schema. I need to create initial categories for a pharmacy e-commerce site.

Based on the schema in `studio/src/schemaTypes/documents/category.ts`, create the following category structure:

Main Categories:
1. Medicines (prescription, over-the-counter, vitamins)
2. Personal Care (skincare, haircare, oral care)
3. Baby & Mom (baby food, diapers, maternity)
4. Health Devices (thermometers, blood pressure monitors)
5. First Aid (bandages, antiseptics, pain relief)

For each category, provide:
- Name
- Slug (URL-friendly)
- Description
- Whether it's a main category or subcategory

Generate Sanity CLI commands or a migration script to create these.
```

### Prompt 2: Migrate Products from Old System

```
I need to migrate product data from my existing system to Sanity CMS.

My current product structure has:
- Product name
- Price
- SKU
- Description
- Category
- Stock quantity
- Image URL

The Sanity schema (in `studio/src/schemaTypes/documents/product.ts`) includes:
- Promo system (isOnPromo, promoType, promoPercentage/promoPrice)
- Category reference
- Stock tracking (quantity field)
- Image asset (needs to be uploaded to Sanity)

Help me create a migration script that:
1. Reads products from my current database/API
2. Maps fields to Sanity schema
3. Uploads images to Sanity CDN
4. Creates category references
5. Bulk imports to Sanity using the client

Provide the complete Node.js script with error handling.
```

### Prompt 3: Set Up Data Fetching

```
I have Sanity CMS set up with products and categories. I need to fetch and display this data in my [Next.js/React/other framework] application.

Using the queries from `sanity/lib/queries.ts`, help me:

1. Create a product listing page that:
   - Fetches all products
   - Shows product cards with image, name, price
   - Displays promo badges if isOnPromo is true
   - Filters by category
   - Shows "Out of Stock" for quantity = 0

2. Create a product detail page that:
   - Fetches single product by slug
   - Shows full description
   - Displays category breadcrumb
   - Shows stock availability

3. Implement server-side rendering with:
   - ISR (Incremental Static Regeneration) for product pages
   - Real-time updates using Sanity Live Content API

Provide complete component code with TypeScript types from `sanity.types.ts`.
```

### Prompt 4: Integrate Page Builder

```
I want to use the Sanity page builder system in my website. The schema includes:
- Call to Action blocks (CTA)
- Info Section blocks
- Link resolution (internal pages, posts, external URLs)

Based on the schemas in:
- `studio/src/schemaTypes/objects/callToAction.ts`
- `studio/src/schemaTypes/objects/infoSection.ts`
- `studio/src/schemaTypes/objects/link.ts`

Help me create:
1. A `<PageBuilder>` component that renders different block types
2. A `<BlockRenderer>` that maps block types to components
3. A `<ResolvedLink>` component that handles all link types
4. Example page components for CTA and InfoSection

Provide full implementation with Tailwind CSS styling.
```

---

## 🔍 Part 8: Verification Checklist

After setup, verify everything works:

### Studio Verification

```bash
cd studio
npm run dev
```

Visit `http://localhost:3333` and check:
- [ ] Studio loads without errors
- [ ] All schema types appear in the menu
- [ ] Can create a test category
- [ ] Can create a test product
- [ ] Product can reference category
- [ ] Featured Products singleton appears in sidebar
- [ ] Hero Carousel singleton appears in sidebar
- [ ] Settings singleton appears in sidebar

### Frontend Verification

Create a test page:

```typescript
// app/test-sanity/page.tsx
import { sanityFetch } from '@/sanity/lib/live'
import { allCategoriesQuery } from '@/sanity/lib/queries'

export default async function TestSanity() {
  const { data } = await sanityFetch({
    query: allCategoriesQuery,
    stega: false,
  })

  return (
    <div>
      <h1>Sanity Connection Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

Visit `/test-sanity` and check:
- [ ] Data loads from Sanity
- [ ] Categories display correctly
- [ ] No TypeScript errors
- [ ] Images load from Sanity CDN

---

## 🛠️ Part 9: Common Issues & Solutions

### Issue 1: "Missing environment variable"

**Error:** `Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID`

**Solution:**
```bash
# Get project ID from https://sanity.io/manage
# Add to both studio/.env.local and app/.env.local
NEXT_PUBLIC_SANITY_PROJECT_ID="abc12345"
SANITY_STUDIO_PROJECT_ID="abc12345"
```

### Issue 2: Types not generating

**Error:** `Cannot find module 'sanity.types'`

**Solution:**
```bash
cd studio
npm run extract-types

# Then copy to your app
cp sanity.types.ts ../your-app/
```

### Issue 3: CORS errors in development

**Error:** `CORS policy blocked the request`

**Solution:**
1. Go to https://sanity.io/manage
2. Select your project → API → CORS Origins
3. Add `http://localhost:3000` (your app port)
4. Add `http://localhost:3333` (studio port)

### Issue 4: Images not loading

**Error:** Images return 404 or don't display

**Solution:**

Add to your app's `next.config.js`:
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}
```

### Issue 5: Studio won't start

**Error:** `Port 3333 already in use`

**Solution:**
```bash
# Kill process using port 3333
# Windows:
netstat -ano | findstr :3333
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3333 | xargs kill -9

# Or change port in studio/package.json:
"dev": "sanity dev --port 3334"
```

---

## 🎓 Part 10: Next Steps After Setup

### 1. Customize Schema for Your Needs

**AI Prompt:**
```
I have the base e-commerce schema set up. I need to add custom fields to products:
- Prescription required (boolean)
- Expiration tracking (date)
- Manufacturer (string)
- Drug interactions (array of references)

Update the product schema in `studio/src/schemaTypes/documents/product.ts` with proper validation.
```

### 2. Set Up Content Pipeline

**AI Prompt:**
```
Help me create a workflow for non-technical staff to manage products in Sanity Studio:
1. Create custom input components for complex fields
2. Add validation rules that show helpful error messages
3. Set up initial values for new products
4. Create a custom preview component showing product card
5. Add bulk operations for stock updates

Provide complete code for custom Studio plugins.
```

### 3. Implement Search

**AI Prompt:**
```
Add search functionality to my product catalog using Sanity's search capabilities:
1. Full-text search across product names and descriptions
2. Filter by category, price range, availability
3. Sort by price, name, newest
4. Implement using Sanity GROQ queries

Provide the search page component and optimized queries.
```

### 4. Add Admin Features

**AI Prompt:**
```
Create admin-only features in my app using the Sanity data:
1. Stock management page (update quantities)
2. Promo management (activate/deactivate promos)
3. Order tracking (if using Firestore orders)
4. Analytics dashboard (popular products, low stock alerts)

Use the writeToken for mutations. Provide secure server actions.
```

---

## 📚 Reference: Key Files to Understand

### Schema Files Explained

| File | Purpose | Key Fields |
|------|---------|------------|
| `product.ts` | Product definition | `name`, `price`, `quantity`, `isOnPromo`, `category` reference |
| `category.ts` | Category hierarchy | `name`, `slug`, `parentCategory` (self-reference) |
| `page.ts` | Custom pages | `pageBuilder` array, `heading`, `subheading` |
| `settings.tsx` | Site-wide config | `title`, `description`, `logo`, `footer` |
| `featuredProducts.ts` | Homepage featured | `products` array (references) |
| `heroCarousel.ts` | Homepage carousel | `slides` array, `autoPlay` settings |

### Integration Files Explained

| File | Purpose | Use Case |
|------|---------|----------|
| `sanity/lib/client.ts` | Sanity client instance | Configured with credentials, CDN, stega |
| `sanity/lib/live.ts` | Live Content API | Real-time updates in preview |
| `sanity/lib/queries.ts` | GROQ queries | All data fetching logic |
| `sanity/lib/utils.ts` | Helper functions | Image URLs, link resolution |
| `sanity/lib/token.ts` | Read token | For fetching data |
| `sanity/lib/writeToken.ts` | Write token | For stock updates |

---

## 🎯 Quick Start Command Sequence

```bash
# 1. Set up studio workspace
mkdir studio && cd studio
npm init -y
npm install sanity@latest next-sanity@latest @sanity/vision@latest @sanity/icons@latest

# 2. Copy schema files from j5ecommerce
cp -r ../j5ecommerce/studio/src ./

# 3. Create config files (use templates from Part 4 above)
touch sanity.config.ts sanity.cli.ts tsconfig.json .env.local

# 4. Initialize Sanity project
npx sanity init --project-id <your-id> --dataset production

# 5. Start studio
npm run dev

# 6. In your main app, install dependencies
cd ../your-app
npm install next-sanity@latest @sanity/image-url@latest

# 7. Copy integration files
mkdir -p sanity/lib
cp -r ../j5ecommerce/frontend/sanity/lib/* ./sanity/lib/

# 8. Set up env vars (see Part 5)
touch .env.local

# 9. Test connection
npm run dev
# Visit http://localhost:3000/test-sanity
```

---

## 🆘 Support Resources

- **Sanity Documentation:** https://www.sanity.io/docs
- **Sanity Community Slack:** https://slack.sanity.io
- **GROQ Query Tool:** https://groq.dev
- **J5 Pharmacy Source:** Reference this codebase for examples

---

## ✅ Success Criteria

Your migration is complete when:

1. ✅ Studio runs on port 3333 without errors
2. ✅ All schema types are visible and editable
3. ✅ Frontend can fetch products and categories
4. ✅ Images load from Sanity CDN
5. ✅ Types auto-generate and have no errors
6. ✅ Real-time updates work in preview mode
7. ✅ You can create products with category references
8. ✅ Promo system works (display discounted prices)
9. ✅ Stock tracking updates correctly
10. ✅ Page builder renders custom pages

---

## 📋 Pre-Migration Checklist

Print and check off before starting:

- [ ] Backed up existing product data
- [ ] Created Sanity account and project
- [ ] Noted project ID and dataset name
- [ ] Generated read and write tokens
- [ ] Reviewed current product/category structure
- [ ] Planned URL structure for products/categories
- [ ] Determined which content goes in Sanity vs. hardcoded
- [ ] Set up development environment
- [ ] Installed all prerequisites
- [ ] Read through entire migration guide

---

## 🎉 Congratulations!

You now have a complete Sanity CMS setup with:
- 📦 Product catalog with promo system
- 🏷️ Category hierarchy (main + subcategories)
- 📊 Stock tracking
- 🎨 Page builder for custom pages
- 📝 Blog system
- ⚙️ Site-wide settings
- 🔄 Real-time content updates
- 📱 TypeScript type safety

**Next:** Start adding your products and customizing the schema for your specific needs!
