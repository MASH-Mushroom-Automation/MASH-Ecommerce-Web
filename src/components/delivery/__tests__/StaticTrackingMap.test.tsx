import React from "react";
import { render, screen } from "@testing-library/react";
import StaticTrackingMap from "../StaticTrackingMap";

const defaultProps = {
  pickup: { lat: 14.5547, lng: 121.0244, address: "Manila Pickup" },
  dropoff: { lat: 14.5995, lng: 120.9842, address: "Manila Delivery" },
  status: "ON_GOING",
};

describe("StaticTrackingMap", () => {
  it("should render pickup marker A", () => {
    render(<StaticTrackingMap {...defaultProps} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should render dropoff marker B", () => {
    render(<StaticTrackingMap {...defaultProps} />);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should render pickup and dropoff addresses", () => {
    render(<StaticTrackingMap {...defaultProps} />);
    expect(screen.getByText("Manila Pickup")).toBeInTheDocument();
    expect(screen.getByText("Manila Delivery")).toBeInTheDocument();
  });

  it("should render default labels when addresses not provided", () => {
    render(
      <StaticTrackingMap
        pickup={{ lat: 14.5, lng: 121.0 }}
        dropoff={{ lat: 14.6, lng: 121.1 }}
        status="ASSIGNING_DRIVER"
      />
    );
    expect(screen.getByText("Pickup")).toBeInTheDocument();
    expect(screen.getByText("Delivery")).toBeInTheDocument();
  });

  it("should render driver marker when driverLocation provided", () => {
    render(
      <StaticTrackingMap
        {...defaultProps}
        driverLocation={{ lat: 14.58, lng: 121.0 }}
      />
    );
    const driverElements = screen.getAllByText("Driver");
    expect(driverElements.length).toBeGreaterThanOrEqual(1);
  });

  it("should not render driver marker when driverLocation undefined", () => {
    render(<StaticTrackingMap {...defaultProps} />);
    expect(screen.queryByText("Driver")).not.toBeInTheDocument();
  });

  it("should show legend with Pickup (A) and Delivery (B)", () => {
    render(<StaticTrackingMap {...defaultProps} />);
    expect(screen.getByText("Pickup (A)")).toBeInTheDocument();
    expect(screen.getByText("Delivery (B)")).toBeInTheDocument();
  });

  it("should show Driver in legend when driver marker present", () => {
    render(
      <StaticTrackingMap
        {...defaultProps}
        driverLocation={{ lat: 14.58, lng: 121.0 }}
      />
    );
    // Legend has "Driver" entry separate from the marker label
    const driverTexts = screen.getAllByText("Driver");
    expect(driverTexts.length).toBeGreaterThanOrEqual(2); // marker label + legend
  });

  it("should render 'Simplified Map View' note", () => {
    render(<StaticTrackingMap {...defaultProps} />);
    expect(screen.getByText("Simplified Map View")).toBeInTheDocument();
  });

  it("should render driver marker with animate-pulse for active statuses", () => {
    const { container } = render(
      <StaticTrackingMap
        {...defaultProps}
        status="ON_GOING"
        driverLocation={{ lat: 14.58, lng: 121.0 }}
      />
    );
    const pulsing = container.querySelector(".animate-pulse");
    expect(pulsing).toBeInTheDocument();
  });

  it("should not animate driver marker for COMPLETED status", () => {
    const { container } = render(
      <StaticTrackingMap
        {...defaultProps}
        status="COMPLETED"
        driverLocation={{ lat: 14.58, lng: 121.0 }}
      />
    );
    // The blue driver circle should NOT have animate-pulse
    const blueCircle = container.querySelector(".bg-blue-600");
    expect(blueCircle?.classList.contains("animate-pulse")).toBe(false);
  });

  it("should render SVG route line between markers", () => {
    const { container } = render(<StaticTrackingMap {...defaultProps} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const line = svg?.querySelector("line");
    expect(line).toBeInTheDocument();
    expect(line?.getAttribute("stroke-dasharray")).toBe("6 4");
  });
});
