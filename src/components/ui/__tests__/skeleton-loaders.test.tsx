import { render, screen } from "@testing-library/react";
import {
  Skeleton,
  ProductCardSkeleton,
  GrowerCardSkeleton,
  ProductListSkeleton,
  GrowerListSkeleton,
  HeroSkeleton,
} from "../skeleton-loaders";

describe("Skeleton", () => {
  it("should render a div with animate-pulse", () => {
    render(<Skeleton data-testid="sk" />);
    const el = screen.getByTestId("sk");
    expect(el).toHaveClass("animate-pulse");
    expect(el).toHaveClass("rounded-md");
    expect(el).toHaveClass("bg-muted");
  });

  it("should accept custom className", () => {
    render(<Skeleton data-testid="sk" className="h-4 w-20" />);
    expect(screen.getByTestId("sk")).toHaveClass("h-4");
  });
});

describe("ProductCardSkeleton", () => {
  it("should render skeleton card with image area", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.querySelector(".aspect-square")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

describe("GrowerCardSkeleton", () => {
  it("should render skeleton with banner and logo areas", () => {
    const { container } = render(<GrowerCardSkeleton />);
    expect(container.querySelector(".rounded-full")).toBeInTheDocument();
    expect(container.querySelector(".h-32")).toBeInTheDocument();
  });
});

describe("ProductListSkeleton", () => {
  it("should render 12 skeleton cards by default", () => {
    const { container } = render(<ProductListSkeleton />);
    const cards = container.querySelectorAll(".aspect-square");
    expect(cards).toHaveLength(12);
  });

  it("should render custom count", () => {
    const { container } = render(<ProductListSkeleton count={3} />);
    const cards = container.querySelectorAll(".aspect-square");
    expect(cards).toHaveLength(3);
  });
});

describe("GrowerListSkeleton", () => {
  it("should render 4 skeleton cards by default", () => {
    const { container } = render(<GrowerListSkeleton />);
    const cards = container.querySelectorAll(".rounded-full");
    expect(cards).toHaveLength(4);
  });

  it("should render custom count", () => {
    const { container } = render(<GrowerListSkeleton count={2} />);
    const cards = container.querySelectorAll(".rounded-full");
    expect(cards).toHaveLength(2);
  });
});

describe("HeroSkeleton", () => {
  it("should render hero skeleton with title placeholders", () => {
    const { container } = render(<HeroSkeleton />);
    expect(container.querySelector(".bg-muted")).toBeInTheDocument();
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBeGreaterThan(0);
  });
});
