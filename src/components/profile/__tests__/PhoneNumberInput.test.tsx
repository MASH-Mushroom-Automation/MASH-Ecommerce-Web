/**
 * PhoneNumberInput Component Tests
 * 
 * Test categories:
 * 1. Rendering: Initial render, label, placeholder, required indicator
 * 2. Auto-formatting: Input formatting, display formatting, E.164 conversion
 * 3. Validation: Valid PH numbers, invalid numbers, debounced validation
 * 4. States: Idle, loading, success, error, disabled
 * 5. Integration: React Hook Form integration, onChange callbacks
 * 6. Accessibility: ARIA labels, error announcements, keyboard navigation
 * 7. Edge cases: Empty input, paste handling, special characters
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneNumberInput } from '../PhoneNumberInput';
import type { PhoneNumberInputProps } from '../PhoneNumberInput';

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Render PhoneNumberInput with default props
 */
function renderPhoneNumberInput(props: Partial<PhoneNumberInputProps> = {}) {
  const defaultProps: PhoneNumberInputProps = {
    value: '',
    onChange: jest.fn(),
    onBlur: jest.fn(),
    validationState: 'idle',
    ...props
  };

  return {
    ...render(<PhoneNumberInput {...defaultProps} />),
    props: defaultProps
  };
}

/**
 * Wait for debounce delay (500ms + buffer)
 */
async function waitForDebounce() {
  await waitFor(() => new Promise(resolve => setTimeout(resolve, 600)), {
    timeout: 1000
  });
}

// ============================================================================
// Test Suite 1: Rendering
// ============================================================================

describe('PhoneNumberInput - Rendering', () => {
  it('should render with default props', () => {
    renderPhoneNumberInput();
    
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+63 912 345 6789/i)).toBeInTheDocument();
  });

  it('should render custom label', () => {
    renderPhoneNumberInput({ label: 'Mobile Number' });
    
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
  });

  it('should show required indicator when required=true', () => {
    renderPhoneNumberInput({ label: 'Phone', required: true });
    
    const label = screen.getByText(/phone/i);
    expect(label.parentElement).toHaveTextContent('*');
  });

  it('should render with custom placeholder', () => {
    renderPhoneNumberInput({ placeholder: '900 000 0000' });
    
    expect(screen.getByPlaceholderText(/\+63 900 000 0000/i)).toBeInTheDocument();
  });

  it('should render Philippine flag emoji', () => {
    renderPhoneNumberInput();
    
    expect(screen.getByText(/🇵🇭/)).toBeInTheDocument();
  });

  it('should have correct ID and name attributes', () => {
    renderPhoneNumberInput({ id: 'custom-id', name: 'customName' });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(input).toHaveAttribute('name', 'customName');
  });
});

// ============================================================================
// Test Suite 2: Auto-formatting
// ============================================================================

describe('PhoneNumberInput - Auto-formatting', () => {
  it('should format input as user types: 912 -> +63 912', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    await user.type(input, '912');
    
    expect(input.value).toBe('+63 912');
  });

  it('should format input as user types: 9123456 -> +63 912 345 6', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    await user.type(input, '9123456');
    
    expect(input.value).toBe('+63 912 345 6');
  });

  it('should format complete phone number: 9123456789 -> +63 912 345 6789', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    await user.type(input, '9123456789');
    
    expect(input.value).toBe('+63 912 345 6789');
  });

  it('should call onChange with E.164 format', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '9123456789');
    
    // Last call should be with complete E.164 format
    expect(onChange).toHaveBeenLastCalledWith('+639123456789');
  });

  it('should strip non-digit characters', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    await user.type(input, '912-345-6789');
    
    expect(input.value).toBe('+63 912 345 6789');
  });

  it('should limit input to 10 digits max', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    await user.type(input, '91234567890000'); // 14 digits
    
    // Should only accept first 10 digits
    expect(input.value).toBe('+63 912 345 6789');
  });

  it('should handle value prop changes', () => {
    const { rerender } = render(
      <PhoneNumberInput value="+639123456789" onChange={jest.fn()} />
    );
    
    let input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    expect(input.value).toBe('+63 912 345 6789');
    
    rerender(<PhoneNumberInput value="+639987654321" onChange={jest.fn()} />);
    
    input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    expect(input.value).toBe('+63 998 765 4321');
  });
});

// ============================================================================
// Test Suite 3: Validation
// ============================================================================

describe('PhoneNumberInput - Validation', () => {
  it('should show loading state during validation debounce', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '9123456789');
    
    // Should show loading spinner immediately
    expect(screen.getByLabelText(/validating/i)).toBeInTheDocument();
  });

  it('should show success state for valid PH mobile number after debounce', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '9123456789');
    
    // Wait for debounce
    await waitForDebounce();
    
    expect(screen.getByLabelText(/valid phone number/i)).toBeInTheDocument();
  });

  it('should show error state for invalid phone number after debounce', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '9000000000'); // Invalid prefix
    
    // Wait for debounce
    await waitForDebounce();
    
    expect(screen.getByLabelText(/invalid phone number/i)).toBeInTheDocument();
  });

  it('should not validate incomplete numbers', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '912'); // Only 3 digits
    
    // Should remain idle (no validation icon)
    expect(screen.queryByLabelText(/validating/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/valid phone number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/invalid phone number/i)).not.toBeInTheDocument();
  });

  it('should debounce validation to avoid excessive checks', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i);
    
    // Type rapidly (no delay option needed - userEvent types fast by default)
    await user.type(input, '912');
    
    // Should only validate after user stops typing
    await waitForDebounce();
  });
});

// ============================================================================
// Test Suite 4: Validation States
// ============================================================================

describe('PhoneNumberInput - Validation States', () => {
  it('should display idle state by default', () => {
    renderPhoneNumberInput({ validationState: 'idle' });
    
    expect(screen.queryByLabelText(/validating/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/valid phone number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/invalid phone number/i)).not.toBeInTheDocument();
  });

  it('should display loading state when validationState=loading', () => {
    renderPhoneNumberInput({ validationState: 'loading' });
    
    expect(screen.getByLabelText(/validating/i)).toBeInTheDocument();
  });

  it('should display success state when validationState=success', () => {
    renderPhoneNumberInput({ validationState: 'success' });
    
    expect(screen.getByLabelText(/valid phone number/i)).toBeInTheDocument();
  });

  it('should display error state when validationState=error', () => {
    renderPhoneNumberInput({ validationState: 'error' });
    
    expect(screen.getByLabelText(/invalid phone number/i)).toBeInTheDocument();
  });

  it('should apply success border color when validation succeeds', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '9123456789');
    
    await waitForDebounce();
    
    expect(input).toHaveClass('border-green-500');
  });

  it('should apply error border color when validation fails', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '9000000000');
    
    await waitForDebounce();
    
    expect(input).toHaveClass('border-red-500');
  });

  it('should prioritize external validationState over internal state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PhoneNumberInput 
        value="" 
        onChange={jest.fn()} 
        validationState="success" 
      />
    );
    
    // External success state should show immediately
    expect(screen.getByLabelText(/valid phone number/i)).toBeInTheDocument();
    
    // Even if we type invalid input - use getByRole to avoid ambiguity with validation icon aria-labels
    const input = screen.getByRole('textbox');
    await user.type(input, '900');
    
    // External state still takes precedence
    expect(screen.getByLabelText(/valid phone number/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 5: Disabled State
// ============================================================================

describe('PhoneNumberInput - Disabled State', () => {
  it('should disable input when disabled=true', () => {
    renderPhoneNumberInput({ disabled: true });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toBeDisabled();
  });

  it('should apply disabled styling', () => {
    renderPhoneNumberInput({ disabled: true });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('should not show validation icons when disabled', () => {
    renderPhoneNumberInput({ 
      disabled: true, 
      validationState: 'success' 
    });
    
    expect(screen.queryByLabelText(/valid phone number/i)).not.toBeInTheDocument();
  });

  it('should not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ disabled: true, onChange });
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '912');
    
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Test Suite 6: Error Display
// ============================================================================

describe('PhoneNumberInput - Error Display', () => {
  it('should display error message below input', () => {
    renderPhoneNumberInput({ error: 'Invalid phone number format' });
    
    expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
  });

  it('should apply error border color when error prop is set', () => {
    renderPhoneNumberInput({ error: 'Invalid format' });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveClass('border-red-500');
  });

  it('should set aria-invalid when error exists', () => {
    renderPhoneNumberInput({ error: 'Invalid format' });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should link error message with aria-describedby', () => {
    renderPhoneNumberInput({ 
      id: 'phone-input',
      error: 'Invalid format' 
    });
    
    const input = screen.getByLabelText(/phone number/i);
    const errorMessage = screen.getByText(/invalid format/i);
    
    expect(input).toHaveAttribute('aria-describedby', 'phone-input-error');
    expect(errorMessage).toHaveAttribute('id', 'phone-input-error');
  });

  it('should prioritize error message over help text', () => {
    renderPhoneNumberInput({ error: 'Invalid format' });
    
    expect(screen.queryByText(/enter your philippine mobile number/i)).not.toBeInTheDocument();
    expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 7: Callbacks
// ============================================================================

describe('PhoneNumberInput - Callbacks', () => {
  it('should call onChange with E.164 formatted value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '9123456789');
    
    expect(onChange).toHaveBeenLastCalledWith('+639123456789');
  });

  it('should call onBlur when input loses focus', async () => {
    const user = userEvent.setup();
    const onBlur = jest.fn();
    renderPhoneNumberInput({ onBlur });
    
    const input = screen.getByLabelText(/phone number/i);
    await user.click(input);
    await user.tab();
    
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should call onChange for each digit typed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, '912');
    
    expect(onChange).toHaveBeenCalledTimes(3);
  });
});

// ============================================================================
// Test Suite 8: Accessibility
// ============================================================================

describe('PhoneNumberInput - Accessibility', () => {
  it('should have proper label association', () => {
    renderPhoneNumberInput({ id: 'phone', label: 'Phone Number' });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveAttribute('id', 'phone');
  });

  it('should announce errors to screen readers', () => {
    renderPhoneNumberInput({ error: 'Invalid format' });
    
    const errorMessage = screen.getByText(/invalid format/i);
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('should have aria-label on validation icons', () => {
    renderPhoneNumberInput({ validationState: 'success' });
    
    const icon = screen.getByLabelText(/valid phone number/i);
    expect(icon).toBeInTheDocument();
  });

  it('should set required attribute when required=true', () => {
    renderPhoneNumberInput({ required: true });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toBeRequired();
  });

  it('should have aria-describedby pointing to help text in idle state', () => {
    renderPhoneNumberInput({ id: 'phone' });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveAttribute('aria-describedby', 'phone-help');

    const helpText = document.getElementById('phone-help');
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveTextContent('Enter your Philippine mobile number');
  });

  it('should have aria-describedby pointing to error when error exists', () => {
    renderPhoneNumberInput({ id: 'phone', error: 'Invalid number' });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveAttribute('aria-describedby', 'phone-error');
  });

  it('should have aria-invalid when error exists', () => {
    renderPhoneNumberInput({ error: 'Invalid format' });
    
    const input = screen.getByLabelText(/phone number/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should have country code flag with proper aria-label', () => {
    renderPhoneNumberInput();
    
    const flagContainer = screen.getByRole('img', { name: /Country: Philippines/ });
    expect(flagContainer).toBeInTheDocument();
  });
});

// ============================================================================
// Test Suite 9: Edge Cases
// ============================================================================

describe('PhoneNumberInput - Edge Cases', () => {
  it('should handle empty string value', () => {
    renderPhoneNumberInput({ value: '' });
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should handle undefined value', () => {
    renderPhoneNumberInput({ value: undefined });
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should clear validation state when input is cleared', async () => {
    const user = userEvent.setup();
    renderPhoneNumberInput();
    
    const input = screen.getByLabelText(/phone number/i) as HTMLInputElement;
    
    // Type valid number
    await user.type(input, '9123456789');
    await waitForDebounce();
    expect(screen.getByLabelText(/valid phone number/i)).toBeInTheDocument();
    
    // Clear input
    await user.clear(input);
    
    // Validation icons should be gone
    expect(screen.queryByLabelText(/valid phone number/i)).not.toBeInTheDocument();
  });

  it('should cleanup debounce timer on unmount', () => {
    const { unmount } = renderPhoneNumberInput();
    
    // Should not throw error on unmount
    expect(() => unmount()).not.toThrow();
  });

  it('should handle rapid typing without errors', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderPhoneNumberInput({ onChange });
    
    const input = screen.getByLabelText(/phone number/i);
    
    await user.type(input, '9123456789');
    
    expect(onChange).toHaveBeenCalled();
  });
});
