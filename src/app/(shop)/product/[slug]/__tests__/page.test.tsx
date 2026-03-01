import { render, screen } from "@testing-library/react";

// Mock dependencies
const mockFetch = jest.fn();
jest.mock("@/lib/sanity/client", () => ({
  sanityClient: { fetch: (...args: any[]) => mockFetch(...args) },
}));

jest.mock("../ProductDetailClient", () => ({
  ProductDetailClient: ({ slug }: { slug: string }) => (
    <div data-testid="product-detail-client">{slug}</div>
  ),
}));

jest.mock("@/components/common/json-ld", () => ({
  JsonLd: ({ data }: any) => (
    <script data-testid="json-ld" type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  ),
  productJsonLd: jest.fn((props: any) => ({ "@type": "Product", name: props.name })),
  breadcrumbJsonLd: jest.fn((items: any[]) => ({
    "@type": "BreadcrumbList",
    items: items.map((i: any) => i.name),
  })),
}));

const mockProduct = {
  name: "Golden Oyster Mushroom",
  description: "Premium golden oyster mushrooms grown locally. Perfect for stir-fry and soups.",
  price: 250,
  compareAtPrice: 300,
  stock: 10,
  unit: "kg",
  mainImage: "https://cdn.example.com/oyster.jpg",
  growerName: "Happy Farms",
  categoryName: "Oyster Mushrooms",
};

describe("ProductDetailPage", () => {
  let ProductDetailPage: any;
  let generateMetadata: any;

  beforeAll(async () => {
    const mod = await import("../page");
    ProductDetailPage = mod.default;
    generateMetadata = mod.generateMetadata;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateMetadata", () => {
    it("should generate metadata for an existing product", async () => {
      mockFetch.mockResolvedValue(mockProduct);
      const params = Promise.resolve({ slug: "golden-oyster" });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe("Golden Oyster Mushroom | MASH Marketplace");
      expect(metadata.description).toContain("Premium golden oyster mushrooms");
    });

    it("should return not found metadata when product does not exist", async () => {
      mockFetch.mockResolvedValue(null);
      const params = Promise.resolve({ slug: "nonexistent" });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe("Product Not Found | MASH Marketplace");
      expect(metadata.description).toContain("could not be found");
    });

    it("should generate default description when product has no description", async () => {
      mockFetch.mockResolvedValue({
        ...mockProduct,
        description: null,
        growerName: "Happy Farms",
      });
      const params = Promise.resolve({ slug: "test" });
      const metadata = await generateMetadata({ params });

      expect(metadata.description).toContain("Buy Golden Oyster Mushroom from Happy Farms");
    });

    it("should truncate description to 160 characters", async () => {
      const longDesc = "A".repeat(200);
      mockFetch.mockResolvedValue({ ...mockProduct, description: longDesc });
      const params = Promise.resolve({ slug: "test" });
      const metadata = await generateMetadata({ params });

      expect(metadata.description!.length).toBeLessThanOrEqual(160);
    });

    it("should include openGraph with product image", async () => {
      mockFetch.mockResolvedValue(mockProduct);
      const params = Promise.resolve({ slug: "golden-oyster" });
      const metadata = await generateMetadata({ params });

      expect(metadata.openGraph?.title).toBe("Golden Oyster Mushroom | MASH Marketplace");
      expect(metadata.openGraph?.url).toBe(
        "https://www.mashmarket.app/product/golden-oyster"
      );
      expect(metadata.openGraph?.images).toEqual([
        { url: "https://cdn.example.com/oyster.jpg" },
      ]);
    });

    it("should not include images in openGraph when no mainImage", async () => {
      mockFetch.mockResolvedValue({ ...mockProduct, mainImage: null });
      const params = Promise.resolve({ slug: "test" });
      const metadata = await generateMetadata({ params });

      expect(metadata.openGraph?.images).toBeUndefined();
    });

    it("should include canonical URL", async () => {
      mockFetch.mockResolvedValue(mockProduct);
      const params = Promise.resolve({ slug: "golden-oyster" });
      const metadata = await generateMetadata({ params });

      expect(metadata.alternates?.canonical).toBe(
        "https://www.mashmarket.app/product/golden-oyster"
      );
    });

    it("should return fallback metadata on fetch error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      const params = Promise.resolve({ slug: "error-slug" });
      const metadata = await generateMetadata({ params });

      expect(metadata.title).toBe("MASH Marketplace");
      expect(metadata.description).toContain("Browse fresh produce");
    });

    it("should generate default description without grower name", async () => {
      mockFetch.mockResolvedValue({
        ...mockProduct,
        description: null,
        growerName: null,
      });
      const params = Promise.resolve({ slug: "test" });
      const metadata = await generateMetadata({ params });

      expect(metadata.description).toContain("Buy Golden Oyster Mushroom from MASH Marketplace");
    });
  });

  describe("ProductDetailPage component", () => {
    it("should render ProductDetailClient with slug", async () => {
      mockFetch.mockResolvedValue(mockProduct);
      const params = Promise.resolve({ slug: "golden-oyster" });
      const result = await ProductDetailPage({ params });
      render(result);

      expect(screen.getByTestId("product-detail-client")).toHaveTextContent("golden-oyster");
    });

    it("should render JSON-LD data for product", async () => {
      const { productJsonLd } = require("@/components/common/json-ld");
      mockFetch.mockResolvedValue(mockProduct);
      const params = Promise.resolve({ slug: "golden-oyster" });
      const result = await ProductDetailPage({ params });
      render(result);

      expect(productJsonLd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Golden Oyster Mushroom",
          price: 250,
          currency: "PHP",
          availability: "InStock",
          brand: "Happy Farms",
        })
      );
    });

    it("should set availability to OutOfStock when stock is 0", async () => {
      const { productJsonLd } = require("@/components/common/json-ld");
      mockFetch.mockResolvedValue({ ...mockProduct, stock: 0 });
      const params = Promise.resolve({ slug: "out-of-stock" });
      const result = await ProductDetailPage({ params });
      render(result);

      expect(productJsonLd).toHaveBeenCalledWith(
        expect.objectContaining({ availability: "OutOfStock" })
      );
    });

    it("should render breadcrumb JSON-LD with category", async () => {
      const { breadcrumbJsonLd } = require("@/components/common/json-ld");
      mockFetch.mockResolvedValue(mockProduct);
      const params = Promise.resolve({ slug: "golden-oyster" });
      const result = await ProductDetailPage({ params });
      render(result);

      expect(breadcrumbJsonLd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "Home" }),
          expect.objectContaining({ name: "Shop" }),
          expect.objectContaining({ name: "Oyster Mushrooms" }),
          expect.objectContaining({ name: "Golden Oyster Mushroom" }),
        ])
      );
    });

    it("should render breadcrumb without category when categoryName is missing", async () => {
      const { breadcrumbJsonLd } = require("@/components/common/json-ld");
      mockFetch.mockResolvedValue({ ...mockProduct, categoryName: null });
      const params = Promise.resolve({ slug: "no-cat" });
      const result = await ProductDetailPage({ params });
      render(result);

      const callArgs = breadcrumbJsonLd.mock.calls[0][0];
      expect(callArgs).toHaveLength(3); // Home, Shop, Product (no category)
    });

    it("should not render JSON-LD when product fetch returns null", async () => {
      mockFetch.mockResolvedValue(null);
      const params = Promise.resolve({ slug: "nonexistent" });
      const result = await ProductDetailPage({ params });
      render(result);

      expect(screen.queryByTestId("json-ld")).not.toBeInTheDocument();
      expect(screen.getByTestId("product-detail-client")).toBeInTheDocument();
    });

    it("should not render JSON-LD when product fetch throws", async () => {
      mockFetch.mockRejectedValue(new Error("Sanity error"));
      const params = Promise.resolve({ slug: "error" });
      const result = await ProductDetailPage({ params });
      render(result);

      expect(screen.queryByTestId("json-ld")).not.toBeInTheDocument();
      expect(screen.getByTestId("product-detail-client")).toBeInTheDocument();
    });
  });
});
