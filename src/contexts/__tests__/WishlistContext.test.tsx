/**
 * Wishlist Context Unit Tests
 * Story: WISH-001 + STORY-TEST-010
 * 
 * Coverage:
 * - Add to wishlist
 * - Remove from wishlist
 * - Check if product in wishlist
 * - Clear wishlist
 * - Cookie persistence
 * - Cookie change handling (cross-tab sync for guests)
 * - Wishlist count calculation
 * - Context error handling
 * - Firebase sync on login (merge, subscribe, debounced save)
 * - Firebase unsubscribe on logout
 * - Clear Firebase wishlist for authenticated users
 * 
 * Target: 90%+ coverage
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistProvider, useWishlist } from '../WishlistContext';
import { FirebaseWishlistService } from '@/lib/firebase/wishlist';

// Mock FirebaseWishlistService - define mocks INSIDE factory (required for @swc/jest hoisting)
jest.mock('@/lib/firebase/wishlist', () => ({
  FirebaseWishlistService: {
    getWishlist: jest.fn().mockResolvedValue([]),
    addItem: jest.fn().mockResolvedValue('mock-id'),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clearWishlist: jest.fn().mockResolvedValue(undefined),
    subscribeToWishlist: jest.fn().mockReturnValue(jest.fn()),
    mergeLocalStorageWishlist: jest.fn().mockResolvedValue(undefined),
  },
}));

// Access the SAME mock instance that WishlistContext uses
// This is set up in jest.setupMocks.js BEFORE any module imports
const mockCookies = global.__mockCookies as {
  getWishlistCookie: jest.Mock;
  setWishlistCookie: jest.Mock;
  clearWishlistCookie: jest.Mock;
};

// Type alias for cleaner access
const getWishlistCookie = mockCookies.getWishlistCookie;
const setWishlistCookie = mockCookies.setWishlistCookie;
const clearWishlistCookie = mockCookies.clearWishlistCookie;

// Access global auth mock
const mockUseAuth = (global as any).__mockUseAuth as jest.Mock;

// Test component to access wishlist context
function TestComponent() {
  const wishlist = useWishlist();

  return (
    <div>
      <div data-testid="wishlist-ids">{JSON.stringify(wishlist.wishlistIds)}</div>
      <div data-testid="wishlist-count">{wishlist.wishlistCount}</div>
      <div data-testid="is-in-wishlist-product-1">
        {wishlist.isInWishlist('product-1') ? 'yes' : 'no'}
      </div>
      <button
        data-testid="add-product-1"
        onClick={() => wishlist.addToWishlist('product-1')}
      >
        Add Product 1
      </button>
      <button
        data-testid="add-product-2"
        onClick={() => wishlist.addToWishlist('product-2')}
      >
        Add Product 2
      </button>
      <button
        data-testid="remove-product-1"
        onClick={() => wishlist.removeFromWishlist('product-1')}
      >
        Remove Product 1
      </button>
      <button
        data-testid="clear-wishlist"
        onClick={() => wishlist.clearWishlist()}
      >
        Clear Wishlist
      </button>
    </div>
  );
}

describe('WishlistContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Default: guest user (not authenticated)
    mockUseAuth.mockReturnValue({
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
    });
    
    // Default mock implementations
    getWishlistCookie.mockReturnValue(null);
    setWishlistCookie.mockImplementation(() => {});
    clearWishlistCookie.mockImplementation(() => {});
    
    // Reset Firebase mocks
    (FirebaseWishlistService.getWishlist as jest.Mock).mockResolvedValue([]);
    (FirebaseWishlistService.addItem as jest.Mock).mockResolvedValue('mock-id');
    (FirebaseWishlistService.removeItem as jest.Mock).mockResolvedValue(undefined);
    (FirebaseWishlistService.clearWishlist as jest.Mock).mockResolvedValue(undefined);
    (FirebaseWishlistService.subscribeToWishlist as jest.Mock).mockReturnValue(jest.fn());
    (FirebaseWishlistService.mergeLocalStorageWishlist as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Context Provider', () => {
    it('should throw error when useWishlist is used outside WishlistProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useWishlist must be used within a WishlistProvider');
      consoleError.mockRestore();
    });

    it('should provide wishlist context to children', () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
      expect(screen.getByTestId('wishlist-ids')).toHaveTextContent('[]');
      expect(screen.getByTestId('wishlist-count')).toHaveTextContent('0');
    });
  });

  describe('Initialization', () => {
    it('should initialize with empty wishlist', () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
      expect(screen.getByTestId('wishlist-count').textContent).toBe('0');
    });

    it('should load wishlist from cookie on mount', () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2', 'product-3'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const wishlistIds = JSON.parse(
        screen.getByTestId('wishlist-ids').textContent || '[]'
      );
      expect(wishlistIds).toEqual(savedWishlist.items);
      expect(screen.getByTestId('wishlist-count').textContent).toBe('3');
    });

    it('should handle corrupted cookie data gracefully', () => {
      getWishlistCookie.mockReturnValue({ invalid: 'data' });
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
      consoleError.mockRestore();
    });

    it('should handle missing cookie gracefully', () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
    });
  });

  describe('Add to Wishlist', () => {
    it('should add product to wishlist', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('add-product-1'));

      await waitFor(() => {
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toContain('product-1');
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });
    });

    it('should add multiple products to wishlist', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('add-product-1'));
      await userEvent.click(screen.getByTestId('add-product-2'));

      await waitFor(() => {
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toEqual(['product-1', 'product-2']);
        expect(screen.getByTestId('wishlist-count').textContent).toBe('2');
      });
    });

    it('should not add duplicate products', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('add-product-1'));
      await userEvent.click(screen.getByTestId('add-product-1'));

      await waitFor(() => {
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toEqual(['product-1']);
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });
    });

    it('should update isInWishlist after adding', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('no');

      await userEvent.click(screen.getByTestId('add-product-1'));

      await waitFor(() => {
        expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');
      });
    });
  });

  describe('Remove from Wishlist', () => {
    it('should remove product from wishlist', async () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('remove-product-1'));

      await waitFor(() => {
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toEqual(['product-2']);
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });
    });

    it('should handle removing non-existent product', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('remove-product-1'));
      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
    });

    it('should update isInWishlist after removing', async () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');

      await userEvent.click(screen.getByTestId('remove-product-1'));

      await waitFor(() => {
        expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('no');
      });
    });
  });

  describe('Clear Wishlist', () => {
    it('should clear all products from wishlist', async () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2', 'product-3'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('clear-wishlist'));

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
        expect(screen.getByTestId('wishlist-count').textContent).toBe('0');
      });
    });

    it('should remove wishlist from cookie when cleared', async () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('clear-wishlist'));

      await waitFor(() => {
        expect(clearWishlistCookie).toHaveBeenCalled();
      });
    });

    it('should clear Firebase wishlist when authenticated user clears', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
        isAuthenticated: true,
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
      });

      const savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('clear-wishlist'));

      await waitFor(() => {
        expect(FirebaseWishlistService.clearWishlist).toHaveBeenCalledWith('user-123');
      });
    });
  });

  describe('Wishlist Count', () => {
    it('should return correct count for empty wishlist', () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );
      expect(screen.getByTestId('wishlist-count').textContent).toBe('0');
    });

    it('should return correct count for single item', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('add-product-1'));

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });
    });

    it('should return correct count for multiple items', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('add-product-1'));
      await userEvent.click(screen.getByTestId('add-product-2'));

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count').textContent).toBe('2');
      });
    });

    it('should update count when items removed', async () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-count').textContent).toBe('2');

      await userEvent.click(screen.getByTestId('remove-product-1'));

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });
    });
  });

  describe('isInWishlist Check', () => {
    it('should return true for product in wishlist', () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');
    });

    it('should return false for product not in wishlist', () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('no');
    });

    it('should update when product added', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('no');

      await userEvent.click(screen.getByTestId('add-product-1'));

      await waitFor(() => {
        expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');
      });
    });

    it('should update when product removed', async () => {
      let savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };

      getWishlistCookie.mockImplementation(() => savedWishlist);
      setWishlistCookie.mockImplementation((wishlist: any) => {
        savedWishlist = wishlist;
      });

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');

      await userEvent.click(screen.getByTestId('remove-product-1'));

      await waitFor(() => {
        expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('no');
      });
    });
  });

  describe('Cookie Persistence', () => {
    it('should save wishlist to cookie when items added', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('add-product-1'));

      await waitFor(() => {
        expect(setWishlistCookie).toHaveBeenCalledWith(
          expect.objectContaining({
            version: 2,
            items: ['product-1'],
          })
        );
      });
    });

    it('should update cookie when items removed', async () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('remove-product-1'));

      await waitFor(() => {
        expect(setWishlistCookie).toHaveBeenCalledWith(
          expect.objectContaining({
            version: 2,
            items: ['product-2'],
          })
        );
      });
    });

    it('should persist across component remounts', async () => {
      let savedWishlist = {
        version: 2 as const,
        items: [] as string[],
        updatedAt: new Date().toISOString(),
      };

      getWishlistCookie.mockImplementation(() => savedWishlist);
      setWishlistCookie.mockImplementation((wishlist: any) => {
        savedWishlist = wishlist;
      });

      const { unmount } = render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await userEvent.click(screen.getByTestId('add-product-1'));

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });

      unmount();

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');
    });
  });

  describe('Cookie Change Handling (Cross-Tab Sync - Guest Only)', () => {
    beforeEach(() => {
      (global as any).__ENABLE_COOKIE_POLLING_IN_TESTS = true;
    });

    afterEach(() => {
      delete (global as any).__ENABLE_COOKIE_POLLING_IN_TESTS;
      jest.useRealTimers();
    });

    it('should sync wishlist when cookie updated from another tab (guest)', async () => {
      jest.useFakeTimers();
      
      getWishlistCookie.mockReturnValue(null);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');

      const updatedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(updatedWishlist);

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toEqual(['product-1', 'product-2']);
      });

      jest.useRealTimers();
    });

    it('should clear wishlist when cookie cleared from another tab', async () => {
      jest.useFakeTimers();

      const savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-count').textContent).toBe('1');

      getWishlistCookie.mockReturnValue(null);

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
      });

      jest.useRealTimers();
    });

    it('should handle corrupted data in cookie sync', async () => {
      jest.useFakeTimers();

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      getWishlistCookie.mockReturnValue({ invalid: 'data' });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');

      jest.useRealTimers();
    });
  });

  describe('Firebase Sync (Authenticated Users)', () => {
    const authenticatedAuth = {
      user: { id: 'user-123', email: 'test@example.com', displayName: 'Test User' },
      isAuthenticated: true,
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

    it('should merge cookie wishlist with Firebase on login', async () => {
      // User has items in cookie
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      // Firebase returns additional items
      (FirebaseWishlistService.getWishlist as jest.Mock).mockResolvedValue([
        { id: 'product-2', productId: 'product-2', name: 'Product 2', price: 200 },
        { id: 'product-3', productId: 'product-3', name: 'Product 3', price: 300 },
      ]);

      mockUseAuth.mockReturnValue(authenticatedAuth);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await waitFor(() => {
        // Merge should be called with cookie items
        expect(FirebaseWishlistService.mergeLocalStorageWishlist).toHaveBeenCalledWith(
          'user-123',
          expect.arrayContaining([
            expect.objectContaining({ productId: 'product-1' }),
            expect.objectContaining({ productId: 'product-2' }),
          ])
        );
      });

      await waitFor(() => {
        // Merged result should contain union of cookie + Firebase IDs
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toContain('product-1');
        expect(wishlistIds).toContain('product-2');
        expect(wishlistIds).toContain('product-3');
      });
    });

    it('should subscribe to real-time Firebase updates on login', async () => {
      mockUseAuth.mockReturnValue(authenticatedAuth);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(FirebaseWishlistService.subscribeToWishlist).toHaveBeenCalledWith(
          'user-123',
          expect.any(Function)
        );
      });
    });

    it('should unsubscribe from Firebase when user logs out', async () => {
      const mockUnsubscribe = jest.fn();
      (FirebaseWishlistService.subscribeToWishlist as jest.Mock).mockReturnValue(mockUnsubscribe);

      mockUseAuth.mockReturnValue(authenticatedAuth);

      const { rerender } = render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(FirebaseWishlistService.subscribeToWishlist).toHaveBeenCalled();
      });

      // Simulate logout
      mockUseAuth.mockReturnValue({
        ...authenticatedAuth,
        user: null,
        isAuthenticated: false,
      });

      rerender(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      await waitFor(() => {
        expect(mockUnsubscribe).toHaveBeenCalled();
      });
    });

    it('should not start Firebase sync for invalid userId', async () => {
      mockUseAuth.mockReturnValue({
        ...authenticatedAuth,
        user: { id: 'undefined' },
      });

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      // Wait a bit to ensure no calls are made
      await act(async () => {
        await new Promise((r) => setTimeout(r, 100));
      });

      expect(FirebaseWishlistService.mergeLocalStorageWishlist).not.toHaveBeenCalled();
      expect(FirebaseWishlistService.subscribeToWishlist).not.toHaveBeenCalled();
    });

    it('should handle Firebase merge errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (FirebaseWishlistService.mergeLocalStorageWishlist as jest.Mock).mockRejectedValue(new Error('Firebase error'));
      (FirebaseWishlistService.getWishlist as jest.Mock).mockRejectedValue(new Error('Firebase error'));
      
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };
      getWishlistCookie.mockReturnValue(savedWishlist);

      mockUseAuth.mockReturnValue(authenticatedAuth);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      // Should not crash, should keep cookie items
      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });

      consoleError.mockRestore();
    });

    it('should skip cookie polling for authenticated users', async () => {
      (global as any).__ENABLE_COOKIE_POLLING_IN_TESTS = true;
      jest.useFakeTimers();

      mockUseAuth.mockReturnValue(authenticatedAuth);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      // Simulate cookie change
      getWishlistCookie.mockReturnValue({
        version: 2 as const,
        items: ['should-not-appear'],
        updatedAt: new Date().toISOString(),
      });

      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      // Cookie polling should not update state for authenticated users
      // (Firebase handles sync instead)
      const wishlistIds = JSON.parse(
        screen.getByTestId('wishlist-ids').textContent || '[]'
      );
      expect(wishlistIds).not.toContain('should-not-appear');

      delete (global as any).__ENABLE_COOKIE_POLLING_IN_TESTS;
      jest.useRealTimers();
    });
  });
});
