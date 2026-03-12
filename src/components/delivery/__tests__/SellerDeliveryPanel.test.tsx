/**
 * SellerDeliveryPanel Component Tests
 * Tests real-time tracking display, driver info, share link, priority delivery, cancel delivery
 */
import React from "react";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
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

// ─── Mock toast ────────────────────────────────────────────────

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from "sonner";
const mockToastSuccess = toast.success as jest.Mock;
const mockToastError = toast.error as jest.Mock;

// ─── Mock AlertDialog to avoid portal/animation timing issues ──

jest.mock("@/components/ui/alert-dialog", () => {
  const React = require("react");
  return {
    AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>,
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogCancel: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children as React.ReactNode}</button>,
    AlertDialogAction: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children as React.ReactNode}</button>,
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

  describe("cancel delivery", () => {
    beforeEach(() => {
      mockToastSuccess.mockClear();
      mockToastError.mockClear();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("shows Cancel Delivery button when ASSIGNING_DRIVER", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Cancel Delivery")).toBeInTheDocument();
    });

    it("shows Cancel Delivery button when ON_GOING", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ON_GOING", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.getByText("Cancel Delivery")).toBeInTheDocument();
    });

    it("does not show Cancel Delivery button when PICKED_UP", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "PICKED_UP", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.queryByText("Cancel Delivery")).not.toBeInTheDocument();
    });

    it("does not show Cancel Delivery button when COMPLETED", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "COMPLETED", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(screen.queryByText("Cancel Delivery")).not.toBeInTheDocument();
    });

    it("shows confirmation dialog content with Cancel Delivery trigger", async () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      // With transparent mock, content is always rendered
      expect(screen.getByText("Cancel Delivery?")).toBeInTheDocument();
      expect(screen.getByText("Yes, Cancel Delivery")).toBeInTheDocument();
      expect(screen.getByText("Keep Delivery")).toBeInTheDocument();
    });

    it("shows cancellation fee warning when ON_GOING", () => {
      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ON_GOING", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);
      expect(
        screen.getByText(/Cancellation fees may apply/i)
      ).toBeInTheDocument();
    });

    it("calls DELETE /api/lalamove/order on confirm", async () => {
      const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, message: "Order cancelled successfully" }),
      } as Response);

      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);

      await act(async () => {
        fireEvent.click(screen.getByText("Yes, Cancel Delivery"));
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/lalamove/order?orderId=lala-123",
          { method: "DELETE" }
        );
      });

      fetchMock.mockRestore();
    });

    it("shows success toast on successful cancel", async () => {
      const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);

      await act(async () => {
        fireEvent.click(screen.getByText("Yes, Cancel Delivery"));
      });

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Delivery canceled successfully");
      });

      fetchMock.mockRestore();
    });

    it("shows error toast on cancel failure", async () => {
      const fetchMock = jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, message: "Cannot cancel" }),
      } as Response);

      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);

      await act(async () => {
        fireEvent.click(screen.getByText("Yes, Cancel Delivery"));
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Cannot cancel");
      });

      fetchMock.mockRestore();
    });

    it("shows error toast on network error", async () => {
      const fetchMock = jest.spyOn(global, "fetch").mockRejectedValueOnce(
        new Error("Network failure")
      );

      mockUseLalamoveTracking.mockReturnValue({
        tracking: { status: "ASSIGNING_DRIVER", orderId: "lala-123" },
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerDeliveryPanel orderId="order-1" />);

      await act(async () => {
        fireEvent.click(screen.getByText("Yes, Cancel Delivery"));
      });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Network failure");
      });

      fetchMock.mockRestore();
    });
  });
});
