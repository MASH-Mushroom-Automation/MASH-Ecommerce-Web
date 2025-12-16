/**
 * Payment Intent Creation API Route
 *
 * Creates payment intents for card payments or sources for e-wallet payments.
 * POST /api/payment/create-intent
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createCardPaymentIntent,
  createEWalletPayment,
  isPayMongoConfigured,
  getPublicKey,
  type PaymentMethodType,
} from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    // Check if PayMongo is configured
    if (!isPayMongoConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment service is not configured",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      paymentMethod,
      amount,
      orderId,
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      description,
    } = body;

    // Validate required fields
    if (!paymentMethod || !amount || !orderId || !orderNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: paymentMethod, amount, orderId, orderNumber",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount",
        },
        { status: 400 }
      );
    }

    let result;

    // Route to appropriate payment method
    switch (paymentMethod as PaymentMethodType) {
      case "gcash":
      case "grab_pay":
      case "paymaya":
        // E-wallet payments use Sources API
        result = await createEWalletPayment(
          paymentMethod,
          amount,
          orderId,
          orderNumber,
          customerEmail || "",
          customerName || "Customer",
          customerPhone || "",
          description
        );
        break;

      case "card":
        // Card payments use Payment Intents API
        result = await createCardPaymentIntent(
          amount,
          orderId,
          orderNumber,
          customerEmail || "",
          customerName || "Customer",
          description
        );
        
        // For card payments, also return the public key for client-side use
        if (result.success) {
          return NextResponse.json({
            ...result,
            publicKey: getPublicKey(),
          });
        }
        break;

      case "cod":
        // Cash on Delivery doesn't need payment processing
        return NextResponse.json({
          success: true,
          paymentMethod: "cod",
          status: "pending",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported payment method: ${paymentMethod}`,
          },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create payment",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if payment is configured
export async function GET() {
  return NextResponse.json({
    configured: isPayMongoConfigured(),
    publicKey: isPayMongoConfigured() ? getPublicKey() : null,
    supportedMethods: ["gcash", "grab_pay", "card", "cod"],
  });
}
