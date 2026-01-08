import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

// Helper to fetch CSRF token from backend
async function getCsrfToken(authToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error("[CSRF] Failed to fetch token:", response.status);
      return null;
    }

    const data = await response.json();
    return data.csrfToken || data.token || data.data?.csrfToken || null;
  } catch (error) {
    console.error("[CSRF] Error fetching token:", error);
    return null;
  }
}

// POST /api/user/apply-as-seller - Submit seller application
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Fetch CSRF token from backend
    const csrfToken = await getCsrfToken(token);

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
    }

    const response = await fetch(`${API_URL}/users/me/apply-as-seller`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "API_ERROR",
            message: data.message || "Failed to submit application",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: data.message || "Application submitted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to submit application",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
