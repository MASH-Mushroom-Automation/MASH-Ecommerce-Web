/**
 * Unit Tests for LowStockAlerts Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LowStockAlerts } from './LowStockAlerts';
import type { LowStockItem } from '@/types/inventory';

describe('LowStockAlerts', () => {
  const mockItems: LowStockItem[] = [
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
      currentStock: 0,
      lowStockThreshold: 15,
      restockLevel: 100,
      price: 200,
      mainImage: 'https://example.com/image2.jpg',
      category: { _id: 'cat-1', name: 'Fresh Mushrooms', slug: 'fresh-mushrooms' },
    },
  ];

  describe('Loading State', () => {
    it('should render loading skeletons when isLoading is true and items are empty', () => {
      render(
        <LowStockAlerts
          items={[]}
          total={0}
          page={1}
          pageSize={20}
          hasMore={false}
          isLoading={true}
        />
      );
      
      expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
      // Check for table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message when isError is true', () => {
      render(
        <LowStockAlerts
          items={[]}
          total={0}
          page={1}
          pageSize={20}
          hasMore={false}
          isError={true}
        />
      );
      
      expect(screen.getByText('Failed to load low stock alerts')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when items array is empty', () => {
      render(
        <LowStockAlerts
          items={[]}
          total={0}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      expect(screen.getByText('No Low Stock Items')).toBeInTheDocument();
      expect(screen.getByText('All products are adequately stocked!')).toBeInTheDocument();
    });
  });

  describe('Successful Render', () => {
    it('should render all low stock items in table', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
      expect(screen.getByText('Shiitake Mushroom')).toBeInTheDocument();
    });

    it('should display product details correctly', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      // Check SKUs
      expect(screen.getByText('SKU001')).toBeInTheDocument();
      expect(screen.getByText('SKU002')).toBeInTheDocument();
      
      // Check stock quantities
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      
      // Check thresholds
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should display urgency badges', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      // Urgency badges should be present
      const badges = screen.getAllByText(/critical|high|medium/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should display category names', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      const categoryNames = screen.getAllByText('Fresh Mushrooms');
      expect(categoryNames).toHaveLength(2);
    });

    it('should display product images', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          pageSize={20}
          page={1}
          hasMore={false}
        />
      );
      
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });
  });

  describe('Pagination', () => {
    it('should display item count', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={50}
          page={1}
          pageSize={20}
          hasMore={true}
        />
      );
      
      expect(screen.getByText('Showing 2 of 50 items')).toBeInTheDocument();
    });

    it('should render Load More button when hasMore is true', () => {
      const onLoadMore = jest.fn();
      
      render(
        <LowStockAlerts
          items={mockItems}
          total={50}
          page={1}
          pageSize={20}
          hasMore={true}
          onLoadMore={onLoadMore}
        />
      );
      
      expect(screen.getByText('Load More')).toBeInTheDocument();
    });

    it('should call onLoadMore when Load More button is clicked', async () => {
      const onLoadMore = jest.fn();
      const user = userEvent.setup();
      
      render(
        <LowStockAlerts
          items={mockItems}
          total={50}
          page={1}
          pageSize={20}
          hasMore={true}
          onLoadMore={onLoadMore}
        />
      );
      
      const loadMoreButton = screen.getByText('Load More');
      await user.click(loadMoreButton);
      
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should not render Load More button when hasMore is false', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
          onLoadMore={jest.fn()}
        />
      );
      
      expect(screen.queryByText('Load More')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should render Restock buttons when onRestockClick is provided', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
          onRestockClick={jest.fn()}
        />
      );
      
      const restockButtons = screen.getAllByText('Restock');
      expect(restockButtons).toHaveLength(2);
    });

    it('should call onRestockClick when Restock button is clicked', async () => {
      const onRestockClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
          onRestockClick={onRestockClick}
        />
      );
      
      const restockButtons = screen.getAllByText('Restock');
      await user.click(restockButtons[0]);
      
      expect(onRestockClick).toHaveBeenCalledWith(mockItems[0]);
    });

    it('should render View Details links for each product', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', '/seller/products/oyster-mushroom');
      expect(links[1]).toHaveAttribute('href', '/seller/products/shiitake-mushroom');
    });
  });

  describe('Urgency Calculation', () => {
    it('should display critical urgency for 0 stock', () => {
      const criticalItem: LowStockItem = {
        ...mockItems[0],
        currentStock: 0,
        lowStockThreshold: 10,
      };
      
      render(
        <LowStockAlerts
          items={[criticalItem]}
          total={1}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    it('should display high urgency for 26-50% stock', () => {
      const highUrgencyItem: LowStockItem = {
        ...mockItems[0],
        currentStock: 4,
        lowStockThreshold: 10,
      };
      
      render(
        <LowStockAlerts
          items={[highUrgencyItem]}
          total={1}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      expect(screen.getByText('high')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for action buttons', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
          onRestockClick={jest.fn()}
        />
      );
      
      expect(screen.getByLabelText('Restock Oyster Mushroom')).toBeInTheDocument();
      expect(screen.getByLabelText('View details for Oyster Mushroom')).toBeInTheDocument();
    });

    it('should have proper table structure', () => {
      render(
        <LowStockAlerts
          items={mockItems}
          total={2}
          page={1}
          pageSize={20}
          hasMore={false}
        />
      );
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(6);
    });
  });
});
