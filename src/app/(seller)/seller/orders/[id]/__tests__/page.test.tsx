/**
 * @jest-environment jsdom
 *
 * Seller Order Detail Page Unit Tests
 *
 * Tests for SellerOrderDetailPage component which displays a single order's details
 * and provides seller actions (approve, reject, update status).
 *
 * Coverage:
 * - Loading state (spinner)
 * - Error state (order not found)
 * - Order info rendering (ID, date, status badge)
 * - Customer information display (name, email, phone)
 * - Items list with product names, quantities, prices
 * - Order totals (subtotal, delivery fee, total)
 * - Delivery address display (lalamove orders)
 * - Status badge with correct config
 * - Action buttons per status (approve, reject, processing, shipped, delivered, completed)
 * - Order timeline / status history rendering
 * - Payment information section
 * - Back button navigation
 * - Status transition flows and toast feedback
 * - Pickup order handling
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SellerOrderDetailPage from "../page";
import { useFirebaseOrder } from "@/hooks/useFirebaseOrders";
import { FirebaseOrdersService } from "@/lib/firebase/orders";
import { toast } from "sonner";

// Per-file context mocks
jest.mock("@/hooks/useFirebaseOrders", () => ({
  useFirebaseOrder: jest.fn(() => ({
    order: { id: "order123", status: "PENDING", items: [], createdAt: Date.now() },
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "seller1" }, isAuthenticated: true }),
}));

describe("SellerOrderDetailPage smoke test", () => {
  it("renders without crashing", () => {
    let container;
    try {
      const result = render(<SellerOrderDetailPage />);
      container = result.container;
    } catch (e) {
      container = undefined;
    }
    expect(container).toBeDefined();
  });
});

// ---- Mocks ----

jest.mock("@/hooks/useFirebaseOrders", () => ({
  useFirebaseOrder: jest.fn(),
}));

jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    updateOrderStatus: jest.fn().mockResolvedValue(undefined),
    rejectOrder: jest.fn().mockResolvedValue(undefined),
    listenToOrder: jest.fn(() => jest.fn()),
    updateLalamoveTracking: jest.fn().mockResolvedValue(undefined),
    subscribeToOrder: jest.fn(() => jest.fn()),
  },
}));

jest.mock("@/lib/lalamove/vehicle-types", () => ({
  LALAMOVE_VEHICLES: [
    {
      id: "motorcycle",
      name: "Motorcycle",
      description: "Small packages",
      image: "🏍️",
      baseFare: 60,
      pricePerKm: 15,
      addStopFee: 20,
      weightLimit: 20,
      sizeLimit: "40x40x40cm",
      surcharge: "Night surcharge applies",
    },
    {
      id: "sedan",
      name: "Sedan",
      description: "Medium packages",
      image: "🚗",
      baseFare: 150,
      pricePerKm: 25,
      addStopFee: 40,
      weightLimit: 100,
      sizeLimit: "Trunk-sized",
      surcharge: "Holiday surcharge may apply",
    },
  ],
  calculateEstimate: jest.fn(() => 250),
}));

jest.mock("@/components/seller/LalamoveTrackingTimeline", () => ({
  __esModule: true,
  default: ({ tracking, onRefresh }: any) => (
    <div data-testid="lalamove-tracking-timeline">
      <span>Tracking Status: {tracking?.status}</span>
      <button onClick={onRefresh}>Refresh Tracking</button>
    </div>
  ),
}));

jest.mock("@/components/orders/OrderRejectionModal", () => ({
  OrderRejectionModal: ({ open, onClose, onConfirm, orderNumber, loading }: any) =>
    open ? (
      <div data-testid="rejection-modal">
        <span>Reject Order #{orderNumber}</span>
        <button onClick={() => onConfirm("Out of Stock")} data-testid="confirm-reject">
          Confirm Reject
        </button>
        <button onClick={onClose} data-testid="cancel-reject">
          Cancel
        </button>
      </div>
    ) : null,
}));

jest.mock("date-fns", () => ({
  format: jest.fn((date: any, formatStr: string) => "Jan 15, 2026 at 02:30 PM"),
}));

// ---- Helpers ----

const mockPush = jest.fn();
const mockUseFirebaseOrder = useFirebaseOrder as jest.Mock;
const mockUpdateOrderStatus = FirebaseOrdersService.updateOrderStatus as jest.Mock;
const mockRejectOrder = FirebaseOrdersService.rejectOrder as jest.Mock;

// Re-mock next/navigation at file-level so we control the returned values
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  usePathname: jest.fn(() => "/seller/orders/order-abc-123"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useParams: mockUseParams, useRouter: mockUseRouter } = require("next/navigation");

// Mock Google Maps on window to prevent initMap crashes
const mockGoogleMaps = {
  maps: {
    Map: jest.fn().mockImplementation(() => ({
      panTo: jest.fn(),
      setCenter: jest.fn(),
    })),
    Marker: jest.fn().mockImplementation(() => ({
      setPosition: jest.fn(),
      setMap: jest.fn(),
    })),
    DirectionsService: jest.fn().mockImplementation(() => ({
      route: jest.fn(),
    })),
    DirectionsRenderer: jest.fn().mockImplementation(() => ({
      setDirections: jest.fn(),
      setMap: jest.fn(),
    })),
    SymbolPath: { CIRCLE: 0 },
    TravelMode: { DRIVING: "DRIVING" },
    Animation: { DROP: 1 },
  },
};

function createTimestamp(dateStr: string = "2026-01-15T14:30:00Z") {
  const date = new Date(dateStr);
  return {
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  };
}

function createMockOrder(overrides: Record<string, any> = {}) {
  return {
    id: "order-abc-123",
    orderNumber: "ORD-2026-001",
    userId: "user-001",
    userEmail: "juan@example.com",
    userName: "Juan Dela Cruz",
    userPhone: "+639171234567",
    items: [
      {
        productId: "prod-001",
        name: "Oyster Mushrooms",
        price: 150,
        quantity: 2,
        image: "/images/oyster.jpg",
        grower: "MASH Farm",
      },
      {
        productId: "prod-002",
        name: "Shiitake Mushrooms",
        price: 200,
        quantity: 1,
        image: "/images/shiitake.jpg",
        grower: "MASH Farm",
      },
    ],
    subtotal: 500,
    tax: 0,
    deliveryFee: 150,
    total: 650,
    deliveryMethod: "lalamove" as const,
    deliveryAddress: {
      address: "123 Main St, Quezon City",
      lat: 14.68,
      lng: 121.05,
      name: "Juan Dela Cruz",
      phone: "+639171234567",
    },
    paymentMethod: "cod" as const,
    paymentStatus: "pending" as const,
    status: "pending_approval",
    statusHistory: [
      {
        status: "pending_approval",
        timestamp: createTimestamp("2026-01-15T14:30:00Z"),
        updatedBy: "system",
        note: "Order placed by customer",
      },
    ],
    notes: "",
    createdAt: createTimestamp("2026-01-15T14:30:00Z"),
    updatedAt: createTimestamp("2026-01-15T14:30:00Z"),
    ...overrides,
  };
}

// ---- Setup ----

beforeEach(() => {
  jest.clearAllMocks();

  // Set up Google Maps mock on window
  (window as any).google = mockGoogleMaps;

  mockUseParams.mockReturnValue({ id: "order-abc-123" });
  mockUseRouter.mockReturnValue({ push: mockPush, refresh: jest.fn(), back: jest.fn() });

  // Default: loaded order
  mockUseFirebaseOrder.mockReturnValue({
    order: createMockOrder(),
    loading: false,
    error: null,
  });

  // Global auth mock - seller user
  (global as any).__mockUseAuth.mockReturnValue({
    user: { id: "seller-001", email: "seller@mash.com", displayName: "Admin" },
    isAuthenticated: true,
    loading: false,
  });
});

// ---- Tests ----

describe("SellerOrderDetailPage", () => {
  // 1. Loading state
  describe("Loading State", () => {
    it("shows a loading spinner when order is loading", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: null,
        loading: true,
        error: null,
      });

      const { container } = render(<SellerOrderDetailPage />);
      // The component renders Loader2 with animate-spin class
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("does not render order content while loading", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: null,
        loading: true,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.queryByText("Order Details")).not.toBeInTheDocument();
      expect(screen.queryByText("Order Items")).not.toBeInTheDocument();
    });
  });

  // 2. Error state
  describe("Error State", () => {
    it("shows error card when order is not found (null order)", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: null,
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order not found")).toBeInTheDocument();
      expect(
        screen.getByText("The order you're looking for doesn't exist.")
      ).toBeInTheDocument();
    });

    it("displays custom error message when error string is provided", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: null,
        loading: false,
        error: "Permission denied",
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order not found")).toBeInTheDocument();
      expect(screen.getByText("Permission denied")).toBeInTheDocument();
    });

    it("shows Back to Orders button on error that navigates correctly", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: null,
        loading: false,
        error: "Not found",
      });

      render(<SellerOrderDetailPage />);
      const backBtn = screen.getByText("Back to Orders");
      fireEvent.click(backBtn);
      expect(mockPush).toHaveBeenCalledWith("/seller/orders");
    });
  });

  // 3. Order info rendering
  describe("Order Info Rendering", () => {
    it("renders the order details heading", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order Details")).toBeInTheDocument();
    });

    it("displays the order ID", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order #order-abc-123")).toBeInTheDocument();
    });

    it("shows the order ID in the Order Information card", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order Information")).toBeInTheDocument();
      // The order ID is rendered in a font-mono element
      const monoId = screen.getByText("order-abc-123");
      expect(monoId).toBeInTheDocument();
    });

    it("displays formatted order date (Placed On)", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Placed On")).toBeInTheDocument();
      // date-fns format is mocked to return this string
      expect(screen.getAllByText("Jan 15, 2026 at 02:30 PM").length).toBeGreaterThan(0);
    });
  });

  // 4. Customer information
  describe("Customer Information", () => {
    it("renders the Customer Information card header", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Customer Information")).toBeInTheDocument();
    });

    it("displays customer name", () => {
      render(<SellerOrderDetailPage />);
      // Customer name appears in customer info section
      const nameElements = screen.getAllByText("Juan Dela Cruz");
      expect(nameElements.length).toBeGreaterThan(0);
    });

    it("displays customer email as a mailto link", () => {
      render(<SellerOrderDetailPage />);
      const emailLink = screen.getByText("juan@example.com");
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.closest("a")).toHaveAttribute("href", "mailto:juan@example.com");
    });

    it("displays customer phone as a tel link", () => {
      render(<SellerOrderDetailPage />);
      const phoneLinks = screen.getAllByText("+639171234567");
      const telLink = phoneLinks.find((el) => el.closest("a")?.getAttribute("href") === "tel:+639171234567");
      expect(telLink).toBeDefined();
    });

    it("hides phone section when userPhone is empty", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ userPhone: "" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      // The phone section is conditionally rendered: {order.userPhone && (...)}
      // In the Customer Information card on the right, Phone label appears only if userPhone exists
      const customerInfoCard = screen.getByText("Customer Information").closest("[class]");
      // We verify that the phone link is NOT present
      const allPhoneTexts = screen.queryAllByText("+639171234567");
      expect(allPhoneTexts.length).toBe(0);
    });
  });

  // 5. Items list
  describe("Order Items", () => {
    it("renders the Order Items card header", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order Items")).toBeInTheDocument();
    });

    it("displays each item name", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Oyster Mushrooms")).toBeInTheDocument();
      expect(screen.getByText("Shiitake Mushrooms")).toBeInTheDocument();
    });

    it("displays item quantities", () => {
      render(<SellerOrderDetailPage />);
      // Quantities rendered as text: "2" and "1"
      const qty2 = screen.getAllByText("2");
      expect(qty2.length).toBeGreaterThan(0);
    });

    it("displays item prices formatted with peso sign", () => {
      render(<SellerOrderDetailPage />);
      // ₱150 appears in item price and delivery fee, ₱200 appears in item price and item total
      const prices150 = screen.getAllByText("₱150");
      expect(prices150.length).toBeGreaterThanOrEqual(1);
      const prices200 = screen.getAllByText("₱200");
      expect(prices200.length).toBeGreaterThanOrEqual(1);
    });

    it("displays per-item total (price * quantity)", () => {
      render(<SellerOrderDetailPage />);
      // Oyster: 150 * 2 = 300
      expect(screen.getByText("₱300")).toBeInTheDocument();
      // Shiitake: 200 * 1 = 200 (also appears as item price)
      const prices200 = screen.getAllByText("₱200");
      expect(prices200.length).toBeGreaterThanOrEqual(1);
    });

    it("renders item images with alt text", () => {
      render(<SellerOrderDetailPage />);
      const images = screen.getAllByRole("img");
      const oysterImg = images.find((img) => img.getAttribute("alt") === "Oyster Mushrooms");
      expect(oysterImg).toBeDefined();
      expect(oysterImg).toHaveAttribute("src", "/images/oyster.jpg");
    });
  });

  // 6. Order totals
  describe("Order Totals", () => {
    it("displays the subtotal", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Subtotal")).toBeInTheDocument();
      expect(screen.getByText("₱500")).toBeInTheDocument();
    });

    it("displays the delivery fee when > 0", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Delivery Fee")).toBeInTheDocument();
      // ₱150 appears for both item price and delivery fee
      const prices150 = screen.getAllByText("₱150");
      expect(prices150.length).toBeGreaterThanOrEqual(2);
    });

    it("hides delivery fee row when fee is 0", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ deliveryFee: 0, total: 500 }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.queryByText("Delivery Fee")).not.toBeInTheDocument();
    });

    it("displays the order total", () => {
      render(<SellerOrderDetailPage />);
      // "Total" appears multiple times (item totals + order total), use getAllByText
      const totalElements = screen.getAllByText("Total");
      expect(totalElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("₱650")).toBeInTheDocument();
    });
  });

  // 7. Delivery address (lalamove)
  describe("Delivery Address", () => {
    it("renders Lalamove Delivery card for lalamove orders", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Lalamove Delivery")).toBeInTheDocument();
    });

    it("displays the delivery address text", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("123 Main St, Quezon City")).toBeInTheDocument();
    });

    it("displays the MASH pickup location", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("MASH Farm, Quezon City, Metro Manila")).toBeInTheDocument();
    });

    it("does not render Lalamove Delivery card for pickup orders", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          deliveryMethod: "pickup",
          deliveryAddress: undefined,
          deliveryFee: 0,
          total: 500,
          pickupLocation: { id: "loc-1", name: "MASH Farm", address: "Farm Lane, QC" },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.queryByText("Lalamove Delivery")).not.toBeInTheDocument();
      expect(screen.getByText("Customer Pickup Instructions")).toBeInTheDocument();
    });
  });

  // 8. Status badge
  describe("Status Badge", () => {
    it("renders Pending Approval badge for pending_approval status", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    });

    it("renders Approved badge for approved status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "approved" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("renders Rejected badge for rejected status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "rejected" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("renders Delivered badge for delivered status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "delivered" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Delivered")).toBeInTheDocument();
    });
  });

  // 9. Action buttons per status
  describe("Action Buttons", () => {
    it("shows Approve and Reject buttons for pending_approval status", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Approve Order")).toBeInTheDocument();
      expect(screen.getByText("Reject Order")).toBeInTheDocument();
    });

    it("shows Mark as Processing button for approved status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "approved" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Mark as Processing")).toBeInTheDocument();
    });

    it("shows Mark as Shipped button for processing + lalamove orders", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "processing", deliveryMethod: "lalamove" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Mark as Shipped")).toBeInTheDocument();
    });

    it("shows Ready for Pickup button for processing + pickup orders", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "processing",
          deliveryMethod: "pickup",
          deliveryAddress: undefined,
          deliveryFee: 0,
          total: 500,
          pickupLocation: { id: "loc-1", name: "MASH Farm", address: "Farm Ln" },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Ready for Pickup")).toBeInTheDocument();
    });

    it("shows Mark as Delivered button for shipped status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "shipped" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Mark as Delivered")).toBeInTheDocument();
    });

    it("shows Mark as Delivered button for ready_for_pickup status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "ready_for_pickup" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Mark as Delivered")).toBeInTheDocument();
    });

    it("shows Complete Order button for delivered status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "delivered" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Complete Order")).toBeInTheDocument();
    });

    it("shows no action buttons for completed status", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "completed" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.queryByText("Approve Order")).not.toBeInTheDocument();
      expect(screen.queryByText("Mark as Processing")).not.toBeInTheDocument();
      expect(screen.queryByText("Complete Order")).not.toBeInTheDocument();
    });
  });

  // 10. Order timeline
  describe("Order Timeline", () => {
    it("renders the Order Timeline card header", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order Timeline")).toBeInTheDocument();
    });

    it("displays status history entries", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          statusHistory: [
            {
              status: "pending_approval",
              timestamp: createTimestamp("2026-01-15T14:30:00Z"),
              updatedBy: "system",
              note: "Order placed by customer",
            },
            {
              status: "approved",
              timestamp: createTimestamp("2026-01-15T15:00:00Z"),
              updatedBy: "seller-001",
              note: "Approved by seller",
            },
          ],
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("PENDING APPROVAL")).toBeInTheDocument();
      expect(screen.getByText("APPROVED")).toBeInTheDocument();
    });

    it("displays timeline notes", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Order placed by customer")).toBeInTheDocument();
    });

    it("shows 'No timeline available' when statusHistory is empty", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ statusHistory: [] }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("No timeline available")).toBeInTheDocument();
    });
  });

  // 11. Payment information
  describe("Payment Information", () => {
    it("renders payment method", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Payment")).toBeInTheDocument();
      // Payment method is rendered with .replace("_", " ") and CSS uppercase
      expect(screen.getByText("cod")).toBeInTheDocument();
    });

    it("renders payment status as badge", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("pending")).toBeInTheDocument();
    });

    it("shows paid badge with correct variant for paid orders", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ paymentStatus: "paid" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("paid")).toBeInTheDocument();
    });
  });

  // 12. Back button navigation
  describe("Back Button", () => {
    it("navigates back to seller orders when header back button is clicked", () => {
      render(<SellerOrderDetailPage />);
      // The header has a ghost button with ArrowLeft icon
      // Find the button that's NOT inside the error card (it's the first one in the header)
      const buttons = screen.getAllByRole("button");
      // The first icon-only ghost button is the back button in the header
      const backButton = buttons[0];
      fireEvent.click(backButton);
      expect(mockPush).toHaveBeenCalledWith("/seller/orders");
    });
  });

  // 13. Status transition flows
  describe("Status Transitions", () => {
    it("calls updateOrderStatus with 'approved' when Approve Order is clicked", async () => {
      render(<SellerOrderDetailPage />);

      const approveBtn = screen.getByText("Approve Order");
      await act(async () => {
        fireEvent.click(approveBtn);
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
          "order-abc-123",
          "approved",
          "seller-001"
        );
      });

      expect(toast.success).toHaveBeenCalledWith("Order approved successfully");
    });

    it("opens rejection modal when Reject Order is clicked", () => {
      render(<SellerOrderDetailPage />);

      fireEvent.click(screen.getByText("Reject Order"));
      expect(screen.getByTestId("rejection-modal")).toBeInTheDocument();
      expect(screen.getByText("Reject Order #ORD-2026-001")).toBeInTheDocument();
    });

    it("calls rejectOrder when rejection is confirmed through modal", async () => {
      render(<SellerOrderDetailPage />);

      fireEvent.click(screen.getByText("Reject Order"));
      await act(async () => {
        fireEvent.click(screen.getByTestId("confirm-reject"));
      });

      await waitFor(() => {
        expect(mockRejectOrder).toHaveBeenCalledWith(
          "order-abc-123",
          "seller-001",
          "Out of Stock"
        );
      });

      expect(toast.success).toHaveBeenCalledWith("Order rejected");
    });

    it("shows error toast when approve fails", async () => {
      mockUpdateOrderStatus.mockRejectedValueOnce(new Error("Network error"));

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Approve Order"));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to approve order");
      });
    });

    it("calls updateOrderStatus for Mark as Processing transition", async () => {
      // Use a pickup order to avoid Lalamove quotation check for processing
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "pickup",
          deliveryAddress: undefined,
          deliveryFee: 0,
          total: 500,
          pickupLocation: { id: "loc-1", name: "MASH Farm", address: "QC" },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
          "order-abc-123",
          "processing",
          "seller-001"
        );
      });
    });

    it("calls updateOrderStatus with 'delivered' for Mark as Delivered", async () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "shipped" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Delivered"));
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
          "order-abc-123",
          "delivered",
          "seller-001"
        );
      });
    });

    it("calls updateOrderStatus with 'completed' for Complete Order", async () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "delivered" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Complete Order"));
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
          "order-abc-123",
          "completed",
          "seller-001"
        );
      });
    });

    it("shows success toast with formatted status after status update", async () => {
      // Use pickup order to avoid Lalamove quotation check
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "pickup",
          deliveryAddress: undefined,
          deliveryFee: 0,
          total: 500,
          pickupLocation: { id: "loc-1", name: "MASH Farm", address: "QC" },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Order status updated to processing"
        );
      });
    });

    it("shows error toast when status update fails", async () => {
      mockUpdateOrderStatus.mockRejectedValueOnce(new Error("Server error"));

      // Use pickup order to avoid Lalamove quotation check
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "pickup",
          deliveryAddress: undefined,
          deliveryFee: 0,
          total: 500,
          pickupLocation: { id: "loc-1", name: "MASH Farm", address: "QC" },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to update order status");
      });
    });
  });

  // Additional: Pickup order rendering
  describe("Pickup Orders", () => {
    it("renders Customer Pickup Instructions for pickup delivery method", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          deliveryMethod: "pickup",
          deliveryAddress: undefined,
          deliveryFee: 0,
          total: 500,
          pickupLocation: { id: "loc-1", name: "MASH Farm", address: "456 Farm Lane, QC" },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Customer Pickup Instructions")).toBeInTheDocument();
      expect(screen.getByText("MASH Farm")).toBeInTheDocument();
      expect(screen.getByText("456 Farm Lane, QC")).toBeInTheDocument();
    });
  });

  // Additional: Lalamove tracking timeline
  describe("Lalamove Tracking", () => {
    it("renders LalamoveTrackingTimeline when lalamoveTracking data exists", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          lalamoveTracking: {
            orderId: "llm-order-001",
            quotationId: "llm-quote-001",
            status: "ON_GOING",
            createdAt: new Date(),
            lastUpdated: new Date(),
          },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      expect(screen.getByTestId("lalamove-tracking-timeline")).toBeInTheDocument();
      expect(screen.getByText("Tracking Status: ON_GOING")).toBeInTheDocument();
    });

    it("does not render tracking timeline without lalamoveTracking data", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.queryByTestId("lalamove-tracking-timeline")).not.toBeInTheDocument();
    });
  });

  // Batch 16: Lalamove auto-create on processing branches
  describe("Lalamove Auto-Create on Processing", () => {
    it("shows info toast when lalamoveOrderId already exists", async () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "lalamove",
          lalamoveOrderId: "existing-lala-id",
          lalamoveQuotationId: "quote-123",
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith("Lalamove delivery already created");
      });
    });

    it("shows error toast when no quotation ID for lalamove processing", async () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "lalamove",
          lalamoveOrderId: null,
          lalamoveQuotationId: null,
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("No delivery quotation found. Please create a quote first.");
      });
      // Should NOT call updateOrderStatus
      expect(mockUpdateOrderStatus).not.toHaveBeenCalled();
    });

    it("calls fetch to create Lalamove order when quotation exists", async () => {
      const mockFetch = jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { orderId: "lala-new-1" } }),
      } as Response);

      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "lalamove",
          lalamoveOrderId: null,
          lalamoveQuotationId: "quote-abc",
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/lalamove/create-order", expect.objectContaining({
          method: "POST",
        }));
      });

      mockFetch.mockRestore();
    });

    it("shows error and prompts confirmation when Lalamove creation fails", async () => {
      const mockFetch = jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Lalamove API unavailable" }),
      } as Response);
      // Mock confirm to return false (don't continue)
      const mockConfirm = jest.spyOn(window, "confirm").mockReturnValue(false);

      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "lalamove",
          lalamoveOrderId: null,
          lalamoveQuotationId: "quote-abc",
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      // Should NOT update status since user declined
      expect(mockUpdateOrderStatus).not.toHaveBeenCalled();

      mockFetch.mockRestore();
      mockConfirm.mockRestore();
    });

    it("continues with status update when confirm clicked after Lalamove failure", async () => {
      const mockFetch = jest.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "API error" }),
      } as Response);
      const mockConfirm = jest.spyOn(window, "confirm").mockReturnValue(true);

      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "approved",
          deliveryMethod: "lalamove",
          lalamoveOrderId: null,
          lalamoveQuotationId: "quote-abc",
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Processing"));
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith("order-abc-123", "processing", "seller-001");
      });

      mockFetch.mockRestore();
      mockConfirm.mockRestore();
    });
  });

  // Batch 16: Reject failure and cancel
  describe("Reject Flow Details", () => {
    it("shows error toast when reject fails", async () => {
      mockRejectOrder.mockRejectedValueOnce(new Error("Network fail"));

      render(<SellerOrderDetailPage />);
      fireEvent.click(screen.getByText("Reject Order"));
      await act(async () => {
        fireEvent.click(screen.getByTestId("confirm-reject"));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to reject order");
      });
    });

    it("closes rejection modal on cancel and does not call rejectOrder", () => {
      render(<SellerOrderDetailPage />);
      fireEvent.click(screen.getByText("Reject Order"));
      expect(screen.getByTestId("rejection-modal")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("cancel-reject"));
      expect(screen.queryByTestId("rejection-modal")).not.toBeInTheDocument();
      expect(mockRejectOrder).not.toHaveBeenCalled();
    });
  });

  // Batch 16: Vehicle selection
  describe("Vehicle Selection", () => {
    it("renders vehicle options with names and weight limits", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Select Vehicle Type")).toBeInTheDocument();
      expect(screen.getByText("Motorcycle")).toBeInTheDocument();
      expect(screen.getByText("Sedan")).toBeInTheDocument();
      expect(screen.getByText(/20kg/)).toBeInTheDocument();
      expect(screen.getByText(/100kg/)).toBeInTheDocument();
    });

    it("shows estimated cost for each vehicle", () => {
      render(<SellerOrderDetailPage />);
      // calculateEstimate returns 250, displayed as ~₱250
      const estimates = screen.getAllByText(/~₱250/);
      expect(estimates.length).toBeGreaterThanOrEqual(1);
    });

    it("shows selected vehicle info box with description", () => {
      render(<SellerOrderDetailPage />);
      // Default selected is sedan
      expect(screen.getByText(/Sedan - Estimated ₱250/)).toBeInTheDocument();
      expect(screen.getByText("Medium packages")).toBeInTheDocument();
    });

    it("changes selected vehicle on click", () => {
      render(<SellerOrderDetailPage />);
      const motorcycleBtn = screen.getByText("Motorcycle").closest("button");
      if (motorcycleBtn) {
        fireEvent.click(motorcycleBtn);
        // After clicking motorcycle, it should show motorcycle info  
        expect(screen.getByText(/Motorcycle - Estimated ₱250/)).toBeInTheDocument();
      }
    });
  });

  // Batch 16: Pickup details
  describe("Pickup Order Details", () => {
    const pickupOrder = createMockOrder({
      deliveryMethod: "pickup",
      deliveryAddress: undefined,
      deliveryFee: 0,
      total: 500,
      pickupLocation: { id: "loc-1", name: "MASH Farm", address: "Farm Lane, QC" },
    });

    it("shows pickup instruction texts", () => {
      mockUseFirebaseOrder.mockReturnValue({ order: pickupOrder, loading: false, error: null });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText(/visit the farm\/store/)).toBeInTheDocument();
      expect(screen.getByText(/No delivery fee/)).toBeInTheDocument();
      expect(screen.getByText(/reduces scam risk/)).toBeInTheDocument();
      expect(screen.getByText(/inspect products before payment/)).toBeInTheDocument();
    });

    it("shows customer contact section in pickup", () => {
      mockUseFirebaseOrder.mockReturnValue({ order: pickupOrder, loading: false, error: null });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Customer Contact")).toBeInTheDocument();
    });

    it("shows Ready for Pickup info box", () => {
      mockUseFirebaseOrder.mockReturnValue({ order: pickupOrder, loading: false, error: null });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("When Order is Ready")).toBeInTheDocument();
      expect(screen.getByText(/Ready for Pickup/)).toBeInTheDocument();
    });

    it("shows data inconsistency warning for pickup with lalamove tracking", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          ...pickupOrder,
          lalamoveTracking: { orderId: "x", status: "ASSIGNING_DRIVER" },
        }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText(/Data Inconsistency Detected/)).toBeInTheDocument();
    });

    it("does not show inconsistency warning for normal pickup", () => {
      mockUseFirebaseOrder.mockReturnValue({ order: pickupOrder, loading: false, error: null });
      render(<SellerOrderDetailPage />);
      expect(screen.queryByText(/Data Inconsistency/)).not.toBeInTheDocument();
    });
  });

  // Batch 16: Order info edge cases
  describe("Order Info Edge Cases", () => {
    it("hides Last Updated when updatedAt is null", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ updatedAt: null }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.queryByText("Last Updated")).not.toBeInTheDocument();
    });

    it("shows Last Updated when updatedAt exists", () => {
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Last Updated")).toBeInTheDocument();
    });

    it("renders payment method with underscore replaced", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ paymentMethod: "credit_card" }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("credit card")).toBeInTheDocument();
    });

    it("renders cancelled status badge", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "cancelled" }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });

    it("renders Processing status badge", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "processing" }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });

    it("renders Ready for Pickup status badge", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "ready_for_pickup" }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Ready for Pickup")).toBeInTheDocument();
    });

    it("renders Shipped status badge", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "shipped" }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Shipped")).toBeInTheDocument();
    });

    it("renders Completed status badge", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "completed" }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });

    it("renders placeholder image for items without image", () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          items: [{ name: "No Image Item", price: 100, quantity: 1, image: null }],
          subtotal: 100,
          total: 250,
        }),
        loading: false,
        error: null,
      });
      render(<SellerOrderDetailPage />);
      const img = screen.getByAltText("No Image Item");
      expect(img).toHaveAttribute("src", "/mushroom-placeholder.png");
    });
  });

  // Batch 16: Firebase realtime listener
  describe("Firebase Realtime Listener", () => {
    it("sets up listener on mount with orderId", () => {
      const mockUnsub = jest.fn();
      (FirebaseOrdersService.listenToOrder as jest.Mock).mockReturnValue(mockUnsub);
      render(<SellerOrderDetailPage />);
      expect(FirebaseOrdersService.listenToOrder).toHaveBeenCalledWith(
        "order-abc-123",
        expect.any(Function)
      );
    });

    it("cleans up listener on unmount", () => {
      const mockUnsub = jest.fn();
      (FirebaseOrdersService.listenToOrder as jest.Mock).mockReturnValue(mockUnsub);
      const { unmount } = render(<SellerOrderDetailPage />);
      unmount();
      expect(mockUnsub).toHaveBeenCalled();
    });
  });

  // Batch 16: Processing + ready_for_pickup for pickup orders
  describe("Status Transitions for Pickup", () => {
    it("calls updateOrderStatus with ready_for_pickup for pickup processing", async () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({
          status: "processing",
          deliveryMethod: "pickup",
          deliveryAddress: undefined,
          deliveryFee: 0,
          total: 500,
          pickupLocation: { id: "loc-1", name: "MASH Farm", address: "QC" },
        }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Ready for Pickup"));
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
          "order-abc-123",
          "ready_for_pickup",
          "seller-001"
        );
      });
    });

    it("calls updateOrderStatus with shipped for lalamove processing", async () => {
      mockUseFirebaseOrder.mockReturnValue({
        order: createMockOrder({ status: "processing", deliveryMethod: "lalamove" }),
        loading: false,
        error: null,
      });

      render(<SellerOrderDetailPage />);
      await act(async () => {
        fireEvent.click(screen.getByText("Mark as Shipped"));
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
          "order-abc-123",
          "shipped",
          "seller-001"
        );
      });
    });
  });
});
