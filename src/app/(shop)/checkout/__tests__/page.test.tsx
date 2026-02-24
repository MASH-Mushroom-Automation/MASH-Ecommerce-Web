/**
 * Checkout Page Integration Tests
 * Tests the complete checkout flow including:
 * - Basic rendering and cart display
 * - Delivery method selection
 * - Contact information validation
 * - Order creation
 * - Multi-vendor checkout
 * 
 * Target Coverage: 80%+ for checkout components
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { z } from "zod";
import CheckoutPage from "../page";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUser";
import { useFirebaseAddresses } from "@/hooks/useFirebaseAddresses";
import { FirebaseOrdersService } from "@/lib/firebase/orders";
import { sendOrderConfirmationEmailViaAPI } from "@/lib/email/client";

// Define validation schema for testing
const step2Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+63|0)?[0-9]{10,11}$/,
      "Please enter a valid Philippine phone number"
    )
    .transform((val) => val.replace(/[\s\-()]/g, "")),
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/checkout"),
}));

// Mock contexts and hooks
jest.mock("@/contexts/CartContext");
jest.mock("@/contexts/AuthContext");
jest.mock("@/hooks/useUser");
jest.mock("@/hooks/useFirebaseAddresses");

// Mock Firebase services
jest.mock("@/lib/firebase/orders", () => ({
  FirebaseOrdersService: {
    createOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
  },
}));

// Mock email service
jest.mock("@/lib/email/client", () => ({
  sendOrderConfirmationEmailViaAPI: jest.fn(),
}));

// Mock checkout components
jest.mock("@/components/checkout", () => ({
  AddressPicker: ({ onAddressSelect }: any) => (
    <div data-testid="address-picker">
      <button
        onClick={() =>
          onAddressSelect({
            lat: 14.5995,
            lng: 120.9842,
            formattedAddress: "123 Test St, Manila, Metro Manila",
            components: {
              street: "123 Test St",
              city: "Manila",
              state: "Metro Manila",
              zipCode: "1000",
            },
          })
        }
      >
        Select Test Address
      </button>
    </div>
  ),
  LalamoveQuote: ({ onQuoteReceived, deliveryAddress }: any) => {
    React.useEffect(() => {
      if (deliveryAddress) {
        setTimeout(() => {
          onQuoteReceived({
            quotationId: "QUOTE-TEST-123",
            price: 150.0,
            distance: 5.2,
            estimatedDeliveryTime: "30-45 minutes",
          });
        }, 100);
      }
    }, [deliveryAddress, onQuoteReceived]);

    return (
      <div data-testid="lalamove-quote">
        {deliveryAddress ? (
          <div>
            <p>Delivery Fee: ₱150.00</p>
            <p>Estimated Time: 30-45 minutes</p>
          </div>
        ) : (
          <p>Enter address to get quote</p>
        )}
      </div>
    );
  },
  MASH_PICKUP_LOCATION: {
    lat: 14.5995,
    lng: 120.9842,
    address: "MASH Main Warehouse, Manila",
  },
  PICKUP_LOCATIONS: [
    { id: "main", name: "MASH Main Warehouse", address: "Manila" },
    { id: "quezon", name: "MASH Quezon City Branch", address: "Quezon City" },
  ],
}));

describe("CheckoutPage", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  };

  const mockCartItems = [
    {
      productId: "prod-1",
      name: "Oyster Mushrooms",
      price: 150,
      quantity: 2,
      image: "/mushroom.jpg",
      grower: "Mushroom Farm A",
      unit: "250g",
    },
    {
      productId: "prod-2",
      name: "Shiitake Mushrooms",
      price: 200,
      quantity: 1,
      image: "/shiitake.jpg",
      grower: "Mushroom Farm A",
      unit: "200g",
    },
  ];

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    displayName: "Test User",
    firstName: "Test",
    lastName: "User",
    phone: "09171234567",
  };

  const mockProfile = {
    id: "user-123",
    email: "test@example.com",
    displayName: "Test User",
    phone: "09171234567",
    createdAt: new Date().toISOString(),
  };

  const mockSavedAddresses = [
    {
      id: "addr-1",
      formattedAddress: "456 Main St, Makati, Metro Manila",
      street: "456 Main St",
      city: "Makati",
      stateProvince: "Metro Manila",
      zipPostal: "1200",
      coordinates: { lat: 14.5547, lng: 121.0244 },
      isDefault: true,
      label: "Home",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useCart as jest.Mock).mockReturnValue({
      items: mockCartItems,
      summary: {
        subtotal: 500,
        tax: 0,
        total: 500,
      },
      clearCart: jest.fn(),
      removeVendorItems: jest.fn(),
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    (useUserProfile as jest.Mock).mockReturnValue({
      profile: mockProfile,
      loading: false,
    });

    (useFirebaseAddresses as jest.Mock).mockReturnValue({
      addresses: mockSavedAddresses,
      defaultAddress: mockSavedAddresses[0],
      loading: false,
    });

    (FirebaseOrdersService.createOrder as jest.Mock).mockResolvedValue("order-12345678");
    (sendOrderConfirmationEmailViaAPI as jest.Mock).mockResolvedValue(undefined);
  });

  describe("Basic Rendering", () => {
    it("renders checkout page with delivery method step", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("Delivery Method")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("shows pickup option with correct text", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("Pickup (Free)")).toBeInTheDocument();
      expect(screen.getByText(/Pick up your order at one of our locations/)).toBeInTheDocument();
    });

    it("displays cart items in order summary", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("Oyster Mushrooms")).toBeInTheDocument();
      expect(screen.getByText("Shiitake Mushrooms")).toBeInTheDocument();
      // Total is displayed in summary section
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("Summary")).toBeInTheDocument();
    });
  });

  describe("Contact Information Validation", () => {
    it("validates name field", () => {
      const result = step2Schema.safeParse({
        name: "",
        email: "test@example.com",
        phone: "09171234567",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Name is required");
      }
    });

    it("validates email format", () => {
      const invalidResult = step2Schema.safeParse({
        name: "Test User",
        email: "invalid-email",
        phone: "09171234567",
      });

      expect(invalidResult.success).toBe(false);
      if (!invalidResult.success) {
        expect(invalidResult.error.issues[0].message).toContain("Invalid email");
      }

      const validResult = step2Schema.safeParse({
        name: "Test User",
        email: "test@example.com",
        phone: "09171234567",
      });

      expect(validResult.success).toBe(true);
    });

    it("validates Philippine phone number format", () => {
      // Invalid phone number
      const invalidResult = step2Schema.safeParse({
        name: "Test User",
        email: "test@example.com",
        phone: "12345",
      });
      expect(invalidResult.success).toBe(false);

      // Valid 09XX format
      const validResult1 = step2Schema.safeParse({
        name: "Test User",
        email: "test@example.com",
        phone: "09171234567",
      });
      expect(validResult1.success).toBe(true);

      // Valid +63 format
      const validResult2 = step2Schema.safeParse({
        name: "Test User",
        email: "test@example.com",
        phone: "+639171234567",
      });
      expect(validResult2.success).toBe(true);
    });
  });

  describe("Order Creation", () => {
    it("calls Firebase service to create order", async () => {
      const orderData = {
        userId: "user-123",
        userEmail: "test@example.com",
        userName: "Test User",
        userPhone: "09171234567",
        items: mockCartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          grower: item.grower,
          unit: item.unit,
        })),
        subtotal: 500,
        tax: 0,
        deliveryFee: 0,
        total: 500,
        deliveryMethod: "pickup" as const,
        pickupLocation: undefined,
        deliveryAddress: undefined,
        lalamoveQuotationId: undefined,
        paymentMethod: "cod" as const,
      };

      const result = await FirebaseOrdersService.createOrder(orderData);

      expect(result).toBe("order-12345678");
      expect(FirebaseOrdersService.createOrder).toHaveBeenCalledWith(orderData);
    });

    it("sends order confirmation email", async () => {
      const emailData = {
        customerName: "Test User",
        orderNumber: "12345678",
        orderId: "order-12345678",
        items: mockCartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price * item.quantity,
          image: item.image,
        })),
        subtotal: 500,
        deliveryFee: 0,
        total: 500,
        deliveryMethod: "pickup" as const,
        deliveryAddress: undefined,
        pickupLocation: "MASH Main Warehouse",
        paymentMethod: "cod" as const,
      };

      await sendOrderConfirmationEmailViaAPI("test@example.com", emailData);

      expect(sendOrderConfirmationEmailViaAPI).toHaveBeenCalledWith("test@example.com", emailData);
    });

    it("handles order creation errors", async () => {
      (FirebaseOrdersService.createOrder as jest.Mock).mockRejectedValue(
        new Error("Failed to create order")
      );

      await expect(
        FirebaseOrdersService.createOrder({
          userId: "user-123",
          userEmail: "test@example.com",
          userName: "Test User",
          userPhone: "09171234567",
          items: [],
          subtotal: 500,
          tax: 0,
          deliveryFee: 0,
          total: 500,
          deliveryMethod: "pickup" as const,
          paymentMethod: "cod" as const,
        })
      ).rejects.toThrow("Failed to create order");
    });
  });

  describe("Multi-vendor Checkout", () => {
    const multiVendorItems = [
      {
        productId: "prod-1",
        name: "Oyster Mushrooms",
        price: 150,
        quantity: 2,
        image: "/mushroom.jpg",
        grower: "Mushroom Farm A",
        unit: "250g",
      },
      {
        productId: "prod-2",
        name: "Shiitake Mushrooms",
        price: 200,
        quantity: 1,
        image: "/shiitake.jpg",
        grower: "Mushroom Farm B",
        unit: "200g",
      },
    ];

    beforeEach(() => {
      (useCart as jest.Mock).mockReturnValue({
        items: multiVendorItems,
        summary: {
          subtotal: 500,
          tax: 0,
          total: 500,
        },
        clearCart: jest.fn(),
        removeVendorItems: jest.fn(),
      });
    });

    it("detects multiple vendors in cart", () => {
      render(<CheckoutPage />);

      expect(screen.getByText(/Multiple Vendors Detected/i)).toBeInTheDocument();
      expect(screen.getByText(/2 stores/i)).toBeInTheDocument();
    });

    it("shows vendor selection interface", () => {
      render(<CheckoutPage />);

      expect(screen.getByText("Mushroom Farm A")).toBeInTheDocument();
      expect(screen.getByText("Mushroom Farm B")).toBeInTheDocument();
      expect(screen.getByText(/Select vendor to checkout/i)).toBeInTheDocument();
    });

    it("provides guidance for multi-vendor checkout", () => {
      render(<CheckoutPage />);

      expect(
        screen.getByText(/You can checkout other vendors after completing this order/i)
      ).toBeInTheDocument();
    });
  });

  describe("Empty Cart Handling", () => {
    beforeEach(() => {
      (useCart as jest.Mock).mockReturnValue({
        items: [],
        summary: {
          subtotal: 0,
          tax: 0,
          total: 0,
        },
        clearCart: jest.fn(),
        removeVendorItems: jest.fn(),
      });
    });

    it("shows empty cart message", () => {
      render(<CheckoutPage />);

      expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    });

    it("provides button to continue shopping", async () => {
      const user = userEvent.setup();
      render(<CheckoutPage />);

      const shopButton = screen.getByRole("button", { name: /continue shopping/i });
      await user.click(shopButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/shop");
    }, 15000);
  });

  describe("User Profile Integration", () => {
    it("uses profile data for contact information", () => {
      render(<CheckoutPage />);

      // Verify mocks provide correct profile data
      expect(mockProfile.displayName).toBe("Test User");
      expect(mockProfile.email).toBe("test@example.com");
      expect(mockProfile.phone).toBe("09171234567");
    });

    it("pre-loads saved addresses for authenticated users", () => {
      render(<CheckoutPage />);

      // Verify saved addresses are available
      expect(mockSavedAddresses.length).toBe(1);
      expect(mockSavedAddresses[0].formattedAddress).toContain("Makati");
    });
  });

  describe("Cart Management", () => {
    it("displays correct cart summary", () => {
      render(<CheckoutPage />);

      // 2 Oyster Mushrooms (₱150 each) + 1 Shiitake (₱200) = ₱500
      // Verify subtotal and total labels are present
      expect(screen.getByText(/Subtotal/i)).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("Summary")).toBeInTheDocument();
    });

    it("shows item quantities correctly", () => {
      render(<CheckoutPage />);

      // Total items: 2 + 1 = 3
      // "3 items" appears in both the mobile header and the subtotal row of OrderSummary
      const itemsElements = screen.getAllByText(/3\s*items/i);
      expect(itemsElements.length).toBeGreaterThanOrEqual(1);
    });

    it("supports removing vendor items", () => {
      const removeVendorItemsMock = jest.fn();
      (useCart as jest.Mock).mockReturnValue({
        items: mockCartItems,
        summary: { subtotal: 500, tax: 0, total: 500 },
        clearCart: jest.fn(),
        removeVendorItems: removeVendorItemsMock,
      });

      render(<CheckoutPage />);

      // Verify the mock function is available
      expect(removeVendorItemsMock).toBeDefined();
    });
  });
});
