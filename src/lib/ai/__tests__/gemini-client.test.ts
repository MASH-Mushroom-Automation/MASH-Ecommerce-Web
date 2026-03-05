/**
 * Unit Tests for Gemini API Client
 * 
 * Tests Gemini API integration, response handling, and error cases.
 * Uses mocked API calls to avoid hitting rate limits.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 1, Task 1.6
 */

import {
  generateResponse,
  generateStreamResponse,
  testConnection,
} from '../gemini-client';
import type { Message } from '@/types/chatbot';

// Mock the native HTTPS module to prevent real network calls
jest.mock('../gemini-native', () => ({
  generateResponseNative: jest.fn().mockResolvedValue({
    content: '',
    success: false,
    error: 'Native HTTPS mocked - connection failed',
    source: 'gemini',
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Add TextEncoder for Node.js environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}

describe('Phase 1: Gemini API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch to a fresh mock to avoid mock consumption issues across tests
    global.fetch = jest.fn();
  });

  describe('generateResponse()', () => {
    it('should generate response from Gemini API', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello! How can I help you today?' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 15,
          totalTokenCount: 25,
        },
      };

      // First call is proxy, return success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateResponse('Hello');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Hello! How can I help you today?');
      expect(result.source).toBe('gemini');
      // Tokens may be undefined from proxy response
      expect(result.metadata?.tokensUsed).toBe(25);
    });

    it('should handle conversation history', async () => {
      const history: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: Date.now(),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: Date.now(),
        },
      ];

      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'What can I help you with?' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      };
      
      // Proxy call returns success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateResponse('How are you?', history);

      expect(result.success).toBe(true);
      // First call should be to the proxy endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/gemini'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Hello'),
        })
      );
    });

    it('should return error when API key is missing', async () => {
      const originalKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      // Re-import to get updated config
      jest.resetModules();
      const { generateResponse: generateWithoutKey } = require('../gemini-client');

      const result = await generateWithoutKey('Hello');

      expect(result.success).toBe(false);
      expect(result.error).toContain('API key not configured');

      // Restore
      process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalKey;
    });

    it('should handle API errors gracefully', async () => {
      // Mock all attempts: 1 proxy + 3 direct retries (0, 1, 2) + 1 native HTTPS fallback
      // Total = 5 calls before returning error
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Proxy: Invalid request',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Direct attempt 1: Invalid request',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Direct attempt 2: Invalid request',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Direct attempt 3: Invalid request',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Native fallback: Invalid request',
        });

      const result = await generateResponse('Test');

      expect(result.success).toBe(false);
      // Error message may vary based on which call fails
      expect(result.error).toBeDefined();
    }, 30000); // Increase timeout for retry delays

    it('should handle network errors', async () => {
      // Mock all attempts: 1 proxy + 3 direct retries + 1 native fallback
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error')) // Proxy fails
        .mockRejectedValueOnce(new Error('Network error')) // Direct attempt 1
        .mockRejectedValueOnce(new Error('Network error')) // Direct attempt 2
        .mockRejectedValueOnce(new Error('Network error')) // Direct attempt 3
        .mockRejectedValueOnce(new Error('Network error')); // Native fallback

      const result = await generateResponse('Test');

      expect(result.success).toBe(false);
      // Error may come from proxy attempt or direct call
      expect(result.error).toBeDefined();
    }, 30000); // Increase timeout for retry delays

    it('should track processing time', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Response' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateResponse('Test');

      expect(result.metadata?.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateStreamResponse()', () => {
    it('should handle streaming response', async () => {
      const mockStreamData = [
        '{"candidates":[{"content":{"parts":[{"text":"Hello"}]}}]}',
        '{"candidates":[{"content":{"parts":[{"text":" there"}]}}]}',
      ];

      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(mockStreamData[0]),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(mockStreamData[1]),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      const chunks: string[] = [];
      const result = await generateStreamResponse(
        'Test',
        [],
        (chunk) => chunks.push(chunk)
      );

      expect(result.success).toBe(true);
      expect(result.content).toContain('Hello');
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should handle stream errors', async () => {
      // Stream function only makes one fetch call (direct, not via proxy)
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Stream error')
      );

      const result = await generateStreamResponse('Test');

      expect(result.success).toBe(false);
      // Error message should contain the original error
      expect(result.error).toBeDefined();
    });
  });

  describe('testConnection()', () => {
    it('should return true when connection works', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: 'OK' }],
              role: 'model',
            },
            finishReason: 'STOP',
          },
        ],
      };

      // testConnection uses generateResponse which tries proxy first
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await testConnection();

      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      // testConnection uses generateResponse - mock all attempts:
      // 1 proxy + 3 direct retries + 1 native fallback = 5 calls
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Connection failed')) // Proxy fails
        .mockRejectedValueOnce(new Error('Connection failed')) // Direct attempt 1
        .mockRejectedValueOnce(new Error('Connection failed')) // Direct attempt 2
        .mockRejectedValueOnce(new Error('Connection failed')) // Direct attempt 3
        .mockRejectedValueOnce(new Error('Connection failed')); // Native fallback

      const result = await testConnection();

      expect(result).toBe(false);
    }, 30000); // Increase timeout for retry delays
  });
});
