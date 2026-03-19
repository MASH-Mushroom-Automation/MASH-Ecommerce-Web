import { fireEvent, render, screen } from "@testing-library/react";
import DeliveryScheduleBanner from "../DeliveryScheduleBanner";

describe("DeliveryScheduleBanner", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-03-19T10:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render scheduled time", () => {
    render(<DeliveryScheduleBanner scheduledAt="2026-03-19T12:00:00Z" />);
    expect(screen.getByText(/Scheduled for/i)).toBeInTheDocument();
  });

  it("should show countdown for upcoming delivery", () => {
    render(<DeliveryScheduleBanner scheduledAt="2026-03-19T11:00:00Z" />);
    expect(screen.getByText(/to pickup/i)).toBeInTheDocument();
  });

  it("should show Overdue for past schedule", () => {
    render(<DeliveryScheduleBanner scheduledAt="2026-03-19T09:00:00Z" />);
    expect(screen.getAllByText(/Overdue/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pickup is overdue/i)).toBeInTheDocument();
  });

  it("should call reschedule callback", () => {
    const onReschedule = jest.fn();
    render(
      <DeliveryScheduleBanner
        scheduledAt="2026-03-19T11:00:00Z"
        onReschedule={onReschedule}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Reschedule/i }));
    expect(onReschedule).toHaveBeenCalledTimes(1);
  });

  it("should hide reschedule when callback not provided", () => {
    render(<DeliveryScheduleBanner scheduledAt="2026-03-19T11:00:00Z" />);
    expect(screen.queryByRole("button", { name: /Reschedule/i })).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryScheduleBanner
        scheduledAt="2026-03-19T11:00:00Z"
        className="custom-schedule"
      />
    );
    expect(container.firstChild).toHaveClass("custom-schedule");
  });
});
