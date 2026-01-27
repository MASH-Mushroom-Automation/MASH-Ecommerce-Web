/**
 * Cookie Management System - Unit Tests
 * Tests for src/lib/cookies.ts
 */

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
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie');

describe('Cookie Management System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Cookie Operations', () => {
    it('should set a cookie with default options', () => {
      setCookie('test-cookie', 'test-value');

      expect(Cookies.set).toHaveBeenCalledWith('test-cookie', 'test-value', {
        path: '/',
        secure: false, // Development mode
        sameSite: 'lax',
      });
    });

    it('should set a cookie with custom options', () => {
      setCookie('test-cookie', 'test-value', {
        expires: 30,
        secure: true,
      });

      expect(Cookies.set).toHaveBeenCalledWith('test-cookie', 'test-value', {
        path: '/',
        secure: true,
        sameSite: 'lax',
        expires: 30,
      });
    });

    it('should stringify object values', () => {
      const objValue = { key: 'value' };
      setCookie('test-cookie', objValue);

      expect(Cookies.set).toHaveBeenCalledWith(
        'test-cookie',
        JSON.stringify(objValue),
        expect.any(Object)
      );
    });

    it('should get a cookie', () => {
      (Cookies.get as jest.Mock).mockReturnValue('test-value');

      const result = getCookie('test-cookie');

      expect(result).toBe('test-value');
      expect(Cookies.get).toHaveBeenCalledWith('test-cookie');
    });

    it('should return null if cookie does not exist', () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);

      const result = getCookie('non-existent');

      expect(result).toBeNull();
    });

    it('should get and parse JSON cookie', () => {
      const objValue = { key: 'value' };
      (Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(objValue));

      const result = getCookieJSON<{ key: string }>('test-cookie');

      expect(result).toEqual(objValue);
    });

    it('should return null for invalid JSON', () => {
      (Cookies.get as jest.Mock).mockReturnValue('invalid-json{');

      const result = getCookieJSON('test-cookie');

      expect(result).toBeNull();
    });

    it('should remove a cookie', () => {
      removeCookie('test-cookie');

      expect(Cookies.remove).toHaveBeenCalledWith('test-cookie', { path: '/' });
    });
  });

  describe('Cart Cookie Management (v2 Format)', () => {
    it('should get cart cookie in v2 format', () => {
      const cartV2 = {
        version: 2,
        items: [{ _id: '1', name: 'Product' }],
        updatedAt: '2026-01-22T00:00:00Z',
      };
      (Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(cartV2));

      const result = getCartCookie();

      expect(result).toEqual(cartV2);
    });

    it('should set cart cookie with 30-day expiry', () => {
      const cartV2 = {
        version: 2,
        items: [],
        updatedAt: '2026-01-22T00:00:00Z',
      };

      setCartCookie(cartV2);

      expect(Cookies.set).toHaveBeenCalledWith(
        'mash-cart',
        JSON.stringify(cartV2),
        expect.objectContaining({
          expires: 30,
        })
      );
    });

    it('should clear cart cookie', () => {
      clearCartCookie();

      expect(Cookies.remove).toHaveBeenCalledWith('mash-cart', { path: '/' });
    });
  });

  describe('Wishlist Cookie Management (v2 Format)', () => {
    it('should get wishlist cookie in v2 format', () => {
      const wishlistV2 = {
        version: 2,
        items: [{ _id: '1', name: 'Product' }],
        updatedAt: '2026-01-22T00:00:00Z',
      };
      (Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(wishlistV2));

      const result = getWishlistCookie();

      expect(result).toEqual(wishlistV2);
    });

    it('should set wishlist cookie with 1-year expiry', () => {
      const wishlistV2 = {
        version: 2,
        items: [],
        updatedAt: '2026-01-22T00:00:00Z',
      };

      setWishlistCookie(wishlistV2);

      expect(Cookies.set).toHaveBeenCalledWith(
        'mash-wishlist',
        JSON.stringify(wishlistV2),
        expect.objectContaining({
          expires: 365,
        })
      );
    });

    it('should clear wishlist cookie', () => {
      clearWishlistCookie();

      expect(Cookies.remove).toHaveBeenCalledWith('mash-wishlist', {
        path: '/',
      });
    });
  });

  describe('Theme Preference Cookies', () => {
    it('should get light theme', () => {
      (Cookies.get as jest.Mock).mockReturnValue('light');

      const result = getThemeCookie();

      expect(result).toBe('light');
    });

    it('should get dark theme', () => {
      (Cookies.get as jest.Mock).mockReturnValue('dark');

      const result = getThemeCookie();

      expect(result).toBe('dark');
    });

    it('should return null for invalid theme', () => {
      (Cookies.get as jest.Mock).mockReturnValue('invalid');

      const result = getThemeCookie();

      expect(result).toBeNull();
    });

    it('should set theme cookie with 1-year expiry', () => {
      setThemeCookie('dark');

      expect(Cookies.set).toHaveBeenCalledWith(
        'mash-theme',
        'dark',
        expect.objectContaining({
          expires: 365,
        })
      );
    });
  });

  describe('Language Preference Cookies', () => {
    it('should get language preference', () => {
      (Cookies.get as jest.Mock).mockReturnValue('en');

      const result = getLanguageCookie();

      expect(result).toBe('en');
    });

    it('should set language cookie with 1-year expiry', () => {
      setLanguageCookie('en');

      expect(Cookies.set).toHaveBeenCalledWith(
        'mash-language',
        'en',
        expect.objectContaining({
          expires: 365,
        })
      );
    });
  });

  describe('Security Settings', () => {
    it('should use secure=false in development', () => {
      process.env.NODE_ENV = 'development';

      setCookie('test', 'value');

      expect(Cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          secure: false,
        })
      );
    });

    it('should use sameSite=lax for CSRF protection', () => {
      setCookie('test', 'value');

      expect(Cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          sameSite: 'lax',
        })
      );
    });

    it('should always set path to root', () => {
      setCookie('test', 'value');

      expect(Cookies.set).toHaveBeenCalledWith(
        'test',
        'value',
        expect.objectContaining({
          path: '/',
        })
      );
    });
  });
});
