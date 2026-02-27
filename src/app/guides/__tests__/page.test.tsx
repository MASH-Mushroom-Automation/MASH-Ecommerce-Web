/**
 * Guides Page render tests (Server Component)
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

import GuidesPage from "../page";
import { sanityClient } from "@/lib/sanity/client";

const mockFetch = sanityClient.fetch as jest.Mock;

describe("GuidesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no guides", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await GuidesPage());
    expect(screen.getByText("No Guides Yet")).toBeInTheDocument();
    expect(screen.getByText("Browse Growing Kits")).toBeInTheDocument();
  });

  it("renders hero section with heading", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await GuidesPage());
    expect(
      screen.getByRole("heading", { name: /growing guides/i })
    ).toBeInTheDocument();
  });

  it("renders guide cards when guides exist", async () => {
    mockFetch.mockResolvedValueOnce([
      {
        _id: "1",
        title: "Grow Shiitake",
        slug: { current: "grow-shiitake" },
        mushroomType: "shiitake",
        difficulty: "beginner",
        hasVideo: false,
      },
    ]);
    render(await GuidesPage());
    expect(screen.getByText("Grow Shiitake")).toBeInTheDocument();
  });

  it("renders Why Grow section", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await GuidesPage());
    expect(
      screen.getByText("Why Grow Your Own Mushrooms?")
    ).toBeInTheDocument();
  });

  it("renders search bar", async () => {
    mockFetch.mockResolvedValueOnce([]);
    render(await GuidesPage());
    expect(
      screen.getByPlaceholderText("Search guides...")
    ).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    render(await GuidesPage());
    // Should still render with empty state
    expect(screen.getByText("No Guides Yet")).toBeInTheDocument();
  });
});
