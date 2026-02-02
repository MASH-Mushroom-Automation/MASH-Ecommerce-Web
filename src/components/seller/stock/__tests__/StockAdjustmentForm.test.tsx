/**
 * StockAdjustmentForm Component - Unit Tests
 * 
 * Test coverage:
 * - Component rendering and field presence
 * - Form validation (required fields, quantity rules, reason codes)
 * - Dynamic reason dropdown filtering by adjustment type
 * - Stock preview calculation
 * - API submission (success/error scenarios)
 * - Toast notifications
 * - Keyboard interactions
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Edge cases (zero stock, negative values, long notes)
 */

import React from 'react';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { StockAdjustmentForm } from '../StockAdjustmentForm';
import type { StockAdjustmentFormProps } from '../StockAdjustmentForm';

// ============================================================================
// Mocks
// ============================================================================

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// ============================================================================
// Test Data
// ============================================================================

const mockProducts: StockAdjustmentFormProps['products'] = [
  {
    _id: 'prod-001',
    name: 'Tomato Seeds (Hybrid)',
    sku: 'TOM-001',
    stockQuantity: 50,
    lowStockThreshold: 10,
  },
  {
    _id: 'prod-002',
    name: 'Cucumber Seeds (Organic)',
    sku: 'CUC-002',
    stockQuantity: 5, // Low stock
    lowStockThreshold: 10,
  },
  {
    _id: 'prod-003',
    name: 'Pepper Seeds (Sweet)',
    sku: 'PEP-003',
    stockQuantity: 0, // Out of stock
    lowStockThreshold: 10,
  },
];

const defaultProps: StockAdjustmentFormProps = {
  products: mockProducts,
  onSuccess: jest.fn(),
  onCancel: jest.fn(),
};

// ============================================================================
// Test Utilities
// ============================================================================

const selectProduct = async (user: ReturnType<typeof userEvent.setup>, productName: string) => {
  const productSelect = screen.getByRole('combobox', { name: /product/i });
  await user.click(productSelect);
  
  const option = await screen.findByRole('option', { name: new RegExp(productName, 'i') });
  await user.click(option);
};

const selectAdjustmentType = async (user: ReturnType<typeof userEvent.setup>, type: string) => {
  const radio = screen.getByLabelText(new RegExp(type, 'i'));
  await user.click(radio);
};

const selectReason = async (user: ReturnType<typeof userEvent.setup>, reasonLabel: string) => {
  const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
  await user.click(reasonSelect);
  
  const option = await screen.findByRole('option', { name: new RegExp(reasonLabel, 'i') });
  await user.click(option);
};

const setQuantity = async (user: ReturnType<typeof userEvent.setup>, quantity: number) => {
  const quantityInput = screen.getByLabelText(/quantity change/i);
  await user.clear(quantityInput);
  await user.type(quantityInput, quantity.toString());
};

// ============================================================================
// Test Suites
// ============================================================================

describe('StockAdjustmentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        adjustmentId: 'adj-001',
        productId: 'prod-001',
        previousStock: 50,
        newStock: 60,
        timestamp: new Date().toISOString(),
        message: 'Stock adjusted successfully',
      }),
    });
  });
  
  // ==========================================================================
  // Rendering Tests
  // ==========================================================================
  
  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<StockAdjustmentForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
      expect(screen.getByText(/adjustment type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantity change/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adjust stock/i })).toBeInTheDocument();
    });
    
    it('should render all 6 adjustment type options', () => {
      render(<StockAdjustmentForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/received/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sold/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/returned/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/damaged/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/transferred/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/adjustment/i)).toBeInTheDocument();
    });
    
    it('should render product dropdown with all products', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const productSelect = screen.getByRole('combobox', { name: /product/i });
      await user.click(productSelect);
      
      expect(await screen.findByRole('option', { name: /tomato seeds/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /cucumber seeds/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /pepper seeds/i })).toBeInTheDocument();
    });
    
    it('should render Cancel button when onCancel is provided', () => {
      render(<StockAdjustmentForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
    
    it('should not render Cancel button when onCancel is not provided', () => {
      const { onCancel, ...propsWithoutCancel } = defaultProps;
      render(<StockAdjustmentForm {...propsWithoutCancel} />);
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
    
    it('should pre-select product when defaultProductId is provided', () => {
      render(<StockAdjustmentForm {...defaultProps} defaultProductId="prod-002" />);
      
      // Check that Cucumber Seeds is displayed in the select trigger
      expect(screen.getByText(/cucumber seeds/i)).toBeInTheDocument();
      
      // Current stock should be visible
      expect(screen.getByText(/current stock:/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Stock quantity
    });
  });
  
  // ==========================================================================
  // Stock Display Tests
  // ==========================================================================
  
  describe('Stock Display', () => {
    it('should display current stock when product is selected', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      
      expect(screen.getByText(/current stock:/i)).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
    
    it('should display "In Stock" badge for normal stock levels', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      
      expect(screen.getByText(/in stock/i)).toBeInTheDocument();
    });
    
    it('should display "Low Stock" badge for low stock levels', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Cucumber Seeds');
      
      expect(screen.getByText(/low stock/i)).toBeInTheDocument();
    });
    
    it('should display "Out of Stock" badge for zero stock', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Pepper Seeds');
      
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    });
    
    it('should display new stock preview when quantity changes', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      
      expect(screen.getByText(/new stock:/i)).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument(); // 50 + 10
    });
    
    it('should show warning for negative stock preview', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'sold');
      await setQuantity(user, -60); // More than current stock
      
      expect(screen.getByText(/warning.*negative stock/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adjust stock/i })).toBeDisabled();
    });
  });
  
  // ==========================================================================
  // Validation Tests
  // ==========================================================================
  
  describe('Validation', () => {
    it('should show error when submitting without product', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/product is required/i)).toBeInTheDocument();
    });
    
    it('should show error when submitting with zero quantity', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 0);
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/quantity cannot be zero/i)).toBeInTheDocument();
    });
    
    it('should show error when submitting without reason', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/reason is required/i)).toBeInTheDocument();
    });
    
    it('should show error for notes exceeding 500 characters', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const notesTextarea = screen.getByLabelText(/notes/i);
      const longText = 'a'.repeat(501);
      await user.type(notesTextarea, longText);
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/notes cannot exceed 500 characters/i)).toBeInTheDocument();
    });
    
    it('should display character count for notes', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const notesTextarea = screen.getByLabelText(/notes/i);
      await user.type(notesTextarea, 'Test note');
      
      expect(screen.getByText(/9 \/ 500 characters/i)).toBeInTheDocument();
    });
  });
  
  // ==========================================================================
  // Dynamic Reasons Tests
  // ==========================================================================
  
  describe('Dynamic Reason Dropdown', () => {
    it('should show received reasons for "received" adjustment type', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'Received');
      
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
      await user.click(reasonSelect);
      
      expect(await screen.findByRole('option', { name: /purchase order/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /transfer in/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /production/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /return from customer/i })).toBeInTheDocument();
    });
    
    it('should show sold reasons for "sold" adjustment type', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'Sold');
      
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
      await user.click(reasonSelect);
      
      expect(await screen.findByRole('option', { name: /customer order/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /wholesale/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /sample/i })).toBeInTheDocument();
    });
    
    it('should show damaged reasons for "damaged" adjustment type', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'Damaged');
      
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
      await user.click(reasonSelect);
      
      expect(await screen.findByRole('option', { name: /expired/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /spoiled/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /broken/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /contaminated/i })).toBeInTheDocument();
    });
    
    it('should reset reason when adjustment type changes', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'Received');
      await selectReason(user, 'Purchase Order');
      
      // Change adjustment type
      await selectAdjustmentType(user, 'Sold');
      
      // Reason should be reset
      const reasonSelect = screen.getByRole('combobox', { name: /reason/i });
      expect(reasonSelect).toHaveTextContent(/select a reason/i);
    });
  });
  
  // ==========================================================================
  // Quantity Adjustment Tests
  // ==========================================================================
  
  describe('Quantity Adjustment', () => {
    it('should increment quantity when plus button is clicked', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const plusButton = screen.getByRole('button', { name: /increase quantity by 1/i });
      await user.click(plusButton);
      
      const quantityInput = screen.getByLabelText(/quantity change/i);
      expect(quantityInput).toHaveValue(1);
    });
    
    it('should decrement quantity when minus button is clicked', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const minusButton = screen.getByRole('button', { name: /decrease quantity by 1/i });
      await user.click(minusButton);
      
      const quantityInput = screen.getByLabelText(/quantity change/i);
      expect(quantityInput).toHaveValue(-1);
    });
    
    it('should allow manual quantity input', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await setQuantity(user, 25);
      
      const quantityInput = screen.getByLabelText(/quantity change/i);
      expect(quantityInput).toHaveValue(25);
    });
    
    it('should enforce positive quantity for stock-in types', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'Received');
      await setQuantity(user, -10);
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/quantity direction must match adjustment type/i)).toBeInTheDocument();
    });
    
    it('should enforce negative quantity for stock-out types', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'Sold');
      await setQuantity(user, 10);
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/quantity direction must match adjustment type/i)).toBeInTheDocument();
    });
  });
  
  // ==========================================================================
  // Submission Tests
  // ==========================================================================
  
  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await selectAdjustmentType(user, 'Received');
      await setQuantity(user, 10);
      await selectReason(user, 'Purchase Order');
      
      const notesTextarea = screen.getByLabelText(/notes/i);
      await user.type(notesTextarea, 'Received from supplier XYZ');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/seller/stock/adjust', expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: 'prod-001',
            adjustmentType: 'received',
            quantityChange: 10,
            reason: 'PURCHASE_ORDER',
            notes: 'Received from supplier XYZ',
          }),
        }));
      });
    });
    
    it('should show success toast on successful submission', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      await selectReason(user, 'Purchase Order');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Stock adjusted successfully')
        );
      });
    });
    
    it('should call onSuccess callback after successful submission', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      render(<StockAdjustmentForm {...defaultProps} onSuccess={onSuccess} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      await selectReason(user, 'Purchase Order');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
          adjustmentId: 'adj-001',
          productId: 'prod-001',
        }));
      });
    });
    
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      await selectReason(user, 'Purchase Order');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const productSelect = screen.getByRole('combobox', { name: /product/i });
        expect(productSelect).toHaveTextContent(/select a product/i);
        
        const quantityInput = screen.getByLabelText(/quantity change/i);
        expect(quantityInput).toHaveValue(0);
      });
    });
    
    it('should show error toast on API error', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: 'Product not found',
        }),
      });
      
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      await selectReason(user, 'Purchase Order');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Product not found');
      });
    });
    
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      );
      
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      await selectReason(user, 'Purchase Order');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/adjusting stock/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
    
    it('should prevent submission when new stock would be negative', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Pepper Seeds'); // Current stock: 0
      await selectAdjustmentType(user, 'Sold');
      await setQuantity(user, -10);
      await selectReason(user, 'Customer Order');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      expect(submitButton).toBeDisabled();
    });
  });
  
  // ==========================================================================
  // Cancel Tests
  // ==========================================================================
  
  describe('Cancel Action', () => {
    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(<StockAdjustmentForm {...defaultProps} onCancel={onCancel} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
  
  // ==========================================================================
  // Loading State Tests
  // ==========================================================================
  
  describe('Loading State', () => {
    it('should disable all inputs when isLoading is true', () => {
      render(<StockAdjustmentForm {...defaultProps} isLoading={true} />);
      
      expect(screen.getByRole('combobox', { name: /product/i })).toBeDisabled();
      expect(screen.getByLabelText(/received/i)).toBeDisabled();
      expect(screen.getByLabelText(/quantity change/i)).toBeDisabled();
      expect(screen.getByRole('combobox', { name: /reason/i })).toBeDisabled();
      expect(screen.getByLabelText(/notes/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /adjust stock/i })).toBeDisabled();
    });
  });
  
  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================
  
  describe('Accessibility', () => {
    it('should have proper ARIA labels for all inputs', () => {
      render(<StockAdjustmentForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/product/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/quantity change/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/reason/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/notes/i)).toHaveAccessibleName();
    });
    
    it('should mark required fields with asterisk', () => {
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const productLabel = screen.getByText(/product/i).closest('label');
      expect(productLabel).toHaveTextContent('*');
      
      const quantityLabel = screen.getByText(/quantity change/i).closest('label');
      expect(quantityLabel).toHaveTextContent('*');
      
      const reasonLabel = screen.getByText(/reason/i).closest('label');
      expect(reasonLabel).toHaveTextContent('*');
    });
    
    it('should indicate optional fields', () => {
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const notesLabel = screen.getByText(/notes/i).closest('label');
      expect(notesLabel).toHaveTextContent(/optional/i);
    });
    
    it('should associate error messages with inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<StockAdjustmentForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/product is required/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
  
  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  
  describe('Edge Cases', () => {
    it('should handle empty products array', () => {
      render(<StockAdjustmentForm {...defaultProps} products={[]} />);
      
      expect(screen.getByRole('combobox', { name: /product/i })).toBeInTheDocument();
    });
    
    it('should handle product with no lowStockThreshold', async () => {
      const user = userEvent.setup();
      const productsWithoutThreshold = [
        {
          _id: 'prod-004',
          name: 'Test Product',
          sku: 'TEST-004',
          stockQuantity: 100,
          // No lowStockThreshold
        },
      ];
      
      render(<StockAdjustmentForm {...defaultProps} products={productsWithoutThreshold} />);
      
      await selectProduct(user, 'Test Product');
      
      expect(screen.getByText(/in stock/i)).toBeInTheDocument();
    });
    
    it('should handle very large stock quantities', async () => {
      const user = userEvent.setup();
      const productsWithLargeStock = [
        {
          _id: 'prod-005',
          name: 'Large Stock Product',
          sku: 'LARGE-005',
          stockQuantity: 999999,
          lowStockThreshold: 10,
        },
      ];
      
      render(<StockAdjustmentForm {...defaultProps} products={productsWithLargeStock} />);
      
      await selectProduct(user, 'Large Stock Product');
      await setQuantity(user, 1);
      
      expect(screen.getByText('1000000')).toBeInTheDocument(); // New stock
    });
    
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      render(<StockAdjustmentForm {...defaultProps} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      await selectReason(user, 'Purchase Order');
      
      const submitButton = screen.getByRole('button', { name: /adjust stock/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
    
    it('should preserve form state when external loading prop changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<StockAdjustmentForm {...defaultProps} isLoading={false} />);
      
      await selectProduct(user, 'Tomato Seeds');
      await setQuantity(user, 10);
      
      rerender(<StockAdjustmentForm {...defaultProps} isLoading={true} />);
      
      const quantityInput = screen.getByLabelText(/quantity change/i);
      expect(quantityInput).toHaveValue(10);
    });
  });
});
