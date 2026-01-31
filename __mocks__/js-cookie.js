/**
 * Manual Jest mock for 'js-cookie' package
 * Uses a GLOBAL in-memory store that persists across module instances.
 * This ensures that when multiple modules import 'js-cookie' (due to Jest
 * module isolation), they all share the same cookie store.
 * 
 * NOTE: This file takes precedence over jest.mock() calls in setup files.
 * Functions are wrapped in jest.fn() for spy/mock assertion support.
 */

// Use global to ensure ALL imports of js-cookie share the same store
// This is critical because Jest's module isolation creates separate module instances
if (!global.__jsCookieStore) {
  global.__jsCookieStore = new Map();
}
const cookieStore = global.__jsCookieStore;

// Implementation functions
const getImpl = (name) => {
  // First check our in-memory store
  if (cookieStore.has(name)) {
    return cookieStore.get(name);
  }
  
  // Then check document.cookie (for tests that set cookies directly)
  if (typeof document !== 'undefined' && document.cookie) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, ...rest] = cookie.split('=');
      if (cookieName === name) {
        const value = rest.join('=');
        try {
          return decodeURIComponent(value);
        } catch (e) {
          return value;
        }
      }
    }
  }
  
  // Fallback to common mock values
  const mockCookies = {
    'auth-token': 'mock-auth-token',
    'refreshToken': 'mock-refresh-token',
  };
  return mockCookies[name] || undefined;
};

const setImpl = (name, value, options) => {
  cookieStore.set(name, value);
  // Also set in document.cookie for tests that check it directly
  if (typeof document !== 'undefined') {
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${name}=${encodedValue}; Path=/`;
  }
};

const removeImpl = (name, options) => {
  cookieStore.delete(name);
  // Also remove from document.cookie
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
};

// Create functions that wrap implementations
// NOTE: We can't use jest.fn().mockImplementation() because Jest's resetMocks: true
// in jest.config.js clears implementations before each test. Instead, we create
// functions that always call through to their implementations.
function createPersistentMock(impl) {
  // Create a wrapper that Jest can track but that always calls the implementation
  const mock = jest.fn((...args) => impl(...args));
  // Store original impl so it survives reset
  mock._persistentImpl = impl;
  return mock;
}

const get = createPersistentMock((name) => getImpl(name));
const set = createPersistentMock((name, value, options) => setImpl(name, value, options));
const remove = createPersistentMock((name, options) => removeImpl(name, options));

// Re-attach implementations after Jest resets (called from jest.setup.js beforeEach)
const restoreImplementations = () => {
  if (get._persistentImpl) get.mockImplementation(get._persistentImpl);
  if (set._persistentImpl) set.mockImplementation(set._persistentImpl);
  if (remove._persistentImpl) remove.mockImplementation(remove._persistentImpl);
};

// Utility to clear the store (can be called from tests or setup)
const clearStore = () => {
  cookieStore.clear();
};

module.exports = {
  get,
  set,
  remove,
  clearStore, // Expose for tests that need to clear between tests
  restoreImplementations, // Call in beforeEach to survive Jest's resetMocks
  // Expose the store directly for debugging
  __cookieStore: cookieStore,
};

// Set default to point to same object - for ESM import compatibility
// cookies.ts uses: const cookieLib = (Cookies as any).default || Cookies
// This ensures both paths get the same jest.fn() instances
module.exports.default = module.exports;

