/**
 * Stores Page render tests (Server Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock fetchStores from sanity/stores
const mockFetchStores = jest.fn();
jest.mock("@/lib/sanity/stores", () => ({
  fetchStores: () => mockFetchStores(),
  // Re-export type (not actually used at runtime but keeps TS happy)
  TransformedStore: undefined,
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={String(props.src || "")}
      alt={String(props.alt || "")}
      data-testid="next-image"
    />
  ),
}));

import StoresPage from "../page";

const mockStore = {
  id: "store-1",
  name: "MASH Main Store",
  slug: "mash-main",
  description: "Our flagship store for fresh mushrooms.",
  storeType: "main",
  imageUrl: "https://example.com/store.jpg",
  imageAlt: "MASH Main Store",
  isOpenNow: true,
  isOpen24Hours: false,
  address: { full: "123 Mushroom Ave, Manila" },
  phone: "09171234567",
  operatingHours: { today: "9:00 AM - 5:00 PM" },
  servicesFormatted: ["In-store shopping", "Pickup", "Delivery", "Consultation"],
  googleMapsUrl: "https://maps.google.com/test",
};

const mockPickup = {
  ...mockStore,
  id: "pickup-1",
  name: "MASH Pickup Point",
  slug: "mash-pickup",
  storeType: "pickup",
  imageUrl: null,
  isOpenNow: false,
  isOpen24Hours: false,
  address: { full: "456 Pickup St, Manila" },
  servicesFormatted: ["Pickup"],
  googleMapsUrl: null,
};

const mockPartner = {
  ...mockStore,
  id: "partner-1",
  name: "Partner Store A",
  slug: "partner-a",
  storeType: "partner",
  isOpen24Hours: true,
  servicesFormatted: [],
  googleMapsUrl: null,
};

describe("StoresPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no stores", async () => {
    mockFetchStores.mockResolvedValue([]);
    const Page = await StoresPage();
    render(Page);
    expect(screen.getByText("No Stores Available")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /store locations/i })
    ).toBeInTheDocument();
  });

  it("renders stores with stats and sections", async () => {
    mockFetchStores.mockResolvedValue([mockStore, mockPickup, mockPartner]);
    const Page = await StoresPage();
    render(Page);

    // Header
    expect(
      screen.getByRole("heading", { name: /store locations/i })
    ).toBeInTheDocument();

    // Stats
    expect(screen.getByText("3")).toBeInTheDocument(); // Total
    expect(screen.getByText("Total Locations")).toBeInTheDocument();

    // Store names
    expect(screen.getByText("MASH Main Store")).toBeInTheDocument();
    expect(screen.getByText("MASH Pickup Point")).toBeInTheDocument();
    expect(screen.getByText("Partner Store A")).toBeInTheDocument();

    // Section headings
    expect(
      screen.getByRole("heading", { name: /main stores/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /pickup points/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /partner stores/i })
    ).toBeInTheDocument();
  });

  it("renders store card details", async () => {
    mockFetchStores.mockResolvedValue([mockStore]);
    const Page = await StoresPage();
    render(Page);

    expect(screen.getByText("Our flagship store for fresh mushrooms.")).toBeInTheDocument();
    expect(screen.getByText("123 Mushroom Ave, Manila")).toBeInTheDocument();
    expect(screen.getByText(/09171234567/)).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
    expect(screen.getByText("Open Now")).toBeInTheDocument();
    // Services truncation: 4 services, 3 shown + "+1 more"
    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("renders 24h badge for 24-hour stores", async () => {
    mockFetchStores.mockResolvedValue([mockPartner]);
    const Page = await StoresPage();
    render(Page);
    expect(screen.getByText("Open 24 Hours")).toBeInTheDocument();
  });

  it("renders closed badge for closed stores", async () => {
    mockFetchStores.mockResolvedValue([mockPickup]);
    const Page = await StoresPage();
    render(Page);
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("renders CTA section with delivery message", async () => {
    mockFetchStores.mockResolvedValue([mockStore]);
    const Page = await StoresPage();
    render(Page);
    expect(
      screen.getByRole("heading", { name: /can't visit\? we deliver!/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Shop Online")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
  });
});
