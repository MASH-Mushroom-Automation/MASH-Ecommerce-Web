import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

    const response = await apiRequest<ApiResponse<any>>("/api/seller/notifications", { method: "GET" });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error instanceof Error ? error.message : "Failed to fetch notifications" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (!token) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

    const { id } = await request.json();
    const response = await apiRequest<ApiResponse<any>>(`/api/seller/notifications/${id}/read`, { method: "POST" });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error instanceof Error ? error.message : "Failed to mark notification as read" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
