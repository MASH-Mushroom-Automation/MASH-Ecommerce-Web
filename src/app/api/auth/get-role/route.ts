import { NextRequest, NextResponse } from "next/server";
import { getRoleFromToken, isTokenExpired } from "@/lib/jwt";

export async function GET(request: NextRequest) {
    try {
        // Read auth token from HTTP-only cookie
        const authToken = request.cookies.get("auth-token")?.value;

        // No token found - user is not logged in
        if (!authToken) {
            return NextResponse.json(
                { role: null, authenticated: false },
                { status: 200 }
            );
        }

        // Check if token is expired
        if (isTokenExpired(authToken)) {
            return NextResponse.json(
                { role: null, expired: true, authenticated: false },
                { status: 200 }
            );
        }

        // Extract role from JWT payload
        const role = getRoleFromToken(authToken);

        return NextResponse.json(
            { role, authenticated: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("[Get Role API] Error:", error);
        return NextResponse.json(
            { role: null, error: true, authenticated: false },
            { status: 200 }
        );
    }
}
