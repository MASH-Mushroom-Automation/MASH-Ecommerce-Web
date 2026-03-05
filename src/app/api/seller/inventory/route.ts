import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

// GET /api/seller/inventory — proxies GET /seller/products from the backend
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: "UNAUTHORIZED", message: "Authentication required" },
                },
                { status: 401 }
            );
        }

        const cookieHeader = request.headers.get("cookie") || "";
        const { searchParams } = new URL(request.url);

        // Forward query params to backend
        const query = new URLSearchParams();
        if (searchParams.get("page")) query.set("page", searchParams.get("page")!);
        if (searchParams.get("limit")) query.set("limit", searchParams.get("limit")!);
        if (searchParams.get("search")) query.set("search", searchParams.get("search")!);

        const qs = query.toString();
        const endpoint = qs ? `/seller/products?${qs}` : "/seller/products";

        const response = await apiRequest<ApiResponse<any>>(endpoint, {
            method: "GET",
            headers: {
                Cookie: cookieHeader,
                Authorization: `Bearer ${token}`,
            },
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
                    message:
                        error instanceof Error ? error.message : "Failed to fetch inventory",
                },
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
