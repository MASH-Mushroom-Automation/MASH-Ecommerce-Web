import { render, screen, fireEvent } from "@testing-library/react";
import LalamoveOrderSummary from "../LalamoveOrderSummary";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <span data-testid="chevron-down" className={className} />
  ),
  ChevronUp: ({ className }: { className?: string }) => (
    <span data-testid="chevron-up" className={className} />
  ),
  Truck: ({ className }: { className?: string }) => (
    <span data-testid="truck-icon" className={className} />
  ),
  DollarSign: ({ className }: { className?: string }) => (
    <span data-testid="dollar-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <span data-testid="clock-icon" className={className} />
  ),
  Camera: ({ className }: { className?: string }) => (
    <span data-testid="camera-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <span data-testid="x-icon" className={className} />
  ),
  ZoomIn: ({ className }: { className?: string }) => (
    <span data-testid="zoom-icon" className={className} />
  ),
  Phone: ({ className }: { className?: string }) => (
    <span data-testid="phone-icon" className={className} />
  ),
  User: ({ className }: { className?: string }) => (
    <span data-testid="user-icon" className={className} />
  ),
}));

describe("LalamoveOrderSummary", () => {
  const baseData = {
    status: "ON_GOING",
    vehicleType: "Motorcycle",
    fee: 149.5,
    createdAt: "2024-01-15T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render delivery summary heading", () => {
    render(<LalamoveOrderSummary data={baseData} />);
    expect(screen.getByText("Delivery Summary")).toBeInTheDocument();
  });

  it("should render status badge", () => {
    render(<LalamoveOrderSummary data={baseData} />);
    // DeliveryStatusBadge renders the status text via STATUS_LABELS
    expect(screen.getByText("Driver En Route")).toBeInTheDocument();
  });

  it("should render vehicle type", () => {
    render(<LalamoveOrderSummary data={baseData} />);
    expect(screen.getByText("Motorcycle")).toBeInTheDocument();
  });

  it("should render delivery fee with peso sign", () => {
    render(<LalamoveOrderSummary data={baseData} />);
    expect(screen.getByText(/149\.50/)).toBeInTheDocument();
  });

  it("should render created date", () => {
    render(<LalamoveOrderSummary data={baseData} />);
    const dateStr = new Date("2024-01-15T10:00:00Z").toLocaleDateString();
    expect(screen.getByText(dateStr)).toBeInTheDocument();
  });

  it("should render driver info section when driver present", () => {
    const data = {
      ...baseData,
      driver: {
        name: "Juan Santos",
        phone: "+639171234567",
        plateNumber: "ABC 1234",
      },
    };
    render(<LalamoveOrderSummary data={data} />);
    expect(screen.getByText("Driver Information")).toBeInTheDocument();
    expect(screen.getByText("Juan Santos")).toBeInTheDocument();
    expect(screen.getByText("ABC 1234")).toBeInTheDocument();
  });

  it("should not render driver section when no driver", () => {
    render(<LalamoveOrderSummary data={baseData} />);
    expect(screen.queryByText("Driver Information")).not.toBeInTheDocument();
  });

  it("should render timeline section when timeline entries exist", () => {
    const data = {
      ...baseData,
      timeline: [
        { status: "Order Created", timestamp: "2024-01-15T10:00:00Z" },
        {
          status: "Driver Assigned",
          timestamp: "2024-01-15T10:05:00Z",
          note: "Driver Juan assigned",
        },
      ],
    };
    render(<LalamoveOrderSummary data={data} />);
    expect(screen.getByText("Delivery Timeline")).toBeInTheDocument();

    // Click to expand timeline
    fireEvent.click(screen.getByText("Delivery Timeline"));
    expect(screen.getByText("Order Created")).toBeInTheDocument();
    expect(screen.getByText("Driver Assigned")).toBeInTheDocument();
    expect(screen.getByText("Driver Juan assigned")).toBeInTheDocument();
  });

  it("should render proof of delivery section for COMPLETED status", () => {
    const data = {
      ...baseData,
      status: "COMPLETED",
      proofImageUrl: "https://example.com/proof.jpg",
      proofTimestamp: "2024-01-15T11:00:00Z",
    };
    render(<LalamoveOrderSummary data={data} />);
    expect(screen.getByText("Proof of Delivery")).toBeInTheDocument();
  });

  it("should not render proof section for non-COMPLETED status", () => {
    render(<LalamoveOrderSummary data={baseData} />);
    expect(screen.queryByText("Proof of Delivery")).not.toBeInTheDocument();
  });

  it("should toggle collapsible section", () => {
    const data = {
      ...baseData,
      timeline: [
        { status: "Order Created", timestamp: "2024-01-15T10:00:00Z" },
      ],
    };
    render(<LalamoveOrderSummary data={data} />);

    const timelineButton = screen.getByText("Delivery Timeline");
    expect(timelineButton.closest("button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    fireEvent.click(timelineButton);
    expect(timelineButton.closest("button")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByText("Order Created")).toBeInTheDocument();

    fireEvent.click(timelineButton);
    expect(timelineButton.closest("button")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("should apply custom className", () => {
    const { container } = render(
      <LalamoveOrderSummary data={baseData} className="mt-8" />
    );
    expect(container.firstChild).toHaveClass("mt-8");
  });
});
