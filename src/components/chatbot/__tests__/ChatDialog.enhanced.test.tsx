/**
 * Comprehensive Unit Tests for ChatDialog Component
 * Tests all view states (minimized, normal, maximized),
 * interactions, welcome screen, suggestion chips, and edge cases.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatDialog } from '../ChatDialog';
import type { Message } from '@/types/chatbot';
import type { ProductCardData } from '@/lib/ai/context-builder';

// Mock scroll-area (simple passthrough)
jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )),
}));

// Mock Button (simple passthrough preserving props)
jest.mock('@/components/ui/button', () => ({
  Button: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )),
}));

// Mock Message component
jest.mock('../Message', () => ({
  Message: ({ message }: { message: Message }) => (
    <div data-testid={`message-${message.id}`}>{message.content}</div>
  ),
}));

// Mock ChatInput component
jest.mock('../ChatInput', () => ({
  ChatInput: ({ onSend, disabled }: { onSend: (msg: string) => void; disabled: boolean }) => (
    <input
      data-testid="chat-input"
      placeholder="Type a message"
      disabled={disabled}
      onChange={(e) => onSend(e.target.value)}
    />
  ),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('ChatDialog', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hello! How can I help you?',
      timestamp: Date.now(),
    },
    {
      id: 'msg-2',
      role: 'user',
      content: 'Show me mushrooms',
      timestamp: Date.now(),
    },
  ];

  const mockProductCards: Record<string, ProductCardData[]> = {
    'msg-1': [
      {
        _id: 'prod-1',
        name: 'Oyster Mushroom',
        price: 150,
        mainImage: '/test-image.jpg',
        slug: 'oyster-mushroom',
        category: 'Fresh',
        description: 'Test mushroom',
      },
    ],
  };

  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    messages: mockMessages,
    productCardsByMessageId: mockProductCards,
    onSendMessage: jest.fn(),
    onClearHistory: jest.fn(),
    loading: false,
    viewState: 'normal' as const,
    onToggleMinimize: jest.fn(),
    onToggleMaximize: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ================================================================ */
  /*  Rendering & Visibility                                          */
  /* ================================================================ */

  describe('Rendering', () => {
    it('should return null when open is false', () => {
      const { container } = render(<ChatDialog {...defaultProps} open={false} />);
      expect(container.innerHTML).toBe('');
    });

    it('should render the dialog panel when open is true', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
    });

    it('should render with role="dialog"', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-label on the dialog', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'MASH AI Assistant chat');
    });
  });

  /* ================================================================ */
  /*  Normal View                                                      */
  /* ================================================================ */

  describe('Normal View', () => {
    it('should render the header with title and subtitle', () => {
      render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.getByText('MASH AI Assistant')).toBeInTheDocument();
    });

    it('should show correct data-view-state attribute', () => {
      render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.getByTestId('chat-dialog')).toHaveAttribute('data-view-state', 'normal');
    });

    it('should render all messages', () => {
      render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.getByTestId('message-msg-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-msg-2')).toBeInTheDocument();
    });

    it('should render the MASH logo in header', () => {
      render(<ChatDialog {...defaultProps} viewState="normal" />);
      const logos = screen.getAllByAltText('MASH');
      expect(logos.length).toBeGreaterThan(0);
    });

    it('should render the ChatInput', () => {
      render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });
  });

  /* ================================================================ */
  /*  Header Buttons                                                   */
  /* ================================================================ */

  describe('Header Buttons', () => {
    it('should call onToggleMinimize when minimize button clicked', () => {
      render(<ChatDialog {...defaultProps} />);
      fireEvent.click(screen.getByTestId('minimize-button'));
      expect(defaultProps.onToggleMinimize).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleMaximize when maximize button clicked', () => {
      render(<ChatDialog {...defaultProps} />);
      fireEvent.click(screen.getByTestId('maximize-button'));
      expect(defaultProps.onToggleMaximize).toHaveBeenCalledTimes(1);
    });

    it('should call onClearHistory when clear button clicked', () => {
      render(<ChatDialog {...defaultProps} />);
      fireEvent.click(screen.getByTestId('clear-history-button'));
      expect(defaultProps.onClearHistory).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenChange(false) when close button clicked', () => {
      render(<ChatDialog {...defaultProps} />);
      fireEvent.click(screen.getByTestId('close-button'));
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should disable clear button when no messages', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      expect(screen.getByTestId('clear-history-button')).toBeDisabled();
    });

    it('should enable clear button when messages exist', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByTestId('clear-history-button')).not.toBeDisabled();
    });

    it('should have aria-labels on all header buttons', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByTestId('minimize-button')).toHaveAttribute('aria-label', 'Minimize');
      expect(screen.getByTestId('maximize-button')).toHaveAttribute('aria-label', 'Maximize');
      expect(screen.getByTestId('clear-history-button')).toHaveAttribute('aria-label', 'Clear chat history');
      expect(screen.getByTestId('close-button')).toHaveAttribute('aria-label', 'Close chat');
    });
  });

  /* ================================================================ */
  /*  Welcome / Empty State                                            */
  /* ================================================================ */

  describe('Welcome State (empty messages)', () => {
    it('should show empty-state when no messages', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('should display welcome text', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      expect(screen.getByText('Welcome to MASH AI')).toBeInTheDocument();
    });

    it('should display welcome description', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      expect(
        screen.getByText(/help you find mushrooms, share recipes/)
      ).toBeInTheDocument();
    });

    it('should render suggestion chips', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      const chips = screen.getAllByTestId('suggestion-chip');
      expect(chips).toHaveLength(3);
    });

    it('should show correct suggestion text', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      expect(screen.getByText('Show me oyster mushrooms')).toBeInTheDocument();
      expect(screen.getByText('Best for stir-fry?')).toBeInTheDocument();
      expect(screen.getByText('Cooking tips')).toBeInTheDocument();
    });

    it('should call onSendMessage when suggestion chip clicked', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      const chips = screen.getAllByTestId('suggestion-chip');
      fireEvent.click(chips[0]);
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Show me oyster mushrooms');
    });

    it('should call onSendMessage with correct text for each chip', () => {
      render(<ChatDialog {...defaultProps} messages={[]} />);
      const chips = screen.getAllByTestId('suggestion-chip');

      fireEvent.click(chips[1]);
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Best for stir-fry?');

      fireEvent.click(chips[2]);
      expect(defaultProps.onSendMessage).toHaveBeenCalledWith('Cooking tips');
    });

    it('should not show empty-state when messages exist', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  /* ================================================================ */
  /*  Loading State                                                    */
  /* ================================================================ */

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      render(<ChatDialog {...defaultProps} loading={true} />);
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should show "Thinking..." text when loading', () => {
      render(<ChatDialog {...defaultProps} loading={true} />);
      expect(screen.getByText('Thinking...')).toBeInTheDocument();
    });

    it('should not show loading indicator when not loading', () => {
      render(<ChatDialog {...defaultProps} loading={false} />);
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    it('should disable ChatInput when loading', () => {
      render(<ChatDialog {...defaultProps} loading={true} />);
      expect(screen.getByTestId('chat-input')).toBeDisabled();
    });
  });

  /* ================================================================ */
  /*  Minimized View                                                   */
  /* ================================================================ */

  describe('Minimized View', () => {
    it('should render minimized bar instead of full dialog', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.getByTestId('chat-minimized')).toBeInTheDocument();
      expect(screen.queryByTestId('chat-dialog')).not.toBeInTheDocument();
    });

    it('should show MASH AI text in minimized bar', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.getByText('MASH AI')).toBeInTheDocument();
    });

    it('should show MASH logo in minimized bar', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.getByAltText('MASH')).toBeInTheDocument();
    });

    it('should call onToggleMinimize when minimized bar clicked', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      const bar = screen.getByTestId('chat-minimized');
      const clickTarget = bar.querySelector('[role="button"]');
      fireEvent.click(clickTarget!);
      expect(defaultProps.onToggleMinimize).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenChange(false) when close button clicked in minimized view', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      fireEvent.click(screen.getByTestId('close-minimized-button'));
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not render messages in minimized view', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.queryByTestId('message-msg-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('message-msg-2')).not.toBeInTheDocument();
    });

    it('should not render ChatInput in minimized view', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.queryByTestId('chat-input')).not.toBeInTheDocument();
    });

    it('should show loading dots when loading in minimized view', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" loading={true} />);
      const minimized = screen.getByTestId('chat-minimized');
      const dots = minimized.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(3);
    });

    it('should not show loading dots when not loading in minimized view', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" loading={false} />);
      const minimized = screen.getByTestId('chat-minimized');
      const dots = minimized.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(0);
    });

    it('should not render when open is false even if minimized', () => {
      render(<ChatDialog {...defaultProps} open={false} viewState="minimized" />);
      expect(screen.queryByTestId('chat-minimized')).not.toBeInTheDocument();
    });

    it('should have keyboard support on minimized bar', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      const bar = screen.getByTestId('chat-minimized');
      const clickTarget = bar.querySelector('[role="button"]');
      fireEvent.keyDown(clickTarget!, { key: 'Enter' });
      expect(defaultProps.onToggleMinimize).toHaveBeenCalledTimes(1);
    });
  });

  /* ================================================================ */
  /*  Maximized View                                                   */
  /* ================================================================ */

  describe('Maximized View', () => {
    it('should render dialog with maximized data-view-state', () => {
      render(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('chat-dialog')).toHaveAttribute('data-view-state', 'maximized');
    });

    it('should render backdrop behind maximized dialog', () => {
      render(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('maximized-backdrop')).toBeInTheDocument();
    });

    it('should not render backdrop in normal view', () => {
      render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.queryByTestId('maximized-backdrop')).not.toBeInTheDocument();
    });

    it('should call onToggleMaximize when backdrop clicked', () => {
      render(<ChatDialog {...defaultProps} viewState="maximized" />);
      fireEvent.click(screen.getByTestId('maximized-backdrop'));
      expect(defaultProps.onToggleMaximize).toHaveBeenCalledTimes(1);
    });

    it('should show "Restore size" aria-label on maximize button when maximized', () => {
      render(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('maximize-button')).toHaveAttribute('aria-label', 'Restore size');
    });

    it('should show "Maximize" aria-label on maximize button when normal', () => {
      render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.getByTestId('maximize-button')).toHaveAttribute('aria-label', 'Maximize');
    });

    it('should render all messages in maximized view', () => {
      render(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('message-msg-1')).toBeInTheDocument();
      expect(screen.getByTestId('message-msg-2')).toBeInTheDocument();
    });

    it('should render ChatInput in maximized view', () => {
      render(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    });
  });

  /* ================================================================ */
  /*  View State Transitions                                           */
  /* ================================================================ */

  describe('View State Transitions', () => {
    it('should transition from normal to minimized', () => {
      const { rerender } = render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();

      rerender(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.queryByTestId('chat-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-minimized')).toBeInTheDocument();
    });

    it('should transition from normal to maximized', () => {
      const { rerender } = render(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.getByTestId('chat-dialog')).toHaveAttribute('data-view-state', 'normal');

      rerender(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('chat-dialog')).toHaveAttribute('data-view-state', 'maximized');
      expect(screen.getByTestId('maximized-backdrop')).toBeInTheDocument();
    });

    it('should transition from minimized to normal', () => {
      const { rerender } = render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.getByTestId('chat-minimized')).toBeInTheDocument();

      rerender(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.queryByTestId('chat-minimized')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
    });

    it('should transition from minimized to maximized', () => {
      const { rerender } = render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.getByTestId('chat-minimized')).toBeInTheDocument();

      rerender(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.queryByTestId('chat-minimized')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('maximized-backdrop')).toBeInTheDocument();
    });

    it('should transition from maximized to normal', () => {
      const { rerender } = render(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('maximized-backdrop')).toBeInTheDocument();

      rerender(<ChatDialog {...defaultProps} viewState="normal" />);
      expect(screen.queryByTestId('maximized-backdrop')).not.toBeInTheDocument();
      expect(screen.getByTestId('chat-dialog')).toHaveAttribute('data-view-state', 'normal');
    });

    it('should transition from open to closed', () => {
      const { rerender } = render(<ChatDialog {...defaultProps} open={true} />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();

      rerender(<ChatDialog {...defaultProps} open={false} />);
      expect(screen.queryByTestId('chat-dialog')).not.toBeInTheDocument();
    });
  });

  /* ================================================================ */
  /*  Edge Cases                                                       */
  /* ================================================================ */

  describe('Edge Cases', () => {
    it('should handle undefined productCardsByMessageId gracefully', () => {
      render(<ChatDialog {...defaultProps} productCardsByMessageId={undefined} />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
    });

    it('should handle empty productCardsByMessageId', () => {
      render(<ChatDialog {...defaultProps} productCardsByMessageId={{}} />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
    });

    it('should handle undefined conversationId', () => {
      render(<ChatDialog {...defaultProps} conversationId={undefined} />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
    });

    it('should handle undefined viewState (defaults to normal)', () => {
      render(<ChatDialog {...defaultProps} viewState={undefined} />);
      expect(screen.getByTestId('chat-dialog')).toHaveAttribute('data-view-state', 'normal');
    });

    it('should apply custom className', () => {
      render(<ChatDialog {...defaultProps} className="custom-dialog-class" />);
      const dialog = screen.getByTestId('chat-dialog');
      expect(dialog.className).toContain('custom-dialog-class');
    });

    it('should handle single message', () => {
      render(<ChatDialog {...defaultProps} messages={[mockMessages[0]]} />);
      expect(screen.getByTestId('message-msg-1')).toBeInTheDocument();
      expect(screen.queryByTestId('message-msg-2')).not.toBeInTheDocument();
    });

    it('should handle many messages without crashing', () => {
      const manyMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
        timestamp: Date.now(),
      }));
      render(<ChatDialog {...defaultProps} messages={manyMessages} />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
    });

    it('should handle onAddToCart callback', () => {
      const onAddToCart = jest.fn();
      render(<ChatDialog {...defaultProps} onAddToCart={onAddToCart} />);
      expect(screen.getByTestId('chat-dialog')).toBeInTheDocument();
    });

    it('should handle missing onToggleMinimize gracefully', () => {
      render(<ChatDialog {...defaultProps} onToggleMinimize={undefined} />);
      expect(() => {
        fireEvent.click(screen.getByTestId('minimize-button'));
      }).not.toThrow();
    });

    it('should handle missing onToggleMaximize gracefully', () => {
      render(<ChatDialog {...defaultProps} onToggleMaximize={undefined} />);
      expect(() => {
        fireEvent.click(screen.getByTestId('maximize-button'));
      }).not.toThrow();
    });
  });

  /* ================================================================ */
  /*  Accessibility                                                    */
  /* ================================================================ */

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-label on dialog', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label');
    });

    it('should have aria-label on minimized close button', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      expect(screen.getByTestId('close-minimized-button')).toHaveAttribute('aria-label', 'Close chat');
    });

    it('should have aria-label on minimized restore area', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      const bar = screen.getByTestId('chat-minimized');
      const clickTarget = bar.querySelector('[role="button"]');
      expect(clickTarget).toHaveAttribute('aria-label', 'Restore chat window');
    });

    it('should mark maximized backdrop as aria-hidden', () => {
      render(<ChatDialog {...defaultProps} viewState="maximized" />);
      expect(screen.getByTestId('maximized-backdrop')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have tabIndex on minimized bar for keyboard focus', () => {
      render(<ChatDialog {...defaultProps} viewState="minimized" />);
      const bar = screen.getByTestId('chat-minimized');
      const clickTarget = bar.querySelector('[role="button"]');
      expect(clickTarget).toHaveAttribute('tabIndex', '0');
    });
  });

  /* ================================================================ */
  /*  Messages scroll area                                             */
  /* ================================================================ */

  describe('Scroll Area', () => {
    it('should render messages scroll area', () => {
      render(<ChatDialog {...defaultProps} />);
      expect(screen.getByTestId('messages-scroll-area')).toBeInTheDocument();
    });

    it('should contain all messages within scroll area', () => {
      render(<ChatDialog {...defaultProps} />);
      const scrollArea = screen.getByTestId('messages-scroll-area');
      expect(scrollArea).toContainElement(screen.getByTestId('message-msg-1'));
      expect(scrollArea).toContainElement(screen.getByTestId('message-msg-2'));
    });
  });
});
