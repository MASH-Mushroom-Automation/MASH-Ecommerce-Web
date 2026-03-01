import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutStep2Contact } from "../CheckoutStep2Contact";

// Mock dependencies
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...rest }: any) => (
    <button onClick={onClick} {...rest}>{children}</button>
  ),
}));

jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: any) => <form>{children}</form>,
  FormField: ({ name, render }: any) => {
    const mockFields: Record<string, any> = {
      name: { value: "John Doe", onChange: jest.fn() },
      phone: { value: "09171234567", onChange: jest.fn() },
      email: { value: "john@example.com", onChange: jest.fn() },
    };
    return render({ field: mockFields[name] || { value: "", onChange: jest.fn() }, fieldState: {} });
  },
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
  PICKUP_LOCATIONS: [
    { id: "loc-1", name: "MASH HQ", address: "123 Main St, Makati" },
  ],
}));

const defaultProps = {
  form: {
    control: {},
    handleSubmit: (fn: any) => () => fn({ name: "John", phone: "09171234567", email: "j@e.com" }),
  } as any,
  userIsAuthenticated: true,
  userName: "John Doe",
  step1Data: { deliveryMethod: "pickup" as const, pickupLocation: "loc-1" },
  deliveryAddress: null,
  lalamoveQuote: null,
  lalamoveScheduleAt: undefined,
  onSubmit: jest.fn(),
  onBack: jest.fn(),
};

describe("CheckoutStep2Contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render Contact Information heading", () => {
    render(<CheckoutStep2Contact {...defaultProps} />);
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });

  it("should show auto-filled message for authenticated users", () => {
    render(<CheckoutStep2Contact {...defaultProps} />);
    expect(screen.getByText("Auto-filled from profile")).toBeInTheDocument();
  });

  it("should not show auto-filled message for unauthenticated users", () => {
    render(<CheckoutStep2Contact {...defaultProps} userIsAuthenticated={false} userName={null} />);
    expect(screen.queryByText("Auto-filled from profile")).not.toBeInTheDocument();
  });

  it("should render Full Name, Phone, and Email fields", () => {
    render(<CheckoutStep2Contact {...defaultProps} />);
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Phone Number")).toBeInTheDocument();
    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("should render Delivery Method Selected section", () => {
    render(<CheckoutStep2Contact {...defaultProps} />);
    expect(screen.getByText("Delivery Method Selected")).toBeInTheDocument();
  });

  it("should show pickup location when pickup selected", () => {
    render(<CheckoutStep2Contact {...defaultProps} />);
    expect(screen.getByText(/Pickup at MASH HQ/)).toBeInTheDocument();
  });

  it("should show Lalamove delivery info when delivery selected", () => {
    const lalamoveProps = {
      ...defaultProps,
      step1Data: { deliveryMethod: "lalamove" as const },
      deliveryAddress: { lat: 14.5, lng: 121.0, formattedAddress: "456 Test St, Manila" } as any,
      lalamoveQuote: { price: 150.0, currency: "PHP" } as any,
    };
    render(<CheckoutStep2Contact {...lalamoveProps} />);
    expect(screen.getByText("Same-Day Delivery via Lalamove")).toBeInTheDocument();
    expect(screen.getByText("456 Test St, Manila")).toBeInTheDocument();
    expect(screen.getByText(/PHP 150.00/)).toBeInTheDocument();
  });

  it("should render Back and Continue buttons", () => {
    render(<CheckoutStep2Contact {...defaultProps} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Continue to Payment")).toBeInTheDocument();
  });

  it("should call onBack when Back clicked", () => {
    render(<CheckoutStep2Contact {...defaultProps} />);
    fireEvent.click(screen.getByText("Back"));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("should show scheduled delivery time when provided", () => {
    const scheduledProps = {
      ...defaultProps,
      step1Data: { deliveryMethod: "lalamove" as const },
      deliveryAddress: { lat: 14.5, lng: 121.0, formattedAddress: "Test" } as any,
      lalamoveQuote: { price: 100, currency: "PHP" } as any,
      lalamoveScheduleAt: "2025-06-15T14:00:00",
    };
    render(<CheckoutStep2Contact {...scheduledProps} />);
    expect(screen.getByText("Scheduled Delivery via Lalamove")).toBeInTheDocument();
    expect(screen.getByText(/Scheduled:/)).toBeInTheDocument();
  });
});
