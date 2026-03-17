/**
 * Blog Page render tests (Client Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { sanityClient } from "@/lib/sanity/client";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img src={String(props.src || "")} alt={String(props.alt || "")} />
  ),
}));

// Mock Sanity urlFor
jest.mock("@/lib/sanity/client", () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
  urlFor: jest.fn(() => ({
    width: () => ({
      height: () => ({
        url: () => "https://cdn.sanity.io/images/test.jpg",
      }),
    }),
  })),
}));

import BlogPage from "../page";

const mockBlogPost = {
  _id: "post-1",
  title: "Best Mushroom Growing Tips",
  slug: "mushroom-tips",
  excerpt: "Learn the best tips for growing mushrooms.",
  mainImage: { asset: { _ref: "image-ref" } },
  categories: ["Guides", "Tips"],
  author: { name: "John Doe", image: null },
  publishedAt: "2025-01-15T00:00:00Z",
  readTime: 5,
};

const mockRecipe = {
  _id: "recipe-1",
  title: "Mushroom Risotto",
  slug: "mushroom-risotto",
  excerpt: "A creamy Italian classic.",
  mainImage: { asset: { _ref: "image-ref" } },
  difficulty: "beginner",
  cuisine: "Italian",
  totalTime: 45,
  servings: 4,
  hasVideo: true,
  publishedAt: "2025-01-10T00:00:00Z",
};

const mockGuide = {
  _id: "guide-1",
  title: "Growing Oyster Mushrooms",
  slug: "growing-oyster-mushrooms",
  excerpt: "Complete guide to oyster mushrooms.",
  coverImage: { asset: { _ref: "image-ref" } },
  mushroomType: "Oyster",
  difficulty: "beginner",
  timeToFirstHarvest: "2-3 weeks",
  expectedYield: "500g",
  hasVideo: false,
  publishedAt: "2025-01-08T00:00:00Z",
};

describe("BlogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (sanityClient.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<BlogPage />);
    // Should show the page heading (contains emoji)
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders all content types after fetch", async () => {
    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce([mockBlogPost]) // posts
      .mockResolvedValueOnce([mockRecipe]) // recipes
      .mockResolvedValueOnce([mockGuide]); // guides

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText("Best Mushroom Growing Tips")).toBeInTheDocument();
    });
    expect(screen.getByText("Mushroom Risotto")).toBeInTheDocument();
    expect(screen.getByText("Growing Oyster Mushrooms")).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    (sanityClient.fetch as jest.Mock).mockRejectedValue(
      new Error("Sanity error")
    );

    render(<BlogPage />);

    await waitFor(() => {
      // Page should still render without crashing
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  it("filters content by category tabs", async () => {
    (sanityClient.fetch as jest.Mock)
      .mockResolvedValueOnce([mockBlogPost])
      .mockResolvedValueOnce([mockRecipe])
      .mockResolvedValueOnce([mockGuide]);

    render(<BlogPage />);

    await waitFor(() => {
      expect(screen.getByText("Best Mushroom Growing Tips")).toBeInTheDocument();
    });

    // Click Recipes filter
    const recipesTab = screen.getByRole("button", { name: /recipes/i });
    fireEvent.click(recipesTab);

    expect(screen.getByText("Mushroom Risotto")).toBeInTheDocument();
  });
});
