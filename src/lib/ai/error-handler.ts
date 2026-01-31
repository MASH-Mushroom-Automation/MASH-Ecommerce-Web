/**
 * Error Handler for Chatbot
 * 
 * Handles API failures and provides fallback mechanisms.
 * Falls back to Hugging Face if Gemini API fails.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.5
 */

import { HF_API_KEY, getHuggingFaceUrl, HF_TIMEOUT, HF_FALLBACK_MODEL } from './config';
import { ChatbotError } from '@/types/chatbot';
import type { Message, AIResponse } from '@/types/chatbot';

// Retry configuration
const MAX_RETRIES = 1;
const RETRY_DELAY = 500;

/**
 * Creates an AbortController with timeout
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));
  return controller;
}

/**
 * Delay helper for retries
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sends a message to Hugging Face Inference API using OpenAI-compatible chat completions
 * Used as fallback when Gemini API fails
 * 
 * @param message - User message
 * @param history - Conversation history
 * @returns AI response from Hugging Face
 */
export async function sendToHuggingFace(
  message: string,
  history: Message[] = []
): Promise<AIResponse> {
  // Build messages array in OpenAI format
  const messages: Array<{ role: string; content: string }> = [
    {
      role: 'system',
      content: 'You are MASH AI Assistant, a helpful assistant for the MASH e-commerce platform. Help users find products, answer questions about mushroom growing kits and supplies, and provide excellent customer support. Be friendly, concise, and helpful.'
    }
  ];
  
  // Add conversation history
  for (const msg of history) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  }
  
  // Add current user message
  messages.push({
    role: 'user',
    content: message
  });
  
  const apiUrl = getHuggingFaceUrl();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Hugging Face] Retry attempt ${attempt}/${MAX_RETRIES}...`);
        await delay(RETRY_DELAY * attempt);
      }
      
      const controller = createTimeoutController(HF_TIMEOUT);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HF_API_KEY}`,
        },
        body: JSON.stringify({
          model: HF_FALLBACK_MODEL,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          stream: false
        }),
        signal: controller.signal,
        // @ts-expect-error - Next.js specific cache options
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.error || `Hugging Face API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // OpenAI-compatible response format
      const assistantResponse = data.choices?.[0]?.message?.content?.trim() 
        || 'Sorry, I could not generate a response.';
      
      return {
        success: true,
        content: assistantResponse,
        source: 'huggingface',
        metadata: {
          model: HF_FALLBACK_MODEL,
          tokensUsed: data.usage?.total_tokens || 0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const isRetryable = 
        lastError.name === 'AbortError' ||
        lastError.message.includes('fetch failed') ||
        lastError.message.includes('ConnectTimeoutError');
      
      if (!isRetryable || attempt === MAX_RETRIES) {
        break;
      }
      
      console.warn(`[Hugging Face] Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }
  
  // Log detailed error information for debugging
  console.error('[Hugging Face] Error:', lastError);
  
  return {
    success: false,
    content: '',
    error: lastError?.message || 'Unknown error',
    source: 'huggingface',
  };
}

/**
 * Handles errors and implements fallback strategy
 * 
 * Strategy:
 * 1. Try primary request (Gemini)
 * 2. If fails, try Hugging Face
 * 3. If both fail, return graceful error message
 * 
 * @param primaryResponse - Response from primary API (Gemini)
 * @param message - User message
 * @param history - Conversation history
 * @returns Final AI response with fallback applied
 */
export async function handleWithFallback(
  primaryResponse: AIResponse,
  message: string,
  history: Message[] = []
): Promise<AIResponse> {
  // If primary succeeded, return it
  if (primaryResponse.success) {
    return primaryResponse;
  }
  
  console.warn('[Error Handler] Primary API failed, trying fallback...');
  
  // Try Hugging Face fallback
  const fallbackResponse = await sendToHuggingFace(message, history);
  
  // If fallback succeeded, return it
  if (fallbackResponse.success) {
    return {
      ...fallbackResponse,
      metadata: {
        ...fallbackResponse.metadata,
        fallbackUsed: true,
        primaryError: primaryResponse.error,
      },
    };
  }
  
  // Both failed - return graceful error
  return {
    success: false,
    content: getFallbackMessage(),
    error: ChatbotError.API_ERROR,
    source: 'fallback',
    metadata: {
      primaryError: primaryResponse.error,
      fallbackError: fallbackResponse.error,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Returns a friendly error message when all APIs fail
 */
export function getFallbackMessage(): string {
  return `I'm having trouble connecting right now. Please try again in a moment, or browse our products directly at /shop.`;
}

/**
 * Categorizes errors for better handling
 * 
 * @param error - Error object or message
 * @returns ChatbotError enum value
 */
export function categorizeError(error: unknown): ChatbotError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return ChatbotError.RATE_LIMIT;
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
    return ChatbotError.TIMEOUT;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ChatbotError.NETWORK_ERROR;
  }
  
  if (errorMessage.includes('Invalid') || errorMessage.includes('validation')) {
    return ChatbotError.INVALID_INPUT;
  }
  
  if (errorMessage.includes('API key') || errorMessage.includes('401')) {
    return ChatbotError.CONFIGURATION_ERROR;
  }
  
  return ChatbotError.API_ERROR;
}

/**
 * Creates a user-friendly error message based on error type
 * 
 * @param errorType - ChatbotError enum value
 * @returns User-friendly error message
 */
export function getUserFriendlyError(errorType: ChatbotError): string {
  switch (errorType) {
    case ChatbotError.RATE_LIMIT:
      return 'You\'re sending messages too quickly. Please wait a moment before trying again.';
    
    case ChatbotError.TIMEOUT:
      return 'The request took too long. Please try again with a shorter message.';
    
    case ChatbotError.NETWORK_ERROR:
      return 'Network connection failed. Please check your internet and try again.';
    
    case ChatbotError.INVALID_INPUT:
      return 'Your message contains invalid content. Please rephrase and try again.';
    
    case ChatbotError.CONFIGURATION_ERROR:
      return 'The chatbot is temporarily unavailable due to configuration issues.';
    
    case ChatbotError.API_ERROR:
    default:
      return getFallbackMessage();
  }
}
