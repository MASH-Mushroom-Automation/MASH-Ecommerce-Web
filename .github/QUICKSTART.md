# 🚀 Quick Start: MASH CMS Integration Guide

**MASH now supports DUAL CMS:** ✅ FULLY OPERATIONAL
- **✅ Sanity CMS** - E-Commerce products (DEPLOYED TO PRODUCTION) ⭐
- **✅ Custom JSON CMS** - Static marketing content (IMPLEMENTED & READY)

**📖 For complete architecture overview:** See `.github/DUAL_CMS_ARCHITECTURE.md`

---

## 🎯 Which CMS Should You Use?

### Use Sanity CMS if you need:
- ✅ Product management for e-commerce ← **READY NOW**
- ✅ Non-technical users to add/edit products ← **DEPLOYED**
- ✅ Rich media management (multiple images) ← **WORKING**
- ✅ Collaborative editing ← **AVAILABLE**
- ✅ Real-time updates ← **ACTIVE**
- ✅ Categories, promotions, inventory tracking ← **CONFIGURED**

**👉 Start Here:** `.github/DUAL_CMS_ARCHITECTURE.md` for complete guide  
**Studio:** https://mash-ecommerce.sanity.studio (Production)  
**Local:** http://localhost:3333 (Development)

### Use Custom JSON CMS if you need:
- ✅ Lightweight static content (Hero sections, Features, FAQ) ← **IMPLEMENTED**
- ✅ No external dependencies ← **READY**
- ✅ Full control over data structure ← **AVAILABLE**
- ✅ Fast performance (JSON files) ← **WORKING**

**👉 Continue reading this guide below for JSON CMS migration**

---

# Copy MASH Custom JSON CMS to Another Project

**Goal:** Use the MASH E-Commerce custom CMS setup in your different codebase (with your own UI/website).

**Important:** This is NOT Sanity CMS - This guide covers the custom JSON-based CMS with Next.js API routes.

**Time:** 1-2 hours | **Difficulty:** Beginner-Intermediate

---

## ⚡ TL;DR - Fastest Path

```bash
# 1. Copy CMS files from MASH project
your-project/
├── src/lib/cms/
│   ├── config.ts              # Copy from MASH
│   └── database.ts            # Copy from MASH
├── src/types/cms.ts           # Copy from MASH
└── src/app/api/cms/           # Copy entire folder from MASH

# 2. Install dependencies (if not already installed)
npm install lucide-react

# 3. Copy CMS hooks
src/hooks/useCMS.ts            # Copy from MASH

# 4. Run setup script
node setup-cms.js              # Initializes default CMS content

# 5. Test API endpoints
npm run dev
# Visit http://localhost:3000/api/cms/hero
# Visit http://localhost:3000/api/cms/features
# Visit http://localhost:3000/api/cms/faq

# 6. Use in components
import { useHeroes } from '@/hooks/useCMS';

function MyComponent() {
  const { heroes, loading } = useHeroes();
  // Use heroes data
}

# 7. Done! ✅
```

**Full details:** See sections below or `CMS/CMS-INTEGRATION-README.md`

---

## 📋 What is MASH CMS?

MASH uses a **custom JSON-based CMS** (not Sanity, not Strapi, not WordPress). It's a lightweight content management system built with:

- **JSON files** for data storage (can be upgraded to PostgreSQL/MongoDB later)
- **Next.js API routes** (`/api/cms/*`) for CRUD operations
- **TypeScript types** (`src/types/cms.ts`) for type safety
- **React hooks** (`src/hooks/useCMS.ts`) for easy data fetching
- **No external CMS service** - everything runs in your Next.js app

**What you can manage:**
- ✅ Hero sections (homepage banners)
- ✅ Features sections (USP cards)
- ✅ FAQ categories and items
- ✅ About page content (hero, challenges, solutions, vision, mentors)
- ✅ Team members
- ✅ Contact information
- ✅ Site settings (title, description, social links)

---

## 📋 Three Ways to Migrate

### Option 1: Copy-Paste (Fastest) ⚡ Recommended
**Time:** 30-60 minutes | **Best for:** Most developers

1. Copy 4 folders from MASH to your project:
   - `src/lib/cms/` (2 files)
   - `src/types/cms.ts` (1 file)
   - `src/app/api/cms/` (entire folder)
   - `src/hooks/useCMS.ts` (1 file)
2. Copy `setup-cms.js` to project root
3. Run `node setup-cms.js`
4. Start using CMS in components

**Pros:** Fast, no configuration needed, works immediately
**Cons:** No learning, may include features you don't need

---

### Option 2: Manual Setup (Most Control) 🛠️
**Time:** 2-3 hours | **Best for:** Learning how it works

1. Read: `docs/CMS/CMS-INTEGRATION-README.md`
2. Create files manually following the guide
3. Customize content types for your needs
4. Test each API endpoint as you build

**Pros:** Learn everything, full control, customized to your needs
**Cons:** Takes longer, requires understanding

---

### Option 3: AI-Assisted (Balanced) 🤖
**Time:** 1-2 hours | **Best for:** Customization with guidance

1. Open `.github/MASH_CMS_AI_PROMPTS.md`
2. Choose the prompt for your goal:
   - **PROMPT 1** for complete CMS setup (use this if starting fresh)
   - **PROMPT 2** to add custom content types
   - **PROMPT 3** to upgrade to PostgreSQL/MongoDB
   - **PROMPT 4** to build admin dashboard
   - **PROMPT 5-10** for advanced features

3. Copy entire prompt to your AI assistant (GitHub Copilot, ChatGPT, Claude)
4. Customize placeholders with your specifics:
   - Content type names
   - Field definitions
   - Your framework/dependencies
5. Review AI's generated code
6. Test thoroughly in your project
7. Iterate if needed

**Example - Using PROMPT 1:**
```
Open: .github/MASH_CMS_AI_PROMPTS.md
Scroll to: PROMPT 1: Complete CMS Setup
Copy: Entire prompt (200+ lines)
Paste to: AI assistant
Wait: AI generates all files
Review: Check code matches your needs
Test: Run npm run dev and test APIs
```

**Pros:** Fast, comprehensive, AI handles boilerplate, includes error handling
**Cons:** Need to verify AI's work, may need adjustments for your specific setup

**💡 Pro Tip:** Start with PROMPT 1 to get full setup, then use PROMPT 2-10 for extensions

---

## 🎯 Choose Your Path

### I just want it to work NOW
→ **Copy-Paste (Option 1)** + Run setup script + Start using immediately

### I want to understand how it works
→ **Manual Setup (Option 2)** + Read docs + Build from scratch

### I want customization with AI help
→ **AI-Assisted (Option 3)** + Use AI prompts + Customize for your needs

---

## 📚 Essential Files Reference

Documentation for MASH Custom CMS:

1. **`.github/QUICKSTART.md`** - This file (migration guide)
2. **`.github/MASH_CMS_AI_PROMPTS.md`** - 10 AI prompts for setup/extensions ⭐
3. **`docs/CMS/CMS-INTEGRATION-README.md`** - Complete setup guide (445 lines)
4. **`docs/CMS/CMS-API-IMPLEMENTATION.md`** - API endpoint examples
5. **`docs/CMS/CMS-FINAL-INTEGRATION-GUIDE.md`** - Admin dashboard integration
6. **`docs/CMS/CMS-STRUCTURE-GUIDE.md`** - Making pages CMS-supported
7. **`.github/copilot-instructions.md`** - Reference for patterns

### Files You Need to Copy

From MASH-Ecommerce-Web to Your Project:

| File/Folder | Description | Size | Copy? |
|-------------|-------------|------|-------|
| `src/lib/cms/config.ts` | CMS configuration and utilities | ~50 lines | ✅ Required |
| `src/lib/cms/database.ts` | JSON storage and CRUD operations | ~800 lines | ✅ Required |
| `src/types/cms.ts` | TypeScript interfaces for all content types | ~300 lines | ✅ Required |
| `src/app/api/cms/*` | API routes for all content types | 15+ files | ✅ Required |
| `src/hooks/useCMS.ts` | React hooks for data fetching | ~200 lines | ✅ Required |
| `setup-cms.js` | Initialization script with sample data | ~200 lines | ✅ Recommended |
| `public/uploads/` | Directory for uploaded images | 0 bytes | ✅ Create empty |

**Total:** ~1,600 lines of code + 15+ API route files

---

## ⚠️ Common Mistakes to Avoid

1. ❌ Thinking this is Sanity CMS
   ✅ This is a custom JSON-based CMS, no external service needed

2. ❌ Forgetting to run `node setup-cms.js`
   ✅ Run setup script to initialize sample data

3. ❌ Not copying the `/uploads` folder structure
   ✅ Create `public/uploads/` directory for image uploads

4. ❌ Copying API routes without updating import paths
   ✅ Check all `@/` imports match your project structure

5. ❌ Not installing lucide-react dependency
   ✅ Run `npm install lucide-react` for icon support

6. ❌ Expecting database connection
   ✅ Default uses JSON files - upgrade to DB later if needed

---

## 🎬 Step-by-Step (Copy-Paste Approach)

### Phase 1: Copy CMS Files (15 min)

**Step 1: Copy core CMS files**

```bash
# From MASH-Ecommerce-Web to your-project

# 1. CMS library files
src/lib/cms/
├── config.ts              # Configuration and utilities
└── database.ts            # JSON storage CRUD operations

# 2. TypeScript types
src/types/cms.ts           # All CMS interfaces

# 3. API routes (entire folder)
src/app/api/cms/
├── hero/
│   ├── route.ts           # GET, POST for heroes
│   └── [id]/route.ts      # GET, PUT, DELETE for single hero
├── features/
│   ├── route.ts
│   └── [id]/route.ts
├── faq/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── categories/route.ts
├── about/
├── team/
├── contact/
├── site/
└── upload/route.ts        # File upload handler

# 4. React hooks
src/hooks/useCMS.ts        # useHeroes, useFeatures, useFAQ, etc.

# 5. Setup script
setup-cms.js               # Initialization script (project root)
```

**Step 2: Install dependencies**

```bash
# Only if you don't have these already
npm install lucide-react
```

**Step 3: Create uploads directory**

```bash
mkdir -p public/uploads
```

**Step 4: Run setup script**

```bash
node setup-cms.js
```

**Test:**
```bash
npm run dev
# Open http://localhost:3000/api/cms/hero
# Should see JSON response with hero data
```

---

### Phase 2: Use CMS in Components (15 min)

**Example 1: Hero Section Component**

```typescript
// src/components/HeroSection.tsx
"use client";

import { useHeroes } from "@/hooks/useCMS";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroSection() {
  const { heroes, loading, error } = useHeroes();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const activeHero = heroes.find(h => h.isActive) || heroes[0];

  return (
    <section className="relative h-screen">
      <img 
        src={activeHero.backgroundImages[0]} 
        alt={activeHero.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">{activeHero.title}</h1>
          <p className="text-xl mb-8">{activeHero.subtitle}</p>
          <div className="flex gap-4">
            <Button asChild variant={activeHero.primaryButton.variant}>
              <Link href={activeHero.primaryButton.url}>
                {activeHero.primaryButton.text}
              </Link>
            </Button>
            <Button asChild variant={activeHero.secondaryButton.variant}>
              <Link href={activeHero.secondaryButton.url}>
                {activeHero.secondaryButton.text}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Example 2: Features Section**

```typescript
// src/components/FeaturesSection.tsx
"use client";

import { useFeatures } from "@/hooks/useCMS";
import * as Icons from "lucide-react";

export function FeaturesSection() {
  const { features, loading } = useFeatures();

  if (loading) return <div>Loading features...</div>;

  const activeFeature = features.find(f => f.isActive);
  if (!activeFeature) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">
          {activeFeature.title}
        </h2>
        <p className="text-center text-gray-600 mb-12">
          {activeFeature.subtitle}
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {activeFeature.features.map((feature) => {
            const Icon = Icons[feature.icon as keyof typeof Icons] as any;
            return (
              <div key={feature.id} className="text-center">
                {Icon && <Icon className="w-12 h-12 mx-auto mb-4" />}
                <h3 className="text-xl font-semibold mb-2">
                  {feature.headline}
                </h3>
                <p className="text-gray-600">{feature.subheadline}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

**Then use in pages:**

```typescript
// src/app/page.tsx
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
}
```

---

### Phase 3: Test CMS API (10 min)

**Test all API endpoints:**

```bash
# 1. Test Hero API
curl http://localhost:3000/api/cms/hero
# Should return: { "data": [{ "id": "hero-1", "title": "...", ... }], "success": true }

# 2. Test Features API
curl http://localhost:3000/api/cms/features

# 3. Test FAQ API
curl http://localhost:3000/api/cms/faq

# 4. Test FAQ Categories
curl http://localhost:3000/api/cms/faq/categories
```

**Or create test page:**

```typescript
// src/app/test-cms/page.tsx
import Link from 'next/link';

export default function TestCMSPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CMS API Test✅</h1>
      <div className="space-y-2">
        <div>
          <Link 
            href="/api/cms/hero" 
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            Test Hero API →
          </Link>
        </div>
        <div>
          <Link 
            href="/api/cms/features" 
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            Test Features API →
          </Link>
        </div>
        <div>
          <Link 
            href="/api/cms/faq" 
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            Test FAQ API →
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Test:** Visit `http://localhost:3000/test-cms`

---

### Phase 4: Customize Content (Optional - 30 min)

**Add your own content types:**

1. **Add new type to `src/types/cms.ts`:**

```typescript
// Example: Testimonials
export interface Testimonial extends CMSBaseModel {
  author: string;
  role: string;
  content: string;
  avatar?: string;
  rating: number;
}
```

2. **Add API route `src/app/api/cms/testimonials/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { TestimonialsAPI } from '@/lib/cms/database';

export async function GET() {
  const testimonials = await TestimonialsAPI.getAll();
  return NextResponse.json({ data: testimonials, success: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newTestimonial = await TestimonialsAPI.create(body);
  return NextResponse.json({ data: newTestimonial, success: true });
}
```

3. **Add to `src/lib/cms/database.ts`:**

```typescript
export const TestimonialsAPI = {
  async getAll() {
    const data = await readJSON('testimonials.json');
    return data || [];
  },
  async create(testimonial: Testimonial) {
    const data = await this.getAll();
    data.push({ ...testimonial, id: generateId(), createdAt: new Date().toISOString() });
    await writeJSON('testimonials.json', data);
    return testimonial;
  },
  // Add getById, update, delete methods
};
```

4. **Add hook to `src/hooks/useCMS.ts`:**

```typescript
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data.data))
      .finally(() => setLoading(false));
  }, []);

  return { testimonials, loading };
}
```

---

### Phase 5: Upgrade to Database (Optional - 1 hour)

**Replace JSON storage with PostgreSQL/MongoDB:**

See `docs/CMS/CMS-FINAL-INTEGRATION-GUIDE.md` for database upgrade guide.

**Quick overview:**
1. Install Prisma: `npm install prisma @prisma/client`
2. Create schema in `prisma/schema.prisma`
3. Update `src/lib/cms/database.ts` to use Prisma instead of JSON files
4. Migrate data: `npx prisma migrate dev`

**Benefits:**
- ✅ Better performance
- ✅ Concurrent writes
- ✅ Data integrity
- ✅ Easier querying
- ✅ Production-ready

---

### Phase 6: Admin Dashboard (Optional - 2 hours)

**Build admin interface to manage content:**

See `docs/CMS/CMS-ADMIN-DASHBOARD-INTERFACE.md` for complete guide.

**Quick overview:**
1. Create admin pages (e.g., `/admin/cms/heroes`)
2. Add CRUD forms for each content type
3. Implement file upload UI
4. Add preview functionality
5. Protect routes with authentication

**Or use existing solution:**
- Copy admin pages from MASH-Admin-Dashboard (separate repo)
- Integrate with your authentication system

---

## ✅ Verification Checklist

After setup, verify these work:

**API Endpoints:**
- [ ] `/api/cms/hero` returns hero data (200 OK)
- [ ] `/api/cms/features` returns features data (200 OK)
- [ ] `/api/cms/faq` returns FAQ items (200 OK)
- [ ] `/api/cms/faq/categories` returns categories (200 OK)
- [ ] `/api/cms/upload` accepts file uploads (200 OK)

**React Hooks:**
- [ ] `useHeroes()` fetches heroes without errors
- [ ] `useFeatures()` fetches features without errors
- [ ] `useFAQ()` fetches FAQ items without errors
- [ ] Loading states work correctly
- [ ] Error handling displays properly

**Components:**
- [ ] HeroSection displays on homepage
- [ ] FeaturesSection displays correctly
- [ ] Images load from `/uploads` directory
- [ ] Buttons link to correct URLs
- [ ] Icons display (lucide-react working)

**Data Storage:**
- [ ] JSON files created in `data/cms/` directory
- [ ] `setup-cms.js` populated initial content
- [ ] Image uploads save to `public/uploads/`

---

## 🆘 If Something Breaks

### API returns 404 error
**Problem:** API routes not found  
**Solution:** 
- Check files copied to `src/app/api/cms/` directory
- Verify Next.js app router structure (not pages router)
- Restart dev server: `npm run dev`

### "Module not found" errors
**Problem:** Import paths don't match  
**Solution:**
- Check `tsconfig.json` has `"@/*": ["./src/*"]` path alias
- Update all imports to use `@/` prefix
- Verify file extensions (.ts, .tsx) are correct

### Images not uploading
**Problem:** Upload endpoint fails  
**Solution:**
- Create `public/uploads/` directory: `mkdir -p public/uploads`
- Check file permissions (writable)
- Verify `fs` module available (Node.js 18+)

### JSON data not saving
**Problem:** Data lost on restart  
**Solution:**
- Run `node setup-cms.js` to initialize data files
- Check `data/cms/` directory exists and is writable
- For production, upgrade to database (PostgreSQL/MongoDB)

### Hooks return empty data
**Problem:** `useHeroes()` returns `[]`  
**Solution:**
- Check API endpoint works: visit `/api/cms/hero` in browser
- Run setup script: `node setup-cms.js`
- Check browser console for fetch errors
- Verify CORS if using separate frontend domain

### lucide-react icons not showing
**Problem:** Icons display as missing  
**Solution:**
- Install: `npm install lucide-react`
- Check icon name matches Lucide docs: https://lucide.dev
- Example: `import { Sparkles } from 'lucide-react'`

---

## 📞 Need More Help?

1. **Check full guide**: `docs/CMS/CMS-INTEGRATION-README.md` (445 lines, covers everything)
2. **API examples**: `docs/CMS/CMS-API-IMPLEMENTATION.md` (complete endpoint code)
3. **Admin dashboard**: `docs/CMS/CMS-ADMIN-DASHBOARD-INTERFACE.md` (UI patterns)
4. **Structure guide**: `docs/CMS/CMS-STRUCTURE-GUIDE.md` (making pages CMS-supported)
5. **Next.js Docs**: https://nextjs.org/docs
6. **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

## 🎉 Success Looks Like

```bash
# Terminal - Your app running
npm run dev
# ✅ Dev server at http://localhost:3000

# Browser - Test API endpoints
http://localhost:3000/api/cms/hero
# ✅ Returns: { "data": [{ "id": "hero-1", ... }], "success": true }

http://localhost:3000/api/cms/features
# ✅ Returns: { "data": [{ "id": "features-1", ... }], "success": true }

http://localhost:3000/api/cms/faq
# ✅ Returns: { "data": [{ "id": "faq-1", ... }], "success": true }

# Browser - Test components
http://localhost:3000/
# ✅ HeroSection displays with content from CMS
# ✅ FeaturesSection displays with icons and descriptions
# ✅ Images load from /uploads directory
# ✅ Buttons link to correct pages
# ✅ No console errors

# Code
# ✅ TypeScript recognizes all CMS types
# ✅ useHeroes(), useFeatures() hooks work
# ✅ No import errors
# ✅ Hot reload works correctly
```

**You now have:** 
- ✅ Custom JSON-based CMS (no external service)
- ✅ Full TypeScript support
- ✅ React hooks for easy data fetching
- ✅ REST API with CRUD operations
- ✅ File upload system
- ✅ Hero, Features, FAQ, About, Team, Contact content types
- ✅ Ready to upgrade to database (PostgreSQL/MongoDB)
- ✅ Ready to add admin dashboard

---

## 🚀 Next Steps After Migration

### Immediate (Essential)
1. **Add your content** - Replace sample data with real content
2. **Customize types** - Add/remove fields in `src/types/cms.ts`
3. **Test thoroughly** - Verify all API endpoints work
4. **Add error handling** - Improve error messages and fallbacks

### Short-term (Recommended)
5. **Build admin UI** - Create pages to manage content (see `docs/CMS/CMS-ADMIN-DASHBOARD-INTERFACE.md`)
6. **Upgrade to database** - Replace JSON with PostgreSQL/MongoDB for production
7. **Add authentication** - Protect admin routes with Clerk/NextAuth
8. **Optimize images** - Use Next.js Image component for all CMS images

### Long-term (Optional)
9. **Add more content types** - Blog posts, products, testimonials, etc.
10. **Implement versioning** - Track content changes and revisions
11. **Add search** - Full-text search across all content
12. **Set up webhooks** - Real-time updates when content changes
13. **Deploy** - Push to Vercel/Netlify (JSON files included in deployment)

---

## 💡 Pro Tips

**For Beginners:**
- ✅ Start with copy-paste approach (Option 1)
- ✅ Test each API endpoint individually
- ✅ Use browser DevTools to inspect API responses
- ✅ Don't worry about database upgrade initially - JSON works fine for development

**For Experienced Developers:**
- ✅ Skip JSON storage, go straight to Prisma + PostgreSQL
- ✅ Add validation schemas with Zod
- ✅ Implement rate limiting on API routes
- ✅ Add caching with React Query or SWR
- ✅ Use TypeScript strict mode

**For Everyone:**
- ✅ **Commit after each phase** - easy to rollback if something breaks
- ✅ **Read error messages carefully** - they usually tell you exactly what's wrong
- ✅ **Check the docs first** - `docs/CMS/` has 400+ lines of examples
- ✅ **Use AI for repetitive tasks** - generating API routes, hooks, types
- ✅ **Test with real data early** - don't rely on sample data for too long
- ✅ **Keep CMS simple** - start with basic content types, add complexity later

---

**Time to start?** Pick your approach above and go! 🚀

---

## 📚 Quick Links

**Migration Guides:**
- ⚡ This file: `.github/QUICKSTART.md` (Quick start guide)
- 🤖 AI prompts: `.github/MASH_CMS_AI_PROMPTS.md` (10 copy-paste prompts) ⭐
- 📖 Full guide: `docs/CMS/CMS-INTEGRATION-README.md` (445 lines)

**Documentation:**
- 🛠️ API implementation: `docs/CMS/CMS-API-IMPLEMENTATION.md`
- 🏛️ Admin dashboard: `docs/CMS/CMS-ADMIN-DASHBOARD-INTERFACE.md`
- 🏗️ Structure guide: `docs/CMS/CMS-STRUCTURE-GUIDE.md`
- 🧠 Project reference: `.github/copilot-instructions.md`

**Files to Copy:**
- `src/lib/cms/` (config.ts, database.ts)
- `src/types/cms.ts`
- `src/app/api/cms/` (entire folder)
- `src/hooks/useCMS.ts`
- `setup-cms.js`

**External Resources:**
- Next.js App Router: https://nextjs.org/docs/app
- TypeScript: https://www.typescriptlang.org/docs
- Lucide Icons: https://lucide.dev
- shadcn/ui: https://ui.shadcn.com

**Quick Decision Tree:**
```
Need to migrate MASH CMS?
├─ Want fastest path? → Copy files + run setup script (30-60 min)
├─ Want to learn? → Read docs/CMS/CMS-INTEGRATION-README.md (2-3 hours)
├─ Want AI help? → Use .github/MASH_CMS_AI_PROMPTS.md (1-2 hours)
└─ Need specific feature? → Check prompts 2-10 in MASH_CMS_AI_PROMPTS.md
```

---

**Good luck with your CMS migration!** 🍀

If you get stuck, remember: **The docs are your friend.** Check `docs/CMS/` first - there are 400+ lines of examples and troubleshooting.

💡 **Pro tip:** Start simple. Copy files → Run setup script → Test APIs → Use in components. Don't overthink it!
