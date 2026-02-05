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

// Mock Next.js navigation (useRouter) to prevent "invariant expected app router to be mounted" errors
// Make useRouter a jest.Mock so tests can override with mockReturnValue
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// CRITICAL: Mock AuthContext to prevent "useAuth must be used within AuthProvider" errors
// This allows CartContext and other contexts that depend on AuthContext to work in tests
// The mock uses global.__mockAuthContext which tests can modify before rendering
global.__mockAuthContext = {
  user: null,
  isAuthenticated: false,
  loading: false,
  signInWithGoogle: jest.fn(),
  signInWithEmailPassword: jest.fn(),
  signUpWithEmailPassword: jest.fn(),
  signOut: jest.fn(),
  signOutEverywhere: jest.fn(),
  sendEmailSignInLink: jest.fn(),
  completeEmailLinkSignIn: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  confirmPasswordReset: jest.fn(),
  requestEmailVerification: jest.fn(),
  verifyEmailCode: jest.fn(),
};

// Create useAuth as a jest.fn() that tests can override with mockReturnValue
const mockUseAuth = jest.fn(() => global.__mockAuthContext);

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
  AuthProvider: ({ children }) => children,
  AuthContext: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children(global.__mockAuthContext),
  },
}));

// Export mockUseAuth globally so tests can configure it
global.__mockUseAuth = mockUseAuth;

// CRITICAL: Mock Firebase modules BEFORE any app code loads
// This prevents Firebase from trying to initialize with real API keys
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({ name: '[DEFAULT]' })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn(); // unsubscribe
    }),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    setPersistence: jest.fn(),
  })),
  GoogleAuthProvider: jest.fn(() => ({})),
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  browserLocalPersistence: {},
  browserSessionPersistence: {},
  setPersistence: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [], empty: true })),
  onSnapshot: jest.fn(() => jest.fn()),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: { now: jest.fn(() => ({ toDate: () => new Date() })) },
  increment: jest.fn((n) => n),
  arrayUnion: jest.fn((...args) => args),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
}));

// Also mock the internal Firebase modules if they're imported directly
jest.mock('@/lib/firebase/config', () => ({
  app: { name: '[DEFAULT]' },
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn((cb) => { cb(null); return jest.fn(); }),
  },
  db: {},
}));

jest.mock('@/lib/firebase/auth', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn((cb) => { cb(null); return jest.fn(); }),
  },
  // Email/Password Authentication
  createUserWithEmail: jest.fn(),
  signInWithEmail: jest.fn(),
  sendPasswordReset: jest.fn(),
  resendEmailVerification: jest.fn(),
  // Email Link (Passwordless) Authentication
  sendSignInLink: jest.fn(),
  isEmailSignInLink: jest.fn().mockReturnValue(false),
  completeSignInWithEmailLink: jest.fn(),
  getStoredEmailForSignIn: jest.fn().mockReturnValue(null),
  // Google OAuth
  signInWithGoogle: jest.fn(),
  // Sign Out
  signOutFirebase: jest.fn(),
  signOutUser: jest.fn(),
  // User State
  getCurrentUser: jest.fn().mockReturnValue(null),
  getFirebaseIdToken: jest.fn().mockResolvedValue(null),
  onFirebaseAuthStateChanged: jest.fn((callback) => {
    callback(null); // Start with no user
    return jest.fn(); // Return unsubscribe function
  }),
  // Profile
  updateUserProfile: jest.fn(),
}));

// Mock FirebaseUserService for user profile operations
jest.mock('@/lib/firebase/users', () => ({
  FirebaseUserService: {
    COLLECTION: 'users',
    createOrUpdateProfile: jest.fn().mockResolvedValue({
      id: 'mock-user-id',
      uid: 'mock-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      provider: 'google',
      emailVerified: true,
    }),
    getProfile: jest.fn().mockResolvedValue(null),
    updateProfile: jest.fn().mockResolvedValue(true),
    updateDisplayName: jest.fn().mockResolvedValue(true),
    updatePhone: jest.fn().mockResolvedValue(true),
    completeOnboarding: jest.fn().mockResolvedValue(true),
    profileExists: jest.fn().mockResolvedValue(false),
    goOnline: jest.fn().mockResolvedValue(undefined),
    goOffline: jest.fn().mockResolvedValue(undefined),
  },
  db: {},
}));

jest.mock('@/lib/firebase', () => ({
  firebaseApp: { name: '[DEFAULT]' },
  app: { name: '[DEFAULT]' },
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn((cb) => { cb(null); return jest.fn(); }),
  },
  db: {},
  // Auth functions (from ./auth barrel export)
  signInWithGoogle: jest.fn(),
  createUserWithEmail: jest.fn(),
  signInWithEmail: jest.fn(),
  sendPasswordReset: jest.fn(),
  resendEmailVerification: jest.fn(),
  sendSignInLink: jest.fn(),
  isEmailSignInLink: jest.fn().mockReturnValue(false),
  completeSignInWithEmailLink: jest.fn(),
  getStoredEmailForSignIn: jest.fn().mockReturnValue(null),
  signOutFirebase: jest.fn().mockResolvedValue(undefined),
  getCurrentUser: jest.fn().mockReturnValue(null),
  getFirebaseIdToken: jest.fn().mockResolvedValue(null),
  onFirebaseAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
  updateUserProfile: jest.fn(),
  // Cart Service
  FirebaseCartService: {
    getCart: jest.fn().mockResolvedValue(null),
    saveCart: jest.fn().mockResolvedValue(undefined),
    clearCart: jest.fn().mockResolvedValue(undefined),
    subscribeToCart: jest.fn().mockReturnValue(jest.fn()),
  },
  // Orders Service
  FirebaseOrdersService: {
    createOrder: jest.fn().mockResolvedValue({ id: 'mock-order-id' }),
    getOrder: jest.fn().mockResolvedValue(null),
    getOrders: jest.fn().mockResolvedValue([]),
    subscribeToOrders: jest.fn().mockReturnValue(jest.fn()),
  },
  // Address Service
  FirebaseAddressService: {
    getAddresses: jest.fn().mockResolvedValue([]),
    addAddress: jest.fn().mockResolvedValue({ id: 'mock-address-id' }),
    updateAddress: jest.fn().mockResolvedValue(true),
    deleteAddress: jest.fn().mockResolvedValue(true),
    setDefaultAddress: jest.fn().mockResolvedValue(true),
  },
  // User Profile Service
  FirebaseUserService: {
    COLLECTION: 'users',
    createOrUpdateProfile: jest.fn().mockResolvedValue({
      id: 'mock-user-id',
      uid: 'mock-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      provider: 'google',
      emailVerified: true,
    }),
    getProfile: jest.fn().mockResolvedValue(null),
    updateProfile: jest.fn().mockResolvedValue(true),
    updateDisplayName: jest.fn().mockResolvedValue(true),
    updatePhone: jest.fn().mockResolvedValue(true),
    completeOnboarding: jest.fn().mockResolvedValue(true),
    profileExists: jest.fn().mockResolvedValue(false),
    goOnline: jest.fn().mockResolvedValue(undefined),
    goOffline: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock sonner toast globally - tests can override with mockClear/mockImplementation
global.__mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
  promise: jest.fn(),
};

jest.mock('sonner', () => ({
  toast: global.__mockToast,
}));

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

