# SELLER-021 Stock Level Management - Next Steps Guide

## 🚀 Quick Start (Use These Prompts!)

### To Start Implementation:
```
Start Phase 1 of SELLER-021 Stock Management
```

### To Continue After Each Story:
```
Continue SELLER-021
```

### If Build Fails:
```
Fix SELLER-021 build errors and continue
```

### After Phase Complete:
```
SELLER-021 Phase [X] complete - Start Phase [X+1]
```

### Final Verification:
```
SELLER-021 complete - Run final checks and create PR
```

---

## 📋 Current Status

**Branch**: `107-seller-021-stock-management` (to be created)  
**Phase**: Phase 1 - Foundation  
**Stories Complete**: 0/23  
**Next Story**: SELLER-021-P1-01 (Create Stock Management Types)

---

## 🎯 Phase Overview

### Phase 1: Foundation (9 hours) - **START HERE**
✅ **Ready to implement**

**Stories:**
1. ⏳ SELLER-021-P1-01 - Stock Management Types (3h)
2. ⏳ SELLER-021-P1-02 - Sanity Stock Adjustment Schema (2h)
3. ⏳ SELLER-021-P1-03 - Product Schema Threshold Fields (1h)
4. ⏳ SELLER-021-P1-04 - Stock Management GROQ Queries (3h)

**Goal**: Establish core data structures and Sanity integration

**Deliverables**:
- `src/types/stock-management.ts` - TypeScript types
- `studio/src/schemaTypes/documents/stockAdjustment.ts` - Sanity schema
- Updated `product.ts` with threshold fields
- `src/lib/sanity/queries/stock-management.ts` - GROQ queries

**Dependencies**: None (can start immediately)

---

### Phase 2: Core Adjustment System (16 hours)
⏸️ **Blocked until Phase 1 complete**

**Stories:**
1. ⏳ SELLER-021-P2-01 - Stock Adjustment Mutations (4h)
2. ⏳ SELLER-021-P2-02 - Stock Adjustment API Route (3h)
3. ⏳ SELLER-021-P2-03 - StockAdjustmentForm Component (5h)
4. ⏳ SELLER-021-P2-04 - useStockManagement Hook (4h)

**Goal**: Implement manual stock adjustment functionality

---

### Phase 3: Threshold Configuration (6 hours)
⏸️ **Blocked until Phase 2 complete**

**Stories:**
1. ⏳ SELLER-021-P3-01 - ThresholdSettings Component (4h)
2. ⏳ SELLER-021-P3-02 - Threshold API Route (2h)

**Goal**: Enable per-product threshold settings

---

### Phase 4: Batch CSV Import (12 hours)
⏸️ **Blocked until Phase 3 complete**

**Stories:**
1. ⏳ SELLER-021-P4-01 - BatchStockUpdate Component (5h)
2. ⏳ SELLER-021-P4-02 - Batch API Route (4h)
3. ⏳ SELLER-021-P4-03 - CSV Parser (3h)

**Goal**: Support bulk stock updates via CSV

**New Dependencies**:
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

---

### Phase 5: Audit Trail (7 hours)
⏸️ **Blocked until Phase 4 complete**

**Stories:**
1. ⏳ SELLER-021-P5-01 - StockHistoryLog Component (4h)
2. ⏳ SELLER-021-P5-02 - Stock History Service (3h)

**Goal**: Provide comprehensive stock adjustment tracking

---

### Phase 6: Integration (8 hours)
⏸️ **Blocked until Phase 5 complete**

**Stories:**
1. ⏳ SELLER-021-P6-01 - Stock Management Page (4h)
2. ⏳ SELLER-021-P6-02 - Navigation Integration (1h)
3. ⏳ SELLER-021-P6-03 - Inventory Dashboard Integration (3h)

**Goal**: Connect all components and integrate with existing features

---

### Phase 7: Testing & Deployment (12 hours)
⏸️ **Blocked until Phase 6 complete**

**Stories:**
1. ⏳ SELLER-021-P7-01 - Integration Tests (5h)
2. ⏳ SELLER-021-P7-02 - Documentation (3h)
3. ⏳ SELLER-021-P7-03 - Deployment (4h)

**Goal**: Comprehensive testing and production deployment

---

## 🔄 Ralph Agent Workflow

### Story Execution Pattern

For each story, Ralph will:

1. **Context Gathering** (Parallel):
   ```bash
   - Read prd-seller-021.json
   - Read progress.txt Codebase Patterns
   - Check git branch matches: 107-seller-021-stock-management
   - Read relevant existing files
   - Check CLAUDE.md in affected directories
   ```

2. **Implementation**:
   - Create/modify files per acceptance criteria
   - Follow existing patterns (inventory dashboard reference)
   - Use TypeScript strictly (no `any` types)
   - Add comprehensive JSDoc comments

3. **Testing**:
   - Write unit tests for all new code
   - Run `npm run build` (must pass)
   - Run `npm run lint` (must pass)
   - Run `npm test -- [test-pattern]` (must pass)

4. **Documentation**:
   - Update `progress.txt` with implementation notes
   - Create/update CLAUDE.md in component folders
   - Add inline code comments for complex logic

5. **Commit**:
   ```bash
   git add .
   git commit -m "feat: SELLER-021-P[X]-0[Y] - [Story Title]
   
   - Implementation detail 1
   - Implementation detail 2
   - Test coverage: [X]%
   
   Closes #107"
   ```

6. **PRD Update**:
   - Set `passes: true` for completed story
   - Add `completedAt` timestamp
   - Update `buildStatus` and `testMetrics`

---

## 📦 Required Dependencies

### Already Installed:
- ✅ React Query (`@tanstack/react-query`)
- ✅ Zod validation
- ✅ React Hook Form
- ✅ Sonner (toast notifications)
- ✅ Sanity Client

### To Install (Phase 4):
```bash
npm install papaparse
npm install --save-dev @types/papaparse
```

---

## 🧪 Testing Strategy

### Unit Tests (Per Story):
- Type definitions: 100% coverage
- GROQ queries: Test query generation logic
- Service functions: Mock Sanity client
- React components: Mock hooks and API calls
- API routes: Mock Sanity write client

### Integration Tests (Phase 7):
- Complete stock adjustment flow
- Batch CSV import end-to-end
- Threshold configuration updates
- Cache invalidation

### Test File Naming:
```
src/types/stock-management.test.ts
src/lib/sanity/queries/stock-management.test.ts
src/lib/sanity/mutations/stock-management.test.ts
src/components/seller/stock/StockAdjustmentForm.test.tsx
src/app/api/seller/stock/adjust/route.test.ts
```

---

## 🎨 Code Patterns to Follow

### From Inventory Dashboard (SELLER-020):

**Types Pattern**:
```typescript
// src/types/stock-management.ts
export type StockAdjustmentType = 'received' | 'sold' | 'returned' | 'damaged' | 'transferred' | 'adjustment';

export interface StockAdjustmentRequest {
  productId: string;
  adjustmentType: StockAdjustmentType;
  quantityChange: number;
  reason: string;
  notes?: string;
}
```

**GROQ Query Pattern**:
```typescript
// src/lib/sanity/queries/stock-management.ts
export function getStockHistoryQuery(productId: string, limit: number = 30): string {
  return `*[_type == "stockAdjustment" && product._ref == "${productId}"] | order(_createdAt desc) [0...${limit}] {
    _id,
    _createdAt,
    adjustmentType,
    quantityChange,
    newStockLevel,
    reason,
    notes,
    "product": product->{_id, name, sku, coalesce(mainImage.asset->url, image.asset->url)}
  }`;
}
```

**Service Pattern**:
```typescript
// src/lib/sanity/stock-history-service.ts
export async function getStockHistory(productId: string): Promise<StockHistoryItem[]> {
  try {
    const query = getStockHistoryQuery(productId);
    const data = await sanityClient.fetch(query);
    return data || [];
  } catch (error) {
    console.error('[StockHistory]', error);
    toast.error('Failed to load stock history');
    throw error;
  }
}
```

**API Route Pattern**:
```typescript
// src/app/api/seller/stock/adjust/route.ts
export async function POST(request: NextRequest) {
  try {
    // 1. Validate request
    const body = await request.json();
    const validated = StockAdjustmentSchema.parse(body);
    
    // 2. Create adjustment (server-side with SANITY_API_WRITE_TOKEN)
    const result = await createStockAdjustment(validated);
    
    // 3. Return success
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
```

**Component Pattern**:
```typescript
// src/components/seller/stock/StockAdjustmentForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStockAdjustment } from '@/hooks/useStockManagement';

export function StockAdjustmentForm({ onSuccess }: Props) {
  const { mutate, isPending } = useStockAdjustment();
  const form = useForm({ resolver: zodResolver(StockAdjustmentSchema) });
  
  const onSubmit = (data: StockAdjustmentRequest) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Stock adjusted successfully');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
      }
    });
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* form fields */}</form>;
}
```

---

## 🚨 Critical Reminders

### MUST DO:
1. ✅ **Build first**: Always run `npm run build` before `npm run dev`
2. ✅ **Sanity coalesce**: Use `coalesce(mainImage.asset->url, image.asset->url)` in GROQ
3. ✅ **API routes**: Server-side SANITY_API_WRITE_TOKEN for mutations
4. ✅ **Optimistic updates**: Instant UI updates before server confirmation
5. ✅ **Cache invalidation**: Refresh inventory data after stock adjustments
6. ✅ **Type safety**: No `any` types - strict TypeScript
7. ✅ **Error handling**: try-catch with toast notifications
8. ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### NEVER DO:
1. ❌ Commit broken builds
2. ❌ Skip unit tests
3. ❌ Use client-side Sanity write tokens
4. ❌ Ignore linting errors
5. ❌ Leave TODO comments in production code
6. ❌ Copy-paste without understanding context

---

## 📊 Progress Tracking

### Story Status Legend:
- ⏳ **Not Started** - Ready to implement
- 🔄 **In Progress** - Currently being implemented
- ✅ **Complete** - Passes all quality checks
- ❌ **Failed** - Build/test failures
- 🚫 **Blocked** - Waiting on dependencies

### Update Progress After Each Story:
```json
{
  "id": "SELLER-021-P1-01",
  "passes": true,
  "completedAt": "2026-02-02T15:30:00Z"
}
```

---

## 🎯 Success Criteria Checklist

### Phase 1 Complete When:
- [ ] All 4 stories pass quality checks
- [ ] TypeScript types fully defined with Zod schemas
- [ ] Sanity schema deployed to production dataset
- [ ] Product schema extended with threshold fields
- [ ] GROQ queries tested with unit tests
- [ ] No build errors
- [ ] No lint errors
- [ ] 100% test coverage for types and queries

### Phase 2 Complete When:
- [ ] All 4 stories pass quality checks
- [ ] Stock adjustment mutations work with optimistic locking
- [ ] API route secured with authentication
- [ ] Form component has real-time validation
- [ ] React Query hook handles all states (loading, error, success)
- [ ] Manual stock adjustment flow tested end-to-end

### Phase 3 Complete When:
- [ ] All 2 stories pass quality checks
- [ ] Threshold settings persist to Sanity
- [ ] Bulk threshold updates work for multiple products
- [ ] Validation prevents invalid threshold combinations

### Phase 4 Complete When:
- [ ] All 3 stories pass quality checks
- [ ] CSV file upload works with drag & drop
- [ ] Parser validates CSV structure and data
- [ ] Batch API processes 100+ products in < 5 seconds
- [ ] Error report CSV downloadable for failed rows

### Phase 5 Complete When:
- [ ] All 2 stories pass quality checks
- [ ] Stock history displays full audit trail
- [ ] Filters work (type, date range, user)
- [ ] Export to CSV functional
- [ ] Pagination handles large history datasets

### Phase 6 Complete When:
- [ ] All 3 stories pass quality checks
- [ ] Stock Management page accessible via navigation
- [ ] All tabs functional (Quick Adjust, Batch Import, History)
- [ ] Integration with inventory dashboard seamless
- [ ] Low stock badge shows correct count

### Phase 7 Complete When:
- [ ] All 3 stories pass quality checks
- [ ] Integration tests pass (85%+ coverage)
- [ ] Documentation complete
- [ ] Deployed to Railway staging
- [ ] Manual testing checklist passed
- [ ] PR created with full description

---

## 🎓 Learning Resources

### Existing Code to Reference:
1. **Inventory Dashboard** (`src/app/(seller)/seller/inventory/`) - Similar patterns
2. **Inventory Types** (`src/types/inventory.ts`) - Type structure reference
3. **Inventory Service** (`src/lib/sanity/inventory-service.ts`) - Service pattern
4. **useInventoryData Hook** (`src/hooks/useInventoryData.ts`) - React Query pattern

### Key Files to Study:
- [src/components/seller/inventory/QuickStockUpdate.tsx](../src/components/seller/inventory/QuickStockUpdate.tsx) - Stock update UI reference
- [src/lib/sanity/mutations/inventory.ts](../src/lib/sanity/mutations/inventory.ts) - Mutation patterns
- [src/app/api/seller/inventory/update/route.ts](../src/app/api/seller/inventory/update/route.ts) - API route security

---

## 🤝 Getting Help

### If Stuck:
1. Check `progress.txt` for Codebase Patterns
2. Review CLAUDE.md in relevant component folders
3. Search workspace for similar implementations
4. Check existing tests for patterns

### Common Issues:
- **Build errors**: Check TypeScript types match Sanity schema
- **Test failures**: Ensure mocks match implementation
- **Sanity errors**: Verify write token has correct permissions
- **React Query errors**: Check query key naming convention

---

## ✅ Ready to Start!

**Next Command**:
```
Start Phase 1 of SELLER-021 Stock Management
```

Ralph will automatically:
1. Create feature branch `107-seller-021-stock-management`
2. Implement SELLER-021-P1-01 (Stock Management Types)
3. Run quality checks
4. Commit with proper format
5. Update PRD
6. Continue to next story

**Estimated Time to First Commit**: 30-45 minutes  
**Estimated Phase 1 Completion**: 9 hours (4 stories)

---

Good luck! 🚀
