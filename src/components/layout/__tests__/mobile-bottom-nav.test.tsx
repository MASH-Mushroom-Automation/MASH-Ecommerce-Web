import React from "react";
import { render, screen } from "@testing-library/react";
import { MobileBottomNav, MobileBottomNavSpacer } from "../mobile-bottom-nav";

// Mock dependencies
let mockPathname = "/";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

const mockCartItems = [
  { id: "1", quantity: 2 },
  { id: "2", quantity: 3 },
];
jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ items: mockCartItems }),
}));

jest.mock("next/link", () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  );
});

describe("MobileBottomNav", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("should render all 5 navigation items", () => {
    render(<MobileBottomNav />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Shop")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Growers")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("should render nav element with correct aria-label", () => {
    render(<MobileBottomNav />);
    expect(screen.getByRole("navigation", { name: "Mobile Navigation" })).toBeInTheDocument();
  });

  it("should display cart badge with total item count", () => {
    render(<MobileBottomNav />);
    // 2 + 3 = 5
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should show 9+ when cart count exceeds 9", () => {
    mockCartItems.length = 0;
    mockCartItems.push({ id: "1", quantity: 10 });
    render(<MobileBottomNav />);
    expect(screen.getByText("9+")).toBeInTheDocument();
    // Restore
    mockCartItems.length = 0;
    mockCartItems.push({ id: "1", quantity: 2 }, { id: "2", quantity: 3 });
  });

  it("should have correct link hrefs", () => {
    render(<MobileBottomNav />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/");
    expect(hrefs).toContain("/shop");
    expect(hrefs).toContain("/cart");
    expect(hrefs).toContain("/grower");
    expect(hrefs).toContain("/profile");
  });

  it("should hide nav on /login path", () => {
    mockPathname = "/login";
    const { container } = render(<MobileBottomNav />);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("should hide nav on /signup path", () => {
    mockPathname = "/signup";
    const { container } = render(<MobileBottomNav />);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("should hide nav on /seller path", () => {
    mockPathname = "/seller/dashboard";
    const { container } = render(<MobileBottomNav />);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("should hide nav on /checkout path", () => {
    mockPathname = "/checkout";
    const { container } = render(<MobileBottomNav />);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("should hide nav on /onboarding path", () => {
    mockPathname = "/onboarding";
    const { container } = render(<MobileBottomNav />);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("should show nav on /shop path", () => {
    mockPathname = "/shop";
    render(<MobileBottomNav />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});

describe("MobileBottomNavSpacer", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("should render spacer div on visible routes", () => {
    const { container } = render(<MobileBottomNavSpacer />);
    const spacer = container.firstChild as HTMLElement;
    expect(spacer).toBeInTheDocument();
    expect(spacer.className).toContain("h-16");
  });

  it("should not render spacer on /login path", () => {
    mockPathname = "/login";
    const { container } = render(<MobileBottomNavSpacer />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render spacer on /seller path", () => {
    mockPathname = "/seller/products";
    const { container } = render(<MobileBottomNavSpacer />);
    expect(container.firstChild).toBeNull();
  });
});
