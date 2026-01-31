/**
 * Native HTTPS-based Gemini API Client
 * 
 * Uses Node.js native https module as fallback when fetch fails
 * This helps bypass DNS issues caused by VPNs like Radmin VPN
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 1
 */

import https from 'https';
import {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  GEMINI_TIMEOUT,
  CHATBOT_DEBUG,
} from './config';
import type { AIResponse, Message } from '@/types/chatbot';

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
 * Makes an HTTPS request using Node.js native module
 * More reliable in environments with VPN/DNS issues
 */
function makeHttpsRequest(
  url: string,
  data: string,
  timeout: number
): Promise<GeminiResponse> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: timeout,
      // Force IPv4 to avoid VPN issues with IPv6
      family: 4,
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error(`Failed to parse response: ${body.substring(0, 200)}`));
          }
        } else {
          reject(new Error(`Gemini API error: ${res.statusCode} - ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });

    req.write(data);
    req.end();
  });
}

/**
 * Generates a response from Gemini API using native HTTPS
 * 
 * @param prompt - The user's message or system prompt
 * @param conversationHistory - Previous messages for context (optional)
 * @returns AIResponse with generated content
 */
export async function generateResponseNative(
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
        topP: 0.9,
        topK: 40,
      },
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    if (CHATBOT_DEBUG) {
      console.log('[Gemini Native] Request to:', apiUrl.replace(GEMINI_API_KEY, 'API_KEY'));
    }

    const data = await makeHttpsRequest(apiUrl, JSON.stringify(requestBody), GEMINI_TIMEOUT);

    if (CHATBOT_DEBUG) {
      console.log('[Gemini Native] Response received');
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
        transport: 'native-https',
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('[Gemini Native] API call failed:', {
      error: errorMessage,
      processingTime: Date.now() - startTime,
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
}
