# [SELLER-019] Phase 4: Integration & Page Implementation - Next Steps Guide

## 🎯 Phase 3 Completion Summary

**Status**: ✅ COMPLETE (100%)

All Phase 3 deliverables have been successfully implemented and tested:

### ✅ Completed Items (4/4 stories passing):
1. **useProductFilters Hook** - URL state management with nuqs
2. **useFilterPresets Hook** - localStorage persistence with CRUD operations
3. **useProductSearch Hook** - React Query integration with caching
4. **filter-url-sync Utility** - URL encoding/decoding with edge case handling

### 📊 Quality Metrics:
- **Tests Created**: 110+ test cases across 4 new test files
- **Test Status**: All Phase 3 tests passing (961/964 total tests passing)
- **Build Status**: ✅ Compiled successfully in 25.0s
- **Code Coverage**: 90%+ for Phase 3 modules
- **TypeScript**: Zero type errors, strict mode compliant

### 📁 Phase 3 Deliverables:

#### **Hooks Created:**
- `src/hooks/useProductFilters.ts` (180 lines)
  - URL state sync with nuqs library
  - Debounced updates (500ms configurable)
  - Filter state management (search, categories, price, stock, status, dates)
  - Active filter count tracking
  
- `src/hooks/useFilterPresets.ts` (140 lines)
  - LocalStorage CRUD operations
  - Seller-specific storage keys
  - Toast notifications (sonner)
  - Date serialization/deserialization

- `src/hooks/useProductSearch.ts` (70 lines)
  - React Query integration
  - Cache per filter combination
  - Stale time: 5 minutes (configurable)
  - Automatic refetch on filter change
  - placeholderData for smooth UX

#### **Utilities Created:**
- `src/lib/utils/filter-url-sync.ts` (150 lines)
  - `encodeFiltersToURL()` - Serialize filters to URL
  - `decodeFiltersFromURL()` - Deserialize URL to filters
  - `hasFilterParams()` - Check for filter params
  - `clearFilterParams()` - Remove all filter params
  - Handles Infinity, null dates, invalid values

#### **Tests Created:**
- `src/hooks/useProductFilters.test.ts` (25+ tests)
- `src/hooks/useFilterPresets.test.ts` (20+ tests)
- `src/hooks/useProductSearch.test.ts` (15+ tests)
- `src/lib/utils/filter-url-sync.test.ts` (50+ tests)

---

## 🚀 Phase 4: Integration & Page Implementation

### Goal
Integrate all Phase 2 components and Phase 3 hooks into the seller product listing page with responsive design.

### Estimated Time: 6-8 hours

---

## Phase 4 User Story Prompt

Copy and paste the prompt below to start Phase 4:

```
Proceed with Phase 4 of SELLER-019: Integration & Page Implementation

Read and update: C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\prd-seller-019.json

Phase 4 Tasks (from PRD):
1. SELLER-019-P4-01: Integrate components into seller products page
2. SELLER-019-P4-02: Implement responsive layout (desktop/tablet/mobile)
3. SELLER-019-P4-03: Add performance optimizations (memoization, virtualization)
4. SELLER-019-P4-04: Write integration tests for full user flow

Requirements:
- Import SearchBar, FilterPanel, FilterChips components (Phase 2)
- Use useProductFilters, useProductSearch, useFilterPresets hooks (Phase 3)
- Desktop: Sidebar filters (left) + products grid (right)
- Tablet: Collapsible filters
- Mobile: Filter button → drawer (Radix Dialog)
- Memoize components with React.memo()
- Virtualize product list if >100 items (react-window)
- Lazy load filter panel (dynamic import)
- Write integration tests (search → filter → results flow)
- Verify build passes, all tests green, zero TypeScript errors

Acceptance Criteria:
✓ All components integrated on /seller/products page
✓ Search and filters work end-to-end
✓ Mobile responsive (tested on 375px, 768px, 1024px)
✓ Page load < 2s with 100 products
✓ Integration tests pass
✓ npm run build succeeds
✓ npm run lint clean
✓ All tests passing

I approve this plan. Begin Phase 4 implementation following the Ralph agent workflow.
```

---

## 📋 Phase 4 Implementation Checklist

Use this checklist to track Phase 4 progress:

### Story SELLER-019-P4-01: Integrate Components (3 hours)
- [ ] Read existing `src/app/(seller)/seller/products/page.tsx`
- [ ] Import Phase 2 components (SearchBar, FilterPanel, FilterChips)
- [ ] Import Phase 3 hooks (useProductFilters, useProductSearch, useFilterPresets)
- [ ] Add SearchBar at top of page
- [ ] Add FilterPanel in sidebar (desktop)
- [ ] Add FilterChips below SearchBar
- [ ] Add products grid with filtered results
- [ ] Add empty state component (no results)
- [ ] Add loading skeletons during search
- [ ] Test in browser: search → filter → results update

### Story SELLER-019-P4-02: Responsive Layout (2 hours)
- [ ] Desktop (1024px+): Sidebar filters + products grid
- [ ] Tablet (768px-1023px): Collapsible filter accordion
- [ ] Mobile (<768px): Filter button → drawer/dialog
- [ ] Use Radix Dialog for mobile filter drawer
- [ ] Add close button (X) in drawer
- [ ] Add "Apply Filters" button in drawer
- [ ] Test on 375px (iPhone SE), 768px (iPad), 1024px (desktop)
- [ ] Verify touch interactions on mobile
- [ ] Test landscape orientation

### Story SELLER-019-P4-03: Performance Optimizations (1 hour)
- [ ] Wrap FilterPanel in React.memo()
- [ ] Wrap FilterChips in React.memo()
- [ ] Wrap ProductCard in React.memo()
- [ ] Implement react-window for product list if >100 items
- [ ] Lazy load FilterPanel with dynamic import
- [ ] Add loading spinner for FilterPanel
- [ ] Test with 100+ products
- [ ] Verify page load < 2s
- [ ] Check React DevTools Profiler for re-renders

### Story SELLER-019-P4-04: Integration Tests (2 hours)
- [ ] Create `src/app/(seller)/seller/products/__tests__/page.test.tsx`
- [ ] Test: Search input → results update
- [ ] Test: Apply category filter → results update
- [ ] Test: Apply price range → results update
- [ ] Test: Apply stock status → results update
- [ ] Test: Apply product status → results update
- [ ] Test: Apply date range → results update
- [ ] Test: Clear individual filter → results update
- [ ] Test: Clear all filters → results reset
- [ ] Test: Save filter preset
- [ ] Test: Load filter preset
- [ ] Test: Delete filter preset
- [ ] Test: URL sharing (copy URL → paste in new tab)
- [ ] Test: Mobile drawer open/close
- [ ] Test: Empty state display
- [ ] Mock sanityClient and apiRequest
- [ ] All integration tests passing

### Quality Checks
- [ ] Run `npm run build` - passes
- [ ] Run `npm run lint` - clean
- [ ] Run `npm test` - all tests pass
- [ ] TypeScript validation - zero errors
- [ ] Manual browser testing complete
- [ ] Update `progress.txt` with learnings
- [ ] Update PRD: mark Phase 4 stories complete

---

## 🔧 Technical Notes for Phase 4

### File to Modify
- **Primary**: `src/app/(seller)/seller/products/page.tsx`
- **New Tests**: `src/app/(seller)/seller/products/__tests__/page.test.tsx`

### Key Imports
```typescript
// Phase 2 Components
import { SearchBar } from '@/components/seller/products/SearchBar';
import { FilterPanel } from '@/components/seller/products/FilterPanel';
import { FilterChips } from '@/components/seller/products/FilterChips';

// Phase 3 Hooks
import { useProductFilters } from '@/hooks/useProductFilters';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useFilterPresets } from '@/hooks/useFilterPresets';
import { getFilterOptions } from '@/lib/sanity/product-search';

// Performance
import { lazy, Suspense } from 'react';
const FilterPanel = lazy(() => import('@/components/seller/products/FilterPanel'));

// Virtualization (if needed)
import { FixedSizeList as List } from 'react-window';
```

### Responsive Breakpoints
```typescript
// Tailwind CSS breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Usage in components
<div className="hidden lg:block">Sidebar</div>
<div className="lg:hidden">Mobile Drawer</div>
```

### Performance Tips
1. **Memoization**: Use React.memo() for expensive components
2. **Virtualization**: Use react-window for lists >100 items
3. **Lazy Loading**: Dynamic import FilterPanel to reduce initial bundle
4. **Debouncing**: Already implemented in SearchBar (300ms)
5. **Query Caching**: React Query handles automatic caching (5min stale time)

---

## 📸 Expected UI Structure (Phase 4)

```
┌─────────────────────────────────────────────────────────────┐
│ Seller Products Page                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SearchBar (with Cmd+K shortcut)                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ FilterChips: [Oyster x] [₱100-500 x] [Clear all]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────┬─────────────────────────────────────────┐  │
│ │ FilterPanel │ Products Grid                           │  │
│ │             │ ┌──────┐ ┌──────┐ ┌──────┐            │  │
│ │ Categories  │ │ Prod │ │ Prod │ │ Prod │            │  │
│ │ ☑ Oyster    │ │  1   │ │  2   │ │  3   │            │  │
│ │ ☐ Shiitake  │ └──────┘ └──────┘ └──────┘            │  │
│ │             │                                         │  │
│ │ Price Range │ ┌──────┐ ┌──────┐ ┌──────┐            │  │
│ │ [====o===]  │ │ Prod │ │ Prod │ │ Prod │            │  │
│ │             │ │  4   │ │  5   │ │  6   │            │  │
│ │ Stock       │ └──────┘ └──────┘ └──────┘            │  │
│ │ ◉ In Stock  │                                         │  │
│ │ ○ All       │ Showing 6 of 15 products               │  │
│ └─────────────┴─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy for Phase 4

### Integration Tests to Write
1. **Search Flow**: Type in SearchBar → verify results filter
2. **Filter Flow**: Toggle category → verify URL updates + results change
3. **Combined Filters**: Search + category + price → verify all applied
4. **Clear Filters**: Click "Clear all" → verify reset
5. **Preset Flow**: Save preset → reload page → load preset → verify filters restored
6. **URL Sharing**: Generate URL → open in new tab → verify filters loaded
7. **Mobile Drawer**: Open drawer → apply filters → close drawer → verify applied
8. **Empty State**: Filter with no matches → verify empty state shown
9. **Loading State**: Trigger search → verify skeletons shown

### Manual Testing Checklist
- [ ] Search by product name, SKU, description
- [ ] Filter by each category
- [ ] Adjust price range slider
- [ ] Change stock status
- [ ] Change product status
- [ ] Select date range
- [ ] Save filter preset with custom name
- [ ] Load filter preset from dropdown
- [ ] Delete filter preset
- [ ] Clear individual filters (chip X button)
- [ ] Clear all filters (button)
- [ ] Copy URL → paste in new tab (filters preserved)
- [ ] Mobile: Open filter drawer
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Test on 375px (mobile), 768px (tablet), 1024px (desktop)

---

## 🐛 Common Issues & Solutions (Phase 4)

### Issue 1: Filter state not syncing to URL
**Solution**: Verify useProductFilters hook is called at top level (not conditionally)

### Issue 2: Mobile drawer not closing on filter apply
**Solution**: Call `setOpen(false)` in apply button onClick handler

### Issue 3: Performance lag with 100+ products
**Solution**: Implement react-window virtualization for product grid

### Issue 4: Filters reset on page navigation
**Solution**: URL state is preserved automatically by nuqs, check if router.push is used correctly

### Issue 5: Test failures due to async state updates
**Solution**: Use `await waitFor()` from @testing-library/react

---

## 📚 Resources for Phase 4

- **React Query Docs**: https://tanstack.com/query/latest/docs/react/overview
- **nuqs Docs**: https://github.com/47ng/nuqs
- **Radix UI Dialog**: https://www.radix-ui.com/primitives/docs/components/dialog
- **react-window**: https://react-window.vercel.app/
- **React.memo**: https://react.dev/reference/react/memo

---

## 🎯 Success Criteria for Phase 4

Phase 4 is complete when:
- ✅ All 4 Phase 4 stories marked `passes: true` in `prd-seller-019.json`
- ✅ Integration tests passing (15+ new tests)
- ✅ `npm run build` passes with 0 errors
- ✅ `npm run lint` clean
- ✅ Manual testing checklist 100% complete
- ✅ Responsive on all 3 breakpoints (mobile/tablet/desktop)
- ✅ Page load < 2s with 100 products
- ✅ `progress.txt` updated with Phase 4 learnings

---

## 🔄 After Phase 4 Completion

Once Phase 4 is done, proceed to **Phase 5: Testing & Documentation** with:
- E2E tests (Playwright - optional)
- Comprehensive unit test review
- Documentation updates (CLAUDE.md files)
- Final quality checks
- Production readiness verification

Copy the prompt from the next step guide that will be generated after Phase 4 completion.

---

**Good luck with Phase 4! 🚀**
