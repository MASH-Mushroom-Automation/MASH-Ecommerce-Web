/**
 * Wishlist Page Tests
 * Tests product display, empty state, and action buttons
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WishlistPage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/wishlist'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock ProductCard to simplify rendering
jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: (props: { id: string; name: string; price: number; inStock: boolean }) => (
    <div data-testid={`product-card-${props.id}`}>
      <span>{props.name}</span>
      <span>{props.price}</span>
      {!props.inStock && <span>Out of Stock</span>}
    </div>
  ),
}));

// Mock useSanityProducts
const mockProducts = [
  {
    id: 'prod-1',
    name: 'Shiitake Mushroom Kit',
    slug: 'shiitake-mushroom-kit',
    price: 299,
    compareAtPrice: 399,
    image: '/shiitake.jpg',
    images: [],
    category: 'Mushroom Kits',
    grower: { name: 'Farm A' },
    stock: 10,
    isAvailable: true,
    unit: 'g',
    weight: 500,
    description: 'Fresh shiitake',
    productTags: ['organic'],
  },
  {
    id: 'prod-2',
    name: 'Oyster Mushroom Pack',
    slug: 'oyster-mushroom-pack',
    price: 199,
    compareAtPrice: null,
    image: '/oyster.jpg',
    images: [],
    category: 'Fresh',
    grower: { name: 'Farm B' },
    stock: 5,
    isAvailable: true,
    unit: 'g',
    weight: 250,
    description: 'Fresh oyster mushrooms',
    productTags: [],
  },
  {
    id: 'prod-3',
    name: 'Lions Mane Extract',
    slug: 'lions-mane-extract',
    price: 599,
    compareAtPrice: null,
    image: '/lionsmane.jpg',
    images: [],
    category: 'Extracts',
    grower: null,
    stock: 0,
    isAvailable: false,
    unit: 'ml',
    weight: 100,
    description: 'Concentrated extract',
    productTags: [],
  },
];

jest.mock('@/hooks/useWishlistProducts', () => ({
  useWishlistProducts: jest.fn((ids: string[]) => ({
    products: mockProducts.filter(p => ids.includes(p.id)),
    loading: false,
    error: null,
  })),
}));

// Access global wishlist mock
const mockWishlistContext = {
  wishlistIds: ['prod-1', 'prod-2'],
  clearWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
  addToWishlist: jest.fn(),
  isInWishlist: jest.fn((id: string) => ['prod-1', 'prod-2'].includes(id)),
  toggleWishlist: jest.fn(),
};

jest.mock('@/contexts/WishlistContext', () => ({
  useWishlist: jest.fn(() => mockWishlistContext),
  WishlistProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Access global cart mock
const mockAddToCart = jest.fn().mockReturnValue(true);
jest.mock('@/contexts/CartContext', () => ({
  useCart: jest.fn(() => ({
    items: [],
    addToCart: mockAddToCart,
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    totalItems: 0,
    totalPrice: 0,
  })),
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock EmptyState to simplify testing
jest.mock('@/components/ui/empty-state', () => ({
  EmptyState: (props: { title: string; description: string; actionLabel: string; onAction: () => void }) => (
    <div data-testid="empty-state">
      <h2>{props.title}</h2>
      <p>{props.description}</p>
      <button onClick={props.onAction}>{props.actionLabel}</button>
    </div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockWishlistContext.wishlistIds = ['prod-1', 'prod-2'];
  mockAddToCart.mockReturnValue(true);
});

describe('WishlistPage', () => {
  describe('rendering', () => {
    it('shows page title "My Wishlist"', () => {
      render(<WishlistPage />);
      expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    });

    it('shows item count', () => {
      render(<WishlistPage />);
      // Should show "2 items saved"
      expect(screen.getByText(/2.*items saved/)).toBeInTheDocument();
    });

    it('renders product cards for wishlisted items', async () => {
      render(<WishlistPage />);
      await waitFor(() => {
        expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument();
        expect(screen.getByTestId('product-card-prod-2')).toBeInTheDocument();
      });
    });

    it('does not render non-wishlisted products', async () => {
      render(<WishlistPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('product-card-prod-3')).not.toBeInTheDocument();
      });
    });
  });

  describe('empty state', () => {
    it('shows empty state when no items in wishlist', () => {
      mockWishlistContext.wishlistIds = [];
      render(<WishlistPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    });

    it('empty state has Start Shopping button', () => {
      mockWishlistContext.wishlistIds = [];
      render(<WishlistPage />);
      expect(screen.getByText('Start Shopping')).toBeInTheDocument();
    });

    it('Start Shopping button navigates to shop page', async () => {
      mockWishlistContext.wishlistIds = [];
      const user = userEvent.setup();
      render(<WishlistPage />);
      await user.click(screen.getByText('Start Shopping'));
      expect(mockPush).toHaveBeenCalledWith('/shop');
    });
  });

  describe('action buttons', () => {
    it('shows Add All to Cart button', () => {
      render(<WishlistPage />);
      expect(screen.getByText('Add All to Cart')).toBeInTheDocument();
    });

    it('shows Clear All button', () => {
      render(<WishlistPage />);
      // "Clear All" shown on desktop, "Clear" on mobile
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('shows Continue Shopping link', async () => {
      render(<WishlistPage />);
      await waitFor(() => {
        expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
      });
    });

    it('shows View Cart link', async () => {
      render(<WishlistPage />);
      await waitFor(() => {
        expect(screen.getByText('View Cart')).toBeInTheDocument();
      });
    });
  });

  describe('quick remove', () => {
    it('shows remove buttons for each product', async () => {
      render(<WishlistPage />);
      await waitFor(() => {
        const removeButtons = screen.getAllByLabelText(/Remove .* from wishlist/);
        expect(removeButtons.length).toBe(2);
      });
    });

    it('calls removeFromWishlist when remove clicked', async () => {
      const user = userEvent.setup();
      render(<WishlistPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Remove Shiitake Mushroom Kit from wishlist')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Remove Shiitake Mushroom Kit from wishlist'));
      expect(mockWishlistContext.removeFromWishlist).toHaveBeenCalledWith('prod-1');
    });
  });

  describe('move to cart', () => {
    it('shows move to cart buttons for in-stock products', async () => {
      render(<WishlistPage />);
      await waitFor(() => {
        const moveButtons = screen.getAllByLabelText(/Move .* to cart/);
        // prod-1 and prod-2 are in stock and in wishlist
        expect(moveButtons.length).toBe(2);
      });
    });

    it('calls addToCart and removeFromWishlist when move to cart clicked', async () => {
      const user = userEvent.setup();
      render(<WishlistPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Move Shiitake Mushroom Kit to cart')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Move Shiitake Mushroom Kit to cart'));
      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'prod-1', name: 'Shiitake Mushroom Kit' }),
        1
      );
      expect(mockWishlistContext.removeFromWishlist).toHaveBeenCalledWith('prod-1');
    });
  });

  describe('error state', () => {
    it('shows error message when product fetch fails', () => {
      const useWishlistProductsMock = jest.requireMock('@/hooks/useWishlistProducts').useWishlistProducts;
      useWishlistProductsMock.mockReturnValue({
        products: [],
        loading: false,
        error: 'Failed to fetch products',
      });

      render(<WishlistPage />);
      expect(screen.getByText(/Error: Failed to fetch products/)).toBeInTheDocument();
    });
  });
});
