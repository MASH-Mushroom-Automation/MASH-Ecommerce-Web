import { generateResponse } from '../gemini-client';

describe('Gemini client proxy', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('calls server proxy and returns generated text on success', async () => {
    // Mock server proxy response
    (global as any).fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'OK' }] } }] }),
    });

    const res = await generateResponse('Hello');

    expect((global as any).fetch).toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(res.content).toContain('OK');
  });

  test('returns failure when proxy responds non-ok', async () => {
    // Mock both proxy (fails) and multiple direct attempts (fail)
    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, text: async () => 'Not Found', status: 404 }) // proxy
      .mockResolvedValueOnce({ ok: false, text: async () => 'Not Found', status: 404 }) // direct attempt 1
      .mockResolvedValueOnce({ ok: false, text: async () => 'Not Found', status: 404 }) // direct attempt 2
      .mockResolvedValueOnce({ ok: false, text: async () => 'Not Found', status: 404 }); // direct attempt 3
    
    const res = await generateResponse('Hello');
    expect(res.success).toBe(false);
    // Error message may vary - just check that it's defined
    expect(res.error).toBeDefined();
  });
});