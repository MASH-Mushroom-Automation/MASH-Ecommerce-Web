import { render, screen, fireEvent } from "@testing-library/react";
import { DemoControlPanel } from "../DemoControlPanel";

jest.mock("lucide-react", () => {
  const Icon = (props: any) => <svg {...props} />;
  return {
    Radio: Icon,
    RadioOff: Icon,
    RefreshCw: Icon,
    X: Icon,
    ChevronUp: Icon,
    ChevronDown: Icon,
    Zap: Icon,
    Clock: Icon,
  };
});

const mockToggleRealtimeMode = jest.fn();
const mockRealtimeContext = {
  isRealtimeEnabled: false,
  toggleRealtimeMode: mockToggleRealtimeMode,
  activeSubscriptions: 3,
  lastSyncTime: new Date("2025-01-15T10:30:00"),
};

jest.mock("@/contexts/RealtimeModeContext", () => ({
  useRealtimeMode: () => mockRealtimeContext,
}));

describe("DemoControlPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRealtimeContext.isRealtimeEnabled = false;
  });

  it("should render toggle button when closed", () => {
    render(<DemoControlPanel />);
    const btn = screen.getByTitle("Open Demo Controls");
    expect(btn).toBeInTheDocument();
  });

  it("should open panel when toggle clicked", () => {
    render(<DemoControlPanel />);
    fireEvent.click(screen.getByTitle("Open Demo Controls"));
    expect(screen.getByText("Demo Controls")).toBeInTheDocument();
  });

  it("should render panel when defaultOpen is true", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("Demo Controls")).toBeInTheDocument();
  });

  it("should show OFF state when realtime disabled", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("OFF")).toBeInTheDocument();
    expect(screen.getByText("Manual refresh required")).toBeInTheDocument();
  });

  it("should show LIVE state when realtime enabled", () => {
    mockRealtimeContext.isRealtimeEnabled = true;
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    expect(screen.getByText("CMS changes appear instantly")).toBeInTheDocument();
  });

  it("should toggle realtime on button click", () => {
    render(<DemoControlPanel defaultOpen />);
    const toggleBtn = screen.getByText("OFF").closest("button");
    fireEvent.click(toggleBtn!);
    expect(mockToggleRealtimeMode).toHaveBeenCalled();
  });

  it("should display active subscriptions count", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Active Subscriptions")).toBeInTheDocument();
  });

  it("should display formatted last sync time", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("Last Sync")).toBeInTheDocument();
  });

  it("should show Never when no lastSyncTime", () => {
    mockRealtimeContext.lastSyncTime = null as any;
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("Never")).toBeInTheDocument();
  });

  it("should render Refresh Page button", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
  });

  it("should close panel when X clicked", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("Demo Controls")).toBeInTheDocument();
    // Find all buttons, X is the close button with aria or last in header
    const allButtons = screen.getAllByRole("button");
    // The close button is after the minimize button in the header
    // Find the one that closes (second small button in header)
    const closeBtn = allButtons.find(btn => {
      const svg = btn.querySelector("svg");
      return svg && btn.classList.contains("hover:bg-muted") && !btn.textContent;
    });
    // Just click the last small icon button (close button is after minimize)
    const headerBtns = allButtons.filter(b => b.closest(".border-b"));
    if (headerBtns.length >= 2) {
      fireEvent.click(headerBtns[1]);
    }
    expect(screen.queryByText("Demo Controls")).not.toBeInTheDocument();
  });

  it("should minimize panel content", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("Active Subscriptions")).toBeInTheDocument();
    // Minimize is the first small icon button in the header
    const allButtons = screen.getAllByRole("button");
    const headerBtns = allButtons.filter(b => b.closest(".border-b"));
    if (headerBtns.length >= 1) {
      fireEvent.click(headerBtns[0]);
    }
    expect(screen.queryByText("Active Subscriptions")).not.toBeInTheDocument();
  });

  it("should apply bottom-right position by default", () => {
    render(<DemoControlPanel defaultOpen />);
    const panel = screen.getByText("Demo Controls").closest("[class*='fixed']");
    expect(panel).toHaveClass("bottom-4", "right-4");
  });

  it("should apply top-left position when specified", () => {
    render(<DemoControlPanel defaultOpen position="top-left" />);
    const panel = screen.getByText("Demo Controls").closest("[class*='fixed']");
    expect(panel).toHaveClass("top-20", "left-4");
  });

  it("should render Sanity Studio link", () => {
    render(<DemoControlPanel defaultOpen />);
    expect(screen.getByText("Sanity Studio")).toBeInTheDocument();
  });
});
