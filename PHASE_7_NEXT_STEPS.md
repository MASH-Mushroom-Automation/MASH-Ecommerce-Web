# [SELLER-019] Phase 7: Advanced Features & Analytics - Optional Enhancements

## 🎯 Phase 6 Completion Summary (Assumed)

**Status**: ✅ COMPLETE (100%)

All Phase 6 deliverables have been successfully implemented:

### ✅ Completed Items (5/5 stories passing):
1. **E2E Tests with Playwright** - 18+ tests passing
2. **Performance Profiling** - Lighthouse score 95+, page load < 2s
3. **Accessibility Audit** - WCAG 2.1 AA compliant, 0 violations
4. **Cross-Browser Testing** - Chrome, Firefox, Safari, Edge verified
5. **Production Deployment** - www.mashmarket.app deployed and monitored

### 📊 Final Quality Metrics:
- **Total Tests**: 1000+ (unit + integration + E2E)
- **Test Coverage**: 90%+ for SELLER-019 modules
- **Lighthouse Performance**: 95/100
- **Lighthouse Accessibility**: 100/100
- **Page Load Time**: 1.8s with 100 products
- **Production Status**: ✅ DEPLOYED & STABLE

**🎉 SELLER-019 is COMPLETE and PRODUCTION-READY!**

---

## 🚀 Phase 7: Advanced Features & Analytics (Optional)

### Goal
Enhance the search & filter system with advanced features, analytics tracking, and AI-powered capabilities to improve user experience and business insights.

### Estimated Time: 20-25 hours (5-6 days)

**⚠️ IMPORTANT**: Phase 7 is **OPTIONAL**. The search & filter system is fully functional and production-ready after Phase 6. Proceed with Phase 7 only if:
- Business requirements demand advanced features
- Analytics data is needed for product decisions
- Budget and timeline allow for enhancements

---

## Phase 7 User Story Prompt

Copy and paste the prompt below to start Phase 7:

```
Proceed with Phase 7 of SELLER-019: Advanced Features & Analytics (OPTIONAL)

Read and update: C:\Users\Kenneth\Desktop\PP Namias\MASH-Ecommerce-Web\prd-seller-019.json

Phase 7 Tasks (Optional Enhancements):
1. SELLER-019-P7-01: Autocomplete search suggestions
2. SELLER-019-P7-02: Search analytics & tracking
3. SELLER-019-P7-03: Export filtered results to CSV
4. SELLER-019-P7-04: Batch operations on filtered products
5. SELLER-019-P7-05: AI-powered semantic search (experimental)

Requirements:
- Implement autocomplete with recent searches and suggestions
- Track search queries, filters used, and no-results scenarios
- Add CSV export functionality for filtered results
- Enable bulk edit, delete, and price updates for filtered products
- Integrate AI semantic search (natural language queries)

Acceptance Criteria:
✓ Autocomplete shows relevant suggestions as user types
✓ Analytics dashboard displays search metrics
✓ CSV export includes all filtered product data
✓ Batch operations work on selected products
✓ Semantic search understands natural language queries
✓ All new features tested and documented

I approve this plan. Begin Phase 7 implementation following the Ralph agent workflow.
```

---

## 📋 Phase 7 Implementation Checklist

### Story SELLER-019-P7-01: Autocomplete Search Suggestions (4 hours)

**Goal**: Provide instant search suggestions as users type

#### Implementation Steps:
- [ ] Create `useAutocomplete` hook
- [ ] Fetch suggestions from Sanity (product names, SKUs)
- [ ] Fetch recent searches from localStorage
- [ ] Create `AutocompleteDropdown` component
- [ ] Integrate with SearchBar component
- [ ] Add keyboard navigation (Arrow up/down, Enter, Escape)
- [ ] Highlight matching text in suggestions
- [ ] Cache suggestions (React Query, 10min stale time)
- [ ] Test autocomplete with 100+ products
- [ ] Write unit tests

#### Files to Create/Modify:
```
src/hooks/useAutocomplete.ts            # [NEW] Autocomplete logic
src/components/seller/products/
  AutocompleteDropdown.tsx               # [NEW] Suggestion dropdown
  SearchBar.tsx                          # [MODIFY] Integrate autocomplete
src/lib/sanity/queries/
  products.ts                            # [MODIFY] Add quickSearchQuery
src/hooks/useAutocomplete.test.ts       # [NEW] Unit tests
```

#### Code Example:
```typescript
// src/hooks/useAutocomplete.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quickSearchProducts } from '@/lib/sanity/product-search';

interface AutocompleteSuggestion {
  type: 'product' | 'recent' | 'category';
  id: string;
  label: string;
  value: string;
  metadata?: any;
}

export function useAutocomplete(searchText: string) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Fetch recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(
      localStorage.getItem('seller-recent-searches') || '[]'
    );
    setRecentSearches(recent.slice(0, 5)); // Top 5
  }, []);

  // Fetch product suggestions (debounced)
  const { data: products, isLoading } = useQuery({
    queryKey: ['autocomplete', searchText],
    queryFn: () => quickSearchProducts(searchText, 10),
    enabled: searchText.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Combine suggestions
  const suggestions: AutocompleteSuggestion[] = [
    // Recent searches
    ...recentSearches
      .filter(s => s.toLowerCase().includes(searchText.toLowerCase()))
      .map(s => ({
        type: 'recent' as const,
        id: `recent-${s}`,
        label: s,
        value: s,
      })),
    // Product suggestions
    ...(products || []).map(p => ({
      type: 'product' as const,
      id: p._id,
      label: p.name,
      value: p.name,
      metadata: { sku: p.sku, price: p.price },
    })),
  ];

  const addToRecentSearches = (search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)];
    localStorage.setItem(
      'seller-recent-searches',
      JSON.stringify(updated.slice(0, 10))
    );
    setRecentSearches(updated.slice(0, 5));
  };

  return {
    suggestions,
    isLoading,
    addToRecentSearches,
  };
}
```

---

### Story SELLER-019-P7-02: Search Analytics & Tracking (5 hours)

**Goal**: Track search behavior and provide insights

#### Implementation Steps:
- [ ] Create `analytics-service.ts` for tracking
- [ ] Track search queries (text, filters, timestamp)
- [ ] Track no-results searches
- [ ] Track filter usage (which filters are most used)
- [ ] Store analytics in Firestore (seller-specific)
- [ ] Create `AnalyticsDashboard` component
- [ ] Display:
  - Top searches (last 30 days)
  - No-results searches (needs attention)
  - Most-used filters
  - Search trends (daily/weekly)
- [ ] Add export to CSV (analytics data)
- [ ] Test analytics tracking
- [ ] Write unit tests

#### Files to Create/Modify:
```
src/lib/analytics/
  search-analytics.ts                    # [NEW] Analytics service
src/app/(seller)/seller/analytics/
  page.tsx                               # [NEW] Analytics dashboard
src/components/seller/analytics/
  SearchMetricsCard.tsx                  # [NEW] Metrics display
  TrendChart.tsx                         # [NEW] Chart component
```

#### Firestore Schema:
```typescript
// Collection: search_analytics
interface SearchAnalytic {
  sellerId: string;
  timestamp: Date;
  searchText: string;
  filters: {
    categories: string[];
    priceRange: [number, number];
    stockStatus: string;
    productStatus: string;
  };
  resultsCount: number;
  duration: number; // ms
}

// Aggregated collection: search_metrics
interface SearchMetrics {
  sellerId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;
  totalSearches: number;
  uniqueSearches: number;
  noResultsSearches: number;
  topSearches: Array<{ text: string; count: number }>;
  topFilters: Array<{ filter: string; count: number }>;
}
```

---

### Story SELLER-019-P7-03: Export Filtered Results to CSV (2 hours)

**Goal**: Allow sellers to export filtered products to CSV

#### Implementation Steps:
- [ ] Create `exportToCSV` utility function
- [ ] Add "Export to CSV" button to products page
- [ ] Generate CSV with all filtered products
- [ ] Include columns: Name, SKU, Price, Stock, Status, Category
- [ ] Handle large datasets (stream export for >1000 products)
- [ ] Add loading indicator during export
- [ ] Show toast notification on success
- [ ] Test with 100+ products
- [ ] Write unit tests

#### Files to Create/Modify:
```
src/lib/utils/
  export-csv.ts                          # [NEW] CSV export utility
src/app/(seller)/seller/products/
  page.tsx                               # [MODIFY] Add export button
src/components/seller/products/
  ExportButton.tsx                       # [NEW] Export button UI
```

#### Code Example:
```typescript
// src/lib/utils/export-csv.ts
export function exportToCSV(products: any[], filename: string) {
  // CSV headers
  const headers = ['Name', 'SKU', 'Price', 'Stock', 'Status', 'Category'];
  
  // CSV rows
  const rows = products.map(p => [
    p.name,
    p.sku || '',
    p.price.toFixed(2),
    p.stockQuantity || 0,
    p.status || 'published',
    p.category?.name || '',
  ]);
  
  // Generate CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
```

---

### Story SELLER-019-P7-04: Batch Operations on Filtered Products (6 hours)

**Goal**: Enable bulk actions on filtered products

#### Implementation Steps:
- [ ] Create `useBatchOperations` hook
- [ ] Add checkbox to each product card (select)
- [ ] Add "Select All" checkbox (top of list)
- [ ] Create `BatchActionsBar` component
- [ ] Implement batch actions:
  - [ ] Bulk delete (with confirmation dialog)
  - [ ] Bulk price update (percentage or fixed amount)
  - [ ] Bulk status change (publish/unpublish/archive)
  - [ ] Bulk category assignment
- [ ] Show progress indicator during batch operations
- [ ] Handle partial failures (retry/skip logic)
- [ ] Show summary toast (e.g., "10 products updated, 2 failed")
- [ ] Test with 50+ products
- [ ] Write unit tests

#### Files to Create/Modify:
```
src/hooks/
  useBatchOperations.ts                  # [NEW] Batch operations logic
src/components/seller/products/
  BatchActionsBar.tsx                    # [NEW] Batch actions UI
  ProductCard.tsx                        # [MODIFY] Add checkbox
src/app/(seller)/seller/products/
  page.tsx                               # [MODIFY] Integrate batch UI
```

---

### Story SELLER-019-P7-05: AI-Powered Semantic Search (Experimental) (3 hours)

**Goal**: Enable natural language search queries

#### Implementation Steps:
- [ ] Integrate with Gemini API for NLP
- [ ] Parse natural language queries:
  - "Show me mushrooms under $100"
  - "Find published oyster products in stock"
  - "All products added this week"
- [ ] Convert NLP to ProductFilters
- [ ] Create `useSemanticSearch` hook
- [ ] Add "Try natural language" toggle in SearchBar
- [ ] Display parsed filters (transparent to user)
- [ ] Add feedback mechanism ("Was this helpful?")
- [ ] Test with 10+ natural language queries
- [ ] Write unit tests

#### Files to Create/Modify:
```
src/lib/ai/
  semantic-search.ts                     # [NEW] NLP to filters conversion
src/hooks/
  useSemanticSearch.ts                   # [NEW] Semantic search hook
src/components/seller/products/
  SearchBar.tsx                          # [MODIFY] Add NLP toggle
```

#### Code Example:
```typescript
// src/lib/ai/semantic-search.ts
import { generateText } from '@/lib/ai/gemini-client';

const SYSTEM_PROMPT = `
You are a product search assistant. Convert natural language queries into structured filters.

Output format (JSON):
{
  "search": "text to search",
  "categories": ["category-id"],
  "priceRange": [min, max],
  "stockStatus": "in-stock" | "out-of-stock" | "low-stock" | "all",
  "productStatus": "published" | "draft" | "archived" | "all",
  "dateRange": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" } | null
}

Examples:
- "mushrooms under $100" → {"search":"mushroom","priceRange":[0,100]}
- "published oyster in stock" → {"search":"oyster","stockStatus":"in-stock","productStatus":"published"}
`;

export async function parseNaturalLanguageQuery(
  query: string
): Promise<ProductFilters> {
  const response = await generateText({
    model: 'gemini-2.0-flash',
    prompt: `${SYSTEM_PROMPT}\n\nUser query: "${query}"`,
  });
  
  const parsed = JSON.parse(response);
  
  return {
    search: parsed.search || '',
    categories: parsed.categories || [],
    priceRange: parsed.priceRange || [0, Infinity],
    stockStatus: parsed.stockStatus || 'all',
    productStatus: parsed.productStatus || 'published',
    dateRange: parsed.dateRange || null,
  };
}
```

---

## 📊 Analytics Dashboard Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  Search Analytics Dashboard                                 │
├─────────────────────────────────────────────────────────────┤
│  Last 30 Days                                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐│
│  │ Total Searches │  │ Unique Queries │  │ No Results     ││
│  │     1,245      │  │      487       │  │      23        ││
│  └────────────────┘  └────────────────┘  └────────────────┘│
│                                                             │
│  Top Searches                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Oyster mushroom (142 searches)                   │   │
│  │ 2. Shiitake (98 searches)                           │   │
│  │ 3. King oyster (75 searches)                        │   │
│  │ 4. Growing kit (62 searches)                        │   │
│  │ 5. Spores (41 searches)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  No-Results Searches (Needs Attention)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • "blue oyster spores" (8 times)                    │   │
│  │ • "enoki mushroom" (5 times)                        │   │
│  │ • "organic substrate" (4 times)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Most-Used Filters                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Category: Oyster Mushroom (312 times)            │   │
│  │ 2. Stock Status: In Stock (245 times)               │   │
│  │ 3. Price Range: $50-$200 (189 times)                │   │
│  │ 4. Status: Published (167 times)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy (Phase 7)

### Unit Tests

- **useAutocomplete**:
  - Fetches suggestions from Sanity
  - Filters by search text
  - Handles recent searches from localStorage
  - Caches results for 10 minutes

- **exportToCSV**:
  - Generates valid CSV format
  - Handles special characters (quotes, commas)
  - Downloads file with correct filename

- **useBatchOperations**:
  - Selects/deselects products
  - Executes batch actions (delete, update, status change)
  - Handles partial failures

- **parseNaturalLanguageQuery**:
  - Parses natural language to ProductFilters
  - Handles ambiguous queries
  - Returns valid filter objects

### Integration Tests

- **Autocomplete Flow**:
  - Type in SearchBar → suggestions appear
  - Click suggestion → search executes
  - Recent searches persist across sessions

- **Analytics Tracking**:
  - Search → analytics event saved to Firestore
  - Dashboard displays metrics correctly
  - CSV export includes all analytics data

- **Batch Operations**:
  - Select products → batch actions bar appears
  - Execute batch action → progress indicator shows
  - Success toast displays summary

- **Semantic Search**:
  - Type natural language query → filters parsed
  - Parsed filters applied to search
  - Results match expected filters

---

## 📚 Resources for Phase 7

- **Gemini API**: https://ai.google.dev/docs
- **Firestore Analytics**: https://firebase.google.com/docs/firestore
- **CSV Export**: https://www.npmjs.com/package/papaparse
- **Chart.js**: https://www.chartjs.org/ (for analytics charts)
- **Natural Language Processing**: https://ai.google.dev/tutorials/prompts

---

## 🎯 Success Metrics for Phase 7

Phase 7 is complete when:
- ✅ Autocomplete provides relevant suggestions
- ✅ Analytics dashboard displays accurate metrics
- ✅ CSV export works with 100+ products
- ✅ Batch operations handle 50+ products
- ✅ Semantic search parses 80%+ of natural language queries correctly
- ✅ All new features tested and documented
- ✅ Build and lint passing
- ✅ Production deployed and monitored

---

## 🔄 After Phase 7 Completion

Once Phase 7 is done, consider these future enhancements:

### Phase 8: Advanced AI Features (Optional)
- **Smart Recommendations**: ML-based product suggestions
- **Predictive Search**: Predict what user is searching for
- **Anomaly Detection**: Alert on unusual search patterns
- **A/B Testing**: Test different filter UIs

### Phase 9: Mobile App Integration (Optional)
- **React Native App**: Seller mobile app with search & filter
- **Offline Mode**: Cache products for offline search
- **Push Notifications**: Alert on trending searches

### Phase 10: Enterprise Features (Optional)
- **Role-Based Filters**: Different filter access per user role
- **Saved Reports**: Schedule automated reports
- **API Access**: Expose search API for third-party integrations

---

**Good luck with Phase 7! 🚀**

This phase is optional but can significantly enhance the search & filter system with advanced features, analytics insights, and AI-powered capabilities. Only proceed if business requirements justify the additional development time.
