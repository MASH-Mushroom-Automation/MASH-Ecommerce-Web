import { render, screen, fireEvent } from "@testing-library/react";
import { BundleCard, CompactBundleCard, BundleList } from "../BundleCard";

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

const mockBundle = {
  id: "bundle-1",
  slug: "starter-bundle",
  bundleName: "Starter Growth Kit",
  tagline: "Perfect for beginners",
  bundlePrice: 450,
  bundleImage: "/bundle.jpg",
  featured: true,
  badge: "best-seller",
  isActive: true,
  displayOrder: 1,
  products: [
    {
      product: { id: "p1", name: "Mushroom Spawn", price: 200, slug: "spawn" },
      quantity: 2,
      variant: { variantName: "Large" },
    },
    {
      product: { id: "p2", name: "Growing Medium", price: 150, slug: "medium" },
      quantity: 1,
      variant: null,
    },
  ],
};

describe("BundleCard", () => {
  it("should render bundle name and tagline", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("Starter Growth Kit")).toBeInTheDocument();
    expect(screen.getByText("Perfect for beginners")).toBeInTheDocument();
  });

  it("should render bundle image", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    const img = screen.getByAltText("Starter Growth Kit");
    expect(img).toHaveAttribute("src", "/bundle.jpg");
  });

  it("should show placeholder when no image", () => {
    const bundle = { ...mockBundle, bundleImage: null };
    render(<BundleCard bundle={bundle as any} />);
    expect(screen.queryByAltText("Starter Growth Kit")).not.toBeInTheDocument();
  });

  it("should render Featured badge when featured", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("should not render Featured badge when not featured", () => {
    const bundle = { ...mockBundle, featured: false };
    render(<BundleCard bundle={bundle as any} />);
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("should render badge text", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("best seller")).toBeInTheDocument();
  });

  it("should not render badge when none specified", () => {
    const bundle = { ...mockBundle, badge: null };
    render(<BundleCard bundle={bundle as any} />);
    expect(screen.queryByText("best seller")).not.toBeInTheDocument();
  });

  it("should calculate and display discount percentage", () => {
    // Total: 200*2 + 150*1 = 550, bundle: 450, savings: 100, pct: 18%
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("18% OFF")).toBeInTheDocument();
  });

  it("should display bundle price and original price", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText(/₱450\.00/)).toBeInTheDocument();
    expect(screen.getByText(/₱550\.00/)).toBeInTheDocument();
  });

  it("should display savings amount", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText(/Save ₱100\.00/)).toBeInTheDocument();
  });

  it("should render product list with quantities", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("2x")).toBeInTheDocument();
    expect(screen.getByText("Mushroom Spawn")).toBeInTheDocument();
    expect(screen.getByText("1x")).toBeInTheDocument();
    expect(screen.getByText("Growing Medium")).toBeInTheDocument();
  });

  it("should render variant badge when variant exists", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("should call onAddToCart when clicking add button", () => {
    const onAdd = jest.fn();
    render(<BundleCard bundle={mockBundle as any} onAddToCart={onAdd} />);
    fireEvent.click(screen.getByText("Add Bundle to Cart"));
    expect(onAdd).toHaveBeenCalledWith(mockBundle);
  });

  it("should render View Details link", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  it("should link to bundle detail page", () => {
    render(<BundleCard bundle={mockBundle as any} />);
    const links = screen.getAllByRole("link");
    const detailLinks = links.filter((l) => l.getAttribute("href") === "/bundle/starter-bundle");
    expect(detailLinks.length).toBeGreaterThan(0);
  });
});

describe("CompactBundleCard", () => {
  it("should render bundle name", () => {
    render(<CompactBundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("Starter Growth Kit")).toBeInTheDocument();
  });

  it("should render product count", () => {
    render(<CompactBundleCard bundle={mockBundle as any} />);
    expect(screen.getByText("2 products")).toBeInTheDocument();
  });

  it("should render price and savings", () => {
    render(<CompactBundleCard bundle={mockBundle as any} />);
    expect(screen.getByText(/₱450\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Save ₱100\.00/)).toBeInTheDocument();
  });

  it("should call onAddToCart on click", () => {
    const onAdd = jest.fn();
    render(<CompactBundleCard bundle={mockBundle as any} onAddToCart={onAdd} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onAdd).toHaveBeenCalledWith(mockBundle);
  });
});

describe("BundleList", () => {
  it("should render empty state when no bundles", () => {
    render(<BundleList bundles={[]} />);
    expect(screen.getByText("No Bundles Available")).toBeInTheDocument();
    expect(screen.getByText(/Check back later/)).toBeInTheDocument();
  });

  it("should render bundle cards for each bundle", () => {
    render(<BundleList bundles={[mockBundle, { ...mockBundle, id: "b2", bundleName: "Pro Kit", slug: "pro" }] as any} />);
    expect(screen.getByText("Starter Growth Kit")).toBeInTheDocument();
    expect(screen.getByText("Pro Kit")).toBeInTheDocument();
  });

  it("should pass onAddToCart to bundle cards", () => {
    const onAdd = jest.fn();
    render(<BundleList bundles={[mockBundle] as any} onAddToCart={onAdd} />);
    fireEvent.click(screen.getByText("Add Bundle to Cart"));
    expect(onAdd).toHaveBeenCalled();
  });
});
