/**
 * Verify Purchase API Route
 *
 * GET /api/reviews/verify-purchase?userId=X&productId=Y
 *
 * Checks if a user has purchased and received a specific product
 * by querying the backend orders endpoint.
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mashmarket.app/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "Missing required query params: userId, productId", verified: false },
        { status: 400 }
      );
    }

    // Try to fetch user's delivered orders from backend
    try {
      const response = await fetch(
        `${API_URL}/orders?userId=${encodeURIComponent(userId)}&status=DELIVERED`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (!response.ok) {
        // Backend may not be available or user has no orders
        console.warn(`[VerifyPurchase] Backend returned ${response.status} for user ${userId}`);
        return NextResponse.json({ verified: false });
      }

      const data = await response.json();
      const orders = Array.isArray(data) ? data : data.data || [];

      // Check if any delivered order contains the product
      const verified = orders.some((order: { items?: Array<{ productId?: string; sanityId?: string }> }) =>
        order.items?.some(
          (item) =>
            item.productId === productId || item.sanityId === productId
        )
      );

      return NextResponse.json({ verified });
    } catch (fetchError) {
      // Backend unreachable - return unverified rather than erroring
      console.warn("[VerifyPurchase] Backend unreachable:", fetchError);
      return NextResponse.json({ verified: false });
    }
  } catch (error) {
    console.error("[VerifyPurchase] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", verified: false },
      { status: 500 }
    );
  }
}
