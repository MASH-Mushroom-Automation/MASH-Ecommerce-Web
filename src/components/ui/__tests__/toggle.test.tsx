import { render, screen } from "@testing-library/react";
import { Toggle, toggleVariants } from "../toggle";

describe("Toggle", () => {
  it("should render with data-slot attribute", () => {
    render(<Toggle aria-label="Bold">B</Toggle>);
    const el = screen.getByRole("button");
    expect(el).toHaveAttribute("data-slot", "toggle");
  });

  it("should merge custom className", () => {
    render(<Toggle aria-label="Bold" className="custom">B</Toggle>);
    expect(screen.getByRole("button")).toHaveClass("custom");
  });

  it("should apply outline variant classes", () => {
    render(<Toggle aria-label="Bold" variant="outline">B</Toggle>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("border");
  });

  it("should apply size sm classes", () => {
    render(<Toggle aria-label="Bold" size="sm">B</Toggle>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("h-8");
  });

  it("should apply size lg classes", () => {
    render(<Toggle aria-label="Bold" size="lg">B</Toggle>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("h-10");
  });
});

describe("toggleVariants", () => {
  it("should export a callable function", () => {
    expect(typeof toggleVariants).toBe("function");
    const result = toggleVariants({ variant: "default", size: "default" });
    expect(typeof result).toBe("string");
  });
});
