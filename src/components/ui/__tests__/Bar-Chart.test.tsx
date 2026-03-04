import React from "react";
import { render, screen } from "@testing-library/react";

// Mock recharts
jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children, data }: any) => (
      <div data-testid="bar-chart" data-items={data?.length}>
        {children}
      </div>
    ),
    Bar: (props: any) => <div data-testid="bar" data-datakey={props.dataKey} />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: ({ tickFormatter }: any) => {
      // Exercise the tickFormatter branch
      const formatted = tickFormatter ? tickFormatter("January") : "";
      return <div data-testid="xaxis" data-formatted={formatted} />;
    },
    Tooltip: () => <div data-testid="tooltip" />,
  };
});

// Mock chart components
jest.mock("@/components/ui/chart", () => {
  const React = require("react");
  return {
    ChartContainer: ({ children, config }: any) => (
      <div data-testid="chart-container">{children}</div>
    ),
    ChartTooltip: () => <div data-testid="chart-tooltip" />,
    ChartTooltipContent: (props: any) => <div data-testid="chart-tooltip-content" />,
  };
});

import { ChartBarDefault, description } from "../Bar-Chart";

const sampleData = [
  { month: "January", desktop: 100 },
  { month: "February", desktop: 200 },
  { month: "March", desktop: 150 },
];

describe("ChartBarDefault", () => {
  it("should render the card with title", () => {
    render(<ChartBarDefault data={sampleData} />);
    expect(screen.getByText("Weekly Sales")).toBeInTheDocument();
  });

  it("should render card description", () => {
    render(<ChartBarDefault data={sampleData} />);
    expect(screen.getByText("Sales performance for the past week")).toBeInTheDocument();
  });

  it("should render the bar chart with data", () => {
    render(<ChartBarDefault data={sampleData} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should render the footer with trend text", () => {
    render(<ChartBarDefault data={sampleData} />);
    expect(screen.getByText("Sales growth trend")).toBeInTheDocument();
  });

  it("should format XAxis ticks to 3 chars", () => {
    render(<ChartBarDefault data={sampleData} />);
    expect(screen.getByTestId("xaxis")).toHaveAttribute("data-formatted", "Jan");
  });

  it("should export description constant", () => {
    expect(description).toBe("A bar chart");
  });
});
