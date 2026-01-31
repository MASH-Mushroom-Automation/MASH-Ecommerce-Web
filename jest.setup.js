/**
 * Jest Setup for Testing Environment
 * Enhanced for MASH E-Commerce Platform - Comprehensive Testing
 */

require('@testing-library/jest-dom');

// Add TextEncoder/TextDecoder for Node environment
if (typeof TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

// Mock Next.js Request/Response for API route tests
if (typeof Request === 'undefined') {
  global.Request = class Request {};
  global.Response = class Response {};

  // Minimal Headers polyfill used by Next's RequestCookies in tests
  global.Headers = class Headers {
    constructor(init = {}) {
      this._map = new Map();
      if (init instanceof Headers) {
        for (const [k, v] of init._map) this._map.set(k, v);
      } else if (typeof init === 'object' && init !== null) {
        Object.entries(init).forEach(([k, v]) => this._map.set(String(k).toLowerCase(), String(v)));
      }
    }
    get(name) {
      return this._map.get(String(name).toLowerCase()) || null;
    }
    set(name, value) {
      this._map.set(String(name).toLowerCase(), String(value));
    }
    has(name) {
      return this._map.has(String(name).toLowerCase());
    }
    forEach(fn) {
      for (const [k, v] of this._map) fn(v, k, this);
    }
    entries() {
      return this._map.entries();
    }
    keys() {
      return this._map.keys();
    }
    values() {
      return this._map.values();
    }
  };
}

// Mock Firebase Auth to prevent initialization errors in tests
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(() => Promise.resolve({})),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // No user by default
    return jest.fn(); // Return unsubscribe function
  }),
  setPersistence: jest.fn(() => Promise.resolve()),
  browserLocalPersistence: {},
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: {} })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: {} })),
  sendEmailVerification: jest.fn(() => Promise.resolve()),
  sendSignInLinkToEmail: jest.fn(() => Promise.resolve()),
  isSignInWithEmailLink: jest.fn(() => false),
  signInWithEmailLink: jest.fn(() => Promise.resolve({ user: {} })),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

// Mock Firebase/Firestore for analytics
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000 })),
    fromDate: jest.fn((date) => ({ seconds: date.getTime() / 1000 })),
  },
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
  updateDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn(),
  increment: jest.fn((value) => ({ _methodName: 'increment', _operand: value })),
}));

// Mock js-cookie for cookie management
jest.mock('js-cookie', () => ({
  default: {
    get: jest.fn((name) => {
      // Return mock values for common cookies
      const mockCookies = {
        'auth-token': 'mock-auth-token',
        'refreshToken': 'mock-refresh-token',
      };
      return mockCookies[name] || null;
    }),
    set: jest.fn(),
    remove: jest.fn(),
  },
  get: jest.fn((name) => {
    const mockCookies = {
      'auth-token': 'mock-auth-token',
      'refreshToken': 'mock-refresh-token',
    };
    return mockCookies[name] || null;
  }),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Mock analytics module
jest.mock('@/lib/analytics/chatbot-analytics', () => ({
  startConversation: jest.fn(() => Promise.resolve()),
  updateConversationMetrics: jest.fn(() => Promise.resolve()),
  incrementMessageCount: jest.fn(() => Promise.resolve()),
  markConversionFromChatbot: jest.fn(() => Promise.resolve()),
  logQuery: jest.fn(() => Promise.resolve()),
  getTopQueries: jest.fn(() => Promise.resolve([])),
  logProductClick: jest.fn(() => Promise.resolve()),
  markProductClickConversion: jest.fn(() => Promise.resolve()),
  getTopClickedProducts: jest.fn(() => Promise.resolve([])),
  logError: jest.fn(() => Promise.resolve()),
  getErrorStats: jest.fn(() => Promise.resolve({ totalErrors: 0, errorsByType: {} })),
  getDailyStats: jest.fn(() => Promise.resolve({
    date: new Date().toISOString().split('T')[0],
    conversationsStarted: 0,
    totalMessages: 0,
    uniqueUsers: 0,
    avgMessagesPerConversation: 0,
    productCardsShown: 0,
    productCardsClicked: 0,
    clickThroughRate: 0,
    conversionsCount: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    errorCount: 0,
    topQueries: [],
    topProducts: [],
  })),
  getWeeklyStats: jest.fn(() => Promise.resolve([])),
  exportToCSV: jest.fn(() => ''),
  downloadCSV: jest.fn(),
}));

// Mock next-sanity to avoid ESM parsing errors in Jest
jest.mock('next-sanity', () => ({
  createClient: () => ({
    fetch: jest.fn(() => Promise.resolve([])),
  }),
  createImageUrlBuilder: () => ({ url: () => '' }),
}));

// Mock WishlistContext to fix component test failures
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

// Mock CartContext to fix component test failures
jest.mock('@/contexts/CartContext', () => ({
  useCart: jest.fn(() => ({
    items: [],
    itemCount: 0,
    addItem: jest.fn(() => Promise.resolve()),  // Correct function name
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getItemQuantity: jest.fn(() => 0),
  })),
  CartProvider: ({ children }) => children,
}));

// Simple runtime check that the analytics mock is available
try {
  const analyticsMockCheck = require('@/lib/analytics/chatbot-analytics');
  global.__MOCK_ANALYTICS_PRESENT = {
    startConversation: typeof analyticsMockCheck.startConversation === 'function',
    getDailyStats: typeof analyticsMockCheck.getDailyStats === 'function',
  };
} catch (e) {}

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

// Set test environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:30000/api/v1';
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'gerattrr';
process.env.NEXT_PUBLIC_SANITY_DATASET = 'production';
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'mash-test';

// Prevent Next.js's unhandledRejection handler from causing recursion/stack overflows in tests.
// Install a single, idempotent handler that deduplicates repeated rejection messages and defers
// logging to avoid reentrancy with Next's internal handlers. This prevents flooding the process
// with repeated logs and eventual stack overflows / worker crashes.
try {
  // Remove any existing listeners to prevent Next.js from installing a handler
  // that may throw and cause recursion during tests. Attach a single safe handler.
  try {
    const oldListeners = process.listeners && process.listeners('unhandledRejection');
    if (oldListeners && oldListeners.length) {
      try { process.removeAllListeners && process.removeAllListeners('unhandledRejection'); } catch (e) {}
    }
  } catch (e) {}

  if (!process.__MASH_TEST_UNHANDLED_REJECTION_ATTACHED) {
    process.__MASH_TEST_UNHANDLED_REJECTION_ATTACHED = true;
    process.__MASH_TEST_SEEN_REJECTIONS = new Set();

    process.on('unhandledRejection', (reason) => {
      try {
        // Deduplicate and limit length to avoid flooding logs
        const key =
          reason && (reason.message || reason.stack)
            ? String(reason.message || reason.stack).slice(0, 1000)
            : String(reason);

        if (process.__MASH_TEST_SEEN_REJECTIONS.has(key)) return;
        process.__MASH_TEST_SEEN_REJECTIONS.add(key);

        // Log synchronously (no setImmediate) to avoid interplay with Next's internal handlers
        try {
          if (reason && reason.stack) {
            const full = String(reason.stack).slice(0, 2000);
            /* eslint-disable no-console */
            console.error('[TEST] unhandledRejection (origin stack):', full);
          } else {
            /* eslint-disable no-console */
            console.error('[TEST] unhandledRejection:', String(reason));
          }
        } catch (e) {
          // swallow
        }
      } catch (e) {
        // swallow
      }
    });
  }
} catch (e) {}

// Mock global fetch API (for tests that use fetch directly)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  })
);

// ============================================================================
// NEXT.JS MOCKS
// ============================================================================

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // Remove Next.js-only props that aren't valid on DOM <img>
    const { src, alt, fill, priority, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const React = require('react');
    return React.createElement('img', { src, alt, ...rest });
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    // Render a simple <a> element for tests
    const React = require('react');
    return React.createElement('a', { href, ...props }, children);
  },
}));

// Mock Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Polyfill NextResponse.json for tests to return a Response-like object
try {
  const nextServer = require('next/server');
  if (nextServer && nextServer.NextResponse && !nextServer.NextResponse.json.__isPatched) {
    nextServer.NextResponse.json = function (data, init) {
      const status = (init && init.status) || 200;
      return {
        status,
        json: async () => data,
        // provide direct body for convenience
        body: data,
      };
    };
    // Mark as patched to avoid double patching
    nextServer.NextResponse.json.__isPatched = true;
  }
} catch (e) {
  // ignore if next/server not available in this environment
}



// ============================================================================
// FIREBASE MOCKS (Consolidated for analytics + auth tests)
// ============================================================================

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn(); // Unsubscribe function
  }),
  sendSignInLinkToEmail: jest.fn(),
  isSignInWithEmailLink: jest.fn(() => false),
  signInWithEmailLink: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000 })),
    fromDate: jest.fn((date) => ({ seconds: date.getTime() / 1000 })),
  },
  serverTimestamp: jest.fn(() => ({ _methodName: 'serverTimestamp' })),
  updateDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn(),
  increment: jest.fn((value) => ({ _methodName: 'increment', _operand: value })),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
  setDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn(),
}));

// ============================================================================
// SANITY CMS MOCKS
// ============================================================================

jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(() => Promise.resolve([])),
  },
}));

// ============================================================================
// API CLIENT MOCKS
// ============================================================================

jest.mock('@/lib/api-client', () => ({
  apiRequest: jest.fn(() => Promise.resolve({ data: null })),
}));

// ============================================================================
// THIRD-PARTY SERVICE MOCKS
// ============================================================================

// Mock Sonner Toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Mock Cal.com Embed React (only if package exists)
try {
  jest.mock('@calcom/embed-react', () => ({
    getCalApi: jest.fn(() => Promise.resolve((action, config) => {
      // Mock Cal API functions
      if (action === 'ui') return config;
      if (action === 'preload') return config;
      return null;
    })),
  }));
} catch (e) {
  // Package not installed, skip mock
}

// Mock Google Maps
global.google = {
  maps: {
    Map: jest.fn(),
    Marker: jest.fn(),
    InfoWindow: jest.fn(),
    LatLng: jest.fn(),
    places: {
      Autocomplete: jest.fn(),
      PlacesService: jest.fn(),
    },
  },
};

// ============================================================================
// WEB APIs MOCKS
// ============================================================================

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
global.scrollTo = jest.fn();

// ============================================================================
// CONSOLE ERROR & VERBOSE LOG SUPPRESSION
// ============================================================================

const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;
const originalInfo = console.info;

beforeAll(() => {
  const enableTestLogs = process.env.ENABLE_TEST_LOGS === 'true';

  // Suppress specific console errors
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Warning: useLayoutEffect') ||
       args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Suppress specific warnings
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  // Silence verbose logs/info in test runs unless explicitly enabled
  if (!enableTestLogs) {
    console.log = () => {};
    console.info = () => {};
  }
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
  console.info = originalInfo;
});

// ============================================================================
// GLOBAL TEST CLEANUP
// ============================================================================

afterEach(() => {
  // Restore timers to real timers and clear any pending timers
  try {
    jest.useRealTimers();
    jest.clearAllTimers();
  } catch (e) {
    // jest may not expose timer functions in some environments
  }

  // Clear mocks to avoid cumulative memory usage across tests
  try {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  } catch (e) {}

  // Attempt to detect and clear intervals created by well-known singletons
  try {
    // Websocket client, token refresh, realtime subscriptions, wishlist polling
    // call their stop/cleanup functions if available on globalThis for tests
    if (globalThis.__TEST_CLEANUP_FUNCTIONS) {
      globalThis.__TEST_CLEANUP_FUNCTIONS.forEach((fn) => {
        try { fn(); } catch (e) {}
      });
    }
  } catch (e) {}
});
