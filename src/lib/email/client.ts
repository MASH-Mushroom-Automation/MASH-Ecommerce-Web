/**
 * Email API Client
 *
 * Client-side wrapper for sending emails via API routes.
 * This file can safely be imported in client components because
 * it does NOT import nodemailer or any Node.js-only modules.
 */

export type EmailType =
  | "order_confirmation"
  | "order_approved"
  | "order_rejected"
  | "order_shipped"
  | "order_delivered"
  | "driver_assigned"
  | "welcome";

export interface EmailItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface EmailData {
  customerName: string;
  orderNumber: string;
  orderId?: string;
  items?: EmailItem[];
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  deliveryMethod?: "pickup" | "lalamove";
  deliveryAddress?: string;
  pickupLocation?: string;
  paymentMethod?: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  rejectionReason?: string;
  driverName?: string;
  driverPhone?: string;
}

export interface SendEmailPayload {
  to: string;
  type: EmailType;
  data: EmailData;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via the API route
 * Safe to use in client components
 */
export async function sendEmailViaAPI(
  payload: SendEmailPayload
): Promise<SendEmailResult> {
  try {
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Email API client error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send order confirmation email
 * Safe to use in client components
 */
export async function sendOrderConfirmationEmailViaAPI(
  to: string,
  data: EmailData
): Promise<SendEmailResult> {
  return sendEmailViaAPI({ to, type: "order_confirmation", data });
}

/**
 * Send order approved email
 * Safe to use in client components
 */
export async function sendOrderApprovedEmailViaAPI(
  to: string,
  data: EmailData
): Promise<SendEmailResult> {
  return sendEmailViaAPI({ to, type: "order_approved", data });
}

/**
 * Send order rejected email
 * Safe to use in client components
 */
export async function sendOrderRejectedEmailViaAPI(
  to: string,
  data: EmailData
): Promise<SendEmailResult> {
  return sendEmailViaAPI({ to, type: "order_rejected", data });
}

/**
 * Send order shipped email
 * Safe to use in client components
 */
export async function sendOrderShippedEmailViaAPI(
  to: string,
  data: EmailData
): Promise<SendEmailResult> {
  return sendEmailViaAPI({ to, type: "order_shipped", data });
}

/**
 * Send order delivered email
 * Safe to use in client components
 */
export async function sendOrderDeliveredEmailViaAPI(
  to: string,
  data: EmailData
): Promise<SendEmailResult> {
  return sendEmailViaAPI({ to, type: "order_delivered", data });
}
