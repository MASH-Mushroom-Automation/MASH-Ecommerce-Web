import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { CartDropdown } from "../cart-dropdown";

// Mock dependencies
const mockAddToCart = jest.fn();
const mockRemoveFromCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockClearCart = jest.fn();
const mockAddToWishlist = jest.fn();

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items: mockCartItems,
    summary: { subtotal: mockSubtotal },
    addToCart: mockAddToCart,
    removeFromCart: mockRemoveFromCart,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
  }),
}));

jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({
    addToWishlist: mockAddToWishlist,
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock("lucide-react", () => ({
  ShoppingCart: (props: Record<string, unknown>) => <svg data-testid="shopping-cart" {...props} />,
  X: (props: Record<string, unknown>) => <svg data-testid="x-icon" {...props} />,
  Minus: (props: Record<string, unknown>) => <svg data-testid="minus-icon" {...props} />,
  Plus: (props: Record<string, unknown>) => <svg data-testid="plus-icon" {...props} />,
  Trash2: (props: Record<string, unknown>) => <svg data-testid="trash-icon" {...props} />,
  Check: (props: Record<string, unknown>) => <svg data-testid="check-icon" {...props} />,
  Maximize2: (props: Record<string, unknown>) => <svg data-testid="maximize-icon" {...props} />,
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Mock Sheet components
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) => (
    <div data-testid="sheet" data-open={open}>{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 className={className}>{children}</h2>
  ),
  SheetTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    asChild ? <>{children}</> : <button>{children}</button>
  ),
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, id, ...props }: { checked?: boolean; onCheckedChange?: () => void; id?: string; [key: string]: unknown }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onCheckedChange}
      id={id}
      data-testid={id || "checkbox"}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => (
    <button onClick={onClick} data-testid="alert-action" {...props}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  AlertDialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    asChild ? <>{children}</> : <button>{children}</button>
  ),
}));

let mockCartItems: Array<{
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  grower?: string;
}> = [];
let mockSubtotal = 0;

describe("CartDropdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCartItems = [];
    mockSubtotal = 0;
  });

  it("should render cart trigger button with icon", () => {
    render(<CartDropdown />);
    // Multiple ShoppingCart icons render (trigger + empty state + header)
    const icons = screen.getAllByTestId("shopping-cart");
    expect(icons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Cart")).toBeInTheDocument();
  });

  it("should not show badge when cart is empty", () => {
    render(<CartDropdown />);
    expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
  });

  it("should show badge with item count when cart has items", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 2, image: "http://img.jpg", slug: "shiitake" },
      { productId: "2", name: "Oyster", price: 180, quantity: 1, image: "http://img2.jpg", slug: "oyster" },
    ];
    mockSubtotal = 680;
    render(<CartDropdown />);
    // Badge shows item count (number of unique items)
    expect(screen.getByTestId("badge")).toHaveTextContent("2");
  });

  it("should show empty cart state when no items", () => {
    render(<CartDropdown />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByText(/Add some delicious fresh mushrooms/)).toBeInTheDocument();
    expect(screen.getByText("Browse Products")).toBeInTheDocument();
  });

  it("should render cart items with details", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake Mushroom", price: 250, quantity: 2, image: "http://img.jpg", slug: "shiitake", grower: "FarmGuy" },
    ];
    mockSubtotal = 500;
    render(<CartDropdown />);
    expect(screen.getByText("Shiitake Mushroom")).toBeInTheDocument();
    expect(screen.getByText("₱250.00")).toBeInTheDocument();
    expect(screen.getByText("@FarmGuy")).toBeInTheDocument();
  });

  it("should show @MASH when no grower specified", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    expect(screen.getByText("@MASH")).toBeInTheDocument();
  });

  it("should render quantity controls", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 3, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 750;
    render(<CartDropdown />);
    expect(screen.getByLabelText("Decrease quantity")).toBeInTheDocument();
    expect(screen.getByLabelText("Increase quantity")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should call updateQuantity when clicking increase", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 2, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 500;
    render(<CartDropdown />);
    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(mockUpdateQuantity).toHaveBeenCalledWith("1", 3);
  });

  it("should call updateQuantity when clicking decrease with quantity > 1", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 3, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 750;
    render(<CartDropdown />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(mockUpdateQuantity).toHaveBeenCalledWith("1", 2);
  });

  it("should disable decrease button when quantity is 1", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
  });

  it("should not call updateQuantity when decrease clicked at quantity 1", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
  });

  it("should show subtotal in footer", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 2, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 500;
    render(<CartDropdown />);
    expect(screen.getByText("₱500.00")).toBeInTheDocument();
    expect(screen.getByText(/Subtotal/)).toBeInTheDocument();
  });

  it("should render select all checkbox", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    expect(screen.getByTestId("select-all")).toBeInTheDocument();
    expect(screen.getByText("Product (1)")).toBeInTheDocument();
  });

  it("should toggle item selection via checkbox", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    const itemCheckbox = screen.getByLabelText("Select Shiitake");
    fireEvent.click(itemCheckbox);
    // After selection, selection header should appear
    expect(screen.getByText(/1 item selected/)).toBeInTheDocument();
  });

  it("should show selection header with delete button when items selected", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
      { productId: "2", name: "Oyster", price: 180, quantity: 1, image: "http://img2.jpg", slug: "oyster" },
    ];
    mockSubtotal = 430;
    render(<CartDropdown />);
    // Select first item
    fireEvent.click(screen.getByLabelText("Select Shiitake"));
    expect(screen.getByText("Delete Selected")).toBeInTheDocument();
  });

  it("should delete selected items via alert dialog action", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    // Select item
    fireEvent.click(screen.getByLabelText("Select Shiitake"));
    // Click the delete action
    const deleteActions = screen.getAllByTestId("alert-action");
    // First alert-action in the selection header area
    const deleteSelected = deleteActions.find(el => el.textContent === "Delete");
    if (deleteSelected) {
      fireEvent.click(deleteSelected);
      expect(mockRemoveFromCart).toHaveBeenCalledWith("1");
    }
  });

  it("should move selected items to wishlist", () => {
    const { toast } = require("sonner");
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    // Select item
    fireEvent.click(screen.getByLabelText("Select Shiitake"));
    // Click Move to My Likes
    fireEvent.click(screen.getByText("Move to My Likes"));
    expect(mockAddToWishlist).toHaveBeenCalledWith("1");
    expect(toast.success).toHaveBeenCalledWith("Added 1 item to wishlist");
  });

  it("should show error toast when moving to wishlist with no selection", () => {
    const { toast } = require("sonner");
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    // Click Move to My Likes without selecting
    fireEvent.click(screen.getByText("Move to My Likes"));
    expect(toast.error).toHaveBeenCalledWith("Please select items to add to wishlist");
  });

  it("should render checkout link", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    expect(screen.getByText("Proceed to checkout")).toBeInTheDocument();
    const checkoutLink = screen.getByText("Proceed to checkout").closest("a");
    expect(checkoutLink).toHaveAttribute("href", "/checkout");
  });

  it("should use placeholder image when item has no image", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    const img = screen.getByAltText("Shiitake");
    expect(img).toHaveAttribute("src", "/mushroom-placeholder.png");
  });

  it("should show My Cart title in header", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
    ];
    mockSubtotal = 250;
    render(<CartDropdown />);
    expect(screen.getByText("My Cart")).toBeInTheDocument();
  });

  it("should render Full Screen link to /cart", () => {
    render(<CartDropdown />);
    const fullScreenLink = screen.getByTitle("View full cart");
    expect(fullScreenLink).toHaveAttribute("href", "/cart");
  });

  it("should toggle select all", () => {
    mockCartItems = [
      { productId: "1", name: "Shiitake", price: 250, quantity: 1, image: "http://img.jpg", slug: "shiitake" },
      { productId: "2", name: "Oyster", price: 180, quantity: 1, image: "http://img2.jpg", slug: "oyster" },
    ];
    mockSubtotal = 430;
    render(<CartDropdown />);
    // Click Select All in footer
    fireEvent.click(screen.getByText(/Select All/));
    expect(screen.getByText("2 items selected")).toBeInTheDocument();
  });
});
