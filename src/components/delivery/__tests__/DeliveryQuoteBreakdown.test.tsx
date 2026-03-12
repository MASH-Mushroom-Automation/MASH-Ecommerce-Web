import { render, screen } from "@testing-library/react";
import DeliveryQuoteBreakdown from "../DeliveryQuoteBreakdown";
import type { DeliveryQuote } from "../DeliveryQuoteBreakdown";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Receipt: ({ className }: { className?: string }) => (
    <span data-testid="receipt-icon" className={className} />
  ),
  MapPin: ({ className }: { className?: string }) => (
    <span data-testid="mappin-icon" className={className} />
  ),
  Zap: ({ className }: { className?: string }) => (
    <span data-testid="zap-icon" className={className} />
  ),
  CircleDot: ({ className }: { className?: string }) => (
    <span data-testid="circledot-icon" className={className} />
  ),
  Calculator: ({ className }: { className?: string }) => (
    <span data-testid="calculator-icon" className={className} />
  ),
}));

const mockQuote: DeliveryQuote = {
  baseFare: 50,
  distanceSurcharge: 25.5,
  priorityFee: 30,
  stopFee: 15,
  total: 120.5,
  currency: "PHP",
  distance: { value: 5.2, unit: "km" },
};

describe("DeliveryQuoteBreakdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render empty state when quote is null", () => {
    render(<DeliveryQuoteBreakdown quote={null} />);
    expect(screen.getByText("No delivery quote available")).toBeInTheDocument();
    expect(screen.getByTestId("calculator-icon")).toBeInTheDocument();
  });

  it("should render base fare line item", () => {
    render(<DeliveryQuoteBreakdown quote={mockQuote} />);
    expect(screen.getByText("Base fare")).toBeInTheDocument();
    expect(screen.getByText("₱50.00")).toBeInTheDocument();
  });

  it("should render total with peso sign", () => {
    render(<DeliveryQuoteBreakdown quote={mockQuote} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("₱120.50")).toBeInTheDocument();
  });

  it("should render distance surcharge with distance info", () => {
    render(<DeliveryQuoteBreakdown quote={mockQuote} />);
    expect(
      screen.getByText("Distance surcharge (5.2 km)")
    ).toBeInTheDocument();
    expect(screen.getByText("₱25.50")).toBeInTheDocument();
  });

  it("should render priority fee when present", () => {
    render(<DeliveryQuoteBreakdown quote={mockQuote} />);
    expect(screen.getByText("Priority fee")).toBeInTheDocument();
    expect(screen.getByText("₱30.00")).toBeInTheDocument();
  });

  it("should render stop fee when present", () => {
    render(<DeliveryQuoteBreakdown quote={mockQuote} />);
    expect(screen.getByText("Additional stop fee")).toBeInTheDocument();
    expect(screen.getByText("₱15.00")).toBeInTheDocument();
  });

  it("should hide priority fee when zero", () => {
    const quote: DeliveryQuote = {
      ...mockQuote,
      priorityFee: 0,
    };
    render(<DeliveryQuoteBreakdown quote={quote} />);
    expect(screen.queryByText("Priority fee")).not.toBeInTheDocument();
  });

  it("should hide distance surcharge when not provided", () => {
    const quote: DeliveryQuote = {
      baseFare: 50,
      total: 50,
    };
    render(<DeliveryQuoteBreakdown quote={quote} />);
    expect(
      screen.queryByText(/Distance surcharge/)
    ).not.toBeInTheDocument();
  });

  it("should hide stop fee when not provided", () => {
    const quote: DeliveryQuote = {
      baseFare: 50,
      total: 50,
    };
    render(<DeliveryQuoteBreakdown quote={quote} />);
    expect(
      screen.queryByText("Additional stop fee")
    ).not.toBeInTheDocument();
  });

  it("should show distance surcharge without distance info", () => {
    const quote: DeliveryQuote = {
      baseFare: 50,
      distanceSurcharge: 20,
      total: 70,
    };
    render(<DeliveryQuoteBreakdown quote={quote} />);
    expect(screen.getByText("Distance surcharge")).toBeInTheDocument();
  });

  it("should render heading text", () => {
    render(<DeliveryQuoteBreakdown quote={mockQuote} />);
    expect(
      screen.getByText("Delivery Cost Breakdown")
    ).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryQuoteBreakdown quote={mockQuote} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
