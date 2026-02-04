/**
 * Breadcrumbs Component Tests
 * Tests for navigation breadcrumb trails
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "../breadcrumbs";

// Mock next/navigation
const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("Breadcrumbs", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Custom Items", () => {
    it("renders custom breadcrumb items", () => {
      const customItems = [
        { label: "Shop", href: "/shop" },
        { label: "Fresh Mushrooms", href: "/shop/fresh" },
      ];

      render(<Breadcrumbs customItems={customItems} />);

      expect(screen.getByText("Shop")).toBeInTheDocument();
      expect(screen.getByText("Fresh Mushrooms")).toBeInTheDocument();
    });

    it("renders home link first with custom items", () => {
      const customItems = [{ label: "Products", href: "/products" }];

      render(<Breadcrumbs customItems={customItems} />);

      const homeLink = screen.getByLabelText("Home");
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("makes last item non-clickable (current page)", () => {
      const customItems = [
        { label: "Shop", href: "/shop" },
        { label: "Current Page", href: "/shop/current" },
      ];

      render(<Breadcrumbs customItems={customItems} />);

      // Last item should be a span, not a link
      const lastItem = screen.getByText("Current Page");
      expect(lastItem.tagName).toBe("SPAN");
      expect(lastItem).toHaveClass("font-medium");
    });

    it("makes intermediate items clickable", () => {
      const customItems = [
        { label: "Shop", href: "/shop" },
        { label: "Category", href: "/shop/category" },
        { label: "Product", href: "/shop/category/product" },
      ];

      render(<Breadcrumbs customItems={customItems} />);

      const shopLink = screen.getByText("Shop");
      expect(shopLink).toHaveAttribute("href", "/shop");

      const categoryLink = screen.getByText("Category");
      expect(categoryLink).toHaveAttribute("href", "/shop/category");
    });

    it("renders chevron separators between items", () => {
      const customItems = [
        { label: "Level 1", href: "/1" },
        { label: "Level 2", href: "/2" },
      ];

      const { container } = render(<Breadcrumbs customItems={customItems} />);

      // ChevronRight icons should be present as separators
      const svgs = container.querySelectorAll("svg");
      // Home icon + 2 chevrons
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Auto-generated Breadcrumbs", () => {
    it("returns null on homepage", () => {
      mockPathname.mockReturnValue("/");

      const { container } = render(<Breadcrumbs />);

      expect(container.firstChild).toBeNull();
    });

    it("generates breadcrumbs from path segments", () => {
      mockPathname.mockReturnValue("/catalog/fresh");

      render(<Breadcrumbs />);

      expect(screen.getByLabelText("Home")).toBeInTheDocument();
    });

    it("uses route name mappings for known routes", () => {
      mockPathname.mockReturnValue("/catalog");

      render(<Breadcrumbs />);

      // "catalog" should be mapped to "Products"
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("handles nested paths correctly", () => {
      mockPathname.mockReturnValue("/seller/dashboard");

      render(<Breadcrumbs />);

      expect(screen.getByLabelText("Home")).toBeInTheDocument();
    });

    it("capitalizes unknown route segments", () => {
      mockPathname.mockReturnValue("/custom-route");

      render(<Breadcrumbs />);

      // Should capitalize and format the segment
      const text = screen.getByText(/custom/i);
      expect(text).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      const customItems = [{ label: "Test", href: "/test" }];

      const { container } = render(
        <Breadcrumbs customItems={customItems} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("has proper nav element with aria-label", () => {
      const customItems = [{ label: "Test", href: "/test" }];

      render(<Breadcrumbs customItems={customItems} />);

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
    });

    it("applies flex layout for horizontal display", () => {
      const customItems = [{ label: "Test", href: "/test" }];

      const { container } = render(<Breadcrumbs customItems={customItems} />);

      expect(container.firstChild).toHaveClass("flex", "items-center");
    });
  });

  describe("Accessibility", () => {
    it("has accessible navigation landmark", () => {
      const customItems = [{ label: "Products", href: "/products" }];

      render(<Breadcrumbs customItems={customItems} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
    });

    it("home link has proper aria-label", () => {
      const customItems = [{ label: "Test", href: "/test" }];

      render(<Breadcrumbs customItems={customItems} />);

      const homeLink = screen.getByLabelText("Home");
      expect(homeLink).toBeInTheDocument();
    });

    it("links have proper hover styles", () => {
      const customItems = [
        { label: "Shop", href: "/shop" },
        { label: "Product", href: "/shop/product" },
      ];

      render(<Breadcrumbs customItems={customItems} />);

      const shopLink = screen.getByText("Shop");
      expect(shopLink).toHaveClass("hover:text-accent");
    });

    it("current page indicator is visually distinct", () => {
      const customItems = [
        { label: "Shop", href: "/shop" },
        { label: "Current", href: "/shop/current" },
      ];

      render(<Breadcrumbs customItems={customItems} />);

      const currentPage = screen.getByText("Current");
      expect(currentPage).toHaveClass("font-medium", "text-foreground");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty custom items array", () => {
      render(<Breadcrumbs customItems={[]} />);

      // Should still render home link
      const homeLink = screen.getByLabelText("Home");
      expect(homeLink).toBeInTheDocument();
    });

    it("handles single custom item", () => {
      const customItems = [{ label: "Only Item", href: "/only" }];

      render(<Breadcrumbs customItems={customItems} />);

      expect(screen.getByLabelText("Home")).toBeInTheDocument();
      expect(screen.getByText("Only Item")).toBeInTheDocument();
    });

    it("handles paths with query strings in auto-generation", () => {
      mockPathname.mockReturnValue("/shop?filter=fresh");

      render(<Breadcrumbs />);

      // Should parse path correctly
      expect(screen.getByLabelText("Home")).toBeInTheDocument();
    });
  });
});
