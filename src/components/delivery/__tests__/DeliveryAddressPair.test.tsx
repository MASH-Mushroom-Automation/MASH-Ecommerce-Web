import { render, screen } from "@testing-library/react";
import DeliveryAddressPair from "../DeliveryAddressPair";

describe("DeliveryAddressPair", () => {
  it("should render pickup address", () => {
    render(
      <DeliveryAddressPair
        pickupAddress="123 Farm Road, Manila"
        dropoffAddress="456 Market St, Makati"
      />
    );
    expect(screen.getByText("Pickup")).toBeInTheDocument();
    expect(screen.getByText("123 Farm Road, Manila")).toBeInTheDocument();
  });

  it("should render dropoff address", () => {
    render(
      <DeliveryAddressPair
        pickupAddress="123 Farm Road, Manila"
        dropoffAddress="456 Market St, Makati"
      />
    );
    expect(screen.getByText("Dropoff")).toBeInTheDocument();
    expect(screen.getByText("456 Market St, Makati")).toBeInTheDocument();
  });

  it("should show distance label when provided", () => {
    render(
      <DeliveryAddressPair
        pickupAddress="Pickup"
        dropoffAddress="Dropoff"
        distance="5.2 km"
      />
    );
    expect(screen.getByText("5.2 km")).toBeInTheDocument();
  });

  it("should hide distance when not provided", () => {
    const { container } = render(
      <DeliveryAddressPair
        pickupAddress="Pickup A"
        dropoffAddress="Dropoff B"
      />
    );
    // No distance text element
    expect(container.querySelector(".text-gray-400")).not.toBeInTheDocument();
  });

  it("should use compact variant with smaller icons", () => {
    const { container } = render(
      <DeliveryAddressPair
        pickupAddress="A"
        dropoffAddress="B"
        variant="compact"
      />
    );
    const compactIcons = container.querySelectorAll(".h-6.w-6");
    expect(compactIcons.length).toBe(2);
  });

  it("should use expanded variant by default", () => {
    const { container } = render(
      <DeliveryAddressPair pickupAddress="A" dropoffAddress="B" />
    );
    const expandedIcons = container.querySelectorAll(".h-8.w-8");
    expect(expandedIcons.length).toBe(2);
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryAddressPair
        pickupAddress="A"
        dropoffAddress="B"
        className="my-custom"
      />
    );
    expect(container.firstChild).toHaveClass("my-custom");
  });
});
