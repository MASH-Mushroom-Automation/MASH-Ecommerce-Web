/**
 * Google Gemini API Client
 * 
 * Handles communication with Google's Gemini 3 Flash Preview API for chat functionality.
 * Supports both standard and streaming responses.
 * 
 * Model: gemini-3-flash-preview (Latest - Jan 2026)
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 1
 * @see https://ai.google.dev/gemini-api/docs
 */

import {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  GEMINI_TIMEOUT,
  CHATBOT_DEBUG,
  getGeminiUrl,
} from './config';
import { generateResponseNative } from './gemini-native';
import type { AIResponse, Message } from '@/types/chatbot';

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Gemini API request body structure
 */
interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

/**
 * Gemini API response structure
 */
interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Creates an AbortController with timeout that works in all environments
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Clean up timeout when signal is aborted
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
 * Generates a response from Gemini API with retry logic
 * Uses server-side proxy first to bypass VPN/DNS issues
 * 
 * @param prompt - The user's message or system prompt
 * @param conversationHistory - Previous messages for context (optional)
 * @returns AIResponse with generated content
 */
export async function generateResponse(
  prompt: string,
  conversationHistory: Message[] = []
): Promise<AIResponse> {
  const startTime = Date.now();

  if (!GEMINI_API_KEY) {
    return {
      content: '',
      success: false,
      error: 'Gemini API key not configured',
      source: 'gemini',
    };
  }

  // Build conversation history for Gemini
  const contents = [
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const requestBody: GeminiRequest = {
    contents,
    generationConfig: {
      temperature: 0.7, // Balanced creativity
      maxOutputTokens: 500, // Keep responses concise
      topP: 0.9,
      topK: 40,
    },
  };

  if (CHATBOT_DEBUG) {
    logger.debug('[Gemini] Request', requestBody);
  }

  // FIRST: Try server-side proxy (bypasses VPN/DNS issues)
  try {
    logger.debug('[Gemini] Trying server-side proxy first...');
    
    const proxyResponse = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (proxyResponse.ok) {
      const data: GeminiResponse = await proxyResponse.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (generatedText) {
        const processingTime = Date.now() - startTime;
        logger.perf('[Gemini] Server proxy succeeded', processingTime);
        
        return {
          content: generatedText,
          success: true,
          source: 'gemini',
          metadata: {
            tokensUsed: data.usageMetadata?.totalTokenCount,
            model: GEMINI_MODEL,
            processingTime,
            method: 'server-proxy',
          },
        };
      }
    }
    
    console.warn('[Gemini] Server proxy returned non-OK or empty response');
  } catch (proxyError) {
    console.warn('[Gemini] Server proxy failed:', proxyError instanceof Error ? proxyError.message : proxyError);
  }

  // SECOND: Try direct fetch with retries
  const apiUrl = getGeminiUrl(GEMINI_MODEL);
  let lastError: Error | null = null;

  // Retry loop for network resilience
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Gemini] Retry attempt ${attempt}/${MAX_RETRIES}...`);
        await delay(RETRY_DELAY * attempt); // Exponential backoff
      }

      // Use custom timeout controller for better compatibility
      const controller = createTimeoutController(GEMINI_TIMEOUT);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        // @ts-expect-error - Next.js specific cache options
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();

      if (CHATBOT_DEBUG) {
        console.log('[Gemini] Response:', data);
      }

      // Extract generated text
      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!generatedText) {
        throw new Error('No content generated from Gemini');
      }

      const processingTime = Date.now() - startTime;

      return {
        content: generatedText,
        success: true,
        source: 'gemini',
        metadata: {
          tokensUsed: data.usageMetadata?.totalTokenCount,
          model: GEMINI_MODEL,
          processingTime,
          attempts: attempt + 1,
        },
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if it's a timeout/network error that should be retried
      const isRetryable = 
        lastError.name === 'AbortError' ||
        lastError.message.includes('fetch failed') ||
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('ConnectTimeoutError');
      
      if (!isRetryable || attempt === MAX_RETRIES) {
        break;
      }
      
      console.warn(`[Gemini] Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  // All retries failed - try native HTTPS as last resort
  console.log('[Gemini] Fetch failed, trying native HTTPS transport...');
  
  try {
    const nativeResponse = await generateResponseNative(prompt, conversationHistory);
    if (nativeResponse.success) {
      console.log('[Gemini] Native HTTPS succeeded!');
      return nativeResponse;
    }
  } catch (nativeError) {
    console.error('[Gemini] Native HTTPS also failed:', nativeError);
  }

  const errorMessage = lastError?.message || 'Unknown error';
  
  // Log detailed error information for debugging
  console.error('[Gemini] API call failed after all attempts:', {
    error: errorMessage,
    cause: lastError && 'cause' in lastError ? (lastError.cause as Error)?.message : undefined,
    code: lastError && 'code' in lastError ? (lastError as NodeJS.ErrnoException).code : undefined,
    processingTime: Date.now() - startTime,
    retries: MAX_RETRIES,
  });

  return {
    content: '',
    success: false,
    error: errorMessage,
    source: 'gemini',
    metadata: {
      processingTime: Date.now() - startTime,
    },
  };
}

/**
 * Generates a streaming response from Gemini API
 * 
 * @param prompt - The user's message
 * @param conversationHistory - Previous messages for context
 * @param onChunk - Callback for each chunk of text
 * @returns AIResponse with full generated content
 */
export async function generateStreamResponse(
  prompt: string,
  conversationHistory: Message[] = [],
  onChunk?: (chunk: string) => void
): Promise<AIResponse> {
  const startTime = Date.now();

  if (!GEMINI_API_KEY) {
    return {
      content: '',
      success: false,
      error: 'Gemini API key not configured',
      source: 'gemini',
    };
  }

  try {
    // Build conversation history
    const contents = [
      ...conversationHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const requestBody: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    };

    // Gemini streaming endpoint
    const streamUrl = getGeminiUrl().replace(
      ':generateContent',
      ':streamGenerateContent'
    );

    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini stream error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        try {
          const data: GeminiResponse = JSON.parse(line);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (text) {
            fullText += text;
            onChunk?.(text);
          }
        } catch {
          // Ignore JSON parse errors (partial chunks)
        }
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      content: fullText,
      success: true,
      source: 'gemini',
      metadata: {
        model: GEMINI_MODEL,
        processingTime,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (CHATBOT_DEBUG) {
      console.error('[Gemini Stream] Error:', errorMessage);
    }

    return {
      content: '',
      success: false,
      error: errorMessage,
      source: 'gemini',
      metadata: {
        processingTime: Date.now() - startTime,
      },
    };
  }
}

/**
 * Tests the Gemini API connection
 * 
 * @returns True if connection successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await generateResponse('Hello, please respond with "OK"');
    return response.success && response.content.length > 0;
  } catch {
    return false;
  }
}
