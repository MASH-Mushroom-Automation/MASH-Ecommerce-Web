/**
 * Error Handler for Chatbot
 * 
 * Handles API failures and provides fallback mechanisms.
 * Falls back to Hugging Face if Gemini API fails.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.5
 */

import { HF_API_KEY, getHuggingFaceUrl, HF_TIMEOUT } from './config';
import { ChatbotError } from '@/types/chatbot';
import type { Message, AIResponse } from '@/types/chatbot';

/**
 * Sends a message to Hugging Face Inference API (Mixtral-8x7B)
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
  try {
    // Build conversation context for Hugging Face
    const conversationContext = history
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    const prompt = conversationContext 
      ? `${conversationContext}\nUser: ${message}\nAssistant:`
      : `User: ${message}\nAssistant:`;
    
    // Call Hugging Face API directly (this function runs server-side in API routes)
    const apiUrl = getHuggingFaceUrl();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({ 
        inputs: prompt, 
        parameters: { 
          max_new_tokens: 500, 
          temperature: 0.7, 
          top_p: 0.95, 
          do_sample: true 
        } 
      }),
      signal: AbortSignal.timeout(HF_TIMEOUT),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Hugging Face API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Hugging Face returns array with generated_text
    const generatedText = data[0]?.generated_text || '';
    
    // Extract only the assistant's response (remove prompt)
    const assistantResponse = generatedText
      .split('Assistant:')
      .pop()
      ?.trim() || 'Sorry, I could not generate a response.';
    
    return {
      success: true,
      content: assistantResponse,
      source: 'huggingface',
      metadata: {
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        tokensUsed: generatedText.length, // Approximate
        timestamp: new Date().toISOString(),
      },
    };
    
  } catch (error) {
    console.error('[Hugging Face] Error:', error);
    
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'huggingface',
    };
  }
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
