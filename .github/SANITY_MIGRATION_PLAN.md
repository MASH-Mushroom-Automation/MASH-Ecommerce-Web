# 🔄 Sanity CMS Migration Plan - MASH to PP_Namias

**Migration Date**: November 21, 2025  
**Status**: 🔴 NOT STARTED  
**Goal**: Migrate from quota-exceeded MASH project to free PP_Namias project

---

## 📊 Project Comparison

### Old Project (MASH - Quota Exceeded ❌)
- **Project ID**: `2grm6gj7`
- **Plan**: Free (Growth trial expired)
- **Status**: ⚠️ API quota limit reached (100k requests exceeded)
- **Issue**: Cannot make API requests until quota resets or plan upgraded
- **Cost to Continue**: $99/month for Growth plan

### New Project (PP_Namias - Active ✅)
- **Project ID**: `gerattrr`
- **Organization ID**: `oBQP4vpxm`
- **Plan**: Free (staying free permanently)
- **Status**: ✅ Active with fresh quota
- **Limits**:
  - API Requests: 250k/month (2.5x more than old free plan!)
  - API CDN Requests: 1 million/month
  - Bandwidth: 100 GB/month
  - Assets: 100 GB storage
  - Datasets: 2 datasets
  - Documents: 10,000 documents
  - Webhooks: 2 webhooks
  - User Seats: 20 users (invite team members!)

---

## 🎯 Migration Goals

1. ✅ **Stay 100% Free** - No paid plans, use free tier limits intelligently
2. ✅ **No Real-Time Updates** - Disable live subscriptions to conserve API quota
3. ✅ **Team Collaboration** - Invite team members with roles (Admin, Editor, Viewer)
4. ✅ **Latest Sanity Version** - Use `sanity@latest` for best performance
5. ✅ **Zero Data Loss** - Migrate all products, categories, bundles, reviews
6. ✅ **Minimal Downtime** - Switch projects seamlessly

---

## 📋 Pre-Migration Checklist

- [ ] **Backup Current Data**
  - [ ] Export all products (15 items)
  - [ ] Export all categories (3 items)
  - [ ] Export all variants (15 items)
  - [ ] Export all bundles (6 items)
  - [ ] Export all reviews (45 items)
  - [ ] Export all other documents (hero, features, FAQ, etc.)

- [ ] **Verify New Project Setup**
  - [x] Project ID: `gerattrr`
  - [ ] Create API tokens (read + write)
  - [ ] Test API access
  - [ ] Verify dataset: `production`

- [ ] **Prepare Migration Script**
  - [ ] Create data export script from old project
  - [ ] Create data import script to new project
  - [ ] Test migration on small sample

---

## 🚀 Migration Phases

### **Phase 1: Setup New Sanity Studio** (30 minutes)
**Status**: 🔴 NOT STARTED

#### Step 1.1: Install Latest Sanity CLI
```bash
# In project root
npm install -g sanity@latest
```

#### Step 1.2: Create New Studio Directory
```bash
# Create new studio with PP_Namias project
sanity init --project gerattrr --dataset production --template clean --typescript --output-path studio-pp-namias

# Follow prompts:
# ✓ Select project: PP_Namias (gerattrr)
# ✓ Use default dataset: production
# ✓ Output path: studio-pp-namias
```

#### Step 1.3: Verify Installation
```bash
cd studio-pp-namias
npm run dev
# Should open at http://localhost:3333
```

**Completion Criteria**:
- [x] New studio directory `studio-pp-namias` created
- [ ] Sanity Studio runs without errors
- [ ] Can log in to Studio at localhost:3333

---

### **Phase 2: Copy Schema Definitions** (45 minutes)
**Status**: 🔴 NOT STARTED

#### Step 2.1: Copy Schema Files
Copy from `studio/src/schemaTypes/` to `studio-pp-namias/src/schemaTypes/`:

```bash
# Documents (8 files)
- documents/product.ts (623 lines - complete with 25+ fields)
- documents/category.ts (updated with 6 SEO fields)
- documents/productVariant.ts
- documents/productBundle.ts
- documents/review.ts
- documents/order.ts
- documents/coupon.ts
- documents/promotion.ts

# Content (7 files)
- documents/hero.ts
- documents/features.ts
- documents/faq.ts
- documents/post.ts
- documents/page.ts
- documents/author.ts
- documents/teamMember.ts

# Singletons (3 files)
- singletons/settings.ts
- singletons/featuredProducts.ts
- singletons/navigation.ts
```

#### Step 2.2: Update Schema Index
```typescript
// studio-pp-namias/src/schemaTypes/index.ts
import { category } from './documents/category';
import { product } from './documents/product';
import { productVariant } from './documents/productVariant';
import { productBundle } from './documents/productBundle';
import { review } from './documents/review';
import { order } from './documents/order';
import { coupon } from './documents/coupon';
import { promotion } from './documents/promotion';
import { hero } from './documents/hero';
import { features } from './documents/features';
import { faq } from './documents/faq';
import { post } from './documents/post';
import { page } from './documents/page';
import { author } from './documents/author';
import { teamMember } from './documents/teamMember';
import { settings } from './singletons/settings';
import { featuredProducts } from './singletons/featuredProducts';
import { navigation } from './singletons/navigation';

export const schemaTypes = [
  // E-Commerce
  category,
  product,
  productVariant,
  productBundle,
  review,
  order,
  coupon,
  promotion,
  
  // Content
  hero,
  features,
  faq,
  post,
  page,
  author,
  teamMember,
  
  // Singletons
  settings,
  featuredProducts,
  navigation,
];
```

#### Step 2.3: Test Schema
```bash
cd studio-pp-namias
npm run dev
# Verify all document types appear in Studio
```

**Completion Criteria**:
- [ ] All 18 schema files copied
- [ ] Schema index updated
- [ ] Studio shows all document types
- [ ] No TypeScript errors

---

### **Phase 3: Export Data from Old Project** (20 minutes)
**Status**: 🔴 NOT STARTED

#### Step 3.1: Create Export Script
Create `data/cms/export-from-mash.js`:

```javascript
import { createClient } from '@sanity/client';
import fs from 'fs';

const oldClient = createClient({
  projectId: '2grm6gj7', // Old MASH project
  dataset: 'production',
  token: 'skG4Jh0yyksQsmdziYleoAAOe9JqyG1jlGeNqYJtsfsqSzRrOZAddX55z9QcpsM3rebbxf1fb2BZiiwGuBwJD2hnXrlxlYEWW8PvxudQbFcPfFYJEZURNHZ5olAnuj46B6bHGDSlgcWLMh4NCBFm0t7nxUQt6MPGJCj65EFrJUmBtUntCYMW',
  useCdn: false,
  apiVersion: '2024-11-19',
});

async function exportData() {
  console.log('📦 Exporting data from MASH project...');
  
  try {
    // Fetch all documents
    const documents = await oldClient.fetch(`*[!(_id in path("_.**"))]`);
    
    // Save to JSON
    fs.writeFileSync(
      'data/cms/mash-export.json',
      JSON.stringify(documents, null, 2)
    );
    
    console.log(`✅ Exported ${documents.length} documents to data/cms/mash-export.json`);
    
    // Group by type
    const byType = documents.reduce((acc, doc) => {
      const type = doc._type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(doc);
      return acc;
    }, {});
    
    console.log('\n📊 Export Summary:');
    Object.entries(byType).forEach(([type, docs]) => {
      console.log(`  - ${type}: ${docs.length} documents`);
    });
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  }
}

exportData();
```

#### Step 3.2: Run Export
```bash
node data/cms/export-from-mash.js
# Creates data/cms/mash-export.json with all documents
```

**Completion Criteria**:
- [ ] Export script created
- [ ] `mash-export.json` file created
- [ ] All document counts verified (84+ documents)

---

### **Phase 4: Create API Tokens for New Project** (10 minutes)
**Status**: 🔴 NOT STARTED

#### Step 4.1: Generate Read Token
1. Visit: https://sanity.io/manage/project/gerattrr
2. Click **API** tab → **Tokens** section
3. Click **+ Add API Token**
4. Configure:
   - **Name**: `PP_Namias Read Token`
   - **Permissions**: **Viewer** (read-only)
5. Copy token → Save to `.env.local`

#### Step 4.2: Generate Write Token
1. Click **+ Add API Token** again
2. Configure:
   - **Name**: `PP_Namias Write Token`
   - **Permissions**: **Editor** (read + write)
3. Copy token → Save to `.env.local`

#### Step 4.3: Update Environment Variables
```env
# .env.local - Update Sanity configuration

# NEW PP_Namias Project (gerattrr) - FREE TIER
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-19
SANITY_API_READ_TOKEN=<your_read_token_here>
SANITY_API_WRITE_TOKEN=<your_write_token_here>

# ⚠️ QUOTA MANAGEMENT - FREE TIER
# Real-time updates DISABLED to stay within 250k API requests/month
NEXT_PUBLIC_SANITY_REALTIME_ENABLED=false
```

**Completion Criteria**:
- [ ] Read token created
- [ ] Write token created
- [ ] `.env.local` updated with new project ID
- [ ] Tokens tested (make a test API call)

---

### **Phase 5: Import Data to New Project** (30 minutes)
**Status**: 🔴 NOT STARTED

#### Step 5.1: Create Import Script
Create `data/cms/import-to-pp-namias.js`:

```javascript
import { createClient } from '@sanity/client';
import fs from 'fs';

const newClient = createClient({
  projectId: 'gerattrr', // New PP_Namias project
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN, // From .env.local
  useCdn: false,
  apiVersion: '2024-11-19',
});

async function importData() {
  console.log('📥 Importing data to PP_Namias project...');
  
  try {
    // Read exported data
    const documents = JSON.parse(
      fs.readFileSync('data/cms/mash-export.json', 'utf-8')
    );
    
    console.log(`Found ${documents.length} documents to import`);
    
    // Import order (references must exist before being referenced)
    const importOrder = [
      'category',
      'productVariant',
      'product',
      'productBundle',
      'review',
      'author',
      'post',
      'hero',
      'features',
      'faq',
      'page',
      'teamMember',
      'settings',
      'featuredProducts',
      'navigation',
    ];
    
    let imported = 0;
    
    for (const type of importOrder) {
      const docsOfType = documents.filter(doc => doc._type === type);
      
      if (docsOfType.length === 0) continue;
      
      console.log(`\n📝 Importing ${docsOfType.length} ${type} documents...`);
      
      for (const doc of docsOfType) {
        try {
          // Remove system fields
          const { _rev, _updatedAt, ...cleanDoc } = doc;
          
          // Create or replace document
          await newClient.createOrReplace(cleanDoc);
          imported++;
          process.stdout.write(`  ✓ ${imported}/${documents.length}\r`);
        } catch (error) {
          console.error(`\n  ❌ Failed to import ${doc._id}:`, error.message);
        }
      }
    }
    
    console.log(`\n\n✅ Successfully imported ${imported} documents!`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

importData();
```

#### Step 5.2: Run Import
```bash
node data/cms/import-to-pp-namias.js
# Imports all documents to new project
```

#### Step 5.3: Verify Import
1. Open Studio: http://localhost:3333
2. Check each content type has correct count:
   - Products: 15
   - Categories: 3
   - Variants: 15
   - Bundles: 6
   - Reviews: 45
   - Hero sections: ~5
   - Features: ~10
   - FAQs: ~10

**Completion Criteria**:
- [ ] Import script created
- [ ] All documents imported successfully
- [ ] Document counts verified in Studio
- [ ] No missing references

---

### **Phase 6: Disable Real-Time Updates (FREE TIER)** (15 minutes)
**Status**: 🔴 NOT STARTED

#### Step 6.1: Update Sanity Client Configuration
```typescript
// src/lib/sanity/client.ts
export const sanityClient = createClient({
  projectId: 'gerattrr', // NEW project
  dataset: 'production',
  apiVersion: '2024-11-19',
  useCdn: true, // ALWAYS use CDN (free tier optimization)
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'published',
  
  // FREE TIER OPTIMIZATIONS
  stega: {
    enabled: false, // Disable Stega encoding (reduces requests)
  },
  resultSourceMap: false, // Disable source maps (reduces overhead)
});

// Real-time toggle (controlled via env var)
export const isRealtimeEnabled = 
  process.env.NEXT_PUBLIC_SANITY_REALTIME_ENABLED === 'true';
```

#### Step 6.2: Update Product Hook
```typescript
// src/hooks/useSanityProducts.ts
useEffect(() => {
  // Check cache first (1-minute TTL)
  const cacheKey = JSON.stringify(filters || {});
  const cached = productCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📦 Using cached products (FREE TIER - avoiding API call)');
    setProducts(cached.data);
    setLoading(false);
    return;
  }
  
  // Fetch with cache
  fetchProducts().then(() => {
    productCache.set(cacheKey, { data: products, timestamp: Date.now() });
  });

  // ⚠️ REAL-TIME UPDATES DISABLED (FREE TIER)
  // To enable: Set NEXT_PUBLIC_SANITY_REALTIME_ENABLED=true
  if (!isRealtimeEnabled) {
    console.log('ℹ️ Real-time updates disabled (FREE TIER mode)');
    return;
  }
  
  // Real-time listener code (only if enabled)...
}, [filters, fetchProducts]);
```

#### Step 6.3: Add Manual Refresh Button
```tsx
// src/app/(shop)/shop/page.tsx
"use client";

export default function ShopPage() {
  const { products, loading, error, refetch } = useSanityProducts(filters);
  
  return (
    <div>
      {/* Manual refresh for FREE TIER */}
      <Button 
        onClick={refetch}
        variant="outline"
        className="mb-4"
      >
        🔄 Refresh Products
      </Button>
      
      {/* Rest of shop page */}
    </div>
  );
}
```

**Completion Criteria**:
- [ ] Real-time updates disabled by default
- [ ] Environment variable `NEXT_PUBLIC_SANITY_REALTIME_ENABLED=false` set
- [ ] Cache TTL set to 1 minute
- [ ] Manual refresh buttons added to key pages
- [ ] Console logs show "FREE TIER mode" messages

---

### **Phase 7: Update Frontend Configuration** (20 minutes)
**Status**: 🔴 NOT STARTED

#### Step 7.1: Update All Config Files

**File 1: `.env.local`**
```env
# Sanity CMS - PP_Namias Project (FREE TIER)
# ⚠️ Project ID changed from 2grm6gj7 (MASH) to gerattrr (PP_Namias)
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-11-19
SANITY_API_READ_TOKEN=<your_read_token>
SANITY_API_WRITE_TOKEN=<your_write_token>

# FREE TIER Optimizations
NEXT_PUBLIC_SANITY_REALTIME_ENABLED=false
NEXT_PUBLIC_SANITY_CDN_ENABLED=true
NEXT_PUBLIC_SANITY_CACHE_TTL=60000
```

**File 2: `studio-pp-namias/.env`**
```env
SANITY_STUDIO_PROJECT_ID=gerattrr
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_API_VERSION=2024-11-19
```

**File 3: Update all hardcoded project IDs**
```bash
# Search for old project ID
grep -r "2grm6gj7" src/

# Replace with new project ID
# Use Find & Replace in VS Code: 2grm6gj7 → gerattrr
```

#### Step 7.2: Test Frontend
```bash
# Restart Next.js
npm run dev

# Visit pages and verify:
# - Products load from new project
# - No API quota errors
# - Console shows "FREE TIER mode"
# - Manual refresh works
```

**Completion Criteria**:
- [ ] All environment variables updated
- [ ] Old project ID replaced everywhere
- [ ] Frontend loads products from new project
- [ ] No errors in browser console

---

### **Phase 8: Invite Team Members** (15 minutes)
**Status**: 🔴 NOT STARTED

#### Step 8.1: Understand User Roles

**Sanity Free Tier Roles** (up to 20 users):

1. **Administrator** (Full Access)
   - Can add/remove users
   - Can deploy studio
   - Can modify API tokens
   - Can manage billing
   - **Who**: You (project owner)

2. **Editor** (Content Management)
   - Can create/edit/delete documents
   - Can publish content
   - Can upload assets
   - Cannot manage users or settings
   - **Who**: Content managers, marketing team

3. **Viewer** (Read-Only)
   - Can view all documents
   - Cannot edit or publish
   - Good for stakeholders/reviewers
   - **Who**: Clients, stakeholders, QA testers

#### Step 8.2: Invite Team Members
1. Visit: https://sanity.io/manage/project/gerattrr
2. Click **Team** tab
3. Click **+ Invite Member**
4. For each team member:
   - Enter email address
   - Select role: **Editor** (for content managers)
   - Click **Send Invite**
5. They receive email with link to join

#### Step 8.3: Set Up Role-Based Permissions
Create `studio-pp-namias/src/permissions.ts`:

```typescript
import { Rule } from 'sanity';

// Editor permissions (content only, no settings)
export const editorPermissions = {
  filter: '_type != "settings" && _type != "navigation"',
};

// Custom document-level permissions
export const documentPermissions = (props: any) => {
  const { currentUser, document } = props;
  
  // Administrators can do everything
  if (currentUser.roles.find((role: any) => role.name === 'administrator')) {
    return true;
  }
  
  // Editors can edit content but not settings
  if (currentUser.roles.find((role: any) => role.name === 'editor')) {
    return document._type !== 'settings' && document._type !== 'navigation';
  }
  
  // Viewers can only read
  return false;
};
```

**Completion Criteria**:
- [ ] Team members invited (list emails)
- [ ] Roles assigned appropriately
- [ ] Invited members can access Studio
- [ ] Permissions tested (Editors can edit, Viewers cannot)

---

### **Phase 9: Test & Verify Migration** (30 minutes)
**Status**: 🔴 NOT STARTED

#### Test Checklist

**Studio Testing** (http://localhost:3333):
- [ ] All document types visible
- [ ] Can create new product
- [ ] Can edit existing product
- [ ] Can upload images
- [ ] Can publish changes
- [ ] Reference fields work (category → product)
- [ ] No schema errors
- [ ] Invited users can log in

**Frontend Testing** (http://localhost:3000):
- [ ] Homepage loads with hero sections
- [ ] Shop page shows 15 products
- [ ] Product detail pages work
- [ ] Category filtering works
- [ ] Search functionality works
- [ ] Product images display
- [ ] No API quota errors in console
- [ ] Manual refresh button works

**API Quota Monitoring**:
- [ ] Visit: https://sanity.io/manage/project/gerattrr/usage
- [ ] Check API requests count (should be low)
- [ ] Verify CDN requests (should be high)
- [ ] Bandwidth under 100 GB
- [ ] Documents under 10k limit

**Performance Testing**:
- [ ] Page load time < 2 seconds
- [ ] Time to First Contentful Paint < 1 second
- [ ] No excessive API calls (check Network tab)
- [ ] Cache working (see console logs)

**Completion Criteria**:
- [ ] All tests passing
- [ ] No errors in production
- [ ] API quota usage < 10k/day
- [ ] Team members can manage content

---

### **Phase 10: Deprecate Old Studio** (10 minutes)
**Status**: 🔴 NOT STARTED

#### Step 10.1: Backup Old Studio
```bash
# Rename old studio
mv studio studio-mash-backup

# Rename new studio
mv studio-pp-namias studio
```

#### Step 10.2: Update Package Scripts
```json
// package.json
{
  "scripts": {
    "studio": "cd studio && npm run dev",
    "studio:deploy": "cd studio && sanity deploy",
    "studio:build": "cd studio && npm run build"
  }
}
```

#### Step 10.3: Archive Old Project (Optional)
1. Visit: https://sanity.io/manage/project/2grm6gj7
2. Click **Settings** → **Danger Zone**
3. Click **Archive Project** (keeps data, stops billing)
4. Or keep it as backup (no cost for free plan)

**Completion Criteria**:
- [ ] New studio is default
- [ ] Old studio backed up
- [ ] Package scripts updated
- [ ] Team using new project

---

## 📈 Free Tier Quota Management Strategy

### Daily Monitoring
- **Check Usage**: Visit https://sanity.io/manage/project/gerattrr/usage daily
- **API Requests Goal**: < 8,000/day (leaves buffer)
- **CDN Requests**: Unlimited (use CDN aggressively)

### Optimization Techniques

#### 1. **Aggressive CDN Caching**
```typescript
// Always fetch from CDN (not origin)
useCdn: true
```

#### 2. **Memory Caching** (1-minute TTL)
```typescript
const productCache = new Map();
const CACHE_TTL = 60000; // 1 minute
```

#### 3. **Request Batching**
```typescript
// Instead of 3 calls:
const products = await client.fetch(`*[_type == "product"]`);
const categories = await client.fetch(`*[_type == "category"]`);
const bundles = await client.fetch(`*[_type == "productBundle"]`);

// Use 1 batch call:
const data = await client.fetch(`{
  "products": *[_type == "product"],
  "categories": *[_type == "category"],
  "bundles": *[_type == "productBundle"]
}`);
```

#### 4. **Static Generation** (Build-Time Fetching)
```typescript
// Pre-render all product pages at build time
export async function generateStaticParams() {
  const slugs = await client.fetch(`*[_type == "product"].slug.current`);
  return slugs.map((slug) => ({ slug }));
}
```

#### 5. **Longer Revalidation** (ISR)
```typescript
// Revalidate every 1 hour instead of 5 minutes
export const revalidate = 3600; // 1 hour
```

### If Quota Exceeds (Emergency Plan)

**Option A: Switch to Mock Data Temporarily**
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

**Option B: Increase Cache TTL**
```typescript
const CACHE_TTL = 300000; // 5 minutes
```

**Option C: Use Static JSON Export**
```bash
# Export to static JSON daily
node scripts/export-to-json.js
# Frontend reads from JSON instead of API
```

---

## 👥 Team Collaboration Guide

### Adding New Team Members

**Step 1: Invite to Sanity**
1. https://sanity.io/manage/project/gerattrr/team
2. Click **+ Invite Member**
3. Email + Role (Editor recommended)

**Step 2: Onboarding Checklist**
Send new members:
- [ ] Sanity Studio URL: http://localhost:3333 (dev) or https://[deployed-url]
- [ ] Login instructions (use Google/GitHub OAuth)
- [ ] Content guidelines document
- [ ] Schema reference (field descriptions)
- [ ] Style guide (image sizes, naming conventions)

**Step 3: First Login**
1. Accept invite email
2. Visit Studio URL
3. Log in with Google/GitHub
4. See training video (if available)
5. Make test edit (supervised)

### Recommended Roles by Position

| Position              | Sanity Role | Access Level              |
|-----------------------|-------------|---------------------------|
| Project Owner (You)   | Admin       | Full access               |
| Content Manager       | Editor      | Create/edit/publish       |
| Marketing Team        | Editor      | Create/edit/publish       |
| Copywriter            | Editor      | Create/edit/publish       |
| Image Designer        | Editor      | Upload/manage assets      |
| Client/Stakeholder    | Viewer      | Read-only (review)        |
| QA Tester             | Viewer      | Read-only (verify)        |

---

## 📊 Progress Tracking

### Overall Progress: 0% (0/10 phases complete)

| Phase | Status | Estimated Time | Actual Time | Completion Date |
|-------|--------|----------------|-------------|-----------------|
| 1. Setup New Studio | 🔴 Not Started | 30 min | - | - |
| 2. Copy Schemas | 🔴 Not Started | 45 min | - | - |
| 3. Export Data | 🔴 Not Started | 20 min | - | - |
| 4. Create API Tokens | 🔴 Not Started | 10 min | - | - |
| 5. Import Data | 🔴 Not Started | 30 min | - | - |
| 6. Disable Real-Time | 🔴 Not Started | 15 min | - | - |
| 7. Update Frontend | 🔴 Not Started | 20 min | - | - |
| 8. Invite Team | 🔴 Not Started | 15 min | - | - |
| 9. Test & Verify | 🔴 Not Started | 30 min | - | - |
| 10. Deprecate Old | 🔴 Not Started | 10 min | - | - |

**Total Estimated Time**: 3 hours 45 minutes  
**Target Completion**: [Set your target date]

---

## 🔄 Session Log

### Session 1 - [Date]
**Goal**: [Phase goal]  
**Completed**:
- [ ] Task 1
- [ ] Task 2

**Issues Encountered**:
- Issue description
- Solution applied

**Next Session**:
- Continue with Phase X

---

### Session 2 - [Date]
**Goal**: [Phase goal]  
**Completed**:
- [ ] Task 1

**Issues Encountered**:
- None

**Next Session**:
- Start Phase Y

---

## ✅ Post-Migration Verification

After completing all phases, verify:

### Technical Verification
- [ ] New project ID (`gerattrr`) used everywhere
- [ ] Old project ID (`2grm6gj7`) removed from all code
- [ ] Environment variables updated
- [ ] API tokens working
- [ ] No quota errors in console
- [ ] CDN enabled and working
- [ ] Cache working (see logs)
- [ ] Real-time updates disabled

### Content Verification
- [ ] All products migrated (15 items)
- [ ] All categories migrated (3 items)
- [ ] All variants migrated (15 items)
- [ ] All bundles migrated (6 items)
- [ ] All reviews migrated (45 items)
- [ ] All images uploaded
- [ ] All references intact
- [ ] No missing data

### Team Verification
- [ ] All team members invited
- [ ] All team members can log in
- [ ] Roles assigned correctly
- [ ] Permissions working
- [ ] Editors can edit
- [ ] Viewers cannot edit

### Performance Verification
- [ ] API requests < 8k/day
- [ ] CDN requests > API requests (good!)
- [ ] Page load times acceptable
- [ ] No excessive API calls
- [ ] Cache hit rate > 80%

---

## 🆘 Troubleshooting

### Issue: "Cannot fetch from new project"
**Solution**: Check API tokens are correct in `.env.local`

### Issue: "Schema not found for X"
**Solution**: Verify schema file copied and added to index.ts

### Issue: "References broken after import"
**Solution**: Run import script in correct order (category before product)

### Issue: "Quota still exceeded"
**Solution**: Restart Next.js dev server to clear old project connection

### Issue: "Team member cannot log in"
**Solution**: Check invite was accepted, verify email is correct

---

## 📚 Resources

### Sanity Documentation
- **Free Plan Limits**: https://www.sanity.io/pricing
- **API Tokens**: https://www.sanity.io/docs/http-auth
- **Team Management**: https://www.sanity.io/docs/access-control
- **Import/Export**: https://www.sanity.io/docs/migrating-data
- **Optimization**: https://www.sanity.io/docs/caching

### Project Links
- **PP_Namias Dashboard**: https://sanity.io/manage/project/gerattrr
- **Old MASH Dashboard**: https://sanity.io/manage/project/2grm6gj7
- **Usage Monitor**: https://sanity.io/manage/project/gerattrr/usage

---

## 🎯 Success Criteria

Migration is complete when:

1. ✅ **All data migrated** (84+ documents)
2. ✅ **Frontend working** (no errors, products load)
3. ✅ **Team members invited** (can access Studio)
4. ✅ **Quota under control** (< 8k API requests/day)
5. ✅ **Real-time disabled** (FREE TIER mode active)
6. ✅ **Old project deprecated** (new studio is default)
7. ✅ **Documentation updated** (team knows how to use)
8. ✅ **No breaking changes** (users don't notice difference)

---

**Document Version**: 1.0  
**Last Updated**: November 21, 2025  
**Next Review**: After Phase 5 completion  
**Owner**: Kenneth (Project Lead)

---

## 📝 Quick Start Checklist

Use this checklist to start migration **right now**:

1. [ ] Read entire document (15 min)
2. [ ] Install `sanity@latest` globally
3. [ ] Run `sanity init` with PP_Namias project
4. [ ] Copy schema files from old studio
5. [ ] Create API tokens in Sanity dashboard
6. [ ] Export data from old project
7. [ ] Import data to new project
8. [ ] Update `.env.local` with new project ID
9. [ ] Test frontend (visit /shop)
10. [ ] Invite team members

**Time to first working migration**: ~2 hours  
**Time to complete migration**: ~4 hours

---

**Ready to start?** Begin with **Phase 1: Setup New Sanity Studio** ⬆️
