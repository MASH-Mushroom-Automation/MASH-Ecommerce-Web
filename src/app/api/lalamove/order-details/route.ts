/**
 * Lalamove Order Details API Endpoint
 * 
 * GET /api/lalamove/order-details?orderId=xxx
 * Fetches latest delivery status from Lalamove API
 * Used for manual refresh and polling fallback
 */

import { NextRequest, NextResponse } from "next/server";
import { getLalamoveClient } from "@/lib/lalamove/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    console.log("[Lalamove API] Fetching order details:", orderId);

    const lalamoveClient = getLalamoveClient();
    const orderDetails = await lalamoveClient.getOrderDetails(orderId);

    console.log("[Lalamove API] Order details fetched:", {
      orderId,
      status: orderDetails.status,
      driverId: orderDetails.driverId,
    });

    return NextResponse.json({
      success: true,
      data: orderDetails,
    });
  } catch (error: any) {
    console.error("[Lalamove API] Error fetching order details:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Lalamove order details",
      },
      { status: 500 }
    );
  }
}
