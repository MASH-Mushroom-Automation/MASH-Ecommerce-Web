/**
 * AI Chatbot Configuration
 * 
 * Centralizes all configuration for the AI chatbot system including
 * API keys, endpoints, and feature flags.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 1
 */

// API Keys (from environment variables)
export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
export const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY || '';

// Feature Flags
export const CHATBOT_ENABLED = process.env.NEXT_PUBLIC_CHATBOT_ENABLED === 'true';
export const CHATBOT_DEBUG = process.env.NEXT_PUBLIC_CHATBOT_DEBUG === 'true';

// Rate Limiting
export const MAX_MESSAGES_PER_MINUTE = parseInt(
  process.env.NEXT_PUBLIC_CHATBOT_MAX_MESSAGES_PER_MINUTE || '10',
  10
);

// API Endpoints
export const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1';
export const HF_API_ENDPOINT = 'https://api-inference.huggingface.co/models';

// Model Configuration
export const GEMINI_MODEL = 'gemini-1.5-flash';
export const HF_FALLBACK_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

// Request Timeouts (milliseconds)
export const GEMINI_TIMEOUT = 30000; // 30 seconds
export const HF_TIMEOUT = 30000; // 30 seconds

// Chat Configuration
export const MAX_MESSAGE_LENGTH = 500;
export const MAX_CHAT_HISTORY = 50;
export const INTRO_MESSAGE_KEY = 'chatbot_intro_shown';

/**
 * Validates that all required API keys are configured
 * @throws Error if API keys are missing
 */
export function validateConfig(): void {
  if (!CHATBOT_ENABLED) {
    throw new Error('Chatbot is disabled. Set NEXT_PUBLIC_CHATBOT_ENABLED=true');
  }

  if (!GEMINI_API_KEY) {
    console.warn('[Chatbot] GEMINI_API_KEY not configured. Chatbot may not work.');
  }

  if (!HF_API_KEY) {
    console.warn('[Chatbot] HF_API_KEY not configured. Fallback unavailable.');
  }

  if (CHATBOT_DEBUG) {
    console.log('[Chatbot] Configuration:', {
      enabled: CHATBOT_ENABLED,
      geminiConfigured: !!GEMINI_API_KEY,
      hfConfigured: !!HF_API_KEY,
      maxMessages: MAX_MESSAGES_PER_MINUTE,
    });
  }
}

/**
 * Gets the Gemini API URL for generating content
 * @param model - The Gemini model to use
 * @returns Full API URL
 */
export function getGeminiUrl(model: string = GEMINI_MODEL): string {
  return `${GEMINI_API_ENDPOINT}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

/**
 * Gets the Hugging Face API URL for a specific model
 * @param model - The HF model to use
 * @returns Full API URL
 */
export function getHuggingFaceUrl(model: string = HF_FALLBACK_MODEL): string {
  return `${HF_API_ENDPOINT}/${model}`;
}
