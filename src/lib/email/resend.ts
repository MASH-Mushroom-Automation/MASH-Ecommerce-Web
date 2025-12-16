/**
 * Resend Email Client Configuration
 *
 * Email service for sending order notifications.
 * Uses Resend API (free tier: 3,000 emails/month)
 *
 * Setup:
 * 1. Create account at https://resend.com
 * 2. Get API key from dashboard
 * 3. Add to .env.local: RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
 */

import { Resend } from "resend";

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn(
    "⚠️ RESEND_API_KEY not configured. Email notifications will be disabled."
  );
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email configuration
export const EMAIL_CONFIG = {
  from:
    process.env.EMAIL_FROM_ADDRESS ||
    "MASH Fresh Mushrooms <onboarding@resend.dev>",
  replyTo: process.env.EMAIL_REPLY_TO || "support@mash.ph",
  // Use resend.dev domain for testing (no domain verification needed)
  testFrom: "MASH <onboarding@resend.dev>",
};

// Email types
export type EmailType =
  | "order_confirmation"
  | "order_approved"
  | "order_rejected"
  | "order_shipped"
  | "order_delivered"
  | "driver_assigned"
  | "welcome";

// Email payload interface
export interface SendEmailPayload {
  to: string;
  type: EmailType;
  data: {
    customerName: string;
    orderNumber: string;
    orderId?: string;
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    subtotal?: number;
    deliveryFee?: number;
    total?: number;
    deliveryMethod?: "pickup" | "lalamove";
    deliveryAddress?: string;
    pickupLocation?: string;
    paymentMethod?: string;
    trackingUrl?: string;
    rejectionReason?: string;
    driverName?: string;
    driverPhone?: string;
    estimatedDelivery?: string;
  };
}

// Send email result
export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!resend;
}

/**
 * Get the appropriate "from" address based on environment
 */
export function getFromAddress(): string {
  // In development/testing, use the Resend test domain
  if (process.env.NODE_ENV !== "production") {
    return EMAIL_CONFIG.testFrom;
  }
  return EMAIL_CONFIG.from;
}

export default resend;
