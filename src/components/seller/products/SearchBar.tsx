/**
 * SearchBar Component
 * Debounced search input with keyboard shortcuts
 */
'use client';

import React, { useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  /** Current search value */
  value: string;
  
  /** Callback when search value changes (debounced) */
  onChange: (value: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  
  /** Loading state during search */
  isLoading?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * SearchBar with debounced input and keyboard shortcuts
 * 
 * Features:
 * - Debounced onChange (default 300ms)
 * - Clear button when input has value
 * - Loading spinner during search
 * - Keyboard shortcut: Cmd+K / Ctrl+K to focus
 * - Accessible with ARIA labels
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search products by name, SKU, or description...',
  debounceMs = 300,
  isLoading = false,
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = React.useState(value);

  // Debounced callback to parent
  const debouncedOnChange = useDebouncedCallback(
    (newValue: string) => {
      onChange(newValue);
    },
    debounceMs
  );

  // Sync local value with prop value (for external updates)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search className="h-4 w-4" />
      </div>

      {/* Input Field */}
      <Input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="pl-10 pr-20"
        aria-label="Search products"
        aria-describedby="search-hint"
      />

      {/* Keyboard Hint (hidden on mobile) */}
      <span
        id="search-hint"
        className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none hidden md:inline"
      >
        {!localValue && !isLoading && (
          <kbd className="px-2 py-1 rounded border bg-muted text-xs">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
          </kbd>
        )}
      </span>

      {/* Loading Spinner or Clear Button */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        
        {localValue && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 w-8 p-0 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
