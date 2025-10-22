# CMS Integration Guide

This document explains how the MASH E-commerce application has been refactored to be CMS-ready for easy backend integration.

## 🎯 Overview

All shop pages have been refactored to use dynamic data fetching instead of static mock data. The application is now structured to easily connect to any CMS or backend API.

## 📁 File Structure

### New API Layer

```
src/
├── types/
│   └── api.ts                    # TypeScript types for API responses
├── lib/
│   └── api/
│       └── products.ts           # Products API functions
├── hooks/
│   ├── useProducts.ts           # Custom hooks for product data
│   └── useCart.ts               # Custom hooks for cart management
├── components/
│   └── ui/
│       └── loading-spinner.tsx  # Loading states and skeletons
└── app/
    └── api/
        └── products/
            ├── route.ts         # GET /api/products
            └── [id]/
                └── route.ts      # GET /api/products/[id]
```

## 🔄 Refactored Pages

### 1. Catalog Page (`/catalog`)

- **Before**: Used static `PRODUCTS` array
- **After**: Uses `useProducts` hook with dynamic filtering, sorting, and pagination
- **Features**: Loading states, error handling, real-time filtering

### 2. Product Details (`/product/[id]`)

- **Before**: Used `getProductById` from static data
- **After**: Uses `useProduct` hook with loading states
- **Features**: Dynamic product fetching, related products, error handling

### 3. Wishlist Page (`/wishlist`)

- **Before**: Filtered static `PRODUCTS` array
- **After**: Fetches products dynamically based on wishlist IDs
- **Features**: Loading states, error handling, empty states

### 4. Checkout Page (`/checkout`)

- **Before**: Hardcoded cart items and prices
- **After**: Uses `useCart` hook with dynamic cart management
- **Features**: Real cart data, dynamic pricing, loading states

## 🛠 API Integration Points

### Current Implementation (Mock Data)

The application currently uses mock data with realistic API structure:

```typescript
// src/lib/api/products.ts
export class ProductsApi {
  static async getProducts(
    params: ProductsListParams
  ): Promise<ApiResponse<ProductApiResponse[]>>;
  static async getProductById(
    id: string
  ): Promise<ApiResponse<ProductApiResponse | null>>;
  static async getCategories(): Promise<ApiResponse<string[]>>;
  static async getGrowers(): Promise<ApiResponse<string[]>>;
  static async searchProducts(
    query: string,
    limit: number
  ): Promise<ApiResponse<ProductApiResponse[]>>;
}
```

### Backend Integration

To connect to a real backend, simply replace the mock implementations in `src/lib/api/products.ts`:

```typescript
// Example: Replace mock with real API calls
export class ProductsApi {
  static async getProducts(
    params: ProductsListParams
  ): Promise<ApiResponse<ProductApiResponse[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/products?${searchParams}`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return response.json();
  }
}
```

## 🎨 UI Components

### Loading States

- **LoadingSpinner**: Animated spinner for loading states
- **ProductCardSkeleton**: Skeleton for product cards
- **ProductGridSkeleton**: Skeleton for product grids

### Error Handling

- Consistent error messages across all pages
- Retry functionality for failed requests
- Graceful fallbacks for missing data

## 🔧 Custom Hooks

### useProducts

```typescript
const { products, loading, error, pagination, refetch, setParams } =
  useProducts(params);
```

### useProduct

```typescript
const { product, loading, error } = useProduct(id);
```

### useCart

```typescript
const { items, summary, addToCart, removeFromCart, updateQuantity, clearCart } =
  useCart();
```

## 📊 Data Flow

1. **User Interaction** → Component triggers data fetch
2. **Custom Hook** → Manages loading/error states
3. **API Layer** → Handles data fetching (currently mock, ready for real API)
4. **UI Update** → Component re-renders with new data

## 🚀 Benefits

### For Development

- **Consistent Patterns**: All pages use the same data fetching patterns
- **Type Safety**: Full TypeScript support with proper types
- **Error Handling**: Comprehensive error handling across all pages
- **Loading States**: Professional loading states and skeletons

### For Backend Integration

- **Easy Migration**: Simply replace mock functions with real API calls
- **Flexible**: Works with any REST API or GraphQL endpoint
- **Scalable**: Structure supports complex filtering, pagination, and search
- **Maintainable**: Clear separation of concerns

## 🔄 Migration Steps

When your backend is ready:

1. **Update API Base URL**: Set `NEXT_PUBLIC_API_URL` environment variable
2. **Replace Mock Functions**: Update `src/lib/api/products.ts` with real API calls
3. **Update Types**: Modify `src/types/api.ts` to match your backend response format
4. **Test Integration**: Verify all pages work with real data

## 📝 Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## 🎯 Ready for CMS

The application is now fully prepared for CMS integration. All shop pages will automatically work with your backend once you:

1. Replace the mock API functions with real API calls
2. Update the API base URL
3. Ensure your backend follows the expected response format

The frontend is completely decoupled from the data source, making it easy to switch between mock data and real CMS data.
