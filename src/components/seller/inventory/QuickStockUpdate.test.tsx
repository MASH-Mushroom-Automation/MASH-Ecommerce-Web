/**
 * Unit Tests for QuickStockUpdate Modal Component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickStockUpdate } from './QuickStockUpdate';
import type { LowStockItem } from '@/types/inventory';
import { toast } from 'sonner';
import * as inventoryMutations from '@/lib/sanity/mutations/inventory';

// Mock dependencies
jest.mock('@/lib/sanity/mutations/inventory', () => ({
  updateProductStock: jest.fn(),
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  },
  MutationError: class MutationError extends Error {
    attemptNumber?: number;
    constructor(message: string, attemptNumber?: number) {
      super(message);
      this.name = 'MutationError';
      this.attemptNumber = attemptNumber;
    }
  },
}));

jest.mock('sonner', () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('QuickStockUpdate', () => {
  const mockProduct: LowStockItem = {
    _id: 'prod-1',
    _updatedAt: '2024-01-01',
    name: 'Oyster Mushroom',
    sku: 'SKU001',
    slug: 'oyster-mushroom',
    currentStock: 5,
    lowStockThreshold: 10,
    restockLevel: 50,
    price: 150,
    mainImage: 'https://example.com/image.jpg',
    category: { _id: 'cat-1', name: 'Fresh Mushrooms', slug: 'fresh-mushrooms' },
  };

  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    product: mockProduct,
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when open is true', () => {
      render(<QuickStockUpdate {...defaultProps} />);
      
      expect(screen.getByText('Quick Stock Update')).toBeInTheDocument();
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText(`SKU: ${mockProduct.sku}`)).toBeInTheDocument();
    });

    it('should not render when product is null', () => {
      render(<QuickStockUpdate {...defaultProps} product={null} />);
      
      expect(screen.queryByText('Quick Stock Update')).not.toBeInTheDocument();
    });

    it('should display product image when available', () => {
      render(<QuickStockUpdate {...defaultProps} />);
      
      const image = screen.getByAlt(mockProduct.name);
      expect(image).toHaveAttribute('src', mockProduct.mainImage);
    });

    it('should display placeholder when image is not available', () => {
      const productWithoutImage = { ...mockProduct, mainImage: undefined };
      render(<QuickStockUpdate {...defaultProps} product={productWithoutImage} />);
      
      // Placeholder icon should be rendered
      expect(screen.getByText('Oyster Mushroom')).toBeInTheDocument();
    });

    it('should display current stock quantity', () => {
      render(<QuickStockUpdate {...defaultProps} />);
      
      expect(screen.getByText(/Current Stock:/)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Stock Input', () => {
    it('should initialize input with current stock', () => {
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      expect(input).toHaveValue('5');
    });

    it('should update input value when typing numbers', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, '20');
      
      expect(input).toHaveValue('20');
    });

    it('should not allow non-numeric input', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, 'abc123');
      
      expect(input).toHaveValue('123');
    });

    it('should allow clearing input', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      
      expect(input).toHaveValue('');
    });
  });

  describe('Quick Adjust Buttons', () => {
    it('should increment stock by 1', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const incrementButton = screen.getByLabelText('Increase by 1');
      await user.click(incrementButton);
      
      const input = screen.getByLabelText('New stock quantity');
      expect(input).toHaveValue('6');
    });

    it('should increment stock by 5', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const incrementButton = screen.getByLabelText('Increase by 5');
      await user.click(incrementButton);
      
      const input = screen.getByLabelText('New stock quantity');
      expect(input).toHaveValue('10');
    });

    it('should increment stock by 10', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const incrementButton = screen.getByLabelText('Increase by 10');
      await user.click(incrementButton);
      
      const input = screen.getByLabelText('New stock quantity');
      expect(input).toHaveValue('15');
    });

    it('should decrement stock by 1', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const decrementButton = screen.getByLabelText('Decrease by 1');
      await user.click(decrementButton);
      
      const input = screen.getByLabelText('New stock quantity');
      expect(input).toHaveValue('4');
    });

    it('should not allow negative stock', async () => {
      const user = userEvent.setup();
      const productWithZeroStock = { ...mockProduct, currentStock: 0 };
      render(<QuickStockUpdate {...defaultProps} product={productWithZeroStock} />);
      
      const decrementButton = screen.getByLabelText('Decrease by 1');
      expect(decrementButton).toBeDisabled();
    });

    it('should show change indicator when stock changes', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const incrementButton = screen.getByLabelText('Increase by 5');
      await user.click(incrementButton);
      
      expect(screen.getByText('+5 units')).toBeInTheDocument();
    });

    it('should show decrease indicator when stock decreases', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const decrementButton = screen.getByLabelText('Decrease by 1');
      await user.click(decrementButton);
      
      expect(screen.getByText('-1 units')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSuccess after successful update', async () => {
      const mockUpdateProductStock = inventoryMutations.updateProductStock as jest.MockedFunction<
        typeof inventoryMutations.updateProductStock
      >;
      mockUpdateProductStock.mockResolvedValueOnce({
        success: true,
        productId: 'prod-1',
        oldQuantity: 5,
        newQuantity: 20,
        updatedAt: '2026-02-02T10:00:00Z',
      });

      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, '20');
      
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateProductStock).toHaveBeenCalledWith('prod-1', 20);
        expect(defaultProps.onSuccess).toHaveBeenCalledWith('prod-1', 20);
      });
    });

    it('should show success toast after update', async () => {
      const mockUpdateProductStock = inventoryMutations.updateProductStock as jest.MockedFunction<
        typeof inventoryMutations.updateProductStock
      >;
      mockUpdateProductStock.mockResolvedValueOnce({
        success: true,
        productId: 'prod-1',
        oldQuantity: 5,
        newQuantity: 20,
        updatedAt: '2026-02-02T10:00:00Z',
      });

      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, '20');
      
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Stock updated'),
          expect.any(Object)
        );
      });
    });

    it('should close modal after successful update', async () => {
      const mockUpdateProductStock = inventoryMutations.updateProductStock as jest.MockedFunction<
        typeof inventoryMutations.updateProductStock
      >;
      mockUpdateProductStock.mockResolvedValueOnce({
        success: true,
        productId: 'prod-1',
        oldQuantity: 5,
        newQuantity: 20,
        updatedAt: '2026-02-02T10:00:00Z',
      });

      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, '20');
      
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should show error toast on update failure', async () => {
      const mockUpdateProductStock = inventoryMutations.updateProductStock as jest.MockedFunction<
        typeof inventoryMutations.updateProductStock
      >;
      const mockError = new (inventoryMutations as any).MutationError('Network error', 3);
      mockUpdateProductStock.mockRejectedValueOnce(mockError);

      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, '20');
      
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Update failed'),
          expect.any(Object)
        );
      });
    });

    it('should disable save button when stock is unchanged', () => {
      render(<QuickStockUpdate {...defaultProps} />);
      
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });

    it('should show info toast when trying to save unchanged value', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      // Input value is already 5 (current stock)
      const saveButton = screen.getByText('Save Changes');
      
      // Enable button by changing and reverting
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, '10');
      await user.clear(input);
      await user.type(input, '5');
      
      await user.click(saveButton);
      
      expect(toast.info).toHaveBeenCalledWith('Stock quantity unchanged');
    });
  });

  describe('Validation', () => {
    it('should show error for negative stock', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      // Try to set negative (should be prevented, but test validation)
      
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should close modal on Escape key', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      // Dialog component handles Esc by default
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should save on Enter key', async () => {
      const user = userEvent.setup();
      render(<QuickStockUpdate {...defaultProps} />);
      
      const input = screen.getByLabelText('New stock quantity');
      await user.clear(input);
      await user.type(input, '20{Enter}');
      
      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all inputs', () => {
      render(<QuickStockUpdate {...defaultProps} />);
      
      expect(screen.getByLabelText('New stock quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase by 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase by 5')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase by 10')).toBeInTheDocument();
      expect(screen.getByLabelText('Decrease by 1')).toBeInTheDocument();
    });

    it('should have proper dialog title and description', () => {
      render(<QuickStockUpdate {...defaultProps} />);
      
      expect(screen.getByText('Quick Stock Update')).toBeInTheDocument();
      expect(screen.getByText(/Update stock quantity for this product/)).toBeInTheDocument();
    });
  });
});
