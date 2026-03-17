/**
 * SearchAutocomplete Component Tests
 * Comprehensive tests for the search autocomplete with suggestions,
 * keyboard navigation, history, and trending searches.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock("@/lib/sanity/client", () => ({
  sanityClient: {
    fetch: jest.fn(),
  },
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

import { sanityClient } from "@/lib/sanity/client";
import { SearchAutocomplete } from "../SearchAutocomplete";

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  {
    _id: "p1",
    name: "Oyster Mushroom Kit",
    slug: "oyster-mushroom-kit",
    price: 299,
    mainImage: "/img1.jpg",
    category: { name: "Growing Kits", slug: "growing-kits" },
  },
  {
    _id: "p2",
    name: "Lions Mane Dried",
    slug: "lions-mane-dried",
    price: 450,
    mainImage: null,
    category: { name: "Dried Mushrooms", slug: "dried-mushrooms" },
  },
];

const MOCK_CATEGORIES = [
  { _id: "c1", name: "Growing Kits", slug: "growing-kits", productCount: 15 },
];

const SEARCH_HISTORY_KEY = "mash_search_history";

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockedFetch = sanityClient.fetch as jest.Mock;

/**
 * Inspect the GROQ query string to decide what data to return.
 * The component fires two parallel fetches: one for products, one for categories.
 */
function mockFetchSuccess(
  products = MOCK_PRODUCTS,
  categories = MOCK_CATEGORIES,
) {
  mockedFetch.mockImplementation((query: string) => {
    // Check category FIRST – the category GROQ also contains
    // `_type == "product"` inside its productCount sub-query,
    // so testing for "category" first avoids a false positive.
    if (query.includes('_type == "category"')) {
      return Promise.resolve(categories);
    }
    if (query.includes('_type == "product"')) {
      return Promise.resolve(products);
    }
    return Promise.resolve([]);
  });
}

function mockFetchEmpty() {
  mockedFetch.mockResolvedValue([]);
}

function mockFetchError() {
  mockedFetch.mockRejectedValue(new Error("Network error"));
}

/** Safe default: return empty arrays so product rendering never crashes. */
function mockFetchSafe() {
  mockedFetch.mockResolvedValue([]);
}

// ── Test Suite ───────────────────────────────────────────────────────────────

describe("SearchAutocomplete", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock = {};

    jest.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key: string) => localStorageMock[key] ?? null,
    );
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(
      (key: string, value: string) => {
        localStorageMock[key] = value;
      },
    );
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(
      (key: string) => {
        delete localStorageMock[key];
      },
    );

    // Suppress console.error from intentional fetch failures
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Safe default: return empty arrays so un-mocked fetches never crash
    mockFetchSafe();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── 1. Rendering ────────────────────────────────────────────────────────

  it("renders search input with default placeholder", () => {
    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders search input with custom placeholder", () => {
    render(<SearchAutocomplete placeholder="Find products..." />);

    expect(screen.getByPlaceholderText("Find products...")).toBeInTheDocument();
  });

  // ── 2. Trending Searches ────────────────────────────────────────────────

  it("shows trending searches when focused with empty query", async () => {
    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    expect(screen.getByText("Trending")).toBeInTheDocument();
    expect(screen.getByText("Oyster Mushrooms")).toBeInTheDocument();
    expect(screen.getByText("Growing Kit")).toBeInTheDocument();
    expect(screen.getByText("Lion's Mane")).toBeInTheDocument();
    expect(screen.getByText("Shiitake")).toBeInTheDocument();
    expect(screen.getByText("Organic")).toBeInTheDocument();
  });

  it("hides trending searches when showTrending is false", async () => {
    render(<SearchAutocomplete showTrending={false} />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    expect(screen.queryByText("Trending")).not.toBeInTheDocument();
  });

  // ── 3. Search History ──────────────────────────────────────────────────

  it("shows search history from localStorage when focused", async () => {
    localStorageMock[SEARCH_HISTORY_KEY] = JSON.stringify([
      "oyster",
      "shiitake",
    ]);

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    expect(screen.getByText("Recent Searches")).toBeInTheDocument();
    expect(screen.getByText("oyster")).toBeInTheDocument();
    expect(screen.getByText("shiitake")).toBeInTheDocument();
  });

  it("hides recent searches when showRecent is false", async () => {
    localStorageMock[SEARCH_HISTORY_KEY] = JSON.stringify(["oyster"]);

    render(<SearchAutocomplete showRecent={false} />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    expect(screen.queryByText("Recent Searches")).not.toBeInTheDocument();
  });

  // ── 4. Typing Triggers Autocomplete ────────────────────────────────────

  it("typing at least 2 characters triggers autocomplete fetch", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.type(input, "oy");

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalled();
    });
  });

  it("does not trigger fetch for single character queries", async () => {
    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.type(input, "o");

    // Should not have called fetch at all (or only with empty result due to length < 2)
    await waitFor(() => {
      expect(mockedFetch).not.toHaveBeenCalled();
    });
  });

  // ── 5. Product Suggestions Display ─────────────────────────────────────

  it("displays product suggestions from Sanity", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(screen.getByText("Oyster Mushroom Kit")).toBeInTheDocument();
    });

    expect(screen.getByText("Lions Mane Dried")).toBeInTheDocument();
    // Price should be displayed
    expect(screen.getByText("₱299")).toBeInTheDocument();
    expect(screen.getByText("₱450")).toBeInTheDocument();
    // "Growing Kits" appears in both the category suggestion and the product's
    // sub-category label, so use getAllByText to avoid false negatives.
    expect(screen.getAllByText("Growing Kits").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Dried Mushrooms")).toBeInTheDocument();
  });

  // ── 6. Category Suggestions Display ────────────────────────────────────

  it("displays category suggestions", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.type(input, "growing");

    await waitFor(() => {
      expect(screen.getByText("Categories")).toBeInTheDocument();
    });

    // Category button in the categories section - find specifically the one with product count
    expect(screen.getByText("15 products")).toBeInTheDocument();
  });

  // ── 7. Loading State ───────────────────────────────────────────────────

  it("shows loading spinner during fetch", async () => {
    // Make fetch hang so we can observe the loading state
    mockedFetch.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });
  });

  // ── 8. Product Click Navigation ────────────────────────────────────────

  it("clicking product suggestion navigates to product page", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(screen.getByText("Oyster Mushroom Kit")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Oyster Mushroom Kit"));

    expect(mockPush).toHaveBeenCalledWith("/product/oyster-mushroom-kit");
  });

  // ── 9. Category Click Navigation ───────────────────────────────────────

  it("clicking category suggestion navigates to category page", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.type(input, "growing");

    await waitFor(() => {
      expect(screen.getByText("15 products")).toBeInTheDocument();
    });

    // Click the category button that contains "Growing Kits" in the categories section
    const categoryButtons = screen.getAllByRole("button");
    const categoryButton = categoryButtons.find((btn) =>
      btn.textContent?.includes("15 products"),
    );
    expect(categoryButton).toBeTruthy();
    await userEvent.click(categoryButton!);

    expect(mockPush).toHaveBeenCalledWith("/shop?category=growing-kits");
  });

  // ── 10. Enter Key Submits Search ───────────────────────────────────────

  it("pressing Enter submits search and navigates to shop page", async () => {
    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "mushroom");

    // Wait for any pending fetches to settle
    await waitFor(() => {
      expect(input).toHaveValue("mushroom");
    });

    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/shop?search=mushroom");
    });
  });

  it("pressing Enter calls onSearch callback when provided", async () => {
    const onSearch = jest.fn();

    render(<SearchAutocomplete onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "mushroom");

    await waitFor(() => {
      expect(input).toHaveValue("mushroom");
    });

    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("mushroom");
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  // ── 11. Escape Key ────────────────────────────────────────────────────

  it("pressing Escape closes suggestions dropdown", async () => {
    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    // Trending section should be visible after focus
    expect(screen.getByText("Trending")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText("Trending")).not.toBeInTheDocument();
    });
  });

  // ── 12. Clear Button ──────────────────────────────────────────────────

  it("clear button resets search input and closes suggestions", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(screen.getByText("Oyster Mushroom Kit")).toBeInTheDocument();
    });

    // The clear button is rendered inside the input container when query is non-empty.
    // It is the button whose parent is the .relative div wrapping the input.
    const inputContainer = input.parentElement!;
    const clearBtn = inputContainer.querySelector("button");
    expect(clearBtn).toBeTruthy();

    fireEvent.click(clearBtn!);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  // ── 13. No Results ─────────────────────────────────────────────────────

  it("shows no results message when fetch returns empty", async () => {
    mockFetchEmpty();

    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "xyznotfound");

    await waitFor(() => {
      expect(
        screen.getByText(/No products found for/),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Try a different search term")).toBeInTheDocument();
    expect(screen.getByText(/Search anyway/)).toBeInTheDocument();
  });

  // ── 14. Fetch Error Handling ───────────────────────────────────────────

  it("handles fetch errors gracefully without crashing", async () => {
    mockFetchError();

    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "oyster");

    // Should not crash - component clears suggestions on error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Search error:",
        expect.any(Error),
      );
    });

    // Should show no results state (suggestions are cleared)
    await waitFor(() => {
      expect(
        screen.getByText(/No products found for/),
      ).toBeInTheDocument();
    });
  });

  // ── 15. Saves Search to localStorage ───────────────────────────────────

  it("saves search query to localStorage history on Enter", async () => {
    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(input).toHaveValue("oyster");
    });

    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        SEARCH_HISTORY_KEY,
        expect.stringContaining("oyster"),
      );
    });
  });

  it("saves search query to history when clicking a product suggestion", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(screen.getByText("Oyster Mushroom Kit")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Oyster Mushroom Kit"));

    expect(Storage.prototype.setItem).toHaveBeenCalledWith(
      SEARCH_HISTORY_KEY,
      expect.stringContaining("Oyster Mushroom Kit"),
    );
  });

  // ── 16. Clear History ──────────────────────────────────────────────────

  it("clears search history when Clear button is clicked", async () => {
    localStorageMock[SEARCH_HISTORY_KEY] = JSON.stringify([
      "oyster",
      "shiitake",
    ]);

    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    expect(screen.getByText("Recent Searches")).toBeInTheDocument();

    // Click "Clear" button next to recent searches header
    const clearBtn = screen.getByText("Clear");
    await userEvent.click(clearBtn);

    expect(Storage.prototype.removeItem).toHaveBeenCalledWith(
      SEARCH_HISTORY_KEY,
    );
    expect(screen.queryByText("Recent Searches")).not.toBeInTheDocument();
  });

  // ── 17. Keyboard Navigation ────────────────────────────────────────────

  it("supports ArrowDown/ArrowUp keyboard navigation through suggestions", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(screen.getByText("Oyster Mushroom Kit")).toBeInTheDocument();
    });

    // Press ArrowDown to highlight first item (category: Growing Kits)
    await userEvent.keyboard("{ArrowDown}");

    // Find the category button → should have highlight class bg-primary/10
    const categoryButtons = screen.getAllByRole("button");
    const growingKitsBtn = categoryButtons.find((btn) =>
      btn.textContent?.includes("15 products"),
    );
    expect(growingKitsBtn?.className).toContain("bg-primary/10");

    // Press ArrowDown again → first product (Oyster Mushroom Kit)
    await userEvent.keyboard("{ArrowDown}");

    const productButtons = screen.getAllByRole("button");
    const oysterBtn = productButtons.find((btn) =>
      btn.textContent?.includes("Oyster Mushroom Kit"),
    );
    expect(oysterBtn?.className).toContain("bg-primary/10");

    // Press ArrowUp → back to category
    await userEvent.keyboard("{ArrowUp}");
    // Now category should be highlighted again
    const updatedCatBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.textContent?.includes("15 products"));
    expect(updatedCatBtn?.className).toContain("bg-primary/10");
  });

  it("pressing Enter on a highlighted product navigates to it", async () => {
    mockFetchSuccess();

    render(<SearchAutocomplete />);
    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");

    await userEvent.type(input, "oyster");

    await waitFor(() => {
      expect(screen.getByText("Oyster Mushroom Kit")).toBeInTheDocument();
    });

    // Arrow down past category (index 0) to first product (index 1)
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith("/product/oyster-mushroom-kit");
  });

  // ── 18. Trending Search Click ──────────────────────────────────────────

  it("clicking a trending search term triggers search", async () => {
    render(<SearchAutocomplete />);

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    await userEvent.click(screen.getByText("Shiitake"));

    expect(mockPush).toHaveBeenCalledWith("/shop?search=Shiitake");
  });

  // ── 19. Click Outside Closes Dropdown ──────────────────────────────────

  it("closes dropdown when clicking outside the component", async () => {
    render(
      <div>
        <SearchAutocomplete />
        <div data-testid="outside">Outside Area</div>
      </div>,
    );

    const input = screen.getByPlaceholderText("Search mushrooms, kits, dried...");
    await userEvent.click(input);

    expect(screen.getByText("Trending")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));

    await waitFor(() => {
      expect(screen.queryByText("Trending")).not.toBeInTheDocument();
    });
  });
});
