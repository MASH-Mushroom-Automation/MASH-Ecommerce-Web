import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { useSanityReviews } from '../useSanityReviews';
import { sanityClient } from '@/lib/sanity/client';

jest.mock('@/lib/sanity/client', () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
  listenSafe: (query: string) => ({
    subscribe: (cb: any) => ({
      unsubscribe: () => {},
    }),
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

function TestComponent({ productId }: { productId: string }) {
  const { reviews, rating, loading } = useSanityReviews(productId);
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="count">{reviews.length}</div>
      <div data-testid="avg">{rating?.averageRating ?? '0'}</div>
    </div>
  );
}

describe('useSanityReviews', () => {
  test('fetches reviews and cleans up subscription without throwing', async () => {
    // Mock fetch to return empty lists
    (sanityClient.fetch as jest.Mock).mockResolvedValue({ reviews: [], stats: [] });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = render(<TestComponent productId="p1" />);

    // Wait a tick for effects
    await Promise.resolve();

    // Unmount to trigger cleanup
    unmount();

    // No console.error should have been called during mount/unmount
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});