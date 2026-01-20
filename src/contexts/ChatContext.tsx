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

interface ChatContextValue {
  messages: Message[];
  productCardsByMessageId: Record<string, ProductCardData[]>;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  setIsOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const STORAGE_KEY = 'mash-chatbot-history';
const INTRO_SHOWN_KEY = 'mash-chatbot-intro-shown';

const INTRO_MESSAGE: Message = {
  id: 'intro',
  role: 'assistant',
  content: `Hi! I'm MASH AI Assistant. 🍄

I can help you find the perfect mushrooms for your recipes, provide cooking tips, and answer questions about our products.

Try asking:
• "What mushroom is good for beef pepper garlic?"
• "Show me oyster mushrooms"
• "How do I cook king oyster mushrooms?"

How can I help you today?`,
  timestamp: new Date().toISOString(),
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

      setLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // CRITICAL: Use smartRAGSearch to get response with product cards
        const response: RAGResponse = await smartRAGSearch(
          content,
          messages, // Pass conversation history for context
          {
            maxProducts: 5,
            includeOutOfStock: false,
            minRelevanceScore: 0.3,
          }
        );

        // Create assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          metadata: {
            source: response.source,
            tokensUsed: response.tokensUsed,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // CRITICAL: Store product cards for this message
        if (response.productCards && response.productCards.length > 0) {
          setProductCardsByMessageId((prev) => ({
            ...prev,
            [assistantMessage.id]: response.productCards!,
          }));
        }
      } catch (err) {
        console.error('[ChatContext] Failed to send message:', err);
        
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          metadata: {
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        };

        setMessages((prev) => [...prev, errorMessage]);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
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
    sendMessage,
    clearHistory,
    setIsOpen,
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
