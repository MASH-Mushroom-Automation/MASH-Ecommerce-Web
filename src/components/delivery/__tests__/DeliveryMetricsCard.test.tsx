import { render, screen } from "@testing-library/react";
import { Package, Truck, Clock } from "lucide-react";
import DeliveryMetricsCard from "../DeliveryMetricsCard";

describe("DeliveryMetricsCard", () => {
  it("should render label and value", () => {
    render(
      <DeliveryMetricsCard icon={Package} label="Total Deliveries" value={42} />
    );
    expect(screen.getByText("Total Deliveries")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should render icon in emerald container", () => {
    const { container } = render(
      <DeliveryMetricsCard icon={Package} label="Test" value={0} />
    );
    const iconContainer = container.querySelector(".bg-emerald-50");
    expect(iconContainer).toBeInTheDocument();
  });

  it("should render string value", () => {
    render(
      <DeliveryMetricsCard icon={Truck} label="Rate" value="85%" />
    );
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("should render trend up with green color", () => {
    render(
      <DeliveryMetricsCard
        icon={Package}
        label="Deliveries"
        value={100}
        trend={{ direction: "up", label: "+12% this week" }}
      />
    );
    expect(screen.getByText("+12% this week")).toBeInTheDocument();
    expect(screen.getByLabelText("Trend up")).toBeInTheDocument();
    const trendContainer = screen.getByText("+12% this week").parentElement;
    expect(trendContainer).toHaveClass("text-green-600");
  });

  it("should render trend down with red color", () => {
    render(
      <DeliveryMetricsCard
        icon={Clock}
        label="Avg Time"
        value="45 min"
        trend={{ direction: "down", label: "-5% this week" }}
      />
    );
    expect(screen.getByText("-5% this week")).toBeInTheDocument();
    expect(screen.getByLabelText("Trend down")).toBeInTheDocument();
    const trendContainer = screen.getByText("-5% this week").parentElement;
    expect(trendContainer).toHaveClass("text-red-600");
  });

  it("should render no trend section when not provided", () => {
    const { container } = render(
      <DeliveryMetricsCard icon={Package} label="Count" value={10} />
    );
    expect(screen.queryByLabelText("Trend up")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Trend down")).not.toBeInTheDocument();
    // No mt-3 flex section for trend
    expect(container.querySelector(".mt-3")).not.toBeInTheDocument();
  });

  it("should render loading skeleton state", () => {
    render(
      <DeliveryMetricsCard
        icon={Package}
        label="Deliveries"
        value={0}
        loading
      />
    );
    expect(screen.getByTestId("metrics-card-skeleton")).toBeInTheDocument();
    // Label and value should NOT render during loading
    expect(screen.queryByText("Deliveries")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <DeliveryMetricsCard
        icon={Package}
        label="Test"
        value={0}
        className="custom-metrics"
      />
    );
    expect(container.firstChild).toHaveClass("custom-metrics");
  });

  it("should apply custom className to skeleton too", () => {
    const { container } = render(
      <DeliveryMetricsCard
        icon={Package}
        label="Test"
        value={0}
        loading
        className="skeleton-custom"
      />
    );
    expect(container.firstChild).toHaveClass("skeleton-custom");
  });
});
