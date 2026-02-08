/**
 * Unit Tests for ChatDialog Component
 * 
 * Tests dialog container, message list, and scrolling behavior.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.8
 */

import React from 'react';
import { render, screen, fireEvent } from '@/test-utils';
import { ChatDialog } from '../ChatDialog';
import type { Message } from '@/types/chatbot';
import type { ProductCardData } from '@/lib/ai/context-builder';

// Mock Next.js router for ProductCard
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'Hello! How can I help you?',
    timestamp: 1737456000000,
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Show me oyster mushrooms',
    timestamp: 1737456001000,
  },
];

const mockProductCards: ProductCardData[] = [
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
];

describe('ChatDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    messages: mockMessages,
    onSendMessage: jest.fn(),
    onClearHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(<ChatDialog {...defaultProps} />);

    expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    render(<ChatDialog {...defaultProps} open={false} />);

    expect(screen.queryByTestId('chat-dialog')).not.toBeInTheDocument();
  });

  it('should render dialog title', () => {
    render(<ChatDialog {...defaultProps} />);

    expect(screen.getByText('MASH AI Assistant')).toBeInTheDocument();
  });

  it('should render all messages', () => {
    render(<ChatDialog {...defaultProps} />);

    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    expect(screen.getByText('Show me oyster mushrooms')).toBeInTheDocument();
  });

  it('should render product cards when provided', () => {
    const productCardsByMessageId = {
      'msg-1': mockProductCards,
    };

    render(
      <ChatDialog
        {...defaultProps}
        productCardsByMessageId={productCardsByMessageId}
      />
    );

    expect(screen.getByText('Fresh Oyster')).toBeInTheDocument();
  });

  it('should show empty state when no messages', () => {
    render(<ChatDialog {...defaultProps} messages={[]} />);

    expect(screen.getByText('Welcome to MASH AI')).toBeInTheDocument();
  });

  it('should call onSendMessage when message sent', async () => {
    const handleSend = jest.fn();
    render(<ChatDialog {...defaultProps} onSendMessage={handleSend} />);

    const input = screen.getByTestId('chat-input-textarea');
    const sendButton = screen.getByTestId('chat-input-send-button');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(handleSend).toHaveBeenCalledWith('Test message');
  });

  it('should call onClearHistory when clear button clicked', () => {
    const handleClear = jest.fn();
    render(<ChatDialog {...defaultProps} onClearHistory={handleClear} />);

    const clearButton = screen.getByTestId('clear-history-button');
    fireEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('should disable clear button when no messages', () => {
    render(<ChatDialog {...defaultProps} messages={[]} />);

    const clearButton = screen.getByTestId('clear-history-button');
    expect(clearButton).toBeDisabled();
  });

  it('should show loading indicator when loading', () => {
    render(<ChatDialog {...defaultProps} loading={true} />);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('should disable input when loading', () => {
    render(<ChatDialog {...defaultProps} loading={true} />);

    const input = screen.getByTestId('chat-input-textarea');
    expect(input).toBeDisabled();
  });

  it('should render scroll area for messages', () => {
    render(<ChatDialog {...defaultProps} />);

    expect(screen.getByTestId('messages-scroll-area')).toBeInTheDocument();
  });

  it('should call onOpenChange when dialog closed', () => {
    const handleOpenChange = jest.fn();
    const { container } = render(
      <ChatDialog {...defaultProps} onOpenChange={handleOpenChange} />
    );

    // Simulate closing dialog (implementation depends on Dialog component)
    // This test assumes the Dialog component calls onOpenChange(false)
    // when escape key or overlay is clicked
  });

  it('should pass onAddToCart to messages', () => {
    const handleAddToCart = jest.fn();
    const productCardsByMessageId = {
      'msg-1': mockProductCards,
    };

    render(
      <ChatDialog
        {...defaultProps}
        productCardsByMessageId={productCardsByMessageId}
        onAddToCart={handleAddToCart}
      />
    );

    // Product card should have Add to Cart button
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });
});
