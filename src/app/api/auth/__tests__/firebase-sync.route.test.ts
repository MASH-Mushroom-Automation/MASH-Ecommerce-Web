import { POST } from '../firebase-sync/route';

function makeMockRequest(body: any) {
  return {
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => body,
  } as any;
}

describe('POST /api/auth/firebase-sync', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should set firebase-uid cookie when backend returns 403', async () => {
    // Backend responds with 403
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden' }),
    });

    // craft idToken with payload { sub: 'fb-uid-123' }
    const payload = Buffer.from(JSON.stringify({ sub: 'fb-uid-123' })).toString('base64');
    const idToken = `a.${payload}.c`;

    const request = makeMockRequest({ idToken, user: { uid: 'fb-uid-123', email: 'test@example.com', displayName: 'Test User', photoURL: null, emailVerified: true } });

    const response: any = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('Firebase-only session');
    // The response may be a NextResponse or a plain object (test environment stub). Prefer checking the body first.
    expect(data.firebaseUid).toBe('fb-uid-123');

    // If headers are present (real NextResponse), assert cookie header contains firebase-uid
    if (response.headers && typeof response.headers.get === 'function') {
      const setCookie = response.headers.get('set-cookie') || '';
      expect(setCookie).toContain('firebase-uid=fb-uid-123');
    }
  });

  it('should return backend response when backend verifies token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'jwt-token-123', user: { id: 'backend-user' } }),
    });

    const idToken = 'a.b.c';
    const request = makeMockRequest({ idToken, user: { uid: 'uid-1', email: 'test@example.com', displayName: 'Test User', photoURL: null, emailVerified: true } });

    const response: any = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.accessToken).toBe('jwt-token-123');

    // The backend-verified response should not include firebaseUid in body
    expect(data.firebaseUid).toBeUndefined();

    // If headers exist, assert the Set-Cookie header does not include firebase-uid
    if (response.headers && typeof response.headers.get === 'function') {
      const setCookie = response.headers.get('set-cookie') || '';
      expect(setCookie).not.toContain('firebase-uid=');
    }
  });

  it('should return backend error when idToken decode fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Forbidden' }),
    });

    const idToken = 'malformed-token';
    const request = makeMockRequest({ idToken, user: { uid: 'uid-1', email: 'test@example.com', displayName: 'Test User', photoURL: null, emailVerified: true } });

    const response: any = await POST(request);
    const data = await response.json();

    // If decode fails, route returns the backend error status
    expect(response.status).toBe(403);
    expect(data.error).toBeDefined();
  });
});
