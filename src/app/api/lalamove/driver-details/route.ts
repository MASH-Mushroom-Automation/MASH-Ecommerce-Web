/**
 * Lalamove Driver Details API Endpoint
 * 
 * GET /api/lalamove/driver-details?orderId=xxx&driverId=yyy
 * Fetches assigned driver information including location
 * Used for real-time rider tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { getLalamoveClient } from "@/lib/lalamove/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const driverId = searchParams.get("driverId");

    if (!orderId || !driverId) {
      return NextResponse.json(
        { error: "Missing orderId or driverId parameter" },
        { status: 400 }
      );
    }

    console.log("[Lalamove API] Fetching driver details:", { orderId, driverId });

    const lalamoveClient = getLalamoveClient();
    const driverDetails = await lalamoveClient.getDriverDetails(orderId, driverId);

    console.log("[Lalamove API] Driver details fetched:", {
      driverId,
      name: driverDetails.name,
      hasCoordinates: !!driverDetails.coordinates,
    });

    return NextResponse.json({
      success: true,
      data: driverDetails,
    });
  } catch (error: any) {
    console.error("[Lalamove API] Error fetching driver details:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch driver details",
      },
      { status: 500 }
    );
  }
}
