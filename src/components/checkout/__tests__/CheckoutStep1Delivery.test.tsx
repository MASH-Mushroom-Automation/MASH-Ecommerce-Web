import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutStep1Delivery } from "../CheckoutStep1Delivery";
import { useForm } from "react-hook-form";

// Mock dependencies
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} {...rest}>{children}</button>
  ),
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <form>{children}</form>,
  FormField: ({ render }: any) => render({ field: { value: mockDeliveryMethod, onChange: mockFieldOnChange }, fieldState: {} }),
  FormItem: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

jest.mock("lucide-react", () => ({
  MapPin: () => <svg data-testid="map-pin-icon" />,
  Truck: () => <svg data-testid="truck-icon" />,
}));

jest.mock("@/components/checkout", () => ({
  AddressPicker: ({ onAddressSelect }: any) => <div data-testid="address-picker" />,
  LalamoveQuote: () => <div data-testid="lalamove-quote" />,
  MASH_PICKUP_LOCATION: { lat: 14.5, lng: 121.0, address: "MASH HQ" },
  PICKUP_LOCATIONS: [
    { id: "loc-1", name: "MASH HQ", address: "123 Main St, Makati" },
    { id: "loc-2", name: "Branch 2", address: "456 Side St, BGC" },
  ],
}));

let mockDeliveryMethod = "pickup";
const mockFieldOnChange = jest.fn((val: string) => { mockDeliveryMethod = val; });

const defaultProps = {
  form: {
    control: {},
    handleSubmit: (fn: any) => () => fn({ deliveryMethod: "pickup", pickupLocation: "loc-1" }),
  } as any,
  watchDeliveryMethod: "pickup",
  userIsAuthenticated: false,
  savedAddresses: [],
  selectedSavedAddressId: null,
  useNewAddress: false,
  deliveryAddress: null,
  lalamoveQuote: null,
  lalamoveServiceType: "MOTORCYCLE",
  lalamoveScheduleAt: undefined,
  defaultAddress: null,
  onSavedAddressSelect: jest.fn(),
  onAddNewAddressClick: jest.fn(),
  onAddressSelect: jest.fn(),
  onQuoteReceived: jest.fn(),
  onServiceTypeChange: jest.fn(),
  onScheduleChange: jest.fn(),
  onUseSavedAddress: jest.fn(),
  onSubmit: jest.fn(),
  onBack: jest.fn(),
};

describe("CheckoutStep1Delivery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeliveryMethod = "pickup";
  });

  it("should render Pickup option", () => {
    render(<CheckoutStep1Delivery {...defaultProps} />);
    expect(screen.getByText("Pickup (Free)")).toBeInTheDocument();
  });

  it("should render Same-Day Delivery option", () => {
    render(<CheckoutStep1Delivery {...defaultProps} />);
    expect(screen.getByText("Same-Day Delivery")).toBeInTheDocument();
  });

  it("should render Back to Cart button", () => {
    render(<CheckoutStep1Delivery {...defaultProps} />);
    expect(screen.getByText("Back to Cart")).toBeInTheDocument();
  });

  it("should render Continue button", () => {
    render(<CheckoutStep1Delivery {...defaultProps} />);
    expect(screen.getByText("Continue to Contact Info")).toBeInTheDocument();
  });

  it("should call onBack when Back button clicked", () => {
    render(<CheckoutStep1Delivery {...defaultProps} />);
    fireEvent.click(screen.getByText("Back to Cart"));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("should render pickup locations when pickup selected", () => {
    render(<CheckoutStep1Delivery {...defaultProps} />);
    expect(screen.getByText("MASH HQ")).toBeInTheDocument();
    expect(screen.getByText("Branch 2")).toBeInTheDocument();
  });

  it("should render MapPin and Truck icons", () => {
    render(<CheckoutStep1Delivery {...defaultProps} />);
    expect(screen.getByTestId("map-pin-icon")).toBeInTheDocument();
    expect(screen.getByTestId("truck-icon")).toBeInTheDocument();
  });
});
