/**
 * Tests for AddressManagement page - seller address management
 * Batch 12: Expanded coverage for branches + functions
 */
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

// Mock GoogleMapsPicker
jest.mock("@/components/ui/google-maps-picker", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="google-maps-picker">Maps Picker</div>,
  GoogleMapsPicker: (props: any) => <div data-testid="google-maps-picker">Maps Picker</div>,
}));

// Mock locations
jest.mock("@/lib/locations", () => ({
  getRegions: jest.fn(() => [
    { code: "NCR", name: "National Capital Region" },
    { code: "REGION_III", name: "Central Luzon" },
  ]),
  getCitiesByRegion: jest.fn(() => [
    { code: "QUEZON_CITY", name: "Quezon City", provinceCode: "NCR", provinceName: "Metro Manila", postalCode: "1100" },
    { code: "MANILA", name: "Manila", provinceCode: "NCR", provinceName: "Metro Manila", postalCode: "1000" },
  ]),
  getBarangaysByCity: jest.fn(() => [
    { code: "BRG1", name: "Barangay 1" },
    { code: "BRG2", name: "Barangay 2" },
  ]),
}));

import AddressManagement from "../page";

describe("AddressManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Basic rendering ---

  it("should render the heading", () => {
    render(<AddressManagement />);
    expect(screen.getByRole("heading", { name: "Address Management" })).toBeInTheDocument();
  });

  it("should render Add New Address button", () => {
    render(<AddressManagement />);
    expect(screen.getByRole("button", { name: /add new address/i })).toBeInTheDocument();
  });

  it("should display both sample addresses", () => {
    render(<AddressManagement />);
    expect(screen.getByText("Main Store")).toBeInTheDocument();
    expect(screen.getByText("Warehouse")).toBeInTheDocument();
  });

  it("should show default badge on default address", () => {
    render(<AddressManagement />);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("should show contact person names", () => {
    render(<AddressManagement />);
    expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
  });

  it("should show phone numbers", () => {
    render(<AddressManagement />);
    expect(screen.getByText(/09123456789/)).toBeInTheDocument();
    expect(screen.getByText(/09987654321/)).toBeInTheDocument();
  });

  it("should show street address text", () => {
    const { container } = render(<AddressManagement />);
    expect(container.innerHTML).toContain("123 Main Street");
    expect(container.innerHTML).toContain("456 Warehouse Road");
  });

  it("should show Set as Default button for non-default address", () => {
    render(<AddressManagement />);
    const setDefaultBtns = screen.getAllByRole("button", { name: /set as default/i });
    expect(setDefaultBtns.length).toBe(1);
  });

  it("should render edit and delete icon buttons for each address", () => {
    const { container } = render(<AddressManagement />);
    // Each address has an edit (h-8 w-8 non-red) and delete (h-8 w-8 with red) button
    const redButtons = screen.getAllByRole("button").filter(btn => btn.className.includes("red"));
    expect(redButtons.length).toBe(2);
  });

  // --- Add dialog ---

  it("should open add dialog when Add New Address clicked", async () => {
    render(<AddressManagement />);
    fireEvent.click(screen.getByRole("button", { name: /add new address/i }));
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText("Add New Address")).toBeInTheDocument();
    });
  });

  it("should show form fields in add dialog", async () => {
    render(<AddressManagement />);
    fireEvent.click(screen.getByRole("button", { name: /add new address/i }));
    await waitFor(() => {
      expect(screen.getByLabelText("Address Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Contact Person")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone Number")).toBeInTheDocument();
      expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
    });
  });

  it("should show Google Maps picker in add dialog", async () => {
    render(<AddressManagement />);
    fireEvent.click(screen.getByRole("button", { name: /add new address/i }));
    await waitFor(() => {
      expect(screen.getByTestId("google-maps-picker")).toBeInTheDocument();
    });
  });

  it("should show location select fields in add dialog", async () => {
    render(<AddressManagement />);
    fireEvent.click(screen.getByRole("button", { name: /add new address/i }));
    await waitFor(() => {
      expect(screen.getByLabelText("Region")).toBeInTheDocument();
      expect(screen.getByLabelText("City/Municipality")).toBeInTheDocument();
      expect(screen.getByLabelText("Barangay")).toBeInTheDocument();
      expect(screen.getByLabelText("Postal Code")).toBeInTheDocument();
    });
  });

  it("should show read-only province field in add dialog", async () => {
    render(<AddressManagement />);
    fireEvent.click(screen.getByRole("button", { name: /add new address/i }));
    await waitFor(() => {
      const provinceInput = screen.getByLabelText("Province");
      expect(provinceInput).toBeInTheDocument();
      expect(provinceInput).toHaveAttribute("readOnly");
    });
  });

  it("should close add dialog on Cancel", async () => {
    render(<AddressManagement />);
    fireEvent.click(screen.getByRole("button", { name: /add new address/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    const dialog = screen.getByRole("dialog");
    const cancelBtn = within(dialog).getByRole("button", { name: /^cancel$/i });
    fireEvent.click(cancelBtn);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should have Save Address button in add dialog", async () => {
    render(<AddressManagement />);
    fireEvent.click(screen.getByRole("button", { name: /add new address/i }));
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByRole("button", { name: /save address/i })).toBeInTheDocument();
    });
  });

  // --- Delete ---

  it("should show delete confirmation dialog", async () => {
    render(<AddressManagement />);
    const redButtons = screen.getAllByRole("button").filter(btn => btn.className.includes("red"));
    fireEvent.click(redButtons[1]); // Warehouse delete
    await waitFor(() => {
      expect(screen.getByText("Delete Address")).toBeInTheDocument();
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  it("should delete address after confirmation", async () => {
    render(<AddressManagement />);
    expect(screen.getByText("Warehouse")).toBeInTheDocument();
    const redButtons = screen.getAllByRole("button").filter(btn => btn.className.includes("red"));
    fireEvent.click(redButtons[1]); // Warehouse delete
    await waitFor(() => {
      expect(screen.getByText("Delete Address")).toBeInTheDocument();
    });
    // Find the destructive Delete button in the alert dialog (not the icon trigger)
    const deleteConfirm = screen.getAllByRole("button", { name: /^delete$/i })
      .find(btn => btn.className.includes("red-600") || btn.className.includes("destructive"));
    if (deleteConfirm) fireEvent.click(deleteConfirm);
    await waitFor(() => {
      expect(screen.queryByText("Warehouse")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Main Store")).toBeInTheDocument();
  });

  it("should cancel delete via Cancel button", async () => {
    render(<AddressManagement />);
    const redButtons = screen.getAllByRole("button").filter(btn => btn.className.includes("red"));
    fireEvent.click(redButtons[0]);
    await waitFor(() => {
      expect(screen.getByText("Delete Address")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    await waitFor(() => {
      expect(screen.getByText("Main Store")).toBeInTheDocument();
      expect(screen.getByText("Warehouse")).toBeInTheDocument();
    });
  });

  // --- Set as Default ---

  it("should change default address on Set as Default click", () => {
    render(<AddressManagement />);
    // Initially Main Store is default
    expect(screen.getByText("Default")).toBeInTheDocument();
    const setDefaultBtn = screen.getByRole("button", { name: /set as default/i });
    fireEvent.click(setDefaultBtn);
    // Default badge should still exist (now on Warehouse)
    expect(screen.getByText("Default")).toBeInTheDocument();
    // Now Main Store should have "Set as Default" button
    const newSetDefaultBtns = screen.getAllByRole("button", { name: /set as default/i });
    expect(newSetDefaultBtns.length).toBe(1);
  });

  // --- Edit ---

  it("should open edit dialog when edit button clicked", async () => {
    render(<AddressManagement />);
    // Edit buttons: icon buttons with h-8 class, NOT red
    const editButtons = screen.getAllByRole("button").filter(
      btn => btn.className.includes("h-8") && !btn.className.includes("red")
    );
    expect(editButtons.length).toBe(2);
    fireEvent.click(editButtons[1]); // Warehouse edit
    await waitFor(() => {
      expect(screen.getByText("Edit Address")).toBeInTheDocument();
      expect(screen.getByText(/update your address/i)).toBeInTheDocument();
    });
  });

  it("should show Update Address button in edit dialog", async () => {
    render(<AddressManagement />);
    const editButtons = screen.getAllByRole("button").filter(
      btn => btn.className.includes("h-8") && !btn.className.includes("red")
    );
    fireEvent.click(editButtons[0]); // Main Store edit
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByRole("button", { name: /update address/i })).toBeInTheDocument();
    });
  });

  it("should not show Google Maps picker in edit dialog", async () => {
    render(<AddressManagement />);
    const editButtons = screen.getAllByRole("button").filter(
      btn => btn.className.includes("h-8") && !btn.className.includes("red")
    );
    fireEvent.click(editButtons[0]);
    await waitFor(() => {
      expect(screen.getByText("Edit Address")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("google-maps-picker")).not.toBeInTheDocument();
  });

  // --- Address card content ---

  it("should display default address with green border", () => {
    const { container } = render(<AddressManagement />);
    const borderedCards = container.querySelectorAll('[class*="border-2"][class*="6A994E"]');
    expect(borderedCards.length).toBe(1);
  });

  it("should show postal code in address text", () => {
    render(<AddressManagement />);
    expect(screen.getByText(/1100/)).toBeInTheDocument();
    expect(screen.getByText(/2009/)).toBeInTheDocument();
  });
});
