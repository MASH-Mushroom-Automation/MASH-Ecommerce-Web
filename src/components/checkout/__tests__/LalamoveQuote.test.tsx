/**
 * LalamoveQuote Component Tests - Scheduled Delivery Feature (TEST-009)
 *
 * Tests the ScheduleDeliverySelector toggle, date/time validation,
 * and scheduled delivery display in the LalamoveQuote component.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { LalamoveQuote, MASH_PICKUP_LOCATION } from "../LalamoveQuote";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper: valid Lalamove API response
function mockQuoteResponse(overrides = {}) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          quotationId: "mock-quotation-123",
          priceBreakdown: { total: "89.00" },
          distance: { value: "5.2", unit: "km" },
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          ...overrides,
        },
      }),
  };
}

// Helper: create test props
function createProps(overrides: Partial<React.ComponentProps<typeof LalamoveQuote>> = {}) {
  return {
    pickupAddress: MASH_PICKUP_LOCATION,
    deliveryAddress: {
      lat: 14.6507,
      lng: 121.0497,
      address: "SM City North EDSA, Quezon City",
      name: "Test User",
      phone: "+639123456789",
    },
    onQuoteReceived: jest.fn(),
    serviceType: "MOTORCYCLE",
    onServiceTypeChange: jest.fn(),
    scheduleAt: undefined as string | undefined,
    onScheduleChange: jest.fn(),
    ...overrides,
  };
}

describe("LalamoveQuote - Scheduled Delivery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue(mockQuoteResponse());
  });

  it("renders schedule delivery toggle when onScheduleChange is provided", async () => {
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.getByText("Schedule Delivery")).toBeInTheDocument();
    });
  });

  it("does not render schedule toggle when onScheduleChange is not provided", async () => {
    const props = createProps({ onScheduleChange: undefined });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.queryByText("Schedule Delivery")).not.toBeInTheDocument();
    });
  });

  it("shows immediate delivery text when toggle is off", async () => {
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(
        screen.getByText("Default: Immediate delivery (driver assigned right away)")
      ).toBeInTheDocument();
    });
  });

  it("calls onScheduleChange with ISO string when toggle is turned on", async () => {
    const onScheduleChange = jest.fn();
    const props = createProps({ onScheduleChange });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.getByText("Schedule Delivery")).toBeInTheDocument();
    });

    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });

    expect(onScheduleChange).toHaveBeenCalledWith(expect.any(String));
    // Should be a valid ISO string
    const isoArg = onScheduleChange.mock.calls[0][0];
    expect(new Date(isoArg).toISOString()).toBe(isoArg);
  });

  it("calls onScheduleChange with undefined when toggle is turned off", async () => {
    const onScheduleChange = jest.fn();
    const scheduleAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const props = createProps({ onScheduleChange, scheduleAt });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.getByText("Schedule Delivery")).toBeInTheDocument();
    });

    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });

    expect(onScheduleChange).toHaveBeenCalledWith(undefined);
  });

  it("shows date/time picker when schedule is enabled", async () => {
    const scheduleAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const props = createProps({ scheduleAt });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      const dateInput = document.querySelector('input[type="datetime-local"]');
      expect(dateInput).toBeInTheDocument();
    });
  });

  it("does not show date/time picker when schedule is disabled", async () => {
    const props = createProps({ scheduleAt: undefined });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.getByText("Schedule Delivery")).toBeInTheDocument();
    });

    const dateInput = document.querySelector('input[type="datetime-local"]');
    expect(dateInput).not.toBeInTheDocument();
  });

  it("shows validation error for time less than 1 hour from now", async () => {
    const scheduleAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const onScheduleChange = jest.fn();
    const props = createProps({ scheduleAt, onScheduleChange });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      const dateInput = document.querySelector('input[type="datetime-local"]');
      expect(dateInput).toBeInTheDocument();
    });

    // Set time to 10 minutes from now (less than 1 hour)
    const tooSoon = new Date(Date.now() + 10 * 60 * 1000);
    const dateInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(dateInput, {
        target: { value: formatDatetimeLocal(tooSoon) },
      });
    });

    expect(screen.getByText("Schedule must be at least 1 hour from now")).toBeInTheDocument();
    // Should NOT call onScheduleChange for invalid time
    expect(onScheduleChange).not.toHaveBeenCalled();
  });

  it("shows validation error for time more than 7 days from now", async () => {
    const scheduleAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const onScheduleChange = jest.fn();
    const props = createProps({ scheduleAt, onScheduleChange });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      const dateInput = document.querySelector('input[type="datetime-local"]');
      expect(dateInput).toBeInTheDocument();
    });

    // Set time to 8 days from now
    const tooFar = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    const dateInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(dateInput, {
        target: { value: formatDatetimeLocal(tooFar) },
      });
    });

    expect(screen.getByText("Schedule cannot be more than 7 days from now")).toBeInTheDocument();
    expect(onScheduleChange).not.toHaveBeenCalled();
  });

  it("calls onScheduleChange with ISO date for valid schedule time", async () => {
    const scheduleAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const onScheduleChange = jest.fn();
    const props = createProps({ scheduleAt, onScheduleChange });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      const dateInput = document.querySelector('input[type="datetime-local"]');
      expect(dateInput).toBeInTheDocument();
    });

    // Set time to 3 hours from now (valid)
    const validTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const dateInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(dateInput, {
        target: { value: formatDatetimeLocal(validTime) },
      });
    });

    expect(onScheduleChange).toHaveBeenCalledWith(expect.any(String));
  });

  it("displays 'Lalamove Scheduled Delivery' label when schedule is set", async () => {
    const scheduleAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const props = createProps({ scheduleAt });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.getByText("Lalamove Scheduled Delivery")).toBeInTheDocument();
    });
  });

  it("displays 'Lalamove Same-Day Delivery' when no schedule is set", async () => {
    const props = createProps({ scheduleAt: undefined });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.getByText("Lalamove Same-Day Delivery")).toBeInTheDocument();
    });
  });

  it("passes scheduleAt to the quotation API request", async () => {
    const scheduleAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    const props = createProps({ scheduleAt });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.scheduleAt).toBe(scheduleAt);
  });

  it("does NOT pass scheduleAt to API when schedule is disabled", async () => {
    const props = createProps({ scheduleAt: undefined });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.scheduleAt).toBeUndefined();
  });

  it("shows description text for schedule time range", async () => {
    const scheduleAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const props = createProps({ scheduleAt });
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(
        screen.getByText("Pick a date and time for your delivery (1 hour to 7 days from now)")
      ).toBeInTheDocument();
    });
  });

  it("shows delivery fee and distance in the quote card", async () => {
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await waitFor(() => {
      expect(screen.getByText("5.2 km")).toBeInTheDocument();
    });
  });
});

describe("LalamoveQuote - Core Quote Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ advanceTimers: true });
    mockFetch.mockResolvedValue(mockQuoteResponse());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls onQuoteReceived with quote data on successful fetch", async () => {
    const onQuoteReceived = jest.fn();
    const props = createProps({ onQuoteReceived });
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(onQuoteReceived).toHaveBeenCalledWith(
        expect.objectContaining({
          quotationId: "mock-quotation-123",
          price: 89,
          distance: "5.2 km",
        })
      );
    });
  });

  it("sends correct payload to /api/lalamove/quotation", async () => {
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/lalamove/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.pickupLat).toBe(MASH_PICKUP_LOCATION.lat);
    expect(body.pickupLng).toBe(MASH_PICKUP_LOCATION.lng);
    expect(body.dropoffLat).toBe(14.6507);
    expect(body.dropoffLng).toBe(121.0497);
    expect(body.serviceType).toBe("MOTORCYCLE");
  });

  it("displays loading state while fetching quote", async () => {
    // Make fetch hang
    mockFetch.mockImplementation(() => new Promise(() => {}));
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    expect(screen.getByText("Getting delivery quote...")).toBeInTheDocument();
    expect(screen.getByText("Calculating distance and price")).toBeInTheDocument();
  });

  it("displays Same-Day Delivery label for immediate quotes", async () => {
    const props = createProps({ scheduleAt: undefined });
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(screen.getByText("Lalamove Same-Day Delivery")).toBeInTheDocument();
    });
  });

  it("displays delivery price formatted as PHP currency", async () => {
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      // ₱89 (formatted by Intl.NumberFormat)
      expect(screen.getByText(/₱89/)).toBeInTheDocument();
    });
  });

  it("shows 'Delivery Fee' label next to the price", async () => {
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(screen.getByText("Delivery Fee")).toBeInTheDocument();
    });
  });
});

describe("LalamoveQuote - Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not fetch quote when delivery coordinates are missing", async () => {
    const onQuoteReceived = jest.fn();
    const props = createProps({
      onQuoteReceived,
      deliveryAddress: { lat: 0, lng: 0, address: "None", name: "Test", phone: "+63" },
    });
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    // The debounce guard skips fetchQuote entirely when coords are falsy
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows error when API returns non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ errors: [{ message: "Outside service area" }] }),
    });
    const onQuoteReceived = jest.fn();
    const props = createProps({ onQuoteReceived });
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(screen.getByText("Delivery quote unavailable")).toBeInTheDocument();
    });
  });

  it("shows retry button on error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  it("shows specific error for 429 rate limit", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({}),
    });
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(screen.getByText(/Too many requests/)).toBeInTheDocument();
    });
  });

  it("shows network error when fetch throws", async () => {
    mockFetch.mockRejectedValue(new TypeError("fetch failed"));
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(screen.getByText("Delivery quote unavailable")).toBeInTheDocument();
    });
  });

  it("calls onQuoteReceived(null) when quote has zero price", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          quotationId: "q-123",
          priceBreakdown: { total: "0" },
          distance: { value: "1", unit: "km" },
        },
      }),
    });
    const onQuoteReceived = jest.fn();
    const props = createProps({ onQuoteReceived });
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(onQuoteReceived).toHaveBeenCalledWith(null);
    });
  });

  it("shows error for unusually high delivery fee (over ₱1000)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          quotationId: "q-123",
          priceBreakdown: { total: "1500" },
          distance: { value: "50", unit: "km" },
        },
      }),
    });
    const props = createProps();
    render(<LalamoveQuote {...props} />);

    await act(async () => { jest.advanceTimersByTime(600); });

    await waitFor(() => {
      expect(screen.getByText(/too far/i)).toBeInTheDocument();
    });
  });
});

// Helper: format Date to datetime-local value
function formatDatetimeLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${mi}`;
}
