import { sendToHuggingFace } from '../error-handler';

describe('Hugging Face proxy', () => {
  afterEach(() => jest.restoreAllMocks());

  test('calls server-side HF proxy and returns assistant text', async () => {
    const mockBody = JSON.stringify([{ generated_text: 'Assistant: Hi there' }]);
    (global as any).fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => JSON.parse(mockBody), text: async () => mockBody });

    const res = await sendToHuggingFace('hello');
    expect((global as any).fetch).toHaveBeenCalledWith('/api/ai/hf', expect.any(Object));
    expect(res.success).toBe(true);
    expect(res.content).toContain('Hi there');
  });

  test('returns failure when proxy errors', async () => {
    (global as any).fetch = jest.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Bad' }), status: 500 });
    const res = await sendToHuggingFace('hello');
    expect(res.success).toBe(false);
  });
});