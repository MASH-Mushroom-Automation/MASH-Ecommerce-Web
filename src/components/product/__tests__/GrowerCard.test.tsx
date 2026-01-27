import React from 'react';
import { render, screen } from '@testing-library/react';
import GrowerCard from '../GrowerCard';

describe('GrowerCard', () => {
  test('renders grower info and actions (calcom + quick chat + maps)', () => {
    // Provide a fake API key to trigger embedded map behavior
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'fake-key';

    const grower = {
      name: 'Test Farm',
      rating: 4.8,
      location: '123 Farm Rd, Town',
      calcomUsername: 'testfarm',
      defaultEventSlug: '30min',
      contactEmail: 'hello@testfarm.com',
    };

    render(<GrowerCard grower={grower} productName="Blue Oyster" />);

    expect(screen.getByText('Test Farm')).toBeInTheDocument();
    expect(screen.getByText(/4.8/)).toBeInTheDocument();

    // Cal.com button should be an external link to cal.com
    const calcom = screen.getByTestId('calcom-btn') as HTMLAnchorElement;
    expect(calcom).toBeInTheDocument();
    expect(calcom.getAttribute('href')).toContain('https://cal.com/testfarm/30min');

    expect(screen.getByTestId('contact-chat-btn')).toBeInTheDocument();

    // Map iframe should be present when API key provided
    expect(screen.getByTestId('grower-map')).toBeInTheDocument();
  });

  test('falls back to mailto link when calcom missing', () => {
    const grower = { name: 'No Cal', rating: 3.9, contactEmail: 'no@cal.com' };
    render(<GrowerCard grower={grower} />);
    expect(screen.getByTestId('mailto-link')).toBeInTheDocument();
  });

  test('shows empty location state and contact options when location missing', () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'fake-key';

    const grower = {
      name: 'No Location Farm',
      rating: 4.2,
      calcomUsername: 'noloc',
      contactEmail: 'hello@noloc.com',
      // location intentionally omitted
    };

    render(<GrowerCard grower={grower} productName="Blue Oyster" />);

    expect(screen.getByTestId('grower-location-empty')).toBeInTheDocument();
    expect(screen.getByText(/Location not provided/i)).toBeInTheDocument();

    const calcom = screen.getByTestId('calcom-btn-empty') as HTMLAnchorElement;
    expect(calcom.href).toContain('https://cal.com/noloc');

    // Should show default CTA label when calcomButtonText not set
    expect(calcom).toHaveTextContent('Schedule with Grower');

    expect(screen.getByTestId('contact-chat-btn-empty')).toBeInTheDocument();
  });
});
