/**
 * Unit Tests for StockValueCalculator Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockValueCalculator } from './StockValueCalculator';
import type { InventoryValue } from '@/types/inventory';

describe('StockValueCalculator', () => {
  const mockValueData: InventoryValue = {
    totalValue: 50000,
    totalUnits: 500,
    categoriesValue: [
      {
        categoryId: 'cat-1',
        categoryName: 'Fresh Mushrooms',
        totalValue: 30000,
        totalUnits: 300,
        averagePrice: 100,
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Dried Mushrooms',
        totalValue: 20000,
        totalUnits: 200,
        averagePrice: 100,
      },
    ],
  };

  describe('Loading State', () => {
    it('should render loading skeletons when isLoading is true', () => {
      const { container } = render(<StockValueCalculator isLoading={true} />);
      
      expect(screen.getByText('Inventory Value')).toBeInTheDocument();
      // Loading skeletons should be present
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should render error message when isError is true', () => {
      render(<StockValueCalculator isError={true} />);
      
      expect(screen.getByText('Failed to calculate inventory value')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when valueData is undefined', () => {
      render(<StockValueCalculator />);
      
      expect(screen.getByText('No Inventory Data')).toBeInTheDocument();
      expect(screen.getByText(/Add products with stock and pricing/)).toBeInTheDocument();
    });

    it('should render empty state when total value is 0', () => {
      const emptyData: InventoryValue = {
        totalValue: 0,
        totalUnits: 0,
        categoriesValue: [],
      };
      
      render(<StockValueCalculator valueData={emptyData} />);
      
      expect(screen.getByText('No Inventory Data')).toBeInTheDocument();
    });
  });

  describe('Successful Render', () => {
    it('should render total inventory value', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      expect(screen.getByText('Total Inventory Value')).toBeInTheDocument();
      expect(screen.getByText('₱50,000.00')).toBeInTheDocument();
    });

    it('should render total units and category count', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      expect(screen.getByText(/500 units across 2 categories/)).toBeInTheDocument();
    });

    it('should render all category names', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      // Fresh Mushrooms appears twice (table row + highest value category summary)
      expect(screen.getAllByText('Fresh Mushrooms').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Dried Mushrooms')).toBeInTheDocument();
    });

    it('should render category units', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      // Fresh Mushrooms: 300 units
      expect(screen.getByText('300')).toBeInTheDocument();
      // Dried Mushrooms: 200 units
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should render category values', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      expect(screen.getByText('₱30,000.00')).toBeInTheDocument();
      expect(screen.getByText('₱20,000.00')).toBeInTheDocument();
    });

    it('should calculate and display percentages correctly', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      // Fresh Mushrooms: 60% (30,000 / 50,000)
      expect(screen.getByText('60.0%')).toBeInTheDocument();
      // Dried Mushrooms: 40% (20,000 / 50,000)
      expect(screen.getByText('40.0%')).toBeInTheDocument();
    });

    it('should sort categories by value descending', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      const rows = screen.getAllByRole('row');
      // Skip header row (index 0), first data row should be Fresh Mushrooms (highest value)
      expect(rows[1]).toHaveTextContent('Fresh Mushrooms');
      expect(rows[2]).toHaveTextContent('Dried Mushrooms');
    });
  });

  describe('Summary Stats', () => {
    it('should display average value per unit', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      expect(screen.getByText('Avg. Value per Unit')).toBeInTheDocument();
      // 50,000 / 500 = 100
      expect(screen.getByText('₱100.00')).toBeInTheDocument();
    });

    it('should display highest value category', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      expect(screen.getByText('Highest Value Category')).toBeInTheDocument();
      // Fresh Mushrooms has highest value (30,000)
      const categoryElements = screen.getAllByText('Fresh Mushrooms');
      expect(categoryElements.length).toBeGreaterThan(1);
    });

    it('should handle N/A for highest category when no data', () => {
      const emptyData: InventoryValue = {
        totalValue: 0,
        totalUnits: 0,
        categoriesValue: [],
      };
      
      render(<StockValueCalculator valueData={emptyData} />);
      
      // Should show empty state, not summary stats
      expect(screen.getByText('No Inventory Data')).toBeInTheDocument();
    });
  });

  describe('CSV Export', () => {
    it('should render export button', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      const exportButton = screen.getByLabelText('Export inventory value to CSV');
      expect(exportButton).toBeInTheDocument();
    });

    it('should trigger CSV download on button click', async () => {
      const user = userEvent.setup();
      render(<StockValueCalculator valueData={mockValueData} />);
      
      // Mock URL.createObjectURL which is not available in jsdom
      const mockCreateObjectURL = jest.fn().mockReturnValue('blob:test-url');
      const mockRevokeObjectURL = jest.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      
      // Mock document methods for CSV download
      const createElementSpy = jest.spyOn(document, 'createElement');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');
      
      const exportButton = screen.getByLabelText('Export inventory value to CSV');
      await user.click(exportButton);
      
      // Verify CSV creation
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('Currency Formatting', () => {
    it('should format currency with PHP symbol and commas', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      // Check total value formatting
      expect(screen.getByText('₱50,000.00')).toBeInTheDocument();
      // Check category values
      expect(screen.getByText('₱30,000.00')).toBeInTheDocument();
      expect(screen.getByText('₱20,000.00')).toBeInTheDocument();
    });

    it('should format numbers with commas', () => {
      const largeValueData: InventoryValue = {
        totalValue: 1250000,
        totalUnits: 10000,
        categoriesValue: [
          {
            categoryId: 'cat-1',
            categoryName: 'Test Category',
            totalValue: 1250000,
            totalUnits: 10000,
            averagePrice: 125,
          },
        ],
      };
      
      render(<StockValueCalculator valueData={largeValueData} />);
      
      // Value appears twice (header card + table cell), so use getAllByText
      expect(screen.getAllByText('₱1,250,000.00').length).toBeGreaterThanOrEqual(1);
      // Category name appears twice (table + highest value summary), so use getAllByText
      expect(screen.getAllByText('Test Category').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible table structure', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
    });

    it('should have accessible labels for export button', () => {
      render(<StockValueCalculator valueData={mockValueData} />);
      
      expect(screen.getByLabelText('Export inventory value to CSV')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single category', () => {
      const singleCategoryData: InventoryValue = {
        totalValue: 10000,
        totalUnits: 100,
        categoriesValue: [
          {
            categoryId: 'cat-1',
            categoryName: 'Only Category',
            totalValue: 10000,
            totalUnits: 100,
            averagePrice: 100,
          },
        ],
      };
      
      render(<StockValueCalculator valueData={singleCategoryData} />);
      
      // Category name appears twice (table + highest value summary), so use getAllByText
      expect(screen.getAllByText('Only Category').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });

    it('should handle very small percentages', () => {
      const unevenData: InventoryValue = {
        totalValue: 100000,
        totalUnits: 1000,
        categoriesValue: [
          {
            categoryId: 'cat-1',
            categoryName: 'Major Category',
            totalValue: 99500,
            totalUnits: 995,
            averagePrice: 100,
          },
          {
            categoryId: 'cat-2',
            categoryName: 'Minor Category',
            totalValue: 500,
            totalUnits: 5,
            averagePrice: 100,
          },
        ],
      };
      
      render(<StockValueCalculator valueData={unevenData} />);
      
      expect(screen.getByText('99.5%')).toBeInTheDocument();
      expect(screen.getByText('0.5%')).toBeInTheDocument();
    });

    it('should handle zero units in average calculation', () => {
      const zeroUnitsData: InventoryValue = {
        totalValue: 0,
        totalUnits: 0,
        categoriesValue: [],
      };
      
      render(<StockValueCalculator valueData={zeroUnitsData} />);
      
      // Should show empty state, not divide by zero error
      expect(screen.getByText('No Inventory Data')).toBeInTheDocument();
    });
  });
});
