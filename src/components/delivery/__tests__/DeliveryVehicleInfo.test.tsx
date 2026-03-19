import { Car } from "lucide-react";
import { render, screen } from "@testing-library/react";
import DeliveryVehicleInfo from "../DeliveryVehicleInfo";

describe("DeliveryVehicleInfo", () => {
  const baseProps = {
    vehicleName: "Motorcycle",
    description: "Fast and affordable delivery",
    capacity: "Up to 20 kg",
  };

  it("should render vehicle name", () => {
    render(<DeliveryVehicleInfo {...baseProps} />);
    expect(screen.getByText("Motorcycle")).toBeInTheDocument();
  });

  it("should render capacity info", () => {
    render(<DeliveryVehicleInfo {...baseProps} />);
    expect(screen.getByText(/Capacity: Up to 20 kg/i)).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<DeliveryVehicleInfo {...baseProps} />);
    expect(screen.getByText(/Fast and affordable delivery/i)).toBeInTheDocument();
  });

  it("should show price badge when provided", () => {
    render(<DeliveryVehicleInfo {...baseProps} priceRange="PHP 120-180" />);
    expect(screen.getByText("PHP 120-180")).toBeInTheDocument();
  });

  it("should hide price badge when not provided", () => {
    render(<DeliveryVehicleInfo {...baseProps} />);
    expect(screen.queryByText(/PHP/i)).not.toBeInTheDocument();
  });

  it("should render compact variant", () => {
    const { container } = render(
      <DeliveryVehicleInfo {...baseProps} variant="compact" />
    );
    expect(container.querySelector(".p-3")).toBeInTheDocument();
  });

  it("should render custom icon", () => {
    render(<DeliveryVehicleInfo {...baseProps} icon={Car} />);
    expect(screen.getByLabelText(/Vehicle type icon/i)).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryVehicleInfo {...baseProps} className="custom-vehicle-card" />
    );
    expect(container.firstChild).toHaveClass("custom-vehicle-card");
  });
});
