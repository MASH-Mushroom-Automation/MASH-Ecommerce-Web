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

export async function POST(request: NextRequest) {
  try {
    const token = getCookieFromRequest(request, "auth-token");

    // Forward the multipart/form-data body directly to the backend
    const res = await fetch(`${API_ENDPOINT}/api/v1/user/avatar`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: await request.arrayBuffer().then((ab) => Buffer.from(ab)),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to upload avatar", details: json }, { status: res.status });
    }
    const data = json?.data ?? json;
    return NextResponse.json({ data, success: true });
  } catch {
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}
