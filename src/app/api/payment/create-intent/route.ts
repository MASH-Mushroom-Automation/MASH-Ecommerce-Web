/**
 * Payment Intent / Source Creation API Route
 *
 * POST /api/payment/create-intent
 *   Creates a PayMongo source (e-wallets) or payment intent (card), or
 *   returns immediate success for COD.
 *
 * GET  /api/payment/create-intent
 *   Returns configuration status and supported payment methods.
 *
 * PAY-009: Full rewrite with Zod validation, rate-limiting headers,
 *          and consistent PaymentCreateResponse shape.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createCardCheckoutSession,
  createEWalletPayment,
  isPayMongoConfigured,
  getPublicKey,
} from "@/lib/payment";
import { paymentMethodSchema } from "@/types/payment";
import type { PaymentCreateResponse } from "@/types/payment";
import {
  checkRateLimit,
  getRateLimitStatus,
  RATE_LIMITS,
} from "@/middleware/rate-limit";

// ---------------------------------------------------------------------------
// Request Validation Schema
// ---------------------------------------------------------------------------

const createIntentRequestSchema = z.object({
  paymentMethod: paymentMethodSchema,
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than zero"),
  orderId: z.string().min(1, "Order ID is required"),
  orderNumber: z.string().min(1, "Order number is required"),
  customerEmail: z.string().email("Invalid email address").optional().default(""),
  customerName: z.string().optional().default("Customer"),
  customerPhone: z.string().optional().default(""),
  description: z.string().optional(),
  cardToken: z.string().optional(),
});

type CreateIntentRequest = z.infer<typeof createIntentRequestSchema>;

// ---------------------------------------------------------------------------
// Rate-limit header helpers
// ---------------------------------------------------------------------------

const RATE_LIMIT_CATEGORY = "payments";

function rateLimitHeaders(req: NextRequest): Record<string, string> {
  const status = getRateLimitStatus(req, RATE_LIMIT_CATEGORY);
  const config = RATE_LIMITS[RATE_LIMIT_CATEGORY];
  return {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(status.remaining),
    "X-RateLimit-Reset": status.resetAt.toISOString(),
  };
}

function jsonWithHeaders(
  data: unknown,
  req: NextRequest,
  init?: { status?: number }
) {
  return NextResponse.json(data, {
    ...init,
    headers: rateLimitHeaders(req),
  });
}

// ---------------------------------------------------------------------------
// Consistent response builder
// ---------------------------------------------------------------------------

function buildResponse(
  overrides: Partial<PaymentCreateResponse> & { success: boolean }
): PaymentCreateResponse {
  return {
    success: overrides.success,
    paymentId: overrides.paymentId,
    checkoutUrl: overrides.checkoutUrl,
    status: overrides.status,
    error: overrides.error,
  };
}

// ---------------------------------------------------------------------------
// User-friendly error messages
// ---------------------------------------------------------------------------

const USER_FRIENDLY_ERRORS: Record<string, string> = {
  invalid_amount: "The payment amount is invalid. Please review your order total.",
  unsupported_method: "The selected payment method is not supported.",
  service_unavailable:
    "Online payment is temporarily unavailable. Please try Cash on Delivery or try again later.",
  creation_failed:
    "We could not process your payment. Please try again or choose a different payment method.",
  unexpected:
    "Something went wrong while processing your payment. Please try again.",
};

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // --- Rate limiting guard ---
  const rateLimitResponse = checkRateLimit(request, RATE_LIMIT_CATEGORY);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // --- Parse body ---
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return jsonWithHeaders(
        buildResponse({
          success: false,
          error: "Invalid request body. Expected JSON.",
        }),
        request,
        { status: 400 }
      );
    }

    // --- Zod validation ---
    const parsed = createIntentRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue.path.join(".");
      const friendlyMessage = fieldPath
        ? `Validation error on "${fieldPath}": ${firstIssue.message}`
        : firstIssue.message;

      return jsonWithHeaders(
        buildResponse({ success: false, error: friendlyMessage }),
        request,
        { status: 400 }
      );
    }

    const data: CreateIntentRequest = parsed.data;

    // --- COD: no PayMongo needed ---
    if (data.paymentMethod === "cod") {
      return jsonWithHeaders(
        buildResponse({
          success: true,
          status: "pending",
        }),
        request
      );
    }

    // --- Online methods require PayMongo ---
    if (!isPayMongoConfigured()) {
      return jsonWithHeaders(
        buildResponse({
          success: false,
          error: USER_FRIENDLY_ERRORS.service_unavailable,
        }),
        request,
        { status: 503 }
      );
    }

    // --- E-wallet (GCash, GrabPay, PayMaya): Sources API ---
    if (
      data.paymentMethod === "gcash" ||
      data.paymentMethod === "grab_pay" ||
      data.paymentMethod === "paymaya"
    ) {
      const result = await createEWalletPayment(
        data.paymentMethod,
        data.amount,
        data.orderId,
        data.orderNumber,
        data.customerEmail,
        data.customerName,
        data.customerPhone,
        data.description
      );

      if (!result.success) {
        return jsonWithHeaders(
          buildResponse({
            success: false,
            error: result.error || USER_FRIENDLY_ERRORS.creation_failed,
          }),
          request,
          { status: 400 }
        );
      }

      return jsonWithHeaders(
        buildResponse({
          success: true,
          paymentId: result.paymentId,
          checkoutUrl: result.checkoutUrl,
          status: result.status,
        }),
        request
      );
    }

    // --- Card: Checkout Sessions API (hosted card form + 3DS) ---
    if (data.paymentMethod === "card") {
      const result = await createCardCheckoutSession(
        data.amount,
        data.orderId,
        data.orderNumber,
        data.customerEmail,
        data.customerName,
        data.customerPhone,
        data.description
      );

      if (!result.success) {
        return jsonWithHeaders(
          buildResponse({
            success: false,
            error: result.error || USER_FRIENDLY_ERRORS.creation_failed,
          }),
          request,
          { status: 400 }
        );
      }

      return jsonWithHeaders(
        buildResponse({
          success: true,
          paymentId: result.paymentId,
          checkoutUrl: result.checkoutUrl,
          status: result.status,
        }),
        request
      );
    }

    // --- Unreachable if Zod enum is correct, but defensive ---
    return jsonWithHeaders(
      buildResponse({
        success: false,
        error: USER_FRIENDLY_ERRORS.unsupported_method,
      }),
      request,
      { status: 400 }
    );
  } catch (error) {
    console.error("[Payment] create-intent error:", error);
    return jsonWithHeaders(
      buildResponse({
        success: false,
        error: USER_FRIENDLY_ERRORS.unexpected,
      }),
      request,
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET() {
  const configured = isPayMongoConfigured();
  return NextResponse.json({
    configured,
    publicKey: configured ? getPublicKey() : null,
    supportedMethods: ["cod", "gcash", "grab_pay", "card", "paymaya"],
  });
}
