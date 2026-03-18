/**
 * Email Sending Service
 *
 * High-level service for sending order notification emails.
 * Uses Resend as primary provider, falls back to Gmail SMTP.
 * Handles template rendering with React Email and error logging.
 */

import { render } from "@react-email/components";
import { resend, EMAIL_CONFIG, isEmailConfigured } from "./resend";
import {
  isGmailConfigured,
  sendRawEmail,
  type EmailType,
  type SendEmailPayload,
  type SendEmailResult,
} from "./gmail-smtp";
import {
  OrderConfirmationEmail,
  OrderApprovedEmail,
  OrderRejectedEmail,
  OrderShippedEmail,
  OrderDeliveredEmail,
} from "./templates";

// Re-export for backward compatibility
export { isEmailConfigured, isGmailConfigured };
export type { EmailType, SendEmailPayload, SendEmailResult };

/**
 * Send HTML email via Resend
 */
async function sendViaResend(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!resend) {
    return { success: false, error: "Resend not configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }
    console.log(`✅ Email sent via Resend to ${options.to}:`, data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("Resend exception:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown Resend error",
    };
  }
}

/**
 * Send an email based on type
 */
export async function sendEmail(
  payload: SendEmailPayload
): Promise<SendEmailResult> {
  // Check if any email service is configured
  if (!isEmailConfigured() && !isGmailConfigured()) {
    console.warn("No email service configured (Resend or Gmail SMTP), skipping email send");
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    const { to, type, data } = payload;

    let subject: string;
    let reactElement: React.ReactElement;

    // Build email based on type
    switch (type) {
      case "order_confirmation":
        subject = `Order #${data.orderNumber} Received - Awaiting Confirmation`;
        reactElement = OrderConfirmationEmail({
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          orderId: data.orderId || "",
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          total: data.total || 0,
          deliveryMethod: data.deliveryMethod || "pickup",
          deliveryAddress: data.deliveryAddress,
          pickupLocation: data.pickupLocation,
          paymentMethod: data.paymentMethod || "cod",
        });
        break;

      case "order_approved":
        subject = `Order #${data.orderNumber} Confirmed! We're Preparing Your Mushrooms 🍄`;
        reactElement = OrderApprovedEmail({
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          orderId: data.orderId || "",
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          total: data.total || 0,
          deliveryMethod: data.deliveryMethod || "pickup",
          deliveryAddress: data.deliveryAddress,
          pickupLocation: data.pickupLocation,
          estimatedDelivery: data.estimatedDelivery,
        });
        break;

      case "order_rejected":
        subject = `Order #${data.orderNumber} Could Not Be Processed`;
        reactElement = OrderRejectedEmail({
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          orderId: data.orderId || "",
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          total: data.total || 0,
          deliveryMethod: data.deliveryMethod || "pickup",
          rejectionReason: data.rejectionReason || "Unable to fulfill order at this time",
        });
        break;

      case "order_shipped":
        subject = `Order #${data.orderNumber} is Out for Delivery! 🚗`;
        reactElement = OrderShippedEmail({
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          orderId: data.orderId || "",
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          total: data.total || 0,
          deliveryAddress: data.deliveryAddress || "",
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          estimatedDelivery: data.estimatedDelivery,
          trackingUrl: data.trackingUrl,
        });
        break;

      case "order_delivered":
        subject = `Order #${data.orderNumber} ${
          data.deliveryMethod === "lalamove" ? "Delivered" : "Picked Up"
        } Successfully! 🎉`;
        reactElement = OrderDeliveredEmail({
          customerName: data.customerName,
          orderNumber: data.orderNumber,
          orderId: data.orderId || "",
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          total: data.total || 0,
          deliveryMethod: data.deliveryMethod || "pickup",
        });
        break;

      default:
        console.warn(`Unknown email type: ${type}`);
        return {
          success: false,
          error: `Unknown email type: ${type}`,
        };
    }

    // Render React Email template to HTML
    const html = await render(reactElement);

    // Try Resend first (primary)
    if (isEmailConfigured()) {
      const resendResult = await sendViaResend({ to, subject, html });
      if (resendResult.success) {
        console.log(`✅ Email sent via Resend: ${type} to ${to}`, resendResult.messageId);
        return resendResult;
      }
      console.warn(`[WARN] Resend failed, falling back to Gmail SMTP: ${resendResult.error}`);
    }

    // Fallback to Gmail SMTP
    if (isGmailConfigured()) {
      const result = await sendRawEmail({ to, subject, html });
      if (result.success) {
        console.log(`✅ Email sent via Gmail SMTP (fallback): ${type} to ${to}`, result.messageId);
      }
      return result;
    }

    return { success: false, error: "All email providers failed or unconfigured" };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  data: SendEmailPayload["data"]
): Promise<SendEmailResult> {
  return sendEmail({ to, type: "order_confirmation", data });
}

/**
 * Send order approved email
 */
export async function sendOrderApprovedEmail(
  to: string,
  data: SendEmailPayload["data"]
): Promise<SendEmailResult> {
  return sendEmail({ to, type: "order_approved", data });
}

/**
 * Send order rejected email
 */
export async function sendOrderRejectedEmail(
  to: string,
  data: SendEmailPayload["data"]
): Promise<SendEmailResult> {
  return sendEmail({ to, type: "order_rejected", data });
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(
  to: string,
  data: SendEmailPayload["data"]
): Promise<SendEmailResult> {
  return sendEmail({ to, type: "order_shipped", data });
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(
  to: string,
  data: SendEmailPayload["data"]
): Promise<SendEmailResult> {
  return sendEmail({ to, type: "order_delivered", data });
}
