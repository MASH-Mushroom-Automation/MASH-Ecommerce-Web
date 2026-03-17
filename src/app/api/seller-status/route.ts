import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJWT } from "@/lib/jwt";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:30000/api/v1";

type SellerStatusResponse = {
  hasPendingRequest: boolean;
  status: "none" | "pending" | "approved" | "rejected";
  requestId?: string;
  submittedAt?: string;
};

type BackendEnvelope<T> = {
  success?: boolean;
  statusCode?: number;
  path?: string;
  timestamp?: string;
  correlationId?: string;
  data?: T;
};

function normalizeSellerStatusResponse(
  payload: SellerStatusResponse | BackendEnvelope<SellerStatusResponse>,
): SellerStatusResponse {
  // Backend may return an envelope: { success, data: { status, ... } }
  // Normalize to the flat shape expected by the client.
  const maybeEnvelope = payload as BackendEnvelope<SellerStatusResponse>;
  if (maybeEnvelope && typeof maybeEnvelope === "object" && maybeEnvelope.data) {
    return maybeEnvelope.data;
  }
  return payload as SellerStatusResponse;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      const empty: SellerStatusResponse = {
        hasPendingRequest: false,
        status: "none",
      };
      return NextResponse.json(empty, { status: 200 });
    }

    const decoded = decodeJWT(token);

    const res = await fetch(`${API_URL}/seller-verification/my-status`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const empty: SellerStatusResponse = {
        hasPendingRequest: false,
        status: "none",
      };
      return NextResponse.json(empty, { status: 200 });
    }

    const raw = (await res.json()) as
      | SellerStatusResponse
      | BackendEnvelope<SellerStatusResponse>;
    const data = normalizeSellerStatusResponse(raw);

    // Temporary debug info to confirm which token/user is being used.
    // This helps detect stale cookies (wrong account) during testing.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        {
          ...data,
          _debug: {
            apiBase: API_URL,
            sub: decoded?.sub ?? null,
            email: decoded?.email ?? null,
            role: decoded?.role ?? null,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Seller Status API] Error:", error);
    const empty: SellerStatusResponse = {
      hasPendingRequest: false,
      status: "none",
    };
    return NextResponse.json(empty, { status: 200 });
  }
}

