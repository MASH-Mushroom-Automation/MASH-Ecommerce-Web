/**
 * AddressManager Component Tests
 *
 * Tests the user profile address management component.
 * Covers address list rendering, add/edit/delete flows,
 * set default address, empty state, loading state, and
 * confirmation dialogs.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// Use the globally mocked toast from jest.setup.js (sonner is already mocked globally)
import { toast } from "sonner";

const mockToast = toast as unknown as {
  success: jest.Mock;
  error: jest.Mock;
};

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  MapPin: (props: any) => <span data-testid="map-pin-icon" {...props} />,
  Loader2: (props: any) => <span data-testid="loader-icon" {...props} />,
  Star: (props: any) => <span data-testid="star-icon" {...props} />,
  Trash2: (props: any) => <span data-testid="trash-icon" {...props} />,
  Plus: (props: any) => <span data-testid="plus-icon" {...props} />,
  Edit: (props: any) => <span data-testid="edit-icon" {...props} />,
  AlertTriangle: (props: any) => <span data-testid="alert-icon" {...props} />,
  Info: (props: any) => <span data-testid="info-icon" {...props} />,
}));

// Mock AddressPicker component
jest.mock("@/components/checkout/AddressPicker", () => ({
  AddressPicker: ({ onAddressSelect, defaultValue }: any) => (
    <div data-testid="address-picker" data-default-value={defaultValue || ""}>
      <button
        data-testid="mock-select-address"
        onClick={() =>
          onAddressSelect({
            lat: 14.5995,
            lng: 120.9842,
            formattedAddress: "123 Main St, Manila, Philippines",
            components: {
              street: "123 Main St",
              city: "Manila",
              state: "Metro Manila",
              zipCode: "1000",
            },
          })
        }
      >
        Select Address
      </button>
    </div>
  ),
}));

// Mock Dialog to render inline (portals fail in jsdom)
jest.mock("@/components/ui/dialog", () => {
  const _R = require("react");
  function Dialog({ children, open, onOpenChange }: any) {
    return (
      <div data-testid="dialog" data-open={open ? "true" : "false"}>
        {_R.Children.map(children, (c: any) =>
          _R.isValidElement(c)
            ? _R.cloneElement(c as React.ReactElement<any>, {
                __dialogOpen: open,
                __onOpenChange: onOpenChange,
              })
            : c
        )}
      </div>
    );
  }
  function DialogContent({ children, __dialogOpen }: any) {
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
  return {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  };
});

// Mock useFirebaseAddresses hook
const mockAddAddress = jest.fn();
const mockDeleteAddress = jest.fn();
const mockSetAsDefault = jest.fn();
const mockUpdateAddress = jest.fn();

jest.mock("@/hooks/useFirebaseAddresses", () => ({
  useFirebaseAddresses: () => ({
    addresses: mockAddresses,
    loading: mockLoading,
    addAddress: mockAddAddress,
    deleteAddress: mockDeleteAddress,
    setAsDefault: mockSetAsDefault,
    updateAddress: mockUpdateAddress,
    mutating: mockMutating,
  }),
}));

// State variables for mock hook
let mockAddresses: any[] = [];
let mockLoading = false;
let mockMutating = false;

import { AddressManager } from "@/components/profile/AddressManager";

// ---- Test Data ----

const sampleAddress = {
  id: "addr-1",
  label: "Home",
  street: "123 Main St",
  addressLine2: "",
  city: "Manila",
  stateProvince: "Metro Manila",
  zipPostal: "1000",
  landmark: "Near the park",
  coordinates: { lat: 14.5995, lng: 120.9842 },
  formattedAddress: "123 Main St, Manila, Metro Manila 1000",
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const secondAddress = {
  id: "addr-2",
  label: "Office",
  street: "456 Business Ave",
  addressLine2: "Suite 200",
  city: "Makati",
  stateProvince: "Metro Manila",
  zipPostal: "1200",
  landmark: "",
  coordinates: { lat: 14.5547, lng: 121.0244 },
  formattedAddress: "456 Business Ave, Makati, Metro Manila 1200",
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("AddressManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddresses = [];
    mockLoading = false;
    mockMutating = false;
  });

  // =============================================
  // Empty State
  // =============================================

  describe("empty state", () => {
    it("shows empty state message when no addresses exist", () => {
      mockAddresses = [];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(screen.getByText("No saved addresses yet")).toBeInTheDocument();
    });

    it("shows 'Add Your First Address' button in empty state", () => {
      mockAddresses = [];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(
        screen.getByText("Add Your First Address")
      ).toBeInTheDocument();
    });
  });

  // =============================================
  // Loading State
  // =============================================

  describe("loading state", () => {
    it("shows loading spinner when addresses are loading", () => {
      mockLoading = true;
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(screen.getByText("Loading addresses...")).toBeInTheDocument();
    });
  });

  // =============================================
  // Address List Rendering
  // =============================================

  describe("address list", () => {
    it("renders saved addresses", () => {
      mockAddresses = [sampleAddress, secondAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Office")).toBeInTheDocument();
    });

    it("shows formatted address text", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(
        screen.getByText("123 Main St, Manila, Metro Manila 1000")
      ).toBeInTheDocument();
    });

    it("shows default badge on default address", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(screen.getByText("Default")).toBeInTheDocument();
    });

    it("shows landmark/delivery instructions when present", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(screen.getByText("Near the park")).toBeInTheDocument();
      expect(
        screen.getByText("Delivery Instructions:")
      ).toBeInTheDocument();
    });

    it("shows coordinates for each address", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(
        screen.getByText(/14\.599500.*120\.984200/)
      ).toBeInTheDocument();
    });

    it("renders the card title Delivery Addresses", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(screen.getByText("Delivery Addresses")).toBeInTheDocument();
    });
  });

  // =============================================
  // Add New Address
  // =============================================

  describe("add address", () => {
    it("renders Add New Address button", () => {
      mockAddresses = [];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(
        screen.getByText("Add New Address")
      ).toBeInTheDocument();
    });

    it("opens address picker dialog when Add New Address is clicked", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(screen.getByText("Add New Address"));

      // Dialog should open (mock renders inline)
      expect(screen.getByText("Add New Address", { selector: "h2" })).toBeInTheDocument();
    });

    it("shows address label and landmark fields in add dialog", () => {
      mockAddresses = [];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(screen.getByText("Add New Address"));

      expect(screen.getByLabelText("Address Label *")).toBeInTheDocument();
      expect(screen.getByLabelText(/Delivery Instructions/)).toBeInTheDocument();
    });

    it("calls addAddress when address is selected from picker", async () => {
      mockAddresses = [];
      mockAddAddress.mockResolvedValue("new-addr-id");
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      // Open the dialog
      fireEvent.click(screen.getAllByText("Add Your First Address")[0]);

      // Click the mock address picker button
      await act(async () => {
        fireEvent.click(screen.getByTestId("mock-select-address"));
      });

      await waitFor(() => {
        expect(mockAddAddress).toHaveBeenCalledTimes(1);
      });
    });

    it("shows success toast after adding address", async () => {
      mockAddresses = [];
      mockAddAddress.mockResolvedValue("new-addr-id");
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(screen.getAllByText("Add Your First Address")[0]);

      await act(async () => {
        fireEvent.click(screen.getByTestId("mock-select-address"));
      });

      // Flush the async handler's resolved Promise chain
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Address saved to your profile!"
      );
    });

    it("shows error toast when not authenticated", async () => {
      mockAddresses = [];
      render(<AddressManager isAuthenticated={false} />);

      fireEvent.click(screen.getAllByText("Add Your First Address")[0]);

      await act(async () => {
        fireEvent.click(screen.getByTestId("mock-select-address"));
      });

      // Flush the async handler
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Please sign in to save addresses"
      );
    });
  });

  // =============================================
  // Delete Address
  // =============================================

  describe("delete address", () => {
    it("opens confirmation dialog when delete is clicked", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(screen.getByTitle("Delete this address"));

      // Title and button both say "Delete Address" - use heading selector
      expect(
        screen.getByRole("heading", { name: /Delete Address/ })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to delete/)
      ).toBeInTheDocument();
    });

    it("calls deleteAddress when confirmed", async () => {
      mockAddresses = [sampleAddress];
      mockDeleteAddress.mockResolvedValue(true);
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(screen.getByTitle("Delete this address"));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Delete Address$/ }));
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(mockDeleteAddress).toHaveBeenCalledWith("addr-1");
    });

    it("shows success toast after successful deletion", async () => {
      mockAddresses = [sampleAddress];
      mockDeleteAddress.mockResolvedValue(true);
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(screen.getByTitle("Delete this address"));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /^Delete Address$/ }));
      });

      // Flush the async handler
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Address deleted successfully"
      );
    });
  });

  // =============================================
  // Set Default Address
  // =============================================

  describe("set default address", () => {
    it("shows set default button for non-default addresses", () => {
      mockAddresses = [sampleAddress, secondAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      expect(
        screen.getByTitle("Set as default delivery address")
      ).toBeInTheDocument();
    });

    it("does not show set default button on default address", () => {
      mockAddresses = [sampleAddress]; // isDefault: true
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      // Only one address, and it's default - no set-default button
      expect(
        screen.queryByTitle("Set as default delivery address")
      ).not.toBeInTheDocument();
    });

    it("opens confirmation dialog when set default is clicked", () => {
      mockAddresses = [sampleAddress, secondAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(
        screen.getByTitle("Set as default delivery address")
      );

      expect(
        screen.getByText("Change Default Address")
      ).toBeInTheDocument();
    });

    it("calls setAsDefault when confirmed", async () => {
      mockAddresses = [sampleAddress, secondAddress];
      mockSetAsDefault.mockResolvedValue(true);
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(
        screen.getByTitle("Set as default delivery address")
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Set as Default"));
      });

      await waitFor(() => {
        expect(mockSetAsDefault).toHaveBeenCalledWith("addr-2");
      });
    });
  });

  // =============================================
  // Edit Address
  // =============================================

  describe("edit address", () => {
    it("opens edit dialog when edit button is clicked", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(
        screen.getByTitle("Edit address location and instructions")
      );

      expect(
        screen.getByText(/Edit Address: Home/)
      ).toBeInTheDocument();
    });

    it("pre-fills label and landmark in edit dialog", () => {
      mockAddresses = [sampleAddress];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(
        screen.getByTitle("Edit address location and instructions")
      );

      const labelInput = screen.getByLabelText("Address Label *") as HTMLInputElement;
      const landmarkInput = screen.getByLabelText(/Delivery Instructions/) as HTMLInputElement;

      expect(labelInput.value).toBe("Home");
      expect(landmarkInput.value).toBe("Near the park");
    });

    it("calls updateAddress when address is selected", async () => {
      mockAddresses = [sampleAddress];
      mockUpdateAddress.mockResolvedValue(true);
      render(<AddressManager isAuthenticated={true} userId="user-1" />);

      fireEvent.click(
        screen.getByTitle("Edit address location and instructions")
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId("mock-select-address"));
      });

      await waitFor(() => {
        expect(mockUpdateAddress).toHaveBeenCalledWith(
          "addr-1",
          expect.objectContaining({
            label: "Home",
            landmark: "Near the park",
          })
        );
      });
    });
  });

  // =============================================
  // Info Card
  // =============================================

  describe("info card", () => {
    it("renders delivery instructions help card", () => {
      mockAddresses = [];
      render(<AddressManager isAuthenticated={true} userId="user-1" />);
      expect(
        screen.getByText("Delivery Instructions Help Riders Find You")
      ).toBeInTheDocument();
    });
  });
});
