# MASH Platform - Backend API Connection Guide

## 📋 Overview

This guide provides **complete step-by-step instructions** for connecting the MASH E-Commerce frontend (Next.js) to the backend API (Prisma + Node.js/Express). Follow this guide to ensure proper data synchronization between your frontend and the PostgreSQL database.

> **🔗 Schema Reference**: `MASH-Backend/prisma/schema.prisma` (47 models, 28 enums)  
> **📦 Frontend Products**: `data/products-database.json` (9 products)  
> **⚠️ Critical**: All enum values MUST be UPPERCASE when sending to backend

---

## 🎯 Table of Contents

1. [Backend API Setup](#1-backend-api-setup)
2. [Environment Configuration](#2-environment-configuration)
3. [API Endpoints Structure](#3-api-endpoints-structure)
4. [Frontend API Integration](#4-frontend-api-integration)
5. [Data Type Mapping](#5-data-type-mapping)
6. [Enum Value Handling](#6-enum-value-handling)
7. [Error Handling](#7-error-handling)
8. [Testing API Connections](#8-testing-api-connections)
9. [Migration Strategy](#9-migration-strategy)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Backend API Setup

### 1.1 Backend Project Structure

```
MASH-Backend/
├── prisma/
│   ├── schema.prisma          # Database schema (47 models)
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seed file
├── src/
│   ├── routes/
│   │   ├── products.ts        # Product routes
│   │   ├── users.ts           # User routes
│   │   ├── orders.ts          # Order routes
│   │   ├── categories.ts      # Category routes
│   │   └── ...
│   ├── controllers/
│   │   ├── productController.ts
│   │   ├── userController.ts
│   │   └── ...
│   ├── services/
│   │   ├── productService.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   └── server.ts              # Express server
├── .env                       # Environment variables
└── package.json
```

### 1.2 Install Backend Dependencies

```bash
cd MASH-Backend

# Core dependencies
npm install express cors dotenv
npm install @prisma/client
npm install bcrypt jsonwebtoken
npm install express-validator

# Development dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/bcrypt @types/jsonwebtoken
npm install -D nodemon ts-node prisma
```

### 1.3 Initialize Prisma

```bash
# Initialize Prisma (if not already done)
npx prisma init

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

---

## 2. Environment Configuration

### 2.1 Backend Environment Variables (`MASH-Backend/.env`)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mash_ecommerce?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Clerk (if using)
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 2.2 Frontend Environment Variables (`MASH-Ecommerce-Web/.env.local`)

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 3. API Endpoints Structure

### 3.1 Products API Endpoints

**Backend Routes** (`MASH-Backend/src/routes/products.ts`):

```typescript
import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', productController.getAllProducts);           // GET /api/products
router.get('/featured', productController.getFeaturedProducts); // GET /api/products/featured
router.get('/search', productController.searchProducts);     // GET /api/products/search?q=...
router.get('/:id', productController.getProductById);        // GET /api/products/:id
router.get('/slug/:slug', productController.getProductBySlug); // GET /api/products/slug/:slug

// Protected routes (require authentication)
router.post('/', authenticate, productController.createProduct);        // POST /api/products
router.put('/:id', authenticate, productController.updateProduct);      // PUT /api/products/:id
router.delete('/:id', authenticate, productController.deleteProduct);   // DELETE /api/products/:id
router.patch('/:id/stock', authenticate, productController.updateStock); // PATCH /api/products/:id/stock

export default router;
```

### 3.2 Complete API Endpoint List

```
PRODUCTS
  GET    /api/products                    # Get all products (with pagination)
  GET    /api/products/featured           # Get featured products
  GET    /api/products/search?q=...       # Search products
  GET    /api/products/:id                # Get product by ID
  GET    /api/products/slug/:slug         # Get product by slug
  POST   /api/products                    # Create product (admin)
  PUT    /api/products/:id                # Update product (admin)
  DELETE /api/products/:id                # Delete product (admin)
  PATCH  /api/products/:id/stock          # Update stock (admin)

CATEGORIES
  GET    /api/categories                  # Get all categories
  GET    /api/categories/:id              # Get category by ID
  GET    /api/categories/:id/products     # Get products in category
  POST   /api/categories                  # Create category (admin)
  PUT    /api/categories/:id              # Update category (admin)
  DELETE /api/categories/:id              # Delete category (admin)

USERS
  GET    /api/users/me                    # Get current user
  GET    /api/users/:id                   # Get user by ID (admin)
  PUT    /api/users/:id                   # Update user
  DELETE /api/users/:id                   # Delete user (admin)
  POST   /api/users/register              # Register new user
  POST   /api/users/login                 # Login user
  POST   /api/users/logout                # Logout user

ORDERS
  GET    /api/orders                      # Get user's orders
  GET    /api/orders/:id                  # Get order by ID
  POST   /api/orders                      # Create order
  PUT    /api/orders/:id                  # Update order (admin)
  PATCH  /api/orders/:id/status           # Update order status (admin)
  DELETE /api/orders/:id                  # Cancel order

ADDRESSES
  GET    /api/addresses                   # Get user's addresses
  GET    /api/addresses/:id               # Get address by ID
  POST   /api/addresses                   # Create address
  PUT    /api/addresses/:id               # Update address
  DELETE /api/addresses/:id               # Delete address
  PATCH  /api/addresses/:id/default       # Set as default address

PAYMENTS
  GET    /api/payments                    # Get payment methods
  GET    /api/payments/:id                # Get payment by ID
  POST   /api/payments/process            # Process payment
  POST   /api/payments/gcash/initiate     # Initiate GCash payment
  POST   /api/payments/verify             # Verify payment

DEVICES (IoT)
  GET    /api/devices                     # Get all devices
  GET    /api/devices/:id                 # Get device by ID
  GET    /api/devices/:id/sensors         # Get device sensors
  GET    /api/devices/:id/health          # Get device health
  POST   /api/devices                     # Register device
  PUT    /api/devices/:id                 # Update device
  POST   /api/devices/:id/commands        # Send command to device

SENSORS
  GET    /api/sensors                     # Get all sensors
  GET    /api/sensors/:id                 # Get sensor by ID
  GET    /api/sensors/:id/data            # Get sensor data
  POST   /api/sensors/:id/data            # Add sensor reading
  GET    /api/sensors/:id/alerts          # Get sensor alerts
```

---

## 4. Frontend API Integration

### 4.1 Create API Client (`src/lib/api/client.ts`)

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/sign-in';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Error setting up request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 4.2 Create Products API Service (`src/lib/api/products.ts`)

```typescript
import apiClient from './client';

// Types matching Prisma schema
export interface ProductApiResponse {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  weight?: string;
  images: string[];
  image: string;
  category?: string;
  categories: string[];
  tag?: string;
  tags: string[];
  grower?: string;
  growerId?: string;
  inStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: ProductApiResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductData {
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  weight?: string;
  images: string[];
  categories: string[];
  tags: string[];
  growerId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

// API Functions
export const productsApi = {
  // Get all products with pagination
  async getAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    search?: string;
  }): Promise<ProductsResponse> {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },

  // Get featured products
  async getFeatured(): Promise<ProductApiResponse[]> {
    const { data } = await apiClient.get('/products/featured');
    return data;
  },

  // Get product by ID
  async getById(id: string): Promise<ProductApiResponse> {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  // Get product by slug
  async getBySlug(slug: string): Promise<ProductApiResponse> {
    const { data } = await apiClient.get(`/products/slug/${slug}`);
    return data;
  },

  // Search products
  async search(query: string): Promise<ProductApiResponse[]> {
    const { data } = await apiClient.get('/products/search', {
      params: { q: query },
    });
    return data;
  },

  // Create product (admin only)
  async create(productData: CreateProductData): Promise<ProductApiResponse> {
    const { data } = await apiClient.post('/products', productData);
    return data;
  },

  // Update product (admin only)
  async update(id: string, productData: Partial<CreateProductData>): Promise<ProductApiResponse> {
    const { data } = await apiClient.put(`/products/${id}`, productData);
    return data;
  },

  // Delete product (admin only)
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  },

  // Update stock (admin only)
  async updateStock(id: string, stock: number): Promise<ProductApiResponse> {
    const { data } = await apiClient.patch(`/products/${id}/stock`, { stock });
    return data;
  },
};

// Feature flag for mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Mock data fallback (from products-database.json)
const MOCK_PRODUCTS: ProductApiResponse[] = require('@/data/products-database.json');

// Wrapper function to use mock or real API
export async function getProducts(params?: Parameters<typeof productsApi.getAll>[0]): Promise<ProductsResponse> {
  if (USE_MOCK_DATA) {
    // Use mock data from JSON file
    const allProducts = MOCK_PRODUCTS.filter(p => !p.isDeleted && p.isActive);
    
    // Apply filters
    let filtered = allProducts;
    if (params?.category) {
      filtered = filtered.filter(p => p.categories.includes(params.category!));
    }
    if (params?.featured) {
      filtered = filtered.filter(p => p.isFeatured);
    }
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filtered.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }
  
  // Use real API
  return productsApi.getAll(params);
}

export async function getFeaturedProducts(): Promise<ProductApiResponse[]> {
  if (USE_MOCK_DATA) {
    return MOCK_PRODUCTS.filter(p => p.isFeatured && !p.isDeleted && p.isActive);
  }
  return productsApi.getFeatured();
}

export async function getProductById(id: string): Promise<ProductApiResponse | null> {
  if (USE_MOCK_DATA) {
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }
  return productsApi.getById(id);
}

export async function getProductBySlug(slug: string): Promise<ProductApiResponse | null> {
  if (USE_MOCK_DATA) {
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }
  return productsApi.getBySlug(slug);
}
```

### 4.3 Usage in Components

```typescript
// In Server Components
import { getProducts, getFeaturedProducts } from '@/lib/api/products';

export default async function ProductsPage() {
  const { products, pagination } = await getProducts({ 
    page: 1, 
    limit: 12 
  });
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// In Client Components with React Query
'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';

export function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll({ page: 1, limit: 12 }),
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;
  
  return (
    <div>
      {data?.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 5. Data Type Mapping

### 5.1 Prisma to TypeScript/JSON Mapping

| Prisma Type | TypeScript Type | JSON Type | Example |
|-------------|----------------|-----------|---------|
| `String` | `string` | `"string"` | `"Fresh Oyster"` |
| `Int` | `number` | `123` | `45` |
| `Float` / `Decimal` | `number` | `123.45` | `120.00` |
| `Boolean` | `boolean` | `true/false` | `true` |
| `DateTime` | `Date` / `string` | `"ISO 8601"` | `"2024-01-01T00:00:00Z"` |
| `Json` | `any` / `object` | `{}` / `[]` | `{"key": "value"}` |
| `String[]` | `string[]` | `["..."]` | `["tag1", "tag2"]` |
| `Enum` | `enum` / `string` | `"UPPERCASE"` | `"PENDING"` |

### 5.2 Frontend to Backend Data Transformation

```typescript
// Frontend Product Data (from form or JSON)
const frontendProduct = {
  name: "Fresh Oyster Mushrooms",
  price: 120,
  stock: 45,
  categories: ["Fresh Mushroom", "Oyster Mushrooms"],
  tags: ["New", "Fresh"],
  inStock: true,
  isFeatured: true,
};

// Backend expects certain fields in specific format
const backendProduct = {
  ...frontendProduct,
  // Ensure price is number
  price: Number(frontendProduct.price),
  // Ensure stock is integer
  stock: Math.floor(Number(frontendProduct.stock)),
  // Convert date strings to ISO 8601
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // Arrays should remain as arrays (Prisma handles conversion)
  categories: frontendProduct.categories,
  tags: frontendProduct.tags,
};
```

---

## 6. Enum Value Handling

### 6.1 Critical Enum Rules

⚠️ **IMPORTANT**: The Prisma database expects **UPPERCASE** enum values. The frontend may display lowercase or titlecase, but must convert to UPPERCASE before sending to backend.

### 6.2 All Enums from Schema

```typescript
// User roles
export enum UserRole {
  USER = 'USER',
  BUYER = 'BUYER',
  GROWER = 'GROWER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Session status
export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

// Device types
export enum DeviceType {
  TEMPERATURE_SENSOR = 'TEMPERATURE_SENSOR',
  HUMIDITY_SENSOR = 'HUMIDITY_SENSOR',
  CO2_SENSOR = 'CO2_SENSOR',
  LIGHT_SENSOR = 'LIGHT_SENSOR',
  SOIL_MOISTURE_SENSOR = 'SOIL_MOISTURE_SENSOR',
  CONTROLLER = 'CONTROLLER',
  CAMERA = 'CAMERA',
}

// Device status
export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
}

// Order status
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Payment status
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Payment methods
export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  GCASH = 'GCASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MAYA = 'MAYA',
}

// Notification types
export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  DEVICE_ALERT = 'DEVICE_ALERT',
  SECURITY = 'SECURITY',
}

// ... (see schema.prisma for 20+ more enums)
```

### 6.3 Enum Conversion Utility

```typescript
// src/lib/utils/enums.ts

/**
 * Convert display value to backend enum value
 * Frontend: "Cash on Delivery" -> Backend: "CASH_ON_DELIVERY"
 */
export function toBackendEnum(value: string): string {
  return value
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
}

/**
 * Convert backend enum to display value
 * Backend: "CASH_ON_DELIVERY" -> Frontend: "Cash on Delivery"
 */
export function toDisplayEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Usage examples
toBackendEnum("Cash on Delivery")  // "CASH_ON_DELIVERY"
toBackendEnum("gcash")             // "GCASH"
toBackendEnum("pending")           // "PENDING"

toDisplayEnum("CASH_ON_DELIVERY")  // "Cash On Delivery"
toDisplayEnum("GCASH")             // "Gcash"
toDisplayEnum("PENDING")           // "Pending"
```

---

## 7. Error Handling

### 7.1 Backend Error Response Format

```typescript
// Success response
{
  success: true,
  data: { /* product data */ },
  message: "Product created successfully"
}

// Error response
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid product data",
    details: [
      { field: "price", message: "Price must be greater than 0" },
      { field: "stock", message: "Stock is required" }
    ]
  }
}
```

### 7.2 Frontend Error Handling

```typescript
import { AxiosError } from 'axios';

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data?.error as ApiError;
    
    if (apiError) {
      // Show specific error message
      return apiError.message;
    }
    
    // Network or server error
    if (error.response) {
      return `Server error: ${error.response.status}`;
    } else if (error.request) {
      return 'Network error: Unable to reach server';
    }
  }
  
  return 'An unexpected error occurred';
}

// Usage in component
try {
  await productsApi.create(productData);
  toast.success('Product created successfully');
} catch (error) {
  const errorMessage = handleApiError(error);
  toast.error(errorMessage);
}
```

---

## 8. Testing API Connections

### 8.1 Manual Testing with cURL

```bash
# Test GET all products
curl http://localhost:5000/api/products

# Test GET product by ID
curl http://localhost:5000/api/products/1

# Test GET featured products
curl http://localhost:5000/api/products/featured

# Test POST create product (with auth)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "price": 100,
    "stock": 10,
    "minStock": 5,
    "images": ["/test.jpg"],
    "categories": ["Fresh Mushroom"],
    "tags": ["Test"],
    "isActive": true,
    "isFeatured": false
  }'

# Test PATCH update stock
curl -X PATCH http://localhost:5000/api/products/1/stock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"stock": 50}'
```

### 8.2 Testing with Postman or Thunder Client

1. **Import API Collection**: Create a collection with all endpoints
2. **Set Environment Variables**:
   - `BASE_URL`: `http://localhost:5000/api`
   - `AUTH_TOKEN`: Your JWT token
3. **Test Each Endpoint**: Verify request/response formats
4. **Export Collection**: Save for team collaboration

### 8.3 Automated Testing

```typescript
// tests/api/products.test.ts
import { describe, it, expect } from 'vitest';
import { productsApi } from '@/lib/api/products';

describe('Products API', () => {
  it('should fetch all products', async () => {
    const response = await productsApi.getAll();
    expect(response.products).toBeInstanceOf(Array);
    expect(response.pagination).toBeDefined();
  });

  it('should fetch featured products', async () => {
    const products = await productsApi.getFeatured();
    expect(products.every(p => p.isFeatured)).toBe(true);
  });

  it('should fetch product by ID', async () => {
    const product = await productsApi.getById('1');
    expect(product.id).toBe('1');
    expect(product.name).toBeDefined();
  });
});
```

---

## 9. Migration Strategy

### 9.1 Phase 1: Setup (Week 1)

- [ ] Set up backend API server (Express + Prisma)
- [ ] Configure database connection
- [ ] Run Prisma migrations
- [ ] Create seed data from `products-database.json`
- [ ] Set up CORS for frontend
- [ ] Configure environment variables

### 9.2 Phase 2: API Development (Week 2-3)

- [ ] Implement Products API endpoints
- [ ] Implement Categories API endpoints
- [ ] Implement Users API endpoints (if not using Clerk)
- [ ] Implement Orders API endpoints
- [ ] Implement Addresses API endpoints
- [ ] Implement Payments API endpoints
- [ ] Add authentication middleware
- [ ] Add validation middleware
- [ ] Test all endpoints with Postman

### 9.3 Phase 3: Frontend Integration (Week 4-5)

- [ ] Create API client (`src/lib/api/client.ts`)
- [ ] Create Products API service (`src/lib/api/products.ts`)
- [ ] Create other API services (users, orders, etc.)
- [ ] Update all components to use API instead of mock data
- [ ] Set up React Query for data fetching
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test frontend-backend integration

### 9.4 Phase 4: Testing & Optimization (Week 6)

- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Caching strategy (React Query, Redis)
- [ ] Error logging (Sentry)
- [ ] API documentation (Swagger)
- [ ] Deploy backend API
- [ ] Update frontend environment variables

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue**: `CORS Error: Access-Control-Allow-Origin`
**Solution**: Configure CORS in backend

```typescript
// server.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

**Issue**: `401 Unauthorized`
**Solution**: Check authentication token

```typescript
// Verify token is being sent
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// Check backend authentication middleware
```

---

**Issue**: `Enum value error: Invalid value for OrderStatus`
**Solution**: Ensure enum values are UPPERCASE

```typescript
// ❌ Wrong
const order = { status: 'pending' };

// ✅ Correct
const order = { status: 'PENDING' };

// Or use utility
import { toBackendEnum } from '@/lib/utils/enums';
const order = { status: toBackendEnum('pending') };
```

---

**Issue**: `Connection timeout`
**Solution**: Increase timeout or check network

```typescript
// Increase timeout in API client
const apiClient = axios.create({
  timeout: 60000, // 60 seconds
});
```

---

**Issue**: `Database connection error`
**Solution**: Verify DATABASE_URL in `.env`

```bash
# Check connection
npx prisma db push

# Generate client
npx prisma generate

# Check database
npx prisma studio
```

---

## 📚 Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Axios Documentation**: https://axios-http.com/docs/intro
- **React Query**: https://tanstack.com/query/latest
- **Express.js Guide**: https://expressjs.com/en/guide/routing.html

---

## 🔗 Related Documentation

- [`JSON_DATA_STRUCTURE_GUIDE.md`](./JSON_DATA_STRUCTURE_GUIDE.md) - Complete JSON structures for all 47 tables
- [`API_Endpoints_Structure.md`](../documents/API_Endpoints_Structure.md) - Detailed API endpoint specifications
- [`Backend_Development_Plan.md`](../documents/Backend_Development_Plan.md) - Backend architecture and planning
- [`Database_Schema_Design.md`](../documents/Database_Schema_Design.md) - Database design documentation

---

**Last Updated**: November 10, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
