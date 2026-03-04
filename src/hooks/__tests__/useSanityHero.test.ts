import { renderHook, act, waitFor } from '@testing-library/react';

const mockFetch = jest.fn();
const mockSubscribe = jest.fn();
const mockListenSafe = jest.fn(() => ({ subscribe: mockSubscribe }));

jest.mock('@/lib/sanity/client', () => ({
  sanityClient: { fetch: (...args: any[]) => mockFetch(...args) },
  listenSafe: (...args: any[]) => mockListenSafe(...args),
}));

import { useSanityHero } from '../useSanityHero';

const makeSlide = (overrides: Record<string, any> = {}) => ({
  title: 'Test Slide',
  subtitle: 'Sub',
  description: 'Desc',
  buttonText: 'Shop Now',
  buttonLink: '/shop',
  ctaText: null,
  ctaLink: null,
  buttonStyle: 'primary',
  image: 'https://cdn.sanity.io/img.jpg',
  backgroundColor: '#6A994E',
  textColor: '#FFFFFF',
  order: 1,
  isActive: true,
  ...overrides,
});

describe('useSanityHero', () => {
  let subscriberCallback: ((update: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    subscriberCallback = null;
    mockSubscribe.mockImplementation((cb: any) => {
      subscriberCallback = cb;
      return { unsubscribe: jest.fn() };
    });
    mockFetch.mockResolvedValue({ slides: [makeSlide()] });
  });

  it('fetches slides on mount', async () => {
    const { result } = renderHook(() => useSanityHero());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides).toHaveLength(1);
    expect(result.current.slides[0].title).toBe('Test Slide');
    expect(result.current.error).toBeNull();
  });

  it('returns empty slides when data is null', async () => {
    mockFetch.mockResolvedValue(null);
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides).toEqual([]);
  });

  it('returns empty slides when data.slides is null', async () => {
    mockFetch.mockResolvedValue({ slides: null });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides).toEqual([]);
  });

  it('filters out inactive slides (isActive=false)', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ isActive: false }), makeSlide({ isActive: true, order: 2 })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides).toHaveLength(1);
  });

  it('treats null isActive as active', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ isActive: null })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides).toHaveLength(1);
  });

  it('fills in default title when missing', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ title: null })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].title).toBe('Welcome to MASH');
  });

  it('fills subtitle from description when subtitle is missing', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ subtitle: null, description: 'Fallback desc' })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].subtitle).toBe('Fallback desc');
  });

  it('falls back from buttonText to ctaText', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ buttonText: null, ctaText: 'CTA Button' })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].buttonText).toBe('CTA Button');
  });

  it('falls back from buttonLink to ctaLink', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ buttonLink: null, ctaLink: '/cta-path' })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].buttonLink).toBe('/cta-path');
  });

  it('defaults buttonStyle to primary', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ buttonStyle: null })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].buttonStyle).toBe('primary');
  });

  it('sets image to undefined when not a string', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ image: 123 })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].image).toBeUndefined();
  });

  it('keeps image when it is a string', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ image: 'https://img.jpg' })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].image).toBe('https://img.jpg');
  });

  it('defaults backgroundColor and textColor', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ backgroundColor: null, textColor: null })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].backgroundColor).toBe('#6A994E');
    expect(result.current.slides[0].textColor).toBe('#FFFFFF');
  });

  it('uses index+1 if order is missing', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ order: 0 })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides[0].order).toBe(1);
  });

  it('sorts slides by order', async () => {
    mockFetch.mockResolvedValue({ slides: [makeSlide({ order: 3, title: 'C' }), makeSlide({ order: 1, title: 'A' }), makeSlide({ order: 2, title: 'B' })] });
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.slides.map(s => s.title)).toEqual(['A', 'B', 'C']);
  });

  it('sets error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network fail'));
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe('Network fail');
    expect(result.current.slides).toEqual([]);
  });

  it('wraps non-Error thrown values', async () => {
    mockFetch.mockRejectedValue('string error');
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe('Failed to fetch hero carousel');
  });

  it('provides refetch function', async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe('function');
    mockFetch.mockResolvedValueOnce({ slides: [makeSlide({ title: 'Refreshed' })] });
    await act(async () => { result.current.refetch(); });
    await waitFor(() => expect(result.current.slides[0].title).toBe('Refreshed'));
  });

  it('sets up real-time listener', async () => {
    renderHook(() => useSanityHero());
    await waitFor(() => expect(mockListenSafe).toHaveBeenCalled());
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('processes mutation events from listener', async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      subscriberCallback?.({ type: 'mutation', result: { slides: [makeSlide({ title: 'Live Update' })] } });
    });
    expect(result.current.slides[0].title).toBe('Live Update');
  });

  it('ignores non-mutation events from listener', async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      subscriberCallback?.({ type: 'welcome' });
    });
    expect(result.current.slides[0].title).toBe('Test Slide');
  });

  it('ignores mutation events without result', async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      subscriberCallback?.({ type: 'mutation' });
    });
    expect(result.current.slides[0].title).toBe('Test Slide');
  });
});
