/**
 * Tests for Enum Conversion Utilities
 * @module src/lib/utils/enums
 *
 * Covers: toBackendEnum, toDisplayEnum, isValidBackendEnum,
 *   convertEnumsToBackend, convertEnumsToDisplay, prepareOrderForApi,
 *   formatOrderForDisplay, validateAndConvertEnums
 */

import {
  toBackendEnum,
  toDisplayEnum,
  isValidBackendEnum,
  convertEnumsToBackend,
  convertEnumsToDisplay,
  prepareOrderForApi,
  formatOrderForDisplay,
  validateAndConvertEnums,
  UserRole,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeviceType,
  DeviceStatus,
  NotificationType,
  AlertPriority,
} from '../enums';

// ============================================================================
// toBackendEnum
// ============================================================================

describe('toBackendEnum', () => {
  it('converts lowercase to UPPERCASE', () => {
    expect(toBackendEnum('pending')).toBe('PENDING');
    expect(toBackendEnum('buyer')).toBe('BUYER');
  });

  it('converts spaces to underscores', () => {
    expect(toBackendEnum('Cash on Delivery')).toBe('CASH_ON_DELIVERY');
    expect(toBackendEnum('Super Admin')).toBe('SUPER_ADMIN');
  });

  it('converts hyphens to underscores', () => {
    expect(toBackendEnum('credit-card')).toBe('CREDIT_CARD');
    expect(toBackendEnum('bank-transfer')).toBe('BANK_TRANSFER');
  });

  it('handles mixed case and delimiters', () => {
    expect(toBackendEnum('Cash-on Delivery')).toBe('CASH_ON_DELIVERY');
  });

  it('preserves already-uppercase values', () => {
    expect(toBackendEnum('ACTIVE')).toBe('ACTIVE');
    expect(toBackendEnum('CASH_ON_DELIVERY')).toBe('CASH_ON_DELIVERY');
  });

  it('handles single character', () => {
    expect(toBackendEnum('a')).toBe('A');
  });

  it('handles empty string', () => {
    expect(toBackendEnum('')).toBe('');
  });

  it('handles multiple consecutive spaces (collapsed to single underscore)', () => {
    expect(toBackendEnum('Cash   on   Delivery')).toBe('CASH_ON_DELIVERY');
  });
});

// ============================================================================
// toDisplayEnum
// ============================================================================

describe('toDisplayEnum', () => {
  it('converts UPPERCASE to Title Case', () => {
    expect(toDisplayEnum('PENDING')).toBe('Pending');
    expect(toDisplayEnum('BUYER')).toBe('Buyer');
  });

  it('converts underscores to spaces with title case', () => {
    expect(toDisplayEnum('CASH_ON_DELIVERY')).toBe('Cash On Delivery');
    expect(toDisplayEnum('SUPER_ADMIN')).toBe('Super Admin');
  });

  it('handles single-word enums', () => {
    expect(toDisplayEnum('GCASH')).toBe('Gcash');
    expect(toDisplayEnum('PENDING')).toBe('Pending');
  });

  it('handles already-formatted values', () => {
    // Still title-cases each segment
    expect(toDisplayEnum('Cash')).toBe('Cash');
  });

  it('handles empty string', () => {
    expect(toDisplayEnum('')).toBe('');
  });
});

// ============================================================================
// isValidBackendEnum
// ============================================================================

describe('isValidBackendEnum', () => {
  it('returns true for valid uppercase enums', () => {
    expect(isValidBackendEnum('PENDING')).toBe(true);
    expect(isValidBackendEnum('CASH_ON_DELIVERY')).toBe(true);
    expect(isValidBackendEnum('ACTIVE')).toBe(true);
  });

  it('returns false for lowercase values', () => {
    expect(isValidBackendEnum('pending')).toBe(false);
    expect(isValidBackendEnum('active')).toBe(false);
  });

  it('returns false for mixed case', () => {
    expect(isValidBackendEnum('Pending')).toBe(false);
    expect(isValidBackendEnum('Cash On Delivery')).toBe(false);
  });

  it('returns false for values with spaces', () => {
    expect(isValidBackendEnum('CASH ON DELIVERY')).toBe(false);
  });

  it('returns false for values with hyphens', () => {
    expect(isValidBackendEnum('CREDIT-CARD')).toBe(false);
  });

  it('returns true for single uppercase character', () => {
    expect(isValidBackendEnum('A')).toBe(true);
  });

  it('handles empty string', () => {
    expect(isValidBackendEnum('')).toBe(true); // empty === empty.toUpperCase()
  });
});

// ============================================================================
// convertEnumsToBackend
// ============================================================================

describe('convertEnumsToBackend', () => {
  it('converts specified enum fields to backend format', () => {
    const formData = { name: 'John', role: 'buyer', status: 'active' };
    const result = convertEnumsToBackend(formData, ['role', 'status']);
    expect(result).toEqual({ name: 'John', role: 'BUYER', status: 'ACTIVE' });
  });

  it('does not modify non-enum fields', () => {
    const formData = { name: 'John Doe', email: 'john@example.com', role: 'admin' };
    const result = convertEnumsToBackend(formData, ['role']);
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.role).toBe('ADMIN');
  });

  it('skips null or undefined enum fields', () => {
    const formData = { name: 'John', role: null as unknown as string, status: 'active' };
    const result = convertEnumsToBackend(formData, ['role', 'status']);
    expect(result.role).toBeNull();
    expect(result.status).toBe('ACTIVE');
  });

  it('skips non-string enum fields', () => {
    const formData = { name: 'John', count: 42, status: 'active' };
    const result = convertEnumsToBackend(formData, ['count' as keyof typeof formData, 'status']);
    expect(result.count).toBe(42);
    expect(result.status).toBe('ACTIVE');
  });

  it('returns new object (does not mutate original)', () => {
    const formData = { role: 'buyer' };
    const result = convertEnumsToBackend(formData, ['role']);
    expect(result).not.toBe(formData);
    expect(formData.role).toBe('buyer');
  });

  it('handles empty enum fields array', () => {
    const formData = { role: 'buyer' };
    const result = convertEnumsToBackend(formData, []);
    expect(result).toEqual({ role: 'buyer' });
  });
});

// ============================================================================
// convertEnumsToDisplay
// ============================================================================

describe('convertEnumsToDisplay', () => {
  it('converts specified enum fields to display format', () => {
    const apiData = { name: 'John', role: 'BUYER', status: 'ACTIVE' };
    const result = convertEnumsToDisplay(apiData, ['role', 'status']);
    expect(result).toEqual({ name: 'John', role: 'Buyer', status: 'Active' });
  });

  it('handles multi-word enum values', () => {
    const apiData = { paymentMethod: 'CASH_ON_DELIVERY' };
    const result = convertEnumsToDisplay(apiData, ['paymentMethod']);
    expect(result.paymentMethod).toBe('Cash On Delivery');
  });

  it('does not modify non-enum fields', () => {
    const apiData = { name: 'John Doe', role: 'ADMIN' };
    const result = convertEnumsToDisplay(apiData, ['role']);
    expect(result.name).toBe('John Doe');
  });

  it('skips null or undefined enum fields', () => {
    const apiData = { role: null as unknown as string, status: 'ACTIVE' };
    const result = convertEnumsToDisplay(apiData, ['role', 'status']);
    expect(result.role).toBeNull();
    expect(result.status).toBe('Active');
  });
});

// ============================================================================
// prepareOrderForApi / formatOrderForDisplay
// ============================================================================

describe('prepareOrderForApi', () => {
  it('converts order fields to backend format', () => {
    const formData = {
      status: 'pending',
      paymentMethod: 'cash on delivery',
      paymentStatus: 'pending',
      customerName: 'Juan',
    };
    const result = prepareOrderForApi(formData);
    expect(result.status).toBe('PENDING');
    expect(result.paymentMethod).toBe('CASH_ON_DELIVERY');
    expect(result.paymentStatus).toBe('PENDING');
    expect(result.customerName).toBe('Juan');
  });
});

describe('formatOrderForDisplay', () => {
  it('converts order fields to display format', () => {
    const apiData = {
      status: 'SHIPPED',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'COMPLETED',
      orderId: 'ORD-123',
    };
    const result = formatOrderForDisplay(apiData);
    expect(result.status).toBe('Shipped');
    expect(result.paymentMethod).toBe('Cash On Delivery');
    expect(result.paymentStatus).toBe('Completed');
    expect(result.orderId).toBe('ORD-123');
  });
});

// ============================================================================
// validateAndConvertEnums
// ============================================================================

describe('validateAndConvertEnums', () => {
  it('converts and validates enum fields', () => {
    const formData = { role: 'buyer', status: 'active', name: 'John' };
    const result = validateAndConvertEnums(formData);
    expect(result.role).toBe('BUYER');
    expect(result.name).toBe('John');
  });

  it('passes validation when enums are correct format', () => {
    const formData = { role: 'admin', name: 'John' };
    expect(() => validateAndConvertEnums(formData)).not.toThrow();
  });
});

// ============================================================================
// Enum Type Definitions
// ============================================================================

describe('Enum type definitions', () => {
  it('UserRole has correct values', () => {
    expect(UserRole.USER).toBe('USER');
    expect(UserRole.BUYER).toBe('BUYER');
    expect(UserRole.GROWER).toBe('GROWER');
    expect(UserRole.ADMIN).toBe('ADMIN');
    expect(UserRole.SUPER_ADMIN).toBe('SUPER_ADMIN');
  });

  it('OrderStatus has correct values', () => {
    expect(OrderStatus.PENDING).toBe('PENDING');
    expect(OrderStatus.CONFIRMED).toBe('CONFIRMED');
    expect(OrderStatus.PROCESSING).toBe('PROCESSING');
    expect(OrderStatus.SHIPPED).toBe('SHIPPED');
    expect(OrderStatus.DELIVERED).toBe('DELIVERED');
    expect(OrderStatus.CANCELLED).toBe('CANCELLED');
    expect(OrderStatus.REFUNDED).toBe('REFUNDED');
  });

  it('PaymentMethod has correct values', () => {
    expect(PaymentMethod.CASH_ON_DELIVERY).toBe('CASH_ON_DELIVERY');
    expect(PaymentMethod.GCASH).toBe('GCASH');
    expect(PaymentMethod.CREDIT_CARD).toBe('CREDIT_CARD');
    expect(PaymentMethod.DEBIT_CARD).toBe('DEBIT_CARD');
    expect(PaymentMethod.BANK_TRANSFER).toBe('BANK_TRANSFER');
    expect(PaymentMethod.MAYA).toBe('MAYA');
  });

  it('PaymentStatus has correct values', () => {
    expect(PaymentStatus.PENDING).toBe('PENDING');
    expect(PaymentStatus.COMPLETED).toBe('COMPLETED');
    expect(PaymentStatus.FAILED).toBe('FAILED');
    expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
  });

  it('DeviceType has correct values', () => {
    expect(DeviceType.TEMPERATURE_SENSOR).toBe('TEMPERATURE_SENSOR');
    expect(DeviceType.HUMIDITY_SENSOR).toBe('HUMIDITY_SENSOR');
    expect(DeviceType.CO2_SENSOR).toBe('CO2_SENSOR');
    expect(DeviceType.CAMERA).toBe('CAMERA');
  });

  it('DeviceStatus has correct values', () => {
    expect(DeviceStatus.ACTIVE).toBe('ACTIVE');
    expect(DeviceStatus.INACTIVE).toBe('INACTIVE');
    expect(DeviceStatus.MAINTENANCE).toBe('MAINTENANCE');
    expect(DeviceStatus.ERROR).toBe('ERROR');
  });

  it('NotificationType has correct values', () => {
    expect(NotificationType.ORDER_UPDATE).toBe('ORDER_UPDATE');
    expect(NotificationType.PAYMENT).toBe('PAYMENT');
    expect(NotificationType.SHIPPING).toBe('SHIPPING');
    expect(NotificationType.SECURITY).toBe('SECURITY');
  });

  it('AlertPriority has correct values', () => {
    expect(AlertPriority.LOW).toBe('LOW');
    expect(AlertPriority.MEDIUM).toBe('MEDIUM');
    expect(AlertPriority.HIGH).toBe('HIGH');
    expect(AlertPriority.CRITICAL).toBe('CRITICAL');
  });
});
