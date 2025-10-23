import { NextRequest, NextResponse } from "next/server";

const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_ENDPOINT ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://mash-backend-api.up.railway.app";

function getCookieFromRequest(req: NextRequest, name: string) {
  try {
    const cookie = req.cookies.get(name);
    return cookie ? cookie.value : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getCookieFromRequest(request, "auth-token");
    const res = await fetch(`${API_ENDPOINT}/api/v1/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch profile", details: json }, { status: res.status });
    }
    // Normalize to { data: user }
    const data = json?.data || json;
    return NextResponse.json({ data, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getCookieFromRequest(request, "auth-token");
    const body = await request.json();
    const res = await fetch(`${API_ENDPOINT}/api/v1/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to update profile", details: json }, { status: res.status });
    }
    const data = json?.data || json;
    return NextResponse.json({ data, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
