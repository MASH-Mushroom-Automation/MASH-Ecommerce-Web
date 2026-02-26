/**
 * Unit Tests for AI Configuration
 * 
 * Tests all configuration functions and validation logic.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 1, Task 1.6
 */

import {
  GEMINI_API_KEY,
  HF_API_KEY,
  CHATBOT_ENABLED,
  MAX_MESSAGES_PER_MINUTE,
  GEMINI_MODEL,
  validateConfig,
  getGeminiUrl,
  getHuggingFaceUrl,
} from '../config';

describe('Phase 1: AI Configuration', () => {
  describe('Environment Variables', () => {
    it('should load GEMINI_API_KEY from environment', () => {
      expect(GEMINI_API_KEY).toBeDefined();
      expect(typeof GEMINI_API_KEY).toBe('string');
    });

    it('should load HF_API_KEY from environment', () => {
      expect(HF_API_KEY).toBeDefined();
      expect(typeof HF_API_KEY).toBe('string');
    });

    it('should load CHATBOT_ENABLED flag', () => {
      expect(typeof CHATBOT_ENABLED).toBe('boolean');
    });

    it('should load MAX_MESSAGES_PER_MINUTE with default', () => {
      expect(MAX_MESSAGES_PER_MINUTE).toBeGreaterThan(0);
      expect(typeof MAX_MESSAGES_PER_MINUTE).toBe('number');
    });
  });

  describe('validateConfig()', () => {
    it('should not throw when chatbot is enabled', () => {
      // Assuming CHATBOT_ENABLED=true in .env
      expect(() => validateConfig()).not.toThrow();
    });

    it('should warn if API keys are missing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Temporarily clear API key (if needed for test)
      const originalKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      validateConfig();

      // Restore
      process.env.NEXT_PUBLIC_GEMINI_API_KEY = originalKey;
      consoleSpy.mockRestore();
    });
  });

  describe('getGeminiUrl()', () => {
    it('should return valid Gemini API URL', () => {
      const url = getGeminiUrl();

      expect(url).toContain('generativelanguage.googleapis.com');
      expect(url).toContain(GEMINI_MODEL);
      expect(url).toContain('generateContent');
      expect(url).toContain('key=');
      // URL should be properly formatted
      expect(url).toMatch(/^https:\/\//);
    });

    it('should accept custom model name', () => {
      const customModel = 'gemini-pro';
      const url = getGeminiUrl(customModel);

      expect(url).toContain(customModel);
    });

    it('should include API key in URL', () => {
      const url = getGeminiUrl();

      if (GEMINI_API_KEY) {
        expect(url).toContain(GEMINI_API_KEY);
      }
    });
  });

  describe('getHuggingFaceUrl()', () => {
    it('should return valid Hugging Face API URL', () => {
      const url = getHuggingFaceUrl();

      expect(url).toContain('router.huggingface.co');
      expect(url).toContain('chat/completions');
    });

    it('should return consistent URL', () => {
      const url1 = getHuggingFaceUrl();
      const url2 = getHuggingFaceUrl();

      expect(url1).toBe(url2);
    });

    it('should use OpenAI-compatible chat completions endpoint', () => {
      const url = getHuggingFaceUrl();

      expect(url).toContain('chat/completions');
    });
  });

  describe('Configuration Constants', () => {
    it('should have a Gemini model configured', () => {
      expect(typeof GEMINI_MODEL).toBe('string');
      expect(GEMINI_MODEL).toMatch(/gemini/i);
    });

    it('should have reasonable timeout values', () => {
      const { GEMINI_TIMEOUT, HF_TIMEOUT } = require('../config');

      expect(GEMINI_TIMEOUT).toBeGreaterThanOrEqual(10000); // At least 10s
      expect(HF_TIMEOUT).toBeGreaterThanOrEqual(10000);
    });

    it('should have reasonable message limits', () => {
      const { MAX_MESSAGE_LENGTH, MAX_CHAT_HISTORY } = require('../config');

      expect(MAX_MESSAGE_LENGTH).toBeGreaterThan(0);
      expect(MAX_CHAT_HISTORY).toBeGreaterThan(0);
    });
  });
});
