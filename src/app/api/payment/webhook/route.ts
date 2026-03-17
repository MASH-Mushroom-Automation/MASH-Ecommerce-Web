/**
 * PayMongo Webhook Handler -- Enhanced Event Processing (PAY-011)
 *
 * Handles payment status updates from PayMongo with:
 * - All PayMongo event types (source, payment, payment_intent)
 * - Firebase order status updates
 * - Order confirmation email on successful payment
 * - Structured logging for every event
 * - Signature verification enforced in production
 * - Idempotency: duplicate webhooks do not trigger duplicate actions
 * - Always returns 200 OK (even on processing errors)
 *
 * POST /api/payment/webhook
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  createPaymentFromSource,
  isPayMongoConfigured,
} from "@/lib/payment";
import { updateOrderPaymentStatus } from "@/lib/firebase/orders";
import { sendOrderConfirmationEmail } from "@/lib/email/send-email";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET || "";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// Idempotency: In-memory set of processed event IDs.
// Prevents duplicate side-effects when PayMongo retries delivery.
// Using a bounded LRU-style set to avoid unbounded memory growth.
// ---------------------------------------------------------------------------
const MAX_PROCESSED_EVENTS = 1000;
const processedEventIds = new Set<string>();

function markEventProcessed(eventId: string): void {
  if (processedEventIds.size >= MAX_PROCESSED_EVENTS) {
    // Evict oldest entry (first inserted)
    const oldest = processedEventIds.values().next().value;
    if (oldest) processedEventIds.delete(oldest);
  }
  processedEventIds.add(eventId);
}

function isEventProcessed(eventId: string): boolean {
  return processedEventIds.has(eventId);
}

// Exported for testing only
export const _testing = {
  processedEventIds,
  markEventProcessed,
  isEventProcessed,
  MAX_PROCESSED_EVENTS,
};

// ---------------------------------------------------------------------------
// Structured logger
// ---------------------------------------------------------------------------
interface WebhookLog {
  level: "info" | "warn" | "error";
  eventId?: string;
  eventType?: string;
  orderId?: string;
  message: string;
  detail?: unknown;
  timestamp: string;
}

function logWebhook(entry: Omit<WebhookLog, "timestamp">): void {
  const log: WebhookLog = { ...entry, timestamp: new Date().toISOString() };
  const prefix = `[WEBHOOK][${log.level.toUpperCase()}]`;
  const msg = `${prefix} ${log.message}`;

  switch (log.level) {
    case "error":
      console.error(msg, { eventId: log.eventId, eventType: log.eventType, orderId: log.orderId, detail: log.detail });
      break;
    case "warn":
      console.warn(msg, { eventId: log.eventId, eventType: log.eventType, orderId: log.orderId });
      break;
    default:
      console.log(msg, { eventId: log.eventId, eventType: log.eventType, orderId: log.orderId });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract orderId from PayMongo event data (various nesting patterns). */
function extractOrderId(eventData: Record<string, unknown> | undefined): string | undefined {
  if (!eventData) return undefined;
  const attrs = eventData.attributes as Record<string, unknown> | undefined;
  // source.chargeable stores metadata on .attributes.metadata
  const directMeta = attrs?.metadata as Record<string, string> | undefined;
  if (directMeta?.orderId) return directMeta.orderId;
  // payment.paid stores metadata on .attributes.source.metadata
  const sourceInfo = attrs?.source as Record<string, unknown> | undefined;
  const sourceMeta = sourceInfo?.metadata as Record<string, string> | undefined;
  if (sourceMeta?.orderId) return sourceMeta.orderId;
  return undefined;
}

/** Extract customer email from metadata. */
function extractEmail(eventData: Record<string, unknown> | undefined): string | undefined {
  if (!eventData) return undefined;
  const attrs = eventData.attributes as Record<string, unknown> | undefined;
  const directMeta = attrs?.metadata as Record<string, string> | undefined;
  if (directMeta?.email) return directMeta.email;
  const sourceInfo = attrs?.source as Record<string, unknown> | undefined;
  const sourceMeta = sourceInfo?.metadata as Record<string, string> | undefined;
  if (sourceMeta?.email) return sourceMeta.email;
  return undefined;
}

/** Attempt to send order confirmation email (best-effort, never throws). */
async function trySendConfirmationEmail(
  orderId: string,
  eventData: Record<string, unknown> | undefined,
): Promise<void> {
  try {
    const email = extractEmail(eventData);
    if (!email) {
      logWebhook({ level: "warn", orderId, message: "No customer email in metadata -- skipping confirmation email" });
      return;
    }
    const attrs = eventData?.attributes as Record<string, unknown> | undefined;
    const meta = (attrs?.metadata || (attrs?.source as Record<string, unknown>)?.metadata) as Record<string, string> | undefined;
    const orderNumber = meta?.orderNumber || orderId;

    await sendOrderConfirmationEmail(email, {
      orderNumber,
      customerName: meta?.customerName || "Customer",
      items: [],
      total: 0,
    });
    logWebhook({ level: "info", orderId, message: `Confirmation email sent to ${email}` });
  } catch (err) {
    logWebhook({ level: "error", orderId, message: "Failed to send confirmation email", detail: err });
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const startMs = Date.now();

  try {
    // 1. Configuration gate
    if (!isPayMongoConfigured()) {
      logWebhook({ level: "warn", message: "Webhook received but PayMongo not configured" });
      return NextResponse.json({ received: true });
    }

    // 2. Read raw body
    const body = await request.text();
    const signature = request.headers.get("paymongo-signature");

    // 3. Signature verification
    //    - Production: REQUIRED (reject if missing or invalid)
    //    - Development: Optional (warn if missing, skip verification)
    if (IS_PRODUCTION) {
      if (!WEBHOOK_SECRET || !signature) {
        logWebhook({ level: "error", message: "Missing webhook secret or signature in production" });
        return NextResponse.json({ error: "Signature required" }, { status: 401 });
      }
      const isValid = verifyWebhookSignature(body, signature, WEBHOOK_SECRET);
      if (!isValid) {
        logWebhook({ level: "error", message: "Invalid webhook signature" });
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(body, signature, WEBHOOK_SECRET);
      if (!isValid) {
        logWebhook({ level: "warn", message: "Invalid webhook signature (dev mode -- processing anyway)" });
      }
    }

    // 4. Parse event
    const event = JSON.parse(body);
    const eventId: string = event.data?.id || `unknown_${Date.now()}`;
    const eventType: string = event.data?.attributes?.type || "unknown";
    const eventData = event.data?.attributes?.data as Record<string, unknown> | undefined;

    logWebhook({ level: "info", eventId, eventType, message: "Webhook received" });

    // 5. Idempotency check
    if (isEventProcessed(eventId)) {
      logWebhook({ level: "info", eventId, eventType, message: "Duplicate event -- skipping" });
      return NextResponse.json({ received: true, duplicate: true });
    }

    // 6. Route by event type
    switch (eventType) {
      case "source.chargeable": {
        const source = eventData;
        const sourceId = (source as Record<string, unknown>)?.id as string | undefined;
        const amount = ((source as Record<string, unknown>)?.attributes as Record<string, number>)?.amount;
        const amountPesos = amount ? amount / 100 : 0;
        const orderId = extractOrderId(source);
        const meta = ((source as Record<string, unknown>)?.attributes as Record<string, unknown>)?.metadata as Record<string, string> | undefined;
        const orderNumber = meta?.orderNumber;

        if (sourceId && amountPesos > 0 && orderId) {
          logWebhook({ level: "info", eventId, eventType, orderId, message: `Creating payment for source ${sourceId}` });

          const paymentResult = await createPaymentFromSource(sourceId, amountPesos, `Order ${orderNumber || orderId}`);

          if (paymentResult.success) {
            logWebhook({ level: "info", eventId, eventType, orderId, message: `Payment created: ${paymentResult.paymentId}` });
            await updateOrderPaymentStatus(orderId, {
              status: "processing",
              paymentId: paymentResult.paymentId,
              sourceId,
              paidAt: new Date().toISOString(),
            });
          } else {
            logWebhook({ level: "error", eventId, eventType, orderId, message: `Payment creation failed: ${paymentResult.error}` });
          }
        } else {
          logWebhook({ level: "warn", eventId, eventType, message: "source.chargeable missing required fields", detail: { sourceId, amountPesos, orderId } });
        }
        break;
      }

      case "payment.paid": {
        const payment = eventData;
        const paymentId = (payment as Record<string, unknown>)?.id as string | undefined;
        const orderId = extractOrderId(payment);

        if (orderId) {
          logWebhook({ level: "info", eventId, eventType, orderId, message: `Payment ${paymentId} succeeded` });
          await updateOrderPaymentStatus(orderId, {
            status: "paid",
            paymentId,
            paidAt: new Date().toISOString(),
          });
          // Note: Email is sent client-side with full order data (items, totals).
          // Webhook metadata lacks complete order info, so we skip here to avoid
          // sending duplicate or incomplete confirmation emails.
        } else {
          logWebhook({ level: "warn", eventId, eventType, message: "payment.paid missing orderId" });
        }
        break;
      }

      case "payment.failed": {
        const payment = eventData;
        const orderId = extractOrderId(payment);

        if (orderId) {
          logWebhook({ level: "info", eventId, eventType, orderId, message: "Payment failed" });
          await updateOrderPaymentStatus(orderId, {
            status: "failed",
            failedAt: new Date().toISOString(),
          });
        } else {
          logWebhook({ level: "warn", eventId, eventType, message: "payment.failed missing orderId" });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const intent = eventData;
        const intentId = (intent as Record<string, unknown>)?.id as string | undefined;
        const orderId = extractOrderId(intent);

        if (orderId) {
          logWebhook({ level: "info", eventId, eventType, orderId, message: `Card payment ${intentId} succeeded` });
          await updateOrderPaymentStatus(orderId, {
            status: "paid",
            paymentIntentId: intentId,
            paidAt: new Date().toISOString(),
          });
          // Note: Email is sent client-side with full order data (items, totals).
          // Webhook metadata lacks complete order info, so we skip here to avoid
          // sending duplicate or incomplete confirmation emails.
        } else {
          logWebhook({ level: "warn", eventId, eventType, message: "payment_intent.succeeded missing orderId" });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = eventData;
        const orderId = extractOrderId(intent);

        if (orderId) {
          logWebhook({ level: "info", eventId, eventType, orderId, message: "Card payment failed" });
          await updateOrderPaymentStatus(orderId, {
            status: "failed",
            failedAt: new Date().toISOString(),
          });
        } else {
          logWebhook({ level: "warn", eventId, eventType, message: "payment_intent.payment_failed missing orderId" });
        }
        break;
      }

      default:
        logWebhook({ level: "info", eventId, eventType, message: "Unhandled event type" });
    }

    // 7. Mark event processed (after successful handling)
    markEventProcessed(eventId);

    const durationMs = Date.now() - startMs;
    logWebhook({ level: "info", eventId, eventType, message: `Webhook processed in ${durationMs}ms` });

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    const durationMs = Date.now() - startMs;
    logWebhook({ level: "error", message: `Webhook processing error (${durationMs}ms)`, detail: error });
    // Return 200 even on error to prevent retries for parsing issues
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}

// ---------------------------------------------------------------------------
// GET endpoint for webhook verification
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json({
    status: "PayMongo webhook endpoint active",
    configured: isPayMongoConfigured(),
  });
}
