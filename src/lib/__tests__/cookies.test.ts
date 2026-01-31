/**
 * Cookie Management System - Unit Tests
 * Tests for src/lib/cookies.ts
 *
 * These tests verify BEHAVIOR (values stored/retrieved) rather than
 * implementation details (whether js-cookie functions were called).
 * The js-cookie mock in __mocks__/js-cookie.js provides an in-memory store.
 */

// CRITICAL: Unmock @/lib/cookies so we test the REAL implementation
// The global mock is set up in jest.setupMocks.js for other tests
jest.unmock('@/lib/cookies');

import {
  setCookie,
  getCookie,
  getCookieJSON,
  removeCookie,
  getCartCookie,
  setCartCookie,
  getWishlistCookie,
  setWishlistCookie,
  clearCartCookie,
  clearWishlistCookie,
  getThemeCookie,
  setThemeCookie,
  getLanguageCookie,
  setLanguageCookie,
} from '@/lib/cookies';

// Access the js-cookie mock store for cleanup
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsCookie = require('js-cookie');

describe('Cookie Management System', () => {
  beforeEach(() => {
    // Clear the mock cookie store between tests
    if (jsCookie.clearStore) {
      jsCookie.clearStore();
    }
    // Also clear document.cookie
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  });

  describe('Basic Cookie Operations', () => {
    it('should set and get a cookie', () => {
      setCookie('test-cookie', 'test-value');
      const result = getCookie('test-cookie');
      expect(result).toBe('test-value');
    });

    it('should set a cookie with custom options', () => {
      setCookie('test-cookie', 'test-value', {
        expires: 30,
        secure: true,
      });

      // Verify the cookie is retrievable
      const result = getCookie('test-cookie');
      expect(result).toBe('test-value');
    });

    it('should stringify object values', () => {
      const objValue = { key: 'value' };
      setCookie('test-cookie', objValue);

      // The value should be JSON stringified
      const result = getCookie('test-cookie');
      expect(result).toBe(JSON.stringify(objValue));
    });

    it('should return null if cookie does not exist', () => {
      const result = getCookie('non-existent');
      expect(result).toBeNull();
    });

    it('should get and parse JSON cookie', () => {
      const objValue = { key: 'value' };
      setCookie('test-cookie', JSON.stringify(objValue));

      const result = getCookieJSON<{ key: string }>('test-cookie');
      expect(result).toEqual(objValue);
    });

    it('should return null for invalid JSON', () => {
      setCookie('test-cookie', 'invalid-json{');

      const result = getCookieJSON('test-cookie');
      expect(result).toBeNull();
    });

    it('should remove a cookie', () => {
      setCookie('test-cookie', 'test-value');
      expect(getCookie('test-cookie')).toBe('test-value');

      removeCookie('test-cookie');
      expect(getCookie('test-cookie')).toBeNull();
    });
  });

  describe('Cart Cookie Management (v2 Format)', () => {
    it('should get cart cookie in v2 format', () => {
      const cartV2 = {
        version: 2,
        items: [{ _id: '1', name: 'Product' }],
        updatedAt: '2026-01-22T00:00:00Z',
      };
      // Directly set via the cookie function
      setCookie('mash-cart', JSON.stringify(cartV2));

      const result = getCartCookie();
      expect(result).toEqual(cartV2);
    });

    it('should set and retrieve cart cookie', () => {
      const cartV2 = {
        version: 2,
        items: [{ _id: '1', name: 'Test Product', quantity: 2, price: 100 }],
        updatedAt: '2026-01-22T00:00:00Z',
      };

      setCartCookie(cartV2);
      const result = getCartCookie();

      expect(result).toEqual(cartV2);
    });

    it('should return null for empty cart cookie', () => {
      const result = getCartCookie();
      expect(result).toBeNull();
    });

    it('should clear cart cookie', () => {
      const cartV2 = {
        version: 2,
        items: [],
        updatedAt: '2026-01-22T00:00:00Z',
      };

      setCartCookie(cartV2);
      expect(getCartCookie()).toEqual(cartV2);

      clearCartCookie();
      expect(getCartCookie()).toBeNull();
    });
  });

  describe('Wishlist Cookie Management (v2 Format)', () => {
    it('should get wishlist cookie in v2 format', () => {
      const wishlistV2 = {
        version: 2,
        items: ['product-1', 'product-2'],
        updatedAt: '2026-01-22T00:00:00Z',
      };
      setCookie('mash-wishlist', JSON.stringify(wishlistV2));

      const result = getWishlistCookie();
      expect(result).toEqual(wishlistV2);
    });

    it('should set and retrieve wishlist cookie', () => {
      const wishlistV2 = {
        version: 2,
        items: ['product-1', 'product-2', 'product-3'],
        updatedAt: '2026-01-22T00:00:00Z',
      };

      setWishlistCookie(wishlistV2);
      const result = getWishlistCookie();

      expect(result).toEqual(wishlistV2);
    });

    it('should return null for empty wishlist cookie', () => {
      const result = getWishlistCookie();
      expect(result).toBeNull();
    });

    it('should clear wishlist cookie', () => {
      const wishlistV2 = {
        version: 2,
        items: ['product-1'],
        updatedAt: '2026-01-22T00:00:00Z',
      };

      setWishlistCookie(wishlistV2);
      expect(getWishlistCookie()).toEqual(wishlistV2);

      clearWishlistCookie();
      expect(getWishlistCookie()).toBeNull();
    });
  });

  describe('Theme Preference Cookies', () => {
    it('should get light theme', () => {
      setCookie('mash-theme', 'light');
      const result = getThemeCookie();
      expect(result).toBe('light');
    });

    it('should get dark theme', () => {
      setCookie('mash-theme', 'dark');
      const result = getThemeCookie();
      expect(result).toBe('dark');
    });

    it('should return null for invalid theme', () => {
      setCookie('mash-theme', 'invalid');
      const result = getThemeCookie();
      expect(result).toBeNull();
    });

    it('should return null when no theme set', () => {
      const result = getThemeCookie();
      expect(result).toBeNull();
    });

    it('should set and retrieve theme cookie', () => {
      setThemeCookie('dark');
      expect(getThemeCookie()).toBe('dark');

      setThemeCookie('light');
      expect(getThemeCookie()).toBe('light');
    });
  });

  describe('Language Preference Cookies', () => {
    it('should get language preference', () => {
      setCookie('mash-language', 'en');
      const result = getLanguageCookie();
      expect(result).toBe('en');
    });

    it('should return null when no language set', () => {
      const result = getLanguageCookie();
      expect(result).toBeNull();
    });

    it('should set and retrieve language cookie', () => {
      setLanguageCookie('en');
      expect(getLanguageCookie()).toBe('en');

      setLanguageCookie('tl');
      expect(getLanguageCookie()).toBe('tl');
    });
  });

  describe('Cookie Overwrite Behavior', () => {
    it('should overwrite existing cookie with same name', () => {
      setCookie('test', 'value1');
      expect(getCookie('test')).toBe('value1');

      setCookie('test', 'value2');
      expect(getCookie('test')).toBe('value2');
    });

    it('should handle multiple different cookies', () => {
      setCookie('cookie1', 'value1');
      setCookie('cookie2', 'value2');
      setCookie('cookie3', 'value3');

      expect(getCookie('cookie1')).toBe('value1');
      expect(getCookie('cookie2')).toBe('value2');
      expect(getCookie('cookie3')).toBe('value3');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      setCookie('test', '');
      // Empty string should be stored
      const result = getCookie('test');
      // js-cookie returns undefined for empty, which our getCookie converts to null
      expect(result === '' || result === null).toBe(true);
    });

    it('should handle special characters in value', () => {
      const specialValue = 'hello=world&foo=bar';
      setCookie('test', specialValue);
      expect(getCookie('test')).toBe(specialValue);
    });

    it('should handle unicode characters', () => {
      const unicodeValue = '你好世界 🌍';
      setCookie('test', unicodeValue);
      expect(getCookie('test')).toBe(unicodeValue);
    });

    it('should handle nested JSON objects', () => {
      const nested = {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
        array: [1, 2, 3],
      };
      setCookie('nested', JSON.stringify(nested));
      expect(getCookieJSON('nested')).toEqual(nested);
    });
  });
});
