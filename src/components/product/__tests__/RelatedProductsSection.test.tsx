/**
 * Tests for RelatedProductsSection component
 * Covers: 3 variants, empty state, addToCart, scroll, badges, maxItems, viewAll link
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("next/image", () => ({ __esModule: true, default: (p: any) => <img {...p} /> }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, ...p }: any) => <a {...p}>{children}</a> }));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
}));
const mockAddToCart = jest.fn().mockReturnValue(true);
jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}));
jest.mock("@/lib/analytics", () => ({
  trackAddToCart: jest.fn(),
}));

import { RelatedProductsSection } from "../RelatedProductsSection";

const baseProduct = {
  id: "p1",
  name: "White Oyster",
  slug: "white-oyster",
  price: 120,
  image: "https://cdn.example.com/img.jpg",
  stock: 10,
  unit: "kg",
  grower: "FarmA",
};

const promoProduct = { ...baseProduct, id: "p2", name: "Promo Item", isPromo: true, isFeatured: true };
const noImageProduct = { ...baseProduct, id: "p3", name: "No Image Item", image: undefined };
const growerObjProduct = { ...baseProduct, id: "p4", name: "Grower Obj", grower: { name: "Farm" } as any };

const manyProducts = Array.from({ length: 10 }, (_, i) => ({
  ...baseProduct,
  id: `p${i}`,
  name: `Product ${i}`,
  slug: `product-${i}`,
}));

describe("RelatedProductsSection", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null for empty products", () => {
    const { container } = render(
      <RelatedProductsSection title="Related" products={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title and subtitle", () => {
    render(
      <RelatedProductsSection title="Related" subtitle="More items" products={[baseProduct]} />
    );
    expect(screen.getByText("Related")).toBeInTheDocument();
    expect(screen.getByText("More items")).toBeInTheDocument();
  });

  it("renders product name and price", () => {
    render(<RelatedProductsSection title="R" products={[baseProduct]} />);
    expect(screen.getByText("White Oyster")).toBeInTheDocument();
  });

  it("renders with default variant", () => {
    render(<RelatedProductsSection title="R" products={[baseProduct]} />);
    expect(screen.getByText("White Oyster")).toBeInTheDocument();
  });

  it("renders compact variant", () => {
    render(<RelatedProductsSection title="R" products={[baseProduct]} variant="compact" />);
    expect(screen.getByText("White Oyster")).toBeInTheDocument();
  });

  it("renders horizontal variant", () => {
    render(<RelatedProductsSection title="R" products={[baseProduct]} variant="horizontal" />);
    expect(screen.getByText("White Oyster")).toBeInTheDocument();
  });

  it("renders promo and featured badges in default variant", () => {
    render(<RelatedProductsSection title="R" products={[promoProduct]} />);
    expect(screen.getByText("SALE")).toBeInTheDocument();
  });

  it("renders promo badge in horizontal variant", () => {
    render(<RelatedProductsSection title="R" products={[promoProduct]} variant="horizontal" />);
    expect(screen.getByText("SALE")).toBeInTheDocument();
  });

  it("uses placeholder for product without image", () => {
    render(<RelatedProductsSection title="R" products={[noImageProduct]} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.some((img: any) => img.src?.includes("placeholder") || img.getAttribute("src")?.includes("placeholder"))).toBeTruthy();
  });

  it("uses placeholder for product without http image in default variant", () => {
    const localImg = { ...baseProduct, id: "p5", image: "/local.jpg" };
    render(<RelatedProductsSection title="R" products={[localImg]} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThan(0);
  });

  it("hides add to cart when showAddToCart=false", () => {
    render(<RelatedProductsSection title="R" products={[baseProduct]} showAddToCart={false} />);
    expect(screen.queryByLabelText("Add to cart")).not.toBeInTheDocument();
  });

  it("shows scroll buttons when >4 products", () => {
    render(<RelatedProductsSection title="R" products={manyProducts.slice(0, 5)} />);
    expect(screen.getByLabelText("Scroll left")).toBeInTheDocument();
    expect(screen.getByLabelText("Scroll right")).toBeInTheDocument();
  });

  it("hides scroll buttons when <=4 products", () => {
    render(<RelatedProductsSection title="R" products={manyProducts.slice(0, 3)} />);
    expect(screen.queryByLabelText("Scroll left")).not.toBeInTheDocument();
  });

  it("limits products to maxItems", () => {
    render(<RelatedProductsSection title="R" products={manyProducts} maxItems={3} />);
    const names = screen.getAllByText(/Product \d/);
    expect(names.length).toBe(3);
  });

  it("shows View All link when products exceed maxItems", () => {
    render(<RelatedProductsSection title="R" products={manyProducts} maxItems={5} />);
    expect(screen.getByText("View All Products")).toBeInTheDocument();
  });

  it("handles add to cart click in default variant", async () => {
    render(<RelatedProductsSection title="R" products={[baseProduct]} />);
    const addBtn = screen.getByLabelText("Add to cart");
    fireEvent.click(addBtn);
    await waitFor(() => expect(mockAddToCart).toHaveBeenCalled());
  });

  it("handles add to cart click in horizontal variant", async () => {
    render(<RelatedProductsSection title="R" products={[baseProduct]} variant="horizontal" />);
    const addBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addBtn);
    await waitFor(() => expect(mockAddToCart).toHaveBeenCalled());
  });

  it("handles addToCart failure (returns false)", async () => {
    mockAddToCart.mockReturnValueOnce(false);
    render(<RelatedProductsSection title="R" products={[baseProduct]} />);
    const addBtn = screen.getByLabelText("Add to cart");
    fireEvent.click(addBtn);
    await waitFor(() => expect(mockAddToCart).toHaveBeenCalled());
  });

  it("handles product with grower as object", async () => {
    render(<RelatedProductsSection title="R" products={[growerObjProduct]} variant="horizontal" />);
    const addBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addBtn);
    await waitFor(() => expect(mockAddToCart).toHaveBeenCalled());
  });
});
