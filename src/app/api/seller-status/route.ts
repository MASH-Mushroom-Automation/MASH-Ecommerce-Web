import { NextRequest, NextResponse } from "next/server";
import { decodeJWT } from "@/lib/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:30000/api/v1";

type SellerStatusResponse = {
  hasPendingRequest: boolean;
  status: "none" | "pending" | "approved" | "rejected";
  requestId?: string;
  submittedAt?: string;
  jwtUserId?: string;
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

export async function GET(request: NextRequest) {
  let decodedSub: string | undefined = undefined;
  try {
    const token = request.cookies.get("auth-token")?.value;
    const firebaseUid = request.cookies.get("firebase-auth")?.value;

    if (!token && !firebaseUid) {
      const empty: SellerStatusResponse = {
        hasPendingRequest: false,
        status: "none",
      };
      return NextResponse.json(empty, { status: 200 });
    }

    let authHeader = "";

    if (token) {
      const decoded = decodeJWT(token);
      decodedSub = decoded?.sub;
      authHeader = `Bearer ${token}`;
    } else if (firebaseUid) {
      decodedSub = firebaseUid;
      // Depending on your backend, you might pass the Firebase UID in a different header 
      // or as a query param if it supports Firebase auth directly.
      // For now, we will pass it as the bearer token to let the backend middleware handle it,
      // or custom headers if your backend uses them for Firebase.
      authHeader = `Firebase ${firebaseUid}`;
    }

    const res = await fetch(`${API_URL}/seller-verification/my-status`, {
      method: "GET",
      // Important: if the backend only accepts JWT in Authorization, you may need a different endpoint
      // or backend fix for Firebase users.
      headers: { Authorization: authHeader },
      cache: "no-store",
    });

    if (!res.ok) {
        const empty: SellerStatusResponse = {
        hasPendingRequest: false,
        status: "none",
        jwtUserId: decodedSub, // Make sure we send the ID even if the backend rejects
      };
      return NextResponse.json(empty, { status: 200 });
    }

    const raw = (await res.json()) as
      | SellerStatusResponse
      | BackendEnvelope<SellerStatusResponse>;
    const data = normalizeSellerStatusResponse(raw);

    // Attach the JWT User ID to the response explicitly
    const finalData = {
      ...data,
      jwtUserId: decodedSub,
    };

    // Temporary debug info to confirm which token/user is being used.
    // This helps detect stale cookies (wrong account) during testing.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        {
          ...finalData,
          _debug: {
            apiBase: API_URL,
            sub: decodedSub ?? null,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(finalData, { status: 200 });
  } catch (error) {
    console.error(`[Seller Status API] Error fetching from ${API_URL}/seller-verification/my-status:`, error);
    const empty: SellerStatusResponse = {
      hasPendingRequest: false,
      status: "none",
      jwtUserId: decodedSub, // Make sure we send the ID even if the fetch throws
    };
    return NextResponse.json(empty, { status: 200 });
  }
}

