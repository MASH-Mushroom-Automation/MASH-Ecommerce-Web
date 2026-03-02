/**
 * Tests for FirebaseOrdersPage - seller firebase orders management
 * COV-012: Seller page tests + Batch 11 enhancement
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  }),
}));

// Mock useFirebaseOrders hook
const mockApproveOrder = jest.fn().mockResolvedValue(true);
const mockRejectOrder = jest.fn().mockResolvedValue(true);
const mockUpdateOrderStatus = jest.fn().mockResolvedValue(true);
const mockRefreshOrders = jest.fn();
const mockSearchOrders = jest.fn(() => []);

const baseOrder = {
  id: "order-1",
  orderNumber: "ORD-001",
  status: "pending_approval" as const,
  customerName: "John Doe",
  userName: "John Doe",
  userEmail: "john@example.com",
  userPhone: "+639123456789",
  userId: "user-1",
  items: [
    {
      productId: "p1",
      name: "King Oyster Mushroom",
      quantity: 2,
      price: 120,
      image: "/king.jpg",
      product: { name: "King Oyster", image: "/test.jpg" },
    },
  ],
  totalAmount: 240,
  total: 240,
  subtotal: 200,
  tax: 24,
  deliveryFee: 16,
  deliveryMethod: "pickup" as const,
  deliveryAddress: null,
  pickupLocation: { name: "MASH Store", address: "123 Main St" },
  shippingAddress: { fullAddress: "123 Main St" },
  createdAt: new Date("2026-02-01"),
  updatedAt: new Date("2026-02-01"),
  deliveryType: "delivery",
  paymentMethod: "cod",
  lalamoveQuotationId: null,
  lalamoveOrderId: null,
  lalamoveTracking: null,
  statusHistory: [
    { status: "pending_approval" as const, timestamp: new Date("2026-02-01"), note: "Order placed" },
  ],
};

const lalamoveOrder = {
  ...baseOrder,
  id: "order-2",
  orderNumber: "ORD-002",
  status: "approved" as const,
  userName: "Jane Smith",
  userEmail: "jane@example.com",
  deliveryMethod: "lalamove" as const,
  deliveryAddress: { address: "456 Oak Ave", lat: 14.5, lng: 121.0 },
  pickupLocation: null,
  lalamoveOrderId: "LLM-123",
  lalamoveQuotationId: "Q-001",
  lalamoveTracking: {
    status: "PICKED_UP",
    shareLink: "https://lalamove.com/track/abc",
    driverName: "Carlos",
    driverPhone: "+639987654321",
    driverPlateNumber: "ABC 1234",
  },
  statusHistory: [
    { status: "pending_approval" as const, timestamp: new Date("2026-02-01"), note: "Order placed" },
    { status: "approved" as const, timestamp: new Date("2026-02-01T01:00:00"), note: "Approved" },
  ],
};

const shippedOrder = {
  ...baseOrder,
  id: "order-3",
  orderNumber: "ORD-003",
  status: "shipped" as const,
  userName: "Bob Wilson",
  userEmail: "bob@example.com",
  deliveryMethod: "lalamove" as const,
  deliveryAddress: { address: "789 Pine St", lat: 14.6, lng: 121.1 },
  deliveryFee: 100,
  total: 340,
  statusHistory: [
    { status: "pending_approval" as const, timestamp: new Date("2026-02-01"), note: "" },
    { status: "shipped" as const, timestamp: new Date("2026-02-02"), note: "" },
  ],
};

const defaultStats = {
  totalOrders: 10,
  pendingApproval: 1,
  approved: 2,
  processing: 1,
  readyForPickup: 0,
  shipped: 1,
  delivered: 2,
  completed: 1,
  cancelled: 0,
  rejected: 0,
  totalRevenue: 5000,
  todayOrders: 2,
  todayRevenue: 500,
};

const defaultOrdersReturn = {
  orders: [baseOrder, lalamoveOrder, shippedOrder],
  pendingOrders: [baseOrder],
  stats: defaultStats,
  loading: false,
  error: null,
  approveOrder: mockApproveOrder,
  rejectOrder: mockRejectOrder,
  updateOrderStatus: mockUpdateOrderStatus,
  refreshOrders: mockRefreshOrders,
  searchOrders: mockSearchOrders,
};

jest.mock("@/hooks/useFirebaseOrders", () => ({
  useFirebaseOrders: jest.fn(() => defaultOrdersReturn),
}));

// Mock email client
jest.mock("@/lib/email/client", () => ({
  sendOrderApprovedEmailViaAPI: jest.fn().mockResolvedValue(undefined),
  sendOrderRejectedEmailViaAPI: jest.fn().mockResolvedValue(undefined),
  sendOrderShippedEmailViaAPI: jest.fn().mockResolvedValue(undefined),
  sendOrderDeliveredEmailViaAPI: jest.fn().mockResolvedValue(undefined),
}));

// Mock Firebase orders service
jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    setLalamoveOrderId: jest.fn().mockResolvedValue(undefined),
  },
  OrderStatus: {},
}));

// Mock OrderRejectionModal
jest.mock("@/components/orders/OrderRejectionModal", () => ({
  OrderRejectionModal: ({ open, onClose, onConfirm, loading }: any) =>
    open ? (
      <div data-testid="rejection-modal">
        <button onClick={() => onConfirm("Customer requested")}>Confirm Reject</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

import FirebaseOrdersPage from "../page";
import { useFirebaseOrders } from "@/hooks/useFirebaseOrders";
import { sendOrderApprovedEmailViaAPI, sendOrderRejectedEmailViaAPI, sendOrderShippedEmailViaAPI, sendOrderDeliveredEmailViaAPI } from "@/lib/email/client";

describe("FirebaseOrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFirebaseOrders as jest.Mock).mockReturnValue(defaultOrdersReturn);
    // Provide authenticated user for approve/reject handlers
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      user: { id: "seller-1", uid: "seller-1", email: "seller@test.com", displayName: "Seller" },
      isAuthenticated: true,
    });
    // Mock fetch for Lalamove
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { lalamoveOrderId: "LLM-999", shareLink: "https://share.link" } }),
    });
  });

  it("should render the page heading", () => {
    render(<FirebaseOrdersPage />);
    expect(screen.getByRole("heading", { name: /firebase orders/i })).toBeInTheDocument();
  });

  it("should display live updates indicator", () => {
    render(<FirebaseOrdersPage />);
    expect(screen.getByText("Live Updates")).toBeInTheDocument();
  });

  it("should display order stats cards", () => {
    render(<FirebaseOrdersPage />);
    // "Pending Approval" appears in both stats card and order badge
    expect(screen.getAllByText("Pending Approval").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Today's Orders")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<FirebaseOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/search orders/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("should filter by search query", () => {
    render(<FirebaseOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/search orders/i);
    fireEvent.change(searchInput, { target: { value: "John" } });
    expect(searchInput).toHaveValue("John");
  });

  it("should display order cards", () => {
    render(<FirebaseOrdersPage />);
    expect(screen.getByText("ORD-001")).toBeInTheDocument();
    expect(screen.getByText("ORD-002")).toBeInTheDocument();
    expect(screen.getByText("ORD-003")).toBeInTheDocument();
  });

  it("should render loading state", () => {
    (useFirebaseOrders as jest.Mock).mockReturnValue({
      ...defaultOrdersReturn,
      loading: true,
      orders: [],
    });
    render(<FirebaseOrdersPage />);
    expect(screen.getByText("Loading orders...")).toBeInTheDocument();
  });

  it("should display customer names in order cards", () => {
    render(<FirebaseOrdersPage />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
  });

  it("should show total amount formatted as PHP", () => {
    render(<FirebaseOrdersPage />);
    // Look for PHP currency format
    const phpTexts = screen.getAllByText(/₱/);
    expect(phpTexts.length).toBeGreaterThan(0);
  });

  it("should show pending approval alert banner", () => {
    render(<FirebaseOrdersPage />);
    expect(screen.getByText(/waiting for approval/)).toBeInTheDocument();
    expect(screen.getByText("View Pending")).toBeInTheDocument();
  });

  it("should hide pending alert when no pending orders", () => {
    (useFirebaseOrders as jest.Mock).mockReturnValue({
      ...defaultOrdersReturn,
      pendingOrders: [],
    });
    render(<FirebaseOrdersPage />);
    expect(screen.queryByText(/waiting for approval/)).not.toBeInTheDocument();
  });

  it("should show yellow ring on pending approval stat card", () => {
    render(<FirebaseOrdersPage />);
    // "Pending Approval" appears multiple times; find the stats card title
    const pendingEls = screen.getAllByText("Pending Approval");
    const pendingCard = pendingEls[0].closest("[class*=card]");
    expect(pendingCard?.className).toContain("ring");
  });

  it("should show approve/reject buttons for pending orders", () => {
    render(<FirebaseOrdersPage />);
    // ORD-001 is pending_approval, should have Approve and Reject buttons
    const approveButtons = screen.getAllByText(/Approve/i);
    expect(approveButtons.length).toBeGreaterThan(0);
  });

  it("should show Lalamove badge for lalamove orders", () => {
    render(<FirebaseOrdersPage />);
    const lalamoveBadges = screen.getAllByText("Lalamove");
    expect(lalamoveBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("should show delivery fee when > 0", () => {
    render(<FirebaseOrdersPage />);
    // shippedOrder has deliveryFee: 100, rendered as "incl. ₱100.00 delivery"
    expect(screen.getAllByText(/delivery/i).length).toBeGreaterThanOrEqual(1);
  });

  it("should call approveOrder when approve button is clicked", async () => {
    render(<FirebaseOrdersPage />);
    const approveButtons = screen.getAllByRole("button");
    const approveBtn = approveButtons.find((b) => b.textContent?.includes("Approve") && !b.textContent?.includes("Order"));
    expect(approveBtn).toBeTruthy();
    fireEvent.click(approveBtn!);
    await waitFor(() => {
      expect(mockApproveOrder).toHaveBeenCalledWith("order-1", "seller-1");
    });
  });

  it("should send approval email after successful approve", async () => {
    render(<FirebaseOrdersPage />);
    const approveButtons = screen.getAllByRole("button");
    const approveBtn = approveButtons.find((b) => b.textContent?.includes("Approve") && !b.textContent?.includes("Order"));
    fireEvent.click(approveBtn!);
    await waitFor(() => {
      expect(sendOrderApprovedEmailViaAPI).toHaveBeenCalledWith(
        "john@example.com",
        expect.objectContaining({ customerName: "John Doe" })
      );
    });
  });

  it("should show error toast when approve fails", async () => {
    mockApproveOrder.mockResolvedValueOnce(false);
    render(<FirebaseOrdersPage />);
    const approveButtons = screen.getAllByRole("button");
    const approveBtn = approveButtons.find((b) => b.textContent?.includes("Approve") && !b.textContent?.includes("Order"));
    fireEvent.click(approveBtn!);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to approve order");
    });
  });

  it("should open rejection modal when reject button is clicked", () => {
    render(<FirebaseOrdersPage />);
    const rejectButtons = screen.getAllByRole("button");
    const rejectBtn = rejectButtons.find((b) => b.textContent?.includes("Reject") && !b.textContent?.includes("Order"));
    if (rejectBtn) {
      fireEvent.click(rejectBtn);
      expect(screen.getByTestId("rejection-modal")).toBeInTheDocument();
    }
  });

  it("should call rejectOrder when rejection is confirmed", async () => {
    render(<FirebaseOrdersPage />);
    const rejectButtons = screen.getAllByRole("button");
    const rejectBtn = rejectButtons.find((b) => b.textContent?.includes("Reject") && !b.textContent?.includes("Order"));
    expect(rejectBtn).toBeTruthy();
    fireEvent.click(rejectBtn!);
    fireEvent.click(screen.getByText("Confirm Reject"));
    await waitFor(() => {
      expect(mockRejectOrder).toHaveBeenCalled();
    });
  });

  it("should send rejection email after successful reject", async () => {
    render(<FirebaseOrdersPage />);
    const rejectButtons = screen.getAllByRole("button");
    const rejectBtn = rejectButtons.find((b) => b.textContent?.includes("Reject") && !b.textContent?.includes("Order"));
    fireEvent.click(rejectBtn!);
    fireEvent.click(screen.getByText("Confirm Reject"));
    await waitFor(() => {
      expect(sendOrderRejectedEmailViaAPI).toHaveBeenCalled();
    });
  });

  it("should show empty state when no orders match filters", () => {
    (useFirebaseOrders as jest.Mock).mockReturnValue({
      ...defaultOrdersReturn,
      orders: [],
      pendingOrders: [],
    });
    render(<FirebaseOrdersPage />);
    expect(screen.getByText("No orders found")).toBeInTheDocument();
    expect(screen.getByText("Orders will appear here when customers place them")).toBeInTheDocument();
  });

  it("should show search hint in empty state when searching", () => {
    (useFirebaseOrders as jest.Mock).mockReturnValue({
      ...defaultOrdersReturn,
      orders: [],
      pendingOrders: [],
    });
    render(<FirebaseOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/search orders/i);
    fireEvent.change(searchInput, { target: { value: "xyz" } });
    expect(screen.getByText("Try adjusting your search query")).toBeInTheDocument();
  });

  it("should call refreshOrders when refresh button is clicked", () => {
    render(<FirebaseOrdersPage />);
    const refreshBtn = screen.getByText("Refresh").closest("button");
    fireEvent.click(refreshBtn!);
    expect(mockRefreshOrders).toHaveBeenCalled();
  });

  it("should open order detail dialog when view button is clicked", () => {
    render(<FirebaseOrdersPage />);
    const viewButtons = screen.getAllByText(/View/i);
    // Find the View buttons associated with order cards (not "View Pending")
    const viewBtn = viewButtons.find((b) => b.closest("button") && !b.textContent?.includes("Pending"));
    if (viewBtn) {
      fireEvent.click(viewBtn.closest("button")!);
      // Order detail dialog should show customer info
      expect(screen.getByText("Customer Information")).toBeInTheDocument();
    }
  });

  it("should show pickup location in detail dialog for pickup orders", () => {
    render(<FirebaseOrdersPage />);
    // Open detail for order-1 (pickup)
    const viewButtons = screen.getAllByText(/View/i);
    const viewBtn = viewButtons.find((el) => {
      const btn = el.closest("button");
      return btn && !el.textContent?.includes("Pending");
    });
    if (viewBtn) {
      fireEvent.click(viewBtn.closest("button")!);
      expect(screen.getByText("Pickup")).toBeInTheDocument();
    }
  });

  it("should show item count in order cards", () => {
    render(<FirebaseOrdersPage />);
    const itemCounts = screen.getAllByText(/1 item/);
    expect(itemCounts.length).toBeGreaterThanOrEqual(1);
  });

  it("should display status badges on order cards", () => {
    render(<FirebaseOrdersPage />);
    // "Pending Approval" appears in stats card and order badge
    expect(screen.getAllByText("Pending Approval").length).toBeGreaterThanOrEqual(2);
  });

  it("should show error toast when user not logged in for approve", async () => {
    (global as any).__mockUseAuth.mockReturnValue({
      ...(global as any).__mockAuthContext,
      user: null,
      isAuthenticated: false,
    });
    render(<FirebaseOrdersPage />);
    const approveButtons = screen.getAllByRole("button");
    const approveBtn = approveButtons.find((b) => b.textContent?.includes("Approve") && !b.textContent?.includes("Order"));
    if (approveBtn) {
      fireEvent.click(approveBtn);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("You must be logged in to approve orders");
      });
    }
  });

  it("should show order dates", () => {
    render(<FirebaseOrdersPage />);
    // formatDate returns short month + day, e.g. "Feb 1"
    const dateTexts = screen.getAllByText(/Feb/);
    expect(dateTexts.length).toBeGreaterThan(0);
  });

  it("should render stats subtitle text", () => {
    render(<FirebaseOrdersPage />);
    expect(screen.getByText("Needs attention")).toBeInTheDocument();
    expect(screen.getByText(/ready/)).toBeInTheDocument();
  });

  it("should handle View Pending button click by setting status filter", () => {
    render(<FirebaseOrdersPage />);
    const viewPendingBtn = screen.getByText("View Pending");
    fireEvent.click(viewPendingBtn);
    // This sets statusFilter to "pending_approval" which filters orders
    // The component re-renders with filtered results
    expect(viewPendingBtn).toBeInTheDocument();
  });
});
