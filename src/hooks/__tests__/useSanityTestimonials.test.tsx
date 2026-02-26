/**
 * Tests for src/hooks/useSanityTestimonials.ts
 *
 * Hooks:  useSanityTestimonials, useFeaturedTestimonials, useHomepageTestimonials,
 *         useProductTestimonials, useGrowerTestimonials
 * Server: fetchTestimonials, fetchFeaturedTestimonials, fetchHomepageTestimonials
 * Helpers: transformTestimonial, renderStarRating, getAverageRating, formatTestimonialDate
 *
 * All hooks use sanityClient.fetch (globally mocked in jest.setup.js).
 */

import { renderHook, waitFor } from "@testing-library/react";

jest.setTimeout(30000);

// Access the global sanity mock
const mockSanityFetch = jest.requireMock("@/lib/sanity/client").sanityClient
  .fetch as jest.Mock;

import {
  useSanityTestimonials,
  useFeaturedTestimonials,
  useHomepageTestimonials,
  useProductTestimonials,
  useGrowerTestimonials,
  fetchTestimonials,
  fetchFeaturedTestimonials,
  fetchHomepageTestimonials,
  renderStarRating,
  getAverageRating,
  formatTestimonialDate,
} from "../useSanityTestimonials";

// ─── Helpers ──────────────────────────────────────────────────

const rawTestimonial = (id: string, overrides: Record<string, unknown> = {}) => ({
  _id: id,
  _createdAt: "2025-06-01T10:00:00Z",
  _updatedAt: "2025-06-15T10:00:00Z",
  customerName: `Customer ${id}`,
  customerTitle: "Verified Buyer",
  customerImage: "https://img.example.com/avatar.jpg",
  location: "Manila, PH",
  isVerifiedPurchase: true,
  rating: 5,
  headline: `Great product ${id}`,
  quote: `I loved product ${id}!`,
  productPurchased: {
    _id: "prod-1",
    name: "Lion's Mane",
    slug: { current: "lions-mane" },
    image: { asset: { url: "https://img.example.com/product.jpg" } },
  },
  grower: {
    _id: "grower-1",
    name: "Happy Farms",
    slug: { current: "happy-farms" },
  },
  date: "2025-05-01",
  images: [{ asset: { url: "https://img.example.com/review.jpg" } }],
  videoUrl: "https://youtube.com/watch?v=abc",
  displayPosition: "all",
  sortOrder: 1,
  isFeatured: false,
  isActive: true,
  ...overrides,
});

beforeEach(() => {
  mockSanityFetch.mockReset();
  mockSanityFetch.mockResolvedValue([]);
});

// ═════════════════════════════════════════════════════════════════
// Pure helper functions
// ═════════════════════════════════════════════════════════════════

describe("renderStarRating", () => {
  it("should render 5 filled stars for rating 5", () => {
    expect(renderStarRating(5)).toBe("★★★★★");
  });

  it("should render 0 filled stars for rating 0", () => {
    expect(renderStarRating(0)).toBe("☆☆☆☆☆");
  });

  it("should render 3 filled and 2 empty for rating 3", () => {
    expect(renderStarRating(3)).toBe("★★★☆☆");
  });

  it("should floor decimal ratings", () => {
    expect(renderStarRating(3.7)).toBe("★★★☆☆");
  });
});

describe("getAverageRating", () => {
  it("should return 0 for empty array", () => {
    expect(getAverageRating([])).toBe(0);
  });

  it("should return exact rating for single testimonial", () => {
    const testimonials = [{ rating: 4 }] as any[];
    expect(getAverageRating(testimonials)).toBe(4);
  });

  it("should average multiple ratings rounded to 1 decimal", () => {
    const testimonials = [
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ] as any[];
    expect(getAverageRating(testimonials)).toBe(4);
  });

  it("should round to nearest tenth", () => {
    const testimonials = [
      { rating: 5 },
      { rating: 4 },
      { rating: 4 },
    ] as any[];
    // (5+4+4)/3 = 4.333... => 4.3
    expect(getAverageRating(testimonials)).toBe(4.3);
  });
});

describe("formatTestimonialDate", () => {
  it("should return empty string for undefined", () => {
    expect(formatTestimonialDate(undefined)).toBe("");
  });

  it("should return empty string for empty string", () => {
    expect(formatTestimonialDate("")).toBe("");
  });

  it("should format valid ISO date", () => {
    const formatted = formatTestimonialDate("2025-05-01");
    expect(formatted).toContain("2025");
    expect(formatted).toContain("May");
  });
});

// ═════════════════════════════════════════════════════════════════
// useSanityTestimonials
// ═════════════════════════════════════════════════════════════════

describe("useSanityTestimonials", () => {
  it("should start in loading state", () => {
    const { result } = renderHook(() => useSanityTestimonials());
    expect(result.current.loading).toBe(true);
  });

  it("should fetch and transform testimonials", async () => {
    const data = [rawTestimonial("t1"), rawTestimonial("t2")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(2);
    expect(result.current.testimonials[0].id).toBe("t1");
    expect(result.current.testimonials[0].customerName).toBe("Customer t1");
    expect(result.current.testimonials[0].isVerified).toBe(true);
    expect(result.current.testimonials[0].product?.id).toBe("prod-1");
    expect(result.current.testimonials[0].grower?.id).toBe("grower-1");
    expect(result.current.error).toBeNull();
  });

  it("should handle error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useSanityTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Network error");
    expect(result.current.testimonials).toEqual([]);
  });

  it("should handle non-Error thrown", async () => {
    mockSanityFetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe("Failed to fetch testimonials");
  });

  it("should handle null data gracefully", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toEqual([]);
  });

  it("should filter by minRating", async () => {
    const data = [
      rawTestimonial("t1", { rating: 5 }),
      rawTestimonial("t2", { rating: 3 }),
      rawTestimonial("t3", { rating: 4 }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() =>
      useSanityTestimonials({ minRating: 4 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(2);
    expect(result.current.testimonials.every((t) => t.rating >= 4)).toBe(true);
  });

  it("should filter by productId", async () => {
    const data = [
      rawTestimonial("t1", {
        productPurchased: { _id: "prod-A", name: "A", slug: { current: "a" } },
      }),
      rawTestimonial("t2", {
        productPurchased: { _id: "prod-B", name: "B", slug: { current: "b" } },
      }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() =>
      useSanityTestimonials({ productId: "prod-A" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(1);
    expect(result.current.testimonials[0].product?.id).toBe("prod-A");
  });

  it("should filter by growerId", async () => {
    const data = [
      rawTestimonial("t1", {
        grower: { _id: "g1", name: "G1", slug: { current: "g1" } },
      }),
      rawTestimonial("t2", {
        grower: { _id: "g2", name: "G2", slug: { current: "g2" } },
      }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() =>
      useSanityTestimonials({ growerId: "g1" })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(1);
    expect(result.current.testimonials[0].grower?.id).toBe("g1");
  });

  it("should apply limit filter client-side (no position/featured)", async () => {
    const data = [
      rawTestimonial("t1"),
      rawTestimonial("t2"),
      rawTestimonial("t3"),
      rawTestimonial("t4"),
      rawTestimonial("t5"),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() =>
      useSanityTestimonials({ limit: 3 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(3);
  });

  it("should use position-specific query when position filter provided", async () => {
    mockSanityFetch.mockResolvedValueOnce([rawTestimonial("t1", { displayPosition: "homepage" })]);

    const { result } = renderHook(() =>
      useSanityTestimonials({ position: "homepage", limit: 5 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ position: "homepage", limit: 5 })
    );
  });

  it("should use featured query when featured filter provided", async () => {
    mockSanityFetch.mockResolvedValueOnce([rawTestimonial("t1", { isFeatured: true })]);

    const { result } = renderHook(() =>
      useSanityTestimonials({ featured: true, limit: 3 })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ limit: 3 })
    );
  });

  it("should provide refetch function", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useSanityTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.refetch).toBeDefined();
  });

  it("should transform testimonial with missing optional fields", async () => {
    const data = [
      {
        _id: "t1",
        _createdAt: "2025-01-01T00:00:00Z",
        customerName: "John",
        isVerifiedPurchase: false,
        rating: 4,
        headline: "Good",
        quote: "Nice product",
        displayPosition: "all",
        sortOrder: 1,
        isFeatured: false,
        isActive: true,
        // No productPurchased, grower, images, videoUrl, customerTitle, location, date
      },
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(1);
    const t = result.current.testimonials[0];
    expect(t.product).toBeUndefined();
    expect(t.grower).toBeUndefined();
    expect(t.isVerified).toBe(false);
    expect(t.customerTitle).toBeUndefined();
  });

  it("should handle customerImage as direct string URL", async () => {
    const data = [
      rawTestimonial("t1", { customerImage: "https://direct-url.com/photo.jpg" }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useSanityTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials[0].customerImage).toBe(
      "https://direct-url.com/photo.jpg"
    );
  });
});

// ═════════════════════════════════════════════════════════════════
// Convenience hooks
// ═════════════════════════════════════════════════════════════════

describe("useFeaturedTestimonials", () => {
  it("should call with featured filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([rawTestimonial("t1", { isFeatured: true })]);

    const { result } = renderHook(() => useFeaturedTestimonials(3));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ limit: 3 })
    );
  });

  it("should default limit to 6", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useFeaturedTestimonials());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ limit: 6 })
    );
  });
});

describe("useHomepageTestimonials", () => {
  it("should call with homepage position", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useHomepageTestimonials(4));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ position: "homepage", limit: 4 })
    );
  });
});

describe("useProductTestimonials", () => {
  it("should filter by product ID", async () => {
    const data = [
      rawTestimonial("t1", {
        productPurchased: { _id: "target-prod", name: "X", slug: { current: "x" } },
      }),
      rawTestimonial("t2", {
        productPurchased: { _id: "other-prod", name: "Y", slug: { current: "y" } },
      }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useProductTestimonials("target-prod", 10));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(1);
    expect(result.current.testimonials[0].product?.id).toBe("target-prod");
  });
});

describe("useGrowerTestimonials", () => {
  it("should filter by grower ID", async () => {
    const data = [
      rawTestimonial("t1", {
        grower: { _id: "target-grower", name: "G", slug: { current: "g" } },
      }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const { result } = renderHook(() => useGrowerTestimonials("target-grower"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.testimonials).toHaveLength(1);
  });
});

// ═════════════════════════════════════════════════════════════════
// Server-side functions
// ═════════════════════════════════════════════════════════════════

describe("fetchTestimonials (server)", () => {
  it("should return transformed testimonials", async () => {
    const data = [rawTestimonial("t1")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const result = await fetchTestimonials();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("t1");
    expect(result[0].customerName).toBe("Customer t1");
  });

  it("should return empty array on error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("fail"));

    const result = await fetchTestimonials();
    expect(result).toEqual([]);
  });

  it("should apply minRating filter", async () => {
    const data = [
      rawTestimonial("t1", { rating: 5 }),
      rawTestimonial("t2", { rating: 2 }),
    ];
    mockSanityFetch.mockResolvedValueOnce(data);

    const result = await fetchTestimonials({ minRating: 4 });
    expect(result).toHaveLength(1);
    expect(result[0].rating).toBe(5);
  });

  it("should apply limit filter", async () => {
    const data = [rawTestimonial("t1"), rawTestimonial("t2"), rawTestimonial("t3")];
    mockSanityFetch.mockResolvedValueOnce(data);

    const result = await fetchTestimonials({ limit: 2 });
    expect(result).toHaveLength(2);
  });

  it("should use position query when position specified", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    await fetchTestimonials({ position: "shop" });
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ position: "shop" })
    );
  });

  it("should use featured query when featured specified", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    await fetchTestimonials({ featured: true, limit: 4 });
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ limit: 4 })
    );
  });
});

describe("fetchFeaturedTestimonials (server)", () => {
  it("should call with featured filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const result = await fetchFeaturedTestimonials(5);
    expect(result).toEqual([]);
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ limit: 5 })
    );
  });
});

describe("fetchHomepageTestimonials (server)", () => {
  it("should call with homepage position", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const result = await fetchHomepageTestimonials(3);
    expect(result).toEqual([]);
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ position: "homepage", limit: 3 })
    );
  });
});
