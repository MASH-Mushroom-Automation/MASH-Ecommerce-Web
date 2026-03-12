import { render, screen } from "@testing-library/react";
import DeliveryHistoryTimeline from "../DeliveryHistoryTimeline";

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Package: ({ className }: { className?: string }) => (
    <span data-testid="package-icon" className={className} />
  ),
  Truck: ({ className }: { className?: string }) => (
    <span data-testid="truck-icon" className={className} />
  ),
  MapPin: ({ className }: { className?: string }) => (
    <span data-testid="mappin-icon" className={className} />
  ),
  CheckCircle2: ({ className }: { className?: string }) => (
    <span data-testid="check-icon" className={className} />
  ),
  XCircle: ({ className }: { className?: string }) => (
    <span data-testid="xcircle-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <span data-testid="clock-icon" className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <span data-testid="alert-icon" className={className} />
  ),
}));

describe("DeliveryHistoryTimeline", () => {
  const sampleEntries = [
    {
      status: "ASSIGNING_DRIVER",
      timestamp: "2024-01-15T10:00:00Z",
    },
    {
      status: "DRIVER_ASSIGNED",
      timestamp: "2024-01-15T10:05:00Z",
      note: "Driver Juan assigned",
    },
    {
      status: "PICKED_UP",
      timestamp: "2024-01-15T10:20:00Z",
    },
    {
      status: "COMPLETED",
      timestamp: "2024-01-15T10:45:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show empty state when no entries", () => {
    render(<DeliveryHistoryTimeline entries={[]} />);
    expect(screen.getByText("No delivery events yet")).toBeInTheDocument();
    expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
  });

  it("should show empty state when entries is null-ish", () => {
    render(<DeliveryHistoryTimeline entries={undefined as unknown as []} />);
    expect(screen.getByText("No delivery events yet")).toBeInTheDocument();
  });

  it("should render all timeline entries", () => {
    render(<DeliveryHistoryTimeline entries={sampleEntries} />);
    expect(screen.getByText("ASSIGNING DRIVER")).toBeInTheDocument();
    expect(screen.getByText("DRIVER ASSIGNED")).toBeInTheDocument();
    expect(screen.getByText("PICKED UP")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("should show formatted timestamps", () => {
    render(
      <DeliveryHistoryTimeline
        entries={[
          {
            status: "ASSIGNING_DRIVER",
            timestamp: "2024-01-15T10:00:00Z",
          },
        ]}
      />
    );
    // We check the time element exists (exact format depends on locale)
    const timeElements = document.querySelectorAll("time");
    expect(timeElements).toHaveLength(1);
    expect(timeElements[0].textContent).toBeTruthy();
  });

  it("should show custom note when provided", () => {
    render(
      <DeliveryHistoryTimeline
        entries={[
          {
            status: "DRIVER_ASSIGNED",
            timestamp: "2024-01-15T10:05:00Z",
            note: "Driver Juan assigned",
          },
        ]}
      />
    );
    expect(screen.getByText("Driver Juan assigned")).toBeInTheDocument();
  });

  it("should show default description when no note", () => {
    render(
      <DeliveryHistoryTimeline
        entries={[
          {
            status: "COMPLETED",
            timestamp: "2024-01-15T10:45:00Z",
          },
        ]}
      />
    );
    expect(
      screen.getByText("Delivery completed successfully")
    ).toBeInTheDocument();
  });

  it("should render entries in chronological order by default", () => {
    render(<DeliveryHistoryTimeline entries={sampleEntries} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    // First item should be ASSIGNING_DRIVER
    expect(items[0]).toHaveTextContent("ASSIGNING DRIVER");
    // Last item should be COMPLETED
    expect(items[3]).toHaveTextContent("COMPLETED");
  });

  it("should render newest first when newestFirst=true", () => {
    render(
      <DeliveryHistoryTimeline entries={sampleEntries} newestFirst={true} />
    );
    const items = screen.getAllByRole("listitem");
    // First should be the last entry (COMPLETED reversed)
    expect(items[0]).toHaveTextContent("COMPLETED");
    // Last should be the first entry (ASSIGNING_DRIVER reversed)
    expect(items[3]).toHaveTextContent("ASSIGNING DRIVER");
  });

  it("should apply green colors for COMPLETED status", () => {
    const { container } = render(
      <DeliveryHistoryTimeline
        entries={[
          { status: "COMPLETED", timestamp: "2024-01-15T10:45:00Z" },
        ]}
      />
    );
    const iconContainer = container.querySelector(".bg-green-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should apply red colors for CANCELED status", () => {
    const { container } = render(
      <DeliveryHistoryTimeline
        entries={[
          { status: "CANCELED", timestamp: "2024-01-15T10:45:00Z" },
        ]}
      />
    );
    const iconContainer = container.querySelector(".bg-red-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should apply emerald colors for active statuses", () => {
    const { container } = render(
      <DeliveryHistoryTimeline
        entries={[
          { status: "ON_GOING", timestamp: "2024-01-15T10:15:00Z" },
        ]}
      />
    );
    const iconContainer = container.querySelector(".bg-emerald-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryHistoryTimeline entries={sampleEntries} className="mt-4" />
    );
    expect(container.firstChild).toHaveClass("mt-4");
  });
});
