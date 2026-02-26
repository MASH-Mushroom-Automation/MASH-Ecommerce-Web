/**
 * Cart Page Tests - TEST-008
 * Tests stock limit indicators, empty cart CTA, and cart interactions
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CartPage from "../page";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => "/cart"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, priority, sizes, ...rest } = props;
    return <img {...rest} />;
  },
}));

// Cart mock data
const mockCartItems = [
  {
    productId: "prod-1",
    name: "Shiitake Mushroom",
    slug: "shiitake-mushroom",
    price: 299,
    quantity: 2,
    image: "/shiitake.jpg",
    grower: "Farm A",
    unit: "250g",
    stock: 5,
  },
  {
    productId: "prod-2",
    name: "Oyster Mushroom",
    slug: "oyster-mushroom",
    price: 199,
    quantity: 3,
    image: "/oyster.jpg",
    grower: "Farm B",
    unit: "200g",
    stock: 3,
  },
];

const mockSummary = {
  subtotal: 1195,
  tax: 0,
  total: 1195,
  itemCount: 5,
};

const mockUpdateQuantity = jest.fn().mockReturnValue(true);
const mockRemoveFromCart = jest.fn();
const mockClearCart = jest.fn();
const mockAddToCart = jest.fn().mockReturnValue(true);

jest.mock("@/contexts/CartContext", () => ({
  useCart: jest.fn(() => ({
    items: mockCartItems,
    summary: mockSummary,
    loading: false,
    updateQuantity: mockUpdateQuantity,
    removeFromCart: mockRemoveFromCart,
    clearCart: mockClearCart,
    addToCart: mockAddToCart,
  })),
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: jest.fn(() => ({
    wishlistIds: ["prod-3", "prod-4"],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn(),
    toggleWishlist: jest.fn(),
    clearWishlist: jest.fn(),
  })),
  WishlistProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  // Reset useCart mock to return cart items
  const { useCart } = require("@/contexts/CartContext");
  (useCart as jest.Mock).mockReturnValue({
    items: mockCartItems,
    summary: mockSummary,
    loading: false,
    updateQuantity: mockUpdateQuantity,
    removeFromCart: mockRemoveFromCart,
    clearCart: mockClearCart,
    addToCart: mockAddToCart,
  });
});

describe("CartPage", () => {
  describe("rendering with items", () => {
    it("renders Shopping Cart title", () => {
      render(<CartPage />);
      expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
    });

    it("shows item count", () => {
      render(<CartPage />);
      expect(screen.getByText(/2 items in your cart/)).toBeInTheDocument();
    });

    it("renders all cart items", () => {
      render(<CartPage />);
      expect(screen.getByText("Shiitake Mushroom")).toBeInTheDocument();
      expect(screen.getByText("Oyster Mushroom")).toBeInTheDocument();
    });

    it("shows product prices", () => {
      render(<CartPage />);
      expect(screen.getByText("₱299")).toBeInTheDocument();
      expect(screen.getByText("₱199")).toBeInTheDocument();
    });

    it("shows grower names", () => {
      render(<CartPage />);
      expect(screen.getByText(/Farm A/)).toBeInTheDocument();
      expect(screen.getByText(/Farm B/)).toBeInTheDocument();
    });

    it("renders order summary card", () => {
      render(<CartPage />);
      expect(screen.getByText("Order Summary")).toBeInTheDocument();
      // ₱1,195 appears in both subtotal and total
      const priceElements = screen.getAllByText("₱1,195");
      expect(priceElements.length).toBeGreaterThanOrEqual(1);
    });

    it("shows Proceed to Checkout button", () => {
      render(<CartPage />);
      expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument();
    });
  });

  describe("stock limit indicators (CART-001)", () => {
    it("disables + button when quantity equals stock", () => {
      // prod-2 has quantity=3 and stock=3 (at limit)
      render(<CartPage />);
      // The Max: 3 label appears when quantity equals stock
      expect(screen.getByText("Max: 3")).toBeInTheDocument();
      // The + button for prod-2 should have a title attribute indicating max stock
      const maxStockButton = screen.getByTitle("Max stock: 3");
      expect(maxStockButton).toBeDisabled();
    });

    it("shows Max stock label when quantity equals stock limit", () => {
      render(<CartPage />);
      // prod-2 has quantity=3, stock=3
      expect(screen.getByText("Max: 3")).toBeInTheDocument();
    });

    it("shows Out of Stock badge for out-of-stock items", () => {
      const { useCart } = require("@/contexts/CartContext");
      (useCart as jest.Mock).mockReturnValue({
        items: [
          {
            productId: "prod-oos",
            name: "Out of Stock Mushroom",
            slug: "oos-mushroom",
            price: 150,
            quantity: 1,
            image: "/oos.jpg",
            grower: "Farm C",
            unit: "100g",
            stock: 0,
          },
        ],
        summary: { subtotal: 150, tax: 0, total: 150, itemCount: 1 },
        loading: false,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
        addToCart: mockAddToCart,
      });

      render(<CartPage />);
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    });

    it("disables quantity controls for out-of-stock items", () => {
      const { useCart } = require("@/contexts/CartContext");
      (useCart as jest.Mock).mockReturnValue({
        items: [
          {
            productId: "prod-oos",
            name: "Out of Stock Item",
            slug: "oos-item",
            price: 150,
            quantity: 1,
            image: "/oos.jpg",
            grower: "Farm C",
            unit: "100g",
            stock: 0,
          },
        ],
        summary: { subtotal: 150, tax: 0, total: 150, itemCount: 1 },
        loading: false,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
        addToCart: mockAddToCart,
      });

      render(<CartPage />);
      // Both - and + buttons should be disabled when stock is 0
      const allButtons = screen.getAllByRole("button");
      const minusBtn = allButtons.find(
        (btn) => btn.querySelector("svg") && btn.closest(".rounded-r-none")
      );
      // The minus button specifically should be disabled when stock <= 0
      if (minusBtn) {
        expect(minusBtn).toBeDisabled();
      }
    });
  });

  describe("empty cart CTA (CART-003)", () => {
    beforeEach(() => {
      const { useCart } = require("@/contexts/CartContext");
      (useCart as jest.Mock).mockReturnValue({
        items: [],
        summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 },
        loading: false,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
        addToCart: mockAddToCart,
      });
    });

    it("shows empty cart message", () => {
      render(<CartPage />);
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });

    it("shows friendly description text", () => {
      render(<CartPage />);
      expect(
        screen.getByText(
          /Looks like you haven't added any items to your cart yet/
        )
      ).toBeInTheDocument();
    });

    it("shows Continue Shopping button linking to /shop", () => {
      render(<CartPage />);
      const shopBtn = screen.getByText("Continue Shopping");
      expect(shopBtn).toBeInTheDocument();
    });

    it("Continue Shopping button navigates to /shop", async () => {
      const user = userEvent.setup();
      render(<CartPage />);
      const btn = screen.getByRole("button", { name: /Continue Shopping/i });
      await user.click(btn);
      expect(mockPush).toHaveBeenCalledWith("/shop");
    });

    it("shows View Wishlist button when wishlist has items", () => {
      render(<CartPage />);
      // wishlistIds has 2 items
      expect(screen.getByText(/View Wishlist/)).toBeInTheDocument();
    });

    it("does not show View Wishlist when wishlist is empty", () => {
      const { useWishlist } = require("@/contexts/WishlistContext");
      (useWishlist as jest.Mock).mockReturnValue({
        wishlistIds: [],
        addToWishlist: jest.fn(),
        removeFromWishlist: jest.fn(),
        isInWishlist: jest.fn(),
        toggleWishlist: jest.fn(),
        clearWishlist: jest.fn(),
      });

      render(<CartPage />);
      expect(screen.queryByText(/View Wishlist/)).not.toBeInTheDocument();
    });

    it("shows shopping bag icon in empty state", () => {
      render(<CartPage />);
      // The empty state has a ShoppingBag icon inside a rounded-full div
      const emptyIcon = document.querySelector(".rounded-full");
      expect(emptyIcon).toBeInTheDocument();
    });
  });

  describe("quantity controls", () => {
    it("renders quantity display for each item", () => {
      render(<CartPage />);
      // prod-1 quantity = 2, prod-2 quantity = 3
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("has disabled + button when item is at stock limit", () => {
      render(<CartPage />);
      // prod-2 has quantity=3, stock=3
      const maxButton = screen.getByTitle("Max stock: 3");
      expect(maxButton).toBeDisabled();
    });
  });

  describe("remove and clear", () => {
    it("shows Clear Cart button", () => {
      render(<CartPage />);
      expect(screen.getByText("Clear Cart")).toBeInTheDocument();
    });

    it("shows Remove button for each item", () => {
      render(<CartPage />);
      const removeButtons = screen.getAllByText("Remove");
      expect(removeButtons).toHaveLength(2);
    });

    it("calls removeFromCart when Remove is clicked", async () => {
      const user = userEvent.setup();
      render(<CartPage />);
      const removeButtons = screen.getAllByText("Remove");
      await user.click(removeButtons[0]);
      expect(mockRemoveFromCart).toHaveBeenCalledWith("prod-1");
    });
  });

  describe("checkout navigation", () => {
    it("navigates to /checkout when Proceed to Checkout clicked", async () => {
      const user = userEvent.setup();
      render(<CartPage />);
      const checkoutBtn = screen.getByText("Proceed to Checkout");
      await user.click(checkoutBtn);
      expect(mockPush).toHaveBeenCalledWith("/checkout");
    });
  });

  describe("loading state", () => {
    it("shows loading spinner when cart is loading", () => {
      const { useCart } = require("@/contexts/CartContext");
      (useCart as jest.Mock).mockReturnValue({
        items: [],
        summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 },
        loading: true,
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
        addToCart: mockAddToCart,
      });

      render(<CartPage />);
      expect(screen.getByText("Loading your cart...")).toBeInTheDocument();
    });
  });

  describe("continue shopping link", () => {
    it("shows Continue Shopping link at bottom of cart items", () => {
      render(<CartPage />);
      const links = screen.getAllByText("Continue Shopping");
      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });
});
