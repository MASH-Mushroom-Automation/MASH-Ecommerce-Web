# Add Product Form Implementation Plan

> **Created:** December 19, 2025  
> **Status:** In Progress  
> **Stack:** Next.js 15 + Sanity CMS + Tiptap + react-beautiful-dnd

## Overview

Comprehensive seller dashboard product form with rich text editing, multi-image upload with drag-and-drop reordering, variant management, and full Sanity CMS integration.

## Acceptance Criteria

✅ Product name and description (rich text)  
✅ Category and subcategory selection  
✅ Multiple image upload with reordering  
✅ Price and compare-at price  
✅ Variant creation (size, weight)  
✅ Inventory tracking toggle  
✅ SEO fields (meta title, description)  
✅ Draft and publish options

## Architecture

### Components Structure

```
src/components/seller/
├── product-form/
│   ├── AddProductForm.tsx          # Main form container
│   ├── RichTextEditor.tsx          # Tiptap-based editor
│   ├── ImageUploader.tsx           # Multi-image upload + sorting
│   ├── VariantManager.tsx          # Variant CRUD interface
│   ├── CategorySelector.tsx        # Category/subcategory picker
│   ├── SeoFields.tsx               # SEO meta fields
│   ├── InventoryControls.tsx       # Stock tracking toggle
│   └── FormToolbar.tsx             # Save draft/publish actions
```

### Data Flow

```
User Input → Form State → Validation → Sanity Client → CMS
                ↓                              ↑
           Local Storage               Image Upload Service
           (autosave)                   (Sanity Assets API)
```

## Sanity CMS Integration

### Product Schema Fields (from `studio/src/schemaTypes/documents/product.ts`)

| Field                      | Type             | Required | Description                |
| -------------------------- | ---------------- | -------- | -------------------------- |
| `name`                     | string           | ✅       | Product name               |
| `slug`                     | slug             | ✅       | Auto-generated from name   |
| `description`              | text             | ✅       | Plain text description     |
| `image`                    | image            | ✅       | Main product image         |
| `images`                   | array[image]     | ❌       | Additional gallery images  |
| `category`                 | reference        | ✅       | Category reference         |
| `price`                    | number           | ✅       | Regular price              |
| `isOnPromo`                | boolean          | ❌       | Promotion flag             |
| `promoPrice`               | number           | ❌       | Sale price (if on promo)   |
| `quantity`                 | number           | ✅       | Stock quantity             |
| `inventory.trackInventory` | boolean          | ❌       | Enable inventory tracking  |
| `hasVariants`              | boolean          | ❌       | Has product variants       |
| `variants`                 | array[reference] | ❌       | Product variant references |
| `sku`                      | string           | ❌       | Stock keeping unit         |
| `weight`                   | number           | ❌       | Weight in grams            |
| `seo.metaTitle`            | string           | ❌       | SEO title                  |
| `seo.metaDescription`      | text             | ❌       | SEO description            |

### Product Variant Schema (from `studio/src/schemaTypes/documents/productVariant.ts`)

| Field                       | Type      | Required | Description              |
| --------------------------- | --------- | -------- | ------------------------ |
| `product`                   | reference | ✅       | Parent product           |
| `name`                      | string    | ✅       | Full variant name        |
| `variantName`               | string    | ✅       | Display name             |
| `sku`                       | string    | ✅       | Unique SKU               |
| `variantType`               | string    | ✅       | Type (Size/Weight/Color) |
| `variantValue`              | string    | ✅       | Value (e.g., "Large")    |
| `price`                     | number    | ✅       | Variant price            |
| `compareAtPrice`            | number    | ❌       | Original price           |
| `inventory.quantityInStock` | number    | ❌       | Stock quantity           |
| `isAvailable`               | boolean   | ❌       | Availability flag        |

## Dependencies

### New Packages to Install

```json
{
  "@tiptap/react": "^2.8.0",
  "@tiptap/starter-kit": "^2.8.0",
  "@tiptap/extension-link": "^2.8.0",
  "@tiptap/extension-placeholder": "^2.8.0",
  "@tiptap/extension-text-align": "^2.8.0",
  "@hello-pangea/dnd": "^17.0.0"
}
```

**Note:** Using `@hello-pangea/dnd` (maintained fork of `react-beautiful-dnd`)

### Existing Packages

- `react-hook-form` + `zod` - Form validation
- `@sanity/client` + `next-sanity` - CMS integration
- `sonner` - Toast notifications
- `shadcn/ui` - UI components

## Component Specifications

### 1. RichTextEditor Component

**File:** `src/components/seller/product-form/RichTextEditor.tsx`

**Features:**

- Tiptap editor with toolbar
- Bold, italic, underline, strikethrough
- Headings (H2, H3), bullet/numbered lists
- Links (with URL input dialog)
- Text alignment (left, center, right)
- Character count
- Placeholder text

**Props:**

```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}
```

### 2. ImageUploader Component

**File:** `src/components/seller/product-form/ImageUploader.tsx`

**Features:**

- Multiple file upload (drag-and-drop or click)
- Image preview with thumbnails
- Drag-and-drop reordering (@hello-pangea/dnd)
- Delete individual images
- Set primary image (first = primary)
- Alt text input per image
- Upload progress indicator
- Max file size validation (5MB)

**Props:**

```typescript
interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // bytes
}

interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  alt: string;
  isPrimary: boolean;
  sanityAssetId?: string; // After upload
}
```

### 3. VariantManager Component

**File:** `src/components/seller/product-form/VariantManager.tsx`

**Features:**

- Add/remove variants
- Variant type selector (Size/Weight/Color)
- Variant value input
- Per-variant pricing
- Per-variant inventory
- SKU auto-generation (base SKU + variant)
- Validate unique SKUs
- Toggle "Has Variants" switch

**Props:**

```typescript
interface VariantManagerProps {
  hasVariants: boolean;
  onHasVariantsChange: (enabled: boolean) => void;
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
  baseSku: string;
}

interface ProductVariant {
  id: string;
  type: "Size" | "Weight" | "Color" | "Type" | "Package";
  value: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantityInStock: number;
  isAvailable: boolean;
}
```

### 4. AddProductForm Component

**File:** `src/components/seller/product-form/AddProductForm.tsx`

**Features:**

- React Hook Form + Zod validation
- Autosave to localStorage (every 30s)
- Draft/Publish toggle
- Form sections: Basic Info, Pricing, Inventory, Variants, Media, SEO
- Progress indicator
- Error summary
- Success/error toast notifications
- Unsaved changes warning

**Form Schema:**

```typescript
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.number().optional(),
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
  trackInventory: z.boolean().default(true),
  hasVariants: z.boolean().default(false),
  variants: z.array(variantSchema).optional(),
  images: z.array(imageSchema).min(1, "At least one image is required"),
  sku: z.string().optional(),
  weight: z.number().optional(),
  seo: z
    .object({
      metaTitle: z.string().max(60).optional(),
      metaDescription: z.string().max(160).optional(),
    })
    .optional(),
});
```

## Sanity Integration Utilities

### File: `src/lib/sanity/products.ts`

```typescript
// Upload image to Sanity
async function uploadImageToSanity(file: File): Promise<SanityAsset>;

// Create product document
async function createProduct(data: ProductFormData): Promise<Product>;

// Update product document
async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<Product>;

// Create product variant
async function createVariant(data: VariantFormData): Promise<ProductVariant>;

// Generate unique slug
async function generateUniqueSlug(name: string): Promise<string>;
```

## Implementation Steps

### Phase 1: Setup & Dependencies (30 min)

1. ✅ Install Tiptap packages
2. ✅ Install @hello-pangea/dnd
3. ✅ Create component directory structure
4. ✅ Set up Sanity products utilities

### Phase 2: Core Components (2 hours)

5. ✅ Build RichTextEditor with toolbar
6. ✅ Build ImageUploader with reordering
7. ✅ Build CategorySelector (reference existing categories)
8. ✅ Build SeoFields component

### Phase 3: Variant Management (1 hour)

9. ✅ Build VariantManager component
10. ✅ Implement SKU auto-generation
11. ✅ Add variant validation

### Phase 4: Main Form Integration (2 hours)

12. ✅ Build AddProductForm container
13. ✅ Integrate all sub-components
14. ✅ Implement form validation with Zod
15. ✅ Add autosave functionality (localStorage)
16. ✅ Implement draft/publish logic

### Phase 5: Sanity Integration (1.5 hours)

17. ✅ Implement image upload to Sanity Assets API
18. ✅ Implement product creation flow
19. ✅ Implement variant creation flow
20. ✅ Handle reference linking (category, variants)

### Phase 6: Route & Testing (1 hour)

21. ✅ Update `/seller/products/new/page.tsx` with new form
22. ✅ Test form validation
23. ✅ Test image upload & reordering
24. ✅ Test variant management
25. ✅ Test Sanity integration
26. ✅ Test autosave & draft functionality

**Total Estimated Time:** 7-8 hours

## Autosave Strategy

```typescript
// Debounced autosave to localStorage
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem("product-draft", JSON.stringify(formData));
  }, 30000); // Save every 30 seconds

  return () => clearTimeout(timer);
}, [formData]);

// Load draft on mount
useEffect(() => {
  const draft = localStorage.getItem("product-draft");
  if (draft) {
    const shouldRestore = confirm("Restore unsaved draft?");
    if (shouldRestore) {
      reset(JSON.parse(draft));
    }
  }
}, []);
```

## Error Handling

- **Image upload failures:** Retry with exponential backoff
- **Sanity API errors:** Show detailed error messages
- **Validation errors:** Inline field errors + summary at top
- **Network errors:** Save draft locally and notify user

## Accessibility

- Proper ARIA labels on all form fields
- Keyboard navigation for image reordering (arrow keys)
- Screen reader announcements for upload progress
- Focus management (auto-focus first error field)
- High contrast mode support

## Mobile Responsiveness

- Stack form sections vertically on mobile
- Touch-friendly drag handles for image reordering
- Mobile-optimized rich text editor toolbar
- Responsive image grid (1 col mobile, 3 cols desktop)

## Testing Checklist

- [ ] Form validation (required fields)
- [ ] Image upload (single & multiple)
- [ ] Image reordering (drag-and-drop)
- [ ] Variant creation & deletion
- [ ] SKU auto-generation
- [ ] Autosave functionality
- [ ] Draft restoration
- [ ] Publish to Sanity
- [ ] Category selection
- [ ] SEO fields
- [ ] Inventory toggle
- [ ] Rich text editor formatting
- [ ] Unsaved changes warning
- [ ] Error handling
- [ ] Mobile responsiveness

## Success Metrics

- ✅ Form submission creates product in Sanity CMS
- ✅ Images upload and display correctly
- ✅ Variants link properly to parent product
- ✅ Autosave prevents data loss
- ✅ Form validates all required fields
- ✅ No console errors during normal operation

## Future Enhancements

- Bulk variant import (CSV)
- Image editing (crop, filters)
- Product templates
- Duplicate product feature
- Scheduled publishing
- Product analytics integration

---

**Documentation Location:** `.github/ADD_PRODUCT_FORM_PLAN.md`  
**Related Files:**

- Sanity Schema: `studio/src/schemaTypes/documents/product.ts`
- Existing Page: `src/app/(seller)/seller/products/new/page.tsx`
