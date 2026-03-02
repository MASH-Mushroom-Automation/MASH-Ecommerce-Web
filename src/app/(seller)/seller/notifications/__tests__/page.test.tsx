/**
 * Tests for NotificationsPage - seller notification management
 * Batch 11: Branch + function coverage expansion
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock useNotifications hook
const mockMarkAsRead = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockRemoveNotification = jest.fn();

const sampleNotifications = [
  {
    id: "n1",
    title: "New Order Received",
    message: "Order ORD-100 from John Doe",
    type: "order",
    priority: "high",
    isRead: false,
    time: "2 hours ago",
  },
  {
    id: "n2",
    title: "Payment Confirmed",
    message: "Payment for ORD-099 confirmed",
    type: "payment",
    priority: "medium",
    isRead: true,
    time: "5 hours ago",
  },
  {
    id: "n3",
    title: "New Review",
    message: "Customer left a 5-star review",
    type: "review",
    priority: "low",
    isRead: false,
    time: "1 day ago",
  },
  {
    id: "n4",
    title: "Stock Alert",
    message: "King Oyster Mushroom is running low",
    type: "alert",
    priority: "high",
    isRead: true,
    time: "2 days ago",
  },
  {
    id: "n5",
    title: "Monthly Report Ready",
    message: "Your November sales report is ready",
    type: "report",
    priority: "low",
    isRead: false,
    time: "3 days ago",
  },
  {
    id: "n6",
    title: "Customer Inquiry",
    message: "Jane asked about delivery times",
    type: "customer",
    priority: "medium",
    isRead: false,
    time: "4 days ago",
  },
  {
    id: "n7",
    title: "Shipment Update",
    message: "Package delivered to customer",
    type: "shipping",
    priority: "low",
    isRead: true,
    time: "5 days ago",
  },
  {
    id: "n8",
    title: "Performance Boost",
    message: "Your store views increased by 25%",
    type: "performance",
    priority: "medium",
    isRead: true,
    time: "6 days ago",
  },
  {
    id: "n9",
    title: "General Notification",
    message: "System maintenance scheduled",
    type: "system",
    priority: "unknown",
    isRead: false,
    time: "7 days ago",
  },
];

const defaultHookReturn = {
  notifications: sampleNotifications,
  unreadCount: 5,
  loading: false,
  error: null,
  markAsRead: mockMarkAsRead,
  markAllAsRead: mockMarkAllAsRead,
  removeNotification: mockRemoveNotification,
};

jest.mock("@/hooks/useNotifications", () => ({
  useNotifications: jest.fn(() => defaultHookReturn),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import NotificationsPage from "../page";
import { useNotifications } from "@/hooks/useNotifications";

describe("NotificationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNotifications as jest.Mock).mockReturnValue(defaultHookReturn);
  });

  it("should render the page heading", () => {
    render(<NotificationsPage />);
    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
  });

  it("should display unread count and total count", () => {
    render(<NotificationsPage />);
    expect(screen.getByText(/5 unread/)).toBeInTheDocument();
    expect(screen.getByText(/9 total/)).toBeInTheDocument();
  });

  it("should show Mark All Read button when unread > 0", () => {
    render(<NotificationsPage />);
    expect(screen.getByText("Mark All Read")).toBeInTheDocument();
  });

  it("should hide Mark All Read button when unreadCount is 0", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      unreadCount: 0,
    });
    render(<NotificationsPage />);
    expect(screen.queryByText("Mark All Read")).not.toBeInTheDocument();
  });

  it("should call markAllAsRead when clicking Mark All Read", () => {
    render(<NotificationsPage />);
    fireEvent.click(screen.getByText("Mark All Read"));
    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("should render search input", () => {
    render(<NotificationsPage />);
    expect(screen.getByPlaceholderText("Search notifications...")).toBeInTheDocument();
  });

  it("should render filter dropdown with notification types", () => {
    render(<NotificationsPage />);
    const select = screen.getByDisplayValue("All");
    expect(select).toBeInTheDocument();
    // Verify option labels exist
    const options = select.querySelectorAll("option");
    expect(options.length).toBe(7);
  });

  it("should render all notifications", () => {
    render(<NotificationsPage />);
    expect(screen.getByText("New Order Received")).toBeInTheDocument();
    expect(screen.getByText("Payment Confirmed")).toBeInTheDocument();
    expect(screen.getByText("New Review")).toBeInTheDocument();
    expect(screen.getByText("Stock Alert")).toBeInTheDocument();
    expect(screen.getByText("Monthly Report Ready")).toBeInTheDocument();
    expect(screen.getByText("Customer Inquiry")).toBeInTheDocument();
    expect(screen.getByText("Shipment Update")).toBeInTheDocument();
    expect(screen.getByText("Performance Boost")).toBeInTheDocument();
    expect(screen.getByText("General Notification")).toBeInTheDocument();
  });

  it("should show New badge for unread notifications", () => {
    render(<NotificationsPage />);
    const newBadges = screen.getAllByText("New");
    expect(newBadges.length).toBe(5); // 5 unread notifications
  });

  it("should display priority badges", () => {
    render(<NotificationsPage />);
    const highBadges = screen.getAllByText("high");
    const mediumBadges = screen.getAllByText("medium");
    const lowBadges = screen.getAllByText("low");
    expect(highBadges.length).toBe(2);
    expect(mediumBadges.length).toBe(3);
    expect(lowBadges.length).toBe(3);
  });

  it("should display unknown priority badge", () => {
    render(<NotificationsPage />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("should display notification icons for each type", () => {
    render(<NotificationsPage />);
    // Each notification type maps to an emoji
    expect(screen.getByText("🛒")).toBeInTheDocument(); // order
    expect(screen.getByText("💰")).toBeInTheDocument(); // payment
    expect(screen.getByText("⭐")).toBeInTheDocument(); // review
    expect(screen.getByText("⚠️")).toBeInTheDocument(); // alert
    expect(screen.getByText("📊")).toBeInTheDocument(); // report
    expect(screen.getByText("👤")).toBeInTheDocument(); // customer
    expect(screen.getByText("🚚")).toBeInTheDocument(); // shipping
    expect(screen.getByText("📈")).toBeInTheDocument(); // performance
    expect(screen.getByText("🔔")).toBeInTheDocument(); // default (system)
  });

  it("should filter by search term matching title", () => {
    render(<NotificationsPage />);
    const searchInput = screen.getByPlaceholderText("Search notifications...");
    fireEvent.change(searchInput, { target: { value: "Order" } });
    // "New Order Received" matches
    expect(screen.getByText("New Order Received")).toBeInTheDocument();
    // "Payment Confirmed" should not match
    expect(screen.queryByText("Payment Confirmed")).not.toBeInTheDocument();
  });

  it("should filter by search term matching message", () => {
    render(<NotificationsPage />);
    const searchInput = screen.getByPlaceholderText("Search notifications...");
    fireEvent.change(searchInput, { target: { value: "5-star" } });
    expect(screen.getByText("New Review")).toBeInTheDocument();
    expect(screen.queryByText("New Order Received")).not.toBeInTheDocument();
  });

  it("should filter by type using dropdown", () => {
    render(<NotificationsPage />);
    const select = screen.getByDisplayValue("All");
    fireEvent.change(select, { target: { value: "order" } });
    expect(screen.getByText("New Order Received")).toBeInTheDocument();
    // Payment type should be hidden
    expect(screen.queryByText("Payment Confirmed")).not.toBeInTheDocument();
  });

  it("should filter by unread status", () => {
    render(<NotificationsPage />);
    const select = screen.getByDisplayValue("All");
    fireEvent.change(select, { target: { value: "unread" } });
    // Unread notifications should be visible
    expect(screen.getByText("New Order Received")).toBeInTheDocument();
    // Read notifications should be hidden
    expect(screen.queryByText("Payment Confirmed")).not.toBeInTheDocument();
  });

  it("should filter by read status", () => {
    render(<NotificationsPage />);
    const select = screen.getByDisplayValue("All");
    fireEvent.change(select, { target: { value: "read" } });
    // Read notifications should be visible
    expect(screen.getByText("Payment Confirmed")).toBeInTheDocument();
    // Unread notifications should be hidden
    expect(screen.queryByText("New Order Received")).not.toBeInTheDocument();
  });

  it("should show empty state when no notifications match filters", () => {
    render(<NotificationsPage />);
    const searchInput = screen.getByPlaceholderText("Search notifications...");
    fireEvent.change(searchInput, { target: { value: "zzz-nonexistent-zzz" } });
    expect(screen.getByText("No notifications found")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search or filter criteria")).toBeInTheDocument();
  });

  it("should show empty state message when no notifications at all", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      notifications: [],
      unreadCount: 0,
    });
    render(<NotificationsPage />);
    expect(screen.getByText("No notifications found")).toBeInTheDocument();
    expect(screen.getByText("You're all caught up! No notifications at the moment.")).toBeInTheDocument();
  });

  it("should call markAsRead when clicking the check button on an unread notification", () => {
    render(<NotificationsPage />);
    // Each unread notification has a check button -- find all small ghost buttons
    // The first unread notification is "New Order Received" with id "n1"
    // There should be 5 check buttons for 5 unread notifications
    const allButtons = screen.getAllByRole("button");
    // Filter to check-like buttons (not "Mark All Read", not X, not MoreHorizontal)
    // Each notification card has: check (if unread), X remove, MoreHorizontal
    // Just click the first small button after "Mark All Read"
    // Each unread notification renders a mark-as-read check button
    // We can find them by looking at buttons within notification cards
    // Let's just call the first one
    mockMarkAsRead.mockClear();
    // Find order notification check button - it's an unread notification so it has mark-as-read
    // The buttons appear in order: [ArrowLeft, Mark All Read, ...per notification buttons]
    // For unread notifications: check, X, more (3 buttons each)
    // For read notifications: X, more (2 buttons each)
    // n1 (unread): buttons at indices 2, 3, 4
    // The check button (mark as read) is the first of each unread notification's action buttons
    // Just find buttons and click the 3rd one (index 2)
    fireEvent.click(allButtons[2]);
    expect(mockMarkAsRead).toHaveBeenCalledWith("n1");
  });

  it("should call removeNotification when clicking the X button", () => {
    render(<NotificationsPage />);
    mockRemoveNotification.mockClear();
    const allButtons = screen.getAllByRole("button");
    // For unread n1: check (idx 2), X (idx 3), more (idx 4)
    fireEvent.click(allButtons[3]);
    expect(mockRemoveNotification).toHaveBeenCalledWith("n1");
  });

  it("should render loading state", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      loading: true,
    });
    render(<NotificationsPage />);
    expect(screen.getByText("Loading notifications...")).toBeInTheDocument();
  });

  it("should render error state", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      ...defaultHookReturn,
      error: "Network error occurred",
    });
    render(<NotificationsPage />);
    expect(screen.getByText("Failed to load notifications")).toBeInTheDocument();
    expect(screen.getByText("Network error occurred")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should display notification time", () => {
    render(<NotificationsPage />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    expect(screen.getByText("5 hours ago")).toBeInTheDocument();
  });

  it("should display notification messages", () => {
    render(<NotificationsPage />);
    expect(screen.getByText("Order ORD-100 from John Doe")).toBeInTheDocument();
    expect(screen.getByText("Payment for ORD-099 confirmed")).toBeInTheDocument();
  });

  it("should render back link to seller dashboard", () => {
    render(<NotificationsPage />);
    const link = document.querySelector('a[href="/seller/dashboard"]');
    expect(link).toBeInTheDocument();
  });

  it("should combine search and filter", () => {
    render(<NotificationsPage />);
    const searchInput = screen.getByPlaceholderText("Search notifications...");
    const select = screen.getByDisplayValue("All");
    // Filter by payment type and search for "confirmed"
    fireEvent.change(select, { target: { value: "payment" } });
    fireEvent.change(searchInput, { target: { value: "confirmed" } });
    expect(screen.getByText("Payment Confirmed")).toBeInTheDocument();
    expect(screen.queryByText("New Order Received")).not.toBeInTheDocument();
  });
});
