/**
 * Payment Status API Route
 *
 * Check the status of a payment (source or payment intent).
 * GET /api/payment/status?id=xxx&type=source|intent
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSourceStatus,
  getPaymentIntentStatus,
  isPayMongoConfigured,
} from "@/lib/payment";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("id");
    const type = searchParams.get("type") || "source";

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment ID is required",
        },
        { status: 400 }
      );
    }

    let result;

    if (type === "intent") {
      result = await getPaymentIntentStatus(paymentId);
    } else {
      result = await getSourceStatus(paymentId);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check payment status",
      },
      { status: 500 }
    );
  }
}
