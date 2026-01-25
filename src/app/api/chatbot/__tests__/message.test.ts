/**
 * Unit Tests for Chatbot API Route
 * 
 * Tests the /api/chatbot/message endpoint.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.6
 */

import { POST, GET } from '@/app/api/chatbot/message/route';
import { NextRequest } from 'next/server';
import * as geminiService from '@/services/chatbot/gemini-service';
import * as rateLimiter from '@/lib/ai/rate-limiter';
import type { AIResponse } from '@/types/chatbot';

// Mock dependencies
jest.mock('@/services/chatbot/gemini-service');
jest.mock('@/lib/ai/rate-limiter');

describe('Chatbot API Route', () => {
  // Helper to create mock request objects compatible with the route handler
  function makeMockRequest(body, headers = { 'Content-Type': 'application/json' }, ip = '127.0.0.1') {
    return {
      headers: new Headers(headers),
      json: async () => body,
      ip,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/chatbot/message', () => {
    it('should process valid message', async () => {
      // Mock rate limiter
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValueOnce({
        userId: 'test-user',
        messageCount: 1,
        windowStart: Date.now(),
        isLimited: false,
      });
      
      (rateLimiter.getRemainingMessages as jest.Mock).mockReturnValueOnce(9);
      (rateLimiter.getResetTime as jest.Mock).mockReturnValueOnce(60);
      
      // Mock validation
      (geminiService.validateMessage as jest.Mock).mockReturnValueOnce({
        valid: true,
      });
      
      // Mock service response
      const mockResponse: AIResponse = {
        success: true,
        content: 'Hello! How can I help you?',
        source: 'gemini',
      };
      
      (geminiService.sendMessage as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      // Create request
      const request = makeMockRequest({
        message: 'Hello',
        history: [],
      });
      
      // Call endpoint
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.content).toBe('Hello! How can I help you?');
      expect(data.rateLimit).toBeDefined();
      expect(data.rateLimit.remaining).toBe(9);
    });
    
    it('should reject rate limited requests', async () => {
      // Mock rate limiter - exceeded
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValueOnce({
        userId: 'test-user',
        messageCount: 11,
        windowStart: Date.now(),
        isLimited: true,
      });
      
      (rateLimiter.getResetTime as jest.Mock).mockReturnValueOnce(45);
      
      // Create request
      const request = makeMockRequest({
        message: 'Hello',
      });
      
      // Call endpoint
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Rate limit');
      expect(data.rateLimit.resetTime).toBe(45);
    });
    
    it('should reject invalid messages', async () => {
      // Mock rate limiter
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValueOnce({
        userId: 'test-user',
        messageCount: 1,
        windowStart: Date.now(),
        isLimited: false,
      });
      
      // Mock validation - invalid
      (geminiService.validateMessage as jest.Mock).mockReturnValueOnce({
        valid: false,
        error: 'Message is too long',
      });
      
      // Create request
      const request = makeMockRequest({ message: 'a'.repeat(501) });
      
      // Call endpoint
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Message is too long');
    });
    
    it('should handle service errors', async () => {
      // Mock rate limiter
      (rateLimiter.checkRateLimit as jest.Mock).mockReturnValueOnce({
        userId: 'test-user',
        messageCount: 1,
        windowStart: Date.now(),
        isLimited: false,
      });
      
      (rateLimiter.getRemainingMessages as jest.Mock).mockReturnValueOnce(9);
      (rateLimiter.getResetTime as jest.Mock).mockReturnValueOnce(60);
      
      // Mock validation
      (geminiService.validateMessage as jest.Mock).mockReturnValueOnce({
        valid: true,
      });
      
      // Mock service error
      (geminiService.sendMessage as jest.Mock).mockRejectedValueOnce(
        new Error('Service failed')
      );
      
      // Create request
      const request = makeMockRequest({ message: 'Hello' });
      // Call endpoint
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to process message');
    });
  });
  
  describe('GET /api/chatbot/message', () => {
    it('should return API documentation', async () => {
      const response = await GET();
      const data = typeof response.json === 'function' ? await response.json() : response;
      
      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/chatbot/message');
      expect(data.methods).toContain('POST');
      expect(data.description).toBeDefined();
    });
  });
});
