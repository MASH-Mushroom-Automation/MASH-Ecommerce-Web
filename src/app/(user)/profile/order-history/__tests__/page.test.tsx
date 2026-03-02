/**
 * Order History Page Tests
 *
 * Tests the page-level rendering: auth state, loading, error, empty,
 * tab navigation, tab counts, OrderCard rendering, and dialog states.
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { OrderStatus } from "@/lib/firebase/orders";

// Mock next/navigation
const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/profile/order-history",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock CartContext
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

// Mock Firebase orders
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
const mockToast = (global as any).__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  warning: jest.Mock;
};

import {
  useFirebaseOrder,
  useUserFirebaseOrders,
} from "@/hooks/useFirebaseOrders";

import OrderHistoryPage from "../page";

// Helper to create a mock order
function createMockOrder(
  overrides: Partial<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    deliveryMethod: string;
    total: number;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      totalPrice: number;
      image: string;
    }>;
  }> = {},
) {
  return {
    id: overrides.id || "order-123",
    orderNumber: overrides.orderNumber || "MASH-2026-001",
    status: overrides.status || ("pending_approval" as OrderStatus),
    items: overrides.items || [
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
    total: overrides.total || 318.8,
    deliveryMethod: overrides.deliveryMethod || "delivery",
    paymentMethod: "cod",
    shippingAddress: {
      fullName: "Test User",
      address: "123 Test St",
      city: "Manila",
      province: "NCR",
      postalCode: "1000",
      phone: "+63912345678",
    },
    buyerId: "user-123",
    sellerId: "seller-456",
    statusHistory: [
      {
        status: "pending_approval",
        timestamp: new Date("2026-01-15T10:00:00Z").toISOString(),
        note: "Order placed",
      },
    ],
    createdAt: new Date("2026-01-15T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-01-15T10:00:00Z").toISOString(),
  };
}

describe("OrderHistoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: { id: "user-123", email: "test@example.com" },
      isAuthenticated: true,
      loading: false,
      signInWithGoogle: jest.fn(),
      signInWithEmailPassword: jest.fn(),
      signUpWithEmailPassword: jest.fn(),
      signOut: jest.fn(),
      signOutEverywhere: jest.fn(),
      sendEmailSignInLink: jest.fn(),
      completeEmailLinkSignIn: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
      confirmPasswordReset: jest.fn(),
      requestEmailVerification: jest.fn(),
      verifyEmailCode: jest.fn(),
    });

    (useUserFirebaseOrders as jest.Mock).mockReturnValue({
      orders: [],
      loading: false,
      error: null,
      refreshOrders: jest.fn(),
    });

    (useFirebaseOrder as jest.Mock).mockReturnValue({
      order: null,
      loading: false,
      error: null,
    });
  });

  // ========================
  // 1. Unauthenticated state
  // ========================

  describe("Unauthenticated State", () => {
    it("shows sign-in prompt when not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        signInWithGoogle: jest.fn(),
        signInWithEmailPassword: jest.fn(),
        signUpWithEmailPassword: jest.fn(),
        signOut: jest.fn(),
        signOutEverywhere: jest.fn(),
        sendEmailSignInLink: jest.fn(),
        completeEmailLinkSignIn: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        confirmPasswordReset: jest.fn(),
        requestEmailVerification: jest.fn(),
        verifyEmailCode: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(
        screen.getByText("Sign in to view your orders"),
      ).toBeInTheDocument();
    });

    it("renders Sign In link to /login", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        loading: false,
        signInWithGoogle: jest.fn(),
        signInWithEmailPassword: jest.fn(),
        signUpWithEmailPassword: jest.fn(),
        signOut: jest.fn(),
        signOutEverywhere: jest.fn(),
        sendEmailSignInLink: jest.fn(),
        completeEmailLinkSignIn: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        confirmPasswordReset: jest.fn(),
        requestEmailVerification: jest.fn(),
        verifyEmailCode: jest.fn(),
      });

      render(<OrderHistoryPage />);
      const signInLink = screen.getByRole("link", { name: /sign in/i });
      expect(signInLink).toHaveAttribute("href", "/login");
    });
  });

  // ========================
  // 2. Loading state
  // ========================

  describe("Loading State", () => {
    it("shows loading spinner when orders are loading", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [],
        loading: true,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("Loading your orders...")).toBeInTheDocument();
    });
  });

  // ========================
  // 3. Error state
  // ========================

  describe("Error State", () => {
    it("renders error message when orders fail to load", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [],
        loading: false,
        error: "Failed to connect to Firebase",
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to connect to Firebase"),
      ).toBeInTheDocument();
    });

    it("renders Try Again button on error", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [],
        loading: false,
        error: "Timeout",
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(
        screen.getByRole("button", { name: /try again/i }),
      ).toBeInTheDocument();
    });
  });

  // ========================
  // 4. Empty orders state
  // ========================

  describe("Empty Orders State", () => {
    it("shows 'No orders yet' when authenticated with zero orders", () => {
      render(<OrderHistoryPage />);
      expect(screen.getByText("No orders yet")).toBeInTheDocument();
    });

    it("renders Browse Products link for empty all tab", () => {
      render(<OrderHistoryPage />);
      const browseLink = screen.getByRole("link", {
        name: /browse products/i,
      });
      expect(browseLink).toHaveAttribute("href", "/shop");
    });
  });

  // ========================
  // 5. Tab rendering
  // ========================

  describe("Tab Rendering", () => {
    it("renders all 5 tab buttons", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder()],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      // "All" only appears as tab, others appear in both tabs and stats
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getAllByText("Pending").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });
  });

  // ========================
  // 6. Quick Stats / Tab counts
  // ========================

  describe("Quick Stats", () => {
    it("shows Total Orders label and count labels", () => {
      const orders = [
        createMockOrder({
          id: "o1",
          status: "pending_approval",
          orderNumber: "MASH-001",
        }),
        createMockOrder({
          id: "o2",
          status: "processing",
          orderNumber: "MASH-002",
        }),
        createMockOrder({
          id: "o3",
          status: "completed",
          orderNumber: "MASH-003",
        }),
        createMockOrder({
          id: "o4",
          status: "cancelled",
          orderNumber: "MASH-004",
        }),
      ];
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders,
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
      // Counts: total=4, pending=1, active=1, completed=1
      // "4" for total orders count
      const countFour = screen.getAllByText("4");
      expect(countFour.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ========================
  // 7. Tab filtering
  // ========================

  describe("Tab Filtering", () => {
    it("filters to show only pending orders when Pending tab clicked", async () => {
      const user = userEvent.setup();
      const orders = [
        createMockOrder({
          id: "o1",
          status: "pending_approval",
          orderNumber: "MASH-PEND-001",
        }),
        createMockOrder({
          id: "o2",
          status: "completed",
          orderNumber: "MASH-COMP-001",
        }),
      ];
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders,
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);

      // Both orders visible on All tab
      expect(screen.getByText("MASH-PEND-001")).toBeInTheDocument();
      expect(screen.getByText("MASH-COMP-001")).toBeInTheDocument();

      // Click Pending tab — get the tab button (not the stats label)
      const tabButtons = screen.getAllByText("Pending");
      const pendingTab = tabButtons.find(
        (el) =>
          el.closest("button") &&
          el.closest(".flex.gap-1\\.5") !== null,
      );
      if (pendingTab) {
        await user.click(pendingTab.closest("button")!);
      }

      // Only pending order visible
      await waitFor(() => {
        expect(screen.getByText("MASH-PEND-001")).toBeInTheDocument();
        expect(screen.queryByText("MASH-COMP-001")).not.toBeInTheDocument();
      });
    });

    it("shows per-tab empty state with View All Orders button", async () => {
      const user = userEvent.setup();
      const orders = [
        createMockOrder({
          id: "o1",
          status: "pending_approval",
          orderNumber: "MASH-001",
        }),
      ];
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders,
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);

      // Click Completed tab (no completed orders)
      const completedBtns = screen.getAllByText("Completed");
      const completedTab = completedBtns.find(
        (el) =>
          el.closest("button") &&
          el.closest(".flex.gap-1\\.5") !== null,
      );
      if (completedTab) {
        await user.click(completedTab.closest("button")!);
      }

      await waitFor(() => {
        expect(screen.getByText("No completed orders")).toBeInTheDocument();
      });
      expect(
        screen.getByRole("button", { name: /view all orders/i }),
      ).toBeInTheDocument();
    });
  });

  // ========================
  // 8. OrderCard rendering
  // ========================

  describe("OrderCard Rendering", () => {
    it("renders order number and status badge", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder()],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("MASH-2026-001")).toBeInTheDocument();
      expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    });

    it("renders Delivery badge for delivery orders", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder({ deliveryMethod: "delivery" })],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("Delivery")).toBeInTheDocument();
    });

    it("renders Pickup badge for pickup orders", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder({ deliveryMethod: "pickup" })],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("Pickup")).toBeInTheDocument();
    });

    it("renders item names in the card", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder()],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("King Oyster Mushroom")).toBeInTheDocument();
    });

    it("renders View Details button", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder()],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(
        screen.getByRole("button", { name: /view details/i }),
      ).toBeInTheDocument();
    });

    it("renders formatted total (PHP currency)", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder({ total: 318.8 })],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      // Intl.NumberFormat with en-PH PHP renders like "₱318.80"
      const total = screen.getByText((content) =>
        content.includes("318.80"),
      );
      expect(total).toBeInTheDocument();
    });

    it("renders multiple order cards", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [
          createMockOrder({ id: "o1", orderNumber: "MASH-001" }),
          createMockOrder({ id: "o2", orderNumber: "MASH-002" }),
          createMockOrder({ id: "o3", orderNumber: "MASH-003" }),
        ],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("MASH-001")).toBeInTheDocument();
      expect(screen.getByText("MASH-002")).toBeInTheDocument();
      expect(screen.getByText("MASH-003")).toBeInTheDocument();
    });
  });

  // ========================
  // 9. Order Detail Dialog
  // ========================

  describe("Order Detail Dialog", () => {
    it("opens dialog when View Details is clicked", async () => {
      const user = userEvent.setup();
      const order = createMockOrder();
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });
      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order,
        loading: false,
        error: null,
      });

      render(<OrderHistoryPage />);
      await user.click(
        screen.getByRole("button", { name: /view details/i }),
      );

      // Dialog is open — check for Order Progress heading (dialog-only content)
      await waitFor(() => {
        expect(
          screen.getByText("Order Progress"),
        ).toBeInTheDocument();
      });
    });

    it("shows loading state in dialog", async () => {
      const user = userEvent.setup();
      const order = createMockOrder();
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });
      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: null,
        loading: true,
        error: null,
      });

      render(<OrderHistoryPage />);
      await user.click(
        screen.getByRole("button", { name: /view details/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText("Loading Order Details"),
        ).toBeInTheDocument();
      });
    });

    it("shows error state in dialog", async () => {
      const user = userEvent.setup();
      const order = createMockOrder();
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });
      (useFirebaseOrder as jest.Mock).mockReturnValue({
        order: null,
        loading: false,
        error: "Order not found",
      });

      render(<OrderHistoryPage />);
      await user.click(
        screen.getByRole("button", { name: /view details/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText("Failed to load order details."),
        ).toBeInTheDocument();
      });
    });
  });

  // ========================
  // 10. Header rendering
  // ========================

  describe("Header", () => {
    it("renders Order History title and description", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder()],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("Order History")).toBeInTheDocument();
      expect(
        screen.getByText("Track and manage your orders"),
      ).toBeInTheDocument();
    });

    it("renders Live Updates indicator", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder()],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("Live Updates")).toBeInTheDocument();
    });
  });

  // ========================
  // 11. Status-specific rendering
  // ========================

  describe("Status Badges", () => {
    it.each([
      ["pending_approval", "Pending Approval"],
      ["processing", "Processing"],
      ["shipped", "Shipped"],
      ["delivered", "Delivered"],
    ] as const)(
      "renders correct badge for %s status",
      (status, expectedLabel) => {
        (useUserFirebaseOrders as jest.Mock).mockReturnValue({
          orders: [createMockOrder({ status: status as OrderStatus })],
          loading: false,
          error: null,
          refreshOrders: jest.fn(),
        });

        render(<OrderHistoryPage />);
        expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      },
    );

    it("renders Completed badge for completed status", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder({ status: "completed" as OrderStatus })],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      // "Completed" appears in both tab and badge — verify badge exists
      const completedTexts = screen.getAllByText("Completed");
      expect(completedTexts.length).toBeGreaterThanOrEqual(2);
    });

    it("renders Cancelled badge for cancelled status", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder({ status: "cancelled" as OrderStatus })],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      // "Cancelled" appears in both tab and badge
      const cancelledTexts = screen.getAllByText("Cancelled");
      expect(cancelledTexts.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ========================
  // 12. Items count display
  // ========================

  describe("Items Count", () => {
    it("shows plural items text for multiple quantities", () => {
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [createMockOrder()],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      // 2 items total (quantity of 2)
      expect(screen.getByText("2 items total")).toBeInTheDocument();
    });

    it("shows singular item text for quantity of 1", () => {
      const order = createMockOrder({
        items: [
          {
            productId: "p1",
            name: "Shiitake",
            price: 100,
            quantity: 1,
            totalPrice: 100,
            image: "/s.jpg",
          },
        ],
      });
      (useUserFirebaseOrders as jest.Mock).mockReturnValue({
        orders: [order],
        loading: false,
        error: null,
        refreshOrders: jest.fn(),
      });

      render(<OrderHistoryPage />);
      expect(screen.getByText("1 item total")).toBeInTheDocument();
    });
  });
});
