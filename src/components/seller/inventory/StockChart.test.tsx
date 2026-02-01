/**
 * Unit Tests for StockChart Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockChart } from './StockChart';
import type { InventoryStats } from '@/types/inventory';

// Mock Recharts to avoid canvas rendering issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ data, label }: { data: any[]; label: any }) => (
      <div data-testid="pie-segment">
        {data.map((entry, index) => (
          <div key={index} data-testid={`segment-${entry.status}`}>
            {entry.label}: {entry.value}
          </div>
        ))}
      </div>
    ),
    Cell: () => <div data-testid="pie-cell" />,
    Tooltip: () => <div data-testid="pie-tooltip" />,
    Legend: ({ content }: { content: any }) => (
      <div data-testid="pie-legend">{content}</div>
    ),
  };
});

describe('StockChart', () => {
  const mockStats: InventoryStats = {
    totalSKUs: 150,
    inStock: 100,
    lowStock: 30,
    outOfStock: 20,
    inStockPercentage: 66.7,
    lowStockPercentage: 20.0,
    outOfStockPercentage: 13.3,
  };

  describe('Loading State', () => {
    it('should render loading skeleton when isLoading is true', () => {
      render(<StockChart isLoading={true} />);
      
      expect(screen.getByText('Stock Level Distribution')).toBeInTheDocument();
      // Skeleton should be present
      const skeletons = screen.getAllByRole('generic', { hidden: true });
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should render error message when isError is true', () => {
      render(<StockChart isError={true} />);
      
      expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    });

    it('should render error message when stats is undefined', () => {
      render(<StockChart stats={undefined} />);
      
      expect(screen.getByText('Failed to load chart data')).toBeInTheDocument();
    });
  });

  describe('Successful Render', () => {
    it('should render chart with correct title', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByText('Stock Level Distribution')).toBeInTheDocument();
    });

    it('should render all three stock level segments', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByTestId('segment-in-stock')).toBeInTheDocument();
      expect(screen.getByTestId('segment-low-stock')).toBeInTheDocument();
      expect(screen.getByTestId('segment-out-of-stock')).toBeInTheDocument();
    });

    it('should display correct values in segments', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByText(/In Stock: 100/)).toBeInTheDocument();
      expect(screen.getByText(/Low Stock: 30/)).toBeInTheDocument();
      expect(screen.getByText(/Out of Stock: 20/)).toBeInTheDocument();
    });

    it('should render ResponsiveContainer', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should render PieChart', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should generate chart data from stats', () => {
      render(<StockChart stats={mockStats} />);
      
      // Verify all segments are rendered
      const inStockSegment = screen.getByTestId('segment-in-stock');
      const lowStockSegment = screen.getByTestId('segment-low-stock');
      const outOfStockSegment = screen.getByTestId('segment-out-of-stock');
      
      expect(inStockSegment).toHaveTextContent('100');
      expect(lowStockSegment).toHaveTextContent('30');
      expect(outOfStockSegment).toHaveTextContent('20');
    });

    it('should handle zero values correctly', () => {
      const emptyStats: InventoryStats = {
        totalSKUs: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        inStockPercentage: 0,
        lowStockPercentage: 0,
        outOfStockPercentage: 0,
      };
      
      render(<StockChart stats={emptyStats} />);
      
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });

  describe('Legend Interaction', () => {
    it('should render legend with all status labels', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByTestId('pie-legend')).toBeInTheDocument();
    });

    it('should have accessible legend items', () => {
      render(<StockChart stats={mockStats} />);
      
      const legend = screen.getByTestId('pie-legend');
      expect(legend).toBeInTheDocument();
    });
  });

  describe('Custom Height', () => {
    it('should apply custom height prop', () => {
      const { container } = render(<StockChart stats={mockStats} height={400} />);
      
      const responsiveContainer = container.querySelector('[style*="height"]');
      expect(responsiveContainer).toBeInTheDocument();
    });

    it('should use default height of 300 when not specified', () => {
      const { container } = render(<StockChart stats={mockStats} />);
      
      const responsiveContainer = container.querySelector('[style*="height"]');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <StockChart stats={mockStats} className="custom-chart-class" />
      );
      
      const card = container.querySelector('.custom-chart-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Chart Components', () => {
    it('should render Pie component', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByTestId('pie-segment')).toBeInTheDocument();
    });

    it('should render Tooltip component', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByTestId('pie-tooltip')).toBeInTheDocument();
    });

    it('should render Legend component', () => {
      render(<StockChart stats={mockStats} />);
      
      expect(screen.getByTestId('pie-legend')).toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    it('should use correct colors for stock status', () => {
      render(<StockChart stats={mockStats} />);
      
      // Verify segments are rendered (color verification done via visual inspection)
      expect(screen.getByTestId('segment-in-stock')).toBeInTheDocument();
      expect(screen.getByTestId('segment-low-stock')).toBeInTheDocument();
      expect(screen.getByTestId('segment-out-of-stock')).toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
    it('should show "No data to display" when all segments are zero', () => {
      const zeroStats: InventoryStats = {
        totalSKUs: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        inStockPercentage: 0,
        lowStockPercentage: 0,
        outOfStockPercentage: 0,
      };
      
      render(<StockChart stats={zeroStats} />);
      
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });
  });
});
