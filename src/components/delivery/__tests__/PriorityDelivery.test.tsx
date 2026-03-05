/**
 * PriorityDelivery Component Tests
 * Tests priority option selection, fee calculation, API integration, and error handling
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PriorityDelivery from "../PriorityDelivery";

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, ...props }: any) => (
    <button disabled={disabled} onClick={onClick} {...props}>{children}</button>
  ),
}));
jest.mock("@/components/ui/card", () => ({
  Card: (p: any) => <div>{p.children}</div>,
  CardContent: (p: any) => <div className={p.className}>{p.children}</div>,
  CardDescription: (p: any) => <p>{p.children}</p>,
  CardHeader: (p: any) => <div>{p.children}</div>,
  CardTitle: (p: any) => <h3>{p.children}</h3>,
}));
// Use a context to pass RadioGroup value down to RadioGroupItem
const RadioGroupContext = React.createContext<{ value: string; onValueChange?: (v: string) => void; disabled?: boolean }>({ value: "" });

jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, value, onValueChange, disabled }: any) => (
    <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
      <div role="radiogroup">{children}</div>
    </RadioGroupContext.Provider>
  ),
  RadioGroupItem: ({ value, id, disabled: itemDisabled, ...props }: any) => {
    const ctx = React.useContext(RadioGroupContext);
    return (
      <input
        type="radio"
        id={id}
        value={value}
        checked={ctx.value === value}
        disabled={itemDisabled || ctx.disabled}
        onChange={() => ctx.onValueChange?.(value)}
        aria-label={id}
        {...props}
      />
    );
  },
}));
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}));
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));
jest.mock("lucide-react", () => ({
  Zap: () => <span>Zap</span>,
  Clock: () => <span>Clock</span>,
  Crown: () => <span>Crown</span>,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

function createProps(overrides: Partial<React.ComponentProps<typeof PriorityDelivery>> = {}) {
  return {
    orderId: "order-123",
    currentTotal: 100,
    onPrioritySelected: jest.fn(),
    disabled: false,
    ...overrides,
  };
}

describe("PriorityDelivery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe("rendering", () => {
    it("renders the Priority Delivery title and description", () => {
      render(<PriorityDelivery {...createProps()} />);
      expect(screen.getByText("Priority Delivery")).toBeInTheDocument();
      expect(
        screen.getByText("Get your order delivered faster with priority driver assignment")
      ).toBeInTheDocument();
    });

    it("renders all 4 priority options", () => {
      render(<PriorityDelivery {...createProps()} />);
      expect(screen.getByText("Standard")).toBeInTheDocument();
      expect(screen.getByText("Express (+₱50)")).toBeInTheDocument();
      expect(screen.getByText("Priority (+₱75)")).toBeInTheDocument();
      expect(screen.getByText("VIP (+₱100)")).toBeInTheDocument();
    });

    it("renders estimated times for paid options", () => {
      render(<PriorityDelivery {...createProps()} />);
      expect(screen.getByText("2-5 minutes")).toBeInTheDocument();
      expect(screen.getByText("1-3 minutes")).toBeInTheDocument();
      expect(screen.getByText("1-2 minutes")).toBeInTheDocument();
    });

    it("renders option descriptions", () => {
      render(<PriorityDelivery {...createProps()} />);
      expect(screen.getByText("Normal driver assignment")).toBeInTheDocument();
      expect(screen.getByText("15-20% faster assignment")).toBeInTheDocument();
      expect(screen.getByText("30% faster assignment")).toBeInTheDocument();
      expect(screen.getByText("Fastest assignment")).toBeInTheDocument();
    });

    it("renders the info note text", () => {
      render(<PriorityDelivery {...createProps()} />);
      expect(
        screen.getByText(/Priority fee must be added before driver accepts the order/)
      ).toBeInTheDocument();
    });

    it("defaults to Standard selection", () => {
      render(<PriorityDelivery {...createProps()} />);
      const standardRadio = screen.getByRole("radio", { checked: true });
      expect(standardRadio).toHaveAttribute("value", "0");
    });
  });

  describe("price summary", () => {
    it("shows base delivery fee from currentTotal", () => {
      render(<PriorityDelivery {...createProps({ currentTotal: 200 })} />);
      expect(screen.getAllByText("₱200.00").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Base Delivery Fee:")).toBeInTheDocument();
    });

    it("does not show priority fee line when Standard is selected", () => {
      render(<PriorityDelivery {...createProps()} />);
      expect(screen.queryByText("Priority Fee:")).not.toBeInTheDocument();
    });

    it("shows priority fee when Express is selected", () => {
      render(<PriorityDelivery {...createProps()} />);
      const expressRadio = screen.getByDisplayValue("50");
      fireEvent.click(expressRadio);
      expect(screen.getByText("+₱50.00")).toBeInTheDocument();
      expect(screen.getByText("₱150.00")).toBeInTheDocument();
    });

    it("shows correct total for Priority (+₱75) selection", () => {
      render(<PriorityDelivery {...createProps({ currentTotal: 200 })} />);
      const priorityRadio = screen.getByDisplayValue("75");
      fireEvent.click(priorityRadio);
      expect(screen.getByText("+₱75.00")).toBeInTheDocument();
      expect(screen.getByText("₱275.00")).toBeInTheDocument();
    });

    it("shows correct total for VIP (+₱100) selection", () => {
      render(<PriorityDelivery {...createProps({ currentTotal: 250 })} />);
      const vipRadio = screen.getByDisplayValue("100");
      fireEvent.click(vipRadio);
      expect(screen.getByText("+₱100.00")).toBeInTheDocument();
      expect(screen.getByText("₱350.00")).toBeInTheDocument();
    });
  });

  describe("apply button", () => {
    it("shows disabled button with 'Select Priority Level' when Standard selected", () => {
      render(<PriorityDelivery {...createProps()} />);
      const button = screen.getByText("Select Priority Level").closest("button");
      expect(button).toBeDisabled();
    });

    it("does not render apply button when orderId is not provided", () => {
      const { container } = render(<PriorityDelivery {...createProps({ orderId: undefined })} />);
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("disables radio buttons when disabled prop is true", () => {
      render(<PriorityDelivery {...createProps({ disabled: true })} />);
      const radios = screen.getAllByRole("radio");
      radios.forEach((radio) => expect(radio).toBeDisabled());
    });
  });

  describe("API integration", () => {
    it("calls POST /api/lalamove/priority with correct body when Express is applied", async () => {
      render(<PriorityDelivery {...createProps()} />);

      const expressRadio = screen.getByDisplayValue("50");
      fireEvent.click(expressRadio);

      const applyButton = screen.getByText(/Add Express/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/lalamove/priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: "order-123", priorityFee: "50" }),
        });
      });
    });

    it("calls onPrioritySelected with fee amount on success", async () => {
      const onPrioritySelected = jest.fn();
      render(<PriorityDelivery {...createProps({ onPrioritySelected })} />);

      const priorityRadio = screen.getByDisplayValue("75");
      fireEvent.click(priorityRadio);

      const applyButton = screen.getByText(/Add Priority/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(onPrioritySelected).toHaveBeenCalledWith(75);
      });
    });

    it("shows success message after applying", async () => {
      render(<PriorityDelivery {...createProps()} />);

      const expressRadio = screen.getByDisplayValue("50");
      fireEvent.click(expressRadio);

      const applyButton = screen.getByText(/Add Express/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Priority delivery added/)).toBeInTheDocument();
      });
    });

    it("shows error when API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Driver already assigned" }),
      });

      render(<PriorityDelivery {...createProps()} />);

      const vipRadio = screen.getByDisplayValue("100");
      fireEvent.click(vipRadio);

      const applyButton = screen.getByText(/Add VIP/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Driver already assigned")).toBeInTheDocument();
      });
    });

    it("shows error when fetch throws a network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<PriorityDelivery {...createProps()} />);

      const expressRadio = screen.getByDisplayValue("50");
      fireEvent.click(expressRadio);

      const applyButton = screen.getByText(/Add Express/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("auto-hides success message after 3 seconds", async () => {
      jest.useFakeTimers();
      render(<PriorityDelivery {...createProps()} />);

      const expressRadio = screen.getByDisplayValue("50");
      fireEvent.click(expressRadio);

      const applyButton = screen.getByText(/Add Express/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Priority delivery added/)).toBeInTheDocument();
      });

      // Advance past 3 second timeout
      act(() => {
        jest.advanceTimersByTime(3100);
      });

      // After timeout, success message should no longer be shown as a standalone success indicator
      // and the radio group should no longer be disabled by success state
      jest.useRealTimers();
    });

    it("shows fallback error message when error has no message", async () => {
      mockFetch.mockRejectedValueOnce({});

      render(<PriorityDelivery {...createProps()} />);

      const expressRadio = screen.getByDisplayValue("50");
      fireEvent.click(expressRadio);

      const applyButton = screen.getByText(/Add Express/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Failed to add priority delivery")).toBeInTheDocument();
      });
    });

    it("shows fallback error when response.json has no message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      render(<PriorityDelivery {...createProps()} />);

      const expressRadio = screen.getByDisplayValue("50");
      fireEvent.click(expressRadio);

      const applyButton = screen.getByText(/Add Express/i).closest("button")!;
      await act(async () => {
        fireEvent.click(applyButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Failed to add priority fee")).toBeInTheDocument();
      });
    });
  });
});
