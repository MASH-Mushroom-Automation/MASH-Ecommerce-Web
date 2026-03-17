/**
 * Dynamic Sitemap Tests (TEST-009)
 *
 * Tests that the sitemap.ts generates correct URLs for products,
 * categories, growers, blog posts from Sanity CMS.
 */

import sitemap from "../sitemap";

// Mock Sanity client
jest.mock("@/lib/sanity/client", () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}));

import { sanityClient } from "@/lib/sanity/client";

const mockFetch = sanityClient.fetch as jest.MockedFunction<typeof sanityClient.fetch>;

const BASE_URL = "https://www.mashmarket.app";

describe("Dynamic Sitemap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("includes static routes with correct base URL", async () => {
    mockFetch.mockResolvedValue([]);
    const result = await sitemap();

    const urls = result.map((entry) => entry.url);
    expect(urls).toContain(BASE_URL);
    expect(urls).toContain(`${BASE_URL}/shop`);
    expect(urls).toContain(`${BASE_URL}/about`);
    expect(urls).toContain(`${BASE_URL}/contact`);
    expect(urls).toContain(`${BASE_URL}/blog`);
  });

  it("uses https://www.mashmarket.app as base URL", async () => {
    mockFetch.mockResolvedValue([]);
    const result = await sitemap();

    result.forEach((entry) => {
      expect(entry.url).toMatch(/^https:\/\/www\.mashmarket\.app/);
    });
  });

  it("includes product URLs from Sanity", async () => {
    mockFetch
      .mockResolvedValueOnce([
        { slug: "king-oyster-mushroom", _updatedAt: "2025-01-15T10:00:00Z" },
        { slug: "shiitake-mushroom", _updatedAt: "2025-01-16T10:00:00Z" },
      ])
      .mockResolvedValueOnce([]) // categories
      .mockResolvedValueOnce([]) // growers
      .mockResolvedValueOnce([]); // posts

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain(`${BASE_URL}/product/king-oyster-mushroom`);
    expect(urls).toContain(`${BASE_URL}/product/shiitake-mushroom`);
  });

  it("includes category URLs from Sanity", async () => {
    mockFetch
      .mockResolvedValueOnce([]) // products
      .mockResolvedValueOnce([
        { slug: "oyster-mushrooms", _updatedAt: "2025-01-10T10:00:00Z" },
        { slug: "medicinal", _updatedAt: "2025-01-11T10:00:00Z" },
      ])
      .mockResolvedValueOnce([]) // growers
      .mockResolvedValueOnce([]); // posts

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain(`${BASE_URL}/category/oyster-mushrooms`);
    expect(urls).toContain(`${BASE_URL}/category/medicinal`);
  });

  it("includes grower URLs from Sanity", async () => {
    mockFetch
      .mockResolvedValueOnce([]) // products
      .mockResolvedValueOnce([]) // categories
      .mockResolvedValueOnce([
        { slug: "farm-a", _updatedAt: "2025-01-12T10:00:00Z" },
      ])
      .mockResolvedValueOnce([]); // posts

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain(`${BASE_URL}/grower/farm-a`);
  });

  it("includes blog post URLs from Sanity", async () => {
    mockFetch
      .mockResolvedValueOnce([]) // products
      .mockResolvedValueOnce([]) // categories
      .mockResolvedValueOnce([]) // growers
      .mockResolvedValueOnce([
        { slug: "mushroom-health-benefits", _updatedAt: "2025-01-20T10:00:00Z" },
      ]);

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain(`${BASE_URL}/blog/mushroom-health-benefits`);
  });

  it("sets correct priority for homepage (1.0)", async () => {
    mockFetch.mockResolvedValue([]);
    const result = await sitemap();

    const homepage = result.find((entry) => entry.url === BASE_URL);
    expect(homepage?.priority).toBe(1.0);
  });

  it("sets correct priority for shop page (0.9)", async () => {
    mockFetch.mockResolvedValue([]);
    const result = await sitemap();

    const shop = result.find((entry) => entry.url === `${BASE_URL}/shop`);
    expect(shop?.priority).toBe(0.9);
  });

  it("sets correct priority for products (0.8)", async () => {
    mockFetch
      .mockResolvedValueOnce([
        { slug: "test-product", _updatedAt: "2025-01-15T10:00:00Z" },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await sitemap();

    const productEntry = result.find(
      (entry) => entry.url === `${BASE_URL}/product/test-product`
    );
    expect(productEntry?.priority).toBe(0.8);
  });

  it("sets correct priority for categories (0.7)", async () => {
    mockFetch
      .mockResolvedValueOnce([]) // products
      .mockResolvedValueOnce([
        { slug: "test-category", _updatedAt: "2025-01-15T10:00:00Z" },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await sitemap();

    const categoryEntry = result.find(
      (entry) => entry.url === `${BASE_URL}/category/test-category`
    );
    expect(categoryEntry?.priority).toBe(0.7);
  });

  it("sets correct priority for growers (0.6)", async () => {
    mockFetch
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { slug: "test-grower", _updatedAt: "2025-01-15T10:00:00Z" },
      ])
      .mockResolvedValueOnce([]);

    const result = await sitemap();

    const growerEntry = result.find(
      (entry) => entry.url === `${BASE_URL}/grower/test-grower`
    );
    expect(growerEntry?.priority).toBe(0.6);
  });

  it("sets correct priority for blog posts (0.6)", async () => {
    mockFetch
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { slug: "test-post", _updatedAt: "2025-01-15T10:00:00Z" },
      ]);

    const result = await sitemap();

    const postEntry = result.find(
      (entry) => entry.url === `${BASE_URL}/blog/test-post`
    );
    expect(postEntry?.priority).toBe(0.6);
  });

  it("uses _updatedAt for lastModified on dynamic routes", async () => {
    const updatedAt = "2025-06-15T14:30:00Z";
    mockFetch
      .mockResolvedValueOnce([
        { slug: "dated-product", _updatedAt: updatedAt },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await sitemap();

    const productEntry = result.find(
      (entry) => entry.url === `${BASE_URL}/product/dated-product`
    );
    expect(productEntry?.lastModified).toEqual(new Date(updatedAt));
  });

  it("handles empty Sanity responses gracefully", async () => {
    mockFetch.mockResolvedValue([]);
    const result = await sitemap();

    // Should still have static routes
    expect(result.length).toBeGreaterThan(0);
    const urls = result.map((entry) => entry.url);
    expect(urls).toContain(BASE_URL);
  });

  it("handles null Sanity responses gracefully", async () => {
    mockFetch.mockResolvedValue(null);
    const result = await sitemap();

    // Should still have static routes without crashing
    expect(result.length).toBeGreaterThan(0);
  });

  it("fetches from Sanity 4 times (products, categories, growers, posts)", async () => {
    mockFetch.mockResolvedValue([]);
    await sitemap();

    expect(mockFetch).toHaveBeenCalledTimes(4);
  });
});
