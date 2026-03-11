/**
 * POST /api/orders/approve
 *
 * Seller approves an order. If deliveryMethod is "lalamove" and a
 * lalamoveQuotationId exists, automatically triggers Lalamove order creation.
 *
 * Body: { orderId: string; sellerId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { FirebaseOrdersService } from "@/lib/firebase/orders";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase/config";

const db = getFirestore(firebaseApp);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, sellerId } = body;

    if (!orderId || !sellerId) {
      return NextResponse.json(
        { success: false, message: "orderId and sellerId are required" },
        { status: 400 }
      );
    }

    // Approve the order in Firestore
    await FirebaseOrdersService.approveOrder(orderId, sellerId);

    // Read the order to check if Lalamove delivery should be auto-created
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({
        success: true,
        message: "Order approved but could not read order for delivery creation",
      });
    }

    const order = orderSnap.data();

    // Auto-create Lalamove delivery if applicable
    if (
      order.deliveryMethod === "lalamove" &&
      order.lalamoveQuotationId &&
      !order.lalamoveOrderId
    ) {
      try {
        const origin = request.nextUrl.origin;
        const createRes = await fetch(`${origin}/api/lalamove/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            quotationId: order.lalamoveQuotationId,
            sender: {
              name: "MASH Market",
              phone: "+639170000000",
            },
            recipient: {
              name: order.deliveryAddress?.name || order.userName || "Customer",
              phone: order.deliveryAddress?.phone || order.userPhone || "",
              notes: order.deliveryAddress?.notes || "",
            },
          }),
        });

        const lalamoveResult = await createRes.json();

        if (createRes.ok && lalamoveResult.orderId) {
          return NextResponse.json({
            success: true,
            message: "Order approved and Lalamove delivery created",
            lalamoveOrderId: lalamoveResult.orderId,
          });
        }

        // Delivery creation failed but order is still approved
        console.error(
          "[OrderApprove] Lalamove delivery creation failed:",
          lalamoveResult
        );
        return NextResponse.json({
          success: true,
          message: "Order approved but delivery creation failed",
          deliveryError: lalamoveResult.message || "Failed to create Lalamove order",
        });
      } catch (deliveryErr) {
        console.error("[OrderApprove] Delivery creation error:", deliveryErr);
        return NextResponse.json({
          success: true,
          message: "Order approved but delivery creation encountered an error",
          deliveryError:
            deliveryErr instanceof Error
              ? deliveryErr.message
              : "Unknown delivery error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order approved",
    });
  } catch (error) {
    console.error("[OrderApprove] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to approve order",
      },
      { status: 500 }
    );
  }
}
