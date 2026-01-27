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
      image: 'https://via.placeholder.com/80',
    };

    render(<GrowerCard grower={grower} productName="Blue Oyster" />);

    // Avatar should be shown when image present
    const avatar = screen.getByAltText('Seller: Test Farm') as HTMLImageElement;
    expect(avatar).toBeInTheDocument();
    expect(avatar.src).toContain('https://via.placeholder.com/80');

    expect(screen.getByText(/4.8/)).toBeInTheDocument();

    // Cal.com button should be an external link to cal.com
    const calcom = screen.getByTestId('calcom-btn') as HTMLAnchorElement;
    expect(calcom).toBeInTheDocument();
    expect(calcom.getAttribute('href')).toContain('https://cal.com/testfarm/30min');

    expect(screen.getByTestId('contact-chat-btn')).toBeInTheDocument();

    // Map iframe should be present when API key provided
    const mapIframe = screen.getByTestId('grower-map') as HTMLIFrameElement;
    expect(mapIframe).toBeInTheDocument();
    // src should include Google Maps embed endpoint with provided key and location
    expect(mapIframe.getAttribute('src')).toContain('https://www.google.com/maps/embed/v1/place');
    expect(mapIframe.getAttribute('src')).toContain('key=fake-key');
    expect(mapIframe.getAttribute('src')).toContain(encodeURIComponent(grower.location));
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

    // Placeholder map block should be visible when location is missing
    const placeholder = screen.getByTestId('grower-map-placeholder');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent(/No map available/i);
  });
});
