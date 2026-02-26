/**
 * useCMS Hook Tests - COVERAGE-011
 *
 * Tests 6 hooks from src/hooks/useCMS.ts:
 * - useHeroSections: Fetches hero sections from /api/cms/hero
 * - useFeatureSections: Fetches feature sections from /api/cms/features
 * - useFAQs: Fetches FAQ groups from /api/cms/faq
 * - useFAQCategories: Fetches FAQ categories from /api/cms/faq/categories
 * - useAboutContent: Returns static about page content
 * - useContactContent: Returns static contact page content
 *
 * Key: These hooks use global fetch() NOT sanityClient.fetch()
 * Error type: string | null (not Error | null)
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useHeroSections,
  useFeatureSections,
  useFAQs,
  useFAQCategories,
  useAboutContent,
  useContactContent,
} from "../useCMS";

// ============================================================================
// MOCK DATA
// ============================================================================

const mockHeroSection = {
  id: "hero-1",
  title: "Welcome to MASH",
  subtitle: "Fresh mushrooms delivered",
  backgroundImages: ["/hero1.jpg"],
  primaryButton: { text: "Shop Now", url: "/shop", variant: "primary" as const },
  secondaryButton: { text: "Learn More", url: "/about", variant: "outline" as const },
  isActive: true,
  displayOrder: 2,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockHeroSection2 = {
  ...mockHeroSection,
  id: "hero-2",
  title: "New Arrivals",
  displayOrder: 1,
};

const mockFeatureSection = {
  id: "feature-1",
  title: "Why Choose MASH",
  subtitle: "Quality mushrooms",
  features: [
    {
      id: "feat-1",
      icon: "leaf",
      headline: "Fresh",
      subheadline: "Farm to table",
      displayOrder: 1,
      isActive: true,
    },
  ],
  isActive: true,
  displayOrder: 2,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockFeatureSection2 = {
  ...mockFeatureSection,
  id: "feature-2",
  title: "Benefits",
  displayOrder: 1,
};

const mockFAQGroup = {
  id: "faq-group-1",
  name: "General",
  displayOrder: 2,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  questions: [
    {
      id: "faq-1",
      categoryId: "faq-group-1",
      question: "What is MASH?",
      answer: "A mushroom marketplace",
      displayOrder: 2,
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "faq-2",
      categoryId: "faq-group-1",
      question: "How to order?",
      answer: "Add to cart",
      displayOrder: 1,
      isActive: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ],
};

const mockFAQGroup2 = {
  ...mockFAQGroup,
  id: "faq-group-2",
  name: "Shipping",
  displayOrder: 1,
  questions: [],
};

const mockFAQCategory = {
  id: "cat-1",
  name: "General",
  displayOrder: 2,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const mockFAQCategory2 = {
  ...mockFAQCategory,
  id: "cat-2",
  name: "Orders",
  displayOrder: 1,
};

// ============================================================================
// MOCK SETUP
// ============================================================================

const originalFetch = global.fetch;

beforeEach(() => {
  // Reset fetch mock before each test
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

// ============================================================================
// useHeroSections
// ============================================================================

describe("useHeroSections", () => {
  it("should fetch and sort hero sections by displayOrder", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [mockHeroSection, mockHeroSection2],
      }),
    });

    const { result } = renderHook(() => useHeroSections());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.heroes).toHaveLength(2);
    // Sorted by displayOrder: hero-2 (1) before hero-1 (2)
    expect(result.current.heroes[0].id).toBe("hero-2");
    expect(result.current.heroes[1].id).toBe("hero-1");
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith("/api/cms/hero?activeOnly=true");
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: "Server error",
      }),
    });

    const { result } = renderHook(() => useHeroSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.heroes).toEqual([]);
    expect(result.current.error).toBe("Server error");
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failed"));

    const { result } = renderHook(() => useHeroSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.heroes).toEqual([]);
    expect(result.current.error).toBe("Network error occurred");
  });

  it("should refetch when refetch is called", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: [mockHeroSection],
      }),
    });

    const { result } = renderHook(() => useHeroSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("should use default error message when API error is empty", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: false,
      }),
    });

    const { result } = renderHook(() => useHeroSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch hero sections");
  });
});

// ============================================================================
// useFeatureSections
// ============================================================================

describe("useFeatureSections", () => {
  it("should fetch and sort feature sections by displayOrder", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [mockFeatureSection, mockFeatureSection2],
      }),
    });

    const { result } = renderHook(() => useFeatureSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.features).toHaveLength(2);
    // Sorted: feature-2 (1) before feature-1 (2)
    expect(result.current.features[0].id).toBe("feature-2");
    expect(result.current.features[1].id).toBe("feature-1");
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith("/api/cms/features?activeOnly=true");
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, error: "Features unavailable" }),
    });

    const { result } = renderHook(() => useFeatureSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.features).toEqual([]);
    expect(result.current.error).toBe("Features unavailable");
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useFeatureSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error occurred");
  });

  it("should use default error message when API error is empty", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false }),
    });

    const { result } = renderHook(() => useFeatureSections());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch feature sections");
  });
});

// ============================================================================
// useFAQs
// ============================================================================

describe("useFAQs", () => {
  it("should fetch and sort FAQs by displayOrder", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [mockFAQGroup, mockFAQGroup2],
      }),
    });

    const { result } = renderHook(() => useFAQs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.faqs).toHaveLength(2);
    // Sorted by displayOrder: group2 (1) before group1 (2)
    expect(result.current.faqs[0].id).toBe("faq-group-2");
    expect(result.current.faqs[1].id).toBe("faq-group-1");
  });

  it("should sort questions within each FAQ group", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [mockFAQGroup],
      }),
    });

    const { result } = renderHook(() => useFAQs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Questions sorted: faq-2 (displayOrder 1) before faq-1 (displayOrder 2)
    expect(result.current.faqs[0].questions[0].id).toBe("faq-2");
    expect(result.current.faqs[0].questions[1].id).toBe("faq-1");
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, error: "FAQ load failed" }),
    });

    const { result } = renderHook(() => useFAQs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.faqs).toEqual([]);
    expect(result.current.error).toBe("FAQ load failed");
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Connection refused"));

    const { result } = renderHook(() => useFAQs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error occurred");
  });

  it("should provide refetch function", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useFAQs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});

// ============================================================================
// useFAQCategories
// ============================================================================

describe("useFAQCategories", () => {
  it("should fetch and sort categories by displayOrder", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [mockFAQCategory, mockFAQCategory2],
      }),
    });

    const { result } = renderHook(() => useFAQCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toHaveLength(2);
    // Sorted: cat-2 (1) before cat-1 (2)
    expect(result.current.categories[0].id).toBe("cat-2");
    expect(result.current.categories[1].id).toBe("cat-1");
    expect(global.fetch).toHaveBeenCalledWith("/api/cms/faq/categories");
  });

  it("should handle API error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, error: "Auth required" }),
    });

    const { result } = renderHook(() => useFAQCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe("Auth required");
  });

  it("should handle network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("DNS error"));

    const { result } = renderHook(() => useFAQCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network error occurred");
  });

  it("should use default error message when API error is empty", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false }),
    });

    const { result } = renderHook(() => useFAQCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch FAQ categories");
  });
});

// ============================================================================
// useAboutContent
// ============================================================================

describe("useAboutContent", () => {
  it("should return static about content with all sections", async () => {
    const { result } = renderHook(() => useAboutContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should include hero section with title and subtitle", async () => {
    const { result } = renderHook(() => useAboutContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.hero).toBeDefined();
    expect(result.current.content?.hero?.title).toBe(
      "Cultivating the Future of Philippine Agriculture"
    );
    expect(result.current.content?.hero?.subtitle).toContain("student innovators");
  });

  it("should include challenges section with list", async () => {
    const { result } = renderHook(() => useAboutContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.challenges).toBeDefined();
    expect(result.current.content?.challenges?.challenges.length).toBeGreaterThan(0);
  });

  it("should include solutions section with items", async () => {
    const { result } = renderHook(() => useAboutContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.solutions).toBeDefined();
    expect(result.current.content?.solutions?.solutions.length).toBe(3);
    expect(result.current.content?.solutions?.solutions[0].title).toBe("Automated Growing");
  });

  it("should include vision section", async () => {
    const { result } = renderHook(() => useAboutContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.vision).toBeDefined();
    expect(result.current.content?.vision?.callToAction).toBe(
      "Join us in growing the mushroom movement!"
    );
  });

  it("should include mentor section", async () => {
    const { result } = renderHook(() => useAboutContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content?.mentor).toBeDefined();
    expect(result.current.content?.mentor?.mentor.name).toContain("Barrios");
  });

  it("should provide refetch function", async () => {
    const { result } = renderHook(() => useAboutContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});

// ============================================================================
// useContactContent
// ============================================================================

describe("useContactContent", () => {
  it("should return static contact content with all sections", async () => {
    const { result } = renderHook(() => useContactContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should include contact info with phone, email, and address", async () => {
    const { result } = renderHook(() => useContactContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const contactInfo = result.current.content?.contactInfo;
    expect(contactInfo).toHaveLength(3);

    const types = contactInfo?.map((c) => c.type);
    expect(types).toContain("phone");
    expect(types).toContain("email");
    expect(types).toContain("address");
  });

  it("should include business hours for all days", async () => {
    const { result } = renderHook(() => useContactContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const hours = result.current.content?.businessHours;
    expect(hours).toHaveLength(7);

    // Sunday should be closed
    const sunday = hours?.find((h) => h.dayOfWeek === "sunday");
    expect(sunday?.isClosed).toBe(true);
  });

  it("should include social links", async () => {
    const { result } = renderHook(() => useContactContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const socialLinks = result.current.content?.socialLinks;
    expect(socialLinks).toBeDefined();
    expect(socialLinks!.length).toBeGreaterThan(0);

    const platforms = socialLinks?.map((s) => s.platform);
    expect(platforms).toContain("facebook");
  });

  it("should provide refetch function", async () => {
    const { result } = renderHook(() => useContactContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe("function");
  });
});
