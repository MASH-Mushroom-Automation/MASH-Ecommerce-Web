/**
 * Tests for RefundPage - seller refund management
 * COV-012: Seller page tests + Batch 11 enhancement
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { toast } from "sonner";

// Mock status-utils
jest.mock("@/lib/status-utils", () => ({
  getStatusBadge: jest.fn((status: string) => <span data-testid="status-badge">{status}</span>),
}));

// Mock recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Cell: () => null,
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

import RefundPage from "../page";

describe("RefundPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL for CSV export
    global.URL.createObjectURL = jest.fn(() => "blob:test");
    global.URL.revokeObjectURL = jest.fn();
  });

  it("should render the refund page with heading", () => {
    render(<RefundPage />);
    expect(screen.getByRole("heading", { name: "Refund Requests" })).toBeInTheDocument();
  });

  it("should render tabs for filtering refund status", () => {
    render(<RefundPage />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<RefundPage />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("should render refund data in table", () => {
    render(<RefundPage />);
    const tables = screen.getAllByRole("table");
    expect(tables.length).toBeGreaterThanOrEqual(1);
  });

  it("should display all 4 refund rows", () => {
    render(<RefundPage />);
    expect(screen.getByText("REF-001")).toBeInTheDocument();
    expect(screen.getByText("REF-002")).toBeInTheDocument();
    expect(screen.getByText("REF-003")).toBeInTheDocument();
    expect(screen.getByText("REF-004")).toBeInTheDocument();
  });

  it("should display refund amounts formatted with peso sign", () => {
    render(<RefundPage />);
    expect(screen.getByText("₱150.00")).toBeInTheDocument();
    expect(screen.getByText("₱120.00")).toBeInTheDocument();
    expect(screen.getByText("₱280.00")).toBeInTheDocument();
    expect(screen.getByText("₱200.00")).toBeInTheDocument();
  });

  it("should display customer names", () => {
    render(<RefundPage />);
    expect(screen.getByText("Sarah Williams")).toBeInTheDocument();
    expect(screen.getByText("Mike Johnson")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should display refund reasons", () => {
    render(<RefundPage />);
    expect(screen.getByText("Damaged product")).toBeInTheDocument();
    expect(screen.getByText("Wrong item received")).toBeInTheDocument();
    expect(screen.getByText("Changed mind")).toBeInTheDocument();
    expect(screen.getByText("Item not as described")).toBeInTheDocument();
  });

  it("should display tab counts", () => {
    render(<RefundPage />);
    expect(screen.getByText(/All \(4\)/)).toBeInTheDocument();
    expect(screen.getByText(/Pending \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Processing \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Approved \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Rejected \(1\)/)).toBeInTheDocument();
  });

  it("should filter refunds by search term on refund ID", () => {
    render(<RefundPage />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "REF-001" } });
    expect(screen.getByText("Sarah Williams")).toBeInTheDocument();
    expect(screen.queryByText("Mike Johnson")).not.toBeInTheDocument();
  });

  it("should filter refunds by search term on order ID", () => {
    render(<RefundPage />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "ORD-003" } });
    expect(screen.getByText("Mike Johnson")).toBeInTheDocument();
    expect(screen.queryByText("Sarah Williams")).not.toBeInTheDocument();
  });

  it("should filter refunds by search term on customer name", () => {
    render(<RefundPage />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "jane" } });
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("Sarah Williams")).not.toBeInTheDocument();
  });

  it("should show empty table row when search matches nothing", () => {
    render(<RefundPage />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "zzz-no-match" } });
    expect(screen.getByText("No refund requests found")).toBeInTheDocument();
  });

  it("should render all status tabs", () => {
    render(<RefundPage />);
    const tabs = screen.getAllByRole("tab");
    // Tab order: All, Pending, Processing, Approved, Rejected
    expect(tabs.length).toBe(5);
    expect(tabs[0]).toHaveTextContent(/All/);
    expect(tabs[1]).toHaveTextContent(/Pending/);
    expect(tabs[2]).toHaveTextContent(/Processing/);
    expect(tabs[3]).toHaveTextContent(/Approved/);
    expect(tabs[4]).toHaveTextContent(/Rejected/);
  });

  it("should have tab counts matching refund data", () => {
    render(<RefundPage />);
    const tabs = screen.getAllByRole("tab");
    // All=4, Pending=1, Processing=1, Approved=1, Rejected=1
    expect(tabs[0]).toHaveTextContent("4");
    expect(tabs[1]).toHaveTextContent("1");
    expect(tabs[2]).toHaveTextContent("1");
    expect(tabs[3]).toHaveTextContent("1");
    expect(tabs[4]).toHaveTextContent("1");
  });

  it("should have all tab initially active", () => {
    render(<RefundPage />);
    const tabs = screen.getAllByRole("tab");
    // Initially "all" tab is active
    expect(tabs[0]).toHaveAttribute("data-state", "active");
    expect(tabs[1]).toHaveAttribute("data-state", "inactive");
  });

  it("should show all customer names on All tab", () => {
    render(<RefundPage />);
    expect(screen.getByText("Sarah Williams")).toBeInTheDocument();
    expect(screen.getByText("Mike Johnson")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should open view dialog when clicking eye button", () => {
    render(<RefundPage />);
    // Find all buttons and look for eye buttons (ghost buttons in action column)
    const allButtons = screen.getAllByRole("button");
    // The eye buttons are the small ones in the table
    const eyeButtons = allButtons.filter(
      (btn) => btn.classList.contains("h-8") || btn.querySelector("svg")
    );
    // Click the first valid eye button (for REF-001)
    // Eye buttons are the last button in each row, find by table row
    const rows = screen.getAllByRole("row");
    // rows[0] is header, rows[1..4] are data rows
    const firstRowButtons = rows[1]?.querySelectorAll("button");
    if (firstRowButtons && firstRowButtons.length > 0) {
      fireEvent.click(firstRowButtons[0]); // Eye button
      expect(screen.getByText("Refund Request Details")).toBeInTheDocument();
      expect(screen.getByText("Refund ID:")).toBeInTheDocument();
    }
  });

  it("should show response textarea for pending refund in dialog", () => {
    render(<RefundPage />);
    const rows = screen.getAllByRole("row");
    const pendingRowBtns = rows[1]?.querySelectorAll("button");
    if (pendingRowBtns && pendingRowBtns.length > 0) {
      fireEvent.click(pendingRowBtns[0]);
      expect(screen.getByPlaceholderText(/Provide a response/)).toBeInTheDocument();
    }
  });

  it("should show close button for approved refund in dialog", () => {
    render(<RefundPage />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[3]); // Approved tab
    const rows = screen.getAllByRole("row");
    const approvedRowBtns = rows[1]?.querySelectorAll("button");
    if (approvedRowBtns && approvedRowBtns.length > 0) {
      fireEvent.click(approvedRowBtns[0]);
      // Should show "Close" button in footer (not approve/reject)
      const dialogBtns = screen.getAllByRole("button");
      const closeBtn = dialogBtns.find((b) => b.textContent === "Close");
      expect(closeBtn).toBeDefined();
    }
  });

  it("should open reject confirmation dialog from view dialog", async () => {
    render(<RefundPage />);
    // Open view dialog for pending refund (REF-001)
    const rows = screen.getAllByRole("row");
    const pendingRowBtns = rows[1]?.querySelectorAll("button");
    if (pendingRowBtns && pendingRowBtns.length > 0) {
      fireEvent.click(pendingRowBtns[0]);
      // Click Reject button in dialog
      const rejectBtn = screen.getByText("Reject").closest("button");
      fireEvent.click(rejectBtn!);
      // Reject confirmation dialog should appear
      expect(screen.getByText("Confirm Rejection")).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
    }
  });

  it("should reject refund and show toast", async () => {
    render(<RefundPage />);
    const rows = screen.getAllByRole("row");
    const pendingRowBtns = rows[1]?.querySelectorAll("button");
    if (pendingRowBtns && pendingRowBtns.length > 0) {
      fireEvent.click(pendingRowBtns[0]);
      const rejectBtn = screen.getByText("Reject").closest("button");
      fireEvent.click(rejectBtn!);
      // Confirm rejection
      const confirmBtn = screen.getByText("Reject Refund");
      fireEvent.click(confirmBtn);
      expect(toast.success).toHaveBeenCalledWith("Refund request rejected");
    }
  });

  it("should toggle checkbox selection", () => {
    render(<RefundPage />);
    const checkboxes = screen.getAllByRole("checkbox");
    // First is "select all", rest are per-row
    expect(checkboxes.length).toBe(5); // 1 header + 4 rows
    fireEvent.click(checkboxes[1]); // Select first row
    expect(checkboxes[1]).toBeChecked();
    fireEvent.click(checkboxes[1]); // Deselect
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("should show bulk action bar when items are selected", () => {
    render(<RefundPage />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // Select REF-001
    expect(screen.getByText("Selected:")).toBeInTheDocument();
  });

  it("should select all visible refunds with header checkbox", () => {
    render(<RefundPage />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]); // Select all
    // All row checkboxes should be checked
    for (let i = 1; i < checkboxes.length; i++) {
      expect(checkboxes[i]).toBeChecked();
    }
  });

  it("should deselect all visible when all are selected", () => {
    render(<RefundPage />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Select all first
    fireEvent.click(checkboxes[0]);
    // Then deselect all
    fireEvent.click(checkboxes[0]);
    for (let i = 1; i < checkboxes.length; i++) {
      expect(checkboxes[i]).not.toBeChecked();
    }
  });

  it("should show mixed status warning when selecting refunds with different statuses", () => {
    render(<RefundPage />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Select REF-001 (Pending) and REF-002 (Processing)
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    expect(screen.getByText(/different statuses/)).toBeInTheDocument();
  });

  it("should show export-only menu on approved tab with selection", () => {
    render(<RefundPage />);
    // Switch to approved tab
    const tabs = screen.getAllByRole("tab");
    fireEvent.click(tabs[3]); // Approved
    const checkboxes = screen.getAllByRole("checkbox");
    if (checkboxes.length > 1) {
      fireEvent.click(checkboxes[1]);
      // Should show bulk action bar
      const bulkBtn = screen.getByLabelText("Bulk actions");
      expect(bulkBtn).toBeInTheDocument();
    }
  });

  it("should handle cancel on reject dialog and restore view dialog", () => {
    render(<RefundPage />);
    const rows = screen.getAllByRole("row");
    const pendingRowBtns = rows[1]?.querySelectorAll("button");
    if (pendingRowBtns && pendingRowBtns.length > 0) {
      fireEvent.click(pendingRowBtns[0]); // Open view dialog
      expect(screen.getByText("Refund Request Details")).toBeInTheDocument();
      const rejectBtn = screen.getByText("Reject").closest("button");
      fireEvent.click(rejectBtn!); // Opens reject confirmation
      // Click Cancel
      const cancelBtn = screen.getByText("Cancel");
      fireEvent.click(cancelBtn);
      // View dialog should be restored
      expect(screen.getByText("Refund Request Details")).toBeInTheDocument();
    }
  });

  it("should show dialog details for selected refund", () => {
    render(<RefundPage />);
    const rows = screen.getAllByRole("row");
    const pendingRowBtns = rows[1]?.querySelectorAll("button");
    if (pendingRowBtns && pendingRowBtns.length > 0) {
      fireEvent.click(pendingRowBtns[0]);
      // Verify dialog content
      expect(screen.getByText("Request Information")).toBeInTheDocument();
      expect(screen.getByText("Customer's Reason")).toBeInTheDocument();
      expect(screen.getByText("Your Response")).toBeInTheDocument();
    }
  });

  it("should update textarea value in dialog", () => {
    render(<RefundPage />);
    const rows = screen.getAllByRole("row");
    const pendingRowBtns = rows[1]?.querySelectorAll("button");
    if (pendingRowBtns && pendingRowBtns.length > 0) {
      fireEvent.click(pendingRowBtns[0]);
      const textarea = screen.getByPlaceholderText(/Provide a response/);
      fireEvent.change(textarea, { target: { value: "We will process your refund" } });
      expect(textarea).toHaveValue("We will process your refund");
    }
  });
});
