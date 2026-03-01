import { render, screen } from "@testing-library/react";
import {
  AdminStatsWidget,
  WeeklySalesMiniChart,
  PendingOrdersBadge,
} from "../dashboard-widgets";

const mockData = {
  alert: { pendingOrders: 5, message: "5 orders need attention" },
  metrics: {
    orders: { value: 120, change: 12, changeLabel: "vs last week" },
    revenue: { value: 45000, change: -3, changeLabel: "vs last week", currency: "PHP" },
  },
  charts: {
    weeklySales: [
      { date: "2024-01-01", day: "Mon", sales: 10 },
      { date: "2024-01-02", day: "Tue", sales: 20 },
      { date: "2024-01-03", day: "Wed", sales: 15 },
    ],
  },
};

const mockHook = jest.fn();
jest.mock("@/hooks/useAdminDashboard", () => ({
  useAdminDashboard: () => mockHook(),
}));

jest.mock("@/components/ui/loading-spinner", () => ({
  LoadingSpinner: ({ size }: any) => <div data-testid="spinner">{size}</div>,
}));

jest.mock("lucide-react", () => ({
  AlertCircle: (props: any) => <svg data-testid="alert-icon" {...props} />,
  ShoppingBag: (props: any) => <svg data-testid="bag-icon" {...props} />,
  TrendingUp: (props: any) => <svg data-testid="trend-icon" {...props} />,
}));

describe("AdminStatsWidget", () => {
  it("should show loading spinner when loading", () => {
    mockHook.mockReturnValue({ isLoading: true, data: null, isError: false });
    render(<AdminStatsWidget />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should show error state on error", () => {
    mockHook.mockReturnValue({ isLoading: false, data: null, isError: true });
    render(<AdminStatsWidget />);
    expect(screen.getByText("Failed to load stats")).toBeInTheDocument();
  });

  it("should render stats cards with data", () => {
    mockHook.mockReturnValue({ isLoading: false, data: mockData, isError: false });
    render(<AdminStatsWidget />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText(/45,000/)).toBeInTheDocument();
    expect(screen.getByText("+12% vs last week")).toBeInTheDocument();
    expect(screen.getByText("-3% vs last week")).toBeInTheDocument();
  });
});

describe("WeeklySalesMiniChart", () => {
  it("should show spinner when loading", () => {
    mockHook.mockReturnValue({ isLoading: true, data: null });
    render(<WeeklySalesMiniChart />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("should render bars for each day", () => {
    mockHook.mockReturnValue({ isLoading: false, data: mockData });
    render(<WeeklySalesMiniChart />);
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("Wed")).toBeInTheDocument();
  });
});

describe("PendingOrdersBadge", () => {
  it("should return null when loading", () => {
    mockHook.mockReturnValue({ isLoading: true, data: null });
    const { container } = render(<PendingOrdersBadge />);
    expect(container.innerHTML).toBe("");
  });

  it("should return null when no pending orders", () => {
    mockHook.mockReturnValue({
      isLoading: false,
      data: { ...mockData, alert: { pendingOrders: 0, message: "" } },
    });
    const { container } = render(<PendingOrdersBadge />);
    expect(container.innerHTML).toBe("");
  });

  it("should show badge count when pending orders exist", () => {
    mockHook.mockReturnValue({ isLoading: false, data: mockData });
    render(<PendingOrdersBadge />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
