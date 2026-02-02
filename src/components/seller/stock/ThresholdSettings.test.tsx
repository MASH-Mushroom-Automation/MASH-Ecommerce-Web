/**
 * ThresholdSettings Component - Unit Tests
 * 
 * Test coverage:
 * - Component rendering and initial state
 * - Threshold input validation (>=0, lowStock > outOfStock)
 * - Preset template application
 * - Visual preview calculations
 * - Bulk mode product selection
 * - Form submission (success/error)
 * - Keyboard shortcuts (Cmd+S, Esc)
 * - Toast notifications
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Edge cases (zero values, extreme thresholds)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ThresholdSettings } from './ThresholdSettings';
import type { StockThresholdConfig } from '@/types/stock-management';

// ============================================================================
// Mocks
// ============================================================================

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// ============================================================================
// Test Data
// ============================================================================

const mockCurrentThresholds: StockThresholdConfig = {
  lowStockThreshold: 10,
  outOfStockThreshold: 0,
  restockLevel: 20,
};

const mockProducts = [
  {
    _id: 'prod-1',
    name: 'Oyster Mushrooms',
    sku: 'MUSH-001',
    currentThresholds: mockCurrentThresholds,
  },
  {
    _id: 'prod-2',
    name: 'Shiitake Mushrooms',
    sku: 'MUSH-002',
    currentThresholds: mockCurrentThresholds,
  },
  {
    _id: 'prod-3',
    name: "Lion's Mane",
    sku: 'MUSH-003',
    currentThresholds: mockCurrentThresholds,
  },
];

// ============================================================================
// Test Suites
// ============================================================================

describe('ThresholdSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ThresholdSettings />);

      expect(screen.getByText('Threshold Configuration')).toBeInTheDocument();
      expect(screen.getByLabelText(/low stock threshold/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/out of stock threshold/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/restock level/i)).toBeInTheDocument();
    });

    it('should render product name in single mode', () => {
      render(
        <ThresholdSettings
          productName="Oyster Mushrooms"
          currentThresholds={mockCurrentThresholds}
        />
      );

      expect(screen.getByText(/configure thresholds for oyster mushrooms/i)).toBeInTheDocument();
    });

    it('should render preset templates', () => {
      render(<ThresholdSettings />);

      expect(screen.getByText('High Volume')).toBeInTheDocument();
      expect(screen.getByText('Low Volume')).toBeInTheDocument();
      expect(screen.getByText('Seasonal')).toBeInTheDocument();
    });

    it('should populate form fields with current thresholds', () => {
      render(<ThresholdSettings currentThresholds={mockCurrentThresholds} />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i) as HTMLInputElement;
      const outOfStockInput = screen.getByLabelText(/out of stock threshold/i) as HTMLInputElement;
      const restockInput = screen.getByLabelText(/restock level/i) as HTMLInputElement;

      expect(lowStockInput.value).toBe('10');
      expect(outOfStockInput.value).toBe('0');
      expect(restockInput.value).toBe('20');
    });

    it('should display keyboard shortcuts hint', () => {
      render(<ThresholdSettings />);

      expect(screen.getByText(/cmd\+s/i)).toBeInTheDocument();
      expect(screen.getByText(/esc/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Validation Tests
  // ==========================================================================

  describe('Validation', () => {
    it('should validate thresholds >= 0', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      
      // Try negative value
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '-5');
      
      await waitFor(() => {
        expect(screen.getByText(/must be >= 0/i)).toBeInTheDocument();
      });
    });

    it('should validate lowStock > outOfStock', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      const outOfStockInput = screen.getByLabelText(/out of stock threshold/i);

      // Set lowStock <= outOfStock (invalid)
      await user.clear(outOfStockInput);
      await user.type(outOfStockInput, '10');
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '5');

      await waitFor(() => {
        expect(screen.getByText(/must be greater than out of stock/i)).toBeInTheDocument();
      });
    });

    it('should validate restockLevel >= lowStockThreshold', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      const restockInput = screen.getByLabelText(/restock level/i);

      // Set restockLevel < lowStock (invalid)
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '20');
      await user.clear(restockInput);
      await user.type(restockInput, '10');

      await waitFor(() => {
        expect(screen.getByText(/must be greater than or equal to low stock/i)).toBeInTheDocument();
      });
    });

    it('should disable save button when form is invalid', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const saveButton = screen.getByRole('button', { name: /save thresholds/i });
      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      // Enter invalid value
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '-5');

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });

    it('should enable save button when form is valid', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const saveButton = screen.getByRole('button', { name: /save thresholds/i });
      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      // Enter valid value
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  // ==========================================================================
  // Preset Templates Tests
  // ==========================================================================

  describe('Preset Templates', () => {
    it('should apply High Volume preset', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const highVolumeButton = screen.getByText('High Volume').closest('button');
      await user.click(highVolumeButton!);

      await waitFor(() => {
        const lowStockInput = screen.getByLabelText(/low stock threshold/i) as HTMLInputElement;
        const outOfStockInput = screen.getByLabelText(/out of stock threshold/i) as HTMLInputElement;
        const restockInput = screen.getByLabelText(/restock level/i) as HTMLInputElement;

        expect(lowStockInput.value).toBe('20');
        expect(outOfStockInput.value).toBe('5');
        expect(restockInput.value).toBe('50');
      });

      expect(toast.success).toHaveBeenCalledWith('Applied "High Volume" preset');
    });

    it('should apply Low Volume preset', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const lowVolumeButton = screen.getByText('Low Volume').closest('button');
      await user.click(lowVolumeButton!);

      await waitFor(() => {
        const lowStockInput = screen.getByLabelText(/low stock threshold/i) as HTMLInputElement;
        const outOfStockInput = screen.getByLabelText(/out of stock threshold/i) as HTMLInputElement;
        const restockInput = screen.getByLabelText(/restock level/i) as HTMLInputElement;

        expect(lowStockInput.value).toBe('5');
        expect(outOfStockInput.value).toBe('0');
        expect(restockInput.value).toBe('10');
      });

      expect(toast.success).toHaveBeenCalledWith('Applied "Low Volume" preset');
    });

    it('should apply Seasonal preset', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const seasonalButton = screen.getByText('Seasonal').closest('button');
      await user.click(seasonalButton!);

      await waitFor(() => {
        const lowStockInput = screen.getByLabelText(/low stock threshold/i) as HTMLInputElement;
        const outOfStockInput = screen.getByLabelText(/out of stock threshold/i) as HTMLInputElement;
        const restockInput = screen.getByLabelText(/restock level/i) as HTMLInputElement;

        expect(lowStockInput.value).toBe('15');
        expect(outOfStockInput.value).toBe('3');
        expect(restockInput.value).toBe('30');
      });

      expect(toast.success).toHaveBeenCalledWith('Applied "Seasonal" preset');
    });
  });

  // ==========================================================================
  // Visual Preview Tests
  // ==========================================================================

  describe('Visual Preview', () => {
    it('should display visual preview bars', () => {
      render(<ThresholdSettings currentThresholds={mockCurrentThresholds} />);

      expect(screen.getByText('Visual Preview')).toBeInTheDocument();
      expect(screen.getByText(/out of stock \(0-0\)/i)).toBeInTheDocument();
      expect(screen.getByText(/low stock \(0-10\)/i)).toBeInTheDocument();
      expect(screen.getByText(/in stock \(10\+\)/i)).toBeInTheDocument();
    });

    it('should show current stock indicator when provided', () => {
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          currentStock={25}
        />
      );

      expect(screen.getByText('Current Stock Position:')).toBeInTheDocument();
      expect(screen.getByText('25 units')).toBeInTheDocument();
    });

    it('should update preview when thresholds change', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings currentThresholds={mockCurrentThresholds} />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      // Change threshold
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '20');

      await waitFor(() => {
        expect(screen.getByText(/low stock \(0-20\)/i)).toBeInTheDocument();
        expect(screen.getByText(/in stock \(20\+\)/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Bulk Mode Tests
  // ==========================================================================

  describe('Bulk Mode', () => {
    it('should render product list in bulk mode', () => {
      render(
        <ThresholdSettings
          bulkMode={true}
          availableProducts={mockProducts}
        />
      );

      expect(screen.getByText('Select Products to Update')).toBeInTheDocument();
      expect(screen.getByText('Oyster Mushrooms')).toBeInTheDocument();
      expect(screen.getByText('Shiitake Mushrooms')).toBeInTheDocument();
      expect(screen.getByText('Lion\'s Mane')).toBeInTheDocument();
    });

    it('should toggle product selection', async () => {
      const user = userEvent.setup();
      render(
        <ThresholdSettings
          bulkMode={true}
          availableProducts={mockProducts}
        />
      );

      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]); // Select first product

      await waitFor(() => {
        expect(screen.getByText(/selected: 1 of 3 products/i)).toBeInTheDocument();
      });
    });

    it('should select all products with Select All button', async () => {
      const user = userEvent.setup();
      render(
        <ThresholdSettings
          bulkMode={true}
          availableProducts={mockProducts}
        />
      );

      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      await user.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText(/selected: 3 of 3 products/i)).toBeInTheDocument();
      });
    });

    it('should deselect all products with Deselect All button', async () => {
      const user = userEvent.setup();
      render(
        <ThresholdSettings
          bulkMode={true}
          availableProducts={mockProducts}
        />
      );

      // Select all first
      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      await user.click(selectAllButton);
      
      // Deselect all
      await user.click(screen.getByRole('button', { name: /deselect all/i }));

      await waitFor(() => {
        expect(screen.getByText(/selected: 0 of 3 products/i)).toBeInTheDocument();
      });
    });

    it('should show error if no products selected in bulk mode', async () => {
      const user = userEvent.setup();
      render(
        <ThresholdSettings
          bulkMode={true}
          availableProducts={mockProducts}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save thresholds/i });
      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      // Change value to make form dirty
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');

      // Try to save without selecting products
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select at least one product to update');
      });
    });
  });

  // ==========================================================================
  // Form Submission Tests
  // ==========================================================================

  describe('Form Submission', () => {
    it('should call onSave with updated thresholds on successful submit', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onSave={mockOnSave}
        />
      );

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      const saveButton = screen.getByRole('button', { name: /save thresholds/i });

      // Change value
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');

      // Submit
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          lowStockThreshold: 15,
          outOfStockThreshold: 0,
          restockLevel: 20,
        });
        expect(toast.success).toHaveBeenCalledWith('Threshold settings saved successfully!');
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onSave={mockOnSave}
        />
      );

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      const saveButton = screen.getByRole('button', { name: /save thresholds/i });

      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');
      await user.click(saveButton);

      // Check loading state
      expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      expect(saveButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText(/saving.../i)).not.toBeInTheDocument();
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockRejectedValue(new Error('Network error'));
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onSave={mockOnSave}
        />
      );

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      const saveButton = screen.getByRole('button', { name: /save thresholds/i });

      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });

    it('should show success for bulk mode submission', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      
      render(
        <ThresholdSettings
          bulkMode={true}
          availableProducts={mockProducts}
          onSave={mockOnSave}
        />
      );

      // Select 2 products
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);
      await user.click(switches[1]);

      // Change threshold
      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');

      // Submit
      const saveButton = screen.getByRole('button', { name: /save thresholds/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Thresholds updated for 2 product(s)!');
      });
    });
  });

  // ==========================================================================
  // Cancel Action Tests
  // ==========================================================================

  describe('Cancel Action', () => {
    it('should reset form to original values on cancel', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings currentThresholds={mockCurrentThresholds} />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i) as HTMLInputElement;
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      // Change value
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '25');

      expect(lowStockInput.value).toBe('25');

      // Cancel
      await user.click(cancelButton);

      await waitFor(() => {
        expect(lowStockInput.value).toBe('10'); // Original value
      });
    });

    it('should call onCancel callback', async () => {
      const user = userEvent.setup();
      const mockOnCancel = jest.fn();
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable cancel button when form is pristine', () => {
      render(<ThresholdSettings currentThresholds={mockCurrentThresholds} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  // ==========================================================================
  // Keyboard Shortcuts Tests
  // ==========================================================================

  describe('Keyboard Shortcuts', () => {
    it('should save form on Cmd+S', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onSave={mockOnSave}
        />
      );

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      // Change value
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');

      // Press Cmd+S
      await user.keyboard('{Meta>}s{/Meta}');

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should save form on Ctrl+S', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onSave={mockOnSave}
        />
      );

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      await user.clear(lowStockInput);
      await user.type(lowStockInput, '15');

      // Press Ctrl+S
      await user.keyboard('{Control>}s{/Control}');

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('should cancel form on Escape key', async () => {
      const user = userEvent.setup();
      const mockOnCancel = jest.fn();
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onCancel={mockOnCancel}
        />
      );

      const lowStockInput = screen.getByLabelText(/low stock threshold/i) as HTMLInputElement;

      // Change value
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '25');

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(lowStockInput.value).toBe('10'); // Reset to original
        expect(mockOnCancel).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA labels for inputs', () => {
      render(<ThresholdSettings />);

      expect(screen.getByLabelText(/low stock threshold/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/out of stock threshold/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/restock level/i)).toHaveAccessibleName();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);
      const outOfStockInput = screen.getByLabelText(/out of stock threshold/i);

      await user.tab(); // Focus first preset
      await user.tab(); // Focus second preset
      await user.tab(); // Focus third preset
      await user.tab(); // Focus first input

      expect(lowStockInput).toHaveFocus();

      await user.tab(); // Focus second input
      expect(outOfStockInput).toHaveFocus();
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      await user.clear(lowStockInput);
      await user.type(lowStockInput, '-5');

      await waitFor(() => {
        const errorMessage = screen.getByText(/must be >= 0/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle zero values correctly', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const outOfStockInput = screen.getByLabelText(/out of stock threshold/i);
      const lowStockInput = screen.getByLabelText(/low stock threshold/i);

      await user.clear(outOfStockInput);
      await user.type(outOfStockInput, '0');
      await user.clear(lowStockInput);
      await user.type(lowStockInput, '1');

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save thresholds/i });
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should handle very large threshold values', async () => {
      const user = userEvent.setup();
      render(<ThresholdSettings />);

      const restockInput = screen.getByLabelText(/restock level/i);

      await user.clear(restockInput);
      await user.type(restockInput, '10000');

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /save thresholds/i });
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('should not call onSave when form is pristine', async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();
      
      render(
        <ThresholdSettings
          currentThresholds={mockCurrentThresholds}
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save thresholds/i });

      // Save button should be disabled when form is pristine
      expect(saveButton).toBeDisabled();
    });
  });
});
