/**
 * Cookie Management Utilities
 * Secure cookie handling for MASH E-Commerce Platform
 * 
 * Features:
 * - HTTP-only cookie support via API routes
 * - Client-accessible cookies for cart/wishlist
 * - CSRF protection with sameSite flags
 * - Production-ready security settings
 */

import Cookies from 'js-cookie';

// ============================================================================
// COOKIE CONFIGURATION
// ============================================================================

interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Get default cookie options based on environment
 */
function getDefaultOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    path: '/',
    secure: isProduction, // HTTPS only in production
    sameSite: 'lax', // CSRF protection
  };
}

// ============================================================================
// CLIENT-ACCESSIBLE COOKIES (Cart, Wishlist, Preferences)
// ============================================================================

/**
 * Set a client-accessible cookie
 * Used for: Cart, Wishlist, Theme, Language
 */
export function setCookie(
  name: string,
  value: string | object,
  options: CookieOptions = {}
): void {
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
  const cookieOptions = { ...getDefaultOptions(), ...options };
  
  Cookies.set(name, stringValue, cookieOptions);
}

/**
 * Get a client-accessible cookie
 */
export function getCookie(name: string): string | null {
  return Cookies.get(name) || null;
}

/**
 * Get a cookie and parse as JSON
 */
export function getCookieJSON<T>(name: string): T | null {
  const value = getCookie(name);
  if (!value) return null;
  
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to parse cookie ${name}:`, error);
    return null;
  }
}

/**
 * Remove a client-accessible cookie
 */
export function removeCookie(name: string): void {
  Cookies.remove(name, { path: '/' });
}

// ============================================================================
// HTTP-ONLY COOKIES (Auth Tokens) - VIA API ROUTES
// ============================================================================

/**
 * Set an HTTP-only cookie via API route
 * Used for: Auth tokens (access, refresh)
 */
export async function setSecureCookie(
  name: string,
  value: string,
  maxAge: number = 7 * 24 * 60 * 60 // 7 days default
): Promise<void> {
  try {
    const response = await fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, value, maxAge }),
    });

    if (!response.ok) {
      throw new Error('Failed to set secure cookie');
    }
  } catch (error) {
    console.error('Error setting secure cookie:', error);
    throw error;
  }
}

/**
 * Clear an HTTP-only cookie via API route
 */
export async function clearSecureCookie(name: string): Promise<void> {
  try {
    const response = await fetch('/api/auth/clear-cookie', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to clear secure cookie');
    }
  } catch (error) {
    console.error('Error clearing secure cookie:', error);
    throw error;
  }
}

// ============================================================================
// CART & WISHLIST COOKIES (v2 Format)
// ============================================================================

export interface CartV2 {
  version: 2;
  items: any[];
  updatedAt: string;
}

export interface WishlistV2 {
  version: 2;
  items: any[];
  updatedAt: string;
}

/**
 * Get cart from cookie (v2 format)
 */
export function getCartCookie(): CartV2 | null {
  return getCookieJSON<CartV2>('mash-cart');
}

/**
 * Set cart cookie (v2 format)
 */
export function setCartCookie(cart: CartV2): void {
  setCookie('mash-cart', cart, {
    expires: 30, // 30 days
  });
}

/**
 * Get wishlist from cookie (v2 format)
 */
export function getWishlistCookie(): WishlistV2 | null {
  return getCookieJSON<WishlistV2>('mash-wishlist');
}

/**
 * Set wishlist cookie (v2 format)
 */
export function setWishlistCookie(wishlist: WishlistV2): void {
  setCookie('mash-wishlist', wishlist, {
    expires: 365, // 1 year
  });
}

/**
 * Clear cart cookie
 */
export function clearCartCookie(): void {
  removeCookie('mash-cart');
}

/**
 * Clear wishlist cookie
 */
export function clearWishlistCookie(): void {
  removeCookie('mash-wishlist');
}

// ============================================================================
// USER PREFERENCE COOKIES
// ============================================================================

/**
 * Get user theme preference
 */
export function getThemeCookie(): 'light' | 'dark' | null {
  const theme = getCookie('mash-theme');
  return theme === 'light' || theme === 'dark' ? theme : null;
}

/**
 * Set user theme preference
 */
export function setThemeCookie(theme: 'light' | 'dark'): void {
  setCookie('mash-theme', theme, {
    expires: 365, // 1 year
  });
}

/**
 * Get user language preference
 */
export function getLanguageCookie(): string | null {
  return getCookie('mash-language');
}

/**
 * Set user language preference
 */
export function setLanguageCookie(language: string): void {
  setCookie('mash-language', language, {
    expires: 365, // 1 year
  });
}

// ============================================================================
// COOKIE CLEANUP (Logout)
// ============================================================================

/**
 * Clear all user-specific cookies on logout
 */
export async function clearAllCookies(): Promise<void> {
  // Clear client-accessible cookies
  clearCartCookie();
  clearWishlistCookie();
  removeCookie('mash-theme');
  removeCookie('mash-language');
  
  // Clear HTTP-only auth cookies via API
  await clearSecureCookie('auth-token');
  await clearSecureCookie('refresh-token');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Client cookies
  setCookie,
  getCookie,
  getCookieJSON,
  removeCookie,
  
  // Secure cookies (HTTP-only)
  setSecureCookie,
  clearSecureCookie,
  
  // Cart & Wishlist
  getCartCookie,
  setCartCookie,
  getWishlistCookie,
  setWishlistCookie,
  clearCartCookie,
  clearWishlistCookie,
  
  // Preferences
  getThemeCookie,
  setThemeCookie,
  getLanguageCookie,
  setLanguageCookie,
  
  // Cleanup
  clearAllCookies,
};
