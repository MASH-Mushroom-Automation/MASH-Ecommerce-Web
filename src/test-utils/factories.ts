/**
 * Mock Data Factories
 * Provides factory functions for generating test data
 */

import { AuthUser } from '@/types/auth';

/**
 * Mock User Factory
 */
export function createMockUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/avatar.jpg',
    role: 'BUYER',
    emailVerified: true,
    source: 'firebase',
    ...overrides,
  };
}

/**
 * Mock Cart Item Factory
 */
export function createMockCartItem(overrides?: any) {
  return {
    _id: 'product-123',
    name: 'Test Product',
    slug: { current: 'test-product' },
    price: 99.99,
    image: 'https://example.com/product.jpg',
    quantity: 1,
    ...overrides,
  };
}

/**
 * Mock Cart Factory (v2 format)
 */
export function createMockCart(items: any[] = []) {
  return {
    version: 2,
    items,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Mock Product Factory
 */
export function createMockProduct(overrides?: any) {
  return {
    _id: 'product-123',
    _type: 'product',
    name: 'Test Product',
    slug: { current: 'test-product' },
    price: 99.99,
    image: 'https://example.com/product.jpg',
    category: {
      _id: 'category-1',
      name: 'Test Category',
    },
    description: 'Test product description',
    isAvailable: true,
    quantity: 100,
    ...overrides,
  };
}

/**
 * Mock Order Factory
 */
export function createMockOrder(overrides?: any) {
  return {
    id: 'order-123',
    userId: 'user-123',
    status: 'PENDING',
    items: [createMockCartItem()],
    total: 99.99,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Mock Address Factory
 */
export function createMockAddress(overrides?: any) {
  return {
    id: 'address-123',
    street: '123 Test Street',
    city: 'Test City',
    province: 'Metro Manila',
    postalCode: '1000',
    country: 'Philippines',
    isDefault: false,
    ...overrides,
  };
}

/**
 * Mock API Response Factory
 */
export function createMockAPIResponse<T>(data: T, message = 'Success') {
  return {
    data,
    message,
    statusCode: 200,
  };
}

/**
 * Mock API Error Factory
 */
export function createMockAPIError(message = 'Error occurred', statusCode = 400) {
  return {
    message,
    statusCode,
  };
}

/**
 * Mock Firebase User
 */
export function createMockFirebaseUser(overrides?: any) {
  return {
    uid: 'firebase-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/avatar.jpg',
    emailVerified: true,
    getIdToken: jest.fn(() => Promise.resolve('mock-token')),
    ...overrides,
  };
}
