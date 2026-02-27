/**
 * Recipes Page render tests (Server Component)
 * COV-012: Page coverage batch
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Sanity client
jest.mock("@/lib/sanity/client", () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
  urlFor: jest.fn(() => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    url: () => "https://cdn.sanity.io/test-image.jpg",
  })),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img src={String(props.src || "")} alt={String(props.alt || "")} />
  ),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import RecipesPage from "../page";
import { sanityClient } from "@/lib/sanity/client";

const mockFetch = sanityClient.fetch as jest.Mock;

describe("RecipesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no recipes", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await RecipesPage());
    expect(screen.getByText("No Recipes Yet")).toBeInTheDocument();
    expect(screen.getByText("Browse Products")).toBeInTheDocument();
  });

  it("renders hero section with heading", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await RecipesPage());
    expect(
      screen.getByRole("heading", { name: /mushroom recipes/i })
    ).toBeInTheDocument();
  });

  it("renders recipe cards when recipes exist", async () => {
    mockFetch.mockResolvedValueOnce([
      {
        _id: "1",
        title: "Mushroom Adobo",
        slug: { current: "mushroom-adobo" },
        difficulty: "beginner",
        hasVideo: false,
        totalTime: 30,
        servings: 4,
      },
    ]);
    render(await RecipesPage());
    expect(screen.getByText("Mushroom Adobo")).toBeInTheDocument();
  });

  it("renders CTA section", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await RecipesPage());
    expect(screen.getByText("Ready to Cook?")).toBeInTheDocument();
  });

  it("renders search bar", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await RecipesPage());
    expect(
      screen.getByPlaceholderText("Search recipes...")
    ).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(await RecipesPage());
    expect(screen.getByText("No Recipes Yet")).toBeInTheDocument();
  });
});
