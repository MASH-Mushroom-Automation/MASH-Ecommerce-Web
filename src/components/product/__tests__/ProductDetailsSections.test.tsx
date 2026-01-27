import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetailsSections from '../ProductDetailsSections';

describe('ProductDetailsSections', () => {
  test('renders Freshness, Cooking Guide, Delivery and Grower sections', () => {
    const product = {
      name: 'Test Shroom',
      freshnessInfo: { harvestWindow: '48 hours', shelfLife: '3 days' },
      preparationInfo: { cookingTime: '15 min', preparationTips: ['Tip 1', 'Tip 2'] },
      deliveryOptions: { sameDayDeliveryEligible: true, perishable: true },
      grower: { name: 'Test Farm', rating: 4.6, location: 'Farm Road', contactEmail: 'hi@test' },
    };

    render(<ProductDetailsSections product={product} />);

    expect(screen.getByText(/Freshness & Quality/i)).toBeInTheDocument();
    expect(screen.getByText(/Cooking Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivery Options/i)).toBeInTheDocument();
    expect(screen.getByText(/From the Grower/i)).toBeInTheDocument();
  });
});
