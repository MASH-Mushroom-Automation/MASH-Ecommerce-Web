/**
 * Loading States Component Tests
 * Tests for various loading/skeleton components
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import {
  PageLoader,
  Spinner,
  ProductSkeleton,
  OrderSkeleton,
  InventorySkeleton,
} from "../loading-states";

describe("PageLoader", () => {
  it("renders with default message", () => {
    render(<PageLoader />);
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<PageLoader message="Loading products..." />);
    
    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("displays spinning loader icon", () => {
    const { container } = render(<PageLoader />);
    
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("has proper styling for full page display", () => {
    const { container } = render(<PageLoader />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("min-h-screen");
  });
});

describe("Spinner", () => {
  it("renders with default medium size", () => {
    const { container } = render(<Spinner />);
    
    const spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("w-6", "h-6");
  });

  it("renders small size correctly", () => {
    const { container } = render(<Spinner size="sm" />);
    
    const spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("w-4", "h-4");
  });

  it("renders large size correctly", () => {
    const { container } = render(<Spinner size="lg" />);
    
    const spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("w-8", "h-8");
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-class" />);
    
    const spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("custom-class");
  });

  it("has animation class for spinning", () => {
    const { container } = render(<Spinner />);
    
    const spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("animate-spin");
  });
});

describe("ProductSkeleton", () => {
  it("renders skeleton structure", () => {
    const { container } = render(<ProductSkeleton />);
    
    // Should have animate-pulse class for loading effect
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("has proper card structure", () => {
    const { container } = render(<ProductSkeleton />);
    
    expect(container.firstChild).toHaveClass("bg-background", "rounded-lg");
  });

  it("contains image placeholder area", () => {
    const { container } = render(<ProductSkeleton />);
    
    // Image placeholder should be taller
    const imagePlaceholder = container.querySelector(".h-48");
    expect(imagePlaceholder).toBeInTheDocument();
  });

  it("contains text placeholder areas", () => {
    const { container } = render(<ProductSkeleton />);
    
    // Should have multiple placeholder lines
    const placeholders = container.querySelectorAll(".bg-muted");
    expect(placeholders.length).toBeGreaterThan(2);
  });
});

describe("OrderSkeleton", () => {
  it("renders skeleton structure", () => {
    const { container } = render(<OrderSkeleton />);
    
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("has proper card structure", () => {
    const { container } = render(<OrderSkeleton />);
    
    expect(container.firstChild).toHaveClass("bg-background", "rounded-lg");
  });

  it("contains order status badge placeholder", () => {
    const { container } = render(<OrderSkeleton />);
    
    // Rounded-full class indicates badge
    const badge = container.querySelector(".rounded-full");
    expect(badge).toBeInTheDocument();
  });

  it("contains product thumbnail placeholder", () => {
    const { container } = render(<OrderSkeleton />);
    
    // Should have a thumbnail area (16x16)
    const thumbnail = container.querySelector(".w-16.h-16");
    expect(thumbnail).toBeInTheDocument();
  });

  it("contains order details placeholders", () => {
    const { container } = render(<OrderSkeleton />);
    
    const placeholders = container.querySelectorAll(".bg-muted.rounded");
    expect(placeholders.length).toBeGreaterThan(3);
  });
});

describe("InventorySkeleton", () => {
  it("renders skeleton structure", () => {
    const { container } = render(<InventorySkeleton />);
    
    // Should have multiple animated sections
    const animatedSections = container.querySelectorAll(".animate-pulse");
    expect(animatedSections.length).toBeGreaterThan(0);
  });

  it("renders stats cards placeholders", () => {
    const { container } = render(<InventorySkeleton />);
    
    // Should have grid for stats cards
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });

  it("has responsive grid layout", () => {
    const { container } = render(<InventorySkeleton />);
    
    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("md:grid-cols-3");
  });
});

describe("Skeleton Visual Consistency", () => {
  it("all skeletons use consistent bg-muted color", () => {
    const { container: product } = render(<ProductSkeleton />);
    const { container: order } = render(<OrderSkeleton />);
    
    const productPlaceholders = product.querySelectorAll(".bg-muted");
    const orderPlaceholders = order.querySelectorAll(".bg-muted");
    
    expect(productPlaceholders.length).toBeGreaterThan(0);
    expect(orderPlaceholders.length).toBeGreaterThan(0);
  });

  it("all skeletons have rounded corners", () => {
    const { container: product } = render(<ProductSkeleton />);
    const { container: order } = render(<OrderSkeleton />);
    
    const productRounded = product.querySelectorAll('[class*="rounded"]');
    const orderRounded = order.querySelectorAll('[class*="rounded"]');
    
    expect(productRounded.length).toBeGreaterThan(0);
    expect(orderRounded.length).toBeGreaterThan(0);
  });
});
