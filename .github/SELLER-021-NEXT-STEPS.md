# SELLER-021 Stock Management - Next Steps Guide

> **Last Updated:** 2026-02-02  
> **Current Status:** Phase 2 in Progress (6/23 stories complete - 26%)  
> **Next Story:** P2-03 - StockAdjustmentForm Component

---

## 📊 Project Overview

**Project:** MASH E-Commerce - Seller Stock Level Management System  
**GitHub Issue:** [#107](https://github.com/MASH-Mushroom-Automation/MASH-Ecommerce-Web/issues/107)  
**Branch:** `107-seller-021-stock-management`  
**Target Completion:** 2026-02-09 (7 days remaining)

### Progress Summary

```
✅ Phase 1: Foundation (COMPLETE)
   - P1-01: Stock Management Types ✅
   - P1-02: Sanity Stock Adjustment Schema ✅
   - P1-03: Product Schema Extensions ✅
   - P1-04: GROQ Queries ✅

🔄 Phase 2: Core Adjustment System (50% COMPLETE)
   - P2-01: Stock Adjustment Mutations ✅
   - P2-02: Stock Adjustment API Route ✅
   - P2-03: StockAdjustmentForm Component 🔄 ← YOU ARE HERE
   - P2-04: useStockManagement Hook ⏳

⏳ Phase 3: Threshold Configuration (0%)
⏳ Phase 4: Batch CSV Import (0%)
⏳ Phase 5: Audit Trail (0%)
⏳ Phase 6: Integration (0%)
⏳ Phase 7: Testing & Deployment (0%)
```

**Time Tracking:**
- ✅ Completed: 17 hours
- 🔄 Remaining: 53 hours
- 📈 Velocity: ~3 hours per story (on track)

---

## 🚀 Quick Start Commands

### For Next Session (P2-03)

```bash
# 1. Verify branch
git status
git branch  # Should show: 107-seller-021-stock-management

# 2. Pull latest changes
git pull origin 107-seller-021-stock-management

# 3. Start development
npm run build   # ALWAYS build first to catch errors
npm run dev     # Start dev server

# 4. Run tests while developing
npm test -- --watch  # Watch mode for TDD
```

### Simple Continuation Prompts

**Option 1 (Minimal):**
```
Continue SELLER-021 - Next story
```

**Option 2 (With Status):**
```
Continue SELLER-021 Phase 2. Current: 6/23 stories complete (26%). Next: P2-03 StockAdjustmentForm
```

**Option 3 (Detailed):**
```
Hey Ralph, continue SELLER-021 stock management. I need P2-03 done next (the StockAdjustmentForm component with React Hook Form + Zod validation).
```

**Option 4 (After Error):**
```
Fix build errors in SELLER-021-P2-03 and retry quality checks
```

---

## 📋 Current Story: P2-03 - StockAdjustmentForm Component

### Story Details

**ID:** SELLER-021-P2-03  
**Phase:** 2 (Core Adjustment System)  
**Priority:** 1 (High)  
**Estimated Time:** 5 hours  
**Status:** Ready to implement

### Acceptance Criteria

- [ ] Product selection dropdown (searchable)
- [ ] Adjustment type radio group with icons
- [ ] Quantity input with +/- buttons and keyboard input
- [ ] Reason dropdown (type-specific reasons)
- [ ] Notes textarea (optional, max 500 chars)
- [ ] Current stock display with visual indicator
- [ ] New stock preview (calculated in real-time)
- [ ] Form validation: required fields, positive quantity, reason required
- [ ] Submit with loading state and optimistic UI
- [ ] Success toast with new stock level
- [ ] Error handling with specific messages

### Files to Create

```
📁 src/components/seller/stock/
   ├── StockAdjustmentForm.tsx          (Main component - 400+ lines)
   └── StockAdjustmentForm.test.tsx     (Unit tests - 300+ lines)
```

### Dependencies

**Required Imports:**
- `react-hook-form` - Form state management
- `@hookform/resolvers/zod` - Zod validation integration
- `zod` - Schema validation
- `@/types/stock-management` - Types from P1-01
- `@/components/ui/*` - shadcn components (Button, Input, Select, Textarea, Label, Card)
- `@tanstack/react-query` - For API mutations
- `sonner` - Toast notifications
- `lucide-react` - Icons

**Existing Patterns to Follow:**
- Review `src/components/seller/inventory/QuickStockUpdate.tsx` for similar form patterns
- Review `src/components/seller/products/ProductForm.tsx` for React Hook Form + Zod usage
- Use `src/lib/sanity/mutations/stock-management.ts` types

### Implementation Checklist

**1. Component Structure** (1 hour)
- [ ] Create `StockAdjustmentForm.tsx` with TypeScript interfaces
- [ ] Setup React Hook Form with Zod schema
- [ ] Define form state interface matching `StockAdjustmentRequest` type

**2. Form Fields** (2 hours)
- [ ] Product selection (searchable dropdown with current stock display)
- [ ] Adjustment type (radio group with 6 types: received, sold, returned, damaged, transferred, adjustment)
- [ ] Quantity input (number input with +/- buttons, validation for positive/negative based on type)
- [ ] Reason dropdown (dynamically filtered by adjustment type using `getReasonsForType()`)
- [ ] Notes textarea (optional, 500 char limit)
- [ ] New stock preview (auto-calculated using `calculateNewStock()`)

**3. Validation** (1 hour)
- [ ] Zod schema with custom refinement rules
- [ ] Client-side validation matching backend rules
- [ ] Real-time error messages
- [ ] Prevent negative stock (show warning before submit)

**4. Submission & Feedback** (1 hour)
- [ ] Call `/api/seller/stock/adjust` endpoint
- [ ] Optimistic UI updates (disable form, show loading state)
- [ ] Success toast with new stock level
- [ ] Error handling with specific messages (validation errors, network errors, stock conflicts)
- [ ] Form reset on success

**5. Testing** (1+ hour)
- [ ] Unit tests for all form interactions
- [ ] Validation tests (required fields, negative stock, invalid types)
- [ ] Mock API calls with success/error scenarios
- [ ] Accessibility tests (keyboard navigation, screen reader labels)
- [ ] Edge cases (zero stock, large quantities, long notes)

### Quality Checklist

**Before Commit:**
- [ ] `npm run build` - Zero TypeScript errors
- [ ] `npm run lint` - Clean ESLint output
- [ ] `npm test` - All new tests passing
- [ ] Form is fully accessible (keyboard nav, ARIA labels)
- [ ] Responsive design (mobile + desktop)
- [ ] All acceptance criteria met

---

## 📚 Useful References

### Existing Code Patterns

**Form Components:**
- `src/components/seller/products/ProductForm.tsx` - React Hook Form + Zod pattern
- `src/components/seller/inventory/QuickStockUpdate.tsx` - Stock input pattern
- `src/components/seller/inventory/LowStockAlerts.tsx` - Toast notifications

**Type Definitions:**
- `src/types/stock-management.ts` - All stock adjustment types
- `src/lib/sanity/mutations/stock-management.ts` - Validation helpers

**API Routes:**
- `src/app/api/seller/stock/adjust/route.ts` - Endpoint to call

### Codebase Patterns (from progress.txt)

```typescript
// Stock validation (use helper from stock-management.ts)
import { validateStockAdjustment, calculateNewStock } from '@/types/stock-management';

// Reason dropdown (dynamic based on type)
import { getReasonsForType, STOCK_ADJUSTMENT_REASONS } from '@/types/stock-management';

// Form validation with Zod
import { StockAdjustmentRequestSchema } from '@/types/stock-management';

// API call pattern
const response = await fetch('/api/seller/stock/adjust', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

---

## 🎯 After P2-03: Next Stories

### P2-04: useStockManagement Hook (4 hours)

**Goal:** React Query hook for stock adjustment operations

**Key Features:**
- `useStockAdjustment()` mutation hook
- `useStockHistory(productId)` query hook with pagination
- `useRecentAdjustments()` query hook
- Optimistic updates for instant UX
- Cache invalidation after successful adjustment

**Files:**
- `src/hooks/useStockManagement.ts` (200+ lines)
- `src/hooks/useStockManagement.test.ts` (150+ lines)

---

## 🔍 Troubleshooting

### Common Issues

**1. "Cannot find module '@/types/stock-management'"**
- **Fix:** Ensure P1-01 is complete and file exists
- **Verify:** `ls src/types/stock-management.ts`

**2. "API route returns 401 Unauthorized"**
- **Fix:** Ensure authentication context is wrapped around form
- **Check:** `src/proxy.ts` for route protection

**3. "Form validation not triggering"**
- **Fix:** Ensure Zod schema is passed to `zodResolver()`
- **Pattern:** `useForm({ resolver: zodResolver(schema) })`

**4. "Tests failing due to mock API"**
- **Fix:** Mock `fetch()` globally in test setup
- **Pattern:** See `src/lib/sanity/mutations/inventory.test.ts` for mock pattern

---

## 📊 Progress Tracking

### Story Completion Workflow

**When P2-03 is complete:**

1. **Update PRD Status:**
   ```json
   {
     "id": "SELLER-021-P2-03",
     "passes": true,
     "completedAt": "2026-02-02T09:00:00Z"
   }
   ```

2. **Append to progress.txt:**
   ```markdown
   ## [2026-02-02 09:00] - SELLER-021-P2-03
   **Completed:** Create StockAdjustmentForm Component
   **Files Changed:**
   - src/components/seller/stock/StockAdjustmentForm.tsx
   - src/components/seller/stock/StockAdjustmentForm.test.tsx
   
   **Implementation Notes:**
   - Created comprehensive form with all 6 adjustment types
   - Dynamic reason dropdown based on adjustment type
   - Real-time new stock calculation preview
   - Full validation with Zod schema
   - Optimistic UI updates on submission
   
   **Learnings:**
   - Form validation should match backend validation exactly
   - Reason codes must be filtered by adjustment type
   - Stock preview helps prevent user errors
   
   **Tests Passing:** [PASS] Build | [PASS] Lint | [PASS] Tests (35/35)
   ```

3. **Git Commit:**
   ```bash
   git add .
   git commit -m "feat: SELLER-021-P2-03 - Create StockAdjustmentForm Component
   
   - Implemented comprehensive stock adjustment form with React Hook Form
   - Added dynamic reason dropdown filtered by adjustment type
   - Real-time new stock calculation preview
   - Full validation with Zod schema matching backend rules
   - Optimistic UI updates and error handling
   - Comprehensive unit tests (35 test cases)
   
   Closes #SELLER-021-P2-03"
   ```

4. **Continue to P2-04:**
   ```
   Continue SELLER-021 - Next story (P2-04 useStockManagement Hook)
   ```

---

## 📈 Project Metrics

### Code Quality Targets

- **Test Coverage:** 85%+ (currently meeting target)
- **Build Time:** < 30s (currently 28.7s ✅)
- **TypeScript Errors:** 0 (currently 0 ✅)
- **Lint Warnings:** 0 (currently 0 ✅)

### Performance Targets

- **Stock Adjustment API:** < 500ms response time
- **Form Validation:** < 100ms client-side
- **Optimistic UI Update:** Instant (< 50ms perceived)

---

## 🎓 Learning Resources

### React Hook Form + Zod

**Official Docs:**
- https://react-hook-form.com/get-started
- https://zod.dev/

**Existing Patterns:**
```typescript
// Form setup
const schema = z.object({
  productId: z.string().min(1, "Product is required"),
  adjustmentType: z.enum(['received', 'sold', 'returned', 'damaged', 'transferred', 'adjustment']),
  quantity: z.number().min(1, "Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().max(500).optional()
}).refine((data) => {
  // Custom validation logic
  return validateStockAdjustment(data);
}, {
  message: "Invalid stock adjustment"
});

const { register, handleSubmit, watch, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

### shadcn/ui Components

**Used in Form:**
- `Button` - Submit/cancel actions
- `Input` - Text/number inputs
- `Select` - Dropdown menus
- `Textarea` - Notes field
- `Label` - Form labels
- `Card` - Container layout
- `RadioGroup` - Adjustment type selection

---

## 🔔 Notifications

### When to Update This Guide

- ✅ After completing each story (update progress section)
- ✅ When encountering blockers (add to troubleshooting)
- ✅ When discovering new patterns (add to codebase patterns)
- ✅ Before starting new phase (update phase status)

---

## 📞 Support

**If Stuck:**
1. Check `progress.txt` Codebase Patterns section
2. Review similar components in `src/components/seller/`
3. Verify API route is working: `curl http://localhost:3000/api/seller/stock/adjust`
4. Run tests in watch mode: `npm test -- --watch`

**Quick Debugging:**
```bash
# Check build errors
npm run build

# Check lint errors
npm run lint

# Run specific test
npm test StockAdjustmentForm.test.tsx

# Check TypeScript
npx tsc --noEmit
```

---

**Ready to Continue?**

Use this prompt:
```
Continue SELLER-021 Phase 2 - Implement P2-03 (StockAdjustmentForm Component)
```
