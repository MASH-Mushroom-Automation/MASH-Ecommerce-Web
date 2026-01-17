import { NextRequest, NextResponse } from "next/server";
import { getLalamoveClient } from "@/lib/lalamove/client";
import { FirebaseOrdersService } from "@/lib/firebase/orders";

/**
 * POST /api/lalamove/create-order
 * 
 * Creates a Lalamove delivery order from quotation
 * Called when seller marks order as "processing"
 * 
 * Request Body:
 * {
 *   orderId: string;           // Firestore order ID
 *   quotationId: string;       // Lalamove quotation ID
 *   sender: {
 *     name: string;
 *     phone: string;
 *   };
 *   recipient: {
 *     name: string;
 *     phone: string;
 *     notes?: string;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, quotationId, sender, recipient } = body;

    // Validate required fields
    if (!orderId || !quotationId || !sender || !recipient) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          message: "orderId, quotationId, sender, and recipient are required"
        },
        { status: 400 }
      );
    }

    // Get quotation details to get stop IDs
    const lalamove = getLalamoveClient();
    const quotation = await lalamove.getQuotationDetails(quotationId);

    if (!quotation || !quotation.stops || quotation.stops.length < 2) {
      return NextResponse.json(
        { 
          error: "Invalid quotation",
          message: "Quotation not found or missing stops"
        },
        { status: 400 }
      );
    }

    // Create Lalamove order
    const orderRequest = {
      quotationId: quotationId,
      sender: {
        stopId: quotation.stops[0].stopId!,
        name: sender.name,
        phone: sender.phone,
      },
      recipients: [
        {
          stopId: quotation.stops[1].stopId!,
          name: recipient.name,
          phone: recipient.phone,
          remarks: recipient.notes || "",
        },
      ],
      isPODEnabled: false, // Proof of Delivery not needed for mushrooms
      metadata: {
        orderId: orderId,
        source: "MASH E-Commerce",
      },
    };

    console.log("[Lalamove Create Order] Request:", orderRequest);

    const lalamoveOrder = await lalamove.placeOrder(orderRequest);

    console.log("[Lalamove Create Order] Success:", {
      lalamoveOrderId: lalamoveOrder.orderId,
      status: lalamoveOrder.status,
      shareLink: lalamoveOrder.shareLink,
    });

    // Update Firestore with Lalamove tracking data
    await FirebaseOrdersService.updateLalamoveTracking(orderId, {
      status: lalamoveOrder.status,
      driver: lalamoveOrder.driverId
        ? {
            id: lalamoveOrder.driverId,
            name: "Assigning...",
            phone: "",
            plateNumber: "",
          }
        : undefined,
    });

    // Set Lalamove order ID in Firestore
    await FirebaseOrdersService.setLalamoveOrderId(
      orderId,
      lalamoveOrder.orderId,
      lalamoveOrder.shareLink
    );

    return NextResponse.json({
      success: true,
      data: {
        lalamoveOrderId: lalamoveOrder.orderId,
        status: lalamoveOrder.status,
        shareLink: lalamoveOrder.shareLink,
        driverId: lalamoveOrder.driverId,
      },
    });
  } catch (error: any) {
    console.error("[Lalamove Create Order] Error:", error);

    // Check for specific Lalamove errors
    let errorMessage = error.message || "Failed to create Lalamove delivery";
    let statusCode = 500;

    if (error.message?.includes("quotation")) {
      errorMessage = "Invalid or expired quotation. Please create a new delivery quote.";
      statusCode = 400;
    } else if (error.message?.includes("Service area")) {
      errorMessage = "Delivery address is outside Lalamove service area.";
      statusCode = 400;
    } else if (error.message?.includes("phone")) {
      errorMessage = "Invalid phone number format. Please check contact details.";
      statusCode = 400;
    }

    return NextResponse.json(
      {
        error: "Lalamove order creation failed",
        message: errorMessage,
        details: error.message,
      },
      { status: statusCode }
    );
  }
}
