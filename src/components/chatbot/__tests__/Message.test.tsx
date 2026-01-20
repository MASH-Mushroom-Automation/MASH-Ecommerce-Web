/**
 * Unit Tests for Message Component
 * 
 * CRITICAL: Tests message rendering with EMBEDDED PRODUCT CARDS.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.8
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Message } from '../Message';
import type { Message as MessageType } from '@/types/chatbot';
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

const userMessage: MessageType = {
  id: 'msg-1',
  role: 'user',
  content: 'What mushrooms are good for stir-fry?',
  timestamp: '2026-01-21T10:00:00Z',
};

const assistantMessage: MessageType = {
  id: 'msg-2',
  role: 'assistant',
  content: 'I found some great mushrooms for stir-fry!',
  timestamp: '2026-01-21T10:00:01Z',
};

const mockProductCards: ProductCardData[] = [
  {
    id: '1',
    name: 'Fresh Oyster Mushrooms',
    slug: 'fresh-oyster',
    description: 'Perfect for stir-fry',
    price: 150,
    image: 'https://example.com/oyster.jpg',
    category: 'Oyster',
    inStock: true,
    tags: ['fresh'],
    relevanceScore: 0.9,
    matchedFields: ['name'],
  },
  {
    id: '2',
    name: 'King Oyster Mushrooms',
    slug: 'king-oyster',
    description: 'Meaty texture',
    price: 200,
    image: 'https://example.com/king.jpg',
    category: 'Oyster',
    inStock: true,
    tags: ['premium'],
    relevanceScore: 0.8,
    matchedFields: ['name'],
  },
];

describe('Message', () => {
  describe('User Message', () => {
    it('should render user message with correct styling', () => {
      render(<Message message={userMessage} />);

      expect(screen.getByText('What mushrooms are good for stir-fry?')).toBeInTheDocument();
      expect(screen.getByTestId('message-user')).toBeInTheDocument();
    });

    it('should display User icon', () => {
      const { container } = render(<Message message={userMessage} />);
      
      // User messages have flex-row-reverse
      const messageContainer = container.querySelector('[data-testid="message-user"]');
      expect(messageContainer).toHaveClass('flex-row-reverse');
    });

    it('should display timestamp', () => {
      render(<Message message={userMessage} />);

      // Timestamp should be formatted
      expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
    });
  });

  describe('Assistant Message', () => {
    it('should render assistant message', () => {
      render(<Message message={assistantMessage} />);

      expect(screen.getByText('I found some great mushrooms for stir-fry!')).toBeInTheDocument();
      expect(screen.getByTestId('message-assistant')).toBeInTheDocument();
    });

    it('should display Bot icon', () => {
      const { container } = render(<Message message={assistantMessage} />);
      
      const messageContainer = container.querySelector('[data-testid="message-assistant"]');
      expect(messageContainer).not.toHaveClass('flex-row-reverse');
    });
  });

  describe('Product Card Embedding (CRITICAL)', () => {
    it('should render product cards when provided', () => {
      render(
        <Message
          message={assistantMessage}
          productCards={mockProductCards}
        />
      );

      expect(screen.getByText('Fresh Oyster Mushrooms')).toBeInTheDocument();
      expect(screen.getByText('King Oyster Mushrooms')).toBeInTheDocument();
    });

    it('should render product cards grid', () => {
      render(
        <Message
          message={assistantMessage}
          productCards={mockProductCards}
        />
      );

      const grid = screen.getByTestId('product-cards-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should not render product cards for user messages', () => {
      render(
        <Message
          message={userMessage}
          productCards={mockProductCards}
        />
      );

      expect(screen.queryByTestId('product-cards-grid')).not.toBeInTheDocument();
    });

    it('should not render grid when no product cards', () => {
      render(<Message message={assistantMessage} />);

      expect(screen.queryByTestId('product-cards-grid')).not.toBeInTheDocument();
    });

    it('should render correct number of product cards', () => {
      render(
        <Message
          message={assistantMessage}
          productCards={mockProductCards}
        />
      );

      const cards = screen.getAllByTestId('product-card');
      expect(cards).toHaveLength(2);
    });

    it('should apply grid layout based on number of cards', () => {
      const { rerender } = render(
        <Message
          message={assistantMessage}
          productCards={[mockProductCards[0]]}
        />
      );

      let grid = screen.getByTestId('product-cards-grid');
      expect(grid).toHaveClass('grid-cols-1');

      // Rerender with 2 cards
      rerender(
        <Message
          message={assistantMessage}
          productCards={mockProductCards}
        />
      );

      grid = screen.getByTestId('product-cards-grid');
      expect(grid).toHaveClass('sm:grid-cols-2');
    });

    it('should pass onAddToCart to product cards', () => {
      const handleAddToCart = jest.fn();
      
      render(
        <Message
          message={assistantMessage}
          productCards={mockProductCards}
          onAddToCart={handleAddToCart}
        />
      );

      // Both cards should have Add to Cart buttons
      const addButtons = screen.getAllByText('Add to Cart');
      expect(addButtons).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when metadata.error exists', () => {
      const errorMessage: MessageType = {
        ...assistantMessage,
        metadata: { error: 'API timeout' },
      };

      render(<Message message={errorMessage} />);

      expect(screen.getByText('Error: API timeout')).toBeInTheDocument();
    });
  });
});
