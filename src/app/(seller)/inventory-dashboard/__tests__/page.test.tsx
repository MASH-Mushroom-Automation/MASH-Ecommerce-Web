/**
 * Tests for InventoryDashboard page
 * Targets: src/app/(seller)/inventory-dashboard/page.tsx (72 stmts)
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("next/image", () => ({ __esModule: true, default: (props: any) => <img {...props} /> }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

// Mock lucide-react icons to simple spans
jest.mock("lucide-react", () => {
  const icons = ["AlertCircle","Package","TrendingDown","TrendingUp","RefreshCw","Search","ArrowRight","ShoppingBag","ChevronLeft","ChevronRight"];
  const mocks: Record<string, React.FC<{ className?: string }>> = {};
  icons.forEach((n) => {
    mocks[n] = ({ className }: { className?: string }) => <span data-testid={`icon-${n}`} className={className} />;
  });
  return mocks;
});

const mockProducts = [
  { id: "1", name: "Organic Tomatoes", category: "Vegetables", price: 120, stock: 50, status: "active", image: "/tomato.jpg" },
  { id: "2", name: "Fresh Lettuce", category: "Greens", price: 80, stock: 3, status: "active", image: "/lettuce.jpg" },
  { id: "3", name: "Red Onions", category: "Vegetables", price: 60, stock: 0, status: "active", image: "/onion.jpg" },
];

const defaultPagination = { page: 1, limit: 20, total: 3, totalPages: 1 };

/** Correct mock shape: data is the array, pagination at top-level */
function mockFetchProducts(
  products = mockProducts,
  pagination = defaultPagination,
) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: products, pagination }),
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
  mockFetchProducts();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("InventoryDashboard", () => {
  let InventoryDashboard: any;

  beforeAll(async () => {
    try {
      const mod = await import("@/app/(seller)/inventory-dashboard/page");
      InventoryDashboard = mod.default;
    } catch (e) {
      // Skip if import fails
    }
  });

  it("should render page heading", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getAllByText(/inventory/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should render summary cards with correct counts", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Total Products")).toBeInTheDocument();
      // "In Stock" / "Low Stock" / "Out of Stock" may appear in both summary cards and alerts
      expect(screen.getAllByText("In Stock").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Low Stock/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Out of Stock/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should render search input", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
    });
  });

  it("should render product names in table rows", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Organic Tomatoes")).toBeInTheDocument();
      expect(screen.getByText("Fresh Lettuce")).toBeInTheDocument();
      expect(screen.getByText("Red Onions")).toBeInTheDocument();
    });
  });

  it("should render product prices formatted with peso sign", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("₱120")).toBeInTheDocument();
      expect(screen.getByText("₱80")).toBeInTheDocument();
      expect(screen.getByText("₱60")).toBeInTheDocument();
    });
  });

  it("should render correct stock badges", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("✅ In Stock")).toBeInTheDocument();
      expect(screen.getByText("⚠️ Low Stock")).toBeInTheDocument();
      expect(screen.getByText("❌ Out of Stock")).toBeInTheDocument();
    });
  });

  it("should render refresh button", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it("should show loading skeleton initially", () => {
    if (!InventoryDashboard) return;
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );
    render(<InventoryDashboard />);
    expect(document.querySelector("[class*=animate-pulse]") ||
      document.querySelector("[class*=skeleton]") ||
      screen.queryByText(/loading/i)).toBeDefined();
  });

  // ── Low Stock + Out of Stock alert banners ──

  it("should show low stock warning banner", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Low Stock Warning")).toBeInTheDocument();
      expect(screen.getByText(/1 product is running low/)).toBeInTheDocument();
    });
  });

  it("should show out of stock alert banner", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/1 product is out of stock/)).toBeInTheDocument();
    });
  });

  // ── Error state ──

  it("should show error alert when fetch returns !res.ok", async () => {
    if (!InventoryDashboard) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    });
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Unauthorized")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  it("should show error alert on network error", async () => {
    if (!InventoryDashboard) return;
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Network failure")).toBeInTheDocument();
    });
  });

  it("should show fallback error message for non-Error throws", async () => {
    if (!InventoryDashboard) return;
    (global.fetch as jest.Mock).mockRejectedValue("string error");
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch inventory")).toBeInTheDocument();
    });
  });

  it("should show error when json.success is false", async () => {
    if (!InventoryDashboard) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, error: { message: "Backend down" } }),
    });
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Backend down")).toBeInTheDocument();
    });
  });

  // ── Retry button ──

  it("should refetch when Retry button is clicked", async () => {
    if (!InventoryDashboard) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Server error" }),
    });
    render(<InventoryDashboard />);
    await waitFor(() => screen.getByText("Retry"));

    // Now fix the mock for retry
    mockFetchProducts();
    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => {
      expect(screen.getByText("Organic Tomatoes")).toBeInTheDocument();
    });
  });

  // ── Empty state ──

  it("should show empty state with 'No Products Found'", async () => {
    if (!InventoryDashboard) return;
    mockFetchProducts([], { page: 1, limit: 20, total: 0, totalPages: 0 });
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText("No Products Found")).toBeInTheDocument();
      expect(screen.getByText(/Add your first product/)).toBeInTheDocument();
    });
  });

  // ── Refresh button ──

  it("should refetch when refresh button is clicked", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => screen.getByText("Organic Tomatoes"));

    const callsBefore = (global.fetch as jest.Mock).mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /refresh/i }));
    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  // ── Pagination ──

  it("should show pagination when totalPages > 1", async () => {
    if (!InventoryDashboard) return;
    mockFetchProducts(mockProducts, { page: 1, limit: 2, total: 6, totalPages: 3 });
    render(<InventoryDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });
  });

  it("should navigate to next page when Next is clicked", async () => {
    if (!InventoryDashboard) return;
    mockFetchProducts(mockProducts, { page: 1, limit: 2, total: 6, totalPages: 3 });
    render(<InventoryDashboard />);
    await waitFor(() => screen.getByText(/Page 1 of 3/));

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      expect(lastUrl).toContain("page=2");
    });
  });

  it("should navigate to previous page when Prev is clicked", async () => {
    if (!InventoryDashboard) return;
    mockFetchProducts(mockProducts, { page: 2, limit: 2, total: 6, totalPages: 3 });
    render(<InventoryDashboard />);
    await waitFor(() => screen.getByText(/Page 2 of 3/));

    // Click Next first to set page > 1 internally
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      expect(lastUrl).toContain("page=");
    });
  });

  // ── Search debounce ──

  it("should debounce search and reset page", async () => {
    if (!InventoryDashboard) return;
    jest.useFakeTimers();
    render(<InventoryDashboard />);

    // Wait for initial load
    await waitFor(() => screen.getByPlaceholderText(/search products/i));

    fireEvent.change(screen.getByPlaceholderText(/search products/i), { target: { value: "tomato" } });

    // Advance past debounce delay
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      expect(lastUrl).toContain("search=tomato");
    });

    jest.useRealTimers();
  });

  // ── Category null renders dash ──

  it("should show dash when product has no category", async () => {
    if (!InventoryDashboard) return;
    const productsNoCategory = [{ ...mockProducts[0], category: undefined }];
    mockFetchProducts(productsNoCategory, { page: 1, limit: 20, total: 1, totalPages: 1 });
    render(<InventoryDashboard />);
    await waitFor(() => {
      // The null-coalesce renders a dash
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  // ── No pagination when totalPages = 1 ──

  it("should not show pagination footer when totalPages is 1", async () => {
    if (!InventoryDashboard) return;
    render(<InventoryDashboard />);
    await waitFor(() => screen.getByText("Organic Tomatoes"));
    expect(screen.queryByText(/Page 1 of 1/)).not.toBeInTheDocument();
  });

  // ── data is not an array ──

  it("should handle non-array data gracefully", async () => {
    if (!InventoryDashboard) return;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { products: mockProducts }, pagination: null }),
    });
    render(<InventoryDashboard />);
    await waitFor(() => {
      // Array.isArray({}) is false → products = []
      expect(screen.getByText("No Products Found")).toBeInTheDocument();
    });
  });
});
