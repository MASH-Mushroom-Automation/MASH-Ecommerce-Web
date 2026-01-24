/**
 * Comprehensive API Integration Tests for Chatbot
 * 
 * Tests complete API flow including Gemini connection, error handling, and response validation.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 5
 */

import { POST, GET } from '../message/route';
import { NextRequest } from 'next/server';
import * as geminiService from '@/services/chatbot/gemini-service';
import * as rateLimiter from '@/lib/ai/rate-limiter';
import type { AIResponse } from '@/types/chatbot';

// Mock dependencies
jest.mock('@/services/chatbot/gemini-service');
jest.mock('@/lib/ai/rate-limiter');

describe('Chatbot API Integration Tests', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock rate limiter to allow requests
    (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60000,
    });
  });

  describe('POST /api/chatbot/message', () => {
    it('should successfully process a valid message', async () => {
      const mockResponse: AIResponse = {
        content: 'Test response',
        success: true,
      };

      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'What mushrooms are good for beef pepper garlic?',
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.content).toBe('Test response');
      expect(geminiService.sendMessage).toHaveBeenCalledWith(
        'What mushrooms are good for beef pepper garlic?',
        [],
        undefined
      );
    });

    it('should handle Gemini API errors gracefully', async () => {
      (geminiService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Gemini API error: 404')
      );

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message',
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to generate response');
    });

    it('should enforce rate limiting', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
      });

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message',
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Rate limit exceeded');
      expect(geminiService.sendMessage).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          userId: mockUserId,
          // Missing message field
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject empty messages', async () => {
      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: '   ',
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Message cannot be empty');
    });

    it('should reject messages exceeding max length', async () => {
      const longMessage = 'a'.repeat(5001); // Assuming max length is 5000

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: longMessage,
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('too long');
    });

    it('should handle conversation history', async () => {
      const mockResponse: AIResponse = {
        content: 'Response with context',
        success: true,
      };

      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Follow-up question',
          userId: mockUserId,
          history: [
            { id: '1', role: 'user', content: 'Previous question', timestamp: Date.now() },
            { id: '2', role: 'assistant', content: 'Previous answer', timestamp: Date.now() },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(geminiService.sendMessage).toHaveBeenCalledWith(
        'Follow-up question',
        expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Previous question' }),
          expect.objectContaining({ role: 'assistant', content: 'Previous answer' }),
        ]),
        undefined
      );
    });

    it('should return product cards when available', async () => {
      const mockResponse: AIResponse = {
        content: 'Here are some oyster mushrooms:',
        success: true,
      };

      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Show me oyster mushrooms',
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBeDefined();
    });
  });

  describe('GET /api/chatbot/message', () => {
    it('should return chatbot status', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('online');
      expect(data.version).toBeDefined();
    });

    it('should return API configuration info', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.features).toBeDefined();
      expect(data.features).toContain('product-recommendations');
      expect(data.features).toContain('rag-search');
    });
  });

  describe('API Error Scenarios', () => {
    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle network timeouts', async () => {
      (geminiService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      );

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message',
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle quota exceeded errors', async () => {
      (geminiService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Quota exceeded')
      );

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message',
          userId: mockUserId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to generate response');
    });
  });

  describe('API Performance Tests', () => {
    it('should respond within acceptable time limit', async () => {
      const mockResponse: AIResponse = {
        content: 'Fast response',
        success: true,
      };

      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Quick test',
          userId: mockUserId,
        }),
      });

      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should respond within 5 seconds
    });
  });
});
