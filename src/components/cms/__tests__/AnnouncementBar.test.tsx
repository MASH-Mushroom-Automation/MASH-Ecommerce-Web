/**
 * Tests for AnnouncementBar and AnnouncementBarStatic
 * Covers: CMS fetch, dismiss logic, loading states, link rendering, custom colors
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock Sanity client
const mockFetch = jest.fn();
jest.mock('@/lib/sanity/client', () => ({
  sanityClient: { fetch: (...args: any[]) => mockFetch(...args) },
}));

// Mock sessionStorage
const sessionStore: Record<string, string> = {};
const mockSessionStorage = {
  getItem: jest.fn((key: string) => sessionStore[key] || null),
  setItem: jest.fn((key: string, val: string) => { sessionStore[key] = val; }),
  removeItem: jest.fn((key: string) => { delete sessionStore[key]; }),
  clear: jest.fn(() => { Object.keys(sessionStore).forEach(k => delete sessionStore[k]); }),
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

import { AnnouncementBar, AnnouncementBarStatic } from '../AnnouncementBar';

beforeEach(() => {
  jest.clearAllMocks();
  mockSessionStorage.clear();
  Object.keys(sessionStore).forEach(k => delete sessionStore[k]);
});

describe('AnnouncementBar', () => {
  it('should return null during loading', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<AnnouncementBar />);
    expect(container.innerHTML).toBe('');
  });

  it('should render announcement when CMS returns enabled data', async () => {
    mockFetch.mockResolvedValue({
      enabled: true,
      message: 'Free shipping today!',
      link: '/shop',
      linkText: 'Shop Now',
    });

    render(<AnnouncementBar />);

    await waitFor(() => {
      expect(screen.getByText('Free shipping today!')).toBeInTheDocument();
    });
    expect(screen.getByText(/Shop Now/)).toBeInTheDocument();
  });

  it('should return null when CMS returns enabled: false', async () => {
    mockFetch.mockResolvedValue({ enabled: false, message: 'Hidden' });

    const { container } = render(<AnnouncementBar />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    // Wait for state to settle
    await act(async () => {});
    expect(container.querySelector('[role="banner"]')).toBeNull();
  });

  it('should return null when CMS returns null', async () => {
    mockFetch.mockResolvedValue(null);

    const { container } = render(<AnnouncementBar />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    await act(async () => {});
    expect(container.querySelector('[role="banner"]')).toBeNull();
  });

  it('should return null when CMS fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { container } = render(<AnnouncementBar />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    await act(async () => {});
    expect(container.querySelector('[role="banner"]')).toBeNull();
  });

  it('should return null if already dismissed in sessionStorage', async () => {
    sessionStore['mash-announcement-dismissed'] = 'true';

    const { container } = render(<AnnouncementBar />);
    await act(async () => {});
    expect(container.querySelector('[role="banner"]')).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should dismiss on button click and save to sessionStorage', async () => {
    mockFetch.mockResolvedValue({
      enabled: true,
      message: 'Sale ends soon!',
    });

    const { container } = render(<AnnouncementBar />);
    await waitFor(() => {
      expect(screen.getByText('Sale ends soon!')).toBeInTheDocument();
    });

    const dismissBtn = screen.getByLabelText('Dismiss announcement');
    fireEvent.click(dismissBtn);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith('mash-announcement-dismissed', 'true');
    expect(container.querySelector('[role="banner"]')).toBeNull();
  });

  it('should use custom colors from CMS', async () => {
    mockFetch.mockResolvedValue({
      enabled: true,
      message: 'Custom color banner',
      backgroundColor: '#FF0000',
      textColor: '#00FF00',
    });

    render(<AnnouncementBar />);
    await waitFor(() => {
      expect(screen.getByText('Custom color banner')).toBeInTheDocument();
    });

    const banner = screen.getByRole('banner');
    expect(banner.style.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(banner.style.color).toBe('rgb(0, 255, 0)');
  });

  it('should use default colors when CMS does not provide them', async () => {
    mockFetch.mockResolvedValue({
      enabled: true,
      message: 'Default colors',
    });

    render(<AnnouncementBar />);
    await waitFor(() => {
      expect(screen.getByText('Default colors')).toBeInTheDocument();
    });

    const banner = screen.getByRole('banner');
    expect(banner.style.backgroundColor).toBe('rgb(30, 57, 42)');
    expect(banner.style.color).toBe('rgb(255, 255, 255)');
  });

  it('should not render link when link or linkText is missing', async () => {
    mockFetch.mockResolvedValue({
      enabled: true,
      message: 'No link banner',
      link: '/shop',
      // linkText intentionally missing
    });

    render(<AnnouncementBar />);
    await waitFor(() => {
      expect(screen.getByText('No link banner')).toBeInTheDocument();
    });

    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('AnnouncementBarStatic', () => {
  it('should render with default props', () => {
    render(<AnnouncementBarStatic />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText(/FREE SHIPPING/)).toBeInTheDocument();
    expect(screen.getByText(/Shop Now/)).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<AnnouncementBarStatic message="Custom message" />);
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('should dismiss on click', () => {
    const { container } = render(<AnnouncementBarStatic />);
    const dismissBtn = screen.getByLabelText('Dismiss announcement');
    fireEvent.click(dismissBtn);
    expect(container.querySelector('[role="banner"]')).toBeNull();
  });

  it('should start dismissed if session says so', () => {
    sessionStore['mash-announcement-dismissed'] = 'true';
    const { container } = render(<AnnouncementBarStatic />);
    expect(container.querySelector('[role="banner"]')).toBeNull();
  });

  it('should not render link when link or linkText props are missing', () => {
    render(<AnnouncementBarStatic link="" linkText="" message="No link" />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('should apply custom background and text color', () => {
    render(<AnnouncementBarStatic backgroundColor="#0000FF" textColor="#FFFF00" />);
    const banner = screen.getByRole('banner');
    expect(banner.style.backgroundColor).toBe('rgb(0, 0, 255)');
    expect(banner.style.color).toBe('rgb(255, 255, 0)');
  });
});
