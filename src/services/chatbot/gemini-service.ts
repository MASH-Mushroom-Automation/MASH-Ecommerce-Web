/**
 * Gemini Service Layer
 * 
 * High-level service for chatbot interactions using Gemini API.
 * Handles message sending, streaming, and prompt management.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.1
 */

import { generateResponse, generateStreamResponse } from '@/lib/ai/gemini-client';
import { getSystemPrompt, detectQueryType } from './prompts';
import { handleWithFallback } from '@/lib/ai/error-handler';
import { buildSecuredPrompt } from '@/lib/ai/prompt-security';
import type { Message, AIResponse } from '@/types/chatbot';
import { CHATBOT_DEBUG } from '@/lib/ai/config';

/**
 * Sends a message to the chatbot and gets a response
 * 
 * @param userMessage - The user's message
 * @param conversationHistory - Previous messages for context
 * @param customPrompt - Optional custom system prompt
 * @returns AI response with generated content
 */
export async function sendMessage(
  userMessage: string,
  conversationHistory: Message[] = [],
  customPrompt?: string
): Promise<AIResponse> {
  try {
    // Detect query type if no custom prompt
    const queryType = customPrompt ? null : detectQueryType(userMessage);
    
    // Use hardened security prompt as base, with query-specific context
    const systemPrompt = customPrompt || buildSecuredPrompt();
    
    if (CHATBOT_DEBUG) {
      console.log('[Gemini Service] Query type:', queryType);
      console.log('[Gemini Service] Using secured prompt, length:', systemPrompt.length);
    }
    
    // Build full conversation with system prompt
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
    
    // Generate response
    const response = await generateResponse(fullPrompt, conversationHistory);
    
    // Apply fallback if primary failed
    const finalResponse = await handleWithFallback(response, userMessage, conversationHistory);
    
    if (CHATBOT_DEBUG) {
      console.log('[Gemini Service] Response:', {
        success: finalResponse.success,
        contentLength: finalResponse.content.length,
        source: finalResponse.source,
      });
    }
    
    return finalResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (CHATBOT_DEBUG) {
      console.error('[Gemini Service] Error:', errorMessage);
    }
    
    return {
      content: '',
      success: false,
      error: errorMessage,
      source: 'gemini',
    };
  }
}

/**
 * Sends a message with streaming response
 * 
 * @param userMessage - The user's message
 * @param conversationHistory - Previous messages for context
 * @param onChunk - Callback for each chunk of text
 * @param customPrompt - Optional custom system prompt
 * @returns AI response with full generated content
 */
export async function streamMessage(
  userMessage: string,
  conversationHistory: Message[] = [],
  onChunk?: (chunk: string) => void,
  customPrompt?: string
): Promise<AIResponse> {
  try {
    // Detect query type if no custom prompt
    const queryType = customPrompt ? null : detectQueryType(userMessage);
    
    // Use hardened security prompt as base
    const systemPrompt = customPrompt || buildSecuredPrompt();
    
    if (CHATBOT_DEBUG) {
      console.log('[Gemini Service Stream] Query type:', queryType);
    }
    
    // Build full conversation with system prompt
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
    
    // Generate streaming response
    const response = await generateStreamResponse(
      fullPrompt,
      conversationHistory,
      onChunk
    );
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (CHATBOT_DEBUG) {
      console.error('[Gemini Service Stream] Error:', errorMessage);
    }
    
    return {
      content: '',
      success: false,
      error: errorMessage,
      source: 'gemini',
    };
  }
}

/**
 * Gets the introductory message
 * 
 * @returns Intro message as AIResponse
 */
export function getIntroMessage(): AIResponse {
  return {
    content: getSystemPrompt('intro'),
    success: true,
    source: 'gemini',
    metadata: {
      processingTime: 0,
    },
  };
}

/**
 * Validates a user message before sending
 * 
 * @param message - The user's message
 * @returns Validation result with error if invalid
 */
export function validateMessage(message: string): {
  valid: boolean;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return {
      valid: false,
      error: 'Message cannot be empty',
    };
  }
  
  if (message.length > 500) {
    return {
      valid: false,
      error: 'Message is too long (max 500 characters)',
    };
  }
  
  // Check for spam patterns (repeated characters)
  const repeatedPattern = /(.)\1{10,}/;
  if (repeatedPattern.test(message)) {
    return {
      valid: false,
      error: 'Invalid message format',
    };
  }
  
  return { valid: true };
}
