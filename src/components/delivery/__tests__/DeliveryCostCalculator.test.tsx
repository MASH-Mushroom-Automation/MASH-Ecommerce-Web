import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeliveryCostCalculator from "../DeliveryCostCalculator";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockQuoteResponse = {
  quotationId: "mock-quote-123",
  priceBreakdown: {
    total: "150.00",
    currency: "PHP",
    base: "49.00",
    totalExcludePriorityFee: "140.00",
  },
  distance: { value: "5.2", unit: "km" },
};

describe("DeliveryCostCalculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockQuoteResponse,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render with title 'Delivery Cost Calculator'", () => {
    render(<DeliveryCostCalculator />);
    expect(screen.getByText("Delivery Cost Calculator")).toBeInTheDocument();
  });

  it("should render pickup and delivery address inputs", () => {
    render(<DeliveryCostCalculator />);
    expect(screen.getByPlaceholderText("Pickup address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Delivery address")).toBeInTheDocument();
  });

  it("should render latitude and longitude inputs", () => {
    render(<DeliveryCostCalculator />);
    const latInputs = screen.getAllByPlaceholderText("Latitude");
    const lngInputs = screen.getAllByPlaceholderText("Longitude");
    expect(latInputs).toHaveLength(2); // pickup + dropoff
    expect(lngInputs).toHaveLength(2);
  });

  it("should render Get Delivery Quote button", () => {
    render(<DeliveryCostCalculator />);
    expect(screen.getByText("Get Delivery Quote")).toBeInTheDocument();
  });

  it("should call fetch when Get Quote button is clicked", async () => {
    render(<DeliveryCostCalculator />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/lalamove/quotation",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should display quote result on successful API response", async () => {
    render(<DeliveryCostCalculator />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    await waitFor(() => {
      expect(screen.getByText("Total Delivery Cost")).toBeInTheDocument();
    });

    // Price should be displayed
    expect(screen.getByText(/150\.00/)).toBeInTheDocument();
  });

  it("should display error message on API failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Service unavailable" }),
    });

    render(<DeliveryCostCalculator />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    await waitFor(() => {
      expect(screen.getByText("Service unavailable")).toBeInTheDocument();
    });
  });

  it("should show Retry button on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Network error" }),
    });

    render(<DeliveryCostCalculator />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  it("should re-call API when Retry button is clicked", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "First failure" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuoteResponse,
      });

    render(<DeliveryCostCalculator />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    await waitFor(() => {
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it("should call onQuoteReceived callback with quote data", async () => {
    const onQuoteReceived = jest.fn();
    render(<DeliveryCostCalculator onQuoteReceived={onQuoteReceived} />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    await waitFor(() => {
      expect(onQuoteReceived).toHaveBeenCalledWith(
        expect.objectContaining({
          quotationId: "mock-quote-123",
          total: "150.00",
          currency: "PHP",
        })
      );
    });
  });

  it("should use default pickup and dropoff when provided", () => {
    render(
      <DeliveryCostCalculator
        defaultPickup={{ lat: "10.0", lng: "120.0", address: "Test Pickup" }}
        defaultDropoff={{ lat: "11.0", lng: "121.0", address: "Test Dropoff" }}
      />
    );
    expect(screen.getByDisplayValue("Test Pickup")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Dropoff")).toBeInTheDocument();
  });

  it("should show loading state while fetching", async () => {
    // Make fetch hang
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    );

    render(<DeliveryCostCalculator />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    // Should show loading text
    expect(screen.getByText("Getting Quote...")).toBeInTheDocument();
  });

  it("should display base fare and distance in quote result", async () => {
    render(<DeliveryCostCalculator />);
    fireEvent.click(screen.getByText("Get Delivery Quote"));

    await waitFor(() => {
      expect(screen.getByText("Total Delivery Cost")).toBeInTheDocument();
    });

    expect(screen.getByText(/49\.00/)).toBeInTheDocument(); // base fare
    expect(screen.getByText(/5\.2/)).toBeInTheDocument(); // distance
  });
});
