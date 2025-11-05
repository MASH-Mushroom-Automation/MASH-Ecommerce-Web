import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// GET /api/seller/addresses - Get seller's addresses
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const response = await apiRequest<ApiResponse<any>>("/api/seller/addresses", { method: "GET" });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "FETCH_ERROR", message: error instanceof Error ? error.message : "Failed to fetch addresses" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// POST /api/seller/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const address = await request.json();
    const response = await apiRequest<ApiResponse<any>>("/api/seller/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "CREATE_ERROR", message: error instanceof Error ? error.message : "Failed to create address" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// PUT /api/seller/addresses - Update address
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { id, ...address } = await request.json();
    const response = await apiRequest<ApiResponse<any>>(`/api/seller/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(address),
    });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "UPDATE_ERROR", message: error instanceof Error ? error.message : "Failed to update address" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// DELETE /api/seller/addresses - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Address ID is required" } },
        { status: 400 }
      );
    }

    const response = await apiRequest<ApiResponse<any>>(`/api/seller/addresses/${id}`, { method: "DELETE" });
    return NextResponse.json({ ...response, timestamp: new Date().toISOString(), requestId: `req_${Date.now()}` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "DELETE_ERROR", message: error instanceof Error ? error.message : "Failed to delete address" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
