/**
 * Unit Tests for FilterChips Component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FilterChips } from './FilterChips';
import type { ProductFilters, FilterOptions } from '@/types/product-filters';

const mockFilterOptions: FilterOptions = {
  categories: [
    { id: 'cat-1', name: 'Oyster Mushrooms', slug: 'oyster', productCount: 15 },
    { id: 'cat-2', name: 'Shiitake', slug: 'shiitake', productCount: 8 },
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

describe('FilterChips', () => {
  const mockOnRemoveFilter = jest.fn();
  const mockOnClearAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when no active filters', () => {
    const { container } = render(
      <FilterChips
        filters={defaultFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should display category chips', () => {
    const filtersWithCategories: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1', 'cat-2'],
    };
    
    render(
      <FilterChips
        filters={filtersWithCategories}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('Category: Oyster Mushrooms')).toBeInTheDocument();
    expect(screen.getByText('Category: Shiitake')).toBeInTheDocument();
  });

  it('should display price range chip', () => {
    const filtersWithPrice: ProductFilters = {
      ...defaultFilters,
      priceRange: [100, 300],
    };
    
    render(
      <FilterChips
        filters={filtersWithPrice}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('Price: ₱100 - ₱300')).toBeInTheDocument();
  });

  it('should not display price chip for default range', () => {
    render(
      <FilterChips
        filters={defaultFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.queryByText(/Price:/)).not.toBeInTheDocument();
  });

  it('should display stock status chip', () => {
    const filtersWithStock: ProductFilters = {
      ...defaultFilters,
      stockStatus: 'in-stock',
    };
    
    render(
      <FilterChips
        filters={filtersWithStock}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('Stock: In Stock')).toBeInTheDocument();
  });

  it('should not display stock status chip for "all"', () => {
    render(
      <FilterChips
        filters={defaultFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.queryByText(/Stock:/)).not.toBeInTheDocument();
  });

  it('should display product status chip', () => {
    const filtersWithStatus: ProductFilters = {
      ...defaultFilters,
      productStatus: 'draft',
    };
    
    render(
      <FilterChips
        filters={filtersWithStatus}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('Status: Draft')).toBeInTheDocument();
  });

  it('should not display product status chip for "published"', () => {
    render(
      <FilterChips
        filters={defaultFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.queryByText(/Status:/)).not.toBeInTheDocument();
  });

  it('should display date range chip', () => {
    const filtersWithDate: ProductFilters = {
      ...defaultFilters,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      },
    };
    
    render(
      <FilterChips
        filters={filtersWithDate}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 31, 2024/)).toBeInTheDocument();
  });

  it('should call onRemoveFilter when category chip removed', async () => {
    const user = userEvent.setup();
    const filtersWithCategories: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1'],
    };
    
    render(
      <FilterChips
        filters={filtersWithCategories}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    const removeButton = screen.getByLabelText('Remove Category: Oyster Mushrooms filter');
    await user.click(removeButton);
    
    expect(mockOnRemoveFilter).toHaveBeenCalledWith('categories', 'cat-1');
  });

  it('should call onRemoveFilter when price chip removed', async () => {
    const user = userEvent.setup();
    const filtersWithPrice: ProductFilters = {
      ...defaultFilters,
      priceRange: [100, 300],
    };
    
    render(
      <FilterChips
        filters={filtersWithPrice}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    const removeButton = screen.getByLabelText('Remove Price: ₱100 - ₱300 filter');
    await user.click(removeButton);
    
    expect(mockOnRemoveFilter).toHaveBeenCalledWith('priceRange', undefined);
  });

  it('should call onRemoveFilter when stock status chip removed', async () => {
    const user = userEvent.setup();
    const filtersWithStock: ProductFilters = {
      ...defaultFilters,
      stockStatus: 'low-stock',
    };
    
    render(
      <FilterChips
        filters={filtersWithStock}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    const removeButton = screen.getByLabelText('Remove Stock: Low Stock filter');
    await user.click(removeButton);
    
    expect(mockOnRemoveFilter).toHaveBeenCalledWith('stockStatus', undefined);
  });

  it('should show "Clear all" button when multiple filters active', () => {
    const multipleFilters: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1'],
      stockStatus: 'in-stock',
    };
    
    render(
      <FilterChips
        filters={multipleFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
  });

  it('should not show "Clear all" button with only one filter', () => {
    const singleFilter: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1'],
    };
    
    render(
      <FilterChips
        filters={singleFilter}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
  });

  it('should call onClearAll when clear all button clicked', async () => {
    const user = userEvent.setup();
    const multipleFilters: ProductFilters = {
      ...defaultFilters,
      categories: ['cat-1', 'cat-2'],
      stockStatus: 'in-stock',
    };
    
    render(
      <FilterChips
        filters={multipleFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    const clearAllButton = screen.getByText('Clear all filters');
    await user.click(clearAllButton);
    
    expect(mockOnClearAll).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FilterChips
        filters={{ ...defaultFilters, categories: ['cat-1'] }}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
        className="custom-class"
      />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should display all active chips simultaneously', () => {
    const allFilters: ProductFilters = {
      search: 'mushroom',
      categories: ['cat-1', 'cat-2'],
      priceRange: [100, 300],
      stockStatus: 'low-stock',
      productStatus: 'draft',
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      },
    };
    
    render(
      <FilterChips
        filters={allFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    // Should display all chip types
    expect(screen.getByText('Category: Oyster Mushrooms')).toBeInTheDocument();
    expect(screen.getByText('Category: Shiitake')).toBeInTheDocument();
    expect(screen.getByText(/Price:/)).toBeInTheDocument();
    expect(screen.getByText('Stock: Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Status: Draft')).toBeInTheDocument();
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
  });

  it('should handle missing category gracefully', () => {
    const filtersWithInvalidCategory: ProductFilters = {
      ...defaultFilters,
      categories: ['invalid-id'],
    };
    
    render(
      <FilterChips
        filters={filtersWithInvalidCategory}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    // Should not crash, and should render nothing
    expect(screen.queryByText(/Category:/)).not.toBeInTheDocument();
  });

  it('should handle Infinity price correctly', () => {
    const filtersWithInfinityPrice: ProductFilters = {
      ...defaultFilters,
      priceRange: [100, Infinity],
    };
    
    render(
      <FilterChips
        filters={filtersWithInfinityPrice}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        filterOptions={mockFilterOptions}
      />
    );
    
    // Should use max price from filterOptions
    expect(screen.getByText('Price: ₱100 - ₱500')).toBeInTheDocument();
  });
});
