/**
 * Unit Tests for Error Handler
 * 
 * Tests error handling and fallback mechanisms for chatbot.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.6
 */

import {
  sendToHuggingFace,
  handleWithFallback,
  getFallbackMessage,
  categorizeError,
  getUserFriendlyError,
} from '../error-handler';
import { ChatbotError } from '@/types/chatbot';
import type { AIResponse, Message } from '@/types/chatbot';

// Mock fetch
global.fetch = jest.fn();

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('sendToHuggingFace', () => {
    it('should send message to Hugging Face API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [{
          generated_text: 'User: Hello\nAssistant: Hi there! How can I help you?'
        }],
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await sendToHuggingFace('Hello');
      
      expect(result.success).toBe(true);
      expect(result.content).toBe('Hi there! How can I help you?');
      expect(result.source).toBe('huggingface');
    });
    
    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const result = await sendToHuggingFace('Hello');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Internal Server Error');
    });
    
    it('should include conversation history', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [{
          generated_text: 'User: Hi\nAssistant: Hello\nUser: How are you?\nAssistant: I am doing well!'
        }],
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
      
      const history: Message[] = [
        { id: '1', role: 'user', content: 'Hi', timestamp: Date.now() },
        { id: '2', role: 'assistant', content: 'Hello', timestamp: Date.now() },
      ];
      
      const result = await sendToHuggingFace('How are you?', history);
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('User: Hi'),
        })
      );
    });
  });
  
  describe('handleWithFallback', () => {
    it('should return primary response if successful', async () => {
      const primaryResponse: AIResponse = {
        success: true,
        content: 'Primary response',
        source: 'gemini',
      };
      
      const result = await handleWithFallback(primaryResponse, 'Hello');
      
      expect(result).toEqual(primaryResponse);
      expect(global.fetch).not.toHaveBeenCalled();
    });
    
    it('should try fallback if primary fails', async () => {
      const primaryResponse: AIResponse = {
        success: false,
        content: '',
        error: 'Primary API failed',
        source: 'gemini',
      };
      
      const mockFallback = {
        ok: true,
        json: async () => [{
          generated_text: 'User: Hello\nAssistant: Fallback response'
        }],
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFallback);
      
      const result = await handleWithFallback(primaryResponse, 'Hello');
      
      expect(result.success).toBe(true);
      expect(result.content).toBe('Fallback response');
      expect(result.metadata?.fallbackUsed).toBe(true);
    });
    
    it('should return error message if both fail', async () => {
      const primaryResponse: AIResponse = {
        success: false,
        content: '',
        error: 'Primary failed',
        source: 'gemini',
      };
      
      const mockFallback = {
        ok: false,
        status: 500,
        json: async () => ({ error: 'Fallback failed' }),
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockFallback);
      
      const result = await handleWithFallback(primaryResponse, 'Hello');
      
      expect(result.success).toBe(false);
      expect(result.content).toBe(getFallbackMessage());
    });
  });
  
  describe('categorizeError', () => {
    it('should categorize rate limit errors', () => {
      expect(categorizeError(new Error('rate limit exceeded'))).toBe(ChatbotError.RATE_LIMIT);
      expect(categorizeError(new Error('429 Too Many Requests'))).toBe(ChatbotError.RATE_LIMIT);
    });
    
    it('should categorize timeout errors', () => {
      expect(categorizeError(new Error('timeout'))).toBe(ChatbotError.TIMEOUT);
      expect(categorizeError(new Error('request aborted'))).toBe(ChatbotError.TIMEOUT);
    });
    
    it('should categorize network errors', () => {
      expect(categorizeError(new Error('network error'))).toBe(ChatbotError.NETWORK_ERROR);
      expect(categorizeError(new Error('fetch failed'))).toBe(ChatbotError.NETWORK_ERROR);
    });
    
    it('should categorize validation errors', () => {
      expect(categorizeError(new Error('Invalid input'))).toBe(ChatbotError.INVALID_INPUT);
      expect(categorizeError(new Error('validation failed'))).toBe(ChatbotError.INVALID_INPUT);
    });
    
    it('should categorize config errors', () => {
      expect(categorizeError(new Error('API key missing'))).toBe(ChatbotError.CONFIGURATION_ERROR);
      expect(categorizeError(new Error('401 Unauthorized'))).toBe(ChatbotError.CONFIGURATION_ERROR);
    });
    
    it('should default to API_ERROR', () => {
      expect(categorizeError(new Error('unknown'))).toBe(ChatbotError.API_ERROR);
    });
  });
  
  describe('getUserFriendlyError', () => {
    it('should return friendly messages for each error type', () => {
      expect(getUserFriendlyError(ChatbotError.RATE_LIMIT)).toContain('too quickly');
      expect(getUserFriendlyError(ChatbotError.TIMEOUT)).toContain('took too long');
      expect(getUserFriendlyError(ChatbotError.NETWORK_ERROR)).toContain('connection failed');
      expect(getUserFriendlyError(ChatbotError.INVALID_INPUT)).toContain('invalid');
      expect(getUserFriendlyError(ChatbotError.CONFIGURATION_ERROR)).toContain('temporarily unavailable');
      expect(getUserFriendlyError(ChatbotError.API_ERROR)).toContain('having trouble');
    });
  });
});
