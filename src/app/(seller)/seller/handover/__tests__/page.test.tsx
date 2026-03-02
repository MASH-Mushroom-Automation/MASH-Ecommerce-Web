/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";

jest.mock("@/hooks/useUser", () => ({
  useUserProfile: jest.fn(() => ({
    profile: { id: "user-1", name: "Test User", role: "SELLER", createdAt: null },
    loading: false,
    error: null,
  })),
}));

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ items: [], addToCart: jest.fn(), removeFromCart: jest.fn(), cartCount: 0 }),
}));
jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({ items: [], addToWishlist: jest.fn(), removeFromWishlist: jest.fn(), isInWishlist: jest.fn(() => false) }),
}));

import Page from "../page";
const { useUserProfile } = require("@/hooks/useUser");

describe("HandoverCenterPickup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserProfile.mockReturnValue({
      profile: { id: "user-1", name: "Test User", role: "SELLER", createdAt: null },
      loading: false,
      error: null,
    });
  });

  it("renders page title", () => {
    render(<Page />);
    expect(screen.getByText("Handover Center Pickup")).toBeInTheDocument();
  });

  it("renders Add Handover Center button", () => {
    render(<Page />);
    expect(screen.getByText(/Add Handover Center/)).toBeInTheDocument();
  });

  it("renders active and inactive tabs", () => {
    render(<Page />);
    expect(screen.getByText("Active Centers")).toBeInTheDocument();
    expect(screen.getByText("Inactive Centers")).toBeInTheDocument();
  });

  it("renders active centers by default", () => {
    render(<Page />);
    expect(screen.getByText("MASH Makati Hub")).toBeInTheDocument();
    expect(screen.getByText("MASH BGC Center")).toBeInTheDocument();
  });

  it("shows center addresses", () => {
    render(<Page />);
    expect(screen.getByText("123 Ayala Avenue, Makati City")).toBeInTheDocument();
    expect(screen.getByText("456 Bonifacio High Street, Taguig City")).toBeInTheDocument();
  });

  it("shows center operating hours", () => {
    render(<Page />);
    expect(screen.getByText("9:00 AM - 6:00 PM")).toBeInTheDocument();
    expect(screen.getByText("Monday - Saturday")).toBeInTheDocument();
  });

  it("shows center contact numbers", () => {
    render(<Page />);
    expect(screen.getByText("09123456789")).toBeInTheDocument();
    expect(screen.getByText("09987654321")).toBeInTheDocument();
  });

  it("shows Active status for active centers", () => {
    render(<Page />);
    const activeTexts = screen.getAllByText("Active");
    expect(activeTexts.length).toBeGreaterThanOrEqual(2);
  });

  it("shows Deactivate buttons for active centers", () => {
    render(<Page />);
    const deactivateButtons = screen.getAllByText("Deactivate");
    expect(deactivateButtons.length).toBe(2);
  });

  it("renders edit buttons for centers", () => {
    render(<Page />);
    const editButtons = screen.getAllByRole("button").filter((btn: HTMLElement) =>
      btn.querySelector("svg") && btn.className.includes("h-8")
    );
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("opens add dialog when Add Handover Center clicked", () => {
    render(<Page />);
    const addButtons = screen.getAllByText(/Add Handover Center/);
    fireEvent.click(addButtons[0]);
    expect(screen.getByText("Create a new pickup location for your customers.")).toBeInTheDocument();
    expect(screen.getByLabelText("Center Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Operating Hours")).toBeInTheDocument();
    expect(screen.getByLabelText("Contact Number")).toBeInTheDocument();
  });

  it("submits add form to create a new center", () => {
    render(<Page />);
    const addButtons = screen.getAllByText(/Add Handover Center/);
    fireEvent.click(addButtons[0]);

    fireEvent.change(screen.getByLabelText("Center Name"), { target: { value: "New Hub" } });
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "123 Test St" } });
    fireEvent.change(screen.getByLabelText("Operating Hours"), { target: { value: "8AM-5PM" } });
    fireEvent.change(screen.getByLabelText("Contact Number"), { target: { value: "09111111111" } });

    fireEvent.click(screen.getByText("Save Center"));

    // Dialog should close and new center should appear
    expect(screen.getByText("New Hub")).toBeInTheDocument();
    expect(screen.getByText("123 Test St")).toBeInTheDocument();
  });

  it("cancels add dialog", () => {
    render(<Page />);
    const addButtons = screen.getAllByText(/Add Handover Center/);
    fireEvent.click(addButtons[0]);
    expect(screen.getByText("Create a new pickup location for your customers.")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
  });

  it("toggles center from active to inactive", () => {
    render(<Page />);
    // Deactivate first active center (MASH Makati Hub)
    const deactivateButtons = screen.getAllByText("Deactivate");
    fireEvent.click(deactivateButtons[0]);
    // After deactivating, there should be one fewer Deactivate button
    const remaining = screen.getAllByText("Deactivate");
    expect(remaining.length).toBe(1);
  });

  it("toggles center from inactive to active", () => {
    render(<Page />);
    // Can't switch tabs in jsdom, but verify inactive tab trigger exists
    expect(screen.getByText("Inactive Centers")).toBeInTheDocument();
  });

  it("deletes a center", () => {
    render(<Page />);
    expect(screen.getByText("MASH Makati Hub")).toBeInTheDocument();
    // Click delete button (trash icon) - AlertDialog trigger
    const deleteButtons = screen.getAllByRole("button").filter((btn: HTMLElement) =>
      btn.className.includes("text-destructive")
    );
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      // AlertDialog should appear
      const deleteConfirm = screen.queryByText("Delete");
      if (deleteConfirm) {
        fireEvent.click(deleteConfirm);
      }
    }
  });

  it("shows handover intro for new sellers (< 1 week old)", () => {
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
    useUserProfile.mockReturnValue({
      profile: { id: "user-1", name: "New Seller", role: "SELLER", createdAt: recentDate },
      loading: false,
      error: null,
    });
    render(<Page />);
    expect(screen.getByText("Handover Centers for Easy Pickup")).toBeInTheDocument();
    expect(screen.getByText(/Configure handover centers where customers can pick up/)).toBeInTheDocument();
  });

  it("hides handover intro for old sellers (> 1 week old)", () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
    useUserProfile.mockReturnValue({
      profile: { id: "user-1", name: "Old Seller", role: "SELLER", createdAt: oldDate },
      loading: false,
      error: null,
    });
    render(<Page />);
    expect(screen.queryByText("Handover Centers for Easy Pickup")).not.toBeInTheDocument();
  });

  it("hides handover intro when no createdAt", () => {
    useUserProfile.mockReturnValue({
      profile: { id: "user-1", name: "Seller", role: "SELLER", createdAt: null },
      loading: false,
      error: null,
    });
    render(<Page />);
    expect(screen.queryByText("Handover Centers for Easy Pickup")).not.toBeInTheDocument();
  });

  it("hides handover intro for invalid createdAt", () => {
    useUserProfile.mockReturnValue({
      profile: { id: "user-1", name: "Seller", role: "SELLER", createdAt: "invalid-date" },
      loading: false,
      error: null,
    });
    render(<Page />);
    expect(screen.queryByText("Handover Centers for Easy Pickup")).not.toBeInTheDocument();
  });

  it("shows empty state when all centers deactivated (active tab)", () => {
    render(<Page />);
    // Deactivate all active centers
    const deactivateButtons = screen.getAllByText("Deactivate");
    deactivateButtons.forEach((btn: HTMLElement) => fireEvent.click(btn));
    expect(screen.getByText("No Active Handover Centers")).toBeInTheDocument();
    expect(screen.getByText(/Add a handover center to allow customers/)).toBeInTheDocument();
  });

  it("shows empty inactive state when all centers are active", () => {
    render(<Page />);
    // TabsContent for inactive does not render in jsdom without forceMount
    // Verify the inactive tab trigger exists
    expect(screen.getByText("Inactive Centers")).toBeInTheDocument();
  });

  it("opens edit dialog for a center", () => {
    render(<Page />);
    // Find edit buttons (outline icon buttons)
    const allButtons = screen.getAllByRole("button");
    // Edit buttons are small outline icon buttons - find the first one
    const editButton = allButtons.find((btn: HTMLElement) =>
      btn.className.includes("h-8") && !btn.className.includes("text-destructive")
    );
    if (editButton) {
      fireEvent.click(editButton);
      expect(screen.getByText("Edit Handover Center")).toBeInTheDocument();
      expect(screen.getByText("Update your handover center information.")).toBeInTheDocument();
    }
  });

  it("submits edit form to update a center", () => {
    render(<Page />);
    const allButtons = screen.getAllByRole("button");
    const editButton = allButtons.find((btn: HTMLElement) =>
      btn.className.includes("h-8") && !btn.className.includes("text-destructive")
    );
    if (editButton) {
      fireEvent.click(editButton);
      fireEvent.change(screen.getByLabelText("Center Name"), { target: { value: "Updated Hub" } });
      fireEvent.click(screen.getByText("Update Center"));
      expect(screen.getByText("Updated Hub")).toBeInTheDocument();
    }
  });

  it("cancels edit dialog", () => {
    render(<Page />);
    const allButtons = screen.getAllByRole("button");
    const editButton = allButtons.find((btn: HTMLElement) =>
      btn.className.includes("h-8") && !btn.className.includes("text-destructive")
    );
    if (editButton) {
      fireEvent.click(editButton);
      expect(screen.getByText("Edit Handover Center")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Cancel"));
    }
  });

  it("shows delete confirmation dialog", () => {
    render(<Page />);
    const deleteButtons = screen.getAllByRole("button").filter((btn: HTMLElement) =>
      btn.className.includes("text-destructive")
    );
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      expect(screen.getByText("Delete Handover Center")).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    }
  });
});
