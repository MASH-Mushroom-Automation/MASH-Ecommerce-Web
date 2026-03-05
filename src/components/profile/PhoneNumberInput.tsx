/**
 * PhoneNumberInput Component
 * 
 * Auto-formatting phone input with real-time validation for Philippine mobile numbers.
 * 
 * Features:
 * - Auto-formats as user types: +63 912 345 6789
 * - Visual validation states: idle, loading, error, success
 * - Country code selector (default: +63 Philippines)
 * - Integrates with React Hook Form via Controller
 * - Debounced validation (500ms) to reduce re-renders
 * - Accessible with ARIA labels and error messages
 * 
 * Usage:
 * ```tsx
 * <Controller
 *   name="phoneNumber"
 *   control={control}
 *   render={({ field }) => (
 *     <PhoneNumberInput
 *       value={field.value}
 *       onChange={field.onChange}
 *       error={errors.phoneNumber?.message}
 *       validationState="idle"
 *     />
 *   )}
 * />
 * ```
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  formatPhoneNumber, 
  validatePhilippinePhoneNumber,
  normalizePhoneNumber 
} from '@/lib/phone-utils';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Validation state for the phone input
 */
export type PhoneValidationState = 'idle' | 'loading' | 'error' | 'success';

/**
 * Country code option
 */
export interface CountryCode {
  code: string;
  label: string;
  flag: string;
}

/**
 * PhoneNumberInput component props
 */
export interface PhoneNumberInputProps {
  /** Current phone number value */
  value?: string;
  
  /** Change handler (React Hook Form field.onChange) */
  onChange?: (value: string) => void;
  
  /** Blur handler (React Hook Form field.onBlur) */
  onBlur?: () => void;
  
  /** Validation state */
  validationState?: PhoneValidationState;
  
  /** Error message (from React Hook Form or custom) */
  error?: string;
  
  /** Whether input is disabled */
  disabled?: boolean;
  
  /** Whether input is required */
  required?: boolean;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Label text */
  label?: string;
  
  /** Country code (default: +63) */
  countryCode?: string;
  
  /** Available country codes for selector */
  countryCodes?: CountryCode[];
  
  /** Additional CSS classes */
  className?: string;
  
  /** ID for input element */
  id?: string;
  
  /** Name attribute for form */
  name?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default country codes (Philippines only for MVP)
 */
const DEFAULT_COUNTRY_CODES: CountryCode[] = [
  { code: '+63', label: 'Philippines', flag: '🇵🇭' }
];

/**
 * Debounce delay for validation (milliseconds)
 */
const VALIDATION_DEBOUNCE_MS = 500;

// ============================================================================
// Component
// ============================================================================

export function PhoneNumberInput({ 
  value = '',
  onChange,
  onBlur,
  validationState = 'idle',
  error,
  disabled = false,
  required = false,
  placeholder = '912 345 6789',
  label = 'Phone Number',
  countryCode = '+63',
  countryCodes = DEFAULT_COUNTRY_CODES,
  className,
  id = 'phone-number',
  name = 'phoneNumber'
}: PhoneNumberInputProps) {
  // Local state for formatting
  const [displayValue, setDisplayValue] = useState('');
  const [internalValidState, setInternalValidState] = useState<PhoneValidationState>('idle');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Determine final validation state (external prop takes precedence)
  const finalValidState = validationState !== 'idle' ? validationState : internalValidState;

  /**
   * Format the display value with spaces for readability
   * E.164: +639123456789 → Display: +63 912 345 6789
   */
  const formatDisplayValue = useCallback((phone: string): string => {
    if (!phone) return '';
    
    const normalized = normalizePhoneNumber(phone);
    
    // Remove country code for display formatting
    let digits = normalized;
    if (digits.startsWith('+63')) {
      digits = digits.substring(3);
    } else if (digits.startsWith('63')) {
      digits = digits.substring(2);
    } else if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    // Format: 912 345 6789
    if (digits.length <= 3) {
      return `${countryCode} ${digits}`;
    } else if (digits.length <= 6) {
      return `${countryCode} ${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else {
      return `${countryCode} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
    }
  }, [countryCode]);

  /**
   * Update display value when external value changes
   */
  useEffect(() => {
    if (value) {
      setDisplayValue(formatDisplayValue(value));
    } else {
      setDisplayValue('');
    }
  }, [value, formatDisplayValue]);

  /**
   * Debounced validation function
   */
  const validateWithDebounce = useCallback((phone: string) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set loading state immediately
    setInternalValidState('loading');

    // Create new debounce timer
    const timer = setTimeout(() => {
      if (!phone) {
        setInternalValidState('idle');
        return;
      }

      const isValid = validatePhilippinePhoneNumber(phone);
      setInternalValidState(isValid ? 'success' : 'error');
    }, VALIDATION_DEBOUNCE_MS);

    setDebounceTimer(timer);
  }, [debounceTimer]);

  /**
   * Handle input change with auto-formatting
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Extract only digits from input
    const rawDigits = input.replace(/[^\d]/g, '');
    
    // Strip country code prefix (63) if present from display formatting
    // The display format includes +63 prefix, so when user types into the input,
    // the raw digits will include 63 from the display prefix
    let digitsOnly = rawDigits;
    if (digitsOnly.startsWith('63') && digitsOnly.length > 10) {
      digitsOnly = digitsOnly.substring(2);
    }
    
    // Limit to 10 digits (Philippine mobile without country code)
    const limitedDigits = digitsOnly.slice(0, 10);
    
    // Format for display
    const formatted = formatDisplayValue(limitedDigits);
    setDisplayValue(formatted);
    
    // Convert to E.164 for storage
    const e164 = formatPhoneNumber(limitedDigits);
    
    // Trigger onChange with E.164 format
    if (onChange) {
      onChange(e164);
    }
    
    // Validate with debounce
    if (limitedDigits.length >= 10) {
      validateWithDebounce(e164);
    } else {
      setInternalValidState('idle');
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        setDebounceTimer(null);
      }
    }
  }, [onChange, formatDisplayValue, validateWithDebounce, debounceTimer]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  /**
   * Get border color based on validation state
   */
  const getBorderColor = (): string => {
    if (error) return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    
    switch (finalValidState) {
      case 'loading':
        return 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20';
      case 'success':
        return 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
      case 'error':
        return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
      default:
        return 'border-border focus:border-primary focus:ring-primary/20';
    }
  };

  /**
   * Render validation icon
   */
  const renderValidationIcon = () => {
    if (disabled) return null;
    
    switch (finalValidState) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" aria-label="Validating" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Valid phone number" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" aria-label="Invalid phone number" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Label */}
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}

      {/* Input container */}
      <div className="relative w-full">
        {/* Country code prefix (read-only for MVP) */}
        <div
          className="absolute left-0 top-0 h-full flex items-center pl-3 pointer-events-none"
          aria-label={`Country: ${countryCodes[0].label} (${countryCodes[0].code})`}
          role="img"
        >
          <span className="text-sm font-medium text-muted-foreground" aria-hidden="true">
            {countryCodes[0].flag}
          </span>
        </div>

        {/* Phone input */}
        <input
          id={id}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={`${countryCode} ${placeholder}`}
          required={required}
          aria-invalid={!!error || finalValidState === 'error'}
          aria-describedby={error ? `${id}-error` : finalValidState === 'idle' ? `${id}-help` : undefined}
          className={cn(
            'w-full rounded-lg border bg-background px-4 py-3 pl-12 pr-12 text-base text-foreground',
            'placeholder:text-muted-foreground/70',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
            getBorderColor()
          )}
        />

        {/* Validation icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {renderValidationIcon()}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p 
          id={`${id}-error`}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Help text */}
      {!error && finalValidState === 'idle' && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          Enter your Philippine mobile number (10 digits)
        </p>
      )}
    </div>
  );
}

export default PhoneNumberInput;
