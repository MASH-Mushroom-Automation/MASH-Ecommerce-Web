/**
 * Wishlist Context Unit Tests
 * Story: STORY-TEST-009
 * 
 * Coverage:
 * - Add to wishlist
 * - Remove from wishlist
 * - Check if product in wishlist
 * - Clear wishlist
 * - localStorage persistence
 * - Storage event handling (cross-tab sync)
 * - Wishlist count calculation
 * - Context error handling
 * 
 * Target: 85%+ coverage
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistProvider, useWishlist } from '../WishlistContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

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
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
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

    it('should load wishlist from localStorage on mount', () => {
      const savedWishlist = ['product-1', 'product-2', 'product-3'];
      localStorage.setItem('mash-wishlist', JSON.stringify(savedWishlist));

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const wishlistIds = JSON.parse(
        screen.getByTestId('wishlist-ids').textContent || '[]'
      );
      expect(wishlistIds).toEqual(savedWishlist);
      expect(screen.getByTestId('wishlist-count').textContent).toBe('3');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('mash-wishlist', 'invalid-json{');

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

    it('should handle missing localStorage gracefully', () => {
      // localStorage.getItem returns null
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
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1', 'product-2']));

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
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1']));

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
      localStorage.setItem(
        'mash-wishlist',
        JSON.stringify(['product-1', 'product-2', 'product-3'])
      );

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

    it('should remove wishlist from localStorage when cleared', async () => {
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1']));

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const clearButton = screen.getByTestId('clear-wishlist');
      await userEvent.click(clearButton);

      await waitFor(() => {
        // After clearing, localStorage should either be null or empty array
        const stored = localStorage.getItem('mash-wishlist');
        expect(stored === null || stored === '[]').toBe(true);
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
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1', 'product-2']));

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
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1']));

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
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1']));

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

  describe('localStorage Persistence', () => {
    it('should save wishlist to localStorage when items added', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const addButton = screen.getByTestId('add-product-1');
      await userEvent.click(addButton);

      await waitFor(() => {
        const saved = localStorage.getItem('mash-wishlist');
        expect(saved).toBe('["product-1"]');
      });
    });

    it('should update localStorage when items removed', async () => {
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1', 'product-2']));

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const removeButton = screen.getByTestId('remove-product-1');
      await userEvent.click(removeButton);

      await waitFor(() => {
        const saved = localStorage.getItem('mash-wishlist');
        expect(saved).toBe('["product-2"]');
      });
    });

    it('should persist across component remounts', async () => {
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

  describe('Storage Event Handling (Cross-Tab Sync)', () => {
    it('should sync wishlist when localStorage updated from another tab', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');

      // Simulate storage event from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'mash-wishlist',
        newValue: '["product-1","product-2"]',
        oldValue: '[]',
      });

      await act(async () => {
        window.dispatchEvent(storageEvent);
      });

      await waitFor(() => {
        const wishlistIds = JSON.parse(
          screen.getByTestId('wishlist-ids').textContent || '[]'
        );
        expect(wishlistIds).toEqual(['product-1', 'product-2']);
      });
    });

    it('should clear wishlist when localStorage cleared from another tab', async () => {
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1']));

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      expect(screen.getByTestId('wishlist-count').textContent).toBe('1');

      // Simulate storage event (logout from another tab)
      const storageEvent = new StorageEvent('storage', {
        key: 'mash-wishlist',
        newValue: null,
        oldValue: '["product-1"]',
      });

      await act(async () => {
        window.dispatchEvent(storageEvent);
      });

      await waitFor(() => {
        expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
      });
    });

    it('should ignore storage events for other keys', async () => {
      localStorage.setItem('mash-wishlist', JSON.stringify(['product-1']));

      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      const originalCount = screen.getByTestId('wishlist-count').textContent;

      // Simulate storage event for different key
      const storageEvent = new StorageEvent('storage', {
        key: 'other-key',
        newValue: 'some-value',
      });

      await act(async () => {
        window.dispatchEvent(storageEvent);
      });

      // Wishlist should not change
      expect(screen.getByTestId('wishlist-count').textContent).toBe(originalCount);
    });

    it('should handle corrupted data in storage event', async () => {
      render(
        <WishlistProvider>
          <TestComponent />
        </WishlistProvider>
      );

      // Simulate storage event with invalid JSON
      const storageEvent = new StorageEvent('storage', {
        key: 'mash-wishlist',
        newValue: 'invalid-json{',
      });

      await act(async () => {
        window.dispatchEvent(storageEvent);
      });

      // Should not crash, wishlist remains empty
      expect(screen.getByTestId('wishlist-ids').textContent).toBe('[]');
    });
  });
});
