// Early mocks - run before modules are loaded





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



// Use the real RAG service implementation but mock its dependencies (sanity / search / context builder / gemini client)
try {
  // Ensure the rag-service isn't mocked so we can exercise its logic
  try { jest.unmock('@/lib/ai/rag-service'); } catch (e) {}

  // Mock Sanity data source to return deterministic products
  jest.mock('@/lib/ai/sanity-rag', () => ({
    getAllRAGData: jest.fn(async () => ({
      products: [
        {
          _id: 'prod-1',
          name: 'King Oyster Mushroom',
          slug: 'king-oyster-mushroom',
          description: 'Delicious king oyster mushrooms',
          price: 120,
          image: 'https://example.com/king.jpg',
          category: 'Oyster',
          inStock: true,
          grower: { name: 'Farm A', id: 'grower-1' },
          tags: ['oyster'],
          benefits: ['tasty'],
        },
      ],
      categories: [],
      recipes: [],
      growers: [],
    })),
  }));


} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[jest.setupMocks] failed to set up RAG dependencies', e.message);
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

