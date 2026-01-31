/**
 * Chatbot TypeScript Types & Interfaces
 * 
 * Defines all types used across the chatbot system.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 1
 */

/**
 * Message role types
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message structure
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

/**
 * Optional message metadata
 */
export interface MessageMetadata {
  products?: ProductReference[];
  links?: LinkReference[];
  error?: string;
  source?: 'gemini' | 'huggingface' | 'fallback';
}

/**
 * Product reference in chat messages
 */
export interface ProductReference {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
}

/**
 * Link reference in chat messages
 */
export interface LinkReference {
  text: string;
  url: string;
  type: 'product' | 'category' | 'recipe' | 'external';
}

/**
 * Chat session structure
 */
export interface ChatSession {
  id: string;
  messages: Message[];
  startedAt: number;
  lastMessageAt: number;
  userId?: string;
}

/**
 * AI response from Gemini or Hugging Face
 */
export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
  source: 'gemini' | 'huggingface' | 'fallback' | 'rag';
  metadata?: {
    tokensUsed?: number;
    model?: string;
    processingTime?: number;
    timestamp?: string;
    fallbackUsed?: boolean;
    primaryError?: string;
  };
}

/**
 * Chat context for RAG (Retrieval-Augmented Generation)
 */
export interface ChatContext {
  query: string;
  relevantProducts: ProductReference[];
  conversationHistory: Message[];
  systemPrompt: string;
}

/**
 * Rate limiting state
 */
export interface RateLimitState {
  userId: string;
  messageCount: number;
  windowStart: number;
  isLimited: boolean;
}

/**
 * Error types for chatbot
 */
export enum ChatbotError {
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

/**
 * Chatbot configuration options
 */
export interface ChatbotConfig {
  enabled: boolean;
  debug: boolean;
  maxMessagesPerMinute: number;
  maxMessageLength: number;
  apiTimeout: number;
}
