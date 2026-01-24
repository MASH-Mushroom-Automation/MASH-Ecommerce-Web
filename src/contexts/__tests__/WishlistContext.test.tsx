/**
 * Wishlist Context Unit Tests
 * Story: STORY-TEST-010
 * 
 * Coverage:
 * - Add to wishlist
 * - Remove from wishlist
 * - Check if product in wishlist
 * - Clear wishlist
 * - Cookie persistence
 * - Cookie change handling (cross-tab sync)
 * - Wishlist count calculation
 * - Context error handling
 * 
 * Target: 85%+ coverage
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistProvider, useWishlist } from '../WishlistContext';
import { getWishlistCookie, setWishlistCookie, clearWishlistCookie } from '@/lib/cookies';

// Mock cookie functions
jest.mock('@/lib/cookies');

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
    
    // Default mock implementations
    (getWishlistCookie as jest.Mock).mockReturnValue(null);
    (setWishlistCookie as jest.Mock).mockImplementation(() => {});
    (clearWishlistCookie as jest.Mock).mockImplementation(() => {});
  });

  describe('Context Provider', () => {
    it('should throw error when useWishlist is used outside WishlistProvider', () => {
      // Suppress console.error for this test
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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

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
      // Mock invalid wishlist structure
      (getWishlistCookie as jest.Mock).mockReturnValue({ invalid: 'data' });

      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      // Should initialize with empty wishlist instead of crashing
      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');

      consoleError.mockRestore();
    });

    it('should handle missing cookie gracefully', () => {
      // getWishlistCookie returns null by default
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

      const addButton = screen.getByTestId('add-product-1');
      await userEvent.click(addButton);

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

      const addButton1 = screen.getByTestId('add-product-1');
      const addButton2 = screen.getByTestId('add-product-2');

      await userEvent.click(addButton1);
      await userEvent.click(addButton2);

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

      const addButton = screen.getByTestId('add-product-1');

      // Add same product twice
      await userEvent.click(addButton);
      await userEvent.click(addButton);

      await waitFor(() => {
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toEqual(['product-1']); // Only once
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

      const addButton = screen.getByTestId('add-product-1');
      await userEvent.click(addButton);

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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const removeButton = screen.getByTestId('remove-product-1');
      await userEvent.click(removeButton);

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

      const removeButton = screen.getByTestId('remove-product-1');
      await userEvent.click(removeButton);

      // Should not crash
      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
    });

    it('should update isInWishlist after removing', async () => {
      const savedWishlist = {
        version: 2 as const,
        items: ['product-1'],
        updatedAt: new Date().toISOString(),
      };
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');

      const removeButton = screen.getByTestId('remove-product-1');
      await userEvent.click(removeButton);

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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const clearButton = screen.getByTestId('clear-wishlist');
      await userEvent.click(clearButton);

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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const clearButton = screen.getByTestId('clear-wishlist');
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(clearWishlistCookie).toHaveBeenCalled();
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

      const addButton = screen.getByTestId('add-product-1');
      await userEvent.click(addButton);

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

      const addButton1 = screen.getByTestId('add-product-1');
      const addButton2 = screen.getByTestId('add-product-2');

      await userEvent.click(addButton1);
      await userEvent.click(addButton2);

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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-count').textContent).toBe('2');

      const removeButton = screen.getByTestId('remove-product-1');
      await userEvent.click(removeButton);

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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

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

      const addButton = screen.getByTestId('add-product-1');
      await userEvent.click(addButton);

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

      // Mock cookie to persist data
      (getWishlistCookie as jest.Mock).mockImplementation(() => savedWishlist);
      (setWishlistCookie as jest.Mock).mockImplementation((wishlist) => {
        savedWishlist = wishlist;
      });

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');

      const removeButton = screen.getByTestId('remove-product-1');
      await userEvent.click(removeButton);

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

      const addButton = screen.getByTestId('add-product-1');
      await userEvent.click(addButton);

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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const removeButton = screen.getByTestId('remove-product-1');
      await userEvent.click(removeButton);

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

      // Mock cookie to persist data
      (getWishlistCookie as jest.Mock).mockImplementation(() => savedWishlist);
      (setWishlistCookie as jest.Mock).mockImplementation((wishlist) => {
        savedWishlist = wishlist;
      });

      const { unmount } = render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const addButton = screen.getByTestId('add-product-1');
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      });

      unmount();

      // Re-mount component
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      // Should still have the product
      expect(screen.getByTestId('wishlist-count').textContent).toBe('1');
      expect(screen.getByTestId('is-in-wishlist-product-1').textContent).toBe('yes');
    });
  });

  describe('Cookie Change Handling (Cross-Tab Sync)', () => {
    beforeEach(() => {
      // Allow polling to run in these tests
      (global as any).__ENABLE_COOKIE_POLLING_IN_TESTS = true;
    });

    afterEach(() => {
      delete (global as any).__ENABLE_COOKIE_POLLING_IN_TESTS;
      jest.useRealTimers();
    });

    it('should sync wishlist when cookie updated from another tab', async () => {
      jest.useFakeTimers();
      
      // Start with empty wishlist
      (getWishlistCookie as jest.Mock).mockReturnValue(null);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');

      // Simulate cookie change from another tab
      const updatedWishlist = {
        version: 2 as const,
        items: ['product-1', 'product-2'],
        updatedAt: new Date().toISOString(),
      };
      (getWishlistCookie as jest.Mock).mockReturnValue(updatedWishlist);

      // Fast-forward timer to trigger cookie polling
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
      (getWishlistCookie as jest.Mock).mockReturnValue(savedWishlist);

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-count').textContent).toBe('1');

      // Simulate cookie cleared from another tab
      (getWishlistCookie as jest.Mock).mockReturnValue(null);

      // Fast-forward timer
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

      // Simulate corrupted cookie data
      (getWishlistCookie as jest.Mock).mockReturnValue({ invalid: 'data' });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // Should not crash, wishlist remains empty
      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');

      jest.useRealTimers();
    });
  });
});
