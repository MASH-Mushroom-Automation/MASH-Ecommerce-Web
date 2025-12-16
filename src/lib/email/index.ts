/**
 * Email Service Index
 *
 * Export all email-related functionality from a single location.
 */

// Email client
export { default as resend, isEmailConfigured, getFromAddress } from "./resend";
export type { EmailType, SendEmailPayload, SendEmailResult } from "./resend";

// Email sending functions
export {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderApprovedEmail,
  sendOrderRejectedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from "./send-email";

// Email templates (for direct use if needed)
export * from "./templates";
