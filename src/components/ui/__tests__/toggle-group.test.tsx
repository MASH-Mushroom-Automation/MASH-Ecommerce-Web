import { render, screen } from "@testing-library/react";
import { ToggleGroup, ToggleGroupItem } from "../toggle-group";

describe("ToggleGroup", () => {
  it("should render with data-slot attribute", () => {
    render(
      <ToggleGroup type="single" data-testid="group">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByTestId("group")).toHaveAttribute("data-slot", "toggle-group");
  });

  it("should merge custom className", () => {
    render(
      <ToggleGroup type="single" data-testid="group" className="extra">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByTestId("group")).toHaveClass("extra");
  });

  it("should set data-variant and data-size", () => {
    render(
      <ToggleGroup type="single" variant="outline" size="sm" data-testid="group">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    const group = screen.getByTestId("group");
    expect(group).toHaveAttribute("data-variant", "outline");
    expect(group).toHaveAttribute("data-size", "sm");
  });
});

describe("ToggleGroupItem", () => {
  it("should render with data-slot attribute", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByRole("radio")).toHaveAttribute("data-slot", "toggle-group-item");
  });

  it("should inherit variant from context", () => {
    render(
      <ToggleGroup type="single" variant="outline">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByRole("radio")).toHaveAttribute("data-variant", "outline");
  });

  it("should inherit size from context", () => {
    render(
      <ToggleGroup type="single" size="lg">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByRole("radio")).toHaveAttribute("data-size", "lg");
  });

  it("should allow item-level variant override", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a" variant="outline">A</ToggleGroupItem>
      </ToggleGroup>
    );
    expect(screen.getByRole("radio")).toHaveAttribute("data-variant", "outline");
  });
});
