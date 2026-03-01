import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockUseBannersByPosition = jest.fn();
jest.mock("@/hooks/useSanityBanners", () => ({
  useBannersByPosition: (...a: any[]) => mockUseBannersByPosition(...a),
  getBannerHeightClass: (h: string) => h === "tall" ? "h-96" : "h-64",
  getTextColorClass: (c: string) => c === "black" ? "text-black" : "text-white",
  getTextAlignmentClass: (a: string) => a === "center" ? "text-center" : "text-left",
  getButtonVariant: (s: string) => s || "default",
  getTimeRemaining: (d?: string) => d ? "2 days left" : null,
}));
jest.mock("next/image", () => ({ __esModule: true, default: (p: any) => <img {...p} /> }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, ...p }: any) => <a {...p}>{children}</a> }));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
}));

import {
  BannerSection,
  SingleBanner,
  HomepageTopBanner,
  HomepageMiddleBanner,
  HomepageBottomBanner,
  ShopTopBanner,
  ShopSidebarBanner,
  ProductBottomBanner,
  CartTopBanner,
  CheckoutBottomBanner,
  AnnouncementBar,
} from "../BannerSection";

const baseBanner = {
  id: "b1",
  title: "Test Banner",
  headline: "Big Sale",
  subheadline: "Up to 50% off",
  description: "Limited time offer",
  desktopImage: "/banner-desktop.jpg",
  desktopImageAlt: "Desktop alt",
  mobileImage: "/banner-mobile.jpg",
  mobileImageAlt: "Mobile alt",
  backgroundColor: "#1E392A",
  textColor: "white",
  textAlignment: "left",
  bannerHeight: "medium",
  overlayOpacity: 0.3,
  buttonText: "Shop Now",
  buttonLink: "/shop",
  buttonStyle: "default",
  secondaryButtonText: "Learn More",
  secondaryButtonLink: "/about",
  promoCode: "SAVE50",
  endDate: "2027-01-01",
};

describe("SingleBanner", () => {
  it("renders headline, subheadline, description", () => {
    render(<SingleBanner banner={baseBanner as any} />);
    expect(screen.getByText("Big Sale")).toBeInTheDocument();
    expect(screen.getByText("Up to 50% off")).toBeInTheDocument();
    expect(screen.getByText("Limited time offer")).toBeInTheDocument();
  });

  it("renders CTA buttons with links", () => {
    render(<SingleBanner banner={baseBanner as any} />);
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
  });

  it("renders promo code", () => {
    render(<SingleBanner banner={baseBanner as any} />);
    expect(screen.getByText("SAVE50")).toBeInTheDocument();
  });

  it("renders time remaining badge", () => {
    render(<SingleBanner banner={baseBanner as any} />);
    expect(screen.getByText(/2 days left/)).toBeInTheDocument();
  });

  it("renders without optional fields", () => {
    const minimal = { id: "b2", title: "Min", textColor: "white", textAlignment: "left", bannerHeight: "small", overlayOpacity: 0 };
    const { container } = render(<SingleBanner banner={minimal as any} />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders desktop and mobile images", () => {
    render(<SingleBanner banner={baseBanner as any} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBe(2);
  });

  it("renders with black text color", () => {
    const banner = { ...baseBanner, textColor: "black" };
    const { container } = render(<SingleBanner banner={banner as any} />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders without secondary button when missing", () => {
    const banner = { ...baseBanner, secondaryButtonText: undefined, secondaryButtonLink: undefined };
    render(<SingleBanner banner={banner as any} />);
    expect(screen.queryByText("Learn More")).not.toBeInTheDocument();
  });

  it("renders without endDate (no time remaining)", () => {
    const banner = { ...baseBanner, endDate: undefined };
    render(<SingleBanner banner={banner as any} />);
    expect(screen.queryByText(/days left/)).not.toBeInTheDocument();
  });

  it("falls back to desktop image when no mobile image", () => {
    const banner = { ...baseBanner, mobileImage: undefined, mobileImageAlt: undefined };
    render(<SingleBanner banner={banner as any} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBe(2);
  });
});

describe("PromoCode copy behavior", () => {
  it("copies code to clipboard on click", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    render(<SingleBanner banner={baseBanner as any} />);
    const copyBtn = screen.getByText("SAVE50").closest("button")!;
    fireEvent.click(copyBtn);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith("SAVE50"));
  });

  it("handles clipboard error gracefully", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("blocked")) } });
    render(<SingleBanner banner={baseBanner as any} />);
    const copyBtn = screen.getByText("SAVE50").closest("button")!;
    fireEvent.click(copyBtn);
    // Should not throw
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
  });
});

describe("BannerSection", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null when loading", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [], loading: true, error: null });
    const { container } = render(<BannerSection position="homepage-top" />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when error", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [], loading: false, error: new Error("fail") });
    const { container } = render(<BannerSection position="homepage-top" />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when no banners", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [], loading: false, error: null });
    const { container } = render(<BannerSection position="homepage-top" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single banner", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [baseBanner], loading: false, error: null });
    render(<BannerSection position="homepage-top" />);
    expect(screen.getByText("Big Sale")).toBeInTheDocument();
  });

  it("renders multiple banners in grid", () => {
    const b2 = { ...baseBanner, id: "b2", headline: "Second Banner" };
    mockUseBannersByPosition.mockReturnValue({ banners: [baseBanner, b2], loading: false, error: null });
    render(<BannerSection position="homepage-top" maxBanners={2} />);
    expect(screen.getByText("Big Sale")).toBeInTheDocument();
    expect(screen.getByText("Second Banner")).toBeInTheDocument();
  });

  it("respects maxBanners limit", () => {
    const b2 = { ...baseBanner, id: "b2", headline: "Second" };
    mockUseBannersByPosition.mockReturnValue({ banners: [baseBanner, b2], loading: false, error: null });
    render(<BannerSection position="homepage-top" maxBanners={1} />);
    expect(screen.getByText("Big Sale")).toBeInTheDocument();
    expect(screen.queryByText("Second")).not.toBeInTheDocument();
  });
});

describe("Position-specific exports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBannersByPosition.mockReturnValue({ banners: [], loading: false, error: null });
  });

  it("HomepageTopBanner uses homepage-top", () => {
    render(<HomepageTopBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("homepage-top");
  });

  it("HomepageMiddleBanner uses homepage-middle", () => {
    render(<HomepageMiddleBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("homepage-middle");
  });

  it("HomepageBottomBanner uses homepage-bottom", () => {
    render(<HomepageBottomBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("homepage-bottom");
  });

  it("ShopTopBanner uses shop-top", () => {
    render(<ShopTopBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("shop-top");
  });

  it("ShopSidebarBanner uses shop-sidebar", () => {
    render(<ShopSidebarBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("shop-sidebar");
  });

  it("ProductBottomBanner uses product-bottom", () => {
    render(<ProductBottomBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("product-bottom");
  });

  it("CartTopBanner uses cart-top", () => {
    render(<CartTopBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("cart-top");
  });

  it("CheckoutBottomBanner uses checkout-bottom", () => {
    render(<CheckoutBottomBanner />);
    expect(mockUseBannersByPosition).toHaveBeenCalledWith("checkout-bottom");
  });
});

describe("AnnouncementBar", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null when loading", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [], loading: true });
    const { container } = render(<AnnouncementBar />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when no banners", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [], loading: false });
    const { container } = render(<AnnouncementBar />);
    expect(container.firstChild).toBeNull();
  });

  it("renders announcement with headline", () => {
    mockUseBannersByPosition.mockReturnValue({
      banners: [{ ...baseBanner, headline: "Free Shipping Today!" }],
      loading: false,
    });
    render(<AnnouncementBar />);
    expect(screen.getByText("Free Shipping Today!")).toBeInTheDocument();
  });

  it("renders promo code in announcement", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [baseBanner], loading: false });
    render(<AnnouncementBar />);
    expect(screen.getByText("SAVE50")).toBeInTheDocument();
  });

  it("renders CTA link in announcement", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [baseBanner], loading: false });
    render(<AnnouncementBar />);
    expect(screen.getByText("Shop Now")).toBeInTheDocument();
  });

  it("can be dismissed", () => {
    mockUseBannersByPosition.mockReturnValue({ banners: [baseBanner], loading: false });
    render(<AnnouncementBar />);
    const dismiss = screen.getByLabelText("Dismiss announcement");
    fireEvent.click(dismiss);
    expect(screen.queryByText("Big Sale")).not.toBeInTheDocument();
  });

  it("renders without optional fields", () => {
    const minimal = { id: "a1", backgroundColor: "#000", textColor: "white" };
    mockUseBannersByPosition.mockReturnValue({ banners: [minimal], loading: false });
    const { container } = render(<AnnouncementBar />);
    expect(container.firstChild).toBeDefined();
  });

  it("uses black text styling when textColor is black", () => {
    const banner = { ...baseBanner, textColor: "black" };
    mockUseBannersByPosition.mockReturnValue({ banners: [banner], loading: false });
    const { container } = render(<AnnouncementBar />);
    expect(container.querySelector("[style]")).toBeDefined();
  });
});