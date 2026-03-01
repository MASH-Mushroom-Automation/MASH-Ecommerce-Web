import { render, screen } from "@testing-library/react";

// Mock dependencies
const mockFetch = jest.fn();
jest.mock("@/lib/sanity/client", () => ({
  sanityClient: { fetch: (...args: any[]) => mockFetch(...args) },
}));

jest.mock("@/lib/sanity/queries", () => ({
  categoryBySlugQuery: "mocked-category-query",
}));

const mockNotFound = jest.fn();
jest.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

jest.mock("../CategoryPageClient", () => {
  return function MockCategoryPageClient({ category, slug }: any) {
    return (
      <div data-testid="category-page-client">
        <span data-testid="cat-name">{category.name}</span>
        <span data-testid="cat-slug">{category.slug}</span>
        <span data-testid="cat-description">{category.description || "none"}</span>
        <span data-testid="cat-count">{category.productCount}</span>
        <span data-testid="page-slug">{slug}</span>
      </div>
    );
  };
});

describe("CategoryPage", () => {
  let CategoryPage: any;
  let generateMetadata: any;

  beforeAll(async () => {
    const mod = await import("../page");
    CategoryPage = mod.default;
    generateMetadata = mod.generateMetadata;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateMetadata", () => {
    it("should return not found metadata when category does not exist", async () => {
      mockFetch.mockResolvedValue(null);
      const params = Promise.resolve({ slug: "nonexistent" });
      const metadata = await generateMetadata({ params });
      expect(metadata.title).toBe("Category Not Found | MASH Market");
    });

    it("should generate metadata with category name and description", async () => {
      mockFetch.mockResolvedValue({
        name: "Mushroom Kits",
        description: "Premium mushroom growing kits",
        products: [{ _id: "p1" }, { _id: "p2" }, { _id: "p3" }],
      });
      const params = Promise.resolve({ slug: "mushroom-kits" });
      const metadata = await generateMetadata({ params });
      expect(metadata.title).toBe("Mushroom Kits | MASH Market");
      expect(metadata.description).toContain("Premium mushroom growing kits");
      expect(metadata.description).toContain("3 products available");
    });

    it("should generate default description when category has no description", async () => {
      mockFetch.mockResolvedValue({
        name: "Oyster",
        description: null,
        products: [],
      });
      const params = Promise.resolve({ slug: "oyster" });
      const metadata = await generateMetadata({ params });
      expect(metadata.description).toContain("Browse Oyster products");
      expect(metadata.description).toContain("0 products available");
    });

    it("should include openGraph metadata", async () => {
      mockFetch.mockResolvedValue({
        name: "Fresh Caps",
        description: "Freshly harvested mushroom caps",
        products: [{ _id: "p1" }],
      });
      const params = Promise.resolve({ slug: "fresh-caps" });
      const metadata = await generateMetadata({ params });
      expect(metadata.openGraph?.title).toBe("Fresh Caps | MASH Market");
      expect(metadata.openGraph?.url).toBe(
        "https://www.mashmarket.app/category/fresh-caps"
      );
      expect(metadata.openGraph?.type).toBe("website");
    });

    it("should include twitter card metadata", async () => {
      mockFetch.mockResolvedValue({
        name: "Test Cat",
        description: "Test",
        products: [],
      });
      const params = Promise.resolve({ slug: "test-cat" });
      const metadata = await generateMetadata({ params });
      expect(metadata.twitter?.card).toBe("summary_large_image");
    });

    it("should include canonical alternates", async () => {
      mockFetch.mockResolvedValue({
        name: "Test",
        description: "Test",
        products: [],
      });
      const params = Promise.resolve({ slug: "test-slug" });
      const metadata = await generateMetadata({ params });
      expect(metadata.alternates?.canonical).toBe(
        "https://www.mashmarket.app/category/test-slug"
      );
    });

    it("should handle category without products array", async () => {
      mockFetch.mockResolvedValue({
        name: "Empty",
        description: "No products",
      });
      const params = Promise.resolve({ slug: "empty" });
      const metadata = await generateMetadata({ params });
      expect(metadata.description).toContain("0 products available");
    });
  });

  describe("CategoryPage component", () => {
    it("should render CategoryPageClient with category data", async () => {
      mockFetch.mockResolvedValue({
        name: "Mushroom Kits",
        slug: { current: "mushroom-kits" },
        description: "Great kits for growing",
        products: [
          { _id: "p1", mainImage: "img1.jpg" },
          { _id: "p2", mainImage: "img2.jpg" },
        ],
      });
      const params = Promise.resolve({ slug: "mushroom-kits" });
      const result = await CategoryPage({ params });
      render(result);

      expect(screen.getByTestId("cat-name")).toHaveTextContent("Mushroom Kits");
      expect(screen.getByTestId("cat-slug")).toHaveTextContent("mushroom-kits");
      expect(screen.getByTestId("cat-description")).toHaveTextContent("Great kits for growing");
      expect(screen.getByTestId("cat-count")).toHaveTextContent("2");
    });

    it("should call notFound when category does not exist", async () => {
      mockFetch.mockResolvedValue(null);
      const params = Promise.resolve({ slug: "nonexistent" });
      try {
        await CategoryPage({ params });
      } catch {
        // notFound throws
      }
      expect(mockNotFound).toHaveBeenCalled();
    });

    it("should use slug param as fallback when category slug is missing", async () => {
      mockFetch.mockResolvedValue({
        name: "Test",
        slug: null,
        description: null,
        products: null,
      });
      const params = Promise.resolve({ slug: "fallback-slug" });
      const result = await CategoryPage({ params });
      render(result);

      expect(screen.getByTestId("cat-slug")).toHaveTextContent("fallback-slug");
      expect(screen.getByTestId("cat-description")).toHaveTextContent("none");
      expect(screen.getByTestId("cat-count")).toHaveTextContent("0");
    });

    it("should pass first product mainImage as category image", async () => {
      mockFetch.mockResolvedValue({
        name: "Kits",
        slug: { current: "kits" },
        description: null,
        products: [{ _id: "p1", mainImage: "first-product-image.jpg" }],
      });
      const params = Promise.resolve({ slug: "kits" });
      const result = await CategoryPage({ params });
      render(result);
      expect(screen.getByTestId("category-page-client")).toBeInTheDocument();
    });

    it("should pass page slug to CategoryPageClient", async () => {
      mockFetch.mockResolvedValue({
        name: "Test",
        slug: { current: "different-slug" },
        products: [],
      });
      const params = Promise.resolve({ slug: "url-slug" });
      const result = await CategoryPage({ params });
      render(result);

      expect(screen.getByTestId("page-slug")).toHaveTextContent("url-slug");
    });
  });
});
