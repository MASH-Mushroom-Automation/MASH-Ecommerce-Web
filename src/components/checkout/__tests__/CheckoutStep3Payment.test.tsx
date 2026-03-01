import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutStep3Payment } from "../CheckoutStep3Payment";
import { useForm } from "react-hook-form";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock("@/components/checkout", () => ({
  PICKUP_LOCATIONS: [
    { id: "loc1", name: "MASH HQ", address: "123 Farm Road, Manila" },
    { id: "loc2", name: "Satellite", address: "456 Market St, Quezon" },
  ],
}));

function Wrapper({ overrides = {} }: { overrides?: any }) {
  const form = useForm({
    defaultValues: { paymentMethod: "cod" },
  });

  const defaultProps = {
    form,
    step1Data: { deliveryMethod: "delivery" as const },
    step2Data: { name: "Juan Cruz", email: "juan@test.com", phone: "09171234567" },
    deliveryAddress: { formattedAddress: "789 Main St, Manila" },
    hasMultipleVendors: false,
    selectedVendor: null,
    submitting: false,
    paymentProcessing: false,
    itemCount: 3,
    onSubmit: jest.fn(),
    onBack: jest.fn(),
    onEditStep: jest.fn(),
    ...overrides,
  };

  return <CheckoutStep3Payment {...defaultProps} />;
}

describe("CheckoutStep3Payment", () => {
  it("should render Payment Method section", () => {
    render(<Wrapper />);
    expect(screen.getByText("Payment Method")).toBeInTheDocument();
    expect(screen.getByText(/Cash payment only/)).toBeInTheDocument();
  });

  it("should show Cash on Delivery for delivery method", () => {
    render(<Wrapper />);
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument();
  });

  it("should show Cash on Pickup for pickup method", () => {
    render(<Wrapper overrides={{ step1Data: { deliveryMethod: "pickup" } }} />);
    expect(screen.getByText("Cash on Pickup")).toBeInTheDocument();
  });

  it("should display order review contact info", () => {
    render(<Wrapper />);
    expect(screen.getByText("Juan Cruz")).toBeInTheDocument();
    expect(screen.getByText("juan@test.com")).toBeInTheDocument();
    expect(screen.getByText("09171234567")).toBeInTheDocument();
  });

  it("should display delivery address", () => {
    render(<Wrapper />);
    expect(screen.getByText("789 Main St, Manila")).toBeInTheDocument();
  });

  it("should display pickup location address", () => {
    render(
      <Wrapper
        overrides={{
          step1Data: { deliveryMethod: "pickup", pickupLocation: "loc1" },
          deliveryAddress: null,
        }}
      />
    );
    expect(screen.getByText("123 Farm Road, Manila")).toBeInTheDocument();
  });

  it("should show vendor info for multi-vendor pickup", () => {
    render(
      <Wrapper
        overrides={{
          step1Data: { deliveryMethod: "pickup", pickupLocation: "loc1" },
          hasMultipleVendors: true,
          selectedVendor: "Farm Fresh Co",
        }}
      />
    );
    expect(screen.getByText(/Farm Fresh Co/)).toBeInTheDocument();
  });

  it("should call onBack when Back button clicked", () => {
    const onBack = jest.fn();
    render(<Wrapper overrides={{ onBack }} />);
    fireEvent.click(screen.getByText("Back"));
    expect(onBack).toHaveBeenCalled();
  });

  it("should call onEditStep when Edit buttons clicked", () => {
    const onEditStep = jest.fn();
    render(<Wrapper overrides={{ onEditStep }} />);
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);
    expect(onEditStep).toHaveBeenCalledWith(2);
    fireEvent.click(editButtons[1]);
    expect(onEditStep).toHaveBeenCalledWith(1);
  });

  it("should disable Place Order button when submitting", () => {
    render(<Wrapper overrides={{ submitting: true }} />);
    expect(screen.getByText("Creating Order...")).toBeDisabled();
  });

  it("should disable Place Order button when itemCount is 0", () => {
    render(<Wrapper overrides={{ itemCount: 0 }} />);
    expect(screen.getByText("Place Order (Cash Payment)")).toBeDisabled();
  });

  it("should show creating order text when submitting", () => {
    render(<Wrapper overrides={{ submitting: true }} />);
    expect(screen.getByText("Creating Order...")).toBeInTheDocument();
  });

  it("should disable Back when payment processing", () => {
    render(<Wrapper overrides={{ paymentProcessing: true }} />);
    expect(screen.getByText("Back")).toBeDisabled();
  });

  it("should render Delivery Address label for delivery", () => {
    render(<Wrapper />);
    expect(screen.getByText("Delivery Address")).toBeInTheDocument();
  });

  it("should render Pickup Location label for pickup", () => {
    render(
      <Wrapper overrides={{ step1Data: { deliveryMethod: "pickup", pickupLocation: "loc1" } }} />
    );
    expect(screen.getByText("Pickup Location")).toBeInTheDocument();
  });
});
