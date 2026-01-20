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
import type { AIResponse, Message } from '@/types/chatbot';

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
 * Generates a response from Gemini API
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

  try {
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
      console.log('[Gemini] Request:', requestBody);
    }

    const response = await fetch(getGeminiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(GEMINI_TIMEOUT),
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
        model: 'gemini-2.0-flash-exp',
        processingTime,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (CHATBOT_DEBUG) {
      console.error('[Gemini] Error:', errorMessage);
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
        model: 'gemini-2.0-flash-exp',
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
