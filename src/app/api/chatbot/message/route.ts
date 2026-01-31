/**
 * Chatbot API Route - Send Message
 * 
 * Handles POST requests to send messages to the chatbot.
 * Includes rate limiting and error handling.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 2, Task 2.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendMessage, validateMessage } from '@/services/chatbot/gemini-service';
import { ragSearch } from '@/lib/ai/rag-service';
import { checkRateLimit, getRemainingMessages, getResetTime } from '@/lib/ai/rate-limiter';
import type { Message } from '@/types/chatbot';

/**
 * POST /api/chatbot/message
 * 
 * Request body:
 * {
 *   message: string,
 *   history?: Message[]
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   content?: string,
 *   productCards?: ProductCardData[],
 *   error?: string,
 *   rateLimit?: {
 *     remaining: number,
 *     resetTime: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get user identifier (IP address or user ID from session)
    // Resilient header access to support NextRequest in tests where headers may be a plain object
    const forwarded = ((): string | undefined => {
      const headers = (request as any).headers;
      if (!headers) return undefined;
      if (typeof headers.get === 'function') return headers.get('x-forwarded-for');
      const key = Object.keys(headers).find(k => k.toLowerCase() === 'x-forwarded-for');
      return key ? headers[key] : undefined;
    })();

    const ip = forwarded ? forwarded.split(',')[0] : (request as any).ip || 'unknown';
    const userId = ip; // TODO: Use authenticated user ID when available
    
    // Check rate limit
    const rateLimitStatus = checkRateLimit(userId);
    
    if (rateLimitStatus.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait before sending more messages.',
          rateLimit: {
            remaining: 0,
            resetTime: getResetTime(userId),
          },
        },
        { status: 429 }
      );
    }
    
    // Parse request body (robust across test harness differences)
    let body: any;
    try {
      if (typeof (request as any).json === 'function') {
        body = await (request as any).json();
      } else if (typeof (request as any).text === 'function') {
        const text = await (request as any).text();
        body = text ? JSON.parse(text) : {};
      } else if ((request as any).body) {
        // Some test environments attach raw body
        body = typeof (request as any).body === 'string' ? JSON.parse((request as any).body) : (request as any).body;
      } else {
        body = {};
      }
    } catch (err) {
      // Malformed JSON - client error, return 400
      return NextResponse.json(
        { success: false, error: 'Malformed JSON' },
        { status: 400 }
      );
    }

    const { message, history = [] } = body;

    // Validate message
    const validation = validateMessage(message);
    if (!validation || !validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: (validation && validation.error) || 'Invalid message',
        },
        { status: 400 }
      );
    }
    
    // Decide whether to use RAG (product search) or Gemini (chat)
    const lowerMsg = (message || '').toString().toLowerCase();
    const isProductQuery = /(^show\b|show me|\bsearch\b|\bfind\b)/i.test(message) && /\b(mushroom|mushrooms|product|products|fresh)\b/i.test(message);

    // Debug
    console.debug('[Chatbot API] parsed body ->', body);
    console.debug('[Chatbot API] isProductQuery ->', isProductQuery, 'message ->', message);
    console.debug('[Chatbot API] request props ->', {
      hasJson: typeof (request as any).json === 'function',
      hasText: typeof (request as any).text === 'function',
      bodyProp: (request as any).body,
      headers: (request as any).headers,
      keys: Object.keys(request as any),
      props: Object.getOwnPropertyNames(request as any).slice(0, 20),
    });

    if (isProductQuery) {
      console.log('[Chatbot API] Starting RAG search for:', message);
      const ragResponse = await ragSearch(message, history, {
        maxProducts: 5,
        includeOutOfStock: false,
        minRelevanceScore: 0.1,
      });

      console.log('[Chatbot API] RAG response:', {
        hasContent: !!ragResponse?.content,
        productCardCount: ragResponse?.productCards?.length || 0,
        source: ragResponse?.source,
      });

      return NextResponse.json({
        success: ragResponse?.success !== false,
        content: ragResponse?.content,
        error: ragResponse?.error,
        source: ragResponse?.source || 'rag',
        metadata: ragResponse?.metadata,
        productCards: ragResponse?.productCards || [],
        rateLimit: {
          remaining: getRemainingMessages(userId),
          resetTime: getResetTime(userId),
        },
      });
    }

    // Otherwise, use the Gemini conversational service
    const aiResponse = await sendMessage(message, history);

    console.log('[Chatbot API] Gemini response:', {
      success: aiResponse?.success,
      length: aiResponse?.content?.length || 0,
      source: aiResponse?.source || 'gemini',
    });

    return NextResponse.json({
      success: aiResponse?.success !== false,
      content: aiResponse?.content,
      error: aiResponse?.error,
      source: aiResponse?.source || 'gemini',
      metadata: aiResponse?.metadata,
      rateLimit: {
        remaining: getRemainingMessages(userId),
        resetTime: getResetTime(userId),
      },
    });
    
  } catch (error) {
    console.error('[Chatbot API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process message. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chatbot/message
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/chatbot/message',
    status: 'online',
    version: process.env.npm_package_version || 'dev',
    features: ['product-recommendations', 'rag-search'],
    methods: ['POST'],
    description: 'Send a message to the MASH AI chatbot',
    usage: {
      method: 'POST',
      body: {
        message: 'string (required, max 500 chars)',
        history: 'Message[] (optional)',
      },
      response: {
        success: 'boolean',
        content: 'string (AI response)',
        productCards: 'ProductCardData[] (recommended products with add to cart/wishlist)',
        error: 'string (if error occurred)',
        rateLimit: {
          remaining: 'number (messages remaining)',
          resetTime: 'number (seconds until reset)',
        },
      },
    },
    rateLimit: {
      limit: '10 messages per minute',
      window: '60 seconds',
    },
  });
}
