/**
 * Email Service Index
 *
 * Export all email-related functionality from a single location.
 * Uses Gmail SMTP via Nodemailer (not Resend).
 */

// Gmail SMTP client
export {
  isGmailConfigured,
  isGmailConfigured as isEmailConfigured,
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
