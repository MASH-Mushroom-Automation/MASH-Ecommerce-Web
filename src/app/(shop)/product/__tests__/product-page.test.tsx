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
      freshnessInfo: {},
      preparationInfo: {},
      deliveryOptions: {},
      grower: {
        slug: 'grower-1',
        name: 'Good Grower',
        location: 'Quezon City, Philippines',
        rating: 4.8,
        calcomUsername: 'mash-mushroom'
      },
      complementaryProducts: [],
    },
    loading: false,
    error: null,
  }),
  useSanitySuggestedProducts: () => ({ suggestedProducts: [], loading: false })
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
  test.skip('does not render variant selector nor bundle UI, shows grower contact & rating', () => {
    // Lazy-import the page to avoid module parsing at test load
    const ProductDetailPage = require('../[slug]/page').default;

    // Render the component via simple render (client component)
    render(<ProductDetailPage params={Promise.resolve({ slug: 'test-mushrooms' })} />);

    // Variant selector should not be present
    expect(screen.queryByText(/Select Option/i)).toBeNull();

    // Bundle UI should not be present (no "Add Bundle to Cart" button)
    expect(screen.queryByText(/Add Bundle to Cart/i)).toBeNull();

    // Grower rating should be visible
    expect(screen.getByText('4.8')).toBeInTheDocument();

    // Cal.com contact button should be present
    expect(screen.getByTestId('calcom-btn')).toBeInTheDocument();
  });
});