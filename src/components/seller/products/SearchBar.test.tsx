/**
 * Unit Tests for SearchBar Component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render with default props', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox', { name: /search products/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search products by name, SKU, or description...');
  });

  it('should render with custom placeholder', () => {
    const placeholder = 'Search by name...';
    render(
      <SearchBar
        value=""
        onChange={mockOnChange}
        placeholder={placeholder}
      />
    );
    
    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SearchBar value="test query" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test query');
  });

  it('should call onChange with debounce', async () => {
    render(<SearchBar value="" onChange={mockOnChange} debounceMs={300} />);
    
    const input = screen.getByRole('textbox');
    
    // Use fireEvent instead of userEvent for compatibility with fake timers
    fireEvent.change(input, { target: { value: 'mushroom' } });
    
    // Should not call immediately
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(300);
    
    // Should call after debounce
    expect(mockOnChange).toHaveBeenCalledWith('mushroom');
  });

  it('should debounce multiple rapid changes', async () => {
    render(<SearchBar value="" onChange={mockOnChange} debounceMs={300} />);
    
    const input = screen.getByRole('textbox');
    
    // Type multiple characters rapidly using fireEvent
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Should not call yet
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Fast-forward debounce time
    jest.advanceTimersByTime(300);
    
    // Should only call once with final value
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('abc');
  });

  it('should show clear button when input has value', () => {
    render(<SearchBar value="test" onChange={mockOnChange} />);
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when input is empty', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const clearButton = screen.queryByRole('button', { name: /clear search/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear input when clear button clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SearchBar value="test" onChange={mockOnChange} />);
    
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    await user.click(clearButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should show loading spinner when isLoading is true', () => {
    render(<SearchBar value="" onChange={mockOnChange} isLoading={true} />);
    
    // Loading spinner should be visible (Loader2 icon)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should not show clear button when loading', () => {
    render(<SearchBar value="test" onChange={mockOnChange} isLoading={true} />);
    
    // Clear button should not be visible when loading
    const clearButton = screen.queryByRole('button', { name: /clear search/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should focus input on Cmd+K keyboard shortcut', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveFocus();
    
    // Simulate Cmd+K (metaKey + k)
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    expect(input).toHaveFocus();
  });

  it('should focus input on Ctrl+K keyboard shortcut', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveFocus();
    
    // Simulate Ctrl+K (ctrlKey + k)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    
    expect(input).toHaveFocus();
  });

  it('should sync local value with prop value changes', () => {
    const { rerender } = render(<SearchBar value="initial" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial');
    
    // Update prop value
    rerender(<SearchBar value="updated" onChange={mockOnChange} />);
    
    expect(input).toHaveValue('updated');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SearchBar value="" onChange={mockOnChange} className="custom-class" />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should have accessible ARIA labels', () => {
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox', { name: /search products/i });
    expect(input).toHaveAttribute('aria-label', 'Search products');
    expect(input).toHaveAttribute('aria-describedby', 'search-hint');
  });

  it('should use custom debounce delay', async () => {
    render(<SearchBar value="" onChange={mockOnChange} debounceMs={500} />);
    
    const input = screen.getByRole('textbox');
    
    // Use fireEvent for compatibility with fake timers
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not call after 300ms
    jest.advanceTimersByTime(300);
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Should call after 500ms total
    jest.advanceTimersByTime(200);
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });
});
