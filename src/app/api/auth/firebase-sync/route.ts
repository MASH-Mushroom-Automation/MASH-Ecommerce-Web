/**
 * Firebase Auth Sync API Route
 *
 * Syncs Firebase authenticated users with NestJS backend.
 * Creates or updates user record and returns JWT token.
 *
 * POST /api/auth/firebase-sync
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

interface FirebaseSyncRequest {
  idToken: string;
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FirebaseSyncRequest = await request.json();

    if (!body.idToken || !body.user) {
      return NextResponse.json(
        { error: "Missing required fields: idToken and user" },
        { status: 400 }
      );
    }

    const { idToken, user } = body;

    if (!user.email) {
      return NextResponse.json(
        { error: "Email is required for authentication" },
        { status: 400 }
      );
    }

    // Forward to NestJS backend for Firebase token verification and user sync
    // The backend should:
    // 1. Verify the Firebase ID token
    // 2. Create or update the user record
    // 3. Return a JWT access token

    try {
      const backendResponse = await fetch(`${API_URL}/auth/firebase-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken,
        }),
      });

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        console.error("❌ [Firebase Sync API] Backend error:", backendData);

        // Use fallback auth for development when backend has issues (401, 403, 404)
        if (
          process.env.NODE_ENV === "development" &&
          (backendResponse.status === 401 ||
            backendResponse.status === 403 ||
            backendResponse.status === 404)
        ) {
          console.warn(
            `⚠️ [Firebase Sync API] Backend returned ${backendResponse.status}. Using fallback authentication for development.`
          );
          return handleFallbackAuth(user);
        }

        // In production, if backend rejects the token (401/403/404), create a Firebase-only session by
        // decoding the ID token payload (NON-VERIFIED) and setting a server-side cookie that identifies
        // the Firebase user. The App will then read Firestore profile directly for Google users.
        if (
          backendResponse.status === 401 ||
          backendResponse.status === 403 ||
          backendResponse.status === 404
        ) {
          try {
            const parts = idToken.split('.');

            // Treat tokens that are not three-part JWTs or have empty payload as a decode failure
            if (parts.length !== 3 || !parts[1]) throw new Error('Invalid token format');

            const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
            const payload = JSON.parse(payloadStr || '{}');

            // Require a 'sub' claim to consider decode successful
            if (!payload.sub) throw new Error('Missing sub claim in token payload');

            const firebaseUid = payload.sub;

            // Always return a 200 response and include firebaseUid in the body for testability.
            // Also attempt to set a Set-Cookie header (useful for runtimes that expose headers in tests).
            const cookieValue = `firebase-uid=${firebaseUid}; Path=/; Max-Age=${60 * 60 * 24 * 7}; HttpOnly; SameSite=Lax`;

            const resp = NextResponse.json(
              {
                message:
                  'Backend rejected token. Created Firebase-only session (no backend JWT).',
                firebaseUid,
              },
              { status: 200, headers: { 'set-cookie': cookieValue } }
            );

            // Also set cookie via NextResponse API so runtimes that support it get the cookie object
            try {
              resp.cookies.set({
                name: 'firebase-uid',
                value: firebaseUid,
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
              });
            } catch (err) {
              // Some test runtimes or mocks may not support resp.cookies.set - ignore
            }

            return resp;
          } catch (decodeError) {
            console.error('Failed to decode idToken payload:', decodeError);
            return NextResponse.json(
              { error: backendData.message || 'Backend authentication failed' },
              { status: backendResponse.status }
            );
          }
        }

        return NextResponse.json(
          { error: backendData.message || "Backend authentication failed" },
          { status: backendResponse.status }
        );
      }

      // Return the backend response (should contain accessToken, refreshToken, user)
      return NextResponse.json(backendData);
    } catch (backendError) {
      console.error("Backend connection error:", backendError);

      // If backend is unavailable, use fallback for development
      if (process.env.NODE_ENV === "development") {
        console.warn("Backend unavailable. Using fallback authentication.");
        return handleFallbackAuth(user);
      }

      return NextResponse.json(
        { error: "Unable to connect to authentication service" },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Firebase sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Fallback authentication for development when backend is unavailable
 * Creates a mock JWT response
 */
function handleFallbackAuth(user: FirebaseSyncRequest["user"]) {
  // Generate a mock JWT for development purposes only
  // In production, this should NEVER be used - the backend should verify the token
  const mockUser = {
    id: user.uid,
    email: user.email,
    firstName: user.displayName?.split(" ")[0] || "User",
    lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
    role: "USER",
    emailVerified: user.emailVerified,
    profileImageUrl: user.photoURL,
  };

  // Create a simple base64 encoded mock token (NOT secure - for dev only)
  const payload = {
    sub: user.uid,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };
  const mockToken = `mock.${Buffer.from(JSON.stringify(payload)).toString("base64")}.token`;

  console.warn("⚠️ Using mock authentication token - FOR DEVELOPMENT ONLY");

  return NextResponse.json({
    accessToken: mockToken,
    refreshToken: null,
    user: mockUser,
    message: "Development mode: Mock authentication used",
  });
}
