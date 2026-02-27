/**
 * QuickViewModal Component Unit Tests
 * Tests modal rendering, product display, quantity controls,
 * cart/wishlist interactions, navigation, and edge cases.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QuickViewModal } from "../QuickViewModal";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSanityProduct } from "@/hooks/useSanityProducts";
import { useSanityReviews } from "@/hooks/useSanityReviews";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock("@/contexts/CartContext");
jest.mock("@/contexts/WishlistContext");

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} data-fill={fill ? "true" : undefined} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/analytics", () => ({
  trackAddToCart: jest.fn(),
  trackProductView: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  isAuthenticated: jest.fn(() => true),
}));

jest.mock("@/hooks/useSanityProducts");
jest.mock("@/hooks/useSanityReviews");

// Mock Dialog to render children directly (avoids Radix portal issues in jsdom)
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockProduct = {
  id: "prod-001",
  name: "Fresh Oyster Mushrooms",
  slug: "fresh-oyster-mushrooms",
  description: "Premium quality oyster mushrooms grown in Novaliches Farm.",
  price: 250,
  compareAtPrice: 350,
  image: "https://cdn.sanity.io/images/mushroom-main.jpg",
  images: ["https://cdn.sanity.io/images/mushroom-alt1.jpg"],
  category: "Mushrooms",
  categorySlug: "mushrooms",
  stock: 20,
  sku: "OYS-250",
  unit: "250g",
  isAvailable: true,
  isFeatured: true,
  isPromo: true,
  promoEndDate: undefined,
  productTags: ["organic"],
  deliveryOptions: { sameDayDeliveryEligible: true },
  freshnessInfo: { shelfLife: "5-7 days" },
};

const mockRating = {
  averageRating: 4.5,
  totalReviews: 12,
  distribution: { 1: 0, 2: 1, 3: 1, 4: 3, 5: 7 },
};

const defaultProps = {
  productId: "prod-001",
  productSlug: "fresh-oyster-mushrooms",
  isOpen: true,
  onClose: jest.fn(),
};

function setupMocks(overrides?: {
  product?: any;
  loading?: boolean;
  error?: Error | null;
  rating?: any;
  addToCart?: jest.Mock;
  isInWishlist?: jest.Mock;
}) {
  const addToCart = overrides?.addToCart ?? jest.fn(() => true);
  const addToWishlist = jest.fn();
  const removeFromWishlist = jest.fn();
  const isInWishlist = overrides?.isInWishlist ?? jest.fn(() => false);

  (useCart as jest.Mock).mockReturnValue({ addToCart });
  (useWishlist as jest.Mock).mockReturnValue({
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  });
  (useSanityProduct as jest.Mock).mockReturnValue({
    product: overrides?.product !== undefined ? overrides.product : mockProduct,
    loading: overrides?.loading ?? false,
    error: overrides?.error ?? null,
  });
  (useSanityReviews as jest.Mock).mockReturnValue({
    rating: overrides?.rating !== undefined ? overrides.rating : mockRating,
    reviews: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });

  return { addToCart, addToWishlist, removeFromWishlist, isInWishlist };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("QuickViewModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // -----------------------------------------------------------------------
  // 1. Visibility
  // -----------------------------------------------------------------------

  it("does not render content when isOpen is false", () => {
    setupMocks();
    const { container } = render(
      <QuickViewModal {...defaultProps} isOpen={false} />
    );
    expect(screen.queryByText("Fresh Oyster Mushrooms")).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="dialog"]')).toBeNull();
  });

  it("renders the dialog when isOpen is true", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 2. Product info rendering
  // -----------------------------------------------------------------------

  it("renders product name when open", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    // The visible title in the details pane
    expect(screen.getByText("Fresh Oyster Mushrooms")).toBeInTheDocument();
  });

  it("renders product image with correct src and alt", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    const img = screen.getByAltText("Fresh Oyster Mushrooms");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://cdn.sanity.io/images/mushroom-main.jpg"
    );
  });

  it("shows formatted price in PHP peso format", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    // ₱250 formatted via toLocaleString('en-PH')
    expect(screen.getByText(/₱250/)).toBeInTheDocument();
  });

  it("shows compare-at price and discount percentage when on promo", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    // compareAtPrice = 350
    expect(screen.getByText(/₱350/)).toBeInTheDocument();
    // discount = Math.round((350-250)/350 * 100) = 29%
    expect(screen.getByText(/29% OFF/)).toBeInTheDocument();
  });

  it("shows product category", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("Mushrooms")).toBeInTheDocument();
  });

  it("shows product description", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(
      screen.getByText(/Premium quality oyster mushrooms/)
    ).toBeInTheDocument();
  });

  it("shows unit label", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("/ 250g")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 3. Stock status
  // -----------------------------------------------------------------------

  it("shows 'In Stock' when stock > 0", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText(/In Stock/)).toBeInTheDocument();
    expect(screen.getByText(/20 available/)).toBeInTheDocument();
  });

  it("shows 'Out of Stock' when stock is 0", () => {
    setupMocks({ product: { ...mockProduct, stock: 0 } });
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText(/Out of Stock/)).toBeInTheDocument();
  });

  it("shows low-stock warning when stock <= 10", () => {
    setupMocks({ product: { ...mockProduct, stock: 5 } });
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText(/Only 5 left!/)).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 4. Quantity controls
  // -----------------------------------------------------------------------

  it("starts quantity at 1", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("increments quantity when plus is clicked", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);

    // The quantity section contains two unlabelled buttons (decrease / increase).
    // Decrease is disabled at quantity=1, so the enabled one is the increase button.
    const quantitySection = screen.getByText("Quantity:");
    const container = quantitySection.parentElement;
    const buttons = container?.querySelectorAll("button");
    const increaseBtn = buttons?.[1]; // second button is the + button
    expect(increaseBtn).not.toBeDisabled();

    fireEvent.click(increaseBtn!);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("cannot decrement quantity below 1", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    // The decrease button should be disabled at quantity 1
    const quantitySection = screen.getByText("Quantity:");
    const container = quantitySection.parentElement;
    const buttons = container?.querySelectorAll("button");
    // First button in the quantity group is the decrease button
    const decreaseBtn = buttons?.[0];
    expect(decreaseBtn).toBeDisabled();
  });

  it("cannot increment quantity beyond stock", () => {
    setupMocks({ product: { ...mockProduct, stock: 1 } });
    render(<QuickViewModal {...defaultProps} />);
    // At stock=1 and quantity=1, the increase button should be disabled
    const quantitySection = screen.getByText("Quantity:");
    const container = quantitySection.parentElement;
    const buttons = container?.querySelectorAll("button");
    const increaseBtn = buttons?.[1];
    expect(increaseBtn).toBeDisabled();
  });

  // -----------------------------------------------------------------------
  // 5. Add to cart
  // -----------------------------------------------------------------------

  it("calls addToCart with correct product and quantity", async () => {
    const addToCart = jest.fn(() => true);
    setupMocks({ addToCart });
    render(<QuickViewModal {...defaultProps} />);

    const addBtn = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addBtn);

    // handleAddToCart has a 300ms artificial delay
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(addToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "prod-001",
        name: "Fresh Oyster Mushrooms",
        price: 250,
        image: "https://cdn.sanity.io/images/mushroom-main.jpg",
        slug: "fresh-oyster-mushrooms",
        stock: 20,
      }),
      1  // default quantity
    );
  });

  it("shows 'Added to Cart!' confirmation after successful add", async () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(screen.getByText(/Added to Cart!/)).toBeInTheDocument();
  });

  it("disables add-to-cart button when out of stock", () => {
    setupMocks({ product: { ...mockProduct, stock: 0 } });
    render(<QuickViewModal {...defaultProps} />);

    const addBtn = screen.getByRole("button", { name: /add to cart/i });
    expect(addBtn).toBeDisabled();
  });

  // -----------------------------------------------------------------------
  // 6. Wishlist toggle
  // -----------------------------------------------------------------------

  it("calls addToWishlist when item is not in wishlist", () => {
    const isInWishlist = jest.fn(() => false);
    const { addToWishlist } = setupMocks({ isInWishlist });
    render(<QuickViewModal {...defaultProps} />);

    // The wishlist button has a Heart icon; find button with Heart
    const wishlistBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.querySelector('svg[class*="lucide"]') && !btn.textContent?.includes("Cart") && !btn.textContent?.includes("Close") && btn.closest(".flex.flex-col.sm\\:flex-row"));

    // Simpler: find the button with variant outline (the wishlist button)
    const buttons = screen.getAllByRole("button");
    const heartButton = buttons.find(
      (btn) =>
        btn.classList.toString().includes("h-12") &&
        btn.classList.toString().includes("px-4")
    );

    if (heartButton) {
      fireEvent.click(heartButton);
      expect(addToWishlist).toHaveBeenCalledWith("prod-001");
    }
  });

  it("calls removeFromWishlist when item is already in wishlist", () => {
    const isInWishlist = jest.fn(() => true);
    const { removeFromWishlist } = setupMocks({ isInWishlist });
    render(<QuickViewModal {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    const heartButton = buttons.find(
      (btn) =>
        btn.classList.toString().includes("h-12") &&
        btn.classList.toString().includes("px-4")
    );

    if (heartButton) {
      fireEvent.click(heartButton);
      expect(removeFromWishlist).toHaveBeenCalledWith("prod-001");
    }
  });

  it("shows filled heart icon when item is in wishlist", () => {
    const isInWishlist = jest.fn(() => true);
    setupMocks({ isInWishlist });
    const { container } = render(<QuickViewModal {...defaultProps} />);

    // When in wishlist, the Heart SVG should have "fill-current" class
    const heartSvgs = container.querySelectorAll("svg");
    const filledHeart = Array.from(heartSvgs).find((svg) =>
      svg.classList.contains("fill-current")
    );
    expect(filledHeart).toBeTruthy();
  });

  // -----------------------------------------------------------------------
  // 7. Close button
  // -----------------------------------------------------------------------

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    setupMocks();
    render(<QuickViewModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByLabelText("Close quick view");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 8. View full details link
  // -----------------------------------------------------------------------

  it("renders 'View Full Details' link pointing to product page", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);

    const link = screen.getByText("View Full Details");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/product/fresh-oyster-mushrooms"
    );
  });

  it("calls onClose when 'View Full Details' link is clicked", () => {
    const onClose = jest.fn();
    setupMocks();
    render(<QuickViewModal {...defaultProps} onClose={onClose} />);

    const link = screen.getByText("View Full Details");
    fireEvent.click(link);
    expect(onClose).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // 9. Loading & error states
  // -----------------------------------------------------------------------

  it("shows loading spinner when product is being fetched", () => {
    setupMocks({ loading: true, product: null });
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("Loading product...")).toBeInTheDocument();
  });

  it("shows error message when product fails to load", () => {
    setupMocks({ error: new Error("Network error"), product: null });
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("Failed to load product")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 10. Image gallery / fallback
  // -----------------------------------------------------------------------

  it("uses placeholder image when product has no valid image", () => {
    setupMocks({ product: { ...mockProduct, image: "", images: [] } });
    render(<QuickViewModal {...defaultProps} />);

    const img = screen.getByAltText("Fresh Oyster Mushrooms");
    expect(img).toHaveAttribute("src", "/mushroom-placeholder.png");
  });

  it("renders navigation arrows when multiple images exist", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);

    // The product has mainImage + 1 extra image = 2 images total
    expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
    expect(screen.getByLabelText("Next image")).toBeInTheDocument();
  });

  it("does not render navigation arrows with only one image", () => {
    setupMocks({ product: { ...mockProduct, images: [] } });
    render(<QuickViewModal {...defaultProps} />);

    expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 11. Badges
  // -----------------------------------------------------------------------

  it("shows SALE badge when product is on promo", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("SALE")).toBeInTheDocument();
  });

  it("shows organic badge when product has organic tag", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("Organic")).toBeInTheDocument();
  });

  it("shows same-day delivery badge when eligible", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("Same-Day Delivery")).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 12. Rating / Reviews
  // -----------------------------------------------------------------------

  it("shows average rating and review count", () => {
    setupMocks();
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(12 reviews)")).toBeInTheDocument();
  });

  it("does not show rating section when there are no reviews", () => {
    setupMocks({ rating: { averageRating: 0, totalReviews: 0 } });
    render(<QuickViewModal {...defaultProps} />);
    expect(screen.queryByText("reviews)")).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // 13. Resets state on re-open
  // -----------------------------------------------------------------------

  it("resets quantity to 1 when modal re-opens", () => {
    setupMocks();
    const { rerender } = render(<QuickViewModal {...defaultProps} />);

    // Increment quantity
    const quantitySection = screen.getByText("Quantity:");
    const buttons = quantitySection.parentElement?.querySelectorAll("button");
    const incrementBtn = buttons?.[1];
    if (incrementBtn) {
      fireEvent.click(incrementBtn);
      expect(screen.getByText("2")).toBeInTheDocument();
    }

    // Close and re-open
    rerender(<QuickViewModal {...defaultProps} isOpen={false} />);
    rerender(<QuickViewModal {...defaultProps} isOpen={true} />);

    // Quantity should be back to 1
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});
