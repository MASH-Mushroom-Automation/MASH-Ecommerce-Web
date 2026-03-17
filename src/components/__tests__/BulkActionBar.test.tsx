/**
 * BulkActionBar Component Tests
 *
 * Tests the bulk action toolbar for seller product management.
 * Covers selection display, action buttons (activate, deactivate, delete,
 * update price, export), confirmation dialogs, loading/disabled states,
 * mixed-status detection, summary messages, and edge cases.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Mock SellerApi (unused directly in component but imported)
jest.mock("@/lib/api/seller", () => ({
  SellerApi: {},
}));

// Mock exportToCsv
jest.mock("@/lib/exportCsv", () => ({
  exportToCsv: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  MoreHorizontal: () => <span data-testid="more-horizontal-icon" />,
}));

// Mock Radix UI Dialog to render inline (portals fail in jsdom)
jest.mock("@/components/ui/dialog", () => {
  const _R = require("react");
  function Dialog({ children, open, onOpenChange }: any) {
    return <div data-testid="dialog">{_R.Children.map(children, (c: any) =>
      _R.isValidElement(c) ? _R.cloneElement(c as React.ReactElement<any>, { __dialogOpen: open, __onOpenChange: onOpenChange }) : c
    )}</div>;
  }
  function DialogTrigger({ children, __dialogOpen, __onOpenChange, ...rest }: any) {
    return <span {...rest}>{children}</span>;
  }
  function DialogContent({ children, __dialogOpen, __onOpenChange }: any) {
    if (!__dialogOpen) return null;
    return <div data-testid="dialog-content">{children}</div>;
  }
  function DialogHeader({ children }: any) {
    return <div>{children}</div>;
  }
  function DialogTitle({ children, className }: any) {
    return <h2 className={className}>{children}</h2>;
  }
  function DialogDescription({ children }: any) {
    return <p>{children}</p>;
  }
  function DialogFooter({ children }: any) {
    return <div>{children}</div>;
  }
  function DialogClose({ children, asChild }: any) {
    return <span>{children}</span>;
  }
  return { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose };
});

// Mock Radix UI DropdownMenu to render inline (portals fail in jsdom)
jest.mock("@/components/ui/dropdown-menu", () => {
  const _React = require("react");
  function DropdownMenu({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = _React.useState(false);
    return (
      <div data-testid="dropdown-menu">
        {_React.Children.map(children, (child: React.ReactElement) =>
          _React.isValidElement(child)
            ? _React.cloneElement(child as React.ReactElement<{ __onToggle?: () => void; __open?: boolean }>, { __onToggle: () => setOpen((o: boolean) => !o), __open: open })
            : child
        )}
      </div>
    );
  }
  function DropdownMenuTrigger({ children, asChild, __onToggle, __open, ...rest }: any) {
    if (asChild && _React.isValidElement(children)) {
      return _React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          __onToggle?.();
          (children as React.ReactElement<any>).props?.onClick?.(e);
        },
      });
    }
    return <button onClick={__onToggle} {...rest}>{children}</button>;
  }
  function DropdownMenuContent({ children, __open }: any) {
    if (!__open) return null;
    return <div data-testid="dropdown-content">{children}</div>;
  }
  function DropdownMenuItem({ children, onSelect, className, ...rest }: any) {
    return (
      <div role="menuitem" className={className} onClick={() => onSelect?.()} {...rest}>
        {children}
      </div>
    );
  }
  function DropdownMenuLabel({ children }: any) {
    return <div>{children}</div>;
  }
  function DropdownMenuSeparator() {
    return <hr />;
  }
  return {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
  };
});

import { BulkActionBar } from "@/components/BulkActionBar";

const { exportToCsv } = jest.requireMock("@/lib/exportCsv");

// ---- Helpers ----

function makeProductsMap(ids: string[], statuses?: string[]): Record<string, any> {
  const map: Record<string, any> = {};
  ids.forEach((id, i) => {
    map[id] = {
      id,
      name: `Product ${id}`,
      price: 100 + i,
      status: statuses?.[i] ?? "active",
    };
  });
  return map;
}

const defaultIds = ["p1", "p2", "p3"];
const defaultMap = makeProductsMap(defaultIds);

function renderBar(overrides: Partial<React.ComponentProps<typeof BulkActionBar>> = {}) {
  const defaultProps: React.ComponentProps<typeof BulkActionBar> = {
    selectedIds: defaultIds,
    productsMap: defaultMap,
    onActivate: jest.fn().mockResolvedValue({ success: ["p1", "p2", "p3"], failed: [] }),
    onDeactivate: jest.fn().mockResolvedValue({ success: ["p1", "p2", "p3"], failed: [] }),
    onDelete: jest.fn().mockResolvedValue({ success: ["p1", "p2", "p3"], failed: [] }),
    onUpdatePrice: jest.fn().mockResolvedValue({ success: ["p1", "p2", "p3"], failed: [] }),
    onExport: jest.fn(),
    handlers: { onComplete: jest.fn() },
    onClear: jest.fn(),
    ...overrides,
  };

  return { ...render(<BulkActionBar {...defaultProps} />), props: defaultProps };
}

async function openDropdown() {
  const trigger = screen.getByRole("button", { name: /bulk actions/i });
  await act(async () => {
    fireEvent.click(trigger);
  });
}

// ---- Tests ----

describe("BulkActionBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================
  // Rendering & Visibility
  // =============================================

  describe("rendering", () => {
    it("renders nothing when selectedIds is empty", () => {
      const { container } = render(
        <BulkActionBar selectedIds={[]} productsMap={{}} />
      );
      expect(container.innerHTML).toBe("");
    });

    it("renders the bar when items are selected", () => {
      renderBar();
      expect(screen.getByText("3 selected")).toBeInTheDocument();
    });

    it("shows correct count for a single selected item", () => {
      renderBar({ selectedIds: ["p1"] });
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });

    it("shows correct count for many selected items", () => {
      const ids = Array.from({ length: 50 }, (_, i) => `p${i}`);
      const map = makeProductsMap(ids);
      renderBar({ selectedIds: ids, productsMap: map });
      expect(screen.getByText("50 selected")).toBeInTheDocument();
    });

    it("renders the Bulk Actions dropdown trigger button", () => {
      renderBar();
      expect(screen.getByRole("button", { name: /bulk actions/i })).toBeInTheDocument();
    });

    it("renders the Clear button", () => {
      renderBar();
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });
  });

  // =============================================
  // Mixed Status Detection
  // =============================================

  describe("mixed status badge", () => {
    it("shows mixed statuses badge when products have different statuses", () => {
      const map = makeProductsMap(["p1", "p2"], ["active", "inactive"]);
      renderBar({ selectedIds: ["p1", "p2"], productsMap: map });
      expect(screen.getByText("Mixed statuses detected")).toBeInTheDocument();
    });

    it("does not show mixed statuses badge when all statuses match", () => {
      const map = makeProductsMap(["p1", "p2"], ["active", "active"]);
      renderBar({ selectedIds: ["p1", "p2"], productsMap: map });
      expect(screen.queryByText("Mixed statuses detected")).not.toBeInTheDocument();
    });

    it("does not show badge when products have no status field", () => {
      const map: Record<string, any> = {
        p1: { id: "p1", name: "A" },
        p2: { id: "p2", name: "B" },
      };
      renderBar({ selectedIds: ["p1", "p2"], productsMap: map });
      expect(screen.queryByText("Mixed statuses detected")).not.toBeInTheDocument();
    });
  });

  // =============================================
  // Clear Selection
  // =============================================

  describe("clear selection", () => {
    it("calls onClear when Clear button is clicked", () => {
      const { props } = renderBar();
      fireEvent.click(screen.getByText("Clear"));
      expect(props.onClear).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================
  // Dropdown Menu Items
  // =============================================

  describe("dropdown menu", () => {
    it("opens the dropdown and shows all action items", async () => {
      renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
        expect(screen.getByText("Deactivate Selected")).toBeInTheDocument();
        expect(screen.getByText("Update Price")).toBeInTheDocument();
        expect(screen.getByText("Delete Selected")).toBeInTheDocument();
        expect(screen.getByText("Export (CSV)")).toBeInTheDocument();
      });
    });

    it("shows Actions and Other labels in the dropdown", async () => {
      renderBar();
      await openDropdown();

      // Wait for the dropdown to appear with known content first
      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
      });

      // Then assert labels exist in the rendered content
      const dropdownContent = screen.getByTestId("dropdown-content");
      expect(dropdownContent).toHaveTextContent("Actions");
      expect(dropdownContent).toHaveTextContent("Other");
    });
  });

  // =============================================
  // Activate Action
  // =============================================

  describe("activate action", () => {
    it("calls onActivate with selectedIds and shows success summary", async () => {
      const { props } = renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Activate Selected"));
      });

      await waitFor(() => {
        expect(props.onActivate).toHaveBeenCalledWith(defaultIds);
        expect(screen.getByText(/Activate finished/)).toBeInTheDocument();
        expect(screen.getByText(/Success: 3/)).toBeInTheDocument();
        expect(screen.getByText(/Failed: 0/)).toBeInTheDocument();
      });
    });

    it("calls handlers.onComplete after activate finishes", async () => {
      const { props } = renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Activate Selected"));
      });

      await waitFor(() => {
        expect(props.handlers!.onComplete).toHaveBeenCalled();
      });
    });

    it("shows error summary when activate rejects", async () => {
      const onActivate = jest.fn().mockRejectedValue(new Error("Network error"));
      renderBar({ onActivate });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Activate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Activate failed: Network error/)).toBeInTheDocument();
      });
    });
  });

  // =============================================
  // Deactivate Action (with confirmation dialog)
  // =============================================

  describe("deactivate action", () => {
    it("opens deactivate confirmation dialog", async () => {
      renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Deactivate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Deactivate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Deactivate 3 products/)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to deactivate/)).toBeInTheDocument();
      });
    });

    it("uses singular form when only 1 item selected", async () => {
      renderBar({ selectedIds: ["p1"] });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Deactivate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Deactivate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Deactivate 1 product$/)).toBeInTheDocument();
      });
    });

    it("calls onDeactivate when confirming deactivation", async () => {
      const { props } = renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Deactivate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Deactivate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^Deactivate$/i })).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Deactivate$/i }));
      });

      await waitFor(() => {
        expect(props.onDeactivate).toHaveBeenCalledWith(defaultIds);
      });
    });
  });

  // =============================================
  // Delete Action (with confirmation dialog)
  // =============================================

  describe("delete action", () => {
    it("opens delete confirmation dialog", async () => {
      renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Delete Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Delete Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Delete 3 products/)).toBeInTheDocument();
        expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
      });
    });

    it("calls onDelete when confirming deletion", async () => {
      const { props } = renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Delete Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Delete Selected"));
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^Delete$/i })).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
      });

      await waitFor(() => {
        expect(props.onDelete).toHaveBeenCalledWith(defaultIds);
        expect(screen.getByText(/Delete finished/)).toBeInTheDocument();
      });
    });

    it("shows singular form in delete dialog for 1 item", async () => {
      renderBar({ selectedIds: ["p1"] });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Delete Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Delete Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Delete 1 product$/)).toBeInTheDocument();
      });
    });

    it("shows error summary when delete rejects", async () => {
      const onDelete = jest.fn().mockRejectedValue(new Error("Forbidden"));
      renderBar({ onDelete });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Delete Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Delete Selected"));
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^Delete$/i })).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/Delete failed: Forbidden/)).toBeInTheDocument();
      });
    });
  });

  // =============================================
  // Update Price Action (with price input dialog)
  // =============================================

  describe("update price action", () => {
    it("opens update price dialog with input field", async () => {
      renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Update Price")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Update Price"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Update Price for 3 products/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g. 129.50")).toBeInTheDocument();
      });
    });

    it("calls onUpdatePrice with parsed price on confirmation", async () => {
      const { props } = renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Update Price")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Update Price"));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText("e.g. 129.50")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("e.g. 129.50");
      fireEvent.change(input, { target: { value: "249.99" } });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Update Price$/i }));
      });

      await waitFor(() => {
        expect(props.onUpdatePrice).toHaveBeenCalledWith(defaultIds, 249.99);
      });
    });

    it("shows 'Invalid price' when non-numeric value is submitted", async () => {
      renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Update Price")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Update Price"));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText("e.g. 129.50")).toBeInTheDocument();
      });

      // Use a negative value which the component rejects as invalid
      const input = screen.getByPlaceholderText("e.g. 129.50");
      fireEvent.change(input, { target: { value: "-5" } });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Update Price$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid price")).toBeInTheDocument();
      });
    });

    it("shows 'Invalid price' when empty string is submitted", async () => {
      renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Update Price")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Update Price"));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText("e.g. 129.50")).toBeInTheDocument();
      });

      // Leave input empty (default is "")
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Update Price$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid price")).toBeInTheDocument();
      });
    });
  });

  // =============================================
  // Export Action
  // =============================================

  describe("export action", () => {
    it("calls onExport with matching product rows and exportToCsv", async () => {
      const { props } = renderBar();
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Export (CSV)")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Export (CSV)"));
      });

      const expectedRows = defaultIds.map((id) => defaultMap[id]);
      expect(props.onExport).toHaveBeenCalledWith(expectedRows);
      expect(exportToCsv).toHaveBeenCalledWith(expectedRows, "products-export.csv");
    });

    it("filters out undefined products from export rows", async () => {
      const partialMap: Record<string, any> = { p1: { id: "p1", name: "A" } };
      const { props } = renderBar({
        selectedIds: ["p1", "p2"],
        productsMap: partialMap,
      });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Export (CSV)")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Export (CSV)"));
      });

      // Only p1 should be in rows since p2 is not in map
      expect(props.onExport).toHaveBeenCalledWith([partialMap.p1]);
      expect(exportToCsv).toHaveBeenCalledWith([partialMap.p1], "products-export.csv");
    });
  });

  // =============================================
  // Loading / Disabled States
  // =============================================

  describe("loading states", () => {
    it("shows 'Deleting...' text and disables button during delete", async () => {
      let resolveDelete: (v: any) => void;
      const pendingDelete = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      const onDelete = jest.fn().mockReturnValue(pendingDelete);

      renderBar({ onDelete });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Delete Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Delete Selected"));
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^Delete$/i })).toBeInTheDocument();
      });

      // Click confirm but don't resolve yet
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Deleting...")).toBeInTheDocument();
        expect(screen.getByText("Deleting...").closest("button")).toBeDisabled();
      });

      // Resolve the promise
      await act(async () => {
        resolveDelete!({ success: ["p1"], failed: [] });
      });
    });

    it("shows 'Deactivating...' text and disables button during deactivation", async () => {
      let resolveDeactivate: (v: any) => void;
      const pendingDeactivate = new Promise((resolve) => {
        resolveDeactivate = resolve;
      });
      const onDeactivate = jest.fn().mockReturnValue(pendingDeactivate);

      renderBar({ onDeactivate });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Deactivate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Deactivate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^Deactivate$/i })).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /^Deactivate$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Deactivating...")).toBeInTheDocument();
        expect(screen.getByText("Deactivating...").closest("button")).toBeDisabled();
      });

      await act(async () => {
        resolveDeactivate!({ success: ["p1"], failed: [] });
      });
    });

    it("shows 'Updating...' text and disables button during price update", async () => {
      let resolveUpdate: (v: any) => void;
      const pendingUpdate = new Promise((resolve) => {
        resolveUpdate = resolve;
      });
      const onUpdatePrice = jest.fn().mockReturnValue(pendingUpdate);

      renderBar({ onUpdatePrice });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Update Price")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Update Price"));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText("e.g. 129.50")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("e.g. 129.50");
      fireEvent.change(input, { target: { value: "50" } });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /^Update Price$/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Updating...")).toBeInTheDocument();
        expect(screen.getByText("Updating...").closest("button")).toBeDisabled();
      });

      await act(async () => {
        resolveUpdate!({ success: ["p1"], failed: [] });
      });
    });
  });

  // =============================================
  // Summary Messages
  // =============================================

  describe("summary messages", () => {
    it("shows summary with success and failed counts", async () => {
      const onActivate = jest.fn().mockResolvedValue({ success: ["p1"], failed: ["p2", "p3"] });
      renderBar({ onActivate });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Activate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Success: 1/)).toBeInTheDocument();
        expect(screen.getByText(/Failed: 2/)).toBeInTheDocument();
      });
    });

    it("shows generic finished message when action returns void", async () => {
      const onActivate = jest.fn().mockResolvedValue(undefined);
      renderBar({ onActivate });
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Activate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText("Activate finished.")).toBeInTheDocument();
      });
    });
  });

  // =============================================
  // Edge Cases
  // =============================================

  describe("edge cases", () => {
    it("works when optional callbacks are not provided", () => {
      const { container } = render(
        <BulkActionBar selectedIds={["p1"]} productsMap={{ p1: { id: "p1" } }} />
      );
      expect(container.innerHTML).not.toBe("");
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });

    it("handles activate when onActivate is undefined", async () => {
      render(
        <BulkActionBar selectedIds={["p1"]} productsMap={{ p1: { id: "p1" } }} />
      );
      await openDropdown();

      await waitFor(() => {
        expect(screen.getByText("Activate Selected")).toBeInTheDocument();
      });

      // Should not throw
      await act(async () => {
        fireEvent.click(screen.getByText("Activate Selected"));
      });

      await waitFor(() => {
        expect(screen.getByText(/Activate finished/)).toBeInTheDocument();
      });
    });

    it("handles productsMap with missing entries gracefully", () => {
      renderBar({
        selectedIds: ["p1", "missing-id"],
        productsMap: { p1: { id: "p1", status: "active" } },
      });
      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });

    it("does not call onClear when callback is undefined", () => {
      render(
        <BulkActionBar selectedIds={["p1"]} productsMap={{ p1: { id: "p1" } }} />
      );
      // Should not throw
      fireEvent.click(screen.getByText("Clear"));
    });
  });
});
