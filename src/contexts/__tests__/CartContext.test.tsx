/**
 * Cart Context Unit Tests
 *
 * Tests all cart operations:
 * - Add to cart
 * - Remove from cart
 * - Update quantity
 * - Clear cart
 * - Firebase sync on login
 * - Cart v2 format validation
 * - Stock validation
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { CartProvider, useCart } from "../CartContext";
import { useAuth } from "../AuthContext";
import { FirebaseCartService } from "@/lib/firebase/cart";
import { CartItem, AddToCartProduct } from "@/types/api";
import { toast } from "sonner";
import type { AuthUser } from "@/types/api";
import { getCartCookie, setCartCookie, clearCartCookie } from "@/lib/cookies";

// Mock dependencies
jest.mock("@/lib/firebase/cart");
// sonner is mocked globally in jest.setupMocks.js via global.__mockToast
jest.mock("../AuthContext"); // Mock the entire AuthContext
jest.mock("@/lib/cookies"); // Mock cookie functions

// Access global toast mock
const mockToast = global.__mockToast as {
  success: jest.Mock;
  error: jest.Mock;
  info: jest.Mock;
  warning: jest.Mock;
  loading: jest.Mock;
  dismiss: jest.Mock;
};

// Test component to access cart context
function TestComponent() {
  const cart = useCart();

  return (
    <div>
      <div data-testid="cart-items">{JSON.stringify(cart.items)}</div>
      <div data-testid="cart-count">{cart.summary.itemCount}</div>
      <div data-testid="cart-total">{cart.summary.total}</div>
      <div data-testid="cart-loading">{cart.loading ? "loading" : "loaded"}</div>
      <button
        data-testid="add-product"
        onClick={() => {
          const product: AddToCartProduct = {
            id: "product-1",
            name: "Test Product",
            price: 100,
            image: "test.jpg",
            slug: "test-product",
            stock: 10,
            unit: "kg",
          };
          cart.addToCart(product, 2);
        }}
      >
        Add Product
      </button>
      <button
        data-testid="remove-product"
        onClick={() => cart.removeFromCart("product-1")}
      >
        Remove Product
      </button>
      <button
        data-testid="update-quantity"
        onClick={() => cart.updateQuantity("product-1", 5)}
      >
        Update Quantity
      </button>
      <button data-testid="clear-cart" onClick={() => cart.clearCart()}>
        Clear Cart
      </button>
      <div data-testid="is-in-cart">
        {cart.isInCart("product-1") ? "yes" : "no"}
      </div>
      <div data-testid="item-quantity">{cart.getItemQuantity("product-1")}</div>
    </div>
  );
}

// Helper to render components with mocked auth
function renderWithAuth(
  component: React.ReactElement,
  {
    user = null,
    isAuthenticated = false,
  }: {
    user?: AuthUser | null;
    isAuthenticated?: boolean;
  } = {}
) {
  // Mock useAuth hook
  (useAuth as jest.Mock).mockReturnValue({
    user,
    isAuthenticated,
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

  return render(component);
}

describe("CartContext", () => {
  const mockCartItems: CartItem[] = [
    {
      productId: "product-1",
      name: "Test Product 1",
      price: 100,
      image: "test1.jpg",
      slug: "test-product-1",
      stock: 10,
      quantity: 2,
      unit: "kg",
    },
    {
      productId: "product-2",
      name: "Test Product 2",
      price: 200,
      image: "test2.jpg",
      slug: "test-product-2",
      stock: 5,
      quantity: 1,
      unit: "piece",
    },
  ];

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset cookie mocks to return null by default
    (getCartCookie as jest.Mock).mockReturnValue(null);
    (setCartCookie as jest.Mock).mockImplementation(() => {});
    (clearCartCookie as jest.Mock).mockImplementation(() => {});
    
    // Reset toast mocks - use global mock, don't reassign
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockToast.info.mockClear();

    // Mock Firebase cart service methods with proper implementations
    (FirebaseCartService.saveCart as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (FirebaseCartService.getCart as jest.Mock) = jest.fn().mockResolvedValue([]);
    (FirebaseCartService.clearCart as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest.fn().mockResolvedValue([]);
    (FirebaseCartService.subscribeToCart as jest.Mock) = jest.fn().mockReturnValue(() => {});
  });

  describe("Initialization", () => {
    it("should initialize with empty cart", () => {
      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("cart-items").textContent).toBe("[]");
      expect(screen.getByTestId("cart-count").textContent).toBe("0");
      expect(screen.getByTestId("cart-total").textContent).toBe("0");
    });

    it("should load cart from cookie on mount (v2 format)", () => {
      const savedCart = {
        version: 2,
        items: mockCartItems,
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const cartItems = JSON.parse(
        screen.getByTestId("cart-items").textContent || "[]"
      );
      expect(cartItems).toHaveLength(2);
      expect(cartItems[0].productId).toBe("product-1");
    });

    it("should ignore invalid cart formats in cookie", () => {
      // Old v1 format (should be ignored)
      (getCartCookie as jest.Mock).mockReturnValue({ items: mockCartItems });

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("cart-items").textContent).toBe("[]");
    });

    it("should handle corrupted cookie data gracefully", () => {
      (getCartCookie as jest.Mock).mockReturnValue(null); // Corrupted data returns null

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("cart-items").textContent).toBe("[]");
    });
  });

  describe("Add to Cart", () => {
    it("should add new product to cart", async () => {
      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId("add-product");
      
      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        const cartItems = JSON.parse(
          screen.getByTestId("cart-items").textContent || "[]"
        );
        expect(cartItems).toHaveLength(1);
        expect(cartItems[0].productId).toBe("product-1");
        expect(cartItems[0].quantity).toBe(2);
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Test Product added to cart!",
        expect.objectContaining({
          description: "2 kg(s) added",
        })
      );
    });

    it("should update quantity if product already in cart", async () => {
      const savedCart = {
        version: 2,
        items: [mockCartItems[0]], // Already has 2 quantity
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId("add-product");
      
      await act(async () => {
        addButton.click(); // Adds 2 more
      });

      await waitFor(() => {
        const cartItems = JSON.parse(
          screen.getByTestId("cart-items").textContent || "[]"
        );
        expect(cartItems).toHaveLength(1);
        expect(cartItems[0].quantity).toBe(4); // 2 + 2
      });
    });

    it("should validate stock availability", async () => {
      const { container } = renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Create a test component that calls addToCart with low stock product
      function LowStockTest() {
        const cart = useCart();
        const lowStockProduct: AddToCartProduct = {
          id: "low-stock",
          name: "Low Stock Product",
          price: 50,
          image: "low.jpg",
          slug: "low-stock",
          stock: 3,
          unit: "kg",
        };

        return (
          <button
            data-testid="add-low-stock"
            onClick={() => cart.addToCart(lowStockProduct, 5)}
          >
            Add Low Stock
          </button>
        );
      }

      const { rerender } = renderWithAuth(
        <CartProvider>
          <LowStockTest />
        </CartProvider>
      );

      const button = screen.getByTestId("add-low-stock");
      
      await act(async () => {
        button.click();
      });

      expect(mockToast.error).toHaveBeenCalledWith("Not enough stock available", {
        description: "Only 3 items available",
      });
    });

    it("should prevent adding more than stock when item already in cart", async () => {
      function LimitedStockTest() {
        const cart = useCart();
        const product: AddToCartProduct = {
          id: "limited-stock",
          name: "Limited Stock",
          price: 50,
          image: "limited.jpg",
          slug: "limited-stock",
          stock: 5,
          unit: "piece",
        };

        return (
          <button
            data-testid="add-limited-stock"
            onClick={() => cart.addToCart(product, 2)}
          >
            Add Limited Stock
          </button>
        );
      }

      const savedCart = {
        version: 2,
        items: [
          {
            productId: "limited-stock",
            name: "Limited Stock",
            price: 50,
            image: "limited.jpg",
            slug: "limited-stock",
            stock: 5,
            quantity: 4, // Already have 4
            unit: "piece",
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <LimitedStockTest />
        </CartProvider>
      );

      const button = screen.getByTestId("add-limited-stock");
      
      await act(async () => {
        button.click(); // Try to add 2 more (total 6, but stock is 5)
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Cannot add more items",
        expect.objectContaining({
          description: expect.stringContaining("Only 5 available"),
        })
      );
    });
  });

  describe("Remove from Cart", () => {
    it("should remove product from cart", async () => {
      const savedCart = {
        version: 2,
        items: mockCartItems,
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const removeButton = screen.getByTestId("remove-product");
      
      await act(async () => {
        removeButton.click();
      });

      await waitFor(() => {
        const cartItems = JSON.parse(
          screen.getByTestId("cart-items").textContent || "[]"
        );
        expect(cartItems).toHaveLength(1);
        expect(cartItems[0].productId).toBe("product-2");
      });

      expect(mockToast.info).toHaveBeenCalledWith("Test Product 1 removed from cart");
    });

    it("should handle removing non-existent product", async () => {
      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const removeButton = screen.getByTestId("remove-product");
      
      await act(async () => {
        removeButton.click();
      });

      // Should not crash
      expect(screen.getByTestId("cart-items").textContent).toBe("[]");
    });
  });

  describe("Update Quantity", () => {
    it("should update product quantity", async () => {
      const savedCart = {
        version: 2,
        items: [mockCartItems[0]],
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const updateButton = screen.getByTestId("update-quantity");
      
      await act(async () => {
        updateButton.click(); // Update to quantity 5
      });

      await waitFor(() => {
        const cartItems = JSON.parse(
          screen.getByTestId("cart-items").textContent || "[]"
        );
        expect(cartItems[0].quantity).toBe(5);
      });
    });

    it("should remove item when quantity set to 0", async () => {
      function UpdateQuantityTest() {
        const cart = useCart();
        return (
          <button
            data-testid="set-quantity-zero"
            onClick={() => cart.updateQuantity("product-1", 0)}
          >
            Set Quantity to 0
          </button>
        );
      }

      const savedCart = {
        version: 2,
        items: [mockCartItems[0]],
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <UpdateQuantityTest />
          <div data-testid="cart-items-display">
            {/* Using TestComponent to show items */}
            <TestComponent />
          </div>
        </CartProvider>
      );

      const button = screen.getByTestId("set-quantity-zero");
      
      await act(async () => {
        button.click();
      });

      await waitFor(() => {
        const itemsDisplay = screen.getAllByTestId("cart-items")[0];
        expect(itemsDisplay.textContent).toBe("[]");
      });
    });

    it("should validate stock when updating quantity", async () => {
      function UpdateQuantityStockTest() {
        const cart = useCart();
        return (
          <button
            data-testid="update-too-high"
            onClick={() => cart.updateQuantity("product-1", 15)}
          >
            Update Quantity Too High
          </button>
        );
      }

      const savedCart = {
        version: 2,
        items: [mockCartItems[0]], // stock: 10
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <UpdateQuantityStockTest />
        </CartProvider>
      );

      const button = screen.getByTestId("update-too-high");

      await act(async () => {
        button.click(); // Try to set quantity to 15 (more than stock)
      });

      expect(mockToast.error).toHaveBeenCalledWith("Only 10 items available");
    });
  });

  describe("Clear Cart", () => {
    it("should clear all items from cart", async () => {
      const savedCart = {
        version: 2,
        items: mockCartItems,
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const clearButton = screen.getByTestId("clear-cart");
      
      await act(async () => {
        clearButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("cart-items").textContent).toBe("[]");
        expect(screen.getByTestId("cart-count").textContent).toBe("0");
      });

      expect(mockToast.info).toHaveBeenCalledWith("Cart cleared");
    });

    it("should clear Firebase cart if user is authenticated", async () => {
      const mockUser: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "BUYER",
        authProvider: "FIREBASE_GOOGLE",
      };

      const savedCart = {
        version: 2,
        items: mockCartItems,
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      // Mock Firebase methods with full implementation
      (FirebaseCartService.clearCart as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);
      (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockCartItems);
      (FirebaseCartService.subscribeToCart as jest.Mock) = jest
        .fn()
        .mockReturnValue(() => {});

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>,
        { user: mockUser, isAuthenticated: true }
      );

      // Wait for initial cart load
      await waitFor(() => {
        expect(screen.getByTestId("cart-count").textContent).toBe("3");
      });

      const clearButton = screen.getByTestId("clear-cart");
      
      await act(async () => {
        clearButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("cart-items").textContent).toBe("[]");
        expect(screen.getByTestId("cart-count").textContent).toBe("0");
      });

      expect(mockToast.info).toHaveBeenCalledWith("Cart cleared");
      
      await waitFor(() => {
        expect(FirebaseCartService.clearCart).toHaveBeenCalledWith("user-123");
      });
    });
  });

  describe("Cart Summary Calculations", () => {
    it("should calculate subtotal correctly", () => {
      const savedCart = {
        version: 2,
        items: mockCartItems, // product-1: 100 * 2 = 200, product-2: 200 * 1 = 200
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("cart-total").textContent).toBe("400"); // 200 + 200
    });

    it("should calculate item count correctly", () => {
      const savedCart = {
        version: 2,
        items: mockCartItems, // 2 + 1 = 3 items
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("cart-count").textContent).toBe("3");
    });
  });

  describe("Utility Methods", () => {
    it("should check if product is in cart", () => {
      const savedCart = {
        version: 2,
        items: [mockCartItems[0]],
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("is-in-cart").textContent).toBe("yes");
    });

    it("should get item quantity", () => {
      const savedCart = {
        version: 2,
        items: [mockCartItems[0]], // quantity: 2
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(savedCart);

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("item-quantity").textContent).toBe("2");
    });

    it("should return 0 for non-existent product quantity", () => {
      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      expect(screen.getByTestId("item-quantity").textContent).toBe("0");
    });
  });

  describe("Cookie Persistence", () => {
    it("should save cart to cookie on item change", async () => {
      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId("add-product");
      
      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(setCartCookie).toHaveBeenCalled();
        
        // Get the last call (after adding item), not the first (empty cart on mount)
        const calls = (setCartCookie as jest.Mock).mock.calls;
        const savedCart = calls[calls.length - 1][0];
        expect(savedCart.version).toBe(2);
        expect(savedCart.items).toHaveLength(1);
        expect(savedCart.updatedAt).toBeTruthy();
      });
    });

    it("should use v2 format when saving to cookie", async () => {
      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      const addButton = screen.getByTestId("add-product");
      
      await act(async () => {
        addButton.click();
      });

      await waitFor(() => {
        expect(setCartCookie).toHaveBeenCalled();
        // Get the last call (after adding item)
        const calls = (setCartCookie as jest.Mock).mock.calls;
        const savedCart = calls[calls.length - 1][0];
        
        expect(savedCart).toHaveProperty("version", 2);
        expect(savedCart).toHaveProperty("items");
        expect(savedCart).toHaveProperty("updatedAt");
        expect(Array.isArray(savedCart.items)).toBe(true);
      });
    });
  });

  describe("Firebase Integration (Authenticated Users)", () => {
    const mockUser: AuthUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      role: "BUYER",
      authProvider: "FIREBASE_GOOGLE",
    };

    it("should merge local cart with Firebase on login", async () => {
      const localCart = {
        version: 2,
        items: [mockCartItems[0]], // Local has product-1
        updatedAt: new Date().toISOString(),
      };
      (getCartCookie as jest.Mock).mockReturnValue(localCart);

      const firebaseItems = [mockCartItems[1]]; // Firebase has product-2
      const mergedItems = [...mockCartItems]; // Both products

      (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mergedItems);

      (FirebaseCartService.subscribeToCart as jest.Mock) = jest
        .fn()
        .mockReturnValue(() => {});

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>,
        { user: mockUser, isAuthenticated: true }
      );

      // Wait for mergeWithLocalCart to be called
      await waitFor(() => {
        expect(FirebaseCartService.mergeWithLocalCart).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify it was called with the correct user ID
      // Note: items array may be empty initially as cart loads from cookie asynchronously
      const mergeCall = (FirebaseCartService.mergeWithLocalCart as jest.Mock).mock.calls[0];
      expect(mergeCall[0]).toBe("user-123");
      expect(Array.isArray(mergeCall[1])).toBe(true);

      // Wait for merged cart to be set
      await waitFor(() => {
        const cartItems = JSON.parse(
          screen.getByTestId("cart-items").textContent || "[]"
        );
        expect(cartItems).toHaveLength(2);
      }, { timeout: 3000 });
    });

    it("should sync cart to Firebase when items change", async () => {
      (FirebaseCartService.saveCart as jest.Mock) = jest
        .fn()
        .mockResolvedValue(undefined);

      (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest
        .fn()
        .mockResolvedValue([]);

      (FirebaseCartService.subscribeToCart as jest.Mock) = jest
        .fn()
        .mockReturnValue(() => {});

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>,
        { user: mockUser, isAuthenticated: true }
      );

      const addButton = screen.getByTestId("add-product");
      
      await act(async () => {
        addButton.click();
      });

      // Wait for debounce (500ms)
      await new Promise((resolve) => setTimeout(resolve, 600));

      await waitFor(() => {
        expect(FirebaseCartService.saveCart).toHaveBeenCalled();
      });
    });

    it("should subscribe to Firebase cart updates on login", async () => {
      const unsubscribeMock = jest.fn();

      (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest
        .fn()
        .mockResolvedValue([]);

      (FirebaseCartService.subscribeToCart as jest.Mock) = jest
        .fn()
        .mockReturnValue(unsubscribeMock);

      const { unmount } = renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>,
        { user: mockUser, isAuthenticated: true }
      );

      await waitFor(() => {
        expect(FirebaseCartService.subscribeToCart).toHaveBeenCalledWith(
          "user-123",
          expect.any(Function),
          expect.any(Function)
        );
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it("should not sync to Firebase if userId is invalid", async () => {
      const invalidUser: AuthUser = {
        id: "undefined", // Invalid userId
        email: "test@example.com",
        name: "Test User",
        role: "BUYER",
        authProvider: "FIREBASE_GOOGLE",
      };

      (FirebaseCartService.saveCart as jest.Mock) = jest.fn();
      (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest
        .fn()
        .mockResolvedValue([]);
      (FirebaseCartService.subscribeToCart as jest.Mock) = jest
        .fn()
        .mockReturnValue(() => {});

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>,
        { user: invalidUser, isAuthenticated: true }
      );

      const addButton = screen.getByTestId("add-product");
      
      await act(async () => {
        addButton.click();
      });

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Should not call saveCart with invalid userId
      expect(FirebaseCartService.saveCart).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle Firebase merge errors gracefully", async () => {
      const mockUser: AuthUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        role: "BUYER",
        authProvider: "FIREBASE_GOOGLE",
      };

      (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest
        .fn()
        .mockRejectedValue(new Error("Firebase error"));

      (FirebaseCartService.subscribeToCart as jest.Mock) = jest
        .fn()
        .mockReturnValue(() => {});

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      renderWithAuth(
        <CartProvider>
          <TestComponent />
        </CartProvider>,
        { user: mockUser, isAuthenticated: true }
      );

      // Wait for merge to be attempted and error to be logged
      await waitFor(
        () => {
          expect(consoleErrorSpy).toHaveBeenCalled();
        },
        { timeout: 6000 }
      );

      // Verify the error was logged with correct message
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to merge carts:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it(
      "should handle Firebase save errors gracefully",
      async () => {
        const mockUser: AuthUser = {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
          role: "BUYER",
          authProvider: "FIREBASE_GOOGLE",
        };

        (FirebaseCartService.saveCart as jest.Mock) = jest
          .fn()
          .mockRejectedValue(new Error("Save failed"));

        (FirebaseCartService.mergeWithLocalCart as jest.Mock) = jest
          .fn()
          .mockResolvedValue([]);

        (FirebaseCartService.subscribeToCart as jest.Mock) = jest
          .fn()
          .mockReturnValue(() => {});

        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        renderWithAuth(
          <CartProvider>
            <TestComponent />
          </CartProvider>,
          { user: mockUser, isAuthenticated: true }
        );

        const addButton = screen.getByTestId("add-product");
        
        await act(async () => {
          addButton.click();
        });

        // Wait for debounce and Firebase sync attempt
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 700));
        });

        // Wait for error to be logged with increased timeout
        await waitFor(
          () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
          },
          { timeout: 6000 }
        );

        // Verify the error was logged with correct message
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to sync cart to Firebase:",
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      },
      10000
    ); // Increase test timeout to 10 seconds
  });

  describe("Context Hook", () => {
    it("should throw error when useCart is used outside provider", () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useCart must be used within a CartProvider");

      consoleErrorSpy.mockRestore();
    });
  });
});
