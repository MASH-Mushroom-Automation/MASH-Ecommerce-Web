/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/seller/orders",
  useSearchParams: () => new URLSearchParams(),
}));

const mockApproveOrder = jest.fn();
const mockRejectOrder = jest.fn();
const mockOrders: any[] = [];
const mockStats = { totalOrders: 0, pendingApproval: 0, processing: 0, approved: 0, totalRevenue: 0 };
let mockLoading = false;
let mockError: string | null = null;

jest.mock("@/hooks/useFirebaseOrders", () => ({
  useFirebaseOrders: () => ({
    orders: mockOrders,
    stats: mockStats,
    loading: mockLoading,
    error: mockError,
    approveOrder: mockApproveOrder,
    rejectOrder: mockRejectOrder,
  }),
}));

jest.mock("@/components/orders/OrderRejectionModal", () => ({
  OrderRejectionModal: ({ open, onClose, onConfirm, orderNumber, loading }: any) =>
    open ? (
      <div data-testid="rejection-modal">
        <span>Reject Order {orderNumber}</span>
        <button onClick={() => onConfirm("test reason")}>Confirm Reject</button>
        <button onClick={onClose}>Close Modal</button>
        {loading && <span>Loading...</span>}
      </div>
    ) : null,
}));

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const { toast } = require("sonner");

import SellerOrdersPage from "../page";

function createOrder(overrides: any = {}) {
  return {
    id: "order-1",
    status: "pending_approval" as const,
    userName: "John Doe",
    userEmail: "john@example.com",
    userPhone: "09123456789",
    total: 1500,
    deliveryMethod: "lalamove",
    items: [
      { name: "Product A", quantity: 2, price: 500, image: "/img-a.png" },
      { name: "Product B", quantity: 1, price: 500, image: null },
    ],
    createdAt: { toDate: () => new Date("2024-06-15T10:00:00Z") },
    ...overrides,
  };
}

describe("SellerOrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrders.length = 0;
    mockStats.totalOrders = 0;
    mockStats.pendingApproval = 0;
    mockStats.processing = 0;
    mockStats.approved = 0;
    mockStats.totalRevenue = 0;
    mockLoading = false;
    mockError = null;
  });

  it("renders page header", () => {
    render(<SellerOrdersPage />);
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Manage and fulfill customer orders")).toBeInTheDocument();
  });

  it("renders stats cards", () => {
    mockStats.totalOrders = 10;
    mockStats.pendingApproval = 5;
    mockStats.processing = 2;
    mockStats.approved = 1;
    mockStats.totalRevenue = 15000;
    render(<SellerOrdersPage />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    // processing (2) + approved (1) = 3
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/15,000/)).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    mockLoading = true;
    const { container } = render(<SellerOrdersPage />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockError = "Failed to load orders";
    render(<SellerOrdersPage />);
    expect(screen.getByText("Error loading orders")).toBeInTheDocument();
    expect(screen.getByText("Failed to load orders")).toBeInTheDocument();
  });

  it("shows empty state when no orders", () => {
    render(<SellerOrdersPage />);
    expect(screen.getByText("No orders found")).toBeInTheDocument();
    expect(screen.getByText("Orders will appear here once customers place them")).toBeInTheDocument();
  });

  it("shows search empty state", () => {
    render(<SellerOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/Search by order ID/);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    expect(screen.getByText("Try adjusting your search or filters")).toBeInTheDocument();
  });

  it("renders order cards with status badges", () => {
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    expect(screen.getByText("order-1")).toBeInTheDocument();
    expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("09123456789")).toBeInTheDocument();
  });

  it("renders order items preview", () => {
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
  });

  it("shows +N more when more than 3 items", () => {
    mockOrders.push(createOrder({
      items: [
        { name: "Item 1", quantity: 1, price: 100, image: "/a.png" },
        { name: "Item 2", quantity: 1, price: 100, image: "/b.png" },
        { name: "Item 3", quantity: 1, price: 100, image: "/c.png" },
        { name: "Item 4", quantity: 1, price: 100, image: "/d.png" },
        { name: "Item 5", quantity: 1, price: 100, image: null },
      ],
    }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("shows Lalamove Delivery for lalamove orders", () => {
    mockOrders.push(createOrder({ deliveryMethod: "lalamove" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Lalamove Delivery")).toBeInTheDocument();
  });

  it("shows Pickup for non-lalamove orders", () => {
    mockOrders.push(createOrder({ deliveryMethod: "pickup" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Pickup")).toBeInTheDocument();
  });

  it("shows total amount", () => {
    mockOrders.push(createOrder({ total: 2500 }));
    render(<SellerOrdersPage />);
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
  });

  it("shows approve/reject buttons for pending orders", () => {
    mockOrders.push(createOrder({ status: "pending_approval" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("hides approve/reject buttons for non-pending orders", () => {
    mockOrders.push(createOrder({ status: "completed" }));
    render(<SellerOrdersPage />);
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  it("handles approve success", async () => {
    mockApproveOrder.mockResolvedValue(true);
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(mockApproveOrder).toHaveBeenCalledWith("order-1", expect.any(String));
      expect(toast.success).toHaveBeenCalledWith("Order approved successfully");
    });
  });

  it("handles approve failure (returns false)", async () => {
    mockApproveOrder.mockResolvedValue(false);
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to approve order");
    });
  });

  it("handles approve error (throws)", async () => {
    mockApproveOrder.mockRejectedValue(new Error("network"));
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error approving order");
    });
  });

  it("opens rejection modal on reject click", () => {
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Reject"));
    expect(screen.getByTestId("rejection-modal")).toBeInTheDocument();
  });

  it("handles reject confirm success", async () => {
    mockRejectOrder.mockResolvedValue(true);
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Reject"));
    fireEvent.click(screen.getByText("Confirm Reject"));
    await waitFor(() => {
      expect(mockRejectOrder).toHaveBeenCalledWith("order-1", expect.any(String), "test reason");
      expect(toast.success).toHaveBeenCalledWith("Order rejected");
    });
  });

  it("handles reject confirm failure", async () => {
    mockRejectOrder.mockResolvedValue(false);
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Reject"));
    fireEvent.click(screen.getByText("Confirm Reject"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to reject order");
    });
  });

  it("handles reject confirm error (throws)", async () => {
    mockRejectOrder.mockRejectedValue(new Error("network"));
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Reject"));
    fireEvent.click(screen.getByText("Confirm Reject"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error rejecting order");
    });
  });

  it("closes rejection modal", () => {
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("Reject"));
    expect(screen.getByTestId("rejection-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Close Modal"));
    expect(screen.queryByTestId("rejection-modal")).not.toBeInTheDocument();
  });

  it("navigates to order detail on card click", () => {
    mockOrders.push(createOrder());
    render(<SellerOrdersPage />);
    fireEvent.click(screen.getByText("order-1"));
    expect(mockPush).toHaveBeenCalledWith("/seller/orders/order-1");
  });

  it("filters orders by search query (order id)", () => {
    mockOrders.push(createOrder({ id: "order-abc" }));
    mockOrders.push(createOrder({ id: "order-xyz", userName: "Jane", userEmail: "jane@test.com" }));
    render(<SellerOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/Search by order ID/);
    fireEvent.change(searchInput, { target: { value: "abc" } });
    expect(screen.getByText("order-abc")).toBeInTheDocument();
    expect(screen.queryByText("order-xyz")).not.toBeInTheDocument();
  });

  it("filters orders by customer name", () => {
    mockOrders.push(createOrder({ id: "o1", userName: "Alice Smith" }));
    mockOrders.push(createOrder({ id: "o2", userName: "Bob Jones" }));
    render(<SellerOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/Search by order ID/);
    fireEvent.change(searchInput, { target: { value: "alice" } });
    expect(screen.getByText("o1")).toBeInTheDocument();
    expect(screen.queryByText("o2")).not.toBeInTheDocument();
  });

  it("filters orders by email", () => {
    mockOrders.push(createOrder({ id: "o1", userEmail: "test@example.com" }));
    mockOrders.push(createOrder({ id: "o2", userEmail: "other@test.com" }));
    render(<SellerOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/Search by order ID/);
    fireEvent.change(searchInput, { target: { value: "other@test" } });
    expect(screen.queryByText("o1")).not.toBeInTheDocument();
    expect(screen.getByText("o2")).toBeInTheDocument();
  });

  it("filters orders by phone", () => {
    mockOrders.push(createOrder({ id: "o1", userPhone: "09111111111" }));
    mockOrders.push(createOrder({ id: "o2", userPhone: "09222222222" }));
    render(<SellerOrdersPage />);
    const searchInput = screen.getByPlaceholderText(/Search by order ID/);
    fireEvent.change(searchInput, { target: { value: "0922" } });
    expect(screen.queryByText("o1")).not.toBeInTheDocument();
    expect(screen.getByText("o2")).toBeInTheDocument();
  });

  it("renders approved status label", () => {
    mockOrders.push(createOrder({ id: "o-approved", status: "approved" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("renders rejected status label", () => {
    mockOrders.push(createOrder({ id: "o-rejected", status: "rejected" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("renders processing status label", () => {
    mockOrders.push(createOrder({ id: "o-processing", status: "processing" }));
    render(<SellerOrdersPage />);
    // "Processing" appears in both stats card and order badge
    expect(screen.getAllByText("Processing").length).toBeGreaterThanOrEqual(2);
  });

  it("renders ready_for_pickup status label", () => {
    mockOrders.push(createOrder({ id: "o-rfp", status: "ready_for_pickup" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Ready for Pickup")).toBeInTheDocument();
  });

  it("renders shipped status label", () => {
    mockOrders.push(createOrder({ id: "o-shipped", status: "shipped" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Shipped")).toBeInTheDocument();
  });

  it("renders delivered status label", () => {
    mockOrders.push(createOrder({ id: "o-delivered", status: "delivered" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("renders completed status label", () => {
    mockOrders.push(createOrder({ id: "o-completed", status: "completed" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders cancelled status label", () => {
    mockOrders.push(createOrder({ id: "o-cancelled", status: "cancelled" }));
    render(<SellerOrdersPage />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders order without phone number", () => {
    mockOrders.push(createOrder({ userPhone: undefined }));
    render(<SellerOrdersPage />);
    expect(screen.queryByText("Phone:")).not.toBeInTheDocument();
  });

  it("uses placeholder image when item has no image", () => {
    mockOrders.push(createOrder({
      items: [{ name: "No Image", quantity: 1, price: 100, image: null }],
    }));
    render(<SellerOrdersPage />);
    const img = screen.getByAltText("No Image");
    expect(img).toHaveAttribute("src", "/mushroom-placeholder.png");
  });

  it("renders search input", () => {
    render(<SellerOrdersPage />);
    expect(screen.getByPlaceholderText(/Search by order ID/)).toBeInTheDocument();
  });
});
