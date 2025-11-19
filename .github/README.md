# .github Documentation

This folder contains comprehensive documentation for the **MASH E-Commerce Web** project.

**✅ DUAL CMS ARCHITECTURE - FULLY OPERATIONAL:**
- **✅ Sanity CMS** - E-Commerce products (DEPLOYED TO PRODUCTION) ⭐
- **✅ Custom JSON CMS** - Static marketing content (IMPLEMENTED & READY)

**📖 Complete Architecture Guide:** `DUAL_CMS_ARCHITECTURE.md` ⭐ START HERE

---

## 📚 Documentation Index

### 🏗️ **NEW: Dual CMS Architecture** ⭐ START HERE

#### `DUAL_CMS_ARCHITECTURE.md`
**Complete guide to MASH's dual content management system**
- **Status:** ✅ FULLY OPERATIONAL (Both CMS systems integrated)
- **Sanity CMS:** Products, categories, blog, hero carousel
- **JSON CMS:** Features, FAQ, about, team, contact
- Architecture overview with diagrams
- When to use each CMS system
- Usage guides for both systems
- Current deployment status
- Next steps and best practices

**When to use:** Understanding the full CMS architecture, deciding which CMS to use

---

### 🎯 Sanity CMS Integration (E-Commerce Products) ✅ DEPLOYED

#### `SANITY_NEW_PROJECT_SETUP.md`
**Latest project setup with new tokens and deployment**
- **Status:** ✅ COMPLETE - New project (2grm6gj7) deployed
- **Production:** https://mash-ecommerce.sanity.studio
- **Local:** http://localhost:3333
- New API tokens configured
- Environment variables updated
- Studio deployed and operational

**When to use:** Reference for current Sanity setup, tokens, and deployment info

#### `SANITY_INTEGRATION_PROGRESS.md`
**Integration progress report**
- Integration status: 60% complete
- Sanity Studio deployed
- Product schema with full e-commerce fields
- Step-by-step guide for non-technical users
- Next steps and remaining tasks

**When to use:** Check current Sanity integration status, learn how to add products

---

### 🤖 AI Agent Guides

#### `copilot-instructions.md` 
**Primary AI reference for this codebase**
- Architecture overview (Next.js 15 + Custom CMS + NestJS backend + Clerk auth)
- Development workflows (dev commands, authentication, API integration)
- Content model & data flow (Custom CMS types, JSON storage, API routes)
- Integration points (Railway backend, Clerk SSO, custom CMS)
- Project-specific patterns (route groups, barrel exports, component organization)
- Common tasks (quick reference for frequent operations)

**When to use:** Working in THIS codebase (MASH-Ecommerce-Web)

---

### 🎯 Sanity CMS Documentation (E-Commerce Products) ⭐ RECOMMENDED

#### `SANITY_SESSION_SUMMARY.md`
**Latest session summary and progress report**
- **What:** Phase 1 complete - Sanity CMS integrated (60%)
- **When to use:** Check current status, understand what's done
- **Status:** Sanity Studio running at http://localhost:3333
- **Next:** Phase 2 - Frontend integration (shop page)

#### `SANITY_COMPLETE_GUIDE.md` ⭐ NON-TECHNICAL USER GUIDE
**Complete guide for adding and managing products**
- **What:** Step-by-step instructions for content managers
- **When to use:** Learn how to add products without code
- **Includes:** Screenshots, examples, FAQs, troubleshooting
- **Time:** 5 minutes to add a product

#### `SANITY_INTEGRATION_PROGRESS.md`
**Technical progress report and architecture**
- **What:** Detailed integration status and technical details
- **When to use:** Understand dual CMS architecture, check tasks
- **For:** Developers implementing frontend integration
- **Includes:** Code examples, queries, component patterns

---

### 🔄 CMS Migration Guides (For Using MASH CMS in Other Projects)

#### `QUICKSTART.md` ⭐ START HERE (Custom JSON CMS)
**Quick guide to copying MASH's custom CMS to another project**
- What is MASH CMS (JSON-based, no external service)
- Three migration paths (Copy-Paste, Manual, AI-Assisted)
- TL;DR fastest path (30-60 minutes)
- Step-by-step guide with code examples
- Verification checklist
- Troubleshooting common issues

**When to use:** First time migrating MASH CMS, want fastest approach

**Length:** Quick read | **Time:** 30 minutes to 2 hours

**What you get:**
- ✅ Hero sections (homepage banners)
- ✅ Features sections (USP cards)
- ✅ FAQ system (categories + items)
- ✅ About page content (hero, challenges, solutions, vision, mentors)
- ✅ Team members
- ✅ Contact information
- ✅ Site settings
- ✅ File upload system

---

#### `MASH_CMS_AI_PROMPTS.md` ⭐ AI-ASSISTED MIGRATION
**Copy-paste AI prompts specifically for MASH custom CMS**
- 10 comprehensive prompts for different tasks:
  1. Complete CMS setup (full implementation)
  2. Add custom content type (extend CMS)
  3. Upgrade to database (PostgreSQL/MongoDB)
  4. Create admin dashboard (manage content via UI)
  5. Add image upload UI (drag-and-drop)
  6. Implement content versioning (track changes)
  7. Add search functionality (full-text search)
  8. Create content preview (preview before publish)
  9. Add rate limiting (protect APIs)
  10. Migrate existing data (import from other CMS)
- Each prompt includes:
  • Complete requirements
  • Technical specifications
  • Expected output
  • Usage examples
  • Customization instructions
- Quick selection guide (which prompt for which task)
- Tips for using AI effectively
- Troubleshooting common AI output issues

**When to use:** Want AI to generate code for MASH CMS setup/extensions

**How to use:**
1. Choose prompt based on your goal
2. Customize placeholders with your specifics
3. Copy entire prompt to AI assistant
4. Review and test generated code
5. Iterate if needed

**Length:** ~850 lines | **Time saved:** 50-70% vs manual coding

---

#### ⚠️ `SANITY_MIGRATION_GUIDE.md` - DEPRECATED
**This guide is for a DIFFERENT project (J5 Pharmacy)**

MASH does **NOT** use Sanity CMS. If you see references to:
- `studio/` folder
- `sanity.config.ts`
- GROQ queries
- Sanity Studio on port 3333

→ These are from the old J5 Pharmacy project and **do not apply to MASH**.

**Instead, use:**
- `QUICKSTART.md` for MASH CMS migration guide
- `MASH_CMS_AI_PROMPTS.md` for AI-assisted setup
- `docs/CMS/CMS-INTEGRATION-README.md` for manual setup

**Status:** Kept for reference only, not applicable to MASH

---

#### ⚠️ `AI_PROMPTS_FOR_MIGRATION.md` - DEPRECATED
**This file contains prompts for Sanity CMS (J5 Pharmacy project)**

For MASH custom CMS prompts, use:
- ✅ `MASH_CMS_AI_PROMPTS.md` (MASH-specific prompts)

**Status:** Kept for reference only, not applicable to MASH

---

#### `MIGRATION_CHECKLIST.md`
**Interactive checklist to track migration progress**
- 8-phase breakdown with sub-tasks
- File-by-file checklist (what to copy from where)
- Configuration verification steps
- Test procedures for each phase
- Progress tracker
- Success criteria (10 checkpoints)
- Notes section for customizations

**When to use:** Active migration in progress, need to track what's done

**How to use:** 
1. Print or keep open in editor
2. Check off tasks as completed
3. Use notes section to track custom changes

**Length:** Checklist format | **Estimated migration time:** 2-4 hours

---

#### `MIGRATION_MAP.md`
**Visual guide to all migration documents**
- Flow diagram showing document relationships
- Usage patterns (Manual, AI, Hybrid)
- Document purpose guide
- Cross-references between docs
- Learning paths for different skill levels
- Decision tree for choosing approach

**When to use:** Understanding how all migration docs fit together

**How to use:** Reference map to navigate between documents efficiently

---

### 🧪 Testing Documentation

#### `postman/` folder
**Lalamove API testing collection**
- Complete Postman collection (10 endpoints)
- Environment file with sandbox credentials
- Testing checklist (`TESTING_CHECKLIST.md`)
- Quick fix guide (`QUICK_FIX.md`)
- Test results (8/10 passing - see `README.md`)

**When to use:** Testing Lalamove delivery integration

---

## 🎯 Quick Navigation

**I want to...**

### Work on this project (j5ecommerce)
→ Read `copilot-instructions.md`

### Set up same CMS in another project
→ Start with `QUICKSTART.md` (choose your path) ⭐

### Get step-by-step migration instructions
→ Follow `SANITY_MIGRATION_GUIDE.md`

### Get AI help with migration
→ Use `AI_PROMPTS_FOR_MIGRATION.md`

### Track migration progress
→ Use `MIGRATION_CHECKLIST.md`

### Test Lalamove API
→ See `postman/README.md`

### Understand Sanity schema
→ See `copilot-instructions.md` → "Content Model & Data Flow"

### Add new Sanity block type
→ See `copilot-instructions.md` → "Page Builder System"

### Update product stock
→ See `copilot-instructions.md` → "Product schema" & "Order Flow"

### Troubleshoot Sanity types
→ See `SANITY_MIGRATION_GUIDE.md` → Part 9 "Common Issues"

---

## 📖 Reading Order

### For New Contributors (This Project)
1. `copilot-instructions.md` (full read)
2. `postman/README.md` (if working with Lalamove)
3. Dive into code with context

### For Migration (Different Project)
1. `SANITY_MIGRATION_GUIDE.md` (skim overview)
2. `MIGRATION_CHECKLIST.md` (print/keep open)
3. `SANITY_MIGRATION_GUIDE.md` (follow step-by-step)
4. `AI_PROMPTS_FOR_MIGRATION.md` (use as needed)
5. `copilot-instructions.md` (reference for patterns)

### For Quick Reference
- **Dev commands**: `copilot-instructions.md` → "Development Workflows"
- **Environment vars**: `copilot-instructions.md` → "Environment Setup"
- **GROQ queries**: Check `frontend/sanity/lib/queries.ts`
- **Schema files**: Check `studio/src/schemaTypes/`

---

## 🔗 External Resources

- **Sanity Docs**: https://www.sanity.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Lalamove API**: https://developers.lalamove.com
- **GROQ Playground**: https://groq.dev
- **Firebase Docs**: https://firebase.google.com/docs

---

## 📝 Document Maintenance

### Last Updated
- `copilot-instructions.md`: November 19, 2025
- `SANITY_MIGRATION_GUIDE.md`: November 19, 2025
- `AI_PROMPTS_FOR_MIGRATION.md`: November 19, 2025
- `MIGRATION_CHECKLIST.md`: November 19, 2025

### Update These When...
- **copilot-instructions.md**: Architecture changes, new integration added, major patterns change
- **SANITY_MIGRATION_GUIDE.md**: Schema changes, new singleton added, config templates update
- **AI_PROMPTS_FOR_MIGRATION.md**: New migration scenarios, prompt improvements
- **MIGRATION_CHECKLIST.md**: File structure changes, new phases added

---

## 💡 Tips

### For AI Assistants
- Always start with `copilot-instructions.md` for context
- Reference specific sections when asking questions
- Mention which document you're working from

### For Developers
- Keep `copilot-instructions.md` open while coding
- Use `MIGRATION_CHECKLIST.md` for tracking (don't skip steps)
- Test each phase before moving to next (see verification sections)

### For Content Editors
- Log into Sanity Studio: `cd studio && npm run dev` → `http://localhost:3333`
- See `studio/src/schemaTypes/` for available content types
- Featured Products, Hero Carousel, Settings are in sidebar

---

## 🎓 Learning Path

**Beginner** (Never used Sanity):
1. Read `copilot-instructions.md` → "Content Model & Data Flow"
2. Explore Studio UI (create test product)
3. Read `SANITY_MIGRATION_GUIDE.md` → Parts 1-2 (theory)

**Intermediate** (Know Sanity basics):
1. Read `copilot-instructions.md` (full)
2. Review `frontend/sanity/lib/queries.ts` (GROQ examples)
3. Try creating custom block type (follow guide in copilot-instructions.md)

**Advanced** (Doing migration):
1. Use `MIGRATION_CHECKLIST.md` (track progress)
2. Follow `SANITY_MIGRATION_GUIDE.md` (detailed steps)
3. Use `AI_PROMPTS_FOR_MIGRATION.md` (speed up tasks)

---

## 🆘 Getting Help

1. **Check docs first**: Search this folder for keywords
2. **Sanity-specific**: https://www.sanity.io/help
3. **Next.js-specific**: https://nextjs.org/docs
4. **Project-specific**: Create GitHub issue (reference which doc section)

---

**Repository**: j5ecommerce
**Owner**: Genrei123
**Framework**: Next.js 15 (App Router)
**CMS**: Sanity v3
**Last Doc Update**: November 19, 2025
