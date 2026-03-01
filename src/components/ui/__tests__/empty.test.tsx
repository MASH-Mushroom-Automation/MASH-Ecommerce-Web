import { render, screen } from "@testing-library/react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "../empty";

describe("Empty", () => {
  it("should render with data-slot", () => {
    render(<Empty data-testid="e">No items</Empty>);
    const el = screen.getByTestId("e");
    expect(el).toHaveAttribute("data-slot", "empty");
    expect(el).toHaveTextContent("No items");
  });
});

describe("EmptyHeader", () => {
  it("should render with data-slot", () => {
    render(<EmptyHeader data-testid="eh">Header</EmptyHeader>);
    expect(screen.getByTestId("eh")).toHaveAttribute("data-slot", "empty-header");
  });
});

describe("EmptyMedia", () => {
  it("should render with default variant", () => {
    render(<EmptyMedia data-testid="em">Icon</EmptyMedia>);
    const el = screen.getByTestId("em");
    expect(el).toHaveAttribute("data-slot", "empty-icon");
    expect(el).toHaveAttribute("data-variant", "default");
  });

  it("should render with icon variant", () => {
    render(<EmptyMedia data-testid="em" variant="icon">Icon</EmptyMedia>);
    expect(screen.getByTestId("em")).toHaveAttribute("data-variant", "icon");
  });
});

describe("EmptyTitle", () => {
  it("should render with data-slot", () => {
    render(<EmptyTitle data-testid="et">No results</EmptyTitle>);
    expect(screen.getByTestId("et")).toHaveAttribute("data-slot", "empty-title");
  });
});

describe("EmptyDescription", () => {
  it("should render with data-slot", () => {
    render(<EmptyDescription data-testid="ed">Try again</EmptyDescription>);
    expect(screen.getByTestId("ed")).toHaveAttribute("data-slot", "empty-description");
  });
});

describe("EmptyContent", () => {
  it("should render with data-slot", () => {
    render(<EmptyContent data-testid="ec">Actions</EmptyContent>);
    expect(screen.getByTestId("ec")).toHaveAttribute("data-slot", "empty-content");
  });
});
