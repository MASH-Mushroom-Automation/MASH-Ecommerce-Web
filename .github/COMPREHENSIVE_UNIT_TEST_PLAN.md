# MASH E-Commerce Platform - Comprehensive Unit Test Plan

## Overview
This document outlines the complete unit testing strategy for transforming MASH into a production-ready e-commerce platform following RALPH methodology and Test-Driven Development (TDD) principles.

---

## Current Test Status (Baseline)

**Total Tests**: 725  
**Passing**: 698 (96.3%)  
**Failing**: 25 (3.7%)  
**Execution Time**: ~24s  

### Test Failure Breakdown
1. **AuthContext.test.tsx**: 20 failures
   - Firebase sync timing issues
   - Cookie loading race conditions
   - Migration tests (localStorage → cookies)
   - Redirect restoration logic
   - Profile creation assertions

2. **WishlistContext.test.tsx**: 1 failure
   - Cookie loading timing race condition

3. **chatbot-integration.test.ts**: 3 failures
   - RAG service mock expectations mismatch

4. **api-integration.test.ts**: 1 failure
   - JSON handling in chatbot API routes

---

## Phase 0: Test Stabilization (CRITICAL - Priority 1)

### Goal
Achieve 100% test pass rate (725/725 tests) before implementing new features.

### STORY-FIX-001: AuthContext Test Fixes (20 failures)

#### Root Causes Analysis
- **Async Timing**: Firebase `onAuthStateChanged` callbacks not wrapped in `act()`
- **Cookie Race Conditions**: Tests asserting cookie values before async updates complete
- **Mock Cleanup**: Firebase mocks not properly reset between tests
- **Migration Logic**: Cart v2 format migration from localStorage to cookies failing in test env

#### Test Plan
```typescript
// src/contexts/__tests__/AuthContext.test.tsx

describe('AuthContext - Firebase Sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cookies and localStorage
    document.cookie = '';
    localStorage.clear();
  });

  it('should sync Firebase user to cookie after successful Google sign-in', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    // Wait for async state updates
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Verify cookie was set
    await waitFor(() => {
      const cookieExists = document.cookie.includes('user=');
      expect(cookieExists).toBe(true);
    }, { timeout: 3000 });
  });

  it('should clear cookies when Firebase user signs out', async () => {
    // Setup: Sign in first
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    // Act: Sign out
    await act(async () => {
      await result.current.signOut();
    });

    // Assert: Cookie cleared
    await waitFor(() => {
      const cookieExists = document.cookie.includes('user=');
      expect(cookieExists).toBe(false);
    });
  });

  it('should restore redirect URL after sign-in', async () => {
    const testRedirectUrl = '/checkout';
    Cookies.set('redirectAfterAuth', testRedirectUrl);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    await waitFor(() => {
      // Verify redirect URL was retrieved
      expect(result.current.user).toBeDefined();
    });
  });
});

describe('AuthContext - Profile Creation', () => {
  it('should create Firestore profile for new Google users', async () => {
    const mockFirestoreSet = jest.fn().mockResolvedValue(undefined);
    (setDoc as jest.Mock).mockImplementation(mockFirestoreSet);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    await act(async () => {
      await result.current.signInWithGoogle();
    });

    await waitFor(() => {
      expect(mockFirestoreSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: expect.any(String),
          email: expect.any(String),
          photoURL: expect.any(String),
          role: 'BUYER'
        })
      );
    });
  });
});

describe('AuthContext - Error Handling', () => {
  it('should handle Firebase network errors gracefully', async () => {
    const mockError = new Error('Network request failed');
    (signInWithPopup as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    
    await act(async () => {
      try {
        await result.current.signInWithGoogle();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

#### Fixes Required
1. **Wrap all async operations in `act()`**
   - Firebase auth state changes
   - Cookie operations
   - Firestore profile creation/updates

2. **Use `waitFor()` for cookie assertions**
   - Replace immediate assertions with async waitFor()
   - Increase timeout to 3000ms for slow operations

3. **Proper mock cleanup in `beforeEach()`**
   - Clear all mocks
   - Reset document.cookie
   - Clear localStorage

4. **Fix migration logic**
   - Ensure Cart v2 format migration completes before assertions
   - Mock localStorage with proper Cart v2 data

---

### STORY-FIX-002: Remaining Test Fixes (5 failures)

#### WishlistContext Test Fix
```typescript
// src/contexts/__tests__/WishlistContext.test.tsx

it('should load wishlist from cookies on mount', async () => {
  const mockItems = [{ productId: 'prod-1', addedAt: Date.now() }];
  Cookies.set('wishlist', JSON.stringify(mockItems));

  const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });

  // Wait for async cookie loading
  await waitFor(() => {
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('prod-1');
  }, { timeout: 2000 });
});
```

#### Chatbot Integration Test Fixes
```typescript
// src/__tests__/chatbot-integration.test.ts

describe('Chatbot RAG Service Integration', () => {
  beforeEach(() => {
    // Update mock expectations to match actual implementation
    (ragService.searchProducts as jest.Mock).mockResolvedValue([
      { id: 'prod-1', name: 'Blue Oyster', similarity: 0.95 }
    ]);
  });

  it('should return relevant products from RAG search', async () => {
    const query = 'blue oyster mushroom';
    const results = await ragService.searchProducts(query);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Blue Oyster');
    expect(results[0].similarity).toBeGreaterThan(0.9);
  });
});
```

#### API Integration Test Fix
```typescript
// src/app/api/chatbot/__tests__/api-integration.test.ts

it('should parse JSON request body correctly', async () => {
  const mockRequest = {
    json: jest.fn().mockResolvedValue({ message: 'test' })
  } as unknown as NextRequest;

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(data).toHaveProperty('reply');
});
```

---

## Phase 1: Core E-Commerce Features Testing

### STORY-REVIEW-001: Product Review System Tests

#### Unit Tests
```typescript
// src/lib/__tests__/review-service.test.ts

describe('Review Service', () => {
  describe('createReview', () => {
    it('should create review with valid data', async () => {
      const reviewData = {
        productId: 'prod-1',
        userId: 'user-1',
        rating: 5,
        title: 'Excellent quality',
        comment: 'Fresh and delicious',
        images: []
      };

      const review = await createReview(reviewData);

      expect(review).toMatchObject({
        ...reviewData,
        id: expect.any(String),
        createdAt: expect.any(Number),
        verified: false
      });
    });

    it('should reject review with rating < 1', async () => {
      const invalidData = { rating: 0, productId: 'prod-1' };

      await expect(createReview(invalidData)).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should reject review with rating > 5', async () => {
      const invalidData = { rating: 6, productId: 'prod-1' };

      await expect(createReview(invalidData)).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should limit images to 3 per review', async () => {
      const reviewData = {
        productId: 'prod-1',
        images: ['img1', 'img2', 'img3', 'img4']
      };

      await expect(createReview(reviewData)).rejects.toThrow('Maximum 3 images allowed');
    });
  });

  describe('calculateAverageRating', () => {
    it('should calculate average rating correctly', async () => {
      const reviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
        { rating: 3 }
      ];

      const avg = calculateAverageRating(reviews);

      expect(avg).toBe(4.25);
    });

    it('should return 0 for no reviews', async () => {
      const avg = calculateAverageRating([]);

      expect(avg).toBe(0);
    });
  });

  describe('markReviewAsVerified', () => {
    it('should verify review if user purchased product', async () => {
      const mockOrder = { items: [{ productId: 'prod-1' }] };
      (getOrdersByUser as jest.Mock).mockResolvedValue([mockOrder]);

      const result = await markReviewAsVerified('review-1', 'user-1', 'prod-1');

      expect(result.verified).toBe(true);
    });

    it('should not verify review if user never purchased product', async () => {
      (getOrdersByUser as jest.Mock).mockResolvedValue([]);

      const result = await markReviewAsVerified('review-1', 'user-1', 'prod-1');

      expect(result.verified).toBe(false);
    });
  });
});
```

#### Component Tests
```typescript
// src/components/product/__tests__/ReviewForm.test.tsx

describe('ReviewForm Component', () => {
  it('should render all form fields', () => {
    render(<ReviewForm productId="prod-1" onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByText(/upload images/i)).toBeInTheDocument();
  });

  it('should submit review with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<ReviewForm productId="prod-1" onSubmit={mockSubmit} />);

    await userEvent.click(screen.getAllByRole('button')[4]); // 5 stars
    await userEvent.type(screen.getByLabelText(/title/i), 'Great product');
    await userEvent.type(screen.getByLabelText(/comment/i), 'Highly recommend');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        rating: 5,
        title: 'Great product',
        comment: 'Highly recommend',
        images: []
      });
    });
  });

  it('should show error for empty title', async () => {
    render(<ReviewForm productId="prod-1" onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });

  it('should disable submit during loading', async () => {
    const mockSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<ReviewForm productId="prod-1" onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
```

---

### STORY-INVENTORY-001: Inventory Management Tests

#### Unit Tests
```typescript
// src/lib/__tests__/inventory-service.test.ts

describe('Inventory Service', () => {
  describe('checkStockAvailability', () => {
    it('should return true for in-stock product', async () => {
      const result = await checkStockAvailability('prod-1', 5);

      expect(result).toBe(true);
    });

    it('should return false for out-of-stock product', async () => {
      const result = await checkStockAvailability('prod-1', 100);

      expect(result).toBe(false);
    });

    it('should return false for exact stock quantity (reserved)', async () => {
      // Stock: 10, Request: 10 → should reserve for checkout
      const result = await checkStockAvailability('prod-1', 10);

      expect(result).toBe(false);
    });
  });

  describe('reserveInventory', () => {
    it('should reserve inventory for 15 minutes', async () => {
      const reservation = await reserveInventory('prod-1', 5, 'user-1');

      expect(reservation).toMatchObject({
        productId: 'prod-1',
        quantity: 5,
        userId: 'user-1',
        expiresAt: expect.any(Number)
      });

      // Verify expiration is ~15 minutes from now
      const expiresIn = reservation.expiresAt - Date.now();
      expect(expiresIn).toBeGreaterThan(14 * 60 * 1000); // >14 min
      expect(expiresIn).toBeLessThan(16 * 60 * 1000); // <16 min
    });

    it('should release expired reservations automatically', async () => {
      const reservation = await reserveInventory('prod-1', 5, 'user-1');

      // Fast-forward time 16 minutes
      jest.advanceTimersByTime(16 * 60 * 1000);

      const isReserved = await isInventoryReserved('prod-1', reservation.id);

      expect(isReserved).toBe(false);
    });
  });

  describe('updateInventory', () => {
    it('should update stock quantity', async () => {
      await updateInventory('prod-1', 50);

      const stock = await getInventory('prod-1');

      expect(stock.quantity).toBe(50);
    });

    it('should log inventory history', async () => {
      await updateInventory('prod-1', 50, 'Restock from supplier');

      const history = await getInventoryHistory('prod-1');

      expect(history[0]).toMatchObject({
        productId: 'prod-1',
        quantityChange: 50,
        reason: 'Restock from supplier',
        timestamp: expect.any(Number)
      });
    });

    it('should trigger low stock alert at threshold', async () => {
      const mockAlert = jest.fn();
      onLowStockAlert(mockAlert);

      await updateInventory('prod-1', 8); // threshold: 10

      expect(mockAlert).toHaveBeenCalledWith({
        productId: 'prod-1',
        currentStock: 8,
        threshold: 10
      });
    });
  });
});
```

---

### STORY-PROMO-001: Promotions & Discounts Tests

#### Unit Tests
```typescript
// src/lib/__tests__/discount-engine.test.ts

describe('Discount Engine', () => {
  describe('applyDiscount', () => {
    it('should apply percentage discount correctly', () => {
      const discount = { type: 'percentage', value: 20 }; // 20% off
      const cartTotal = 1000;

      const result = applyDiscount(cartTotal, discount);

      expect(result).toBe(800); // 1000 - 200
    });

    it('should apply fixed amount discount correctly', () => {
      const discount = { type: 'fixed', value: 150 };
      const cartTotal = 1000;

      const result = applyDiscount(cartTotal, discount);

      expect(result).toBe(850); // 1000 - 150
    });

    it('should not reduce total below zero', () => {
      const discount = { type: 'fixed', value: 1500 };
      const cartTotal = 1000;

      const result = applyDiscount(cartTotal, discount);

      expect(result).toBe(0); // Can't go negative
    });
  });

  describe('validateCoupon', () => {
    it('should validate active coupon', () => {
      const coupon = {
        code: 'SAVE20',
        expiresAt: Date.now() + 86400000, // Tomorrow
        usageLimit: 100,
        usageCount: 50
      };

      const result = validateCoupon(coupon);

      expect(result.isValid).toBe(true);
    });

    it('should reject expired coupon', () => {
      const coupon = {
        code: 'EXPIRED',
        expiresAt: Date.now() - 86400000, // Yesterday
        usageLimit: 100,
        usageCount: 50
      };

      const result = validateCoupon(coupon);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Coupon has expired');
    });

    it('should reject coupon at usage limit', () => {
      const coupon = {
        code: 'MAXEDOUT',
        expiresAt: Date.now() + 86400000,
        usageLimit: 100,
        usageCount: 100
      };

      const result = validateCoupon(coupon);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Coupon usage limit reached');
    });

    it('should validate minimum order amount', () => {
      const coupon = {
        code: 'BIGSAVE',
        minimumOrderAmount: 1000
      };

      const result = validateCoupon(coupon, 500); // Cart: ₱500

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Minimum order amount');
    });
  });

  describe('stackDiscounts', () => {
    it('should stack compatible discounts', () => {
      const discounts = [
        { type: 'percentage', value: 10, stackable: true }, // 10% off
        { type: 'fixed', value: 50, stackable: true } // ₱50 off
      ];
      const cartTotal = 1000;

      const result = stackDiscounts(cartTotal, discounts);

      // First: 10% off 1000 = 900
      // Second: ₱50 off 900 = 850
      expect(result).toBe(850);
    });

    it('should not stack non-stackable discounts', () => {
      const discounts = [
        { type: 'percentage', value: 10, stackable: false },
        { type: 'fixed', value: 50, stackable: true }
      ];
      const cartTotal = 1000;

      const result = stackDiscounts(cartTotal, discounts);

      // Only first discount applied (non-stackable)
      expect(result).toBe(900); // 10% off only
    });
  });
});
```

---

## Testing Best Practices

### 1. Test Structure (AAA Pattern)
```typescript
it('should do something', async () => {
  // Arrange: Set up test data
  const mockData = { id: '1', name: 'Test' };
  
  // Act: Execute the code under test
  const result = await functionUnderTest(mockData);
  
  // Assert: Verify the outcome
  expect(result).toBeDefined();
  expect(result.name).toBe('Test');
});
```

### 2. Mock External Dependencies
```typescript
// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithPopup: jest.fn(() => Promise.resolve({ user: mockUser }))
}));

// Mock Sanity
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(() => Promise.resolve([]))
  }
}));
```

### 3. Async Testing Patterns
```typescript
// Use waitFor for async assertions
await waitFor(() => {
  expect(result.current.data).toBeDefined();
}, { timeout: 3000 });

// Use act() for state updates
await act(async () => {
  await result.current.fetchData();
});

// Use findBy queries for async elements
const element = await screen.findByRole('button', { name: /submit/i });
```

### 4. Test Isolation
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  document.cookie = '';
  localStorage.clear();
});

afterEach(() => {
  cleanup(); // React Testing Library cleanup
});
```

### 5. Edge Cases & Error Handling
```typescript
it('should handle network errors gracefully', async () => {
  const mockError = new Error('Network failed');
  (fetch as jest.Mock).mockRejectedValue(mockError);

  await expect(apiCall()).rejects.toThrow('Network failed');
});

it('should handle empty data', () => {
  const result = processData([]);
  expect(result).toEqual([]);
});

it('should handle null values', () => {
  const result = processData(null);
  expect(result).toBeNull();
});
```

---

## Coverage Targets

| Module | Current | Target | Priority |
|--------|---------|--------|----------|
| AuthContext | 74% | 95% | Critical |
| CartContext | 82% | 90% | High |
| WishlistContext | 78% | 90% | High |
| Review System | 0% | 90% | High |
| Inventory Service | 0% | 85% | High |
| Discount Engine | 0% | 90% | Medium |
| Order Tracking | 65% | 85% | Medium |
| Notification Service | 0% | 80% | Medium |
| Analytics | 0% | 75% | Low |

---

## CI/CD Integration

### Pre-commit Hooks
```bash
# .husky/pre-commit
npm run lint
npm run test -- --passWithNoTests --bail
```

### CI Pipeline (Railway)
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
```

---

## Next Steps

1. **Fix all 25 test failures** (Phase 0 - CRITICAL)
2. **Implement review system tests** (Phase 1)
3. **Implement inventory management tests** (Phase 1)
4. **Implement promotion engine tests** (Phase 1)
5. **Achieve 90% overall code coverage** (Phase 3)
6. **Set up Lighthouse CI for performance testing** (Phase 3)

---

**Last Updated**: 2026-01-31  
**Document Version**: 1.0.0  
**Status**: Draft - Awaiting Phase 0 Completion
