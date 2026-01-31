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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateResponse('Hello');

      expect(result.success).toBe(true);
      expect(result.content).toBe('Hello! How can I help you today?');
      expect(result.source).toBe('gemini');
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateResponse('How are you?', history);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid request',
      });

      const result = await generateResponse('Test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Gemini API error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await generateResponse('Test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

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
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Stream error')
      );

      const result = await generateStreamResponse('Test');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Stream error');
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await testConnection();

      expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed')
      );

      const result = await testConnection();

      expect(result).toBe(false);
    });
  });
});
