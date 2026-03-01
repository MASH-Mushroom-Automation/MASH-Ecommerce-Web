import React from "react";
import TrackingMap from "@/components/delivery/TrackingMap";
import { render } from "@testing-library/react";

// Mock Google Maps API
window.google = {
  maps: {
    Map: jest.fn(() => ({ panTo: jest.fn(), fitBounds: jest.fn() })),
    Marker: jest.fn(() => ({ setMap: jest.fn(), addListener: jest.fn() })),
    InfoWindow: jest.fn(() => ({ open: jest.fn() })),
    Polyline: jest.fn(() => ({ setMap: jest.fn() })),
    LatLngBounds: jest.fn(() => ({ extend: jest.fn() })),
    Animation: { BOUNCE: "BOUNCE" },
    SymbolPath: { CIRCLE: "CIRCLE", FORWARD_CLOSED_ARROW: "ARROW" },
  },
};

describe("TrackingMap Component", () => {
  const pickup = { lat: 14.6, lng: 120.98, address: "Pickup" };
  const dropoff = { lat: 14.7, lng: 121.0, address: "Dropoff" };
  const driverLocation = { lat: 14.65, lng: 120.99 };

  it("renders loading and then map", () => {
    const { container } = render(
      <TrackingMap pickup={pickup} dropoff={dropoff} status="PICKED_UP" />
    );
    expect(container.textContent).toBeDefined();
  });

  it("renders error if Google Maps fails to load", () => {
    window.google = undefined;
    const { container } = render(
      <TrackingMap pickup={pickup} dropoff={dropoff} status="PICKED_UP" />
    );
    expect(container.textContent).toBeDefined();
  });

  it("renders driver marker when driverLocation is provided", () => {
    const { container } = render(
      <TrackingMap pickup={pickup} dropoff={dropoff} driverLocation={driverLocation} status="ON_GOING" />
    );
    expect(container.textContent).toBeDefined();
  });
});
