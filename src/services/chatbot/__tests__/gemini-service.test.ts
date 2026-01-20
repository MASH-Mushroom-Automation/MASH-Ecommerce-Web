/**
 * Unit Tests for Gemini Service
 * 
 * Tests high-level chatbot service layer.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.6
 */

import { sendMessage, validateMessage, getIntroMessage } from '../gemini-service';
import * as geminiClient from '@/lib/ai/gemini-client';
import * as errorHandler from '@/lib/ai/error-handler';
import type { AIResponse, Message } from '@/types/chatbot';

// Mock dependencies
jest.mock('@/lib/ai/gemini-client');
jest.mock('@/lib/ai/error-handler');

describe('Gemini Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('sendMessage', () => {
    it('should send message and return response', async () => {
      const mockResponse: AIResponse = {
        success: true,
        content: 'Hello! How can I help you?',
        source: 'gemini',
      };
      
      (geminiClient.generateResponse as jest.Mock).mockResolvedValueOnce(mockResponse);
      (errorHandler.handleWithFallback as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await sendMessage('Hello');
      
      expect(result.success).toBe(true);
      expect(result.content).toBe('Hello! How can I help you?');
      expect(geminiClient.generateResponse).toHaveBeenCalledWith(
        expect.any(String),
        []
      );
    });
    
    it('should include conversation history', async () => {
      const mockResponse: AIResponse = {
        success: true,
        content: 'Yes, I remember!',
        source: 'gemini',
      };
      
      const history: Message[] = [
        { id: '1', role: 'user', content: 'My name is John', timestamp: Date.now() },
        { id: '2', role: 'assistant', content: 'Nice to meet you, John!', timestamp: Date.now() },
      ];
      
      (geminiClient.generateResponse as jest.Mock).mockResolvedValueOnce(mockResponse);
      (errorHandler.handleWithFallback as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await sendMessage('Do you remember my name?', history);
      
      expect(result.success).toBe(true);
      expect(geminiClient.generateResponse).toHaveBeenCalledWith(
        expect.any(String),
        history
      );
    });
    
    it('should detect recipe queries and use recommendation prompt', async () => {
      const mockResponse: AIResponse = {
        success: true,
        content: 'I recommend King Oyster mushrooms for your recipe!',
        source: 'gemini',
      };
      
      (geminiClient.generateResponse as jest.Mock).mockResolvedValueOnce(mockResponse);
      (errorHandler.handleWithFallback as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await sendMessage('what mushroom for beef pepper garlic');
      
      expect(result.success).toBe(true);
      expect(geminiClient.generateResponse).toHaveBeenCalledWith(
        expect.stringContaining('recipe'),
        []
      );
    });
    
    it('should use fallback on error', async () => {
      const primaryResponse: AIResponse = {
        success: false,
        content: '',
        error: 'API failed',
        source: 'gemini',
      };
      
      const fallbackResponse: AIResponse = {
        success: true,
        content: 'Fallback response',
        source: 'huggingface',
      };
      
      (geminiClient.generateResponse as jest.Mock).mockResolvedValueOnce(primaryResponse);
      (errorHandler.handleWithFallback as jest.Mock).mockResolvedValueOnce(fallbackResponse);
      
      const result = await sendMessage('Hello');
      
      expect(result.source).toBe('huggingface');
      expect(errorHandler.handleWithFallback).toHaveBeenCalled();
    });
  });
  
  describe('validateMessage', () => {
    it('should validate valid messages', () => {
      const result = validateMessage('Hello, how are you?');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should reject empty messages', () => {
      const result = validateMessage('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
    
    it('should reject whitespace-only messages', () => {
      const result = validateMessage('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });
    
    it('should reject messages over 500 characters', () => {
      const longMessage = 'a'.repeat(501);
      const result = validateMessage(longMessage);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('500');
    });
    
    it('should detect spam patterns', () => {
      const spamMessage = 'aaaaaaaaaaaaaaaaaaa'; // Repeated character
      const result = validateMessage(spamMessage);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('spam');
    });
    
    it('should allow messages exactly 500 characters', () => {
      const message = 'a'.repeat(500);
      const result = validateMessage(message);
      expect(result.valid).toBe(true);
    });
  });
  
  describe('getIntroMessage', () => {
    it('should return intro message', () => {
      const intro = getIntroMessage();
      expect(intro).toContain('MASH');
      expect(intro).toContain('mushroom');
    });
  });
});
