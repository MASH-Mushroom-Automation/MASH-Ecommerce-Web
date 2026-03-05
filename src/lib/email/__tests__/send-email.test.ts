/**
 * Tests for src/lib/email/send-email.ts
 * Email dispatch routing, template rendering, error handling
 */

// Mock gmail-smtp module with inline factory (avoids hoisting issue)
jest.mock("../gmail-smtp", () => ({
  isGmailConfigured: jest.fn(),
  sendRawEmail: jest.fn(),
}));

// Mock react-email render with inline factory
jest.mock("@react-email/components", () => ({
  render: jest.fn(),
}));

// Mock email templates
jest.mock("../templates", () => ({
  OrderConfirmationEmail: jest.fn((props: any) => `OrderConfirmation:${props.orderNumber}`),
  OrderApprovedEmail: jest.fn((props: any) => `OrderApproved:${props.orderNumber}`),
  OrderRejectedEmail: jest.fn((props: any) => `OrderRejected:${props.orderNumber}`),
  OrderShippedEmail: jest.fn((props: any) => `OrderShipped:${props.orderNumber}`),
  OrderDeliveredEmail: jest.fn((props: any) => `OrderDelivered:${props.orderNumber}`),
}));

import {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderApprovedEmail,
  sendOrderRejectedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  isEmailConfigured,
} from "../send-email";
import type { SendEmailPayload } from "../send-email";

// Get mock references AFTER import
import { isGmailConfigured, sendRawEmail } from "../gmail-smtp";
import { render } from "@react-email/components";

const mockIsGmailConfigured = isGmailConfigured as jest.Mock;
const mockSendRawEmail = sendRawEmail as jest.Mock;
const mockRender = render as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockIsGmailConfigured.mockReturnValue(true);
  mockRender.mockResolvedValue("<html>rendered</html>");
  mockSendRawEmail.mockResolvedValue({ success: true, messageId: "msg-test-123" });
});

const baseData: SendEmailPayload["data"] = {
  customerName: "John Doe",
  orderNumber: "ORD-001",
  orderId: "order-abc",
  items: [
    { name: "Shiitake Mushroom", quantity: 2, price: 150 },
  ],
  subtotal: 300,
  deliveryFee: 50,
  total: 350,
  deliveryMethod: "pickup",
};

// ---- isEmailConfigured re-export ----
describe("isEmailConfigured", () => {
  it("should re-export isGmailConfigured", () => {
    mockIsGmailConfigured.mockReturnValue(true);
    expect(isEmailConfigured()).toBe(true);

    mockIsGmailConfigured.mockReturnValue(false);
    expect(isEmailConfigured()).toBe(false);
  });
});

// ---- sendEmail ----
describe("sendEmail", () => {
  it("should return failure when Gmail is not configured", async () => {
    mockIsGmailConfigured.mockReturnValue(false);

    const result = await sendEmail({
      to: "test@example.com",
      type: "order_confirmation",
      data: baseData,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Email service not configured");
    expect(mockSendRawEmail).not.toHaveBeenCalled();
  });

  it("should send order_confirmation email", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_confirmation",
      data: baseData,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe("msg-test-123");
    expect(mockRender).toHaveBeenCalled();
    expect(mockSendRawEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        subject: expect.stringContaining("ORD-001"),
        html: "<html>rendered</html>",
      })
    );
  });

  it("should send order_approved email", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_approved",
      data: { ...baseData, estimatedDelivery: "2026-02-27" },
    });

    expect(result.success).toBe(true);
    expect(mockSendRawEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("Confirmed"),
      })
    );
  });

  it("should send order_rejected email", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_rejected",
      data: { ...baseData, rejectionReason: "Out of stock" },
    });

    expect(result.success).toBe(true);
    expect(mockSendRawEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("Could Not Be Processed"),
      })
    );
  });

  it("should send order_shipped email", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_shipped",
      data: {
        ...baseData,
        deliveryAddress: "123 Main St",
        driverName: "Juan",
        driverPhone: "+639171234567",
        trackingUrl: "https://track.example.com/123",
      },
    });

    expect(result.success).toBe(true);
    expect(mockSendRawEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("Out for Delivery"),
      })
    );
  });

  it("should send order_delivered email for delivery", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_delivered",
      data: { ...baseData, deliveryMethod: "lalamove" },
    });

    expect(result.success).toBe(true);
    expect(mockSendRawEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("Delivered"),
      })
    );
  });

  it("should send order_delivered email for pickup", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_delivered",
      data: { ...baseData, deliveryMethod: "pickup" },
    });

    expect(result.success).toBe(true);
    expect(mockSendRawEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("Picked Up"),
      })
    );
  });

  it("should return failure for unknown email type", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      type: "unknown_type" as any,
      data: baseData,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown email type");
  });

  it("should handle render errors gracefully", async () => {
    mockRender.mockRejectedValueOnce(new Error("Template render failed"));

    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_confirmation",
      data: baseData,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Template render failed");
  });

  it("should handle SMTP send errors gracefully", async () => {
    mockSendRawEmail.mockResolvedValueOnce({
      success: false,
      error: "SMTP timeout",
    });

    const result = await sendEmail({
      to: "customer@example.com",
      type: "order_confirmation",
      data: baseData,
    });

    // sendEmail returns what sendRawEmail returns
    expect(result.success).toBe(false);
  });
});

// ---- Convenience functions ----
describe("convenience email functions", () => {
  it("sendOrderConfirmationEmail should delegate to sendEmail", async () => {
    const result = await sendOrderConfirmationEmail("test@example.com", baseData);
    expect(result.success).toBe(true);
    expect(mockSendRawEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("ORD-001"),
      })
    );
  });

  it("sendOrderApprovedEmail should delegate to sendEmail", async () => {
    const result = await sendOrderApprovedEmail("test@example.com", baseData);
    expect(result.success).toBe(true);
  });

  it("sendOrderRejectedEmail should delegate to sendEmail", async () => {
    const result = await sendOrderRejectedEmail("test@example.com", baseData);
    expect(result.success).toBe(true);
  });

  it("sendOrderShippedEmail should delegate to sendEmail", async () => {
    const result = await sendOrderShippedEmail("test@example.com", {
      ...baseData,
      deliveryAddress: "123 Main St",
    });
    expect(result.success).toBe(true);
  });

  it("sendOrderDeliveredEmail should delegate to sendEmail", async () => {
    const result = await sendOrderDeliveredEmail("test@example.com", baseData);
    expect(result.success).toBe(true);
  });
});
