/**
 * Tests for src/hooks/useSanityFAQ.ts
 *
 * Hooks:  useSanityFAQs, useSanityFAQCategories, useSanityFeaturedFAQs,
 *         useSanityFAQsByCategory, useSanitySearchFAQs
 * Server: getSanityFAQs, getSanityFAQCategories, getSanityFeaturedFAQs
 *
 * All hooks use sanityClient.fetch (globally mocked in jest.setup.js).
 * Error type: string | null.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// Access the global sanity mock
const mockSanityFetch = jest.requireMock("@/lib/sanity/client").sanityClient
  .fetch as jest.Mock;

import {
  useSanityFAQs,
  useSanityFAQCategories,
  useSanityFeaturedFAQs,
  useSanityFAQsByCategory,
  useSanitySearchFAQs,
  getSanityFAQs,
  getSanityFAQCategories,
  getSanityFeaturedFAQs,
} from "../useSanityFAQ";

// ─── Helpers ──────────────────────────────────────────────────

const rawCategory = (id: string, name: string, slug: string, questions: unknown[] = []) => ({
  _id: id,
  name,
  slug: { current: slug },
  description: `${name} description`,
  icon: "icon-test",
  displayOrder: 1,
  isActive: true,
  _createdAt: "2025-01-01T00:00:00Z",
  _updatedAt: "2025-06-01T00:00:00Z",
  questions,
});

const rawQuestion = (id: string, q: string, catId?: string) => ({
  _id: id,
  question: q,
  answer: `Answer for ${q}`,
  category: catId ? { _id: catId } : null,
  displayOrder: 0,
  isActive: true,
  isFeatured: false,
  tags: ["tag1"],
  helpfulCount: 5,
  notHelpfulCount: 1,
  _createdAt: "2025-01-01T00:00:00Z",
  _updatedAt: "2025-06-01T00:00:00Z",
});

beforeEach(() => {
  mockSanityFetch.mockReset();
  mockSanityFetch.mockResolvedValue([]);
});

// ═════════════════════════════════════════════════════════════════
// useSanityFAQs
// ═════════════════════════════════════════════════════════════════

describe("useSanityFAQs", () => {
  it("should start in loading state", () => {
    const { result } = renderHook(() => useSanityFAQs());
    expect(result.current.loading).toBe(true);
  });

  it("should resolve with grouped FAQs", async () => {
    const data = [
      rawCategory("c1", "General", "general", [
        rawQuestion("q1", "What?", "c1"),
        rawQuestion("q2", "How?", "c1"),
      ]),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.faqs).toHaveLength(1);
    expect(result.current.faqs[0].id).toBe("c1");
    expect(result.current.faqs[0].slug).toBe("general");
    expect(result.current.faqs[0].questions).toHaveLength(2);
    expect(result.current.faqs[0].questions[0].id).toBe("q1");
    expect(result.current.error).toBeNull();
  });

  it("should filter categories with no questions", async () => {
    const data = [
      rawCategory("c1", "General", "general", [rawQuestion("q1", "Q1", "c1")]),
      rawCategory("c2", "Empty", "empty", []),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.faqs).toHaveLength(1);
    expect(result.current.faqs[0].name).toBe("General");
  });

  it("should handle error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSanityFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Network error");
    expect(result.current.faqs).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockSanityFetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to fetch FAQs");
  });

  it("should provide refetch", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockSanityFetch.mockResolvedValueOnce([rawCategory("c1", "New", "new", [rawQuestion("q1", "Q")])]);
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.faqs).toHaveLength(1));
    expect(result.current.faqs[0].name).toBe("New");
  });

  it("should default missing fields in transform", async () => {
    const data = [
      {
        _id: "c1",
        name: "Cat",
        slug: null,
        questions: [
          {
            _id: "q1",
            question: "Q?",
            answer: "A",
            category: null,
            // omit displayOrder, isActive, isFeatured, tags, counts
          },
        ],
      },
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const group = result.current.faqs[0];
    expect(group.slug).toBe("");
    expect(group.displayOrder).toBe(0);
    expect(group.isActive).toBe(true);
    const q = group.questions[0];
    expect(q.displayOrder).toBe(0);
    expect(q.isFeatured).toBe(false);
    expect(q.tags).toEqual([]);
    expect(q.helpfulCount).toBe(0);
    expect(q.notHelpfulCount).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════
// useSanityFAQCategories
// ═════════════════════════════════════════════════════════════════

describe("useSanityFAQCategories", () => {
  it("should fetch categories", async () => {
    const cats = [
      { _id: "c1", name: "General", slug: { current: "general" }, displayOrder: 1, isActive: true },
      { _id: "c2", name: "Shipping", slug: { current: "shipping" }, displayOrder: 2, isActive: true },
    ];
    mockSanityFetch.mockResolvedValueOnce(cats);

    const { result } = renderHook(() => useSanityFAQCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories[0].name).toBe("General");
    expect(result.current.error).toBeNull();
  });

  it("should handle error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Fetch failed"));

    const { result } = renderHook(() => useSanityFAQCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.categories).toEqual([]);
  });

  it("should provide refetch", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityFAQCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toEqual([]);

    mockSanityFetch.mockResolvedValueOnce([{ _id: "c1", name: "New", slug: { current: "new" } }]);
    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.categories).toHaveLength(1));
  });
});

// ═════════════════════════════════════════════════════════════════
// useSanityFeaturedFAQs
// ═════════════════════════════════════════════════════════════════

describe("useSanityFeaturedFAQs", () => {
  it("should fetch and transform featured FAQs", async () => {
    const data = [rawQuestion("q1", "Featured?", "c1")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityFeaturedFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.faqs).toHaveLength(1);
    expect(result.current.faqs[0].id).toBe("q1");
    expect(result.current.faqs[0].categoryId).toBe("c1");
    expect(result.current.error).toBeNull();
  });

  it("should handle error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Net error"));

    const { result } = renderHook(() => useSanityFeaturedFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Net error");
  });

  it("should default missing question fields", async () => {
    const data = [{ _id: "q1", question: "Q?", answer: "A" }];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityFeaturedFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));
    const q = result.current.faqs[0];
    expect(q.categoryId).toBe("");
    expect(q.displayOrder).toBe(0);
    expect(q.isActive).toBe(true);
    expect(q.isFeatured).toBe(false);
    expect(q.tags).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════
// useSanityFAQsByCategory
// ═════════════════════════════════════════════════════════════════

describe("useSanityFAQsByCategory", () => {
  it("should fetch FAQs by category slug", async () => {
    const data = [rawQuestion("q1", "By cat?", "c1")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityFAQsByCategory("general"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.faqs).toHaveLength(1);
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      { categorySlug: "general" }
    );
  });

  it("should guard against empty slug", async () => {
    const { result } = renderHook(() => useSanityFAQsByCategory(""));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.faqs).toEqual([]);
    // sanityClient.fetch should NOT have been called (guard returns early)
    expect(mockSanityFetch).not.toHaveBeenCalled();
  });

  it("should handle error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("err"));

    const { result } = renderHook(() => useSanityFAQsByCategory("shipping"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("err");
  });

  it("should refetch on slug change", async () => {
    const data1 = [rawQuestion("q1", "Q1", "c1")];
    const data2 = [rawQuestion("q2", "Q2", "c2"), rawQuestion("q3", "Q3", "c2")];
    mockSanityFetch.mockResolvedValueOnce(data1);

    const { result, rerender } = renderHook(
      ({ slug }: { slug: string }) => useSanityFAQsByCategory(slug),
      { initialProps: { slug: "general" } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.faqs).toHaveLength(1);

    mockSanityFetch.mockResolvedValueOnce(data2);
    rerender({ slug: "shipping" });

    await waitFor(() => expect(result.current.faqs).toHaveLength(2));
  });
});

// ═════════════════════════════════════════════════════════════════
// useSanitySearchFAQs
// ═════════════════════════════════════════════════════════════════

describe("useSanitySearchFAQs", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should start with loading false", () => {
    const { result } = renderHook(() => useSanitySearchFAQs(""));
    expect(result.current.loading).toBe(false);
  });

  it("should not search for terms less than 2 chars", async () => {
    const { result } = renderHook(() => useSanitySearchFAQs("a"));

    // Advance debounce timer
    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => {
      expect(mockSanityFetch).not.toHaveBeenCalled();
      expect(result.current.faqs).toEqual([]);
    });
  });

  it("should debounce and search for valid terms", async () => {
    const data = [rawQuestion("q1", "Mushroom question", "c1")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanitySearchFAQs("mushroom"));

    // Before debounce
    expect(mockSanityFetch).not.toHaveBeenCalled();

    // After debounce
    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      { searchTerm: "*mushroom*" }
    );
    expect(result.current.faqs).toHaveLength(1);
    expect(result.current.faqs[0].id).toBe("q1");
  });

  it("should handle search error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Search failed"));

    const { result } = renderHook(() => useSanitySearchFAQs("shipping"));

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Search failed");
  });

  it("should expose direct search method", async () => {
    const data = [rawQuestion("q1", "Direct search result")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanitySearchFAQs(""));

    await act(async () => {
      result.current.search("organic");
    });

    await waitFor(() => expect(result.current.faqs).toHaveLength(1));
  });

  it("should clear results for empty direct search", async () => {
    mockSanityFetch.mockResolvedValueOnce([rawQuestion("q1", "Q")]);

    const { result } = renderHook(() => useSanitySearchFAQs("test"));

    act(() => { jest.advanceTimersByTime(350); });

    await waitFor(() => expect(result.current.faqs).toHaveLength(1));

    await act(async () => {
      result.current.search("");
    });

    expect(result.current.faqs).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════
// Server functions
// ═════════════════════════════════════════════════════════════════

describe("getSanityFAQs (server)", () => {
  it("should return transformed grouped FAQs", async () => {
    const data = [
      rawCategory("c1", "General", "general", [rawQuestion("q1", "Q?", "c1")]),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const result = await getSanityFAQs();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
    expect(result[0].questions[0].id).toBe("q1");
  });

  it("should return empty array on error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await getSanityFAQs();
    expect(result).toEqual([]);
  });
});

describe("getSanityFAQCategories (server)", () => {
  it("should return categories", async () => {
    const cats = [{ _id: "c1", name: "General" }];
    mockSanityFetch.mockResolvedValueOnce(cats);

    const result = await getSanityFAQCategories();
    expect(result).toHaveLength(1);
  });

  it("should return empty on error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await getSanityFAQCategories();
    expect(result).toEqual([]);
  });
});

describe("getSanityFeaturedFAQs (server)", () => {
  it("should return transformed featured items", async () => {
    const data = [rawQuestion("q1", "Featured Q", "c1")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const result = await getSanityFeaturedFAQs();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("q1");
  });

  it("should return empty on error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await getSanityFeaturedFAQs();
    expect(result).toEqual([]);
  });
});
