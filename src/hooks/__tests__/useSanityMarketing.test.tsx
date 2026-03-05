/**
 * Tests for src/hooks/useSanityMarketing.ts
 *
 * Hooks:  useSanityCoupons, useSanityPromotions, useSanityPromotion,
 *         useSanityEmailCampaigns
 *
 * All hooks use sanityClient.fetch (globally mocked) and listenSafe for
 * real-time subscriptions.
 */

import { renderHook, waitFor, act } from "@testing-library/react";

const mockSanityFetch = jest.requireMock("@/lib/sanity/client").sanityClient
  .fetch as jest.Mock;
const mockListenSafe = jest.requireMock("@/lib/sanity/client")
  .listenSafe as jest.Mock;

import {
  useSanityCoupons,
  useSanityPromotions,
  useSanityPromotion,
  useSanityEmailCampaigns,
} from "../useSanityMarketing";

// ─── Helpers ──────────────────────────────────────────────────

const makeCoupon = (id: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  _id: id,
  code: `COUPON${id.toUpperCase()}`,
  description: `Coupon ${id}`,
  discountType: "percentage",
  discountValue: 10,
  minimumPurchase: 500,
  maximumDiscount: 200,
  applicableProducts: "all",
  products: null,
  categories: null,
  usageLimit: 100,
  usageLimitPerCustomer: 1,
  usageCount: 5,
  startDate: "2025-01-01T00:00:00Z",
  endDate: "2026-12-31T23:59:59Z",
  isActive: true,
  isPublic: true,
  combinableWithOtherCoupons: false,
  customerEligibility: "all",
  source: "sanity",
  ...overrides,
});

const makePromotion = (id: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  _id: id,
  name: `Promo ${id}`,
  displayName: `Display Promo ${id}`,
  slug: { current: `promo-${id}` },
  tagline: "Save big!",
  description: "Great promotion",
  bannerImage: `https://img.test/banner-${id}.jpg`,
  thumbnailImage: `https://img.test/thumb-${id}.jpg`,
  backgroundColor: "#ff0000",
  textColor: "#ffffff",
  promotionType: "flash-sale",
  discountType: "percentage",
  discountValue: 20,
  applicableProducts: "all",
  products: null,
  categories: null,
  startDate: "2025-01-01T00:00:00Z",
  endDate: "2026-12-31T23:59:59Z",
  showOnHomepage: true,
  showOnProductPages: true,
  priority: 1,
  ctaText: "Shop Now",
  ctaLink: "/shop",
  isActive: true,
  isFeatured: true,
  impressions: 1000,
  clicks: 200,
  conversions: 50,
  ...overrides,
});

const makeCampaign = (id: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  _id: id,
  name: `Campaign ${id}`,
  subject: `Subject ${id}`,
  preheader: "Preview text",
  campaignType: "promotional",
  status: "sent",
  scheduledDate: "2025-06-01T10:00:00Z",
  sentDate: "2025-06-01T10:00:00Z",
  audience: "all-subscribers",
  recipientCount: 1000,
  opens: 400,
  uniqueOpens: 300,
  clicks: 100,
  uniqueClicks: 80,
  bounces: 10,
  unsubscribes: 5,
  ...overrides,
});

let listenCallback: ((update: { type: string }) => void) | null = null;
let listenUnsubscribe: jest.Mock;

beforeEach(() => {
  mockSanityFetch.mockClear();
  listenCallback = null;
  listenUnsubscribe = jest.fn();
  mockListenSafe.mockClear();
  mockListenSafe.mockImplementation(() => ({
    subscribe: jest.fn((cb: (update: { type: string }) => void) => {
      listenCallback = cb;
      return { unsubscribe: listenUnsubscribe };
    }),
  }));
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityCoupons
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityCoupons", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityCoupons());
    expect(result.current.loading).toBe(true);
    expect(result.current.coupons).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches coupons and adds id field", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeCoupon("c1"), makeCoupon("c2")]);

    const { result } = renderHook(() => useSanityCoupons());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.coupons).toHaveLength(2);
    expect(result.current.coupons[0].id).toBe("c1");
    expect(result.current.coupons[0].code).toBe("COUPONC1");
    expect(result.current.error).toBeNull();
  });

  it("applies isActive filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityCoupons({ isActive: true }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("isActive == true");
  });

  it("applies isPublic filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityCoupons({ isPublic: false }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("isPublic == false");
  });

  it("applies both filters simultaneously", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityCoupons({ isActive: true, isPublic: true }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("isActive == true");
    expect(query).toContain("isPublic == true");
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useSanityCoupons());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Server error");
    expect(result.current.coupons).toEqual([]);
  });

  it("handles non-Error throw", async () => {
    mockSanityFetch.mockRejectedValueOnce("string error");

    const { result } = renderHook(() => useSanityCoupons());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch coupons");
  });

  it("sets up listenSafe subscription and cleans up", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { unmount } = renderHook(() => useSanityCoupons());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockListenSafe).toHaveBeenCalledWith(
      expect.stringContaining("coupon")
    );
    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("refetches on real-time mutation", async () => {
    mockSanityFetch.mockResolvedValue([makeCoupon("c1")]);

    renderHook(() => useSanityCoupons());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(1));

    act(() => {
      listenCallback?.({ type: "mutation" });
    });

    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(2));
  });

  // ── validateCoupon ──

  describe("validateCoupon", () => {
    it("validates active coupon successfully", async () => {
      mockSanityFetch.mockResolvedValueOnce([makeCoupon("c1")]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const validation = result.current.validateCoupon("COUPONC1");
      expect(validation.valid).toBe(true);
      expect(validation.coupon).toBeDefined();
    });

    it("case-insensitive coupon code matching", async () => {
      mockSanityFetch.mockResolvedValueOnce([makeCoupon("c1")]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const validation = result.current.validateCoupon("couponc1");
      expect(validation.valid).toBe(true);
    });

    it("returns invalid for unknown coupon", async () => {
      mockSanityFetch.mockResolvedValueOnce([makeCoupon("c1")]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const validation = result.current.validateCoupon("INVALID");
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe("Invalid coupon code");
    });

    it("returns invalid for inactive coupon", async () => {
      mockSanityFetch.mockResolvedValueOnce([makeCoupon("c1", { isActive: false })]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const validation = result.current.validateCoupon("COUPONC1");
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe("Invalid coupon code");
    });

    it("returns invalid for future coupon", async () => {
      const futureStart = new Date(Date.now() + 86400000).toISOString();
      mockSanityFetch.mockResolvedValueOnce([makeCoupon("c1", { startDate: futureStart })]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const validation = result.current.validateCoupon("COUPONC1");
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe("Coupon not yet active");
    });

    it("returns invalid for expired coupon", async () => {
      const pastEnd = new Date(Date.now() - 86400000).toISOString();
      mockSanityFetch.mockResolvedValueOnce([makeCoupon("c1", { endDate: pastEnd })]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const validation = result.current.validateCoupon("COUPONC1");
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe("Coupon expired");
    });

    it("returns invalid when usage limit reached", async () => {
      mockSanityFetch.mockResolvedValueOnce([
        makeCoupon("c1", { usageLimit: 10, usageCount: 10 }),
      ]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const validation = result.current.validateCoupon("COUPONC1");
      expect(validation.valid).toBe(false);
      expect(validation.error).toBe("Coupon usage limit reached");
    });
  });

  describe("refetch", () => {
    it("re-fetches coupons", async () => {
      mockSanityFetch.mockResolvedValue([makeCoupon("c1")]);

      const { result } = renderHook(() => useSanityCoupons());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.refetch();
      });

      expect(mockSanityFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityPromotions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityPromotions", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityPromotions());
    expect(result.current.loading).toBe(true);
    expect(result.current.promotions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches promotions and adds id field", async () => {
    mockSanityFetch.mockResolvedValueOnce([makePromotion("p1")]);

    const { result } = renderHook(() => useSanityPromotions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.promotions).toHaveLength(1);
    expect(result.current.promotions[0].id).toBe("p1");
    expect(result.current.promotions[0].name).toBe("Promo p1");
    expect(result.current.error).toBeNull();
  });

  it("applies isActive filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityPromotions({ isActive: true }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("isActive == true");
  });

  it("applies isFeatured filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityPromotions({ isFeatured: true }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain("isFeatured == true");
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useSanityPromotions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Timeout");
  });

  it("handles non-Error throw", async () => {
    mockSanityFetch.mockRejectedValueOnce("fail");

    const { result } = renderHook(() => useSanityPromotions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch promotions");
  });

  it("sets up real-time subscription and cleans up", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { unmount } = renderHook(() => useSanityPromotions());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockListenSafe).toHaveBeenCalledWith(
      expect.stringContaining("promotion")
    );
    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("refetches on real-time mutation", async () => {
    mockSanityFetch.mockResolvedValue([makePromotion("p1")]);

    renderHook(() => useSanityPromotions());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(1));

    act(() => {
      listenCallback?.({ type: "mutation" });
    });

    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(2));
  });

  // ── getActivePromotions ──

  describe("getActivePromotions", () => {
    it("returns only active and date-valid promotions", async () => {
      const active = makePromotion("p1", {
        isActive: true,
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2026-12-31T23:59:59Z",
      });
      const expired = makePromotion("p2", {
        isActive: true,
        startDate: "2024-01-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
      });
      const inactive = makePromotion("p3", {
        isActive: false,
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2026-12-31T23:59:59Z",
      });

      mockSanityFetch.mockResolvedValueOnce([active, expired, inactive]);

      const { result } = renderHook(() => useSanityPromotions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const activePromos = result.current.getActivePromotions();
      expect(activePromos).toHaveLength(1);
      expect(activePromos[0].id).toBe("p1");
    });
  });

  describe("getHomepagePromotions", () => {
    it("returns only homepage-eligible active promotions", async () => {
      const homepage = makePromotion("p1", { showOnHomepage: true });
      const notHomepage = makePromotion("p2", { showOnHomepage: false });

      mockSanityFetch.mockResolvedValueOnce([homepage, notHomepage]);

      const { result } = renderHook(() => useSanityPromotions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const homepagePromos = result.current.getHomepagePromotions();
      expect(homepagePromos).toHaveLength(1);
      expect(homepagePromos[0].id).toBe("p1");
    });
  });

  describe("refetch", () => {
    it("re-fetches promotions", async () => {
      mockSanityFetch.mockResolvedValue([]);

      const { result } = renderHook(() => useSanityPromotions());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.refetch();
      });

      expect(mockSanityFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityPromotion (single)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityPromotion", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityPromotion("promo-slug"));
    expect(result.current.loading).toBe(true);
    expect(result.current.promotion).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("fetches a single promotion by slug", async () => {
    mockSanityFetch.mockResolvedValueOnce(makePromotion("p1"));

    const { result } = renderHook(() => useSanityPromotion("promo-p1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.promotion).not.toBeNull();
    expect(result.current.promotion!.id).toBe("p1");
    expect(result.current.promotion!.name).toBe("Promo p1");
    expect(mockSanityFetch).toHaveBeenCalledWith(
      expect.stringContaining("slug.current == $slug"),
      { slug: "promo-p1" }
    );
  });

  it("returns null when promotion not found", async () => {
    mockSanityFetch.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useSanityPromotion("nonexistent"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.promotion).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useSanityPromotion("slug"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Not found");
  });

  it("subscribes to real-time updates and cleans up", async () => {
    mockSanityFetch.mockResolvedValueOnce(makePromotion("p1"));

    const { unmount } = renderHook(() => useSanityPromotion("promo-p1"));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockListenSafe).toHaveBeenCalledWith(
      expect.stringContaining("promo-p1")
    );
    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("refetches on real-time mutation", async () => {
    mockSanityFetch.mockResolvedValue(makePromotion("p1"));

    renderHook(() => useSanityPromotion("promo-p1"));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(1));

    act(() => {
      listenCallback?.({ type: "mutation" });
    });

    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(2));
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// useSanityEmailCampaigns
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("useSanityEmailCampaigns", () => {
  it("starts in loading state", () => {
    mockSanityFetch.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useSanityEmailCampaigns());
    expect(result.current.loading).toBe(true);
    expect(result.current.campaigns).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches campaigns and adds id field", async () => {
    mockSanityFetch.mockResolvedValueOnce([makeCampaign("c1"), makeCampaign("c2")]);

    const { result } = renderHook(() => useSanityEmailCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.campaigns).toHaveLength(2);
    expect(result.current.campaigns[0].id).toBe("c1");
    expect(result.current.campaigns[0].name).toBe("Campaign c1");
    expect(result.current.error).toBeNull();
  });

  it("applies status filter", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    renderHook(() => useSanityEmailCampaigns({ status: "sent" }));
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    const query = mockSanityFetch.mock.calls[0][0] as string;
    expect(query).toContain('status == "sent"');
  });

  it("handles fetch error", async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error("API down"));

    const { result } = renderHook(() => useSanityEmailCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("API down");
  });

  it("handles non-Error throw", async () => {
    mockSanityFetch.mockRejectedValueOnce(42);

    const { result } = renderHook(() => useSanityEmailCampaigns());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to fetch campaigns");
  });

  it("sets up real-time subscription and cleans up", async () => {
    mockSanityFetch.mockResolvedValueOnce([]);

    const { unmount } = renderHook(() => useSanityEmailCampaigns());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalled());

    expect(mockListenSafe).toHaveBeenCalledWith(
      expect.stringContaining("emailCampaign")
    );
    unmount();
    expect(listenUnsubscribe).toHaveBeenCalled();
  });

  it("refetches on real-time mutation", async () => {
    mockSanityFetch.mockResolvedValue([makeCampaign("c1")]);

    renderHook(() => useSanityEmailCampaigns());
    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(1));

    act(() => {
      listenCallback?.({ type: "mutation" });
    });

    await waitFor(() => expect(mockSanityFetch).toHaveBeenCalledTimes(2));
  });

  // ── getSummary ──

  describe("getSummary", () => {
    it("computes campaign summary metrics", async () => {
      const campaigns = [
        makeCampaign("c1", {
          status: "sent",
          recipientCount: 1000,
          uniqueOpens: 300,
          clicks: 100,
        }),
        makeCampaign("c2", {
          status: "sent",
          recipientCount: 500,
          uniqueOpens: 200,
          clicks: 50,
        }),
        makeCampaign("c3", {
          status: "draft",
          recipientCount: 0,
          uniqueOpens: 0,
          clicks: 0,
        }),
      ];
      mockSanityFetch.mockResolvedValueOnce(campaigns);

      const { result } = renderHook(() => useSanityEmailCampaigns());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const summary = result.current.getSummary();
      expect(summary.totalCampaigns).toBe(3);
      expect(summary.totalSent).toBe(2);
      expect(summary.totalRecipients).toBe(1500);
      // avgOpenRate: (500 / 1500) * 100 = 33.3
      expect(summary.avgOpenRate).toBe(33.3);
      // avgClickRate: (150 / 500) * 100 = 30.0
      expect(summary.avgClickRate).toBe(30);
    });

    it("handles zero recipients for open rate", async () => {
      mockSanityFetch.mockResolvedValueOnce([
        makeCampaign("c1", { recipientCount: 0, uniqueOpens: 0, clicks: 0 }),
      ]);

      const { result } = renderHook(() => useSanityEmailCampaigns());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const summary = result.current.getSummary();
      expect(summary.avgOpenRate).toBe(0);
      expect(summary.avgClickRate).toBe(0);
    });

    it("handles empty campaign list", async () => {
      mockSanityFetch.mockResolvedValueOnce([]);

      const { result } = renderHook(() => useSanityEmailCampaigns());
      await waitFor(() => expect(result.current.loading).toBe(false));

      const summary = result.current.getSummary();
      expect(summary.totalCampaigns).toBe(0);
      expect(summary.totalSent).toBe(0);
      expect(summary.totalRecipients).toBe(0);
    });
  });

  describe("refetch", () => {
    it("re-fetches campaigns", async () => {
      mockSanityFetch.mockResolvedValue([]);

      const { result } = renderHook(() => useSanityEmailCampaigns());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        result.current.refetch();
      });

      expect(mockSanityFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
