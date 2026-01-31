// Early mocks - run before modules are loaded
// Mock WishlistContext so tests importing providers don't import the real module
jest.mock('@/contexts/WishlistContext', () => ({
  __esModule: true,
  useWishlist: jest.fn(() => ({
    items: [],
    isInWishlist: jest.fn(() => false),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    clearWishlist: jest.fn(),
    moveToCart: jest.fn(),
  })),
  WishlistProvider: ({ children }) => children,
}));

// Mock CartContext early too
jest.mock('@/contexts/CartContext', () => ({
  __esModule: true,
  useCart: jest.fn(() => ({
    items: [],
    itemCount: 0,
    addItem: jest.fn(() => Promise.resolve()),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getItemQuantity: jest.fn(() => 0),
  })),
  CartProvider: ({ children }) => children,
}));

// Also mock the resolved filesystem paths (useful if moduleNameMapper isn't applied yet)
try {
  const wishlistPath = require.resolve('./src/contexts/WishlistContext');
  const cartPath = require.resolve('./src/contexts/CartContext');
  jest.mock(wishlistPath, () => ({
    __esModule: true,
    useWishlist: jest.fn(() => ({
      items: [],
      isInWishlist: jest.fn(() => false),
      addToWishlist: jest.fn(),
      removeFromWishlist: jest.fn(),
      clearWishlist: jest.fn(),
      moveToCart: jest.fn(),
    })),
    WishlistProvider: ({ children }) => children,
  }));

  jest.mock(cartPath, () => ({
    __esModule: true,
    useCart: jest.fn(() => ({
      items: [],
      itemCount: 0,
      addItem: jest.fn(() => Promise.resolve()),
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getItemQuantity: jest.fn(() => 0),
    })),
    CartProvider: ({ children }) => children,
  }));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[jest.setupMocks] could not require.resolve provider paths', e.message);
}

// Mock RequestCookies to be resilient to plain header objects (NextRequest in tests)
try {
  jest.mock('next/dist/compiled/@edge-runtime/cookies', () => ({
    RequestCookies: class {
      constructor(headers) { this.headers = headers || {}; }
      get(name) {
        if (!this.headers) return undefined;
        if (typeof this.headers.get === 'function') return this.headers.get(name);
        const key = Object.keys(this.headers).find(k => k.toLowerCase() === name.toLowerCase());
        return key ? this.headers[key] : undefined;
      }
      getAll(name) {
        const v = this.get(name);
        return v ? [v] : [];
      }
    }
  }));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[jest.setupMocks] failed to mock RequestCookies', e.message);
}

// Mock Gemini service used by chatbot tests
try {
  jest.mock('@/services/chatbot/gemini-service', () => ({
    sendMessage: jest.fn(),
    validateMessage: jest.fn(() => ({ valid: true })),
    getIntroMessage: jest.fn(() => ({ content: 'Hello' })),
  }));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[jest.setupMocks] failed to mock gemini-service', e.message);
}

// Mock RAG service used by product search tests
try {
  jest.mock('@/lib/ai/rag-service', () => ({
    ragSearch: jest.fn(() => []),
  }));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[jest.setupMocks] failed to mock rag-service', e.message);
}

// Sanity check that mocks are present
try {
  const wc = require('@/contexts/WishlistContext');
  const cc = require('@/contexts/CartContext');
  global.__MOCK_WISHLIST_PRESENT = !!(wc && wc.useWishlist);
  global.__MOCK_CART_PRESENT = !!(cc && cc.useCart);
  // Log to help debugging in CI/test output
  // eslint-disable-next-line no-console
  console.log('[jest.setupMocks] wishlist mock present=', global.__MOCK_WISHLIST_PRESENT, 'cart mock present=', global.__MOCK_CART_PRESENT);
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('[jest.setupMocks] failed to validate mocks', e);
}

