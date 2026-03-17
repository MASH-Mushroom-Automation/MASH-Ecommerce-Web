/**
 * Payment Service Index
 *
 * Export all payment-related functionality.
 */

// Named exports
export {
  isPayMongoConfigured,
  createEWalletPayment,
  createCardPaymentIntent,
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
