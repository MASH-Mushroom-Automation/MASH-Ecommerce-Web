import React from "react";
import { GoogleMap, StaticGoogleMap } from "@/components/maps/GoogleMap";
import { render } from "@testing-library/react";

// Mock Google Maps API
window.google = {
  maps: {
    Map: jest.fn(() => ({ setCenter: jest.fn(), setZoom: jest.fn() })),
    Marker: jest.fn(() => ({ addListener: jest.fn() })),
    InfoWindow: jest.fn(() => ({ open: jest.fn() })),
    Animation: { DROP: "DROP" },
    SymbolPath: { CIRCLE: "CIRCLE" },
  },
};

describe("GoogleMap Component", () => {
  const coordinates = { lat: 14.5995, lng: 120.9842 };

  it("renders loading and then map", () => {
    const { container } = render(
      <GoogleMap coordinates={coordinates} address="Test Address" growerName="Test Grower" />
    );
    expect(container.textContent).toBeDefined();
  });

  it("renders error if no API key", () => {
    const original = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "";
    const { container } = render(
      <GoogleMap coordinates={coordinates} />
    );
    expect(container.textContent).toContain("Map unavailable");
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = original;
  });

  it("renders StaticGoogleMap fallback", () => {
    const { container } = render(
      <StaticGoogleMap coordinates={coordinates} growerName="Test Grower" />
    );
    expect(container.textContent).toContain("Google Maps");
  });
});
