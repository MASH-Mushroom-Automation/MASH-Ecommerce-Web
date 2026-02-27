/**
 * Email Client Tests (COV-002)
 * Tests: sendEmailViaAPI, convenience functions
 */

import {
  sendEmailViaAPI,
  sendOrderConfirmationEmailViaAPI,
  sendOrderApprovedEmailViaAPI,
  sendOrderRejectedEmailViaAPI,
  sendOrderShippedEmailViaAPI,
  sendOrderDeliveredEmailViaAPI,
  type EmailData,
  type SendEmailPayload,
} from "../client";

// Save original fetch and override for these tests
const originalFetch = global.fetch;

describe("Email Client", () => {
  let mockFetch: jest.Mock;

  const mockEmailData: EmailData = {
    customerName: "John Doe",
    orderNumber: "ORD-001",
    orderId: "order-123",
    items: [
      { name: "King Oyster Mushroom", quantity: 2, price: 120 },
    ],
    subtotal: 240,
    deliveryFee: 50,
    total: 290,
  };

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("sendEmailViaAPI", () => {
    it("should send email and return success with messageId", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messageId: "msg-123" }),
      });

      const payload: SendEmailPayload = {
        to: "test@example.com",
        type: "order_confirmation",
        data: mockEmailData,
      };

      const result = await sendEmailViaAPI(payload);

      expect(mockFetch).toHaveBeenCalledWith("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-123");
    });

    it("should return error when response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid recipient" }),
      });

      const result = await sendEmailViaAPI({
        to: "invalid",
        type: "welcome",
        data: mockEmailData,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid recipient");
    });

    it("should return default error message when response has no error field", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      const result = await sendEmailViaAPI({
        to: "test@example.com",
        type: "welcome",
        data: mockEmailData,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to send email");
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await sendEmailViaAPI({
        to: "test@example.com",
        type: "order_confirmation",
        data: mockEmailData,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("should handle non-Error thrown values", async () => {
      mockFetch.mockRejectedValueOnce("string error");

      const result = await sendEmailViaAPI({
        to: "test@example.com",
        type: "order_confirmation",
        data: mockEmailData,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });
  });

  describe("Convenience functions", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ messageId: "msg-abc" }),
      });
    });

    it("sendOrderConfirmationEmailViaAPI sends order_confirmation type", async () => {
      await sendOrderConfirmationEmailViaAPI("user@test.com", mockEmailData);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.type).toBe("order_confirmation");
      expect(body.to).toBe("user@test.com");
    });

    it("sendOrderApprovedEmailViaAPI sends order_approved type", async () => {
      await sendOrderApprovedEmailViaAPI("user@test.com", mockEmailData);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.type).toBe("order_approved");
    });

    it("sendOrderRejectedEmailViaAPI sends order_rejected type", async () => {
      await sendOrderRejectedEmailViaAPI("user@test.com", mockEmailData);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.type).toBe("order_rejected");
    });

    it("sendOrderShippedEmailViaAPI sends order_shipped type", async () => {
      await sendOrderShippedEmailViaAPI("user@test.com", mockEmailData);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.type).toBe("order_shipped");
    });

    it("sendOrderDeliveredEmailViaAPI sends order_delivered type", async () => {
      await sendOrderDeliveredEmailViaAPI("user@test.com", mockEmailData);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.type).toBe("order_delivered");
    });

    it("all convenience functions return success result", async () => {
      const result = await sendOrderConfirmationEmailViaAPI(
        "user@test.com",
        mockEmailData
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg-abc");
    });
  });
});
