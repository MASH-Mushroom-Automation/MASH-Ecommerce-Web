/**
 * Unit Tests for ChatContext
 * 
 * CRITICAL: Tests state management and RAG service integration.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.8
 */

// CRITICAL: Mock Sanity modules FIRST to avoid ES module import errors
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
  previewClient: {
    fetch: jest.fn(),
  },
}));

jest.mock('@/lib/ai/sanity-rag', () => ({
  searchProducts: jest.fn(),
  searchRecipes: jest.fn(),
  searchGrowers: jest.fn(),
}));

// Mock RAG service
jest.mock('@/lib/ai/rag-service');

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ChatProvider, useChat } from '../ChatContext';
import * as ragService from '@/lib/ai/rag-service';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch API
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('ChatContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  it('should throw error when useChat is called outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useChat());
    }).toThrow('useChat must be used within ChatProvider');

    console.error = originalError;
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    expect(result.current.messages).toHaveLength(1); // Intro message
    expect(result.current.messages[0].role).toBe('assistant');
    expect(result.current.productCardsByMessageId).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it('should send message and update state', async () => {
    const mockResponse = {
      success: true,
      content: 'Here are some oyster mushrooms!',
      source: 'rag',
      productCards: [
        {
          id: '1',
          name: 'Fresh Oyster',
          slug: 'fresh-oyster',
          description: 'Fresh',
          price: 150,
          image: 'https://example.com/img.jpg',
          category: 'Oyster',
          inStock: true,
          tags: [],
          relevanceScore: 0.9,
          matchedFields: [],
        },
      ],
    };

    // Mock fetch API call
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    await act(async () => {
      await result.current.sendMessage('Show me oyster mushrooms');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have intro + user + assistant messages
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1].role).toBe('user');
    expect(result.current.messages[1].content).toBe('Show me oyster mushrooms');
    expect(result.current.messages[2].role).toBe('assistant');
    expect(result.current.messages[2].content).toBe('Here are some oyster mushrooms!');

    // Should have product cards
    const assistantMessageId = result.current.messages[2].id;
    expect(result.current.productCardsByMessageId[assistantMessageId]).toHaveLength(1);
  });

  it('should handle RAG service errors', async () => {
    // Mock fetch to reject with error
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
      new Error('API timeout')
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have error message
    const lastMessage = result.current.messages[result.current.messages.length - 1];
    expect(lastMessage.content).toContain('Sorry, I encountered an error');
    expect(lastMessage.metadata?.error).toBe('API timeout');
    expect(result.current.error).toBe('API timeout');
  });

  it('should not send empty messages', async () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    const initialLength = result.current.messages.length;

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(initialLength);
    expect(ragService.smartRAGSearch).not.toHaveBeenCalled();
  });

  it('should clear history', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.messages).toHaveLength(1); // Only intro message
    expect(result.current.productCardsByMessageId).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('should toggle isOpen state', () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.setIsOpen(true);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should persist chat history to localStorage', async () => {
    const mockResponse = {
      content: 'Response',
      source: 'gemini',
      productCards: [],
    };

    (ragService.smartRAGSearch as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stored = localStorage.getItem('mash-chatbot-history');
    expect(stored).not.toBeNull();

    const data = JSON.parse(stored!);
    expect(data.messages).toBeDefined();
    expect(data.productCards).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });

  it('should load chat history from localStorage', () => {
    const savedHistory = {
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'Hello!',
          timestamp: '2026-01-21T10:00:00Z',
        },
      ],
      productCards: {},
      timestamp: '2026-01-21T10:00:00Z',
    };

    localStorage.setItem('mash-chatbot-history', JSON.stringify(savedHistory));

    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello!');
  });

  it('should prevent sending multiple messages while loading', async () => {
    const mockResponse = {
      content: 'Response',
      success: true,
      source: 'rag',
      productCards: [],
    };

    let resolveFirstMessage: ((value: any) => void) | null = null;
    
    // Mock fetch to delay response
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFirstMessage = () => resolve({
            ok: true,
            json: async () => mockResponse,
          } as Response);
        })
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: ChatProvider,
    });

    // Send first message
    act(() => {
      result.current.sendMessage('Message 1');
    });

    // Wait for loading state
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    }, { timeout: 3000 });

    // Try to send second message while first is loading (should be ignored)
    act(() => {
      result.current.sendMessage('Message 2');
    });

    // Resolve first message
    act(() => {
      resolveFirstMessage?.();
    });

    // Wait for first message to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should only have called fetch once (second was prevented)
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
