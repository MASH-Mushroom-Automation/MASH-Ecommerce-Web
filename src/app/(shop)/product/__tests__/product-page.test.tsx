import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('@/hooks/useSanityProducts', () => ({
  useSanityProduct: (slug: string) => ({
    product: {
      id: 'prod-1',
      name: 'Test Mushrooms',
      slug: 'test-mushrooms',
      price: 120,
      images: [],
      image: '/mush.png',
      stock: 10,
      category: 'Mushrooms',
      description: 'Tasty mushrooms',
      freshnessInfo: {
        harvestWindow: 'Harvested within 24-48 hours',
        shelfLife: 'Keep refrigerated, 5-7 days',
        storageInstructions: 'Store in breathable paper bag',
        qualityIndicators: ['Firm texture', 'Bright caps'],
      },
      preparationInfo: {
        difficultyLevel: 'beginner',
        cookingTime: '10-15 mins',
        preparationTips: ['Rinse lightly', 'Pat dry'],
        recipeIdeas: ['Sautéed with garlic', 'Grilled skewers'],
      },
      deliveryOptions: {
        sameDayDeliveryEligible: true,
        deliveryZones: ['Metro Manila'],
        perishable: true,
        deliveryNotes: 'Delivered chilled via cold transport',
      },
      grower: {
        slug: 'grower-1',
        name: 'Good Grower',
        location: 'Quezon City, Philippines',
        rating: 4.8,
        calcomUsername: 'mash-mushroom',
        image: 'https://example.com/grower.jpg'
      },
      complementaryProducts: [],
    },
    loading: false,
    error: null,
  }),
  useSanitySuggestedProducts: () => ({ suggestedProducts: [
    { id: 's1', name: 'Suggested A', slug: 'suggested-a', price: 80, image: '/s1.png', isAvailable: true },
    { id: 's2', name: 'Suggested B', slug: 'suggested-b', price: 90, image: '/s2.png', isAvailable: true },
  ], loading: false })
}));

// Mock ChatContext for Quick Chat button
jest.mock('@/contexts/ChatContext', () => ({
  useChat: () => ({ setIsOpen: jest.fn(), sendMessage: jest.fn() }),
}));

// Mock Cart and Wishlist hooks used by the page
jest.mock('@/contexts/WishlistContext', () => ({
  useWishlist: () => ({ isInWishlist: jest.fn(() => false), addToWishlist: jest.fn(), removeFromWishlist: jest.fn() }),
}));
jest.mock('@/contexts/CartContext', () => ({
  useCart: () => ({ addToCart: jest.fn() }),
}));

jest.mock('@/hooks/useSanityReviews', () => ({
  useSanityReviews: () => ({ reviews: [], rating: 4.8, loading: false }),
}));

// Mock Cal.com button to avoid ESM embed-loading
jest.mock('@/components/appointments/CalendlyButton', () => ({
  CalComButton: ({ username }: any) => <button data-testid="calcom-btn">Book: {username}</button>
}));

// Product page import is lazy-required inside the test to avoid module-parsing at test load time

describe('ProductDetailPage (storefront)', () => {
  test('shows grower contact & rating via ProductDetailsSections (unit)', async () => {
    // Render only ProductDetailsSections to test grower contact area in isolation
    const product = {
      id: 'prod-1',
      name: 'Test Mushrooms',
      grower: {
        slug: 'grower-1',
        name: 'Good Grower',
        location: 'Quezon City, Philippines',
        rating: 4.8,
        calcomUsername: 'mash-mushroom',
        image: 'https://example.com/grower.jpg'
      }
    } as any;

    const ProductDetailsSections = require('@/components/product/ProductDetailsSections').default;

    render(<ProductDetailsSections product={product} />);

    // Grower name should be visible
    expect(await screen.findByText(/Good Grower/)).toBeInTheDocument();

    // Highly rated badge (4.5+) should be visible
    expect(await screen.findByText(/Highly rated/i)).toBeInTheDocument();

    // Cal.com contact button should be present
    expect(await screen.findByTestId('calcom-btn')).toBeInTheDocument();

    // Google Maps should be present either as embedded iframe (when API key present) or as external link
    expect(screen.queryByTestId('grower-map') || screen.queryByText(/View on Google Maps/i)).toBeTruthy();

    // Quick Chat button should be present
    expect(await screen.findByTestId('contact-chat-btn')).toBeInTheDocument();

    // The above detailed sections were removed for cleaner UX; ensure they are NOT rendered here
    expect(screen.queryByText(/Freshness & Quality/i)).toBeNull();
    expect(screen.queryByText(/Cooking Guide/i)).toBeNull();
    expect(screen.queryByText(/Delivery Options/i)).toBeNull();
  });

  test('does not render variant selector nor bundle UI (unit)', () => {
    // These items are part of the full page; ensure they are not present when rendering the details section
    const product = { name: 'Test Mushrooms', grower: null } as any;
    const ProductDetailsSections = require('@/components/product/ProductDetailsSections').default;
    render(<ProductDetailsSections product={product} />);

    // Variant selector should not be present
    expect(screen.queryByText(/Select Option/i)).toBeNull();

    // Bundle UI should not be present (no "Add Bundle to Cart" button)
    expect(screen.queryByText(/Add Bundle to Cart/i)).toBeNull();
  });


});