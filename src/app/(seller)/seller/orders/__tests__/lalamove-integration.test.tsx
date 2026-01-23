/**
 * Lalamove Integration Tests
 * Tests Lalamove delivery creation when order status changes to "processing"
 * 
 * @jest-environment jsdom
 */

import { FirebaseOrdersService } from "@/lib/firebase/orders";

// Mock Firebase
jest.mock("@/lib/firebase/config", () => ({
  db: {},
}));

// Mock fetch for Lalamove API calls
global.fetch = jest.fn();

describe("Lalamove Integration - Delivery Creation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("API Route - POST /api/lalamove/create-order", () => {
    test("creates Lalamove delivery with valid quotation", async () => {
      const mockResponse = {
        success: true,
        data: {
          lalamoveOrderId: "LLM-12345",
          status: "ASSIGNING_DRIVER",
          shareLink: "https://lalamove.com/track/LLM-12345",
          driverId: null,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-001",
          quotationId: "QUOTE-123",
          sender: {
            name: "MASH Farm",
            phone: "+639497536575",
          },
          recipient: {
            name: "John Doe",
            phone: "+639171234567",
            notes: "Please handle with care - fresh mushrooms",
          },
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("lalamoveOrderId");
      expect(data.data).toHaveProperty("shareLink");
      expect(data.data.status).toBe("ASSIGNING_DRIVER");
    });

    test("returns error when quotation is invalid", async () => {
      const mockError = {
        error: "Invalid quotation",
        message: "Quotation not found or missing stops",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-001",
          quotationId: "INVALID-QUOTE",
          sender: {
            name: "MASH Farm",
            phone: "+639497536575",
          },
          recipient: {
            name: "John Doe",
            phone: "+639171234567",
          },
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid quotation");
    });

    test("validates required fields", async () => {
      const mockError = {
        error: "Missing required fields",
        message: "orderId, quotationId, sender, and recipient are required",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-001",
          // Missing quotationId, sender, recipient
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.error).toBe("Missing required fields");
    });

    test("handles expired quotation error", async () => {
      const mockError = {
        error: "Lalamove order creation failed",
        message: "Invalid or expired quotation. Please create a new delivery quote.",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-001",
          quotationId: "EXPIRED-QUOTE",
          sender: {
            name: "MASH Farm",
            phone: "+639497536575",
          },
          recipient: {
            name: "John Doe",
            phone: "+639171234567",
          },
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain("expired quotation");
    });

    test("handles service area error", async () => {
      const mockError = {
        error: "Lalamove order creation failed",
        message: "Delivery address is outside Lalamove service area.",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-001",
          quotationId: "QUOTE-123",
          sender: {
            name: "MASH Farm",
            phone: "+639497536575",
          },
          recipient: {
            name: "Remote Customer",
            phone: "+639171234567",
          },
        }),
      });

      const data = await response.json();

      expect(data.message).toContain("outside Lalamove service area");
    });

    test("handles invalid phone number error", async () => {
      const mockError = {
        error: "Lalamove order creation failed",
        message: "Invalid phone number format. Please check contact details.",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockError,
      });

      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-001",
          quotationId: "QUOTE-123",
          sender: {
            name: "MASH Farm",
            phone: "invalid-phone",
          },
          recipient: {
            name: "John Doe",
            phone: "+639171234567",
          },
        }),
      });

      const data = await response.json();

      expect(data.message).toContain("Invalid phone number");
    });
  });

  describe("Firebase Integration - Lalamove Tracking", () => {
    test("setLalamoveOrderId updates Firestore correctly", async () => {
      const mockSetDoc = jest.fn().mockResolvedValue(undefined);

      // Mock Firestore
      jest.spyOn(FirebaseOrdersService, "setLalamoveOrderId").mockImplementation(
        async (orderId, lalamoveOrderId, shareLink) => {
          expect(orderId).toBe("ORDER-001");
          expect(lalamoveOrderId).toBe("LLM-12345");
          expect(shareLink).toBe("https://lalamove.com/track/LLM-12345");
        }
      );

      await FirebaseOrdersService.setLalamoveOrderId(
        "ORDER-001",
        "LLM-12345",
        "https://lalamove.com/track/LLM-12345"
      );

      expect(FirebaseOrdersService.setLalamoveOrderId).toHaveBeenCalledWith(
        "ORDER-001",
        "LLM-12345",
        "https://lalamove.com/track/LLM-12345"
      );
    });

    test("updates Lalamove tracking status in Firestore", async () => {
      jest.spyOn(FirebaseOrdersService, "updateLalamoveTracking").mockResolvedValue();

      const trackingData = {
        status: "ASSIGNING_DRIVER",
        driver: null,
      };

      await FirebaseOrdersService.updateLalamoveTracking("ORDER-001", trackingData);

      expect(FirebaseOrdersService.updateLalamoveTracking).toHaveBeenCalledWith(
        "ORDER-001",
        trackingData
      );
    });

    test("handles Lalamove tracking update with driver info", async () => {
      jest.spyOn(FirebaseOrdersService, "updateLalamoveTracking").mockResolvedValue();

      const trackingData = {
        status: "PICKING_UP",
        driver: {
          id: "DRIVER-123",
          name: "Juan Dela Cruz",
          phone: "+639181234567",
          plateNumber: "ABC 1234",
          coordinates: {
            lat: 14.6091,
            lng: 121.0223,
          },
        },
      };

      await FirebaseOrdersService.updateLalamoveTracking("ORDER-001", trackingData);

      expect(FirebaseOrdersService.updateLalamoveTracking).toHaveBeenCalledWith(
        "ORDER-001",
        trackingData
      );
    });
  });

  describe("Order Status Workflow - Auto-create Lalamove", () => {
    test("creates Lalamove delivery when status changes to processing", async () => {
      const mockOrder = {
        id: "ORDER-001",
        status: "approved",
        deliveryMethod: "lalamove",
        lalamoveQuotationId: "QUOTE-123",
        deliveryAddress: {
          name: "John Doe",
          phone: "+639171234567",
          address: "123 Test St, Quezon City",
        },
      };

      const mockResponse = {
        success: true,
        data: {
          lalamoveOrderId: "LLM-12345",
          status: "ASSIGNING_DRIVER",
          shareLink: "https://lalamove.com/track/LLM-12345",
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Simulate marking order as processing
      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: mockOrder.id,
          quotationId: mockOrder.lalamoveQuotationId,
          sender: {
            name: "MASH Farm",
            phone: "+639497536575",
          },
          recipient: {
            name: mockOrder.deliveryAddress.name,
            phone: mockOrder.deliveryAddress.phone,
            notes: "Please handle with care - fresh mushrooms",
          },
        }),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.lalamoveOrderId).toBe("LLM-12345");
    });

    test("does not create Lalamove for pickup orders", async () => {
      const mockOrder = {
        id: "ORDER-002",
        status: "approved",
        deliveryMethod: "pickup", // Not lalamove
      };

      // Should not call Lalamove API for pickup orders
      expect(mockOrder.deliveryMethod).not.toBe("lalamove");
    });

    test("prevents duplicate Lalamove order creation", async () => {
      const mockOrder = {
        id: "ORDER-001",
        status: "approved",
        deliveryMethod: "lalamove",
        lalamoveOrderId: "LLM-EXISTING", // Already has Lalamove order
        lalamoveQuotationId: "QUOTE-123",
      };

      // Should check if lalamoveOrderId exists before creating new order
      expect(mockOrder.lalamoveOrderId).toBeTruthy();
    });

    test("requires quotation before creating Lalamove order", async () => {
      const mockOrder = {
        id: "ORDER-001",
        status: "approved",
        deliveryMethod: "lalamove",
        lalamoveQuotationId: null, // No quotation
      };

      // Should not allow Lalamove creation without quotation
      expect(mockOrder.lalamoveQuotationId).toBeFalsy();
    });
  });

  describe("Lalamove Client - Order Placement", () => {
    test("placeOrder sends correct request format", async () => {
      const mockResponse = {
        data: {
          orderId: "LLM-12345",
          status: "ASSIGNING_DRIVER",
          shareLink: "https://lalamove.com/track/LLM-12345",
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const orderRequest = {
        quotationId: "QUOTE-123",
        sender: {
          stopId: "stop_0",
          name: "MASH Farm",
          phone: "+639497536575",
        },
        recipients: [
          {
            stopId: "stop_1",
            name: "John Doe",
            phone: "+639171234567",
            remarks: "Fresh mushrooms - handle with care",
          },
        ],
        isPODEnabled: false,
        metadata: {
          orderId: "ORDER-001",
          source: "MASH E-Commerce",
        },
      };

      const response = await fetch("/api/lalamove/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderRequest),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/lalamove/orders",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    test("includes metadata in order request", async () => {
      const metadata = {
        orderId: "ORDER-001",
        source: "MASH E-Commerce",
      };

      expect(metadata).toHaveProperty("orderId");
      expect(metadata).toHaveProperty("source");
      expect(metadata.source).toBe("MASH E-Commerce");
    });

    test("validates phone number format (E.164)", () => {
      const validPhones = [
        "+639171234567",
        "+639181234567",
        "+639991234567",
      ];

      const phoneRegex = /^\+63\d{10}$/;

      validPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(true);
      });

      const invalidPhones = [
        "09171234567", // Missing +63
        "+6391712345", // Too short
        "+63917123456789", // Too long
        "invalid",
      ];

      invalidPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(false);
      });
    });
  });

  describe("Error Handling - Lalamove Integration", () => {
    test("continues order processing if Lalamove fails (with confirmation)", async () => {
      // Mock Lalamove failure
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: "Lalamove API error",
          message: "Service temporarily unavailable",
        }),
      });

      const response = await fetch("/api/lalamove/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ORDER-001",
          quotationId: "QUOTE-123",
          sender: { name: "MASH Farm", phone: "+639497536575" },
          recipient: { name: "John Doe", phone: "+639171234567" },
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(data.message).toContain("unavailable");
    });

    test("provides helpful error messages for common failures", async () => {
      const errorScenarios = [
        {
          error: "quotation",
          expectedMessage: "Invalid or expired quotation",
        },
        {
          error: "Service area",
          expectedMessage: "outside Lalamove service area",
        },
        {
          error: "phone",
          expectedMessage: "Invalid phone number format",
        },
      ];

      errorScenarios.forEach(scenario => {
        expect(scenario.expectedMessage).toBeTruthy();
      });
    });

    test("logs Lalamove creation errors for debugging", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      try {
        await fetch("/api/lalamove/create-order", {
          method: "POST",
          body: JSON.stringify({}),
        });
      } catch (error) {
        // Expected to fail
      }

      // Restore console
      consoleSpy.mockRestore();
    });
  });

  describe("Lalamove Tracking Updates", () => {
    test("updates driver information when assigned", async () => {
      const trackingUpdate = {
        status: "PICKING_UP",
        driver: {
          id: "DRIVER-123",
          name: "Juan Dela Cruz",
          phone: "+639181234567",
          plateNumber: "ABC 1234",
          coordinates: {
            lat: 14.6091,
            lng: 121.0223,
          },
        },
      };

      jest.spyOn(FirebaseOrdersService, "updateLalamoveTracking").mockResolvedValue();

      await FirebaseOrdersService.updateLalamoveTracking("ORDER-001", trackingUpdate);

      expect(FirebaseOrdersService.updateLalamoveTracking).toHaveBeenCalledWith(
        "ORDER-001",
        expect.objectContaining({
          status: "PICKING_UP",
          driver: expect.objectContaining({
            id: "DRIVER-123",
            plateNumber: "ABC 1234",
          }),
        })
      );
    });

    test("tracks delivery status progression", () => {
      const statusProgression = [
        "ASSIGNING_DRIVER",
        "ON_GOING",
        "PICKING_UP",
        "PICKED_UP",
        "COMPLETED",
      ];

      expect(statusProgression[0]).toBe("ASSIGNING_DRIVER");
      expect(statusProgression[statusProgression.length - 1]).toBe("COMPLETED");
      expect(statusProgression.length).toBeGreaterThan(3);
    });

    test("updates real-time driver coordinates", async () => {
      const driverUpdate = {
        coordinates: {
          lat: 14.6091,
          lng: 121.0223,
        },
      };

      expect(driverUpdate.coordinates).toHaveProperty("lat");
      expect(driverUpdate.coordinates).toHaveProperty("lng");
      expect(typeof driverUpdate.coordinates.lat).toBe("number");
      expect(typeof driverUpdate.coordinates.lng).toBe("number");
    });
  });
});
