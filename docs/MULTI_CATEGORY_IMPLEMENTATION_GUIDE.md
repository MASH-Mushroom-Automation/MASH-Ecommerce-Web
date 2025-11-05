# Multi-Category Support Implementation Guide
**Priority:** P1-6  
**Status:** 🟡 Ready to Implement  
**Estimated Effort:** 4-6 hours  

---

## 📋 OVERVIEW

The backend schema uses `categories: string[]` (array) but the frontend currently uses `category: string` (single value). This guide outlines the steps to implement full multi-category support across the platform.

---

## 🎯 OBJECTIVES

1. Update all product display components to show multiple categories
2. Update filtering logic to support category arrays
3. Update product creation/edit forms to handle multiple categories
4. Maintain backward compatibility with existing single-category displays

---

## ✅ COMPLETED

- [x] Updated `ProductApiResponse` interface with `categories?: string[]` field
- [x] Added `categories[]` to all mock products in `MOCK_PRODUCTS`
- [x] Kept `category: string` for backward compatibility

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Update Product Card Component

**File:** `src/components/product/ProductCard.tsx`

**Current:** Shows single category badge
**Target:** Show multiple category chips/badges

```typescript
// BEFORE
<Badge variant="secondary">{product.category}</Badge>

// AFTER
<div className="flex flex-wrap gap-1">
  {(product.categories || [product.category]).map((cat, idx) => (
    <Badge key={idx} variant="secondary" className="text-xs">
      {cat}
    </Badge>
  ))}
</div>
```

**Benefits:**
- Visual display of all product categories
- Better product discoverability
- Maintains compatibility with single category

---

### Step 2: Update Shop Page Filters

**File:** `src/app/(shop)/shop/page.tsx`

**Current:** Filter by single category
**Target:** Filter by any matching category in array

```typescript
// BEFORE
const matchesCategory = !categoryFilter || product.category === categoryFilter;

// AFTER
const matchesCategory = !categoryFilter || 
  (product.categories 
    ? product.categories.includes(categoryFilter)
    : product.category === categoryFilter
  );
```

**Benefits:**
- Products appear in all relevant category filters
- Better search results
- Backward compatible

---

### Step 3: Update Product Search/Filter API

**File:** `src/lib/api/products.ts`

**Current:** Filters by exact category match
**Target:** Filters by category array contains

```typescript
// In getProducts function, update category filtering:

if (params.category) {
  filteredProducts = filteredProducts.filter((p) => {
    // Check categories array first, fall back to category
    if (p.categories && p.categories.length > 0) {
      return p.categories.some(c => 
        c.toLowerCase() === params.category!.toLowerCase()
      );
    }
    return p.category.toLowerCase() === params.category!.toLowerCase();
  });
}
```

**Benefits:**
- API returns all products matching any category
- Maintains backward compatibility
- Supports both single and multi-category products

---

### Step 4: Update Category Selector Components

**File:** `src/components/filters/CategoryFilter.tsx` (if exists)

**Current:** Single-select category dropdown
**Target:** Multi-select category chips

```typescript
// NEW COMPONENT EXAMPLE
interface CategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  availableCategories: string[];
}

export function CategorySelector({ 
  selectedCategories, 
  onChange, 
  availableCategories 
}: CategorySelectorProps) {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Categories</Label>
      <div className="flex flex-wrap gap-2">
        {availableCategories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategories.includes(cat) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleCategory(cat)}
          >
            {cat}
            {selectedCategories.includes(cat) && (
              <X className="ml-1 h-3 w-3" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

---

### Step 5: Update Product Creation/Edit Forms

**File:** `src/app/(seller)/seller/products/new/page.tsx`
**File:** `src/app/(seller)/seller/products/[id]/edit/page.tsx`

**Current:** Single category dropdown
**Target:** Multi-category selector with chips

```typescript
// State management
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

// Form submission
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  const productData = {
    // ... other fields
    category: selectedCategories[0] || "", // Primary category
    categories: selectedCategories,        // All categories
  };
  
  // Submit to API...
};

// In JSX
<CategorySelector
  selectedCategories={selectedCategories}
  onChange={setSelectedCategories}
  availableCategories={AVAILABLE_CATEGORIES}
/>
```

---

### Step 6: Update Product Detail Page

**File:** `src/app/(shop)/products/[id]/page.tsx`

**Current:** Shows single category
**Target:** Shows all categories as breadcrumbs or chips

```typescript
// Breadcrumb example
<div className="flex items-center gap-2 text-sm text-gray-600">
  <Link href="/shop">Shop</Link>
  {(product.categories || [product.category]).map((cat, idx) => (
    <React.Fragment key={idx}>
      <ChevronRight className="h-4 w-4" />
      <Link href={`/shop?category=${encodeURIComponent(cat)}`}>
        {cat}
      </Link>
    </React.Fragment>
  ))}
</div>

// Or category chips below product name
<div className="flex flex-wrap gap-2 mt-2">
  {(product.categories || [product.category]).map((cat, idx) => (
    <Badge key={idx} variant="outline">
      {cat}
    </Badge>
  ))}
</div>
```

---

### Step 7: Update Analytics/Reports

**Files:** Seller dashboard, admin reports

**Current:** Group by single category
**Target:** Count products across all categories

```typescript
// Example: Category distribution chart
const getCategoryDistribution = (products: ProductApiResponse[]) => {
  const categoryCounts: Record<string, number> = {};
  
  products.forEach(product => {
    const cats = product.categories || [product.category];
    cats.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });
  
  return Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count
  }));
};
```

---

## 📝 CATEGORY MANAGEMENT

### Suggested Category Hierarchy

```typescript
export const CATEGORY_HIERARCHY = {
  "Fresh Mushroom": {
    subcategories: ["Oyster Mushrooms", "Shiitake", "Button Mushrooms", "Specialty"],
  },
  "Growing Kits": {
    subcategories: ["Beginner Friendly", "Advanced", "Premium"],
  },
  "Mushroom Products": {
    subcategories: ["Snacks", "Preserved Foods", "Supplements"],
  },
  "Preserved Foods": {
    subcategories: ["Filipino Products", "Sauces", "Condiments"],
  },
};

export const ALL_CATEGORIES = [
  "Fresh Mushroom",
  "Oyster Mushrooms",
  "Growing Kits",
  "Beginner Friendly",
  "Premium",
  "Mushroom Products",
  "Snacks",
  "Preserved Foods",
  "Filipino Products",
  "Gourmet",
];
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests
- [ ] Test product filtering with single category
- [ ] Test product filtering with multiple categories
- [ ] Test empty categories array
- [ ] Test backward compatibility with `category` field

### Integration Tests
- [ ] Test shop page filter with multi-category products
- [ ] Test search with category filter
- [ ] Test product creation with multiple categories
- [ ] Test category display on product cards

### UI/UX Tests
- [ ] Verify category chips wrap properly on mobile
- [ ] Verify category filter updates product list
- [ ] Verify breadcrumbs navigate correctly
- [ ] Verify seller can add/remove categories in form

---

## 🔄 MIGRATION STRATEGY

### Phase 1: Backward Compatible (Current State)
- ✅ Both `category` and `categories` fields exist
- ✅ Frontend reads `categories` if available, falls back to `category`
- ✅ Backend accepts both formats

### Phase 2: Dual Write (Recommended Next)
- When saving products, write to both fields:
  ```typescript
  category: categories[0] || "",
  categories: categories
  ```
- All reads prioritize `categories` array
- Maintain for 2-3 releases

### Phase 3: Full Migration (Future)
- Deprecate single `category` field
- Update all components to use only `categories`
- Backend stops accepting `category` field
- Database migration to remove `category` column

---

## 🚨 BREAKING CHANGES TO AVOID

**DO NOT:**
- Remove `category` field immediately
- Force all products to have multiple categories
- Change API response structure without versioning

**DO:**
- Keep both fields during transition
- Provide sensible defaults (`categories[0]` → `category`)
- Test extensively with mixed data (some products with arrays, some without)

---

## 📊 SUCCESS METRICS

**After Implementation:**
- Products can belong to 2+ categories
- Filtering works correctly with category arrays
- No regression in single-category products
- Seller can easily manage multiple categories
- Analytics accurately count cross-category products

---

## 🔗 RELATED FILES

### Components to Update
- `src/components/product/ProductCard.tsx`
- `src/components/filters/CategoryFilter.tsx` (create if needed)
- `src/app/(shop)/products/[id]/page.tsx`
- `src/app/(shop)/shop/page.tsx`

### Forms to Update
- `src/app/(seller)/seller/products/new/page.tsx`
- `src/app/(seller)/seller/products/[id]/edit/page.tsx`

### API Files
- `src/lib/api/products.ts`
- `src/app/api/products/route.ts`

### Type Definitions
- ✅ `src/types/api.ts` (already updated)

---

## 💡 EXAMPLE: Complete Product Card Update

```typescript
// src/components/product/ProductCard.tsx
import { Badge } from "@/components/ui/badge";
import { ProductApiResponse } from "@/types/api";

interface ProductCardProps {
  product: ProductApiResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  // Get categories array or fallback to single category
  const categories = product.categories || [product.category];
  const primaryCategory = categories[0];
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
      
      {/* Product Name */}
      <h3 className="mt-3 font-semibold text-lg">{product.name}</h3>
      
      {/* Categories - Show up to 3, then "+N more" */}
      <div className="flex flex-wrap gap-1 mt-2">
        {categories.slice(0, 3).map((cat, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {cat}
          </Badge>
        ))}
        {categories.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{categories.length - 3} more
          </Badge>
        )}
      </div>
      
      {/* Price */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xl font-bold">₱{product.price}</span>
        <Button size="sm">Add to Cart</Button>
      </div>
    </div>
  );
}
```

---

## ✅ COMPLETION CHECKLIST

- [ ] Update ProductCard to display multiple categories
- [ ] Update shop page filtering logic
- [ ] Update search/filter API
- [ ] Create/update category selector component
- [ ] Update product creation form
- [ ] Update product edit form
- [ ] Update product detail page
- [ ] Update seller dashboard analytics
- [ ] Add category management constants
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test on mobile devices
- [ ] Update API documentation
- [ ] Create PR with all changes

---

**Estimated Completion Time:** 4-6 hours  
**Priority:** Medium (P1)  
**Dependencies:** None (schema already supports it)  
**Risk Level:** Low (backward compatible approach)

*End of Guide*
