/**
 * Tests for src/hooks/useMain.ts
 *
 * Hooks:  useHomePageData, useGrowers, useGrower, useAboutContent, useFAQContent
 *
 * All hooks follow the same useState + useCallback + useEffect pattern,
 * calling methods on MainApi from @/lib/api/main.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

// ─── Manual mock for MainApi ──────────────────────────────────

jest.mock("@/lib/api/main", () => ({
  MainApi: {
    getHomePageData: jest.fn(),
    getGrowers: jest.fn(),
    getGrowerById: jest.fn(),
    getAboutContent: jest.fn(),
    getFAQContent: jest.fn(),
  },
}));

const { MainApi: mockMainApi } = jest.requireMock("@/lib/api/main") as {
  MainApi: {
    getHomePageData: jest.Mock;
    getGrowers: jest.Mock;
    getGrowerById: jest.Mock;
    getAboutContent: jest.Mock;
    getFAQContent: jest.Mock;
  };
};

import {
  useHomePageData,
  useGrowers,
  useGrower,
  useAboutContent,
  useFAQContent,
} from "../useMain";

// ─── Test Data ────────────────────────────────────────────────

const mockHomeData = {
  featuredProducts: [{ id: "p1", name: "Product 1" }],
  newArrivals: [{ id: "p2", name: "Product 2" }],
  categories: [{ id: "c1", name: "Category 1" }],
};

const mockGrowers = [
  { id: 1, name: "Grower One", location: "Manila" },
  { id: 2, name: "Grower Two", location: "Cebu" },
];

const mockGrower = { id: 1, name: "Grower One", location: "Manila", bio: "Test grower" };

const mockAboutContent = {
  title: "About MASH",
  content: "We are a marketplace",
  team: [{ name: "John", role: "CEO" }],
};

const mockFAQs = [
  { question: "How to order?", answer: "Click buy" },
  { question: "How to pay?", answer: "Use GCash" },
];

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  mockMainApi.getHomePageData.mockClear();
  mockMainApi.getGrowers.mockClear();
  mockMainApi.getGrowerById.mockClear();
  mockMainApi.getAboutContent.mockClear();
  mockMainApi.getFAQContent.mockClear();

  // Defaults - all return ApiResponse format { data: T }
  mockMainApi.getHomePageData.mockResolvedValue({ data: mockHomeData });
  mockMainApi.getGrowers.mockResolvedValue({ data: mockGrowers });
  mockMainApi.getGrowerById.mockResolvedValue({ data: mockGrower });
  mockMainApi.getAboutContent.mockResolvedValue({ data: mockAboutContent });
  mockMainApi.getFAQContent.mockResolvedValue({ data: mockFAQs });
});

// ═══════════════════════════════════════════════════════════════
// useHomePageData
// ═══════════════════════════════════════════════════════════════

describe("useHomePageData", () => {
  it("starts in loading state", () => {
    mockMainApi.getHomePageData.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useHomePageData());

    expect(result.current.loading).toBe(true);
    expect(result.current.homeData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches home page data successfully", async () => {
    const { result } = renderHook(() => useHomePageData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockMainApi.getHomePageData).toHaveBeenCalledTimes(1);
    expect(result.current.homeData).toEqual(mockHomeData);
    expect(result.current.error).toBeNull();
  });

  it("sets string error on fetch failure (Error instance)", async () => {
    mockMainApi.getHomePageData.mockRejectedValue(new Error("API down"));
    const { result } = renderHook(() => useHomePageData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("API down");
    expect(result.current.homeData).toBeNull();
  });

  it("sets fallback string error on non-Error rejection", async () => {
    mockMainApi.getHomePageData.mockRejectedValue("oops");
    const { result } = renderHook(() => useHomePageData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain("Failed to fetch");
  });

  it("refetch triggers re-fetch and updates data", async () => {
    const { result } = renderHook(() => useHomePageData());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedData = { ...mockHomeData, featuredProducts: [] };
    mockMainApi.getHomePageData.mockResolvedValue({ data: updatedData });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.homeData).toEqual(updatedData);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// useGrowers
// ═══════════════════════════════════════════════════════════════

describe("useGrowers", () => {
  it("starts in loading state with empty growers array", () => {
    mockMainApi.getGrowers.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useGrowers());

    expect(result.current.loading).toBe(true);
    expect(result.current.growers).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches growers successfully", async () => {
    const { result } = renderHook(() => useGrowers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.growers).toEqual(mockGrowers);
    expect(result.current.growers).toHaveLength(2);
  });

  it("handles fetch error", async () => {
    mockMainApi.getGrowers.mockRejectedValue(new Error("Grower fetch error"));
    const { result } = renderHook(() => useGrowers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Grower fetch error");
    expect(result.current.growers).toEqual([]);
  });

  it("refetch reloads grower data", async () => {
    const { result } = renderHook(() => useGrowers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedGrowers = [{ id: 3, name: "New Grower", location: "Davao" }];
    mockMainApi.getGrowers.mockResolvedValue({ data: updatedGrowers });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.growers).toEqual(updatedGrowers);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// useGrower
// ═══════════════════════════════════════════════════════════════

describe("useGrower", () => {
  it("starts in loading state", () => {
    mockMainApi.getGrowerById.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useGrower(1));

    expect(result.current.loading).toBe(true);
    expect(result.current.grower).toBeNull();
  });

  it("fetches grower by id", async () => {
    const { result } = renderHook(() => useGrower(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockMainApi.getGrowerById).toHaveBeenCalledWith(1);
    expect(result.current.grower).toEqual(mockGrower);
  });

  it("does not fetch when id is falsy (0)", async () => {
    const { result } = renderHook(() => useGrower(0));

    // Should not call API when id is 0 (falsy)
    expect(mockMainApi.getGrowerById).not.toHaveBeenCalled();
  });

  it("handles fetch error for specific grower", async () => {
    mockMainApi.getGrowerById.mockRejectedValue(new Error("Not found"));
    const { result } = renderHook(() => useGrower(999));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Not found");
    expect(result.current.grower).toBeNull();
  });

  it("re-fetches when id changes", async () => {
    const { result, rerender } = renderHook(
      ({ id }) => useGrower(id),
      { initialProps: { id: 1 } }
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    const grower2 = { id: 2, name: "Grower Two", location: "Cebu" };
    mockMainApi.getGrowerById.mockResolvedValue({ data: grower2 });

    rerender({ id: 2 });
    await waitFor(() => {
      expect(result.current.grower).toEqual(grower2);
    });
  });

  it("refetch works after initial load", async () => {
    const { result } = renderHook(() => useGrower(1));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedGrower = { ...mockGrower, name: "Updated" };
    mockMainApi.getGrowerById.mockResolvedValue({ data: updatedGrower });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.grower).toEqual(updatedGrower);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// useAboutContent
// ═══════════════════════════════════════════════════════════════

describe("useAboutContent", () => {
  it("starts in loading state", () => {
    mockMainApi.getAboutContent.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useAboutContent());

    expect(result.current.loading).toBe(true);
    expect(result.current.content).toBeNull();
  });

  it("fetches about content successfully", async () => {
    const { result } = renderHook(() => useAboutContent());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.content).toEqual(mockAboutContent);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch error", async () => {
    mockMainApi.getAboutContent.mockRejectedValue(new Error("About error"));
    const { result } = renderHook(() => useAboutContent());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("About error");
    expect(result.current.content).toBeNull();
  });

  it("refetch reloads about content", async () => {
    const { result } = renderHook(() => useAboutContent());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = { ...mockAboutContent, title: "Updated About" };
    mockMainApi.getAboutContent.mockResolvedValue({ data: updated });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.content).toEqual(updated);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// useFAQContent
// ═══════════════════════════════════════════════════════════════

describe("useFAQContent", () => {
  it("starts in loading state with empty faqs array", () => {
    mockMainApi.getFAQContent.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useFAQContent());

    expect(result.current.loading).toBe(true);
    expect(result.current.faqs).toEqual([]);
  });

  it("fetches FAQ content successfully", async () => {
    const { result } = renderHook(() => useFAQContent());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.faqs).toEqual(mockFAQs);
    expect(result.current.faqs).toHaveLength(2);
  });

  it("handles fetch error", async () => {
    mockMainApi.getFAQContent.mockRejectedValue(new Error("FAQ error"));
    const { result } = renderHook(() => useFAQContent());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("FAQ error");
    expect(result.current.faqs).toEqual([]);
  });

  it("handles non-Error rejection with fallback message", async () => {
    mockMainApi.getFAQContent.mockRejectedValue(42);
    const { result } = renderHook(() => useFAQContent());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain("Failed to fetch");
  });

  it("refetch reloads FAQ data", async () => {
    const { result } = renderHook(() => useFAQContent());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = [{ question: "New Q?", answer: "New A" }];
    mockMainApi.getFAQContent.mockResolvedValue({ data: updated });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.faqs).toEqual(updated);
    });
  });
});
