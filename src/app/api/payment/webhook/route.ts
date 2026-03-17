/**
 * PayMongo Webhook Handler
 *
 * Handles payment status updates from PayMongo.
 * POST /api/payment/webhook
 *
 * Webhook events:
 * - source.chargeable: E-wallet payment authorized, ready to charge
 * - payment.paid: Payment completed successfully
 * - payment.failed: Payment failed
 * - payment_intent.succeeded: Card payment succeeded
 * - payment_intent.payment_failed: Card payment failed
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  createPaymentFromSource,
  isPayMongoConfigured,
} from "@/lib/payment";
import { updateOrderPaymentStatus } from "@/lib/firebase/orders";

const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    // Check if PayMongo is configured
    if (!isPayMongoConfigured()) {
      console.warn("PayMongo webhook received but not configured");
      return NextResponse.json({ received: true });
    }

    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("paymongo-signature");

    // Verify webhook signature (skip in development if no secret)
    if (WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(body, signature, WEBHOOK_SECRET);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);
    const eventType = event.data?.attributes?.type;
    const eventData = event.data?.attributes?.data;

    console.log(`📥 PayMongo webhook: ${eventType}`, event.data?.id);

    switch (eventType) {
      case "source.chargeable": {
        // E-wallet payment authorized - create the actual payment
        const source = eventData;
        const sourceId = source?.id;
        const amount = source?.attributes?.amount / 100; // Convert from centavos
        const metadata = source?.attributes?.metadata || {};
        const orderId = metadata.orderId;
        const orderNumber = metadata.orderNumber;

        if (sourceId && amount > 0 && orderId) {
          console.log(`💳 Creating payment for source ${sourceId}`);

          const paymentResult = await createPaymentFromSource(
            sourceId,
            amount,
            `Order ${orderNumber || orderId}`
          );

          if (paymentResult.success) {
            console.log(`✅ Payment created: ${paymentResult.paymentId}`);

            // Update order payment status in Firebase
            await updateOrderPaymentStatus(orderId, {
              status: "processing",
              paymentId: paymentResult.paymentId,
              sourceId: sourceId,
              paidAt: new Date().toISOString(),
            });
          } else {
            console.error(
              `❌ Failed to create payment: ${paymentResult.error}`
            );
          }
        }
        break;
      }

      case "payment.paid": {
        // Payment completed successfully
        const payment = eventData;
        const paymentId = payment?.id;
        const sourceInfo = payment?.attributes?.source;
        const metadata = sourceInfo?.metadata || payment?.attributes?.metadata;
        const orderId = metadata?.orderId;

        if (orderId) {
          console.log(`✅ Payment ${paymentId} succeeded for order ${orderId}`);

          await updateOrderPaymentStatus(orderId, {
            status: "paid",
            paymentId: paymentId,
            paidAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "payment.failed": {
        // Payment failed
        const payment = eventData;
        const sourceInfo = payment?.attributes?.source;
        const metadata = sourceInfo?.metadata || payment?.attributes?.metadata;
        const orderId = metadata?.orderId;

        if (orderId) {
          console.log(`❌ Payment failed for order ${orderId}`);

          await updateOrderPaymentStatus(orderId, {
            status: "failed",
            failedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        // Card payment succeeded
        const intent = eventData;
        const intentId = intent?.id;
        const metadata = intent?.attributes?.metadata;
        const orderId = metadata?.orderId;

        if (orderId) {
          console.log(`✅ Card payment ${intentId} succeeded for order ${orderId}`);

          await updateOrderPaymentStatus(orderId, {
            status: "paid",
            paymentIntentId: intentId,
            paidAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        // Card payment failed
        const intent = eventData;
        const metadata = intent?.attributes?.metadata;
        const orderId = metadata?.orderId;

        if (orderId) {
          console.log(`❌ Card payment failed for order ${orderId}`);

          await updateOrderPaymentStatus(orderId, {
            status: "failed",
            failedAt: new Date().toISOString(),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 even on error to prevent retries for parsing issues
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}

// GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({
    status: "PayMongo webhook endpoint active",
    configured: isPayMongoConfigured(),
  });
}
