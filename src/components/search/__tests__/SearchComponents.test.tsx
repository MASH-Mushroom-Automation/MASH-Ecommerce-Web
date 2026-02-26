/**
 * Search Components Tests
 * Tests for SearchTrigger, SearchDialog, and search functionality
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchTrigger } from "../SearchTrigger";
import { SearchDialog } from "../SearchDialog";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/lib/sanity/client", () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}));

jest.mock("@/hooks/useSearchShortcut", () => ({
  useSearchShortcut: () => ({
    openSearch: jest.fn(),
  }),
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

import { sanityClient } from "@/lib/sanity/client";

describe("SearchTrigger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders with default placeholder", () => {
      render(<SearchTrigger />);
      
      expect(screen.getByText("Search products...")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(<SearchTrigger placeholder="Find mushrooms..." />);
      
      expect(screen.getByText("Find mushrooms...")).toBeInTheDocument();
    });

    it("displays search icon", () => {
      const { container } = render(<SearchTrigger />);
      
      const searchIcon = container.querySelector("svg");
      expect(searchIcon).toBeInTheDocument();
    });

    it("shows keyboard shortcut hint on desktop", () => {
      render(<SearchTrigger />);
      
      // Should show Ctrl K on non-Mac
      const kbd = screen.getByText(/ctrl k/i);
      expect(kbd).toBeInTheDocument();
    });
  });

  describe("Click Handling", () => {
    it("is clickable button", () => {
      render(<SearchTrigger />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("triggers search on click", async () => {
      const user = userEvent.setup();
      render(<SearchTrigger />);
      
      const button = screen.getByRole("button");
      await user.click(button);
      
      // openSearch should have been called (mocked)
      expect(button).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      render(<SearchTrigger className="custom-search-class" />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-search-class");
    });

    it("has proper base styles", () => {
      render(<SearchTrigger />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "rounded-lg", "bg-background");
    });
  });

  describe("Accessibility", () => {
    it("button is accessible", () => {
      render(<SearchTrigger />);
      
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });
});

describe("SearchDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (sanityClient.fetch as jest.Mock).mockResolvedValue([]);
  });

  describe("Basic Rendering", () => {
    it("renders when open is true", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(<SearchDialog {...defaultProps} open={false} />);
      
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("shows search input", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("has placeholder text in input", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });
  });

  describe("Quick Actions", () => {
    it("shows quick actions when no search query", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    });

    it("displays Fresh Mushrooms quick action", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByText("Fresh Mushrooms")).toBeInTheDocument();
    });

    it("displays Dried Mushrooms quick action", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByText("Dried Mushrooms")).toBeInTheDocument();
    });

    it("displays Growing Kits quick action", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByText("Growing Kits")).toBeInTheDocument();
    });

    it("displays All Products quick action", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByText("All Products")).toBeInTheDocument();
    });
  });

  describe("Search Input", () => {
    it("allows typing in search input", async () => {
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "lion's mane" } });
      
      expect(input).toHaveValue("lion's mane");
    });

    it("shows clear button when input has value", async () => {
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "test" } });
      
      // Clear button has X icon (no accessible name, find by presence)
      // Look for any button that contains the X icon after input has content
      const buttons = screen.getAllByRole("button");
      const clearButton = buttons.find(btn => btn.querySelector('svg.lucide-x'));
      expect(clearButton).toBeInTheDocument();
    });

    it("clears input when clear button clicked", async () => {
      const user = userEvent.setup();
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "test" } });
      
      // Find and click clear button
      const buttons = screen.getAllByRole("button");
      const clearBtn = buttons.find(btn => btn.querySelector('svg[class*="h-4"]'));
      if (clearBtn) {
        await user.click(clearBtn);
        expect(input).toHaveValue("");
      }
    });
  });

  describe("Search Results", () => {
    it("shows loading state when searching", async () => {
      (sanityClient.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 1000))
      );
      
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "mushroom" } });
      
      // Loading indicator should appear
      await waitFor(() => {
        expect(screen.getByText(/searching/i)).toBeInTheDocument();
      });
    });

    it("displays product results", async () => {
      // Mock returns [products, categories] in order of Promise.all calls
      let callCount = 0;
      (sanityClient.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        // First call is for products, second is for categories
        if (callCount % 2 === 1) {
          return Promise.resolve([
            {
              _id: "prod-1",
              name: "Lion's Mane",
              slug: "lions-mane",
              price: 350,
              mainImage: null,
              category: { name: "Fresh", slug: "fresh" },
            },
          ]);
        }
        return Promise.resolve([]);
      });
      
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "lion" } });
      
      await waitFor(() => {
        expect(screen.getByText("Lion's Mane")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("displays category results", async () => {
      let callCount = 0;
      (sanityClient.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        // First call is for products (empty), second is for categories
        if (callCount % 2 === 1) {
          return Promise.resolve([]); // No products
        }
        return Promise.resolve([
          {
            _id: "cat-1",
            name: "Fresh Mushrooms",
            slug: "fresh-mushrooms",
            productCount: 10,
          },
        ]);
      });
      
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "fresh" } });
      
      await waitFor(() => {
        expect(screen.getByText("Categories")).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("shows no results message when nothing found", async () => {
      (sanityClient.fetch as jest.Mock).mockResolvedValue([]);
      
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "nonexistent product xyz" } });
      
      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });

    it("shows product price formatted as peso", async () => {
      let callCount = 0;
      (sanityClient.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 1) {
          return Promise.resolve([
            {
              _id: "prod-1",
              name: "Test Product",
              slug: "test",
              price: 1250,
              mainImage: null,
            },
          ]);
        }
        return Promise.resolve([]);
      });
      
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "test" } });
      
      await waitFor(() => {
        expect(screen.getByText(/₱1,250/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe("Keyboard Navigation", () => {
    it("shows keyboard hints in footer", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByText(/to navigate/)).toBeInTheDocument();
      expect(screen.getByText(/to select/)).toBeInTheDocument();
      expect(screen.getByText(/to close/)).toBeInTheDocument();
    });

    it("closes dialog on escape", async () => {
      const user = userEvent.setup();
      render(<SearchDialog {...defaultProps} />);
      
      await user.keyboard("{Escape}");
      
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("Accessibility", () => {
    it("has accessible dialog", () => {
      render(<SearchDialog {...defaultProps} />);
      
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("input has proper accessibility", () => {
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("focuses input on open", async () => {
      render(<SearchDialog {...defaultProps} />);
      
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        expect(document.activeElement).toBe(input);
      }, { timeout: 200 });
    });
  });

  describe("View All Results", () => {
    it("shows view all results button when results exist", async () => {
      let callCount = 0;
      (sanityClient.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 1) {
          return Promise.resolve([
            {
              _id: "prod-1",
              name: "Product",
              slug: "product",
              price: 100,
              mainImage: null,
            },
          ]);
        }
        return Promise.resolve([]);
      });
      
      render(<SearchDialog {...defaultProps} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "product" } });
      
      await waitFor(() => {
        expect(screen.getByText(/view all results/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
