/**
 * Tests for src/hooks/useSanityFeatures.ts
 *
 * Hooks:    useSanityFeatures, useSanityFeatureSection
 * Server:   getFeatureSections
 *
 * All use sanityClient.fetch (globally mocked).
 * useSanityFeatures uses an in-memory cache (featureCache Map).
 * Real-time subscriptions are commented out in source, so we only test fetch.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

const mockSanityFetch = jest.requireMock("@/lib/sanity/client").sanityClient
  .fetch as jest.Mock;

import {
  useSanityFeatures,
  useSanityFeatureSection,
  getFeatureSections,
} from "../useSanityFeatures";

// ─── Helpers ──────────────────────────────────────────────────

const makeSection = (id: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  _id: id,
  _createdAt: "2025-01-01T00:00:00Z",
  _updatedAt: "2025-06-01T00:00:00Z",
  title: `Section ${id}`,
  slug: { current: `section-${id}` },
  subtitle: `Subtitle for ${id}`,
  features: [
    {
      icon: "Leaf",
      headline: "Feature A",
      subheadline: "Sub A",
      link: "/feature-a",
      isActive: true,
      displayOrder: 0,
    },
    {
      icon: "Shield",
      headline: "Feature B",
      subheadline: "Sub B",
      link: null,
      isActive: false,
      displayOrder: 1,
    },
  ],
  backgroundColor: "muted",
  columns: 3,
  showOnHomepage: true,
  displayOrder: 1,
  isActive: true,
  ...overrides,
});

// The source module uses a featureCache Map with a 5-minute TTL.
// We advance Date.now between tests so cached data is always expired.
let fakeNow = Date.now();
beforeEach(() => {
  mockSanityFetch.mockClear();
  fakeNow += 10 * 60 * 1000; // advance by 10 minutes to expire cache
  jest.spyOn(Date, "now").mockReturnValue(fakeNow);
});

afterEach(() => {
  (Date.now as jest.Mock).mockRestore();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityFeatures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityFeatures", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityFeatures());
    expect(result.current.loading).toBe(true);
    expect(result.current.features).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches and transforms feature sections", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeSection("s1")]);

    const { result } = renderHook(() => useSanityFeatures());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.features).toHaveLength(1);
    const section = result.current.features[0];
    expect(section.id).toBe("s1");
    expect(section.title).toBe("Section s1");
    expect(section.subtitle).toBe("Subtitle for s1");
    expect(section.backgroundColor).toBe("muted");
    expect(section.columns).toBe(3);
    expect(section.showOnHomepage).toBe(true);
    expect(section.isActive).toBe(true);
    expect(section.features).toHaveLength(2);
    expect(section.features[0].icon).toBe("Leaf");
    expect(section.features[0].headline).toBe("Feature A");
    expect(section.features[1].isActive).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("defaults homepageOnly to true", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityFeatures());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("showOnHomepage == true");
  });

  it("fetches all sections when homepageOnly is false", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityFeatures({ homepageOnly: false }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).not.toContain("showOnHomepage == true");
  });

  it("handles default values for missing fields", async () => {
    const sparse = {
      _id: "sparse",
      _createdAt: "2025-01-01T00:00:00Z",
      _updatedAt: "2025-06-01T00:00:00Z",
      title: "Sparse",
      slug: { current: "sparse" },
      subtitle: null,
      features: null,
      backgroundColor: null,
      columns: null,
      showOnHomepage: null,
      displayOrder: null,
      isActive: null,
    };
    mockSanityFetch.mockResolvedValueOnce([sparse]);

    const { result } = renderHook(() => useSanityFeatures());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const section = result.current.features[0];
    expect(section.subtitle).toBe("");
    expect(section.features).toEqual([]);
    expect(section.backgroundColor).toBe("light");
    expect(section.columns).toBe(3);
    expect(section.showOnHomepage).toBe(true);
    expect(section.displayOrder).toBe(0);
    expect(section.isActive).toBe(true);
  });

  it("handles feature items with missing icon/displayOrder", async () => {
    const section = makeSection("s1", {
      features: [
        { icon: null, headline: "H", subheadline: "S", isActive: null, displayOrder: null },
      ],
    });
    mockSanityFetch.mockResolvedValueOnce([section]);

    const { result } = renderHook(() => useSanityFeatures());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const feat = result.current.features[0].features[0];
    expect(feat.icon).toBe("Leaf"); // default
    expect(feat.isActive).toBe(true); // default
    expect(feat.displayOrder).toBe(0); // fallback to index
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Quota exceeded"));

    const { result } = renderHook(() => useSanityFeatures());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Quota exceeded");
    expect(result.current.features).toEqual([]);
  });

  it("refetch clears cache and re-fetches", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeSection("s1")]);

    const { result } = renderHook(() => useSanityFeatures());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockSanityFetch.mockResolvedValueOnce([makeSection("s1"), makeSection("s2")]);
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.features).toHaveLength(2));
  });

  it("returns empty array for no sections", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityFeatures());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.features).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityFeatureSection (single)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityFeatureSection", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityFeatureSection("why-mash"));
    expect(result.current.loading).toBe(true);
    expect(result.current.feature).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches a single feature section by slug", async () => {
    mockSanityFetch.mockResolvedValueOnce(makeSection("s1"));

    const { result } = renderHook(() => useSanityFeatureSection("section-s1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feature).not.toBeNull();
    expect(result.current.feature!.id).toBe("s1");
    expect(result.current.feature!.title).toBe("Section s1");
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.stringContaining("slug.current == $slug"),
      { slug: "section-s1" }
    );
  });

  it("returns null when section not found", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityFeatureSection("nonexistent"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.feature).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles empty slug", async () => {
    const { result } = renderHook(() => useSanityFeatureSection(""));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.feature).toBeNull();
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useSanityFeatureSection("slug"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error!.message).toBe("Server error");
  });

  it("refetch re-fetches the section", async () => {
    mockSanityFetch.mockResolvedValueOnce(makeSection("s1", { title: "V1" }));

    const { result } = renderHook(() => useSanityFeatureSection("section-s1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.feature!.title).toBe("V1");

    mockSanityFetch.mockResolvedValueOnce(makeSection("s1", { title: "V2" }));
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.feature!.title).toBe("V2"));
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// getFeatureSections (server function)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("getFeatureSections", () => {
  it("fetches homepage sections by default", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeSection("s1")]);

    const sections = await getFeatureSections();
    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe("s1");

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("showOnHomepage == true");
  });

  it("fetches all sections when homepageOnly is false", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeSection("s1"), makeSection("s2")]);

    const sections = await getFeatureSections(false);
    expect(sections).toHaveLength(2);

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).not.toContain("showOnHomepage == true");
  });

  it("returns empty array on error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Fetch failed"));

    const sections = await getFeatureSections();
    expect(sections).toEqual([]);
  });

  it("transforms sections correctly", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeSection("s1")]);

    const sections = await getFeatureSections();
    expect(sections[0].title).toBe("Section s1");
    expect(sections[0].features).toHaveLength(2);
    expect(sections[0].createdAt).toBe("2025-01-01T00:00:00Z");
  });
});
