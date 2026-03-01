import { render, screen, fireEvent } from "@testing-library/react";
import { StickyAddToCartBar } from "../StickyAddToCartBar";

jest.mock("lucide-react", () => ({
  ShoppingCart: (props: any) => <svg data-testid="cart-icon" {...props} />,
  Minus: (props: any) => <svg data-testid="minus-icon" {...props} />,
  Plus: (props: any) => <svg data-testid="plus-icon" {...props} />,
}));

const defaultProps = {
  productName: "Oyster Mushroom",
  price: 250,
  stock: 10,
  quantity: 1,
  setQuantity: jest.fn(),
  onAddToCart: jest.fn(),
  targetRef: { current: null } as React.RefObject<HTMLDivElement | null>,
};

describe("StickyAddToCartBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null when stock is 0", () => {
    const { container } = render(
      <StickyAddToCartBar {...defaultProps} stock={0} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("should render product name and price", () => {
    render(<StickyAddToCartBar {...defaultProps} />);
    expect(screen.getByText("Oyster Mushroom")).toBeInTheDocument();
    expect(screen.getByText(/250\.00/)).toBeInTheDocument();
  });

  it("should show unit when provided", () => {
    render(<StickyAddToCartBar {...defaultProps} unit="kg" />);
    expect(screen.getByText("/ kg")).toBeInTheDocument();
  });

  it("should display current quantity", () => {
    render(<StickyAddToCartBar {...defaultProps} quantity={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should decrease quantity on minus click", () => {
    render(<StickyAddToCartBar {...defaultProps} quantity={3} />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(defaultProps.setQuantity).toHaveBeenCalledWith(2);
  });

  it("should not decrease below 1", () => {
    render(<StickyAddToCartBar {...defaultProps} quantity={1} />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(defaultProps.setQuantity).toHaveBeenCalledWith(1);
  });

  it("should increase quantity on plus click", () => {
    render(<StickyAddToCartBar {...defaultProps} quantity={3} />);
    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(defaultProps.setQuantity).toHaveBeenCalledWith(4);
  });

  it("should not increase above stock", () => {
    render(<StickyAddToCartBar {...defaultProps} quantity={10} stock={10} />);
    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(defaultProps.setQuantity).toHaveBeenCalledWith(10);
  });

  it("should call onAddToCart when Add button is clicked", () => {
    render(<StickyAddToCartBar {...defaultProps} />);
    fireEvent.click(screen.getByText("Add"));
    expect(defaultProps.onAddToCart).toHaveBeenCalledTimes(1);
  });
});
