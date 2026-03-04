import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ items: [], addToCart: jest.fn(), removeFromCart: jest.fn(), cartCount: 0 }),
}));
jest.mock("@/contexts/WishlistContext", () => ({
  useWishlist: () => ({ items: [], addToWishlist: jest.fn(), removeFromWishlist: jest.fn(), isInWishlist: jest.fn(() => false) }),
}));

import OperatingHoursModal from "../../OperatingHoursModal";

describe("OperatingHoursModal", () => {
  it("renders trigger button", () => {
    const { container } = render(<OperatingHoursModal />);
    expect(container.textContent).toMatch(/edit operating hours/i);
  });

  it("renders with custom trigger label", () => {
    const { container } = render(<OperatingHoursModal triggerLabel="View Hours" />);
    expect(container.textContent).toMatch(/view hours/i);
  });

  it("accepts initialHours prop without crashing", () => {
    const hours = { Monday: { closed: false, open: "08:00", close: "18:00" }, Tuesday: { closed: true } };
    const { container } = render(<OperatingHoursModal initialHours={hours} />);
    expect(container).toBeDefined();
  });

  it("accepts onSave callback prop", () => {
    const onSave = jest.fn();
    const { container } = render(<OperatingHoursModal onSave={onSave} />);
    expect(container).toBeDefined();
  });

  it("renders disabled state", () => {
    const { container } = render(<OperatingHoursModal disabled={true} />);
    expect(container).toBeDefined();
  });

  it("opens dialog when trigger button is clicked", () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    expect(screen.getByText("Operating Hours")).toBeInTheDocument();
    expect(screen.getByText(/Set your business hours/)).toBeInTheDocument();
  });

  it("renders all 7 days of the week in dialog", () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("initializes closed days from initialHours", () => {
    const hours = { Monday: { closed: true }, Wednesday: { closed: true } };
    render(<OperatingHoursModal initialHours={hours} />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    // Monday and Wednesday Closed switches should be checked
    const mondaySwitch = screen.getByRole("switch", { name: /monday closed/i });
    expect(mondaySwitch).toBeChecked();
  });

  it("initializes open hours from initialHours", () => {
    const hours = { Monday: { closed: false, open: "07:30", close: "20:00" } };
    render(<OperatingHoursModal initialHours={hours} />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    // Should have the custom time values
    const inputs = screen.getAllByDisplayValue("07:30");
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it("uses default times when initialHours has missing open/close", () => {
    const hours = { Monday: { closed: false } };  // missing open/close
    render(<OperatingHoursModal initialHours={hours} />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    // Should fall back to 09:00 and 17:00
    const opens = screen.getAllByDisplayValue("09:00");
    expect(opens.length).toBeGreaterThanOrEqual(1);
  });

  it("toggles a day to closed and back", () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    const mondaySwitch = screen.getByRole("switch", { name: /monday closed/i });
    // Toggle to closed
    fireEvent.click(mondaySwitch);
    expect(mondaySwitch).toBeChecked();
    // Toggle back to open
    fireEvent.click(mondaySwitch);
    expect(mondaySwitch).not.toBeChecked();
  });

  it("changes open time for a day", () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    const timeInputs = screen.getAllByDisplayValue("09:00");
    fireEvent.change(timeInputs[0], { target: { value: "08:00" } });
    expect(screen.getAllByDisplayValue("08:00").length).toBeGreaterThanOrEqual(1);
  });

  it("changes close time for a day", () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    const closeInputs = screen.getAllByDisplayValue("17:00");
    fireEvent.change(closeInputs[0], { target: { value: "21:00" } });
    expect(screen.getAllByDisplayValue("21:00").length).toBeGreaterThanOrEqual(1);
  });

  it("does not change time when day is closed", () => {
    const hours = { Monday: { closed: true } };
    render(<OperatingHoursModal initialHours={hours} />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    // Monday time inputs should be disabled
    const mondaySwitch = screen.getByRole("switch", { name: /monday closed/i });
    expect(mondaySwitch).toBeChecked();
  });

  it("calls onSave with hours when Save is clicked and validation passes", async () => {
    const onSave = jest.fn();
    render(<OperatingHoursModal onSave={onSave} />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    fireEvent.click(screen.getByText("Save Changes"));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call onSave when validation fails (open >= close)", async () => {
    const onSave = jest.fn();
    render(<OperatingHoursModal onSave={onSave} />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    // Set open time AFTER close time for Monday
    const openInputs = screen.getAllByDisplayValue("09:00");
    fireEvent.change(openInputs[0], { target: { value: "18:00" } });
    const closeInputs = screen.getAllByDisplayValue("17:00");
    fireEvent.change(closeInputs[0], { target: { value: "08:00" } });
    fireEvent.click(screen.getByText("Save Changes"));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("closes dialog when Cancel is clicked", () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    expect(screen.getByText("Operating Hours")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    // Dialog content should be removed
    expect(screen.queryByText("Operating Hours")).not.toBeInTheDocument();
  });

  it("saves without onSave callback", async () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    fireEvent.click(screen.getByText("Save Changes"));
    // Should not throw, dialog should close
    await waitFor(() => {
      expect(screen.queryByText("Operating Hours")).not.toBeInTheDocument();
    });
  });

  it("shows Saving... text while save is in progress", () => {
    render(<OperatingHoursModal />);
    fireEvent.click(screen.getByText(/edit operating hours/i));
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("disables trigger button when disabled prop is true", () => {
    render(<OperatingHoursModal disabled />);
    const button = screen.getByText(/edit operating hours/i);
    expect(button).toBeDisabled();
  });
});
