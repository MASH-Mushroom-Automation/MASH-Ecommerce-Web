/**
 * Payment Status Polling & Verification API Route
 *
 * GET /api/payment/status?paymentId=X&type=source|intent
 *
 * Polling endpoint for the frontend to check whether a payment has
 * completed.  Returns a consistent shape:
 *   { success, status, paid, paymentId, method?, timeout?, message?, error? }
 *
 * PAY-010: Full rewrite with Zod query-param validation, rate-limit
 *          headers, 5-minute timeout detection, and no sensitive data.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSourceStatus,
  getPaymentIntentStatus,
  getCheckoutSessionStatus,
  isPayMongoConfigured,
} from "@/lib/payment";
import { paymentMethodSchema } from "@/types/payment";
import type { PaymentStatus } from "@/types/payment";
import {
  checkRateLimit,
  getRateLimitStatus,
  RATE_LIMITS,
} from "@/middleware/rate-limit";

// ---------------------------------------------------------------------------
// Query-param validation
// ---------------------------------------------------------------------------

const statusQuerySchema = z.object({
  /** Payment ID (PayMongo source or intent id). Accepts "paymentId" or "id". */
  paymentId: z.string().min(1, "Payment ID is required"),
  /** Whether this is a source (e-wallet) or intent (card) or checkout_session lookup. */
  type: z.enum(["source", "intent", "checkout_session"]).default("source"),
  /** Optional: payment method for enriched response. */
  method: paymentMethodSchema.optional(),
  /**
   * Optional ISO-8601 timestamp of when the payment was initiated.
   * Used for 5-minute timeout detection.
   */
  startedAt: z.string().datetime({ offset: true }).optional(),
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Payments older than this are considered timed-out. */
const PAYMENT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const RATE_LIMIT_CATEGORY = "payments";

// ---------------------------------------------------------------------------
// Rate-limit header helpers (same pattern as create-intent PAY-009)
// ---------------------------------------------------------------------------

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
  init?: { status?: number },
) {
  return NextResponse.json(data, {
    ...init,
    headers: rateLimitHeaders(req),
  });
}

// ---------------------------------------------------------------------------
// Response builder -- strips anything sensitive, keeps shape consistent
// ---------------------------------------------------------------------------

interface StatusResponsePayload {
  success: boolean;
  status: PaymentStatus | string;
  paid: boolean;
  paymentId: string;
  method?: string;
  timeout?: boolean;
  message?: string;
  error?: string;
}

function buildResponse(overrides: Partial<StatusResponsePayload> & { success: boolean }): StatusResponsePayload {
  return {
    success: overrides.success,
    status: overrides.status ?? "pending",
    paid: overrides.paid ?? false,
    paymentId: overrides.paymentId ?? "",
    ...(overrides.method !== undefined ? { method: overrides.method } : {}),
    ...(overrides.timeout !== undefined ? { timeout: overrides.timeout } : {}),
    ...(overrides.message !== undefined ? { message: overrides.message } : {}),
    ...(overrides.error !== undefined ? { error: overrides.error } : {}),
  };
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  // --- Rate limiting guard ---
  const rateLimitResponse = checkRateLimit(request, RATE_LIMIT_CATEGORY);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // --- Validate query params ---
    const params = request.nextUrl.searchParams;

    // Support both "paymentId" and legacy "id" query param
    const rawPaymentId = params.get("paymentId") ?? params.get("id") ?? "";

    const parsed = statusQuerySchema.safeParse({
      paymentId: rawPaymentId,
      type: params.get("type") ?? undefined,
      method: params.get("method") ?? undefined,
      startedAt: params.get("startedAt") ?? undefined,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldPath = firstIssue.path.join(".");
      const friendlyMessage = fieldPath
        ? `Validation error on "${fieldPath}": ${firstIssue.message}`
        : firstIssue.message;

      return jsonWithHeaders(
        buildResponse({ success: false, error: friendlyMessage }),
        request,
        { status: 400 },
      );
    }

    const { paymentId, type, method, startedAt } = parsed.data;

    // --- PayMongo must be configured ---
    if (!isPayMongoConfigured()) {
      return jsonWithHeaders(
        buildResponse({
          success: false,
          paymentId,
          error: "Payment service is not configured. Please try again later.",
        }),
        request,
        { status: 503 },
      );
    }

    // --- Timeout detection ---
    if (startedAt) {
      const elapsed = Date.now() - new Date(startedAt).getTime();
      if (elapsed > PAYMENT_TIMEOUT_MS) {
        return jsonWithHeaders(
          buildResponse({
            success: true,
            status: "pending",
            paid: false,
            paymentId,
            method,
            timeout: true,
            message:
              "Payment verification timed out after 5 minutes. Please create a new payment or contact support.",
          }),
          request,
        );
      }
    }

    // --- Fetch status from PayMongo ---
    const result =
      type === "intent"
        ? await getPaymentIntentStatus(paymentId)
        : type === "checkout_session"
          ? await getCheckoutSessionStatus(paymentId)
          : await getSourceStatus(paymentId);

    return jsonWithHeaders(
      buildResponse({
        success: true,
        status: result.status,
        paid: result.paid,
        paymentId: result.paymentId ?? paymentId,
        method,
      }),
      request,
    );
  } catch (error) {
    console.error("[Payment] status check error:", error);
    return jsonWithHeaders(
      buildResponse({
        success: false,
        error: "Failed to check payment status. Please try again.",
      }),
      request,
      { status: 500 },
    );
  }
}
