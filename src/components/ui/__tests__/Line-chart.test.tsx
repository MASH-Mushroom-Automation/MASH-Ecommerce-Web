import React from "react";
import { render, screen } from "@testing-library/react";

// Mock recharts
jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    LineChart: ({ children, data }: any) => (
      <div data-testid="line-chart" data-items={data?.length}>
        {children}
      </div>
    ),
    Line: (props: any) => <div data-testid="line" data-datakey={props.dataKey} />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: ({ tickFormatter }: any) => {
      const formatted = tickFormatter ? tickFormatter("February") : "";
      return <div data-testid="xaxis" data-formatted={formatted} />;
    },
    Tooltip: () => <div data-testid="tooltip" />,
  };
});

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

import { LineChartDefault, description } from "../Line-chart";

const sampleData = [
  { month: "January", desktop: 500 },
  { month: "February", desktop: 750 },
  { month: "March", desktop: 600 },
];

describe("LineChartDefault", () => {
  it("should render the card with title", () => {
    render(<LineChartDefault data={sampleData} />);
    expect(screen.getByText("Revenue Trend")).toBeInTheDocument();
  });

  it("should render card description", () => {
    render(<LineChartDefault data={sampleData} />);
    expect(screen.getByText("Monthly revenue performance")).toBeInTheDocument();
  });

  it("should render the line chart", () => {
    render(<LineChartDefault data={sampleData} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("should render the footer with trend text", () => {
    render(<LineChartDefault data={sampleData} />);
    expect(screen.getByText("Revenue growth trend")).toBeInTheDocument();
  });

  it("should format XAxis ticks to 3 chars", () => {
    render(<LineChartDefault data={sampleData} />);
    expect(screen.getByTestId("xaxis")).toHaveAttribute("data-formatted", "Feb");
  });

  it("should export description constant", () => {
    expect(description).toBe("A linear line chart");
  });
});
