/**
 * Email Sending Service
 *
 * High-level service for sending order notification emails.
 * Uses Gmail SMTP via Nodemailer (not Resend).
 * Handles template rendering with React Email and error logging.
 */

import { render } from "@react-email/components";
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
export { isGmailConfigured as isEmailConfigured };
export type { EmailType, SendEmailPayload, SendEmailResult };

/**
 * Send an email based on type
 */
export async function sendEmail(
  payload: SendEmailPayload
): Promise<SendEmailResult> {
  // Check if email service is configured
  if (!isGmailConfigured()) {
    console.warn("Gmail SMTP not configured, skipping email send");
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

    // Send email via Gmail SMTP
    const result = await sendRawEmail({
      to,
      subject,
      html,
    });

    if (result.success) {
      console.log(`✅ Email sent successfully: ${type} to ${to}`, result.messageId);
    }

    return result;
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
