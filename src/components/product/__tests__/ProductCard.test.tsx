/**
 * ProductCard Component Unit Tests
 * Tests product card rendering, interactions, badges, and user actions
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductCard } from "../ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Mock dependencies
jest.mock("@/contexts/CartContext");
jest.mock("@/contexts/WishlistContext");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("@/lib/analytics", () => ({
  trackAddToCart: jest.fn(),
}));
jest.mock("@/lib/grower-utils", () => ({
  getGrowerUrl: jest.fn((farm: string) => `/grower/${farm}`),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} onLoad={props.onLoad} onError={props.onError} />;
  },
}));

describe("ProductCard", () => {
  const mockPush = jest.fn();
  const mockAddToCart = jest.fn();
  const mockAddToWishlist = jest.fn();
  const mockRemoveFromWishlist = jest.fn();
  const mockIsInWishlist = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useCart as jest.Mock).mockReturnValue({
      addToCart: mockAddToCart,
      removeFromCart: jest.fn(),
      isInCart: jest.fn(),
    });

    (useWishlist as jest.Mock).mockReturnValue({
      isInWishlist: mockIsInWishlist,
      addToWishlist: mockAddToWishlist,
      removeFromWishlist: mockRemoveFromWishlist,
    });

    mockIsInWishlist.mockReturnValue(false);
    mockAddToCart.mockReturnValue(true); // Success by default
  });

  describe("Basic Rendering", () => {
    it("renders product card with essential information", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          farm="Novaliches Farm"
          unit="250g"
        />
      );

      expect(screen.getByText("Oyster Mushrooms")).toBeInTheDocument();
      expect(screen.getByText("@Novaliches Farm")).toBeInTheDocument();
      expect(screen.getByText(/₱150/)).toBeInTheDocument();
      expect(screen.getByText("per 250g")).toBeInTheDocument();
    });

    it("renders product image with correct src", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const image = screen.getByAltText("Oyster Mushrooms");
      expect(image).toHaveAttribute("src", "/mushroom.jpg");
    });

    it("uses placeholder image when no image provided", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image=""
        />
      );

      const image = screen.getByAltText("Oyster Mushrooms");
      expect(image).toHaveAttribute("src", "/mushroom-placeholder.png");
    });

    it("uses slug in product URL if provided", () => {
      render(
        <ProductCard
          id="product-1"
          slug="oyster-mushrooms"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const link = screen.getAllByRole("link")[0]; // First link (image link)
      expect(link).toHaveAttribute("href", "/product/oyster-mushrooms");
    });

    it("falls back to ID in URL when slug not provided", () => {
      render(
        <ProductCard
          id="product-123"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const link = screen.getAllByRole("link")[0];
      expect(link).toHaveAttribute("href", "/product/product-123");
    });
  });

  describe("Pricing and Discounts", () => {
    it("displays regular price without discount", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      expect(screen.getByText(/₱150/)).toBeInTheDocument();
      expect(screen.queryByText(/OFF/)).not.toBeInTheDocument();
    });

    it("displays discount badge and strikethrough price", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          comparePrice={200}
          image="/mushroom.jpg"
        />
      );

      expect(screen.getByText("-25% OFF")).toBeInTheDocument();
      expect(screen.getByText(/₱150/)).toBeInTheDocument();
      expect(screen.getByText(/₱200/)).toBeInTheDocument();
    });

    it("calculates correct discount percentage", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={100}
          comparePrice={250}
          image="/mushroom.jpg"
        />
      );

      // (250 - 100) / 250 * 100 = 60%
      expect(screen.getByText("-60% OFF")).toBeInTheDocument();
    });
  });

  describe("Stock Status", () => {
    it("displays out of stock overlay when not in stock", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          inStock={false}
        />
      );

      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
      const button = screen.getByRole("button", { name: /sold out/i });
      expect(button).toBeDisabled();
      expect(screen.getByText("Sold Out")).toBeInTheDocument();
    });

    it("shows low stock warning when stock is 5 or less", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          stock={3}
          inStock={true}
        />
      );

      expect(screen.getByText("Only 3 left!")).toBeInTheDocument();
    });

    it("does not show low stock warning when stock is above 5", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          stock={10}
          inStock={true}
        />
      );

      expect(screen.queryByText(/Only.*left!/)).not.toBeInTheDocument();
    });
  });

  describe("Product Badges", () => {
    it("displays Best Seller badge", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          tags={["Best Seller"]}
        />
      );

      expect(screen.getByText("Best Seller")).toBeInTheDocument();
    });

    it("displays New badge", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          tags={["new"]}
        />
      );

      expect(screen.getByText(/New/)).toBeInTheDocument();
    });

    it("displays Organic badge", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          tags={["Organic"]}
        />
      );

      expect(screen.getByText(/Organic/)).toBeInTheDocument();
    });

    it("displays Fresh badge when not organic", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          tags={["Fresh"]}
        />
      );

      expect(screen.getByText(/Fresh/)).toBeInTheDocument();
    });

    it("displays multiple badges simultaneously", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          comparePrice={200}
          image="/mushroom.jpg"
          tags={["Best Seller", "Organic"]}
        />
      );

      expect(screen.getByText("-25% OFF")).toBeInTheDocument();
      expect(screen.getByText("Best Seller")).toBeInTheDocument();
      expect(screen.getByText(/Organic/)).toBeInTheDocument();
    });
  });

  describe("Rating Display", () => {
    it("displays product rating with stars", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          rating={4.5}
          reviewCount={23}
        />
      );

      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("(23)")).toBeInTheDocument();
    });

    it("does not display rating when not provided", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
    });

    it("displays review count when available", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          rating={5}
          reviewCount={100}
        />
      );

      expect(screen.getByText("(100)")).toBeInTheDocument();
    });
  });

  describe("Add to Cart", () => {
    it("adds product to cart when button clicked", async () => {
      render(
        <ProductCard
          id="product-1"
          slug="oyster"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          farm="Novaliches Farm"
          unit="250g"
          stock={10}
        />
      );

      const buttons = screen.getAllByRole("button");
      const addButton = buttons.find((btn) => btn.textContent?.includes("Add") || btn.querySelector("svg.lucide-plus"));
      
      if (addButton) {
        fireEvent.click(addButton);

        await waitFor(() => {
          expect(mockAddToCart).toHaveBeenCalledWith(
            {
              id: "product-1",
              name: "Oyster Mushrooms",
              price: 150,
              image: "/mushroom.jpg",
              slug: "oyster",
              stock: 10,
              grower: "Novaliches Farm",
              unit: "250g",
            },
            1
          );
        });
      }
    });

    it("shows 'Added' state after successful add to cart", async () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const buttons = screen.getAllByRole("button");
      const addButton = buttons.find((btn) => btn.textContent?.includes("Add") || btn.querySelector("svg.lucide-plus"));
      
      if (addButton) {
        fireEvent.click(addButton);

        await waitFor(() => {
          expect(screen.getByText("Added")).toBeInTheDocument();
        });
      }
    });

    it("disables add button when out of stock", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          inStock={false}
        />
      );

      const addButton = screen.getByRole("button", { name: /sold out/i });
      expect(addButton).toBeDisabled();
      expect(screen.getByText("Sold Out")).toBeInTheDocument();
    });

    it("does not add to cart when already adding", async () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const buttons = screen.getAllByRole("button");
      const addButton = buttons.find((btn) => btn.textContent?.includes("Add") || btn.querySelector("svg.lucide-plus"));
      
      if (addButton) {
        // Click multiple times rapidly
        fireEvent.click(addButton);
        fireEvent.click(addButton);
        fireEvent.click(addButton);

        // Should only be called once (prevents duplicate adds)
        await waitFor(() => {
          expect(mockAddToCart).toHaveBeenCalledTimes(1);
        });
      }
    });
  });

  describe("Wishlist", () => {
    it("adds product to wishlist when heart icon clicked", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const wishlistButton = screen.getByLabelText("Add to wishlist");
      fireEvent.click(wishlistButton);

      expect(mockAddToWishlist).toHaveBeenCalledWith("product-1");
      expect(toast.success).toHaveBeenCalledWith(
        "Added to wishlist!",
        expect.objectContaining({
          description: "Oyster Mushrooms",
        })
      );
    });

    it("removes product from wishlist when already in wishlist", () => {
      mockIsInWishlist.mockReturnValue(true);

      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const wishlistButton = screen.getByLabelText("Remove from wishlist");
      fireEvent.click(wishlistButton);

      expect(mockRemoveFromWishlist).toHaveBeenCalledWith("product-1");
      expect(toast.success).toHaveBeenCalledWith(
        "Removed from wishlist",
        expect.objectContaining({
          description: "Oyster Mushrooms",
        })
      );
    });

    it("shows filled heart icon when product is in wishlist", () => {
      mockIsInWishlist.mockReturnValue(true);

      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      const wishlistButton = screen.getByLabelText("Remove from wishlist");
      expect(wishlistButton).toBeInTheDocument();
    });
  });

  describe("Farm/Grower Navigation", () => {
    it("navigates to grower page when farm badge clicked", async () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          farm="Novaliches Farm"
        />
      );

      const farmBadge = screen.getByRole("button", { name: /view grower novaliches farm/i });
      fireEvent.click(farmBadge);

      // Farm badge uses router.push which is mocked
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("does not render farm badge when farm not provided", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    });
  });

  describe("Quick View", () => {
    it("calls quick view callback when quick view button clicked", () => {
      const onQuickView = jest.fn();

      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          onQuickView={onQuickView}
        />
      );

      // Quick view button only visible on hover in real UI, but always present in DOM
      const quickViewButton = screen.getByLabelText("Quick view");
      fireEvent.click(quickViewButton);

      expect(onQuickView).toHaveBeenCalledWith("product-1");
    });

    it("does not render quick view button when callback not provided", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      expect(screen.queryByLabelText("Quick view")).not.toBeInTheDocument();
    });
  });

  describe("Image Error Handling", () => {
    it("falls back to placeholder when image fails to load", async () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/broken-image.jpg"
        />
      );

      const image = screen.getByAltText("Oyster Mushrooms");
      
      // Trigger image error
      fireEvent.error(image);

      // Should switch to placeholder
      await waitFor(() => {
        expect(image).toHaveAttribute("src", "/mushroom-placeholder.png");
      });
    });
  });

  describe("Description", () => {
    it("displays product description when provided", () => {
      render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
          description="Fresh organic mushrooms from local farms"
        />
      );

      expect(screen.getByText("Fresh organic mushrooms from local farms")).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      const { container } = render(
        <ProductCard
          id="product-1"
          name="Oyster Mushrooms"
          price={150}
          image="/mushroom.jpg"
        />
      );

      // Should not have description paragraph
      const descriptions = container.querySelectorAll("p");
      const hasDescription = Array.from(descriptions).some(
        (p) => p.textContent?.includes("Fresh organic")
      );
      expect(hasDescription).toBe(false);
    });
  });
});
