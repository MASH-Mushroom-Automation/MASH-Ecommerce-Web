/**
 * Tests for Lalamove Sandbox Test Page
 * LAMA-009: Renders sections, buttons, simulator controls, real-time panel
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// ─── Mock useLalamoveTracking ──────────────────────────────────
const mockUseLalamoveTracking = jest.fn();
jest.mock("@/hooks/useLalamoveTracking", () => ({
  useLalamoveTracking: (...args: unknown[]) => mockUseLalamoveTracking(...args),
}));

// ─── Mock child components ─────────────────────────────────────
jest.mock("@/components/delivery/StatusTimeline", () => {
  return function MockStatusTimeline(props: { currentStatus: string }) {
    return <div data-testid="status-timeline">Timeline: {props.currentStatus}</div>;
  };
});

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="card" {...props}>{children}</div>
  ),
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardDescription: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
  CardHeader: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <h3 {...props}>{children}</h3>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...rest
  }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean }>) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <label {...props}>{children}</label>
  ),
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: React.PropsWithChildren) => <div role="alert">{children}</div>,
  AlertDescription: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

jest.mock("lucide-react", () => ({
  Loader2: () => <span>Loader</span>,
  Truck: () => <span>Truck</span>,
  User: () => <span>UserIcon</span>,
  Phone: () => <span>PhoneIcon</span>,
  ChevronDown: () => <span>ChevronDown</span>,
  ChevronUp: () => <span>ChevronUp</span>,
  AlertTriangle: () => <span>AlertTriangle</span>,
}));

// ─── Import page component ────────────────────────────────────
import LalamoveTestPage from "../page";

// ─── Setup ─────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLalamoveTracking.mockReturnValue({
    tracking: null,
    order: null,
    loading: false,
    error: null,
  });
  (global.fetch as jest.Mock) = jest.fn();
});

// ─── Tests ─────────────────────────────────────────────────────

describe("LalamoveTestPage", () => {
  it("renders sandbox mode banner", () => {
    render(<LalamoveTestPage />);
    expect(screen.getByText(/\[SANDBOX MODE\]/i)).toBeInTheDocument();
  });

  it("renders page title", () => {
    render(<LalamoveTestPage />);
    expect(screen.getByText("Lalamove Interactive Demo")).toBeInTheDocument();
  });

  it("renders Get Quotation button", () => {
    render(<LalamoveTestPage />);
    expect(screen.getByText("Get Quotation")).toBeInTheDocument();
  });

  it("renders Place Order button disabled initially", () => {
    render(<LalamoveTestPage />);
    const placeBtn = screen.getByText("Place Order");
    expect(placeBtn.closest("button")).toBeDisabled();
  });

  it("renders simulator buttons disabled before order", () => {
    render(<LalamoveTestPage />);
    const assigningBtn = screen.getByText("Assigning");
    expect(assigningBtn.closest("button")).toBeDisabled();
  });

  it("renders all 5 simulator event buttons", () => {
    render(<LalamoveTestPage />);
    expect(screen.getByText("Assigning")).toBeInTheDocument();
    expect(screen.getByText("Driver Assigned")).toBeInTheDocument();
    expect(screen.getByText("Picked Up")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Canceled")).toBeInTheDocument();
  });

  it("shows quotation result after successful fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          quotationId: "q-123",
          price: "150",
          distance: { value: 5000 },
          stops: [{ stopId: "s1" }, { stopId: "s2" }],
        },
      }),
    });

    render(<LalamoveTestPage />);

    await act(async () => {
      fireEvent.click(screen.getByText("Get Quotation"));
    });

    await waitFor(() => {
      expect(screen.getByText("[PASS] Quotation received")).toBeInTheDocument();
      expect(screen.getByText(/q-123/)).toBeInTheDocument();
    });
  });

  it("shows error when quotation fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        message: "Service unavailable",
      }),
    });

    render(<LalamoveTestPage />);

    await act(async () => {
      fireEvent.click(screen.getByText("Get Quotation"));
    });

    await waitFor(() => {
      expect(screen.getByText("Service unavailable")).toBeInTheDocument();
    });
  });

  it("shows tracking data after order is placed", async () => {
    // Step 1: quotation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: {
          quotationId: "q-100",
          price: "50",
          distance: { value: 1000 },
          stops: [{ stopId: "s1" }, { stopId: "s2" }],
        },
      }),
    });

    // Step 2: order — sets internalOrderId
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: { orderId: "lala-order-1", status: "ASSIGNING_DRIVER" },
      }),
    });

    // After order, the hook should return tracking data
    mockUseLalamoveTracking.mockReturnValue({
      tracking: {
        status: "ON_GOING",
        driver: {
          name: "Juan Santos",
          plateNumber: "XYZ 999",
          phone: "+639170000000",
          coordinates: { lat: 14.55, lng: 120.99 },
        },
        lastUpdated: new Date().toISOString(),
      },
      order: null,
      loading: false,
      error: null,
    });

    render(<LalamoveTestPage />);

    // Get quotation
    await act(async () => {
      fireEvent.click(screen.getByText("Get Quotation"));
    });
    await waitFor(() => {
      expect(screen.getByText("[PASS] Quotation received")).toBeInTheDocument();
    });

    // Place order
    await act(async () => {
      fireEvent.click(screen.getByText("Place Order"));
    });
    await waitFor(() => {
      expect(screen.getByText("[PASS] Order placed")).toBeInTheDocument();
    });

    // Now tracking data should be visible
    expect(screen.getByText("ON_GOING")).toBeInTheDocument();
    expect(screen.getByText("Juan Santos")).toBeInTheDocument();
  });

  it("renders Raw API / Firestore Data section", () => {
    render(<LalamoveTestPage />);
    expect(screen.getByText("Raw API / Firestore Data")).toBeInTheDocument();
  });
});
