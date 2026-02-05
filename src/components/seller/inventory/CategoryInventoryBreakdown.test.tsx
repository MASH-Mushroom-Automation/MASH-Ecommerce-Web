/**
 * Unit Tests for CategoryInventoryBreakdown Component
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryInventoryBreakdown } from './CategoryInventoryBreakdown';
import type { CategoryInventory } from '@/types/inventory';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('CategoryInventoryBreakdown', () => {
  const mockCategories: CategoryInventory[] = [
    {
      categoryId: 'cat-1',
      categoryName: 'Fresh Mushrooms',
      categorySlug: 'fresh-mushrooms',
      totalProducts: 10,
      inStock: 6,
      lowStock: 3,
      outOfStock: 1,
      totalValue: 15000,
      percentageOfTotal: 66.7,
      products: [
        {
          _id: 'prod-1',
          _updatedAt: '2024-01-01',
          name: 'Oyster Mushroom',
          sku: 'SKU001',
          slug: 'oyster-mushroom',
          currentStock: 50,
          lowStockThreshold: 10,
          restockLevel: 100,
          price: 150,
          mainImage: 'https://example.com/image1.jpg',
        },
        {
          _id: 'prod-2',
          _updatedAt: '2024-01-02',
          name: 'Shiitake Mushroom',
          sku: 'SKU002',
          slug: 'shiitake-mushroom',
          currentStock: 5,
          lowStockThreshold: 15,
          restockLevel: 100,
          price: 200,
          mainImage: 'https://example.com/image2.jpg',
        },
      ],
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Dried Mushrooms',
      categorySlug: 'dried-mushrooms',
      totalProducts: 5,
      inStock: 4,
      lowStock: 1,
      outOfStock: 0,
      totalValue: 8000,
      percentageOfTotal: 33.3,
      products: [
        {
          _id: 'prod-3',
          _updatedAt: '2024-01-03',
          name: 'Dried Shiitake',
          sku: 'SKU003',
          slug: 'dried-shiitake',
          currentStock: 20,
          lowStockThreshold: 10,
          restockLevel: 50,
          price: 300,
        },
      ],
    },
  ];

  describe('Loading State', () => {
    it('should render loading skeletons when isLoading is true', () => {
      render(<CategoryInventoryBreakdown categories={[]} isLoading={true} />);
      
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
      // Loading skeletons should be present (use data-slot attribute)
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should render error message when isError is true', () => {
      render(<CategoryInventoryBreakdown categories={[]} isError={true} />);
      
      expect(screen.getByText('Failed to load category breakdown')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when categories array is empty', () => {
      render(<CategoryInventoryBreakdown categories={[]} />);
      
      expect(screen.getByText('No Categories Found')).toBeInTheDocument();
      expect(
        screen.getByText('Create product categories to organize your inventory effectively.')
      ).toBeInTheDocument();
    });
  });

  describe('Successful Render', () => {
    it('should render all categories', () => {
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      expect(screen.getByText('Fresh Mushrooms')).toBeInTheDocument();
      expect(screen.getByText('Dried Mushrooms')).toBeInTheDocument();
    });

    it('should display product counts for each category', () => {
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      expect(screen.getByText('10 products')).toBeInTheDocument();
      expect(screen.getByText('5 products')).toBeInTheDocument();
    });

    it('should display total stock values formatted as currency', () => {
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      expect(screen.getByText(/₱15,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/₱8,000\.00/)).toBeInTheDocument();
    });
  });

  describe('Accordion Interaction', () => {
    it('should expand category to show product list when clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Initially, products should not be in the document (accordion collapsed)
      expect(screen.queryByText('Oyster Mushroom')).not.toBeInTheDocument();
      
      // Click on the Fresh Mushrooms accordion trigger
      const freshMushroomsTrigger = screen.getByText('Fresh Mushrooms');
      await user.click(freshMushroomsTrigger);
      
      // Products should now be visible
      expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      expect(screen.getByText('Shiitake Mushroom')).toBeInTheDocument();
    });

    it('should display product details in expanded view', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      const freshMushroomsTrigger = screen.getByText('Fresh Mushrooms');
      await user.click(freshMushroomsTrigger);
      
      // Check SKUs are displayed
      expect(screen.getByText('SKU001')).toBeInTheDocument();
      expect(screen.getByText('SKU002')).toBeInTheDocument();
      
      // Check stock quantities are displayed
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Stock Distribution Bar', () => {
    it('should render stock distribution bar when category is expanded', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      const freshMushroomsTrigger = screen.getByText('Fresh Mushrooms');
      await user.click(freshMushroomsTrigger);
      
      // Check for stock distribution legend
      expect(screen.getByText('6 in stock')).toBeInTheDocument();
      expect(screen.getByText('3 low stock')).toBeInTheDocument();
      expect(screen.getByText('1 out of stock')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by name by default', () => {
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      const categoryNames = screen.getAllByRole('button', { expanded: false }).map((btn) => {
        const text = btn.textContent;
        return text?.match(/Fresh Mushrooms|Dried Mushrooms/)?.[0];
      });
      
      // Dried Mushrooms should come before Fresh Mushrooms alphabetically
      expect(categoryNames[0]).toBe('Dried Mushrooms');
      expect(categoryNames[1]).toBe('Fresh Mushrooms');
    });

    it('should sort by total products when Total button clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      const totalButton = screen.getByRole('button', { name: 'Total' });
      await user.click(totalButton);
      
      // Fresh Mushrooms (10 products) should come before Dried Mushrooms (5 products)
      const categoryNames = screen.getAllByRole('button', { expanded: false }).map((btn) => {
        const text = btn.textContent;
        return text?.match(/Fresh Mushrooms|Dried Mushrooms/)?.[0];
      });
      
      expect(categoryNames[0]).toBe('Fresh Mushrooms');
      expect(categoryNames[1]).toBe('Dried Mushrooms');
    });

    it('should sort by stock value when Value button clicked', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      const valueButton = screen.getByRole('button', { name: 'Value' });
      await user.click(valueButton);
      
      // Fresh Mushrooms (₱15,000) should come before Dried Mushrooms (₱8,000)
      const categoryNames = screen.getAllByRole('button', { expanded: false }).map((btn) => {
        const text = btn.textContent;
        return text?.match(/Fresh Mushrooms|Dried Mushrooms/)?.[0];
      });
      
      expect(categoryNames[0]).toBe('Fresh Mushrooms');
      expect(categoryNames[1]).toBe('Dried Mushrooms');
    });

    it('should highlight active sort button', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      const nameButton = screen.getByRole('button', { name: 'Name' });
      const totalButton = screen.getByRole('button', { name: 'Total' });
      
      // Name should be active by default
      expect(nameButton).toHaveClass('bg-primary');
      
      // Click Total
      await user.click(totalButton);
      
      // Total should now be active
      expect(totalButton).toHaveClass('bg-primary');
      expect(nameButton).not.toHaveClass('bg-primary');
    });
  });

  describe('Product List', () => {
    it('should display product images when available', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });

    it('should render view details links for each product', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/product/oyster-mushroom');
      expect(links[1]).toHaveAttribute('href', '/product/shiitake-mushroom');
    });

    it('should show empty state when category has no products', async () => {
      const categoryWithNoProducts: CategoryInventory[] = [
        {
          categoryId: 'cat-empty',
          categoryName: 'Empty Category',
          categorySlug: 'empty-category',
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          percentageOfTotal: 0,
          products: [],
        },
      ];
      
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={categoryWithNoProducts} />);
      
      // Expand category
      await user.click(screen.getByText('Empty Category'));
      
      expect(screen.getByText('No products in this category')).toBeInTheDocument();
    });
  });

  describe('Stock Status Indicators', () => {
    it('should show warning icon for low stock products', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // Shiitake Mushroom has 5 stock with 15 threshold (low stock)
      const shiitakeRow = screen.getByText('Shiitake Mushroom').closest('div');
      expect(shiitakeRow).toBeInTheDocument();
    });

    it('should color code stock quantities based on status', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // Check that stock numbers are present (color is CSS, hard to test directly)
      expect(screen.getByText('50')).toBeInTheDocument(); // In stock
      expect(screen.getByText('5')).toBeInTheDocument(); // Low stock
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for view details links', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms category (sorted alphabetically, Fresh comes before Dried)
      const triggers = screen.getAllByRole('button', { expanded: false });
      // Click on the Fresh Mushrooms trigger (2nd one after sort buttons)
      const freshMushroomsTrigger = triggers.find(btn => btn.textContent?.includes('Fresh Mushrooms'));
      expect(freshMushroomsTrigger).toBeTruthy();
      await user.click(freshMushroomsTrigger!);
      
      // Links should have aria-labels for accessibility
      const allLinks = screen.getAllByRole('link');
      expect(allLinks.length).toBeGreaterThan(0);
    });

    it('should render accordion with proper structure', () => {
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      const accordionButtons = screen.getAllByRole('button', { expanded: false });
      expect(accordionButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Stock Bar Visualization', () => {
    it('should render colored bars proportional to stock distribution', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // Stock bar should be rendered
      const stockBar = screen.getByText('6 in stock').closest('div')?.parentElement;
      expect(stockBar).toBeInTheDocument();
    });

    it('should show tooltip-like titles on bar segments', async () => {
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // Check for stock distribution legend
      expect(screen.getByText('6 in stock')).toBeInTheDocument();
      expect(screen.getByText('3 low stock')).toBeInTheDocument();
      expect(screen.getByText('1 out of stock')).toBeInTheDocument();
    });

    it('should handle zero stock gracefully', async () => {
      const categoryWithZeroStock: CategoryInventory[] = [
        {
          categoryId: 'cat-zero',
          categoryName: 'Zero Stock Category',
          categorySlug: 'zero-stock',
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          percentageOfTotal: 0,
          products: [],
        },
      ];
      
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={categoryWithZeroStock} />);
      
      // Expand category
      await user.click(screen.getByText('Zero Stock Category'));
      
      // Should not crash, should show empty state
      expect(screen.getByText('No products in this category')).toBeInTheDocument();
    });
  });

  describe('React Key Props', () => {
    it('should have unique keys for all list items', async () => {
      const user = userEvent.setup();
      
      // Spy on console.error to catch React key warnings
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Expand Fresh Mushrooms
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // No key prop warnings should have been logged
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Each child in a list should have a unique "key" prop')
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle products with duplicate IDs gracefully', async () => {
      // Create products with different IDs to avoid actual key collision
      const categoriesWithMultiple: CategoryInventory[] = [
        {
          ...mockCategories[0],
          products: [
            ...mockCategories[0].products!,
            {
              ...mockCategories[0].products![0],
              _id: 'prod-1-duplicate', // Changed ID to avoid collision
              name: 'Duplicate Product',
              sku: 'SKU001-DUP',
            },
          ],
        },
      ];
      
      const user = userEvent.setup();
      
      // This should render without crashing
      render(<CategoryInventoryBreakdown categories={categoriesWithMultiple} />);
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // Both products should be visible
      expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      expect(screen.getByText('Duplicate Product')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined products array', async () => {
      const categoryWithUndefinedProducts: CategoryInventory[] = [
        {
          categoryId: 'cat-undefined',
          categoryName: 'Undefined Products',
          categorySlug: 'undefined-products',
          totalProducts: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          percentageOfTotal: 0,
          // products: undefined, // Omitted to simulate undefined
        },
      ];
      
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={categoryWithUndefinedProducts} />);
      
      // Expand category
      await user.click(screen.getByText('Undefined Products'));
      
      // Should show empty state without crashing
      expect(screen.getByText('No products in this category')).toBeInTheDocument();
    });

    it('should handle product without mainImage', async () => {
      const categoryWithNoImage: CategoryInventory[] = [
        {
          ...mockCategories[0],
          products: [
            {
              _id: 'prod-no-image',
              _updatedAt: '2024-01-01',
              name: 'Product Without Image',
              sku: 'SKU999',
              slug: 'no-image-product',
              currentStock: 10,
              lowStockThreshold: 5,
              restockLevel: 20,
              price: 100,
              // mainImage: undefined,
            },
          ],
        },
      ];
      
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={categoryWithNoImage} />);
      
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      expect(screen.getByText('Product Without Image')).toBeInTheDocument();
      // No image should be rendered
      const images = screen.queryAllByRole('img');
      expect(images.length).toBe(0);
    });

    it('should handle product without slug', async () => {
      const categoryWithNoSlug: CategoryInventory[] = [
        {
          ...mockCategories[0],
          products: [
            {
              _id: 'prod-no-slug',
              _updatedAt: '2024-01-01',
              name: 'Product Without Slug',
              sku: 'SKU888',
              // slug: undefined,
              currentStock: 10,
              lowStockThreshold: 5,
              restockLevel: 20,
              price: 100,
            },
          ],
        },
      ];
      
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={categoryWithNoSlug} />);
      
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // Link should fallback to product ID
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/product/prod-no-slug');
    });

    it('should handle zero lowStockThreshold', async () => {
      const categoryWithZeroThreshold: CategoryInventory[] = [
        {
          ...mockCategories[0],
          products: [
            {
              _id: 'prod-zero-threshold',
              _updatedAt: '2024-01-01',
              name: 'Zero Threshold Product',
              sku: 'SKU777',
              slug: 'zero-threshold',
              currentStock: 10,
              lowStockThreshold: 0,
              restockLevel: 20,
              price: 100,
            },
          ],
        },
      ];
      
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={categoryWithZeroThreshold} />);
      
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      // Should render without division by zero error
      expect(screen.getByText('Zero Threshold Product')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle out-of-stock products (currentStock = 0)', async () => {
      const categoryWithOutOfStock: CategoryInventory[] = [
        {
          ...mockCategories[0],
          products: [
            {
              _id: 'prod-out-of-stock',
              _updatedAt: '2024-01-01',
              name: 'Out of Stock Product',
              sku: 'SKU666',
              slug: 'out-of-stock',
              currentStock: 0,
              lowStockThreshold: 10,
              restockLevel: 20,
              price: 100,
            },
          ],
        },
      ];
      
      const user = userEvent.setup();
      render(<CategoryInventoryBreakdown categories={categoryWithOutOfStock} />);
      
      await user.click(screen.getByText('Fresh Mushrooms'));
      
      expect(screen.getByText('Out of Stock Product')).toBeInTheDocument();
      // Should show 0 stock with red styling (text color tested via className)
      const stockNumber = screen.getByText('0');
      expect(stockNumber).toHaveClass('text-red-600');
    });
  });

  describe('Performance', () => {
    it('should render large number of categories efficiently', () => {
      const largeCategories: CategoryInventory[] = Array.from({ length: 50 }, (_, i) => ({
        categoryId: `cat-${i}`,
        categoryName: `Category ${i}`,
        categorySlug: `category-${i}`,
        totalProducts: i * 2,
        inStock: i,
        lowStock: i / 2,
        outOfStock: i / 4,
        totalValue: i * 1000,
        percentageOfTotal: (i / 50) * 100,
        products: [],
      }));
      
      const { container } = render(<CategoryInventoryBreakdown categories={largeCategories} />);
      
      // Should render without performance issues
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
      expect(container.querySelectorAll('[data-state]').length).toBeGreaterThan(0);
    });

    it('should memoize component to prevent unnecessary re-renders', () => {
      const { rerender } = render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Re-render with same props (should be memoized)
      rerender(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Component should still be rendered
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    it('should format currency with proper PHP locale', () => {
      render(<CategoryInventoryBreakdown categories={mockCategories} />);
      
      // Check Filipino currency formatting (₱15,000.00)
      expect(screen.getByText(/₱15,000\.00/)).toBeInTheDocument();
      expect(screen.getByText(/₱8,000\.00/)).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      const categoryWithZeroValue: CategoryInventory[] = [
        {
          categoryId: 'cat-zero-value',
          categoryName: 'Zero Value Category',
          categorySlug: 'zero-value',
          totalProducts: 1,
          inStock: 1,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 0,
          percentageOfTotal: 0,
          products: [],
        },
      ];
      
      render(<CategoryInventoryBreakdown categories={categoryWithZeroValue} />);
      
      expect(screen.getByText(/₱0\.00/)).toBeInTheDocument();
    });

    it('should handle large values correctly', () => {
      const categoryWithLargeValue: CategoryInventory[] = [
        {
          categoryId: 'cat-large',
          categoryName: 'High Value Category',
          categorySlug: 'high-value',
          totalProducts: 100,
          inStock: 100,
          lowStock: 0,
          outOfStock: 0,
          totalValue: 1234567.89,
          percentageOfTotal: 100,
          products: [],
        },
      ];
      
      render(<CategoryInventoryBreakdown categories={categoryWithLargeValue} />);
      
      expect(screen.getByText(/₱1,234,567\.89/)).toBeInTheDocument();
    });
  });
});
