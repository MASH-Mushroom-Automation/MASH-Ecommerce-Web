import { POST } from "../firebase-sync/route";

function makeMockRequest(body: any) {
  return {
    headers: new Headers({
      "Content-Type": "application/json",
      cookie: "auth-token=mock-auth-token; firebase-uid=fb-123",
    }),
    json: async () => body,
  } as any;
}

describe("POST /api/auth/firebase-sync forwarding", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("forwards Cookie header to backend when present", async () => {
    const backendFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: "jwt-token", user: { id: "u1" } }),
    });

    global.fetch = backendFetch as any;

    const payload = {
      idToken: "a.b.c",
      user: { uid: "fb-123", email: "test@example.com" },
    };
    const request = makeMockRequest(payload);

    const response: any = await POST(request);

    expect(backendFetch).toHaveBeenCalled();

    const callArgs = backendFetch.mock.calls[0] as any;
    // fetch(url, options)
    const options = callArgs[1] || {};

    expect(options.headers).toBeDefined();
    expect(options.headers.Cookie || options.headers.cookie).toContain(
      "auth-token=mock-auth-token",
    );
  });
});
