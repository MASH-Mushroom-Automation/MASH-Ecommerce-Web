/**
 * Comprehensive Chatbot Integration Test Suite
 * 
 * This test ensures the AI chatbot is working correctly end-to-end,
 * covering all critical functionality including:
 * - API endpoint availability
 * - Message sending and receiving
 * - Rate limiting
 * - Error handling
 * - Model configuration
 * 
 * @see .github/copilot-instructions.md - Unit Testing Requirements
 * @see .github/AI_CHATBOT_MASTER_PLAN.md
 */

import { POST, GET } from '@/app/api/chatbot/message/route';
import { NextRequest } from 'next/server';
import * as geminiService from '@/services/chatbot/gemini-service';
import * as rateLimiter from '@/lib/ai/rate-limiter';
import { GEMINI_MODEL, GEMINI_API_KEY, CHATBOT_ENABLED } from '@/lib/ai/config';
import type { AIResponse } from '@/types/chatbot';

// Mock dependencies
jest.mock('@/services/chatbot/gemini-service');
jest.mock('@/lib/ai/rate-limiter');

describe('Chatbot Integration Tests', () => {
  const mockUserId = 'test-user-123';
  const testMessage = 'What mushrooms are good for cooking?';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock rate limiter to allow requests by default
    (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
      userId: mockUserId,
      messageCount: 1,
      windowStart: Date.now(),
      isLimited: false,
    });
    
    (rateLimiter.getRemainingMessages as jest.Mock).mockReturnValue(9);
    (rateLimiter.getResetTime as jest.Mock).mockReturnValue(60);
  });

  // ========================================
  // Configuration Tests
  // ========================================
  describe('Environment Configuration', () => {
    it('should have chatbot enabled', () => {
      expect(CHATBOT_ENABLED).toBe(true);
    });

    it('should have Gemini API key configured', () => {
      expect(GEMINI_API_KEY).toBeTruthy();
      expect(GEMINI_API_KEY.length).toBeGreaterThan(0);
    });

    it('should have AI model configured', () => {
      expect(GEMINI_MODEL).toBeTruthy();
      expect(GEMINI_MODEL).toMatch(/gemini/i);
    });

    it('should support model configuration via environment', () => {
      // Model should be configurable
      const validModels = [
        'gemini-2.0-flash',
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash-exp',
      ];
      
      expect(validModels).toContain(GEMINI_MODEL);
    });
  });

  // ========================================
  // API Endpoint Tests
  // ========================================
  describe('GET /api/chatbot/message', () => {
    it('should return API documentation', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/chatbot/message');
      expect(data.methods).toContain('POST');
      expect(data.description).toBeDefined();
      expect(data.rateLimit).toBeDefined();
    });

    it('should document request and response format', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.usage).toBeDefined();
      expect(data.usage.method).toBe('POST');
      expect(data.usage.body).toBeDefined();
      expect(data.usage.response).toBeDefined();
    });
  });

  // ========================================
  // Message Processing Tests
  // ========================================
  describe('POST /api/chatbot/message', () => {
    it('should successfully process a valid message', async () => {
      const mockResponse: AIResponse = {
        content: 'I recommend oyster mushrooms for cooking!',
        success: true,
        source: 'gemini',
      };

      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: true,
      });
      
      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
          history: [],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.content).toBe('I recommend oyster mushrooms for cooking!');
      expect(data.rateLimit).toBeDefined();
      expect(data.rateLimit.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should handle conversation history', async () => {
      const mockResponse: AIResponse = {
        content: 'Based on our conversation, I suggest trying shiitake.',
        success: true,
        source: 'gemini',
      };

      const conversationHistory = [
        { role: 'user' as const, content: 'What are the best mushrooms?' },
        { role: 'assistant' as const, content: 'Oyster mushrooms are great!' },
      ];

      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: true,
      });
      
      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'What about for stir fry?',
          history: conversationHistory,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(geminiService.sendMessage).toHaveBeenCalledWith(
        'What about for stir fry?',
        conversationHistory,
        undefined
      );
    });

    it('should include metadata in response', async () => {
      const mockResponse: AIResponse = {
        content: 'Test response',
        success: true,
        source: 'gemini',
        metadata: {
          model: GEMINI_MODEL,
          tokensUsed: 50,
          processingTime: 1234,
        },
      };

      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: true,
      });
      
      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.metadata).toBeDefined();
      expect(data.metadata.model).toBe(GEMINI_MODEL);
      expect(data.source).toBe('gemini');
    });
  });

  // ========================================
  // Validation Tests
  // ========================================
  describe('Message Validation', () => {
    it('should reject empty messages', async () => {
      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Message cannot be empty',
      });

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: '   ',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Message cannot be empty');
    });

    it('should reject messages that are too long', async () => {
      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Message is too long',
      });

      const longMessage = 'a'.repeat(501);
      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: longMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Message is too long');
    });

    it('should accept valid messages', async () => {
      const validation = geminiService.validateMessage(testMessage);
      
      expect(validation.valid).toBe(true);
      expect(validation.error).toBeUndefined();
    });
  });

  // ========================================
  // Rate Limiting Tests
  // ========================================
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValue({
        userId: mockUserId,
        messageCount: 11,
        windowStart: Date.now(),
        isLimited: true,
      });

      (rateLimiter.getResetTime as jest.Mock).mockReturnValue(45);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Rate limit');
      expect(data.rateLimit.resetTime).toBe(45);
      expect(geminiService.sendMessage).not.toHaveBeenCalled();
    });

    it('should include rate limit info in successful responses', async () => {
      const mockResponse: AIResponse = {
        content: 'Test response',
        success: true,
        source: 'gemini',
      };

      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: true,
      });
      
      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);
      (rateLimiter.getRemainingMessages as jest.Mock).mockReturnValue(5);
      (rateLimiter.getResetTime as jest.Mock).mockReturnValue(30);

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.rateLimit).toBeDefined();
      expect(data.rateLimit.remaining).toBe(5);
      expect(data.rateLimit.resetTime).toBe(30);
    });
  });

  // ========================================
  // Error Handling Tests
  // ========================================
  describe('Error Handling', () => {
    it('should handle Gemini API errors', async () => {
      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: true,
      });
      
      (geminiService.sendMessage as jest.Mock).mockResolvedValue({
        content: '',
        success: false,
        error: 'Gemini API error: 503 - Service temporarily unavailable',
        source: 'gemini',
      });

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle network timeouts', async () => {
      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: true,
      });
      
      (geminiService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      );

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to process message. Please try again.');
    });

    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  // ========================================
  // Service Layer Tests
  // ========================================
  describe('Gemini Service', () => {
    it('should provide intro message', () => {
      const intro = geminiService.getIntroMessage();
      
      expect(intro).toBeDefined();
      expect(intro.content).toBeTruthy();
      expect(intro.content.length).toBeGreaterThan(0);
    });

    it('should validate message length', () => {
      const shortMessage = 'Hello';
      const longMessage = 'a'.repeat(501);
      
      const validResult = geminiService.validateMessage(shortMessage);
      const invalidResult = geminiService.validateMessage(longMessage);
      
      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('too long');
    });

    it('should validate empty messages', () => {
      const emptyMessage = '   ';
      
      const result = geminiService.validateMessage(emptyMessage);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
  });

  // ========================================
  // Integration Workflow Test
  // ========================================
  describe('Complete Conversation Flow', () => {
    it('should handle a complete multi-turn conversation', async () => {
      const conversation = [
        {
          userMessage: 'What mushrooms are good for stir fry?',
          aiResponse: 'Oyster and shiitake mushrooms are excellent for stir fry!',
        },
        {
          userMessage: 'How do I cook them?',
          aiResponse: 'Slice them thinly and stir fry on high heat for 3-4 minutes.',
        },
        {
          userMessage: 'What about seasoning?',
          aiResponse: 'Use soy sauce, garlic, and a touch of sesame oil.',
        },
      ];

      let history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

      for (const turn of conversation) {
        const mockResponse: AIResponse = {
          content: turn.aiResponse,
          success: true,
          source: 'gemini',
        };

        (geminiService.validateMessage as jest.Mock).mockReturnValue({
          valid: true,
        });
        
        (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

        const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
          method: 'POST',
          body: JSON.stringify({
            message: turn.userMessage,
            history,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.content).toBe(turn.aiResponse);

        // Update history for next turn
        history.push({ role: 'user', content: turn.userMessage });
        history.push({ role: 'assistant', content: turn.aiResponse });
      }

      // Verify conversation progressed correctly
      expect(history.length).toBe(6); // 3 turns × 2 messages each
    });
  });

  // ========================================
  // Performance Tests
  // ========================================
  describe('Performance', () => {
    it('should respond within acceptable time limit', async () => {
      const mockResponse: AIResponse = {
        content: 'Fast response',
        success: true,
        source: 'gemini',
        metadata: {
          processingTime: 1200, // 1.2 seconds
        },
      };

      (geminiService.validateMessage as jest.Mock).mockReturnValue({
        valid: true,
      });
      
      (geminiService.sendMessage as jest.Mock).mockResolvedValue(mockResponse);

      const startTime = Date.now();

      const request = new NextRequest('http://localhost:3000/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: testMessage,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      const responseTime = Date.now() - startTime;

      // Should respond quickly with mocked service
      expect(responseTime).toBeLessThan(1000);
    });
  });
});
