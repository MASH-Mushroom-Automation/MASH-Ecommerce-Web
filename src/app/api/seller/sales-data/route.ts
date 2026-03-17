import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// GET /api/seller/sales-data → proxies GET /seller/sales-data from backend
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
                { status: 401 }
            );
        }

        const cookieHeader = request.headers.get("cookie") || "";
        const response = await apiRequest<ApiResponse<any>>("/seller/sales-data", {
            method: "GET",
            headers: { Cookie: cookieHeader, Authorization: `Bearer ${token}` },
        });

        return NextResponse.json({
            ...response,
            timestamp: new Date().toISOString(),
            requestId: `req_${Date.now()}`,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "FETCH_ERROR",
                    message: error instanceof Error ? error.message : "Failed to fetch sales data",
                },
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
