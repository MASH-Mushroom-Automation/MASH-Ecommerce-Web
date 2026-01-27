import React from 'react';
import { render, screen } from '@testing-library/react';
import GrowerCard from '../GrowerCard';

describe('GrowerCard', () => {
  test('renders grower info and actions (calcom + quick chat + maps)', () => {
    const grower = {
      name: 'Test Farm',
      rating: 4.8,
      location: '123 Farm Rd, Town',
      calcomUsername: 'testfarm',
      contactEmail: 'hello@testfarm.com',
    };

    render(<GrowerCard grower={grower} productName="Blue Oyster" />);

    expect(screen.getByText('Test Farm')).toBeInTheDocument();
    expect(screen.getByText(/4.8/)).toBeInTheDocument();
    expect(screen.getByTestId('calcom-btn')).toBeInTheDocument();
    expect(screen.getByTestId('contact-chat-btn')).toBeInTheDocument();
    expect(screen.getByText(/View on Google Maps/i)).toBeInTheDocument();
  });

  test('falls back to mailto link when calcom missing', () => {
    const grower = { name: 'No Cal', rating: 3.9, contactEmail: 'no@cal.com' };
    render(<GrowerCard grower={grower} />);
    expect(screen.getByTestId('mailto-link')).toBeInTheDocument();
  });
});
