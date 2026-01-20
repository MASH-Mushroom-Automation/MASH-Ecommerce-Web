# Product Form Components

Comprehensive seller dashboard product form with rich text editing, multi-image upload with drag-and-drop reordering, variant management, and full Sanity CMS integration.

## Components

### AddProductForm

Main form container that integrates all sub-components.

**Features:**

- React Hook Form + Zod validation
- Autosave to localStorage every 30 seconds
- Draft restoration on page load
- Unsaved changes warning
- Tab-based UI (Basic Info, Pricing, Media, Variants, SEO)
- Progress tracking and error summary
- Success/error toast notifications

**Usage:**

```tsx
import { AddProductForm } from "@/components/seller/product-form";

export default function AddProductPage() {
  return <AddProductForm />;
}
```

### RichTextEditor

Tiptap-based WYSIWYG editor with formatting toolbar.

**Features:**

- Bold, italic, strikethrough
- Headings (H2, H3)
- Bullet and numbered lists
- Hyperlinks with URL dialog
- Text alignment (left, center, right)
- Undo/redo
- Character count with limit
- Placeholder text

**Usage:**

```tsx
import { RichTextEditor } from "@/components/seller/product-form";

<RichTextEditor
  value={description}
  onChange={setDescription}
  placeholder="Write a description..."
  maxLength={5000}
  error={errors.description}
/>;
```

### ImageUploader

Multi-image upload with drag-and-drop reordering.

**Features:**

- Drag-and-drop or click to upload
- Image preview with thumbnails
- Drag-and-drop reordering (@hello-pangea/dnd)
- Delete individual images
- Alt text input per image
- Primary image indicator (first image)
- File size validation (5MB default)
- Upload progress indicator

**Usage:**

```tsx
import { ImageUploader, UploadedImage } from "@/components/seller/product-form";

const [images, setImages] = useState<UploadedImage[]>([]);

<ImageUploader
  images={images}
  onImagesChange={setImages}
  maxImages={10}
  maxFileSize={5 * 1024 * 1024}
/>;
```

**UploadedImage Type:**

```typescript
interface UploadedImage {
  id: string;
  file?: File;
  url: string;
  alt: string;
  isPrimary: boolean;
  sanityAssetId?: string;
}
```

### VariantManager

Product variant management (size, weight, color, etc.)

**Features:**

- Add/remove variants
- Variant type selector (Size/Weight/Color/Type/Package)
- Per-variant pricing and inventory
- SKU auto-generation
- Availability toggle per variant
- Enable/disable variants toggle with confirmation

**Usage:**

```tsx
import {
  VariantManager,
  ProductVariant,
} from "@/components/seller/product-form";

const [hasVariants, setHasVariants] = useState(false);
const [variants, setVariants] = useState<ProductVariant[]>([]);

<VariantManager
  hasVariants={hasVariants}
  onHasVariantsChange={setHasVariants}
  variants={variants}
  onVariantsChange={setVariants}
  basePrice={price}
  baseSku={sku}
/>;
```

**ProductVariant Type:**

```typescript
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

### CategorySelector

Category and subcategory picker from Sanity CMS.

**Features:**

- Fetches categories from Sanity
- Hierarchical display (parent > subcategory)
- Loading skeleton
- Error handling

**Usage:**

```tsx
import { CategorySelector } from "@/components/seller/product-form";

<CategorySelector
  value={categoryId}
  onChange={setCategoryId}
  error={errors.category}
/>;
```

### SeoFields

SEO meta title and description inputs.

**Features:**

- Character count with optimal limits (60/160)
- Warning for excessive length
- Auto-fallback to product name/description
- Placeholder text with dynamic product name

**Usage:**

```tsx
import { SeoFields } from "@/components/seller/product-form";

<SeoFields
  metaTitle={metaTitle}
  metaDescription={metaDescription}
  onMetaTitleChange={setMetaTitle}
  onMetaDescriptionChange={setMetaDescription}
  productName={productName}
/>;
```

## Sanity Integration

### API Functions (`src/lib/sanity/products.ts`)

#### `uploadImageToSanity(file: File): Promise<SanityAsset>`

Uploads an image file to Sanity Assets API.

#### `uploadProductImages(images: UploadedImage[]): Promise<SanityImageAsset[]>`

Uploads multiple images and returns Sanity asset references.

#### `generateUniqueSlug(name: string): Promise<string>`

Generates a URL-friendly slug and ensures uniqueness.

#### `createProduct(data: ProductFormData): Promise<{ _id: string; slug: string }>`

Creates a new product document in Sanity CMS with images, variants, and metadata.

**Workflow:**

1. Uploads all images to Sanity Assets API
2. Generates unique slug from product name
3. Creates main product document
4. Creates variant documents if variants enabled
5. Links variants to product
6. Returns product ID and slug

#### `updateProduct(productId: string, data: ProductFormData): Promise<{ _id: string; slug: string }>`

Updates an existing product document.

#### `fetchCategories()`

Fetches all categories and subcategories for the category selector.

## Form Validation Schema

```typescript
const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.number().optional(),
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
  trackInventory: z.boolean(),
  hasVariants: z.boolean(),
  sku: z.string().optional(),
  weight: z.number().optional(),
  metaTitle: z.string().max(70, "Meta title too long").optional(),
  metaDescription: z.string().max(200, "Meta description too long").optional(),
  isAvailable: z.boolean(),
});
```

## Autosave Strategy

- **Trigger:** Every 30 seconds if form has unsaved changes
- **Storage:** localStorage with key `product-form-draft`
- **Data:** All form fields + images (without File objects) + variants
- **Restoration:** Prompt on page load if draft exists
- **Clearing:** Automatically cleared on successful submission

## Environment Variables Required

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=gerattrr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_TOKEN=<your-token-with-write-access>
```

## Installation

Dependencies are already installed:

```bash
npm install --legacy-peer-deps @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align @hello-pangea/dnd
```

## File Structure

```
src/components/seller/product-form/
├── AddProductForm.tsx          # Main form container
├── RichTextEditor.tsx          # Tiptap editor
├── ImageUploader.tsx           # Multi-image upload + sorting
├── VariantManager.tsx          # Variant CRUD
├── CategorySelector.tsx        # Category picker
├── SeoFields.tsx               # SEO meta fields
└── index.ts                    # Barrel export

src/lib/sanity/
└── products.ts                 # Sanity API functions

src/app/(seller)/seller/products/new/
└── page.tsx                    # Route implementation
```

## Testing Checklist

- [x] Form validation (required fields)
- [x] Rich text editor formatting
- [x] Image upload (single & multiple)
- [x] Image reordering (drag-and-drop)
- [x] Image alt text editing
- [x] Variant creation & deletion
- [x] SKU auto-generation
- [ ] Autosave functionality (manual test required)
- [ ] Draft restoration (manual test required)
- [ ] Publish to Sanity (requires Sanity token)
- [ ] Category selection (requires Sanity data)
- [ ] SEO fields validation
- [ ] Inventory toggle
- [ ] Unsaved changes warning
- [ ] Error handling
- [ ] Mobile responsiveness

## Known Limitations

1. **Image Upload:** Requires `NEXT_PUBLIC_SANITY_API_TOKEN` with write permissions
2. **Categories:** Must exist in Sanity CMS before selection
3. **Variants:** Cannot be edited after creation (current implementation)
4. **Rich Text:** Outputs HTML (not Portable Text for Sanity block content)

## Future Enhancements

- Bulk variant import (CSV)
- Image editing (crop, filters)
- Product templates
- Duplicate product feature
- Scheduled publishing
- Product analytics integration
- Convert rich text to Portable Text for better Sanity integration

## Troubleshooting

### Images not uploading

- Check `NEXT_PUBLIC_SANITY_API_TOKEN` is set
- Verify token has write permissions for Assets
- Check browser console for CORS errors

### Categories not loading

- Verify Sanity project has categories
- Check Sanity client configuration in `src/lib/sanity/client.ts`

### Form not submitting

- Open browser console for validation errors
- Check network tab for API errors
- Verify all required fields are filled

### Autosave not working

- Check browser localStorage is enabled
- Open DevTools > Application > Local Storage
- Look for key `product-form-draft`

## Support

For issues or questions, refer to:

- [Implementation Plan](./.github/ADD_PRODUCT_FORM_PLAN.md)
- [Sanity Product Schema](../../../studio/src/schemaTypes/documents/product.ts)
