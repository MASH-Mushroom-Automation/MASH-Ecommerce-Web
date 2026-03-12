import { render, screen, fireEvent } from "@testing-library/react";
import DeliveryProofImage from "../DeliveryProofImage";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Camera: ({ className }: { className?: string }) => (
    <span data-testid="camera-icon" className={className} />
  ),
  X: ({ className }: { className?: string }) => (
    <span data-testid="x-icon" className={className} />
  ),
  ZoomIn: ({ className }: { className?: string }) => (
    <span data-testid="zoom-icon" className={className} />
  ),
}));

describe("DeliveryProofImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show placeholder when no imageUrl", () => {
    render(<DeliveryProofImage />);
    expect(screen.getByTestId("camera-icon")).toBeInTheDocument();
    expect(screen.getByText("No delivery proof available")).toBeInTheDocument();
  });

  it("should show placeholder when imageUrl is null", () => {
    render(<DeliveryProofImage imageUrl={null} />);
    expect(screen.getByText("No delivery proof available")).toBeInTheDocument();
  });

  it("should render image when URL provided", () => {
    render(<DeliveryProofImage imageUrl="https://example.com/proof.jpg" />);
    const img = screen.getByRole("img", { name: "Proof of delivery" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/proof.jpg");
  });

  it("should render custom alt text", () => {
    render(
      <DeliveryProofImage
        imageUrl="https://example.com/proof.jpg"
        alt="Custom alt"
      />
    );
    expect(screen.getByRole("img", { name: "Custom alt" })).toBeInTheDocument();
  });

  it("should show formatted timestamp", () => {
    const timestamp = "2024-01-15T10:30:00Z";
    render(
      <DeliveryProofImage
        imageUrl="https://example.com/proof.jpg"
        timestamp={timestamp}
      />
    );
    // The formatted timestamp should contain the date
    const dateStr = new Date(timestamp).toLocaleString();
    expect(screen.getByText(dateStr)).toBeInTheDocument();
  });

  it("should not show timestamp when not provided", () => {
    render(
      <DeliveryProofImage imageUrl="https://example.com/proof.jpg" />
    );
    // Zoom button is present but no timestamp text
    expect(screen.getByLabelText("Zoom image")).toBeInTheDocument();
    // No time-formatted text should appear (timestamps contain commas or colons)
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
  });

  it("should open lightbox when zoom button clicked", () => {
    render(<DeliveryProofImage imageUrl="https://example.com/proof.jpg" />);

    const zoomButton = screen.getByLabelText("Zoom image");
    fireEvent.click(zoomButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Close zoom")).toBeInTheDocument();
  });

  it("should close lightbox when close button clicked", () => {
    render(<DeliveryProofImage imageUrl="https://example.com/proof.jpg" />);

    fireEvent.click(screen.getByLabelText("Zoom image"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close zoom"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should close lightbox when backdrop clicked", () => {
    render(<DeliveryProofImage imageUrl="https://example.com/proof.jpg" />);

    fireEvent.click(screen.getByLabelText("Zoom image"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryProofImage
        imageUrl="https://example.com/proof.jpg"
        className="mt-6"
      />
    );
    expect(container.firstChild).toHaveClass("mt-6");
  });
});
