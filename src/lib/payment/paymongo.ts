/**
 * PayMongo Payment Service
 *
 * Handles payment processing via PayMongo API.
 * Supports: GCash, GrabPay, Credit/Debit Cards
 *
 * @see https://developers.paymongo.com/reference
 */

// PayMongo API configuration
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || "";
const PAYMONGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY || "";
const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

// Check if PayMongo is configured
export function isPayMongoConfigured(): boolean {
  return !!PAYMONGO_SECRET_KEY && !!PAYMONGO_PUBLIC_KEY;
}

/**
 * Payment method types supported
 */
export type PaymentMethodType =
  | "gcash"
  | "grab_pay"
  | "card"
  | "paymaya"
  | "cod";

/**
 * Payment status types
 */
export type PaymentStatus =
  | "pending"
  | "awaiting_payment_method"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

/**
 * Source/Payment Intent creation result
 */
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  status?: PaymentStatus;
  error?: string;
}

/**
 * Payment details for order
 */
export interface PaymentDetails {
  paymentId: string;
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: string;
  sourceId?: string;
  paymentIntentId?: string;
}

/**
 * Create payment headers with API key
 */
function getHeaders(): HeadersInit {
  const encodedKey = Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64");
  return {
    Authorization: `Basic ${encodedKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Create a GCash or GrabPay payment source
 *
 * For e-wallet payments (GCash, GrabPay, PayMaya),
 * we create a Source that redirects the user to authorize payment.
 */
export async function createEWalletPayment(
  type: "gcash" | "grab_pay" | "paymaya",
  amount: number,
  orderId: string,
  orderNumber: string,
  customerEmail: string,
  customerName: string,
  customerPhone: string,
  description?: string
): Promise<PaymentResult> {
  if (!isPayMongoConfigured()) {
    console.warn("PayMongo not configured");
    return { success: false, error: "Payment service not configured" };
  }

  try {
    // Amount in centavos (PayMongo requires smallest currency unit)
    const amountInCentavos = Math.round(amount * 100);

    const payload = {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          type: type,
          redirect: {
            success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/payment-success?orderId=${orderId}`,
            failed: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/payment-failed?orderId=${orderId}`,
          },
          billing: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          metadata: {
            orderId,
            orderNumber,
          },
        },
      },
    };

    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo source creation failed:", data);
      return {
        success: false,
        error: data.errors?.[0]?.detail || "Failed to create payment",
      };
    }

    const source = data.data;
    const checkoutUrl = source.attributes.redirect.checkout_url;

    console.log(`✅ PayMongo ${type} source created:`, source.id);

    return {
      success: true,
      paymentId: source.id,
      checkoutUrl,
      status: source.attributes.status as PaymentStatus,
    };
  } catch (error) {
    console.error("PayMongo e-wallet error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment error",
    };
  }
}

/**
 * Create a Payment Intent for card payments
 *
 * For card payments, we use Payment Intents which handle
 * 3D Secure authentication automatically.
 */
export async function createCardPaymentIntent(
  amount: number,
  orderId: string,
  orderNumber: string,
  customerEmail: string,
  customerName: string,
  description?: string
): Promise<PaymentResult> {
  if (!isPayMongoConfigured()) {
    console.warn("PayMongo not configured");
    return { success: false, error: "Payment service not configured" };
  }

  try {
    const amountInCentavos = Math.round(amount * 100);

    const payload = {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          payment_method_allowed: ["card"],
          payment_method_options: {
            card: {
              request_three_d_secure: "any",
            },
          },
          description: description || `Order ${orderNumber}`,
          statement_descriptor: "MASH MUSHROOMS",
          metadata: {
            orderId,
            orderNumber,
            customerEmail,
            customerName,
          },
        },
      },
    };

    const response = await fetch(`${PAYMONGO_API_URL}/payment_intents`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo payment intent creation failed:", data);
      return {
        success: false,
        error: data.errors?.[0]?.detail || "Failed to create payment intent",
      };
    }

    const paymentIntent = data.data;

    console.log("✅ PayMongo payment intent created:", paymentIntent.id);

    return {
      success: true,
      paymentId: paymentIntent.id,
      status: paymentIntent.attributes.status as PaymentStatus,
    };
  } catch (error) {
    console.error("PayMongo card payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment error",
    };
  }
}

/**
 * Attach a payment method to a payment intent (for card payments)
 */
export async function attachPaymentMethod(
  paymentIntentId: string,
  paymentMethodId: string,
  returnUrl: string
): Promise<PaymentResult> {
  if (!isPayMongoConfigured()) {
    return { success: false, error: "Payment service not configured" };
  }

  try {
    const payload = {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          client_key: PAYMONGO_PUBLIC_KEY,
          return_url: returnUrl,
        },
      },
    };

    const response = await fetch(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}/attach`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo attach failed:", data);
      return {
        success: false,
        error: data.errors?.[0]?.detail || "Failed to process payment",
      };
    }

    const result = data.data;
    const nextAction = result.attributes.next_action;

    return {
      success: true,
      paymentId: result.id,
      checkoutUrl: nextAction?.redirect?.url,
      status: result.attributes.status as PaymentStatus,
    };
  } catch (error) {
    console.error("PayMongo attach error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment error",
    };
  }
}

/**
 * Get payment source status
 */
export async function getSourceStatus(sourceId: string): Promise<{
  status: PaymentStatus;
  paid: boolean;
  paymentId?: string;
}> {
  if (!isPayMongoConfigured()) {
    return { status: "failed", paid: false };
  }

  try {
    const response = await fetch(`${PAYMONGO_API_URL}/sources/${sourceId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: "failed", paid: false };
    }

    const source = data.data;
    const status = source.attributes.status;
    const payments = source.attributes.payments || [];

    return {
      status: status as PaymentStatus,
      paid: status === "chargeable" || payments.length > 0,
      paymentId: payments[0]?.id,
    };
  } catch (error) {
    console.error("PayMongo status check error:", error);
    return { status: "failed", paid: false };
  }
}

/**
 * Get payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<{
  status: PaymentStatus;
  paid: boolean;
  paymentId?: string;
}> {
  if (!isPayMongoConfigured()) {
    return { status: "failed", paid: false };
  }

  try {
    const response = await fetch(
      `${PAYMONGO_API_URL}/payment_intents/${paymentIntentId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { status: "failed", paid: false };
    }

    const intent = data.data;
    const status = intent.attributes.status;
    const payments = intent.attributes.payments || [];

    return {
      status: status as PaymentStatus,
      paid: status === "succeeded",
      paymentId: payments[0]?.id,
    };
  } catch (error) {
    console.error("PayMongo intent status error:", error);
    return { status: "failed", paid: false };
  }
}

/**
 * Create a payment for a chargeable source (after user authorizes)
 */
export async function createPaymentFromSource(
  sourceId: string,
  amount: number,
  description: string
): Promise<PaymentResult> {
  if (!isPayMongoConfigured()) {
    return { success: false, error: "Payment service not configured" };
  }

  try {
    const amountInCentavos = Math.round(amount * 100);

    const payload = {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          description,
          source: {
            id: sourceId,
            type: "source",
          },
        },
      },
    };

    const response = await fetch(`${PAYMONGO_API_URL}/payments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("PayMongo payment creation failed:", data);
      return {
        success: false,
        error: data.errors?.[0]?.detail || "Failed to process payment",
      };
    }

    const payment = data.data;

    console.log("✅ PayMongo payment created:", payment.id);

    return {
      success: true,
      paymentId: payment.id,
      status: payment.attributes.status as PaymentStatus,
    };
  } catch (error) {
    console.error("PayMongo payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment error",
    };
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookSecretKey: string
): boolean {
  try {
    const crypto = require("crypto");
    const [timestamp, testSignature, liveSignature] = signature.split(",");

    const signedPayload = `${timestamp.split("=")[1]}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecretKey)
      .update(signedPayload)
      .digest("hex");

    // Check both test and live signatures
    const testSig = testSignature?.split("=")[1];
    const liveSig = liveSignature?.split("=")[1];

    return expectedSignature === testSig || expectedSignature === liveSig;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

/**
 * Get public key for client-side use
 */
export function getPublicKey(): string {
  return PAYMONGO_PUBLIC_KEY;
}

export default {
  isPayMongoConfigured,
  createEWalletPayment,
  createCardPaymentIntent,
  attachPaymentMethod,
  getSourceStatus,
  getPaymentIntentStatus,
  createPaymentFromSource,
  verifyWebhookSignature,
  getPublicKey,
};
