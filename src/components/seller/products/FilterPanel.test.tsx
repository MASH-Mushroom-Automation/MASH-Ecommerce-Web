/**
 * Unit Tests for FilterPanel Component
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FilterPanel } from './FilterPanel';
import type { ProductFilters, FilterOptions } from '@/types/product-filters';

const mockFilterOptions: FilterOptions = {
  categories: [
    { id: 'cat-1', name: 'Oyster Mushrooms', slug: 'oyster', productCount: 15 },
    { id: 'cat-2', name: 'Shiitake', slug: 'shiitake', productCount: 8 },
    { id: 'cat-3', name: 'Lion\'s Mane', slug: 'lions-mane', productCount: 5 },
  ],
  priceRange: { min: 50, max: 500 },
  stockCounts: { inStock: 20, lowStock: 5, outOfStock: 3 },
  statusCounts: { published: 25, draft: 2, archived: 1 },
};

const defaultFilters: ProductFilters = {
  search: '',
  categories: [],
  priceRange: [50, 500],
  stockStatus: 'all',
  productStatus: 'published',
  dateRange: null,
};

describe('FilterPanel', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Stock Status')).toBeInTheDocument();
    expect(screen.getByText('Product Status')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
  });

  it('should display all categories with counts', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText(/Oyster Mushrooms/)).toBeInTheDocument();
    expect(screen.getByText(/\(15\)/)).toBeInTheDocument();
    expect(screen.getByText(/Shiitake/)).toBeInTheDocument();
    expect(screen.getByText(/\(8\)/)).toBeInTheDocument();
  });

  it('should toggle category selection', async () => {
    const user = userEvent.setup();
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    const checkbox = screen.getByLabelText(/Oyster Mushrooms/);
    await user.click(checkbox);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      categories: ['cat-1'],
    });
  });

  it('should remove category when toggled off', async () => {
    const user = userEvent.setup();
    const filtersWithCategory: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1'],
    };
    
    render(
      <FilterPanel
        filters={filtersWithCategory}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    const checkbox = screen.getByLabelText(/Oyster Mushrooms/);
    await user.click(checkbox);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...filtersWithCategory,
      categories: [],
    });
  });

  it('should display selected category count', () => {
    const filtersWithCategories: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1', 'cat-2'],
    };
    
    render(
      <FilterPanel
        filters={filtersWithCategories}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    // Should show count next to "Categories"
    expect(screen.getByText(/Categories/)).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should display price range values', () => {
    const filtersWithPrice: ProductFilters = {
      ...defaultFilters,
      priceRange: [100, 300],
    };
    
    render(
      <FilterPanel
        filters={filtersWithPrice}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('₱100')).toBeInTheDocument();
    expect(screen.getByText('₱300')).toBeInTheDocument();
  });

  it('should select stock status', async () => {
    const user = userEvent.setup();
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    const inStockRadio = screen.getByLabelText(/In Stock/);
    await user.click(inStockRadio);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      stockStatus: 'in-stock',
    });
  });

  it('should display stock status counts', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    // Check stock counts are displayed
    const inStockLabel = screen.getByText(/In Stock/);
    expect(within(inStockLabel.parentElement!).getByText('(20)')).toBeInTheDocument();
    
    const lowStockLabel = screen.getByText(/Low Stock/);
    expect(within(lowStockLabel.parentElement!).getByText('(5)')).toBeInTheDocument();
  });

  it('should show clear all button when filters are active', () => {
    const activeFilters: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1'],
    };
    
    render(
      <FilterPanel
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should not show clear all button when no filters active', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('should clear all filters except search', async () => {
    const user = userEvent.setup();
    const activeFilters: ProductFilters = {
      search: 'mushroom',
      categories: ['cat-1', 'cat-2'],
      priceRange: [100, 300],
      stockStatus: 'in-stock',
      productStatus: 'draft',
      dateRange: { from: new Date(), to: new Date() },
    };
    
    render(
      <FilterPanel
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: 'mushroom', // Preserved
      categories: [],
      priceRange: [50, 500],
      stockStatus: 'all',
      productStatus: 'published',
      dateRange: null,
    });
  });

  it('should hide clear button when showClearButton is false', () => {
    const activeFilters: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1'],
    };
    
    render(
      <FilterPanel
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
        showClearButton={false}
      />
    );
    
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('should show "No categories available" when empty', () => {
    const emptyFilterOptions: FilterOptions = {
      ...mockFilterOptions,
      categories: [],
    };
    
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={emptyFilterOptions}
      />
    );
    
    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
        className="custom-class"
      />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should render accordion sections', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    // All accordion sections should be present
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Stock Status')).toBeInTheDocument();
    expect(screen.getByText('Product Status')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
  });

  it('should handle price range at boundaries', () => {
    const filtersWithMaxPrice: ProductFilters = {
      ...defaultFilters,
      priceRange: [50, Infinity],
    };
    
    render(
      <FilterPanel
        filters={filtersWithMaxPrice}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    // Should display max price from filterOptions instead of Infinity
    expect(screen.getByText('₱500')).toBeInTheDocument();
  });

  it('should display product status dropdown with counts', () => {
    render(
      <FilterPanel
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        filterOptions={mockFilterOptions}
      />
    );
    
    // Dropdown should be present (select trigger)
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toBeInTheDocument();
  });
});
