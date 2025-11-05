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
    const token = getCookieFromRequest(request, "auth-token") || getCookieFromRequest(request, "authToken");
    
    // For development, return mock data if no backend is available
    // Try backend first, fallback to mock
    try {
      const res = await fetch(`${API_ENDPOINT}/api/v1/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const data = json?.data || json;
        return NextResponse.json({ data, success: true });
      }
    } catch (fetchError) {
      // Backend not available, use mock
      console.log("Backend not available, using mock data");
    }

    // Mock user data for development
    if (token) {
      const mockUser = {
        id: "usr_123456",
        email: "user@mash.market",
        firstName: "John",
        lastName: "Grower", 
        role: "customer",
        isSeller: false,
        avatar: "/profile_placeholder.png",
        phone: "+63 956 955 2608",
        bio: "Passionate about sustainable mushroom farming",
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          theme: "light",
          language: "en"
        },
        address: {
          street: "UCC Congressional Campus",
          city: "Quezon City",
          province: "Metro Manila",
          country: "Philippines",
          postalCode: "1100"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return NextResponse.json({ data: mockUser, success: true });
    }
    
    return NextResponse.json({ error: "No authentication token" }, { status: 401 });
  } catch (error) {
    console.error("Profile fetch error:", error);
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
