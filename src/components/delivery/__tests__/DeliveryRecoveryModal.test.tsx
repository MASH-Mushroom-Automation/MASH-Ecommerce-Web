import { render, screen, fireEvent } from "@testing-library/react";
import DeliveryRecoveryModal from "../DeliveryRecoveryModal";
import type { FailedDeliveryStatus } from "../DeliveryRecoveryModal";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  AlertTriangle: ({ className }: { className?: string }) => (
    <span data-testid="alert-icon" className={className} />
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <span data-testid="refresh-icon" className={className} />
  ),
  Headphones: ({ className }: { className?: string }) => (
    <span data-testid="headphones-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <span data-testid="x-icon" className={className} />
  ),
}));

const defaultProps = {
  open: true,
  status: "CANCELED" as FailedDeliveryStatus,
  onRetry: jest.fn(),
  onContactSupport: jest.fn(),
  onDismiss: jest.fn(),
};

describe("DeliveryRecoveryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when open is false", () => {
    render(<DeliveryRecoveryModal {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render for CANCELED status", () => {
    render(<DeliveryRecoveryModal {...defaultProps} status="CANCELED" />);
    expect(screen.getByText("Delivery Canceled")).toBeInTheDocument();
    expect(
      screen.getByText(/canceled.*try again/i)
    ).toBeInTheDocument();
  });

  it("should render for REJECTED status", () => {
    render(<DeliveryRecoveryModal {...defaultProps} status="REJECTED" />);
    expect(screen.getByText("Delivery Rejected")).toBeInTheDocument();
    expect(
      screen.getByText(/rejected.*retry/i)
    ).toBeInTheDocument();
  });

  it("should render for EXPIRED status", () => {
    render(<DeliveryRecoveryModal {...defaultProps} status="EXPIRED" />);
    expect(screen.getByText("Delivery Expired")).toBeInTheDocument();
    expect(
      screen.getByText(/expired.*new delivery/i)
    ).toBeInTheDocument();
  });

  it("should call onRetry when Try Again button is clicked", () => {
    const onRetry = jest.fn();
    render(<DeliveryRecoveryModal {...defaultProps} onRetry={onRetry} />);
    fireEvent.click(screen.getByText("Try Again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should call onContactSupport when Contact Support button is clicked", () => {
    const onContactSupport = jest.fn();
    render(
      <DeliveryRecoveryModal
        {...defaultProps}
        onContactSupport={onContactSupport}
      />
    );
    fireEvent.click(screen.getByText("Contact Support"));
    expect(onContactSupport).toHaveBeenCalledTimes(1);
  });

  it("should call onDismiss when close button is clicked", () => {
    const onDismiss = jest.fn();
    render(<DeliveryRecoveryModal {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText("Close dialog"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should show failure reason when provided", () => {
    render(
      <DeliveryRecoveryModal
        {...defaultProps}
        failureReason="Driver unavailable in your area"
      />
    );
    expect(screen.getByText("Reason")).toBeInTheDocument();
    expect(
      screen.getByText("Driver unavailable in your area")
    ).toBeInTheDocument();
  });

  it("should not show failure reason when not provided", () => {
    render(<DeliveryRecoveryModal {...defaultProps} />);
    expect(screen.queryByText("Reason")).not.toBeInTheDocument();
  });

  it("should have dialog role and aria-modal", () => {
    render(<DeliveryRecoveryModal {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("should call onDismiss when backdrop is clicked", () => {
    const onDismiss = jest.fn();
    render(<DeliveryRecoveryModal {...defaultProps} onDismiss={onDismiss} />);
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should apply custom className to modal content", () => {
    render(
      <DeliveryRecoveryModal {...defaultProps} className="custom-modal" />
    );
    const dialog = screen.getByRole("dialog");
    const content = dialog.firstElementChild;
    expect(content).toHaveClass("custom-modal");
  });
});
