import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

// Helper to fetch CSRF token from backend (without auth for public CSRF endpoint)
async function getCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      method: "GET",
    });

    if (!response.ok) {
      console.error("[Apply-as-Seller] CSRF fetch failed:", response.status);
      return null;
    }

    const data = await response.json();
    return data.csrfToken || data.token || data.data?.csrfToken || null;
  } catch (error) {
    console.error("[Apply-as-Seller] CSRF error:", error);
    return null;
  }
}

// Helper to check if token is a mock token (invalid for backend)
function isMockToken(token: string): boolean {
  return (
    token.startsWith("mock.") ||
    token.includes(".mock.") ||
    token.endsWith(".token")
  );
}

// POST /api/user/apply-as-seller - Submit seller application
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    console.log("[Apply-as-Seller] Request received");
    console.log("[Apply-as-Seller] Has auth token:", !!token);

    if (!token) {
      console.log("[Apply-as-Seller] No auth token found in cookies");
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please sign in again.",
          },
        },
        { status: 401 },
      );
    }

    // Check if using a mock token (development fallback - invalid for backend)
    if (isMockToken(token)) {
      console.error(
        "[Apply-as-Seller] Mock token detected - backend sync failed during login",
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message:
              "Your session is not properly synced with the server. Please sign out and sign in again.",
            details:
              "The backend authentication sync failed during login. This usually means the backend /auth/firebase-sync endpoint is not working.",
          },
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    console.log(
      "[Apply-as-Seller] Request body:",
      JSON.stringify(body, null, 2),
    );

    // Fetch CSRF token from backend (public endpoint, no auth needed)
    const csrfToken = await getCsrfToken();
    console.log("[Apply-as-Seller] CSRF token fetched:", !!csrfToken);

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
    }

    console.log(
      "[Apply-as-Seller] Calling backend:",
      `${API_URL}/users/me/apply-as-seller`,
    );

    const response = await fetch(`${API_URL}/users/me/apply-as-seller`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    console.log("[Apply-as-Seller] Backend response status:", response.status);

    const data = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));

    console.log(
      "[Apply-as-Seller] Backend response:",
      JSON.stringify(data, null, 2),
    );

    if (!response.ok) {
      // Provide more specific error messages
      let errorMessage = data.message || "Failed to submit application";
      let errorCode = "API_ERROR";

      if (response.status === 401) {
        errorCode = "UNAUTHORIZED";
        errorMessage =
          "Your session has expired. Please sign out and sign in again to get a valid token.";
      } else if (response.status === 404) {
        errorCode = "ENDPOINT_NOT_FOUND";
        errorMessage =
          "The seller application endpoint is not available on the backend. The /users/me/apply-as-seller endpoint may not be implemented yet.";
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: errorCode,
            message: errorMessage,
            backendStatus: response.status,
            backendMessage: data.message,
          },
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: data.message || "Application submitted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Apply-as-Seller] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to submit application. Please try again.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
