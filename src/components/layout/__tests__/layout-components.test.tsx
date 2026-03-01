/**
 * Tests for layout components: CartDropdown, NotificationDropdown
 * COV-017: Layout component tests
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));

// Mock analytics
jest.mock("@/lib/analytics", () => ({
  trackAddToCart: jest.fn(),
  trackRemoveFromCart: jest.fn(),
}));

// ============ CartDropdown Tests ============
describe("CartDropdown", () => {
  const mockItems = [
    {
      id: "item-1",
      productId: "prod-1",
      name: "King Oyster Mushroom",
      price: 120,
      quantity: 2,
      image: "/king.jpg",
      slug: "king-oyster",
      grower: "Farm A",
      maxQuantity: 10,
    },
    {
      id: "item-2",
      productId: "prod-2",
      name: "Blue Oyster Mushroom",
      price: 95,
      quantity: 1,
      image: "/blue.jpg",
      slug: "blue-oyster",
      grower: "Farm B",
      maxQuantity: 5,
    },
  ];

  const mockCartContext = {
    items: mockItems,
    summary: { subtotal: 335, itemCount: 3, totalItems: 2 },
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
    addToCart: jest.fn(),
  };

  const mockWishlistContext = {
    items: [],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn(() => false),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock contexts
  jest.mock("@/contexts/CartContext", () => ({
    useCart: jest.fn(() => mockCartContext),
    CartProvider: ({ children }: any) => children,
  }));

  jest.mock("@/contexts/WishlistContext", () => ({
    useWishlist: jest.fn(() => mockWishlistContext),
    WishlistProvider: ({ children }: any) => children,
  }));

  let CartDropdown: any;

  beforeAll(async () => {
    const mod = await import("@/components/layout/cart-dropdown");
    CartDropdown = mod.CartDropdown;
  });

  it("should render the cart trigger button", () => {
    render(<CartDropdown />);
    // Should have a button with cart icon
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should show item count badge", () => {
    render(<CartDropdown />);
    // Badge shows count from cart context (actual badge is "2")
    expect(screen.getByText("2")).toBeDefined();
  });
});

// ============ NotificationDropdown Tests ============
describe("NotificationDropdown", () => {
  jest.mock("@/hooks/useFirebaseNotifications", () => ({
    useFirebaseNotifications: jest.fn(() => ({
      notifications: [
        {
          id: "notif-1",
          title: "New Order",
          message: "You have a new order from John",
          type: "order",
          read: false,
          createdAt: new Date("2026-02-27T10:00:00Z"),
        },
        {
          id: "notif-2",
          title: "Review Posted",
          message: "A customer left a 5-star review",
          type: "review",
          read: true,
          createdAt: new Date("2026-02-26T15:00:00Z"),
        },
      ],
      unreadNotifications: [
        {
          id: "notif-1",
          title: "New Order",
          message: "You have a new order from John",
          type: "order",
          read: false,
          createdAt: new Date("2026-02-27T10:00:00Z"),
        },
      ],
      unreadCount: 1,
      loading: false,
      error: null,
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      deleteNotification: jest.fn(),
      clearAll: jest.fn(),
      refresh: jest.fn(),
    })),
  }));

  // Mock firebase notifications type
  jest.mock("@/lib/firebase/notifications", () => ({
    NotificationType: {
      ORDER: "order",
      REVIEW: "review",
      SYSTEM: "system",
    },
  }));

  jest.mock("date-fns", () => ({
    formatDistanceToNow: jest.fn(() => "2 hours ago"),
  }));

  let NotificationDropdown: any;

  beforeAll(async () => {
    const mod = await import("@/components/layout/notification-dropdown");
    NotificationDropdown = mod.NotificationDropdown;
  });

  it("should render the notification trigger", () => {
    render(<NotificationDropdown />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
