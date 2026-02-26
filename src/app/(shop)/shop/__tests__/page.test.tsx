/**
 * Shop (Product Catalog) Page Tests
 * Tests product grid, search, filters, sorting, pagination, and view modes
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCatalogPage from '../page';

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => mockSearchParams),
  usePathname: jest.fn(() => '/shop'),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  };
});

// Test data
const mockProducts = [
  {
    id: 'prod-1',
    name: 'Shiitake Mushroom Kit',
    slug: 'shiitake-mushroom-kit',
    price: 299,
    compareAtPrice: 399,
    comparePrice: 399,
    image: '/shiitake.jpg',
    images: [],
    category: 'Mushroom Kits',
    grower: { name: 'Farm A' },
    stock: 10,
    isAvailable: true,
    unit: '250g',
    weight: 500,
    description: 'Fresh shiitake mushrooms',
    productTags: ['organic', 'fresh'],
  },
  {
    id: 'prod-2',
    name: 'Oyster Mushroom Pack',
    slug: 'oyster-mushroom-pack',
    price: 199,
    compareAtPrice: null,
    comparePrice: null,
    image: '/oyster.jpg',
    images: [],
    category: 'Fresh',
    grower: { name: 'Farm B' },
    stock: 5,
    isAvailable: true,
    unit: '250g',
    weight: 250,
    description: 'Fresh oyster mushrooms',
    productTags: ['fresh'],
  },
  {
    id: 'prod-3',
    name: 'Lions Mane Extract',
    slug: 'lions-mane-extract',
    price: 599,
    compareAtPrice: null,
    comparePrice: null,
    image: '/lionsmane.jpg',
    images: [],
    category: 'Extracts',
    grower: null,
    stock: 0,
    isAvailable: false,
    unit: 'ml',
    weight: 100,
    description: 'Concentrated extract',
    productTags: ['medicinal'],
  },
];

const mockCategories = [
  { id: 'cat-1', name: 'Mushroom Kits', slug: 'mushroom-kits', description: '', productCount: 5, createdAt: '', updatedAt: '' },
  { id: 'cat-2', name: 'Fresh', slug: 'fresh', description: '', productCount: 8, createdAt: '', updatedAt: '' },
  { id: 'cat-3', name: 'Extracts', slug: 'extracts', description: '', productCount: 3, createdAt: '', updatedAt: '' },
];

// Mock useSanityProducts
const mockUseSanityProducts = jest.fn(() => ({
  products: mockProducts,
  loading: false,
  error: null,
  totalCount: mockProducts.length,
}));
jest.mock('@/hooks/useSanityProducts', () => ({
  useSanityProducts: (...args: unknown[]) => mockUseSanityProducts(...args),
}));

// Mock useSanityCategories
jest.mock('@/hooks/useSanityCategories', () => ({
  useSanityCategories: jest.fn(() => ({
    categories: mockCategories,
    loading: false,
    error: null,
  })),
}));

// Mock useDebounce - pass through immediately
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: unknown) => value,
}));

// Mock useProductRatings
jest.mock('@/hooks/useProductRatings', () => ({
  useProductRatings: jest.fn(() => ({
    ratings: {
      'prod-1': { averageRating: 4.5, totalReviews: 12 },
      'prod-2': { averageRating: 3.8, totalReviews: 5 },
    },
    loading: false,
  })),
}));

// Mock cart
const mockAddToCart = jest.fn();
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

// Mock ProductCard
jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: (props: { id: string; name: string; price: number; inStock: boolean; onQuickView?: (id: string) => void }) => (
    <div data-testid={`product-card-${props.id}`}>
      <span>{props.name}</span>
      <span data-testid={`price-${props.id}`}>{props.price}</span>
      {!props.inStock && <span>Out of Stock</span>}
      {props.onQuickView && (
        <button data-testid={`quick-view-${props.id}`} onClick={() => props.onQuickView!(props.id)}>
          Quick View
        </button>
      )}
    </div>
  ),
}));

// Mock QuickViewModal
jest.mock('@/components/product/QuickViewModal', () => ({
  QuickViewModal: (props: { productId: string | null; isOpen: boolean; onClose: () => void }) => (
    props.isOpen ? (
      <div data-testid="quick-view-modal">
        <span data-testid="quick-view-product-id">{props.productId}</span>
        <button data-testid="close-quick-view" onClick={props.onClose}>Close</button>
      </div>
    ) : null
  ),
}));

// Mock EmptyState
jest.mock('@/components/ui/empty-state', () => ({
  EmptyState: (props: { title: string; description: string; actionLabel?: string; onAction?: () => void }) => (
    <div data-testid="empty-state">
      <h2>{props.title}</h2>
      <p>{props.description}</p>
      {props.actionLabel && props.onAction && (
        <button onClick={props.onAction}>{props.actionLabel}</button>
      )}
    </div>
  ),
}));

// Mock ProductGridSkeleton
jest.mock('@/components/ui/loading-spinner', () => ({
  ProductGridSkeleton: ({ count }: { count: number }) => (
    <div data-testid="product-grid-skeleton">Loading {count} items...</div>
  ),
}));

// Mock shadcn select (simplified)
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (v: string) => void }) => (
    <div data-testid="select-wrapper">{children}</div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="select-trigger" className={className}>{children}</button>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

// Mock shadcn Sheet (simplified)
jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-content">{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

// Mock Checkbox
jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: { id?: string; checked?: boolean; onCheckedChange?: () => void }) => (
    <input
      type="checkbox"
      id={props.id}
      checked={props.checked}
      onChange={props.onCheckedChange}
      data-testid={`checkbox-${props.id}`}
    />
  ),
}));

// Mock Label
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label htmlFor={htmlFor} className={className}>{children}</label>
  ),
}));

// Mock Slider
jest.mock('@/components/ui/slider', () => ({
  Slider: (props: { min: number; max: number; value: number[]; onValueChange: (v: number[]) => void }) => (
    <div data-testid="price-slider">
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value[0]}
        data-testid="price-slider-min"
        onChange={(e) => props.onValueChange([Number(e.target.value), props.value[1]])}
      />
    </div>
  ),
}));

// Stub window.history.replaceState
const originalReplaceState = window.history.replaceState;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSanityProducts.mockReturnValue({
    products: mockProducts,
    loading: false,
    error: null,
    totalCount: mockProducts.length,
  });
  window.history.replaceState = jest.fn();
});

afterAll(() => {
  window.history.replaceState = originalReplaceState;
});

describe('ProductCatalogPage', () => {
  describe('product grid rendering', () => {
    it('renders all products in grid', () => {
      render(<ProductCatalogPage />);
      expect(screen.getByTestId('product-card-prod-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-prod-2')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-prod-3')).toBeInTheDocument();
    });

    it('shows results count', () => {
      render(<ProductCatalogPage />);
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      expect(screen.getByText(/of.*products/)).toBeInTheDocument();
    });

    it('passes correct props to ProductCard', () => {
      render(<ProductCatalogPage />);
      expect(screen.getByText('Shiitake Mushroom Kit')).toBeInTheDocument();
      expect(screen.getByText('Oyster Mushroom Pack')).toBeInTheDocument();
      expect(screen.getByText('Lions Mane Extract')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows skeleton when loading', () => {
      mockUseSanityProducts.mockReturnValue({
        products: [],
        loading: true,
        error: null,
        totalCount: 0,
      });
      render(<ProductCatalogPage />);
      expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when products fail to load', () => {
      mockUseSanityProducts.mockReturnValue({
        products: [],
        loading: false,
        error: { message: 'Network error' },
        totalCount: 0,
      });
      render(<ProductCatalogPage />);
      expect(screen.getByText(/Error loading products: Network error/)).toBeInTheDocument();
    });

    it('shows Try Again button on error', () => {
      mockUseSanityProducts.mockReturnValue({
        products: [],
        loading: false,
        error: { message: 'Something went wrong' },
        totalCount: 0,
      });
      render(<ProductCatalogPage />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no products match filters', () => {
      mockUseSanityProducts.mockReturnValue({
        products: [],
        loading: false,
        error: null,
        totalCount: 0,
      });
      render(<ProductCatalogPage />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No Products Found')).toBeInTheDocument();
    });

    it('empty state has Clear Filters button', () => {
      mockUseSanityProducts.mockReturnValue({
        products: [],
        loading: false,
        error: null,
        totalCount: 0,
      });
      render(<ProductCatalogPage />);
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('renders search input', () => {
      render(<ProductCatalogPage />);
      expect(screen.getByPlaceholderText(/Search products/)).toBeInTheDocument();
    });

    it('passes search query as filter to useSanityProducts', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      const searchInput = screen.getByPlaceholderText(/Search products/);
      await user.type(searchInput, 'oyster');

      // useDebounce is mocked to pass through immediately
      await waitFor(() => {
        const lastCall = mockUseSanityProducts.mock.calls[mockUseSanityProducts.mock.calls.length - 1];
        expect(lastCall[0]).toMatchObject({ search: 'oyster' });
      });
    });

    it('shows clear button when search has text', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      const searchInput = screen.getByPlaceholderText(/Search products/);
      await user.type(searchInput, 'test');

      // The X button should appear to clear search
      await waitFor(() => {
        // The clear button has an X icon - find it
        const clearButtons = screen.getAllByRole('button');
        const searchClear = clearButtons.find(btn => {
          const svg = btn.querySelector('svg');
          return svg && btn.closest('.relative');
        });
        expect(searchClear).toBeTruthy();
      });
    });
  });

  describe('category filters', () => {
    it('renders category checkboxes in sidebar', () => {
      render(<ProductCatalogPage />);
      // Categories: All Products, Mushroom Kits, Fresh, Extracts
      expect(screen.getAllByText('All Products').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Mushroom Kits').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Fresh').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Extracts').length).toBeGreaterThan(0);
    });

    it('All Products checkbox is checked by default', () => {
      render(<ProductCatalogPage />);
      const allCheckbox = screen.getByTestId('checkbox-category-all');
      expect(allCheckbox).toBeChecked();
    });
  });

  describe('quick tags', () => {
    it('renders popular tag buttons', () => {
      render(<ProductCatalogPage />);
      // Tags exist in both desktop sidebar and mobile sheet
      expect(screen.getAllByText('Fresh').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dried').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Organic').length).toBeGreaterThan(0);
    });
  });

  describe('sort controls', () => {
    it('renders sort dropdown', () => {
      render(<ProductCatalogPage />);
      expect(screen.getByText('Sort by')).toBeInTheDocument();
    });

    it('renders items per page dropdown', () => {
      render(<ProductCatalogPage />);
      expect(screen.getByText('Items per page')).toBeInTheDocument();
    });
  });

  describe('view mode toggle', () => {
    it('renders grid and list view buttons', () => {
      render(<ProductCatalogPage />);
      expect(screen.getByLabelText('Switch to grid view')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to list view')).toBeInTheDocument();
    });

    it('grid view is active by default', () => {
      render(<ProductCatalogPage />);
      const gridButton = screen.getByLabelText('Switch to grid view');
      expect(gridButton.getAttribute('aria-pressed')).toBe('true');
    });

    it('switches to list view when list button clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      const listButton = screen.getByLabelText('Switch to list view');
      await user.click(listButton);

      expect(listButton.getAttribute('aria-pressed')).toBe('true');
      const gridButton = screen.getByLabelText('Switch to grid view');
      expect(gridButton.getAttribute('aria-pressed')).toBe('false');
    });

    it('shows product details in list view', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      await user.click(screen.getByLabelText('Switch to list view'));

      // In list view, products render as detailed rows with descriptions
      await waitFor(() => {
        expect(screen.getByText('Fresh shiitake mushrooms')).toBeInTheDocument();
        expect(screen.getByText('Fresh oyster mushrooms')).toBeInTheDocument();
      });
    });

    it('shows Add to Cart button for in-stock products in list view', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      await user.click(screen.getByLabelText('Switch to list view'));

      await waitFor(() => {
        const addToCartButtons = screen.getAllByText('Add to Cart');
        // prod-1 and prod-2 are in stock, prod-3 is out of stock
        expect(addToCartButtons.length).toBe(2);
      });
    });

    it('shows Out of Stock for zero-stock products in list view', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      await user.click(screen.getByLabelText('Switch to list view'));

      await waitFor(() => {
        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
      });
    });
  });

  describe('add to cart from list view', () => {
    it('calls addToCart when clicking Add to Cart in list view', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      await user.click(screen.getByLabelText('Switch to list view'));

      await waitFor(() => {
        expect(screen.getAllByText('Add to Cart').length).toBeGreaterThan(0);
      });

      // Click first Add to Cart button
      const addButtons = screen.getAllByText('Add to Cart');
      await user.click(addButtons[0]);

      expect(mockAddToCart).toHaveBeenCalledTimes(1);
      expect(mockAddToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'prod-1',
          name: 'Shiitake Mushroom Kit',
          price: 299,
        }),
        1
      );
    });
  });

  describe('quick view', () => {
    it('opens QuickViewModal when quick view clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      const quickViewBtn = screen.getByTestId('quick-view-prod-1');
      await user.click(quickViewBtn);

      await waitFor(() => {
        expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
        expect(screen.getByTestId('quick-view-product-id')).toHaveTextContent('prod-1');
      });
    });

    it('closes QuickViewModal when close is clicked', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      // Open modal
      await user.click(screen.getByTestId('quick-view-prod-1'));
      await waitFor(() => {
        expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
      });

      // Close modal
      await user.click(screen.getByTestId('close-quick-view'));
      await waitFor(() => {
        expect(screen.queryByTestId('quick-view-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('pagination', () => {
    it('shows Load More button when more products available on server', () => {
      // Server returns first page (3 products) but totalCount indicates more exist
      mockUseSanityProducts.mockReturnValue({
        products: mockProducts,
        loading: false,
        error: null,
        totalCount: 50, // Server says 50 total, but only 3 returned
      });

      render(<ProductCatalogPage />);
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    it('does not show Load More when all products displayed', () => {
      // totalCount matches products length - no more to load
      render(<ProductCatalogPage />);
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });

    it('shows correct count display with server-side pagination', () => {
      mockUseSanityProducts.mockReturnValue({
        products: mockProducts,
        loading: false,
        error: null,
        totalCount: 50,
      });

      render(<ProductCatalogPage />);

      // Shows "3 of 50 products"
      expect(screen.getByText(/Showing/)).toHaveTextContent(/3/);
      expect(screen.getByText(/Showing/)).toHaveTextContent(/50/);
    });
  });

  describe('mobile filters', () => {
    it('renders Filters button for mobile', () => {
      render(<ProductCatalogPage />);
      // 'Filters' appears in both the mobile button and the sheet header
      expect(screen.getAllByText('Filters').length).toBeGreaterThanOrEqual(2);
    });

    it('shows filter categories in mobile sheet', () => {
      render(<ProductCatalogPage />);
      // Mobile sheet renders categories too
      const sheet = screen.getByTestId('sheet-content');
      expect(within(sheet).getByText('Categories')).toBeInTheDocument();
      expect(within(sheet).getByText('Price Range')).toBeInTheDocument();
      expect(within(sheet).getByText('Quick Tags')).toBeInTheDocument();
    });
  });

  describe('URL sync', () => {
    it('updates URL when search query changes', async () => {
      const user = userEvent.setup();
      render(<ProductCatalogPage />);

      const searchInput = screen.getByPlaceholderText(/Search products/);
      await user.type(searchInput, 'shiitake');

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
        const lastCall = (window.history.replaceState as jest.Mock).mock.calls.pop();
        expect(lastCall[2]).toContain('search=shiitake');
      });
    });
  });
});
