/**
 * Payment Service Index
 *
 * Export all payment-related functionality.
 */

// Config exports
export {
  PAYMONGO_ENABLED,
  PAYMONGO_API_URL,
  PAYMONGO_PUBLIC_KEY,
  APP_BASE_URL,
  getAvailablePaymentMethods,
  isPaymentMethodAvailable,
  validatePaymentConfig,
  logPaymentConfigWarnings,
  getPaymentConfig,
} from "./config";

export type { PaymentConfig, PaymentConfigValidation } from "./config";

// Named exports
export {
  isPayMongoConfigured,
  createEWalletPayment,
  createCardPaymentIntent,
  createCardCheckoutSession,
  attachPaymentMethod,
  getSourceStatus,
  getPaymentIntentStatus,
  createPaymentFromSource,
  verifyWebhookSignature,
  getPublicKey,
} from "./paymongo";

// Type exports
export type {
  PaymentMethodType,
  PaymentStatus,
  PaymentResult,
  PaymentDetails,
} from "./paymongo";

// Default export
export { default as paymongo } from "./paymongo";
