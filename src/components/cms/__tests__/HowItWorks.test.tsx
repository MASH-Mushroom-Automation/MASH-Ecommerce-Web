/**
 * Tests for HowItWorks component
 * Targets: src/components/cms/HowItWorks.tsx (2fn, 1br)
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("lucide-react", () => ({
  Search: () => <svg data-testid="icon-search" />,
  ShoppingCart: () => <svg data-testid="icon-cart" />,
  Truck: () => <svg data-testid="icon-truck" />,
  ArrowRight: ({ className }: any) => <svg data-testid="arrow-right" className={className} />,
}));

import { HowItWorks } from "../HowItWorks";

describe("HowItWorks", () => {
  it("renders section heading", () => {
    render(<HowItWorks />);
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("Simple Process")).toBeInTheDocument();
  });

  it("renders all 3 steps", () => {
    render(<HowItWorks />);
    expect(screen.getByText("Browse Local Growers")).toBeInTheDocument();
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    expect(screen.getByText("Delivered Fresh")).toBeInTheDocument();
  });

  it("renders step descriptions", () => {
    render(<HowItWorks />);
    expect(screen.getByText(/Explore mushrooms from verified/)).toBeInTheDocument();
    expect(screen.getByText(/Select your favorites/)).toBeInTheDocument();
    expect(screen.getByText(/Get farm-fresh mushrooms/)).toBeInTheDocument();
  });

  it("renders step numbers", () => {
    render(<HowItWorks />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders step icons", () => {
    render(<HowItWorks />);
    expect(screen.getByTestId("icon-search")).toBeInTheDocument();
    expect(screen.getByTestId("icon-cart")).toBeInTheDocument();
    expect(screen.getByTestId("icon-truck")).toBeInTheDocument();
  });

  it("renders mobile connecting arrows between steps", () => {
    render(<HowItWorks />);
    // 2 arrows between 3 steps
    const arrows = screen.getAllByTestId("arrow-right");
    expect(arrows).toHaveLength(2);
  });
});
