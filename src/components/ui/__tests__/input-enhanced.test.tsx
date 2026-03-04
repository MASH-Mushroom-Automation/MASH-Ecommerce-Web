import { render, screen } from "@testing-library/react";
import { Input } from "../input-enhanced";

describe("Input (enhanced)", () => {
  it("should render an input element", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("should apply mobile-enhanced styles by default", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveClass("touch-manipulation");
  });

  it("should not apply mobile-enhanced styles when disabled", () => {
    render(<Input data-testid="input" mobileEnhanced={false} />);
    expect(screen.getByTestId("input")).not.toHaveClass("touch-manipulation");
  });

  it("should forward ref", () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it("should merge custom className", () => {
    render(<Input data-testid="input" className="extra" />);
    expect(screen.getByTestId("input")).toHaveClass("extra");
  });

  it("should pass type prop", () => {
    render(<Input data-testid="input" type="email" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
  });
});
