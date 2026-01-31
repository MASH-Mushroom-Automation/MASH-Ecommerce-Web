import { POST, GET } from '../route';

const makeReq = (body?: any) => ({
  json: async () => body,
} as unknown as Request);

describe('Hugging Face proxy route', () => {
  beforeEach(() => {
    process.env.HF_API_KEY = 'hf-test';
    (global as any).fetch = jest.fn();
  });

  test('GET returns ok', async () => {
    const res = await GET(undefined as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  test('POST proxies to HF and forwards Authorization header', async () => {
    (global as any).fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify([{ generated_text: 'Assistant: Hi' }]),
    });

    const req = makeReq({ inputs: 'hi' });
    const res = await POST(req as any);

    expect(res).toBeDefined();
    // The proxy should call the upstream HF endpoint and include Authorization header
    expect((global as any).fetch).toHaveBeenCalled();
    const calledArgs = (global as any).fetch.mock.calls[0];
    const fetchOpts = calledArgs[1];
    expect(fetchOpts.headers.Authorization).toContain('Bearer');
  });
});