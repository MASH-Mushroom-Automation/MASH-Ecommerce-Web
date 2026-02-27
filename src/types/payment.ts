/**
 * Payment System Type Definitions
 *
 * Centralized types for the MASH payment system.
 * Covers PayMongo integration (GCash, GrabPay, Card, PayMaya) and COD.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Payment Method
// ---------------------------------------------------------------------------

/** All supported payment methods */
export const PAYMENT_METHODS = [
  "cod",
  "gcash",
  "grab_pay",
  "card",
  "paymaya",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Human-readable labels for each method */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  gcash: "GCash",
  grab_pay: "GrabPay",
  card: "Credit / Debit Card",
  paymaya: "PayMaya",
};

/** Short descriptions shown in the payment selector */
export const PAYMENT_METHOD_DESCRIPTIONS: Record<PaymentMethod, string> = {
  cod: "Pay when you receive your order",
  gcash: "Pay using your GCash e-wallet",
  grab_pay: "Pay using your GrabPay e-wallet",
  card: "Visa, Mastercard, and other major cards",
  paymaya: "Pay using your PayMaya e-wallet",
};

// ---------------------------------------------------------------------------
// Payment Status
// ---------------------------------------------------------------------------

export const PAYMENT_STATUSES = [
  "idle",
  "pending",
  "awaiting_payment_method",
  "processing",
  "awaiting_redirect",
  "succeeded",
  "failed",
  "cancelled",
  "expired",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Payment State (context / reducer)
// ---------------------------------------------------------------------------

export interface PaymentState {
  selectedMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  checkoutUrl: string | null;
  error: string | null;
  isProcessing: boolean;
}

export const INITIAL_PAYMENT_STATE: PaymentState = {
  selectedMethod: "cod",
  paymentStatus: "idle",
  paymentId: null,
  checkoutUrl: null,
  error: null,
  isProcessing: false,
};

// ---------------------------------------------------------------------------
// Payment Actions (reducer)
// ---------------------------------------------------------------------------

export type PaymentAction =
  | { type: "SELECT_METHOD"; method: PaymentMethod }
  | { type: "START_PAYMENT" }
  | {
      type: "PAYMENT_CREATED";
      paymentId: string;
      checkoutUrl: string | null;
    }
  | { type: "PAYMENT_PROCESSING" }
  | { type: "PAYMENT_SUCCEEDED"; paymentId: string }
  | { type: "PAYMENT_FAILED"; error: string }
  | { type: "PAYMENT_CANCELLED" }
  | { type: "RESET" };

// ---------------------------------------------------------------------------
// API Response Shapes (PayMongo)
// ---------------------------------------------------------------------------

export interface PaymentCreateRequest {
  paymentMethod: PaymentMethod;
  amount: number;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  description?: string;
  /** Card-specific fields */
  cardToken?: string;
}

export interface PaymentCreateResponse {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  status?: PaymentStatus;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: PaymentStatus;
  paymentId: string;
  paidAt?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Order Payment Details (stored with order)
// ---------------------------------------------------------------------------

export interface OrderPaymentDetails {
  paymentId: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: string;
  sourceId?: string;
  paymentIntentId?: string;
}

// ---------------------------------------------------------------------------
// Zod Schemas for Runtime Validation
// ---------------------------------------------------------------------------

export const paymentMethodSchema = z.enum(["cod", "gcash", "grab_pay", "card", "paymaya"]);

export const paymentStatusSchema = z.enum([
  "idle",
  "pending",
  "awaiting_payment_method",
  "processing",
  "awaiting_redirect",
  "succeeded",
  "failed",
  "cancelled",
  "expired",
]);

export const paymentCreateResponseSchema = z.object({
  success: z.boolean(),
  paymentId: z.string().optional(),
  checkoutUrl: z.string().url().optional(),
  status: paymentStatusSchema.optional(),
  error: z.string().optional(),
});

export const paymentStatusResponseSchema = z.object({
  success: z.boolean(),
  status: paymentStatusSchema,
  paymentId: z.string(),
  paidAt: z.string().optional(),
  error: z.string().optional(),
});

export const orderPaymentDetailsSchema = z.object({
  paymentId: z.string(),
  paymentMethod: paymentMethodSchema,
  status: paymentStatusSchema,
  amount: z.number().positive(),
  currency: z.string(),
  paidAt: z.string().optional(),
  sourceId: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when the method requires a PayMongo redirect flow */
export function isRedirectMethod(method: PaymentMethod): boolean {
  return method === "gcash" || method === "grab_pay" || method === "paymaya";
}

/** Returns true when the method is a card-based payment intent */
export function isCardMethod(method: PaymentMethod): boolean {
  return method === "card";
}

/** Returns true when the method requires no online payment */
export function isCodMethod(method: PaymentMethod): boolean {
  return method === "cod";
}
