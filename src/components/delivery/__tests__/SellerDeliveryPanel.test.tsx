/**
 * SellerDeliveryPanel Component Tests
 * Tests real-time tracking display, driver info, share link, priority delivery
 */
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import SellerDeliveryPanel from "../SellerDeliveryPanel";

// ─── Mock child components ─────────────────────────────────────

jest.mock("@/components/delivery/StatusTimeline", () => {
  return function MockStatusTimeline(props: { currentStatus: string }) {
    return <div data-testid="status-timeline">Timeline: {props.currentStatus}</div>;
  };
});

jest.mock("@/components/delivery/PriorityDelivery", () => {
  return function MockPriorityDelivery(props: { orderId?: string; currentTotal: number }) {
    return (
      <div data-testid="priority-delivery">
        Priority for {props.orderId} (fee: {props.currentTotal})
      </div>
    );
  };
});

// ─── Mock useLalamoveTracking ──────────────────────────────────

const mockUseLalamoveTracking = jest.fn();
jest.mock("@/hooks/useLalamoveTracking", () => ({
  useLalamoveTracking: (...args: unknown[]) => mockUseLalamoveTracking(...args),
}));

// ─── Setup ─────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLalamoveTracking.mockReturnValue({
    tracking: null,
    order: null,
    loading: false,
    error: null,
  });
});

// ─── Tests ─────────────────────────────────────────────────────

describe("SellerDeliveryPanel", () => {
  describe("loading state", () => {
    it("shows skeleton loader while loading", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: null,
        order: null,
        loading: true,
        error: null,
      });

      const { container } = render(
        <SellerDeliveryPanel orderId="order-1" />
      );
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error message", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: null,
        order: null,
        loading: false,
        error: "Permission denied",
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(
        screen.getByText("Failed to load delivery tracking.")
      ).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows no tracking data message", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: null,
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(
        screen.getByText("No delivery tracking data yet.")
      ).toBeInTheDocument();
    });
  });

  describe("ASSIGNING_DRIVER status", () => {
    it("shows Finding Driver badge", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Finding Driver")).toBeInTheDocument();
    });

    it("renders StatusTimeline with ASSIGNING_DRIVER", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Timeline: ASSIGNING_DRIVER")).toBeInTheDocument();
    });

    it("renders PriorityDelivery when ASSIGNING_DRIVER", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" deliveryFee={55} />);
      expect(screen.getByTestId("priority-delivery")).toBeInTheDocument();
      expect(screen.getByText("Priority for order-1 (fee: 55)")).toBeInTheDocument();
    });
  });

  describe("DRIVER_ASSIGNED / ON_GOING status with driver info", () => {
    it("shows driver name and plate number", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: {
          status: "ON_GOING",
          driver: {
            id: "d-1",
            name: "Juan Cruz",
            phone: "+639171234567",
            plateNumber: "ABC 1234",
          },
        },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
      expect(screen.getByText("ABC 1234")).toBeInTheDocument();
    });

    it("shows Call button with driver phone", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: {
          status: "ON_GOING",
          driver: {
            id: "d-1",
            name: "Juan Cruz",
            phone: "+639171234567",
            plateNumber: "ABC 1234",
          },
        },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Call")).toBeInTheDocument();
    });

    it("does not show PriorityDelivery when status is ON_GOING", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ON_GOING" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.queryByTestId("priority-delivery")).not.toBeInTheDocument();
    });
  });

  describe("share link", () => {
    it("renders Track on Lalamove button when shareLink present", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: {
          status: "ON_GOING",
          shareLink: "https://share.lalamove.com/abc",
        },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Track on Lalamove")).toBeInTheDocument();
    });

    it("does not render share link button when no shareLink", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ON_GOING" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.queryByText("Track on Lalamove")).not.toBeInTheDocument();
    });
  });

  describe("COMPLETED status", () => {
    it("shows Delivered badge", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "COMPLETED" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Delivered")).toBeInTheDocument();
    });

    it("does not show PriorityDelivery when COMPLETED", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "COMPLETED" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.queryByTestId("priority-delivery")).not.toBeInTheDocument();
    });
  });

  describe("CANCELED status", () => {
    it("shows Canceled badge", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "CANCELED" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Canceled")).toBeInTheDocument();
    });
  });

  describe("Lalamove Delivery title", () => {
    it("renders the section title", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ON_GOING" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Lalamove Delivery")).toBeInTheDocument();
    });
  });
});
