import React from "react";
import StoreDetailPage from "@/app/stores/[slug]/page";
import { render } from "@testing-library/react";

jest.mock("@/lib/sanity/stores", () => ({ fetchStoreBySlug: jest.fn(async () => ({ name: "Test Store", imageUrl: "/test.png", storeType: "main", isOpenNow: true, isOpen24Hours: false, isFeatured: true, description: "desc", phone: "123", googleMapsUrl: "https://maps.google.com", whatsappUrl: "https://wa.me/123", operatingHours: { monday: "9am-5pm" }, servicesFormatted: ["Pickup"], pickupInstructions: "Go to counter", deliveryZones: ["Zone 1"], gallery: [{ url: "/img.png" }], growers: [], address: { street: "123 St", city: "City", state: "State", zipCode: "1000", country: "PH", landmark: "Near Mall" }, coordinates: { lat: 14.6, lng: 120.98 }, directionsUrl: "https://maps.google.com" } ) ) }));
jest.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: any) => <button {...props}>{children}</button> }));
jest.mock("@/components/ui/card", () => ({ Card: ({ children }: any) => <div>{children}</div>, CardContent: ({ children }: any) => <div>{children}</div>, CardHeader: ({ children }: any) => <div>{children}</div>, CardTitle: ({ children }: any) => <div>{children}</div> }));
jest.mock("@/components/ui/badge", () => ({ Badge: ({ children }: any) => <span>{children}</span> }));
jest.mock("@/components/ui/separator", () => ({ Separator: () => <div /> }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ href, children }: any) => <a href={href}>{children}</a> }));
jest.mock("next/image", () => ({ __esModule: true, default: (props: any) => <img {...props} /> }));
jest.mock("lucide-react", () => ({ MapPin: () => <span>pin</span>, Phone: () => <span>phone</span>, Mail: () => <span>mail</span>, Clock: () => <span>clock</span>, ChevronLeft: () => <span>chev</span>, Navigation: () => <span>nav</span>, MessageCircle: () => <span>msg</span>, CheckCircle: () => <span>check</span>, AlertCircle: () => <span>alert</span>, ExternalLink: () => <span>ext</span>, Calendar: () => <span>cal</span>, Package: () => <span>pkg</span>, Leaf: () => <span>leaf</span>, Star: () => <span>star</span>, Users: () => <span>users</span> }));

describe("StoreDetailPage", () => {
  it("renders without crashing (try/catch)", async () => {
    let error = null;
    try {
      const { container } = render(await StoreDetailPage({ params: Promise.resolve({ slug: "test-store" }) }));
      expect(container.textContent).toBeDefined();
    } catch (e) {
      error = e;
    }
    expect(error).toBeNull();
  });
});
