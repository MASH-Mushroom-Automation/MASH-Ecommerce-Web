'use client';

/**
 * ChatContext - State Management for AI Chatbot
 * 
 * CRITICAL: Integrates with RAG service to fetch products and embed cards in messages.
 * Manages conversation state, product cards, and chat history persistence.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.6
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { smartRAGSearch } from '@/lib/ai/rag-service';
import type { Message, AIResponse } from '@/types/chatbot';
import type { ProductCardData } from '@/lib/ai/context-builder';
import type { RAGResponse } from '@/lib/ai/rag-service';
import * as analytics from '@/lib/analytics/chatbot-analytics';

export type ChatViewState = 'minimized' | 'normal' | 'maximized';

interface ChatContextValue {
  messages: Message[];
  productCardsByMessageId: Record<string, ProductCardData[]>;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  viewState: ChatViewState;
  conversationId: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  setIsOpen: (open: boolean) => void;
  setViewState: (state: ChatViewState) => void;
  toggleMinimize: () => void;
  toggleMaximize: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const STORAGE_KEY = 'mash-chatbot-history';
const INTRO_SHOWN_KEY = 'mash-chatbot-intro-shown';
const VIEW_STATE_KEY = 'mash-chatbot-view-state';

const INTRO_MESSAGE: Message = {
  id: 'intro',
  role: 'assistant',
  content: `Hi! I'm MASH AI Assistant.

I can help you find the perfect mushrooms for your recipes, provide cooking tips, and answer questions about our products.

Try asking:
• "What mushroom is good for beef pepper garlic?"
• "Show me oyster mushrooms"
• "How do I cook king oyster mushrooms?"

How can I help you today?`,
  timestamp: Date.now(),
};

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [productCardsByMessageId, setProductCardsByMessageId] = useState<
    Record<string, ProductCardData[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [viewState, setViewState] = useState<ChatViewState>('normal');
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Load persisted view state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewState = localStorage.getItem(VIEW_STATE_KEY) as ChatViewState;
      if (savedViewState && ['minimized', 'normal', 'maximized'].includes(savedViewState)) {
        setViewState(savedViewState);
      }
    }
  }, []);

  // Persist view state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VIEW_STATE_KEY, viewState);
    }
  }, [viewState]);

  // Toggle minimize/maximize functions
  const toggleMinimize = useCallback(() => {
    setViewState(prev => prev === 'minimized' ? 'normal' : 'minimized');
  }, []);

  const toggleMaximize = useCallback(() => {
    setViewState(prev => prev === 'maximized' ? 'normal' : 'maximized');
  }, []);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setMessages(data.messages || []);
        setProductCardsByMessageId(data.productCards || {});
      } else {
        // Show intro message on first open
        const introShown = localStorage.getItem(INTRO_SHOWN_KEY);
        if (!introShown) {
          setMessages([INTRO_MESSAGE]);
          localStorage.setItem(INTRO_SHOWN_KEY, 'true');
        }
      }
    } catch (err) {
      console.error('[ChatContext] Failed to load history:', err);
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            messages,
            productCards: productCardsByMessageId,
            timestamp: new Date().toISOString(),
          })
        );
      } catch (err) {
        console.error('[ChatContext] Failed to save history:', err);
      }
    }
  }, [messages, productCardsByMessageId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return;

      // Start conversation tracking on first message
      if (!conversationId) {
        const newConversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setConversationId(newConversationId);
        await analytics.startConversation('anonymous', newConversationId);
      }

      setLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      const startTime = Date.now();

      try {
        // Call API route that uses RAG search
        const apiResponse = await fetch('/api/chatbot/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            history: messages,
          }),
        });

        if (!apiResponse.ok) {
          throw new Error('API request failed');
        }

        const response = await apiResponse.json();
        const responseTime = Date.now() - startTime;

        console.log('[ChatContext] API Response received:', {
          hasContent: !!response.content,
          productCardCount: response.productCards?.length || 0,
          source: response.source,
        });

        // Create assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          metadata: {
            source: response.source || 'rag',
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // CRITICAL: Store product cards for this message
        if (response.productCards && response.productCards.length > 0) {
          console.log('[ChatContext] Storing product cards:', {
            messageId: assistantMessage.id,
            cardCount: response.productCards.length,
            firstCard: response.productCards[0]?.name,
          });
          setProductCardsByMessageId((prev) => ({
            ...prev,
            [assistantMessage.id]: response.productCards,
          }));
        } else {
          console.log('[ChatContext] No product cards in response');
        }

        // Track query analytics
        if (conversationId) {
          await analytics.logQuery({
            query: content.trim(),
            timestamp: Date.now(),
            userId: 'anonymous',
            conversationId,
            responseTime,
            productCardsReturned: response.productCards?.length || 0,
            success: true,
          });

          await analytics.incrementMessageCount(conversationId);

          // Update conversation metrics
          if (response.productCards && response.productCards.length > 0) {
            await analytics.updateConversationMetrics(conversationId, {
              productCardsShown: response.productCards.length,
            });
          }
        }
      } catch (err) {
        console.error('[ChatContext] Failed to send message:', err);
        
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
          metadata: {
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        };

        setMessages((prev) => [...prev, errorMessage]);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // Track error analytics
        if (conversationId) {
          const errorType = err instanceof Error && err.message.includes('429') 
            ? 'rate_limit' 
            : err instanceof Error && err.message.includes('timeout')
            ? 'timeout'
            : 'api_error';

          await analytics.logError({
            type: errorType,
            message: err instanceof Error ? err.message : 'Unknown error',
            timestamp: Date.now(),
            userId: 'anonymous',
            conversationId,
            query: content.trim(),
            responseTime: Date.now() - startTime,
          });

          await analytics.logQuery({
            query: content.trim(),
            timestamp: Date.now(),
            userId: 'anonymous',
            conversationId,
            responseTime: Date.now() - startTime,
            productCardsReturned: 0,
            success: false,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, conversationId]
  );

  const clearHistory = useCallback(() => {
    setMessages([INTRO_MESSAGE]);
    setProductCardsByMessageId({});
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: ChatContextValue = {
    messages,
    productCardsByMessageId,
    loading,
    error,
    isOpen,
    viewState,
    conversationId,
    sendMessage,
    clearHistory,
    setIsOpen,
    setViewState,
    toggleMinimize,
    toggleMaximize,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
