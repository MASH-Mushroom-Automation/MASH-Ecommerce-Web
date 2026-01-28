// Mock dependencies
jest.mock('../firebase', () => ({
  signOutFirebase: jest.fn(),
}));

jest.mock('../api/user', () => ({
  UserApi: {
    clearCache: jest.fn(),
  },
}));

jest.mock('../cookies', () => ({
  removeCookie: jest.fn(),
  clearAllCookies: jest.fn(),
}));

import { logout, logoutEverywhere } from '../auth';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockSessionStorage = {
  removeItem: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

describe('logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockSessionStorage.removeItem.mockClear();
  });

  it('should clear tokens via API successfully', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);

    await logout();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/clear-tokens', {
      method: 'POST',
      credentials: 'include',
    });
    const { removeCookie } = require('../cookies');
    expect(removeCookie).toHaveBeenCalledWith('refreshToken');
    expect(removeCookie).toHaveBeenCalledWith('user');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('pendingVerificationEmail');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('resetPasswordEmail');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('user');
    expect(removeCookie).toHaveBeenCalledWith('mash-wishlist');
    expect(removeCookie).toHaveBeenCalledWith('cart');
    expect(removeCookie).toHaveBeenCalledWith('mash-cart');
    expect(removeCookie).toHaveBeenCalledWith('google_auth_redirect');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('google_auth_redirect');
    const { clearAllCookies } = require('../cookies');
    expect(clearAllCookies).toHaveBeenCalled();
  });

  it('should handle API failure gracefully', async () => {
    const mockResponse = { ok: false, status: 500 };
    mockFetch.mockResolvedValue(mockResponse);

    await logout();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/clear-tokens', {
      method: 'POST',
      credentials: 'include',
    });
    // Should still clear storage even if API fails
    const { removeCookie } = require('../cookies');
    expect(removeCookie).toHaveBeenCalledWith('refreshToken');
  });

  it('should handle fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    await logout();

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/clear-tokens', {
      method: 'POST',
      credentials: 'include',
    });
    // Should still clear storage even if fetch fails
    const { removeCookie } = require('../cookies');
    expect(removeCookie).toHaveBeenCalledWith('refreshToken');
  });

  it('should clear cookies and additional sessionStorage', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);

    await logout();

    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('pendingVerificationEmail');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('resetPasswordEmail');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('google_auth_redirect');
  });

  it('should call signOutFirebase', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);

    const { signOutFirebase } = require('../firebase');
    await logout();

    expect(signOutFirebase).toHaveBeenCalledTimes(2); // Once in each block
  });

  it('should handle UserApi.clearCache error gracefully', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);

    const { UserApi } = require('../api/user');
    UserApi.clearCache.mockImplementation(() => {
      throw new Error('Cache clear error');
    });

    await logout();

    // Should not throw, just log warning
    expect(UserApi.clearCache).toHaveBeenCalled();
  });
});

describe('logoutEverywhere', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should call backend logout endpoint successfully', async () => {
    const mockResponse = { ok: true, status: 200, json: jest.fn().mockResolvedValue({}) };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await logoutEverywhere();

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:30000/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ logoutAll: true }),
    });
  });

  it('should handle backend logout failure', async () => {
    const mockResponse = { ok: false, status: 401 };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await logoutEverywhere();

    expect(result).toBe(false);
  });

  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await logoutEverywhere();

    expect(result).toBe(false);
  });
});