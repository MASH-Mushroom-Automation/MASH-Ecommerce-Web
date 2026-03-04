/**
 * Tests for FilterSidebar component
 * Targets: src/components/catalog/FilterSidebar.tsx (5fn, 5br)
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));
jest.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange, ...props }: any) => (
    <input
      type="range"
      data-testid="slider"
      value={value?.[0]}
      onChange={(e) => onValueChange?.([Number(e.target.value), value?.[1]])}
      {...props}
    />
  ),
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));
jest.mock("lucide-react", () => ({
  X: () => <svg data-testid="x-icon" />,
}));

import { FilterSidebar } from "../FilterSidebar";

describe("FilterSidebar", () => {
  it("renders categories section", () => {
    render(<FilterSidebar />);
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Fresh Mushroom")).toBeInTheDocument();
    expect(screen.getByText("Dried Mushroom")).toBeInTheDocument();
    expect(screen.getByText("Mushroom Products")).toBeInTheDocument();
  });

  it("renders grower section", () => {
    render(<FilterSidebar />);
    expect(screen.getByText("Grower")).toBeInTheDocument();
    expect(screen.getByText("Fungi Fresh Farm")).toBeInTheDocument();
  });

  it("renders price range section with inputs", () => {
    render(<FilterSidebar />);
    expect(screen.getByText("Price")).toBeInTheDocument();
    const fromInput = screen.getByPlaceholderText("From");
    expect(fromInput).toBeInTheDocument();
    const toInput = screen.getByPlaceholderText("To");
    expect(toInput).toBeInTheDocument();
  });

  it("updates price range from input", () => {
    render(<FilterSidebar />);
    const fromInput = screen.getByPlaceholderText("From");
    fireEvent.change(fromInput, { target: { value: "100" } });
    expect(fromInput).toHaveValue(100);
  });

  it("renders mobile variant with close button and Apply", () => {
    const onClose = jest.fn();
    render(<FilterSidebar isMobile onClose={onClose} />);
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Apply Filters")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked in mobile", () => {
    const onClose = jest.fn();
    render(<FilterSidebar isMobile onClose={onClose} />);
    // The first ghost button is the close button
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons[0];
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not show mobile elements in desktop mode", () => {
    render(<FilterSidebar />);
    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
    expect(screen.queryByText("Apply Filters")).not.toBeInTheDocument();
  });
});
