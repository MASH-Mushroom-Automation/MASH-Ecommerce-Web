import React from "react";
import { render, screen } from "@testing-library/react";
import { CrossSell } from "../CrossSell";

// Mock hooks and components
const mockProducts = [
  { id: "p1", slug: "shiitake", name: "Shiitake", price: 250, stock: 10, unit: "250g", image: "http://img1.jpg", images: [], grower: { name: "Farm A" }, category: "Mushrooms", compareAtPrice: null, productTags: [], description: "Desc" },
  { id: "p2", slug: "oyster", name: "Oyster", price: 180, stock: 5, unit: "250g", image: "http://img2.jpg", images: [], grower: null, category: "Mushrooms", compareAtPrice: null, productTags: [], description: "Desc" },
  { id: "p3", slug: "enoki", name: "Enoki", price: 200, stock: 8, unit: "100g", image: "http://img3.jpg", images: [], grower: { name: "Farm B" }, category: "Mushrooms", compareAtPrice: null, productTags: [], description: "Desc" },
  { id: "p4", slug: "lion-mane", name: "Lion Mane", price: 350, stock: 3, unit: "100g", image: "http://img4.jpg", images: [], grower: null, category: "Gourmet", compareAtPrice: 400, productTags: [], description: "Desc" },
  { id: "p5", slug: "reishi", name: "Reishi", price: 500, stock: 2, unit: "50g", image: "http://img5.jpg", images: [], grower: { name: "Farm C" }, category: "Medicinal", compareAtPrice: null, productTags: [], description: "Desc" },
];

let mockLoading = false;
jest.mock("@/hooks/useSanityProducts", () => ({
  useSanityFeaturedProducts: () => ({
    products: mockLoading ? [] : mockProducts,
    loading: mockLoading,
  }),
}));

jest.mock("@/components/product/ProductCard", () => ({
  ProductCard: ({ name, price }: { name: string; price: number }) => (
    <div data-testid="product-card">
      <span>{name}</span>
      <span>{price}</span>
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Sparkles: (props: Record<string, unknown>) => <svg data-testid="sparkles" {...props} />,
}));

describe("CrossSell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoading = false;
  });

  it("should render section title", () => {
    render(<CrossSell excludeIds={[]} />);
    expect(screen.getByText("You Might Also Like")).toBeInTheDocument();
  });

  it("should render sparkles icon", () => {
    render(<CrossSell excludeIds={[]} />);
    expect(screen.getByTestId("sparkles")).toBeInTheDocument();
  });

  it("should render product cards for featured products", () => {
    render(<CrossSell excludeIds={[]} maxDisplay={4} />);
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(4);
  });

  it("should exclude cart items from suggestions", () => {
    render(<CrossSell excludeIds={["p1", "p2"]} maxDisplay={4} />);
    expect(screen.queryByText("Shiitake")).not.toBeInTheDocument();
    expect(screen.queryByText("Oyster")).not.toBeInTheDocument();
    expect(screen.getByText("Enoki")).toBeInTheDocument();
  });

  it("should respect maxDisplay limit", () => {
    render(<CrossSell excludeIds={[]} maxDisplay={2} />);
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(2);
  });

  it("should show loading skeletons when loading", () => {
    mockLoading = true;
    const { container } = render(<CrossSell excludeIds={[]} maxDisplay={4} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons).toHaveLength(4);
  });

  it("should return null when all products are excluded", () => {
    const { container } = render(
      <CrossSell excludeIds={["p1", "p2", "p3", "p4", "p5"]} maxDisplay={4} />
    );
    expect(container.querySelector("section")).toBeNull();
  });

  it("should use default maxDisplay of 4", () => {
    render(<CrossSell excludeIds={[]} />);
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(4);
  });
});
