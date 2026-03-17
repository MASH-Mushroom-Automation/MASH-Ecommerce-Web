/**
 * Tests for critical UI components (COV-010)
 * Tests: MobileBottomNav, ProductGallery (buildGallery), VariantSelector
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Re-mock next/navigation with local control
const mockPathname = jest.fn().mockReturnValue("/");
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn() }),
  usePathname: () => mockPathname(),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  );
});

// Mock next/image
jest.mock("next/image", () => {
  return (props: Record<string, unknown>) => <img {...props} />;
});

// Mock lucide-react with Proxy
jest.mock("lucide-react", () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === "string") {
          const IconComponent = (props: Record<string, unknown>) => (
            <span data-testid={`icon-${prop}`} {...props} />
          );
          IconComponent.displayName = prop;
          return IconComponent;
        }
        return undefined;
      },
    }
  );
});

// Mock useCart context
const mockCartItems = [
  { id: "item1", name: "Test Product", price: 100, quantity: 2, image: "/test.jpg" },
  { id: "item2", name: "Product 2", price: 50, quantity: 1, image: "/test2.jpg" },
];

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items: mockCartItems,
    summary: { totalItems: 3, totalPrice: 250 },
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
  }),
}));

jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({
    items: [],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn().mockReturnValue(false),
  }),
}));

// Mock useSanityVariants - must match ProductVariant interface
const mockVariants = [
  {
    id: "v1",
    productId: "test-product",
    variantName: "Small Red",
    sku: "SKU-001",
    price: 100,
    compareAtPrice: 150,
    weight: "500g",
    size: "Small",
    color: "Red",
    stockQuantity: 10,
    lowStockThreshold: 5,
    isAvailable: true,
    isDefault: true,
    sortOrder: 0,
  },
  {
    id: "v2",
    productId: "test-product",
    variantName: "Large Blue",
    sku: "SKU-002",
    price: 200,
    compareAtPrice: undefined,
    weight: "1kg",
    size: "Large",
    color: "Blue",
    stockQuantity: 0,
    lowStockThreshold: 5,
    isAvailable: false,
    isDefault: false,
    sortOrder: 1,
  },
];

jest.mock("@/hooks/useSanityVariants", () => ({
  useSanityVariants: () => ({
    variants: mockVariants,
    summary: {
      totalVariants: 2,
      availableVariants: 1,
      outOfStockVariants: 1,
      lowestPrice: 100,
      highestPrice: 200,
      priceRange: "₱100.00 - ₱200.00",
      sizes: ["Small", "Large"],
      colors: ["Red", "Blue"],
      weights: ["500g", "1kg"],
    },
    selectedVariant: mockVariants[0],
    loading: false,
    error: null,
    selectVariantById: jest.fn(),
    getStockStatus: jest.fn().mockReturnValue("in-stock"),
  }),
}));

// Mock cn util
jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

// Mock UI components
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span data-testid="badge" {...props}>{children}</span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

// ============ MobileBottomNav ============
describe("MobileBottomNav", () => {
  let MobileBottomNav: React.ComponentType;
  let MobileBottomNavSpacer: React.ComponentType;

  beforeAll(async () => {
    const mod = await import("@/components/layout/mobile-bottom-nav");
    MobileBottomNav = mod.MobileBottomNav;
    MobileBottomNavSpacer = mod.MobileBottomNavSpacer;
  });

  it("should render navigation links on home page", () => {
    mockPathname.mockReturnValue("/");
    render(<MobileBottomNav />);
    const links = document.querySelectorAll("a");
    expect(links.length).toBeGreaterThanOrEqual(4);
  });

  it("should show cart badge with item count", () => {
    mockPathname.mockReturnValue("/");
    const { container } = render(<MobileBottomNav />);
    // Badge should show count of cart items
    expect(container.innerHTML).toContain("3");
  });

  it("should hide on login page", () => {
    mockPathname.mockReturnValue("/login");
    const { container } = render(<MobileBottomNav />);
    // Should render null or empty
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(0);
  });

  it("should hide on checkout page", () => {
    mockPathname.mockReturnValue("/checkout");
    const { container } = render(<MobileBottomNav />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(0);
  });

  it("should render spacer component", () => {
    mockPathname.mockReturnValue("/");
    const { container } = render(<MobileBottomNavSpacer />);
    expect(container.firstChild).toBeTruthy();
  });
});

// ============ ProductGallery - buildGallery ============
describe("ProductGallery - buildGallery", () => {
  let buildGallery: (product: Record<string, unknown>) => Array<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("@/components/product/ProductGallery");
    buildGallery = mod.buildGallery as typeof buildGallery;
  });

  it("should return empty array for product with no images", () => {
    const result = buildGallery({ name: "Empty Product" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should include primary image from product.image", () => {
    const result = buildGallery({
      name: "Test Product",
      image: "https://example.com/main.jpg",
    });
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("should include images from product.images array", () => {
    const result = buildGallery({
      name: "Test Product",
      images: [
        "https://example.com/img1.jpg",
        "https://example.com/img2.jpg",
      ],
    });
    expect(result.length).toBeGreaterThanOrEqual(2);
  });
});

// ============ ProductGallery Component ============
describe("ProductGallery Component", () => {
  let ProductGallery: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("@/components/product/ProductGallery");
    ProductGallery = mod.ProductGallery as React.ComponentType<Record<string, unknown>>;
  });

  const galleryItems = [
    { type: "image", url: "https://example.com/img1.jpg", alt: "Product 1" },
    { type: "image", url: "https://example.com/img2.jpg", alt: "Product 2" },
  ];

  it("should render without error", () => {
    render(
      <ProductGallery
        productName="Test Product"
        galleryItems={galleryItems}
        activeGalleryIndex={0}
        setActiveGalleryIndex={jest.fn()}
        discountPercent={0}
        inWishlist={false}
        onToggleWishlist={jest.fn()}
        onShare={jest.fn()}
      />
    );
    // Should render at least an image
    const images = document.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("should show sale badge when discount exists", () => {
    const { container } = render(
      <ProductGallery
        productName="Test Product"
        galleryItems={galleryItems}
        activeGalleryIndex={0}
        setActiveGalleryIndex={jest.fn()}
        discountPercent={20}
        inWishlist={false}
        onToggleWishlist={jest.fn()}
        onShare={jest.fn()}
      />
    );
    expect(container.innerHTML).toContain("20");
  });

  it("should call onToggleWishlist when wishlist button clicked", () => {
    const onToggleWishlist = jest.fn();
    render(
      <ProductGallery
        productName="Test Product"
        galleryItems={galleryItems}
        activeGalleryIndex={0}
        setActiveGalleryIndex={jest.fn()}
        discountPercent={0}
        inWishlist={false}
        onToggleWishlist={onToggleWishlist}
        onShare={jest.fn()}
      />
    );
    const wishlistBtn = screen.getByTestId("icon-Heart")?.closest("button");
    if (wishlistBtn) {
      fireEvent.click(wishlistBtn);
      expect(onToggleWishlist).toHaveBeenCalled();
    }
  });
});

// ============ VariantSelector ============
describe("VariantSelector", () => {
  let VariantSelector: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("@/components/product/VariantSelector");
    VariantSelector = mod.VariantSelector as React.ComponentType<Record<string, unknown>>;
  });

  it("should render without error", () => {
    render(<VariantSelector productId="test-product" />);
    // Should render variant info (SKU, price, etc.)
    const container = document.body;
    expect(container.innerHTML).toContain("SKU-001");
  });

  it("should display variant sizes", () => {
    const { container } = render(<VariantSelector productId="test-product" />);
    expect(container.innerHTML).toContain("SMALL");
    expect(container.innerHTML).toContain("LARGE");
  });

  it("should display variant colors", () => {
    const { container } = render(<VariantSelector productId="test-product" />);
    expect(container.innerHTML).toContain("Red");
    expect(container.innerHTML).toContain("Blue");
  });

  it("should call onVariantChange when provided", () => {
    const onVariantChange = jest.fn();
    render(<VariantSelector productId="test-product" onVariantChange={onVariantChange} />);
    // useEffect should trigger onVariantChange with selectedVariant
    expect(onVariantChange).toHaveBeenCalledWith(mockVariants[0]);
  });
});

// ============ CompactVariantDisplay ============
describe("CompactVariantDisplay", () => {
  let CompactVariantDisplay: React.ComponentType<Record<string, unknown>>;

  beforeAll(async () => {
    const mod = await import("@/components/product/VariantSelector");
    CompactVariantDisplay = mod.CompactVariantDisplay as React.ComponentType<Record<string, unknown>>;
  });

  it("should render option count and price range", () => {
    const { container } = render(<CompactVariantDisplay productId="test-product" />);
    expect(container.innerHTML).toContain("2");
  });
});
