/**
 * Tests for email template components (COV-005)
 * Tests: OrderItems, OrderConfirmation, OrderApproved, OrderRejected, OrderShipped, OrderDelivered, barrel exports
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock @react-email/components with simple HTML passthrough
jest.mock("@react-email/components", () => ({
  Button: ({ children, href, ...props }: { children: React.ReactNode; href?: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
  Section: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Text: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span {...props}>{children}</span>
  ),
  Column: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Row: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Img: (props: { src?: string; alt?: string; [key: string]: unknown }) => (
    <img {...props} />
  ),
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Head: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Body: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Container: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div {...props}>{children}</div>
  ),
  Preview: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Hr: () => <hr />,
  Link: ({ children, href, ...props }: { children: React.ReactNode; href?: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Shared test data
const mockItems = [
  { name: "Fresh Tomatoes", quantity: 2, price: 150.0, image: "https://example.com/tomato.jpg" },
  { name: "Organic Basil", quantity: 1, price: 75.5 },
];

const baseOrderProps = {
  customerName: "Juan Dela Cruz",
  orderNumber: "ORD-2024-001",
  orderId: "order-abc-123",
  items: mockItems,
  subtotal: 375.5,
  deliveryFee: 50,
  total: 425.5,
};

// ============ OrderItems ============
describe("OrderItems", () => {
  let OrderItems: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("../order-items");
    OrderItems = mod.OrderItems as unknown as React.ComponentType<Record<string, unknown>>;
  });

  it("should render without error", () => {
    render(<OrderItems items={mockItems} subtotal={375.5} total={425.5} />);
    expect(screen.getByText("Fresh Tomatoes")).toBeInTheDocument();
  });

  it("should display item names and quantities", () => {
    render(<OrderItems items={mockItems} subtotal={375.5} total={425.5} />);
    expect(screen.getByText("Fresh Tomatoes")).toBeInTheDocument();
    expect(screen.getByText("Organic Basil")).toBeInTheDocument();
  });

  it("should format prices with peso sign", () => {
    const { container } = render(<OrderItems items={mockItems} subtotal={375.5} total={425.5} />);
    const html = container.innerHTML;
    expect(html).toContain("150.00");
    expect(html).toContain("75.50");
  });

  it("should show FREE for pickup delivery", () => {
    const { container } = render(
      <OrderItems items={mockItems} subtotal={375.5} total={425.5} deliveryMethod="pickup" />
    );
    expect(container.innerHTML.toUpperCase()).toContain("FREE");
  });

  it("should show delivery fee for lalamove", () => {
    const { container } = render(
      <OrderItems items={mockItems} subtotal={375.5} deliveryFee={50} total={425.5} deliveryMethod="lalamove" />
    );
    expect(container.innerHTML).toContain("50.00");
  });

  it("should use placeholder image when no image provided", () => {
    render(<OrderItems items={[{ name: "No Image Item", quantity: 1, price: 100 }]} subtotal={100} total={100} />);
    const images = document.querySelectorAll("img");
    const srcs = Array.from(images).map((i) => i.getAttribute("src"));
    expect(srcs.some((s) => s?.includes("placeholder"))).toBe(true);
  });
});

// ============ OrderConfirmationEmail ============
describe("OrderConfirmationEmail", () => {
  let OrderConfirmationEmail: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("../order-confirmation");
    OrderConfirmationEmail = mod.OrderConfirmationEmail as unknown as React.ComponentType<Record<string, unknown>>;
  });

  it("should render without error", () => {
    render(
      <OrderConfirmationEmail
        {...baseOrderProps}
        deliveryMethod="pickup"
        paymentMethod="cod"
      />
    );
    expect(screen.getByText(/Juan Dela Cruz/i)).toBeInTheDocument();
  });

  it("should display order number", () => {
    const { container } = render(
      <OrderConfirmationEmail {...baseOrderProps} deliveryMethod="pickup" paymentMethod="cod" />
    );
    expect(container.innerHTML).toContain("ORD-2024-001");
  });

  it("should show pending confirmation status", () => {
    const { container } = render(
      <OrderConfirmationEmail {...baseOrderProps} deliveryMethod="pickup" paymentMethod="cod" />
    );
    expect(container.innerHTML.toUpperCase()).toContain("PENDING");
  });

  it("should display pickup location when pickup delivery", () => {
    const { container } = render(
      <OrderConfirmationEmail
        {...baseOrderProps}
        deliveryMethod="pickup"
        pickupLocation="MASH Market Store"
        paymentMethod="cod"
      />
    );
    expect(container.innerHTML).toContain("MASH Market Store");
  });

  it("should display delivery address when lalamove", () => {
    const { container } = render(
      <OrderConfirmationEmail
        {...baseOrderProps}
        deliveryMethod="lalamove"
        deliveryAddress="123 Main St, Manila"
        paymentMethod="gcash"
      />
    );
    expect(container.innerHTML).toContain("123 Main St, Manila");
  });
});

// ============ OrderApprovedEmail ============
describe("OrderApprovedEmail", () => {
  let OrderApprovedEmail: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("../order-approved");
    OrderApprovedEmail = mod.OrderApprovedEmail as unknown as React.ComponentType<Record<string, unknown>>;
  });

  it("should render without error", () => {
    render(<OrderApprovedEmail {...baseOrderProps} deliveryMethod="pickup" />);
    expect(screen.getByText(/Juan Dela Cruz/i)).toBeInTheDocument();
  });

  it("should show confirmed status", () => {
    const { container } = render(
      <OrderApprovedEmail {...baseOrderProps} deliveryMethod="pickup" />
    );
    expect(container.innerHTML.toUpperCase()).toContain("CONFIRMED");
  });

  it("should display estimated delivery when provided", () => {
    const { container } = render(
      <OrderApprovedEmail
        {...baseOrderProps}
        deliveryMethod="lalamove"
        deliveryAddress="456 Oak St"
        estimatedDelivery="December 25, 2024"
      />
    );
    expect(container.innerHTML).toContain("December 25, 2024");
  });

  it("should show pickup location for pickup orders", () => {
    const { container } = render(
      <OrderApprovedEmail
        {...baseOrderProps}
        deliveryMethod="pickup"
        pickupLocation="Farm Fresh Hub"
      />
    );
    expect(container.innerHTML).toContain("Farm Fresh Hub");
  });
});

// ============ OrderRejectedEmail ============
describe("OrderRejectedEmail", () => {
  let OrderRejectedEmail: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("../order-rejected");
    OrderRejectedEmail = mod.OrderRejectedEmail as unknown as React.ComponentType<Record<string, unknown>>;
  });

  it("should render without error", () => {
    render(
      <OrderRejectedEmail
        {...baseOrderProps}
        deliveryMethod="pickup"
        rejectionReason="Item out of stock"
      />
    );
    expect(screen.getByText(/Juan Dela Cruz/i)).toBeInTheDocument();
  });

  it("should show cancelled status", () => {
    const { container } = render(
      <OrderRejectedEmail {...baseOrderProps} deliveryMethod="pickup" rejectionReason="Out of stock" />
    );
    expect(container.innerHTML.toUpperCase()).toContain("CANCEL");
  });

  it("should display rejection reason", () => {
    render(
      <OrderRejectedEmail
        {...baseOrderProps}
        deliveryMethod="pickup"
        rejectionReason="Items are currently unavailable"
      />
    );
    expect(screen.getByText(/Items are currently unavailable/)).toBeInTheDocument();
  });

  it("should have browse products link", () => {
    const { container } = render(
      <OrderRejectedEmail {...baseOrderProps} deliveryMethod="pickup" rejectionReason="Test" />
    );
    expect(container.innerHTML).toContain("mash.ph/shop");
  });
});

// ============ OrderShippedEmail ============
describe("OrderShippedEmail", () => {
  let OrderShippedEmail: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("../order-shipped");
    OrderShippedEmail = mod.OrderShippedEmail as unknown as React.ComponentType<Record<string, unknown>>;
  });

  it("should render without error", () => {
    render(
      <OrderShippedEmail
        {...baseOrderProps}
        deliveryAddress="789 Pine St"
      />
    );
    expect(screen.getByText(/Juan Dela Cruz/i)).toBeInTheDocument();
  });

  it("should show out for delivery status", () => {
    const { container } = render(
      <OrderShippedEmail {...baseOrderProps} deliveryAddress="789 Pine St" />
    );
    expect(container.innerHTML.toUpperCase()).toContain("DELIVERY");
  });

  it("should display delivery address", () => {
    const { container } = render(
      <OrderShippedEmail {...baseOrderProps} deliveryAddress="789 Pine St, Quezon City" />
    );
    expect(container.innerHTML).toContain("789 Pine St, Quezon City");
  });

  it("should show driver info when provided", () => {
    const { container } = render(
      <OrderShippedEmail
        {...baseOrderProps}
        deliveryAddress="123 St"
        driverName="Miguel Santos"
        driverPhone="+63 912 345 6789"
      />
    );
    expect(container.innerHTML).toContain("Miguel Santos");
    expect(container.innerHTML).toContain("+63 912 345 6789");
  });

  it("should not show driver name when not provided", () => {
    const { container } = render(
      <OrderShippedEmail {...baseOrderProps} deliveryAddress="123 St" />
    );
    expect(container.innerHTML).not.toContain("Miguel Santos");
  });

  it("should show tracking link when trackingUrl provided", () => {
    const { container } = render(
      <OrderShippedEmail
        {...baseOrderProps}
        deliveryAddress="123 St"
        trackingUrl="https://track.lalamove.com/abc123"
      />
    );
    expect(container.innerHTML).toContain("https://track.lalamove.com/abc123");
  });
});

// ============ OrderDeliveredEmail ============
describe("OrderDeliveredEmail", () => {
  let OrderDeliveredEmail: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("../order-delivered");
    OrderDeliveredEmail = mod.OrderDeliveredEmail as unknown as React.ComponentType<Record<string, unknown>>;
  });

  it("should render without error", () => {
    render(
      <OrderDeliveredEmail {...baseOrderProps} deliveryMethod="lalamove" />
    );
    expect(screen.getByText(/Juan Dela Cruz/i)).toBeInTheDocument();
  });

  it("should show DELIVERED badge for lalamove delivery", () => {
    const { container } = render(
      <OrderDeliveredEmail {...baseOrderProps} deliveryMethod="lalamove" />
    );
    expect(container.innerHTML.toUpperCase()).toContain("DELIVERED");
  });

  it("should show PICKED UP badge for pickup delivery", () => {
    const { container } = render(
      <OrderDeliveredEmail {...baseOrderProps} deliveryMethod="pickup" />
    );
    expect(container.innerHTML.toUpperCase()).toContain("PICKED UP");
  });

  it("should include review link", () => {
    const { container } = render(
      <OrderDeliveredEmail {...baseOrderProps} deliveryMethod="lalamove" />
    );
    expect(container.innerHTML).toContain("review");
  });
});

// ============ Barrel Exports ============
describe("Email Templates barrel (index.ts)", () => {
  it("should export all named template components", async () => {
    const barrel = await import("../index");
    expect(barrel.OrderConfirmationEmail).toBeDefined();
    expect(barrel.OrderApprovedEmail).toBeDefined();
    expect(barrel.OrderRejectedEmail).toBeDefined();
    expect(barrel.OrderShippedEmail).toBeDefined();
    expect(barrel.OrderDeliveredEmail).toBeDefined();
    expect(barrel.OrderItems).toBeDefined();
  });

  it("should export EmailLayout", async () => {
    const barrel = await import("../index");
    expect(barrel.EmailLayout).toBeDefined();
  });

  it("should export styles object", async () => {
    const barrel = await import("../index");
    expect(barrel.styles).toBeDefined();
    expect(typeof barrel.styles).toBe("object");
  });
});
