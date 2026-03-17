/**
 * PAY-016: Order History - Payment Status Display Tests
 *
 * Tests the payment method icon + name on order cards, payment status badges,
 * full payment info in order detail, COD-specific messaging, PayMongo
 * transaction reference display, and payment status filter functionality.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import type { OrderStatus } from "@/lib/firebase/orders";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAddToCart = jest.fn().mockReturnValue(true);
jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items: [],
    summary: {
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
    },
    loading: false,
    error: null,
    addToCart: mockAddToCart,
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    removeVendorItems: jest.fn(),
    isInCart: jest.fn().mockReturnValue(false),
    getItemQuantity: jest.fn().mockReturnValue(0),
  }),
}));

jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    cancelOrder: jest.fn().mockResolvedValue(undefined),
    getOrder: jest.fn(),
    getUserOrders: jest.fn().mockResolvedValue([]),
    subscribeToOrder: jest.fn().mockReturnValue(jest.fn()),
    subscribeToUserOrders: jest.fn().mockReturnValue(jest.fn()),
  },
}));

jest.mock("@/hooks/useFirebaseOrders", () => ({
  useFirebaseOrders: jest.fn().mockReturnValue({
    orders: [],
    loading: false,
    error: null,
  }),
  useFirebaseOrder: jest.fn().mockReturnValue({
    order: null,
    loading: false,
    error: null,
  }),
  useUserFirebaseOrders: jest.fn().mockReturnValue({
    orders: [],
    loading: false,
    error: null,
    refreshOrders: jest.fn(),
  }),
}));

// Access global auth mock
const mockUseAuth = (global as any).__mockUseAuth as jest.Mock;

import {
  useUserFirebaseOrders,
  useFirebaseOrder,
} from "@/hooks/useFirebaseOrders";
import OrderHistoryPage from "../page";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockOrder(
  overrides: Partial<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    deliveryMethod: string;
    paymentMethod: string;
    paymentStatus: string;
    payment: {
      paymentId?: string;
      paymentIntentId?: string;
      sourceId?: string;
      paidAt?: string;
      failedAt?: string;
    };
  }> = {},
) {
  return {
    id: overrides.id || "order-001",
    orderNumber: overrides.orderNumber || "MASH-2026-001",
    userId: "user-123",
    userEmail: "test@example.com",
    userName: "Test User",
    userPhone: "+639123456789",
    status: overrides.status || ("pending_approval" as OrderStatus),
    items: [
      {
        productId: "product-1",
        name: "King Oyster Mushroom",
        price: 120,
        quantity: 2,
        totalPrice: 240,
        image: "/mushroom.jpg",
      },
    ],
    subtotal: 240,
    tax: 28.8,
    deliveryFee: 50,
    total: 318.8,
    deliveryMethod: overrides.deliveryMethod || "lalamove",
    paymentMethod: overrides.paymentMethod || "cod",
    paymentStatus: overrides.paymentStatus || "pending",
    payment: overrides.payment,
    statusHistory: [
      {
        status: "pending_approval",
        timestamp: { toDate: () => new Date("2026-01-15T10:00:00Z") },
        updatedBy: "user-123",
        note: "Order placed",
      },
    ],
    createdAt: { toDate: () => new Date("2026-01-15T10:00:00Z") },
    updatedAt: { toDate: () => new Date("2026-01-15T10:00:00Z") },
  };
}

function setupAuthenticatedUser() {
  mockUseAuth.mockReturnValue({
    user: { id: "user-123", email: "test@example.com", name: "Test User" },
    isAuthenticated: true,
    loading: false,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PAY-016: Order History - Payment Status Display", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAuthenticatedUser();
  });

  // -----------------------------------------------------------------------
  // AC1: Order history cards show payment method icon and name
  // -----------------------------------------------------------------------
  describe("AC1: Payment method icon and name on order cards", () => {
    it("should display COD payment method label on order card", () => {
      const codOrder = createMockOrder({
        paymentMethod: "cod",
        paymentStatus: "pending",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [codOrder],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const paymentSection = screen.getByTestId("order-card-payment");
      expect(paymentSection).toBeInTheDocument();
      expect(within(paymentSection).getByText("Cash on Delivery")).toBeInTheDocument();
    });

    it("should display GCash payment method label on order card", () => {
      const gcashOrder = createMockOrder({
        paymentMethod: "gcash",
        paymentStatus: "paid",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [gcashOrder],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const paymentSection = screen.getByTestId("order-card-payment");
      expect(within(paymentSection).getByText("GCash")).toBeInTheDocument();
    });

    it("should display Credit/Debit Card payment method label", () => {
      const cardOrder = createMockOrder({
        paymentMethod: "card",
        paymentStatus: "paid",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [cardOrder],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const paymentSection = screen.getByTestId("order-card-payment");
      expect(
        within(paymentSection).getByText("Credit / Debit Card"),
      ).toBeInTheDocument();
    });

    it("should render payment method icon within order card", () => {
      const order = createMockOrder({
        paymentMethod: "gcash",
        paymentStatus: "paid",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const paymentSection = screen.getByTestId("order-card-payment");
      // Icon container should exist (the rounded-md div)
      const iconContainer = paymentSection.querySelector(
        ".rounded-md",
      );
      expect(iconContainer).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // AC2: Payment status badge colours
  // -----------------------------------------------------------------------
  describe("AC2: Payment status badge - Paid/Pending/Failed/Refunded", () => {
    it("should show green Paid badge for paid orders", () => {
      const order = createMockOrder({
        paymentMethod: "gcash",
        paymentStatus: "paid",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Paid");
      expect(badge.className).toMatch(/green/);
    });

    it("should show yellow Pending badge for pending payments", () => {
      const order = createMockOrder({
        paymentMethod: "cod",
        paymentStatus: "pending",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge.className).toMatch(/amber/);
    });

    it("should show red Failed badge for failed payments", () => {
      const order = createMockOrder({
        paymentMethod: "gcash",
        paymentStatus: "failed",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Failed");
      expect(badge.className).toMatch(/red/);
    });

    it("should show blue Refunded badge for refunded payments", () => {
      const order = createMockOrder({
        paymentMethod: "card",
        paymentStatus: "refunded",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Refunded");
      expect(badge.className).toMatch(/blue/);
    });
  });

  // -----------------------------------------------------------------------
  // AC3: Order detail shows full payment info
  // -----------------------------------------------------------------------
  describe("AC3: Order detail shows full payment info", () => {
    it("should show payment method, transaction ID, and paid date in detail view", async () => {
      const detailOrder = createMockOrder({
        id: "order-detail-001",
        paymentMethod: "gcash",
        paymentStatus: "paid",
        payment: {
          paymentId: "pay_abc123xyz",
          sourceId: "src_def456",
          paidAt: "2026-01-15T12:00:00Z",
        },
      });

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [detailOrder],
        loading: false,
        error: null,
      });

      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: detailOrder,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      // Click View Details to open dialog
      const viewBtn = screen.getByRole("button", { name: /view details/i });
      fireEvent.click(viewBtn);

      await waitFor(() => {
        expect(screen.getByTestId("order-detail-payment")).toBeInTheDocument();
      });

      // Payment method label (appears on both card and dialog)
      const gcashLabels = screen.getAllByText("GCash");
      expect(gcashLabels.length).toBeGreaterThanOrEqual(1);

      // Transaction ID
      const txId = screen.getByTestId("payment-transaction-id");
      expect(txId).toHaveTextContent("pay_abc123xyz");

      // Status badge
      const badge = screen.getByTestId("detail-payment-status-badge");
      expect(badge).toHaveTextContent("Paid");
    });

    it("should show payment method in detail even without transaction data", async () => {
      const codOrder = createMockOrder({
        id: "order-cod-detail",
        paymentMethod: "cod",
        paymentStatus: "pending",
      });

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [codOrder],
        loading: false,
        error: null,
      });

      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: codOrder,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      // Open detail
      const viewBtn = screen.getByRole("button", { name: /view details/i });
      fireEvent.click(viewBtn);

      await waitFor(() => {
        expect(screen.getByTestId("order-detail-payment")).toBeInTheDocument();
      });

      // Payment method label - use getAllByText since it appears on both card and dialog
      const matches = screen.getAllByText("Cash on Delivery");
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Payment Method")).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // AC4: COD orders show "Pay on Delivery/Pickup" status
  // -----------------------------------------------------------------------
  describe("AC4: COD-specific status labels", () => {
    it("should show 'Pay on Delivery' for COD delivery orders", () => {
      const order = createMockOrder({
        paymentMethod: "cod",
        paymentStatus: "pending",
        deliveryMethod: "lalamove",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toHaveTextContent("Pay on Delivery");
    });

    it("should show 'Pay on Pickup' for COD pickup orders", () => {
      const order = createMockOrder({
        paymentMethod: "cod",
        paymentStatus: "pending",
        deliveryMethod: "pickup",
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const badge = screen.getByTestId("payment-status-badge");
      expect(badge).toHaveTextContent("Pay on Pickup");
    });

    it("should show COD help text in order detail for pending COD delivery", async () => {
      const codOrder = createMockOrder({
        id: "cod-delivery",
        paymentMethod: "cod",
        paymentStatus: "pending",
        deliveryMethod: "lalamove",
      });

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [codOrder],
        loading: false,
        error: null,
      });

      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: codOrder,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const viewBtn = screen.getByRole("button", { name: /view details/i });
      fireEvent.click(viewBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/prepare exact amount for the delivery rider/i),
        ).toBeInTheDocument();
      });
    });

    it("should show COD help text for pickup orders", async () => {
      const codOrder = createMockOrder({
        id: "cod-pickup",
        paymentMethod: "cod",
        paymentStatus: "pending",
        deliveryMethod: "pickup",
      });

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [codOrder],
        loading: false,
        error: null,
      });

      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: codOrder,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const viewBtn = screen.getByRole("button", { name: /view details/i });
      fireEvent.click(viewBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/prepare exact amount for pickup/i),
        ).toBeInTheDocument();
      });
    });
  });

  // -----------------------------------------------------------------------
  // AC5: Digital payment orders show PayMongo transaction reference
  // -----------------------------------------------------------------------
  describe("AC5: Digital payments show PayMongo transaction reference", () => {
    it("should show transaction ID for GCash payment in detail view", async () => {
      const gcashOrder = createMockOrder({
        id: "gcash-order-001",
        paymentMethod: "gcash",
        paymentStatus: "paid",
        payment: {
          paymentId: "pay_gcash_ref_123",
          sourceId: "src_gcash_456",
          paidAt: "2026-01-15T12:30:00Z",
        },
      });

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [gcashOrder],
        loading: false,
        error: null,
      });

      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: gcashOrder,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const viewBtn = screen.getByRole("button", { name: /view details/i });
      fireEvent.click(viewBtn);

      await waitFor(() => {
        expect(screen.getByTestId("payment-transaction-id")).toHaveTextContent(
          "pay_gcash_ref_123",
        );
      });

      // Also shows source reference
      expect(screen.getByText("src_gcash_456")).toBeInTheDocument();
      expect(screen.getByText("Reference")).toBeInTheDocument();
    });

    it("should show paid date for completed digital payments", async () => {
      const cardOrder = createMockOrder({
        id: "card-order-001",
        paymentMethod: "card",
        paymentStatus: "paid",
        payment: {
          paymentId: "pay_card_789",
          paidAt: "2026-01-15T14:00:00Z",
        },
      });

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [cardOrder],
        loading: false,
        error: null,
      });

      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: cardOrder,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const viewBtn = screen.getByRole("button", { name: /view details/i });
      fireEvent.click(viewBtn);

      await waitFor(() => {
        expect(screen.getByTestId("payment-paid-date")).toBeInTheDocument();
      });

      expect(screen.getByText("Paid Date")).toBeInTheDocument();
    });

    it("should NOT show transaction details for COD orders", async () => {
      const codOrder = createMockOrder({
        id: "cod-no-ref",
        paymentMethod: "cod",
        paymentStatus: "pending",
      });

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [codOrder],
        loading: false,
        error: null,
      });

      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: codOrder,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const viewBtn = screen.getByRole("button", { name: /view details/i });
      fireEvent.click(viewBtn);

      await waitFor(() => {
        expect(screen.getByTestId("order-detail-payment")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("payment-transaction-id")).not.toBeInTheDocument();
      expect(screen.queryByTestId("payment-paid-date")).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // AC6: Filter orders by payment status
  // -----------------------------------------------------------------------
  describe("AC6: Payment status filter in order history", () => {
    const mixedOrders = [
      createMockOrder({
        id: "order-paid",
        orderNumber: "MASH-2026-P01",
        paymentMethod: "gcash",
        paymentStatus: "paid",
      }),
      createMockOrder({
        id: "order-pending",
        orderNumber: "MASH-2026-P02",
        paymentMethod: "cod",
        paymentStatus: "pending",
      }),
      createMockOrder({
        id: "order-failed",
        orderNumber: "MASH-2026-P03",
        paymentMethod: "card",
        paymentStatus: "failed",
      }),
      createMockOrder({
        id: "order-refunded",
        orderNumber: "MASH-2026-P04",
        paymentMethod: "gcash",
        paymentStatus: "refunded",
      }),
    ];

    it("should render payment status filter strip", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: mixedOrders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const filterStrip = screen.getByTestId("payment-status-filter");
      expect(filterStrip).toBeInTheDocument();
      expect(screen.getByTestId("payment-filter-all")).toBeInTheDocument();
      expect(screen.getByTestId("payment-filter-paid")).toBeInTheDocument();
      expect(screen.getByTestId("payment-filter-pending")).toBeInTheDocument();
      expect(screen.getByTestId("payment-filter-failed")).toBeInTheDocument();
      expect(screen.getByTestId("payment-filter-refunded")).toBeInTheDocument();
    });

    it("should show all orders by default (all filter)", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: mixedOrders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      // All 4 orders visible
      expect(screen.getByText("MASH-2026-P01")).toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P02")).toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P03")).toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P04")).toBeInTheDocument();
    });

    it("should filter to show only paid orders", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: mixedOrders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      fireEvent.click(screen.getByTestId("payment-filter-paid"));

      expect(screen.getByText("MASH-2026-P01")).toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P02")).not.toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P03")).not.toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P04")).not.toBeInTheDocument();
    });

    it("should filter to show only pending orders", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: mixedOrders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      fireEvent.click(screen.getByTestId("payment-filter-pending"));

      expect(screen.queryByText("MASH-2026-P01")).not.toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P02")).toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P03")).not.toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P04")).not.toBeInTheDocument();
    });

    it("should filter to show only failed orders", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: mixedOrders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      fireEvent.click(screen.getByTestId("payment-filter-failed"));

      expect(screen.queryByText("MASH-2026-P01")).not.toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P02")).not.toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P03")).toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P04")).not.toBeInTheDocument();
    });

    it("should filter to show only refunded orders", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: mixedOrders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      fireEvent.click(screen.getByTestId("payment-filter-refunded"));

      expect(screen.queryByText("MASH-2026-P01")).not.toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P02")).not.toBeInTheDocument();
      expect(screen.queryByText("MASH-2026-P03")).not.toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P04")).toBeInTheDocument();
    });

    it("should reset to all when clicking All filter again", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: mixedOrders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      // First filter to paid
      fireEvent.click(screen.getByTestId("payment-filter-paid"));
      expect(screen.queryByText("MASH-2026-P02")).not.toBeInTheDocument();

      // Then reset to all
      fireEvent.click(screen.getByTestId("payment-filter-all"));
      expect(screen.getByText("MASH-2026-P01")).toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P02")).toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P03")).toBeInTheDocument();
      expect(screen.getByText("MASH-2026-P04")).toBeInTheDocument();
    });

    it("should not show payment filter when no orders exist", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [],
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      expect(
        screen.queryByTestId("payment-status-filter"),
      ).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------------
  // Multiple payment methods on separate cards
  // -----------------------------------------------------------------------
  describe("Multiple orders with different payment methods", () => {
    it("should display correct payment labels for each order card", () => {
      const orders = [
        createMockOrder({
          id: "o1",
          orderNumber: "MASH-001",
          paymentMethod: "cod",
          paymentStatus: "pending",
        }),
        createMockOrder({
          id: "o2",
          orderNumber: "MASH-002",
          paymentMethod: "gcash",
          paymentStatus: "paid",
        }),
        createMockOrder({
          id: "o3",
          orderNumber: "MASH-003",
          paymentMethod: "card",
          paymentStatus: "paid",
        }),
      ];

      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);

      const paymentSections = screen.getAllByTestId("order-card-payment");
      expect(paymentSections).toHaveLength(3);

      expect(
        within(paymentSections[0]).getByText("Cash on Delivery"),
      ).toBeInTheDocument();
      expect(
        within(paymentSections[1]).getByText("GCash"),
      ).toBeInTheDocument();
      expect(
        within(paymentSections[2]).getByText("Credit / Debit Card"),
      ).toBeInTheDocument();
    });
  });
});
