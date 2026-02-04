/**
 * OrderRejectionModal Component Tests
 * Tests for order cancellation modal with reason selection
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderRejectionModal } from "../OrderRejectionModal";

describe("OrderRejectionModal", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    orderNumber: "ORD-2026-001",
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders when open is true", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByText(/cancel order/i)).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      render(<OrderRejectionModal {...defaultProps} open={false} />);
      
      expect(screen.queryByText(/cancel order/i)).not.toBeInTheDocument();
    });

    it("displays order number in title", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByText(/ORD-2026-001/)).toBeInTheDocument();
    });

    it("shows description text about selecting a reason", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      // Description says "Please select a reason for cancelling..."
      expect(screen.getByText(/please select a reason for cancelling/i)).toBeInTheDocument();
    });
  });

  describe("Reason Selection", () => {
    it("shows reason label", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByText(/cancellation reason/i)).toBeInTheDocument();
    });

    it("has combobox for reason selection", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
    });

    it("shows placeholder text in combobox when no reason selected", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      // Use role to get specific element (within the combobox area)
      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveTextContent(/select a reason/i);
    });
  });

  describe("Confirm Button", () => {
    it("has confirm cancellation button", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      // Button text contains "Confirm Cancellation" when not loading
      const buttons = screen.getAllByRole("button");
      const confirmBtn = buttons.find(btn => 
        btn.textContent?.includes("Confirm") || btn.textContent?.includes("Cancelling")
      );
      expect(confirmBtn).toBeInTheDocument();
    });

    it("button is disabled when no reason selected", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      const buttons = screen.getAllByRole("button");
      const confirmBtn = buttons.find(btn => 
        btn.textContent?.includes("Confirm") || btn.textContent?.includes("Cancelling")
      );
      expect(confirmBtn).toBeDisabled();
    });
  });

  describe("Close Functionality", () => {
    it("has go back button", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
    });

    it("calls onClose when go back is clicked", async () => {
      const user = userEvent.setup();
      render(<OrderRejectionModal {...defaultProps} />);
      
      const goBackBtn = screen.getByRole("button", { name: /go back/i });
      await user.click(goBackBtn);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("has close button in dialog", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      // Dialog has close button with sr-only "Close" text
      expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows loading text in confirm button when loading", () => {
      render(<OrderRejectionModal {...defaultProps} loading={true} />);
      
      // The confirm button shows "Cancelling..." when loading
      const confirmButton = screen.getByRole("button", { name: /cancelling/i });
      expect(confirmButton).toBeInTheDocument();
    });

    it("disables combobox when loading", () => {
      render(<OrderRejectionModal {...defaultProps} loading={true} />);
      
      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeDisabled();
    });

    it("disables go back button when loading", () => {
      render(<OrderRejectionModal {...defaultProps} loading={true} />);
      
      const goBackBtn = screen.getByRole("button", { name: /go back/i });
      expect(goBackBtn).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("has proper dialog role", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has accessible heading", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("labels required field with asterisk", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByText(/\*/)).toBeInTheDocument();
    });
  });

  describe("Warning Message", () => {
    it("displays undoable action warning", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it("shows customer notification info", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      expect(screen.getByText(/customer will be notified/i)).toBeInTheDocument();
    });
  });

  describe("Title Styling", () => {
    it("title has red color for danger indication", () => {
      render(<OrderRejectionModal {...defaultProps} />);
      
      // Find the heading with the order number
      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveClass("text-red-600");
    });
  });
});
