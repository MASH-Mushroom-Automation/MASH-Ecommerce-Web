/**
 * OrderCard Component Tests
 * Tests for order display, status badges, and action buttons
 * 
 * NOTE: These tests focus on rendered content that's visible in the UI.
 * The component displays:
 * - Order number in header
 * - Status badges with color classes
 * - Customer details (name, email, phone)
 * - Order items with "Qty: X" format
 * - Totals formatted as "₱X.XX"
 * - Approve/Cancel buttons for pending orders
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrderCard } from "../OrderCard";
import type { Order } from "@/hooks/useSanityOrders";

// Mock dependencies
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/api/orders", () => ({
  OrdersApi: {
    updateOrderStatus: jest.fn(),
  },
}));

// Import mocked modules
import { toast } from "sonner";
import { OrdersApi } from "@/lib/api/orders";

const mockOrder: Order = {
  id: "order-123",
  orderNumber: "ORD-2026-001",
  orderDate: "2026-01-15T10:30:00Z",
  status: "pending",
  paymentStatus: "paid",
  isPriority: false,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+63 912 345 6789",
  shippingAddress: {
    fullAddress: "123 Main St, Quezon City, Metro Manila 1100",
    city: "Quezon City",
    province: "Metro Manila",
    country: "Philippines",
  },
  items: [
    {
      product: {
        id: "prod-1",
        name: "Lion's Mane Mushroom",
        image: "/mushroom.jpg",
      },
      quantity: 2,
      price: 350,
      discount: 0,
      subtotal: 700,
    },
  ],
  subtotal: 700,
  shippingFee: 100,
  tax: 0,
  discount: 0,
  total: 800,
  paymentMethod: "gcash",
  source: "web",
};

describe("OrderCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders order number", () => {
      render(<OrderCard order={mockOrder} />);
      
      expect(screen.getByText("ORD-2026-001")).toBeInTheDocument();
    });

    it("displays order date formatted", () => {
      render(<OrderCard order={mockOrder} />);
      
      // Should contain the date in readable format
      expect(screen.getByText(/jan/i)).toBeInTheDocument();
    });

    it("shows order status badge", () => {
      render(<OrderCard order={mockOrder} />);
      
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it("shows payment status badge", () => {
      render(<OrderCard order={mockOrder} />);
      
      const badge = screen.getByTestId("seller-payment-status-badge");
      expect(badge).toHaveTextContent(/paid/i);
    });

    it("displays customer name", () => {
      render(<OrderCard order={mockOrder} />);
      
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("displays customer email", () => {
      render(<OrderCard order={mockOrder} />);
      
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("displays customer phone", () => {
      render(<OrderCard order={mockOrder} />);
      
      expect(screen.getByText("+63 912 345 6789")).toBeInTheDocument();
    });

    it("displays delivery address", () => {
      render(<OrderCard order={mockOrder} />);
      
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    });

    it("displays order total amount", () => {
      render(<OrderCard order={mockOrder} />);
      
      // Total should be formatted as currency
      expect(screen.getByText(/800/)).toBeInTheDocument();
    });
  });

  describe("Order Items", () => {
    it("displays product name", () => {
      render(<OrderCard order={mockOrder} />);
      
      expect(screen.getByText("Lion's Mane Mushroom")).toBeInTheDocument();
    });

    it("displays quantity with 'Qty:' format", () => {
      render(<OrderCard order={mockOrder} />);
      
      // Component uses "Qty: {quantity}" format
      expect(screen.getByText(/Qty:\s*2/i)).toBeInTheDocument();
    });

    it("displays item subtotal", () => {
      render(<OrderCard order={mockOrder} />);
      
      // Subtotal is 700 - multiple elements may display this
      const elements = screen.getAllByText(/700\.00/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe("Status Badge Colors", () => {
    it("shows yellow badge for pending status", () => {
      render(<OrderCard order={{ ...mockOrder, status: "pending" }} />);
      
      const statusBadge = screen.getByText(/pending/i);
      expect(statusBadge).toHaveClass("bg-yellow-500");
    });

    it("shows blue badge for confirmed status", () => {
      render(<OrderCard order={{ ...mockOrder, status: "confirmed" }} />);
      
      const statusBadge = screen.getByText(/confirmed/i);
      expect(statusBadge).toHaveClass("bg-blue-500");
    });

    it("shows green badge for delivered status", () => {
      render(<OrderCard order={{ ...mockOrder, status: "delivered" }} />);
      
      const statusBadge = screen.getByText(/delivered/i);
      expect(statusBadge).toHaveClass("bg-green-500");
    });

    it("shows red badge for cancelled status", () => {
      render(<OrderCard order={{ ...mockOrder, status: "cancelled" }} />);
      
      const statusBadge = screen.getByText(/cancelled/i);
      expect(statusBadge).toHaveClass("bg-red-500");
    });
  });

  describe("Priority Orders", () => {
    it("shows priority badge for priority orders", () => {
      render(<OrderCard order={{ ...mockOrder, isPriority: true }} />);
      
      expect(screen.getByText(/priority/i)).toBeInTheDocument();
    });

    it("does not show priority badge for non-priority orders", () => {
      render(<OrderCard order={{ ...mockOrder, isPriority: false }} />);
      
      expect(screen.queryByText(/⭐ Priority/)).not.toBeInTheDocument();
    });
  });

  describe("Order Approval", () => {
    it("shows accept order button for pending orders", () => {
      render(<OrderCard order={mockOrder} />);
      
      // Button text is "Accept Order"
      expect(screen.getByRole("button", { name: /accept order/i })).toBeInTheDocument();
    });

    it("calls OrdersApi when accept is clicked", async () => {
      (OrdersApi.updateOrderStatus as jest.Mock).mockResolvedValue({ success: true });
      
      render(<OrderCard order={mockOrder} />);
      
      fireEvent.click(screen.getByRole("button", { name: /accept order/i }));
      
      await waitFor(() => {
        expect(OrdersApi.updateOrderStatus).toHaveBeenCalledWith("order-123", "TO_SHIP");
      });
    });

    it("shows success toast on approval", async () => {
      (OrdersApi.updateOrderStatus as jest.Mock).mockResolvedValue({ success: true });
      
      render(<OrderCard order={mockOrder} />);
      
      fireEvent.click(screen.getByRole("button", { name: /accept order/i }));
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it("shows error toast on approval failure", async () => {
      (OrdersApi.updateOrderStatus as jest.Mock).mockResolvedValue({ 
        success: false, 
        message: "API error" 
      });
      
      render(<OrderCard order={mockOrder} />);
      
      fireEvent.click(screen.getByRole("button", { name: /accept order/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("calls onOrderUpdated after successful approval", async () => {
      (OrdersApi.updateOrderStatus as jest.Mock).mockResolvedValue({ success: true });
      const onOrderUpdated = jest.fn();
      
      render(<OrderCard order={mockOrder} onOrderUpdated={onOrderUpdated} />);
      
      fireEvent.click(screen.getByRole("button", { name: /accept order/i }));
      
      await waitFor(() => {
        expect(onOrderUpdated).toHaveBeenCalled();
      });
    });
  });

  describe("Order Rejection", () => {
    it("shows decline order button for pending orders", () => {
      render(<OrderCard order={mockOrder} />);
      
      // Button text is "Decline Order"
      expect(screen.getByRole("button", { name: /decline order/i })).toBeInTheDocument();
    });

    it("opens rejection modal when decline is clicked", () => {
      render(<OrderCard order={mockOrder} />);
      
      fireEvent.click(screen.getByRole("button", { name: /decline order/i }));
      
      // Modal should be visible - check for dialog content
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Compact Variant", () => {
    it("renders compact version when variant is compact", () => {
      const { container } = render(<OrderCard order={mockOrder} variant="compact" />);
      
      // Compact should have less detailed view - no full card content
      expect(container.querySelector(".space-y-6")).toBeNull();
    });
  });

  describe("Currency Formatting", () => {
    it("formats total with peso sign", () => {
      render(<OrderCard order={mockOrder} />);
      
      // Should use Philippine peso formatting - "₱800.00"
      expect(screen.getByText(/₱800\.00/)).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("formats date in readable format", () => {
      const order = {
        ...mockOrder,
        orderDate: "2026-02-01T14:30:00Z",
      };
      
      render(<OrderCard order={order} />);
      
      // Should display formatted date
      expect(screen.getByText(/feb/i)).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <OrderCard order={mockOrder} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  // PAY-016: Payment method display enhancements
  describe("Payment Method Display (PAY-016)", () => {
    it("shows human-readable GCash label instead of raw text", () => {
      render(<OrderCard order={{ ...mockOrder, paymentMethod: "gcash" }} />);

      const methodEl = screen.getByTestId("seller-payment-method");
      expect(methodEl).toHaveTextContent("GCash");
    });

    it("shows Cash on Delivery label for COD", () => {
      render(<OrderCard order={{ ...mockOrder, paymentMethod: "cod" }} />);

      const methodEl = screen.getByTestId("seller-payment-method");
      expect(methodEl).toHaveTextContent("Cash on Delivery");
    });

    it("shows Credit / Debit Card label for card payments", () => {
      render(<OrderCard order={{ ...mockOrder, paymentMethod: "card" }} />);

      const methodEl = screen.getByTestId("seller-payment-method");
      expect(methodEl).toHaveTextContent("Credit / Debit Card");
    });

    it("shows payment status badge with correct styling for paid", () => {
      render(
        <OrderCard order={{ ...mockOrder, paymentStatus: "paid" }} />,
      );

      const badge = screen.getByTestId("seller-payment-status-badge");
      expect(badge).toHaveTextContent("Paid");
      expect(badge.className).toMatch(/green/);
    });

    it("shows payment status badge with correct styling for pending", () => {
      render(
        <OrderCard
          order={{ ...mockOrder, paymentStatus: "pending" }}
        />,
      );

      const badge = screen.getByTestId("seller-payment-status-badge");
      expect(badge).toHaveTextContent("Pending");
      expect(badge.className).toMatch(/amber/);
    });

    it("shows payment status badge with correct styling for failed", () => {
      render(
        <OrderCard
          order={{ ...mockOrder, paymentStatus: "failed" }}
        />,
      );

      const badge = screen.getByTestId("seller-payment-status-badge");
      expect(badge).toHaveTextContent("Failed");
      expect(badge.className).toMatch(/red/);
    });

    it("shows payment status badge with correct styling for refunded", () => {
      render(
        <OrderCard
          order={{ ...mockOrder, paymentStatus: "refunded" }}
        />,
      );

      const badge = screen.getByTestId("seller-payment-status-badge");
      expect(badge).toHaveTextContent("Refunded");
      expect(badge.className).toMatch(/blue/);
    });

    it("displays payment reference when available", () => {
      render(
        <OrderCard
          order={{
            ...mockOrder,
            paymentReference: "pay_ref_abc123",
          }}
        />,
      );

      expect(screen.getByText("pay_ref_abc123")).toBeInTheDocument();
    });

    it("falls back to raw method string for unknown methods", () => {
      render(
        <OrderCard
          order={{ ...mockOrder, paymentMethod: "bitcoin" }}
        />,
      );

      const methodEl = screen.getByTestId("seller-payment-method");
      expect(methodEl).toHaveTextContent("bitcoin");
    });
  });
});
