# 🚀 SELLER-021 Quick Start

> **Current Status:** Phase 2 in Progress (6/23 stories, 26% complete)  
> **Next Story:** P2-03 - StockAdjustmentForm Component  
> **Branch:** `107-seller-021-stock-level-management`

---

## ⚡ Continue Development (Copy & Paste)

```bash
# Quick command to continue:
Continue SELLER-021 Phase 2 - Implement P2-03 (StockAdjustmentForm Component)
```

**Alternative prompts:**
- Simple: `Continue SELLER-021 - Next story`
- With status: `Continue SELLER-021. Status: Phase 2 (2/4) - 6/23 stories (26%). Next: P2-03`

---

## 📊 Progress Overview

```
✅ Phase 1: Foundation                    [████████████████████] 100%
🔄 Phase 2: Core Adjustment System        [██████████          ] 50%
⏳ Phase 3: Threshold Configuration       [                    ] 0%
⏳ Phase 4: Batch CSV Import              [                    ] 0%
⏳ Phase 5: Audit Trail                   [                    ] 0%
⏳ Phase 6: Integration                   [                    ] 0%
⏳ Phase 7: Testing & Deployment          [                    ] 0%

Overall:                                  [█████               ] 26%
```

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| [`prd-seller-021.json`](./prd-seller-021.json) | Complete PRD with all stories, acceptance criteria, and tracking |
| [`.github/SELLER-021-NEXT-STEPS.md`](./.github/SELLER-021-NEXT-STEPS.md) | Detailed next-step guide for current story (P2-03) |
| [`.github/SELLER-021-PROGRESS-SUMMARY.md`](./.github/SELLER-021-PROGRESS-SUMMARY.md) | Visual progress dashboard with metrics |
| [`README-SELLER-021.md`](./README-SELLER-021.md) | This quick reference (you are here) |

---

## ✅ Completed (Phase 1 & 2)

**Phase 1: Foundation** ✅
- ✅ P1-01: Stock Management Types (src/types/stock-management.ts)
- ✅ P1-02: Sanity Stock Adjustment Schema
- ✅ P1-03: Product Schema Extensions
- ✅ P1-04: GROQ Queries

**Phase 2: Core Adjustment System** 🔄
- ✅ P2-01: Stock Adjustment Mutations
- ✅ P2-02: Stock Adjustment API Route
- 🔄 P2-03: StockAdjustmentForm Component ← **YOU ARE HERE**
- ⏳ P2-04: useStockManagement Hook

---

## 🎯 Next Story: P2-03

**Title:** Create StockAdjustmentForm Component  
**Estimated Time:** 5 hours  
**Files to Create:**
- `src/components/seller/stock/StockAdjustmentForm.tsx`
- `src/components/seller/stock/StockAdjustmentForm.test.tsx`

**Key Features:**
- Product selection dropdown (searchable)
- Adjustment type radio group (6 types)
- Quantity input with +/- buttons
- Dynamic reason dropdown (filtered by type)
- Notes textarea (optional, 500 char max)
- Current stock + new stock preview
- Full validation with Zod
- Optimistic UI updates
- Comprehensive tests

**Quick Checklist:**
- [ ] React Hook Form setup with Zod validation
- [ ] All form fields with proper validation
- [ ] Real-time stock preview calculation
- [ ] Submit to `/api/seller/stock/adjust`
- [ ] Success/error toast notifications
- [ ] Unit tests (35+ test cases)
- [ ] Quality checks: `npm run build && npm run lint && npm test`
- [ ] Git commit with standard format
- [ ] Update PRD: mark P2-03 complete

---

## 🛠️ Development Commands

```bash
# Start development
npm run build   # ALWAYS build first
npm run dev     # Start dev server

# Run tests
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test StockAdjustmentForm.test.tsx  # Specific test

# Quality checks
npm run build   # Check TypeScript errors
npm run lint    # Check ESLint
```

---

## 📈 Project Metrics

| Metric | Value |
|--------|-------|
| Stories Complete | 6 / 23 (26%) |
| Time Completed | 17 / 70 hours (24%) |
| Test Coverage | 85%+ ✅ |
| Build Time | 28.7s ✅ |
| TypeScript Errors | 0 ✅ |
| Total Tests | 614 passing ✅ |
| Estimated Completion | 2026-02-09 (on track) |

---

## 🔍 Quick Links

**Code References:**
- Types: [`src/types/stock-management.ts`](./src/types/stock-management.ts)
- Mutations: [`src/lib/sanity/mutations/stock-management.ts`](./src/lib/sanity/mutations/stock-management.ts)
- API Route: [`src/app/api/seller/stock/adjust/route.ts`](./src/app/api/seller/stock/adjust/route.ts)

**Similar Components (for patterns):**
- Form Pattern: `src/components/seller/products/ProductForm.tsx`
- Stock Input: `src/components/seller/inventory/QuickStockUpdate.tsx`

**Tests:**
- Type Tests: [`src/types/stock-management.test.ts`](./src/types/stock-management.test.ts)
- Query Tests: [`src/lib/sanity/queries/stock-management.test.ts`](./src/lib/sanity/queries/stock-management.test.ts)

---

## 💡 Key Patterns (from progress.txt)

```typescript
// Stock validation
import { validateStockAdjustment, calculateNewStock } from '@/types/stock-management';

// Reason dropdown
import { getReasonsForType, STOCK_ADJUSTMENT_REASONS } from '@/types/stock-management';

// Form validation
import { StockAdjustmentRequestSchema } from '@/types/stock-management';

// API call
const response = await fetch('/api/seller/stock/adjust', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

---

## 🎓 Remember

**Ralph's Workflow:**
1. Read PRD for acceptance criteria
2. Review existing patterns
3. Implement with tests
4. Run quality checks
5. Commit with standard format
6. Update PRD status
7. Continue to next story

**Quality Requirements:**
- `npm run build` must pass (0 errors)
- `npm run lint` must be clean
- All tests must pass
- TypeScript strict mode (no `any`)
- Comprehensive test coverage

---

## 🆘 Troubleshooting

**Build errors?**
```bash
npm run build   # See detailed errors
```

**Test failures?**
```bash
npm test -- --verbose  # See detailed output
```

**Need help?**
- Check [`.github/SELLER-021-NEXT-STEPS.md`](./.github/SELLER-021-NEXT-STEPS.md) for detailed guidance
- Review `progress.txt` Codebase Patterns section (first 50 lines)
- Look at similar components for patterns

---

**Ready to continue?**

```bash
Continue SELLER-021 Phase 2 - Implement P2-03 (StockAdjustmentForm Component)
```
