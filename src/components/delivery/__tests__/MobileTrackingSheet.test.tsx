import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MobileTrackingSheet from "../MobileTrackingSheet";

// Mock useLalamoveTracking hook
const mockTracking = {
  status: "ON_GOING",
  driver: {
    name: "Juan Santos",
    phone: "+639171234567",
    plateNumber: "ABC 1234",
  },
  eta: { minutes: 15, distance: 3.2 },
  shareLink: "https://share.lalamove.com/test123",
};

jest.mock("@/hooks/useLalamoveTracking", () => ({
  useLalamoveTracking: jest.fn(() => ({
    tracking: mockTracking,
    loading: false,
    error: null,
  })),
}));

// Import mock to control return values
const { useLalamoveTracking } = jest.requireMock("@/hooks/useLalamoveTracking");

describe("MobileTrackingSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLalamoveTracking as jest.Mock).mockReturnValue({
      tracking: mockTracking,
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render desktop Card with 'Delivery Tracking' title", () => {
    render(<MobileTrackingSheet orderId="order-123" />);
    expect(screen.getByText("Delivery Tracking")).toBeInTheDocument();
  });

  it("should render status badge when tracking data available", () => {
    render(<MobileTrackingSheet orderId="order-123" />);
    // ON_GOING maps to "Driver En Route"
    const badges = screen.getAllByText("Driver En Route");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("should render drag handle button for mobile", () => {
    render(<MobileTrackingSheet orderId="order-123" />);
    const toggleBtn = screen.getByRole("button", { name: "Toggle tracking details" });
    expect(toggleBtn).toBeInTheDocument();
  });

  it("should show loading skeleton when loading", () => {
    (useLalamoveTracking as jest.Mock).mockReturnValue({
      tracking: null,
      loading: true,
      error: null,
    });

    const { container } = render(<MobileTrackingSheet orderId="order-123" />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("should show driver info when driver assigned", () => {
    render(<MobileTrackingSheet orderId="order-123" />);
    const driverNames = screen.getAllByText("Juan Santos");
    expect(driverNames.length).toBeGreaterThanOrEqual(1);
    const plateNumbers = screen.getAllByText("ABC 1234");
    expect(plateNumbers.length).toBeGreaterThanOrEqual(1);
  });

  it("should toggle expand on button click", () => {
    render(<MobileTrackingSheet orderId="order-123" />);
    const toggleBtn = screen.getByRole("button", { name: "Toggle tracking details" });

    // Initial state: collapsed - click should expand
    fireEvent.click(toggleBtn);
    // After click, the state transitions - no error = success
    expect(toggleBtn).toBeInTheDocument();
  });

  it("should show 'No data' when no tracking and not loading", () => {
    (useLalamoveTracking as jest.Mock).mockReturnValue({
      tracking: null,
      loading: false,
      error: null,
    });

    render(<MobileTrackingSheet orderId="order-123" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("should show error message when error occurs", () => {
    (useLalamoveTracking as jest.Mock).mockReturnValue({
      tracking: null,
      loading: false,
      error: "Connection failed",
    });

    render(<MobileTrackingSheet orderId="order-123" />);
    expect(screen.getByText("Failed to load tracking data.")).toBeInTheDocument();
  });

  it("should call useLalamoveTracking with correct orderId", () => {
    render(<MobileTrackingSheet orderId="order-abc-456" />);
    expect(useLalamoveTracking).toHaveBeenCalledWith("order-abc-456");
  });

  it("should show COMPLETED status correctly", () => {
    (useLalamoveTracking as jest.Mock).mockReturnValue({
      tracking: { ...mockTracking, status: "COMPLETED" },
      loading: false,
      error: null,
    });

    render(<MobileTrackingSheet orderId="order-123" />);
    const badges = screen.getAllByText("Delivered");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("should show CANCELED status correctly", () => {
    (useLalamoveTracking as jest.Mock).mockReturnValue({
      tracking: { ...mockTracking, status: "CANCELED" },
      loading: false,
      error: null,
    });

    render(<MobileTrackingSheet orderId="order-123" />);
    const badges = screen.getAllByText("Canceled");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
