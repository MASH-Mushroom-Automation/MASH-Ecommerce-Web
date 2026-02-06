import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText(/Location not shared/i)).toBeInTheDocument();

    const calcom = screen.getByTestId('calcom-btn') as HTMLAnchorElement;
    expect(calcom.href).toContain('https://cal.com/noloc');

    // Should show default CTA label when calcomButtonText not set
    expect(calcom).toHaveTextContent('Book Appointment');

    expect(screen.getByTestId('contact-chat-btn')).toBeInTheDocument();

    // Placeholder text should indicate contact is needed
    expect(screen.getByText(/Contact the seller for pickup location or delivery options/i)).toBeInTheDocument();
  });

  test('uses custom calcomButtonText when provided', () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'fake-key';

    const grower = {
      name: 'Label Farm',
      rating: 4.7,
      location: '1 Label Rd, Town',
      calcomUsername: 'labelfarm',
      defaultEventSlug: '30min',
      contactEmail: 'label@farm.com',
      calcomButtonText: 'Book a Session with Us',
    };

    render(<GrowerCard grower={grower} productName="Blue Oyster" />);

    const calcom = screen.getByTestId('calcom-btn') as HTMLAnchorElement;
    expect(calcom).toBeInTheDocument();
    expect(calcom).toHaveTextContent('Book a Session with Us');
  });

  test('uses provided googleMapsEmbedUrl when available', () => {
    const embedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.4999720683213!2d121.00202618539326!3d14.740839036932998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1';

    const grower = {
      name: 'Embed Farm',
      rating: 4.9,
      location: 'Embed Place',
      googleMapsEmbedUrl: embedUrl,
      contactEmail: 'embed@farm.com',
    } as any;

    render(<GrowerCard grower={grower} productName="Blue Oyster" />);

    const iframe = screen.getByTestId('grower-map') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute('src')).toBe(embedUrl);
  });

  test('resolves maps.app short URL via server API and uses resolved embed', async () => {
    const shortUrl = 'https://maps.app.goo.gl/24sJHcTm4r4wVvG5A';
    const resolved = 'https://www.google.com/maps/embed?pb=!1m18!resolved';

    // Ensure API key fallback is disabled so component uses the resolved embed
    const originalKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = '';

    (global as any).fetch = jest.fn(async (input: any, opts: any) => {
      // Respond to our resolve API
      if (typeof input === 'string' && input.endsWith('/api/maps/resolve')) {
        return { ok: true, json: async () => ({ embedUrl: resolved }) } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    });


    const grower = {
      name: 'Short Link Farm',
      rating: 4.0,
      location: 'Short Link Place',
      googleMapsEmbedUrl: shortUrl,
      contactEmail: 'short@farm.com',
    } as any;

    render(<GrowerCard grower={grower} productName="Blue Oyster" />);

    const iframe = await screen.findByTestId('grower-map');
    expect(iframe).toBeInTheDocument();
    expect((iframe as HTMLIFrameElement).getAttribute('src')).toBe(resolved);

    // Restore env
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalKey;
  });

  test('uses latitude/longitude fallback embed when provided and no API key', async () => {
    const originalKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = '';

    const lat = 14.7583;
    const lng = 121.0453;

    const grower = {
      name: 'Coords Farm',
      rating: 4.1,
      location: 'Caloocan City, Metro Manila',
      latitude: lat,
      longitude: lng,
      contactEmail: 'coords@farm.com',
    } as any;

    render(<GrowerCard grower={grower} />);

    const iframe = await screen.findByTestId('grower-map');
    expect(iframe).toBeInTheDocument();
    const src = (iframe as HTMLIFrameElement).getAttribute('src') || '';
    expect(src).toContain('https://www.google.com/maps?q=' + encodeURIComponent(`${lat},${lng}`));

    // restore env
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalKey;
  });

  test('prefers provided pb-style embed when available', () => {
    const embedUrl = 'https://www.google.com/maps/embed?pb=!1m18!example_pb_string';
    const grower = {
      name: 'PB Farm',
      rating: 4.6,
      location: 'PB Place',
      googleMapsEmbedUrl: embedUrl,
      contactEmail: 'pb@farm.com',
    } as any;

    render(<GrowerCard grower={grower} />);
    const iframe = screen.getByTestId('grower-map') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.getAttribute('src')).toBe(embedUrl);
    expect(iframe.getAttribute('loading')).toBe('lazy');
    expect(iframe.getAttribute('referrerpolicy')).toBe('no-referrer-when-downgrade');
  });

  test('resolver returns null then falls back to coords when available', async () => {
    const originalKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    // Ensure API key is not present so coords fallback is used
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = '';

    const shortUrl = 'https://maps.app.goo.gl/whatever';

    // Mock fetch to first call the resolver and return embedUrl: null
    (global as any).fetch = jest.fn(async (input: any, opts: any) => {
      if (typeof input === 'string' && input.endsWith('/api/maps/resolve')) {
        return { ok: true, json: async () => ({ embedUrl: null }) } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    });

    const grower = {
      name: 'Resolver Fallback Farm',
      rating: 4.2,
      location: 'Resolver Town',
      googleMapsEmbedUrl: shortUrl,
      latitude: 14.7583,
      longitude: 121.0453,
      contactEmail: 'rf@farm.com',
    } as any;

    render(<GrowerCard grower={grower} />);

    const iframe = await screen.findByTestId('grower-map');
    expect(iframe).toBeInTheDocument();
    const src = (iframe as HTMLIFrameElement).getAttribute('src') || '';
    expect(src).toContain('https://www.google.com/maps?q=' + encodeURIComponent('14.7583,121.0453'));

    // restore env
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalKey;
  });

  test('resolver returns a /maps/embed url and it is used', async () => {
    const shortUrl = 'https://maps.app.goo.gl/short';
    const resolved = 'https://www.google.com/maps/embed?pb=!1m18!resolved_pb';

    (global as any).fetch = jest.fn(async (input: any, opts: any) => {
      if (typeof input === 'string' && input.endsWith('/api/maps/resolve')) {
        return { ok: true, json: async () => ({ embedUrl: resolved }) } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    });

    const grower = {
      name: 'Resolved Farm',
      rating: 4.3,
      location: 'Resolved Town',
      googleMapsEmbedUrl: shortUrl,
      contactEmail: 'resolved@farm.com',
    } as any;

    render(<GrowerCard grower={grower} />);

    const iframe = await screen.findByTestId('grower-map');
    expect(iframe).toBeInTheDocument();
    expect((iframe as HTMLIFrameElement).getAttribute('src')).toBe(resolved);
  });

  test('when no embed and no API key and no coords shows View on Google Maps link', () => {
    const originalKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = '';

    const grower = {
      name: 'No Map Farm',
      rating: 3.9,
      location: 'Unknown Place',
      contactEmail: 'nomap@farm.com',
    } as any;

    render(<GrowerCard grower={grower} />);

    const link = screen.getByTestId('grower-map-link') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href).toContain('https://www.google.com/maps/search/?api=1&query=');

    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalKey;
  });

  test('expands map in a modal when clicking the view larger map button', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'fake-key';

    const grower = {
      name: 'Modal Farm',
      rating: 4.5,
      location: 'Modal Place',
      contactEmail: 'modal@farm.com',
    } as any;

    render(<GrowerCard grower={grower} productName="Test Product" />);

    const expandBtn = await screen.findByTestId('grower-map-expand');
    expect(expandBtn).toBeInTheDocument();

    // Click to open modal
    fireEvent.click(expandBtn);

    const modal = await screen.findByTestId('grower-map-modal');
    expect(modal).toBeInTheDocument();

    const smallIframe = screen.getByTestId('grower-map') as HTMLIFrameElement;
    const largeIframe = screen.getByTestId('grower-map-large') as HTMLIFrameElement;

    expect(largeIframe.getAttribute('src')).toBe(smallIframe.getAttribute('src'));

    // Close modal using close button
    const closeBtn = modal.querySelector('button[aria-label="Close map"]') as HTMLButtonElement;
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('grower-map-modal')).toBeNull();
  });

  test('closes modal on Escape key and restores focus', async () => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'fake-key';

    const grower = {
      name: 'Escape Farm',
      rating: 4.2,
      location: 'Escape Place',
      contactEmail: 'escape@farm.com',
    } as any;

    render(<GrowerCard grower={grower} productName="Test Product" />);

    const expandBtn = await screen.findByTestId('grower-map-expand');
    fireEvent.click(expandBtn);

    const modal = await screen.findByTestId('grower-map-modal');
    expect(modal).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByTestId('grower-map-modal')).toBeNull();

    // Focus should be restored to the expand button
    expect(document.activeElement).toBe(expandBtn);
  });
});
