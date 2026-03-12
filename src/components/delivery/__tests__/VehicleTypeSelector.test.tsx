import { render, screen, fireEvent } from "@testing-library/react";
import VehicleTypeSelector from "../VehicleTypeSelector";
import { LALAMOVE_VEHICLES } from "@/lib/lalamove/vehicle-types";

// Mock the UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
    onClick,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    role,
    tabIndex,
    "aria-pressed": ariaPressed,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    role?: string;
    tabIndex?: number;
    "aria-pressed"?: boolean;
    "aria-label"?: string;
  }) => (
    <div
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role={role}
      tabIndex={tabIndex}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <button {...props}>{children}</button>,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

const mockOnSelect = jest.fn();

describe("VehicleTypeSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all 7 vehicle types", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    for (const vehicle of LALAMOVE_VEHICLES) {
      expect(screen.getByText(vehicle.name)).toBeInTheDocument();
    }
  });

  it("should render the section heading", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    expect(screen.getByText("Select Vehicle Type")).toBeInTheDocument();
  });

  it("should display base fare when no distance provided", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    // Motorcycle base fare is 49
    expect(screen.getByText(/₱49 base/)).toBeInTheDocument();
    // Sedan base fare is 100
    expect(screen.getByText(/₱100 base/)).toBeInTheDocument();
  });

  it("should display estimated cost when distance provided", () => {
    render(
      <VehicleTypeSelector onSelect={mockOnSelect} distanceKm={10} />
    );
    // With 10km, estimates should show ~ prefix
    const estimates = screen.getAllByText(/~₱/);
    expect(estimates.length).toBe(LALAMOVE_VEHICLES.length);
  });

  it("should call onSelect when a vehicle is clicked", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText("Motorcycle"));
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "motorcycle", name: "Motorcycle" })
    );
  });

  it("should call onSelect on Enter key press", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    const motorcycleCard = screen.getByLabelText("Select Motorcycle");
    fireEvent.keyDown(motorcycleCard, { key: "Enter" });
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "motorcycle" })
    );
  });

  it("should call onSelect on Space key press", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    const sedanCard = screen.getByLabelText(
      "Select 200kg Sedan (Hatchback/Sedan)"
    );
    fireEvent.keyDown(sedanCard, { key: " " });
    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "sedan" })
    );
  });

  it("should show check icon and selected styling for selected vehicle", () => {
    render(
      <VehicleTypeSelector
        onSelect={mockOnSelect}
        selectedId="motorcycle"
      />
    );
    const motorcycleCard = screen.getByLabelText("Select Motorcycle");
    expect(motorcycleCard).toHaveAttribute("aria-pressed", "true");
  });

  it("should set aria-pressed false for non-selected vehicles", () => {
    render(
      <VehicleTypeSelector
        onSelect={mockOnSelect}
        selectedId="motorcycle"
      />
    );
    const sedanCard = screen.getByLabelText(
      "Select 200kg Sedan (Hatchback/Sedan)"
    );
    expect(sedanCard).toHaveAttribute("aria-pressed", "false");
  });

  it("should display vehicle summary when a vehicle is selected", () => {
    render(
      <VehicleTypeSelector
        onSelect={mockOnSelect}
        selectedId="motorcycle"
      />
    );
    const summary = screen.getByTestId("vehicle-summary");
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveTextContent("₱49");
    expect(summary).toHaveTextContent("20kg");
    expect(summary).toHaveTextContent("0.5 x 0.4 x 0.5 meters");
  });

  it("should not show summary when no vehicle is selected", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    expect(screen.queryByTestId("vehicle-summary")).not.toBeInTheDocument();
  });

  it("should show estimated total in summary when distance is provided", () => {
    render(
      <VehicleTypeSelector
        onSelect={mockOnSelect}
        selectedId="motorcycle"
        distanceKm={10}
      />
    );
    const summary = screen.getByTestId("vehicle-summary");
    expect(summary).toHaveTextContent("Est. Total");
    expect(summary).toHaveTextContent(/~₱/);
  });

  it("should show weight limit for each vehicle", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    expect(screen.getByText("20kg max")).toBeInTheDocument();
    expect(screen.getByText("200kg max")).toBeInTheDocument();
    expect(screen.getByText("2000kg max")).toBeInTheDocument();
  });

  it("should show description for vehicles that have one", () => {
    render(<VehicleTypeSelector onSelect={mockOnSelect} />);
    expect(
      screen.getByText("Best for small, lightweight items and documents")
    ).toBeInTheDocument();
  });

  it("should show add stop fee in summary", () => {
    render(
      <VehicleTypeSelector
        onSelect={mockOnSelect}
        selectedId="motorcycle"
      />
    );
    const summary = screen.getByTestId("vehicle-summary");
    expect(summary).toHaveTextContent("Add Stop Fee");
    expect(summary).toHaveTextContent("₱40");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <VehicleTypeSelector
        onSelect={mockOnSelect}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should pass addStops to estimate calculation", () => {
    render(
      <VehicleTypeSelector
        onSelect={mockOnSelect}
        selectedId="motorcycle"
        distanceKm={5}
        addStops={2}
      />
    );
    const summary = screen.getByTestId("vehicle-summary");
    // Base 49 + 5*18 = 139 + 2*40 = 219
    expect(summary).toHaveTextContent("~₱219");
  });
});
