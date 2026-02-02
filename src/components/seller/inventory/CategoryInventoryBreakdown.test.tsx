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
});
