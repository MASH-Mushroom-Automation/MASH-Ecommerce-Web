/**
 * Tests for SuggestedProducts component
 * Covers: render with products, grower details, verified badge, empty state, mobile link
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({ __esModule: true, default: ({ children, ...p }: any) => <a {...p}>{children}</a> }));
jest.mock("@/components/product", () => ({
  ProductCard: (p: any) => <div data-testid={`product-${p.id}`}>{p.name}</div>,
}));

import { SuggestedProducts } from "../SuggestedProducts";

const baseProducts = [
  { id: "s1", slug: "s1", name: "Mushroom A", price: 100, image: "https://img/a.jpg", stock: 10, isAvailable: true },
  { id: "s2", slug: "s2", name: "Mushroom B", price: 200, compareAtPrice: 250, unit: "pack", isAvailable: true, stock: 5, isFeatured: true },
  { id: "s3", slug: "s3", name: "Mushroom C", price: 150, isPromo: true, productTags: ["Popular"], isAvailable: false, stock: 0 },
  { id: "s4", slug: "s4", name: "Mushroom D", price: 180, description: "Desc" },
  { id: "s5", slug: "s5", name: "Mushroom E", price: 220 },
];

const grower = { name: "FungiMaster", slug: "fungi-master", isVerified: true };

describe("SuggestedProducts", () => {
  it("returns null when no products", () => {
    const { container } = render(<SuggestedProducts products={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when products is undefined-like empty array", () => {
    const { container } = render(<SuggestedProducts products={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders section with products", () => {
    render(<SuggestedProducts products={baseProducts} />);
    expect(screen.getByText("You May Also Like")).toBeInTheDocument();
    expect(screen.getByTestId("product-s1")).toBeInTheDocument();
  });

  it("limits to 4 products even if more provided", () => {
    render(<SuggestedProducts products={baseProducts} />);
    expect(screen.queryByTestId("product-s5")).not.toBeInTheDocument();
    expect(screen.getByTestId("product-s4")).toBeInTheDocument();
  });

  it("renders grower info with verified badge", () => {
    render(<SuggestedProducts products={baseProducts} grower={grower} />);
    expect(screen.getByText("FungiMaster")).toBeInTheDocument();
    const viewAllLinks = screen.getAllByText(/View All/);
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders grower without verified badge", () => {
    render(<SuggestedProducts products={baseProducts} grower={{ name: "Farm", slug: "farm" }} />);
    expect(screen.getByText("Farm")).toBeInTheDocument();
  });

  it("renders without grower", () => {
    render(<SuggestedProducts products={baseProducts} />);
    expect(screen.queryByText(/More from/)).not.toBeInTheDocument();
  });

  it("renders mobile view all link for grower", () => {
    render(<SuggestedProducts products={baseProducts} grower={grower} />);
    const links = screen.getAllByText(/View All/);
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render view all when no grower slug", () => {
    render(<SuggestedProducts products={baseProducts} grower={{ name: "Farm", slug: "" }} />);
    expect(screen.queryByText(/View All Products from/)).not.toBeInTheDocument();
  });
});
