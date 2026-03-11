/**
 * Lalamove Sandbox Event Simulator
 * POST /api/lalamove/sandbox-simulate
 *
 * Simulates Lalamove webhook events by writing directly to Firestore.
 * Only works when LALAMOVE_HOST contains "sandbox" (production safety guard).
 * Used for demos and testing real-time updates without actual Lalamove API calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { FirebaseOrdersService } from "@/lib/firebase/orders";

type SimulateEvent =
  | "ASSIGNING_DRIVER"
  | "DRIVER_ASSIGNED"
  | "PICKED_UP"
  | "COMPLETED"
  | "CANCELED";

interface SimulateRequestBody {
  orderId: string;
  event: SimulateEvent;
}

export async function POST(request: NextRequest) {
  // Production safety guard
  const host = process.env.LALAMOVE_HOST || "";
  if (!host.includes("sandbox")) {
    return NextResponse.json(
      { success: false, message: "Simulator is only available in sandbox mode" },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as SimulateRequestBody;
    const { orderId, event } = body;

    if (!orderId || !event) {
      return NextResponse.json(
        { success: false, message: "orderId and event are required" },
        { status: 400 }
      );
    }

    const validEvents: SimulateEvent[] = [
      "ASSIGNING_DRIVER",
      "DRIVER_ASSIGNED",
      "PICKED_UP",
      "COMPLETED",
      "CANCELED",
    ];

    if (!validEvents.includes(event)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid event. Must be one of: ${validEvents.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    switch (event) {
      case "ASSIGNING_DRIVER":
        await FirebaseOrdersService.updateLalamoveTracking(orderId, {
          status: "ASSIGNING_DRIVER",
          lastUpdated: now,
        });
        break;

      case "DRIVER_ASSIGNED":
        await FirebaseOrdersService.updateLalamoveTracking(orderId, {
          status: "ON_GOING",
          driver: {
            id: "sandbox-driver-001",
            name: "John Doe (Sandbox)",
            phone: "+639171234567",
            plateNumber: "ABC 1234",
            coordinates: {
              lat: 14.5995,
              lng: 120.9842,
              updatedAt: now,
            },
          },
          lastUpdated: now,
        });
        break;

      case "PICKED_UP":
        await FirebaseOrdersService.updateLalamoveTracking(orderId, {
          status: "PICKED_UP",
          driver: {
            id: "sandbox-driver-001",
            name: "John Doe (Sandbox)",
            phone: "+639171234567",
            plateNumber: "ABC 1234",
            coordinates: {
              lat: 14.5547,
              lng: 120.9912,
              updatedAt: now,
            },
          },
          lastUpdated: now,
        });
        break;

      case "COMPLETED":
        await FirebaseOrdersService.updateLalamoveTracking(orderId, {
          status: "COMPLETED",
          lastUpdated: now,
        });
        break;

      case "CANCELED":
        await FirebaseOrdersService.updateLalamoveTracking(orderId, {
          status: "CANCELED",
          lastUpdated: now,
        });
        break;
    }

    return NextResponse.json({
      success: true,
      event,
      orderId,
      updatedAt: now.toISOString(),
    });
  } catch (err) {
    const error = err as Error;
    console.error("[SandboxSimulate] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Simulation failed" },
      { status: 500 }
    );
  }
}
