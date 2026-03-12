import { render, screen } from "@testing-library/react";
import DeliveryTrackingBanner from "../DeliveryTrackingBanner";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <a href={href} className={className} data-testid="tracking-link">
        {children}
      </a>
    );
  };
});

// Mock lucide-react
jest.mock("lucide-react", () => ({
  MapPin: ({ className }: { className?: string }) => (
    <span data-testid="map-pin-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <span data-testid="clock-icon" className={className} />
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <span data-testid="chevron-icon" className={className} />
  ),
}));

// Mock DeliveryStatusBadge
jest.mock("../DeliveryStatusBadge", () => {
  return function MockDeliveryStatusBadge({
    status,
    className,
  }: {
    status: string;
    className?: string;
  }) {
    return (
      <span data-testid="delivery-status-badge" className={className}>
        {status}
      </span>
    );
  };
});

describe("DeliveryTrackingBanner", () => {
  const defaultOrderId = "order-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render nothing when tracking is null", () => {
    const { container } = render(
      <DeliveryTrackingBanner orderId={defaultOrderId} tracking={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render status badge for ASSIGNING_DRIVER", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{ status: "ASSIGNING_DRIVER" }}
      />
    );
    expect(screen.getByTestId("delivery-status-badge")).toHaveTextContent(
      "ASSIGNING_DRIVER"
    );
  });

  it("should render status badge for COMPLETED", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{ status: "COMPLETED" }}
      />
    );
    expect(screen.getByTestId("delivery-status-badge")).toHaveTextContent(
      "COMPLETED"
    );
  });

  it("should render status badge for ON_GOING", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{ status: "ON_GOING" }}
      />
    );
    expect(screen.getByTestId("delivery-status-badge")).toHaveTextContent(
      "ON_GOING"
    );
  });

  it("should show driver name when assigned", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{
          status: "ON_GOING",
          driver: { name: "Juan Santos" },
        }}
      />
    );
    expect(screen.getByText("Juan Santos")).toBeInTheDocument();
  });

  it("should not show driver name when no driver", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{ status: "ASSIGNING_DRIVER" }}
      />
    );
    expect(screen.queryByText(/Santos/)).not.toBeInTheDocument();
  });

  it("should show ETA when available and status is active", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{
          status: "ON_GOING",
          eta: { minutes: 15 },
        }}
      />
    );
    expect(screen.getByText("15m")).toBeInTheDocument();
    expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
  });

  it("should not show ETA when status is COMPLETED", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{
          status: "COMPLETED",
          eta: { minutes: 0 },
        }}
      />
    );
    expect(screen.queryByText("0m")).not.toBeInTheDocument();
  });

  it("should link to tracking page with correct orderId", () => {
    render(
      <DeliveryTrackingBanner
        orderId="order-abc-456"
        tracking={{ status: "PICKED_UP" }}
      />
    );
    const link = screen.getByTestId("tracking-link");
    expect(link).toHaveAttribute(
      "href",
      "/profile/orders/order-abc-456/track"
    );
  });

  it("should apply emerald highlight for active delivery", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{ status: "ON_GOING" }}
      />
    );
    const link = screen.getByTestId("tracking-link");
    expect(link.className).toContain("emerald");
  });

  it("should not apply emerald highlight for CANCELED delivery", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{ status: "CANCELED" }}
      />
    );
    const link = screen.getByTestId("tracking-link");
    expect(link.className).not.toContain("emerald-50");
  });

  it("should apply custom className", () => {
    render(
      <DeliveryTrackingBanner
        orderId={defaultOrderId}
        tracking={{ status: "ON_GOING" }}
        className="mt-4"
      />
    );
    const link = screen.getByTestId("tracking-link");
    expect(link.className).toContain("mt-4");
  });
});
