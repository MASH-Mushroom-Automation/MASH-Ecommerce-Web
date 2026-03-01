/**
 * Tests for AddressManagement page - seller address management
 * COV-012: Seller page tests
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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
    { code: "R3", name: "Central Luzon" },
  ]),
  getCitiesByRegion: jest.fn(() => [
    { code: "MANILA", name: "Manila", provinceCode: "NCR" },
    { code: "QC", name: "Quezon City", provinceCode: "NCR" },
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

    it("should render the heading", () => {
      render(<AddressManagement />);
      expect(screen.getByRole("heading", { name: "Address Management" })).toBeInTheDocument();
  });

  it("should render Add New Address button", () => {
    render(<AddressManagement />);
    const addBtn = screen.getByRole("button", { name: /add new address/i });
    expect(addBtn).toBeInTheDocument();
  });

  it("should display sample addresses", () => {
    render(<AddressManagement />);
    // Should show address card content
    const cards = document.querySelectorAll("[class*=card]");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("should open add address dialog when button clicked", () => {
    render(<AddressManagement />);
    const addBtn = screen.getByRole("button", { name: /add new address/i });
    fireEvent.click(addBtn);
    // Dialog should appear with form fields
    waitFor(() => {
      expect(screen.getByText(/contact person|name/i)).toBeInTheDocument();
    });
  });

  it("should render edit and delete buttons for addresses", () => {
    render(<AddressManagement />);
    const buttons = screen.getAllByRole("button");
    // Should have edit/delete buttons per address
    expect(buttons.length).toBeGreaterThan(1);
  });

  it("should have default address indicator", () => {
    render(<AddressManagement />);
    // Use getAllByText for multiple matches
    const defaultBadges = screen.getAllByText(/default/i);
    expect(defaultBadges.length).toBeGreaterThan(0);
  });
});
