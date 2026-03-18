/**
 * Email Service Index
 *
 * Export all email-related functionality from a single location.
 * Uses Resend as primary provider, falls back to Gmail SMTP.
 */

// Resend client (primary)
export { resend, EMAIL_CONFIG, isEmailConfigured } from "./resend";

// Gmail SMTP client (fallback)
export {
  isGmailConfigured,
  getFromAddress,
  sendRawEmail,
  verifyConnection,
  GMAIL_CONFIG,
} from "./gmail-smtp";
export type { EmailType, SendEmailPayload, SendEmailResult } from "./gmail-smtp";

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
