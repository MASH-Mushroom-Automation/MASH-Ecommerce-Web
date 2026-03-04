import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const mockMarkAsRead = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockDeleteNotification = jest.fn();
let mockNotifications: any[] = [];
let mockUnreadCount = 0;
let mockLoading = false;

jest.mock("@/hooks/useFirebaseNotifications", () => ({
  useFirebaseNotifications: () => ({
    notifications: mockNotifications,
    unreadCount: mockUnreadCount,
    loading: mockLoading,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
    deleteNotification: mockDeleteNotification,
  }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}));

jest.mock("lucide-react", () => ({
  Bell: (props: any) => <svg data-testid="bell-icon" {...props} />,
  Check: () => <svg data-testid="check-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
  Package: () => <svg data-testid="package-icon" />,
  Truck: () => <svg data-testid="truck-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  XCircle: () => <svg data-testid="x-circle-icon" />,
  Tag: () => <svg data-testid="tag-icon" />,
  ShoppingBag: () => <svg data-testid="shopping-bag-icon" />,
  Megaphone: () => <svg data-testid="megaphone-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div data-testid="dropdown-trigger">{children}</div>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => <span className={className} data-testid="badge">{children}</span>,
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>{children}</button>
  ),
}));

jest.mock("date-fns", () => ({
  formatDistanceToNow: (date: any) => "2 hours ago",
}));

import { NotificationDropdown } from "../notification-dropdown";

describe("NotificationDropdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotifications = [];
    mockUnreadCount = 0;
    mockLoading = false;
  });

  it("renders bell icon trigger", () => {
    render(<NotificationDropdown />);
    const bells = screen.getAllByTestId("bell-icon");
    expect(bells.length).toBeGreaterThanOrEqual(1);
  });

  it("shows unread badge when count > 0", () => {
    mockUnreadCount = 5;
    render(<NotificationDropdown />);
    expect(screen.getByTestId("badge")).toHaveTextContent("5");
  });

  it("hides unread badge when count is 0", () => {
    mockUnreadCount = 0;
    render(<NotificationDropdown />);
    expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockLoading = true;
    render(<NotificationDropdown />);
    expect(screen.getByText("Loading notifications...")).toBeInTheDocument();
  });

  it("shows empty state when no notifications", () => {
    mockNotifications = [];
    render(<NotificationDropdown />);
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });

  it("renders notification items with titles and messages", () => {
    mockNotifications = [
      { id: "1", type: "order_placed", title: "Order Placed", message: "Your order #123 was placed", read: false, createdAt: new Date().toISOString(), data: {} },
    ];
    render(<NotificationDropdown />);
    expect(screen.getByText("Order Placed")).toBeInTheDocument();
    expect(screen.getByText("Your order #123 was placed")).toBeInTheDocument();
  });

  it("shows mark-all-read button when unread count > 0", () => {
    mockUnreadCount = 3;
    render(<NotificationDropdown />);
    expect(screen.getByText("Mark all read")).toBeInTheDocument();
  });

  it("hides mark-all-read button when unread count is 0", () => {
    mockUnreadCount = 0;
    render(<NotificationDropdown />);
    expect(screen.queryByText("Mark all read")).not.toBeInTheDocument();
  });

  it("calls markAllAsRead when button is clicked", () => {
    mockUnreadCount = 2;
    render(<NotificationDropdown />);
    fireEvent.click(screen.getByText("Mark all read"));
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("shows mark-as-read button for unread notifications", () => {
    mockNotifications = [
      { id: "1", type: "order_placed", title: "New Order", message: "Details", read: false, createdAt: "2024-01-01", data: {} },
    ];
    render(<NotificationDropdown />);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("hides mark-as-read button for read notifications", () => {
    mockNotifications = [
      { id: "1", type: "order_placed", title: "Old Order", message: "Details", read: true, createdAt: "2024-01-01", data: {} },
    ];
    render(<NotificationDropdown />);
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("shows delete button for each notification", () => {
    mockNotifications = [
      { id: "1", type: "system", title: "System", message: "Update", read: true, createdAt: "2024-01-01", data: {} },
    ];
    render(<NotificationDropdown />);
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("renders notification with link when data.link exists", () => {
    mockNotifications = [
      { id: "1", type: "order_shipped", title: "Shipped", message: "On the way", read: false, createdAt: "2024-01-01", data: { link: "/orders/123" } },
    ];
    render(<NotificationDropdown />);
    const link = screen.getByText("Shipped").closest("a");
    expect(link).toHaveAttribute("href", "/orders/123");
  });

  it("renders notification without link when data.link is absent", () => {
    mockNotifications = [
      { id: "1", type: "promotion", title: "Sale!", message: "50% off", read: true, createdAt: "2024-01-01", data: {} },
    ];
    render(<NotificationDropdown />);
    const text = screen.getByText("Sale!");
    expect(text.closest("a")).toBeNull();
  });

  it("formats notification time", () => {
    mockNotifications = [
      { id: "1", type: "system", title: "T", message: "M", read: true, createdAt: "2024-06-15T10:00:00Z", data: {} },
    ];
    render(<NotificationDropdown />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("shows View All Notifications footer when notifications exist", () => {
    mockNotifications = [
      { id: "1", type: "system", title: "T", message: "M", read: true, createdAt: "2024-01-01", data: {} },
    ];
    render(<NotificationDropdown />);
    expect(screen.getByText("View All Notifications")).toBeInTheDocument();
  });

  it("hides View All Notifications footer when empty", () => {
    mockNotifications = [];
    render(<NotificationDropdown />);
    expect(screen.queryByText("View All Notifications")).not.toBeInTheDocument();
  });

  it("applies unread styling to unread notifications", () => {
    mockNotifications = [
      { id: "1", type: "order_approved", title: "Approved", message: "Done", read: false, createdAt: "2024-01-01", data: {} },
    ];
    const { container } = render(<NotificationDropdown />);
    const item = screen.getByText("Approved").closest("[class*='bg-primary']");
    expect(item).toBeTruthy();
  });

  it("renders different notification type icons", () => {
    mockNotifications = [
      { id: "1", type: "order_shipped", title: "Shipped", message: "M", read: true, createdAt: "2024-01-01", data: {} },
      { id: "2", type: "price_drop", title: "Price Drop", message: "M", read: true, createdAt: "2024-01-01", data: {} },
    ];
    render(<NotificationDropdown />);
    expect(screen.getByTestId("truck-icon")).toBeInTheDocument();
    expect(screen.getByTestId("tag-icon")).toBeInTheDocument();
  });

  it("renders View all button in header", () => {
    render(<NotificationDropdown />);
    expect(screen.getByText("View all")).toBeInTheDocument();
  });
});
