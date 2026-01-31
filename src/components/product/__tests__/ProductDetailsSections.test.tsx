import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetailsSections from '../ProductDetailsSections';

describe('ProductDetailsSections', () => {
  test('renders only the Grower/Seller section for simplified UX', () => {
    const product = {
      name: 'Test Shroom',
      grower: { name: 'Test Farm', rating: 4.6, location: 'Farm Road', contactEmail: 'hi@test', calcomUsername: 'testfarm' },
    };

    render(<ProductDetailsSections product={product} />);

    expect(screen.getByText(/From the Seller/i)).toBeInTheDocument();
    expect(screen.getByTestId('grower-card')).toBeInTheDocument();
  });
});
