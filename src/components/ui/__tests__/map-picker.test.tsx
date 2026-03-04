/**
 * Tests for MapPicker component
 * Targets: src/components/ui/map-picker.tsx (11fn, 9br)
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, ...props }: any) => (
    <button disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));
jest.mock("@/components/ui/input", () => ({
  Input: React.forwardRef((props: any, ref: any) => <input ref={ref} {...props} />),
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));
jest.mock("lucide-react", () => ({
  MapPin: ({ className }: any) => <svg data-testid="map-pin" className={className} />,
  Search: () => <svg data-testid="search-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

import { MapPicker } from "../map-picker";

describe("MapPicker", () => {
  const mockOnLocationSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input and map area", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    expect(screen.getByPlaceholderText("Type address or location...")).toBeInTheDocument();
    expect(screen.getByText("Click to select location")).toBeInTheDocument();
  });

  it("shows No location selected by default", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    expect(screen.getByText("No location selected")).toBeInTheDocument();
  });

  it("Use Location button is disabled without selection", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    const useBtn = screen.getByText(/Use Location/).closest("button");
    expect(useBtn).toBeDisabled();
  });

  it("shows suggestions when search query > 2 chars", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    const input = screen.getByPlaceholderText("Type address or location...");
    fireEvent.change(input, { target: { value: "Mak" } });
    expect(screen.getAllByText(/San Lorenzo/).length).toBeGreaterThan(0);
  });

  it("hides suggestions for short query", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    const input = screen.getByPlaceholderText("Type address or location...");
    fireEvent.change(input, { target: { value: "Ma" } });
    expect(screen.queryByText(/San Lorenzo/)).not.toBeInTheDocument();
  });

  it("selects location from suggestion", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    const input = screen.getByPlaceholderText("Type address or location...");
    fireEvent.change(input, { target: { value: "Makati" } });
    fireEvent.click(screen.getAllByText(/San Lorenzo/)[0]);
    expect(screen.queryByText("No location selected")).not.toBeInTheDocument();
  });

  it("confirms selected location", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    const input = screen.getByPlaceholderText("Type address or location...");
    fireEvent.change(input, { target: { value: "Makati" } });
    fireEvent.click(screen.getAllByText(/San Lorenzo/)[0]);
    fireEvent.click(screen.getByText(/Use Location/).closest("button")!);
    expect(mockOnLocationSelect).toHaveBeenCalledWith(
      expect.objectContaining({ barangay: "San Lorenzo", city: "Makati City" })
    );
  });

  it("clears selection on Clear click", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    const input = screen.getByPlaceholderText("Type address or location...");
    fireEvent.change(input, { target: { value: "Makati" } });
    fireEvent.click(screen.getAllByText(/San Lorenzo/)[0]);
    fireEvent.click(screen.getByText(/Clear/).closest("button")!);
    expect(screen.getByText("No location selected")).toBeInTheDocument();
  });

  it("selects location on map click", () => {
    render(<MapPicker onLocationSelect={mockOnLocationSelect} />);
    const mapDiv = document.querySelector(".cursor-crosshair") as HTMLElement;
    Object.defineProperty(mapDiv, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 400, height: 200 }),
    });
    fireEvent.click(mapDiv, { clientX: 200, clientY: 100 });
    expect(screen.queryByText("No location selected")).not.toBeInTheDocument();
  });

  it("initializes with initial location", () => {
    render(
      <MapPicker
        onLocationSelect={mockOnLocationSelect}
        initialLocation={{ address: "Test", coordinates: { lat: 14.0, lng: 121.0 } }}
      />
    );
    const markers = document.querySelectorAll(".bg-accent.rounded-full");
    expect(markers.length).toBeGreaterThanOrEqual(1);
  });
});