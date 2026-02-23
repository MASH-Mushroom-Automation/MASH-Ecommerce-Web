# Unit Testing Guide - MASH E-Commerce Platform

> Best practices for writing and running tests in the MASH codebase

---

## Overview

| Metric | Value |
|--------|-------|
| **Test Runner** | Jest + React Testing Library |
| **Coverage Target** | 80% (statements, branches, functions, lines) |
| **CI Behavior** | Non-blocking (informational only) |
| **Required Before Merge** | Build must pass |

---

## Quick Commands

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPatterns="AuthContext"

# Run in watch mode (development)
npm run test:watch

# Run E2E tests (Playwright)
npm run test:e2e
```

---

## Test File Structure

```
src/
├── contexts/__tests__/          # Context provider tests
│   ├── AuthContext.test.tsx
│   ├── CartContext.test.tsx
│   └── WishlistContext.test.tsx
├── components/
│   └── __tests__/               # Component tests (co-located)
├── lib/__tests__/               # Utility function tests
└── app/api/**/__tests__/        # API route tests
```

---

## Mock Setup Files

### `jest.setupMocks.js` (Pre-initialization)

This file runs **BEFORE** any test files are loaded. It contains:
- Firebase module mocks (`firebase/app`, `firebase/auth`, `firebase/firestore`)
- Next.js navigation mocks (`next/navigation`)
- Cookie utilities mock (`@/lib/cookies`)
- Barrel export mocks (`@/lib/firebase`, `@/lib/firebase/auth`)

### `jest.setup.js` (Post-initialization)

This file runs **AFTER** modules are loaded but **BEFORE** tests run:
- `@testing-library/jest-dom` matchers
- Polyfills (fetch, TextEncoder, TransformStream)
- Global test utilities

---

## Writing Tests

### 1. Context Tests (AuthContext, CartContext)

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mocks are already set up in jest.setupMocks.js
// Only import additional mocks if needed for specific test behavior
import * as firebaseAuth from '@/lib/firebase/auth';

// Create a test component to access context
function TestComponent() {
  const auth = useAuth();
  return <div data-testid="user">{auth.user?.email}</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user')).toBeInTheDocument();
  });
});
```

### 2. API Route Tests

```tsx
import { GET } from '../route';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('GET /api/user/profile', () => {
  it('should return profile', async () => {
    const { cookies } = require('next/headers');
    cookies.mockResolvedValue({
      get: () => ({ value: 'user-id' }),
    });

    const response = await GET(mockRequest());
    expect(response.status).toBe(200);
  });
});
```

### 3. Utility Function Tests

```typescript
import { formatPrice, validateEmail } from '../utils';

describe('formatPrice', () => {
  it('should format Philippine peso', () => {
    expect(formatPrice(100)).toBe('₱100.00');
  });
});
```

---

## Mock Patterns

### Firebase Authentication

```tsx
import * as firebaseAuth from '@/lib/firebase/auth';

// In your test
(firebaseAuth.signInWithGoogle as jest.Mock).mockResolvedValue({
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
});
```

### Firestore Operations

```tsx
const { addDoc, getDoc } = require('firebase/firestore');

// Mock a document fetch
(getDoc as jest.Mock).mockResolvedValue({
  exists: () => true,
  data: () => ({ id: 'doc-1', name: 'Test' }),
});
```

### Next.js Router

The router is already mocked globally. To override in a specific test:

```tsx
const { useRouter } = require('next/navigation');
(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
  refresh: jest.fn(),
});
```

### Cookies

```tsx
const mockCookies = global.__mockCookies;
mockCookies.getCookieJSON.mockReturnValue({ userId: 'test-123' });
```

---

## Common Issues & Solutions

### 1. "invariant expected app router to be mounted"

**Cause**: `useRouter` from `next/navigation` is not mocked.

**Solution**: The global mock in `jest.setupMocks.js` should handle this. If still failing, add to your test file:

```tsx
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));
```

### 2. "Cannot read properties of undefined (reading 'mockImplementation')"

**Cause**: The function you're trying to mock is not exported as a jest.Mock.

**Solution**: Check if the module is properly mocked in `jest.setupMocks.js`. The mock must use `jest.fn()`:

```javascript
jest.mock('@/lib/firebase/auth', () => ({
  signInWithGoogle: jest.fn(),  // ✅ Correct
  signInWithGoogle: () => {},    // ❌ Wrong
}));
```

### 3. Singleton module issues (e.g., stock-sync)

**Cause**: Module initializes a singleton at import time before mocks are applied.

**Solution**: Skip or refactor tests that depend on singleton behavior:

```tsx
test.skip('singleton test', async () => {
  // TODO: Refactor to use dependency injection
});
```

### 4. Environment variable mismatches

**Cause**: Tests expect localhost but code uses production URL.

**Solution**: Use flexible matchers:

```tsx
expect(fetch).toHaveBeenCalledWith(
  expect.stringContaining('/auth/logout'),
  expect.objectContaining({ method: 'POST' })
);
```

---

## CI/CD Behavior

### Test Workflow (`test.yml`)

- **Runs on**: Pull requests, push to main/develop
- **Blocking**: No (`continue-on-error: true`)
- **Purpose**: Informational - shows test coverage and failures

### What Blocks PR Merge

Only the **Build Check** is required:
- ✅ Build passes → PR can be merged
- ❌ Build fails → Fix required

### Viewing Test Results

1. Go to PR → Checks tab
2. Click "Run Tests" workflow
3. Expand "Run tests" step to see failures

---

## Adding New Mocks

When adding a new module that needs mocking:

1. **Check if already mocked** in `jest.setupMocks.js`
2. **Add to the appropriate section**:
   - Firebase → Near the Firebase mocks
   - Next.js → Near the Next.js mocks
   - Custom modules → At the end

3. **Use jest.fn()** for all functions that need to be configurable:

```javascript
jest.mock('@/lib/new-module', () => ({
  someFunction: jest.fn().mockResolvedValue(defaultValue),
  anotherFunction: jest.fn(),
}));
```

4. **Export to global if tests need access**:

```javascript
global.__mockNewModule = {
  someFunction: jest.fn(),
};
jest.mock('@/lib/new-module', () => global.__mockNewModule);
```

---

## Coverage Reports

Coverage reports are generated at `coverage/`:
- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/coverage-summary.json` - JSON summary

To view the HTML report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

---

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)
