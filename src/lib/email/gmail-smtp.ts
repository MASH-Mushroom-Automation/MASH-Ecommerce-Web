/**
 * Gmail SMTP Email Client Configuration
 *
 * Email service for sending order notifications via Gmail SMTP.
 * Uses Nodemailer with Gmail App Password authentication.
 *
 * Setup:
 * 1. Enable 2FA on your Gmail account
 * 2. Generate App Password: Google Account > Security > 2-Step Verification > App passwords
 * 3. Add to .env.local:
 *    EMAIL_HOST=smtp.gmail.com
 *    EMAIL_PORT=587
 *    EMAIL_SECURE=false
 *    EMAIL_USER=your-email@gmail.com
 *    EMAIL_PASSWORD=your-app-password
 *    EMAIL_FROM=Your Name <your-email@gmail.com>
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Email configuration from environment
export const GMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  from: process.env.EMAIL_FROM || "MASH Fresh Mushrooms <noreply@mash.ph>",
};

// Singleton transporter instance
let transporter: Transporter | null = null;

/**
 * Get or create the nodemailer transporter
 */
function getTransporter(): Transporter | null {
  if (!GMAIL_CONFIG.user || !GMAIL_CONFIG.password) {
    console.warn(
      "⚠️ Gmail SMTP not configured. EMAIL_USER and EMAIL_PASSWORD required."
    );
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: GMAIL_CONFIG.host,
      port: GMAIL_CONFIG.port,
      secure: GMAIL_CONFIG.secure,
      auth: {
        user: GMAIL_CONFIG.user,
        pass: GMAIL_CONFIG.password,
      },
      // Connection pool for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // Timeout settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });

    console.log("✅ Gmail SMTP transporter created:", {
      host: GMAIL_CONFIG.host,
      port: GMAIL_CONFIG.port,
      user: GMAIL_CONFIG.user?.substring(0, 5) + "***",
    });
  }

  return transporter;
}

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
 * Check if Gmail SMTP is configured
 */
export function isGmailConfigured(): boolean {
  return !!(GMAIL_CONFIG.user && GMAIL_CONFIG.password);
}

/**
 * Get the "from" address
 */
export function getFromAddress(): string {
  return GMAIL_CONFIG.from;
}

/**
 * Send raw email via Gmail SMTP
 */
export async function sendRawEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendEmailResult> {
  const transport = getTransporter();

  if (!transport) {
    return {
      success: false,
      error: "Gmail SMTP not configured",
    };
  }

  try {
    const result = await transport.sendMail({
      from: GMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    });

    console.log(`✅ Email sent via Gmail SMTP to ${options.to}:`, result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("Gmail SMTP error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify Gmail SMTP connection
 */
export async function verifyConnection(): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    return false;
  }

  try {
    await transport.verify();
    console.log("✅ Gmail SMTP connection verified");
    return true;
  } catch (error) {
    console.error("Gmail SMTP verification failed:", error);
    return false;
  }
}

export default {
  isConfigured: isGmailConfigured,
  getFromAddress,
  sendRawEmail,
  verifyConnection,
};
