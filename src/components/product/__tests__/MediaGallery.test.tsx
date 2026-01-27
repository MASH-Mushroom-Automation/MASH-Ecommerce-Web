import React from 'react';
import { render, screen } from '@testing-library/react';
import MediaGallery from '../MediaGallery';

describe('MediaGallery', () => {
  test('shows placeholder when no media provided', () => {
    render(<MediaGallery items={[]} />);
    expect(screen.getByTestId('media-placeholder')).toBeInTheDocument();
  });

  test('renders gallery when items exist', () => {
    const items = [
      { type: 'image', url: '/test.jpg', alt: 'Test' },
    ];
    render(<MediaGallery items={items} productName="Test Product" />);
    expect(screen.getByTestId('media-gallery')).toBeInTheDocument();
  });
});
