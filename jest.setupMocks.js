// Early mocks - run before modules are loaded

// CRITICAL: Polyfill global fetch FIRST before any Firebase modules load
// Firebase Auth requires fetch to be available globally
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    headers: new Map(),
  }));
  console.log('[jest.setupMocks] Polyfilled global fetch');
}

// Also polyfill Headers, Request, Response if not present
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._map = new Map();
      if (typeof init === 'object' && init !== null) {
        Object.entries(init).forEach(([k, v]) => this._map.set(String(k).toLowerCase(), String(v)));
      }
    }
    get(name) { return this._map.get(String(name).toLowerCase()) || null; }
    set(name, value) { this._map.set(String(name).toLowerCase(), String(value)); }
    has(name) { return this._map.has(String(name).toLowerCase()); }
    forEach(fn) { for (const [k, v] of this._map) fn(v, k, this); }
    entries() { return this._map.entries(); }
    keys() { return this._map.keys(); }
    values() { return this._map.values(); }
  };
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = new global.Headers(init.headers);
      this.body = init.body;
    }
  };
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.ok = (init.status || 200) >= 200 && (init.status || 200) < 300;
      this.status = init.status || 200;
      this.headers = new global.Headers(init.headers);
    }
    json() { return Promise.resolve(JSON.parse(this.body || '{}')); }
    text() { return Promise.resolve(this.body || ''); }
  };
}

// CRITICAL: Mock @/lib/cookies BEFORE any module imports it
// This ensures WishlistContext, CartContext, etc. all get the mock
// The mock functions are stored globally so tests can configure them
global.__mockCookies = {
  setCookie: jest.fn(),
  getCookie: jest.fn(),
  getCookieJSON: jest.fn(),
  removeCookie: jest.fn(),
  setSecureCookie: jest.fn(),
  clearSecureCookie: jest.fn(),
  getCartCookie: jest.fn(),
  setCartCookie: jest.fn(),
  getWishlistCookie: jest.fn(),
  setWishlistCookie: jest.fn(),
  clearCartCookie: jest.fn(),
  clearWishlistCookie: jest.fn(),
  getThemeCookie: jest.fn(),
  setThemeCookie: jest.fn(),
  getLanguageCookie: jest.fn(),
  setLanguageCookie: jest.fn(),
  clearAllCookies: jest.fn(),
};

jest.mock('@/lib/cookies', () => global.__mockCookies);

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
  console.warn('[jest.setupMocks] failed to mock RequestCookies', e.message);
}



// NOTE: js-cookie mock is handled by __mocks__/js-cookie.js manual mock file
// That mock uses an in-memory store and exposes it via __cookieStore for debugging

// Use the real RAG service implementation but mock its dependencies (sanity / search / context builder / gemini client)
try {


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
  console.warn('[jest.setupMocks] failed to set up RAG dependencies', e.message);
}

// Sanity check that mocks are present
try {
  const wc = require('@/contexts/WishlistContext');
  const cc = require('@/contexts/CartContext');
  global.__MOCK_WISHLIST_PRESENT = !!(wc && wc.useWishlist);
  global.__MOCK_CART_PRESENT = !!(cc && cc.useCart);
  // Log to help debugging in CI/test output
  console.log('[jest.setupMocks] wishlist mock present=', global.__MOCK_WISHLIST_PRESENT, 'cart mock present=', global.__MOCK_CART_PRESENT);
} catch (e) {
  console.error('[jest.setupMocks] failed to validate mocks', e);
}

