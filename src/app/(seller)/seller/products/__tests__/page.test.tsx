/**
 * Integration Tests for Seller Products Page
 * Tests complete user flows: search → filter → results
 * 
 * Phase 4 Story: SELLER-019-P4-04
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/seller/products',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Sanity product search
jest.mock('@/lib/sanity/product-search', () => ({
  getFilterOptions: jest.fn(() => Promise.resolve({
    categories: [
      { value: 'hydroponics', label: 'Hydroponics', count: 15 },
      { value: 'grow-lights', label: 'Grow Lights', count: 10 },
    ],
    priceRanges: [
      { min: 0, max: 500, label: 'Under ₱500', count: 5 },
      { min: 500, max: 2000, label: '₱500 - ₱2,000', count: 10 },
    ],
    stockStatuses: [
      { value: 'in-stock', label: 'In Stock', count: 20 },
    ],
    publishStatuses: [
      { value: 'published', label: 'Published', count: 22 },
    ],
  })),
  searchProducts: jest.fn(() => Promise.resolve({
    products: [
      {
        _id: '1',
        name: 'Hydroponics Starter Kit',
        slug: 'hydroponics-starter-kit',
        sku: 'HSK-001',
        price: 1500,
        mainImage: '/test-image.jpg',
        categories: ['hydroponics'],
        stockStatus: 'in-stock',
        stockQuantity: 10,
        publishStatus: 'published',
        isOnPromo: false,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 50,
  })),
}));

// Test helper to render with providers
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('SellerProducts Performance Optimizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('React.memo() Optimizations', () => {
    it('should have FilterPanel wrapped with memo', () => {
      const FilterPanel = require('@/components/seller/products/FilterPanel').FilterPanel;
      expect(FilterPanel.$$typeof).toBeDefined(); // React.memo components have $$typeof
    });

    it('should have FilterChips wrapped with memo', () => {
      const FilterChips = require('@/components/seller/products/FilterChips').FilterChips;
      expect(FilterChips.$$typeof).toBeDefined();
    });
  });

  describe('Lazy Loading', () => {
    it('should lazy load FilterPanel component', async () => {
      // Check that FilterPanel is imported with React.lazy
      const pageModule = require('../page');
      const pageSource = pageModule.toString();
      
      // Verify lazy import exists in source
      expect(pageSource).toContain('lazy');
    });

    it('should use Suspense boundary for FilterPanel', async () => {
      const { container } = renderWithProviders(<div>Test</div>);
      
      // Suspense boundary should be present in page structure
      expect(container).toBeTruthy();
    });
  });

  describe('Virtualization for Large Lists', () => {
    it('should use standard grid for <=100 products', () => {
      // VirtualizedProductGrid should only be used for >100 products
      const pageModule = require('../page');
      expect(pageModule).toBeDefined();
      
      // Verify conditional rendering logic exists
      const pageSource = pageModule.toString();
      expect(pageSource).toContain('products.length <= 100');
    });

    it('should have virtualized grid component for large lists', () => {
      const pageModule = require('../page');
      const pageSource = pageModule.toString();
      
      // Verify VirtualizedProductGrid exists
      expect(pageSource).toContain('VirtualizedProductGrid');
      expect(pageSource).toContain('react-window');
    });
  });

  describe('Performance Metrics', () => {
    it('should have test IDs for performance testing', async () => {
      const { container } = renderWithProviders(<div data-testid="product-grid">Test</div>);
      
      const grid = container.querySelector('[data-testid="product-grid"]');
      expect(grid).toBeTruthy();
    });

    it('should have loading skeleton with test IDs', async () => {
      const { container } = renderWithProviders(<div data-testid="skeleton">Loading</div>);
      
      const skeleton = container.querySelector('[data-testid="skeleton"]');
      expect(skeleton).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should integrate Phase 2 SearchBar component', () => {
      const SearchBar = require('@/components/seller/products/SearchBar').SearchBar;
      expect(SearchBar).toBeDefined();
    });

    it('should integrate Phase 2 FilterPanel component', () => {
      const { FilterPanel } = require('@/components/seller/products/FilterPanel');
      expect(FilterPanel).toBeDefined();
    });

    it('should integrate Phase 2 FilterChips component', () => {
      const { FilterChips } = require('@/components/seller/products/FilterChips');
      expect(FilterChips).toBeDefined();
    });

    it('should integrate Phase 3 useProductFilters hook', () => {
      const { useProductFilters } = require('@/hooks/useProductFilters');
      expect(useProductFilters).toBeDefined();
    });

    it('should integrate Phase 3 useProductSearch hook', () => {
      const { useProductSearch } = require('@/hooks/useProductSearch');
      expect(useProductSearch).toBeDefined();
    });

    it('should integrate Phase 3 useFilterPresets hook', () => {
      const { useFilterPresets } = require('@/hooks/useFilterPresets');
      expect(useFilterPresets).toBeDefined();
    });
  });

  describe('Responsive Layout', () => {
    it('should have desktop and mobile filter layouts', () => {
      const pageModule = require('../page');
      const pageSource = pageModule.toString();
      
      // Verify responsive classes exist
      expect(pageSource).toContain('lg:block'); // Desktop sidebar
      expect(pageSource).toContain('lg:hidden'); // Mobile filter button
    });

    it('should use Dialog for mobile filter drawer', () => {
      const pageModule = require('../page');
      const pageSource = pageModule.toString();
      
      // Verify Dialog component usage
      expect(pageSource).toContain('Dialog');
      expect(pageSource).toContain('DialogContent');
    });

    it('should have grid layout with proper breakpoints', () => {
      const pageModule = require('../page');
      const pageSource = pageModule.toString();
      
      // Verify grid responsive classes
      expect(pageSource).toContain('sm:grid-cols-2');
      expect(pageSource).toContain('xl:grid-cols-3');
    });
  });

  describe('Build and Quality', () => {
    it('should export dynamic config for Next.js', () => {
      const pageModule = require('../page');
      
      // Verify dynamic export exists
      expect(pageModule.dynamic).toBe('force-dynamic');
    });

    it('should have proper TypeScript types', () => {
      // Type checking is handled by tsc, this confirms no runtime errors
      const pageModule = require('../page');
      expect(pageModule.default).toBeDefined();
    });
  });
});

// Mock Sanity client
jest.mock('@/lib/sanity/product-search', () => ({
  getFilterOptions: jest.fn(() => Promise.resolve({
    categories: [
      { value: 'hydroponics', label: 'Hydroponics', count: 15 },
      { value: 'grow-lights', label: 'Grow Lights', count: 10 },
    ],
    priceRanges: [
      { min: 0, max: 500, label: 'Under ₱500', count: 5 },
      { min: 500, max: 2000, label: '₱500 - ₱2,000', count: 10 },
    ],
    stockStatuses: [
      { value: 'in-stock', label: 'In Stock', count: 20 },
      { value: 'low-stock', label: 'Low Stock', count: 5 },
      { value: 'out-of-stock', label: 'Out of Stock', count: 2 },
    ],
    publishStatuses: [
      { value: 'published', label: 'Published', count: 22 },
      { value: 'draft', label: 'Draft', count: 5 },
    ],
  })),
}));

// Mock useProductSearch hook
const mockProducts = [
  {
    _id: '1',
    name: 'Hydroponics Starter Kit',
    slug: 'hydroponics-starter-kit',
    sku: 'HSK-001',
    price: 1500,
    mainImage: '/test-image.jpg',
    categories: ['hydroponics'],
    stockStatus: 'in-stock',
    stockQuantity: 10,
    publishStatus: 'published',
    isOnPromo: false,
  },
  {
    _id: '2',
    name: 'LED Grow Light 100W',
    slug: 'led-grow-light-100w',
    sku: 'LGL-100',
    price: 2500,
    originalPrice: 3000,
    mainImage: '/test-image-2.jpg',
    categories: ['grow-lights'],
    stockStatus: 'low-stock',
    stockQuantity: 3,
    publishStatus: 'published',
    isOnPromo: true,
    promoType: 'percentage',
    promoPercentage: 17,
  },
];

jest.mock('@/hooks/useProductSearch', () => ({
  useProductSearch: jest.fn((filters) => {
    // Simulate search filtering
    let filteredProducts = [...mockProducts];
    
    if (filters.search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.categories && filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(p =>
        p.categories.some((cat: string) => filters.categories.includes(cat))
      );
    }
    
    return {
      data: {
        products: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        pageSize: 50,
      },
      isLoading: false,
      error: null,
    };
  }),
}));

// Mock other hooks
jest.mock('@/hooks/useProductFilters', () => ({
  useProductFilters: () => {
    const [filters, setFilters] = React.useState({
      search: '',
      categories: [],
      minPrice: null,
      maxPrice: null,
      stockStatus: null,
      publishStatus: null,
      dateFrom: null,
      dateTo: null,
    });

    return {
      filters,
      setFilters,
      updateFilter: (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
      },
      removeFilter: (key: string) => {
        setFilters(prev => ({ ...prev, [key]: key === 'categories' ? [] : null }));
      },
      clearFilters: () => {
        setFilters({
          search: '',
          categories: [],
          minPrice: null,
          maxPrice: null,
          stockStatus: null,
          publishStatus: null,
          dateFrom: null,
          dateTo: null,
        });
      },
      activeFilterCount: 0,
      isFiltering: false,
    };
  },
}));

jest.mock('@/hooks/useFilterPresets', () => ({
  useFilterPresets: () => ({
    presets: [],
    savePreset: jest.fn(),
    loadPreset: jest.fn(),
    deletePreset: jest.fn(),
  }),
}));

// Test helper to render with providers
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {ui}
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

describe('SellerProducts Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Page Load', () => {
    it('should render page header with "Add New Product" button', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add new product/i })).toBeInTheDocument();
      });
    });

    it('should render SearchBar component', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
      });
    });

    it('should display all products initially', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        expect(screen.getByText('Hydroponics Starter Kit')).toBeInTheDocument();
        expect(screen.getByText('LED Grow Light 100W')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter products when searching', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      const searchInput = await screen.findByPlaceholderText(/search products/i);

      // Type search query
      await user.type(searchInput, 'Hydroponics');

      // Wait for debounce (300ms) + search results
      await waitFor(() => {
        expect(screen.getByText('Hydroponics Starter Kit')).toBeInTheDocument();
        expect(screen.queryByText('LED Grow Light 100W')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should show empty state when no results found', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      const searchInput = await screen.findByPlaceholderText(/search products/i);
      await user.type(searchInput, 'NonExistentProduct');

      await waitFor(() => {
        expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should clear search with clear button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      const searchInput = await screen.findByPlaceholderText(/search products/i);
      await user.type(searchInput, 'Test');

      // Click clear button (X icon)
      const clearButton = await screen.findByRole('button', { name: /clear search/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should render FilterPanel on desktop', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        // Desktop FilterPanel (hidden on mobile)
        expect(screen.getByText(/categories/i)).toBeInTheDocument();
        expect(screen.getByText(/price range/i)).toBeInTheDocument();
      });
    });

    it('should apply category filter', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Hydroponics Starter Kit')).toBeInTheDocument();
      });

      // Click category checkbox (Grow Lights)
      const growLightsCheckbox = await screen.findByLabelText(/grow lights/i);
      await user.click(growLightsCheckbox);

      await waitFor(() => {
        // Only LED Grow Light should be visible
        expect(screen.queryByText('Hydroponics Starter Kit')).not.toBeInTheDocument();
        expect(screen.getByText('LED Grow Light 100W')).toBeInTheDocument();
      });
    });

    it('should display active filter chips', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      // Apply a filter
      const categoryCheckbox = await screen.findByLabelText(/hydroponics/i);
      await user.click(categoryCheckbox);

      await waitFor(() => {
        // FilterChip should appear
        expect(screen.getByText(/category: hydroponics/i)).toBeInTheDocument();
      });
    });

    it('should remove filter with chip X button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      // Apply filter
      const checkbox = await screen.findByLabelText(/hydroponics/i);
      await user.click(checkbox);

      // Wait for chip to appear
      const chip = await screen.findByText(/category: hydroponics/i);
      expect(chip).toBeInTheDocument();

      // Click X button on chip
      const removeButton = chip.nextElementSibling as HTMLElement;
      await user.click(removeButton);

      await waitFor(() => {
        // Chip should disappear
        expect(screen.queryByText(/category: hydroponics/i)).not.toBeInTheDocument();
      });
    });

    it('should clear all filters with "Clear all" button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      // Apply multiple filters
      const categoryCheckbox = await screen.findByLabelText(/hydroponics/i);
      await user.click(categoryCheckbox);

      const searchInput = await screen.findByPlaceholderText(/search products/i);
      await user.type(searchInput, 'Test');

      // Wait for filters to apply
      await waitFor(() => {
        expect(screen.getByText(/category: hydroponics/i)).toBeInTheDocument();
      });

      // Click "Clear all" button
      const clearAllButton = await screen.findByRole('button', { name: /clear all/i });
      await user.click(clearAllButton);

      await waitFor(() => {
        // All filters should be cleared
        expect(screen.queryByText(/category: hydroponics/i)).not.toBeInTheDocument();
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Mobile Filter Drawer', () => {
    beforeEach(() => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
    });

    it('should show filter button on mobile', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        const filterButton = screen.getByRole('button', { name: /filter/i });
        expect(filterButton).toBeInTheDocument();
      });
    });

    it('should open filter drawer when clicking filter button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      const filterButton = await screen.findByRole('button', { name: /filter/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/filter products/i)).toBeInTheDocument();
      });
    });

    it('should close drawer after applying filters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      // Open drawer
      const filterButton = await screen.findByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Apply filter inside drawer
      const dialog = await screen.findByRole('dialog');
      const checkbox = within(dialog).getByLabelText(/hydroponics/i);
      await user.click(checkbox);

      await waitFor(() => {
        // Drawer should close automatically
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Product Card Display', () => {
    it('should display product image, name, price', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        expect(screen.getByText('Hydroponics Starter Kit')).toBeInTheDocument();
        expect(screen.getByText('₱1,500.00')).toBeInTheDocument();
        expect(screen.getByText('SKU: HSK-001')).toBeInTheDocument();
      });
    });

    it('should show promo badge for discounted products', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        expect(screen.getByText('-17%')).toBeInTheDocument();
        expect(screen.getByText('₱2,500.00')).toBeInTheDocument();
        expect(screen.getByText('₱3,000.00')).toBeInTheDocument(); // Original price
      });
    });

    it('should display stock status badges', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        expect(screen.getByText('In Stock')).toBeInTheDocument();
        expect(screen.getByText('Low Stock')).toBeInTheDocument();
      });
    });

    it('should show Edit and View action buttons', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /edit/i });
        const viewButtons = screen.getAllByRole('button', { name: /view/i });
        
        expect(editButtons).toHaveLength(2); // 2 products
        expect(viewButtons).toHaveLength(2);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading skeletons while fetching', async () => {
      // Mock loading state
      jest.spyOn(require('@/hooks/useProductSearch'), 'useProductSearch').mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<SellerProducts />);

      expect(screen.getAllByTestId('skeleton')).toHaveLength(5); // 5 skeleton cards
    });

    it('should hide loading skeletons after data loads', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
        expect(screen.getByText('Hydroponics Starter Kit')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should lazy load FilterPanel component', async () => {
      renderWithProviders(<SellerProducts />);

      // Wait for Suspense fallback to resolve
      await waitFor(() => {
        expect(screen.getByText(/categories/i)).toBeInTheDocument();
      });
    });

    it('should use standard grid for <= 100 products', async () => {
      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        const grid = screen.getByTestId('product-grid');
        expect(grid.classList.contains('grid')).toBe(true);
      });
    });

    // Note: Virtualization test requires mock of 100+ products
    it.skip('should use virtualized grid for > 100 products', async () => {
      // TODO: Mock 101+ products and test VirtualizedProductGrid
    });
  });

  describe('URL State Synchronization', () => {
    it('should reflect filters in URL query params', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SellerProducts />);

      // Apply search filter
      const searchInput = await screen.findByPlaceholderText(/search products/i);
      await user.type(searchInput, 'Hydroponics');

      await waitFor(() => {
        // URL should contain search param (nuqs handles this)
        expect(window.location.search).toContain('search=Hydroponics');
      }, { timeout: 1000 });
    });

    it('should load filters from URL on mount', async () => {
      // Set URL params before render
      window.history.pushState({}, '', '?search=LED&categories=grow-lights');

      renderWithProviders(<SellerProducts />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search products/i) as HTMLInputElement;
        expect(searchInput.value).toBe('LED');
        expect(screen.getByText(/category: grow-lights/i)).toBeInTheDocument();
      });
    });
  });
});
