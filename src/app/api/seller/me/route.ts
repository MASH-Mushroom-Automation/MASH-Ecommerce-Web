import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromToken } from "@/lib/jwt";

/**
 * GET /api/seller/me
 *
 * Returns the backend seller ID (JWT sub) for the currently authenticated seller.
 * This is needed client-side because the auth-token cookie is HTTP-only and
 * cannot be read via document.cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const sellerId = getUserIdFromToken(token);

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true, sellerId });
  } catch (error) {
    console.error("[/api/seller/me] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
