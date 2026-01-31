import { sendToHuggingFace } from '../error-handler';

describe('Hugging Face API', () => {
  afterEach(() => jest.restoreAllMocks());

  test('calls Hugging Face API directly and returns assistant text', async () => {
    // OpenAI-compatible chat completions response format
    const mockBody = JSON.stringify({
      choices: [{
        message: {
          content: 'Hi there! How can I help you?'
        }
      }],
      usage: { total_tokens: 25 }
    });
    (global as any).fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => JSON.parse(mockBody), text: async () => mockBody });

    const res = await sendToHuggingFace('hello');
    expect((global as any).fetch).toHaveBeenCalledWith(
      expect.stringContaining('huggingface.co'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer'),
        }),
      })
    );
    expect(res.success).toBe(true);
    expect(res.content).toContain('Hi there');
  });

  test('returns failure when proxy errors', async () => {
    (global as any).fetch = jest.fn().mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Bad' }), status: 500 });
    const res = await sendToHuggingFace('hello');
    expect(res.success).toBe(false);
  });
});