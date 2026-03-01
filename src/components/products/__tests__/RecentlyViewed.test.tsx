import { render, screen } from "@testing-library/react";
import { RecentlyViewed } from "../RecentlyViewed";

const mockClearRecentlyViewed = jest.fn();
const mockUseRecentlyViewed = jest.fn();
const mockUseWishlistProducts = jest.fn();

jest.mock("@/hooks/useRecentlyViewed", () => ({
  useRecentlyViewed: () => mockUseRecentlyViewed(),
}));

jest.mock("@/hooks/useWishlistProducts", () => ({
  useWishlistProducts: (...args: unknown[]) => mockUseWishlistProducts(...args),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockProducts = [
  { id: "p1", name: "Oyster Mushroom", slug: "oyster", price: 120, image: "/img1.jpg" },
  { id: "p2", name: "Shiitake Kit", slug: "shiitake", price: 350, image: "/img2.jpg" },
];

describe("RecentlyViewed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null when not loaded", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: false,
    });
    mockUseWishlistProducts.mockReturnValue({ products: [], loading: false });
    const { container } = render(<RecentlyViewed />);
    expect(container.innerHTML).toBe("");
  });

  it("should return null when no recent IDs", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: [],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({ products: [], loading: false });
    const { container } = render(<RecentlyViewed />);
    expect(container.innerHTML).toBe("");
  });

  it("should return null while loading products", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({ products: [], loading: true });
    const { container } = render(<RecentlyViewed />);
    expect(container.innerHTML).toBe("");
  });

  it("should return null when products array is empty", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({ products: [], loading: false });
    const { container } = render(<RecentlyViewed />);
    expect(container.innerHTML).toBe("");
  });

  it("should render recently viewed products", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1", "p2"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({ products: mockProducts, loading: false });
    render(<RecentlyViewed />);
    expect(screen.getByText("Recently Viewed")).toBeInTheDocument();
    expect(screen.getByText("Oyster Mushroom")).toBeInTheDocument();
    expect(screen.getByText("Shiitake Kit")).toBeInTheDocument();
  });

  it("should exclude specified product ID", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1", "p2"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({
      products: [mockProducts[1]],
      loading: false,
    });
    render(<RecentlyViewed excludeProductId="p1" />);
    expect(mockUseWishlistProducts).toHaveBeenCalledWith(["p2"]);
  });

  it("should render product prices", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({
      products: [mockProducts[0]],
      loading: false,
    });
    render(<RecentlyViewed />);
    expect(screen.getByText("₱120")).toBeInTheDocument();
  });

  it("should render product images", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({
      products: [mockProducts[0]],
      loading: false,
    });
    render(<RecentlyViewed />);
    const img = screen.getByAltText("Oyster Mushroom");
    expect(img).toHaveAttribute("src", "/img1.jpg");
  });

  it("should link to product detail page using slug", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({
      products: [mockProducts[0]],
      loading: false,
    });
    render(<RecentlyViewed />);
    const link = screen.getByRole("link", { name: /Oyster Mushroom/i });
    expect(link).toHaveAttribute("href", "/product/oyster");
  });

  it("should render Clear button", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({
      products: [mockProducts[0]],
      loading: false,
    });
    render(<RecentlyViewed />);
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("should respect maxDisplay prop", () => {
    mockUseRecentlyViewed.mockReturnValue({
      recentProductIds: ["p1", "p2", "p3"],
      clearRecentlyViewed: mockClearRecentlyViewed,
      isLoaded: true,
    });
    mockUseWishlistProducts.mockReturnValue({ products: [mockProducts[0]], loading: false });
    render(<RecentlyViewed maxDisplay={1} />);
    expect(mockUseWishlistProducts).toHaveBeenCalledWith(["p1"]);
  });
});
