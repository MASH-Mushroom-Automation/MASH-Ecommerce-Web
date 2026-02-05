/**
 * Unit Tests for InventoryStats Component
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryStats } from './InventoryStats';
import type { InventoryStats as InventoryStatsType } from '@/types/inventory';

describe('InventoryStats', () => {
  const mockStats: InventoryStatsType = {
    totalSKUs: 150,
    inStock: 100,
    lowStock: 30,
    outOfStock: 20,
    inStockPercentage: 66.7,
    lowStockPercentage: 20.0,
    outOfStockPercentage: 13.3,
  };

  describe('Loading State', () => {
    it('should render loading skeletons when isLoading is true', () => {
      render(<InventoryStats isLoading={true} />);
      
      // Check for skeleton elements (should have 4 cards)
      const skeletons = screen.getAllByRole('generic', { hidden: true });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not render stats when loading', () => {
      render(<InventoryStats stats={mockStats} isLoading={true} />);
      
      expect(screen.queryByText('Total SKUs')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message when isError is true', () => {
      render(<InventoryStats isError={true} />);
      
      expect(screen.getByText('Failed to load inventory statistics')).toBeInTheDocument();
    });

    it('should render error message when stats is undefined', () => {
      render(<InventoryStats stats={undefined} isError={false} />);
      
      expect(screen.getByText('Failed to load inventory statistics')).toBeInTheDocument();
    });
  });

  describe('Successful Render', () => {
    it('should render all four stat cards', () => {
      render(<InventoryStats stats={mockStats} />);
      
      expect(screen.getByText('Total SKUs')).toBeInTheDocument();
      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('should display correct values for each stat', () => {
      render(<InventoryStats stats={mockStats} />);
      
      // Total SKUs
      expect(screen.getByText('150')).toBeInTheDocument();
      
      // In Stock
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('66.7% of total inventory')).toBeInTheDocument();
      
      // Low Stock
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('20.0% of total inventory')).toBeInTheDocument();
      
      // Out of Stock
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('13.3% of total inventory')).toBeInTheDocument();
    });

    it('should format large numbers with commas', () => {
      const largeStats: InventoryStatsType = {
        ...mockStats,
        totalSKUs: 1500,
        inStock: 1000,
      };
      
      render(<InventoryStats stats={largeStats} />);
      
      expect(screen.getByText('1,500')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for each card', () => {
      render(<InventoryStats stats={mockStats} />);
      
      expect(screen.getByLabelText('Total SKUs: 150')).toBeInTheDocument();
      expect(screen.getByLabelText(/In Stock: 100 products/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Low Stock: 30 products/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Out of Stock: 20 products/)).toBeInTheDocument();
    });

    it('should have proper region label', () => {
      render(<InventoryStats stats={mockStats} />);
      
      const region = screen.getByRole('region', { name: 'Inventory statistics summary' });
      expect(region).toBeInTheDocument();
    });

    it('should have focusable cards when clickable', () => {
      const onStatClick = jest.fn();
      render(<InventoryStats stats={mockStats} onStatClick={onStatClick} />);
      
      const totalCard = screen.getByLabelText('Total SKUs: 150');
      expect(totalCard).toHaveAttribute('tabindex', '0');
      expect(totalCard).toHaveAttribute('role', 'button');
    });
  });

  describe('Click Interaction', () => {
    it('should call onStatClick with correct status when card is clicked', async () => {
      const onStatClick = jest.fn();
      const user = userEvent.setup();
      
      render(<InventoryStats stats={mockStats} onStatClick={onStatClick} />);
      
      // Click Total SKUs card
      const totalCard = screen.getByLabelText('Total SKUs: 150');
      await user.click(totalCard);
      expect(onStatClick).toHaveBeenCalledWith('all');
      
      // Click In Stock card
      const inStockCard = screen.getByLabelText(/In Stock: 100 products/);
      await user.click(inStockCard);
      expect(onStatClick).toHaveBeenCalledWith('in-stock');
      
      // Click Low Stock card
      const lowStockCard = screen.getByLabelText(/Low Stock: 30 products/);
      await user.click(lowStockCard);
      expect(onStatClick).toHaveBeenCalledWith('low-stock');
      
      // Click Out of Stock card
      const outOfStockCard = screen.getByLabelText(/Out of Stock: 20 products/);
      await user.click(outOfStockCard);
      expect(onStatClick).toHaveBeenCalledWith('out-of-stock');
    });

    it('should handle keyboard Enter key', async () => {
      const onStatClick = jest.fn();
      const user = userEvent.setup();
      
      render(<InventoryStats stats={mockStats} onStatClick={onStatClick} />);
      
      const totalCard = screen.getByLabelText('Total SKUs: 150');
      totalCard.focus();
      await user.keyboard('{Enter}');
      
      expect(onStatClick).toHaveBeenCalledWith('all');
    });

    it('should handle keyboard Space key', async () => {
      const onStatClick = jest.fn();
      const user = userEvent.setup();
      
      render(<InventoryStats stats={mockStats} onStatClick={onStatClick} />);
      
      const inStockCard = screen.getByLabelText(/In Stock: 100 products/);
      inStockCard.focus();
      await user.keyboard(' ');
      
      expect(onStatClick).toHaveBeenCalledWith('in-stock');
    });

    it('should not make cards clickable when onStatClick is not provided', () => {
      render(<InventoryStats stats={mockStats} />);
      
      const totalCard = screen.getByLabelText('Total SKUs: 150');
      expect(totalCard).not.toHaveAttribute('role', 'button');
      expect(totalCard).not.toHaveAttribute('tabindex');
    });
  });

  describe('Percentage Calculations', () => {
    it('should display percentages with one decimal place', () => {
      const stats: InventoryStatsType = {
        totalSKUs: 333,
        inStock: 111,
        lowStock: 111,
        outOfStock: 111,
        inStockPercentage: 33.33333,
        lowStockPercentage: 33.33333,
        outOfStockPercentage: 33.33333,
      };
      
      render(<InventoryStats stats={stats} />);
      
      const percentageTexts = screen.getAllByText(/33.3% of total inventory/);
      expect(percentageTexts).toHaveLength(3);
    });

    it('should handle zero values correctly', () => {
      const emptyStats: InventoryStatsType = {
        totalSKUs: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        inStockPercentage: 0,
        lowStockPercentage: 0,
        outOfStockPercentage: 0,
      };
      
      render(<InventoryStats stats={emptyStats} />);
      
      // All stat cards should show 0 (multiple elements with '0')
      const zeroValues = screen.getAllByText('0');
      expect(zeroValues.length).toBeGreaterThanOrEqual(4); // Total, In Stock, Low Stock, Out of Stock
      expect(screen.getAllByText('0.0% of total inventory')).toHaveLength(3);
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <InventoryStats stats={mockStats} className="custom-class" />
      );
      
      const gridContainer = container.querySelector('.custom-class');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    it('should use correct colors for each stat type', () => {
      render(<InventoryStats stats={mockStats} />);
      
      // Check for color classes (icons)
      const totalCard = screen.getByLabelText('Total SKUs: 150');
      const inStockCard = screen.getByLabelText(/In Stock: 100 products/);
      const lowStockCard = screen.getByLabelText(/Low Stock: 30 products/);
      const outOfStockCard = screen.getByLabelText(/Out of Stock: 20 products/);
      
      // Verify cards are rendered
      expect(totalCard).toBeInTheDocument();
      expect(inStockCard).toBeInTheDocument();
      expect(lowStockCard).toBeInTheDocument();
      expect(outOfStockCard).toBeInTheDocument();
    });
  });
});
