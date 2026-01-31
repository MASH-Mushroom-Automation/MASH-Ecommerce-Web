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
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
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
    
    // Parse request body
    const body = await request.json();
    const { message, history = [] } = body;
    
    // Validate message
    const validation = validateMessage(message);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }
    
    // Use RAG search for product recommendations
    // This will search Sanity products and embed relevant product cards
    console.log('[Chatbot API] Starting RAG search for:', message);
    const response = await ragSearch(message, history, {
      maxProducts: 3, // Show 1-3 products as requested
      includeOutOfStock: true, // TEMPORARY: Include all products since stock data needs updating
      minRelevanceScore: 0.001, // Very low threshold to ensure matches
    });
    
    console.log('[Chatbot API] RAG response:', {
      hasContent: !!response.content,
      productCardCount: response.productCards?.length || 0,
      source: response.source,
    });
    
    // Return response with rate limit info and product cards
    return NextResponse.json({
      success: response.success !== false,
      content: response.content,
      error: response.error,
      source: response.source || 'rag',
      metadata: response.metadata,
      productCards: response.productCards || [],
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
