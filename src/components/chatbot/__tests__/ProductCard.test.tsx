/**
 * Unit Tests for ProductCard Component
 * 
 * CRITICAL: Tests product card embedding and navigation functionality.
 * 
 * @see .github/AI_CHATBOT_MASTER_PLAN.md - Phase 4, Task 4.8
 */

import React from 'react';
import { render, screen, fireEvent } from '@/test-utils';
import { useRouter } from 'next/navigation';
import { ProductCard } from '../ProductCard';
import type { ProductCardData } from '@/lib/ai/context-builder';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

const mockProduct: ProductCardData = {
  id: '1',
  name: 'Fresh Oyster Mushrooms',
  slug: 'fresh-oyster-mushrooms',
  description: 'Perfect for stir-fry dishes',
  price: 150,
  image: 'https://example.com/oyster.jpg',
  category: 'Oyster Mushrooms',
  inStock: true,
  grower: { name: 'Urban Fungi', id: 'g1' },
  tags: ['fresh', 'organic'],
  benefits: ['protein', 'vitamins'],
  relevanceScore: 0.85,
  matchedFields: ['name', 'category'],
};

describe('ProductCard', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('should render product card with all data', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Fresh Oyster Mushrooms')).toBeInTheDocument();
    expect(screen.getByText('Perfect for stir-fry dishes')).toBeInTheDocument();
    expect(screen.getByText('Oyster Mushrooms')).toBeInTheDocument();
    expect(screen.getByText('By Urban Fungi')).toBeInTheDocument();
  });

  it('should display price in PHP format', () => {
    render(<ProductCard product={mockProduct} />);

    // Price should be formatted as ₱150.00 or ₱150
    const priceElement = screen.getByText(/₱.*150/);
    expect(priceElement).toBeInTheDocument();
  });

  it('should show "In Stock" badge when product is available', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('should show "Out of Stock" badge when product is unavailable', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStockProduct} />);

    // Use getAllByText since "Out of Stock" appears twice (badge + button)
    const outOfStockElements = screen.getAllByText('Out of Stock');
    expect(outOfStockElements.length).toBeGreaterThan(0);
  });

  it('should navigate to product page when clicked', () => {
    render(<ProductCard product={mockProduct} />);

    const card = screen.getByTestId('product-card');
    fireEvent.click(card);

    expect(mockPush).toHaveBeenCalledWith('/product/fresh-oyster-mushrooms');
  });

  it('should call onAddToCart when Add to Cart button clicked', async () => {
    const handleAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAddToCart} />);

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    // Wait for async addItem to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(handleAddToCart).toHaveBeenCalledWith('1');
    // Should not navigate when Add to Cart is clicked
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should disable Add to Cart button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStockProduct} />);

    // Get the button specifically (second occurrence of "Out of Stock")
    const buttons = screen.getAllByText('Out of Stock');
    const addButton = buttons.find(el => el.tagName === 'BUTTON');
    expect(addButton).toBeDisabled();
  });

  it('should display relevance score when > 0', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('85% match')).toBeInTheDocument();
  });

  it('should display tags', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('fresh')).toBeInTheDocument();
    expect(screen.getByText('organic')).toBeInTheDocument();
  });

  it('should display matched fields', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Matches: name, category')).toBeInTheDocument();
  });

  it('should render product image', () => {
    render(<ProductCard product={mockProduct} />);

    // Use getByAltText (correct React Testing Library query)
    const image = screen.getByAltText('Fresh Oyster Mushrooms');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/oyster.jpg');
  });
});
