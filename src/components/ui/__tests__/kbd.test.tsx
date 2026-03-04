import { render, screen } from "@testing-library/react";
import { Kbd, KbdGroup } from "../kbd";

describe("Kbd", () => {
  it("should render with data-slot attribute", () => {
    render(<Kbd>⌘</Kbd>);
    const el = screen.getByText("⌘");
    expect(el).toHaveAttribute("data-slot", "kbd");
  });

  it("should merge custom className", () => {
    render(<Kbd className="custom-class">K</Kbd>);
    expect(screen.getByText("K")).toHaveClass("custom-class");
  });
});

describe("KbdGroup", () => {
  it("should render with data-slot attribute", () => {
    render(<KbdGroup data-testid="group"><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>);
    expect(screen.getByTestId("group")).toHaveAttribute("data-slot", "kbd-group");
  });

  it("should merge custom className", () => {
    render(<KbdGroup data-testid="group" className="extra">children</KbdGroup>);
    expect(screen.getByTestId("group")).toHaveClass("extra");
  });
});
