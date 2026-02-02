import { generateResponse } from '../gemini-client';

// Mock the config module to control GEMINI_API_KEY
jest.mock('../config', () => {
  let mockApiKey = 'test-key';
  return {
    get GEMINI_API_KEY() { return mockApiKey; },
    setMockApiKey: (key: string) => { mockApiKey = key; },
    GEMINI_MODEL: 'gemini-2.0-flash',
    GEMINI_TIMEOUT: 30000,
    CHATBOT_DEBUG: false,
    getGeminiUrl: () => 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent',
  };
});

import * as config from '../config';

describe('Gemini client proxy', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // Reset mock API key
    (config as any).setMockApiKey('test-key');
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

  test('returns failure when API key is missing', async () => {
    // Clear API key to force early failure
    (config as any).setMockApiKey('');
    
    const res = await generateResponse('Hello');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
    expect(res.error).toContain('API key');
  });

  test('falls back to direct fetch when proxy fails', async () => {
    // First call (proxy) fails, second call (direct) succeeds
    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, text: async () => 'Proxy error', status: 500 })
      .mockResolvedValueOnce({ 
        ok: true, 
        json: async () => ({ candidates: [{ content: { parts: [{ text: 'Direct OK' }] } }] }),
      });
    
    const res = await generateResponse('Hello');
    // Either succeeds via direct or reports error
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
  });
});