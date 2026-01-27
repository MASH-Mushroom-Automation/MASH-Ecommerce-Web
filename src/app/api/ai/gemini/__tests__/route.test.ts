import { POST, GET } from '../route';

// Provide a minimal mock for NextRequest
const makeReq = (body?: any) => ({
  json: async () => body,
} as unknown as Request);

describe('Gemini proxy route', () => {
  beforeEach(() => {
    // Ensure a key is present to avoid early 500
    process.env.GEMINI_API_KEY = 'test-key';
    (global as any).fetch = jest.fn();
  });

  test('GET returns ok', async () => {
    const res = await GET(undefined as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  test('POST proxies to Gemini and returns body text', async () => {
    (global as any).fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Hello' }] } }] }),
    });

    const req = makeReq({ model: 'gemini-3', contents: [] });
    const res = await POST(req as any);

    expect(res).toBeDefined();
    const text = typeof (res as any).text === 'function' ? await (res as any).text() : JSON.stringify(res);
    expect((global as any).fetch).toHaveBeenCalled();
    expect(text).toContain('Hello');
  });
});