/**
 * MASH Platform - Enum Conversion Utilities
 * 
 * Critical utilities for converting between frontend display values
 * and backend API UPPERCASE enum values.
 * 
 * The backend database expects ALL enum values in UPPERCASE format.
 * Use these utilities to ensure compatibility.
 * 
 * @see docs/BACKEND_API_CONNECTION_GUIDE.md Section 6
 */

/**
 * Convert display value to backend enum value
 * 
 * @example
 * toBackendEnum("Cash on Delivery")  // "CASH_ON_DELIVERY"
 * toBackendEnum("gcash")             // "GCASH"
 * toBackendEnum("pending")           // "PENDING"
 * toBackendEnum("Super Admin")       // "SUPER_ADMIN"
 */
export function toBackendEnum(value: string): string {
  return value
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
}

/**
 * Convert backend enum to display value
 * 
 * @example
 * toDisplayEnum("CASH_ON_DELIVERY")  // "Cash On Delivery"
 * toDisplayEnum("GCASH")             // "Gcash"
 * toDisplayEnum("PENDING")           // "Pending"
 * toDisplayEnum("SUPER_ADMIN")       // "Super Admin"
 */
export function toDisplayEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate if enum value is in correct backend format
 * 
 * @example
 * isValidBackendEnum("PENDING")            // true
 * isValidBackendEnum("CASH_ON_DELIVERY")   // true
 * isValidBackendEnum("pending")            // false
 * isValidBackendEnum("Cash on Delivery")   // false
 */
export function isValidBackendEnum(value: string): boolean {
  return value === value.toUpperCase() && 
         value === value.replace(/\s+/g, '_').replace(/-/g, '_');
}

/**
 * Convert an object's enum fields to backend format
 * Useful for converting entire form data before API submission
 * 
 * @example
 * const formData = {
 *   name: "John Doe",
 *   role: "buyer",
 *   status: "active"
 * };
 * 
 * const apiData = convertEnumsToBackend(formData, ['role', 'status']);
 * // { name: "John Doe", role: "BUYER", status: "ACTIVE" }
 */
export function convertEnumsToBackend<T extends Record<string, unknown>>(
  data: T,
  enumFields: (keyof T)[]
): T {
  const converted = { ...data };
  
  for (const field of enumFields) {
    if (converted[field] && typeof converted[field] === 'string') {
      converted[field] = toBackendEnum(converted[field] as string) as T[keyof T];
    }
  }
  
  return converted;
}

/**
 * Convert an object's enum fields to display format
 * Useful for converting API response to UI-friendly format
 * 
 * @example
 * const apiData = {
 *   name: "John Doe",
 *   role: "BUYER",
 *   status: "ACTIVE"
 * };
 * 
 * const displayData = convertEnumsToDisplay(apiData, ['role', 'status']);
 * // { name: "John Doe", role: "Buyer", status: "Active" }
 */
export function convertEnumsToDisplay<T extends Record<string, unknown>>(
  data: T,
  enumFields: (keyof T)[]
): T {
  const converted = { ...data };
  
  for (const field of enumFields) {
    if (converted[field] && typeof converted[field] === 'string') {
      converted[field] = toDisplayEnum(converted[field] as string) as T[keyof T];
    }
  }
  
  return converted;
}

// ============================================================================
// ENUM TYPE DEFINITIONS (from Prisma schema)
// ============================================================================

export enum UserRole {
  USER = 'USER',
  BUYER = 'BUYER',
  GROWER = 'GROWER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  GCASH = 'GCASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MAYA = 'MAYA',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum DeviceType {
  TEMPERATURE_SENSOR = 'TEMPERATURE_SENSOR',
  HUMIDITY_SENSOR = 'HUMIDITY_SENSOR',
  CO2_SENSOR = 'CO2_SENSOR',
  LIGHT_SENSOR = 'LIGHT_SENSOR',
  SOIL_MOISTURE_SENSOR = 'SOIL_MOISTURE_SENSOR',
  CONTROLLER = 'CONTROLLER',
  CAMERA = 'CAMERA',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
}

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  DEVICE_ALERT = 'DEVICE_ALERT',
  SECURITY = 'SECURITY',
}

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  SNOOZED = 'SNOOZED',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Converting form data for order creation
export function prepareOrderForApi(formData: Record<string, unknown>) {
  return convertEnumsToBackend(formData, ['status', 'paymentMethod', 'paymentStatus']);
}

// Example 2: Converting API response for display
export function formatOrderForDisplay(apiData: Record<string, unknown>) {
  return convertEnumsToDisplay(apiData, ['status', 'paymentMethod', 'paymentStatus']);
}

// Example 3: Manual conversion
export function createOrderExample(orderData: Record<string, unknown>) {
  const apiPayload = {
    ...orderData,
    status: toBackendEnum(orderData.status as string),           // "pending" → "PENDING"
    paymentMethod: toBackendEnum(orderData.paymentMethod as string), // "gcash" → "GCASH"
  };
  
  return fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiPayload),
  });
}

// Example 4: Validation before API call
export function validateAndConvertEnums(formData: Record<string, unknown>) {
  // Convert enums
  const apiData = convertEnumsToBackend(formData, ['role', 'status']);
  
  // Validate enum format
  if (apiData.role && !isValidBackendEnum(apiData.role as string)) {
    throw new Error('Invalid role format');
  }
  
  return apiData;
}

// ============================================================================
// IMPORTANT NOTES
// ============================================================================

/**
 * ⚠️ CRITICAL: Always convert enums before sending to backend API
 * 
 * ❌ WRONG - Will cause database errors:
 * {
 *   status: 'pending',
 *   role: 'buyer',
 *   paymentMethod: 'Cash on Delivery'
 * }
 * 
 * ✅ CORRECT - Backend expects UPPERCASE:
 * {
 *   status: 'PENDING',
 *   role: 'BUYER',
 *   paymentMethod: 'CASH_ON_DELIVERY'
 * }
 * 
 * Use these utilities to ensure compatibility:
 * - toBackendEnum() for single values
 * - convertEnumsToBackend() for objects
 * - isValidBackendEnum() for validation
 */
