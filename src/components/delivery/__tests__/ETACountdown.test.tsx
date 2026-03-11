import React from "react";
import { render, screen, act } from "@testing-library/react";
import ETACountdown from "../ETACountdown";

describe("ETACountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should show 'Calculating ETA...' when eta is null", () => {
    render(<ETACountdown eta={null} />);
    expect(screen.getByText("Calculating ETA...")).toBeInTheDocument();
  });

  it("should show estimated minutes remaining when eta is provided", () => {
    render(<ETACountdown eta={{ minutes: 15, distance: 5.3 }} />);
    expect(screen.getByText("Estimated: 15m remaining")).toBeInTheDocument();
  });

  it("should show 'Arriving soon' when minutes <= 2", () => {
    render(<ETACountdown eta={{ minutes: 2, distance: 0.5 }} />);
    expect(screen.getByText("Arriving soon")).toBeInTheDocument();
  });

  it("should show 'Arriving soon' when minutes is 1", () => {
    render(<ETACountdown eta={{ minutes: 1, distance: 0.2 }} />);
    expect(screen.getByText("Arriving soon")).toBeInTheDocument();
  });

  it("should show 'Arriving soon' when minutes is 0", () => {
    render(<ETACountdown eta={{ minutes: 0, distance: 0 }} />);
    expect(screen.getByText("Arriving soon")).toBeInTheDocument();
  });

  it("should show distance in km format", () => {
    render(<ETACountdown eta={{ minutes: 10, distance: 3.2 }} />);
    expect(screen.getByText("3.2 km away")).toBeInTheDocument();
  });

  it("should not show distance when distance is 0", () => {
    render(<ETACountdown eta={{ minutes: 10, distance: 0 }} />);
    expect(screen.queryByText(/km away/)).not.toBeInTheDocument();
  });

  it("should render clock icon when eta is null", () => {
    const { container } = render(<ETACountdown eta={null} />);
    const pulsingIcon = container.querySelector(".animate-pulse");
    expect(pulsingIcon).toBeInTheDocument();
  });

  it("should render emerald colored clock icon when eta is provided", () => {
    const { container } = render(<ETACountdown eta={{ minutes: 10, distance: 2 }} />);
    const icon = container.querySelector(".text-emerald-500");
    expect(icon).toBeInTheDocument();
  });

  it("should update remaining minutes when eta prop changes", () => {
    const { rerender } = render(<ETACountdown eta={{ minutes: 10, distance: 5 }} />);
    expect(screen.getByText("Estimated: 10m remaining")).toBeInTheDocument();

    rerender(<ETACountdown eta={{ minutes: 5, distance: 3 }} />);
    expect(screen.getByText("Estimated: 5m remaining")).toBeInTheDocument();
  });

  it("should display the distance with one decimal place", () => {
    render(<ETACountdown eta={{ minutes: 8, distance: 1.75 }} />);
    // toFixed(1) rounds to 1.8
    expect(screen.getByText("1.8 km away")).toBeInTheDocument();
  });
});
