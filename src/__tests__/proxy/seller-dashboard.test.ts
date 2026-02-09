jest.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url: string;
    nextUrl: URL;
    cookies: { get: jest.Mock };

    constructor(url: string) {
      this.url = url;
      this.nextUrl = new URL(url);
      this.cookies = { get: jest.fn(() => undefined) };
    }
  },
  NextResponse: {
    redirect: (url: URL | string) => ({
      type: "redirect",
      url: typeof url === "string" ? url : url.toString(),
    }),
    next: () => ({
      type: "next",
      headers: {
        set: jest.fn(),
      },
    }),
  },
}));

import { proxy } from "@/proxy";

describe("proxy seller dashboard access", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("allows seller dashboard in development when override is enabled", async () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_ALLOW_DEV_SELLER_DASHBOARD = "true";

    const { NextRequest } = require("next/server");
    const request = new NextRequest("http://localhost:3000/seller/dashboard");
    const response = await proxy(request);

    expect(response.type).toBe("next");
  });

  it("redirects unauthenticated users to login by default", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.NEXT_PUBLIC_ALLOW_DEV_SELLER_DASHBOARD;

    const { NextRequest } = require("next/server");
    const request = new NextRequest("http://localhost:3000/seller/dashboard");
    const response = await proxy(request);

    expect(response.type).toBe("redirect");
    expect(response.url).toContain("/login");
  });
});
