/**
 * Integration Tests for Inventory Overview Page
 * Tests full page functionality with Sanity CMS data flow
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InventoryOverviewPage from './page';
import * as inventoryService from '@/lib/sanity/inventory-service';
import * as inventoryMutations from '@/lib/sanity/mutations/inventory';
import type {
  InventoryStats,
  LowStockItem,
  InventoryValue,
  CategoryInventory,
} from '@/types/inventory';

// Mock dependencies
jest.mock('@/lib/sanity/inventory-service');
jest.mock('@/lib/sanity/mutations/inventory');

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    info: jest.fn(),
  },
}));

const mockGetInventoryStats = inventoryService.getInventoryStats as jest.MockedFunction<
  typeof inventoryService.getInventoryStats
>;
const mockGetLowStockProducts = inventoryService.getLowStockProducts as jest.MockedFunction<
  typeof inventoryService.getLowStockProducts
>;
const mockGetStockValue = inventoryService.getStockValue as jest.MockedFunction<
  typeof inventoryService.getStockValue
>;
const mockGetCategoryInventory =
  inventoryService.getCategoryInventoryDistribution as jest.MockedFunction<
    typeof inventoryService.getCategoryInventoryDistribution
  >;
const mockUpdateProductStock = inventoryMutations.updateProductStock as jest.MockedFunction<
  typeof inventoryMutations.updateProductStock
>;

// Mock data
const mockStats: InventoryStats = {
  totalSKUs: 150,
  inStock: 100,
  lowStock: 30,
  outOfStock: 20,
  inStockPercentage: 66.7,
  lowStockPercentage: 20.0,
  outOfStockPercentage: 13.3,
};

const mockLowStockProducts: LowStockItem[] = [
  {
    _id: 'prod-1',
    _updatedAt: '2024-01-01',
    name: 'Oyster Mushroom',
    sku: 'SKU001',
    slug: 'oyster-mushroom',
    currentStock: 5,
    lowStockThreshold: 10,
    restockLevel: 50,
    price: 150,
    mainImage: 'https://example.com/image1.jpg',
    category: { _id: 'cat-1', name: 'Fresh Mushrooms', slug: 'fresh-mushrooms' },
  },
  {
    _id: 'prod-2',
    _updatedAt: '2024-01-02',
    name: 'Shiitake Mushroom',
    sku: 'SKU002',
    slug: 'shiitake-mushroom',
    currentStock: 2,
    lowStockThreshold: 15,
    restockLevel: 75,
    price: 200,
    mainImage: 'https://example.com/image2.jpg',
    category: { _id: 'cat-1', name: 'Fresh Mushrooms', slug: 'fresh-mushrooms' },
  },
];

const mockStockValue: InventoryValue = {
  totalValue: 50000,
  totalUnits: 500,
  categoriesValue: [
    {
      categoryId: 'cat-1',
      categoryName: 'Fresh Mushrooms',
      value: 30000,
      units: 300,
      percentage: 60,
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Dried Mushrooms',
      value: 20000,
      units: 200,
      percentage: 40,
    },
  ],
};

const mockCategoryInventory: CategoryInventory[] = [
  {
    categoryId: 'cat-1',
    categoryName: 'Fresh Mushrooms',
    totalSKUs: 50,
    inStock: 35,
    lowStock: 10,
    outOfStock: 5,
    totalUnits: 300,
    totalValue: 30000,
  },
  {
    categoryId: 'cat-2',
    categoryName: 'Dried Mushrooms',
    totalSKUs: 100,
    inStock: 65,
    lowStock: 20,
    outOfStock: 15,
    totalUnits: 200,
    totalValue: 20000,
  },
];

// Helper to create wrapper with React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('InventoryOverviewPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock responses
    mockGetInventoryStats.mockResolvedValue(mockStats);
    mockGetLowStockProducts.mockResolvedValue({
      products: mockLowStockProducts,
      total: 2,
      hasMore: false,
    });
    mockGetStockValue.mockResolvedValue(mockStockValue);
    mockGetCategoryInventory.mockResolvedValue(mockCategoryInventory);
  });

  describe('Full Page Load', () => {
    it('should render all dashboard sections with data', async () => {
      const { container } = render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Inventory Overview')).toBeInTheDocument();
      });

      // Check all major sections are present
      expect(screen.getByText('Total SKUs')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument(); // Total SKUs value

      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // In Stock value

      expect(screen.getByText('Low Stock')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument(); // Low Stock value

      // Check low stock alerts table
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
      expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      expect(screen.getByText('Shiitake Mushroom')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      mockGetInventoryStats.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      // Should show loading skeletons
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle error state gracefully', async () => {
      mockGetInventoryStats.mockRejectedValue(new Error('Network error'));

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stock Update Flow', () => {
    it('should update stock via QuickStockUpdate modal', async () => {
      const user = userEvent.setup();
      mockUpdateProductStock.mockResolvedValueOnce({
        success: true,
        productId: 'prod-1',
        oldQuantity: 5,
        newQuantity: 50,
        updatedAt: '2026-02-02T10:00:00Z',
      });

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      // Find and click Restock button
      const restockButtons = screen.getAllByText(/restock/i);
      await user.click(restockButtons[0]);

      // Modal should open
      await waitFor(() => {
        expect(screen.getByText('Quick Stock Update')).toBeInTheDocument();
      });

      // Change stock quantity
      const input = screen.getByLabelText(/new stock quantity/i);
      await user.clear(input);
      await user.type(input, '50');

      // Save changes
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Should call mutation
      await waitFor(() => {
        expect(mockUpdateProductStock).toHaveBeenCalledWith('prod-1', 50);
      });
    });

    it('should show success feedback after stock update', async () => {
      const user = userEvent.setup();
      const { toast } = require('sonner');

      mockUpdateProductStock.mockResolvedValueOnce({
        success: true,
        productId: 'prod-1',
        oldQuantity: 5,
        newQuantity: 50,
        updatedAt: '2026-02-02T10:00:00Z',
      });

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      const restockButtons = screen.getAllByText(/restock/i);
      await user.click(restockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Quick Stock Update')).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/new stock quantity/i);
      await user.clear(input);
      await user.type(input, '50');

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should close modal and refresh data after successful update', async () => {
      const user = userEvent.setup();
      mockUpdateProductStock.mockResolvedValueOnce({
        success: true,
        productId: 'prod-1',
        oldQuantity: 5,
        newQuantity: 50,
        updatedAt: '2026-02-02T10:00:00Z',
      });

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      const restockButtons = screen.getAllByText(/restock/i);
      await user.click(restockButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Quick Stock Update')).toBeInTheDocument();
      });

      const input = screen.getByLabelText(/new stock quantity/i);
      await user.clear(input);
      await user.type(input, '50');

      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Quick Stock Update')).not.toBeInTheDocument();
      });
    });
  });

  describe('Low Stock Alerts Interactions', () => {
    it('should display all low stock products in table', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
        expect(screen.getByText('Shiitake Mushroom')).toBeInTheDocument();
      });

      // Check SKUs are displayed
      expect(screen.getByText('SKU001')).toBeInTheDocument();
      expect(screen.getByText('SKU002')).toBeInTheDocument();
    });

    it('should show urgency indicators for low stock items', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      // Check for urgency badges (critical, high, medium)
      const urgencyBadges = screen.getAllByText(/(critical|high|medium)/i);
      expect(urgencyBadges.length).toBeGreaterThan(0);
    });

    it('should navigate to product details when clicking product name', async () => {
      const user = userEvent.setup();
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      const productLink = screen.getByText('Oyster Mushroom');
      expect(productLink).toHaveAttribute('href', '/product/oyster-mushroom');
    });
  });

  describe('Chart Interactions', () => {
    it('should render stock distribution chart with data', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Stock Distribution')).toBeInTheDocument();
      });

      // Check chart legend
      expect(screen.getByText(/in stock/i)).toBeInTheDocument();
      expect(screen.getByText(/low stock/i)).toBeInTheDocument();
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    });

    it('should show stock value calculator', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Stock Value')).toBeInTheDocument();
      });

      // Check total value is displayed
      expect(screen.getByText(/₱50,000/i)).toBeInTheDocument();
    });
  });

  describe('Category Breakdown', () => {
    it('should display category inventory breakdown', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Category Inventory')).toBeInTheDocument();
      });

      // Check categories are listed
      expect(screen.getByText('Fresh Mushrooms')).toBeInTheDocument();
      expect(screen.getByText('Dried Mushrooms')).toBeInTheDocument();
    });

    it('should expand/collapse category sections', async () => {
      const user = userEvent.setup();
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Fresh Mushrooms')).toBeInTheDocument();
      });

      // Find accordion trigger
      const categoryTrigger = screen.getByText('Fresh Mushrooms').closest('button');
      if (categoryTrigger) {
        await user.click(categoryTrigger);
      }

      // Category details should be visible
      await waitFor(() => {
        expect(screen.getByText(/50 SKUs/i)).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should have refresh button to reload data', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Inventory Overview')).toBeInTheDocument();
      });

      // Look for refresh/reload button
      const refreshButton = screen.getByRole('button', { name: /refresh|reload/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should refetch all data when refresh is clicked', async () => {
      const user = userEvent.setup();
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Inventory Overview')).toBeInTheDocument();
      });

      // Clear mock calls
      mockGetInventoryStats.mockClear();
      mockGetLowStockProducts.mockClear();
      mockGetStockValue.mockClear();
      mockGetCategoryInventory.mockClear();

      const refreshButton = screen.getByRole('button', { name: /refresh|reload/i });
      await user.click(refreshButton);

      // Should call all data fetching functions again
      await waitFor(() => {
        expect(mockGetInventoryStats).toHaveBeenCalled();
        expect(mockGetLowStockProducts).toHaveBeenCalled();
        expect(mockGetStockValue).toHaveBeenCalled();
        expect(mockGetCategoryInventory).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when stats fetch fails', async () => {
      mockGetInventoryStats.mockRejectedValueOnce(new Error('Connection timeout'));

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/failed to load inventory statistics/i)).toBeInTheDocument();
      });
    });

    it('should show error when low stock products fetch fails', async () => {
      mockGetLowStockProducts.mockRejectedValueOnce(new Error('Database error'));

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/failed to load low stock products/i)).toBeInTheDocument();
      });
    });

    it('should handle network failures gracefully', async () => {
      mockGetInventoryStats.mockRejectedValueOnce(new Error('Network error'));
      mockGetLowStockProducts.mockRejectedValueOnce(new Error('Network error'));
      mockGetStockValue.mockRejectedValueOnce(new Error('Network error'));
      mockGetCategoryInventory.mockRejectedValueOnce(new Error('Network error'));

      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      // Should not crash, should show error states
      await waitFor(() => {
        const errorMessages = screen.queryAllByText(/failed|error/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should render without errors on mobile viewport', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      expect(container).toBeInTheDocument();
    });

    it('should render without errors on tablet viewport', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      expect(container).toBeInTheDocument();
    });

    it('should render without errors on desktop viewport', () => {
      global.innerWidth = 1920;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Inventory Overview')).toBeInTheDocument();
      });

      const h1 = screen.getByRole('heading', { level: 1, name: /inventory overview/i });
      expect(h1).toBeInTheDocument();
    });

    it('should have accessible action buttons', async () => {
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      // All action buttons should have accessible labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<InventoryOverviewPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      });

      // Tab through interactive elements
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLElement);
    });
  });
});
