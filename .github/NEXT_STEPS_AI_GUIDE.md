# Next Steps AI Guide - MASH E-Commerce Platform

> **Last Updated:** February 2026
> **Status:** Test Suite Healthy (729/731 passing), Build Stable
> **Ready For:** Feature Development & PRD Implementation

---

## 🎯 Quick Context for New AI Session

Copy this prompt to continue development:

```
I'm working on the MASH E-Commerce Platform (Next.js 16 + Sanity CMS + Firebase + NestJS).

**Current State:**
- ✅ All tests passing (729/731 - 2 intentionally skipped)
- ✅ Build passing with no errors
- ✅ Cookie mock pattern working correctly

**Key Files to Read First:**
1. `.github/copilot-instructions.md` - RALPH methodology & architecture
2. `progress.txt` - Codebase patterns & learnings
3. `prd.json` - Current PRD stories

**Task:** [INSERT YOUR SPECIFIC TASK HERE]

Follow RALPH methodology: Context → Story Selection → Implementation → Quality Checks → Documentation
```

---

## 📊 Current System Health

| Metric | Status | Details |
|--------|--------|---------|
| **Test Suite** | ✅ PASS | 729/731 tests (99.7%) |
| **Build** | ✅ PASS | All routes generated |
| **TypeScript** | ✅ PASS | No type errors |
| **Lint** | ✅ PASS | Clean output |

---

## 🔧 Key Codebase Patterns (Must Know)

### 1. Cookie Mock Pattern (Jest)
```javascript
// Tests use global mock from jest.setupMocks.js
const mockCookies = global.__mockCookies as typeof import('@/lib/cookies');
mockCookies.getCookieJSON.mockReturnValue(userData);
```

### 2. Cart Format (v2)
```typescript
{ version: 2, items: CartItem[], updatedAt: string }
```

### 3. Sanity Images (GROQ)
```groq
"mainImage": coalesce(mainImage.asset->url, image.asset->url)
```

### 4. Backend Enums
Always UPPERCASE: `USER`, `BUYER`, `GROWER`, `ADMIN`

### 5. Route Protection
File: `src/proxy.ts` (Next.js 16 renamed from middleware.ts)

---

## 🚀 Recommended Next Development Areas

### Priority 1: E-Commerce Core Features
1. **Inventory Management** - Stock tracking, low stock alerts
2. **Order Fulfillment** - Shipping status updates, tracking
3. **Payment Integration** - PayMongo webhooks, refund handling
4. **Reviews & Ratings** - Product reviews, seller ratings

### Priority 2: User Experience
1. **Search Enhancement** - Filters, sorting, faceted search
2. **Wishlist Improvements** - Share wishlist, price alerts
3. **Checkout Optimization** - Guest checkout, saved addresses
4. **Mobile PWA** - Offline support, push notifications

### Priority 3: Seller Dashboard
1. **Analytics Dashboard** - Sales reports, trends
2. **Product Bulk Upload** - CSV import, batch editing
3. **Order Management** - Bulk actions, print labels
4. **Communication** - Customer messaging, notifications

### Priority 4: Admin Features
1. **User Management** - Role assignment, account status
2. **Content Moderation** - Review moderation, product approval
3. **System Settings** - Feature flags, configurations
4. **Reporting** - Sales reports, user analytics

---

## 📋 Prompt Templates for Common Tasks

### Add New Feature
```
Task: Implement [FEATURE NAME]

Requirements:
- [Requirement 1]
- [Requirement 2]

Files that may need changes:
- [Relevant file paths]

Follow RALPH methodology and update progress.txt when complete.
```

### Fix Bug
```
Bug: [DESCRIPTION]

Steps to reproduce:
1. [Step 1]
2. [Step 2]

Expected behavior: [Expected]
Actual behavior: [Actual]

Investigate root cause, implement fix, add regression test.
```

### Add Tests
```
Task: Add unit tests for [COMPONENT/MODULE]

Target coverage areas:
- [Area 1]
- [Area 2]

Use Jest with existing mock patterns from jest.setupMocks.js.
Follow existing test patterns in src/__tests__/ directories.
```

### Update PRD
```
Task: Update prd.json with new user stories for [FEATURE AREA]

Current PRD status: Review prd.json
Add stories following format:
{
  "id": "STORY-XXX",
  "title": "Story title",
  "description": "Story description",
  "priority": 1-5,
  "passes": false,
  "acceptanceCriteria": []
}
```

---

## 🏗️ Architecture Quick Reference

```
Frontend (Next.js 16 - Railway)
├── www.mashmarket.app (production)
├── beta.mashmarket.app (development)
├── zen.mashmarket.app (admin panel)
└── join.mashmarket.app (landing - tentative)

Backend (NestJS - Railway)
└── api.mashmarket.app/api/v1

Data Sources:
├── Sanity CMS → Products, content, marketing
├── Firebase → Google OAuth, Firestore profiles
└── Backend → Orders, transactions, email auth
```

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't use localhost URLs** in production `.env`
2. **Always run `npm run build`** before `npm run dev`
3. **Use UPPERCASE** for backend enum values
4. **Use `coalesce()`** for Sanity image fields
5. **Test mocks** must use global pattern, not direct imports
6. **Proxy file** is `src/proxy.ts`, not `middleware.ts`

---

## 📁 File Locations Quick Reference

| Purpose | Location |
|---------|----------|
| Pages | `src/app/(route-group)/path/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| Proxy (auth) | `src/proxy.ts` |
| Sanity queries | `src/lib/sanity/queries.ts` |
| Types | `src/types/` |
| Components | `src/components/` |
| Contexts | `src/contexts/` |
| Tests | `src/**/__tests__/` |
| E2E tests | `e2e/tests/` |
| Scripts | `scripts/` |
| Documentation | `.github/` |

---

## 🔄 RALPH Workflow Reminder

```
1. Context Gathering → Read prd.json, progress.txt, CLAUDE.md files
2. Story Selection → Pick highest priority incomplete story
3. Implementation → Apply codebase patterns, minimal changes
4. Quality Checks → npm run build, npm run lint, npm test
5. Documentation → Update progress.txt, CLAUDE.md files
6. Git Commit → Atomic commits with standard format
7. PRD Update → Mark story as passes: true
8. Stop Check → Continue if stories remain
```

---

## 📞 Support Resources

- **Sanity Studio:** https://ppnamias.sanity.studio
- **Firebase Console:** https://console.firebase.google.com/u/7/project/mash-ddf8d/
- **Railway Dashboard:** Check deployment status
- **Documentation:** `.github/` folder

---

*This guide was auto-generated to help continue MASH E-Commerce development. Update as the project evolves.*
