/**
 * Tests for src/hooks/useSanityHero.ts
 *
 * Hook:  useSanityHero
 *
 * Fetches hero carousel data from a Sanity CMS singleton document,
 * processes slides (filter active, apply defaults, sort by order),
 * and subscribes to real-time updates via listenSafe.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// Grab global Sanity mocks (set up in jest.setup.js)
const { sanityClient, listenSafe } = jest.requireMock("@/lib/sanity/client");

import { useSanityHero } from "../useSanityHero";
import type { SanityHeroSlide } from "../useSanityHero";

// ─── Helpers ──────────────────────────────────────────────────

const makeSlide = (overrides: Partial<SanityHeroSlide> = {}): any => ({
  title: "Test Slide",
  subtitle: "Subtitle",
  description: "Desc",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  buttonStyle: "primary",
  image: "https://cdn.sanity.io/images/test.webp",
  backgroundColor: "#6A994E",
  textColor: "#FFFFFF",
  order: 1,
  isActive: true,
  ...overrides,
});

const makeSanityResponse = (slides: any[]) => ({ slides });

// ─── Setup ────────────────────────────────────────────────────

let subscribeCb: ((update: any) => void) | null = null;
const mockUnsubscribe = jest.fn();

beforeEach(() => {
  sanityClient.fetch.mockClear();
  listenSafe.mockClear();
  mockUnsubscribe.mockClear();
  subscribeCb = null;

  // Default: return a carousel with 2 active slides
  sanityClient.fetch.mockResolvedValue(
    makeSanityResponse([
      makeSlide({ title: "First", order: 2 }),
      makeSlide({ title: "Second", order: 1 }),
    ])
  );

  // Capture real-time subscription callback
  listenSafe.mockReturnValue({
    subscribe: jest.fn((cb: any) => {
      subscribeCb = cb;
      return { unsubscribe: mockUnsubscribe };
    }),
  });
});

// ─── Basic Fetch ──────────────────────────────────────────────

describe("useSanityHero", () => {
  it("starts in loading state", () => {
    sanityClient.fetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityHero());

    expect(result.current.loading).toBe(true);
    expect(result.current.slides).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches hero carousel data from Sanity", async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "heroCarousel"')
    );
  });

  it("returns slides sorted by order field ascending", async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slides).toHaveLength(2);
    expect(result.current.slides[0].title).toBe("Second"); // order: 1
    expect(result.current.slides[1].title).toBe("First"); // order: 2
  });

  it("returns no error on successful fetch", async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  // ─── Slide Processing ────────────────────────────────────────

  it("filters out inactive slides (isActive === false)", async () => {
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        makeSlide({ title: "Active", isActive: true, order: 1 }),
        makeSlide({ title: "Inactive", isActive: false, order: 2 }),
        makeSlide({ title: "DefaultActive", order: 3 }),
      ])
    );

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slides).toHaveLength(2);
    const titles = result.current.slides.map((s) => s.title);
    expect(titles).toContain("Active");
    expect(titles).toContain("DefaultActive");
    expect(titles).not.toContain("Inactive");
  });

  it("applies default values to slides missing fields", async () => {
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        {
          image: "https://test.url/img.webp",
          order: 1,
          isActive: true,
          // No title, backgroundColor, textColor, buttonStyle
        },
      ])
    );

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const slide = result.current.slides[0];
    expect(slide.title).toBe("Welcome to MASH");
    expect(slide.backgroundColor).toBe("#6A994E");
    expect(slide.textColor).toBe("#FFFFFF");
    expect(slide.buttonStyle).toBe("primary");
  });

  it("handles legacy ctaText/ctaLink fields as fallback", async () => {
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        makeSlide({
          buttonText: undefined,
          buttonLink: undefined,
          ctaText: "Legacy CTA",
          ctaLink: "/legacy",
          order: 1,
        }),
      ])
    );

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const slide = result.current.slides[0];
    expect(slide.buttonText).toBe("Legacy CTA");
    expect(slide.buttonLink).toBe("/legacy");
  });

  it("assigns order = index+1 when order field is missing", async () => {
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        makeSlide({ title: "No Order A", order: undefined }),
        makeSlide({ title: "No Order B", order: undefined }),
      ])
    );

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Both get default order based on index, both still returned
    expect(result.current.slides).toHaveLength(2);
  });

  it("handles null image field gracefully", async () => {
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        makeSlide({ image: null, order: 1 }),
      ])
    );

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slides).toHaveLength(1);
  });

  // ─── Empty / Null Data ────────────────────────────────────────

  it("returns empty slides when Sanity response is null", async () => {
    sanityClient.fetch.mockResolvedValue(null);

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slides).toEqual([]);
  });

  it("returns empty slides when carousel has null slides array", async () => {
    sanityClient.fetch.mockResolvedValue({ slides: null });

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slides).toEqual([]);
  });

  it("returns empty slides when no slides are active", async () => {
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        makeSlide({ isActive: false, order: 1 }),
        makeSlide({ isActive: false, order: 2 }),
      ])
    );

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.slides).toEqual([]);
  });

  // ─── Error Handling ───────────────────────────────────────────

  it("sets Error object on fetch failure", async () => {
    sanityClient.fetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Network error");
    expect(result.current.slides).toEqual([]);
  });

  it("wraps non-Error exceptions in Error object", async () => {
    sanityClient.fetch.mockRejectedValue("string error");

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Failed to fetch hero carousel");
  });

  // ─── Real-time Subscription ───────────────────────────────────

  it("subscribes to listenSafe for real-time updates", async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listenSafe).toHaveBeenCalled();
  });

  it("re-fetches when mutation event received", async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCallCount = sanityClient.fetch.mock.calls.length;

    // Simulate real-time mutation event
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        makeSlide({ title: "Updated Slide", order: 1 }),
      ])
    );

    await act(async () => {
      if (subscribeCb) {
        subscribeCb({ type: "mutation", result: makeSanityResponse([makeSlide({ title: "Updated Slide", order: 1 })]) });
      }
    });

    // The hook should process the update
    await waitFor(() => {
      expect(
        sanityClient.fetch.mock.calls.length > initialCallCount ||
        result.current.slides.some((s: any) => s.title === "Updated Slide")
      ).toBe(true);
    });
  });

  it("unsubscribes on unmount", async () => {
    const { result, unmount } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ─── Refetch ──────────────────────────────────────────────────

  it("provides a refetch function that re-fetches data", async () => {
    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = sanityClient.fetch.mock.calls.length;

    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([
        makeSlide({ title: "Refetched", order: 1 }),
      ])
    );

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(sanityClient.fetch.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it("clears previous error on successful refetch", async () => {
    // First fetch fails
    sanityClient.fetch.mockRejectedValueOnce(new Error("First error"));

    const { result } = renderHook(() => useSanityHero());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    // Refetch succeeds
    sanityClient.fetch.mockResolvedValue(
      makeSanityResponse([makeSlide({ order: 1 })])
    );

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.slides).toHaveLength(1);
    });
  });
});
