import { render, screen, fireEvent } from "@testing-library/react";
import DeliveryFilterBar, {
  type DeliveryFilters,
} from "../DeliveryFilterBar";

const defaultFilters: DeliveryFilters = {
  status: "ALL",
  dateFrom: "",
  dateTo: "",
  search: "",
};

describe("DeliveryFilterBar", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all filter controls", () => {
    render(
      <DeliveryFilterBar filters={defaultFilters} onChange={mockOnChange} />
    );
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("From")).toBeInTheDocument();
    expect(screen.getByLabelText("To")).toBeInTheDocument();
    expect(screen.getByLabelText("Order ID")).toBeInTheDocument();
  });

  it("should render all status options in dropdown", () => {
    render(
      <DeliveryFilterBar filters={defaultFilters} onChange={mockOnChange} />
    );
    const select = screen.getByLabelText("Status") as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);
    expect(options).toEqual([
      "ALL",
      "ASSIGNING_DRIVER",
      "ON_GOING",
      "PICKED_UP",
      "COMPLETED",
      "CANCELED",
      "REJECTED",
      "EXPIRED",
    ]);
  });

  it("should call onChange when status changes", () => {
    render(
      <DeliveryFilterBar filters={defaultFilters} onChange={mockOnChange} />
    );
    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "COMPLETED" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: "COMPLETED",
    });
  });

  it("should call onChange when date from changes", () => {
    render(
      <DeliveryFilterBar filters={defaultFilters} onChange={mockOnChange} />
    );
    fireEvent.change(screen.getByLabelText("From"), {
      target: { value: "2024-01-01" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      dateFrom: "2024-01-01",
    });
  });

  it("should call onChange when date to changes", () => {
    render(
      <DeliveryFilterBar filters={defaultFilters} onChange={mockOnChange} />
    );
    fireEvent.change(screen.getByLabelText("To"), {
      target: { value: "2024-12-31" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      dateTo: "2024-12-31",
    });
  });

  it("should call onChange when search input changes", () => {
    render(
      <DeliveryFilterBar filters={defaultFilters} onChange={mockOnChange} />
    );
    fireEvent.change(screen.getByLabelText("Order ID"), {
      target: { value: "ORD-123" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      search: "ORD-123",
    });
  });

  it("should not show clear button when no filters active", () => {
    render(
      <DeliveryFilterBar filters={defaultFilters} onChange={mockOnChange} />
    );
    expect(
      screen.queryByRole("button", { name: /clear filters/i })
    ).not.toBeInTheDocument();
  });

  it("should show clear button when status filter active", () => {
    render(
      <DeliveryFilterBar
        filters={{ ...defaultFilters, status: "COMPLETED" }}
        onChange={mockOnChange}
      />
    );
    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument();
  });

  it("should show clear button when search active", () => {
    render(
      <DeliveryFilterBar
        filters={{ ...defaultFilters, search: "test" }}
        onChange={mockOnChange}
      />
    );
    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument();
  });

  it("should reset all filters on clear", () => {
    render(
      <DeliveryFilterBar
        filters={{
          status: "CANCELED",
          dateFrom: "2024-01-01",
          dateTo: "2024-12-31",
          search: "ORD-999",
        }}
        onChange={mockOnChange}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(mockOnChange).toHaveBeenCalledWith({
      status: "ALL",
      dateFrom: "",
      dateTo: "",
      search: "",
    });
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryFilterBar
        filters={defaultFilters}
        onChange={mockOnChange}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should reflect current filter values in inputs", () => {
    render(
      <DeliveryFilterBar
        filters={{
          status: "PICKED_UP",
          dateFrom: "2024-06-01",
          dateTo: "2024-06-30",
          search: "ORD-456",
        }}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByLabelText("Status")).toHaveValue("PICKED_UP");
    expect(screen.getByLabelText("From")).toHaveValue("2024-06-01");
    expect(screen.getByLabelText("To")).toHaveValue("2024-06-30");
    expect(screen.getByLabelText("Order ID")).toHaveValue("ORD-456");
  });
});
